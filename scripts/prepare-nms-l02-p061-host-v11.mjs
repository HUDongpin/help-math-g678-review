#!/usr/bin/env node
/** Append-only P061 shared host. Page proof and activation are separate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V10=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v10.json',
 bytes:26722,sha256:'2a54a89fbd1793ad0f596a51183aa42e120f80581f22a0ec66a125810263ac54'});
export const HOST_V11_PATH='catalog/nms-l02-admission-v1/host-v11.json';
export const P061_RUN=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p061-conditional-host-current-js-v1/run-manifest.json',
 bytes:55412,sha256:'59baa562d3faa34791c09bd18ba14de40b256a3dd33b5d018b5427105019b221'});
const WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});

/** Host routes and security readers only. P061 runtime, semantics, proof,
 * source data and admission activation remain page-owned or outside closure. */
export const P061_HOST_V11_ADDITIONS=Object.freeze([
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p061/page.tsx',
 'apps/web/app/migration-assets/nms-l02-p061/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-p061-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p061-host-v1.css',
 'apps/web/lib/nms-l02-p061-admission.server.ts',
 'apps/web/lib/nms-l02-p061-assets.server.ts',
 'apps/web/lib/nms-l02-p061-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p061-production-stub.tsx',
 'apps/web/tests/nms-l02-p061-admission.server-test.ts',
 'apps/web/tests/nms-l02-p061-assets.server-test.ts',
 'apps/web/lib/nms-l02-p061-candidate-descriptor-v1.test.ts',
 'scripts/generate-nms-l02-p061-host-v1.mjs',
 'scripts/prepare-nms-l02-p061-host-v11.mjs',
 'scripts/prepare-nms-l02-p061-host-v11.test.mjs',
]);
export const P061_SHARED_HOST_DEPENDENCY_PATHS=Object.freeze([
 'lib/g678-admission-proof.mjs',
 'packages/demos/src/alg-l12-glossary-pair-audio-loader.ts',
 'packages/demos/src/contract.ts',
 'packages/demos/src/source-glossary-controls.tsx',
 'packages/demos/src/source-glossary-session.ts',
 'scripts/private-current-js-registry.mjs',
]);
const PAGE_ONLY=new Set([
 'apps/web/components/nms-l02-p061-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p061-descriptor-extension.ts',
 'apps/web/tests/nms-l02-p061-descriptor-extension.test.ts',
 'lib/nms-l02-p061-admission-semantics.mjs',
 'lib/nms-l02-p061-admission-semantics.test.mjs',
 'scripts/prepare-nms-l02-p061-admission.mjs',
 'scripts/prepare-nms-l02-p061-admission.test.mjs',
 P061_RUN.path,
]);
const ACTIVATION='apps/web/lib/nms-l02-p061-admission-activation.ts';
/** This old compiler is both a frozen P061 run input and an inherited v10
 * host tool. Its exact bytes are retained in both closures. */
export const P061_INHERITED_TOOL=Object.freeze({
 path:'scripts/build-g4-l3-embedded-audio-archive.mjs',bytes:49846,
 sha256:'2c04bba5dc5e2c5870305ce5d4429457548712c5843e1bdf2dd11c8b5d3658cf',
});
const SHA=/^[a-f0-9]{64}$/u;
const samePin=(a,b)=>a?.path===b?.path&&a?.bytes===b?.bytes&&a?.sha256===b?.sha256;
const validPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&
 pin.bytes>0&&SHA.test(pin.sha256);

export function composeP061HostV11(base,additionPins,run){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V10.sha256,
  'exact sealed host-v10 document');
 assert(base.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1'&&base.acceptanceEffect==='none',
  'frozen host contract and acceptance');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact original predecessor witness');
 assert(base.files?.length===108&&base.transitions?.length===5&&
  base.successorTransitions?.length===2,'sealed host-v10 closure shape');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v10 pins');
 assert(run?.schemaVersion===1&&run.animationId==='shared-nms002-l02-p061'&&
  run.method==='source-locked-public-tool-IR-and-maintained-DOM-state-machine'&&
  run.inputs?.length===179&&run.outputs?.length===22&&
  run.sharedDependencies?.length===P061_SHARED_HOST_DEPENDENCY_PATHS.length,
  'exact P061 conditional DOM run shape');
 assert(Object.values(run.acceptanceEffects).every(value=>value===false),
  'P061 DOM run has no acceptance effect');
 assert.deepStrictEqual(run.sharedDependencies.map(pin=>pin.path),
  P061_SHARED_HOST_DEPENDENCY_PATHS,'six exact shared dependency paths');
 for(const dependency of run.sharedDependencies){
  const old=base.files.find(pin=>pin.path===dependency.path);
  assert(old&&samePin(old,dependency),`exact pre-existing host pin: ${dependency.path}`);
 }
 assert(Array.isArray(additionPins)&&additionPins.length===P061_HOST_V11_ADDITIONS.length,
  'complete P061 shared-host additions');
 assert.deepStrictEqual(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)),
  [...P061_HOST_V11_ADDITIONS].sort((a,b)=>a.localeCompare(b)),
  'exact P061 shared-host membership');
 const old=new Set(base.files.map(pin=>pin.path));
 const historical=new Set([...base.transitions,...base.successorTransitions]
  .map(item=>item.current.path));
 for(const pin of additionPins)
  assert(validPin(pin)&&!old.has(pin.path)&&!historical.has(pin.path),
   `new ordinary shared-host input: ${pin.path}`);
 const files=uniquePins([...base.files,...additionPins]);
 assert(files.length===base.files.length+additionPins.length,'append-only host-v11 files');
 for(const pin of base.files)
  assert(files.some(candidate=>samePin(candidate,pin)),`preserve host-v10 pin: ${pin.path}`);
 const hostPaths=new Set(files.map(pin=>pin.path));
 for(const pagePath of [...PAGE_ONLY,ACTIVATION])
  assert(!hostPaths.has(pagePath),`page-owned or activation excluded: ${pagePath}`);
 const overlap=[...run.inputs,...run.outputs].filter(pin=>hostPaths.has(pin.path));
 assert.deepStrictEqual(overlap,[P061_INHERITED_TOOL],
  'only exact inherited compiler may overlap P061 DOM run and host');
 assert.deepStrictEqual(base.files.find(pin=>pin.path===P061_INHERITED_TOOL.path),
  P061_INHERITED_TOOL,'inherited compiler bytes pinned in host-v10');
 return {schemaVersion:base.schemaVersion,kind:base.kind,contract:base.contract,
  predecessor:base.predecessor,predecessorHost:HOST_V10,files,
  transitions:base.transitions,successorTransitions:base.successorTransitions,
  acceptanceEffect:base.acceptanceEffect};
}

