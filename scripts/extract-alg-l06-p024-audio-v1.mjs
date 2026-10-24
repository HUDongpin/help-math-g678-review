#!/usr/bin/env node
/** Eight independent P024 SWF stream domains. FFmpeg output is machine evidence only. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractDomainAudio} from './lib/swf-domain-audio-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const OUT='output/alg-l06-p024-audio-v1';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB17.swf',bytes:462836,
 sha256:'e36c6c293f1e620f82fa84d57a1b91fd0a977d24d365772126f87333ce359d05'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB17.mp3',bytes:166320,
 sha256:'dd7f04214d8bfcdaf9ae98b99e542aa7f72f70accd1703381990ff4f43f57f0e'};
const INTAKE={path:'output/alg-l06-p024-intake-recon-v1/intake-recon-v1.json',
 bytes:45225,sha256:'37db86c5cff44619f5a5e8f681a24dc55040447d0ec51127b92af071a8df4882'};
const BEHAVIOR={path:'output/alg-l06-p024-behavior-audit-v1/behavior-audit-v1.json',
 bytes:47090,sha256:'ea5f12623231299c2c8b310db63732e86a3eae88037b0467db624c9925fd49f8'};
const ORDER=[69,83,97,123,155,188,196,208];
const FPS=12,RATE=22050,SA_RATE=48000,HEAD_HEX='0a2a2d078906';
const sha=value=>createHash('sha256').update(value).digest('hex');
const pin=(relative,value)=>({path:relative,bytes:value.length,sha256:sha(value)});
const asJson=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');

function stableRead(file,expected){
 assert.equal(fs.realpathSync(file),file,`physical file: ${file}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
  before.size<32n*1024n*1024n,`ordinary bounded file: ${file}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable read: ${file}`);
 if(expected){assert.equal(bytes.length,expected.bytes,`size: ${file}`);
  assert.equal(sha(bytes),expected.sha256,`SHA-256: ${file}`);}
 return bytes;
}
function decode(bytes,rate){
 const run=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-xerror',
  '-f','mp3','-i','pipe:0','-f','f32le','-acodec','pcm_f32le','-ac','1',
  '-ar',String(rate),'pipe:1'],{input:bytes,maxBuffer:32*1024*1024});
 if(run.error)throw run.error;
 assert.equal(run.status,0,run.stderr.toString().slice(0,800));
 assert.equal(run.stderr.length,0,'FFmpeg decode warning');
 assert.equal(run.stdout.length%4,0,'mono float32 width');
 return run.stdout;
}
function output(relative,bytes,mode){
 const file=path.join(ROOT,relative);
 if(mode==='--write'){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  try{fs.writeFileSync(file,bytes,{flag:'wx'});}catch(error){
   if(error?.code!=='EEXIST')throw error;
   assert(stableRead(file).equals(bytes),`no-replace output: ${relative}`);}
 }else if(mode==='--check')assert(stableRead(file).equals(bytes),`output drift: ${relative}`);
 return pin(relative,bytes);
}
const pcm=(relative,bytes,rate)=>({...pin(relative,bytes),format:'mono-f32le',
 sampleRate:rate,channels:1,samples:bytes.length/4,durationSeconds:bytes.length/4/rate});

export function build(source,spanish,intakeBytes,behaviorBytes,extractorBytes){
 assert.equal(source.length,SWF.bytes);assert.equal(sha(source),SWF.sha256);
 assert.equal(spanish.length,SA.bytes);assert.equal(sha(spanish),SA.sha256);
 assert.equal(sha(intakeBytes),INTAKE.sha256);
 assert.equal(sha(behaviorBytes),BEHAVIOR.sha256);
 const intake=JSON.parse(intakeBytes),behavior=JSON.parse(behaviorBytes);
 assert.deepEqual(intake.source.swf,SWF);
 assert.deepEqual(intake.source.separateSa,SA);
 assert.deepEqual(behavior.sourcePins.swf,SWF);
 assert.deepEqual(behavior.sourcePins.separateSa,SA);
 assert.deepEqual(behavior.sourcePins.intake,INTAKE);
 assert.equal(behavior.frameDomains.main.timelineId,'sprite-208');
 assert.deepEqual([behavior.frameDomains.main.frames,behavior.frameDomains.main.quizStop,
  behavior.frameDomains.main.hostConditionalTerminal],[381,154,381]);
 assert.deepEqual(behavior.feedback.map(row=>[row.id,row.kind,row.end]),
  [[69,'wrong',31],[83,'wrong',29],[97,'wrong',28],[123,'right',31],
   [155,'right',25],[188,'right',27],[196,'right',27]]);

 const parsed=extractDomainAudio(source),byId=new Map(parsed.map(domain=>[domain.id,domain]));
 assert.deepEqual(parsed.filter(domain=>domain.blocks.length).map(domain=>domain.id),
  ORDER.map(id=>`sprite-${id}`));
 assert.deepEqual(parsed.find(domain=>domain.id==='root')&&
  [byId.get('root').declaredFrames,byId.get('root').heads.length,byId.get('root').blocks.length],
  [10,0,0]);
 assert.deepEqual(parsed.filter(domain=>domain.trailer).map(domain=>
  [domain.id,domain.trailer.bytes,domain.trailer.sha256]),
  [['sprite-123',386,'d14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0']],
  'only sprite-123 carries source bytes after End');
 const expected=intake.structure.embeddedAudio.timelines;
 assert.deepEqual(expected.map(row=>row.timelineId),ORDER.map(id=>`sprite-${id}`));
 const outputs=[],records=[];
 for(const [index,id] of ORDER.entries()){
  const domain=byId.get(`sprite-${id}`),row=expected[index],range=row.ranges[0];
  assert(domain,'source domain exists');
  assert.deepEqual([domain.declaredFrames,domain.heads.length,domain.blocks.length],
   [row.frameCount,1,range.blocks]);
  assert.deepEqual([domain.heads[0].frame,domain.heads[0].hex],[1,HEAD_HEX]);
  assert.deepEqual([domain.blocks[0].frame,domain.blocks.at(-1).frame],
   [range.firstFrame,range.lastFrame]);
  assert(domain.blocks.every((block,i)=>block.frame===range.firstFrame+i),
   `continuous source blocks within sprite-${id}`);
  let declaredStart=0;
  const packets=domain.blocks.map(block=>{
   const packet={frame:block.frame,swfTagOffset:block.offset,
    declaredSampleStart:declaredStart,declaredSamples:block.samples,
    rawSeekSamples:block.seek,mp3Bytes:block.payload.length,
    payloadSha256:sha(block.payload)};
   declaredStart+=block.samples;return packet;
  });
  const mp3=Buffer.concat(domain.blocks.map(block=>block.payload));
  assert.deepEqual([declaredStart,mp3.length,sha(mp3),packets[0].rawSeekSamples],
   [range.declaredSamples,range.payloadBytes,range.payloadSha256,range.firstSeekSamples]);
  const zero=packets.filter(packet=>packet.mp3Bytes===0),
   negative=packets.filter(packet=>packet.rawSeekSamples<0);
  assert.deepEqual(zero.map(packet=>packet.frame),range.zeroPayloadFrames);
  assert.deepEqual(negative.map(packet=>packet.frame),range.negativeSeekFrames);
  const mp3Path=`${OUT}/sprite-${id}-source-v1.mp3`,
   pcmPath=`${OUT}/sprite-${id}-ffmpeg-f32le-v1.pcm`,decoded=decode(mp3,RATE);
  const role=id===208?'main':id<100?'wrong-feedback':'right-feedback';
  const feedback=behavior.feedback.find(item=>item.id===id);
  const staticBranch=id===208?
   {mainStopFrame:154,conditionalTerminalFrame:381,
    branchPlaybackAtQuiz:'requires live state; source stream remains separate'}:
   {mainInstanceId:feedback.mainInstanceId,
    localStopFrame:feedback.stop??null,localTerminalFrame:feedback.end,
    closeGotoFrame:feedback.closeGoto??null,
    closeToTerminalEstablished:false};
  records.push({id:`sprite-${id}`,role,declaredFrames:domain.declaredFrames,
   trailerAfterEnd:domain.trailer?{offset:domain.trailer.offset,
    bytes:domain.trailer.bytes,sha256:domain.trailer.sha256}:null,
   streamHead:domain.heads[0],firstBlockFrame:range.firstFrame,
   lastBlockFrame:range.lastFrame,blockCount:domain.blocks.length,
   declaredSamples:declaredStart,firstBlockRawSeekSamples:packets[0].rawSeekSamples,
   zeroPayloadBlocks:zero,negativeSeekBlocks:negative,
   extractedMp3:pin(mp3Path,mp3),ffmpegDecode:pcm(pcmPath,decoded,RATE),
   ffmpegMinusDeclaredSamples:decoded.length/4-declaredStart,
   staticBranch,packets});
  outputs.push([mp3Path,mp3],[pcmPath,decoded]);
 }
 const saPath=`${OUT}/separate-sa-source-v1.mp3`,
  saPcmPath=`${OUT}/separate-sa-ffmpeg-f32le-v1.pcm`,saDecoded=decode(spanish,SA_RATE);
 outputs.push([saPath,spanish],[saPcmPath,saDecoded]);
 const version=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(version.status,0);
 const audit={schemaVersion:1,kind:'alg-l06-p024-audio-source-audit-v1',
  status:'physical-source-extraction-and-FFmpeg-decode-only',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT},
   intake:pin(INTAKE.path,intakeBytes),behavior:pin(BEHAVIOR.path,behaviorBytes),
   extractor:pin('scripts/extract-alg-l06-p024-audio-v1.mjs',extractorBytes)},
  format:{fps:FPS,codec:'MP3',sampleRate:RATE,channels:1,
   sourceStreamHeadHex:HEAD_HEX,averageSamplesPerFrame:1837},
  root:{declaredFrames:10,entryFrame:6,streamHeadCount:0,blockCount:0},
  domains:records,totalBlocks:records.reduce((sum,row)=>sum+row.blockCount,0),
  separateSa:{copy:pin(saPath,spanish),ffmpegDecode:pcm(saPcmPath,saDecoded,SA_RATE),
   activation:'explicit-user-only',localeAutoplay:false,splicedIntoAnyDomain:false},
  ffmpegVersion:version.stdout.split('\n')[0],
  limits:{originalRuntimeObserved:false,browserDecodeObserved:false,
   sourceToHostAudioAlignmentAccepted:false,feedbackAudioMixOrStopObserved:false,
   negativeSeekTailAudibilityKnown:false,listeningAccepted:false,audioAccepted:false}};
 const auditPath=`${OUT}/audio-source-audit-v1.json`,auditBytes=asJson(audit);
 const plan={schemaVersion:1,kind:'alg-l06-p024-audio-domain-plan-v1',
  status:'eight independent source ranges; branch timing and browser decode pending',
  audit:pin(auditPath,auditBytes),behavior:pin(BEHAVIOR.path,behaviorBytes),
  frameDomain:'sprite-208',fps:FPS,visualFrames:381,quizStopFrame:154,
  domains:records.map(({id,role,declaredFrames,firstBlockFrame,lastBlockFrame,
   blockCount,declaredSamples,firstBlockRawSeekSamples,zeroPayloadBlocks,
   negativeSeekBlocks,extractedMp3,ffmpegDecode,ffmpegMinusDeclaredSamples,
   staticBranch,trailerAfterEnd})=>({id,role,declaredFrames,
    trailerAfterEnd,blockRange:[firstBlockFrame,lastBlockFrame],
    blockCount,declaredSamples,firstBlockRawSeekSamples,
    zeroPayloadFrames:zeroPayloadBlocks.map(packet=>packet.frame),
    negativeSeekBlocks:negativeSeekBlocks.map(packet=>({frame:packet.frame,
     rawSeekSamples:packet.rawSeekSamples,mp3Bytes:packet.mp3Bytes})),
    extractedMp3,ffmpegDecode,ffmpegMinusDeclaredSamples,staticBranch})),
  optionalSpanishAudio:{source:SA,asset:audit.separateSa.copy,
   ffmpegDecode:audit.separateSa.ffmpegDecode,
   activation:'explicit-user-only',localeAutoplay:false,joinedWithMain:false},
  policy:{independentDomains:true,concatenated:false,syntheticSilenceAdded:false,
   sourceEmptyAndNegativeBlocksRetained:true,feedbackActivationRequiresQuizState:true,
   wrongPopupCloseToTerminalUnproved:true,originalRuntimeSyncAccepted:false,
   browserDecodeObserved:false,listeningAccepted:false,audioAccepted:false}};
 const planPath=`${OUT}/audio-domain-plan-v1.json`;
 outputs.push([auditPath,auditBytes],[planPath,asJson(plan)]);
 return {audit,plan,outputs};
}

export function run(mode){
 assert(['--plan','--write','--check'].includes(mode),
  'usage: extract-alg-l06-p024-audio-v1.mjs --plan|--write|--check');
 const source=stableRead(path.join(SOURCE_ROOT,SWF.path),SWF),
  spanish=stableRead(path.join(SOURCE_ROOT,SA.path),SA),
  intake=stableRead(path.join(ROOT,INTAKE.path),INTAKE),
  behavior=stableRead(path.join(ROOT,BEHAVIOR.path),BEHAVIOR),
  extractor=stableRead(fileURLToPath(import.meta.url));
 const {audit,outputs}=build(source,spanish,intake,behavior,extractor);
 return {mode,outputs:outputs.map(([relative,bytes])=>output(relative,bytes,mode)),
  domains:audit.domains.map(row=>({id:row.id,role:row.role,blocks:row.blockCount,
   ffmpegSamples:row.ffmpegDecode.samples})),
  totalBlocks:audit.totalBlocks,separateSaSamples:audit.separateSa.ffmpegDecode.samples,
  browserDecodeObserved:false,listeningAccepted:false,originalRuntimeObserved:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
