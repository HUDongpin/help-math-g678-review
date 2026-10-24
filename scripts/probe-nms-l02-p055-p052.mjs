#!/usr/bin/env node
/** Real Chrome continuity probe: P055 My Lesson map -> existing P052 runtime. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {P052_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUTPUT=path.join(ROOT,'output/nms-l02-host-successor-20260927/p052-continuity');
const ORIGIN='http://127.0.0.1:3331';
const P055='shared-nms002-l02-p055',P052='shared-nms002-l02-p052';
const HOST='[data-lesson-player][data-current-animation-id]';
const P052_RUNTIME=`[data-source-percent-practice-runtime="${P052}"]`;
const AUDIO_PREFIX=`/flash-assets/g678-local/${P052}/source-audio/`;
const INPUTS=[
  'scripts/probe-nms-l02-p055-p052.mjs',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p055/page.tsx',
  'apps/web/components/g678-nms-l02-successor-lesson.tsx',
  'apps/web/components/nms-l02-p052-source-runtime-v1.tsx',
  'packages/demos/src/nms-l02-p052-player-v1.tsx',
  'packages/demos/src/nms-l02-p052-browser-controller-v1.ts',
  'packages/demos/src/nms-l02-p052-audio-loader-v1.ts',
  'packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts',
  'apps/web/lib/nms-l02-p052-audio-access.ts',
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const audioPath=url=>new URL(url).pathname.startsWith(AUDIO_PREFIX);
async function pinInputs(){return Promise.all(INPUTS.map(async name=>{
  const bytes=await readFile(path.join(ROOT,name));return{path:name,bytes:bytes.length,sha256:sha(bytes)};
}));}
function parseArgs(argv){
  assert.equal(argv.length,1,'Usage: node --import tsx scripts/probe-nms-l02-p055-p052.mjs <unique-slug>');
  assert.match(argv[0],/^[a-z0-9][a-z0-9-]{0,63}$/u);
  return argv[0];
}
async function observe(page){return page.evaluate(({host,runtime})=>{
  const h=document.querySelector(host),r=document.querySelector(runtime),p=r?.querySelector('.p052-player');
  const key=name=>[...document.querySelectorAll(`button[data-responsive-focus-key="${name}"]`)]
    .find(button=>button.getClientRects().length>0);
  const button=name=>{const b=key(name);return b?{text:b.textContent?.trim(),ariaLabel:b.getAttribute('aria-label'),disabled:b.disabled}:null;};
  return{currentAnimationId:h?.getAttribute('data-current-animation-id'),rendererAvailability:h?.getAttribute('data-renderer-availability'),
    runtimeMounted:!!r,playerMounted:!!p,phase:p?.getAttribute('data-p052-player-phase'),
    audioLoading:p?.getAttribute('data-p052-audio-loading'),failure:document.querySelector('[data-p052-failure]')?.getAttribute('data-p052-failure'),
    alerts:[...document.querySelectorAll('[role="alert"]')].map(x=>x.textContent?.trim()).filter(Boolean),
    replay:button('replay'),playPause:button('pause'),audioTrace:window.__P052_CONTINUITY_AUDIO_TRACE};
 },{host:HOST,runtime:P052_RUNTIME});}
async function verifyAudioResponse(response){
  const url=new URL(response.url()),domain=url.pathname.slice(AUDIO_PREFIX.length);
  assert.ok(Object.hasOwn(P052_AUDIO_PLANS,domain),`Unpinned P052 audio domain: ${domain}`);
  const plan=P052_AUDIO_PLANS[domain];
  assert.equal(url.origin,ORIGIN);assert.equal(url.search,`?sha256=${plan.inputSha256}`);
  assert.equal(response.status(),200,`P052 source audio HTTP status for ${domain}`);
  assert.equal(response.headers()['content-type'],'audio/mpeg');
  assert.equal(Number(response.headers()['content-length']),plan.inputBytes);
  const bytes=await response.body();
  assert.equal(bytes.length,plan.inputBytes);assert.equal(sha(bytes),plan.inputSha256);
  return{domain,path:url.pathname,sha256:sha(bytes),bytes:bytes.length,status:response.status(),
    contentType:response.headers()['content-type']};
}
async function checkLocale(browser,locale,output){
  const record={locale,status:'running',step:'setup',observations:[],audio:[],errors:[],requests:[]};
  const context=await browser.newContext({viewport:{width:1440,height:900},locale:locale==='es'?'es-ES':'en-US',
    reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(30000);
  const audioResponses=[];
  page.on('pageerror',error=>record.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')record.errors.push(message.text());});
  page.on('response',response=>{if(audioPath(response.url()))audioResponses.push(
    verifyAudioResponse(response).then(value=>({ok:true,value}),error=>({ok:false,message:error.message})));});
  page.on('request',request=>{const url=new URL(request.url());if(audioPath(request.url()))
    record.requests.push({path:url.pathname,search:url.search,method:request.method(),
      resourceType:request.resourceType(),origin:url.origin});});
  await context.addInitScript(()=>{
    const trace={active:0,maxActive:0,started:0,stopped:0};
    Object.defineProperty(window,'__P052_CONTINUITY_AUDIO_TRACE',{value:trace});
    const proto=AudioBufferSourceNode.prototype,start=proto.start,stop=proto.stop,nodes=new WeakSet();
    const finish=node=>{if(nodes.has(node)){nodes.delete(node);trace.active--;trace.stopped++;}};
    proto.start=function(...args){const result=start.apply(this,args);if(!nodes.has(this)){
      nodes.add(this);trace.active++;trace.started++;trace.maxActive=Math.max(trace.maxActive,trace.active);
      this.addEventListener('ended',()=>finish(this),{once:true});}return result;};
    proto.stop=function(...args){const result=stop.apply(this,args);finish(this);return result;};
  });
  try{
    record.step='open-p055';
    const route=`${ORIGIN}/${locale}/migration-status/g678-calibration/${P055}`;
    const response=await page.goto(route,{waitUntil:'domcontentloaded',timeout:90000});
    assert.equal(response?.status(),200,'P055 route must be active');
    await page.locator(`${HOST}[data-current-animation-id="${P055}"]`).waitFor();
    await page.locator(`[data-pair-page="${P055}"][data-pair-ready="true"]`).waitFor({timeout:45000});
    record.observations.push({step:record.step,...await observe(page)});
    record.step='map-to-p052';
    const map=page.locator('button[data-responsive-focus-key="map"]:visible').first();
    await map.click();assert.equal(await map.getAttribute('aria-expanded'),'true','hydrated Map must open');
    await page.locator(`button[data-placement-id="${P052}"]`).click();
    await page.locator(`${HOST}[data-current-animation-id="${P052}"]`).waitFor();
    await page.locator(P052_RUNTIME).waitFor({timeout:45000});
    await page.locator(`${P052_RUNTIME} .p052-player`).waitFor({timeout:45000});
    await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-p052-audio-loading')==='false',
      `${P052_RUNTIME} .p052-player`);
    let state=await observe(page);record.observations.push({step:record.step,...state});
    assert.equal(state.rendererAvailability,'registered');
    assert.ok(!state.failure);assert.deepEqual(state.alerts,[]);
    assert.equal(state.runtimeMounted,true);assert.equal(state.playerMounted,true);
    assert.equal(state.phase,'intro');
    const replay=page.locator('button[data-responsive-focus-key="replay"]:visible').first();
    const playPause=page.locator('button[data-responsive-focus-key="pause"]:visible').first();
    await replay.waitFor();await playPause.waitFor();
    assert.equal(await replay.isEnabled(),true);
    assert.equal(await playPause.isEnabled(),true);
    await page.screenshot({path:path.join(output,`${locale}-p052-ready.png`),fullPage:true});
    record.step='explicit-replay';await replay.click();
    await page.locator(`${P052_RUNTIME} .p052-player[data-p052-player-phase="intro"]`).waitFor();
    state=await observe(page);record.observations.push({step:record.step,...state});
    assert.ok(!state.failure);assert.deepEqual(state.alerts,[]);
    assert.match(`${state.playPause?.ariaLabel??''} ${state.playPause?.text??''}`,
      locale==='es'?/reproducir|play/ui:/play/ui,'Replay in reduced motion must expose explicit Play');
    record.step='explicit-play-audio';
    const startedBefore=state.audioTrace.started;
    await playPause.click();
    await page.waitForFunction(n=>window.__P052_CONTINUITY_AUDIO_TRACE.started>n,startedBefore,{timeout:30000});
    await page.locator(`${P052_RUNTIME} .p052-player[data-p052-audio-loading="false"]`).waitFor({timeout:30000});
    const audioResults=await Promise.all(audioResponses);
    assert.ok(audioResults.length>0,'Real P052 source audio must be requested by browser');
    assert.deepEqual(audioResults.filter(x=>!x.ok),[],'Every observed P052 source response must match its pin');
    record.audio.push(...audioResults.map(x=>x.value));
    state=await observe(page);record.observations.push({step:record.step,...state});
    assert.ok(!state.failure);assert.deepEqual(state.alerts,[]);
    assert.ok(state.audioTrace.started>0,'Decoded source audio must start in browser');
    assert.ok(record.requests.length>0&&record.requests.every(x=>x.origin===ORIGIN&&x.method==='GET'&&x.resourceType==='fetch'),
      'P052 source requests must be browser same-origin fetches');
    await page.screenshot({path:path.join(output,`${locale}-p052-playing.png`),fullPage:true});
    record.step='pause-and-return';
    await playPause.click();
    await page.locator('button[data-responsive-focus-key="map"]:visible').first().click();
    await page.locator(`button[data-placement-id="${P055}"]`).click();
    await page.locator(`${HOST}[data-current-animation-id="${P055}"]`).waitFor();
    await page.waitForFunction(selector=>document.querySelector(selector)===null,P052_RUNTIME);
    await page.waitForFunction(()=>window.__P052_CONTINUITY_AUDIO_TRACE.active===0);
    record.observations.push({step:record.step,...await observe(page)});
    assert.deepEqual(record.errors,[]);
    record.status='p052-continuity-technical-pass-not-acceptance';
  }catch(error){
    record.status='failed';record.failure={step:record.step,message:error.message,stack:error.stack};
    record.observations.push({step:'failure',...await observe(page).catch(()=>({}))});
    await page.screenshot({path:path.join(output,`${locale}-failure.png`),fullPage:true}).catch(()=>{});
  }finally{await context.close();}
  return record;
}

const slug=parseArgs(process.argv.slice(2));
const output=path.join(OUTPUT,slug);
await mkdir(OUTPUT,{recursive:true});await mkdir(output);
const result={schemaVersion:1,kind:'nms-l02-p055-to-p052-browser-continuity-v1',origin:ORIGIN,
  startedAt:new Date().toISOString(),inputPins:await pinInputs(),cases:[]};
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const locale of ['en','es'])result.cases.push(await checkLocale(browser,locale,output));}
finally{await browser.close();}
result.finishedAt=new Date().toISOString();
result.status=result.cases.every(x=>x.status==='p052-continuity-technical-pass-not-acceptance')
  ?'technical-pass-not-acceptance':'failed';
await writeFile(path.join(output,'result.json'),json(result),{flag:'wx'});
console.log(json({status:result.status,cases:result.cases.map(c=>({locale:c.locale,status:c.status,
  failure:c.failure&&{step:c.failure.step,message:c.failure.message},audio:c.audio})),output:path.join(output,'result.json')}));
if(result.status==='failed')process.exitCode=1;
