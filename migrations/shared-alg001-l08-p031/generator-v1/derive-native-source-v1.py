from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,copy
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p031';O=R/'output/g678-alg-l08-p031-integration-20261007-v1';A=M/'audit-v1';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text());ns='{http://www.w3.org/2000/svg}'
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.open('xb').write(b)
pre=read(O/'selection-and-source-pins-v1.json');c=read(A/'text-catalog.json');audit=read(O/'source-behavior-audit-v1.json');st=read(A/'source-states-v1.json')['timelines'];main=st['sprite-362'];coach=st['sprite-158'];texts={t['characterId']:t for t in c['textDefinitions']};xml=E.parse(A/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')}
for p in pre['sourcePins']:assert sha(Path(p['path']).read_bytes())==sha((M/'source-v1'/Path(p['path']).name).read_bytes())==p['sha256']
assert len(main)==278 and audit['quizFrame']==51 and audit['correctAnswer']==3
branches=copy.deepcopy(audit['branches'])
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
shapeIds=sorted({p['characterId']for frames in[main,coach]for f in frames for p in f['placements']if tags[p['characterId']].tag.startswith('DefineShape')});shapes=[]
for cid in shapeIds:
 path=A/f'ffdec/shapes/{cid}.svg';r=E.parse(path).getroot();paths=[n.attrib for n in r.iter(ns+'path')];shapes.append(dict(sourceShapeId=cid,svgSha256=sha(path.read_bytes()),paths=paths,gradients=[dict(kind=g.tag[len(ns):],attributes=g.attrib,stops=[s.attrib for s in g])for g in r.iter()if g.tag in[ns+'linearGradient',ns+'radialGradient']],smallStrokeMetadata=[dict(pathIndex=i,sourcePixelWidth=p['{https://www.free-decompiler.com/flash}original-stroke-width'],displayPixelWidth=p['stroke-width'])for i,p in enumerate(paths)if'{https://www.free-decompiler.com/flash}original-stroke-width'in p]))
def visual(row,terms):
 ps=row['placements'];return dict(terms=terms,texts=[native(p)for p in ps if p['characterId']in texts],vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in ps if p['characterId']in shapeIds])
states=[visual(row,['Equation','Linear equation']if row['frame']>=2 else[])for row in main];coachVisual=visual(coach[0],[t['key']for t in audit['coach']['terms']])
for b in branches:
 tl=st[f"sprite-{b['spriteId']}"];ids={p['characterId']for f in tl for p in f['placements']};titles=[t for t in c['textDefinitions']if t['characterId']in ids and t.get('runs')];title=''.join(r['text']for r in titles[0]['runs']);assert all(''.join(r['text']for r in t['runs'])==title for t in titles);b.update(title=title,titleIds=[t['characterId']for t in titles],titleAlpha=spans([max([alpha(p,False)for p in f['placements']if p['characterId']in[t['characterId']for t in titles]]or[0])for f in tl]))
decode=read(M/'native-v1/decode-native-v2.json');assert decode['pass']and len(decode['streams'])==10 and all(d['contextClosed']for d in decode['streams']);decoder=lambda d:{k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};clocks=[]
for s in read(M/'native-v1/streams-v1.json'):
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256'];assert d['decodedSamples']==s['decodedSamplesCandidate']or(s['spriteId']==362 and s['decodedSamplesCandidate']==488448 and d['decodedSamples']==487872)
 if s['spriteId']in[362,263,322]:
  original=copy.deepcopy(s['segments']);segments=copy.deepcopy(original)
  for segment in segments:segment['endDecodedSample']=min(segment['endDecodedSample'],d['decodedSamples'])
  clocks.append(dict(spriteId=s['spriteId'],decoder=decoder(d),segments=segments,sourceDeclaredSegments=original,sourceDeclaredSampleTotal=s['decodedSamplesCandidate'],decodedSampleShortfall=s['decodedSamplesCandidate']-d['decodedSamples'],endBoundDisposition='Source bytes unchanged. Final source scheduling end is limited to actual native decoded buffer; no synthetic padding or source modification. FFmpeg independently gives same487872. Alignment/listening unaccepted.'if s['spriteId']==362 else'No source/native sample-count difference.',emptyNegativeBlocks=s['emptyNegativeBlocks'],sourceTrailingAfterEnd=s['sourceTrailingAfterEnd']))
model=dict(animationId=M.name,sourceSha256=c['sourceSha256'],fps=12,rootFrameCount=10,rootBeginFrame=6,mainSpriteId=362,mainFrameCount=278,quizFrame=51,correctAnswer=3,title='Question 2',branches=branches,retainedUnselectedBranches=audit['retainedUnselectedBranches'],behavior=dict(wrongFirst=audit['wrongFirst'],wrongLater=audit['wrongLater'],end='source terminal stop278',feedbackSelection='fixed direct source calls right263/wrong322',lessonCompleted=False),clocks=clocks,sa=decoder(next(d for d in decode['streams']if d['spriteId']=='SA')),terms=read(O/'glossary-source-v1.json')['entries'],coachTerms=[t['key']for t in audit['coach']['terms']],coachVisual=coachVisual,visualStates=spans(states),diagram=dict(viewBox=[-8248,-5000,16000,10500],coachViewBox=[-14400,2500,14300,7600],shapes=shapes,glyphs=list(glyphs.values()),geometry='Exact source main and coach shape paths, embedded font glyph outlines, advances, baseline offsets, placement and alpha; root title rendered as catalog Question2. SVG export viewport translation is excluded.'),answers=audit['answers'],sourceAnomalies=audit['sourceAnomalies']+['Source main declares488448 samples but exact stream decodes487872 in FFmpeg and Chromium; bounded playback with no audio alignment acceptance.'],sourceOnlyDecorations='Full source feedback mascot/morph/bitmap timelines retained; native feedback source title/timing/Close/text only; visual parity pending.')
put(M/'native-v1/product-model-v1.json',model);put(M/'native-v1/source-model-v1.json',dict(animationId=M.name,sourcePins=pre['sourcePins'],placement=pre['placement'],behaviorAudit=audit,timelines=c['timelines'],fonts=c['fonts'],sourceGlyphPolicy='Exact source font edge reconstruction; original Flash rasterization unverified',sourceModified=False));put(M/'native-v1/glossary-model-v1.json',read(O/'glossary-source-v1.json'))
print(json.dumps(dict(pass_=True,frames=278,shapes=len(shapes),glyphs=len(glyphs),resources=4,decoded=10,shortfall=576)))
