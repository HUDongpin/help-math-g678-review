import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,FRAGMENT_PATH,ENGINEERING_RECEIPT_PATH,
 validateEngineeringReceipt} from './prepare-alg-l06-p017-admission-v1.mjs';
import * as S from '../lib/alg-l06-p017-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function currentPredecessorPin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const pin=JSON.parse(source.slice(source.indexOf('=')+1,source.lastIndexOf(' as const;')));
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

test('P017 read-only plan preserves 14 prior proofs and never creates candidate files',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P017 already admitted; no predecessor plan');return;}
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(relative=>fs.existsSync(path.join(root,relative)));
  const plan=buildPlan({previousIndexPin}),result=operate('--plan',{previousIndexPin});
  assert.equal(plan.index.pages.length,14);
  assert.deepEqual(plan.bound.selectedPages.map(page=>[page.animationId,page.globalPageOrdinal,
   page.sectionPageOrdinal,page.runtime.frameDomain,page.runtime.frameCount]),
  [[S.ID,17,7,'sprite-42',721]]);
  assert.deepEqual(plan.bound.continuousSource.mainRangeFrames,[[2,721]]);
  assert.equal(Object.keys(plan.bound.glossaryActions).length,6);
  assert.equal(result.status,'planned-not-written');
  assert.equal(result.outputsProvisional,true);
  assert.equal(result.engineeringReceiptBound,false);
  assert(result.missingPrerequisites.includes(ENGINEERING_RECEIPT_PATH));
  assert.equal(result.registrationChanged,false);
  assert.equal(result.activationChanged,false);
  assert.deepEqual(result.outputs.map(item=>item.path),outputs);
  assert.deepEqual(outputs.map(relative=>fs.existsSync(path.join(root,relative))),before);
 }));

test('P017 preparation refuses missing receipt and drifted predecessor or physical root',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P017 already admitted; no predecessor plan');return;}
  assert.throws(()=>operate('--prepare',{previousIndexPin}),/engineering receipt required/u);
  assert.throws(()=>operate('--check',{previousIndexPin}),/engineering receipt required/u);
  const historical=pinFile(root,'output/alg-l06-p017-host-lifecycle-v1/engineering-receipt-v1.json');
  assert.throws(()=>buildPlan({previousIndexPin,engineeringReceiptPin:historical}),
   /exact P017 receipt path/u);
  assert.throws(()=>buildPlan({previousIndexPin:{...previousIndexPin,
   sha256:'0'.repeat(64)}}),/exact active predecessor index pin/u);
  const historicalIndex=pinFile(root,'catalog/g678-admission-v1/index-v55.json');
  assert.throws(()=>buildPlan({previousIndexPin:historicalIndex}),
   /exact active predecessor index pin/u);
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-real-source';
  assert.throws(()=>buildPlan({previousIndexPin}),/real source root/u);
 }));

test('P017 plan binds actual candidate browser receipt and physical runtime without registration',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P017 already admitted; no predecessor plan');return;}
  if(!fs.existsSync(path.join(root,ENGINEERING_RECEIPT_PATH))){
   t.skip('real P017 browser receipt not yet available');return;
  }
  const engineeringReceiptPin=pinFile(root,ENGINEERING_RECEIPT_PATH);
  const receipt=readJsonPin(root,engineeringReceiptPin);
  const plan=buildPlan({previousIndexPin,engineeringReceiptPin});
  const result=operate('--plan',{previousIndexPin,engineeringReceiptPin});
  assert.equal(receipt.checks.oneContinuousMainContext,true);
  assert.equal(receipt.checks.naturalMainEOF721,true);
  assert.equal(plan.bound.integrity.files.find(pin=>pin.path===ENGINEERING_RECEIPT_PATH)?.sha256,
   engineeringReceiptPin.sha256);
  for(const evidence of receipt.artifacts)assert.deepEqual(
   plan.bound.integrity.files.find(pin=>pin.path===evidence.path),evidence);
  assert.equal(result.engineeringReceiptBound,true);
  assert.equal(result.runtimeMemberMaterialized,true);
  assert.equal(result.outputsProvisional,false);
  assert.equal(result.registrationChanged,false);
 }));

test('P017 receipt validator rejects fabricated checks, acceptance and absent raw evidence',t=>{
 if(!fs.existsSync(path.join(root,ENGINEERING_RECEIPT_PATH))){
  t.skip('fresh current-host P017 browser receipt not yet available');return;
 }
 const pin=pinFile(root,ENGINEERING_RECEIPT_PATH),receipt=readJsonPin(root,pin);
 assert.throws(()=>validateEngineeringReceipt({...receipt,artifacts:[]}),
  /raw browser evidence pins required/u);
 assert.throws(()=>validateEngineeringReceipt({...receipt,
  checks:{...receipt.checks,naturalMainEOF721:false}}),
  /real P017 browser check: naturalMainEOF721/u);
 assert.throws(()=>validateEngineeringReceipt({...receipt,
  acceptance:{...receipt.acceptance,owner:true}}),/independent acceptance gates/u);
 assert.throws(()=>validateEngineeringReceipt({...receipt,
  hostPin:{...receipt.hostPin,sha256:'0'.repeat(64)}}),/current bytes/u);
});
