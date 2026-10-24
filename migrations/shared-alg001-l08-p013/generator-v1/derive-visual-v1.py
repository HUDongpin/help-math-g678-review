from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re,base64
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p13a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};timelines={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,bb,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,bb*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in[47,77]for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
identity=[1,0,0,1,0,0];used=set();colors=[]
def color(p,parent=None):
 ct=p.get('colorTransform',{});mul=[n/256 for n in ct.get('multiply',[256]*4)[:3]];add=[n/255 for n in ct.get('add',[0]*4)[:3]]
 if parent:mul,add=([parent['multiply'][i]*mul[i]for i in range(3)],[parent['add'][i]+parent['multiply'][i]*add[i]for i in range(3)])
 return dict(multiply=mul,add=add)
def color_id(c):
 if c not in colors:colors.append(c)
 return colors.index(c)
def flatten(p,parent_frame,matrix=identity,opacity=1,rgb=None,path='',clips=()):
 id=p['characterId'];mat=compose(matrix,p['matrix']);a=opacity*alpha(p);rgb=color(p,rgb);inst=path+p['instanceId'];assert not p.get('clipDepth');result=[]
 if id in timelines:
  t=timelines[id];assert not any(e['kind']=='action-bytes'for e in t['events']);f=(parent_frame-p['placedFrame'])%t['declaredFrameCount']+1
  for q in t['frames'][f-1]:result+=flatten(q,f,mat,a,rgb,inst+'/',clips)
 else:
  assert id in bounds;used.add(id);result=[dict(sourceShapeId=id,sourceCharacterId=p['characterId'],instanceId=inst,matrix=mat,alpha=a,colorIndex=color_id(rgb),clips=list(clips))]
 return result
graph_ids={14,38,39,41,76};states=[];labels=[]
for p in main['frames'][-1]:
 if 15<=p['characterId']<=37:
  t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
assert len(labels)==43
visible_boxes=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in[49,79]];terms=[]
 for g in m['glossary']:
  word={'Slope':'slope','Y-intercept':'y-intercept','Line':'line'}[g['term']];paragraph=paragraphs[1 if g['term']=='Line'else 0]
  if g['characterId']in byid and re.search(r'\b'+word+r'\b',paragraph.lower()):terms.append(g['term'])
 nodes=[]
 for p in row:
  if p['characterId'] not in graph_ids and p['characterId']<83:continue
  masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==82 for q in masks)
  clips=[dict(sourceShapeId=q['characterId'],instanceId=q['instanceId'],matrix=q['matrix'])for q in masks]
  nodes+=flatten(p,frame,clips=clips)
 for n in nodes:
  if not n['alpha']:continue
  b=box(bounds[n['sourceShapeId']],n)
  for q in n['clips']:
   clip=box(bounds[q['sourceShapeId']],q);b=[max(b[0],clip[0]),min(b[1],clip[1]),max(b[2],clip[2]),min(b[3],clip[3])]
  if b[0]<b[1]and b[2]<b[3]:visible_boxes.append(b)
 labelStyles=[dict(alpha=alpha(next(p for p in row if p['instanceId']==l['instanceId'])),colorIndex=color_id(color(next(p for p in row if p['instanceId']==l['instanceId']))))for l in labels]
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid.get(14)),equationSlope='-1'if frame<90 else'',equationIntercept='0'if frame<90 or frame>=94 else'',slopeSliderPresent=6 in byid,interceptSliderPresent=7 in byid,sliderCue=54 in byid,drawCue=55 in byid,drawVisible=True,nodes=nodes,labelStyles=labelStyles))
# Only source-derived graph/actor leaves plus explicit child-domain graphic members.
used.update([1,3,5,40,75,82]);childs={}
for id in[2,4,6,7,41,76,103,124,139,191]:
 t=timelines[id];frames=[]
 for f,row in enumerate(t['frames'],1):
  nodes=[]
  for p in row:nodes+=flatten(p,f)
  frames.append(nodes)
 boxes=[box(bounds[n['sourceShapeId']],n)for row in frames for n in row];left=min(b[0]for b in boxes);right=max(b[1]for b in boxes);top=min(b[2]for b in boxes);bottom=max(b[3]for b in boxes)
 childs[str(id)]=dict(frameCount=t['declaredFrameCount'],frames=frames,viewBox=[left,top,max(1,right-left),max(1,bottom-top)])
bitmaps=[];bitmap_hash={}
for p in sorted((D/'ffdec/images').glob('*.png')):
 b=p.read_bytes();id=int(p.stem);h=sha(b);bitmap_hash[h]=id;bitmaps.append(dict(sourceBitmapId=id,bytes=len(b),sha256=h,dataUrl='data:image/png;base64,'+base64.b64encode(b).decode()))
allowed={'path','linearGradient','radialGradient','stop','pattern','image'}
def node(n):
 tag=n.tag.removeprefix(ns);assert tag in allowed,tag;attrs={k:v for k,v in n.attrib.items()if not k.startswith('{https://www.free-decompiler.com/flash}')};bitmap=None
 href=attrs.pop('{http://www.w3.org/1999/xlink}href',None)
 if href:
  assert tag=='image'and href.startswith('data:image/PNG;base64,');data=base64.b64decode(href.split(',')[1]);bitmap=bitmap_hash[sha(data)]
 assert not any(k.lower().startswith('on')or k in['href','src']for k in attrs);assert all('javascript:'not in v and 'http:'not in v and 'https:'not in v for v in attrs.values());assert not(n.text or'').strip()
 return dict(tag=tag,attributes=attrs,children=[node(c)for c in n],bitmapId=bitmap)
shapes=[]
for id in sorted(used):
 p=D/f'ffdec/shapes/{id}.svg';root=E.parse(p).getroot();groups=root.findall(ns+'g');assert len(groups)==1;group=groups[0];assert all(c.tag in[ns+'g',ns+'defs']for c in root);defs=[node(c)for d in root.findall(ns+'defs')for c in d];body=[node(c)for c in group]
 shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),normalizationTransform=group.get('transform'),nodes=body,defs=defs))
left=min([b[0]for b in visible_boxes]+[l['x']for l in labels])-400;right=max([b[1]for b in visible_boxes]+[l['x']for l in labels])+400;top=min([b[2]for b in visible_boxes]+[l['y']for l in labels])-400;bottom=max([b[3]for b in visible_boxes]+[l['y']for l in labels])+400
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];clocks.append(dict(spriteId=s['spriteId'],frameCount=s['frameCount'],decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
sa=next(d for d in decode['streams']if d['spriteId']=='SA');native={k:m[k]for k in['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','quizFrame','postQuizFrame','forcedAnswerFrame','visibleAnswerFrame','feedbackSpriteId','feedbackFirstFrame','feedbackLastFrame','slider','interceptSlider','behavior']};native.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,bitmaps=bitmaps,labels=labels,colors=colors,childDomains=childs,viewBox=[left,top,right-left,bottom-top]),clocks=clocks,sa={k:sa[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
assert states[89]['slopeSliderPresent']and not states[93]['slopeSliderPresent'];assert states[3]['slopeSliderPresent']and not states[4]['slopeSliderPresent'];assert len(bitmaps)==2;assert len(childs)==10;assert len(shapes)>140
p=M/'native-v1/visual-model-v1.json';out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=len(states),spans=len(native['visualStates']),shapes=len(shapes),bitmaps=len(bitmaps),labels=len(labels),colors=len(colors),bytes=len(out.encode()),graphViewBox=native['graph']['viewBox'],completeTextFrames={str(id):next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in[49,79]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']})))
