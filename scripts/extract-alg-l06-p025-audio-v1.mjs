#!/usr/bin/env node
/** Physical P025 source audio extraction. FFmpeg results are engineering data, not listening proof. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractDomainAudio} from './lib/swf-domain-audio-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const OUT='output/alg-l06-p025-audio-v1';
const SOURCE_AUDIT={path:'output/alg-l06-p025-source-audit-v1/source-audit-v1.json',
 sha256:'7cf5100ab451b501b069b9d8e39e1758410a20e2febbb94d46f585bba50aa8fe'};
const BLOCK_AUDIT={path:'output/alg-l06-p025-source-audit-v1/audio-stream-blocks-v1.json',
 sha256:'783cbcc8c3a2715db752a3a8a736ef5f7c18fcf9786cf3eb2df607d1408cbb40'};
const AUDITED_MP3={path:'output/alg-l06-p025-source-audit-v1/sprite-21-embedded-source-v1.mp3',
 bytes:123500,sha256:'e6122c6402e0000f810b82a6f91b76b50a918a44b75709194b2cec3834a201c4'};
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB18.swf',bytes:102660,
 sha256:'dcb6b709d71eada47053b50bcfcc1161dec5d1717ebca6cbf8463eb6863dbde6'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB18.mp3',bytes:173040,
 sha256:'295dcabe0549764ffe03ecc4e6a332a5cb85d05329095be079ad32bdac6a044e'};
const FPS=12,RATE=22050,SA_RATE=48000,FIRST_FRAME=2,LAST_FRAME=299;
const HEAD_HEX='0a2a2d078906',INITIAL_SEEK=1673,DECLARED_SAMPLES=547200;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});

function stableRead(file,expected){
 assert.equal(fs.realpathSync(file),file,`physical file: ${file}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
  before.size<32n*1024n*1024n,`ordinary bounded file: ${file}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable read: ${file}`);
 if(expected){
  if('bytes' in expected)assert.equal(bytes.length,expected.bytes,`bytes: ${file}`);
  assert.equal(sha(bytes),expected.sha256,`SHA-256: ${file}`);
 }
 return bytes;
}
function decode(bytes,rate){
 const run=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-xerror',
  '-f','mp3','-i','pipe:0','-f','f32le','-acodec','pcm_f32le','-ac','1',
  '-ar',String(rate),'pipe:1'],{input:bytes,maxBuffer:16*1024*1024});
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
  try{fs.writeFileSync(file,bytes,{flag:'wx'});}
  catch(error){if(error?.code!=='EEXIST')throw error;
   assert(stableRead(file).equals(bytes),`no-replace output: ${relative}`);}
 }else assert(stableRead(file).equals(bytes),`output drift: ${relative}`);
 return pin(relative,bytes);
}
const pcm=(relative,bytes,rate)=>({...pin(relative,bytes),format:'mono-f32le',
 sampleRate:rate,channels:1,samples:bytes.length/4,durationSeconds:bytes.length/4/rate});

/** One-indexed visual frame to advisory FFmpeg-decoded sample. Browser decode can differ. */
export function candidateDecodedSampleAtFrame(frame,decodedSamples=DECLARED_SAMPLES){
 assert(Number.isInteger(frame)&&frame>=1&&frame<=LAST_FRAME,'P025 visual frame');
 assert(Number.isInteger(decodedSamples)&&decodedSamples>INITIAL_SEEK,'P025 decoded samples');
 if(frame<FIRST_FRAME)return null;
 return Math.min(decodedSamples,Math.floor(INITIAL_SEEK+
  (frame-FIRST_FRAME)*RATE/FPS));
}

