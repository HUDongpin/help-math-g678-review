#!/usr/bin/env python3
"""Reproduce P029's source-only timelines and MP3 streams from preserved SWF bytes."""
import base64
import hashlib
import json
import struct
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB22.swf')
SWF_SHA = 'cbfd012d0aff11544a252c9e2852dff30d408c634aa2a805eb0837933c3370d4'
XML = HERE / 'source-structure.xml'
FFDEC_XML = HERE / 'ffdec-structure.xml'
SUMMARY = HERE / 'source-display-list-v1.json'
STREAM_DIR = HERE / 'embedded-streams'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def spans(numbers):
    result = []
    for number in numbers:
        if result and result[-1][1] == number - 1:
            result[-1][1] = number
        else:
            result.append([number, number])
    return result


def timeline(tags, declared_frames, kinds):
    frame = 1
    active = {}
    generation = {}
    snapshots = {}
    changes = []
    labels = []
    action_frames = []
    stream_blocks = []
    stream_head = None
    for tag in tags:
        if tag.tag == 'ShowFrame':
            snapshots[frame] = {depth: dict(item) for depth, item in active.items()}
            frame += 1
        elif tag.tag == 'FrameLabel':
            labels.append({'frame': frame, 'label': tag.get('label')})
        elif tag.tag == 'DoAction':
            action_frames.append(frame)
        elif tag.tag == 'SoundStreamHead':
            stream_head = dict(tag.attrib)
        elif tag.tag == 'SoundStreamBlock':
            data = base64.b64decode(tag.findtext('./data'))
            if stream_head is None:
                raise ValueError('sound block without stream header')
            if stream_head['compression'] == '2':
                samples, seek = struct.unpack_from('<Hh', data)
                stream_blocks.append({'frame': frame, 'samples': samples, 'seek': seek,
                                      'rawBytes': len(data), 'payload': data[4:]})
            elif stream_head['compression'] == '1':
                stream_blocks.append({'frame': frame, 'samples': None, 'seek': None,
                                      'rawBytes': len(data), 'payload': data})
            else:
                raise ValueError(f'unsupported stream compression {stream_head["compression"]}')
        elif tag.tag == 'PlaceObject2':
            depth = int(tag.get('depth'))
            old = active.get(depth)
            object_id = tag.get('objectID')
            if object_id is None:
                if old is None:
                    raise ValueError(f'modify absent depth {depth} at frame {frame}')
                state = dict(old)
            else:
                generation[depth] = generation.get(depth, 0) + 1
                state = {'objectId': int(object_id), 'generation': generation[depth],
                         'name': tag.get('name'), 'placedFrame': frame, 'clipDepth': None,
                         'transform': None, 'alpha': 256, 'morphRatio': None}
            transform = tag.find('./transform/Transform')
            if transform is not None:
                state['transform'] = dict(transform.attrib)
            color = tag.find('./colorTransform/ColorTransform2')
            if color is not None:
                state['alpha'] = int(color.get('factorAlpha', '256'))
            if tag.get('clipDepth') is not None:
                state['clipDepth'] = int(tag.get('clipDepth'))
            if tag.get('morph') is not None:
                state['morphRatio'] = int(tag.get('morph'))
            active[depth] = state
            changes.append({'frame': frame, 'kind': 'place', 'depth': depth,
                            'objectId': state['objectId'], 'newCharacter': object_id is not None,
                            'name': state['name'], 'transform': dict(transform.attrib) if transform is not None else None,
                            'alpha': state['alpha'], 'clipDepth': state['clipDepth'],
                            'morphRatio': state['morphRatio']})
        elif tag.tag == 'RemoveObject2':
            depth = int(tag.get('depth'))
            prior = active.pop(depth, None)
            changes.append({'frame': frame, 'kind': 'remove', 'depth': depth,
                            'objectId': prior['objectId'] if prior else None})
    if frame != declared_frames + 1:
        raise ValueError(f'actual frame count {frame-1} differs from declaration {declared_frames}')
    instances = {}
    for frame_number, snapshot in snapshots.items():
        for depth, state in snapshot.items():
            key = f'depth-{depth}/generation-{state["generation"]}'
            row = instances.setdefault(key, {'instanceId': key, 'depth': depth,
                'objectId': state['objectId'], 'name': state['name'],
                'placedFrame': state['placedFrame'], 'clipDepth': state['clipDepth'],
                'presentFrames': [], 'visibleFrames': [], 'firstVisibleTransform': None})
            row['presentFrames'].append(frame_number)
            if state['alpha'] > 0:
                row['visibleFrames'].append(frame_number)
                if row['firstVisibleTransform'] is None:
                    row['firstVisibleTransform'] = state['transform']
    for row in instances.values():
        row['presentSpans'] = spans(row.pop('presentFrames'))
        row['visibleSpans'] = spans(row.pop('visibleFrames'))
        row['kind'] = kinds.get(row['objectId'], 'other')
    stream = b''.join(block['payload'] for block in stream_blocks)
    audio = None
    if stream_head is not None:
        is_mp3 = stream_head['compression'] == '2'
        audio = {'head': stream_head, 'codec': 'mp3' if is_mp3 else 'swf-adpcm',
                 'blockCount': len(stream_blocks),
                 'firstFrame': stream_blocks[0]['frame'] if stream_blocks else None,
                 'lastFrame': stream_blocks[-1]['frame'] if stream_blocks else None,
                 'declaredSamples': sum(block['samples'] for block in stream_blocks) if is_mp3 else None,
                 'payloadBytes': len(stream), 'payloadSha256': sha(stream),
                 'zeroSampleBlocks': [{k: b[k] for k in ('frame', 'samples', 'seek', 'rawBytes')}
                                      for b in stream_blocks if b['samples'] == 0],
                 'negativeSeekBlocks': [{k: b[k] for k in ('frame', 'samples', 'seek', 'rawBytes')}
                                        for b in stream_blocks if b['seek'] is not None and b['seek'] < 0],
                 'blockSchedule': [{k: b[k] for k in ('frame', 'samples', 'seek', 'rawBytes')}
                                   for b in stream_blocks]}
    return {'frameCount': declared_frames, 'labels': labels, 'actionFrames': action_frames,
            'instances': list(instances.values()), 'changes': changes,
            'tagCounts': dict(Counter(tag.tag for tag in tags)), 'audio': audio}, stream


