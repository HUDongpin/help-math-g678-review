import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildP057AdmissionPlan,verifyP057AdmissionPlan} from './prepare-nms-l02-p057-admission.mjs';
import {P057_SOURCE_ROOT} from '../lib/nms-l02-p057-admission-semantics.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('P057 producer rejects a compatibility or symlink source root',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>buildP057AdmissionPlan({root}),/exact source root/u);
 }finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
});
test('P057 dry-run checks exact frozen run and physical source without writing proof or registry',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P057_SOURCE_ROOT);
 const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
 const before=fs.readFileSync(registryPath);
 const outputPaths=['catalog/product-bridge-calibrations/g678-nms-l02-p057-conditional-host-current-js-v1.json',
  'catalog/product-bridge-calibrations/g678-nms-l02-p057-conditional-host-current-js-v1.fragment.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p057-v1.json'];
 const read=()=>outputPaths.map(relative=>fs.existsSync(path.join(root,relative))?
  fs.readFileSync(path.join(root,relative)):null);
 const beforeOutputs=read(),plan=buildP057AdmissionPlan({root});
 assert.equal(plan.proof.files.length,124);
 assert.equal(plan.proof.external.length,8);
 assert.equal(plan.packet.selectedPages[0].globalPageOrdinal,57);
 assert.equal(plan.packet.entry.artifacts.kind,'maintained-dom-module-v1');
 assert.equal(plan.packet.integrity.sharedDependencies.length,7);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries).length,631);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries)
  .filter(entry=>entry.key.startsWith('shared-')).length,489);
 assert(Object.values(plan.packet.acceptanceEffects).every(value=>value===false));
 assert.deepStrictEqual(fs.readFileSync(registryPath),before);
 assert.deepStrictEqual(read(),beforeOutputs);
 assert.throws(()=>verifyP057AdmissionPlan(plan,{witnessPath:'any',hostPath:'catalog/nms-l02-admission-v1/host-v6.json'}),
  /host-v7/u);
});
