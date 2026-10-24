#!/usr/bin/env node
/** Append P062 host inputs; preserve every sealed predecessor input. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V12=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v12.json',bytes:31223,
 sha256:'faa548ba1bebc240a023ce6f4a12ecb32f524a26b12b66a3d54da9be00e8de57'});
export const HOST_V13_PATH='catalog/nms-l02-admission-v1/host-v13.json';
const P061_PROOF={path:'work/g678-workflow/candidates/shared-nms002-l02-p061-v1.json',bytes:102913,
 sha256:'7e49a257ec06811fb45174752c96f5f5acda8071ed008de31b6951d4db31a094'};
export const P062_HOST_ADDITIONS=Object.freeze([
 'apps/web/app/migration-assets/nms-l02-p062/[asset]/route.ts',
 'apps/web/lib/nms-l02-p062-assets.server.ts',
 'apps/web/tests/nms-l02-p062-assets.server-test.ts',
 'apps/web/lib/nms-l02-p062-admission.server.ts',
 'apps/web/tests/nms-l02-p062-admission.server-test.ts',
 'apps/web/lib/nms-l02-p062-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p062-candidate-descriptor-v1.test.ts',
 'apps/web/lib/nms-l02-p062-production-stub.tsx',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p062/page.tsx',
 'apps/web/components/g678-nms-l02-p062-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p062-host-v1.css',
 'scripts/generate-nms-l02-p062-host-v1.mjs',
 'scripts/generate-nms-l02-p062-host-v1.test.mjs',
 'scripts/prepare-nms-l02-p062-host-v13.mjs',
 'scripts/prepare-nms-l02-p062-host-v13.test.mjs',
]);
export function composeP062HostV13(base,additions){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V12.sha256,'exact host-v12');
 assert.equal(base.files.length,124);assert.equal(base.transitions.length,5);
 assert.equal(base.successorTransitions.length,4);
 assert.deepEqual(additions.map(pin=>pin.path),P062_HOST_ADDITIONS,'exact additions and order');
 const old=new Set(base.files.map(pin=>pin.path));
 for(const pin of additions){
  assert(!old.has(pin.path),'no replacement of predecessor');
  assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/u.test(pin.sha256));
 }
 const files=uniquePins([...base.files,...additions]);
 assert.equal(files.length,139);
 return {...base,predecessorHost:HOST_V12,files};
}
export async function buildP062HostV13Plan({root=ROOT}={}){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV);
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 assert.equal(fs.realpathSync(root),root);assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const base=readJsonPin(root,HOST_V12),proof=readJsonPin(root,P061_PROOF);
 for(const pin of base.files)readPin(root,pin);
 for(const pin of proof.files)readPin(root,pin);
 const pagePaths=new Set(proof.files.map(pin=>pin.path));
 assert(P062_HOST_ADDITIONS.every(relative=>!pagePaths.has(relative)),'no old page proof mutations');
 const additions=P062_HOST_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP062HostV13(base,additions);
 const {nmsL02P061AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p061-admission.server.ts');
 const predecessor=nmsL02P061AdmissionDescriptor();
 assert(predecessor.registered&&predecessor.descriptor.productBridge.registeredAnimationCount===60&&
  predecessor.descriptor.pages.length===64&&predecessor.descriptor.glossary.length===25,'real P061 predecessor');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V13_PATH,bytes:bytes.length,sha256:sha256(bytes)}};
}
export async function sealP062HostV13(plan){
 const current=await buildP062HostV13Plan({root:plan.root});
 assert.deepEqual(current.hostPin,plan.hostPin);assert.deepEqual(current.bytes,plan.bytes);
 fs.writeFileSync(path.join(plan.root,HOST_V13_PATH),plan.bytes,{flag:'wx'});
 assert.deepEqual(pinFile(plan.root,HOST_V13_PATH),plan.hostPin);
 const state=verifyNmsL02Predecessor(plan.root,plan.host.predecessor,plan.hostPin);
 return {status:'NMS_L02_HOST_V13_SEALED',host:plan.hostPin,pages:state.descriptor.pages.length,
  files:plan.host.files.length,registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]));
  const plan=await buildP062HostV13Plan();
  console.log(JSON.stringify(process.argv[2]==='--seal'?await sealP062HostV13(plan):
   {status:'NMS_L02_HOST_V13_PLAN_ONLY',host:plan.hostPin,files:plan.host.files.length,
    registrationEffect:'none',acceptanceEffect:'none'}));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
