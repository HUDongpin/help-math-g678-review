from pathlib import Path
import json,hashlib,sys
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p020';D=Path('/Volumes/American Dream/.g6l8p20a1/source-extraction-v1');O=R/'output/g678-alg-l08-p020-integration-20261006-v1';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text())
def pin(p):b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
pre=read(O/'source-entry-preflight-v1.json')
for s in pre['sources']:assert sha(Path(s['source']).read_bytes())==sha((R/s['copy']).read_bytes())==s['sha256']
c=read(D/'source-text-catalog-v1.json');frames=read(D/'source-frames-v1.json');assert not c['unparsedTags'];timelines=[dict(**t,frames=frames[t['timelineId']])for t in c['timelines']];main=next(t for t in timelines if t['timelineId']=='sprite-186');assert main['declaredFrameCount']==172
assert [e['frame']for e in main['events']if e['kind']=='action-bytes']==[49,50]
scripts={str(p.relative_to(D/'ffdec/scripts')):p.read_text()for p in sorted((D/'ffdec/scripts').rglob('*.as'))};assert len(scripts)==39
assert scripts['DefineSprite_186/frame_49/DoAction.as'].strip()=='stop();\n_global.quizSection = true;\n_global.quizTryCount = 0;'
assert scripts['DefineSprite_186/frame_50/DoAction.as'].strip()=='_global.quizSection = false;'
def ranges(id,domain='sprite-186'):
 out=[]
 for i,ps in enumerate(frames[domain]):
  if any(p['characterId']==id for p in ps):
   if out and out[-1][1]==i:out[-1][1]=i+1
   else:out.append([i+1,i+1])
 return out
named={p['name']['text']:p for p in main['frames'][48]if'name'in p};assert {i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)}=={1:181,2:182,3:181,4:181}
wrongFirst='Choose the equation with one y-term, one x-term, and one constant term. Try again.';wrongLater='Choose the equation with one y-term, one x-term, and one constant term. '
wrong=scripts['DefineButton2_181/BUTTONCONDACTION on(release).as'];assert '_global.quizTryCount == 1'in wrong and wrongFirst in wrong and wrongLater in wrong and '_root.disableQuizButton();'in wrong and '_root.showWrongFeed();'in wrong
assert scripts['DefineButton2_182/BUTTONCONDACTION on(release).as'].strip()=='on(release){\n   _root.disableQuizButton();\n   _root.showRightFeed();\n}'
branches=[dict(spriteId=165,kind='wrong',index=1,hold=23,close=160,closeChild=162,closeJump=24,closeFirst=16,terminal=29,dynamicTextId=161),dict(spriteId=180,kind='wrong',index=2,hold=20,close=174,closeChild=177,closeJump=21,closeFirst=13,terminal=28,dynamicTextId=176),dict(spriteId=151,kind='wrong',index=3,hold=22,close=143,closeChild=147,closeJump=23,closeFirst=16,terminal=31,dynamicTextId=146),dict(spriteId=82,kind='right',index=1,terminal=25),dict(spriteId=123,kind='right',index=2,terminal=27),dict(spriteId=50,kind='right',index=3,terminal=31),dict(spriteId=115,kind='right',index=4,terminal=27)]
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
keys=['Linear equation','Equation'];glossary=[]
for id,term in zip([8,9],keys):
 s=scripts[f'DefineButton2_{id}/BUTTONCONDACTION on(release).as'];assert f'_global.KeyAttribute = "{term}";'in s and '_root.DoHyperLinks();'in s and '_root.animation_mc.animation.stop();'in s;glossary.append(dict(term=term,characterId=id,frameRanges=ranges(id),script=pin(D/f'ffdec/scripts/DefineButton2_{id}/BUTTONCONDACTION on(release).as')))
hostOld=read(R/'migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json');host={k:hostOld['inputs'][v]for k,v in [('swf','hostSwf'),('frame35','hostFrame35ActionScript'),('frame49','hostFrame49ActionScript')]}
for p in host.values():assert sha((R/p['path']).read_bytes())==p['sha256']
h=(R/host['frame35']['path']).read_text()
for token in ['function showWrongFeed()','random(3)','function showRightFeed()','random(4)','gotoAndPlay(2)','function disableQuizButton()','function enableQuizButton()']:assert token in h
assert 'HELP_COURSES/ALG001/ALG001.jpg'in(M/'source-v1/index.xml').read_text()
model=dict(schemaVersion=1,animationId=M.name,source=pin(Path(pre['sources'][0]['source'])),placement=pre['placement'],xml=pin(M/'source-v1/index.xml'),stage=dict(width=800,height=600),fps=12,rootFrameCount=10,rootBeginFrame=6,rootMainMatrix=[1,0,0,1,8248,5666],mainSpriteId=186,mainFrameCount=172,quizFrame=49,postQuizFrame=50,correctAnswer=2,answerCharacters={i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)},answerLetters={'1':'A','2':'B','3':'C','4':'D'},title='Graphing Linear Equations: Instruction',titleSourceShapeId=1,branches=branches,conditionalHost=dict(**host,historicalLaunchObserved=False,selection='random3+1 wrong / random4+1 right; x5; gotoAndPlay2; exact named instances present'),behavior=dict(wrongIncrement='feedback-terminal-after-close-exit',wrongFirst=wrongFirst,wrongLater=wrongLater,end='ordinary172-to1 wrap; next49 resets quiz',replay='full modern page reset; independent original-host acceptance',loopDoesNotCompleteLesson=True),glossary=glossary,texts=[dict(**t,text=''.join(r['text']for r in t['runs'])if'runs'in t else t.get('initialText'),mainFrameRanges=ranges(t['characterId']))for t in c['textDefinitions']],timelines=timelines,rawInputs=[pin(D/n)for n in ['source.xml','movie.xml','source-text-catalog-v1.json','source-frames-v1.json']]+[pin(p)for p in sorted((D/'ffdec/scripts').rglob('*.as'))],sourceVisualReview=[pin(D/'source-inspection-contact-v1.jpg')],notes=['Wrong1 frame1 calls undefined _parent.enableButton; NMHBtn is not placed. No invented help or host success is asserted.','A uses a smaller raised 2 in y=2x²+1; D is y=1/x+3, with source numerator/denominator and rule retained. B y=x+5 is the sole authored right button.','Feedback titles and exact branch windows/audio are source-bound; decorative mascot/morph/bitmap effects are retained in extraction and remain outside native semantic presentation fidelity claims.','Nonzero bytes after End in sprite50 retained verbatim in SWF and both tool XML; no invented script or reachable frame beyond31.'],risks=c['risks'],lane='advanced-manual: source-specific native equation presentation using audited shared looping-quiz lifecycle; no shared behavior changes',originalRuntimeAccepted=False,registryModified=False)
p=M/'native-v1/source-model-v1.json';b=(json.dumps(model,separators=(',',':'))+'\n').encode()
if p.exists():assert p.read_bytes()==b
else:p.open('xb').write(b)
print(json.dumps(dict(pass_=True,timelines=len(timelines),sourceScripts=len(scripts),branches=branches,main=186,frameCount=172,quiz=49,correctAnswer=2,bytes=len(b))))
