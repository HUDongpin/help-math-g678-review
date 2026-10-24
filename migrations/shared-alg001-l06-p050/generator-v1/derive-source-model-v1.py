#!/usr/bin/env python3
"""P050 source projection; reuse the admitted affine and binary-tag readers."""
import base64
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zlib

assert __debug__
sys.dont_write_bytecode = True
WORK = Path(__file__).resolve().parent.parent
ROOT = WORK.parents[1]
EXTERNAL = Path('/Volumes/American Dream/hudongpin/g678-p050-source-extraction-20261003-v1')
RECEIPT = WORK / 'audit-v1/source-extraction-v1.json'
XML = EXTERNAL / 'swfmill.xml'
GEOMETRY = ROOT / 'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
BINARY = ROOT / 'migrations/shared-alg001-l06-p048/generator-v1/derive-source-model-v1.py'
PINS = {
    RECEIPT: 'dc1d39b3411e04b96ac8f331e60100105c1d0ed16c5ae5d242d806aa04b83f16',
    XML: 'f232ae08362fa886d73819fed7ba7864e627822e585dce5c556163445537168f',
    GEOMETRY: '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906',
    BINARY: '2fb124ba601e8fa32cbc9efa0fabc3651566334cbefbba2369744b198fc05513',
}
SWF_SHA = '4353f9cbd7e60043baa8f59c7f5193fcd930778ace4b918ab56f2953f306937e'

def sha(body):
    return hashlib.sha256(body).hexdigest()

def pin(p, digest=None):
    before = p.lstat()
    assert p.is_file() and not p.is_symlink()
    body = p.read_bytes()
    after = p.lstat()
    assert all(getattr(before, key) == getattr(after, key) for key in
               ['st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns'])
    if digest:
        assert sha(body) == digest, p
    return {'path': str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),
            'bytes': len(body), 'sha256': sha(body)}

