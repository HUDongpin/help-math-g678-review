#!/usr/bin/env python3
"""P049 source-locked table question; existing affine and binary-tag helpers reused."""
from pathlib import Path
import importlib.util,sys,json,hashlib,xml.etree.ElementTree as ET,copy,re,struct,zlib,base64
assert __debug__
sys.dont_write_bytecode=True
W=Path(__file__).resolve().parent.parent;R=W.parents[1]
S=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
XML=W/'audit-v1/swfmill.xml';REC=W/'audit-v1/ffdec-source-extraction-v1.json'
GEOMETRY=R/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
BINARY=R/'migrations/shared-alg001-l06-p048/generator-v1/derive-source-model-v1.py'
PINS={XML:'bf1af8da2818b2ba70c1a2479c0634761b620e0109724073c72e8fd3cbd3153c',REC:'627d66b7eb6fd51ec433f79ce2183a851c4c23a9e5464017484bdc06bbf0b3e7',GEOMETRY:'5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906',BINARY:'2fb124ba601e8fa32cbc9efa0fabc3651566334cbefbba2369744b198fc05513'}
PHYSICAL=[('TI/L6TI09.swf',251429,'33f90f5897fa60939fb7015f60c8789d98aad3dca65ad39cb04dac4fededb3a6'),('index.xml',13926,'9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'),('SA/L6TI09.mp3',111888,'936b059a5355877c47f2bda90da6d4de47d7145371d97ef50cd9f1e267254150')]
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p,digest=None):
 before=p.lstat();assert p.is_file() and not p.is_symlink();b=p.read_bytes();after=p.lstat()
 assert all(getattr(before,k)==getattr(after,k) for k in ['st_ino','st_dev','st_size','st_mtime_ns','st_ctime_ns'])
 if digest:assert sha(b)==digest,p
 return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'bytes':len(b),'sha256':sha(b)}
