"""P032 source-locked native draft. No renderer, browser or decoder acceptance implied."""
from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,re,copy,sys
R=Path(__file__).resolve().parents[3];M=R/'migrations/shared-alg001-l08-p032';Q=R/'output/g678-alg-l08-p032-source-20261007-v1';O=R/'output/g678-alg-l08-p032-integration-20261007-v1';read=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest();NS='{http://www.w3.org/2000/svg}'
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if '--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
manifest=read(Q/'handoff-manifest-v1.json')
for pin in manifest['files']:
 b=(R/pin['path']).read_bytes();assert len(b)==pin['bytes'] and sha(b)==pin['sha256'],pin['path']
c=read(Q/'text-catalog.json');assert c['sourceSha256']=='28475439842ddcc74c30d6ed05da7a450c4eb125370de487ead6b1ca740ca5f3';xml=E.parse(Q/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')};texts={t['characterId']:t for t in c['textDefinitions']};scripts={str(p.relative_to(Q/'ffdec/scripts')):p.read_text()for p in(Q/'ffdec/scripts').rglob('*.as')}
assert scripts['DefineSprite_332/frame_417/DoAction.as'].strip()=='stop();'
assert 'Mc_Right_Feed4.gotoAndPlay(2)'in scripts['DefineButton2_105/BUTTONCONDACTION on(release).as']
assert '_global.quizTryCount++'in scripts['DefineSprite_252/frame_31/DoAction.as']
def states(t):
 active={};out=[]
 for frame in range(1,t['declaredFrameCount']+1):
  for e in t['events']:
   if e['frame']!=frame:continue
   if e['kind']=='remove':active.pop(e['depth'],None)
   if e['kind']=='place':
    old=active.get(e['depth'],{})if e.get('move')else{};active[e['depth']]={**old,**{k:copy.deepcopy(v)for k,v in e.items()if k not in ['eventId','frame','tagName','sourceTagOffset','sourceTagSha256','kind','move','flags']}}
  out.append(dict(frame=frame,placements=[copy.deepcopy(v)for _,v in sorted(active.items())]))
 return out
st={t['timelineId']:states(t)for t in c['timelines']};put(M/'native-v1/source-states-v1.json',{'structuralOnly':True,'timelines':st})
def spans(xs):
 out=[]
 for f,v in enumerate(xs,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def alpha(p):
 t=p.get('colorTransform',{});assert t.get('multiply',[256]*4)[:3]==[256]*3 and t.get('add',[0]*4)[:3]==[0]*3
 return max(0,min(1,t.get('multiply',[256]*4)[3]/256+t.get('add',[0]*4)[3]/255))
glyphs={};textModels={}
def glyph(fid,i):
 key=f'{fid}-{i}'
 if key in glyphs:return key
 font=xml.find(f'Header/tags/DefineFont2[@objectID="{fid}"]');assert font is not None;g=list(font.find('glyphs'))[i];x=y=0;parts=[]
 for e in g.find('GlyphShape/edges'):
  if e.tag=='ShapeSetup':
   if'x'in e.attrib:x=int(e.get('x'));y=int(e.get('y'));parts.append(f'M{x} {y}')
  elif e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'));parts.append(f'L{x} {y}')
  elif e.tag=='CurveTo':cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));x=cx+int(e.get('x2'));y=cy+int(e.get('y2'));parts.append(f'Q{cx} {cy} {x} {y}')
  else:raise AssertionError(e.tag)
 glyphs[key]=dict(id=key,fontId=fid,glyphIndex=i,d=' '.join(parts));return key
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  x=r['xOffsetTwips']if r['changed']['xOffset']else x;y=r['yOffsetTwips']if r['changed']['yOffset']else y;gs=[]
  for g in r['glyphs']:
   assert g['unicode']is not None;gs.append(dict(text=g['unicode'],glyphId=glyph(r['fontId'],g['index']),x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],y=y,glyphs=gs))
 textModels[t['characterId']]=dict(sourceCharacterId=t['characterId'],sourceTextId=t['sourceTextId'],textMatrix=t['matrix'],text=''.join(r['text']for r in t['runs']),runs=runs)
 return dict(kind='text',sourceCharacterId=t['characterId'],sourceTextId=t['sourceTextId'],instanceId=p['instanceId'],depth=p['depth'],matrix=p.get('matrix',[1,0,0,1,0,0]),alpha=alpha(p))
