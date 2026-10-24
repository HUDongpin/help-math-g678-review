#!/usr/bin/env python3
"""Regenerate P038 source clip geometry and label reveal from physical SWF."""
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET

WORKTREE = Path(__file__).resolve().parents[1]
HERE = WORKTREE / 'migrations/shared-alg001-l06-p038/native-v1'
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN10.swf')
NATIVE = HERE / 'native-model-v1.json'
OUT = HERE / 'source-clip-plan-v1.json'
SOURCE_PIN = (125928, 'bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de')
NATIVE_PIN = (331453, '5fe165f369a84e7e08a0b4fbf6de921c40e9cd4f5367a647c9fc70186d26e13f')
XML_PIN = (606070, '95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14')
ROOT = {'scaleX': 1, 'scaleY': 1, 'skewX': 0, 'skewY': 0, 'transX': 8248, 'transY': 6466}
LABELS = {'Table': (47, 'table'), 'Output': (51, 'outputs'),
          'Input': (51, 'inputs'), 'Equation': (56, 'equation'),
          'Rule': (59, 'rule'), 'Graph': (63, 'graph'),
          'Function': (65, 'function')}


def digest(raw):
    return sha256(raw).hexdigest()


def pinned(path, pin):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    raw = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns,
            before.st_ctime_ns, before.st_mode, before.st_nlink) == (
                after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
                after.st_ctime_ns, after.st_mode, after.st_nlink), path
    assert (len(raw), digest(raw)) == pin, path
    return raw


def matrix(tag):
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
    return int(node.get('factorAlpha', '256'))


def transformed_point(chain, x, y):
    for affine in reversed(chain):
        x, y = (affine['scaleX'] * x + affine['skewX'] * y + affine['transX'],
                affine['skewY'] * x + affine['scaleY'] * y + affine['transY'])
    return [x / 20, y / 20]


def rect_px(chain, rect):
    corners = [transformed_point(chain, x, y)
               for x in (rect['left'], rect['right'])
               for y in (rect['top'], rect['bottom'])]
    return [min(p[0] for p in corners), min(p[1] for p in corners),
            max(p[0] for p in corners), max(p[1] for p in corners)]


def active_run(instance, frame):
    if not instance['firstFrame'] <= frame <= instance['lastFrame']:
        return None
    matching = [r for r in instance['runs'] if r['firstFrame'] <= frame <= r['lastFrame']]
    assert len(matching) == 1
    return matching[0]


def shape45(root):
    shapes = [v for v in root.iter('DefineShape3') if v.get('objectID') == '45']
    assert len(shapes) == 1
    shape = shapes[0]
    bounds = shape.find('bounds/Rectangle')
    assert bounds is not None
    rect = {k: int(bounds.get(k)) for k in ('left', 'right', 'top', 'bottom')}
    assert rect == {'left': -1866, 'right': 1866, 'top': -230, 'bottom': 230}
    fills = shape.findall('styles/StyleList/fillStyles/*')
    assert len(fills) == 1 and fills[0].tag == 'Solid'
    color = fills[0].find('color/Color')
    assert color is not None and color.attrib == {
        'red': '153', 'green': '255', 'blue': '0', 'alpha': '176'}
    assert not shape.findall('styles/StyleList/lineStyles/*')
    edges = shape.findall('shapes/Shape/edges/*')
    assert [v.tag for v in edges] == ['ShapeSetup', 'LineTo', 'LineTo',
                                      'LineTo', 'LineTo', 'ShapeSetup']
    assert edges[0].attrib == {'x': '-1866', 'y': '230', 'fillStyle0': '1'}
    assert [v.attrib for v in edges[1:5]] == [
        {'x': '3732', 'y': '0'}, {'x': '0', 'y': '-460'},
        {'x': '-3732', 'y': '0'}, {'x': '0', 'y': '460'}]
    return rect


