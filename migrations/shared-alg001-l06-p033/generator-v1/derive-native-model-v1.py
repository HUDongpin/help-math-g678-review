#!/usr/bin/env python3
"""Derive P033 reading lifetimes, source hit targets and stream schedules."""
from pathlib import Path
import base64, copy, hashlib, importlib.util, json, re, struct, sys
import xml.etree.ElementTree as ET
sys.dont_write_bytecode = True
M=Path(__file__).resolve().parents[1]; R=M.parents[1]
P=R/'output/alg-l06-p033-source-planning-20261001-v1'
def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
    assert p.is_file() and not p.is_symlink()
    b=p.read_bytes()
    return {'path':str(p.relative_to(R)), 'bytes':len(b),'sha256':sha(b)}
def build():
    plan=P/'source-plan-v1.json'; display=P/'source-display-list-v1.json'
    assert pin(plan)['sha256']=='8d3feaabd38f66bb4428fc6e249c3ebacfaece89552fed49a6429a30c0d96490'
    assert pin(display)['sha256']=='0e8191837e8d7725c8e88f3c2ff94f07fb0c40b13d52ff8fcc6ace2e7a1a6a7d'
    p=json.loads(plan.read_text()); d=json.loads(display.read_text())
    xml=R/p['inputs']['swfmillXml']['path']; assert pin(xml)==p['inputs']['swfmillXml']
    assert pin(M/'source-v1/L6IN05.swf')['sha256']==p['physicalSource']['swf']['sha256']
    helper=R/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
    assert pin(helper)['sha256']=='5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'
    spec=importlib.util.spec_from_file_location('p033_affine',helper);h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
    header=ET.parse(xml).getroot().find('Header')
    defs={int(n.get('objectID')):n for n in header.find('tags') if n.tag.startswith('Define') and n.tag!='DefineFontName' and n.get('objectID')}
    fonts={i:{'name':n.get('name'),'glyphs':[chr(int(g.get('map'))) for g in n.findall('glyphs/Glyph')]} for i,n in defs.items() if n.tag=='DefineFont2'}
    texts={}
    for i,n in defs.items():
        if n.tag!='DefineText':continue
        value='';font=None
        for rec in n.iter('TextRecord6'):
            if rec.get('objectID'):font=int(rec.get('objectID'))
            value+=''.join(fonts[font]['glyphs'][int(g.get('glyph'))] for g in rec.findall('glyphs/TextEntry'))
        ff=P/'source-export/texts'/f'{i}.txt'
        assert re.sub(r'\s+','',value)==re.sub(r'\s+','',ff.read_text().replace('--- RECORDSEPARATOR ---',''))
        texts[i]={'text':value,'boundsTwips':h.rect(n.find('bounds/Rectangle')),'matrixTwips':h.matrix(n.find('transform/Transform'))}
    edits={i:{'attributes':n.attrib,'boundsTwips':h.rect(n.find('size/Rectangle'))} for i,n in defs.items() if n.tag=='DefineEditText'}
    shapes={i:{'boundsTwips':h.rect(n.find('bounds/Rectangle'))} for i,n in defs.items() if n.tag.startswith('DefineShape')}
    buttons={i:{'hitRecords':[{'objectId':int(x.get('objectID')),'matrixTwips':h.matrix(x.find('transform/Transform'))} for x in n.findall('buttons/Button') if x.get('hitTest')=='1']} for i,n in defs.items() if n.tag=='DefineButton2'}
    domains={}
    for i,n in defs.items():
        if n.tag!='DefineSprite':continue
        q=copy.deepcopy(n)
        for x in list(q.find('tags')):
            if x.tag=='FrameLabel':q.find('tags').remove(x)
        domains[i]=h.timeline(q,set(texts)|set(edits)|set(buttons))
    root_matrix=h.matrix(header.find('tags/PlaceObject2[@name="animation"]/transform/Transform'))
    main=domains[190];assert main['frameCount']==385
    answers=[]
    for row in main['snapshots'][51].values():
        if not (row['name'] or '').startswith('AnsBtn'):continue
        _,hit=h.button_hit_box(buttons[row['objectId']],row,root_matrix,shapes)
        matched=[]
        for placed in main['snapshots'][51].values():
            tid=placed['objectId']
            if tid not in [7,8,10,12,13,14,16,17]:continue
            box=h.box(texts[tid]['boundsTwips'],h.compose(root_matrix,placed['matrixTwips']))
            if h.overlap_of_text(box,hit)>=.5:matched.append({'textId':tid,'text':texts[tid]['text']})
        letters=[x for x in matched if x['text'] in 'ABCD'];prose=[x for x in matched if x not in letters]
        assert len(letters)==len(prose)==1
        answers.append({'instance':row['name'],'answer':int(row['name'][-1]),'buttonId':row['objectId'],'letter':letters[0]['text'],'text':prose[0]['text'],'textId':prose[0]['textId'],'letterTextId':letters[0]['textId'],'hitBoxPx':hit})
    answers.sort(key=lambda r:r['letter']);assert [(r['letter'],r['answer']) for r in answers]==[('A',1),('B',2),('C',3),('D',4)]
    instances=h.compress_selected(main); glossary=[]
    for term in p['glossaryActions']:
        bid=term['buttonId'];row=next(x for x in main['snapshots'][term['presentSpans'][0][0]-1].values() if x['objectId']==bid)
        _,hit=h.button_hit_box(buttons[bid],row,root_matrix,shapes)
        glossary.append({'buttonId':bid,'key':term['keyAttribute'],'firstFrame':term['presentSpans'][0][0],'lastFrame':385,'hitBoxPx':hit})
    streams=[];outputs={}
    for a in p['audioDomains']:
        sid=a['spriteId'];blocks=[];pieces=[];frame=1;offset=0
        for n in defs[sid].find('tags'):
            if n.tag=='ShowFrame':frame+=1
            elif n.tag=='SoundStreamBlock':
                raw=base64.b64decode(n.findtext('data'));samples,seek=struct.unpack_from('<Hh',raw);payload=raw[4:]
                blocks.append({'frame':frame,'samples':samples,'seekSamples':seek,'payloadOffset':offset,'payloadBytes':len(payload),'rawBlockSha256':sha(raw)})
                pieces.append(payload);offset+=len(payload)
        payload=b''.join(pieces);assert sha(payload)==a['asset']['sha256'] and len(payload)==a['asset']['bytes']
        assert len(blocks)==a['blockCount'] and blocks[0]['frame']==a['firstBlockFrame']
        negative=[x for x in blocks if x['seekSamples']<0]
        assert all(x['samples']==0 and x['payloadBytes']==0 and x is blocks[-1] for x in negative)
        asset=M/'assets'/f'source-stream-{sid}.mp3';outputs[asset]=payload
        streams.append({'spriteId':sid,'firstBlockFrame':blocks[0]['frame'],'frames':a['frames'],'blocks':blocks,'asset':{'path':str(asset.relative_to(R)),'bytes':len(payload),'sha256':sha(payload)},'trailingEmptyNegativeSeekDisposition':'preserved marker without audio payload; continuous clock clamps to measured PCM EOF' if negative else None})
    model={'kind':'p033-native-source-model-v1','animationId':M.name,'inputs':[pin(plan),pin(display),pin(xml),pin(helper),pin(M/'source-v1/L6IN05.swf')],
      'rootMatrixTwips':root_matrix,'mainFrames':385,'mainNativeInstances':instances,'texts':texts,'editTexts':edits,'answerPlacements':answers,'glossary':glossary,'streams':streams,
      'frameDomains':[{'spriteId':i,'frameCount':v['frameCount']} for i,v in domains.items()],
      'clipMasks':p['structure']['sourceClipMasks'],'firstWrongText':p['quiz']['firstWrongText'],'laterWrongText':p['quiz']['laterWrongText'],
      'title':{'en':p['identity']['titleEnglish'],'es':p['identity']['titleSpanish']},'sourceToAudioAlignmentAccepted':False}
    outputs[M/'native-v1/source-model-v1.json']=(json.dumps(model,ensure_ascii=False,indent=2)+'\n').encode()
    return model,outputs
if __name__=='__main__':
    assert sys.argv[1:] in [['--write'],['--check']]
    model,outputs=build()
    for p,raw in outputs.items():
        p.parent.mkdir(parents=True,exist_ok=True)
        if sys.argv[1]=='--write' and not p.exists():p.write_bytes(raw)
        assert p.read_bytes()==raw,p
    print(json.dumps({'status':'PASS','texts':len(model['texts']),'nativeSpans':len(model['mainNativeInstances']),'answers':model['answerPlacements'],'streams':len(model['streams'])}))
