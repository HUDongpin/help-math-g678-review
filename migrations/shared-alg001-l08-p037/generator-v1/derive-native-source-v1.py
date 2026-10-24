"""P037 source-locked native model; raw source freeze stays immutable.
The maintained P033 glyph method and P032 SVG morph arithmetic are adapted to
P037's own timelines. No decoder values are fabricated before native evidence.
"""
from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,re,copy,sys,math
R=Path(__file__).resolve().parents[3];M=R/'migrations/shared-alg001-l08-p037';O=R/'output/g678-alg-l08-p037-integration-20261007-v1';A=R/'output/g678-alg-l08-p037-source-20261007-v1';F=A/'source';NS='{http://www.w3.org/2000/svg}';XL='{http://www.w3.org/1999/xlink}';read=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if '--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
manifest=read(A/'source-evidence-manifest-v1.json');assert len(manifest['files'])==412
for p in manifest['files']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes'] and sha(b)==p['sha256'],p['path']
pre=read(O/'selection-and-source-pins-v1.json');assert pin(Path(pre['rootSourceReview']['path']))==pre['rootSourceReview'];assert pin(Path(pre['independentSourceReview']['path']))==pre['independentSourceReview'];c=read(F/'text-catalog.json');audit=read(A/'behavior-audit-v1.json');st=read(A/'source-states-v1.json')['timelines'];texts={t['characterId']:t for t in c['textDefinitions']};xml=E.parse(F/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')}
assert c['sourceSha256']=='9cdfe7c5e9a67d1c06a2b77d91f82474686751598ba466a9f5aed27acf49c8ee'
assert len(st['sprite-277'])==516 and audit['main']['quizStopFrame']==105 and audit['main']['postQuizFrame']==106
for pair in pre['sources']:
 for p in pair.values():assert pin(Path(p['path']))==p

def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out

def color_transform(p):
 t=p.get('colorTransform',{});mult=t.get('multiply',[256]*4);add=t.get('add',[0]*4);assert add[3]==0
 return dict(multiply=mult,add=add,divisor=256)

def alpha(p):return max(0,min(1,color_transform(p)['multiply'][3]/256))

glyphs={};textModels={}
def glyph(fid,i):
 key=f'{fid}-{i}'
 if key in glyphs:return key
 font=xml.find(f'Header/tags/DefineFont2[@objectID="{fid}"]');assert font is not None;g=list(font.find('glyphs'))[i];x=y=0;parts=[]
 for e in g.find('GlyphShape/edges'):
  if e.tag=='ShapeSetup':
   if 'x'in e.attrib:x=int(e.get('x'));y=int(e.get('y'));parts.append(f'M{x} {y}')
  elif e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'));parts.append(f'L{x} {y}')
  elif e.tag=='CurveTo':cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));x=cx+int(e.get('x2'));y=cy+int(e.get('y2'));parts.append(f'Q{cx} {cy} {x} {y}')
  else:raise AssertionError(e.tag)
 glyphs[key]=dict(id=key,fontId=fid,glyphIndex=i,d=' '.join(parts));return key

def native_text(p):
 t=texts[p['characterId']]
 if t['characterId']not in textModels:
  runs=[];x=y=0
  for r in t['runs']:
   x=r['xOffsetTwips']if r['changed']['xOffset']else x;y=r['yOffsetTwips']if r['changed']['yOffset']else y;gs=[]
   for g in r['glyphs']:
    assert g['unicode']is not None;gs.append(dict(text=g['unicode'],glyphId=glyph(r['fontId'],g['index']),x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
   runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],y=y,glyphs=gs))
  textModels[t['characterId']]=dict(sourceCharacterId=t['characterId'],sourceTextId=t['sourceTextId'],textMatrix=t['matrix'],text=''.join(r['text']for r in t['runs']),runs=runs)
 return dict(kind='text',sourceCharacterId=t['characterId'],sourceTextId=t['sourceTextId'],instanceId=p['instanceId'],depth=p['depth'],matrix=p.get('matrix',[1,0,0,1,0,0]),alpha=alpha(p),colorTransform=color_transform(p))

