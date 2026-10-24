import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CASES,parseArgs,plan,run}
 from './probe-nms-l02-p053-pending-media-v1.mjs';
import {plan as productPlan} from './probe-nms-l02-p053-product-my-lesson-v1.mjs';

test('only unique browser output slugs can start a real run',()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','fresh-v1']),{mode:'run',slug:'fresh-v1'});
 for(const args of [[],['--run'],['--run','../overwrite'],['--run','A'],
  ['--run','already','extra'],['--prepare'],['--run','']])
  assert.throws(()=>parseArgs(args),/Usage/u);
});

test('plan inherits the exact P053 candidate closure and separates all eight cancellation cases',async()=>{
 const product=productPlan(),pending=plan();
 assert.deepEqual(await run(['--plan']),pending);
 assert.equal(pending.origin,product.origin);
 assert.equal(pending.animationId,product.animationId);
 assert.equal(pending.registeredCount,product.registeredCount);
 assert.equal(pending.renderableCount,product.renderableCount);
 assert.deepEqual(pending.externalInputs,product.externalInputs);
 assert(product.inputPaths.every(file=>pending.inputPaths.includes(file)));
 assert.equal(new Set(pending.inputPaths).size,pending.inputPaths.length);
 assert(pending.inputPaths.includes('scripts/probe-nms-l02-p053-pending-media-v1.mjs'));
 assert(pending.inputPaths.includes('scripts/probe-nms-l02-p053-pending-media-v1.test.mjs'));
 assert.equal(pending.sourceAudio.bytes,256230);
 assert.equal(pending.sourceAudio.sha256,
  '225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d');
 assert.equal(CASES.length,8);
 assert.deepEqual(new Set(CASES.map(item=>item.name)).size,8);
 for(const locale of ['en','es'])assert.deepEqual(
  CASES.filter(item=>item.locale===locale).map(item=>item.action),
  ['replay','stop-audio','navigate-p054','navigate-p064']);
 assert(Object.values(pending.acceptanceEffects).every(value=>value===false));
});
