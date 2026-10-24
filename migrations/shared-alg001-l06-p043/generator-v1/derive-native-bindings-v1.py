#!/usr/bin/env python3
"""Derive P043 output-only native UI geometry from pinned source projection."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
sys.dont_write_bytecode = True
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
ROOT = HERE.parents[2]
MODEL = WORKSPACE/'regenerated-v1/native/native-model-v1.json'
XML = WORKSPACE/'audit-v1/swfmill.xml'
HELPER = WORKSPACE/'generator-input/p041-affine-timeline-helper.py'
OUTPUT = WORKSPACE/'regenerated-v1/native/native-bindings-v1.json'
PINS = {MODEL: '762333e5e6eb6a346801f98c9b8c322425397ec35819d000b1be7a4d5003c92d',
        XML: 'b4a018ccd7c0b5a9b3ef89a623210a6e3da89c59e69da69c7bd353d4cc8f6597',
        HELPER: '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'}


def digest(raw): return hashlib.sha256(raw).hexdigest()


def checked(file):
    before = file.lstat()
    assert file.is_file() and not file.is_symlink()
    raw = file.read_bytes()
    after = file.lstat()
    assert before.st_nlink == 1 and (before.st_dev, before.st_ino, before.st_size,
        before.st_mtime_ns, before.st_ctime_ns) == (after.st_dev, after.st_ino,
        after.st_size, after.st_mtime_ns, after.st_ctime_ns)
    assert digest(raw) == PINS[file], file
    return raw


def build():
    model = json.loads(checked(MODEL))
    xml = checked(XML)
    checked(HELPER)
    assert model['animationId'] == 'shared-alg001-l06-p043'
    assert model['quiz']['holdFrame'] == 62
    spec = importlib.util.spec_from_file_location('p041_geometry', HELPER)
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    root = ET.fromstring(xml)
    sprites = {int(s.get('objectID')): s for s in root.iter('DefineSprite')}

    def placed(sprite_id, frame, name):
        snapshot = helper.timeline(sprites[sprite_id], set())['snapshots'][frame-1]
        matches = [row for row in snapshot.values() if row['name'] == name]
        assert len(matches) == 1, (sprite_id, frame, name)
        return matches[0]

    root_matrix = model['root']['animationPlacementMatrixTwips']
    wrong = placed(342, 62, 'Mc_Wrong_Feed4')
    popup = placed(307, 23, 'Mc_Feed_Popup')
    text = placed(304, 1, 'txtFeed')
    close = placed(304, 1, 'BtnClose')
    assert (wrong['objectId'], popup['objectId'], text['objectId'],
            close['objectId']) == (307, 304, 303, 301)
    ancestor = helper.compose(helper.compose(root_matrix, wrong['matrixTwips']),
                              popup['matrixTwips'])
    text_matrix = helper.compose(ancestor, text['matrixTwips'])
    text_box = helper.box(model['readOnlyEditDefinitions']['303']['boundsTwips'],
                          text_matrix)
    shapes = {int(k): v for k, v in model['shapeDefinitions'].items()}
    hit_shapes, close_box = helper.button_hit_box(
        model['buttonDefinitions']['301'], close, ancestor, shapes)
    assert text_box == [132.9107, 152.7558, 636.0093, 189.4037]
    assert close_box == [551.1764, 122.6336, 644.9363, 151.8684]
    options = {}
    for row in model['quiz']['answerPlacements']:
        letter = row['label']
        letter_item = next(item for item in row['overlapCandidates']
            if item['text'].strip() == letter)
        value_item = next(item for item in row['overlapCandidates']
            if item['textId'] == row['textId'])
        options[letter] = {'instance': row['instance'], 'buttonId': row['buttonId'],
            'sourceValue': value_item['text'].strip(),
            'letterTextId': letter_item['textId'],
            'valueTextId': value_item['textId'],
            'hitBoxPx': row['sourceStageHitBoxPx'], 'branch': row['branch']}
    assert {k: (v['sourceValue'], v['branch']) for k, v in options.items()} == {
        'A': ('$137.75', 'wrong4'), 'B': ('$160.52', 'right4'),
        'C': ('$185.52', 'wrong4'), 'D': ('$580.52', 'wrong4')}
    index = {(row['spriteId'], row['objectId']): row
        for row in model['selectedInstances']}
    glossary = {}
    terms = {136: 'Input', 137: 'Substitute', 138: 'Equation',
        142: 'Simplify', 143: 'Expression', 144: 'Calculate',
        145: 'Output', 155: 'Function', 156: 'Estimate',
        338: 'Output', 339: 'Function'}
    for button_id, term in terms.items():
        owner = 146 if button_id in {136, 137, 138, 142, 143, 144, 145} else 342
        instance = index[(owner, button_id)]
        glossary[str(button_id)] = {'term': term, 'ownerSpriteId': owner,
            'localMatrixTwips': instance['runs'][0]['matrixTwips'],
            'firstFrame': instance['firstFrame'], 'lastFrame': instance['lastFrame']}
    nmh_open = placed(342, 62, 'NMHBtn')
    nmh_close = placed(342, 62, 'CloseBtn')
    assert nmh_open['objectId'] == 147 and nmh_close['objectId'] == 176
    return {'kind': 'p043-output-only-native-companion-bindings-v1',
        'animationId': 'shared-alg001-l06-p043',
        'source': {'nativeModelSha256': PINS[MODEL], 'swfmillXmlSha256': PINS[XML],
            'geometryHelperSha256': PINS[HELPER],
            'physicalSwfSha256': model['source']['swf']['sha256']},
        'stage': {'width': 800, 'height': 600}, 'quizFrame': 62,
        'options': options,
        'nmh': {'openButtonId': 147, 'closeButtonId': 176, 'popupSpriteId': 146,
            'openMainMatrixTwips': nmh_open['matrixTwips'],
            'closeMainMatrixTwips': nmh_close['matrixTwips']},
        'wrong4': {'spriteId': 307, 'popupSpriteId': 304,
            'popupFirstFrame': 16, 'holdFrame': 23, 'editTextId': 303,
            'closeButtonId': 301, 'textStageBoxPx': text_box,
            'closeStageBoxPx': close_box, 'closeHitShapes': hit_shapes,
            'textRule': {'first': 'Substitute 23 for C in the equation. Try again.',
                'second': 'Substitute 23 for C in the equation.'}},
        'glossary': glossary,
        'claims': {'browserPlacementCalibrated': False,
            'nativeTextSourceBound': True, 'sourceStageGeometryComputed': True}}


def main():
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('usage: --write | --check')
    raw = (json.dumps(build(), indent=2, ensure_ascii=False)+'\n').encode()
    if sys.argv[1:] == ['--write']:
        with OUTPUT.open('xb') as output:
            output.write(raw)
    else:
        assert OUTPUT.read_bytes() == raw, 'binding drift'
    print(json.dumps({'mode': sys.argv[1], 'bytes': len(raw),
                      'sha256': digest(raw)}))


if __name__ == '__main__': main()
