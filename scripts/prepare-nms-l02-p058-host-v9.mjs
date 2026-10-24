#!/usr/bin/env node
/** Reviewed P058 host repair. Historical witness transitions remain unchanged;
 * successorTransitions bind two later host-v8 inputs to preserved old bytes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const HOST_V8=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v8.json',
 bytes:22136,sha256:'c81510bfa10da39de4f38d9655ca7f4baa3a99b643a3c2adb96ee0edbda96f5e'});
export const HOST_V9_PATH='catalog/nms-l02-admission-v1/host-v9.json';
const WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});
export const P058_REPAIRS=Object.freeze([
 Object.freeze({path:'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p058/page.tsx',
  snapshot:'output/nms-l02-p058-product-20260927/admission/host-v8-predecessor/page.tsx',
  reason:'Restore the P056 host button stylesheet for P058 adjacent lesson navigation.'}),
 Object.freeze({path:'apps/web/lib/nms-l02-p058-admission.server.ts',
  snapshot:'output/nms-l02-p058-product-20260927/admission/host-v8-predecessor/admission.server.ts',
  reason:'Bind the P058 local admission reader to the reviewed successor host-v9.'}),
]);
export const P058_HOST_V9_ADDITIONS=Object.freeze([
 'scripts/prepare-nms-l02-p058-host-v9.mjs',
 'scripts/prepare-nms-l02-p058-host-v9.test.mjs',
]);
const ROUTE=P058_REPAIRS[0].path;
const READER=P058_REPAIRS[1].path;
const ROUTE_ANCHOR="import '@/components/nms-l02-p057-host-v1.css';\n";
const ROUTE_INSERT="import '@/components/nms-l02-p056-host-v1.css';\n";
const READER_OLD="'catalog/nms-l02-admission-v1/host-v8.json'";
const READER_NEW="'catalog/nms-l02-admission-v1/host-v9.json'";
const ACTIVATION='apps/web/lib/nms-l02-p058-admission-activation.ts';
const SHA=/^[a-f0-9]{64}$/u;
const samePin=(a,b)=>a?.path===b?.path&&a?.bytes===b?.bytes&&a?.sha256===b?.sha256;
const validPin=pin=>pin&&typeof pin.path==='string'&&Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&SHA.test(pin.sha256);
const occurrences=(text,needle)=>text.split(needle).length-1;

/** Only these exact textual repairs are permitted between preserved v8 and
 * current files. No normalization, whitespace, or unrelated edits. */
export function assertExactP058HostRepair(pathName,oldBytes,currentBytes){
 assert(Buffer.isBuffer(oldBytes)&&Buffer.isBuffer(currentBytes),'stable repair byte buffers');
 const old=oldBytes.toString('utf8');
 let expected;
 if(pathName===ROUTE){
  assert.equal(occurrences(old,ROUTE_ANCHOR),1,'one P057 style anchor in v8 route');
  assert.equal(occurrences(old,ROUTE_INSERT),0,'P056 style absent from v8 route');
  expected=old.replace(ROUTE_ANCHOR,ROUTE_INSERT+ROUTE_ANCHOR);
 }else if(pathName===READER){
  assert.equal(occurrences(old,READER_OLD),1,'one v8 binding in predecessor reader');
  assert.equal(occurrences(old,READER_NEW),0,'v9 binding absent from predecessor reader');
  expected=old.replace(READER_OLD,READER_NEW);
 }else throw Error(`unreviewed P058 host repair: ${pathName}`);
 assert.deepStrictEqual(currentBytes,Buffer.from(expected,'utf8'),`only reviewed delta: ${pathName}`);
}

