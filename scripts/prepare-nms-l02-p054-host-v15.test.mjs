import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile} from '../lib/g678-admission-proof.mjs';
import {composeP054HostV15,HOST_V14,P054_HOST_ADDITIONS,P054_DOM_RUN,
 P054_DOM_MEMBER} from './prepare-nms-l02-p054-host-v15.mjs';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const base=JSON.parse(fs.readFileSync(path.join(root,HOST_V14.path),'utf8'));
const additions=()=>P054_HOST_ADDITIONS.map(relative=>pinFile(root,relative));

test('P054 successor is append-only over all 164 host-v14 pins and inherited transitions',()=>{
 const host=composeP054HostV15(base,additions());
 assert.equal(host.files.length,164+P054_HOST_ADDITIONS.length);
 for(const pin of base.files)assert.deepEqual(host.files.find(item=>item.path===pin.path),pin);
 assert.equal(host.transitions,base.transitions);
 assert.equal(host.successorTransitions,base.successorTransitions);
 assert.equal(host.acceptanceEffect,'none');
 assert.deepEqual(host.predecessorHost,HOST_V14);
 assert(!host.files.some(pin=>pin.path==='apps/web/lib/nms-l02-p054-admission-activation.ts'));
 assert(!host.files.some(pin=>pin.path==='apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx'));
 assert(!host.files.some(pin=>pin.path==='apps/web/next.config.ts'));
});

test('host composition rejects changed predecessor, omitted and unrelated additions',()=>{
 const pins=additions();
 const drift=structuredClone(base);drift.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP054HostV15(drift,pins));
 assert.throws(()=>composeP054HostV15(base,pins.slice(1)));
 assert.throws(()=>composeP054HostV15(base,[...pins,
  {path:'unrelated',bytes:1,sha256:'0'.repeat(64)}]));
 assert.throws(()=>composeP054HostV15(base,[...pins.slice(0,-1),base.files[0]]));
});

test('P054 sealed DOM page inputs and seven exact shared dependencies stay separate',()=>{
 const run=JSON.parse(fs.readFileSync(path.join(root,P054_DOM_RUN.path),'utf8'));
 const member=JSON.parse(fs.readFileSync(path.join(root,P054_DOM_MEMBER.path),'utf8'));
 const host=composeP054HostV15(base,additions());
 assert.equal(run.inputs.length,53);assert.equal(run.outputs.length,2);
 assert.equal(member.animationId,'shared-nms002-l02-p054');
 assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
 assert.equal(run.sharedDependencies.length,7);
 for(const dependency of run.sharedDependencies)
  assert.deepEqual(host.files.find(pin=>pin.path===dependency.path),dependency);
 const owned=new Set([...run.inputs,...run.outputs,P054_DOM_RUN,P054_DOM_MEMBER]
  .map(pin=>pin.path));
 assert(host.files.every(pin=>!owned.has(pin.path)),
  'no P054 page-owned DOM input/output may enter shared host');
});
