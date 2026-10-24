#!/usr/bin/env python3
"""Reproduce the P038 physical-source audit and public-tool exports.

The old output paths inside the frozen fact JSON are dated provenance labels.
All reads here come from the physical source and the canonical migration.
"""
import base64
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
import zlib

WORKTREE = Path(__file__).resolve().parents[1]
HERE = WORKTREE / 'migrations/shared-alg001-l06-p038/audit/source-v1'
TEMP_ROOT = WORKTREE / 'work/g678-shared-page-factory/alg-l06-p038-maintained-canvas-v1-20261001-v1'
PROVENANCE = Path('output/alg-l06-p038-source-triage-20261001-v1')
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
LESSON = SOURCE_ROOT / 'G6-G8-shared/ALG001/L6'
INDEX = LESSON / 'index.xml'
SWF = LESSON / 'IN/L6IN10.swf'
SA = LESSON / 'SA/L6IN10.mp3'
XML = HERE / 'swfmill.xml'
SCRIPTS = HERE / 'ffdec-script/scripts'
OUT = HERE / 'source-facts-v1.json'
CATALOG = WORKTREE / 'catalog/g678-shared-catalog.v1.json'
EXPECTED = {
    'index': (13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    'swf': (125928, 'bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de'),
    'sa': (152544, '86aad21a9e9dc50791bdec2ee243dcdbff05302b2f75c23564c3305ef3650fea'),
    'xml': (606070, '95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14'),
}
BUTTON_KEYS = {49: 'Table', 52: 'Output', 53: 'Input', 57: 'Equation',
               60: 'Rule', 64: 'Graph', 66: 'Function'}
SCRIPT_SHA = {
    'frame_1/DoAction.as': 'af7188282949f2613421ba9c8be629f489bbe2ee1e370a072024794b2d2cfc19',
    'frame_6/DoAction.as': '3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655',
    'DefineButton2_49/BUTTONCONDACTION on(release).as': 'ebe5121cf5eee9349a2921629ad89ffa40819e4e6ee707d9bea8a07142282dbd',
    'DefineButton2_52/BUTTONCONDACTION on(release).as': '573534c3578af9119df87b9a8e2c4751ca88e451a2e1dde1896a9ad77acd746e',
    'DefineButton2_53/BUTTONCONDACTION on(release).as': 'fc18c1b076872ddbff22a6de05a0929210cfcb8d065a27a37c654e3eb33c496a',
    'DefineButton2_57/BUTTONCONDACTION on(release).as': '0b89848d79d735127115901984f60c2c8c2996f9561d150573068e496601ed4b',
    'DefineButton2_60/BUTTONCONDACTION on(release).as': 'b9aafff389f456dd2b9b47ba56a2948163956fc001ca6ca2add0a0d55f7f9c05',
    'DefineButton2_64/BUTTONCONDACTION on(release).as': '5f789f785f961f26fba79d3dd3167089fc8251e9da0e0cff9852831b2f890788',
    'DefineButton2_66/BUTTONCONDACTION on(release).as': 'bf18a4b6722a58696805f4dd043c6b04a1b1c3cc9a605ef84301790c08bb4cfa',
}


def digest(data):
    return sha256(data).hexdigest()


def pin(path, expected=None):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns,
            before.st_ctime_ns, before.st_mode, before.st_nlink) == (
                after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
                after.st_ctime_ns, after.st_mode, after.st_nlink), path
    label = PROVENANCE / path.relative_to(HERE) if path.is_relative_to(HERE) else (
        path.relative_to(WORKTREE) if path.is_relative_to(WORKTREE) else path)
    result = {'path': str(label),
              'bytes': len(data), 'sha256': digest(data)}
    if expected is not None:
        assert (expected[0] is None or len(data) == expected[0]) and result['sha256'] == expected[1], path
    return data, result


def tags(image, start, stop):
    at = start
    result = []
    while at < stop:
        assert at + 2 <= stop
        value = struct.unpack_from('<H', image, at)[0]
        code, length = value >> 6, value & 63
        at += 2
        if length == 63:
            assert at + 4 <= stop
            length = struct.unpack_from('<I', image, at)[0]
            at += 4
        data_at = at
        at += length
        assert at <= stop
        result.append({'code': code, 'data': image[data_at:at],
                       'dataOffsetInFws': data_at})
        if code == 0:
            assert at == stop, 'trailing bytes after End'
            break
    assert at == stop and result[-1]['code'] == 0
    return result


def ranges(numbers):
    result = []
    for number in sorted(numbers):
        if result and number == result[-1][1] + 1:
            result[-1][1] = number
        else:
            result.append([number, number])
    return result


