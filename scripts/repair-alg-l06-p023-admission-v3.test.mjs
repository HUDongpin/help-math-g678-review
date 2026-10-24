import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildPlan,INDEX_PIN,OLD_CALIBRATION,OLD_PROOF_PIN,operate}
 from './repair-alg-l06-p023-admission-v3.mjs';
import * as S from '../lib/alg-l06-p023-admission-semantics-v3.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
const PAGE='apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p023/candidate-v1/page.tsx';
const FORMAL='apps/web/lib/alg-l06-p023-formal-admission-v1.server.ts';

test('P023 v3 plan changes only own source inputs and retains all 133 predecessor calibrations',()=>{
 const registry=fs.readFileSync(path.join(ROOT,'packages/demos/private-current-js-registry.json'));
 const activation=fs.readFileSync(path.join(ROOT,'apps/web/lib/g678-admission-activation.ts'));
 const plan=buildPlan(),summary=operate('--plan');
 assert.equal(summary.status,'planned-not-written');
 assert.deepEqual(summary.index,INDEX_PIN);
 assert.deepEqual(summary.oldProof,OLD_PROOF_PIN);
 assert.equal(summary.oldCalibration,OLD_CALIBRATION);
 assert.equal(summary.registryChanged,false);
 assert.equal(summary.activationChanged,false);
 assert.equal(plan.transaction.registry.calibrations.length,134);
 assert.equal(plan.transactionBase.registry.calibrations.length,133);
 assert.equal(plan.projected.registry.calibrations.length,134);
 assert.deepEqual(plan.projected.registry.calibrations.slice(0,133),
  plan.transaction.registry.calibrations.filter(x=>x.calibrationId!==OLD_CALIBRATION));
 assert.deepEqual(plan.registration.entries,plan.oldProof.registration.entries);
 assert.deepEqual(plan.proof.external,plan.oldProof.external);
 const {calibrationId:oldId,integrity:oldIntegrity,...oldProduct}=plan.oldProof.packet;
 const {calibrationId:newId,integrity:newIntegrity,...newProduct}=plan.proof.packet;
 assert.equal(oldId,OLD_CALIBRATION);
 assert.equal(newId,S.CALIBRATION);
 assert.deepEqual({...newProduct,freezeManifest:oldProduct.freezeManifest},oldProduct);
 assert.deepEqual(newIntegrity.scope,oldIntegrity.scope);
 assert.deepEqual(newIntegrity.qualification,oldIntegrity.qualification);
 assert.equal(newIntegrity.completeTransitiveClosure,oldIntegrity.completeTransitiveClosure);
 const oldFiles=new Map(oldIntegrity.files.map(x=>[x.path,x]));
 const newFiles=new Map(newIntegrity.files.map(x=>[x.path,x]));
 const changed=[...oldFiles].filter(([name,pin])=>JSON.stringify(newFiles.get(name))!==JSON.stringify(pin));
 assert.deepEqual(changed.map(([name])=>name).sort(),[PAGE,FORMAL].sort());
 for(const pin of S.readP023CanonicalSource(ROOT).binding.files)
  assert.deepEqual(newFiles.get(pin.path),oldFiles.get(pin.path),`source packet pin: ${pin.path}`);
 assert.deepEqual(fs.readFileSync(path.join(ROOT,'packages/demos/private-current-js-registry.json')),registry);
 assert.deepEqual(fs.readFileSync(path.join(ROOT,'apps/web/lib/g678-admission-activation.ts')),activation);
});

test('P023 v3 snapshots exactly preserve v2 bytes and production JSX exclusion is explicit',()=>{
 const plan=buildPlan();
 const old=new Map(plan.oldProof.packet.integrity.files.map(x=>[x.path,x]));
 const snapshots=new Map(plan.snapshots.map(x=>[x.path,x]));
 for(const name of [PAGE,FORMAL]){
  const saved=snapshots.get(`output/alg-l06-p023-admission-repair-v3/before/${name}`);
  assert(saved);
  assert.deepEqual([saved.bytes,saved.sha256],[old.get(name).bytes,old.get(name).sha256]);
 }
 const page=fs.readFileSync(path.join(ROOT,PAGE),'utf8');
 const formal=fs.readFileSync(path.join(ROOT,FORMAL),'utf8');
 assert(page.includes("return process.env.NODE_ENV==='production'?notFound():<main"));
 assert.equal(page.match(/data-p023-candidate=/gu)?.length,1);
 assert(formal.includes("from '../../../lib/alg-l06-p023-admission-semantics-v3.mjs'"));
 const v2=fs.readFileSync(path.join(ROOT,'lib/alg-l06-p023-admission-semantics-v2.mjs'),'utf8');
 const v3=fs.readFileSync(path.join(ROOT,'lib/alg-l06-p023-admission-semantics-v3.mjs'),'utf8');
 assert.equal(v3.replaceAll('current-js-20260930-v3','current-js-20260930-v2')
  .replaceAll('proof-v3.json','proof-v2.json'),v2);
 assert.deepEqual([...plan.outputs.keys()],[S.FREEZE_PATH,
  'work/g678-workflow/candidates/shared-alg001-l06-p023-registration-v3.json',S.PROOF_PATH]);
 assert.equal(plan.proof.packet.freezeManifest.sha256,plan.registration.freezeManifestSha256);
 assert.equal(plan.proof.packet.freezeManifest.bytes,plan.registration.freezeManifestBytes);
 assert(Object.values(plan.proof.packet.acceptanceEffects).every(value=>value===false));
 assert.equal(plan.proof.packet.optionalSpanishAudio.localeAutoplay,false);
 assert.equal(plan.proof.packet.optionalSpanishAudio.mainStreamSpliced,false);
});
