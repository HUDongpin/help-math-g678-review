#!/usr/bin/env python3
"""Regenerate the P038 native text and button model from physical source."""
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

WORKTREE = Path(__file__).resolve().parents[1]
HERE = WORKTREE / 'migrations/shared-alg001-l06-p038/native-v1'
TEMP_ROOT = WORKTREE / 'work/g678-shared-page-factory/alg-l06-p038-maintained-canvas-v1-20261001-v1'
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
LESSON = SOURCE_ROOT / 'G6-G8-shared/ALG001/L6'
SWF = LESSON / 'IN/L6IN10.swf'
INDEX = LESSON / 'index.xml'
OUT = HERE / 'native-model-v1.json'
ID = 'shared-alg001-l06-p038'
SWF_PIN = (125928, 'bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de')
INDEX_PIN = (13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c')
XML_PIN = (606070, '95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14')
SCRIPT_SHA = {
    'frame_1/DoAction.as': 'af7188282949f2613421ba9c8be629f489bbe2ee1e370a072024794b2d2cfc19',
    'frame_6/DoAction.as': '3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655',
    49: 'ebe5121cf5eee9349a2921629ad89ffa40819e4e6ee707d9bea8a07142282dbd',
    52: '573534c3578af9119df87b9a8e2c4751ca88e451a2e1dde1896a9ad77acd746e',
    53: 'fc18c1b076872ddbff22a6de05a0929210cfcb8d065a27a37c654e3eb33c496a',
    57: '0b89848d79d735127115901984f60c2c8c2996f9561d150573068e496601ed4b',
    60: 'b9aafff389f456dd2b9b47ba56a2948163956fc001ca6ca2add0a0d55f7f9c05',
    64: '5f789f785f961f26fba79d3dd3167089fc8251e9da0e0cff9852831b2f890788',
    66: 'bf18a4b6722a58696805f4dd043c6b04a1b1c3cc9a605ef84301790c08bb4cfa',
}
BUTTON_KEYS = {49: 'Table', 52: 'Output', 53: 'Input', 57: 'Equation',
               60: 'Rule', 64: 'Graph', 66: 'Function'}


def digest(data):
    return sha256(data).hexdigest()


def read_pinned(path, expected):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns,
            before.st_ctime_ns, before.st_mode, before.st_nlink) == (
                after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
                after.st_ctime_ns, after.st_mode, after.st_nlink), path
    assert len(data) == expected[0] and digest(data) == expected[1], path
    return data


def affine(tag):
    node = tag.find('transform/Transform')
    if node is None:
        return None
    return {key: float(node.get(key, default)) for key, default in (
        ('scaleX', '1'), ('scaleY', '1'), ('skewX', '0'), ('skewY', '0'),
        ('transX', '0'), ('transY', '0'))}


def alpha(tag):
    node = tag.find('colorTransform/ColorTransform2')
    if node is None:
        return None
    assert node.get('termAlpha') in (None, '0')
    assert all(node.get(channel, '256') == '256' for channel in
               ('factorRed', 'factorGreen', 'factorBlue'))
    assert all(node.get(channel) in (None, '0') for channel in
               ('termRed', 'termGreen', 'termBlue'))
    return int(node.get('factorAlpha', '256'))


def rectangle(tag):
    node = tag.find('bounds/Rectangle')
    assert node is not None
    return {key: int(node.get(key)) for key in ('left', 'right', 'top', 'bottom')}


def source_point(root, child, local, x, y):
    # All three matrices use SWF twips. Divide only after affine composition.
    local_x = local['scaleX'] * x + local['skewX'] * y + local['transX']
    local_y = local['skewY'] * x + local['scaleY'] * y + local['transY']
    child_x = child['scaleX'] * local_x + child['skewX'] * local_y + child['transX']
    child_y = child['skewY'] * local_x + child['scaleY'] * local_y + child['transY']
    stage_x = root['scaleX'] * child_x + root['skewX'] * child_y + root['transX']
    stage_y = root['skewY'] * child_x + root['scaleY'] * child_y + root['transY']
    return [round(stage_x / 20, 4), round(stage_y / 20, 4)]


