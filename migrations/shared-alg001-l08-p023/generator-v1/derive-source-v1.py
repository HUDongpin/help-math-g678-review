from pathlib import Path
import json,hashlib,sys
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p023';D=Path('/Volumes/American Dream/.g6l8p23a1/source-extraction-v1');O=R/'output/g678-alg-l08-p023-integration-20261006-v1';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text())
def pin(p):b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
pre=read(O/'source-entry-preflight-v1.json')
for s in pre['sources']:assert sha(Path(s['source']).read_bytes())==sha((R/s['copy']).read_bytes())==s['sha256']
c=read(D/'source-text-catalog-v1.json');frames=read(D/'source-frames-v1.json');assert not c['unparsedTags'];timelines=[dict(**t,frames=frames[t['timelineId']])for t in c['timelines']];main=next(t for t in timelines if t['timelineId']=='sprite-203');assert main['declaredFrameCount']==385
assert [e['frame']for e in main['events']if e['kind']=='action-bytes']==[99,100]
scripts={str(p.relative_to(D/'ffdec/scripts')):p.read_text()for p in sorted((D/'ffdec/scripts').rglob('*.as'))};assert len(scripts)==39
assert scripts['DefineSprite_203/frame_99/DoAction.as'].strip()=='stop();\n_global.quizSection = true;\n_global.quizTryCount = 0;'
assert scripts['DefineSprite_203/frame_100/DoAction.as'].strip()=='_global.quizSection = false;'
def ranges(id,domain='sprite-203'):
 out=[]
 for i,ps in enumerate(frames[domain]):
  if any(p['characterId']==id for p in ps):
   if out and out[-1][1]==i:out[-1][1]=i+1
   else:out.append([i+1,i+1])
 return out
