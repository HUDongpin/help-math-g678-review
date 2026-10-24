#!/usr/bin/env node
/** Local, candidate-only My Lesson probe. Run after the separate P055 activation. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='shared-nms002-l02-p055',P052='shared-nms002-l02-p052';
const SOURCE='8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e';
const HOST='[data-lesson-player][data-current-animation-id]';
const RUNTIME=`${HOST} [data-pair-page="${ID}"]`;
const SOURCE_CONTROLS=`${RUNTIME} [data-source-animation-id="${ID}"]`;
const FRAME=`${RUNTIME}[data-pair-frame]`;
const TERMS=Object.freeze([
  {label:'Restate',key:'Restate',entry:'restate',id:'sprite-26/depth-11/generation-1',firstFrame:84},
  {label:'Question',key:'Question',entry:'question',id:'sprite-26/depth-13/generation-1',firstFrame:84},
  {label:'Problem',key:'Problem',entry:'problem',id:'sprite-26/depth-18/generation-1',firstFrame:145},
]);
const CASES=Object.freeze([
  {name:'en-desktop',locale:'en',width:1440,height:900,reduced:false},
  {name:'es-desktop',locale:'es',width:1440,height:900,reduced:false},
  {name:'en-mobile',locale:'en',width:390,height:844,reduced:false},
  {name:'es-mobile',locale:'es',width:390,height:844,reduced:false},
  {name:'en-desktop-reduced',locale:'en',width:1440,height:900,reduced:true},
  {name:'es-mobile-reduced',locale:'es',width:390,height:844,reduced:true},
]);
const INPUTS=Object.freeze([
  'scripts/probe-nms-l02-p055-host.mjs',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p055/page.tsx',
  'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
  'apps/web/components/g678-nms-l02-successor-lesson.tsx',
  'apps/web/components/nms-l02-p055-lesson-runtime.tsx',
  'apps/web/components/nms-l02-p055-host.css',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'packages/demos/src/nms-l02-p055-native-renderer.tsx',
  'packages/demos/src/source-glossary-controls.tsx',
  'packages/demos/src/source-glossary-session.ts',
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';

export function parseArgs(argv){
  if(argv.length===1&&argv[0]==='--plan')return{plan:true};
  assert.ok(argv.length>=2&&argv[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[1]??''),
    'Usage: --plan | --run <unique-slug> [--base-url http://127.0.0.1:<port>] [--expect-stage candidate|registered]');
  let base='http://127.0.0.1:3331',stage='candidate';
  const seen=new Set();
  for(let i=2;i<argv.length;i+=2){
    const key=argv[i],value=argv[i+1];
    assert.ok(value&&!seen.has(key)&&['--base-url','--expect-stage'].includes(key),'Invalid or repeated option');
    seen.add(key);
    if(key==='--base-url')base=value;else stage=value;
  }
  const url=new URL(base);
  assert.ok(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&/^\d+$/u.test(url.port)&&
    !url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash,
    'Probe accepts one explicit loopback HTTP origin');
  assert.ok(stage==='candidate'||stage==='registered','Explicit stage must be candidate or registered');
  return{plan:false,runName:argv[1],base:url.origin,stage};
}

function plan(){return{
  kind:'nms-l02-p055-candidate-host-probe-plan-v1',animationId:ID,sourceSwfSha256:SOURCE,
  route:'/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p055',
  cases:CASES,terms:TERMS,
  hooks:{host:HOST,runtime:RUNTIME,sourceControls:SOURCE_CONTROLS,
    timeline:'input[data-responsive-focus-key="timeline"]:visible',
    map:'button[data-responsive-focus-key="map"]:visible',
    replay:'button[data-responsive-focus-key="replay"]:visible',
    dialog:'[role="dialog"][data-glossary-entry-id]',
    oldPage:`${HOST}[data-current-animation-id="${P052}"]`},
  checks:['local route and noindex','candidate count separate from registered count',
    'English source disclosure in both locales','source controls at frames 1, 84, 145, and 351',
    'glossary source key, pause, close, and focus return','Replay one active Web Audio source',
    'P052 availability and P055 audio/dialog cleanup on navigation','reduced-motion parked terminal frame'],
  execution:'Not run by --plan; --run requires the separately activated local host.',
};}
async function pins(){return Promise.all(INPUTS.map(async relative=>{
  const bytes=await readFile(path.join(ROOT,relative));
  return{path:relative,bytes:bytes.length,sha256:sha(bytes)};
}));}
async function save(file,value){await writeFile(file,json(value),{flag:'wx'});}
function controlsAt(frame){return TERMS.filter(term=>frame>=term.firstFrame);}
async function waitFrame(page,frame){
  await page.waitForFunction(({selector,frame})=>document.querySelector(selector)?.getAttribute('data-pair-frame')===String(frame),
    {selector:FRAME,frame});
  await page.locator(`${RUNTIME} [data-canvas-status="ready"]`).waitFor();
}
async function inspect(page,frame){
  const range=page.locator('input[data-responsive-focus-key="timeline"]:visible').first();
  await range.waitFor();
  assert.equal(await range.getAttribute('max'),'351');
  await range.evaluate((input,value)=>{
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,String(value));
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  },frame);
  await waitFrame(page,frame);
  assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
}
async function observe(page,label){
  const state=await page.evaluate(({host,runtime,controls})=>{
    const h=document.querySelector(host),r=document.querySelector(runtime),c=document.querySelector(controls);
    const canvas=r?.querySelector('[data-canvas-status]');
    return{animationId:h?.getAttribute('data-current-animation-id'),availability:h?.getAttribute('data-renderer-availability'),
      frame:r?.getAttribute('data-pair-frame'),ready:r?.getAttribute('data-pair-ready'),
      paused:r?.getAttribute('data-runtime-paused'),audioPhase:r?.getAttribute('data-pair-audio-phase'),
      canvasStatus:canvas?.getAttribute('data-canvas-status'),controlCount:c?.getAttribute('data-source-control-count'),
      controls:[...(c?.querySelectorAll('button[data-source-instance-id]')??[])].map(x=>({id:x.getAttribute('data-source-instance-id'),
        key:x.getAttribute('data-source-key-attribute'),label:x.textContent?.trim(),disabled:x.disabled,
        width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})),
      audio:window.__P055_HOST_AUDIO_TRACE,
      overflow:document.documentElement.scrollWidth>window.innerWidth+1};
  },{host:HOST,runtime:RUNTIME,controls:SOURCE_CONTROLS});
  return{label,...state};
}
function checkControls(state,frame){
  const expected=controlsAt(frame);
  assert.equal(Number(state.frame),frame);
  assert.equal(state.controlCount,String(expected.length));
  assert.deepEqual(state.controls.map(x=>({id:x.id,key:x.key,label:x.label})),
    expected.map(x=>({id:x.id,key:x.key,label:x.label})));
  assert.ok(state.controls.every(x=>x.disabled===false),'Visible source controls must be operable');
  assert.ok(state.controls.every(x=>x.height>=44&&x.width>=44),'Vocabulary controls need usable touch targets');
  assert.equal(state.overflow,false,'Modern host must fit viewport width');
}
async function clickKey(page,key){
  const control=page.locator(`button[data-responsive-focus-key="${key}"]:visible`).first();
  await control.scrollIntoViewIfNeeded();await control.click();
}
async function openTerm(page,term,locale,record,output){
  const trigger=page.locator(`${SOURCE_CONTROLS} button[data-source-instance-id="${term.id}"]`);
  if(term.entry==='restate')assert.equal((await page.evaluate(()=>window.__P055_HOST_AUDIO_TRACE)).active,1,
    'The first glossary opening must interrupt active source audio');
  await trigger.click();
  const dialog=page.locator(`[role="dialog"][data-glossary-entry-id="${term.entry}"]`);
  await dialog.waitFor();
  assert.equal(await dialog.getAttribute('data-source-key-attribute'),term.key);
  assert.match(await dialog.getAttribute('data-source-sha256'),/^[a-f0-9]{64}$/u);
  assert.equal(await dialog.getAttribute('data-glossary-storage'),'memory-only');
  assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
  const held=await page.locator(RUNTIME).getAttribute('data-pair-frame');
  await page.waitForTimeout(250);
  assert.equal(await page.locator(RUNTIME).getAttribute('data-pair-frame'),held,'Glossary opening must hold frame');
  assert.equal((await page.evaluate(()=>window.__P055_HOST_AUDIO_TRACE)).active,0,'Glossary must stop source audio');
  record.dialogs.push({term:term.label,entry:term.entry,frame:held,sourceSha256:await dialog.getAttribute('data-source-sha256'),
    text:await dialog.innerText()});
  await page.screenshot({path:path.join(output,`${record.name}-${term.entry}-dialog.png`),fullPage:true});
  await dialog.getByRole('button',{name:locale==='es'?'Cerrar y continuar':'Close and continue',exact:true}).click();
  await dialog.waitFor({state:'detached'});
  await page.waitForFunction(selector=>document.activeElement===document.querySelector(selector),
    `${SOURCE_CONTROLS} button[data-source-instance-id="${term.id}"]`);
  assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true',
    'Close returns focus and stays paused until explicit Play');
}

export async function run(argv){
  const options=parseArgs(argv);
  if(options.plan){console.log(json(plan()));return plan();}
  const output=path.join(ROOT,'output/nms-l02-host-successor-20260927/browser',options.runName);
  const before=await pins();
  await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
  const result={...plan(),status:'running',base:options.base,expectedStage:options.stage,
    startedAt:new Date().toISOString(),inputs:before,records:[]};
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    for(const config of CASES){
      const record={...config,status:'running',step:'initial',observations:[],dialogs:[],errors:[],warnings:[],requests:[]};
      result.records.push(record);
      const context=await browser.newContext({viewport:{width:config.width,height:config.height},
        deviceScaleFactor:1,isMobile:config.width<500,hasTouch:config.width<500,
        locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reduced?'reduce':'no-preference',
        serviceWorkers:'block'});
      await context.route('**/*',route=>{
        const url=new URL(route.request().url()),allowed=url.origin===options.base;
        record.requests.push({path:allowed?url.pathname:url.origin,allowed});
        return allowed?route.continue():route.abort();
      });
      await context.addInitScript(()=>{
        const trace={active:0,maxActive:0,started:0,stopped:0};
        Object.defineProperty(window,'__P055_HOST_AUDIO_TRACE',{value:trace});
        const proto=AudioBufferSourceNode.prototype,start=proto.start,stop=proto.stop,active=new WeakSet();
        const finish=node=>{if(active.has(node)){active.delete(node);trace.active--;trace.stopped++;}};
        proto.start=function(...args){const value=start.apply(this,args);if(!active.has(this)){
          active.add(this);trace.active++;trace.started++;trace.maxActive=Math.max(trace.maxActive,trace.active);
          this.addEventListener('ended',()=>finish(this),{once:true});}return value;};
        proto.stop=function(...args){const value=stop.apply(this,args);finish(this);return value;};
      });
      const page=await context.newPage();page.setDefaultTimeout(25000);
      page.on('pageerror',error=>record.errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
        if(message.type()==='warning')record.warnings.push(message.text());});
      try{
        record.step='entry';
        const response=await page.goto(`${options.base}/${config.locale}/migration-status/g678-calibration/${ID}`,
          {waitUntil:'domcontentloaded',timeout:90000});
        assert.equal(response?.status(),200,'P055 host must be separately activated before this probe');
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
        const main=page.locator('main[data-p055-current-js]');await main.waitFor();
        assert.equal(await main.getAttribute('data-p055-current-js'),options.stage==='candidate'?'unregistered-probe':'registered-local-current-js');
        assert.equal(await main.getAttribute('data-official-g678-current-js'),options.stage==='candidate'?'486/2282':'487/2282');
        const body=await main.innerText(),disclosure=await page.locator('[aria-label="Evidence boundary"], [aria-label="Límite de evidencia"]').innerText();
        assert.match(body,config.locale==='es'?/bancos L2.*no están verificados/u:/L2 banks.*unverified/u);
        assert.match(disclosure,new RegExp(`${options.stage==='candidate'?54:55}/64`));
        assert.match(disclosure,config.locale==='es'
          ?new RegExp(`${options.stage==='candidate'?1:0} páginas candidatas sin registrar`)
          :new RegExp(`${options.stage==='candidate'?1:0} unregistered candidate pages`));
        await page.locator(`${RUNTIME}[data-pair-ready="true"]`).waitFor();
        await page.locator(`${RUNTIME} [data-canvas-status="ready"]`).waitFor();
        assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
        assert.equal(await page.locator(`${RUNTIME} .nms-p055-native`).getAttribute('lang'),'en');
        if(config.locale==='es')assert.equal(await page.locator(`${RUNTIME} [data-spanish-translation="missing"]`).count(),1);
        const initialFrame=config.reduced?351:1;await waitFrame(page,initialFrame);
        let state=await observe(page,'entry');record.observations.push(state);checkControls(state,initialFrame);
        assert.equal(state.audio.active,0,'Entry must not start source audio');
        await page.screenshot({path:path.join(output,`${record.name}-entry.png`),fullPage:true});

        record.step='source-controls';
        await inspect(page,84);state=await observe(page,'frame-84');record.observations.push(state);checkControls(state,84);
        await inspect(page,145);state=await observe(page,'frame-145');record.observations.push(state);checkControls(state,145);
        await page.screenshot({path:path.join(output,`${record.name}-frame-145.png`),fullPage:true});
        record.step='resume-before-glossary';await clickKey(page,'pause');
        await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-pair-audio-phase')==='playing',RUNTIME);
        await page.waitForFunction(()=>window.__P055_HOST_AUDIO_TRACE.active===1);
        for(const term of TERMS){record.step=`glossary-${term.entry}`;await openTerm(page,term,config.locale,record,output);}

        record.step='replay';await clickKey(page,'replay');
        await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-pair-audio-phase')==='playing',RUNTIME);
        await page.waitForFunction(()=>window.__P055_HOST_AUDIO_TRACE.active===1);
        await clickKey(page,'replay');
        await page.waitForFunction(()=>window.__P055_HOST_AUDIO_TRACE.started>=2&&window.__P055_HOST_AUDIO_TRACE.active===1);
        state=await observe(page,'replay-twice');record.observations.push(state);
        assert.equal(state.audio.maxActive,1,'Replay must never overlap two source-audio nodes');

        record.step='old-page';await clickKey(page,'map');
        await page.locator(`button[data-placement-id="${P052}"]`).click();
        await page.locator(`${HOST}[data-current-animation-id="${P052}"]`).waitFor();
        assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
        await page.waitForFunction(selector=>document.querySelector(selector)===null,RUNTIME);
        await page.waitForFunction(()=>window.__P055_HOST_AUDIO_TRACE.active===0);
        assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
        record.oldPage={animationId:P052,availability:'registered',audio:await page.evaluate(()=>window.__P055_HOST_AUDIO_TRACE)};
        await page.screenshot({path:path.join(output,`${record.name}-p052.png`),fullPage:true});
        record.step='return';await clickKey(page,'map');
        await page.locator(`button[data-placement-id="${ID}"]`).click();
        await page.locator(`${HOST}[data-current-animation-id="${ID}"]`).waitFor();
        await page.locator(`${RUNTIME}[data-pair-ready="true"]`).waitFor();
        state=await observe(page,'returned');record.observations.push(state);
        assert.equal(await page.locator(RUNTIME).count(),1,'Return must mount one P055 runtime');
        assert.equal(state.audio.active,0,'Return must not resume stale audio');
        assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
        assert.deepEqual(record.errors,[]);assert.deepEqual(record.warnings,[]);
        assert.ok(record.requests.every(request=>request.allowed),'No external origin is used');
        record.status='candidate-host-functional-probe-passed-not-acceptance';
      }catch(error){
        record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
        await page.screenshot({path:path.join(output,`${record.name}-failure.png`),fullPage:true}).catch(()=>{});
        record.failureDom=await page.locator('body').innerText().catch(()=>null);
      }finally{
        await context.close();await save(path.join(output,`${record.name}.json`),record);
        console.log(JSON.stringify({case:record.name,status:record.status,failure:record.failure?.message}));
      }
    }
  }finally{await browser.close();}
  result.inputsAfter=await pins();result.inputsUnchanged=JSON.stringify(before)===JSON.stringify(result.inputsAfter);
  result.passed=result.records.length===CASES.length&&result.records.every(r=>r.status==='candidate-host-functional-probe-passed-not-acceptance')&&result.inputsUnchanged;
  result.status=result.passed?'candidate-host-functional-probe-passed-not-acceptance':'failed';
  result.finishedAt=new Date().toISOString();await save(path.join(output,'evidence.json'),result);
  console.log(JSON.stringify({output,status:result.status,inputsUnchanged:result.inputsUnchanged}));
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run(process.argv.slice(2)).then(result=>{if(result.passed===false)process.exitCode=1;})
    .catch(error=>{console.error(error);process.exitCode=1;});
