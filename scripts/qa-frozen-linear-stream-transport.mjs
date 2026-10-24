// Actual Web Audio graph QA for the frozen calibration member. Not a My Lesson receipt.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PACKAGE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
const SOURCE_CODE='packages/demos/src/decoded-source-stream-transport.ts';
const hash=b=>createHash('sha256').update(b).digest('hex');
const binding=async p=>{const b=await readFile(p);return{path:p,bytes:b.length,sha256:hash(b)};};
async function main(){
  assert.equal(process.argv.length,4);assert.equal(process.argv[2],'--run');assert.match(process.argv[3],/^[a-z0-9-]+$/u);
  const output=path.join(ROOT,'output/playwright',`frozen-linear-stream-transport-${process.argv[3]}`);await mkdir(output);
  const save=(name,value)=>writeFile(path.join(output,name),typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  const measurementPath=path.join(PACKAGE,'frozen-linear-decoder-v1/measurement.json');
  const measurement=JSON.parse(await readFile(measurementPath));
  assert.equal(measurement.animationId,'shared-alg001-l06-p040');assert.equal(measurement.status,'relative-decoder-origin-measured');
  const profile=measurement.records.find(r=>r.sampleRate===22050);
  assert.equal(profile.length,346752);assert.equal(profile.origin.lagSamples,0);
  const raw=await readFile(measurement.sourceStream.path);assert.equal(hash(raw),measurement.sourceStream.sha256);
  const config={sourceSha256:measurement.sourceStream.sha256,sourceBytes:raw.length,sampleRate:22050,channels:1,decodedSamples:profile.length,pcmSha256:profile.pcm.sha256};
  const files=[path.join(ROOT,SOURCE_CODE),fileURLToPath(import.meta.url),measurementPath,measurement.sourceStream.path,
    path.join(ROOT,'packages/demos/tests/decoded-source-stream-transport.test.ts'),path.join(ROOT,'package-lock.json'),
    await realpath(process.execPath),await realpath(chromium.executablePath())];
  const inputs=await Promise.all(files.map(binding));
  const bundle=await build({entryPoints:[path.join(ROOT,SOURCE_CODE)],bundle:true,format:'esm',platform:'browser',write:false,target:'es2022'});
  const module=bundle.outputFiles[0].contents;
  const html='<!doctype html><meta charset="utf-8"><title>Frozen linear source-stream transport QA</title><link rel="icon" href="data:,"><h1>Decoded source-stream transport</h1><p>Engineering transport; source alignment and listening acceptance remain pending.</p><button id="play">Play</button><button id="pause">Pause</button><button id="replay">Replay</button><button id="mute">Mute</button><button id="unmute">Unmute</button><button id="close">Leave page</button><pre id="state"></pre><script type="module" src="/harness.js"></script>';
  const harness=`import {DecodedSourceStreamTransport} from '/module.js';
const config=${JSON.stringify(config)};
window.qa={starts:[],stops:0,contexts:[],errors:[],playingResults:[],closedContexts:0};
const bytes=await (await fetch('/stream.mp3')).arrayBuffer();window.sourceBytes=bytes;
function createContext(){const ctx=new AudioContext({sampleRate:22050,latencyHint:'interactive'});qa.contexts.push(ctx);
 const analyser=ctx.createAnalyser();analyser.fftSize=2048;window.analyser=analyser;
 const createGain=ctx.createGain.bind(ctx);ctx.createGain=()=>{const gain=createGain();gain.connect(analyser);return gain;};
 const sink=createGain();sink.gain.value=0;analyser.connect(sink);sink.connect(ctx.destination);
 const createSource=ctx.createBufferSource.bind(ctx);ctx.createBufferSource=()=>{const n=createSource(),start=n.start.bind(n),stop=n.stop.bind(n);
  n.start=(...args)=>{qa.starts.push({args,contextTime:ctx.currentTime});return start(...args);};
  n.stop=(...args)=>{qa.stops++;return stop(...args);};return n;};
 return ctx;}
window.transport=new DecodedSourceStreamTransport(config,{createContext});
window.makeTransport=()=>new DecodedSourceStreamTransport(config,{createContext});
const draw=()=>{document.querySelector('#state').textContent=JSON.stringify(transport.snapshot(),null,2);requestAnimationFrame(draw);};draw();
transport.subscribe(()=>{window.lastPhase=transport.snapshot().phase;});
window.prepared=await transport.prepare(bytes);window.ready=true;
void transport.play({activation:'automatic',reducedMotion:false}).then(r=>qa.playingResults.push(r));
setTimeout(()=>{window.automaticObservation={state:transport.snapshot(),starts:qa.starts.length,
 userActivation:{isActive:navigator.userActivation.isActive,hasBeenActive:navigator.userActivation.hasBeenActive}};
 fetch('/automatic-observation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(window.automaticObservation)});
 document.body.dataset.automaticObserved='true';},250);
document.querySelector('#play').onclick=()=>{transport.play({activation:'user',reducedMotion:false}).then(r=>qa.playingResults.push(r));};
document.querySelector('#pause').onclick=()=>transport.pause();
document.querySelector('#replay').onclick=()=>transport.replay();
document.querySelector('#mute').onclick=()=>transport.setVolume(0);
document.querySelector('#unmute').onclick=()=>transport.setVolume(1);
document.querySelector('#close').onclick=()=>transport.close().then(()=>qa.closedContexts++);
window.addEventListener('pagehide',()=>{void transport.close();});
window.amplitude=()=>{const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);return Math.max(...values.map(Math.abs));};
`;
  await save('module.js',Buffer.from(module));await save('harness.js',harness);await save('index.html',html);
  const evidence={artifactType:'frozen-linear-native-browser-stream-transport-qa',animationId:measurement.animationId,
    startedAt:new Date().toISOString(),inputs,config,observations:[],requests:[],errors:[],expectedAutoplayWarnings:[],status:'running',
    instrumentation:'Real AudioContext, decoded AudioBuffer and BufferSource nodes. Read-only call recording plus parallel analyser tap. Chromium output muted by browser launch option; this is not human listening.',
    productIntegration:'transport-only-not-registered-My-Lesson',
    acceptanceEffects:{productCalibrationPassed:false,scaleOutAuthorized:false,sourceAlignmentProven:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false}};
  let receiveAutomatic;
  const automaticObserved=new Promise(resolve=>{receiveAutomatic=resolve;});
  const server=createServer((request,response)=>{
    const observer=request.method==='POST'&&request.url==='/automatic-observation';
    const allowed=observer||request.method==='GET'&&['/','/module.js','/harness.js','/stream.mp3'].includes(request.url);
    evidence.requests.push({url:request.url,method:request.method,allowed});
    response.setHeader('Cache-Control','no-store');response.setHeader('X-Robots-Tag','noindex');response.setHeader('X-Content-Type-Options','nosniff');
    response.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data:; base-uri 'none'; form-action 'none'");
    if(!allowed){response.writeHead(404);response.end();return;}
    if(observer){let body='';request.on('data',b=>{body+=b;if(body.length>4096)request.destroy();});
      request.on('end',()=>{try{receiveAutomatic(JSON.parse(body));response.writeHead(204);response.end();}catch{response.writeHead(400);response.end();}});return;}
    const payload=request.url==='/'?html:request.url==='/harness.js'?harness:request.url==='/module.js'?module:raw;
    response.setHeader('Content-Type',request.url==='/'?'text/html':request.url==='/stream.mp3'?'audio/mpeg':'text/javascript');response.end(payload);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}`;let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--mute-audio','--autoplay-policy=document-user-activation-required']});evidence.browser=browser.version();
    const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
    await context.route('**/*',r=>new URL(r.request().url()).origin===url?r.continue():r.abort());
    page.on('pageerror',e=>evidence.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type())){
      const expected='The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://developer.chrome.com/blog/autoplay/#web_audio';
      if(m.text()===expected)evidence.expectedAutoplayWarnings.push(m.text());else evidence.errors.push(m.text());}});
    await page.goto(url);
    // No Runtime.evaluate, selector polling or waitForFunction before the page's
    // observation arrives. Playwright evaluation can itself supply userGesture.
    let observerTimeout;
    const auto=await Promise.race([automaticObserved,new Promise((_,reject)=>{observerTimeout=setTimeout(()=>reject(new Error('page-origin observer timeout')),10000);})]).finally(()=>clearTimeout(observerTimeout));
    const snap=async label=>{const state=await page.evaluate(()=>({state:transport.snapshot(),starts:qa.starts,stops:qa.stops,amplitude:amplitude(),contextStates:qa.contexts.map(c=>c.state)}));evidence.observations.push({label,...state});return state;};
    evidence.automaticObservation=auto;
    assert.equal(auto.userActivation.hasBeenActive,false);assert.equal(auto.userActivation.isActive,false);
    assert.equal(auto.state.phase,'start-pending');assert.equal(auto.state.decodedSample,0);assert.equal(auto.starts,0);
    await page.locator('#play').click();await page.waitForFunction(()=>transport.snapshot().phase==='playing');
    await page.waitForFunction(()=>amplitude()>.001);await snap('playing-signal');
    await page.locator('#pause').click();const paused=await snap('paused');assert.equal(paused.state.phase,'paused');
    await page.waitForTimeout(250);assert.equal((await snap('paused-after-delay')).state.decodedSample,paused.state.decodedSample);
    await page.locator('#play').click();await page.waitForFunction(()=>transport.snapshot().phase==='playing');
    const resumed=await snap('resumed');assert.equal(resumed.starts.length,2);assert.equal(resumed.starts[1].args[1],paused.state.decodedSample/22050);
    await page.locator('#mute').click();const muted=await snap('muted');await page.waitForTimeout(250);const laterMuted=await snap('muted-after-delay');
    assert.equal(laterMuted.amplitude,0);assert(laterMuted.state.decodedSample>muted.state.decodedSample);
    await page.locator('#unmute').click();await page.waitForFunction(()=>amplitude()>.001);await snap('unmuted');
    await page.locator('#replay').click();const replay=await snap('replayed');assert.equal(replay.state.phase,'ready');assert.equal(replay.state.decodedSample,0);
    await page.locator('#play').click();await page.waitForFunction(()=>transport.snapshot().phase==='buffer-ended',null,{timeout:22000});
    const ended=await snap('natural-buffer-eof');assert.equal(ended.state.decodedSample,346752);assert.equal(ended.state.lessonCompleted,false);
    await page.locator('#replay').click();await page.locator('#play').click();await page.waitForFunction(()=>transport.snapshot().phase==='playing');
    await page.locator('#close').click();await page.waitForFunction(()=>qa.closedContexts===1);
    const closed=await snap('closed');assert.equal(closed.state.phase,'closed');assert(closed.contextStates.every(s=>s==='closed'));
    const corrupt=await page.evaluate(async()=>{const t=makeTransport(),b=sourceBytes.slice(0);new Uint8Array(b)[100]^=1;const before=qa.contexts.length,r=await t.prepare(b);return{r,allocations:qa.contexts.length-before};});
    assert.equal(corrupt.r.reason,'source-byte-identity-mismatch');assert.equal(corrupt.allocations,0);evidence.corruptBytes=corrupt;
    await page.screenshot({path:path.join(output,'transport-completed.png'),fullPage:true});
    evidence.screenshot=await binding(path.join(output,'transport-completed.png'));
    assert.deepEqual(evidence.errors,[]);assert(evidence.requests.every(r=>r.allowed));
    evidence.inputsAfter=await Promise.all(files.map(binding));assert.deepEqual(evidence.inputsAfter,inputs);evidence.inputsUnchanged=true;evidence.status='passed';
  }catch(e){evidence.status='failed';evidence.failure={message:e.message,stack:e.stack};throw e;}
  finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));evidence.finishedAt=new Date().toISOString();await save('evidence.json',evidence);}
  console.log(JSON.stringify({status:evidence.status,output,observations:evidence.observations.length}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1;});
