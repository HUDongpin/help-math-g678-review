#!/usr/bin/env node
/** Exact-source P010 stream extraction and EOF decode; no runtime/listening acceptance. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {lstatSync,mkdirSync,readFileSync,realpathSync,renameSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/RW/L6RW09.swf',bytes:114334,
 sha256:'96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6RW09.mp3',bytes:301056,
 sha256:'903c1bd16cebf9f1ceda0d9b8a47905cae20f380bb857fa33fc855a6db350275'};
const OUT='migrations/shared-alg001-l06-p010/audit/audio-v1';
const MAIN_PATH=`${OUT}/continuous-source-v1.mp3`;
const SA_PATH=`${OUT}/separate-sa-source-v1.mp3`;
const REPORT_PATH=`${OUT}/audio-source-audit-v1.json`;
const INVENTORY='migrations/shared-alg001-l06-p010/audio-inventory.csv';
const EMPTY_INVENTORY='cue_id,language,source_file,sha256,start_frame,start_frame_domain_id,start_semantics,duration_ms,format,channels,sample_rate_hz,source_character_id,notes\n';
const RATE=22050,SA_RATE=48000,FPS=12,FIRST=4,LAST=303,HEAD_AVERAGE=1837,LATENCY=1673;
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
 assert.equal(result.stderr.length,0,'full EOF decode must have no warnings');
 assert.equal(result.stdout.length%4,0,'float32 PCM');
 return result.stdout;
}
function pcmPin(bytes,rate){return {format:'mono-f32le',sampleRate:rate,
 samples:bytes.length/4,durationSeconds:bytes.length/4/rate,sha256:sha256(bytes)};}
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
function inventory(report){
 const main=report.embedded.extractedMp3,sa=report.decode.separateSaCopy;
 return Buffer.from(EMPTY_INVENTORY+
  `main-continuous,und,audit/audio-v1/continuous-source-v1.mp3,${main.sha256},4,sprite-52,timeline-frame,${report.decode.main.durationSeconds*1000},mp3,1,22050,52,"Source stream cycle; initial seek 1673 samples; EOF before last block frame; no authored stop; original sync and listening unaccepted"\n`+
  `optional-sa,und,audit/audio-v1/separate-sa-source-v1.mp3,${sa.sha256},,,host-user-activated,${report.decode.separateSa.durationSeconds*1000},mp3,1,48000,,"Separate SA source role only; actual spoken language and page host trigger unobserved; never autoplay or splice"\n`);
}
function writeInventory(bytes,mode){
 const file=path.join(ROOT,INVENTORY);
 if(mode==='--write'){
  const current=readStable(file);
  if(!current.equals(bytes)){
   assert.equal(current.toString(),EMPTY_INVENTORY,'only the scaffold inventory may be replaced');
   const temporary=file+'.p010-audio-v1.tmp';
   writeFileSync(temporary,bytes,{flag:'wx'});
   try{renameSync(temporary,file);}catch(error){throw error;}
  }
 }
 assert(readStable(file).equals(bytes),'audio inventory drift');
 return pin(INVENTORY,bytes);
}

export function buildAudit(source,sa,decoder=ffmpegDecode){
 assert.equal(source.length,SWF.bytes);assert.equal(sha256(source),SWF.sha256);
 assert.equal(sa.length,SA.bytes);assert.equal(sha256(sa),SA.sha256);
 const stream=extractTerminalStream(source,'sprite-52');
 assert.deepEqual(stream.actions.map(({domain,frame,hex})=>[domain,frame,hex]),[
  ['root',1,'961a00006a756d705f636865636b000701000000005f6c6576656c30001c96130000496e7465726e616c5072656c6f61646572004e960d0000676f746f416e64506c61790052170700'],
  ['root',6,'0700']]);
 assert.deepEqual(stream.heads,[{domain:'sprite-52',frame:1,hex:'0a2a2d078906'}]);
 const head=Buffer.from(stream.heads[0].hex,'hex');
 assert.equal(head.readUInt16LE(2),HEAD_AVERAGE);
 assert.equal(head.readInt16LE(4),LATENCY);
 assert.equal(stream.blocks.length,300);
 assert.deepEqual(stream.blocks.map(block=>block.frame),Array.from({length:300},(_,i)=>FIRST+i));
 assert.deepEqual(stream.blocks.filter(block=>block.mp3Bytes===0),[
  {frame:5,samples:0,seek:0,mp3Bytes:0}]);
 assert(stream.blocks.every(block=>block.seek>=0),'no negative source seeks');
 let declaredStart=0;
 const packets=stream.blocks.map(block=>{
  const row={frame:block.frame,declaredSampleStart:declaredStart,
   declaredSamples:block.samples,rawSeekSamples:block.seek,mp3Bytes:block.mp3Bytes,
   residualToHeadAverageFromFrame4:declaredStart+block.seek-(block.frame-FIRST)*HEAD_AVERAGE};
  declaredStart+=block.samples;return row;
 });
 assert.equal(declaredStart,550656);
 assert(packets.filter(packet=>packet.frame>=6)
  .every(packet=>packet.residualToHeadAverageFromFrame4===-164),'stable source packet accounting');
 assert.equal(stream.mp3.length,124280);
 assert.equal(sha256(stream.mp3),'f5c71e9d066a0d2ce37be7afd20c3d1f8182b5c2c7b6a06a38c131074093fa89');
 const mainPcm=decoder(stream.mp3,RATE),saPcm=decoder(sa,SA_RATE);
 assert.equal(mainPcm.length/4,declaredStart,'complete main MP3 sample decode');
 assert.equal(saPcm.length/4,1032192,'complete separate SA sample decode');
 assert.equal(sha256(mainPcm),'edcb1aafafd97d01d93c55138d582a3ac8c45ba14187d840095d525cfc1ccdbd');
 assert.equal(sha256(saPcm),'c89d7f121cb189bc75291e80dddb5d79d11f466b82d18ff47adec84740af041f');
 const decoderVersion=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(decoderVersion.status,0);
 const audioEndSeconds=(FIRST-1)/FPS+(declaredStart-LATENCY)/RATE;
 const lastFrameStartSeconds=(LAST-1)/FPS;
 assert(audioEndSeconds<lastFrameStartSeconds,'source EOF precedes last frame start');
 const report={schemaVersion:1,kind:'alg-l06-p010-audio-source-audit-v1',
  status:'source-and-ffmpeg-measured-one-cycle-not-original-runtime-or-listening',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT}},
  swf:{signature:'CWS',version:6,stage:{width:800,height:600},fps:FPS,
   rootFrames:10,mainDomain:'sprite-52',mainFrames:LAST,
   scriptActions:stream.actions,mainStopActionPresent:false,
   streamHead:{...stream.heads[0],codec:'MP3',sampleRate:RATE,channels:1,
    averageSamplesPerFrame:HEAD_AVERAGE,initialLatencySamples:LATENCY}},
  embedded:{firstBlockFrame:FIRST,lastBlockFrame:LAST,blockCount:stream.blocks.length,
   absentBlockFramesWithinRange:[],zeroPayloadBlocks:stream.blocks.filter(block=>block.mp3Bytes===0),
   declaredSamples:declaredStart,extractedMp3:pin(MAIN_PATH,stream.mp3),
   boundaryPackets:[4,5,6,7,300,301,302,303].map(frame=>packets[frame-FIRST]),packets},
  decode:{ffmpegVersion:decoderVersion.stdout.split('\n')[0],main:pcmPin(mainPcm,RATE),
   separateSa:pcmPin(saPcm,SA_RATE),separateSaCopy:pin(SA_PATH,sa)},
  scheduleCandidate:{kind:'one-cycle-continuous-main-source-v1',
   sourceFirstBlockFrame:FIRST,sourceLastBlockFrame:LAST,
   sourceInitialSeekSamples:LATENCY,startAtVisualSeconds:(FIRST-1)/FPS,
   decodedEndSeconds:audioEndSeconds,lastFrameStartSeconds,
   cycleDurationSeconds:LAST/FPS,oneConcatenatedMp3Transport:true,
   noSyntheticSilenceForZeroPayloadFrame:true,arbitrarySourceFrameSeekSupported:false,
   sourceStopActionPresent:false,visualWrapPolicy:'unresolved-separate-source-audit',
   separateSa:'distinct optional source; no autoplay or splice; page host trigger and spoken language unverified'},
  limits:{originalRuntimeTraceObserved:false,audioAccepted:false,listeningAccepted:false,
   currentJsIntegrationChanged:false}};
 return {report,mainMp3:stream.mp3,saMp3:sa};
}

export function run(mode){
 assert(['--write','--check'].includes(mode),'usage: node script --write|--check');
 const swf=readStable(path.join(SOURCE_ROOT,SWF.path),SWF);
 const sa=readStable(path.join(SOURCE_ROOT,SA.path),SA);
 const {report,mainMp3,saMp3}=buildAudit(swf,sa);
 const reportBytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
 const outputs=[writeOrCheck(MAIN_PATH,mainMp3,mode),writeOrCheck(SA_PATH,saMp3,mode),
  writeOrCheck(REPORT_PATH,reportBytes,mode),writeInventory(inventory(report),mode)];
 assert.equal(sha256(readStable(path.join(SOURCE_ROOT,SWF.path),SWF)),SWF.sha256);
 assert.equal(sha256(readStable(path.join(SOURCE_ROOT,SA.path),SA)),SA.sha256);
 return {mode,outputs,mainDecodedSamples:report.decode.main.samples,
  separateSaDecodedSamples:report.decode.separateSa.samples,
  oneCycleOnly:true,visualWrapPolicy:'unresolved',audioAccepted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one mode');
 console.log(JSON.stringify(run(process.argv[2]),null,2));
}
