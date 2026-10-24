import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile,readJsonPin,REGISTRY,DISPATCH} from '../lib/g678-admission-proof.mjs';
import {P054_SOURCE_ROOT} from '../lib/nms-l02-p054-proof-semantics-v1.mjs';
import {COUNTS,EVIDENCE,HOST_PIN,PROOF_PIN,assertNoP054Acceptance,
 validateP054FormalBrowser,validateP054PendingMedia,validateP054Continuity,validateP054ProductionRecovery}
 from './register-nms-l02-p054-current-js-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script='scripts/register-nms-l02-p054-current-js-v1.mjs';
const activation='apps/web/lib/nms-l02-p054-admission-activation.ts';
const targets=[REGISTRY,...DISPATCH,activation];
const beforeTargets=()=>new Map(targets.map(relative=>[relative,pinFile(root,relative)]));
const item=relative=>{const pin=pinFile(root,relative);return{pin,data:readJsonPin(root,pin)};};
const run=(...args)=>spawnSync(process.execPath,[script,...args],{
 cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:P054_SOURCE_ROOT,NODE_ENV:'development'},
 encoding:'utf8',timeout:180000,maxBuffer:2*1024*1024});

test('sealed P054 host and proof are immutable source bindings',()=>{
 assert.deepStrictEqual(pinFile(root,HOST_PIN.path),HOST_PIN);
 assert.deepStrictEqual(pinFile(root,PROOF_PIN.path),PROOF_PIN);
 assert.equal(COUNTS.oldTotal,636);assert.equal(COUNTS.newTotal,637);
 assert.equal(COUNTS.oldShared,494);assert.equal(COUNTS.newShared,495);
 assert.equal(COUNTS.oldLesson,62);assert.equal(COUNTS.newLesson,63);
});

test('formal My Lesson evidence requires source score, unresolved terminal, native audio and cleanup',()=>{
 const browser=item(EVIDENCE.browser),before=beforeTargets();
 assert.equal(validateP054FormalBrowser(browser,before),true);
 const score=structuredClone(browser);
 score.data.cases[0].observations.find(row=>row.label==='correct-feedback-end-6').score=60;
 assert.throws(()=>validateP054FormalBrowser(score,before),/source pairs and unresolved terminal/u);
 const audio=structuredClone(browser);
 audio.data.cases[1].feedbackResponses.responses[0].sha256='f'.repeat(64);
 assert.throws(()=>validateP054FormalBrowser(audio,before),/source .* feedback bytes/u);
 const cleanup=structuredClone(browser);
 cleanup.data.cases[0].observations.find(row=>row.label==='p064-navigation').audio[0].src='blob:stale';
 assert.throws(()=>validateP054FormalBrowser(cleanup,before),/feedback nodes cleaned/u);
});

test('pending media evidence binds only action-era correct and wrong aborted requests',()=>{
 const pending=item(EVIDENCE.pending),before=beforeTargets();
 assert.equal(validateP054PendingMedia(pending,before),true);
 const stale=structuredClone(pending);
 stale.data.cases[0].replayAbort[0].failure=null;
 assert.throws(()=>validateP054PendingMedia(stale,before),/source request aborted/u);
 const missing=structuredClone(pending);
 missing.data.cases[1].navigationAbort.pop();
 assert.throws(()=>validateP054PendingMedia(missing,before),/exact held request identities/u);
});

test('registrar rejects acceptance claims and unsupported modes before any mutation',()=>{
 const accepted={originalRuntime:false,audioAcceptance:false,
  acceptanceEffects:{authoritativeOriginalRuntime:false,fidelityAccepted:false,
   audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,
   strictComplete:false,published:false}};
 assert.equal(assertNoP054Acceptance(accepted),undefined);
 accepted.acceptanceEffects.ownerAccepted=true;
 assert.throws(()=>assertNoP054Acceptance(accepted),/acceptanceEffects/u);
 const before=[...beforeTargets().values()];
 for(const args of [['--apply'],['--write','extra']]){
  const result=run(...args);assert.notEqual(result.status,0);
 }
 assert.deepStrictEqual([...beforeTargets().values()],before);
});

test('read-only plan fails closed until all candidate evidence and successor checker exist',()=>{
 const before=[...beforeTargets().values()];
 const result=run('--plan');
 const allEvidence=Object.values(EVIDENCE).every(relative=>fs.existsSync(path.join(root,relative)));
 const checkerPresent=['scripts/check-private-current-js-admission-registry-v2.mjs',
  'scripts/check-private-current-js-admission-registry-v2.test.mjs']
  .every(relative=>fs.existsSync(path.join(root,relative)));
 const activationText=fs.readFileSync(path.join(root,activation),'utf8');
 const stage=activationText.match(/"stage": "(candidate|registered)"/u)?.[1];
 if(!allEvidence||!checkerPresent||stage!=='candidate')
  assert.notEqual(result.status,0,'no incomplete evidence can authorize a write');
 else if(result.status===0){
  const plan=JSON.parse(result.stdout.trim());
  assert.equal(plan.status,'P054_REGISTRATION_READY_NOT_WRITTEN');
  assert.deepStrictEqual(plan.counts,COUNTS);
  assert.equal(plan.registrationEffect,'none');assert.equal(plan.acceptanceEffect,'none');
 }else assert.match(result.stderr,/AssertionError|ENOENT|NMS_|Error:/u);
 assert.deepStrictEqual([...beforeTargets().values()],before,'--plan cannot alter active inputs');
});

test('continuity validator checks actual bilingual predecessor route when a passed receipt exists',()=>{
 if(!fs.existsSync(path.join(root,EVIDENCE.continuity)))return;
 const continuity=item(EVIDENCE.continuity);
 if(continuity.data.status!=='technical-pass-not-acceptance'){
  assert.throws(()=>validateP054Continuity(continuity,beforeTargets()),
   /Expected values to be strictly equal/u);
  return;
 }
 assert.equal(validateP054Continuity(continuity,beforeTargets()),true);
 const drift=structuredClone(continuity);
 drift.data.cases[0].selectedPages.pop();
 assert.throws(()=>validateP054Continuity(drift,beforeTargets()),
  /selected page traversal/u);
});


test('recovered production evidence preserves failed history and binds the same build',()=>{
 if(!fs.existsSync(path.join(root,EVIDENCE.restoration)))return;
 const documents=Object.fromEntries(Object.entries(EVIDENCE).map(([key,value])=>[key,item(value)]));
 assert.equal(validateP054ProductionRecovery(documents),true);
 const lost=structuredClone(documents);lost.priorRestoration.data.failure=null;
 assert.throws(()=>validateP054ProductionRecovery(lost),/Port must be free/u);
 const changed=structuredClone(documents);changed.recoveryIntent.data.build.sha256='f'.repeat(64);
 assert.throws(()=>validateP054ProductionRecovery(changed),/recovery/u);
 const preserved=structuredClone(documents);preserved.restoration.data.oldBuildIdAfter.sha256='f'.repeat(64);
 assert.throws(()=>validateP054ProductionRecovery(preserved),/recovery preserves/u);
});
