"""Source-locked P038 behavior constants; no ActionScript execution engine."""
from pathlib import Path
import json,re,hashlib,sys
R=Path.cwd();assert R==Path('/Volumes/WestWorld/HELP MATH 2.0-g678-implementation');A=R/'output/g678-alg-l08-p038-source-20261007-v1';O=R/'output/g678-alg-l08-p038-integration-20261007-v1';M=R/'migrations/shared-alg001-l08-p038';read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return dict(path=str(p),bytes=p.stat().st_size,sha256=sha(p))
def verify(r):
 p=Path(r['path']);p=p if p.is_absolute()else R/p;assert pin(p)==dict(r,path=str(p)),str(p)
def put(p,data):
 b=data.encode()
 if '--check'in sys.argv:assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
review=O/'root-design-review-v1.json';assert sha(review)=='2939b153ba89788bae72e777061dc5a2c9813bb8209ba350940d89dcf6ca4b65';r=read(review);assert r['pass_']and r['readyForMaintainedNativeDraft']
for k in ['design','designData','designManifest','sourceReview']:verify(r[k])
a=read(A/'behavior-audit-v1.json');assert a['sourceSha256']=='e77e92b6cd1cebd8b330ab853a377bf7913b7c3911acc195ceb929150deaff0b'
for h in a['handlers'].values():
 verify(h['actionScript']);verify(h['pcode']);p=Path(h['actionScript']['path']);p=p if p.is_absolute()else R/p;assert p.read_text().replace('\r\n','\n').strip()==h['source'].strip()
h=a['handlers'];text=lambda name:h[name]['source'];draw=text('drawLine');assert 'tempAns = "PT_2,PT_3,PT_4,PT_5";'in draw and draw.count('tempAns.indexOf(')==3;assert '_global.C = "PT_5";\n         _global.Y = "PT_3";'in draw;assert 'GLine_Mc.moveTo(eval(_global.C)._x,eval(_global.C)._y);'in draw;assert 'GLine_Mc.lineTo(eval(_global.Y)._x,eval(_global.Y)._y);'in draw
messages=re.findall(r'Mc_Popup(?:3)?\.txtFeed\.text = "([^"]+)";',draw);assert len(messages)==3
fullBackground=re.findall(r'Mc_Popup3\.txtFeed\.text = "([^"]+)";',text('backgroundPoint'));fullFixed=re.findall(r'Mc_Popup3\.txtFeed\.text = "([^"]+)";',text('PT_1'));assert len(fullBackground)==len(fullFixed)==1
assert 'if(_global.quizTryCount >= 2)'in text('wrongClose')and '_global.quizTryCount = 0'not in text('wrongClose');assert 'gotoAndStop(2)'in text('dynamicPointRelease')and '_global.Firstpoint = true' in text('dynamicPointRelease')
points=[dict(name=p['name'],spriteId=p['spriteId'],depth=p['placement']['depth'],matrix=p['placement']['matrix'],x=p['placement']['matrix'][4],y=p['placement']['matrix'][5],slot=p['globalSlotAssigned'],initialShapeId=p['initialFramePlacements'][0]['characterId'],selectedShapeId=p['selectedFramePlacements'][0]['characterId'])for p in a['points']]
assert [(p['name'],p['x'],p['y'])for p in points]==[('PT_1',-1309,721),('PT_2',-561,471),('PT_3',212,203),('PT_4',-2095,977),('PT_5',-2852,1240)]
for p in points:assert f"_global.{p['slot']} = this._name;"in text(p['name'])
model=dict(animationId=a['animationId'],sourceSha256=a['sourceSha256'],rootFrames=10,rootBeginFrame=6,mainSpriteId=585,mainFrames=525,quizFrame=208,resumeFrame=209,fps=12,title='Question 9',literalAcceptedPointNames='PT_2,PT_3,PT_4,PT_5',correctEndpointRewrite=dict(Y='PT_3',C='PT_5'),points=points,messages=dict(incomplete=messages[0],wrongFirst=messages[1],wrongLater=messages[2],fullBackground=fullBackground[0],fullFixed=fullFixed[0]),sourceGlobals=dict(quizSection=True,quizDragCount=0,quizTryCount=0,Firstpoint=False,Secpoint=0,WFeed=False,mcCount=100,Y='',C=''),sourceLine=dict(name='GLine_Mc',depth=1001,widthPixels=3,rgb=255,alphaPercent=100),dynamicPoint=dict(templateName='point_mc',spriteId=549,firstCounter=101,depthBase=16384,frameCount=1,sourceRequestedFrame=2,renderedFrame=1),missingSourceMembers=['Mc_Popup2','Mc_txt1','Mc_Popup1.Mc_Ani.Mc_Ani1','Mc_Popup1.Mc_Ani.Mc_Ani2'],sourceDisableDynamicNamePrefix='point_mc',sourceCreateDynamicNamePrefix='Mc_',modernRepair=dict(id='restore-first-wrong-fixed-point-visibility',onlyOnAttempt=1,preserveSelectedFrames=True,preserveCounter=True,sourceRuntimeFidelity=False),glossaryTerms=list(dict.fromkeys(h['term']for h in a['hotspots'])),sourceHandlers={k:{'actionScript':v['actionScript'],'pcode':v['pcode']}for k,v in h.items()},sourceAnomalies=a['sourceAnomalies'],rootDesignReview=pin(review),nativeDecodeAvailable=False)
put(M/'native-v1/behavior-model-v1.json',json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n');put(O/'draft-source/alg-l08-p038-behavior-source-v1.ts','// Generated from exact P038 source and reviewed dispositions. Edit the maintained generator.\nexport const ALG_L08_P038_BEHAVIOR = '+json.dumps(model,separators=(',',':'),ensure_ascii=False)+' as const;\n');print(json.dumps(dict(pass_=True,points=5,exactHandlers=16,anomalies=12,messages=5,modernRepair=model['modernRepair']['id'],check='--check'in sys.argv)))
