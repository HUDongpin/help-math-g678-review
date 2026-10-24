#!/usr/bin/env node
/** Source-locked P062 embedded-stream bindings. No SA playback or seek trim. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPin,sha256} from '../lib/g678-admission-proof.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const RAW={path:'output/nms-l02-p062-source-20260928/audio-raw-index.json',bytes:744707,
 sha256:'7472338c839236889c0cff30be00ea99eca0fed5b8cd708a41cf68f4f378dde3'};
const AUDIT={path:'output/nms-l02-p062-source-20260928/source-audit.json',bytes:195769,
 sha256:'3fa24e31b9caa51f6ff9d8a71ddc929e9bf0cf72fab2afec2d0e765eaf1c7ce3'};
const BEHAVIOR={path:'output/nms-l02-p062-behavior-20260928/source-behavior-v1.json',bytes:32041,
 sha256:'2a9dbda1a677eb940b03625a86477c1708841fa85de787b4227f584c2d4b3312'};
const GENERATED='packages/demos/src/generated/nms-l02-p062-audio-v1.ts';
const RECEIPT='output/nms-l02-p062-audio-20260928/receipt.json';
const README='output/nms-l02-p062-audio-20260928/README.md';
const SOURCE={path:'G6-G8-shared/NMS002/L2/TS/L2TS09.swf',bytes:564902,
 sha256:'5a075362f005aab68406d5fae2378f622a64520ec19e4b03b9ac9abbbd5faa50'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const SA={path:'G6-G8-shared/NMS002/L2/SA/L2TS09.mp3',bytes:200592,
 sha256:'868b874f9b29d21036bb0b5330bed3bd52e3f4128635f087b95d8fdea77da48d'};
const IDS=[85,138,150,178,192,209,230,256,288,302,315];
const COUNTS=[0,1728,2304,3456];
const STOPS=[384,523,650,766,815,834];
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
export function buildP062AudioPlan({root=ROOT,decodeWith=decode}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 checkPhysical();
 exact(SOURCE_ROOT,SOURCE);exact(SOURCE_ROOT,XML);exact(SOURCE_ROOT,SA);
 const rawBytes=exact(root,RAW),raw=JSON.parse(rawBytes.toString('utf8'));
 const audit=JSON.parse(exact(root,AUDIT).toString('utf8'));
 const behavior=JSON.parse(exact(root,BEHAVIOR).toString('utf8'));
 assert.equal(raw.kind,'nms-l02-p062-embedded-stream-raw-index-v1');
 assert.equal(raw.animationId,'shared-nms002-l02-p062');
 assert.deepStrictEqual(raw.source,SOURCE);
 assert.equal(raw.sourceRoot,SOURCE_ROOT);
 assert.equal(raw.emptyBlockSilenceInserted,false);
 assert.equal(raw.seekTrimApplied,false);
 assert.equal(audit.kind,'nms-l02-p062-source-static-audit-v1');
 assert.deepStrictEqual(audit.source,SOURCE);assert.deepStrictEqual(audit.sourceXml,XML);
 assert.deepStrictEqual(audit.audio.rawIndex,RAW);
 assert.deepStrictEqual(audit.audio.separateLessonSa.pin,SA);
 assert.equal(behavior.kind,'nms-l02-p062-source-behavior-v1');
 assert.deepStrictEqual(behavior.source,SOURCE);
 assert.deepStrictEqual(behavior.sourceXml,XML);
 assert.equal(behavior.sourceAuditSha256,AUDIT.sha256);
 assert.equal(behavior.main.spriteId,315);
 assert.equal(behavior.main.frames,837);
 assert.deepStrictEqual(behavior.main.stops,STOPS);
 assert.equal(behavior.audio.sourceStreamCount,11);
 assert.equal(behavior.audio.mainDecodedSamples,1503936);
 assert.deepStrictEqual(behavior.audio.separateSpanishAudioPin,SA);
 assert.equal(behavior.audio.originalSynchronizationEstablished,false);
 assert.equal(behavior.audio.listeningAccepted,false);
 assert.deepStrictEqual(behavior.interactive.wrongFeedbackSprites,[85,138,150,178,192]);
 assert.deepStrictEqual(behavior.interactive.rightFeedbackSprites,[209,230,256,288,302]);
 assert.deepStrictEqual(audit.audio.streams.map(stream=>stream.ownerDomainId),IDS.map(id=>`sprite-${id}`));
 assert.equal(raw.streams.length,11);
 assert.deepStrictEqual(raw.streams.map(stream=>stream.ownerDomainId),IDS.map(id=>`sprite-${id}`));
 const domains={},streams=[];
 for(let index=0;index<IDS.length;index++){
  const owner=`sprite-${IDS[index]}`,stream=raw.streams[index],evidence=audit.audio.streams[index];
  assert.equal(stream.ownerDomainId,owner);assert.equal(evidence.ownerDomainId,owner);
  assert.equal(stream.header.sampleRateHz,22050);
  assert.equal(stream.header.channels,owner==='sprite-288'?2:1);
  assert.equal(stream.blocks.length,stream.blockCount);
  assert.deepStrictEqual(stream.payload,evidence.payload);
  assert.deepStrictEqual(stream.negativeSeekBlocks,evidence.negativeSeekBlocks);
  assert.deepStrictEqual(stream.emptyPayloadFrames,evidence.emptyPayloadFrames);
  assert.equal(stream.header.mp3LatencySeek,owner==='sprite-288'?1674:1673);
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
   urlPath:`/migration-assets/nms-l02-p062/${owner}.mp3?sha256=${stream.payload.sha256}`,
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
 assert.equal(domains['sprite-315'].blockCodes.length,820);
 assert.equal(domains['sprite-315'].decodedSamples,1503936);
 assert.deepStrictEqual(domains['sprite-315'].emptyPayloadFrames,[10,828]);
 assert.deepStrictEqual(domains['sprite-315'].negativeSeekBlocks,[{frame:828,seekSamples:-2239}]);
 const wrong=new Set(behavior.interactive.wrongFeedbackSprites);
 const right=new Set(behavior.interactive.rightFeedbackSprites);
 const feedbackTimings=Object.fromEntries(IDS.filter(id=>id!==315).map(spriteId=>{
  const id=`sprite-${spriteId}`,binding=domains[id];
  const kind=wrong.has(spriteId)?'wrong':right.has(spriteId)?'right':null;
  assert(kind,`source feedback classification ${id}`);
  const terminalPath=`output/nms-l02-p062-source-20260928/extraction/ffdec/scripts/DefineSprite_${spriteId}/frame_${binding.lastBlockFrame}/DoAction.as`;
  const terminalPin=audit.extraction.files.find(item=>item.path===terminalPath);
  assert(terminalPin,`source feedback terminal script ${id}`);
  const terminalScript=exact(root,terminalPin).toString('utf8');
  assert(terminalScript.startsWith('stop();'),`source terminal stop ${id}`);
  return [id,{kind,sourceTerminalFrame:binding.lastBlockFrame,
   fullBufferWindowEndFrame:binding.lastBlockFrame+1,
   firstBlockFrame:binding.firstBlockFrame,lastBlockFrame:binding.lastBlockFrame,
   decodedSamples:binding.decodedSamples}];
 }));
 assert.equal(Object.keys(feedbackTimings).length,10);
 const source={rawIndexSha256:RAW.sha256,swfSha256:SOURCE.sha256,sampleRate:22050,fps:12};
 const ts=`// Generated by scripts/prepare-nms-l02-p062-audio-v1.mjs from the pinned source raw index. Do not edit.\n`+
  `/** Full MP3 payloads; empty blocks and signed seeks remain metadata, not added PCM or trim. */\n`+
  `export const P062_AUDIO_SOURCE = ${JSON.stringify(source,null,2)} as const;\n`+
  `export const P062_AUDIO_DOMAINS = ${JSON.stringify(domains,null,2)} as const;\n`+
  `/** Terminal actions are owned by lesson state; full-payload windows end one frame later. */\n`+
  `export const P062_FEEDBACK_TIMINGS = ${JSON.stringify(feedbackTimings,null,2)} as const;\n`+
  `export type P062AudioDomainId = keyof typeof P062_AUDIO_DOMAINS;\n`+
  `export type P062AudioBinding = (typeof P062_AUDIO_DOMAINS)[P062AudioDomainId];\n`+
  `export const P062_MAIN_STOP_FRAMES = ${JSON.stringify(STOPS)} as const;\n`+
  `export const P062_MAIN_DOMAIN: P062AudioDomainId = 'sprite-315';\n`;
 const generatedBytes=Buffer.from(ts),generated=pin(GENERATED,generatedBytes);
 const receipt={schemaVersion:1,kind:'nms-l02-p062-full-buffer-audio-implementation-input-v1',
  animationId:'shared-nms002-l02-p062',sourceRoot:SOURCE_ROOT,source:SOURCE,sourceXml:XML,
  sourceAudit:AUDIT,sourceBehavior:BEHAVIOR,rawIndex:RAW,generated,mainDomain:'sprite-315',
  sourceMainStops:STOPS,sourceLeadFrames:[1,8],sourceFinalPayloadFrame:828,
  sourceTailFrames:[829,834],streams,feedbackTimings,
  separateLessonSa:{pin:SA,role:'index-only-not-spliced'},
  policy:{fullDecodedBufferCandidate:true,emptyBlockSilenceInserted:false,seekTrimApplied:false,
   originalRuntimeSynchronizationEstablished:false,listeningAccepted:false,
   modernFeedbackSelectionOwnedByLessonState:true}};
 const readme=`# P062 embedded audio binding — 2026-09-28\n\n`+
  `This generated candidate binds 11 independently extracted SWF MP3 streams to exact source bytes, `+
  `raw block frames, declared samples, signed seeks, and full-EOF FFmpeg PCM checks. `+
  `Main sprite 315 has 820 blocks on frames 9–828, 1,503,936 mono samples at 22,050 Hz, `+
  `with source stops 384, 523, 650, 766, 815, 834. Visual frames 1–8 precede audio; `+
  `frames 829–834 follow its last block. Empty blocks 10 and 828 remain empty. `+
  `The final seek -2239 is recorded without trimming or invented silence. `+
  `Sprite 288 is stereo. All ten feedback domains retain their source buffers; `+
  `lesson state alone selects applicable wrong/right feedback.\n\n`+
  `The separate SA recording is pinned for index evidence only. This artifact selects a modern `+
  `full-buffer candidate and does not prove original synchronization, listening, branch choice, `+
  `or acceptance. Run \`node scripts/prepare-nms-l02-p062-audio-v1.mjs --check\` with the real `+
  `\`HELP_MATH_G678_SOURCE_ROOT\` to recheck bytes and decode.\n`;
 return {root,generated:generatedBytes,receipt:bytesJson(receipt),readme:Buffer.from(readme),
  pins:{generated,receipt:pin(RECEIPT,bytesJson(receipt)),readme:pin(README,Buffer.from(readme))}};
}
export function applyP062AudioPlan(plan,mode){
 assert(['--write','--check'].includes(mode));
 const files=[[GENERATED,plan.generated],[RECEIPT,plan.receipt],[README,plan.readme]];
 for(const [relative,bytes] of files){
  const target=path.join(plan.root,relative);
  if(mode==='--write'&&!fs.existsSync(target)){
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});
  }
  assert.deepStrictEqual(fs.readFileSync(target),bytes,`exact generated file ${relative}`);
 }
 return {status:mode==='--check'?'P062_AUDIO_CHECKED':'P062_AUDIO_WRITTEN',...plan.pins};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'use --write or --check');
  const plan=buildP062AudioPlan();console.log(JSON.stringify(applyP062AudioPlan(plan,process.argv[2])));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
