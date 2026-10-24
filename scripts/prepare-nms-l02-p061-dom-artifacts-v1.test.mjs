import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP061DomArtifactPlan,checkP061DomArtifacts} from './prepare-nms-l02-p061-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const withSource=action=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return action();}
 finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
};

test('P061 dry-run binds complete source, DOM product, 11 streams and seven glossary placements',()=>{
 withSource(()=>{
  const registry=path.join(root,'packages/demos/private-current-js-registry.json');
  const before=sha(fs.readFileSync(registry));
  const plan=buildP061DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(sha(fs.readFileSync(registry)),before,'no registry write');
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p061.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p061.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p061-conditional-host-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p061-conditional-host-current-js-v1/members/shared-nms002-l02-p061/member-manifest.json');
  assert.equal(run.method,'source-locked-public-tool-IR-and-maintained-DOM-state-machine');
  assert.equal(run.complexityLane,'behavior-heavy');
  assert.equal(run.source.sha256,'4712cc077841cc0d16ea63c0c10827b933a0904a80eef010ec8f04eed5ffa50a');
  assert.equal(run.sourceStructure.rootFrameCount,10);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.equal(run.sourceStructure.frameDomain,'sprite-315');
  assert.equal(run.sourceStructure.frameCount,882);
  assert.deepEqual(run.sourceStructure.authoredStopFrames,[435,573,700,817,860,879]);
  assert.deepEqual(run.sourceStructure.productVisualFrameRange,[1,879]);
  assert.deepEqual(run.sourceStructure.sourceIntrospectionFrameRange,[1,882]);
  assert.equal(run.sourceBehavior.historicalHostAssociationEstablished,false);
  assert.equal(run.sourceBehavior.externalEvidence.length,9);
  assert.equal(run.sourceAudio.domainCount,11);
  assert.equal(run.sourceAudio.payloads.length,11);
  assert.equal(run.sourceAudio.mainBlockCount,867);
  assert.equal(run.sourceAudio.mainDecodedSamples,1590336);
  assert.equal(run.sourceAudio.signedFinalSeekSamples,-2178);
  assert.equal(run.sourceAudio.fullDecodedBufferCandidate,true);
  assert.equal(run.sourceAudio.emptyBlockSilenceInserted,false);
  assert.equal(run.sourceAudio.seekTrimApplied,false);
  assert.equal(run.sourceAudio.originalRuntimeAlignmentEstablished,false);
  assert.equal(run.sourceAudio.listeningAccepted,false);
  assert.equal(run.sourceAudio.separateLessonSaSpliced,false);
  assert.equal(run.glossary.uniqueTermCount,6);
  assert.equal(run.glossary.buttonOccurrenceCount,7);
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
  assert.equal(run.generatorChecks.length,4);
  assert(run.generatorChecks.every(check=>check.mode==='--check'&&check.exitCode===0));
  assert.equal(run.validationChecks.length,1);
  assert.equal(run.validationChecks[0].tests.length,5);
  assert.equal(run.validationChecks[0].exitCode,0);
  assert(run.inputs.length>=170,'141-file extraction plus source and maintained product');
  assert.equal(new Set(run.inputs.map(pin=>pin.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(pin=>pin.path),
   [...run.inputs.map(pin=>pin.path)].sort((a,b)=>a.localeCompare(b)));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  for(const output of plan.outputs){
   const expected=output.path===artifacts.sourceRun.path?artifacts.sourceRun:artifacts.memberManifest;
   assert.equal(output.bytes.length,expected.bytes);
   assert.equal(sha(output.bytes),expected.sha256);
  }
  assert(plan.outputs.every(item=>!fs.existsSync(path.join(root,item.path))),
   'candidate browser gate: no immutable run/member written');
  assert.throws(()=>checkP061DomArtifacts(plan));
 });
});

test('P061 producer rejects a compatibility source root before planning',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP061DomArtifactPlan({root}),/exact real G6-G8 source root/u);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
