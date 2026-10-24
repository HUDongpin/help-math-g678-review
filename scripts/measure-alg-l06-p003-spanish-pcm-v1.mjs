#!/usr/bin/env node
/** Exact separate Spanish SA source: browser-native decode only, never playback. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const AWS='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE=path.join(AWS,'G6-G8-shared/ALG001/L6/SA/L6RW03.mp3');
const AUDIT=path.join(ROOT,'migrations/shared-alg001-l06-p003/audit/sa-host-disposition-v2.json');
const OUTPUT=path.join(ROOT,'output/alg-l06-p003-audio-alignment-20260928/browser-spanish-v1');
const SOURCE_SHA='d280e8f5e653c165755baf2f8960cfd667f03205d2f9aaafe1820a15d327f89a';
const AUDIT_SHA='7a7a4d1e26806569a788d6981593e027b583c84e55cd3d05ff42deae5351f463';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

async function ordinary(file,expected){
 assert.equal(await realpath(file),file,`physical input ${file}`);
 const before=await lstat(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary input ${file}`);
 const bytes=await readFile(file),after=await lstat(file,{bigint:true});
 for(const key of ['dev','ino','size','mode','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${key}: ${file}`);
 const pin={path:file,bytes:bytes.length,sha256:sha256(bytes)};
 if(expected){if(expected.bytes!==undefined)assert.equal(pin.bytes,expected.bytes);
  assert.equal(pin.sha256,expected.sha256);}
 return {bytes,pin};
}
async function inputs(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,AWS,'exact real AWS source root');
 assert.equal(await realpath(AWS),AWS,'physical source root');
 const playwright=await realpath(path.join(ROOT,'node_modules/playwright/package.json'));
 assert.equal(playwright,'/Volumes/WestWorld/HELP MATH 2.0/node_modules/playwright/package.json',
  'reviewed shared Playwright installation');
 return [
  (await ordinary(fileURLToPath(import.meta.url))).pin,
  (await ordinary(playwright)).pin,
  (await ordinary(SOURCE,{bytes:135408,sha256:SOURCE_SHA})).pin,
  (await ordinary(AUDIT,{bytes:12742,sha256:AUDIT_SHA})).pin,
 ];
}
async function source(){
 const audio=(await ordinary(SOURCE,{bytes:135408,sha256:SOURCE_SHA})).bytes;
 const audit=JSON.parse((await ordinary(AUDIT,{bytes:12742,sha256:AUDIT_SHA})).bytes);
 assert.equal(audit.kind,'alg-l06-p003-separate-sa-host-disposition-v2');
 assert.equal(audit.animationId,'shared-alg001-l06-p003');
 assert.equal(audit.inputs.separateSa.path,SOURCE);
 assert.equal(audit.inputs.separateSa.bytes,audio.length);
 assert.equal(audit.inputs.separateSa.sha256,SOURCE_SHA);
 assert.equal(audit.applicability.sourceRole,'explicit optional Spanish page-audio operation');
 assert.equal(audit.applicability.actualSpokenLanguage,'unverified');
 assert.equal(audit.acceptanceEffects.audioAccepted,false);
 return audio;
}

/** The fresh AudioContext is suspended before decode and closed afterward.
 * Instrumented instance methods verify no playback node, gain, or resume call. */
async function decodeOnce(page,base64){
 return page.evaluate(async encoded=>{
  const source=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
  const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
   .map(value=>value.toString(16).padStart(2,'0')).join('');
  const context=new AudioContext({sampleRate:48000});
  const calls={bufferSources:0,gainNodes:0,resumes:0};
  const originalSource=context.createBufferSource.bind(context);
  const originalGain=context.createGain.bind(context);
  const originalResume=context.resume.bind(context);
  context.createBufferSource=(...args)=>{calls.bufferSources++;return originalSource(...args);};
  context.createGain=(...args)=>{calls.gainNodes++;return originalGain(...args);};
  context.resume=(...args)=>{calls.resumes++;return originalResume(...args);};
  let result;
  try{
   await context.suspend();
   const before=context.state;
   if(before!=='suspended')throw Error(`Context before decode: ${before}`);
   const audio=await context.decodeAudioData(source.buffer.slice(0));
   const after=context.state;
   if(after!=='suspended')throw Error(`Context after decode: ${after}`);
   if(audio.numberOfChannels!==1)throw Error(`Expected mono, got ${audio.numberOfChannels}`);
   const samples=audio.getChannelData(0),pcm=new ArrayBuffer(audio.length*4),view=new DataView(pcm);
   let nonfinite=0,nonzero=0,firstNonzero=-1,lastNonzero=-1,peakAbsolute=0;
   for(let index=0;index<samples.length;index++){
    const value=samples[index];
    if(!Number.isFinite(value))nonfinite++;
    if(value!==0){nonzero++;if(firstNonzero<0)firstNonzero=index;lastNonzero=index;}
    peakAbsolute=Math.max(peakAbsolute,Math.abs(value));
    view.setFloat32(index*4,value,true);
   }
   result={inputBytes:source.length,inputSha256:await digest(source.buffer),
    contextStateBeforeDecode:before,contextStateAfterDecode:after,
    pcmFormat:'mono 48000 Hz float32 little-endian',sampleRate:audio.sampleRate,
    channels:audio.numberOfChannels,sampleCount:audio.length,
    durationSeconds:audio.duration,pcmF32leSha256:await digest(pcm),
    nonfiniteSamples:nonfinite,nonzeroSamples:nonzero,
    firstNonzeroSample:firstNonzero,lastNonzeroSample:lastNonzero,peakAbsolute,
    playbackCalls:calls};
  }finally{await context.close();}
  return {...result,contextStateAfterClose:context.state};
 },base64);
}

