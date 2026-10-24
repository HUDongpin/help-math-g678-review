import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createContext,Script} from 'node:vm';
import {buildP014Canvas} from './build-alg-l06-p014-canvas-v1.mjs';

process.env.HELP_MATH_G678_SOURCE_ROOT=
  '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p014';
const built=buildP014Canvas();
const runtime=built.runtime.toString();
const manifest=JSON.parse(built.manifest);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('source drawing preserves root depth, 62 morphs, 3 masks, all glyphs and 5 embedded images',()=>{
  assert.equal(manifest.source.sha256,
    'aed0f7755d4f691cefcc28c815acc6b9d083fdfaae88ff385f22d3b32ba07603');
  assert.deepEqual(manifest.sourceDepthOrder.map(item=>[item.depth,item.characterId]),
    [[1,2],[3,227]]);
  assert.equal(manifest.sourceMorphCharacterIds.length,62);
  assert.deepEqual(manifest.sourceMaskNormalization.map(item=>
    [item.domain,item.frame,item.characterId,item.depth,item.clipDepth]),
  [['sprite-83',2,58,1,7],['sprite-227',97,192,53,55],['sprite-227',108,207,54,59]]);
  assert.deepEqual(manifest.sourceGlyphRendering,
    {definitions:47,dynamicFields:3,preserved:true,nativeBinding:'semantic-flow-companion',
      canvasAriaHiddenByHost:true});
  for(const name of ['imageObj76','imageObj149','imageObj151','imageObj153','imageObj193'])
    assert(runtime.includes(`var ${name} = document.createElement("img")`));
  for(const name of ['shape1','sprite2','morphshape192','shape207','sprite83'])
    assert(runtime.includes(`"${name}": ${name}`));
  assert(runtime.includes('ctx.fillStyle="rgba(0,0,0,1)";'));
  assert(runtime.includes('place("sprite2",canvas,ctx'));
  assert(runtime.indexOf('place("sprite2",canvas,ctx') <
    runtime.indexOf('sprite227(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame'));
  assert.equal(manifest.sourceAudioTrailer.bytes,386);
  assert.equal(manifest.sourceAudioTrailer.includedInTaggedAudio,false);
  assert.equal(manifest.sourceAudioTrailer.sha256,
    'd14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0');
  assert(manifest.inputs.some(item=>item.key==='scripts'&&
    item.sha256==='ca982898eaa94a1744a63c6aa1df1c2adb909446d8f50dc3e884d7e1cf37a8a5'));
  assert(runtime.includes('var drawingCanvas = document.createElement("canvas")'));
  assert(runtime.includes('targetCtx.drawImage(drawingCanvas, 0, 0)'));
  assert(Object.values(manifest.acceptanceEffects).every(value=>value===false));
  assert.deepEqual(manifest.outputs.map(item=>item.sha256),[sha(built.runtime),sha(built.metadata)]);
  const generated=readFileSync('packages/demos/src/generated/alg-l06-p014-canvas-v1.ts','utf8');
  assert(generated.includes(`"assetSha256": "${sha(built.runtime)}"`));
});

test('main frames and seven explicit child domains resolve without ActionScript execution',()=>{
  const image={src:'',complete:true,naturalWidth:1};
  const context=createContext({document:{createElement(name){
    assert.equal(name,'img');return image;
  }}});
  new Script(runtime).runInContext(context);
  const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
  assert(asset&&typeof asset.ready==='function'&&typeof asset.render==='function');
  assert.deepEqual([asset.metadata.stage.width,asset.metadata.stage.height,
    asset.metadata.fps],[800,600,12]);
  for(let frame=1;frame<=449;frame++){
    const state=asset.resolveFrameState({frame,scenario:'source-static-frame',lang:'en',seed:0});
    assert.equal(state.localFrame,frame);
    assert.equal(state.exportFrame,frame-1);
    assert.equal(state.rootFrame,6);
    assert.equal(state.frameDomain,'sprite-227');
    assert.equal(state.feedbackDomain,null);
    assert.equal(state.audioRendered,false);
  }
  const branches=manifest.feedbackDomains;
  assert.deepEqual(Object.keys(branches),
    ['sprite-115','sprite-156','sprite-83','sprite-148','sprite-173','sprite-187','sprite-28']);
  assert.deepEqual(branches['sprite-173'].sourceStopFrames,[1,22,31]);
  assert.deepEqual(branches['sprite-187'].sourceStopFrames,[1,23,29]);
  assert.deepEqual(branches['sprite-28'].sourceStopFrames,[1,20,28]);
  assert.deepEqual(branches['sprite-173'].acknowledgment,{buttonId:167,resumeFrame:23});
  assert.deepEqual(branches['sprite-187'].acknowledgment,{buttonId:182,resumeFrame:24});
  assert.deepEqual(branches['sprite-28'].acknowledgment,{buttonId:21,resumeFrame:21});
  for(const [domain,info] of Object.entries(branches)){
    for(const frame of [1,2,info.frameCount]){
      const state=asset.resolveFrameState({frame:120,feedback:{domain,frame},lang:'en',seed:0});
      assert.deepEqual([state.localFrame,state.feedbackDomain,state.feedbackFrame],
        [120,domain,frame]);
      assert.equal(state.interactiveStateResolved,false);
    }
    assert.throws(()=>asset.resolveFrameState({frame:120,feedback:{domain,frame:info.frameCount+1}}));
  }
  for(const frame of [0,450,1.5])assert.throws(()=>asset.resolveFrameState({frame}));
  assert.throws(()=>asset.resolveFrameState({frame:119,feedback:{domain:'sprite-115',frame:2}}));
  assert.throws(()=>asset.resolveFrameState({frame:120,feedback:{domain:'sprite-999',frame:2}}));
  assert.throws(()=>asset.resolveFrameState({frame:120,lang:'es'}));
  assert.throws(()=>asset.resolveFrameState({frame:120,scenario:'execute-as'}));
});
