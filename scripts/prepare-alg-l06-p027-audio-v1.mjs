#!/usr/bin/env node
/** Re-extract P027 source audio from the physical SWF; FFmpeg is technical
 * evidence only. Chrome PCM, original-runtime sync and listening stay open. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256} from '../lib/g678-admission-proof.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const PLAN='output/alg-l06-p027-source-planning-20261001-v1/source-plan-v1.json';
const OUT='output/alg-l06-p027-audio-extraction-v1';
export const P027_AUDIO_OUTPUTS=Object.freeze({
 main:`${OUT}/main-source-v1.mp3`,sa:`${OUT}/separate-sa-source-v1.mp3`,
 plan:`${OUT}/audio-domain-plan-v1.json`,
});
const MAIN={path:'G6-G8-shared/ALG001/L6/VB/L6VB20.swf',bytes:262207,
 sha256:'689318e75aac8740344e8ff119df34a288e7da24dc3dc0c62c0f22601666f984'};
const SA={path:'G6-G8-shared/ALG001/L6/SA/L6VB20.mp3',bytes:381360,
 sha256:'445005ae7c0a6f4896c686ad46c35e56847e4e977b991d5aa40add7a5e271cc0'};
const XML={path:'G6-G8-shared/ALG001/L6/index.xml',bytes:13926,
 sha256:'9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'};
const encode=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const abs=relative=>path.join(ROOT,relative);

function decodeCandidate(bytes,rate){
 const pcm=execFileSync('ffmpeg',['-v','error','-i','pipe:0','-ac','1',
  '-ar',String(rate),'-f','f32le','pipe:1'],{input:bytes,maxBuffer:24*1024*1024});
 assert.equal(pcm.length%4,0,'whole f32le samples');
 return {format:'f32le',sampleRate:rate,channels:1,samples:pcm.length/4,
  sha256:sha256(pcm),browserDecodeObserved:false,
  originalRuntimeOrListeningProof:false};
}

function extractMain(swfBytes,sourcePlan){
 const generated=execFileSync('swfmill',['swf2xml','stdin'],
  {input:swfBytes,maxBuffer:32*1024*1024});
 assert.deepEqual(pinFile(ROOT,sourcePlan.extraction.swfmillXml.path),
  sourcePlan.extraction.swfmillXml,'frozen raw XML pin');
 assert.equal(sha256(generated),sourcePlan.extraction.swfmillXml.sha256,
  'swfmill XML must regenerate from current physical SWF');
 const xml=generated.toString('utf8');
 const sprite=xml.match(/<DefineSprite objectID="46" frames="770">([\s\S]*?)<\/DefineSprite>/u)?.[1];
 assert(sprite,'exact 770-frame source sprite');
 const head=sprite.match(/<SoundStreamHead\b([^>]*)>[\s\S]*?<latencySeek>\s*<data>([A-Za-z0-9+/=]+)<\/data>/u);
 assert(head&&head[1].includes('compression="2"')&&head[1].includes('soundRate="2"')&&
  head[1].includes('soundStereo="0"'),'exact source MP3 head');
 assert.equal(Buffer.from(head[2],'base64').readInt16LE(0),1673,'head latency seek');
 let frame=1,offset=0;const blocks=[],payload=[];
 const tags=/<ShowFrame\s*\/>|<SoundStreamBlock>\s*<data>([A-Za-z0-9+/=]+)<\/data>\s*<\/SoundStreamBlock>/gu;
 for(const tag of sprite.matchAll(tags)){
  if(tag[0].startsWith('<ShowFrame')){frame++;continue;}
  const raw=Buffer.from(tag[1],'base64');assert(raw.length>=4,'complete sound block');
  const samples=raw.readUInt16LE(0),seek=raw.readInt16LE(2),mp3=raw.subarray(4);
  blocks.push({frame,samples,seek,mp3Bytes:mp3.length,mp3Offset:offset});
  payload.push(mp3);offset+=mp3.length;
 }
 assert.equal(frame,771,'770 source frames');
 assert.equal(blocks.length,769,'769 consecutive source blocks');
 assert(blocks.every((block,i)=>block.frame===i+2),'frames 2–770 are contiguous');
 assert.deepEqual(blocks[0],{frame:2,samples:3456,seek:1673,mp3Bytes:780,mp3Offset:0});
 assert.deepEqual(blocks[1],{frame:3,samples:0,seek:0,mp3Bytes:0,mp3Offset:780});
 assert.equal(blocks.reduce((sum,block)=>sum+block.samples,0),1412352,
  'declared source samples');
 const main=Buffer.concat(payload);
 assert.deepEqual(pin('main',main).bytes,318760);
 assert.equal(sha256(main),'8b2d1bf09c88647b4799108ad85ff563e744cc899226d1bb1b07ee1cc5551929');
 assert.equal(sha256(main),sourcePlan.audio.embeddedStream.payload.sha256,
  'source-plan MP3 hash');
 return {main,blocks};
}

export function proposedP027Audio(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,
  'explicit physical AWS source root');
 const planPin=pinFile(ROOT,PLAN),sourcePlan=readJsonPin(ROOT,planPin);
 assert.equal(sourcePlan.identity.animationId,'shared-alg001-l06-p027');
 assert.equal(sourcePlan.identity.globalActiveOrdinal,27);
 assert.deepEqual(sourcePlan.source.swf,MAIN);
 assert.deepEqual(sourcePlan.source.separateSa,SA);
 assert.deepEqual(sourcePlan.source.lessonXml,XML);
 assert.equal(sourcePlan.frameDomains[1].id,'sprite-46');
 assert.equal(sourcePlan.frameDomains[1].frames,770);
 assert.equal(sourcePlan.audio.embeddedStream.blockCount,769);
 assert.equal(sourcePlan.audio.embeddedStream.declaredSamples,1412352);
 assert.deepEqual(sourcePlan.audio.embeddedStream.zeroSampleBlocks,
  [{frame:3,samples:0,seek:0,mp3Bytes:0}]);
 const swf=readPin(SOURCE_ROOT,MAIN),sa=readPin(SOURCE_ROOT,SA);
 readPin(SOURCE_ROOT,XML);
 const {main,blocks}=extractMain(swf,sourcePlan);
 const mainCandidate=decodeCandidate(main,22050),saCandidate=decodeCandidate(sa,48000);
 assert.equal(mainCandidate.samples,1412352);
 assert.equal(mainCandidate.sha256,
  'e5a8e22cd15ffa849f495ebca510071558cf5dcd90c2509d2b75be705a65e42e');
 assert.equal(saCandidate.samples,1307520);
 assert.equal(saCandidate.sha256,
  '47b969e1ac241a14cc77683f33005f3ab6a94abc1c73437e3cebfe1eef00a392');
 const mainPin=pin(P027_AUDIO_OUTPUTS.main,main),saPin=pin(P027_AUDIO_OUTPUTS.sa,sa);
 const manifest={schemaVersion:1,kind:'alg-l06-p027-audio-domain-plan-v1',
  sourcePlan:planPin,physicalSourceRoot:SOURCE_ROOT,sourceSwf:MAIN,sourceXml:XML,
  frameDomain:'sprite-46',fps:12,rootEntryFrame:6,visualFrames:770,
  main:{asset:mainPin,firstBlockFrame:2,lastBlockFrame:770,blockCount:769,
   declaredSamples:1412352,firstSeekSamples:1673,sourceSampleRate:22050,
   sourceChannels:1,zeroPayloadFrames:[3],blockSequenceSha256:sha256(encode(blocks)),
   ffmpegPcmCandidate:mainCandidate,browserBinding:null,nativeEofRequired:true},
  optionalSpanishAudio:{source:SA,asset:saPin,trigger:'explicit-user-only',
   localeAutoplay:false,joinedWithMain:false,sourceSampleRate:48000,
   sourceChannels:1,ffmpegPcmCandidate:saCandidate,browserBinding:null},
  limits:{browserDecodeObserved:false,playbackObserved:false,originalRuntimeObserved:false,
   sourceSyncAccepted:false,listeningAccepted:false,audioAccepted:false,
   currentJsRegistered:false,canvasGlyphSuppressionAuthorized:false}};
 return {manifest,main,sa,bytes:encode(manifest),blocks};
}

function immutable(file,bytes){
 const target=abs(file);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(fs.existsSync(target))assert.deepEqual(readPin(ROOT,pin(file,bytes)),bytes,
  `immutable P027 output ${file}`);
 else fs.writeFileSync(target,bytes,{flag:'wx'});
 return pinFile(ROOT,file);
}

export function prepareP027Audio(mode='--check'){
 assert(['--prepare','--check','--plan'].includes(mode),'P027 audio mode');
 const proposal=proposedP027Audio();
 if(mode==='--plan')return {status:'audio-plan-not-written',
  main:pin(P027_AUDIO_OUTPUTS.main,proposal.main),
  sa:pin(P027_AUDIO_OUTPUTS.sa,proposal.sa),
  manifest:pin(P027_AUDIO_OUTPUTS.plan,proposal.bytes),
  browserDecodeObserved:false,registered:false};
 if(mode==='--prepare'){
  immutable(P027_AUDIO_OUTPUTS.main,proposal.main);
  immutable(P027_AUDIO_OUTPUTS.sa,proposal.sa);
  immutable(P027_AUDIO_OUTPUTS.plan,proposal.bytes);
 }
 assert.deepEqual(readPin(ROOT,pin(P027_AUDIO_OUTPUTS.main,proposal.main)),proposal.main);
 assert.deepEqual(readPin(ROOT,pin(P027_AUDIO_OUTPUTS.sa,proposal.sa)),proposal.sa);
 assert.deepEqual(readPin(ROOT,pin(P027_AUDIO_OUTPUTS.plan,proposal.bytes)),proposal.bytes);
 return {status:'source-audio-technical-extraction-verified',
  main:pinFile(ROOT,P027_AUDIO_OUTPUTS.main),sa:pinFile(ROOT,P027_AUDIO_OUTPUTS.sa),
  manifest:pinFile(ROOT,P027_AUDIO_OUTPUTS.plan),blocks:proposal.blocks.length,
  browserDecodeObserved:false,registered:false};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3);
 console.log(JSON.stringify(prepareP027Audio(process.argv[2]),null,2));
}
