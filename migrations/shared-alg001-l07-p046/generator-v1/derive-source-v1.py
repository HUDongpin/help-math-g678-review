from pathlib import Path
import hashlib,json,re,sys,xml.etree.ElementTree as E
B=Path(__file__).resolve().parents[1];R=B.parents[1];sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
def put(p,obj):
 b=(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)
custody=json.loads((B/'audit-v1/source-custody-v1.json').read_text());old=json.loads((B/'native-v1/two-point-behavior-v1.json').read_text())
for row in custody['sourceFiles']:
 p=Path(row['source']);assert p.resolve()==p and pin(p)['sha256']==row['sha256']and pin(p)['bytes']==row['bytes'];assert p.read_bytes()==(R/row['copy']).read_bytes()
assert custody['sourceFiles'][0]['sha256']=='fa315ff75fe7ddc63a2cd2f8d72266f7834b64ca210a96fb38bf0e415f31b336'
c=json.loads((B/'source-v1/source-text-catalog-v1.json').read_text());assert c['header']['version']==6 and c['header']['frameRate']==12 and c['unparsedTags']==[]
assert len(c['timelines'])==32 and len(c['shapeDefinitions'])==144 and len(c['textDefinitions'])==75
by={};timelines=[]
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
 row=dict(**t,frames=frames);timelines.append(row);by[t['timelineId']]=row
main=by['sprite-288'];assert main['declaredFrameCount']==641 and by['root']['declaredFrameCount']==10
named=[dict(characterId=p['characterId'],name=p['name']['text'],depth=p['depth'],matrix=p['matrix'])for p in main['frames'][317]if'name'in p]
assert all([(p['name']['text'],p['characterId'])for p in row if'name'in p]==[('Mc_Popup1',125)]for row in main['frames'][318:]);names={p['name']:p for p in named}
D=B/'source-v1/ffdec/scripts';paths=sorted(D.rglob('*.as'));assert len(paths)==80
for p in old['sourceActions']:assert pin(R/p['path'])==p
scripts=[dict(file=pin(p),source=p.read_bytes().decode())for p in paths]
squash=lambda s:re.sub(r'\s','',s)
def source(n):return (D/n).read_text()
def exact(n,s):assert squash(source(n))==squash(s),n
exact('frame_1/DoAction.as','_level0.InternalPreloader.gotoAndPlay("jump_check");stop();');exact('frame_6/DoAction.as','stop();');exact('DefineSprite_288/frame_641/DoAction.as','stop();')
exact('DefineButton2_10/BUTTONCONDACTION on(release).as','on(release){Mc_Popup1._visible=true;Mc_Popup1.Mc_Ani.Mc_Ani1.gotoAndPlay(2);Mc_Popup1.Mc_Ani.Mc_Ani2.gotoAndPlay(2);Wrong_Btn.enabled=false;DL_Btn.enabled=false;NMHBtn.enabled=false;disableMC();}')
# These nested names are absent, despite the template calls in the Help button.
all_names=[p['name']['text']for t in c['timelines']for p in t['events']if p.get('name')]
assert not set(['Mc_Ani','Mc_Ani1','Mc_Ani2','Mc_Popup2','Mc_txt1'])&set(all_names)
assert by['sprite-125']['declaredFrameCount']==1 and not any(p.get('name')for p in by['sprite-125']['frames'][0])
for close in [99,102]:exact(f'DefineButton2_{close}/BUTTONCONDACTION on(release).as','on(release){this._visible=false;_parent.Wrong_Btn.enabled=true;_parent.DL_Btn.enabled=true;_parent.NMHBtn.enabled=true;_parent.enableMC();}')
right=[dict(index=i,spriteId=s,terminal=f)for i,s,f in [(1,213,27),(2,264,33),(3,230,28),(4,244,32)]]
wrong=[dict(index=i,spriteId=s,hold=h,terminal=f,child=ch,close=cl,closeJump=j,closeFirst=cf)for i,s,h,f,ch,cl,j,cf in [(1,143,22,31,139,136,23,16),(2,158,20,28,155,152,21,13),(3,173,20,29,172,152,21,13),(4,188,21,28,184,182,22,14)]]
for r in right:
 s,f=r['spriteId'],r['terminal'];assert names[f'Mc_Right_Feed{r["index"]}']['characterId']==s
 exact(f'DefineSprite_{s}/frame_1/DoAction.as','stop();');exact(f'DefineSprite_{s}/frame_{f}/DoAction.as','stop();_root.disableQuizButton();_global.quizSection=false;this.gotoAndStop(1);_parent.GLine_Mc._visible=false;_parent.play();')
