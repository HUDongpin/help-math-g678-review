from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p19a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
assert m['source']['sha256']==sha((M/'source-v1/L8IN04.swf').read_bytes())=='1fef8f2ade37ace6dd77b334506838c543724a4c963052638203a8d0592e8b9e'
def alpha(p):
 c=p.get('colorTransform',{});assert c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3
 return max(0,min(1,c.get('multiply',[256]*4)[3]/256+c.get('add',[0]*4)[3]/255))
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  x=r['xOffsetTwips']if r['xOffsetTwips']is not None else x;y=r['yOffsetTwips']if r['yOffsetTwips']is not None else y;glyphs=[];start=x
  for g in r['glyphs']:
   assert g['unicode']is not None;glyphs.append(dict(text=g['unicode'],x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],x=start,y=y,advanceTwips=x-start,glyphs=glyphs))
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceTagSha256=t['sourceTagSha256'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],text=t['text'],boundsTwips=t['boundsTwips'],alpha=alpha(p),runs=runs)
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
roles={10:'source equation panel and gradient',14:'white y emphasis outline',16:'three rising y pointers',18:'white first x term outline',20:'white second x term outline',22:'white third x term outline',24:'three rising x pointers',26:'white first constant outline',28:'white second constant outline',30:'white third constant outline',32:'three rising constant pointers',44:'three outlined x characters fading into native a',46:'three outlined y characters fading into native b',53:'outlined time endpoint',58:'outlined distance endpoint',63:'outlined height endpoint',68:'outlined weight endpoint',73:'outlined y endpoint',78:'outlined x endpoint'}
morphRoles={**{i:['d','time']for i in [50,51,52]},**{i:['e','distance']for i in [55,56,57]},**{i:['time','height']for i in [60,61,62]},**{i:['distance','weight']for i in [65,66,67]},**{i:['weight','y']for i in [70,71,72]},**{i:['height','x']for i in [74,75,76]}}
shapes=[];morphs=[]
for id,role in roles.items():
 p=D/f'ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];assert paths and all(not list(n)for n in r.iter(ns+'path'));gradients=[dict(attributes=g.attrib,stops=[n.attrib for n in g])for g in r.iter(ns+'linearGradient')];assert bool(gradients)==(id==10)
 shapes.append(dict(sourceShapeId=id,role=role,svgSha256=sha(p.read_bytes()),paths=paths,gradients=gradients))
for id,terms in morphRoles.items():
 p=D/f'ffdec/morphshapes/{id}.svg';r=E.parse(p).getroot();paths=[]
 for n in r.iter(ns+'path'):
  animations={a.get('attributeName'):a.get('values').split(';')for a in n};start,end=animations.pop('d');split=lambda s:re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?',s);a,b=split(start),split(end);assert len(a)==len(b);tokens=[]
  for x,y in zip(a,b):
   if re.fullmatch('[A-Za-z]',x):assert x==y;tokens.append(x)
   else:tokens.append([float(x),float(y)])
  assert all(len(v)==2 for v in animations.values());assert set(animations)<={'fill','fill-opacity','stroke','stroke-width'}
  paths.append(dict(attributes=n.attrib,tokens=tokens,animations=animations))
 morphs.append(dict(sourceShapeId=id,fromText=terms[0],toText=terms[1],svgSha256=sha(p.read_bytes()),paths=paths))
allids=set(roles)|set(morphRoles)|set(texts)|{2,6,7,8,9};states=[]
for frame,row in enumerate(main['frames'],1):
 for p in row:assert p['characterId']in allids and not p.get('clipDepth');alpha(p)
 byid={p['characterId']:p for p in row};terms=[g['term']for g in m['glossary']if g['characterId']in byid and alpha(byid[g['characterId']])>0]
 text=[native(p)for p in row if p['characterId']in texts and p['characterId']not in {4,34}]
 vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'],ratio=p.get('ratio',0)if p['characterId']in morphRoles else None)for p in row if p['characterId']in set(roles)|set(morphRoles)]
 states.append(dict(paragraph=native(byid[4]),definitionFlash=native(byid[34])if 34 in byid else None,terms=terms,texts=text,vectors=vectors))
assert len(states)==576 and all(len(s['terms'])==4 for s in states)
assert [i+1 for i,s in enumerate(states)if s['definitionFlash']]==list(range(268,283,2))
for id,frames in [(35,[302,304,306]),(36,[308,310,312,314])]:assert sorted({i+1 for i,s in enumerate(states)if any(t['sourceCharacterId']==id for t in s['texts'])})==frames
for ids,first,last in [([50,51,52],485,489),([55,56,57],500,505),([60,61,62],517,521),([65,66,67],531,536),([70,71,72],547,552),([74,75,76],553,558)]:
 for id in ids:assert [i+1 for i,s in enumerate(states)if any(v['sourceShapeId']==id for v in s['vectors'])]==list(range(first,last+1))
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1;s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==80);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];assert [seg['firstFrame']for seg in s['segments']]==[9,11,83,123]
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-80',firstFrame=1,frameCount=576,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0])
model={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','behavior']};model.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],diagram=dict(viewBox=[-7150,-2850,14600,4450],shapes=shapes,morphs=morphs,semanticReplacements=[dict(sourceShapeId=2,role='source glossary underlines replaced by native definition and four source-bound glossary controls',sha256=sha((D/'ffdec/shapes/2.svg').read_bytes()))]),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/visual-model-v1.json';out=json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=576,spans=len(model['visualStates']),sourceTextDefinitions=len(texts),shapes=len(shapes),morphs=len(morphs),sourceRuns=[9,11,83,123],registered=False)))
