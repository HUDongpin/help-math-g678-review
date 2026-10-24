#!/usr/bin/env python3
"""P046 source text, placement, action and stream projection. No acceptance writes."""
import base64
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
HERE = Path(__file__).resolve().parent
WORK = HERE.parent
ROOT = WORK.parents[1]
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
HELPER = ROOT/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
XML = WORK/'audit-v1/swfmill.xml'
EXPORT = WORK/'audit-v1/ffdec-export'
INVENTORY = WORK/'audit-v1/ffdec-source-inventory-v1.json'
OUTPUT = WORK/'native-v1/source-model-v1.json'
PHYSICAL = [
    ('TI/L6TI06.swf', 240172, 'c69f1f0fdaff0201af171aaee6b9b90a33b483e8c93ffef406c31cf0853a54b8'),
    ('index.xml', 13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    ('SA/L6TI06.mp3', 350784, 'de3c127ba68d082b9a296fb17cb31a72f477f460fde01b8e3370402bb414f18e'),
]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def pin(p, expected=None):
    before = p.lstat()
    assert p.is_file() and not p.is_symlink(), p
    raw = p.read_bytes()
    after = p.lstat()
    assert (before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_ino, after.st_size, after.st_mtime_ns)
    if expected:
        assert sha(raw) == expected, p
    return {'path': str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),
            'bytes': len(raw), 'sha256': sha(raw)}


def ranges(frames):
    result = []
    for frame in frames:
        if result and result[-1][1] == frame-1:
            result[-1][1] = frame
        else:
            result.append([frame, frame])
    return result


def binary_tags(raw, start, end):
    at = start
    while at < end:
        offset = at
        word = struct.unpack_from('<H', raw, at)[0]
        at += 2
        code, size = word >> 6, word & 63
        if size == 63:
            size = struct.unpack_from('<I', raw, at)[0]
            at += 4
        assert at+size <= end
        yield code, raw[at:at+size], offset, at
        at += size
    assert at == end


