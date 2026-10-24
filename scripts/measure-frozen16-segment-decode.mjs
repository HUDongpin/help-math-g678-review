#!/usr/bin/env node
// Source-run decoder experiment. This never changes a product or acceptance record.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir, realpath, stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
const IDS=['shared-alg001-l05-p030','shared-alg001-l08-p025','shared-geo001-l11-p030'];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const pins=new Map();
async function bound(file,expected){
  const before=await stat(file),bytes=await readFile(file),after=await stat(file);
  assert.deepEqual([before.ino,before.size,before.mtimeMs],[after.ino,after.size,after.mtimeMs]);
  const pin={path:file,bytes:bytes.length,sha256:hash(bytes)};
  if(expected)assert.deepEqual(pin,expected);
  pins.set(file,pin);return bytes;
}
export function comparePcm(reference,candidate,offsetSamples=0){
  assert.ok(Number.isSafeInteger(offsetSamples)&&offsetSamples>=0);
  assert.ok(reference.length%4===0&&candidate.length>0&&candidate.length%4===0);
  assert.ok(offsetSamples*4+candidate.length<=reference.length,'Candidate exceeds reference range');
  let firstDifference=null,lastDifference=null,differentSamples=0,sse=0,peak=0;
  for(let i=0;i<candidate.length/4;i++){
    const x=reference.readFloatLE((offsetSamples+i)*4),y=candidate.readFloatLE(i*4);
    assert.ok(Number.isFinite(x)&&Number.isFinite(y));
    const difference=x-y;sse+=difference*difference;peak=Math.max(peak,Math.abs(difference));
    if(reference.readUInt32LE((offsetSamples+i)*4)!==candidate.readUInt32LE(i*4)){
      firstDifference??=i;lastDifference=i;differentSamples++;
    }
  }
  return {referenceOffsetSamples:offsetSamples,comparedSamples:candidate.length/4,
    byteIdentical:differentSamples===0,differentSamples,firstDifference,lastDifference,
    identicalSuffixSamples:lastDifference===null?candidate.length/4:candidate.length/4-lastDifference-1,
    rmse:Math.sqrt(sse/(candidate.length/4)),peakAbsoluteDifference:peak};
}
async function decode(page,source){
  return page.evaluate(async base64=>{
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
    const context=new OfflineAudioContext(1,1,22050);
    const buffer=await context.decodeAudioData(bytes.buffer);
    if(buffer.numberOfChannels!==1)throw Error('Expected measured mono source');
    const raw=new Uint8Array(buffer.length*4),view=new DataView(raw.buffer);
    const samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++){
      if(!Number.isFinite(samples[i]))throw Error('Nonfinite decoded sample');
      view.setFloat32(i*4,samples[i],true);
    }
    let binary='';for(let i=0;i<raw.length;i+=16384)binary+=String.fromCharCode(...raw.subarray(i,i+16384));
    return {sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,samples:buffer.length,
      pcmBase64:btoa(binary),sourceNodesCreated:0,renderingStarted:false};
  },source.toString('base64'));
}
async function main(){
  assert.equal(process.argv.length,4);assert.equal(process.argv[2],'--run');assert.match(process.argv[3],/^v[1-9][0-9]*$/);
  const output=path.join(BASE,`gapped-stream-decoder-${process.argv[3]}`);
  const input=path.join(BASE,'frozen16-audio-segments-v1/receipt.json');
  const audit=JSON.parse(await bound(input));
  const streams=audit.records.filter(r=>r.segments.length>1);
  assert.deepEqual(streams.map(s=>s.animationId),IDS);
  const guardFiles=['packages/demos/private-current-js-registry.json',
    'catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v16.json',
    'catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v16.activation.json'];
  for(const file of guardFiles)await bound(path.join(ROOT,file));
  await bound(fileURLToPath(import.meta.url));
  const ffmpeg=await realpath('/opt/homebrew/bin/ffmpeg');
  for(const file of [ffmpeg,await realpath(process.execPath),await realpath(chromium.executablePath())])await bound(file);
  const report={schemaVersion:1,startedAt:new Date().toISOString(),status:'running',
    scope:'Three original frozen16 main streams: full payload versus exact contiguous tag-run decode; no scheduling or audio acceptance',
    records:[],requests:[],inputBindings:[],outputs:[],
    acceptanceEffects:{productRegistrationChanged:false,sourceTimelineAlignmentAccepted:false,
      productCalibrationPassed:false,audioAccepted:false,originalRuntimeAccepted:false,
      humanAccepted:false,ownerAccepted:false,scaleOutAuthorized:false}};
  await mkdir(output);
  const save=async(name,bytes)=>{const file=path.join(output,name);await writeFile(file,bytes,{flag:'wx'});
    const pin={path:file,bytes:bytes.length,sha256:hash(bytes)};report.outputs.push(pin);return pin;};
  let browser;
  try{
    browser=await chromium.launch({headless:true});report.browserVersion=browser.version();
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.route('**/*',route=>{report.requests.push(route.request().url());return route.abort();});
    const page=await context.newPage();
    for(const stream of streams){
      await bound(stream.source.path,stream.source);
      const xml=path.join(BASE,'frozen16-audio-v1',stream.animationId,'source.xml');
      await bound(xml,audit.inputBindings.find(p=>p.path===xml));
      const source=await bound(stream.payload.path,stream.payload);
      const record={animationId:stream.animationId,domain:stream.domain,source:stream.source,
        payload:stream.payload,sampleRate:stream.sampleRate,fps:Number(stream.frameRate),latencySeek:stream.latencySeek,
        firstAudioFrame:stream.segments[0].firstBlockFrame,segments:[],negativeSeekBlocks:stream.blocks.filter(b=>b.seekSamples<0),
        frameSampleRatio:stream.sampleRate/Number(stream.frameRate),headerAverageSamples:stream.headerAverageSamplesPerFrame};
      report.records.push(record);
      assert.equal(record.sampleRate,22050);assert.equal(record.fps,12);
      const chunks=[{name:'full',bytes:source},...stream.segments.map((s,i)=>{
        const bytes=source.subarray(s.mp3ByteOffset,s.mp3ByteOffset+s.mp3Bytes);
        assert.equal(hash(bytes),s.payloadSha256);return {name:`run-${i+1}`,bytes,segment:s};
      })];
      let full;const parts=[];
      for(const chunk of chunks){
        const first=await decode(page,chunk.bytes),second=await decode(page,chunk.bytes);
        assert.deepEqual(first,second,'Repeated native decode drift');
        const {pcmBase64,...metadata}=first,pcm=Buffer.from(pcmBase64,'base64');
        const pcmBinding=await save(`${stream.animationId}-${chunk.name}.f32le`,pcm);
        const ff=spawnSync(ffmpeg,['-v','error','-xerror','-c:a','mp3float','-f','mp3','-i','pipe:0','-f','f32le','-acodec','pcm_f32le','pipe:1'],
          {input:chunk.bytes,maxBuffer:32*1024*1024,timeout:30000});
        const ffRecord={exitCode:ff.status,error:ff.error?.message??null,stderr:ff.stderr?.toString()??'',
          pcm:ff.status===0?await save(`${stream.animationId}-${chunk.name}-ffmpeg.f32le`,ff.stdout):null};
        const data={...metadata,repeatByteIdentical:true,compressed:{bytes:chunk.bytes.length,sha256:hash(chunk.bytes)},
          pcm:pcmBinding,ffmpeg:ffRecord};
        if(chunk.name==='full'){
          full=pcm;record.full=data;
          assert.equal(first.samples,stream.segments.reduce((sum,s)=>sum+s.encodedSamples,0));
        }else{
          const segment=chunk.segment;parts.push(pcm);
          data.sourceRun=segment;
          data.expectedSamples=segment.encodedSamples;
          data.samplesEqualEncoded=first.samples===segment.encodedSamples;
          data.fullDecodeComparison=segment.encodedSampleOffset*4+pcm.length<=full.length?
            comparePcm(full,pcm,segment.encodedSampleOffset):null;
          data.coordinates='Encoded sample offset is a byte-order coordinate; not an accepted SWF frame/PCM mapping';
          record.segments.push(data);
        }
      }
      const joined=Buffer.concat(parts);
      record.concatenatedIndependentDecodes={samples:joined.length/4,
        comparison:joined.length===full.length?comparePcm(full,joined):null};
      console.log(JSON.stringify({animationId:stream.animationId,fullSamples:record.full.samples,
        runs:record.segments.map(s=>({samples:s.samples,expected:s.expectedSamples,differentSamples:s.fullDecodeComparison?.differentSamples,
          firstDifference:s.fullDecodeComparison?.firstDifference,lastDifference:s.fullDecodeComparison?.lastDifference,ffmpegExit:s.ffmpeg.exitCode}))}));
    }
    assert.deepEqual(report.requests,[]);
    for(const pin of [...pins.values()])await bound(pin.path,pin);
    report.inputsUnchanged=true;report.status='measured-not-accepted';
  }catch(error){report.status='failed';report.failure=error.stack;throw error;}
  finally{
    if(browser)await browser.close();
    report.finishedAt=new Date().toISOString();report.inputBindings=[...pins.values()];
    await writeFile(path.join(output,'receipt.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
