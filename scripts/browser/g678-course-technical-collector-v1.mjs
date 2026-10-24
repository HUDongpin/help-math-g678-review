/** Actual public-input collection. Missing observations remain gaps, never defaults. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createRequire} from 'node:module';
import {installG678TechnicalObserver} from './g678-technical-observer-v1.mjs';
import {createG678CommittedRuntimeAdapter} from './g678-committed-runtime-adapter-v1.mjs';
import {DEFAULT_CELLS,REQUIRED_SUPPLEMENT_IDS} from '../lib/g678-technical-assessor-v1.mjs';
import {qualifyAudioTools,inspectOwnedAudioBrowser,runFreshAudioNegatives,beginActualAudioCapture,finishActualAudioCapture,exportActualFlowAudio,assessActualLifecycleAudio} from './g678-actual-audio-collector-v1.mjs';

const run=promisify(execFile),sha=b=>createHash('sha256').update(b).digest('hex');
export function sourceStateMatches(value,expected) {
 return !!value&&!!expected&&Object.entries(expected).every(([key,want])=>{
  const actual=key.split('.').reduce((v,k)=>v?.[k],value);return JSON.stringify(actual)===JSON.stringify(want);
 });
}
export function sameCommit(a,b) {
 return !!a&&!!b&&a.identity?.playerId===b.identity?.playerId&&a.identity?.runToken===b.identity?.runToken&&
  a.identity?.leaseToken===b.identity?.leaseToken&&a.render?.surfaceId===b.render?.surfaceId&&
  a.render?.commitId===b.render?.commitId&&a.source?.frame===b.source?.frame&&a.source?.tick===b.source?.tick;
}
export function normalizeDispatchedEvents(events,trace) {
 return events.map(event=>{
  const matches=trace.filter(command=>command.executed&&command.force===false&&event.atMs>=command.beforeMs&&event.atMs<=command.afterMs&&
   command.observedEventSequences.includes(event.sequence)&&event.trusted===true&&!event.synthetic);
  return matches.length===1?{...event,forced:false,dispatcherCommandId:matches[0].id,
   ...(['next','previous','play','pause','replay'].includes(matches[0].action)?{action:matches[0].action}:{})}:event;
 });
}
function actualPin(root,pin) {
 const file=path.resolve(root,pin.path);assert.equal(fs.realpathSync(file),file,'physical evidence input');
 const before=fs.statSync(file,{bigint:true}),bytes=fs.readFileSync(file),after=fs.statSync(file,{bigint:true});
 assert(before.isFile()&&before.size===after.size&&before.mtimeNs===after.mtimeNs&&before.ctimeNs===after.ctimeNs,'stable evidence input');
 assert.equal(bytes.length,pin.bytes,'input length');assert.equal(sha(bytes),pin.sha256,'input hash');return bytes;
}
export function requireFrozenPin(root,inputPins,pin) {
 assert(pin&&typeof pin.path==='string','required exact dependency pin');
 const file=path.resolve(root,pin.path);assert(inputPins.some(p=>path.resolve(root,p.path)===file&&p.bytes===pin.bytes&&p.sha256===pin.sha256),'dependency is in frozen inputs: '+pin.path);
 return actualPin(root,pin);
}
function put(directory,name,value) {
 const file=path.join(directory,name);assert(file.startsWith(directory+'/'),'bounded output');fs.mkdirSync(path.dirname(file),{recursive:true});
 const bytes=Buffer.isBuffer(value)?value:Buffer.from(typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');fs.writeFileSync(file,bytes,{flag:'wx'});
 return {path:file,bytes:bytes.length,sha256:sha(bytes)};
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function routeFor(parameters,origin,locale) {
 const url=new URL(parameters.route.replace('{locale}',locale),origin),base=new URL(origin);
 assert(url.origin===base.origin&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)&&url.protocol==='http:'&&!url.username&&!url.password,'exact local course route');return url.href;
}
async function browserNow(page) {return page.evaluate(()=>({atMs:performance.now(),unixMs:Date.now()}));}
async function snapshot(page) {return page.evaluate(()=>window.__g678TechnicalObserver?.sample()??null);}
async function observedRecords(page) {return page.evaluate(()=>structuredClone(window.__g678TechnicalObserver?.records??null));}
async function waitSample(page,predicate,timeoutMs,diagnostics,label,retainedAfterSequence=null) {
 const start=Date.now();let last=null;
 while(Date.now()-start<timeoutMs) {last=await snapshot(page);if(last&&predicate(last))return last;
  if(retainedAfterSequence!==null){const records=await page.evaluate(sequence=>window.__g678TechnicalObserver?.records.samples.filter(s=>s.sequence>sequence)??[],retainedAfterSequence);const observed=records.find(predicate);if(observed)return observed;}
  await delay(40);}
 diagnostics.push({stage:label,status:'not-run',reason:'required actual sample not reached',last});return null;
}
export async function visibleControl(page,selector,timeoutMs=5000) {
 const candidates=page.locator(selector),deadline=Date.now()+timeoutMs;
 do {
  for(let i=0;i<await candidates.count();i++){const item=candidates.nth(i);if(await item.isVisible()&&await item.isEnabled())return item;}
  const remaining=deadline-Date.now();if(remaining<=0)break;await delay(Math.min(40,remaining));
 } while(Date.now()<=deadline);
 throw Error('PUBLIC_CONTROL_NOT_VISIBLE_OR_ENABLED: '+selector);
}
async function dispatch(page,selector,action,cell,trace,{key,timeoutMs}={}) {
 const locator=await visibleControl(page,selector,timeoutMs),before=await browserNow(page),prior=await page.evaluate(()=>window.__g678TechnicalObserver?.records.events.at(-1)?.sequence??0);
 const target=await locator.evaluate(node=>({tag:node.tagName,id:node.id,role:node.getAttribute('role'),name:node.getAttribute('aria-label'),text:node.textContent?.trim(),focusKey:node.getAttribute('data-responsive-focus-key'),playbackAction:node.getAttribute('data-playback-action'),lessonNav:node.getAttribute('data-lesson-nav'),animationId:node.getAttribute('data-animation-id')}));
 const command={id:'input-'+(trace.length+1),action,selector,method:key?'press':cell.touch?'tap':'click',key:key??null,force:false,target,beforeMs:before.atMs,beforeUnixMs:before.unixMs,executed:false,observedEventSequences:[]};
 trace.push(command);
 try {if(key)await locator.press(key);else if(cell.touch)await locator.tap();else await locator.click();command.executed=true;}
 finally {const after=await browserNow(page);command.afterMs=after.atMs;command.afterUnixMs=after.unixMs;command.observedEventSequences=await page.evaluate(prior=>window.__g678TechnicalObserver?.records.events.filter(e=>e.sequence>prior).map(e=>e.sequence)??[],prior);}
 return command;
}
export async function enterCourse(page,parameters,animationId,config,cell,trace,diagnostics) {
 const requestedUrl=routeFor(parameters,config.origin,cell.locale);
 const response=await page.goto(requestedUrl,{waitUntil:'domcontentloaded',timeout:config.timeouts?.navigationMs??90000});
 // SSR controls can be visible before their handlers are attached.
 await page.waitForFunction(()=>Boolean(document.querySelector('[data-lesson-player][data-hydrated="true"]')),null,{timeout:config.timeouts?.readyMs??60000});
 const entry={requestedUrl,committedUrl:page.url(),responseStatus:response?.status()??null,
  navigation:await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{name:n.name,type:n.type,startTime:n.startTime,responseEnd:n.responseEnd,domContentLoadedEventEnd:n.domContentLoadedEventEnd}:null;}),
  sourceActionsCalled:false,sourceStateWritten:false};
 const current=async()=>page.locator('[data-lesson-player]').getAttribute('data-current-animation-id');
 const controlOptions={timeoutMs:config.timeouts?.controlMs??5000};
 // This waits only for the public host selection to commit. The caller still
 // requires the exact source/owner and actual renderer commit via waitSample.
 const selected=async id=>page.waitForFunction(id=>document.querySelector('[data-lesson-player]')?.getAttribute('data-current-animation-id')===id,id,{timeout:config.timeouts?.selectionMs??config.timeouts?.readyMs??60000});
 if(await current()===animationId)return entry;
 const target=parameters.normalEntry?.fromAnimationId;
 if(target&&await current()!==target) {
  const selector=`button[data-animation-id="${target}"]`;let requested=false;
  try {await dispatch(page,selector,'select-prior',cell,trace,controlOptions);requested=true;}
  catch {
   try {await dispatch(page,'[data-responsive-focus-key="map"]','open-map',cell,trace,controlOptions);await dispatch(page,selector,'select-prior',cell,trace,controlOptions);requested=true;}
   catch(error){diagnostics.push({stage:'normal-entry',status:'not-run',reason:String(error),actualAnimationId:await current()});}
  }
  if(requested)await selected(target);
 }
 if(target&&await current()===target){await dispatch(page,parameters.normalEntry.actionSelector??parameters.actions.next,'next',cell,trace,controlOptions);await selected(animationId);}
 if(await current()!==animationId){await dispatch(page,`button[data-animation-id="${animationId}"]`,'select-page',cell,trace,controlOptions);await selected(animationId);}
 assert.equal(await current(),animationId,'real course selected exact target');
 return entry;
}
export async function observeLayout(page,parameters,stateId,sample,assertions) {
 return page.evaluate(({parameters,stateId,sample,assertions})=>{
  const rect=node=>{const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  const measured=node=>{const r=rect(node),css=getComputedStyle(node),points=[[.1,.1],[.9,.1],[.5,.5],[.1,.9],[.9,.9]];
   let clipped=Math.max(0,-r.left)+Math.max(0,-r.top)+Math.max(0,r.right-innerWidth)+Math.max(0,r.bottom-innerHeight),obscured=0;
   for(let parent=node.parentElement;parent;parent=parent.parentElement){const s=getComputedStyle(parent),p=rect(parent);if(['hidden','clip','scroll','auto'].includes(s.overflowX))clipped+=Math.max(0,p.left-r.left)+Math.max(0,r.right-p.right);if(['hidden','clip','scroll','auto'].includes(s.overflowY))clipped+=Math.max(0,p.top-r.top)+Math.max(0,r.bottom-p.bottom);}
   for(const [x,y] of points){const px=r.left+r.width*x,py=r.top+r.height*y,hit=document.elementFromPoint(px,py);if(!hit||hit!==node&&!node.contains(hit))obscured++;}
   return{rect:r,computed:{display:css.display,visibility:css.visibility,opacity:Number(css.opacity)},clippedPixels:clipped,obscuredPixels:obscured};};
  const targets=[];for(const [id,selector] of Object.entries(parameters.layoutTargets??{})){const node=document.querySelector(selector);if(node){const m=measured(node);targets.push({id,...m,hitTargetId:m.obscuredPixels===0?id:null});}}
  const contentChecks=[],unsupported=[];
  for(const assertion of assertions) {
   if(assertion.stateId!==stateId)continue;
   if(assertion.method==='rendered-object'){unsupported.push({assertionId:assertion.id,reason:'actual committed object/display-list hook unavailable'});continue;}
   const nodes=document.querySelectorAll(assertion.selector);if(nodes.length!==1){unsupported.push({assertionId:assertion.id,reason:'content selector absent or ambiguous'});continue;}
   const node=nodes[0];contentChecks.push({assertionId:assertion.id,stateId,selector:assertion.selector,sampleSequence:sample.sequence,method:assertion.method??'innerText',text:node.innerText??node.textContent??'',namespaceURI:node.namespaceURI,...measured(node)});
  }
  return{layout:{stateId,sampleSequence:sample.sequence,rootScrollWidth:document.documentElement.scrollWidth,rootClientWidth:document.documentElement.clientWidth,targets},contentChecks,unsupported};
 },{parameters,stateId,sample,assertions});
}
async function captureState(page,parameters,stateId,contract,cell,directory,diagnostics) {
 const before=await snapshot(page);if(!before)return null;
 const predicate=stateId==='initial'?contract.terminal.initialState:stateId==='terminal'?contract.terminal.expectedState:contract.layout.statePredicates?.[stateId];
 if(!sourceStateMatches(before,predicate)){diagnostics.push({stage:'capture-'+stateId,status:'not-run',reason:'actual source state does not match capture state',sampleSequence:before.sequence});return null;}
 const observation=await observeLayout(page,parameters,stateId,before,contract.contentAssertions??[]);
 const target=page.locator(parameters.surfaceSelector);const bytes=await target.screenshot({animations:'allow',timeout:15000});
 const after=await snapshot(page),image=put(directory,`screenshots/${stateId}-${before.sequence}.png`,bytes);
 put(directory,`screenshots/${stateId}-${before.sequence}.json`,{before,after,observation,image});
 if(!sameCommit(before,after)){diagnostics.push({stage:'capture-'+stateId,status:'not-run',reason:'source owner/frame/commit changed during screenshot',image,beforeSequence:before.sequence,afterSequence:after?.sequence});return null;}
 cell.layoutChecks.push(observation.layout);cell.contentChecks.push(...observation.contentChecks);cell.screenshots.push({stateId,sampleSequence:before.sequence,surfaceId:before.render.surfaceId,scope:'stage',pin:image});
 diagnostics.push(...observation.unsupported.map(row=>({stage:'content',status:'unsupported',...row})));return before;
}
async function natural(page,contract,start,eventSequences,cell,timeoutMs,diagnostics,extra={}) {
 const terminal=await waitSample(page,s=>sourceStateMatches(s,contract.terminal.expectedState)&&s.identity.playerId===start.identity.playerId,timeoutMs,diagnostics,'natural-terminal');
 if(terminal)cell.flows.push({kind:'natural-playback',before:start.sequence,after:terminal.sequence,eventSequences,...extra});return terminal;
}
async function pauseResume(page,parameters,cell,trace,diagnostics,{warmMs=500,holdMs=350,afterResumeMs=0}={}) {
 const before=await snapshot(page);if(!before)return;
 await delay(warmMs);const pause=await dispatch(page,parameters.actions.pause,'pause',cell.config,trace);
 const paused=await waitSample(page,s=>s.host.paused===true,5000,diagnostics,'paused');await delay(holdMs);const held=await snapshot(page);
 const play=await dispatch(page,parameters.actions.play,'play',cell.config,trace);
 let resumed=held&&await waitSample(page,s=>s.host.paused===false&&s.source.tick>held.source.tick,5000,diagnostics,'resumed');
 if(resumed&&afterResumeMs){await delay(afterResumeMs);resumed=await snapshot(page);}
 if(paused&&held&&resumed)cell.flows.push({kind:'pause-resume',before:before.sequence,paused:paused.sequence,held:held.sequence,resumed:resumed.sequence,eventSequences:[...pause.observedEventSequences,...play.observedEventSequences]});
}
async function retireSnapshot(page,identity) {
 const media=await page.evaluate(id=>window.__g678TechnicalObserver.ownedMedia(id),identity.playerId);
 return identity.ownerKind==='surface-run'?{kind:'surface-run',playerId:identity.playerId,runEpoch:identity.runEpoch,sourceNodeIds:media.sourceNodeIds,activeSourceNodes:media.activeSourceNodes,pendingMediaStarts:media.pendingMediaStarts,media}:null;
}
async function ownedBrowserIdentity(profile) {
 const {stdout}=await run('/bin/ps',['-axo','pid=,ppid=,command='],{maxBuffer:8*1024*1024});
 const rows=stdout.split('\n').flatMap(line=>{const m=/^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line);return m?[{pid:Number(m[1]),parentPid:Number(m[2]),command:m[3]}]:[];});
 const main=rows.filter(r=>r.command.includes('--user-data-dir='+profile)&&!r.command.includes('--type='));assert.equal(main.length,1,'one owned browser main process');
 assert(!main[0].command.includes('--headless')&&!main[0].command.includes('--mute-audio'),'headed unmuted browser');
 const audio=rows.filter(r=>r.parentPid===main[0].pid&&r.command.includes('audio.mojom.AudioService'));
 return{mainPid:main[0].pid,audioPids:audio.map(r=>r.pid),profile,headed:true,muteAudio:false,observedAt:new Date().toISOString()};
}
export async function collectPage({root,animationId,contract,contractPin,inputPins,outputDirectory,runId,collectionConfig}) {
 const config=collectionConfig;assert.equal(contract.animationId,animationId);assert.equal(config.browser?.mode,'launch','explicit owned launch mode required');
 assert(['shared-alg001-l06-p002','shared-alg001-l06-p040'].includes(animationId),'collector currently calibrated for ALG P002/P040 only');
 const parameterPin=config.pages?.[animationId]?.parameters;const parameters=JSON.parse(requireFrozenPin(root,inputPins,parameterPin));assert.equal(parameters.animationId,animationId);
 for(const pin of inputPins)actualPin(root,pin);
 const selectedCells=config.cellIds??DEFAULT_CELLS.map(c=>c.cellId);assert(selectedCells.length&&new Set(selectedCells).size===selectedCells.length&&selectedCells.every(id=>DEFAULT_CELLS.some(c=>c.cellId===id)),'exact main-cell subset');
 const raw={kind:'g678-full-technical-raw-v1',animationId,source:contract.source,contractPin,startedAt:new Date().toISOString(),finishedAt:null,preflightPins:inputPins,postflightPins:[],cells:[],supplements:[],collection:{runId,gaps:[],acceptanceEffects:{technicalPassed:false}}};
 let audioTools=null;
 if(config.audio?.enabled)try{audioTools=await qualifyAudioTools({root,inputPins,audioConfig:config.audio,outputDirectory:path.join(outputDirectory,'audio-tool-qualification')});}catch(error){raw.collection.gaps.push({gate:'audio',status:'fail',reason:String(error)});}
 const playwright=createRequire(path.join(root,'package.json'))('playwright');
 for(const expected of DEFAULT_CELLS.filter(c=>selectedCells.includes(c.cellId))) {
  const {cellId,...requested}=expected,directory=path.join(outputDirectory,cellId);fs.mkdirSync(directory,{recursive:true});
  const profile=path.join(directory,'chrome-profile');assert(!fs.existsSync(profile),'fresh owned browser profile');
  const trace=[],diagnostics=[],logs={errors:[],consoleErrors:[],networkErrors:[],cleanupErrors:[]};
  const cell={cellId,config:requested,startedAt:new Date().toISOString(),finishedAt:null,languages:{visual:null,audio:null},...logs,documents:[],flows:[],layoutChecks:[],screenshots:[],contentChecks:[],mediaChecks:[],silenceChecks:[],navigationChecks:[],diagnostics};raw.cells.push(cell);
  let context,page,phase='launch',audioInspection=null,firstAudio=null;const requests=[],captures=[];
  const captureFlow=async(label,{preEntry=false,durationSeconds}={})=>{if(!audioTools||!audioInspection)return null;const audioDirectory=path.join(directory,'audio');fs.mkdirSync(audioDirectory,{recursive:true});
   const allowance=preEntry?(config.audio.preEntryAllowanceSeconds??30):0;assert(allowance>=0&&allowance<=120,'bounded pre-entry capture allowance');
   try {const h=await beginActualAudioCapture({audio:audioTools,inspection:audioInspection,outputDirectory:path.join(audioDirectory,label+'-native'),runId:runId+'-'+cellId+'-'+label,durationSeconds:durationSeconds??Math.ceil((contract.terminal.nominalDurationMs??contract.terminal.minimumDurationMs)/1000+10+allowance)});captures.push(h);return h;}
   catch(error){if(error.captureHandle)captures.push(error.captureHandle);diagnostics.push({stage:'audio-'+label,status:'fail',reason:String(error)});return null;}
  };
  const completeFlowAudio=async(handle,flow,label)=>{if(!handle)return;try{const capture=await finishActualAudioCapture(handle);handle.finished=true;cell.audioCaptures??=[];cell.audioCaptures.push(capture);
   if(flow){const original=await observedRecords(page),records={...original,events:normalizeDispatchedEvents(original.events,trace)};
    const exported=await exportActualFlowAudio({audio:audioTools,capture,contract,contractPin,records,flow,entry:cell.entry,entryPin:cell.entryPin,outputDirectory:path.join(directory,'audio',label+'-analysis'),buildId:contractPin.sha256});cell.mediaChecks.push(...exported.mediaChecks);cell.silenceChecks.push(...exported.silenceChecks);cell.languages.audio=exported.language;cell.audioCaptures.at(-1).export=exported.reportPin;diagnostics.push(...exported.missing.map(m=>({stage:'audio-'+label,status:'fail',...m})));}
   else diagnostics.push({stage:'audio-'+label,status:'not-run',reason:'captured output retained, but no complete natural source flow exists for matching'});
  }catch(error){diagnostics.push({stage:'audio-'+label,status:'fail',reason:String(error)});}};
  try {
   context=await playwright.chromium.launchPersistentContext(profile,{channel:config.browser.channel??'chrome',headless:false,viewport:{width:requested.width,height:requested.height},deviceScaleFactor:requested.dpr,hasTouch:requested.touch,isMobile:requested.touch,locale:requested.locale,reducedMotion:'no-preference',ignoreDefaultArgs:['--mute-audio'],args:['--autoplay-policy=user-gesture-required']});
   await context.addInitScript({content:`window.__g678CommittedRuntimeAdapter=(${createG678CommittedRuntimeAdapter.toString()})(${JSON.stringify({surfaceSelector:parameters.surfaceSelector})});(${installG678TechnicalObserver.toString()})(${JSON.stringify({animationId,sourceSha256:contract.source.sha256,rendererFamily:contract.rendererFamily,runtimeObserverKey:'__g678CommittedRuntimeAdapter',audioRequired:contract.audio?.status!=='not-required',audioSourceHashes:(contract.audio?.cues??[]).map(c=>c.source.sha256)})});`});
   page=context.pages()[0]??await context.newPage();
   page.on('pageerror',error=>logs.errors.push({phase,message:String(error),at:new Date().toISOString()}));
   page.on('console',message=>{if(message.type()==='error')logs.consoleErrors.push({phase,message:message.text(),location:message.location(),at:new Date().toISOString()});});
   page.on('request',request=>{const url=request.url(),owner=/\/g678-local\/(shared-[^/?]+)/.exec(url)?.[1]??null;requests.push({url,method:request.method(),resourceType:request.resourceType(),sourceOwner:owner,phase,at:new Date().toISOString()});});
   page.on('response',response=>{if(response.status()>=400)logs.networkErrors.push({url:response.url(),status:response.status(),sourceOwner:/\/g678-local\/(shared-[^/?]+)/.exec(response.url())?.[1]??null,phase,at:new Date().toISOString()});});
   page.on('requestfailed',request=>logs.networkErrors.push({url:request.url(),status:null,error:request.failure()?.errorText,sourceOwner:/\/g678-local\/(shared-[^/?]+)/.exec(request.url())?.[1]??null,phase,at:new Date().toISOString()}));
   if(audioTools) {
    phase='audio-browser-warmup';const warmTrace=[],warmDiagnostics=[];await enterCourse(page,parameters,animationId,config,requested,warmTrace,warmDiagnostics);
    const warmReady=await waitSample(page,()=>true,config.timeouts?.readyMs??60000,warmDiagnostics,'warmup-source-ready');assert(warmReady,'actual warm-up source ready');
    try {await visibleControl(page,parameters.actions.play);}catch{await dispatch(page,parameters.actions.pause,'pause',requested,warmTrace);}
    await dispatch(page,parameters.actions.play,'play',requested,warmTrace);
    let identity=null;const deadline=Date.now()+15000;while(Date.now()<deadline){identity=await ownedBrowserIdentity(profile);if(identity.audioPids.length===1)break;await delay(100);}
    assert(identity?.audioPids.length===1,'normal source gesture established one AudioService');
    await dispatch(page,parameters.actions.pause,'pause',requested,warmTrace);
    const warmPaused=await waitSample(page,s=>s.host.paused===true,5000,warmDiagnostics,'warmup-paused');assert(warmPaused,'warm-up source paused before capture');
    const warmRecords=await observedRecords(page);cell.warmup=put(directory,'warmup.json',{identity,trace:warmTrace,diagnostics:warmDiagnostics,observer:warmRecords,logs:structuredClone(logs),acceptance:false});
    const inspected=await inspectOwnedAudioBrowser({audio:audioTools,profile,mainPid:identity.mainPid,outputDirectory:path.join(directory,'audio-identity')});
    cell.audioIdentity=inspected.receipt;cell.audioNegativeControls=await runFreshAudioNegatives({audio:audioTools,inspection:inspected.inspection,inspectionPin:inspected.receipt,outputDirectory:path.join(directory,'audio-identity')});audioInspection=inspected.inspection;
    firstAudio=await captureFlow('natural-first',{preEntry:true});
    // Capture is ready before the fresh normal course document can autoplay.
    // Warm-up records above remain retained; the following logs belong to the new document.
    for(const values of Object.values(logs))values.length=0;
   }
   phase='normal-entry';cell.entry=await enterCourse(page,parameters,animationId,config,requested,trace,diagnostics);
   cell.entryPin=put(directory,'normal-entry.json',cell.entry);
   if(requested.rootFontPx!==16)await page.addStyleTag({content:`html{font-size:${requested.rootFontPx}px!important}`});
   const initial=await waitSample(page,s=>sourceStateMatches(s,contract.terminal.initialState),config.timeouts?.readyMs??60000,diagnostics,'source-initial');
   assert(initial,'real initial source state missing');cell.config=initial.viewport;cell.observationStartMs=initial.atMs;
   cell.languages=await page.evaluate(({ownerSelector,surfaceSelector})=>{const node=document.querySelector(ownerSelector),surface=document.querySelector(surfaceSelector);const explicit=node?.querySelector('[lang]')?.getAttribute('lang')??surface?.getAttribute('lang');return{visual:explicit??null,audio:null};},parameters);
   // Source-bound language is separately observed in exact renderer metadata; absent metadata stays unknown.
   const sourceLanguage=await page.evaluate(id=>window.HELP_MATH_CANVAS_ASSETS?.[id]?.metadata?.sourceLanguage??null,animationId);
   if(sourceLanguage)cell.languages.visual=sourceLanguage;
   else if(['en','es'].includes(initial.source.language))cell.languages.visual=initial.source.language;
   cell.browser={version:context.browser()?.version()??await page.evaluate(()=>navigator.userAgent),identity:await ownedBrowserIdentity(profile)};
   await captureState(page,parameters,'initial',contract,cell,directory,diagnostics);
   phase='natural-first';let startEvents=[],startKind='normal-entry';
   if(initial.host.paused===true){const play=await dispatch(page,parameters.actions.play,'play',requested,trace);startEvents=play.observedEventSequences;startKind='play';}
   const terminal=await natural(page,contract,initial,startEvents,cell,config.timeouts?.naturalMs??Math.ceil((contract.terminal.nominalDurationMs??contract.terminal.minimumDurationMs)*1.35+15000),diagnostics,{startKind});
   if(terminal)await captureState(page,parameters,'terminal',contract,cell,directory,diagnostics);
   await completeFlowAudio(firstAudio,cell.flows.find(f=>f.kind==='natural-playback'&&f.before===initial.sequence),'natural-first');
   if(terminal) {
    const replayAudio=await captureFlow('natural-replay');
    phase='replay';const replay=await dispatch(page,parameters.actions.replay,'replay',requested,trace);
    const reset=await waitSample(page,s=>s.identity.playerId!==terminal.identity.playerId&&sourceStateMatches(s,contract.terminal.initialState),5000,diagnostics,'replay-initial',terminal.sequence);
    if(reset) {
     const retired=await retireSnapshot(page,terminal.identity);cell.flows.push({kind:'replay',before:terminal.sequence,after:reset.sequence,eventSequences:replay.observedEventSequences,retired});
     // Replay may autoplay the fresh run. Its old-owner input is retained as the real causal start.
     phase='natural-replay';await natural(page,contract,reset,replay.observedEventSequences,cell,config.timeouts?.naturalMs??Math.ceil((contract.terminal.nominalDurationMs??contract.terminal.minimumDurationMs)*1.35+15000),diagnostics,{startKind:'replay',replayFlowBefore:terminal.sequence,replayFlowAfter:reset.sequence});
     await completeFlowAudio(replayAudio,cell.flows.find(f=>f.kind==='natural-playback'&&f.before===reset.sequence),'natural-replay');
     const lifecycleAudio=await captureFlow('control-lifecycle',{durationSeconds:12});
     const beforeControlReset=await snapshot(page),controlReplay=await dispatch(page,parameters.actions.replay,'replay',requested,trace);
     const controlInitial=await waitSample(page,s=>s.identity.playerId!==beforeControlReset.identity.playerId&&sourceStateMatches(s,contract.terminal.initialState),5000,diagnostics,'control-run-initial',beforeControlReset.sequence);
     if(controlInitial){cell.flows.push({kind:'control-reset',before:beforeControlReset.sequence,after:controlInitial.sequence,eventSequences:controlReplay.observedEventSequences,purpose:'separate actual pause-resume scenario; no additional complete natural playback claim'});phase='pause-resume';await pauseResume(page,parameters,cell,trace,diagnostics,{warmMs:2500,holdMs:1000,afterResumeMs:1000});
      const pauseFlow=cell.flows.findLast(f=>f.kind==='pause-resume'),stop=await dispatch(page,parameters.actions.pause,'pause',requested,trace);
      const stopped=await waitSample(page,s=>s.host.paused===true,5000,diagnostics,'control-stopped');await delay(800);const afterStop=await snapshot(page);
      const stopFlow=stopped&&afterStop?{kind:'control-stop',stopped:stopped.sequence,after:afterStop.sequence,eventSequences:stop.observedEventSequences}:null;if(stopFlow)cell.flows.push(stopFlow);
      if(lifecycleAudio)try{const capture=await finishActualAudioCapture(lifecycleAudio);lifecycleAudio.finished=true;cell.audioCaptures??=[];cell.audioCaptures.push(capture);const original=await observedRecords(page),records={...original,events:normalizeDispatchedEvents(original.events,trace)};cell.audioLifecycle=await assessActualLifecycleAudio({audio:audioTools,capture,contract,records,pauseFlow,stopFlow,outputDirectory:path.join(directory,'audio/control-lifecycle-analysis'),buildId:contractPin.sha256});}catch(error){diagnostics.push({stage:'audio-lifecycle',status:'fail',reason:String(error)});}
     }

    }
   }
   if(!cell.mediaChecks.length)diagnostics.push({stage:'audio',status:'not-run',reason:'no complete actual-output cue passed its source comparison; native traces alone give no output audio credit'});
   if(!cell.audioLifecycle)diagnostics.push({stage:'audio-lifecycle',status:'not-run',reason:'no complete measured pause/resume/stop PCM result; native traces alone give no output credit'});
   diagnostics.push({stage:'audio-navigation-cleanup',status:'not-run',reason:'destination audio isolation and old-run navigation cleanup still require actual evidence'});
   diagnostics.push({stage:'navigation',status:'not-run',reason:'destination drawing/retirement observation not yet connected; no navigation passed flag is supplied'});
   for(const stateId of contract.layout.requiredStateIds)if(!cell.screenshots.some(s=>s.stateId===stateId))diagnostics.push({stage:'layout',stateId,status:'not-run',reason:'no same-commit screenshot was obtained; natural trace samples are preserved separately'});
  } catch(error) {logs.errors.push({phase,message:String(error),at:new Date().toISOString()});diagnostics.push({stage:phase,status:'fail',reason:String(error)});}
  finally {
   for(const handle of captures.filter(h=>!h.finished))try{const retained=await finishActualAudioCapture(handle);handle.finished=true;cell.audioCaptures??=[];cell.audioCaptures.push({...retained,unassessed:true});}catch(error){logs.cleanupErrors.push({phase:'native-capture-finish',message:String(error)});}
   if(page&&!page.isClosed())try {
    const records=await observedRecords(page);if(records){put(directory,'observer-original.json',records);cell.documents=[{documentId:records.documentId,samples:records.samples.filter(sample=>sample.atMs>=cell.observationStartMs),events:normalizeDispatchedEvents(records.events.filter(event=>event.atMs>=cell.observationStartMs),trace),errors:records.errors}];cell.observerCapabilities={unsupported:records.unsupported,statuses:records.statuses};}
    put(directory,'requests.json',requests);put(directory,'dispatcher.json',trace);cell.dispatcherTrace=put(directory,'dispatcher-pinned.json',{kind:'public-input-dispatcher-v1',commands:trace});
    if(logs.errors.length)put(directory,'failure.png',await page.screenshot({fullPage:false,animations:'allow'}));
   } catch(error){logs.cleanupErrors.push({phase:'retain',message:String(error)});}
   try {await context?.close();
    if(context){let present=true;const deadline=Date.now()+10000;while(present&&Date.now()<deadline){const {stdout}=await run('/bin/ps',['-axo','command='],{maxBuffer:8*1024*1024});present=stdout.split('\n').some(command=>command.includes('--user-data-dir='+profile)&&!command.includes('--type='));if(present)await delay(100);}
      cell.browserCleanup={profile,ownedMainAbsent:!present,observedAt:new Date().toISOString()};if(present)throw Error('owned browser main remained after context.close');}
   }catch(error){logs.cleanupErrors.push({phase:'close-owned-browser',message:String(error)});}
   cell.finishedAt=new Date().toISOString();cell.logPin=put(directory,'logs.json',logs);put(directory,'cell.json',cell);
  }
 }
 for(const locale of ['en','es'])for(const stateId of contract.layout.requiredStateIds)for(const id of REQUIRED_SUPPLEMENT_IDS)raw.collection.gaps.push({gate:'supplement',locale,stateId,id,status:'not-run',reason:'supplement observation not executed by this first collector'});
 for(const pin of inputPins)actualPin(root,pin);raw.postflightPins=inputPins;raw.finishedAt=new Date().toISOString();put(outputDirectory,'raw-v1.json',raw);return raw;
}
