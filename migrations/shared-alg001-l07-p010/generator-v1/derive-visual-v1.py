from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=m['timelines'][1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns={'s':'http://www.w3.org/2000/svg'}
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==2 for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
states=[]
for row in main['frames']:
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in [5,12,16]]
 terms=[g['term']for g in m['glossary']if g['characterId']in byid and re.search(r'\b'+g['term'].lower()+r'\b',(' '.join(paragraphs[:1]if g['characterId']<=10 else paragraphs[1:2]if g['characterId']<=14 else paragraphs[2:])).lower())]
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid.get(22)),lineRatio=byid[45].get('ratio',0)/65535 if 45 in byid else 1 if 46 in byid else None,lineShapeId=45 if 45 in byid else 46 if 46 in byid else None))
last=main['frames'][-1];vectors=[]
for id in [22,26]:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();pose=next(p for p in last if p['characterId']==id);paths=[n.attrib for n in r.iter('{'+ns['s']+'}path')];assert paths
 assert all(not list(n)for n in r.iter('{'+ns['s']+'}path'))
 vectors.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),matrix=pose['matrix'],paths=paths))
labels=[]
for p in last:
 if p['characterId']in texts and p['characterId']not in [5,12,16]:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
# Keep all source coordinate labels, including x-axis suffix-minus values and unsigned lower y-axis values.
assert len(labels)==43 and len([l for l in labels if l['text'].endswith('-')])==10
morph=E.parse(B/'source-v1/ffdec/morphshapes/45.svg').getroot();anim=next(n for n in morph.iter('{'+ns['s']+'}animate')if n.get('attributeName')=='d');paths=anim.get('values').split(';');points=[[float(x)for x in re.findall(r'-?\d+(?:\.\d+)?',p)]for p in paths];assert len(points)==2 and all(len(p)==4 for p in points)
lineMatrix=next(p['matrix']for p in last if p['characterId']==46)
# Source graph and all labels have separate HTML text over exact source SVG geometry.
graphBounds=[]
for id in [22,26]:graphBounds.append(box(bounds[id],next(p for p in last if p['characterId']==id)))
left=min([b[0]for b in graphBounds]+[l['x']for l in labels])-500;right=max([b[1]for b in graphBounds]+[l['x']for l in labels])+500;top=min([b[2]for b in graphBounds]+[l['y']for l in labels])-500;bottom=max([b[3]for b in graphBounds]+[l['y']for l in labels])+500
stream=json.loads((B/'native-v1/streams-v1.json').read_text())[0];decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());d=next(d for d in decode['streams']if d['spriteId']==47);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==stream['sourceSha256']and d['decodedSamples']==stream['decodedSamplesCandidate']and all(d['contextClosed']for d in decode['streams'])
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-47',firstFrame=1,frameCount=263,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=stream['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in stream['blocks']if b['samples']==0 and b['seek']<0])
assert all(b['seek']<0 and b['mp3Bytes']==0 for b in clock['emptyNegativeBlocks'])
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=47,mainFrameCount=263,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(vectors=vectors,labels=labels,viewBox=[left,top,right-left,bottom-top],lineStart=points[0],lineEnd=points[1],lineMatrix=lineMatrix),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},emptyNeutralBlocks=[b for b in stream['blocks']if b['samples']==0 and b['seek']==0],sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if '--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(status="pass",spans=len(native['visualStates']),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in [5,12,16]},lineFrames=[(x['first'],x['last'],x['value']['lineRatio'])for x in native['visualStates']if x['value']['lineRatio']is not None],graphViewBox=native['graph']['viewBox'])))
