#!/usr/bin/env python3
"""P031 text/control lifetimes and lossless MP3 payload extraction from pinned SWF."""
from pathlib import Path
import base64, copy, hashlib, importlib.util, json, re, struct, sys, zlib
import xml.etree.ElementTree as ET

assert __debug__
sys.dont_write_bytecode = True
M = Path(__file__).resolve().parents[1]
R = M.parents[1]
E = Path('/Volumes/American Dream/hudongpin/g678-p031-source-extraction-20261003-v1')
SWF_SHA = 'e0ab7279035ee362a5131807f8e6d7d683afb390f9dd627f9924b7a51f550a79'

def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
    p = Path(p); before = p.stat(); assert p.is_file() and not p.is_symlink()
    b = p.read_bytes(); after = p.stat()
    assert (before.st_size,before.st_mtime_ns) == (after.st_size,after.st_mtime_ns)
    return {'path': str(p.relative_to(R)) if p.is_relative_to(R) else str(p), 'bytes':len(b),'sha256':sha(b)}
def module(name, p, digest):
    assert pin(p)['sha256'] == digest
    s = importlib.util.spec_from_file_location(name,p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)
    return m
def encoded(value): return (json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode()

def build():
    audit_path = M/'audit-v1/source-audit-v1.json'
    assert pin(audit_path)['sha256'] == 'd58f5c83016ec4bcbbb231afdd6c2b84fd06bb862cbcab509cc8ee9bbb930bd6'
    audit = json.loads(audit_path.read_text())
    for old in audit['inputs']:
        p = Path(old['path']); p = p if p.is_absolute() else R/p
        assert pin(p) == old
    receipt = json.loads((M/'audit-v1/source-extraction-v1.json').read_text())
    for row in receipt['files']:
        now = pin(E/'ffdec-export'/row['path'])
        assert (now['bytes'],now['sha256']) == (row['bytes'],row['sha256'])
    helper = R/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
    binary = R/'migrations/shared-alg001-l06-p048/generator-v1/derive-source-model-v1.py'
    h = module('p031_affine',helper,'5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906')
    b = module('p031_binary',binary,'2fb124ba601e8fa32cbc9efa0fabc3651566334cbefbba2369744b198fc05513')
    xml = ET.parse(E/'swfmill.xml').getroot(); header = xml.find('Header')
    defs = {int(n.get('objectID')):n for n in header.find('tags') if n.tag.startswith('Define') and n.get('objectID')}
    fonts = {i:{'name':n.get('name'),'glyphs':[chr(int(g.get('map'))) for g in n.findall('glyphs/Glyph')]}
             for i,n in defs.items() if n.tag=='DefineFont2'}
    texts = {}
    for i,n in defs.items():
        if n.tag != 'DefineText': continue
        value = ''; font = None
        for rec in n.iter('TextRecord6'):
            if rec.get('objectID'): font = int(rec.get('objectID'))
            value += ''.join(fonts[font]['glyphs'][int(g.get('glyph'))] for g in rec.findall('glyphs/TextEntry'))
        ff = E/'ffdec-export/texts'/f'{i}.txt'
        if not ff.exists(): ff = next((E/'ffdec-export/texts').glob(f'{i}_*.txt'))
        assert re.sub(r'\s+','',value) == re.sub(r'\s+','',ff.read_text().replace('--- RECORDSEPARATOR ---',''))
        texts[i] = {'text':value,'boundsTwips':h.rect(n.find('bounds/Rectangle')),'matrixTwips':h.matrix(n.find('transform/Transform'))}
    edits = {i:{'literal':n.findtext('text') or '', 'attributes':n.attrib,'boundsTwips':h.rect(n.find('size/Rectangle'))}
             for i,n in defs.items() if n.tag=='DefineEditText'}
    shapes = {i:{'boundsTwips':h.rect(n.find('bounds/Rectangle'))} for i,n in defs.items() if n.tag.startswith('DefineShape')}
    buttons = {i:{'hitRecords':[{'objectId':int(x.get('objectID')),'matrixTwips':h.matrix(x.find('transform/Transform'))}
               for x in n.findall('buttons/Button') if x.get('hitTest')=='1']} for i,n in defs.items() if n.tag=='DefineButton2'}
    domains = {}
    for i,n in defs.items():
        if n.tag != 'DefineSprite': continue
        p = copy.deepcopy(n)
        for x in list(p.find('tags')):
            if x.tag == 'FrameLabel': p.find('tags').remove(x)
        domains[i] = h.timeline(p,set(texts)|set(edits)|set(buttons))
    main = domains[363]; assert main['frameCount']==1611
    root_matrix = h.matrix(header.find('tags/PlaceObject2[@name="animation"]/transform/Transform'))
    terminal = main['snapshots'][1609]
    options = []
    for depth,row in terminal.items():
        if not (row['name'] or '').startswith('AnsBtn'): continue
        _,hit = h.button_hit_box(buttons[row['objectId']],row,root_matrix,shapes)
        candidates = []
        for placed in terminal.values():
            tid = placed['objectId']
            if tid not in {21,22,24,25,27,28,30,31,33,34}: continue
            box = h.box(texts[tid]['boundsTwips'],h.compose(root_matrix,placed['matrixTwips']))
            overlap = h.overlap_of_text(box,hit)
            if overlap>=.5: candidates.append({'textId':tid,'text':texts[tid]['text'],'boxPx':box,'overlap':overlap})
        letter = [x for x in candidates if x['text'] in 'ABCDE']; prose = [x for x in candidates if x not in letter]
        assert len(letter)==len(prose)==1
        options.append({'instance':row['name'],'buttonId':row['objectId'],'letter':letter[0]['text'],
          'text':prose[0]['text'],'textId':prose[0]['textId'],'letterTextId':letter[0]['textId'],'hitBoxPx':hit,
          'branch':'right' if row['objectId']==87 else 'wrong','activeRanges':[[1610,1610]]})
    options.sort(key=lambda x:x['letter'])
    assert [(x['letter'],x['instance'],x['branch']) for x in options]==[
      ('A','AnsBtn1','right'),('B','AnsBtn2','wrong'),('C','AnsBtn3','wrong'),('D','AnsBtn4','wrong'),('E','AnsBtn5','wrong')]
    instances = h.compress_selected(main)
    glossary = []
    for bid,key in [(12,'Function'),(13,'Calculate'),(19,'Domain')]:
        rows = [x for x in instances if x['objectId']==bid]; assert len(rows)==1
        first = rows[0]['firstFrame']; placed = next(x for x in main['snapshots'][first-1].values() if x['objectId']==bid)
        _,hit = h.button_hit_box(buttons[bid],placed,root_matrix,shapes)
        glossary.append({'buttonId':bid,'key':key,'firstFrame':first,'lastFrame':rows[0]['lastFrame'],'hitBoxPx':hit})
    swf = (M/'source-v1/L6IN03.swf').read_bytes(); assert sha(swf)==SWF_SHA
    fws = b'FWS'+swf[3:8]+zlib.decompress(swf[8:]); assert len(fws)==int.from_bytes(swf[4:8],'little')
    rect_bytes = (5+4*(fws[8]>>3)+7)//8
    sprite_bytes = {struct.unpack_from('<H',payload)[0]:(payload,data_at) for code,payload,_,data_at
                    in b.binary_tags(fws,8+rect_bytes+4,len(fws)) if code==39}
    streams = []; outputs = {}
    for sid,role in [(363,'main'),(110,'right6'),(150,'right1'),(191,'right4'),(242,'right5'),(299,'wrong1'),(337,'wrong2'),(362,'wrong3')]:
        raw,base = sprite_bytes[sid]; frame=1; heads=[]; blocks=[]; pieces=[]; offset=0
        for code,payload,tag_at,data_at in b.binary_tags(raw,4,len(raw)):
            if code==1: frame+=1
            elif code in [18,45]: heads.append(payload)
            elif code==19:
                samples,seek=struct.unpack_from('<Hh',payload); mp3=payload[4:]
                blocks.append({'frame':frame,'samples':samples,'seekSamples':seek,'payloadOffset':offset,'payloadBytes':len(mp3),
                   'payloadSha256':sha(mp3),'rawBlockSha256':sha(payload),'tagOffsetInFws':base+tag_at,'dataOffsetInFws':base+data_at})
                pieces.append(payload); offset+=len(mp3)
        assert len(heads)==1 and (heads[0][1]>>4)==2
        assert pieces==[base64.b64decode(n.findtext('data')) for n in defs[sid].findall('tags/SoundStreamBlock')]
        assert frame==int(defs[sid].get('frames'))+1
        payload=b''.join(p[4:] for p in pieces); asset=M/'assets'/f'source-stream-{sid}-{role}.mp3'; outputs[asset]=payload
        streams.append({'spriteId':sid,'role':role,'sourceFrameCount':frame-1,'headHex':heads[0].hex(),
          'blockCount':len(blocks),'blocks':blocks,'payloadBytes':len(payload),'payloadSha256':sha(payload),
          'assetPath':str(asset.relative_to(R)), 'runtimeDisposition':'main' if sid==363 else 'unresolved-host-feedback-request'})
    model={'kind':'p031-source-model-v1','animationId':M.name,'sourceSha256':SWF_SHA,
      'inputs':[pin(audit_path),pin(helper),pin(binary),pin(E/'swfmill.xml')],
      'runtime':{'rootFrames':10,'rootEntryFrame':6,'mainSpriteId':363,'mainFrames':1611,'fps':12,'stage':[800,600]},
      'rootMatrixTwips':root_matrix,'fonts':fonts,'texts':texts,'editTexts':edits,
      'mainNativeInstances':instances,'answerPlacements':options,'glossary':glossary,
      'sourceBehavior':{'mainStopActions':[],'answerLifetime':[1610,1610],
        'correctChoice':'A','wrongClickIncrementsTryCount':True,'wrongTextSetOnlyWhenCountEquals':1,
        'wrongText':'As we just learned, the domain of the function is the set of counting numbers.',
        'feedbackRequests':['disableQuizButton','showRightFeed','showWrongFeed'],
        'historicalHostPairingVerified':False,'feedbackSelectionResolved':False,
        'terminalHoldIsModernHostConvention':True,'inventedHoldAt1610':False},
      'streams':streams,'registeredCurrentJs':False,'acceptanceEffects':audit['acceptanceEffects']}
    outputs[M/'native-v1/source-model-v1.json']=encoded(model)
    return model,outputs

if __name__=='__main__':
    assert sys.argv[1:] in [['--write'],['--check']]
    model,outputs=build()
    for p,raw in outputs.items():
        if sys.argv[1]=='--write':
            p.parent.mkdir(parents=True,exist_ok=True)
            with p.open('xb') as f: f.write(raw)
        else: assert p.read_bytes()==raw,p
    print(json.dumps({'status':'PASS','outputBytes':sum(map(len,outputs.values())),
      'texts':len(model['texts']),'nativeInstances':len(model['mainNativeInstances']),
      'options':[(x['letter'],x['instance'],x['branch']) for x in model['answerPlacements']],
      'glossary':model['glossary'],'streams':[{k:x[k] for k in ['spriteId','role','blockCount','payloadBytes','payloadSha256']} for x in model['streams']]}))
