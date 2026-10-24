#!/usr/bin/env node
/** Source-locked P061 embedded-stream bindings. No SA playback or seek trim. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPin,sha256} from '../lib/g678-admission-proof.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const RAW={path:'output/nms-l02-p061-source-20260927/audio-raw-index.json',bytes:774813,
 sha256:'dfe8c3c4b110f3d069fc3629b566df411ed261253f70340ae37d5d03a6ee5db2'};
const AUDIT_PATH='output/nms-l02-p061-source-20260927/source-audit.json';
const BEHAVIOR={path:'output/nms-l02-p061-behavior-20260927/source-behavior-v1.json',bytes:59718,
 sha256:'e3e52d68dbb2c901cf056a95cb073a031181c20dba7b3a7f90002652f998441e'};
const GENERATED='packages/demos/src/generated/nms-l02-p061-audio-v1.ts';
const RECEIPT='output/nms-l02-p061-audio-20260927/receipt.json';
const README='output/nms-l02-p061-audio-20260927/README.md';
const SOURCE={path:'G6-G8-shared/NMS002/L2/TS/L2TS08.swf',bytes:585741,
 sha256:'4712cc077841cc0d16ea63c0c10827b933a0904a80eef010ec8f04eed5ffa50a'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const SA={path:'G6-G8-shared/NMS002/L2/SA/L2TS08.mp3',bytes:286944,
 sha256:'ef94daa8ed092d3c6a567bff5b3231102bb97691cbf06d0709fe5e32eccfc0f8'};
const IDS=[87,134,146,174,188,205,226,252,284,298,315];
const COUNTS=[0,1728,2304,3456];
const STOPS=[435,573,700,817,860,879];
const bytesJson=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const checkPhysical=()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root');
 for(const directory of [ROOT,SOURCE_ROOT]){
  assert.equal(fs.realpathSync(directory),directory,'physical directory');
  assert(fs.lstatSync(directory).isDirectory()&&!fs.lstatSync(directory).isSymbolicLink(),
   'ordinary source/worktree');
 }
 assert(!process.env.VERCEL&&!process.env.VERCEL_ENV&&process.env.NODE_ENV!=='production','local only');
};
const exact=(base,expected)=>readPin(base,expected);
function decode(bytes,channels){
 const run=spawnSync('ffmpeg',['-v','error','-xerror','-i','pipe:0','-map','0:a:0',
  '-f','s16le','-acodec','pcm_s16le','-ac',String(channels),'-ar','22050','pipe:1'],
  {input:bytes,maxBuffer:32*1024*1024});
 assert.equal(run.error,undefined,`ffmpeg available: ${run.error?.message}`);
 assert.equal(run.status,0,`complete MP3 decode: ${run.stderr?.toString('utf8')}`);
 assert.equal(run.stdout.length%(2*channels),0,'complete PCM channel frames');
 return {samples:run.stdout.length/(2*channels),pcmSha256:sha256(run.stdout)};
}
export function buildP061AudioPlan({root=ROOT,decodeWith=decode}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 checkPhysical();
 exact(SOURCE_ROOT,SOURCE);exact(SOURCE_ROOT,XML);exact(SOURCE_ROOT,SA);
 const rawBytes=exact(root,RAW),raw=JSON.parse(rawBytes.toString('utf8'));
 const auditBytes=fs.readFileSync(path.join(root,AUDIT_PATH));
 const auditPin=pin(AUDIT_PATH,auditBytes),audit=JSON.parse(auditBytes.toString('utf8'));
 const behavior=JSON.parse(exact(root,BEHAVIOR).toString('utf8'));
 assert.equal(raw.kind,'nms-l02-p061-embedded-stream-raw-index-v1');
 assert.equal(raw.animationId,'shared-nms002-l02-p061');
 assert.deepStrictEqual(raw.source,SOURCE);
 assert.equal(raw.sourceRoot,SOURCE_ROOT);
 assert.equal(raw.emptyBlockSilenceInserted,false);
 assert.equal(raw.seekTrimApplied,false);
 assert.equal(audit.kind,'nms-l02-p061-source-static-audit-v1');
 assert.deepStrictEqual(audit.source,SOURCE);assert.deepStrictEqual(audit.sourceXml,XML);
 assert.deepStrictEqual(audit.audio.rawIndex,RAW);
 assert.deepStrictEqual(audit.audio.separateLessonSa.pin,SA);
 assert.equal(behavior.kind,'nms-l02-p061-static-source-behavior-audit-v1');
 assert.equal(behavior.source.swf.sha256,SOURCE.sha256);
 assert.equal(behavior.source.rawAudioIndex.sha256,RAW.sha256);
 assert.deepStrictEqual(behavior.mainStopTransitions.map(item=>item.frame),STOPS);
 assert.deepStrictEqual(audit.audio.streams.map(stream=>stream.ownerDomainId),IDS.map(id=>`sprite-${id}`));
 assert.equal(raw.streams.length,11);
 assert.deepStrictEqual(raw.streams.map(stream=>stream.ownerDomainId),IDS.map(id=>`sprite-${id}`));
 const domains={},streams=[];
 for(let index=0;index<IDS.length;index++){
  const owner=`sprite-${IDS[index]}`,stream=raw.streams[index],evidence=audit.audio.streams[index];
  assert.equal(stream.ownerDomainId,owner);assert.equal(evidence.ownerDomainId,owner);
  assert.equal(stream.header.sampleRateHz,22050);
  assert.equal(stream.header.channels,owner==='sprite-284'?2:1);
  assert.equal(stream.blocks.length,stream.blockCount);
  assert.deepStrictEqual(stream.payload,evidence.payload);
  assert.deepStrictEqual(stream.negativeSeekBlocks,evidence.negativeSeekBlocks);
  assert.deepStrictEqual(stream.emptyPayloadFrames,evidence.emptyPayloadFrames);
  assert.equal(stream.header.mp3LatencySeek,owner==='sprite-284'?1674:1673);
  const body=exact(root,stream.payload),decoded=decodeWith(body,stream.header.channels);
  assert.equal(decoded.samples,evidence.decode.decodedSamples,`full EOF ${owner}`);
  assert.equal(decoded.pcmSha256,evidence.decode.decodedPcmSha256,`PCM ${owner}`);
  assert.equal(decoded.samples,stream.declaredSamples,`all declared samples ${owner}`);
  let codes='';let running=0;
  for(let blockIndex=0;blockIndex<stream.blocks.length;blockIndex++){
   const block=stream.blocks[blockIndex],frame=stream.blockFrameRange.first+blockIndex;
   assert.equal(block.frame,frame,`contiguous ${owner} block frames`);
   assert.equal(block.blockIndex,blockIndex+1);
   assert.equal(block.payload.offset,running,`source-order ${owner} MP3 payload offset`);
   running+=block.payload.bytes;
   const code=COUNTS.indexOf(block.declaredSamples);
   assert.notEqual(code,-1,`bounded source sample count ${owner}`);
   codes+=code;
  }
  assert.equal(running,stream.payload.bytes);
  assert.equal(codes.length,stream.blockCount);
  const binding={id:owner,
   urlPath:`/migration-assets/nms-l02-p061/${owner}.mp3?sha256=${stream.payload.sha256}`,
   sourceSwfSha256:SOURCE.sha256,bytes:stream.payload.bytes,sha256:stream.payload.sha256,
   sampleRate:22050,channels:stream.header.channels,decodedSamples:decoded.samples,
   firstBlockFrame:stream.blockFrameRange.first,lastBlockFrame:stream.blockFrameRange.last,
   mp3LatencySeek:stream.header.mp3LatencySeek,
   negativeSeekBlocks:stream.negativeSeekBlocks,emptyPayloadFrames:stream.emptyPayloadFrames,
   blockCodes:codes};
  domains[owner]=binding;
  streams.push({ownerDomainId:owner,payload:stream.payload,blockCount:stream.blockCount,
   firstBlockFrame:binding.firstBlockFrame,lastBlockFrame:binding.lastBlockFrame,
   decodedSamples:decoded.samples,decodedPcmSha256:decoded.pcmSha256,
   channels:binding.channels,mp3LatencySeek:binding.mp3LatencySeek,
   negativeSeekBlocks:binding.negativeSeekBlocks,emptyPayloadFrames:binding.emptyPayloadFrames,
   sourceBlockSamplesSha256:sha256(Buffer.from(codes))});
 }
 assert.equal(domains['sprite-315'].blockCodes.length,867);
 assert.equal(domains['sprite-315'].decodedSamples,1590336);
 assert.deepStrictEqual(domains['sprite-315'].emptyPayloadFrames,[10,875]);
 assert.deepStrictEqual(domains['sprite-315'].negativeSeekBlocks,[{frame:875,seekSamples:-2178}]);
 const feedbackTimings=Object.fromEntries(behavior.feedbackDomains.map(item=>{
  const id=`sprite-${item.spriteId}`,binding=domains[id];
  assert(binding&&item.terminalFrame===binding.lastBlockFrame,
   `full feedback payload reaches source terminal ${id}`);
  assert.equal(item.streamBlocks,binding.blockCodes.length);
  return [id,{kind:item.kind,sourceTerminalFrame:item.terminalFrame,
   fullBufferWindowEndFrame:binding.lastBlockFrame+1,
   firstBlockFrame:binding.firstBlockFrame,lastBlockFrame:binding.lastBlockFrame,
   decodedSamples:binding.decodedSamples}];
 }));
 assert.equal(Object.keys(feedbackTimings).length,10);
 const source={rawIndexSha256:RAW.sha256,swfSha256:SOURCE.sha256,sampleRate:22050,fps:12};
 const ts=`// Generated by scripts/prepare-nms-l02-p061-audio-v1.mjs from the pinned source raw index. Do not edit.\n`+
  `/** Full MP3 payloads; empty blocks and signed seeks remain metadata, not added PCM or trim. */\n`+
  `export const P061_AUDIO_SOURCE = ${JSON.stringify(source,null,2)} as const;\n`+
  `export const P061_AUDIO_DOMAINS = ${JSON.stringify(domains,null,2)} as const;\n`+
  `/** Terminal actions are owned by lesson state; full-payload windows end one frame later. */\n`+
  `export const P061_FEEDBACK_TIMINGS = ${JSON.stringify(feedbackTimings,null,2)} as const;\n`+
  `export type P061AudioDomainId = keyof typeof P061_AUDIO_DOMAINS;\n`+
  `export type P061AudioBinding = (typeof P061_AUDIO_DOMAINS)[P061AudioDomainId];\n`+
  `export const P061_MAIN_STOP_FRAMES = ${JSON.stringify(STOPS)} as const;\n`+
  `export const P061_MAIN_DOMAIN: P061AudioDomainId = 'sprite-315';\n`;
 const generatedBytes=Buffer.from(ts),generated=pin(GENERATED,generatedBytes);
 const receipt={schemaVersion:1,kind:'nms-l02-p061-full-buffer-audio-implementation-input-v1',
  animationId:'shared-nms002-l02-p061',sourceRoot:SOURCE_ROOT,source:SOURCE,sourceXml:XML,
  sourceAudit:auditPin,sourceBehavior:BEHAVIOR,rawIndex:RAW,generated,mainDomain:'sprite-315',
  sourceMainStops:STOPS,sourceLeadFrames:[1,8],sourceFinalPayloadFrame:875,
  sourceTailFrames:[876,879],streams,feedbackTimings,
  separateLessonSa:{pin:SA,role:'index-only-not-spliced'},
  policy:{fullDecodedBufferCandidate:true,emptyBlockSilenceInserted:false,seekTrimApplied:false,
   originalRuntimeSynchronizationEstablished:false,listeningAccepted:false,
   modernFeedbackSelectionOwnedByLessonState:true}};
 const readme=`# P061 embedded audio binding — 2026-09-27\n\n`+
  `This generated candidate binds 11 independently extracted SWF MP3 streams to exact source bytes, `+
  `raw block frames, declared samples, signed seeks, and full-EOF FFmpeg PCM checks. `+
  `Main sprite 315 has 867 blocks on frames 9–875, 1,590,336 mono samples at 22,050 Hz, `+
  `with source stops 435, 573, 700, 817, 860, 879. Visual frames 1–8 precede audio; `+
  `frames 876–879 follow its last block. Empty blocks 10 and 875 remain empty. `+
  `The final seek -2178 is recorded without trimming or invented silence. `+
  `Sprite 284 is stereo.\n\n`+
  `The separate SA recording is pinned for index evidence only. This artifact selects a modern `+
  `full-buffer candidate and does not prove original synchronization, listening, branch choice, `+
  `or acceptance. Run \`node scripts/prepare-nms-l02-p061-audio-v1.mjs --check\` with the real `+
  `\`HELP_MATH_G678_SOURCE_ROOT\` to recheck bytes and decode.\n`;
 return {root,generated:generatedBytes,receipt:bytesJson(receipt),readme:Buffer.from(readme),
  pins:{generated,receipt:pin(RECEIPT,bytesJson(receipt)),readme:pin(README,Buffer.from(readme))}};
}
export function applyP061AudioPlan(plan,mode){
 assert(['--write','--check'].includes(mode));
 const files=[[GENERATED,plan.generated],[RECEIPT,plan.receipt],[README,plan.readme]];
 for(const [relative,bytes] of files){
  const target=path.join(plan.root,relative);
  if(mode==='--write'&&!fs.existsSync(target)){
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});
  }
  assert.deepStrictEqual(fs.readFileSync(target),bytes,`exact generated file ${relative}`);
 }
 return {status:mode==='--check'?'P061_AUDIO_CHECKED':'P061_AUDIO_WRITTEN',...plan.pins};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'use --write or --check');
  const plan=buildP061AudioPlan();console.log(JSON.stringify(applyP061AudioPlan(plan,process.argv[2])));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
