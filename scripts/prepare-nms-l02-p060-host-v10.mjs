#!/usr/bin/env node
/** Append-only P060 shared host. The page proof and activation are separate;
 * --plan writes nothing and --seal is a later, independently reviewed step. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V9=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v9.json',
 bytes:24286,sha256:'7577cc70ba0cf2ab97104b14341bc96064cc7df879e61e0f2674aaf0da7dac40'});
export const HOST_V10_PATH='catalog/nms-l02-admission-v1/host-v10.json';
export const P060_RUN=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p060-conditional-host-current-js-v1/run-manifest.json',
 bytes:63280,sha256:'a0881dec6cc2d7ebc1ce680aef800ccf3fe0a3195065be5c108be9e3c41354bf'});
const WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});

/** Exact new shared-host membership. P060 source, runtime, glossary, page
 * proof, and admission activation remain outside this host closure. */
export const P060_HOST_V10_ADDITIONS=Object.freeze([
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p060/page.tsx',
 'apps/web/app/migration-assets/nms-l02-p060/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-p060-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p060-host-v1.css',
 'apps/web/lib/nms-l02-p060-admission.server.ts',
 'apps/web/lib/nms-l02-p060-assets.server.ts',
 'apps/web/lib/nms-l02-p060-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p060-production-stub.tsx',
 'apps/web/tests/nms-l02-p060-assets.server-test.ts',
 'apps/web/tests/nms-l02-p060-candidate-descriptor-v1.test.ts',
 'scripts/generate-nms-l02-p060-host-v1.mjs',
 'scripts/prepare-nms-l02-p060-host-v10.mjs',
 'scripts/prepare-nms-l02-p060-host-v10.test.mjs',
]);
export const P060_SHARED_HOST_DEPENDENCY_PATHS=Object.freeze([
 'lib/g678-admission-proof.mjs',
 'packages/demos/src/alg-l12-glossary-pair-audio-loader.ts',
 'packages/demos/src/contract.ts',
 'packages/demos/src/source-glossary-controls.tsx',
 'packages/demos/src/source-glossary-session.ts',
 'scripts/private-current-js-registry.mjs',
]);
const PAGE_ONLY=new Set([
 'apps/web/components/nms-l02-p060-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p060-descriptor-extension.ts',
 'apps/web/tests/nms-l02-p060-descriptor-extension.test.ts',
 'lib/nms-l02-p060-admission-semantics.mjs',
 'packages/demos/src/modules/shared-nms002-l02-p060.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p060.ts',
 'scripts/prepare-nms-l02-p060-admission.mjs',
 'scripts/prepare-nms-l02-p060-admission.test.mjs',
 P060_RUN.path,
]);
const ACTIVATION='apps/web/lib/nms-l02-p060-admission-activation.ts';
const SHA=/^[a-f0-9]{64}$/u;
const samePin=(a,b)=>a?.path===b?.path&&a?.bytes===b?.bytes&&a?.sha256===b?.sha256;
const validPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&
 pin.bytes>0&&SHA.test(pin.sha256);

export function composeP060HostV10(base,additionPins,run){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V9.sha256,
  'exact sealed host-v9 document');
 assert(base.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1'&&base.acceptanceEffect==='none',
  'frozen host contract and acceptance');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact original predecessor witness');
 assert(base.files?.length===95&&base.transitions?.length===5&&
  base.successorTransitions?.length===2,'sealed host-v9 closure shape');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v9 pins');
 assert(run?.schemaVersion===1&&run.animationId==='shared-nms002-l02-p060'&&
  run.method==='source-locked-public-tool-IR-and-maintained-DOM-state-machine'&&
  run.inputs?.length===216&&run.outputs?.length===20&&
  run.sharedDependencies?.length===P060_SHARED_HOST_DEPENDENCY_PATHS.length,
  'exact P060 conditional DOM run shape');
 assert(Object.values(run.acceptanceEffects).every(value=>value===false),
  'P060 DOM run has no acceptance effect');
 assert.deepStrictEqual(run.sharedDependencies.map(pin=>pin.path),
  P060_SHARED_HOST_DEPENDENCY_PATHS,'six exact shared dependency paths');
 for(const dependency of run.sharedDependencies){
  const old=base.files.find(pin=>pin.path===dependency.path);
  assert(old&&samePin(old,dependency),`exact pre-existing host pin: ${dependency.path}`);
 }
 assert(Array.isArray(additionPins)&&additionPins.length===P060_HOST_V10_ADDITIONS.length,
  'complete P060 shared-host additions');
 assert.deepStrictEqual(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)),
  [...P060_HOST_V10_ADDITIONS].sort((a,b)=>a.localeCompare(b)),
  'exact P060 shared-host membership');
 const old=new Set(base.files.map(pin=>pin.path));
 const historical=new Set([...base.transitions,...base.successorTransitions]
  .map(item=>item.current.path));
 for(const pin of additionPins)
  assert(validPin(pin)&&!old.has(pin.path)&&!historical.has(pin.path),
   `new ordinary shared-host input: ${pin.path}`);
 const files=uniquePins([...base.files,...additionPins]);
 assert(files.length===base.files.length+additionPins.length,'append-only host-v10 files');
 for(const pin of base.files)
  assert(files.some(candidate=>samePin(candidate,pin)),`preserve host-v9 pin: ${pin.path}`);
 const hostPaths=new Set(files.map(pin=>pin.path));
 for(const pagePath of [...PAGE_ONLY,ACTIVATION])
  assert(!hostPaths.has(pagePath),`page-owned or activation excluded: ${pagePath}`);
 assert([...run.inputs,...run.outputs].every(pin=>!hostPaths.has(pin.path)),
  'P060 DOM page input/output cannot enter host closure');
 return {schemaVersion:base.schemaVersion,kind:base.kind,contract:base.contract,
  predecessor:base.predecessor,predecessorHost:HOST_V9,files,
  transitions:base.transitions,successorTransitions:base.successorTransitions,
  acceptanceEffect:base.acceptanceEffect};
}

