from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,copy
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p030';O=R/'output/g678-alg-l08-p030-integration-20261007-v1';A=Path('/Volumes/American Dream/.g6l8p30audit1');D=Path('/Volumes/American Dream/.g6l8p30a1');Q=R/'output/g678-alg-l08-p030-source-audit-20261007-v1';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text());ns='{http://www.w3.org/2000/svg}'
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.open('xb').write(b)
pre=read(O/'source-entry-preflight-v1.json');c=read(A/'text-catalog.json');audit=read(Q/'source-behavior-audit-v1.json');st=read(A/'source-states-v1.json')['timelines'];main=st['sprite-368'];texts={t['characterId']:t for t in c['textDefinitions']};xml=E.parse(A/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')};scripts={str(p.relative_to(A/'ffdec/scripts')):p.read_text()for p in(A/'ffdec/scripts').rglob('*.as')}
for p in pre['sources']:assert sha(Path(p['source']).read_bytes())==sha((R/p['copy']).read_bytes())==p['sha256']
assert len(main)==132 and scripts['DefineSprite_368/frame_132/DoAction.as'].strip()=='stop();';assert len(scripts)==67
branches=[dict(spriteId=235,kind='right',index=4,terminal=31),dict(spriteId=362,kind='wrong',index=4,terminal=29,hold=20,close=343,closeJump=21,closeFirst=13,closeChild=361)]
def alpha(p,strict=True):
 t=p.get('colorTransform',{});assert not strict or(t.get('multiply',[256]*4)[:3]==[256]*3 and t.get('add',[0]*4)[:3]==[0]*3)
 return max(0,min(1,t.get('multiply',[256]*4)[3]/256+t.get('add',[0]*4)[3]/255))
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
glyphs={}
def glyph(fid,i):
 key=f'{fid}-{i}'
 if key in glyphs:return key
 font=xml.find(f'Header/tags/DefineFont2[@objectID="{fid}"]');assert font is not None;g=list(font.find('glyphs'))[i];x=y=0;parts=[]
 for e in g.find('GlyphShape/edges'):
  if e.tag=='ShapeSetup':
   if'x'in e.attrib:x=int(e.get('x'));y=int(e.get('y'));parts.append(f'M{x} {y}')
  elif e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'));parts.append(f'L{x} {y}')
  elif e.tag=='CurveTo':
   cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));x=cx+int(e.get('x2'));y=cy+int(e.get('y2'));parts.append(f'Q{cx} {cy} {x} {y}')
  else:raise AssertionError(e.tag)
 glyphs[key]=dict(id=key,fontId=fid,glyphIndex=i,d=' '.join(parts));return key
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  x=r['xOffsetTwips']if r['changed']['xOffset']else x;y=r['yOffsetTwips']if r['changed']['yOffset']else y;gs=[]
  for g in r['glyphs']:
   assert g['unicode']is not None;gs.append(dict(text=g['unicode'],glyphId=glyph(r['fontId'],g['index']),x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],y=y,glyphs=gs))
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],textMatrix=t['matrix'],text=''.join(r['text']for r in t['runs']),alpha=alpha(p),runs=runs)
shapeIds=sorted({p['characterId']for f in main for p in f['placements']if tags[p['characterId']].tag.startswith('DefineShape')});shapes=[]
for cid in shapeIds:
 path=A/f'ffdec/shapes/{cid}.svg';r=E.parse(path).getroot();paths=[n.attrib for n in r.iter(ns+'path')];shapes.append(dict(sourceShapeId=cid,svgSha256=sha(path.read_bytes()),paths=paths,gradients=[dict(kind=g.tag[len(ns):],attributes=g.attrib,stops=[s.attrib for s in g])for g in r.iter()if g.tag in[ns+'linearGradient',ns+'radialGradient']],smallStrokeMetadata=[dict(pathIndex=i,sourcePixelWidth=p['{https://www.free-decompiler.com/flash}original-stroke-width'],displayPixelWidth=p['stroke-width'])for i,p in enumerate(paths)if'{https://www.free-decompiler.com/flash}original-stroke-width'in p]))
