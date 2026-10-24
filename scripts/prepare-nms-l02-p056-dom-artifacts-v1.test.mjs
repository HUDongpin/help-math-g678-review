import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP056DomArtifactPlan,checkP056DomArtifacts} from './prepare-nms-l02-p056-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P056 run and member are source-locked maintained DOM artifacts with no registration effect',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 const registry=path.join(root,'packages/demos/private-current-js-registry.json');
 const registryBefore=hash(fs.readFileSync(registry));
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
  const plan=buildP056DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(hash(fs.readFileSync(registry)),registryBefore);
  assert.deepEqual(Object.keys(artifacts).sort(),
   ['kind','module','timeline','memberManifest','sourceRun'].sort());
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p056.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p056.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p056-conditional-host-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p056-conditional-host-current-js-v1/members/shared-nms002-l02-p056/member-manifest.json');
  assert.equal(run.source.sha256,'a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be');
  assert.equal(run.sourceXml.sha256,'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61');
  assert.equal(run.sourceStructure.frameDomain,'sprite-24');
  assert.equal(run.sourceStructure.frameCount,234);
  assert.equal(run.sourceStructure.rootFrameCount,10);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.equal(run.sourceStructure.sourceChildTerminalStopPresent,false);
  assert.equal(run.sourceStructure.productPlaybackMode,'once');
  assert.equal(run.sourceStructure.productPlaybackEndFrame,234);
  assert.equal(run.productCalibrationPassed,false);
  assert.equal(member.productCalibrationPassed,false);
  assert.equal(run.scaleOutAuthorized,false);
  assert.equal(member.rendererBindingKind,'maintained-dom-module-v1');
  assert.deepEqual(member.sourceRun,artifacts.sourceRun);
  assert.deepEqual(member.module,artifacts.module);
  assert.deepEqual(member.timeline,artifacts.timeline);
  assert.equal(run.generatorChecks.length,5);
  assert(run.generatorChecks.every(c=>c.mode==='--check'&&c.exitCode===0));
  assert(run.generatorChecks.every(c=>run.inputs.some(i=>i.path===c.producer.path&&i.sha256===c.producer.sha256)));
  assert(run.generatorChecks.every(c=>run.outputs.some(i=>i.path===c.output.path&&i.sha256===c.output.sha256)));
  assert(run.inputs.some(i=>i.path==='migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3'));
  assert(run.inputs.some(i=>i.path==='output/nms-l02-p056-source-intake-20260927/glossary/p056-conditional-glossary-receipt.json'));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  assert(!JSON.stringify(artifacts).includes('/migration-assets/'));
  assert.equal(new Set(run.inputs.map(i=>i.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(i=>i.path),[...run.inputs.map(i=>i.path)].sort((a,b)=>a.localeCompare(b)));
  for(const item of plan.outputs){
   assert.equal(item.bytes.length,item.path===artifacts.sourceRun.path?artifacts.sourceRun.bytes:artifacts.memberManifest.bytes);
   assert.equal(hash(item.bytes),item.path===artifacts.sourceRun.path?artifacts.sourceRun.sha256:artifacts.memberManifest.sha256);
  }
  if(plan.outputs.every(item=>fs.existsSync(path.join(root,item.path)))){
   assert.equal(checkP056DomArtifacts(plan).status,'P056_DOM_ARTIFACTS_CHECKED_UNREGISTERED');
  }
 }finally{
  if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;
 }
});

test('P056 plan refuses a compatibility source root',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP056DomArtifactPlan({root}),/exact real source root/u);
 }finally{
  if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;
 }
});
