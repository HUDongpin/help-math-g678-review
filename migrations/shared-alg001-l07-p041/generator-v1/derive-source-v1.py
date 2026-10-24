from pathlib import Path
import hashlib,json,re,sys,xml.etree.ElementTree as E,struct,zlib

B=Path(__file__).resolve().parents[1];R=B.parents[1]
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
def put(p,obj):
 b=(json.dumps(obj,indent=2,ensure_ascii=False)+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)
custody=json.loads((B/'audit-v1/source-custody-v1.json').read_text())
for p in custody['sourceFiles']:
 src=Path(p['source']);assert str(src.resolve())==str(src);assert pin(src)['sha256']==p['sha256'];assert pin(src)['bytes']==p['bytes'];assert (R/p['copy']).read_bytes()==src.read_bytes()
assert custody['sourceFiles'][0]['sha256']=='2413fdd3c756e075f0cf6c7dedffcb48457f3a514c9e948073a377021a66a56b'
c=json.loads((B/'source-v1/source-text-catalog-v1.json').read_text());timelines=json.loads((B/'source-v1/all-frame-states-v1.json').read_text());by={t['timelineId']:t for t in timelines};main=by['sprite-223']
assert len(timelines)==21 and main['declaredFrameCount']==353 and c['header']['frameRate']==12 and by['root']['declaredFrameCount']==10
# Rebuild every display list independently of the retained preflight replay.
for t in c['timelines']:
 live={};frames=[]
 for f in range(1,t['declaredFrameCount']+1):
  for e in [e for e in t['events']if e['frame']==f]:
   if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
   elif e['kind']=='place':
    p=live.get(e['depth'],{}).copy()if e['move']else dict(matrix=[1,0,0,1,0,0],depth=e['depth'],placedFrame=f)
    for k in ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId']:
     if k in e:p[k]=e[k]
    assert p.get('characterId');live[e['depth']]=p
  frames.append([p.copy()for p in live.values()])
 assert frames==by[t['timelineId']]['frames'],t['timelineId']
directory=B/'source-v1/ffdec/scripts';paths=sorted(directory.rglob('*.as'));assert len(paths)==52
scripts=[dict(file=pin(p),source=p.read_bytes().decode())for p in paths];used=set()
def expected(name,text):
 p=directory/name;actual=p.read_text();assert re.sub(r'\s','',actual)==re.sub(r'\s','',text),name;used.add(name)