def binary_swf(data):
    assert data[:3] == b'CWS' and data[3] == 6
    image = b'FWS' + data[3:8] + zlib.decompress(data[8:])
    assert len(image) == struct.unpack_from('<I', data, 4)[0]
    rect_bits = image[8] >> 3
    frame_at = 8 + (5 + 4 * rect_bits + 7) // 8
    fps = struct.unpack_from('<H', image, frame_at)[0] / 256
    root_frames = struct.unpack_from('<H', image, frame_at + 2)[0]
    assert (fps, root_frames) == (12, 13)
    root = tags(image, frame_at + 4, len(image))
    root_counts = Counter(t['code'] for t in root)
    sprites = [t for t in root if t['code'] == 39]
    assert len(sprites) == 1
    sprite = sprites[0]
    assert struct.unpack_from('<HH', sprite['data']) == (67, 409)
    nested = tags(image, sprite['dataOffsetInFws'] + 4,
                  sprite['dataOffsetInFws'] + len(sprite['data']))
    child_counts = Counter(t['code'] for t in nested)
    assert root_counts[1] == 13 and child_counts[1] == 409
    assert root_counts[34] == 7 and child_counts[34] == 0
    assert child_counts[12] == 0 and root_counts[12] == 2
    assert root_counts[14] == child_counts[14] == 0
    assert root_counts[15] == child_counts[15] == 0
    assert root_counts[37] == child_counts[37] == 0
    buttons = {struct.unpack_from('<H', t['data'])[0]: {
        'bytes': len(t['data']), 'sha256': digest(t['data'])}
        for t in root if t['code'] == 34}
    assert set(buttons) == set(BUTTON_KEYS)
    heads = [t for t in nested if t['code'] in (18, 45)]
    assert len(heads) == 1 and heads[0]['code'] == 18
    raw_head = heads[0]['data']
    assert raw_head == bytes.fromhex('0a2a2d078906')
    frame = 1
    blocks = []
    for tag in nested:
        if tag['code'] == 1:
            frame += 1
        elif tag['code'] == 19:
            raw = tag['data']
            assert len(raw) >= 4
            samples, seek = struct.unpack_from('<Hh', raw)
            blocks.append({'frame': frame, 'rawBytes': len(raw),
                           'rawSha256': digest(raw),
                           'declaredSamples': samples, 'seekSamples': seek,
                           'payloadBytes': len(raw) - 4,
                           'payloadSha256': digest(raw[4:]),
                           'dataOffsetInFws': tag['dataOffsetInFws'],
                           '_raw': raw, '_payload': raw[4:]})
    assert frame == 410 and len(blocks) == 374
    assert len({b['frame'] for b in blocks}) == len(blocks)
    assert ranges(b['frame'] for b in blocks) == [[36, 409]]
    assert ranges(set(range(1, 410)) - {b['frame'] for b in blocks}) == [[1, 35]]
    assert sum(b['declaredSamples'] for b in blocks) == 686592
    assert sum(b['payloadBytes'] for b in blocks) == 154960
    assert [(b['frame'], b['seekSamples'], b['payloadBytes']) for b in blocks
            if b['declaredSamples'] == 0] == [(37, 0, 0)]
    return {'signature': 'CWS', 'version': 6, 'fps': fps,
            'rootFrames': root_frames, 'spriteId': 67, 'spriteFrames': 409,
            'uncompressedFws': {'bytes': len(image), 'sha256': digest(image)},
            'rootTagCodes': dict(root_counts), 'spriteTagCodes': dict(child_counts),
            'buttonRawTags': buttons,
            'streamHead': {'tagCode': 18, 'bytes': len(raw_head),
                           'sha256': digest(raw_head), 'compression': 'mp3',
                           'sampleRate': 22050, 'channels': 1,
                           'nominalSamplesPerFrame': 1837, 'latencySeekSamples': 1673},
            'blocks': blocks}


def decode_texts(xml):
    fonts = {f.get('objectID'): {'name': f.get('name'),
             'glyphs': [chr(int(g.get('map'))) for g in f.findall('glyphs/Glyph')]}
             for f in xml.iter('DefineFont2')}
    assert len(fonts) == 2
    result = []
    for item in xml.iter('DefineText'):
        font_id, text = None, ''
        for record in item.iter('TextRecord6'):
            if record.get('objectID') is not None:
                font_id = record.get('objectID')
            for glyph in record.findall('glyphs/TextEntry'):
                text += fonts[font_id]['glyphs'][int(glyph.get('glyph'))]
        result.append({'objectId': int(item.get('objectID')),
                       'text': text, 'fontId': int(font_id),
                       'fontName': fonts[font_id]['name']})
    assert len(result) == 38
    expected = {5: 'Output', 6: 'Input', 18: 'y = 2x + 1',
                29: '(-2,-3)', 38: 'y = 2x + 1', 41: 'y = 2x + 1',
                47: 'The table tells you specific',
                56: 'The equation ', 63: 'The graph shows an overall ',
                65: 'picture of the function.'}
    assert all(next(x for x in result if x['objectId'] == key)['text'] == value
               for key, value in expected.items())
    return result, [{'objectId': int(key), 'name': value['name'],
                     'glyphCount': len(value['glyphs'])}
                    for key, value in fonts.items()]


