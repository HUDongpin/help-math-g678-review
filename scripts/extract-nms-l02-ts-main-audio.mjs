#!/usr/bin/env node
/** Exact P055 embedded SoundStream extraction. SWF wrapper timing is recorded
 * separately from concatenated MP3 decoding; no playback policy is selected. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';
import {rawSwfTags} from './build-g678-alg-l12-p012-audio-source.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/NMS002/L2/TS/L2TS02.swf';
const SA='G6-G8-shared/NMS002/L2/SA/L2TS02.mp3';
const OUT='output/nms-l02-ts-family-20260927/audio';
const AUDIO=`${OUT}/p055-main-sprite-26.mp3`;
const INDEX=`${OUT}/p055-main-audio-index.json`;
const README=`${OUT}/README.md`;
const SWF_SHA='8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e';
const SA_SHA='148a963e1d0e87136cc65b36a73d97625170f53865842c6a12cda2a94c7df576';
const PAYLOAD_SHA='ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});
function ordinary(root,relative,expectedHash) {
  const file=path.join(root,relative);
  assert.equal(fs.realpathSync(file),file,`physical source ${relative}`);
  const before=fs.lstatSync(file,{bigint:true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink===1n,
    `ordinary source ${relative}`);
  const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
  for(const key of ['dev','ino','size','mtimeNs','ctimeNs'])
    assert.equal(before[key],after[key],`stable source ${relative}: ${key}`);
  assert.equal(sha(bytes),expectedHash,`source SHA ${relative}`);
  return bytes;
}
function decode(mp3) {
  const command='/opt/homebrew/bin/ffmpeg';
  const args=['-hide_banner','-loglevel','error','-nostdin','-xerror',
    '-f','mp3','-i','pipe:0','-map','0:a:0','-ac','1','-ar','22050',
    '-c:a','pcm_s16le','-f','s16le','pipe:1'];
  const result=spawnSync(command,args,{input:mp3,maxBuffer:16*1024*1024});
  if(result.error)throw result.error;
  assert.equal(result.status,0,result.stderr.toString().slice(0,600));
  assert(result.stdout.length>0 && result.stdout.length%2===0,'decoded PCM sample alignment');
  return {tool:'ffmpeg',commandMode:'full concatenated MP3 to EOF; mono s16le 22050 Hz',
    sampleRateHz:22050,channels:1,decodedSamples:result.stdout.length/2,
    decodedDurationSeconds:result.stdout.length/2/22050,
    pcmBytes:result.stdout.length,pcmSha256:sha(result.stdout),exitCode:0};
}
function blockGroups(blocks) {
  const groups=[];
  for(const block of blocks) {
    const previous=groups.at(-1);
    if(previous && block.localFrame===previous.lastFrame+1) {
      previous.lastFrame=block.localFrame;previous.blockCount++;
    } else groups.push({firstFrame:block.localFrame,lastFrame:block.localFrame,blockCount:1});
  }
  return groups;
}
export function buildP055Audio({sourceRoot=SOURCE_ROOT,projectRoot=ROOT}={}) {
  assert.equal(sourceRoot,SOURCE_ROOT,'exact real AWS source root');
  assert.equal(fs.realpathSync(sourceRoot),sourceRoot,'source root must be physical');
  assert(fs.lstatSync(sourceRoot).isDirectory() && !fs.lstatSync(sourceRoot).isSymbolicLink(),
    'source root must be a real directory');
  assert.equal(fs.realpathSync(projectRoot),projectRoot,'physical project root');
  const swf=ordinary(sourceRoot,SWF,SWF_SHA),sa=ordinary(sourceRoot,SA,SA_SHA);
  assert.equal(swf.length,149059,'exact P055 SWF bytes');
  assert.equal(sa.length,288288,'exact separate lesson-SA bytes');
  const parsed=parseEmbeddedAudioPayloads(swf);
  const timeline=rawSwfTags(swf);
  assert.equal(timeline.fps,12,'source frame rate');
  assert.equal(timeline.rootFrames,10,'source root frame count');
  assert.equal(timeline.sprites.get(26),351,'source sprite-26 frame count');
  assert.equal(parsed.source.signature,'CWS');
  assert.equal(parsed.source.rootFrameCount,10);
  assert.equal(parsed.source.declaredUncompressedBytes,158409);
  assert.deepStrictEqual(parsed.tagCounts,
    {DefineSound:0,SoundStreamHead:1,SoundStreamHead2:0,SoundStreamBlock:347});
  assert.equal(parsed.soundStreams.length,1,'one embedded main stream');
  const stream=parsed.soundStreams[0];
  assert.equal(stream.ownerDomainId,'sprite-26');
  assert.equal(stream.headLocalFrame,1);
  assert.equal(stream.head.format,'mp3');
  assert.equal(stream.head.sampleRateHz,22050);
  assert.equal(stream.head.channels,1);
  assert.equal(stream.blockCount,347);
  assert.equal(stream.totalBlockHeaderSampleCount,637056);
  assert.equal(stream.payload.byteLength,143780);
  assert.equal(stream.payload.sha256,PAYLOAD_SHA);
  assert.equal(sha(stream._payloadBytes),PAYLOAD_SHA);
  const blocks=stream.blocks.map(item=>({blockIndex:item.blockIndex,localFrame:item.localFrame,
    tagOrdinalInDomain:item.tagOrdinalInDomain,tagBodyBytes:item.tagBodyBytes,
    tagBodySha256:item.tagBodySha256,
    rawMp3BlockHeaderHex:item.codecWrapperHeader.hex,
    declaredSamples:item.codecWrapperHeader.explicitSampleCount,
    signedSeekSamples:item.codecWrapperHeader.mp3SeekSamples,
    mp3PayloadByteOffset:item.payload.byteOffsetInStreamArchive,
    mp3PayloadBytes:item.payload.byteLength,mp3PayloadSha256:item.payload.sha256}));
  assert.deepStrictEqual(blocks.map(item=>item.localFrame),
    Array.from({length:347},(_,i)=>i+5),'source block frame continuity');
  assert.deepStrictEqual(blocks.filter(item=>item.mp3PayloadBytes===0).map(item=>item.localFrame),
    [6],'present block with empty MP3 payload');
  assert.deepStrictEqual(blocks.filter(item=>item.signedSeekSamples<0),[],
    'no negative-seek blocks in this stream');
  assert.equal(blocks.reduce((sum,item)=>sum+item.declaredSamples,0),637056);
  assert.equal(blocks.reduce((sum,item)=>sum+item.mp3PayloadBytes,0),143780);
  const decoded=decode(stream._payloadBytes);
  assert.equal(decoded.decodedSamples,637056,'full MP3 decode agrees with declared sample total');
  const index={schemaVersion:1,kind:'g678-p055-embedded-main-audio-v1',
    animationId:'shared-nms002-l02-p055',
    source:{...pin(SWF,swf),root:sourceRoot,signature:parsed.source.signature,
      declaredUncompressedBytes:parsed.source.declaredUncompressedBytes,
      uncompressedSha256:parsed.source.uncompressedSha256},
    parser:'scripts/build-g4-l3-embedded-audio-archive.mjs#parseEmbeddedAudioPayloads',
    frameDomain:{id:'sprite-26',declaredFrames:351,fps:12,rootFrames:10,
      parentEntryTime:'unverified'},tagCounts:parsed.tagCounts,
    streamHead:{localFrame:stream.headLocalFrame,...stream.head},
    blockCount:stream.blockCount,
    firstBlockFrame:blocks[0].localFrame,lastBlockFrame:blocks.at(-1).localFrame,
    blockGroups:blockGroups(blocks),
    framesWithoutBlock:[1,2,3,4],emptyPayloadBlockFrames:[6],
    negativeSeekBlocks:[],declaredBlockHeaderSamples:stream.totalBlockHeaderSampleCount,
    declaredSampleDurationSeconds:stream.totalBlockHeaderSampleCount/stream.head.sampleRateHz,
    mp3:{...pin(AUDIO,stream._payloadBytes),assembly:'concatenate source-order MP3 bytes after each four-byte SoundStreamBlock header; no gap or seek applied'},
    decode:decoded,blocks,
    separateLessonSaCandidate:{...pin(SA,sa),root:sourceRoot,
      role:'separate lesson-SA candidate; source host cue/language relationship unverified; not substituted for embedded main stream'},
    qualifications:{sourceAlignmentAccepted:false,listeningAccepted:false,
      originalRuntimeAccepted:false,audioAccepted:false,
      note:'SWF block sample counts, signed seeks and absent/empty blocks are preserved as source timing evidence. Full MP3 decoding to EOF does not establish Flash scheduling, audible content, language, or synchronization.'}};
  const readme=Buffer.from(`# P055 embedded main audio — source-bound extraction\n\n`+
    `The real L2TS02.swf (SHA-256 ${SWF_SHA}) contains one MP3 stream in sprite 26, `+
    `351 frames at 12 fps. Its 347 SoundStreamBlocks occur on frames 5–351. `+
    `Frame 6 has a present block with an empty MP3 payload; frames 1–4 have no block. `+
    `There are no negative seek blocks. The head declares latency/seek `+
    `${stream.head.mp3LatencySeek} samples.\n\n`+
    `The raw concatenated MP3 is ${stream._payloadBytes.length} bytes, SHA-256 ${PAYLOAD_SHA}. `+
    `ffmpeg decoded ${decoded.decodedSamples} mono samples at 22,050 Hz `+
    `(${decoded.decodedDurationSeconds.toFixed(6)} s) to EOF. This is not a Flash `+
    `playback-clock or synchronization finding. The separate lesson-SA file is inventory-only. `+
    `No listening, language, original-runtime, fidelity, or acceptance gate is closed.\n`);
  return {index,files:[{path:AUDIO,bytes:stream._payloadBytes},
    {path:INDEX,bytes:json(index)},{path:README,bytes:readme}]};
}
function verifyOutput(root,item) {
  const file=path.join(root,item.path);
  assert(fs.existsSync(file),`missing ${item.path}`);
  const current=fs.readFileSync(file);
  assert(current.equals(item.bytes),`output drift ${item.path}`);
  return pin(item.path,current);
}
export function main(argv=process.argv.slice(2)) {
  assert(argv.length===1 && ['--dry-run','--write','--check'].includes(argv[0]),
    'use --dry-run, --write, or --check');
  const result=buildP055Audio();
  if(argv[0]==='--write') {
    assert(result.files.every(item=>!fs.existsSync(path.join(ROOT,item.path))),
      'immutable audio outputs absent');
    for(const item of result.files) {
      const file=path.join(ROOT,item.path);
      fs.mkdirSync(path.dirname(file),{recursive:true});
      fs.writeFileSync(file,item.bytes,{flag:'wx'});
      verifyOutput(ROOT,item);
    }
  }
  if(argv[0]==='--check')for(const item of result.files)verifyOutput(ROOT,item);
  const report={status:argv[0]==='--dry-run'?'P055_AUDIO_PLAN_NOT_WRITTEN':
    argv[0]==='--write'?'P055_AUDIO_EXTRACTED_NOT_ACCEPTED':'P055_AUDIO_CHECKED_NOT_ACCEPTED',
    files:result.files.map(item=>pin(item.path,item.bytes)),
    blockCount:result.index.blockCount,decodedSamples:result.index.decode.decodedSamples,
    sourceAlignmentAccepted:false,listeningAccepted:false,audioAccepted:false};
  process.stdout.write(JSON.stringify(report)+'\n');
  return report;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{main();}catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
