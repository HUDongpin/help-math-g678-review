import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildP058DomArtifactPlan,checkP058DomArtifacts} from './prepare-nms-l02-p058-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const withSource=action=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return action();}
 finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
};

test('P058 run/member bind 27 source files, audio, 7 button occurrences, and unchanged registry',()=>{
 withSource(()=>{
  const registry=path.join(root,'packages/demos/private-current-js-registry.json');
  const before=sha(fs.readFileSync(registry));
  const plan=buildP058DomArtifactPlan({root});
  const {runManifest:run,memberManifest:member,artifacts}=plan;
  assert.equal(plan.registryShapeAccepted,true);
  assert.equal(sha(fs.readFileSync(registry)),before);
  assert.equal(artifacts.kind,'maintained-dom-module-v1');
  assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p058.tsx');
  assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p058.ts');
  assert.equal(artifacts.sourceRun.path,
   'work/g678-shared-page-factory/g678-nms-l02-p058-conditional-host-current-js-v1/run-manifest.json');
  assert.equal(artifacts.memberManifest.path,
   'work/g678-shared-page-factory/g678-nms-l02-p058-conditional-host-current-js-v1/members/shared-nms002-l02-p058/member-manifest.json');
  assert.equal(run.source.sha256,'fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57');
  assert.equal(run.sourceXml.sha256,'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61');
  assert.equal(run.sourceStructure.frameDomain,'sprite-37');
  assert.equal(run.sourceStructure.frameCount,274);
  assert.equal(run.sourceStructure.rootBeginFrame,6);
  assert.deepEqual(run.sourceStructure.rootSpritePlacement,
   {characterId:37,depth:2,transXTwips:7477,transYTwips:5666,scaleX:1.000045776367188,scaleY:1});
  assert.equal(run.sourceStructure.sourceChildTerminalStopPresent,false);
  assert.equal(run.sourceStructure.productPlaybackMode,'once');
  assert.equal(run.sourceAudio.rawIndex.sha256,
   '16ebe7ff8d0ba39cb976a20e12f24b698d623024e44fdcf3236a6fdca45a9690');
  assert.equal(run.sourceAudio.payload.sha256,
   '05f43faf63e470935728be5b54933ebb71760aeb819074b570091a6e4b068f38');
  assert.equal(run.sourceAudio.blockIr.sha256,
   'c75627caf40b0e97e34221677a8ac55fcfdd6ba44df3366885dd7f67957fa2d3');
  assert.equal(run.sourceAudio.blockCount,265);
  assert.equal(run.sourceAudio.firstBlockFrame,10);
  assert.equal(run.sourceAudio.lastBlockFrame,274);
  assert.equal(run.sourceAudio.decodedSamples,486144);
  assert.equal(run.sourceAudio.productModuleAudioRendered,false);
  assert.equal(run.sourceAudio.sourceAlignmentAccepted,false);
  assert.equal(run.sourceAudio.listeningAccepted,false);
  assert.equal(run.glossary.uniqueTermCount,6);
  assert.equal(run.glossary.buttonOccurrenceCount,7);
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
  assert.equal(run.generatorChecks.length,4);
  assert(run.generatorChecks.every(check=>check.mode==='--check'&&check.exitCode===0));
  assert(run.generatorChecks.every(check=>run.inputs.some(input=>input.path===check.producer.path&&input.sha256===check.producer.sha256)));
  assert(run.generatorChecks.every(check=>run.outputs.some(output=>output.path===check.output.path&&output.sha256===check.output.sha256)));
  assert.equal(run.validationChecks.length,1);
  assert.equal(run.validationChecks[0].tests.length,2);
  assert.equal(run.validationChecks[0].exitCode,0);
  assert(run.inputs.length>=55,'bounded source audit and product closure');
  assert.equal(new Set(run.inputs.map(item=>item.path)).size,run.inputs.length);
  assert.deepEqual(run.inputs.map(item=>item.path),
   [...run.inputs.map(item=>item.path)].sort((a,b)=>a.localeCompare(b)));
  assert(!JSON.stringify(artifacts).includes('canvas-renderer.js'));
  assert(!JSON.stringify(artifacts).includes('/migration-assets/'));
  for(const output of plan.outputs){
   const pin=output.path===artifacts.sourceRun.path?artifacts.sourceRun:artifacts.memberManifest;
   assert.equal(output.bytes.length,pin.bytes);assert.equal(sha(output.bytes),pin.sha256);
  }
  if(plan.outputs.every(item=>fs.existsSync(path.join(root,item.path))))
   assert.equal(checkP058DomArtifacts(plan).status,'P058_DOM_ARTIFACTS_CHECKED_UNREGISTERED');
  else assert.throws(()=>checkP058DomArtifacts(plan));
 });
});

test('P058 plan refuses a compatibility source root',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
  assert.throws(()=>buildP058DomArtifactPlan({root}),/exact real G6-G8 source root/u);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
