"""Bounded source audit for ALG001 L7 Game 1/2; no original-runtime claim."""
from pathlib import Path
import json,hashlib,sys,re,collections,xml.etree.ElementTree as E
sys.path.insert(0,'scripts/lib')
from g678_fixed_exit_visual_v1 import alpha,spans
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,('drift',p)
 else:p.open('xb').write(b)
def timeline(t):
 live={};frames=[]
 for f in range(1,t['declaredFrameCount']+1):
  for e in t['events']:
   if e['frame']!=f:continue
   if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
   elif e['kind']=='place':
    p=dict(live.get(e['depth'],{}))if e['move']else dict(matrix=[1,0,0,1,0,0],depth=e['depth'],placedFrame=f)
    p.update({k:e[k]for k in ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId']if k in e});assert p.get('characterId');live[e['depth']]=p
  frames.append([dict(p)for p in live.values()])
 return dict(t,frames=frames)
models=[]
for page,main,expectedHash,scriptCount in [(51,185,'5a4ad482c9f62794c75080677a3a4c862063758c906fbe3d2ed51f3f98d64c25',61),(52,303,'ec2a84931df2f7280466e0dac5cbe6c9e636b6700a35696bacb03baf5a4a905d',132)]:
 B=Path(f'migrations/shared-alg001-l07-p0{page}');custody=json.loads((B/'audit-v1/source-custody-v1.json').read_text())
 for p in custody['sourceFiles']:
  src=Path(p['source']);assert str(src.resolve())==str(src);assert sha(src.read_bytes())==p['sha256'];assert src.stat().st_size==p['bytes'];assert src.read_bytes()==Path(p['copy']).read_bytes()
 assert custody['sourceFiles'][0]['sha256']==expectedHash
 c=json.loads((B/'source-v1/source-text-catalog-v1.json').read_text());assert c['sourceSha256']==expectedHash;ts={t['timelineId']:timeline(t)for t in c['timelines']};assert len(ts)==77;assert ts['root']['declaredFrameCount']==10
 mt=ts[f'sprite-{main}'];assert mt['declaredFrameCount']==(683 if page==51 else 6);root=next(p for p in ts['root']['frames'][5]if p['characterId']==main);assert root['depth']==3
 texts={t['characterId']:t for t in c['textDefinitions']};scripts=list(sorted((B/'source-v1/ffdec/scripts').rglob('*.as')));assert len(scripts)==scriptCount
 scriptRows=[dict(pin(p),source=p.read_text())for p in scripts]
 def script(s):return (B/'source-v1/ffdec/scripts'/s).read_text()
 def exact(s,expected):assert re.sub(r'\s','',script(s))==re.sub(r'\s','',expected),s
 exact('frame_1/DoAction.as','_level0.InternalPreloader.gotoAndPlay("jump_check");stop();');exact('frame_6/DoAction.as','stop();')
 labels={e['label']['text']:e['frame']for e in mt['events']if e['kind']=='frame-label'}
 def named(f):return [dict(p,name=p['name']['text'])for p in mt['frames'][f-1]if p.get('name')]
 reachable={main};pending=[main]
 while pending:
  t=ts.get(f'sprite-{pending.pop()}')
  if t:
   for e in t['events']:
    id=e.get('characterId')
    if id is not None and id not in reachable:reachable.add(id);pending.append(id)
 # Button records add the ordinary display dependencies, separate from executed actions.
 for row in scriptRows:
  rel=Path(row['path']).relative_to(B/'source-v1/ffdec/scripts').as_posix();m=re.match(r'Define(?:Sprite|Button2)_(\d+)',rel)
  row['role']='root-host-preloader'if rel.startswith('frame_')else('placed-source-action'if m and int(m[1])in reachable else 'unplaced-component-library')
 risks=[]
 if page==51:
  assert labels=={'RepeatDirection':5,'SelectLevel':682};exact('DefineSprite_185/frame_1/DoAction.as','_global.gameLevel1=false;_global.gameLevel2=false;Mc_Msg._visible=false;');exact('DefineSprite_185/frame_682/DoAction.as','stop();Mc_Popup._visible=false;Mc_Msg._visible=false;')
  for f,d,target in [(1,29,'L3GS03'),(682,53,'L7GS03')]:
   a=script(f'DefineSprite_185/frame_{f}/PlaceObject2_117_{d}/CLIPACTIONRECORD on(release).as');assert f'_root.doNeedMoreHelp("{target}",1,6)'in a
  assert not any(e.get('name',{}).get('text')=='txtRes_Msg'for t in ts.values()for e in t['events']);assert not (Path(custody['sourceFiles'][0]['source']).parent/'L3GS03.swf').exists()
  risks=['Early mcStart requests absent L3GS03. Do not retarget silently. Early txtRes_Msg has no named source field.','Close button uses this._visible in AVM1 scope; native close is a documented product projection, not observed original execution.','Alpha-zero controls have source handlers; original hit behavior remains unobserved.','Direction text promises music; P052 has feedback streams only, no embedded reward music.']
  details=dict(heldFrame=682,repeatFrame=5,declaredUnreachedFrame=683,earlyTarget='L3GS03',heldTarget='L7GS03',targetAnimationId='shared-alg001-l07-p052',controlSpans={name:spans([[(p['characterId'],alpha(p),p['placedFrame'])for p in row if p.get('name',{}).get('text')==name]for row in mt['frames']])for name in ['mcL1','mcL2','mcStart','mcRepeat','mcSkip','Mc_Msg']})
 else:
  assert labels=={'Level1':2,'Level2':4}
  setup1=script('DefineSprite_303/frame_2/DoAction.as');setup2=script('DefineSprite_303/frame_4/DoAction.as')
  assert setup1.replace('Mc_Score.gotoAndPlay(1);\nMc_Popup._visible = false;', 'Mc_Popup._visible = false;\nMc_Score.gotoAndPlay(1);')==setup2  # Preserve the two independent source orders.
  cards=[p for p in scripts if re.search(r'DefineSprite_303/frame_[24]/PlaceObject2_.*/CLIPACTIONRECORD on\(release\).as$',str(p))];assert len(cards)==24;assert{sha(p.read_bytes())for p in cards}=={'f39b7bc9e865752b35736f6cd782efb4394c62f7ee19df3bc4daf76a5ec3e6cb'}
  body=cards[0].read_text();assert 'setInterval(fadeOut1,100)'in body and 'setInterval(fadeOut2,100)'in body;assert 'setInterval(fadeOut3'not in body and'setInterval(fadeOut4'not in body
  exact('DefineSprite_170/frame_27/DoAction.as','stop();_parent.enableMc();_global.totAnsCount++;if(_global.totAnsCount>=6){_global.totAnsCount=0;_global.quizSection=false;_parent.nextFrame();}')
  exact('DefineSprite_157/frame_28/DoAction.as','stop();_parent.enableMc();')
  exact('DefineSprite_194/frame_1/DoAction.as','stop();');exact('DefineSprite_302/frame_1/DoAction.as','stop();')
  levels=[]
  for level,f in [(1,2),(2,4)]:
   row=named(f);cs=[p for p in row if re.fullmatch(r'Mc[1-6]_[12]',p['name'])];imgs=[p for p in row if re.fullmatch(r'Mc[1-6]_Img[12]',p['name'])];assert len(cs)==len(imgs)==12
   for p in cs:assert ts[f"sprite-{p['characterId']}"]['declaredFrameCount']==5
   levels.append(dict(level=level,frame=f,completionFrame=f+1,cards=cs,imagePieces=imgs))
  xml=E.parse(B/'source-v1/movie.xml').getroot();assert not any(t.tag in ['DefineSound','StartSound']for t in xml.iter());assert not any(re.search(r'loadSound|attachSound|\.mp3|\.wav',x['source'])for x in scriptRows)
  risks=['Matching is by McN partner frame2, not mathematical recomputation. Preserve inconsistent original table/graph content.','No embedded reward music or event sounds exist in this SWF. Only right/wrong feedback streams are present.','Initial frame1 controls immediately leave for Level1/Level2; Sound Off is not placed in either playable frame.','Reward sprites stop on frame1; frame2 actions and parent.play are not normally reached.','Wrong frame1 enableButton has no local definition; do not treat it as enableMc.','Close receiver this._visible is a native-close projection with original-runtime scope still unobserved.','Layout triangle-image names have no matching placed instances; retained inactive references.']
  details=dict(levels=levels,feedback=dict(wrong=dict(spriteId=157,start=2,terminal=28),right=dict(spriteId=170,start=2,terminal=27)),score=dict(correct=10,wrong=-2,floor=None),fade=dict(intervalMs=100,decrement=40,steps=[60,20,-20],hideAtMs=400),cardScript=pin(cards[0]),dormantFunctions=['fadeOut3','fadeOut4'],sameCardSecondClick='wrong',completionAfter='sixth right feedback terminal',directEntryLevel=1)
 model=dict(schemaVersion=1,animationId=custody['animationId'],source=custody['sourceFiles'][0],spanishAudio=custody['sourceFiles'][1],placement=custody['placement'],mainSpriteId=main,mainFrameCount=mt['declaredFrameCount'],fps=12,rootEntryFrame=6,rootPlacement=root,labels=labels,timelines=list(ts.values()),texts=c['textDefinitions'],shapes=c['shapeDefinitions'],bitmaps=c['bitmapDefinitions'],buttons=c['buttonDefinitions'],scripts=scriptRows,findings=details,risks=risks,registered=False,originalRuntimeAccepted=False)
 put(B/'native-v1/source-model-v1.json',model);put(B/'audit-v1/source-behavior-audit-v1.json',dict(animationId=model['animationId'],sourceHash=expectedHash,sourceModel=pin(B/'native-v1/source-model-v1.json'),scripts=scriptCount,actionRoles=dict(collections.Counter(r['role']for r in scriptRows)),risks=risks,sourceCurrent=True,registered=False,originalRuntimeAccepted=False));models.append(dict(page=page,scripts=scriptCount,domains=len(ts),risks=len(risks)))
print(json.dumps(models))