export async function run(slug){
 assert(/^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug),'unique evidence slug');
 const directory=path.join(OUTPUT,slug);
 assert(!existsSync(directory),'immutable evidence directory');
 await mkdir(OUTPUT,{recursive:true});await mkdir(directory);
 const receipt={schemaVersion:1,kind:'alg-l06-p003-separate-sa-chrome-pcm-v1',
  status:'running',animationId:'shared-alg001-l06-p003',
  startedAt:new Date().toISOString(),browserEngine:'Google Chrome via Playwright channel chrome',
  sourceRole:'explicit optional Spanish page-audio operation',
  playbackInvoked:false,listenerAcceptance:false,originalRuntimeParityEstablished:false,
  audioAccepted:false,humanAccepted:false,ownerAccepted:false,
  failures:[],runs:[],networkRequests:[],serverRequests:[]};
 let browser,server,context,disconnected=false;
 try{
  receipt.inputsBefore=await inputs();
  const audio=await source();
  receipt.sourceAudio={path:SOURCE,bytes:audio.length,sha256:sha256(audio),
   sourceDeclaredSampleRate:48000,sourceDeclaredChannels:1};
  server=createServer((request,response)=>{
   receipt.serverRequests.push({method:request.method,url:request.url});
   if(request.method!=='GET'||request.url!=='/measure'){
    response.writeHead(404,{'content-type':'text/plain'});response.end();return;
   }
   response.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
   response.end('<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,"><title>SA decode only</title>');
  });
  await new Promise((resolve,reject)=>{
   server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
  });
  const origin=`http://127.0.0.1:${server.address().port}`;
  receipt.ownedLoopbackOrigin=origin;
  browser=await chromium.launch({channel:'chrome',headless:true});
  browser.on('disconnected',()=>{disconnected=true;});
  receipt.browserVersion=browser.version();
  context=await browser.newContext();
  const page=await context.newPage();
  page.on('request',request=>receipt.networkRequests.push(request.url()));
  const document=await page.goto(`${origin}/measure`,{waitUntil:'load'});
  assert.equal(document.status(),200);
  assert.equal(await page.evaluate(()=>isSecureContext),true,'loopback Web Crypto context');
  receipt.browserUserAgent=await page.evaluate(()=>navigator.userAgent);
  receipt.browserPlatform=await page.evaluate(()=>navigator.platform);
  const encoded=audio.toString('base64');
  for(let repeat=1;repeat<=2;repeat++){
   const measured=await decodeOnce(page,encoded);
   assert.equal(measured.inputBytes,135408);
   assert.equal(measured.inputSha256,SOURCE_SHA);
   assert.equal(measured.sampleRate,48000);
   assert.equal(measured.channels,1);
   assert(measured.sampleCount>0&&measured.durationSeconds>0);
   assert.equal(measured.durationSeconds,measured.sampleCount/48000);
   assert.equal(measured.nonfiniteSamples,0);
   assert(measured.nonzeroSamples>0);
   assert.deepEqual(measured.playbackCalls,{bufferSources:0,gainNodes:0,resumes:0});
   assert.equal(measured.contextStateAfterClose,'closed');
   receipt.runs.push({repeat,...measured});
  }
  assert.equal(receipt.runs[0].sampleCount,receipt.runs[1].sampleCount);
  assert.equal(receipt.runs[0].durationSeconds,receipt.runs[1].durationSeconds);
  assert.equal(receipt.runs[0].pcmF32leSha256,receipt.runs[1].pcmF32leSha256,
   'independent native decodes agree byte-for-byte');
  assert.deepEqual(receipt.networkRequests,[`${origin}/measure`]);
  assert.deepEqual(receipt.serverRequests,[{method:'GET',url:'/measure'}]);
 }catch(error){receipt.failures.push(String(error?.stack??error));}
 finally{
  if(context)try{await context.close();}catch(error){receipt.failures.push(`context close: ${String(error)}`);}
  if(browser)try{await browser.close();}catch(error){receipt.failures.push(`browser close: ${String(error)}`);}
  if(server)try{await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
   catch(error){receipt.failures.push(`server close: ${String(error)}`);}
  receipt.browserDisconnected=disconnected;
  receipt.serverClosed=!server?.listening;
  if(!disconnected)receipt.failures.push('owned Chrome browser did not disconnect');
  if(!receipt.serverClosed)receipt.failures.push('owned loopback server still listening');
  try{receipt.inputsAfter=await inputs();}
  catch(error){receipt.failures.push(`input recheck: ${String(error)}`);}
  receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);
  if(!receipt.inputsStable)receipt.failures.push('source or script changed during measurement');
  receipt.status=receipt.failures.length===0&&receipt.runs.length===2
   ?'technical-measurement-pass-not-audio-acceptance':'failed';
  receipt.finishedAt=new Date().toISOString();
  const output=path.join(directory,'result.json');
  await writeFile(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,output,
   sampleCounts:receipt.runs.map(item=>item.sampleCount),
   pcmF32leSha256:receipt.runs.map(item=>item.pcmF32leSha256),
   browserDisconnected:receipt.browserDisconnected,serverClosed:receipt.serverClosed,
   inputsStable:receipt.inputsStable,failures:receipt.failures}));
  if(receipt.status==='failed')process.exitCode=1;
 }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 assert(args.length===2&&args[0]==='--run',
  'Usage: node scripts/measure-alg-l06-p003-spanish-pcm-v1.mjs --run <unique-slug>');
 await run(args[1]);
}
