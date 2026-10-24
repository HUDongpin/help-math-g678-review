from pathlib import Path
import base64
import datetime
import hashlib
import json
import struct
import xml.etree.ElementTree as E
import zlib

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'migrations/shared-alg001-l07-p006/audit-v1/alg-l01-p002-p004-compatibility-v1'
CONFIG = {
    2: {'mainId': 224, 'frames': 1317,
        'title': 'Interpreting Graphs: Real World Activity',
        'roles': ['Walking story', 'Maria seven-day miles table', 'Corresponding bar graph'],
        'sourceData': {'Monday': 6.8, 'Tuesday': 4, 'Wednesday': 4.6, 'Thursday': 7.5,
                       'Friday': 4.2, 'Saturday': 6, 'Sunday': 5.2},
        'review': 'FFDec selected frame300 shows street/walking character, frame800 shows the seven-row table next to bars, final1317 shows residual graph axes. Native labels and table/graph associations require page-specific visibility recovery.'},
    3: {'mainId': 1768, 'frames': 1117,
        'title': 'Graphing in the Coordinate Plane: Real World Activity',
        'roles': ['Narrative cartoon characters and scene', 'Source title states coordinate-plane real-world activity'],
        'sourceData': None,
        'review': 'Only the root title is DefineText; no main semantic text is extractable. Selected frames200/600/1000 show one/two cartoon characters in a landscape; final1117 shows landscape alone. These snapshots do not establish a table/math-label role or the narration meaning. Do not invent native graph labels from the title.'},
    4: {'mainId': 223, 'frames': 982,
        'title': 'Interpreting Graphs: Real World Activity',
        'roles': ['Walking story', 'Maria 28-day miles line graph'],
        'sourceData': {'xRole': 'Days', 'xLabels': list(range(1, 29)), 'yRole': 'Miles',
                       'yLabels': list(range(0, 9)), 'exact28DayValues': 'Not recovered by this structural intake'},
        'review': 'FFDec selected frames400/800 show walking characters/landscape. Final982 shows characters beside a red line graph. Last30 visual frames have no stream blocks. Exact labels, progressive graph path and alpha gates require own source/onscreen adaptation.'}
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pin(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'bytes': len(data), 'sha256': sha(data)}


def scan(raw, start):
    pos = start
    while pos < len(raw):
        head = struct.unpack_from('<H', raw, pos)[0]
        pos += 2
        code, size = head >> 6, head & 63
        if size == 63:
            size = struct.unpack_from('<I', raw, pos)[0]
            pos += 4
        data = raw[pos:pos + size]
        assert len(data) == size
        pos += size
        yield code, data
        if code == 0:
            break


identities = json.loads((BASE / 'source-identity-v1.json').read_text())
registry_path = ROOT / 'packages/demos/private-current-js-registry.json'
registry = json.loads(registry_path.read_text())
pages = []
for identity in identities['pages']:
    key = identity['animationId']
    ordinal = int(key[-3:])
    config = CONFIG[ordinal]
    directory = BASE / key[-4:]
    source = ROOT / identity['readOnlyCopy']
    original = Path(identity['path'])
    swf_bytes = source.read_bytes()
    assert len(swf_bytes) == identity['bytes']
    assert sha(swf_bytes) == identity['sha256'] == sha(original.read_bytes())
    assert not (ROOT / 'migrations' / key).exists()
    membership = [c['calibrationId'] for c in registry['calibrations']
                  if any(entry['key'] == key for entry in c['entries'])]
    assert membership == []
    header = E.parse(directory / 'movie.xml').find('Header')
    assert header.get('framerate') == '12' and header.get('frames') == '10'
    body = zlib.decompress(swf_bytes[8:])
    assert len(body) + 8 == struct.unpack('<I', swf_bytes[4:8])[0]
    rect_bits = body[0] >> 3
    start = (5 + 4 * rect_bits + 7) // 8 + 4
    binary_sprites = {struct.unpack_from('<H', data)[0]: data
                      for code, data in scan(body, start) if code == 39}
    main = header.find(f'tags/DefineSprite[@objectID="{config["mainId"]}"]')
    assert int(main.get('frames')) == config['frames']
    tags = main.find('tags')
    stream = tags.find('SoundStreamHead')
    assert stream is not None and stream.get('compression') == '2'
    assert stream.get('soundRate') == '2' and stream.get('soundStereo') == '0'
    assert int(stream.get('sampleSize')) == 1837
    assert sum(sprite.find('tags/SoundStreamHead') is not None for sprite in header.findall('tags/DefineSprite')) == 1
    assert len(header.findall('tags/DefineButton')) + len(header.findall('tags/DefineButton2')) == 0
    assert not header.findall('tags/DefineEditText')
    frame, before = 1, 0
    blocks, payload, action_frames, clips = [], [], [], []
    for tag in tags:
        if tag.tag == 'SoundStreamBlock':
            raw = base64.b64decode(tag.find('data').text)
            count, seek = struct.unpack('<Hh', raw[:4])
            blocks.append({'frame': frame, 'samples': count, 'seek': seek,
                           'samplesBefore': before, 'targetSample': before + seek,
                           'mp3Bytes': len(raw) - 4})
            before += count
            payload.append(raw[4:])
        if tag.tag == 'DoAction':
            action_frames.append(frame)
        if tag.tag == 'PlaceObject2' and tag.get('clipDepth') is not None:
            clips.append({'frame': frame, **tag.attrib})
        if tag.tag == 'ShowFrame':
            frame += 1
    assert frame - 1 == config['frames']
    binary_blocks = [data for code, data in scan(binary_sprites[config['mainId']], 4) if code == 19]
    assert [(struct.unpack('<Hh', data[:4]), data[4:]) for data in binary_blocks] == [
        ((block['samples'], block['seek']), audio) for block, audio in zip(blocks, payload)]
    scripts = [{'file': pin(path), 'source': path.read_text()}
               for path in sorted((directory / 'ffdec/scripts').rglob('*.as'))]
    main_scripts = [script for script in scripts if f'/DefineSprite_{config["mainId"]}/' in script['file']['path']]
    nonempty_main = [script for script in main_scripts if script['source'].strip()]
    assert len(nonempty_main) == 1 and nonempty_main[0]['source'].strip() == 'stop();'
    assert f'/frame_{config["frames"]}/' in nonempty_main[0]['file']['path']
    assert len(scripts) == len(main_scripts) + 2
    texts = [{'file': pin(path), 'source': path.read_text()}
             for path in sorted((directory / 'ffdec/texts').rglob('*.txt'))]
    assert any(text['source'].strip() == config['title'] for text in texts)
    positive = [block for block in blocks if block['samples'] > 0]
    first = positive[0]['frame']
    runs, physical_residuals = [], []
    for block in positive:
        residual = block['targetSample'] - (block['frame'] - first) * 1837
        physical_residuals.append(block['targetSample'] - (block['frame'] - first) * 22050 / 12)
        if not runs or runs[-1]['sourceResidualSamples'] != residual:
            if runs:
                runs[-1]['endDecodedSample'] = block['samplesBefore']
            runs.append({'firstFrame': block['frame'], 'lastPositiveFrame': block['frame'],
                         'firstDecodedSample': block['targetSample'], 'sourceResidualSamples': residual})
        else:
            runs[-1]['lastPositiveFrame'] = block['frame']
    runs[-1]['endDecodedSample'] = before
    assert [run['firstFrame'] for run in runs] == [1, 3]
    source_mp3 = b''.join(payload)
    source_images = [pin(path) for path in sorted((directory / 'ffdec-selected-frames-v1').rglob('*.png'))]
    assert len(source_images) == (4 if ordinal == 3 else 3)
    external_audio = []
    for candidate in identity['catalog']['audioCueCandidates']:
        audio_path = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware') / candidate['viewPath']
        audio = audio_path.read_bytes()
        assert len(audio) == candidate['bytes'] and sha(audio) == candidate['sha256']
        external_audio.append({'path': str(audio_path), 'bytes': len(audio), 'sha256': sha(audio),
                               'hostTrigger': 'unverified external lesson-SA candidate; no locale autoplay/mixing inferred',
                               'language': 'Not determined by this structural audit'})
    pages.append({'identity': identity, 'currentRegistryMembership': membership,
                  'root': {'frames': 10, 'fps': 12, 'entryFrame': 6, 'mainInstanceName': 'Animation',
                           'stage': {'width': 800, 'height': 600}},
                  'main': {'id': config['mainId'], 'frames': config['frames'], 'actionFrames': action_frames,
                           'nonemptyAction': nonempty_main, 'playback': 'Stops at the exact final frame; no source loop after normal playback',
                           'buttons': 0, 'glossaryHandlers': 0, 'sourceMaskPlacements': clips},
                  'stream': {'sampleRate': 22050, 'channels': 1, 'sourceSampleSize': 1837,
                             'physicalSamplesPerFrame': 1837.5,
                             'latencySeek': struct.unpack('<h', base64.b64decode(stream.find('latencySeek/data').text))[0],
                             'blockCount': len(blocks), 'firstBlockFrame': blocks[0]['frame'],
                             'lastBlockFrame': blocks[-1]['frame'], 'lastPositiveFrame': positive[-1]['frame'],
                             'declaredSamples': before, 'assembledMp3Bytes': len(source_mp3),
                             'assembledMp3Sha256': sha(source_mp3), 'sourceCoordinateRunCandidates': runs,
                             'emptyBlocks': [block for block in blocks if block['samples'] == 0],
                             'absentBlockFrames': [f for f in range(1, frame) if f not in {b['frame'] for b in blocks}],
                             'physicalRateResidualRangeSamples': {'min': min(physical_residuals), 'max': max(physical_residuals)},
                             'binaryXmlSamplesSeekAndPayloadEquivalent': True,
                             'runInterpretation': 'Exact source sampleSize1837 groups only; own native PCM and scheduling correspondence still required'},
                  'teachingRoles': config, 'sourceScripts': scripts, 'sourceTexts': texts,
                  'externalLessonSaCandidate': external_audio,
                  'selectedSourceFrameReview': {'reviewed': True, 'tool': 'FFDec26.2.1 selected sprites toPNG',
                                              'images': source_images, 'evidence': 'Static public-tool source visualization only; not a browser/Flash-original/semantic acceptance matrix'},
                  'sourceEvidence': [pin(directory / name) for name in ['movie.xml', 'extraction-receipt-v1.json',
                                     'swfmill-v1.txt', 'ffdec-assets-v1.txt', 'selected-frames-extraction-v1.json', 'ffdec-selected-frames-v1.txt']],
                  'sourceSnapshotStillUnchanged': sha(original.read_bytes()) == identity['sha256'],
                  'nativePcmMeasured': False, 'clockPlanAccepted': False, 'modernMyLessonMeasured': False,
                  'originalRuntimeMeasured': False, 'bilingualMainSemanticAcceptance': False,
                  'productOrRegistryModified': False, 'newCurrentJsPlacements': 0})

report = {'schemaVersion': 1, 'kind': 'alg-l01-p002-p004-read-only-compatibility-intake',
          'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'scope': 'Exact source intake under P006 audit area; no canonical scaffold, product implementation, shared host, registry or batch selection',
          'identityReceipt': pin(BASE / 'source-identity-v1.json'), 'registrySnapshot': pin(registry_path),
          'producer': pin(Path(__file__)), 'pages': pages,
          'structuralComparison': 'All three have final stop, root10/main12fps, no buttons, one22050mono stream and two source-coordinate runs1/3. This is source structure compatibility only.',
          'pageDifferences': 'P002 seven-day table/bar graph; P003 cartoon narrative with only root title available as native text; P00428-day line graph with30 silent visual tail frames. Each teaching-role mapping remains page-owned.',
          'batchSelected': False, 'currentJsAdded': 0,
          'nextGate': 'P002/P003 L7 real My Lesson pair must finish before parent chooses any <=3 L1 cohort. Source metadata alone does not admit the cohort.'}
(BASE / 'compatibility-v1.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps([{'page': page['identity']['animationId'], 'main': page['main']['id'],
                   'frames': page['main']['frames'], 'stopFrame': page['main']['frames'],
                   'rate': page['stream']['sampleRate'], 'blockCount': page['stream']['blockCount'],
                   'runStarts': [run['firstFrame'] for run in page['stream']['sourceCoordinateRunCandidates']],
                   'lastPositiveFrame': page['stream']['lastPositiveFrame'], 'roles': page['teachingRoles']['roles'],
                   'selectedImages': len(page['selectedSourceFrameReview']['images'])} for page in pages], indent=2))