def module(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def build():
 inputs=[pin(p,d) for p,d in PINS.items()]
 for rel,size,digest in PHYSICAL:
  for p in [S/rel,W/'source-v1'/Path(rel).name]:
   row=pin(p,digest);assert row['bytes']==size;inputs.append(row)
 pages=ET.parse(S/'index.xml').getroot().findall('.//Page');assert len(pages)==60 and pages[48].text=='TI/L6TI09.swf' and pages[48].get('Title')=='Question 8'
 rec=json.loads(REC.read_text());E=Path(rec['exportRoot']);assert rec['exitCode']==0
 assert {str(p.relative_to(E)) for p in E.rglob('*') if p.is_file()}=={p['path'] for p in rec['files']}
 for row in rec['files']:assert pin(E/row['path'],row['sha256'])['bytes']==row['bytes']
 scripts={row['path']:(E/row['path']).read_text() for row in rec['files'] if row['path'].endswith('.as')}
 def action(p):return scripts['scripts/'+p]
 first='Use the values in one of the rows of the table to test your answer.Try again.';second='Use the values in one of the rows of the table to test your answer.'
 for bid in [168,169]:
  a=action(f'DefineButton2_{bid}/BUTTONCONDACTION on(release).as');assert 'Mc_Wrong_Feed4.gotoAndPlay(2)' in a and first in a and second in a
 assert 'Mc_Right_Feed4.gotoAndPlay(2)' in action('DefineButton2_170/BUTTONCONDACTION on(release).as')
 assert '_global.quizTryCount++' in action('DefineSprite_302/frame_28/DoAction.as') and '_global.quizTryCount >= 2' in action('DefineSprite_302/frame_28/DoAction.as')
 assert 'quizTryCount' not in action('DefineSprite_192/frame_25/DoAction.as')
 assert '_parent.gotoAndPlay(23)' in action('DefineButton2_290/BUTTONCONDACTION on(release).as')
 assert action('DefineSprite_302/frame_22/DoAction.as').strip()=='stop();'
 assert action('DefineSprite_327/frame_401/DoAction.as').strip()=='stop();'
 assert not any('showWrongFeed' in a or 'showRightFeed' in a or 'function enableButton' in a for a in scripts.values())
 h=module('p049_affine',GEOMETRY);bt=module('p049_binary_helper',BINARY).binary_tags
 xml=ET.parse(XML).getroot();head=xml.find('Header');assert head.attrib=={'framerate':'12','frames':'10'}
 fonts={int(n.get('objectID')):{'name':n.get('name'),'glyphs':[chr(int(g.get('map'))) for g in n.findall('glyphs/Glyph')]} for n in xml.iter('DefineFont2')}
 fftexts={int(p.stem.split('_')[0]):p for p in (E/'texts').glob('*.txt')};texts={}
 for n in xml.iter('DefineText'):
  tid=int(n.get('objectID'));value='';font=None
  for rec in n.iter('TextRecord6'):
   if rec.get('objectID'):font=int(rec.get('objectID'))
   value+=''.join(fonts[font]['glyphs'][int(g.get('glyph'))] for g in rec.findall('glyphs/TextEntry'))
  assert re.sub(r'\s+','',value)==re.sub(r'\s+','',fftexts[tid].read_text().replace('--- RECORDSEPARATOR ---','')),tid
  texts[tid]={'text':value,'boundsTwips':h.rect(n.find('bounds/Rectangle')),'matrixTwips':h.matrix(n.find('transform/Transform'))}
 edits={int(n.get('objectID')):{'attributes':n.attrib,'boundsTwips':h.rect(n.find('size/Rectangle')),'literal':n.findtext('text') or ''} for n in xml.iter('DefineEditText')}
 shapes={int(n.get('objectID')):{'boundsTwips':h.rect(n.find('bounds/Rectangle'))} for n in xml.iter() if n.tag.startswith('DefineShape') and n.get('objectID')}
 buttons={}
 for n in xml.iter('DefineButton2'):
  rows=[{'objectId':int(x.get('objectID')),'attributes':x.attrib,'matrixTwips':h.matrix(x.find('transform/Transform'))} for x in n.findall('buttons/Button') if x.get('objectID')]
  buttons[int(n.get('objectID'))]={'records':rows,'hitRecords':[x for x in rows if x['attributes'].get('hitTest')=='1']}
 sprites={int(n.get('objectID')):n for n in xml.iter('DefineSprite')};domains={};labels={}
 for sid,n in sprites.items():
  cp=copy.deepcopy(n);f=1;labels[sid]=[]
  for t in list(cp.find('tags')):
   if t.tag=='ShowFrame':f+=1
   elif t.tag=='FrameLabel':labels[sid].append({'frame':f,'label':t.get('label')});cp.find('tags').remove(t)
  domains[sid]=h.timeline(cp,set(texts)|set(edits)|set(buttons))
 main=domains[327];assert main['frameCount']==401;quiz=main['snapshots'][158]
 rp=head.find('tags/PlaceObject2[@name="animation"]');assert rp.get('objectID')=='327';rm=h.matrix(rp.find('transform/Transform'))
 options=[]
 for name in ['AnsBtn1','AnsBtn2','AnsBtn3','AnsBtn4']:
  row=next(x for x in quiz.values() if x['name']==name);_,hit=h.button_hit_box(buttons[row['objectId']],row,rm,shapes);matches=[]
  for x in quiz.values():
   tid=x['objectId']
   if tid not in [37,49,52,60,161,163,165,167]:continue
   box=h.box(texts[tid]['boundsTwips'],h.compose(rm,x['matrixTwips']));overlap=h.overlap_of_text(box,hit)
   if overlap>=.5:matches.append({'textId':tid,'text':texts[tid]['text'],'boxPx':box,'overlap':overlap})
  letter=[x for x in matches if x['text'] in 'ABCD'];prose=[x for x in matches if x not in letter];assert len(letter)==len(prose)==1
  options.append({'letter':letter[0]['text'],'instance':name,'buttonId':row['objectId'],'branch':'right4' if row['objectId']==170 else 'wrong4','letterTextId':letter[0]['textId'],'textId':prose[0]['textId'],'text':prose[0]['text'],'hitBoxPx':hit,'textOverlap':prose[0]['overlap']})
 options.sort(key=lambda x:x['letter']);assert [(x['letter'],x['buttonId'],x['textId']) for x in options]==[('A',168,161),('B',170,163),('C',169,165),('D',169,167)]
 glossary=[]
 for path,a in scripts.items():
  term=re.search(r'_global.KeyAttribute = "([^"]+)"',a)
  if not term:continue
  bid=int(re.search(r'DefineButton2_(\d+)',path).group(1));owner=138 if bid==137 else 327
  frames=[i+1 for i,ss in enumerate(domains[owner]['snapshots']) if any(x['objectId']==bid for x in ss.values())];assert frames
  glossary.append({'buttonId':bid,'term':term.group(1),'ownerSpriteId':owner,'firstFrame':min(frames),'lastFrame':max(frames),'scriptPath':path})
 assert sorted(x['buttonId'] for x in glossary)==[137,154,155,156]
 definitions={int(n.get('objectID')):n for n in head.find('tags') if n.tag.startswith('Define') and n.get('objectID')}
 reachable={int(n.get('objectID')) for n in head.findall('tags/PlaceObject2') if n.get('objectID')}
 while True:
  expanded=reachable|{int(x.get('objectID')) for sid in reachable if sid in definitions for x in definitions[sid].iter() if x.get('objectID')}
  if expanded==reachable:break
  reachable=expanded
 frame_domains=[{'spriteId':sid,'frameCount':d['frameCount'],'displayReachable':sid in reachable,'labels':labels[sid],'disposition':('main-source-observer' if sid==327 else 'maintained-static-help' if sid==138 else 'active-feedback4' if sid in [192,302,293] else 'retained-unselected-feedback' if sid in reachable else 'unplaced-library-definition'),'scriptPaths':[p for p in scripts if re.match(r'scripts/DefineSprite_'+str(sid)+r'(?:/|_)',p)]} for sid,d in domains.items()]
 swf=(W/'source-v1/L6TI09.swf').read_bytes();body=zlib.decompress(swf[8:]);raw=b'FWS'+swf[3:8]+body;assert len(raw)==int.from_bytes(swf[4:8],'little');rect=(5+4*(body[0]>>3)+7)//8
 binary={struct.unpack_from('<H',data)[0]:(data,at) for code,data,_,at in bt(raw,8+rect+4,len(raw)) if code==39};streams=[];assets={}
 roles={192:'right4',206:'right1',227:'right3',239:'right2',255:'wrong1',270:'wrong3',302:'wrong4',323:'wrong2',327:'main'}
 for sid,role in roles.items():
  data,base=binary[sid];_,frames=struct.unpack_from('<HH',data);f=1;blocks=[];pieces=[];heads=[];offset=0
  head_attrs=sprites[sid].find('tags/SoundStreamHead').attrib;codec=int(head_attrs['compression']);assert codec in [1,2]
  assert codec== (1 if sid==192 else 2)
  for code,payload,tag_at,data_at in bt(data,4,len(data)):
   if code==1:f+=1
   elif code in [18,45]:heads.append(payload.hex())
   elif code==19:
    assert len(heads)==1 and (bytes.fromhex(heads[0])[1]>>4)==codec
    samples,seek=struct.unpack_from('<Hh',payload) if codec==2 else (int(head_attrs['sampleSize']),None)
    mp3=payload[4:] if codec==2 else payload;pieces.append(payload)
    blocks.append({'frame':f,'samples':samples,'seekSamples':seek,'payloadOffset':offset,'payloadBytes':len(mp3),'rawBlockSha256':sha(payload),'payloadSha256':sha(mp3),'tagOffsetInFws':base+tag_at,'dataOffsetInFws':base+data_at});offset+=len(mp3)
  assert pieces==[base64.b64decode(n.findtext('data')) for n in sprites[sid].findall('tags/SoundStreamBlock')];assert len(heads)==1 and f==frames+1
  mp3=b''.join(p[4:] if codec==2 else p for p in pieces)
  ext='mp3' if codec==2 else 'swf-adpcm-blocks.bin';asset=W/'assets'/f'source-stream-{sid}-{role}.{ext}';assets[asset]=mp3
  streams.append({'spriteId':sid,'role':role,'activeAnswerPath':role in ['main','right4','wrong4'],'frameCount':frames,'codec':'mp3' if codec==2 else 'swf-adpcm','headHex':heads[0],'head':sprites[sid].find('tags/SoundStreamHead').attrib,'blockCount':len(blocks),'blocks':blocks,'payloadBytes':len(mp3),'payloadSha256':sha(mp3),'assetPath':str(asset.relative_to(R))})
 assert next(i+1 for i,ss in enumerate(domains[302]['snapshots']) if any(x['name']=='Mc_Feed_Popup' and x['objectId']==293 for x in ss.values()))==15
 assert edits[292]['literal']==''
 table=[{'milesTextId':147,'yardsTextId':148},{'milesTextId':149,'yardsTextId':150},{'milesTextId':151,'yardsTextId':152}]
 for row in table:
  m=int(texts[row['milesTextId']]['text'].replace(',',''));y=int(texts[row['yardsTextId']]['text'].replace(',',''));assert y==1760*m
 model={'schemaVersion':1,'kind':'g678-p049-source-derived-model-v2','animationId':W.name,'assetId':'swf-'+PHYSICAL[0][2],'inputs':inputs,'extractionReceipt':pin(REC),'placement':{'ordinal':49,'section':'TI','sectionOrdinal':8,'title':'Question 8'},'runtime':{'stage':[800,600],'fps':12,'rootFrames':10,'rootEntryFrame':6,'mainSpriteId':327,'mainFrames':401,'quizFrame':159,'resumeFrame':160,'terminalFrame':401},'rootMatrixTwips':rm,'fonts':fonts,'texts':texts,'editTexts':edits,'mainTextInstances':h.compress_selected(main),'answerPlacements':options,'correctChoice':'B','glossary':glossary,'frameDomains':frame_domains,'streams':streams,'sourceBehavior':{'wrong4':{'spriteId':302,'startFrame':2,'popupFirstFrame':15,'popupSpriteId':293,'textId':292,'holdFrame':22,'closeButtonId':290,'closeJump':23,'terminalFrame':28,'firstText':first,'secondText':second,'attemptIncrement':'terminal28 after explicit Close; second resets counter and resumes parent'},'right4':{'spriteId':192,'startFrame':2,'terminalFrame':25,'preservesPriorWrongCount':True},'help':{'openButtonId':139,'popupSpriteId':138,'closeButtonId':180,'static':True},'randomFeedbackCalled':False,'pageDefinesEnableButton':False,'legacyHostScope':'disableQuizButton/enableQuizButton, DoHyperLinks; original host binding unverified'},'sourceTable':{'headerTextIds':[145,146],'rows':table,'answerExplanationTextIds':[324,325,326],'conversionFactor':1760,'sourceTextPreserved':True},'registeredCurrentJs':False,'originalRuntimeAccepted':False,'listeningAccepted':False}
 assets[W/'native-v1/source-model-v2.json']=(json.dumps(model,ensure_ascii=False,indent=2)+'\n').encode();return model,assets
if __name__=='__main__':
 assert sys.argv[1:] in [['--write'],['--check']];model,outputs=build()
 for p,b in outputs.items():
  if sys.argv[1]=='--write':
   p.parent.mkdir(parents=True,exist_ok=True)
   if p.exists():assert p.read_bytes()==b,p
   else:
    with p.open('xb') as f:f.write(b)
  else:assert p.read_bytes()==b,p
 print(json.dumps({'mode':sys.argv[1],'modelSha256':sha(outputs[W/'native-v1/source-model-v2.json']),'options':[(x['letter'],x['branch']) for x in model['answerPlacements']],'streams':[{k:x[k] for k in ['spriteId','role','blockCount','payloadBytes','payloadSha256']} for x in model['streams']],'reachableDomains':sum(x['displayReachable'] for x in model['frameDomains'])}))
