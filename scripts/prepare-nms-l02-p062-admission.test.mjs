import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertP062HostPageOverlap,buildP062AdmissionPlan,verifyP062AdmissionPlan} from
 './prepare-nms-l02-p062-admission.mjs';
import * as S from '../lib/nms-l02-p062-admission-semantics.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputs=[S.P062_FREEZE_PATH,S.P062_FRAGMENT_PATH,
 `work/g678-workflow/candidates/${S.P062_ADMISSION_ID}-v1.json`];
const readOutputs=()=>outputs.map(relative=>fs.existsSync(path.join(root,relative))?
 fs.readFileSync(path.join(root,relative)):null);

test('P062 plan retains exact 181 DOM inputs, 8 external pins, predecessor registry and no writes',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P062_SOURCE_ROOT);
 const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
 const beforeRegistry=fs.readFileSync(registryPath),beforeOutputs=readOutputs();
 const plan=buildP062AdmissionPlan({root});
 assert.equal(plan.proof.files.length,192);
 assert.equal(plan.packet.integrity.files.length,190);
 assert.equal(plan.proof.external.length,8);
 assert.equal(plan.packet.selectedPages[0].globalPageOrdinal,62);
 assert.equal(plan.packet.selectedPages[0].runtime.livePlaybackEndFrame,834);
 assert.equal(plan.packet.entry.artifacts.kind,'maintained-dom-module-v1');
 assert.deepEqual(plan.packet.entry.artifacts.sourceRun,S.P062_RUN);
 assert.deepEqual(plan.packet.entry.artifacts.memberManifest,S.P062_MEMBER);
 assert.deepEqual(plan.packet.integrity.sharedDependencies,S.P062_SHARED_DEPENDENCIES);
 const oldHost=JSON.parse(fs.readFileSync(path.join(root,'catalog/nms-l02-admission-v1/host-v12.json')));
 const oldPins=new Map(oldHost.files.map(pin=>[pin.path,pin]));
 assert.deepEqual(plan.proof.files.filter(pin=>oldPins.has(pin.path)),
  [S.P062_INHERITED_HOST_OVERLAP]);
 assert.deepEqual(oldPins.get(S.P062_INHERITED_HOST_OVERLAP.path),S.P062_INHERITED_HOST_OVERLAP);
 assert.equal(assertP062HostPageOverlap(plan.proof.files,oldHost.files),true);
 const mismatched=structuredClone(oldHost.files);
 mismatched.find(pin=>pin.path===S.P062_INHERITED_HOST_OVERLAP.path).sha256='f'.repeat(64);
 assert.throws(()=>assertP062HostPageOverlap(plan.proof.files,mismatched),
  /inherited host tool retains identical bytes/u);
 const extra=[...oldHost.files,plan.proof.files.find(pin=>pin.path===S.P062_RUN_PATH)];
 assert.throws(()=>assertP062HostPageOverlap(plan.proof.files,extra),
  /only the exact inherited host tool/u);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries).length,635);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries)
  .filter(entry=>entry.key.startsWith('shared-')).length,493);
 assert(Object.values(plan.packet.acceptanceEffects).every(value=>value===false));
 assert.deepEqual(fs.readFileSync(registryPath),beforeRegistry);
 assert.deepEqual(readOutputs(),beforeOutputs);
 assert.throws(()=>verifyP062AdmissionPlan(plan,{witnessPath:'unused',
  hostPath:'catalog/nms-l02-admission-v1/host-v12.json'}),/host-v13/u);
});

test('P062 admission fails before planning with a compatibility source root',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>buildP062AdmissionPlan({root}),/exact AWS source root/u);
 }finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
});
