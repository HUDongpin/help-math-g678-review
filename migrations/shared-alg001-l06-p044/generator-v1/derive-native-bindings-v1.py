#!/usr/bin/env python3
"""Derive P044 readable controls from the pinned physical SWF projection."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
MODEL = WORKSPACE/'native-v1/native-model-v1.json'
XML = WORKSPACE/'audit-v1/swfmill.xml'
HELPER = WORKSPACE/'generator-input/p041-affine-timeline-helper.py'
OUTPUT = WORKSPACE/'native-v1/native-bindings-v1.json'
PINS = {
    MODEL: '1858dced6c07862f2f06d98946aabda464c5da6fe5ee90d2d4dc14a22d6979e5',
    XML: 'ce05e719bf0f9bd94160da8aef16221ebe72e597d007f237626d524c366aea01',
    HELPER: '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906',
}


def digest(raw): return hashlib.sha256(raw).hexdigest()


def checked(path):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1
    raw = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns,
            before.st_ctime_ns) == (after.st_dev, after.st_ino, after.st_size,
            after.st_mtime_ns, after.st_ctime_ns)
    assert digest(raw) == PINS[path], path
    return raw


def build():
    model = json.loads(checked(MODEL))
    xml = checked(XML)
    checked(HELPER)
    assert model['animationId'] == 'shared-alg001-l06-p044'
    assert model['quiz']['mainSpriteId'] == 354
    assert model['quiz']['holdFrame'] == 53
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
    wrong = placed(354, 53, 'Mc_Wrong_Feed4')
    popup = placed(336, 20, 'Mc_Feed_Popup')
    text = placed(333, 1, 'txtFeed')
    close = placed(333, 1, 'BtnClose')
    assert (wrong['objectId'], popup['objectId'], text['objectId'],
            close['objectId']) == (336, 333, 332, 331)
    ancestor = helper.compose(helper.compose(root_matrix, wrong['matrixTwips']),
                              popup['matrixTwips'])
    text_matrix = helper.compose(ancestor, text['matrixTwips'])
    text_box = helper.box(model['readOnlyEditDefinitions']['332']['boundsTwips'],
                          text_matrix)
    shapes = {int(k): v for k, v in model['shapeDefinitions'].items()}
    hit_shapes, close_box = helper.button_hit_box(
        model['buttonDefinitions']['331'], close, ancestor, shapes)

    options = {}
    expected = {
        'A': ('{(0, –1), (0, 0), (0, 1)}', 'wrong4'),
        'B': ('{(5, 1), (10, 1), (15, 1)}', 'right4'),
        'C': ('{(2, –2), (2, 0), (–2, 0)}', 'wrong4'),
        'D': ('{(–5, –4), (–4, –3), (–5, –1)}', 'wrong4'),
    }
    for row in model['quiz']['answerPlacements']:
        letter = row['label']
        letter_item = next(item for item in row['overlapCandidates']
                           if item['text'].strip() == letter)
        value_item = next(item for item in row['overlapCandidates']
                          if item['textId'] == row['textId'])
        options[letter] = {'instance': row['instance'], 'buttonId': row['buttonId'],
            'sourceValue': value_item['text'].strip(),
            'letterTextId': letter_item['textId'], 'valueTextId': value_item['textId'],
            'hitBoxPx': row['sourceStageHitBoxPx'], 'branch': row['branch']}
    assert {k: (v['sourceValue'], v['branch']) for k, v in options.items()} == expected

    index = {(row['spriteId'], row['objectId']): row
             for row in model['selectedInstances']}
    glossary = {}
    terms = {137:'Relation', 138:'Set', 139:'Ordered pair',
             140:'X-coordinate', 141:'Function', 149:'Function', 150:'Relation'}
    for button_id, term in terms.items():
        owner = 142 if button_id <= 141 else 354
        instance = index[(owner, button_id)]
        glossary[str(button_id)] = {'term':term, 'ownerSpriteId':owner,
            'localMatrixTwips':instance['runs'][0]['matrixTwips'],
            'firstFrame':instance['firstFrame'], 'lastFrame':instance['lastFrame']}
    nmh_open = placed(354, 53, 'NMHBtn')
    nmh_close = placed(354, 53, 'CloseBtn')
    assert (nmh_open['objectId'], nmh_close['objectId']) == (143, 172)
    assert model['staticTextDefinitions']['147']['text'] == \
        'Choose the relation that is a function.'
    return {'kind':'p044-source-native-companion-bindings-v1',
        'animationId':'shared-alg001-l06-p044',
        'source':{'nativeModelSha256':PINS[MODEL],
                  'swfmillXmlSha256':PINS[XML],
                  'geometryHelperSha256':PINS[HELPER],
                  'physicalSwfSha256':model['source']['swf']['sha256']},
        'stage':{'width':800,'height':600}, 'quizFrame':53,
        'question':{'objectId':147,'text':model['staticTextDefinitions']['147']['text'],
                    'firstFrame':2,'lastFrame':275},
        'nmhText':[
            {'objectId':int(text_id),'text':model['staticTextDefinitions'][text_id]['text']}
            for text_id in ('133','134','135')],
        'options':options,
        'nmh':{'openButtonId':143,'closeButtonId':172,'popupSpriteId':142,
               'openMainMatrixTwips':nmh_open['matrixTwips'],
               'closeMainMatrixTwips':nmh_close['matrixTwips']},
        'wrong4':{'spriteId':336,'popupSpriteId':333,'popupFirstFrame':13,
                  'holdFrame':20,'editTextId':332,'closeButtonId':331,
                  'textStageBoxPx':text_box,'closeStageBoxPx':close_box,
                  'closeHitShapes':hit_shapes,
                  'textRule':{'first':'All the x-coordinates must be different in a function. Try again.',
                              'second':'All the x-coordinates must be different in a function.'}},
        'glossary':glossary,
        'claims':{'browserPlacementCalibrated':False,'nativeTextSourceBound':True,
                  'sourceStageGeometryComputed':True}}


def main():
    if sys.argv[1:] not in (['--write'],['--check']):
        raise SystemExit('usage: --write | --check')
    raw = (json.dumps(build(),indent=2,ensure_ascii=False)+'\n').encode()
    if sys.argv[1:] == ['--write']:
        with OUTPUT.open('xb') as stream: stream.write(raw)
    else:
        assert OUTPUT.read_bytes() == raw, 'binding drift'
    print(json.dumps({'mode':sys.argv[1], 'bytes':len(raw),'sha256':digest(raw)}))


if __name__ == '__main__': main()
