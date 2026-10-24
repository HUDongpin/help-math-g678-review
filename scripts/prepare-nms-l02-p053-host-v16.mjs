#!/usr/bin/env node
/** P053 host successor: append reviewed local host files over sealed host-v15. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';
import {validateP054ProofClosure} from '../lib/nms-l02-p054-proof-semantics-v1.mjs';
import {P053_DEFERRED_HOST_PATHS} from './prepare-nms-l02-p053-dom-artifacts-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-nms002-l02-p053';
export const HOST_V15=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v15.json',
 bytes:42983,sha256:'7150c0e90578f5c2763eb3bb90e93a3605dde61613d2597907c318dffec7eb68'});
export const HOST_V16_PATH='catalog/nms-l02-admission-v1/host-v16.json';
export const P054_PROOF=Object.freeze({path:'work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json',
 bytes:54313,sha256:'5e8fc913e9e0bc41dbf1336b4d042983e5fd5b74b60fc63beeec7c3015adf666'});
export const P053_DOM_RUN=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/run-manifest.json',
 bytes:85976,sha256:'3f7a50c543b3d48f166d32defd717e0c7e05e4243ce456ec533322da0aa58d47'});
export const P053_DOM_MEMBER=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/members/shared-nms002-l02-p053/member-manifest.json',
 bytes:47356,sha256:'e9af98aeae37a208f8adde549c7cf0b3d1c9330740dbe1e9be80a3b99006c8b8'});
export const P053_INHERITED_HOST_PATH='apps/web/components/g678-nms-l02-candidate-player.generated.tsx';

/** Every mutable P053 host path from the DOM exclusion ledger, plus the new
 * reviewed extension/reader/composer. The inherited player is checked in
 * host-v15 and must never be appended with a second pin. */
export const P053_HOST_ADDITIONS=Object.freeze([
 ...P053_DEFERRED_HOST_PATHS.filter(item=>item!==P053_INHERITED_HOST_PATH),
 'apps/web/lib/nms-l02-p053-descriptor-extension.ts',
 'apps/web/tests/nms-l02-p053-descriptor-extension.test.ts',
 'apps/web/lib/nms-l02-p053-admission.server.ts',
 'apps/web/tests/nms-l02-p053-admission.server-test.ts',
 'scripts/prepare-nms-l02-p053-host-v16.mjs',
 'scripts/prepare-nms-l02-p053-host-v16.test.mjs',
]);

export function composeP053HostV16(base,additions){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V15.sha256,
  'exact sealed host-v15 bytes');
 assert.equal(base.kind,'nms-l02-successor-host-v1');
 assert.equal(base.contract,'nms-l02-source-bound-host-v1');
 assert.equal(base.files.length,186);
 assert.equal(base.transitions.length,5);
 assert.equal(base.successorTransitions.length,4);
 assert.deepEqual(additions.map(pin=>pin.path),P053_HOST_ADDITIONS,
  'only reviewed P053 host additions and order');
 const existing=new Map(base.files.map(pin=>[pin.path,pin]));
 assert.equal(existing.size,186,'unique predecessor host pins');
 assert(existing.has(P053_INHERITED_HOST_PATH),'inherited candidate player already in host');
 for(const pin of additions){
  assert(!existing.has(pin.path),`no predecessor host replacement: ${pin.path}`);
  assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/u.test(pin.sha256),
   `valid host pin ${pin.path}`);
 }
 const files=uniquePins([...base.files,...additions]);
 assert.equal(files.length,186+P053_HOST_ADDITIONS.length);
 return {...base,predecessorHost:HOST_V15,files};
}

function readAbsolutePin(pin){
 assert(path.isAbsolute(pin.path),'absolute external DOM pin');
 const root=path.dirname(pin.path),relative=path.basename(pin.path);
 const technicalRoot='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
 assert(root.startsWith(`${SOURCE_ROOT}/`)||
  root.startsWith(`${technicalRoot}/`)||
  (root===technicalRoot&&relative==='nms-l01-source-host-binding-v1.json'),
  'reviewed source or retained technical root only');
 assert.deepEqual(pinFile(root,relative),{...pin,path:relative},`external ${pin.path}`);
 readPin(root,{...pin,path:relative});
}