def mask_instances(sprite, shape):
    active, completed, generations = {}, [], {}
    frame = 1
    for tag in sprite.find('tags'):
        if tag.tag == 'PlaceObject2':
            depth = int(tag.get('depth'))
            object_id = tag.get('objectID')
            if object_id == '45':
                assert tag.get('replace') == '0' and depth not in active
                generations[depth] = generations.get(depth, 0) + 1
                initial_alpha = alpha(tag)
                active[depth] = {'instanceId': f'depth-{depth}/generation-{generations[depth]}',
                                 'objectId': 45, 'depth': depth,
                                 'clipDepth': int(tag.get('clipDepth')),
                                 'firstFrame': frame, 'lastFrame': frame,
                                 'matrix': matrix(tag),
                                 'alpha': 256 if initial_alpha is None else initial_alpha,
                                 'runs': []}
            elif tag.get('replace') == '1' and depth in active:
                assert object_id is None and tag.get('clipDepth') is None
                change = matrix(tag)
                if change is not None:
                    active[depth]['matrix'] = change
                change_alpha = alpha(tag)
                if change_alpha is not None:
                    active[depth]['alpha'] = change_alpha
        elif tag.tag == 'RemoveObject2':
            depth = int(tag.get('depth'))
            if depth in active:
                completed.append(active.pop(depth))
        elif tag.tag == 'ShowFrame':
            for item in active.values():
                assert item['matrix'] is not None
                item['lastFrame'] = frame
                data = {'matrixTwips': item['matrix'], 'alphaNumerator': item['alpha'],
                        'sourceStageRectPx': rect_px([ROOT, item['matrix']], shape)}
                runs = item['runs']
                if runs and runs[-1]['lastFrame'] == frame - 1 and all(
                        runs[-1][key] == value for key, value in data.items()):
                    runs[-1]['lastFrame'] = frame
                else:
                    runs.append({'firstFrame': frame, 'lastFrame': frame, **data})
            frame += 1
    assert frame == 410
    completed.extend(active.values())
    masks = sorted(completed, key=lambda v: v['depth'])
    assert len(masks) == 10
    for item in masks:
        del item['matrix'], item['alpha']
        assert item['lastFrame'] == 409
    return masks


def glyph_colors(text_node, native_text):
    glyphs = native_text['glyphSequence']
    values, current = [], None
    records = list(text_node.iter('TextRecord6'))
    assert records[0].get('y') == '340'
    assert all(record.get('x') is None for record in records), \
        'authored x offset requires explicit glyph-run position model'
    assert all(record.get('y') in (None, '340') for record in records)
    for record in records:
        paint = record.find('color/Color')
        if paint is not None:
            current = [int(paint.get(v, '0')) for v in ('red', 'green', 'blue')]
        for glyph in record.findall('glyphs/TextEntry'):
            values.append((int(glyph.get('glyph')), int(glyph.get('advance')), current))
    assert len(values) == len(glyphs)
    for (index, advance, _), expected in zip(values, glyphs):
        assert (index, advance) == (expected['fontGlyphIndex'], expected['advanceTwips'])
    return values


def label_segments(root, native):
    definitions = {int(v.get('objectID')): v for v in root.iter('DefineText')}
    segments = {}
    for key, (object_id, expected_word) in LABELS.items():
        text = native['textDefinitions'][str(object_id)]
        values = glyph_colors(definitions[object_id], text)
        colored, start = [], None
        for i, (_, _, color) in enumerate(values):
            if color == [0, 0, 204] and start is None:
                start = i
            if start is not None and (color != [0, 0, 204] or i == len(values) - 1):
                stop = i if color != [0, 0, 204] else i + 1
                colored.append((start, stop, text['text'][start:stop]))
                start = None
        matches = [(a, b, value) for a, b, value in colored
                   if value.strip().casefold() == expected_word]
        assert len(matches) == 1, (key, colored)
        a, b, value = matches[0]
        while a < b and text['text'][a].isspace():
            a += 1
        while b > a and text['text'][b - 1].isspace():
            b -= 1
        assert text['text'][a:b].casefold() == expected_word
        x1 = sum(v[1] for v in values[:a])
        x2 = sum(v[1] for v in values[:b])
        segments[key] = {'sourceTextObjectId': object_id,
                         'sourceText': text['text'],
                         'sourceColoredRun': value,
                         'sourceLabel': text['text'][a:b],
                         'glyphStart': a, 'glyphEndExclusive': b,
                         'glyphCount': b - a,
                         'localGlyphAdvanceBoxTwips': {
                             'left': x1, 'right': x2,
                             'top': text['localBoundsTwips']['top'],
                             'bottom': text['localBoundsTwips']['bottom']}}
    return segments


def contains(outer, inner):
    return outer[0] <= inner[0] and outer[1] <= inner[1] and \
        outer[2] >= inner[2] and outer[3] >= inner[3]


