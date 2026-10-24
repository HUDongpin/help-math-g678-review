#!/usr/bin/env python3
"""Output-only P043 native text, geometry, and timeline projection.

Uses the pinned P041 affine/timeline helper. swfmill's P043 warnings remain
explicit; FFDec and physical binary checks independently support the key IDs.
"""
from collections import Counter
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
LESSON = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
SWF, INDEX = LESSON/'TI/L6TI03.swf', LESSON/'index.xml'
XML = ROOT/'output/g678-p043-source-intake-20261002-v1/audit/swfmill.xml'
HELPER = ROOT/'output/alg-l06-p041-native-source-preparation-20261001-v1/build-p041-native-model.py'
MODEL = HERE/'native-model-v1.json'
EXPECTED = {
    SWF: (855977, '8bec405895d09cc8f7dd9f0da197f67726cb45cab6cc8dec3d15b103bc04a97b'),
    INDEX: (13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    XML: (3444522, 'b4a018ccd7c0b5a9b3ef89a623210a6e3da89c59e69da69c7bd353d4cc8f6597'),
    HELPER: (None, '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'),
}


def digest(raw): return sha256(raw).hexdigest()


def checked(path):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink(), path
    raw = path.read_bytes()
    after = path.lstat()
    fields = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_mode')
    assert tuple(getattr(before, key) for key in fields) == tuple(
        getattr(after, key) for key in fields), path
    size, expected = EXPECTED[path]
    assert digest(raw) == expected and (size is None or len(raw) == size), path
    return raw, {'path': str(path), 'bytes': len(raw), 'sha256': digest(raw)}


def build():
    _, swf_pin = checked(SWF)
    _, index_pin = checked(INDEX)
    xmlraw, xml_pin = checked(XML)
    _, helper_pin = checked(HELPER)
    spec = importlib.util.spec_from_file_location('p041_source_geometry', HELPER)
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    root = ET.fromstring(xmlraw)
    assert root.attrib == {'version': '6', 'compressed': '1'}
    assert root.find('Header').attrib == {'framerate': '12', 'frames': '10'}
    counts = Counter(node.tag for node in root.iter())
    assert tuple(counts[k] for k in ('DefineFont2', 'DefineText', 'DefineEditText',
        'DefineButton2', 'DefineSprite', 'DefineMorphShape', 'DefineBitsJPEG3')) == \
        (10, 99, 4, 20, 35, 46, 14)

    fonts = {}
    for node in root.iter('DefineFont2'):
        fid = int(node.get('objectID'))
        fonts[fid] = {'name': node.get('name'),
            'glyphMap': [chr(int(g.get('map'))) for g in node.findall('glyphs/Glyph')]}
    texts = {}
    for node in root.iter('DefineText'):
        tid = int(node.get('objectID'))
        font = None
        cx = cy = height = 0
        records = []
        for record in node.iter('TextRecord6'):
            if record.get('objectID') is not None:
                font = int(record.get('objectID'))
            cx = int(record.get('x', cx))
            cy = int(record.get('y', cy))
            height = int(record.get('fontHeight', height))
            assert font in fonts
            glyphs = []
            for glyph in record.findall('glyphs/TextEntry'):
                index = int(glyph.get('glyph'))
                char = fonts[font]['glyphMap'][index]
                advance = int(glyph.get('advance'))
                glyphs.append({'unicode': char, 'xTwips': cx,
                               'advanceTwips': advance, 'fontId': font})
                cx += advance
            records.append({'fontId': font, 'fontHeightTwips': height,
                'baselineTwips': {'x': int(record.get('x', cx - sum(g['advanceTwips'] for g in glyphs))),
                                  'y': cy}, 'glyphs': glyphs})
        texts[tid] = {'objectId': tid,
            'text': ''.join(g['unicode'] for rec in records for g in rec['glyphs']),
            'boundsTwips': helper.rect(node.find('bounds/Rectangle')),
            'textMatrixTwips': helper.matrix(node.find('transform/Transform')),
            'records': records}
    assert {i: texts[i]['text'].strip() for i in (158, 160, 162, 164)} == {
        158: '$137.75', 160: '$160.52', 162: '$185.52', 164: '$580.52'}

    edits = {}
    for node in root.iter('DefineEditText'):
        eid = int(node.get('objectID'))
        edits[eid] = {'objectId': eid, 'attributes': dict(node.attrib),
            'boundsTwips': helper.rect(node.find('size/Rectangle')),
            'authoredLiteral': node.findtext('text') or '',
            'runtimeTextIsStatic': False}
    shapes = {}
    for node in root.iter():
        if node.tag not in ('DefineShape', 'DefineShape2', 'DefineShape3'):
            continue
        sid = int(node.get('objectID'))
        shapes[sid] = {'objectId': sid, 'tag': node.tag,
            'boundsTwips': helper.rect(node.find('bounds/Rectangle')),
            'sourceXmlSha256': digest(ET.tostring(node, encoding='utf-8'))}
    assert len(shapes) == 114
    morphs = {int(n.get('objectID')): digest(ET.tostring(n, encoding='utf-8'))
        for n in root.iter('DefineMorphShape')}
    jpegs = {int(n.get('objectID')): digest(ET.tostring(n, encoding='utf-8'))
        for n in root.iter('DefineBitsJPEG3')}
    buttons = {}
    for node in root.iter('DefineButton2'):
        bid = int(node.get('objectID'))
        records = []
        for record in node.findall('buttons/Button'):
            if record.get('objectID') is None:
                continue
            records.append({'objectId': int(record.get('objectID')),
                'depth': int(record.get('depth')),
                'hitTest': record.get('hitTest') == '1',
                'matrixTwips': helper.matrix(record.find('transform/Transform'))})
        buttons[bid] = {'objectId': bid, 'records': records,
            'hitRecords': [row for row in records if row['hitTest']]}
    assert len(buttons) == 20

    frame = 1
    root_places = []
    for tag in root.find('Header/tags'):
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'PlaceObject2':
            root_places.append({'frame': frame, 'attributes': dict(tag.attrib),
                'matrixTwips': helper.matrix(tag.find('transform/Transform'))})
    assert frame == 11 and len(root_places) == 2
    main = next(row for row in root_places if row['attributes'].get('name') == 'animation')
    assert main['frame'] == 6 and main['attributes']['objectID'] == '342'
    root_matrix = main['matrixTwips']
    selected = set(texts) | set(edits) | set(shapes) | set(buttons) | set(morphs) | set(jpegs)
    frame_labels = []
    domains = {}
    for sprite in root.iter('DefineSprite'):
        sid = int(sprite.get('objectID'))
        child_tags = sprite.find('tags')
        for tag in list(child_tags):
            if tag.tag == 'FrameLabel':
                assert sid == 11 and tag.get('label') == 'Symbol_36'
                frame_labels.append({'spriteId': sid, 'attributes': dict(tag.attrib)})
                child_tags.remove(tag)
        domains[sid] = helper.timeline(sprite, selected)
    assert len(domains) == 35 and domains[342]['frameCount'] == 241
    instances = [row for domain in domains.values()
        for row in helper.compress_selected(domain)]
    quiz = domains[342]['snapshots'][61]
    choices = []
    for label, instance, button_id, text_id in [
        ('A', 'AnsBtn1', 165, 158), ('B', 'AnsBtn2', 166, 160),
        ('C', 'AnsBtn3', 165, 162), ('D', 'AnsBtn4', 165, 164)]:
        matches = [(depth, row) for depth, row in quiz.items() if row['name'] == instance]
        assert len(matches) == 1 and matches[0][1]['objectId'] == button_id
        depth, placement = matches[0]
        hit_shapes, hit_box = helper.button_hit_box(buttons[button_id], placement,
            root_matrix, shapes)
        candidate = []
        for text_depth, other in quiz.items():
            text = texts.get(other['objectId'])
            if not text:
                continue
            box = helper.box(text['boundsTwips'],
                helper.compose(root_matrix, other['matrixTwips']))
            overlap = helper.overlap_of_text(box, hit_box)
            if overlap >= 0.5:
                candidate.append({'textId': other['objectId'], 'text': text['text'],
                                  'overlap': overlap, 'depth': text_depth})
        # Physical text and button placement must support the ordered mapping.
        assert any(row['textId'] == text_id for row in candidate), (label, candidate)
        choices.append({'label': label, 'instance': instance, 'buttonId': button_id,
            'textId': text_id, 'text': texts[text_id]['text'],
            'branch': 'right4' if button_id == 166 else 'wrong4',
            'buttonDepth': depth, 'hitShapes': hit_shapes,
            'sourceStageHitBoxPx': hit_box, 'overlapCandidates': candidate,
            'browserHitParityAccepted': False})
    masks = []
    for sid, domain in domains.items():
        for number, snapshot in enumerate(domain['snapshots'], 1):
            for depth, placement in snapshot.items():
                if placement['clipDepth'] is not None:
                    masks.append({'spriteId': sid, 'frame': number,
                        'shapeId': placement['objectId'], 'depth': depth,
                        'clipDepth': placement['clipDepth']})
    result = {'schemaVersion': 1, 'kind': 'p043-output-only-native-source-model-v1',
        'animationId': 'shared-alg001-l06-p043',
        'status': 'source-projection-unregistered',
        'source': {'swf': swf_pin, 'lessonXml': index_pin, 'swfmillXml': xml_pin,
            'reusedP041Helper': helper_pin,
            'swfmillWarning': 'physical source produced UnknownTag/EOF warnings; FFDec and binary checks used as independent evidence'},
        'stage': {'width': 800, 'height': 600, 'fps': 12},
        'root': {'frames': 10, 'placements': root_places, 'animationSpriteId': 342,
            'animationPlacementMatrixTwips': root_matrix},
        'fontDefinitions': {str(k): v for k, v in sorted(fonts.items())},
        'staticTextDefinitions': {str(k): v for k, v in sorted(texts.items())},
        'readOnlyEditDefinitions': {str(k): v for k, v in sorted(edits.items())},
        'shapeDefinitions': {str(k): v for k, v in sorted(shapes.items())},
        'morphInventory': {str(k): v for k, v in sorted(morphs.items())},
        'jpegInventory': {str(k): v for k, v in sorted(jpegs.items())},
        'buttonDefinitions': {str(k): v for k, v in sorted(buttons.items())},
        'spriteFrameCounts': {str(k): v['frameCount'] for k, v in sorted(domains.items())},
        'frameLabels': frame_labels,
        'selectedInstances': instances,
        'quiz': {'mainSpriteId': 342, 'holdFrame': 62, 'answerPlacements': choices,
            'sourceStageLabelBindingAccepted': True, 'browserHitParityAccepted': False},
        'clipMasks': {'sourcePlacements': masks, 'canvasMaskImplemented': False},
        'projectionProof': {'spriteFramesChecked': sum(d['frameCount'] for d in domains.values()),
            'sourcePlacementEvents': 2 + sum(d['tagCounts'].get('PlaceObject2', 0) for d in domains.values()),
            'sourceRemoveEvents': sum(d['tagCounts'].get('RemoveObject2', 0) for d in domains.values()),
            'mappedGlyphs': sum(len(rec['glyphs']) for text in texts.values() for rec in text['records'])},
        'gates': {'nativeRendererReady': False, 'currentJsRegistered': False,
            'browserVerified': False, 'fidelityAccepted': False, 'audioAccepted': False,
            'humanAccepted': False, 'ownerAccepted': False, 'strictComplete': False,
            'published': False}}
    return (json.dumps(result, indent=2, ensure_ascii=False)+'\n').encode(), result


def main():
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('usage: --write | --check')
    raw, result = build()
    if sys.argv[1:] == ['--write']:
        with MODEL.open('xb') as output:
            output.write(raw)
    assert MODEL.read_bytes() == raw, 'model drift'
    print(json.dumps({'mode': sys.argv[1], 'modelSha256': digest(raw),
        'modelBytes': len(raw), 'staticText': len(result['staticTextDefinitions']),
        'spriteFrames': result['projectionProof']['spriteFramesChecked'],
        'answerOverlaps': [len(row['overlapCandidates']) for row in result['quiz']['answerPlacements']]},
        sort_keys=True))


if __name__ == '__main__':
    main()
