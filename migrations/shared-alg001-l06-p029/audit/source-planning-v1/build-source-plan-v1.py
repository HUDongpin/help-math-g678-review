#!/usr/bin/env python3
"""Build and check the P029 source-only plan against physical and extracted bytes."""
import hashlib
import json
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
SWF = SOURCE_ROOT / 'G6-G8-shared/ALG001/L6/VB/L6VB22.swf'
SA = SOURCE_ROOT / 'G6-G8-shared/ALG001/L6/SA/L6VB22.mp3'
LESSON_XML = SOURCE_ROOT / 'G6-G8-shared/ALG001/L6/index.xml'
OUTPUT = HERE / 'source-plan-v1.json'
ID = 'shared-alg001-l06-p029'
SWF_SHA = 'cbfd012d0aff11544a252c9e2852dff30d408c634aa2a805eb0837933c3370d4'
SA_SHA = '17ec6377cbcbd89ccbdc909c967dc9c3e07833cc126c44dfe1f342918344ae23'
XML_SHA = '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pin(path, base=None):
    data = path.read_bytes()
    return {'path': path.relative_to(base).as_posix() if base else str(path),
            'bytes': len(data), 'sha256': sha(data)}


def find_lesson_with_page(value):
    if isinstance(value, dict):
        pages = value.get('pages')
        if isinstance(pages, list) and any(isinstance(p, dict) and p.get('animationId') == ID for p in pages):
            return value
        for item in value.values():
            result = find_lesson_with_page(item)
            if result is not None:
                return result
    elif isinstance(value, list):
        for item in value:
            result = find_lesson_with_page(item)
            if result is not None:
                return result
    return None


def probe(path):
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration,size:stream=codec_name,sample_rate,channels', '-of', 'json', str(path)],
        capture_output=True, check=True)
    return json.loads(result.stdout)


def script(display, suffix, required=()):
    matches = [row for row in display['scripts'] if row['path'].endswith(suffix)]
    if len(matches) != 1 or any(part not in matches[0]['text'] for part in required):
        raise ValueError(f'script contract drift: {suffix}')
    return {'path': matches[0]['path'], 'bytes': matches[0]['bytes'],
            'sha256': matches[0]['sha256']}


