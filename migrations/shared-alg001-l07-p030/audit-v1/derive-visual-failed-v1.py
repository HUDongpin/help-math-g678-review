from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-312');texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
# Bound each glyph's actual source outline; advance width includes right bearing.
# P025 final punctuation falls inside the mask even though its advance ends outside.
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
 t=texts[id];assert t['matrix']==[1,0,0,1,0,0];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']in[20,297]
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
mathBinding=json.loads((B/'audit-v1/math-binding-v1.json').read_text())
mathRows=mathBinding['rows']
# Every number/letter in each source equation shares the source fade.
def groupAlpha(dp,lo,hi):
 aa=[alpha(dp.get(d))for d in range(lo,hi+1)];assert len(set(aa))==1,(lo,hi,aa);return aa[0]
paths=[]
for id in [3,32]:
 svg=B/f'source-v1/ffdec/shapes/{id}.svg';rows=[]
 for i,p in enumerate(E.parse(svg).getroot().iter(ns+'path')):
  attrs={k:v for k,v in p.attrib.items()if not k.startswith('{')};original=p.get('{https://www.free-decompiler.com/flash}original-stroke-width')
  if original:attrs['stroke-width']=original
  rows.append(dict(sourcePathIndex=i,attributes=attrs))
 paths.append(dict(sourceShapeId=id,svgSha256=sha(svg.read_bytes()),paths=rows))
labels=[]
for p in main['frames'][367]:
 if 6<=p['depth']<=21:
  t=texts[p['characterId']];bb=box(t['boundsTwips'],p);labels.append(dict(text=t['text'],x=(bb[0]+bb[1])/40,y=(bb[2]+bb[3])/40,sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],sourceDepth=p['depth']))
assert len(labels)==16
answers=[]
for answer,letter,lid,vid,depth,value in [(1,'A',37,42,165,'40'),(2,'B',46,47,176,'45'),(3,'C',41,43,166,'50'),(4,'D',39,44,167,'60')]:
 button=next(p for p in m['namedAtQuiz']if p['name']==f'AnsBtn{answer}');assert button['characterId']==(50 if answer==2 else 49);assert texts[lid]['text']==letter and texts[vid]['text']==value
 answers.append(dict(answer=answer,letter=letter,instance=button['name'],depth=depth,letterId=lid,valueId=vid,value=value,characterId=button['characterId']))
bs=[dict(spriteId=250,kind='wrong',index=1,child=249,hold=23,close=247,closeJump=24,terminal=28),dict(spriteId=229,kind='wrong',index=2,child=220,hold=22,close=218,closeJump=23,terminal=28),dict(spriteId=198,kind='wrong',index=3,child=197,hold=20,close=193,closeJump=21,terminal=29),dict(spriteId=135,kind='right',index=1,terminal=27),dict(spriteId=82,kind='right',index=2,terminal=25),dict(spriteId=151,kind='right',index=3,terminal=28),dict(spriteId=172,kind='right',index=4,terminal=33),dict(spriteId=110,kind='right',index=5,terminal=28)]
byid={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'};root=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==312)
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix))
def titleIds(row):
 ids=[]
 for p in row:
  id=p['characterId']
  if id in texts and texts[id]['text']:ids.append(id)
  elif id in byid and byid[id]['declaredFrameCount']==1:ids.extend(titleIds(byid[id]['frames'][0]))
 return ids
def titleLeaves(row,ids,parents=(),pa=1):
 aa=[]
 for p in row:
  if p['characterId']in ids:
   b=box(texts[p['characterId']]['boundsTwips'],p)
   for q in parents:b=box(dict(left=b[0],right=b[1],top=b[2],bottom=b[3]),q)
   if b[1]>0 and b[0]<16000 and b[3]>0 and b[2]<12000:aa.append(pa*alpha(p))
  elif p['characterId']in byid and byid[p['characterId']]['declaredFrameCount']==1:aa.extend(titleLeaves(byid[p['characterId']]['frames'][0],ids,(p,*parents),pa*alpha(p)))
 return aa
for b in bs:
 t=byid[b['spriteId']];assert len(t['frames'])==b['terminal'];terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal;assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();';assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==b['child']for p in row)for row in t['frames']])if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 ids=list(dict.fromkeys(id for row in t['frames']for id in titleIds(row)if texts[id]['text']!='Close'));titles=list(set(texts[id]['text']for id in ids));assert len(titles)==1,(b,ids,titles)
 mp=dict(next(p for p in main['frames'][367]if p['characterId']==b['spriteId']));mp['matrix']=[*mp['matrix'][:4],100,mp['matrix'][5]]
 b.update(title=titles[0],titleIds=ids,titleAlpha=spans([max(titleLeaves(row,ids,(mp,root)),default=0)for row in t['frames']]),naturallySelected=b['kind']=='wrong'or b['index']<=4)
