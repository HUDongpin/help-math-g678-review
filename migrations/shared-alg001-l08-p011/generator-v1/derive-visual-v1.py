from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p11a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,bb,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,bb*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in [30,58] for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
shape_ids=[3,28,29,38,40,42,44,46,47,48,49,51,53];morph_ids=[45,50,52];shapes=[];morphs=[]
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
def graphic(p):
 id=p['characterId'];assert id in shape_ids+morph_ids
 return dict(sourceShapeId=id,sourceCharacterId=id,instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),ratio=p.get('ratio',0)if id in morph_ids else None)
labels=[]
for p in main['frames'][-1]:
 if 5<=p['characterId']<=27:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
assert len(labels)==43
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in[32,55,59]];terms=[]
 for g in m['glossary']:
  if g['characterId']in byid and any(re.search(r'\b'+re.escape(g['term'].lower())+r'\b',p.lower())for p in paragraphs):terms.append(g['term'])
 callouts=[]
 for id in[39,41,43]:
  if id not in byid:continue
  t=texts[id];p=byid[id];b=box(t['boundsTwips'],p);callouts.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=id,text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p)))
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid.get(3)),callouts=callouts,nodes=[graphic(p)for p in row if p['characterId']in shape_ids+morph_ids]))
boxes=[box(bounds[p['characterId']],p)for row in main['frames']for p in row if p['characterId']in shape_ids]
left=min([b[0]for b in boxes]+[l['x']for l in labels])-400;right=max([b[1]for b in boxes]+[l['x']for l in labels])+400;top=min([b[2]for b in boxes]+[l['y']for l in labels])-400;bottom=max([b[3]for b in boxes]+[l['y']for l in labels])+400
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1
s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==60);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];sa=next(d for d in decode['streams']if d['spriteId']=='SA')
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-60',firstFrame=1,frameCount=288,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0])
assert [seg['firstFrame']for seg in clock['segments']]==[2,4,149]
native={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount']};native.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,morphs=morphs,labels=labels,viewBox=[left,top,right-left,bottom-top]),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
assert [c['text']for c in states[136]['callouts']]==['slope =  1','slope = 2','slope = 0.2 ']
assert states[122]['callouts'][0]['alpha']==0 and states[126]['callouts'][0]['alpha']==1 and not states[121]['callouts']
assert all(len(states[i-1]['callouts'])==3 for i in range(137,289))
for start,end,id in[(176,186,45),(188,198,50),(200,208,52)]:assert [i+1 for i,v in enumerate(states)if any(n['sourceShapeId']==id for n in v['nodes'])]==list(range(start,end+1))
p=M/'native-v1/visual-model-v1.json';out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=len(states),spans=len(native['visualStates']),shapes=len(shapes),morphs=len(morphs),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in [32,55,59]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},graphViewBox=native['graph']['viewBox'])))