def build():
    for path, expected in ((SWF, SWF_SHA), (SA, SA_SHA), (LESSON_XML, XML_SHA)):
        if pin(path)['sha256'] != expected:
            raise ValueError(f'physical P029 source drift: {path}')
    if (SWF.parent / 'L6VB22.fla').exists():
        raise ValueError('same-path FLA appeared; review its lineage')
    if (ROOT / 'migrations' / ID).exists():
        raise ValueError('matching migration workspace appeared; reuse it')
    registry = ROOT / 'packages/demos/private-current-js-registry.json'
    if ID in registry.read_text():
        raise ValueError('P029 registration state changed')
    lesson_refs = [(p.text or '').strip() for p in ET.parse(LESSON_XML).getroot().iter('Page')]
    if len(lesson_refs) != 60 or lesson_refs[28] != 'VB/L6VB22.swf' or lesson_refs[27] != 'VB/L6VB21.swf' or lesson_refs[29] != 'IN/L6IN02.swf':
        raise ValueError('physical XML page sequence drift')
    catalog_path = ROOT / 'catalog/g678-shared-catalog.v1.json'
    lesson = find_lesson_with_page(json.loads(catalog_path.read_bytes()))
    if not lesson or len(lesson['pages']) != 60:
        raise ValueError('catalog lesson sequence drift')
    page = lesson['pages'][28]
    if (page['animationId'] != ID or page['globalOrdinal'] != 29 or
        page['reference'] != 'VB/L6VB22.swf' or page['assetId'] != 'swf-' + SWF_SHA or
        page['sourceSha256'] != SWF_SHA or page['sourceBytes'] != 567027 or
        page['authoringEvidence'] != 'swf-only' or page['titleEnglish'] != 'Relation'):
        raise ValueError('P029 catalog identity drift')
    display_path = HERE / 'source-display-list-v1.json'
    display = json.loads(display_path.read_bytes())
    root = display['root']
    sprites = display['sprites']
    if (display['sourceSwfSha256'] != SWF_SHA or display['header']['rootFrames'] != 10 or
        len(sprites) != 14 or len(display['buttonDefinitions']) != 7 or
        len(display['morphShapeIds']) != 48 or len(display['scripts']) != 39 or
        root['labels'] != [{'frame': 6, 'label': 'begin'}] or
        [(r['objectId'], r['name'], r['depth']) for r in root['instances']] !=
        [(2, 'Mc_Page_Title', 1), (185, 'animation', 3)] or
        sprites['185']['frameCount'] != 234 or sprites['185']['actionFrames'] != [145, 146]):
        raise ValueError('P029 extraction structure drift')
    button_ids = [b['id'] for b in display['buttonDefinitions']]
    if button_ids != [8, 9, 17, 27, 48, 61, 87]:
        raise ValueError('P029 button set drift')
    text_map = {int(Path(row['path']).stem): row['text'] for row in display['texts']}
    if (len(text_map) != 29 or 'How many' not in text_map[6] or
        '{(1, 1), (1, 2), (1, 3)}' not in text_map[11] or
        text_map[182].strip() != '(1, 1)' or text_map[184].strip() != '(1, 3)'):
        raise ValueError('P029 teaching text drift')
    actions = {
        'rootPreloader': script(display, 'scripts/frame_1/DoAction.as', ('InternalPreloader.gotoAndPlay("jump_check")', 'stop();')),
        'rootEntry': script(display, 'scripts/frame_6/DoAction.as', ('stop();',)),
        'quizGate': script(display, 'scripts/DefineSprite_185/frame_145/DoAction.as', ('stop();', '_global.quizSection = true;', '_global.quizTryCount = 0;')),
        'postQuizDefault': script(display, 'scripts/DefineSprite_185/frame_146/DoAction.as', ('Entry_txt.text = 3;',)),
        'answerPress': script(display, 'scripts/DefineButton2_17/BUTTONCONDACTION on(press).as', ('opt_try == 4', 'corr.gotoAndPlay(2)', 'Wrong.gotoAndPlay(2)')),
        'answerSubmit': script(display, 'scripts/DefineButton2_27/BUTTONCONDACTION on(release).as', ('_global.quizTryCount++;', 'Entry_txt.text == "3"', '_root.showRightFeed();', '_root.showWrongFeed();', '_global.Wrongfeed =')),
        'relationGlossary': script(display, 'scripts/DefineButton2_8/BUTTONCONDACTION on(release).as', ('KeyAttribute = "Relation"', '_root.DoHyperLinks();', '_root.animation_mc.animation.stop();')),
        'orderedPairGlossary': script(display, 'scripts/DefineButton2_9/BUTTONCONDACTION on(release).as', ('KeyAttribute = "Ordered pair"', '_root.DoHyperLinks();', '_root.animation_mc.animation.stop();')),
        'wrongClose1': script(display, 'scripts/DefineButton2_48/BUTTONCONDACTION on(release).as', ('_parent.gotoAndPlay(21);', 'eval("AnsBtn" + i).gotoAndStop(1);')),
        'wrongClose3': script(display, 'scripts/DefineButton2_61/BUTTONCONDACTION on(release).as', ('_parent.gotoAndPlay(22);', 'eval("AnsBtn" + i).gotoAndStop(1);')),
        'wrongClose2': script(display, 'scripts/DefineButton2_87/BUTTONCONDACTION on(release).as', ('_parent.gotoAndPlay(23);', 'eval("AnsBtn" + i).gotoAndStop(1);')),
    }
    definitions = display['definitionKinds']
    domains = []
    for sid, timeline in [('root', root)] + list(sprites.items()):
        children = [{'characterId': r['objectId'], 'instanceName': r['name'],
                     'depth': r['depth'], 'presentSpans': r['presentSpans']}
                    for r in timeline['instances'] if r['kind'] == 'sprite']
        masks = [{'characterId': r['objectId'], 'depth': r['depth'],
                  'clipDepth': r['clipDepth'], 'presentSpans': r['presentSpans']}
                 for r in timeline['instances'] if r['clipDepth'] is not None]
        morphs = [c for c in timeline['changes'] if c['kind'] == 'place' and
                  definitions.get(str(c['objectId'])) == 'morph']
        domains.append({'id': sid, 'frames': timeline['frameCount'],
            'actionFrames': timeline['actionFrames'], 'childSprites': children,
            'masks': masks, 'morphCharacterIds': sorted({c['objectId'] for c in morphs}),
            'morphPlacementCount': len(morphs),
            'textInstanceCount': sum(r['kind'] == 'text' for r in timeline['instances']),
            'buttonInstances': [{'characterId': r['objectId'], 'instanceName': r['name'],
                                 'presentSpans': r['presentSpans']}
                                for r in timeline['instances'] if r['kind'] == 'button'],
            'audioCodec': timeline['audio']['codec'] if timeline['audio'] else None})
    if [d['id'] for d in domains] != ['root', '2', '51', '52', '63', '67', '89', '98', '126', '151', '157', '164', '167', '179', '185']:
        raise ValueError('P029 frame domain inventory drift')
    embedded = []
    for sid, timeline in sprites.items():
        stream = timeline['audio']
        if not stream:
            continue
        codec = stream['codec']
        path = HERE / 'embedded-streams' / (f'sprite-{sid}.mp3' if codec == 'mp3' else f'sprite-{sid}.swf-adpcm-blocks.bin')
        item = {'frameDomain': sid, 'visualFrames': timeline['frameCount'],
            'codec': codec, 'head': stream['head'], 'firstBlockFrame': stream['firstFrame'],
            'lastBlockFrame': stream['lastFrame'], 'blockCount': stream['blockCount'],
            'declaredSamples': stream['declaredSamples'], 'rawPayload': pin(path, ROOT),
            'zeroSampleBlocks': stream['zeroSampleBlocks'],
            'negativeSeekBlocks': stream['negativeSeekBlocks']}
        if item['rawPayload']['sha256'] != stream['payloadSha256']:
            raise ValueError(f'P029 stream {sid} extraction drift')
        if codec == 'mp3':
            decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path),
                '-ac', '1', '-ar', '22050', '-f', 'f32le', 'pipe:1'], capture_output=True, check=True).stdout
            if len(decoded) % 4 or len(decoded)//4 != stream['declaredSamples']:
                raise ValueError(f'P029 stream {sid} candidate decode mismatch')
            item['ffprobe'] = probe(path)
            item['ffmpegPcmCandidate'] = {'format': 'f32le', 'sampleRate': 22050,
                'channels': 1, 'samples': len(decoded)//4, 'sha256': sha(decoded),
                'browserOrOriginalRuntimeProof': False}
        else:
            item['decodeStatus'] = 'raw SWF ADPCM blocks preserved; playback/decode unresolved'
        embedded.append(item)
    if len(embedded) != 8 or [e['frameDomain'] for e in embedded if e['codec'] != 'mp3'] != ['179']:
        raise ValueError('P029 audio domain inventory drift')
    return {'schemaVersion': 1, 'kind': 'alg-l06-p029-source-planning-v1',
        'status': 'source-structure-and-script-export-only; unregistered; no-original-runtime',
        'identity': {'animationId': ID, 'assetId': 'swf-' + SWF_SHA,
            'lesson': 'shared-alg001-l06', 'globalActiveOrdinal': 29,
            'activePageCountInLesson': len(lesson_refs), 'sectionCode': page['sectionCode'],
            'sectionNumber': page['sectionNumber'], 'sectionPageOrdinal': page['sectionPageOrdinal'],
            'xmlReference': page['reference'], 'titleEnglish': page['titleEnglish'],
            'titleSpanish': page['titleSpanish'], 'variantStatus': page['variantStatus'],
            'neighborPlacements': [lesson['pages'][27]['animationId'], lesson['pages'][29]['animationId']]},
        'source': {'physicalRoot': str(SOURCE_ROOT), 'swf': pin(SWF, SOURCE_ROOT),
            'separateSa': pin(SA, SOURCE_ROOT), 'lessonXml': pin(LESSON_XML, SOURCE_ROOT),
            'samePathFlaExists': False, 'authoringEvidence': 'swf-only'},
        'catalogPins': [pin(catalog_path, ROOT),
                        pin(ROOT / 'catalog/g678-page-only-release-manifest.v1.json', ROOT)],
        'extraction': {'swfmillXml': pin(HERE / 'source-structure.xml', ROOT),
            'ffdecXml': pin(HERE / 'ffdec-structure.xml', ROOT),
            'displayList': pin(display_path, ROOT),
            'ffdecHelp': pin(HERE / 'ffdec-help.txt', ROOT),
            'tools': {'swfmill': '0.3.6', 'ffdec': '26.2.1', 'ffmpeg': '8.1.2'}},
        'stage': {'widthPx': 800, 'heightPx': 600, 'fps': 12,
            'backgroundRgb': display['header']['backgroundRgb'],
            'swfSignature': display['header']['signature'], 'swfVersion': display['header']['version']},
        'frameDomains': domains,
        'visualStructure': {'rootEntry': {'frame': 6, 'label': 'begin', 'mainSpriteId': 185,
            'mainInstanceName': 'animation', 'rootAction': actions['rootEntry']},
            'definitionCounts': display['tagCounts'], 'fontDefinitions': display['fonts'],
            'staticTextDefinitions': 24, 'editableTextDefinitions': display['editTexts'],
            'morphCharacterIds': display['morphShapeIds'],
            'mainQuestionTextId': 6, 'mainQuestion': text_map[6],
            'relationSetTextId': 11, 'relationSet': text_map[11],
            'answerLabelTextId': 19, 'orderedPairTextIds': [182, 183, 184],
            'mainStopAndQuizFrame': 145, 'postQuizDefaultAnswerFrame': 146,
            'sourceTextLanguage': 'English in SWF; Spanish title in lesson XML'},
        'actions': {'selected': actions, 'allExportedScripts':
            [{'path': x['path'], 'bytes': x['bytes'], 'sha256': x['sha256']}
             for x in display['scripts']],
            'quizSubmit': {'buttonCharacterId': 27, 'event': 'pointerReleaseInside',
                'expectedAnswerString': '3', 'rightHostCall': '_root.showRightFeed()',
                'wrongHostCall': '_root.showWrongFeed()', 'tryCounter': '_global.quizTryCount',
                'wrongMessageSpellingInButton': '_global.Wrongfeed',
                'wrongMessageSpellingInPopup': '_global.WrongFeed',
                'messageVariableCaseMismatch': True},
            'glossaryKeys': ['Relation', 'Ordered pair'],
            'feedbackDomains': {'wrong': [52, 67, 98], 'right': [126, 151, 167, 179]}},
        'audio': {'embeddedStreams': embedded,
            'separateSa': {'source': pin(SA, SOURCE_ROOT), 'ffprobe': probe(SA),
                'trigger': 'user-action-only', 'splicedIntoEmbeddedStream': False,
                'spokenLanguageAndListening': 'unverified'}},
        'workspace': {'matchingMigrationWorkspaceExists': False,
                      'registryMemberObserved': False, 'scaffoldPerformed': False},
        'complexityAndLane': {'classification': 'behavior-heavy',
            'automaticCandidateAllowed': False, 'bulkScaleOutAllowed': False,
            'reason': '234-frame main timeline pauses at a typed-answer quiz; seven feedback clips contain independent scripts, morphs, masks and audio, including an ADPCM domain; old-host scoring and glossary callbacks are unresolved',
            'nextRoute': 'bounded advanced-manual behavior-first renderer using compiler-assisted source extraction and a maintained quiz/feedback state machine; retain source-owned frame, text, glossary and audio maps'},
        'sharedBehaviorFit': {'candidateHostBridge': 'evaluate existing My Lesson source bridge for playback, glossary close, scoring feedback and audio cleanup against these exact scripts',
            'pageOwned': 'P029 answer 3, two glossary keys, 234-frame narration/quiz/resolution schedule, seven feedback subclips and eight embedded audio domains'},
        'unresolved': ['No same-path FLA; authoring layers and tween intent unavailable.',
            'Old-host InternalPreloader, DoHyperLinks, showRightFeed and showWrongFeed callbacks and natural return are unverified.',
            'Button press opt_try path, editable answer, quiz timing, feedback selection and post-feedback advancement require original-runtime and real My Lesson traces.',
            'Source spells Wrongfeed in the submit button but WrongFeed in feedback popups; actual message behavior is unverified.',
            'Sprite 179 SWF ADPCM blocks are preserved but not decoded or listened to.',
            'MP3 candidate decoding is structural; browser timing, original-runtime output, language and listening remain unverified.',
            'The separate SA source is not tied to automatic locale playback or embedded audio.',
            'No renderer, registry, My Lesson browser check, human/Owner decision, strict completion or publication.']}


if __name__ == '__main__':
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('use --write or --check')
    data = (json.dumps(build(), ensure_ascii=False, indent=2) + '\n').encode()
    if sys.argv[1] == '--write':
        if OUTPUT.exists():
            raise SystemExit('refuse to overwrite an existing P029 plan')
        OUTPUT.write_bytes(data)
    elif OUTPUT.read_bytes() != data:
        raise SystemExit('P029 source plan drift')
    print(json.dumps({'mode': sys.argv[1], 'planSha256': sha(data), 'bytes': len(data)}))
