#!/usr/bin/env node
/** Chrome's whole-stream decode of the exact P003 SWF payload. Measurement only:
 * both AudioContexts remain suspended; no media node, playback or listening. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const AWS='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE=path.join(AWS,'G6-G8-shared/ALG001/L6/RW/L6RW03.swf');
const V3=path.join(ROOT,'output/alg-l06-p003-audio-alignment-20260928/continuous-v3.json');
const OUTPUT=path.join(ROOT,'output/alg-l06-p003-audio-alignment-20260928/browser-continuous-v1');
const SOURCE_SHA='c3d265b61aedccc48e679cbecfe6424a2a78f2a9cb5cfa2a33791fa124933766';
const V3_SHA='d3b66115dc1aa6bc61e3d375f475052d646f4f52ea50e544fa9eff4be3b273af';
const MP3_SHA='91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111';
const FRAMES=Object.freeze([501,502,520,531,544,719]);
const INPUTS=Object.freeze([
 'scripts/measure-alg-l06-p003-continuous-pcm-v1.mjs',
 'scripts/prepare-g678-terminal-source-v1.mjs',
 'scripts/audit-alg-l06-p003-continuous-stream-v3.mjs',
 'scripts/audit-alg-l06-p003-audio-alignment-v2.mjs',
]);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

async function ordinary(file,expected){
 assert.equal(await realpath(file),file,`physical file ${file}`);
 const before=await lstat(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink(),`ordinary file ${file}`);
 const bytes=await readFile(file),after=await lstat(file,{bigint:true});
 for(const key of ['dev','ino','size','mode','mtimeNs','nlink'])assert.equal(before[key],after[key],`stable ${key}: ${file}`);
 const pin={path:file,bytes:bytes.length,sha256:sha256(bytes)};
 if(expected){if(expected.bytes!==undefined)assert.equal(pin.bytes,expected.bytes,`bytes ${file}`);
  assert.equal(pin.sha256,expected.sha256,`sha256 ${file}`);}
 return {bytes,pin};
}
async function inputs(){
 const pins=[];
 for(const relative of INPUTS){const file=path.join(ROOT,relative);
  pins.push({...((await ordinary(file)).pin),path:relative});}
 const playwrightLogical=path.join(ROOT,'node_modules/playwright/package.json');
 const playwrightPhysical=await realpath(playwrightLogical);
 assert.equal(playwrightPhysical,
  '/Volumes/WestWorld/HELP MATH 2.0/node_modules/playwright/package.json',
  'reviewed shared Playwright installation');
 pins.push((await ordinary(playwrightPhysical)).pin);
 pins.push((await ordinary(SOURCE,{bytes:1220637,sha256:SOURCE_SHA})).pin);
 pins.push((await ordinary(V3,{bytes:undefined,sha256:V3_SHA})).pin);
 return pins;
}
async function sourcePayload(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,AWS,'exact real AWS source root');
 assert.equal(await realpath(AWS),AWS,'physical AWS root');
 const swf=(await ordinary(SOURCE,{bytes:1220637,sha256:SOURCE_SHA})).bytes;
 const report=JSON.parse((await ordinary(V3,{bytes:undefined,sha256:V3_SHA})).bytes);
 assert.equal(report.kind,'alg-l06-p003-continuous-stream-source-audit-v3');
 assert.equal(report.inputs.source.sha256,SOURCE_SHA);
 assert.equal(report.sourceStream.frameDomain,'sprite-154');
 assert.equal(report.sourceStream.singleHead.initialLatencySamples,1673);
 assert.equal(report.sourceStream.fullMp3.bytes,263640);
 assert.equal(report.sourceStream.fullMp3.sha256,MP3_SHA);
 assert.equal(report.decode.sampleCount,1168128);
 assert.equal(report.decode.pcmSha256,'3325caeaeaa7cade3d2ce7fc561d7184d37988595c24231c1f6d029174ff48dc');
 assert.deepEqual(report.continuousCoordinates.frames.map(item=>item.frame),FRAMES);
 const stream=extractTerminalStream(swf,'sprite-154');
 assert.equal(stream.heads.length,1);
 assert.equal(stream.heads[0].hex,'0a2a2d078906');
 assert.equal(stream.blocks.length,637);
 assert.equal(stream.mp3.length,263640);
 assert.equal(sha256(stream.mp3),MP3_SHA);
 return {mp3:stream.mp3,report};
}

/** Uses browser-native decodeAudioData and hashes canonical float32 little-endian
 * PCM in that browser. Each invocation creates and closes its own suspended
 * AudioContext, with no AudioBufferSourceNode or destination connection. */