named={p['name']['text']:p for p in main['frames'][98]if'name'in p};assert {i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)}=={1:177,2:177,3:178,4:177}
wrongFirst='Rewrite the equation in slope-intercept form (y= mx + b) to make it easy to find. Try again.';wrongLater='Rewrite the equation in slope-intercept form (y= mx + b) to make it easy to find. '
wrong=scripts['DefineButton2_177/BUTTONCONDACTION on(release).as'];assert '_global.quizTryCount == 1'in wrong and wrongFirst in wrong and wrongLater in wrong and '_root.disableQuizButton();'in wrong and '_root.showWrongFeed();'in wrong
assert scripts['DefineButton2_178/BUTTONCONDACTION on(release).as'].strip()=='on(release){\n   _root.disableQuizButton();\n   _root.showRightFeed();\n}'
branches=[dict(spriteId=176,kind='wrong',index=1,hold=22,close=164,closeChild=167,closeJump=23,closeFirst=15,terminal=28,dynamicTextId=166),dict(spriteId=128,kind='wrong',index=2,hold=20,close=123,closeChild=127,closeJump=21,closeFirst=13,terminal=29,dynamicTextId=126),dict(spriteId=144,kind='wrong',index=3,hold=21,close=137,closeChild=140,closeJump=22,closeFirst=14,terminal=28,dynamicTextId=139),dict(spriteId=74,kind='right',index=1,terminal=27),dict(spriteId=90,kind='right',index=2,terminal=28),dict(spriteId=102,kind='right',index=3,terminal=25),dict(spriteId=49,kind='right',index=4,terminal=28)]
for b in branches:
 sid=b['spriteId'];assert named[f"Mc_{b['kind'].title()}_Feed{b['index']}"]['characterId']==sid
 terminal=scripts[f"DefineSprite_{sid}/frame_{b['terminal']}/DoAction.as"];assert '_parent.play();'in terminal and 'this.gotoAndStop(1);'in terminal
 ids={p['characterId']for ps in frames[f'sprite-{sid}']for p in ps};titles=[t for t in c['textDefinitions']if t['characterId']in ids and t.get('runs')];title=''.join(r['text']for r in titles[0]['runs']);assert all(''.join(r['text']for r in t['runs'])==title for t in titles);b.update(title=title,titleIds=[t['characterId']for t in titles])
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal and '_global.quizTryCount = 0;'in terminal
  assert ranges(b['closeChild'],f'sprite-{sid}')==[[b['closeFirst'],b['hold']]]
  assert scripts[f"DefineSprite_{sid}/frame_{b['hold']}/DoAction.as"].strip()=='stop();'
  close=scripts[f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as"];assert f"_parent.gotoAndPlay({b['closeJump']});"in close and 'i <= 4'in close and 'gotoAndStop(1)'in close
  assert scripts[f"DefineSprite_{b['closeChild']}/frame_1/DoAction.as"].strip()=='txtFeed.text = _global.WrongFeed;'
keys=['Linear equation','Slope'];glossary=[]
for id,term in zip([8,9],keys):
 s=scripts[f'DefineButton2_{id}/BUTTONCONDACTION on(release).as'];assert f'_global.KeyAttribute = "{term}";'in s and '_root.DoHyperLinks();'in s and '_root.animation_mc.animation.stop();'in s;glossary.append(dict(term=term,characterId=id,frameRanges=ranges(id),script=pin(D/f'ffdec/scripts/DefineButton2_{id}/BUTTONCONDACTION on(release).as')))
hostOld=read(R/'migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json');host={k:hostOld['inputs'][v]for k,v in [('swf','hostSwf'),('frame35','hostFrame35ActionScript'),('frame49','hostFrame49ActionScript')]}
for p in host.values():assert sha((R/p['path']).read_bytes())==p['sha256']
h=(R/host['frame35']['path']).read_text()
for token in ['function showWrongFeed()','random(3)','function showRightFeed()','random(4)','gotoAndPlay(2)','function disableQuizButton()','function enableQuizButton()']:assert token in h
assert 'HELP_COURSES/ALG001/ALG001.jpg'in(M/'source-v1/index.xml').read_text()
model=dict(schemaVersion=1,animationId=M.name,source=pin(Path(pre['sources'][0]['source'])),placement=pre['placement'],xml=pin(M/'source-v1/index.xml'),stage=dict(width=800,height=600),fps=12,rootFrameCount=10,rootBeginFrame=6,rootMainMatrix=[1,0,0,1,8248,5666],mainSpriteId=203,mainFrameCount=385,quizFrame=99,postQuizFrame=100,correctAnswer=3,answerCharacters={i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)},answerLetters={'1':'A','2':'B','3':'C','4':'D'},title='Graphing Linear Equations: Instruction',titleSourceShapeId=1,branches=branches,conditionalHost=dict(**host,historicalLaunchObserved=False,selection='random3+1 wrong / random4+1 right; x5; gotoAndPlay2; exact named instances present'),behavior=dict(wrongIncrement='feedback-terminal-after-close-exit',wrongFirst=wrongFirst,wrongLater=wrongLater,end='ordinary385-to1 wrap; next99 resets quiz',replay='full modern page reset; independent original-host acceptance',loopDoesNotCompleteLesson=True),glossary=glossary,texts=[dict(**t,text=''.join(r['text']for r in t['runs'])if'runs'in t else t.get('initialText'),mainFrameRanges=ranges(t['characterId']))for t in c['textDefinitions']],timelines=timelines,rawInputs=[pin(D/n)for n in ['source.xml','movie.xml','source-text-catalog-v1.json','source-frames-v1.json']]+[pin(p)for p in sorted((D/'ffdec/scripts').rglob('*.as'))],sourceVisualReview=[pin(M/'audit-v1/source-visual-review-v1.json'),pin(M/'audit-v1/source-behavior-review-v1.json')],notes=['Wrong1 frame1 calls undefined _parent.enableButton; NMHBtn is not placed. No invented help or host success is asserted.','A=-6,B=1,C=2,D=3. C is the sole authored right button. Main solution ends y=2x-1/3; preserve source fractions and glyph transforms.','Feedback titles and exact branch windows/audio are source-bound; decorative mascot/morph/bitmap effects are retained in extraction and remain outside native semantic presentation fidelity claims.','Nonzero bytes after End in sprite74 retained verbatim in SWF and both tool XML; no invented script or reachable frame beyond27.'],risks=c['risks'],lane='factory: compiler-assisted source extraction and maintained native equation/looping-quiz adapter; source-specific product calibration still pending',originalRuntimeAccepted=False,registryModified=False)
p=M/'native-v1/source-model-v1.json';b=(json.dumps(model,separators=(',',':'))+'\n').encode()
if p.exists():assert p.read_bytes()==b
else:p.open('xb').write(b)
print(json.dumps(dict(pass_=True,timelines=len(timelines),sourceScripts=len(scripts),branches=branches,main=203,frameCount=385,quiz=99,correctAnswer=3,bytes=len(b))))
