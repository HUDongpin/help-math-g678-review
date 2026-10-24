#!/usr/bin/env node
/** Append-only NMS L02 P056 shared-host successor. Page-owned P056 material
 * stays in its separate page proof. This producer never edits host-v5. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
export const HOST_V5=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v5.json',bytes:11001,
 sha256:'f81569d2c3e96577c0f9864ce0df8dbed18c85e77f641fbaac551595a3fbf8fd'});
export const HOST_V6_PATH='catalog/nms-l02-admission-v1/host-v6.json';
const WITNESS=Object.freeze({path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});
/** Explicit finite shared closure. The admission reader is deliberately
 * required even for --plan; an absent or unstable reader cannot be sealed. */
export const P056_HOST_V6_ADDITIONS=Object.freeze([
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p056/page.tsx',
 'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p056-predecessors/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-p056-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p052-source-runtime-p056-v1.tsx',
 'apps/web/components/nms-l02-p055-for-p056-runtime-v1.generated.tsx',
 'apps/web/components/nms-l02-p056-host-v1.css',
 'apps/web/lib/nms-l02-p056-admission.server.ts',
 'apps/web/lib/nms-l02-p056-assets.server.ts',
 'apps/web/lib/nms-l02-p056-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p056-predecessor-assets.server.ts',
 'apps/web/lib/nms-l02-p056-production-stub.tsx',
 'apps/web/lib/nms-l02-source-resource-host.ts',
 'apps/web/tests/nms-l02-p056-assets.server-test.ts',
 'apps/web/tests/nms-l02-p056-candidate-descriptor-v1.test.ts',
 'apps/web/tests/nms-l02-p056-predecessor-assets.server-test.ts',
 'output/nms-l02-p056-product-20260927/continuity/p052-generated-v1.json',
 'output/nms-l02-p056-product-20260927/continuity/resource-plan.json',
 'packages/demos/src/nms-l02-p052-audio-loader-p056-v1.ts',
 'packages/demos/src/nms-l02-p052-browser-controller-p056-v1.ts',
 'packages/demos/src/nms-l02-p052-player-p056-v1.tsx',
 'packages/demos/src/nms-l02-p055-for-p056-assets-v1.generated.ts',
 'packages/demos/src/nms-l02-p055-for-p056-module-v1.generated.tsx',
 'packages/demos/src/nms-l02-p055-for-p056-renderer-v1.generated.tsx',
 'scripts/generate-nms-l02-p055-for-p056-v1.mjs',
 'scripts/generate-nms-l02-p055-for-p056-v1.test.mjs',
 'scripts/generate-nms-l02-p056-host-v1.mjs',
 'scripts/generate-nms-l02-p056-p052-resource-successor.mjs',
 'scripts/prepare-nms-l02-p056-host-v6.mjs',
 'scripts/prepare-nms-l02-p056-host-v6.test.mjs',
]);
const PAGE_ONLY=new Set([
 'apps/web/components/nms-l02-p056-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p056-descriptor-extension.ts',
 'packages/demos/src/modules/shared-nms002-l02-p056.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p056.ts',
 'work/g678-shared-page-factory/g678-nms-l02-p056-conditional-host-current-js-v1/run-manifest.json',
 'work/g678-shared-page-factory/g678-nms-l02-p056-conditional-host-current-js-v1/members/shared-nms002-l02-p056/member-manifest.json',
]);
const SHA=/^[a-f0-9]{64}$/u;
const exactPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&SHA.test(pin.sha256);
const samePin=(a,b)=>a.path===b.path&&a.bytes===b.bytes&&a.sha256===b.sha256;

