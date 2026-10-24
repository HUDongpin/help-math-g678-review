#!/usr/bin/env node
/** Reproduce the eight P029 embedded domains from the frozen physical SWF audit. */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeSwfAdpcmBlocks, encodePcm16LeWav} from './lib/swf-adpcm.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'..');
const plan=JSON.parse(await readFile(path.join(repo,'output/alg-l06-p029-source-planning-20261001-v1/source-plan-v1.json')));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const insist=(ok,reason)=>{if(!ok)throw Error(reason);};
const mode=process.argv[2];
insist(['--write','--check'].includes(mode)&&process.argv.length===3,'use --write or --check');
insist(plan.identity.animationId==='shared-alg001-l06-p029','P029 identity drift');
const physical=path.join(plan.source.physicalRoot,plan.source.swf.path);
const swf=await readFile(physical);
insist(swf.length===plan.source.swf.bytes&&sha(swf)===plan.source.swf.sha256,'physical SWF drift');
// The frozen discovery plan predates this exact canonical workspace. Its
// no-workspace guard is historical, not permission to recreate the workspace.
const planBytes=await readFile(path.join(repo,'output/alg-l06-p029-source-planning-20261001-v1/source-plan-v1.json'));
insist(planBytes.length===45304&&sha(planBytes)==='b9e4e69b74bfb3668b10d0f04553de6be066c38b6c160f72a7bc17889fbf25c4','frozen discovery plan drift');
const workspace=JSON.parse(await readFile(path.join(repo,'migrations/shared-alg001-l06-p029/migration.json')));
insist(workspace.animationId===plan.identity.animationId&&workspace.source.swfSha256===plan.source.swf.sha256&&workspace.source.swf===physical,'reuse exact canonical workspace');
execFileSync('python3',[path.join(repo,'output/alg-l06-p029-source-planning-20261001-v1/extract-structure-v1.py'),'--check'],{stdio:'pipe'});
const lesson=await readFile(path.join(plan.source.physicalRoot,plan.source.lessonXml.path));
insist(lesson.length===plan.source.lessonXml.bytes&&sha(lesson)===plan.source.lessonXml.sha256,'physical lesson XML drift');

