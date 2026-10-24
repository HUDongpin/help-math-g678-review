#!/usr/bin/env node
/** Focused real-My-Lesson P004 mount, layout and media lifecycle observation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const BASE='http://127.0.0.1:3331';
const ROUTE='/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1';
const P004='[data-p004-continuous-v1]';
const P003='[data-p003-continuous-v2]';
const STAGE=`${P004} .runtime-stage[data-flash-frame]`;
const FONT_PATHS=new Set(['/fonts/lesson-v1/nunito-sans-variable.ttf',
  '/fonts/lesson-v1/fredoka-variable.ttf']);
const MATRIX=Object.freeze([
  {id:'en-three-mounts',locale:'en',cycles:3,viewport:{width:1280,height:900},dpr:1,
    reducedMotion:'no-preference',blockFonts:false},
  {id:'es-one-mount-fallback',locale:'es',cycles:1,viewport:{width:390,height:844},dpr:2,
    reducedMotion:'reduce',blockFonts:true},
]);
const HASH=bytes=>createHash('sha256').update(bytes).digest('hex');
const FILES=[
  'scripts/probe-alg-l06-p004-lifecycle-v4.mjs',
  'docs/LESSON_TYPOGRAPHY_DEVELOPMENT.md',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1/page.tsx',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2/page.tsx',
  'apps/web/lib/g678-admission-activation.ts',
  'apps/web/components/g678-alg-l06-p004-candidate-player-v1.generated.tsx',
  'apps/web/components/g678-alg-l06-p004-host-lesson-v1.tsx',
  'apps/web/components/g678-alg-l06-p004-runtime-v1.tsx',
  'apps/web/components/g678-alg-l06-p004-runtime-v1.module.css',
  'apps/web/components/g678-alg-l06-p003-continuous-runtime-v2.tsx',
  'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
  'apps/web/components/legacy-responsive-lesson-shell.tsx',
  'apps/web/app/globals.css','apps/web/app/lesson-fonts.css',
  'apps/web/app/lesson-typography.css','apps/web/app/lesson-typography-host.css',
  'apps/web/public/fonts/lesson-v1/nunito-sans-variable.ttf',
  'apps/web/public/fonts/lesson-v1/fredoka-variable.ttf',
  'packages/demos/src/modules/shared-alg001-l06-p004.tsx',
  'packages/demos/src/timelines/shared-alg001-l06-p004.ts',
  'packages/demos/src/alg-l06-p004-continuous-source-clock-v1.ts',
  'packages/demos/src/alg-l06-p004-continuous-audio-schedule-v1.ts',
  'packages/demos/src/alg-l06-p004-optional-spanish-audio-v1.ts',
  'packages/demos/src/alg-l06-p004-semantic-text-v1.ts',
  'packages/demos/src/alg-l06-p004-text-snapshot-v1.ts',
  'packages/demos/src/alg-l06-p004-text-presentation-v1.tsx',
  'packages/demos/src/alg-l06-p004-native-text-v1.tsx',
  'packages/demos/src/alg-l06-p004-glossary-state-v1.ts',
  'packages/demos/src/alg-l06-p004-glossary-content-v1.ts',
  'packages/demos/src/alg-l06-p004-hit-regions.generated.ts',
  'packages/demos/src/alg-l06-p004-equation-presentation-v1.ts',
  'packages/demos/src/decoded-source-stream-transport.ts',
  'packages/demos/src/source-static-canvas-candidate.tsx',
  'apps/web/lib/alg-l06-p004-resources-v1.server.ts',
  'apps/web/lib/alg-l06-p004-local-request-v1.ts',
  'apps/web/lib/alg-l06-p004-predecessor-resources-v1.server.ts',
  'apps/web/lib/alg-l06-p004-predecessor-request-v1.ts',
  'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/canvas-v1/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/continuous-source-v1/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/optional-spanish-audio-v1/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/predecessor/canvas/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/predecessor/main/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/predecessor/spanish/route.ts',
  'migrations/shared-alg001-l06-p004/audit/source-audit-v1.json',
  'migrations/shared-alg001-l06-p004/audit/source-text-v1.json',
  'migrations/shared-alg001-l06-p004/audit/button-geometry-v1.json',
];
function pin(relative){
  assert(typeof relative==='string'&&!path.isAbsolute(relative)&&
    relative.split('/').every(part=>part&&part!=='.'&&part!=='..'),`bounded path ${relative}`);
  const file=path.join(ROOT,relative);
  assert.equal(fs.realpathSync(file),file,`physical path ${relative}`);
  const before=fs.lstatSync(file,{bigint:true});
  assert(before.isFile()&&before.nlink===1n&&before.size<=64n*1024n*1024n,
    `ordinary input ${relative}`);
  const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
  assert(['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'].every(key=>
    before[key]===after[key]),`stable input ${relative}`);
  return {path:relative,bytes:bytes.length,sha256:HASH(bytes)};
}
function inputs(){
  const files=new Set(FILES);
  const activation=fs.readFileSync(path.join(ROOT,'apps/web/lib/g678-admission-activation.ts'),'utf8');
  const match=activation.match(/export const G678_ADMISSION_INDEX\s*=\s*(\{[\s\S]*?\})\s*as const;/u);
  assert(match,'reviewed active index');
  const indexPin=JSON.parse(match[1]);assert.deepEqual(pin(indexPin.path),indexPin);
  files.add(indexPin.path);
  const index=JSON.parse(fs.readFileSync(path.join(ROOT,indexPin.path),'utf8'));
  assert.deepEqual(pin(index.host.path),index.host);files.add(index.host.path);
  const source=JSON.parse(fs.readFileSync(path.join(ROOT,
    'migrations/shared-alg001-l06-p004/audit/source-audit-v1.json'),'utf8'));
  assert.equal(source.animationId,'shared-alg001-l06-p004');
  assert.equal(source.source.sha256,
    '514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e');
  const pins=[...files].sort().map(pin);
  return {pins,activeIndex:indexPin,host:index.host,source:source.source,
    scope:'focused browser lifecycle closure; independent production and formal admission checks remain separate'};
}
function parseArgs(argv){
  const mode=argv[0];assert(['--plan','--run'].includes(mode),'usage: --plan|--run');
  const options=new Map();
  for(let i=1;i<argv.length;i+=2){
    assert(['--base-url','--output-dir'].includes(argv[i])&&argv[i+1]&&!options.has(argv[i]),
      'usage: --plan|--run --base-url http://127.0.0.1:3331 --output-dir output/alg-l06-p004-lifecycle-v4/<unique-slug>');
    options.set(argv[i],argv[i+1]);
  }
  assert.equal(options.size,2,'base URL and output directory required');
  const url=new URL(options.get('--base-url'));
  assert.equal(url.origin,BASE,'source-bound local origin');
  assert(url.pathname==='/'&&!url.search&&!url.hash&&!url.username&&!url.password,
    'base URL must be origin only');
  const output=path.resolve(ROOT,options.get('--output-dir'));
  assert(output.startsWith(path.join(ROOT,'output/alg-l06-p004-lifecycle-v4')+path.sep)&&
    /^[a-z0-9-]+$/.test(path.basename(output)),'bounded unique output directory');
  return {mode,baseURL:url.origin,output};
}
function installPassiveInstrumentation(){
  const contexts=[],nodes=[],paints=[],lost=[],raf=new Map();
  let contextId=0,nodeId=0;
  const scope=()=>document.querySelector('[data-p004-continuous-v1]')?'p004-visible':'other';
  const NativeAudioContext=window.AudioContext;
  if(NativeAudioContext){
    const nativeCreate=NativeAudioContext.prototype.createBufferSource;
    const nativeClose=NativeAudioContext.prototype.close;
    const nodeByObject=new WeakMap(),contextByObject=new WeakMap();
    NativeAudioContext.prototype.createBufferSource=function(...args){
      const node=Reflect.apply(nativeCreate,this,args);
      const record={id:++nodeId,contextId:contextByObject.get(this)?.id??null,
        scopeAtCreate:scope(),starts:[],stops:[],ended:0};
      nodes.push(record);nodeByObject.set(node,record);
      node.addEventListener('ended',()=>{record.ended++;});
      return node;
    };
    NativeAudioContext.prototype.close=function(...args){
      const record=contextByObject.get(this);if(record)record.closeCalls++;
      const result=Reflect.apply(nativeClose,this,args);
      Promise.resolve(result).then(()=>{if(record)record.closed=true;},
        error=>{if(record)record.closeError=String(error);});
      return result;
    };
    const Source=window.AudioBufferSourceNode;
    if(Source){
      const nativeStart=Source.prototype.start,nativeStop=Source.prototype.stop;
      Source.prototype.start=function(...args){
        const record=nodeByObject.get(this);
        if(record)record.starts.push({at:performance.now(),scope:scope(),offset:args[1]??null});
        return Reflect.apply(nativeStart,this,args);
      };
      Source.prototype.stop=function(...args){
        const record=nodeByObject.get(this);
        if(record)record.stops.push({at:performance.now(),scope:scope()});
        return Reflect.apply(nativeStop,this,args);
      };
    }
    window.AudioContext=class ObservedAudioContext extends NativeAudioContext{
      constructor(...args){super(...args);const record={id:++contextId,scopeAtCreate:scope(),
        createdAt:performance.now(),closeCalls:0,closed:false};
        contexts.push(record);contextByObject.set(this,record);}
    };
  }
  document.addEventListener('contextlost',event=>lost.push({type:event.type,at:performance.now()}),true);
  document.addEventListener('webglcontextlost',event=>lost.push({type:event.type,at:performance.now()}),true);
  const nativeRaf=window.requestAnimationFrame.bind(window);
  const nativeCancel=window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>{
    const createdScope=scope();let id=0;
    id=nativeRaf(timestamp=>{
      raf.delete(id);
      const canvas=document.querySelector('[data-p004-continuous-v1] canvas[data-course-canvas]');
      const before=canvas?.getAttribute('data-flash-frame')??null;
      const start=performance.now();
      try{return callback(timestamp);}finally{
        const durationMs=performance.now()-start;
        const after=canvas?.getAttribute('data-flash-frame')??null;
        if(canvas&&after&&after!==before)paints.push({frame:Number(after),durationMs,
          scope:createdScope,at:start,metric:'RAF callback containing source canvas frame change'});
      }
    });
    raf.set(id,{createdScope,at:performance.now()});return id;
  };
  window.cancelAnimationFrame=id=>{raf.delete(id);return nativeCancel(id);};
  Object.defineProperty(window,'__p004LifecycleObservation',{value:{
    snapshot:()=>({contexts:structuredClone(contexts),nodes:structuredClone(nodes),
      paints:structuredClone(paints),lost:structuredClone(lost),
      outstandingRaf:[...raf.values()].map(row=>({...row}))}),
  },configurable:false});
}
const capture=page=>page.evaluate(()=>window.__p004LifecycleObservation.snapshot());
const control=(page,key)=>page.locator(`[data-responsive-focus-key="${key}"]:visible`).first();
async function afterAnimationFrames(page){
  await page.evaluate(async()=>{
    await document.fonts.ready;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
}
async function heldSnapshot(page,expectedFrame,label){
  await afterAnimationFrames(page);
  const state=await page.evaluate(()=>{
    const root=document.querySelector('[data-p004-continuous-v1]');
    const native=document.querySelector('[data-p004-native-text]');
    const blocks=[...document.querySelectorAll('[data-p004-native-text] [data-p004-text-block]')]
      .map(node=>node.getAttribute('data-p004-text-block'));
    const source=[...document.querySelectorAll('[data-p004-source-occurrence]')]
      .map(node=>node.getAttribute('data-p004-source-occurrence'));
    const companion=[...document.querySelectorAll('[data-p004-companion-occurrence]')]
      .map(node=>node.getAttribute('data-p004-companion-occurrence'));
    const faceStatus=[...document.fonts].filter(face=>
      ['HELP Math Nunito Sans','HELP Math Fredoka'].includes(face.family))
      .map(face=>({family:face.family,status:face.status}));
    return {frame:Number(root?.querySelector('.runtime-stage[data-flash-frame]')?.getAttribute('data-flash-frame')),
      nativeFrame:Number(native?.getAttribute('data-p004-text-frame')),
      phase:root?.getAttribute('data-p004-probe-phase'),paused:root?.getAttribute('data-runtime-paused'),
      controlCount:Number(root?.getAttribute('data-source-control-count')),
      viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      documentWidth:document.documentElement.scrollWidth,fontStatus:document.fonts.status,faceStatus,
      blocks,source,companion,earlyAnswer:document.querySelector('[data-p004-text-block="equation-worked-result-with-m"]')!==null};
  });
  assert.equal(state.frame,expectedFrame,`${label}: source frame remains held`);
  assert.equal(state.nativeFrame,expectedFrame,`${label}: native/source frame agreement`);
  assert.equal(state.paused,'true',`${label}: remains paused`);
  assert.equal(state.earlyAnswer,false,`${label}: no answer before 367`);
  assert.equal(new Set(state.blocks).size,state.blocks.length,`${label}: unique native block IDs`);
  assert.equal(new Set(state.source).size,state.source.length,`${label}: unique source hotspots`);
  assert.equal(new Set(state.companion).size,state.companion.length,`${label}: unique companion controls`);
  assert.deepEqual([...state.source].sort(),[...state.companion].sort(),
    `${label}: source and companion controls cover the same occurrences`);
  assert.equal(state.source.length,state.controlCount,`${label}: current control count`);
  assert(state.documentWidth<=state.viewport.width,`${label}: no document horizontal overflow`);
  return state;
}
async function observeLayoutChanges(page,held,record,initialViewport){
  const baseline=(await capture(page)).nodes.reduce((count,node)=>count+node.starts.length,0);
  const check=async label=>{
    const state=await heldSnapshot(page,held,label);
    const snapshot=await capture(page);
    assert.equal(snapshot.nodes.reduce((count,node)=>count+node.starts.length,0),baseline,
      `${label}: layout must not start/restart audio`);
    record.layout.push({label,state,outstandingRaf:snapshot.outstandingRaf.length,
      sourcePaintCount:snapshot.paints.length,contextLosses:snapshot.lost.length});
  };
  await page.setViewportSize({width:320,height:900});await check('resize-320');
  await page.setViewportSize({width:1280,height:900});await check('resize-1280');
  await page.setViewportSize({width:844,height:390});await check('orientation-landscape');
  await page.setViewportSize({width:390,height:844});await check('orientation-portrait');
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  await check('root-font-200-percent');
  await page.evaluate(()=>{document.documentElement.style.removeProperty('font-size');});
  await check('root-font-restored');
  const family=await page.evaluate(()=>{
    const section=document.querySelector('[data-p004-native-text]');
    const text=section?.querySelector('.lesson-text-presentation__block');
    assertBrowser(section&&text,'native text and block for synthetic font change');
    const before=getComputedStyle(text).fontFamily;
    section.style.setProperty('--lesson-text-font-body','Arial, sans-serif');
    section.style.setProperty('--lesson-text-font-heading','Arial, sans-serif');
    const after=getComputedStyle(text).fontFamily;
    return {before,after};
    function assertBrowser(value,message){if(!value)throw Error(message);}
  });
  assert.notEqual(family.after,family.before,'scoped synthetic font-family override changes computed face');
  record.syntheticFontFamily={...family,scope:'CSS variable override, not downloaded-font transition'};
  await check('synthetic-font-fallback');
  await page.evaluate(()=>{
    const section=document.querySelector('[data-p004-native-text]');
    section.style.removeProperty('--lesson-text-font-body');
    section.style.removeProperty('--lesson-text-font-heading');
  });
  await check('font-family-restored');
  const map=control(page,'map');
  if(await map.getAttribute('aria-expanded')==='true')
    await page.locator('[data-course-map-close-control="true"]:visible').click();
  assert.equal(await map.getAttribute('aria-expanded'),'false','map begins closed for toggle check');
  await map.click();
  assert.equal(await map.getAttribute('aria-expanded'),'true','map sidebar opened');
  await check('sidebar-open');
  await page.locator('[data-course-map-close-control="true"]:visible').click();
  assert.equal(await map.getAttribute('aria-expanded'),'false','map sidebar closed');
  await check('sidebar-closed');
  const dprBefore=await page.evaluate(()=>devicePixelRatio);
  let cdp,overrideApplied=false;
  try{
    cdp=await page.context().newCDPSession(page);
    const requested=dprBefore===3?2:3;
    await cdp.send('Emulation.setDeviceMetricsOverride',
      {width:390,height:844,deviceScaleFactor:requested,mobile:false});
    overrideApplied=true;
    const actual=await page.evaluate(()=>devicePixelRatio);
    assert.equal(actual,requested,'CDP DPR override observable');
    await check('dpr-change');
    record.dpr={status:'observed',before:dprBefore,requested,actual};
  }catch(error){
    if(overrideApplied)throw error;
    record.dpr={status:'unsupported-or-failed',before:dprBefore,error:String(error)};
  }finally{
    if(cdp){await cdp.send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:dprBefore,mobile:false}).catch(error=>{
      record.dprRestoreError=String(error);});/* Keep session attached until context.close: detach resets Chrome DPR to 1. */}
    await page.setViewportSize({width:390,height:844});
  }
  assert.equal(await page.evaluate(()=>devicePixelRatio),dprBefore,'DPR restored');
  await check('dpr-restored');
  await page.setViewportSize(initialViewport);
  await check('initial-viewport-restored');
}
async function probeCell(browser,cell,baseURL,output,results){
  const observation={id:cell.id,locale:cell.locale,cycles:[],failedRequests:[],responses:[],
    assetResponses:[],pageErrors:[],console:[],externalRequests:[],blockedFonts:[],
    contextClosed:false,status:'running'};
  results.push(observation);
  const context=await browser.newContext({viewport:cell.viewport,deviceScaleFactor:cell.dpr,
    locale:cell.locale,reducedMotion:cell.reducedMotion,serviceWorkers:'block'});
  let page, lifecycleStage='initial-mount';
  try{
    await context.addInitScript(installPassiveInstrumentation);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(['http:','https:'].includes(url.protocol)&&url.origin!==baseURL){
        observation.externalRequests.push(url.href);await route.abort('blockedbyclient');return;}
      if(cell.blockFonts&&FONT_PATHS.has(url.pathname)){
        observation.blockedFonts.push(url.pathname);await route.abort('failed');return;}
      await route.continue();
    });
    page=await context.newPage();
    page.on('pageerror',error=>observation.pageErrors.push(String(error)));
    page.on('console',message=>{if(['error','warning'].includes(message.type()))
      observation.console.push({type:message.type(),text:message.text(),url:message.location().url});});
    page.on('requestfailed',request=>observation.failedRequests.push({url:request.url(),
      error:request.failure()?.errorText??null,lifecycleStage}));
    page.on('response',response=>{
      if(response.status()>=400)observation.responses.push({url:response.url(),status:response.status()});
      if(response.url().includes('/flash-assets/g678-local/shared-alg001-l06-p004/'))
        observation.assetResponses.push({url:response.url(),status:response.status(),
          contentLength:response.headers()['content-length']??null});
    });
    let readyStarted=Date.now();
    const response=await page.goto(`${baseURL}/${cell.locale}${ROUTE}`,
      {timeout:120000,waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,'real My Lesson P004 route');
    for(let cycle=1;cycle<=cell.cycles;cycle++){
      await page.locator(`${P004}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
      lifecycleStage=`p004-ready-${cycle}`;
      const readyMs=Date.now()-readyStarted;
      const before=await capture(page);
      const entry=await heldSnapshot(page,1,`${cell.id} mount ${cycle} entry`);
      assert.equal(entry.phase,'ready',`mount ${cycle} ready`);
      const current={mount:cycle,readyMs,entry,layout:[],before,
        sourcePaintSamples:[],media:null,afterUnmount:null};
      observation.cycles.push(current);
      await control(page,'pause').click();
      await page.waitForFunction(()=>Number(document.querySelector(
        '[data-p004-continuous-v1] .runtime-stage[data-flash-frame]')?.getAttribute('data-flash-frame'))>=130,
      null,{timeout:30000});
      await control(page,'pause').click();
      await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')
        ?.getAttribute('data-p004-probe-phase')==='paused',null,{timeout:10000});
      const held=Number(await page.locator(STAGE).getAttribute('data-flash-frame'));
      assert(held>=130&&held<367,'paused before worked-answer reveal');
      current.held=await heldSnapshot(page,held,`${cell.id} mount ${cycle} held`);
      const atPause=await capture(page);
      assert(atPause.nodes.reduce((sum,node)=>sum+node.starts.length,0)>
        before.nodes.reduce((sum,node)=>sum+node.starts.length,0),'user Play starts real source node');
      await observeLayoutChanges(page,held,current,cell.viewport);
      await page.evaluate(()=>document.documentElement.style.removeProperty('font-size'));
      await control(page,'replay').click();
      await page.locator(`${P004}[data-source-clock-ready="true"]`).waitFor({timeout:10000});
      current.replay=await heldSnapshot(page,1,`${cell.id} mount ${cycle} Replay`);
      const afterReplay=await capture(page);
      assert.equal(afterReplay.nodes.reduce((sum,node)=>sum+node.starts.length,0),
        atPause.nodes.reduce((sum,node)=>sum+node.starts.length,0),
        'held Replay creates no new source node');
      current.sourcePaintSamples=afterReplay.paints.slice(before.paints.length);
      current.media={contextsCreated:afterReplay.contexts.length-before.contexts.length,
        nodesCreated:afterReplay.nodes.length-before.nodes.length,
        starts:afterReplay.nodes.reduce((sum,node)=>sum+node.starts.length,0)-
          before.nodes.reduce((sum,node)=>sum+node.starts.length,0),
        stops:afterReplay.nodes.reduce((sum,node)=>sum+node.stops.length,0)-
          before.nodes.reduce((sum,node)=>sum+node.stops.length,0),
        outstandingRaf:afterReplay.outstandingRaf.length,contextLosses:afterReplay.lost.length};
      lifecycleStage='navigation-to-p003';
      await control(page,'previous').click();
      await page.locator(`${P003}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
      await page.waitForFunction(()=>{
        const data=window.__p004LifecycleObservation.snapshot();
        return data.contexts.filter(row=>row.scopeAtCreate==='p004-visible').every(row=>row.closed);
      },null,{timeout:15000});
      await afterAnimationFrames(page);
      current.afterUnmount=await capture(page);
      assert.equal(current.afterUnmount.lost.length,0,'no canvas context loss');
      assert.equal(current.afterUnmount.outstandingRaf.filter(row=>
        row.createdScope==='p004-visible').length,0,
      'no P004-scheduled RAF remains after its unmount');
      if(cycle<cell.cycles){
        await control(page,'pause').click();
        await page.waitForFunction(()=>Number(document.querySelector(
          '[data-p003-continuous-v2] .runtime-stage[data-flash-frame]')?.getAttribute('data-flash-frame'))>=3,
        null,{timeout:10000});
        readyStarted=Date.now();lifecycleStage='navigation-to-p004';await control(page,'next').click();
      }
    }
    assert.deepEqual(observation.externalRequests,[],'no external requests');
    assert.deepEqual(observation.pageErrors,[],'no browser page errors');
    for(const row of observation.console){
      const url=row.url?new URL(row.url):null;
      assert(cell.blockFonts&&url&&FONT_PATHS.has(url.pathname)&&
        row.text.includes('Failed to load resource'),`unexpected console diagnostic: ${row.text}`);
    }
    assert.deepEqual(observation.responses.filter(row=>row.url.includes('/flash-assets/')),[],
      'no failed lesson assets');
    assert(observation.assetResponses.filter(row=>
      new URL(row.url).pathname.endsWith('/continuous-source-v1')&&row.status===200).length>=
    cell.cycles,'each P004 mount obtains a successful source audio response');
    for(const failure of observation.failedRequests){
      const url=new URL(failure.url);
      const expectedFont=cell.blockFonts&&FONT_PATHS.has(url.pathname);
      const boundedCanceledLoad=url.pathname==='/flash-assets/g678-local/shared-alg001-l06-p004/continuous-source-v1'&&
        url.searchParams.get('sha256')==='e8f5307618bd63789f468c7a056cf80ae7828f17b665a24893fafc3ad8bb7f7e'&&
        failure.error==='net::ERR_ABORTED'&&['initial-mount','navigation-to-p003','navigation-to-p004'].includes(failure.lifecycleStage);
      assert(expectedFont||boundedCanceledLoad,`unexpected failed request ${JSON.stringify(failure)}`);
      failure.classification=expectedFont?'intentional-font-fallback':'bounded-mount-navigation-source-load-canceled';
    }
    if(cell.blockFonts)assert(observation.blockedFonts.length>0,'real font fallback triggered');
    else assert(observation.failedRequests.every(row=>row.classification==='bounded-mount-navigation-source-load-canceled'),'only scoped navigation cancellations');
    assert(observation.cycles.every(cycle=>cycle.sourcePaintSamples.length>0),
      'each cycle has measured source-frame paint callbacks');
    observation.metricBoundary='RAF callback containing a source canvas frame change: upper bound, not exact asset.render time; frozen asset identity preserved';
    observation.status='pass';
  }catch(error){
    observation.status='failed';observation.failure=String(error?.stack??error);
    if(page){try{
      const file=path.join(output,`${cell.id}-failure.png`);
      await page.screenshot({path:file,fullPage:false,timeout:10000});
      const bytes=fs.readFileSync(file);
      observation.failureScreenshot={path:path.relative(ROOT,file),bytes:bytes.length,sha256:HASH(bytes)};
    }catch(captureError){observation.failureCapture=String(captureError);}}
    throw error;
  }finally{await context.close();observation.contextClosed=true;}
  return observation;
}

