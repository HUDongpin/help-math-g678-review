import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {applyP062Source,resolveP062Placement,SWF,SPANISH_AUDIO} from './prepare-nms-l02-p062-source.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const output=path.join(root,'output/nms-l02-p062-source-20260928');

test('P062 XML places Question 3 once at page 62, eighth TS',()=>{
 const xml=fs.readFileSync(path.join(sourceRoot,'G6-G8-shared/NMS002/L2/index.xml'),'utf8');
 assert.deepEqual(resolveP062Placement(xml),{lessonPageCount:64,globalPageOrdinal:62,section:'TS',
  sectionPageOrdinal:8,reference:'TS/L2TS09.swf',title:'Question 3',
  previous:'shared-nms002-l02-p061',next:'shared-nms002-l02-p063',pairedFlaPresent:false});
 assert.throws(()=>resolveP062Placement(xml.replace('TS/L2TS09.swf','TS/L2TS08.swf')),
  /one exact P062 XML reference/u);
});

test('P062 rebuild checks exact real source and all exported script, text, and raw audio',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot);
 const result=applyP062Source('--check');
 assert.equal(result.extractionFiles,144); // XML + 60 scripts + 72 texts + 11 streams.
 assert.equal(result.scripts,60);
 assert.equal(result.texts,72);
 assert.equal(result.streams,11);
 assert.equal(result.blocks,1142);
 assert.deepEqual(result.source,SWF);
 const audit=JSON.parse(fs.readFileSync(path.join(output,'source-audit.json')));
 const index=JSON.parse(fs.readFileSync(path.join(output,'audio-raw-index.json')));
 assert.equal(audit.sourceStructure.teachingSpriteId,315);
 assert.equal(audit.sourceStructure.sprites['315'].frames,837);
 assert.deepEqual(audit.sourceStructure.teachingActionFrames,[384,523,650,766,815,816,834]);
 assert.deepEqual(audit.teachingActions.filter(a=>a.hasStop).map(a=>a.frame),[384,523,650,766,815,834]);
 assert.equal(audit.buttonActions.length,7);
 assert.deepEqual(audit.glossary.sourceKeys,[]);
 assert.equal(audit.audio.separateLessonSa.pin.sha256,SPANISH_AUDIO.sha256);
 assert.equal(audit.audio.listeningAccepted,false);
 assert.equal(index.streams.length,11);
 const main=index.streams.at(-1);
 assert.equal(main.ownerDomainId,'sprite-315');
 assert.equal(main.blockCount,820);
 assert.deepEqual(main.blockFrameRange,{first:9,last:828,inclusive:true});
 assert.deepEqual(main.emptyPayloadFrames,[10,828]);
 assert.deepEqual(main.negativeSeekBlocks,[{frame:828,seekSamples:-2239}]);
 assert.equal(index.streams.find(s=>s.ownerDomainId==='sprite-288').header.channels,2);
 assert.equal(index.emptyBlockSilenceInserted,false);
 assert.equal(index.seekTrimApplied,false);
 assert.equal(result.registrationEffect,'none');
});

test('P062 source check rejects an unapproved compatibility root',()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>applyP062Source('--check'),/exact real AWS source root/u);
 }finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});
