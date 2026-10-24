from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-85');texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
# Bound each glyph's actual source outline; advance width includes right bearing.
# Source outline bounds preserve the authored punctuation independently of advance bearings.
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
 t=texts[id];assert t['matrix']==[1,0,0,1,0,0];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']in[20]
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
ns='{http://www.w3.org/2000/svg}'
for id in [20]:
 paths=list(E.parse(B/f'source-v1/ffdec/shapes/{id}.svg').getroot().iter(ns+'path'));assert paths
 for p in paths:assert set(re.findall(r'[A-Za-z]',p.get('d'))) <= set('MLZ'),(id,p.get('d'))

# Semantic math follows the source font runs, not the bare extracted x/3 text.
for id in [18,19,66,67,73,77,81]:
 t=texts[id];raised=[r for r in t['runs']if r['text'].strip()=='3'];assert len(raised)==1
 base=next(r for r in t['runs']if 'y ='in r['text']);assert raised[0]['fontHeightTwips']<base['fontHeightTwips'] and raised[0]['yOffsetTwips']<base['yOffsetTwips']
for id in [69,70,74,78,82,83]:
 assert all(r['fontId']==68 for r in texts[id]['runs']if r['text']=='x')
assert [texts[id]['text']for id in[10,13,14,11,15,12]]==['–2','–1','0','1','2','–8']
cols=[dict(input='–1',value='–1',ids=[66,67,69,70,71],depths=[36,37,38,39,40],steps=['y = x³','y = (−1)³','y = (−1) × (−1) × (−1)','y = 1 × (−1)','y = −1']),dict(input='0',value='0',ids=[66,73,74,75],depths=[36,37,38,39],steps=['y = x³','y = (0)³','y = 0 × 0 × 0','y = 0']),dict(input='1',value='1',ids=[66,77,78,79],depths=[36,37,38,39],steps=['y = x³','y = (1)³','y = 1 × 1 × 1','y = 1']),dict(input='2',value='8',ids=[66,81,82,83,84],depths=[36,37,38,39,40],steps=['y = x³','y = (2)³','y = 2 × 2 × 2','y = 4 × 2','y = 8'])]
states=[]
for frame,row in enumerate(main['frames'],1):
 dp={p['depth']:p for p in row};present=lambda id:any(p['characterId']==id and alpha(p)>0 for p in row)
 paragraphs=[prefix(row,id)for id in [22,25]]
 terms=[term for term,para,tid,bid in [('Table',0,22,24),('Output',1,25,26)]if present(bid)and len(paragraphs[para])>=len(''.join(r['text']for r in texts[tid]['runs'][:2]).rstrip())]
 # Exactly one substitution panel is authored. Its formula66 persists while
 # the per-input lines fade out and are replaced at their original depths.
 steps=[]
 for depth in [36,37,38,39,40]:
  p=dp.get(depth)
  if p and p['characterId']in set(sum([c['ids']for c in cols],[])):
   id=p['characterId'];col=next(c for c in cols if id in c['ids']);steps.append(dict(sourceTextId=id,text=col['steps'][col['ids'].index(id)],alpha=alpha(p)))
 states.append(dict(paragraphs=paragraphs,terms=terms,tableAlpha=alpha(dp.get(13)),formulaAlpha=alpha(dp.get(34)),formulaEmphasis=present(19),headerWordAlpha=alpha(dp.get(20)),headerVariableAlpha=alpha(dp.get(22))if frame>215 else 0,outputsRevealed=frame>=216,panelAlpha=alpha(dp.get(35))if dp.get(35,{}).get('characterId')==64 else 0,steps=steps,inputEmphasis=[id for id in [65,72,76,80]if present(id)]))
for c in cols:
 c['sourceText']=[texts[id]['text']for id in c['ids']]
 c['firstVisible']=[next(f for f,s in enumerate(states,1)if any(q['sourceTextId']==id and q['alpha']>0 for q in s['steps']))for id in c['ids']]
 c['fullAlpha']=[next(f for f,s in enumerate(states,1)if any(q['sourceTextId']==id and q['alpha']==1 for q in s['steps']))for id in c['ids']]
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],rows=[dict(input=i,output=o,inputIndex=idx)for i,o,idx in [('–2','–8',None),('–1','–1',0),('0','0',1),('1','1',2),('2','8',3)]],columns=cols,visualStates=spans(states),completeTextFrames={id:next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in[22,25]},termFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},nativeDisposition={'masks':'Source20 is a rectangle; exact source glyph-outline bounds give whole-word prose reveal. Button links require their complete word.','exponents':'Source-raised smaller3 uses semantic native superscript.','multiplication':'Source x glyphs in font68 are distinct from variable x in font3; source final frame confirms multiplication, rendered as ×.','table':'Five source input rows. Only output−8 for input−2 is prefilled. Other four outputs are empty until input, then all are revealed on main216. Input/Output headers crossfade to x/y over216–222.','panel':'One worked substitution panel, not four simultaneous columns; formula persists while the other steps are replaced in source order.','hintMismatch':'Wrong popup uses a square-style hint on a cubic exercise; preserve authored text and flag mismatch in development evidence.','offstage':'Coach labels54/56 are offstage debug labels; omitted from student display. Coach55 is not started by any page script.','decorative':'Source8 root title and source9 grid,20 mask,21 text reveal helper,23 link hit area,35/36/40/41/42/43/45/46/47/48 button graphics,50 popup and64 worked panel are handled by native semantic UI; no bitmaps.'},originalRuntimeAccepted=False,registered=False)
assert all(result['completeTextFrames'].values())
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(completeTextFrames=result['completeTextFrames'],terms=result['termFirst'],visualSpans=len(result['visualStates']),columns=[dict(input=c['input'],first=c['firstVisible'],full=c['fullAlpha'])for c in cols],registered=False)))
