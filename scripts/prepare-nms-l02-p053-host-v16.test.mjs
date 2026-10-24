import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile} from '../lib/g678-admission-proof.mjs';
import {P053_DEFERRED_HOST_PATHS} from './prepare-nms-l02-p053-dom-artifacts-v1.mjs';
import {composeP053HostV16,HOST_V15,P053_DOM_RUN,P053_DOM_MEMBER,
 P053_INHERITED_HOST_PATH,P053_HOST_ADDITIONS}
 from './prepare-nms-l02-p053-host-v16.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,HOST_V15.path),'utf8'));
const additions=()=>P053_HOST_ADDITIONS.map(relative=>pinFile(root,relative));

test('P053 host-v16 adds only reviewed host files over 186 immutable predecessor pins',()=>{
 const host=composeP053HostV16(base,additions());
 assert.equal(P053_DEFERRED_HOST_PATHS.length,21);
 assert.equal(P053_HOST_ADDITIONS.length,26);
 assert.equal(host.files.length,212);
 for(const pin of base.files)assert.deepEqual(host.files.find(item=>item.path===pin.path),pin);
 assert.equal(host.transitions,base.transitions);
 assert.equal(host.successorTransitions,base.successorTransitions);
 assert.deepEqual(host.predecessorHost,HOST_V15);
 assert.equal(host.acceptanceEffect,'none');
 assert.deepEqual(host.files.find(pin=>pin.path===P053_INHERITED_HOST_PATH),
  base.files.find(pin=>pin.path===P053_INHERITED_HOST_PATH));
 assert.equal(host.files.filter(pin=>pin.path===P053_INHERITED_HOST_PATH).length,1);
 assert(!host.files.some(pin=>pin.path==='apps/web/lib/nms-l02-p053-admission-activation.ts'));
 assert(!host.files.some(pin=>pin.path==='apps/web/components/nms-l02-p053-lesson-runtime-v1.tsx'));
});

test('P053 composition rejects changed ancestor, duplicate inherited file and reordered additions',()=>{
 const pins=additions();
 const drift=structuredClone(base);drift.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP053HostV16(drift,pins),/exact sealed host-v15 bytes/u);
 assert.throws(()=>composeP053HostV16(base,pins.slice(1)),/only reviewed P053 host additions/u);
 assert.throws(()=>composeP053HostV16(base,[...pins.slice(1),pins[0]]),
  /only reviewed P053 host additions/u);
 assert.throws(()=>composeP053HostV16(base,[...pins,
  {path:P053_INHERITED_HOST_PATH,bytes:1,sha256:'0'.repeat(64)}]),
  /only reviewed P053 host additions/u);
});

test('P053 frozen DOM page and host own disjoint paths with seven inherited shared pins',()=>{
 const run=JSON.parse(fs.readFileSync(path.join(root,P053_DOM_RUN.path),'utf8'));
 const member=JSON.parse(fs.readFileSync(path.join(root,P053_DOM_MEMBER.path),'utf8'));
 const host=composeP053HostV16(base,additions());
 assert.equal(run.inputs.length,41);
 assert.equal(run.outputs.length,2);
 assert.equal(run.sharedDependencies.length,7);
 assert.equal(run.externalEvidence.length,135);
 assert.deepEqual(member.sourceRun,P053_DOM_RUN);
 assert.deepEqual(run.deferredHostPaths,P053_DEFERRED_HOST_PATHS);
 for(const dependency of run.sharedDependencies)
  assert.deepEqual(host.files.find(pin=>pin.path===dependency.path),dependency);
 const owned=new Set([...run.inputs,...run.outputs,P053_DOM_RUN,P053_DOM_MEMBER]
  .map(pin=>pin.path));
 assert(host.files.every(pin=>!owned.has(pin.path)),
  'no P053 page-owned DOM input/output may enter shared host');
 assert(P053_DEFERRED_HOST_PATHS.every(relative=>
  host.files.some(pin=>pin.path===relative)&&!owned.has(relative)));
});
