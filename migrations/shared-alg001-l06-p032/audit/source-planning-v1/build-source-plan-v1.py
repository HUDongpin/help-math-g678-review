#!/usr/bin/env python3
"""Build/check the bounded P032 source plan without registry or product writes."""
import hashlib
import json
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PHYSICAL = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
SWF = PHYSICAL / 'G6-G8-shared/ALG001/L6/IN/L6IN04.swf'
SA = PHYSICAL / 'G6-G8-shared/ALG001/L6/SA/L6IN04.mp3'
XML = PHYSICAL / 'G6-G8-shared/ALG001/L6/index.xml'
ID = 'shared-alg001-l06-p032'
SWF_SHA = 'e425600d0b6cfab41ae50f7512cb8e6c4e3c6ee04bbfa10c29b437459876d836'
SA_SHA = '9cdf2402eea05caebc190680eff4b15ee3baada80e366ed4e4ac96df7f3dd478'
XML_SHA = '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'
PREVIOUS = ROOT / 'output/alg-l06-p029-prequiz-resolution-v1/candidate-p032'
PREVIOUS_RECEIPT = ROOT / 'output/alg-l06-p029-prequiz-resolution-v1/source-receipt-v1.json'
OUTPUT = HERE / 'source-plan-v1.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pin(path, base=None):
    data = path.read_bytes()
    return {'path': path.relative_to(base).as_posix() if base else str(path),
            'bytes': len(data), 'sha256': sha(data)}


def find_lesson(value):
    if isinstance(value, dict):
        pages = value.get('pages')
        if isinstance(pages, list) and any(isinstance(p, dict) and p.get('animationId') == ID for p in pages):
            return value
        for item in value.values():
            found = find_lesson(item)
            if found is not None:
                return found
    elif isinstance(value, list):
        for item in value:
            found = find_lesson(item)
            if found is not None:
                return found
    return None


def probe(path):
    raw = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'stream=codec_name,sample_rate,channels:format=duration,size',
        '-of', 'json', str(path)], capture_output=True, check=True).stdout
    result = json.loads(raw)
    stream = result['streams'][0]
    return {'codec': stream['codec_name'], 'sampleRate': int(stream['sample_rate']),
            'channels': stream['channels'], 'durationSeconds': result['format']['duration'],
            'size': int(result['format']['size'])}


def action(display, suffix, required):
    found = [row for row in display['scripts'] if row['path'].endswith(suffix)]
    if len(found) != 1 or any(text not in found[0]['text'] for text in required):
        raise ValueError(f'P032 ActionScript drift: {suffix}')
    return {key: found[0][key] for key in ('path', 'bytes', 'sha256', 'text')}