# Evaluate the retained FFDec SVG endpoints at each actual 16-bit source ratio.
# The generated paths contain no active SVG animation or runtime wall-clock tween.
NUMBER=re.compile(r'-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?',re.I)
def interpolate(name,values,ratio):
 pair=values.split(';');assert len(pair)==2 and isinstance(ratio,int)and 0<=ratio<=65535
 if ratio==0:return pair[0]
 if ratio==65535:return pair[1]
 t=ratio/65535
 if name in ['stroke','fill','stop-color']:
  if all(re.fullmatch(r'#[0-9a-f]{6}',s,re.I)for s in pair):
   a=[[int(s[i:i+2],16)for i in [1,3,5]]for s in pair]
   return '#'+''.join(f'{math.floor(x+(y-x)*t+0.5):02x}'for x,y in zip(*a))
  assert pair[0]==pair[1],(name,pair);return pair[0]
 a=list(map(float,NUMBER.findall(pair[0])));b=list(map(float,NUMBER.findall(pair[1])));assert len(a)==len(b)and NUMBER.sub('#',pair[0])==NUMBER.sub('#',pair[1]),(name,pair)
 it=iter(x+(y-x)*t for x,y in zip(a,b));return NUMBER.sub(lambda _ :format(next(it),'.15g'),pair[0])

def attrs(node,ratio):
 result={k:v for k,v in node.attrib.items() if not k.startswith('{https://www.free-decompiler.com/flash}')}
 if 'style'in result:
  for chunk in result.pop('style').split(';'):
   if ':'in chunk:k,v=chunk.split(':',1);result[k.strip()]=v.strip()
 transforms={}
 for a in node:
  if a.tag==NS+'animate':result[a.get('attributeName')]=interpolate(a.get('attributeName'),a.get('values'),ratio)
  elif a.tag==NS+'animateTransform':
   name=a.get('attributeName');value=interpolate(name,a.get('from')+';'+a.get('to'),ratio);part=f"{a.get('type')}({value})"
   if a.get('additive')=='replace':transforms[name]=[part]
   else:assert name in transforms;transforms[name].append(part)
 for key,value in transforms.items():result[key]=' '.join(value)
 return result

shapeVariants={};shapeInputs={};morphRatios={}
def shape(cid,ratio):
 morph=tags[cid].tag=='DefineMorphShape';ratio=ratio if morph else 0;key=f'{cid}-{ratio}'
 if key in shapeVariants:return key
 path=F/f"ffdec/{'morphshapes'if morph else'shapes'}/{cid}.svg";source=E.parse(path).getroot();shapeInputs[cid]=pin(path)
 assert all(n.tag in {NS+x for x in ['svg','g','path','defs','pattern','image','linearGradient','radialGradient','stop','animate','animateTransform']}for n in source.iter()),path
 paths=[attrs(n,ratio)for n in source.iter(NS+'path')];gradients=[];patterns=[]
 for g in source.iter():
  if g.tag in [NS+'linearGradient',NS+'radialGradient']:
   gradients.append(dict(kind=g.tag[len(NS):],attributes=attrs(g,ratio),stops=[attrs(s,ratio)for s in g if s.tag==NS+'stop']))
  elif g.tag==NS+'pattern':
   images=[]
   for im in g:
    assert im.tag==NS+'image';ia=attrs(im,ratio);href=ia.pop(XL+'href');assert href.startswith('data:image/PNG;base64,');images.append(dict(attributes=ia,href=href))
   patterns.append(dict(attributes=attrs(g,ratio),images=images))
 shapeVariants[key]=dict(key=key,sourceShapeId=cid,morph=morph,ratio=ratio,svgSha256=shapeInputs[cid]['sha256'],paths=paths,gradients=gradients,patterns=patterns)
 if morph:morphRatios.setdefault(cid,set()).add(ratio)
 return key

termsByButton={t['buttonId']:t['keyAttribute']for t in read(A/'structural-audit-v1.json')['terms']}
def visual(row,domain):
 nodes=[];terms=[]
 for p in row['placements']:
  cid=p['characterId']
  if cid in termsByButton:terms.append(termsByButton[cid])
  if cid in texts and texts[cid].get('runs'):nodes.append(native_text(p))
  elif tags[cid].tag.startswith(('DefineShape','DefineMorphShape')):
   nodes.append(dict(kind='vector',sourceShapeId=cid,sourceCharacterId=cid,shapeKey=shape(cid,p.get('ratio',0)),instanceId=p['instanceId'],matrix=p.get('matrix',[1,0,0,1,0,0]),alpha=alpha(p),colorTransform=color_transform(p),depth=p['depth'],ratio=p.get('ratio',0),clipDepth=p.get('clipDepth')))
  elif domain in [128,262]:assert cid==261,('unexpected selected feedback child',domain,cid)
 return dict(terms=terms,nodes=nodes)

