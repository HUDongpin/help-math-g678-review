import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan,seededQuestions} from './probe-nms-l02-p064-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const at=relative=>path.isAbsolute(relative)?relative:path.join(ROOT,relative);

test('two bounded real-host cases hit the source-risk questions without replacement',async()=>{
 const p=plan();
 assert.equal(p.animationId,'shared-nms002-l02-p064');
 assert.equal(p.stage,'unregistered-local-candidate');assert.equal(p.formal,false);
 assert.deepEqual([p.registeredPageCount,p.renderableCount,p.activePageCount],[61,62,64]);
 assert.equal(new Set(p.inputPaths).size,p.inputPaths.length);
 const contractBytes=await readFile(at(p.sourceQuizContract.path));
 assert.equal(digest(contractBytes),p.sourceQuizContract.sha256);
 const contract=JSON.parse(contractBytes);
 assert.equal(contract.quiz.correctOptions.length,35);
 const en=seededQuestions(9713,contract.quiz.correctOptions);
 const es=seededQuestions(9714,contract.quiz.correctOptions);
 assert.deepEqual(en.map(row=>row.questionId),[10,8,32,24,19,9,15,33,1,27]);
 assert.deepEqual(es.map(row=>row.questionId),[5,26,11,8,15,23,4,3,31,27]);
 assert.deepEqual([en[0].correctOption,es[0].correctOption],['B','B']);
 assert.equal(new Set(en.map(row=>row.questionId)).size,10);
 assert.equal(new Set(es.map(row=>row.questionId)).size,10);
 assert.deepEqual(p.cases.map(row=>[row.locale,row.width,row.seed,row.firstAnswer,row.expectedCorrect]),
  [['en',1440,9713,'D',9],['es',390,9714,'B',10]]);
});

test('probe binds real source and audio inventory, and requires future host files only at run time',async()=>{
 const p=plan();
 for(const expected of [p.source,p.sourceXml,p.audioSourceIndex]){
  const bytes=await readFile(at(expected.path));
  assert.equal(digest(bytes),expected.sha256);
  if(expected.bytes)assert.equal(bytes.length,expected.bytes);
 }
 const index=JSON.parse(await readFile(at(p.audioSourceIndex.path)));
 assert.equal(index.sourceMediaRows.length,350);
 for(const [questionId,folder] of [[10,'EA'],[10,'SA'],[5,'EA'],[5,'SA']]){
  const row=index.sourceMediaRows.find(item=>item.questionId===questionId&&item.folderCode===folder&&
   item.role==='question');
  assert(row);const bytes=await readFile(path.join(path.dirname(p.source.path),row.relativePath.replace(
   /^G6-G8-shared\/NMS002\/L2\/FQ\//u,'')));
  assert.deepEqual({bytes:bytes.length,sha256:digest(bytes)},{bytes:row.bytes,sha256:row.sha256});
 }
 assert(p.inputPaths.includes('apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx'));
 assert(p.inputPaths.includes('apps/web/lib/nms-l02-p064-product-candidate.server.ts'));
 assert(p.inputPaths.includes('apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts'));
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','candidate-v1']),{mode:'run',slug:'candidate-v1'});
 assert.throws(()=>parseArgs(['--run','../escape']),/Usage/u);
});
