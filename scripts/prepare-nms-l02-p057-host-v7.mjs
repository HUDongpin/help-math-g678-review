#!/usr/bin/env node
/** Append-only P057 shared-host proposal. P057 page inputs have a separate
 * proof; this producer never edits host-v6 or activates the candidate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V6=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v6.json',
 bytes:16731,sha256:'d16a595ac797af45d6283ab77e563cdbe448010f6e180b4174e0ac5c6b412625'});
export const HOST_V7_PATH='catalog/nms-l02-admission-v1/host-v7.json';
export const P057_RUN=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p057-conditional-host-current-js-v1/run-manifest.json',
 bytes:30055,sha256:'6b83b4c5dcf1b2d137e6c0b1af1165702efbf690430558bec406e8715071d1b3'});
const WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});

/** Every addition is a shared-host input, including the two exact dependencies
 * named by P057's DOM run but absent from host-v6. */
export const P057_HOST_V7_ADDITIONS=Object.freeze([
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p057/page.tsx',
 'apps/web/app/migration-assets/nms-l02-p057/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-p057-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p057-host-v1.css',
 'apps/web/lib/nms-l02-p057-admission.server.ts',
 'apps/web/lib/nms-l02-p057-assets.server.ts',
 'apps/web/lib/nms-l02-p057-candidate-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p057-candidate-descriptor-v1.test.ts',
 'apps/web/lib/nms-l02-p057-production-stub.tsx',
 'apps/web/tests/nms-l02-p057-assets.server-test.ts',
 'scripts/build-g4-l3-embedded-audio-archive.mjs',
 'scripts/generate-nms-l02-p057-host-v1.mjs',
 'scripts/prepare-nms-l02-p057-host-v7.mjs',
 'scripts/prepare-nms-l02-p057-host-v7.test.mjs',
 'scripts/private-current-js-registry.mjs',
]);
const PAGE_ONLY=new Set([
 'apps/web/components/nms-l02-p057-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p057-descriptor-extension.ts',
 'lib/nms-l02-p057-admission-semantics.mjs',
 'packages/demos/src/modules/shared-nms002-l02-p057.tsx',
 'scripts/prepare-nms-l02-p057-admission.mjs',
 P057_RUN.path,
]);
const ACTIVATION='apps/web/lib/nms-l02-p057-admission-activation.ts';
const SHA=/^[a-f0-9]{64}$/u;
const validPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&SHA.test(pin.sha256);
const samePin=(a,b)=>a.path===b.path&&a.bytes===b.bytes&&a.sha256===b.sha256;

