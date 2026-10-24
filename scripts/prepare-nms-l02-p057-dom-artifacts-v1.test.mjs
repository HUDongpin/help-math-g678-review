import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP057DomArtifactPlan,checkP057DomArtifacts} from './prepare-nms-l02-p057-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const withSource=action=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return action();}
 finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
};

test('P057 DOM run and member bind exact source, qualified audio/glossary, and no registry effect',()=>{
 withSource(()=>{
  const registry=path.join(root,'packages/demos/private-current-js-registry.json');
  const before=sha(fs.readFileSync(registry));
  const plan=buildP057DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(sha(fs.readFileSync(registry)),before);
  assert.deepEqual(Object.keys(artifacts).sort(),
   ['kind','module','timeline','memberManifest','sourceRun'].sort());
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p057.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p057.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p057-conditional-host-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p057-conditional-host-current-js-v1/members/shared-nms002-l02-p057/member-manifest.json');
  assert.equal(run.source.sha256,'9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa');
  assert.equal(run.sourceXml.sha256,'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61');
  assert.equal(run.sourceStructure.frameDomain,'sprite-66');
  assert.equal(run.sourceStructure.frameCount,328);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.deepEqual(run.sourceStructure.rootSpritePlacement,
   {characterId:66,depth:2,transXTwips:7430,transYTwips:5667});
  assert.equal(run.sourceStructure.sourceChildTerminalStopPresent,false);
  assert.equal(run.sourceStructure.productPlaybackMode,'once');
  assert.equal(run.sourceAudio.rawIndex.sha256,
   'fb0e0bd403255a7a98fd46c5175f48747f7c840b4c5af08c74c53bbf2d64af71');
  assert.equal(run.sourceAudio.payload.sha256,
   'c87ebf7d1117a616ebddd6b3530a7b19c50dfd885bc5e2734817657da026c2dc');
  assert.equal(run.sourceAudio.blockCount,324);
  assert.equal(run.sourceAudio.productModuleAudioRendered,false);
  assert.equal(run.sourceAudio.sourceAlignmentAccepted,false);
  assert.equal(run.sourceAudio.listeningAccepted,false);
  assert.equal(run.glossary.originalL2XmlResolved,false);
  assert.equal(run.glossary.historicalHostAssociationEstablished,false);
  assert.equal(run.glossary.originalRuntimeLookupVerified,false);
  assert.equal(run.productCalibrationPassed,false);assert.equal(run.scaleOutAuthorized,false);
  assert(Object.values(run.acceptanceEffects).every(value=>value===false));
  assert.equal(member.rendererBindingKind,'maintained-dom-module-v1');
  assert.deepEqual(member.sourceRun,artifacts.sourceRun);
  assert.deepEqual(member.module,artifacts.module);
  assert.deepEqual(member.timeline,artifacts.timeline);
  assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
  assert.equal(run.sharedDependencies.length,7);
  assert(run.sharedDependencies.every(pin=>!run.inputs.some(item=>item.path===pin.path)));
  assert(run.sharedDependencies.some(pin=>pin.path==='scripts/build-g4-l3-embedded-audio-archive.mjs'));
  assert(run.sharedDependencies.some(pin=>pin.path==='packages/demos/src/source-glossary-controls.tsx'));
  assert.equal(run.generatorChecks.length,3);
  assert(run.generatorChecks.every(check=>check.mode==='--check'&&check.exitCode===0));
  assert(run.generatorChecks.every(check=>run.inputs.some(input=>input.path===check.producer.path&&input.sha256===check.producer.sha256)));
  assert(run.generatorChecks.every(check=>run.outputs.some(output=>output.path===check.output.path&&output.sha256===check.output.sha256)));
  assert(run.inputs.length>=110,'bounded source audit and product closure');
  assert.equal(new Set(run.inputs.map(item=>item.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(item=>item.path),[...run.inputs.map(item=>item.path)].sort((a,b)=>a.localeCompare(b)));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  assert(!JSON.stringify(artifacts).includes('/migration-assets/'));
  for(const output of plan.outputs){
   const pin=output.path===artifacts.sourceRun.path?artifacts.sourceRun:artifacts.memberManifest;
   assert.equal(output.bytes.length,pin.bytes);assert.equal(sha(output.bytes),pin.sha256);
  }
  if(plan.outputs.every(item=>fs.existsSync(path.join(root,item.path))))
   assert.equal(checkP057DomArtifacts(plan).status,'P057_DOM_ARTIFACTS_CHECKED_UNREGISTERED');
  else assert.throws(()=>checkP057DomArtifacts(plan));
 });
});

test('P057 plan refuses a compatibility source root',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP057DomArtifactPlan({root}),/exact real G6-G8 source root/u);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
