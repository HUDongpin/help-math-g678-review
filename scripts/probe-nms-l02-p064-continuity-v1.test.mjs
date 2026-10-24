import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {firstQuestionForSeed,parseArgs,plan} from './probe-nms-l02-p064-continuity-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P064 continuity plans two seeded locales and the exact selected-page chain',()=>{
 const candidate=plan();
 assert.equal(candidate.kind,'nms-l02-p064-formal-candidate-browser-continuity-v1');
 assert.deepEqual(candidate.cases,[
  {locale:'en',seed:0,firstQuestion:4},
  {locale:'es',seed:0,firstQuestion:4},
 ]);
 assert.equal(candidate.route.endsWith('/shared-nms002-l02-p064'),true);
 assert.deepEqual(candidate.order,['p064','p062','p061','p060','p058','p056','p055','p052','p064']);
 assert.equal(candidate.host,'catalog/nms-l02-admission-v1/host-v14.json');
 assert.equal(candidate.pageProof,'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json');
 assert.equal(new Set(candidate.inputPaths).size,candidate.inputPaths.length);
 assert(candidate.inputPaths.includes('apps/web/lib/nms-l02-p064-admission-activation.ts'));
 assert(candidate.inputPaths.includes('output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json'));
 assert(candidate.inputPaths.includes('output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json'));
 assert(candidate.inputPaths.includes('apps/web/components/nms-l02-p062-lesson-runtime-v1.tsx'));
 assert(candidate.inputPaths.includes('migrations/shared-nms002-l02-p052/audit/sprite-350-source-stream-v1.mp3'));
});

test('P064 continuity rejects arbitrary run names and has no browser requirement for plan',async()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','formal-candidate-v1']),{mode:'run',slug:'formal-candidate-v1'});
 assert.throws(()=>parseArgs(['--run','../escape']),/Usage/u);
 assert.throws(()=>parseArgs(['--run']),/Usage/u);
 const candidate=plan();
 for(const source of [candidate.source,candidate.sourceXml]){
  const bytes=await readFile(source.path);
  assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
   {bytes:source.bytes,sha256:source.sha256});
 }
 const contract=await readFile(path.join(ROOT,'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json'));
 assert.equal(sha(contract),'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5');
 assert.equal(firstQuestionForSeed(0,JSON.parse(contract).quiz.bankSize),4);
 assert.equal(firstQuestionForSeed(9713,JSON.parse(contract).quiz.bankSize),10);
 const future=new Set(['work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
  'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json']);
 for(const input of candidate.inputPaths.filter(relative=>!future.has(relative)))
  await readFile(path.isAbsolute(input)?input:path.join(ROOT,input));
});
