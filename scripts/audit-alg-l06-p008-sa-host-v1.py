#!/usr/bin/env python3
"""Bind P008 to the already verified, byte-identical ALG001 L6 old-host SA rule."""
import hashlib
import json
import pathlib
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
AWS = pathlib.Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
WORK = ROOT / 'migrations/shared-alg001-l06-p008'
P004 = ROOT / 'migrations/shared-alg001-l06-p004/audit/sa-host-disposition-v1.json'
OUT = WORK / 'audit/sa-host-v1/sa-host-disposition-v1.json'


def read(path, sha, size=None):
    path = pathlib.Path(path)
    assert path.is_absolute() and path.resolve() == path and path.is_file()
    before = path.stat()
    assert before.st_nlink == 1
    data = path.read_bytes()
    after = path.stat()
    for field in ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_mode', 'st_nlink'):
        assert getattr(before, field) == getattr(after, field), (path, field)
    pin = {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    assert pin['sha256'] == sha and (size is None or pin['bytes'] == size), path
    return data, pin


assert len(sys.argv) == 2 and sys.argv[1] in ('--write', '--check')
assert AWS.resolve() == AWS
old_raw, old_pin = read(P004, '8a64cea0933e8a5d8d19f6807c5109de865bf64485639489466e863458247530', 8479)
old = json.loads(old_raw)
assert old['status'] == 'verified-static-host-algorithm-conditional-page-application-not-runtime-or-listening'
assert old['applicability']['hostLogicalArchivePath'] == 'NewHelpProgram/HELP_COURSES/indexMI.swf'
inputs = {'p004HostAlgorithmDisposition': old_pin}
host_bytes = {}
for key in ('hostCas', 'hostWorkingCopy', 'hostExtractionReceipt', 'hostFunctions', 'hostGallery',
            'saRelease', 'eaRelease', 'saPlay', 'saPause', 'hostFrameObserver'):
    prior = old['inputs'][key]
    host_bytes[key], inputs[key] = read(prior['path'], prior['sha256'], prior['bytes'])
host = host_bytes['hostFunctions'].decode()
release = host_bytes['saRelease'].decode()
assert 'function doCheckSpanishAudio()' in host
assert 'dtfSPANISH.text.toUpperCase() == "ON"' in host
assert 'if(_loc2_.spanSound != true)' in host
assert 'if(_loc2_.newTitleTag == true)' in host
assert 'if(_loc2_.sectionNumber >= 0 && _loc2_.sectionNumber < _loc2_.arrayTotalSectionDetails.length)' in host
assert 'else if(_loc2_.sectionNumber >= 1 && _loc2_.sectionNumber < _loc2_.arrayTotalSectionDetails.length)' in host
assert 'tempString.toUpperCase() != "01.SWF"' in host
assert 'function doPlaySpanishAudio()' in host and 'doPlaySpanishAudio' in release
assert 'SndFName = spanishAudioURL + "/SA/" + SSTemFName[0] + ".mp3";' in host
assert '_root.animation_mc.animation.stop();' in host
assert '_global.spanSoundMp3.loadSound(SndFName,false);' in host
assert '_global.spanSoundMp3.start(0);' in host
assert '_root.doStopSpanishAudio();' in host

lesson, inputs['lessonXml'] = read(AWS / 'G6-G8-shared/ALG001/L6/index.xml',
    '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c', 13926)
page, inputs['pageSwf'] = read(AWS / 'G6-G8-shared/ALG001/L6/RW/L6RW07.swf',
    '6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350', 2805364)
sa, inputs['separateSa'] = read(AWS / 'G6-G8-shared/ALG001/L6/SA/L6RW07.mp3',
    'ca48f20431673bb4e6f17c28cb605134f4098161bbcb93cc82c274cb472466f3', 135072)
composition_raw, inputs['sourceComposition'] = read(WORK / 'audit/source-v1/source-composition-v1.json',
    'a738f4fa22abd482cbb4a5470a33c85f465f79ae1fd831b1c29466c4617016c7')
source_audit_raw, inputs['sourceAudit'] = read(WORK / 'audit/source-v1/source-audit-v1.json',
    'e14303e47454761f2fc17b77b7eb6afc714354d50cfbd1bd151264a516db6de2')
audio_raw, inputs['audioSourceAudit'] = read(WORK / 'audit/audio-v1/audio-source-audit-v1.json',
    'd480a9e8ffd48a5b46e03a82035c78f55369f9b5d07757cfaff6759a7df07ee4')
tree = ET.fromstring(lesson)
assert tree.findtext('PageRoot') == 'HELP_COURSES/ALG001/L6'
assert tree.findtext('CourseIMGName') == 'HELP_COURSES/ALG001/ALG001.jpg'
sections = tree.findall('Section')
rw = [section for section in sections if section.attrib.get('SName') == 'RW']
assert len(rw) == 1 and rw[0].attrib['SNumber'] == '2'
pages = rw[0].findall('Page')
assert pages[6].text == 'RW/L6RW07.swf' and pages[6].attrib['Title'] == 'Page 7'
global_ordinal = sum(len(section.findall('Page')) for section in sections[:sections.index(rw[0])]) + 7
assert global_ordinal == 8 and 'L6RW07'.upper()[-2:] != '01'
composition = json.loads(composition_raw)
root_placement = [event for event in composition['root']['events'] if event.get('kind') == 'place'
                  and event.get('characterId') == 507 and event.get('name', {}).get('text') == 'animation']
assert len(root_placement) == 1 and root_placement[0]['frame'] == 6
assert composition['main']['domainId'] == 'sprite-507' and composition['main']['declaredFrames'] == 938
source_audit = json.loads(source_audit_raw)
assert source_audit['actionScript']['decompiled']['scripts/DefineSprite_507/frame_938/DoAction.as'] == 'stop();'
audio = json.loads(audio_raw)
assert audio['source']['swf']['sha256'] == inputs['pageSwf']['sha256']
assert audio['source']['separateSa']['sha256'] == inputs['separateSa']['sha256']

payload = {
    'schemaVersion': 1, 'kind': 'alg-l06-p008-separate-sa-host-disposition-v1',
    'animationId': 'shared-alg001-l06-p008',
    'status': 'verified-static-host-algorithm-conditional-page-application-not-runtime-or-listening',
    'inputs': inputs,
    'hostAlgorithmReuse': {
        'logicalArchivePath': 'NewHelpProgram/HELP_COURSES/indexMI.swf',
        'byteIdenticalToP004VerifiedHost': True,
        'basis': 'P004 disposition rehashed plus its exact host SWF, extracted script, and button-action inputs rehashed here',
        'reference': 'migrations/shared-alg001-l06-p004/audit/sa-host-disposition-v1.json',
    },
    'applicability': {
        'xmlPlacement': {'globalOrdinal': 8, 'sectionCode': 'RW', 'sectionNumber': 2,
                         'sectionPageOrdinal': 7, 'file': 'RW/L6RW07.swf'},
        'pageMainPlacement': {'rootFrame': 6, 'name': 'animation', 'characterId': 507,
                              'mainFrameCount': 938},
        'derivedUrlTemplate': '<ServerRoot>/HELP_COURSES/ALG001/L6/SA/L6RW07.mp3',
        'staticVisibilityGate': {
            'setting': 'dtfSPANISH text uppercased equals ON',
            'activeSa': 'spanSound is not true',
            'newTitleTagTrue': '0 <= sectionNumber < arrayTotalSectionDetails.length',
            'newTitleTagOther': '1 <= sectionNumber < arrayTotalSectionDetails.length',
            'pageBasename': 'last six characters uppercased do not equal 01.SWF',
            'p008StaticResolution': 'sectionNumber 2 and suffix 07.SWF meet either section branch and basename gate',
        },
        'conditionalInputsUnobserved': ['actual host launch and page association', 'dtfSPANISH setting',
                                        'host section state', 'successful SA load'],
        'sourceRole': 'separate optional Spanish page-audio operation',
        'actualSpokenLanguage': 'unverified',
    },
    'modernTriggerDisposition': [
        'Offer a distinct Spanish Audio control only through an explicit user action; locale es does not autoplay.',
        'Pause the P008 main clock before loading separate SA; do not splice SA into embedded main audio.',
        'Start separate SA at zero only after its current load succeeds; cancel stale loads on Replay, navigation, and close.',
        'On return or SA end, release SA and resume retained nonterminal main position when appropriate; frame 938 remains terminal.',
        'Keep glossary and SA ownership mutually explicit; source host audio controls do not prove a fractional resume position.',
    ],
    'limits': ['Static host rule and file/path binding only; no original host session or launch association.',
               'No source spoken-language, listening, AVM1 race, synchronization, or runtime acceptance.',
               'Legacy course shell remains outside page migration denominator.'],
    'acceptanceEffects': {'currentJsRegistrationChanged': False, 'originalRuntimeAccepted': False,
                          'fidelityAccepted': False, 'audioAccepted': False, 'listeningAccepted': False,
                          'humanAccepted': False, 'ownerAccepted': False, 'strictComplete': False,
                          'published': False},
}
encoded = (json.dumps(payload, indent=2, ensure_ascii=False) + '\n').encode()
if sys.argv[1] == '--write':
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(encoded)
else:
    assert OUT.read_bytes() == encoded
print(json.dumps({'status': payload['status'], 'bytes': len(encoded),
                  'sha256': hashlib.sha256(encoded).hexdigest()}))
