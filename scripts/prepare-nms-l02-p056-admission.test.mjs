import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildP056AdmissionPlan} from './prepare-nms-l02-p056-admission.mjs';
import {P056_SOURCE_ROOT} from '../lib/nms-l02-p056-admission-semantics.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('P056 preparation requires exact source root before source planning',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try {process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>buildP056AdmissionPlan({root}),/exact source root/);
 }finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
});
test('actual source dry-run checks immutable DOM artifacts and projects registry without changing disk',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P056_SOURCE_ROOT,'run with real source root; do not skip');
 const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
 const before=fs.readFileSync(registryPath);
 const outputPaths=['catalog/product-bridge-calibrations/g678-nms-l02-p056-conditional-host-current-js-v1.json',
  'catalog/product-bridge-calibrations/g678-nms-l02-p056-conditional-host-current-js-v1.fragment.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p056-v1.json'];
 const state=()=>outputPaths.map(relative=>fs.existsSync(path.join(root,relative))?fs.readFileSync(path.join(root,relative)):null);
 const outputsBefore=state();
 const plan=buildP056AdmissionPlan({root});
 assert.equal(plan.proof.files.length,52);assert.equal(plan.proof.external.length,8);
 assert.equal(plan.packet.selectedPages[0].globalPageOrdinal,56);
 assert.equal(plan.fragment.entries[0].artifacts.kind,'maintained-dom-module-v1');
 assert.deepStrictEqual(fs.readFileSync(registryPath),before);
 assert.deepStrictEqual(state(),outputsBefore,'dry-run preserves both absent and existing immutable outputs');
});
