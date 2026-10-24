#!/usr/bin/env python3
"""Recover P043's three reachable SWF MP3 streams into output-only files.

The frame/sample fields are source metadata. Playback alignment and listening
remain unverified. The separate SA MP3 is pinned, never mixed or copied here.
"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import sys
import zlib

HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
LESSON = WORKSPACE/'source-v1'
SWF, INDEX, SA = LESSON/'TI/L6TI03.swf', LESSON/'index.xml', LESSON/'SA/L6TI03.mp3'
RECEIPT = WORKSPACE/'regenerated-v1/audio/source-audio-v1.json'
FILES = {342: 'sprite-342-main.mp3', 307: 'sprite-307-wrong4.mp3',
         202: 'sprite-202-right4.mp3'}
SPECS = {342: ('main', 241, 230, 62),
         307: ('wrong4', 29, 28, 23),
         202: ('right4', 31, 30, None)}
PINS = {
    SWF: (855977, '8bec405895d09cc8f7dd9f0da197f67726cb45cab6cc8dec3d15b103bc04a97b'),
    INDEX: (13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    SA: (151200, 'dfd986d3c9d1615b2456c5a9b5ebc2d24ab3b5d22f1b1d6f20df9aa886fcadf1'),
}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def checked(path):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink(), path
    raw = path.read_bytes()
    after = path.lstat()
    fields = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_mode')
    assert tuple(getattr(before, key) for key in fields) == tuple(
        getattr(after, key) for key in fields), path
    row = {'path': str(path), 'bytes': len(raw), 'sha256': digest(raw)}
    if path in PINS:
        assert (row['bytes'], row['sha256']) == PINS[path], path
    return raw, row


def tags(image, start, end, allow_trailing=False):
    at = start
    while at < end:
        offset = at
        assert at + 2 <= end
        word = struct.unpack_from('<H', image, at)[0]
        code, size = word >> 6, word & 63
        at += 2
        if size == 63:
            assert at + 4 <= end
            size = struct.unpack_from('<I', image, at)[0]
            at += 4
        data_at = at
        at += size
        assert offset < at <= end
        yield code, offset, data_at, image[data_at:at]
        if code == 0:
            if not allow_trailing:
                assert at == end
            break
    if not allow_trailing:
        assert at == end


def physical_sprites(raw):
    assert raw[:3] == b'CWS' and raw[3] == 6
    image = b'FWS' + raw[3:8] + zlib.decompress(raw[8:])
    assert len(image) == struct.unpack_from('<I', raw, 4)[0] == 988972
    rect_bits = image[8] >> 3
    frame_at = 8 + (5 + 4*rect_bits + 7)//8
    assert struct.unpack_from('<H', image, frame_at)[0]/256 == 12
    assert struct.unpack_from('<H', image, frame_at + 2)[0] == 10
    sprites = {}
    for code, _, data_at, data in tags(image, frame_at + 4, len(image)):
        if code != 39:
            continue
        sprite_id, frames = struct.unpack_from('<HH', data)
        if sprite_id in SPECS:
            assert sprite_id not in sprites
            children = list(tags(image, data_at + 4, data_at + len(data),
                                 allow_trailing=sprite_id == 202))
            assert children[-1][0] == 0
            if sprite_id == 202:
                # Physical right4 DefineSprite carries non-tag bytes after End.
                # Pin, disclose, and never interpret these as another stream block.
                after_end = children[-1][1] + 2
                trailing = image[after_end:data_at + len(data)]
                assert len(trailing) == 386
                assert digest(trailing) == 'd14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0'
            assert sum(row[0] == 1 for row in children) == frames
            sprites[sprite_id] = (frames, children)
    assert set(sprites) == set(SPECS)
    return image, sprites


def stream(sprite_id, source):
    role, expected_frames, expected_blocks, hold_frame = SPECS[sprite_id]
    frames, children = source
    assert frames == expected_frames
    frame, heads, blocks = 1, [], []
    for code, offset, data_at, data in children:
        if code == 1:
            frame += 1
        elif code in (18, 45):
            heads.append((code, offset, data))
        elif code == 19:
            assert len(data) >= 4
            declared, seek = struct.unpack_from('<Hh', data)
            blocks.append({'frame': frame, 'declaredSamples': declared,
                           'seekSamples': seek, 'rawSha256': digest(data),
                           'rawBytes': len(data), 'mp3PayloadSha256': digest(data[4:]),
                           'mp3PayloadBytes': len(data)-4,
                           'tagOffsetInUncompressedFws': offset,
                           'dataOffsetInUncompressedFws': data_at,
                           '_payload': data[4:]})
    assert frame == frames + 1
    assert len(heads) == 1 and heads[0][0] == 18
    assert heads[0][2] == bytes.fromhex('0a2a2d078906')
    assert len(blocks) == expected_blocks
    assert len({row['frame'] for row in blocks}) == len(blocks)
    payload = b''.join(row.pop('_payload') for row in blocks)
    offsets = 0
    for row in blocks:
        row['mp3PayloadOffset'] = offsets
        offsets += row['mp3PayloadBytes']
    assert len(payload) == offsets
    return payload, {'spriteId': sprite_id, 'role': role, 'frames': frames,
        'fps': 12, 'holdFrame': hold_frame,
        'holdFrameHasBlock': any(row['frame'] == hold_frame for row in blocks) if hold_frame else None,
        'soundStreamHead': {'tagOffsetInUncompressedFws': heads[0][1],
                            'rawSha256': digest(heads[0][2]),
                            'compression': 'mp3', 'sampleRateHz': 22050,
                            'channels': 1, 'nominalSamplesPerFrame': 1837},
        'blockCount': len(blocks), 'declaredSampleCount': sum(row['declaredSamples'] for row in blocks),
        'mp3PayloadBytes': len(payload), 'mp3PayloadSha256': digest(payload),
        'frameBlocks': blocks}


def sa_metadata():
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration,bit_rate:stream=codec_name,sample_rate,channels',
        '-of', 'json', str(SA)], capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def build(mode):
    raw, swf_pin = checked(SWF)
    _, index_pin = checked(INDEX)
    _, sa_pin = checked(SA)
    image, sprites = physical_sprites(raw)
    result = []
    for sprite_id in (342, 307, 202):
        payload, row = stream(sprite_id, sprites[sprite_id])
        target = WORKSPACE/'regenerated-v1/audio/streams'/FILES[sprite_id]
        if mode == '--write':
            with target.open('xb') as output:
                output.write(payload)
        assert target.read_bytes() == payload, target
        row['file'] = checked(target)[1]
        result.append(row)
    receipt = {'schemaVersion': 1,
        'kind': 'p043-output-only-reachable-source-streams-v1',
        'status': 'source-bytes-only-no-playback-or-listening',
        'animationId': 'shared-alg001-l06-p043',
        'physicalSource': swf_pin, 'lessonXml': index_pin,
        'uncompressedFws': {'bytes': len(image), 'sha256': digest(image)},
        'offsetConvention': 'FWS offsets are in decompressed SWF. MP3 offsets are local to one concatenated sprite payload.',
        'timelineConvention': 'One-indexed source frames at 12fps; declared samples and seek are raw SoundStreamBlock fields, not verified playback timing.',
        'streams': result,
        'separateSa': {'file': sa_pin, 'technicalMetadata': sa_metadata(),
            'mixedWithEmbeddedStreams': False, 'userTriggeredOnly': True,
            'contentAndListeningAccepted': False},
        'parserWarning': {'spriteId': 202, 'trailingBytesAfterEnd': 386,
            'trailingSha256': 'd14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0',
            'interpretation': 'unclassified physical bytes; excluded from tag and audio payload extraction'},
        'gates': {'browserDecoded': False, 'sourceFrameAlignmentAccepted': False,
            'audioListeningAccepted': False, 'currentJsRegistered': False}}
    if mode == '--write':
        with RECEIPT.open('x') as output:
            json.dump(receipt, output, indent=2)
            output.write('\n')
    else:
        assert json.loads(RECEIPT.read_text()) == receipt, 'receipt drift'
    print(json.dumps({'mode': mode, 'receipt': checked(RECEIPT)[1],
        'streams': [{'spriteId': row['spriteId'], 'blocks': row['blockCount'],
                     'mp3': row['file']['sha256']} for row in result]}, sort_keys=True))


if __name__ == '__main__':
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('usage: --write | --check')
    build(sys.argv[1])
