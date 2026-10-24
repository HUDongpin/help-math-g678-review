from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys
M=Path(__file__).resolve().parents[1];R=M.parents[1];D=Path('/Volumes/American Dream/.g6l8p23a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-203');texts={t['characterId']:t for t in m['texts']};sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
assert sha((M/'source-v1/L8IN08.swf').read_bytes())==m['source']['sha256']
def alpha(p,strict=True):
 c=p.get('colorTransform',{});assert not strict or (c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3)
 return max(0,min(1,c.get('multiply',[256]*4)[3]/256+c.get('add',[0]*4)[3]/255))
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  x=r['xOffsetTwips']if r['changed']['xOffset']else x;y=r['yOffsetTwips']if r['changed']['yOffset']else y;glyphs=[];start=x
  for g in r['glyphs']:
   assert g['unicode']is not None;glyphs.append(dict(text=g['unicode'],x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],x=start,y=y,advanceTwips=x-start,glyphs=glyphs))
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceTagSha256=t['sourceTagSha256'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],textMatrix=t['matrix'],text=t['text'],boundsTwips=t['boundsTwips'],alpha=alpha(p),runs=runs)
def box(b,p):
 a,bm,c,d,e,f=p['matrix'];pts=[(a*x+c*y+e,bm*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return [min(p[0]for p in pts),max(p[0]for p in pts),min(p[1]for p in pts),max(p[1]for p in pts)]
def prefix(row):
 p=next(p for p in row if p['characterId']==6);t=texts[6];assert t['matrix']==[1,0,0,1,0,0];mask=next(p for p in row if p['characterId']==3);assert mask['clipDepth']==8
 clip=box(dict(left=-810,right=811,top=-280,bottom=281),mask);out='';x=0;done=False
 for r in t['runs']:
  if r['changed']['xOffset']:x=r['xOffsetTwips']
  for g in r['glyphs']:
   n=x+g['advanceTwips'];b=box(dict(left=x,right=n,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):done=True;break
   out+=g['unicode'];x=n
  if done:break
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if' 'in out else''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
shapes=[]
for id in [10,12,16,19,184,188,190,194,199]:
 p=D/f'ffdec/shapes/{id}.svg';r=E.parse(p).getroot();shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=[n.attrib for n in r.iter(ns+'path')],gradients=[dict(kind=g.tag[len(ns):],attributes=g.attrib,stops=[s.attrib for s in g])for g in r.iter()if g.tag in [ns+'linearGradient',ns+'radialGradient']]))
textIds=sorted({p['characterId']for row in main['frames']for p in row if p['characterId']in texts and p['characterId']!=6})
assert all(texts[id]['matrix']==[1,0,0,1,0,0]for id in textIds)
xml=E.parse(D/'source.xml').getroot();bounds={}
for id,expected in [(3,[-810,811,-280,281]),(7,[-1031,1032,-311,310])]:
 tag=next(t for t in xml.iter('item')if t.get('shapeId')==str(id));b=tag.find('shapeBounds');values=[int(b.get(k))for k in ['Xmin','Xmax','Ymin','Ymax']];assert values==expected;bounds[id]=dict(zip(['left','right','top','bottom'],values))
 assert [r.get('type')for r in tag.find('shapes/shapeRecords')]==['StyleChangeRecord',*['StraightEdgeRecord']*4,'EndShapeRecord']
def contains(a,b):return a[0]<=b[0]and a[1]>=b[1]and a[2]<=b[2]and a[3]>=b[3]
states=[]
for frame,row in enumerate(main['frames'],1):
 mask=next(p for p in row if p['characterId']==3);clip=box(bounds[3],mask);assert mask['clipDepth']==8
 terms=[]
 for g in m['glossary']:
  ps=[p for p in row if p['characterId']==g['characterId']and alpha(p)>0]
  if any(contains(clip,box(bounds[7],p))for p in ps):terms.append(g['term'])
 q=prefix(row);states.append(dict(question=q,terms=terms,texts=[native(p)for p in row if p['characterId']in textIds],vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in row if p['characterId']in [10,12,16,19,184,188,190,194,199]]))
