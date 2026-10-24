import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {assertP064HostPageOverlap,buildP064AdmissionPlan,buildP064Packet,
 P064_HOST_V14,verifyP064AdmissionPlan} from './prepare-nms-l02-p064-admission.mjs';
import * as S from '../lib/nms-l02-p064-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputPaths=[S.P064_FREEZE_PATH,S.P064_FRAGMENT_PATH,S.P064_PROOF_PATH];
const outputSnapshot=()=>outputPaths.map(relative=>fs.existsSync(path.join(root,relative))?
 fs.readFileSync(path.join(root,relative)):null);

test('P064 local plan binds sealed 35x4 source quiz and leaves registry/output unchanged',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P064_SOURCE_ROOT);
 const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
 const registryBefore=fs.readFileSync(registryPath),outputsBefore=outputSnapshot();
 const plan=buildP064AdmissionPlan({root});
 assert.deepStrictEqual(plan.packet.selectedPages[0].runtime,S.P064_RUNTIME);
 assert.equal(plan.packet.selectedPages[0].globalPageOrdinal,64);
 assert.equal(plan.packet.sourceQuiz.bankSize,35);
 assert.equal(plan.packet.sourceQuiz.optionCount,4);
 assert.equal(plan.packet.sourceQuiz.scripts.totalExported,159);
 const member=JSON.parse(fs.readFileSync(path.join(root,S.P064_MEMBER_PATH)));
 assert.deepStrictEqual(plan.packet.entry.artifacts.module,member.module);
 assert.deepStrictEqual(plan.packet.entry.artifacts.timeline,member.timeline);
 assert.deepStrictEqual(plan.packet.entry.artifacts.sourceRun,member.sourceRun);
 assert.equal(plan.packet.entry.artifacts.kind,'maintained-dom-module-v1');
 assert.equal(plan.proof.external.length,2);
 assert.deepStrictEqual(plan.packet.integrity.sharedDependencies,S.P064_SHARED_DEPENDENCIES);
 assert(S.P064_REQUIRED_PAGE_PATHS.every(relative=>
  plan.packet.integrity.files.some(pin=>pin.path===relative)));
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries).length,636);
 assert(Object.values(plan.packet.acceptanceEffects).every(value=>value===false));
 assert.deepStrictEqual(fs.readFileSync(registryPath),registryBefore);
 assert.deepStrictEqual(outputSnapshot(),outputsBefore);
 assert.throws(()=>verifyP064AdmissionPlan(plan,{witnessPath:'not-the-witness',
  hostPath:P064_HOST_V14.path}),/exact executed predecessor witness/);
});

test('P064 page proof has no inherited host file overlap',()=>{
 const host=JSON.parse(fs.readFileSync(path.join(root,P064_HOST_V14.path)));
 const proofFiles=[{path:'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
  bytes:1,sha256:'a'.repeat(64)}];
 assert.equal(assertP064HostPageOverlap(proofFiles,host.files),true);
 assert.throws(()=>assertP064HostPageOverlap([...proofFiles,host.files[0]],host.files),
  /P064 page proof and shared host are disjoint/);
});

test('P064 packet cannot claim source or gate acceptance through field drift',()=>{
 const pins=[],member=JSON.parse(fs.readFileSync(path.join(root,S.P064_MEMBER_PATH)));
 const artifacts={kind:'maintained-dom-module-v1',module:member.module,
  timeline:member.timeline,memberManifest:{path:S.P064_MEMBER_PATH,bytes:1,
   sha256:'a'.repeat(64)},sourceRun:member.sourceRun};
 const packet=buildP064Packet({pins,artifacts,run:{sharedDependencies:S.P064_SHARED_DEPENDENCIES}});
 assert.deepStrictEqual(packet.acceptanceEffects,S.P064_ACCEPTANCE_EFFECTS);
 assert.equal(packet.behavior.postReviewHostExitResolved,false);
 assert.equal(packet.audio.listeningAccepted,false);
 const bad=structuredClone(packet);bad.behavior.postReviewHostExitResolved=true;
 const registration={calibrationId:S.P064_ADMISSION_CALIBRATION,deploymentScope:'local-only',
  freezeManifest:S.P064_FREEZE_PATH,freezeManifestBytes:1,
  freezeManifestSha256:'a'.repeat(64),entries:[bad.entry]};
 assert.throws(()=>S.validateP064AdmissionSemantics({...bad,
  freezeManifest:{path:S.P064_FREEZE_PATH,bytes:1,sha256:'a'.repeat(64)}},
 registration),/maintained quiz and qualified host behavior/);
});

test('P064 admission refuses a compatibility source root before source reads',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>buildP064AdmissionPlan({root}),/exact AWS source root/);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