export function composeP058HostV9(base,successorTransitions,additionPins){
 assert.equal(sha256(Buffer.from(JSON.stringify(base,null,2)+'\n')),HOST_V8.sha256,
  'exact sealed host-v8 document');
 assert(base.schemaVersion===1&&base.kind==='nms-l02-successor-host-v1'&&
  base.contract==='nms-l02-source-bound-host-v1'&&base.acceptanceEffect==='none',
  'frozen host contract and acceptance');
 assert.deepStrictEqual(base.predecessor,WITNESS,'exact original witness');
 assert(base.files?.length===93&&base.transitions?.length===5,'sealed v8 closure shape');
 assert.deepStrictEqual(uniquePins(base.files),base.files,'canonical host-v8 pins');
 assert(Array.isArray(successorTransitions)&&successorTransitions.length===P058_REPAIRS.length,
  'exact two successor repairs');
 assert.deepStrictEqual(successorTransitions.map(item=>item.original?.path),P058_REPAIRS.map(item=>item.path),
  'exact successor repair membership and order');
 const old=new Map(base.files.map(pin=>[pin.path,pin]));
 for(let index=0;index<P058_REPAIRS.length;index++){
  const repair=P058_REPAIRS[index],item=successorTransitions[index];
  assert.deepStrictEqual(item.original,old.get(repair.path),`sealed v8 original: ${repair.path}`);
  assert(item.snapshot?.path===repair.snapshot&&item.snapshot.bytes===item.original.bytes&&
   item.snapshot.sha256===item.original.sha256,`preserved old bytes: ${repair.path}`);
  assert(validPin(item.current)&&item.current.path===repair.path&&!samePin(item.current,item.original),
   `changed current host input: ${repair.path}`);
  assert.equal(item.reason,repair.reason,`exact repair reason: ${repair.path}`);
 }
 assert(Array.isArray(additionPins)&&additionPins.length===P058_HOST_V9_ADDITIONS.length,
  'exact new producer and test');
 assert.deepStrictEqual(additionPins.map(pin=>pin.path).sort((a,b)=>a.localeCompare(b)),
  [...P058_HOST_V9_ADDITIONS].sort((a,b)=>a.localeCompare(b)),'exact host-v9 additions');
 for(const pin of additionPins)
  assert(validPin(pin)&&!old.has(pin.path),`new ordinary host-v9 input: ${pin.path}`);
 const replacements=new Map(successorTransitions.map(item=>[item.current.path,item.current]));
 const files=uniquePins([...base.files.map(pin=>replacements.get(pin.path)??pin),...additionPins]);
 assert.equal(files.length,base.files.length+additionPins.length,'append-only membership with two reviewed replacements');
 for(const pin of base.files){
  const now=files.find(item=>item.path===pin.path);
  assert(now&&samePin(now,replacements.get(pin.path)??pin),`retained or reviewed v8 pin: ${pin.path}`);
 }
 assert(!files.some(pin=>pin.path===ACTIVATION),'activation excluded from host closure');
 return {schemaVersion:base.schemaVersion,kind:base.kind,contract:base.contract,
  predecessor:base.predecessor,predecessorHost:HOST_V8,files,transitions:base.transitions,
  successorTransitions,acceptanceEffect:base.acceptanceEffect};
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

/** Reads every retained current v8 input, preserved old snapshot, and exact
 * current delta before offering any host-v9 bytes. */
export async function buildP058HostV9Plan({root=ROOT}={}){
 assertLocal(root);
 const base=readJsonPin(root,HOST_V8);
 const repairPaths=new Set(P058_REPAIRS.map(item=>item.path));
 for(const pin of base.files)if(!repairPaths.has(pin.path))readPin(root,pin);
 for(const item of base.transitions){
  assert(item.original?.path===item.current?.path&&item.snapshot?.path,'historical transition shape');
  readPin(root,item.current);
  readPin(root,item.snapshot);
 }
 const successorTransitions=P058_REPAIRS.map(repair=>{
  const original=base.files.find(pin=>pin.path===repair.path);
  assert(original,`host-v8 owns repaired file: ${repair.path}`);
  const snapshot={...original,path:repair.snapshot};
  const oldBytes=readPin(root,snapshot);
  const current=pinFile(root,repair.path);
  const currentBytes=readPin(root,current);
  assertExactP058HostRepair(repair.path,oldBytes,currentBytes);
  return {original,current,snapshot,reason:repair.reason};
 });
 const additionPins=P058_HOST_V9_ADDITIONS.map(item=>pinFile(root,item));
 const host=composeP058HostV9(base,successorTransitions,additionPins);
 const {nmsL02P057AdmissionDescriptor}=await import('../apps/web/lib/nms-l02-p057-admission.server.ts');
 const predecessor=nmsL02P057AdmissionDescriptor();
 assert(predecessor.registered===true&&predecessor.descriptor.pages.length===64&&
  predecessor.descriptor.productBridge.registeredAnimationCount===57,
  'real registered P057 predecessor');
 const registered=predecessor.descriptor.pages.filter(page=>page.rendererAvailability.kind==='registered');
 const expectedRegistered=[...Array.from({length:52},(_,index)=>index+1),55,56,57,59,63]
  .map(number=>`shared-nms002-l02-p${String(number).padStart(3,'0')}`);
 assert.deepStrictEqual(registered.map(page=>page.animationId),expectedRegistered,
  'exact P057 registered predecessor order');
 const bytes=Buffer.from(JSON.stringify(host,null,2)+'\n');
 return {root,host,bytes,hostPin:{path:HOST_V9_PATH,bytes:bytes.length,sha256:sha256(bytes)},
  baseHost:HOST_V8,addedFiles:additionPins,successorTransitions,
  retainedFileCount:base.files.length,retainedTransitionCount:base.transitions.length,
  registeredPredecessorCount:57};
}

export async function sealP058HostV9(plan){
 assert(plan?.hostPin?.path===HOST_V9_PATH&&Buffer.isBuffer(plan.bytes),'reviewed host-v9 plan');
 const file=path.join(plan.root,HOST_V9_PATH);
 assert(!fs.existsSync(file),'host-v9 already sealed');
 const current=await buildP058HostV9Plan({root:plan.root});
 assert.deepStrictEqual(current.hostPin,plan.hostPin,'unchanged host-v9 plan');
 assert.deepStrictEqual(current.bytes,plan.bytes,'unchanged host-v9 document bytes');
 fs.writeFileSync(file,plan.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(plan.root,HOST_V9_PATH),plan.hostPin,'sealed host-v9 exact bytes');
 const state=verifyNmsL02Predecessor(plan.root,WITNESS,plan.hostPin);
 return {status:'NMS_L02_HOST_V9_SEALED',host:plan.hostPin,
  pages:state.descriptor.pages.length,registeredPredecessorCount:57,
  files:plan.host.files.length,historicalTransitions:plan.host.transitions.length,
  successorTransitions:plan.host.successorTransitions.length,
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--seal'].includes(process.argv[2]),'use --plan or --seal');
  const plan=await buildP058HostV9Plan();
  const result=process.argv[2]==='--seal'?await sealP058HostV9(plan):
   {status:'NMS_L02_HOST_V9_PLAN_ONLY',host:plan.hostPin,baseHost:plan.baseHost,
    retainedFiles:plan.retainedFileCount,addedFiles:plan.addedFiles,
    historicalTransitions:plan.retainedTransitionCount,successorTransitions:plan.successorTransitions,
    registeredPredecessorCount:plan.registeredPredecessorCount,
    registrationEffect:'none',acceptanceEffect:'none'};
  process.stdout.write(`${JSON.stringify(result)}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
