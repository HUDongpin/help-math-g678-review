"""Compact native graph/math bindings from exact P059/P060 display lists."""
from pathlib import Path
import json,sys,re,hashlib,xml.etree.ElementTree as E
sys.path.insert(0,str(Path(__file__).resolve().parent/'lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,box
R=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6p5960a1');O=R/'output/g678-alg-l07-p059-p060-integration-20261006-v1'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
def put(p,data):
 b=(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n').encode()
 if '--write'in sys.argv:p.write_bytes(b)
 elif p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)

for n in[59,60]:
 B=R/f'migrations/shared-alg001-l07-p0{n}';X=D/B.name;v=SourceVisual(X);m=v.m;c=v.c
 a=json.loads((O/f'p0{n}-source-structure-audit-v1.json').read_text());graphs=[];mathRoles=[]
 T=lambda id:dict(characterId=id,sourceTextId=f'character-{id}',text=next(t['text']for t in m['texts']if t['characterId']==id))
 def graph(key,sid,frame,depths,pathSelections=None):
  row=v.by[f'sprite-{sid}']['frames'][frame-1];rr=[p for p in row if p['depth']in depths];assert len(rr)==len(depths)
  bounds=[];shapes=[];labels=[];pins=[]
  for p in rr:
   id=p['characterId'];aa,bb,cc,dd,ee,ff=p['matrix'];assert bb==cc==0
   if id in v.bounds:
    file=X/f'source-v1/ffdec/shapes/{id}.svg';nodes=list(E.parse(file).getroot().iter('{http://www.w3.org/2000/svg}path'));indices=(pathSelections or{}).get(p['depth'],list(range(len(nodes))));paths=[]
    for index in indices:
     path={k:z for k,z in nodes[index].attrib.items()if k in['d','fill','fill-rule','stroke','stroke-width','fill-opacity','stroke-opacity']}
     # FFDec's paths here contain absolute M/L/Q only. Control-point hull is a conservative bound.
     assert set(re.findall(r'[A-Za-z]',path['d']))<={'M','L','Q','Z'}
     nums=[float(z)for z in re.findall(r'-?\d+(?:\.\d+)?',path['d'])];assert len(nums)%2==0
     points=[(aa*x+ee/20,dd*y+ff/20)for x,y in zip(nums[::2],nums[1::2])]
     bounds.extend(points);paths.append(path)
    shapes.append(dict(characterId=id,sourceDepth=p['depth'],sourcePathIndices=indices,matrix=[aa,bb,cc,dd,ee/20,ff/20],paths=paths));pins.append(pin(file))
   else:
    t=v.texts[id];tx=ty=0
    for run in t['runs']:
     if run['changed']['xOffset']:tx=run['xOffsetTwips']
     if run['changed']['yOffset']:ty=run['yOffsetTwips']
     x=(ee+aa*(t['matrix'][4]+tx))/20;y=(ff+dd*(t['matrix'][5]+ty))/20;size=dd*run['fontHeightTwips']/20
     labels.append(dict(characterId=id,sourceTextId=t['sourceTextId'],text=run['text'],x=x,y=y,fontSize=size,sourceDepth=p['depth']))
     tx+=sum(g['advanceTwips']for g in run['glyphs'])
    b=box(t['boundsTwips'],p);bounds.extend([(b[0]/20,b[2]/20),(b[1]/20,b[3]/20)])
  left=min(x for x,y in bounds)-8;top=min(y for x,y in bounds)-8;right=max(x for x,y in bounds)+8;bottom=max(y for x,y in bounds)+8
  for s in shapes:s['matrix'][4]-=left;s['matrix'][5]-=top
  for t in labels:t['x']-=left;t['y']-=top
  g=dict(key=key,sourceSpriteId=sid,sourceFrame=frame,sourceDepths=depths,viewBox=[0,0,right-left,bottom-top],shapes=shapes,labels=labels,sourceFiles=list({p['path']:p for p in pins}.values()));graphs.append(g);return key
 def equation(id,radical=None):
  t=v.texts[id];runs=t['runs']
  if radical:
   assert re.sub(r'\s','',t['text'])in['y=x','Y=x'];out=dict(kind='root',prefix=t['text'][0]+' = ',radicand='x',sourceIds=[id],sourceShape=radical)
  elif len(runs)==2 and runs[1]['yOffsetTwips']<runs[0]['yOffsetTwips'] and runs[1]['fontHeightTwips']<runs[0]['fontHeightTwips']:
   assert runs[1]['text']in['2','3'];out=dict(kind='power',base=runs[0]['text'],exponent=runs[1]['text'],sourceIds=[id])
  else:out=dict(kind='plain',text=t['text'],sourceIds=[id])
  mathRoles.append(out);return out
 def fractions(prefix,upper,lower,equal,shape):
  top=re.split(r'\s{2,}',v.texts[upper]['text'].strip());bottom=re.split(r'\s{2,}',v.texts[lower]['text'].strip());assert len(top)==len(bottom)
  out=dict(kind='fractions',prefix=v.texts[prefix]['text'],fractions=[dict(numerator=a,denominator=b)for a,b in zip(top,bottom)],sourceIds=[prefix,upper,lower,*([equal]if equal else[])],sourceShape=shape);mathRoles.append(out);return out
 answers=[dict(**{k:b[k]for k in['letter','instance','characterId','labelId','valueId']},equation=equation(b['valueId'],dict(characterId=153,pathIndices=[0,1])if n==59 and b['letter']=='C'else None))for b in a['answerBinding']]
 if n==59:
  specs=[('square',list(range(18,34)),240,239,None),('cube',list(range(38,54)),251,239,None),('root',list(range(58,74)),255,254,dict(characterId=261,pathIndices=[1,2])),('line',list(range(78,93))+[94],259,258,None)]
  cards=[]
  for key,depths,eid,cid,radical in specs:
   k=graph(key,265,15,depths,{94:[0]}if key=='line'else None);cards.append(dict(graph=k,equation=equation(eid,radical),caption=T(cid)))
  graph('help-linear',296,1,list(range(16,31))+[35],{35:[0]})
  graph('help-car',296,1,list(range(35,53)),{35:list(range(1,7))})
  steps=[dict(number=1,numberIds=[25,26],textIds=[162],helperId=None),dict(number=2,numberIds=[22],textIds=[206,207],helperId=None),dict(number=3,numberIds=[23],textIds=list(range(210,217)),helperId=230),dict(number=4,numberIds=[24,233],textIds=list(range(235,239)),helperId=265,graphs=cards)]
  help=dict(spriteId=296,textIds=[273,274],examples=[dict(textIds=[275],graph='help-linear'),dict(textIds=[276],graph='help-car')])
  mainGraph=None
 else:
  graph('question-account',358,c['quiz'],list(range(209,227)))
  graph('help-slope',342,1,list(range(23,44))+[47],{23:list(range(1,7))})
  eq3=fractions(273,274,275,276,272);eq4=fractions(298,299,300,301,297);eqHelp=fractions(316,317,318,None,319)
  assert[(p['numerator'],p['denominator'])for p in eq3['fractions']]==[('vertical change','horizontal change'),('80 – 20','10 – 0'),('60','10'),('6','1')]
  assert[(p['numerator'],p['denominator'])for p in eq4['fractions']]==[('vertical change','horizontal change'),('140 – 20','20 – 0'),('120','20'),('6','1')]
  steps=[dict(number=1,numberIds=[28,29],textIds=[217],helperId=None),dict(number=2,numberIds=[25],textIds=[259,260],helperId=None),dict(number=3,numberIds=[26],textIds=list(range(264,271)),helperId=289,equation=eq3,afterIds=[271]),dict(number=4,numberIds=[27,292],textIds=list(range(293,297)),helperId=302,equation=eq4)]
  help=dict(spriteId=342,textIds=list(range(310,315)),equation=eqHelp,afterIds=[315],examples=[dict(textIds=[],graph='help-slope')]);mainGraph='question-account'
 ids={16,*[a['valueId']for a in answers],*[i for s in steps for i in s['textIds']+s.get('afterIds',[])],*help['textIds'],*help.get('afterIds',[]),*[i for e in help['examples']for i in e['textIds']]}
 ids.update(i for s in steps for i in s['numberIds'])
 ids.update(i for e in mathRoles for i in e['sourceIds'])
 ids.update(card['caption']['characterId']for s in steps for card in s.get('graphs',[]))
 visual=[];main=v.main['frames'];questionFinal=next(p for p in main[-1]if p['characterId']==16)['matrix'][5]
 for row in main:
  find=lambda id:next((p for p in row if p['characterId']==id),None)
  answerValues={a['letter']:min(alpha(find(a['labelId'])),alpha(find(a['valueId'])))for a in answers}
  answerMove={a['letter']:(find(a['valueId'])['matrix'][5]-next(p for p in main[c['quiz']-1]if p['characterId']==a['valueId'])['matrix'][5])/20 if find(a['valueId'])else 0 for a in answers}
  visual.append(dict(questionAlpha=alpha(find(16)),questionOffset=(find(16)['matrix'][5]-questionFinal)/20 if find(16)else 0,textAlpha={str(id):alpha(find(id))for id in ids},answerAlpha=answerValues,answerOffset=answerMove,graphAlpha=alpha(find(192))if n==60 else 0,graphOffset=(find(192)['matrix'][5]+1908)/20 if n==60 and find(192)else 0))
 assert visual[-1]['answerAlpha']=={l:int(l==c['correct'])for l in'ABCD'}
 helpers={str(s['helperId']):spans([{str(id):max([alpha(p)for p in row if p['characterId']==id],default=0)for id in ids}for row in v.by[f'sprite-{s["helperId"]}']['frames']])for s in steps if s['helperId']}
 branches=[]
 for b in a['branches']:
  timeline=v.by[f'sprite-{b["spriteId"]}'];tids=sorted({p['characterId']for row in timeline['frames']for p in row if p['characterId']in v.texts});titles={v.texts[id]['text']for id in tids};assert len(titles)==1
  branches.append(dict(**b,title=next(iter(titles)),titleIds=tids,titleAlpha=spans([max([alpha(p)for p in row if p['characterId']in tids],default=0)for row in timeline['frames']])))
 model=dict(page=n,animationId=m['animationId'],sourceSha256=m['source']['sha256'],mainSpriteId=c['main'],mainFrameCount=c['last'],quizFrame=c['quiz'],behavior=dict(**m['behavior'],ending=a['main']['ending']),texts=[T(id)for id in sorted(ids)],question=T(16),answers=answers,steps=steps,help=help,mainGraph=mainGraph,graphs=graphs,visualStates=spans(visual),helperStates=helpers,branches=branches)
 put(B/'native-v1/presentation-model-v1.json',model)
 put(B/'audit-v1/native-math-roles-v1.json',dict(page=n,graphs=[{k:g[k]for k in['key','sourceSpriteId','sourceFrame','sourceDepths','sourceFiles']}for g in graphs],math=mathRoles,dispositions=['P059 shape261 paths1/2 are the C square-root sign; path0 is the D graph line. Native radical bound separately.','P059 shape278 path0 belongs to left help graph; paths1..6 belong to car graph.','P060 shape319 path0 is the fraction bar; paths1..6 belong to graph. Native fraction replaces the bar at its source semantic role.'],sourceOnly=True,originalRuntimeAccepted=False))
 print(json.dumps(dict(page=n,graphs=len(graphs),labels=sum(len(g['labels'])for g in graphs),math=len(mathRoles),visualSpans=len(model['visualStates']))))
