from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-185');texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
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
 t=texts[id];assert t['matrix']==[1,0,0,1,0,0];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']in[3,14]
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
for id in [3,14]:
 paths=list(E.parse(B/f'source-v1/ffdec/shapes/{id}.svg').getroot().iter(ns+'path'));assert paths
 for p in paths:assert set(re.findall(r'[A-Za-z]',p.get('d'))) <= set('MLZ'),(id,p.get('d'))
answers=[]
for answer,letter,lid,vid,depth,expected in [(1,'A',19,20,35,'1'),(2,'B',22,23,44,'3'),(3,'C',25,26,53,'6'),(4,'D',28,29,62,'9')]:
 button=next(p for p in m['namedAtQuiz']if p['name']==f'AnsBtn{answer}');assert texts[lid]['text']==letter and texts[vid]['text'].rstrip()==expected
 answers.append(dict(answer=answer,letter=letter,instance=button['name'],depth=depth,letterId=lid,valueId=vid,value=expected,characterId=button['characterId']))
bs=[dict(spriteId=143,kind='wrong',index=1,child=139,hold=22,close=135,closeJump=23,terminal=31),dict(spriteId=177,kind='wrong',index=2,child=176,hold=23,close=152,closeJump=24,terminal=28),dict(spriteId=157,kind='wrong',index=3,child=154,hold=23,close=152,closeJump=24,terminal=29),dict(spriteId=102,kind='right',index=1,terminal=25),dict(spriteId=57,kind='right',index=2,terminal=31),dict(spriteId=115,kind='right',index=3,terminal=28),dict(spriteId=90,kind='right',index=4,terminal=27)]
byid={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'};root=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==185)
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix))
for b in bs:
 t=byid[b['spriteId']];assert len(t['frames'])==b['terminal'];terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal;assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();';assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  assert any(p['characterId']==b['close']and p.get('name',{}).get('text')=='BtnClose'for p in byid[b['child']]['frames'][0])
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==b['child']for p in row)for row in t['frames']])if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 ids=list(dict.fromkeys(p['characterId']for row in t['frames']for p in row if p['characterId']in texts and texts[p['characterId']]['text']));titles=list(set(texts[id]['text']for id in ids));assert len(titles)==1,(b,ids,titles)
 mp=dict(next(p for p in main['frames'][175]if p['characterId']==b['spriteId']));mp['matrix']=[*mp['matrix'][:4],100,mp['matrix'][5]]
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
# The raised2 is a smaller glyph at y272; its base uses y420. It is an exponent.
for id in [16,178,179]:
 raised=[r for r in texts[id]['runs']if r['fontHeightTwips']==286];assert len(raised)==1 and raised[0]['text']=='2' and raised[0]['yOffsetTwips']==272
 assert all(r['yOffsetTwips']==420 and r['fontHeightTwips']==440 for r in texts[id]['runs']if r not in raised)
states=[];termspec=[('Evaluate',6,1,8),('Nonlinear function',6,3,9),('Substitute',6,5,10),('Value',6,7,11),('Input',6,9,12),('Variable',6,11,13),('Function',16,1,17)]
steps=[(178,'y = x²'),(179,'y = 3²'),(180,'y = 3 ∙ 3'),(181,'y = 9')]
for frame,row in enumerate(main['frames'],1):
 dp={p['depth']:p for p in row};paragraphs={id:prefix(row,id)for id in [6,16]};present=lambda id:any(p['characterId']==id and alpha(p)>0 for p in row)
 terms=[term for term,id,ri,bid in termspec if present(bid)and len(paragraphs[id])>=len(''.join(r['text']for r in texts[id]['runs'][:ri+1]).rstrip())]
 for a in answers:assert all(alpha(p)==alpha(dp.get(a['depth']))for p in row if p['characterId']in[a['letterId'],a['valueId']])
 d=dp.get(62);stepAlpha={str(id):alpha(next((p for p in row if p['characterId']==id),None))for id,_ in steps}
 states.append(dict(definition=paragraphs[6],question=paragraphs[16].replace('x2','x²'),rawSourceQuestion=paragraphs[16],terms=terms,answerAlpha={a['letter']:alpha(dp.get(a['depth']))for a in answers},dMove=0 if not d else (1130-d['matrix'][5])/2830,stepAlpha=stepAlpha,emphasis={key:present(id)for key,id in [('input',182),('answer',183),('result',184)]}))
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=bs,steps=[dict(characterId=id,text=text,sourceText=texts[id]['text'],firstVisible=next(i+1 for i,s in enumerate(states)if s['stepAlpha'][str(id)]>0),fullAlpha=next(i+1 for i,s in enumerate(states)if s['stepAlpha'][str(id)]==1))for id,text in steps],visualStates=spans(states),completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,16]},termFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},nativeDisposition={'masks':'Two rectangular authored clip shapes bound exact glyph outlines; whole-word reveal follows source geometry.','questionExponent':'Text16 run3 raised2 at286twips/y272 is represented as semantic native superscript; raw source flat string is retained.','answers':'A/B/C fade out; D9 retained and moves upward. Semantic responsive compaction replaces fixed-position travel.','steps':'178 y=x²,179 y=3²,180 y=3∙3,181 y=9 appear with exact source alpha. Superscripts are native semantic math.','emphasis':'182 x=3,183 answer9 and184 resulty=9 become native magenta emphasis at exact authored blink frames.','feedbackArtwork':'Source globe bitmap50 and decorative shapes retained in custody; native titles, dynamic messages, Close timing and source audio remain in product. No geometric fidelity claim.'},originalRuntimeAccepted=False,registered=False)
assert all(result['completeTextFrames'].values())
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(completeTextFrames=result['completeTextFrames'],spans=len(result['visualStates']),terms=result['termFirst'],steps=result['steps'],branches=[{k:b[k]for k in ['spriteId','title','closeFirst']if k in b}for b in bs],emphasis={key:[[s['first'],s['last']]for s in result['visualStates']if s['value']['emphasis'][key]]for key in ['input','answer','result']},registered=False)))