def build():
    for path, expected in ((SWF, SWF_SHA), (SA, SA_SHA), (XML, XML_SHA)):
        if pin(path)['sha256'] != expected:
            raise ValueError(f'physical source drift: {path}')
    if (SWF.parent / 'L6IN04.fla').exists():
        raise ValueError('P032 same-path FLA appeared; review lineage')
    if (ROOT / 'migrations' / ID).exists():
        raise ValueError('P032 workspace appeared; reuse canonical workspace')
    previous_receipt = json.loads(PREVIOUS_RECEIPT.read_bytes())['p032Recommendation']
    if (pin(PREVIOUS_RECEIPT)['sha256'] !=
            '543c26134e03ba3aac8d636325b1060b81b52462ec337cd550304ab4ceecb34b' or
        previous_receipt['source']['sha256'] != SWF_SHA or
        previous_receipt['ffdecStructure']['sha256'] != pin(PREVIOUS / 'structure.xml')['sha256'] or
        previous_receipt['swfmillStructure']['sha256'] != pin(PREVIOUS / 'swfmill.xml')['sha256']):
        raise ValueError('prior P032 source-receipt binding drift')
    for old, new in ((PREVIOUS / 'swfmill.xml', HERE / 'source-structure.xml'),
                     (PREVIOUS / 'structure.xml', HERE / 'ffdec-structure.xml')):
        if old.read_bytes() != new.read_bytes():
            raise ValueError(f'P032 extraction-copy drift: {new}')
    old_scripts = sorted((PREVIOUS / 'ffdec-export/scripts').rglob('*.as'))
    new_scripts = sorted((HERE / 'source-export/scripts').rglob('*.as'))
    if len(old_scripts) != 6 or len(new_scripts) != 6:
        raise ValueError('P032 script export count drift')
    for old in old_scripts:
        new = HERE / 'source-export/scripts' / old.relative_to(PREVIOUS / 'ffdec-export/scripts')
        if new.read_bytes() != old.read_bytes():
            raise ValueError(f'P032 script-copy drift: {new}')
    pages = list(ET.parse(XML).getroot().iter('Page'))
    refs = [(page.text or '').strip() for page in pages]
    if len(refs) != 60 or refs[30:33] != [
            'IN/L6IN03.swf', 'IN/L6IN04.swf', 'IN/L6IN05.swf']:
        raise ValueError('physical lesson XML P032 order drift')
    xml_page = pages[31]
    if (xml_page.attrib != {'Title': 'Testing Whether Ordered Pairs Represent a Function',
                            'RandomAudio': '', 'BGText': ''}):
        raise ValueError('physical lesson XML P032 attributes drift')
    subtitles = [node for node in ET.parse(XML).getroot().iter('SubPageTitle')
                 if node.get('SubTitleButtonName') == 'L6IN04']
    if len(subtitles) != 1 or (subtitles[0].text or '').strip() != 'IN/L6IN04.swf':
        raise ValueError('P032 subtitle identity drift')
    catalog_path = ROOT / 'catalog/g678-shared-catalog.v1.json'
    lesson = find_lesson(json.loads(catalog_path.read_bytes()))
    if not lesson or len(lesson['pages']) != 60:
        raise ValueError('P032 catalog lesson identity drift')
    page = lesson['pages'][31]
    if (page['animationId'] != ID or page['globalOrdinal'] != 32 or
        page['reference'] != refs[31] or page['assetId'] != 'swf-' + SWF_SHA or
        page['sourceSha256'] != SWF_SHA or page['sourceBytes'] != 146070 or
        page['authoringEvidence'] != 'swf-only' or
        page['titleEnglish'] != xml_page.get('Title') or
        page['titleSpanish'] != subtitles[0].get('SpanSubTitleName')):
        raise ValueError('P032 catalog placement drift')
    registry = json.loads((ROOT / 'packages/demos/private-current-js-registry.json').read_bytes())
    if any(entry['key'] == ID for cal in registry['calibrations'] for entry in cal['entries']):
        raise ValueError('P032 already registered; re-evaluate source-only scope')
    display_path = HERE / 'source-display-list-v1.json'
    display = json.loads(display_path.read_bytes())
    root, main = display['root'], display['sprites']['22']
    if (display['sourceSwfSha256'] != SWF_SHA or
        display['header'] != {'signature': 'CWS', 'version': 6, 'fps': 12,
            'rootFrames': 10, 'stageTwips': {'left': 0, 'right': 16000,
                'top': 0, 'bottom': 12000}, 'backgroundRgb': [184, 216, 247]} or
        set(display['sprites']) != {'22'} or
        root['labels'] != [{'frame': 6, 'label': 'begin'}] or
        root['actionFrames'] != [1, 6] or main['frameCount'] != 413 or
        main['actionFrames'] != [] or len(display['scripts']) != 6 or
        len(display['texts']) != 9 or
        [button['id'] for button in display['buttonDefinitions']] != [7, 8, 9, 12]):
        raise ValueError('P032 display-list or action inventory drift')
    root_instances = [(item['objectId'], item['name'], item['depth'], item['presentSpans'])
                      for item in root['instances']]
    if root_instances != [(1, None, 1, [[6, 10]]), (22, 'animation', 2, [[6, 10]])]:
        raise ValueError('P032 root placement drift')
    glossary = []
    for button_id, key, spans in ((7, 'Set', [[1, 413]]),
                                  (8, 'Ordered pair', [[1, 413]]),
                                  (9, 'Function', [[1, 413]]),
                                  (12, 'X-coordinate', [[60, 413]])):
        script = action(display,
            f'scripts/DefineButton2_{button_id}/BUTTONCONDACTION on(release).as',
            ('on(release)', f'_global.KeyAttribute = "{key}";',
             '_root.DoHyperLinks();', '_root.animation_mc.animation.stop();'))
        instances = [item for item in main['instances'] if item['kind'] == 'button'
                     and item['objectId'] == button_id]
        if len(instances) != 1 or instances[0]['presentSpans'] != spans:
            raise ValueError(f'P032 glossary button {button_id} placement drift')
        glossary.append({'buttonId': button_id, 'keyAttribute': key,
                         'presentSpans': spans, 'action': script})
    root_actions = {
        'preloader': action(display, 'scripts/frame_1/DoAction.as',
            ('InternalPreloader.gotoAndPlay("jump_check")', 'stop();')),
        'entryStop': action(display, 'scripts/frame_6/DoAction.as', ('stop();',))}
    text_rows = [{key: row[key] for key in ('path', 'bytes', 'sha256', 'text')}
                 for row in display['texts']]
    text_by_id = {int(Path(row['path']).stem): row['text'] for row in text_rows}
    if (sorted(text_by_id) != [5, 11, 13, 15, 16, 17, 18, 19, 20] or
        'ordered pairs' not in text_by_id[5] or 'x-coordinate' not in text_by_id[11] or
        '{(1, –5), (3, 4), (–2, 11), (–2, –4)}' not in text_by_id[13]):
        raise ValueError('P032 teaching text drift')
    embedded = main['audio']
    payload = HERE / 'embedded-streams/sprite-22.mp3'
    if (not embedded or embedded['codec'] != 'mp3' or embedded['blockCount'] != 413 or
        embedded['firstFrame'] != 1 or embedded['lastFrame'] != 413 or
        embedded['declaredSamples'] != 758016 or
        embedded['payloadSha256'] != pin(payload)['sha256'] or
        embedded['payloadBytes'] != pin(payload)['bytes'] or
        embedded['zeroSampleBlocks'] != [{'frame': 2, 'samples': 0, 'seek': 0, 'rawBytes': 4}] or
        embedded['negativeSeekBlocks'] != []):
        raise ValueError('P032 embedded MP3 domain drift')
    mp3_probe = probe(payload)
    sa_probe = probe(SA)
    if (mp3_probe['codec'], mp3_probe['sampleRate'], mp3_probe['channels']) != ('mp3', 22050, 1):
        raise ValueError('P032 embedded codec drift')
    if (sa_probe['codec'], sa_probe['sampleRate'], sa_probe['channels']) != ('mp3', 48000, 1):
        raise ValueError('P032 SA codec drift')
    return {
        'schemaVersion': 1, 'kind': 'alg-l06-p032-source-plan-v1',
        'status': 'source-only; unregistered; no original-runtime, browser, audio-listening, or acceptance',
        'identity': {'animationId': ID, 'assetId': 'swf-' + SWF_SHA,
            'lesson': 'shared-alg001-l06', 'ordinal': 32, 'lessonPages': 60,
            'xmlReference': refs[31], 'xmlPageAttributes': xml_page.attrib,
            'titleEnglish': page['titleEnglish'], 'titleSpanish': page['titleSpanish'],
            'sectionCode': page['sectionCode'], 'sectionNumber': page['sectionNumber'],
            'sectionPageOrdinal': page['sectionPageOrdinal'],
            'neighborPlacements': [lesson['pages'][30]['animationId'],
                                   lesson['pages'][32]['animationId']]},
        'physicalSource': {'root': str(PHYSICAL), 'swf': pin(SWF, PHYSICAL),
            'lessonXml': pin(XML, PHYSICAL), 'separateSa': pin(SA, PHYSICAL),
            'samePathFlaExists': False},
        'catalog': {'sharedCatalog': pin(catalog_path, ROOT),
            'sourceStatus': page['sourceStatus'], 'authoringEvidence': page['authoringEvidence']},
        'extraction': {'swfmillXml': pin(HERE / 'source-structure.xml', ROOT),
            'ffdecXml': pin(HERE / 'ffdec-structure.xml', ROOT),
            'summary': pin(display_path, ROOT),
            'priorSourceReceipt': pin(PREVIOUS_RECEIPT, ROOT),
            'reusedPinnedExport': pin(PREVIOUS / 'structure.xml', ROOT),
            'crossToolTagAndFrameComparison': 'passed'},
        'stage': {'width': 800, 'height': 600, 'fps': 12, 'rootFrames': 10,
            'rootEntryFrame': 6, 'mainSpriteId': 22, 'mainFrames': 413,
            'swfSignature': 'CWS', 'swfVersion': 6,
            'backgroundRgb': [184, 216, 247]},
        'frameDomains': [
            {'domain': 'root', 'frames': 10, 'actionFrames': root['actionFrames'],
             'mainPlacement': {'objectId': 22, 'instanceName': 'animation',
                               'depth': 2, 'presentSpans': [[6, 10]]}},
            {'domain': 'sprite-22', 'frames': 413, 'actionFrames': [],
             'buttonInstances': [{'buttonId': item['buttonId'],
                                  'presentSpans': item['presentSpans']} for item in glossary],
             'audioCodec': 'mp3'}],
        'actions': {'root': root_actions, 'glossary': glossary,
            'externalHostNames': ['_level0.InternalPreloader', '_root.DoHyperLinks',
                                  '_root.animation_mc.animation.stop', '_global.KeyAttribute'],
            'hostBindingVerified': False},
        'textDefinitions': text_rows,
        'embeddedAudio': {'domain': 'sprite-22', 'codec': 'mp3',
            'streamHead': embedded['head'], 'firstBlockFrame': embedded['firstFrame'],
            'lastBlockFrame': embedded['lastFrame'], 'blockCount': embedded['blockCount'],
            'declaredSamples': embedded['declaredSamples'],
            'zeroSampleBlocks': embedded['zeroSampleBlocks'],
            'negativeSeekBlocks': embedded['negativeSeekBlocks'],
            'payload': pin(payload, ROOT), 'ffprobe': mp3_probe,
            'browserPcmMeasured': False, 'listeningAccepted': False},
        'separateSa': {'path': pin(SA, PHYSICAL), 'ffprobe': sa_probe,
            'xmlPageRandomAudio': xml_page.get('RandomAudio'),
            'triggerFromPageActions': False, 'hostTriggerVerified': False,
            'policy': 'user-triggered only; no locale autoplay or embedded-audio splice'},
        'sourceOnlyDecision': {'provisionalLane': 'interactive-understood',
            'reason': 'linear narrated sprite with four source glossary/host-stop actions; host pause and return remain unverified',
            'generationAuthorized': False,
            'currentJsRegistered': False, 'originalRuntimeFidelity': False,
            'audioAccepted': False, 'humanOrOwnerAccepted': False,
            'strictComplete': False, 'release': False, 'publication': False}}


if __name__ == '__main__':
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('use --write or --check')
    plan = build()
    data = (json.dumps(plan, ensure_ascii=False, indent=2) + '\n').encode()
    if sys.argv[1] == '--write':
        if OUTPUT.exists():
            raise SystemExit('refuse to overwrite existing P032 source plan')
        OUTPUT.write_bytes(data)
    elif not OUTPUT.is_file() or OUTPUT.read_bytes() != data:
        raise SystemExit('P032 source plan drift')
    print(json.dumps({'mode': sys.argv[1], 'sha256': sha(data),
                      'textCount': len(plan['textDefinitions']),
                      'actionCount': 2 + len(plan['actions']['glossary']),
                      'streamBlocks': plan['embeddedAudio']['blockCount']}))
