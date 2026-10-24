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
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in[52] for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
shape_ids=[24,48,49,61];shapes=[]
for id in shape_ids:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];assert paths
 assert all(not list(n)and not any('url('in v for v in n.attrib.values())for n in r.iter(ns+'path'))
 shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths))
def graphic(p,row):
 id=p['characterId'];matrix=p['matrix'];leaf=id
 if id==50:
  child=next(t for t in m['timelines']if t['timelineId']=='sprite-50')['frames'][0][0];assert child['characterId']==49;leaf=49;matrix=compose(matrix,child['matrix'])
 masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==57 for q in masks)
 return dict(sourceShapeId=leaf,sourceCharacterId=id,instanceId=p['instanceId'],matrix=matrix,alpha=alpha(p),clipBoxes=[box(bounds[q['characterId']],q)for q in masks])
# The demonstration keeps authored transforms and fields; user drag changes only thumb position before frame231.
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};bydepth={p['depth']:p for p in row};paragraphs=[prefix(row,id)for id in[54,88]];interactive=frame>=231
 terms=['Y-intercept']if 'y-intercept'in paragraphs[0]else[]
 nodes=[graphic(p,row)for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in shape_ids+[50]]
 values=[];ratios=[]
 for thumb,track,depth in[(14,4,34),(11,6,35)]:
  if interactive:values.append(None);ratios.append(None);continue
  p=byid[thumb];q=byid[track];ch=next(t for t in m['timelines']if t['timelineId']==f'sprite-{track}')['frames'][0][0];b=box(bounds[ch['characterId']],dict(matrix=compose(q['matrix'],ch['matrix'])))
  ratios.append((p['matrix'][4]-b[0])/(b[1]-b[0]));field=bydepth[depth];values.append(dict(text=texts[field['characterId']]['text'],sourceTextId=texts[field['characterId']]['sourceTextId']))
 marker=byid.get(51);cue=None if not marker else ('slope'if marker['matrix'][4]<0 else'intercept')
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid[24]),equation=not interactive,equationValues=values,demoKnobRatios=ratios,demoPlacementStamps=[max((e["frame"] for e in main["events"] if e["kind"]=="place" and e["depth"]==depth and e["frame"]<=frame),default=0)for depth in[24,20]],sliderCue=cue,nodes=nodes,interactive=interactive))
labels=[]
for p in sorted(main['frames'][-1],key=lambda p:p['depth']):
 if 39<=p['depth']<=81:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
assert len(labels)==43
bs=[box(bounds[id],next(p for p in main['frames'][-1]if p['characterId']==id))for id in[24,48]];left=min([b[0]for b in bs]+[l['x']for l in labels])-400;right=max([b[1]for b in bs]+[l['x']for l in labels])+400;top=min([b[2]for b in bs]+[l['y']for l in labels])-400;bottom=max([b[3]for b in bs]+[l['y']for l in labels])+400
streams=json.loads((B/'native-v1/streams-v1.json').read_text());decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate']
 clocks.append(dict(spriteId=s['spriteId'],frameCount=s['frameCount'],decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
sa=next(d for d in decode['streams']if d['spriteId']=='SA');anim=next(p for p in main['frames'][230]if p['characterId']==100);clip=next(p for p in main['frames'][230]if p['depth']==97)
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=101,mainFrameCount=232,interactiveFrame=231,terminalStopFrame=231,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,labels=labels,viewBox=[left,top,right-left,bottom-top],dynamic={**m['graph'],'matrix':anim['matrix'],'clipBox':box(bounds[57],clip),'unitsPerPixel':20},fixedOriginDot={'shape':61,'interactivePosition':[p['matrix']for p in main['frames'][230]if p['characterId']==61][0],'disposition':'Source dot61 stays fixed at origin when final sliders change; do not bind to c.'}),sliders=m['sliders'],behavior=m['behavior'],clocks=clocks,sa={k:sa[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},domains=[dict(id=t['timelineId'],frameCount=t['declaredFrameCount'])for t in m['timelines']],sourceTexts=[{k:t[k]for k in['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert states[29]['equationValues'][0]['text']=='0.4'and states[77]['equationValues'][1]['text']=='3.0'and states[112]['equationValues'][1]['text']=='-3.0'
assert not states[230]['equation']and states[230]['interactive']and not any(n['sourceShapeId']==49 for n in states[230]['nodes'])
assert all(p['matrix']==anim['matrix']for row in main['frames'][230:]for p in row if p['characterId']==100)
output=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if '--check'in sys.argv or p.exists():assert p.read_text()==output
else:p.open('x').write(output)
print(json.dumps(dict(status="pass",spans=len(native['visualStates']),shapes=len(shapes),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[54,88]},firstGlossary=next(i+1 for i,v in enumerate(states)if v['terms']),dynamic=native['graph']['dynamic'],viewBox=native['graph']['viewBox'])))
