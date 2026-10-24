from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-57');texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==49 for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
for row in main['frames']:
 bydepth={p['depth']:p for p in row};paragraph=prefix(row,51);coefficient=bydepth[17];active=[g['term']for g in m['glossary']if any(p['characterId']==g['characterId']for p in row)and re.search(r'\b'+re.escape(g['term'].lower())+r'\b',paragraph.lower())]
 graphPoses=[pose(p)for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in[8,31,33,35]];p=bydepth.get(69)
 highlight=None if not p else dict(**pose(p),ratio=p.get('ratio',0)/65535 if p['characterId']==47 else 1)
 states.append(dict(paragraphs=[paragraph],terms=active,coefficient=texts[coefficient['characterId']]['text'].strip(),coefficientId=coefficient['characterId'],equationAlpha=alpha(bydepth[13]),graphAlpha=alpha(bydepth[21]),graphPoses=graphPoses,highlight=highlight,marker=pose(bydepth[75]),track=pose(bydepth[74])))
 labels=[]
 for p in sorted(row,key=lambda p:p['depth']):
  if 9<=p['characterId']<=32 and p['characterId']in texts:
   t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p)))
 assert len(labels)==43;labelFrames.append(labels)
assert all(p['matrix']==[1,0,0,1,-3510,-2584]for row in main['frames'][5:]for p in row if p['depth']==72)
assert len({s['coefficient']for s in states})==9
vectors=[]
for id in [8,31,33,34,36,37]:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];gradients=[dict(attributes=n.attrib,stops=[c.attrib for c in n])for n in r.iter(ns+'linearGradient')];assert paths
 assert all(not list(n)for n in r.iter(ns+'path'))
 vectors.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths,gradients=gradients))
child=next(t for t in m['timelines']if t['timelineId']=='sprite-35');assert len(child['frames'])==1 and child['frames'][0][0]['matrix']==[1,0,0,1,0,0]
morph=E.parse(B/'source-v1/ffdec/morphshapes/47.svg').getroot();line=next(morph.iter(ns+'path'));anim=next(n for n in morph.iter(ns+'animate')if n.get('attributeName')=='d');points=[[float(x)for x in re.findall(r'-?\d+(?:\.\d+)?',p)]for p in anim.get('values').split(';')];assert len(points)==2 and all(len(p)==4 for p in points)
static=next(E.parse(B/'source-v1/ffdec/shapes/48.svg').getroot().iter(ns+'path'));assert[float(x)for x in re.findall(r'-?\d+(?:\.\d+)?',static.get('d'))]==points[1]
last=main['frames'][-1];graphBounds=[box(bounds[id],next(p for p in last if p['characterId']==id))for id in [8,31,33]];labels=labelFrames[-1]
left=min([b[0]for b in graphBounds]+[l['x']for l in labels])-500;right=max([b[1]for b in graphBounds]+[l['x']for l in labels])+500;top=min([b[2]for b in graphBounds]+[l['y']for l in labels])-500;bottom=max([b[3]for b in graphBounds]+[l['y']for l in labels])+500
stream=json.loads((B/'native-v1/streams-v1.json').read_text())[0];decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());d=next(d for d in decode['streams']if d['spriteId']==57);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==stream['sourceSha256']and d['decodedSamples']==stream['decodedSamplesCandidate']and all(d['contextClosed']for d in decode['streams'])
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-57',firstFrame=1,frameCount=213,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=stream['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in stream['blocks']if b['samples']==0 and b['seek']<0])
assert not clock['emptyNegativeBlocks']
trackBounds=[box(bounds[36],s['track'])for s in states]+[box(bounds[37],s['marker'])for s in states];tl=min(b[0]for b in trackBounds)-100;tt=min(b[2]for b in trackBounds)-100;tr=max(b[1]for b in trackBounds)+100;tb=max(b[3]for b in trackBounds)+100
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=57,mainFrameCount=213,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(vectors=vectors,labelFrames=spans(labelFrames),labels=labels,viewBox=[left,top,right-left,bottom-top],lineStart=points[0],lineEnd=points[1],lineStroke=line.get('stroke'),lineStrokeWidth=float(line.get('stroke-width')),trackViewBox=[tl,tt,tr-tl,tb-tt]),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},emptyNeutralBlocks=[b for b in stream['blocks']if b['samples']==0 and b['seek']==0],sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if '--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(status='pass',bytes=len(out.encode()),spans=len(native['visualStates']),labelSpans=len(native['graph']['labelFrames']),labels=len(labels),completeTextFrame=next((i+1 for i,r in enumerate(main['frames'])if prefix(r,51)==texts[51]['text'].rstrip()),None),termsFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},graphViewBox=native['graph']['viewBox'],trackViewBox=native['graph']['trackViewBox'],highlightFrames=[i+1 for i,s in enumerate(states)if s['highlight']is not None][::39])))
