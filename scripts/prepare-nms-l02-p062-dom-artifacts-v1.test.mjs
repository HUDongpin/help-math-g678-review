import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP062DomArtifactPlan,checkP062DomArtifacts} from './prepare-nms-l02-p062-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const withSource=action=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return action();}
 finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
};

test('P062 dry-run binds source, 837-frame DOM product, two qualified corrections and 11 MP3 streams',()=>{
 withSource(()=>{
  const registry=path.join(root,'packages/demos/private-current-js-registry.json');
  const before=sha(fs.readFileSync(registry));
  const plan=buildP062DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(sha(fs.readFileSync(registry)),before,'no registry mutation');
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p062.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p062.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p062-conditional-host-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p062-conditional-host-current-js-v1/members/shared-nms002-l02-p062/member-manifest.json');
  assert.equal(run.method,'source-locked-public-tool-IR-and-maintained-DOM-state-machine');
  assert.equal(run.complexityLane,'behavior-heavy');
  assert.equal(run.source.sha256,'5a075362f005aab68406d5fae2378f622a64520ec19e4b03b9ac9abbbd5faa50');
  assert.equal(run.sourceStructure.rootFrameCount,10);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.equal(run.sourceStructure.frameDomain,'sprite-315');
  assert.equal(run.sourceStructure.frameCount,837);
  assert.deepEqual(run.sourceStructure.authoredStopFrames,[384,523,650,766,815,834]);
  assert.deepEqual(run.sourceStructure.productVisualFrameRange,[1,834]);
  assert.deepEqual(run.sourceStructure.sourceIntrospectionFrameRange,[1,837]);
  assert.equal(run.sourceBehavior.historicalHostAssociationEstablished,false);
  assert.equal(run.sourceAudio.domainCount,11);
  assert.equal(run.sourceAudio.payloads.length,11);
  assert.equal(run.sourceAudio.mainBlockCount,820);
  assert.equal(run.sourceAudio.mainDecodedSamples,1503936);
  assert.equal(run.sourceAudio.signedFinalSeekSamples,-2239);
  assert.equal(run.sourceAudio.emptyBlockSilenceInserted,false);
  assert.equal(run.sourceAudio.seekTrimApplied,false);
  assert.equal(run.sourceAudio.originalRuntimeAlignmentEstablished,false);
  assert.equal(run.sourceAudio.listeningAccepted,false);
  assert.equal(run.sourceAudio.separateLessonSaSpliced,false);
  assert.equal(run.glossary.sourceKeyAttributeCalls,0);
  assert.equal(run.glossary.sourceControlCount,0);
  assert.equal(run.glossary.generatedTerms,null);
  assert.equal(run.glossary.expectedRegisteredPredecessorTermCount,25);
  assert.deepEqual(run.editorialCorrections.issues,['tax-base','example-rate']);
  assert.equal(run.editorialCorrections.originalRuntimeVisualTextCorrectionAccepted,false);
  assert.equal(run.productCalibrationPassed,false);
  assert.equal(run.scaleOutAuthorized,false);
  assert(Object.values(run.acceptanceEffects).every(value=>value===false));
  assert.equal(member.rendererBindingKind,'maintained-dom-module-v1');
  assert.deepEqual(member.sourceRun,artifacts.sourceRun);
  assert.deepEqual(member.module,artifacts.module);
  assert.deepEqual(member.timeline,artifacts.timeline);
  assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
  assert.equal(run.sharedDependencies.length,4);
  assert(run.sharedDependencies.every(pin=>!run.inputs.some(item=>item.path===pin.path)));
  assert.equal(run.generatorChecks.length,3);
  assert(run.generatorChecks.every(check=>check.mode==='--check'&&check.exitCode===0));
  assert.equal(run.validationChecks.length,1);
  assert.equal(run.validationChecks[0].tests.length,5);
  assert.equal(run.validationChecks[0].exitCode,0);
  assert(run.inputs.length>=180,'144 extracted source files and maintained product inputs');
  assert.equal(new Set(run.inputs.map(pin=>pin.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(pin=>pin.path),
   [...run.inputs.map(pin=>pin.path)].sort((a,b)=>a.localeCompare(b)));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  for(const output of plan.outputs){
   const expected=output.path===artifacts.sourceRun.path?artifacts.sourceRun:artifacts.memberManifest;
   assert.equal(output.bytes.length,expected.bytes);
   assert.equal(sha(output.bytes),expected.sha256);
  }
  if(plan.outputs.every(item=>!fs.existsSync(path.join(root,item.path))))
   assert.throws(()=>checkP062DomArtifacts(plan),'no immutable manifests yet');
  else assert.equal(checkP062DomArtifacts(plan).registrationEffect,'none');
 });
});

test('P062 producer rejects a compatibility source root before planning',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP062DomArtifactPlan({root}),/exact real G6-G8 source root/u);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
