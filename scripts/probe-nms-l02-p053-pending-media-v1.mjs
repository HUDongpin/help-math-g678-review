#!/usr/bin/env node
/** Real, explicit P053 narration cancellation in the local My Lesson candidate. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {plan as productPlan} from './probe-nms-l02-p053-product-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331';
const ID='shared-nms002-l02-p053',GAME='shared-nms002-l02-p054',QUIZ='shared-nms002-l02-p064';
const HOST='[data-lesson-player][data-current-animation-id]';
const STAGE=`${HOST}[data-current-animation-id="${ID}"] .p053-host`;
const AUDIO_SHA='225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d';
const AUDIO_BYTES=256230;
const AUDIO_PATH=`/flash-assets/g678-local/${ID}/source-audio?sha256=${AUDIO_SHA}`;
const AUDIO_URL=ORIGIN+AUDIO_PATH;
const OUTPUT='output/nms-l02-p053-product-20260928/browser/pending-media-v1';
export const CASES=Object.freeze(['en','es'].flatMap(locale=>
 ['replay','stop-audio','navigate-p054','navigate-p064'].map(action=>Object.freeze({
  name:`${locale}-${action}`,locale,action,width:locale==='en'?1280:390,
  height:locale==='en'?900:844,reducedMotion:locale==='en'?'no-preference':'reduce',
 }))));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const bounded=async(promise,label,ms=20000)=>{let timer;try{return await Promise.race([
 promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(`P053 pending ${label} timed out`)),ms);}),
]);}finally{clearTimeout(timer);}};
export function parseArgs(args){
 if(args.length===1&&args[0]==='--plan')return{mode:'plan'};
 assert(args.length===2&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]??''),
  'Usage: --plan | --run <unique-slug>');
 return{mode:'run',slug:args[1]};
}
export function plan(){const base=productPlan();const added=[
 'scripts/probe-nms-l02-p053-pending-media-v1.mjs',
 'scripts/probe-nms-l02-p053-pending-media-v1.test.mjs',
];return{kind:'nms-l02-p053-pending-narration-browser-v1',schemaVersion:1,
 animationId:ID,origin:ORIGIN,route:`${ORIGIN}/{en|es}/migration-status/g678-calibration/${ID}`,
 registeredCount:base.registeredCount,renderableCount:base.renderableCount,
 sourceAudio:{url:AUDIO_URL,bytes:AUDIO_BYTES,sha256:AUDIO_SHA},cases:CASES,
 inputPaths:[...new Set([...base.inputPaths,...added])],externalInputs:base.externalInputs,
 outputRoot:OUTPUT,checks:[
  'helper page fetches the real source-audio route and verifies full bytes, headers and SHA-256',
  'one explicit Listen yields exactly one stable pending native Request; entry never fetches or plays',
  'host Replay, Stop audio, navigation to P054, and navigation to P064 abort the captured Request',
  'browser requestfailed plus in-page AbortError are observed after each action',
  'stale response release cannot create a P053 Blob URL or start source narration',
  'return to P053 is idle with no automatic narration request or playback',
  'technical Current-JS lifecycle only; no source clock, original-runtime or listening acceptance',
 ],acceptanceEffects:{originalRuntime:false,audioListening:false,human:false,owner:false,
  strictCompletion:false,publication:false}};}
async function pin(file){const absolute=path.isAbsolute(file)?file:path.join(ROOT,file);
 const stat=await lstat(absolute);assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1,
  `ordinary input: ${file}`);assert.equal(await realpath(absolute),absolute);
 const bytes=await readFile(absolute);return{path:file,bytes:bytes.length,sha256:sha(bytes)};}
async function pins(files){return Promise.all(files.map(pin));}
export async function preflight(){const info=plan();assert.equal(new Set(info.inputPaths).size,info.inputPaths.length);
 const external=await pins(info.externalInputs.map(item=>item.path));
 assert.deepEqual(external,info.externalInputs);
 return{inputPins:await pins(info.inputPaths),externalPins:external};}

function installTrace(){
 const trace={audio:[],events:[],blobUrls:[],revoked:[],fetchFailures:[]};
 Object.defineProperty(window,'__P053_PENDING',{value:trace});
 const NativeAudio=window.Audio;
 window.Audio=new Proxy(NativeAudio,{construct(target,args){
  const node=Reflect.construct(target,args,target),id=trace.audio.length;
  trace.audio.push(node);
  for(const type of ['play','playing','pause','ended','abort','emptied','error'])
   node.addEventListener(type,()=>trace.events.push({id,type,at:performance.now(),paused:node.paused}));
  return node;
 }});
 const nativeCreate=URL.createObjectURL.bind(URL),nativeRevoke=URL.revokeObjectURL.bind(URL);
 URL.createObjectURL=blob=>{const url=nativeCreate(blob);
  trace.blobUrls.push({url,bytes:blob.size,type:blob.type,at:performance.now()});return url;};
 URL.revokeObjectURL=url=>{trace.revoked.push(String(url));nativeRevoke(url);};
 const nativeFetch=window.fetch;
 window.fetch=async function(...args){const target=args[0] instanceof Request?args[0].url:String(args[0]);
  try{return await nativeFetch.apply(this,args);}
  catch(error){if(target.includes('/flash-assets/g678-local/shared-nms002-l02-p053/source-audio'))
   trace.fetchFailures.push({url:target,name:error?.name??null,message:String(error),at:performance.now()});
   throw error;}
 };
}
const routeFor=config=>`${ORIGIN}/${config.locale}/migration-status/g678-calibration/${ID}`;
async function sourceBytes(context,config,record){const helper=await context.newPage();
 helper.on('pageerror',error=>record.errors.push(String(error.stack??error)));
 try{const response=await helper.goto(routeFor(config),{waitUntil:'domcontentloaded',timeout:120000});
  assert.equal(response?.status(),200);await helper.locator('.p053-host').waitFor({timeout:120000});
  const result=await helper.evaluate(async url=>{const response=await fetch(url,
   {cache:'no-store',credentials:'same-origin',redirect:'error'});
   return{url:response.url,status:response.status,redirected:response.redirected,
    type:response.headers.get('content-type'),length:response.headers.get('content-length'),
    bytes:Array.from(new Uint8Array(await response.arrayBuffer()))};},AUDIO_URL);
  const {bytes,...meta}=result,body=Buffer.from(bytes);
  record.sourceResponse={...meta,bytes:body.length,sha256:sha(body)};
  assert.deepEqual(record.sourceResponse,{url:AUDIO_URL,status:200,redirected:false,
   type:'audio/mpeg',length:String(AUDIO_BYTES),bytes:AUDIO_BYTES,sha256:AUDIO_SHA});
  return body;
 }finally{await helper.close();}}
function holdSource(page,record){const rows=[],byRequest=new WeakMap();let mode='hold';
 function rowFor(request){const existing=byRequest.get(request);if(existing)return existing;
  if(request.url()!==AUDIO_URL)return null;
  const row={id:rows.length+1,url:request.url(),method:request.method(),held:false,
   failure:null,failureAt:null,headers:null,request,route:null};
  rows.push(row);byRequest.set(request,row);return row;
 }
 page.on('request',rowFor);
 page.on('requestfailed',request=>{const row=rowFor(request);if(row){
  row.failure=request.failure()?.errorText??'unknown';row.failureAt=Date.now();}});
 page.route(`**/shared-nms002-l02-p053/source-audio**`,async route=>{
  const row=rowFor(route.request());if(!row||mode!=='hold'){await route.continue();return;}
  row.headers=await route.request().allHeaders();row.held=true;row.route=route;
  // Deliberately leave this exact native Request pending until the product aborts it.
 });
 async function waitPending(){return bounded(new Promise((resolve,reject)=>{
  const started=Date.now();let stable=0,prior=null;const poll=async()=>{try{
   const active=rows.filter(row=>row.held&&!row.failure).at(-1);
   const status=await page.locator(STAGE).getAttribute('data-p053-audio').catch(()=>null);
   if(active&&status==='loading'){
    stable=active===prior?stable+1:1;prior=active;
    if(stable>=3){resolve(active);return;}
   }else{stable=0;prior=null;}
   if(Date.now()-started>20000)reject(Error('no stable pending P053 source audio Request'));
   else setTimeout(poll,50);
  }catch(error){reject(error);}};void poll();}),'one stable pending source request',22000);}
 async function release(row,body){try{await row.route.fulfill({status:200,body,contentType:'audio/mpeg',
   headers:{'content-type':'audio/mpeg','content-length':String(body.length)}});
   return{result:'fulfilled-after-cancel'};
  }catch(error){return{result:'browser-rejected-stale-response',message:error.message};}}
 async function cleanup(){for(const row of rows)if(row.held&&!row.failure&&row.route)
  await row.route.abort().catch(()=>{});}
 const publicRow=row=>({id:row.id,url:row.url,method:row.method,held:row.held,
  failure:row.failure,failureAt:row.failureAt,headers:row.headers&&{
   referer:row.headers.referer??null,origin:row.headers.origin??null,
   secFetchMode:row.headers['sec-fetch-mode']??null,secFetchSite:row.headers['sec-fetch-site']??null}});
 return{rows,waitPending,release,cleanup,publicRow,setMode:value=>{mode=value;}};
}
async function snapshot(page,label){return page.evaluate(label=>{const stage=document.querySelector('.p053-host');
 const trace=window.__P053_PENDING;return{label,url:location.href,
  current:document.querySelector('[data-lesson-player]')?.getAttribute('data-current-animation-id'),
  frame:stage?.getAttribute('data-p053-frame'),playing:stage?.getAttribute('data-p053-playing'),
  audioStatus:stage?.getAttribute('data-p053-audio'),audioCount:trace.audio.length,
  sourceBlobUrls:trace.blobUrls.filter(row=>row.bytes===256230&&row.type==='audio/mpeg'),
  events:trace.events.slice(),fetchFailures:trace.fetchFailures.slice(),revoked:trace.revoked.slice()};},label);}
async function select(page,id){const map=page.locator('button[data-responsive-focus-key="map"]:visible').first();
 await map.scrollIntoViewIfNeeded();await map.click();
 const target=page.locator(`button[data-placement-id="${id}"]:visible`).first();
 await target.scrollIntoViewIfNeeded();await target.click();
 await page.locator(`${HOST}[data-current-animation-id="${id}"]`).waitFor();}
async function waitAbort(page,row,at,record){await bounded(new Promise((resolve,reject)=>{
 const started=Date.now();const poll=()=>{if(row.failure){resolve();return;}
  if(Date.now()-started>12000)reject(Error('captured P053 Request did not fail'));
  else setTimeout(poll,25);};poll();}),'captured requestfailed',13000);
 assert(row.failureAt>=at,'post-action failure required');
 assert.match(row.failure,/ERR_ABORTED|NS_BINDING_ABORTED|aborted/iu);
 await page.waitForFunction(()=>window.__P053_PENDING.fetchFailures.some(row=>row.name==='AbortError'),
  null,{timeout:12000});
 const state=await snapshot(page,'captured-request-aborted');record.snapshots.push(state);
 assert(state.fetchFailures.some(item=>item.url===AUDIO_URL&&item.name==='AbortError'));
 assert.deepEqual(state.sourceBlobUrls,[]);
 return state;}
async function action(page,config){switch(config.action){
 case 'replay':await page.locator('button[data-responsive-focus-key="replay"]:visible').first().click();return;
 case 'stop-audio':await page.locator(STAGE).getByRole('button',
  {name:config.locale==='en'?'Stop audio':'Detener audio',exact:true}).click();return;
 case 'navigate-p054':await select(page,GAME);return;
 case 'navigate-p064':await select(page,QUIZ);return;
 default:throw Error('P053_PENDING_ACTION');}}
async function caseRun(browser,config,dir){const record={...config,status:'running',step:'entry',
 sourceResponse:null,requests:[],snapshots:[],staleRelease:null,errors:[],consoleDiagnostics:[]};
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},
  locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reducedMotion,
  serviceWorkers:'block'});
 await context.addInitScript(installTrace);let page,holder;
 try{const body=await sourceBytes(context,config,record);
  page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',error=>record.errors.push(String(error.stack??error)));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))
   record.consoleDiagnostics.push({type:message.type(),text:message.text()});});
  holder=holdSource(page,record);
  const response=await page.goto(routeFor(config),{waitUntil:'domcontentloaded',timeout:120000});
  assert.equal(response?.status(),200);await page.locator(STAGE).waitFor({timeout:120000});
  let state=await snapshot(page,'entry');record.snapshots.push(state);
  assert.equal(state.audioStatus,'idle');assert.equal(state.audioCount,0);
  assert.equal(holder.rows.length,0,'entry must not request narration');
  record.step='explicit-listen';await page.locator(STAGE).getByRole('button',
   {name:config.locale==='en'?'Listen to English directions':'Escuchar instrucciones en inglés'}).click();
  const captured=await holder.waitPending();record.captured=holder.publicRow(captured);
  assert.equal(captured.method,'GET');assert.equal(holder.rows.filter(row=>row.held&&!row.failure).length,1);
  state=await snapshot(page,'source-request-held');record.snapshots.push(state);
  assert.equal(state.audioStatus,'loading');assert.equal(state.audioCount,0);
  record.step=config.action;holder.setMode('pass');const actionAt=Date.now();
  await action(page,config);await waitAbort(page,captured,actionAt,record);
  record.canceled=holder.publicRow(captured);
  record.staleRelease=await holder.release(captured,body);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  state=await snapshot(page,'after-stale-release');record.snapshots.push(state);
  assert.deepEqual(state.sourceBlobUrls,[],'stale source response cannot create P053 Blob URL');
  assert.equal(state.events.filter(event=>event.type==='playing').length,0,
   'stale source response cannot start native playback');
  record.step='return-p053';
  if(config.action==='replay'||config.action==='stop-audio')await select(page,QUIZ);
  await select(page,ID);await page.locator(`${STAGE}[data-p053-audio="idle"]`).waitFor();
  state=await snapshot(page,'return-idle');record.snapshots.push(state);
  assert.equal(state.frame,'1');assert.equal(state.playing,'false');assert.equal(state.audioStatus,'idle');
  assert.equal(holder.rows.length,1,'return must not request source narration');
  assert.deepEqual(state.sourceBlobUrls,[]);
  assert.equal(state.events.filter(event=>event.type==='playing').length,0);
  assert.deepEqual(record.errors,[]);assert.deepEqual(record.consoleDiagnostics,[]);
  record.status='technical-pass-not-acceptance';record.step='complete';
 }catch(error){record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  if(page){record.failureState=await snapshot(page,'failure').catch(()=>null);
   await page.screenshot({path:path.join(dir,`${config.name}-failure.png`),fullPage:true}).catch(()=>{});}
 }finally{if(holder){await holder.cleanup();record.requests=holder.rows.map(holder.publicRow);}
  record.contextClose=await bounded(context.close(),'context close',15000)
   .then(()=> 'closed',error=>`error:${error.message}`);
  await writeFile(path.join(dir,`${config.name}-record.json`),json(record),{flag:'wx'});
 }return record;}
export async function run(args){const options=parseArgs(args);if(options.mode==='plan')return plan();
 const dir=path.join(ROOT,OUTPUT,options.slug);await mkdir(path.dirname(dir),{recursive:true});await mkdir(dir);
 const info=plan(),result={...info,status:'running',startedAt:new Date().toISOString(),
  inputPinsBefore:null,inputPinsAfter:null,externalPinsBefore:null,externalPinsAfter:null,
  inputStable:false,cases:[],cleanupErrors:[],
  browserProcessExited:false};
 let server,browser;
 try{const prepared=await preflight();result.inputPinsBefore=prepared.inputPins;
  result.externalPinsBefore=prepared.externalPins;
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES)result.cases.push(await caseRun(browser,config,dir));
 }catch(error){result.failure={message:error.message,stack:error.stack};}
 finally{if(browser)await bounded(browser.close(),'browser disconnect',15000)
   .catch(error=>result.cleanupErrors.push(error.message));
  if(server){try{await bounded(server.close(),'browser process close',15000);
   result.browserProcessCleanup='closed';}
   catch(error){result.browserCloseError=error.message;
    try{await bounded(server.kill(),'browser process kill',15000);
     result.browserProcessCleanup='terminated';}
    catch(killError){result.cleanupErrors.push(killError.message);}}
   result.browserProcessExited=server.process().exitCode!==null||server.process().signalCode!==null;
   if(!result.browserProcessExited)result.cleanupErrors.push('browser process exit unverified');}
  if(result.inputPinsBefore)result.inputPinsAfter=await pins(info.inputPaths).catch(error=>{
   result.cleanupErrors.push(`input recheck: ${error.message}`);return null;});
  if(result.externalPinsBefore)result.externalPinsAfter=await pins(info.externalInputs.map(item=>item.path))
   .catch(error=>{result.cleanupErrors.push(`external recheck: ${error.message}`);return null;});
  result.inputStable=JSON.stringify(result.inputPinsBefore)===JSON.stringify(result.inputPinsAfter)&&
   JSON.stringify(result.externalPinsBefore)===JSON.stringify(result.externalPinsAfter);
  result.finishedAt=new Date().toISOString();
  result.status=!result.failure&&result.cleanupErrors.length===0&&result.browserProcessExited&&
   result.inputStable&&result.cases.length===CASES.length&&result.cases.every(item=>
    item.status==='technical-pass-not-acceptance'&&item.contextClose==='closed')
   ?'technical-pass-not-acceptance':'failed';
  await writeFile(path.join(dir,'result.json'),json(result),{flag:'wx'});
 }return result;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(parseArgs(args).mode==='plan')console.log(json(plan()));
 else run(args).then(result=>{console.log(json({status:result.status,
  cases:result.cases?.length??0,output:OUTPUT}));process.exitCode=result.status==='failed'?1:0;
 }).catch(error=>{console.error(error.stack??error);process.exitCode=1;});}
