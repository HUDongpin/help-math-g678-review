import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),BASE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
assert.equal(process.argv.length,4);assert.equal(process.argv[2],'--run');assert.match(process.argv[3],/^v[1-9][0-9]*$/);
const OUT=BASE+'/nms-l02-hover-audio-runtime-'+process.argv[3],ID='shared-nms002-l02-p020',ORIGIN='http://127.0.0.1:3338';
const hash=b=>createHash('sha256').update(b).digest('hex'),pins=[];
const bound=async(p,expected)=>{const b=await readFile(p),pin={path:p,bytes:b.length,sha256:hash(b)};if(expected)assert.deepEqual(pin,expected);pins.push(pin);return b;};
const packageRoot=ROOT+'/work/g678-shared-page-factory/nms-l02-hover-candidate-v2';
const manifest=JSON.parse(await bound(packageRoot+'/manifest.json'));for(const p of [...manifest.inputs,...manifest.outputs])await bound(p.path,p);
const config=JSON.parse(await readFile(packageRoot+'/config.json')),plan=JSON.parse(await bound(BASE+'/nms-l02-main-decoder-v1/plan.json'));
const audio=await bound(BASE+'/frozen16-audio-v1/'+ID+'/sprite-69-0.mp3');assert.equal(hash(audio),plan.decoder.sourceSha256);
const asset=await readFile(packageRoot+'/canvas-renderer.js');
const fixture=`import React,{useState,useRef,useCallback}from'react';import{createRoot}from'react-dom/client';
import{createNmsL2HoverAudioRuntime}from'./apps/web/components/nms-l02-hover-audio-runtime';
import{createMemoryOnlyLessonHost}from'./packages/demos/src/lesson-host-contract';
import config from './work/g678-shared-page-factory/nms-l02-hover-candidate-v2/config.json';
const plan=${JSON.stringify(plan)};const Runtime=createNmsL2HoverAudioRuntime({config,plan,sourceUrl:config.assetSource.replace('canvas-renderer.js','source-stream.mp3')+'?sha256='+plan.decoder.sourceSha256});
const host=createMemoryOnlyLessonHost({releaseId:'nms-l02-audio-candidate',releaseMemberIds:[config.animationId],currentAnimationId:config.animationId,enabledCapabilities:['glossary'],mode:'audit'});
function App(){const[paused,setPaused]=useState(true),[volume,setVolume]=useState(1),[mounted,setMounted]=useState(true),[seek,setSeek]=useState(null),[term,setTerm]=useState(null);const controls=useRef(null),request=useRef(0),saved=useRef(true),language=new URL(location.href).searchParams.get('lang')==='es'?'es':'en';
const connect=useCallback(c=>{controls.current=c;return()=>{if(controls.current===c)controls.current=null;};},[]);
return <main><nav><button data-play onClick={()=>controls.current?.setPaused(!paused)}>{paused?'Play':'Pause'}</button><button data-replay onClick={()=>{setSeek(null);controls.current?.replay();}}>Replay</button><button data-mute onClick={()=>setVolume(v=>v?0:1)}>Mute</button><input aria-label="Inspect frame" type="number" min="1" max="151" onChange={e=>setSeek({frame:Number(e.target.value),requestId:++request.current})}/><button data-next onClick={()=>{setMounted(false);setPaused(true);setTerm(null);host.reset();}}>Next</button><button data-previous onClick={()=>{setSeek(null);setMounted(true);}}>Previous</button></nav>
{mounted?<Runtime moduleKey={config.animationId} animationId={config.animationId} audioEnabled paused={paused} volume={volume} connectRuntimeControls={connect} onRuntimePausedChange={setPaused} query={{lang:'en',frameDomain:'sprite-69',scenario:'source-static-frame',seed:'0'}} labels={{loading:'Loading',unavailable:'Unavailable'}} uiLanguage={language} seekRequest={seek} pageInteractionCompanionTargetId="nms-choices" onPlaybackComplete={()=>{window.completed=(window.completed??0)+1;}} onLessonHostRequest={req=>{const r=host.dispatch(req);if(r.status==='allowed'){saved.current=paused;setTerm(r.state.glossaryEntryId);}return r;}}/>:null}
<div id="nms-choices" data-page-interaction-companion-host="true"/>
{term?<aside role="dialog"><p>{config.glossary.definitions[language]}</p><button data-close onClick={()=>{host.dispatch({type:'close-glossary'});setTerm(null);setPaused(saved.current);}}>Close</button></aside>:null}</main>};createRoot(document.getElementById('root')).render(<App/>);`;
const bundled=await build({stdin:{contents:fixture,resolveDir:ROOT,sourcefile:'nms-audio-fixture.tsx',loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',metafile:true,define:{'process.env.NODE_ENV':'"development"'}});
for(const name of Object.keys(bundled.metafile.inputs)){if(name!=='nms-audio-fixture.tsx')await bound(path.resolve(ROOT,name));}await bound(fileURLToPath(import.meta.url));
await mkdir(OUT);await writeFile(OUT+'/fixture.js',bundled.outputFiles[0].contents,{flag:'wx'});
const report={status:'running',scope:'Actual candidate LessonRuntimeAdapter with native audio and source surface; isolated fixture, not registered My Lesson route',inputBindings:pins,records:[],errors:[],unexpectedRequests:[],productCalibrationPassed:false,registered:false,audioAccepted:false,originalRuntimeAccepted:false,humanAccepted:false,ownerAccepted:false};
let browser,live;
try{
 browser=await chromium.launch({headless:true,args:['--mute-audio','--autoplay-policy=document-user-activation-required']});report.browserVersion=browser.version();
 for(const c of [{lang:'en',width:1100,reduced:false,touch:false},{lang:'es',width:390,reduced:false,touch:true},{lang:'en',width:390,reduced:true,touch:false}]){
  const context=await browser.newContext({viewport:{width:c.width,height:1000},hasTouch:c.touch,isMobile:c.touch,reducedMotion:c.reduced?'reduce':'no-preference',serviceWorkers:'block'});const page=await context.newPage();live=page;
  const record={...c,status:'running',observations:[]};report.records.push(record);
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.addInitScript(()=>{
   const Native=window.AudioContext;window.audioEvents=[];window.audioContexts=[];
   window.AudioContext=new Proxy(Native,{construct(Target,args){const ctx=new Target(...args),index=window.audioContexts.push(ctx);window.audioEvents.push({kind:'context',index});
    const create=ctx.createBufferSource.bind(ctx);ctx.createBufferSource=()=>{const node=create(),start=node.start.bind(node);node.start=(...a)=>{window.audioEvents.push({kind:'start',index,args:a,time:ctx.currentTime,frame:document.querySelector('canvas')?.dataset.flashFrame,hoverIds:document.querySelector('canvas')?.dataset.sourceHoverCharacterIds,samples:node.buffer?.length,channels:node.buffer?.numberOfChannels});return start(...a);};return node;};
    const close=ctx.close.bind(ctx);ctx.close=async()=>{await close();window.audioEvents.push({kind:'closed',index});};
    const gain=ctx.createGain.bind(ctx);ctx.createGain=()=>{const node=gain(),set=node.gain.setValueAtTime.bind(node.gain);node.gain.setValueAtTime=(v,t)=>{window.audioEvents.push({kind:'volume',index,value:v});return set(v,t);};return node;};return ctx;}});
  });
  await context.route('**/*',route=>{const url=new URL(route.request().url());
   if(url.origin===ORIGIN&&url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:system-ui}main{max-width:800px;margin:auto}nav{display:flex;flex-wrap:wrap;gap:6px;padding:8px}nav button{min-height:44px}input{width:80px}aside{position:fixed;inset:15%;background:white;border:2px solid;padding:20px;overflow:auto;z-index:1000}button:focus-visible{outline:3px solid blue}</style><div id="root"></div><script src="/fixture.js"></script>'});
   if(url.origin===ORIGIN&&url.pathname==='/fixture.js')return route.fulfill({contentType:'text/javascript',body:Buffer.from(bundled.outputFiles[0].contents)});
   if(url.origin===ORIGIN&&url.pathname===config.assetSource&&url.searchParams.get('sha256')===config.assetSha256)return route.fulfill({contentType:'text/javascript',body:asset});
   if(url.origin===ORIGIN&&url.pathname===`/flash-assets/g678-local/${ID}/source-stream.mp3`&&url.searchParams.get('sha256')===plan.decoder.sourceSha256)return route.fulfill({contentType:'audio/mpeg',headers:{'content-length':String(audio.length)},body:audio});
   report.unexpectedRequests.push(url.href);return route.abort();
  });
  await page.goto(ORIGIN+'/?lang='+c.lang,{waitUntil:'domcontentloaded'});
  const waitPhase=phase=>page.waitForFunction(phase=>document.querySelector('[data-source-clock-runtime]')?.dataset.sourceClockPhase===phase,phase);
  const snap=async label=>{const state=await page.locator('[data-source-clock-runtime]').evaluate(n=>({...n.dataset,canvasFrame:document.querySelector('canvas')?.dataset.flashFrame,hoverIds:document.querySelector('canvas')?.dataset.sourceHoverCharacterIds}));record.observations.push({label,...state});return state;};
  await page.waitForFunction(()=>document.querySelector('[data-source-clock-ready]')?.dataset.sourceClockReady==='true');
  assert.equal((await snap('cold-ready')).canvasFrame,'1');assert.equal((await page.evaluate(()=>window.audioEvents.filter(e=>e.kind==='start'))).length,0);
  await page.locator('[data-play]').click();await waitPhase('playing');await page.waitForTimeout(180);if(c.reduced)assert.equal((await snap('reduced-prefix-playing')).canvasFrame,'1');await page.locator('[data-play]').click();await waitPhase('paused');
  const prefix=await snap('prefix-pause');assert.equal(Number(prefix.sourceAudioSample),1673);await page.waitForTimeout(900);assert.equal((await snap('prefix-held')).sourceAudioSample,prefix.sourceAudioSample);
  await page.locator('[data-play]').click();await waitPhase('playing');await page.waitForTimeout(1200);
  const playing=await snap('playing-after-prefix');assert.ok(Number(playing.sourceAudioSample)>1673);if(c.reduced)assert.equal(playing.canvasFrame,prefix.canvasFrame);
  await page.locator('[data-mute]').click();await page.waitForTimeout(80);await page.locator('[data-mute]').click();
  if(!c.reduced){
   await page.locator('[data-nms-l02-glossary]').click();await page.getByRole('dialog').waitFor();await waitPhase('paused');const held=await snap('glossary-held');await page.waitForTimeout(250);assert.equal((await snap('glossary-still-held')).sourceAudioSample,held.sourceAudioSample);await page.locator('[data-close]').click();await waitPhase('playing');await snap('glossary-resumed');
  }
  if(c.lang==='en'&&!c.reduced){
   await page.evaluate(async()=>{for(const context of window.audioContexts)if(context.state==='running')await context.suspend();});
   await waitPhase('paused');const interrupted=await snap('native-interruption');await page.waitForTimeout(200);assert.equal((await snap('native-interruption-held')).sourceAudioSample,interrupted.sourceAudioSample);
   await page.locator('[data-play]').click();await waitPhase('playing');await snap('native-interruption-resumed');
  }
  const inspector=page.getByRole('spinbutton',{name:'Inspect frame'});await inspector.fill('149');await waitPhase('paused');await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.flashFrame==='149');
  const choice=page.locator('[data-hover-choice="30"]');await choice.waitFor();assert.equal(await choice.evaluate(n=>n.closest('#nms-choices')!==null),true);
  if(c.touch)await choice.tap();else await choice.hover();
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.sourceHoverCharacterIds==='30');await snap('hover-at-held-frame');
  const expected=JSON.parse(await readFile(BASE+'/nms-l02-hover-canvas-v2/receipt.json')).records.find(r=>r.frame===149&&JSON.stringify(r.ids)==='[30]');
  const rendered=await page.locator('canvas').evaluate(n=>n.toDataURL());assert.equal(hash(Buffer.from(rendered.split(',')[1],'base64')),expected.pngSha256);
  await page.locator('[data-replay]').click();await waitPhase('playing');await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.flashFrame==='1');await snap('replay-cleared');
  await waitPhase('timeline-ended');await snap('natural-end');
  if(!c.reduced)assert.equal(await page.locator('canvas').getAttribute('data-flash-frame'),'151');
  const events=await page.evaluate(()=>window.audioEvents);record.events=events;
  const starts=events.filter(e=>e.kind==='start');assert.ok(starts.length>=3);assert.equal(starts[0].frame,'1');assert.ok(Math.abs(starts[0].args[0]-starts[0].time-.75)<.02);assert.ok(starts[1].args[0]-starts[1].time<.75);
  assert.equal(starts.at(-1).frame,'1');assert.equal(starts.at(-1).hoverIds,'');assert.equal(starts.at(-1).args[1],1673/22050);assert.ok(starts.every(e=>e.channels===1&&e.samples===260352));assert.ok(events.some(e=>e.kind==='volume'&&e.value===0));
  await page.screenshot({path:OUT+`/${c.lang}-${c.width}-${c.reduced?'reduced':'normal'}.png`,fullPage:true});
  await page.locator('[data-next]').click();await page.waitForFunction(()=>window.audioContexts.every(c=>c.state==='closed'));assert.equal(await page.locator('[data-hover-choice]').count(),0);
  await page.locator('[data-previous]').click();await page.waitForFunction(()=>document.querySelector('[data-source-clock-ready]')?.dataset.sourceClockReady==='true');assert.equal((await snap('returned-clean')).canvasFrame,'1');assert.equal(await page.locator('[data-hover-choice]').count(),0);
  record.finalEvents=await page.evaluate(()=>window.audioEvents);record.status='passed';await context.close();console.log(JSON.stringify({case:c,status:record.status,observations:record.observations.length}));
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpectedRequests,[]);for(const p of pins)assert.equal(hash(await readFile(p.path)),p.sha256);report.inputsUnchanged=true;report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;if(live&&!live.isClosed()){await live.screenshot({path:OUT+'/failure.png',fullPage:true});report.failureDom=await live.locator('body').innerText();report.failureEvents=await live.evaluate(()=>window.audioEvents);}throw e;}
finally{if(browser)await browser.close();await writeFile(OUT+'/receipt.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:report.status,output:OUT}));}