def box(root, child, local, bounds):
    corners = [source_point(root, child, local, x, y)
               for x in (bounds['left'], bounds['right'])
               for y in (bounds['top'], bounds['bottom'])]
    return [min(p[0] for p in corners), min(p[1] for p in corners),
            max(p[0] for p in corners), max(p[1] for p in corners)]


def ffdec_scripts():
    pins = {}
    TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.ffdec-source-check-', dir=TEMP_ROOT) as temporary:
        result = subprocess.run(['ffdec', '-export', 'script', temporary, str(SWF)],
                                capture_output=True, text=True)
        assert result.returncode == 0, result.stderr[:1000]
        base = Path(temporary) / 'scripts'
        found = sorted(base.glob('**/*.as'))
        assert len(found) == 9
        for path in found:
            raw = path.read_bytes()
            script_lines = [line.strip() for line in raw.decode('utf-8').splitlines()]
            if path.parent.name.startswith('DefineButton2_'):
                object_id = int(path.parent.name.split('_')[1])
                key = BUTTON_KEYS[object_id]
                assert script_lines == ['on(release){', f'_global.KeyAttribute = "{key}";',
                                        '_root.DoHyperLinks();',
                                        '_root.animation_mc.animation.stop();', '}']
                assert digest(raw) == SCRIPT_SHA[object_id]
                pins[object_id] = {'bytes': len(raw), 'sha256': digest(raw),
                                   'sourceKeyAttribute': key,
                                   'ffdecPath': f'{path.parent.name}/{path.name}'}
            else:
                relative = str(path.relative_to(base))
                assert relative in SCRIPT_SHA and digest(raw) == SCRIPT_SHA[relative]
                if relative.startswith('frame_1'):
                    assert script_lines == [
                        '_level0.InternalPreloader.gotoAndPlay("jump_check");', 'stop();']
                else:
                    assert script_lines == ['stop();']
                pins[relative] = {'bytes': len(raw), 'sha256': digest(raw),
                                  'ffdecPath': relative}
    assert set(pins) == set(SCRIPT_SHA)
    return pins


def definitions(xml):
    fonts = {int(f.get('objectID')): {
        'name': f.get('name'),
        'glyphMap': [chr(int(g.get('map'))) for g in f.findall('glyphs/Glyph')]}
        for f in xml.iter('DefineFont2')}
    assert len(fonts) == 2
    texts = {}
    for item in xml.iter('DefineText'):
        object_id = int(item.get('objectID'))
        current_font = height = baseline_y = color = None
        glyphs = []
        for record in item.iter('TextRecord6'):
            if record.get('objectID') is not None:
                current_font = int(record.get('objectID'))
                height = int(record.get('fontHeight'))
                baseline_y = int(record.get('y', '0'))
            paint = record.find('color/Color')
            if paint is not None:
                color = [int(paint.get(channel, '0')) for channel in
                         ('red', 'green', 'blue')]
            for entry in record.findall('glyphs/TextEntry'):
                glyph_index = int(entry.get('glyph'))
                glyphs.append({'fontId': current_font, 'fontGlyphIndex': glyph_index,
                               'character': fonts[current_font]['glyphMap'][glyph_index],
                               'advanceTwips': int(entry.get('advance'))})
        local = affine(item)
        assert local is not None and current_font in fonts and glyphs
        texts[str(object_id)] = {
            'text': ''.join(g['character'] for g in glyphs),
            'fontId': current_font, 'fontName': fonts[current_font]['name'],
            'fontHeightTwips': height, 'baselineYTwips': baseline_y,
            'colorRGB': color, 'localBoundsTwips': rectangle(item),
            'localMatrixTwips': local, 'glyphSequence': glyphs}
    assert len(texts) == 38
    expected = {5: 'Output', 6: 'Input', 18: 'y = 2x + 1',
                29: '(-2,-3)', 31: '(-1,-1)', 33: '(1,3)',
                35: '(0,1)', 37: '(2,5)', 38: 'y = 2x + 1',
                41: 'y = 2x + 1', 47: 'The table tells you specific',
                56: 'The equation ', 63: 'The graph shows an overall ',
                65: 'picture of the function.'}
    assert all(texts[str(key)]['text'] == value for key, value in expected.items())
    return texts, {str(key): value for key, value in sorted(fonts.items())}


