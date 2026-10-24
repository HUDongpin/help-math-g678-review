import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const base='http://127.0.0.1:3326',id='shared-alg001-l05-p030';
const out='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f/frozen-glossary-first-paint-v1';
await mkdir(out);const save=(f,v)=>writeFile(out+'/'+f,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const sha=b=>createHash('sha256').update(b).digest('hex');
const inputs=await Promise.all(['packages/demos/private-current-js-registry.json','packages/demos/src/source-static-canvas-candidate.tsx','packages/demos/src/frozen-calibration-glossary-candidate.tsx','apps/web/components/animation-runtime.tsx','scripts/diagnose-frozen-glossary-first-paint.mjs'].map(async path=>{const b=await readFile(path);return{path,bytes:b.length,sha256:sha(b)};}));
const browser=await chromium.launch({headless:true}),records=[];
try{for(const delayMs of [0,2500]){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',serviceWorkers:'block'}),page=await context.newPage();
 const record={delayMs,errors:[]};records.push(record);page.on('pageerror',e=>record.errors.push(e.message));
 // Observe DOM mutations only. The observer never writes application state,
 // replaces a clock, supplies a renderer, or calls a source runtime method.
 await page.addInitScript(({id})=>{
  const seen=[];Object.defineProperty(window,'__GLOSSARY_FIRST_PAINT_OBSERVATIONS',{value:seen});
  new MutationObserver(()=>{const stage=document.querySelector('.runtime-stage[data-animation-module="'+id+'"]'),canvas=document.querySelector('canvas[data-course-canvas="'+id+'"]');
   if(seen.length<300&&stage){const row={at:performance.now(),stageFrame:Number(stage.getAttribute('data-flash-frame')),canvasFrame:Number(canvas?.getAttribute('data-flash-frame')),renderState:canvas?.getAttribute('data-render-state')??null,replay:document.querySelector('.runtime-shell')?.getAttribute('data-runtime-replay')};const last=seen.at(-1);if(!last||last.stageFrame!==row.stageFrame||last.renderState!==row.renderState||last.replay!==row.replay)seen.push(row);}
  }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-flash-frame','data-render-state','data-runtime-replay']});
 },{id});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==base)return route.abort();if(u.pathname===`/flash-assets/g678-local/${id}/canvas-renderer.js`&&delayMs)await new Promise(r=>setTimeout(r,delayMs));return route.continue();});
 try{await page.goto(`${base}/en/migration-status/g678-calibration/${id}`,{waitUntil:'domcontentloaded'});
  await page.locator(`canvas[data-course-canvas="${id}"][data-render-state="ready"]`).waitFor({timeout:60000});await page.waitForTimeout(600);
  record.beforeReplay=await page.evaluate(()=>window.__GLOSSARY_FIRST_PAINT_OBSERVATIONS);
  record.firstReady=record.beforeReplay.find(r=>r.renderState==='ready');assert(record.firstReady);assert.equal(record.firstReady.canvasFrame,record.firstReady.stageFrame);
  await page.locator('[data-responsive-focus-key="replay"]:visible').first().click();await page.waitForTimeout(600);
  record.afterReplay=await page.evaluate(()=>window.__GLOSSARY_FIRST_PAINT_OBSERVATIONS);
  record.firstReplayReady=record.afterReplay.find(r=>r.replay!==record.firstReady.replay&&r.renderState==='ready'&&r.canvasFrame===r.stageFrame);
  assert.deepEqual(record.errors,[]);
 }finally{await context.close();}
 console.log(JSON.stringify({delayMs,firstReady:record.firstReady,firstReplayReady:record.firstReplayReady}));
 }}finally{await browser.close();await save('receipt.json',{schemaVersion:1,createdAt:new Date().toISOString(),inputs,records,
 scope:'Initial source Canvas paint in the current real registered My Lesson route; bounded network latency diagnostic only.',
 finding:records.every(r=>r.firstReady?.canvasFrame>1)?'initial-paint-skips-source-opening-frames':'inspect-observations',
 sourceSynchronizationAccepted:false,productCalibrationPassed:false});}
