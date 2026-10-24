from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,math
M=Path(__file__).resolve().parents[1];R=M.parents[1];D=Path('/Volumes/American Dream/.g6l8p29audit1');Q=R/'output/g678-alg-l08-p029-source-audit-20261007-v1';m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-245');texts={t['characterId']:t for t in m['texts']};sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}';xml=E.parse(D/'movie.xml').getroot();tags={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')}
assert sha((M/'source-v1/L8IN14.swf').read_bytes())==m['source']['sha256']
def alpha(p,strict=True):
 c=p.get('colorTransform',{});assert not strict or(c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3)
 return max(0,min(1,c.get('multiply',[256]*4)[3]/256+c.get('add',[0]*4)[3]/255))
def native(p):
 t=texts[p['characterId']];runs=[];x=y=0
 for r in t['runs']:
  x=r['xOffsetTwips']if r['changed']['xOffset']else x;y=r['yOffsetTwips']if r['changed']['yOffset']else y;glyphs=[];start=x
  for g in r['glyphs']:
   assert g['unicode']is not None;glyphs.append(dict(text=g['unicode'],x=x,advanceTwips=g['advanceTwips']));x+=g['advanceTwips']
  runs.append(dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],x=start,y=y,advanceTwips=x-start,glyphs=glyphs))
 return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceTagSha256=t['sourceTagSha256'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],textMatrix=t['matrix'],text=t['text'],boundsTwips=t['boundsTwips'],alpha=alpha(p),runs=runs)
def box(b,p):
 a,bm,c,d,e,f=p['matrix'];pts=[(a*x+c*y+e,bm*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(p[0]for p in pts),max(p[0]for p in pts),min(p[1]for p in pts),max(p[1]for p in pts)]
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
maskBounds={k:int(v)for k,v in tags[21].find('bounds/Rectangle').attrib.items()};assert maskBounds==dict(left=-3633,right=3634,top=-250,bottom=250)
def activeMask(row,p):
 masks=[q for q in row if q.get('clipDepth',0)>=p['depth']>q['depth']];assert len(masks)==1 and masks[0]['characterId']==21
 return box(maskBounds,masks[0])
# Exact glyph extrema provide whole-word narrative visibility, avoiding source-font run-box approximations.
def q(a,b,c,t):return(1-t)**2*a+2*(1-t)*t*b+t*t*c
glyphCache={}
def glyphBounds(fid,index):
 key=(fid,index)
 if key in glyphCache:return glyphCache[key]
 font=xml.find(f'Header/tags/DefineFont2[@objectID="{fid}"]');assert font is not None;g=list(font.find('glyphs'))[index];xx=yy=0;pts=[]
 for e in g.find('GlyphShape/edges'):
  if e.tag=='ShapeSetup':
   if'x'in e.attrib:xx=int(e.get('x'));yy=int(e.get('y'))
  elif e.tag=='LineTo':
   nxt=(xx+int(e.get('x')),yy+int(e.get('y')));pts.extend([(xx,yy),nxt]);xx,yy=nxt
  elif e.tag=='CurveTo':
   ctrl=(xx+int(e.get('x1')),yy+int(e.get('y1')));nxt=(ctrl[0]+int(e.get('x2')),ctrl[1]+int(e.get('y2')));xs=[xx,ctrl[0],nxt[0]];ys=[yy,ctrl[1],nxt[1]];ts=[0,1]
   for v in[xs,ys]:
    den=v[0]-2*v[1]+v[2]
    if den:
     t=(v[0]-v[1])/den
     if 0<t<1:ts.append(t)
   pts.extend((q(*xs,t),q(*ys,t))for t in ts);xx,yy=nxt
  else:raise AssertionError(e.tag)
 b=None if not pts else dict(left=min(p[0]for p in pts),right=max(p[0]for p in pts),top=min(p[1]for p in pts),bottom=max(p[1]for p in pts));glyphCache[key]=b;return b
narrative=[23,28,32,34,244];glyphsByText={}
for tid in narrative:
 t=texts[tid];x=y=0;out=[]
 for r in t['runs']:
  x=r['xOffsetTwips']if r['changed']['xOffset']else x;y=r['yOffsetTwips']if r['changed']['yOffset']else y;scale=r['fontHeightTwips']/1024
  for g in r['glyphs']:
   b=glyphBounds(r['fontId'],g['index']);out.append(dict(text=g['unicode'],box=None if b is None else dict(left=b['left']*scale+x,right=b['right']*scale+x,top=b['top']*scale+y,bottom=b['bottom']*scale+y)));x+=g['advanceTwips']
 glyphsByText[tid]=out
assert texts[239]['matrix']==[1,0,0,1,0,0]
def prefix(row,tid):
 ps=[p for p in row if p['characterId']==tid]
 if not ps:return''
 assert len(ps)==1;p=ps[0];t=texts[tid]
 if alpha(p)<=0:return''
 if tid==239:return t['text'].rstrip()
 clip=activeMask(row,p);out=''
 for g in glyphsByText[tid]:
  if g['box'] is not None:
   inner=box(g['box'],dict(matrix=t['matrix']));b=box(dict(zip(['left','right','top','bottom'],inner)),p)
   if not(clip[0]-1e-7<=b[0]and clip[1]+1e-7>=b[1]and clip[2]-1e-7<=b[2]and clip[3]+1e-7>=b[3]):break
  out+=g['text']
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if' 'in out else''
 return out.rstrip()
# Main-sprite vectors include grid3, red-line10, source point/highlight paths and fraction/emphasis paths.
shapeIds=sorted({p['characterId']for row in main['frames']for p in row if tags[p['characterId']].tag.startswith('DefineShape')and p['characterId']!=21});assert shapeIds==[3,10,22,27,33,37,38,41,43,47,50,240,242];shapes=[]
for id in shapeIds:
 p=D/f'ffdec/shapes/{id}.svg';r=E.parse(p).getroot();paths=[n.attrib for n in r.iter(ns+'path')];shapes.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=paths,gradients=[dict(kind=g.tag[len(ns):],attributes=g.attrib,stops=[s.attrib for s in g])for g in r.iter()if g.tag in[ns+'linearGradient',ns+'radialGradient']],smallStrokeMetadata=[dict(pathIndex=i,sourcePixelWidth=n['{https://www.free-decompiler.com/flash}original-stroke-width'],displayPixelWidth=n['stroke-width'])for i,n in enumerate(paths)if'{https://www.free-decompiler.com/flash}original-stroke-width'in n]))
