#!/usr/bin/env node
/** Formal P064 My Lesson probe. --plan never starts a browser; --run owns its Chrome process. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331';
const ID='shared-nms002-l02-p064',PREVIOUS='shared-nms002-l02-p062';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`,bytes:55392,
 sha256:'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'};
const XML={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const CONTRACT={path:'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json',
 sha256:'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5'};
const AUDIO_INDEX={path:'migrations/shared-nms002-l02-p064/audit/audio-source-candidates-v1.json',
 bytes:109156,sha256:'60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58'};
const HOST='[data-lesson-player][data-current-animation-id]';
const QUIZ=`${HOST}[data-current-animation-id="${ID}"] [data-animation-id="${ID}"][data-p064-phase]`;
const CASES=Object.freeze([
 {name:'en-desktop-q10-risk',locale:'en',width:1440,height:900,reduced:false,seed:9713,firstAnswer:'D',
  expectedFirstQuestion:10,expectedCorrect:9,pendingAudio:true},
 {name:'es-mobile-q5-risk',locale:'es',width:390,height:844,reduced:true,seed:9714,firstAnswer:'B',
  expectedFirstQuestion:5,expectedCorrect:10,pendingAudio:false},
]);
const SELECTED_AUDIO=Object.freeze([
 {questionId:10,folder:'EA',option:null},{questionId:10,folder:'SA',option:null},
 {questionId:10,folder:'EA',option:'A'},
 {questionId:5,folder:'EA',option:null},{questionId:5,folder:'SA',option:null},
 {questionId:8,folder:'EA',option:null},{questionId:26,folder:'EA',option:null},
]);
const INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p064-formal-my-lesson-v1.mjs',
 'scripts/probe-nms-l02-p064-formal-my-lesson-v1.test.mjs',
 'scripts/probe-nms-l02-p064-my-lesson-v1.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
 'apps/web/lib/nms-l02-p064-admission-activation.ts',
 'apps/web/lib/nms-l02-p064-admission.server.ts',
 'apps/web/lib/nms-l02-p064-descriptor-extension.ts',
 'lib/nms-l02-p064-admission-semantics-v1.mjs',
 'lib/nms-l02-successor-proof.mjs',
 'catalog/nms-l02-admission-v1/host-v14.json',
 'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
 'output/nms-l02-p064-product-20260928/admission/host-v14-seal-receipt.json',
 'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json',
 'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/descriptor-driven-whole-lesson-player.tsx',
 'apps/web/components/animation-runtime.tsx',
 'apps/web/components/legacy-responsive-lesson-shell.tsx',
 'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx',
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
 'apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p064-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p064-product-host.production-stub.tsx',
 'apps/web/lib/nms-l02-p064-question-audio-access.ts',
 'apps/web/lib/nms-l02-p064-question-audio-source.ts',
 'apps/web/lib/nms-l02-p064-question-audio-response.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/[folder]/[question]/[option]/route.ts',
 'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
 'packages/demos/src/nms-l02-p064-quiz-state-candidate.ts',
 'packages/demos/src/nms-l02-p064-host-score-candidate.ts',
 'packages/demos/src/nms-l02-p064-product-module-v1.tsx',
 'packages/demos/src/modules/shared-nms002-l02-p064.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p064.ts',
 'packages/demos/src/nms-l02-p064-presentation-data-v1.ts',
 'packages/demos/src/nms-l02-p064-source-risk-candidate.ts',
 'packages/demos/src/lesson-host-contract.ts',
 'packages/demos/private-current-js-registry.json',
 'migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json',
 'migrations/shared-nms002-l02-p064/audit/active-display-list-v1.json',
 CONTRACT.path,AUDIO_INDEX.path,SWF.path,XML.path,
]);
const REGISTRATION='output/nms-l02-p064-product-20260928/registration/receipt.json';
const inputPaths=stage=>stage==='registered'?[...INPUTS,REGISTRATION]:INPUTS;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const physical=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);
async function pin(relative){const bytes=await readFile(physical(relative));return{path:relative,bytes:bytes.length,sha256:sha(bytes)};}
async function pins(stage){return Promise.all(inputPaths(stage).map(pin));}
export function parseArgs(argv){
 if(argv.length===2&&argv[0]==='--plan'&&['candidate','registered'].includes(argv[1]))
  return{mode:'plan',stage:argv[1]};
 assert.ok(argv.length===3&&argv[0]==='--run'&&['candidate','registered'].includes(argv[1])&&
  /^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[2]??''),
  'Usage: --plan candidate|registered | --run candidate|registered <unique-slug>');
 return{mode:'run',stage:argv[1],slug:argv[2]};
}
export function seededQuestions(seed,answerKey){
 assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffff_ffff&&answerKey.length===35);
 let rng=seed>>>0;const remaining=Array.from({length:35},(_,index)=>index+1),draws=[];
 for(let ordinal=1;ordinal<=10;ordinal++){
  rng=(Math.imul(rng,1664525)+1013904223)>>>0;
  const questionId=remaining.splice(rng%remaining.length,1)[0];
  draws.push({ordinal,questionId,correctOption:'ABCD'[answerKey[questionId-1]-1]});
 }
 return draws;
}
export function plan(stage){
 assert(['candidate','registered'].includes(stage));return{
 kind:'nms-l02-p064-formal-my-lesson-browser-plan-v1',animationId:ID,base:BASE,
 route:'/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p064?seed=<uint32>',
 stage,formal:true,registeredPageCount:stage==='registered'?62:61,renderableCount:62,
 unregisteredCandidateCount:stage==='registered'?0:1,
 activePageCount:64,source:SWF,sourceXml:XML,sourceQuizContract:CONTRACT,audioSourceIndex:AUDIO_INDEX,
 cases:CASES,selectedSourceAudio:SELECTED_AUDIO,sourceQuestionCount:35,drawCount:10,sourceOptionCount:4,
 historicalHostAssociationEstablished:false,sourceAudioListeningAccepted:false,
 checks:['entry has no automatic media playback or audio request; seeded distinct source questions and answers',
  'Q10 option D review lookup miss and Q5 dynamic-field notice are visible at their actual risk points',
  'ten host-scored answers, ten ordered reviews, unresolved host exit with no completion',
  'inline Replay and host Replay reset the host aggregate; P062 navigation/back cleans audio and keeps seed',
  'physical clicks on EA and SA native audio controls yield guarded source bytes; pending option audio is canceled',
  'EN desktop and ES 390px reduced-motion cases remain candidate evidence, not original-runtime or audio acceptance'],
 inputPaths:inputPaths(stage),
 };}
async function bounded(promise,label,ms=15000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{
 timer=setTimeout(()=>reject(Error(`P064 ${label} timed out`)),ms);})]);}finally{clearTimeout(timer);}}
async function wait(page,fn,arg,ms=15000){await page.waitForFunction(fn,arg,{timeout:ms,polling:50});}
async function shot(page,dir,name,record){
 const target=path.join(dir,`${name}.png`),bytes=await page.screenshot({path:target,fullPage:true});
 record.screenshots.push({path:path.relative(ROOT,target),bytes:bytes.length,sha256:sha(bytes)});
}
async function snap(page,label){return page.evaluate(({host,quiz,label})=>{
 const h=document.querySelector(host),q=document.querySelector(quiz),question=q?.querySelector('[data-p064-question]');
 const audio=[...(q?.querySelectorAll('audio')??[])].map(node=>({src:new URL(node.currentSrc||node.src,location.href).pathname,
  paused:node.paused,networkState:node.networkState,readyState:node.readyState}));
 const player=window.__P064_PROBE;
 return{label,url:location.href,at:performance.now(),animationId:h?.getAttribute('data-current-animation-id'),
  currentPage:h?.getAttribute('data-current-page'),availability:h?.getAttribute('data-renderer-availability'),
  fq:{attempted:Number(h?.getAttribute('data-lesson-host-fq-attempted')),
   correct:Number(h?.getAttribute('data-lesson-host-fq-correct')),
   awarded:Number(h?.getAttribute('data-lesson-host-fq-points-awarded')),
   possible:Number(h?.getAttribute('data-lesson-host-fq-points-possible'))},
  phase:q?.getAttribute('data-p064-phase'),revision:Number(q?.getAttribute('data-p064-revision')),
  scoreGate:q?.getAttribute('data-p064-host-score-gate'),questionId:Number(question?.getAttribute('data-p064-question')),
  sourceFrame:question?.getAttribute('data-p064-source-frame'),
  sourceRisks:[...(q?.querySelectorAll('[data-p064-source-risk]')??[])].map(x=>x.getAttribute('data-p064-source-risk')),
  audio,media:player.media.slice(),overflow:document.documentElement.scrollWidth>innerWidth+1,
  alerts:[...document.querySelectorAll('[role="alert"]')].map(x=>x.textContent?.trim())};
 },{host:HOST,quiz:QUIZ,label});}
async function hostButton(page,key){const button=page.locator(`button[data-responsive-focus-key="${key}"]:visible`).first();
 await button.scrollIntoViewIfNeeded();await button.click();}
function audioPath(folder,questionId,option=null){return `/flash-assets/g678-local/${ID}/${option?'option':'question'}-audio/${folder}/${questionId}${option?`/${option}`:''}`;}
async function clickNativeAudio(page,selector){
 const node=page.locator(selector);await node.waitFor();await node.scrollIntoViewIfNeeded();
 const box=await node.boundingBox();assert(box&&box.width>=80&&box.height>=25,'visible native audio controls');
 await node.click({position:{x:Math.min(24,box.width/5),y:box.height/2}});
 await wait(page,selector=>{const a=document.querySelector(selector);return a&&!a.paused&&a.readyState>=2;},selector,12000);
}
async function observeAudioNode(page,selector,label){
 await page.evaluate(({selector,label})=>{
  const node=document.querySelector(selector);if(!(node instanceof HTMLAudioElement))throw Error('Audio node absent');
  const entry={node,path:new URL(node.src,location.href).pathname,events:[]};
  for(const kind of ['play','playing','pause','ended','abort','emptied','error'])
   node.addEventListener(kind,()=>entry.events.push({kind,at:performance.now(),
    paused:node.paused,networkState:node.networkState,readyState:node.readyState}));
  window.__P064_PROBE.direct[label]=entry;
 },{selector,label});
}
async function observedAudioNode(page,label){return page.evaluate(label=>{
 const entry=window.__P064_PROBE.direct[label];if(!entry)return null;
 const node=entry.node;return{path:entry.path,connected:node.isConnected,paused:node.paused,
  networkState:node.networkState,readyState:node.readyState,preload:node.preload,
  sourceAttribute:node.getAttribute('src'),events:entry.events.slice()};
},label);}
function checkScore(state,attempted,correct){assert.deepEqual(state.fq,{attempted,correct,awarded:correct,possible:attempted});
 assert.equal(state.scoreGate,'ready');}
function checkQuestion(state,expected){assert.equal(state.phase,'question');assert.equal(state.questionId,expected.questionId);
 assert.equal(state.availability,'registered');assert.equal(state.currentPage,'64');assert.equal(state.overflow,false);}
async function waitQuestion(page,questionId){await page.locator(`${QUIZ} [data-p064-question="${questionId}"]`).waitFor();}
async function answer(page,letter){
 const option='ABCD'.indexOf(letter);assert(option>=0);
 const button=page.locator(`${QUIZ} [data-p064-question] .p064-candidate__option`).nth(option);
 assert.equal((await button.locator('.p064-candidate__letter').innerText()).trim(),letter);
 await button.click();
}
async function verifyResponse(row,index){
 const expected=index.sourceMediaRows.find(item=>item.folderCode===row.folder&&item.questionId===row.questionId&&
  item.role===(row.option?'option':'question')&&item.option===row.option);
 assert(expected,`Indexed source audio absent: ${row.url}`);
 assert.equal(row.status===200||row.status===206,true);assert.equal(row.redirected,false);
 assert.equal(row.contentType,'audio/mpeg');assert.equal(row.etag,`"${expected.sha256}"`);
 const original=await readFile(path.join(SOURCE_ROOT,expected.relativePath));
 assert.deepEqual({bytes:original.length,sha256:sha(original)},{bytes:expected.bytes,sha256:expected.sha256});
 let slice=original;
 if(row.status===206){const match=/^bytes (\d+)-(\d+)\/(\d+)$/u.exec(row.contentRange??'');
  assert(match,'206 must report a concrete byte range');assert.equal(Number(match[3]),original.length);
  slice=original.subarray(Number(match[1]),Number(match[2])+1);}
 assert.deepEqual({bytes:row.bytes,sha256:row.sha256},{bytes:slice.length,sha256:sha(slice)},
  `Network body must be the pinned source byte interval: ${row.url}`);
}
const passStatus=stage=>`formal-${stage}-my-lesson-browser-passed-not-acceptance`;
async function runCase(browser,config,output,result,audioIndex,stage){
 const dir=path.join(output,config.name);await mkdir(dir);
 const record={...config,status:'running',step:'context',route:`${BASE}/${config.locale}/migration-status/g678-calibration/${ID}?seed=${config.seed}`,
  response:null,ready:false,formal:true,stage,observations:[],screenshots:[],requests:[],audioResponses:[],
  questionSequence:[],reviewSequence:[],audioRequestFailures:[],audioBodyFailures:[],
  errors:[],warnings:[],cleanupErrors:[]};
 result.cases.push(record);let context,page,pendingRelease;const responseTasks=[];
 try{
  context=await browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:1,
   isMobile:config.width<500,hasTouch:config.width<500,
   locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reduced?'reduce':'no-preference',
   serviceWorkers:'block'});
  await context.route('**/*',route=>{const url=new URL(route.request().url());const allowed=url.origin===BASE;
   record.requests.push({path:allowed?url.pathname:url.origin,method:route.request().method(),allowed});
   return allowed?route.continue():route.abort();});
  await context.addInitScript(()=>{
   const media=[],direct={},lastMediaPath=new WeakMap();
   Object.defineProperty(window,'__P064_PROBE',{value:{media,direct}});
   for(const kind of ['play','playing','pause','ended','abort','emptied','error'])
    document.addEventListener(kind,event=>{if(event.target instanceof HTMLMediaElement){
     const current=event.target.currentSrc||event.target.getAttribute('src');
     const audioPath=current?new URL(current,location.href).pathname:lastMediaPath.get(event.target)??null;
     if(audioPath)lastMediaPath.set(event.target,audioPath);
     media.push({kind,path:audioPath,at:performance.now(),paused:event.target.paused});}},true);
  });
  page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',error=>record.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
   if(message.type()==='warning')record.warnings.push(message.text());});
  page.on('requestfailed',request=>record.audioRequestFailures.push({
   path:new URL(request.url()).pathname,error:request.failure()?.errorText??null}));
  page.on('response',response=>{const task=(async()=>{
   const url=new URL(response.url());
   const match=new RegExp(`^/flash-assets/g678-local/${ID}/(question|option)-audio/(EA|SA)/(\\d+)(?:/([A-D]))?$`,'u').exec(url.pathname);
   if(!match)return;
   try{const body=await response.body();record.audioResponses.push({url:response.url(),
    folder:match[2],questionId:Number(match[3]),option:match[4]??null,status:response.status(),
    bytes:body.length,sha256:sha(body),contentType:response.headers()['content-type']?.split(';')[0]?.trim().toLowerCase(),
    contentRange:response.headers()['content-range']??null,etag:response.headers().etag??null,
    redirected:response.request().redirectedFrom()!==null});}
   catch(error){record.audioBodyFailures.push({path:url.pathname,error:error.message});}
  })();responseTasks.push(task);});
  record.step='entry';const response=await page.goto(record.route,{waitUntil:'domcontentloaded',timeout:120000});
  record.response={status:response?.status()??null,url:response?.url()??null};assert.equal(record.response.status,200);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"]`).waitFor({timeout:30000});
  record.ready=true;assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
  assert.equal(await page.locator('main[data-p064-current-js]').getAttribute('data-p064-current-js'),
   stage==='registered'?'registered-local-current-js':'formal-candidate');
  let state=await snap(page,'entry');record.observations.push(state);
  checkQuestion(state,{questionId:config.expectedFirstQuestion});checkScore(state,0,0);
  assert.equal(state.audio.length,10);assert(state.audio.every(row=>row.paused));
  assert.equal(state.media.filter(row=>row.kind==='play'||row.kind==='playing').length,0);
  assert.equal(record.requests.filter(row=>row.path.includes(`/${ID}/`)&&row.path.includes('-audio/')).length,0,
   'No source audio fetched at entry');
  assert.match(await page.locator('body').innerText(),stage==='registered'?/62\/64/u:/61\/64/u);
  const timeline=page.locator('input[data-responsive-focus-key="timeline"]:visible');
  if(await timeline.count())assert.equal(await timeline.first().isDisabled(),true,'quiz transport is not seekable');
  if(config.expectedFirstQuestion===5)assert(state.sourceRisks.includes('q5-dynamic-fields'));
  await shot(page,dir,'entry',record);
  const hostPlay=page.locator('button[data-responsive-focus-key="pause"]:visible').first();
  record.hostPlayAvailable=await hostPlay.count()>0&&await hostPlay.isEnabled();
  if(record.hostPlayAvailable){await hostPlay.click();
   state=await snap(page,'host-play-no-autoplay');record.observations.push(state);
   assert.equal(state.audio.filter(row=>!row.paused).length,0);
   assert.equal(record.requests.filter(row=>row.path.includes(`/${ID}/`)&&row.path.includes('-audio/')).length,0);}
  const answerKey=result.sourceContract.quiz.correctOptions;
  const draws=seededQuestions(config.seed,answerKey);
  assert.equal(draws[0].questionId,config.expectedFirstQuestion);
  record.expectedQuestions=draws;
  record.step='source-audio';
  const first=draws[0].questionId;
  for(const folder of ['EA','SA']){
   const selector=`${QUIZ} [data-p064-source-question-audio="${first}"] audio[src="${audioPath(folder,first)}"]`;
   await clickNativeAudio(page,selector);
   await wait(page,({path,folder})=>window.__P064_PROBE.media.some(row=>row.kind==='playing'&&row.path===path),
    {path:audioPath(folder,first),folder});
   state=await snap(page,`${folder}-playing`);record.observations.push(state);
   assert.equal(state.audio.filter(row=>!row.paused).length,1,'One source audio at a time');
  }
  await shot(page,dir,'audio-explicit',record);
  if(config.pendingAudio){
   record.step='pending-audio';let reached;
   const reachedPromise=new Promise(resolve=>{reached=resolve;});
   const gate=new Promise(resolve=>{pendingRelease=resolve;});
   const pendingPath=audioPath('EA',first,'A');
   await context.route(`**${pendingPath}`,async route=>{
    record.pendingAudio={path:pendingPath,requested:true,continuedAfterAnswer:false};reached();
    await gate;record.pendingAudio.continuedAfterAnswer=true;
    await route.continue().catch(error=>{record.pendingAudio.continueError=error.message;});
   });
   await page.locator(`${QUIZ} .p064-candidate__option-audio summary`).click();
   const pendingSelector=`${QUIZ} audio[src="${pendingPath}"]`;
   await observeAudioNode(page,pendingSelector,'pending-answer');
   await page.locator(pendingSelector).click({position:{x:24,y:20}});
   await bounded(reachedPromise,'pending audio request',10000);
  }
  let correct=0;
  for(const draw of draws){
   record.step=`question-${draw.ordinal}`;await waitQuestion(page,draw.questionId);
   state=await snap(page,`question-${draw.ordinal}`);record.observations.push(state);
   checkQuestion(state,draw);checkScore(state,draw.ordinal-1,correct);
   const letter=draw.ordinal===1?config.firstAnswer:draw.correctOption;
   record.questionSequence.push({questionId:draw.questionId,sourceFrame:state.sourceFrame,
    prompt:await page.locator(`${QUIZ} [data-p064-question="${draw.questionId}"] h3`).innerText(),
    answer:letter,sourceCorrect:draw.correctOption});
   await answer(page,letter);if(letter===draw.correctOption)correct++;
   if(draw.ordinal===1&&pendingRelease){pendingRelease();pendingRelease=null;
    await wait(page,selector=>document.querySelector(selector)===null,
     `${QUIZ} audio[src="${audioPath('EA',first,'A')}"]`,5000);
    await wait(page,()=>window.__P064_PROBE.direct['pending-answer']?.events.some(row=>row.kind==='emptied'),
     null,8000);
    record.pendingAudio.nodeAfterAnswer=await observedAudioNode(page,'pending-answer');
    assert.equal(record.pendingAudio.nodeAfterAnswer.connected,false);
    assert.equal(record.pendingAudio.nodeAfterAnswer.paused,true);
    assert.equal(record.pendingAudio.nodeAfterAnswer.networkState,1,'restored source is idle, not loading');
    assert.equal(record.pendingAudio.nodeAfterAnswer.readyState,0,'pending source has no retained media data');
    assert.equal(record.pendingAudio.nodeAfterAnswer.preload,'none');
    const after=await snap(page,'pending-canceled');record.observations.push(after);
    assert(after.audio.every(row=>row.paused));
   }
   await wait(page,({host,ordinal})=>document.querySelector(host)?.getAttribute('data-lesson-host-fq-attempted')===String(ordinal),
    {host:HOST,ordinal:draw.ordinal});
   state=await snap(page,`answered-${draw.ordinal}`);record.observations.push(state);
   checkScore(state,draw.ordinal,correct);
   if(draw.ordinal<10)assert.equal(state.questionId,draws[draw.ordinal].questionId);
  }
  record.step='finish';state=await snap(page,'finish');record.observations.push(state);
  assert.equal(state.phase,'finish');assert.equal(correct,config.expectedCorrect);checkScore(state,10,correct);
  assert.match(await page.locator(`${QUIZ} .p064-candidate__result`).innerText(),new RegExp(`${correct}\\s*/\\s*10`,'u'));
  await shot(page,dir,'finish',record);
  await page.locator(`${QUIZ} .p064-candidate__result button`).click();
  for(let ordinal=1;ordinal<=10;ordinal++){
   record.step=`review-${ordinal}`;const review=page.locator(`${QUIZ} .p064-candidate__review`);
   await review.locator('h3').filter({hasText:new RegExp(`${ordinal}\\s*/\\s*10`,'u')}).waitFor();
   const text=await review.innerText(),draw=draws[ordinal-1],answered=record.questionSequence[ordinal-1];
   assert.equal((await review.locator('p[lang="en"]').first().innerText()).trim(),answered.prompt.trim());
   assert.match(text,new RegExp(`${answered.answer}\\s*[—-]`,'u'));
   assert.match(text,new RegExp(`${draw.correctOption}\\s*[—-]`,'u'));
   const risk=await review.locator('[data-p064-source-risk]').count();
   if(ordinal===1&&config.seed===9713){assert.equal(risk,1);
    assert.equal(await review.locator('[data-p064-review-instance]').getAttribute('data-p064-feedback-lookup'),'missing');}
   record.reviewSequence.push({ordinal,questionId:draw.questionId,answer:answered.answer,
    correct:draw.correctOption,risk:!!risk});
   await review.locator('button').click();
  }
  record.step='host-exit';state=await snap(page,'host-exit-unresolved');record.observations.push(state);
  assert.equal(state.phase,'host-exit-unresolved');checkScore(state,10,correct);
  assert.equal(state.currentPage,'64');assert.equal(state.animationId,ID);
  assert.match(await page.locator(`${QUIZ} [role="status"]`).innerText(),
   config.locale==='es'?/integración.*pendiente/iu:/integration is pending/iu);
  assert.equal(await page.locator(`${HOST}[data-current-animation-id="${ID}"]`).count(),1,
   'Review does not advance lesson host');
  await shot(page,dir,'host-exit-unresolved',record);
  record.step='inline-replay';await page.locator(`${QUIZ} footer button`).click();
  await waitQuestion(page,draws[0].questionId);state=await snap(page,'inline-replay');record.observations.push(state);
  checkScore(state,0,0);assert.equal(state.phase,'question');assert.equal(state.questionId,draws[0].questionId);
  await answer(page,draws[0].correctOption);
  await wait(page,host=>document.querySelector(host)?.getAttribute('data-lesson-host-fq-attempted')==='1',HOST);
  const replayAudioPath=audioPath('EA',draws[1].questionId);
  const replayAudioSelector=`${QUIZ} audio[src="${replayAudioPath}"]`;
  await observeAudioNode(page,replayAudioSelector,'host-replay');
  await clickNativeAudio(page,replayAudioSelector);
  record.step='host-replay';await hostButton(page,'replay');
  await wait(page,({quiz,first})=>{const q=document.querySelector(quiz);
   return q?.getAttribute('data-p064-phase')==='question'&&
    q.querySelector('[data-p064-question]')?.getAttribute('data-p064-question')===String(first)&&
   document.querySelector('[data-lesson-player]')?.getAttribute('data-lesson-host-fq-attempted')==='0';},
   {quiz:QUIZ,first:draws[0].questionId});
  await wait(page,()=>window.__P064_PROBE.direct['host-replay']?.events.some(row=>row.kind==='emptied'),
   null,8000);
  state=await snap(page,'host-replay');record.observations.push(state);checkScore(state,0,0);
  assert.equal(state.questionId,draws[0].questionId);
  const replayMedia=await observedAudioNode(page,'host-replay');record.replayAudio=replayMedia;
  assert(replayMedia.events.some(row=>row.kind==='playing'&&!row.paused),
   'Host Replay must be tested during real native playback');
  assert(replayMedia.events.some(row=>row.kind==='emptied'&&row.paused),
   'Host Replay must clear the native source while loading is canceled');
  assert.equal(replayMedia.connected,false);assert.equal(replayMedia.paused,true);
  assert.equal(replayMedia.networkState,1,'restored replay source is idle');
  assert.equal(replayMedia.readyState,0);assert.equal(replayMedia.preload,'none');
  const navAudioPath=audioPath('EA',draws[0].questionId);
  const navAudioSelector=`${QUIZ} audio[src="${navAudioPath}"]`;
  await observeAudioNode(page,navAudioSelector,'navigation');
  await clickNativeAudio(page,navAudioSelector);
  record.step='navigation';await hostButton(page,'map');
  await page.locator(`button[data-placement-id="${PREVIOUS}"]:visible`).first().click();
  await page.locator(`${HOST}[data-current-animation-id="${PREVIOUS}"]`).waitFor();
  await wait(page,quiz=>document.querySelector(quiz)===null,QUIZ);
  await wait(page,()=>window.__P064_PROBE.direct.navigation?.events.some(row=>row.kind==='emptied'),
   null,8000);
  const navMedia=await observedAudioNode(page,'navigation');record.navigationAudio=navMedia;
  assert(navMedia.events.some(row=>row.kind==='playing'&&!row.paused),
   'Navigation must be tested during real native playback');
  assert(navMedia.events.some(row=>row.kind==='emptied'&&row.paused),
   'Navigating away must clear the native source while loading is canceled');
  assert.equal(navMedia.connected,false);assert.equal(navMedia.paused,true);
  assert.equal(navMedia.networkState,1,'restored navigation source is idle');
  assert.equal(navMedia.readyState,0);assert.equal(navMedia.preload,'none');
  assert.equal(await page.locator(HOST).getAttribute('data-current-page'),'62');
  assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
  await shot(page,dir,'p062-navigation',record);
  await hostButton(page,'map');
  await page.locator(`button[data-placement-id="${ID}"]:visible`).first().click();
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"]`).waitFor();
  state=await snap(page,'return-p064');record.observations.push(state);
  checkQuestion(state,draws[0]);checkScore(state,0,0);
  const urlSeed=new URL(state.url).searchParams.get('seed');
  if(urlSeed!==null)assert.equal(urlSeed,String(config.seed));
  assert(state.audio.every(row=>row.paused));
  record.step='audio-evidence';await bounded(Promise.all(responseTasks),'audio response capture',10000);
  if(config.pendingAudio){
   assert.equal(record.pendingAudio?.requested,true,'real native control caused a pending source request');
   assert.equal(record.pendingAudio?.continuedAfterAnswer,true);
   assert(record.audioRequestFailures.some(row=>row.path===record.pendingAudio.path&&
    row.error==='net::ERR_ABORTED'),'pending source network request must be aborted');
   const media=await page.evaluate(()=>window.__P064_PROBE.media.slice());
   assert.equal(media.some(row=>row.kind==='playing'&&row.path===record.pendingAudio.path),false,
    'pending option audio must never start after question change');
  }
  const cancelledPaths=new Set([config.pendingAudio?record.pendingAudio.path:null,replayAudioPath,navAudioPath]);
  assert(record.audioBodyFailures.every(row=>cancelledPaths.has(row.path)),
   'Only audio canceled by answer, Replay or navigation may lose its response body');
  for(const row of record.audioResponses)await verifyResponse(row,audioIndex);
  const expectedFolders=new Set(record.audioResponses.filter(row=>row.questionId===first&&row.option===null)
   .map(row=>row.folder));
  assert.deepEqual([...expectedFolders].sort(),['EA','SA']);
  const paths=record.audioResponses.map(row=>new URL(row.url).pathname);
  assert(paths.every(row=>row.startsWith(`/flash-assets/g678-local/${ID}/`)));
  assert.equal(record.requests.some(row=>!row.allowed),false);
  assert(record.audioRequestFailures.every(row=>cancelledPaths.has(row.path)),
   'Only explicitly canceled pending, Replay or navigation audio may fail its request');
  assert.equal(record.requests.some(row=>row.path.includes('.hot-update.')),false,'stable dev host');
  assert.deepEqual(record.errors,[]);assert.deepEqual(record.warnings,[]);
  assert.equal(record.observations.at(-1).overflow,false);
  record.status=passStatus(stage);
 }catch(error){record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  await writeFile(path.join(dir,'failure-initial.json'),json(record),{flag:'wx'});
  if(page){await shot(page,dir,'failure',record).catch(()=>{});
   record.failureState=await bounded(snap(page,'failure'),'failure snapshot',5000).catch(e=>({captureError:e.message}));}
 }finally{
  pendingRelease?.();
  if(context)await bounded(context.close(),'context close',20000).catch(error=>record.cleanupErrors.push(error.message));
  if(record.cleanupErrors.length)record.status='failed';
  await writeFile(path.join(dir,'case-evidence.json'),json(record),{flag:'wx'});
 }
 return record;
}
async function preflight(stage){
 const before=await pins(stage);
 assert.deepEqual(before.find(row=>row.path===SWF.path),SWF,'exact physical source SWF');
 assert.deepEqual(before.find(row=>row.path===XML.path),XML,'exact physical lesson XML');
 const contractPin=before.find(row=>row.path===CONTRACT.path);
 assert.equal(contractPin?.sha256,CONTRACT.sha256);
 const audioPin=before.find(row=>row.path===AUDIO_INDEX.path);
 assert.deepEqual(audioPin,AUDIO_INDEX);
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
 assert.equal((await lstat(SOURCE_ROOT)).isSymbolicLink(),false);
 assert.equal(await realpath(SWF.path),SWF.path);assert.equal(await realpath(XML.path),XML.path);
 const sourceContract=JSON.parse(await readFile(physical(CONTRACT.path)));
 assert.equal(sourceContract.schemaVersion,1);assert.equal(sourceContract.animationId,ID);
 assert.equal(sourceContract.quiz.bankSize,35);assert.equal(sourceContract.quiz.drawCount,10);
 const audioIndex=JSON.parse(await readFile(physical(AUDIO_INDEX.path)));
 assert.equal(audioIndex.schemaVersion,1);assert.equal(audioIndex.animationId,ID);
 assert.equal(audioIndex.sourceMediaRows.length,350);
 const selectedAudioRows=SELECTED_AUDIO.map(selection=>{
  const matches=audioIndex.sourceMediaRows.filter(row=>row.questionId===selection.questionId&&
   row.folderCode===selection.folder&&row.option===selection.option&&
   row.role===(selection.option?'option':'question'));
  assert.equal(matches.length,1,'unique selected source audio');return matches[0];});
 const selectedAudioPaths=selectedAudioRows.map(row=>path.join(SOURCE_ROOT,row.relativePath));
 for(const pathname of selectedAudioPaths)assert.equal(await realpath(pathname),pathname);
 const audioBefore=await Promise.all(selectedAudioPaths.map(pin));
 for(let i=0;i<audioBefore.length;i++)assert.deepEqual({bytes:audioBefore[i].bytes,sha256:audioBefore[i].sha256},
  {bytes:selectedAudioRows[i].bytes,sha256:selectedAudioRows[i].sha256},'physical selected source audio');
 const registry=JSON.parse(await readFile(physical('packages/demos/private-current-js-registry.json')));
 const keys=registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert.equal(keys.includes(PREVIOUS),true);assert.equal(keys.includes(ID),stage==='registered');
 assert.equal(keys.length,stage==='registered'?636:635);
 assert.equal(keys.filter(key=>key.startsWith('shared-')).length,stage==='registered'?494:493);
 const routeText=await readFile(physical('apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx'),'utf8');
 assert.match(routeText,/nmsL02P064AdmissionDescriptor/u,'Formal reader is routed');
 const activationText=await readFile(physical('apps/web/lib/nms-l02-p064-admission-activation.ts'),'utf8');
 const activationMatch=activationText.match(/export const NMS_L02_P064_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
 assert(activationMatch,'Activation declaration');const activation=JSON.parse(activationMatch[1]);
 assert.equal(activation.schemaVersion,1);assert.equal(activation.stage,stage);
 assert.equal(activation.host.path,'catalog/nms-l02-admission-v1/host-v14.json');
 assert.equal(activation.page.path,'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json');
 for(const binding of [activation.predecessor,activation.host,activation.page])
  assert.deepEqual(before.find(row=>row.path===binding.path),binding,'exact activation physical pin');
 const hostSeal=JSON.parse(await readFile(physical('output/nms-l02-p064-product-20260928/admission/host-v14-seal-receipt.json')));
 const prepared=JSON.parse(await readFile(physical('output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json')));
 assert.equal(hostSeal.status,'NMS_L02_HOST_V14_SEALED');
 assert.deepEqual(hostSeal.host,activation.host);assert.equal(hostSeal.pages,64);
 assert.equal(prepared.status,'P064_PREPARED_NOT_REGISTERED');
 assert.deepEqual(prepared.proof,activation.page);
 const proof=JSON.parse(await readFile(physical(activation.page.path)));
 assert.equal(proof.animationId,ID);
 assert.equal(proof.packet.sourceRoot,SOURCE_ROOT);
 assert.deepEqual(proof.packet.source,{path:'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf',
  bytes:SWF.bytes,sha256:SWF.sha256});
 assert.equal(proof.packet.selectedPages.length,1);
 assert.equal(proof.packet.selectedPages[0].globalPageOrdinal,64);
 let registrationReceipt=null;
 if(stage==='registered'){
  registrationReceipt=JSON.parse(await readFile(physical(REGISTRATION)));
  assert.equal(registrationReceipt.status,'registered-local-current-js-not-acceptance');
  assert.equal(registrationReceipt.animationId,ID);
  assert.deepEqual(registrationReceipt.proof,activation.page);
  assert.deepEqual(registrationReceipt.host,activation.host);
  assert.deepEqual(registrationReceipt.counts,{oldTotal:635,newTotal:636,oldShared:493,
   newShared:494,oldLesson:61,newLesson:62});
  assert.deepEqual(registrationReceipt.outputs.find(row=>row.path==='packages/demos/private-current-js-registry.json'),
   before.find(row=>row.path==='packages/demos/private-current-js-registry.json'));
 }
 return{before,audioBefore,sourceContract,audioIndex,selectedAudioPaths,activation,hostSeal,
  preparedProof:prepared.proof,registrationReceipt};
}
export async function run(argv){
 const args=parseArgs(argv);if(args.mode==='plan'){const value=plan(args.stage);console.log(json(value));return value;}
 const output=path.join(ROOT,'output/nms-l02-p064-product-20260928/browser-formal',args.stage,args.slug);
 await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
 let prepared;
 try{prepared=await preflight(args.stage);}
 catch(error){await writeFile(path.join(output,'failure-preflight.json'),json({
  kind:'nms-l02-p064-formal-my-lesson-preflight-failure-v1',status:'failed',stage:args.stage,
  at:new Date().toISOString(),message:error.message,stack:error.stack}),{flag:'wx'});throw error;}
 const{before,audioBefore,sourceContract,audioIndex,selectedAudioPaths}=prepared;
 const result={...plan(args.stage),status:'running',startedAt:new Date().toISOString(),inputsBefore:[...before,...audioBefore],
  sourceContract:{schemaVersion:sourceContract.schemaVersion,animationId:sourceContract.animationId,
   quiz:sourceContract.quiz},cases:[],cleanupErrors:[],formal:true,
  activation:prepared.activation,hostSeal:prepared.hostSeal,preparedProof:prepared.preparedProof,
  registrationReceipt:prepared.registrationReceipt,
  originalRuntimeParityEstablished:false,audioListeningAccepted:false,humanAccepted:false,
  ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES){const record=await runCase(browser,config,output,result,audioIndex,args.stage);
   if(record.status!==passStatus(args.stage))break;}
  result.status=result.cases.length===CASES.length&&result.cases.every(row=>
   row.status===passStatus(args.stage))?passStatus(args.stage):'failed';
 }catch(error){result.status='failed';result.failure={message:error.message,stack:error.stack};
  await writeFile(path.join(output,'failure-initial.json'),json(result),{flag:'wx'});
 }finally{
  if(browser)await bounded(browser.close(),'browser disconnect',15000).catch(error=>result.cleanupErrors.push(error.message));
  if(server){try{await bounded(server.close(),'owned Chrome close',15000);result.browserProcessCleanup='closed';}
   catch(error){try{await bounded(server.kill(),'owned Chrome kill',15000);
    result.browserProcessCleanup='terminated-after-close-timeout';}
   catch(killError){result.cleanupErrors.push(killError.message);}}
   result.browserProcessExited=server.process().exitCode!==null||server.process().signalCode!==null;
   if(!result.browserProcessExited)result.cleanupErrors.push('Owned Chrome process exit unverified');}
  try{result.inputsAfter=[...await pins(args.stage),...await Promise.all(selectedAudioPaths.map(pin))];
   result.inputsUnchanged=JSON.stringify(result.inputsBefore)===JSON.stringify(result.inputsAfter);}
  catch(error){result.inputsUnchanged=false;result.inputPostflightFailure=error.message;}
  if(!result.inputsUnchanged||result.cleanupErrors.length)result.status='failed';
  result.closedAt=new Date().toISOString();
  await writeFile(path.join(output,'evidence.json'),json(result),{flag:'wx'});
  console.log(JSON.stringify({output,status:result.status,cases:result.cases.length,
   failure:result.failure?.message??result.cases.find(row=>row.failure)?.failure.message??null}));
 }
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 run(process.argv.slice(2)).then(result=>{process.exitCode=result.status===passStatus(result.stage)||
  result.kind==='nms-l02-p064-formal-my-lesson-browser-plan-v1'&&process.argv[2]==='--plan'?0:1;})
  .catch(error=>{console.error(error);process.exitCode=1;});
