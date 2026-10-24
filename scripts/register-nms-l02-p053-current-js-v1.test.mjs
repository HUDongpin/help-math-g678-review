import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile,readRegistryTransaction,REGISTRY,DISPATCH}
 from '../lib/g678-admission-proof.mjs';
import {P053_SOURCE_ROOT,P053_ACCEPTANCE_EFFECTS}
 from '../lib/nms-l02-p053-proof-semantics-v1.mjs';
import {COUNTS,EVIDENCE_PATHS,EVIDENCE_PINS,HOST_PIN,PROOF_PIN,
 assertNoP053Acceptance,validateEvidenceInputs,validateFormalEvidence}
 from './register-nms-l02-p053-current-js-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const activation='apps/web/lib/nms-l02-p053-admission-activation.ts';
const targets=[REGISTRY,...DISPATCH,activation];
const before=()=>targets.map(relative=>pinFile(root,relative));
const run=(...args)=>spawnSync(process.execPath,
 ['scripts/register-nms-l02-p053-current-js-v1.mjs',...args],{
  cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:P053_SOURCE_ROOT,
   NODE_ENV:'development'},encoding:'utf8',timeout:180000,maxBuffer:2*1024*1024});

test('sealed P053 host and proof and exact predecessor counts',()=>{
 assert.deepStrictEqual(pinFile(root,HOST_PIN.path),HOST_PIN);
 assert.deepStrictEqual(pinFile(root,PROOF_PIN.path),PROOF_PIN);
 assert.deepStrictEqual(COUNTS,{oldTotal:637,newTotal:638,oldShared:495,
  newShared:496,oldLesson:63,newLesson:64});
 const transaction=readRegistryTransaction(root).registry;
 assert([COUNTS.oldTotal,COUNTS.newTotal].includes(
  transaction.calibrations.flatMap(row=>row.entries).length));
});

test('reviewed evidence pins fail closed until every result is physically reviewed',()=>{
 assert.deepStrictEqual(Object.keys(EVIDENCE_PATHS),Object.keys(EVIDENCE_PINS));
 const pending=Object.entries(EVIDENCE_PINS).filter(([,pin])=>pin===null);
 for(const [key,pin] of Object.entries(EVIDENCE_PINS))if(pin!==null)
  assert.deepStrictEqual(pin,pinFile(root,EVIDENCE_PATHS[key]),`physical reviewed evidence ${key}`);
 const original=before(),result=run('--plan');
 if(pending.length){assert.notEqual(result.status,0);
  assert.match(result.stderr,/independently reviewed exact evidence pin pending:/u);}
 else if(result.status===0)assert.equal(JSON.parse(result.stdout).registrationEffect,'none');
 else assert.match(result.stderr,/candidate|absent|registered|directory/u);
 assert.deepStrictEqual(before(),original,'read-only plan cannot mutate registry/dispatch/activation');
});

test('evidence input validator rejects duplicate and omitted transaction inputs',()=>{
 const pins=before();const map=new Map(pins.map(pin=>[pin.path,pin]));
 assert.throws(()=>validateEvidenceInputs([pins[0],pins[0]],map),/duplicate evidence pin/u);
 assert.throws(()=>validateEvidenceInputs([pins[0]],map),/missing registration boundary/u);
 const altered={...pins[0],sha256:'f'.repeat(64)};
 assert.throws(()=>validateEvidenceInputs([altered],map),/historical target/u);
});

test('formal evidence cannot pass from labels alone or acceptance promotion',()=>{
 const fake={schemaVersion:1,formal:true,phase:'candidate',
  status:'technical-pass-not-acceptance',registeredCount:63,renderableCount:64,
  unregisteredCandidateCount:1,activePageCount:64,inputStable:true,cleanupErrors:[],
  acceptanceEffects:P053_ACCEPTANCE_EFFECTS};
 const docs=Object.fromEntries(Object.keys(EVIDENCE_PATHS).map(key=>[key,{data:fake}]));
 assert.throws(()=>validateFormalEvidence(docs,new Map()),/formal-my-lesson-browser-v1/u);
 assert.doesNotThrow(()=>assertNoP053Acceptance({acceptanceEffects:P053_ACCEPTANCE_EFFECTS}));
 assert.throws(()=>assertNoP053Acceptance({acceptanceEffects:
  {...P053_ACCEPTANCE_EFFECTS,ownerAccepted:true}}),/acceptance effects/u);
});

test('unsupported modes never modify the live registry',()=>{
 const original=before();
 for(const args of [['--apply'],['--write','extra']])
  assert.notEqual(run(...args).status,0);
 assert.deepStrictEqual(before(),original);
});