def export_files(folder, suffix):
    rows = []
    for file in sorted(folder.rglob('*')):
        if file.is_file() and (suffix is None or file.suffix == suffix):
            data = file.read_bytes()
            row = {'path': file.relative_to(HERE).as_posix(), 'bytes': len(data), 'sha256': sha(data)}
            if suffix in ('.as', '.txt'):
                row['text'] = data.decode('utf-8').replace('\r\n', '\n')
            rows.append(row)
    return rows


def build():
    source = SOURCE.read_bytes()
    if len(source) != 567027 or sha(source) != SWF_SHA:
        raise ValueError('physical P029 SWF drift')
    xml_bytes = XML.read_bytes()
    parsed = ET.fromstring(xml_bytes)
    header = parsed.find('Header')
    tags = header.find('tags')
    ffdec_bytes = FFDEC_XML.read_bytes()
    ffdec = ET.fromstring(ffdec_bytes)
    normalized_ffdec = Counter(t.get('type', '').removesuffix('Tag') for t in ffdec.find('tags'))
    swfmill_counts = Counter(tag.tag for tag in tags)
    normalized_ffdec['UnknownTag'] = normalized_ffdec.pop('Protect', 0)
    if {k: v for k, v in swfmill_counts.items() if k != 'End'} != normalized_ffdec:
        raise ValueError('swfmill and FFDec root tag inventories disagree')
    for sprite in tags.findall('DefineSprite'):
        sid = sprite.get('objectID')
        matching = [item for item in ffdec.find('tags')
                    if item.get('type') == 'DefineSpriteTag' and item.get('spriteId') == sid]
        if len(matching) != 1 or matching[0].get('frameCount') != sprite.get('frames'):
            raise ValueError(f'swfmill and FFDec sprite {sid} frame domains disagree')
        left = Counter(item.tag for item in sprite.find('tags') if item.tag != 'End')
        right = Counter(item.get('type', '').removesuffix('Tag') for item in matching[0].find('subTags'))
        if left != right:
            raise ValueError(f'swfmill and FFDec sprite {sid} tag inventories disagree')
    kinds = {}
    for tag in tags:
        if tag.tag.startswith('Define') and tag.tag != 'DefineFontName' and tag.get('objectID') is not None:
            kind = ('button' if tag.tag == 'DefineButton2' else
                    'sprite' if tag.tag == 'DefineSprite' else
                    'text' if tag.tag in ('DefineText', 'DefineEditText') else
                    'morph' if tag.tag == 'DefineMorphShape' else
                    'shape' if tag.tag.startswith('DefineShape') else
                    'bitmap' if tag.tag.startswith('DefineBits') else 'other')
            kinds[int(tag.get('objectID'))] = kind
    root, _ = timeline(tags, int(header.get('frames')), kinds)
    sprites = {}
    streams = {}
    for tag in tags.findall('DefineSprite'):
        sprite_id = int(tag.get('objectID'))
        result, stream = timeline(tag.find('tags'), int(tag.get('frames')), kinds)
        sprites[str(sprite_id)] = result
        if result['audio'] is not None:
            streams[sprite_id] = stream
    buttons = []
    for button in tags.findall('DefineButton2'):
        buttons.append({'id': int(button.get('objectID')),
            'events': [dict(item.attrib) for item in button.find('conditions')],
            'records': [dict(item.attrib) for item in button.find('buttons')]})
    summary = {'schemaVersion': 1, 'kind': 'alg-l06-p029-swf-structure-summary-v1',
        'sourceSwfSha256': SWF_SHA, 'sourceXmlSha256': sha(xml_bytes),
        'ffdecXmlSha256': sha(ffdec_bytes),
        'header': {'signature': source[:3].decode('ascii'), 'version': int(parsed.get('version')),
                   'fps': int(header.get('framerate')), 'rootFrames': int(header.get('frames')),
                   'stageTwips': {k: int(v) for k, v in header.find('./size/Rectangle').attrib.items()},
                   'backgroundRgb': [int(tags.find('./SetBackgroundColor/color/Color').get(k))
                                     for k in ('red', 'green', 'blue')]},
        'root': root, 'sprites': sprites, 'tagCounts': dict(swfmill_counts),
        'definitionKinds': {str(k): v for k, v in kinds.items()},
        'buttonDefinitions': buttons,
        'fonts': [{'id': int(t.get('objectID')), 'name': t.get('name'),
                   'glyphCount': len(t.findall('./glyphs/Glyph'))}
                  for t in tags.findall('DefineFont2')],
        'editTexts': [{'id': int(t.get('objectID')), 'name': t.get('variableName'),
                       'initialText': t.findtext('initialText'), 'attributes': dict(t.attrib)}
                      for t in tags.findall('DefineEditText')],
        'morphShapeIds': [int(t.get('objectID')) for t in tags.findall('DefineMorphShape')],
        'scripts': export_files(HERE / 'source-export/scripts', '.as'),
        'texts': export_files(HERE / 'source-export/texts', '.txt'),
        'resourceFiles': export_files(HERE / 'source-export', None)}
    if (root['frameCount'] != 10 or len(sprites) != 14 or len(buttons) != 7 or
        len(summary['morphShapeIds']) != 48 or len(streams) != 8):
        raise ValueError('P029 structure contract changed; review before regeneration')
    return summary, streams


if __name__ == '__main__':
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('use --write or --check')
    summary, streams = build()
    data = (json.dumps(summary, ensure_ascii=False, indent=2) + '\n').encode()
    expected = {STREAM_DIR / (f'sprite-{k}.mp3' if summary['sprites'][str(k)]['audio']['codec'] == 'mp3'
                              else f'sprite-{k}.swf-adpcm-blocks.bin'): v for k, v in streams.items()}
    expected[SUMMARY] = data
    if sys.argv[1] == '--write':
        if any(path.exists() for path in expected):
            raise SystemExit('refuse to overwrite an existing P029 extraction')
        STREAM_DIR.mkdir(exist_ok=True)
        for path, payload in expected.items():
            path.write_bytes(payload)
    elif any(not path.is_file() or path.read_bytes() != payload for path, payload in expected.items()):
        raise SystemExit('P029 extraction drift')
    print(json.dumps({'mode': sys.argv[1], 'summarySha256': sha(data),
                      'spriteCount': len(summary['sprites']), 'streamCount': len(streams),
                      'streamBytes': sum(len(s) for s in streams.values())}))
