from pathlib import Path
import base64
import collections
import datetime
import hashlib
import json
import re
import struct
import xml.etree.ElementTree as E
import zlib

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'migrations/shared-alg001-l07-p006/audit-v1/l7-p007-p009-compatibility-v1'


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
for identity, main_id in zip(identities['pages'], [228, 80]):
    key = identity['animationId']
    directory = BASE / key[-4:]
    swf = ROOT / identity['readOnlyCopy']
    swf_bytes = swf.read_bytes()
    assert sha(swf_bytes) == identity['sha256'] == sha(Path(identity['path']).read_bytes())
    assert len(swf_bytes) == identity['bytes']
    membership = [c['calibrationId'] for c in registry['calibrations']
                  if any(entry['key'] == key for entry in c['entries'])]
    assert membership == []
    assert not (ROOT / 'migrations' / key).exists()
    xml = E.parse(directory / 'movie.xml')
    header = xml.find('Header')
    assert header.get('framerate') == '12' and header.get('frames') == '10'
    body = zlib.decompress(swf_bytes[8:])
    assert len(body) + 8 == struct.unpack('<I', swf_bytes[4:8])[0]
    rect_bits = body[0] >> 3
    tag_start = (5 + 4 * rect_bits + 7) // 8 + 4
    binary_sprites = {struct.unpack_from('<H', data)[0]: data
                      for code, data in scan(body, tag_start) if code == 39}
    streams, timelines = [], []
    for sprite in header.findall('tags/DefineSprite'):
        cid = int(sprite.get('objectID'))
        tags = sprite.find('tags')
        frame, before = 1, 0
        blocks, payload, action_frames, named_placements = [], [], [], []
        for tag in tags:
            if tag.tag == 'SoundStreamBlock':
                data = base64.b64decode(tag.find('data').text)
                samples, seek = struct.unpack('<Hh', data[:4])
                blocks.append({'frame': frame, 'samples': samples, 'seek': seek,
                               'samplesBefore': before, 'targetSample': before + seek,
                               'mp3Bytes': len(data) - 4})
                before += samples
                payload.append(data[4:])
            if tag.tag == 'DoAction':
                action_frames.append(frame)
            if tag.tag == 'PlaceObject2' and tag.get('name'):
                named_placements.append({'frame': frame, **tag.attrib})
            if tag.tag == 'ShowFrame':
                frame += 1
        assert frame - 1 == int(sprite.get('frames'))
        binary = binary_sprites[cid]
        assert struct.unpack_from('<H', binary, 2)[0] == frame - 1
        timelines.append({'objectId': cid, 'frames': frame - 1,
                          'actionTagFrames': action_frames, 'namedPlacements': named_placements})
        stream = tags.find('SoundStreamHead')
        if stream is None:
            assert not blocks
            continue
        assert stream.get('compression') == '2' and stream.get('soundStereo') == '0'
        rate = [5512.5, 11025, 22050, 44100][int(stream.get('soundRate'))]
        assert rate == 22050
        source_size = int(stream.get('sampleSize'))
        assert source_size == 1837
        latency = struct.unpack('<h', base64.b64decode(stream.find('latencySeek/data').text))[0]
        binary_blocks = [data for code, data in scan(binary, 4) if code == 19]
        assert [(struct.unpack('<Hh', data[:4]), data[4:]) for data in binary_blocks] == [
            ((block['samples'], block['seek']), audio) for block, audio in zip(blocks, payload)]
        positive = [block for block in blocks if block['samples'] > 0]
        first = positive[0]['frame']
        runs = []
        residuals_at_physical_rate = []
        for block in positive:
            residual = block['targetSample'] - (block['frame'] - first) * source_size
            residuals_at_physical_rate.append(block['targetSample'] - (block['frame'] - first) * rate / 12)
            if not runs or runs[-1]['sourceResidualSamples'] != residual:
                if runs:
                    runs[-1]['endDecodedSample'] = block['samplesBefore']
                runs.append({'firstFrame': block['frame'], 'lastPositiveFrame': block['frame'],
                             'firstDecodedSample': block['targetSample'], 'sourceResidualSamples': residual})
            else:
                runs[-1]['lastPositiveFrame'] = block['frame']
        runs[-1]['endDecodedSample'] = before
        mp3 = b''.join(payload)
        streams.append({'frameDomain': f'sprite-{cid}', 'sampleRate': rate, 'channels': 1,
                        'sourceSampleSize': source_size, 'physicalSamplesPerFrame': rate / 12,
                        'latencySeek': latency, 'blockCount': len(blocks), 'declaredSamples': before,
                        'assembledMp3Bytes': len(mp3), 'assembledMp3Sha256': sha(mp3),
                        'sourceCoordinateRunCandidates': runs,
                        'emptyBlocks': [block for block in blocks if block['samples'] == 0],
                        'absentBlockFrames': [f for f in range(1, frame) if f not in {b['frame'] for b in blocks}],
                        'physicalRateResidualRangeSamples': {'min': min(residuals_at_physical_rate),
                                                            'max': max(residuals_at_physical_rate)},
                        'binaryXmlSamplesSeekAndPayloadEquivalent': True,
                        'runInterpretation': 'Exact source sampleSize1837 groups only; native PCM and scheduling correspondence not measured.'})
    scripts = [{'file': pin(path), 'source': path.read_text()} for path in sorted((directory / 'ffdec/scripts').rglob('*.as'))]
    texts = [{'file': pin(path), 'source': path.read_text()} for path in sorted((directory / 'ffdec/texts').rglob('*.txt'))]
    glossary = []
    for script in scripts:
        term = re.search(r'_global\.KeyAttribute\s*=\s*"([^"]+)"', script['source'])
        if term:
            glossary.append({'term': term.group(1), 'script': script['file'],
                             'callsDoHyperLinks': '_root.DoHyperLinks();' in script['source'],
                             'pausesHostAnimation': '_root.animation_mc.animation.stop();' in script['source']})
    main = next(timeline for timeline in timelines if timeline['objectId'] == main_id)
    source_evidence = [pin(directory / 'movie.xml'), pin(directory / 'extraction-receipt-v1.json'),
                       pin(directory / 'swfmill-v1.txt'), pin(directory / 'ffdec-assets-v1.txt')]
    external_audio = []
    for candidate in identity['catalog']['audioCueCandidates']:
        audio_path = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware') / candidate['viewPath']
        audio = audio_path.read_bytes()
        assert len(audio) == candidate['bytes'] and sha(audio) == candidate['sha256']
        external_audio.append({'path': str(audio_path), 'bytes': len(audio), 'sha256': sha(audio),
                               'hostTrigger': 'unverified catalog candidate; not part of embedded source stream',
                               'language': 'not determined by this structural audit'})
    behavior = ({'kind': 'Graph-choice quiz with branch-owned feedback timelines',
                 'mainPauseFrame': 109, 'terminalStop': False,
                 'mainEndSemantics': 'No stop at173; frame109 gates progress. Feedback can resume parent. Final source wrap is conditional on resolving the quiz; original host behavior unverified.',
                 'correctHandler': 'DefineButton2_40 calls disableQuizButton then showRightFeed',
                 'wrongHandler': 'DefineButton2_41 sets first/retry WrongFeed then disables quiz and calls showWrongFeed',
                 'wrongFeedback': {'sprite67': {'entryStop': 1, 'closeStop': 20, 'exit': 29},
                                   'sprite98': {'entryStop': 1, 'closeStop': 22, 'exit': 28},
                                   'sprite119': {'entryStop': 1, 'closeStop': 23, 'exit': 28}},
                 'wrongAttemptExit': 'Resets feedback to1, increments quizTryCount, re-enables NMH. At>=2 resets count, clears quizSection and resumes parent.',
                 'correctFeedbackSprites': [145, 177, 210, 224],
                 'correctFeedbackExit': 'Stops, disables quiz, clears quizSection, resets feedback to1 and resumes parent.',
                 'unresolvedHostCalls': ['enableButton', 'enableQuizButton', 'disableQuizButton', 'showRightFeed', 'showWrongFeed', 'DoHyperLinks'],
                 'notSelectedForStoppedFamily': 'Main pause is a quiz gate, with branching child domains and attempt state; it is not a terminal automatic animation stop.'}
                if main_id == 228 else
                {'kind': 'Editable linear-equation calculator', 'mainPauseFrame': 600, 'terminalStop': False,
                 'mainEndSemantics': 'Source has604frames but stops600 to expose form; no terminalstop604. Normal source interaction stays at the form.',
                 'editableInputNames': ['IP1_txt', 'IP2_txt', 'IP3_txt'], 'readOnlyOutputName': 'OP_txt',
                 'inputRestrictionSource': '0-9 / . \\-',
                 'entryHandler': 'Disable Entry_Btn; read x,slope,intercept. Empty field clears output and shows Hint. Otherwise slash fractions use parseFloat numerator/denominator; assign slope*x+Number(intercept), then enable New_fn.',
                 'legacyNumericCheck': 'Literal == NaN comparison in source is retained as audit evidence; no numeric semantics repair or acceptance claimed.',
                 'newFunctionHandler': 'Disable New_fn, clear three inputs/output, enable Entry_Btn.',
                 'hintCloseHandler': 'Enable Entry_Btn/New_fn and hide Hint.',
                 'feedbackSprite79': {'entryStop': 1, 'terminalStop': 19, 'audioDomain': 'sprite-79'},
                 'unresolvedHostCalls': ['DoHyperLinks'],
                 'notSelectedForStoppedFamily': 'Three editable input roles, formula evaluation, empty-input feedback, reset and a separate hint audio domain require their own behavior adapter.'})
    pages.append({'identity': identity, 'currentRegistryMembership': membership,
                  'sourceRoot': {'fps': 12, 'frames': 10, 'entryFrame': 6},
                  'main': main, 'allTimelines': timelines,
                  'buttonDefinitions': len(header.findall('tags/DefineButton2')),
                  'releaseHandlers': sum('on(release)' in script['source'] for script in scripts),
                  'glossary': glossary, 'behavior': behavior, 'streams': streams,
                  'externalLessonSaCandidate': external_audio,
                  'sourceScripts': scripts, 'sourceTexts': texts,
                  'editableTextDefinitions': [dict(tag.attrib) for tag in header.findall('tags/DefineEditText')],
                  'sourceEvidence': source_evidence,
                  'originalBytesUnchangedAtReadback': sha(Path(identity['path']).read_bytes()) == identity['sha256'],
                  'complexityInference': 'behavior-heavy based on exact scripts; no product lane/batch selected',
                  'clockPlanAccepted': False, 'nativePcmMeasured': False,
                  'onscreenVisibilityMeasured': False, 'originalRuntimeMeasured': False,
                  'productOrRegistryModified': False, 'newCurrentJsPlacements': 0})

