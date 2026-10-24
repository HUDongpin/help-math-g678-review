#!/usr/bin/env node
/** Fresh formal-route production denial. It retains the 560 reviewed product
 * paths, and adds the independently sealed P053 host/page closure. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readOrdinary,readPin,uniquePins} from '../lib/g678-admission-proof.mjs';
import {routes, inputClosure as productInputClosure,scanProductionBundles,
 FORBIDDEN_BUNDLE_MARKERS} from './check-nms-l02-p053-product-production-v2.mjs';
import {HOST_V16_PATH as P053_HOST_V16_PATH} from './prepare-nms-l02-p053-host-v16.mjs';
import {P053_PROOF_PATH} from '../lib/nms-l02-p053-proof-semantics-v1.mjs';
import {validateP053ReviewedProofClosure,P053_DOM_RUN,P053_DOM_MEMBER}
 from '../lib/nms-l02-p053-reviewed-seal-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ORIGIN='http://127.0.0.1:3332';
const BUILD_LINK='apps/web/.next-alg-p001-production-scan';
const BUILD_ROOT='/Volumes/American Dream/hudongpin/g678-p053-formal-build-output-20260928/next-output-v1';
const OUTPUT='output/nms-l02-p053-product-20260928/formal-production';
const BUILD_RECEIPT=`${OUTPUT}/build-receipt-v1.json`;
const ACTIVATION='apps/web/lib/nms-l02-p053-admission-activation.ts';
/** Literal independently sealed local page proof. */
export const P053_REVIEWED_PAGE=Object.freeze({
 path:P053_PROOF_PATH,bytes:80051,
 sha256:'604c34d8b52378019c949aefec1212e79c7e6300cab90ad0683f5fe3089645f0',
});
const P053_HOST_V16_REVIEWED=Object.freeze({path:P053_HOST_V16_PATH,bytes:47999,
 sha256:'1f0d2dbb09c4f641eb65267ae0d90f073477704bca94c75e6bacd67c01e73e7f'});
const HOST_SEAL='output/nms-l02-p053-product-20260928/admission/host-v16-seal-receipt.json';
const PAGE_PREPARE='output/nms-l02-p053-product-20260928/admission/page-prepare-receipt.json';
const FORMAL_INPUTS=Object.freeze([
 'scripts/probe-nms-l02-p053-production-isolation-v1.mjs',
 'scripts/probe-nms-l02-p053-production-isolation-v1.test.mjs',
 'scripts/build-and-probe-nms-l02-p053-production-v1.py',
 'scripts/prepare-nms-l02-p053-host-v16.mjs',
 'scripts/prepare-nms-l02-p053-host-v16.test.mjs',
 'scripts/prepare-nms-l02-p053-admission.mjs',
 'scripts/prepare-nms-l02-p053-admission.test.mjs',
 'apps/web/lib/nms-l02-p053-admission.server.ts',
 'apps/web/tests/nms-l02-p053-admission.server-test.ts',
 'apps/web/lib/nms-l02-p053-descriptor-extension.ts',
 'apps/web/tests/nms-l02-p053-descriptor-extension.test.ts',
 'lib/nms-l02-p053-proof-semantics-v1.mjs',
 'lib/nms-l02-p053-proof-semantics-v1.test.mjs',
 'lib/nms-l02-p053-reviewed-seal-v1.mjs',
 'lib/nms-l02-p053-reviewed-seal-v1.test.mjs',
 ACTIVATION,HOST_SEAL,PAGE_PREPARE,
]);
const FORMAL_MARKERS=Object.freeze([
 'P053_FORMAL_ADMISSION:', 'nms-l02-p053-admission.server',
 'nms-l02-p053-proof-semantics-v1', 'nms-l02-p053-reviewed-seal-v1',
]);

