#!/usr/bin/env python3
"""Bind P010 SA and Function to rehashed source and old-host static rules."""
import hashlib
import json
import pathlib
import sys
import xml.etree.ElementTree as ET


ROOT = pathlib.Path(__file__).resolve().parents[1]
AWS = pathlib.Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
WORK = ROOT / 'migrations/shared-alg001-l06-p010'
P004_HOST = ROOT / 'migrations/shared-alg001-l06-p004/audit/sa-host-disposition-v1.json'
P004_GLOSSARY = ROOT / 'migrations/shared-alg001-l06-p004/audit/source-glossary-v1.json'
P004_CONTENT = ROOT / 'packages/demos/src/alg-l06-p004-glossary-content.generated.ts'
P004_LOOKUP = ROOT / 'packages/demos/src/alg-l06-p004-glossary-content-v1.ts'
OUT = WORK / 'audit/sa-host-v1/sa-host-disposition-v1.json'


def read(path, sha, size=None):
    path = pathlib.Path(path)
    assert path.is_absolute() and path.resolve() == path and path.is_file(), path
    before = path.stat()
    assert before.st_nlink == 1, path
    raw = path.read_bytes()
    after = path.stat()
    for key in ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_mode', 'st_nlink'):
        assert getattr(before, key) == getattr(after, key), (path, key)
    pin = {'path': str(path), 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}
    assert pin['sha256'] == sha and (size is None or pin['bytes'] == size), path
    return raw, pin


assert len(sys.argv) == 2 and sys.argv[1] in ('--write', '--check')
assert AWS.resolve() == AWS
inputs = {}

host_raw, inputs['p004HostDisposition'] = read(
    P004_HOST, '8a64cea0933e8a5d8d19f6807c5109de865bf64485639489466e863458247530', 8479)
old = json.loads(host_raw)
assert old['status'] == 'verified-static-host-algorithm-conditional-page-application-not-runtime-or-listening'
assert old['applicability']['hostLogicalArchivePath'] == 'NewHelpProgram/HELP_COURSES/indexMI.swf'
host_files = {}
for name in ('hostCas', 'hostWorkingCopy', 'hostExtractionReceipt', 'hostFunctions', 'hostGallery',
             'saRelease', 'eaRelease', 'saPlay', 'saPause', 'hostFrameObserver'):
    prior = old['inputs'][name]
    host_files[name], inputs[name] = read(prior['path'], prior['sha256'], prior['bytes'])
host = host_files['hostFunctions'].decode()
release = host_files['saRelease'].decode()
for fact in (
    'function doCheckSpanishAudio()',
    'dtfSPANISH.text.toUpperCase() == "ON"',
    'if(_loc2_.spanSound != true)',
    'if(_loc2_.newTitleTag == true)',
    'if(_loc2_.sectionNumber >= 0 && _loc2_.sectionNumber < _loc2_.arrayTotalSectionDetails.length)',
    'else if(_loc2_.sectionNumber >= 1 && _loc2_.sectionNumber < _loc2_.arrayTotalSectionDetails.length)',
    'tempString.toUpperCase() != "01.SWF"',
    'function doPlaySpanishAudio()',
    'SndFName = spanishAudioURL + "/SA/" + SSTemFName[0] + ".mp3";',
    '_root.animation_mc.animation.stop();',
    '_global.spanSoundMp3.loadSound(SndFName,false);',
    '_global.spanSoundMp3.start(0);',
    '_root.doStopSpanishAudio();',
):
    assert fact in host, fact
assert 'doPlaySpanishAudio' in release

glossary_raw, inputs['p004SourceGlossary'] = read(
    P004_GLOSSARY, '0cb0789f117db00855a5be1c1123121cdd64b7eba03b2f64ddce3d7f81f999e0')
glossary = json.loads(glossary_raw)
assert glossary['kind'] == 'alg-l06-p004-source-glossary-v1'
function_entries = [row for row in glossary['entries'] if row['sourceKeyAttribute'] == 'Function']
assert len(function_entries) == 1
function = function_entries[0]
assert function['canonicalDictionaryKey'] == 'Function'
assert function['lookup'] == {'kind': 'exact-literal', 'from': 'Function', 'to': 'Function',
                              'genericCaseNormalizationAllowed': False}
