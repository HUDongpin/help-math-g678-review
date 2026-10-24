from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p15a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,bb,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,bb*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in [2] for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
# Retain graph/morph/mask geometry; source slider/arrow positions feed a native control track.
shape_ids=[20,44,45,46,47,51,52,55,56,57,59,64];morph_ids=[54];shapes=[];morphs=[]
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
def compose(a,b):return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
def graphic(p,row):
 id=p['characterId'];leaf=id;matrix=p['matrix']
 if id==65:
  child=next(t for t in m['timelines']if t['timelineId']=='sprite-65')['frames'][0][0];assert child['characterId']==64;leaf=64;matrix=compose(matrix,child['matrix'])
 assert leaf in shape_ids+morph_ids
 masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==46 for q in masks);assert len(masks)<=1
 mask=None if not masks else dict(sourceShapeId=46,instanceId=masks[0]['instanceId'],matrix=masks[0]['matrix'])
 return dict(sourceShapeId=leaf,sourceCharacterId=id,instanceId=p['instanceId'],matrix=matrix,alpha=alpha(p),ratio=p.get('ratio',0)if id in morph_ids else None,mask=mask)
def native_text(p):
 t=texts[p['characterId']];b=box(t['boundsTwips'],p)
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p),runs=[dict(text=r['text'],colorRgba=r['colorRgba'])for r in t['runs']])
labels=[native_text(p)for p in main['frames'][5]if 21<=p['characterId']<=43];assert len(labels)==43
states=[];graph_ids=[20,44,47,51,52,55,56,57,59,65,54]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row}
 for p in row:
  c=p.get('colorTransform',{});assert c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3
 paragraphs=[prefix(row,id)for id in[5,12]];terms=[]
 for g in m['glossary']:
  word='intersects'if g['term']=='Intersect'else g['term'].lower()
  if g['characterId']in byid and any(re.search(r'\b'+re.escape(word)+r'\b',p.lower())for p in paragraphs):terms.append(g['term'])
 marker=byid.get(62)or byid.get(50)or byid.get(49)or byid.get(14);assert marker
 knob=marker['matrix'][4]/20
 if marker['characterId']==49:knob+=(bounds[49]['left']+bounds[49]['right'])/40
 pointer=byid.get(45);pointer=None if not pointer or not alpha(pointer) else dict(sourceShapeId=45,instanceId=pointer['instanceId'],x=pointer['matrix'][4]/20,y=pointer['matrix'][5]/20,alpha=alpha(pointer))
 callout=native_text(byid[58])if 58 in byid else None
 flashes=[dict(sourceTextId=f'character-{id}',instanceId=byid[id]['instanceId'],characterIndex=1 if id==60 else 3,colorRgba=texts[id]['runs'][0]['colorRgba'])for id in[60,61]if id in byid]
 intercept=next(texts[id]['text']for id in[19,53,63]if id in byid)
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid.get(20)),nodes=[graphic(p,row)for p in row if p['characterId']in graph_ids],labelStyles=[dict(alpha=alpha(next((p for p in row if p['instanceId']==l['instanceId']),None)))for l in labels],callout=callout,coordinateFlashes=flashes,equation=dict(prefix=texts[15]['text'].strip(),slope=texts[18]['text'],middle=texts[16]['text'].strip(),intercept=intercept,alpha=alpha(byid.get(17)),interceptSourceTextId=f"character-{63 if 63 in byid else 53 if 53 in byid else 19}"),slider=dict(sourceCharacterId=marker['characterId'],instanceId=marker['instanceId'],x=knob,y=178.45,alpha=alpha(marker),interactive=62 in byid,pointer=pointer)))
boxes=[]
for row in main['frames']:
 for p in row:
  if p['characterId']in graph_ids and p['characterId']!=54:
   n=graphic(p,row);b=box(bounds[n['sourceShapeId']],n)
   if n['mask']:
    clip=box(bounds[46],n['mask']);b=[max(b[0],clip[0]),min(b[1],clip[1]),max(b[2],clip[2]),min(b[3],clip[3])]
   boxes.append(b)
left=min([b[0]for b in boxes]+[l['x']for l in labels])-400;right=max([b[1]for b in boxes]+[l['x']for l in labels])+400;top=min([b[2]for b in boxes]+[l['y']for l in labels])-400;bottom=max([b[3]for b in boxes]+[l['y']for l in labels])+400
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1
s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==66);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];sa=next(d for d in decode['streams']if d['spriteId']=='SA')
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-66',firstFrame=1,lastFrame=500,fps=12,alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0 and b['frame']<=500]);assert [seg['firstFrame']for seg in clock['segments']]==[3,5]
native={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','behavior']};native.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,morphs=morphs,labels=labels,baseLabelsFrame=6,viewBox=[left,top,right-left,bottom-top]),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
assert [i+1 for i,v in enumerate(states)if any(n['sourceShapeId']==54 for n in v['nodes'])]==list(range(98,112))
assert [i+1 for i,v in enumerate(states)if v['coordinateFlashes']]==[290,292,294,296,298,300]
assert states[37]['equation']['intercept']=='0'and states[38]['equation']['intercept']=='5'and states[424]['equation']['intercept']=='0'
assert [i+1 for i,v in enumerate(states)if v['slider']['interactive']]==[500,501,502,503]
assert all(n['mask']for n in states[499]['nodes']if n['sourceCharacterId']==65)
p=M/'native-v1/visual-model-v1.json';out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=len(states),spans=len(native['visualStates']),shapes=len(shapes),morphs=len(morphs),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in [5,12]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},graphViewBox=native['graph']['viewBox'])))
