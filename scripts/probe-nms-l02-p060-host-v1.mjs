#!/usr/bin/env node
/** Real-time local P060 product probe. --plan is read-only; --run owns one unique evidence directory. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331',ID='shared-nms002-l02-p060',PREVIOUS='shared-nms002-l02-p059';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/TS/L2TS07.swf`,bytes:577367,
 sha256:'80410162eebca2f85b9aaccec9c91c8d74250c0cba6051595579b4df206215c1'};
const XML={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIO_ROOT='output/nms-l02-p060-source-20260927/extraction/audio';
const AUDIO=Object.freeze({
 'sprite-104':{bytes:28470,sha256:'cc86fd730e1738e0f1a19976fe0cbdd06b3f92eef3a291bdd3a13b84b83b57c0',samples:126144,channels:1},
 'sprite-205':{bytes:11570,sha256:'770ce8a109fb78c238d218e479047529e8cb39f006f8c70747be376556e2a541',samples:51264,channels:1},
 'sprite-217':{bytes:11050,sha256:'3506fcffbe07e726fd4cf1c750cd2641d2aa06f4ca14379b4407ea5843e4f0f0',samples:48960,channels:1},
 'sprite-245':{bytes:11050,sha256:'f87ec03bf9163390a117b6ad1ea7c47dab7ea7e729219acff0e0617f6100a9f1',samples:48960,channels:1},
 'sprite-258':{bytes:11960,sha256:'2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77',samples:52992,channels:1},
 'sprite-275':{bytes:11050,sha256:'3dda8c412ae366891bd7ce7f1603c70f4ec8438806191c75a25328963fdb8ee7',samples:48960,channels:1},
 'sprite-296':{bytes:12740,sha256:'c9502f3d979684587046242dc9022b8aa89e89c72688dfa4bc027858badd9e6e',samples:56448,channels:1},
 'sprite-322':{bytes:11960,sha256:'70f9eeb16521b9fe8c12f243af3c99482c185a39dab38b226eb3801ed204290b',samples:52992,channels:1},
 'sprite-354':{bytes:11856,sha256:'113258636df75e97cc83ceb37ed3f476453cf091834633480aaa6ebe63fd5875',samples:43776,channels:2},
 'sprite-368':{bytes:12350,sha256:'7e9810de5390cdc982dac2795e046343157a6ad9fe4a2ab13e1020b401b2ad11',samples:54720,channels:1},
 'sprite-391':{bytes:290940,sha256:'78a98c5d3158f1fd41c9fd874380fe2a4a239d786e231597886a94cd1d6b67d0',samples:1289088,channels:1},
});
const FEEDBACK_ALLOWED=Object.freeze(['sprite-205','sprite-217','sprite-245','sprite-354','sprite-296','sprite-275','sprite-322']);
const HOST='[data-lesson-player][data-current-animation-id]';
const RUNTIME=`${HOST}[data-current-animation-id="${ID}"] [data-p060-runtime="${ID}"]`;
const SOURCE_CONTROLS=`${RUNTIME} button[data-source-instance-id]`;
const CASES=Object.freeze([
 {name:'en-desktop',locale:'en',width:1440,height:900,reduced:false,answers:'wrong-then-right'},
 {name:'es-desktop',locale:'es',width:1440,height:900,reduced:false,answers:'two-wrong'},
 {name:'en-mobile',locale:'en',width:390,height:844,reduced:false,answers:'wrong-then-right'},
 {name:'es-mobile',locale:'es',width:390,height:844,reduced:false,answers:'two-wrong'},
 {name:'en-desktop-reduced',locale:'en',width:1440,height:900,reduced:true,answers:'wrong-then-right'},
 {name:'es-mobile-reduced',locale:'es',width:390,height:844,reduced:true,answers:'two-wrong'},
]);
const INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p060-host-v1.mjs',
 'scripts/probe-nms-l02-p060-host-v1.test.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p060/page.tsx',
 'apps/web/components/g678-nms-l02-p060-candidate-lesson-v1.generated.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/nms-l02-p060-lesson-runtime-v1.tsx',
 'apps/web/components/nms-l02-p060-host-v1.css',
 'apps/web/lib/nms-l02-p060-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p060-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p060/[asset]/route.ts',
 'packages/demos/src/nms-l02-p060-product-module-v1.tsx',
 'packages/demos/src/modules/shared-nms002-l02-p060.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p060.ts',
 'packages/demos/src/nms-l02-p060-product-renderer-v1.tsx',
 'packages/demos/src/nms-l02-p060-state-v1.ts',
 'packages/demos/src/nms-l02-p060-session-v1.ts',
 'packages/demos/src/nms-l02-p060-audio-v1.ts',
 'packages/demos/src/generated/nms-l02-p060-display-list-v1.ts',
 'packages/demos/src/generated/nms-l02-p060-terms-v1.ts',
 'packages/demos/src/source-glossary-controls.tsx',
 'packages/demos/src/source-glossary-session.ts',
 'packages/demos/src/alg-l12-glossary-pair-audio-loader.ts',
 'output/nms-l02-p060-source-20260927/source-audit.json',
 'output/nms-l02-p060-source-20260927/audio-raw-index.json',
 'output/nms-l02-p060-glossary-20260927/receipt.json',
 ...Object.keys(AUDIO).map(domain=>`${AUDIO_ROOT}/${domain}.mp3`),SOURCE.path,XML.path,
]);
const OCCURRENCES=Object.freeze([
 {id:'sprite-391/depth-7/generation-1',entry:'decimal-fraction',key:'Decimal fraction',at:'initial'},
 {id:'sprite-391/depth-9/generation-1',entry:'equivalent',key:'Equivalent',at:'initial'},
 {id:'sprite-391/depth-11/generation-1',entry:'fraction',key:'Fraction',at:'initial'},
 {id:'sprite-139/depth-13/generation-1',entry:'decimal',key:'Decimal',at:'picture'},
 {id:'sprite-139/depth-15/generation-1',entry:'grid',key:'Grid',at:'picture'},
 {id:'sprite-139/depth-17/generation-1',entry:'part',key:'Part',at:'picture'},
 {id:'sprite-139/depth-33/generation-1',entry:'part',key:'Part',at:'picture'},
 {id:'sprite-391/depth-205/generation-1',entry:'decimal',key:'Decimal',at:'later-main'},
 {id:'sprite-391/depth-207/generation-1',entry:'grid',key:'Grid',at:'later-main'},
 {id:'sprite-391/depth-209/generation-1',entry:'part',key:'Part',at:'later-main'},
 {id:'sprite-391/depth-225/generation-1',entry:'part',key:'Part',at:'later-main'},
 {id:'sprite-388/depth-12/generation-1',entry:'fraction',key:'Fraction',at:'hint'},
 {id:'sprite-388/depth-14/generation-1',entry:'value',key:'Value',at:'hint'},
 {id:'sprite-388/depth-16/generation-1',entry:'decimal',key:'Decimal',at:'hint'},
 {id:'sprite-388/depth-18/generation-1',entry:'equivalent',key:'Equivalent',at:'hint'},
 {id:'sprite-388/depth-20/generation-1',entry:'represent',key:'Represent',at:'hint'},
]);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const file=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);
const pin=async relative=>{const bytes=await readFile(file(relative));return{path:relative,bytes:bytes.length,sha256:hash(bytes)};};
async function pins(){return Promise.all(INPUTS.map(pin));}
const group=name=>OCCURRENCES.filter(item=>item.at===name);
function checkControls(state,groups){
 const expected=groups.flatMap(group),observed=state.controls;
 assert.equal(observed.length,expected.length,`Source button count at frame ${state.frame}`);
 assert.deepEqual(new Set(observed.map(item=>item.id)),new Set(expected.map(item=>item.id)));
 for(const item of observed){
  const source=expected.find(row=>row.id===item.id);
  assert.equal(item.key,source.key);assert.equal(item.disabled,false);
  assert.ok(item.width>=44&&item.height>=44,`44px target ${item.id}`);
 }
}
export function parseArgs(argv){
 if(argv.length===1&&argv[0]==='--plan')return{mode:'plan'};
 assert.ok(argv.length===2&&argv[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[1]??''),
  'Usage: --plan | --run <unique-slug>; browser origin is fixed at http://127.0.0.1:3331');
 return{mode:'run',slug:argv[1]};
}
export function plan(){return{
 kind:'nms-l02-p060-natural-host-probe-plan-v1',animationId:ID,base:BASE,
 route:'/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p060',
 stage:'unregistered-local-candidate',registeredPredecessorCount:58,renderableCount:59,activePageCount:64,
 source:SOURCE,sourceXml:XML,main:{frameDomain:'sprite-391',sourceFrames:721,authoredStops:[262,400,527,646,699,718]},
 cases:CASES,sourceOccurrences:OCCURRENCES,audioDomains:AUDIO,applicableFeedback:FEEDBACK_ALLOWED,
 branchPolicy:'UI seed zero: first wrong 205, second wrong 217, wrong then right 322. Other permitted domains are covered by pure state/audio tests, not claimed as browser-observed.',
 checks:['no autoplay/fetch at entry; no seek; real audio clock, six isolated EN/ES desktop/mobile/reduced-motion cases',
  'main authored stops and native source teaching stages, explicit picture/calculator reveal, play, release and close without main resume',
  'all 16 source occurrences including five hint controls open verified glossary, pause audio and restore trigger focus',
  'first wrong then right and separate two-wrong automatic branch, replay twice, late previous-page navigation, maximum one active audio node',
  'all 11 local MP3 source pins; actual same-origin response and WebAudio decode match reached main and feedback domains',
  'candidate 59 renderable but only 58 registered; all original-runtime, listening, human and publication gates remain open'],
 inputPaths:INPUTS,
 };}
async function bounded(operation,label,ms=10000){
 let timer;try{return await Promise.race([operation,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error(`P060 probe timeout: ${label}`)),ms);
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
  const h=document.querySelector(host),r=document.querySelector(runtime),p=window.__P060_PROBE;
  const controls=[...(r?.querySelectorAll('button[data-source-instance-id]')??[])].map(x=>({
   id:x.getAttribute('data-source-instance-id'),key:x.getAttribute('data-source-key-attribute'),
   label:x.textContent?.trim(),disabled:x.disabled,width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}));
  return{label,at:performance.now(),animationId:h?.getAttribute('data-current-animation-id'),
   currentPage:h?.getAttribute('data-current-page'),availability:h?.getAttribute('data-renderer-availability'),
   unavailablePages:h?.getAttribute('data-unavailable-pages'),frame:Number(r?.getAttribute('data-p060-frame')),
   phase:r?.getAttribute('data-p060-phase'),audioPhase:r?.getAttribute('data-p060-audio-phase'),
   audioDomain:r?.getAttribute('data-p060-audio-domain'),audioSample:Number(r?.getAttribute('data-p060-audio-sample')),
   paused:r?.getAttribute('data-runtime-paused'),ready:r?.getAttribute('data-p060-ready'),
   boxFrame:r?.getAttribute('data-p060-box-frame'),feedbackFrame:r?.getAttribute('data-p060-feedback-frame'),
   feedbackSprite:r?.querySelector('[data-p060-feedback-sprite]')?.getAttribute('data-p060-feedback-sprite')??null,
   tries:Number(r?.getAttribute('data-p060-tries')),replay:Number(r?.getAttribute('data-p060-replay')),
   canvas:r?.getAttribute('data-canvas-status'),sourceSha:r?.querySelector('[data-source-swf-sha256]')?.getAttribute('data-source-swf-sha256'),
   languagePolicy:r?.querySelector('[data-language-policy]')?.getAttribute('data-language-policy'),
   controls,hintOpen:!!r?.querySelector('dialog.nms-p060-hint[open]'),
   answerControls:r?.querySelectorAll('button[data-p060-answer]').length??0,
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
  return r?.getAttribute('data-p060-frame')===String(frame)&&r.getAttribute('data-runtime-paused')==='true'&&
   r.getAttribute('data-p060-ready')==='true';},{selector:RUNTIME,frame},timeout);
}
async function openOccurrence(page,item,record,dir){
 const trigger=page.locator(`${SOURCE_CONTROLS}[data-source-instance-id="${item.id}"]`);
 assert.equal(await trigger.count(),1,`One exact source trigger ${item.id}`);
 assert.equal(await trigger.getAttribute('data-source-key-attribute'),item.key);
 assert.equal(await trigger.isDisabled(),false);
 const before=await snapshot(page,`before-${item.id}`);await trigger.scrollIntoViewIfNeeded();await trigger.click();
 const dialog=page.locator(`[role="dialog"][data-glossary-entry-id="${item.entry}"]`);
 await dialog.waitFor();
 assert.equal(await dialog.getAttribute('data-source-key-attribute'),item.key);
 const sourceSha=await dialog.getAttribute('data-source-sha256');assert.match(sourceSha,/^[a-f0-9]{64}$/u);
 assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
 const held=await page.locator(RUNTIME).getAttribute('data-p060-frame');
 await page.waitForTimeout(180);
 assert.equal(await page.locator(RUNTIME).getAttribute('data-p060-frame'),held);
 assert.equal((await page.evaluate(()=>window.__P060_PROBE.audio.active)),0);
 const row={id:item.id,entry:item.entry,key:item.key,sourceSha256:sourceSha,frame:before.frame,
  boxFrame:before.boxFrame,hintOpen:before.hintOpen,dialogText:await dialog.innerText()};
 record.dialogs.push(row);
 await screenshot(page,dir,`glossary-${record.dialogs.length}-${item.entry}`,record);
 await dialog.getByRole('button',{name:record.locale==='es'?'Cerrar y continuar':'Close and continue',exact:true}).click();
 await dialog.waitFor({state:'detached'});
 await waitState(page,selector=>document.activeElement===document.querySelector(selector),
  `${SOURCE_CONTROLS}[data-source-instance-id="${item.id}"]`,8000);
 assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
}
async function openGroup(page,name,record,dir){
 for(const item of group(name))await openOccurrence(page,item,record,dir);
}
async function waitBox(page,frame,timeout=20000){
 await waitState(page,({selector,frame})=>document.querySelector(selector)?.getAttribute('data-p060-box-frame')===String(frame),
  {selector:RUNTIME,frame},timeout);
}
async function runBox(page,kind,record,dir){
 const frame=kind==='picture'?527:646,release=kind==='picture'?15:103;
 await page.locator(`${RUNTIME} button[data-p060-reveal="true"]`).click();
 await waitBox(page,1);
 let state=await snapshot(page,`${kind}-revealed`);record.observations.push(state);
 assert.equal(state.frame,frame);assert.equal(state.paused,'true');
 assert.equal(state.audio.active,0);
 checkControls(state,kind==='picture'?['picture','initial']:['initial','later-main']);
 await screenshot(page,dir,`${kind}-revealed`,record);
 if(kind==='picture'){
  await openGroup(page,'picture',record,dir);
  await ensurePlay(page);
 }
 await page.locator(`${RUNTIME} button[data-p060-box-play="true"]`).click();
 await waitBox(page,release,kind==='picture'?7000:16000);
 state=await snapshot(page,`${kind}-release`);record.observations.push(state);
 assert.equal(state.frame,frame);assert.equal(state.audio.active,0);
 await screenshot(page,dir,`${kind}-release`,record);
 await page.locator(`${RUNTIME} button[data-p060-box-close="true"]`).click();
 await waitBox(page,1,5000);
 state=await snapshot(page,`${kind}-closed`);record.observations.push(state);
 assert.equal(state.frame,frame);assert.equal(state.audio.active,0);
 await screenshot(page,dir,`${kind}-closed`,record);
}
async function answer(page,ordinal,record,dir){
 await page.locator(`${RUNTIME} button[data-p060-answer="${ordinal}"]`).click();
 await waitState(page,({selector,previous})=>{
  const r=document.querySelector(selector),p=window.__P060_PROBE;
  return r&&p.feedback.length>previous;},{selector:RUNTIME,previous:record.feedbackObserved},7000);
 const started=await snapshot(page,`answer-${ordinal}-feedback`);record.observations.push(started);
 record.feedbackObserved=started.feedbackTrace.length;
 await screenshot(page,dir,`answer-${ordinal}-feedback-${record.feedbackObserved}`,record);
 assert.equal(started.frame,699);
 await waitState(page,selector=>{
  const r=document.querySelector(selector);
  return r&&r.getAttribute('data-p060-feedback-frame')===''&&
   (r.getAttribute('data-p060-tries')==='1'||Number(r.getAttribute('data-p060-frame'))>699);
 },RUNTIME,12000);
 const after=await snapshot(page,`answer-${ordinal}-settled`);record.observations.push(after);
 assert.equal(after.audio.maxActive,1);
}
function expectedAudioDomain(url){
 const parsed=new URL(url);if(parsed.origin!==BASE)return null;
 const match=/^\/migration-assets\/nms-l02-p060\/(sprite-\d+)\.mp3$/u.exec(parsed.pathname);
 return match?.[1]??null;
}
function validateAudio(record){
 const reached=new Set(record.assetResponses.map(row=>row.domain));
 assert.ok(reached.has('sprite-391'));
 for(const item of record.assetResponses){
  const expected=AUDIO[item.domain];assert.ok(expected,`Unexpected P060 audio domain ${item.domain}`);
  assert.deepEqual({status:item.status,bytes:item.bytes,sha256:item.sha256,contentType:item.contentType,redirected:item.redirected},
   {status:200,bytes:expected.bytes,sha256:expected.sha256,contentType:'audio/mpeg',redirected:false});
  assert.equal(item.url,`${BASE}/migration-assets/nms-l02-p060/${item.domain}.mp3?sha256=${expected.sha256}`);
 }
 for(const item of record.decodes){
  const expected=Object.entries(AUDIO).find(([,value])=>value.sha256===item.sha256);
  assert.ok(expected,`Unexpected decoded P060 bytes ${item.sha256}`);
  assert.deepEqual({samples:item.samples,channels:item.channels,sampleRate:item.sampleRate},
   {samples:expected[1].samples,channels:expected[1].channels,sampleRate:22050});
  assert.ok(reached.has(expected[0]),'Decoded domain needs a verified response');
 }
 assert.ok(record.decodes.some(item=>item.sha256===AUDIO['sprite-391'].sha256));
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
   Object.defineProperty(window,'__P060_PROBE',{value:{audio,frames,feedback,decodes,responses,pendingResponses,responseErrors}});
   // Hash the actual application fetch response in its owning document. CDP's
   // response.body may evict a resource even when the product decoded it.
   const nativeFetch=window.fetch;
   window.fetch=async function(...args){
    const response=await nativeFetch.apply(this,args),url=new URL(response.url,location.origin);
    const match=/^\/migration-assets\/nms-l02-p060\/(sprite-\d+)\.mp3$/u.exec(url.pathname);
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
    const runtime=document.querySelector('[data-p060-runtime="shared-nms002-l02-p060"]');
    const frame=runtime?.getAttribute('data-p060-frame'),phase=runtime?.getAttribute('data-p060-phase');
    const box=runtime?.getAttribute('data-p060-box-frame'),feedbackFrame=runtime?.getAttribute('data-p060-feedback-frame');
    const id=runtime?.querySelector('[data-p060-feedback-sprite]')?.getAttribute('data-p060-feedback-sprite');
    const key=`${frame}:${phase}:${box}:${feedbackFrame}:${id}`;
    if(frame&&key!==prior){prior=key;frames.push({frame:Number(frame),phase,box,feedbackFrame,at:performance.now()});
     if(id&&feedback.at(-1)?.spriteId!==id)feedback.push({spriteId:id,at:performance.now()});}
   };
   new MutationObserver(capture).observe(document,{subtree:true,childList:true,attributes:true,
    attributeFilter:['data-p060-frame','data-p060-phase','data-p060-box-frame','data-p060-feedback-frame','data-p060-feedback-sprite']});
   document.addEventListener('DOMContentLoaded',capture,{once:true});
  });
  page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',error=>record.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
   if(message.type()==='warning')record.warnings.push(message.text());});
  record.step='entry';const response=await page.goto(record.route,{waitUntil:'domcontentloaded',timeout:120000});
  record.response={status:response?.status()??null,url:response?.url()??null};assert.equal(record.response.status,200);
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
  assert.equal(await page.locator('main[data-p060-current-js]').getAttribute('data-p060-current-js'),'unregistered-probe');
  await page.locator(`${RUNTIME}[data-p060-ready="true"]`).waitFor({timeout:30000});
  let state=await snapshot(page,'entry');record.observations.push(state);
  assert.equal(state.animationId,ID);assert.equal(state.currentPage,'60');assert.equal(state.availability,'registered');
  assert.equal(state.unavailablePages,'5');assert.equal(state.frame,1);assert.equal(state.paused,'true');
  assert.equal(state.sourceSha,SOURCE.sha256);assert.equal(state.audio.started,0);assert.equal(state.audio.active,0);
  assert.equal(state.languagePolicy,config.locale==='es'?'english-source-fallback':'english-source');
  checkControls(state,['initial']);
  assert.equal(state.overflow,false);
  const timeline=page.locator('input[data-responsive-focus-key="timeline"]:visible');
  if(await timeline.count())assert.equal(await timeline.first().isDisabled(),true,'P060 natural probe must not seek');
  await screenshot(page,dir,'entry',record);
  record.step='initial-glossary';await openGroup(page,'initial',record,dir);
  assert.equal(await page.evaluate(()=>window.__P060_PROBE.pendingResponses.length),0,'Entry and glossary must not fetch source audio');
  record.step='main-262';await ensurePlay(page);await waitMainStop(page,262);
  state=await snapshot(page,'stop-262');record.observations.push(state);assert.equal(state.audio.maxActive,1);
  await screenshot(page,dir,'stop-262',record);
  record.step='main-400';await page.locator(`${RUNTIME} button[data-p060-continue="true"]`).click();
  await waitMainStop(page,400);record.observations.push(await snapshot(page,'stop-400'));
  await screenshot(page,dir,'stop-400',record);
  record.step='main-527';await page.locator(`${RUNTIME} button[data-p060-continue="true"]`).click();
  await waitMainStop(page,527);record.observations.push(await snapshot(page,'stop-527'));
  await screenshot(page,dir,'stop-527',record);
  record.step='picture';await runBox(page,'picture',record,dir);
  record.step='main-646';await page.locator(`${RUNTIME} button[data-p060-continue="true"]`).click();
  await waitMainStop(page,646);record.observations.push(await snapshot(page,'stop-646'));
  checkControls(record.observations.at(-1),['initial','later-main']);
  await screenshot(page,dir,'stop-646',record);
  record.step='later-main-glossary';await openGroup(page,'later-main',record,dir);
  await ensurePlay(page);
  record.step='calculator';await runBox(page,'calculator',record,dir);
  record.step='main-699';await page.locator(`${RUNTIME} button[data-p060-continue="true"]`).click();
  await waitMainStop(page,699);state=await snapshot(page,'stop-699');record.observations.push(state);
  assert.equal(state.answerControls,4);await screenshot(page,dir,'stop-699',record);
  record.step='hint';await page.locator(`${RUNTIME} button[data-p060-hint="true"]`).click();
  await page.locator(`${RUNTIME} dialog.nms-p060-hint[open]`).waitFor();
  checkControls(await snapshot(page,'hint-open'),['initial','later-main','hint']);
  await screenshot(page,dir,'hint',record);await openGroup(page,'hint',record,dir);
  await page.locator(`${RUNTIME} button[data-p060-hint-close="true"]`).click();
  await page.locator(`${RUNTIME} dialog.nms-p060-hint[open]`).waitFor({state:'detached'});
  await ensurePlay(page);
  record.step='answers';
  await answer(page,2,record,dir);
  state=await snapshot(page,'first-wrong-settled');assert.equal(state.tries,1);assert.equal(state.frame,699);
  await answer(page,config.answers==='two-wrong'?3:1,record,dir);
  const expectedFeedback=config.answers==='two-wrong'?['205','217']:['205','322'];
  await waitMainStop(page,718,15000);state=await snapshot(page,'terminal');record.observations.push(state);
  assert.equal(state.frame,718);assert.equal(state.paused,'true');assert.equal(state.audio.active,0);
  assert.deepEqual(state.feedbackTrace.map(row=>row.spriteId),expectedFeedback);
  record.feedbackDomains=expectedFeedback.map(sprite=>`sprite-${sprite}`);
  assert.equal(state.tries,config.answers==='two-wrong'?0:1);
  assert.equal(state.overflow,false);await screenshot(page,dir,'terminal',record);
  record.step='replay';let started=state.audio.started;
  await clickHost(page,'replay');
  await waitState(page,previous=>window.__P060_PROBE.audio.started>previous,started,10000);
  started=await page.evaluate(()=>window.__P060_PROBE.audio.started);
  await clickHost(page,'replay');
  await waitState(page,previous=>window.__P060_PROBE.audio.started>previous,started,10000);
  state=await snapshot(page,'double-replay');record.observations.push(state);
  assert.equal(state.audio.maxActive,1);assert.ok(state.frame<262);assert.equal(state.replay,2);
  await screenshot(page,dir,'double-replay',record);
  record.step='late-navigation';await clickHost(page,'map');
  await page.locator(`button[data-placement-id="${PREVIOUS}"]`).click();
  await page.locator(`${HOST}[data-current-animation-id="${PREVIOUS}"]`).waitFor();
  await page.waitForFunction(selector=>document.querySelector(selector)===null,RUNTIME);
  await waitState(page,()=>window.__P060_PROBE.audio.active===0,null,7000);
  assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
  assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
  await screenshot(page,dir,'registered-p059-after-navigation',record);
  record.navigation={target:PREVIOUS,availability:'registered',audioActive:0};
  record.step='receipts';
  const fetchEvidence=await page.evaluate(async()=>{const p=window.__P060_PROBE;
   await Promise.all(p.pendingResponses);return {responses:p.responses,errors:p.responseErrors};});
  record.assetResponses=fetchEvidence.responses;record.errors.push(...fetchEvidence.errors);
  record.decodes=await page.evaluate(()=>window.__P060_PROBE.decodes.slice());
  record.audioTrace=await page.evaluate(()=>({...window.__P060_PROBE.audio}));
  validateAudio(record);
  assert.equal(record.dialogs.length,OCCURRENCES.length);
  assert.deepEqual(record.dialogs.map(item=>item.id),OCCURRENCES.map(item=>item.id));
  assert.deepEqual(record.errors,[]);assert.ok(record.requests.every(item=>item.allowed));
  record.status='local-candidate-host-probe-passed-not-acceptance';
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
 for(const expected of [SOURCE,XML]){
  const actual=before.find(item=>item.path===expected.path);
  assert.deepEqual(actual,expected,`Exact physical source required: ${expected.path}`);
 }
 for(const [domain,expected] of Object.entries(AUDIO)){
  const actual=before.find(item=>item.path===`${AUDIO_ROOT}/${domain}.mp3`);
  assert.deepEqual({bytes:actual?.bytes,sha256:actual?.sha256},{bytes:expected.bytes,sha256:expected.sha256});
 }
 const output=path.join(ROOT,'output/nms-l02-p060-product-20260927/browser',args.slug);
 await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
 const result={...plan(),status:'running',startedAt:new Date().toISOString(),inputsBefore:before,cases:[],
  cleanupErrors:[],formal:false,originalRuntimeParityEstablished:false,audioListeningAccepted:false,
  humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES){
   const record=await runCase(browser,config,output,result);
   if(record.status!=='local-candidate-host-probe-passed-not-acceptance')break;
  }
  result.status=result.cases.length===CASES.length&&result.cases.every(row=>
   row.status==='local-candidate-host-probe-passed-not-acceptance')?
   'local-candidate-host-probe-passed-not-acceptance':'failed';
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
 run(process.argv.slice(2)).then(result=>{process.exitCode=result.status==='local-candidate-host-probe-passed-not-acceptance'||
  result.kind==='nms-l02-p060-natural-host-probe-plan-v1'&&result.cases===CASES?0:1;})
  .catch(error=>{console.error(error);process.exitCode=1;});