# Source underlines22/27/33 belong to excluded narrative text. Keep their source assets, but avoid disconnected underlines in the native graph.
renderShapeIds=[i for i in shapeIds if i not in[22,27,33]];textIds=sorted({p['characterId']for row in main['frames']for p in row if p['characterId']in texts and p['characterId']not in narrative});states=[]
for frame,row in enumerate(main['frames'],1):
 terms=[g['term']for g in m['glossary']if any(a<=frame<=b for a,b in g['visibleRanges'])];question=' '.join(s for s in[prefix(row,id)for id in[23,28,32,34]]if s);conclusions=[dict(sourceTextId=f'character-{id}',text=prefix(row,id))for id in[244]if prefix(row,id)]
 states.append(dict(question=question,conclusions=conclusions,terms=terms,texts=[native(p)for p in row if p['characterId']in textIds],vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in row if p['characterId']in renderShapeIds]))
assert len(states)==926;assert all(g['term']in states[g['visibleRanges'][0][0]-1]['terms']for g in m['glossary'])
branches=[]
for b in m['branches']:
 tl=next(t for t in m['timelines']if t['timelineId']==f"sprite-{b['spriteId']}");pos=next(p for p in main['frames'][275]if p['characterId']==b['spriteId']);values=[]
 for row in tl['frames']:
  a=0
  for p in row:
   if p['characterId']in b['titleIds']:
    bb=box(texts[p['characterId']]['boundsTwips'],p)
    if bb[1]+8248+pos['matrix'][4]>0 and bb[0]+8248+pos['matrix'][4]<16000 and bb[3]+5666+pos['matrix'][5]>0 and bb[2]+5666+pos['matrix'][5]<12000:a=max(a,alpha(p,False))
  values.append(a)
 branches.append(dict(**b,titleAlpha=spans(values)))
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and len(decode['streams'])==9 and all(d['contextClosed']for d in decode['streams']);decoder=lambda d:{k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']};clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];clocks.append(dict(spriteId=s['spriteId'],decoder=decoder(d),segments=s['segments'],emptyNegativeBlocks=s['emptyNegativeBlocks'],sourceTrailingAfterEnd=s['sourceTrailingAfterEnd']))
adpcm=json.loads((M/'native-v1/adpcm-decode-v1.json').read_text());ad=next(d for d in decode['streams']if d['spriteId']==136);assert ad['sourceSha256']==adpcm['sourceSha256']and ad['decodedSamples']==23870 and adpcm['entryTargetSample']==1837;clocks.append(dict(spriteId=136,decoder=decoder(ad),segments=[dict(firstFrame=2,firstDecodedSample=1837,endDecodedSample=23870)],alignmentStatus='Fresh native22050Hz browser PCM; source5512.5 nominal versus integer5512 WAV/resampler phase unverified.'))
sa=next(d for d in decode['streams']if d['spriteId']=='SA');model={k:m[k]for k in['animationId','fps','rootFrameCount','rootBeginFrame','mainSpriteId','mainFrameCount','quizFrame','correctAnswer','answerCharacters','behavior','title','titleSourceShapeId']};model.update(sourceSha256=m['source']['sha256'],branches=branches,clocks=clocks,sa=decoder(sa),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],visualStates=spans(states),diagram=dict(viewBox=[-7500,-2700,14500,7000],shapes=shapes,renderShapeIds=renderShapeIds,geometry='Exact source main placement plus path coordinates in twips; SVG export translation discarded only as export viewport origin. FFDec small-stroke display widths retained with original widths pinned.'),answers=[dict(answer=1,letter='A',equation='40',sourceTextIds=[44,45]),dict(answer=2,letter='B',equation='45',sourceTextIds=[51,52]),dict(answer=3,letter='C',equation='50',sourceTextIds=[48,49]),dict(answer=4,letter='D',equation='60',sourceTextIds=[42,46])],textBindings=[dict(depth=d,sourceTextIds=sorted({t['sourceTextId']for s in states for t in s['texts']if t['depth']==d}))for d in sorted({t['depth']for s in states for t in s['texts']})],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/product-model-v1.json';out=json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
result=dict(pass_=True,frames=926,spans=len(model['visualStates']),nativeTexts=len(textIds),shapes=len(shapes),renderShapes=len(renderShapeIds),branches=len(branches),firstFullNarratives={str(id):next((f for f,row in enumerate(main['frames'],1)if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in narrative},firstTerms={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},nativeOnly=True,registered=False);print(json.dumps(result));r=M/'audit-v1/native-derivation-v1.json'
if r.exists():assert json.loads(r.read_text())==result
else:r.open('x').write(json.dumps(result,indent=2)+'\n')
