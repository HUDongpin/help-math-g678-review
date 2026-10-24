import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile,REGISTRY,DISPATCH} from '../lib/g678-admission-proof.mjs';
import {P064_SOURCE_ROOT} from '../lib/nms-l02-p064-admission-semantics-v1.mjs';
import {COUNTS,HOST_PIN,PROOF_PIN,assertNoP064Acceptance,validateP064FormalBrowser,
 validateP064FormalReviewBranches,validateP064Continuity} from
 './register-nms-l02-p064-current-js-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script='scripts/register-nms-l02-p064-current-js-v1.mjs';
const activation='apps/web/lib/nms-l02-p064-admission-activation.ts';
const targets=[REGISTRY,...DISPATCH,activation];
const required=[
 HOST_PIN.path,PROOF_PIN.path,
 'output/nms-l02-p064-product-20260928/browser-formal/candidate/formal-v2/evidence.json',
 'output/nms-l02-p064-product-20260928/browser-formal-review-branches/candidate/formal-v1/evidence.json',
 'output/nms-l02-p064-product-20260928/continuity/browser/formal-candidate-v1/root-v1/result.json',
 'output/nms-l02-p064-product-20260928/admission/formal-production-build-intent-v1.json',
 'output/nms-l02-p064-product-20260928/admission/formal-production-build-receipt-v1.json',
 'output/nms-l02-p064-product-20260928/production/formal-admission-candidate-v1.json',
 'output/nms-l02-p064-product-20260928/admission/formal-production-build-link-restoration-v1.json',
];
const beforeTargets=()=>new Map(targets.map(relative=>[relative,pinFile(root,relative)]));
const run=(...args)=>spawnSync(process.execPath,[script,...args],{
 cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:P064_SOURCE_ROOT,NODE_ENV:'development'},
 encoding:'utf8',timeout:180000,maxBuffer:2*1024*1024});
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const item=relative=>({pin:pinFile(root,relative),data:read(relative)});

test('P064 registrar rejects canonical and historical acceptance synonyms',()=>{
 const base={originalRuntime:false,audioAcceptance:false,
  acceptanceEffects:{authoritativeOriginalRuntime:false,fidelityAccepted:false,
   audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,
   strictComplete:false,published:false}};
 assert.equal(assertNoP064Acceptance(base),undefined);
 for(const mutate of [
  value=>{value.originalRuntime=true;},
  value=>{value.audioAcceptance=true;},
  value=>{value.acceptanceEffects.ownerAccepted=true;},
 ]){const drift=structuredClone(base);mutate(drift);
  assert.throws(()=>assertNoP064Acceptance(drift),/unaccepted gate|acceptanceEffects/);}
});

test('P064 formal main and four source-risk cases require real passed browser receipts',()=>{
 const before=beforeTargets();
 const browser=item(required[2]);
 assert.equal(validateP064FormalBrowser(browser,before),true);
 const failed=item('output/nms-l02-p064-product-20260928/browser-formal/candidate/formal-v1/evidence.json');
 assert.throws(()=>validateP064FormalBrowser(failed,before),/formal-candidate-my-lesson-browser-passed-not-acceptance/);
 const drift=structuredClone(browser);
 drift.data.cases[0].reviewSequence[0].risk=false;
 assert.throws(()=>validateP064FormalBrowser(drift,before),/Q10 D review lookup risk/);
 drift.data=structuredClone(browser.data);
 drift.data.cases[1].observations.forEach(value=>{value.sourceRisks=[];});
 assert.throws(()=>validateP064FormalBrowser(drift,before),/Q5 dynamic field interpretation/);
 drift.data=structuredClone(browser.data);
 drift.data.cases[0].audioResponses[0].sha256='f'.repeat(64);
 assert.throws(()=>validateP064FormalBrowser(drift,before),/physical source audio response bytes/);
 if(fs.existsSync(path.join(root,required[3]))){
  const branches=item(required[3]);
  assert.equal(validateP064FormalReviewBranches(branches,before),true);
  const bad=structuredClone(branches);bad.data.cases[0].hostPageMarkedComplete='true';
  assert.throws(()=>validateP064FormalReviewBranches(bad,before));
 }
});

test('P064 predecessor continuity is exact default-seed Q4 with source audio cleanup',()=>{
 const continuity=item(required[4]),before=beforeTargets();
 assert.equal(validateP064Continuity(continuity,before),true);
 const bad=structuredClone(continuity);
 bad.data.cases[0].observations.find(row=>row.step==='p064-return').fq.correct=1;
 assert.throws(()=>validateP064Continuity(bad,before),/P064 remains runnable/);
 const requested=structuredClone(continuity);
 requested.data.cases[0].p064AudioRequests.push({url:'http://127.0.0.1:3331/unrequested'});
 assert.throws(()=>validateP064Continuity(requested,before),/no P064 audio request/);
});

test('read-only P064 plan remains fail closed until every formal evidence leg is sealed',()=>{
 const before=[...beforeTargets().values()];
 const activationData=fs.readFileSync(path.join(root,activation),'utf8');
 const stage=activationData.match(/"stage": "(candidate|registered)"/u)?.[1];
 const present=required.every(relative=>fs.existsSync(path.join(root,relative)));
 const sealed=present&&[
  [required[2],'formal-candidate-my-lesson-browser-passed-not-acceptance'],
  [required[3],'formal-candidate-review-branches-passed-not-acceptance'],
  [required[4],'technical-pass-not-acceptance'],
  [required[6],null],[required[7],'technical-pass-not-deployment'],
 ].every(([relative,status])=>{
  try{const data=read(relative);return status===null?data.exitCode===0:data.status===status;}
  catch{return false;}
 });
 const result=run(stage==='registered'?'--check':'--plan');
 if(!stage||stage==='candidate'&&!sealed)
  assert.notEqual(result.status,0,'missing or failed evidence cannot authorize registration');
 else{
  assert.equal(result.status,0,result.stderr);
  const data=JSON.parse(result.stdout.trim());
  assert.equal(data.status,stage==='registered'?'P064_REGISTRATION_CHECKED_NOT_ACCEPTANCE':
   'P064_REGISTRATION_READY_NOT_WRITTEN');
  if(stage==='candidate'){
   assert.deepStrictEqual(data.counts,COUNTS);
   assert.equal(data.registrationEffect,'none');
   assert.equal(data.acceptanceEffect,'none');
  }
 }
 assert.deepStrictEqual([...beforeTargets().values()],before,
  'planning never mutates active registry, dispatch or activation');
});

test('unsupported registrar modes fail before mutation',()=>{
 const before=[...beforeTargets().values()];
 for(const args of [['--apply'],['--plan','extra']]){
  const result=run(...args);assert.notEqual(result.status,0);
  assert.match(result.stderr,/exact mode|use --plan|Expected values to be strictly equal/u);
 }
 assert.deepStrictEqual([...beforeTargets().values()],before);
});
