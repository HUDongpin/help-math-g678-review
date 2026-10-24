import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile,sha256} from '../lib/g678-admission-proof.mjs';
import {assertExactP061HostV12Repair,buildP061HostV12Plan,composeP061HostV12,
 HOST_V11,HOST_V12_PATH,P061_HOST_V12_ADDITIONS,P061_HOST_V12_REPAIRS}
 from './prepare-nms-l02-p061-host-v12.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseBytes=fs.readFileSync(path.join(root,HOST_V11.path));
const base=JSON.parse(baseBytes);
const read=relative=>fs.readFileSync(path.join(root,relative));
const repairs=()=>P061_HOST_V12_REPAIRS.map(repair=>({
 original:base.files.find(pin=>pin.path===repair.path),
 snapshot:pinFile(root,repair.snapshot),current:pinFile(root,repair.path),
 reason:repair.reason,
}));
const additions=()=>P061_HOST_V12_ADDITIONS.map(relative=>({
 path:relative,bytes:1,sha256:'0'.repeat(64),
}));

test('sealed v11 inputs have byte-identical independent snapshots and only reviewed repairs',()=>{
 assert.equal(baseBytes.length,HOST_V11.bytes);
 assert.equal(sha256(baseBytes),HOST_V11.sha256);
 for(const repair of P061_HOST_V12_REPAIRS){
  const original=base.files.find(pin=>pin.path===repair.path);
  const snapshot=pinFile(root,repair.snapshot);
  assert.equal(snapshot.bytes,original.bytes);
  assert.equal(snapshot.sha256,original.sha256);
  assertExactP061HostV12Repair(repair.path,read(repair.snapshot),read(repair.path));
  assert.throws(()=>assertExactP061HostV12Repair(repair.path,read(repair.snapshot),
   Buffer.concat([read(repair.path),Buffer.from('\n')])),/only reviewed delta/u);
 }
 assert.throws(()=>assertExactP061HostV12Repair('unreviewed.ts',Buffer.from('a'),Buffer.from('b')),
  /unreviewed P061 host-v12 repair/u);
});

test('v12 retains all 122 memberships and transitions, changing only two pins and adding two',()=>{
 const original=JSON.stringify(base),successorRepairs=repairs();
 const host=composeP061HostV12(base,successorRepairs,additions());
 assert.equal(JSON.stringify(base),original,'sealed v11 unchanged');
 assert.equal(host.files.length,124);
 assert.deepEqual(host.transitions,base.transitions);
 assert.equal(host.transitions.length,5);
 assert.deepEqual(host.successorTransitions.slice(0,2),base.successorTransitions);
 assert.deepEqual(host.successorTransitions.slice(2),successorRepairs);
 assert.equal(host.successorTransitions.length,4);
 assert.deepEqual(host.predecessor,base.predecessor);
 assert.deepEqual(host.predecessorHost,HOST_V11);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V12_PATH,'catalog/nms-l02-admission-v1/host-v12.json');
 const currentByPath=new Map(host.files.map(pin=>[pin.path,pin]));
 const repaired=new Set(P061_HOST_V12_REPAIRS.map(item=>item.path));
 for(const old of base.files){
  const current=currentByPath.get(old.path);
  assert(current);
  if(repaired.has(old.path))assert.notDeepEqual(current,old);
  else assert.deepEqual(current,old);
 }
 assert(!currentByPath.has('apps/web/lib/nms-l02-p061-admission-activation.ts'));
});

test('v12 rejects missing, extra and coordinated drift in sealed predecessor or repairs',()=>{
 const good=repairs(),extra=additions();
 assert.throws(()=>composeP061HostV12(base,good,extra.slice(1)),
  /exact new composer and test membership/u);
 assert.throws(()=>composeP061HostV12(base,good,[...extra,{path:'extra.ts',bytes:1,sha256:'0'.repeat(64)}]),
  /exact new composer and test membership/u);
 const wrongSnapshot=structuredClone(good);
 wrongSnapshot[0].snapshot.sha256='f'.repeat(64);
 assert.throws(()=>composeP061HostV12(base,wrongSnapshot,extra),/preserved original bytes/u);
 const unchanged=structuredClone(good);
 unchanged[0].current=unchanged[0].original;
 assert.throws(()=>composeP061HostV12(base,unchanged,extra),/changed current host input/u);
 const wrongOrder=[...good].reverse();
 assert.throws(()=>composeP061HostV12(base,wrongOrder,extra),/two exact successor repair paths/u);
 const drift=structuredClone(base);
 drift.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP061HostV12(drift,good,extra),/exact sealed host-v11 document/u);
});

test('real plan preserves page proof, run and current host-v12 nonexistence',async()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT=
   '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
  const target=path.join(root,HOST_V12_PATH);
  const before=fs.existsSync(target)?fs.readFileSync(target):null;
  const plan=await buildP061HostV12Plan({root});
  assert.equal(plan.retainedFileCount,122);
  assert.equal(plan.retainedTransitionCount,5);
  assert.equal(plan.retainedSuccessorTransitionCount,2);
  assert.equal(plan.registeredPredecessorCount,59);
  assert.equal(plan.host.files.length,124);
  assert.equal(plan.host.successorTransitions.length,4);
  assert.equal(plan.pageProof.bytes,102913);
  assert.equal(plan.run.bytes,55412);
  assert.equal(plan.registrationEffect,'none');
  assert.equal(plan.acceptanceEffect,'none');
  assert.deepEqual(fs.existsSync(target)?fs.readFileSync(target):null,before);
 }finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});
