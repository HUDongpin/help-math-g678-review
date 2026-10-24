from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p9a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,bb,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,bb*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==42 for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
def compose(a,b):return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
shape_ids=[9,32,33,35,76,77,80,81,83,85];morph_ids=[79,82];shapes=[];morphs=[]
for id in shape_ids:
 p=D/f'ffdec/shapes/{id}.svg';root=E.parse(p).getroot();paths=[n.attrib for n in root.iter(ns+'path')];assert paths;assert all(not list(n)and not any('url('in v for v in n.attrib.values())for n in root.iter(ns+'path'));shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths))
for id in morph_ids:
 p=D/f'ffdec/morphshapes/{id}.svg';root=E.parse(p).getroot();paths=[]
 for n in root.iter(ns+'path'):
  attrs=dict(n.attrib);animations={a.get('attributeName'):a.get('values').split(';')for a in n};start,end=animations.pop('d');split=lambda v:re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?',v);a,b=split(start),split(end);assert len(a)==len(b);tokens=[]
  for x,y in zip(a,b):
   if re.fullmatch('[A-Za-z]',x):assert x==y;tokens.append(x)
   else:tokens.append([float(x),float(y)])
  assert all(len(v)==2 for v in animations.values());paths.append(dict(attributes=attrs,tokens=tokens,animations=animations))
 morphs.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths))
static={58:35,78:77}
def graphic(p):
 id=p['characterId'];matrix=p['matrix'];leaf=id
 if id in static:
  t=next(t for t in m['timelines']if t['timelineId']==f'sprite-{id}');assert len(t['frames'][0])==1;child=t['frames'][0][0];leaf=child['characterId'];assert leaf==static[id];matrix=compose(matrix,child['matrix'])
 assert leaf in shape_ids+morph_ids
 return dict(sourceShapeId=leaf,sourceCharacterId=id,instanceId=p['instanceId'],matrix=matrix,alpha=alpha(p),ratio=p.get('ratio',0)if id in morph_ids else None)
labels=[]
for p in main['frames'][-1]:
 if 10<=p['characterId']<=31 or p['characterId']==34:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
assert len(labels)==43
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in [44,51]];terms=[]
 for g in m['glossary']:
  word={'Integers':'integer','Value':'value','Slope':'slope'}[g['term']]
  if g['characterId']in byid and any(re.search(r'\b'+word+r'\b',p.lower())for p in paragraphs):terms.append(g['term'])
 marker=byid.get(56)or byid.get(48)or byid.get(40);knob=marker['matrix'][4]/20 if marker else -45
 # The introductory shape2 includes a complete track and a middle marker.
 if marker and marker['characterId']==40:knob=(bounds[40]['left']+bounds[40]['right'])/40+marker['matrix'][4]/20
 slope=next((texts[id]['text']for id in [7,49,75]if id in byid),'')
 nodes=[graphic(p)for p in row if p['characterId']in shape_ids+morph_ids+list(static)]
 annotations=[]
 for p in row:
  if p['characterId']==84:
   t=texts[84];b=box(t['boundsTwips'],p);annotations.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=84,instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p)))
 states.append(dict(paragraphs=paragraphs,annotations=annotations,terms=terms,graphAlpha=alpha(byid.get(9)),equationSlope=slope,equationEmphasis=False,demoKnobRatio=max(0,min(1,(knob+150)/200)),sliderCue=bool(alpha(byid.get(41))),drawCue=bool(alpha(byid.get(53))),drawVisible=True,nodes=nodes))
boxes=[]
for row in main['frames']:
 for p in row:
  if p['characterId']in shape_ids and p['characterId']in bounds:boxes.append(box(bounds[p['characterId']],p))
left=min([b[0]for b in boxes]+[l['x']for l in labels])-400;right=max([b[1]for b in boxes]+[l['x']for l in labels])+400;top=min([b[2]for b in boxes]+[l['y']for l in labels])-400;bottom=max([b[3]for b in boxes]+[l['y']for l in labels])+400
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];clocks.append(dict(spriteId=s['spriteId'],frameCount=s['frameCount'],decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
sa=next(d for d in decode['streams']if d['spriteId']=='SA')
native={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','quizFrame','postQuizFrame','forcedAnswerFrame','visibleAnswerFrame','feedbackSpriteId','feedbackFirstFrame','feedbackLastFrame','slider','behavior']};native.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,morphs=morphs,labels=labels,viewBox=[left,top,right-left,bottom-top]),clocks=clocks,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
assert states[156]['equationSlope']==''and states[158]['equationSlope']==''and states[159]['equationSlope']=='2';assert any(n['sourceShapeId']==77 and n['sourceCharacterId']==78 for n in states[-1]['nodes']);assert all(not any(n['sourceShapeId']in [79,80,81,82,83]for n in s['nodes'])for s in states[209:]);assert len(states[293]['annotations'])==2
p=M/'native-v1/visual-model-v1.json';out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=len(states),spans=len(native['visualStates']),shapes=len(shapes),morphs=len(morphs),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in [44,51]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},graphViewBox=native['graph']['viewBox'])))