termsByButton={int(re.search(r'DefineButton2_(\d+)',k).group(1)):re.search(r'KeyAttribute = "([^"]+)"',v).group(1)for k,v in scripts.items()if 'DefineButton2_'in k and 'KeyAttribute = 'in v}
selected=[332,75,74];shapeIds=sorted({p['characterId']for sid in selected for f in st[f'sprite-{sid}']for p in f['placements']if tags[p['characterId']].tag.startswith(('DefineShape','DefineMorphShape'))});shapes=[]
for cid in shapeIds:
 morph=tags[cid].tag=='DefineMorphShape';path=O/f"source-vectors-v1/{'morphshapes'if morph else'shapes'}/{cid}.svg";root=E.parse(path).getroot();paths=[]
 for n in root.iter(NS+'path'):
  row={'attributes':n.attrib,'animations':[{k:a.get(k)for k in['attributeName','values']}for a in n if a.tag==NS+'animate']};paths.append(row)
 shapes.append(dict(sourceShapeId=cid,morph=morph,svgSha256=sha(path.read_bytes()),paths=paths,gradients=[dict(kind=g.tag[len(NS):],attributes=g.attrib,stops=[s.attrib for s in g])for g in root.iter()if g.tag in[NS+'linearGradient',NS+'radialGradient']]))
def visual(sid):
 rows=[]
 for f in st[f'sprite-{sid}']:
  nodes=[];terms=[]
  for p in f['placements']:
   cid=p['characterId']
   if cid in termsByButton:terms.append(termsByButton[cid])
   if cid in texts and texts[cid].get('runs'):nodes.append(native(p))
   if cid in shapeIds:nodes.append(dict(kind='vector',sourceShapeId=cid,sourceCharacterId=cid,instanceId=p['instanceId'],matrix=p.get('matrix',[1,0,0,1,0,0]),alpha=alpha(p),depth=p['depth'],ratio=p.get('ratio',0),clipDepth=p.get('clipDepth')))
  rows.append(dict(terms=list(dict.fromkeys(terms)),nodes=nodes))
 return spans(rows)
branches=[]
for sid,kind,terminal in[(206,'right',27),(252,'wrong',31)]:
 tl=st[f'sprite-{sid}'];ids=sorted({p['characterId']for f in tl for p in f['placements']if p['characterId']in texts and texts[p['characterId']].get('runs')});titles=[''.join(r['text']for r in texts[i]['runs'])for i in ids];assert len(set(titles))==1
 aa=lambda p:max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256))
 b=dict(spriteId=sid,kind=kind,index=4,terminal=terminal,title=titles[0],titleIds=ids,titleAlpha=spans([max([aa(p)for p in f['placements']if p['characterId']in ids]or[0])for f in tl]))
 if kind=='wrong':b.update(hold=22,close=245,closeJump=23,closeFirst=16,closeChild=248)
 branches.append(b)
wrong=scripts['DefineButton2_104/BUTTONCONDACTION on(release).as'];wt=re.findall(r'_global.WrongFeed = "([^"]+)"',wrong);assert len(wt)==2
audio=read(Q/'audio-audit-v1.json');clockDraft=[]
for s in audio['streams']:
 before=0;blocks=[];runs=[];first=None
 for b in s['streamBlocks']:
  target=before+b['seekSamples'];blocks.append({**b,'samplesBefore':before,'sourceTargetSample':target});before+=b['sampleCount']
  if b['sampleCount']<=0:continue
  if first is None:first=b['frame']
  residual=target-(b['frame']-first)*1837
  if not runs or runs[-1]['sourceResidual']!=residual:
   if runs:runs[-1]['endDecodedSample']=blocks[-1]['samplesBefore']
   runs.append(dict(firstFrame=b['frame'],firstDecodedSample=target,sourceResidual=residual))
 if runs:runs[-1]['endDecodedSample']=before
 path=M/f"source-v1/stream-{s['spriteId']}.mp3";clockDraft.append(dict(spriteId=s['spriteId'],sourceBytes=path.stat().st_size,sourceSha256=sha(path.read_bytes()),sampleRate=22050,channels=1,decodedSamplesCandidate=before,decoderBinding=None,blocks=blocks,segments=[{k:r[k]for k in['firstFrame','firstDecodedSample','endDecodedSample']}for r in runs],selected=s['spriteId']in[332,206,252],emptyNegativeBlocks=[b for b in blocks if b['sampleCount']==0 and b['seekSamples']<0],browserDecodeAccepted=False))