def reveal(native, masks, segments):
    outcomes = {}
    by_key = {b['sourceKeyAttribute']: b for b in native['buttonBindings']}
    for key, segment in segments.items():
        button = by_key[key]
        button_instance = next(i for i in native['instances']
                               if i['objectId'] == button['buttonObjectId'])
        text_instance = next(i for i in native['instances']
                             if i['objectId'] == segment['sourceTextObjectId']
                             and i['firstFrame'] <= button['startFrame'])
        ready, candidate = [], []
        for frame in range(1, 410):
            br = active_run(button_instance, frame)
            tr = active_run(text_instance, frame)
            if br is None or tr is None or br['alphaNumerator'] <= 0 or tr['alphaNumerator'] <= 0:
                continue
            applicable = [(mask, active_run(mask, frame)) for mask in masks
                          if mask['depth'] < button_instance['depth'] <= mask['clipDepth']
                          and mask['depth'] < text_instance['depth'] <= mask['clipDepth']]
            if not applicable or any(run is None or run['alphaNumerator'] <= 0
                                     for _, run in applicable):
                continue
            text = native['textDefinitions'][str(segment['sourceTextObjectId'])]
            glyph_box = rect_px([ROOT, tr['matrixTwips'], text['localMatrixTwips']],
                                segment['localGlyphAdvanceBoxTwips'])
            candidate.append(frame)
            if all(contains(run['sourceStageRectPx'], glyph_box)
                   and contains(run['sourceStageRectPx'], br['sourceStageBoxPx'])
                   for _, run in applicable):
                ready.append(frame)
        ranges = []
        for frame in ready:
            if ranges and frame == ranges[-1][1] + 1:
                ranges[-1][1] = frame
            else:
                ranges.append([frame, frame])
        outcomes[key] = {'buttonObjectId': button['buttonObjectId'],
                         'sourceButtonDepth': button['depth'],
                         'sourceTextObjectId': segment['sourceTextObjectId'],
                         'sourceTextDepth': text_instance['depth'],
                         'candidateFirstFrame': candidate[0] if candidate else None,
                         'firstFullOwnLabelAndHitFrame': ready[0] if ready else None,
                         'fullOwnLabelAndHitRanges': ranges,
                         'sourceScriptSha256': button['sourceScriptPin']['sha256'],
                         'sourceTextSegment': segment}
    return outcomes


def build():
    pinned(SOURCE, SOURCE_PIN)
    native = json.loads(pinned(NATIVE, NATIVE_PIN))
    xml_bytes = subprocess.run(['swfmill', '-n', 'swf2xml', str(SOURCE), 'stdout'],
                               check=True, capture_output=True).stdout
    assert (len(xml_bytes), digest(xml_bytes)) == XML_PIN
    root = ET.fromstring(xml_bytes)
    shape = shape45(root)
    sprite = next(v for v in root.iter('DefineSprite') if v.get('objectID') == '67')
    masks = mask_instances(sprite, shape)
    assert [(x['firstFrame'], x['depth'], x['clipDepth']) for x in masks] == [
        (x['startFrame'], x['depth'], x['clipDepth'])
        for x in native['clipMaskPlacements']]
    segments = label_segments(root, native)
    outcomes = reveal(native, masks, segments)
    return {'schemaVersion': 1, 'kind': 'p038-physical-source-clip-and-label-plan-v1',
            'animationId': 'shared-alg001-l06-p038',
            'source': {'physicalSwf': {'bytes': SOURCE_PIN[0], 'sha256': SOURCE_PIN[1]},
                       'freshSwfmillXml': {'bytes': XML_PIN[0], 'sha256': XML_PIN[1]},
                       'nativeModel': {'bytes': NATIVE_PIN[0], 'sha256': NATIVE_PIN[1]}},
            'frameDomain': 'sprite-67', 'frameCount': 409,
            'sourceStage': {'width': 800, 'height': 600, 'fps': 12,
                            'rootTranslationTwips': [8248, 6466]},
            'maskShape45': {'localRectTwips': shape,
                            'sourceFillRGBA': [153, 255, 0, 176],
                            'solidRectangleGeometryVerified': True},
            'maskInstances': masks, 'glossaryReveal': outcomes,
            'revealRule': ('source text and button active with positive alpha; same active '
                           'clipDepth mask(s) include both depths; full source glyph advance '
                           'box and authored button hit box contained within each clip rect'),
            'glyphBoxConservatism': ('horizontal advances and full DefineText vertical bounds; '
                                      'browser/native font ink is not calibrated'),
            'sourceCanvasGlyphsPreserved': True,
            'canvasAlignmentCalibrated': False,
            'acceptanceEffects': {key: False for key in (
                'currentJsRegistered', 'browserVerified', 'audioAccepted',
                'originalRuntimeAccepted', 'visualFidelityAccepted',
                'humanVisualAccepted', 'ownerAccepted', 'strictComplete', 'published')}}


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ('--plan', '--write', '--check')
    mode = sys.argv[1]
    encoded = (json.dumps(build(), indent=2, ensure_ascii=False) + '\n').encode()
    if mode == '--write' and not OUT.exists():
        with OUT.open('xb') as stream:
            stream.write(encoded)
    if mode in ('--write', '--check'):
        assert pinned(OUT, (len(encoded), digest(encoded))) == encoded
    plan = json.loads(encoded)
    print(json.dumps({'mode': mode, 'bytes': len(encoded), 'sha256': digest(encoded),
                      'maskInstances': len(plan['maskInstances']),
                      'maskRuns': sum(len(x['runs']) for x in plan['maskInstances']),
                      'firstReady': {k: v['firstFullOwnLabelAndHitFrame']
                                     for k, v in plan['glossaryReveal'].items()}}, sort_keys=True))


if __name__ == '__main__':
    main()
