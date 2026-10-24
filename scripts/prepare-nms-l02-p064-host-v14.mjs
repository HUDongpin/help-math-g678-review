#!/usr/bin/env node
/** Append P064 host inputs; preserve every sealed predecessor input. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V13=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v13.json',bytes:34025,
 sha256:'1966784839ef33426ccd4b7753cd8e691a4f78901a6182f349a77ab9a7e6e27b'});
export const HOST_V14_PATH='catalog/nms-l02-admission-v1/host-v14.json';
const P062_PROOF={path:'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json',bytes:97811,
 sha256:'7939dfefe1191f9d6da937cc893fddce07944285395083917daaec058a41d4a9'};
export const P064_HOST_ADDITIONS=Object.freeze([
 'packages/demos/src/lesson-host-contract.ts',
 'apps/web/tsconfig.json',
 'apps/web/lib/lesson-runtime-adapter.ts',
 'apps/web/components/animation-runtime.tsx',
 'apps/web/lib/nms-l02-p064-question-audio-source.ts',
 'apps/web/lib/nms-l02-p064-question-audio-access.ts',
 'apps/web/lib/nms-l02-p064-question-audio-response.ts',
 'apps/web/lib/nms-l02-p064-question-audio.production-stub.ts',
 'apps/web/tests/nms-l02-p064-question-audio.test.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/[folder]/[question]/[option]/route.ts',
 'apps/web/lib/nms-l02-p064-admission.server.ts',
 'apps/web/tests/nms-l02-p064-admission.server-test.ts',
 'apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts',
 'apps/web/tests/nms-l02-p064-candidate-descriptor-v1.test.ts',
 'apps/web/lib/nms-l02-p064-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p064-product-host.production-stub.tsx',
 'apps/web/lib/g678-p064-candidate.production-stub.tsx',
 'apps/web/tests/g678-p064-local-candidate-boundary.test.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
 'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx',
 'scripts/generate-nms-l02-p064-host-v1.mjs',
 'scripts/generate-nms-l02-p064-host-v1.test.mjs',
 'scripts/prepare-nms-l02-p064-host-v14.mjs',
 'scripts/prepare-nms-l02-p064-host-v14.test.mjs',
]);
export function composeP064HostV14(base,additions){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V13.sha256,'exact host-v13');
 assert.equal(base.files.length,139);assert.equal(base.transitions.length,5);
 assert.equal(base.successorTransitions.length,4);
 assert.deepEqual(additions.map(pin=>pin.path),P064_HOST_ADDITIONS,'exact additions and order');
 const old=new Set(base.files.map(pin=>pin.path));
 for(const pin of additions){
  assert(!old.has(pin.path),'no replacement of predecessor');
  assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/u.test(pin.sha256));
 }
 const files=uniquePins([...base.files,...additions]);
 assert.equal(files.length,139+P064_HOST_ADDITIONS.length);
 return {...base,predecessorHost:HOST_V13,files};
}
export async function buildP064HostV14Plan({root=ROOT}={}){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV);
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 assert.equal(fs.realpathSync(root),root);assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const base=readJsonPin(root,HOST_V13),proof=readJsonPin(root,P062_PROOF);
 for(const pin of base.files)readPin(root,pin);
 for(const pin of proof.files)readPin(root,pin);
 const pagePaths=new Set(proof.files.map(pin=>pin.path));
 assert(P064_HOST_ADDITIONS.every(relative=>!pagePaths.has(relative)),'no old page proof mutations');
 const additions=P064_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP064HostV14(base,additions);
 const {nmsL02P062AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p062-admission.server.ts');
 const predecessor=nmsL02P062AdmissionDescriptor();
 assert(predecessor.registered&&predecessor.descriptor.productBridge.registeredAnimationCount===61&&
  predecessor.descriptor.pages.length===64&&predecessor.descriptor.glossary.length===25,'real P062 predecessor');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V14_PATH,bytes:bytes.length,sha256:sha256(bytes)}};
}
export async function sealP064HostV14(plan){
 const current=await buildP064HostV14Plan({root:plan.root});
 assert.deepEqual(current.hostPin,plan.hostPin);assert.deepEqual(current.bytes,plan.bytes);
 fs.writeFileSync(path.join(plan.root,HOST_V14_PATH),plan.bytes,{flag:'wx'});
 assert.deepEqual(pinFile(plan.root,HOST_V14_PATH),plan.hostPin);
 const state=verifyNmsL02Predecessor(plan.root,plan.host.predecessor,plan.hostPin);
 return {status:'NMS_L02_HOST_V14_SEALED',host:plan.hostPin,pages:state.descriptor.pages.length,
  files:plan.host.files.length,registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]));
  const plan=await buildP064HostV14Plan();
  console.log(JSON.stringify(process.argv[2]==='--seal'?await sealP064HostV14(plan):
   {status:'NMS_L02_HOST_V14_PLAN_ONLY',host:plan.hostPin,files:plan.host.files.length,
    registrationEffect:'none',acceptanceEffect:'none'}));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
