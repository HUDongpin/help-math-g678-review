#!/usr/bin/env node
/** Source-locked P013 audio extraction. No playback or acceptance decision. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB04.swf',bytes:269912,
 sha256:'1be47750557385ef91c648fb87fdcde642d342caadc35da7a1f7a2d1fdb11d35'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB04.mp3',bytes:327936,
 sha256:'2db938405bd646e4bf37e0b9cdf5438cc65451a2d4f7304c93dbc2b6653e8575'};
const OUT='migrations/shared-alg001-l06-p013/audit/audio-v1';
const MAIN_PATH=`${OUT}/continuous-source-v1.mp3`;
const SA_PATH=`${OUT}/separate-sa-source-v1.mp3`;
const REPORT_PATH=`${OUT}/audio-source-audit-v1.json`;
const RATE=22050,FPS=12,FIRST_FRAME=2,LAST_FRAME=372,HEAD_AVERAGE=1837,LATENCY=1673;
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});

function readStable(file,expected){
 assert.equal(realpathSync(file),file,`physical file: ${file}`);
 const before=lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&before.size<64n*1024n*1024n,
  `ordinary bounded file: ${file}`);
 const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable read: ${file}`);
 if(expected){assert.equal(bytes.length,expected.bytes,`size: ${file}`);
  assert.equal(sha256(bytes),expected.sha256,`sha256: ${file}`);}
 return bytes;
}
function ffmpegDecode(bytes,rate){
 const args=['-hide_banner','-loglevel','error','-nostdin','-xerror','-f','mp3','-i','pipe:0',
  '-f','f32le','-acodec','pcm_f32le','-ac','1','-ar',String(rate),'pipe:1'];
 const result=spawnSync('ffmpeg',args,{input:bytes,maxBuffer:16*1024*1024});
 if(result.error)throw result.error;
 assert.equal(result.status,0,result.stderr.toString().slice(0,800));
 assert.equal(result.stderr.length,0,'ffmpeg decode warnings');
 assert.equal(result.stdout.length%4,0,'float32 PCM');
 return result.stdout;
}
function pcmPin(bytes,rate){return {format:'mono-f32le',sampleRate:rate,
 samples:bytes.length/4,durationSeconds:bytes.length/4/rate,sha256:sha256(bytes)};}
function window(pcm,frame){
 const start=Math.min(pcm.length/4,Math.floor(LATENCY+(frame-FIRST_FRAME)*RATE/FPS));
 const end=Math.min(pcm.length/4,Math.floor(LATENCY+(frame+1-FIRST_FRAME)*RATE/FPS));
 let nonzero=0,peak=0,sumSquares=0;
 for(let i=start;i<end;i++){
  const value=pcm.readFloatLE(i*4);assert(Number.isFinite(value));
  if(value!==0)nonzero++;peak=Math.max(peak,Math.abs(value));sumSquares+=value*value;
 }
 return {frame,startSample:start,endSampleExclusive:end,nonzeroSamples:nonzero,
  peakAbsolute:peak,rms:end>start?Math.sqrt(sumSquares/(end-start)):0};
}
function writeOrCheck(relative,bytes,mode){
 const file=path.join(ROOT,relative);
 if(mode==='--write'){
  mkdirSync(path.dirname(file),{recursive:true});
  try{writeFileSync(file,bytes,{flag:'wx'});}
  catch(error){if(error?.code!=='EEXIST')throw error;
   assert(readStable(file).equals(bytes),`immutable output: ${relative}`);}
 }else assert(readStable(file).equals(bytes),`output drift: ${relative}`);
 return pin(relative,bytes);
}

export function buildAudit(source,sa,decoder=ffmpegDecode){
 assert.equal(source.length,SWF.bytes);assert.equal(sha256(source),SWF.sha256);
 assert.equal(sa.length,SA.bytes);assert.equal(sha256(sa),SA.sha256);
 const stream=extractTerminalStream(source,'sprite-140');
 assert.deepEqual(stream.actions.map(({domain,frame,hex})=>[domain,frame,hex]),[
  ['root',1,'961a00006a756d705f636865636b000701000000005f6c6576656c30001c96130000496e7465726e616c5072656c6f61646572004e960d0000676f746f416e64506c61790052170700'],
  ['root',6,'0700']]);
 assert.deepEqual(stream.heads,[{domain:'sprite-140',frame:1,hex:'0a2a2d078906'}]);
 const head=Buffer.from(stream.heads[0].hex,'hex');
 assert.equal(head.readUInt16LE(2),HEAD_AVERAGE);
 assert.equal(head.readInt16LE(4),LATENCY);
 assert.equal(stream.blocks.length,368);
 assert.equal(stream.blocks[0].frame,FIRST_FRAME);
 assert.equal(stream.blocks.at(-1).frame,LAST_FRAME);
 const byFrame=new Map(stream.blocks.map(block=>[block.frame,block]));
 assert.equal(byFrame.size,stream.blocks.length,'one stream block per occupied frame');
 const absentBlockFrames=Array.from({length:LAST_FRAME-FIRST_FRAME+1},(_,i)=>i+FIRST_FRAME)
  .filter(frame=>!byFrame.has(frame));
 assert.deepEqual(absentBlockFrames,[253,254,255]);
 const zeroPayload=stream.blocks.filter(block=>block.mp3Bytes===0);
 assert.deepEqual(zeroPayload,[{frame:3,samples:0,seek:0,mp3Bytes:0},
  {frame:161,samples:0,seek:-2299,mp3Bytes:0},
  {frame:252,samples:0,seek:-1850,mp3Bytes:0}]);
 let declaredStart=0;
 const packets=stream.blocks.map(block=>{
  const result={frame:block.frame,declaredSampleStart:declaredStart,
   declaredSamples:block.samples,rawSeekSamples:block.seek,mp3Bytes:block.mp3Bytes,
   residualToHeadAverageFromFrame2:declaredStart+block.seek-
    (block.frame-FIRST_FRAME)*HEAD_AVERAGE};
  declaredStart+=block.samples;return result;
 });
 assert.equal(declaredStart,672192);
 assert.equal(stream.mp3.length,151710);
 const at=frame=>packets.find(packet=>packet.frame===frame);
 for(const [first,last,residual] of [[4,160,-164],[162,251,-1892],[256,372,-8804]])
  assert(packets.filter(p=>p.frame>=first&&p.frame<=last)
   .every(p=>p.residualToHeadAverageFromFrame2===residual));
 assert.equal(sha256(stream.mp3),'3d646619b33b9e859aff68bf331f224158916aa9f4e99b16cdc910791c7d41c1');
 const mainPcm=decoder(stream.mp3,RATE),saPcm=decoder(sa,48000);
 assert.equal(mainPcm.length/4,declaredStart,'complete MP3 sample decode');
 assert.equal(saPcm.length/4,1124352);
 assert.equal(sha256(mainPcm),'df2109f7211fc571f7cc33e639d5b063b73b84c3b5b6dc52c84bd896056f775c');
 assert.equal(sha256(saPcm),'3fbdd9377e20c341a2dbb06fc4020eac50e128e94f2eb80ef80b0082836dce98');
 const decoderVersion=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(decoderVersion.status,0);
 const version=decoderVersion.stdout.split('\n')[0];
 const frames=[2,3,4,159,160,161,162,250,251,252,253,254,255,256,257,370,371,372]
  .map(frame=>window(mainPcm,frame));
 const sourceEndSeconds=(FIRST_FRAME-1)/FPS+(mainPcm.length/4-LATENCY)/RATE;
 const terminalSeconds=(LAST_FRAME-1)/FPS;
 const report={schemaVersion:1,kind:'alg-l06-p013-audio-source-audit-v1',
  status:'source-and-decoder-measured-modern-candidate-not-original-runtime-or-listening',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT}},
  swf:{signature:'CWS',version:6,stage:{width:800,height:600},fps:FPS,
   rootFrames:10,mainDomain:'sprite-140',mainFrames:LAST_FRAME,
   scriptActions:stream.actions,streamHead:{...stream.heads[0],
    codec:'MP3',sampleRate:RATE,channels:1,averageSamplesPerFrame:HEAD_AVERAGE,
    initialLatencySamples:LATENCY}},
  embedded:{firstBlockFrame:FIRST_FRAME,lastBlockFrame:LAST_FRAME,
   blockCount:stream.blocks.length,absentBlockFrames,zeroPayloadBlocks:zeroPayload,
   declaredSamples:declaredStart,extractedMp3:pin(MAIN_PATH,stream.mp3),
   packetGroups:[{firstFrame:2,lastFrame:161,blockCount:160,normalHeadAverageResidual:-164},
    {firstFrame:162,lastFrame:252,blockCount:91,normalHeadAverageResidual:-1892},
    {firstFrame:256,lastFrame:372,blockCount:117,normalHeadAverageResidual:-8804}],
   boundaryPackets:[2,3,4,160,161,162,251,252,256,257,372].map(at),packets},
  decode:{ffmpegVersion:version,main:pcmPin(mainPcm,RATE),
   separateSa:pcmPin(saPcm,48000),separateSaCopy:pin(SA_PATH,sa),
   mainWindowsByVisualFrameCandidate:frames},
  scheduleCandidate:{kind:'continuous-main-source-v1',
   sourceFirstBlockFrame:FIRST_FRAME,sourceLastFrame:LAST_FRAME,sourceTerminalStopActionPresent:false,
   startAtVisualSeconds:(FIRST_FRAME-1)/FPS,initialLatencySamples:LATENCY,
   oneConcatenatedMp3Transport:true,noSyntheticSilenceForMissingBlockFrames:true,
   directArbitraryFrameSeekSupported:false,
   replay:'restart extracted main MP3 at its initial latency on an explicit Replay',
   decodedEndSeconds:sourceEndSeconds,lastVisualFrameStartSeconds:terminalSeconds,
   decodedEndBeforeLastVisualFrameSeconds:terminalSeconds-sourceEndSeconds,
   separateSa:'source present; host trigger, language, and timing unverified; keep separate and user-triggered only'},
  limits:{negativeSeekFrames161And252OperationalMeaningResolved:false,
   missingBlocksProveAudibleSilence:false,originalRuntimeTraceObserved:false,
   separateSaHostBindingVerified:false,audioAccepted:false,listeningAccepted:false,
   currentJsIntegrationChanged:false}};
 return {report,mainMp3:stream.mp3,saMp3:sa};
}

export function run(mode){
 assert(['--write','--check'].includes(mode),'usage: node script --write|--check');
 const swf=readStable(path.join(SOURCE_ROOT,SWF.path),SWF);
 const sa=readStable(path.join(SOURCE_ROOT,SA.path),SA);
 const {report,mainMp3,saMp3}=buildAudit(swf,sa);
 const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
 const outputs=[writeOrCheck(MAIN_PATH,mainMp3,mode),
  writeOrCheck(SA_PATH,saMp3,mode),writeOrCheck(REPORT_PATH,bytes,mode)];
 return {mode,outputs,mainDecodedSamples:report.decode.main.samples,
  separateSaDecodedSamples:report.decode.separateSa.samples,
  absentBlockFrames:report.embedded.absentBlockFrames,
  audioAccepted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one mode');
 console.log(JSON.stringify(run(process.argv[2]),null,2));
}