function assertLocal(root){
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering host only');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real AWS source root');
 for(const directory of [root,SOURCE_ROOT]){
  assert.equal(fs.realpathSync(directory),directory,`physical directory: ${directory}`);
  assert(fs.lstatSync(directory).isDirectory()&&!fs.lstatSync(directory).isSymbolicLink(),
   `ordinary directory: ${directory}`);
 }
}

/** Verify inherited bytes first; --plan may report pending P061 inputs. */
export async function buildP061HostV11Plan({root=ROOT}={}){
 assertLocal(root);
 const base=readJsonPin(root,HOST_V10);
 for(const pin of base.files)readPin(root,pin);
 for(const item of [...base.transitions,...base.successorTransitions]){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,
   'historical transition shape');
  readPin(root,item.current);readPin(root,item.snapshot);
 }
 const {nmsL02P060AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p060-admission.server.ts');
 const predecessor=nmsL02P060AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===59&&
  predecessor.descriptor.glossary.length===20,'real registered P060 predecessor');
 const expected=[...Array.from({length:52},(_,index)=>index+1),55,56,57,58,59,60,63]
  .map(number=>`shared-nms002-l02-p${String(number).padStart(3,'0')}`);
 assert.deepStrictEqual(predecessor.descriptor.pages
  .filter(page=>page.rendererAvailability.kind==='registered').map(page=>page.animationId),
  expected,'exact 59-page predecessor order');
 assert(predecessor.descriptor.pages[60].animationId==='shared-nms002-l02-p061'&&
  predecessor.descriptor.pages[60].rendererAvailability.kind==='unavailable',
  'P061 not previously registered');
 const pending=[P061_RUN.path,...P061_HOST_V11_ADDITIONS]
  .filter(relative=>!fs.existsSync(path.join(root,relative)));
 if(pending.length)return {status:'NMS_L02_HOST_V11_WAITING_INPUTS',root,baseHost:HOST_V10,
  pendingPaths:pending,retainedFileCount:base.files.length,
  retainedTransitionCount:base.transitions.length,
  retainedSuccessorTransitionCount:base.successorTransitions.length,
  registeredPredecessorCount:59,registrationEffect:'none',acceptanceEffect:'none'};
 const run=readJsonPin(root,P061_RUN);
 for(const dependency of run.sharedDependencies)readPin(root,dependency);
 const additionPins=P061_HOST_V11_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP061HostV11(base,additionPins,run);
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {status:'NMS_L02_HOST_V11_PLAN_ONLY',root,host,bytes,
  hostPin:{path:HOST_V11_PATH,bytes:bytes.length,sha256:sha256(bytes)},
  baseHost:HOST_V10,run:P061_RUN,addedFiles:additionPins,
  retainedFileCount:base.files.length,retainedTransitionCount:base.transitions.length,
  retainedSuccessorTransitionCount:base.successorTransitions.length,
  registeredPredecessorCount:59,registrationEffect:'none',acceptanceEffect:'none'};
}

export async function sealP061HostV11(plan){
 assert(plan?.status==='NMS_L02_HOST_V11_PLAN_ONLY'&&
  plan.hostPin?.path===HOST_V11_PATH&&Buffer.isBuffer(plan.bytes),
  'complete reviewed host-v11 plan');
 const file=path.join(plan.root,HOST_V11_PATH);
 assert(!fs.existsSync(file),'host-v11 already sealed');
 const current=await buildP061HostV11Plan({root:plan.root});
 assert.deepStrictEqual(current.hostPin,plan.hostPin,'unchanged host-v11 plan');
 assert.deepStrictEqual(current.bytes,plan.bytes,'unchanged host-v11 document bytes');
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V11_PATH),plan.hostPin,'sealed host-v11 exact bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V11_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,registeredPredecessorCount:59,
  files:plan.host.files.length,historicalTransitions:plan.host.transitions.length,
  successorTransitions:plan.host.successorTransitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=await buildP061HostV11Plan();
  const result=process.argv[2]==='--seal'?await sealP061HostV11(plan):
   plan.status==='NMS_L02_HOST_V11_WAITING_INPUTS'?plan:
   {status:plan.status,host:plan.hostPin,baseHost:plan.baseHost,
    run:plan.run,retainedFiles:plan.retainedFileCount,addedFiles:plan.addedFiles,
    historicalTransitions:plan.retainedTransitionCount,
    successorTransitions:plan.retainedSuccessorTransitionCount,
    registeredPredecessorCount:plan.registeredPredecessorCount,
    registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
