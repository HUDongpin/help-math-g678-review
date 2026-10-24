#!/usr/bin/env node
/** Append-only P058 shared-host proposal. The P058 page proof and activation
 * are separate; --plan does not write host-v8 or change registration. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V7=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v7.json',
 bytes:19519,sha256:'9e905c5720097b52c3856cd2589a628a58edac1aad84234a0bdc088f15c01d45'});
export const HOST_V8_PATH='catalog/nms-l02-admission-v1/host-v8.json';
export const P058_RUN=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p058-conditional-host-current-js-v1/run-manifest.json',
 bytes:20823,sha256:'105a0088f89562e38ec91920ac01b0b8bbd804222f04b08d2d43f0adedc388ce'});
const WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});

/** The seven dependencies of P058's DOM run are already pinned in host-v7. */
export const P058_HOST_V8_ADDITIONS=Object.freeze([
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p058/page.tsx',
 'apps/web/app/migration-assets/nms-l02-p058/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-p058-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p058-host-v1.css',
 'apps/web/lib/nms-l02-p058-admission.server.ts',
 'apps/web/lib/nms-l02-p058-assets.server.ts',
 'apps/web/lib/nms-l02-p058-candidate-descriptor-v1.test.ts',
 'apps/web/lib/nms-l02-p058-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p058-production-stub.tsx',
 'apps/web/tests/nms-l02-p058-assets.server-test.ts',
 'apps/web/tests/nms-l02-p058-runtime-config.test.ts',
 'scripts/generate-nms-l02-p058-host-v1.mjs',
 'scripts/prepare-nms-l02-p058-host-v8.mjs',
 'scripts/prepare-nms-l02-p058-host-v8.test.mjs',
]);
const PAGE_ONLY=new Set([
 'apps/web/components/nms-l02-p058-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p058-descriptor-extension.ts',
 'apps/web/tests/nms-l02-p058-descriptor-extension.test.ts',
 'lib/nms-l02-p058-admission-semantics.mjs',
 'packages/demos/src/modules/shared-nms002-l02-p058.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p058.ts',
 'scripts/prepare-nms-l02-p058-admission.mjs',
 'scripts/prepare-nms-l02-p058-admission.test.mjs',
 P058_RUN.path,
]);
const ACTIVATION='apps/web/lib/nms-l02-p058-admission-activation.ts';
const SHA=/^[a-f0-9]{64}$/u;
const validPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&SHA.test(pin.sha256);
const samePin=(a,b)=>a.path===b.path&&a.bytes===b.bytes&&a.sha256===b.sha256;

