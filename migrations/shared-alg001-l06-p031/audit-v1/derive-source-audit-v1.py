"""Reproducible P031 source audit; preserve the one-frame end-quiz finding."""
from pathlib import Path
import hashlib,importlib.util,json,struct,sys,zlib
import xml.etree.ElementTree as ET
from collections import Counter
sys.dont_write_bytecode=True
R=Path(__file__).resolve().parents[3];M=R/'migrations/shared-alg001-l06-p031';A=M/'audit-v1';E=Path('/Volumes/American Dream/hudongpin/g678-p031-source-extraction-20261003-v1');EXPECTED='e0ab7279035ee362a5131807f8e6d7d683afb390f9dd627f9924b7a51f550a79'
def pin(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();b=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def build():
 custody=json.loads((A/'source-custody-v1.json').read_text());inputs=[]
 for row in custody['rows']:
  for kind in ['source','copy']:
   p=row[kind];actual=pin(p['path']);assert actual['bytes']==p['bytes'] and actual['sha256']==p['sha256'];inputs.append(actual)
 source=M/'source-v1/L6IN03.swf';assert pin(source)['sha256']==EXPECTED
 receipt=json.loads((A/'source-extraction-v1.json').read_text());assert all(x['exitCode']==0 for x in receipt['runs']);export=Path(receipt['exportRoot'])
 assert {str(p.relative_to(export)) for p in export.rglob('*') if p.is_file()}=={p['path'] for p in receipt['files']}
 for p in receipt['files']:
  actual=pin(export/p['path']);assert actual['bytes']==p['bytes'] and actual['sha256']==p['sha256']
 assert pin(E/'swfmill.xml')==receipt['xml'];inputs.extend([pin(A/'source-extraction-v1.json'),pin(E/'swfmill.xml')])
 pages=ET.parse(M/'source-v1/index.xml').getroot().findall('.//Page');assert len(pages)==60 and pages[30].text=='IN/L6IN03.swf'
 root=ET.parse(E/'swfmill.xml').getroot();head=root.find('Header');tags=head.find('tags');defs={int(n.get('objectID')):n for n in tags if n.tag.startswith('Define') and n.get('objectID')};main=defs[363];assert main.get('frames')=='1611'
 binary=R/'migrations/shared-alg001-l06-p048/generator-v1/derive-source-model-v1.py';assert pin(binary)['sha256']=='2fb124ba601e8fa32cbc9efa0fabc3651566334cbefbba2369744b198fc05513';inputs.append(pin(binary));spec=importlib.util.spec_from_file_location('p031_binary',binary);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 raw=source.read_bytes();assert raw[:3]==b'CWS';raw=b'FWS'+raw[3:8]+zlib.decompress(raw[8:]);assert len(raw)==struct.unpack_from('<I',raw,4)[0]
 bits=raw[8]>>3;start=8+(5+4*bits+7)//8+4;top=list(mod.binary_tags(raw,start,len(raw)));body=next(b for code,b,_,_ in top if code==39 and struct.unpack_from('<H',b)[0]==363);assert struct.unpack_from('<H',body,2)[0]==1611
 mainBinary=list(mod.binary_tags(body,4,len(body)));assert not any(code in [12,59] for code,_,_,_ in mainBinary);assert not any(code==26 and b[0]&128 for code,b,_,_ in mainBinary)
 assert not main.findall('./tags/DoAction') and not main.findall('./tags/DoInitAction')
 scripts={str(f.relative_to(export)):f.read_text() for f in sorted((export/'scripts').rglob('*.as'))};assert len(scripts)==29
 frame=1;active={};visible={};placements=[];removals=[];mainStreams=[]
 for n in main.find('tags'):
  if n.tag.startswith('PlaceObject'):
   depth=int(n.get('depth'));previous=active.get(depth,{})
   state={**previous,**n.attrib};active[depth]=state
   if n.get('objectID'):placements.append({'frame':frame,**n.attrib,'matrix':n.find('transform/Transform').attrib if n.find('transform/Transform') is not None else None})
  if n.tag.startswith('RemoveObject'):
   depth=int(n.get('depth'));removals.append({'frame':frame,'depth':depth,'previous':active.pop(depth,None)})
  if n.tag=='SoundStreamBlock':mainStreams.append(frame)
  if n.tag=='ShowFrame':
   for depth,n in active.items():
    cid=int(n['objectID'])
    if defs[cid].tag=='DefineButton2' or n.get('name','').startswith('Mc_'):
     key=(cid,depth,n.get('name'));visible.setdefault(key,[]).append(frame)
   frame+=1
 def ranges(values):
  result=[]
  for value in values:
   if result and value==result[-1][1]+1:result[-1][1]=value
   else:result.append([value,value])
  return result
 windows=[{'characterId':cid,'depth':depth,'name':name,'ranges':ranges(frames)} for (cid,depth,name),frames in sorted(visible.items())]
 answers=[w for w in windows if (w['name'] or '').startswith('AnsBtn')];feedback=[w for w in windows if (w['name'] or '').startswith('Mc_')]
 assert len(answers)==5 and len(feedback)==7 and all(w['ranges']==[[1610,1610]] for w in answers+feedback)
 domains=[]
 for cid,n in defs.items():
  if n.tag!='DefineSprite':continue
  frame=1;actions=[];stream=[];children=set();labels=[]
  for x in n.find('tags'):
   if x.tag in ['DoAction','DoInitAction']:actions.append(frame)
   if x.tag=='SoundStreamBlock':stream.append(frame)
   if x.tag.startswith('PlaceObject') and x.get('objectID'):children.add(int(x.get('objectID')))
   if x.tag=='FrameLabel':labels.append({'frame':frame,**x.attrib})
   if x.tag=='ShowFrame':frame+=1
  domains.append({'characterId':cid,'frames':int(n.get('frames')),'actionFrames':actions,'directChildren':sorted(children),'labels':labels,'audio':{'headers':[x.attrib for x in n.find('tags') if x.tag in ['SoundStreamHead','SoundStreamHead2']],'blocks':len(stream),'firstFrame':stream[0] if stream else None,'lastFrame':stream[-1] if stream else None}})
 host=R/'output/alg-l06-p029-prequiz-host-ownership-v1/indexMI-historical-extract/scripts/frame_35/DoAction.as';h=pin(host);assert h['sha256']=='380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74';text=host.read_text();assert 'intMc_Name = random(4);' in text and 'intMc_Name = random(3);' in text
 inputs.append(h)
 return {'kind':'p031-source-audit-v1','animationId':'shared-alg001-l06-p031','sourceSha256':EXPECTED,'inputs':inputs,'extraction':{'files':len(receipt['files']),'bytes':sum(x['bytes'] for x in receipt['files']),'scripts':len(scripts),'complete':True},
  'identity':{'module':'ALG001','lesson':6,'ordinal':31,'section':'IN','sectionOrdinal':2,'title':pages[30].get('Title'),'samePathFla':False},
  'timeline':{'rootFrames':10,'rootBeginFrame':6,'mainSprite':363,'mainFrames':1611,'fps':12,'stage':{'width':800,'height':600},'mainActionCount':0,'mainClipActionCount':0,'binaryAndXmlAgree':True,'mainStreamBlocks':len(mainStreams),'mainFirstBlock':mainStreams[0],'mainLastBlock':mainStreams[-1]},
  'tagCounts':dict(Counter(x.tag for x in tags)),'domains':domains,'controlWindows':windows,'namedPlacements':[p for p in placements if p.get('name')],'finalRemovals':[p for p in removals if p['frame']==1611],
  'buttonActions':[{'characterId':int(name.split('/')[1].split('_')[1]),'script':pin(export/name),'text':text} for name,text in scripts.items() if '/DefineButton2_' in name],
  'glossaryKeys':['Function','Calculate','Domain'],'correctAnswerInstance':'AnsBtn1','correctAnswerCharacterId':87,'wrongPopup':{'spriteIds':[299,337,362],'holdFrame':64,'closeJump':65,'endFrame':70,'endIncrementsTryCount':True,'endResumesWhenTryCountAtLeast':1},
  'hostComparison':{'kind':'historical extracted script comparison, no claim of exact historical page-host pairing','script':h,'selectionRight':[1,2,3,4],'selectionWrong':[1,2,3],'pageRightNames':[1,4,5,6],'missingSelectedRightNames':[2,3],'pageRightNamesOutsideSelection':[5,6],'feedbackEntry':2,'mainStopRule':'candidate host stops when main currentframe >= totalframes; no source-established hold at1610'},
  'requiredDecisions':['Preserve that all five answer targets and seven feedback instances only exist on1610 and are removed on1611. Do not invent a held quiz or copy P029 retry semantics.','Resolve exact historical host/selection contract or carry the unbound requests explicitly; do not renumber right6/right5 into2/3.','Resolve native text/geometry and glossary source definitions, audio timeline cues, owned-feedback lifecycle and visible source behavior before registration.'],
  'registered':False,'rendererImplemented':False,'scaleOutAuthorized':False,'acceptanceEffects':{k:False for k in ['originalRuntime','fidelity','listening','human','owner','strictComplete','release','publication']}}
value=build();body=(json.dumps(value,indent=2)+'\n').encode();target=A/'source-audit-v1.json'
if sys.argv[1:]==['--check']:assert target.read_bytes()==body;print('P031 source audit byte-reproduction PASS')
else:
 assert not sys.argv[1:];target.write_bytes(body);print(json.dumps({'path':str(target),'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'controlWindows':value['controlWindows']}))