export function parseFormalActivation(text,reviewedHost=P053_HOST_V16_REVIEWED,
 reviewedPage=P053_REVIEWED_PAGE){
 const match=text.match(/export const NMS_L02_P053_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
 assert(match,'P053 formal activation parse');
 const activation=JSON.parse(match[1]);
 assert.equal(activation.schemaVersion,1);
 assert(['candidate','registered'].includes(activation.stage),'P053 stage candidate or registered');
 assert(reviewedHost,'literal independently reviewed host-v16 pin required');
 assert.deepEqual(activation.host,reviewedHost,'reviewed host-v16 identity');
 assert.equal(activation.host.path,P053_HOST_V16_PATH);
 assert(reviewedPage,'literal independently reviewed P053 page pin required');
 assert.deepEqual(activation.page,reviewedPage,'reviewed P053 page proof identity');
 assert.equal(activation.page.path,P053_PROOF_PATH);
 assert.equal(activation.predecessor?.path,
  'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json');
 return activation;
}

function physicalExternal(item){
 const absolute=path.join(item.root,item.pin.path);
 assert(path.isAbsolute(absolute),'absolute P053 external evidence');
 readPin(item.root,item.pin);
 return {...item.pin,path:absolute};
}

export function inputClosure(){
 const prior=productInputClosure();
 const activation=parseFormalActivation(readOrdinary(ROOT,ACTIVATION).toString('utf8'));
 for(const item of [activation.predecessor,activation.host,activation.page])readPin(ROOT,item);
 const host=readJsonPin(ROOT,activation.host),proof=readJsonPin(ROOT,activation.page);
 const hostSeal=readJsonPin(ROOT,pinFile(ROOT,HOST_SEAL));
 assert.equal(hostSeal.status,'NMS_L02_HOST_V16_SEALED');
 assert.deepEqual(hostSeal.host,activation.host);
 assert.equal(hostSeal.registrationEffect,'none');
 assert.equal(hostSeal.acceptanceEffect,'none');
 const pagePrepare=readJsonPin(ROOT,pinFile(ROOT,PAGE_PREPARE));
 assert.equal(pagePrepare.status,'P053_PREPARED_NOT_REGISTERED');
 assert.deepEqual(pagePrepare.proof,activation.page);
 assert.equal(pagePrepare.registrationEffect,'none');
 assert.equal(pagePrepare.acceptanceEffect,'none');
 assert.equal(host.kind,'nms-l02-successor-host-v1');
 assert.equal(host.contract,'nms-l02-source-bound-host-v1');
 assert.equal(host.files.length,212,'all P053 successor host files');
 assert.equal(host.predecessorHost?.path,'catalog/nms-l02-admission-v1/host-v15.json');
 assert.deepEqual(uniquePins(host.files),host.files);
 assert.equal(validateP053ReviewedProofClosure(ROOT,proof),true);
 assert.deepEqual(uniquePins(proof.files),proof.files);
 for(const item of [...host.files,...proof.files])readPin(ROOT,item);
 const run=readJsonPin(ROOT,P053_DOM_RUN),member=readJsonPin(ROOT,P053_DOM_MEMBER);
 assert.equal(run.inputs.length,41);
 assert.equal(run.externalEvidence.length,135);
 assert.deepEqual(member.inputs,run.inputs);
 for(const item of [...run.inputs,...run.outputs,...run.sharedDependencies])readPin(ROOT,item);
 const external=[...proof.external.map(physicalExternal),
  ...run.externalEvidence.map(item=>{
   const relative=item.path.startsWith(`${SOURCE_ROOT}/`)?path.relative(SOURCE_ROOT,item.path):path.basename(item.path);
   const root=item.path.startsWith(`${SOURCE_ROOT}/`)?SOURCE_ROOT:path.dirname(item.path);
   readPin(root,{...item,path:relative});return item;
  })];
 const local=[...prior.inputs,...FORMAL_INPUTS.map(item=>pinFile(ROOT,item)),
  activation.host,activation.page,...host.files,...proof.files,
  ...run.inputs,...run.outputs,...run.sharedDependencies,P053_DOM_RUN,P053_DOM_MEMBER];
 return {inputs:uniquePins([...local,...external]),activation,
  predecessorInputCount:prior.inputs.length,hostFileCount:host.files.length,
  pageFileCount:proof.files.length,domInputCount:run.inputs.length,
  externalFileCount:proof.external.length,domExternalCount:run.externalEvidence.length,
  routeCount:routes().length};
}

export function planProductionIsolation(){
 const closure=inputClosure();
 return {schemaVersion:1,kind:'nms-l02-p053-formal-production-plan-v1',
  origin:ORIGIN,buildRoot:BUILD_ROOT,buildReceipt:BUILD_RECEIPT,
  sourceModes:['unset','real-root'],routeCount:closure.routeCount,
  casesPerMode:closure.routeCount*4,expectedCases:closure.routeCount*8,
  ...closure,writesPerformed:false};
}

function binding(){
 const logical=path.join(ROOT,BUILD_LINK);
 assert(fs.lstatSync(logical).isSymbolicLink(),'isolated production build link');
 assert.equal(fs.readlinkSync(logical),BUILD_ROOT);
 assert.equal(fs.realpathSync(logical),BUILD_ROOT);
 assert.equal(fs.realpathSync(BUILD_ROOT),BUILD_ROOT);
 return {logicalPath:BUILD_LINK,physicalRoot:BUILD_ROOT,symlinkTarget:BUILD_ROOT};
}
function buildIdPin(){binding();return {...pinFile(BUILD_ROOT,'BUILD_ID'),path:`${BUILD_LINK}/BUILD_ID`};}
function headers(route,mode){
 if(mode==='anonymous')return {};
 const page=route.kind==='page',image=route.kind==='image',script=route.kind==='script';
 const prior=route.path.match(/shared-nms002-l02-p(\d{3})/u)?.[1];
 const referer=route.refererPage==='p053'?'/en/migration-status/g678-calibration/shared-nms002-l02-p053':
  prior==='054'?'/en/migration-status/g678-calibration/shared-nms002-l02-p054?level=1':
  `/en/migration-status/g678-calibration/shared-nms002-l02-p${prior??'054'}`;
 return {host:'127.0.0.1:3332',referer:ORIGIN+referer,
  ...(image?{}:{origin:ORIGIN}),'sec-fetch-site':'same-origin',
  'sec-fetch-mode':page?'navigate':image?'no-cors':'cors',
  'sec-fetch-dest':page?'document':image?'image':script?'script':'empty'};
}
async function smallBody(response){
 if(!response.body)return {bytes:0,leak:false};
 const reader=response.body.getReader();let bytes=0;const parts=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;
  bytes+=value.byteLength;parts.push(Buffer.from(value));if(bytes>=1000)break;}}
 finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
 const body=Buffer.concat(parts);
 return {bytes,leak:[...FORBIDDEN_BUNDLE_MARKERS,...FORMAL_MARKERS].some(marker=>
  body.includes(Buffer.from(marker)))};
}
async function probe(route,method,mode){
 const response=await fetch(ORIGIN+route.path,{method,headers:headers(route,mode),
  redirect:'manual',signal:AbortSignal.timeout(15000)});
 const body=await smallBody(response);
 return {path:route.path,kind:route.kind,refererPage:route.refererPage??null,
  method,headersMode:mode,status:response.status,bodyBytes:body.bytes,
  leak:body.leak,redirected:response.headers.get('location')!==null,
  pass:response.status===404&&body.bytes<1000&&!body.leak&&
   response.headers.get('location')===null};
}
function formalBundleScan(){
 const prior=scanProductionBundles(BUILD_ROOT);const matches=[...prior.matches];
 for(const subdir of ['server','static']){
  const pending=[path.join(BUILD_ROOT,subdir)];
  while(pending.length){const directory=pending.pop();
   for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    assert(!entry.isSymbolicLink(),'no production bundle symlink');
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()){pending.push(file);continue;}
    if(!entry.isFile()||!/[.]m?js$/u.test(entry.name))continue;
    const content=fs.readFileSync(file);
    for(const marker of FORMAL_MARKERS)if(content.includes(Buffer.from(marker)))
     matches.push({path:path.relative(BUILD_ROOT,file),marker});
   }
  }
 }
 return {...prior,formalMarkers:FORMAL_MARKERS,matches};
}

