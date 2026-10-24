#!/usr/bin/env node
/** Reproduce the canonical P032 source audio from its physical SWF and audit. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PHYSICAL='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const AUDIT='migrations/shared-alg001-l06-p032/audit/source-planning-v1';
const PLAN=`${AUDIT}/source-plan-v1.json`;
const SOURCE_XML=`${AUDIT}/source-structure.xml`;
const AUDIT_PAYLOAD=`${AUDIT}/embedded-streams/sprite-22.mp3`;
const OUT='migrations/shared-alg001-l06-p032/audio-source-v1';
const BROWSER=`${OUT}/chrome-decode-v1/browser-decode-v1.json`;
const BROWSER_RAW=`${OUT}/chrome-decode-v1/browser-decode-raw-v1.txt`;
const BROWSER_SOURCES=`${OUT}/chrome-decode-v1/sources-v1.json`;
const BROWSER_READBACK=`${OUT}/chrome-decode-v1/readback-pins-v1.json`;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});
function stableRead(base,expected){
 const file=path.join(base,expected.path),real=fs.realpathSync(file);
 assert.equal(real,file,`physical path: ${file}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
   before.size<32n*1024n*1024n,'bounded ordinary file');
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const field of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(after[field],before[field],`stable ${field}: ${file}`);
 assert.equal(bytes.length,expected.bytes,`size: ${file}`);
 assert.equal(sha(bytes),expected.sha256,`SHA-256: ${file}`);
 return bytes;
}
function technicalPcm(bytes,rate){
 const pcm=execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin',
  '-xerror','-f','mp3','-i','pipe:0','-ac','1','-ar',String(rate),
  '-f','f32le','pipe:1'],{input:bytes,maxBuffer:8*1024*1024});
 assert.equal(pcm.length%4,0);
 return {format:'mono-f32le',sampleRate:rate,channels:1,
  samples:pcm.length/4,sha256:sha(pcm),browserBinding:false};
}
function proposal(){
 const planBytes=fs.readFileSync(path.join(ROOT,PLAN));
 assert.equal(sha(planBytes),'593976a049450ddb17d0b344f8877ffe110c312c5324a3527358c62538f92d26');
 const plan=JSON.parse(planBytes);
 assert.equal(plan.identity.animationId,'shared-alg001-l06-p032');
 assert.equal(plan.identity.ordinal,32);
 assert.equal(plan.physicalSource.root,PHYSICAL);
 assert.equal(plan.physicalSource.swf.sha256,
  'e425600d0b6cfab41ae50f7512cb8e6c4e3c6ee04bbfa10c29b437459876d836');
 const workspace=JSON.parse(fs.readFileSync(path.join(ROOT,
  'migrations/shared-alg001-l06-p032/migration.json')));
 assert.equal(workspace.animationId,plan.identity.animationId);
 assert.equal(workspace.source.swfSha256,plan.physicalSource.swf.sha256);
 assert.equal(workspace.source.swf,path.join(PHYSICAL,plan.physicalSource.swf.path));
 assert.deepEqual(plan.frameDomains.map(d=>[d.domain,d.frames]),
  [['root',10],['sprite-22',413]]);
 const swf=stableRead(PHYSICAL,plan.physicalSource.swf);
 const sa=stableRead(PHYSICAL,plan.physicalSource.separateSa);
 stableRead(PHYSICAL,plan.physicalSource.lessonXml);
 const xml=execFileSync('swfmill',['swf2xml','stdin'],
  {input:swf,maxBuffer:4*1024*1024});
 assert.equal(sha(xml),plan.extraction.swfmillXml.sha256,
  'fresh physical SWF XML must match source plan');
 assert.deepEqual(xml,stableRead(ROOT,{path:SOURCE_XML,
  bytes:plan.extraction.swfmillXml.bytes,
  sha256:plan.extraction.swfmillXml.sha256}));
 const sprite=xml.toString('utf8').match(
  /<DefineSprite objectID="22" frames="413">([\s\S]*?)<\/DefineSprite>/u)?.[1];
 assert(sprite,'source sprite22');
 const head=sprite.match(/<SoundStreamHead\b([^>]*)>[\s\S]*?<latencySeek>\s*<data>([A-Za-z0-9+/=]+)<\/data>/u);
 assert(head&&head[1].includes('compression="2"')&&
  head[1].includes('soundRate="2"')&&head[1].includes('soundStereo="0"'));
 const latencySeek=Buffer.from(head[2],'base64').readInt16LE(0);
 assert.equal(latencySeek,1673);
 let frame=1,offset=0;const blocks=[],payload=[];
 for(const tag of sprite.matchAll(/<ShowFrame\s*\/>|<SoundStreamBlock>\s*<data>([A-Za-z0-9+/=]+)<\/data>\s*<\/SoundStreamBlock>/gu)){
  if(tag[0].startsWith('<ShowFrame')){frame++;continue;}
  const raw=Buffer.from(tag[1],'base64');assert(raw.length>=4);
  const samples=raw.readUInt16LE(0),seek=raw.readInt16LE(2),mp3=raw.subarray(4);
  blocks.push({frame,samples,seek,rawBytes:raw.length,
   mp3Bytes:mp3.length,mp3Offset:offset});
  payload.push(mp3);offset+=mp3.length;
 }
 assert.equal(frame,414);
 assert.equal(blocks.length,413);
 assert(blocks.every((b,i)=>b.frame===i+1));
 assert.deepEqual(blocks.filter(b=>b.samples===0).map(b=>b.frame),[2]);
 assert.deepEqual(blocks.filter(b=>b.mp3Bytes===0).map(b=>b.frame),[2]);
 assert.deepEqual(blocks.filter(b=>b.seek<0),[]);
 assert.deepEqual(blocks[0],{frame:1,samples:3456,seek:1673,
  rawBytes:784,mp3Bytes:780,mp3Offset:0});
 assert.equal(blocks.reduce((n,b)=>n+b.samples,0),758016);
 const main=Buffer.concat(payload);
 assert.equal(main.length,171080);
 assert.equal(sha(main),plan.embeddedAudio.payload.sha256);
 // The discovery plan's path is historical. The exact payload bytes were
 // promoted into the canonical audit without rewriting that frozen plan.
 assert.equal(path.basename(plan.embeddedAudio.payload.path),'sprite-22.mp3');
 assert.deepEqual(main,stableRead(ROOT,{...plan.embeddedAudio.payload,
  path:AUDIT_PAYLOAD}));
 const technicalMain=technicalPcm(main,22050),technicalSa=technicalPcm(sa,48000);
 assert.deepEqual([technicalMain.samples,technicalMain.sha256],
  [758016,'3d1b76c12063ffc8886251b0648551f45656142e518c6e166663dc6258379051']);
 assert.deepEqual([technicalSa.samples,technicalSa.sha256],
  [796032,'95da9f0f4b8ae43948d1711993b0323929fb1a1bce43252a54698b8c3d7f2517']);
 const browserBytes=fs.readFileSync(path.join(ROOT,BROWSER));
 assert.equal(sha(browserBytes),'053da9d023865b72ea5a45e82dcabb0a779514b8ea0603dda1325e54219929f9');
 const rawBytes=fs.readFileSync(path.join(ROOT,BROWSER_RAW));
 assert.equal(sha(rawBytes),'71631f8827fe9ba6b8b13cfc6e355c0ed2ee7980576e39226d7812d906d2649e');
 const sourceBytes=fs.readFileSync(path.join(ROOT,BROWSER_SOURCES));
 assert.equal(sha(sourceBytes),'25a794f96c5e0986f717060fc87140fe49d17ef13a44d7784e14c5a2bcad1dca');
 const readbackBytes=fs.readFileSync(path.join(ROOT,BROWSER_READBACK));
 assert.equal(sha(readbackBytes),'b8b4f1203e56ada0ff2040a55df6a2af2c12e77b0d2ff26a14be8828d3ba5cf5');
 const readback=JSON.parse(readbackBytes);
 const browser=JSON.parse(browserBytes);
 const rawResult=rawBytes.toString('utf8').split('### Result\n')[1]
  ?.split('\n### Ran Playwright code')[0];
 assert(rawResult,'Chrome raw decode result');
 assert.deepEqual(JSON.parse(rawResult),browser);
 assert.equal(browser.kind,'p032-chrome-native-decode-only');
 assert.deepEqual(browser.results.map(x=>[x.id,x.sourceSha256,x.samples,x.pcmSha256]),[
  ['sprite-22',sha(main),758016,'6b33e50188fb094d75efc85565431551186f9fe47cea5020a6e73f5342940373'],
  ['separate-sa',sha(sa),796032,'9d800df26565b9c8c5b572e0e2f4ed3618b52ac5d99438f2c53f6674d3f7be19']]);
 const sourceRows=JSON.parse(sourceBytes);
 assert.deepEqual(sourceRows.map(row=>[row.id,row.sourceBytes,row.sourceSha256]),
  [['sprite-22',main.length,sha(main)],['separate-sa',sa.length,sha(sa)]]);
 // These copied pins document the original capture paths; the generator
 // never reads them or relies on output scratch after promotion.
 for(const [suffix,bytes] of [
  ['/browser-decode-v1.json',browserBytes],
  ['/source-plan-v1.json',planBytes],
  ['/sprite-22.mp3',main],
  ['/SA/L6IN04.mp3',sa]]){
  assert(readback.some(row=>row.path.endsWith(suffix)&&
   row.bytes===bytes.length&&row.sha256===sha(bytes)),`capture pin: ${suffix}`);
 }
 const binding=(row,bytes)=>({sourceSha256:row.sourceSha256,sourceBytes:bytes.length,
  sampleRate:row.sampleRate,channels:row.channels,decodedSamples:row.samples,
  pcmSha256:row.pcmSha256});
 const mainPath=`${OUT}/main-source-v1.mp3`,saPath=`${OUT}/separate-sa-source-v1.mp3`;
 const blockPath=`${OUT}/main-block-schedule-v1.json`;
 const schedule=Buffer.from(JSON.stringify({schemaVersion:1,kind:'p032-source-mp3-blocks-v1',
  sourceSwfSha256:sha(swf),frameDomain:'sprite-22',fps:12,
  latencySeekSamples:latencySeek,blocks},null,2)+'\n');
 const manifest={schemaVersion:1,kind:'alg-l06-p032-audio-domain-plan-v1',
  status:'source-extraction-plus-chrome-decode; no playback, host, or listening acceptance',
  sourcePlan:pin(PLAN,planBytes),physicalSourceRoot:PHYSICAL,
  sourceSwf:plan.physicalSource.swf,sourceXml:plan.physicalSource.lessonXml,
  browserDecodeEvidence:pin(BROWSER,browserBytes),
  browserRawEvidence:pin(BROWSER_RAW,rawBytes),
  browserSourceEvidence:pin(BROWSER_SOURCES,sourceBytes),
  browserHistoricalReadback:pin(BROWSER_READBACK,readbackBytes),
  frameDomain:'sprite-22',fps:12,rootEntryFrame:6,visualFrames:413,
  main:{asset:pin(mainPath,main),blockSchedule:pin(blockPath,schedule),
   firstBlockFrame:1,lastBlockFrame:413,blockCount:413,
   declaredSamples:758016,latencySeekSamples:latencySeek,
   firstBlock:{frame:1,samples:3456,seek:1673,mp3Bytes:780},
   zeroPayloadFrames:[2],negativeSeekFrames:[],
   sourceSampleRate:22050,sourceChannels:1,
   ffmpegPcmCandidate:technicalMain,browserBinding:binding(browser.results[0],main),
   nativeEofRequired:true,visualEndDoesNotEstablishEof:true,
   sourceFrameToDecodedSampleAlignmentAccepted:false},
  optionalSpanishAudio:{source:plan.physicalSource.separateSa,
   asset:pin(saPath,sa),trigger:'explicit-user-only',localeAutoplay:false,
   joinedWithMain:false,sourceSampleRate:48000,sourceChannels:1,
   ffmpegPcmCandidate:technicalSa,browserBinding:binding(browser.results[1],sa),
   hostTriggerVerified:false},
  cueEvidence:{rootFrame6PlacesSprite22:true,
   glossaryButtons:plan.actions.glossary.map(x=>({buttonId:x.buttonId,key:x.keyAttribute,
    presentSpans:x.presentSpans,hostStopRequested:true})),
   heldGlossaryReturnRequiresHostValidation:true},
  limits:{browserDecodeObserved:true,playbackObserved:false,
   originalRuntimeObserved:false,sourceSyncAccepted:false,
   listeningAccepted:false,audioAccepted:false,currentJsRegistered:false}};
 return {main,sa,schedule,manifest:Buffer.from(JSON.stringify(manifest,null,2)+'\n')};
}
function immutable(relative,bytes,mode){
 const file=path.join(ROOT,relative);
 if(mode==='--write'){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  try{fs.writeFileSync(file,bytes,{flag:'wx'});}
  catch(error){if(error?.code!=='EEXIST')throw error;}
 }
 assert.deepEqual(stableRead(ROOT,pin(relative,bytes)),bytes,
  `immutable extraction: ${relative}`);
 return pin(relative,bytes);
}
export function prepareP032Audio(mode='--check'){
 assert(['--write','--check','--plan'].includes(mode));
 const p=proposal(),files={main:`${OUT}/main-source-v1.mp3`,
  sa:`${OUT}/separate-sa-source-v1.mp3`,
  schedule:`${OUT}/main-block-schedule-v1.json`,
  plan:`${OUT}/audio-domain-plan-v1.json`};
 if(mode==='--plan')return Object.fromEntries(Object.entries(files).map(([key,file])=>
  [key,pin(file,p[key==='plan'?'manifest':key])]));
 return {status:'canonical-audio-source-only; not registered or accepted',
  main:immutable(files.main,p.main,mode),sa:immutable(files.sa,p.sa,mode),
  schedule:immutable(files.schedule,p.schedule,mode),
  plan:immutable(files.plan,p.manifest,mode),
  browserDecodeObserved:true,playbackObserved:false,registered:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);
 console.log(JSON.stringify(prepareP032Audio(process.argv[2]),null,2));
}
