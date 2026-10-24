import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {firstQuestionForSeed,parseArgs,plan,run}
 from './probe-nms-l02-p053-continuity-v1.mjs';
import {plan as formalMainPlan}
 from './probe-nms-l02-p053-formal-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P053 continuity inherits formal phase and preserves the reviewed predecessor sample',async()=>{
 const candidate=plan('candidate'),registered=plan('registered');
 assert.deepEqual(await run(['--plan']),candidate);
 assert.deepEqual(candidate.cases,[{locale:'en',seed:0,firstQuestion:4},
  {locale:'es',seed:0,firstQuestion:4}]);
 assert.deepEqual(candidate.order,['p053','p054','p064','p062','p061','p060','p058',
  'p056','p055','p052','p064','p054','p053']);
 for(const current of [candidate,registered]){
  const main=formalMainPlan(current.phase);
  assert.equal(current.route,main.route);
  assert.equal(current.expectedMarker,main.expectedMarker);
  assert.equal(current.registeredCount,main.registeredCount);
  assert.equal(current.renderableCount,64);
  assert(main.inputPaths.every(file=>current.inputPaths.includes(file)));
  assert.equal(new Set(current.inputPaths).size,current.inputPaths.length);
  assert.equal(current.host,'catalog/nms-l02-admission-v1/host-v16.json');
  assert.equal(current.pageProof,'work/g678-workflow/candidates/shared-nms002-l02-p053-v1.json');
  assert(current.inputPaths.includes('scripts/probe-nms-l02-p053-continuity-v1.mjs'));
  assert(current.inputPaths.includes('scripts/probe-nms-l02-p054-continuity-v1.mjs'));
 }
 assert.equal(candidate.registeredCount,63);
 assert.equal(candidate.unregisteredCandidateCount,1);
 assert.equal(registered.registeredCount,64);
 assert.equal(registered.unregisteredCandidateCount,0);
 assert.notEqual(candidate.outputRoot,registered.outputRoot);
 assert.throws(()=>plan('published'),/explicit formal phase/u);
});

test('run requires bounded slug and explicit candidate or registered phase',async()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','candidate-c1','candidate']),
  {mode:'run',slug:'candidate-c1',phase:'candidate'});
 assert.deepEqual(parseArgs(['--run','registered-r1','registered']),
  {mode:'run',slug:'registered-r1',phase:'registered'});
 for(const args of [[],['--run','candidate-c1'],['--run','../escape','candidate'],
  ['--run','Bad','registered'],['--run','candidate-c1','reviewed']])
  assert.throws(()=>parseArgs(args),/Usage/u);
 const planOnly=plan('candidate');
 for(const source of [planOnly.source,planOnly.sourceXml]){
  const bytes=await readFile(source.path);
  assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
   {bytes:source.bytes,sha256:source.sha256});
 }
 const contract=await readFile(path.join(ROOT,
  'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json'));
 assert.equal(sha(contract),'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5');
 assert.equal(firstQuestionForSeed(0,JSON.parse(contract).quiz.bankSize),4);
 assert.equal(firstQuestionForSeed(9713,JSON.parse(contract).quiz.bankSize),10);
});
