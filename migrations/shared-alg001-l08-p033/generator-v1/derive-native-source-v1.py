from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,copy
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p033';O=R/'output/g678-alg-l08-p033-integration-20261007-v1';A=R/'output/g678-alg-l08-p033-source-20261007-v1';F=A/'source';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text());ns='{http://www.w3.org/2000/svg}'
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if '--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
pre=read(O/'selection-and-source-pins-v1.json');c=read(F/'text-catalog.json');audit=read(A/'source-behavior-audit-v1.json');st=read(A/'source-states-v1.json')['timelines'];main=st['sprite-248'];coach=st['sprite-49'];texts={t['characterId']:t for t in c['textDefinitions']};xml=E.parse(F/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')}
for p in pre['sources']:
 for name in ['source','workingCopy']:
  q=p[name];assert Path(q['path']).stat().st_size==q['bytes'] and sha(Path(q['path']).read_bytes())==q['sha256']
assert len(main)==273 and audit['main']['quizHoldFrame']==106 and audit['quiz']['correctAnswer']==2
branches=[dict(spriteId=116,kind='right',index=4,terminal=25),dict(spriteId=204,kind='wrong',index=4,terminal=31,hold=22,closeFirst=16,closeFirstVisible=17,closeJump=23)]
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
 path=F/f'ffdec/shapes/{cid}.svg';r=E.parse(path).getroot();paths=[n.attrib for n in r.iter(ns+'path')];shapes.append(dict(sourceShapeId=cid,svgSha256=sha(path.read_bytes()),paths=paths,gradients=[dict(kind=g.tag[len(ns):],attributes=g.attrib,stops=[s.attrib for s in g])for g in r.iter()if g.tag in[ns+'linearGradient',ns+'radialGradient']],smallStrokeMetadata=[dict(pathIndex=i,sourcePixelWidth=p['{https://www.free-decompiler.com/flash}original-stroke-width'],displayPixelWidth=p['stroke-width'])for i,p in enumerate(paths)if'{https://www.free-decompiler.com/flash}original-stroke-width'in p]))
def visual(row,terms):
 ps=row['placements'];return dict(terms=terms,texts=[native(p)for p in ps if p['characterId']in texts],vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in ps if p['characterId']in shapeIds])
states=[visual(row,['Linear equation']if row['frame']>=2 else[])for row in main];coachVisual=visual(coach[0],[t['keyAttribute']for t in audit['coach']['terms']])
for b in branches:
 tl=st[f"sprite-{b['spriteId']}"];ids={p['characterId']for f in tl for p in f['placements']};titles=[t for t in c['textDefinitions']if t['characterId']in ids and t.get('runs')];title=''.join(r['text']for r in titles[0]['runs']);assert all(''.join(r['text']for r in t['runs'])==title for t in titles);b.update(title=title,titleIds=[t['characterId']for t in titles],titleAlpha=spans([max([alpha(p,False)for p in f['placements']if p['characterId']in[t['characterId']for t in titles]]or[0])for f in tl]))
for b in branches:
 b['popupAlpha']=[]
 if b['kind']=='wrong':b['popupAlpha']=spans([max([alpha(p,False)for p in f['placements']if p['characterId']==200]or[0])for f in st['sprite-204']])
audio=read(A/'audio-audit-v1.json');structure=read(A/'structural-audit-v1.json');decodeFile=M/'native-v1/decode-native-v1.json';nativeDecode=read(decodeFile)if decodeFile.exists()else None
if nativeDecode:assert nativeDecode['pass']and len(nativeDecode['streams'])==10 and all(d['contextClosed']for d in nativeDecode['streams'])
def decoder(s):
 d=dict(sourceBytes=s['sourcePayload']['bytes'],sourceSha256=s['sourcePayload']['sha256'],sampleRate=s['localPcm']['sampleRate'],channels=s['channels'],decodedSamples=s['localPcm']['frames'],pcmSha256=s['localPcm']['sha256'])
 if nativeDecode:
  n=next(n for n in nativeDecode['streams']if n['spriteId']==s['spriteId'])
  assert all(n[k]==d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples'])
  d['pcmSha256']=n['pcmSha256']
 return d
clocks=[]
for sid in [248,116,204]:
 s=next(s for s in audio['streams']if s['spriteId']==sid);r=next(r for r in structure['audioRuns']if r['spriteId']==sid);d=decoder(s);assert s['fullEofDecodeExit']==0 and d['decodedSamples']==s['positiveSamplesTotal']
 segments=[{k:p[k]for k in ['firstFrame','firstDecodedSample','endDecodedSample']}for p in r['segments']]
 clocks.append(dict(spriteId=sid,decoder=d,segments=segments,sourceDeclaredSegments=copy.deepcopy(segments),sourceDeclaredSampleTotal=s['positiveSamplesTotal'],decodedSampleShortfall=0,emptyNegativeBlocks=r['emptyBlocks']+r['negativeSeekBlocks'],nativeBrowserDecoded=bool(nativeDecode),decoderEvidence='Chromium decode-native-v1.json'if nativeDecode else'Frozen source FFmpeg decode; native-browser PCM pending. Runtime binding intentionally fails closed if native PCM differs.'))
saSource=audio['spanishAudioCandidate'];sa=dict(sourceBytes=saSource['source']['bytes'],sourceSha256=saSource['source']['sha256'],sampleRate=48000,channels=1,decodedSamples=saSource['pcm']['frames'],pcmSha256=saSource['pcm']['sha256'])
if nativeDecode:
 n=next(n for n in nativeDecode['streams']if n['spriteId']=='SA');assert all(n[k]==sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples']);sa['pcmSha256']=n['pcmSha256']
model=dict(animationId=M.name,sourceSha256=c['sourceSha256'],fps=12,rootFrameCount=10,rootBeginFrame=6,mainSpriteId=248,mainFrameCount=273,quizFrame=106,correctAnswer=2,title='Question 4',branches=branches,retainedUnselectedBranches=audit['quiz']['retainedUnselectedSprites'],behavior=dict(wrongFirst=audit['quiz']['wrongFirst'],wrongLater=audit['quiz']['wrongLater'],end='source terminal stop273',feedbackSelection='fixed direct source calls right116/wrong204',lessonCompleted=False),clocks=clocks,sa=sa,nativeBrowserDecoded=bool(nativeDecode),terms=read(A/'glossary-source-v1.json')['entries'],coachTerms=[t['keyAttribute']for t in audit['coach']['terms']],coachVisual=coachVisual,visualStates=spans(states),diagram=dict(viewBox=[-8248,-5000,16000,10500],coachViewBox=[-14400,2500,14300,6600],shapes=shapes,glyphs=list(glyphs.values()),geometry='Exact source main and coach shape paths, embedded glyph outlines, advances, baseline offsets, placements and alpha. Source fraction bars are separate shapes. Root title uses catalog Question4. SVG export viewport translation excluded.'),answers=[dict(answer=a['answerNumber'],letter=a['visualLetter'],equation=a['semanticFraction'],buttonId=a['buttonId'])for a in audit['quiz']['answers']],sourceAnomalies=audit['sourceAnomalies'],sourceOnlyDecorations='Source feedback mascot/morph/bitmap timelines retained; native feedback source title/timing/Close/text only; visual parity pending.')
put(M/'native-v1/product-model-v1.json',model);put(M/'native-v1/source-model-v1.json',dict(animationId=M.name,sourcePins=pre['authoritativeSourcePins'],placement=pre['placement'],behaviorAudit=audit,timelines=c['timelines'],fonts=c['fonts'],sourceGlyphPolicy='Exact source font edge reconstruction; original Flash rasterization unverified',sourceModified=False));put(M/'native-v1/glossary-model-v1.json',read(A/'glossary-source-v1.json'))
print(json.dumps(dict(pass_=True,frames=273,shapes=len(shapes),glyphs=len(glyphs),visualSpans=len(model['visualStates']),resources=4,nativeBrowserDecoded=bool(nativeDecode),sourceSampleShortfall=0)))
