#!/usr/bin/env node
/** Local P064 formal-candidate continuity across the registered NMS L2 predecessors.
 * --plan is browser-free. --run requires the sealed host and page proof. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {P060_AUDIO,P060_SOURCE,P060_SOURCE_ROOT} from '../lib/nms-l02-p060-admission-semantics.mjs';
import {P061_AUDIO,P061_SOURCE} from '../lib/nms-l02-p061-admission-semantics.mjs';
import {P062_MAIN_AUDIO,P062_SOURCE,P062_SOURCE_ROOT} from '../lib/nms-l02-p062-admission-semantics.mjs';
import {P052_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331';
const PAGES=Object.freeze(['p064','p062','p061','p060','p058','p056','p055','p052','p064']);
const ID=Object.fromEntries(['p064','p062','p061','p060','p058','p056','p055','p052'].map(page=>
 [page,`shared-nms002-l02-${page}`]));
const HOST='[data-lesson-player][data-current-animation-id]';
const RUNTIME={
 p064:`${HOST}[data-current-animation-id="${ID.p064}"] [data-animation-id="${ID.p064}"][data-p064-phase]`,
 p062:`[data-p062-runtime="${ID.p062}"]`,
 p061:`[data-p061-runtime="${ID.p061}"]`,
 p060:`[data-p060-runtime="${ID.p060}"]`,
 p058:`[data-pair-page="${ID.p058}"]`,
 p056:`[data-pair-page="${ID.p056}"]`,
 p055:`[data-pair-page="${ID.p055}"]`,
 p052:`[data-source-percent-practice-runtime="${ID.p052}"]`,
};
const ACTIVATE='apps/web/lib/nms-l02-p064-admission-activation.ts';
const HOST14='catalog/nms-l02-admission-v1/host-v14.json';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json';
const PREDECESSOR='output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json';
const HOST_SEAL='output/nms-l02-p064-product-20260928/admission/host-v14-seal-receipt.json';
const PAGE_PREPARE='output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json';
const REGISTRY='packages/demos/private-current-js-registry.json';
const OUTPUT='output/nms-l02-p064-product-20260928/continuity/browser/formal-candidate-v1';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const P064_SWF={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`,bytes:55392,
 sha256:'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'};
const P064_XML={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const P064_CONTRACT={path:'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json',
 sha256:'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5'};
/** Modern candidate seeded draw; this does not claim original Flash PRNG parity. */
export function firstQuestionForSeed(seed,bankSize){
 assert(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffff_ffff);
 assert(Number.isSafeInteger(bankSize)&&bankSize>0);
 return ((Math.imul(seed>>>0,1664525)+1013904223)>>>0)%bankSize+1;
}
const CASES=Object.freeze([
 {locale:'en',seed:0,firstQuestion:4},
 {locale:'es',seed:0,firstQuestion:4},
]);
const P056_TERMS=Object.freeze([
 {id:'sprite-24/depth-16/generation-1',entry:'organize',key:'Organize'},
 {id:'sprite-24/depth-18/generation-1',entry:'information',key:'Information'},
]);
const P058_TERM={id:'sprite-37/depth-23/generation-1',entry:'strategies',key:'Strategies'};
const P055_TERM={id:'sprite-26/depth-11/generation-1',entry:'restate',key:'Restate'};
const P060_TERM={id:'sprite-391/depth-7/generation-1',entry:'decimal-fraction',key:'Decimal fraction'};
const EXPECTED_ASSETS=Object.freeze({
 '/migration-assets/nms-l02-p062/sprite-315.mp3':{...P062_MAIN_AUDIO,contentType:'audio/mpeg'},
 '/migration-assets/nms-l02-p061/sprite-315.mp3':{...P061_AUDIO.main,contentType:'audio/mpeg'},
 '/migration-assets/nms-l02-p060/sprite-391.mp3':{...P060_AUDIO.main,contentType:'audio/mpeg'},
 '/migration-assets/nms-l02-p058/main.mp3':{bytes:109720,
  sha256:'05f43faf63e470935728be5b54933ebb71760aeb819074b570091a6e4b068f38',contentType:'audio/mpeg'},
 '/migration-assets/nms-l02-p056/main.mp3':{bytes:95290,
  sha256:'6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811',contentType:'audio/mpeg'},
 '/migration-assets/nms-l02-p056-predecessors/p055-main.mp3':{bytes:143780,
  sha256:'ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b',contentType:'audio/mpeg'},
 '/migration-assets/nms-l02-p056-predecessors/p055-typography.js':{bytes:930320,
  sha256:'47e796237e5520140a760175865f09c3f218ac942cf3cadc8fb9f56c38bd358d',
  contentType:'text/javascript; charset=utf-8'},
 '/migration-assets/nms-l02-p056-predecessors/p052-sprite-350.mp3':{
  bytes:P052_AUDIO_PLANS['sprite-350'].inputBytes,sha256:P052_AUDIO_PLANS['sprite-350'].inputSha256,
  contentType:'audio/mpeg'},
});
const SOURCE_FILES=Object.freeze([
 {path:`${P062_SOURCE_ROOT}/${P062_SOURCE.path}`,bytes:P062_SOURCE.bytes,sha256:P062_SOURCE.sha256},
 P062_MAIN_AUDIO,
 {path:`${P060_SOURCE_ROOT}/${P061_SOURCE.path}`,bytes:P061_SOURCE.bytes,sha256:P061_SOURCE.sha256},
 P061_AUDIO.main,
 {path:`${P060_SOURCE_ROOT}/${P060_SOURCE.path}`,bytes:P060_SOURCE.bytes,sha256:P060_SOURCE.sha256},
 {path:'output/nms-l02-p060-source-20260927/extraction/audio/sprite-391.mp3',
  bytes:P060_AUDIO.main.bytes,sha256:P060_AUDIO.main.sha256},
 {path:'output/nms-l02-p058-audio-20260927/embedded-source-stream-v1.mp3',
  bytes:EXPECTED_ASSETS['/migration-assets/nms-l02-p058/main.mp3'].bytes,
  sha256:EXPECTED_ASSETS['/migration-assets/nms-l02-p058/main.mp3'].sha256},
 {path:'migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3',
  bytes:EXPECTED_ASSETS['/migration-assets/nms-l02-p056/main.mp3'].bytes,
  sha256:EXPECTED_ASSETS['/migration-assets/nms-l02-p056/main.mp3'].sha256},
 {path:'output/nms-l02-ts-family-20260927/audio/p055-main-sprite-26.mp3',
  bytes:EXPECTED_ASSETS['/migration-assets/nms-l02-p056-predecessors/p055-main.mp3'].bytes,
  sha256:EXPECTED_ASSETS['/migration-assets/nms-l02-p056-predecessors/p055-main.mp3'].sha256},
 {path:'output/nms-l02-ts-family-20260927/visual/canvas-renderer.js',
  bytes:EXPECTED_ASSETS['/migration-assets/nms-l02-p056-predecessors/p055-typography.js'].bytes,
  sha256:EXPECTED_ASSETS['/migration-assets/nms-l02-p056-predecessors/p055-typography.js'].sha256},
 {path:'migrations/shared-nms002-l02-p052/audit/sprite-350-source-stream-v1.mp3',
  bytes:P052_AUDIO_PLANS['sprite-350'].inputBytes,
  sha256:P052_AUDIO_PLANS['sprite-350'].inputSha256},
]);
const INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p064-continuity-v1.mjs',
 'scripts/probe-nms-l02-p064-continuity-v1.test.mjs',
 ACTIVATE,HOST14,PROOF,PREDECESSOR,HOST_SEAL,PAGE_PREPARE,REGISTRY,
 'apps/web/lib/nms-l02-p064-admission.server.ts',
 'apps/web/lib/nms-l02-p064-descriptor-extension.ts',
 'lib/nms-l02-p064-admission-semantics-v1.mjs',
 'lib/nms-l02-successor-proof.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
 'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p064-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p064-product-host.production-stub.tsx',
 'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
 'packages/demos/src/nms-l02-p064-quiz-state-candidate.ts',
 'packages/demos/src/nms-l02-p064-host-score-candidate.ts',
 'packages/demos/src/modules/shared-nms002-l02-p064.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p064.ts',
 'packages/demos/src/nms-l02-p064-product-module-v1.tsx',
 'packages/demos/src/nms-l02-p064-quiz-candidate.css',
 P064_CONTRACT.path,P064_SWF.path,P064_XML.path,
 'apps/web/lib/nms-l02-p062-admission-activation.ts',
 'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json',
 'apps/web/lib/nms-l02-p062-admission.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p062/page.tsx',
 'apps/web/components/g678-nms-l02-p062-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p062-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p062-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p062/[asset]/route.ts',
 'apps/web/lib/nms-l02-p061-admission.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p061/page.tsx',
 'apps/web/components/g678-nms-l02-p061-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p061-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p061-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p061/[asset]/route.ts',
 'apps/web/lib/nms-l02-p060-admission.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p060/page.tsx',
 'apps/web/components/g678-nms-l02-p060-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p060-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p060-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p060/[asset]/route.ts',
 'apps/web/lib/nms-l02-p058-admission-activation.ts',
 'apps/web/lib/nms-l02-p058-admission.server.ts',
 'apps/web/lib/nms-l02-p056-admission-activation.ts',
 'apps/web/lib/nms-l02-p056-admission.server.ts',
 'apps/web/lib/nms-l02-source-resource-host.ts',
 'apps/web/lib/g678-preview-policy.ts',
 'apps/web/lib/nms-l02-p058-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p058/[asset]/route.ts',
 'apps/web/lib/nms-l02-p056-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
 'apps/web/lib/nms-l02-p056-predecessor-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p056-predecessors/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/descriptor-driven-whole-lesson-player.tsx',
 'apps/web/components/animation-runtime.tsx',
 'apps/web/components/legacy-responsive-lesson-shell.tsx',
 'apps/web/components/nms-l02-p051-host-typography-v1.css',
 'apps/web/components/nms-l02-ts-pilot.css',
 'apps/web/components/nms-l02-p055-host.css',
 'apps/web/components/nms-l02-p056-host-v1.css',
 'apps/web/components/nms-l02-p057-host-v1.css',
 'apps/web/components/nms-l02-p058-host-v1.css',
 'apps/web/components/nms-l02-p060-host-v1.css',
 'apps/web/components/nms-l02-p061-host-v1.css',
 'apps/web/components/nms-l02-p062-host-v1.css',
 'apps/web/components/source-glossary-lesson-runtime.tsx',
 'packages/demos/src/generated/nms-l02-p058-terms-v1.ts',
 'packages/demos/src/nms-l02-p056-product-controls-v1.ts',
 'packages/demos/src/nms-l02-ts-pilot-text.ts',
 'packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts',
 'apps/web/lib/nms-l02-p052-source-bytes.ts',
 'packages/demos/src/nms-l02-p060-audio-v1.ts',
 'packages/demos/src/nms-l02-p060-session-v1.ts',
 'packages/demos/src/nms-l02-p060-state-v1.ts',
 ...SOURCE_FILES.map(item=>item.path),...P060_AUDIO.payloads.map(item=>item.path),...P061_AUDIO.payloads.map(item=>item.path),
]);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const unique=values=>[...new Set(values)];
const disk=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);
async function pins(){return Promise.all(unique(INPUTS).map(async relative=>{
 const bytes=await readFile(disk(relative));return{path:relative,bytes:bytes.length,sha256:hash(bytes)};
}));}
async function bounded(promise,label,ms=10000){
 let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error(`P064 continuity timeout: ${label}`)),ms);
 })]);}finally{clearTimeout(timer);}
}
export function parseArgs(args){
 if(args.length===1&&args[0]==='--plan')return{mode:'plan'};
 assert(args.length===2&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]??''),
  'Usage: --plan | --run <unique-slug>');
 return{mode:'run',slug:args[1]};
}
export function plan(){return{
 schemaVersion:1,kind:'nms-l02-p064-formal-candidate-browser-continuity-v1',
 origin:ORIGIN,route:`${ORIGIN}/{en|es}/migration-status/g678-calibration/${ID.p064}`,
 cases:CASES,order:PAGES,host:HOST14,pageProof:PROOF,registry:REGISTRY,
 source:P064_SWF,sourceXml:P064_XML,sourceRoot:SOURCE_ROOT,
 checks:['candidate proof and sealed host pins; 61 registered plus one renderable candidate',
  'P064/P062/P061/P060/P058/P056/P055/P052/P064 selected-page navigation and cleanup',
  'seeded P064 first question and 0/0 host score are preserved after return without audio autoplay',
  'same-origin in-page fetch-clone SHA-256 for actual fetched audio responses',
  'P055 script has pinned local bytes plus browser resource status and headers; no CDP body claim',
  'P060/P058/P056/P055 glossary targets at least 44 by 44 CSS pixels and focus restoration',
  'one active WebAudio source maximum, no active source after final pause',
  'technical candidate continuity only; no original-runtime or listening acceptance'],
 inputPaths:unique(INPUTS),
 };}
