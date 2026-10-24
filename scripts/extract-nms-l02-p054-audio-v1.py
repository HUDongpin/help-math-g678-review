"""Extract whole, source-bound P054 MP3 streams without splitting at silence."""

import hashlib
import json
import os
from pathlib import Path
import stat
import struct
import subprocess
import sys
import zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
SWF = SOURCE_ROOT / 'G6-G8-shared/NMS002/L2/GS/L2GS03.swf'
SWF_SHA = '06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8'
XML = Path('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5/movie.xml')
XML_SHA = '2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46'
OUTPUT = Path('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-audio-streams-v1')
EXPECTED_IDS = (194, 208, 648, 729)
EXPECTED_BLOCKS = (26, 29, 106, 105)
EXPECTED_FRAMES = ((27, 2, 27), (31, 3, 31), (121, 16, 121), (118, 14, 118))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def stable_read(file, expected_sha):
    before = file.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1, file
    assert file.resolve() == file, file
    data = file.read_bytes()
    after = file.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (
        after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), file
    assert sha(data) == expected_sha, file
    return data


def extract(swf):
    assert swf[:3] == b'CWS' and swf[3] == 6
    raw = swf[:8] + zlib.decompress(swf[8:])
    assert len(raw) == struct.unpack_from('<I', raw, 4)[0]
    rect_end = 8 + (5 + 4 * (raw[8] >> 3) + 7) // 8
    streams = {}

    def scan(start, end, domain):
        pos, frame, head, blocks = start, 1, None, []
        while pos < end:
            tag = struct.unpack_from('<H', raw, pos)[0]
            pos += 2
            code, size = tag >> 6, tag & 63
            if size == 63:
                size = struct.unpack_from('<I', raw, pos)[0]
                pos += 4
            stop = pos + size
            assert stop <= end, (domain, code)
            if code == 0:
                break
            if code == 39:
                sprite_id, _ = struct.unpack_from('<HH', raw, pos)
                scan(pos + 4, stop, sprite_id)
            elif code in (18, 45):
                assert head is None and size >= 6, domain
                flags = raw[pos + 1]
                head = {'compression': flags >> 4, 'rateCode': (flags >> 2) & 3,
                        'sampleSize': struct.unpack_from('<H', raw, pos + 2)[0],
                        'latencySeek': struct.unpack_from('<h', raw, pos + 4)[0],
                        'rawSha256': sha(raw[pos:stop])}
                assert head['compression'] == 2 and head['rateCode'] == 2, domain
            elif code == 19:
                assert head is not None and size >= 4, domain
                payload = raw[pos:stop]
                sample_count, seek = struct.unpack_from('<Hh', payload)
                blocks.append({'frame': frame, 'sampleCount': sample_count,
                               'seekSamples': seek, 'rawBytes': size,
                               'rawSha256': sha(payload), 'mp3Bytes': size - 4,
                               'mp3': payload[4:]})
            elif code == 1:
                frame += 1
            pos = stop
        if head is not None:
            assert domain not in streams and blocks, domain
            streams[domain] = {'frameCount': frame - 1, 'head': head, 'blocks': blocks}

    scan(rect_end + 4, len(raw), 'root')
    assert tuple(sorted(streams)) == EXPECTED_IDS, tuple(sorted(streams))
    assert tuple(len(streams[ident]['blocks']) for ident in EXPECTED_IDS) == EXPECTED_BLOCKS
    assert tuple((streams[ident]['frameCount'], streams[ident]['blocks'][0]['frame'],
                  streams[ident]['blocks'][-1]['frame']) for ident in EXPECTED_IDS) == EXPECTED_FRAMES
    assert all(streams[ident]['head']['latencySeek'] == 1673 for ident in EXPECTED_IDS)
    return streams


def decode(mp3):
    run = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'mp3',
                          '-i', 'pipe:0', '-ac', '1', '-ar', '22050',
                          '-f', 's16le', 'pipe:1'], input=mp3, capture_output=True,
                         check=False)
    assert run.returncode == 0 and not run.stderr and len(run.stdout) > 0
    assert len(run.stdout) % 2 == 0
    return run.stdout


def main():
    if not __debug__:
        raise RuntimeError('P054 source checks require Python assertions')
    mode = sys.argv[1] if len(sys.argv) == 2 else '--inspect'
    assert mode in ('--inspect', '--write', '--check') and len(sys.argv) <= 2
    assert os.environ.get('HELP_MATH_G678_SOURCE_ROOT') == str(SOURCE_ROOT)
    assert SOURCE_ROOT.is_dir() and not SOURCE_ROOT.is_symlink()
    swf = stable_read(SWF, SWF_SHA)
    stable_read(XML, XML_SHA)
    streams = extract(swf)
    ffmpeg_version = subprocess.check_output(['ffmpeg', '-version'], text=True).splitlines()[0]
    records, files = [], {}
    for ident in EXPECTED_IDS:
        stream = streams[ident]
        blocks = stream['blocks']
        mp3 = b''.join(block['mp3'] for block in blocks)
        pcm = decode(mp3)
        assert sum(block['sampleCount'] for block in blocks) == len(pcm) // 2, ident
        name = f'sprite-{ident}-source-stream-v1.mp3'
        files[name] = mp3
        records.append({'sourceCharacterId': ident, 'frameCount': stream['frameCount'],
                        'head': stream['head'], 'firstBlockFrame': blocks[0]['frame'],
                        'lastBlockFrame': blocks[-1]['frame'], 'blockCount': len(blocks),
                        'totalTaggedSamples': sum(block['sampleCount'] for block in blocks),
                        'emptyMp3Blocks': [block['frame'] for block in blocks if not block['mp3']],
                        'encoded': {'path': str(OUTPUT / name), 'bytes': len(mp3),
                                    'sha256': sha(mp3)},
                        'decodedPcmS16le22050Mono': {'samples': len(pcm) // 2,
                                                    'sha256': sha(pcm)},
                        'blocks': [{key: value for key, value in block.items() if key != 'mp3'}
                                   for block in blocks]})
    manifest = {'schemaVersion': 1, 'animationId': 'shared-nms002-l02-p054',
                'sourceSwf': {'path': str(SWF), 'bytes': len(swf), 'sha256': SWF_SHA},
                'sourceXml': {'path': str(XML), 'sha256': XML_SHA},
                'tool': ffmpeg_version, 'streams': records, 'audioAccepted': False,
                'originalRuntimeAccepted': False}
    manifest_bytes = (json.dumps(manifest, indent=2) + '\n').encode()
    if mode == '--write':
        OUTPUT.mkdir(exist_ok=False)
        for name, data in files.items():
            with (OUTPUT / name).open('xb') as target:
                target.write(data)
        with (OUTPUT / 'stream-manifest-v1.json').open('xb') as target:
            target.write(manifest_bytes)
    if mode == '--check':
        assert stable_read(OUTPUT / 'stream-manifest-v1.json', sha(manifest_bytes)) == manifest_bytes
        for name, data in files.items():
            assert stable_read(OUTPUT / name, sha(data)) == data
    print(json.dumps({'mode': mode, 'manifestSha256': sha(manifest_bytes),
                      'streams': [{'id': row['sourceCharacterId'], 'blocks': row['blockCount'],
                                   'mp3Bytes': row['encoded']['bytes'],
                                   'mp3Sha256': row['encoded']['sha256'],
                                   'decodedSamples': row['decodedPcmS16le22050Mono']['samples']}
                                  for row in records]}, indent=2))


if __name__ == '__main__':
    main()
