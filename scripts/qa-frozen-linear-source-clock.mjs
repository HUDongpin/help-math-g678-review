import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PACKAGE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
const ID='shared-alg001-l06-p040',CODE='packages/demos/src/continuous-source-stream-clock-candidate.ts';
assert.equal(process.argv[2],'--run');assert.match(process.argv[3]??'',/^v[1-9]\d*$/);assert.equal(process.argv.length,4);
const OUT=path.join(PACKAGE,`frozen-linear-source-clock-${process.argv[3]}`);
const sha=b=>createHash('sha256').update(b).digest('hex'),json=v=>JSON.stringify(v,null,2)+'\n';
const binding=async p=>{const file=path.resolve(ROOT,p),b=await readFile(file);return{path:file,bytes:b.length,sha256:sha(b)};};
const measurementPath=path.join(PACKAGE,'frozen-linear-decoder-v1/measurement.json'),segmentsPath=path.join(PACKAGE,'frozen16-audio-segments-v1/receipt.json');
const measurement=JSON.parse(await readFile(measurementPath)),segments=JSON.parse(await readFile(segmentsPath));
const source=segments.records.find(s=>s.animationId===ID);assert(source);assert.equal(source.segments.length,1);assert.equal(source.blocks.length,189);assert(source.blocks.every(b=>b.seekSamples>=0));
assert.equal(source.headFrame,1);assert.equal(source.segments[0].firstBlockFrame,1);assert.equal(source.latencySeek,1673);assert.equal(source.frameRate,'12');
const profile=measurement.records.find(r=>r.sampleRate===22050);assert.equal(profile.origin.lagSamples,0);assert.equal(profile.length,346752);
const raw=await readFile(source.payload.path);assert.equal(sha(raw),source.payload.sha256);assert.equal(source.payload.sha256,'bf6cbc0d490526ed4dec3b7566204cb22057a09a37be6fbe61d2367143caaaad');
const canvasPath='work/g678-shared-page-factory/g678-shared-current-js-calibration-13-v1/members/'+ID+'/canvas-renderer.js',canvas=await readFile(path.join(ROOT,canvasPath));
assert.equal(sha(canvas),'a6568ba88450bf9ec258942dc2efa516889caea4b9dd6304a8e38b47f4e90a7b');
const plan={sourceSwfSha256:source.source.sha256,frameDomain:'sprite-86',firstFrame:1,lastFrame:189,fps:12,latencySamples:1673,sourceSegmentCount:1,sourceHasNegativeSeek:false,
 decoder:{sourceSha256:source.payload.sha256,sourceBytes:raw.length,sampleRate:22050,channels:1,decodedSamples:346752,pcmSha256:profile.pcm.sha256}};
