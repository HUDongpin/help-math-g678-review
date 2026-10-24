import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJsonPin,readPageProof} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {buildPlan,operate,FRAGMENT_PATH,ENGINEERING_RECEIPT_PIN,
 PREVIOUS_INDEX_PIN,BROWSER_INDEX_PIN,verifyBrowserHostTransition,
 validateEngineeringReceipt} from './prepare-alg-l06-p021-admission-v1.mjs';
import * as S from '../lib/alg-l06-p021-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function withPhysicalSource(run){
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;}
}
function activePin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=source.indexOf(marker),end=source.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin);return JSON.parse(source.slice(begin+marker.length,end));
}
const options={previousIndexPin:PREVIOUS_INDEX_PIN,engineeringReceiptPin:ENGINEERING_RECEIPT_PIN};
test('P021 source pins and six instance gates match current physical evidence',()=>{
 const source=S.readP021CanonicalSource(root);
 assert.equal(source.localInputs.length>=39,true);
 assert.equal(source.external.length,5);
 assert.deepEqual(Object.keys(source.glossary),
  ['Set','Function','Value','Ordered pair','Input','Output']);
 assert.deepEqual(Object.fromEntries(Object.entries(source.glossary).map(([key,item])=>
  [key,item.instances[0].firstFullHitFrame])),
  {Set:12,Function:20,Value:25,'Ordered pair':62,Input:69,Output:77});
 assert.deepEqual(source.text.orderedPairs.map(row=>row.firstCompletePairFrame),
  [346,356,366,376]);
 assert.deepEqual(S.readP021Artifacts(root),S.proposedP021Artifacts(root));
});
test('P021 v70 browser receipt binds raw cases, and v71 transition changes only reviewed files',()=>{
 const receipt=readJsonPin(root,ENGINEERING_RECEIPT_PIN);
 const raw=validateEngineeringReceipt(receipt);
 assert(raw.some(item=>item.path.endsWith('/cases.json')));
 assert(raw.some(item=>item.path.endsWith('/page-errors.json')));
 const current=readJsonPin(root,PREVIOUS_INDEX_PIN),host=readJsonPin(root,current.host);
 const transition=verifyBrowserHostTransition(current,host,receipt);
 assert.deepEqual(current.pages,readJsonPin(root,BROWSER_INDEX_PIN).pages);
 assert.deepEqual(transition.changed,['apps/web/lib/alg-l06-p021-resources-v1.server.ts']);
 assert.equal(transition.added.length,2);assert.deepEqual(transition.removed,[]);
 const broken=structuredClone(receipt);broken.checks.naturalMainEOF377=false;
 assert.throws(()=>validateEngineeringReceipt(broken),/naturalMainEOF377/u);
 const changed=structuredClone(host);changed.files=changed.files.filter(item=>
  item.path!==transition.changed[0]);
 assert.throws(()=>verifyBrowserHostTransition(current,changed,receipt));
});
test('P021 plan uses common registry projection and does not write or register',t=>withPhysicalSource(()=>{
 if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
  t.skip('v71 predecessor is no longer active');return;
 }
 const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
 const before=outputs.map(item=>fs.existsSync(path.join(root,item)));
 const plan=buildPlan(options),result=operate('--plan',options);
 assert.equal(plan.index.pages.length,18);
 assert.equal(result.status,'planned-not-written');
 assert.equal(result.engineeringReceiptBound,true);
 assert.equal(result.registrationChanged,false);assert.equal(result.activationChanged,false);
 assert.equal(result.external,5);
 assert.deepEqual(outputs.map(item=>fs.existsSync(path.join(root,item))),before);
 assert.equal(plan.bound.entry.artifacts.timeline.path,S.ARTIFACT_PATHS.timeline);
 assert(plan.bound.integrity.files.some(item=>item.path===
  'packages/demos/src/alg-l06-p021-timeline-v1.ts'));
 assert.equal(plan.projected.registry.calibrations.some(row=>
  row.calibrationId===S.CALIBRATION),true);
 const broken=structuredClone(plan.registration);
 broken.entries[0].artifacts.timeline.path='packages/demos/src/alg-l06-p021-timeline-v1.ts';
 assert.throws(()=>upsertPrivateCurrentJsCalibration(plan.transaction.registry,broken),
  /artifact paths are not canonical/u);
 assert.throws(()=>buildPlan({previousIndexPin:BROWSER_INDEX_PIN,
  engineeringReceiptPin:ENGINEERING_RECEIPT_PIN}),/reviewed v71 predecessor/u);
 assert.throws(()=>operate('--prepare',{previousIndexPin:PREVIOUS_INDEX_PIN}),
  /browser receipt required/u);
 const invalid=structuredClone(plan.bound);invalid.glossaryActions.Input.instances[0].firstFullHitFrame=7;
 assert.throws(()=>S.validateP021AdmissionSemantics(invalid,plan.registration,root));
}));
test('P021 physical proof readback uses the common reader after reviewed preparation',t=>
 withPhysicalSource(()=>{
  if(!fs.existsSync(path.join(root,S.PROOF_PATH))||
   JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('reviewed --prepare has not written the immutable P021 proof');return;
  }
  const plan=buildPlan(options),result=operate('--check',options);
  assert.equal(result.status,'candidate-roundtrip-passed-not-registered');
  const packet=readPageProof(root,plan.proofPin,plan.host,plan.projected);
  assert.equal(S.validateP021AdmissionSemantics(packet,plan.registration,root),true);
  assert.deepEqual(packet.entry.artifacts,S.readP021Artifacts(root));
 }));
