#!/usr/bin/env node
/** Formal local Current-JS P053 in real My Lesson; no downstream acceptance claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {plan as predecessorPlan} from './probe-nms-l02-p054-formal-my-lesson-v1.mjs';
import {validateP053AdmissionSemantics}
 from '../lib/nms-l02-p053-proof-semantics-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331',ID='shared-nms002-l02-p053',GAME='shared-nms002-l02-p054';
const HOST='[data-lesson-player][data-current-animation-id]';
const OUTPUT='output/nms-l02-p053-product-20260928/browser/formal-my-lesson-v1';
const FORMAL=[
 'scripts/probe-nms-l02-p053-formal-my-lesson-v1.mjs',
 'scripts/probe-nms-l02-p053-formal-my-lesson-v1.test.mjs',
 'apps/web/lib/nms-l02-p053-admission-activation.ts',
 'apps/web/lib/nms-l02-p053-admission.server.ts',
 'apps/web/lib/nms-l02-p053-descriptor-extension.ts',
 'lib/nms-l02-p053-proof-semantics-v1.mjs',
 'lib/nms-l02-p053-reviewed-seal-v1.mjs',
 'catalog/nms-l02-admission-v1/host-v16.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p053-v1.json',
 'catalog/product-bridge-calibrations/g678-nms-l02-p053-source-directions-current-js-v1.json',
 'catalog/product-bridge-calibrations/g678-nms-l02-p053-source-directions-current-js-v1.fragment.json',
 'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/run-manifest.json',
 'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/members/shared-nms002-l02-p053/member-manifest.json',
 'packages/demos/src/modules/shared-nms002-l02-p053.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p053.ts',
 'packages/demos/private-current-js-registry.json',
];
const FORMAL_ENTRY_PATHS=[
 'work/g678-workflow/candidates/shared-nms002-l02-p053-v1.json',
 'catalog/nms-l02-admission-v1/host-v16.json',
 'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/run-manifest.json',
 'apps/web/lib/nms-l02-p053-admission-activation.ts',
 'packages/demos/private-current-js-registry.json',
];
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const AUDIO='/flash-assets/g678-local/shared-nms002-l02-p053/source-audio?sha256=225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d';
const EXPECTED_AUDIO={bytes:256230,sha256:'225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d'};
const ADDED=[
 'scripts/probe-nms-l02-p053-product-my-lesson-v1.mjs',
 'apps/web/next.config.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p053/page.tsx',
 'apps/web/components/g678-nms-l02-p053-product-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p053-lesson-runtime-v1.tsx',
 'apps/web/components/nms-l02-p053-game-handoff-runtime-v1.tsx',
 'apps/web/components/nms-l02-p053-host-v1.css',
 'apps/web/lib/nms-l02-p053-product-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p053-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p053-product-host.production-stub.tsx',
 'apps/web/lib/nms-l02-p053-source-audio-access.ts',
 'apps/web/lib/nms-l02-p053-source-audio.server.ts',
 'apps/web/lib/nms-l02-p053-game-resource-access.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/source-audio/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/game/reveal/[level]/[order]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/game/feedback-audio/[kind]/route.ts',
 'packages/demos/src/nms-l02-p053-controller-candidate.ts',
 'packages/demos/src/nms-l02-p053-display-state-v1.ts',
 'packages/demos/src/nms-l02-p053-source-scene-v1.tsx',
 'packages/demos/src/nms-l02-p053-readable-directions-v1.tsx',
 'packages/demos/tests/nms-l02-p053-readable-directions-v1.test.tsx',
 'packages/demos/src/nms-l02-p053-player-state-v1.ts',
 'packages/demos/src/nms-l02-p053-host-navigation-v1.ts',
 'packages/demos/src/nms-l02-p053-source-audio-loader.ts',
 'packages/demos/src/generated/nms-l02-p053-display-data-v1.ts',
 'packages/demos/src/generated/nms-l02-p053-shape-art-v1.ts',
 'migrations/shared-nms002-l02-p053/audit/native-display-product-v1.json',
 'migrations/shared-nms002-l02-p053/audit/visual-scene-v1.json',
 'migrations/shared-nms002-l02-p053/audit/host-navigation-resolution-v1.json',
 'migrations/shared-nms002-l02-p053/audit/source-stream-product-v1.json',
 'migrations/shared-nms002-l02-p053/audit/frame-domain-static-graph-v1.json',
 'packages/demos/tests/nms-l02-p053-player-state-v1.test.ts',
 'packages/demos/tests/nms-l02-p053-source-audio-loader.test.ts',
 'packages/demos/tests/nms-l02-p053-source-audio-native-fetch.browser-test.ts',
 'apps/web/tests/nms-l02-p053-lesson-runtime-v1.test.tsx',
 'apps/web/tests/nms-l02-p053-product-descriptor-v1.test.ts',
 'apps/web/tests/nms-l02-p053-local-media-policy.test.mjs',
];
const EXTERNAL=[
 {path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/GS/L2GS02.swf`,bytes:236774,sha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf'},
 {path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'},
 {path:'/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-stream-product-v1/sprite-187-source-stream-v1.mp3',...EXPECTED_AUDIO},
];
const CASES=[{name:'en-desktop',locale:'en',level:1,width:1280,height:900,reducedMotion:'no-preference'},
 {name:'es-mobile',locale:'es',level:2,width:390,height:844,reducedMotion:'reduce'}];
const sha=b=>createHash('sha256').update(b).digest('hex');
async function pin(file){const absolute=path.resolve(ROOT,file),stat=await lstat(absolute);
 assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1,'ordinary evidence input');
 assert.equal(await realpath(absolute),absolute);const body=await readFile(absolute);
 return{path:file,bytes:body.length,sha256:sha(body)};}
async function pins(files){return Promise.all(files.map(pin));}
export function parseArgs(args){
 if(args.length===1&&args[0]==='--plan')return{mode:'plan'};
 assert(args.length===3&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]??'')&&
  ['candidate','registered'].includes(args[2]),'Usage: --plan | --run <unique-slug> candidate|registered');
 return{mode:'run',slug:args[1],phase:args[2]};
}
export function plan(phase='candidate'){
 assert(['candidate','registered'].includes(phase),'explicit formal phase');
 const registered=phase==='registered';
 return{kind:'nms-l02-p053-formal-my-lesson-browser-v1',schemaVersion:1,formal:true,phase,
 animationId:ID,origin:ORIGIN,
 route:`${ORIGIN}/{en|es}/migration-status/g678-calibration/${ID}`,
 registeredCount:registered?64:63,renderableCount:64,
 unregisteredCandidateCount:registered?0:1,activePageCount:64,cases:CASES,
 expectedMarker:registered?'registered':'formal-candidate',
 inputPaths:[...new Set([...predecessorPlan().inputPaths,...ADDED,...FORMAL])],externalInputs:EXTERNAL,
 outputRoot:`${OUTPUT}/${phase}`,limits:['local Current-JS formal phase only','source narration is independent of visual clock',
 'popup parent receiver after Close remains unresolved','no original runtime, listening, human, Owner or publication acceptance']};}
export async function readFormalInputTexts(root){return Promise.all(FORMAL_ENTRY_PATHS.map(file=>
 readFile(path.resolve(root,file),'utf8')));}
export function packetForSemantics(proof){return{...proof.packet,freezeManifest:proof.freeze};}
export async function preflight(phase){const info=plan(phase);
 assert(process.env.HELP_MATH_G678_SOURCE_ROOT===SOURCE_ROOT,'exact physical AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local only');
 const [proof,host,run,activation,registry]=await readFormalInputTexts(ROOT);
 const proofDocument=JSON.parse(proof),packet=proofDocument.packet,
  hostManifest=JSON.parse(host),dom=JSON.parse(run);
 const {validateP053ReviewedProofClosure}=await import('../lib/nms-l02-p053-reviewed-seal-v1.mjs');
 validateP053AdmissionSemantics(packetForSemantics(proofDocument),
  proofDocument.registration);
 validateP053ReviewedProofClosure(ROOT,proofDocument);
 assert.match(activation,new RegExp(`"stage":\\s*"${phase}"`,'u'),'exact activation phase');
 const {NMS_L02_P053_ADMISSION:activated}=await import('../apps/web/lib/nms-l02-p053-admission-activation.ts');
 assert.equal(activated?.schemaVersion,1);
 assert.equal(activated?.stage,phase);
 assert.deepEqual(activated?.host,await pin(FORMAL_ENTRY_PATHS[1]),'activated physical host-v16 pin');
 assert.deepEqual(activated?.page,await pin(FORMAL_ENTRY_PATHS[0]),'activated physical P053 proof pin');
 assert.deepEqual(activated?.predecessor,await pin(activated.predecessor.path),
  'activated physical predecessor witness pin');
 assert.equal(packet.calibrationId,'g678-nms-l02-p053-source-directions-current-js-v1');
 assert.equal(packet.selectedPages?.[0]?.animationId,ID);
 assert.equal(dom.animationId,ID);
 const keys=JSON.parse(registry).calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert.equal(keys.includes(ID),phase==='registered','registry phase');
 assert.equal(keys.length,phase==='registered'?638:637);
 assert.equal(keys.filter(key=>key.startsWith('shared-')).length,phase==='registered'?496:495);
 assert.equal(proofDocument.animationId,ID);
 const referenced=[...proofDocument.files.map(item=>item.path),...hostManifest.files.map(item=>item.path),
  ...proofDocument.external.map(item=>path.join(item.root,item.pin.path)),
  ...dom.externalEvidence.map(item=>item.path)];
 assert.equal(dom.externalEvidence.length,135,'bounded DOM external evidence');
 const paths=[...new Set([...info.inputPaths,...referenced])],before=await pins(paths);
 for(const expected of [...proofDocument.files,...hostManifest.files,
  ...proofDocument.external.map(item=>({...item.pin,path:path.join(item.root,item.pin.path)})),
  ...dom.externalEvidence])assert.deepEqual(before.find(item=>item.path===expected.path),expected,
   `formal closure pin: ${expected.path}`);
 for(const expected of info.externalInputs)assert.deepEqual(before.find(item=>item.path===expected.path),expected);
 return{paths,before,proofFiles:proofDocument.files.length,hostFiles:hostManifest.files.length,
  domExternal:dom.externalEvidence.length};
}
function installTrace(){
 const trace={audio:[],events:[],revoked:[],responses:[],pending:[],errors:[]};window.__P053=trace;
 const NativeAudio=window.Audio;window.Audio=new Proxy(NativeAudio,{construct(target,args){
  const node=Reflect.construct(target,args,target),id=trace.audio.length;trace.audio.push(node);
  for(const type of ['play','playing','pause','ended','abort','emptied','error'])node.addEventListener(type,()=>trace.events.push({id,type,paused:node.paused,at:performance.now()}));return node;}});
 const revoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{trace.revoked.push(String(url));revoke(url);};
 const nativeFetch=window.fetch;window.fetch=async function(...args){const response=await nativeFetch.apply(this,args);
  if(response.url.includes('/flash-assets/g678-local/shared-nms002-l02-p05')){
   const clone=response.clone();trace.pending.push(clone.arrayBuffer().then(async body=>{
    const digest=await crypto.subtle.digest('SHA-256',body);trace.responses.push({url:response.url,
     status:response.status,redirected:response.redirected,bytes:body.byteLength,
     sha256:[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join(''),
     type:response.headers.get('content-type')});}).catch(e=>trace.errors.push(String(e))));
  }return response;};
}
async function snapshot(page,label){return page.evaluate(label=>{const node=document.querySelector('.p053-host');
 return{label,frame:node?Number(node.dataset.p053Frame):null,playing:node?.dataset.p053Playing,
 level:node?.dataset.p053Level,popup:node?.dataset.p053Popup,audioStatus:node?.dataset.p053Audio,
 current:document.querySelector('[data-lesson-player]')?.getAttribute('data-current-animation-id'),
 audio:window.__P053.audio.map(a=>({paused:a.paused,time:a.currentTime,src:a.getAttribute('src'),ended:a.ended})),
 revoked:window.__P053.revoked.length,documentWidth:document.documentElement.clientWidth,
 documentScroll:document.documentElement.scrollWidth};},label);}
async function screenshot(page,record,dir,label){await page.evaluate(()=>window.scrollTo(0,0));
 const target=path.join(dir,`${record.name}-${label}.png`);const body=await page.screenshot({path:target,fullPage:true});
 record.screenshots.push({path:path.relative(ROOT,target),bytes:body.length,sha256:sha(body)});}
async function select(page,id){const map=page.locator('button[data-responsive-focus-key="map"]:visible').first();
 await map.click();const target=page.locator(`button[data-placement-id="${id}"]:visible`).first();
 await target.scrollIntoViewIfNeeded();await target.click();
 await page.locator(`[data-lesson-player][data-current-animation-id="${id}"]`).waitFor();}
async function caseRun(browser,config,dir,phase){
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},reducedMotion:config.reducedMotion});
 await context.addInitScript(installTrace);const page=await context.newPage();page.setDefaultTimeout(30000);
 const record={...config,formal:true,phase,step:'entry',snapshots:[],screenshots:[],errors:[],warnings:[],resources:[]};
 page.on('pageerror',e=>record.errors.push(String(e.stack??e)));
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')record.warnings.push({type:m.type(),text:m.text()});});
 page.on('response',r=>{if(r.url().includes('/flash-assets/g678-local/shared-nms002-l02-p05'))record.resources.push({url:r.url(),status:r.status()});});
 try{
  const response=await page.goto(`${ORIGIN}/${config.locale}/migration-status/g678-calibration/${ID}`,{waitUntil:'domcontentloaded',timeout:120000});
  assert.equal(response.status(),200);assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
  const stage=page.locator('.p053-host');await stage.waitFor({timeout:120000});
  assert.equal(await page.locator(`${HOST}[data-current-animation-id="${ID}"][data-current-page="53"]`).count(),1);
  const claim=await page.locator(`${HOST} p`).filter({hasText:config.locale==='es'
   ?'Puente privado page-only:':'Private page-only bridge:'}).first().innerText();
  const expected=plan(phase);
  assert(claim.includes(config.locale==='es'
   ?`${expected.registeredCount}/64 páginas registradas`
   :`${expected.registeredCount}/64 pages registered`),'actual host registered count');
  assert(claim.includes(config.locale==='es'
   ?`${expected.unregisteredCandidateCount} páginas candidatas sin registrar`
   :`${expected.unregisteredCandidateCount} unregistered candidate pages`),
   'actual host candidate count');
  let state=await snapshot(page,'entry');record.snapshots.push(state);
  assert.equal(state.frame,1);assert.equal(state.playing,'false');assert.equal(state.level,'none');assert.equal(state.audio.length,0);assert.equal(record.resources.length,0);
  assert.equal(await page.locator(`main[data-p053-current-js="${plan(phase).expectedMarker}"]`).count(),1);
  const listen=stage.getByRole('button',{name:config.locale==='en'?'Listen to English directions':'Escuchar instrucciones en inglés'});
  const stop=stage.getByRole('button',{name:config.locale==='en'?'Stop audio':'Detener audio',exact:true});
  const play=page.getByRole('button',{name:config.locale==='en'?'Play animation':'Reproducir animación',exact:true});
  const pause=page.getByRole('button',{name:config.locale==='en'?'Pause animation':'Pausar animación',exact:true});
  const replay=page.getByRole('button',{name:config.locale==='en'?'Replay':'Repetir',exact:true});
  record.step='early-source-controls';
  await stage.locator('[data-p053-control="mcStart"]').focus();await page.keyboard.press('Enter');
  assert.match(await stage.innerText(),/Please select the Level then Click Start/u);
  await stage.locator('[data-p053-control="mcL2"]').focus();await page.keyboard.press('Enter');
  assert.equal(await stage.getAttribute('data-p053-level'),'2');
  await stage.locator('[data-p053-control="mcStart"]').click();
  await page.locator('.p053-host[data-p053-frame="1"][data-p053-level="none"]').waitFor();
  assert.equal(await stage.locator('[role="status"]').count(),0);
  record.step='visual-pause-narration';await play.click();
  await page.waitForFunction(()=>Number(document.querySelector('.p053-host')?.dataset.p053Frame)>=10);
  await pause.click();const held=Number(await stage.getAttribute('data-p053-frame'));
  await page.waitForTimeout(250);assert.equal(Number(await stage.getAttribute('data-p053-frame')),held);
  await listen.click();await page.locator('.p053-host[data-p053-audio="playing"]').waitFor();
  await page.waitForFunction(()=>window.__P053.audio.some(a=>!a.paused&&a.currentTime>0));
  assert.equal(Number(await stage.getAttribute('data-p053-frame')),held);
  state=await snapshot(page,'explicit-narration');record.snapshots.push(state);
  assert.equal(state.playing,'false');assert.equal(state.audio.length,1);
  await stop.click();await page.waitForFunction(()=>window.__P053.audio.every(a=>a.paused&&!a.getAttribute('src')));
  state=await snapshot(page,'narration-stopped');record.snapshots.push(state);assert(state.revoked>=1);
  record.step='replay-during-narration';await listen.click();await page.locator('.p053-host[data-p053-audio="playing"]').waitFor();
  await replay.click();await page.locator('.p053-host[data-p053-playing="true"][data-p053-level="none"]').waitFor();
  await page.waitForFunction(()=>window.__P053.audio.every(a=>a.paused&&!a.getAttribute('src')));
  record.snapshots.push(await snapshot(page,'replayed-clean'));
  await stage.locator('[data-p053-control="mcSkip"]').waitFor();await stage.locator('[data-p053-control="mcSkip"]').click();
  await page.locator('.p053-host[data-p053-frame="693"][data-p053-playing="false"]').waitFor();
  assert.equal(await stage.getAttribute('data-p053-level'),'none');
  await stage.locator('[data-p053-control="mcStart"]').click();
  assert.equal(await stage.getAttribute('data-p053-level-message'),'true');
  await screenshot(page,record,dir,'held-before-popup');
  record.step='popup-close-hold';await stage.locator('[data-p053-control="mcRepeat"]').click();
  await page.locator('.p053-host[data-p053-popup="true"]').waitFor();
  assert.equal(await stage.locator('[data-p053-control]:disabled').count(),4);
  assert.equal(await stage.locator('[data-p053-source-text-id]').count(),4);
  if(config.width<=600){
   const readable=await stage.locator('.p053-readable-directions').evaluate(node=>({
    fontSize:parseFloat(getComputedStyle(node).fontSize),width:node.clientWidth,scroll:node.scrollWidth}));
   assert(readable.fontSize>=16&&readable.scroll<=readable.width+1);
   assert.equal(await stage.locator('svg[data-p053-source-scene]').isVisible(),false);
   record.readableDirections=readable;
  }
  await screenshot(page,record,dir,'popup');await stage.locator('[data-p053-close]').focus();await page.keyboard.press('Enter');
  await stage.locator('.p053-hold[role="alert"]').waitFor();assert.equal(await stage.locator('svg[data-p053-source-scene]').count(),0);
  record.snapshots.push(await snapshot(page,'close-unresolved'));await replay.click();
  await stage.locator('[data-p053-control="mcSkip"]').waitFor();await stage.locator('[data-p053-control="mcSkip"]').click();
  record.step='late-level-handoff';await stage.locator(`[data-p053-control="mcL${config.level}"]`).focus();await page.keyboard.press('Enter');
  await stage.locator('[data-p053-control="mcStart"]').click();
  const board=page.locator(`.p054-board[data-p054-level="${config.level}"]`);await board.waitFor({timeout:120000});
  await page.locator('.p054-board[data-p054-audio-status="ready"]').waitFor({timeout:60000});
  assert.equal(await board.getAttribute('data-p054-score'),'0');
  await board.locator('[data-source-instance="Mc1_1"]').click();await board.locator('[data-source-instance="Mc1_2"]').click();
  await page.locator('.p054-board[data-p054-matched-pairs="1"][data-p054-phase="selecting"]').waitFor({timeout:15000});
  assert.equal(await board.getAttribute('data-p054-score'),'10');
  await page.waitForFunction(()=>[...document.querySelectorAll('.p054-board img')].every(i=>i.complete&&i.naturalWidth>0));
  await screenshot(page,record,dir,'game-handoff');
  record.step='return-and-natural-hold';await select(page,ID);await stage.waitFor();
  assert.equal(await stage.getAttribute('data-p053-level'),'none');assert.equal(await stage.getAttribute('data-p053-frame'),'1');
  assert.equal(await stage.getAttribute('data-p053-audio'),'idle');
  await play.click();await page.locator('.p053-host[data-p053-frame="693"][data-p053-playing="false"]').waitFor({timeout:90000});
  record.snapshots.push(await snapshot(page,'natural-modern-clock-hold'));assert.equal(await stage.getAttribute('data-p053-popup'),'false');
  const progress=page.locator(`button[data-placement-id="${ID}"]`);assert.equal(await progress.getAttribute('data-complete'),'false');
  record.step='playing-audio-navigation-cleanup';await listen.click();await page.locator('.p053-host[data-p053-audio="playing"]').waitFor();
  await select(page,'shared-nms002-l02-p064');
  await page.waitForFunction(()=>window.__P053.audio.every(a=>a.paused&&!a.getAttribute('src')));
  await select(page,ID);await stage.waitFor();
  state=await snapshot(page,'return-after-audio-cleanup');record.snapshots.push(state);
  assert.equal(state.frame,1);assert.equal(state.level,'none');assert.equal(state.audioStatus,'idle');assert(state.documentScroll<=state.documentWidth+1);
  await page.evaluate(()=>Promise.all(window.__P053.pending));
  record.media=await page.evaluate(()=>({events:window.__P053.events,responses:window.__P053.responses,errors:window.__P053.errors,revoked:window.__P053.revoked}));
  const narration=record.media.responses.filter(row=>row.url===ORIGIN+AUDIO);assert(narration.length>=3);
  for(const item of narration){assert.equal(item.status,200);assert.equal(item.redirected,false);assert.equal(item.type,'audio/mpeg');assert.equal(item.bytes,EXPECTED_AUDIO.bytes);assert.equal(item.sha256,EXPECTED_AUDIO.sha256);}
  assert.deepEqual(record.media.errors,[]);assert.deepEqual(record.errors,[]);assert.deepEqual(record.warnings,[]);assert(record.resources.every(row=>row.status===200));
  record.step='complete';return record;
 }catch(error){record.failure={message:error.message,stack:error.stack};return record;}
 finally{await context.close();}
}
export async function run(args){const options=parseArgs(args);if(options.mode==='plan')return plan();
 const {slug,phase}=options,dir=path.join(ROOT,OUTPUT,phase,slug);
 await mkdir(path.dirname(dir),{recursive:true});await mkdir(dir);
 const info=plan(phase),result={...info,startedAt:new Date().toISOString(),
  inputs:null,referencedClosure:null,cases:[],failure:null,cleanupErrors:[]};
 let server,browser;
 try{const prepared=await preflight(phase);result.inputs=prepared.before;
  result.referencedClosure={proofFiles:prepared.proofFiles,hostFiles:prepared.hostFiles,
   domExternal:prepared.domExternal};
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES){const row=await caseRun(browser,config,dir,phase);
   result.cases.push(row);if(row.failure)throw Error(`${row.name}: ${row.failure.message}`);}
  assert.deepEqual(await pins(prepared.paths),prepared.before);result.inputsStable=true;
 }catch(error){result.failure={message:error.message,stack:error.stack};}
 finally{if(browser)await browser.close().catch(error=>result.cleanupErrors.push(error.message));
  if(server)await server.close().catch(error=>result.cleanupErrors.push(error.message));
  result.browserClosed=server?server.process().exitCode!==null||server.process().signalCode!==null:false;
  result.endedAt=new Date().toISOString();
  result.status=!result.failure&&result.inputsStable&&result.browserClosed&&
   result.cleanupErrors.length===0&&result.cases.length===CASES.length?'technical-pass-not-acceptance':'failed';
  await writeFile(path.join(dir,'result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});}
 console.log(JSON.stringify({path:path.relative(ROOT,path.join(dir,'result.json')),
  status:result.status,failure:result.failure,cases:result.cases.map(c=>({name:c.name,step:c.step,failure:c.failure}))}));
 if(result.status==='failed')process.exitCode=1;return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),options=parseArgs(args);
 if(options.mode==='plan')console.log(JSON.stringify(plan(),null,2));
 else await run(args);
}
