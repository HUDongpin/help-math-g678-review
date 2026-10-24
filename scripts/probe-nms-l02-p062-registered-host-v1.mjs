#!/usr/bin/env node
/** Real-time local P062 product probe. --plan is read-only; --run owns one unique evidence directory. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331',ID='shared-nms002-l02-p062',PREVIOUS='shared-nms002-l02-p061';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/TS/L2TS09.swf`,bytes:564902,
 sha256:'5a075362f005aab68406d5fae2378f622a64520ec19e4b03b9ac9abbbd5faa50'};
const XML={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIO_ROOT='output/nms-l02-p062-source-20260928/extraction/audio';
const AUDIO=Object.freeze({
  "sprite-85": {
    "bytes": 28470,
    "sha256": "cc86fd730e1738e0f1a19976fe0cbdd06b3f92eef3a291bdd3a13b84b83b57c0",
    "samples": 126144,
    "channels": 1
  },
  "sprite-138": {
    "bytes": 11570,
    "sha256": "770ce8a109fb78c238d218e479047529e8cb39f006f8c70747be376556e2a541",
    "samples": 51264,
    "channels": 1
  },
  "sprite-150": {
    "bytes": 11050,
    "sha256": "3506fcffbe07e726fd4cf1c750cd2641d2aa06f4ca14379b4407ea5843e4f0f0",
    "samples": 48960,
    "channels": 1
  },
  "sprite-178": {
    "bytes": 11050,
    "sha256": "f87ec03bf9163390a117b6ad1ea7c47dab7ea7e729219acff0e0617f6100a9f1",
    "samples": 48960,
    "channels": 1
  },
  "sprite-192": {
    "bytes": 11960,
    "sha256": "2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77",
    "samples": 52992,
    "channels": 1
  },
  "sprite-209": {
    "bytes": 11050,
    "sha256": "3dda8c412ae366891bd7ce7f1603c70f4ec8438806191c75a25328963fdb8ee7",
    "samples": 48960,
    "channels": 1
  },
  "sprite-230": {
    "bytes": 12740,
    "sha256": "c9502f3d979684587046242dc9022b8aa89e89c72688dfa4bc027858badd9e6e",
    "samples": 56448,
    "channels": 1
  },
  "sprite-256": {
    "bytes": 11960,
    "sha256": "70f9eeb16521b9fe8c12f243af3c99482c185a39dab38b226eb3801ed204290b",
    "samples": 52992,
    "channels": 1
  },
  "sprite-288": {
    "bytes": 11856,
    "sha256": "113258636df75e97cc83ceb37ed3f476453cf091834633480aaa6ebe63fd5875",
    "samples": 43776,
    "channels": 2
  },
  "sprite-302": {
    "bytes": 12350,
    "sha256": "7e9810de5390cdc982dac2795e046343157a6ad9fe4a2ab13e1020b401b2ad11",
    "samples": 54720,
    "channels": 1
  },
  "sprite-315": {
    "bytes": 339430,
    "sha256": "2d075a4f380c182816be0c3d30e5f945ad3e6cebaa9e3d169c747bea3dcce170",
    "samples": 1503936,
    "channels": 1
  }
});
const FEEDBACK_ALLOWED=Object.freeze(['sprite-138','sprite-150','sprite-178','sprite-288','sprite-230','sprite-209','sprite-256']);
const HOST='[data-lesson-player][data-current-animation-id]';
const RUNTIME=`${HOST}[data-current-animation-id="${ID}"] [data-p062-runtime="${ID}"]`;
const CASES=Object.freeze([
 {name:'en-desktop',locale:'en',width:1440,height:900,reduced:false,answers:'wrong-then-right'},
 {name:'es-mobile-reduced',locale:'es',width:390,height:844,reduced:true,answers:'two-wrong'},
]);
const INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p062-registered-host-v1.mjs',
 'apps/web/lib/nms-l02-p061-admission-activation.ts',
 'apps/web/lib/nms-l02-p061-admission.server.ts',
 'apps/web/lib/nms-l02-p062-admission-activation.ts',
 'apps/web/lib/nms-l02-p062-admission.server.ts',
 'apps/web/lib/nms-l02-p062-descriptor-extension.ts',
 'lib/nms-l02-p062-admission-semantics.mjs',
 'lib/nms-l02-successor-proof.mjs',
 'catalog/nms-l02-admission-v1/host-v12.json',
 'catalog/nms-l02-admission-v1/host-v13.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p061-v1.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json',
 'output/nms-l02-p062-product-20260928/admission/host-v13-seal-receipt.json',
 'output/nms-l02-p062-product-20260928/admission/page-prepare-receipt.json',
 'output/nms-l02-p062-product-20260928/registration/receipt.json',
 'scripts/register-nms-l02-p062-current-js-v1.mjs',
 'catalog/product-bridge-calibrations/g678-nms-l02-p062-conditional-host-current-js-v1.json',
 'catalog/product-bridge-calibrations/g678-nms-l02-p062-conditional-host-current-js-v1.fragment.json',
 'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 'packages/demos/private-current-js-registry.json',
 'packages/demos/src/registry.local-only.generated.ts',
 'packages/demos/src/registry.local-only.metadata.generated.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p061/page.tsx',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p062/page.tsx',
 'apps/web/components/g678-nms-l02-p062-candidate-lesson-v1.generated.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/nms-l02-p062-lesson-runtime-v1.tsx',
 'apps/web/components/nms-l02-p062-host-v1.css',
 'apps/web/lib/nms-l02-p062-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p062-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p062/[asset]/route.ts',
 'packages/demos/src/nms-l02-p062-product-module-v1.tsx',
 'packages/demos/src/modules/shared-nms002-l02-p062.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p062.ts',
 'packages/demos/src/nms-l02-p062-product-renderer-v1.tsx',
 'packages/demos/src/nms-l02-p062-state-v1.ts',
 'packages/demos/src/nms-l02-p062-session-v1.ts',
 'packages/demos/src/nms-l02-p062-audio-v1.ts',
 'packages/demos/src/generated/nms-l02-p062-display-list-v1.ts',
  'packages/demos/src/generated/nms-l02-p062-audio-v1.ts',
 'packages/demos/src/alg-l12-glossary-pair-audio-loader.ts',
 'output/nms-l02-p062-source-20260928/source-audit.json',
 'output/nms-l02-p062-source-20260928/audio-raw-index.json',
 'output/nms-l02-p062-audio-20260928/receipt.json',
 'output/nms-l02-p062-display-20260928/receipt.json',
 'output/nms-l02-p062-behavior-20260928/source-behavior-v1.json',
 'output/nms-l02-p062-behavior-20260928/host-control-wording-v1.json',
 ...Object.keys(AUDIO).map(domain=>`${AUDIO_ROOT}/${domain}.mp3`),SOURCE.path,XML.path,
]);
const OCCURRENCES=Object.freeze([]); // All seven authored buttons are quiz/help/popup controls, no KeyAttribute.
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const file=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);
const pin=async relative=>{const bytes=await readFile(file(relative));return{path:relative,bytes:bytes.length,sha256:hash(bytes)};};
async function pins(){return Promise.all(INPUTS.map(pin));}
function checkNoGlossary(state){
 assert.equal(state.sourceGlossaryControls,'0');
 assert.deepEqual(state.controls,[],`P062 has no source KeyAttribute buttons at frame ${state.frame}`);
 assert.equal(state.glossaryDialogCount,0);
}
export function parseArgs(argv){
 if(argv.length===1&&argv[0]==='--plan')return{mode:'plan'};
 assert.ok(argv.length===2&&argv[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[1]??''),
  'Usage: --plan | --run <unique-slug>; browser origin is fixed at http://127.0.0.1:3331');
 return{mode:'run',slug:argv[1]};
}
export function plan(){return{
 kind:'nms-l02-p062-registered-host-probe-plan-v1',animationId:ID,base:BASE,
 route:'/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p062',
 stage:'registered-local-current-js',formalReaderBound:true,registrationEffect:'one-P062-page',
 registeredPredecessorCount:60,registeredPageCount:61,renderableCount:61,unregisteredCandidateCount:0,activePageCount:64,
 historicalHostAssociationEstablished:false,historicalGlossaryBankAssociationEstablished:false,
 source:SOURCE,sourceXml:XML,main:{rootFrames:10,frameDomain:'sprite-315',sourceFrames:837,authoredStops:[384,523,650,766,815,834]},
 helpBoxes:[{spriteId:106,mainStop:650,releaseFrame:15,resetFrame:20},
  {spriteId:122,mainStop:766,releaseFrame:21,resetFrame:27}],
 cases:CASES,sourceOccurrences:OCCURRENCES,sourceGlossaryControlsPresent:false,
 authoredButtonCount:7,audioDomains:AUDIO,applicableFeedback:FEEDBACK_ALLOWED,
 branchPolicy:'UI seed zero: first wrong 138, second wrong 150, wrong then right 256. Selector is conditional identified-host modern policy; P062 historical host binding is unproved.',
 checks:['no autoplay/fetch at entry; no seek; real audio clock, two isolated EN desktop and ES mobile reduced-motion cases',
  'main 315 stops 384/523/650/766/815/834; two independent help boxes 106 and 122 reveal, play, release, close without main resume',
  'seven authored buttons have no KeyAttribute, including inside both boxes and hint314; popup Escape and focus return',
  'wrong ordinal 1 then right ordinal 3, and separate wrong ordinals 1 then 2; replay twice, registered P061 navigation, maximum one active audio node',
  'all 11 local MP3 source pins; actual same-origin response and WebAudio decode match reached main and feedback domains',
  'host-v13 and P062 page proof remain bound by registered activation, exact local transaction receipt and formal admission reader',
  'registry and header report 61/64 registered with zero unregistered candidates; original-runtime, listening, human and publication gates remain open'],
 inputPaths:INPUTS,
 };}
async function bounded(operation,label,ms=10000){
 let timer;try{return await Promise.race([operation,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error(`P062 probe timeout: ${label}`)),ms);
 })]);}finally{clearTimeout(timer);}
}
async function screenshot(page,dir,name,record){
 const target=path.join(dir,`${name}.png`);const bytes=await page.screenshot({path:target,fullPage:true});
 record.screenshots.push({path:path.relative(ROOT,target),bytes:bytes.length,sha256:hash(bytes)});
}
async function waitState(page,test,argument,timeout=30000){
 await page.waitForFunction(test,argument,{timeout,polling:50});
}
async function snapshot(page,label){
 return page.evaluate(({host,runtime,label})=>{
  const h=document.querySelector(host),r=document.querySelector(runtime),p=window.__P062_PROBE;
  const controls=[...(r?.querySelectorAll('button[data-source-instance-id]')??[])].map(x=>({
   id:x.getAttribute('data-source-instance-id'),key:x.getAttribute('data-source-key-attribute'),
   label:x.textContent?.trim(),disabled:x.disabled,width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}));
  return{label,at:performance.now(),animationId:h?.getAttribute('data-current-animation-id'),
   currentPage:h?.getAttribute('data-current-page'),availability:h?.getAttribute('data-renderer-availability'),
   unavailablePages:h?.getAttribute('data-unavailable-pages'),frame:Number(r?.getAttribute('data-p062-frame')),
   phase:r?.getAttribute('data-p062-phase'),audioPhase:r?.getAttribute('data-p062-audio-phase'),
   audioDomain:r?.getAttribute('data-p062-audio-domain'),audioSample:Number(r?.getAttribute('data-p062-audio-sample')),
   paused:r?.getAttribute('data-runtime-paused'),ready:r?.getAttribute('data-p062-ready'),
   boxFrame:r?.getAttribute('data-p062-box-frame'),feedbackFrame:r?.getAttribute('data-p062-feedback-frame'),
   feedbackSprite:r?.querySelector('[data-p062-feedback-sprite]')?.getAttribute('data-p062-feedback-sprite')??null,
   tries:Number(r?.getAttribute('data-p062-tries')),replay:Number(r?.getAttribute('data-p062-replay')),
   canvas:r?.getAttribute('data-canvas-status'),sourceSha:r?.querySelector('[data-source-swf-sha256]')?.getAttribute('data-source-swf-sha256'),
   languagePolicy:r?.querySelector('[data-language-policy]')?.getAttribute('data-language-policy'),
   controls,sourceGlossaryControls:r?.getAttribute('data-source-glossary-controls'),
   glossaryDialogCount:document.querySelectorAll('[role="dialog"][data-glossary-entry-id]').length,
   hintOpen:!!r?.querySelector('dialog.nms-p062-hint[open]'),
   answerControls:r?.querySelectorAll('button[data-p062-answer]').length??0,
   audio:{active:p.audio.active,maxActive:p.audio.maxActive,started:p.audio.started,stopped:p.audio.stopped},
   frameTrace:p.frames.slice(),feedbackTrace:p.feedback.slice(),overflow:document.documentElement.scrollWidth>innerWidth+1};
 },{host:HOST,runtime:RUNTIME,label});
}
async function clickHost(page,key){
 const button=page.locator(`button[data-responsive-focus-key="${key}"]:visible`).first();
 await button.scrollIntoViewIfNeeded();await button.click();
}
async function ensurePlay(page){
 assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
 await clickHost(page,'pause');
}
async function waitMainStop(page,frame,timeout=75000){
 await waitState(page,({selector,frame})=>{const r=document.querySelector(selector);
  return r?.getAttribute('data-p062-frame')===String(frame)&&r.getAttribute('data-runtime-paused')==='true'&&
   r.getAttribute('data-p062-ready')==='true';},{selector:RUNTIME,frame},timeout);
}
async function waitBox(page,frame,timeout=20000){
 await waitState(page,({selector,frame})=>document.querySelector(selector)?.getAttribute('data-p062-box-frame')===String(frame),
  {selector:RUNTIME,frame},timeout);
}
async function runBox(page,kind,record,dir){
 const frame=kind==='picture'?650:766,release=kind==='picture'?15:21;
 await page.locator(`${RUNTIME} button[data-p062-reveal="true"]`).click();
 await waitBox(page,1);
 let state=await snapshot(page,`${kind}-revealed`);record.observations.push(state);
 assert.equal(state.frame,frame);assert.equal(state.paused,'true');
 assert.equal(state.audio.active,0);
 checkNoGlossary(state);
 await screenshot(page,dir,`${kind}-revealed`,record);
 await page.locator(`${RUNTIME} button[data-p062-box-play="true"]`).click();
 await waitBox(page,release,kind==='picture'?7000:16000);
 state=await snapshot(page,`${kind}-release`);record.observations.push(state);
 assert.equal(state.frame,frame);assert.equal(state.audio.active,0);
 checkNoGlossary(state);
 const strategy=await page.locator(`${RUNTIME} [data-p062-panel="${kind==='picture'?'equation-strategy':'backward-strategy'}"]`).innerText();
 assert.match(strategy,kind==='picture'?
  /Taxes = 8% × \$20\.00 = 0\.08 × \$20\.00 = \$1\.60/u:
  /Taxes = \$21\.60 − \$20\.00 = \$1\.60/u);
 await screenshot(page,dir,`${kind}-release`,record);
 await page.locator(`${RUNTIME} button[data-p062-box-close="true"]`).click();
 await waitBox(page,1,5000);
 state=await snapshot(page,`${kind}-closed`);record.observations.push(state);
 assert.equal(state.frame,frame);assert.equal(state.audio.active,0);
 checkNoGlossary(state);
 await screenshot(page,dir,`${kind}-closed`,record);
}
async function answer(page,ordinal,record,dir){
 await page.locator(`${RUNTIME} button[data-p062-answer="${ordinal}"]`).click();
 await waitState(page,({selector,previous})=>{
  const r=document.querySelector(selector),p=window.__P062_PROBE;
  return r&&p.feedback.length>previous;},{selector:RUNTIME,previous:record.feedbackObserved},7000);
 const started=await snapshot(page,`answer-${ordinal}-feedback`);record.observations.push(started);
 record.feedbackObserved=started.feedbackTrace.length;
 await screenshot(page,dir,`answer-${ordinal}-feedback-${record.feedbackObserved}`,record);
 assert.equal(started.frame,815);
 await waitState(page,selector=>{
  const r=document.querySelector(selector);
  return r&&r.getAttribute('data-p062-feedback-frame')===''&&
   (r.getAttribute('data-p062-tries')==='1'||Number(r.getAttribute('data-p062-frame'))>815);
 },RUNTIME,12000);
 const after=await snapshot(page,`answer-${ordinal}-settled`);record.observations.push(after);
 assert.equal(after.audio.maxActive,1);
}
function expectedAudioDomain(url){
 const parsed=new URL(url);if(parsed.origin!==BASE)return null;
 const match=/^\/migration-assets\/nms-l02-p062\/(sprite-\d+)\.mp3$/u.exec(parsed.pathname);
 return match?.[1]??null;
}
function validateAudio(record){
 const reached=new Set(record.assetResponses.map(row=>row.domain));
 assert.ok(reached.has('sprite-315'));
 for(const item of record.assetResponses){
  const expected=AUDIO[item.domain];assert.ok(expected,`Unexpected P062 audio domain ${item.domain}`);
  assert.deepEqual({status:item.status,bytes:item.bytes,sha256:item.sha256,contentType:item.contentType,redirected:item.redirected},
   {status:200,bytes:expected.bytes,sha256:expected.sha256,contentType:'audio/mpeg',redirected:false});
  assert.equal(item.url,`${BASE}/migration-assets/nms-l02-p062/${item.domain}.mp3?sha256=${expected.sha256}`);
 }
 for(const item of record.decodes){
  const expected=Object.entries(AUDIO).find(([,value])=>value.sha256===item.sha256);
  assert.ok(expected,`Unexpected decoded P062 bytes ${item.sha256}`);
  assert.deepEqual({samples:item.samples,channels:item.channels,sampleRate:item.sampleRate},
   {samples:expected[1].samples,channels:expected[1].channels,sampleRate:22050});
  assert.ok(reached.has(expected[0]),'Decoded domain needs a verified response');
 }
 assert.ok(record.decodes.some(item=>item.sha256===AUDIO['sprite-315'].sha256));
 for(const domain of record.feedbackDomains)assert.ok(FEEDBACK_ALLOWED.includes(domain));
 assert.equal(record.audioTrace.maxActive,1);
 assert.equal(record.audioTrace.active,0);
}
async function runCase(browser,config,output,result){
 const dir=path.join(output,config.name);await mkdir(dir);
 const record={...config,status:'running',step:'context',route:`${BASE}/${config.locale}/migration-status/g678-calibration/${ID}`,
  response:null,observations:[],dialogs:[],screenshots:[],requests:[],assetResponses:[],decodes:[],
  feedbackDomains:[],feedbackObserved:0,errors:[],warnings:[],cleanupErrors:[]};
 result.cases.push(record);let context,page;
 try{
  context=await browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:1,
   isMobile:config.width<500,hasTouch:config.width<500,
   locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reduced?'reduce':'no-preference',
   serviceWorkers:'block'});
  await context.route('**/*',route=>{
   const url=new URL(route.request().url()),allowed=url.origin===BASE;
   record.requests.push({path:allowed?url.pathname:url.origin,method:route.request().method(),allowed});
   return allowed?route.continue():route.abort();
  });
  await context.addInitScript(()=>{
   const audio={active:0,maxActive:0,started:0,stopped:0,events:[]},frames=[],feedback=[],decodes=[];
   const responses=[],pendingResponses=[],responseErrors=[];
   Object.defineProperty(window,'__P062_PROBE',{value:{audio,frames,feedback,decodes,responses,pendingResponses,responseErrors}});
   // Hash the actual application fetch response in its owning document. CDP's
   // response.body may evict a resource even when the product decoded it.
   const nativeFetch=window.fetch;
   window.fetch=async function(...args){
    const response=await nativeFetch.apply(this,args),url=new URL(response.url,location.origin);
    const match=/^\/migration-assets\/nms-l02-p062\/(sprite-\d+)\.mp3$/u.exec(url.pathname);
    if(url.origin===location.origin&&match){
     const clone=response.clone();
     pendingResponses.push(clone.arrayBuffer().then(async bytes=>{
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      responses.push({domain:match[1],url:response.url,status:response.status,bytes:bytes.byteLength,
       sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''),
       contentType:response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()??null,
       redirected:response.redirected});
     }).catch(error=>responseErrors.push(String(error))));
    }
    return response;
   };
   const proto=AudioBufferSourceNode.prototype,start=proto.start,stop=proto.stop,active=new WeakSet();
   const finish=node=>{if(active.has(node)){active.delete(node);audio.active--;audio.stopped++;
    audio.events.push({kind:'stop',at:performance.now(),active:audio.active});}};
   proto.start=function(...args){const outcome=start.apply(this,args);if(!active.has(this)){
    active.add(this);audio.active++;audio.started++;audio.maxActive=Math.max(audio.maxActive,audio.active);
    audio.events.push({kind:'start',at:performance.now(),active:audio.active,bufferSamples:this.buffer?.length??null});
    this.addEventListener('ended',()=>finish(this),{once:true});}return outcome;};
   proto.stop=function(...args){const outcome=stop.apply(this,args);finish(this);return outcome;};
   const decode=BaseAudioContext.prototype.decodeAudioData;
   BaseAudioContext.prototype.decodeAudioData=function(data,...args){
    const copy=data.slice(0),outcome=decode.call(this,data,...args);
    return outcome.then(async buffer=>{const digest=await crypto.subtle.digest('SHA-256',copy);
     decodes.push({sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''),
      samples:buffer.length,channels:buffer.numberOfChannels,sampleRate:buffer.sampleRate});return buffer;});
   };
   let prior='';const capture=()=>{
    const runtime=document.querySelector('[data-p062-runtime="shared-nms002-l02-p062"]');
    const frame=runtime?.getAttribute('data-p062-frame'),phase=runtime?.getAttribute('data-p062-phase');
    const box=runtime?.getAttribute('data-p062-box-frame'),feedbackFrame=runtime?.getAttribute('data-p062-feedback-frame');
    const id=runtime?.querySelector('[data-p062-feedback-sprite]')?.getAttribute('data-p062-feedback-sprite');
    const key=`${frame}:${phase}:${box}:${feedbackFrame}:${id}`;
    if(frame&&key!==prior){prior=key;frames.push({frame:Number(frame),phase,box,feedbackFrame,at:performance.now()});
     if(id&&feedback.at(-1)?.spriteId!==id)feedback.push({spriteId:id,at:performance.now()});}
   };
   new MutationObserver(capture).observe(document,{subtree:true,childList:true,attributes:true,
    attributeFilter:['data-p062-frame','data-p062-phase','data-p062-box-frame','data-p062-feedback-frame','data-p062-feedback-sprite']});
   document.addEventListener('DOMContentLoaded',capture,{once:true});
  });
  page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',error=>record.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
   if(message.type()==='warning')record.warnings.push(message.text());});
  record.step='entry';const response=await page.goto(record.route,{waitUntil:'domcontentloaded',timeout:120000});
  record.response={status:response?.status()??null,url:response?.url()??null};assert.equal(record.response.status,200);
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
  assert.equal(await page.locator('main[data-p062-current-js]').getAttribute('data-p062-current-js'),'registered-local-current-js');
  await page.locator(`${RUNTIME}[data-p062-ready="true"]`).waitFor({timeout:30000});
  let state=await snapshot(page,'entry');record.observations.push(state);
  record.ready=state.ready==='true';record.formal=true;assert.equal(record.ready,true);
  assert.equal(state.animationId,ID);assert.equal(state.currentPage,'62');assert.equal(state.availability,'registered');
  assert.equal(state.unavailablePages,'3');assert.equal(state.frame,1);assert.equal(state.paused,'true');
  assert.match(await page.locator('body').innerText(),/61\/64/u);
  assert.match(await page.locator('body').innerText(),config.locale==='es'?/0 páginas candidatas sin registrar/u:/0 unregistered candidate pages/u);
  assert.equal(state.sourceSha,SOURCE.sha256);assert.equal(state.audio.started,0);assert.equal(state.audio.active,0);
  assert.equal(state.languagePolicy,config.locale==='es'?'english-source-fallback':'english-source');
  checkNoGlossary(state);assert.equal(state.overflow,false);
  const timeline=page.locator('input[data-responsive-focus-key="timeline"]:visible');
  if(await timeline.count())assert.equal(await timeline.first().isDisabled(),true,'P062 natural probe must not seek');
  await screenshot(page,dir,'entry',record);
  assert.equal(await page.evaluate(()=>window.__P062_PROBE.pendingResponses.length),0,'Entry must not fetch source audio');
  record.step='main-384';await ensurePlay(page);await waitMainStop(page,384);
  state=await snapshot(page,'stop-384');record.observations.push(state);assert.equal(state.audio.maxActive,1);
  checkNoGlossary(state);await screenshot(page,dir,'stop-384',record);
  record.step='main-523';await page.locator(`${RUNTIME} button[data-p062-continue="true"]`).click();
  await waitMainStop(page,523);state=await snapshot(page,'stop-523');record.observations.push(state);
  checkNoGlossary(state);await screenshot(page,dir,'stop-523',record);
  record.step='main-650';await page.locator(`${RUNTIME} button[data-p062-continue="true"]`).click();
  await waitMainStop(page,650);state=await snapshot(page,'stop-650');record.observations.push(state);
  checkNoGlossary(state);await screenshot(page,dir,'stop-650',record);
  const beforeHelp=await page.locator(RUNTIME).innerText();
  assert.doesNotMatch(beforeHelp,/\$21\.60|\$1\.60/u,'diagram total remains unknown before strategy help');
  assert.match(await page.locator(`${RUNTIME} [data-p062-modern-diagram]`).getAttribute('aria-label'),/total including eight percent tax/u);
  record.step='picture';await runBox(page,'picture',record,dir);
  record.step='main-766';await page.locator(`${RUNTIME} button[data-p062-continue="true"]`).click();
  await waitMainStop(page,766);state=await snapshot(page,'stop-766');record.observations.push(state);
  checkNoGlossary(state);await screenshot(page,dir,'stop-766',record);
  record.step='calculator';await runBox(page,'calculator',record,dir);
  record.step='main-815';await page.locator(`${RUNTIME} button[data-p062-continue="true"]`).click();
  await waitMainStop(page,815);state=await snapshot(page,'stop-815');record.observations.push(state);
  assert.equal(state.answerControls,4);checkNoGlossary(state);
  assert.deepEqual(await page.locator(`${RUNTIME} button[data-p062-answer]`).allTextContents(),
   ['A. $20.08','B. $20.80','C. $21.60','D. $21.80']);
  await screenshot(page,dir,'stop-815',record);
  record.step='hint-escape';const hintTrigger=page.locator(`${RUNTIME} button[data-p062-hint="true"]`);
  await hintTrigger.click();const dialog=page.locator(`${RUNTIME} dialog.nms-p062-hint[open]`);
  await dialog.waitFor();assert.equal(await dialog.evaluate(node=>node.matches(':modal')),true);
  state=await snapshot(page,'hint-open');record.observations.push(state);checkNoGlossary(state);
  assert.equal(state.hintOpen,true);assert.equal(await page.evaluate(()=>document.activeElement?.closest('dialog.nms-p062-hint')!==null),true);
  await screenshot(page,dir,'hint',record);
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
  await waitState(page,selector=>document.activeElement===document.querySelector(selector),
   `${RUNTIME} button[data-p062-hint="true"]`,8000);
  await hintTrigger.click();await dialog.waitFor();
  await page.locator(`${RUNTIME} button[data-p062-hint-close="true"]`).click();
  await dialog.waitFor({state:'detached'});
  await waitState(page,selector=>document.activeElement===document.querySelector(selector),
   `${RUNTIME} button[data-p062-hint="true"]`,8000);
  record.step='answers';await answer(page,1,record,dir);
  state=await snapshot(page,'first-wrong-settled');assert.equal(state.tries,1);assert.equal(state.frame,815);
  await answer(page,config.answers==='two-wrong'?2:3,record,dir);
  const expectedFeedback=config.answers==='two-wrong'?['138','150']:['138','256'];
  await waitMainStop(page,834,15000);state=await snapshot(page,'terminal');record.observations.push(state);
  assert.equal(state.frame,834);assert.equal(state.paused,'true');assert.equal(state.audio.active,0);
  assert.deepEqual(state.feedbackTrace.map(row=>row.spriteId),expectedFeedback);
  record.feedbackDomains=expectedFeedback.map(sprite=>`sprite-${sprite}`);
  assert.equal(state.tries,config.answers==='two-wrong'?0:1);
  assert.equal(state.overflow,false);checkNoGlossary(state);await screenshot(page,dir,'terminal',record);
  record.step='replay';let started=state.audio.started;
  await clickHost(page,'replay');
  await waitState(page,previous=>window.__P062_PROBE.audio.started>previous,started,10000);
  started=await page.evaluate(()=>window.__P062_PROBE.audio.started);
  await clickHost(page,'replay');
  await waitState(page,previous=>window.__P062_PROBE.audio.started>previous,started,10000);
  state=await snapshot(page,'double-replay');record.observations.push(state);
  assert.equal(state.audio.maxActive,1);assert.ok(state.frame<384);assert.equal(state.replay,2);
  checkNoGlossary(state);
  await screenshot(page,dir,'double-replay',record);
  record.step='late-navigation';await clickHost(page,'map');
  await page.locator(`button[data-placement-id="${PREVIOUS}"]`).click();
  await page.locator(`${HOST}[data-current-animation-id="${PREVIOUS}"]`).waitFor();
  await page.waitForFunction(selector=>document.querySelector(selector)===null,RUNTIME);
  await waitState(page,()=>window.__P062_PROBE.audio.active===0,null,7000);
  assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
  assert.equal(await page.locator(HOST).getAttribute('data-current-page'),'61');
  assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
  await screenshot(page,dir,'registered-p061-after-navigation',record);
  record.navigation={target:PREVIOUS,availability:'registered',audioActive:0};
  record.step='receipts';
  const fetchEvidence=await page.evaluate(async()=>{const p=window.__P062_PROBE;
   await Promise.all(p.pendingResponses);return {responses:p.responses,errors:p.responseErrors};});
  record.assetResponses=fetchEvidence.responses;record.errors.push(...fetchEvidence.errors);
  record.decodes=await page.evaluate(()=>window.__P062_PROBE.decodes.slice());
  record.audioTrace=await page.evaluate(()=>({...window.__P062_PROBE.audio}));
  validateAudio(record);
  assert.equal(record.requests.some(item=>item.path.startsWith('/migration-assets/nms-l02-p062/')&&
   !expectedAudioDomain(`${BASE}${item.path}`)),false,'No unexpected P062 asset path');
  assert.equal(record.requests.some(item=>/\/SA\/|L2TS09\.mp3|\/sa\.mp3/iu.test(item.path)),false,
   'No separate Spanish Audio or legacy SA request');
  assert.deepEqual(record.errors,[]);
  assert.equal(record.requests.filter(request=>request.path.includes('.hot-update.')).length,0,'stable development session');assert.ok(record.requests.every(item=>item.allowed));
  record.status='registered-host-probe-passed-not-acceptance';
 }catch(error){
  record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  await writeFile(path.join(dir,'failure-initial.json'),json(record),{flag:'wx'});
  if(page){await screenshot(page,dir,'failure',record).catch(()=>{});
   record.failureState=await bounded(snapshot(page,'failure'),'failure snapshot').catch(e=>({captureError:e.message}));}
 }finally{
  if(context)await bounded(context.close(),'context close',20000).catch(error=>record.cleanupErrors.push(error.message));
  if(record.cleanupErrors.length)record.status='failed';
  await writeFile(path.join(dir,'case-evidence.json'),json(record),{flag:'wx'});
 }
 return record;
}
export async function run(argv){
 const args=parseArgs(argv);if(args.mode==='plan'){const value=plan();console.log(json(value));return value;}
 const before=await pins();
 const activationText=await readFile(file('apps/web/lib/nms-l02-p062-admission-activation.ts'),'utf8');
 const activationMatch=activationText.match(/export const NMS_L02_P062_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
 assert(activationMatch,'activation declaration');const activation=JSON.parse(activationMatch[1]);
 assert.equal(activation.schemaVersion,1);assert.equal(activation.stage,'registered');
 for(const bound of [activation.host,activation.page,activation.predecessor])
  assert.deepEqual(await pin(bound.path),bound,'physical admission input');
 assert.equal(activation.host.path,'catalog/nms-l02-admission-v1/host-v13.json');
 assert.equal(activation.page.path,'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json');
 const routeText=await readFile(file('apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p062/page.tsx'),'utf8');
 assert(routeText.includes('const formal=NMS_L02_P062_ADMISSION?nmsL02P062AdmissionDescriptor():null;')&&
  routeText.includes('const descriptor=formal?.descriptor??nmsL02P062CandidateDescriptorV1(predecessor!.descriptor);'),
  'Pinned route must invoke formal reader when activation exists; its failure returns 404');
 const sealed=JSON.parse(await readFile(file('output/nms-l02-p062-product-20260928/admission/host-v13-seal-receipt.json')));
 const prepared=JSON.parse(await readFile(file('output/nms-l02-p062-product-20260928/admission/page-prepare-receipt.json')));
 assert.equal(sealed.status,'NMS_L02_HOST_V13_SEALED');
 assert.deepEqual(sealed.host,activation.host);
 assert.equal(sealed.registrationEffect,'none');assert.equal(sealed.acceptanceEffect,'none');
 assert.equal(prepared.status,'P062_PREPARED_NOT_REGISTERED');
 assert.deepEqual(prepared.proof,activation.page);
 assert.equal(prepared.registrationEffect,'none');assert.equal(prepared.acceptanceEffect,'none');
 assert.equal(prepared.outputs.filter(row=>row.path===activation.page.path).length,1);
 for(const bound of prepared.outputs)assert.deepEqual(await pin(bound.path),bound,'prepared proof output');
 const proof=JSON.parse(await readFile(file(activation.page.path)));
 assert.equal(proof.schemaVersion,1);assert.equal(proof.kind,'nms-l02-page-proof-v1');
 assert.equal(proof.animationId,ID);assert.equal(proof.packet.sourceKeyAttributeCalls,0);
 assert.equal(proof.packet.selectedPages.length,1);
 assert.equal(proof.packet.selectedPages[0].globalPageOrdinal,62);
 assert.equal(proof.packet.selectedPages[0].runtime.frameCount,837);
 const receipt=JSON.parse(await readFile(file('output/nms-l02-p062-product-20260928/registration/receipt.json')));
 assert.equal(receipt.schemaVersion,1);assert.equal(receipt.kind,'nms-l02-p062-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,ID);
 assert.deepEqual(receipt.counts,{oldTotal:634,newTotal:635,oldShared:492,newShared:493,
  oldLesson:60,newLesson:61});
 assert.deepEqual(receipt.proof,activation.page);assert.deepEqual(receipt.host,activation.host);
 assert.deepEqual(receipt.witness,activation.predecessor);
 assert.equal(receipt.producer.path,'scripts/register-nms-l02-p062-current-js-v1.mjs');
 for(const bound of [receipt.producer,receipt.intent,...receipt.outputs,...receipt.snapshots])
  assert.deepEqual(await pin(bound.path),bound,'registered transaction pin');
 assert.equal(receipt.outputs.length,4);assert.equal(receipt.before.length,4);
 assert.deepEqual(receipt.outputs.map(row=>row.path),[
  'packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/nms-l02-p062-admission-activation.ts']);
 for(let index=0;index<4;index++)
  assert.deepEqual({bytes:receipt.snapshots[index].bytes,sha256:receipt.snapshots[index].sha256},
   {bytes:receipt.before[index].bytes,sha256:receipt.before[index].sha256},'preserved predecessor bytes');
 const intent=JSON.parse(await readFile(file(receipt.intent.path)));
 assert.equal(intent.kind,'nms-l02-p062-registration-intent-v1');
 assert.deepEqual(intent.before,receipt.before);assert.deepEqual(intent.after,receipt.outputs);
 assert.deepEqual(intent.counts,receipt.counts);
 assert.equal(receipt.descriptor.registered,true);assert.equal(receipt.descriptor.pages,64);
 assert.equal(receipt.descriptor.registeredAnimationCount,61);
 assert.equal(receipt.descriptor.glossaryCount,25);assert.equal(receipt.descriptor.placementId,ID);
 for(const gate of ['originalRuntime','audioAcceptance','humanReview','ownerAcceptance','strictComplete','publication'])
  assert.equal(receipt[gate],false,`acceptance gate ${gate}`);
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact source root');
 assert.equal((await lstat(SOURCE_ROOT)).isSymbolicLink(),false,'real source root');
 for(const source of [SOURCE.path,XML.path])assert.equal(await realpath(source),source,'real physical source path');
 const registry=JSON.parse(await readFile(file('packages/demos/private-current-js-registry.json'),'utf8'));
 const keys=registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert.equal(keys.length,635);assert.equal(keys.filter(key=>key.startsWith('shared-')).length,493);
 assert(keys.includes(PREVIOUS)&&keys.includes(ID),'registered predecessor and P062');
 for(const expected of [SOURCE,XML]){
  const actual=before.find(item=>item.path===expected.path);
  assert.deepEqual(actual,expected,`Exact physical source required: ${expected.path}`);
 }
 for(const [domain,expected] of Object.entries(AUDIO)){
  const actual=before.find(item=>item.path===`${AUDIO_ROOT}/${domain}.mp3`);
  assert.deepEqual({bytes:actual?.bytes,sha256:actual?.sha256},{bytes:expected.bytes,sha256:expected.sha256});
 }
 const output=path.join(ROOT,'output/nms-l02-p062-product-20260928/browser',args.slug);
 await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
 const result={...plan(),status:'running',startedAt:new Date().toISOString(),inputsBefore:before,cases:[],
  cleanupErrors:[],formal:true,activation,hostSeal:sealed,preparedProof:prepared.proof,
  registrationReceipt:before.find(item=>item.path==='output/nms-l02-p062-product-20260928/registration/receipt.json'),
  originalRuntimeParityEstablished:false,audioListeningAccepted:false,
  humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES){
   const record=await runCase(browser,config,output,result);
   if(record.status!=='registered-host-probe-passed-not-acceptance')break;
  }
  result.status=result.cases.length===CASES.length&&result.cases.every(row=>
   row.status==='registered-host-probe-passed-not-acceptance')?
   'registered-host-probe-passed-not-acceptance':'failed';
 }catch(error){result.status='failed';result.failure={message:error.message,stack:error.stack};
  await writeFile(path.join(output,'failure-initial.json'),json(result),{flag:'wx'});
 }finally{
  if(browser)await bounded(browser.close(),'browser disconnect',15000).catch(error=>result.cleanupErrors.push(error.message));
  if(server){
   try{await bounded(server.close(),'owned browser close',15000);result.browserProcessCleanup='closed';}
   catch(error){result.browserCloseNote=error.message;
    try{await bounded(server.kill(),'owned browser kill',15000);result.browserProcessCleanup='terminated-after-close-timeout';}
    catch(killError){result.cleanupErrors.push(killError.message);}}
   result.browserProcessExited=server.process().exitCode!==null||server.process().signalCode!==null;
   if(!result.browserProcessExited)result.cleanupErrors.push('Owned browser process exit unverified');
  }
  result.inputsAfter=await pins();result.inputsUnchanged=JSON.stringify(before)===JSON.stringify(result.inputsAfter);
  if(!result.inputsUnchanged||result.cleanupErrors.length)result.status='failed';
  result.closedAt=new Date().toISOString();
  await writeFile(path.join(output,'evidence.json'),json(result),{flag:'wx'});
  console.log(JSON.stringify({output,status:result.status,cases:result.cases.length,
   failure:result.failure?.message??result.cases.find(row=>row.failure)?.failure.message??null}));
 }
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 run(process.argv.slice(2)).then(result=>{process.exitCode=result.status==='registered-host-probe-passed-not-acceptance'||
  result.kind==='nms-l02-p062-registered-host-probe-plan-v1'&&result.cases===CASES?0:1;})
  .catch(error=>{console.error(error);process.exitCode=1;});