def build():
    inputs = []
    for name, size, digest in PHYSICAL:
        current = pin(SOURCE/name, digest)
        assert current['bytes'] == size
        inputs.extend([current, pin(WORK/'source-v1'/Path(name).name, digest)])
    assert not (SOURCE/'TI/L6TI06.fla').exists()
    pages = ET.parse(SOURCE/'index.xml').getroot().findall('.//Page')
    assert len(pages) == 60 and pages[45].text == 'TI/L6TI06.swf'
    assert pages[45].get('Title') == 'Question 5'
    inputs.append(pin(XML, 'aab8667954e9af729979f4ba88aeecd9bbfcfd714218311dcbff59ac78cbb31c'))
    inputs.append(pin(HELPER, '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'))
    inputs.append(pin(INVENTORY, '0f21931d79da2d313960cf3cb74c562fe6f84b19aca774fb4390725da38d9276'))
    inventory = json.loads(INVENTORY.read_text())
    assert len(inventory) == 88
    assert {str(p.relative_to(EXPORT)) for p in EXPORT.rglob('*') if p.is_file()} == {r['path'] for r in inventory}
    for row in inventory:
        assert pin(EXPORT/row['path'], row['sha256'])['bytes'] == row['bytes']
    scripts = {row['path']: (EXPORT/row['path']).read_text() for row in inventory if row['path'].endswith('.as')}
    assert len(scripts) == 31
    def action(name):
        return scripts['scripts/'+name]
    assert 'quizDragCount = 0' in action('DefineSprite_123/frame_163/DoAction.as')
    assert 'stop();' in action('DefineSprite_123/frame_743/DoAction.as')
    release_scripts = [v for k, v in scripts.items() if 'on(releaseOutside,release)' in k]
    assert len(release_scripts) == 5 and len(set(release_scripts)) == 1
    release = release_scripts[0]
    for expression in ['"Tar_" + _name.substring', '_global.quizDragCount++', 'enabled = false',
                       'Coach_audio_2.gotoAndPlay(2)', 'Coach_audio_1.gotoAndPlay(2)', '_X = oX', '_Y = oY']:
        assert expression in release
    right_end = action('DefineSprite_63/frame_20/DoAction.as')
    assert '_global.quizDragCount >= 5' in right_end and '_parent.play()' in right_end
    assert not any('function enableButton' in s or 'function disableButton' in s for s in scripts.values())
    spec = importlib.util.spec_from_file_location('p046_affine', HELPER)
    h = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(h)
    root = ET.parse(XML).getroot()
    header = root.find('Header')
    assert header.attrib == {'framerate': '12', 'frames': '10'}
    fonts = {int(n.get('objectID')): [chr(int(g.get('map'))) for g in n.findall('glyphs/Glyph')]
             for n in root.iter('DefineFont2')}
    texts = {}
    for n in root.iter('DefineText'):
        value, font = '', None
        for rec in n.iter('TextRecord6'):
            if rec.get('objectID') is not None:
                font = int(rec.get('objectID'))
            value += ''.join(fonts[font][int(g.get('glyph'))] for g in rec.findall('glyphs/TextEntry'))
        tid = int(n.get('objectID'))
        ffdec = (EXPORT/f'texts/{tid}.txt').read_text().replace('--- RECORDSEPARATOR ---', '')
        assert re.sub(r'\s+', '', ffdec) == re.sub(r'\s+', '', value), tid
        texts[tid] = {'text': value, 'boundsTwips': h.rect(n.find('bounds/Rectangle'))}
    assert len(texts) == 57 and not list(root.iter('DefineEditText'))
    sprites = {int(n.get('objectID')): n for n in root.iter('DefineSprite')}
    domains = {i: h.timeline(s, set(texts)) for i, s in sprites.items()}
    main = domains[123]
    assert main['frameCount'] == 743
    root_place = header.find('tags/PlaceObject2[@name="animation"]')
    assert root_place.get('objectID') == '123'
    root_matrix = h.matrix(root_place.find('transform/Transform'))
    quiz = main['snapshots'][162]
    named = {row['name']: row for row in quiz.values() if row['name']}
    assert not any(n.startswith(('Mc_Right_Feed', 'Mc_Wrong_Feed', 'AnsBtn')) for n in named)
    shapes = {int(n.get('objectID')): h.rect(n.find('bounds/Rectangle')) for n in root.iter()
              if n.tag.startswith('DefineShape') and n.get('objectID')}
    drags = []
    for index in range(1, 6):
        source, target = named[f'Src_{index}'], named[f'Tar_{index}']
        child = domains[source['objectId']]['snapshots'][0]
        text_rows = [row for row in child.values() if row['objectId'] in texts]
        assert len(text_rows) == 1
        text_id = text_rows[0]['objectId']
        s_matrix = h.compose(root_matrix, source['matrixTwips'])
        t_matrix = h.compose(root_matrix, target['matrixTwips'])
        s_boxes = [h.box(shapes[row['objectId']], h.compose(s_matrix, row['matrixTwips']))
                   for row in child.values() if row['objectId'] in shapes]
        t_child = domains[target['objectId']]['snapshots'][0]
        t_boxes = [h.box(shapes[row['objectId']], h.compose(t_matrix, row['matrixTwips']))
                   for row in t_child.values() if row['objectId'] in shapes]
        drags.append({'id': index, 'sourceInstance': f'Src_{index}', 'targetInstance': f'Tar_{index}',
                      'spriteId': source['objectId'], 'textId': text_id, 'value': texts[text_id]['text'],
                      'sourceBoxPx': h.union_boxes(s_boxes), 'targetBoxPx': h.union_boxes(t_boxes),
                      'sourceOriginPx': [s_matrix['transX']/20, s_matrix['transY']/20],
                      'targetOriginPx': [t_matrix['transX']/20, t_matrix['transY']/20]})
    assert [(r['id'], r['spriteId'], r['textId'], r['value']) for r in drags] == [
        (1, 55, 31, '–3'), (2, 53, 29, '–8'), (3, 56, 32, '0'), (4, 52, 28, '4'), (5, 54, 30, '6')]
    assert [row['id'] for row in sorted(drags, key=lambda d: d['sourceOriginPx'][1])] == [3, 1, 5, 2, 4]
    assert [row['id'] for row in sorted(drags, key=lambda d: d['targetOriginPx'][1])] == [1, 2, 3, 4, 5]
    glossary = []
    for path, script in scripts.items():
        match = re.search(r'_global.KeyAttribute = "([^"]+)"', script)
        if not match:
            continue
        button = int(re.search(r'DefineButton2_(\d+)', path).group(1))
        for sprite_id in [123, 85]:
            visible = [f+1 for f, snapshot in enumerate(domains[sprite_id]['snapshots'])
                       if any(row['objectId'] == button for row in snapshot.values())]
            if visible:
                glossary.append({'buttonId': button, 'term': match.group(1), 'spriteId': sprite_id,
                                 'frameRanges': ranges(visible), 'scriptPath': path})
    # Reconstruct MP3 payloads independently from raw SWF tags and cross-check XML bytes.
    swf = (WORK/'source-v1/L6TI06.swf').read_bytes()
    body = zlib.decompress(swf[8:])
    assert len(body)+8 == int.from_bytes(swf[4:8], 'little') == 349843
    fws = b'FWS'+swf[3:8]+body
    rect_bytes = (5+4*(body[0] >> 3)+7)//8
    binary = {struct.unpack_from('<H', data)[0]: (data, offset) for code, data, _, offset
              in binary_tags(fws, 8+rect_bytes+4, len(fws)) if code == 39}
    streams, assets = [], {}
    for sprite_id, role in [(61, 'wrong'), (63, 'right'), (123, 'main')]:
        data, base = binary[sprite_id]
        identifier, frame_count = struct.unpack_from('<HH', data)
        frame, records, heads, pieces, payload_offset = 1, [], [], [], 0
        for code, payload, offset, data_offset in binary_tags(data, 4, len(data)):
            if code == 1:
                frame += 1
            elif code in [18, 45]:
                heads.append(payload.hex())
            elif code == 19:
                samples, seek = struct.unpack_from('<Hh', payload)
                mp3 = payload[4:]
                records.append({'frame': frame, 'samples': samples, 'seekSamples': seek,
                                'payloadOffset': payload_offset, 'payloadBytes': len(mp3),
                                'rawBlockSha256': sha(payload), 'payloadSha256': sha(mp3),
                                'tagOffsetInFws': base+offset, 'dataOffsetInFws': base+data_offset})
                payload_offset += len(mp3)
                pieces.append(payload)
        xml_blocks = [base64.b64decode(n.findtext('data')) for n in sprites[sprite_id].findall('tags/SoundStreamBlock')]
        assert pieces == xml_blocks and len(heads) == 1
        assert len(pieces) == (724 if sprite_id == 123 else 19)
        assert frame == frame_count+1
        raw = b''.join(p[4:] for p in pieces)
        name = f'source-stream-{sprite_id}-{role}.mp3'
        assets[name] = raw
        streams.append({'spriteId': sprite_id, 'role': role, 'frameCount': frame_count,
                        'headHex': heads[0], 'head': sprites[sprite_id].find('tags/SoundStreamHead').attrib,
                        'blockCount': len(records), 'blocks': records, 'payloadBytes': len(raw),
                        'payloadSha256': sha(raw), 'assetPath': str((WORK/'assets'/name).relative_to(ROOT))})
    raw_text_runs = h.compress_selected(main)
    model = {'schemaVersion': 1, 'kind': 'g678-p046-source-derived-model-v1',
             'animationId': 'shared-alg001-l06-p046', 'assetId': 'swf-'+PHYSICAL[0][2],
             'inputs': inputs, 'placement': {'ordinal': 46, 'section': 'TI', 'sectionOrdinal': 5, 'title': 'Question 5'},
             'runtime': {'stage': [800, 600], 'fps': 12, 'rootFrames': 10, 'rootEntryFrame': 6,
                         'mainSpriteId': 123, 'mainFrames': 743, 'quizFrame': 163, 'resumeFrame': 164},
             'rootMatrixTwips': root_matrix, 'texts': texts, 'mainTextInstances': raw_text_runs,
             'drags': drags, 'glossary': glossary, 'streams': streams,
             'sourceBehavior': {'correctPredicate': 'Src_n must drop on Tar_n', 'completionCount': 5,
                 'completionTrigger': 'right coach sprite63 frame20 when quizDragCount >= 5',
                 'wrongDrop': 'restore original position; show Try again; restart wrong coach61 at2',
                 'correctDrop': 'snap to target; disable that source; increment count; restart right coach63 at2',
                 'nextPress': 'hide Try again', 'coachesMayOverlap': True, 'unsolvedSourcesRemainEnabled': True,
                 'coachTerminal': 20, 'coachLoopDestination': 1, 'coachFrame1Stopped': True,
                 'mainAfterCompletion': 'resume from held163; end hold743',
                 'help': 'show Mc_Popup85; disable NMH; Close hides owning popup; enable NMH',
                 'helpSubclips': 'Mc_Ani/Mc_Ani1/Mc_Ani2 absent in popup85; no invented help animation'},
             'hostCompatibility': {'pageDefinedEnableButton': False, 'pageFeedbackVariantClips': [],
                 'unresolvedHistoricalHostBinding': True,
                 'scope': 'IndexMI historical usage not proven; absent page targets must not create random feedback variants.'},
             'registeredCurrentJs': False, 'originalRuntimeAccepted': False, 'listeningAccepted': False}
    return model, assets


def main():
    assert sys.argv[1:] in [['--write'], ['--check']]
    model, assets = build()
    outputs = {OUTPUT: (json.dumps(model, indent=2, ensure_ascii=False)+'\n').encode(),
               **{WORK/'assets'/name: raw for name, raw in assets.items()}}
    for path, raw in outputs.items():
        if sys.argv[1] == '--write':
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open('xb') as out:
                out.write(raw)
        else:
            assert path.read_bytes() == raw, path
    print(json.dumps({'modelSha256': sha(outputs[OUTPUT]), 'texts': len(model['texts']),
                      'mainFrames': 743, 'streams': [{k: s[k] for k in ['spriteId', 'role', 'blockCount', 'payloadBytes', 'payloadSha256']} for s in model['streams']]}))


if __name__ == '__main__':
    main()