mainStates=[visual(f,277)for f in st['sprite-277']];coachVisual=visual(st['sprite-63'][0],63);feedbackVisuals=[]
for sid in [128,262]:feedbackVisuals.append(dict(spriteId=sid,states=spans([visual(f,sid)for f in st[f'sprite-{sid}']]),mainPlacement=audit['feedback']['right'if sid==128 else'wrong']['selectedMainPlacement']['matrix']))
assert [textModels[x['characterId']]['text']for x in audit['coach']['text']]==[x['text']for x in audit['coach']['text']]
assert [(f['frame'],p['characterId'],p['depth'],p['clipDepth'])for sid in [277,63,128,262]for f in st[f'sprite-{sid}']for p in f['placements']if p.get('clipDepth')]==[(f,103,1,7)for f in range(2,9)]
branches=[dict(spriteId=128,kind='right',index=4,terminal=31),dict(spriteId=262,kind='wrong',index=4,terminal=29,hold=20,closeFirst=13,closeFirstVisible=14,closeJump=21)]
for b in branches:
 ids=[117,118]if b['kind']=='right'else[253,254];title='YOU GOT IT!'if b['kind']=='right'else'Incorrect!';assert all(textModels[i]['text']==title for i in ids);b.update(title=title,titleIds=ids,titleAlpha=spans([max([alpha(p)for p in f['placements']if p['characterId']in ids]or[0])for f in st[f"sprite-{b['spriteId']}"]]),popupAlpha=spans([max([alpha(p)for p in f['placements']if p['characterId']==261]or[0])for f in st['sprite-262']])if b['kind']=='wrong'else[])

