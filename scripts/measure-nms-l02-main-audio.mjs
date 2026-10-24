import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const BASE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
const output=BASE+'/nms-l02-main-decoder-v1';
const hash=b=>createHash('sha256').update(b).digest('hex');
const pins=[];const bound=async(path,expected)=>{const b=await readFile(path),p={path,bytes:b.length,sha256:hash(b)};if(expected)assert.deepEqual(p,expected);pins.push(p);return b;};
const audit=JSON.parse(await bound(BASE+'/frozen16-audio-segments-v1/receipt.json'));
const stream=audit.records.find(s=>s.animationId==='shared-nms002-l02-p020');
assert.equal(stream.domain,'sprite-69');assert.equal(stream.segments.length,1);assert.equal(stream.segments[0].firstBlockFrame,10);assert.equal(stream.segments[0].lastBlockFrame,151);assert.equal(stream.latencySeek,1673);assert.ok(stream.blocks.every(b=>b.seekSamples>=0));
await bound(stream.source.path,stream.source);const source=await bound(stream.payload.path,stream.payload);await bound(fileURLToPath(import.meta.url));
await mkdir(output);
const report={status:'running',source:stream.source,payload:stream.payload,records:[],requests:[],inputBindings:pins,
 productCalibrationPassed:false,audioAccepted:false,sourceTimelineAlignmentAccepted:false,originalRuntimeAccepted:false};
let browser;
try{
 browser=await chromium.launch({headless:true});report.browserVersion=browser.version();const context=await browser.newContext({serviceWorkers:'block'});
 await context.route('**/*',r=>{report.requests.push(r.request().url());return r.abort();});const page=await context.newPage();
 for(let repeat=0;repeat<2;repeat++){
  const result=await page.evaluate(async base64=>{
   const context=new AudioContext({sampleRate:22050});await context.suspend();
   try{
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),buffer=await context.decodeAudioData(bytes.buffer);
    if(buffer.numberOfChannels!==1)throw Error('Unexpected channels');const raw=new Uint8Array(buffer.length*4),view=new DataView(raw.buffer);
    for(let i=0;i<buffer.length;i++)view.setFloat32(i*4,buffer.getChannelData(0)[i],true);
    let binary='';for(let i=0;i<raw.length;i+=16384)binary+=String.fromCharCode(...raw.subarray(i,i+16384));
    return {sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,samples:buffer.length,pcmBase64:btoa(binary),contextState:context.state,currentTime:context.currentTime};
   }finally{await context.close();}
  },source.toString('base64'));
  const {pcmBase64,...metadata}=result,pcm=Buffer.from(pcmBase64,'base64');
  assert.equal(metadata.sampleRate,22050);assert.equal(metadata.samples,260352);assert.equal(metadata.contextState,'suspended');assert.equal(metadata.currentTime,0);
  report.records.push({...metadata,pcmSha256:hash(pcm)});
  if(repeat===0)await writeFile(output+'/chromium-22050.f32le',pcm,{flag:'wx'});
 }
 assert.deepEqual(report.records[0],report.records[1]);assert.deepEqual(report.requests,[]);
 const plan={sourceSwfSha256:stream.source.sha256,frameDomain:'sprite-69',firstFrame:1,lastFrame:151,audioFirstFrame:10,fps:12,
  latencySamples:1673,sourceSegmentCount:1,sourceHasNegativeSeek:false,decoder:{sourceSha256:stream.payload.sha256,sourceBytes:stream.payload.bytes,
  sampleRate:22050,channels:1,decodedSamples:260352,pcmSha256:report.records[0].pcmSha256}};
 await writeFile(output+'/plan.json',JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
 for(const p of pins)assert.equal(hash(await readFile(p.path)),p.sha256);
 report.inputsUnchanged=true;report.status='native-decoder-binding-measured';
}finally{if(browser)await browser.close();await writeFile(output+'/receipt.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:report.status,records:report.records,output}));}