export function composeP058HostV8(base,additionPins,run){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V7.sha256,
  'exact frozen host-v7 document');
 assert(base.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1','frozen host contract');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact executed 54-page predecessor');
 assert(base.acceptanceEffect==='none'&&Array.isArray(base.files)&&Array.isArray(base.transitions),
  'host-v7 acceptance and closure');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v7 pins');
 assert(run?.schemaVersion===1&&run.animationId==='shared-nms002-l02-p058'&&
  run.method==='source-locked-public-tool-IR-and-maintained-DOM-integration'&&
  run.inputs?.length===57&&run.outputs?.length===13&&run.sharedDependencies?.length===7,
  'exact P058 conditional DOM run shape');
 assert(Object.values(run.acceptanceEffects).every(value=>value===false),
  'P058 DOM run has no acceptance effect');
 assert(Array.isArray(additionPins)&&additionPins.length===P058_HOST_V8_ADDITIONS.length,
  'complete P058 shared-host additions');
 assert.deepStrictEqual(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)),
  [...P058_HOST_V8_ADDITIONS].sort((a,b)=>a.localeCompare(b)),
  'exact P058 shared-host addition membership');
 const old=new Set(base.files.map(pin=>pin.path));
 const transitioned=new Set(base.transitions.map(item=>item.current.path));
 for(const pin of additionPins){
  assert(validPin(pin)&&!old.has(pin.path)&&!transitioned.has(pin.path),
   `new ordinary shared-host input: ${pin.path}`);
 }
 const files=uniquePins([...base.files,...additionPins]);
 assert(files.length===base.files.length+additionPins.length,'append-only shared-host files');
 for(const pin of base.files)
  assert(files.some(candidate=>samePin(candidate,pin)),`preserve host-v7 pin: ${pin.path}`);
 const hostPaths=new Set(files.map(pin=>pin.path));
 for(const pathName of [...PAGE_ONLY,ACTIVATION])
  assert(!hostPaths.has(pathName),`page-owned or activation input excluded: ${pathName}`);
 assert([...run.inputs,...run.outputs].every(pin=>!hostPaths.has(pin.path)),
  'P058 DOM page input/output cannot enter host closure');
 for(const dependency of run.sharedDependencies){
  const actual=base.files.find(pin=>pin.path===dependency.path);
  assert(actual&&samePin(actual,dependency),`exact pre-existing shared DOM dependency: ${dependency.path}`);
 }
 return {schemaVersion:base.schemaVersion,kind:base.kind,contract:base.contract,
  predecessor:base.predecessor,files,transitions:base.transitions,
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

/** Builds a reviewable plan without writing host-v8. */
export async function buildP058HostV8Plan({root=ROOT}={}){
 assertLocal(root);
 readPin(root,HOST_V7);
 const base=readJsonPin(root,HOST_V7);
 for(const pin of base.files)readPin(root,pin);
 for(const item of base.transitions){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,
   'reviewed old transition shape');
  readPin(root,item.current);
  readPin(root,item.snapshot);
 }
 const run=readJsonPin(root,P058_RUN);
 for(const dependency of run.sharedDependencies)readPin(root,dependency);
 const additionPins=P058_HOST_V8_ADDITIONS.map(item=>pinFile(root,item));
 const host=composeP058HostV8(base,additionPins,run);
 const {nmsL02P057AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p057-admission.server.ts');
 const predecessor=nmsL02P057AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===57,
  'actual registered P057 predecessor');
 const registered=predecessor.descriptor.pages.filter(page=>page.rendererAvailability.kind==='registered');
 const expectedRegistered=[...Array.from({length:52},(_,index)=>index+1),55,56,57,59,63]
  .map(number=>`shared-nms002-l02-p${String(number).padStart(3,'0')}`);
 assert.deepStrictEqual(registered.map(page=>page.animationId),expectedRegistered,
  'exact 57-page registered P057 predecessor order');
 assert(
  predecessor.descriptor.pages[54].animationId==='shared-nms002-l02-p055'&&
  predecessor.descriptor.pages[54].rendererAvailability.kind==='registered'&&
  predecessor.descriptor.pages[55].animationId==='shared-nms002-l02-p056'&&
  predecessor.descriptor.pages[55].rendererAvailability.kind==='registered'&&
  predecessor.descriptor.pages[56].animationId==='shared-nms002-l02-p057'&&
  predecessor.descriptor.pages[56].rendererAvailability.kind==='registered'&&
  predecessor.descriptor.pages[57].animationId==='shared-nms002-l02-p058'&&
  predecessor.descriptor.pages[57].rendererAvailability.kind==='unavailable',
  'retained P055/P056/P057 proof and unregistered P058 placement');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V8_PATH,bytes:bytes.length,sha256:sha256(bytes)},
  baseHost:HOST_V7,run:P058_RUN,addedFiles:additionPins,
  retainedFileCount:base.files.length,retainedTransitionCount:base.transitions.length,
  registeredPredecessorCount:57};
}

export async function sealP058HostV8(plan){
 assert(plan?.hostPin?.path===HOST_V8_PATH&&Buffer.isBuffer(plan.bytes),
  'reviewed host-v8 plan');
 const file=path.join(plan.root,HOST_V8_PATH);
 assert(!fs.existsSync(file),'host-v8 already sealed');
 const current=await buildP058HostV8Plan({root:plan.root});
 assert.deepStrictEqual(current.hostPin,plan.hostPin,'unchanged complete host-v8 plan');
 assert.deepStrictEqual(plan.bytes,current.bytes,'unchanged host-v8 document bytes');
 verifyNmsL02Predecessor(plan.root,WITNESS,HOST_V7);
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V8_PATH),plan.hostPin,'sealed host-v8 exact bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V8_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,registeredPredecessorCount:57,
  files:plan.host.files.length,transitions:plan.host.transitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=await buildP058HostV8Plan();
  const result=process.argv[2]==='--seal'?await sealP058HostV8(plan):
   {status:'NMS_L02_HOST_V8_PLAN_ONLY',host:plan.hostPin,
    baseHost:plan.baseHost,run:plan.run,retainedFiles:plan.retainedFileCount,
    addedFiles:plan.addedFiles,transitions:plan.retainedTransitionCount,
    registeredPredecessorCount:plan.registeredPredecessorCount,
    registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
