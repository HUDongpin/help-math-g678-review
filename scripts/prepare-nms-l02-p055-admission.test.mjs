import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {uniquePins} from '../lib/g678-admission-proof.mjs';
import {validateP055AdmissionSemantics,P055_ADMISSION_CALIBRATION,
 P055_ADMISSION_ID,P055_RUNTIME,P055_PAGE_INPUT_PATHS,
 validateP055ProofClosure} from '../lib/nms-l02-p055-admission-semantics.mjs';
import {buildP055AdmissionPlan,prepareP055Admission} from './prepare-nms-l02-p055-admission.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';

test('P055 dry-run projects one immutable page packet and canonical runtime without writes',()=>{
 const plan=buildP055AdmissionPlan({root,sourceRoot});
 const freeze=plan.outputs.find(item=>item.path===
  `catalog/product-bridge-calibrations/${P055_ADMISSION_CALIBRATION}.json`);
 const runtime=plan.outputs.find(item=>item.path.endsWith(`/members/${P055_ADMISSION_ID}/canvas-renderer.js`));
 const candidate=plan.outputs.find(item=>item.path===`work/g678-workflow/candidates/${P055_ADMISSION_ID}-v1.json`);
 assert.ok(freeze&&runtime&&candidate);
 assert.deepEqual(runtime.bytes,readFileSync(path.join(root,P055_RUNTIME.path)));
 assert.equal(plan.packet.freezeManifest,undefined);
 assert.deepEqual(JSON.parse(freeze.bytes),plan.packet);
 assert.deepEqual(JSON.parse(candidate.bytes).packet,plan.packet);
 assert.equal(JSON.parse(candidate.bytes).kind,'nms-l02-page-proof-v1');
 assert.equal(JSON.parse(candidate.bytes).hostContract,'nms-l02-source-bound-host-v1');
 assert.deepEqual(uniquePins(plan.files),plan.files);
 assert.ok(plan.files.some(item=>item.path==='apps/web/components/nms-l02-p055-lesson-runtime.tsx'));
 assert.ok(plan.files.some(item=>item.path==='lib/nms-l02-p055-admission-semantics.mjs'));
 assert.ok(!plan.files.some(item=>item.path==='packages/demos/src/source-linear-audio.ts'));
 assert.ok(!plan.files.some(item=>item.path==='lib/nms-l02-successor-proof.mjs'));
 assert.equal(plan.external.length,11);
 assert.equal(validateP055AdmissionSemantics({...plan.packet,freezeManifest:plan.freezePin},plan.fragment),true);
 assert.equal(validateP055ProofClosure(JSON.parse(candidate.bytes)),true);
 assert.ok(plan.projected.calibrations.some(item=>item.calibrationId===P055_ADMISSION_CALIBRATION));
});

test('P055 prepare requires explicit verified host and witness before any write',()=>{
 const plan=buildP055AdmissionPlan({root,sourceRoot});
 assert.throws(()=>prepareP055Admission(plan,{}),/explicit --host and --witness required/u);
});

test('P055 page ownership excludes shared host, registry and runtime controller',()=>{
 for(const forbidden of [
  'packages/demos/src/source-linear-audio.ts',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'apps/web/lib/nms-l02-ts-pilot-assets.server.ts',
  'lib/nms-l02-successor-proof.mjs',
  'packages/demos/private-current-js-registry.json',
 ])assert.ok(!P055_PAGE_INPUT_PATHS.includes(forbidden));
 assert.equal(new Set(P055_PAGE_INPUT_PATHS).size,P055_PAGE_INPUT_PATHS.length);
});
