from pathlib import Path
import json,hashlib,datetime,re,zlib,struct
R=Path.cwd();M=R/'migrations/shared-alg001-l07-p058';O=R/'output/g678-alg-l07-p058-integration-20261006-v1';C=json.loads((M/'audit-v1/source-custody-v1.json').read_text());cat=json.loads((M/'source-v1/source-text-catalog-v1.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
for p in C['sourceFiles']:
 assert pin(Path(p['source']))['sha256']==p['sha256']and pin(R/p['copy'])['sha256']==p['sha256']
assert cat['sourceSha256']=='fadcecb8a7769167e6b31b1f4d5090b89cf13407867af7163379517186f21e73'and len(cat['timelines'])==18 and not cat['unparsedTags'];ts={t['timelineId']:t for t in cat['timelines']};assert all(t['declaredFrameCount']==t['observedFrameCount']for t in ts.values())
scripts=[dict(file=pin(p),source=p.read_text())for p in sorted((M/'source-v1/ffdec/scripts').rglob('*.as'))];sw={p['file']['path'].split('ffdec/scripts/')[1]:p['source']for p in scripts}
squash=lambda s:re.sub(r'\s','',s)
def expect(p,s):assert squash(sw[p])==squash(s),p
expect('frame_1/DoAction.as','_level0.InternalPreloader.gotoAndPlay("jump_check");stop();');expect('frame_6/DoAction.as','stop();')
for f in [315,475,613,751]:
 tail=''if f<613 else f'Mc_box{1 if f==613 else 2}._visible=false;NMHBtn._visible=false;'
 expect(f'DefineSprite_311/frame_{f}/DoAction.as','stop();_root.animation_mc.animation.a_text._visible=false;_global.quizSection=true;'+tail)
expect('DefineSprite_311/frame_805/DoAction.as','stop();_global.quizSection=true;_global.quizTryCount=0;Mc_Popup._visible=false;');expect('DefineSprite_311/frame_806/DoAction.as','_global.quizSection=false;')
assert [p for p in sw if p.startswith('DefineSprite_311/frame_')and p.endswith('/DoAction.as')]==[f'DefineSprite_311/frame_{f}/DoAction.as'for f in [315,475,613,751,805,806]]
expect('DefineButton2_276/BUTTONCONDACTION on(release).as','on(release){_root.disableQuizButton();_root.showRightFeed();NMHBtn.enabled=false;}');expect('DefineButton2_277/BUTTONCONDACTION on(release).as','on(release){_root.disableQuizButton();_root.showWrongFeed();NMHBtn.enabled=false;}')
right=[(119,1,27),(60,2,25),(132,3,28),(94,4,27)];wrong=[(146,1,31),(175,2,28),(157,3,29)]
for sid,i,end in right:expect(f'DefineSprite_{sid}/frame_{end}/DoAction.as','stop();_root.disableQuizButton();_global.quizSection=false;_parent.play();this.gotoAndStop(1);')
for sid,i,end in wrong:expect(f'DefineSprite_{sid}/frame_{end}/DoAction.as','stop();_root.enableQuizButton();this.gotoAndStop(1);_global.quizTryCount++;if(_global.quizTryCount>=2){_global.quizTryCount=0;_global.quizSection=false;_parent.play();}')
expect('DefineButton2_255/BUTTONCONDACTION on(release).as','on(release){_global.quizSection=false;play();_parent.NMHBtn.enabled=true;}')
for sid in [256,273]:
 expect(f'DefineSprite_{sid}/frame_1/DoAction.as','stop();');expect(f'DefineSprite_{sid}/frame_15/DoAction.as','stop();');expect(f'DefineSprite_{sid}/frame_20/DoAction.as','_parent.NMHBtn.enabled=true;_parent.NMHBtn._visible=true;gotoAndStop(1);')
expect('DefineButton2_13/BUTTONCONDACTION on(release).as','on(release){NMHBtn.enabled=false;_root.disableQuizButton();Mc_Popup._visible=true;}')
expect('DefineButton2_279/BUTTONCONDACTION on(release).as','on(release){this._visible=false;_root.enableQuizButton();_parent.NMHBtn.enabled=true;}')
main=ts['sprite-311'];live={};named={};release=[]
for frame in range(1,823):
 for e in main['events']:
  if e['frame']!=frame:continue
  if e['kind']=='remove':live.pop(e['depth'],None)
  elif e['kind']=='place':
   live[e['depth']]={**(live.get(e['depth'],{})if e.get('move')else{}),**e}
   if'clipActions'in e:release.append(e)
 if frame in [1,315,475,613,751,805,806,822]:named[str(frame)]=[p for p in live.values()if p.get('name')]
assert {p['name']['text']:p['characterId']for p in named['805'] if p['name']['text'].startswith('AnsBtn')}=={'AnsBtn1':276,'AnsBtn2':277,'AnsBtn3':277,'AnsBtn4':277}
text=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r.get('text','')for r in t.get('runs',[])),runs=t.get('runs'),sourceTagSha256=t['sourceTagSha256'])for t in cat['textDefinitions']]
old=json.loads((R/'migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json').read_text());hp=[]
for k in ['hostSwf','hostFrame35ActionScript','hostFrame49ActionScript']:
 p=old['inputs'][k];assert pin(Path(p['path'])if Path(p['path']).is_absolute()else R/p['path'])==p;hp.append(p)
