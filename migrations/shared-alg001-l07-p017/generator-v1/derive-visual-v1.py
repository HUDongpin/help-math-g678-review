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
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in[40] for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
# P017 uses authored y=x then fixed y=x+3. Interactive input never rotates the line.
shape_ids=[11,35,36,97];shapes=[]
for id in shape_ids:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];assert paths
 assert all(not list(n)and not any('url('in v for v in n.attrib.values())for n in r.iter(ns+'path'))
 shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths))
static={98:97}
def graphic(p):
 id=p['characterId'];matrix=p['matrix'];leaf=id
 if id in static:
  t=next(t for t in m['timelines']if t['timelineId']==f'sprite-{id}');assert len(t['frames'][0])==1
  child=t['frames'][0][0];leaf=child['characterId'];assert leaf==static[id];matrix=compose(matrix,child['matrix'])
 assert leaf in shape_ids
 return dict(sourceShapeId=leaf,sourceCharacterId=id,instanceId=p['instanceId'],matrix=matrix,alpha=alpha(p),ratio=None)
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in[42,77]]
 terms=[g['term']for g in m['glossary']if g['characterId']in byid and re.search(r'\b'+re.escape(g['term'].lower())+r'\b',paragraphs[0].lower())]
 marker=byid.get(4)or byid.get(79)or byid.get(95);assert marker
 track=next(p for p in row if p['characterId']==3);trackBox=box(bounds[3],track);knob=marker['matrix'][4]
 field=next(p for p in row if p['depth']==20);intercept=texts[field['characterId']]['text'];coefficient=texts[byid[9]['characterId']]['text']
 nodes=[graphic(p)for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in shape_ids+[98]]
 states.append(dict(paragraphs=paragraphs,annotations=[],terms=terms,graphAlpha=alpha(byid[11]),equationSlope=intercept,equationCoefficient=coefficient,equationSourceTextId=texts[field['characterId']]['sourceTextId'],equationEmphasis=False,demoKnobRatio=(knob-trackBox[0])/(trackBox[1]-trackBox[0]),sliderCue=bool(alpha(byid.get(46))),drawCue=False,drawVisible=True,nodes=nodes))
last=main['frames'][-1];labels=[]
for p in sorted(last,key=lambda p:p['depth']):
 if 24<=p['depth']<=66:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
assert len(labels)==43
boxes=[box(bounds[id],next(p for p in last if p['characterId']==id))for id in[11,35]]
left=min([b[0]for b in boxes]+[l['x']for l in labels])-400;right=max([b[1]for b in boxes]+[l['x']for l in labels])+400;top=min([b[2]for b in boxes]+[l['y']for l in labels])-400;bottom=max([b[3]for b in boxes]+[l['y']for l in labels])+400
streams=json.loads((B/'native-v1/streams-v1.json').read_text());decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate']
 clocks.append(dict(spriteId=s['spriteId'],frameCount=s['frameCount'],decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0],emptyNeutralBlocks=[b for b in s['blocks']if b['samples']==0 and b['seek']==0]))
sa=next(d for d in decode['streams']if d['spriteId']=='SA')
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=99,mainFrameCount=254,quizFrame=137,postQuizFrame=138,forcedAnswerFrame=None,visibleAnswerFrame=141,feedbackSpriteId=94,feedbackFirstFrame=2,feedbackLastFrame=8,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,morphs=[],labels=labels,viewBox=[left,top,right-left,bottom-top]),slider=m['slider'],behavior=m['behavior'],clocks=clocks,sa={k:sa[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert states[136]['equationSlope']==''and states[139]['equationSlope']==''and states[140]['equationSlope']=='3'
assert all(any(n['sourceShapeId']==97 and n['sourceCharacterId']==98 for n in v['nodes'])for v in states[140:])
assert states[0]['graphAlpha']==0 and states[4]['graphAlpha']==1
out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if'--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(status='pass',spans=len(native['visualStates']),shapes=len(shapes),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[42,77]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},graphViewBox=native['graph']['viewBox'],clocks=[c['spriteId']for c in clocks])))
