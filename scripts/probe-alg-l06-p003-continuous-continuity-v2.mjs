#!/usr/bin/env node
/** Independent real-user-control continuity checks. --plan does not open Chrome.
 * Native AudioContext calls are observed and forwarded unchanged. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331';
const ID='shared-alg001-l06-p003';
const PAGE=`/migration-status/g678-calibration/${ID}/continuous-v2`;
const SOURCE=`/flash-assets/g678-local/${ID}/continuous-source-v2?sha256=91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111`;
const RUNTIME='[data-p003-continuous-v2="true"]';
const HOST='[data-current-animation-id][data-hydrated="true"]';
const OUTPUT='output/alg-l06-p003-audio-alignment-20260928/browser-continuity-v2';
const INPUTS=[
 'scripts/probe-alg-l06-p003-continuous-continuity-v2.mjs',
 'apps/web/components/g678-alg-l06-p003-continuous-runtime-v2.tsx',
 'apps/web/components/g678-alg-l06-p003-continuous-host-lesson-v2.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/legacy-responsive-lesson-shell.tsx',
 'apps/web/lib/alg-l06-p003-continuous-candidate-v2.server.ts',
 'apps/web/lib/alg-l06-p003-continuous-source-access-v2.ts',
 'apps/web/lib/alg-l06-p003-local-audio-request-v1.ts',
 'apps/web/lib/alg-l06-p003-continuous-source-v2.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2/page.tsx',
 'packages/demos/src/alg-l06-p003-continuous-source-clock-v2.ts',
 'packages/demos/src/alg-l06-p003-continuous-audio-schedule-v2.ts',
 'packages/demos/private-current-js-registry.json',
];
const hash=b=>createHash('sha256').update(b).digest('hex');
async function pins(){return Promise.all(INPUTS.map(async relative=>{
 const file=path.join(ROOT,relative);assert.equal(await realpath(file),file);
 const before=await lstat(file,{bigint:true});assert(before.isFile()&&!before.isSymbolicLink());
 const bytes=await readFile(file),after=await lstat(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs'])assert.equal(before[key],after[key]);
 return {path:relative,bytes:bytes.length,sha256:hash(bytes)};
}));}
export function plan(){return {kind:'alg-l06-p003-continuity-plan-v2',base:BASE,
 entry:`${BASE}/en${PAGE}`,exactDelayedRequest:`${BASE}${SOURCE}`,
 scenarios:['play-next-cleanup-previous-held','replay-during-play-held',
  'visible-key-terms-tool-open-close-observation','visible-locale-link-en-to-es-no-new-autoplay',
  'pending-full-mp3-response-next-cancellation'],
 assertions:['No arbitrary seek or direct transport invocation','No synthetic time/media',
  'Observe native context/node cleanup','No SA request from locale change',
  'Record key terms behavior; do not assume glossary source interaction'],
 browserLaunched:false,acceptanceEffect:'none'};}
async function instrument(page,record){
 await page.exposeBinding('__p003ContinuityNote',(_,event)=>record.nativeJournal.push(event));
 await page.addInitScript(()=>{
  const documentId=`${Date.now()}-${Math.random()}`;
  const state={documentId,events:[],contexts:[],nodes:[]};
  window.__p003Continuity=state;
  const note=(kind,detail={})=>{const event={documentId,kind,atMs:performance.now(),...detail};
   state.events.push(event);void window.__p003ContinuityNote(event).catch(()=>{});};
  const Native=window.AudioContext;
  window.AudioContext=class extends Native{
   constructor(...args){super(...args);const id=state.contexts.length+1;state.contexts.push({id,context:this});
    note('context-created',{id,sampleRate:this.sampleRate});
    const create=this.createBufferSource.bind(this);
    this.createBufferSource=()=>{const node=create(),nodeId=state.nodes.length+1;
     const entry={id:nodeId,contextId:id,started:false,stopped:false,disconnected:false,ended:false};state.nodes.push(entry);
     for(const method of ['start','stop','disconnect']){const native=node[method].bind(node);node[method]=(...values)=>{
      if(method==='start')entry.started=true;if(method==='stop')entry.stopped=true;if(method==='disconnect')entry.disconnected=true;
      note(method,{contextId:id,nodeId,args:values});return native(...values);};}
     node.addEventListener('ended',()=>{entry.ended=true;note('ended',{contextId:id,nodeId});});return node;};
    for(const method of ['resume','close']){const native=this[method].bind(this);this[method]=async(...values)=>{
     note(`${method}-called`,{contextId:id});const result=await native(...values);note(`${method}-resolved`,{contextId:id,state:this.state});return result;};}
   }
  };
  addEventListener('pagehide',()=>note('pagehide',{contexts:state.contexts.map(x=>({id:x.id,state:x.context.state}))}));
 });
}
async function state(page){return page.evaluate(()=>{
 const s=window.__p003Continuity,r=document.querySelector('[data-p003-continuous-v2="true"]');
 return {documentId:s.documentId,url:location.href,phase:r?.getAttribute('data-p003-probe-phase')??null,
 frame:Number(document.querySelector('canvas[data-course-canvas="shared-alg001-l06-p003"]')?.getAttribute('data-flash-frame')),
 lessonComplete:r?.getAttribute('data-runtime-playback-complete')??null,
 animationId:document.querySelector('[data-current-animation-id]')?.getAttribute('data-current-animation-id'),
 contexts:s.contexts.map(x=>({id:x.id,state:x.context.state})),nodes:s.nodes,events:s.events};
});}
const control=(page,key)=>page.locator(`[data-responsive-focus-key="${key}"]:visible`).first();
async function ready(page){await page.locator(`${RUNTIME}[data-source-clock-ready="true"]`).waitFor();}
async function held(page){await page.waitForFunction(()=>{
 const r=document.querySelector('[data-p003-continuous-v2="true"]');return r?.getAttribute('data-p003-probe-phase')==='ready'&&
 document.querySelector('canvas[data-course-canvas="shared-alg001-l06-p003"]')?.getAttribute('data-flash-frame')==='1';});}
async function play(page){await control(page,'pause').click();await page.waitForFunction(()=>
 document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='playing');
 await page.waitForFunction(()=>Number(document.querySelector('canvas[data-course-canvas="shared-alg001-l06-p003"]')?.getAttribute('data-flash-frame'))>=45);}
async function next(page){await control(page,'next').click();await page.locator(`${HOST}[data-current-animation-id="shared-alg001-l06-p004"]`).waitFor();}
async function cleanupIds(page,ids){await page.waitForFunction(ids=>ids.every(id=>window.__p003Continuity.contexts.find(x=>x.id===id)?.context.state==='closed'),ids);}
function starts(value){return value.events.filter(e=>e.kind==='start').length;}
async function session(browser,name,out,body){
 const record={name,status:'running',steps:[],nativeJournal:[],requests:[],failedRequests:[],pageErrors:[],consoleErrors:[],failure:null};
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(90000);
 await instrument(page,record);
 await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==BASE){record.pageErrors.push(`nonlocal request ${route.request().url()}`);return route.abort();}return route.continue();});
 page.on('request',r=>record.requests.push({url:r.url(),method:r.method()}));
 page.on('requestfailed',r=>record.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
 page.on('pageerror',e=>record.pageErrors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')record.consoleErrors.push(m.text());});
 try{await body(page,record);assert.deepEqual(record.pageErrors,[]);assert.deepEqual(record.consoleErrors,[]);record.status='passed';}
 catch(error){record.status='failed';record.failure=String(error?.stack??error);await page.screenshot({path:path.join(out,`${name}-failure.png`),fullPage:true}).catch(()=>{});}
 finally{record.final=await state(page).catch(()=>null);await context.close();record.browserContextClosed=true;
  await writeFile(path.join(out,`${name}.json`),JSON.stringify(record,null,2)+'\n',{flag:'wx'});}
 return record;
}
async function normal(page,record){
 await page.goto(`${BASE}/en${PAGE}`,{waitUntil:'domcontentloaded'});await ready(page);await held(page);
 await play(page);const playing=await state(page);record.steps.push({step:'playing-before-next',...playing});
 const ids=playing.contexts.map(x=>x.id);await next(page);await cleanupIds(page,ids);
 const afterNext=await state(page);assert(afterNext.nodes.filter(n=>ids.includes(n.contextId)&&n.started).every(n=>n.stopped&&n.disconnected));
 record.steps.push({step:'next-cleaned-up',...afterNext});
 await control(page,'previous').click();await ready(page);await held(page);await page.waitForTimeout(600);
 const returned=await state(page);assert.equal(returned.frame,1);assert.equal(starts(returned),starts(afterNext));record.steps.push({step:'previous-held-no-autoplay',...returned});
 await play(page);const beforeReplay=await state(page);await control(page,'replay').click();await held(page);await page.waitForTimeout(600);
 const replay=await state(page);assert.equal(replay.frame,1);assert.equal(starts(replay),starts(beforeReplay));assert.equal(replay.lessonComplete,'false');record.steps.push({step:'replay-held',...replay});
 await play(page);
 const terms=control(page,'key-terms');
 if(await terms.count()&&await terms.isEnabled()){
  const before=await state(page);await terms.click();await page.locator('[data-key-terms-authority]:visible').waitFor();await page.waitForTimeout(400);
  const during=await state(page);await page.getByRole('button',{name:'Close tool',exact:true}).click();await page.waitForTimeout(400);
  record.steps.push({step:'key-terms-tool-observed',before,during,after:await state(page),
   note:'Generic source-bound Key Terms tool; not a page-authored glossary link. Observed pause/return is recorded without assuming a source contract.'});
 }else record.steps.push({step:'key-terms-unavailable'});
 // Normalize by a genuine learner Pause click if the tool retained playback.
 if((await state(page)).phase==='playing')await control(page,'pause').click();
 await play(page);const beforeLocale=await state(page),requestStart=record.requests.length;
 const language=control(page,'language-es');assert.equal(await language.getAttribute('data-modern-language-switch'),'true');
 const href=await language.getAttribute('href');assert(href&&new URL(href,BASE).pathname===`/es${PAGE}`,'exact visible lesson-language link');
 await language.click();await page.waitForURL(url=>url.pathname===`/es${PAGE}`);await ready(page);await page.waitForTimeout(600);
 const afterLocale=await state(page),localeRequests=record.requests.slice(requestStart);
 const sameDocument=beforeLocale.documentId===afterLocale.documentId;
 if(sameDocument){assert.equal(starts(afterLocale),starts(beforeLocale),'locale must not create an additional source start');
  const old=beforeLocale.contexts.filter(x=>x.state!=='closed').map(x=>x.id);
  const retained=old.some(id=>afterLocale.contexts.some(x=>x.id===id&&x.state!=='closed'));
  record.steps.push({step:'locale-switch',semantics:retained?'same-document-clock-retained':'same-document-clock-replaced-held',before:beforeLocale,after:afterLocale});
 }else{assert.equal(starts(afterLocale),0,'new document remains held');assert.equal(afterLocale.frame,1);
  record.steps.push({step:'locale-switch',semantics:'new-document-held; old realm destroyed by navigation; explicit old close not assumed',before:beforeLocale,after:afterLocale});}
 assert(!localeRequests.some(r=>/\/SA\/|spanish-audio|optional-sa|separate-sa/iu.test(r.url)),'locale must not request SA');
 assert.equal(afterLocale.lessonComplete,'false');
 await next(page);await page.waitForFunction(()=>window.__p003Continuity.contexts.every(x=>x.context.state==='closed'));
 record.steps.push({step:'final-next-cleanup',...await state(page)});
}
async function delayed(page,record){
 let release,seen;const gate=new Promise(resolve=>{release=resolve;});const capturedRequest=new Promise(resolve=>{seen=resolve;});const pending=[];let captured=0;
 await page.route(`${BASE}${SOURCE}`,route=>{
  captured++;seen();const job=(async()=>{const response=await route.fetch({timeout:30000});await gate;
   try{await route.fulfill({response});record.steps.push({step:'obsolete-source-response-fulfilled'});}
   catch(error){record.steps.push({step:'obsolete-source-response-rejected',error:String(error)});}})();
  pending.push(job);return job;
 });
 try{
  await page.goto(`${BASE}/en${PAGE}`,{waitUntil:'domcontentloaded'});
  await page.locator(`${HOST}[data-current-animation-id="${ID}"]`).waitFor();
  await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')!==null);
  let captureTimer;try{await Promise.race([capturedRequest,new Promise((_,reject)=>{captureTimer=setTimeout(()=>reject(Error('full-stream interception timeout')),30000);})]);}finally{clearTimeout(captureTimer);}
  assert(captured>0,'exact full-stream request intercepted before next');
  const before=await state(page);assert.equal(starts(before),0);assert.equal(before.phase,'loading');
  await next(page);release();await Promise.allSettled(pending);await page.waitForTimeout(600);
  const after=await state(page);assert.equal(after.animationId,'shared-alg001-l06-p004');assert.equal(starts(after),0);
  assert(after.contexts.every(x=>x.state==='closed'),'obsolete response cannot create/leak a context');
  assert(record.failedRequests.some(r=>r.url===`${BASE}${SOURCE}`),'obsolete source fetch cancellation observed');
  record.steps.push({step:'pending-fetch-navigation-cancellation',captured,before,after});
 }finally{release();await Promise.allSettled(pending);await page.unroute(`${BASE}${SOURCE}`);}
}
export async function run(slug){
 assert(/^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug),'unique evidence slug');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware');
 const out=path.join(ROOT,OUTPUT,slug);await mkdir(path.dirname(out),{recursive:true});await mkdir(out);
 const record={kind:'alg-l06-p003-continuity-v2',startedAt:new Date().toISOString(),status:'running',cases:[],errors:[],acceptanceEffect:'none'};
 let browser;
 try{record.inputsBefore=await pins();browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--autoplay-policy=document-user-activation-required']});
  record.browserVersion=browser.version();record.cases.push(await session(browser,'navigation-replay-locale',out,normal));record.cases.push(await session(browser,'pending-source-cancellation',out,delayed));
 }catch(error){record.errors.push(String(error?.stack??error));}
 finally{if(browser){await browser.close();record.browserDisconnected=!browser.isConnected();}
  record.inputsAfter=await pins();record.inputsStable=JSON.stringify(record.inputsBefore)===JSON.stringify(record.inputsAfter);
  record.status=record.errors.length===0&&record.inputsStable&&record.cases.length===2&&record.cases.every(c=>c.status==='passed')?'technical-pass-not-acceptance':'failed';
  record.finishedAt=new Date().toISOString();await writeFile(path.join(out,'result.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({out,status:record.status,cases:record.cases.map(c=>({name:c.name,status:c.status,failure:c.failure})),errors:record.errors}));if(record.status==='failed')process.exitCode=1;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);if(args.length===1&&args[0]==='--plan')console.log(JSON.stringify({...plan(),inputs:await pins()}));
 else{assert(args.length===2&&args[0]==='--run','Usage: --plan | --run <unique-slug>');await run(args[1]);}
}