def xml_timeline(xml, binary):
    head = xml.find('Header')
    assert xml.attrib == {'version': '6', 'compressed': '1'}
    assert head.attrib == {'framerate': '12', 'frames': '13'}
    assert head.find('size/Rectangle').attrib == {
        'left': '0', 'right': '16000', 'top': '0', 'bottom': '12000'}
    assert head.find('tags/SetBackgroundColor/color/Color').attrib == {
        'red': '184', 'green': '216', 'blue': '247'}
    sprite = next(xml.iter('DefineSprite'))
    assert sprite.attrib == {'objectID': '67', 'frames': '409'}
    root_frame = 1
    root_actions, root_labels, root_places = [], [], []
    for tag in head.find('tags'):
        if tag.tag == 'ShowFrame':
            root_frame += 1
        elif tag.tag == 'DoAction':
            root_actions.append(root_frame)
        elif tag.tag == 'FrameLabel':
            root_labels.append({'frame': root_frame, 'label': tag.get('label')})
        elif tag.tag == 'PlaceObject2':
            root_places.append({'frame': root_frame, **tag.attrib,
                                'matrix': (tag.find('transform/Transform').attrib
                                           if tag.find('transform/Transform') is not None else None)})
    assert root_frame == 14 and root_actions == [1, 6]
    assert root_labels == [{'frame': 6, 'label': 'begin'}]
    animation = [p for p in root_places if p.get('objectID') == '67']
    assert len(animation) == 1 and animation[0]['frame'] == 6
    assert animation[0]['name'] == 'animation' and animation[0]['depth'] == '2'
    assert animation[0]['matrix'] == {'transX': '8248', 'transY': '6466'}
    frame, xml_blocks, button_places = 1, [], []
    live = {}
    for tag in sprite.find('tags'):
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'SoundStreamBlock':
            xml_blocks.append((frame, base64.b64decode(tag.findtext('data') or '')))
        elif tag.tag == 'PlaceObject2':
            depth = int(tag.get('depth'))
            if tag.get('objectID') is not None:
                object_id = int(tag.get('objectID'))
                live[depth] = object_id
                if object_id in BUTTON_KEYS:
                    button_places.append({'frame': frame, 'buttonObjectId': object_id,
                                          'depth': depth,
                                          'matrix': tag.find('transform/Transform').attrib})
        elif tag.tag == 'RemoveObject2':
            live.pop(int(tag.get('depth')), None)
    assert frame == 410 and len(button_places) == 7
    assert [x['frame'] for x in button_places] == [166, 207, 207, 258, 296, 322, 387]
    assert {x['buttonObjectId'] for x in button_places} == set(BUTTON_KEYS)
    assert {value for value in live.values() if value in BUTTON_KEYS} == set(BUTTON_KEYS)
    assert [(b['frame'], b['_raw']) for b in binary['blocks']] == xml_blocks
    xml_counts = Counter(t.tag for t in xml.iter())
    assert xml_counts['DefineSprite'] == 1
    assert xml_counts['DefineButton2'] == 7
    assert xml_counts['DefineText'] == 38
    assert xml_counts['SoundStreamBlock'] == 374
    assert xml_counts['DoAction'] == 2
    assert xml_counts['DefineEditText'] == xml_counts['DefineSound'] == 0
    return {'rootActions': root_actions, 'rootLabels': root_labels,
            'rootPlacements': root_places, 'buttonPlacements': button_places,
            'xmlTagCounts': {k: xml_counts[k] for k in (
                'DefineSprite', 'DefineShape', 'DefineShape2', 'DefineText',
                'DefineFont2', 'DefineButton2', 'DefineEditText', 'DefineSound',
                'SoundStreamHead', 'SoundStreamBlock', 'DoAction', 'ShowFrame',
                'PlaceObject2', 'RemoveObject2', 'FrameLabel', 'UnknownTag')}}


