from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p21a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
assert m['source']['sha256']==sha((M/'source-v1/L8IN06.swf').read_bytes())=='be06177c83ef9ca4878c7179b8127fa2dd13c10ac32a17f4d8b1236ea42a7fbb'
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
roles={2:'left coordinate grid and axes',12:'right coordinate grid and axes',13:'two blue source lines',14:'red source point',15:'red source point',17:'left vertical dashed distance',19:'left horizontal dashed distance',21:'right horizontal dashed distance',23:'right vertical dashed distance',24:'left highlighted vertical distance',25:'yellow length label background',27:'vertical distance highlights',29:'source vertical and length glossary underlines',35:'source glossary underline',44:'two formula fraction bars',47:'left numeric fraction bar',51:'right numeric fraction bar',56:'positive slope direction arrow',58:'positive slope blue line',59:'positive slope yellow highlight',60:'negative slope direction arrow',62:'negative slope blue line',63:'negative slope magenta highlight',65:'simplified right fraction bar'}
morphRoles={16:['left vertical start','left vertical end'],18:['left horizontal start','left horizontal end'],20:['right horizontal start','right horizontal end'],22:['right vertical start','right vertical end'],42:['left fraction bar start','left fraction bar end'],43:['right fraction bar start','right fraction bar end'],57:['positive slope highlight start','positive slope highlight end'],61:['negative slope highlight start','negative slope highlight end']}
shapes=[];morphs=[]
for id,role in roles.items():
 p=D/f'ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];assert paths and all(not list(n)for n in r.iter(ns+'path'));assert not list(r.iter(ns+'linearGradient'))
 shapes.append(dict(sourceShapeId=id,role=role,svgSha256=sha(p.read_bytes()),paths=paths,gradients=[]))
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
allids=set(roles)|set(morphRoles)|set(texts)|{32,33,37,41};states=[]
for frame,row in enumerate(main['frames'],1):
 for p in row:assert p['characterId']in allids and not p.get('clipDepth');alpha(p)
 byid={p['characterId']:p for p in row};terms=[g['term']for g in m['glossary']if g['characterId']in byid and alpha(byid[g['characterId']])>0]
 text=[native(p)for p in row if p['characterId']in texts]
 vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'],ratio=p.get('ratio',0)if p['characterId']in morphRoles else None)for p in row if p['characterId']in set(roles)|set(morphRoles)]
 states.append(dict(terms=terms,texts=text,vectors=vectors))
assert len(states)==797
for term,first in [('Vertical',262),('Length',262),('Horizontal',297),('Slope',324)]:assert [i+1 for i,s in enumerate(states)if term in s['terms']]==list(range(first,798))
for id,frames in [(67,list(range(714,723,2))),(68,list(range(784,793,2))),(69,list(range(784,793,2)))]:assert [i+1 for i,s in enumerate(states)if any(t['sourceCharacterId']==id for t in s['texts'])]==frames
for id,first,last in [(16,115,162),(18,164,169),(20,172,180),(22,182,189),(42,348,356),(43,348,356),(57,498,520),(61,569,589)]:assert [i+1 for i,s in enumerate(states)if any(v['sourceShapeId']==id for v in s['vectors'])]==list(range(first,last+1))
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1;s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==70);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];assert [seg['firstFrame']for seg in s['segments']]==[10,12,451]
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-70',firstFrame=1,frameCount=797,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0])
model={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','behavior']};model.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],diagram=dict(viewBox=[-7200,-4300,14000,7100],shapes=shapes,morphs=morphs,semanticReplacements=[dict(sourceShapeId=31,role='source hit-test rectangle replaced by four native source-bound glossary controls at authored activation frames',sha256=sha((D/'ffdec/shapes/31.svg').read_bytes()))]),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/visual-model-v1.json';out=json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=797,spans=len(model['visualStates']),sourceTextDefinitions=len(texts),shapes=len(shapes),morphs=len(morphs),sourceRuns=[10,12,451],registered=False)))
