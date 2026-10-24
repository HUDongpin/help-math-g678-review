"""Source-only P056 model. Exact placements and actions; no behavior assumptions."""
from pathlib import Path
import base64,copy,hashlib,importlib.util,json,re,struct,sys,zlib
import xml.etree.ElementTree as ET
sys.dont_write_bytecode=True
M=Path(__file__).resolve().parents[1];R=M.parents[1];E=Path('/Volumes/American Dream/hudongpin/g678-p056-source-extraction-20261003-v1');EXPECTED='ba6ba691fafbc6bbd2d0a14b4d249c59e7f1569ca8aaddaa778957c6120205d1'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();b=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'bytes':len(b),'sha256':sha(b)}
def mod(name,p,digest):
 assert pin(p)['sha256']==digest;s=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def build():
 custody=json.loads((M/'audit-v1/source-custody-v1.json').read_text());inputs=[]
 for row in custody['rows']:
  for key in ['source','copy']:
   old=row[key];now=pin(old['path']);assert (now['bytes'],now['sha256'])==(old['bytes'],old['sha256']);inputs.append(now)
 receipt=json.loads((M/'audit-v1/source-extraction-v1.json').read_text());assert all(x['exitCode']==0 for x in receipt['runs']);export=E/'ffdec-export';assert len(receipt['files'])==375
 assert {str(p.relative_to(export)) for p in export.rglob('*') if p.is_file()}=={x['path'] for x in receipt['files']}
 for row in receipt['files']:
  now=pin(export/row['path']);assert (now['bytes'],now['sha256'])==(row['bytes'],row['sha256'])
 assert pin(E/'swfmill.xml')==receipt['xml'];inputs.extend([pin(M/'audit-v1/source-extraction-v1.json'),pin(E/'swfmill.xml')])
 pages=ET.parse(M/'source-v1/index.xml').getroot().findall('.//Page');assert len(pages)==60 and pages[55].text=='TS/L6TS07.swf'
 helper=R/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py';binary=R/'migrations/shared-alg001-l06-p048/generator-v1/derive-source-model-v1.py'
 h=mod('p056_affine',helper,'5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906');b=mod('p056_binary',binary,'2fb124ba601e8fa32cbc9efa0fabc3651566334cbefbba2369744b198fc05513');inputs.extend([pin(helper),pin(binary)])
 xml=ET.parse(E/'swfmill.xml').getroot();header=xml.find('Header');tags=header.find('tags');defs={int(n.get('objectID')):n for n in tags if n.get('objectID') and n.tag.startswith('Define') and n.tag!='DefineFontName'}
 fonts={i:{'name':n.get('name'),'glyphs':[chr(int(x.get('map'))) for x in n.findall('glyphs/Glyph')]} for i,n in defs.items() if n.tag=='DefineFont2'}
 texts={}
 for i,n in defs.items():
  if n.tag!='DefineText':continue
  value='';font=None
  for rec in n.iter('TextRecord6'):
   if rec.get('objectID'):font=int(rec.get('objectID'))
   value+=''.join(fonts[font]['glyphs'][int(g.get('glyph'))] for g in rec.findall('glyphs/TextEntry'))
  ff=export/'texts'/f'{i}.txt';assert re.sub(r'\s+','',value)==re.sub(r'\s+','',ff.read_text().replace('--- RECORDSEPARATOR ---',''))
  texts[i]={'text':value,'boundsTwips':h.rect(n.find('bounds/Rectangle')),'matrixTwips':h.matrix(n.find('transform/Transform'))}
 shapes={i:{'boundsTwips':h.rect(n.find('bounds/Rectangle'))} for i,n in defs.items() if n.tag.startswith('DefineShape')}
 buttons={i:{'hitRecords':[{'objectId':int(x.get('objectID')),'matrixTwips':h.matrix(x.find('transform/Transform'))} for x in n.findall('buttons/Button') if x.get('hitTest')=='1']} for i,n in defs.items() if n.tag=='DefineButton2'}
 rootchildren={int(x.get('objectID')) for x in tags if x.tag.startswith('PlaceObject') and x.get('objectID')};reachable=set(rootchildren);pending=list(rootchildren)
 while pending:
  sid=pending.pop();n=defs[sid]
  for x in n.iter():
   if x is n or not x.tag.startswith(('PlaceObject','Button')) or not x.get('objectID'):continue
   child=int(x.get('objectID'));assert child in defs
   if child not in reachable:reachable.add(child);pending.append(child)
 domains={};compact={};controls=[]
 for sid,n in defs.items():
  if n.tag!='DefineSprite':continue
  clone=copy.deepcopy(n)
  for x in list(clone.find('tags')):
   if x.tag=='FrameLabel':clone.find('tags').remove(x)
  d=h.timeline(clone,set(texts)|set(buttons)|{181,182}|{x for x,y in defs.items() if y.tag=='DefineSprite'});domains[sid]=d
  f=1;actions=[];clips=[];labels=[]
  for x in n.find('tags'):
   if x.tag=='DoAction':actions.append(f)
   if x.tag=='FrameLabel':labels.append({'frame':f,**x.attrib})
   if x.tag=='PlaceObject2' and x.find('events') is not None:clips.append({'frame':f,'depth':int(x.get('depth')),'objectId':int(x.get('objectID')),'xmlActionSha256':sha(ET.tostring(x.find('events'))),'events':[q.attrib for q in x.findall('events/Event')]})
   if x.tag=='ShowFrame':f+=1
  compact[sid]={'spriteId':sid,'frameCount':d['frameCount'],'rootReachable':sid in reachable,'actionFrames':actions,'clipActions':clips,'labels':labels,'instances':h.compress_selected(d),'allPlacements':d['events']}
 main=domains[305];assert main['frameCount']==818;root_matrix=h.matrix(header.find('tags/PlaceObject2[@name="animation"]/transform/Transform'));quiz=main['snapshots'][800];options=[]
 for depth,row in quiz.items():
  if not (row['name'] or '').startswith('AnsBtn'):continue
  _,hit=h.button_hit_box(buttons[row['objectId']],row,root_matrix,shapes);found=[]
  for q in quiz.values():
   tid=q['objectId']
   if tid not in {165,166,168,169,171,172,174,175}:continue
   box=h.box(texts[tid]['boundsTwips'],h.compose(root_matrix,q['matrixTwips']));overlap=h.overlap_of_text(box,hit)
   if overlap>=.5:found.append({'textId':tid,**texts[tid],'boxPx':box,'overlap':overlap})
  options.append({'instance':row['name'],'buttonId':row['objectId'],'depth':depth,'hitBoxPx':hit,'textMatches':found,'branch':'right' if row['objectId']==273 else 'wrong'})
 scripts=[{'pin':pin(p),'relative':str(p.relative_to(export)),'text':p.read_text()} for p in sorted((export/'scripts').rglob('*.as'))]
 glossary=[]
 for bid in buttons:
  sc=next((s for s in scripts if s['relative']==f'scripts/DefineButton2_{bid}/BUTTONCONDACTION on(release).as'),None)
  if not sc:continue
  term=re.search(r'_global.KeyAttribute = "([^"]+)";',sc['text'])
  if not term:continue
  for sid,d in domains.items():
   for inst in compact[sid]['instances']:
    if inst['objectId']==bid:glossary.append({'buttonId':bid,'ownerSpriteId':sid,'key':term[1],'firstFrame':inst['firstFrame'],'lastFrame':inst['lastFrame'],'rootReachable':sid in reachable})
 swf=(M/'source-v1/L6TS07.swf').read_bytes();assert sha(swf)==EXPECTED;fws=b'FWS'+swf[3:8]+zlib.decompress(swf[8:]);assert len(fws)==int.from_bytes(fws[4:8],'little');rectbytes=(5+4*(fws[8]>>3)+7)//8
 raws={struct.unpack_from('<H',p)[0]:(p,at) for code,p,_,at in b.binary_tags(fws,8+rectbytes+4,len(fws)) if code==39};streams=[];outputs={}
 for sid,(raw,base) in raws.items():
  frame=1;heads=[];blocks=[];pieces=[];offset=0;trailing=b''
  for code,p,tag_at,data_at in b.binary_tags(raw,4,len(raw)):
   if code==0:
    assert len(p)==0;trailing=raw[data_at:];break
   if code==1:frame+=1
   elif code in [18,45]:heads.append(p)
   elif code==19:
    samples,seek=struct.unpack_from('<Hh',p);mp3=p[4:];blocks.append({'frame':frame,'samples':samples,'seekSamples':seek,'payloadOffset':offset,'payloadBytes':len(mp3),'payloadSha256':sha(mp3),'rawBlockSha256':sha(p)});pieces.append(p);offset+=len(mp3)
  if not heads:continue
  assert len(heads)==1 and heads[0][1]>>4==2
  assert pieces==[base64.b64decode(n.findtext('data')) for n in defs[sid].findall('tags/SoundStreamBlock')]
  payload=b''.join(p[4:] for p in pieces);asset=M/'assets'/f'source-stream-{sid}.mp3';outputs[asset]=payload
  assert frame==int(defs[sid].get('frames'))+1
  streams.append({'spriteId':sid,'headHex':heads[0].hex(),'blocks':blocks,'assetPath':str(asset.relative_to(R)),'payloadBytes':len(payload),'payloadSha256':sha(payload),'opaqueBytesAfterEndTag':{'bytes':len(trailing),'sha256':sha(trailing),'disposition':'preserved in SWF; outside ended timeline tag stream; not treated as executable or audio'}})
 model={'kind':'p056-source-model-v1','animationId':M.name,'sourceSha256':EXPECTED,'inputs':inputs,'extractionFileCount':375,'runtime':{'swfVersion':6,'rootFrames':10,'rootEntryFrame':6,'fps':12,'mainSpriteId':305,'mainFrames':818,'stage':[800,600]},'identity':{'ordinal':56,'section':'TS','sectionOrdinal':sum(x.text.startswith('TS/') for x in pages[:56]),'title':pages[55].get('Title'),'samePathFla':False},'rootMatrixTwips':root_matrix,'fonts':fonts,'texts':texts,'editTextCount':sum(n.tag=='DefineEditText' for n in defs.values()),'rootReachableCharacters':sorted(reachable),'domains':compact,'buttons':buttons,'answerPlacements':options,'glossary':glossary,'scripts':scripts,'streams':streams,'registered':False,'acceptanceEffects':{k:False for k in ['originalRuntime','fidelity','audio','human','owner','strictCompletion','release','publication']}}
 outputs[M/'native-v1/source-model-v1.json']=(json.dumps(model,ensure_ascii=False,indent=2)+'\n').encode();return model,outputs
if __name__=='__main__':
 assert sys.argv[1:] in [['--write'],['--check']];model,outputs=build()
 for p,raw in outputs.items():
  if sys.argv[1]=='--check':assert p.read_bytes()==raw,p
  else:
   p.parent.mkdir(parents=True,exist_ok=True)
   if p.exists():
    if p==M/'native-v1/source-model-v1.json':p.write_bytes(raw)
    else:assert p.read_bytes()==raw,p
   else:
    with p.open('xb') as f:f.write(raw)
 print(json.dumps({'status':'PASS','files':len(outputs),'bytes':sum(map(len,outputs.values())),'mainFrames':model['runtime']['mainFrames'],'texts':len(model['texts']),'scriptCount':len(model['scripts']),'streams':len(model['streams']),'answers':[{'instance':x['instance'],'branch':x['branch'],'texts':[t['text'] for t in x['textMatches']]} for x in model['answerPlacements']]}))
