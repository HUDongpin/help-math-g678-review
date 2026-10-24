from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p22a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
assert m['source']['sha256']==sha((M/'source-v1/L8IN07.swf').read_bytes())=='7c831f0e3bb42c28b5a82fa72a4cc28519cc813efe8b23bef2e0aae2c2ee35d5'
def alpha(p):
 c=p.get('colorTransform',{});assert c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3
 return max(0,min(1,c.get('multiply',[256]*4)[3]/256+c.get('add',[0]*4)[3]/255))
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  if r['changed']['xOffset']:x=r['xOffsetTwips']
  if r['changed']['yOffset']:y=r['yOffsetTwips']
  glyphs=[];start=x
  for g in r['glyphs']:
   assert g['unicode']is not None;glyphs.append(dict(text=g['unicode'],x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],x=start,y=y,advanceTwips=x-start,glyphs=glyphs))
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceTagSha256=t['sourceTagSha256'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],textMatrix=t['matrix'],text=t['text'],boundsTwips=t['boundsTwips'],alpha=alpha(p),runs=runs)
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
roles={12:'first red bullet and four glossary underlines',23:'second red bullet and coefficient underline',26:'right-hand division fraction bars',30:'left-hand division fraction bar',32:'simplified equation fraction bars',36:'conclusion glossary underlines',40:'slope-intercept form underline',43:'source numerator outline overlay',44:'source minus-sign outline overlay',46:'source denominator outline overlay'}
shapes=[]
for id,role in roles.items():
 p=D/f'ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];assert paths and all(not list(n)for n in r.iter(ns+'path'));assert not list(r.iter(ns+'linearGradient'))
 gradients=[dict(attributes=n.attrib,stops=[s.attrib for s in n])for n in r.iter(ns+'radialGradient')]
 assert all(len(g['stops'])>0 for g in gradients)
 shapes.append(dict(sourceShapeId=id,role=role,svgSha256=sha(p.read_bytes()),paths=paths,gradients=gradients))
# The only mask and button shapes are axis-aligned rectangles in both XML and SVG.
xml=E.parse(D/'source.xml').getroot();bounds={}
for id,expected in [(2,[-2412,2411,-250,250]),(14,[-1031,1032,-311,310])]:
 tag=next(t for t in xml.iter('item')if t.get('shapeId')==str(id));b=tag.find('shapeBounds');bounds[id]=[int(b.get(k))for k in ['Xmin','Xmax','Ymin','Ymax']];assert bounds[id]==expected
 records=tag.find('shapes/shapeRecords');assert [r.get('type')for r in records]==['StyleChangeRecord',*['StraightEdgeRecord']*4,'EndShapeRecord']
def box(p,id):
 a,b,c,d,x,y=p['matrix'];assert b==c==0 and a>0 and d>0;l,r,t,b=bounds[id];return [a*l+x,a*r+x,d*t+y,d*b+y]
def contains(a,b):return a[0]<=b[0] and a[1]>=b[1] and a[2]<=b[2] and a[3]>=b[3]
buttonIds={g['characterId']for g in m['glossary']};allids=set(roles)|set(texts)|buttonIds|{2};states=[];termFrames={g['term']:[]for g in m['glossary']}
for frame,row in enumerate(main['frames'],1):
 for p in row:assert p['characterId']in allids;alpha(p)
 masks=[dict(sourceShapeId=2,instanceId=p['instanceId'],depth=p['depth'],clipDepth=p['clipDepth'],matrix=p['matrix'],bounds=box(p,2))for p in row if p.get('clipDepth')]
 assert all(p['characterId']==2 for p in row if p.get('clipDepth'));assert all(a['clipDepth']<b['depth']for a,b in zip(masks,masks[1:]))
 def clips(p):return [v['depth']for v in masks if v['depth']<p['depth']<=v['clipDepth']]
 terms=[]
 for g in m['glossary']:
  for p in row:
   if p['characterId']!=g['characterId'] or alpha(p)<=0:continue
   hit=box(p,14);cover=[v for v in masks if v['depth']in clips(p)]
   # Modern keyboard controls become available after their complete source hit area is revealed.
   if all(contains(v['bounds'],hit)for v in cover):terms.append(g['term']);break
  if g['term']in terms:termFrames[g['term']].append(frame)
 text=[{**native(p),'clipDepths':clips(p)}for p in row if p['characterId']in texts]
 vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'],ratio=None,clipDepths=clips(p))for p in row if p['characterId']in roles]
 states.append(dict(terms=terms,texts=text,vectors=vectors,masks=masks))
assert len(states)==546
for term,frames in termFrames.items():assert frames and frames==list(range(frames[0],547)),term
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1;s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==47);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];assert [seg['firstFrame']for seg in s['segments']]==[1,3,207]
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-47',firstFrame=1,frameCount=546,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0])
model={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','behavior']};model.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],termVisibility={term:frames[0]for term,frames in termFrames.items()},termVisibilityDecision='Modern controls wait for full source hit rectangle containment in the authored mask, not merely placement. Original invisible-hit behavior remains unaccepted.',diagram=dict(viewBox=[-7300,-4200,14800,8500],shapes=shapes,morphs=[],semanticReplacements=[dict(sourceShapeId=14,role='eight hit-test rectangles replaced by source-bound native glossary controls after full reveal',sha256=sha((D/'ffdec/shapes/14.svg').read_bytes())),dict(sourceShapeId=2,role='seven authored rectangular clipping groups; mask fill is not painted',sha256=sha((D/'ffdec/shapes/2.svg').read_bytes()))]),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/visual-model-v1.json';out=json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=546,spans=len(model['visualStates']),sourceTextDefinitions=len(texts),shapes=len(shapes),masks=7,termVisibility=model['termVisibility'],sourceRuns=[1,3,207],registered=False)))
