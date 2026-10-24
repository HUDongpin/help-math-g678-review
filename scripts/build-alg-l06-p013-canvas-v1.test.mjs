import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createContext,Script} from 'node:vm';
import {buildP013Canvas} from './build-alg-l06-p013-canvas-v1.mjs';

const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p013';
process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE;
const built=buildP013Canvas(),runtime=built.runtime.toString();
const manifest=JSON.parse(built.manifest);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P013 drawing retains exact root order, morphs, masks, glyphs, buttons and embedded image',()=>{
  assert.equal(manifest.source.sha256,
    '1be47750557385ef91c648fb87fdcde642d342caadc35da7a1f7a2d1fdb11d35');
  assert.deepEqual(manifest.sourceDepthOrder.map(x=>[x.depth,x.characterId]),[[1,1],[2,140]]);
  assert.deepEqual(manifest.sourceMorphCharacterIds,[10,11,12,13,14]);
  assert.deepEqual(manifest.sourceGlossaryButtons.map(x=>[x.key,x.firstFrame,x.depth]),
    [['Input',258,8],['Output',297,14]]);
  assert.deepEqual(manifest.sourceMaskNormalization.placements,[
    {frame:258,depth:5,clipDepth:10},{frame:297,depth:11,clipDepth:16}]);
  assert.equal(manifest.sourceGlyphRendering.definitions,9);
  assert.equal(manifest.sourceGlyphRendering.nativeBinding,'semantic-flow-companion');
  assert(runtime.includes('"shape1": shape1'));
  assert(runtime.includes('"button131": button131'));
  assert(runtime.includes('"button137": button137'));
  for(const id of [10,11,12,13,14])assert(runtime.includes(`"morphshape${id}": morphshape${id}`));
  for(const id of [4,5,7,129,133,135,136,138,139])assert(runtime.includes(`"text${id}": text${id}`));
  const mask=runtime.slice(runtime.indexOf('function shape127('),runtime.indexOf('\n}',runtime.indexOf('function shape127(')));
  assert(mask.includes('ctx.fillStyle="rgba(0,0,0,1)";'));
  assert(!mask.includes('ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'));
  assert(runtime.indexOf('place("shape1",canvas,ctx') < runtime.indexOf('sprite140(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame'));
  assert(runtime.includes('var EMBEDDED_IMAGES = Object.freeze([imageObj8]);'));
  const generated=readFileSync('packages/demos/src/generated/alg-l06-p013-canvas-v1.ts','utf8');
  assert(generated.includes(`"assetSha256": "${sha(built.runtime)}"`));
  assert.deepEqual(manifest.outputs.map(x=>x.sha256),[sha(built.runtime),sha(built.metadata)]);
  assert(Object.values(manifest.acceptanceEffects).every(value=>value===false));
});

test('all 372 source frames resolve with English-only drawing and held final frame',()=>{
  const image={src:'',complete:true,naturalWidth:1};
  const context=createContext({document:{createElement(name){
    assert.equal(name,'img'); return image;
  }}});
  new Script(runtime).runInContext(context);
  const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
  assert(asset&&typeof asset.ready==='function'&&typeof asset.render==='function');
  assert.equal(asset.metadata.stage.width,800);
  assert.equal(asset.metadata.stage.height,600);
  assert.equal(asset.metadata.fps,12);
  for(let frame=1;frame<=372;frame++){
    const state=asset.resolveFrameState({frame,scenario:'source-static-frame',lang:'en',seed:0});
    assert.equal(state.localFrame,frame);
    assert.equal(state.exportFrame,frame-1);
    assert.equal(state.rootFrame,6);
    assert.equal(state.frameDomain,'sprite-140');
    assert.equal(state.audioRendered,false);
  }
  for(const frame of [0,373,1.5])assert.throws(()=>asset.resolveFrameState({frame,lang:'en'}));
  assert.throws(()=>asset.resolveFrameState({frame:1,lang:'es'}));
  assert.throws(()=>asset.resolveFrameState({frame:1,scenario:'execute-as',lang:'en'}));
});
