import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJsonPin} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {buildPlan,operate,FRAGMENT_PATH,ENGINEERING_RECEIPT_PIN,
 PREVIOUS_INDEX_PIN,BROWSER_INDEX_PIN,verifyBrowserHostTransition}
 from './prepare-alg-l06-p020-admission-v2.mjs';
import * as S from '../lib/alg-l06-p020-admission-semantics-v2.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function activePin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const marker='export const G678_ADMISSION_INDEX = ';
 const start=source.indexOf(marker),end=source.indexOf(' as const;',start+marker.length);
 assert(start>=0&&end>start);
 return JSON.parse(source.slice(start+marker.length,end));
}
function withSourceRoot(run){
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
}
test('P020 v2 plan validates v65 browser evidence through exact v66 host successor',
 t=>withSourceRoot(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v66 predecessor is no longer active');return;
  }
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(item=>fs.existsSync(path.join(root,item)));
  const options={previousIndexPin:PREVIOUS_INDEX_PIN,
   engineeringReceiptPin:ENGINEERING_RECEIPT_PIN};
  const plan=buildPlan(options),result=operate('--plan',options);
  assert.equal(plan.index.pages.length,17);
  assert.deepEqual(plan.index.pages,readJsonPin(root,BROWSER_INDEX_PIN).pages);
  assert.deepEqual(plan.browserHostTransition.added.length,2);
  assert.deepEqual(plan.browserHostTransition.changed.length,5);
  assert.deepEqual(plan.browserHostTransition.removed,[]);
  assert.equal(plan.browserHostTransition.snapshotPins.length,5);
  for(const pin of plan.browserHostTransition.snapshotPins)
   assert(plan.bound.integrity.files.some(item=>JSON.stringify(item)===JSON.stringify(pin)));
  assert.equal(plan.bound.entry.artifacts.timeline.path,S.ARTIFACT_PATHS.timeline);
  assert(plan.bound.integrity.files.some(item=>item.path===
   'packages/demos/src/alg-l06-p020-timeline-v1.ts'));
  assert.equal(result.status,'planned-not-written');
  assert.equal(result.engineeringReceiptBound,true);
  assert.equal(result.registrationChanged,false);assert.equal(result.activationChanged,false);
  assert.deepEqual(outputs.map(item=>fs.existsSync(path.join(root,item))),before);
 }));
test('P020 v2 uses the real registry validator and rejects the historical v1 timeline path',
 t=>withSourceRoot(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v66 predecessor is no longer active');return;
  }
  const plan=buildPlan({previousIndexPin:PREVIOUS_INDEX_PIN,
   engineeringReceiptPin:ENGINEERING_RECEIPT_PIN});
  assert.equal(plan.projected.registry.calibrations.some(row=>
   row.calibrationId===S.CALIBRATION),true);
  const broken=structuredClone(plan.registration);
  broken.entries[0].artifacts.timeline.path=
   'packages/demos/src/alg-l06-p020-timeline-v1.ts';
  assert.throws(()=>upsertPrivateCurrentJsCalibration(plan.transaction.registry,broken),
   /artifact paths are not canonical/u);
  assert.throws(()=>buildPlan({previousIndexPin:BROWSER_INDEX_PIN,
   engineeringReceiptPin:ENGINEERING_RECEIPT_PIN}),
   /exact active predecessor index pin/u);
  assert.throws(()=>operate('--prepare',{previousIndexPin:PREVIOUS_INDEX_PIN}),
   /engineering receipt required/u);
 }));
test('P020 v65 browser receipt is not mislabeled current v66 browser validation',
 t=>withSourceRoot(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v66 predecessor is no longer active');return;
  }
  const index=readJsonPin(root,PREVIOUS_INDEX_PIN);
  const host=readJsonPin(root,index.host);
  const receipt=readJsonPin(root,ENGINEERING_RECEIPT_PIN);
  assert.notDeepEqual(receipt.hostPin,index.host);
  const transition=verifyBrowserHostTransition(index,host,receipt);
  assert.deepEqual(transition.browserHostPin,receipt.hostPin);
  assert.deepEqual(transition.currentHostPin,index.host);
  const changed=structuredClone(host);
  changed.files=changed.files.filter(item=>item.path!==
   'apps/web/lib/alg-l06-p020-resources-v1.server.ts');
  assert.throws(()=>verifyBrowserHostTransition(index,changed,receipt));
 }));
