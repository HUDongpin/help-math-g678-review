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
const OUT=path.join(ROOT,'output/alg-l06-p025-canvas-v1');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=name=>fs.readFileSync(path.join(OUT,name));
const request=frame=>({frame,scenario:'source-static-frame',lang:'en',seed:0});
const manifest=JSON.parse(read('canvas-manifest.json'));
const metadata=JSON.parse(read('canvas-metadata-v1.json'));
const runtime=read('canvas-renderer.js').toString();
const calls={offscreen:0,hostCopies:0,attributes:0};
class BaseContext{
 constructor(canvas){this.canvas=canvas;this._matrix=[1,0,0,1,0,0]}
 save(){} restore(){} scale(){} rotate(){} translate(){} transform(){}
 setTransform(){} resetTransform(){}
}
function fakeCanvas(host=false){
 const target={width:800,height:600,style:{},attributes:Object.create(null)};
 const context=new Proxy(new BaseContext(target),{
  get(object,key){
   if(key in object)return object[key];
   if(key==='__helpMathFfdecAssetId')return undefined;
   if(key==='createLinearGradient'||key==='createRadialGradient')
    return()=>({addColorStop(){}});
   if(key==='getImageData'||key==='createImageData')
    return()=>({width:800,height:600,data:new Uint8ClampedArray(800*600*4)});
   if(key==='measureText')return()=>({width:0});
   if(key==='drawImage')return()=>{if(host)calls.hostCopies++};
   return()=>{};
  },set(object,key,value){object[key]=value;return true;}
 });
 target.getContext=kind=>{assert.equal(kind,'2d');return context};
 target.setAttribute=(key,value)=>{target.attributes[key]=value;calls.attributes++};
 if(!host)calls.offscreen++;
 return target;
}
const sandbox={console,Uint8ClampedArray,ImageData:class{},
 document:{createElement(tag){
  if(tag==='canvas')return fakeCanvas();
  if(tag==='img')return {complete:true,naturalWidth:1,naturalHeight:1,
   addEventListener(){},removeEventListener(){},set src(value){this._src=value},
   get src(){return this._src}};
  throw Error(`unexpected element ${tag}`);
 }},setTimeout(){throw Error('timer denied')}};
runInNewContext(runtime,sandbox,{timeout:10000});
const asset=sandbox.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p025'];

test('physical export and generated artifacts reproduce byte-for-byte',()=>{
 const raw=execFileSync('node',['scripts/prepare-alg-l06-p025-canvas-v1.mjs','--check'],
  {cwd:ROOT,env:{...process.env,
   HELP_MATH_G678_SOURCE_ROOT:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'},
   encoding:'utf8'});
 assert.equal(JSON.parse(raw).status,'verified');
 for(const output of manifest.outputs)assert.equal(sha(fs.readFileSync(path.join(ROOT,output.path))),
  output.sha256);
 assert.equal(manifest.source.sha256,
  'dcb6b709d71eada47053b50bcfcc1161dec5d1717ebca6cbf8463eb6863dbde6');
});

test('root frame 6 and one 299-frame sprite are the only drawing contract',()=>{
 assert(asset);
 assert.equal(asset.metadata.deterministicContentTimeline.timelineId,'sprite-21');
 assert.equal(asset.metadata.deterministicContentTimeline.frameCount,299);
 assert.equal(asset.metadata.deterministicContentTimeline.playbackMode,'once');
 for(const frame of [1,2,28,41,50,52,294,295,299]){
  const state=asset.resolveFrameState(request(frame));
  assert.deepEqual([state.localFrame,state.exportFrame,state.rootFrame,
   state.visualOnly,state.interactiveStateResolved,state.audioRendered],
   [frame,frame-1,6,true,false,false]);
 }
 for(const invalid of [request(0),request(300),request(1.5),
  {...request(50),lang:'es'}, {...request(50),seed:1},
  {...request(50),scenario:'source-quiz-executed'}])
  assert.throws(()=>asset.resolveFrameState(invalid));
});

test('source masks and all eight glyph definitions stay on the Canvas plane',()=>{
 assert.deepEqual(manifest.sourceClipMasks.map(x=>[x.frame,x.characterId,x.depth,x.clipDepth]),
  [[2,2,1,10],[52,2,11,16]]);
 assert.deepEqual(manifest.sourceGlyphRendering.sourceCharacterIds,
  [5,10,11,12,13,15,18,20]);
 assert.equal(manifest.sourceGlyphRendering.suppression,'none');
 assert.equal(metadata.sourceGlyphRendering.preserved,true);
 assert.equal(runtime.includes('ctx.fillStyle="rgba(0,0,0,1)";'),true);
 assert.equal(runtime.includes('M -3269 -331 L 3270 -331 3270 330 -3269 330'),true);
 assert.deepEqual(manifest.sourceGlossaryButtons.map(x=>[x.characterId,x.staticReadyFrame]),
  [[7,28],[8,50],[9,41],[16,295]]);
 assert(manifest.sourceGlossaryButtons.every(x=>x.actualClickObserved===false));
});

test('independent frame seeks and replay use fresh drawings without audio or timers',()=>{
 const host=fakeCanvas(true);
 const sequence=[1,50,295,299,1];
 const observed=sequence.map(frame=>asset.render(host,request(frame)).localFrame);
 assert.deepEqual(observed,sequence);
 assert(calls.offscreen>=sequence.length);
 assert.equal(calls.hostCopies,sequence.length);
 assert.equal(host.attributes['data-flash-frame'],'1');
 assert.equal(host.attributes['data-flash-frame-domain'],'sprite-21');
 assert.equal(host.attributes['data-flash-root-frame'],'6');
 assert.equal(manifest.acceptanceEffects.currentJsRegistered,false);
 assert.equal(manifest.acceptanceEffects.originalRuntime,false);
 assert.equal(manifest.acceptanceEffects.listening,false);
});