const inputPaths=[CODE,'packages/demos/src/decoded-source-stream-transport.ts','packages/demos/tests/continuous-source-stream-clock-candidate.test.ts','packages/demos/tests/decoded-source-stream-transport.test.ts',fileURLToPath(import.meta.url),measurementPath,segmentsPath,source.source.path,source.payload.path,profile.pcm.path,canvasPath,'packages/demos/src/timelines/'+ID+'.ts',await realpath(chromium.executablePath())];
const inputs=await Promise.all(inputPaths.map(binding));const pcm=await readFile(profile.pcm.path);assert.equal(sha(pcm),profile.pcm.sha256);
await mkdir(OUT);const save=(name,v)=>writeFile(path.join(OUT,name),typeof v==='string'||Buffer.isBuffer(v)?v:json(v),{flag:'wx'});
const bundle=(await build({entryPoints:[path.join(ROOT,CODE)],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'})).outputFiles[0].contents;
const html='<!doctype html><html lang="en"><meta charset="utf-8"><title>Continuous source clock candidate</title><link rel="icon" href="data:,"><body><h1>Continuous source audio and Canvas clock candidate</h1><p>Private engineering test. Original-runtime comparison and listening acceptance are pending.</p><button id="play">Play</button><button id="pause">Pause</button><button id="replay">Replay and play</button><button id="mute">Mute</button><button id="unmute">Unmute</button><button id="leave">Leave</button><canvas width="800" height="600" id="canvas"></canvas><pre id="state"></pre><script type="module" src="/harness.js"></script></body></html>';
const harness=`import {ContinuousSourceStreamClockCandidate} from '/clock.js';
const plan=${JSON.stringify(plan)};window.qa={starts:[],stops:0,results:[],trace:[],errors:[],frameCommits:[]};let ctx,analyser;
function createContext(){ctx=new AudioContext({sampleRate:22050,latencyHint:'interactive'});window.ctx=ctx;
 analyser=ctx.createAnalyser();analyser.fftSize=2048;const gain=ctx.createGain.bind(ctx);ctx.createGain=()=>{const n=gain();n.connect(analyser);return n;};const sink=gain();sink.gain.value=0;analyser.connect(sink);sink.connect(ctx.destination);
 const create=ctx.createBufferSource.bind(ctx);ctx.createBufferSource=()=>{const n=create(),start=n.start.bind(n),stop=n.stop.bind(n);n.start=(...args)=>{qa.starts.push({args,contextTime:ctx.currentTime,canvasFrame:Number(document.querySelector('#canvas').getAttribute('data-flash-frame'))});return start(...args);};n.stop=(...args)=>{qa.stops++;return stop(...args);};return n;};return ctx;}
window.clock=new ContinuousSourceStreamClockCandidate(plan,{createContext,commitHeldFrame:frame=>{asset.render(document.querySelector('#canvas'),{frame,scenario:'source-static-frame',lang:'en',seed:0});drawn=frame;const painted=Number(document.querySelector('#canvas').getAttribute('data-flash-frame'));qa.frameCommits.push({frame,painted,nativeStarts:qa.starts.length});return painted===frame;}});
const canvasReady=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/canvas.js';s.integrity=${JSON.stringify('sha256-'+createHash('sha256').update(canvas).digest('base64'))};s.crossOrigin='anonymous';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
const raw=await (await fetch('/stream.mp3')).arrayBuffer();window.prepared=await clock.prepare(raw);await canvasReady;
const asset=window.HELP_MATH_CANVAS_ASSETS[${JSON.stringify(ID)}];if(asset.metadata.animationId!==${JSON.stringify(ID)}||asset.metadata.sourceSwfSha256!==plan.sourceSwfSha256)throw Error('source Canvas metadata mismatch');await asset.ready();
let drawn=-1,last='';function draw(){const state=clock.snapshot();if(state.frame!==drawn){asset.render(document.querySelector('#canvas'),{frame:state.frame,scenario:'source-static-frame',lang:'en',seed:0});drawn=state.frame;}
 const identity=state.frame+':'+state.phase;if(identity!==last){qa.trace.push({frame:state.frame,canvasFrame:Number(document.querySelector('#canvas').getAttribute('data-flash-frame')),phase:state.phase,elapsedSeconds:state.elapsedSeconds,decodedSample:state.audio.decodedSample,audioPhase:state.audio.phase,audioEnded:state.audioEnded});last=identity;}
 document.querySelector('#state').textContent=JSON.stringify(state,null,2);requestAnimationFrame(draw);}draw();
window.amplitude=()=>{const v=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(v);return Math.max(...v.map(Math.abs));};
const options={activation:'user',reducedMotion:false};document.querySelector('#play').onclick=()=>clock.play(options).then(r=>qa.results.push(r));document.querySelector('#pause').onclick=()=>clock.pause();
document.querySelector('#replay').onclick=()=>{clock.replay();clock.play(options).then(r=>qa.results.push(r));};document.querySelector('#mute').onclick=()=>clock.setVolume(0);document.querySelector('#unmute').onclick=()=>clock.setVolume(1);document.querySelector('#leave').onclick=()=>clock.close();
void clock.play({activation:'automatic',reducedMotion:false}).then(r=>qa.results.push(r));
setTimeout(()=>fetch('/automatic-observation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:clock.snapshot(),starts:qa.starts.length,activation:{isActive:navigator.userActivation.isActive,hasBeenActive:navigator.userActivation.hasBeenActive}})}),250);
window.addEventListener('pagehide',()=>{void clock.close();});`;
await save('plan.json',plan);await save('clock.js',Buffer.from(bundle));await save('harness.js',harness);await save('index.html',html);await save('inputs.json',inputs);
const evidence={schemaVersion:1,scope:'Exact frozen pure-linear source Canvas and MP3 on one native AudioContext clock, in an unregistered engineering fixture.',inputs,plan,observations:[],requests:[],errors:[],expectedAutoplayWarnings:[],sourceInterpretation:'Continuous-play candidate: initial block at source frame 1; apply 1673 raw decoded samples once, then native sample rate. No SWF frame seeking or discontinuous-stream interpretation.',actualMyLessonVerified:false,productCalibrationPassed:false,scaleOutAuthorized:false,sourceAlignmentAccepted:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false};
let receive;const automatic=new Promise(r=>{receive=r;});
const server=createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const observer=req.method==='POST'&&url.pathname==='/automatic-observation';const allowed=observer||req.method==='GET'&&['/','/clock.js','/harness.js','/canvas.js','/stream.mp3'].includes(url.pathname);evidence.requests.push({method:req.method,path:url.pathname,allowed});res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex');res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data:; base-uri 'none'");if(!allowed){res.writeHead(404);res.end();return;}
 if(observer){let body='';req.on('data',b=>{body+=b;if(body.length>4096)req.destroy();});req.on('end',()=>{try{receive(JSON.parse(body));res.writeHead(204);res.end();}catch{res.writeHead(400);res.end();}});return;}
 const payload=url.pathname==='/'?html:url.pathname==='/clock.js'?bundle:url.pathname==='/harness.js'?harness:url.pathname==='/canvas.js'?canvas:raw;res.setHeader('Content-Type',url.pathname==='/'?'text/html':url.pathname==='/stream.mp3'?'audio/mpeg':'text/javascript');res.end(payload);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
try{
 browser=await chromium.launch({headless:true,args:['--mute-audio','--autoplay-policy=document-user-activation-required']});evidence.browser=browser.version();const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());page.on('pageerror',e=>evidence.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type())){if(m.text().startsWith('The AudioContext was not allowed to start.'))evidence.expectedAutoplayWarnings.push(m.text());else evidence.errors.push(m.text());}});
 await page.goto(base);let timeout;const initial=await Promise.race([automatic,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('automatic observation timeout')),20000);})]).finally(()=>clearTimeout(timeout));
 evidence.automatic=initial;assert.equal(initial.starts,0);assert.equal(initial.state.frame,1);assert.equal(initial.state.audio.decodedSample,1673);assert.equal(initial.activation.hasBeenActive,false);
 const snap=async label=>{const v=await page.evaluate(()=>({state:clock.snapshot(),starts:qa.starts,stops:qa.stops,amplitude:amplitude(),canvasFrame:Number(document.querySelector('#canvas').getAttribute('data-flash-frame'))}));evidence.observations.push({label,...v});return v;};
 await page.click('#play');await page.waitForFunction(()=>clock.snapshot().frame>=12);const playing=await snap('playing');assert.equal(playing.starts.length,1);assert.equal(playing.starts[0].args[1],1673/22050);assert.equal(playing.starts[0].canvasFrame,1);assert.equal(playing.state.phase,'playing');
 await page.click('#pause');const paused=await snap('paused');await page.waitForTimeout(250);const held=await snap('held');assert.equal(held.state.elapsedSeconds,paused.state.elapsedSeconds);assert.equal(held.state.audio.decodedSample,paused.state.audio.decodedSample);
 await page.click('#play');await page.waitForFunction(()=>clock.snapshot().phase==='playing');const resumed=await snap('resumed');assert.equal(resumed.starts.length,2);assert.equal(resumed.starts[1].args[1],paused.state.audio.decodedSample/22050);assert.equal(resumed.starts[1].canvasFrame,paused.state.frame);
 await page.click('#mute');await page.waitForTimeout(150);const muted=await snap('muted');assert.equal(muted.state.audio.volume,0);assert.equal(muted.amplitude,0);
 await page.click('#unmute');await page.waitForFunction(()=>amplitude()>0.0001,null,{timeout:5000});const signal=await snap('unmuted-signal');assert.equal(signal.state.audio.volume,1);
 await page.waitForFunction(()=>clock.snapshot().timelineReachedEnd,null,{timeout:25000});await page.waitForFunction(()=>document.querySelector('#canvas').getAttribute('data-flash-frame')==='189');const end=await snap('natural-timeline-end');assert.equal(end.state.frame,189);assert.equal(end.state.lessonCompleted,false);
 const shot=await page.screenshot({fullPage:true});await save('natural-end.png',shot);evidence.screenshot={path:path.join(OUT,'natural-end.png'),bytes:shot.length,sha256:sha(shot)};
 await page.click('#replay');await page.waitForFunction(()=>clock.snapshot().phase==='playing'&&clock.snapshot().frame<10);const replay=await snap('replay');assert.equal(replay.starts.at(-1).args[1],1673/22050);assert.equal(replay.starts.at(-1).canvasFrame,1);
 await page.click('#leave');await page.waitForFunction(()=>clock.snapshot().phase==='closed');const closed=await snap('closed');assert.equal(await page.evaluate(()=>ctx.state),'closed');assert.equal((await page.evaluate(()=>clock.play({activation:'user',reducedMotion:false}))).accepted,false);
 evidence.frameCommits=await page.evaluate(()=>qa.frameCommits);assert(evidence.frameCommits.every(c=>c.frame===c.painted));evidence.trace=await page.evaluate(()=>qa.trace);assert(evidence.trace.every(r=>r.canvasFrame===r.frame));assert(evidence.trace.some(r=>r.frame===1)&&evidence.trace.some(r=>r.frame===189));assert.deepEqual(evidence.errors,[]);assert(evidence.requests.every(r=>r.allowed));evidence.status='passed';
}catch(e){evidence.status='failed';evidence.failure=e.stack??String(e);}finally{
 if(browser)await browser.close();await new Promise(r=>server.close(r));evidence.inputsUnchanged=JSON.stringify(inputs)===JSON.stringify(await Promise.all(inputPaths.map(binding)));if(!evidence.inputsUnchanged)evidence.status='failed';await save('receipt.json',evidence);console.log(json({output:OUT,status:evidence.status,observations:evidence.observations.length,inputsUnchanged:evidence.inputsUnchanged,failure:evidence.failure?.split('\n')[0]}));if(evidence.status!=='passed')process.exitCode=1;
}