def button_definitions(xml, scripts):
    hit_shapes = [x for x in xml.iter('DefineShape') if x.get('objectID') == '48']
    assert len(hit_shapes) == 1
    bounds = rectangle(hit_shapes[0])
    assert bounds == {'left': -570, 'right': 570, 'top': -200, 'bottom': 200}
    # The shared hit shape is an authored rectangle; no visible up/over/down art.
    edges = hit_shapes[0].findall('.//edges/*')
    assert [x.tag for x in edges] == ['ShapeSetup', 'LineTo', 'LineTo',
                                      'LineTo', 'LineTo', 'ShapeSetup']
    buttons = {}
    for item in xml.iter('DefineButton2'):
        object_id = int(item.get('objectID'))
        assert object_id in BUTTON_KEYS
        records = item.findall('buttons/Button')
        active = [x for x in records if x.get('objectID') is not None]
        assert len(active) == 1 and active[0].get('objectID') == '48'
        assert active[0].get('hitTest') == '1'
        assert all(active[0].get(state) == '0' for state in ('up', 'over', 'down'))
        local = affine(active[0])
        assert local == {'scaleX': 1.0, 'scaleY': 1.0, 'skewX': 0.0,
                         'skewY': 0.0, 'transX': 0.0, 'transY': 0.0}
        conditions = item.findall('conditions/Condition')
        assert len(conditions) == 1
        condition = conditions[0]
        assert condition.get('pointerReleaseInside') == '1' and condition.get('key') == '0'
        assert all(value == '0' for key, value in condition.attrib.items()
                   if key not in ('next', 'pointerReleaseInside'))
        strings = [x.get('value') for x in condition.findall('.//String')]
        assert all(value in strings for value in
                   ('_global', 'KeyAttribute', BUTTON_KEYS[object_id], '_root',
                    'DoHyperLinks', 'animation_mc', 'animation', 'stop'))
        buttons[str(object_id)] = {
            'sourceKeyAttribute': BUTTON_KEYS[object_id],
            'event': 'pointerReleaseInside',
            'sourceEffect': 'set _global.KeyAttribute; call _root.DoHyperLinks(); stop _root.animation_mc.animation',
            'hitShapeObjectId': 48, 'hitLocalBoundsTwips': bounds,
            'hitLocalMatrixTwips': local, 'scriptPin': scripts[object_id]}
    assert len(buttons) == 7
    return buttons


def root_entry(xml):
    head = xml.find('Header')
    assert xml.attrib == {'version': '6', 'compressed': '1'}
    assert head.attrib == {'framerate': '12', 'frames': '13'}
    assert head.find('size/Rectangle').attrib == {
        'left': '0', 'right': '16000', 'top': '0', 'bottom': '12000'}
    frame, actions, labels, child = 1, [], [], None
    for tag in head.find('tags'):
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'DoAction':
            actions.append(frame)
        elif tag.tag == 'FrameLabel':
            labels.append((frame, tag.get('label')))
        elif tag.tag == 'PlaceObject2' and tag.get('objectID') == '67':
            assert child is None
            child = {'frame': frame, 'depth': int(tag.get('depth')),
                     'name': tag.get('name'), 'matrixTwips': affine(tag)}
    assert frame == 14 and actions == [1, 6] and labels == [(6, 'begin')]
    assert child == {'frame': 6, 'depth': 2, 'name': 'animation',
                     'matrixTwips': {'scaleX': 1.0, 'scaleY': 1.0,
                                     'skewX': 0.0, 'skewY': 0.0,
                                     'transX': 8248.0, 'transY': 6466.0}}
    return child


