import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,FRAGMENT_PATH,ENGINEERING_RECEIPT_PATH,
 REQUIRED_CHECKS,validateEngineeringReceipt}
 from './prepare-alg-l06-p020-admission-v1.mjs';
import * as S from '../lib/alg-l06-p020-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function activePredecessor(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const marker='export const G678_ADMISSION_INDEX = ';
 const start=source.indexOf(marker),end=source.indexOf(' as const;',start+marker.length);
 assert(start>=0&&end>start);
 const pin=JSON.parse(source.slice(start+marker.length,end));
 return readJsonPin(root,pin).pages.some(page=>page.animationId===S.ID)?null:pin;
}
function withSourceRoot(run){
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
}
test('P020 plan checks seventeen previous proofs without writing formal artifacts',t=>withSourceRoot(()=>{
 const previousIndexPin=activePredecessor();
 if(!previousIndexPin){t.skip('P020 already registered');return;}
 const paths=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
 const before=paths.map(relative=>fs.existsSync(path.join(root,relative)));
 const plan=buildPlan({previousIndexPin}),result=operate('--plan',{previousIndexPin});
 assert.equal(plan.index.pages.length,17);
 assert.deepEqual(plan.bound.selectedPages.map(page=>[page.globalPageOrdinal,
  page.sectionPageOrdinal,page.runtime.frameDomain,page.runtime.frameCount,
  page.runtime.quizHoldFrame]),[[20,10,'sprite-162',172,58]]);
 assert.equal(plan.bound.continuousSource.feedback.length,7);
 assert.equal(plan.bound.continuousSource.mainResumeFrame,59);
 assert.equal(result.status,'planned-not-written');
 assert.equal(result.registrationChanged,false);assert.equal(result.activationChanged,false);
 assert.equal(result.outputsProvisional,true);
 assert(result.missingPrerequisites.includes(ENGINEERING_RECEIPT_PATH));
 assert.deepEqual(paths.map(relative=>fs.existsSync(path.join(root,relative))),before);
}));
test('P020 prepare rejects missing real browser receipt, stale index and wrong source root',
 t=>withSourceRoot(()=>{
  const previousIndexPin=activePredecessor();
  if(!previousIndexPin){t.skip('P020 already registered');return;}
  assert.throws(()=>operate('--prepare',{previousIndexPin}),/engineering receipt required/u);
  assert.throws(()=>operate('--check',{previousIndexPin}),/engineering receipt required/u);
  assert.throws(()=>buildPlan({previousIndexPin:{...previousIndexPin,
   sha256:'0'.repeat(64)}}),/exact active predecessor index pin/u);
  const historical=pinFile(root,'output/playwright/alg-l06-p019-host-v1/engineering-receipt-v1.json');
  assert.throws(()=>buildPlan({previousIndexPin,engineeringReceiptPin:historical}),
   /exact P020 receipt path/u);
  process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-real-source';
  assert.throws(()=>buildPlan({previousIndexPin}),/real source root/u);
 }));
test('P020 browser receipt requires all eleven scoped checks and no acceptance promotion',()=>{
 assert.equal(REQUIRED_CHECKS.length,11);
 assert.throws(()=>validateEngineeringReceipt({kind:'wrong'}),
  /g678-p020-local-my-lesson-engineering-v1/u);
 assert.throws(()=>validateEngineeringReceipt({kind:'g678-p020-local-my-lesson-engineering-v1',
  animationId:S.ID,formalRegistered:507,denominator:2282,p020Registered:true}),
  /Expected values to be strictly deep-equal/u);
 const indexPin=activePredecessor();
 if(!indexPin)return;
 const hostPin=readJsonPin(root,indexPin).host;
 const base={kind:'g678-p020-local-my-lesson-engineering-v1',animationId:S.ID,
  formalRegistered:507,denominator:2282,p020Registered:false,indexPin,hostPin,
  checks:Object.fromEntries(REQUIRED_CHECKS.map(key=>[key,true])),
  pageErrors:[],consoleErrors:[],acceptance:{originalRuntime:false,listening:false,
   human:false,owner:false,strictCompletion:false,published:false},
  remainingGap:['Original runtime not observed.'],
  artifacts:Array.from({length:3},(_,i)=>({
   path:`output/playwright/alg-l06-p020-host-v1/historical-${i}.json`,
   bytes:1,sha256:'0'.repeat(64)}))};
 assert.throws(()=>validateEngineeringReceipt(base),/bounded P020 browser raw artifact/u);
 assert.throws(()=>validateEngineeringReceipt({...base,checks:{...base.checks,
  finalSourceAnswerRetainedNative:false}}),
 /real P020 browser check: finalSourceAnswerRetainedNative/u);
 assert.throws(()=>validateEngineeringReceipt({...base,acceptance:{...base.acceptance,
  owner:true}}),/independent acceptance gates/u);
});