assert function['labels'] == {'en': 'Function', 'es': 'Función'}
assert function['definitions'] == {
    'en': 'A special relation in which every value of x has one, and only one, value of y.',
    'es': 'Relación especial en la cual a cada valor x le corresponde solamente un valor y.',
}
for lang in ('en', 'es'):
    original = glossary['dictionaries'][lang]
    _, inputs[f'p004Dictionary{lang.upper()}'] = read(original['path'], original['sha256'], original['bytes'])
    assert function['source'][lang]['sha256'] == original['sha256']
_, inputs['p004GeneratedContent'] = read(
    P004_CONTENT, 'baee3046fb4c1686708a937923e1cd4d27d934b15728710aef582b2a1e81ae26')
lookup_raw, inputs['p004MaintainedLookup'] = read(
    P004_LOOKUP, '7929cd3bea7eb3519abc328511870ee57dbaa4e768c0665fbff46e11530a4579')
assert "row.key===key" in lookup_raw.decode()

lesson_raw, inputs['lessonXml'] = read(
    AWS / 'G6-G8-shared/ALG001/L6/index.xml',
    '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c', 13926)
_, inputs['pageSwf'] = read(
    AWS / 'G6-G8-shared/ALG001/L6/RW/L6RW09.swf',
    '96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14', 114334)
_, inputs['separateSa'] = read(
    AWS / 'G6-G8-shared/ALG001/L6/SA/L6RW09.mp3',
    '903c1bd16cebf9f1ceda0d9b8a47905cae20f380bb857fa33fc855a6db350275', 301056)
source_raw, inputs['p010SourceAudit'] = read(
    WORK / 'audit/source-v1/source-audit-v1.json',
    '14a34b6527a77dc374f650ccad9f7bd9e4c1c8bc6e23198f93eb2a82e6f7de64')
composition_raw, inputs['p010SourceComposition'] = read(
    WORK / 'audit/source-v1/source-composition-v1.json',
    'a208678fbb7602aea0decaa2cab110d4f687a11f685e32db8bf67a9fc55ee033')
scripts_raw, inputs['p010PublicToolScripts'] = read(
    WORK / 'audit/source-v1/public-tool-scripts-v1.json',
    '6ab4dbec9c878122a68865cf2bdb5a7cbbae02e98388167e1c4f08d0ae7b30e2')
audio_raw, inputs['p010AudioAudit'] = read(
    WORK / 'audit/audio-v1/audio-source-audit-v1.json',
    '142f375cbb3fb8344409b859fd5d918df9002cb63b23735b04d77a0504d48775')

tree = ET.fromstring(lesson_raw)
assert tree.findtext('PageRoot') == 'HELP_COURSES/ALG001/L6'
assert tree.findtext('CourseIMGName') == 'HELP_COURSES/ALG001/ALG001.jpg'
sections = tree.findall('Section')
rw = [section for section in sections if section.attrib.get('SName') == 'RW']
assert len(rw) == 1 and rw[0].attrib['SNumber'] == '2'
pages = rw[0].findall('Page')
assert len(pages) == 9
assert pages[8].text == 'RW/L6RW09.swf' and pages[8].attrib['Title'] == 'Page 9'
ordinal = sum(len(section.findall('Page')) for section in sections[:sections.index(rw[0])]) + 9
assert ordinal == 10 and 'L6RW09'.upper()[-2:] != '01'

composition = json.loads(composition_raw)
root = [event for event in composition['root']['events'] if event.get('kind') == 'place'
        and event.get('characterId') == 52 and event.get('name', {}).get('text') == 'animation']
assert len(root) == 1 and root[0]['frame'] == 6
assert composition['main']['domainId'] == 'sprite-52' and composition['main']['declaredFrames'] == 303
source = json.loads(source_raw)
assert source['source']['sha256'] == inputs['pageSwf']['sha256']
assert source['audio']['separateSaCandidate']['sha256'] == inputs['separateSa']['sha256']
assert source['button'] == {
    'characterId': 51, 'firstFrame': 268, 'lastFrame': 303,
    'actionSha256': '549555e0e21a60e887e614e7ff3b03592d8a7f577c5ec25e6601f039050f49c8',
    'sourceKey': 'Function', 'hostAPI': 'DoHyperLinks',
    'sourceStopTarget': '_root.animation_mc.animation', 'actualHostEffect': 'unresolved'}
scripts = json.loads(scripts_raw)
button = scripts['files']['scripts/DefineButton2_51/BUTTONCONDACTION on(release).as']
assert button == ('on(release){\n   _global.KeyAttribute = "Function";\n'
                  '   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}')
