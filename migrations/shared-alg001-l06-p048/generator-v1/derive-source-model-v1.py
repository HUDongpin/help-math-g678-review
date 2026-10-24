#!/usr/bin/env python3
"""Source-locked P048 projection; no registration or acceptance writes."""
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
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
HELPER = ROOT/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
XML = WORK/'audit-v1/swfmill.xml'
EXPORT = WORK/'audit-v1/ffdec-export'
INVENTORY = WORK/'audit-v1/ffdec-source-inventory-v1.json'
PINS = {
    XML: 'fdb167ce605f52fd1af985f1a7a74a000f384871b9374d6f5e054aadf2e20f53',
    INVENTORY: '827bdebc60b80520cd8131856b118d4309fd2fe677cece4076edb3533fa80024',
    HELPER: '5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906',
}
PHYSICAL = [
    ('TI/L6TI08.swf', 829399, '03a8334e6349a9e80b47bdea4d2c5ada40f635570be5d63f70e8706a03761780'),
    ('index.xml', 13926, '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),
    ('SA/L6TI08.mp3', 192528, 'b76a62e5c4af35ab3ba277c2e186bf2d148a319b63c8fe9a9f954ae15057e5fd'),
]

def sha(raw): return hashlib.sha256(raw).hexdigest()

def pin(path, expected=None):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink(), path
    raw = path.read_bytes()
    after = path.lstat()
    keys = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns')
    assert all(getattr(before, k) == getattr(after, k) for k in keys), path
    if expected: assert sha(raw) == expected, path
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
            'bytes': len(raw), 'sha256': sha(raw)}

def binary_tags(raw, start, end):
    at = start
    while at < end:
        offset = at
        word = struct.unpack_from('<H', raw, at)[0]; at += 2
        code, size = word >> 6, word & 63
        if size == 63:
            size = struct.unpack_from('<I', raw, at)[0]; at += 4
        assert at + size <= end
        yield code, raw[at:at+size], offset, at
        at += size
    assert at == end