expected('frame_1/DoAction.as','_level0.InternalPreloader.gotoAndPlay("jump_check");stop();')
expected('frame_6/DoAction.as','stop();')
expected('DefineSprite_223/frame_1/DoAction.as','onEnterFrame=function(){if(this._currentframe<=229){removeMovieClip(mc);removeMovieClip(h1);removeMovieClip(h2);}};')
expected('DefineSprite_223/frame_230/DoAction.as','''function draw(){mc.clear();mc.lineStyle(3,16711680);mc.moveTo(h1._x,h1._y+1);mc.lineTo(h2._x,h2._y+1);}stop();Mc_Popup._visible=false;Mc_txt1._visible=false;var boolDoneClicked=false;_global.quizSection=true;_global.quizDragCount=0;_global.quizTryCount=0;_global.startDragMc=false;attachMovie("squareHandle","h1",5);attachMovie("squareHandle","h2",6);h1._x=-48;h1._y=61;h2._x=67;h2._y=61;createEmptyMovieClip("mc",1);setInterval(draw,25);BtnDone.enabled=false;i=1;while(i<=4){eval("Mc_"+i)._alpha=0;i++;}''')
expected('DefineSprite_223/frame_353/DoAction.as','stop();')
expected('DefineButton2_6/BUTTONCONDACTION on(press).as','on(press){startDrag(this,1,-109,-64,142,186);}')
snaps=''.join('if(this.hitTest(_parent.Mc_%s)){this._x=_parent.Mc_%s._x;}'%(i,i)for i in [1,3,5,7,2,4,6,8])
expected('DefineButton2_6/BUTTONCONDACTION on(release, releaseOutside).as','on(release,releaseOutside){stopDrag();_global.startDragMc=true;if(this._name=="h1"){'+snaps+'if(!(this._x==-48&&this._y==61)){this._parent.BtnDone.enabled=true;}}else{'+snaps+'if(!(this._x==67&&this._y==61)){this._parent.BtnDone.enabled=true;}}}')
expected('DefineButton2_4/BUTTONCONDACTION on(press).as','on(press){startDrag(this,1,10,10,290,290);}')
expected('DefineButton2_4/BUTTONCONDACTION on(release, releaseOutside).as','on(release,releaseOutside){stopDrag();}')
hint='Use the table to make ordered pairs. Then slide the points to the ordered pairs. Try again.'
right='_root.disableQuizButton();_root.showRightFeed();h1.Btn.enabled=false;h2.Btn.enabled=false;'
expected('DefineButton2_72/BUTTONCONDACTION on(release).as','on(release){boolDoneClicked=true;BtnDone.enabled=false;NMHBtn.enabled=false;_global.quizTryCount++;if(_global.startDragMc==true&&(h1._x==Mc_1._x&&h2._x==Mc_2._x)||h1._x==Mc_3._x&&h2._x==Mc_4._x){'+right+'}else if(_global.startDragMc==true&&(h1._x==Mc_2._x&&h2._x==Mc_1._x)||h1._x==Mc_4._x&&h2._x==Mc_3._x){'+right+'}else{_global.WrongFeed="'+hint+'";_root.disableQuizButton();_root.showWrongFeed();h1.Btn.enabled=false;h2.Btn.enabled=false;}}')
expected('DefineButton2_15/BUTTONCONDACTION on(release).as','on(release){NMHBtn.enabled=false;if(boolDoneClicked){BtnDone.enabled=false;}Mc_Temp._visible=false;mc._visible=false;h1._visible=false;h2._visible=false;_root.disableQuizButton();Mc_Popup._visible=true;Mc_Popup.Mc_Ani.Mc_Ani1.gotoAndPlay(2);Mc_Popup.Mc_Ani.Mc_Ani2.gotoAndPlay(2);CloseBtn._visible=true;}')
expected('DefineButton2_202/BUTTONCONDACTION on(release).as','on(release){this._visible=false;_parent.NMHBtn.enabled=true;if(_parent.boolDoneClicked){_parent.BtnDone.enabled=true;}_parent.Mc_Temp._visible=true;_parent.mc._visible=true;_parent.h1._visible=true;_parent.h2._visible=true;_root.enableQuizButton();}')
for sid,end in [(109,31),(126,28),(147,33),(159,28)]:
 expected(f'DefineSprite_{sid}/frame_1/DoAction.as','stop();')
 expected(f'DefineSprite_{sid}/frame_{end}/DoAction.as','stop();_root.disableQuizButton();_global.quizSection=false;this.gotoAndStop(1);_parent.play();')
 for frame in [1,end]:expected(f'DefineSprite_{sid}/frame_{frame}/DoAction_2.as','')
for sid,hold,end in [(186,22,31),(200,20,28)]:
 expected(f'DefineSprite_{sid}/frame_1/DoAction.as','stop();'+('_parent.enableButton();'if sid==186 else''))
 expected(f'DefineSprite_{sid}/frame_{hold}/DoAction.as','stop();')
 expected(f'DefineSprite_{sid}/frame_{end}/DoAction.as','stop();_root.enableQuizButton();this.gotoAndStop(1);_parent.BtnDone.enabled=true;_parent.NMHBtn.enabled=true;_parent.h1.Btn.enabled=true;_parent.h2.Btn.enabled=true;')
for sid in [182,197]:expected(f'DefineSprite_{sid}/frame_1/DoAction.as','txtFeed.text=_global.WrongFeed;')
for sid,jump in [(179,23),(194,21)]:expected(f'DefineButton2_{sid}/BUTTONCONDACTION on(release).as','on(release){_parent.gotoAndPlay('+str(jump)+');i=1;while(i<=4){eval("AnsBtn"+i).gotoAndStop(1);i++;}}')
for sid in [81,83]:
 expected(f'DefineSprite_{sid}/frame_1/DoAction.as','stop();')
 expected(f'DefineSprite_{sid}/frame_20/DoAction.as','_parent.enableButton();'+('if(_global.quizDragCount>=5){_global.quizSection=false;_parent.play();}'if sid==83 else''))
glossary=[]
for sid,term in [(24,'Graph'),(25,'Linear function'),(26,'Table'),(27,'Point'),(207,'Function table'),(208,'Input'),(209,'X-coordinate'),(210,'Ordered pair'),(211,'Output'),(212,'Y-coordinate')]:
 file=f'DefineButton2_{sid}/BUTTONCONDACTION on(release).as';expected(file,'on(release){_global.KeyAttribute="'+term+'";_root.DoHyperLinks();_root.animation_mc.animation.stop();}');glossary.append(dict(characterId=sid,term=term,script=pin(directory/file)))