def project_frames(sprite, texts, buttons, root):
    active, generations, frames = {}, {}, []
    counts = Counter()
    for tag in sprite.find('tags'):
        if tag.tag == 'PlaceObject2':
            depth = int(tag.get('depth'))
            replacing = tag.get('replace') == '1'
            object_id = tag.get('objectID')
            change_matrix, change_alpha = affine(tag), alpha(tag)
            ratio = int(tag.get('morph')) if tag.get('morph') is not None else None
            if replacing:
                assert depth in active
            if object_id is not None:
                assert not replacing and depth not in active
                generations[depth] = generations.get(depth, 0) + 1
                active[depth] = {'objectId': int(object_id),
                                 'generation': generations[depth],
                                 'matrix': change_matrix,
                                 'alpha': change_alpha if change_alpha is not None else 256,
                                 'ratio': ratio}
            else:
                assert replacing and depth in active
                if change_matrix is not None:
                    active[depth]['matrix'] = change_matrix
                if change_alpha is not None:
                    active[depth]['alpha'] = change_alpha
                if ratio is not None:
                    active[depth]['ratio'] = ratio
            counts['PlaceObject2'] += 1
        elif tag.tag == 'RemoveObject2':
            depth = int(tag.get('depth'))
            assert depth in active
            del active[depth]
            counts['RemoveObject2'] += 1
        elif tag.tag == 'ShowFrame':
            rows = []
            for depth, state in sorted(active.items()):
                object_id = state['objectId']
                text = texts.get(str(object_id))
                button = buttons.get(str(object_id))
                if text is None and button is None:
                    continue
                local = text['localMatrixTwips'] if text is not None else button['hitLocalMatrixTwips']
                bounds = text['localBoundsTwips'] if text is not None else button['hitLocalBoundsTwips']
                assert state['matrix'] is not None
                rows.append({'depth': depth, 'generation': state['generation'],
                             'objectId': object_id, 'kind': 'text' if text is not None else 'button',
                             'alphaNumerator': state['alpha'], 'matrixTwips': state['matrix'],
                             'ratio': state['ratio'],
                             'sourceStageAnchorPx': source_point(root, state['matrix'], local, 0, 0),
                             'sourceStageBoxPx': box(root, state['matrix'], local, bounds)})
            frames.append(rows)
            counts['ShowFrame'] += 1
        elif tag.tag in ('SoundStreamHead', 'SoundStreamBlock', 'End'):
            counts[tag.tag] += 1
        else:
            raise AssertionError(f'unreviewed child tag: {tag.tag}')
    assert counts == {'PlaceObject2': 609, 'RemoveObject2': 15,
                      'ShowFrame': 409, 'SoundStreamHead': 1,
                      'SoundStreamBlock': 374, 'End': 1}
    assert len(frames) == 409
    return frames, counts


def compress_and_check(frames):
    instances = {}
    fields = ('alphaNumerator', 'matrixTwips', 'ratio',
              'sourceStageAnchorPx', 'sourceStageBoxPx')
    for frame, rows in enumerate(frames, 1):
        for row in rows:
            key = f"depth-{row['depth']}/generation-{row['generation']}"
            instance = instances.setdefault(key, {
                'instanceId': key, 'depth': row['depth'], 'generation': row['generation'],
                'objectId': row['objectId'], 'kind': row['kind'],
                'firstFrame': frame, 'lastFrame': frame, 'runs': []})
            assert (instance['objectId'], instance['kind']) == (row['objectId'], row['kind'])
            instance['lastFrame'] = frame
            run = {field: row[field] for field in fields}
            if instance['runs'] and instance['runs'][-1]['lastFrame'] == frame - 1 and all(
                    instance['runs'][-1][field] == value for field, value in run.items()):
                instance['runs'][-1]['lastFrame'] = frame
            else:
                instance['runs'].append({'firstFrame': frame, 'lastFrame': frame, **run})
    ordered = sorted(instances.values(), key=lambda x: (x['depth'], x['generation']))
    for frame, expected in enumerate(frames, 1):
        actual = []
        for instance in ordered:
            if not instance['firstFrame'] <= frame <= instance['lastFrame']:
                continue
            runs = [run for run in instance['runs']
                    if run['firstFrame'] <= frame <= run['lastFrame']]
            assert len(runs) == 1, (frame, instance['instanceId'])
            actual.append({key: instance[key] for key in
                           ('depth', 'generation', 'objectId', 'kind')} |
                          {key: runs[0][key] for key in fields})
        assert sorted(actual, key=lambda row: row['depth']) == expected, frame
    return ordered


