import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,FRAGMENT_PATH,PREVIOUS_INDEX_PIN,ENGINEERING_RECEIPT_PATH}
 from './prepare-alg-l06-p023-admission-v1.mjs';
import * as S from '../lib/alg-l06-p023-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function withPhysicalSource(run){
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
}
function activePin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=source.indexOf(marker),end=source.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin);return JSON.parse(source.slice(begin+marker.length,end));
}
test('P023 v77 plan projects exactly one canonical registration without writing it',t=>
 withPhysicalSource(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v77 predecessor no longer active');return;
  }
  assert.deepEqual(pinFile(root,PREVIOUS_INDEX_PIN.path),PREVIOUS_INDEX_PIN);
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(item=>fs.existsSync(path.join(root,item)));
  const plan=buildPlan({previousIndexPin:PREVIOUS_INDEX_PIN});
  const result=operate('--plan',{previousIndexPin:PREVIOUS_INDEX_PIN});
  assert.equal(plan.index.pages.length,20);
  assert.equal(result.status,'planned-not-written');
  assert.equal(result.outputsProvisional,true);
  assert.deepEqual(result.missingPrerequisites,[ENGINEERING_RECEIPT_PATH]);
  assert.equal(result.registrationChanged,false);assert.equal(result.activationChanged,false);
  assert.deepEqual(outputs.map(item=>fs.existsSync(path.join(root,item))),before);
  assert(plan.projected.registry.calibrations.some(row=>row.calibrationId===S.CALIBRATION));
  assert.equal(plan.transaction.registry.calibrations.filter(row=>row.deploymentScope==='local-only')
   .reduce((count,row)=>count+row.entries.length,0),510);
  assert.equal(plan.projected.registry.calibrations.filter(row=>row.deploymentScope==='local-only')
   .reduce((count,row)=>count+row.entries.length,0),511);
  assert.deepEqual(plan.bound.entry.artifacts,S.proposedP023Artifacts(root,plan.source.canvas));
  const wrongRange=structuredClone(plan.bound);
  wrongRange.continuousSource.mainRanges=[[11,200],[201,410]];
  assert.throws(()=>S.validateP023AdmissionSemantics(wrongRange,plan.registration,root));
  const wrongGlossary=structuredClone(plan.bound);
  wrongGlossary.glossaryActions.Domain.instances[0].firstCandidateFrame=11;
  assert.throws(()=>S.validateP023AdmissionSemantics(wrongGlossary,plan.registration,root));
  assert.throws(()=>buildPlan({previousIndexPin:{...PREVIOUS_INDEX_PIN,bytes:1}}),
   /reviewed v77 predecessor/);
  assert.throws(()=>operate('--prepare',{previousIndexPin:PREVIOUS_INDEX_PIN}),
   /browser receipt required/);
  assert.throws(()=>operate('--check-receipt',{previousIndexPin:PREVIOUS_INDEX_PIN,
   engineeringReceiptPin:{path:ENGINEERING_RECEIPT_PATH,bytes:1,sha256:'0'.repeat(64)}}));
  const reviewedReceipt={path:ENGINEERING_RECEIPT_PATH,bytes:9028,
   sha256:'25da1be34ab1d895c31b36bbba3978ce1f4ea5c96b93151c9219bd90e1d04307'};
  assert.deepEqual(pinFile(root,ENGINEERING_RECEIPT_PATH),reviewedReceipt);
  const checked=operate('--check-receipt',{previousIndexPin:PREVIOUS_INDEX_PIN,
   engineeringReceiptPin:reviewedReceipt});
  assert.equal(checked.status,'receipt-validated-candidate-not-written');
  assert.equal(checked.engineeringReceiptBound,true);
  assert.equal(checked.outputsProvisional,false);
  assert.deepEqual(checked.missingPrerequisites,[]);
  assert.deepEqual(outputs.map(item=>fs.existsSync(path.join(root,item))),before);
 }));