const options=parseArgs(process.argv.slice(2));
const preparation={kind:'alg-l06-p004-lifecycle-browser-v1',baseURL:options.baseURL,
  output:path.relative(ROOT,options.output),matrix:MATRIX,inputs:inputs(),
  metricBoundary:'fixed local source candidate and real Chrome; no GC or performance threshold',
  acceptanceEffects:{originalRuntime:false,audioListening:false,humanReview:false,
    ownerAcceptance:false,strictCompletion:false,publication:false}};
if(options.mode==='--plan')console.log(JSON.stringify({...preparation,status:'plan-no-browser'},null,2));
else{
  fs.mkdirSync(path.dirname(options.output),{recursive:true});
  fs.mkdirSync(options.output);
  fs.copyFileSync(path.join(ROOT,'scripts/probe-alg-l06-p004-lifecycle-v4.mjs'),
    path.join(options.output,'runner.mjs'),fs.constants.COPYFILE_EXCL);
  const receipt={...preparation,status:'running',startedAt:new Date().toISOString(),
    browserVersion:null,results:[],errors:[],browserClosed:false,inputsAfter:null,inputsStable:null};
  let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    receipt.browserVersion=browser.version();
    for(const cell of MATRIX)await probeCell(browser,cell,
      options.baseURL,options.output,receipt.results);
    receipt.status='pass';
  }catch(error){receipt.status='failed';receipt.errors.push(String(error?.stack??error));
    process.exitCode=1;
  }finally{
    if(browser){try{await browser.close();receipt.browserClosed=true;}
      catch(error){receipt.status='failed-browser-cleanup';
        receipt.errors.push(String(error?.stack??error));process.exitCode=1;}}
    try{receipt.inputsAfter=inputs();
      receipt.inputsStable=JSON.stringify(receipt.inputs.pins)===JSON.stringify(receipt.inputsAfter.pins);
      if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}
    }catch(error){receipt.status='failed-input-recheck';
      receipt.errors.push(String(error?.stack??error));process.exitCode=1;}
    receipt.finishedAt=new Date().toISOString();
    fs.writeFileSync(path.join(options.output,'result.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({status:receipt.status,cycles:receipt.results.map(row=>
      ({id:row.id,cycles:row.cycles.length,status:row.status})),errors:receipt.errors,
      inputsStable:receipt.inputsStable,browserClosed:receipt.browserClosed,
      receipt:path.join(options.output,'result.json')}));
  }
}