def scripts_and_buttons(xml):
    found = sorted(SCRIPTS.glob('**/*.as'))
    assert len(found) == 9
    script_pins = []
    for path in found:
        raw, file_pin = pin(path)
        normal = [line.strip() for line in raw.decode('utf-8').splitlines()]
        if 'DefineButton2_' in str(path):
            object_id = int(path.parent.name.split('_')[1])
            key = BUTTON_KEYS[object_id]
            assert normal == ['on(release){', f'_global.KeyAttribute = "{key}";',
                              '_root.DoHyperLinks();',
                              '_root.animation_mc.animation.stop();', '}']
        elif path.parent.name == 'frame_1':
            assert normal == ['_level0.InternalPreloader.gotoAndPlay("jump_check");', 'stop();']
        elif path.parent.name == 'frame_6':
            assert normal == ['stop();']
        else:
            raise AssertionError(f'unreviewed script {path}')
        script_pins.append(file_pin)
    buttons = []
    for button in xml.iter('DefineButton2'):
        object_id = int(button.get('objectID'))
        assert object_id in BUTTON_KEYS
        conditions = button.findall('conditions/Condition')
        assert len(conditions) == 1
        condition = conditions[0]
        assert condition.get('pointerReleaseInside') == '1' and condition.get('key') == '0'
        assert all(value == '0' for name, value in condition.attrib.items()
                   if name not in ('next', 'pointerReleaseInside'))
        strings = [item.get('value') for item in condition.findall('.//String')]
        assert all(value in strings for value in
                   ('_global', 'KeyAttribute', BUTTON_KEYS[object_id], '_root',
                    'DoHyperLinks', 'animation_mc', 'animation', 'stop'))
        buttons.append({'objectId': object_id, 'keyAttribute': BUTTON_KEYS[object_id],
                        'event': 'pointer-release-inside',
                        'sourceEffect': 'set _global.KeyAttribute; call _root.DoHyperLinks(); stop _root.animation_mc.animation',
                        'hostOutcomeVerified': False})
    assert len(buttons) == 7
    return script_pins, sorted(buttons, key=lambda b: b['objectId'])


def facts():
    swf_data, swf_pin = pin(SWF, EXPECTED['swf'])
    _, index_pin = pin(INDEX, EXPECTED['index'])
    _, sa_pin = pin(SA, EXPECTED['sa'])
    xml_data, xml_pin = pin(XML, EXPECTED['xml'])
    reexport = subprocess.run(['swfmill', '-n', 'swf2xml', str(SWF), 'stdout'],
                              check=True, capture_output=True).stdout
    assert reexport == xml_data, 'physical SWF and XML export diverge'
    index = ET.parse(INDEX).getroot()
    pages = list(index.iter('Page'))
    assert len(pages) == 60
    page = pages[37]
    assert (page.text or '').strip() == 'IN/L6IN10.swf'
    section = next((i, list(item.iter('Page')).index(page) + 1)
                   for i, item in enumerate(index.findall('Section'), 1)
                   if page in list(item.iter('Page')))
    assert section == (4, 9)
    assert page.get('Title') == 'Using Functions to Model Unit Conversion'
    assert page.get('RandomAudio') == page.get('BGText') == ''
    no_fla = not any(p.is_file() and p.name.lower() == 'l6in10.fla'
                     for p in LESSON.rglob('*'))
    assert no_fla
    catalog_data, catalog_pin = pin(CATALOG)
    catalog = json.loads(catalog_data)
    matching = []
    def walk(value):
        if isinstance(value, dict):
            if value.get('animationId') == 'shared-alg001-l06-p038':
                matching.append(value)
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)
    walk(catalog)
    assert len(matching) == 1
    entry = matching[0]
    assert (entry['xmlOccurrence'], entry['sectionNumber'], entry['sectionPageOrdinal']) == (38, 4, 9)
    assert entry['sourceSha256'] == swf_pin['sha256']
    assert entry['audioCueCandidates'][0]['sha256'] == sa_pin['sha256']
    binary = binary_swf(swf_data)
    xml = ET.fromstring(xml_data)
    timeline = xml_timeline(xml, binary)
    texts, fonts = decode_texts(xml)
    scripts, buttons = scripts_and_buttons(xml)
    blocks = binary.pop('blocks')
    payload = b''.join(block['_payload'] for block in blocks)
    for block in blocks:
        del block['_raw']
        del block['_payload']
    assert len(payload) == 154960
    return {
        'schemaVersion': 1, 'kind': 'alg-l06-p038-source-only-triage-v1',
        'animationId': 'shared-alg001-l06-p038',
        'assetId': 'swf-' + swf_pin['sha256'],
        'placement': {'xmlOccurrence': 38, 'activePageCount': 60,
                      'sectionOrdinal': 4, 'sectionPageOrdinal': 9,
                      'reference': (page.text or '').strip(),
                      'title': page.get('Title'), 'randomAudio': page.get('RandomAudio'),
                      'bgText': page.get('BGText')},
        'physicalSource': {'swf': swf_pin, 'lessonXml': index_pin,
                           'separateSA': sa_pin, 'samePathFlaPresent': False},
        'catalog': {'pin': catalog_pin, 'matches': 1,
                    'sourceStatus': entry['sourceStatus'],
                    'authoringEvidence': entry['authoringEvidence']},
        'publicToolEvidence': {'swfmillXml': xml_pin, 'physicalReexportIdentical': True,
                               'ffdecVersion': '26.2.1', 'ffdecScripts': scripts},
        'stage': {'width': 800, 'height': 600,
                  'backgroundColor': '#b8d8f7'},
        'binary': binary, 'timeline': timeline,
        'fonts': fonts, 'texts': texts, 'buttons': buttons,
        'audio': {'embeddedLogicalStreamCount': 1, 'blockCount': len(blocks),
                  'blockRanges': [[36, 409]], 'noBlockRanges': [[1, 35]],
                  'declaredSamples': sum(b['declaredSamples'] for b in blocks),
                  'mp3PayloadBytes': len(payload),
                  'mp3PayloadSha256': digest(payload),
                  'zeroSampleBlockFrames': [b['frame'] for b in blocks
                                            if b['declaredSamples'] == 0],
                  'lastBlockFrame': blocks[-1]['frame'],
                  'lastBlock': blocks[-1], 'allBlocks': blocks,
                  'separateSABinding': 'candidate-only-explicit-user-trigger; not embedded/autoplay'},
        'classification': {
            'laneRecommendation': 'interactive-understood',
            'reason': 'seven source button release handlers set distinct glossary keys, call host DoHyperLinks and stop child playback; child timeline has no local action branches or scoring',
            'lowFactoryWholePageSupported': False,
            'hostDoHyperLinksOutcomeVerified': False,
            'originalRuntimeButtonOutcomeVerified': False,
            'audioTimingVerified': False,
            'currentJavaScriptRegistrationChanged': False},
        'disposition': {'sourceOnly': True, 'implementation': False,
                        'browserPlayback': False, 'originalRuntime': False,
                        'audioListening': False, 'productAdmission': False,
                        'acceptanceEffect': 'none'},
    }


