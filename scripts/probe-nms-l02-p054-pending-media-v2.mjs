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
const OUTPUT='output/nms-l02-p054-product-20260928/browser/pending-media-v2';
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
 schemaVersion:2,kind:'nms-l02-p054-pending-media-browser-v2',formal:false,
 origin:ORIGIN,route:`${ORIGIN}/{en|es}/migration-status/g678-calibration/${ID}[?level=2]`,
 cases:CASES,animationId:ID,source:productPlan().source,feedbackAudio:productPlan().feedbackAudio,
 checks:['real same-origin browser fetch verifies guarded source MP3 bytes before interception',
  'StrictMode initial aborts excluded; stable pending Request objects captured before each action',
  'host Replay aborts both captured pending requests; stale responses cannot create Blob Audio or play',
  'new mount obtains two exact source MP3s and remains paused without autoplay',
  'pending navigation to registered P064 aborts both requests; P054 return restores ready initial state',
  'browser requestfailed and in-page AbortError observations are required, not a fixed sleep',
  'technical lifecycle evidence only; no original-runtime or listening acceptance'],
 inputPaths:[...productPlan().inputPaths,'scripts/probe-nms-l02-p054-pending-media-v2.mjs',
  'scripts/probe-nms-l02-p054-pending-media-v2.test.mjs'],outputRoot:OUTPUT,
 };}
