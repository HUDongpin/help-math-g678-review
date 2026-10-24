from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys
M=Path(__file__).resolve().parents[1];R=M.parents[1];D=Path('/Volumes/American Dream/.g6l8p20a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-186');texts={t['characterId']:t for t in m['texts']};sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
assert sha((M/'source-v1/L8IN05.swf').read_bytes())==m['source']['sha256']
def alpha(p,strict=True):
 c=p.get('colorTransform',{});assert not strict or (c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3)
 return max(0,min(1,c.get('multiply',[256]*4)[3]/256+c.get('add',[0]*4)[3]/255))
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  x=r['xOffsetTwips']if r['xOffsetTwips']is not None else x;y=r['yOffsetTwips']if r['yOffsetTwips']is not None else y;glyphs=[];start=x
  for g in r['glyphs']:
   assert g['unicode']is not None;glyphs.append(dict(text=g['unicode'],x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],x=start,y=y,advanceTwips=x-start,glyphs=glyphs))
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceTagSha256=t['sourceTagSha256'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],text=t['text'],boundsTwips=t['boundsTwips'],alpha=alpha(p),runs=runs)
def box(b,p):
 a,bm,c,d,e,f=p['matrix'];pts=[(a*x+c*y+e,bm*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return [min(p[0]for p in pts),max(p[0]for p in pts),min(p[1]for p in pts),max(p[1]for p in pts)]
def prefix(row):
 p=next(p for p in row if p['characterId']==6);t=texts[6];mask=next(p for p in row if p['characterId']==3);assert mask['clipDepth']==8
 clip=box(dict(left=-810,right=811,top=-280,bottom=281),mask);out='';x=0;done=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
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
for id in [10,12,14,19,22]:
 p=D/f'ffdec/shapes/{id}.svg';r=E.parse(p).getroot();shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=[n.attrib for n in r.iter(ns+'path')],gradients=[dict(kind=g.tag[len(ns):],attributes=g.attrib,stops=[s.attrib for s in g])for g in r.iter()if g.tag in [ns+'linearGradient',ns+'radialGradient']]))
textIds=[11,13,15,16,17,18,20,21,23,24,183,184,185];states=[];termEnds={'Equation':len('Which of the following equations'),'Linear equation':len('Which of the following equations is a linear equation')}
for frame,row in enumerate(main['frames'],1):
 q=prefix(row);states.append(dict(question=q,terms=[g['term']for g in m['glossary']if len(q)>=termEnds[g['term']]and any(p['characterId']==g['characterId']for p in row)],texts=[native(p)for p in row if p['characterId']in textIds],vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in row if p['characterId']in [10,12,14,19,22]]))
assert len(states)==172
for id,wanted in [(183,[103,105,107,109,111,113]),(184,[131,133,135,137,139]),(185,[160,162,164,166,168,170])]:assert [i+1 for i,s in enumerate(states)if any(t['sourceCharacterId']==id for t in s['texts'])]==wanted
branches=[]
for b in m['branches']:
 tl=next(t for t in m['timelines']if t['timelineId']=='sprite-'+str(b['spriteId']));pos=next(p for p in main['frames'][48]if p['characterId']==b['spriteId']);values=[]
 for row in tl['frames']:
  a=0
  for p in row:
   if p['characterId']in b['titleIds']:
    bounds=box(texts[p['characterId']]['boundsTwips'],p)
    if bounds[1]+8248+pos['matrix'][4]>0 and bounds[0]+8248+pos['matrix'][4]<16000 and bounds[3]+5666+pos['matrix'][5]>0 and bounds[2]+5666+pos['matrix'][5]<12000:a=max(a,alpha(p,False))
  values.append(a)
 branches.append(dict(**b,titleAlpha=spans(values)))
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and len(decode['streams'])==9 and all(d['contextClosed']for d in decode['streams'])
decoder=lambda d:{k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];clocks.append(dict(spriteId=s['spriteId'],decoder=decoder(d),segments=s['segments']))
sa=next(d for d in decode['streams']if d['spriteId']=='SA');model={k:m[k]for k in ['animationId','fps','rootFrameCount','rootBeginFrame','mainSpriteId','mainFrameCount','quizFrame','correctAnswer','answerCharacters','behavior','title','titleSourceShapeId']};model.update(sourceSha256=m['source']['sha256'],branches=branches,clocks=clocks,sa=decoder(sa),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],visualStates=spans(states),diagram=dict(viewBox=[-6200,-2700,4100,5600],shapes=shapes),answers=[dict(answer=1,letter='A',equation='y = 2x² + 1',sourceTextIds=[16]),dict(answer=2,letter='B',equation='y = x + 5',sourceTextIds=[24]),dict(answer=3,letter='C',equation='xy = 1',sourceTextIds=[17]),dict(answer=4,letter='D',equation='y = 1/x + 3',sourceTextIds=[18,20,21],sourceShapeIds=[19])],textBindings=[dict(depth=d,sourceTextIds=sorted({t['sourceTextId']for s in states for t in s['texts']if t['depth']==d}))for d in sorted({t['depth']for s in states for t in s['texts']})],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/product-model-v1.json';out=json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=172,spans=len(model['visualStates']),nativeTexts=len(textIds),shapes=len(shapes),branches=len(branches),firstFullQuestion=next(i+1 for i,s in enumerate(states)if s['question']==texts[6]['text'].rstrip()),firstTerms={k:next(i+1 for i,s in enumerate(states)if k in s['terms'])for k in termEnds},registered=False)))
