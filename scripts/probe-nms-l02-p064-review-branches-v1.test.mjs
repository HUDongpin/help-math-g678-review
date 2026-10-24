import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan} from './probe-nms-l02-p064-review-branches-v1.mjs';
import {seededQuestions} from './probe-nms-l02-p064-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const absolute=value=>path.isAbsolute(value)?value:path.join(ROOT,value);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('review risk seeds draw Q21 and Q23 first and require two source-wrong C branches',async()=>{
 const p=plan();assert.equal(p.animationId,'shared-nms002-l02-p064');
 assert.equal(p.stage,'unregistered-local-candidate');assert.equal(p.formal,false);
 assert.deepEqual([p.registeredPageCount,p.renderableCount,p.activePageCount],[61,62,64]);
 assert.equal(new Set(p.inputPaths).size,p.inputPaths.length);
 const bytes=await readFile(absolute(p.sourceQuizContract.path));
 assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
  {bytes:p.sourceQuizContract.bytes,sha256:p.sourceQuizContract.sha256});
 const contract=JSON.parse(bytes);
 const cases=p.cases.map(config=>({...config,draws:seededQuestions(config.seed,contract.quiz.correctOptions)}));
 assert.deepEqual(cases.map(row=>[row.locale,row.width,row.seed,row.firstQuestion,row.selected,row.sourceCorrect,row.reviewInstance]),
  [['en',1440,7137,21,'C','D','R21Opt3'],['es',390,1975,23,'C','B','R231Opt3']]);
 assert.deepEqual(cases[0].draws.map(row=>row.questionId),[21,4,25,7,8,33,35,2,18,3]);
 assert.deepEqual(cases[1].draws.map(row=>row.questionId),[23,31,29,30,18,28,17,12,2,3]);
 for(const row of cases){assert.equal(row.draws.length,10);
  assert.equal(new Set(row.draws.map(draw=>draw.questionId)).size,10);
  assert.equal(row.draws[0].questionId,row.firstQuestion);
  assert.equal(row.draws[0].correctOption,row.sourceCorrect);
  assert.notEqual(row.selected,row.sourceCorrect);}
});

test('review miss data and physical host inputs are pinned without executing browser',async()=>{
 const p=plan();
 const sourceRisk=await readFile(absolute('packages/demos/src/nms-l02-p064-source-risk-candidate.ts'),'utf8');
 assert.match(sourceRisk,/questionId: 21, option: 3, clickedInstanceName: 'A21Opt3', computedReviewName: 'R21Opt3'/u);
 assert.match(sourceRisk,/questionId: 23, option: 3, clickedInstanceName: 'A231Opt3', computedReviewName: 'R231Opt3'/u);
 assert.match(sourceRisk,/\['TxtFeed1', 'TxtFeed2', 'TxtFeed3', 'TxtFeed4'\]/u);
 for(const input of p.inputPaths)await readFile(absolute(input));
 const swf=await readFile(p.source.path);
 assert.deepEqual({bytes:swf.length,sha256:sha(swf)},
  {bytes:p.source.bytes,sha256:p.source.sha256});
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','branch-v1']),{mode:'run',slug:'branch-v1'});
 assert.throws(()=>parseArgs(['--run','../escape']),/Usage/u);
});