def export_source_evidence(mode):
    swf_data, _ = pin(SWF, EXPECTED['swf'])
    assert swf_data[:3] == b'CWS'
    xml_data = subprocess.run(['swfmill', '-n', 'swf2xml', str(SWF), 'stdout'],
                              check=True, capture_output=True).stdout
    assert (len(xml_data), digest(xml_data)) == EXPECTED['xml']
    if mode == '--write' and not XML.exists():
        XML.parent.mkdir(parents=True, exist_ok=True)
        with XML.open('xb') as stream:
            stream.write(xml_data)
    assert pin(XML, EXPECTED['xml'])[0] == xml_data
    TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.p038-source-script-', dir=TEMP_ROOT) as temp:
        result = subprocess.run(['ffdec', '-export', 'script', temp, str(SWF)],
                                capture_output=True, text=True)
        assert result.returncode == 0, result.stderr[:1000]
        exported = Path(temp) / 'scripts'
        found = sorted(path for path in exported.rglob('*.as') if path.is_file())
        assert len(found) == len(SCRIPT_SHA)
        assert {p.relative_to(exported).as_posix() for p in found} == set(SCRIPT_SHA)
        for path in found:
            relative = path.relative_to(exported).as_posix()
            contents = path.read_bytes()
            assert digest(contents) == SCRIPT_SHA[relative], relative
            target = SCRIPTS / relative
            if mode == '--write' and not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open('xb') as stream:
                    stream.write(contents)
            assert pin(target)[0] == contents, relative


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ('--write', '--check'), \
        'Usage: --write | --check'
    mode = sys.argv[1]
    export_source_evidence(mode)
    value = facts()
    encoded = (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()
    if mode == '--write' and not OUT.exists():
        with OUT.open('xb') as stream:
            stream.write(encoded)
    assert pin(OUT)[0] == encoded, 'source facts drift'
    print(json.dumps({'mode': mode, 'bytes': len(encoded), 'sha256': digest(encoded),
                      'spriteFrames': value['binary']['spriteFrames'],
                      'buttons': len(value['buttons']),
                      'audioBlocks': value['audio']['blockCount']}))


if __name__ == '__main__':
    main()