def load_module(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()

def build():
    inputs = [pin(p, digest) for p, digest in PINS.items()]
    custody = json.loads((WORK / 'audit-v1/source-custody-v1.json').read_text())
    for row in custody['files']:
        for file in [Path(row['source']), ROOT / row['copy']]:
            current = pin(file, row['sha256'])
            assert current['bytes'] == row['bytes']
            inputs.append(current)
    pages = ET.parse(WORK / 'source-v1/index.xml').getroot().findall('.//Page')
    assert len(pages) == 60 and pages[49].text == 'GS/L6GS02.swf'
    assert pages[49].get('Title') == 'Game 1'
    receipt = json.loads(RECEIPT.read_text())
    assert all(r['exitCode'] == 0 for r in receipt['runs'])
    export = Path(receipt['exportRoot'])
    assert {str(p.relative_to(export)) for p in export.rglob('*') if p.is_file()} == {p['path'] for p in receipt['files']}
    for row in receipt['files']:
        assert pin(export / row['path'], row['sha256'])['bytes'] == row['bytes']
    scripts = {r['path']: (export / r['path']).read_text() for r in receipt['files']
               if r['path'].endswith('.as')}
    def action(relative):
        return scripts['scripts/' + relative]
    def button_action(button_id):
        return action(f'DefineButton2_{button_id}/BUTTONCONDACTION on(release).as')
    h = load_module('p050_affine', GEOMETRY)
    binary_tags = load_module('p050_binary', BINARY).binary_tags
    xml = ET.parse(XML).getroot()
    head = xml.find('Header')
    assert head.attrib == {'framerate': '12', 'frames': '10'}
    fonts = {int(n.get('objectID')): {'name': n.get('name'), 'glyphs':
             [chr(int(g.get('map'))) for g in n.findall('glyphs/Glyph')]}
             for n in xml.iter('DefineFont2')}
    texts = {}
    for node in xml.iter('DefineText'):
        tid = int(node.get('objectID'))
        value, font = '', None
        for record in node.iter('TextRecord6'):
            if record.get('objectID'):
                font = int(record.get('objectID'))
            value += ''.join(fonts[font]['glyphs'][int(g.get('glyph'))]
                             for g in record.findall('glyphs/TextEntry'))
        ffdec = (export / f'texts/{tid}.txt').read_text().replace('--- RECORDSEPARATOR ---', '')
        assert re.sub(r'\s+', '', value) == re.sub(r'\s+', '', ffdec), tid
        texts[tid] = {'text': value, 'boundsTwips': h.rect(node.find('bounds/Rectangle')),
                      'matrixTwips': h.matrix(node.find('transform/Transform'))}
    edits = {int(n.get('objectID')): {'attributes': n.attrib,
             'boundsTwips': h.rect(n.find('size/Rectangle')), 'literal': n.findtext('text') or ''}
             for n in xml.iter('DefineEditText')}
    shapes = {int(n.get('objectID')): {'boundsTwips': h.rect(n.find('bounds/Rectangle'))}
              for n in xml.iter() if n.tag.startswith('DefineShape') and n.get('objectID')}
    buttons = {}
    for n in xml.iter('DefineButton2'):
        rows = [{'objectId': int(b.get('objectID')), 'matrixTwips': h.matrix(b.find('transform/Transform')),
                 'attributes': b.attrib} for b in n.findall('buttons/Button') if b.get('objectID')]
        buttons[int(n.get('objectID'))] = {'records': rows,
            'hitRecords': [r for r in rows if r['attributes'].get('hitTest') == '1']}
    sprites = {int(n.get('objectID')): n for n in xml.iter('DefineSprite')}
    domains, labels = {}, {}
    for sid, node in sprites.items():
        clean = copy.deepcopy(node)
        frame = 1
        labels[sid] = []
        for tag in list(clean.find('tags')):
            if tag.tag == 'ShowFrame':
                frame += 1
            elif tag.tag == 'FrameLabel':
                labels[sid].append({'frame': frame, 'label': tag.get('label')})
                clean.find('tags').remove(tag)
        domains[sid] = h.timeline(clean, set(texts) | set(edits) | set(buttons))
    main = domains[489]
    assert main['frameCount'] == 674
    expected_labels = [{'frame': 72, 'label': 'RepeatDirection'}, {'frame': 662, 'label': 'GS_Begin'}]
    expected_labels += [{'frame': 662 + q, 'label': f'Q{q}'} for q in range(1, 11)]
    expected_labels += [{'frame': 673, 'label': 'Final'}]
    assert labels[489] == expected_labels
    root_placement = head.find('tags/PlaceObject2[@name="animation"]')
    assert root_placement.get('objectID') == '489'
    root_matrix = h.matrix(root_placement.find('transform/Transform'))
    questions = []
    for q in range(1, 11):
        frame = 662 + q
        display = main['snapshots'][frame - 1]
        options = []
        for n in range(1, 5):
            depth, row = next((d, r) for d, r in display.items() if r['name'] == f'AnsBtn{n}')
            bid = row['objectId']
            _, hit_box = h.button_hit_box(buttons[bid], row, root_matrix, shapes)
            matches = []
            for td, item in display.items():
                tid = item['objectId']
                if tid not in [162, 164, 166, 168]:
                    continue
                text_box = h.box(texts[tid]['boundsTwips'], h.compose(root_matrix, item['matrixTwips']))
                overlap = h.overlap_of_text(text_box, hit_box)
                if overlap >= .5:
                    matches.append({'textId': tid, 'letter': texts[tid]['text'].strip(),
                                    'depth': td, 'overlap': overlap, 'boxPx': text_box})
            assert len(matches) == 1, (q, n, hit_box, matches)
            letter = matches[0]['letter']
            assert letter == 'ABCD'[n - 1], (q, n, letter)
            script = button_action(bid)
            correct = '_global.score += 10' in script
            wrong_text = re.search(r'_global.WrongFeed = "([^"]+)"', script)
            assert correct != bool(wrong_text)
            options.append({'letter': letter, 'instance': row['name'], 'buttonId': bid,
                'depth': depth, 'correct': correct, 'hitBoxPx': hit_box, 'sourceLetter': matches[0],
                'wrongText': wrong_text.group(1) if wrong_text else None,
                'unboundParentWrongCall': '_parent.showWrongFeed();' in script})
        correct = next(o['letter'] for o in options if o['correct'])
        assert sum(o['correct'] for o in options) == 1
        assert all(o['wrongText'] == f'Sorry, the correct answer was {correct}.' for o in options if not o['correct'])
        feedback = next(r for r in display.values() if r['name'] == 'Mc_Correct_Feed')['objectId']
        assert feedback in [358, 432, 479]
        wrongs = {r['name']: r['objectId'] for r in display.values()
                  if r['name'] and r['name'].startswith('Mc_Wrong_Feed')}
        assert wrongs == {f'Mc_Wrong_Feed{i}': 380 for i in range(1, 4)}
        questions.append({'number': q, 'label': f'Q{q}', 'frame': frame,
            'correctChoice': correct, 'options': options, 'correctFeedbackSpriteId': feedback,
            'correctFeedbackEndFrame': domains[feedback]['frameCount'], 'wrongFeedbackInstances': wrongs,
            'displayList': [{'depth': depth, **row} for depth, row in display.items()]})
    assert [q['correctChoice'] for q in questions] == list('DABDCAB CDB'.replace(' ', ''))
    begin = action('DefineSprite_489/frame_662/DoAction_2.as')
    for literal in ['random(_loc1_.quizLabelArray.length)', 'quizLabelArray.splice(_loc1_.tempQNo,1)',
                    'totalQuestionsCount = "10"', 'score = 0', 'totQuizCount = 0', 'gotoAndStop("Final")']:
        assert literal in begin
    for q in range(1, 11):
        script = action(f'DefineSprite_489/frame_{662+q}/DoAction.as')
        assert 'intMc_Name = random(3);' in script and 'intMc_Name += 1;' in script
    assert '_parent.gotoAndPlay(24)' in button_action(376)
    assert action('DefineSprite_380/frame_23/DoAction.as').strip() == 'stop();'
    assert '_parent.doGetRandomQuiz();' in action('DefineSprite_380/frame_28/DoAction.as')
    assert not any(n.get('name') == 'Mc_Final' for n in xml.iter())
    assert 'Mc_Final.gotoAndPlay(2)' in action('DefineSprite_489/frame_673/DoAction.as')
    assert 'function enableButton' not in '\n'.join(scripts.values())
    # Reachability follows actual display definitions; unused library prose is excluded.
    definitions = {int(n.get('objectID')): n for n in head.find('tags')
                   if n.tag.startswith('Define') and n.get('objectID')}
    reachable = {int(n.get('objectID')) for n in head.findall('tags/PlaceObject2') if n.get('objectID')}
    while True:
        expanded = reachable | {int(x.get('objectID')) for sid in reachable if sid in definitions
            for x in definitions[sid].iter() if x is not definitions[sid] and x.get('objectID')}
        if expanded == reachable:
            break
        reachable = expanded
    assert all(t not in reachable for t in [3, 4, 5])
    frame_domains = [{'spriteId': sid, 'frameCount': d['frameCount'],
        'displayReachable': sid in reachable, 'labels': labels[sid],
        'disposition': ('main-game' if sid == 489 else 'score' if sid == 265 else
            'directions-popup' if sid == 24 else 'wrong-feedback' if sid in [379, 380] else
            'correct-feedback' if sid in [358, 432, 479] else
            'placed-stopped-unselected-feedback' if sid == 345 else
            'reachable-visual' if sid in reachable else 'unplaced-library-definition'),
        'scripts': [p for p in scripts if p.startswith(f'scripts/DefineSprite_{sid}/')]}
        for sid, d in domains.items()]
    # Independently reconcile XML stream blocks with raw binary SWF tags.
    swf = (WORK / 'source-v1/L6GS02.swf').read_bytes()
    assert sha(swf) == SWF_SHA
    body = zlib.decompress(swf[8:])
    raw = b'FWS' + swf[3:8] + body
    assert len(raw) == int.from_bytes(swf[4:8], 'little')
    rect_bytes = (5 + 4 * (body[0] >> 3) + 7) // 8
    binary = {struct.unpack_from('<H', data)[0]: data for code, data, _, _
              in binary_tags(raw, 8 + rect_bytes + 4, len(raw)) if code == 39}
    outputs, streams = {}, []
    roles = {345: 'unselected-correct', 358: 'correct-358', 380: 'wrong',
             432: 'correct-432', 479: 'correct-479', 489: 'main'}
    for sid, role in roles.items():
        attrs = sprites[sid].find('tags/SoundStreamHead').attrib
        codec = int(attrs['compression'])
        assert codec == (1 if sid == 432 else 2)
        frame, offset, pieces, blocks, heads = 1, 0, [], [], []
        for code, payload, _, _ in binary_tags(binary[sid], 4, len(binary[sid])):
            if code == 1:
                frame += 1
            elif code in [18, 45]:
                heads.append(payload.hex())
            elif code == 19:
                assert len(heads) == 1 and bytes.fromhex(heads[0])[1] >> 4 == codec
                samples, seek = struct.unpack_from('<Hh', payload) if codec == 2 else (int(attrs['sampleSize']), None)
                data = payload[4:] if codec == 2 else payload
                blocks.append({'frame': frame, 'samples': samples, 'seekSamples': seek,
                    'offset': offset, 'bytes': len(data), 'sha256': sha(data), 'rawBlockSha256': sha(payload)})
                pieces.append(payload)
                offset += len(data)
        assert pieces == [base64.b64decode(n.findtext('data')) for n in sprites[sid].findall('tags/SoundStreamBlock')]
        data = b''.join(p[4:] if codec == 2 else p for p in pieces)
        extension = 'mp3' if codec == 2 else 'swf-adpcm-blocks.bin'
        file = WORK / 'assets' / f'source-stream-{sid}-{role}.{extension}'
        outputs[file] = data
        streams.append({'spriteId': sid, 'role': role, 'codec': 'mp3' if codec == 2 else 'swf-adpcm',
            'head': attrs, 'headHex': heads[0], 'blocks': blocks, 'blockCount': len(blocks),
            'firstFrame': blocks[0]['frame'], 'lastFrame': blocks[-1]['frame'],
            'assetPath': str(file.relative_to(ROOT)), 'bytes': len(data), 'sha256': sha(data),
            'selectedByPageScripts': sid != 345})
    behavior = {'selection': 'random-without-replacement', 'questionCount': 10,
        'correctPoints': 10, 'wrongPoints': 0, 'firstQuestionFrame': 663, 'beginFrame': 662,
        'finalFrame': 673, 'wrong': {'spriteId': 380, 'startFrame': 2, 'popupSpriteId': 379,
        'popupFirstFrame': 17, 'holdFrame': 23, 'closeButtonId': 376, 'closeJump': 24, 'endFrame': 28,
        'advanceAfterClose': True, 'branchCount': 3, 'allBranchesSameSprite': True},
        'score': {'spriteId': 265, 'startFrame': 2, 'normalEndFrame': 10, 'hundredStartFrame': 11,
                  'hundredEndFrame': 20, 'textId': 262},
        'directions': {'spriteId': 24, 'openButtonIds': [257,259], 'closeButtonId': 18,
                       'sourceTextIds': [19,20,21,22,23], 'repeatsAudio': False},
        'introStart': {'buttonId': 34, 'jumpsTo': 662, 'startsGame': True},
        'introSkip': {'buttonId': 38, 'jumpsTo': 662, 'startsGame': False},
        'beginStart': {'buttonId': 253, 'requestsNextQuestionOnEnterFrame': True},
        'finalStart': {'buttonId': 253, 'reinitializesGame': False,
                       'sourceEffect': 'next draw increments count beyond ten and returns to Final'},
        'unresolved': ['Mc_Final has no placed instance in this SWF',
           '_parent.enableButton has no page definition',
           'Q6 wrong button calls _parent.showWrongFeed before page-local showWrongFeed',
           'Original host enableQuizButton/disableQuizButton and gSound binding',
           'Original AVM1 RNG state, audible sync and unselected sprite345 runtime appearance']}
    model = {'schemaVersion': 1, 'kind': 'g678-p050-source-model-v1', 'animationId': WORK.name,
        'assetId': 'swf-' + SWF_SHA, 'inputs': inputs, 'extraction': pin(RECEIPT),
        'placement': {'ordinal': 50, 'section': 'GS', 'title': 'Game 1'},
        'runtime': {'stage': [800,600], 'fps': 12, 'rootFrames': 10, 'rootEntryFrame': 6,
                    'mainSpriteId': 489, 'mainFrames': 674, 'background': '#b8d8f7'},
        'rootMatrixTwips': root_matrix, 'fonts': fonts, 'texts': texts, 'editTexts': edits,
        'mainTextInstances': h.compress_selected(main), 'questions': questions,
        'behavior': behavior, 'frameDomains': frame_domains, 'streams': streams, 'scripts': scripts,
        'excludedUnplacedTextIds': [3,4,5], 'registeredCurrentJs': False,
        'originalRuntimeAccepted': False, 'listeningAccepted': False}
    outputs[WORK / 'native-v1/source-model-v1.json'] = encoded(model)
    outputs[WORK / 'audit/frame-domain-disposition.json'] = encoded({'kind': 'p050-source-frame-domains-v1',
        'sourceSha256': SWF_SHA, 'root': {'frames': 10, 'entryFrame': 6}, 'domains': frame_domains,
        'unresolved': behavior['unresolved'], 'acceptance': False})
    binding = {'sourceSha256': SWF_SHA, 'modelSha256': sha(encoded(model)), 'runtime': model['runtime'],
        'behavior': behavior, 'questions': [{k:q[k] for k in ['number','label','frame','correctChoice',
            'options','correctFeedbackSpriteId','correctFeedbackEndFrame']} for q in questions]}
    outputs[ROOT / 'packages/demos/src/alg-l06-p050-source-bindings-v1.ts'] = (
        '// Generated from pinned P050 source by derive-source-model-v1.py. Do not hand-edit.\n'
        'export const P050_SOURCE = ' + json.dumps(binding, ensure_ascii=False, indent=2) + ' as const;\n').encode()
    return model, outputs

if __name__ == '__main__':
    assert sys.argv[1:] in [['--write'], ['--check']]
    model, outputs = build()
    for file, body in outputs.items():
        if sys.argv[1] == '--write':
            file.parent.mkdir(parents=True, exist_ok=True)
            if file.exists():
                assert file.read_bytes() == body, file
            else:
                with file.open('xb') as output:
                    output.write(body)
        else:
            assert file.read_bytes() == body, file
    print(json.dumps({'mode':sys.argv[1], 'outputs':len(outputs),
        'model':pin(WORK / 'native-v1/source-model-v1.json'),
        'answers':[q['correctChoice'] for q in model['questions']],
        'streams':[{k:s[k] for k in ['spriteId','codec','bytes','blockCount']} for s in model['streams']],
        'registered':False}))
