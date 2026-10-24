"""P060 source-only quiz model; preserve all authored fields and script bindings."""
from pathlib import Path
import copy,hashlib,importlib.util,json,re,sys
import xml.etree.ElementTree as ET
sys.dont_write_bytecode=True
M=Path(__file__).resolve().parents[1];R=M.parents[1];E=Path('/Volumes/American Dream/hudongpin/g678-p060-source-extraction-20261003-v1');H=R/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();b=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'bytes':len(b),'sha256':sha(b)}
def build():
 intake=json.loads((M/'audit-v1/source-intake-v1.json').read_text());inputs=[pin(M/'audit-v1/source-intake-v1.json')]
 for row in intake['files']:
  for k in ['source','copy']:
   p=Path(row[k]);p=p if p.is_absolute() else R/p;v=pin(p);assert (v['bytes'],v['sha256'])==(row['bytes'],row['sha256']);inputs.append(v)
 receipt=json.loads((M/'audit-v1/source-extraction-v1.json').read_text());export=E/'ffdec-export';assert len(receipt['files'])==1277
 assert {str(p.relative_to(export)) for p in export.rglob('*') if p.is_file()}=={p['path']for p in receipt['files']}
 for row in receipt['files']:
  v=pin(export/row['path']);assert (v['bytes'],v['sha256'])==(row['bytes'],row['sha256'])
 assert pin(E/'swfmill.xml')==receipt['xml'];inputs.extend([pin(M/'audit-v1/source-extraction-v1.json'),pin(E/'swfmill.xml'),pin(H)])
 assert pin(H)['sha256']=='5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'
 spec=importlib.util.spec_from_file_location('p060_affine',H);h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
 xml=ET.parse(E/'swfmill.xml').getroot();header=xml.find('Header');tags=header.find('tags');defs={int(n.get('objectID')):n for n in tags if n.get('objectID') and n.tag.startswith('Define')}
 fonts={i:{'name':n.get('name'),'glyphs':[chr(int(x.get('map')))for x in n.findall('glyphs/Glyph')]}for i,n in defs.items()if n.tag=='DefineFont2'};texts={}
 for tid,n in defs.items():
  if n.tag not in ['DefineText','DefineEditText']:continue
  if n.tag=='DefineText':
   value='';font=None;records=[]
   for rec in n.iter('TextRecord6'):
    if rec.get('objectID'):font=int(rec.get('objectID'))
    txt=''.join(fonts[font]['glyphs'][int(g.get('glyph'))]for g in rec.findall('glyphs/TextEntry'));value+=txt;records.append({'attributes':dict(rec.attrib),'text':txt,'glyphs':[dict(g.attrib)for g in rec.findall('glyphs/TextEntry')]})
   bounds=h.rect(n.find('bounds/Rectangle'));matrix=h.matrix(n.find('transform/Transform'))
  else:value=n.get('initialText','');bounds=h.rect(n.find('size/Rectangle'));matrix=h.matrix();records=[]
  ff=(export/'texts'/f'{tid}.txt').read_text().replace('--- RECORDSEPARATOR ---','');assert re.sub(r'\s+','',value)==re.sub(r'\s+','',ff),(tid,value,ff)
  texts[tid]={'textId':tid,'kind':n.tag,'text':value,'boundsTwips':bounds,'matrixTwips':matrix,'sourceAttributes':dict(n.attrib),'records':records}
 assert len(texts)==500
 domains={};labels={};actions=[]
 for sid,n in defs.items():
  if n.tag!='DefineSprite':continue
  c=copy.deepcopy(n);f=1;labels[sid]={}
  for t in n.find('tags'):
   if t.tag=='FrameLabel':labels[sid][t.get('label')]=f
   if t.tag=='DoAction':actions.append({'spriteId':sid,'frame':f})
   if t.tag=='ShowFrame':f+=1
  for t in list(c.find('tags')):
   if t.tag=='FrameLabel':c.find('tags').remove(t)
  domains[sid]=h.timeline(c,set(defs))
 main=domains[973];assert main['frameCount']==69 and len(domains)==197
 rootMatrix=h.matrix(tags.find('PlaceObject2[@name="animation"]/transform/Transform'))
 scripts=[{'pin':pin(p),'relative':str(p.relative_to(export)),'text':p.read_text()}for p in sorted((export/'scripts').rglob('*.as'))];assert len(scripts)==115
 mainScript=next(s['text']for s in scripts if s['relative']=='scripts/DefineSprite_973/frame_1/DoAction.as')
 keys=json.loads(re.search(r'_global.arrayAnswer = (\[[^;]+\]);',mainScript)[1]);assert len(keys)==24
 shapes={i:{'tag':n.tag,'boundsTwips':h.rect(n.find('bounds/Rectangle'))}for i,n in defs.items()if n.tag.startswith('DefineShape')}
 def flatten(sid,frame,transform,ancestry=(),owner=None):
  assert sid not in ancestry;out=[]
  for depth,row in domains[sid]['snapshots'][frame-1].items():
   oid=row['objectId'];matrix=h.compose(transform,row['matrixTwips']);name=owner or row['name'];ident={'objectId':oid,'ownerName':name,'depth':depth,'ancestry':[*ancestry,sid],'matrixTwips':matrix}
   if oid in texts:out.append({**ident,'textId':oid,'text':texts[oid]['text'],'kind':texts[oid]['kind'],'boundsPx':h.box(texts[oid]['boundsTwips'],matrix)})
   elif oid in domains:
    # Nested quiz widgets are recorded separately; content clips all have one frame.
    if oid in [15,66,67]:out.append({**ident,'kind':'scripted-widget','frameCount':domains[oid]['frameCount']})
    else:
     assert domains[oid]['frameCount']==1,(oid,domains[oid]['frameCount']);out.extend(flatten(oid,1,matrix,(*ancestry,sid),name))
   elif oid in shapes:out.append({**ident,'kind':'shape','boundsPx':h.box(shapes[oid]['boundsTwips'],matrix)})
   elif defs[oid].tag=='DefineButton2':out.append({**ident,'kind':'button'})
   else:raise AssertionError((oid,defs[oid].tag))
  return out
 questions=[]
 for q in range(1,25):
  qf=labels[973]['Q'+str(q)];rf=labels[973]['R'+str(q)];assert (qf,rf)==(q+1,q+44)
  options=[]
  for dep,row in main['snapshots'][qf-1].items():
   name=row['name'] or ''
   if not re.fullmatch(f'A{q}Opt[1-4]',name):continue
   script=export/f'scripts/DefineSprite_973/frame_{qf}/PlaceObject2_{row["objectId"]}_{dep}/CLIPACTIONRECORD on(release).as';code=script.read_text();correct='_global.arrayCorrectAnswer.push(this._name);' in code;assert correct==(name==keys[q-1]);assert '_global.arrayResponseAnswer.push(this._name);' in code and '_parent.doGetRandomQuiz();' in code
   reviewName='R'+name[1:];rev=[{'depth':d,**r}for d,r in main['snapshots'][rf-1].items()if r['name']==reviewName];assert len(rev)==1
   options.append({'letter':'ABCD'[int(name[-1])-1],'sourceInstance':name,'reviewInstance':reviewName,'sourceSpriteId':row['objectId'],'reviewSpriteId':rev[0]['objectId'],'correct':correct,'handler':pin(script)})
  assert len(options)==4 and sum(o['correct']for o in options)==1
  questions.append({'id':q,'questionFrame':qf,'reviewFrame':rf,'answerKey':keys[q-1],'options':sorted(options,key=lambda o:o['letter']),'questionDrawing':flatten(973,qf,rootMatrix),'reviewDrawing':flatten(973,rf,rootMatrix)})
 assert not list(xml.iter('SoundStreamHead')) and not list(xml.iter('SoundStreamBlock')) and not list(xml.iter('DefineSound'))
 pages=ET.parse(M/'source-v1/index.xml').getroot().findall('.//Page');assert len(pages)==60 and pages[59].text=='FQ/L6FQ02.swf'
 return {'kind':'p060-source-model-v1','animationId':M.name,'sourceSha256':intake['files'][0]['sha256'],'inputs':inputs,'runtime':{'swfVersion':xml.get('version'),'rootFrames':10,'rootEntryFrame':6,'mainSpriteId':973,'mainFrames':69,'fps':12,'stage':[800,600],'rootMatrixTwips':rootMatrix},'identity':{'ordinal':60,'section':'FQ','sectionOrdinal':2,'title':pages[59].get('Title')},'fonts':fonts,'texts':texts,'shapes':shapes,'domains':{i:{'frameCount':d['frameCount'],'labels':labels[i],'instances':h.compress_selected(d),'events':d['events']}for i,d in domains.items()},'scripts':scripts,'questions':questions,'sourceSessionSize':10,'embeddedAudioCount':0,'sourceFrameActions':actions,'sourceHostCallsPending':True,'registered':False,'acceptanceEffects':{k:False for k in ['originalRuntime','fidelity','audio','human','owner','strictCompletion','release','publication']}}
if __name__=='__main__':
 assert sys.argv[1:] in [['--write'],['--check']];model=build();out=M/'native-v1/source-model-v1.json';b=(json.dumps(model,ensure_ascii=False,indent=2)+'\n').encode()
 if sys.argv[1]=='--write':
  out.parent.mkdir(exist_ok=True)
  with out.open('xb')as f:f.write(b)
 else:assert out.read_bytes()==b
 print(json.dumps({'output':pin(out),'questions':len(model['questions']),'texts':len(model['texts']),'domains':len(model['domains']),'scripts':len(model['scripts'])}))
