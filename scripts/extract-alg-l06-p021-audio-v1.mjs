#!/usr/bin/env node
/** Exact P021 SWF stream and independent SA extraction; no playback claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractDomainAudio} from './lib/swf-domain-audio-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HERE='output/alg-l06-p021-audio-v1';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB14.swf',bytes:131483,
 sha256:'4e87aacf4c5f749f559817dc2c0ec8b023fba75652217b9ce2543728e06eb5eb'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB14.mp3',bytes:355152,
 sha256:'74d2579aeb963ca841d501a80e9830c05ae23153a87daa6e0a277c105f31f5d9'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});

function stableRead(file,expected){
 assert.equal(fs.realpathSync(file),file,`physical source: ${file}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
  before.size<32n*1024n*1024n,`ordinary bounded source: ${file}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable source: ${file}`);
 if(expected){assert.equal(bytes.length,expected.bytes);assert.equal(sha(bytes),expected.sha256);}
 return bytes;
}
function decode(bytes,rate){
 const run=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-xerror',
  '-f','mp3','-i','pipe:0','-f','f32le','-acodec','pcm_f32le','-ac','1',
  '-ar',String(rate),'pipe:1'],{input:bytes,maxBuffer:16*1024*1024});
 if(run.error)throw run.error;
 assert.equal(run.status,0,run.stderr.toString().slice(0,800));
 assert.equal(run.stderr.length,0,'no decode warnings');
 assert.equal(run.stdout.length%4,0,'float32 samples');
 return run.stdout;
}
const pcm=(bytes,rate)=>({format:'mono-f32le',sampleRate:rate,samples:bytes.length/4,
 durationSeconds:bytes.length/4/rate,sha256:sha(bytes)});
function output(relative,bytes,mode){
 const target=path.join(ROOT,relative);
 if(mode==='--write'){
  fs.mkdirSync(path.dirname(target),{recursive:true});
  try{fs.writeFileSync(target,bytes,{flag:'wx'});}
  catch(error){if(error?.code!=='EEXIST')throw error;
   assert(stableRead(target).equals(bytes),`no-replace output ${relative}`);}
 }else assert(stableRead(target).equals(bytes),`output drift ${relative}`);
 return pin(relative,bytes);
}
export function build(source,spanish){
 assert.equal(source.length,SWF.bytes);assert.equal(sha(source),SWF.sha256);
 assert.equal(spanish.length,SA.bytes);assert.equal(sha(spanish),SA.sha256);
 const domains=extractDomainAudio(source);
 assert.deepEqual(domains.map(d=>[d.id,d.declaredFrames,d.blocks.length]),
  [['root',10,0],['sprite-43',377,371]]);
 assert(domains.every(d=>d.trailer===null),'no SWF timeline trailer');
 const domain=domains[1];
 assert.deepEqual(domain.heads,[{frame:1,offset:7605,hex:'0a2a2d078906'}]);
 const packets=[];let cumulative=0;
 for(let index=0;index<domain.blocks.length;index++){
  const block=domain.blocks[index];
  assert.equal(block.frame,index+7,'one contiguous source block per frame 7..377');
  packets.push({frame:block.frame,offset:block.offset,
   declaredSampleStart:cumulative,declaredSamples:block.samples,
   rawSeekSamples:block.seek,mp3Bytes:block.payload.length,
   payloadSha256:sha(block.payload)});
  cumulative+=block.samples;
 }
 assert.equal(cumulative,680832,'source declared PCM samples');
 assert.deepEqual(packets.filter(p=>p.mp3Bytes===0).map(p=>p.frame),[8]);
 assert(packets.every(p=>p.rawSeekSamples>=0),'no negative source seek');
 assert.equal(packets[0].rawSeekSamples,1673,'source first-block seek');
 const main=Buffer.concat(domain.blocks.map(b=>b.payload));
 const mainPath=`${HERE}/sprite-43-source-v1.mp3`;
 const saPath=`${HERE}/separate-sa-source-v1.mp3`;
 const mainPcm=decode(main,22050),saPcm=decode(spanish,48000);
 assert.equal(mainPcm.length/4,cumulative,'ffmpeg source stream complete');
 const version=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(version.status,0);
 const report={schemaVersion:1,kind:'alg-l06-p021-audio-source-audit-v1',
  status:'source-domain-extraction-not-playback-or-listening-acceptance',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT}},
  format:{fps:12,codec:'MP3',sampleRate:22050,channels:1,
   averageSamplesPerFrame:1837,initialLatencySamples:1673},
  domains:domains.map(d=>({id:d.id,declaredFrames:d.declaredFrames,
   streamHeadCount:d.heads.length,blockCount:d.blocks.length,trailer:d.trailer})),
  main:{domain:domain.id,frameDomain:'sprite-43',declaredFrames:377,
   firstBlockFrame:7,lastBlockFrame:377,blockCount:371,absentBlockFrames:[],
   zeroPayloadBlocks:packets.filter(p=>p.mp3Bytes===0),
   negativeSeekBlocks:packets.filter(p=>p.rawSeekSamples<0),
   firstBlockRawSeekSamples:packets[0].rawSeekSamples,
   declaredSamples:cumulative,extractedMp3:pin(mainPath,main),decode:pcm(mainPcm,22050),
   candidateNativeEndFrame:7+(cumulative-1673)/22050*12,packets},
  separateSa:{copy:pin(saPath,spanish),decode:pcm(saPcm,48000)},
  ffmpegVersion:version.stdout.split('\n')[0],
  limits:{originalRuntimeObserved:false,originalHostStartStopAlignmentAccepted:false,
   browserDecodeObserved:false,listeningAccepted:false,audioAccepted:false,
   separateSaExplicitTriggerRequired:true,separateSaSplicedIntoMain:false,
   localeChangeStartsSa:false}};
 const reportPath=`${HERE}/audio-source-audit-v1.json`;
 return {report,outputs:[[mainPath,main],[saPath,spanish],
  [reportPath,Buffer.from(JSON.stringify(report,null,2)+'\n')]]};
}
export function run(mode){
 assert(['--write','--check'].includes(mode),'usage: extract-alg-l06-p021-audio-v1.mjs --write|--check');
 const source=stableRead(path.join(SOURCE_ROOT,SWF.path),SWF);
 const spanish=stableRead(path.join(SOURCE_ROOT,SA.path),SA);
 const {report,outputs}=build(source,spanish);
 return {mode,outputs:outputs.map(([relative,bytes])=>output(relative,bytes,mode)),
  domain:report.main.domain,blocks:report.main.blockCount,
  mainSamples:report.main.decode.samples,saSamples:report.separateSa.decode.samples,
  candidateNativeEndFrame:report.main.candidateNativeEndFrame,
  originalRuntimeAccepted:false,listeningAccepted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