assert used=={str(p.relative_to(directory))for p in paths}
named=[dict(characterId=p['characterId'],name=p['name']['text'],depth=p['depth'],matrix=p['matrix'])for p in main['frames'][229]if'name'in p]
assert all('name'not in p for p in main['frames'][230]);assert [(p['characterId'],p['name'])for p in named]==[(72,'BtnDone'),(76,'Mc_1'),(76,'Mc_2'),(76,'Mc_3'),(76,'Mc_4'),(79,'Mc_txt1'),(81,'Coach_audio_1'),(83,'Coach_audio_2'),(15,'NMHBtn'),(109,'Mc_Right_Feed1'),(126,'Mc_Right_Feed4'),(147,'Mc_Right_Feed3'),(159,'Mc_Right_Feed2'),(186,'Mc_Wrong_Feed1'),(200,'Mc_Wrong_Feed2'),(200,'Mc_Wrong_Feed3'),(213,'Mc_Popup')]
x=E.parse(B/'source-v1/movie.xml').getroot();defs={int(d.get('objectID')):d for d in x.find('Header/tags')if d.get('objectID')}
def bounds(id):return{k:int(v)for k,v in defs[id].find('bounds/Rectangle').attrib.items()}
assert bounds(1)==dict(left=-76,right=94,top=-76,bottom=94);assert bounds(75)==dict(left=-160,right=160,top=-160,bottom=160)
assert [(p['characterId'],p['matrix'])for p in by['sprite-7']['frames'][0]]==[(6,[1,0,0,1,0,0])]
assert [(p['characterId'],p['matrix'])for p in by['sprite-76']['frames'][0]]==[(75,[1,0,0,1,0,0])]
targets=[]
for i in range(1,5):
 p=next(p for p in named if p['name']==f'Mc_{i}');a,b,c1,d,tx,ty=p['matrix'];assert a==d==0.3333740234375 and b==c1==0
 targets.append(dict(index=i,x=tx/20,y=ty/20,bounds=dict(left=(-160*a+tx)/20,right=(160*a+tx)/20,top=(-160*d+ty)/20,bottom=(160*d+ty)/20)))
assert [(p['x'],p['y'])for p in targets]==[(-47.4,23),(67.65,87.2),(-110.75,-14.55),(119.4,111.6)]
button6=next(b for b in c['buttonDefinitions']if b['characterId']==6);assert all(p['characterId']==1 and p['matrix']==[1,0,0,1,0,0]for p in button6['statePlacements'])
assert not any(p.get('name',{}).get('text')in['Mc_Ani','CloseBtn','Mc_Temp']for t in timelines for row in t['frames']for p in row)
# The End-tag boundary is explicit; do not decode or promote the retained opaque tail.
tail=by['sprite-109']['trailingAfterEnd'];assert tail==dict(bytes=386,sha256='d14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0',allZero=False)
hostOld=R/'output/alg-l06-p041-feedback-host-resolution-20261001-v1';old=json.loads((hostOld/'host-resolution-v1.json').read_text());hostPins={}
for k in ['hostSwf','hostFrame35ActionScript','hostFrame49ActionScript']:
 p=old['inputs'][k];path=Path(p['path'])if p['path'].startswith('/')else R/p['path'];assert pin(path)['sha256']==p['sha256']and pin(path)['bytes']==p['bytes'];hostPins[k]=pin(path)
 copy=B/'source-v1'/('conditional-indexMI.swf'if k=='hostSwf'else f'conditional-host-frame-{35 if "35"in k else 49}.as')
 if copy.exists()or'--check'in sys.argv:assert copy.read_bytes()==path.read_bytes()
 else:copy.open('xb').write(path.read_bytes())
host=(B/'source-v1/conditional-host-frame-35.as').read_text();course=(B/'source-v1/index.xml').read_text();assert 'HELP_COURSES/ALG001/ALG001.jpg'in course and 'HELP_COURSES/ALG001/L7'in course
for kind,n in [('Wrong',3),('Right',4)]:
 fn=re.search(r'function show'+kind+r'Feed\(\)\s*\{(.*?)\n\}',host,re.S).group(1);assert f'intMc_Name = random({n});'in fn and 'intMc_Name += 1;'in fn and 'quizTryCount'not in fn and ')._x = 5;'in fn
