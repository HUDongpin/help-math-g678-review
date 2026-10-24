#!/usr/bin/env node
/** Natural P003 continuous-stream My Lesson browser probe. No synthetic clock,
 * seek, direct AudioContext call, registry write or acceptance promotion. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331';
const ID='shared-alg001-l06-p003';
const PAGE=`/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2`;
const SOURCE_PATH=`/flash-assets/g678-local/shared-alg001-l06-p003/continuous-source-v2`;
const SOURCE_SHA='91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111';
const CANVAS_PATH=`/flash-assets/g678-local/shared-alg001-l06-p003/canvas-renderer.js`;
const CANVAS_SHA='87694adc7d08f6f95069deede781410ab912a24a44a6cfce0fc05a43118f205c';
const OUTPUT=path.join(ROOT,'output/alg-l06-p003-audio-alignment-20260928/browser-host-continuous-v2');
const AWS='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const EXTERNAL='/Volumes/American Dream/hudongpin/g678-p003-audit.11qugt';
const SOURCE=path.join(AWS,'G6-G8-shared/ALG001/L6/RW/L6RW03.swf');
const PCM_RECEIPT='output/alg-l06-p003-audio-alignment-20260928/browser-continuous-v1/chrome-full-v3/result.json';
const INPUTS=Object.freeze([
 'scripts/probe-alg-l06-p003-continuous-host-v2.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2/page.tsx',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/continuous-source-v2/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/canvas-renderer.js/route.ts',
 'apps/web/lib/alg-l06-p003-continuous-candidate-v2.server.ts',
 'apps/web/lib/alg-l06-p003-continuous-source-access-v2.ts',
 'apps/web/lib/alg-l06-p003-local-audio-request-v1.ts',
 'apps/web/lib/alg-l06-p003-continuous-source-v2.server.ts',
 'apps/web/lib/g678-alg-l06-p003-host-probe.server.ts',
 'apps/web/lib/g678-alg-l06-p003-probe-access.ts',
 'apps/web/lib/g678-preview-policy.ts',
 'apps/web/proxy.ts',
 'apps/web/components/g678-alg-l06-p003-continuous-host-lesson-v2.tsx',
 'apps/web/components/g678-alg-l06-p003-continuous-runtime-v2.tsx',
 'apps/web/components/g678-alg-l06-p003-host-runtime.module.css',
 'apps/web/components/g678-multi-page-lesson-player-v3.generated.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'scripts/prepare-nms-l02-candidate-player.mjs',
 'apps/web/components/legacy-responsive-lesson-shell.tsx',
 'packages/demos/src/alg-l06-p003-continuous-source-clock-v2.ts',
 'packages/demos/src/alg-l06-p003-continuous-audio-schedule-v2.ts',
 'packages/demos/src/modules/g678-alg-l06-p003-continuous-candidate-v2.tsx',
 'packages/demos/src/alg-l06-p003-text-v1.ts',
 'output/alg-l06-p003-audio-alignment-20260928/continuous-v3.json',
 PCM_RECEIPT,
]);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

async function pin(file,expected){
 const absolute=path.isAbsolute(file)?file:path.join(ROOT,file);
 assert.equal(await realpath(absolute),absolute,`physical input: ${file}`);
 const before=await lstat(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink(),`ordinary input: ${file}`);
 const bytes=await readFile(absolute),after=await lstat(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mode','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${key}: ${file}`);
 const value={path:file,bytes:bytes.length,sha256:sha256(bytes)};
 if(expected){if(expected.bytes!==undefined)assert.equal(value.bytes,expected.bytes);
  assert.equal(value.sha256,expected.sha256);}
 return value;
}
async function closure(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,AWS,'exact real AWS source root');
 assert.equal(await realpath(AWS),AWS);
 const local=await Promise.all(INPUTS.map(file=>pin(file)));
 const external=[
  await pin(SOURCE,{bytes:1220637,sha256:'c3d265b61aedccc48e679cbecfe6424a2a78f2a9cb5cfa2a33791fa124933766'}),
  await pin(path.join(EXTERNAL,'source-stream.mp3'),{bytes:263640,sha256:SOURCE_SHA}),
  await pin('/Volumes/American Dream/hudongpin/g678-p003-candidate-v2.w5AS1a/canvas-renderer.js',
   {bytes:undefined,sha256:CANVAS_SHA}),
 ];
 return [...local,...external];
}
function allowedRequest(url){
 const value=new URL(url);
 return value.origin===BASE&&(
  value.pathname===PAGE||value.pathname===`/en${PAGE}`||value.pathname===`/es${PAGE}`||
  value.pathname.startsWith('/_next/')||value.pathname.startsWith('/flash-assets/g678-local/')||
  ['/learning-theme-bootstrap.js','/favicon.ico','/icon.svg','/fonts/lesson-v1/fredoka-variable.ttf','/fonts/lesson-v1/nunito-sans-variable.ttf','/','/en','/es'].includes(value.pathname));
}
async function instrument(page){
 await page.addInitScript(id=>{
  const state={events:[],frames:[],contexts:[],nodes:[]};
  Object.defineProperty(window,'__p003ContinuousProbe',{value:state});
  const note=(kind,detail={})=>state.events.push({kind,atMs:performance.now(),...detail});
  const Native=window.AudioContext;let nextContext=0,nextNode=0;
  window.AudioContext=class extends Native{
   constructor(...args){
    super(...args);const contextId=++nextContext;
    state.contexts.push({id:contextId,context:this});
    note('context',{contextId,sampleRate:this.sampleRate});
    const create=this.createBufferSource.bind(this);
    this.createBufferSource=()=>{
     const node=create(),nodeId=++nextNode;
     state.nodes.push({id:nodeId,contextId,node});note('node-created',{contextId,nodeId});
     const start=node.start.bind(node),stop=node.stop.bind(node),disconnect=node.disconnect.bind(node);
     node.start=(...values)=>{note('start',{contextId,nodeId,args:values,
      contextTime:this.currentTime,frame:Number(document.querySelector(`canvas[data-course-canvas="${id}"]`)?.getAttribute('data-flash-frame'))});
      return start(...values);};
     node.stop=(...values)=>{note('stop',{contextId,nodeId,contextTime:this.currentTime});return stop(...values);};
     node.disconnect=(...values)=>{note('disconnect',{contextId,nodeId});return disconnect(...values);};
     node.addEventListener('ended',()=>note('ended',{contextId,nodeId}));
     return node;
    };
    const resume=this.resume.bind(this),close=this.close.bind(this);
    this.resume=async()=>{note('resume-called',{contextId});const result=await resume();note('resumed',{contextId,state:this.state});return result;};
    this.close=async()=>{note('close-called',{contextId});const result=await close();note('closed',{contextId,state:this.state});return result;};
   }
  };
  const watch=new MutationObserver(records=>{
   for(const record of records){
    if(record.type!=='attributes'||record.attributeName!=='data-flash-frame')continue;
    const target=record.target;
    if(!(target instanceof HTMLCanvasElement)||target.dataset.courseCanvas!==id)continue;
    const frame=Number(target.getAttribute('data-flash-frame'));
    if(Number.isInteger(frame)&&state.frames.at(-1)?.frame!==frame)
     state.frames.push({frame,atMs:performance.now(),starts:state.events.filter(item=>item.kind==='start').length});
   }
  });
  watch.observe(document,{subtree:true,childList:true,attributes:true,
   attributeFilter:['data-flash-frame']});
 },ID);
}
async function browserState(page){
 return page.evaluate(()=>{
  const state=window.__p003ContinuousProbe;
  return {events:state.events,frames:state.frames,
   contexts:state.contexts.map(item=>({id:item.id,state:item.context.state,sampleRate:item.context.sampleRate})),
   nodes:state.nodes.map(item=>({id:item.id,contextId:item.contextId}))};
 });
}
async function snapshot(page,label){
 const runtime=page.locator(`[data-p003-continuous-v2="true"]`),canvas=page.locator(`canvas[data-course-canvas="shared-alg001-l06-p003"]`);
 return {label,phase:await runtime.getAttribute('data-p003-probe-phase'),
  ready:await runtime.getAttribute('data-source-clock-ready'),
  paused:await runtime.getAttribute('data-runtime-paused'),
  timelineEnded:await runtime.getAttribute('data-source-timeline-ended'),
  lessonComplete:await runtime.getAttribute('data-runtime-playback-complete'),
  frame:Number(await canvas.getAttribute('data-flash-frame')),
  run:await runtime.getAttribute('data-source-audio-run')};
}
async function scenario(browser,{locale,width,reduced,full},out){
 const name=`${locale}-${width}${reduced?'-reduced':''}`;
 const record={name,locale,width,reduced,status:'running',steps:[],errors:[],warnings:[],
  autoplayPolicyWarnings:[],
  requests:[],audioResponses:[],canvasResponses:[],screenshots:[],failure:null};
 const context=await browser.newContext({viewport:{width,height:width===390?844:1000},
  reducedMotion:reduced?'reduce':'no-preference',serviceWorkers:'block'});
 const page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(90000);
 const pending=[];
 await instrument(page);
 page.on('request',request=>record.requests.push({url:request.url(),method:request.method(),
  allowed:allowedRequest(request.url())}));
 page.on('pageerror',error=>record.errors.push(String(error)));
 page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
  if(message.type()==='warning'){
   if(message.text().startsWith('The AudioContext was not allowed to start.'))
    record.autoplayPolicyWarnings.push(message.text());
   else record.warnings.push(message.text());
  }});
 page.on('response',response=>{
  const url=new URL(response.url());
  if(response.status()>=400)record.errors.push(`HTTP ${response.status()} ${response.url()}`);
  if(url.pathname===SOURCE_PATH||url.pathname===CANVAS_PATH){
   const target=url.pathname===SOURCE_PATH?record.audioResponses:record.canvasResponses;
   pending.push(response.body().then(bytes=>target.push({url:response.url(),status:response.status(),
    bytes:bytes.length,sha256:sha256(bytes)})).catch(error=>target.push({url:response.url(),
     status:response.status(),bodyError:String(error)})));
  }
 });
 const runtime=page.locator('[data-p003-continuous-v2="true"]');
 const canvas=page.locator(`canvas[data-course-canvas="shared-alg001-l06-p003"]`);
 const control=key=>page.locator(`button[data-responsive-focus-key="${key}"]:visible`).first();
 const shot=async label=>{const file=`${name}-${label}.png`,bytes=await page.screenshot({fullPage:true});
  await writeFile(path.join(out,file),bytes,{flag:'wx'});
  record.screenshots.push({path:file,bytes:bytes.length,sha256:sha256(bytes)});};
 const observe=async label=>record.steps.push(await snapshot(page,label));
 try{
  const response=await page.goto(`${BASE}/${locale}${PAGE}`,{waitUntil:'domcontentloaded'});
  record.responseStatus=response.status();
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-source-clock-ready')==='true',null,{timeout:90000});
  assert.equal(await page.locator('main[data-p003-host-probe]').getAttribute('data-p003-host-probe'),'unregistered');
  assert.equal(await page.locator('[data-lesson-player]').getAttribute('data-renderer-availability'),'registered');
  assert.equal(await page.locator('[data-lesson-player]').getAttribute('data-current-animation-id'),ID);
  const bodyText = await page.locator('body').innerText();
  assert(bodyText.includes('19/60'), '19 actual registered lesson pages');
  assert(bodyText.includes(locale === 'es' ? '1 páginas candidatas sin registrar' : '1 unregistered candidate pages'), 'one disclosed candidate page');
  await observe('entry-ready');await shot('entry');
  assert.equal(record.steps.at(-1).frame,1);assert.equal(record.steps.at(-1).phase,'ready');
  assert.equal(record.steps.at(-1).lessonComplete,'false');
  assert.equal(await control('pause').getAttribute('data-playback-action'),'play');
  for(const key of ['rewind','timeline','forward'])
   assert.equal(await page.locator(`[data-responsive-focus-key="${key}"]:visible`).first().isDisabled(),true,
    `${key} visual inspection control stays disabled without source seek`);
  await page.waitForTimeout(250);
  record.nativeAtEntry=await browserState(page);
  assert.equal(record.nativeAtEntry.events.filter(item=>item.kind==='start').length,0,'no autoplay before gesture');
  assert.equal(await canvas.getAttribute('data-flash-frame'),'1');
  for (const label of ['−12 frames', '+12 frames']) {
   const buttons = page.getByRole('button', {name: label, exact: true});
   if (await buttons.count()) assert.equal(await buttons.first().isDisabled(), true, 'arbitrary seek disabled');
  }
  if(full){await control('pause').focus();await control('pause').press('Enter');}
  else await control('pause').click();
  await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='playing');
  await page.waitForFunction(()=>window.__p003ContinuousProbe?.events.some(item=>item.kind==='start'));
  await observe('explicit-play');
  for(const key of ['rewind','timeline','forward'])
   assert.equal(await page.locator(`[data-responsive-focus-key="${key}"]:visible`).first().isDisabled(),true,
    `${key} remains disabled during natural playback`);
  let native=await browserState(page);
  record.nativeAtFirstPlay=native;
  assert.equal(native.contexts.filter(item=>item.state!=='closed').length,1,'one active source context');
  assert.equal(native.events.filter(item=>item.kind==='start').length,1,'one initial native source start');
  assert.equal(native.events.filter(item=>item.kind==='start')[0].args[1],1673/22050,
   'head latency applied once to the full MP3');
  if(full){
   await page.waitForFunction(()=>Number(document.querySelector(`canvas[data-course-canvas="shared-alg001-l06-p003"]`)?.getAttribute('data-flash-frame'))>=55);
   await control('pause').click();
   await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='paused');
   await observe('paused');const held=record.steps.at(-1).frame;
   await page.waitForTimeout(280);assert.equal(Number(await canvas.getAttribute('data-flash-frame')),held);
   await control('pause').click();
   await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='playing');
   await page.waitForFunction(()=>window.__p003ContinuousProbe?.events.filter(item=>item.kind==='start').length===2);
   await observe('resumed');
   for(const frame of [501,502,520,531,544,719]){
    await page.waitForFunction(target=>window.__p003ContinuousProbe?.frames.some(item=>item.frame===target),frame,{timeout:75000});
    await observe(`crossed-${frame}`);
   }
   await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='timeline-ended',null,{timeout:15000});
   await observe('natural-held-719');await shot('held-719');
   assert.equal(record.steps.at(-1).frame,719);
   assert.equal(record.steps.at(-1).timelineEnded,'true');
   assert.equal(record.steps.at(-1).lessonComplete,'false');
   native=await browserState(page);
   record.nativeAtNaturalEnd=native;
   assert.equal(native.events.filter(item=>item.kind==='start').length,2,
    'no packet-boundary restart at frame 544 or elsewhere');
   const frames=native.frames.map(item=>item.frame);
   for(const frame of [501,502,520,531,544,719])assert(frames.includes(frame),`natural frame ${frame}`);
   assert(frames.indexOf(501)<frames.indexOf(502)&&frames.indexOf(502)<frames.indexOf(544)&&
    frames.indexOf(544)<frames.indexOf(719),'source frame order');
   assert(native.events.filter(item=>item.kind==='start').every(item=>item.frame<501));
   const startsBeforeReplay=native.events.filter(item=>item.kind==='start').length;
   await control('replay').click();
   await page.waitForFunction(()=>document.querySelector('[data-p003-continuous-v2="true"]')?.getAttribute('data-p003-probe-phase')==='ready'&&
    document.querySelector(`canvas[data-course-canvas="shared-alg001-l06-p003"]`)?.getAttribute('data-flash-frame')==='1');
   await page.waitForTimeout(300);await observe('replay-held-1');await shot('replay-held-1');
   assert.equal((await browserState(page)).events.filter(item=>item.kind==='start').length,startsBeforeReplay,
    'Replay holds frame 1 without autoplay');
   assert.equal(record.steps.at(-1).lessonComplete,'false');
   await control('pause').focus();await control('pause').press('Enter');
   await page.waitForFunction(()=>window.__p003ContinuousProbe?.events.filter(item=>item.kind==='start').length===3);
   await observe('keyboard-replay-play');
  }else{
   await page.waitForFunction(()=>Number(document.querySelector(`canvas[data-course-canvas="shared-alg001-l06-p003"]`)?.getAttribute('data-flash-frame'))>=45,null,{timeout:15000});
   await observe('mobile-reduced-explicit-audio');
   assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  }
  const beforeNav=await browserState(page);
  record.nativeBeforeNavigation=beforeNav;
  await control('next').click();
  await page.waitForFunction(id=>document.querySelector('[data-lesson-player]')?.getAttribute('data-current-animation-id')!==id,ID);
  await page.waitForFunction(()=>!document.querySelector('[data-p003-continuous-v2="true"]'));
  await page.waitForFunction(count=>window.__p003ContinuousProbe?.contexts.slice(0,count).every(item=>item.context.state==='closed'),beforeNav.contexts.length);
  record.afterNavigation=await browserState(page);
  assert.equal(record.afterNavigation.contexts.filter(item=>item.state!=='closed').length,0);
  assert(record.afterNavigation.events.some(item=>item.kind==='closed'));
  await Promise.allSettled(pending);
  const allAssets=[...record.audioResponses,...record.canvasResponses];
  assert(record.audioResponses.some(item=>item.status===200&&item.bytes===263640&&item.sha256===SOURCE_SHA),
   'real complete MP3 response verified');
  assert(record.audioResponses.every(item=>new URL(item.url).search===`?sha256=${SOURCE_SHA}`),
   'only exact hash-query source stream');
  assert(record.canvasResponses.some(item=>item.status===200&&item.sha256===CANVAS_SHA),
   'source canvas response verified');
  assert(record.canvasResponses.every(item=>new URL(item.url).search===`?sha256=${CANVAS_SHA}`),
   'only exact hash-query canvas script');
  assert(record.audioResponses.filter(item=>item.status===200&&!item.bodyError).every(item=>
   item.bytes===263640&&item.sha256===SOURCE_SHA));
  assert(allAssets.every(item=>item.status===200));
  assert.equal(new Set(record.audioResponses.map(item=>new URL(item.url).pathname)).size,1,
   'one exact full-stream URL, even if a development StrictMode fetch is aborted');
  assert(record.requests.every(item=>item.allowed),
   `unexpected requests: ${record.requests.filter(item=>!item.allowed).map(item=>item.url).join(',')}`);
  assert.deepEqual(record.errors,[]);
  assert.deepEqual(record.warnings,[]);
  record.status='passed';
 }catch(error){record.status='failed';record.failure=String(error?.stack??error);
  await shot('failure').catch(()=>{});
  record.dom=await page.content().catch(()=>null);
 }finally{
  await Promise.allSettled(pending);
  record.finalNative=await browserState(page).catch(()=>null);
  await context.close();
  record.contextClosed=true;
  await writeFile(path.join(out,`${name}.json`),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
 }
 return record;
}

export async function run(slug){
 assert(/^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug),'unique evidence slug');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,AWS);
 const out=path.join(OUTPUT,slug);assert(!existsSync(out),'immutable browser evidence');
 await mkdir(OUTPUT,{recursive:true});await mkdir(out);
 const receipt={schemaVersion:1,kind:'alg-l06-p003-continuous-host-browser-v2',
  startedAt:new Date().toISOString(),base:BASE,animationId:ID,
  status:'running',formal:false,registered:false,
  originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,
  ownerAccepted:false,strictComplete:false,published:false,
  cases:[],errors:[]};
 let browser,disconnected=false;
 try{
  receipt.inputsBefore=await closure();
  browser=await chromium.launch({channel:'chrome',headless:true,
   args:['--mute-audio','--autoplay-policy=document-user-activation-required']});
  browser.on('disconnected',()=>{disconnected=true;});
  receipt.browserVersion=browser.version();
  receipt.cases.push(await scenario(browser,{locale:'en',width:1440,reduced:false,full:true},out));
  receipt.cases.push(await scenario(browser,{locale:'es',width:390,reduced:true,full:false},out));
 }catch(error){receipt.errors.push(String(error?.stack??error));}
 finally{
  if(browser)try{await browser.close();}catch(error){receipt.errors.push(`browser close: ${String(error)}`);}
  receipt.browserDisconnected=disconnected;
  if(!disconnected)receipt.errors.push('owned Chrome browser did not disconnect');
  try{receipt.inputsAfter=await closure();}catch(error){receipt.errors.push(`post-input pin: ${String(error)}`);}
  receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);
  if(!receipt.inputsStable)receipt.errors.push('input closure changed during browser probe');
  receipt.status=receipt.errors.length===0&&receipt.cases.length===2&&
   receipt.cases.every(item=>item.status==='passed')?'technical-pass-not-acceptance':'failed';
  receipt.finishedAt=new Date().toISOString();
  await writeFile(path.join(out,'result.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,out,
   cases:receipt.cases.map(item=>({name:item.name,status:item.status,failure:item.failure})),
   inputsStable:receipt.inputsStable,browserDisconnected:receipt.browserDisconnected,
   errors:receipt.errors}));
  if(receipt.status==='failed')process.exitCode=1;
 }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--plan'){
  const pins=await closure();console.log(JSON.stringify({schemaVersion:1,
   kind:'alg-l06-p003-continuous-host-browser-plan-v2',base:BASE,
   cases:['en-desktop-natural','es-mobile-reduced'],inputs:pins,
   writesPerformed:false,browserLaunched:false}));
 }else{
  assert(args.length===2&&args[0]==='--run',
   'Usage: node scripts/probe-alg-l06-p003-continuous-host-v2.mjs --plan | --run <unique-slug>');
  await run(args[1]);
 }
}