export function build(source,spanish,auditBytes,blockBytes,auditedMp3,extractorBytes){
 assert.equal(source.length,SWF.bytes);assert.equal(sha(source),SWF.sha256);
 assert.equal(spanish.length,SA.bytes);assert.equal(sha(spanish),SA.sha256);
 assert.equal(sha(auditBytes),SOURCE_AUDIT.sha256);
 assert.equal(sha(blockBytes),BLOCK_AUDIT.sha256);
 assert.equal(auditedMp3.length,AUDITED_MP3.bytes);
 assert.equal(sha(auditedMp3),AUDITED_MP3.sha256);
 const prior=JSON.parse(auditBytes),priorBlocks=JSON.parse(blockBytes);
 assert.deepEqual(prior.source.swf,SWF);assert.deepEqual(prior.source.separateSa,SA);
 assert.equal(prior.source.root,SOURCE_ROOT);
 assert.deepEqual([prior.audio.embedded.frameDomain,prior.audio.embedded.blockRange,
  prior.audio.embedded.blockCount,prior.audio.embedded.declaredSampleTotal,
  prior.audio.embedded.zeroSampleBlocks,prior.audio.embedded.emptyPayloadBlocks,
  prior.audio.embedded.negativeSeekBlocks],
  ['sprite-21',[2,299],298,DECLARED_SAMPLES,[3],[3],[]]);
 assert.deepEqual(prior.audio.embedded.sourceMp3,
  {path:'sprite-21-embedded-source-v1.mp3',bytes:AUDITED_MP3.bytes,
   sha256:AUDITED_MP3.sha256});
 assert.equal(prior.audio.embedded.ffmpegPcmS16le.samplesMono,DECLARED_SAMPLES);
 assert.equal(prior.audio.separateSa.relationshipToEmbedded,
  'separate-physical-source; not-spliced');
 assert.deepEqual([priorBlocks.sourceSwfSha256,priorBlocks.frameDomain,
  priorBlocks.head.sampleRateHz,priorBlocks.head.latencySeekSamples,
  priorBlocks.blocks.length],
  [SWF.sha256,'sprite-21',RATE,INITIAL_SEEK,298]);

 const domains=extractDomainAudio(source);
 assert.deepEqual(domains.map(d=>[d.id,d.declaredFrames,d.heads.length,d.blocks.length]),
  [['root',10,0,0],['sprite-21',299,1,298]]);
 assert(domains.every(d=>d.trailer===null),'no timeline trailer');
 const domain=domains[1],head=domain.heads[0];
 assert.equal(head.frame,1);assert.equal(head.hex,HEAD_HEX);
 assert.deepEqual([domain.blocks[0].frame,domain.blocks.at(-1).frame],[2,299]);
 const packets=[];let declared=0;
 for(const [index,block] of domain.blocks.entries()){
  assert.equal(block.frame,FIRST_FRAME+index,'contiguous source block frames');
  const row={frame:block.frame,declaredSamples:block.samples,seekSamples:block.seek,
   blockBytes:block.payload.length+4,mp3PayloadBytes:block.payload.length,
   mp3PayloadSha256:sha(block.payload)};
  assert.deepEqual(row,priorBlocks.blocks[index],`audited source block ${block.frame}`);
  packets.push({...row,swfTagOffset:block.offset,declaredSampleStart:declared});
  declared+=block.samples;
 }
 assert.equal(declared,DECLARED_SAMPLES);
 assert.deepEqual(packets.filter(p=>p.mp3PayloadBytes===0)
  .map(p=>[p.frame,p.declaredSamples,p.seekSamples]),[[3,0,0]]);
 assert.deepEqual(packets.filter(p=>p.seekSamples<0),[]);
 assert.equal(packets[0].seekSamples,INITIAL_SEEK);
 const mp3=Buffer.concat(domain.blocks.map(block=>block.payload));
 assert(mp3.equals(auditedMp3),'same exact source MP3 payload bytes');
 const mainPath=`${OUT}/sprite-21-source-v1.mp3`,mainPcmPath=`${OUT}/sprite-21-ffmpeg-f32le-v1.pcm`;
 const decoded=decode(mp3,RATE);
 assert.equal(decoded.length/4,DECLARED_SAMPLES,'FFmpeg main decoded sample count');
 const saPath=`${OUT}/separate-sa-source-v1.mp3`,saPcmPath=`${OUT}/separate-sa-ffmpeg-f32le-v1.pcm`;
 const saDecoded=decode(spanish,SA_RATE);
 assert(saDecoded.length>0,'nonempty independent SA decode');
 const version=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(version.status,0);
 const nativeEnd=FIRST_FRAME+(decoded.length/4-INITIAL_SEEK)/RATE*FPS;
 assert(nativeEnd>LAST_FRAME-1&&nativeEnd<LAST_FRAME,
  'source audio EOF precedes the terminal visual frame');
 const audit={schemaVersion:1,kind:'alg-l06-p025-audio-source-audit-v1',
  status:'physical-source-extraction-and-FFmpeg-decode-only',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT},
   priorAudit:pin(SOURCE_AUDIT.path,auditBytes),priorBlocks:pin(BLOCK_AUDIT.path,blockBytes),
   priorMp3:pin(AUDITED_MP3.path,auditedMp3),
   extractor:pin('scripts/extract-alg-l06-p025-audio-v1.mjs',extractorBytes)},
  format:{fps:FPS,codec:'MP3',sampleRate:RATE,channels:1,
   sourceStreamHead:{...head,averageSamplesPerFrame:1837,latencySamples:INITIAL_SEEK}},
  domains:domains.map(d=>({id:d.id,declaredFrames:d.declaredFrames,
   streamHeadCount:d.heads.length,blockCount:d.blocks.length,trailer:d.trailer})),
  main:{domain:'sprite-21',visualFrames:299,firstBlockFrame:2,lastBlockFrame:299,
   blockCount:298,declaredSamples:declared,firstBlockRawSeekSamples:INITIAL_SEEK,
   zeroPayloadBlocks:packets.filter(p=>p.mp3PayloadBytes===0),negativeSeekBlocks:[],
   extractedMp3:pin(mainPath,mp3),ffmpegDecode:pcm(mainPcmPath,decoded,RATE),
   candidateNativeEndFrame:nativeEnd,visualTailFrames:LAST_FRAME-nativeEnd,packets},
  separateSa:{copy:pin(saPath,spanish),ffmpegDecode:pcm(saPcmPath,saDecoded,SA_RATE),
   activation:'explicit-user-only',localeAutoplay:false,splicedIntoMain:false},
  ffmpegVersion:version.stdout.split('\n')[0],
  limits:{browserDecodeObserved:false,sourceBlockAt3AudibilityKnown:false,
   firstBlockSeekOriginalAlignmentAccepted:false,originalRuntimeObserved:false,
   listeningAccepted:false,audioAccepted:false,humanVisualAccepted:false,
   ownerAccepted:false,strictComplete:false,published:false}};
 const auditPath=`${OUT}/audio-source-audit-v1.json`;
 const auditBytesOut=Buffer.from(`${JSON.stringify(audit,null,2)}\n`);
 const plan={schemaVersion:1,kind:'alg-l06-p025-audio-domain-plan-v1',
  status:'source-bound single-range candidate; browser decode and Flash sync pending',
  audit:pin(auditPath,auditBytesOut),
  main:{frameDomain:'sprite-21',fps:FPS,visualFrames:299,blockRange:[2,299],
   extractedMp3:audit.main.extractedMp3,ffmpegDecode:audit.main.ffmpegDecode,
   initialSeekSamples:INITIAL_SEEK,decodedSampleAtVisualFrame:
    {frame1:null,frame2:candidateDecodedSampleAtFrame(2),
     frame298:candidateDecodedSampleAtFrame(298),
     frame299:candidateDecodedSampleAtFrame(299)},
   candidateNativeEndFrame:nativeEnd,visualTailFrames:LAST_FRAME-nativeEnd,
   zeroPayloadFrame:3,negativeSeekBlocks:[]},
  optionalSpanishAudio:{asset:audit.separateSa.copy,ffmpegDecode:audit.separateSa.ffmpegDecode,
   activation:'explicit-user-only',localeAutoplay:false,joinedWithMain:false},
  policy:{singleMainRange:true,noInventedSilence:true,visualFrameClamp:299,
   sourceFrameToSampleMapping:'advisory-ffmpeg-decoded-not-browser-verified',
   originalRuntimeSyncAccepted:false,browserDecodeObserved:false,
   listeningAccepted:false,audioAccepted:false,humanVisualAccepted:false,
   ownerAccepted:false,strictComplete:false,published:false}};
 const planPath=`${OUT}/audio-domain-plan-v1.json`;
 const readme=Buffer.from(`# ALG001 L6 P025 source audio plan v1\n\n`+
  `The physical L6VB18.swf yields one continuous 298-block MP3 range on sprite-21 frames 2–299 at 12 fps. `+
  `The MP3 payload is copied without silence or SA splicing. Frame 3 has a source-authored zero-payload block.\n\n`+
  `FFmpeg decodes ${decoded.length/4} mono 22,050 Hz samples. With the source first-block seek `+
  `${INITIAL_SEEK}, its advisory audio endpoint is visual frame ${nativeEnd}; `+
  `the remaining ${LAST_FRAME-nativeEnd} visual frame is a candidate tail, not synthesized audio. `+
  `Browser decoder samples and actual Flash alignment remain unobserved.\n\n`+
  `The independent SA file is retained byte-for-byte and may start only by an explicit user action. `+
  `Locale alone never starts it. Original-runtime, listening, human visual, Owner, strict-completion, `+
  `registration and publication gates remain open.\n\n`+
  `Rerun \`node scripts/extract-alg-l06-p025-audio-v1.mjs --check\` to verify exact source and output bytes.\n`);
 return {audit,plan,outputs:[[mainPath,mp3],[mainPcmPath,decoded],
  [saPath,spanish],[saPcmPath,saDecoded],[auditPath,auditBytesOut],
  [planPath,Buffer.from(`${JSON.stringify(plan,null,2)}\n`)],[`${OUT}/README.md`,readme]]};
}

