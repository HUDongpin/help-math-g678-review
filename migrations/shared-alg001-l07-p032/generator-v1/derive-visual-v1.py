from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=m['timelines'][1];texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
# Bound each glyph's actual source outline; advance width includes right bearing.
# Preserve only source-visible whole words; do not let font advance bearings hide punctuation.
glyphBounds={}
for font in xml.findall('Header/tags/DefineFont2'):
 for i,g in enumerate(font.findall('glyphs/Glyph')):
  x=y=0;points=[]
  for e in g.find('GlyphShape/edges'):
   if e.tag=='ShapeSetup':
    if e.get('x')is not None:x=int(e.get('x'));y=int(e.get('y'));points.append((x,y))
   elif e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'));points.append((x,y))
   elif e.tag=='CurveTo':
    cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));x=cx+int(e.get('x2'));y=cy+int(e.get('y2'));points.extend([(cx,cy),(x,y)])
   else:raise AssertionError(e.tag)
  glyphBounds[(int(font.get('objectID')),i)]=dict(left=min(x for x,y in points),right=max(x for x,y in points),top=min(y for x,y in points),bottom=max(y for x,y in points))if points else None
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];assert t['matrix']==[1,0,0,1,0,0];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']==(3 if id==6 else 10)
 clip=box(bounds[masks[0]['characterId']],masks[0]);out='';x=y=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  if r['yOffsetTwips']is not None:y=r['yOffsetTwips']
  scale=r['fontHeightTwips']/1024
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];gb=glyphBounds[(r['fontId'],g['index'])]
   if gb:
    b=box(dict(left=x+gb['left']*scale,right=x+gb['right']*scale,top=y+gb['top']*scale,bottom=y+gb['bottom']*scale),p)
    if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text']and len(out)<len(t['text'])and t['text'][len(out)].isalnum():out=out.rsplit(' ',1)[0]if' 'in out else''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def pose(p):return dict(sourceCharacterId=p['characterId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'],instanceId=p['instanceId'])
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in[6,12,16]];terms=[]
 # Six glossary actions; Evaluate has two source instances. Input and Variable
 # share one blue text run but have separate source hit areas and dictionary keys.
 for g in m['glossary']:
  tid,rid,visibleTerm={8:(6,0,'Evaluate'),9:(6,2,'nonlinear function'),13:(12,3,'substitute'),14:(12,5,'value'),17:(16,0,'input'),18:(16,0,'variable')}[g['characterId']]
  run=texts[tid]['runs'][rid];assert run['colorRgba']==[0,0,204,255]and visibleTerm.lower()in run['text'].lower()
  end=len(''.join(r['text']for r in texts[tid]['runs'][:rid]))+run['text'].lower().index(visibleTerm.lower())+len(visibleTerm)
  button=next((p for p in row if p['characterId']==g['characterId']),None)
  if button and len(paragraphs[[6,12,16].index(tid)])>=end:terms.append(g['term'])
 states.append(dict(paragraphs=paragraphs,terms=terms,panelAlpha=alpha(byid.get(2))))
stream=json.loads((B/'native-v1/streams-v1.json').read_text())[0];decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());d=next(d for d in decode['streams']if d['spriteId']==19);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==stream['sourceSha256']and d['decodedSamples']==stream['decodedSamplesCandidate']and all(d['contextClosed']for d in decode['streams'])
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-19',firstFrame=1,frameCount=168,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=stream['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in stream['blocks']if b['samples']==0 and b['seek']<0])
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=19,mainFrameCount=168,title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in texts.values()],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert states[-1]['paragraphs']==[texts[id]['text'].rstrip()for id in [6,12,16]]
summary=dict(status='pass',sourceFrames=len(states),spans=len(native['visualStates']),completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,12,16]},termsFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},emptyNegativeBlocks=clock['emptyNegativeBlocks'])
for name,value in [('native-v1/visual-model-v1.json',native),('audit-v1/visual-derivation-v1.json',summary)]:
 out=json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n';p=B/name
 if '--check'in sys.argv:assert p.read_text()==out
 else:p.write_text(out)
print(json.dumps(summary))