export async function preflight(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local only');
 assert.equal((await lstat(SOURCE_ROOT)).isSymbolicLink(),false,'physical source root');
 assert.equal(await realpath(P064_SWF.path),P064_SWF.path);
 assert.equal(await realpath(P064_XML.path),P064_XML.path);
 const activation=await readFile(disk(ACTIVATE),'utf8');
 assert.match(activation,/"stage":\s*"candidate"/u,'formal candidate activation required');
 const [{NMS_L02_P064_ADMISSION:binding},before]=await Promise.all([
  import('../apps/web/lib/nms-l02-p064-admission-activation.ts'),pins()]);
 assert.equal(binding?.stage,'candidate');
 assert.equal(binding.host?.path,HOST14);assert.equal(binding.page?.path,PROOF);
 for(const expected of [binding.predecessor,binding.host,binding.page,P064_SWF,P064_XML,
  ...SOURCE_FILES,...P060_AUDIO.payloads,...P061_AUDIO.payloads]){
  const actual=before.find(item=>item.path===expected.path);
  assert.deepEqual(actual,expected,`exact source/admission pin: ${expected.path}`);
 }
 assert.equal(binding.predecessor?.path,PREDECESSOR);
 assert.equal(before.find(item=>item.path===P064_CONTRACT.path)?.sha256,P064_CONTRACT.sha256);
 const route=await readFile(disk('apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx'),'utf8');
 assert.match(route,/nmsL02P064AdmissionDescriptor/u,'formal reader is routed');
 const seal=JSON.parse(await readFile(disk(HOST_SEAL),'utf8'));
 const prepared=JSON.parse(await readFile(disk(PAGE_PREPARE),'utf8'));
 assert.equal(seal.status,'NMS_L02_HOST_V14_SEALED');
 assert.deepEqual(seal.host,binding.host);
 assert.equal(seal.pages,64);
 assert.equal(prepared.status,'P064_PREPARED_NOT_REGISTERED');
 assert.deepEqual(prepared.proof,binding.page);
 const proof=JSON.parse(await readFile(disk(PROOF),'utf8'));
 assert.equal(proof.animationId,ID.p064);
 assert.equal(proof.packet.sourceRoot,SOURCE_ROOT);
 assert.deepEqual(proof.packet.source,{path:'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf',
  bytes:P064_SWF.bytes,sha256:P064_SWF.sha256});
 const contract=JSON.parse(await readFile(disk(P064_CONTRACT.path),'utf8'));
 assert.equal(contract.animationId,ID.p064);
 assert.equal(contract.quiz.bankSize,35);
 assert.equal(contract.quiz.drawCount,10);
 for(const config of CASES)assert.equal(firstQuestionForSeed(config.seed,contract.quiz.bankSize),
  config.firstQuestion,'modern default seed0 source-bank first draw');
 const registry=JSON.parse(await readFile(disk(REGISTRY),'utf8'));
 const keys=registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert.equal(keys.length,635);assert.equal(keys.filter(key=>key.startsWith('shared-')).length,493);
 assert.equal(keys.includes(ID.p062)&&!keys.includes(ID.p064),true,'P062 registered, P064 candidate unregistered');
 return before;
}
function installTrace(){
 const trace={active:0,maxActive:0,byPage:{},events:[],responses:[],responseErrors:[],pending:[]};
 Object.defineProperty(window,'__P064_CONTINUITY',{value:trace});
 const host=()=>document.querySelector('[data-lesson-player][data-current-animation-id]')
  ?.getAttribute('data-current-animation-id')??'unknown';
 const bucket=id=>trace.byPage[id]??={active:0,started:0,stopped:0};
 const proto=AudioBufferSourceNode.prototype,start=proto.start,stop=proto.stop,owners=new WeakMap();
 const finish=node=>{const id=owners.get(node);if(!id)return;owners.delete(node);
  trace.active--;bucket(id).active--;bucket(id).stopped++;
  trace.events.push({kind:'stop',page:id,active:trace.active});};
 proto.start=function(...args){const result=start.apply(this,args);if(!owners.has(this)){
  const id=host();owners.set(this,id);trace.active++;bucket(id).active++;bucket(id).started++;
  trace.maxActive=Math.max(trace.maxActive,trace.active);
  trace.events.push({kind:'start',page:id,active:trace.active});
  this.addEventListener('ended',()=>finish(this),{once:true});}return result;};
 proto.stop=function(...args){const result=stop.apply(this,args);finish(this);return result;};
 const nativeFetch=window.fetch;
 window.fetch=async function(...args){const response=await nativeFetch.apply(this,args);
  const url=new URL(response.url,location.origin);
  if(url.origin===location.origin&&url.pathname.startsWith('/migration-assets/')&&
   url.pathname.endsWith('.mp3')){
   const clone=response.clone();
   trace.pending.push(clone.arrayBuffer().then(async bytes=>{
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    trace.responses.push({url:response.url,status:response.status,bytes:bytes.byteLength,
     contentType:response.headers.get('content-type'),redirected:response.redirected,
     sha256:[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('')});
   }).catch(error=>trace.responseErrors.push(String(error))));
  }return response;};
}
async function snapshot(page,step){return{step,...await page.evaluate(()=>{
 const host=document.querySelector('[data-lesson-player][data-current-animation-id]');
 const id=host?.getAttribute('data-current-animation-id');
 const runtime=id?document.querySelector(id.endsWith('p064')?'[data-animation-id="shared-nms002-l02-p064"][data-p064-phase]':id.endsWith('p062')?'[data-p062-runtime]':id.endsWith('p061')?'[data-p061-runtime]':id.endsWith('p060')?'[data-p060-runtime]':
  id.endsWith('p052')?'[data-source-percent-practice-runtime]':`[data-pair-page="${id}"]`):null;
 const buttons=[...(runtime?.querySelectorAll('button[data-source-instance-id]')??[])].map(button=>({
  id:button.getAttribute('data-source-instance-id'),key:button.getAttribute('data-source-key-attribute'),
  disabled:button.disabled,width:button.getBoundingClientRect().width,
  height:button.getBoundingClientRect().height}));
 const trace=window.__P064_CONTINUITY;
 const question=runtime?.querySelector('[data-p064-question]');
 const fq={attempted:Number(host?.getAttribute('data-lesson-host-fq-attempted')),
  correct:Number(host?.getAttribute('data-lesson-host-fq-correct')),
  awarded:Number(host?.getAttribute('data-lesson-host-fq-points-awarded')),
  possible:Number(host?.getAttribute('data-lesson-host-fq-points-possible'))};
 return{animationId:id,currentPage:host?.getAttribute('data-current-page'),
  availability:host?.getAttribute('data-renderer-availability'),url:location.href,
  fq,questionId:Number(question?.getAttribute('data-p064-question')),
  nativeAudio:[...(runtime?.querySelectorAll('audio')??[])].map(audio=>({paused:audio.paused,
   networkState:audio.networkState,readyState:audio.readyState})),
  ready:runtime?.getAttribute('data-p064-host-score-gate')??runtime?.getAttribute('data-p062-ready')??runtime?.getAttribute('data-p061-ready')??runtime?.getAttribute('data-p060-ready')??runtime?.getAttribute('data-pair-ready')??
   (id?.endsWith('p052')?String(!!runtime):null),
  phase:runtime?.getAttribute('data-p064-phase')??runtime?.getAttribute('data-p062-phase')??runtime?.getAttribute('data-p061-phase')??runtime?.getAttribute('data-p060-phase')??runtime?.getAttribute('data-pair-audio-phase')??
   runtime?.querySelector('.p052-player')?.getAttribute('data-p052-player-phase'),
  frame:runtime?.getAttribute('data-p062-frame')??runtime?.getAttribute('data-p061-frame')??runtime?.getAttribute('data-p060-frame')??runtime?.getAttribute('data-pair-frame'),
  controls:buttons,alerts:[...document.querySelectorAll('[role="alert"]')].map(x=>x.textContent?.trim()).filter(Boolean),
  audio:{active:trace.active,maxActive:trace.maxActive,byPage:structuredClone(trace.byPage),
   eventCount:trace.events.length},dialogs:document.querySelectorAll('[role="dialog"][data-glossary-entry-id]').length};
 })};}
async function selectPage(page,name,selectedPages){
 await page.locator('button[data-responsive-focus-key="map"]:visible').first().click();
 await page.locator(`button[data-placement-id="${ID[name]}"]`).click();
 await page.locator(`${HOST}[data-current-animation-id="${ID[name]}"]`).waitFor();
 await page.locator(RUNTIME[name]).waitFor({timeout:45000});
 selectedPages.push(name);
}
function assertP064(state,config){
 assert.equal(state.animationId,ID.p064);
 assert.equal(state.currentPage,'64');
 assert.equal(state.availability,'registered');
 assert.equal(state.ready,'ready');
 assert.equal(state.phase,'question');
 assert.equal(state.questionId,config.firstQuestion,`seed ${config.seed} first question`);
 assert.deepEqual(state.fq,{attempted:0,correct:0,awarded:0,possible:0});
 assert.equal(state.nativeAudio.length,10);
 assert(state.nativeAudio.every(audio=>audio.paused),'P064 native audio remains paused');
 assert.equal(state.audio.active,0);
 assert.equal(state.dialogs,0);
}
async function waitFrameAtLeast(page,name,minimum,timeout=50000){
 await page.waitForFunction(({selector,minimum})=>
  Number(document.querySelector(selector)?.getAttribute('data-pair-frame')??0)>=minimum,
  {selector:RUNTIME[name],minimum},{timeout,polling:50});
}
async function play(page,name){
 const previous=await page.evaluate(id=>window.__P064_CONTINUITY.byPage[id]?.started??0,ID[name]);
 await page.locator('button[data-responsive-focus-key="replay"]:visible').first().click();
 await page.waitForFunction(({id,previous})=>
  (window.__P064_CONTINUITY.byPage[id]?.started??0)>previous,{id:ID[name],previous},{timeout:30000});
}
async function startByToggle(page,name){
 const previous=await page.evaluate(id=>window.__P064_CONTINUITY.byPage[id]?.started??0,ID[name]);
 await page.locator('button[data-responsive-focus-key="pause"]:visible').first().click();
 await page.waitForFunction(({id,previous})=>
  (window.__P064_CONTINUITY.byPage[id]?.started??0)>previous,{id:ID[name],previous},{timeout:30000});
}
async function pause(page,name){
 const active=await page.evaluate(id=>window.__P064_CONTINUITY.byPage[id]?.active??0,ID[name]);
 if(active>0){await page.locator('button[data-responsive-focus-key="pause"]:visible').first().click();
  await page.waitForFunction(id=>(window.__P064_CONTINUITY.byPage[id]?.active??0)===0,
   ID[name],{timeout:10000});}
}
function assertTargets(state,min,expected=[]){
 assert(state.controls.length>=min,`visible glossary count at ${state.animationId}`);
 assert(state.controls.every(item=>item.width>=44&&item.height>=44),`44px glossary targets at ${state.animationId}`);
 for(const item of expected){const found=state.controls.find(row=>row.id===item.id);
  assert(found,`source glossary ${item.id}`);assert.equal(found.key,item.key);assert.equal(found.disabled,false);}
}
async function glossary(page,name,term,locale){
 const selector=`${RUNTIME[name]} button[data-source-instance-id="${term.id}"]`;
 const trigger=page.locator(selector);await trigger.click();
 const dialog=page.locator(`[role="dialog"][data-glossary-entry-id="${term.entry}"]`);
 await dialog.waitFor();assert.equal(await dialog.getAttribute('data-source-key-attribute'),term.key);
 assert.match(await dialog.getAttribute('data-source-sha256'),/^[a-f0-9]{64}$/u);
 await page.waitForFunction(()=>window.__P064_CONTINUITY.active===0);
 await dialog.getByRole('button',{name:locale==='es'?'Cerrar y continuar':'Close and continue',exact:true}).click();
 await dialog.waitFor({state:'detached'});
 await page.waitForFunction(selector=>document.activeElement===document.querySelector(selector),selector);
 return{entry:term.entry,key:term.key,focusReturned:true};
}
async function caseLocale(browser,config,dir){
 const {locale}=config;
 const result={...config,status:'running',step:'entry',ready:false,formal:true,
  selectedPages:['p064'],observations:[],dialogs:[],requests:[],p064AudioRequests:[],headers:[],
  errors:[],consoleDiagnostics:[],developmentUpdates:[]};
 const context=await browser.newContext({viewport:{width:1440,height:900},locale:locale==='es'?'es-ES':'en-US',
  reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(installTrace);
 const page=await context.newPage();page.setDefaultTimeout(30000);
 const devtools=await context.newCDPSession(page);
 await devtools.send('Runtime.enable');
 devtools.on('Runtime.consoleAPICalled',event=>{
  if(event.type==='error'||event.type==='warning')result.consoleDiagnostics.push({
   step:result.step,type:event.type,timestamp:event.timestamp,
   arguments:event.args.map(arg=>arg.value??arg.description??arg.type),stackTrace:event.stackTrace??null});
 });
 page.on('request',request=>{const url=new URL(request.url());
  if(url.pathname.includes('.hot-update.')||request.resourceType()==='document'||
   (url.pathname.includes('/migration-status/')&&request.resourceType()==='fetch'))
   result.developmentUpdates.push({step:result.step,url:request.url(),resourceType:request.resourceType(),at:Date.now()});
 });
 page.on('pageerror',error=>result.errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')result.errors.push(message.text());});
 page.on('request',request=>{const url=new URL(request.url());
  if(url.pathname.startsWith('/migration-assets/'))
   result.requests.push({url:request.url(),method:request.method(),resourceType:request.resourceType()});
  if(url.pathname.startsWith(`/flash-assets/g678-local/${ID.p064}/`)&&url.pathname.includes('-audio/'))
   result.p064AudioRequests.push({url:request.url(),method:request.method(),resourceType:request.resourceType()});
 });
 page.on('response',response=>{const url=new URL(response.url());if(url.pathname.startsWith('/migration-assets/'))
  result.headers.push({url:response.url(),status:response.status(),contentType:response.headers()['content-type'],
   contentLength:response.headers()['content-length']});});
 try{
  const response=await page.goto(`${ORIGIN}/${locale}/migration-status/g678-calibration/${ID.p064}`,
   {waitUntil:'domcontentloaded',timeout:120000});
  result.responseStatus=response?.status()??null;assert.equal(result.responseStatus,200);
  assert.equal(await page.locator('main[data-p064-current-js]').getAttribute('data-p064-current-js'),
   'formal-candidate');
  await page.locator(`${RUNTIME.p064}[data-p064-host-score-gate="ready"]`).waitFor({timeout:45000});
  result.ready=true;
  let first=await snapshot(page,'p064-entry');result.observations.push(first);
  assertP064(first,config);
  assert.equal(new URL(first.url).search,'','source host entry uses default seed without a query');
  assert.equal(result.p064AudioRequests.length,0,'P064 no audio request at entry');
  result.step='p064-to-p062';await selectPage(page,'p062',result.selectedPages);
  await page.locator(`${RUNTIME.p062}[data-p062-ready="true"]`).waitFor({timeout:45000});
  let state=await snapshot(page,'p062-entry');result.observations.push(state);
  assert.equal(state.animationId,ID.p062);assert.equal(state.availability,'registered');
  assert.equal(state.audio.active,0);assert.equal(state.controls.length,0);
  result.step='p062-to-p061';await play(page,'p062');await selectPage(page,'p061',result.selectedPages);
  await page.waitForFunction(id=>(window.__P064_CONTINUITY.byPage[id]?.active??0)===0,ID.p062);
  await page.locator(`${RUNTIME.p061}[data-p061-ready="true"]`).waitFor({timeout:45000});
  state=await snapshot(page,'p061-entry');result.observations.push(state);
  assert.equal(state.animationId,ID.p061);assert.equal(state.availability,'registered');
  assert.equal(state.audio.active,0);assert.equal(state.controls.length,0);
  result.step='p061-to-p060';await play(page,'p061');await selectPage(page,'p060',result.selectedPages);
  await page.waitForFunction(id=>(window.__P064_CONTINUITY.byPage[id]?.active??0)===0,ID.p061);
  await page.locator(`${RUNTIME.p060}[data-p060-ready="true"]`).waitFor({timeout:45000});
  state=await snapshot(page,'p060-entry');result.observations.push(state);
  assert.equal(state.animationId,ID.p060);assert.equal(state.availability,'registered');
  assert.equal(state.audio.active,0);assertTargets(state,3,[P060_TERM]);
  result.dialogs.push(await glossary(page,'p060',P060_TERM,locale));
  result.step='p060-to-p058';await play(page,'p060');await selectPage(page,'p058',result.selectedPages);
  await page.locator(`${RUNTIME.p058}[data-pair-ready="true"]`).waitFor({timeout:45000});
  await page.waitForFunction(id=>(window.__P064_CONTINUITY.byPage[id]?.active??0)===0,ID.p060);
  state=await snapshot(page,'p058-ready-before-source-buttons');result.observations.push(state);
  assert.equal(state.availability,'registered');
  result.step='p058-source-controls';await play(page,'p058');await waitFrameAtLeast(page,'p058',243);
  state=await snapshot(page,'p058-source-controls');result.observations.push(state);
  assertTargets(state,6,[P058_TERM]);
  result.dialogs.push(await glossary(page,'p058',P058_TERM,locale));
  result.step='p058-to-p056';await play(page,'p058');await selectPage(page,'p056',result.selectedPages);
  await page.locator(`${RUNTIME.p056}[data-pair-ready="true"]`).waitFor({timeout:45000});
  await page.waitForFunction(id=>(window.__P064_CONTINUITY.byPage[id]?.active??0)===0,ID.p058);
  state=await snapshot(page,'p056-ready-before-source-buttons');result.observations.push(state);
  assert.equal(state.availability,'registered');
  result.step='p056-glossary';await play(page,'p056');await waitFrameAtLeast(page,'p056',17);
  state=await snapshot(page,'p056-source-controls');result.observations.push(state);
  assertTargets(state,2,P056_TERMS);
  result.dialogs.push(await glossary(page,'p056',P056_TERMS[0],locale));
  result.step='p056-to-p055';await play(page,'p056');await selectPage(page,'p055',result.selectedPages);
  await page.locator(`${RUNTIME.p055}[data-pair-ready="true"]`).waitFor({timeout:45000});
  state=await snapshot(page,'p055-ready-before-source-buttons');result.observations.push(state);
  assert.equal(state.availability,'registered');
  result.step='p055-source-controls';await startByToggle(page,'p055');await waitFrameAtLeast(page,'p055',145);
  state=await snapshot(page,'p055-source-controls');result.observations.push(state);
  assertTargets(state,3,[P055_TERM]);
  result.dialogs.push(await glossary(page,'p055',P055_TERM,locale));
  result.step='p055-to-p052';await play(page,'p055');
  await pause(page,'p055');await selectPage(page,'p052',result.selectedPages);
  await page.locator(`${RUNTIME.p052} .p052-player[data-p052-audio-loading="false"]`).waitFor({timeout:45000});
  state=await snapshot(page,'p052-ready');result.observations.push(state);
  assert.equal(state.availability,'registered');assert.equal(state.audio.byPage[ID.p055]?.active??0,0);
  result.step='p052-to-p064';await pause(page,'p052');
  await page.locator('button[data-responsive-focus-key="replay"]:visible').first().click();
  await pause(page,'p052');await startByToggle(page,'p052');
  await pause(page,'p052');await selectPage(page,'p064',result.selectedPages);
  await page.locator(`${RUNTIME.p064}[data-p064-host-score-gate="ready"]`).waitFor({timeout:45000});
  state=await snapshot(page,'p064-return');result.observations.push(state);
  assertP064(state,config);
  assert.equal(new URL(state.url).search,'','returned host keeps default seed without a query');
  assert.equal(result.p064AudioRequests.length,0,'P064 no audio request after return');
  assert.deepEqual(result.selectedPages,PAGES,'exact selected page sequence');
  state=await snapshot(page,'p064-final-paused');result.observations.push(state);
  assert.equal(state.audio.active,0);assert.equal(state.audio.maxActive,1);
  assert.deepEqual(state.alerts,[]);
  const receipts=await page.evaluate(async()=>{const trace=window.__P064_CONTINUITY;
   await Promise.all(trace.pending);return{responses:trace.responses,errors:trace.responseErrors,
    audio:{active:trace.active,maxActive:trace.maxActive,byPage:trace.byPage,events:trace.events}};});
  result.audio=receipts.audio;result.assets=receipts.responses;result.responseErrors=receipts.errors;
  result.scriptResourceObserved=result.requests.some(item=>new URL(item.url).pathname===
   '/migration-assets/nms-l02-p056-predecessors/p055-typography.js'&&item.resourceType==='script');
  assert.deepEqual(result.responseErrors,[]);
  for(const pathname of Object.keys(EXPECTED_ASSETS).filter(pathname=>pathname.endsWith('.mp3'))){
   assert(result.assets.some(item=>new URL(item.url).pathname===pathname),`actual fetched audio ${pathname}`);
  }
  for(const item of result.assets){const url=new URL(item.url),expected=EXPECTED_ASSETS[url.pathname];
   assert(expected&&url.pathname.endsWith('.mp3'),`listed audio ${url.pathname}`);
   assert.equal(url.origin,ORIGIN);assert.equal(url.search,`?sha256=${expected.sha256}`);
   assert.deepEqual({status:item.status,bytes:item.bytes,sha256:item.sha256,redirected:item.redirected},
    {status:200,bytes:expected.bytes,sha256:expected.sha256,redirected:false});
   assert.equal(item.contentType?.split(';')[0],'audio/mpeg');
  }
  assert.equal(result.scriptResourceObserved,true,'actual P055 script resource load');
  const script=EXPECTED_ASSETS['/migration-assets/nms-l02-p056-predecessors/p055-typography.js'];
  assert(result.headers.some(item=>new URL(item.url).pathname.endsWith('/p055-typography.js')&&
   item.status===200&&item.contentType===script.contentType&&Number(item.contentLength)===script.bytes),
   'P055 script browser response headers');
  assert.equal(result.audio.maxActive,1);assert.equal(result.audio.active,0);
  assert(Object.values(result.audio.byPage).every(bucket=>bucket.active===0),'all page audio cleaned');
  assert(result.requests.every(item=>new URL(item.url).origin===ORIGIN&&item.method==='GET'));
  assert.deepEqual(result.errors,[]);
  assert.equal(result.developmentUpdates.filter(request=>request.url.includes('.hot-update.')).length,0,'stable development session');
  result.status='technical-pass-not-acceptance';
 }catch(error){result.status='failed';result.failure={step:result.step,message:error.message,stack:error.stack};
  result.failureState=await snapshot(page,'failure').catch(()=>null);
  await page.screenshot({path:path.join(dir,`${locale}-failure.png`),fullPage:true}).catch(()=>{});
 }finally{
  result.contextClose=await bounded(context.close(),'context close',15000).then(()=> 'closed',error=>`error:${error.message}`);
  await writeFile(path.join(dir,`${locale}-record.json`),json(result),{flag:'wx'});
 }return result;
}
export async function run(args){
 const options=parseArgs(args);if(options.mode==='plan')return plan();
 const dir=path.join(ROOT,OUTPUT,options.slug);await mkdir(path.dirname(dir),{recursive:true});await mkdir(dir);
 let before;
 try{before=await preflight();}
 catch(error){const result={...plan(),status:'failed',phase:'preflight',cases:[],
  failure:{message:error.message,stack:error.stack},originalRuntimeAccepted:false,
  audioListeningAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
  await writeFile(path.join(dir,'result.json'),json(result),{flag:'wx'});return result;}
 const result={...plan(),status:'running',formal:true,startedAt:new Date().toISOString(),
  inputPinsBefore:before,cases:[],cleanupErrors:[],originalRuntimeAccepted:false,
  audioListeningAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES)result.cases.push(await caseLocale(browser,config,dir));
 }catch(error){result.failure={message:error.message,stack:error.stack};}
 finally{
  if(browser)await bounded(browser.close(),'browser disconnect',15000)
   .catch(error=>result.cleanupErrors.push(error.message));
  if(server){
   try{await bounded(server.close(),'browser process close',15000);result.browserProcessCleanup='closed';}
   catch(error){result.browserCloseError=error.message;
    try{await bounded(server.kill(),'browser process kill',15000);result.browserProcessCleanup='terminated';}
    catch(killError){result.cleanupErrors.push(killError.message);}}
   result.browserProcessExited=server.process().exitCode!==null||server.process().signalCode!==null;
   if(!result.browserProcessExited)result.cleanupErrors.push('browser process exit unverified');
  }
  result.inputPinsAfter=await pins();result.inputStable=JSON.stringify(before)===JSON.stringify(result.inputPinsAfter);
  result.finishedAt=new Date().toISOString();
  result.status=!result.failure&&result.cleanupErrors.length===0&&result.browserProcessExited&&result.inputStable&&
   result.cases.length===2&&result.cases.every(item=>item.status==='technical-pass-not-acceptance'&&
    item.contextClose==='closed')?'technical-pass-not-acceptance':'failed';
  await writeFile(path.join(dir,'result.json'),json(result),{flag:'wx'});
 }return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run(process.argv.slice(2)).then(result=>{
  console.log(json(result.status?{status:result.status,output:OUTPUT,cases:result.cases.length}:result));
  process.exitCode=result.status==='failed'?1:0;
 }).catch(error=>{console.error(error.stack??error);process.exitCode=1;});
}
