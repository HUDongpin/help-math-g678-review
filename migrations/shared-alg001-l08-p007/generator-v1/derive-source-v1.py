from pathlib import Path
import json,hashlib
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p007';D=Path('/Volumes/American Dream/.g6l8p7a1/source-extraction-v1');O=R/'output/g678-alg-l08-p007-integration-20261006-v1';read=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
pre=read(O/'source-entry-preflight-v1.json')
for s in pre['sources']:assert sha(Path(s['source']).read_bytes())==sha((R/s['copy']).read_bytes())==s['sha256']
c=read(D/'source-text-catalog-v1.json');frames=read(D/'source-frames-v1.json');timelines=[dict(**t,frames=frames[t['timelineId']])for t in c['timelines']];main=next(t for t in timelines if t['timelineId']=='sprite-206');assert main['declaredFrameCount']==235
assert [e['frame']for e in main['events']if e['kind']=='action-bytes']==[101,102]
scripts={str(p.relative_to(D/'ffdec/scripts')):p.read_text()for p in sorted((D/'ffdec/scripts').rglob('*.as'))}
assert scripts['DefineSprite_206/frame_101/DoAction.as'].strip()=='stop();\n_global.quizSection = true;\n_global.quizTryCount = 0;'
assert not scripts['DefineSprite_206/frame_102/DoAction.as'].strip()
def ranges(id,domain='sprite-206'):
 out=[]
 for i,ps in enumerate(frames[domain]):
  if any(p['characterId']==id for p in ps):
   if out and out[-1][1]==i:out[-1][1]=i+1
   else:out.append([i+1,i+1])
 return out
named={p['name']['text']:p for p in main['frames'][100]if 'name'in p}
assert {i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)}=={1:56,2:56,3:56,4:57}
branches=[dict(spriteId=197,kind='wrong',index=1,hold=20,close=194,closeChild=196,closeJump=21,terminal=29),dict(spriteId=182,kind='wrong',index=2,hold=22,close=171,closeChild=173,closeJump=23,terminal=28),dict(spriteId=151,kind='wrong',index=3,hold=21,close=143,closeChild=147,closeJump=22,terminal=28),dict(spriteId=82,kind='right',index=1,terminal=27),dict(spriteId=99,kind='right',index=2,terminal=28),dict(spriteId=111,kind='right',index=3,terminal=25),dict(spriteId=125,kind='right',index=4,terminal=32)]
for b in branches:
 sid=b['spriteId'];assert named[f"Mc_{b['kind'].title()}_Feed{b['index']}"]['characterId']==sid
 terminal=scripts[f"DefineSprite_{sid}/frame_{b['terminal']}/DoAction.as"];assert '_parent.play();'in terminal
 ids={p['characterId']for ps in frames[f'sprite-{sid}']for p in ps};titles=[t for t in c['textDefinitions']if t['characterId']in ids and t.get('runs')];title=''.join(r['text']for r in titles[0]['runs']);assert all(''.join(r['text']for r in t['runs'])==title for t in titles);b.update(title=title,titleIds=[t['characterId']for t in titles])
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal and '_global.quizTryCount = 0;'in terminal
  rr=ranges(b['closeChild'],f'sprite-{sid}');assert rr==[[{197:13,182:15,151:14}[sid],b['hold']]];b.update(closeFirst=rr[0][0],closeRanges=rr)
  assert f"_parent.gotoAndPlay({b['closeJump']});"in scripts[f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as"]
keys=['Linear equation','Equation','Graph','Line'];glossary=[]
for id,term in zip([14,15,16,17],keys):
 s=scripts[f'DefineButton2_{id}/BUTTONCONDACTION on(release).as'];assert f'_global.KeyAttribute = "{term}";'in s and '_root.DoHyperLinks();'in s and '_root.animation_mc.animation.stop();'in s;glossary.append(dict(term=term,characterId=id,frameRanges=ranges(id),script=pin(D/f'ffdec/scripts/DefineButton2_{id}/BUTTONCONDACTION on(release).as')))
hostOld=read(R/'migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json');host={k:hostOld['inputs'][v]for k,v in [('swf','hostSwf'),('frame35','hostFrame35ActionScript'),('frame49','hostFrame49ActionScript')]}
for p in host.values():assert sha((R/p['path']).read_bytes())==p['sha256']
h=(R/host['frame35']['path']).read_text()
for token in ['function showWrongFeed()','random(3)','function showRightFeed()','random(4)','gotoAndPlay(2)']:assert token in h
assert 'HELP_COURSES/ALG001/ALG001.jpg'in(M/'source-v1/index.xml').read_text()
model=dict(schemaVersion=1,animationId=M.name,source=pin(Path(pre['sources'][0]['source'])),placement=pre['placement'],xml=pin(M/'source-v1/index.xml'),stage=dict(width=800,height=600),fps=12,rootFrameCount=10,rootBeginFrame=6,rootMainMatrix=[1,0,0,1,8248,5666],mainSpriteId=206,mainFrameCount=235,quizFrame=101,postQuizFrame=102,correctAnswer=4,answerCharacters={i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)},answerLetters={'4':'A','1':'B','3':'C','2':'D'},title='Graphing Linear Equations: Vocabulary',titleSourceShapeId=8,branches=branches,conditionalHost=dict(**host,historicalLaunchObserved=False,selection='random3+1 wrong / random4+1 right; x5; gotoAndPlay2; exact named instances present'),behavior=dict(wrongIncrement='feedback-terminal-after-close-exit',wrongFirst='Choose the graph that is a straight line. Try again.',wrongLater='Choose the graph that is a straight line.',end='ordinary235-to1 wrap; next101 resets quiz',replay='full modern page reset; independent original-host acceptance',loopDoesNotCompleteLesson=True),glossary=glossary,texts=[dict(**t,text=''.join(r['text']for r in t['runs'])if'runs'in t else t.get('initialText'),mainFrameRanges=ranges(t['characterId']))for t in c['textDefinitions']],timelines=timelines,rawInputs=[pin(D/n)for n in ['source.xml','movie.xml','source-text-catalog-v1.json','source-frames-v1.json']]+[pin(p)for p in sorted((D/'ffdec/scripts').rglob('*.as'))],sourceVisualReview=[pin(D/n)for n in ['title-png/8.png','source-keyframes/white-101.png','source-keyframes/white-235.png']],notes=['Wrong1 hidden frame1 also calls _parent.enableButton(); no such function is defined in this page. NMHBtn is never placed; no additional Help control is invented.','Source equations are A:y=2x+1, B:y=sqrt(x)-2, C:y=x^2+1, D:y=x^3. Text run superscripts and radical shape were visually inspected.','D upper-axis labels are negative in the shipped drawing; retain authored signs and polygonal graph geometry without inferred correction.','Source raw ADPCM111 is byte-identical to L7P059; original timing and listening remain unaccepted.'],originalRuntimeAccepted=False,registryModified=False)
p=M/'native-v1/source-model-v1.json';b=(json.dumps(model,separators=(',',':'))+'\n').encode()
if p.exists():assert p.read_bytes()==b
else:p.open('xb').write(b)
print(json.dumps(dict(pass_=True,timelines=len(timelines),branches=branches,main=206,frameCount=235,quiz=101,correctAnswer=4,bytes=len(b))))
