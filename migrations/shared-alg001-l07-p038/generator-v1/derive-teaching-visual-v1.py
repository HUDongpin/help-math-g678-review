from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-243');texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
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
 p=next((p for p in row if p['characterId']==id and alpha(p)>0),None)
 if not p or not alpha(p):return ''
 t=texts[id];assert t['matrix']==[1,0,0,1,0,0];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']in[30]
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
for id in [30]:
 paths=list(E.parse(B/f'source-v1/ffdec/shapes/{id}.svg').getroot().iter(ns+'path'));assert paths
 for p in paths:assert set(re.findall(r'[A-Za-z]',p.get('d'))) <= set('MLZ'),(id,p.get('d'))
bs=[dict(spriteId=231,kind='wrong',index=1,child=222,hold=22,close=220,closeJump=23,terminal=28),dict(spriteId=185,kind='wrong',index=2,child=184,hold=20,close=181,closeJump=21,terminal=29),dict(spriteId=200,kind='wrong',index=3,child=196,hold=21,close=194,closeJump=22,terminal=28),dict(spriteId=104,kind='right',index=1,terminal=25),dict(spriteId=146,kind='right',index=2,terminal=27),dict(spriteId=160,kind='right',index=3,terminal=32),dict(spriteId=138,kind='right',index=4,terminal=27)]
byid={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'};root=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==243)
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix))
for b in bs:
 t=byid[b['spriteId']];assert len(t['frames'])==b['terminal'];terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'not in terminal and '_global.quizTryCount >= 2'in terminal;assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();';assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  assert any(p['characterId']==b['close']and p.get('name',{}).get('text')=='BtnClose'for p in byid[b['child']]['frames'][0])
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==b['child']for p in row)for row in t['frames']])if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 ids=list(dict.fromkeys(p['characterId']for row in t['frames']for p in row if p['characterId']in texts and texts[p['characterId']]['text']));titles=list(set(texts[id]['text']for id in ids));assert len(titles)==1,(b,ids,titles)
 mp=dict(next(p for p in main['frames'][116]if p['characterId']==b['spriteId']));mp['matrix']=[*mp['matrix'][:4],100,mp['matrix'][5]]
 vis=[]
 for row in t['frames']:
  aa=[]
  for p in row:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p)
    for parent in [mp,root]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),parent)
    if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 b.update(title=titles[0],titleIds=ids,titleAlpha=spans(vis),naturallySelected=True)
for id,ordinary,raised,baseline in [(22,480,312,298),(32,400,260,245)]:
 rs=[r for r in texts[id]['runs']if r['fontHeightTwips']==raised];assert len(rs)==1 and rs[0]['text']=='3'and rs[0]['yOffsetTwips']==baseline
 assert all(r['fontHeightTwips']==ordinary for r in texts[id]['runs']if r not in rs)
assert [texts[i]['text']for i in [12,14,15,16,13,17,21]]==['–2','–8','–1','0','1','2','8']
answers=[dict(answer=1,letter='A',letterId=51,characterId=71,grid=39,arrow=43,curve=50,depth=48,labelDepths=[49,50,51,*range(54,68)]),dict(answer=2,letter='B',letterId=65,characterId=70,grid=58,arrow=59,curve=58,depth=102,labelDepths=[103,104,105,*range(108,122)]),dict(answer=3,letter='C',letterId=63,characterId=70,grid=66,arrow=67,curve=68,depth=149,labelDepths=[150,151,152,*range(155,169)]),dict(answer=4,letter='D',letterId=61,characterId=72,grid=52,arrow=53,curve=60,depth=79,labelDepths=[80,81,82,*range(85,99)])]
graphs=[]
for a in answers:
 row=main['frames'][-1]if a['answer']==1 else main['frames'][116];paths=[];boxes=[]
 for id in dict.fromkeys([a['grid'],a['arrow'],a['curve']]):
  p=next(p for p in row if p['characterId']==id);file=B/f'source-v1/ffdec/shapes/{id}.svg';svg=E.parse(file).getroot();pp=[n.attrib for n in svg.iter(ns+'path')];assert pp
  # Source50/60 also contain the yellow answer button; only their red curve is teaching geometry.
  if id in [50,60]:pp=[p for p in pp if p.get('stroke')=='#cc0000'];assert len(pp)==1
  assert not any('url('in v for p in pp for v in p.values());paths.append(dict(sourceShapeId=id,sourceSvgSha256=sha(file.read_bytes()),matrix=p['matrix'],paths=pp))
  if id in [a['grid'],a['arrow']]:boxes.append(box(bounds[id],p))
 labels=[]
 for depth in a['labelDepths']:
  p=next(p for p in row if p['depth']==depth);t=texts[p['characterId']];q=box(t['boundsTwips'],p);labels.append(dict(depth=depth,sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],text=t['text'],x=(q[0]+q[1])/2,y=(q[2]+q[3])/2))
 assert len(labels)==17
 l=min(q[0]for q in boxes)-500;r=max(q[1]for q in boxes)+500;t=min(q[2]for q in boxes)-500;b=max(q[3]for q in boxes)+500
 points=[]
 if a['answer']==1:
  for pd,ld in [(77,79),(80,82),(83,85),(86,88),(89,91)]:
   p=next(p for p in row if p['depth']==pd);assert p['characterId']==236;q=box(bounds[236],p);lab=next(p for p in row if p['depth']==ld);text=texts[lab['characterId']];z=box(text['boundsTwips'],lab)
   points.append(dict(depth=pd,labelDepth=ld,x=(q[0]+q[1])/2,y=(q[2]+q[3])/2,text=text['text'],sourceTextId=text['sourceTextId'],sourceCharacterId=lab['characterId'],labelX=(z[0]+z[1])/2,labelY=(z[2]+z[3])/2))
 graphs.append(dict(answer=a['answer'],letter=a['letter'],viewBox=[l,t,r-l,b-t],paths=paths,labels=labels,points=points))
