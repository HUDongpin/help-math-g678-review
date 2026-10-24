"""P038 selected source geometry calibration; no interaction or decoder claims.
Glyph/SVG endpoint methods originate from the independently checked P037
maintained generator. P038 inputs and all selected child dispositions are exact.
"""
from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,re,sys,math
R=Path.cwd();assert R==Path('/Volumes/WestWorld/HELP MATH 2.0-g678-implementation')
O=R/'output/g678-alg-l08-p038-integration-20261007-v1';A=R/'output/g678-alg-l08-p038-source-20261007-v1';F=A/'source';D=R/'migrations/shared-alg001-l08-p038/native-v1';D.mkdir(exist_ok=True)
NS='{http://www.w3.org/2000/svg}';XL='{http://www.w3.org/1999/xlink}';read=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def verify(row):
 p=Path(row['path']);p=p if p.is_absolute()else R/p;assert pin(p)==dict(row,path=str(p)),str(p)
def put(name,value):
 p=D/name;b=(json.dumps(value,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if '--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
pre=read(O/'selection-and-source-pins-v1.json')
for key in ['sourceFreeze','independentSourceReview','rootSourceReview']:verify(pre[key])
for row in pre['sourceAudits'].values():verify(row)
for row in pre['authoritativeSourcePins']:verify(row)
for row in read(O/'design-review-manifest-v1.json')['files']:verify(row)
c=read(F/'text-catalog.json');audit=read(A/'behavior-audit-v1.json');st=read(A/'source-states-v1.json')['timelines'];texts={t['characterId']:t for t in c['textDefinitions']};xml=E.parse(F/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')and t.tag.startswith('Define')}
assert c['sourceSha256']=='e77e92b6cd1cebd8b330ab853a377bf7913b7c3911acc195ceb929150deaff0b'
assert len(st['sprite-585'])==525 and audit['main']['quizStopFrame']==208 and audit['main']['postQuizFrame']==209
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
buttons={b['characterId']:b for b in c['buttonDefinitions']};buttonModels={};dynamicFields={}
childClasses={74:'stopped-empty-line-template',77:'interactive-fixed-point',79:'interactive-fixed-point',80:'interactive-fixed-point',81:'interactive-fixed-point',82:'interactive-fixed-point',131:'unselected-stopped-feedback',170:'unselected-stopped-feedback',189:'unselected-stopped-feedback',228:'unselected-stopped-feedback',332:'unselected-stopped-feedback',372:'unselected-stopped-feedback',423:'unselected-stopped-feedback',463:'unselected-stopped-feedback',527:'unselected-stopped-feedback',529:'unselected-offstage-coach-audio',531:'unselected-offstage-coach-audio',544:'conditional-hint-popup',548:'conditional-wrong-popup',549:'offstage-dynamic-point-template',570:'conditional-static-coach',585:'main-animation'}
def atom(p):
 cid=p['characterId']
 if cid in texts:
  if texts[cid].get('runs'):return native_text(p)
  assert texts[cid]['kind']=='dynamic-field';dynamicFields[cid]=texts[cid];return dict(kind='dynamic-text',sourceCharacterId=cid,instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],alpha=alpha(p),colorTransform=color_transform(p),initialText=None)
 if tags[cid].tag.startswith(('DefineShape','DefineMorphShape')):
  return dict(kind='vector',sourceShapeId=cid,sourceCharacterId=cid,shapeKey=shape(cid,p.get('ratio',0)),instanceId=p['instanceId'],matrix=p.get('matrix',[1,0,0,1,0,0]),alpha=alpha(p),colorTransform=color_transform(p),depth=p['depth'],ratio=p.get('ratio',0),clipDepth=p.get('clipDepth'))
 raise AssertionError(('not an atomic vector/text source',cid,tags[cid].tag))
def button(cid):
 if cid not in buttonModels:
  src=buttons[cid];states={}
  for state in ['up','over','down','hitTest']:states[state]=[atom(p)for p in src['statePlacements']if p['states'][state]]
  buttonModels[cid]=dict(sourceButtonId=cid,sourceTagSha256=src['sourceTagSha256'],term=termsByButton.get(cid),states=states)
 return cid
def visual(row):
 nodes=[];children=[];controls=[]
 for p in row['placements']:
  cid=p['characterId']
  if cid in buttons:controls.append(dict(sourceButtonId=button(cid),placement=p,term=termsByButton.get(cid)));continue
  if tags[cid].tag=='DefineSprite':assert cid in childClasses,cid;children.append(dict(spriteId=cid,disposition=childClasses[cid],placement=p));continue
  nodes.append(atom(p))
 return dict(nodes=nodes,children=children,controls=controls)
root=spans([visual(f)for f in st['root']]);main=spans([visual(f)for f in st['sprite-585']]);coach=visual(st['sprite-570'][0]);points=[dict(spriteId=sid,states=spans([visual(f)for f in st[f'sprite-{sid}']]))for sid in [77,79,80,81,82,549]];popups=[dict(spriteId=sid,states=[dict(first=1,last=1,value=visual(st[f'sprite-{sid}'][0]))])for sid in [544,548]];markers=[dict(spriteId=sid,firstFrame=visual(st[f'sprite-{sid}'][0]))for sid in [529,531]]
for sid in [74,131,170,189,228,332,372,423,463,527]:assert st[f'sprite-{sid}'][0]['placements']==[]
for f in st['sprite-585']:
 for p in f['placements']:assert not p.get('clipDepth')
assert len(coach['nodes'])==6 and len(coach['controls'])==14
assert [textModels[x['characterId']]['text']for x in audit['coach']['text']]==[x['text']for x in audit['coach']['text']]
assert [r['y']for r in textModels[578]['runs']]==[380,780]
assert ''.join(r['text']for r in textModels[578]['runs'])=='13'
assert len(buttonModels[69]['states']['up'])==0 and len(buttonModels[69]['states']['hitTest'])==1
h=buttonModels[69]['states']['hitTest'][0];assert h['sourceShapeId']==68
hitMain=next(p for p in st['sprite-585'][207]['placements']if p['characterId']==69);bounds=tags[68].find('bounds/Rectangle');hit=dict(sourceButton=69,hitShape=68,mainPlacement=hitMain,buttonShape=h,shapeBoundsTwips={k:int(bounds.get(k))for k in ['left','right','top','bottom']},method='Apply exact main and button shape transforms; original SVG fill hit geometry is authoritative, not only its bounding box.')
structure=read(A/'structural-audit-v1.json');run=next(r for r in structure['audioRuns']if r['spriteId']==585);assert run['declaredSamples']==929088 and[(x['firstFrame'],x['lastFrame'])for x in run['segments']]==[(20,20),(22,525)];assert run['decodedSamples']is None
model=dict(animationId=audit['animationId'],sourceSha256=c['sourceSha256'],stage=dict(rootFrameCount=10,rootBeginFrame=6,mainSpriteId=585,mainFrameCount=525,fps=12,viewBox=[-8248,-5666,16000,12000]),rootStates=root,mainStates=main,coachVisual=coach,pointVisuals=points,popupVisuals=popups,offstageAudioMarkers=markers,buttons=list(buttonModels.values()),backgroundHit=hit,textDefinitions=list(textModels.values()),dynamicTextFields=list(dynamicFields.values()),shapes=list(shapeVariants.values()),glyphs=list(glyphs.values()),sourceChildDispositions=childClasses,sourceMainAudioRun=run,sourceOnlyGeometry=True,sourceModified=False,nativeBrowserDecoded=False,interactionImplemented=False,designReviewed=False)
put('selected-geometry-v1.json',model);put('vector-extraction-v1.json',dict(sourcePins=list(shapeInputs.values()),shapeVariants=len(shapeVariants),morphRatios={str(k):sorted(v)for k,v in morphRatios.items()},algorithm='Source glyph outlines and placements; numeric endpoint interpolation ratio/65535 with deterministic color rounding; no active SVG animation; no normalized geometry',sourceModified=False))
print(json.dumps(dict(pass_=True,mainFrames=525,mainSpans=len(main),rootSpans=len(root),shapeVariants=len(shapeVariants),shapeSources=len(shapeInputs),glyphs=len(glyphs),textDefinitions=len(textModels),dynamicTextFields=len(dynamicFields),buttons=len(buttonModels),pointDomains=len(points),coachTextNodes=sum(n['kind']=='text'for n in coach['nodes']),coachControls=len(coach['controls']),mainAudioSegments=len(run['segments']),decodeExecuted=False,interactionImplemented=False)))
