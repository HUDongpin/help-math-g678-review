import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {audit} from './audit-alg-l06-p025-text-geometry-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=audit();
const summary=JSON.parse(output.get('text-geometry-v1.json'));
const frames=JSON.parse(output.get('frame-states-v1.json')).frames;

test('physical source root mount and two filled source masks govern distinct depth ranges',()=>{
 assert.deepEqual(summary.rootPlacement.matrix,[1,0,0,1,8248,5666]);
 assert.deepEqual(summary.masks.map(m=>[m.frame,m.characterId,m.depth,m.clipDepth]),
  [[2,2,1,10],[52,2,11,16]]);
 assert.equal(summary.shapes.mask.filledRectangle,true);
 assert.equal(summary.shapes.hit.filledRectangle,true);
 assert.deepEqual(summary.shapes.mask.bounds,{left:-3269,right:3270,top:-331,bottom:330});
 const first=frames[1].rows.find(r=>r.characterId===7);
 const second=frames[51].rows.find(r=>r.characterId===16);
 assert.deepEqual(first.masks.map(m=>[m.depth,m.clipDepth]),[[1,10]]);
 assert.deepEqual(second.masks.map(m=>[m.depth,m.clipDepth]),[[11,16]]);
 assert.equal(first.completeHit,false);
 assert.equal(second.completeHit,false);
});

test('glossary interaction gates require full blue ink and full hit after placement',()=>{
 const expected=new Map([
  ['Independent variable',[2,28]],['Function',[2,50]],
  ['Input variable',[2,41]],['Domain',[52,295]],
 ]);
 for(const term of summary.glossary){
  const [placement,ready]=expected.get(term.key);
  assert.equal(term.firstButtonPlacementFrame,placement);
  assert.equal(term.firstSourceReadyFrame,ready);
  assert(ready>placement);
  assert.equal(term.firstReadySample.buttonFullHit,true);
  assert.equal(term.firstReadySample.blueRunComplete,true);
  assert.equal(term.firstReadySample.overlapRatio,1);
  assert.equal(term.sourceReadyIntervals[0].firstFrame,ready);
  assert.equal(term.sourceReadyIntervals.at(-1).lastFrame,299);
  assert.equal(term.placementSample.sourceReady,false);
 }
 assert.equal(summary.glossary.find(g=>g.key==='Domain').firstFullBlueRunFrame,294);
 assert.equal(summary.glossary.find(g=>g.key==='Domain').firstFullHitFrame,295);
});

test('complete native paragraph groups wait for source wipe and transient glyphs remain separate',()=>{
 const groups=Object.fromEntries(summary.nativeGroups.map(g=>[g.name,g]));
 assert.equal(groups['primary-definition'].firstCompleteInkFrame,50);
 assert.equal(groups['domain-definition'].firstCompleteInkFrame,295);
 assert.equal(frames[48].rows.find(r=>r.characterId===5).completeInk,false);
 assert.equal(frames[49].rows.find(r=>r.characterId===5).completeInk,true);
 assert.equal(frames[293].rows.find(r=>r.characterId===15).completeInk,false);
 assert.equal(frames[294].rows.find(r=>r.characterId===15).completeInk,true);
 const transient=summary.staticInstances.filter(x=>['independent','variable','input','function','domain']
  .includes(x.text)&&x.lastFrameExclusive===x.placementFrame+1);
 assert.equal(transient.length,18);
 assert(transient.every(x=>x.firstCompleteInkFrame===x.placementFrame));
});

test('generated frame and summary bytes are deterministic from pinned source',()=>{
 assert.equal(frames.length,299);
 for(const [name,bytes] of output)
  assert.deepEqual(fs.readFileSync(path.join(root,'output/alg-l06-p025-text-geometry-v1',name)),
   bytes,`frozen ${name}`);
 assert.equal(summary.limitations.originalRuntimeObserved,false);
 assert.equal(summary.limitations.conservativeGlyphControlHullNotPixels,true);
});
