import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as S from '../lib/nms-l02-p053-proof-semantics-v1.mjs';
import * as R from '../lib/nms-l02-p053-reviewed-seal-v1.mjs';
import {buildP053AdmissionPlan,assertP053HostPageOverlap,
 P053_HOST_V16_REVIEWED,P053_HOST_V16_PATH,verifyP053AdmissionPlan} from
 './prepare-nms-l02-p053-admission.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';

test('physical source and sealed DOM generate one in-memory page-only proof',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT;
  const plan=buildP053AdmissionPlan({root:ROOT});
  assert.equal(plan.proof.animationId,S.P053_ADMISSION_ID);
  assert.equal(plan.proof.external.length,135);
  assert.equal(plan.proof.packet.selectedPages[0].runtime.heldFrame,693);
  assert.equal(plan.proof.packet.selectedPages[0].runtime.frameCount,694);
  assert.deepEqual(plan.proof.packet.integrity.sharedDependencies,R.P053_SHARED_DEPENDENCIES);
  assert.equal(plan.projected.calibrations.some(row=>
   row.calibrationId===S.P053_ADMISSION_CALIBRATION),true);
  assert.deepEqual(plan.outputs.map(item=>item.path),
   [S.P053_FREEZE_PATH,S.P053_FRAGMENT_PATH,S.P053_PROOF_PATH]);
  assert.equal(R.validateP053ReviewedProofClosure(ROOT,plan.proof),true);
  assert.throws(()=>verifyP053AdmissionPlan(plan,{witnessPath:'wrong',hostPath:P053_HOST_V16_PATH}),
   /two-stage predecessor witness/u);
  assert.throws(()=>verifyP053AdmissionPlan(plan,{
   witnessPath:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
   hostPath:'catalog/nms-l02-admission-v1/host-v15.json'}),/P053 successor host path/u);
 }finally{
  if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;
 }
});

test('future host-v16 is an exact reviewed target and any page/host overlap fails',()=>{
 assert.equal(P053_HOST_V16_REVIEWED.path,P053_HOST_V16_PATH);
 assert.equal(P053_HOST_V16_REVIEWED.bytes,47999);
 assert.equal(assertP053HostPageOverlap([{path:'page-only',bytes:1,sha256:'a'.repeat(64)}],
  [{path:'host-only',bytes:1,sha256:'b'.repeat(64)}]),true);
 assert.throws(()=>assertP053HostPageOverlap(
  [{path:'same',bytes:1,sha256:'a'.repeat(64)}],
  [{path:'same',bytes:1,sha256:'a'.repeat(64)}]),/disjoint/u);
});