async function decodeOnce(page,base64){
 return page.evaluate(async ({base64,frames})=>{
  const source=Uint8Array.from(atob(base64),char=>char.charCodeAt(0));
  const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
   .map(byte=>byte.toString(16).padStart(2,'0')).join('');
  const inputSha256=await digest(source.buffer);
  const context=new AudioContext({sampleRate:22050});
  let beforeDecodeState,afterDecodeState,result;
  try{
   await context.suspend();
   beforeDecodeState=context.state;
   if(beforeDecodeState!=='suspended')throw Error(`AudioContext not suspended: ${beforeDecodeState}`);
   const buffer=await context.decodeAudioData(source.buffer.slice(0));
   afterDecodeState=context.state;
   if(afterDecodeState!=='suspended')throw Error(`AudioContext changed state: ${afterDecodeState}`);
   const channel=buffer.getChannelData(0);
   const pcm=new ArrayBuffer(buffer.length*4),view=new DataView(pcm);
   let firstNonzero=-1,lastNonzero=-1,nonfinite=0;
   for(let i=0;i<channel.length;i++){
    const value=channel[i];if(!Number.isFinite(value))nonfinite++;
    if(value!==0){if(firstNonzero<0)firstNonzero=i;lastNonzero=i;}
    view.setFloat32(i*4,value,true);
   }
   const windows=frames.map(frame=>{
    const start=Math.floor(1673+(frame-41)*22050/12);
    const end=Math.floor(1673+(frame-41+1)*22050/12);
    const first=Math.max(0,Math.min(buffer.length,start));
    const last=Math.max(first,Math.min(buffer.length,end));
    let nonzeroSamples=0,peakAbsolute=0;
    for(let i=first;i<last;i++){
     const value=channel[i];if(value!==0)nonzeroSamples++;
     peakAbsolute=Math.max(peakAbsolute,Math.abs(value));
    }
    return {frame,decodedSampleFloor:start,firstSample:first,endSampleExclusive:last,
     availableSamples:last-first,nonzeroSamples,peakAbsolute};
   });
   result={inputBytes:source.length,inputSha256,contextStateBeforeDecode:beforeDecodeState,
    contextStateAfterDecode:afterDecodeState,pcmFormat:'mono 22050 Hz float32 little-endian',
    sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,
    sampleCount:buffer.length,durationSeconds:buffer.duration,
    pcmF32leSha256:await digest(pcm),nonfiniteSamples:nonfinite,
    firstNonzeroSample:firstNonzero,lastNonzeroSample:lastNonzero,windows};
  }finally{await context.close();}
  return {...result,contextStateAfterClose:context.state};
 },{base64,frames:FRAMES});
}

