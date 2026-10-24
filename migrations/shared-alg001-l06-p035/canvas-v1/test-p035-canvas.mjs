#!/usr/bin/env node
/** Pure frame and source-map boundaries only; no DOM pixels or AVM1. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createContext,Script} from 'node:vm';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const runtime=fs.readFileSync(path.join(HERE,'canvas-renderer.js'),'utf8');
const source=JSON.parse(fs.readFileSync(path.join(HERE,'source-interaction-map-v1.json')));
const meta=JSON.parse(fs.readFileSync(path.join(HERE,'canvas-metadata-v1.json')));
const sandbox={document:{createElement:()=>({getContext:()=>({})})}};
createContext(sandbox);
new Script(runtime,{filename:'p035-canvas-renderer.js'}).runInContext(sandbox,{timeout:30000});
const asset=sandbox.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p035'];
assert(asset);assert.equal(meta.main.frameCount,534);
for(let frame=1;frame<=534;frame++){
 const state=asset.resolveFrameState({frame,scenario:'source-explicit-frames',lang:'en',seed:0});
 assert.equal(state.frameDomain,'sprite-227');
 assert.equal(state.localFrame,frame);
 assert.equal(state.exportFrame,frame-1);
 assert.equal(state.feedback,null);
 assert.equal(state.audioRendered,false);
}
const allowed={80:29,95:28,126:28,154:28,195:28,207:25};
for(const [spriteId,frames] of Object.entries(allowed)){
 for(const localFrame of [1,frames]){
  const state=asset.resolveFrameState({frame:145,
   feedback:{spriteId:Number(spriteId),localFrame}});
  assert.equal(state.feedback.spriteId,Number(spriteId));
  assert.equal(state.feedback.localFrame,localFrame);
  assert.equal(state.feedback.kind,[80,95,126].includes(Number(spriteId))?'wrong':'right');
 }
 assert.throws(()=>asset.resolveFrameState({frame:145,
  feedback:{spriteId:Number(spriteId),localFrame:frames+1}}),/unsupported feedback/u);
}
for(const request of [
 {frame:0},{frame:535},{frame:145,seed:1},{frame:145,lang:'es'},
 {frame:145,feedback:{spriteId:179,localFrame:1}},
 {frame:145,feedback:{spriteId:999,localFrame:1}},
 {frame:145,feedback:{spriteId:80,localFrame:0}},
 {frame:145,feedback:{spriteId:80,localFrame:1,guess:true}},
 {frame:144,feedback:{spriteId:80,localFrame:1}},
 {frame:146,feedback:{spriteId:80,localFrame:1}},
 ])assert.throws(()=>asset.resolveFrameState(request));
assert.deepEqual(source.glossary.map(x=>[x.key,x.buttonId,x.depth,x.firstFrame,x.lastFrame]),
 [['Substitute',23,18,13,534],['Equation',24,20,13,534],
  ['Function',25,22,13,534],['Output',37,28,89,534],['Input',38,30,89,534]]);
assert(source.glossary.every(x=>x.mask.depth<x.depth&&x.depth<=x.mask.clipDepth));
assert.deepEqual(source.quiz.map(x=>[x.choice,x.buttonId,x.correct,x.firstFrame,x.lastFrame]),
 [['A',54,false,145,145],['B',55,true,145,145],
  ['C',54,false,145,145],['D',54,false,145,145]]);
assert.deepEqual(source.feedbackClose.map(x=>[x.feedbackSpriteId,x.buttonId]),
 [[80,76],[95,89],[126,115]]);
assert.deepEqual(source.feedbackPlacements.map(x=>x.spriteId),
 [80,95,126,154,179,195,207]);
assert(source.feedbackPlacements.find(x=>x.spriteId===179).heldSourceTail);
console.log('P035 pure Canvas checks: 534 main cases, six eligible feedback domains, 179 held, exact source interaction map PASS');
