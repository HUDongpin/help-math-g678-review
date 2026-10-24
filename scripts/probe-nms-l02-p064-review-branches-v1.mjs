#!/usr/bin/env node
/** P064 My Lesson review-lookup branches. Local candidate evidence only. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {seededQuestions} from './probe-nms-l02-p064-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331',ID='shared-nms002-l02-p064';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`,bytes:55392,
 sha256:'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'};
const CONTRACT={path:'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json',bytes:2285,
 sha256:'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5'};
const HOST='[data-lesson-player][data-current-animation-id="shared-nms002-l02-p064"]';
const QUIZ=`${HOST} [data-animation-id="${ID}"][data-p064-phase]`;
const CASES=Object.freeze([
 {name:'en-desktop-q21-c',locale:'en',width:1440,height:900,reduced:false,seed:7137,
  firstQuestion:21,selected:'C',sourceCorrect:'D',reviewInstance:'R21Opt3'},
 {name:'es-mobile-q23-c',locale:'es',width:390,height:844,reduced:true,seed:1975,
  firstQuestion:23,selected:'C',sourceCorrect:'B',reviewInstance:'R231Opt3'},
]);
const INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p064-review-branches-v1.mjs',
 'scripts/probe-nms-l02-p064-review-branches-v1.test.mjs',
 'scripts/probe-nms-l02-p064-my-lesson-v1.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
 'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p064-product-candidate.server.ts',
 'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
 'packages/demos/src/nms-l02-p064-quiz-candidate.css',
 'packages/demos/src/nms-l02-p064-quiz-state-candidate.ts',
 'packages/demos/src/nms-l02-p064-host-score-candidate.ts',
 'packages/demos/src/nms-l02-p064-presentation-data-v1.ts',
 'packages/demos/src/nms-l02-p064-source-risk-candidate.ts',
 'packages/demos/src/lesson-host-contract.ts',
 'packages/demos/private-current-js-registry.json',
 CONTRACT.path,SWF.path,
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const absolute=value=>path.isAbsolute(value)?value:path.join(ROOT,value);
async function pin(relative){const bytes=await readFile(absolute(relative));return{path:relative,bytes:bytes.length,sha256:sha(bytes)};}
async function pins(){return Promise.all(INPUTS.map(pin));}
export function parseArgs(argv){
 if(argv.length===1&&argv[0]==='--plan')return{mode:'plan'};
 assert.ok(argv.length===2&&argv[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[1]??''),
  'Usage: --plan | --run <unique-slug>');
 return{mode:'run',slug:argv[1]};
}
export function plan(){return{
 kind:'nms-l02-p064-review-branches-browser-plan-v1',animationId:ID,base:BASE,
 stage:'unregistered-local-candidate',formal:false,registeredPageCount:61,renderableCount:62,
 activePageCount:64,source:SWF,sourceQuizContract:CONTRACT,cases:CASES,
 sourceQuestionCount:35,sourceDrawCount:10,historicalOriginalRuntimeReviewLookupEstablished:false,
 checks:['Q21 C and Q23 C are actual first-question branches from distinct deterministic candidate seeds',
  'ten source-ordered questions, first C wrong and nine source-correct answers; host aggregate 9/10',
  'ten ordered review steps; first warning has exact missing review name and matched TxtFeed3',
  'unresolved host exit remains on page 64 without course completion or automatic audio'],
 inputPaths:INPUTS,
 };}
async function bounded(promise,label,ms=15000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{
 timer=setTimeout(()=>reject(Error(`P064 review ${label} timed out`)),ms);})]);}finally{clearTimeout(timer);}}
async function wait(page,fn,arg,ms=12000){await page.waitForFunction(fn,arg,{timeout:ms,polling:50});}
async function screenshot(page,dir,name,record){const target=path.join(dir,`${name}.png`);
 const bytes=await page.screenshot({path:target,fullPage:true});
 record.screenshots.push({path:path.relative(ROOT,target),bytes:bytes.length,sha256:sha(bytes)});}
async function snapshot(page,label){return page.evaluate(({host,quiz,label})=>{
 const h=document.querySelector(host),q=document.querySelector(quiz),question=q?.querySelector('[data-p064-question]');
 return{label,url:location.href,at:performance.now(),currentPage:h?.getAttribute('data-current-page'),
  animationId:h?.getAttribute('data-current-animation-id'),availability:h?.getAttribute('data-renderer-availability'),
  attempted:Number(h?.getAttribute('data-lesson-host-fq-attempted')),
  correct:Number(h?.getAttribute('data-lesson-host-fq-correct')),
  awarded:Number(h?.getAttribute('data-lesson-host-fq-points-awarded')),
  possible:Number(h?.getAttribute('data-lesson-host-fq-points-possible')),
  phase:q?.getAttribute('data-p064-phase'),scoreGate:q?.getAttribute('data-p064-host-score-gate'),
  questionId:question?Number(question.getAttribute('data-p064-question')):null,
  audioPlaying:[...(q?.querySelectorAll('audio')??[])].filter(node=>!node.paused).length,
  risk:[...(q?.querySelectorAll('[data-p064-source-risk]')??[])].map(node=>({
   kind:node.getAttribute('data-p064-source-risk'),reviewInstance:node.getAttribute('data-p064-review-instance'),
   feedbackInstance:node.getAttribute('data-p064-feedback-instance'),
   feedbackLookup:node.getAttribute('data-p064-feedback-lookup')})),
  alerts:[...document.querySelectorAll('[role="alert"]')].map(node=>node.textContent?.trim()),
  overflow:document.documentElement.scrollWidth>innerWidth+1};
 },{host:HOST,quiz:QUIZ,label});}
function score(state,attempted,correct){
 assert.equal(state.attempted,attempted);assert.equal(state.correct,correct);
 assert.equal(state.awarded,correct);assert.equal(state.possible,attempted);
 assert.equal(state.scoreGate,'ready');
}
async function clickAnswer(page,letter){const index='ABCD'.indexOf(letter);assert(index>=0);
 const button=page.locator(`${QUIZ} [data-p064-question] .p064-candidate__option`).nth(index);
 assert.equal((await button.locator('.p064-candidate__letter').innerText()).trim(),letter);
 await button.click();}
async function runCase(browser,config,output,result,answerKey){
 const dir=path.join(output,config.name);await mkdir(dir);
 const record={...config,status:'running',step:'context',route:`${BASE}/${config.locale}/migration-status/g678-calibration/${ID}?seed=${config.seed}`,
  response:null,ready:false,formal:false,questions:[],reviews:[],observations:[],screenshots:[],
  requests:[],errors:[],warnings:[],cleanupErrors:[]};
 result.cases.push(record);let context,page;
 try{
  context=await browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:1,
   isMobile:config.width<500,hasTouch:config.width<500,
   locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reduced?'reduce':'no-preference',
   serviceWorkers:'block'});
  await context.route('**/*',route=>{const url=new URL(route.request().url()),allowed=url.origin===BASE;
   record.requests.push({path:allowed?url.pathname:url.origin,method:route.request().method(),allowed});
   return allowed?route.continue():route.abort();});
  page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',error=>record.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
   if(message.type()==='warning')record.warnings.push(message.text());});
  record.step='entry';const response=await page.goto(record.route,{waitUntil:'domcontentloaded',timeout:120000});
  record.response={status:response?.status()??null,url:response?.url()??null};assert.equal(record.response.status,200);
  await page.locator(`${QUIZ}[data-p064-host-score-gate="ready"]`).waitFor({timeout:30000});
  record.ready=true;assert.equal(await page.locator('main[data-p064-current-js]').getAttribute('data-p064-current-js'),
   'unregistered-product-candidate');
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
  assert.match(await page.locator('body').innerText(),/61\/64/u);
  const draws=seededQuestions(config.seed,answerKey);record.sourceDraws=draws;
  assert.equal(draws[0].questionId,config.firstQuestion);
  assert.equal(draws[0].correctOption,config.sourceCorrect);
  let state=await snapshot(page,'entry');record.observations.push(state);
  assert.equal(state.questionId,config.firstQuestion);assert.equal(state.phase,'question');
  assert.equal(state.availability,'registered');assert.equal(state.currentPage,'64');score(state,0,0);
  assert.equal(state.audioPlaying,0);assert.equal(state.overflow,false);
  assert.equal(record.requests.some(row=>row.path.includes(`/${ID}/`)&&row.path.includes('-audio/')),false);
  await screenshot(page,dir,'entry',record);
  for(const draw of draws){
   record.step=`question-${draw.ordinal}`;
   await page.locator(`${QUIZ} [data-p064-question="${draw.questionId}"]`).waitFor();
   state=await snapshot(page,`question-${draw.ordinal}`);record.observations.push(state);
   assert.equal(state.questionId,draw.questionId);score(state,draw.ordinal-1,Math.max(0,draw.ordinal-2));
   const prompt=(await page.locator(`${QUIZ} [data-p064-question="${draw.questionId}"] h3`).innerText()).trim();
   const answer=draw.ordinal===1?'C':draw.correctOption;
   record.questions.push({ordinal:draw.ordinal,questionId:draw.questionId,prompt,
    answer,sourceCorrect:draw.correctOption});
   await clickAnswer(page,answer);
   await wait(page,({host,ordinal})=>document.querySelector(host)?.getAttribute('data-lesson-host-fq-attempted')===String(ordinal),
    {host:HOST,ordinal:draw.ordinal});
   state=await snapshot(page,`answered-${draw.ordinal}`);record.observations.push(state);
   score(state,draw.ordinal,draw.ordinal-1);
  }
  record.step='finish';state=await snapshot(page,'finish');record.observations.push(state);
  assert.equal(state.phase,'finish');score(state,10,9);
  assert.match(await page.locator(`${QUIZ} .p064-candidate__result`).innerText(),/9\s*\/\s*10/u);
  await screenshot(page,dir,'finish',record);
  await page.locator(`${QUIZ} .p064-candidate__result button`).click();
  for(let ordinal=1;ordinal<=10;ordinal++){
   record.step=`review-${ordinal}`;
   const review=page.locator(`${QUIZ} .p064-candidate__review`);
   await review.locator('h3').filter({hasText:new RegExp(`${ordinal}\\s*/\\s*10`,'u')}).waitFor();
   const original=record.questions[ordinal-1];
   assert.equal((await review.locator('p[lang="en"]').first().innerText()).trim(),original.prompt);
   const text=await review.innerText();
   assert.match(text,new RegExp(`${original.answer}\\s*[—-]`,'u'));
   assert.match(text,new RegExp(`${original.sourceCorrect}\\s*[—-]`,'u'));
   const notice=review.locator('[data-p064-source-risk="review-lookup-miss"]');
   if(ordinal===1){assert.equal(await notice.count(),1);
    assert.equal(await notice.getAttribute('data-p064-review-instance'),config.reviewInstance);
    assert.equal(await notice.getAttribute('data-p064-feedback-instance'),'TxtFeed3');
    assert.equal(await notice.getAttribute('data-p064-feedback-lookup'),'matched');
    assert.match(await notice.innerText(),config.locale==='es'?/sí coincide/u:/still matches/u);
    await screenshot(page,dir,'source-review-lookup-miss',record);
   }else assert.equal(await notice.count(),0,'Only the selected source-risk branch warns');
   state=await snapshot(page,`review-${ordinal}`);record.observations.push(state);
   assert.equal(state.phase,'review');score(state,10,9);
   record.reviews.push({ordinal,questionId:original.questionId,answer:original.answer,
    correct:original.sourceCorrect,risk:ordinal===1?config.reviewInstance:null});
   await review.locator('button').click();
  }
  record.step='host-exit';state=await snapshot(page,'host-exit-unresolved');record.observations.push(state);
  assert.equal(state.phase,'host-exit-unresolved');assert.equal(state.currentPage,'64');
  assert.equal(state.animationId,ID);score(state,10,9);
  assert.match(await page.locator(`${QUIZ} [role="status"]`).innerText(),
   config.locale==='es'?/integración.*pendiente/iu:/integration is pending/iu);
  await screenshot(page,dir,'host-exit-unresolved',record);
  const mapButton=page.locator('button[data-responsive-focus-key="map"]:visible').first();
  await mapButton.click();
  const currentMapPage=page.locator(`button[data-placement-id="${ID}"]:visible`).first();
  await currentMapPage.waitFor();
  record.hostPageMarkedComplete=await currentMapPage.getAttribute('data-complete');
  assert.equal(record.hostPageMarkedComplete,'false','quiz review must not mark the lesson page complete');
  assert.equal(state.audioPlaying,0);assert.equal(state.overflow,false);
  assert.equal(record.requests.some(row=>row.path.includes(`/${ID}/`)&&row.path.includes('-audio/')),false,
   'No source audio request without a click');
  assert.equal(record.requests.some(row=>row.path.includes('.hot-update.')),false);
  assert(record.requests.every(row=>row.allowed));assert.deepEqual(record.errors,[]);
  assert.deepEqual(record.warnings,[]);assert.deepEqual(state.alerts,[]);
  record.status='candidate-review-branches-passed-not-acceptance';
 }catch(error){record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
  await writeFile(path.join(dir,'failure-initial.json'),json(record),{flag:'wx'});
  if(page){await screenshot(page,dir,'failure',record).catch(()=>{});
   record.failureState=await bounded(snapshot(page,'failure'),'failure snapshot',5000).catch(e=>({captureError:e.message}));}
 }finally{
  if(context)await bounded(context.close(),'context close',20000).catch(error=>record.cleanupErrors.push(error.message));
  if(record.cleanupErrors.length)record.status='failed';
  await writeFile(path.join(dir,'case-evidence.json'),json(record),{flag:'wx'});
 }
 return record;
}
async function preflight(){
 const before=await pins();assert.deepEqual(before.find(row=>row.path===SWF.path),SWF);
 assert.deepEqual(before.find(row=>row.path===CONTRACT.path),CONTRACT);
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 assert.equal((await lstat(SOURCE_ROOT)).isSymbolicLink(),false);
 assert.equal(await realpath(SWF.path),SWF.path);
 const source=JSON.parse(await readFile(absolute(CONTRACT.path)));
 assert.equal(source.schemaVersion,1);assert.equal(source.animationId,ID);
 assert.equal(source.quiz.correctOptions.length,35);assert.equal(source.quiz.drawCount,10);
 const registry=JSON.parse(await readFile(absolute('packages/demos/private-current-js-registry.json')));
 const keys=registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert.equal(keys.length,635);assert.equal(keys.filter(key=>key.startsWith('shared-')).length,493);
 assert(keys.includes('shared-nms002-l02-p062')&&!keys.includes(ID));
 const route=await readFile(absolute('apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx'),'utf8');
 assert.match(route,/nmsL02P064ProductCandidateDescriptor/u);
 return{before,answerKey:source.quiz.correctOptions};
}
export async function run(argv){
 const args=parseArgs(argv);if(args.mode==='plan'){const value=plan();console.log(json(value));return value;}
 const output=path.join(ROOT,'output/nms-l02-p064-product-20260928/browser-review-branches',args.slug);
 await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
 let prepared;try{prepared=await preflight();}
 catch(error){await writeFile(path.join(output,'failure-preflight.json'),json({
  kind:'nms-l02-p064-review-branches-preflight-failure-v1',status:'failed',
  at:new Date().toISOString(),message:error.message,stack:error.stack}),{flag:'wx'});throw error;}
 const result={...plan(),status:'running',startedAt:new Date().toISOString(),
  inputsBefore:prepared.before,cases:[],cleanupErrors:[],formal:false,
  originalRuntimeParityEstablished:false,audioListeningAccepted:false,
  humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 let server,browser;
 try{
  server=await chromium.launchServer({channel:'chrome',headless:true,host:'127.0.0.1'});
  browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
  for(const config of CASES){const record=await runCase(browser,config,output,result,prepared.answerKey);
   if(record.status!=='candidate-review-branches-passed-not-acceptance')break;}
  result.status=result.cases.length===CASES.length&&result.cases.every(row=>
   row.status==='candidate-review-branches-passed-not-acceptance')?
   'candidate-review-branches-passed-not-acceptance':'failed';
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
  try{result.inputsAfter=await pins();
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
 run(process.argv.slice(2)).then(result=>{process.exitCode=result.status===
  'candidate-review-branches-passed-not-acceptance'||
  result.kind==='nms-l02-p064-review-branches-browser-plan-v1'&&process.argv[2]==='--plan'?0:1;})
  .catch(error=>{console.error(error);process.exitCode=1;});
