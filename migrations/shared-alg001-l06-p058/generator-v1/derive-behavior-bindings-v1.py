"""Compile P058's exact action and lifetime contract. No source mutation or registration."""
from pathlib import Path
import hashlib,json,re,sys

R=Path(__file__).resolve().parents[3];M=R/'migrations/shared-alg001-l06-p058'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();b=p.read_bytes()
 return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':sha(b)}

def build():
 model_path=M/'native-v1/source-model-v1.json';m=json.loads(model_path.read_text())
 assert m['sourceSha256']=='79bd9d4896d7b297a4df928711c92f1bd2b9f78b976f8399fc9e640d9704c4d3'
 assert pin(M/'source-v1/L6TS09.swf')['sha256']==m['sourceSha256']
 scripts={s['relative'].removeprefix('scripts/'):s['text']for s in m['scripts']}
 for s in m['scripts']:
  p=Path(s['pin']['path']);assert pin(p)==s['pin'] and p.read_text()==s['text']
 assert len(scripts)==70
 clean=lambda s:re.sub(r'\s+','',s)
 def action(path):return clean(scripts[path])
 def button(i):return action(f'DefineButton2_{i}/BUTTONCONDACTION on(release).as')
 assert button(255)=='on(release){_root.disableQuizButton();_root.showRightFeed();NMHBtn.enabled=false;}'
 assert button(256)=='on(release){_root.disableQuizButton();_root.showWrongFeed();NMHBtn.enabled=false;}'
 assert action('DefineSprite_285/frame_934/DoAction.as')=='stop();_global.quizSection=true;_global.quizTryCount=0;Mc_Popup._visible=false;'
 assert action('DefineSprite_285/frame_935/DoAction.as')=='_global.quizSection=false;'
 assert not any('/frame_951/'in s for s in scripts)
 options=[]
 for o in m['answerPlacements']:
  ts=[t['text']for t in o['textMatches']];assert len(ts)==2
  options.append({'letter':ts[0],'value':ts[1],'instance':o['instance'],'buttonId':o['buttonId'],'right':o['branch']=='right','hitBoxPx':o['hitBoxPx']})
 options.sort(key=lambda o:o['letter']);assert [(o['letter'],o['value'],o['right'])for o in options]==[('A','The strength is staying the same.',False),('B','The strength is getting higher.',False),('C','The strength is getting lower.  ',True),('D','The strength is at its lowest.',False)]
 placements=m['domains']['285']['allPlacements'];branches=[]
 for p in placements:
  name=p.get('sourceAttributes',{}).get('name','');match=re.fullmatch(r'Mc_(Right|Wrong)_Feed([1-4])',name)
  if p['frame']!=1 or not match:continue
  sid=p['objectId'];d=m['domains'][str(sid)];kind=match[1].lower();end=d['frameCount']
  terminal=action(f'DefineSprite_{sid}/frame_{end}/DoAction.as')
  if kind=='right':assert terminal=='stop();_root.disableQuizButton();_global.quizSection=false;_parent.play();this.gotoAndStop(1);'
  else:assert terminal=='stop();_root.enableQuizButton();this.gotoAndStop(1);_global.quizTryCount++;_parent.NMHBtn.enabled=true;if(_global.quizTryCount>=2){_global.quizTryCount=0;_global.quizSection=false;_parent.play();}'
  # Intermediate exported actions in these feedbacks are empty: no source Close/hold.
  for pathname,text in scripts.items():
   match_frame=re.fullmatch(f'DefineSprite_{sid}/frame_(\\d+)/DoAction(?:_\\d+)?\\.as',pathname)
   if match_frame and int(match_frame[1]) not in [1,end]:assert not text.strip()
  branches.append({'spriteId':sid,'kind':kind,'index':int(match[2]),'instance':name,'depth':p['depth'],'startFrame':2,'terminal':end})
 branches.sort(key=lambda b:(b['kind'],b['index']))
 assert [(b['kind'],b['spriteId'])for b in branches]==[('right',97),('right',76),('right',62),('right',36),('wrong',129),('wrong',115),('wrong',140)]
 steps=[]
 for frame,depth,box in [(403,59,None),(571,108,None),(720,64,242),(878,64,252)]:
  actions=[(p,t)for p,t in scripts.items()if p.startswith(f'DefineSprite_285/frame_{frame}/PlaceObject2_')]
  continue_actions=[p for p,t in actions if clean(t)=='on(release){_global.quizSection=false;_parent.play();}'];assert continue_actions
  control=next(p for p in placements if p['frame']==frame and p['kind']=='place' and p['depth']==depth)
  assert control['objectId']==177
  expected='stop();_root.animation_mc.animation.a_text._visible=false;_global.quizSection=true;'
  if box:expected+=f'Mc_box{1 if box==242 else 2}._visible=false;NMHBtn._visible=false;'
  assert action(f'DefineSprite_285/frame_{frame}/DoAction.as')==expected
  row={'frame':frame,'controlSpriteId':177,'depth':depth,'action':'open-box'if box else'continue','continueAction':continue_actions[0],'continueHasSourceHitArea':box is None}
  if box:
   boxname='Mc_box1' if box==242 else 'Mc_box2';close=241 if box==242 else 251
   assert any(clean(t)==f'on(release){{_parent.{boxname}._visible=true;_parent.{boxname}.gotoAndPlay(1);_parent.NMHBtn._visible=true;}}'for _,t in actions)
   assert action(f'DefineSprite_{box}/frame_1/DoAction.as')=='stop();'
   assert action(f'DefineSprite_{box}/frame_15/DoAction.as')=='stop();'
   assert action(f'DefineSprite_{box}/frame_20/DoAction.as')=='_parent.NMHBtn.enabled=true;_parent.NMHBtn._visible=true;gotoAndStop(1);'
   assert button(close)=='on(release){_global.quizSection=false;play();_parent.NMHBtn.enabled=true;}'
   ci=next(i for i in m['domains'][str(box)]['instances']if i['objectId']==close);assert ci['firstFrame']==ci['lastFrame']==15
   row['box']={'spriteId':box,'instance':boxname,'startFrame':1,'holdFrame':15,'resetFrame':20,'closeButtonId':close,'closeFrame':15}
  steps.append(row)
 assert m['domains']['176']['allPlacements']==[]
 assert button(13)=='on(release){NMHBtn.enabled=false;_root.disableQuizButton();Mc_Popup._visible=true;}'
 assert button(258)=='on(release){this._visible=false;_root.enableQuizButton();_parent.NMHBtn.enabled=true;}'
 diagnostic=R/'output/playwright/g678-p058-source-controls-20261003-v1/root-review-v1.json';diag=json.loads(diagnostic.read_text());assert diag['status']=='diagnostic-controls-verified' and diag['source']['sha256']==m['sourceSha256']
 # Observable name binding is a scoped forensic result, separately identified from source facts.
 help_placement=next(p for p in placements if p.get('objectId')==268)
 assert help_placement['depth']==337 and help_placement['frame']==934
 active_glossary=[g for g in m['glossary']if g['ownerSpriteId'] in [285,268]]
 binding={'sourceSha256':m['sourceSha256'],'model':pin(model_path),'diagnostic':pin(diagnostic),'runtime':m['runtime'],'mainSpriteId':285,'boxSpriteIds':[242,252],
  'quizFrame':934,'postQuizFrame':935,'mainLastFrame':951,'steps':steps,'options':options,'feedback':branches,
  'glossary':active_glossary,'help':{'spriteId':268,'instance':'Mc_Popup','depth':337,'openButtonId':13,'closeButtonId':258},
  'counterIncrement':'wrong-feedback-terminal','feedbackHasAuthoredHold':False,'rightTerminalSourceOrder':['stop','disableQuiz','clearQuizSection','parentPlay','resetFeedback1'],
  'sharedReducerEquivalence':'Parent play schedules the next timeline tick; feedback reset occurs in the same source terminal action. Shared reducer atomically retires selected feedback and resumes main; no intermediate observable page input or original timing-parity claim.',
  'modernContracts':{'nativeContinueForEmptySprite176':True,'terminalHold':True,'deterministicFeedbackSelection':True,'exactOriginalHostPairing':False}}
 output=R/'packages/demos/src/generated/alg-l06-p058-behavior-v1.ts'
 code='// Generated from P058 source actions, placements and scoped diagnostic. Do not hand-edit.\nexport const P058_BEHAVIOR_SOURCE = '+json.dumps(binding,indent=2)+' as const;\n'
 return output,code

if __name__=='__main__':
 assert sys.argv[1:] in [['--check'],['--write']]
 out,code=build()
 if sys.argv[1]=='--check':assert out.read_text()==code
 else:out.write_text(code)
 print(json.dumps({'status':'PASS','output':str(out.relative_to(R)),'sha256':sha(code.encode())}))
