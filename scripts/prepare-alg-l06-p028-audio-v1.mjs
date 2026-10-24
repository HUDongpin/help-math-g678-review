#!/usr/bin/env node
/** P028 physical-source audio extraction. Browser decode and listening stay open. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const PLAN='output/alg-l06-p028-source-planning-20261001-v1/source-plan-v1.json';
const OUT='output/alg-l06-p028-audio-extraction-v1';
const ROOT=(()=>{let at=path.dirname(fileURLToPath(import.meta.url));
  while(!fs.existsSync(path.join(at,PLAN))){const next=path.dirname(at);
    if(next===at)throw Error('P028_WORKTREE_NOT_FOUND');at=next;}return at;})();
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});
function readPinned(root,expected){
 const file=path.join(root,expected.path),real=fs.realpathSync(file);
 assert.equal(real,file,'physical source path');
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
   before.size<32n*1024n*1024n,'ordinary bounded source');
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const field of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(after[field],before[field],`stable ${field}`);
 assert.equal(bytes.length,expected.bytes);assert.equal(sha(bytes),expected.sha256);
 return bytes;
}
function decode(bytes,rate){
 const pcm=execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin',
   '-xerror','-f','mp3','-i','pipe:0','-ac','1','-ar',String(rate),
   '-f','f32le','pipe:1'],{input:bytes,maxBuffer:8*1024*1024});
 assert.equal(pcm.length%4,0);
 return {format:'mono-f32le',sampleRate:rate,channels:1,
   samples:pcm.length/4,sha256:sha(pcm),browserDecodeObserved:false};
}
function proposal(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,
   'explicit physical AWS source root required');
 const planBytes=fs.readFileSync(path.join(ROOT,PLAN));
 const plan=JSON.parse(planBytes);
 assert.equal(plan.identity.animationId,'shared-alg001-l06-p028');
 assert.equal(plan.identity.globalActiveOrdinal,28);
 assert.equal(plan.source.physicalRoot,SOURCE_ROOT);
 assert.equal(plan.source.swf.sha256,
   '12b9912231512d5622b96708b83331217691169fadf185b3b2d0a27733e3c297');
 assert.equal(plan.source.separateSa.sha256,
   'f056221dc3c4251538c3a1d2c201bec5abe92c18a58f6ce1d185a8a6cf6703cf');
 assert.deepEqual(plan.frameDomains.map(d=>[d.id,d.frames]),
   [['root',10],['sprite-30',134]]);
 const swf=readPinned(SOURCE_ROOT,plan.source.swf);
 const sa=readPinned(SOURCE_ROOT,plan.source.separateSa);
 readPinned(SOURCE_ROOT,plan.source.lessonXml);
 const xml=execFileSync('swfmill',['swf2xml','stdin'],
   {input:swf,maxBuffer:4*1024*1024});
 assert.equal(sha(xml),plan.extraction.swfmillXml.sha256,
   'fresh physical SWF must reproduce audit XML');
 const sprite=xml.toString('utf8').match(
   /<DefineSprite objectID="30" frames="134">([\s\S]*?)<\/DefineSprite>/u)?.[1];
 assert(sprite,'source sprite-30');
 const head=sprite.match(/<SoundStreamHead\b([^>]*)>[\s\S]*?<latencySeek>\s*<data>([A-Za-z0-9+/=]+)<\/data>/u);
 assert(head&&head[1].includes('compression="2"')&&
   head[1].includes('soundRate="2"')&&head[1].includes('soundStereo="0"'));
 const headSeek=Buffer.from(head[2],'base64').readInt16LE(0);
 assert.equal(headSeek,1673);
 let frame=1,offset=0;const blocks=[],payload=[];
 for(const tag of sprite.matchAll(/<ShowFrame\s*\/>|<SoundStreamBlock>\s*<data>([A-Za-z0-9+/=]+)<\/data>\s*<\/SoundStreamBlock>/gu)){
   if(tag[0].startsWith('<ShowFrame')){frame++;continue;}
   const raw=Buffer.from(tag[1],'base64');assert(raw.length>=4);
   const samples=raw.readUInt16LE(0),seek=raw.readInt16LE(2),mp3=raw.subarray(4);
   blocks.push({frame,samples,seek,mp3Bytes:mp3.length,mp3Offset:offset});
   payload.push(mp3);offset+=mp3.length;
 }
 assert.equal(frame,135);assert.equal(blocks.length,133);
 assert(blocks.every((b,i)=>b.frame===i+2),'source blocks 2–134');
 assert.deepEqual(blocks.filter(b=>b.samples===0).map(b=>b.frame),[3]);
 assert.deepEqual(blocks.filter(b=>b.mp3Bytes===0).map(b=>b.frame),[3]);
 assert.deepEqual(blocks.filter(b=>b.seek<0),[]);
 assert.equal(blocks.reduce((sum,b)=>sum+b.samples,0),243648);
 const main=Buffer.concat(payload);
 assert.equal(main.length,54990);
 assert.equal(sha(main),plan.audio.embeddedStream.payload.sha256);
 assert.deepEqual(blocks[0].frame,2);
 const mainPcm=decode(main,22050),saPcm=decode(sa,48000);
 assert.equal(mainPcm.samples,243648);
 assert.equal(mainPcm.sha256,plan.audio.embeddedStream.ffmpegPcmCandidate.sha256);
 const mainPath=`${OUT}/main-source-v1.mp3`,saPath=`${OUT}/separate-sa-source-v1.mp3`;
 const manifest={schemaVersion:1,kind:'alg-l06-p028-audio-domain-plan-v1',
   status:'physical-source-extraction-and-FFmpeg-decode-only',
   sourcePlan:pin(PLAN,planBytes),physicalSourceRoot:SOURCE_ROOT,
   sourceSwf:plan.source.swf,sourceXml:plan.source.lessonXml,
   frameDomain:'sprite-30',fps:12,rootEntryFrame:6,visualFrames:134,
   main:{asset:pin(mainPath,main),firstBlockFrame:2,lastBlockFrame:134,
     blockCount:133,declaredSamples:243648,initialSeekSamples:headSeek,
     sourceSampleRate:22050,sourceChannels:1,zeroPayloadFrames:[3],
     blockSequenceSha256:sha(Buffer.from(JSON.stringify(blocks))),
     ffmpegPcmCandidate:mainPcm,browserBinding:null,nativeEofRequired:true},
   optionalSpanishAudio:{source:plan.source.separateSa,asset:pin(saPath,sa),
     trigger:'explicit-user-only',localeAutoplay:false,joinedWithMain:false,
     sourceSampleRate:48000,sourceChannels:1,ffmpegPcmCandidate:saPcm,
     browserBinding:null},
   limits:{browserDecodeObserved:false,playbackObserved:false,
     originalRuntimeObserved:false,sourceSyncAccepted:false,
     listeningAccepted:false,audioAccepted:false,currentJsRegistered:false}};
 return {main,sa,manifest:Buffer.from(JSON.stringify(manifest,null,2)+'\n'),blocks};
}
function immutable(relative,bytes,mode){
 const file=path.join(ROOT,relative);
 if(mode==='--prepare'||mode==='--write'){
   fs.mkdirSync(path.dirname(file),{recursive:true});
   try{fs.writeFileSync(file,bytes,{flag:'wx'});}
   catch(error){if(error?.code!=='EEXIST')throw error;}
 }
 assert.deepEqual(readPinned(ROOT,pin(relative,bytes)),bytes,
   `immutable extraction ${relative}`);
 return pin(relative,bytes);
}
export function prepareP028Audio(mode='--check'){
 assert(['--prepare','--write','--check','--plan'].includes(mode));
 const p=proposal();
 const files={main:`${OUT}/main-source-v1.mp3`,sa:`${OUT}/separate-sa-source-v1.mp3`,
   plan:`${OUT}/audio-domain-plan-v1.json`};
 if(mode==='--plan')return Object.fromEntries(Object.entries(files).map(([key,file])=>
   [key,pin(file,key==='main'?p.main:key==='sa'?p.sa:p.manifest)]));
 return {status:'technical-source-audio-extraction',
   main:immutable(files.main,p.main,mode),sa:immutable(files.sa,p.sa,mode),
   plan:immutable(files.plan,p.manifest,mode),blocks:p.blocks.length,
   browserDecodeObserved:false,registered:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);
 console.log(JSON.stringify(prepareP028Audio(process.argv[2]),null,2));
}
