#!/usr/bin/env node
/** Source-locked P058 embedded stream extraction and block accounting.
 * The independent SA file is inventory only; no scheduling policy is chosen. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';

const script=fileURLToPath(import.meta.url);
const root=path.resolve(path.dirname(script),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const swf={path:'G6-G8-shared/NMS002/L2/TS/L2TS05.swf',bytes:113754,
 sha256:'fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57'};
const sa={path:'G6-G8-shared/NMS002/L2/SA/L2TS05.mp3',bytes:213360,
 sha256:'153f3ec94840fbc958e67c5209abdc25e403c0afe9424529e80343befd8c3c6c'};
const audit={path:'output/nms-l02-p058-source-20260927/source-audit.json',
 sha256:'de06df9ad2434071d8470d14694e2c79543ae5515fdd43df30f1f4809639047a'};
const auditedPayload={path:'output/nms-l02-p058-source-20260927/extraction/embedded-source-stream.mp3',
 bytes:109720,sha256:'05f43faf63e470935728be5b54933ebb71760aeb819074b570091a6e4b068f38'};
const outputDirectory=path.join(root,'output/nms-l02-p058-audio-20260927');
const modulePath=path.join(root,'packages/demos/src/generated/nms-l02-p058-audio-blocks-v1.ts');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

function readStablePinned(base,pin){
 const file=path.join(base,pin.path);
 assert.equal(fs.realpathSync(file),file,`physical source: ${pin.path}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&before.nlink===1n,`ordinary source: ${pin.path}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const field of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(after[field],before[field],`stable source: ${pin.path} ${field}`);
 if(pin.bytes!==undefined)assert.equal(bytes.length,pin.bytes,`source length: ${pin.path}`);
 assert.equal(digest(bytes),pin.sha256,`source SHA-256: ${pin.path}`);
 return bytes;
}
function readSources(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,
  'exact real G6–G8 source root required');
 for(const directory of [root,sourceRoot]){
  assert.equal(fs.realpathSync(directory),directory,`physical directory: ${directory}`);
  assert(fs.lstatSync(directory).isDirectory(),`ordinary directory: ${directory}`);
 }
 const sourceBytes=readStablePinned(sourceRoot,swf);
 const auditData=JSON.parse(readStablePinned(root,audit));
 assert.equal(auditData.animationId,'shared-nms002-l02-p058');
 assert.deepStrictEqual(auditData.source,swf);
 assert.deepStrictEqual(auditData.audio.embeddedStream.payload,auditedPayload);
 assert.equal(auditData.audio.embeddedStream.ffprobeDurationSeconds,21.944);
 assert.deepStrictEqual(auditData.audio.separateLessonSa.pin,sa);
 assert.equal(auditData.audio.sourceAlignmentAccepted,false);
 assert.equal(auditData.audio.listeningAccepted,false);
 readStablePinned(sourceRoot,sa); // inventory binding only; never concatenated or played here
 const existing=readStablePinned(root,auditedPayload);
 return {sourceBytes,auditData,existing};
}
function runTool(command,args,input){
 const result=spawnSync(command,args,{input,maxBuffer:16*1024*1024});
 assert.equal(result.error,undefined,`${command} unavailable: ${result.error?.message}`);
 assert.equal(result.status,0,`${command} failed: ${result.stderr?.toString('utf8')}`);
 return result.stdout;
}
function decodeFullEof(payload){
 const probe=JSON.parse(runTool('ffprobe',['-v','error','-count_frames','-select_streams','a:0',
  '-show_entries','stream=codec_name,sample_rate,channels,nb_read_frames','-of','json','pipe:0'],payload));
 assert.equal(probe.streams?.length,1);
 assert.equal(probe.streams[0].codec_name,'mp3');
 assert.equal(Number(probe.streams[0].sample_rate),22050);
 assert.equal(probe.streams[0].channels,1);
 const pcm=runTool('ffmpeg',['-v','error','-xerror','-i','pipe:0','-map','0:a:0',
  '-f','s16le','-acodec','pcm_s16le','-ac','1','-ar','22050','pipe:1'],payload);
 assert.equal(pcm.length%2,0);
 assert.equal(pcm.length/2,486144,'full-EOF decoded sample count');
 return {codec:'mp3',sampleRateHz:22050,channels:1,
  mp3FramesRead:Number(probe.streams[0].nb_read_frames),
  sampleFormat:'signed-16-bit-little-endian',decodedSamples:pcm.length/2,
  decodedDurationSeconds:pcm.length/2/22050,decodedPcmSha256:digest(pcm),fullEofDecode:true};
}

export function buildP058AudioBlocks(){
 const {sourceBytes,auditData,existing}=readSources();
 const parsed=parseEmbeddedAudioPayloads(sourceBytes);
 assert.deepStrictEqual(parsed.tagCounts,
  {DefineSound:0,SoundStreamHead:1,SoundStreamHead2:0,SoundStreamBlock:265});
 assert.equal(parsed.soundStreams.length,1);
 const stream=parsed.soundStreams[0];
 assert.equal(stream.ownerDomainId,'sprite-37');
 assert.equal(stream.headLocalFrame,1);
 assert.equal(stream.head.format,'mp3');
 assert.equal(stream.head.sampleRateHz,22050);
 assert.equal(stream.head.channels,1);
 assert.equal(stream.head.nominalSamplesPerBlock,1837);
 assert.equal(stream.head.mp3LatencySeek,1673);
 assert.equal(stream.blockCount,265);
 assert.equal(stream.blocksWithExplicitSampleCount,265);
 assert.equal(stream.totalBlockHeaderSampleCount,486144);
 assert.equal(stream.payload.byteLength,auditedPayload.bytes);
 assert.equal(stream.payload.sha256,auditedPayload.sha256);
 const payload=Buffer.from(stream._payloadBytes);
 assert(payload.equals(existing),'independently audited source-order MP3 bytes');
 const blocks=stream.blocks.map((block,index)=>{
  assert.equal(block.blockIndex,index+1);
  assert.equal(block.localFrame,index+10,'source block frame gap or duplicate');
  const next=stream.blocks[index+1];
  assert.equal(block.payload.byteOffsetInStreamArchive+block.payload.byteLength,
   next?next.payload.byteOffsetInStreamArchive:payload.length,
   'contiguous source-order payload');
  assert(Number.isInteger(block.codecWrapperHeader.explicitSampleCount)&&
   block.codecWrapperHeader.explicitSampleCount>=0,'unsigned declared sample count');
  assert(Number.isInteger(block.codecWrapperHeader.mp3SeekSamples)&&
   block.codecWrapperHeader.mp3SeekSamples>=-32768&&
   block.codecWrapperHeader.mp3SeekSamples<=32767,'signed 16-bit seek');
  return {blockIndex:block.blockIndex,frame:block.localFrame,
   sourceTag:{globalOrdinal:block.globalTagOrdinal,ordinalInDomain:block.tagOrdinalInDomain,
    recordHeaderHex:block.swfTagRecordHeader.hex,bodyBytes:block.tagBodyBytes,
    bodySha256:block.tagBodySha256},
   swfMp3HeaderHex:block.codecWrapperHeader.hex,
   declaredSamples:block.codecWrapperHeader.explicitSampleCount,
   seekSamples:block.codecWrapperHeader.mp3SeekSamples,
   payload:{offset:block.payload.byteOffsetInStreamArchive,bytes:block.payload.byteLength,
    sha256:block.payload.sha256}};
 });
 assert.equal(blocks.reduce((sum,block)=>sum+block.declaredSamples,0),486144);
 const emptyPayloadFrames=blocks.filter(block=>block.payload.bytes===0).map(block=>block.frame);
 const negativeSeekFrames=blocks.filter(block=>block.seekSamples<0).map(block=>block.frame);
 assert.deepStrictEqual(emptyPayloadFrames,[11]);
 assert.deepStrictEqual(negativeSeekFrames,[]);
 assert.equal(blocks[0].seekSamples,1673);
 const decode=decodeFullEof(payload);
 const index={schema:'nms-l02-p058-embedded-stream-raw-index-v1',
  status:'source-bound-machine-extraction-only',
  source:{root:sourceRoot,relativePath:swf.path,bytes:swf.bytes,sha256:swf.sha256,
   signature:parsed.source.signature,
   declaredUncompressedBytes:parsed.source.declaredUncompressedBytes,
   uncompressedSha256:parsed.source.uncompressedSha256,
   rootFrameCount:parsed.source.rootFrameCount},
  sourceAudit:audit,
  parserVersion:parsed.parserVersion,tagCounts:parsed.tagCounts,
  stream:{ownerDomainId:stream.ownerDomainId,ownerDomainKind:stream.ownerDomainKind,
   frameDomain:'sprite-37',headLocalFrame:stream.headLocalFrame,
   blockFrameRange:{first:10,last:274,inclusive:true},blockCount:stream.blockCount,
   header:stream.head,declaredBlockSamples:stream.totalBlockHeaderSampleCount,
   payload:{file:'embedded-source-stream-v1.mp3',bytes:payload.length,
    sha256:auditedPayload.sha256,
    assembly:'source-order SoundStreamBlock MP3 payload concatenation without SWF four-byte block wrappers'},
   emptyPayloadFrames,negativeSeekFrames,blocks},
  decode:{...decode,auditFfprobeDurationSeconds:auditData.audio.embeddedStream.ffprobeDurationSeconds},
  separateLessonSa:{source:sa,sampleRateHz:48000,channels:1,
   sourceBinding:'catalog-index-only-not-substituted'},
  interpretation:{headLatencySeekSamples:1673,firstBlockSeekSamples:1673,
   emptyBlockSilenceInserted:false,seekTrimApplied:false,blockReclockingApplied:false,
   spanishAudioSpliced:false,originalRuntimeSynchronizationEstablished:false,
   audioListeningAccepted:false}};
 const moduleSource={animationId:'shared-nms002-l02-p058',sourceSwfSha256:swf.sha256,
  sourcePayloadSha256:auditedPayload.sha256,frameDomain:'sprite-37',
  headFrame:1,firstBlockFrame:10,lastBlockFrame:274,blockCount:265,
  sampleRateHz:22050,totalBlockHeaderSamples:486144,decodedSamples:486144,
  mp3LatencySeekSamples:1673,emptyPayloadFrames,negativeSeekFrames,
  originalRuntimeSynchronizationEstablished:false,audioListeningAccepted:false};
 const module=`// Generated by scripts/build-nms-l02-p058-audio-blocks-v1.mjs; do not edit.\n`+
  `// Raw source block accounting only; no inferred silence, seek trim, or listening acceptance.\n`+
  `export const P058_AUDIO_BLOCK_SOURCE = ${JSON.stringify(moduleSource)} as const;\n`+
  `export const P058_AUDIO_BLOCKS = ${JSON.stringify(blocks.map(block=>({frame:block.frame,
   declaredSamples:block.declaredSamples,seekSamples:block.seekSamples,
   payloadOffset:block.payload.offset,payloadBytes:block.payload.bytes})))} as const;\n`;
 const report=`# P058 embedded source stream extraction\n\n`+
  `The real AWS source \`${swf.path}\` is ${swf.bytes} bytes, SHA-256 \`${swf.sha256}\`. `+
  `This producer rechecked the pinned source audit and its embedded MP3 export, then independently parsed the SWF.\n\n`+
  `Sprite 37 owns 265 MP3 SoundStreamBlocks on local frames 10–274. The source-order codec payload is `+
  `${payload.length} bytes, SHA-256 \`${auditedPayload.sha256}\`. The raw index preserves each block's `+
  `SWF tag header, declared samples, signed seek, payload offset, length, and SHA-256.\n\n`+
  `Full-EOF FFmpeg decode produced ${decode.decodedSamples} mono samples at 22,050 Hz `+
  `(${decode.decodedDurationSeconds.toFixed(6)} s), PCM SHA-256 \`${decode.decodedPcmSha256}\`; `+
  `the sum of block-declared samples is ${stream.totalBlockHeaderSampleCount}. `+
  `The separate audit's FFprobe duration estimate is 21.944 s; its difference from `+
  `the exact decoded-sample duration is retained without cropping or a sync claim. `+
  `The stream head and first block record 1,673 samples of latency/seek. Frame 11 has an empty `+
  `MP3 payload and zero declared samples; no silence was inserted. No negative block seek occurs, `+
  `but every signed value is retained. No seek trim or block reclocking was applied.\n\n`+
  `The separate SA file \`${sa.path}\` is ${sa.bytes} bytes, SHA-256 \`${sa.sha256}\`, `+
  `48-kHz mono, with index-level role evidence only. It was verified as inventory and never substituted `+
  `for or spliced into the embedded stream. Original-host synchronization, audible content, `+
  `listening acceptance, Current-JS registration, and publication are not established.\n`;
 return {payload,index,module,report};
}

function main(){
 const mode=process.argv[2]??'--check';
 assert(['--check','--write'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p058-audio-blocks-v1.mjs [--check|--write]');
 const built=buildP058AudioBlocks();
 const outputs=[
  [path.join(outputDirectory,'embedded-source-stream-v1.mp3'),built.payload],
  [path.join(outputDirectory,'raw-index-v1.json'),Buffer.from(`${JSON.stringify(built.index,null,2)}\n`)],
  [path.join(outputDirectory,'AUDIO_SOURCE_2026-09-27.md'),Buffer.from(built.report)],
  [modulePath,Buffer.from(built.module)],
 ];
 if(mode==='--write'){
  for(const [file] of outputs)assert(!fs.existsSync(file),`P058 output exists: ${file}`);
  fs.mkdirSync(outputDirectory,{recursive:true});
  for(const [file,bytes] of outputs)fs.writeFileSync(file,bytes,{flag:'wx'});
 }else for(const [file,bytes] of outputs)
  assert(fs.readFileSync(file).equals(bytes),`P058 output drift: ${file}`);
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,
  outputs:outputs.map(([file,bytes])=>({path:path.relative(root,file),bytes:bytes.length,
   sha256:digest(bytes)})),decodedSamples:built.index.decode.decodedSamples,
  audioAccepted:false})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===script)main();