h=(R/hp[1]['path']).read_text();assert all(s in h for s in ['function showWrongFeed()','intMc_Name = random(3);','function showRightFeed()','intMc_Name = random(4);','gotoAndPlay(2);','_root.animation_mc.animation.NMHBtn.enabled = true;'])
result=dict(kind='alg-l07-p058-source-structure-audit-v1',at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source=C,sourceCatalog=pin(M/'source-v1/source-text-catalog-v1.json'),timelineCount=18,scriptCount=len(scripts),scripts=scripts,main=dict(spriteId=311,frameCount=822,rootEntry=6,rootPlacement=[1,0,0,1,8247,5658],stopFrames=[315,475,613,751,805],quizFrame=805,postQuizFrame=806,terminalScriptPresent=False,ordinaryWrapBoundary=823),sourceText=text,namedAtCheckpoints=named,clipReleasePlacements=release,rightBranches=right,wrongBranches=wrong,answerBinding=[dict(letter=l,instance=i,characterId=c,textId=t,formulaId=f)for l,i,c,t,f in [('A','AnsBtn1',276,180,181),('B','AnsBtn4',277,183,184),('C','AnsBtn3',277,186,187),('D','AnsBtn2',277,189,190)]],hostCandidate=hp,hostScope='Reverified preserved indexMI host source; deterministic maintained selector preserves3wrong/4right branches. Exact original Adobe loader binding/random state remains independent.',findings=['Transparent source clip releases at315and475 resume main and clear quizSection. At613and751, sprite191release resumes main; sprite192release reveals Mc_box1/Mc_box2 and starts at1.','Sprite191has no display placements; native access to its action is a maintained adapter, not proof of original hit reachability. Sprite192contains shape18 at alpha0; preserve its source effect with an accessible control.','Helpers256/273 hold15; Close clears quizSection and resumes their own timeline. Frame20 restores NMH and returns to stopped1. Do not make Close implicitly advance parent.','Final correctA usesAnsBtn1. B/D source instance order is reversed. Wrong count increments at feedback terminal, not button release. All7feedbacks have no intermediate hold or Close.','Main822has no terminalstop; preserve ordinary wrap only after final frame duration, no lesson completion.','Help295 contains native Nicky sunglasses example M=0.50S minus25, with digit source positions. Also placed310 Mc_PopUp differs only by case and contains unrelated angle library text; original AVM receiver and hit reachability remain unresolved.','Stray angle text176-178 sits offstage; static symbol export shows all independently advancing nested feedback and is not a runtime screenshot. Use exact root/display transforms and script-controlled child frames before classifying visibility.'],risks=cat['risks'],trailingAfterEnd=[dict(timelineId=t['timelineId'],**t['trailingAfterEnd'])for t in ts.values()if t['trailingAfterEnd']],pending=['Complete source-role and vector/glyph placement audit, including offstage and case-colliding popup disposition','Raw stream extraction and exact decoded sample plans for main and sevenfeedback branches; explicit separate SA','Maintained native state/session/presentation, student-result tests and MyLesson registration','Originalruntime/fidelity/listening/human/Owner/full typography/accessibility/performance/strict/release/publication'],implemented=False,registered=False,originalRuntimeAccepted=False)
(M/'native-v1/source-structure-audit-v1.json').open('x').write(json.dumps(result,indent=2)+'\n');print(json.dumps(dict(pass_=True,timelines=18,scripts=len(scripts),mainFrames=822,stops=result['main']['stopFrames'])))
