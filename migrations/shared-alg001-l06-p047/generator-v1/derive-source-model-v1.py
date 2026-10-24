#!/usr/bin/env python3
"""P047 source text, placement, action and stream projection. No acceptance writes."""
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
    ('TI/L6TI07.swf', 272387, '7fdbb16bcea020b3a28ada7d0bfbed26d077b339a914a86f493feb6827a9e893'),
    ('index.xml', 13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    ('SA/L6TI07.mp3', 196560, '88e7c0f01e0569f5c8c828561669c87b4e468dbd218deca399db09bdb418448e'),
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
    assert not (SOURCE/'TI/L6TI07.fla').exists()
    pages = ET.parse(SOURCE/'index.xml').getroot().findall('.//Page')
    assert len(pages) == 60 and pages[46].text == 'TI/L6TI07.swf'
    assert pages[46].get('Title') == 'Question 6'
    inputs.append(pin(XML, '8ce7695ae54e7c0f52bff3791c20b8031c5360f236d05d5a78fc71b6b40ff418'))
    inputs.append(pin(HELPER, '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'))
    inputs.append(pin(INVENTORY, '8d079c225faa92eaa2a4ef9ec8fc7e4f333df0cc1afe72eafa933a0805a6e328'))
    inventory = json.loads(INVENTORY.read_text())
    assert len(inventory) == 98
    assert {str(p.relative_to(EXPORT)) for p in EXPORT.rglob('*') if p.is_file()} == {r['path'] for r in inventory}
    for row in inventory:
        assert pin(EXPORT/row['path'], row['sha256'])['bytes'] == row['bytes']
    scripts = {row['path']: (EXPORT/row['path']).read_text() for row in inventory if row['path'].endswith('.as')}
    assert len(scripts) == 36
    def action(name):
        return scripts['scripts/'+name]
    assert 'quizDragCount = 0' in action('DefineSprite_117/frame_208/DoAction.as')
    assert 'stop();' in action('DefineSprite_117/frame_889/DoAction.as')
    quiz_scripts = {k:v for k,v in scripts.items() if '/frame_208/' in k}
    fixed = [v for k,v in quiz_scripts.items() if 'on(releaseOutside,release)' in k and 'tempMcName' in v]
    dual = [v for k,v in quiz_scripts.items() if 'on(releaseOutside,release)' in k and 'Drop_mc1' in v]
    assert len(fixed) == 3 and len(set(fixed)) == 1
    assert len(dual) == 2 and len(set(dual)) == 1
    for expression in ['_global.quizDragCount++', 'enabled = false', 'Coach_audio_2.gotoAndPlay(2)', 'Coach_audio_1.gotoAndPlay(2)']:
        assert expression in fixed[0] and expression in dual[0]
    assert '_parent.Drop_mc1._visible = false' in dual[0] and '_parent.Drop_mc2._visible = false' in dual[0]
    assert 'showWrongFeed' not in dual[0] and 'showWrongFeed' in fixed[0]
    # Later frame210 changes names/scripts for the explanatory timeline; these
    # do not change the actual quiz208 acceptance relation.
    assert len([k for k in scripts if '/frame_210/' in k and 'on(releaseOutside,release)' in k]) == 2
    right_end = action('DefineSprite_72/frame_20/DoAction.as')
    assert '_global.quizDragCount >= 5' in right_end and '_parent.play()' in right_end
    assert not any('function enableButton' in s or 'function disableButton' in s for s in scripts.values())
    spec = importlib.util.spec_from_file_location('p047_affine', HELPER)
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
    assert len(texts) == 62 and not list(root.iter('DefineEditText'))
    sprites = {int(n.get('objectID')): n for n in root.iter('DefineSprite')}
    domains = {i: h.timeline(s, set(texts)) for i, s in sprites.items()}
    main = domains[117]
    assert main['frameCount'] == 890
    root_place = header.find('tags/PlaceObject2[@name="animation"]')
    assert root_place.get('objectID') == '117'
    root_matrix = h.matrix(root_place.find('transform/Transform'))
    quiz = main['snapshots'][207]
    named = {row['name']: row for row in quiz.values() if row['name']}
    assert not any(n.startswith(('Mc_Right_Feed', 'Mc_Wrong_Feed', 'AnsBtn')) for n in named)
    shapes = {int(n.get('objectID')): h.rect(n.find('bounds/Rectangle')) for n in root.iter()
              if n.tag.startswith('DefineShape') and n.get('objectID')}
    drags = []
    for index in range(1, 6):
        source_name = {1:'Drag_1',2:'Src_2',3:'Src_3',4:'Src_4',5:'Drag_2'}[index]
        target_name = {1:'Drop_mc1',2:'Tar_2',3:'Tar_3',4:'Tar_4',5:'Drop_mc2'}[index]
        source, target = named[source_name], named[target_name]
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
        drags.append({'id': index, 'sourceInstance': source_name, 'targetInstance': target_name,
                      'acceptedTargets': [1,5] if index in [1,5] else [index],
                      'spriteId': source['objectId'], 'textId': text_id, 'value': texts[text_id]['text'],
                      'sourceBoxPx': h.union_boxes(s_boxes), 'targetBoxPx': h.union_boxes(t_boxes),
                      'sourceOriginPx': [s_matrix['transX']/20, s_matrix['transY']/20],
                      'targetOriginPx': [t_matrix['transX']/20, t_matrix['transY']/20]})
    assert [(r['id'], r['spriteId'], r['textId'], r['value']) for r in drags] == [
        (1,62,40,'6'),(2,63,41,'–3'),(3,61,39,'0'),(4,64,42,'–4'),(5,65,40,'6')]
    assert [r['id'] for r in sorted(drags,key=lambda d:d['sourceOriginPx'][1])] == [4,2,1,5,3]
    assert [r['id'] for r in sorted(drags,key=lambda d:d['targetOriginPx'][1])] == [1,2,3,4,5]
    glossary = []
    for path, script in scripts.items():
        match = re.search(r'_global.KeyAttribute = "([^"]+)"', script)
        if not match:
            continue
        button = int(re.search(r'DefineButton2_(\d+)', path).group(1))
        for sprite_id in [117, 92]:
            visible = [f+1 for f, snapshot in enumerate(domains[sprite_id]['snapshots'])
                       if any(row['objectId'] == button for row in snapshot.values())]
            if visible:
                glossary.append({'buttonId': button, 'term': match.group(1), 'spriteId': sprite_id,
                                 'frameRanges': ranges(visible), 'scriptPath': path})
    # Reconstruct MP3 payloads independently from raw SWF tags and cross-check XML bytes.
    swf = (WORK/'source-v1/L6TI07.swf').read_bytes()
    body = zlib.decompress(swf[8:])
    assert len(body)+8 == int.from_bytes(swf[4:8], 'little') == 416927
    fws = b'FWS'+swf[3:8]+body
    rect_bytes = (5+4*(body[0] >> 3)+7)//8
    binary = {struct.unpack_from('<H', data)[0]: (data, offset) for code, data, _, offset
              in binary_tags(fws, 8+rect_bytes+4, len(fws)) if code == 39}
    streams, assets = [], {}
    for sprite_id, role in [(70, 'wrong'), (72, 'right'), (117, 'main')]:
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
        assert len(pieces) == (871 if sprite_id == 117 else 19)
        assert frame == frame_count+1
        raw = b''.join(p[4:] for p in pieces)
        name = f'source-stream-{sprite_id}-{role}.mp3'
        assets[name] = raw
        streams.append({'spriteId': sprite_id, 'role': role, 'frameCount': frame_count,
                        'headHex': heads[0], 'head': sprites[sprite_id].find('tags/SoundStreamHead').attrib,
                        'blockCount': len(records), 'blocks': records, 'payloadBytes': len(raw),
                        'payloadSha256': sha(raw), 'assetPath': str((WORK/'assets'/name).relative_to(ROOT))})
    raw_text_runs = h.compress_selected(main)
    model = {'schemaVersion': 1, 'kind': 'g678-p047-source-derived-model-v1',
             'animationId': 'shared-alg001-l06-p047', 'assetId': 'swf-'+PHYSICAL[0][2],
             'inputs': inputs, 'placement': {'ordinal': 47, 'section': 'TI', 'sectionOrdinal': 6, 'title': 'Question 6'},
             'runtime': {'stage': [800, 600], 'fps': 12, 'rootFrames': 10, 'rootEntryFrame': 6,
                         'mainSpriteId': 117, 'mainFrames': 890, 'quizFrame': 208, 'resumeFrame': 209, 'terminalFrame': 889, 'trailingFrameNotNaturallyReached': 890},
             'rootMatrixTwips': root_matrix, 'texts': texts, 'mainTextInstances': raw_text_runs,
             'drags': drags, 'glossary': glossary, 'streams': streams,
             'graph': {'sourceGridShape':20, 'sourcePointsShape':27, 'coordinateTextIds':[96,97,98,99,100],
                       'points':[[-6,6],[-3,-3],[2,-4],[0,-5],[6,6]],
                       'pointLabels':[texts[i]['text'] for i in [96,97,98,99,100]]},
             'sourceBehavior': {'correctPredicate': 'Src_2/3/4 to Tar_2/3/4; Drag_1/2 to either visible Drop_mc1/2', 'completionCount': 5,
                 'completionTrigger': 'right coach sprite72 frame20 when quizDragCount >= 5',
                 'wrongDrop': 'restore origin; show Try again; restart wrong coach70 at2; fixed sources call showWrongFeed, duplicate6 sources do not',
                 'correctDrop': 'snap to target; disable that source; increment count; restart right coach72 at2',
                 'nextPress': 'hide Try again', 'coachesMayOverlap': True, 'unsolvedSourcesRemainEnabled': True,
                 'coachTerminal': 20, 'coachLoopDestination': 1, 'coachFrame1Stopped': True,
                 'mainAfterCompletion': 'resume from held208; end hold889; frame890 exists but follows source stop',
                 'help': 'show Mc_Popup92; disable NMH; Close hides owning popup; enable NMH',
                 'helpSubclips': 'Mc_Ani/Mc_Ani1/Mc_Ani2 absent in popup92; no invented help animation'},
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
                      'mainFrames': 890, 'streams': [{k: s[k] for k in ['spriteId', 'role', 'blockCount', 'payloadBytes', 'payloadSha256']} for s in model['streams']]}))


if __name__ == '__main__':
    main()
