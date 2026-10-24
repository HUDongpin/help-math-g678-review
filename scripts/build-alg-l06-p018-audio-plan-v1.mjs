#!/usr/bin/env node
/** Deterministic P018 source + browser decoder plan; no playback acceptance. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='migrations/shared-alg001-l06-p018/audit/audio-v1/audio-source-audit-v1.json';
const SOURCE_SHA='c70000c012ccdbb7a78de7ee8059f1e3d595e0977a2d52d81d6357a618ca0b3b';
const BROWSER='output/playwright/alg-l06-p018-browser-audio-v1/decode-receipt.json';
const BROWSER_SHA='91e54d6dfafa4835f3d29808c5f9bf5bfd587172081705b40fba610ac898e7cb';
const REPORT='migrations/shared-alg001-l06-p018/audit/audio-plan-v1/audio-plan-v1.json';
const TYPESCRIPT='packages/demos/src/generated/alg-l06-p018-audio-plan-v1.ts';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(file,bytes)=>({path:file,bytes:bytes.length,sha256:hash(bytes)});
function readPinned(file,sha){
 const absolute=path.join(ROOT,file);assert.equal(realpathSync(absolute),absolute);
 const before=lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n);
 const bytes=readFileSync(absolute),after=lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`${file}:${key}`);
 assert.equal(hash(bytes),sha,`${file} SHA-256`);
 return {pin:pin(file,bytes),value:JSON.parse(bytes)};
}
function output(file,bytes,mode){
 const absolute=path.join(ROOT,file);
 if(mode==='--check')assert(readFileSync(absolute).equals(bytes),`output drift: ${file}`);
 else{
  mkdirSync(path.dirname(absolute),{recursive:true});
  try{writeFileSync(absolute,bytes,{flag:'wx'});}
  catch(error){if(error?.code!=='EEXIST')throw error;
   assert(readFileSync(absolute).equals(bytes),`immutable output: ${file}`);}
 }
 return pin(file,bytes);
}
export function buildAudioPlan(){
 const source=readPinned(SOURCE,SOURCE_SHA),browser=readPinned(BROWSER,BROWSER_SHA);
 const audit=source.value,decode=browser.value;
 assert.equal(audit.kind,'alg-l06-p018-audio-source-audit-v1');
 assert.equal(audit.domainCount,3);assert.equal(audit.streamCount,1);
 assert.deepEqual(audit.trailers,[]);
 const stream=audit.streams[0];
 assert.equal(stream.domain,'sprite-32');assert.equal(stream.declaredFrames,648);
 assert.equal(stream.blockCount,647);assert.equal(stream.declaredSamples,1188288);
 assert.equal(stream.streamHead.hex,'0a2a2d078906');
 assert.deepEqual(stream.contiguousRanges.map(r=>[r.firstFrame,r.lastFrame]),[[2,648]]);
 assert.deepEqual(stream.absentBlockFrames,[]);
 assert.deepEqual(stream.zeroPayloadBlocks.map(p=>p.frame),[3]);
 assert(stream.packets.every(p=>p.rawSeekSamples>=0));
 assert.equal(stream.contiguousRanges[0].firstPacket.rawSeekSamples,1673);
 assert.equal(decode.kind,'alg-l06-p018-browser-decode-v1');
 assert.match(decode.userAgent,/HeadlessChrome\/153\.0\.0\.0/u);
 assert.equal(decode.originalRuntimeAccepted,false);
 assert.equal(decode.listeningAccepted,false);
 assert.equal(decode.results.length,2);
 const main=decode.results.find(r=>r.role==='sprite-32-source-v1.mp3');
 const sa=decode.results.find(r=>r.role==='separate-sa');
 assert(main&&sa&&main.playbackStarted===false&&sa.playbackStarted===false);
 assert.equal(main.sourceSha256,stream.extractedMp3.sha256);
 assert.equal(main.sourceBytes,stream.extractedMp3.bytes);
 assert.equal(main.sampleRate,22050);assert.equal(main.channels,1);
 assert.equal(main.decodedSamples,stream.decode.samples);
 assert.equal(sa.sourceSha256,audit.separateSa.copy.sha256);
 assert.equal(sa.sourceBytes,audit.separateSa.copy.bytes);
 assert.equal(sa.sampleRate,48000);assert.equal(sa.channels,1);
 assert.equal(sa.decodedSamples,audit.separateSa.decode.samples);
 const mainAsset={id:'main-1',domain:'sprite-32',firstBlockFrame:2,lastBlockFrame:648,
  lastVisualFrame:648,initialSeekSamples:1673,
  sourcePath:stream.extractedMp3.path,sourceSha256:main.sourceSha256,
  sourceBytes:main.sourceBytes,sampleRate:main.sampleRate,channels:main.channels,
  decodedSamples:main.decodedSamples,pcmSha256:main.pcmSha256,
  receiptSha256:BROWSER_SHA,originalRuntimeAccepted:false,audioAccepted:false};
 const saAsset={...sa,sourcePath:audit.separateSa.copy.path,receiptSha256:BROWSER_SHA,
  originalRuntimeAccepted:false,audioAccepted:false};
 const audioEndPosition=mainAsset.firstBlockFrame+
  (mainAsset.decodedSamples-mainAsset.initialSeekSamples)/mainAsset.sampleRate*12;
 assert(audioEndPosition>647&&audioEndPosition<648,'native EOF precedes visual 648');
 const report={schemaVersion:1,kind:'alg-l06-p018-audio-plan-v1',
  status:'source-and-headless-chrome-decode-engineering-candidate',
  sourceAudit:source.pin,browserDecode:browser.pin,mainAssets:[mainAsset],
  separateSa:saAsset,sourceFps:12,nativeAudioEndPosition:audioEndPosition,
  lastVisualFrame:648,
  disposition:{syntheticSilenceAdded:false,mainRangesConcatenated:false,
   separateSaSpliced:false,localeStartsAudio:false,
   sourceSeekPolicy:'first-source-block-positive-seek-modern-candidate',
   originalHostBindingObserved:false,originalRuntimeAccepted:false,
   listeningAccepted:false,audioAccepted:false}};
 const ts='// Generated by scripts/build-alg-l06-p018-audio-plan-v1.mjs; do not hand-edit.\n'+
  'export const P018_AUDIO_ASSETS='+JSON.stringify([mainAsset],null,2)+' as const;\n'+
  'export const P018_SA_ASSET='+JSON.stringify(saAsset,null,2)+' as const;\n';
 return {report,outputs:[[REPORT,Buffer.from(JSON.stringify(report,null,2)+'\n')],
  [TYPESCRIPT,Buffer.from(ts)]]};
}
export function run(mode){
 assert(['--write','--check'].includes(mode));
 const {report,outputs}=buildAudioPlan();
 return {mode,outputs:outputs.map(([file,bytes])=>output(file,bytes,mode)),
  nativeAudioEndPosition:report.nativeAudioEndPosition,
  originalRuntimeAccepted:false,audioAccepted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 console.log(JSON.stringify(run(process.argv[2]),null,2));
