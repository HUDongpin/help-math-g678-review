#!/usr/bin/env node
/** Local My Lesson probe for candidate and registered P056 admission. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='shared-nms002-l02-p056',P057='shared-nms002-l02-p057';
const SOURCE='a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be';
const HOST='[data-lesson-player][data-current-animation-id]';
const RUNTIME=`${HOST} [data-pair-page="${ID}"]`;
const SOURCE_CONTROLS=`${RUNTIME} [data-source-animation-id="${ID}"]`;
const FRAME=`${RUNTIME}[data-pair-frame]`;
const TERMS=Object.freeze([
 {label:'Organize',key:'Organize',entry:'organize',id:'sprite-24/depth-16/generation-1',firstFrame:17},
 {label:'information',key:'Information',entry:'information',id:'sprite-24/depth-18/generation-1',firstFrame:17},
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
  'scripts/probe-nms-l02-p056-host-registered-v1.mjs',
  'apps/web/lib/nms-l02-p056-admission-activation.ts',
  'apps/web/lib/nms-l02-p056-admission.server.ts',
  'catalog/nms-l02-admission-v1/host-v6.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p056-v1.json',
  'apps/web/lib/nms-l02-source-resource-host.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p056/page.tsx',
  'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
  'apps/web/components/g678-nms-l02-p056-candidate-lesson-v1.generated.tsx',
  'apps/web/components/nms-l02-p056-lesson-runtime-v1.tsx',
  'apps/web/components/nms-l02-p056-host-v1.css',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'packages/demos/src/nms-l02-p056-product-renderer-v1.tsx',
  'packages/demos/src/nms-l02-p056-product-module-v1.tsx',
  'packages/demos/src/nms-l02-p056-product-text-v1.ts',
  'packages/demos/src/nms-l02-p056-product-controls-v1.ts',
  'packages/demos/src/generated/nms-l02-p056-terms-v1.ts',
  'apps/web/lib/nms-l02-p056-candidate-descriptor-v1.ts',
  'apps/web/lib/nms-l02-p056-assets.server.ts',
  'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
  'packages/demos/src/source-glossary-controls.tsx',
  'packages/demos/src/source-glossary-session.ts',
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
async function bounded(operation,label,ms=6000){
 let timer;
 try{return await Promise.race([operation,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error(`Probe timeout: ${label}`)),ms);
 })]);}finally{clearTimeout(timer);}
}


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
  kind:'nms-l02-p056-candidate-host-probe-plan-v1',animationId:ID,sourceSwfSha256:SOURCE,
  route:'/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p056',
  cases:CASES,terms:TERMS,
  hooks:{host:HOST,runtime:RUNTIME,sourceControls:SOURCE_CONTROLS,
    timeline:'input[data-responsive-focus-key="timeline"]:visible',
    map:'button[data-responsive-focus-key="map"]:visible',
    replay:'button[data-responsive-focus-key="replay"]:visible',
    dialog:'[role="dialog"][data-glossary-entry-id]',
    oldPage:`${HOST}[data-current-animation-id="${P057}"]`},
  checks:['local route and noindex','candidate count separate from registered count',
    'English source disclosure in both locales','source controls at frames 1, 16, 17, and 234',
    'glossary source key, pause, close, and focus return','Replay one active Web Audio source',
    'unavailable P057 preserves source order and stops P056 audio on navigation','reduced-motion parked terminal frame'],
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
  assert.equal(await range.getAttribute('max'),'234');
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
      audio:window.__P056_HOST_AUDIO_TRACE,
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
  if(term.entry==='organize')assert.equal((await page.evaluate(()=>window.__P056_HOST_AUDIO_TRACE)).active,1,
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
  assert.equal((await page.evaluate(()=>window.__P056_HOST_AUDIO_TRACE)).active,0,'Glossary must stop source audio');
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
  const output=path.join(ROOT,'output/nms-l02-p056-product-20260927/browser',options.runName);
  const before=await pins();
  await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
  const result={...plan(),status:'running',base:options.base,expectedStage:options.stage,
    startedAt:new Date().toISOString(),inputs:before,records:[]};
  let browser,server;
  result.cleanupErrors=[];
  try{
    server=await chromium.launchServer({headless:true,channel:'chrome',host:'127.0.0.1'});
    browser=await chromium.connect(server.wsEndpoint());
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
        const receipts=[];Object.defineProperty(window,'__P056_AUDIO_RECEIPTS',{value:receipts});
        const nativeFetch=window.fetch;
        window.fetch=async function(...args){
          const response=await nativeFetch.apply(this,args);
          if(new URL(response.url,location.origin).pathname==='/migration-assets/nms-l02-p056/main.mp3'){
            const clone=response.clone();
            void clone.arrayBuffer().then(async bytes=>{
              const digest=await crypto.subtle.digest('SHA-256',bytes);
              receipts.push({status:response.status,bytes:bytes.byteLength,contentType:response.headers.get('content-type'),
                sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')});
            }).catch(error=>receipts.push({error:String(error)}));
          }
          return response;
        };
        const trace={active:0,maxActive:0,started:0,stopped:0};
        Object.defineProperty(window,'__P056_HOST_AUDIO_TRACE',{value:trace});
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
        assert.equal(response?.status(),200,'P056 host must be separately activated before this probe');
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
        const main=page.locator('main[data-p056-current-js]');await main.waitFor();
        assert.equal(await main.getAttribute('data-p056-current-js'),options.stage==='candidate'?'unregistered-probe':'registered');
        const body=await main.innerText(),disclosure=await page.locator('[aria-label="Evidence boundary"], [aria-label="Límite de evidencia"]').innerText();
        assert.match(body,config.locale==='es'?/bancos L2.*no están verificados/u:/L2 banks.*unverified/u);
        assert.match(disclosure,new RegExp(`${options.stage==='candidate'?55:56}/64`));
        assert.match(disclosure,config.locale==='es'
          ?new RegExp(`${options.stage==='candidate'?1:0} páginas candidatas sin registrar`)
          :new RegExp(`${options.stage==='candidate'?1:0} unregistered candidate pages`));
        await page.locator(`${RUNTIME}[data-pair-ready="true"]`).waitFor();
        await page.locator(`${RUNTIME} [data-canvas-status="ready"]`).waitFor();
        assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
        assert.equal(await page.locator(`${RUNTIME} .nms-p056-product`).getAttribute('lang'),'en');
        if(config.locale==='es')assert.match(await page.locator(RUNTIME).innerText(),/inglés|English/u);
        const initialFrame=config.reduced?234:1;await waitFrame(page,initialFrame);
        let state=await observe(page,'entry');record.observations.push(state);checkControls(state,initialFrame);
        assert.equal(state.audio.active,0,'Entry must not start source audio');
        await page.screenshot({path:path.join(output,`${record.name}-entry.png`),fullPage:true});

        record.step='source-controls';
        await inspect(page,16);state=await observe(page,'frame-16');record.observations.push(state);checkControls(state,16);
        await inspect(page,17);state=await observe(page,'frame-17');record.observations.push(state);checkControls(state,17);
        await page.screenshot({path:path.join(output,`${record.name}-frame-17.png`),fullPage:true});
        record.step='resume-before-glossary';await clickKey(page,'pause');
        await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-pair-audio-phase')==='playing',RUNTIME);
        await page.waitForFunction(()=>window.__P056_HOST_AUDIO_TRACE.active===1);
        for(const term of TERMS){record.step=`glossary-${term.entry}`;await openTerm(page,term,config.locale,record,output);}

        record.step='replay';await clickKey(page,'replay');
        await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-pair-audio-phase')==='playing',RUNTIME);
        await page.waitForFunction(()=>window.__P056_HOST_AUDIO_TRACE.active===1);
        await clickKey(page,'replay');
        await page.waitForFunction(()=>window.__P056_HOST_AUDIO_TRACE.started>=2&&window.__P056_HOST_AUDIO_TRACE.active===1);
        state=await observe(page,'replay-twice');record.observations.push(state);
        assert.equal(state.audio.maxActive,1,'Replay must never overlap two source-audio nodes');

        record.step='old-page';await clickKey(page,'map');
        await page.locator(`button[data-placement-id="${P057}"]`).click();
        await page.locator(`${HOST}[data-current-animation-id="${P057}"]`).waitFor();
        assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'unavailable');
        await page.waitForFunction(selector=>document.querySelector(selector)===null,RUNTIME);
        await page.waitForFunction(()=>window.__P056_HOST_AUDIO_TRACE.active===0);
        assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
        record.oldPage={animationId:P057,availability:'unavailable',audio:await page.evaluate(()=>window.__P056_HOST_AUDIO_TRACE)};
        await page.screenshot({path:path.join(output,`${record.name}-p057.png`),fullPage:true});
        record.step='return';await clickKey(page,'map');
        await page.locator(`button[data-placement-id="${ID}"]`).click();
        await page.locator(`${HOST}[data-current-animation-id="${ID}"]`).waitFor();
        await page.locator(`${RUNTIME}[data-pair-ready="true"]`).waitFor();
        state=await observe(page,'returned');record.observations.push(state);
        assert.equal(await page.locator(RUNTIME).count(),1,'Return must mount one P056 runtime');
        assert.equal(state.audio.active,0,'Return must not resume stale audio');
        assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
        await page.waitForFunction(()=>window.__P056_AUDIO_RECEIPTS.length>0);
        record.audioResponses=await page.evaluate(()=>window.__P056_AUDIO_RECEIPTS);
        assert(record.audioResponses.length>=1,'Real browser must fetch the source audio');
        assert(record.audioResponses.every(r=>r.status===200&&r.bytes===95290&&r.contentType==='audio/mpeg'&&
          r.sha256==='6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811'));
        assert.deepEqual(record.errors,[]);assert.deepEqual(record.warnings,[]);
        assert.ok(record.requests.every(request=>request.allowed),'No external origin is used');
        record.status='candidate-host-functional-probe-passed-not-acceptance';
      }catch(error){
        record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
        await page.screenshot({path:path.join(output,`${record.name}-failure.png`),fullPage:true}).catch(()=>{});
        record.failureDom=await page.locator('body').innerText().catch(()=>null);
      }finally{
        await bounded(context.close(),`${record.name} context close`).catch(error=>{
          record.status='failed';result.cleanupErrors.push(error.message);
        });
        await save(path.join(output,`${record.name}.json`),record);
        console.log(JSON.stringify({case:record.name,status:record.status,failure:record.failure?.message}));
      }
    }
  }catch(error){result.failure={message:error.message,stack:error.stack};}
  finally{
    if(browser)await bounded(browser.close(),'browser disconnect').catch(error=>result.cleanupErrors.push(error.message));
    if(server){
      try{await bounded(server.close(),'owned browser process close',10000);result.browserProcessCleanup='closed';}
      catch(error){
        result.browserProcessCloseNote=error.message;
        try{await bounded(server.kill(),'owned browser process kill',10000);result.browserProcessCleanup='terminated-after-close-timeout';}
        catch(killError){
          result.browserProcessKillNote=killError.message;
          if(server.process().exitCode!==null||server.process().signalCode!==null)
            result.browserProcessCleanup='process-exit-confirmed-after-kill-promise-timeout';
          else result.cleanupErrors.push(killError.message);
        }
      }
      result.browserProcessExited=server.process().exitCode!==null||server.process().signalCode!==null;
      if(!result.browserProcessExited)result.cleanupErrors.push('Owned browser process exit unverified');
    }
  }
  result.inputsAfter=await pins();result.inputsUnchanged=JSON.stringify(before)===JSON.stringify(result.inputsAfter);
  result.passed=!result.failure&&result.cleanupErrors.length===0&&result.browserProcessExited===true&&result.records.length===CASES.length&&result.records.every(r=>r.status==='candidate-host-functional-probe-passed-not-acceptance')&&result.inputsUnchanged;
  result.status=result.passed?'candidate-host-functional-probe-passed-not-acceptance':'failed';
  result.finishedAt=new Date().toISOString();await save(path.join(output,'evidence.json'),result);
  console.log(JSON.stringify({output,status:result.status,inputsUnchanged:result.inputsUnchanged}));
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run(process.argv.slice(2)).then(result=>{if(result.passed===false){process.exitCode=1;if(result.cleanupErrors?.length)process.exit(1);}})
    .catch(error=>{console.error(error);process.exitCode=1;});
