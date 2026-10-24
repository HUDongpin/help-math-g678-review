import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan} from './probe-nms-l02-p064-formal-review-branches-v1.mjs';
import {seededQuestions} from './probe-nms-l02-p064-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('formal review probe keeps Q21-C and Q23-C source branches in both admission stages',async()=>{
 const candidate=plan('candidate'),registered=plan('registered');
 assert.equal(candidate.formal,true);assert.equal(registered.formal,true);
 assert.deepEqual([candidate.registeredPageCount,candidate.renderableCount,candidate.unregisteredCandidateCount],
  [61,62,1]);
 assert.deepEqual([registered.registeredPageCount,registered.renderableCount,registered.unregisteredCandidateCount],
  [62,62,0]);
 assert.deepEqual(candidate.cases.map(row=>[row.locale,row.width,row.seed,row.firstQuestion,row.selected,
  row.sourceCorrect,row.reviewInstance]),
  [['en',1440,7137,21,'C','D','R21Opt3'],['es',390,1975,23,'C','B','R231Opt3']]);
 assert.equal(new Set(candidate.inputPaths).size,candidate.inputPaths.length);
 assert.equal(new Set(registered.inputPaths).size,registered.inputPaths.length);
 assert.equal(registered.inputPaths.length,candidate.inputPaths.length+1);
 assert(registered.inputPaths.includes('output/nms-l02-p064-product-20260928/registration/receipt.json'));
 for(const required of ['apps/web/lib/nms-l02-p064-admission-activation.ts',
  'apps/web/lib/nms-l02-p064-admission.server.ts',
  'catalog/nms-l02-admission-v1/host-v14.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
  'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json',
  'packages/demos/src/modules/shared-nms002-l02-p064.tsx',
  'packages/demos/src/timelines/shared-nms002-l02-p064.ts'])
  assert(candidate.inputPaths.includes(required));
 const bytes=await readFile(path.join(ROOT,candidate.sourceQuizContract.path));
 assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
  {bytes:candidate.sourceQuizContract.bytes,sha256:candidate.sourceQuizContract.sha256});
 const key=JSON.parse(bytes).quiz.correctOptions;
 assert.deepEqual(seededQuestions(7137,key).map(row=>row.questionId),[21,4,25,7,8,33,35,2,18,3]);
 assert.deepEqual(seededQuestions(1975,key).map(row=>row.questionId),[23,31,29,30,18,28,17,12,2,3]);
});

test('formal review CLI rejects unspecified stage and old branch probe remains a pinned input',async()=>{
 assert.deepEqual(parseArgs(['--plan','candidate']),{mode:'plan',stage:'candidate'});
 assert.deepEqual(parseArgs(['--plan','registered']),{mode:'plan',stage:'registered'});
 assert.deepEqual(parseArgs(['--run','registered','registered-v1']),
  {mode:'run',stage:'registered',slug:'registered-v1'});
 assert.throws(()=>parseArgs(['--run','branch-v1']),/Usage/u);
 assert.throws(()=>parseArgs(['--run','candidate','../escape']),/Usage/u);
 const old='scripts/probe-nms-l02-p064-review-branches-v1.mjs';
 assert(plan('candidate').inputPaths.includes(old));
 const preserved=JSON.parse(await readFile(path.join(ROOT,
  'output/nms-l02-p064-product-20260928/browser-review-branches/candidate-v1/evidence.json')));
 const frozen=preserved.inputsBefore.find(row=>row.path===old);
 assert(frozen);const bytes=await readFile(path.join(ROOT,old));
 assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
  {bytes:frozen.bytes,sha256:frozen.sha256});
 const future=new Set(['work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
  'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json']);
 for(const input of plan('candidate').inputPaths.filter(row=>!future.has(row)))
  await readFile(path.isAbsolute(input)?input:path.join(ROOT,input));
});
