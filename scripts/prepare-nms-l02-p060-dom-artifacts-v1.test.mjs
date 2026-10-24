import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP060DomArtifactPlan,checkP060DomArtifacts} from './prepare-nms-l02-p060-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const withSource=action=>{
 const before=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return action();}
 finally{if(before===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=before;}
};

test('P060 unregistered DOM run/member binds full source, state, 11 audio domains and 16 glossary occurrences',()=>{
 withSource(()=>{
  const registry=path.join(root,'packages/demos/private-current-js-registry.json');
  const before=sha(fs.readFileSync(registry));
  const plan=buildP060DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(sha(fs.readFileSync(registry)),before);
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p060.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p060.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p060-conditional-host-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p060-conditional-host-current-js-v1/members/shared-nms002-l02-p060/member-manifest.json');
  assert.equal(run.complexityLane,'behavior-heavy');
  assert.equal(run.source.sha256,'80410162eebca2f85b9aaccec9c91c8d74250c0cba6051595579b4df206215c1');
  assert.equal(run.sourceXml.sha256,'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61');
  assert.equal(run.sourceStructure.rootFrameCount,10);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.equal(run.sourceStructure.frameDomain,'sprite-391');
  assert.equal(run.sourceStructure.frameCount,721);
  assert.deepEqual(run.sourceStructure.authoredStopFrames,[262,400,527,646,699,718]);
  assert.deepEqual(run.sourceStructure.productVisualFrameRange,[1,718]);
  assert.equal(run.sourceBehavior.audit.sha256,
   'dc98a7606e3269c26364d3652a664e9006a712bffab5ac23cd19306871ec257c');
  assert.equal(run.sourceBehavior.identifiedHostContract.sha256,
   'dac05d6a35be8087a2162b5e94c812fd4c172f4f60d24d8d40e4b2c2be12ea32');
  assert.equal(run.sourceBehavior.hostSelection,'conditional-indexMI-random3-wrong-random4-right');
  assert.equal(run.sourceBehavior.historicalHostAssociationEstablished,false);
  assert(run.sourceBehavior.externalEvidence.some(pin=>pin.sha256===
   '275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9'));
  assert(run.sourceBehavior.externalEvidence.some(pin=>pin.sha256===
   '380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74'));
  assert(run.sourceBehavior.externalEvidence.some(pin=>pin.sha256===
   '14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b'));
  for(const relative of [
   'output/nms-l02-p060-behavior-20260927/source-behavior-v1.json',
   'output/nms-l02-p060-behavior-20260927/README.md',
   'output/nms-l02-p060-host-contract-20260927/host-contract-audit.json',
   'output/nms-l02-p060-host-contract-20260927/README.md',
  ])assert(run.inputs.some(pin=>pin.path===relative),`page closure ${relative}`);
  assert.equal(run.sourceAudio.domainCount,11);
  assert.equal(run.sourceAudio.payloads.length,11);
  assert.equal(run.sourceAudio.mainBlockCount,703);
  assert.equal(run.sourceAudio.mainDecodedSamples,1289088);
  assert.equal(run.sourceAudio.payloads.at(-1).sha256,
   '78a98c5d3158f1fd41c9fd874380fe2a4a239d786e231597886a94cd1d6b67d0');
  assert.equal(run.sourceAudio.separateLessonSaSpliced,false);
  assert.equal(run.sourceAudio.originalRuntimeAlignmentEstablished,false);
  assert.equal(run.sourceAudio.listeningAccepted,false);
  assert.equal(run.glossary.uniqueTermCount,8);
  assert.equal(run.glossary.buttonOccurrenceCount,16);
  assert.equal(run.glossary.originalL2XmlResolved,false);
  assert.equal(run.glossary.historicalHostAssociationEstablished,false);
  assert.equal(run.productCalibrationPassed,false);
  assert.equal(run.scaleOutAuthorized,false);
  assert(Object.values(run.acceptanceEffects).every(value=>value===false));
  assert.equal(member.rendererBindingKind,'maintained-dom-module-v1');
  assert.deepEqual(member.sourceRun,artifacts.sourceRun);
  assert.deepEqual(member.module,artifacts.module);
  assert.deepEqual(member.timeline,artifacts.timeline);
  assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
  assert.equal(run.sharedDependencies.length,6);
  assert(run.sharedDependencies.every(pin=>!run.inputs.some(item=>item.path===pin.path)));
  assert.equal(run.generatorChecks.length,3);
  assert(run.generatorChecks.every(check=>check.mode==='--check'&&check.exitCode===0));
  assert(run.generatorChecks.every(check=>run.inputs.some(input=>input.path===check.producer.path&&
   input.sha256===check.producer.sha256)));
  assert.equal(run.validationChecks.length,1);
  assert.equal(run.validationChecks[0].tests.length,5);
  assert.equal(run.validationChecks[0].exitCode,0);
  assert(run.inputs.length>=216,'bounded 181-file source extraction plus maintained product and behavior');
  assert.equal(new Set(run.inputs.map(pin=>pin.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(pin=>pin.path),
   [...run.inputs.map(pin=>pin.path)].sort((a,b)=>a.localeCompare(b)));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  assert(!JSON.stringify(artifacts).includes('/migration-assets/'));
  for(const output of plan.outputs){
   const expected=output.path===artifacts.sourceRun.path?artifacts.sourceRun:artifacts.memberManifest;
   assert.equal(output.bytes.length,expected.bytes);
   assert.equal(sha(output.bytes),expected.sha256);
  }
  if(plan.outputs.every(item=>fs.existsSync(path.join(root,item.path))))
   assert.equal(checkP060DomArtifacts(plan).status,'P060_DOM_ARTIFACTS_CHECKED_UNREGISTERED');
  else assert.throws(()=>checkP060DomArtifacts(plan));
 });
});

test('P060 producer rejects a compatibility source root',()=>{
 const before=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP060DomArtifactPlan({root}),/exact real G6-G8 source root/u);
 }finally{if(before===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=before;}
});