def positive_alpha_presence(frames, texts, buttons):
    seen = {}
    for frame, rows in enumerate(frames, 1):
        for row in rows:
            if row['alphaNumerator'] <= 0:
                continue
            key = str(row['objectId'])
            value = seen.setdefault(key, {'firstPositiveAlphaFrame': frame,
                                          'lastPositiveAlphaFrame': frame,
                                          'positiveAlphaFrameCount': 0, 'depths': []})
            value['lastPositiveAlphaFrame'] = frame
            value['positiveAlphaFrameCount'] += 1
            if row['depth'] not in value['depths']:
                value['depths'].append(row['depth'])
    assert set(seen) == set(texts) | set(buttons)
    return seen


def clip_mask_placements(sprite):
    frame, masks = 1, []
    for tag in sprite.find('tags'):
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'PlaceObject2' and tag.get('clipDepth') is not None:
            mask_alpha = alpha(tag)
            masks.append({'startFrame': frame, 'depth': int(tag.get('depth')),
                          'clipDepth': int(tag.get('clipDepth')),
                          'objectId': int(tag.get('objectID')),
                          'matrixTwips': affine(tag),
                          'alphaNumerator': 256 if mask_alpha is None else mask_alpha})
    assert [(m['startFrame'], m['depth'], m['clipDepth'], m['objectId']) for m in masks] == [
        (166, 80, 85, 45), (207, 86, 94, 45), (225, 95, 97, 45),
        (258, 98, 103, 45), (268, 104, 106, 45), (296, 107, 112, 45),
        (304, 113, 115, 45), (315, 116, 118, 45), (322, 119, 124, 45),
        (387, 125, 130, 45)]
    return masks