report = {'schemaVersion': 1, 'kind': 'l7-p007-p009-read-only-source-compatibility',
          'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'scope': 'Read-only exact source audit under P006 audit area; no scaffold/renderer/host/registry changes or batch selection.',
          'identityReceipt': pin(BASE / 'source-identity-v1.json'),
          'registrySnapshot': pin(registry_path), 'producer': pin(Path(__file__)),
          'pages': pages,
          'comparison': 'Both are interactive vocabulary pages. They differ from stopped-family P002/P003 and from P00644100Hz looping real-world table. Shared audio sample rate alone does not prove behavior compatibility.',
          'batchSelected': False, 'currentJsAdded': 0}
(BASE / 'compatibility-v1.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps([{'page': page['identity']['animationId'], 'mainFrames': page['main']['frames'],
                   'mainActionFrames': page['main']['actionTagFrames'], 'behavior': page['behavior']['kind'],
                   'buttons': page['buttonDefinitions'], 'releaseHandlers': page['releaseHandlers'],
                   'glossary': [term['term'] for term in page['glossary']],
                   'audioDomains': [{'domain': stream['frameDomain'], 'rate': stream['sampleRate'],
                                     'blocks': stream['blockCount'], 'sourceRunStarts': [run['firstFrame'] for run in stream['sourceCoordinateRunCandidates']]}
                                    for stream in page['streams']]} for page in pages], indent=2))
