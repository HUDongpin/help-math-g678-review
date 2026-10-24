import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile,sha256} from '../lib/g678-admission-proof.mjs';
import {assertExactP058HostRepair,composeP058HostV9,HOST_V8,HOST_V9_PATH,
 P058_REPAIRS,P058_HOST_V9_ADDITIONS} from './prepare-nms-l02-p058-host-v9.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseBytes=fs.readFileSync(path.join(root,HOST_V8.path));
const base=JSON.parse(baseBytes);
const read=relative=>fs.readFileSync(path.join(root,relative));
const repairs=()=>P058_REPAIRS.map(repair=>{
 const original=base.files.find(pin=>pin.path===repair.path);
 const snapshot=pinFile(root,repair.snapshot);
 const current=pinFile(root,repair.path);
 return {original,current,snapshot,reason:repair.reason};
});
const additions=()=>P058_HOST_V9_ADDITIONS.map(item=>({path:item,bytes:1,sha256:'0'.repeat(64)}));

test('sealed host-v8 and preserved old bytes bind the exact two current repairs',()=>{
 assert.equal(baseBytes.length,HOST_V8.bytes);
 assert.equal(sha256(baseBytes),HOST_V8.sha256);
 for(const repair of P058_REPAIRS){
  const original=base.files.find(pin=>pin.path===repair.path);
  const snapshot=pinFile(root,repair.snapshot);
  assert.equal(snapshot.bytes,original.bytes);
  assert.equal(snapshot.sha256,original.sha256);
  assertExactP058HostRepair(repair.path,read(repair.snapshot),read(repair.path));
 }
 assert.throws(()=>assertExactP058HostRepair(P058_REPAIRS[0].path,read(P058_REPAIRS[0].snapshot),
  Buffer.from(read(P058_REPAIRS[0].path).toString()+'\n')),/only reviewed delta/u);
 assert.throws(()=>assertExactP058HostRepair('unreviewed.ts',Buffer.from('x'),Buffer.from('y')),
  /unreviewed P058 host repair/u);
});

test('v9 retains every other v8 pin and five witness transitions; separates two successor transitions',()=>{
 const before=JSON.stringify(base);
 const successorTransitions=repairs();
 const host=composeP058HostV9(base,successorTransitions,additions());
 assert.equal(JSON.stringify(base),before,'sealed predecessor unchanged');
 assert.equal(host.files.length,95);
 assert.deepEqual(host.transitions,base.transitions);
 assert.equal(host.transitions.length,5);
 assert.deepEqual(host.predecessor,base.predecessor);
 assert.deepEqual(host.predecessorHost,HOST_V8);
 assert.deepEqual(host.successorTransitions,successorTransitions);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V9_PATH,'catalog/nms-l02-admission-v1/host-v9.json');
 const currentByPath=new Map(host.files.map(pin=>[pin.path,pin]));
 const repaired=new Set(P058_REPAIRS.map(item=>item.path));
 for(const old of base.files){
  const current=currentByPath.get(old.path);
  assert(current);
  if(repaired.has(old.path))assert.notDeepEqual(current,old);
  else assert.deepEqual(current,old);
 }
 assert(!currentByPath.has('apps/web/lib/nms-l02-p058-admission-activation.ts'));
});

test('v9 rejects extra edits, changed snapshots, missing additions, and drifted v8',()=>{
 const good=repairs(),extra=additions();
 assert.throws(()=>composeP058HostV9(base,good,extra.slice(1)),/exact new producer and test/u);
 const wrongSnapshot=structuredClone(good);
 wrongSnapshot[0].snapshot.sha256='0'.repeat(64);
 assert.throws(()=>composeP058HostV9(base,wrongSnapshot,extra),/preserved old bytes/u);
 const wrongMembership=structuredClone(good);
 wrongMembership[0].original.path=base.files[0].path;
 assert.throws(()=>composeP058HostV9(base,wrongMembership,extra),/exact successor repair membership/u);
 const unchanged=structuredClone(good);
 unchanged[0].current=unchanged[0].original;
 assert.throws(()=>composeP058HostV9(base,unchanged,extra),/changed current host input/u);
 const drift=structuredClone(base);
 drift.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP058HostV9(drift,good,extra),/exact sealed host-v8 document/u);
});