export function composeP056HostV6(base,additionPins){
 assert.equal(pinFileBytes(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V5.sha256,
  'exact frozen host-v5 document');
 assert(base?.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1','frozen host contract');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact executed 54-page predecessor');
 assert(base.acceptanceEffect==='none'&&Array.isArray(base.files)&&Array.isArray(base.transitions),
  'host-v5 acceptance and closure');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v5 pins');
 assert(Array.isArray(additionPins)&&additionPins.length===P056_HOST_V6_ADDITIONS.length,
  'complete P056 host additions');
 assert(P056_HOST_V6_ADDITIONS.every(item=>!PAGE_ONLY.has(item)),
  'no page-owned P056 input in shared host');
 const expected=[...P056_HOST_V6_ADDITIONS].sort((a,b)=>a.localeCompare(b));
 assert.deepStrictEqual(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)),expected,
  'exact P056 host addition membership');
 const old=new Set(base.files.map(pin=>pin.path));
 const transitioned=new Set(base.transitions.map(item=>item.current.path));
 for(const pin of additionPins){
  assert(exactPin(pin)&&!old.has(pin.path)&&!transitioned.has(pin.path),
   `new ordinary shared-host input: ${pin.path}`);
 }
 const files=uniquePins([...base.files,...additionPins]);
 assert(files.length===base.files.length+additionPins.length,'append-only host files');
 for(const pin of base.files)
  assert(files.some(candidate=>samePin(candidate,pin)),`preserve host-v5 pin: ${pin.path}`);
 return {schemaVersion:base.schemaVersion,kind:base.kind,contract:base.contract,
  predecessor:base.predecessor,files,transitions:base.transitions,acceptanceEffect:base.acceptanceEffect};
}

export function buildP056HostV6Plan({root=ROOT}={}){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering host only');
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 readPin(root,HOST_V5);
 const base=readJsonPin(root,HOST_V5);
 assert.deepStrictEqual(base.predecessor,WITNESS,'unchanged witness binding');
 for(const pin of base.files)readPin(root,pin);
 for(const item of base.transitions){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,
   'reviewed old transition shape');
  readPin(root,item.current);
  readPin(root,item.snapshot);
 }
 // Missing admission reader is an intentional fail-closed condition. It must
 // never be replaced by an invented pin or an empty placeholder.
 const additionPins=P056_HOST_V6_ADDITIONS.map(item=>pinFile(root,item));
 const host=composeP056HostV6(base,additionPins);
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V6_PATH,bytes:bytes.length,
  sha256:pinFileBytes(bytes)},baseHost:HOST_V5,
  addedFiles:additionPins,retainedFileCount:base.files.length,
  retainedTransitionCount:base.transitions.length};
}
function pinFileBytes(bytes){
 // Use the same digest algorithm as pinFile without needing a provisional file.
 return createHash('sha256').update(bytes).digest('hex');
}
export function sealP056HostV6(plan){
 assert(plan?.hostPin?.path===HOST_V6_PATH&&Buffer.isBuffer(plan.bytes),
  'reviewed host-v6 plan');
 assert(!fs.existsSync(path.join(plan.root,HOST_V6_PATH)),'host-v6 already sealed');
  // Execute the full, unchanged 54-page contract before publishing a successor.
  verifyNmsL02Predecessor(plan.root,WITNESS,HOST_V5);
  for(const pin of plan.addedFiles)
   assert.deepStrictEqual(pinFile(plan.root,pin.path),pin,`new host input changed: ${pin.path}`);
 const file=path.join(plan.root,HOST_V6_PATH);
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V6_PATH),plan.hostPin,
  'sealed host-v6 exact bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V6_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,
  registered:state.descriptor.productBridge.registeredAnimationCount,
  files:plan.host.files.length,transitions:plan.host.transitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=buildP056HostV6Plan();
  const result=process.argv[2]==='--seal'?sealP056HostV6(plan):
   {status:'NMS_L02_HOST_V6_PLAN_ONLY',host:plan.hostPin,
    retainedFiles:plan.retainedFileCount,addedFiles:plan.addedFiles,
    transitions:plan.retainedTransitionCount,registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
