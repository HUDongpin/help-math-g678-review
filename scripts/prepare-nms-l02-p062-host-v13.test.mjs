import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {composeP062HostV13,HOST_V12,P062_HOST_ADDITIONS} from './prepare-nms-l02-p062-host-v13.mjs';
import {pinFile} from '../lib/g678-admission-proof.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))); 
const base=JSON.parse(fs.readFileSync(new URL('../'+HOST_V12.path,import.meta.url)));
test('P062 host successor retains every P061 pin and historical transition',()=>{
 const pins=P062_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const result=composeP062HostV13(base,pins);
 assert.equal(result.files.length,139);assert.equal(base.files.length,124);
 for(const pin of base.files)assert.deepEqual(result.files.find(p=>p.path===pin.path),pin);
 assert.equal(result.transitions,base.transitions);
 assert.equal(result.successorTransitions,base.successorTransitions);
 assert.equal(result.acceptanceEffect,'none');
 assert(!result.files.some(pin=>pin.path==='apps/web/lib/nms-l02-p062-admission-activation.ts'));
});
test('P062 host rejects changed predecessor, missing or unexpected new inputs',()=>{
 const pins=P062_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const wrong=structuredClone(base);wrong.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP062HostV13(wrong,pins));
 assert.throws(()=>composeP062HostV13(base,pins.slice(1)));
 assert.throws(()=>composeP062HostV13(base,[...pins,{path:'wrong',bytes:1,sha256:'0'.repeat(64)}]));
});