assert len(states)==385
for id,wanted in [(201,[355,357,359,361,363]),(202,[375,377,379,381])]:assert [i+1 for i,s in enumerate(states)if any(t['sourceCharacterId']==id for t in s['texts'])]==wanted

branches=[]
for b in m['branches']:
 tl=next(t for t in m['timelines']if t['timelineId']=='sprite-'+str(b['spriteId']));pos=next(p for p in main['frames'][98]if p['characterId']==b['spriteId']);values=[]
 for row in tl['frames']:
  a=0
  for p in row:
   if p['characterId']in b['titleIds']:
    inner=box(texts[p['characterId']]['boundsTwips'],dict(matrix=texts[p['characterId']]['matrix']));bounds=box(dict(zip(['left','right','top','bottom'],inner)),p)
    if bounds[1]+8248+pos['matrix'][4]>0 and bounds[0]+8248+pos['matrix'][4]<16000 and bounds[3]+5666+pos['matrix'][5]>0 and bounds[2]+5666+pos['matrix'][5]<12000:a=max(a,alpha(p,False))
  values.append(a)
 branches.append(dict(**b,titleAlpha=spans(values)))
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and len(decode['streams'])==8 and all(d['contextClosed']for d in decode['streams'])
decoder=lambda d:{k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];clocks.append(dict(spriteId=s['spriteId'],decoder=decoder(d),segments=s['segments']))
adpcm=json.loads((M/'native-v1/adpcm-decode-v1.json').read_text());reuse=json.loads((M/'audit-v1/adpcm-browser-decode-applicability-v1.json').read_text());assert reuse['pass_']and reuse['current']['sha256']==adpcm['sourceSha256']
d=json.loads(Path(reuse['priorReceipt']['path']).read_text());assert sha(Path(reuse['priorReceipt']['path']).read_bytes())==reuse['priorReceipt']['sha256']and d['sourceSha256']==adpcm['sourceSha256']
assert adpcm['blockFrames']==list(range(1,14))and adpcm['entryTargetSample']==1837 and d['decodedSamples']==23870
clocks.append(dict(spriteId=102,decoder=decoder(d),segments=[dict(firstFrame=2,firstDecodedSample=adpcm['entryTargetSample'],endDecodedSample=d['decodedSamples'])],alignmentStatus='source-declared candidate; original-runtime and resampler phase unverified'))
sa=next(d for d in decode['streams']if d['spriteId']=='SA');model={k:m[k]for k in ['animationId','fps','rootFrameCount','rootBeginFrame','mainSpriteId','mainFrameCount','quizFrame','correctAnswer','answerCharacters','behavior','title','titleSourceShapeId']};model.update(sourceSha256=m['source']['sha256'],branches=branches,clocks=clocks,sa=decoder(sa),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],visualStates=spans(states),diagram=dict(viewBox=[-6200,-3300,11500,7500],shapes=shapes),answers=[dict(answer=1,letter='A',equation='−6',sourceTextIds=[14]),dict(answer=2,letter='B',equation='1',sourceTextIds=[18]),dict(answer=3,letter='C',equation='2',sourceTextIds=[21]),dict(answer=4,letter='D',equation='3',sourceTextIds=[15])],textBindings=[dict(depth=d,sourceTextIds=sorted({t['sourceTextId']for s in states for t in s['texts']if t['depth']==d}))for d in sorted({t['depth']for s in states for t in s['texts']})],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/product-model-v2.json';out=json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=385,spans=len(model['visualStates']),nativeTexts=len(textIds),shapes=len(shapes),branches=len(branches),firstFullQuestion=next(i+1 for i,s in enumerate(states)if s['question']==texts[6]['text'].rstrip()),firstTerms={k:next(i+1 for i,s in enumerate(states)if k in s['terms'])for k in [g['term']for g in m['glossary']]},registered=False)))