textIds=sorted({p['characterId']for f in main for p in f['placements']if p['characterId']in texts});states=[]
for frame,row in enumerate(main,1):
 ps=row['placements'];terms=['Equation','Linear equation']if frame>=3 else[]
 states.append(dict(terms=terms,texts=[native(p)for p in ps if p['characterId']in textIds],vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in ps if p['characterId']in shapeIds]))
for b in branches:
 tl=st[f"sprite-{b['spriteId']}"];ids={p['characterId']for f in tl for p in f['placements']};titles=[t for t in c['textDefinitions']if t['characterId']in ids and t.get('runs')];title=''.join(r['text']for r in titles[0]['runs']);assert all(''.join(r['text']for r in t['runs'])==title for t in titles);b.update(title=title,titleIds=[t['characterId']for t in titles],titleAlpha=spans([max([alpha(p,False)for p in f['placements']if p['characterId']in[t['characterId']for t in titles]]or[0])for f in tl]))
decode=read(M/'native-v1/decode-native-v1.json');assert decode['pass']and len(decode['streams'])==10 and all(d['contextClosed']for d in decode['streams']);decoder=lambda d:{k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};clocks=[]
for s in read(M/'native-v1/streams-v1.json'):
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate']
 if s['spriteId']in[368,235,362]:clocks.append(dict(spriteId=s['spriteId'],decoder=decoder(d),segments=s['segments'],emptyNegativeBlocks=s['emptyNegativeBlocks'],sourceTrailingAfterEnd=s['sourceTrailingAfterEnd']))
model=dict(animationId=M.name,sourceSha256=c['sourceSha256'],fps=12,rootFrameCount=10,rootBeginFrame=6,mainSpriteId=368,mainFrameCount=132,quizFrame=50,correctAnswer=2,title='Graphing Linear Equations: Try It!',branches=branches,retainedUnselectedBranches=[b for b in audit['quiz']['correctDefinitions']+audit['quiz']['wrongDefinitions']if not b['directlySelected']],behavior=dict(wrongFirst=audit['quiz']['wrongTextFirst'],wrongLater=audit['quiz']['wrongTextSecond'],end='source terminal stop132',feedbackSelection='fixed direct source calls:235/362',lessonCompleted=False),clocks=clocks,sa=decoder(next(d for d in decode['streams']if d['spriteId']=='SA')),terms=read(Q/'glossary-source-v1.json')['entries'],coachTerms=['Graph','Linear equation','Line','Equation','Bend'],visualStates=spans(states),diagram=dict(viewBox=[-7900,-4400,14600,9200],shapes=shapes,glyphs=list(glyphs.values()),geometry='Exact source main shape paths, embedded font glyph outlines, advances, baseline offsets, placement and alpha; root title uses readable HTML. Source export SVG translation is only the export viewport origin.'),answers=[dict(answer=1,letter='A',equation='y = 1 − x²'),dict(answer=4,letter='B',equation='y = x(x − 3)'),dict(answer=3,letter='C',equation='y = 2x² − 5'),dict(answer=2,letter='D',equation='y = 3 − x')],sourceAnomalies=audit['sourceAnomalies'],sourceAuditManifest=pre['sourceAuditManifest'],sourceOnlyDecorations='Full source feedback mascot/morph/bitmap timelines retained but native feedback uses source title/timing/Close/text; visual parity pending.')
put(M/'native-v1/product-model-v1.json',model);put(M/'native-v1/source-model-v1.json',dict(animationId=M.name,sourcePins=pre['sources'],placement=pre['placement'],behaviorAudit=audit,timelines=c['timelines'],fonts=c['fonts'],sourceGlyphPolicy='native outline reconstruction from exact source font edges; original Flash rasterization unverified',sourceModified=False));put(M/'native-v1/glossary-model-v1.json',read(Q/'glossary-source-v1.json'))
print(json.dumps(dict(pass_=True,main=368,frames=132,terminal=True,branches=2,retainedOtherBranches=6,nativeTexts=len(textIds),sourceShapes=len(shapes),sourceGlyphs=len(glyphs),resources=4,allNativeDecoded=10)))
