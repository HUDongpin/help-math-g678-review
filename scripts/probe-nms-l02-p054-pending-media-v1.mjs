#!/usr/bin/env node
/** Real pending source-media cancellation in the local P054 My Lesson candidate. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {plan as productPlan,preflight as productPreflight}
 from './probe-nms-l02-p054-product-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331';
const ID='shared-nms002-l02-p054',PREVIOUS='shared-nms002-l02-p064';
const HOST='[data-lesson-player][data-current-animation-id]';
const BOARD=`${HOST}[data-current-animation-id="${ID}"] .p054-board[data-animation-id="${ID}"]`;
const QUIZ=`${HOST}[data-current-animation-id="${PREVIOUS}"] [data-animation-id="${PREVIOUS}"][data-p064-phase]`;
const OUTPUT='output/nms-l02-p054-product-20260928/browser/pending-media-v1';
const CASES=Object.freeze([
 {name:'en-level1',locale:'en',level:1,width:1440,height:900,reducedMotion:'no-preference'},
 {name:'es-level2-reduced',locale:'es',level:2,width:390,height:844,reducedMotion:'reduce'},
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const disk=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);
const pin=async relative=>{const bytes=await readFile(disk(relative));
 return{path:relative,bytes:bytes.length,sha256:sha(bytes)};};
async function pins(paths){return Promise.all(paths.map(pin));}
async function bounded(promise,label,ms=15000){let timer;try{return await Promise.race([
 promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(`P054 pending ${label} timed out`)),ms);}),
 ]);}finally{clearTimeout(timer);}}
export function parseArgs(args){
 if(args.length===1&&args[0]==='--plan')return{mode:'plan'};
 assert(args.length===2&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]??''),
  'Usage: --plan | --run <unique-slug>');
 return{mode:'run',slug:args[1]};
}
export function plan(){return{
 schemaVersion:1,kind:'nms-l02-p054-pending-media-browser-v1',formal:false,
 origin:ORIGIN,route:`${ORIGIN}/{en|es}/migration-status/g678-calibration/${ID}[?level=2]`,
 cases:CASES,animationId:ID,source:productPlan().source,feedbackAudio:productPlan().feedbackAudio,
 checks:['hold actual same-origin correct and wrong source responses on the first mount only',
  'host Replay aborts both pending requests; stale responses cannot create Blob Audio or play',
  'new mount obtains two exact source MP3s and remains paused without autoplay',
  'pending navigation to registered P064 aborts both requests; P054 return restores ready initial state',
  'browser requestfailed and in-page AbortError observations are required, not a fixed sleep',
  'technical lifecycle evidence only; no original-runtime or listening acceptance'],
 inputPaths:[...productPlan().inputPaths,'scripts/probe-nms-l02-p054-pending-media-v1.mjs',
  'scripts/probe-nms-l02-p054-pending-media-v1.test.mjs'],outputRoot:OUTPUT,
 };}
async function preflight(){
 const product=await productPreflight();
 const paths=[...product.paths,'scripts/probe-nms-l02-p054-pending-media-v1.mjs',
  'scripts/probe-nms-l02-p054-pending-media-v1.test.mjs'];
 assert.equal(new Set(paths).size,paths.length);
 return{paths,before:await pins(paths)};
}
function installTrace(){
 const trace={audio:[],events:[],fetchFailures:[]};
 Object.defineProperty(window,'__P054_PENDING',{value:trace});
 const NativeAudio=window.Audio;
 window.Audio=new Proxy(NativeAudio,{construct(target,args){
  const audio=Reflect.construct(target,args,target),id=trace.audio.length;
  trace.audio.push(audio);
  for(const type of ['play','playing','pause','ended','abort','emptied','error'])
   audio.addEventListener(type,()=>trace.events.push({id,type,at:performance.now(),paused:audio.paused}));
  return audio;
 }});
 const nativeFetch=window.fetch;
 window.fetch=async function(...args){
  try{return await nativeFetch.apply(this,args);}
  catch(error){const target=args[0] instanceof Request?args[0].url:String(args[0]);
   if(target.includes('/shared-nms002-l02-p054/feedback-audio/'))
    trace.fetchFailures.push({url:target,name:error?.name??null,message:String(error),at:performance.now()});
   throw error;}
 };
}
function holdFeedback(page,record){
 const state={phase:'hold',held:{correct:null,wrong:null},sourceResponses:[],release:[]};
 const expected=productPlan().feedbackAudio;
 const routePattern=new RegExp(`/flash-assets/g678-local/${ID}/feedback-audio/(correct|wrong)$`,'u');
 page.route('**/feedback-audio/**',async route=>{
  const request=route.request(),url=new URL(request.url()),match=routePattern.exec(url.pathname);
  if(!match||state.phase!=='hold'||state.held[match[1]]){await route.continue();return;}
  const kind=match[1],source=expected[kind];
  state.held[kind]={route,requestUrl:request.url(),status:'fetching'};
  try{
   const response=await route.fetch();const body=await response.body();
   assert.equal(response.url(),request.url(),'held bytes came from the exact requested resource');
   const item={kind,url:request.url(),status:response.status(),bytes:body.length,sha256:sha(body),
    contentType:response.headers()['content-type'],contentLength:response.headers()['content-length']};
   assert.equal(url.origin,ORIGIN);assert.equal(url.search,`?sha256=${source.sha256}`);
   assert.deepEqual({status:item.status,bytes:item.bytes,sha256:item.sha256,
    contentType:item.contentType,contentLength:item.contentLength},
    {status:200,bytes:source.bytes,sha256:source.sha256,
     contentType:'audio/mpeg',contentLength:String(source.bytes)});
   state.held[kind]={route,response,requestUrl:request.url(),status:'held'};
   state.sourceResponses.push(item);record.heldResponses.push(item);
  }catch(error){record.routeErrors.push({kind,at:'fetch',message:error.message});
   await route.abort().catch(()=>{});}
 });
 return{
  state,
  async waitHeld(){await bounded(new Promise((resolve,reject)=>{
   const started=Date.now(),poll=()=>{
    if(['correct','wrong'].every(kind=>state.held[kind]?.status==='held'))resolve();
    else if(record.routeErrors.length||Date.now()-started>20000)reject(Error('source feedback routes did not hold both real responses'));
    else setTimeout(poll,25);
   };poll();
  }),'both real source responses held',22000);},
  async release(){state.phase='release';
   for(const kind of ['correct','wrong']){
    const held=state.held[kind];assert.equal(held?.status,'held');
    try{await held.route.fulfill({response:held.response});
     state.release.push({kind,result:'fulfilled-after-cancel'});}
    catch(error){state.release.push({kind,result:'browser-rejected-stale-response',message:error.message});}
   }record.staleRelease.push(...state.release);
  },
 };
}
async function snapshot(page,label){return page.evaluate(({selector,label})=>{
 const board=document.querySelector(selector),trace=window.__P054_PENDING;
 return{label,url:location.href,hostPage:document.querySelector('[data-lesson-player]')?.getAttribute('data-current-page'),
  phase:board?.getAttribute('data-p054-phase'),audioStatus:board?.getAttribute('data-p054-audio-status'),
  score:board?.getAttribute('data-p054-score'),matched:board?.getAttribute('data-p054-matched-pairs'),
  audio:trace.audio.map((node,id)=>({id,src:node.getAttribute('src'),paused:node.paused,
   readyState:node.readyState,networkState:node.networkState})),
  events:trace.events.slice(),fetchFailures:trace.fetchFailures.slice()};
 },{selector:BOARD,label});}
async function select(page,id){
 const map=page.locator('button[data-responsive-focus-key="map"]:visible').first();
 await map.scrollIntoViewIfNeeded();await map.click();
 const target=page.locator(`button[data-placement-id="${id}"]:visible`).first();
 await target.scrollIntoViewIfNeeded();await target.click();
 await page.locator(`${HOST}[data-current-animation-id="${id}"]`).waitFor();
}
async function expectAbort(page,record,phase,requests){
 await page.waitForFunction(({n})=>window.__P054_PENDING.fetchFailures.length>=n,
  {n:phase===1?2:4},{timeout:12000});
 await bounded(new Promise((resolve,reject)=>{
  const start=Date.now(),poll=()=>{
   const failed=requests.filter(item=>item.phase===phase&&item.failure);
   if(failed.length>=2)resolve();
   else if(Date.now()-start>12000)reject(Error(`phase ${phase} requestfailed missing`));
   else setTimeout(poll,25);
  };poll();
 }),`phase ${phase} browser requestfailed`,13000);
 const failures=requests.filter(item=>item.phase===phase&&item.failure);
 assert.equal(new Set(failures.map(item=>item.kind)).size,2);
 assert(failures.every(item=>/ERR_ABORTED|NS_BINDING_ABORTED|aborted/i.test(item.failure)),
  'browser reports cancellation of both source requests');
 const state=await snapshot(page,`phase-${phase}-aborted`);record.observations.push(state);
 assert.equal(state.fetchFailures.filter(item=>item.name==='AbortError').length>=phase*2,true,
  'in-page AbortError from source fetch');
}
async function caseRun(browser,config,dir){
 const record={...config,status:'running',step:'entry',formal:false,observations:[],
  heldResponses:[],staleRelease:[],routeErrors:[],requests:[],consoleDiagnostics:[],errors:[]};
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},
  locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reducedMotion,serviceWorkers:'block'});
 await context.addInitScript(installTrace);
 const page=await context.newPage();page.setDefaultTimeout(30000);
 let phase=1,holder=holdFeedback(page,record);
 const requestRows=new WeakMap();
 page.on('pageerror',error=>record.errors.push(error.message));
 page.on('console',message=>{if(['error','warning'].includes(message.type()))
  record.consoleDiagnostics.push({type:message.type(),text:message.text()});});
 page.on('request',request=>{const url=new URL(request.url());if(!url.pathname.includes(`/${ID}/feedback-audio/`))return;
  const kind=url.pathname.split('/').at(-1),row={phase,kind,url:request.url(),failure:null};
  requestRows.set(request,row);record.requests.push(row);});
 page.on('requestfailed',request=>{const row=requestRows.get(request);
  if(row)row.failure=request.failure()?.errorText??'unknown';});
 try{
  const route=`${ORIGIN}/${config.locale}/migration-status/g678-calibration/${ID}${config.level===2?'?level=2':''}`;
  const navigation=await page.goto(route,{waitUntil:'domcontentloaded',timeout:120000});
  assert.equal(navigation?.status(),200);
  assert.equal(await page.locator('main[data-p054-current-js]').getAttribute('data-p054-current-js'),
   'unregistered-product-candidate');
  await page.locator(`${BOARD}[data-p054-level="${config.level}"][data-p054-audio-status="loading"]`).waitFor();
  await holder.waitHeld();
  let state=await snapshot(page,'first-loading');record.observations.push(state);
  assert.equal(state.audio.length,0);assert.equal(state.score,'0');assert.equal(state.matched,'0');
  record.step='replay-pending';await page.locator('button[data-responsive-focus-key="replay"]:visible').first().click();
  await expectAbort(page,record,1,record.requests);
  await holder.release();
  await page.locator(`${BOARD}[data-p054-audio-status="ready"]`).waitFor({timeout:30000});
  state=await snapshot(page,'replay-new-mount-ready');record.observations.push(state);
  assert.equal(state.audio.length,2,'only new mount creates two native Blob clips');
  assert.equal(state.events.filter(item=>item.type==='playing').length,0,'no stale or new autoplay');
  assert.equal(state.score,'0');assert.equal(state.matched,'0');
  record.step='prepare-navigation-hold';await select(page,PREVIOUS);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"] [data-p064-question="4"]`).waitFor();
  phase=2;holder=holdFeedback(page,record);
  await select(page,ID);
  await page.locator(`${BOARD}[data-p054-audio-status="loading"]`).waitFor();
  await holder.waitHeld();
  state=await snapshot(page,'return-p054-pending-navigation');record.observations.push(state);
  assert.equal(state.audio.length,2,'pending mount creates no native Blob clip');
  record.step='navigate-away-pending';await select(page,PREVIOUS);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"] [data-p064-question="4"]`).waitFor();
  await expectAbort(page,record,2,record.requests);
  await holder.release();
  state=await snapshot(page,'p064-after-pending-abort');record.observations.push(state);
  assert.equal(state.audio.length,2,'stale P054 response creates no native clip after navigation');
  assert.equal(state.events.filter(item=>item.type==='playing').length,0);
  const fq=await page.locator(HOST).evaluate(node=>({attempted:node.getAttribute('data-lesson-host-fq-attempted'),
   correct:node.getAttribute('data-lesson-host-fq-correct')}));
  assert.deepEqual(fq,{attempted:'0',correct:'0'});
  record.step='return-ready';phase=3;await select(page,ID);
  await page.locator(`${BOARD}[data-p054-level="${config.level}"][data-p054-audio-status="ready"]`).waitFor({timeout:30000});
  state=await snapshot(page,'final-return-initial-ready');record.observations.push(state);
  assert.equal(state.phase,'selecting');assert.equal(state.score,'0');assert.equal(state.matched,'0');
  assert.equal(state.audio.length,4,'final return creates only one fresh pair of clips');
  assert.equal(state.events.filter(item=>item.type==='playing').length,0,'no autoplay on any generation');
  assert.deepEqual(record.routeErrors,[]);
  assert.deepEqual(record.errors,[]);
  assert.deepEqual(record.consoleDiagnostics,[]);
  record.status='technical-pass-not-acceptance';
 }catch(error){record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  record.failureState=await snapshot(page,'failure').catch(()=>null);
  await page.screenshot({path:path.join(dir,`${config.name}-failure.png`),fullPage:true}).catch(()=>{});
 }finally{
  for(const kind of ['correct','wrong']){
   const held=holder.state.held[kind];if(held?.status==='held'&&holder.state.phase==='hold')
    await held.route.abort().catch(()=>{});
  }
  record.contextClose=await bounded(context.close(),'context close',15000).then(()=> 'closed',error=>`error:${error.message}`);
  await writeFile(path.join(dir,`${config.name}-record.json`),json(record),{flag:'wx'});
 }return record;
}
export async function run(args){
 const options=parseArgs(args);if(options.mode==='plan')return plan();
 const dir=path.join(ROOT,OUTPUT,options.slug);await mkdir(path.dirname(dir),{recursive:true});await mkdir(dir);
 let prepared;try{prepared=await preflight();}
 catch(error){const result={...plan(),status:'failed',phase:'preflight',cases:[],
  failure:{message:error.message,stack:error.stack}};
  await writeFile(path.join(dir,'result.json'),json(result),{flag:'wx'});return result;}
 const result={...plan(),status:'running',startedAt:new Date().toISOString(),
  inputPinsBefore:prepared.before,cases:[],cleanupErrors:[],originalRuntimeAccepted:false,
  audioListeningAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES)result.cases.push(await caseRun(browser,config,dir));
 }catch(error){result.failure={message:error.message,stack:error.stack};}
 finally{
  if(browser)await bounded(browser.close(),'browser disconnect',15000)
   .catch(error=>result.cleanupErrors.push(error.message));
  if(server){try{await bounded(server.close(),'browser process close',15000);result.browserProcessCleanup='closed';}
   catch(error){result.browserCloseError=error.message;
    try{await bounded(server.kill(),'browser process kill',15000);result.browserProcessCleanup='terminated';}
    catch(killError){result.cleanupErrors.push(killError.message);}}
   result.browserProcessExited=server.process().exitCode!==null||server.process().signalCode!==null;
   if(!result.browserProcessExited)result.cleanupErrors.push('browser process exit unverified');}
  result.inputPinsAfter=await pins(prepared.paths);
  result.inputStable=JSON.stringify(prepared.before)===JSON.stringify(result.inputPinsAfter);
  result.finishedAt=new Date().toISOString();
  result.status=!result.failure&&result.cleanupErrors.length===0&&result.browserProcessExited&&
   result.inputStable&&result.cases.length===2&&result.cases.every(item=>
    item.status==='technical-pass-not-acceptance'&&item.contextClose==='closed')
   ?'technical-pass-not-acceptance':'failed';
  await writeFile(path.join(dir,'result.json'),json(result),{flag:'wx'});
 }return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run(process.argv.slice(2)).then(result=>{console.log(json({status:result.status,cases:result.cases?.length??0,
  output:OUTPUT}));process.exitCode=result.status==='failed'?1:0;
 }).catch(error=>{console.error(error.stack??error);process.exitCode=1;});
}
