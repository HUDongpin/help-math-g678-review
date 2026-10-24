#!/usr/bin/env node
/** Reviewed P061 host repair. The sealed v11 host and page proof are retained;
 * two exact host-input changes become separate successor transitions. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V11=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v11.json',
 bytes:29344,sha256:'ea52b50a217182eadf5f6c076d40ee5ffb95fccb082dd0f45839d425ccd4183b'});
export const HOST_V12_PATH='catalog/nms-l02-admission-v1/host-v12.json';
const WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});
const P061_RUN=Object.freeze({
 path:'work/g678-shared-page-factory/g678-nms-l02-p061-conditional-host-current-js-v1/run-manifest.json',
 bytes:55412,sha256:'59baa562d3faa34791c09bd18ba14de40b256a3dd33b5d018b5427105019b221'});
const P061_PROOF=Object.freeze({
 path:'work/g678-workflow/candidates/shared-nms002-l02-p061-v1.json',
 bytes:102913,sha256:'7e49a257ec06811fb45174752c96f5f5acda8071ed008de31b6951d4db31a094'});
export const P061_HOST_V12_REPAIRS=Object.freeze([
 Object.freeze({path:'apps/web/lib/nms-l02-p061-admission.server.ts',
  snapshot:'output/nms-l02-p061-product-20260927/admission/host-v11-predecessor/admission.server.ts',
  reason:'Bind the P061 local admission reader to the reviewed successor host-v12.'}),
 Object.freeze({path:'apps/web/tests/nms-l02-p061-admission.server-test.ts',
  snapshot:'output/nms-l02-p061-product-20260927/admission/host-v11-predecessor/admission.server-test.ts',
  reason:'Use a typed mutable environment view for test-only NODE_ENV assignments.'}),
]);
export const P061_HOST_V12_ADDITIONS=Object.freeze([
 'scripts/prepare-nms-l02-p061-host-v12.mjs',
 'scripts/prepare-nms-l02-p061-host-v12.test.mjs',
]);
const READER=P061_HOST_V12_REPAIRS[0].path;
const TEST=P061_HOST_V12_REPAIRS[1].path;
const ACTIVATION='apps/web/lib/nms-l02-p061-admission-activation.ts';
const SHA=/^[a-f0-9]{64}$/u;
const samePin=(a,b)=>a?.path===b?.path&&a?.bytes===b?.bytes&&a?.sha256===b?.sha256;
const validPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&
 pin.bytes>0&&SHA.test(pin.sha256);
const occurrences=(text,needle)=>text.split(needle).length-1;
function replaceOnce(text,before,after){
 assert.equal(occurrences(text,before),1,`one reviewed predecessor anchor: ${before}`);
 return text.replace(before,after);
}

/** Derive the complete allowed current bytes from preserved v11 bytes. */
export function assertExactP061HostV12Repair(pathName,oldBytes,currentBytes){
 assert(Buffer.isBuffer(oldBytes)&&Buffer.isBuffer(currentBytes),'stable repair byte buffers');
 let expected=oldBytes.toString('utf8');
 if(pathName===READER){
  expected=replaceOnce(expected,
   "activation.host.path!=='catalog/nms-l02-admission-v1/host-v11.json'",
   "activation.host.path!=='catalog/nms-l02-admission-v1/host-v12.json'");
 }else if(pathName===TEST){
  for(const [before,after] of [
   ["test('P061 rejects production and malformed activation before reading proof',()=>{\n",
    "test('P061 rejects production and malformed activation before reading proof',()=>{\n const env=process.env as Record<string,string|undefined>;\n"],
   ['const oldNode=process.env.NODE_ENV;','const oldNode=env.NODE_ENV;'],
   ["process.env.NODE_ENV='production';","env.NODE_ENV='production';"],
   ["process.env.NODE_ENV='test';","env.NODE_ENV='test';"],
   ['delete process.env.NODE_ENV;','delete env.NODE_ENV;'],
   ['else process.env.NODE_ENV=oldNode;','else env.NODE_ENV=oldNode;'],
  ])expected=replaceOnce(expected,before,after);
 }else throw Error(`unreviewed P061 host-v12 repair: ${pathName}`);
 assert.deepStrictEqual(currentBytes,Buffer.from(expected,'utf8'),
  `only reviewed delta: ${pathName}`);
}