export function composeP057HostV7(base,additionPins,run){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V6.sha256,
  'exact frozen host-v6 document');
 assert(base.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1','frozen host contract');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact executed 54-page predecessor');
 assert(base.acceptanceEffect==='none'&&Array.isArray(base.files)&&Array.isArray(base.transitions),
  'host-v6 acceptance and closure');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v6 pins');
 assert(run?.schemaVersion===1&&run.animationId==='shared-nms002-l02-p057'&&
  run.method==='source-locked-public-tool-IR-and-maintained-DOM-integration'&&
  run.inputs?.length===113&&run.outputs?.length===8&&run.sharedDependencies?.length===7,
  'exact P057 conditional DOM run shape');
 assert(Object.values(run.acceptanceEffects).every(value=>value===false),
  'P057 DOM run has no acceptance effect');
 assert(Array.isArray(additionPins)&&additionPins.length===P057_HOST_V7_ADDITIONS.length,
  'complete P057 shared-host additions');
 assert.deepStrictEqual(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)),
  [...P057_HOST_V7_ADDITIONS].sort((a,b)=>a.localeCompare(b)),
  'exact P057 shared-host addition membership');
 const old=new Set(base.files.map(pin=>pin.path));
 const transitioned=new Set(base.transitions.map(item=>item.current.path));
 for(const pin of additionPins){
  assert(validPin(pin)&&!old.has(pin.path)&&!transitioned.has(pin.path),
   `new ordinary shared-host input: ${pin.path}`);
 }
 const files=uniquePins([...base.files,...additionPins]);
 assert(files.length===base.files.length+additionPins.length,'append-only shared-host files');
 for(const pin of base.files)
  assert(files.some(candidate=>samePin(candidate,pin)),`preserve host-v6 pin: ${pin.path}`);
 const hostPaths=new Set(files.map(pin=>pin.path));
 for(const pathName of [...PAGE_ONLY,ACTIVATION])
  assert(!hostPaths.has(pathName),`page-owned or activation input excluded: ${pathName}`);
 const pagePaths=[...run.inputs,...run.outputs].map(pin=>pin.path);
 assert(pagePaths.every(pathName=>!hostPaths.has(pathName)),
  'P057 DOM page input/output cannot enter host closure');
 for(const dependency of run.sharedDependencies){
  const actual=files.find(pin=>pin.path===dependency.path);
  assert(actual&&samePin(actual,dependency),`exact shared DOM dependency: ${dependency.path}`);
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

/** Builds a reviewable plan without writing host-v7. P056's current admission
 * reader must execute against the real 56-page registry before planning P057. */
export async function buildP057HostV7Plan({root=ROOT}={}){
 assertLocal(root);
 readPin(root,HOST_V6);
 const base=readJsonPin(root,HOST_V6);
 for(const pin of base.files)readPin(root,pin);
 for(const item of base.transitions){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,
   'reviewed old transition shape');
  readPin(root,item.current);
  readPin(root,item.snapshot);
 }
 const run=readJsonPin(root,P057_RUN);
 for(const dependency of run.sharedDependencies)readPin(root,dependency);
 const additionPins=P057_HOST_V7_ADDITIONS.map(item=>pinFile(root,item));
 const host=composeP057HostV7(base,additionPins,run);
 const {nmsL02P056AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p056-admission.server.ts');
 const predecessor=nmsL02P056AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===56,
  'actual registered P056 predecessor');
 const registered=predecessor.descriptor.pages.filter(page=>page.rendererAvailability.kind==='registered');
 const expectedRegistered=[...Array.from({length:52},(_,index)=>index+1),55,56,59,63]
  .map(number=>`shared-nms002-l02-p${String(number).padStart(3,'0')}`);
 assert.deepStrictEqual(registered.map(page=>page.animationId),expectedRegistered,
  'exact 56-page registered P056 predecessor order');
 assert(
  predecessor.descriptor.pages[54].animationId==='shared-nms002-l02-p055'&&
  predecessor.descriptor.pages[54].rendererAvailability.kind==='registered'&&
  predecessor.descriptor.pages[55].animationId==='shared-nms002-l02-p056'&&
  predecessor.descriptor.pages[55].rendererAvailability.kind==='registered'&&
  predecessor.descriptor.pages[56].animationId==='shared-nms002-l02-p057'&&
  predecessor.descriptor.pages[56].rendererAvailability.kind==='unavailable',
  'retained P055/P056 proof and unregistered P057 placement');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V7_PATH,bytes:bytes.length,sha256:sha256(bytes)},
  baseHost:HOST_V6,run:P057_RUN,addedFiles:additionPins,
  retainedFileCount:base.files.length,retainedTransitionCount:base.transitions.length,
  registeredPredecessorCount:56};
}

export async function sealP057HostV7(plan){
 assert(plan?.hostPin?.path===HOST_V7_PATH&&Buffer.isBuffer(plan.bytes),
  'reviewed host-v7 plan');
 const file=path.join(plan.root,HOST_V7_PATH);
 assert(!fs.existsSync(file),'host-v7 already sealed');
 const current=await buildP057HostV7Plan({root:plan.root});
 assert.deepStrictEqual(current.hostPin,plan.hostPin,'unchanged complete host-v7 plan');
 assert.deepStrictEqual(plan.bytes,current.bytes,'unchanged host-v7 document bytes');
 verifyNmsL02Predecessor(plan.root,WITNESS,HOST_V6);
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V7_PATH),plan.hostPin,'sealed host-v7 exact bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V7_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,registeredPredecessorCount:56,
  files:plan.host.files.length,transitions:plan.host.transitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=await buildP057HostV7Plan();
  const result=process.argv[2]==='--seal'?await sealP057HostV7(plan):
   {status:'NMS_L02_HOST_V7_PLAN_ONLY',host:plan.hostPin,
    baseHost:plan.baseHost,run:plan.run,retainedFiles:plan.retainedFileCount,
    addedFiles:plan.addedFiles,transitions:plan.retainedTransitionCount,
    registeredPredecessorCount:plan.registeredPredecessorCount,
    registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
