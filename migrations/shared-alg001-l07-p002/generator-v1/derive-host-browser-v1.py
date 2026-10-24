import hashlib,json,struct,re
from pathlib import Path
root=Path(__file__).resolve().parents[3];a=root/'migrations/shared-alg001-l07-p002/audit-v1';out=root/'output/alg-l07-p002-host-integration-20261003-v1';checks=[]
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(root)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(name):
 s=(a/name).read_text();return json.loads(s.split('### Result\n',1)[1].split('\n',1)[0])
def check(name,condition):
 assert condition,name;checks.append({'name':name,'pass':True})
x=load('browser-host-result-v2.txt');r={i['label']:i for i in x['receipts']};main=r['main-pause']['frame']
check('Mount and EN locale never autoplay',r['initial-no-autoplay']['diagnostics']['contexts']==0)
check('Explicit main Play creates source-run nodes and advances',r['explicit-main-play']['phase']=='playing' and r['explicit-main-play']['frame']>1 and r['explicit-main-play']['diagnostics']['activeNodes']==3)
check('Main Pause leaves no live source',r['main-pause']['phase']=='paused' and r['main-pause']['diagnostics']['activeNodes']==0)
for name in ['explicit-separate-SA','SA-restart-from-zero']:
 check(name+' holds main cursor with only SA live',r[name]['frame']==main and r[name]['phase']=='paused' and r[name]['saSelected']=='true' and r[name]['diagnostics']['activeNodes']==1)
check('SA Pause closes selected SA',r['SA-pause']['saPhase']=='paused' and r['SA-pause']['diagnostics']['activeNodes']==0 and r['SA-pause']['diagnostics']['closed']==1)
check('Return resumes retained nonterminal main',r['return-retains-main-cursor']['frame']>=main and r['return-retains-main-cursor']['phase']=='playing' and r['return-retains-main-cursor']['saSelected']=='false')
check('Replay cancels SA and resets main',r['Replay-cancels-SA-resets-main']['frame']==1 and r['Replay-cancels-SA-resets-main']['replay']==1 and r['Replay-cancels-SA-resets-main']['saSelected']=='false')
check('Keyboard Pause leaves no source',r['keyboard-pause']['diagnostics']['activeNodes']==0)
check('Actual native loader is cors/script and audio is cors/empty',all(i['headers']['sec-fetch-mode']=='cors' and i['headers']['sec-fetch-dest']==('script' if 'native-canvas-renderer.js' in i['url'] else 'empty') for i in x['requests']) and len(x['requests'])>=3)
y=load('browser-host-additional-result-v1.txt');r={i['label']:i for i in y['receipts']}
check('Host Pause selected SA stops all audio',r['host-Pause-selected-SA']['phase']=='paused' and r['host-Pause-selected-SA']['diagnostics']['activeNodes']==0)
check('Host Play selected SA never resumes main',r['host-Play-selected-SA-only']['phase']=='paused' and r['host-Play-selected-SA-only']['frame']==1 and r['host-Play-selected-SA-only']['diagnostics']['activeNodes']==1)
check('Actual close Promise delay holds main',r['return-close-pending-main-held']['phase']=='paused' and r['return-close-pending-main-held']['diagnostics']['activeNodes']==0)
check('Pause invalidates old Return after actual close',r['released-old-return-does-not-resume']['phase']=='paused' and r['released-old-return-does-not-resume']['frame']==1 and r['released-old-return-does-not-resume']['diagnostics']['activeNodes']==0)
check('Normal SA EOF resumes retained main',r['normal-SA-end-resumes-retained-main']['phase']=='playing' and r['normal-SA-end-resumes-retained-main']['saSelected']=='false' and r['normal-SA-end-resumes-retained-main']['diagnostics']['activeNodes']==3)
check('Source table hidden695 visible696',r['host-QA-frame-695']['tableVisible']=='false' and r['host-QA-frame-696']['tableVisible']=='true')
check('Leaving P002 closes every context',r['P002-to-P003-cleans-P002']['diagnostics']['contexts']==r['P002-to-P003-cleans-P002']['diagnostics']['closed'] and r['P002-to-P003-cleans-P002']['diagnostics']['activeNodes']==0)
z=load('browser-host-es-navigation-result-v1.txt');r={i['label']:i for i in z['receipts']}
check('ES mount does not autoplay',r['ES390-20px-initial-no-autoplay']['diagnostics']['contexts']==0)
check('ES source highlights900 and1077',r['ES390-20px-QA-900']['emphasis']==[{'cell':'0-rate','text':'$.20/minute'}] and r['ES390-20px-QA-1077']['emphasis']==[{'cell':'2-rate','text':'$.03/minute'}])
check('Actual P001→P002→P003→P002 student navigation identities', [n['identity'] for n in z['nav']]==['shared-alg001-l07-p001','shared-alg001-l07-p001','shared-alg001-l07-p002','shared-alg001-l07-p002','shared-alg001-l07-p003','shared-alg001-l07-p003','shared-alg001-l07-p002'])
for n in z['nav']:
 if 'play' not in n['label'] or 'no-autoplay' in n['label']:
  check(n['label']+' owns cleanup/no autoplay',n['diagnostics']['activeNodes']==0 and n['diagnostics']['contexts']==n['diagnostics']['closed'])
t=load('browser-host-terminal-ack-result-v2.txt');r={i['label']:i for i in t['receipts']};starts=r['native-terminal1195-paused-label']['diagnostics']['startedNodes']
for label in ['native-terminal1195-paused-label','terminal-main-Play-1-paused-ack','terminal-main-Play-2-paused-ack','terminal-main-Narration-retains-paused-label','terminal-SA-return-held-paused-label']:
 v=r[label];check(label,v['frame']==1195 and v['phase']=='timeline-ended' and v['hostPlayButtons']==['Reproducir animación'] and v['diagnostics']['activeNodes']==0)
