from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
by={t['timelineId']:t for t in m['timelines']};main=by['sprite-366'];helpRow=by['sprite-188']['frames'][0]
texts={t['characterId']:{**t,'text':''.join(r['text']for r in t.get('runs',[]))}for t in m['texts']};ns='{http://www.w3.org/2000/svg}'
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,c,d,e,x,y=p['matrix'];q=[(a*u+d*v+x,c*u+e*v+y)for u in[b['left'],b['right']]for v in[b['top'],b['bottom']]];return[min(u for u,v in q),max(u for u,v in q),min(v for u,v in q),max(v for u,v in q)]
def pathBox(paths,p):
 points=[]
 for a in paths:
  assert set(re.findall(r'[A-Za-z]',a['d']))<=set('MLQZ')
  n=[float(v)for v in re.findall(r'-?\d+(?:\.\d+)?',a['d'])];assert len(n)%2==0;points.extend((n[i]*20,n[i+1]*20)for i in range(0,len(n),2))
 return box(dict(left=min(x for x,y in points),right=max(x for x,y in points),top=min(y for x,y in points),bottom=max(y for x,y in points)),p)
def spans(vs):
 out=[]
 for f,v in enumerate(vs,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def shape(id,p,morph=False):
 file=B/f"source-v1/ffdec/{'morphshapes'if morph else'shapes'}/{id}.svg";paths=[]
 for e in E.parse(file).getroot().iter(ns+'path'):
  attrs={k:v for k,v in e.attrib.items()if not k.startswith('{')};assert not any('url('in v for v in attrs.values())
  end={}
  for anim in e.findall(ns+'animate'):
   a,z=anim.get('values').split(';');k=anim.get('attributeName');assert k in['d','stroke','stroke-width','fill-opacity'];assert attrs.get(k,a)==a
   if a!=z:end[k]=z
  paths.append(dict(**attrs,**({'end':end}if end else{})))
 assert paths
 return dict(sourceShapeId=id,sourceSvgSha256=sha(file.read_bytes()),matrix=p['matrix'],paths=paths)
answers=[]
for i,(letter,instance,button,label,grid,curve,depths)in enumerate([
 ('A','AnsBtn1',212,52,201,202,[*range(27,39),40,41]),('B','AnsBtn4',213,37,204,205,[*range(53,65),66,67]),
 ('C','AnsBtn3',213,60,207,208,[*range(79,91),92,93]),('D','AnsBtn2',214,49,210,211,[*range(105,117),118,119])],1):
 bind=next(a for a in m['answerBindings']if a['letter']==letter);assert(bind['instance'],bind['button'],bind['label'])==(instance,button,label)
 answers.append(dict(answer=i,letter=letter,instance=instance,characterId=button,letterId=label,grid=grid,curve=curve,labelDepths=depths,wrongFirst=bind.get('message','')+' Try again.'if not bind.get('correct')else None,wrongLater=bind.get('message')))
graphs=[]
for name,row,grid,curve,depths in [(a['letter'],main['frames'][60],a['grid'],a['curve'],a['labelDepths'])for a in answers]+[('help-function',helpRow,153,179,list(range(32,65))),('help-linear',helpRow,143,150,[*range(16,28),29,30])]:
 pp=[shape(id,next(p for p in row if p['characterId']==id))for id in[grid,curve]];bb=pathBox(pp[0]['paths'],dict(matrix=pp[0]['matrix']));cb=pathBox(pp[1]['paths'],dict(matrix=pp[1]['matrix']))
 assert .8<(bb[1]-bb[0])/(bb[3]-bb[2])<1.2,(name,bb)
 assert cb[0]>=bb[0]-60 and cb[1]<=bb[1]+60 and cb[2]>=bb[2]-60 and cb[3]<=bb[3]+60,(name,bb,cb)
 labels=[]
 for depth in depths:
  p=next(p for p in row if p['depth']==depth);t=texts[p['characterId']];q=box(t['boundsTwips'],p);labels.append(dict(depth=depth,sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],text=t['text'],x=(q[0]+q[1])/2,y=(q[2]+q[3])/2))
 assert len(labels)==(33 if name=='help-function'else 14)
 graphs.append(dict(name=name,viewBox=[bb[0]-400,bb[2]-400,bb[1]-bb[0]+800,bb[3]-bb[2]+800],gridBounds=bb,curveBounds=cb,paths=pp,labels=labels))
