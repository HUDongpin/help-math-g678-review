import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CASES,parseArgs,plan,run} from './probe-nms-l02-p053-formal-pending-media-v1.mjs';
import {plan as formalMainPlan} from './probe-nms-l02-p053-formal-my-lesson-v1.mjs';
import {plan as productPendingPlan} from './probe-nms-l02-p053-pending-media-v1.mjs';

test('pending-media successor requires explicit formal phase and unique output slug',()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','fresh-a1','candidate']),
  {mode:'run',slug:'fresh-a1',phase:'candidate'});
 assert.deepEqual(parseArgs(['--run','fresh-r1','registered']),
  {mode:'run',slug:'fresh-r1',phase:'registered'});
 for(const args of [[],['--run','fresh'],['--run','fresh','unknown'],
  ['--run','../prior','candidate'],['--run','fresh','registered','extra']])
  assert.throws(()=>parseArgs(args),/Usage/u);
});

test('pending formal plans retain eight source-request cases and inherit exact main closure',async()=>{
 const old=productPendingPlan(),candidate=plan('candidate'),registered=plan('registered');
 assert.deepEqual(await run(['--plan']),candidate);
 assert.equal(CASES.length,8);
 assert.deepEqual(CASES,old.cases);
 for(const item of [candidate,registered]){
  const main=formalMainPlan(item.phase);
  assert.equal(item.formal,true);
  assert.equal(item.route,main.route);
  assert.equal(item.expectedMarker,main.expectedMarker);
  assert.equal(item.registeredCount,main.registeredCount);
  assert.equal(item.renderableCount,64);
  assert.deepEqual(item.externalInputs,main.externalInputs);
  assert.deepEqual(item.sourceAudio,old.sourceAudio);
  assert(main.inputPaths.every(file=>item.inputPaths.includes(file)));
  assert.equal(new Set(item.inputPaths).size,item.inputPaths.length);
  assert(item.inputPaths.includes('scripts/probe-nms-l02-p053-formal-pending-media-v1.mjs'));
  assert(item.inputPaths.includes('scripts/probe-nms-l02-p053-formal-pending-media-v1.test.mjs'));
  assert(Object.values(item.acceptanceEffects).every(value=>value===false));
 }
 assert.equal(candidate.unregisteredCandidateCount,1);
 assert.equal(registered.unregisteredCandidateCount,0);
 assert.notEqual(candidate.outputRoot,registered.outputRoot);
 assert.throws(()=>plan('published'),/explicit formal phase/u);
});
