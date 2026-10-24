import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP058AudioBlocks} from './build-nms-l02-p058-audio-blocks-v1.mjs';

const script=fileURLToPath(new URL('./build-nms-l02-p058-audio-blocks-v1.mjs',import.meta.url));
const output=new URL('../output/nms-l02-p058-audio-20260927/',import.meta.url);
const generated=new URL('../packages/demos/src/generated/nms-l02-p058-audio-blocks-v1.ts',import.meta.url);
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P058 source order, signed block headers, EOF decode, and separate SA identity are reproducible',t=>{
 if(!process.env.HELP_MATH_G678_SOURCE_ROOT){t.skip('real AWS source root required');return;}
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot);
 const built=buildP058AudioBlocks();
 const raw=readFileSync(new URL('raw-index-v1.json',output));
 const mp3=readFileSync(new URL('embedded-source-stream-v1.mp3',output));
 const report=readFileSync(new URL('AUDIO_SOURCE_2026-09-27.md',output));
 const moduleBytes=readFileSync(generated);
 const index=JSON.parse(raw);
 assert.equal(index.source.sha256,'fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57');
 assert.equal(index.source.bytes,113754);
 assert.equal(index.sourceAudit.sha256,'de06df9ad2434071d8470d14694e2c79543ae5515fdd43df30f1f4809639047a');
 assert.equal(index.stream.ownerDomainId,'sprite-37');
 assert.deepEqual(index.stream.blockFrameRange,{first:10,last:274,inclusive:true});
 assert.equal(index.stream.blockCount,265);
 assert.equal(index.stream.blocks.length,265);
 assert.deepEqual(index.stream.blocks.map(block=>block.frame),
  Array.from({length:265},(_,index)=>index+10));
 assert.equal(index.stream.blocks.reduce((sum,block)=>sum+block.declaredSamples,0),486144);
 assert.equal(index.stream.header.mp3LatencySeek,1673);
 assert.equal(index.stream.blocks[0].seekSamples,1673);
 assert.equal(index.stream.blocks.at(-1).seekSamples,388);
 assert.deepEqual(index.stream.emptyPayloadFrames,[11]);
 assert.deepEqual(index.stream.negativeSeekFrames,[]);
 assert.equal(index.stream.blocks[1].declaredSamples,0);
 assert.equal(index.stream.blocks[1].payload.offset,780);
 assert.equal(index.stream.blocks[1].payload.bytes,0);
 assert.equal(mp3.length,109720);
 assert.equal(digest(mp3),'05f43faf63e470935728be5b54933ebb71760aeb819074b570091a6e4b068f38');
 for(const [i,block] of index.stream.blocks.entries()){
  assert.equal(block.blockIndex,i+1);
  assert(Number.isInteger(block.seekSamples)&&block.seekSamples>=-32768&&block.seekSamples<=32767);
  const bytes=mp3.subarray(block.payload.offset,block.payload.offset+block.payload.bytes);
  assert.equal(digest(bytes),block.payload.sha256);
  assert.equal(block.payload.offset+block.payload.bytes,
   index.stream.blocks[i+1]?.payload.offset??mp3.length);
 }
 assert.equal(index.decode.mp3FramesRead,844);
 assert.equal(index.decode.decodedSamples,486144);
 assert.equal(index.decode.auditFfprobeDurationSeconds,21.944);
 assert.equal(index.decode.decodedPcmSha256,
  '24c56d86ba92a5038291cdd79238e309f7e58422f2dc7ea99931d265c259c2fc');
 assert.equal(index.decode.fullEofDecode,true);
 assert.deepEqual(index.separateLessonSa.source,
  {path:'G6-G8-shared/NMS002/L2/SA/L2TS05.mp3',bytes:213360,
   sha256:'153f3ec94840fbc958e67c5209abdc25e403c0afe9424529e80343befd8c3c6c'});
 assert.equal(index.interpretation.emptyBlockSilenceInserted,false);
 assert.equal(index.interpretation.seekTrimApplied,false);
 assert.equal(index.interpretation.spanishAudioSpliced,false);
 assert.equal(index.interpretation.audioListeningAccepted,false);
 assert.deepEqual(mp3,built.payload);
 assert.deepEqual(raw,Buffer.from(`${JSON.stringify(built.index,null,2)}\n`));
 assert.deepEqual(moduleBytes,Buffer.from(built.module));
 assert.deepEqual(report,Buffer.from(built.report));
 const check=spawnSync(process.execPath,[script,'--check'],{encoding:'utf8',env:process.env});
 assert.equal(check.status,0,check.stderr);
 assert.equal(JSON.parse(check.stdout).status,'PASS');
 const overwrite=spawnSync(process.execPath,[script,'--write'],{encoding:'utf8',env:process.env});
 assert.notEqual(overwrite.status,0);
 assert.match(overwrite.stderr,/P058 output exists/u);
 assert.deepEqual(readFileSync(new URL('raw-index-v1.json',output)),raw);
});

test('P058 extractor rejects an unpinned source root before reading source bytes',()=>{
 const rejected=spawnSync(process.execPath,[script,'--check'],
  {encoding:'utf8',env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:'/tmp'}});
 assert.notEqual(rejected.status,0);
 assert.match(rejected.stderr,/exact real G6–G8 source root required/u);
});
