#!/usr/bin/env node
/** Passive P004 staging-canvas and trusted interaction timing probe in real My Lesson. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const BASE='http://127.0.0.1:3331';
const ROUTE='/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1';
const RUNTIME='[data-p004-continuous-v1]';
const P003='[data-p003-continuous-v2]';
const STAGE=`${RUNTIME} .runtime-stage[data-flash-frame]`;
const CANVAS='canvas[data-course-canvas="shared-alg001-l06-p004"]';
const MATRIX=Object.freeze([{id:'en-late-masks',locale:'en',cycles:1,viewport:{width:1280,height:900},dpr:1,hasTouch:false,motion:'no-preference'}]);
const HASH=bytes=>createHash('sha256').update(bytes).digest('hex');
function pin(relative){
  assert(typeof relative==='string'&&!path.isAbsolute(relative)&&
    relative.split('/').every(part=>part&&part!=='.'&&part!=='..'),`bounded path ${relative}`);
  const file=path.join(ROOT,relative);
  assert.equal(fs.realpathSync(file),file,`physical input ${relative}`);
  const before=fs.lstatSync(file,{bigint:true});
  assert(before.isFile()&&before.nlink===1n&&before.size<=64n*1024n*1024n,
    `ordinary input ${relative}`);
  const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
  assert(['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'].every(key=>
    before[key]===after[key]),`stable input ${relative}`);
  return {path:relative,bytes:bytes.length,sha256:HASH(bytes)};
}
function inputs(){
  const prior=JSON.parse(execFileSync(process.execPath,[
    'scripts/probe-alg-l06-p004-lifecycle-v4.mjs','--plan','--base-url',BASE,
    '--output-dir','output/alg-l06-p004-lifecycle-v4/source-readonly-plan'],
  {cwd:ROOT,encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(prior.status,'plan-no-browser');
  const files=new Map(prior.inputs.pins.map(row=>[row.path,row]));
  for(const relative of [
    'scripts/probe-alg-l06-p004-late-allocation-v1.mjs',
    'output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js',
    'scripts/probe-alg-l06-p004-lifecycle-v4.mjs',
  ])files.set(relative,pin(relative));
  assert.equal(files.get('output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js').sha256,
    '6b6f124262c8b90517151ea77eee43a30843c170211d4cd76404e584c876c2d8');
  return {pins:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),
    activeIndex:prior.inputs.activeIndex,host:prior.inputs.host,source:prior.inputs.source,
    scope:'focused P004 lifecycle source + generated Canvas; no production or formal admission claim'};
}
function args(argv){
  const mode=argv[0];assert(['--plan','--run'].includes(mode),'usage: --plan|--run');
  const options=new Map();
  for(let i=1;i<argv.length;i+=2){
    assert(['--base-url','--output-dir'].includes(argv[i])&&argv[i+1]&&!options.has(argv[i]),
      'usage: --plan|--run --base-url http://127.0.0.1:3331 --output-dir output/alg-l06-p004-late-allocation-v1/<unique-slug>');
    options.set(argv[i],argv[i+1]);
  }
  assert.equal(options.size,2,'base URL and output directory required');
  const url=new URL(options.get('--base-url'));
  assert.equal(url.origin,BASE);assert(url.pathname==='/'&&!url.search&&!url.hash&&
    !url.username&&!url.password,'origin only');
  const output=path.resolve(ROOT,options.get('--output-dir'));
  assert(output.startsWith(path.join(ROOT,'output/alg-l06-p004-late-allocation-v1')+path.sep)&&
    /^[a-z0-9-]+$/.test(path.basename(output)),'bounded unique evidence directory');
  return {mode,baseURL:url.origin,output};
}

/** No canvas object is retained by instrumentation; records contain primitives only. */
function observeBrowser(){
  const allocations=[],paints=[],events=[],pointerEvents=[],weakCanvases=[];
  const canvasMeta=new WeakMap();
  const originalCreate=Document.prototype.createElement;
  Document.prototype.createElement=function(name,...rest){
    const element=Reflect.apply(originalCreate,this,[name,...rest]);
    if(String(name).toLowerCase()==='canvas'){
      const record={id:allocations.length+1,createdAt:performance.now(),
        firstGetContext:null,scopeAtCreate:document.querySelector('[data-p004-continuous-v1]')?'p004-visible':'other'};
      allocations.push(record);canvasMeta.set(element,record);
      weakCanvases.push({ref:new WeakRef(element),scope:record.scopeAtCreate});
    }
    return element;
  };
  const originalGet=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...parameters){
    const record=canvasMeta.get(this);
    if(record&&!record.firstGetContext)record.firstGetContext={kind:String(parameters[0]),
      width:this.width,height:this.height,detached:!this.isConnected};
    return Reflect.apply(originalGet,this,parameters);
  };
  const nativeRaf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>nativeRaf(timestamp=>{
    const canvas=document.querySelector('[data-p004-continuous-v1] canvas[data-course-canvas]');
    const beforeFrame=canvas?.getAttribute('data-flash-frame')??null;
    const beforeCount=allocations.length,start=performance.now();
    try{return callback(timestamp);}finally{
      const afterFrame=canvas?.getAttribute('data-flash-frame')??null;
      if(canvas&&afterFrame&&afterFrame!==beforeFrame){
        const created=allocations.slice(beforeCount);
        paints.push({frame:Number(afterFrame),at:start,callbackDurationMs:performance.now()-start,
          stagingCanvasCreates:created.length,firstGetContextSizes:created.map(row=>row.firstGetContext),
          source:'frame-changing RAF callback; asset.render is frozen and not patched'});
      }
    }
  });
  const targetKind=target=>{
    if(!(target instanceof Element))return null;
    if(target.closest('[data-p004-companion-occurrence="57@106"]'))return 'input';
    if(target.closest('[data-course-map-close-control]'))return 'map-close';
    const control=target.closest('[data-responsive-focus-key]');
    const key=control?.getAttribute('data-responsive-focus-key');
    return ['pause','replay','previous','next'].includes(key)?key:null;
  };
  let lastPointer=null;
  document.addEventListener('pointerdown',event=>{
    const kind=targetKind(event.target);if(!kind)return;
    lastPointer={kind,at:performance.now(),pointerType:event.pointerType,isTrusted:event.isTrusted};
    pointerEvents.push({...lastPointer});
  },true);
  const state=()=>{
    const root=document.querySelector('[data-p004-continuous-v1]');
    return {phase:root?.getAttribute('data-p004-probe-phase')??null,
      frame:Number(root?.querySelector('.runtime-stage[data-flash-frame]')?.getAttribute('data-flash-frame')??0),
      dialog:!!document.querySelector('[role="dialog"][data-glossary-entry-id="input"]'),
      p003:!!document.querySelector('[data-p003-continuous-v2][data-source-clock-ready="true"]'),
      p004:!!root&&root.getAttribute('data-source-clock-ready')==='true'};
  };
  document.addEventListener('click',event=>{
    const kind=targetKind(event.target);if(!kind)return;
    const at=performance.now();events.push({id:events.length+1,kind,at,
      isTrusted:event.isTrusted,pointerType:lastPointer?.kind===kind?lastPointer.pointerType:null,
      pointerTrusted:lastPointer?.kind===kind?lastPointer.isTrusted:false,
      before:state(),firstState:null,latencyMs:null});
  },true);
  const isResult=(event,current)=>{
    switch(event.kind){
      case 'pause':return event.before.phase==='playing'||event.before.phase==='start-pending'
        ?current.phase==='paused':current.phase==='start-pending'||current.phase==='playing';
      case 'replay':return current.p004&&current.phase==='ready'&&current.frame===1&&
        (event.before.frame!==1||event.before.phase!=='ready');
      case 'input':return current.dialog;
      case 'previous':return current.p003;
      case 'next':return current.p004&&!event.before.p004;
      default:return false;
    }
  };
  const observer=new MutationObserver(()=>{
    const current=state(),now=performance.now();
    for(const event of events){if(event.firstState===null&&isResult(event,current)){
      event.firstState=current;event.latencyMs=Math.max(0,now-event.at);}}
  });
  observer.observe(document,{attributes:true,childList:true,subtree:true,attributeFilter:[
    'data-p004-probe-phase','data-flash-frame','data-source-clock-ready','data-glossary-entry-id']});
  const liveCanvasObservation=()=>{
    let reachable=0,detached=0,backingPixels=0;
    for(const item of weakCanvases){
      if(item.scope!=='p004-visible')continue;
      const canvas=item.ref.deref();if(!canvas)continue;
      reachable++;if(!canvas.isConnected)detached++;backingPixels+=canvas.width*canvas.height;
    }
    return {reachable,detached,backingPixels,meaning:'WeakRef liveness in this observation; no forced garbage collection and no absolute leak-free claim'};
  };
  Object.defineProperty(window,'__p004TouchAllocation',{value:{snapshot:()=>({
    allocations:structuredClone(allocations),paints:structuredClone(paints),
    events:structuredClone(events),pointerEvents:structuredClone(pointerEvents),
    liveP004CreatedCanvases:liveCanvasObservation(),
    activeP004CanvasCount:document.querySelectorAll(
      'canvas[data-course-canvas="shared-alg001-l06-p004"]').length,
  })},configurable:false});
}
const snapshot=page=>page.evaluate(()=>window.__p004TouchAllocation.snapshot());
const control=(page,key)=>page.locator(`[data-responsive-focus-key="${key}"]:visible`).first();
async function activate(page,locator,touch){
  await locator.scrollIntoViewIfNeeded();
  if(touch){
    const box=await locator.boundingBox();assert(box&&box.width>0&&box.height>0,'touch target geometry');
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  }else await locator.click();
}
async function lastInteraction(page,kind,beforeCount,touch){
  await page.waitForFunction(({kind,beforeCount})=>window.__p004TouchAllocation.snapshot()
    .events.slice(beforeCount).some(event=>event.kind===kind&&event.latencyMs!==null),
  {kind,beforeCount},{timeout:10000});
  const current=await snapshot(page);
  const event=current.events.slice(beforeCount).find(row=>row.kind===kind&&row.latencyMs!==null);
  assert(event?.isTrusted&&event.pointerTrusted,`${kind}: real trusted browser interaction`);
  if(touch)assert.equal(event.pointerType,'touch',`${kind}: actual touch pointer`);
  assert(Number.isFinite(event.latencyMs)&&event.latencyMs>=0,`${kind}: browser-native latency`);
  return event;
}
async function measuredAction(page,kind,locator,touch,wait){
  const before=(await snapshot(page)).events.length;
  await activate(page,locator,touch);await wait();
  return lastInteraction(page,kind,before,touch);
}
async function probeCell(browser,cell,baseURL,output,results){
  const row={id:cell.id,locale:cell.locale,cycles:[],pageErrors:[],console:[],failedRequests:[],
    externalRequests:[],status:'running',contextClosed:false};
  results.push(row);
  const context=await browser.newContext({viewport:cell.viewport,deviceScaleFactor:cell.dpr,
    reducedMotion:cell.motion,locale:cell.locale,hasTouch:cell.hasTouch,isMobile:cell.hasTouch,
    serviceWorkers:'block'});
  let page;
  try{
    await context.addInitScript(observeBrowser);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(['http:','https:'].includes(url.protocol)&&url.origin!==baseURL){
        row.externalRequests.push(url.href);await route.abort('blockedbyclient');return;}
      await route.continue();
    });
    page=await context.newPage();
    page.on('pageerror',error=>row.pageErrors.push(String(error)));
    page.on('console',message=>{if(['error','warning'].includes(message.type()))
      row.console.push({type:message.type(),text:message.text(),url:message.location().url});});
    page.on('requestfailed',request=>row.failedRequests.push({url:request.url(),
      error:request.failure()?.errorText??null}));
    const response=await page.goto(`${baseURL}/${cell.locale}${ROUTE}`,
      {timeout:120000,waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,'real local My Lesson P004');
    for(let cycle=1;cycle<=cell.cycles;cycle++){
      await page.locator(`${RUNTIME}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
      const before=await snapshot(page);assert.equal(before.activeP004CanvasCount,1,
        'one attached source canvas per active P004 mount');
      const evidence={mount:cycle,entry:before,interactions:[],paints:[],unmounted:null};
      row.cycles.push(evidence);
      evidence.interactions.push(await measuredAction(page,'pause',control(page,'pause'),cell.hasTouch,
        ()=>page.waitForFunction(()=>Number(document.querySelector(
          '[data-p004-continuous-v1] .runtime-stage[data-flash-frame]')?.getAttribute('data-flash-frame'))>=820,
        null,{timeout:90000})));
      evidence.interactions.push(await measuredAction(page,'pause',control(page,'pause'),cell.hasTouch,
        ()=>page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')
          ?.getAttribute('data-p004-probe-phase')==='paused',null,{timeout:10000})));
      const held=Number(await page.locator(STAGE).getAttribute('data-flash-frame'));
      assert(held>=820&&held<831,'natural progression reaches late mask/emphasis cases before terminal');
      assert.equal(await page.locator('[data-p004-native-text]').getAttribute('data-p004-text-frame'),
        String(held),'native and source held frame');
      assert.equal(await page.locator('[data-p004-text-block="equation-worked-result-with-m"]').count(),0,
        'worked answer remains retired in late scene');
      if(cell.hasTouch){
        evidence.interactions.push(await measuredAction(page,'input',
          page.locator('[data-p004-companion-occurrence="57@106"]'),true,
          ()=>page.locator('[role="dialog"][data-glossary-entry-id="input"]').waitFor()));
        const trigger=page.locator('[data-p004-companion-occurrence="57@106"]');
        const close=page.locator('[role="dialog"][data-glossary-entry-id="input"] button').first();
        await activate(page,close,true);
        await page.locator('[role="dialog"][data-glossary-entry-id="input"]').waitFor({state:'detached'});
        await page.waitForFunction(()=>document.activeElement?.matches(
          '[data-p004-companion-occurrence="57@106"]'),null,{timeout:10000});
        assert(await trigger.evaluate(el=>el===document.activeElement),'touch glossary close returns focus');
        assert.equal(await page.locator(STAGE).getAttribute('data-flash-frame'),String(held),
          'touch glossary holds source frame');
      }
      evidence.interactions.push(await measuredAction(page,'replay',control(page,'replay'),cell.hasTouch,
        ()=>page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')
          ?.getAttribute('data-p004-probe-phase')==='ready'&&
          document.querySelector('[data-p004-continuous-v1] .runtime-stage')?.getAttribute('data-flash-frame')==='1',
        null,{timeout:10000})));
      assert.equal(await page.locator(RUNTIME).getAttribute('data-runtime-paused'),'true',
        'Replay is held without autoplay');
      const after=await snapshot(page);
      evidence.paints=after.paints.slice(before.paints.length);
      assert(evidence.paints.length>0,'frame-changing source paints were measured');
      assert(evidence.paints.every(sample=>sample.stagingCanvasCreates>0&&
        sample.firstGetContextSizes.some(size=>size?.kind==='2d'&&size.width===800&&size.height===600)),
      'detached 800x600 staging allocations observed per source-frame paint');
      evidence.allocationsDuringMount=after.allocations.length-before.allocations.length;
      evidence.activeCanvasBeforeLeave=after.activeP004CanvasCount;
      assert.equal(after.activeP004CanvasCount,1);
      evidence.interactions.push(await measuredAction(page,'previous',control(page,'previous'),cell.hasTouch,
        ()=>page.locator(`${P003}[data-source-clock-ready="true"]`).waitFor({timeout:60000})));
      evidence.unmounted=await snapshot(page);
      assert.equal(evidence.unmounted.activeP004CanvasCount,0,'source DOM canvas removed after navigation');
      await page.waitForTimeout(1200);
      evidence.afterIdle=await snapshot(page);
      if(cycle<cell.cycles){
        await activate(page,control(page,'pause'),false);
        await page.waitForFunction(()=>Number(document.querySelector(
          '[data-p003-continuous-v2] .runtime-stage[data-flash-frame]')?.getAttribute('data-flash-frame'))>=3,
        null,{timeout:10000});
        evidence.interactions.push(await measuredAction(page,'next',control(page,'next'),false,
          ()=>page.locator(`${RUNTIME}[data-source-clock-ready="true"]`).waitFor({timeout:60000})));
      }
    }
    assert.deepEqual(row.externalRequests,[],'no external requests');
    assert.deepEqual(row.pageErrors,[],'no page errors');
    assert.deepEqual(row.console,[],'no console errors/warnings');
    // Dev StrictMode may abort an obsolete mount's source request. Preserve every request fact.
    for(const failure of row.failedRequests){
      const url=new URL(failure.url);
      assert.equal(failure.error,'net::ERR_ABORTED',`unexpected failed request ${failure.url}`);
      assert.equal(url.origin,baseURL);
      assert.equal(url.pathname,'/flash-assets/g678-local/shared-alg001-l06-p004/continuous-source-v1');
      assert.equal(url.searchParams.get('sha256'),'e8f5307618bd63789f468c7a056cf80ae7828f17b665a24893fafc3ad8bb7f7e');
      failure.classification='canceled exact source load; every observed mount independently reached ready and played';
    }
    row.measurementBoundary='allocation counts are per source-frame RAF callback, not retained heap; trusted click to first state commit is not visual presentation latency';
    row.status='pass';
  }catch(error){
    row.status='failed';row.failure=String(error?.stack??error);
    if(page){try{const file=path.join(output,`${cell.id}-failure.png`);
      await page.screenshot({path:file,fullPage:false,timeout:10000});
      const bytes=fs.readFileSync(file);row.failureScreenshot={path:path.relative(ROOT,file),
        bytes:bytes.length,sha256:HASH(bytes)};
    }catch(captureError){row.failureCapture=String(captureError);}}
    throw error;
  }finally{await context.close();row.contextClosed=true;}
}

const options=args(process.argv.slice(2));
const preparation={kind:'alg-l06-p004-touch-allocation-browser-v1',baseURL:options.baseURL,
  output:path.relative(ROOT,options.output),matrix:MATRIX,inputs:inputs(),
  boundary:'source-frame allocation churn and trusted state-commit latency only; no forced GC, retained heap or leak-free claim',
  acceptanceEffects:{originalRuntime:false,audioListening:false,humanReview:false,
    ownerAcceptance:false,strictCompletion:false,publication:false}};
if(options.mode==='--plan')console.log(JSON.stringify({...preparation,status:'plan-no-browser'},null,2));
else{
  fs.mkdirSync(path.dirname(options.output),{recursive:true});fs.mkdirSync(options.output);
  fs.copyFileSync(path.join(ROOT,'scripts/probe-alg-l06-p004-late-allocation-v1.mjs'),
    path.join(options.output,'runner.mjs'),fs.constants.COPYFILE_EXCL);
  const receipt={...preparation,status:'running',startedAt:new Date().toISOString(),browserVersion:null,
    results:[],errors:[],browserClosed:false,inputsAfter:null,inputsStable:null};
  let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});receipt.browserVersion=browser.version();
    for(const cell of MATRIX)await probeCell(browser,cell,options.baseURL,options.output,receipt.results);
    receipt.status='pass';
  }catch(error){receipt.status='failed';receipt.errors.push(String(error?.stack??error));process.exitCode=1;}
  finally{
    if(browser){try{await browser.close();receipt.browserClosed=true;}
      catch(error){receipt.status='failed-browser-cleanup';receipt.errors.push(String(error));process.exitCode=1;}}
    try{receipt.inputsAfter=inputs();
      receipt.inputsStable=JSON.stringify(receipt.inputs.pins)===JSON.stringify(receipt.inputsAfter.pins);
      if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}
    }catch(error){receipt.status='failed-input-recheck';receipt.errors.push(String(error));process.exitCode=1;}
    receipt.finishedAt=new Date().toISOString();
    fs.writeFileSync(path.join(options.output,'result.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({status:receipt.status,cycles:receipt.results.map(row=>
      ({id:row.id,cycles:row.cycles.length,status:row.status})),errors:receipt.errors,
      inputsStable:receipt.inputsStable,browserClosed:receipt.browserClosed,
      receipt:path.join(options.output,'result.json')}));
  }
}