for r in wrong:
 s=r['spriteId'];assert names[f'Mc_Wrong_Feed{r["index"]}']['characterId']==s
 exact(f'DefineSprite_{s}/frame_1/DoAction.as','stop();_parent.enableButton();');exact(f'DefineSprite_{s}/frame_{r["hold"]}/DoAction.as','stop();')
 exact(f'DefineSprite_{s}/frame_{r["terminal"]}/DoAction.as','stop();_root.enableQuizButton();this.gotoAndStop(1);_parent.Wrong_Btn.enabled=true;_parent.DL_Btn.enabled=true;_parent.NMHBtn.enabled=true;_parent.enableMC();_parent.GLine_Mc._visible=false;_parent.hideMovieClip();_parent.rmMovieClip();if(_global.quizTryCount>=2){_global.quizTryCount=0;_global.quizSection=false;_parent.play();}')
 exact(f'DefineSprite_{r["child"]}/frame_1/DoAction.as','txtFeed.text=_global.WrongFeed;');exact(f'DefineButton2_{r["close"]}/BUTTONCONDACTION on(release).as','on(release){_parent.gotoAndPlay('+str(r['closeJump'])+');}')
glossary=[]
for p in paths:
 s=p.read_text();found=re.findall(r'_global.KeyAttribute = "([^"]+)";',s)
 if found:
  assert len(found)==1;term=found[0];exact(str(p.relative_to(D)),'on(release){_global.KeyAttribute="'+term+'";_root.DoHyperLinks();_root.animation_mc.animation.stop();}');glossary.append(dict(characterId=int(p.parts[-2].split('_')[-1]),term=term,script=pin(p)))
assert len(glossary)==19
# Reuse the independently pinned conditional host, bound again to this L7 source.
historic=json.loads((R/'output/alg-l06-p041-feedback-host-resolution-20261001-v1/host-resolution-v1.json').read_text());hostpins={}
for k in ['hostSwf','hostFrame35ActionScript','hostFrame49ActionScript']:
 p=historic['inputs'][k];f=Path(p['path'])if Path(p['path']).is_absolute()else R/p['path'];assert pin(f)['bytes']==p['bytes']and pin(f)['sha256']==p['sha256'];hostpins[k]=pin(f)
hostpath=lambda k:Path(hostpins[k]['path'])if Path(hostpins[k]['path']).is_absolute()else R/hostpins[k]['path']
host=hostpath('hostFrame35ActionScript').read_text();host49=hostpath('hostFrame49ActionScript').read_text();xml=(B/'source-v1/index.xml').read_text(encoding='utf-8-sig');assert hostpath('hostSwf').read_bytes()[3]==6
assert '<PageRoot>HELP_COURSES/ALG001/L7</PageRoot>'in xml and 'TI/L7TI09.swf</Page>'in xml and 'case "HELP_COURSES/ALG001/ALG001.jpg":'in host49 and '_loc1_.animation_mc.loadMovie(_loc2_.playSwfFileName,1);'in host
for kind,n in [('Wrong',3),('Right',4)]:
 f=re.search(r'function show'+kind+r'Feed\(\)\s*\{(.*?)\n\}',host,re.S).group(1);prefix='eval("_root.animation_mc.animation.Mc_'+kind+'_Feed" + intMc_Name)';assert f'intMc_Name = random({n});'in f and 'intMc_Name += 1;'in f and 'quizTryCount'not in f
 for effect in ['._visible = true;','.gotoAndPlay(2);','._x = 5;']:assert prefix+effect in f
 assert '_root.Show'+kind+'Feed();'in source('DefineButton2_63/BUTTONCONDACTION on(release).as')
assert not re.search(r'function\s+enableButton\(',host)
for s in [81,83]:
 exact(f'DefineSprite_{s}/frame_1/DoAction.as','stop();')
