import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createContext,Script} from 'node:vm';
import {buildP008CanvasCandidate,verifyChildReentry} from './build-alg-l06-p008-canvas-v1.mjs';

const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p008';
const built=buildP008CanvasCandidate(SOURCE),spec=JSON.parse(built.spec),manifest=JSON.parse(built.manifest);
const runtime=built.runtime.toString();
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P008 diagnostic binds exact source, root placement, both clips and child re-entry offsets',()=>{
  assert.equal(spec.animationId,`course-${ID}`);
  assert.equal(spec.finalAnimationId,ID);
  assert.deepEqual(spec.timeline.root.placementTwips,{x:7390,y:5060});
  assert.deepEqual(spec.ffdecExport.exportInternalTranslation,{x:1440.35,y:1021});
  assert.equal(spec.timeline.local.timelineId,'sprite-507');
  assert.equal(spec.timeline.local.frameCount,938);
  assert.deepEqual(manifest.childReentry.map(x=>[x.characterId,x.depth,x.firstFrame,x.lastFrameExclusive]),
    [[20,56,1,19],[20,73,449,464],[194,318,636,646],[20,73,936,939]]);
  const frames=readFileSync('migrations/shared-alg001-l06-p008/audit/canvas-v1/sprites/DefineSprite_507/frames.html','utf8');
  assert.equal(verifyChildReentry(frames,{nestedSprites:manifest.childReentry}).length,4);
  for(const shapeId of [1,428]){
    const begin=runtime.indexOf(`function shape${shapeId}(`),end=runtime.indexOf('\n}',begin);
    assert(begin>=0&&end>begin);
    assert(runtime.slice(begin,end).includes('ctx.fillStyle="rgba(0,0,0,1)";'));
  }
  assert(!runtime.includes('setInterval('));
  assert(!runtime.includes('eval('));
  assert(!runtime.includes(`course-${ID}`));
  for(const [name,bytes] of [['adapter-spec.json',built.spec],['canvas-renderer.js',built.runtime],['preview.html',built.preview]]){
    const pin=manifest.outputs.find(x=>x.name===name);
    assert(pin&&pin.bytes===bytes.length&&pin.sha256===sha(bytes));
  }
  assert(Object.values(manifest.acceptanceEffects).every(value=>value===false));
});

test('all 938 main-domain frames are callable and unsupported control/language does not become executable state',()=>{
  const context=createContext({document:{createElement(kind){assert.equal(kind,'img');return {};}}});
  new Script(runtime).runInContext(context);
  const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
  assert(asset&&typeof asset.ready==='function'&&typeof asset.render==='function');
  for(let frame=1;frame<=938;frame++){
    const state=asset.resolveFrameState({frame,scenario:'source-static-frame',lang:'en',seed:0});
    assert.equal(state.localFrame,frame);
    assert.equal(state.exportFrame,frame-1);
    assert.equal(state.rootFrame,6);
    assert.equal(state.audioRendered,false);
    assert.equal(state.interactiveStateResolved,false);
  }
  for(const frame of [0,939,1.5])assert.throws(()=>asset.resolveFrameState({frame,lang:'en'}));
  assert.throws(()=>asset.resolveFrameState({frame:1,lang:'es'}));
  assert.throws(()=>asset.resolveFrameState({frame:1,scenario:'execute-as',lang:'en'}));
});
