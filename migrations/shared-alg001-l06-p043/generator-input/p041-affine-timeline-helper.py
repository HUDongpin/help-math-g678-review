#!/usr/bin/env python3
"""Source-only P041 native text, quiz and feedback clip projection.

P038/P035 page-local affine and placement ideas are adapted here because P041
has nested feedback, read-only dynamic text and PlaceObject2 replacements.
Only this packet is writable. No Canvas or browser coordinates are inferred.
"""
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
LESSON = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
SWF = LESSON / 'IN/L6IN13.swf'
INDEX = LESSON / 'index.xml'
TRIAGE = ROOT / 'output/alg-l06-p041-source-triage-20261001-v1'
FACTS = TRIAGE / 'source-facts-v1.json'
XML = TRIAGE / 'swfmill.xml'
SCRIPTS = TRIAGE / 'ffdec-script/scripts'
MODEL = HERE / 'native-model-v1.json'
CLIP = HERE / 'clip-plan-v1.json'
EXPECTED = {
    'swf': (370796, 'bb10cab8e835f2c3267e0add3774dc47fa38863fe12dab67f3199e4c0efadd85'),
    'index': (13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    'facts': (41714, '5512f5f65a9fd2eb3da8b22cb145c8fbf642e598eb257bc8db023dae2b14567d'),
    'xml': (2260259, 'a7c77470a326c9d1cfd4d4de5bf89dfe9b5c0ca526c23b7f74065530ed5f52b0'),
}
FEEDBACK = (
    {'spriteId': 76, 'name': 'Mc_Wrong_Feed1', 'holdFrame': 23,
     'popupSpriteId': 75, 'popupFirstFrame': 17, 'closeButtonId': 72,
     'editTextId': 74, 'resumeFrame': 24},
    {'spriteId': 91, 'name': 'Mc_Wrong_Feed3', 'holdFrame': 21,
     'popupSpriteId': 87, 'popupFirstFrame': 14, 'closeButtonId': 85,
     'editTextId': 86, 'resumeFrame': 22},
    {'spriteId': 105, 'name': 'Mc_Wrong_Feed2', 'holdFrame': 20,
     'popupSpriteId': 102, 'popupFirstFrame': 13, 'closeButtonId': 100,
     'editTextId': 101, 'resumeFrame': 21},
)
QUIZ_TEXT_IDS = {32, 33, 35, 36, 38, 39, 41, 42}


def digest(data):
    return sha256(data).hexdigest()


def encode(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()


def pin(path, expected=None):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    raw = path.read_bytes()
    after = path.lstat()
    keys = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_mode', 'st_nlink')
    assert tuple(getattr(before, k) for k in keys) == tuple(getattr(after, k) for k in keys), path
    result = {'path': str(path), 'bytes': len(raw), 'sha256': digest(raw)}
    if expected is not None:
        assert (len(raw), result['sha256']) == expected, path
    return raw, result


def matrix(node=None):
    value = node.attrib if node is not None else {}
    return {key: float(value.get(key, default)) for key, default in (
        ('scaleX', 1), ('scaleY', 1), ('skewX', 0), ('skewY', 0),
        ('transX', 0), ('transY', 0))}


def rect(node):
    assert node is not None
    return {key: int(node.get(key)) for key in ('left', 'right', 'top', 'bottom')}


def color(node=None):
    value = node.attrib if node is not None else {}
    return {'factor': {key: int(value.get('factor' + key, 256)) for key in
                       ('Red', 'Green', 'Blue', 'Alpha')},
            'offset': {key: int(value.get('offset' + key, 0)) for key in
                       ('Red', 'Green', 'Blue', 'Alpha')}}


def compose(outer, inner):
    # Affines are SWF twip transforms. Compose before converting to pixels.
    return {
        'scaleX': outer['scaleX'] * inner['scaleX'] + outer['skewX'] * inner['skewY'],
        'skewX': outer['scaleX'] * inner['skewX'] + outer['skewX'] * inner['scaleY'],
        'transX': outer['scaleX'] * inner['transX'] + outer['skewX'] * inner['transY'] + outer['transX'],
        'skewY': outer['skewY'] * inner['scaleX'] + outer['scaleY'] * inner['skewY'],
        'scaleY': outer['skewY'] * inner['skewX'] + outer['scaleY'] * inner['scaleY'],
        'transY': outer['skewY'] * inner['transX'] + outer['scaleY'] * inner['transY'] + outer['transY'],
    }


def point(transform, x, y):
    return (transform['scaleX'] * x + transform['skewX'] * y + transform['transX'],
            transform['skewY'] * x + transform['scaleY'] * y + transform['transY'])


def box(bounds, transform):
    corners = [point(transform, x, y)
               for x in (bounds['left'], bounds['right'])
               for y in (bounds['top'], bounds['bottom'])]
    return [round(min(x for x, _ in corners) / 20, 4),
            round(min(y for _, y in corners) / 20, 4),
            round(max(x for x, _ in corners) / 20, 4),
            round(max(y for _, y in corners) / 20, 4)]


def union_boxes(values):
    assert values
    return [min(x[0] for x in values), min(x[1] for x in values),
            max(x[2] for x in values), max(x[3] for x in values)]


def overlap_of_text(text_box, hit_box):
    width = max(0, min(text_box[2], hit_box[2]) - max(text_box[0], hit_box[0]))
    height = max(0, min(text_box[3], hit_box[3]) - max(text_box[1], hit_box[1]))
    area = max(1e-9, (text_box[2] - text_box[0]) * (text_box[3] - text_box[1]))
    return round(width * height / area, 6)


def definitions(xml):
    fonts = {}
    for item in xml.iter('DefineFont2'):
        object_id = int(item.get('objectID'))
        glyph_map = [chr(int(g.get('map'))) for g in item.findall('glyphs/Glyph')]
        fonts[object_id] = {'name': item.get('name'), 'glyphMap': glyph_map}
    assert len(fonts) == 7
    texts = {}
    for item in xml.iter('DefineText'):
        object_id = int(item.get('objectID'))
        current_font, x, y, height = None, 0, 0, 0
        records = []
        for record in item.iter('TextRecord6'):
            if record.get('objectID') is not None:
                current_font = int(record.get('objectID'))
            x = int(record.get('x', x))
            y = int(record.get('y', y))
            height = int(record.get('fontHeight', height))
            assert current_font in fonts
            cursor = x
            glyphs = []
            for entry in record.findall('glyphs/TextEntry'):
                glyph_index = int(entry.get('glyph'))
                glyph = fonts[current_font]['glyphMap'][glyph_index]
                advance = int(entry.get('advance'))
                glyphs.append({'fontId': current_font, 'glyphIndex': glyph_index,
                               'unicode': glyph, 'xTwips': cursor,
                               'advanceTwips': advance})
                cursor += advance
            paint = record.find('color/Color')
            records.append({'sourceAttributes': dict(record.attrib),
                            'fontId': current_font, 'fontHeightTwips': height,
                            'baselineTwips': {'x': x, 'y': y},
                            'color': dict(paint.attrib) if paint is not None else None,
                            'glyphs': glyphs})
            x = cursor
        value = ''.join(g['unicode'] for record in records for g in record['glyphs'])
        texts[object_id] = {'objectId': object_id, 'text': value,
                            'boundsTwips': rect(item.find('bounds/Rectangle')),
                            'textMatrixTwips': matrix(item.find('transform/Transform')),
                            'textMatrixSourceAttributes': dict(item.find('transform/Transform').attrib),
                            'records': records}
    assert len(texts) == 35
    edits = {}
    for item in xml.iter('DefineEditText'):
        object_id = int(item.get('objectID'))
        edits[object_id] = {'objectId': object_id, 'sourceAttributes': dict(item.attrib),
                            'boundsTwips': rect(item.find('size/Rectangle')),
                            'color': dict(item.find('color/Color').attrib),
                            'authoredLiteral': item.findtext('text') or '',
                            'runtimeTextIsStatic': False}
    assert set(edits) == {74, 86, 101}
    assert all(x['sourceAttributes']['readOnly'] == '1' and
               x['sourceAttributes']['notSelectable'] == '1' and
               x['authoredLiteral'] == '' for x in edits.values())
    shapes = {}
    for item in xml.iter():
        if item.tag.startswith('DefineShape') and item.get('objectID') is not None:
            shapes[int(item.get('objectID'))] = {
                'tag': item.tag, 'boundsTwips': rect(item.find('bounds/Rectangle'))}
    buttons = {}
    for item in xml.iter('DefineButton2'):
        object_id = int(item.get('objectID'))
        records = []
        for record in item.findall('buttons/Button'):
            if record.get('objectID') is None:
                continue
            records.append({'sourceAttributes': dict(record.attrib),
                            'objectId': int(record.get('objectID')),
                            'depth': int(record.get('depth')),
                            'hitTest': record.get('hitTest') == '1',
                            'matrixTwips': matrix(record.find('transform/Transform')),
                            'matrixSourceAttributes': dict(record.find('transform/Transform').attrib),
                            'color': color(record.find('colorTransform/ColorTransform2'))})
        cond = item.find('conditions/Condition')
        assert cond is not None and cond.get('pointerReleaseInside') == '1'
        buttons[object_id] = {'objectId': object_id,
                              'sourceAttributes': dict(item.attrib),
                              'sourceConditionAttributes': dict(cond.attrib),
                              'records': records,
                              'hitRecords': [r for r in records if r['hitTest']]}
    assert set(buttons) == {44, 45, 72, 85, 100}
    assert [r['objectId'] for r in buttons[44]['hitRecords']] == [43]
    assert [r['objectId'] for r in buttons[72]['hitRecords']] == [63, 71]
    return fonts, texts, edits, shapes, buttons


def source_scripts(facts):
    frozen = {(ROOT / s['path']).relative_to(SCRIPTS): s for s in
              facts['publicToolEvidence']['ffdecScripts']}
    assert len(frozen) == 38
    for relative, info in frozen.items():
        _, current = pin(SCRIPTS / relative)
        assert (current['bytes'], current['sha256']) == (info['bytes'], info['sha256'])
    with tempfile.TemporaryDirectory(prefix='ffdec-native-check-', dir=HERE) as temporary:
        process = subprocess.run(['ffdec', '-export', 'script', temporary, str(SWF)],
                                 capture_output=True, text=True)
        assert process.returncode == 0, process.stderr[:1000]
        fresh = Path(temporary) / 'scripts'
        found = {p.relative_to(fresh): p for p in fresh.rglob('*.as')}
        assert set(found) == set(frozen)
        for relative, path in found.items():
            raw = path.read_bytes()
            assert (len(raw), digest(raw)) == (
                frozen[relative]['bytes'], frozen[relative]['sha256'])
    return {str(k): v for k, v in sorted(frozen.items(), key=lambda pair: str(pair[0]))}


def timeline(sprite, selected_ids):
    sprite_id = int(sprite.get('objectID'))
    frame_count = int(sprite.get('frames'))
    active, generations, snapshots, selected_frames, events = {}, {}, [], [], []
    counts = Counter()
    frame = 1
    for tag in sprite.find('tags'):
        if tag.tag == 'PlaceObject2':
            depth = int(tag.get('depth'))
            object_id = int(tag.get('objectID')) if tag.get('objectID') is not None else None
            replacing = tag.get('replace') == '1'
            original = active.get(depth)
            if object_id is not None:
                assert (original is not None) == replacing, (sprite_id, frame, depth)
                generations[depth] = generations.get(depth, 0) + 1
                state = dict(original) if original is not None else {
                    'matrixTwips': matrix(), 'color': color(), 'ratio': None,
                    'name': None, 'clipDepth': None}
                state.update({'objectId': object_id, 'generation': generations[depth]})
            else:
                assert replacing and original is not None, (sprite_id, frame, depth)
                state = dict(original)
            transform = tag.find('transform/Transform')
            paint = tag.find('colorTransform/ColorTransform2')
            if transform is not None:
                state['matrixTwips'] = matrix(transform)
            if paint is not None:
                state['color'] = color(paint)
            if tag.get('morph') is not None:
                state['ratio'] = int(tag.get('morph'))
            if tag.get('name') is not None:
                state['name'] = tag.get('name')
            if tag.get('clipDepth') is not None:
                state['clipDepth'] = int(tag.get('clipDepth'))
            active[depth] = state
            events.append({'frame': frame, 'kind': 'place',
                           'depth': depth, 'replace': replacing,
                           'objectId': object_id, 'sourceAttributes': dict(tag.attrib),
                           'matrixTwips': matrix(transform) if transform is not None else None,
                           'matrixSourceAttributes': dict(transform.attrib) if transform is not None else None,
                           'colorSourceAttributes': dict(paint.attrib) if paint is not None else None,
                           'color': color(paint) if paint is not None else None})
            counts['PlaceObject2'] += 1
        elif tag.tag == 'RemoveObject2':
            depth = int(tag.get('depth'))
            assert depth in active, (sprite_id, frame, depth)
            del active[depth]
            events.append({'frame': frame, 'kind': 'remove', 'depth': depth,
                           'sourceAttributes': dict(tag.attrib)})
            counts['RemoveObject2'] += 1
        elif tag.tag == 'ShowFrame':
            snapshots.append({depth: dict(state) for depth, state in sorted(active.items())})
            selected_frames.append([{'depth': depth, **dict(state)}
                                    for depth, state in sorted(active.items())
                                    if state['objectId'] in selected_ids])
            counts['ShowFrame'] += 1
            frame += 1
        elif tag.tag in ('DoAction', 'SoundStreamHead', 'SoundStreamBlock', 'End'):
            counts[tag.tag] += 1
        else:
            raise AssertionError(f'unreviewed sprite tag {sprite_id}: {tag.tag}')
    assert frame == frame_count + 1 and len(snapshots) == frame_count
    return {'spriteId': sprite_id, 'frameCount': frame_count,
            'snapshots': snapshots, 'selectedFrames': selected_frames,
            'events': events, 'tagCounts': dict(counts)}


def compress_selected(domain):
    instances = {}
    fields = ('matrixTwips', 'color', 'ratio', 'name', 'clipDepth')
    for frame, rows in enumerate(domain['selectedFrames'], 1):
        for row in rows:
            instance_id = f"sprite-{domain['spriteId']}/depth-{row['depth']}/generation-{row['generation']}"
            instance = instances.setdefault(instance_id, {
                'instanceId': instance_id, 'spriteId': domain['spriteId'],
                'depth': row['depth'], 'generation': row['generation'],
                'objectId': row['objectId'], 'firstFrame': frame,
                'lastFrame': frame, 'runs': []})
            assert instance['objectId'] == row['objectId']
            instance['lastFrame'] = frame
            payload = {key: row[key] for key in fields}
            if instance['runs'] and instance['runs'][-1]['lastFrame'] == frame - 1 and all(
                    instance['runs'][-1][key] == value for key, value in payload.items()):
                instance['runs'][-1]['lastFrame'] = frame
            else:
                instance['runs'].append({'firstFrame': frame, 'lastFrame': frame, **payload})
    ordered = sorted(instances.values(), key=lambda x: (x['spriteId'], x['depth'], x['generation']))
    for frame, expected in enumerate(domain['selectedFrames'], 1):
        actual = []
        for instance in ordered:
            if not instance['firstFrame'] <= frame <= instance['lastFrame']:
                continue
            matches = [run for run in instance['runs']
                       if run['firstFrame'] <= frame <= run['lastFrame']]
            assert len(matches) == 1
            run = matches[0]
            actual.append({'depth': instance['depth'], 'generation': instance['generation'],
                           'objectId': instance['objectId'],
                           **{key: run[key] for key in fields}})
        assert sorted(actual, key=lambda x: x['depth']) == expected, (domain['spriteId'], frame)
    return ordered


def button_hit_box(button, button_state, parent_matrix, shapes):
    values = []
    for hit in button['hitRecords']:
        shape = shapes[hit['objectId']]
        transform = compose(compose(parent_matrix, button_state['matrixTwips']),
                            hit['matrixTwips'])
        values.append({'shapeId': hit['objectId'],
                       'sourceStageBoxPx': box(shape['boundsTwips'], transform)})
    return values, union_boxes([x['sourceStageBoxPx'] for x in values])


def quiz_bindings(root_matrix, main, texts, shapes, buttons, scripts):
    state = main['snapshots'][751]
    expected = {1: (44, 'A', 'The ball is at its highest point. ', 'wrong'),
                2: (44, 'B', 'The ball is as its lowest point.', 'wrong'),
                3: (45, 'C', 'The ball is falling.  ', 'right'),
                4: (44, 'D', 'The ball is rising.', 'wrong')}
    bindings = []
    for index in (1, 2, 3, 4):
        name = f'AnsBtn{index}'
        matches = [(depth, item) for depth, item in state.items() if item['name'] == name]
        assert len(matches) == 1
        depth, button_state = matches[0]
        object_id, letter, prose, branch = expected[index]
        assert button_state['objectId'] == object_id
        hits, hit_box = button_hit_box(buttons[object_id], button_state,
                                       root_matrix, shapes)
        candidates = []
        for label_depth, placement in state.items():
            text = texts.get(placement['objectId'])
            if text is None or placement['objectId'] not in QUIZ_TEXT_IDS:
                continue
            text_box = box(text['boundsTwips'],
                           compose(root_matrix, placement['matrixTwips']))
            fraction = overlap_of_text(text_box, hit_box)
            if fraction >= 0.5:
                candidates.append({'textId': placement['objectId'],
                                   'text': text['text'], 'depth': label_depth,
                                   'sourceStageBoxPx': text_box,
                                   'textOverlapWithHit': fraction})
        letters = [x for x in candidates if x['text'] in ('A', 'B', 'C', 'D')]
        prose_items = [x for x in candidates if x['text'] not in ('A', 'B', 'C', 'D')]
        assert len(letters) == len(prose_items) == 1, (name, candidates)
        assert (letters[0]['text'], prose_items[0]['text']) == (letter, prose)
        action_path = f'DefineButton2_{object_id}/BUTTONCONDACTION on(release).as'
        bindings.append({'answerInstance': name, 'mainFrame': 752,
                         'buttonObjectId': object_id, 'buttonDepth': depth,
                         'sourceBranch': branch,
                         'hitRecords': hits, 'sourceStageHitBoxPx': hit_box,
                         'letter': letters[0], 'optionText': prose_items[0],
                         'sourceAction': scripts[action_path]})
    assert [x['letter']['text'] for x in bindings] == list('ABCD')
    return bindings


def feedback_bindings(root_matrix, main, domains, texts, edits, shapes, buttons, scripts):
    main_state = main['snapshots'][751]
    result = []
    for source in FEEDBACK:
        sprite_id = source['spriteId']
        named = [(depth, state) for depth, state in main_state.items()
                 if state['name'] == source['name']]
        assert len(named) == 1 and named[0][1]['objectId'] == sprite_id
        feedback_depth, feedback_state = named[0]
        feedback_matrix = compose(root_matrix, feedback_state['matrixTwips'])
        domain = domains[sprite_id]
        hold = source['holdFrame']
        hold_state = domain['snapshots'][hold - 1]
        popup = [(depth, state) for depth, state in hold_state.items()
                 if state['name'] == 'Mc_Feed_Popup']
        assert len(popup) == 1 and popup[0][1]['objectId'] == source['popupSpriteId']
        popup_depth, popup_state = popup[0]
        popup_matrix = compose(feedback_matrix, popup_state['matrixTwips'])
        inner = domains[source['popupSpriteId']]['snapshots'][0]
        close = [(depth, state) for depth, state in inner.items()
                 if state['name'] == 'BtnClose']
        edit = [(depth, state) for depth, state in inner.items()
                if state['name'] == 'txtFeed']
        assert len(close) == len(edit) == 1
        close_depth, close_state = close[0]
        edit_depth, edit_state = edit[0]
        assert close_state['objectId'] == source['closeButtonId']
        assert edit_state['objectId'] == source['editTextId']
        assert edits[source['editTextId']]['authoredLiteral'] == ''
        hits, union = button_hit_box(buttons[source['closeButtonId']],
                                     close_state, popup_matrix, shapes)
        edit_box = box(edits[source['editTextId']]['boundsTwips'],
                       compose(popup_matrix, edit_state['matrixTwips']))
        close_path = f"DefineButton2_{source['closeButtonId']}/BUTTONCONDACTION on(release).as"
        raw_close = (SCRIPTS / close_path).read_text()
        assert f"_parent.gotoAndPlay({source['resumeFrame']});" in raw_close
        assert 'while(i <= 4)' in raw_close and 'eval("AnsBtn" + i).gotoAndStop(1)' in raw_close
        popup_path = f"DefineSprite_{source['popupSpriteId']}/frame_1/DoAction.as"
        assert (SCRIPTS / popup_path).read_text().strip() == 'txtFeed.text = _global.WrongFeed;'
        hold_path = f"DefineSprite_{sprite_id}/frame_{hold}/DoAction.as"
        assert (SCRIPTS / hold_path).read_text().strip() == 'stop();'
        end_path = f'DefineSprite_{sprite_id}/frame_28/DoAction.as'
        assert end_path in scripts and '_root.enableQuizButton();' in (SCRIPTS / end_path).read_text()
        result.append({**source, 'mainPlacementDepth': feedback_depth,
                       'mainPlacementMatrixTwips': feedback_state['matrixTwips'],
                       'popupDepth': popup_depth,
                       'popupPlacementMatrixTwips': popup_state['matrixTwips'],
                       'popupAlphaFactorAtHold': popup_state['color']['factor']['Alpha'],
                       'closeDepth': close_depth, 'closeHitRecords': hits,
                       'sourceStageCloseHitUnionPx': union,
                       'editDepth': edit_depth,
                       'sourceStageEditBoxPx': edit_box,
                       'editIsReadonlyDynamic': True,
                       'hostVariantSelected': False,
                       'sourceCloseEffect': 'parent gotoAndPlay(resumeFrame); reset AnsBtn1..4 to frame1',
                       'sourceTerminalEffect': 'enable host quiz/NMH; after at least two wrong attempts reset count and quizSection then play parent',
                       'closeAction': scripts[close_path],
                       'popupTextAction': scripts[popup_path],
                       'holdAction': scripts[hold_path],
                       'terminalAction': scripts[end_path]})
    return result


def mask_outline(shape):
    x = y = 0
    vertices = []
    for edge in shape.findall('shapes/Shape/edges/*'):
        if edge.tag == 'ShapeSetup':
            if edge.get('x') is not None:
                x, y = int(edge.get('x')), int(edge.get('y'))
                vertices.append([x, y])
        elif edge.tag == 'LineTo':
            x += int(edge.get('x'))
            y += int(edge.get('y'))
            vertices.append([x, y])
        else:
            raise AssertionError(f'unreviewed mask edge {edge.tag}')
    assert vertices[0] == vertices[-1]
    return vertices


def clip_plan(xml, facts, main, domains, root_matrix):
    main_state = main['snapshots'][751]
    feedback = next(item for item in main_state.values()
                    if item['name'] == 'Mc_Wrong_Feed3')
    assert feedback['objectId'] == 91
    domain = domains[91]
    mask_frames = []
    for frame, state in enumerate(domain['snapshots'], 1):
        mask = state.get(5)
        if mask is not None and mask['objectId'] == 79 and mask['clipDepth'] == 9:
            mask_frames.append(frame)
    assert mask_frames == list(range(5, 28))
    mask = domain['snapshots'][4][5]
    shape = next(item for item in xml.iter('DefineShape') if item.get('objectID') == '79')
    bounds = rect(shape.find('bounds/Rectangle'))
    assert bounds == {'left': -2337, 'right': 2215, 'top': -1203, 'bottom': 1629}
    paint = shape.find('styles/StyleList/fillStyles/Solid/color/Color')
    assert paint.attrib == {'red': '0', 'green': '0', 'blue': '255'}
    transform = compose(compose(root_matrix, feedback['matrixTwips']),
                        mask['matrixTwips'])
    hold = domain['snapshots'][20]
    clipped = [{'depth': depth, 'objectId': item['objectId'],
                'alphaFactor': item['color']['factor']['Alpha']}
               for depth, item in sorted(hold.items()) if 5 < depth <= 9]
    plan = {'schemaVersion': 1, 'kind': 'p041-source-clip-depth-plan-v1',
            'animationId': 'shared-alg001-l06-p041',
            'physicalSwfSha256': EXPECTED['swf'][1],
            'frozenSourceFactsSha256': EXPECTED['facts'][1],
            'conditionalFeedbackSpriteId': 91,
            'hostFeedbackVariantSelected': False,
            'mask': {'shapeId': 79, 'sourceTag': 'DefineShape',
                     'sourceFrameStart': 5, 'sourceFrameEnd': 27,
                     'sourceDepth': 5, 'sourceClipDepth': 9,
                     'sourceBoundsTwips': bounds,
                     'sourceVerticesTwips': mask_outline(shape),
                     'authoredFillRgb': [0, 0, 255],
                     'placementMatrixTwips': mask['matrixTwips'],
                     'sourceStageBoxAtMainQuizPx': box(bounds, transform),
                     'sourceStageBoxIsConditional': True,
                     'clippedDepthsAtHeldFeedbackFrame21': clipped},
            'semantics': {'sourceRole': 'clipDepth-mask-not-ordinary-blue-overlay',
                          'sourceShapePathPreserved': True,
                          'canvasMaskNormalizationImplemented': False,
                          'browserClipOrOcclusionVerified': False,
                          'originalRuntimeClipVerified': False},
            'acceptanceEffects': {'currentJsRegistered': False,
                                  'visualFidelityAccepted': False,
                                  'browserVerified': False}}
    assert facts['timeline']['clipMasks'] == [
        {'spriteId': 91, 'frame': 5, 'characterId': 79, 'depth': 5, 'clipDepth': 9}]
    return plan


def build():
    swf, swf_pin = pin(SWF, EXPECTED['swf'])
    _, index_pin = pin(INDEX, EXPECTED['index'])
    facts_raw, facts_pin = pin(FACTS, EXPECTED['facts'])
    xml_raw, xml_pin = pin(XML, EXPECTED['xml'])
    fresh = subprocess.run(['swfmill', '-n', 'swf2xml', str(SWF), 'stdout'],
                           check=True, capture_output=True).stdout
    assert fresh == xml_raw
    facts = json.loads(facts_raw)
    assert facts['animationId'] == 'shared-alg001-l06-p041'
    assert facts['physicalSource']['swf'] == swf_pin
    assert facts['physicalSource']['indexXml'] == index_pin
    assert facts['publicToolEvidence']['swfmillXml']['sha256'] == xml_pin['sha256']
    scripts = source_scripts(facts)
    xml = ET.fromstring(xml_raw)
    assert xml.attrib == {'version': '6', 'compressed': '1'}
    assert xml.find('Header').attrib == {'framerate': '12', 'frames': '10'}
    fonts, texts, edits, shapes, buttons = definitions(xml)
    assert {t['objectId']: t['text'] for t in facts['nativeVisual']['texts']} == {
        k: v['text'] for k, v in texts.items()}
    root_tags = xml.find('Header/tags')
    frame = 1
    root_placements = []
    for tag in root_tags:
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'PlaceObject2':
            root_placements.append((frame, tag))
    assert frame == 11 and len(root_placements) == 2
    root_placement_events = [
        {'frame': at, 'sourceAttributes': dict(tag.attrib),
         'matrixTwips': matrix(tag.find('transform/Transform')),
         'matrixSourceAttributes': dict(tag.find('transform/Transform').attrib),
         'colorSourceAttributes': dict(tag.find('colorTransform/ColorTransform2').attrib)
            if tag.find('colorTransform/ColorTransform2') is not None else None}
        for at, tag in root_placements]
    entry = next(tag for at, tag in root_placements
                 if at == 6 and tag.get('name') == 'animation')
    assert entry.get('objectID') == '169'
    root_matrix = matrix(entry.find('transform/Transform'))
    selected = set(texts) | set(edits) | set(buttons) | {79}
    domains = {int(sprite.get('objectID')): timeline(sprite, selected)
               for sprite in xml.iter('DefineSprite')}
    assert len(domains) == 14
    instances = [item for domain in domains.values()
                 for item in compress_selected(domain)]
    quiz = quiz_bindings(root_matrix, domains[169], texts, shapes, buttons, scripts)
    feedback = feedback_bindings(root_matrix, domains[169], domains,
                                 texts, edits, shapes, buttons, scripts)
    clip = clip_plan(xml, facts, domains[169], domains, root_matrix)
    counts = Counter(item.tag for item in xml.iter())
    assert (counts['DefineText'], counts['DefineEditText'],
            counts['DefineButton2'], counts['DefineFont2']) == (35, 3, 5, 7)
    assert sum(d['tagCounts'].get('PlaceObject2', 0) for d in domains.values()) + 2 == 800
    events = {str(key): domain['events'] for key, domain in sorted(domains.items())}
    model = {'schemaVersion': 1,
             'kind': 'p041-physical-source-native-quiz-feedback-model-v1',
             'animationId': 'shared-alg001-l06-p041',
             'source': {'physicalSwf': swf_pin, 'physicalIndex': index_pin,
                        'frozenSourceFacts': facts_pin, 'frozenSwfmillXml': xml_pin,
                        'freshSwfmillMatchesFrozenXml': True,
                        'freshFfdecMatchesFrozenScripts': True,
                        'ffdecScripts': scripts},
             'stage': {'width': 800, 'height': 600, 'fps': 12,
                       'background': '#b8d8f7'},
             'root': {'frameCount': 10, 'beginFrame': 6,
                      'animationSpriteId': 169,
                      'animationPlacementMatrixTwips': root_matrix,
                      'rootPlacementEvents': root_placement_events},
             'coordinateContract': {'unit': 'source-SWF-stage-pixels',
                 'rule': 'TextBounds already includes TextMatrix; compose root, sprite and instance matrices for its box. Button hit shape bounds additionally use hit-record matrix. Divide twips by 20 only after composition.',
                 'browserPlacementCalibrated': False,
                 'canvasTransformExported': False},
             'fontDefinitions': {str(k): v for k, v in sorted(fonts.items())},
             'staticTextDefinitions': {str(k): v for k, v in sorted(texts.items())},
             'readOnlyEditDefinitions': {str(k): v for k, v in sorted(edits.items())},
             'buttonDefinitions': {str(k): v for k, v in sorted(buttons.items())},
             'hitShapeDefinitions': {str(k): shapes[k] for k in (43, 63, 71)},
             'spriteFrameCounts': {str(k): d['frameCount'] for k, d in sorted(domains.items())},
             'spriteTagCounts': {str(k): d['tagCounts'] for k, d in sorted(domains.items())},
             'spritePlacementEvents': events,
             'selectedInstances': instances,
             'quiz': {'mainSpriteId': 169, 'holdFrame': 752,
                      'options': quiz,
                      'answerTextPairingBasis': 'source-stage bounds overlap with four authored hit boxes; no browser-calibrated hit parity',
                      'hostQuizButtonBehaviorRecovered': False},
             'wrongFeedback': feedback,
             'rightFeedbackSourceSpriteIds': [119, 139, 152, 168],
             'readOnlyPopupTextContract': {
                 'sourceAssignment': 'txtFeed.text = _global.WrongFeed',
                 'sourceLiteralInEditFields': False,
                 'sourceFirstWrongAndLaterWrongTextInButton44': True,
                 'runtimeValueOrDisplayBrowserVerified': False},
             'clipPlan': {'path': CLIP.name, 'sha256': digest(encode(clip))},
             'visibilityContract': {
                 'placedPositiveAlphaIsNotRenderedVisibility': True,
                 'feedbackSpritesAreConditionalHostSelections': True,
                 'maskGeometryAndOcclusionBrowserVerified': False,
                 'sourceToCanvasGlyphAlignmentVerified': False},
             'projectionProof': {
                 'sourceSpriteFramesChecked': sum(d['frameCount'] for d in domains.values()),
                 'selectedFrameStatesReexpanded': True,
                 'sourcePlacementEvents': sum(d['tagCounts'].get('PlaceObject2', 0)
                                              for d in domains.values()) + 2,
                 'sourceRemoveEvents': sum(d['tagCounts'].get('RemoveObject2', 0)
                                           for d in domains.values()),
                 'sourceGlyphsMapped': sum(len(g['glyphs'])
                                           for t in texts.values() for g in t['records'])},
             'nativeProductIntegrated': False,
             'acceptanceEffects': {key: False for key in (
                 'currentJsRegistered', 'browserVerified', 'audioAccepted',
                 'originalRuntimeAccepted', 'visualFidelityAccepted',
                 'humanVisualAccepted', 'ownerAccepted', 'strictComplete', 'published')}}
    return {MODEL: encode(model), CLIP: encode(clip)}, model


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ('--plan', '--write', '--check'), \
        'usage: --plan | --write | --check'
    mode = sys.argv[1]
    outputs, model = build()
    for path, raw in outputs.items():
        assert path.parent == HERE and not path.is_symlink()
        if mode == '--write' and not path.exists():
            with path.open('xb') as stream:
                stream.write(raw)
        if mode in ('--write', '--check'):
            assert pin(path)[0] == raw, f'output drift: {path}'
    print(json.dumps({'mode': mode,
                      'outputs': {path.name: {'bytes': len(raw), 'sha256': digest(raw)}
                                  for path, raw in outputs.items()},
                      'staticTexts': len(model['staticTextDefinitions']),
                      'readOnlyEdits': len(model['readOnlyEditDefinitions']),
                      'buttons': len(model['buttonDefinitions']),
                      'quizOptions': len(model['quiz']['options']),
                      'wrongCloseBindings': len(model['wrongFeedback']),
                      'selectedInstances': len(model['selectedInstances']),
                      'sourceSpriteFramesChecked': model['projectionProof']['sourceSpriteFramesChecked']},
                     sort_keys=True))


if __name__ == '__main__':
    main()
