import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildArtifacts,renderModule,validateExistingOutputs,MODULE,RUN_ROOT,ID} from './prepare-alg-l06-p003-continuous-artifacts-v1.mjs';
const AWS='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
test('real source produces deterministic canonical module and exact three artifact bindings without writes',()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;process.env.HELP_MATH_G678_SOURCE_ROOT=AWS;
 try{const a=buildArtifacts(),b=buildArtifacts();assert.deepEqual([...a.outputs],[...b.outputs]);
  const module=a.outputs.get(MODULE).toString();assert.match(module,/maturity: 'private-current-js' as const/u);
  assert.match(module,/alg-l06-p003-continuous-audio-schedule-v2/u);assert.doesNotMatch(module,/source-audio-schedule-v1/u);
  assert.deepEqual(Object.keys(a.artifacts),['module','timeline','runtime']);
  assert.deepEqual(a.member.runtime.canvasRenderer,a.artifacts.runtime);
  assert.equal(a.artifacts.runtime.sha256,'87694adc7d08f6f95069deede781410ab912a24a44a6cfce0fc05a43118f205c');
  assert.equal(a.member.audio.main.bytes,263640);assert.equal(a.member.audio.optionalSpanish.bytes,135408);
  assert.equal(a.member.audio.optionalSpanish.trigger,'explicit-user-only');assert.equal(a.member.runtime.lessonCompletedOnTimelineEnd,false);
  assert.equal(a.outputs.has(a.artifacts.timeline.path),false,'reuse timeline without generating or modifying it');
  assert.equal(a.outputs.size,7);assert([...a.outputs.keys()].every(p=>p===MODULE||p.startsWith(`${RUN_ROOT}/`)));
  assert(Object.values(a.member.acceptanceEffects).every(v=>v===false));
  const run=JSON.parse(a.outputs.get(`${RUN_ROOT}/run-manifest.json`));
  assert.equal(run.member.path,`${RUN_ROOT}/members/${ID}/member-manifest.json`);
  assert.deepEqual(run.artifacts,a.artifacts);
 }finally{if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;}
});
test('template drift rejects rather than patching unknown source',()=>assert.throws(()=>renderModule(Buffer.from('old two-run template')),/exact reviewed candidate template/u));
test('exclusive replay permits only exact existing bytes and check rejects missing members',()=>{
 const outputs=new Map([['module',Buffer.from('expected')],['runtime',Buffer.from('exact')]]);
 assert.doesNotThrow(()=>validateExistingOutputs(outputs,p=>outputs.get(p),true));
 assert.doesNotThrow(()=>validateExistingOutputs(outputs,()=>null,false));
 assert.throws(()=>validateExistingOutputs(outputs,()=>null,true),/missing output/u);
 assert.throws(()=>validateExistingOutputs(outputs,p=>p==='runtime'?Buffer.from('drift'):outputs.get(p)),/never overwrite/u);
});