table=[dict(x='–2',y='–8',ids=[12,14],movingIds=[23,24],movingDepths=[22,23],bracketDepth=17),dict(x='–1',y='–1',ids=[15,15],movingIds=[25,25],movingDepths=[24,25],bracketDepth=18),dict(x='0',y='0',ids=[16,16],movingIds=[26,26],movingDepths=[26,27],bracketDepth=19),dict(x='1',y='1',ids=[13,13],movingIds=[27,27],movingDepths=[28,29],bracketDepth=20),dict(x='2',y='8',ids=[17,21],movingIds=[28,29],movingDepths=[30,31],bracketDepth=21)]
for pair in table:
 pair['sourcePair']=f"({pair['x']}, {pair['y']})";pair['movement']=[]
 for depth in pair['movingDepths']:
  ps=[next(p for p in row if p['depth']==depth)for row in main['frames']];a=ps[0]['matrix'][4];z=ps[-1]['matrix'][4];assert z>a
  pair['movement'].append(dict(depth=depth,first=next(i+1 for i,p in enumerate(ps)if p['matrix'][4]!=a),arrive=next(i+1 for i,p in enumerate(ps)if p['matrix'][4]==z),fromX=a,toX=z))
states=[]
for frame,row in enumerate(main['frames'],1):
 dp={p['depth']:p for p in row};paragraphs=[prefix(row,i)for i in[32,36]];terms=[]
 for term,id,ri,bid in [('Graph',32,1,34),('Table',36,1,38),('Value',36,3,37)]:
  if any(p['characterId']==bid and alpha(p)>0 for p in row)and len(paragraphs[0 if id==32 else 1])>=len(''.join(r['text']for r in texts[id]['runs'][:ri+1]).rstrip()):terms.append(term)
 aa={a['letter']:alpha(next((p for p in row if p['depth']==a['depth']and p['characterId']==a['grid']),None))for a in answers}
 pairs=[]
 for pair in table:
  progress=[max(0,min(1,(dp[x['depth']]['matrix'][4]-x['fromX'])/(x['toX']-x['fromX'])))for x in pair['movement']]
  pairs.append(dict(progress=progress,bracket=pair['bracketDepth']in dp))
 points=[dict(alpha=alpha(dp.get(p['depth']))if dp.get(p['depth'],{}).get('characterId')==236 else 0,labelAlpha=alpha(dp.get(p['labelDepth']))if dp.get(p['labelDepth'],{}).get('characterId')==p['sourceCharacterId']else 0)for p in graphs[0]['points']]
 states.append(dict(paragraphs=paragraphs,question=paragraphs[0].replace('x3','x³'),terms=terms,tableAlpha=alpha(dp.get(3)),answerAlpha=aa,pairs=pairs,points=points))
full={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[32,36]};assert all(full.values())
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=bs,graphs=graphs,table=table,visualStates=spans(states),completeTextFrames=full,termFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},nativeDisposition={'masks':'Source30 rectangular masks reveal exact glyph-outline bounds; native whole-word prefixes retain both instructions.','equations':'Source22/32 raised3 remains semantic superscript.','curves':'All four authored curve paths and grid/arrow geometry retained; no analytical substitute. Decorative choice button paths in50/60 replaced with native controls.','axisLabels':'17 native labels per graph retain exact source text including authored trailing-minus strings2-,4-,6-,8- in B/C/D. These source oddities are documented rather than silently corrected.','pairs':'Ten separately authored x/y moves drive sequential native pair assembly and table emphasis; fixed screen-space translation replaced with responsive row layout.','feedbackArtwork':'Three feedback bitmap assets and decorative morphs retained as source evidence; source title/message/Close/audio timing used in maintained semantic presentation.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(completeTextFrames=full,spans=len(result['visualStates']),terms=result['termFirst'],branches=[{k:b[k]for k in ['spriteId','title','closeFirst']if k in b}for b in bs],graphs=[dict(letter=g['letter'],labels=len(g['labels']),points=len(g['points']))for g in graphs])))