/** Read-only plan. Missing future formal reader or route bytes fail closed. */
export async function buildP053HostV16Plan({root=ROOT}={}){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering only');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root');
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source');
 const base=readJsonPin(root,HOST_V15),proof=readJsonPin(root,P054_PROOF);
 validateP054ProofClosure(proof);
 for(const pin of base.files)readPin(root,pin);
 for(const pin of proof.files)readPin(root,pin);
 for(const item of proof.external)readPin(item.root,item.pin);
 const run=readJsonPin(root,P053_DOM_RUN),member=readJsonPin(root,P053_DOM_MEMBER);
 assert.equal(run.kind,'nms-l02-p053-maintained-dom-source-run-v1');
 assert.equal(run.animationId,ID);
 assert.equal(run.inputs.length,41);
 assert.equal(run.outputs.length,2);
 assert.equal(run.sharedDependencies.length,7);
 assert.equal(run.externalEvidence.length,135);
 assert.equal(member.animationId,ID);
 assert.deepEqual(member.inputs,run.inputs);
 assert.deepEqual(member.outputs,run.outputs);
 assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
 assert.deepEqual(member.sourceRun,P053_DOM_RUN);
 assert.deepEqual(run.deferredHostPaths,P053_DEFERRED_HOST_PATHS,
  'source DOM exclusion ledger is exact');
 for(const pin of [...run.inputs,...run.outputs,...run.sharedDependencies])readPin(root,pin);
 for(const pin of run.externalEvidence)readAbsolutePin(pin);
 const inherited=base.files.find(pin=>pin.path===P053_INHERITED_HOST_PATH);
 assert.deepEqual(inherited,pinFile(root,P053_INHERITED_HOST_PATH),
  'inherited candidate player remains exact; do not append');
 const pageOwned=new Set([...run.inputs,...run.outputs,P053_DOM_RUN,P053_DOM_MEMBER]
  .map(pin=>pin.path));
 const priorPageOwned=new Set(proof.files.map(pin=>pin.path));
 for(const relative of P053_HOST_ADDITIONS){
  assert(!pageOwned.has(relative),'P053 DOM page and host disjoint');
  assert(!priorPageOwned.has(relative),'sealed P054 proof remains untouched');
 }
 assert(base.files.every(pin=>!pageOwned.has(pin.path)),'old host and P053 page disjoint');
 const additions=P053_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP053HostV16(base,additions);
 for(const dependency of run.sharedDependencies){
  assert.deepEqual(host.files.find(pin=>pin.path===dependency.path),dependency,
   `exact P053 DOM shared dependency ${dependency.path}`);
 }
 const {nmsL02P054AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p054-admission.server.ts');
 const predecessor=nmsL02P054AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===63&&
  predecessor.descriptor.glossary.length===25,'real registered P054 predecessor');
 assert(predecessor.descriptor.pages[52].rendererAvailability.kind==='unavailable',
  'P053 not silently registered');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return{root,host,bytes,hostPin:{path:HOST_V16_PATH,bytes:bytes.length,sha256:sha256(bytes)}};
}

export async function sealP053HostV16(plan){
 const current=await buildP053HostV16Plan({root:plan.root});
 assert.deepEqual(current.hostPin,plan.hostPin);
 assert.deepEqual(current.bytes,plan.bytes);
 fs.writeFileSync(path.join(plan.root,HOST_V16_PATH),plan.bytes,{flag:'wx'});
 assert.deepEqual(pinFile(plan.root,HOST_V16_PATH),plan.hostPin);
 const state=verifyNmsL02Predecessor(plan.root,plan.host.predecessor,plan.hostPin);
 return{status:'NMS_L02_HOST_V16_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,files:plan.host.files.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=await buildP053HostV16Plan();
  console.log(JSON.stringify(process.argv[2]==='--seal'?await sealP053HostV16(plan):
   {status:'NMS_L02_HOST_V16_PLAN_ONLY',host:plan.hostPin,files:plan.host.files.length,
    registrationEffect:'none',acceptanceEffect:'none'}));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