assert scripts['sourceButtonAction']['actionSha256'] == source['button']['actionSha256']
assert 'function DoHyperLinks()' in host
assert 'dtfKTLesson.text.toUpperCase() != "OFF"' in host
assert '_loc2_.KeyAttribute += "~English";' in host
assert '_loc1_.m_c.doGetSubLink(_loc2_.KeyAttribute);' in host
audio = json.loads(audio_raw)
assert audio['source']['swf']['sha256'] == inputs['pageSwf']['sha256']
assert audio['source']['separateSa']['sha256'] == inputs['separateSa']['sha256']
assert audio['embedded']['extractedMp3']['sha256'] == source['audio']['embedded']['concatenatedSha256']

payload = {
    'schemaVersion': 1, 'kind': 'alg-l06-p010-separate-sa-and-function-host-disposition-v1',
    'animationId': 'shared-alg001-l06-p010',
    'status': 'verified-static-host-algorithm-conditional-page-application-not-runtime-or-listening',
    'inputs': inputs,
    'hostAlgorithmReuse': {
        'logicalArchivePath': 'NewHelpProgram/HELP_COURSES/indexMI.swf',
        'byteIdenticalToP004VerifiedHost': True,
        'basis': 'P004 disposition and exact host SWF, scripts and controls rehashed for P010',
        'reference': 'migrations/shared-alg001-l06-p004/audit/sa-host-disposition-v1.json',
    },
    'applicability': {
        'xmlPlacement': {'globalOrdinal': 10, 'sectionCode': 'RW', 'sectionNumber': 2,
                         'sectionPageOrdinal': 9, 'file': 'RW/L6RW09.swf'},
        'pageMainPlacement': {'rootFrame': 6, 'name': 'animation', 'characterId': 52,
                              'mainFrameCount': 303},
        'derivedSaUrlTemplate': '<ServerRoot>/HELP_COURSES/ALG001/L6/SA/L6RW09.mp3',
        'staticVisibilityGate': {
            'setting': 'dtfSPANISH text uppercased equals ON',
            'activeSa': 'spanSound is not true',
            'newTitleTagTrue': '0 <= sectionNumber < arrayTotalSectionDetails.length',
            'newTitleTagOther': '1 <= sectionNumber < arrayTotalSectionDetails.length',
            'pageBasename': 'last six characters uppercased do not equal 01.SWF',
            'p010StaticResolution': 'sectionNumber 2 and suffix 09.SWF meet either section branch and basename gate',
        },
        'conditionalInputsUnobserved': ['actual host launch and page association', 'dtfSPANISH setting',
                                        'host section state', 'successful SA load'],
        'sourceRole': 'separate optional Spanish page-audio operation',
        'actualSpokenLanguage': 'unverified',
    },
    'functionGlossaryCrosswalk': {
        'sourceButtonCharacterId': 51, 'firstFrame': 268, 'sourceKey': 'Function',
        'hostApi': 'DoHyperLinks', 'hostKeyTermsGate': 'dtfKTLesson text uppercased is not OFF',
        'hostLookupSuffix': '~English',
        'sourceStopAfterHostCall': 'unconditional in button release handler',
        'reusableContentModule': 'packages/demos/src/alg-l06-p004-glossary-content-v1.ts',
        'reusableExactKey': 'Function',
        'dictionarySourceSha256': {lang: function['source'][lang]['sha256'] for lang in ('en', 'es')},
        'dictionaryEntrySha256': function['sourceEntrySha256'],
        'labels': function['labels'], 'definitions': function['definitions'],
        'actualOriginalPopupAndReturn': 'unobserved',
    },
    'modernTriggerDisposition': [
        'Offer separate SA only through an explicit user action; locale es never autoplays SA.',
        'Pause the main clock before loading SA; keep SA separate from the embedded stream.',
        'Start SA from zero only after the current load succeeds; cancel stale load on Replay, navigation or close.',
        'On return or SA end, release SA and resume retained nonterminal main position when appropriate.',
        'Keep glossary and SA ownership explicit; selecting Function must pause main and return focus after close.',
        'Do not infer a fractional old-host SA resume position or original popup outcome from static source.',
    ],
    'limits': ['Static host rule and source bindings only; no original host launch association.',
               'Actual Key Terms and Spanish Audio settings, host section state and load outcomes unobserved.',
               'No original spoken-language, listening, audio synchronization or AVM1 race acceptance.',
               'Legacy shell remains outside the page migration denominator.'],
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
