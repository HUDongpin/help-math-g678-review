from pathlib import Path
import json,hashlib,sys,copy
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p029';D=Path('/Volumes/American Dream/.g6l8p29a1');A=Path('/Volumes/American Dream/.g6l8p29audit1');O=R/'output/g678-alg-l08-p029-integration-20261007-v1';Q=R/'output/g678-alg-l08-p029-source-audit-20261007-v1';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text())
def pin(p):p=p.resolve(strict=True);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def put(p,v):
 b=(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.open('xb').write(b)
pre=read(O/'source-entry-preflight-v1.json')
for p in pre['sources']:assert sha(Path(p['source']).read_bytes())==sha((R/p['copy']).read_bytes())==p['sha256']
c=read(A/'text-catalog.json');assert c['sourceSha256']==pre['sources'][0]['sha256']and not c['unparsedTags'];timelines=[]
for t in c['timelines']:
 live={};frames=[]
 for f in range(1,t['declaredFrameCount']+1):
  for e in [e for e in t['events']if e['frame']==f]:
   if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
   elif e['kind']=='place':
    assert not e.get('flags',{}).get('hasClipActions');p=copy.deepcopy(live[e['depth']])if e['move']else dict(matrix=[1,0,0,1,0,0],depth=e['depth'],placedFrame=f)
    for k in ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId']:
     if k in e:p[k]=e[k]
    if e.get('instanceId')!=live.get(e['depth'],{}).get('instanceId'):p['placedFrame']=f
    assert p['characterId'];live[e['depth']]=p
  frames.append([copy.deepcopy(p)for _,p in sorted(live.items())])
 timelines.append(dict(**t,frames=frames))
put(D/'source-frames-v1.json',{t['timelineId']:t['frames']for t in timelines});main=next(t for t in timelines if t['timelineId']=='sprite-245');assert len(main['frames'])==926;assert [e['frame']for e in main['events']if e['kind']=='action-bytes']==[276]
scripts={str(p.relative_to(A/'ffdec/scripts')):p.read_text()for p in sorted((A/'ffdec/scripts').rglob('*.as'))};assert len(scripts)==41;assert scripts['DefineSprite_245/frame_276/DoAction.as'].strip()=='stop();\n_global.quizSection = true;\n_global.quizTryCount = 0;'
def ranges(cid,domain='sprite-245'):
 out=[]
 for f,row in enumerate(next(t for t in timelines if t['timelineId']==domain)['frames'],1):
  if any(p['characterId']==cid for p in row):
   if out and out[-1][1]==f-1:out[-1][1]=f
   else:out.append([f,f])
 return out
named={p['name']['text']:p for p in main['frames'][275]if'name'in p};assert {i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)}=={1:54,2:55,3:54,4:54};assert all(not('name'in p and p['name']['text']=='NMHBtn')for t in timelines for row in t['frames']for p in row)
wrongFirst='Slope is the ratio of the vertical change to the horizontal change. Try again.';wrongLater='Slope is the ratio of the vertical change to the horizontal change.';wrong=scripts['DefineButton2_54/BUTTONCONDACTION on(release).as'];assert '_global.quizTryCount == 1'in wrong and wrongFirst in wrong and wrongLater in wrong;assert scripts['DefineButton2_55/BUTTONCONDACTION on(release).as'].strip()=='on(release){\n   _root.disableQuizButton();\n   _root.showRightFeed();\n}'
branches=[dict(spriteId=208,kind='wrong',index=1,hold=22,close=197,closeChild=199,closeJump=23,closeFirst=15,terminal=28,dynamicTextId=198),dict(spriteId=162,kind='wrong',index=2,hold=20,close=157,closeChild=161,closeJump=21,closeFirst=13,terminal=29,dynamicTextId=160),dict(spriteId=177,kind='wrong',index=3,hold=21,close=171,closeChild=173,closeJump=22,closeFirst=14,terminal=28,dynamicTextId=172),dict(spriteId=108,kind='right',index=1,terminal=27),dict(spriteId=124,kind='right',index=2,terminal=28),dict(spriteId=136,kind='right',index=3,terminal=25),dict(spriteId=83,kind='right',index=4,terminal=28)]
for b in branches:
 sid=b['spriteId'];assert named[f"Mc_{b['kind'].title()}_Feed{b['index']}"]['characterId']==sid;terminal=scripts[f"DefineSprite_{sid}/frame_{b['terminal']}/DoAction.as"];assert '_parent.play();'in terminal and 'this.gotoAndStop(1);'in terminal
 ids={p['characterId']for row in next(t for t in timelines if t['timelineId']==f'sprite-{sid}')['frames']for p in row};titles=[t for t in c['textDefinitions']if t['characterId']in ids and t.get('runs')];title=''.join(r['text']for r in titles[0]['runs']);assert all(''.join(r['text']for r in t['runs'])==title for t in titles);b.update(title=title,titleIds=[t['characterId']for t in titles])
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal and '_global.quizTryCount = 0;'in terminal;assert ranges(b['closeChild'],f'sprite-{sid}')==[[b['closeFirst'],b['hold']]];assert scripts[f"DefineSprite_{sid}/frame_{b['hold']}/DoAction.as"].strip()=='stop();';close=scripts[f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as"];assert f"_parent.gotoAndPlay({b['closeJump']});"in close and 'i <= 4'in close;assert scripts[f"DefineSprite_{b['closeChild']}/frame_1/DoAction.as"].strip()=='txtFeed.text = _global.WrongFeed;'
mask=read(Q/'glossary-mask-proof-v1.json');assert mask['sourceSwfSha256']==c['sourceSha256'];glossary=[]
for g in mask['terms']:
 cid=g['buttonId'];term=g['sourceKeyAttribute'];script=A/f'ffdec/scripts/DefineButton2_{cid}/BUTTONCONDACTION on(release).as';s=script.read_text();assert f'_global.KeyAttribute = "{term}";'in s and '_root.DoHyperLinks();'in s and '_root.animation_mc.animation.stop();'in s;assert ranges(cid)==[g['sourcePlacedRange']];assert g['permanentCropPixels']==dict(top=0.0,bottom=0.0);glossary.append(dict(term=term,characterId=cid,frameRanges=ranges(cid),visibleRanges=[g['authoredPaintVisibleRange']],script=pin(script)))
audit=read(Q/'source-behavior-audit-v1.json');host=audit['conditionalHost'];
for p in host['pins']:assert sha((R/p['path']).read_bytes())==p['sha256']
model=dict(schemaVersion=1,animationId=M.name,source=pin(Path(pre['sources'][0]['source'])),placement=pre['placement'],xml=pin(M/'source-v1/index.xml'),stage=dict(width=800,height=600),fps=12,rootFrameCount=10,rootBeginFrame=6,rootMainMatrix=[1,0,0,1,8248,5666],mainSpriteId=245,mainFrameCount=926,quizFrame=276,postQuizFrame=277,postQuizFrameHasAction=False,correctAnswer=2,answerCharacters={i:named[f'AnsBtn{i}']['characterId']for i in range(1,5)},title=pre['placement']['titleEnglish'],titleSourceShapeId=1,branches=branches,conditionalHost=host,behavior=dict(wrongIncrement='feedback-terminal-after-close-exit',wrongFirst=wrongFirst,wrongLater=wrongLater,end='ordinary926-to1 wrap; next276 resets quiz',replay='full modern page reset; independent original-host acceptance',loopDoesNotCompleteLesson=True),glossary=glossary,texts=[dict(**t,text=''.join(r['text']for r in t['runs'])if'runs'in t else t.get('initialText'),mainFrameRanges=ranges(t['characterId']))for t in c['textDefinitions']],timelines=timelines,rawInputs=[pin(A/n)for n in ['movie.xml','text-catalog.json']]+[pin(D/'source-frames-v1.json'),pin(Q/'glossary-mask-proof-v1.json'),pin(Q/'source-behavior-audit-v1.json')]+[pin(p)for p in sorted((A/'ffdec/scripts').rglob('*.as'))],notes=['No NMHBtn placement. Sprite208 undefined _parent.enableButton is preserved as a source anomaly, no invented help or host result.','Sprite108 nonzero after-End tail and empty terminal seek -1984 are preserved. Native candidate timing does not establish original-runtime alignment.','Seven feedback branches preserve semantic title/Close/attempt timing; decorative mascot/morph/bitmap motions remain extracted source only.','Question text and source glossary controls retain exact source masks; all five source term glyphs have zero permanent crop.','Main graph/grid/path and fraction/text placements use source-native SVG. FFDec records 0.05px original grid strokes with 1px display widths; retain provenance and verify visible grid.'],risks=c['risks'],lane='advanced-manual: compiler-assisted extraction plus maintained source-specific native graph and fraction layout; shared looping-quiz lifecycle; no factory scale-out claim',originalRuntimeAccepted=False,registryModified=False)
put(M/'native-v1/source-model-v1.json',model);put(M/'audit-v1/structural-readback-v1.json',dict(source=model['source'],domains=[dict(id=t['timelineId'],frames=t['declaredFrameCount'])for t in timelines],namedAt276=named,branches=branches,glossary=glossary,sourceAudit=pre['sourceAuditManifest'],registered=False));g=read(Q/'glossary-source-v1.json');print('glossary keys',list(g));put(M/'native-v1/glossary-model-v1.json',g);print(json.dumps(dict(pass_=True,main=245,frameCount=926,quiz=276,correctAnswer=2,branches=7,terms=5,registered=False)))