assert not any(re.search(r'Coach_audio_[12]\.',s['source'])for s in scripts)and not re.search(r'Coach_audio_[12]\.',host)
assert 'function hideMovieClip()\n{\n}'in source('DefineSprite_288/frame_318/DoAction.as')
resolution=dict(kind='conditional-host-source-binding-for-alg-l07-p046',sourcePins=hostpins,lessonXml=pin(B/'source-v1/index.xml'),pageSwf=pin(B/'source-v1/L7TI09.swf'),courseImage='HELP_COURSES/ALG001/ALG001.jpg',pageRoot='HELP_COURSES/ALG001/L7',pageReference='TI/L7TI09.swf',pageSwfVersion=6,hostSwfVersion=6,sourceCaseBinding={'pageCalls':['ShowWrongFeed','ShowRightFeed'],'hostDefinitions':['showWrongFeed','showRightFeed'],'rule':'AVM1 SWF6 identifier resolution is case-insensitive; original host execution remains unobserved.'},selection={'wrong':'fresh random(3)+1','right':'fresh random(4)+1','attemptBased':False},historicalHostUseVerified=False,originalRuntimeAccepted=False,legacyShellRecreated=False)
put(B/'audit-v1/conditional-feedback-host-resolution-v1.json',resolution)
model=dict(schemaVersion=1,animationId=custody['animationId'],source=pin(custody['sourceFiles'][0]['source']),spanishAudio=pin(custody['sourceFiles'][1]['source']),sourceCatalog=pin(B/'source-v1/source-text-catalog-v1.json'),behaviorPredecessor=pin(B/'native-v1/two-point-behavior-v1.json'),producer=pin(Path(__file__)),placement=custody['placement'],stage={'width':800,'height':600},fps=12,rootEntryFrame=6,mainSpriteId=288,mainFrameCount=641,quizFrame=318,postQuizFrame=319,namedAtQuiz=named,glossary=glossary,scripts=scripts,timelines=timelines,texts=c['textDefinitions'],shapes=c['shapeDefinitions'],bitmaps=c['bitmapDefinitions'],buttons=c['buttonDefinitions'],risks=c['risks'],points=old['points'],messages=old['messages']+['You have choosen two points. Please click on Draw Line Button'],feedback={'wrong':wrong[:3],'right':right,'dormantWrong':wrong[3:],'hostResolution':pin(B/'audit-v1/conditional-feedback-host-resolution-v1.json'),'count':'Wrong Draw increments immediately; wrong exit only checks/reset count. Two wrong exits resume parent319.','rightControls':'Draw-right calls hideMovieClip (empty) and host ShowRightFeed only; it does not disable Draw, background, Help or remaining named points. Do not invent a right-selection lock.'},findings={'sourceDomains':32,'scriptFiles':80,'activeSourceStreams':[143,158,173,213,230,244,264,288],'dormantStreams':[81,83,188],'help':'Popup125 is one static frame with seven paragraphs. Mc_Ani/Mc_Ani1/Mc_Ani2 names do not exist, so authored calls cannot create an animation. This refines the earlier intake guess.','noOps':'Mc_Popup2, Mc_txt1 and enableButton have no local or conditional-host definitions; hideMovieClip is empty. Named point frame2 highlights are not cleared by wrong-exit hideMovieClip.','duplicatePoint':'Duplicates of point_mc retain its on(release): disable self, gotoAndStop2 (sprite79 has one frame), set Firstpoint true. It never changes selection slots.','postquiz':'Frame319 removes every named quiz placement except Mc_Popup1 (help125), which remains through641. Dynamic GLine_Mc is hidden by right/wrong exit; remaining duplicated points follow exact branch cleanup.','originalRuntime':'Static source/conditional host only; no historical launcher or original-runtime execution accepted.'},registered=False,originalRuntimeAccepted=False)
put(B/'native-v1/source-model-v1.json',model)
print(json.dumps({'model':pin(B/'native-v1/source-model-v1.json'),'domains':32,'scripts':80,'glossaryBindings':len(glossary),'staticHelp':True,'wrongIndices':[1,2,3],'rightIndices':[1,2,3,4],'registered':False}))