export async function run(slug){
 assert(/^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug),'unique lowercase slug');
 const directory=path.join(OUTPUT,slug);
 assert(!existsSync(directory),'immutable measurement directory');
 await mkdir(OUTPUT,{recursive:true});await mkdir(directory);
 const receipt={schemaVersion:1,kind:'alg-l06-p003-browser-continuous-pcm-v1',
  status:'running',animationId:'shared-alg001-l06-p003',startedAt:new Date().toISOString(),
  browserEngine:'Google Chrome via Playwright chromium channel chrome',
  playbackInvoked:false,listenerAcceptance:false,originalRuntimeParityEstablished:false,
  failures:[],runs:[],networkRequests:[],serverRequests:[]};
 let browser,server,disconnected=false;
 try{
  receipt.inputsBefore=await inputs();
  const {mp3,report}=await sourcePayload();
  receipt.sourceStream={mp3Bytes:mp3.length,mp3Sha256:sha256(mp3),
   sampleRate:report.sourceStream.sampleRate,sourceFirstPacketFrame:41,
   initialLatencySamples:1673,ffmpegV3PcmSha256:report.decode.pcmSha256};
  server=createServer((request,response)=>{
   receipt.serverRequests.push({method:request.method,url:request.url});
   if(request.method!=='GET'||request.url!=='/measure'){
    response.writeHead(404,{'content-type':'text/plain'});response.end();return;
   }
   response.writeHead(200,{'content-type':'text/html; charset=utf-8',
    'cache-control':'no-store'});
   response.end('<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,">');
  });
  await new Promise((resolve,reject)=>{
   server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
  });
  const origin=`http://127.0.0.1:${server.address().port}`;
  receipt.ownedLoopbackOrigin=origin;
  browser=await chromium.launch({channel:'chrome',headless:true});
  browser.on('disconnected',()=>{disconnected=true;});
  receipt.browserVersion=browser.version();
  const context=await browser.newContext();
  const page=await context.newPage();
  page.on('request',request=>receipt.networkRequests.push(request.url()));
  const document=await page.goto(`${origin}/measure`,{waitUntil:'load'});
  assert.equal(document.status(),200);
  assert.equal(await page.evaluate(()=>isSecureContext),true,'loopback secure context for Web Crypto');
  receipt.browserUserAgent=await page.evaluate(()=>navigator.userAgent);
  receipt.browserPlatform=await page.evaluate(()=>navigator.platform);
  const encoded=mp3.toString('base64');
  for(let repeat=1;repeat<=2;repeat++){
   const measured=await decodeOnce(page,encoded);
   assert.equal(measured.inputBytes,263640);
   assert.equal(measured.inputSha256,MP3_SHA);
   assert.equal(measured.sampleRate,22050);
   assert.equal(measured.channels,1);
   assert.equal(measured.sampleCount,1168128);
   assert.equal(measured.nonfiniteSamples,0);
   assert.equal(measured.contextStateAfterClose,'closed');
   assert.deepEqual(measured.windows.map(item=>item.frame),FRAMES);
   receipt.runs.push({repeat,...measured});
  }
  assert.equal(receipt.runs[0].pcmF32leSha256,receipt.runs[1].pcmF32leSha256,
   'two independent Chrome decodes produce same float PCM bytes');
  assert.deepEqual(receipt.runs[0].windows,receipt.runs[1].windows,
   'two independent Chrome frame windows agree');
  assert.deepEqual(receipt.networkRequests,[`${origin}/measure`],
   'only owned blank document request, no audio resource request');
  assert.deepEqual(receipt.serverRequests,[{method:'GET',url:'/measure'}],
   'only exact loopback document served');
  await context.close();
 }catch(error){receipt.failures.push(String(error));}
 finally{
  if(browser){try{await browser.close();}catch(error){receipt.failures.push(`browser close: ${String(error)}`);}}
  if(server){try{await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
   catch(error){receipt.failures.push(`server close: ${String(error)}`);}}
  receipt.browserDisconnected=disconnected;
  receipt.serverClosed=!server?.listening;
  if(!disconnected)receipt.failures.push('owned Chrome browser did not disconnect');
  if(!receipt.serverClosed)receipt.failures.push('owned loopback server still listening');
  try{receipt.inputsAfter=await inputs();}catch(error){receipt.failures.push(`input recheck: ${String(error)}`);}
  receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);
  if(!receipt.inputsStable)receipt.failures.push('input bytes changed during measurement');
  receipt.status=receipt.failures.length===0&&receipt.runs.length===2?
   'technical-measurement-pass-not-audio-acceptance':'failed';
  receipt.finishedAt=new Date().toISOString();
  const output=path.join(directory,'result.json');
  await writeFile(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,output,
   pcmF32leSha256:receipt.runs.map(item=>item.pcmF32leSha256),
   sampleCounts:receipt.runs.map(item=>item.sampleCount),
   browserDisconnected:receipt.browserDisconnected,inputsStable:receipt.inputsStable,
   failures:receipt.failures}));
  if(receipt.status==='failed')process.exitCode=1;
 }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 assert(args.length===2&&args[0]==='--run',
  'Usage: node scripts/measure-alg-l06-p003-continuous-pcm-v1.mjs --run <unique-slug>');
 await run(args[1]);
}