function assertLocal(root){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering host only');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real AWS source root');
 for(const directory of [root,SOURCE_ROOT]){
  assert.equal(fs.realpathSync(directory),directory,`physical directory: ${directory}`);
  assert(fs.lstatSync(directory).isDirectory(),`ordinary directory: ${directory}`);
 }
}

/** Verifies all 95 inherited current pins and all historical snapshots even
 * if a new P060 input is not ready. Incomplete --plan returns pending paths. */
export async function buildP060HostV10Plan({root=ROOT}={}){
 assertLocal(root);
 const base=readJsonPin(root,HOST_V9);
 for(const pin of base.files)readPin(root,pin);
 for(const item of [...base.transitions,...base.successorTransitions]){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,
   'historical transition shape');
  readPin(root,item.current);
  readPin(root,item.snapshot);
 }
 const {nmsL02P058AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p058-admission.server.ts');
 const predecessor=nmsL02P058AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===58,
  'real registered P058 predecessor');
 const expected=[...Array.from({length:52},(_,index)=>index+1),55,56,57,58,59,63]
  .map(number=>`shared-nms002-l02-p${String(number).padStart(3,'0')}`);
 assert.deepStrictEqual(predecessor.descriptor.pages
  .filter(page=>page.rendererAvailability.kind==='registered').map(page=>page.animationId),
  expected,'exact 58-page predecessor order');
 assert(predecessor.descriptor.pages[59].animationId==='shared-nms002-l02-p060'&&
  predecessor.descriptor.pages[59].rendererAvailability.kind==='unavailable',
  'P060 not previously registered');
 const pending=[P060_RUN.path,...P060_HOST_V10_ADDITIONS]
  .filter(relative=>!fs.existsSync(path.join(root,relative)));
 if(pending.length)return {status:'NMS_L02_HOST_V10_WAITING_INPUTS',root,baseHost:HOST_V9,
  pendingPaths:pending,retainedFileCount:base.files.length,
  retainedTransitionCount:base.transitions.length,
  retainedSuccessorTransitionCount:base.successorTransitions.length,
  registeredPredecessorCount:58,registrationEffect:'none',acceptanceEffect:'none'};
 const run=readJsonPin(root,P060_RUN);
 for(const dependency of run.sharedDependencies)readPin(root,dependency);
 const additionPins=P060_HOST_V10_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP060HostV10(base,additionPins,run);
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {status:'NMS_L02_HOST_V10_PLAN_ONLY',root,host,bytes,
  hostPin:{path:HOST_V10_PATH,bytes:bytes.length,sha256:sha256(bytes)},
  baseHost:HOST_V9,run:P060_RUN,addedFiles:additionPins,
  retainedFileCount:base.files.length,retainedTransitionCount:base.transitions.length,
  retainedSuccessorTransitionCount:base.successorTransitions.length,
  registeredPredecessorCount:58,registrationEffect:'none',acceptanceEffect:'none'};
}

export async function sealP060HostV10(plan){
 assert(plan?.status==='NMS_L02_HOST_V10_PLAN_ONLY'&&
  plan.hostPin?.path===HOST_V10_PATH&&Buffer.isBuffer(plan.bytes),
  'complete reviewed host-v10 plan');
 const file=path.join(plan.root,HOST_V10_PATH);
 assert(!fs.existsSync(file),'host-v10 already sealed');
 const current=await buildP060HostV10Plan({root:plan.root});
 assert.deepStrictEqual(current.hostPin,plan.hostPin,'unchanged host-v10 plan');
 assert.deepStrictEqual(current.bytes,plan.bytes,'unchanged host-v10 document bytes');
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V10_PATH),plan.hostPin,'sealed host-v10 exact bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V10_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,registeredPredecessorCount:58,
  files:plan.host.files.length,historicalTransitions:plan.host.transitions.length,
  successorTransitions:plan.host.successorTransitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try {
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=await buildP060HostV10Plan();
  const result=process.argv[2]==='--seal'?await sealP060HostV10(plan):
   plan.status==='NMS_L02_HOST_V10_WAITING_INPUTS'?plan:
   {status:plan.status,host:plan.hostPin,baseHost:plan.baseHost,
    run:plan.run,retainedFiles:plan.retainedFileCount,addedFiles:plan.addedFiles,
    historicalTransitions:plan.retainedTransitionCount,
    successorTransitions:plan.retainedSuccessorTransitionCount,
    registeredPredecessorCount:plan.registeredPredecessorCount,
    registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
