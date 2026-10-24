#!/usr/bin/env node
/** Source-locked P023 single-domain MP3 extraction; no Flash sync claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractDomainAudio} from './lib/swf-domain-audio-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const OUT='output/alg-l06-p023-audio-v1';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB16.swf',bytes:137816,
 sha256:'40388017c66f714bdbda480558669aee11a0d3426ed55c74f0976eb2ca85097a'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB16.mp3',bytes:292320,
 sha256:'c8da225f06545b2fd3b7edb77be46af198337b168dadd3c869cd9613377c33c5'};
const INTAKE={path:'output/alg-l06-p023-intake-recon-v1/intake-recon-v1.json',
 sha256:'2605e92ab8b4f4777cbf23461ae9bffeee02b497117947167ef86482522f1436'};
const FPS=12,RATE=22050,SA_RATE=48000,HEAD_HEX='0a2a2d078906';
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

export function build(source,spanish,intakeBytes,extractorBytes){
 assert.equal(source.length,SWF.bytes);assert.equal(sha(source),SWF.sha256);
 assert.equal(spanish.length,SA.bytes);assert.equal(sha(spanish),SA.sha256);
 assert.equal(sha(intakeBytes),INTAKE.sha256);
 const intake=JSON.parse(intakeBytes);
 assert.deepEqual(intake.source.swf,SWF);
 assert.deepEqual(intake.source.separateSa,SA);
 const domains=extractDomainAudio(source);
 assert.deepEqual(domains.map(d=>[d.id,d.declaredFrames,d.heads.length,d.blocks.length]),
  [['root',10,0,0],['sprite-38',410,1,400]]);
 assert(domains.every(d=>d.trailer===null),'no timeline trailer');
 const domain=domains[1],head=domain.heads[0];
 assert.equal(head.frame,1);assert.equal(head.hex,HEAD_HEX);
 assert.deepEqual([domain.blocks[0].frame,domain.blocks.at(-1).frame],[11,410]);
 assert(domain.blocks.every((block,index)=>block.frame===11+index),'continuous block frames');
 const packets=[];let declared=0;
 for(const block of domain.blocks){
  packets.push({frame:block.frame,swfTagOffset:block.offset,
   declaredSampleStart:declared,declaredSamples:block.samples,
   rawSeekSamples:block.seek,mp3Bytes:block.payload.length,
   payloadSha256:sha(block.payload)});
  declared+=block.samples;
 }
 assert.equal(declared,734400);
 assert.deepEqual(packets.filter(p=>p.mp3Bytes===0).map(p=>[p.frame,p.declaredSamples,p.rawSeekSamples]),
  [[12,0,0]]);
 assert.deepEqual(packets.filter(p=>p.rawSeekSamples<0),[]);
 assert.equal(packets[0].rawSeekSamples,1673);
 const mp3=Buffer.concat(domain.blocks.map(block=>block.payload));
 assert.equal(mp3.length,165750);
 const mainPath=`${OUT}/sprite-38-source-v1.mp3`;
 const mainPcmPath=`${OUT}/sprite-38-ffmpeg-f32le-v1.pcm`;
 const decoded=decode(mp3,RATE);
 assert.equal(decoded.length/4,declared,'main FFmpeg decoded sample count');
 const saPath=`${OUT}/separate-sa-source-v1.mp3`;
 const saPcmPath=`${OUT}/separate-sa-ffmpeg-f32le-v1.pcm`;
 const saDecoded=decode(spanish,SA_RATE);
 assert.equal(saDecoded.length/4,1002240,'SA FFmpeg decoded sample count');
 const version=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
 assert.equal(version.status,0);
 const audit={schemaVersion:1,kind:'alg-l06-p023-audio-source-audit-v1',
  status:'physical-source-extraction-and-FFmpeg-decode-only',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT},
   intake:pin(INTAKE.path,intakeBytes),
   extractor:pin('scripts/extract-alg-l06-p023-audio-v1.mjs',extractorBytes)},
  format:{fps:FPS,codec:'MP3',sampleRate:RATE,channels:1,
   sourceStreamHead:{...head,averageSamplesPerFrame:1837,latencySamples:1673}},
  domains:domains.map(d=>({id:d.id,declaredFrames:d.declaredFrames,
   streamHeadCount:d.heads.length,blockCount:d.blocks.length,trailer:d.trailer})),
  main:{domain:'sprite-38',visualFrames:410,firstBlockFrame:11,lastBlockFrame:410,
   blockCount:400,declaredSamples:declared,firstBlockRawSeekSamples:1673,
   zeroPayloadBlocks:packets.filter(p=>p.mp3Bytes===0),negativeSeekBlocks:[],
   extractedMp3:pin(mainPath,mp3),ffmpegDecode:pcm(mainPcmPath,decoded,RATE),
   candidateNativeEndFrame:11+(declared-1673)/RATE*FPS,packets},
  separateSa:{copy:pin(saPath,spanish),ffmpegDecode:pcm(saPcmPath,saDecoded,SA_RATE),
   activation:'explicit-user-only',localeAutoplay:false,splicedIntoMain:false},
  ffmpegVersion:version.stdout.split('\n')[0],
  limits:{sourceBlockAt12AudibilityKnown:false,
   firstBlockSeekOriginalAlignmentAccepted:false,
   originalRuntimeObserved:false,browserDecodeObserved:false,
   listeningAccepted:false,audioAccepted:false}};
 const auditPath=`${OUT}/audio-source-audit-v1.json`;
 const auditBytes=Buffer.from(`${JSON.stringify(audit,null,2)}\n`);
 const plan={schemaVersion:1,kind:'alg-l06-p023-audio-domain-plan-v1',
  status:'source-bound single-range candidate; browser decode and Flash sync pending',
  audit:pin(auditPath,auditBytes),
  main:{frameDomain:'sprite-38',fps:FPS,visualFrames:410,
   blockRange:[11,410],extractedMp3:audit.main.extractedMp3,
   ffmpegDecode:audit.main.ffmpegDecode,firstBlockRawSeekSamples:1673,
   candidateNativeEndFrame:audit.main.candidateNativeEndFrame,
   zeroPayloadFrame:12,negativeSeekBlocks:[]},
  optionalSpanishAudio:{asset:audit.separateSa.copy,
   ffmpegDecode:audit.separateSa.ffmpegDecode,
   activation:'explicit-user-only',localeAutoplay:false,joinedWithMain:false},
  policy:{singleMainRange:true,noInventedSilence:true,visualFrameClamp:410,
   originalRuntimeSyncAccepted:false,browserDecodeObserved:false,
   listeningAccepted:false,audioAccepted:false}};
 const planPath=`${OUT}/audio-domain-plan-v1.json`;
 return {audit,plan,outputs:[[mainPath,mp3],[mainPcmPath,decoded],
  [saPath,spanish],[saPcmPath,saDecoded],[auditPath,auditBytes],
  [planPath,Buffer.from(`${JSON.stringify(plan,null,2)}\n`)]]};
}

export function run(mode){
 assert(['--write','--check'].includes(mode),'usage: extract-alg-l06-p023-audio-v1.mjs --write|--check');
 const source=stableRead(path.join(SOURCE_ROOT,SWF.path),SWF);
 const spanish=stableRead(path.join(SOURCE_ROOT,SA.path),SA);
 const intake=stableRead(path.join(ROOT,INTAKE.path),INTAKE);
 const extractor=stableRead(fileURLToPath(import.meta.url));
 const {audit,outputs}=build(source,spanish,intake,extractor);
 return {mode,outputs:outputs.map(([relative,bytes])=>output(relative,bytes,mode)),
  mainBlocks:audit.main.blockCount,mainSamples:audit.main.ffmpegDecode.samples,
  separateSaSamples:audit.separateSa.ffmpegDecode.samples,
  browserDecodeObserved:false,listeningAccepted:false,originalRuntimeObserved:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
