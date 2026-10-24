import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
assert.equal(process.argv.length,4);assert.equal(process.argv[2],'--run');assert.match(process.argv[3],/^v[1-9][0-9]*$/);
const output=path.join(BASE,`nms-l02-hover-interactions-${process.argv[3]}`),dir=path.join(ROOT,'work/g678-shared-page-factory/nms-l02-hover-candidate-v2');
const manifest=JSON.parse(await readFile(path.join(dir,'manifest.json'))),config=JSON.parse(await readFile(path.join(dir,'config.json')));
const hash=b=>createHash('sha256').update(b).digest('hex');
const pins=[];const bound=async(p,expected)=>{const b=await readFile(p),pin={path:p,bytes:b.length,sha256:hash(b)};if(expected)assert.deepEqual(pin,expected);pins.push(pin);return b;};
for(const p of [...manifest.inputs,...manifest.outputs])await bound(p.path,p);
const asset=await readFile(path.join(dir,'canvas-renderer.js'));
const fixture=`import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{NmsL2HoverCandidateRenderer}from'./packages/demos/src/nms-l02-hover-candidate';
import{createMemoryOnlyLessonHost}from'./packages/demos/src/lesson-host-contract';
import config from './work/g678-shared-page-factory/nms-l02-hover-candidate-v2/config.json';
const host=createMemoryOnlyLessonHost({releaseId:'nms-l02-hover-engineering-candidate',releaseMemberIds:[config.animationId],currentAnimationId:config.animationId,enabledCapabilities:['glossary'],mode:'audit'});
function App(){const [frame,setFrame]=useState(1),[replay,setReplay]=useState(0),[term,setTerm]=useState(null);const language=new URL(location.href).searchParams.get('lang')==='es'?'es':'en';
return <main><nav><label>Frame<input aria-label="Frame" type="number" min="1" max="151" value={frame} onChange={e=>setFrame(Number(e.target.value))}/></label><button onClick={()=>{setFrame(1);setReplay(n=>n+1);host.reset();setTerm(null);}}>Replay</button></nav>
<NmsL2HoverCandidateRenderer config={config} frame={frame} replay={replay} lang="en" uiLanguage={language} frameDomain="sprite-69" scenario="source-static-frame" seed={0} onLessonHostRequest={request=>{const result=host.dispatch(request);if(result.status==='allowed')setTerm(result.state.glossaryEntryId);window.lastHostDecision=result;return result;}}/>
{term?<aside role="dialog" aria-label={config.glossary.labels[language]}><p>{config.glossary.definitions[language]}</p><button onClick={()=>{host.dispatch({type:'close-glossary'});setTerm(null);}}>Close</button></aside>:null}</main>};createRoot(document.getElementById('root')).render(<App/>);`;
const bundled=await build({stdin:{contents:fixture,resolveDir:ROOT,sourcefile:'nms-hover-fixture.tsx',loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',metafile:true,define:{'process.env.NODE_ENV':'"production"'}});
for(const name of Object.keys(bundled.metafile.inputs)){if(name==='nms-hover-fixture.tsx')continue;await bound(path.resolve(ROOT,name));}
await bound(fileURLToPath(import.meta.url));
await mkdir(output);await writeFile(path.join(output,'fixture.js'),bundled.outputFiles[0].contents,{flag:'wx'});
const report={status:'running',scope:'Isolated current-JS UI candidate with real memory-only host contract; not My Lesson admission or audio acceptance',
 inputBindings:pins,records:[],unexpectedRequests:[],consoleErrors:[],productCalibrationPassed:false,registered:false,audioIntegrated:false,originalRuntimeAccepted:false,humanAccepted:false,ownerAccepted:false};
let browser,livePage,liveTest,step;
try{
 browser=await chromium.launch({headless:true});report.browserVersion=browser.version();
 for(const test of [{lang:'en',width:1100,touch:false},{lang:'es',width:1100,touch:false},{lang:'en',width:390,touch:true},{lang:'es',width:390,touch:true}]){
  const ctx=await browser.newContext({viewport:{width:test.width,height:950},hasTouch:test.touch,isMobile:test.touch,serviceWorkers:'block'});
  const page=await ctx.newPage();livePage=page;liveTest=test;await page.addInitScript(()=>{window.hoverEvents=[];for(const name of ['pointerenter','pointerleave','pointerdown','pointerup','focus','blur','click','keydown'])document.addEventListener(name,e=>{const t=e.target;window.hoverEvents.push({name,pointerType:e.pointerType,key:e.key,id:t?.dataset?.hoverChoice??t?.dataset?.hoverOverlay,time:performance.now()});if(window.hoverEvents.length>100)window.hoverEvents.shift();},true);});page.on('pageerror',e=>report.consoleErrors.push(e.message));
  await ctx.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin==='http://127.0.0.1:3337'&&url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:system-ui}main{max-width:800px;margin:auto}nav{padding:8px}aside{position:fixed;inset:20%;background:white;border:2px solid;padding:20px;overflow:auto}button:focus-visible{outline:3px solid #123aff;outline-offset:2px}</style><div id="root"></div><script src="/fixture.js"></script>'});
   if(url.origin==='http://127.0.0.1:3337'&&url.pathname==='/fixture.js')return route.fulfill({contentType:'text/javascript',body:Buffer.from(bundled.outputFiles[0].contents)});
   if(url.origin==='http://127.0.0.1:3337'&&url.pathname===config.assetSource&&url.searchParams.get('sha256')===config.assetSha256)return route.fulfill({contentType:'text/javascript',body:asset});
   report.unexpectedRequests.push(url.href);return route.abort();
  });
  await page.goto(`http://127.0.0.1:3337/?lang=${test.lang}`,{waitUntil:'domcontentloaded'});
  const root=page.locator('[data-nms-l02-hover-candidate]');
  await page.waitForFunction(()=>document.querySelector('[data-hover-ready]')?.dataset.hoverReady==='true');
  assert.equal(await page.locator('[data-hover-overlay]').count(),0);assert.equal(await page.locator('[data-nms-l02-glossary]').count(),0);
  const frame=page.getByRole('spinbutton',{name:'Frame'});const setFrame=async n=>{await frame.fill(String(n));await page.waitForFunction(n=>document.querySelector('[data-source-frame]')?.dataset.sourceFrame===String(n),n);};
  await setFrame(2);assert.equal(await page.locator('[data-nms-l02-glossary]').count(),1);
  await page.locator('[data-nms-l02-glossary]').click();await page.getByRole('dialog').waitFor();
  assert.equal(await page.getByRole('dialog').locator('p').textContent(),config.glossary.definitions[test.lang]);
  const decision=await page.evaluate(()=>window.lastHostDecision);assert.equal(decision.status,'allowed');assert.equal(decision.auditOnly,true);assert.equal(decision.state.glossaryEntryId,'fraction');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await setFrame(148);assert.equal(await page.locator('[data-hover-choice]').count(),0);
  await setFrame(149);assert.equal(await page.locator('[data-hover-overlay]').count(),12);assert.equal(await page.locator('[data-hover-choice]').count(),12);
  const observations=[];
  const active=async expected=>{await page.waitForFunction(expected=>document.querySelector('[data-hover-ids]')?.dataset.hoverIds===expected,expected);};
  for(const control of config.controls){
   step={kind:'control',id:control.sourceCharacterId};const id=control.sourceCharacterId,locator=page.locator(`[data-hover-${test.touch?'choice':'overlay'}="${id}"]`);
   if(test.touch){await locator.tap();await active(String(id));assert.equal(await locator.getAttribute('aria-pressed'),'true');await locator.tap();await active('');}
   else{await locator.hover();await active(String(id));await page.mouse.move(0,0);await active('');}
   observations.push({id,input:test.touch?'touch-toggle':'mouse-enter-leave',passed:true});
  }
  // Real keyboard focus plus Enter, Escape, and Tab; no page.evaluate event simulation.
  await frame.focus();await page.keyboard.press('Tab'); // Replay
  await page.keyboard.press('Tab'); // First source overlay
  await active('37');await page.keyboard.press('Escape');await active('');await page.keyboard.press('Enter');await active('37');
  await page.keyboard.press('Tab');await active('34');
  observations.push({input:'keyboard-tab-enter-escape',passed:true});
  // Replay resets component state before returning to the interaction frame.
  await page.getByRole('button',{name:'Replay',exact:true}).click();await active('');assert.equal(await page.locator('[data-hover-choice]').count(),0);
  await setFrame(151);await active('');
  await page.locator('[data-hover-choice="30"]').focus();await active('30');
  assert.match(await page.locator('[data-hover-feedback]').textContent(),test.lang==='es'?/Correcto/:/Correct/);
  await setFrame(148);await active('');await setFrame(151);await active('');
  observations.push({input:'replay-and-backward-inspection',passed:true});
  const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth);assert.ok(scrollWidth<=test.width,'Horizontal viewport overflow');
  await page.screenshot({path:path.join(output,`${test.lang}-${test.width}.png`),fullPage:true});
  report.records.push({...test,observations,typedGlossaryRequestAcceptedInAuditMode:true,scrollWidth});
  await ctx.close();
 }
 assert.deepEqual(report.unexpectedRequests,[]);assert.deepEqual(report.consoleErrors,[]);
 for(const pin of pins){const b=await readFile(pin.path);assert.equal(hash(b),pin.sha256);}
 report.inputsUnchanged=true;report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;report.failureContext={test:liveTest,step,dom:livePage&&!livePage.isClosed()?await livePage.evaluate(()=>({hoverIds:document.querySelector('[data-hover-ids]')?.dataset.hoverIds,focused:document.activeElement?.outerHTML,events:window.hoverEvents})):null};if(livePage&&!livePage.isClosed())await livePage.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw e;}
finally{if(browser)await browser.close();await writeFile(path.join(output,'receipt.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:report.status,cases:report.records.length,unexpectedRequests:report.unexpectedRequests,consoleErrors:report.consoleErrors,output}));}
