#!/usr/bin/env node
/** Append P054 local My Lesson host inputs without changing a sealed ancestor. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';
import {validateP064ProofClosure} from '../lib/nms-l02-p064-admission-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V14=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v14.json',
 bytes:38775,sha256:'34a4280e72e90d55db7cd8f12587c39095c73ca1fcb7b253d221be098e980d9c'});
export const HOST_V15_PATH='catalog/nms-l02-admission-v1/host-v15.json';
export const P064_PROOF=Object.freeze({path:'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
 bytes:44928,sha256:'91ecc6b6b5dece0d0b3521c5d150b25be0a4bbf06b85b776fdb7f146d8af0ec7'});
export const P054_DOM_RUN=Object.freeze({path:'work/g678-shared-page-factory/g678-nms-l02-p054-source-matching-current-js-v1/run-manifest.json',
 bytes:59551,sha256:'e2a7c7d03d5d0ff0a2a949a39ba4232437b70f85184d30718108211701533c3d'});
export const P054_DOM_MEMBER=Object.freeze({path:'work/g678-shared-page-factory/g678-nms-l02-p054-source-matching-current-js-v1/members/shared-nms002-l02-p054/member-manifest.json',
 bytes:21706,sha256:'1207b6be377e9ea7ae3e225baf33417370d2a256e1f2aac8dfea9479146fd6ec'});

/** Only shared host inputs. The P054 source/product/runtime, DOM run/member,
 * semantic proof, browser evidence and mutable activation belong elsewhere. */
export const P054_HOST_ADDITIONS=Object.freeze([
 'apps/web/lib/nms-l02-p054-product-descriptor-v1.ts',
 'apps/web/tests/nms-l02-p054-product-descriptor-v1.test.ts',
 'apps/web/lib/nms-l02-p054-descriptor-extension.ts',
 'apps/web/tests/nms-l02-p054-descriptor-extension.test.ts',
 'apps/web/lib/nms-l02-p054-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p054-product-host.production-stub.tsx',
 'apps/web/lib/g678-p054-candidate.production-stub.tsx',
 'apps/web/tests/g678-p054-local-candidate-boundary.test.mjs',
 'apps/web/lib/nms-l02-p054-reveal.server.ts',
 'apps/web/lib/nms-l02-p054-reveal-access.ts',
 'apps/web/lib/nms-l02-p054-feedback-audio.server.ts',
 'apps/web/lib/nms-l02-p054-feedback-audio-access.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/reveal/[level]/[order]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/[kind]/route.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p054/page.tsx',
 'apps/web/components/g678-nms-l02-p054-product-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p054-product-host-v1.css',
 'scripts/generate-nms-l02-p054-product-host-v1.mjs',
 'apps/web/lib/nms-l02-p054-admission.server.ts',
 'apps/web/tests/nms-l02-p054-admission.server-test.ts',
 'scripts/prepare-nms-l02-p054-host-v15.mjs',
 'scripts/prepare-nms-l02-p054-host-v15.test.mjs',
]);

export function composeP054HostV15(base,additions){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V14.sha256,
  'exact sealed host-v14 bytes');
 assert.equal(base.kind,'nms-l02-successor-host-v1');
 assert.equal(base.contract,'nms-l02-source-bound-host-v1');
 assert.equal(base.files.length,164);assert.equal(base.transitions.length,5);
 assert.equal(base.successorTransitions.length,4);
 assert.deepEqual(additions.map(pin=>pin.path),P054_HOST_ADDITIONS,
  'only reviewed P054 host additions and order');
 const existing=new Set(base.files.map(pin=>pin.path));
 for(const pin of additions){
  assert(!existing.has(pin.path),'no predecessor host replacement');
  assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/u.test(pin.sha256),
   `valid host pin ${pin.path}`);
 }
 const files=uniquePins([...base.files,...additions]);
 assert.equal(files.length,164+P054_HOST_ADDITIONS.length);
 return {...base,predecessorHost:HOST_V14,files};
}

/** Read-only plan. It intentionally fails until the new formal reader, test and
 * final route bytes exist; it never assigns guessed hashes to them. */
export async function buildP054HostV15Plan({root=ROOT}={}){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV);
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 assert.equal(fs.realpathSync(root),root);assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const base=readJsonPin(root,HOST_V14),proof=readJsonPin(root,P064_PROOF);
 validateP064ProofClosure(proof);
 for(const pin of base.files)readPin(root,pin);
 for(const pin of proof.files)readPin(root,pin);
 for(const item of proof.external)readPin(item.root,item.pin);
 const run=readJsonPin(root,P054_DOM_RUN),member=readJsonPin(root,P054_DOM_MEMBER);
 assert.equal(run.kind,'nms-l02-p054-maintained-dom-source-run-v1');
 assert.equal(run.inputs.length,53);assert.equal(run.outputs.length,2);
 assert.equal(run.sharedDependencies.length,7);
 assert.equal(member.animationId,'shared-nms002-l02-p054');
 const oldPage=new Set(proof.files.map(pin=>pin.path));
 const pageOwned=new Set([...run.inputs,...run.outputs,P054_DOM_RUN,P054_DOM_MEMBER]
  .map(pin=>pin.path));
 for(const relative of P054_HOST_ADDITIONS){
  assert(!oldPage.has(relative),'old P064 proof remains untouched');
  assert(!pageOwned.has(relative),'P054 host/page DOM boundaries disjoint');
 }
 const additions=P054_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP054HostV15(base,additions);
 for(const dependency of run.sharedDependencies){
  assert.deepEqual(host.files.find(pin=>pin.path===dependency.path),dependency,
   `exact P054 DOM shared dependency ${dependency.path}`);
 }
 const {nmsL02P064AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p064-admission.server.ts');
 const predecessor=nmsL02P064AdmissionDescriptor();
 assert(predecessor.registered&&predecessor.descriptor.productBridge.registeredAnimationCount===62&&
  predecessor.descriptor.pages.length===64&&predecessor.descriptor.glossary.length===25,
  'real registered P064 predecessor');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V15_PATH,bytes:bytes.length,sha256:sha256(bytes)}};
}

export async function sealP054HostV15(plan){
 const current=await buildP054HostV15Plan({root:plan.root});
 assert.deepEqual(current.hostPin,plan.hostPin);assert.deepEqual(current.bytes,plan.bytes);
 fs.writeFileSync(path.join(plan.root,HOST_V15_PATH),plan.bytes,{flag:'wx'});
 assert.deepEqual(pinFile(plan.root,HOST_V15_PATH),plan.hostPin);
 const state=verifyNmsL02Predecessor(plan.root,plan.host.predecessor,plan.hostPin);
 return {status:'NMS_L02_HOST_V15_SEALED',host:plan.hostPin,pages:state.descriptor.pages.length,
  files:plan.host.files.length,registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]));
  const plan=await buildP054HostV15Plan();
  console.log(JSON.stringify(process.argv[2]==='--seal'?await sealP054HostV15(plan):
   {status:'NMS_L02_HOST_V15_PLAN_ONLY',host:plan.hostPin,files:plan.host.files.length,
    registrationEffect:'none',acceptanceEffect:'none'}));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
