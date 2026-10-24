import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {composeP058HostV8,HOST_V7,HOST_V8_PATH,P058_HOST_V8_ADDITIONS,P058_RUN}
 from './prepare-nms-l02-p058-host-v8.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,HOST_V7.path),'utf8'));
const run=JSON.parse(fs.readFileSync(path.join(root,P058_RUN.path),'utf8'));
const additions=()=>P058_HOST_V8_ADDITIONS.map(item=>({path:item,bytes:1,sha256:'0'.repeat(64)}));

test('P058 host-v8 proposal retains exact host-v7 pins and transitions',()=>{
 const before=JSON.stringify(base);
 const host=composeP058HostV8(base,additions(),run);
 assert.equal(JSON.stringify(base),before,'no mutation to sealed host-v7');
 assert.equal(host.files.length,base.files.length+14);
 assert.deepEqual(host.transitions,base.transitions);
 assert.deepEqual(host.predecessor,base.predecessor);
 assert.deepEqual(host.files.filter(pin=>base.files.some(old=>old.path===pin.path)),base.files);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V8_PATH,'catalog/nms-l02-admission-v1/host-v8.json');
 assert.equal(HOST_V7.sha256,'9e905c5720097b52c3856cd2589a628a58edac1aad84234a0bdc088f15c01d45');
});

test('all seven shared dependencies come from host-v7; page proof and activation stay out',()=>{
 const host=composeP058HostV8(base,additions(),run);
 const before=new Map(base.files.map(pin=>[pin.path,pin]));
 const after=new Map(host.files.map(pin=>[pin.path,pin]));
 assert.equal(run.inputs.length,57);
 assert.equal(run.outputs.length,13);
 assert.equal(run.sharedDependencies.length,7);
 for(const pin of run.sharedDependencies){
  assert.deepEqual(before.get(pin.path),pin);
  assert.deepEqual(after.get(pin.path),pin);
  assert(!P058_HOST_V8_ADDITIONS.includes(pin.path));
 }
 for(const pin of [...run.inputs,...run.outputs])assert(!after.has(pin.path),pin.path);
 for(const name of [
  'apps/web/components/nms-l02-p058-lesson-runtime-v1.tsx',
  'apps/web/lib/nms-l02-p058-descriptor-extension.ts',
  'apps/web/tests/nms-l02-p058-descriptor-extension.test.ts',
  'apps/web/lib/nms-l02-p058-admission-activation.ts',
  'lib/nms-l02-p058-admission-semantics.mjs',
  'packages/demos/src/modules/shared-nms002-l02-p058.tsx',
  'packages/demos/src/timelines/shared-nms002-l02-p058.ts',
  'scripts/prepare-nms-l02-p058-admission.mjs',
  'scripts/prepare-nms-l02-p058-admission.test.mjs',
  P058_RUN.path,
 ])assert(!after.has(name),name);
 assert(after.has('apps/web/lib/nms-l02-p058-admission.server.ts'));
 assert(after.has('apps/web/app/migration-assets/nms-l02-p058/[asset]/route.ts'));
});

test('proposal rejects sparse or overlapping additions, drift, and changed shared dependencies',()=>{
 const good=additions();
 assert.throws(()=>composeP058HostV8(base,good.slice(1),run),/complete P058 shared-host additions/u);
 const overlapping=good.map(pin=>({...pin}));
 overlapping[0].path=base.files[0].path;
 assert.throws(()=>composeP058HostV8(base,overlapping,run),/exact P058 shared-host addition membership/u);
 const old=structuredClone(base);
 old.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP058HostV8(old,good,run),/exact frozen host-v7 document/u);
 const unaccounted=structuredClone(run);
 unaccounted.sharedDependencies[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP058HostV8(base,good,unaccounted),/exact pre-existing shared DOM dependency/u);
 const intoPage=good.map(pin=>({...pin}));
 intoPage[0].path=run.outputs[0].path;
 assert.throws(()=>composeP058HostV8(base,intoPage,run),/exact P058 shared-host addition membership/u);
});
