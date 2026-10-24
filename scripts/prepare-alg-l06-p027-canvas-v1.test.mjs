#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(ROOT,'output/alg-l06-p027-canvas-v1');
const read=name=>fs.readFileSync(path.join(OUT,name));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifest=JSON.parse(read('canvas-manifest.json'));
const metadata=JSON.parse(read('canvas-metadata-v1.json'));
const runtime=read('canvas-renderer.js').toString();
const request=(frame,extra={})=>({frame,scenario:'source-static-frame',lang:'en',seed:0,...extra});
const calls={offscreen:0,hostCopies:0,clear:0,fills:0,strokes:0,trace:[]};
function fakeCanvas(host=false){
 const target={width:800,height:600,style:{},attributes:Object.create(null)};
 const context=new Proxy({canvas:target,save(){},restore(){},scale(){},rotate(){},
  translate(){},transform(){},setTransform(){},resetTransform(){}},{
  get(object,key){
   if(key in object)return object[key];
   if(key==='__helpMathFfdecAssetId')return undefined;
   if(key==='createLinearGradient'||key==='createRadialGradient')
    return()=>({addColorStop(){}});
   if(key==='getImageData'||key==='createImageData')
    return()=>({width:800,height:600,data:new Uint8ClampedArray(800*600*4)});
   if(key==='measureText')return()=>({width:0});
   if(key==='fill')return()=>{calls.fills++;calls.trace.push('fill')};
   if(key==='stroke')return()=>{calls.strokes++;calls.trace.push('stroke')};
   if(key==='drawImage')return()=>{if(host)calls.hostCopies++};
   if(key==='clearRect')return()=>{if(host)calls.clear++};
   return()=>{};
  },set(object,key,value){object[key]=value;return true;}
 });
 target.getContext=kind=>{assert.equal(kind,'2d');return context};
 target.setAttribute=(key,value)=>{target.attributes[key]=value};
 if(!host)calls.offscreen++;
 return target;
}
const sandbox={console,Uint8ClampedArray,ImageData:class{},
 document:{createElement(tag){
  if(tag==='canvas')return fakeCanvas();
  throw Error('unexpected element '+tag);
 }},setTimeout(){throw Error('timer denied')}};
runInNewContext(runtime,sandbox,{timeout:10000});
const asset=sandbox.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p027'];
function sample(frame){
 const before={offscreen:calls.offscreen,hostCopies:calls.hostCopies,
  clear:calls.clear,fills:calls.fills,strokes:calls.strokes};
 calls.trace=[];
 const host=fakeCanvas(true),state=asset.render(host,request(frame));
 return {state,host,trace:[...calls.trace],
  offscreen:calls.offscreen-before.offscreen,
  hostCopies:calls.hostCopies-before.hostCopies,
  clear:calls.clear-before.clear,
  fills:calls.fills-before.fills,strokes:calls.strokes-before.strokes};
}

