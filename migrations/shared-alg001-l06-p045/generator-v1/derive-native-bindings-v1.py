#!/usr/bin/env python3
"""Derive P045 readable controls from the pinned physical SWF projection."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
MODEL = WORKSPACE/'native-v1/native-model-v2.json'
XML = WORKSPACE/'audit-v1/swfmill.xml'
HELPER = WORKSPACE/'generator-input/p041-affine-timeline-helper.py'
OUTPUT = WORKSPACE/'native-v1/native-bindings-v1.json'
PINS = {
    MODEL: '69915928cb0e08838a326e737da2847fb9020d39ceaae49890791a7e53f77814',
    XML: '64c59a7ac3b3306775c86d6e7f906906b0c99e4e17daf57c88e7ab64c28818d5',
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
    assert model['animationId'] == 'shared-alg001-l06-p045'
    assert model['quiz']['mainSpriteId'] == 350
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
    wrong = placed(350, 53, 'Mc_Wrong_Feed4')
    popup = placed(307, 22, 'Mc_Feed_Popup')
    wrong_frames = helper.timeline(sprites[307], set())['snapshots']
    popup_first_frame = next(frame for frame, snapshot in enumerate(wrong_frames, 1)
        if any(row['name'] == 'Mc_Feed_Popup' for row in snapshot.values()))
    assert popup_first_frame == 16
    text = placed(303, 1, 'txtFeed')
    close = placed(303, 1, 'BtnClose')
    assert (wrong['objectId'], popup['objectId'], text['objectId'],
            close['objectId']) == (307, 303, 302, 300)
    ancestor = helper.compose(helper.compose(root_matrix, wrong['matrixTwips']),
                              popup['matrixTwips'])
    text_matrix = helper.compose(ancestor, text['matrixTwips'])
    text_box = helper.box(model['readOnlyEditDefinitions']['302']['boundsTwips'],
                          text_matrix)
    shapes = {int(k): v for k, v in model['shapeDefinitions'].items()}
    hit_shapes, close_box = helper.button_hit_box(
        model['buttonDefinitions']['300'], close, ancestor, shapes)

    options = {}
    for row in model['quiz']['answerPlacements']:
        letter = row['label']
        assert model['staticTextDefinitions'][str(row['visibleLabelTextId'])]['text'] == letter
        options[letter] = {'instance': row['instance'], 'buttonId': row['buttonId'],
            'sourceValue': 'Graph ' + letter, 'letterTextId': row['visibleLabelTextId'],
            'hitBoxPx': row['sourceStageHitBoxPx'], 'branch': row['branch'],
            'contentKind': 'source-graph'}
    assert [(k, v['instance'], v['branch']) for k,v in options.items()] == [
        ('A','AnsBtn1','wrong4'), ('B','AnsBtn3','wrong4'),
        ('C','AnsBtn2','right4'), ('D','AnsBtn4','wrong4')]

    index = {(row['spriteId'], row['objectId']): row
             for row in model['selectedInstances']}
    glossary = {}
    terms = {138:'Function', 139:'Vertical', 140:'Point', 141:'Graph',
             142:'Vertical-line test', 143:'Line', 151:'Function', 152:'Graph', 153:'Represent'}
    for button_id, term in terms.items():
        owner = 144 if button_id <= 143 else 350
        instance = index[(owner, button_id)]
        glossary[str(button_id)] = {'term':term, 'ownerSpriteId':owner,
            'localMatrixTwips':instance['runs'][0]['matrixTwips'],
            'firstFrame':instance['firstFrame'], 'lastFrame':instance['lastFrame']}
    nmh_open = placed(350, 53, 'NMHBtn')
    nmh_close = placed(350, 53, 'CloseBtn')
    assert (nmh_open['objectId'], nmh_close['objectId']) == (145, 188)
    assert model['staticTextDefinitions']['149']['text'] == \
        'Which graph represents a function?'
    return {'kind':'p045-source-native-companion-bindings-v1',
        'animationId':'shared-alg001-l06-p045',
        'source':{'nativeModelSha256':PINS[MODEL],
                  'swfmillXmlSha256':PINS[XML],
                  'geometryHelperSha256':PINS[HELPER],
                  'physicalSwfSha256':model['source']['swf']['sha256']},
        'stage':{'width':800,'height':600}, 'quizFrame':53,
        'question':{'objectId':149,'text':model['staticTextDefinitions']['149']['text'],
                    'firstFrame':2,'lastFrame':167},
        'nmhText':[
            {'objectId':int(text_id),'text':model['staticTextDefinitions'][text_id]['text']}
            for text_id in ('134','135','136')],
        'options':options,
        'nmh':{'openButtonId':145,'closeButtonId':188,'popupSpriteId':144,
               'openMainMatrixTwips':nmh_open['matrixTwips'],
               'closeMainMatrixTwips':nmh_close['matrixTwips']},
        'wrong4':{'spriteId':307,'popupSpriteId':303,'popupFirstFrame':popup_first_frame,
                  'holdFrame':22,'editTextId':302,'closeButtonId':300,
                  'textStageBoxPx':text_box,'closeStageBoxPx':close_box,
                  'closeHitShapes':hit_shapes,
                  'textRule':{'first':'Use the vertical-line test. Try again.',
                              'second':'Use the vertical-line test.'}},
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