states=[]
termspec=[('Graph',22,1,24),('Function',22,3,25),('Slope',29,1,30),('Line',29,3,31),('Measure',299,1,301),('Rate',299,3,300),('Ratio',306,1,307)]
for frame,row in enumerate(main['frames'],1):
 dp={p['depth']:p for p in row};paragraphs={id:prefix(row,id)for id in [22,29,299,306]};present=lambda id:any(p['characterId']==id and alpha(p)>0 for p in row)
 terms=[term for term,id,ri,bid in termspec if present(bid)and len(paragraphs[id])>=len(''.join(r['text']for r in texts[id]['runs'][:ri+1]).rstrip())]
 mathAlpha={r['id']:groupAlpha(dp,*r['sourceDepthRange'])for r in mathRows}
 for term,bid,group in [('Vertical',268,'vertical'),('Change',269,'vertical'),('Horizontal',281,'horizontal')]:
  if present(bid)and mathAlpha[group]>0:terms.append(term)
 graphAlpha=alpha(dp.get(5));assert all(alpha(dp.get(d))==graphAlpha for d in range(6,22))
 graph=[dict(sourceShapeId=p['characterId'],depth=p['depth'],alpha=alpha(p),matrix=p['matrix'][:4]+[p['matrix'][4]/20,p['matrix'][5]/20])for p in row if p['characterId']in[3,32]]
 coordinates=[]
 for p in row:
  if p['characterId']in[34,35]:
   bb=box(texts[p['characterId']]['boundsTwips'],p);coordinates.append(dict(sourceTextId=f"character-{p['characterId']}",text=texts[p['characterId']]['text'],x=(bb[0]+bb[1])/40,y=(bb[2]+bb[3])/40,alpha=alpha(p)))
 for a in answers:assert all(alpha(p)==alpha(dp.get(a['depth']))for p in row if p['characterId']in[a['letterId'],a['valueId']])
 em={id:present(id)for id in[26,27,270,282,289,290,302,303,304,305]};vertical225=any(p['characterId']==270 and p['matrix'][5]==-1820 and alpha(p)>0 for p in row);slope225=any(p['characterId']==270 and p['matrix'][5]==-442 and alpha(p)>0 for p in row);horizontal5=any(p['characterId']==282 and p['matrix'][5]==-1131 and alpha(p)>0 for p in row);slope5=any(p['characterId']==282 and p['matrix'][5]==-442 and alpha(p)>0 for p in row)
 b=dp.get(176)
 states.append(dict(definition=paragraphs[22],question=paragraphs[29],conclusion=paragraphs[299],conclusionEnd=paragraphs[306],terms=terms,answerAlpha={a['letter']:alpha(dp.get(a['depth']))for a in answers},bMove=0 if not b else (-824-b['matrix'][5])/1786,graphAlpha=graphAlpha,graph=graph,coordinates=coordinates,mathAlpha=mathAlpha,unitAlpha=dict(vertical=groupAlpha(dp,112,116),horizontal=groupAlpha(dp,117,119),slope=groupAlpha(dp,120,122)),fractionAlpha=groupAlpha(dp,137,140),emphasis=dict(distance=em[26],time=em[27],vertical225=vertical225,horizontal5=horizontal5,slope225=slope225,slope5=slope5,divide=em[289],result45=em[290],rateUnit=em[302],question45=em[304],answer45=em[305])))
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],graph=dict(viewBox=[-345,-170,325,325],paths=paths,labels=labels,scope='Exact source paths and transformed glyph centers, with responsive native labels; not pixel fidelity.'),answers=answers,branches=bs,visualStates=spans(states),mathRows=[{k:r[k]for k in ['id','sourceDepthRange','sourceCharacterIds','sourceCompactText']}for r in mathRows],unitCorrection=mathBinding['unitCorrection'],completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[22,29,299,306]},nativeDisposition={'shape303':'Outlined question45 under native question45 emphasis; white stroke erasure stays source evidence.','shape305':'Outlined answer45 under retained native B45 emphasis; not a unit shape.','shape308':'Native fraction rule with source309/310/311 text.','feedbackBitmaps':'83,85,87,89,91,93,95,97,98,100 are water-ripple decoration in right index5/sprite110; retain source custody. Native feedback uses actual source title/clock. Branch5 excluded from historical random(4) selection.'},originalRuntimeAccepted=False,registered=False)
assert all(result['completeTextFrames'].values());assert [texts[id]['text']for id in [309,310,311]]==['Slope =','Vertical change','Horizontal change']
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(completeTextFrames=result['completeTextFrames'],spans=len(result['visualStates']),graphLabels=len(labels),branches=[{k:b[k]for k in ['spriteId','title','closeFirst','naturallySelected']if k in b}for b in bs],registered=False)))
