import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {applyP061Source,resolveP061Placement,SWF,SPANISH_AUDIO} from './prepare-nms-l02-p061-source.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const output=path.join(root,'output/nms-l02-p061-source-20260927');

test('P061 XML places Question 2 once at page 61, seventh TS',()=>{
 const xml=fs.readFileSync(path.join(sourceRoot,'G6-G8-shared/NMS002/L2/index.xml'),'utf8');
 assert.deepEqual(resolveP061Placement(xml),{lessonPageCount:64,globalPageOrdinal:61,section:'TS',
  sectionPageOrdinal:7,reference:'TS/L2TS08.swf',title:'Question 2',
  previous:'shared-nms002-l02-p060',next:'shared-nms002-l02-p062',pairedFlaPresent:false});
 assert.throws(()=>resolveP061Placement(xml.replace('TS/L2TS08.swf','TS/L2TS07.swf')),
  /64 active lesson pages|one exact P061 XML reference/u);
});

test('P061 rebuild checks complete physical source and derived audio/text/script inventory',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot);
 const result=applyP061Source('--check');
 assert.equal(result.extractionFiles,141); // XML + 66 AS + 63 text + 11 embedded MP3
 assert.equal(result.scripts,66);
 assert.equal(result.texts,63);
 assert.equal(result.streams,11);
 assert.equal(result.blocks,1189);
 assert.deepEqual(result.source,SWF);
 const audit=JSON.parse(fs.readFileSync(path.join(output,'source-audit.json')));
 const index=JSON.parse(fs.readFileSync(path.join(output,'audio-raw-index.json')));
 assert.equal(audit.sourceStructure.teachingSpriteId,315);
 assert.deepEqual(audit.sourceStructure.teachingActionFrames,[435,573,700,817,860,861,879]);
 assert.deepEqual(audit.teachingActions.filter(a=>a.hasStop).map(a=>a.frame),[435,573,700,817,860,879]);
 assert.equal(audit.audio.separateLessonSa.pin.sha256,SPANISH_AUDIO.sha256);
 assert.equal(audit.audio.listeningAccepted,false);
 assert.deepEqual(audit.glossary.sourceKeys,['Equivalent decimal','Express','Denominator',
  'Percent','Equivalent fraction','Decimal fraction']);
 assert.equal(index.streams.length,11);
 const main=index.streams.at(-1);
 assert.equal(main.ownerDomainId,'sprite-315');
 assert.equal(main.blockCount,867);
 assert.deepEqual(main.blockFrameRange,{first:9,last:875,inclusive:true});
 assert.deepEqual(main.emptyPayloadFrames,[10,875]);
 assert.deepEqual(main.negativeSeekBlocks,[{frame:875,seekSamples:-2178}]);
 assert.equal(index.streams.find(s=>s.ownerDomainId==='sprite-284').header.channels,2);
 assert.equal(index.emptyBlockSilenceInserted,false);
 assert.equal(index.seekTrimApplied,false);
 assert.equal(result.registrationEffect,'none');
});

test('P061 source check rejects a compatibility root before extraction',()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>applyP061Source('--check'),/exact real AWS source root/u);
 }finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});
