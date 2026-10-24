import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createContext,Script} from 'node:vm';
import {buildP010Canvas} from './build-alg-l06-p010-canvas-v1.mjs';

const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p010';
process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE;
const built=buildP010Canvas(),runtime=built.runtime.toString();
const manifest=JSON.parse(built.manifest);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P010 drawing is bound to source composition, text roles and mask geometry',()=>{
  assert.equal(manifest.source.sha256,
    '96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14');
  assert.deepEqual(manifest.sourceDepthOrder.map(x=>[x.depth,x.characterId]),
    [[1,52],[51,53],[52,55],[54,56]]);
  assert.deepEqual(manifest.sourceMaskNormalization,
    {characterId:47,depth:30,clipDepth:33,rawAlpha:0.5019608});
  assert.equal(manifest.sourceGlyphRendering.totalSourceTextDefinitions,42);
  assert.equal(manifest.sourceGlyphRendering.nativeBinding,'semantic-flow-companion');
  assert(runtime.includes('"text49": text49'));
  assert(runtime.includes('"sprite55": sprite55'));
  assert(runtime.includes('"shape56": shape56'));
  assert(!runtime.includes('suppressedSourceText'));
  const mask=runtime.slice(runtime.indexOf('function shape47('),runtime.indexOf('\n}',runtime.indexOf('function shape47(')));
  assert(mask.includes('ctx.fillStyle="rgba(0,0,0,1)";'));
  assert(!mask.includes('0.5019608'));
  const generated=readFileSync('packages/demos/src/generated/alg-l06-p010-canvas-v1.ts','utf8');
  assert(generated.includes(`"assetSha256": "${sha(built.runtime)}"`));
  assert.deepEqual(manifest.outputs.map(x=>x.sha256),[sha(built.runtime),sha(built.metadata)]);
  assert(Object.values(manifest.acceptanceEffects).every(value=>value===false));
});

test('all 303 source main frames resolve with held terminal and English drawing policy',()=>{
  const context=createContext({document:{createElement(){throw Error('unexpected DOM asset');}}});
  new Script(runtime).runInContext(context);
  const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
  assert(asset&&typeof asset.ready==='function'&&typeof asset.render==='function');
  assert.equal(asset.metadata.stage.width,800);
  assert.equal(asset.metadata.stage.height,600);
  assert.equal(asset.metadata.fps,12);
  for(let frame=1;frame<=303;frame++){
    const state=asset.resolveFrameState({frame,scenario:'source-static-frame',lang:'en',seed:0});
    assert.equal(state.localFrame,frame);
    assert.equal(state.exportFrame,frame-1);
    assert.equal(state.rootFrame,6);
    assert.equal(state.frameDomain,'sprite-52');
    assert.equal(state.audioRendered,false);
  }
  for(const frame of [0,304,1.5])assert.throws(()=>asset.resolveFrameState({frame,lang:'en'}));
  assert.throws(()=>asset.resolveFrameState({frame:1,lang:'es'}));
  assert.throws(()=>asset.resolveFrameState({frame:1,scenario:'execute-as',lang:'en'}));
});
