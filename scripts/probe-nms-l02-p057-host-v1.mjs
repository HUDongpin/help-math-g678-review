#!/usr/bin/env node
/** Local P057 My Lesson candidate probe. --plan does not start a browser. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='shared-nms002-l02-p057',NEXT='shared-nms002-l02-p058';
const SOURCE='9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa';
const AUDIO={name:'main.mp3',bytes:134290,
  sha256:'c87ebf7d1117a616ebddd6b3530a7b19c50dfd885bc5e2734817657da026c2dc',
  sampleRate:22050,channels:1,decodedSamples:595008};
const HOST='[data-lesson-player][data-current-animation-id]';
const RUNTIME=`${HOST} [data-pair-page="${ID}"]`;
const SOURCE_CONTROLS=`${RUNTIME} [data-source-animation-id="${ID}"]`;
const FRAME=`${RUNTIME}[data-pair-frame]`;
const ASSET_PATH='/migration-assets/nms-l02-p057/main.mp3';
/** Exact P057_CONTROLS projection in nms-l02-p057-semantic-v1.ts. */
const TERMS=Object.freeze([
  {label:'Solve',key:'Solve',entry:'solve',id:'sprite-66/depth-18/generation-1',firstFrame:12},
  {label:'problem',key:'Problem',entry:'problem',id:'sprite-66/depth-20/generation-1',firstFrame:12},
  {label:'Strategies',key:'Strategies',entry:'strategies',id:'sprite-66/depth-25/generation-1',firstFrame:77},
  {label:'equation',key:'Equation',entry:'equation',id:'sprite-66/depth-110/generation-1',firstFrame:103},
  {label:'pattern',key:'Pattern',entry:'pattern',id:'sprite-66/depth-112/generation-1',firstFrame:103},
  {label:'table',key:'Table',entry:'table',id:'sprite-66/depth-114/generation-1',firstFrame:103},
  {label:'simpler',key:'Simple / Simpler / Simplest',entry:'simple-simpler-simplest',
    id:'sprite-66/depth-116/generation-1',firstFrame:103},
]);
const FRAMES=Object.freeze([1,11,12,34,35,42,43,76,77,102,103,265,266,275,328]);
const CASES=Object.freeze([
  {name:'en-desktop',locale:'en',width:1440,height:900,reduced:false},
  {name:'es-desktop',locale:'es',width:1440,height:900,reduced:false},
  {name:'en-mobile',locale:'en',width:390,height:844,reduced:false},
  {name:'es-mobile',locale:'es',width:390,height:844,reduced:false},
  {name:'en-desktop-reduced',locale:'en',width:1440,height:900,reduced:true},
  {name:'es-mobile-reduced',locale:'es',width:390,height:844,reduced:true},
]);
const INPUTS=Object.freeze([
  'scripts/probe-nms-l02-p057-host-v1.mjs',
  'apps/web/lib/nms-l02-p056-admission-activation.ts',
  'apps/web/lib/nms-l02-p056-admission.server.ts',
  'apps/web/lib/nms-l02-admission-activation.ts',
  'catalog/nms-l02-admission-v1/host-v6.json',
  'apps/web/lib/g678-preview-policy.ts',
  'apps/web/lib/nms-l02-source-resource-host.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p057/page.tsx',
  'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
  'apps/web/components/g678-nms-l02-p057-candidate-lesson-v1.generated.tsx',
  'apps/web/components/nms-l02-p057-lesson-runtime-v1.tsx',
  'apps/web/components/nms-l02-p057-host-v1.css',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'apps/web/lib/nms-l02-p057-candidate-descriptor-v1.ts',
  'apps/web/lib/nms-l02-p057-assets.server.ts',
  'apps/web/app/migration-assets/nms-l02-p057/[asset]/route.ts',
  'packages/demos/src/nms-l02-p057-product-module-v1.tsx',
  'packages/demos/src/nms-l02-p057-product-renderer-v1.tsx',
  'packages/demos/src/nms-l02-p057-product-text-v1.ts',
  'packages/demos/src/nms-l02-p057-semantic-v1.ts',
  'packages/demos/src/generated/nms-l02-p057-display-list-v1.ts',
  'packages/demos/src/generated/nms-l02-p057-terms-v1.ts',
  'packages/demos/src/timelines/shared-nms002-l02-p057-display-list.ts',
  'packages/demos/src/source-glossary-controls.tsx',
  'packages/demos/src/source-glossary-session.ts',
  'packages/demos/src/source-linear-audio.ts',
  'packages/demos/src/alg-l12-glossary-pair-audio-loader.ts',
  'output/nms-l02-p057-source-20260927/source-audit.json',
  'output/nms-l02-p057-glossary-20260927/receipt.json',
  'output/nms-l02-p057-audio-20260927/raw-index-v1.json',
  'output/nms-l02-p057-audio-20260927/embedded-source-stream-v1.mp3',
  '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS04.swf',
  '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/index.xml',
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
  assert.ok((argv.length===2||argv.length===4)&&argv[0]==='--run'&&
    /^[a-z0-9][a-z0-9-]{0,63}$/u.test(argv[1]??''),
    'Usage: --plan | --run <unique-slug> [--base-url http://127.0.0.1:<port>]');
  assert.ok(argv.length===2||argv[2]==='--base-url','Only --base-url is supported');
  const url=new URL(argv[3]??'http://127.0.0.1:3331');
  assert.ok(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&/^\d+$/u.test(url.port)&&
    !url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash,
    'Probe accepts one explicit loopback HTTP origin');
  return{plan:false,runName:argv[1],base:url.origin};
}
function plan(){return{
  kind:'nms-l02-p057-candidate-host-probe-plan-v1',animationId:ID,sourceSwfSha256:SOURCE,
  route:'/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p057',
  stage:'unregistered-probe',registeredPredecessorCount:56,activePageCount:64,unregisteredCandidateCount:1,
  cases:CASES,frames:FRAMES,terms:TERMS,audio:AUDIO,
  hooks:{host:HOST,runtime:RUNTIME,sourceControls:SOURCE_CONTROLS,
    timeline:'input[data-responsive-focus-key="timeline"]:visible',
    map:'button[data-responsive-focus-key="map"]:visible',
    replay:'button[data-responsive-focus-key="replay"]:visible',
    dialog:'[role="dialog"][data-glossary-entry-id]',
    unavailableNext:`${HOST}[data-current-animation-id="${NEXT}"]`},
  checks:['local noindex route and separate 56/64 registered plus one candidate',
    'no automatic audio playback, including reduced motion',
    'source frame/control and semantic transitions at all listed frames',
    'all seven exact source-key glossary dialogs pause and restore focus',
    'Replay never overlaps source-audio nodes',
    'one exact verified main.mp3 response (134290 bytes, SHA-256), same-origin only',
    'P058 remains unavailable; navigation and return stop prior audio',
    'six isolated EN/ES desktop/mobile/reduced-motion contexts'],
  execution:'--plan is static; root coordinates the later --run after local candidate activation.',
};}
async function pins(){return Promise.all(INPUTS.map(async relative=>{
  const file=path.isAbsolute(relative)?relative:path.join(ROOT,relative);
  const bytes=await readFile(file);
  return{path:relative,bytes:bytes.length,sha256:sha(bytes)};
}));}
async function save(file,value){await writeFile(file,json(value),{flag:'wx'});}
const controlsAt=frame=>TERMS.filter(term=>frame>=term.firstFrame);
async function waitFrame(page,frame){
  await page.waitForFunction(({selector,frame})=>document.querySelector(selector)?.getAttribute('data-pair-frame')===String(frame),
    {selector:FRAME,frame});
  await page.locator(`${RUNTIME} [data-canvas-status="ready"]`).waitFor();
}
async function inspect(page,frame){
  const range=page.locator('input[data-responsive-focus-key="timeline"]:visible').first();
  await range.waitFor();assert.equal(await range.getAttribute('max'),'328');
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
    const product=r?.querySelector('.nms-p057-product');
    return{animationId:h?.getAttribute('data-current-animation-id'),availability:h?.getAttribute('data-renderer-availability'),
      frame:r?.getAttribute('data-pair-frame'),ready:r?.getAttribute('data-pair-ready'),
      paused:r?.getAttribute('data-runtime-paused'),audioPhase:r?.getAttribute('data-pair-audio-phase'),
      canvasStatus:product?.getAttribute('data-canvas-status'),controlCount:c?.getAttribute('data-source-control-count'),
      controls:[...(c?.querySelectorAll('button[data-source-instance-id]')??[])].map(x=>({
        id:x.getAttribute('data-source-instance-id'),key:x.getAttribute('data-source-key-attribute'),
        label:x.textContent?.trim(),disabled:x.disabled,
        width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})),
      heading:!!product?.querySelector('h2[data-source-text-id="14 15"]'),
      highlighted:[...(product?.querySelectorAll('h2 [data-source-key]')??[])].filter(x=>x.style.color!=='')
        .map(x=>x.getAttribute('data-source-key')),
      strategies:!!product?.querySelector('[data-source-text-id="23"]'),
      left:!!product?.querySelector('[data-source-text-group="79-positioned-glyphs"]'),
      right:!!product?.querySelector('[data-source-text-id="59"]'),
      finalPrompt:!!product?.querySelector('[data-source-text-id="64"]'),
      audio:{...window.__P057_HOST_AUDIO_TRACE},
      overflow:document.documentElement.scrollWidth>window.innerWidth+1};
  },{host:HOST,runtime:RUNTIME,controls:SOURCE_CONTROLS});
  return{label,...state};
}
function checkFrame(state,frame){
  const expected=controlsAt(frame);
  assert.equal(Number(state.frame),frame);
  assert.equal(state.ready,'true');assert.equal(state.canvasStatus,'ready');
  assert.equal(state.controlCount,String(expected.length));
  assert.deepEqual(state.controls.map(x=>({id:x.id,key:x.key,label:x.label})),
    expected.map(x=>({id:x.id,key:x.key,label:x.label})));
  assert.ok(state.controls.every(x=>!x.disabled&&x.width>=44&&x.height>=44),'Source controls need 44px targets');
  assert.equal(state.overflow,false,'Modern host must fit viewport width');
  assert.equal(state.heading,frame>=6);
  assert.equal(state.strategies,frame>=68);
  assert.equal(state.left,frame>=98);
  assert.equal(state.right,frame>=98);
  assert.equal(state.finalPrompt,frame>=267);
  const highlighted=frame===34?['Solve']:frame===42?['Problem']:[];
  assert.deepEqual(state.highlighted,highlighted,'Source-timed word emphasis');
}
async function clickKey(page,key){
  const button=page.locator(`button[data-responsive-focus-key="${key}"]:visible`).first();
  await button.scrollIntoViewIfNeeded();await button.click();
}
async function openTerm(page,term,locale,record,output){
  const trigger=page.locator(`${SOURCE_CONTROLS} button[data-source-instance-id="${term.id}"]`);
  if(term.entry==='solve')assert.equal((await page.evaluate(()=>window.__P057_HOST_AUDIO_TRACE)).active,1,
    'First glossary opening must interrupt source audio');
  await trigger.click();
  const dialog=page.locator(`[role="dialog"][data-glossary-entry-id="${term.entry}"]`);
  await dialog.waitFor();
  assert.equal(await dialog.getAttribute('data-source-key-attribute'),term.key);
  assert.match(await dialog.getAttribute('data-source-sha256'),/^[a-f0-9]{64}$/u);
  assert.equal(await dialog.getAttribute('data-glossary-storage'),'memory-only');
  assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
  const held=await page.locator(RUNTIME).getAttribute('data-pair-frame');
  await page.waitForTimeout(250);
  assert.equal(await page.locator(RUNTIME).getAttribute('data-pair-frame'),held);
  assert.equal((await page.evaluate(()=>window.__P057_HOST_AUDIO_TRACE)).active,0);
  record.dialogs.push({entry:term.entry,key:term.key,frame:held,sourceSha256:await dialog.getAttribute('data-source-sha256'),
    text:await dialog.innerText()});
  await page.screenshot({path:path.join(output,`${record.name}-${term.entry}-dialog.png`),fullPage:true});
  await dialog.getByRole('button',{name:locale==='es'?'Cerrar y continuar':'Close and continue',exact:true}).click();
  await dialog.waitFor({state:'detached'});
  await page.waitForFunction(selector=>document.activeElement===document.querySelector(selector),
    `${SOURCE_CONTROLS} button[data-source-instance-id="${term.id}"]`);
  assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true');
}