def build():
    inputs = [pin(p, digest) for p, digest in PINS.items()]
    for name, size, digest in PHYSICAL:
        for p in [SOURCE/name, WORK/'source-v1'/Path(name).name]:
            row = pin(p, digest); assert row['bytes'] == size; inputs.append(row)
    pages = ET.parse(SOURCE/'index.xml').getroot().findall('.//Page')
    assert len(pages) == 60 and pages[47].text == 'TI/L6TI08.swf'
    assert pages[47].get('Title') == 'Question 7'
    assert not (SOURCE/'TI/L6TI08.fla').exists()
    inventory = json.loads(INVENTORY.read_text())
    assert len(inventory) == 175
    assert {str(p.relative_to(EXPORT)) for p in EXPORT.rglob('*') if p.is_file()} == {r['path'] for r in inventory}
    for row in inventory:
        assert pin(EXPORT/row['path'], row['sha256'])['bytes'] == row['bytes']
    scripts = {r['path']: (EXPORT/r['path']).read_text() for r in inventory if r['path'].endswith('.as')}
    assert len(scripts) == 64
    def action(p): return scripts['scripts/'+p]
    wrong = action('DefineButton2_174/BUTTONCONDACTION on(release).as')
    right = action('DefineButton2_175/BUTTONCONDACTION on(release).as')
    assert 'Mc_Wrong_Feed4.gotoAndPlay(2)' in wrong and 'Mc_Right_Feed4.gotoAndPlay(2)' in right
    assert 'Study the graph carefully.Try again.' in wrong
    assert not any('showWrongFeed' in s or 'showRightFeed' in s for s in scripts.values())
    assert '_global.quizTryCount++' in action('DefineSprite_304/frame_31/DoAction.as')
    assert '_global.quizTryCount >= 2' in action('DefineSprite_304/frame_31/DoAction.as')
    assert 'quizTryCount' not in action('DefineSprite_217/frame_25/DoAction.as')
    assert '_parent.gotoAndPlay(23)' in action('DefineButton2_297/BUTTONCONDACTION on(release).as')
    assert action('DefineSprite_304/frame_22/DoAction.as').strip() == 'stop();'
    assert action('DefineSprite_348/frame_327/DoAction.as').strip() == 'stop();'
    assert not any('function enableButton' in s for s in scripts.values())
    spec = importlib.util.spec_from_file_location('p048_geometry', HELPER)
    h = importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
    xml = ET.parse(XML).getroot(); header = xml.find('Header')
    assert header.attrib == {'framerate':'12', 'frames':'10'}
    fonts = {int(n.get('objectID')): {'name':n.get('name'),
        'glyphs':[chr(int(g.get('map'))) for g in n.findall('glyphs/Glyph')]}
        for n in xml.iter('DefineFont2')}
    fftexts = {int(p.stem.split('_')[0]):p for p in (EXPORT/'texts').glob('*.txt')}
    texts = {}
    for n in xml.iter('DefineText'):
        tid = int(n.get('objectID')); value = ''; font = None
        for rec in n.iter('TextRecord6'):
            if rec.get('objectID') is not None: font = int(rec.get('objectID'))
            value += ''.join(fonts[font]['glyphs'][int(g.get('glyph'))] for g in rec.findall('glyphs/TextEntry'))
        assert re.sub(r'\s+', '', value) == re.sub(r'\s+', '', fftexts[tid].read_text().replace('--- RECORDSEPARATOR ---', '')), tid
        texts[tid] = {'text':value, 'boundsTwips':h.rect(n.find('bounds/Rectangle')),
                      'matrixTwips':h.matrix(n.find('transform/Transform'))}
    edits = {int(n.get('objectID')): {'attributes':n.attrib,
             'boundsTwips':h.rect(n.find('size/Rectangle')), 'literal':n.findtext('text') or ''}
             for n in xml.iter('DefineEditText')}
    shapes = {int(n.get('objectID')):{'boundsTwips':h.rect(n.find('bounds/Rectangle'))}
              for n in xml.iter() if n.tag.startswith('DefineShape') and n.get('objectID')}
    buttons = {}
    for n in xml.iter('DefineButton2'):
        records = [{'objectId':int(x.get('objectID')), 'attributes':x.attrib,
                    'matrixTwips':h.matrix(x.find('transform/Transform'))}
                   for x in n.findall('buttons/Button') if x.get('objectID')]
        buttons[int(n.get('objectID'))] = {'records':records,
            'hitRecords':[r for r in records if r['attributes'].get('hitTest')=='1']}
    sprites = {int(n.get('objectID')):n for n in xml.iter('DefineSprite')}
    labels = {}
    domains = {}
    for i,n in sprites.items():
        projection = copy.deepcopy(n)
        frame = 1
        labels[i] = []
        for tag in list(projection.find('tags')):
            if tag.tag == 'ShowFrame': frame += 1
            elif tag.tag == 'FrameLabel':
                labels[i].append({'frame':frame,'label':tag.get('label')})
                projection.find('tags').remove(tag)
        domains[i] = h.timeline(projection, set(texts)|set(edits)|set(buttons))
    assert [(i,rows) for i,rows in labels.items() if rows] == [(11,[{'frame':1,'label':'Symbol_36'}])]
    main = domains[348]; assert main['frameCount'] == 327
    root_place = header.find('tags/PlaceObject2[@name="animation"]')
    assert root_place.get('objectID') == '348'
    root_matrix = h.matrix(root_place.find('transform/Transform'))
    quiz = main['snapshots'][223]
    options = []
    for instance in ['AnsBtn1','AnsBtn2','AnsBtn3','AnsBtn4']:
        row = next(x for x in quiz.values() if x['name'] == instance)
        hits, hit_box = h.button_hit_box(buttons[row['objectId']], row, root_matrix, shapes)
        candidates = []
        for x in quiz.values():
            if x['objectId'] not in [52,37,60,49,167,169,171,173]: continue
            t = texts[x['objectId']]
            box = h.box(t['boundsTwips'], h.compose(root_matrix,x['matrixTwips']))
            overlap = h.overlap_of_text(box,hit_box)
            if overlap >= .5: candidates.append({'textId':x['objectId'],'text':t['text'],'boxPx':box,'overlap':overlap})
        letters = [x for x in candidates if x['text'] in 'ABCD']
        prose = [x for x in candidates if x not in letters]
        assert len(letters) == len(prose) == 1, (instance,candidates)
        options.append({'letter':letters[0]['text'], 'instance':instance, 'buttonId':row['objectId'],
            'branch':'right4' if row['objectId']==175 else 'wrong4', 'letterTextId':letters[0]['textId'],
            'textId':prose[0]['textId'],'text':prose[0]['text'], 'hitBoxPx':hit_box,'textOverlap':prose[0]['overlap']})
    options.sort(key=lambda x:x['letter'])
    assert [(r['letter'],r['instance'],r['buttonId'],r['textId']) for r in options] == [
        ('A','AnsBtn2',175,167),('B','AnsBtn1',174,169),('C','AnsBtn3',174,171),('D','AnsBtn4',174,173)]
    glossary=[]
    for path,script in scripts.items():
        match=re.search(r'_global.KeyAttribute = "([^"]+)"',script)
        if not match: continue
        bid=int(re.search(r'DefineButton2_(\d+)',path).group(1))
        owner=139 if bid==137 else 348
        frames=[i+1 for i,snapshot in enumerate(domains[owner]['snapshots']) if any(x['objectId']==bid for x in snapshot.values())]
        assert frames
        glossary.append({'buttonId':bid,'term':match.group(1),'ownerSpriteId':owner,
                         'firstFrame':min(frames),'lastFrame':max(frames),'scriptPath':path})
    assert sorted(x['buttonId'] for x in glossary)==[137,158,159,160,161]
    # Inventory display-reachable definitions separately from retained library material.
    definitions={int(n.get('objectID')):n for n in header.find('tags')
                 if n.tag.startswith('Define') and n.get('objectID')}
    reachable={int(n.get('objectID')) for n in header.findall('tags/PlaceObject2') if n.get('objectID')}
    while True:
        expanded=reachable|{int(x.get('objectID')) for i in reachable if i in definitions
                            for x in definitions[i].iter() if x.get('objectID')}
        if expanded==reachable:break
        reachable=expanded
    frame_domains=[{'spriteId':i,'frameCount':d['frameCount'],
        'displayReachable':i in reachable,'labels':labels[i],
        'disposition':('main-source-observer' if i==348 else 'maintained-static-help' if i==139
          else 'active-feedback4' if i in [217,304,300] else 'retained-unselected-feedback' if i in reachable
          else 'unplaced-library-definition'),
        'scriptPaths':[p for p in scripts if re.match(r'scripts/DefineSprite_'+str(i)+r'(?:/|_)',p)]}
        for i,d in domains.items()]
    swf=(WORK/'source-v1/L6TI08.swf').read_bytes();body=zlib.decompress(swf[8:]);fws=b'FWS'+swf[3:8]+body
    assert len(fws)==int.from_bytes(swf[4:8],'little')
    rect_bytes=(5+4*(body[0]>>3)+7)//8
    binary={struct.unpack_from('<H',data)[0]:(data,offset) for code,data,_,offset
            in binary_tags(fws,8+rect_bytes+4,len(fws)) if code==39}
    streams=[];assets={}
    roles={217:'right4',251:'right1',259:'right2',287:'right3',304:'wrong4',318:'wrong2',332:'wrong3',346:'wrong1',348:'main'}
    for sprite_id,role in roles.items():
        data,base=binary[sprite_id];_,frames=struct.unpack_from('<HH',data)
        f=1;blocks=[];pieces=[];heads=[];offset=0
        for code,payload,tag_at,data_at in binary_tags(data,4,len(data)):
            if code==1:f+=1
            elif code in [18,45]:heads.append(payload.hex())
            elif code==19:
                samples,seek=struct.unpack_from('<Hh',payload);mp3=payload[4:]
                blocks.append({'frame':f,'samples':samples,'seekSamples':seek,'payloadOffset':offset,
                  'payloadBytes':len(mp3),'rawBlockSha256':sha(payload),'payloadSha256':sha(mp3),
                  'tagOffsetInFws':base+tag_at,'dataOffsetInFws':base+data_at})
                pieces.append(payload);offset+=len(mp3)
        assert pieces==[base64.b64decode(n.findtext('data')) for n in sprites[sprite_id].findall('tags/SoundStreamBlock')]
        assert len(heads)==1 and f==frames+1
        raw=b''.join(p[4:] for p in pieces);name=f'source-stream-{sprite_id}-{role}.mp3'
        assets[WORK/'assets'/name]=raw
        streams.append({'spriteId':sprite_id,'role':role,'activeAnswerPath':role in ['main','right4','wrong4'],
           'frameCount':frames,'headHex':heads[0],'head':sprites[sprite_id].find('tags/SoundStreamHead').attrib,
           'blockCount':len(blocks),'blocks':blocks,'payloadBytes':len(raw),'payloadSha256':sha(raw),
           'assetPath':str((WORK/'assets'/name).relative_to(ROOT))})
    assert sum(x['blockCount'] for x in streams)==531
    popup=domains[304]['snapshots'][21]
    assert next(x['objectId'] for x in popup.values() if x['name']=='Mc_Feed_Popup')==300
    popup_first=next(i+1 for i,s in enumerate(domains[304]['snapshots']) if any(x['name']=='Mc_Feed_Popup' for x in s.values()))
    assert popup_first==16 and edits[299]['literal']==''
    model={'schemaVersion':1,'kind':'g678-p048-source-derived-model-v1','animationId':WORK.name,
      'assetId':'swf-'+PHYSICAL[0][2],'inputs':inputs,
      'placement':{'ordinal':48,'section':'TI','sectionOrdinal':7,'title':'Question 7'},
      'runtime':{'stage':[800,600],'fps':12,'rootFrames':10,'rootEntryFrame':6,
        'mainSpriteId':348,'mainFrames':327,'quizFrame':224,'resumeFrame':225,'terminalFrame':327},
      'rootMatrixTwips':root_matrix,'fonts':fonts,'texts':texts,'editTexts':edits,
      'mainTextInstances':h.compress_selected(main),'answerPlacements':options,'correctChoice':'A',
      'glossary':glossary,'frameDomains':frame_domains,'streams':streams,
      'sourceBehavior':{'wrong4':{'spriteId':304,'startFrame':2,'popupFirstFrame':16,'popupSpriteId':300,
        'textId':299,'holdFrame':22,'closeButtonId':297,'closeJump':23,'terminalFrame':31,
        'firstText':'Study the graph carefully.Try again.','secondText':'Study the graph carefully.',
        'attemptIncrement':'terminal31 after explicit Close and tail; second resets counter and resumes parent'},
        'right4':{'spriteId':217,'startFrame':2,'terminalFrame':25,'preservesPriorWrongCount':True},
        'help':{'openButtonId':140,'popupSpriteId':139,'closeButtonId':185,'static':True},
        'randomFeedbackCalled':False,'pageDefinesEnableButton':False,
        'legacyHostScope':'disableQuizButton/enableQuizButton and DoHyperLinks; original runtime host binding unverified'},
      'sourceGraph':{'gridAndAxesShapeId':145,'curveShapeId':157,'sourceLabelTextIds':list(range(146,157)),
        'terminalHighlightShape':347,'exactSourceCurveRequired':True},
      'registeredCurrentJs':False,'originalRuntimeAccepted':False,'listeningAccepted':False}
    assets[WORK/'native-v1/source-model-v1.json']=(json.dumps(model,indent=2,ensure_ascii=False)+'\n').encode()
    return model,assets

def main():
    assert sys.argv[1:] in [['--write'],['--check']]
    model,outputs=build()
    for p,raw in outputs.items():
        if sys.argv[1]=='--write':
            p.parent.mkdir(parents=True,exist_ok=True)
            with p.open('xb') as f:f.write(raw)
        else:assert p.read_bytes()==raw,p
    print(json.dumps({'modelSha256':sha(outputs[WORK/'native-v1/source-model-v1.json']),
       'texts':len(model['texts']),'edits':len(model['editTexts']),
       'options':[(x['letter'],x['instance'],x['branch']) for x in model['answerPlacements']],
       'streams':[{k:x[k] for k in ['spriteId','role','blockCount','payloadSha256']} for x in model['streams']]}))

if __name__=='__main__':main()