def build():
    physical = read_pinned(SWF, SWF_PIN)
    read_pinned(INDEX, INDEX_PIN)
    xml_bytes = subprocess.run(['swfmill', '-n', 'swf2xml', str(SWF), 'stdout'],
                               check=True, capture_output=True).stdout
    assert (len(xml_bytes), digest(xml_bytes)) == XML_PIN
    xml = ET.fromstring(xml_bytes)
    scripts = ffdec_scripts()
    texts, fonts = definitions(xml)
    buttons = button_definitions(xml, scripts)
    root = root_entry(xml)
    sprite = next((s for s in xml.iter('DefineSprite') if s.get('objectID') == '67'), None)
    assert sprite is not None and sprite.get('frames') == '409'
    frames, counts = project_frames(sprite, texts, buttons, root['matrixTwips'])
    instances = compress_and_check(frames)
    positive_alpha = positive_alpha_presence(frames, texts, buttons)
    masks = clip_mask_placements(sprite)
    expected_buttons = [(49, 166, 83), (52, 207, 90), (53, 207, 92),
                        (57, 258, 101), (60, 296, 110), (64, 322, 122),
                        (66, 387, 128)]
    bindings = []
    for object_id, start, depth in expected_buttons:
        item = next(x for x in instances if x['objectId'] == object_id and x['kind'] == 'button')
        assert (item['firstFrame'], item['lastFrame'], item['depth']) == (start, 409, depth)
        bindings.append({'buttonObjectId': object_id, 'sourceKeyAttribute': BUTTON_KEYS[object_id],
                         'startFrame': start, 'lastSourceFrame': 409, 'depth': depth,
                         'sourceStageHitBoxAtStartPx': item['runs'][0]['sourceStageBoxPx'],
                         'sourceScriptPin': scripts[object_id]})
    return {'schemaVersion': 1, 'kind': 'p038-physical-source-native-text-button-model-v1',
            'animationId': ID,
            'source': {'physicalSwf': {'bytes': len(physical), 'sha256': digest(physical)},
                       'physicalIndexSha256': INDEX_PIN[1],
                       'physicalSwfmillXml': {'bytes': len(xml_bytes), 'sha256': digest(xml_bytes)},
                       'ffdecVersion': '26.2.1', 'rootScripts': {
                           'frame1': scripts['frame_1/DoAction.as'],
                           'frame6': scripts['frame_6/DoAction.as']}},
            'stage': {'width': 800, 'height': 600, 'background': '#b8d8f7', 'fps': 12},
            'root': {'frameCount': 13, 'beginFrame': 6, 'placement': root},
            'frameDomain': 'sprite-67', 'frameCount': 409,
            'coordinateContract': {'unit': 'source-SWF-stage-pixels',
                'rule': 'compose root, child and local affine matrices in twips; divide by 20 once',
                'canvasTransformExported': False, 'browserPlacementCalibrated': False},
            'fontDefinitions': fonts, 'textDefinitions': texts,
            'buttonDefinitions': buttons, 'buttonBindings': bindings,
            'instances': instances, 'positiveAlphaPresenceWindows': positive_alpha,
            'clipMaskPlacements': masks,
            'visibilityContract': {
                'positiveAlphaPresenceIsNotRenderedVisibility': True,
                'clipMasksModeledAsPlacementsOnly': True,
                'clipGeometryOrOcclusionVerified': False,
                'browserVisibilityVerified': False},
            'sourceTagCounts': dict(counts),
            'textSets': {
                'inputOutputHeadings': [5, 6], 'formulaCopies': [18, 38, 41],
                'orderedPairStrings': [29, 31, 33, 35, 37],
                'sourceExplanationLines': [47, 51, 54, 56, 58, 59, 61, 62, 63, 65]},
            'projectionProof': {'sourceFramesChecked': 409,
                'exactTextButtonDepthGenerationObjectAlphaMatrixRatioStageAnchorBox': True,
                'sourceCanvasOrBrowserCalibrationInferred': False},
            'nativeTextProductIntegrated': False,
            'buttonInteractionProductIntegrated': False,
            'familyVisualPlaybackCalibrationPassed': False,
            'acceptanceEffects': {key: False for key in (
                'currentJsRegistered', 'browserVerified', 'audioAccepted',
                'originalRuntimeAccepted', 'visualFidelityAccepted',
                'humanVisualAccepted', 'ownerAccepted', 'strictComplete', 'published')}}


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ('--plan', '--write', '--check'), \
        'Usage: --plan | --write | --check'
    mode = sys.argv[1]
    model = build()
    encoded = (json.dumps(model, indent=2, ensure_ascii=False) + '\n').encode()
    if mode == '--write' and not OUT.exists():
        with OUT.open('xb') as stream:
            stream.write(encoded)
    if mode in ('--write', '--check'):
        assert read_pinned(OUT, (len(encoded), digest(encoded))) == encoded
    print(json.dumps({'mode': mode, 'bytes': len(encoded), 'sha256': digest(encoded),
                      'sourceFramesChecked': model['projectionProof']['sourceFramesChecked'],
                      'textDefinitions': len(model['textDefinitions']),
                      'buttons': len(model['buttonDefinitions']),
                      'instances': len(model['instances']),
                      'runs': sum(len(i['runs']) for i in model['instances'])}, sort_keys=True))


if __name__ == '__main__':
    main()
