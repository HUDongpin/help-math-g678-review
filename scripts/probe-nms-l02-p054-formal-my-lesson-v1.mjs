#!/usr/bin/env node
/** P054 formal local Current-JS in the real My Lesson host. No acceptance claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const REGISTERED=process.env.HELP_MATH_P054_EXPECT_REGISTERED==='1';
const EXPECTED_STAGE=REGISTERED?'registered-local-current-js':'formal-candidate';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-nms002-l02-p054',PREVIOUS='shared-nms002-l02-p064';
const ROUTE='migration-status/g678-calibration/shared-nms002-l02-p054';
const HOST='[data-lesson-player][data-current-animation-id]';
const BOARD=`${HOST}[data-current-animation-id="${ID}"] .p054-board[data-animation-id="${ID}"]`;
const QUIZ=`${HOST}[data-current-animation-id="${PREVIOUS}"] [data-animation-id="${PREVIOUS}"][data-p064-phase]`;
const OUTPUT='output/nms-l02-p054-product-20260928/browser/formal-my-lesson-v1';
const SWF={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/GS/L2GS03.swf`,bytes:2077270,
 sha256:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8'};
const XML={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const MOVIE={path:'/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5/movie.xml',
 bytes:49837761,sha256:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46'};
const AUDIO_ROOT='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-audio-streams-v1';
const AUDIO_MANIFEST={path:`${AUDIO_ROOT}/stream-manifest-v1.json`,
 sha256:'fd31b5e1208eaf54ef3c14fd28d55d61b2fdb3fc47d7b1f41a097d7e40d2dca0'};
const ART_AUDIT={path:'migrations/shared-nms002-l02-p054/audit/art-export-v1.json',bytes:87084,
 sha256:'b715b175badc1edfcdf5df81ef7c388ea7e0b2eaac99656c28c74d1762e91974'};
const ART_ROOT='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-art-assets-oM5UHV';
const AUDIO=Object.freeze({
 correct:{sprite:194,bytes:10660,sha256:'d34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4'},
 wrong:{sprite:208,bytes:11960,sha256:'2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77'},
});
const CASES=Object.freeze([
 {name:'en-desktop-level1',locale:'en',level:1,width:1280,height:720,reducedMotion:'no-preference'},
 {name:'es-mobile-reduced-level2',locale:'es',level:2,width:390,height:844,reducedMotion:'reduce'},
]);
const INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p054-formal-my-lesson-v1.mjs',
 'scripts/probe-nms-l02-p054-formal-my-lesson-v1.test.mjs',
 'apps/web/lib/nms-l02-p054-admission-activation.ts',
 'apps/web/lib/nms-l02-p054-admission.server.ts',
 'apps/web/lib/nms-l02-p054-descriptor-extension.ts',
 'lib/nms-l02-p054-proof-semantics-v1.mjs',
 'catalog/nms-l02-admission-v1/host-v15.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p054/page.tsx',
 'apps/web/components/g678-nms-l02-p054-product-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx',
 'apps/web/components/nms-l02-p054-product-host-v1.css',
 'packages/demos/tests/nms-l02-p054-product-board-v1.test.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/descriptor-driven-whole-lesson-player.tsx',
 'apps/web/components/nms-l02-p051-host-typography-v1.css',
 'apps/web/components/nms-l02-ts-pilot.css',
 'apps/web/components/nms-l02-p055-host.css',
 'apps/web/components/nms-l02-p056-host-v1.css',
 'apps/web/components/nms-l02-p057-host-v1.css',
 'apps/web/components/nms-l02-p058-host-v1.css',
 'apps/web/components/nms-l02-p060-host-v1.css',
 'apps/web/components/nms-l02-p061-host-v1.css',
 'apps/web/components/nms-l02-p062-host-v1.css',
 'packages/demos/src/nms-l02-p052-page-view-v1.css',
 'packages/demos/src/nms-l02-p064-quiz-candidate.css',
 'apps/web/lib/nms-l02-p054-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p054-product-host.production-stub.tsx',
 'apps/web/lib/nms-l02-p054-product-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p054-feedback-audio.server.ts',
 'apps/web/lib/nms-l02-p054-feedback-audio-access.ts',
 'apps/web/lib/nms-l02-p054-reveal.server.ts',
 'apps/web/lib/nms-l02-p054-reveal-access.ts',
 'apps/web/lib/g678-preview-policy.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/[kind]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/reveal/[level]/[order]/route.ts',
 'packages/demos/src/nms-l02-p054-product-board-v1.tsx',
 'packages/demos/src/nms-l02-p054-matching-state-candidate.ts',
 'packages/demos/src/nms-l02-p054-feedback-audio-v1.ts',
 'packages/demos/src/nms-l02-p054-feedback-audio-loader.ts',
 'packages/demos/src/nms-l02-p054-reveal-v1.ts',
 'packages/demos/src/generated/nms-l02-p054-cards-v1.ts',
 'packages/demos/src/nms-l02-p054-board-candidate.css',
 'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
 'packages/demos/src/nms-l02-p064-host-score-candidate.ts',
 'apps/web/lib/nms-l02-p064-admission-activation.ts',
 'apps/web/lib/nms-l02-p064-admission.server.ts',
 'catalog/nms-l02-admission-v1/host-v14.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
 'packages/demos/private-current-js-registry.json',
 'catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json',
 'migrations/shared-nms002-l02-p054/audit/interaction-contract-v1.json',
 'migrations/shared-nms002-l02-p054/audit/card-layout-v1.json',
 'migrations/shared-nms002-l02-p054/audit/card-display-list-v1.json',
 'migrations/shared-nms002-l02-p054/audit/game-display-list-v1.json',
 ART_AUDIT.path,AUDIO_MANIFEST.path,SWF.path,XML.path,MOVIE.path,
 ...Object.values(AUDIO).map(item=>`${AUDIO_ROOT}/sprite-${item.sprite}-source-stream-v1.mp3`),
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const disk=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);
const pin=async relative=>{const bytes=await readFile(disk(relative));
 return{path:relative,bytes:bytes.length,sha256:sha(bytes)};};
async function pins(paths){return Promise.all(paths.map(pin));}
async function bounded(promise,label,ms=15000){let timer;try{return await Promise.race([
 promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(`P054 ${label} timed out`)),ms);}),
 ]);}finally{clearTimeout(timer);}}
async function shot(page,dir,name,record){
 const target=path.join(dir,`${record.name}-${name}.png`);
 const bytes=await page.screenshot({path:target,fullPage:true});
 record.screenshots.push({path:path.relative(ROOT,target),bytes:bytes.length,sha256:sha(bytes)});
}
export function parseArgs(args){
 if(args.length===1&&args[0]==='--plan')return{mode:'plan'};
 assert(args.length===2&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]??''),
  'Usage: --plan | --run <unique-slug>');
 return{mode:'run',slug:args[1]};
}
export function revealShapeId(level,order){
 assert([1,2].includes(level)&&Number.isInteger(order)&&order>=1&&order<=12);
 return(level===1?108:668)+order*2;
}
export function plan(){return{
 schemaVersion:1,kind:'nms-l02-p054-formal-my-lesson-browser-v1',formal:true,expectedRegistered:REGISTERED,
 origin:ORIGIN,route:`${ORIGIN}/{en|es}/${ROUTE}[?level=2]`,
 animationId:ID,source:SWF,sourceXml:XML,sourceMovie:MOVIE,
 registeredPageCount:REGISTERED?63:62,renderableCount:63,unregisteredCandidateCount:REGISTERED?0:1,activePageCount:64,
 cases:CASES,feedbackAudio:AUDIO,
 checks:['entry loads two exact source feedback MP3s but does not play either',
  'wrong Mc1_1/Mc2_2 scores -2; six source pairs score 58; feedback clocks run 2 to 31/27',
  'host Replay during actual native feedback playback resets state and cancels old Blob media',
  'host pause freezes a source feedback frame and pauses native audio; resume advances the clock',
  'source help dialog closes with focus returned; terminal remains unresolved without host completion',
  'P064 default question 4 has 0/0 host score; P054 return resets level, score and matched count',
  'four success screenshots and image reveal responses are SHA-pinned; input hashes remain exact',
  'technical product candidate only: no original-runtime, listening or human acceptance'],
 inputPaths:INPUTS,
 outputRoot:OUTPUT,
 };}
export async function preflight(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local only');
 for(const directory of [SOURCE_ROOT,AUDIO_ROOT,ART_ROOT]){
  const stat=await lstat(directory);assert(stat.isDirectory()&&!stat.isSymbolicLink(),`physical directory ${directory}`);
 }
 for(const file of [SWF.path,XML.path,MOVIE.path])assert.equal(await realpath(file),file);
 const artPin=await pin(ART_AUDIT.path);assert.deepEqual(artPin,ART_AUDIT);
 const art=JSON.parse(await readFile(disk(ART_AUDIT.path)));
 assert.equal(art.animationId,ID);assert.equal(art.source.sha256,SWF.sha256);
 assert.equal(art.export.root,ART_ROOT);
 const imagePins=[];
 for(const level of [1,2])for(let order=1;order<=12;order++){
  const shape=revealShapeId(level,order),name=`shapes/${shape}.svg`;
  const matches=art.export.items.filter(item=>item.file===name);assert.equal(matches.length,1,name);
  imagePins.push({...matches[0],path:path.join(ART_ROOT,name),level,order});
 }
 const proof=JSON.parse(await readFile(disk('work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json')));
 const host=JSON.parse(await readFile(disk('catalog/nms-l02-admission-v1/host-v15.json')));
 const paths=[...new Set([...INPUTS,...imagePins.map(item=>item.path),
  ...proof.files.map(item=>item.path),...host.files.map(item=>item.path),
  ...proof.external.map(item=>path.join(item.root,item.pin.path))])];
 assert.equal(new Set(paths).size,paths.length,'one input path per pin');
 const before=await pins(paths);
 for(const source of [SWF,XML,MOVIE,ART_AUDIT])
  assert.deepEqual(before.find(item=>item.path===source.path),source,`source pin ${source.path}`);
 assert.equal(before.find(item=>item.path===AUDIO_MANIFEST.path)?.sha256,AUDIO_MANIFEST.sha256);
 for(const expected of imagePins){const actual=before.find(item=>item.path===expected.path);
  assert.deepEqual(actual,{path:expected.path,bytes:expected.bytes,sha256:expected.sha256});}
 for(const [kind,source] of Object.entries(AUDIO)){
  const file=`${AUDIO_ROOT}/sprite-${source.sprite}-source-stream-v1.mp3`;
  assert.deepEqual(before.find(item=>item.path===file),{path:file,bytes:source.bytes,sha256:source.sha256},kind);
 }
 const audioManifest=JSON.parse(await readFile(AUDIO_MANIFEST.path));
 assert.equal(audioManifest.sourceSwf.sha256,SWF.sha256);assert.equal(audioManifest.audioAccepted,false);
 for(const source of Object.values(AUDIO)){
  const row=audioManifest.streams.find(item=>item.sourceCharacterId===source.sprite);
  assert.deepEqual(row?.encoded,{path:`${AUDIO_ROOT}/sprite-${source.sprite}-source-stream-v1.mp3`,
   bytes:source.bytes,sha256:source.sha256});
 }
 const activation=await readFile(disk('apps/web/lib/nms-l02-p064-admission-activation.ts'),'utf8');
 assert.match(activation,/"stage":\s*"registered"/u,'registered P064 predecessor');
 const registry=JSON.parse(await readFile(disk('packages/demos/private-current-js-registry.json')));
 const keys=registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert.equal(keys.length,REGISTERED?637:636);
 assert.equal(keys.filter(key=>key.startsWith('shared-')).length,REGISTERED?495:494);
 assert(keys.includes(PREVIOUS)&&keys.includes(ID)===REGISTERED,'exact formal registry phase');
 const formalActivation=await readFile(disk('apps/web/lib/nms-l02-p054-admission-activation.ts'),'utf8');
 assert.match(formalActivation,REGISTERED?/"stage":\s*"registered"/u:/"stage":\s*"candidate"/u);
 for(const expected of [...proof.files,...host.files,...proof.external.map(item=>({...item.pin,path:path.join(item.root,item.pin.path)}))])
  assert.deepEqual(before.find(item=>item.path===expected.path),expected,`formal evidence ${expected.path}`);
 const route=await readFile(disk('apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p054/page.tsx'),'utf8');
 assert.match(route,/nmsL02P054AdmissionDescriptor/u,'formal My Lesson source-bound route');
 return{before,paths,imagePins};
}
function installMediaTrace(){
 const trace={audio:[],audioEvents:[],feedback:[],feedbackResponses:[],responseErrors:[],
  pending:[],blobRevokes:[]};
 Object.defineProperty(window,'__P054_PROBE',{value:trace});
 const NativeAudio=window.Audio;
 window.Audio=new Proxy(NativeAudio,{construct(target,args){
  const node=Reflect.construct(target,args,target),id=trace.audio.length;
  trace.audio.push(node);
  for(const type of ['play','playing','pause','ended','abort','emptied','error'])
   node.addEventListener(type,()=>trace.audioEvents.push({id,type,at:performance.now(),
    paused:node.paused,readyState:node.readyState,networkState:node.networkState}));
  return node;
 }});
 const revoke=URL.revokeObjectURL.bind(URL);
 URL.revokeObjectURL=function(url){trace.blobRevokes.push(String(url));return revoke(url);};
 const nativeFetch=window.fetch;
 window.fetch=async function(...args){
  const response=await nativeFetch.apply(this,args),url=new URL(response.url,location.origin);
  if(url.origin===location.origin&&url.pathname.startsWith('/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/')){
   const clone=response.clone();trace.pending.push(clone.arrayBuffer().then(async body=>{
    const digest=await crypto.subtle.digest('SHA-256',body);
    trace.feedbackResponses.push({url:response.url,status:response.status,bytes:body.byteLength,
     contentType:response.headers.get('content-type'),contentLength:response.headers.get('content-length'),
     redirected:response.redirected,sha256:[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('')});
   }).catch(error=>trace.responseErrors.push(String(error))));
  }return response;
 };
}
async function observeBoard(page){await page.evaluate(selector=>{
 const board=document.querySelector(selector);if(!board)throw Error('P054 board missing');
 const trace=window.__P054_PROBE;
 const record=()=>trace.feedback.push({phase:board.getAttribute('data-p054-phase'),
  frame:board.getAttribute('data-p054-feedback-frame'),
  last:board.getAttribute('data-p054-last-feedback-frame'),
  score:board.getAttribute('data-p054-score'),at:performance.now()});
 record();new MutationObserver(record).observe(board,{attributes:true,attributeFilter:[
  'data-p054-phase','data-p054-feedback-frame','data-p054-last-feedback-frame','data-p054-score']});
},BOARD);}
async function snapshot(page,label){return page.evaluate(({host,board,label})=>{
 const h=document.querySelector(host),b=document.querySelector(board),trace=window.__P054_PROBE;
 return{label,url:location.href,currentAnimation:h?.getAttribute('data-current-animation-id'),
  currentPage:h?.getAttribute('data-current-page'),availability:h?.getAttribute('data-renderer-availability'),
  level:Number(b?.getAttribute('data-p054-level')),phase:b?.getAttribute('data-p054-phase'),
  score:Number(b?.getAttribute('data-p054-score')),matched:Number(b?.getAttribute('data-p054-matched-pairs')),
  frame:b?.getAttribute('data-p054-feedback-frame'),lastFrame:b?.getAttribute('data-p054-last-feedback-frame'),
  paused:b?.getAttribute('data-p054-paused'),audioStatus:b?.getAttribute('data-p054-audio-status'),
  audioPlaying:b?.getAttribute('data-p054-audio-playing'),
  audio:trace.audio.map((node,id)=>({id,src:node.getAttribute('src'),paused:node.paused,
   readyState:node.readyState,networkState:node.networkState})),
  audioEvents:trace.audioEvents.slice(),blobRevokes:trace.blobRevokes.length,
  feedback:trace.feedback.slice(),fq:{attempted:Number(h?.getAttribute('data-lesson-host-fq-attempted')),
   correct:Number(h?.getAttribute('data-lesson-host-fq-correct'))},
  layout:b?{stageHeight:b.closest('.lesson-shell2__stage')?.clientHeight,
   stageScroll:b.closest('.lesson-shell2__stage')?.scrollHeight,
   boardWidth:b.clientWidth,boardScroll:b.scrollWidth,
   documentWidth:document.documentElement.clientWidth,documentScroll:document.documentElement.scrollWidth}:null,
  alerts:[...document.querySelectorAll('[role="alert"]')].map(node=>node.textContent?.trim()).filter(Boolean)};
},{host:HOST,board:BOARD,label});}
async function select(page,id){
 const map=page.locator('button[data-responsive-focus-key="map"]:visible').first();
 await map.scrollIntoViewIfNeeded();await map.click();
 const target=page.locator(`button[data-placement-id="${id}"]:visible`).first();
 await target.scrollIntoViewIfNeeded();await target.click();
 await page.locator(`${HOST}[data-current-animation-id="${id}"]`).waitFor();
}
async function boardReady(page,level){
 await page.locator(`${BOARD}[data-p054-level="${level}"][data-p054-audio-status="ready"]`).waitFor({timeout:45000});
}
async function clickCard(page,name){const card=page.locator(`${BOARD} button.p054-board__card[data-source-instance="${name}"]`);
 await card.scrollIntoViewIfNeeded();assert.equal(await card.isDisabled(),false,name);await card.click();}
async function feedbackCursor(page){return page.evaluate(()=>window.__P054_PROBE.feedback.length);}
async function waitFeedbackEnd(page,kind,score,matched,eventStart){
 const terminal=kind==='correct'?27:31;
 await page.waitForFunction(({selector,score,matched,terminal})=>{
  const b=document.querySelector(selector);return b?.getAttribute('data-p054-phase')===(matched===6?'terminal-unresolved':'selecting')&&
   b.getAttribute('data-p054-score')===String(score)&&
   b.getAttribute('data-p054-matched-pairs')===String(matched)&&
   b.getAttribute('data-p054-last-feedback-frame')===String(terminal);
 },{selector:BOARD,score,matched,terminal},{timeout:12000,polling:50});
 const state=await snapshot(page,`${kind}-feedback-end-${matched}`);
 const events=state.feedback.slice(eventStart);
 assert(events.some(row=>row.phase===`feedback-${kind}`&&row.frame==='2'),`${kind} frame 2 observed`);
 assert(events.some(row=>row.last===String(terminal)),`${kind} terminal frame observed`);
 return state;
}
function expectedReveal(artPins,level,order){
 const pin=artPins.find(row=>row.level===level&&row.order===order);assert(pin);return pin;
}
async function caseRun(browser,config,dir,artPins){
 const record={...config,status:'running',formal:true,expectedRegistered:REGISTERED,ready:false,step:'entry',response:null,
  observations:[],screenshots:[],resources:[],requests:[],resourceErrors:[],errors:[],
  consoleDiagnostics:[],developmentUpdates:[]};
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},
  locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reducedMotion,serviceWorkers:'block'});
 await context.addInitScript(installMediaTrace);
 const page=await context.newPage();page.setDefaultTimeout(30000);
 page.on('pageerror',error=>record.errors.push(error.message));
 page.on('console',message=>{if(['error','warning'].includes(message.type()))
  record.consoleDiagnostics.push({type:message.type(),text:message.text()});});
 page.on('request',request=>{const url=new URL(request.url());
  if(url.pathname.includes('.hot-update.')||request.resourceType()==='document'||
   (url.pathname.includes('/migration-status/')&&request.resourceType()==='fetch'))
   record.developmentUpdates.push({url:request.url(),kind:request.resourceType(),step:record.step});
  if(url.pathname.startsWith(`/flash-assets/g678-local/${ID}/`))
   record.requests.push({url:request.url(),method:request.method(),kind:request.resourceType()});
 });
 const responseTasks=[];
 page.on('response',response=>{const url=new URL(response.url());
  if(!new RegExp(`^/flash-assets/g678-local/${ID}/reveal/[12]/(?:[1-9]|1[0-2])$`,'u').test(url.pathname))return;
  responseTasks.push(response.body().then(body=>record.resources.push({url:response.url(),
   status:response.status(),bytes:body.length,sha256:sha(body),
   contentType:response.headers()['content-type'],redirected:response.request().redirectedFrom()!==null}))
   .catch(error=>record.resourceErrors.push({url:response.url(),error:error.message})));
 });
 try{
  const route=`${ORIGIN}/${config.locale}/${ROUTE}${config.level===2?'?level=2':''}`;
  const response=await page.goto(route,{waitUntil:'domcontentloaded',timeout:120000});
  record.response={status:response?.status()??null,url:response?.url()??null};
  assert.equal(record.response.status,200);
  assert.equal(await page.locator('main[data-p054-current-js]').getAttribute('data-p054-current-js'),
   EXPECTED_STAGE);
  await page.locator('[data-p054-lesson-host]').waitFor();
  await page.locator('[data-p054-runtime-status="contextual-candidate"]').waitFor({timeout:45000});
  await boardReady(page,config.level);record.ready=true;await observeBoard(page);
  let state=await snapshot(page,'entry');record.observations.push(state);
  assert.equal(state.currentAnimation,ID);assert.equal(state.currentPage,'54');
  assert.equal(state.availability,'registered');assert.equal(state.level,config.level);
  assert.equal(state.phase,'selecting');assert.equal(state.score,0);assert.equal(state.matched,0);
  assert(state.layout.stageScroll<=state.layout.stageHeight+1,'full board fits normal-flow host stage');
  assert(state.layout.boardScroll<=state.layout.boardWidth+1,'board has no horizontal overflow');
  assert(state.layout.documentScroll<=state.layout.documentWidth+1,'host has no horizontal overflow');
  assert.equal(state.audioPlaying,'false');assert.equal(state.audio.length,2);
  assert.equal(state.audioEvents.filter(event=>event.type==='playing').length,0,'no autoplay');
  assert.equal(state.fq.attempted,0);assert.equal(state.fq.correct,0);
  assert.match(await page.locator('body').innerText(),REGISTERED?/63\s*\/\s*64/u:/62\s*\/\s*64/u);
  if(!REGISTERED)assert.match(await page.locator('body').innerText(),config.locale==='es'
   ?/1 páginas candidatas sin registrar/u:/1 unregistered candidate pages/u);
  else assert.doesNotMatch(await page.locator('body').innerText(),/1 (?:páginas candidatas sin registrar|unregistered candidate pages)/u);
  assert.equal(await page.locator(HOST).getAttribute('data-unavailable-pages'),'1');
  const pages=await page.locator(`${HOST} button[data-placement-id]`).evaluateAll(buttons=>
   buttons.map(button=>({id:button.getAttribute('data-placement-id'),
    availability:button.getAttribute('data-renderer-availability')})));
  assert.equal(pages.length,64);assert.equal(new Set(pages.map(row=>row.id)).size,64);
  assert.equal(pages.filter(row=>row.availability==='registered').length,63);
  assert.equal(await page.locator(`${HOST} button[data-placement-id="${ID}"]`).getAttribute('data-renderer-availability'),
   'registered');
  await shot(page,dir,'entry',record);
  const help=page.locator(`${BOARD} .p054-board__tools button`);
  assert.match(await help.innerText(),config.locale==='es'?/Ayuda del botón Repeat original/u:/Help from source Repeat/u);
  record.step='help';await help.click();const dialog=page.locator(`${BOARD} dialog.p054-board__help`);
  await dialog.waitFor();assert.equal(await dialog.evaluate(node=>node.open),true);
  assert.equal(await dialog.locator('[data-source-text-id]').count(),4);
  await dialog.getByRole('button',{name:config.locale==='es'?'Cerrar ayuda':'Close help'}).click();
  await page.waitForFunction(selector=>document.activeElement===document.querySelector(selector),
   `${BOARD} .p054-board__tools button`);
  record.step='replay-during-wrong-feedback';
  await clickCard(page,'Mc1_1');await clickCard(page,'Mc2_2');
  await page.waitForFunction(()=>window.__P054_PROBE.audioEvents.some(e=>e.id===1&&e.type==='playing'),
   null,{timeout:10000});
  state=await snapshot(page,'wrong-audio-playing-before-replay');record.observations.push(state);
  assert.equal(state.phase,'feedback-wrong');assert(state.frame!==''&&Number(state.frame)>=2&&Number(state.frame)<31);
  await page.locator('button[data-responsive-focus-key="replay"]:visible').first().click();
  await boardReady(page,config.level);
  await page.waitForFunction(selector=>{
   const b=document.querySelector(selector);return b?.getAttribute('data-p054-phase')==='selecting'&&
    b.getAttribute('data-p054-score')==='0'&&b.getAttribute('data-p054-matched-pairs')==='0';
  },BOARD);
  state=await snapshot(page,'host-replay-reset');record.observations.push(state);
  assert(state.audio.slice(0,2).every(row=>row.paused&&row.src===null),'old Blob audio stopped/cleared');
  assert(state.blobRevokes>=2,'old Blob URLs revoked');
  record.step='wrong-pair';await observeBoard(page);
  let eventStart=await feedbackCursor(page);
  await clickCard(page,'Mc1_1');await clickCard(page,'Mc2_2');
  await page.waitForFunction(()=>window.__P054_PROBE.audioEvents.some(e=>e.id===3&&e.type==='playing'),
   null,{timeout:10000});
  const pauseControl=page.locator('button[data-responsive-focus-key="pause"][data-playback-action="pause"]:visible').first();
  await pauseControl.click();
  await page.waitForFunction(selector=>{
   const b=document.querySelector(selector),audio=window.__P054_PROBE.audio[3];
   return b?.getAttribute('data-p054-paused')==='true'&&audio?.paused===true;
  },BOARD);
  state=await snapshot(page,'host-paused-during-wrong-feedback');record.observations.push(state);
  assert.equal(state.phase,'feedback-wrong');assert(state.frame!==''&&Number(state.frame)>=2);
  const heldFrame=state.frame,pausedEventCount=state.audioEvents.filter(e=>e.id===3&&e.type==='pause').length;
  assert(pausedEventCount>=1,'native wrong feedback clip emitted pause');
  await page.waitForTimeout(350);
  state=await snapshot(page,'host-held-feedback-frame');record.observations.push(state);
  assert.equal(state.frame,heldFrame,'host pause freezes source feedback clock');
  assert.equal(state.audio[3]?.paused,true,'host pause keeps native feedback clip paused');
  await page.locator('button[data-responsive-focus-key="pause"][data-playback-action="play"]:visible').first().click();
  await page.waitForFunction(({selector,heldFrame})=>{
   const b=document.querySelector(selector);
   return b?.getAttribute('data-p054-paused')==='false'&&
    Number(b.getAttribute('data-p054-feedback-frame'))>Number(heldFrame);
  },{selector:BOARD,heldFrame},{timeout:10000});
  state=await waitFeedbackEnd(page,'wrong',-2,0,eventStart);record.observations.push(state);
  assert.equal(state.score,-2,'negative score is not clamped');
  await shot(page,dir,'negative-score',record);
  record.step='six-source-pairs';
  for(let pair=1;pair<=6;pair++){
   eventStart=await feedbackCursor(page);
   await clickCard(page,`Mc${pair}_1`);await clickCard(page,`Mc${pair}_2`);
   state=await waitFeedbackEnd(page,'correct',-2+pair*10,pair,eventStart);record.observations.push(state);
   assert.equal(await page.locator(`${BOARD} button[data-source-instance="Mc${pair}_1"]`).getAttribute('data-p054-matched'),'true');
   assert.equal(await page.locator(`${BOARD} button[data-source-instance="Mc${pair}_2"]`).getAttribute('data-p054-matched'),'true');
  }
  assert.equal(state.phase,'terminal-unresolved');assert.equal(state.score,58);
  assert.equal(await page.locator(`${BOARD} [data-p054-terminal]`).count(),1);
  assert.equal(await page.locator(`${BOARD} button`).filter({hasText:/^(?:Continue|Continuar)$/u}).count(),0,
   'feedback advances automatically without a Continue control');
  assert.equal(await page.locator(`${HOST} button[data-placement-id="${ID}"]`).getAttribute('data-complete'),'false');
  await page.waitForTimeout(500);
  assert.equal(await page.locator(HOST).getAttribute('data-current-animation-id'),ID,'no host completion/advance');
  await shot(page,dir,'terminal-unresolved',record);
  record.step='navigate-p064';await select(page,PREVIOUS);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"] [data-p064-question="4"]`).waitFor({timeout:45000});
  assert.equal(await page.locator(HOST).getAttribute('data-current-page'),'64');
  const fq=await page.locator(HOST).evaluate(node=>({attempted:node.getAttribute('data-lesson-host-fq-attempted'),
   correct:node.getAttribute('data-lesson-host-fq-correct')}));
  assert.deepEqual(fq,{attempted:'0',correct:'0'});
  state=await snapshot(page,'p064-navigation');record.observations.push(state);
  assert(state.audio.length>=4,'Replay and navigation created two source feedback clip pairs');
  assert(state.audio.slice(0,4).every(row=>row.paused&&row.src===null),
   'all old P054 Blob audio cleared after Replay and navigation');
  assert(state.blobRevokes>=4,'P054 replay and navigation revoke Blob URLs');
  record.step='return-p054';await select(page,ID);await boardReady(page,config.level);
  state=await snapshot(page,'p054-return-reset');record.observations.push(state);
  assert.equal(state.level,config.level);assert.equal(state.phase,'selecting');
  assert.equal(state.score,0);assert.equal(state.matched,0);assert.equal(state.audioPlaying,'false');
  assert.equal(new URL(state.url).search,config.level===2?'?level=2':'');
  await shot(page,dir,'returned-reset',record);
  await page.evaluate(async()=>Promise.all(window.__P054_PROBE.pending));
  record.feedbackResponses=await page.evaluate(()=>({responses:window.__P054_PROBE.feedbackResponses,
   errors:window.__P054_PROBE.responseErrors,audioEvents:window.__P054_PROBE.audioEvents,
   blobRevokes:window.__P054_PROBE.blobRevokes.length,feedback:window.__P054_PROBE.feedback}));
  assert.deepEqual(record.feedbackResponses.errors,[]);
  for(const [kind,expected] of Object.entries(AUDIO)){
   const target=`/flash-assets/g678-local/${ID}/feedback-audio/${kind}`;
   const matches=record.feedbackResponses.responses.filter(row=>new URL(row.url).pathname===target);
   assert(matches.length>=2,`${kind} fetched on initial mount and Replay`);
   for(const item of matches){assert.equal(new URL(item.url).origin,ORIGIN);
    assert.equal(new URL(item.url).search,`?sha256=${expected.sha256}`);
    assert.deepEqual({status:item.status,bytes:item.bytes,sha256:item.sha256,
     contentType:item.contentType,contentLength:item.contentLength,redirected:item.redirected},
     {status:200,bytes:expected.bytes,sha256:expected.sha256,contentType:'audio/mpeg',
      contentLength:String(expected.bytes),redirected:false});}
  }
  assert(record.feedbackResponses.audioEvents.some(row=>row.id===1&&row.type==='playing'),
   'actual wrong native audio played');
  assert(record.feedbackResponses.audioEvents.some(row=>row.id>=2&&row.id%2===0&&row.type==='playing'),
   'actual correct native audio played');
  await bounded(Promise.all(responseTasks),'reveal response bodies',15000);
  assert.deepEqual(record.resourceErrors,[]);
  const reveals=record.resources.filter(row=>new URL(row.url).pathname.includes('/reveal/'));
  for(let order=1;order<=12;order++){
   const pathname=`/flash-assets/g678-local/${ID}/reveal/${config.level}/${order}`;
   const hits=reveals.filter(row=>new URL(row.url).pathname===pathname);
   assert(hits.length>=1,`actual reveal tile ${order}`);
   const expected=expectedReveal(artPins,config.level,order);
   for(const item of hits)assert.deepEqual({status:item.status,bytes:item.bytes,sha256:item.sha256,
    contentType:item.contentType?.split(';')[0],redirected:item.redirected},
    {status:200,bytes:expected.bytes,sha256:expected.sha256,
     contentType:'image/svg+xml',redirected:false});
  }
  assert(record.requests.every(item=>new URL(item.url).origin===ORIGIN&&item.method==='GET'));
  assert.deepEqual(record.errors,[]);
  assert.deepEqual(record.consoleDiagnostics,[],'no browser console error or warning');
  assert.equal(record.developmentUpdates.filter(item=>item.url.includes('.hot-update.')).length,0);
  record.status='technical-pass-not-acceptance';
 }catch(error){record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  record.failureState=await snapshot(page,'failure').catch(()=>null);
  await page.screenshot({path:path.join(dir,`${config.name}-failure.png`),fullPage:true}).catch(()=>{});
 }finally{
  record.contextClose=await bounded(context.close(),'context close',15000).then(()=> 'closed',error=>`error:${error.message}`);
  await writeFile(path.join(dir,`${config.name}-record.json`),json(record),{flag:'wx'});
 }return record;
}
export async function run(args){
 const options=parseArgs(args);if(options.mode==='plan')return plan();
 const dir=path.join(ROOT,OUTPUT,options.slug);await mkdir(path.dirname(dir),{recursive:true});await mkdir(dir);
 let prepared;try{prepared=await preflight();}
 catch(error){const result={...plan(),status:'failed',phase:'preflight',failure:{message:error.message,stack:error.stack},
  cases:[],originalRuntimeAccepted:false,audioListeningAccepted:false,humanAccepted:false,
  ownerAccepted:false,strictComplete:false,published:false};
  await writeFile(path.join(dir,'result.json'),json(result),{flag:'wx'});return result;}
 const result={...plan(),status:'running',startedAt:new Date().toISOString(),
  inputPinsBefore:prepared.before,cases:[],cleanupErrors:[],originalRuntimeAccepted:false,
  audioListeningAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES)result.cases.push(await caseRun(browser,config,dir,prepared.imagePins));
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
 run(process.argv.slice(2)).then(result=>{console.log(json({status:result.status,output:OUTPUT,cases:result.cases?.length??0}));
  process.exitCode=result.status==='failed'?1:0;
 }).catch(error=>{console.error(error.stack??error);process.exitCode=1;});
}