test('physical source and frozen public-tool export reproduce the candidate',()=>{
 const raw=execFileSync('node',['scripts/prepare-alg-l06-p027-canvas-v1.mjs','--check'],
  {cwd:ROOT,env:{...process.env,
   HELP_MATH_G678_SOURCE_ROOT:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'},
   encoding:'utf8'});
 assert.equal(JSON.parse(raw).status,'verified');
 for(const output of manifest.outputs)
  assert.equal(sha(fs.readFileSync(path.join(ROOT,output.path))),output.sha256);
 assert.equal(manifest.source.sha256,
  '689318e75aac8740344e8ff119df34a288e7da24dc3dc0c62c0f22601666f984');
});

test('root frame 6 places background and sprite 46 without executing ActionScript',()=>{
 assert(asset);
 assert.equal(asset.metadata.deterministicContentTimeline.timelineId,'sprite-46');
 assert.equal(asset.metadata.deterministicContentTimeline.frameCount,770);
 assert.equal(asset.metadata.deterministicContentTimeline.playbackMode,'once');
 assert.equal(manifest.rootFrameCount,10);
 assert.deepEqual(manifest.sourceDepthOrder.map(o=>[o.depth,o.characterId]),[[1,1],[2,46]]);
 assert(Math.abs(metadata.stageRenderOffset.x+129.95)<1e-9);
 assert(Math.abs(metadata.stageRenderOffset.y-79.15)<1e-9);
 for(const frame of [1,2,65,66,194,195,264,265,299,300,315,316,
  413,414,429,430,617,618,633,634,659,660,675,676,770]){
  const state=asset.resolveFrameState(request(frame));
  assert.deepEqual([state.localFrame,state.exportFrame,state.rootFrame,
   state.visualOnly,state.interactiveStateResolved,state.audioRendered],
   [frame,frame-1,6,true,false,false]);
 }
 for(const invalid of [request(0),request(771),request(1.5),request(1,{lang:'es'}),
  request(1,{seed:1}),request(1,{scenario:'source-quiz-executed'})])
  assert.throws(()=>asset.resolveFrameState(invalid));
 const first=sample(1);
 assert.equal(first.host.attributes['data-flash-root-frame'],'6');
 assert.equal(first.host.attributes['data-flash-frame-domain'],'sprite-46');
 assert(first.fills>=1,'root source shape draws on the first child frame');
});

test('three masks retain their source boundaries and solid clip alpha',()=>{
 assert.deepEqual(manifest.sourceClipMasks.map(m=>[m.frame,m.characterId,m.depth,m.clipDepth]),
  [[2,2,1,10],[66,2,11,18],[195,2,19,24]]);
 assert.deepEqual(manifest.sourceMaskNormalization.normalizedSolidShapes,[2]);
 assert(runtime.includes('ctx.fillStyle="rgba(0,0,0,1)";'));
 const before=sample(1),first=sample(2),next=sample(66),third=sample(195);
 assert(first.offscreen>before.offscreen);
 assert(next.offscreen>first.offscreen);
 assert(third.offscreen>next.offscreen);
 assert([before,first,next,third].every(row=>row.hostCopies===1&&row.clear===1));
});

test('morph shape 37 has four 16-step source windows',()=>{
 assert.deepEqual(manifest.sourceMorph.windows,[[300,315],[414,429],[618,633],[660,675]]);
 assert.equal(manifest.sourceMorph.ratioStepsPerWindow,16);
 assert(runtime.includes('function morphshape37('));
 const boundaries=[299,300,301,314,315,316,413,414,429,430,
  617,618,633,634,659,660,675,676];
 const snapshots=boundaries.map(frame=>sample(frame));
 assert(snapshots.every(s=>s.hostCopies===1&&s.clear===1));
 assert(snapshots.every(s=>s.offscreen>=1));
 assert(snapshots.every(s=>s.fills>0));
});

test('all source text ink remains; arbitrary seek and Replay are repeatable',()=>{
 assert.deepEqual(manifest.sourceGlyphRendering.sourceCharacterIds,
  [5,10,11,12,13,15,18,20,22,25,26,27,28,30,31,33,35]);
 assert.equal(manifest.sourceGlyphRendering.default,'preserve-all');
 assert.equal(manifest.sourceGlyphRendering.suppressTextIdsSupported,false);
 assert(!runtime.includes('suppressSourceTextIds'));
 const frames=[1,66,195,300,429,633,770,1,66,195,300,429,633,770];
 const traces=frames.map(sample);
 for(let i=0;i<frames.length/2;i++)
  assert.deepEqual(traces[i].trace,traces[i+frames.length/2].trace);
 assert(traces.every(row=>row.hostCopies===1&&row.clear===1));
 assert.equal(manifest.acceptanceEffects.currentJsRegistered,false);
 assert.equal(manifest.acceptanceEffects.originalRuntime,false);
 assert.equal(manifest.acceptanceEffects.listening,false);
 assert(!/\b(?:setInterval|setTimeout|fetch|XMLHttpRequest)\s*\(/u.test(runtime));
 assert(!runtime.includes('DoHyperLinks'));
});

test('the complete 770-frame domain draws independently and can return to frame 1',()=>{
 for(let frame=1;frame<=770;frame++){
  const row=sample(frame);
  assert.equal(row.state.localFrame,frame);
  assert.equal(row.hostCopies,1);
  assert.equal(row.clear,1);
  assert(row.offscreen>=1);
 }
 const replay=sample(1);
 assert.equal(replay.state.exportFrame,0);
 assert.equal(replay.hostCopies,1);
});