export function composeP061HostV12(base,successorRepairs,additionPins){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V11.sha256,
  'exact sealed host-v11 document');
 assert(base.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1'&&base.acceptanceEffect==='none',
  'unchanged NMS host contract and acceptance');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact original witness');
 assert(base.files?.length===122&&base.transitions?.length===5&&
  base.successorTransitions?.length===2,'sealed host-v11 closure shape');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v11 pins');
 assert(Array.isArray(successorRepairs)&&successorRepairs.length===2&&
  successorRepairs.every((item,index)=>item.original?.path===P061_HOST_V12_REPAIRS[index].path),
  'two exact successor repair paths and order');
 const old=new Map(base.files.map(pin=>[pin.path,pin]));
 for(let index=0;index<P061_HOST_V12_REPAIRS.length;index++){
  const repair=P061_HOST_V12_REPAIRS[index],item=successorRepairs[index];
  assert.deepStrictEqual(item.original,old.get(repair.path),`sealed v11 original: ${repair.path}`);
  assert(item.snapshot?.path===repair.snapshot&&
   item.snapshot.bytes===item.original.bytes&&item.snapshot.sha256===item.original.sha256,
   `preserved original bytes: ${repair.path}`);
  assert(validPin(item.current)&&item.current.path===repair.path&&
   !samePin(item.current,item.original),`changed current host input: ${repair.path}`);
  assert.equal(item.reason,repair.reason,`reviewed successor reason: ${repair.path}`);
 }
 assert(Array.isArray(additionPins)&&additionPins.length===2&&
  JSON.stringify(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)))===
  JSON.stringify([...P061_HOST_V12_ADDITIONS].sort((a,b)=>a.localeCompare(b))),
  'exact new composer and test membership');
 for(const pin of additionPins)
  assert(validPin(pin)&&!old.has(pin.path),`new ordinary host-v12 input: ${pin.path}`);
 const replacements=new Map(successorRepairs.map(item=>[item.current.path,item.current]));
 const files=uniquePins([...base.files.map(pin=>replacements.get(pin.path)??pin),...additionPins]);
 assert.equal(files.length,124,'122 inherited memberships plus two new inputs');
 for(const pin of base.files)
  assert.deepStrictEqual(files.find(item=>item.path===pin.path),replacements.get(pin.path)??pin,
   `retained or reviewed v11 pin: ${pin.path}`);
 assert(!files.some(pin=>pin.path===ACTIVATION),'mutable activation excluded');
 return {schemaVersion:base.schemaVersion,kind:base.kind,contract:base.contract,
  predecessor:base.predecessor,predecessorHost:HOST_V11,files,
  transitions:base.transitions,
  successorTransitions:[...base.successorTransitions,...successorRepairs],
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

export async function buildP061HostV12Plan({root=ROOT}={}){
 assertLocal(root);
 const base=readJsonPin(root,HOST_V11);
 const repairPaths=new Set(P061_HOST_V12_REPAIRS.map(item=>item.path));
 for(const pin of base.files)if(!repairPaths.has(pin.path))readPin(root,pin);
 for(const item of [...base.transitions,...base.successorTransitions]){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,
   'retained transition shape');
  readPin(root,item.current);readPin(root,item.snapshot);
 }
 const successorRepairs=P061_HOST_V12_REPAIRS.map(repair=>{
  const original=base.files.find(pin=>pin.path===repair.path);
  assert(original,`host-v11 owns repaired input: ${repair.path}`);
  const snapshot={...original,path:repair.snapshot};
  const oldBytes=readPin(root,snapshot);
  const current=pinFile(root,repair.path),currentBytes=readPin(root,current);
  assertExactP061HostV12Repair(repair.path,oldBytes,currentBytes);
  return {original,current,snapshot,reason:repair.reason};
 });
 const run=readJsonPin(root,P061_RUN),proof=readJsonPin(root,P061_PROOF);
 assert(run.inputs.length===179&&run.outputs.length===22,'frozen P061 DOM run retained');
 assert(proof.kind==='nms-l02-page-proof-v1'&&proof.files.length===190,
  'frozen P061 page proof retained');
 const pagePaths=new Set(proof.files.map(pin=>pin.path));
 for(const relative of [...repairPaths,...P061_HOST_V12_ADDITIONS])
  assert(!pagePaths.has(relative),`host repair excluded from page proof: ${relative}`);
 const additions=P061_HOST_V12_ADDITIONS.map(relative=>pinFile(root,relative));
 const host=composeP061HostV12(base,successorRepairs,additions);
 const {nmsL02P060AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p060-admission.server.ts');
 const predecessor=nmsL02P060AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===59&&
  predecessor.descriptor.glossary.length===20,'actual 59-page P060 predecessor');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V12_PATH,bytes:bytes.length,sha256:sha256(bytes)},
  baseHost:HOST_V11,pageProof:P061_PROOF,run:P061_RUN,addedFiles:additions,successorRepairs,
  retainedFileCount:base.files.length,retainedTransitionCount:base.transitions.length,
  retainedSuccessorTransitionCount:base.successorTransitions.length,
  registeredPredecessorCount:59,registrationEffect:'none',acceptanceEffect:'none'};
}

export async function sealP061HostV12(plan){
 assert(plan?.hostPin?.path===HOST_V12_PATH&&Buffer.isBuffer(plan.bytes),
  'complete reviewed host-v12 plan');
 const file=path.join(plan.root,HOST_V12_PATH);
 assert(!fs.existsSync(file),'host-v12 already sealed');
 const current=await buildP061HostV12Plan({root:plan.root});
 assert.deepStrictEqual(current.hostPin,plan.hostPin,'unchanged host-v12 plan');
 assert.deepStrictEqual(current.bytes,plan.bytes,'unchanged host-v12 bytes');
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V12_PATH),plan.hostPin,'sealed host-v12 bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V12_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,files:plan.host.files.length,
  historicalTransitions:plan.host.transitions.length,
  successorTransitions:plan.host.successorTransitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),
   'use --plan or --seal');
  const plan=await buildP061HostV12Plan();
  const result=process.argv[2]==='--seal'?await sealP061HostV12(plan):
   {status:'NMS_L02_HOST_V12_PLAN_ONLY',host:plan.hostPin,baseHost:plan.baseHost,
    pageProof:plan.pageProof,run:plan.run,retainedFiles:plan.retainedFileCount,
    addedFiles:plan.addedFiles,historicalTransitions:plan.retainedTransitionCount,
    retainedSuccessorTransitions:plan.retainedSuccessorTransitionCount,
    successorRepairs:plan.successorRepairs,
    registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
