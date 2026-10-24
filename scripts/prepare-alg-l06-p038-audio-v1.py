#!/usr/bin/env python3
"""Regenerate P038 source MP3 bytes and every-frame stream schedule."""
import base64
from hashlib import sha256
import json
from pathlib import Path
import struct
import sys
import xml.etree.ElementTree as ET
import zlib

WORKTREE = Path(__file__).resolve().parents[1]
HERE = WORKTREE / 'migrations/shared-alg001-l06-p038/audio-source-v1'
LESSON = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
SWF = LESSON / 'IN/L6IN10.swf'
INDEX = LESSON / 'index.xml'
SA = LESSON / 'SA/L6IN10.mp3'
TRIAGE_DIR = WORKTREE / 'migrations/shared-alg001-l06-p038/audit/source-v1'
PROVENANCE_DIR = WORKTREE / 'output/alg-l06-p038-source-triage-20261001-v1'
FACTS = TRIAGE_DIR / 'source-facts-v1.json'
XML = TRIAGE_DIR / 'swfmill.xml'
MAIN = HERE / 'main-source-v1.mp3'
SEPARATE_SA = HERE / 'separate-sa-source-v1.mp3'
LEDGER = HERE / 'main-frame-block-schedule-v1.json'
PLAN = HERE / 'source-audio-plan-v1.json'
EXPECTED = {
    'swf': (125928, 'bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de'),
    'index': (13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    'sa': (152544, '86aad21a9e9dc50791bdec2ee243dcdbff05302b2f75c23564c3305ef3650fea'),
    'facts': (155064, 'e6df1089aaa9274d1eb3b9771d39e5e3d8cf54c6761050eff0acc00fa9a3f04e'),
    'xml': (606070, '95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14'),
}


def digest(data):
    return sha256(data).hexdigest()


def encode(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()


def read_pinned(path, expected=None):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns,
            before.st_ctime_ns, before.st_mode, before.st_nlink) == (
                after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
                after.st_ctime_ns, after.st_mode, after.st_nlink), path
    label = PROVENANCE_DIR / path.name if path in (FACTS, XML) else path
    result = {'path': str(label), 'bytes': len(data), 'sha256': digest(data)}
    if expected is not None:
        size, sha = expected
        assert len(data) == size and result['sha256'] == sha, path
    return data, result


def tags(image, start, stop):
    at = start
    while at < stop:
        tag_at = at
        assert at + 2 <= stop, 'truncated tag header'
        word = struct.unpack_from('<H', image, at)[0]
        code, size = word >> 6, word & 63
        at += 2
        if size == 63:
            assert at + 4 <= stop
            size = struct.unpack_from('<I', image, at)[0]
            at += 4
        data_at = at
        at += size
        assert tag_at < at <= stop
        yield {'code': code, 'tagOffset': tag_at, 'dataOffset': data_at,
               'endOffset': at, 'data': image[data_at:at]}
        if code == 0:
            assert at == stop, 'trailing bytes after End tag'
            break
    assert at == stop


def source_stream(swf):
    assert swf[:3] == b'CWS' and swf[3] == 6
    image = b'FWS' + swf[3:8] + zlib.decompress(swf[8:])
    assert len(image) == struct.unpack_from('<I', swf, 4)[0]
    assert (len(image), digest(image)) == (
        178349, '20b25c416d4ebe925e41f53a0a53fc0013b898ed293a73aaffb49049e446f3d8')
    rect_bits = image[8] >> 3
    frame_at = 8 + (5 + 4 * rect_bits + 7) // 8
    fps = struct.unpack_from('<H', image, frame_at)[0] / 256
    root_frames = struct.unpack_from('<H', image, frame_at + 2)[0]
    assert (fps, root_frames) == (12, 13)
    root = list(tags(image, frame_at + 4, len(image)))
    assert sum(t['code'] == 1 for t in root) == 13
    sprites = [t for t in root if t['code'] == 39]
    assert len(sprites) == 1
    sprite = sprites[0]
    assert struct.unpack_from('<HH', sprite['data']) == (67, 409)
    nested = list(tags(image, sprite['dataOffset'] + 4, sprite['endOffset']))
    assert sum(t['code'] == 1 for t in nested) == 409
    assert not any(t['code'] in (12, 14, 15, 37) for t in nested), \
        'unreviewed action or discrete sound in sprite'
    headers = [t for t in nested if t['code'] in (18, 45)]
    assert len(headers) == 1 and headers[0]['code'] == 18
    raw_head = headers[0]['data']
    assert raw_head == bytes.fromhex('0a2a2d078906')
    nominal, latency = struct.unpack_from('<Hh', raw_head, 2)
    assert (nominal, latency) == (1837, 1673)
    head = {'tagCode': 18,
            'tagOffsetInUncompressedFws': headers[0]['tagOffset'],
            'dataOffsetInUncompressedFws': headers[0]['dataOffset'],
            'rawBytes': len(raw_head), 'rawSha256': digest(raw_head),
            'compression': 'mp3', 'sampleRate': 22050, 'channels': 1,
            'nominalSamplesPerFrame': nominal, 'latencySeekSamples': latency}
    frame, blocks = 1, []
    for tag in nested:
        if tag['code'] == 1:
            frame += 1
        elif tag['code'] == 19:
            raw = tag['data']
            assert len(raw) >= 4
            samples, signed_seek = struct.unpack_from('<Hh', raw)
            blocks.append({'frame': frame, 'samples': samples, 'seek': signed_seek,
                           'raw': raw, 'payload': raw[4:], 'tag': tag})
    assert frame == 410 and len(blocks) == 374
    assert [b['frame'] for b in blocks] == list(range(36, 410))
    assert sum(b['samples'] for b in blocks) == 686592
    assert sum(len(b['payload']) for b in blocks) == 154960
    assert [(b['frame'], b['samples'], b['seek'], len(b['payload'])) for b in blocks
            if b['samples'] == 0] == [(37, 0, 0, 0)]
    return image, head, blocks


def corroborate(xml_bytes, blocks):
    xml = ET.fromstring(xml_bytes)
    assert xml.attrib == {'version': '6', 'compressed': '1'}
    sprites = [x for x in xml.iter('DefineSprite') if x.get('objectID') == '67']
    assert len(sprites) == 1 and sprites[0].get('frames') == '409'
    frame, xml_blocks, heads = 1, [], []
    for tag in sprites[0].find('tags'):
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'SoundStreamHead':
            heads.append(tag)
        elif tag.tag == 'SoundStreamBlock':
            xml_blocks.append((frame, base64.b64decode((tag.findtext('data') or '').strip())))
    assert frame == 410 and len(heads) == 1 and len(xml_blocks) == len(blocks)
    assert heads[0].get('compression') == '2' and heads[0].get('soundRate') == '2'
    assert heads[0].get('soundStereo') == '0' and heads[0].get('sampleSize') == '1837'
    assert [(b['frame'], b['raw']) for b in blocks] == xml_blocks


def match_facts(facts, blocks, swf_pin, index_pin, sa_pin, xml_pin):
    assert facts['animationId'] == 'shared-alg001-l06-p038'
    assert facts['placement']['xmlOccurrence'] == 38
    assert facts['physicalSource']['swf'] == swf_pin
    assert facts['physicalSource']['lessonXml'] == index_pin
    assert facts['physicalSource']['separateSA'] == sa_pin
    prior_xml = facts['publicToolEvidence']['swfmillXml']
    assert (WORKTREE / prior_xml['path']) == PROVENANCE_DIR / 'swfmill.xml'
    assert (prior_xml['bytes'], prior_xml['sha256']) == (
        xml_pin['bytes'], xml_pin['sha256'])
    assert facts['binary']['spriteId'] == 67 and facts['binary']['spriteFrames'] == 409
    assert facts['audio']['blockCount'] == len(blocks)
    assert facts['audio']['blockRanges'] == [[36, 409]]
    assert facts['audio']['noBlockRanges'] == [[1, 35]]
    assert facts['audio']['zeroSampleBlockFrames'] == [37]
    assert len(facts['audio']['allBlocks']) == len(blocks)
    for source, block in zip(facts['audio']['allBlocks'], blocks):
        assert source == {
            'frame': block['frame'], 'rawBytes': len(block['raw']),
            'rawSha256': digest(block['raw']), 'declaredSamples': block['samples'],
            'seekSamples': block['seek'], 'payloadBytes': len(block['payload']),
            'payloadSha256': digest(block['payload']),
            'dataOffsetInFws': block['tag']['dataOffset']}


def schedule(blocks, swf_pin, facts_pin, image, head):
    cursor = payload_at = 0
    rows = []
    by_frame = {b['frame']: b for b in blocks}
    for frame in range(1, 410):
        block = by_frame.get(frame)
        row = {'frame': frame, 'visualTickStart': frame - 1,
               'visualTickEnd': frame, 'blockPresent': block is not None,
               'declaredSampleStart': cursor}
        if block is None:
            row.update({'declaredSamplesInBlock': None, 'seekSamples': None,
                        'rawBlockBytes': None, 'rawBlockSha256': None,
                        'mp3PayloadBytes': None, 'mp3PayloadSha256': None,
                        'mp3PayloadOffset': None,
                        'tagOffsetInUncompressedFws': None,
                        'dataOffsetInUncompressedFws': None,
                        'compressedCwsOffset': None})
        else:
            tag = block['tag']
            row.update({'declaredSamplesInBlock': block['samples'],
                        'seekSamples': block['seek'], 'rawBlockBytes': len(block['raw']),
                        'rawBlockSha256': digest(block['raw']),
                        'mp3PayloadBytes': len(block['payload']),
                        'mp3PayloadSha256': digest(block['payload']),
                        'mp3PayloadOffset': payload_at,
                        'tagOffsetInUncompressedFws': tag['tagOffset'],
                        'dataOffsetInUncompressedFws': tag['dataOffset'],
                        'compressedCwsOffset': None})
            cursor += block['samples']
            payload_at += len(block['payload'])
        row['declaredSampleEnd'] = cursor
        rows.append(row)
    assert cursor == 686592 and payload_at == 154960
    return {'schemaVersion': 1, 'kind': 'p038-source-frame-block-ledger-v1',
            'physicalSwf': swf_pin, 'priorSourceFacts': facts_pin,
            'uncompressedFws': {'bytes': len(image), 'sha256': digest(image),
                                'representation': 'decompressed-byte-image'},
            'frameDomain': 'sprite-67', 'fps': 12, 'sourceVisualFrames': 409,
            'streamHeader': head, 'blockCount': 374,
            'declaredSamples': cursor, 'mp3PayloadBytes': payload_at,
            'blockRanges': [[36, 409]], 'absentBlockRanges': [[1, 35]],
            'offsetConvention': 'FWS offsets index only the decompressed SWF image. CWS compressed byte offsets have no one-to-one mapping. MP3 payload offsets index concatenated source block payloads; no silence or padding is inserted.',
            'frames': rows}


def derive():
    swf, swf_pin = read_pinned(SWF, EXPECTED['swf'])
    _, index_pin = read_pinned(INDEX, EXPECTED['index'])
    sa, sa_pin = read_pinned(SA, EXPECTED['sa'])
    facts_bytes, facts_pin = read_pinned(FACTS, EXPECTED['facts'])
    xml, xml_pin = read_pinned(XML, EXPECTED['xml'])
    facts = json.loads(facts_bytes)
    image, head, blocks = source_stream(swf)
    corroborate(xml, blocks)
    match_facts(facts, blocks, swf_pin, index_pin, sa_pin, xml_pin)
    main = b''.join(b['payload'] for b in blocks)
    assert (len(main), digest(main)) == (
        154960, '524ae7aa2cc1cb5f85bfe076b785a92c4d29470afdc813e577d93335408ff6fa')
    ledger = schedule(blocks, swf_pin, facts_pin, image, head)
    ledger_bytes = encode(ledger)
    plan = {'schemaVersion': 1, 'kind': 'p038-source-direct-audio-preparation-v1',
            'status': 'technical-source-bytes-only', 'animationId': facts['animationId'],
            'physicalSwf': swf_pin, 'physicalLessonXml': index_pin,
            'priorSourceFacts': facts_pin, 'priorSwfmillXml': xml_pin,
            'uncompressedFws': ledger['uncompressedFws'],
            'frameDomain': 'sprite-67', 'sourceVisualFrames': 409, 'fps': 12,
            'streamHeader': head, 'blockCount': 374,
            'blockRanges': [[36, 409]], 'absentBlockRanges': [[1, 35]],
            'zeroSampleBlockFrames': [37], 'declaredSampleCount': 686592,
            'main': {'asset': {'path': MAIN.name, 'bytes': len(main),
                               'sha256': digest(main)},
                     'schedule': {'path': LEDGER.name, 'bytes': len(ledger_bytes),
                                  'sha256': digest(ledger_bytes)},
                     'continuousCompressedPayload': True, 'insertedBytes': 0,
                     'browserPcmBinding': None, 'nativeEofObserved': False},
            'separateSA': {'physicalSource': sa_pin,
                           'asset': {'path': SEPARATE_SA.name, 'bytes': len(sa),
                                     'sha256': digest(sa)},
                           'binding': 'optional-explicit-user-trigger-only',
                           'localeAutoplay': False, 'joinedWithMain': False,
                           'languageAndOriginalTriggerVerified': False},
            'claimBoundary': {'noBlockMeansAudibleSilence': None,
                              'noBlockMeansPlaybackPause': None,
                              'seekSamplesAppliedToPcm': False,
                              'sourceToBrowserAlignmentAccepted': False,
                              'browserDecodeObserved': False,
                              'originalRuntimeObserved': False,
                              'listeningAccepted': False,
                              'productRegistration': False,
                              'acceptanceEffect': 'none'}}
    return {MAIN: main, SEPARATE_SA: sa, LEDGER: ledger_bytes, PLAN: encode(plan)}


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ('--plan', '--write', '--check'), \
        'Usage: --plan | --write | --check'
    mode = sys.argv[1]
    outputs = derive()
    for path, data in outputs.items():
        assert path.parent == HERE and not path.is_symlink()
        if mode == '--write' and not path.exists():
            with path.open('xb') as stream:
                stream.write(data)
        if mode in ('--write', '--check'):
            actual, _ = read_pinned(path)
            assert actual == data, f'output drift: {path}'
    print(json.dumps({'mode': mode,
                      'outputs': {p.name: {'bytes': len(d), 'sha256': digest(d)}
                                  for p, d in outputs.items()},
                      'sourceBlocks': 374, 'sourceFrames': 409}, sort_keys=True))


if __name__ == '__main__':
    main()