check('Terminal repeated Play does not read/start nodes',all(r[n]['diagnostics']['startedNodes']==starts for n in ['terminal-main-Play-1-paused-ack','terminal-main-Play-2-paused-ack','terminal-main-Narration-retains-paused-label']))
check('Terminal SA host Play remains separate',r['terminal-SA-host-Play-plays-SA-only']['frame']==1195 and r['terminal-SA-host-Play-plays-SA-only']['diagnostics']['activeNodes']==1 and r['terminal-SA-host-Play-plays-SA-only']['hostPlayButtons']==['Pausar animación'])
check('Terminal Replay resets and plays source',r['terminal-Replay-reset-plays']['frame']==1 and r['terminal-Replay-reset-plays']['phase']=='playing' and r['terminal-Replay-reset-plays']['diagnostics']['activeNodes']==3)
u=load('browser-host-mobile-bounds-result-v3.txt');screens=[]
for v in u['receipts']:
 viewport=v['viewport'];check('Observed mobile viewport/frame'+str(v['frame']),u['playwrightViewport']=={'width':390,'height':844} and viewport=={'innerWidth':390,'innerHeight':844,'dpr':1,'visualWidth':375,'documentClientWidth':375,'documentScrollWidth':375,'rootFont':'20px'})
 check('All complete native rates fit/frame'+str(v['frame']),[i['text']for i in v['rates']]==['$.20/minute','$.05/minute','$.03/minute'] and all(i['fullTextInside'] and i['box']['right']<=375 and i['font']=='20px' for i in v['rates']))
 check('Native source title and own banner fit/frame'+str(v['frame']),all(i['fullTextInside'] and i['box']['right']<=375 for i in v['headings']))
 check('Source-active correct native cell/frame'+str(v['frame']),[i['cell']for i in v['rates'] if i['emphasis']=='true']==['0-rate' if v['frame']==900 else '2-rate'])
 p=out/('es-observed-mobile-v3-frame'+str(v['frame'])+'.png');width,height=struct.unpack('>II',p.read_bytes()[16:24]);check('Actual PNG content width/frame'+str(v['frame']),width==375);screens.append({'pin':pin(p),'width':width,'height':height,'configuredViewport':u['playwrightViewport'],'observedViewport':viewport})
check('Successful captured candidate states have no alert',all(not v['alerts'] for d in [x,y,z,t,u] for v in d['receipts']) and all(not n['alerts']for n in z['nav']))
files=['browser-host-result-v2.txt','browser-host-additional-result-v1.txt','browser-host-es-navigation-result-v1.txt','browser-host-terminal-ack-result-v2.txt','browser-host-mobile-bounds-result-v3.txt']
index=pin(root/'catalog/g678-admission-v1/index-v182.json');host=json.loads((root/index['path']).read_text())['host'];check('Browser shared host remains exact182',pin(root/host['path'])==host)
result={'schemaVersion':1,'animationId':'shared-alg001-l07-p002','gate':'candidate-local-real-My-Lesson','pass':True,'checks':checks,'rawResults':[pin(a/p)for p in files],'drivers':[pin(a/p.replace('result','driver')) for p in files],'screenshots':screens+[{'pin':pin(out/('desktop-frame'+str(n)+'.png')),'scope':'QA-only existing inspectFrame, not student seek'}for n in [695,696,900,1077]],'receiptScope':{'ENES':True,'actualStudentPlayPauseReplaySAAndNavigation':True,'terminalNaturalFullRun':'Separate unchanged standalone v4 source-bound99.533s receipt; host uses QA1194 then real Play→1195','mobile':'390 inner viewport;375 content and PNG after vertical scrollbar;20px root/font preserved','loadingCleanup':'Two abort-read unit checks; seven controlled close-delay unit checks; actual browser close-delay Pause regression. Not an original old bug reproduction.','terminalPatchApplicability':'Only main-selected terminal acknowledgement and terminal Return changed after earlier flow; fresh terminal8case including Narration run verifies affected branches. Other source/player behavior unchanged.'},'stabilityInputs':{'admissionIndex':index,'host':host,'activation':pin(root/'apps/web/lib/g678-admission-activation.ts'),'currentPreparationRegistry':[pin(root/'packages/demos/private-current-js-registry.json'),pin(root/'packages/demos/src/registry.local-only.generated.ts'),pin(root/'packages/demos/src/registry.local-only.metadata.generated.ts')],'scopeNote':'Raw candidate runs used immutable host/index182. Activation and current registry are preparation snapshot after P003-only183 registration, not a relabeled browser run. P002 formal fresh stability run is required after shared registration.'},'runtime':pin(root/'apps/web/components/g678-alg-l07-p002-runtime-v1.tsx'),'registrationPending':True,'productionBuildNegativePending':True,'failedOrInsufficientEvidenceRetained':['browser-host-result-v1.txt','browser-host-mobile-bounds-result-v1.txt','browser-matrix-verified-v2 limitations','web-typecheck-v4 default heap OOM'],'consoleClaim':'No blanket zero-console claim: historical404/source guard failures retained; successful states have no role alert; HMR/developer/font noise separate.','acceptanceEffects':dict.fromkeys(['originalRuntime','fidelity','audioListening','human','owner','strictComplete','release','publication'],False)}
# Actual registry paths are located from the current known contract, not guessed aliases.
(out/'real-my-lesson-browser-v2.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'checks':len(checks),'pass':True,'receipt':pin(out/'real-my-lesson-browser-v2.json')}))
