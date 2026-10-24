import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan} from './probe-nms-l02-p062-host-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P062 probe plans only the two bounded candidate scenarios and no glossary',()=>{
 const p=plan();
 assert.equal(p.animationId,'shared-nms002-l02-p062');
 assert.equal(p.registeredPredecessorCount,60);
 assert.equal(p.projectedRegisteredCount,61);
 assert.equal(p.main.sourceFrames,837);
 assert.deepEqual(p.main.authoredStops,[384,523,650,766,815,834]);
 assert.deepEqual(p.helpBoxes.map(box=>[box.spriteId,box.mainStop,box.releaseFrame,box.resetFrame]),
  [[106,650,15,20],[122,766,21,27]]);
 assert.deepEqual(p.sourceOccurrences,[]);
 assert.equal(p.sourceGlossaryControlsPresent,false);
 assert.deepEqual(p.cases.map(row=>[row.locale,row.answers]),
  [['en','wrong-then-right'],['es','two-wrong']]);
 assert.equal(new Set(p.inputPaths).size,p.inputPaths.length,'Every input is pinned once');
 assert.equal(Object.keys(p.audioDomains).length,11);
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','candidate-v1']),{mode:'run',slug:'candidate-v1'});
 assert.throws(()=>parseArgs(['--run','../escape']),/Usage/u);
});

test('P062 probe source and audio constants match physical inputs',async()=>{
 const p=plan();
 for(const pin of [p.source,p.sourceXml]){
  const bytes=await readFile(pin.path);
  assert.deepEqual({bytes:bytes.length,sha256:sha256(bytes)},
   {bytes:pin.bytes,sha256:pin.sha256});
 }
 for(const [domain,pin] of Object.entries(p.audioDomains)){
  const bytes=await readFile(path.join(root,`output/nms-l02-p062-source-20260928/extraction/audio/${domain}.mp3`));
  assert.deepEqual({bytes:bytes.length,sha256:sha256(bytes)},
   {bytes:pin.bytes,sha256:pin.sha256},domain);
 }
 for(const input of p.inputPaths)await readFile(path.isAbsolute(input)?input:path.join(root,input));
});
