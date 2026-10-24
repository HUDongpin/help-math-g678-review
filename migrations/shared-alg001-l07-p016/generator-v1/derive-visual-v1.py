from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-81');texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in[3,79] for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
 for q in masks:
  b=box(bounds[q['characterId']],q);clip=[max(clip[0],b[0]),min(clip[1],b[1]),max(clip[2],b[2]),min(clip[3],b[3])]
 out='';x=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];b=box(dict(left=x,right=nx,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if ' 'in out else ''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def pose(p):return dict(characterId=p['characterId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'],instanceId=p['instanceId'])
states=[];labelFrames=[]
baseDepths=list(range(23,45))+list(range(66,86))+[88]
for row in main['frames']:
 bydepth={p['depth']:p for p in row};paragraphs=[prefix(row,id)for id in[6,13,80]];visible=' '.join(paragraphs).lower()
 active=[g['term']for g in m['glossary']if any(p['characterId']==g['characterId']for p in row)and re.search(r'\b'+re.escape(g['term'].lower())+('(?:es)?'if g['term']=='Cross'else '')+r'\b',visible)]
 graphPoses=[pose(p)for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in[16,17,40,44,46,48,71,75,77]];line=bydepth.get(110)
 highlight=None if not line else dict(**pose(line),ratio=line.get('ratio',0)/65535 if line['characterId']==47 else 1)
 states.append(dict(paragraphs=paragraphs,terms=active,graphAlpha=alpha(bydepth.get(21)),graphPoses=graphPoses,highlight=highlight,pointEmphasis=any(p['characterId']==74 for p in row),axisEmphasis=any(p['characterId']==78 for p in row)))
 labels=[]
 for depth in baseDepths:
  p=bydepth.get(depth)
  if not p:continue
  raw=p;t=texts[p['characterId']];replaced=[];emphasis=False;shapeIds=[]
  # Duplicate y-axis overlay uses its own source instance and coordinates during 134..154.
  if 23<=depth<=43 and 48 in[p['characterId']for p in row]:
   q=bydepth[depth+90];assert texts[q['characterId']]['text'].strip()==t['text'].strip();replaced=[p['instanceId']];p=q;t=texts[q['characterId']]
  # Explicit 0/2 blink overlays substitute the same axis role, not arbitrary equal text.
  blink=next((q for q in row if(depth==44 and q['characterId']==70)or(depth==24 and q['characterId']==73)),None)
  if blink:replaced.append(p['instanceId']);p=blink;t=texts[p['characterId']];emphasis=True
  if depth==24 and any(q['characterId']==78 for q in row):emphasis=True;shapeIds=[78]
  b=box(t['boundsTwips'],p);labels.append(dict(role=f'axis-{depth}',sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],replacedInstanceIds=replaced,sourceShapeIds=shapeIds,text=t['text'].strip(),x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p),emphasis=emphasis))
 for id in[72,76]:
  p=next((p for p in row if p['characterId']==id),None)
  if p:
   t=texts[id];b=box(t['boundsTwips'],p);labels.append(dict(role='point'if id==72 else 'coordinate',sourceTextId=t['sourceTextId'],sourceCharacterId=id,instanceId=p['instanceId'],replacedInstanceIds=[],sourceShapeIds=[74]if id==72 and states[-1]['pointEmphasis']else [],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p),emphasis=id==72 and states[-1]['pointEmphasis']))
 labelFrames.append(labels)
vectors=[]
for id in[16,17,40,44,46,48,71,75,77]:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];gradients=[dict(attributes=n.attrib,stops=[c.attrib for c in n])for n in r.iter(ns+'linearGradient')];assert paths
 # Shape 48 paths 0/2 contain outlined y and 10; use source-backed HTML axis labels.
 if id==48:paths=[v for i,v in enumerate(paths)if i not in[0,2]]
 vectors.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths,gradients=gradients,omittedNativeTextPaths=[0,2]if id==48 else []))
morph=E.parse(B/'source-v1/ffdec/morphshapes/47.svg').getroot();line=next(morph.iter(ns+'path'));anim=next(n for n in morph.iter(ns+'animate')if n.get('attributeName')=='d');points=[[float(x)for x in re.findall(r'-?\d+(?:\.\d+)?',p)]for p in anim.get('values').split(';')];assert len(points)==2 and all(len(p)==4 for p in points)
static=next(E.parse(B/'source-v1/ffdec/shapes/69.svg').getroot().iter(ns+'path'));assert[float(x)for x in re.findall(r'-?\d+(?:\.\d+)?',static.get('d'))]==points[1]
graphBounds=[box(bounds[p['characterId']],p)for row in main['frames']for p in row if p['characterId']in[16,17,40,44,46]];labels=[l for ls in labelFrames for l in ls]
left=min([b[0]for b in graphBounds]+[l['x']for l in labels])-500;right=max([b[1]for b in graphBounds]+[l['x']for l in labels])+500;top=min([b[2]for b in graphBounds]+[l['y']for l in labels])-500;bottom=max([b[3]for b in graphBounds]+[l['y']for l in labels])+500
stream=json.loads((B/'native-v1/streams-v1.json').read_text())[0];decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());d=next(d for d in decode['streams']if d['spriteId']==81);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==stream['sourceSha256']and d['decodedSamples']==stream['decodedSamplesCandidate']and all(d['contextClosed']for d in decode['streams'])
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-81',firstFrame=1,frameCount=325,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=stream['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in stream['blocks']if b['samples']==0 and b['seek']<0]);assert not clock['emptyNegativeBlocks']
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=81,mainFrameCount=325,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(vectors=vectors,labelFrames=spans(labelFrames),labels=labelFrames[-1],viewBox=[left,top,right-left,bottom-top],lineStart=points[0],lineEnd=points[1],lineStroke=line.get('stroke'),lineStrokeWidth=float(line.get('stroke-width'))),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},emptyNeutralBlocks=[b for b in stream['blocks']if b['samples']==0 and b['seek']==0],sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if '--check'in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print(json.dumps(dict(status='pass',bytes=len(out.encode()),spans=len(native['visualStates']),labelSpans=len(native['graph']['labelFrames']),labels=len(labelFrames[-1]),completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,13,80]},termsFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},graphViewBox=native['graph']['viewBox'])))