assert not re.search(r'function\s+enableButton\(',host)
hostResolution=dict(kind='conditional-host-source-binding-for-alg-l07-p041',sourcePins=hostPins,lessonXml=pin(B/'source-v1/index.xml'),pageSwf=pin(B/'source-v1/L7TI04.swf'),courseImage='HELP_COURSES/ALG001/ALG001.jpg',pageRoot='HELP_COURSES/ALG001/L7',pageReference='TI/L7TI04.swf',selection={'wrong':'random(3)+1 each call','right':'random(4)+1 each call','effects':'selected named clip visible, gotoAndPlay(2), x=5, source global volume','attemptBased':False},pageBindings=named,historicalHostUseVerified=False,originalRuntimeAccepted=False,boundary='Fresh byte verification and static compatibility only; no transferred L6 page acceptance. Minimal host adapter without legacy shell recreation.')
put(B/'audit-v1/conditional-feedback-host-resolution-v1.json',hostResolution)
model=dict(schemaVersion=1,animationId=custody['animationId'],source=pin(custody['sourceFiles'][0]['source']),spanishAudio=pin(custody['sourceFiles'][1]['source']),placement=custody['placement'],stage=dict(width=800,height=600),fps=12,rootEntryFrame=6,mainSpriteId=223,mainFrameCount=353,quizFrame=230,postQuizFrame=231,namedAtQuiz=named,glossary=glossary,scripts=scripts,timelines=timelines,texts=c['textDefinitions'],shapes=c['shapeDefinitions'],bitmaps=c['bitmapDefinitions'],buttons=c['buttonDefinitions'],risks=c['risks'],drag=dict(handleSpriteId=7,handleButtonId=6,handleShapeId=1,handleBounds={k:v/20 for k,v in bounds(1).items()},bounds=dict(left=-109,top=-64,right=142,bottom=186),initial=[dict(x=-48,y=61),dict(x=67,y=61)],targets=targets,sourceSnapOrder=[1,3,5,7,2,4,6,8],presentSnapOrder=[1,3,2,4],snap='Each hitTest uses axis-aligned source object bounds; tests are sequential after preceding x snap. Only x snaps; y is retained. No Mc_5..8 exists.',doneEnable='Release enables Done when that handle differs from its own initial position; returning to initial does not disable previously enabled Done.',correct='(startDragMc && h1.x==Mc_1.x && h2.x==Mc_2.x) || (h1.x==Mc_3.x && h2.x==Mc_4.x) || (startDragMc && h1.x==Mc_2.x && h2.x==Mc_1.x) || (h1.x==Mc_4.x && h2.x==Mc_3.x)',predicateUsesY=False,line=dict(width=3,color='#ff0000',yOffset=1),targetsVisible=False),feedback=dict(right=[dict(index=i,spriteId=s,terminal=e)for i,s,e in [(1,109,31),(2,159,28),(3,147,33),(4,126,28)]],wrong=[dict(index=i,spriteId=s,hold=h,terminal=e,close=cl,closeJump=j,child=ch)for i,s,h,e,cl,j,ch in [(1,186,22,31,179,23,182),(2,200,20,28,194,21,197),(3,200,20,28,194,21,197)]],hint=hint,hostResolution=pin(B/'audit-v1/conditional-feedback-host-resolution-v1.json'),counter='Increment immediately on every enabled Done press, retain across any number of wrong feedback exits. No wrong exit advances the main timeline.',rightExit='Clear quizSection and resume main231. Dynamic handles and line remain visible, disabled; source frame231 removes static targets, Help, Done and feedback.'),findings=dict(sourceDomains=21,scriptFiles=52,activeSourceStreams=[109,126,147,159,186,200,223],dormantStreams=[81,83],help='Static three-paragraph popup213, 7 linked terms. Hide dynamic line and handles while open. Preserve positions. Close202 is in popup context; hides popup and restores handles/line, help and Done conditional on boolDoneClicked. Missing Mc_Temp, Mc_Ani children, CloseBtn calls are no-ops.',dormant='Exported sprite5/button4 never attached or placed. Coach81/83 stop at1 with no local/conditional-host caller; undefined enableButton calls have no local target. No source quizDragCount increments.',terminal='Main353 stops. Dynamic handles/line persist through terminal; Replay clears them and returns main1.',sourceQuirks='Instruction says up/down; actual drag bounds permit 2D. X-only source predicate and outlying Mc_3 left of drag bound are preserved. No mathematical answer-policy correction is inferred.',tail='Sprite109 has 386 opaque bytes after End. Both maintained tag readers end before this tail; retain exact bytes/hash and do not infer original-runtime effects.'),pending=['native teaching visual derivation','Current-JS/My Lesson/admission','original runtime/fidelity/listening/human/Owner/strict/release/publication'],registered=False,originalRuntimeAccepted=False)
put(B/'native-v1/source-model-v1.json',model)
print(json.dumps(dict(pass_=True,domains=21,scripts=len(scripts),source=pin(B/'native-v1/source-model-v1.json'),targets=targets,host=pin(B/'audit-v1/conditional-feedback-host-resolution-v1.json'))))
