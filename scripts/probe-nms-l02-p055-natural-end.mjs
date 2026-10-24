#!/usr/bin/env node
/** Real-time, local P055 natural-end observation. No clock, timeline, or seek override. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331',ID='shared-nms002-l02-p055';
const SOURCE_SHA='8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e';
const AUDIO_SHA='ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS02.swf';
const AUDIO='output/nms-l02-ts-family-20260927/audio/p055-main-sprite-26.mp3';
const HOST='[data-lesson-player][data-current-animation-id="shared-nms002-l02-p055"]';
const RUNTIME=`${HOST} [data-pair-page="${ID}"]`;
const CONTROLS=`${RUNTIME} [data-source-animation-id="${ID}"]`;
const INPUTS=[
  'scripts/probe-nms-l02-p055-natural-end.mjs',
  'apps/web/lib/nms-l02-admission-activation.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p055/page.tsx',
  'apps/web/components/g678-nms-l02-successor-lesson.tsx',
  'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
  'apps/web/components/nms-l02-p055-lesson-runtime.tsx',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'packages/demos/src/nms-l02-p055-native-renderer.tsx',
  'packages/demos/src/source-glossary-controls.tsx',
  'packages/demos/src/source-glossary-session.ts',
  'packages/demos/src/source-linear-audio.ts',
  'catalog/nms-l02-admission-v1/host-v5.json',
  AUDIO,
];
const TERMS=[
  {entry:'restate',label:'Restate',key:'Restate',id:'sprite-26/depth-11/generation-1'},
  {entry:'question',label:'Question',key:'Question',id:'sprite-26/depth-13/generation-1'},
  {entry:'problem',label:'Problem',key:'Problem',id:'sprite-26/depth-18/generation-1'},
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const asset=relative=>path.join(ROOT,relative);
async function pin(relative){const bytes=await readFile(asset(relative));return{path:relative,bytes:bytes.length,sha256:sha(bytes)};}
async function pins(){return Promise.all(INPUTS.map(pin));}
export function parseArgs(argv){
  assert.ok(argv.length===2&&argv[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[1]??''),
    'Usage: node scripts/probe-nms-l02-p055-natural-end.mjs --run <unique-slug>');
  return argv[1];
}
async function snapshot(page,label){
  return page.evaluate(({host,runtime,controls,label})=>{
    const h=document.querySelector(host),r=document.querySelector(runtime),c=document.querySelector(controls);
    return{label,at:performance.now(),animationId:h?.getAttribute('data-current-animation-id'),
      availability:h?.getAttribute('data-renderer-availability'),
      frame:Number(r?.getAttribute('data-pair-frame')),phase:r?.getAttribute('data-pair-audio-phase'),
      paused:r?.getAttribute('data-runtime-paused'),ready:r?.getAttribute('data-pair-ready'),
      canvas:r?.querySelector('[data-canvas-status]')?.getAttribute('data-canvas-status'),
      controls:[...(c?.querySelectorAll('button[data-source-instance-id]')??[])].map(button=>({
        id:button.getAttribute('data-source-instance-id'),key:button.getAttribute('data-source-key-attribute'),
        label:button.textContent?.trim(),disabled:button.disabled})),
      audio:{...window.__P055_NATURAL_AUDIO_TRACE},
      frameTrace:window.__P055_NATURAL_FRAME_TRACE.slice(),
    };
  },{host:HOST,runtime:RUNTIME,controls:CONTROLS,label});
}
async function waitFor(page,predicate,arg,timeout=50000){
  await page.waitForFunction(predicate,arg,{timeout,polling:50});
}
async function openTerm(page,term,record){
  const trigger=page.locator(`${CONTROLS} button[data-source-instance-id="${term.id}"]`);
  assert.equal(await trigger.isDisabled(),false);
  await trigger.click();
  const dialog=page.locator(`[role="dialog"][data-glossary-entry-id="${term.entry}"]`);
  await dialog.waitFor();
  assert.equal(await dialog.getAttribute('data-source-key-attribute'),term.key);
  assert.match(await dialog.getAttribute('data-source-sha256'),/^[a-f0-9]{64}$/u);
  assert.equal(await page.locator(RUNTIME).getAttribute('data-pair-frame'),'351');
  assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
  assert.equal((await page.evaluate(()=>window.__P055_NATURAL_AUDIO_TRACE)).active,0);
  record.dialogs.push({entry:term.entry,label:term.label,sourceSha256:await dialog.getAttribute('data-source-sha256'),
    frame:351,at:await page.evaluate(()=>performance.now())});
  await dialog.getByRole('button',{name:'Close and continue',exact:true}).click();
  await dialog.waitFor({state:'detached'});
  await waitFor(page,selector=>document.activeElement===document.querySelector(selector),
    `${CONTROLS} button[data-source-instance-id="${term.id}"]`,5000);
}

export async function run(argv){
  const slug=parseArgs(argv),output=asset(`output/nms-l02-host-successor-20260927/natural-end/${slug}`);
  const inputsBefore=await pins();
  const swfBytes=await readFile(SOURCE),sourcePin={path:SOURCE,bytes:swfBytes.length,sha256:sha(swfBytes)};
  assert.deepEqual({bytes:sourcePin.bytes,sha256:sourcePin.sha256},{bytes:149059,sha256:SOURCE_SHA});
  const audioPin=inputsBefore.find(item=>item.path===AUDIO);
  assert.deepEqual({bytes:audioPin.bytes,sha256:audioPin.sha256},{bytes:143780,sha256:AUDIO_SHA});
  await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
  const record={kind:'nms-l02-p055-natural-end-browser-probe-v1',status:'running',sourcePin,audioPin,
    base:BASE,route:`${BASE}/en/migration-status/g678-calibration/${ID}`,viewport:{width:1440,height:900},
    reducedMotion:'no-preference',browserChannel:'chrome',inputsBefore,startedAt:new Date().toISOString(),
    step:'browser-launch',observations:[],dialogs:[],errors:[],warnings:[],requests:[]};
  let browser,context,page;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});record.browserVersion=browser.version();
    context=await browser.newContext({viewport:record.viewport,deviceScaleFactor:1,reducedMotion:'no-preference',
      locale:'en-US',serviceWorkers:'block'});
    await context.route('**/*',route=>{
      const url=new URL(route.request().url()),allowed=url.origin===BASE;
      record.requests.push({path:allowed?url.pathname:url.origin,allowed});
      return allowed?route.continue():route.abort();
    });
    await context.addInitScript(({runtime})=>{
      const audio={active:0,maxActive:0,started:0,stopped:0,events:[]},frames=[];
      Object.defineProperty(window,'__P055_NATURAL_AUDIO_TRACE',{value:audio});
      Object.defineProperty(window,'__P055_NATURAL_FRAME_TRACE',{value:frames});
      const proto=AudioBufferSourceNode.prototype,start=proto.start,stop=proto.stop,active=new WeakSet();
      const finish=node=>{if(active.has(node)){active.delete(node);audio.active--;audio.stopped++;
        audio.events.push({kind:'stop',at:performance.now(),active:audio.active});}};
      proto.start=function(...args){const result=start.apply(this,args);if(!active.has(this)){
        active.add(this);audio.active++;audio.started++;audio.maxActive=Math.max(audio.maxActive,audio.active);
        audio.events.push({kind:'start',at:performance.now(),active:audio.active});
        this.addEventListener('ended',()=>finish(this),{once:true});}return result;};
      proto.stop=function(...args){const result=stop.apply(this,args);finish(this);return result;};
      let previous='';const capture=()=>{const element=document.querySelector(runtime);
        const frame=element?.getAttribute('data-pair-frame'),phase=element?.getAttribute('data-pair-audio-phase');
        const key=`${frame}:${phase}`;if(frame&&key!==previous){previous=key;
          frames.push({frame:Number(frame),phase,at:performance.now()});}};
      const observer=new MutationObserver(capture);
      observer.observe(document,{subtree:true,childList:true,attributes:true,
        attributeFilter:['data-pair-frame','data-pair-audio-phase']});
      document.addEventListener('DOMContentLoaded',capture,{once:true});
    },{runtime:RUNTIME});
    page=await context.newPage();page.setDefaultTimeout(25000);
    page.on('pageerror',error=>record.errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
      if(message.type()==='warning')record.warnings.push(message.text());});
    record.step='entry';
    const response=await page.goto(record.route,{waitUntil:'domcontentloaded',timeout:120000});
    assert.equal(response?.status(),200);
    assert.equal(await page.locator('main[data-p055-current-js]').getAttribute('data-p055-current-js'),'unregistered-probe');
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
    await page.locator(`${RUNTIME}[data-pair-ready="true"] [data-canvas-status="ready"]`).waitFor();
    await waitFor(page,selector=>document.querySelector(selector)?.getAttribute('data-pair-frame')==='1',RUNTIME,10000);
    let state=await snapshot(page,'entry');record.observations.push(state);
    assert.equal(state.availability,'registered');assert.equal(state.phase,'paused');
    assert.equal(state.audio.active,0);assert.deepEqual(state.controls,[]);
    await page.screenshot({path:path.join(output,'entry.png'),fullPage:true});

    record.step='natural-play';
    const play=page.locator('button[data-responsive-focus-key="pause"]:visible').first();
    await play.waitFor();assert.equal(await play.getAttribute('aria-label'),'Play animation');
    record.playClickedAt=await page.evaluate(()=>performance.now());
    await play.click();
    await waitFor(page,selector=>Number(document.querySelector(selector)?.getAttribute('data-pair-frame'))>=6,RUNTIME,15000);
    state=await snapshot(page,'progressing');record.observations.push(state);
    assert.ok(state.frame>=6&&state.frame<351);assert.equal(state.phase,'playing');
    assert.equal(state.audio.active,1);assert.equal(state.audio.maxActive,1);
    record.step='natural-terminal';
    await waitFor(page,selector=>{const runtime=document.querySelector(selector);
      return runtime?.getAttribute('data-pair-frame')==='351'&&
        runtime.getAttribute('data-pair-audio-phase')==='ended'&&
        runtime.getAttribute('data-runtime-paused')==='true'&&window.__P055_NATURAL_AUDIO_TRACE.active===0;},RUNTIME,50000);
    record.terminalAt=await page.evaluate(()=>performance.now());
    state=await snapshot(page,'natural-terminal');record.observations.push(state);
    record.elapsedToTerminalMs=record.terminalAt-record.playClickedAt;
    assert.ok(record.elapsedToTerminalMs>25000&&record.elapsedToTerminalMs<45000,
      'Natural audio-driven terminal elapsed outside expected 351/12 s envelope');
    assert.equal(state.frame,351);assert.equal(state.phase,'ended');assert.equal(state.audio.active,0);
    assert.equal(state.audio.maxActive,1);assert.equal(state.controls.length,3);
    assert.deepEqual(state.controls.map(({id,key,label,disabled})=>({id,key,label,disabled})),
      TERMS.map(term=>({id:term.id,key:term.key,label:term.label,disabled:false})));
    assert.ok(state.frameTrace.some(item=>item.frame===1)&&
      state.frameTrace.filter(item=>item.frame>1&&item.frame<351).length>=10&&
      state.frameTrace.some(item=>item.frame===351&&item.phase==='ended'),
      'Observed natural frame progression must reach ended terminal');
    await page.screenshot({path:path.join(output,'terminal.png'),fullPage:true});

    record.step='terminal-glossary';
    for(const term of TERMS)await openTerm(page,term,record);
    record.step='replay';
    const replay=page.locator('button[data-responsive-focus-key="replay"]:visible').first();
    record.replayClickedAt=await page.evaluate(()=>{
      window.__P055_REPLAY_AT=performance.now();return window.__P055_REPLAY_AT;
    });await replay.click();
    await waitFor(page,selector=>{const runtime=document.querySelector(selector),trace=window.__P055_NATURAL_FRAME_TRACE;
      return trace.some(item=>item.at>=window.__P055_REPLAY_AT&&item.frame===1)&&
        runtime?.getAttribute('data-pair-audio-phase')==='playing'&&
        window.__P055_NATURAL_AUDIO_TRACE.active===1;},RUNTIME,15000);
    state=await snapshot(page,'replay-playing');record.observations.push(state);
    assert.equal(state.audio.maxActive,1);assert.equal(state.audio.started,2);
    assert.ok(state.frame>=1&&state.frame<351);
    await page.screenshot({path:path.join(output,'replay.png'),fullPage:true});

    record.step='cleanup';
    const pause=page.locator('button[data-responsive-focus-key="pause"]:visible').first();
    assert.equal(await pause.getAttribute('aria-label'),'Pause animation');await pause.click();
    await waitFor(page,selector=>document.querySelector(selector)?.getAttribute('data-pair-audio-phase')==='paused'&&
      window.__P055_NATURAL_AUDIO_TRACE.active===0,RUNTIME,5000);
    record.observations.push(await snapshot(page,'paused-before-close'));
    assert.deepEqual(record.errors,[]);assert.deepEqual(record.warnings,[]);
    assert.ok(record.requests.every(request=>request.allowed));
    record.status='natural-end-candidate-probe-passed-not-acceptance';
  }catch(error){
    record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
    if(page){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});
      record.failureState=await snapshot(page,'failure').catch(()=>null);
      record.failureAt=await page.evaluate(()=>performance.now()).catch(()=>null);
      record.elapsedAtFailureMs=record.playClickedAt===undefined?null:record.failureAt-record.playClickedAt;
      record.failureDom=await page.locator('body').innerText().catch(()=>null);}
  }finally{
    await context?.close().catch(()=>{});await browser?.close().catch(()=>{});
    record.closedAt=new Date().toISOString();record.inputsAfter=await pins();
    record.inputsUnchanged=JSON.stringify(inputsBefore)===JSON.stringify(record.inputsAfter);
    const sourceAfter=await readFile(SOURCE);record.sourceUnchanged=sha(sourceAfter)===SOURCE_SHA&&sourceAfter.length===149059;
    if(!record.inputsUnchanged||!record.sourceUnchanged)record.status='failed';
    await writeFile(path.join(output,'evidence.json'),json(record),{flag:'wx'});
    console.log(JSON.stringify({output,status:record.status,step:record.step,
      elapsedToTerminalMs:record.elapsedToTerminalMs,failure:record.failure?.message}));
  }
  return record;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run(process.argv.slice(2)).then(result=>{process.exitCode=result.status==='natural-end-candidate-probe-passed-not-acceptance'?0:1;})
    .catch(error=>{console.error(error);process.exitCode=1;});
