from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p14a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
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
# Source glyph-only highlight shapes are represented by native text highlights;
# graph lines, coordinate boxes and arrows retain original vector geometry.
shape_ids=[17,40,41,42,48,49,54,56,57,59,63,65];morph_ids=[47];shapes=[];morphs=[]
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
def native_text(p):
 t=texts[p['characterId']];b=box(t['boundsTwips'],p)
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p),runs=[dict(text=r['text'],colorRgba=r['colorRgba'])for r in t['runs']])
labels=[]
for p in main['frames'][5]:
 if 18<=p['characterId']<=39 or p['characterId']==43:labels.append(native_text(p))
assert len(labels)==43
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row}
 for p in row:
  c=p.get('colorTransform',{});assert c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3
  if p['characterId']==11:assert alpha(p)==0 # original slider is never visible and has no action
 paragraphs=[prefix(row,id)for id in[5,45]];terms=[]
 for g in m['glossary']:
  word='intersects'if g['term']=='Intersect'else g['term'].lower()
  if g['characterId']in byid and any(re.search(r'\b'+re.escape(word)+r'\b',p.lower())for p in paragraphs):terms.append(g['term'])
 callouts=[]
 for family in [[55,60,61],[58,62,64]]:
  placed=[p for p in row if p['characterId']in family]
  if placed:callouts.append(native_text(max(placed,key=lambda p:p['depth'])))
 origin=[p for p in row if p['characterId']in[43,52,53]];origin=native_text(max(origin,key=lambda p:p['depth']))if origin else None
 y=[p for p in row if p['characterId']in[39,50]];y=native_text(max(y,key=lambda p:p['depth']))
 states.append(dict(paragraphs=paragraphs,terms=terms,graphAlpha=alpha(byid.get(17)),callouts=callouts,nodes=[graphic(p)for p in row if p['characterId']in shape_ids+morph_ids],labelStyles=[dict(alpha=alpha(next((p for p in row if p['instanceId']==l['instanceId']),None)))for l in labels],origin=origin,yAxis=y,teachingHighlights=dict(yAxis=51 in byid and alpha(byid[51])>0,secondCoordinate=66 in byid and alpha(byid[66])>0,equationIntercept=67 in byid and alpha(byid[67])>0),equation=dict(prefix=texts[12]['text'].strip(),middle=texts[13]['text'].strip(),slope=texts[15]['text'],intercept=texts[16]['text'],alpha=alpha(byid.get(14)),sourceTextIds=[texts[id]['sourceTextId']for id in[12,13,15,16]+([68]if 68 in byid else[])])))
boxes=[box(bounds[p['characterId']],p)for row in main['frames']for p in row if p['characterId']in shape_ids]
left=min([b[0]for b in boxes]+[l['x']for l in labels])-500;right=max([b[1]for b in boxes]+[l['x']for l in labels])+500;top=min([b[2]for b in boxes]+[l['y']for l in labels])-500;bottom=max([b[3]for b in boxes]+[l['y']for l in labels])+500
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1
s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==69);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];sa=next(d for d in decode['streams']if d['spriteId']=='SA')
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-69',firstFrame=1,frameCount=334,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]);assert [seg['firstFrame']for seg in clock['segments']]==[2,4]
native={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount']};native.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],graph=dict(shapes=shapes,morphs=morphs,labels=labels,baseLabelsFrame=6,foregroundDuplicatePolicy='Base43 coordinate roles; native yAxis and origin use the highest-depth current source text among retained foreground duplicates and colored overlays.',viewBox=[left,top,right-left,bottom-top]),sourceGlyphReplacements=[dict(sourceShapeId=id,svgSha256=sha((D/f'ffdec/shapes/{id}.svg').read_bytes()),meaning=meaning)for id,meaning in[(51,'yellow y-axis character'),(66,'yellow second coordinate zero at origin'),(67,'yellow zero in equation intercept')]],clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
assert [i+1 for i,v in enumerate(states)if any(n['sourceShapeId']==47 for n in v['nodes'])]==list(range(106,119))
assert [c['text']for c in states[206]['callouts']]==['x - coordinate','second coordinate'];assert [c['text']for c in states[243]['callouts']]==['x - coordinate','y - coordinate']
assert states[149]['origin']['runs'][0]['colorRgba']==[255,0,255,255];assert states[157]['origin']['runs'][-1]['colorRgba']==[255,0,255,255]
assert [i+1 for i,v in enumerate(states)if v['teachingHighlights']['secondCoordinate']]==list(range(283,335));assert [i+1 for i,v in enumerate(states)if v['teachingHighlights']['equationIntercept']]==list(range(325,335))
p=M/'native-v1/visual-model-v1.json';out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=len(states),spans=len(native['visualStates']),shapes=len(shapes),morphs=len(morphs),labels=len(labels),completeTextFrames={str(id):next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in [5,45]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},graphViewBox=native['graph']['viewBox'])))