audio=read(A/'audio-audit-v1.json');afterEnd=read(A/'after-end-preservation-v1.json');assert len(afterEnd['records'])==1 and afterEnd['records'][0]['bytes']==386 and afterEnd['records'][0]['nonzeroBytes']==17;assert pin(M/'source-v1/after-end-sprite-128.bin')['sha256']==afterEnd['records'][0]['file']['sha256'];structure=read(A/'structural-audit-v1.json');decodeFile=M/'native-v1/decode-native-v1.json';decode=read(decodeFile)if decodeFile.exists()else None
if decode:assert decode['pass']and len(decode['streams'])==10 and all(d['contextClosed']for d in decode['streams'])
clocks=[]
for sid in [277,128,262]:
 s=next(s for s in audio['streams']if s['spriteId']==sid);run=next(s for s in structure['audioRuns']if s['spriteId']==sid);segments=[{k:x[k]for k in ['firstFrame','firstDecodedSample','endDecodedSample']}for x in run['segments']];decoder=None;shortfall=None
 if decode:
  measured=next(d for d in decode['streams']if d['spriteId']==sid);assert measured['sourceBytes']==s['sourcePayload']['bytes']and measured['sourceSha256']==s['sourcePayload']['sha256']and measured['sampleRate']==22050 and measured['channels']==1
  decoder={k:measured[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};shortfall=s['positiveSamplesTotal']-decoder['decodedSamples']
  if shortfall!=0:
   # A measured discrepancy stops the runtime model until its exact treatment
   # is explicitly pinned; preserve the old candidate and all source bytes.
   disposition=read(M/'native-v1/decoder-clock-disposition-v1.json');assert disposition['decodeReceiptSha256']==sha(decodeFile.read_bytes())
   d=next(x for x in disposition['streams']if x['spriteId']==sid);assert d['sourceSha256']==decoder['sourceSha256']and d['pcmSha256']==decoder['pcmSha256']and d['sourceBytesChanged']is False and d['syntheticPadding']is False
   segments=d['segments'];assert all(0<=x['firstDecodedSample']<x['endDecodedSample']<=decoder['decodedSamples']for x in segments)
 clocks.append(dict(spriteId=sid,decoder=decoder,segments=segments,sourceDeclaredSegments=[{k:x[k]for k in ['firstFrame','firstDecodedSample','endDecodedSample']}for x in run['segments']],sourceDeclaredSampleTotal=s['positiveSamplesTotal'],decodedSampleShortfall=shortfall,sourcePayload=s['sourcePayload'],emptyNegativeBlocks=list({json.dumps(x,sort_keys=True):x for x in run['emptyBlocks']+run['negativeSeekBlocks']}.values()),nativeBrowserDecoded=bool(decode),decoderEvidence='Chromium decode-native-v1.json'if decode else'No decoder has run; null binding.'))
sa=None
if decode:
 d=next(x for x in decode['streams']if x['spriteId']=='SA');src=audio['spanishAudioCandidate']['source'];assert d['sourceBytes']==src['bytes']and d['sourceSha256']==src['sha256']and d['sampleRate']==48000 and d['channels']==1
 sa={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
coachBounds=tags[37].find('bounds/Rectangle');coachBox=[int(coachBounds.get('left'))-160,int(coachBounds.get('top'))-160,int(coachBounds.get('right'))-int(coachBounds.get('left'))+320,int(coachBounds.get('bottom'))-int(coachBounds.get('top'))+320]
rootPlacement=next(p for p in st['root'][5]['placements']if p['characterId']==277);assert rootPlacement['matrix'][:4]==[1,0,0,1];mainViewBox=[-rootPlacement['matrix'][4],-rootPlacement['matrix'][5],16000,12000]
coachHotspots=sorted([h for h in audit['hotspots']if h['timelineId']=='sprite-63'],key=lambda h:h['depth']);mainHotspots=sorted([h for h in audit['hotspots']if h['timelineId']=='sprite-277'],key=lambda h:h['depth']);assert len(coachHotspots)==7 and len(mainHotspots)==2 and len({h['instanceId']for h in audit['hotspots']})==9
model=dict(animationId=M.name,sourceSha256=c['sourceSha256'],fps=12,rootFrameCount=10,rootBeginFrame=6,mainSpriteId=277,mainFrameCount=516,quizFrame=105,resumeFrame=106,correctAnswer=1,title='Question 8',branches=branches,retainedUnselectedBranches=[161,173,201,219,233,248],behavior=dict(wrongFirst=audit['wrongPopup']['firstWrongCopy'],wrongLater=audit['wrongPopup']['secondWrongCopy'],end='source terminal stop516',feedbackSelection='fixed direct source calls right128/wrong262',lessonCompleted=False),clocks=clocks,sa=sa,saSource=audio['spanishAudioCandidate']['source'],nativeBrowserDecoded=bool(decode),terms=read(A/'glossary-source-v1.json')['entries'],coachTerms=[h['term']for h in coachHotspots],coachHotspots=coachHotspots,mainHotspots=mainHotspots,coachVisual=coachVisual,visualStates=spans(mainStates),feedbackVisuals=feedbackVisuals,textDefinitions=list(textModels.values()),diagram=dict(viewBox=mainViewBox,coachViewBox=coachBox,shapes=list(shapeVariants.values()),glyphs=list(glyphs.values()),geometry='Source main/coach/selected-feedback placement and glyph edges. Source masks preserved. Morph paths/gradients deterministically evaluated from retained FFDec SVG endpoints at source ratios; original Flash rasterization unverified.'),answers=[dict(answer=int(x['sourceButtonName'][-1]),letter=x['label'],equation=x['valueInferredFromSourceGlyphGeometry'],buttonId=x['sourceButtonId'])for x in audit['options']],sourceAnomalies=audit['unresolvedHostSemantics'],audioAfterEnd=afterEnd,sourceTermKeys={x['sourceKeyAttribute']:x['id']for x in read(A/'glossary-source-v1.json')['entries']},sourceOnlyDecorations='Unselected feedback definitions remain retained source only. Selected feedback mask/vector/morph/bitmap/title are modeled; dynamic wrong popup text and Close use maintained accessible HTML. Original visual parity remains unverified.')
assert model['answers']==[dict(answer=2,letter='A',equation='-3/2',buttonId=92),dict(answer=3,letter='B',equation='-2/7',buttonId=92),dict(answer=1,letter='C',equation='3/7',buttonId=91),dict(answer=4,letter='D',equation='7/3',buttonId=92)]
put(M/'native-v1/product-model-v1.json',model);put(M/'native-v1/source-model-v1.json',dict(animationId=M.name,sourcePins=pre['authoritativeSourcePins'],placement=pre['placement'],behaviorAudit=audit,timelines=c['timelines'],fonts=c['fonts'],sourceModified=False,sourceFreeze=pre['sourceFreeze'],sourceEventCount=sum(len(t['events'])for t in c['timelines']),rootSourceReview=pre['rootSourceReview'],independentSourceReview=pre['independentSourceReview']))
put(M/'native-v1/glossary-model-v1.json',read(A/'glossary-source-v1.json'));put(M/'native-v1/vector-extraction-v1.json',dict(sourcePins=list(shapeInputs.values()),variants=len(shapeVariants),morphRatios={str(k):sorted(v)for k,v in morphRatios.items()},algorithm='numeric endpoint interpolation ratio/65535; color channels round to nearest; animateTransform source sequence evaluated deterministically; no active SVG animate nodes',sourceModified=False))
print(json.dumps(dict(passed=True,mainFrames=516,shapes=len(shapeInputs),shapeVariants=len(shapeVariants),glyphs=len(glyphs),textDefinitions=len(textModels),visualSpans=len(model['visualStates']),coachTextIds=[x['characterId']for x in audit['coach']['text']],feedbackFrames=60,coachHotspots=len(coachHotspots),mainHotspots=len(mainHotspots),nativeBrowserDecoded=bool(decode),decoderBindingsNull=all(x['decoder']is None for x in clocks)and sa is None)))