export async function run(argv){
  const options=parseArgs(argv);
  if(options.plan){const value=plan();console.log(json(value));return value;}
  const output=path.join(ROOT,'output/nms-l02-p057-product-20260927/browser',options.runName);
  const before=await pins();
  const source=before.find(x=>x.sha256===SOURCE),audio=before.find(x=>x.path==='output/nms-l02-p057-audio-20260927/embedded-source-stream-v1.mp3');
  assert.ok(source&&source.bytes===137055,'Exact P057 source SWF required');
  assert.deepEqual({bytes:audio?.bytes,sha256:audio?.sha256},{bytes:AUDIO.bytes,sha256:AUDIO.sha256});
  await mkdir(path.dirname(output),{recursive:true});await mkdir(output);
  const result={...plan(),status:'running',base:options.base,startedAt:new Date().toISOString(),
    inputsBefore:before,records:[],cleanupErrors:[],formal:false};
  let browser,server;
  try{
    server=await chromium.launchServer({headless:true,channel:'chrome',host:'127.0.0.1'});
    browser=await chromium.connect(server.wsEndpoint());result.browserVersion=browser.version();
    for(const config of CASES){
      const record={...config,status:'running',step:'initial',response:{status:null},ready:false,formal:false,
        observations:[],dialogs:[],errors:[],warnings:[],requests:[],assetResponses:[]};
      result.records.push(record);
      const context=await browser.newContext({viewport:{width:config.width,height:config.height},
        deviceScaleFactor:1,isMobile:config.width<500,hasTouch:config.width<500,
        locale:config.locale==='es'?'es-ES':'en-US',reducedMotion:config.reduced?'reduce':'no-preference',
        serviceWorkers:'block'});
      await context.route('**/*',route=>{
        const url=new URL(route.request().url()),allowed=url.origin===options.base;
        record.requests.push({path:allowed?url.pathname:url.origin,allowed,method:route.request().method()});
        return allowed?route.continue():route.abort();
      });
      await context.addInitScript(({assetPath})=>{
        const receipts=[];Object.defineProperty(window,'__P057_AUDIO_RECEIPTS',{value:receipts});
        const nativeFetch=window.fetch;
        window.fetch=async function(...args){
          const response=await nativeFetch.apply(this,args);
          if(new URL(response.url,location.origin).pathname===assetPath){
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
        Object.defineProperty(window,'__P057_HOST_AUDIO_TRACE',{value:trace});
        const proto=AudioBufferSourceNode.prototype,start=proto.start,stop=proto.stop,active=new WeakSet();
        const finish=node=>{if(active.has(node)){active.delete(node);trace.active--;trace.stopped++;}};
        proto.start=function(...args){const value=start.apply(this,args);if(!active.has(this)){
          active.add(this);trace.active++;trace.started++;trace.maxActive=Math.max(trace.maxActive,trace.active);
          this.addEventListener('ended',()=>finish(this),{once:true});}return value;};
        proto.stop=function(...args){const value=stop.apply(this,args);finish(this);return value;};
      },{assetPath:ASSET_PATH});
      const page=await context.newPage();page.setDefaultTimeout(25000);
      page.on('pageerror',error=>record.errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());
        if(message.type()==='warning')record.warnings.push(message.text());});
      page.on('response',response=>{if(new URL(response.url()).pathname===ASSET_PATH)
        record.assetResponses.push({status:response.status(),url:response.url(),contentType:response.headers()['content-type']});});
      try{
        record.step='entry';
        const response=await page.goto(`${options.base}/${config.locale}/migration-status/g678-calibration/${ID}`,
          {waitUntil:'domcontentloaded',timeout:90000});
        record.response={status:response?.status()??null,url:response?.url()??null};
        assert.equal(record.response.status,200,'P057 local candidate route must be active');
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/u);
        const main=page.locator('main[data-p057-current-js]');await main.waitFor();
        assert.equal(await main.getAttribute('data-p057-current-js'),'unregistered-probe');
        const body=await main.innerText();
        assert.match(body,config.locale==='es'?/bancos L2.*no están verificados/u:/L2 banks.*unverified/u);
        const disclosure=await page.locator('[aria-label="Evidence boundary"], [aria-label="Límite de evidencia"]').innerText();
        assert.match(disclosure,/56\/64/u);
        assert.match(disclosure,config.locale==='es'?/1 páginas candidatas sin registrar/u:/1 unregistered candidate pages/u);
        await page.locator(`${RUNTIME}[data-pair-ready="true"] [data-canvas-status="ready"]`).waitFor();
        record.ready=true;
        assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'registered');
        assert.equal(await page.locator(`${RUNTIME} .nms-p057-product`).getAttribute('lang'),'en');
        if(config.locale==='es')assert.match(await page.locator(RUNTIME).innerText(),/inglés/u);
        const initialFrame=config.reduced?328:1;await waitFrame(page,initialFrame);
        let state=await observe(page,'entry');record.observations.push(state);checkFrame(state,initialFrame);
        assert.deepEqual(state.audio,{active:0,maxActive:0,started:0,stopped:0},'Entry must not autoplay');
        await page.screenshot({path:path.join(output,`${record.name}-entry.png`),fullPage:true});

        record.step='source-boundaries';
        for(const frame of FRAMES){
          await inspect(page,frame);
          state=await observe(page,`frame-${frame}`);record.observations.push(state);checkFrame(state,frame);
          if([12,77,103,275,328].includes(frame))
            await page.screenshot({path:path.join(output,`${record.name}-frame-${frame}.png`),fullPage:true});
        }
        record.step='resume-before-glossary';
        await inspect(page,103);
        await clickKey(page,'pause');
        await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-pair-audio-phase')==='playing',RUNTIME);
        await page.waitForFunction(()=>window.__P057_HOST_AUDIO_TRACE.active===1);
        for(const term of TERMS){record.step=`glossary-${term.entry}`;await openTerm(page,term,config.locale,record,output);}

        record.step='replay';
        let started=(await page.evaluate(()=>window.__P057_HOST_AUDIO_TRACE)).started;
        await clickKey(page,'replay');
        await page.waitForFunction(previous=>window.__P057_HOST_AUDIO_TRACE.started>previous&&
          window.__P057_HOST_AUDIO_TRACE.active===1,started);
        started=(await page.evaluate(()=>window.__P057_HOST_AUDIO_TRACE)).started;
        await clickKey(page,'replay');
        await page.waitForFunction(previous=>window.__P057_HOST_AUDIO_TRACE.started>previous&&
          window.__P057_HOST_AUDIO_TRACE.active===1,started);
        state=await observe(page,'replay-twice');record.observations.push(state);
        assert.equal(state.audio.maxActive,1,'Replay must never overlap source-audio nodes');

        record.step='unavailable-p058';
        await clickKey(page,'map');
        await page.locator(`button[data-placement-id="${NEXT}"]`).click();
        await page.locator(`${HOST}[data-current-animation-id="${NEXT}"]`).waitFor();
        assert.equal(await page.locator(HOST).getAttribute('data-renderer-availability'),'unavailable');
        await page.waitForFunction(selector=>document.querySelector(selector)===null,RUNTIME);
        await page.waitForFunction(()=>window.__P057_HOST_AUDIO_TRACE.active===0);
        assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
        record.nextPage={animationId:NEXT,availability:'unavailable',audio:await page.evaluate(()=>({...window.__P057_HOST_AUDIO_TRACE}))};
        await page.screenshot({path:path.join(output,`${record.name}-p058.png`),fullPage:true});
        record.step='return';
        await clickKey(page,'map');await page.locator(`button[data-placement-id="${ID}"]`).click();
        await page.locator(`${HOST}[data-current-animation-id="${ID}"]`).waitFor();
        await page.locator(`${RUNTIME}[data-pair-ready="true"]`).waitFor();
        state=await observe(page,'returned');record.observations.push(state);
        assert.equal(await page.locator(RUNTIME).count(),1);
        assert.equal(state.audio.active,0,'Return must not resume stale audio');
        assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
        await page.waitForFunction(()=>window.__P057_AUDIO_RECEIPTS.length>0);
        record.audioResponses=await page.evaluate(()=>window.__P057_AUDIO_RECEIPTS);
        assert.ok(record.audioResponses.every(x=>x.status===200&&x.bytes===AUDIO.bytes&&
          x.contentType==='audio/mpeg'&&x.sha256===AUDIO.sha256));
        assert.ok(record.assetResponses.length>0&&record.assetResponses.every(x=>x.status===200&&
          x.contentType==='audio/mpeg'&&new URL(x.url).origin===options.base&&
          new URL(x.url).search===`?sha256=${AUDIO.sha256}`));
        assert.deepEqual(record.errors,[]);assert.deepEqual(record.warnings,[]);
        assert.ok(record.requests.every(x=>x.allowed));
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
        console.log(JSON.stringify({case:record.name,status:record.status,responseStatus:record.response.status,
          ready:record.ready,formal:record.formal,failure:record.failure?.message}));
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
  result.passed=!result.failure&&result.cleanupErrors.length===0&&result.browserProcessExited===true&&
    result.records.length===CASES.length&&result.records.every(r=>r.status==='candidate-host-functional-probe-passed-not-acceptance'&&
      r.response.status===200&&r.ready===true&&r.formal===false)&&result.inputsUnchanged;
  result.status=result.passed?'candidate-host-functional-probe-passed-not-acceptance':'failed';
  result.finishedAt=new Date().toISOString();await save(path.join(output,'evidence.json'),result);
  console.log(JSON.stringify({output,status:result.status,inputsUnchanged:result.inputsUnchanged}));
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run(process.argv.slice(2)).then(result=>{if(result.passed===false){process.exitCode=1;if(result.cleanupErrors?.length)process.exit(1);}})
    .catch(error=>{console.error(error);process.exitCode=1;});
