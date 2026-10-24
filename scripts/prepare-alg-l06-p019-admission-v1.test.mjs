import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,FRAGMENT_PATH,ENGINEERING_RECEIPT_PATH,
 validateEngineeringReceipt} from './prepare-alg-l06-p019-admission-v1.mjs';
import * as S from '../lib/alg-l06-p019-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function currentPredecessorPin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const marker='export const G678_ADMISSION_INDEX = ';
 const start=source.indexOf(marker),end=source.indexOf(' as const;',start+marker.length);
 assert(start>=0&&end>start);
 const pin=JSON.parse(source.slice(start+marker.length,end));
 const index=readJsonPin(root,pin);
 return index.pages.some(page=>page.animationId===S.ID)?null:pin;
}
function withSourceRoot(run){
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{
  if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;
 }
}

test('P019 read-only plan retains sixteen prior proofs and writes no candidate artifact',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P019 already admitted; no predecessor plan');return;}
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(relative=>fs.existsSync(path.join(root,relative)));
  const plan=buildPlan({previousIndexPin}),result=operate('--plan',{previousIndexPin});
  assert.equal(plan.index.pages.length,16);
  assert.deepEqual(plan.bound.selectedPages.map(page=>[page.animationId,page.globalPageOrdinal,
   page.sectionPageOrdinal,page.runtime.frameDomain,page.runtime.frameCount]),
  [[S.ID,19,9,'sprite-37',351]]);
  assert.deepEqual(plan.bound.continuousSource.mainRangeFrames,[[2,351]]);
  assert.equal(Object.keys(plan.bound.glossaryActions).length,6);
  assert.equal(Object.values(plan.bound.glossaryActions).reduce((n,x)=>n+x.instances.length,0),6);
  assert.equal(result.status,'planned-not-written');
  assert.equal(result.outputsProvisional,true);
  assert.equal(result.engineeringReceiptBound,false);
  assert(result.missingPrerequisites.includes(ENGINEERING_RECEIPT_PATH));
  assert.equal(result.registrationChanged,false);assert.equal(result.activationChanged,false);
  assert.deepEqual(result.outputs.map(item=>item.path),outputs);
  assert.deepEqual(outputs.map(relative=>fs.existsSync(path.join(root,relative))),before);
 }));

test('P019 preparation refuses absent receipt, drifted index and wrong physical root',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P019 already admitted; no predecessor plan');return;}
  assert.throws(()=>operate('--prepare',{previousIndexPin}),/engineering receipt required/u);
  assert.throws(()=>operate('--check',{previousIndexPin}),/engineering receipt required/u);
  const historical=pinFile(root,'output/playwright/alg-l06-p018-host-lifecycle-v2/engineering-receipt-v1.json');
  assert.throws(()=>buildPlan({previousIndexPin,engineeringReceiptPin:historical}),
   /exact P019 receipt path/u);
  assert.throws(()=>buildPlan({previousIndexPin:{...previousIndexPin,
   sha256:'0'.repeat(64)}}),/exact active predecessor index pin/u);
  const historicalIndex=pinFile(root,'catalog/g678-admission-v1/index-v60.json');
  assert.throws(()=>buildPlan({previousIndexPin:historicalIndex}),
   /exact active predecessor index pin/u);
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-real-source';
  assert.throws(()=>buildPlan({previousIndexPin}),/real source root/u);
 }));

test('P019 current-host receipt must bind all raw cases before preparation',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P019 already admitted; no predecessor plan');return;}
  if(!fs.existsSync(path.join(root,ENGINEERING_RECEIPT_PATH))){
   t.skip('fresh current-host P019 browser receipt not yet available');return;
  }
  const engineeringReceiptPin=pinFile(root,ENGINEERING_RECEIPT_PATH);
  const receipt=readJsonPin(root,engineeringReceiptPin);
  const plan=buildPlan({previousIndexPin,engineeringReceiptPin});
  const result=operate('--plan',{previousIndexPin,engineeringReceiptPin});
  assert.deepEqual(receipt.indexPin,previousIndexPin);
  assert.deepEqual(receipt.hostPin,plan.index.host);
  assert.deepEqual(plan.bound.integrity.files.find(pin=>pin.path===ENGINEERING_RECEIPT_PATH),
   engineeringReceiptPin);
  for(const evidence of receipt.artifacts)assert.deepEqual(
   plan.bound.integrity.files.find(pin=>pin.path===evidence.path),evidence);
  assert.equal(result.engineeringReceiptBound,true);
  assert.equal(result.runtimeMemberMaterialized,true);
  assert.equal(result.outputsProvisional,false);
  assert.equal(result.registrationChanged,false);
  assert.throws(()=>validateEngineeringReceipt({...receipt,artifacts:[]}),
   /raw browser evidence pins required/u);
  assert.throws(()=>validateEngineeringReceipt({...receipt,
   checks:{...receipt.checks,naturalMainEOF351:false}}),
   /real P019 browser check: naturalMainEOF351/u);
  assert.throws(()=>validateEngineeringReceipt({...receipt,
   acceptance:{...receipt.acceptance,owner:true}}),/independent acceptance gates/u);
 }));
