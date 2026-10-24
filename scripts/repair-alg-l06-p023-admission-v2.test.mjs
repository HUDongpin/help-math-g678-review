import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildPlan,INDEX_PIN,OLD_CALIBRATION,OLD_PROOF_PIN,operate}
 from './repair-alg-l06-p023-admission-v2.mjs';
import * as S from '../lib/alg-l06-p023-admission-semantics-v2.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT;

test('P023 v2 repair is an exact, non-writing replacement of one calibration',()=>{
 const beforeRegistry=fs.readFileSync(path.join(ROOT,'packages/demos/private-current-js-registry.json'));
 const beforeActivation=fs.readFileSync(path.join(ROOT,'apps/web/lib/g678-admission-activation.ts'));
 const plan=buildPlan(),summary=operate('--plan');
 assert.deepEqual(summary.index,INDEX_PIN);
 assert.deepEqual(summary.oldProof,OLD_PROOF_PIN);
 assert.equal(summary.oldCalibration,OLD_CALIBRATION);
 assert.equal(summary.status,'planned-not-written');
 assert.equal(summary.registryChanged,false);
 assert.equal(summary.activationChanged,false);
 assert.equal(plan.transaction.registry.calibrations.length,134);
 assert.equal(plan.transactionBase.registry.calibrations.length,133);
 assert.equal(plan.projected.registry.calibrations.length,134);
 assert.deepEqual(plan.projected.registry.calibrations.filter(c=>c.calibrationId!==S.CALIBRATION),
  plan.transaction.registry.calibrations.filter(c=>c.calibrationId!==OLD_CALIBRATION));
 assert.equal(plan.registration.calibrationId,S.CALIBRATION);
 assert.deepEqual(plan.registration.entries,plan.oldProof.registration.entries);
 assert.deepEqual(plan.proof.external,plan.oldProof.external);
 const {calibrationId:oldCalibration,integrity:oldIntegrity,...oldProduct}=plan.oldProof.packet;
 const {calibrationId:newCalibration,integrity:newIntegrity,...newProduct}=plan.proof.packet;
 assert.equal(oldCalibration,OLD_CALIBRATION);
 assert.equal(newCalibration,S.CALIBRATION);
 assert.deepEqual({...newProduct,freezeManifest:oldProduct.freezeManifest},oldProduct,
  'page, audio, glossary, engineering receipt and acceptance stay byte-equivalent');
 assert.deepEqual(newIntegrity.scope,oldIntegrity.scope);
 assert.deepEqual(newIntegrity.completeTransitiveClosure,oldIntegrity.completeTransitiveClosure);
 assert.deepEqual(newIntegrity.qualification,oldIntegrity.qualification);
 assert(Object.values(plan.proof.packet.acceptanceEffects).every(value=>value===false));
 assert.equal(plan.proof.packet.optionalSpanishAudio.localeAutoplay,false);
 assert.equal(plan.proof.packet.optionalSpanishAudio.mainStreamSpliced,false);
 const paths=new Set(newIntegrity.files.map(pin=>pin.path));
 for(const relative of ['apps/web/lib/alg-l06-p023-candidate-v1.server.ts',
  'apps/web/lib/alg-l06-p023-formal-admission-v1.server.ts',
  'lib/alg-l06-p023-admission-semantics-v2.mjs',
  'scripts/repair-alg-l06-p023-admission-v2.mjs'])assert(paths.has(relative));
 for(const snapshot of plan.snapshots)assert(paths.has(snapshot.path));
 assert(paths.has(OLD_PROOF_PIN.path));
 assert(paths.has(plan.oldProof.packet.freezeManifest.path));
 assert(!paths.has(INDEX_PIN.path));
 assert.deepEqual(fs.readFileSync(path.join(ROOT,'packages/demos/private-current-js-registry.json')),
  beforeRegistry);
 assert.deepEqual(fs.readFileSync(path.join(ROOT,'apps/web/lib/g678-admission-activation.ts')),
  beforeActivation);
});

test('the exact v2 output set contains one freeze, fragment and proof',()=>{
 const plan=buildPlan();
 assert.deepEqual([...plan.outputs.keys()],[S.FREEZE_PATH,
  'work/g678-workflow/candidates/shared-alg001-l06-p023-registration-v2.json',
  S.PROOF_PATH]);
 assert.equal(plan.proof.packet.freezeManifest.sha256,plan.registration.freezeManifestSha256);
 assert.equal(plan.proof.packet.freezeManifest.bytes,plan.registration.freezeManifestBytes);
 assert.equal(plan.proof.legacyInputs.length,107);
 assert.equal(plan.proof.files.length,105);
 assert.equal(plan.proof.external.length,5);
 assert.deepEqual(plan.proof.registration,plan.registration);
});
