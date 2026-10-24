import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {applyP060Source,resolveP060Placement,SWF,SPANISH_AUDIO} from './prepare-nms-l02-p060-source.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const output=path.join(root,'output/nms-l02-p060-source-20260927');

test('P060 XML source order is one page 60, sixth TS, with no title inference',()=>{
 const xml=fs.readFileSync(path.join(sourceRoot,'G6-G8-shared/NMS002/L2/index.xml'),'utf8');
 const placement=resolveP060Placement(xml);
 assert.deepEqual(placement,{lessonPageCount:64,globalPageOrdinal:60,section:'TS',
  sectionPageOrdinal:6,reference:'TS/L2TS07.swf',title:'Question 1',
  previous:'shared-nms002-l02-p059',next:'shared-nms002-l02-p061',pairedFlaPresent:false});
 assert.throws(()=>resolveP060Placement(xml.replace('TS/L2TS07.swf','TS/L2TS08.swf')),
  /64 active lesson pages|one exact P060 XML reference/u);
});

test('rebuild checks every extracted P060 source file, signed block index, and exact source pins',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot);
 const result=applyP060Source('--check');
 assert.equal(result.extractionFiles,181);
 assert.equal(result.scripts,67);
 assert.equal(result.texts,102);
 assert.equal(result.streams,11);
 assert.equal(result.blocks,1025);
 assert.deepEqual(result.source,SWF);
 const audit=JSON.parse(fs.readFileSync(path.join(output,'source-audit.json')));
 const index=JSON.parse(fs.readFileSync(path.join(output,'audio-raw-index.json')));
 assert.equal(audit.sourceStructure.teachingSpriteId,391);
 assert.deepEqual(audit.sourceStructure.teachingActionFrames,[262,400,527,646,699,700,718]);
 assert.equal(audit.audio.separateLessonSa.pin.sha256,SPANISH_AUDIO.sha256);
 assert.equal(audit.audio.listeningAccepted,false);
 assert.equal(index.streams.length,11);
 assert.equal(index.streams.at(-1).blockCount,703);
 assert.deepEqual(index.streams.at(-1).blockFrameRange,{first:9,last:711,inclusive:true});
 assert.deepEqual(index.streams.at(-1).negativeSeekBlocks,[{frame:711,seekSamples:-2158}]);
 assert.equal(index.emptyBlockSilenceInserted,false);
 assert.equal(index.seekTrimApplied,false);
 assert.equal(result.registrationEffect,'none');
});

test('source check fails closed on a compatibility root before any extraction',()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>applyP060Source('--check'),/exact real AWS source root/u);
 }finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});
