import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {sha256} from '../lib/g678-admission-proof.mjs';
import {sourceEvidence,canonicalSources,buildP053DomArtifactPlan,P053_DEFERRED_HOST_PATHS,
 prepareP053DomArtifacts,checkP053DomArtifacts}
 from './prepare-nms-l02-p053-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const withSource=fn=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return fn();}
 finally{if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;}
};

test('P053 physical source, 59 scripts, 68 shape exports, full MP3 and host links',()=>withSource(()=>{
 const source=sourceEvidence(root);
 assert.equal(source.source.sha256,'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf');
 assert.equal(source.xml.sha256,'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61');
 assert.equal(source.scripts.length,59);
 assert.equal(source.shapes.length,68);
 assert.equal(source.audits.shape.shapes.length,48);
 assert.equal(source.mp3.bytes,256230);
 assert.equal(source.mp3.sha256,'225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d');
 assert.equal(source.rawIndex.bytes,447231);
 assert.equal(source.audits.stream.decode.decodedSamples,1135296);
 assert.deepEqual(source.audits.stream.stream.emptyPayloadFrames,[5,302]);
 assert.equal(source.audits.stream.stream.lastBlockFrame,694);
 assert.equal(source.audits.host.p053Actions.earlyStart.matchesCurrentGsSection,false);
 assert.equal(source.audits.host.p053Actions.selectLevelStart.matchesCurrentGsSection,true);
 assert.equal(source.audits.visual.mainFrameDomain.heldFrame,693);
 assert.equal(source.audits.visual.mainFrameDomain.nextFrameAutoReachedEstablished,false);
 assert.equal(source.audits.stream.limits.originalRuntimeAccepted,false);
 assert.equal(source.audits.stream.limits.audioListeningAccepted,false);
}));

test('P053 metadata module is deterministic and keeps scene, audio and host gates separate',()=>{
 const a=canonicalSources(),b=canonicalSources();
 assert(a.module.equals(b.module));assert(a.timeline.equals(b.timeline));
 assert.match(a.module.toString(),/P053SourceScene/u);
 assert.match(a.module.toString(),/maturity:'private-current-js'/u);
 const text=a.timeline.toString();
 const body=text.split('Object.freeze(')[1]?.split(' as const);')[0];
 assert(body);const timeline=JSON.parse(body);
 assert.equal(timeline.sourceFrameCount,694);
 assert.equal(timeline.maintainedHeldFrame,693);
 assert.equal(timeline.sourceAudioLastBlockFrame,694);
 assert.equal(timeline.originalAudioSynchronizationEstablished,false);
 assert.equal(timeline.popupCloseReceiverResolved,false);
 assert.equal(timeline.hostCompletion,false);
});

test('P053 refuses a compatibility root and preflights every immutable output',()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  assert.throws(()=>sourceEvidence(root),/exact real AWS source root/u);
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-real-source';
  assert.throws(()=>sourceEvidence(root),/exact real AWS source root/u);
 }finally{if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;}
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'p053-dom-no-overwrite-'));
 try{
  fs.mkdirSync(path.join(temporary,'nested'));
  fs.writeFileSync(path.join(temporary,'nested/module.tsx'),'preserved',{flag:'wx'});
  const plan={root:temporary,outputs:[
   {path:'nested/module.tsx',bytes:Buffer.from('new module')},
   {path:'nested/timeline.ts',bytes:Buffer.from('new timeline')}],};
  assert.throws(()=>prepareP053DomArtifacts(plan),/immutable DOM artifacts already exist/u);
  assert.equal(fs.readFileSync(path.join(temporary,'nested/module.tsx'),'utf8'),'preserved');
  assert.equal(fs.existsSync(path.join(temporary,'nested/timeline.ts')),false);
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});

test('real DOM plan is deterministic, source-bound and changes no registry or acceptance gate',()=>withSource(()=>{
 const registry=path.join(root,'packages/demos/private-current-js-registry.json');
 const before=sha256(fs.readFileSync(registry));
 const plan=buildP053DomArtifactPlan({root});
 assert.equal(sha256(fs.readFileSync(registry)),before);
 const run=plan.runManifest;
 assert.equal(run.animationId,'shared-nms002-l02-p053');
 assert.equal(run.sourceStructure.frameDomain,'sprite-187');
 assert.equal(run.sourceStructure.maintainedHeldFrame,693);
 assert.equal(run.sourceActions.freshScripts.length,59);
 assert.equal(run.shapes.rawExports.length,68);
 assert.equal(run.shapes.consumed,48);
 assert.equal(run.audio.source.bytes,256230);
 assert.equal(run.audio.sourceAlignmentAccepted,false);
 assert.equal(run.behavior.browserEvidence,'separate-formal-page-proof-not-in-this-dom-run');
 assert.equal(run.browserTestExecutedInDomPlan,false);
 assert.equal(run.generatorChecks.length,5);
 assert(run.generatorChecks.every(row=>row.exitCode===0));
 assert.equal(run.validationChecks[0].exitCode,0);
 assert.equal(run.validationChecks.length,1);
 assert(run.inputs.some(pin=>pin.path==='packages/demos/src/nms-l02-p053-readable-directions-v1.tsx'));
 assert(run.validationChecks[0].tests.some(pin=>
  pin.path==='packages/demos/tests/nms-l02-p053-readable-directions-v1.test.tsx'));
 assert.equal(run.completeTransitiveClosure,false);
 assert.equal(run.productCalibrationPassed,false);
 assert(Object.values(run.acceptanceEffects).every(value=>value===false));
 assert.deepEqual(run.glossary,[]);
 assert.deepEqual(run.deferredHostPaths,P053_DEFERRED_HOST_PATHS);
 assert(P053_DEFERRED_HOST_PATHS.every(item=>
  !run.inputs.some(pin=>pin.path===item)&&
  !run.sharedDependencies.some(pin=>pin.path===item)));
 assert(P053_DEFERRED_HOST_PATHS.includes(
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p053/page.tsx'));
 assert(P053_DEFERRED_HOST_PATHS.includes(
  'apps/web/components/g678-nms-l02-p053-product-lesson-v1.generated.tsx'));
 assert(run.inputs.every(pin=>!run.sharedDependencies.some(item=>item.path===pin.path)));
 assert.deepEqual(plan.outputs.map(item=>item.path),[
  'packages/demos/src/modules/shared-nms002-l02-p053.tsx',
  'packages/demos/src/timelines/shared-nms002-l02-p053.ts',
  'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/run-manifest.json',
  'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/members/shared-nms002-l02-p053/member-manifest.json',
 ]);
 for(const output of plan.outputs){
  const pin=[plan.artifacts.module,plan.artifacts.timeline,plan.artifacts.sourceRun,
   plan.artifacts.memberManifest].find(item=>item.path===output.path);
  assert(pin);assert.equal(pin.bytes,output.bytes.length);
  assert.equal(pin.sha256,sha256(output.bytes));
 }
 if(plan.outputs.every(item=>!fs.existsSync(path.join(root,item.path))))
  assert.throws(()=>checkP053DomArtifacts(plan),'no DOM artifacts prepared yet');
 else{
  assert.equal(checkP053DomArtifacts(plan).registrationEffect,'none');
  assert.throws(()=>prepareP053DomArtifacts(plan),/immutable DOM artifacts already exist/u);
 }
}));
