import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,FRAGMENT_PATH,ENGINEERING_RECEIPT_PATH,
 validateEngineeringReceipt} from './prepare-alg-l06-p016-admission-v1.mjs';
import * as S from '../lib/alg-l06-p016-admission-semantics-v1.mjs';

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

test('P016 read-only plan preserves 13 proofs and labels unbound browser evidence provisional',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P016 already admitted; no predecessor plan');return;}
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(relative=>fs.existsSync(path.join(root,relative)));
  const plan=buildPlan({previousIndexPin}),result=operate('--plan',{previousIndexPin});
  assert.equal(plan.index.pages.length,13);
  assert.deepEqual(plan.bound.selectedPages.map(page=>[page.animationId,page.globalPageOrdinal,
   page.sectionPageOrdinal,page.runtime.frameDomain,page.runtime.frameCount]),
  [[S.ID,16,6,'sprite-139',815]]);
  assert.deepEqual(plan.bound.continuousSource.mainRangeFrames,[[2,299],[312,815]]);
  assert.deepEqual([plan.bound.glossaryActions.Function.firstCandidateFrame,
   plan.bound.glossaryActions.Function.firstFullHitFrame],[72,null]);
  assert.equal(result.status,'planned-not-written');
  assert.equal(result.outputsProvisional,true);
  assert.equal(result.engineeringReceiptBound,false);
  assert(result.missingPrerequisites.includes(ENGINEERING_RECEIPT_PATH));
  assert.equal(result.registrationChanged,false);
  assert.equal(result.activationChanged,false);
  assert.deepEqual(result.outputs.map(item=>item.path),outputs);
  assert.deepEqual(outputs.map(relative=>fs.existsSync(path.join(root,relative))),before);
 }));

test('P016 preparation rejects a missing receipt before writing or checking',t=>withSourceRoot(()=>{
 const previousIndexPin=currentPredecessorPin();
 if(!previousIndexPin){t.skip('P016 already admitted; no predecessor plan');return;}
 assert.throws(()=>operate('--prepare',{previousIndexPin}),/engineering receipt required/u);
 assert.throws(()=>operate('--check',{previousIndexPin}),/engineering receipt required/u);
 assert.throws(()=>buildPlan({previousIndexPin:{...previousIndexPin,sha256:'0'.repeat(64)}}),
  /exact previous index bytes/u);
 process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-real-source';
 assert.throws(()=>buildPlan({previousIndexPin}),/real source root/u);
}));

test('P016 read-only plan binds the real browser receipt and all six raw evidence pins',
 t=>withSourceRoot(()=>{
  const previousIndexPin=currentPredecessorPin();
  if(!previousIndexPin){t.skip('P016 already admitted; no predecessor plan');return;}
  if(!fs.existsSync(path.join(root,ENGINEERING_RECEIPT_PATH))){
   t.skip('real P016 browser receipt not yet available');return;
  }
  const engineeringReceiptPin=pinFile(root,ENGINEERING_RECEIPT_PATH);
  const plan=buildPlan({previousIndexPin,engineeringReceiptPin});
  const result=operate('--plan',{previousIndexPin,engineeringReceiptPin});
  const receipt=readJsonPin(root,engineeringReceiptPin);
  assert.equal(receipt.artifacts.length,6);
  assert.equal(plan.bound.integrity.files.find(pin=>pin.path===ENGINEERING_RECEIPT_PATH)?.sha256,
   engineeringReceiptPin.sha256);
  for(const evidence of receipt.artifacts)assert.deepEqual(
   plan.bound.integrity.files.find(pin=>pin.path===evidence.path),evidence);
  assert.equal(result.engineeringReceiptBound,true);
  assert.equal(result.outputsProvisional,false);
  assert.equal(result.registrationChanged,false);
 }));

test('P016 receipt validator rejects invented checks, acceptance and absent raw evidence',()=>{
 const previousIndexPin={path:'catalog/g678-admission-v1/index-v51.json',bytes:3849,
  sha256:'909a889609a4ccb74ddfabe10bb533f35d20cf35c136acb6edf3c15b2725a426'};
 const hostPin={path:'catalog/g678-admission-v1/host-v51.json',bytes:109465,
  sha256:'eeb04b0e51f89bf2d81b75d3c49b179e795ba5c9d4bf9304dda565d226dd44c6'};
 const receipt={kind:'g678-p016-es-mobile-engineering-v1',animationId:S.ID,
  formalRegistered:503,denominator:2282,p016Registered:false,
  indexPin:previousIndexPin,hostPin,
  checks:{twoMainRangesSameContext:true,mainStoppedBeforeSA:true,
   saEOFRequiresExplicitReturn:true,navigationClosedMainAndSA:true,
   keyboardGlossaryCloseFocus:true,esReducedMotionNoAutoplay:true,naturalMainEOF815:true},
  acceptance:{originalRuntime:false,listening:false,human:false,owner:false,
   strictCompletion:false,published:false},
  remainingGap:['Escape does not dismiss glossary'],artifacts:[]};
 assert.throws(()=>validateEngineeringReceipt(receipt),
  /raw browser evidence pins required/u);
 assert.throws(()=>validateEngineeringReceipt({...receipt,
  checks:{...receipt.checks,naturalMainEOF815:false}}),
  /real P016 browser check: naturalMainEOF815/u);
 assert.throws(()=>validateEngineeringReceipt({...receipt,
  acceptance:{...receipt.acceptance,owner:true}}),/independent acceptance gates/u);
 assert.throws(()=>validateEngineeringReceipt({...receipt,
  hostPin:{...hostPin,sha256:'0'.repeat(64)}}),/current bytes/u);
});
