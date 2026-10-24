#!/usr/bin/env node
/** Source-locked P018 audio extraction. No playback or acceptance decision. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractDomainAudio} from './lib/swf-domain-audio-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB11.swf',bytes:223574,
 sha256:'400f0cdcb574864c7e9e2208f986e91f26e10f796623b6ea41d80a59310e167a'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB11.mp3',bytes:308112,
 sha256:'1d6f1de82903f62e5c642ce0e51b1baa03ec30c1fbfbcd46f135e2c4d5538057'};
const OUT='migrations/shared-alg001-l06-p018/audit/audio-v1';
const SA_PATH=`${OUT}/separate-sa-source-v1.mp3`;
const REPORT_PATH=`${OUT}/audio-source-audit-v1.json`;
const RATE=22050,FPS=12,HEAD_AVERAGE=1837,LATENCY=1673;
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

export function buildAudit(source,sa){
 assert.equal(source.length,SWF.bytes);assert.equal(sha256(source),SWF.sha256);
 assert.equal(sa.length,SA.bytes);assert.equal(sha256(sa),SA.sha256);
 const domains=extractDomainAudio(source);
 assert.equal(domains.length,3);
 assert(domains.every(d=>d.trailer===null),'no source trailing bytes');
 const audio=domains.filter(d=>d.blocks.length);
 assert.deepEqual(audio.map(d=>d.id).sort(),[32].map(n=>`sprite-${n}`).sort());
 const outputs=[],streams=[];
 for(const domain of audio){
  assert.equal(domain.heads.length,1);assert.equal(domain.heads[0].hex,'0a2a2d078906');
  assert.equal(new Set(domain.blocks.map(b=>b.frame)).size,domain.blocks.length);
  let cumulative=0;
  const packets=domain.blocks.map(b=>{const row={frame:b.frame,offset:b.offset,
   declaredSampleStart:cumulative,declaredSamples:b.samples,rawSeekSamples:b.seek,
   mp3Bytes:b.payload.length,payloadSha256:sha256(b.payload)};cumulative+=b.samples;return row;});
  const mp3=Buffer.concat(domain.blocks.map(b=>b.payload));
  const relative=`${OUT}/${domain.id}-source-v1.mp3`;
  const pcm=ffmpegDecode(mp3,RATE);
  assert.equal(pcm.length/4,cumulative,`${domain.id} decoded vs declared samples`);
  outputs.push([relative,mp3]);
  const absent=[];for(let f=domain.blocks[0].frame;f<=domain.blocks.at(-1).frame;f++)
   if(!domain.blocks.some(b=>b.frame===f))absent.push(f);
  const ranges=[];
  for(const block of domain.blocks){
   let range=ranges.at(-1);
   if(!range||range.lastFrame+1!==block.frame){range={firstFrame:block.frame,lastFrame:block.frame,blocks:[]};ranges.push(range);}
   range.lastFrame=block.frame;range.blocks.push(block);
  }
  const contiguousRanges=ranges.map((range,index)=>{
   const bytes=Buffer.concat(range.blocks.map(b=>b.payload));
   const segmentPath=`${OUT}/${domain.id}-range-${index+1}-source-v1.mp3`;
   const result={firstFrame:range.firstFrame,lastFrame:range.lastFrame,
    declaredSamples:range.blocks.reduce((n,b)=>n+b.samples,0),
    firstPacket:packets.find(p=>p.frame===range.firstFrame),
    lastPacket:packets.find(p=>p.frame===range.lastFrame)};
   if(ranges.length>1){const decoded=ffmpegDecode(bytes,RATE);
    assert.equal(decoded.length/4,result.declaredSamples,'range decoded samples');
    const sampleStart=result.firstPacket.declaredSampleStart;
    assert(decoded.equals(pcm.subarray(sampleStart*4,(sampleStart+result.declaredSamples)*4)),
     'independently decoded range must preserve the complete stream PCM; no reservoir loss');
    outputs.push([segmentPath,bytes]);result.extractedMp3=pin(segmentPath,bytes);result.decode=pcmPin(decoded,RATE);
   }
   return result;
  });
  streams.push({domain:domain.id,declaredFrames:domain.declaredFrames,
   streamHead:domain.heads[0],blockCount:domain.blocks.length,
   absentBlockFrames:absent,zeroPayloadBlocks:packets.filter(p=>p.mp3Bytes===0),
   declaredSamples:cumulative,extractedMp3:pin(relative,mp3),decode:pcmPin(pcm,RATE),
   contiguousRanges,packets});
 }
 const main=streams.find(s=>s.domain==='sprite-32');
 assert.deepEqual(main.contiguousRanges.map(r=>[r.firstFrame,r.lastFrame]),[[2,648]]);
 assert.equal(main.blockCount,647);
 assert.equal(main.declaredSamples,1188288);
 assert.equal(main.declaredFrames,648);
 assert.deepEqual(main.zeroPayloadBlocks.map(b=>b.frame),[3]);
 assert(main.packets.every(b=>b.rawSeekSamples>=0),'no negative source seek');
 const saPcm=ffmpegDecode(sa,48000);outputs.push([SA_PATH,sa]);
 const version=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});assert.equal(version.status,0);
 const report={schemaVersion:1,kind:'alg-l06-p018-audio-source-audit-v1',
  status:'source-domain-extraction-not-playback-or-listening-acceptance',
  source:{swf:{...SWF,root:SOURCE_ROOT},separateSa:{...SA,root:SOURCE_ROOT}},
  format:{fps:FPS,codec:'MP3',sampleRate:RATE,channels:1,averageSamplesPerFrame:HEAD_AVERAGE,
   initialLatencySamples:LATENCY},
  domainCount:domains.length,streamCount:streams.length,
  trailers:domains.filter(d=>d.trailer).map(d=>({domain:d.id,...d.trailer})),
  streams,separateSa:{copy:pin(SA_PATH,sa),decode:pcmPin(saPcm,48000)},
  ffmpegVersion:version.stdout.split('\n')[0],
  limits:{trailingBytesAreNotInterpretedAsTags:true,branchPlaybackScheduleResolved:false,
   negativeSeekSemanticsResolved:false,missingBlocksProveAudibleSilence:false,
   originalRuntimeObserved:false,listeningAccepted:false,audioAccepted:false,
   separateSaExplicitTriggerRequired:true,separateSaSplicedIntoMain:false,
   localeChangeStartsSa:false}};
 outputs.push([REPORT_PATH,Buffer.from(JSON.stringify(report,null,2)+'\n')]);
 return {report,outputs};
}
export function run(mode){
 assert(['--write','--check'].includes(mode),'usage: node script --write|--check');
 const {report,outputs}=buildAudit(readStable(path.join(SOURCE_ROOT,SWF.path),SWF),
  readStable(path.join(SOURCE_ROOT,SA.path),SA));
 return {mode,outputs:outputs.map(([relative,bytes])=>writeOrCheck(relative,bytes,mode)),
  domains:report.streams.map(s=>({domain:s.domain,blocks:s.blockCount,samples:s.decode.samples,
   ranges:s.contiguousRanges.map(r=>[r.firstFrame,r.lastFrame])})),
  separateSaSamples:report.separateSa.decode.samples,audioAccepted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one mode');console.log(JSON.stringify(run(process.argv[2]),null,2));
}