put(M/'native-v1/stream-candidates-v1.json',clockDraft)
coachBounds=tags[37].find('bounds/Rectangle');coachBox=[int(coachBounds.get('left'))-200,int(coachBounds.get('top'))-200,int(coachBounds.get('right'))-int(coachBounds.get('left'))+400,int(coachBounds.get('bottom'))-int(coachBounds.get('top'))+400]
model=dict(animationId=M.name,sourceSha256=c['sourceSha256'],fps=12,rootFrameCount=10,rootBeginFrame=6,mainSpriteId=332,mainFrameCount=417,quizFrame=72,resumeFrame=73,correctAnswer=2,title='Question 3',branches=branches,behavior=dict(wrongFirst=wt[1],wrongLater=wt[0],end='source terminal STOP417',lessonCompleted=False),coach=dict(spriteId=75,childSpriteId=74,firstFrame=2,frameCount=30,childMatrix=[1,0,0,1,-3796,6280],sound=False,terminal='stop30'),coachTerms=list(dict.fromkeys(termsByButton[i]for i in[42,48,49,50,51,52,53,54,55,56,57,58,59])),terms=read(Q/'glossary-source-v1.json')['entries'],visualStates=visual(332),coachVisualStates=visual(74),coachPanel=visual(75)[0]['value'],diagram=dict(viewBox=[-8248,-5666,16000,12000],coachViewBox=coachBox,shapes=shapes,glyphs=list(glyphs.values())),answers=[dict(answer=1,letter='A',equation='−4/3'),dict(answer=4,letter='B',equation='−3/4'),dict(answer=3,letter='C',equation='3/4'),dict(answer=2,letter='D',equation='4/3')],clocksDraft=clockDraft,sourceAnomalies=['question typo graph in shown retained','wrong252 frame1 calls undefined page enableButton','wrong close AnsBtn1..4 lookup has popup scope, do not invent button timeline','early zero-alpha glossary hit-only availability is not original-runtime verified'],sourceOnlyDecorations='Full feedback mascots/bitmap/morph source definitions are retained in source audit; this native feedback presentation uses title/alpha/text/Close. Original visual parity pending.',decoderStatus='unverified browser PCM; candidate must not be registered or played with fabricated binding')
assert len(model['terms'])==15 and len(st['sprite-332'])==417 and len(st['sprite-74'])==30
model['textDefinitions']=list(textModels.values());model['clocks']=[];model['sa']=None
# Measured decode is a later serial stage. Source-sample differences require an
# explicit, hash-bound clock disposition; they never alter the preserved MP3.
decoded=M/'native-v1/decode-native-v1.json'
if decoded.exists():
 dec=read(decoded);assert dec['pass'] and len(dec['streams'])==10 and all(d['contextClosed']for d in dec['streams'])
 disposition=M/'native-v1/decoder-clock-disposition-v1.json';disp=read(disposition)if disposition.exists()else None
 for cd in clockDraft:
  d=next(d for d in dec['streams']if d['spriteId']==cd['spriteId']);assert d['sourceSha256']==cd['sourceSha256'] and d['sourceBytes']==cd['sourceBytes']
  if not cd['selected']:continue
  segments=copy.deepcopy(cd['segments'])
  if d['decodedSamples']!=cd['decodedSamplesCandidate']:
   assert disp and disp['decodeReceiptSha256']==sha(decoded.read_bytes()),'source-count difference retained; selected clock disposition pending'
   record=next(r for r in disp['streams']if r['spriteId']==cd['spriteId']);assert record['approved'] and record['sourceSha256']==cd['sourceSha256'] and record['pcmSha256']==d['pcmSha256']
   segments=record['segments'];assert all(0<=r['firstDecodedSample']<r['endDecodedSample']<=d['decodedSamples']for r in segments)
  model['clocks'].append(dict(spriteId=cd['spriteId'],decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=segments))
 d=next(d for d in dec['streams']if d['spriteId']=='SA');assert d['sourceSha256']==sha((M/'source-v1/L8TI04.mp3').read_bytes());model['sa']={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};model['decoderStatus']='real browser PCM bound; sourceAlignmentAccepted false'
put(M/'native-v1/product-model-v1.json',model)
print(json.dumps(dict(pass_=True,mainFrames=417,coachFrames=30,sourceShapes=len(shapes),morphIds=[s['sourceShapeId']for s in shapes if s['morph']],glyphs=len(glyphs),terms=15,decoderAccepted=len(model['clocks'])==3 and model['sa']is not None)))