async function run(slug,sourceMode){
 const relative=`${OUTPUT}/${slug}-${sourceMode}.json`,file=path.join(ROOT,relative);
 assert(!fs.existsSync(file),'immutable formal production result');
 assert.equal(process.env.NODE_ENV,'production');
 if(sourceMode==='unset')assert(!Object.hasOwn(process.env,'HELP_MATH_G678_SOURCE_ROOT'));
 else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 const receipt={schemaVersion:1,kind:'nms-l02-p053-formal-production-negative-v1',
  sourceMode,origin:ORIGIN,buildRoot:BUILD_ROOT,startedAt:new Date().toISOString(),
  expectedCases:2240,status:'running',results:[],errors:[]};
 try{
  receipt.directoryBinding=binding();
  const closure=inputClosure();
  receipt.inputClosure={predecessorInputCount:closure.predecessorInputCount,
   hostFileCount:closure.hostFileCount,pageFileCount:closure.pageFileCount,
   domInputCount:closure.domInputCount,externalFileCount:closure.externalFileCount,
   domExternalCount:closure.domExternalCount};
  receipt.inputsBefore=[...closure.inputs,pinFile(ROOT,BUILD_RECEIPT),buildIdPin()];
  receipt.buildIdBefore=readOrdinary(BUILD_ROOT,'BUILD_ID').toString('utf8').trim();
  assert(/^[a-zA-Z0-9_-]+$/u.test(receipt.buildIdBefore));
  const build=readJsonPin(ROOT,pinFile(ROOT,BUILD_RECEIPT));
  assert.equal(build.exitCode,0);assert.equal(build.inputsStable,true);
  assert.equal(build.configRestored,true);
  assert.deepEqual(build.inputsAfter,closure.inputs);
  assert.deepEqual(build.buildId,buildIdPin());
  assert.equal(build.selectedNonSecretEnvironment.NODE_ENV,'production');
  receipt.bundleScan=formalBundleScan();
  assert.deepEqual(receipt.bundleScan.matches,[],'no source, audio or formal code in bundles');
  for(const route of routes())for(const method of ['GET','HEAD'])
   for(const mode of ['anonymous','candidate-shaped-request']){
    try{receipt.results.push(await probe(route,method,mode));}
    catch(error){receipt.results.push({path:route.path,kind:route.kind,method,
     headersMode:mode,pass:false,error:String(error)});}
   }
 }catch(error){receipt.errors.push(String(error));}
 finally{
  try{receipt.inputsAfter=[...inputClosure().inputs,pinFile(ROOT,BUILD_RECEIPT),buildIdPin()];
   receipt.buildIdAfter=readOrdinary(BUILD_ROOT,'BUILD_ID').toString('utf8').trim();}
  catch(error){receipt.errors.push(`post-check pin: ${String(error)}`);}
  receipt.inputStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter)&&
   receipt.buildIdBefore===receipt.buildIdAfter;
  receipt.status=receipt.errors.length===0&&receipt.inputStable&&
   receipt.results.length===receipt.expectedCases&&receipt.results.every(row=>row.pass)
   ?'technical-pass-not-deployment':'failed';
  receipt.finishedAt=new Date().toISOString();
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,expectedCases:receipt.expectedCases,
   passed:receipt.results.filter(row=>row.pass).length,inputStable:receipt.inputStable,
   errors:receipt.errors,receipt:pinFile(ROOT,relative)}));
  if(receipt.status==='failed')process.exitCode=1;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--plan')console.log(JSON.stringify(planProductionIsolation()));
 else{
  assert(args.length===3&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1])&&
   ['unset','real-root'].includes(args[2]),'Usage: --plan | --run <unique-slug> <unset|real-root>');
  await run(args[1],args[2]);
 }
}
