import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan,seededQuestions} from './probe-nms-l02-p064-formal-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('formal main probe separates candidate and registered state without changing four source risks',async()=>{
 const candidate=plan('candidate'),registered=plan('registered');
 assert.equal(candidate.formal,true);assert.equal(registered.formal,true);
 assert.deepEqual([candidate.registeredPageCount,candidate.renderableCount,candidate.unregisteredCandidateCount],
  [61,62,1]);
 assert.deepEqual([registered.registeredPageCount,registered.renderableCount,registered.unregisteredCandidateCount],
  [62,62,0]);
 assert.deepEqual(candidate.cases.map(row=>[row.locale,row.seed,row.expectedFirstQuestion,row.firstAnswer,row.expectedCorrect]),
  [['en',9713,10,'D',9],['es',9714,5,'B',10]]);
 assert.equal(new Set(candidate.inputPaths).size,candidate.inputPaths.length);
 assert.equal(new Set(registered.inputPaths).size,registered.inputPaths.length);
 assert.equal(registered.inputPaths.length,candidate.inputPaths.length+1);
 assert(registered.inputPaths.includes('output/nms-l02-p064-product-20260928/registration/receipt.json'));
 for(const required of ['apps/web/lib/nms-l02-p064-admission-activation.ts',
  'apps/web/lib/nms-l02-p064-admission.server.ts',
  'catalog/nms-l02-admission-v1/host-v14.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
  'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json'])
  assert(candidate.inputPaths.includes(required));
 const bytes=await readFile(path.join(ROOT,candidate.sourceQuizContract.path));
 assert.equal(sha(bytes),candidate.sourceQuizContract.sha256);
 const answerKey=JSON.parse(bytes).quiz.correctOptions;
 assert.deepEqual(seededQuestions(9713,answerKey).map(row=>row.questionId),
  [10,8,32,24,19,9,15,33,1,27]);
 assert.deepEqual(seededQuestions(9714,answerKey).map(row=>row.questionId),
  [5,26,11,8,15,23,4,3,31,27]);
 assert.deepEqual(candidate.selectedSourceAudio.map(row=>[row.questionId,row.folder,row.option]),
  [[10,'EA',null],[10,'SA',null],[10,'EA','A'],[5,'EA',null],[5,'SA',null],[8,'EA',null],[26,'EA',null]]);
});

test('formal main CLI requires an explicit stage and keeps the old risk probe pinned',async()=>{
 assert.deepEqual(parseArgs(['--plan','candidate']),{mode:'plan',stage:'candidate'});
 assert.deepEqual(parseArgs(['--plan','registered']),{mode:'plan',stage:'registered'});
 assert.deepEqual(parseArgs(['--run','candidate','formal-v1']),
  {mode:'run',stage:'candidate',slug:'formal-v1'});
 assert.throws(()=>parseArgs(['--run','formal-v1']),/Usage/u);
 assert.throws(()=>parseArgs(['--run','registered','../escape']),/Usage/u);
 const old='scripts/probe-nms-l02-p064-my-lesson-v1.mjs';
 assert(plan('candidate').inputPaths.includes(old));
 const preserved=JSON.parse(await readFile(path.join(ROOT,
  'output/nms-l02-p064-product-20260928/browser/candidate-v4/evidence.json')));
 const frozen=preserved.inputsBefore.find(row=>row.path===old);
 assert(frozen);const bytes=await readFile(path.join(ROOT,old));
 assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
  {bytes:frozen.bytes,sha256:frozen.sha256});
 const future=new Set(['work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
  'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json']);
 for(const input of plan('candidate').inputPaths.filter(row=>!future.has(row)))
  await readFile(path.isAbsolute(input)?input:path.join(ROOT,input));
});
