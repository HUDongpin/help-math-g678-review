import assert from 'node:assert/strict';
import {test} from 'node:test';
import {adapterBindings,buildSuccessorWrapper} from './prepare-nms-l02-successor-wrapper.mjs';

test('P055 successor preserves all 49 frozen adapter identities and host props',()=>{
  const {source,output,receipt,old,result}=buildSuccessorWrapper();
  const original=source.bytes.toString('utf8'),generated=output.toString('utf8');
  assert.equal(old.length,49);assert.equal(result.length,50);
  assert.deepEqual(result.slice(1),old);
  assert.equal(result[0].animationId,'shared-nms002-l02-p055');
  assert.equal(result[0].component,'P055FourStepPlan');
  assert.equal(result[0].audioEnabled,true);
  assert.equal(receipt.source.sha256,'8a51c768da62248218ab0cf70a8368fbb73210a79f30f686ec1d32e78a231d5a');
  assert.equal((generated.match(/privateRuntimeAdapters=\{adapters\}/g)??[]).length,1);
  assert.equal((generated.match(/G678NmsL02CandidatePlayer/g)??[]).length,
    (original.match(/G678MultiPageLessonPlayer/g)??[]).length);
  assert.equal((generated.match(/G678MultiPageLessonPlayer/g)??[]).length,0);
  assert.equal(receipt.candidatePlayer.sha256,'6f6fbe94984ecf01f7169b9087a22697b3659d789cbe4c12465ce51bf7f71fec');
  let recovered=generated.replace(
    /const P055FourStepPlan = process\.env\.NODE_ENV === 'production' \? \(\) => null\n  : dynamic\(\(\) => import\('@\/components\/nms-l02-p055-lesson-runtime'\)\.then\(m => m\.NmsL02P055LessonRuntime\), \{ssr: false\}\);\n/,'');
  recovered=recovered.replace(/\n Object\.freeze\(\{animationId:'shared-nms002-l02-p055',audioEnabled:true,Component:P055FourStepPlan\}\),/,'');
  recovered=recovered.replace('G678NmsL02SuccessorLesson(','G678NmsL2P052Lesson(');
  recovered=recovered.replaceAll('G678NmsL02CandidatePlayer','G678MultiPageLessonPlayer');
  recovered=recovered.replace('./g678-nms-l02-candidate-player.generated','./g678-multi-page-lesson-player-v3.generated');
  recovered=recovered.replace(
    '/** Generated successor wrapper preserves all 49 pinned P052 adapter bindings.\n * The caller supplies the independently reviewed lesson descriptor. */',
    '/** Successor wrapper preserves the frozen P051 adapter set without editing it.\n * Selection by a route still requires the independently frozen P052 descriptor. */');
  recovered=recovered.replace('data-p052-lesson-host data-p055-lesson-host','data-p052-lesson-host');
  assert.equal(recovered,original,'only the P055 binding, export name, and host marker may differ');
});

test('adapter inventory rejects duplicate or unparsed bindings',()=>{
  const {source}=buildSuccessorWrapper();
  const original=source.bytes.toString('utf8');
  assert.throws(()=>adapterBindings(original.replace("animationId:'shared-nms002-l02-p052'",
    "animationId:'shared-nms002-l02-p051'")),/duplicate adapter animation ID/);
  assert.throws(()=>adapterBindings(original.replace('audioEnabled:true,Component:P052PercentPractice',
    'audioEnabled:maybe,Component:P052PercentPractice')),/unparsed adapter/);
});
