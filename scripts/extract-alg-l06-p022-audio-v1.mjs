#!/usr/bin/env node
/** Exact P022 source-stream ranges and independent SA; no joined playback file. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractDomainAudio} from './lib/swf-domain-audio-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HERE='output/alg-l06-p022-audio-v1';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB15.swf',bytes:135254,
 sha256:'a5868c68164c6401d2d79a8548f60f0d62401ca14f01f0494ef8ae6fd0e2d7c1'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB15.mp3',bytes:252000,
 sha256:'2ced2d44148da73af856808834d32083d61d61d8073acdfe48650c1e9809a7bb'};
const INTAKE={path:'output/alg-l06-p022-intake-recon-v1/intake-recon-v1.json',bytes:13402,
 sha256:'730737114cb994b8ad101d34a0adf81cca72079911ebee9aa458c4c7ea8025d1'};
const RATE=22050,SA_RATE=48000,FPS=12,HEAD_HEX='0a2a2d078906';
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
 if(expected){assert.equal(bytes.length,expected.bytes,`bytes: ${file}`);
  assert.equal(sha(bytes),expected.sha256,`SHA-256: ${file}`);}
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
const pcm=(relative,bytes,rate)=>({...pin(relative,bytes),format:'mono-f32le',
 sampleRate:rate,channels:1,samples:bytes.length/4,durationSeconds:bytes.length/4/rate});
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
function ranges(blocks){
 const result=[];
 for(const block of blocks){
  let current=result.at(-1);
  if(!current||block.frame!==current.at(-1).frame+1){current=[];result.push(current);}
  current.push(block);
 }
 return result;
}
export function build(source,spanish,extractorBytes,intakeBytes){
 assert.equal(source.length,SWF.bytes);assert.equal(sha(source),SWF.sha256);
 assert.equal(spanish.length,SA.bytes);assert.equal(sha(spanish),SA.sha256);
 assert.equal(intakeBytes.length,INTAKE.bytes);assert.equal(sha(intakeBytes),INTAKE.sha256);
 const intake=JSON.parse(intakeBytes);
 assert.deepEqual(intake.source.swf,SWF);
 assert.deepEqual(intake.source.separateSa,SA);
 const domains=extractDomainAudio(source);
 assert.deepEqual(domains.map(d=>[d.id,d.declaredFrames,d.heads.length,d.blocks.length]),
  [['root',10,0,0],['sprite-67',422,1,404]]);
 assert(domains.every(d=>d.trailer===null),'no SWF timeline trailer');
 const domain=domains[1];
 assert.equal(domain.heads[0].frame,1);
 assert.equal(domain.heads[0].hex,HEAD_HEX);
 const grouped=ranges(domain.blocks);
 assert.deepEqual(grouped.map(g=>[g[0].frame,g.at(-1).frame,g.length]),
  [[2,132,131],[150,422,273]]);
 const packets=[];let cumulative=0;
 for(const block of domain.blocks){
  packets.push({frame:block.frame,swfTagOffset:block.offset,
   declaredSampleStart:cumulative,declaredSamples:block.samples,
   rawSeekSamples:block.seek,mp3Bytes:block.payload.length,
   payloadSha256:sha(block.payload)});
  cumulative+=block.samples;
 }
 assert.equal(cumulative,740160);
 assert.deepEqual(packets.filter(p=>p.mp3Bytes===0).map(p=>[p.frame,p.rawSeekSamples,p.declaredSamples]),
  [[3,0,0],[132,-2018,0]]);
 assert.deepEqual(packets.filter(p=>p.rawSeekSamples<0).map(p=>p.frame),[132]);
 assert.equal(packets[0].rawSeekSamples,1673);
 assert.equal(packets.find(p=>p.frame===150).rawSeekSamples,416);
 const streams=[],outputs=[],decodedRanges=[];
 for(let index=0;index<grouped.length;index++){
  const group=grouped[index],part=index+1;
  const mp3=Buffer.concat(group.map(b=>b.payload));
  const mp3Path=`${HERE}/sprite-67-range-${part}-source-v1.mp3`;
  const pcmPath=`${HERE}/sprite-67-range-${part}-ffmpeg-f32le-v1.pcm`;
  const decoded=decode(mp3,RATE),declared=group.reduce((n,b)=>n+b.samples,0);
  assert.equal(decoded.length/4,declared,`range ${part} FFmpeg sample count`);
  const rangePackets=packets.filter(p=>p.frame>=group[0].frame&&p.frame<=group.at(-1).frame);
  const firstSeek=rangePackets[0].rawSeekSamples;
  outputs.push([mp3Path,mp3],[pcmPath,decoded]);decodedRanges.push(decoded);
  streams.push({id:`main-${part}`,domain:'sprite-67',firstBlockFrame:group[0].frame,
   lastBlockFrame:group.at(-1).frame,blockCount:group.length,
   firstBlockRawSeekSamples:firstSeek,declaredSamples:declared,
   extractedMp3:pin(mp3Path,mp3),ffmpegDecode:pcm(pcmPath,decoded,RATE),
   candidateEndFrame:group[0].frame+(declared-firstSeek)/RATE*FPS,
   zeroPayloadBlocks:rangePackets.filter(p=>p.mp3Bytes===0).map(p=>({frame:p.frame,
    rawSeekSamples:p.rawSeekSamples,declaredSamples:p.declaredSamples})),
   negativeSeekBlocks:rangePackets.filter(p=>p.rawSeekSamples<0).map(p=>({frame:p.frame,
    rawSeekSamples:p.rawSeekSamples,declaredSamples:p.declaredSamples}))});
 }
 const diagnosticWhole=decode(Buffer.concat(domain.blocks.map(b=>b.payload)),RATE);
 const joinedPcm=Buffer.concat(decodedRanges);
 assert.equal(diagnosticWhole.length/4,cumulative);
 assert(joinedPcm.equals(diagnosticWhole),'independent range PCM differs from full stream decode');
 const saPath=`${HERE}/separate-sa-source-v1.mp3`;
 const saPcmPath=`${HERE}/separate-sa-ffmpeg-f32le-v1.pcm`;
 const saDecoded=decode(spanish,SA_RATE);
 assert.equal(saDecoded.length/4,864000,'SA FFmpeg decoded samples');
 outputs.push([saPath,spanish],[saPcmPath,saDecoded]);
 const version=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(version.status,0);
 const audit={schemaVersion:1,kind:'alg-l06-p022-audio-source-audit-v1',
  status:'physical-source-extraction-and-FFmpeg-decode-only',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT},
   intake:INTAKE,extractor:pin('scripts/extract-alg-l06-p022-audio-v1.mjs',extractorBytes)},
  format:{fps:FPS,codec:'MP3',sampleRate:RATE,channels:1,
   sourceStreamHead:{...domain.heads[0],averageSamplesPerFrame:1837,latencySamples:1673}},
  domains:domains.map(d=>({id:d.id,declaredFrames:d.declaredFrames,
   streamHeadCount:d.heads.length,blockCount:d.blocks.length,trailer:d.trailer})),
  main:{domain:'sprite-67',declaredFrames:422,firstBlockFrame:2,lastBlockFrame:422,
   blockCount:404,declaredSamples:cumulative,
   absentBlockFrames:Array.from({length:17},(_,i)=>133+i),
   zeroPayloadBlocks:packets.filter(p=>p.mp3Bytes===0),
   negativeSeekBlocks:packets.filter(p=>p.rawSeekSamples<0),
   ranges:streams,fullStreamDecodeDiagnostic:{samples:diagnosticWhole.length/4,
    sha256:sha(diagnosticWhole),independentRangePcmEqualsFullStreamPcm:true,
    fullStreamPlaybackAssetCreated:false},packets},
  separateSa:{copy:pin(saPath,spanish),ffmpegDecode:pcm(saPcmPath,saDecoded,SA_RATE),
   activation:'explicit-user-only',localeAutoplay:false,splicedIntoMain:false},
  ffmpegVersion:version.stdout.split('\n')[0],
  limits:{sourceNegativeSeekAt132Resolved:false,
   absentBlocksProveAudibleSilence:false,sourceGapPlaybackPolicyAccepted:false,
   firstBlockSeekOriginalAlignmentAccepted:false,
   originalRuntimeObserved:false,browserDecodeObserved:false,
   listeningAccepted:false,audioAccepted:false,
   combinedMainPlaybackAssetCreated:false}};
 const auditPath=`${HERE}/audio-source-audit-v1.json`;
 const auditBytes=Buffer.from(`${JSON.stringify(audit,null,2)}\n`);
 const plan={schemaVersion:1,kind:'alg-l06-p022-audio-domain-plan-v1',
  status:'source range inventory; not a playback clock or accepted synchronization',
  audit:pin(auditPath,auditBytes),
  main:{frameDomain:'sprite-67',visualFrames:422,blockRanges:streams.map(s=>({
   id:s.id,firstBlockFrame:s.firstBlockFrame,lastBlockFrame:s.lastBlockFrame,
   extractedMp3:s.extractedMp3,ffmpegDecode:s.ffmpegDecode,
   firstBlockRawSeekSamples:s.firstBlockRawSeekSamples,
   candidateEndFrame:s.candidateEndFrame})),
   blockAbsentFrames:audit.main.absentBlockFrames,
   boundary:{zeroPayloadFrame:132,rawSeekSamples:-2018,nextBlockFrame:150,
    nextFirstBlockRawSeekSamples:416,
    treatment:'unresolved; do not infer silence or join as a single timed track'}},
  optionalSpanishAudio:{asset:audit.separateSa.copy,
   activation:'explicit-user-only',localeAutoplay:false,joinedWithMain:false},
  policy:{rangeAssetsSeparate:true,noInventedSilence:true,
   originalRuntimeSyncAccepted:false,browserDecodeObserved:false,
   listeningAccepted:false,audioAccepted:false}};
 const planPath=`${HERE}/audio-domain-plan-v1.json`;
 outputs.push([auditPath,auditBytes],[planPath,Buffer.from(`${JSON.stringify(plan,null,2)}\n`)]);
 return {audit,plan,outputs};
}
export function run(mode){
 assert(['--write','--check'].includes(mode),'usage: extract-alg-l06-p022-audio-v1.mjs --write|--check');
 const source=stableRead(path.join(SOURCE_ROOT,SWF.path),SWF);
 const spanish=stableRead(path.join(SOURCE_ROOT,SA.path),SA);
 const extractor=stableRead(fileURLToPath(import.meta.url));
 const intake=stableRead(path.join(ROOT,INTAKE.path),INTAKE);
 const {audit,outputs}=build(source,spanish,extractor,intake);
 return {mode,outputs:outputs.map(([relative,bytes])=>output(relative,bytes,mode)),
  mainRanges:audit.main.ranges.map(r=>({id:r.id,blocks:r.blockCount,
   samples:r.ffmpegDecode.samples,candidateEndFrame:r.candidateEndFrame})),
  separateSaSamples:audit.separateSa.ffmpegDecode.samples,
  browserDecodeObserved:false,listeningAccepted:false,originalRuntimeObserved:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
