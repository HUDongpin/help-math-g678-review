import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP064DomArtifactPlan,checkP064DomArtifacts}
  from './prepare-nms-l02-p064-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function withSource(action){
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return action();}
 finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
}

test('P064 DOM plan binds the exact source quiz and finite page/host closures',()=>{
 withSource(()=>{
  const registry=path.join(root,'packages/demos/private-current-js-registry.json');
  const registryBefore=sha(fs.readFileSync(registry));
  const plan=buildP064DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(sha(fs.readFileSync(registry)),registryBefore,'no registry mutation');
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(run.animationId,'shared-nms002-l02-p064');
  assert.equal(run.source.sha256,'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c');
  assert.equal(run.sourceXml.sha256,'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61');
  assert.equal(run.sourceStructure.frameDomain,'sprite-1258');
  assert.equal(run.sourceStructure.sourceFrameCount,90);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.equal(run.sourceStructure.sourceTimelineSeekAvailable,false);
  assert.equal(run.sourceStructure.hostExitResolved,false);
  assert.equal(run.sourceQuiz.bankSize,35);
  assert.equal(run.sourceQuiz.drawCount,10);
  assert.equal(run.sourceQuiz.sourceActionScripts.length,159);
  assert.equal(new Set(run.sourceQuiz.sourceActionScripts.map(row=>row.exportPath)).size,159);
  assert.equal(run.audio.sourceCandidates,350);
  assert.equal(run.audio.acceptedCueCount,0);
  assert.equal(run.audio.localeAutoPlayback,false);
  assert.equal(run.externalEvidence.length,352);
  assert.equal(run.behavior.postReviewHostExitResolved,false);
  assert.equal(run.behavior.deterministicSelectionOriginalRngParity,false);
  assert.equal(run.sourceKeyAttributeCalls,0);
  assert.deepEqual(run.glossary,[]);
  assert.equal(run.generatorChecks.length,7);
  assert(run.generatorChecks.every(row=>row.exitCode===0&&row.mode==='--check'));
  assert.equal(run.validationChecks[0].tests.length,8);
  assert.equal(run.validationChecks[0].exitCode,0);
  assert(Object.values(run.acceptanceEffects).every(value=>value===false));
  assert.equal(run.productCalibrationPassed,false);
  assert.equal(run.scaleOutAuthorized,false);
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p064.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p064.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p064-source-quiz-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p064-source-quiz-current-js-v1/members/shared-nms002-l02-p064/member-manifest.json');
  assert.deepEqual(member.sourceRun,artifacts.sourceRun);
  assert.deepEqual(member.module,artifacts.module);
  assert.deepEqual(member.timeline,artifacts.timeline);
  assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
  assert.equal(run.sharedDependencies.length,7);
  assert(run.sharedDependencies.every(pin=>!run.inputs.some(input=>input.path===pin.path)));
  assert.equal(new Set(run.inputs.map(pin=>pin.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(pin=>pin.path),
   [...run.inputs.map(pin=>pin.path)].sort((a,b)=>a.localeCompare(b)));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  assert.equal(plan.outputs.length,4);
  for(const item of plan.outputs){
   const pin=[artifacts.module,artifacts.timeline,artifacts.sourceRun,
    artifacts.memberManifest].find(row=>row.path===item.path);
   assert(pin);assert.equal(pin.bytes,item.bytes.length);
   assert.equal(pin.sha256,sha(item.bytes));
  }
  if(plan.outputs.every(item=>!fs.existsSync(path.join(root,item.path))))
   assert.throws(()=>checkP064DomArtifacts(plan),'no immutable DOM outputs yet');
  else assert.equal(checkP064DomArtifacts(plan).registrationEffect,'none');
 });
});

test('P064 plan rejects a compatibility source path',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP064DomArtifactPlan({root}),/exact real source root/u);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
