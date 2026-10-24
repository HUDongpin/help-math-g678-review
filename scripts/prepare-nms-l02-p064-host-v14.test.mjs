import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {composeP064HostV14,HOST_V13,P064_HOST_ADDITIONS} from './prepare-nms-l02-p064-host-v14.mjs';
import {pinFile} from '../lib/g678-admission-proof.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))); 
const base=JSON.parse(fs.readFileSync(new URL('../'+HOST_V13.path,import.meta.url)));
test('P064 host successor retains every P062 pin and historical transition',()=>{
 const pins=P064_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const result=composeP064HostV14(base,pins);
 assert.equal(result.files.length,139+P064_HOST_ADDITIONS.length);assert.equal(base.files.length,139);
 for(const pin of base.files)assert.deepEqual(result.files.find(p=>p.path===pin.path),pin);
 assert.equal(result.transitions,base.transitions);
 assert.equal(result.successorTransitions,base.successorTransitions);
 assert.equal(result.acceptanceEffect,'none');
 assert(!result.files.some(pin=>pin.path==='apps/web/lib/nms-l02-p064-admission-activation.ts'));
});
test('P064 host rejects changed predecessor, missing or unexpected new inputs',()=>{
 const pins=P064_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const wrong=structuredClone(base);wrong.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP064HostV14(wrong,pins));
 assert.throws(()=>composeP064HostV14(base,pins.slice(1)));
 assert.throws(()=>composeP064HostV14(base,[...pins,{path:'wrong',bytes:1,sha256:'0'.repeat(64)}]));
});
test('P064 real DOM run resolves every shared dependency through host v14',()=>{
 const run=JSON.parse(fs.readFileSync(path.join(root,
  'work/g678-shared-page-factory/g678-nms-l02-p064-source-quiz-current-js-v1/run-manifest.json')));
 const result=composeP064HostV14(base,P064_HOST_ADDITIONS.map(relative=>pinFile(root,relative)));
 for(const dependency of run.sharedDependencies)
  assert.deepEqual(result.files.find(pin=>pin.path===dependency.path),dependency);
 const owned=new Set(run.inputs.map(pin=>pin.path));
 assert(result.files.every(pin=>!owned.has(pin.path)),'finite page and host closures remain disjoint');
});