async function preflight(){
 const product=await productPreflight();
 const paths=[...product.paths,'scripts/probe-nms-l02-p054-pending-media-v2.mjs',
  'scripts/probe-nms-l02-p054-pending-media-v2.test.mjs'];
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
function routeFor(config){return `${ORIGIN}/${config.locale}/migration-status/g678-calibration/${ID}${config.level===2?'?level=2':''}`;}
function sourceURL(kind){const source=productPlan().feedbackAudio[kind];
 return `${ORIGIN}/flash-assets/g678-local/${ID}/feedback-audio/${kind}?sha256=${source.sha256}`;}
async function browserSourceBytes(context,config,record){
 const helper=await context.newPage();helper.setDefaultTimeout(30000);
 try{
  const response=await helper.goto(routeFor(config),{waitUntil:'domcontentloaded',timeout:120000});
  assert.equal(response?.status(),200);
  await helper.locator('main[data-p054-current-js="unregistered-product-candidate"]').waitFor({timeout:30000});
  const result=await helper.evaluate(async urls=>{
   const out={};for(const [kind,url] of Object.entries(urls)){
    const response=await fetch(url,{cache:'no-store',credentials:'same-origin',redirect:'error'});
    const bytes=new Uint8Array(await response.arrayBuffer());
    out[kind]={url:response.url,status:response.status,contentType:response.headers.get('content-type'),
     contentLength:response.headers.get('content-length'),bytes:Array.from(bytes)};
   }return out;
  },{correct:sourceURL('correct'),wrong:sourceURL('wrong')});
  const bodies={};
  for(const kind of ['correct','wrong']){
   const {bytes,...meta}=result[kind],body=Buffer.from(bytes),expected=productPlan().feedbackAudio[kind];
   const finding={kind,...meta,bytes:body.length,sha256:sha(body)};
   assert.deepEqual(finding,{kind,url:sourceURL(kind),status:200,contentType:'audio/mpeg',
    contentLength:String(expected.bytes),bytes:expected.bytes,sha256:expected.sha256});
   record.browserSourceResponses.push(finding);bodies[kind]=body;
  }
  return bodies;
 }finally{await helper.close();}
}
function holdFeedback(page,record){
 const state={mode:'hold',phase:1,nextId:0,rows:[],byRequest:new WeakMap()};
 const routePattern=new RegExp(`/flash-assets/g678-local/${ID}/feedback-audio/(correct|wrong)$`,'u');
 function rowFor(request){const existing=state.byRequest.get(request);if(existing)return existing;
  const url=new URL(request.url()),match=routePattern.exec(url.pathname);if(!match)return null;
  const row={id:++state.nextId,phase:state.phase,kind:match[1],url:request.url(),
   held:false,failure:null,failureAt:null,headers:null,request};
  state.byRequest.set(request,row);state.rows.push(row);record.requests.push(row);return row;
 }
 page.on('request',rowFor);
 page.on('requestfailed',request=>{const row=rowFor(request);if(row){
  row.failure=request.failure()?.errorText??'unknown';row.failureAt=Date.now();
 }});
 page.route('**/feedback-audio/**',async route=>{
  const request=route.request(),row=rowFor(request);
  if(!row||state.mode!=='hold'){await route.continue();return;}
  const url=new URL(request.url()),expected=productPlan().feedbackAudio[row.kind];
  assert.equal(url.origin,ORIGIN);assert.equal(url.search,`?sha256=${expected.sha256}`);
  const headers=await request.allHeaders();
  row.headers={referer:headers.referer??null,origin:headers.origin??null,
   secFetchSite:headers['sec-fetch-site']??null,secFetchMode:headers['sec-fetch-mode']??null,
   secFetchDest:headers['sec-fetch-dest']??null};
  row.held=true;row.route=route;
  // Leave the exact browser Request pending. Only the product AbortController should cancel it.
 });
 const publicRow=row=>({id:row.id,phase:row.phase,kind:row.kind,url:row.url,held:row.held,
  failure:row.failure,failureAt:row.failureAt,headers:row.headers});
 async function waitCurrentPair(){
  let previous=null,stable=0;
  return bounded(new Promise((resolve,reject)=>{const started=Date.now(),poll=async()=>{
   try{
    const active=state.rows.filter(row=>row.phase===state.phase&&row.held&&!row.failure);
    const pair=['correct','wrong'].map(kind=>active.filter(row=>row.kind===kind).at(-1));
    const status=await page.locator(BOARD).getAttribute('data-p054-audio-status').catch(()=>null);
    if(pair.every(Boolean)&&status==='loading'){
     const key=pair.map(row=>row.id).join(':');stable=key===previous?stable+1:1;previous=key;
     if(stable>=3){
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      if(pair.every(row=>!row.failure)&&
       (await page.locator(BOARD).getAttribute('data-p054-audio-status'))==='loading'){
       resolve(pair);return;
      }stable=0;
     }
    }else{previous=null;stable=0;}
    if(Date.now()-started>25000)reject(Error(`phase ${state.phase} has no stable pending correct/wrong Request pair`));
    else setTimeout(poll,50);
   }catch(error){reject(error);}
  };void poll();}),'stable pending Request pair',27000);
 }
 async function release(pair,bodies){for(const row of pair){
   try{await row.route.fulfill({status:200,contentType:'audio/mpeg',body:bodies[row.kind]});
    record.staleRelease.push({id:row.id,kind:row.kind,result:'fulfilled-after-cancel'});}
   catch(error){record.staleRelease.push({id:row.id,kind:row.kind,
    result:'browser-rejected-stale-response',message:error.message});}
  }}
 async function cleanup(){for(const row of state.rows){if(row.held&&!row.failure&&row.route)
   await row.route.abort().catch(()=>{});}}
 return{state,waitCurrentPair,release,cleanup,publicRow};
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
async function expectAbort(page,record,pair,actionAt,baseline,holder){
 assert.equal(new Set(pair.map(item=>item.kind)).size,2);
 await bounded(new Promise((resolve,reject)=>{const started=Date.now(),poll=()=>{
  if(pair.every(item=>item.failure)){resolve();return;}
  if(Date.now()-started>12000)reject(Error('captured Request pair did not fail after action'));
  else setTimeout(poll,25);
 };poll();}),'captured browser requestfailed',13000);
 assert(pair.every(item=>item.failureAt>=actionAt),'only post-action cancellations count');
 assert(pair.every(item=>/ERR_ABORTED|NS_BINDING_ABORTED|aborted/iu.test(item.failure)),
  'captured browser Requests were aborted');
 await page.waitForFunction(({count})=>window.__P054_PENDING.fetchFailures.length>=count,
  {count:baseline+2},{timeout:12000});
 const state=await snapshot(page,`phase-${holder.state.phase}-aborted`);record.observations.push(state);
 const after=state.fetchFailures.slice(baseline);
 for(const kind of ['correct','wrong'])
  assert(after.some(item=>item.name==='AbortError'&&item.url===sourceURL(kind)),
   `post-action ${kind} source fetch rejects AbortError`);
 return pair.map(holder.publicRow);
}
async function caseRun(browser,config,dir){
 const record={...config,status:'running',step:'entry',formal:false,observations:[],
  browserSourceResponses:[],staleRelease:[],requests:[],consoleDiagnostics:[],errors:[]};
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},
  locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reducedMotion,serviceWorkers:'block'});
 await context.addInitScript(installTrace);
 let page,holder;
 try{
  const bodies=await browserSourceBytes(context,config,record);
  page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',error=>record.errors.push(error.message));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))
   record.consoleDiagnostics.push({type:message.type(),text:message.text()});});
  holder=holdFeedback(page,record);
  const navigation=await page.goto(routeFor(config),{waitUntil:'domcontentloaded',timeout:120000});
  assert.equal(navigation?.status(),200);
  assert.equal(await page.locator('main[data-p054-current-js]').getAttribute('data-p054-current-js'),
   'unregistered-product-candidate');
  const first=await holder.waitCurrentPair();record.firstPendingPair=first.map(holder.publicRow);
  let state=await snapshot(page,'first-loading');record.observations.push(state);
  assert.equal(state.audioStatus,'loading');assert.equal(state.audio.length,0);
  assert.equal(state.score,'0');assert.equal(state.matched,'0');
  record.preActionStrictModeAborts=record.requests.filter(row=>row.phase===1&&row.failure&&
   !first.includes(row)).map(holder.publicRow);
  record.step='replay-pending';holder.state.mode='pass';
  const firstBaseline=state.fetchFailures.length,replayAt=Date.now();
  await page.locator('button[data-responsive-focus-key="replay"]:visible').first().click();
  record.replayAbort=await expectAbort(page,record,first,replayAt,firstBaseline,holder);
  await holder.release(first,bodies);
  await page.locator(`${BOARD}[data-p054-audio-status="ready"]`).waitFor({timeout:30000});
  state=await snapshot(page,'replay-new-mount-ready');record.observations.push(state);
  assert.equal(state.audio.length,2,'only new mount creates two native Blob clips');
  assert.equal(state.events.filter(item=>item.type==='playing').length,0,'no stale or new autoplay');
  assert.equal(state.score,'0');assert.equal(state.matched,'0');
  record.step='prepare-navigation-hold';await select(page,PREVIOUS);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"] [data-p064-question="4"]`).waitFor();
  holder.state.phase=2;holder.state.mode='hold';
  await select(page,ID);
  const second=await holder.waitCurrentPair();record.secondPendingPair=second.map(holder.publicRow);
  state=await snapshot(page,'return-p054-pending-navigation');record.observations.push(state);
  assert.equal(state.audioStatus,'loading');assert.equal(state.audio.length,2,'pending mount creates no native Blob clip');
  record.step='navigate-away-pending';holder.state.mode='pass';
  const secondBaseline=state.fetchFailures.length,navAt=Date.now();
  await select(page,PREVIOUS);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"] [data-p064-question="4"]`).waitFor();
  record.navigationAbort=await expectAbort(page,record,second,navAt,secondBaseline,holder);
  await holder.release(second,bodies);
  state=await snapshot(page,'p064-after-pending-abort');record.observations.push(state);
  assert.equal(state.audio.length,2,'stale P054 response creates no native clip after navigation');
  assert.equal(state.events.filter(item=>item.type==='playing').length,0);
  const fq=await page.locator(HOST).evaluate(node=>({attempted:node.getAttribute('data-lesson-host-fq-attempted'),
   correct:node.getAttribute('data-lesson-host-fq-correct')}));
  assert.deepEqual(fq,{attempted:'0',correct:'0'});
  record.step='return-ready';holder.state.phase=3;await select(page,ID);
  await page.locator(`${BOARD}[data-p054-level="${config.level}"][data-p054-audio-status="ready"]`).waitFor({timeout:30000});
  state=await snapshot(page,'final-return-initial-ready');record.observations.push(state);
  assert.equal(state.phase,'selecting');assert.equal(state.score,'0');assert.equal(state.matched,'0');
  assert.equal(state.audio.length,4,'final return creates only one fresh pair of clips');
  assert.equal(state.events.filter(item=>item.type==='playing').length,0,'no autoplay on any generation');
  assert.deepEqual(record.errors,[]);
  assert.deepEqual(record.consoleDiagnostics,[]);
  record.status='technical-pass-not-acceptance';
 }catch(error){record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  if(page){record.failureState=await snapshot(page,'failure').catch(()=>null);
   await page.screenshot({path:path.join(dir,`${config.name}-failure.png`),fullPage:true}).catch(()=>{});}
 }finally{
  if(holder){await holder.cleanup();record.requests=record.requests.map(holder.publicRow);}
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
