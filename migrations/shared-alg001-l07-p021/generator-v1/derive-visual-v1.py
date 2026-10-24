from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-215');texts={t['characterId']:{**t,'text':''.join(r['text']for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
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
# Source paths may carry geometry belonging to a different graph; bind each
# path to its actual source owner and assert alpha equality before grouping.
specs=[dict(answer=1,letter='A',instance='AnsBtn4',shape=30,letterId=32,paths=list(range(9)),curve=31,curvePaths=[0,1],rect=[-54.4,-52.85,127.75,127.75],origin=[9.1,11.65],depth=104,labelFirst=105),dict(answer=2,letter='B',instance='AnsBtn1',shape=23,letterId=29,paths=list(range(1,10)),curve=24,curvePaths=[0],rect=[-220.15,33.9,127.75,127.75],origin=[-156.65,98.4],depth=60,labelFirst=61),dict(answer=3,letter='C',instance='AnsBtn3',shape=13,letterId=27,paths=list(range(9)),curve=22,curvePaths=[0],rect=[110.8,-139.6,127.75,127.75],origin=[174.3,-75.1],depth=20,labelFirst=21),dict(answer=4,letter='D',instance='AnsBtn2',shape=22,letterId=25,paths=list(range(1,10)),curve=23,curvePaths=[0],rect=[110.85,33.9,127.75,127.75],origin=[174.35,98.4],depth=40,labelFirst=41)]
graphs=[];quiz={p['depth']:p for p in main['frames'][96]}
for g in specs:
 paths=[]
 for shape,indices in [(g['shape'],g['paths']),(g['curve'],g['curvePaths'])]:
  ps=list(E.parse(B/f'source-v1/ffdec/shapes/{shape}.svg').getroot().iter(ns+'path'))
  for i in indices:
   attrs={k:v for k,v in ps[i].attrib.items()if not k.startswith('{')}
   if ns+'x' in attrs:raise AssertionError('namespace')
   original=ps[i].get('{https://www.free-decompiler.com/flash}original-stroke-width')
   if original:attrs['stroke-width']=original
   paths.append(dict(sourceShapeId=shape,sourcePathIndex=i,attributes=attrs))
 gp=quiz[g['depth']];assert gp['matrix'][:4]==[1,0,0,1];labels=[]
 for j in range(14):
  p=quiz[g['labelFirst']+j];t=texts[p['characterId']];bb=box(t['boundsTwips'],p)
  labels.append(dict(text=t['text'],x=((bb[0]+bb[1])/2-gp['matrix'][4])/20,y=((bb[2]+bb[3])/2-gp['matrix'][5])/20,role=('x'if j<6 else 'y'if j<12 else 'axis')+'-'+str(j),sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceDepth=p['depth']))
 for row in main['frames']:
  dp={p['depth']:p for p in row};a=alpha(dp.get(g['depth']))
  owners=[p for p in row if p['characterId']==g['curve']];assert all(alpha(p)==a for p in owners),(g['letter'],'curve alpha')
  assert all(alpha(dp.get(g['labelFirst']+j))==a for j in range(14)),(g['letter'],'label alpha')
 x,y,w,h=g['rect'];graphs.append(dict(**g,sourcePaths=paths,labels=labels,svgSha256=sha((B/f"source-v1/ffdec/shapes/{g['shape']}.svg").read_bytes()),viewBox=[x-15,y-25,w+45,h+42],letterSourceTextId=texts[g['letterId']]['sourceTextId']))
assert sum(len(g['labels'])for g in graphs)==56
answers=[]
for g in graphs:
 p=next(p for p in m['namedAtQuiz']if p['name']==g['instance']);wrong=g['answer']!=1
 assert p['characterId']==(34 if wrong else 35)
 answers.append(dict(answer=g['answer'],letter=g['letter'],characterId=p['characterId'],instance=g['instance'],wrongLater=m['findings']['secondWrongText']if wrong else None,wrongFirst=m['findings']['wrongText']if wrong else None))
bs=[dict(spriteId=183,kind='wrong',index=1,child=180,hold=23,close=176,closeJump=24,terminal=29),dict(spriteId=198,kind='wrong',index=2,child=197,hold=20,close=195,closeJump=21,terminal=29),dict(spriteId=213,kind='wrong',index=3,child=209,hold=21,close=207,closeJump=22,terminal=28),dict(spriteId=101,kind='right',index=1,terminal=27),dict(spriteId=67,kind='right',index=2,terminal=25),dict(spriteId=137,kind='right',index=3,terminal=28),dict(spriteId=109,kind='right',index=4,terminal=27),dict(spriteId=158,kind='right',index=5,terminal=33)]
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix))
branches=[];rootPose=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==215)
for b in bs:
 t=next(t for t in m['timelines']if t['timelineId']=='sprite-'+str(b['spriteId']));assert len(t['frames'])==b['terminal']
 terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal
  assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();'
  assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  present=[any(p['characterId']==b['child']for p in row)for row in t['frames']];ranges=[[s['first'],s['last']]for s in spans(present)if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 ids=list(dict.fromkeys(p['characterId']for r in t['frames']for p in r if p['characterId']in texts and texts[p['characterId']].get('runs')));titles=[texts[i]['text']for i in ids];assert len(set(titles))==1,(b,titles)
 mp=next(p for p in main['frames'][96]if p['characterId']==b['spriteId']);vis=[]
 for row in t['frames']:
  aa=[]
  for p in row:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p)
    for parent in [mp,rootPose]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),parent)
    if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 branches.append(dict(**b,title=titles[0],titleIds=ids,titleAlpha=spans(vis),naturallySelected=b['index']<=4 if b['kind']=='right'else True))
states=[]
for row in main['frames']:
 dp={p['depth']:p for p in row};definition,question=[prefix(row,id)for id in[6,12]];visible=(definition+' '+question).lower();active=[g['term']for g in m['glossary']if any(p['characterId']==g['characterId']for p in row)and g['term'].lower()in visible];a=dp.get(104)
 states.append(dict(definition=definition,question=question,terms=active,graphAlpha={g['letter']:alpha(dp.get(g['depth']))for g in graphs},aPose=None if not a else a['matrix'],aMove=0 if not a else (a['matrix'][4]+3729)/2800,aScale=1 if not a else a['matrix'][0]))
streams=json.loads((B/'native-v1/streams-v1.json').read_text());ds=json.loads((B/'native-v1/decode-native-v1.json').read_text());assert ds['pass'];clocks=[]
for d in ds['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256']and s['decodedSamplesCandidate']==d['decodedSamples']
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=s['frameCount'],decoder=decoder,segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=215,mainFrameCount=154,quizFrame=97,postQuizFrame=98,correctAnswer=1,answerCharacters={str(a['answer']):a['characterId']for a in answers},answers=answers,behavior=dict(wrongIncrement='feedback-terminal-after-close-exit',end='ordinary154-to1 wrap; next97 resets quiz',replay='full modern page reset',loopDoesNotCompleteLesson=True),graphs=graphs,branches=branches,visualStates=spans(states),clocks=clocks,sa=sa,terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),sourceAxisNote='A upper y labels are positive6/4/2; B/C/D upper y labels are source negative6/4/2. Preserve per-placement source text.',sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in texts.values()],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
p=B/'native-v1/visual-model-v1.json';out=json.dumps(native,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print(json.dumps(dict(pass_=True,bytes=len(out.encode()),spans=len(native['visualStates']),branches=[{k:b[k]for k in ['spriteId','title','naturallySelected']}for b in branches],completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,12]},clocks=len(clocks))))
