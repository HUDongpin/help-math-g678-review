from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p16a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
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
# Use native equation tokens/fraction for text and source glyph emphasis; keep exact arrow vectors.
def native(p):
 t=texts[p['characterId']];b=box(t['boundsTwips'],p);return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],instanceId=p['instanceId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,alpha=alpha(p),runs=[dict(text=r['text'],colorRgba=r['colorRgba'])for r in t['runs']])
def glyphs(p):
 t=texts[p['characterId']];out=[];x=0
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   center=x+g['advanceTwips']/2;px=p['matrix'][0]*center+p['matrix'][4];py=p['matrix'][3]*(t['boundsTwips']['top']+t['boundsTwips']['bottom'])/2+p['matrix'][5]
   if not g['unicode'].isspace():out.append(dict(text=g['unicode'],x=px,y=py,sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],instanceId=p['instanceId'],alpha=alpha(p),colorRgba=r['colorRgba']))
   x+=g['advanceTwips']
 return out
arrow_file=D/'ffdec/shapes/23.svg';paths=[n.attrib for n in E.parse(arrow_file).getroot().iter(ns+'path')];assert len(paths)==1
replacements=[]
for id,role in [(19,'native fraction bar'),(20,'fraction yellow emphasis'),(21,'fraction bar yellow emphasis'),(22,'fraction bar yellow emphasis'),(25,'negative intercept yellow emphasis'),(28,'fraction bar yellow emphasis'),(29,'fraction bar and negative intercept yellow emphasis'),(30,'fraction yellow emphasis'),(31,'fraction bar yellow emphasis')]:
 p=D/f'ffdec/shapes/{id}.svg';assert p.exists();replacements.append(dict(sourceShapeId=id,sourceSvgSha256=sha(p.read_bytes()),nativeRole=role))
assert texts[18]['text']=='34'and [r['text']for r in texts[18]['runs']]==['3','4'];assert texts[18]['runs'][1]['xOffsetTwips']==0 and texts[18]['runs'][0]['yOffsetTwips']<texts[18]['runs'][1]['yOffsetTwips']
states=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row}
 for p in row:
  c=p.get('colorTransform',{});assert c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3
 paragraphs=[prefix(row,id)for id in[5,10,14]];terms=[]
 for g in m['glossary']:
  index={'Slope-intercept form':0,'Equation':1,'Line':1,'Slope':2,'Y-intercept':2}[g['term']]
  if g['characterId']in byid and re.search(r'\b'+re.escape(g['term'].lower())+r'\b',paragraphs[index].lower()):terms.append(g['term'])
 equation=None
 if 17 in byid:
  parts=glyphs(byid[17]);assert [p['text']for p in parts]==['y','=','x','–','2'];parts[3]=glyphs(byid[27])[0]if 27 in byid else parts[3];parts[4]=glyphs(byid[26])[0]if 26 in byid else parts[4]
  p=byid[18];t=texts[18];assert p['matrix'][1:3]==[0,0];first=t['runs'][0]['glyphs'][0];x=p['matrix'][0]*first['advanceTwips']/2+p['matrix'][4];b=box(t['boundsTwips'],p)
  fraction=dict(sourceTextId=t['sourceTextId'],sourceCharacterId=18,instanceId=p['instanceId'],x=x,y=(b[2]+b[3])/2,alpha=alpha(p),numerator='3',denominator='4',sourceRows=[r['yOffsetTwips']for r in t['runs']],colorRgba=t['runs'][0]['colorRgba'])
  equation=dict(parts=parts,fraction=fraction,fractionHighlight=any(id in byid for id in[20,30]),interceptHighlight=any(id in byid for id in[25,29]),highlightSourceIds=[id for id in[20,21,22,25,28,29,30,31]if id in byid])
 arrows=[dict(sourceShapeId=23,instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in row if p['characterId']==23]
 callouts=[native(p)for p in row if p['characterId']in[24,32]]
 states.append(dict(paragraphs=paragraphs,terms=terms,equation=equation,arrows=arrows,callouts=callouts))
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1;s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==33);assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];sa=next(d for d in decode['streams']if d['spriteId']=='SA')
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-33',firstFrame=1,frameCount=575,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0])
native={k:m[k]for k in ['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','behavior']};native.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],diagram=dict(viewBox=[-2750,-1650,5150,4250],arrow=dict(sourceShapeId=23,svgSha256=sha(arrow_file.read_bytes()),paths=paths),sourceGlyphReplacements=replacements),clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
assert all(v['equation']is None for v in states[:386]);assert states[386]['equation']['parts'][0]['alpha']==0 and states[390]['equation']['parts'][0]['alpha']==1
assert [i+1 for i,v in enumerate(states)if v['equation']and v['equation']['fractionHighlight']]==list(range(505,575));assert [i+1 for i,v in enumerate(states)if v['equation']and v['equation']['interceptHighlight']]==list(range(544,575));assert states[574]['equation']['highlightSourceIds']==[]
p=M/'native-v1/visual-model-v1.json';out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n'
if '--regenerate'in sys.argv and '--check'not in sys.argv:p.write_text(out)
elif '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=len(states),spans=len(native['visualStates']),completeTextFrames={str(id):next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in[5,10,14]},firstTermFrames={g['term']:next((i+1 for i,v in enumerate(states)if g['term']in v['terms']),None)for g in m['glossary']},visibleArrowsAt={str(f):[(a['depth'],a['alpha'])for a in states[f-1]['arrows']]for f in[518,519,521,525,544,557,558,560,575]},clock=clock)))
