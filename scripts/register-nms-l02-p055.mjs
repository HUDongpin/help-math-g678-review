#!/usr/bin/env node
/** One local registry transaction after the real candidate-host probe. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {buildP055AdmissionPlan,checkP055Admission} from './prepare-nms-l02-p055-admission.mjs';
import {pinFile,readPin,readRegistryTransaction,REGISTRY,DISPATCH} from '../lib/g678-admission-proof.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.deepEqual(process.argv.slice(2),['--apply'],'explicit --apply required');
assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local transaction only');
const dir='output/nms-l02-host-successor-20260927/registration';
assert(!fs.existsSync(path.join(root,dir)),'one fresh transaction only');
const plan=buildP055AdmissionPlan();
checkP055Admission(plan,{hostPath:'catalog/nms-l02-admission-v1/host-v5.json',
 witnessPath:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json'});
const evidencePath='output/nms-l02-host-successor-20260927/browser/candidate-v4/evidence.json';
const evidencePin=pinFile(root,evidencePath),evidence=JSON.parse(readPin(root,evidencePin));
assert(evidence.passed&&evidence.inputsUnchanged&&evidence.expectedStage==='candidate'&&
 evidence.records.length===6&&evidence.records.every(row=>row.status==='candidate-host-functional-probe-passed-not-acceptance'),
 'all actual candidate-host cases passed');
assert.deepEqual(evidence.inputs,evidence.inputsAfter,'no browser-input drift during run');
for(const pin of evidence.inputs)readPin(root,pin);
const continuityPin=pinFile(root,'output/nms-l02-host-successor-20260927/p052-continuity/host-v5-fifth/result.json');
const continuity=JSON.parse(readPin(root,continuityPin));
assert(continuity.status==='technical-pass-not-acceptance'&&continuity.cases.length===2&&
 continuity.cases.every(row=>row.status==='p052-continuity-technical-pass-not-acceptance'),'real predecessor runtime continuity');
for(const pin of continuity.inputPins)readPin(root,pin);
const naturalPin=pinFile(root,'output/nms-l02-host-successor-20260927/natural-end/root-natural-end-v3/evidence.json');
const natural=JSON.parse(readPin(root,naturalPin));
assert(natural.status==='natural-end-candidate-probe-passed-not-acceptance'&&natural.inputsUnchanged&&natural.sourceUnchanged,
 'independent natural terminal and Replay check');
for(const pin of natural.inputsAfter)readPin(root,pin);
const before=readRegistryTransaction(root);
assert.equal(before.sha256,plan.transaction.sha256,'transaction compare-and-swap');
const beforeKeys=before.registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const afterKeys=plan.projected.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const g678=keys=>keys.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
assert(beforeKeys.length===628&&afterKeys.length===629&&g678(beforeKeys).length===486&&g678(afterKeys).length===487,
 'exact one-page G678 count change; 142 other-grade entries retained');
assert.deepEqual(afterKeys.filter(key=>!beforeKeys.includes(key)),['shared-nms002-l02-p055'],'P055 only');
for(const row of before.registry.calibrations)
 assert.deepEqual(plan.projected.calibrations.find(item=>item.calibrationId===row.calibrationId),row,'prior calibrations preserved');
fs.mkdirSync(path.join(root,dir));
const originals=[REGISTRY,...DISPATCH].map(file=>{
 const original=pinFile(root,file),bytes=readPin(root,original),snapshot=`${dir}/${path.basename(file)}.before`;
 fs.writeFileSync(path.join(root,snapshot),bytes,{flag:'wx',mode:0o444});
 return {original,snapshot:pinFile(root,snapshot)};
});
assert.equal(readRegistryTransaction(root).sha256,before.sha256,'unchanged immediately before write');
const temporary=path.join(root,`${REGISTRY}.p055-next`);
fs.writeFileSync(temporary,JSON.stringify(plan.projected,null,2)+'\n',{flag:'wx'});
fs.renameSync(temporary,path.join(root,REGISTRY));
const generated=spawnSync(process.execPath,['packages/demos/scripts/generate-registry.mjs'],{cwd:root,encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const after=readRegistryTransaction(root);
assert.deepEqual(after.registry,plan.projected,'exact final registry');
const receipt={schemaVersion:1,kind:'nms-l02-p055-local-registration-v1',
 beforeCount:486,afterCount:487,totalActivePages:2282,animationId:'shared-nms002-l02-p055',
 candidate:plan.candidatePin,browserEvidence:evidencePin,predecessorContinuity:continuityPin,naturalEnd:naturalPin,originals,
 outputs:[REGISTRY,...DISPATCH].map(file=>pinFile(root,file)),
 originalRuntime:false,audioAcceptance:false,humanReview:false,ownerAcceptance:false,strictComplete:false,publication:false};
fs.writeFileSync(path.join(root,dir,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'P055_REGISTERED_LOCAL_CURRENT_JS',before:486,after:487,total:2282,
 receipt:pinFile(root,`${dir}/receipt.json`)}));