const streams=plan.audio.embeddedStreams;
insist(streams.length===8&&streams.map(s=>+s.frameDomain).sort((a,b)=>a-b).join(',')==='52,67,98,126,151,167,179,185','eight-domain inventory drift');
const assets=[];
const target=path.join(repo,'migrations/shared-alg001-l06-p029/audio-v1/assets');
if(mode==='--write')await mkdir(target,{recursive:true});
async function retain(name,bytes){
  const output=path.join(target,name);
  if(mode==='--write'){
    try{await writeFile(output,bytes,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
  }
  insist((await readFile(output)).equals(bytes),`${name} staging drift`);
}
for(const stream of streams){
  const id=+stream.frameDomain;
  const raw=await readFile(path.join(repo,stream.rawPayload.path));
  insist(raw.length===stream.rawPayload.bytes&&sha(raw)===stream.rawPayload.sha256,`sprite ${id} raw drift`);
  insist(stream.lastBlockFrame-stream.firstBlockFrame+1===stream.blockCount,`sprite ${id} block range drift`);
  let playback=raw,playbackCodec='audio/mpeg',sampleRate=22050,sourceSampleRate=22050,technicalSamples=stream.declaredSamples;
  if(id===179){
    insist(stream.codec==='swf-adpcm'&&raw.length===3770&&stream.blockCount===13&&stream.head.sampleSize==='459','ADPCM structure drift');
    const blocks=Array.from({length:13},(_,index)=>({bytes:raw.subarray(index*290,(index+1)*290),sampleCountPerChannel:459}));
    const decoded=decodeSwfAdpcmBlocks(blocks,{channels:1});
    insist(decoded.blockCount===13&&decoded.sampleCountPerChannel===5967&&decoded.decodedBlocks.every(b=>b.codeSizeBits===5&&b.packetCount===1&&b.paddingBitCount===6&&b.paddingValue===0),'ADPCM decode drift');
    playback=encodePcm16LeWav(decoded.pcm16,{sampleRateHz:5512,channels:1});
    insist(playback.length===11978&&sha(playback)==='f3e05365073feff502feda8779b3d3a5e3ba4ca6ee213e7a162e1ad5b3961eb8','ADPCM WAV identity drift');
    // The shared Web Audio transport requires >=8 kHz. A browser must measure
    // this exact 5,512 Hz WAV decoded into an explicit 11,025 Hz context.
    sourceSampleRate=5512;sampleRate=11025;technicalSamples=5967;playbackCodec='audio/wav';
  }else insist(stream.codec==='mp3'&&Number.isSafeInteger(stream.declaredSamples)&&stream.ffmpegPcmCandidate.browserOrOriginalRuntimeProof===false,`sprite ${id} MP3 disposition drift`);
  const name=`sprite-${id}.${id===179?'wav':'mp3'}`;
  await retain(name,playback);
  assets.push({domain:`sprite-${id}`,characterId:id,codec:stream.codec,playbackCodec,
    filename:name,sourceBytes:playback.length,sourceSha256:sha(playback),
    rawSourceSha256:sha(raw),firstBlockFrame:stream.firstBlockFrame,
    lastBlockFrame:stream.lastBlockFrame,blockCount:stream.blockCount,
    visualFrames:stream.visualFrames,sampleRate,sourceSampleRate,channels:1,technicalSamples,
    browserBinding:null,originalRuntimeAccepted:false,listeningAccepted:false});
}
const sa=plan.audio.separateSa.source;
const saBytes=await readFile(path.join(plan.source.physicalRoot,sa.path));
insist(saBytes.length===sa.bytes&&sha(saBytes)===sa.sha256,'separate SA drift');
await retain('separate-sa.mp3',saBytes);
const manifest={schemaVersion:1,kind:'alg-l06-p029-audio-staging-v1',
  physicalSwf:{path:physical,bytes:swf.length,sha256:sha(swf)},fps:12,
  quizHoldFrame:145,firstPostQuizFrame:146,mainDomain:'sprite-185',
  embedded:assets,separateSa:{filename:'separate-sa.mp3',sourceBytes:saBytes.length,
    sourceSha256:sha(saBytes),playbackCodec:'audio/mpeg',sampleRate:48000,
    channels:1,trigger:'explicit-user-only'},
  sourceAlignment:'unresolved',browserDecodeObserved:false,
  ffmpegPcmUsedAsBrowserBinding:false,originalRuntimeAccepted:false,
  listeningAccepted:false,audioAccepted:false};
const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
if(mode==='--write'){
  try{await writeFile(path.join(repo,'migrations/shared-alg001-l06-p029/audio-v1/audio-manifest-v1.json'),manifestBytes,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
}
insist((await readFile(path.join(repo,'migrations/shared-alg001-l06-p029/audio-v1/audio-manifest-v1.json'))).equals(manifestBytes),'audio manifest drift');
const schedule=Buffer.from(`/** Generated from physical-SWF-verified audio-manifest-v1.json. Do not hand-edit. */\n`+
  `export const P029_AUDIO_MANIFEST = ${JSON.stringify(manifest,null,2)} as const;\n`);
if(mode==='--write'){
  try{await writeFile(path.join(repo,'packages/demos/src/alg-l06-p029/audio-schedule-v1.ts'),schedule,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
}
insist((await readFile(path.join(repo,'packages/demos/src/alg-l06-p029/audio-schedule-v1.ts'))).equals(schedule),'audio schedule drift');
console.log(JSON.stringify({mode,swfSha256:sha(swf),domains:assets.length,adpcmWavSha256:assets.find(a=>a.characterId===179).sourceSha256,separateSaSha256:sha(saBytes)}));
