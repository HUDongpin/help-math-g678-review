import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertP061HostPageOverlap,buildP061AdmissionPlan,verifyP061AdmissionPlan} from './prepare-nms-l02-p061-admission.mjs';
import * as S from '../lib/nms-l02-p061-admission-semantics.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputs=[S.P061_FREEZE_PATH,S.P061_FRAGMENT_PATH,
 `work/g678-workflow/candidates/${S.P061_ADMISSION_ID}-v1.json`];
const readOutputs=()=>outputs.map(relative=>fs.existsSync(path.join(root,relative))?
 fs.readFileSync(path.join(root,relative)):null);

test('P061 admission rejects a compatibility or symlink source root',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>buildP061AdmissionPlan({root}),/exact AWS source root/u);
 }finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
});

test('P061 plan seals exact 179 DOM inputs, preserves registry and writes no outputs',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P061_SOURCE_ROOT);
 const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
 const beforeRegistry=fs.readFileSync(registryPath),beforeOutputs=readOutputs();
 const plan=buildP061AdmissionPlan({root});
 assert.equal(plan.proof.files.length,190);
 assert.equal(plan.packet.integrity.files.length,188);
 assert.equal(plan.proof.external.length,10);
 assert.equal(plan.packet.selectedPages[0].globalPageOrdinal,61);
 assert.equal(plan.packet.selectedPages[0].runtime.livePlaybackEndFrame,879);
 assert.equal(plan.packet.entry.artifacts.kind,'maintained-dom-module-v1');
 assert.deepEqual(plan.packet.entry.artifacts.sourceRun,S.P061_RUN);
 assert.deepEqual(plan.packet.entry.artifacts.memberManifest,S.P061_MEMBER);
 assert.deepEqual(plan.packet.integrity.sharedDependencies,S.P061_SHARED_DEPENDENCIES);
 const oldHost=JSON.parse(fs.readFileSync(path.join(root,'catalog/nms-l02-admission-v1/host-v10.json')));
 const oldPins=new Map(oldHost.files.map(pin=>[pin.path,pin]));
 assert.deepEqual(plan.proof.files.filter(pin=>oldPins.has(pin.path)),
  [S.P061_INHERITED_HOST_OVERLAP]);
 assert.deepEqual(oldPins.get(S.P061_INHERITED_HOST_OVERLAP.path),
  S.P061_INHERITED_HOST_OVERLAP);
 assert.equal(assertP061HostPageOverlap(plan.proof.files,oldHost.files),true);
 const mismatched=structuredClone(oldHost.files);
 mismatched.find(pin=>pin.path===S.P061_INHERITED_HOST_OVERLAP.path).sha256='f'.repeat(64);
 assert.throws(()=>assertP061HostPageOverlap(plan.proof.files,mismatched),
  /inherited host tool retains identical bytes/u);
 const extra=[...oldHost.files,plan.proof.files.find(pin=>pin.path===S.P061_RUN_PATH)];
 assert.throws(()=>assertP061HostPageOverlap(plan.proof.files,extra),
  /only the exact inherited host tool/u);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries).length,634);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries)
  .filter(entry=>entry.key.startsWith('shared-')).length,492);
 assert(Object.values(plan.packet.acceptanceEffects).every(value=>value===false));
 assert.deepEqual(fs.readFileSync(registryPath),beforeRegistry);
 assert.deepEqual(readOutputs(),beforeOutputs);
 const sparse=structuredClone(plan.proof);
 sparse.packet.integrity.files=sparse.packet.integrity.files.filter(pin=>
  pin.path!==S.P061_MAIN_AUDIO.path);
 assert.throws(()=>S.validateP061ProofClosure(sparse),/exact page-owned membership/u);
 const missingBank=structuredClone(plan.proof);
 missingBank.external=missingBank.external.filter(item=>item.pin.path!=='L1KTE01.xml');
 assert.throws(()=>S.validateP061ProofClosure(missingBank),/exact physical source\/bank\/host pins/u);
 const changedRunInput=structuredClone(plan.proof);
 changedRunInput.packet.integrity.files.find(pin=>pin.path===S.P061_MAIN_AUDIO.path).sha256='f'.repeat(64);
 assert.throws(()=>S.validateP061ProofClosure(changedRunInput),/immutable DOM run\/input\/output/u);
 assert.throws(()=>verifyP061AdmissionPlan(plan,{witnessPath:'unused',
  hostPath:'catalog/nms-l02-admission-v1/host-v10.json'}),/host-v11/u);
});
