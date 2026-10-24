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
const OUTPUT='output/alg-l06-p003-audio-alignment-20260928/browser-spanish-host-v2';
const SA=`/flash-assets/g678-local/${ID}/optional-spanish-audio-v1?sha256=d280e8f5e653c165755baf2f8960cfd667f03205d2f9aaafe1820a15d327f89a`;
const INPUTS=[
 'scripts/probe-alg-l06-p003-continuous-spanish-v2.mjs',
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
 'packages/demos/src/alg-l06-p003-optional-spanish-audio-v1.ts',
 'apps/web/lib/alg-l06-p003-optional-spanish-v1.server.ts',
 'apps/web/lib/alg-l06-p003-optional-spanish-access-v1.ts',
];
const hash=b=>createHash('sha256').update(b).digest('hex');
async function pins(){return Promise.all(INPUTS.map(async relative=>{
 const file=path.join(ROOT,relative);assert.equal(await realpath(file),file);
 const before=await lstat(file,{bigint:true});assert(before.isFile()&&!before.isSymbolicLink());
 const bytes=await readFile(file),after=await lstat(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs'])assert.equal(before[key],after[key]);
 return {path:relative,bytes:bytes.length,sha256:hash(bytes)};
}));}
export function plan(){return {entry:BASE+'/en'+PAGE,scenarios:['explicit-start-pause-restart-return','natural-sa-return','terminal-sa-held','replay-navigation-cancel','late-sa-request-cancel'],acceptanceEffect:'none'};}
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
 saSelected:r?.getAttribute('data-p003-sa-selected'),saPhase:r?.getAttribute('data-p003-sa-phase'),
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
 const context=await browser.newContext({viewport:name.includes('mobile')?{width:390,height:844}:{width:1440,height:1000},reducedMotion:name.includes('mobile')?'reduce':'no-preference',serviceWorkers:'block'});
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

const saStart=p=>p.locator('[data-p003-sa-start]');
const saReturn=p=>p.locator('[data-p003-sa-return]');
async function saPhase(page,phase){await page.waitForFunction(phase=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-sa-phase')===phase,phase);}
async function mainPlaying(page){await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='playing');}
async function mainHeld(page,before){await page.waitForTimeout(500);const after=await state(page);assert.equal(after.frame,before.frame);assert.equal(after.lessonComplete,'false');return after;}
async function normal(page,record){
 const lang=record.name.includes('mobile')?'es':'en';
 await page.goto(`${BASE}/${lang}${PAGE}`,{waitUntil:'domcontentloaded'});await ready(page);await held(page);
 const initial=await state(page);assert.equal(starts(initial),0);assert(!record.requests.some(r=>r.url.includes('optional-spanish-audio')));
 await play(page);await saStart(page).focus();await page.keyboard.press('Enter');await saPhase(page,'playing');
 const spanish=await state(page);assert.equal(spanish.phase,'paused');await mainHeld(page,spanish);
 assert(spanish.nodes.filter(n=>n.contextId===1&&n.started).every(n=>n.stopped&&n.disconnected));
 const start=spanish.events.filter(e=>e.kind==='start').at(-1);assert.equal(start.args[1],0);record.steps.push({step:'explicit-sa-with-main-held',...spanish});
 await control(page,'pause').click();await saPhase(page,'paused');const paused=await state(page);await mainHeld(page,paused);
 await cleanupIds(page,[start.contextId]);record.steps.push({step:'sa-pause-cleaned',...await state(page)});
 await saStart(page).click();await saPhase(page,'playing');const restarted=await state(page);assert.equal(restarted.events.filter(e=>e.kind==='start').at(-1).args[1],0);
 await saReturn(page).click();await mainPlaying(page);assert.equal((await state(page)).saSelected,'false');record.steps.push({step:'explicit-return-main-resumed',...await state(page)});
 await saStart(page).click();await saPhase(page,'playing');const natural=await state(page);await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-sa-selected')==='false',null,{timeout:20000});
 await mainPlaying(page);await cleanupIds(page,[natural.events.filter(e=>e.kind==='start').at(-1).contextId]);record.steps.push({step:'natural-sa-ended-returned',...await state(page)});
 await saStart(page).click();await saPhase(page,'playing');await control(page,'replay').click();await held(page);assert.equal((await state(page)).saSelected,'false');record.steps.push({step:'replay-cancels-sa-held1',...await state(page)});
 await saStart(page).click();await saPhase(page,'playing');const beforeNext=await state(page);await next(page);await cleanupIds(page,beforeNext.contexts.map(c=>c.id));record.steps.push({step:'navigation-all-contexts-closed',...await state(page)});
}
async function terminal(page,record){
 await page.goto(`${BASE}/en${PAGE}`,{waitUntil:'domcontentloaded'});await ready(page);await play(page);
 await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-source-timeline-ended')==='true',null,{timeout:70000});
 await saStart(page).click();await saPhase(page,'playing');assert.equal((await state(page)).frame,719);
 await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-sa-selected')==='false',null,{timeout:20000});
 const after=await state(page);assert.equal(after.frame,719);assert.equal(after.phase,'timeline-ended');assert.equal(after.lessonComplete,'false');
 record.steps.push({step:'natural-sa-at-terminal-remains719',...after});
 await saStart(page).click();await saPhase(page,'playing');await saReturn(page).click();await mainHeld(page,after);record.steps.push({step:'explicit-return-at-terminal-remains719',...await state(page)});
 await next(page);await page.waitForFunction(()=>window.__p003Continuity.contexts.every(c=>c.context.state==='closed'));
}
async function delayed(page,record){
 let release,seen;const gate=new Promise(resolve=>release=resolve),requested=new Promise(resolve=>seen=resolve);const pending=[];
 await page.route(`${BASE}${SA}`,route=>{seen();const job=(async()=>{const response=await route.fetch();await gate;try{await route.fulfill({response});}catch{}})();pending.push(job);return job;});
 try{
 await page.goto(`${BASE}/en${PAGE}`,{waitUntil:'domcontentloaded'});await ready(page);await saStart(page).click();await requested;await saPhase(page,'loading');const before=await state(page);assert.equal(starts(before),0);
 const action=record.name;
 if(action==='late-return'){await saReturn(page).click();await mainPlaying(page);}
 else if(action==='late-replay'){await control(page,'replay').click();await held(page);}
 else await next(page);
 release();await Promise.allSettled(pending);await page.waitForTimeout(700);const after=await state(page);
 assert.equal(after.contexts.length,1,'canceled SA must not create a second context');
 if(action==='late-return'){assert.equal(after.phase,'playing');assert.equal(after.saSelected,'false');assert(after.frame>1);}
 else {assert.equal(starts(after),0);if(action==='late-replay')assert.equal(after.frame,1);else assert(after.contexts.every(c=>c.state==='closed'));}
 assert(record.failedRequests.some(r=>r.url===BASE+SA));record.steps.push({step:action+'-obsolete-sa-response-cannot-play',before,after});
 if(action!=='late-request'){await next(page);await page.waitForFunction(()=>window.__p003Continuity.contexts.every(c=>c.context.state==='closed'));}
 }finally{release();await Promise.allSettled(pending);await page.unroute(`${BASE}${SA}`);}
}
export async function run(slug){
 assert(/^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug),'unique evidence slug');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware');
 const out=path.join(ROOT,OUTPUT,slug);await mkdir(path.dirname(out),{recursive:true});await mkdir(out);
 const record={kind:'alg-l06-p003-spanish-host-v2',startedAt:new Date().toISOString(),status:'running',cases:[],errors:[],acceptanceEffect:'none'};
 let browser;
 try{record.inputsBefore=await pins();browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--autoplay-policy=document-user-activation-required']});
  record.browserVersion=browser.version();for(const [name,body] of [['en-controls',normal],['es-mobile-controls',normal],['terminal-natural',terminal],['late-request',delayed],['late-return',delayed],['late-replay',delayed]])record.cases.push(await session(browser,name,out,body));
 }catch(error){record.errors.push(String(error?.stack??error));}
 finally{if(browser){await browser.close();record.browserDisconnected=!browser.isConnected();}
  record.inputsAfter=await pins();record.inputsStable=JSON.stringify(record.inputsBefore)===JSON.stringify(record.inputsAfter);
  record.status=record.errors.length===0&&record.inputsStable&&record.cases.length===6&&record.cases.every(c=>c.status==='passed')?'technical-pass-not-acceptance':'failed';
  record.finishedAt=new Date().toISOString();await writeFile(path.join(out,'result.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({out,status:record.status,cases:record.cases.map(c=>({name:c.name,status:c.status,failure:c.failure})),errors:record.errors}));if(record.status==='failed')process.exitCode=1;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);if(args.length===1&&args[0]==='--plan')console.log(JSON.stringify({...plan(),inputs:await pins()}));
 else{assert(args.length===2&&args[0]==='--run','Usage: --plan | --run <unique-slug>');await run(args[1]);}
}