export function run(mode){
 assert(['--write','--check'].includes(mode),
  'usage: extract-alg-l06-p025-audio-v1.mjs --write|--check');
 const source=stableRead(path.join(SOURCE_ROOT,SWF.path),SWF);
 const spanish=stableRead(path.join(SOURCE_ROOT,SA.path),SA);
 const audit=stableRead(path.join(ROOT,SOURCE_AUDIT.path),SOURCE_AUDIT);
 const blocks=stableRead(path.join(ROOT,BLOCK_AUDIT.path),BLOCK_AUDIT);
 const auditedMp3=stableRead(path.join(ROOT,AUDITED_MP3.path),AUDITED_MP3);
 const extractor=stableRead(fileURLToPath(import.meta.url));
 const built=build(source,spanish,audit,blocks,auditedMp3,extractor);
 return {mode,outputs:built.outputs.map(([relative,bytes])=>output(relative,bytes,mode)),
  mainBlocks:built.audit.main.blockCount,
  mainSamples:built.audit.main.ffmpegDecode.samples,
  separateSaSamples:built.audit.separateSa.ffmpegDecode.samples,
  nativeEndFrame:built.audit.main.candidateNativeEndFrame,
  browserDecodeObserved:false,listeningAccepted:false,originalRuntimeObserved:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