# Preserve source morph363: the yellow vertical-line highlight grows upward.
overlays=[shape(id,next(p for p in main['frames'][235 if id!=365 else 248]if p['characterId']==id),id==363)for id in[363,364,365]]
assert overlays[0]['paths'][0]['end']=={'stroke':'#ffff01','d':'M0.0 66.6 L0.0 -66.6'}
helpTexts=[]
for id in[134,135,136,139,140,141,142]:
 t=texts[id];runs=[];lastY=None;out=''
 for r in t['runs']:
  text=r['text'];newLine=lastY is not None and r['yOffsetTwips']!=lastY
  if newLine and out and not out[-1].isspace()and text and not text[0].isspace():text=' '+text
  runs.append(dict(text=text,sourceRunId=r['sourceTextId'],sourceLineY=r['yOffsetTwips'],linked=r['colorRgba'][:3]==[0,0,204]));out+=text;lastY=r['yOffsetTwips']
 helpTexts.append(dict(characterId=id,sourceTextId=t['sourceTextId'],text=out,runs=runs))
assert 'vertical line through a graph'in next(t['text']for t in helpTexts if t['characterId']==136)
branches=[dict(spriteId=280,kind='right',index=4,terminal=32),dict(spriteId=361,kind='wrong',index=4,child=357,hold=21,close=355,closeJump=22,terminal=28)]
root=next(p for p in by['root']['frames'][5]if p['characterId']==366)
for b in branches:
 t=by[f"sprite-{b['spriteId']}"];ids=sorted({p['characterId']for r in t['frames']for p in r if p['characterId']in texts and texts[p['characterId']]['text']});titles={texts[id]['text']for id in ids};assert len(titles)==1
 if b['kind']=='wrong':
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==357 for p in r)for r in t['frames']])if s['value']];assert ranges==[[14,21]];b.update(closeFirst=14,closeRanges=ranges)
 parent=next(p for p in main['frames'][60]if p['characterId']==b['spriteId']);vis=[]
 for r in t['frames']:
  aa=[]
  for p in r:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p)
    for p2 in[parent,root]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),p2)
    if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 b.update(title=next(iter(titles)),titleIds=ids,titleAlpha=spans(vis),naturallySelected=True)
states=[]
for f,row in enumerate(main['frames'],1):
 assert not any(p.get('clipDepth')for p in row);ps={p['characterId']:p for p in row};terms=[term for id,term in[(197,'Graph'),(196,'Linear function')]if alpha(ps.get(id))>0]
 flash=[]
 for p in row:
  if p['characterId']==362:
   cx=243+p['matrix'][4];cy=-2456+p['matrix'][5]
   distances=[((cx-next(q for q in row if q['characterId']==a['letterId'])['matrix'][4])**2+(cy-next(q for q in row if q['characterId']==a['letterId'])['matrix'][5])**2,a['letter'])for a in answers]
   distance,letter=min(distances);assert distance<100000;flash.append(letter)
 overlaysAt=[dict(sourceShapeId=p['characterId'],ratio=p.get('ratio',0),alpha=alpha(p))for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in[363,364,365]]
 dp=ps.get(210);dMove=0 if not dp else max(0,min(1,(dp['matrix'][4]+2891)/(-9199+2891)))
 states.append(dict(questionAlpha=alpha(ps.get(194)),questionOffset=(ps[194]['matrix'][5]+4012)/20 if 194 in ps else 0,terms=terms,termFlash=[term for id,term in[(198,'Graph'),(199,'Linear function')]if id in ps],choiceFlash=flash,answerAlpha={a['letter']:alpha(ps.get(a['grid']))for a in answers},answerOffset={a['letter']:(ps[a['grid']]['matrix'][5]-next(p for p in main['frames'][60]if p['characterId']==a['grid'])['matrix'][5])/20 if a['grid']in ps and f<62 else 0 for a in answers},overlays=overlaysAt,dMove=dMove))
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=branches,graphs=graphs,graphOverlays=overlays,helpTexts=helpTexts,helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<190)),visualStates=spans(states),question=texts[194]['text'],nativeDisposition={'graphs':'Four answer curves and two help curves retain exact source vector paths with native axis text; no analytical replacements.','layout':'Original two columns show A/C above B/D. Responsive narrow layout preserves reading order A,B,C,D. D source relocation329-337 becomes responsive single-card consolidation after other graphs fade333.','sourceLineBreaks':'Source136 has no encoded space at the line/through line break; native reflow inserts one space only at an authored baseline change between unspaced words.','highlight':'Source362 white flashes cover answer B/C letters, represented as choice-letter white emphasis. Source363 yellow upward morph and364 black line/365 yellow full line retain authored path, ratio and depth order.','feedback':'Only right280 and wrong361 are called. Close appears14 and may interrupt head14-20 or resume hold21; closes into22 and increments only at28. Decorative coach shapes use native feedback cards; all source drawings stay in private evidence.','question':'Source194 fades/slides2-9; overlay198/199 term flashes18/20/22 and33/35/37 retained.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(result['visualStates']),graphs=[dict(name=g['name'],labels=len(g['labels']))for g in graphs],branches=branches,choiceFlashSpans=[s for s in spans([s['choiceFlash']for s in states])if s['value']],helpTerms=result['helpTerms'])))
