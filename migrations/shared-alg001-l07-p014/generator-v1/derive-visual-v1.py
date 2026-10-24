from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in[42,72] for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if' 'in out else''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def compose(a,b):
 return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
# Source graph geometry is retained; native text and controls are separate.
shape_ids=[10,34,35,39,67,71]
shapes=[]
for id in shape_ids:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];assert paths
 assert all(not list(n) and not any('url('in v for v in n.attrib.values())for n in r.iter(ns+'path'))
 shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths))
morphs=[]
for id in[70]:
 p=B/f'source-v1/ffdec/morphshapes/{id}.svg';r=E.parse(p).getroot();paths=[]
 for n in r.iter(ns+'path'):
  attributes=dict(n.attrib);animations={a.get('attributeName'):a.get('values').split(';')for a in n}
  start,end=animations.pop('d');split=lambda x:re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?',x);a,c=split(start),split(end);assert len(a)==len(c)
  tokens=[]
  for x,y in zip(a,c):
   if re.fullmatch('[A-Za-z]',x):assert x==y;tokens.append(x)
   else:tokens.append([float(x),float(y)])
  for key,pair in animations.items():assert len(pair)==2
  paths.append(dict(attributes=attributes,tokens=tokens,animations=animations))
 morphs.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths))
static={}
def graphic(p):
 id=p['characterId'];matrix=p['matrix'];leaf=id
 if id in static:
  t=next(t for t in m['timelines']if t['timelineId']==f'sprite-{id}');assert len(t['frames'][0])==1
  child=t['frames'][0][0];leaf=child['characterId'];assert leaf==static[id];matrix=compose(matrix,child['matrix'])
 assert leaf in shape_ids or leaf in[70]
 return dict(sourceShapeId=leaf,sourceCharacterId=id,instanceId=p['instanceId'],matrix=matrix,alpha=alpha(p),ratio=p.get('ratio',0)if id in[70]else None)
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in[44,49,74]]
 terms=[]
 for g in m['glossary']:
  indices=[0]if g['term']=='Equation'else[0,2]if g['term']=='Slope'else[2]
  if g['characterId']in byid and any(re.search(r'\b'+g['term'].lower()+r'\b',paragraphs[i].lower())for i in indices):terms.append(g['term'])
 marker=byid.get(3)or byid.get(50);assert marker
 knob=marker['matrix'][4]/20
 slope=next((texts[id]['text']for id in[8,41,48,66]if id in byid),'')
 nodes=[graphic(p)for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in shape_ids+[70]]
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid.get(10)),equationSlope=slope,equationEmphasis=68 in byid and 69 in byid,demoKnobRatio=(knob+140)/191,sliderCue=bool(alpha(byid.get(40))),drawCue=False,drawVisible=True,nodes=nodes))
last=main['frames'][-1];labels=[]
for p in sorted(last,key=lambda p:p['depth']):
 if 11<=p['characterId']<=33 and p['characterId'] in texts:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
assert len(labels)==43
# Fixed bounds keep every authored graphic and HTML axis label inside the same graph.
graphBounds=[box(bounds[id],next(p for p in last if p['characterId']==id))for id in[10,34]]
left=min([b[0]for b in graphBounds]+[l['x']for l in labels])-400;right=max([b[1]for b in graphBounds]+[l['x']for l in labels])+400;top=min([b[2]for b in graphBounds]+[l['y']for l in labels])-400;bottom=max([b[3]for b in graphBounds]+[l['y']for l in labels])+400
streams=json.loads((B/'native-v1/streams-v1.json').read_text());decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate']
 clocks.append(dict(spriteId=s['spriteId'],frameCount=s['frameCount'],decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0],emptyNeutralBlocks=[b for b in s['blocks']if b['samples']==0 and b['seek']==0]))
sa=next(d for d in decode['streams']if d['spriteId']=='SA')
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=78,mainFrameCount=264,quizFrame=84,postQuizFrame=85,forcedAnswerFrame=None,visibleAnswerFrame=87,feedbackSpriteId=65,feedbackFirstFrame=2,feedbackLastFrame=15,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,morphs=morphs,labels=labels,viewBox=[left,top,right-left,bottom-top]),slider=m['slider'],behavior=m['behavior'],clocks=clocks,sa={k:sa[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert states[83]['equationSlope']=='' and states[85]['equationSlope']=='' and states[86]['equationSlope']=='–1'
assert [i+1 for i,v in enumerate(states)if v['equationEmphasis']]==[114,116,118]
assert all(any(n['sourceShapeId']==67 and n['matrix'][0]==-1 for n in v['nodes'])for v in states[86:])
assert any(n['sourceShapeId']==70 and n['ratio']==0 for n in states[143]['nodes'])and any(n['sourceShapeId']==71 for n in states[172]['nodes'])and not any(n['sourceShapeId']in[70,71]for n in states[187]['nodes'])
assert 'Line'not in states[189]['terms']
out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if'--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(status='pass',spans=len(native['visualStates']),shapes=len(shapes),morphs=len(morphs),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[44,49,74]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},graphViewBox=native['graph']['viewBox'],clocks=[c['spriteId']for c in clocks])))
