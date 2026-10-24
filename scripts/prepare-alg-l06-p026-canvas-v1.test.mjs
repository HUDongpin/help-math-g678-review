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
const OUT=path.join(ROOT,'output/alg-l06-p026-canvas-v1');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=name=>fs.readFileSync(path.join(OUT,name));
const manifest=JSON.parse(read('canvas-manifest.json'));
const metadata=JSON.parse(read('canvas-metadata-v1.json'));
const runtime=read('canvas-renderer.js').toString();
const request=(frame,extra={})=>({frame,scenario:'source-static-frame',lang:'en',seed:0,...extra});
const calls={offscreen:0,hostCopies:0,fills:0,strokes:0,clear:0,
 titleFirst:false,frameTrace:[]};
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
   if(key==='fill')return()=>{calls.fills++;calls.frameTrace.push('fill')};
   if(key==='stroke')return()=>{calls.strokes++;calls.frameTrace.push('stroke')};
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
  if(tag==='img')return {complete:true,naturalWidth:1,naturalHeight:1,
   addEventListener(){},removeEventListener(){},set src(value){this._src=value},
   get src(){return this._src}};
  throw Error('unexpected element '+tag);
 }},setTimeout(){throw Error('timer denied')}};
runInNewContext(runtime,sandbox,{timeout:10000});
const asset=sandbox.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p026'];
function sample(frame,extra={}){
 const before={offscreen:calls.offscreen,hostCopies:calls.hostCopies,
  fills:calls.fills,strokes:calls.strokes,clear:calls.clear};
 calls.frameTrace=[];
 const host=fakeCanvas(true),state=asset.render(host,request(frame,extra));
 return {state,host,offscreen:calls.offscreen-before.offscreen,
  hostCopies:calls.hostCopies-before.hostCopies,fills:calls.fills-before.fills,
  strokes:calls.strokes-before.strokes,clear:calls.clear-before.clear,
  trace:[...calls.frameTrace]};
}

test('physical source and frozen exports regenerate the actual files',()=>{
 const raw=execFileSync('node',['scripts/prepare-alg-l06-p026-canvas-v1.mjs','--check'],
  {cwd:ROOT,env:{...process.env,
   HELP_MATH_G678_SOURCE_ROOT:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'},
   encoding:'utf8'});
 assert.equal(JSON.parse(raw).status,'verified');
 for(const output of manifest.outputs)
  assert.equal(sha(fs.readFileSync(path.join(ROOT,output.path))),output.sha256);
 assert.equal(manifest.source.sha256,
  'a61e60f95dc597c7b0024e7f013abfade47e199ae911be77916d5b38c7828e0c');
});

test('root title and child are separate exact source placements and domains',()=>{
 assert(asset);
 assert.equal(asset.metadata.deterministicContentTimeline.timelineId,'sprite-55');
 assert.equal(asset.metadata.deterministicContentTimeline.frameCount,389);
 assert.equal(asset.metadata.deterministicContentTimeline.playbackMode,'once');
 assert.deepEqual([...asset.metadata.sourceGlyphRendering.auditedStaticTextIds],
  [6,12,15,17,20,23,26,27,28,30]);
 assert.equal(asset.metadata.sourceGlyphRendering.suppressTextIdsSupported,true);
 assert.equal(manifest.rootFrameCount,10);
 assert.deepEqual(manifest.sourceDepthOrder.map(({depth,characterId,x,y})=>
  [depth,characterId,x,y]),[[1,2,400,43.1],[3,55,412.4,283.3]]);
 assert(Math.abs(metadata.stageRenderOffset.x+117.8)<1e-9);
 assert(Math.abs(metadata.stageRenderOffset.y-80.8)<1e-9);
 const first=sample(1);
 assert.equal(first.fills,1,'one-frame source title draws even before paragraph entry');
 assert.equal(first.host.attributes['data-flash-root-frame'],'6');
 assert.equal(first.host.attributes['data-flash-frame-domain'],'sprite-55');
 for(const frame of [1,2,6,18,19,30,31,80,81,144,145,146,147,148,
  157,158,159,195,196,199,200,253,254,261,262,319,320,329,331,333,335,389]){
  const state=asset.resolveFrameState(request(frame));
  assert.deepEqual([state.localFrame,state.exportFrame,state.rootFrame,
   state.visualOnly,state.interactiveStateResolved,state.audioRendered],
   [frame,frame-1,6,true,false,false]);
 }
 for(const invalid of [request(0),request(390),request(1.5),
  request(31,{lang:'es'}),request(31,{seed:1}),
  request(31,{scenario:'source-quiz-executed'})])
  assert.throws(()=>asset.resolveFrameState(invalid));
});

test('source masks remain scoped to both later paragraph ranges',()=>{
 assert.deepEqual(manifest.sourceClipMasks.map(({frame,characterId,depth,clipDepth})=>
  [frame,characterId,depth,clipDepth]),[[31,18,15,24],[81,18,25,30]]);
 assert.deepEqual(manifest.sourceMaskNormalization.normalizedSolidShapes,[18]);
 assert(runtime.includes('ctx.fillStyle="rgba(0,0,0,1)";'));
 const before=sample(30),first=sample(31),between=sample(80),second=sample(81);
 assert.equal(before.offscreen,1);
 assert(first.offscreen>before.offscreen);
 assert.equal(first.offscreen,between.offscreen);
 assert(second.offscreen>first.offscreen);
 assert.equal(first.hostCopies,1);
 assert.equal(second.clear,1);
});

test('only fully owned paragraph text IDs can be requested for suppression',()=>{
 const text=manifest.sourceGlyphRendering;
 assert.deepEqual(text.suppressibleCharacterIds,[6,12,15,17,20,23,26,27,28,30]);
 assert.equal(text.default,'preserve-all');
 assert.equal(text.nativeBinding,'every-instance-must-be-owned-before-suppression');
 assert(text.animatedLetterSequenceIds.includes(32));
 assert(text.animatedLetterSequenceIds.includes(54));
 const normal=sample(200),suppressed=sample(200,
  {suppressSourceTextIds:[6,12,15,17,20,23,26,27,28,30]});
 assert.deepEqual([...suppressed.state.suppressedSourceTextIds],
  [6,12,15,17,20,23,26,27,28,30]);
 assert.deepEqual([...asset.resolveFrameState(request(200,
  {suppressSourceTextIds:[17,20]})).suppressedSourceTextIds],[17,20]);
 assert(suppressed.fills<normal.fills);
 assert(suppressed.fills>1,'animated letters remain in the source drawing');
 for(const ids of [[32],[54],[6,6],[20,17],['6'],[999]])
  assert.throws(()=>sample(200,{suppressSourceTextIds:ids}));
 const following=sample(200);
 assert.deepEqual(following.trace,normal.trace,'suppression never leaks to another frame');
});

test('arbitrary seek and Replay have isolated, repeatable drawings',()=>{
 const sequence=[1,31,81,200,389,1,31,81,200,389];
 const traces=sequence.map(frame=>sample(frame));
 for(let index=0;index<5;index++)
  assert.deepEqual(traces[index].trace,traces[index+5].trace);
 assert(traces.every(trace=>trace.hostCopies===1&&trace.clear===1));
 assert(traces.every(trace=>trace.offscreen>=1));
 assert.equal(manifest.acceptanceEffects.currentJsRegistered,false);
 assert.equal(manifest.acceptanceEffects.originalRuntime,false);
 assert.equal(manifest.acceptanceEffects.listening,false);
 assert(!runtime.includes('setInterval('));
 assert(!runtime.includes('DoHyperLinks'));
});
