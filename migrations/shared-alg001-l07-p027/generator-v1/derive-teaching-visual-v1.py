from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re,math
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-224');texts={t['characterId']:{**t,'text':''.join(r['text']for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==3 for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
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
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if ' 'in out else ''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
# Preserve exact drawing paths and glyph coordinates in graph-local space.
gp=next(p for p in main['frames'][161]if p['characterId']==15);assert gp['matrix']==[1,0,0,1,687,-26]
paths=[]
for id in [15,24,213,214,215,216]:
 svg=B/f'source-v1/ffdec/shapes/{id}.svg';ps=list(E.parse(svg).getroot().iter(ns+'path'));rows=[]
 for i,p in enumerate(ps):
  attrs={k:v for k,v in p.attrib.items()if not k.startswith('{')};original=p.get('{https://www.free-decompiler.com/flash}original-stroke-width')
  if original:attrs['stroke-width']=original
  rows.append(dict(sourcePathIndex=i,attributes=attrs))
 paths.append(dict(sourceShapeId=id,svgSha256=sha(svg.read_bytes()),paths=rows))
labels=[]
for p in main['frames'][161]:
 if 24<=p['depth']<=37:
  t=texts[p['characterId']];bb=box(t['boundsTwips'],p);labels.append(dict(text=t['text'],x=((bb[0]+bb[1])/2-687)/20,y=((bb[2]+bb[3])/2+26)/20,sourceTextId=t['sourceTextId'],sourceCharacterId=p['characterId'],sourceDepth=p['depth']))
assert len(labels)==14
answerSpecs=[dict(answer=1,letter='A',instance='AnsBtn1',depth=68,letterId=32,valueId=33,value='–2'),dict(answer=2,letter='B',instance='AnsBtn2',depth=77,letterId=35,valueId=36,value='–1'),dict(answer=3,letter='C',instance='AnsBtn3',depth=50,letterId=26,valueId=27,value='0'),dict(answer=4,letter='D',instance='AnsBtn4',depth=59,letterId=29,valueId=30,value='1')]
for a in answerSpecs:
 assert texts[a['letterId']]['text']==a['letter'];assert re.sub(r'\s','',texts[a['valueId']]['text'])==a['value'];button=next(p for p in m['namedAtQuiz']if p['name']==a['instance']);assert button['characterId']==(39 if a['answer']==2 else 38);a['characterId']=button['characterId']
bs=[dict(spriteId=178,kind='wrong',index=1,child=174,hold=22,close=170,closeJump=23,terminal=31),dict(spriteId=212,kind='wrong',index=2,child=211,hold=23,close=187,closeJump=24,terminal=28),dict(spriteId=192,kind='wrong',index=3,child=189,hold=23,close=187,closeJump=24,terminal=29),dict(spriteId=124,kind='right',index=1,terminal=27),dict(spriteId=150,kind='right',index=2,terminal=28),dict(spriteId=71,kind='right',index=3,terminal=25),dict(spriteId=99,kind='right',index=4,terminal=28),dict(spriteId=138,kind='right',index=5,terminal=32)]
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix));branches=[];rootPose=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==224)
for b in bs:
 t=next(t for t in m['timelines']if t['timelineId']=='sprite-'+str(b['spriteId']));assert len(t['frames'])==b['terminal'];terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal;assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();';assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==b['child']for p in row)for row in t['frames']])if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 ids=list(dict.fromkeys(p['characterId']for r in t['frames']for p in r if p['characterId']in texts and texts[p['characterId']].get('runs')));titles=[texts[i]['text']for i in ids];assert len(set(titles))==1,(b,titles);mp=next(p for p in main['frames'][161]if p['characterId']==b['spriteId']);vis=[]
 for row in t['frames']:
  aa=[]
  for p in row:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p)
    for parent in[mp,rootPose]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),parent)
    if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 branches.append(dict(**b,title=titles[0],titleIds=ids,titleAlpha=spans(vis),naturallySelected=b['index']<=4 if b['kind']=='right'else True))
states=[]
for row in main['frames']:
 dp={p['depth']:p for p in row};definition,question=[prefix(row,id)for id in[6,13]];visible=(definition+' '+question).lower();active=[g['term']for g in m['glossary']if any(p['characterId']==g['characterId']for p in row)and g['term'].lower()in visible];b=dp.get(77);graph=[]
 for p in row:
  if p['characterId']in[15,24,213,214,215,216]:graph.append(dict(sourceShapeId=p['characterId'],depth=p['depth'],alpha=alpha(p),matrix=p['matrix'][:4]+[(p['matrix'][4]-687)/20,(p['matrix'][5]+26)/20]))
 for a in answerSpecs:
  assert all(alpha(p)==alpha(dp.get(a['depth']))for p in row if p['characterId']in[a['letterId'],a['valueId']])
 graphAlpha=alpha(dp.get(23));assert all(alpha(dp.get(d))==graphAlpha for d in range(24,39))
 annotation=next((p for p in row if p['characterId']==217),None)
 if annotation:
  bb=box(texts[217]['boundsTwips'],annotation);annotation=dict(sourceTextId='character-217',text=texts[217]['text'],x=((bb[0]+bb[1])/2-687)/20,y=((bb[2]+bb[3])/2+26)/20,alpha=alpha(annotation))
 states.append(dict(definition=definition,question=question,terms=active,answerAlpha={a['letter']:alpha(dp.get(a['depth']))for a in answerSpecs},bMove=0 if not b else (-309-b['matrix'][5])/1140,graphAlpha=graphAlpha,graph=graph,annotation=annotation,coordinateXEmphasis=any(p['characterId']==218 for p in row),coordinateYEmphasis=any(p['characterId']==219 for p in row),coordinateYFinalEmphasis=any(p['characterId']==221 for p in row),answerEmphasis=any(p['characterId']==223 for p in row)))
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],graph=dict(viewBox=[-355,-140,300,300],sourceOrigin=[-224.8,20.15],sourceLine=[[-334.25,-72.6],[-132.75,128.1]],paths=paths,labels=labels,scope='Exact source drawing paths and transformed glyph centers. Native typography still requires product/browser inspection.'),answers=answerSpecs,branches=branches,visualStates=spans(states),completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,13]},nativeDisposition={'outlined220':'Native emphasis on the y-coordinate -1 in (0,-1); source shape220 and character221 share meaning.','outlined222':'Native emphasis on retained B answer negative1; source shape222 and character223 share meaning.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(completeTextFrames=result['completeTextFrames'],spans=len(result['visualStates']),graphShapes=len(paths),graphLabels=len(labels),branches=[{k:b[k]for k in['spriteId','title','closeFirst','naturallySelected']if k in b}for b in branches],registered=False)))
