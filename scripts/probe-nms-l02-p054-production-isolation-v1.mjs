#!/usr/bin/env node
/** P054 formal Current-JS production isolation. One owned production server is
 * started by the builder for each source-root mode; this probe never starts it. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readOrdinary,readPin,readJsonPin,uniquePins} from '../lib/g678-admission-proof.mjs';
import {routes as productRoutes,FORBIDDEN_BUNDLE_MARKERS as PRODUCT_MARKERS}
 from './check-nms-l02-p054-product-production-v3.mjs';
import {planProductionDenials as predecessorPlan}
 from './check-nms-l02-p064-product-v1.mjs';
import {p054ExpectedResourcePins,validateP054ResourcePins,P054_FEEDBACK,P054_REVIEWED_SOURCE_PINS,
 P054_AUDIO_MANIFEST,P054_SOURCE_ROOT} from '../lib/nms-l02-p054-admission-semantics.mjs';
import {validateP054ProofClosure} from '../lib/nms-l02-p054-proof-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3332';
export const BUILD_ROOT='/Volumes/American Dream/hudongpin/g678-p054-formal-build-output-20260928/next-output-v1';
export const BUILD_LINK='apps/web/.next-alg-p001-production-scan';
export const BUILD_RECEIPT='output/nms-l02-p054-product-20260928/admission/formal-production-build-receipt-v1.json';
export const HOST='catalog/nms-l02-admission-v1/host-v15.json';
export const PAGE_PROOF='work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json';
export const ACTIVATION='apps/web/lib/nms-l02-p054-admission-activation.ts';
const ROOT_CASE='output/nms-l02-p054-product-20260928/admission';
export const INPUT_PATHS=Object.freeze([
 'scripts/probe-nms-l02-p054-production-isolation-v1.mjs',
 'scripts/probe-nms-l02-p054-production-isolation-v1.test.mjs',
 'scripts/build-and-probe-nms-l02-p054-production-v1.py',
 'scripts/check-nms-l02-p054-product-production-v3.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p054/page.tsx',
 'apps/web/lib/nms-l02-p054-admission.server.ts',
 'apps/web/tests/nms-l02-p054-admission.server-test.ts',
 'apps/web/lib/nms-l02-p054-admission-activation.ts',
 'apps/web/lib/nms-l02-p054-descriptor-extension.ts',
 'apps/web/lib/nms-l02-p054-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p054-product-host.production-stub.tsx',
 'apps/web/components/g678-nms-l02-p054-product-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx',
 'apps/web/components/nms-l02-p054-product-host-v1.css',
 'apps/web/lib/nms-l02-p054-reveal.server.ts',
 'apps/web/lib/nms-l02-p054-reveal-access.ts',
 'apps/web/lib/nms-l02-p054-feedback-audio.server.ts',
 'apps/web/lib/nms-l02-p054-feedback-audio-access.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/reveal/[level]/[order]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/[kind]/route.ts',
 'packages/demos/src/nms-l02-p054-product-board-v1.tsx',
 'packages/demos/src/nms-l02-p054-matching-state-candidate.ts',
 'packages/demos/src/generated/nms-l02-p054-cards-v1.ts',
 'packages/demos/src/nms-l02-p054-reveal-v1.ts',
 'packages/demos/src/nms-l02-p054-feedback-audio-v1.ts',
 'packages/demos/src/nms-l02-p054-feedback-audio-loader.ts',
 'packages/demos/src/modules/shared-nms002-l02-p054.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p054.ts',
 'lib/nms-l02-p054-admission-semantics.mjs',
 'lib/nms-l02-p054-proof-semantics-v1.mjs',
 'work/g678-shared-page-factory/g678-nms-l02-p054-source-matching-current-js-v1/run-manifest.json',
 'work/g678-shared-page-factory/g678-nms-l02-p054-source-matching-current-js-v1/members/shared-nms002-l02-p054/member-manifest.json',
 'catalog/product-bridge-calibrations/g678-nms-l02-p054-source-matching-current-js-v1.json',
 HOST,PAGE_PROOF,
 'catalog/nms-l02-admission-v1/host-v14.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
 'apps/web/lib/nms-l02-p064-admission-activation.ts',
 'packages/demos/private-current-js-registry.json',
 P054_REVIEWED_SOURCE_PINS.art.path,
 P054_REVIEWED_SOURCE_PINS.gameDisplay.path,
 P054_REVIEWED_SOURCE_PINS.interaction.path,
]);

export const FORBIDDEN_BUNDLE_MARKERS=Object.freeze([...new Set([...PRODUCT_MARKERS,
 'nms-l02-p054-admission.server','nms-l02-p054-proof-semantics-v1',
 'nms-l02-p054-product-board-v1','shared-nms002-l02-p054/canvas-renderer',
 'source-matching-level-2',
])]);
export function routes(){
 const list=productRoutes();
 assert.equal(list.length,480,'P054 formal matrix inherits exact product and P064 predecessor routes');
 const root='/flash-assets/g678-local/shared-nms002-l02-p054';
 const reveal=list.filter(item=>item.path.startsWith(`${root}/reveal/`)&&
  /^\/flash-assets\/g678-local\/shared-nms002-l02-p054\/reveal\/[12]\/(?:[1-9]|1[0-2])$/u.test(item.path));
 const expectedAudio=new Set(P054_FEEDBACK.map(binding=>
  `${root}/feedback-audio/${binding.kind}?sha256=${binding.audio.sha256}`));
 const feedback=list.filter(item=>expectedAudio.has(item.path));
 assert.equal(reveal.length,24);assert.equal(feedback.length,2);
 assert.equal(new Set(list.map(item=>item.path)).size,list.length);
 return list;
}
const exists=relative=>fs.existsSync(path.join(ROOT,relative));
function inputClosure(){
 const missingInputs=INPUT_PATHS.filter(relative=>!exists(relative));
 const pins=INPUT_PATHS.filter(exists).map(relative=>pinFile(ROOT,relative));
 if(missingInputs.length)return {inputs:uniquePins(pins),missingInputs,
  predecessorInputCount:0,hostFileCount:0,pageFileCount:0,externalFileCount:0};
 const activation=readActivation();
 const host=readJsonPin(ROOT,activation.host);
 const proof=readJsonPin(ROOT,activation.page);
 assert.equal(host.kind,'nms-l02-successor-host-v1');
 assert.equal(host.contract,'nms-l02-source-bound-host-v1');
 assert.equal(proof.kind,'nms-l02-page-proof-v1');
 validateP054ProofClosure(proof);
 assert.deepEqual(uniquePins(host.files),host.files,'exact sorted host closure');
 assert.deepEqual(uniquePins(proof.files),proof.files,'exact sorted page closure');
 const inherited=predecessorPlan();
 assert.equal(inherited.expectedCases,1700,'retained P064 production route matrix');
 for(const pin of [...inherited.inputs,...host.files,...proof.files]){
  readPin(ROOT,pin);
  pins.push(pin);
 }
 const external=proof.external.map(item=>{
  readPin(item.root,item.pin);
  return {...item.pin,path:path.join(item.root,item.pin.path)};
 });
 pins.push(...external);
 return {inputs:uniquePins(pins),missingInputs,
  predecessorInputCount:inherited.inputs.length,hostFileCount:host.files.length,
  pageFileCount:proof.files.length,externalFileCount:external.length};
}
export function planProductionIsolation(){
 const closure=inputClosure();
 return {schemaVersion:1,kind:'nms-l02-p054-formal-production-isolation-plan-v1',
  buildRoot:BUILD_ROOT,buildReceipt:BUILD_RECEIPT,origin:ORIGIN,
  sourceModes:['unset','real-root'],routeCount:routes().length,casesPerMode:1920,
  expectedCases:3840,...closure,
  ready:closure.missingInputs.length===0,writesPerformed:false};
}

export function scanProductionBundles(buildRoot=BUILD_ROOT){
 let files=0,bytes=0;const matches=[];
 for(const subdir of ['server','static']){
  const start=path.join(buildRoot,subdir);
  assert(fs.statSync(start).isDirectory(),`production ${subdir} directory`);
  const stack=[start];
  while(stack.length){
   const directory=stack.pop();
   for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
   assert(!entry.isSymbolicLink(),'no compiled JS symlink');
   const file=path.join(directory,entry.name);
   if(entry.isDirectory()){stack.push(file);continue;}
   if(!entry.isFile()||!/[.]m?js$/u.test(entry.name))continue;
   const content=fs.readFileSync(file);files++;bytes+=content.length;
   for(const marker of FORBIDDEN_BUNDLE_MARKERS)
    if(content.includes(Buffer.from(marker)))matches.push({path:path.relative(buildRoot,file),marker});
   }
  }
 }
 assert(files>0&&bytes>0,'compiled JavaScript scanned');
 return {files,bytes,markers:FORBIDDEN_BUNDLE_MARKERS,matches};
}

function buildDirectoryBinding(){
 const logical=path.join(ROOT,BUILD_LINK);
 assert(fs.lstatSync(logical).isSymbolicLink(),'isolated build link');
 assert.equal(fs.readlinkSync(logical),BUILD_ROOT,'exact fresh build link');
 assert.equal(fs.realpathSync(logical),BUILD_ROOT,'exact physical build root');
 assert.equal(fs.realpathSync(BUILD_ROOT),BUILD_ROOT,'physical build root, no alias');
 return {logicalPath:BUILD_LINK,physicalRoot:BUILD_ROOT,symlinkTarget:BUILD_ROOT};
}
function readBuildId(){
 buildDirectoryBinding();
 return readOrdinary(BUILD_ROOT,'BUILD_ID').toString('utf8').trim();
}
function pinBuildId(){
 buildDirectoryBinding();
 return {...pinFile(BUILD_ROOT,'BUILD_ID'),path:`${BUILD_LINK}/BUILD_ID`};
}
function readActivation(){
 const text=readOrdinary(ROOT,ACTIVATION).toString('utf8');
 const match=text.match(/export const NMS_L02_P054_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
 assert(match,'P054 activation parse');
 const activation=JSON.parse(match[1]);
 assert.equal(activation.schemaVersion,1);
 assert.equal(activation.stage,'candidate');
 assert.equal(activation.host.path,HOST);
 assert.equal(activation.page.path,PAGE_PROOF);
 for(const pin of [activation.predecessor,activation.host,activation.page])readPin(ROOT,pin);
 return activation;
}
function readExternalResources(){
 const art=readJsonPin(ROOT,P054_REVIEWED_SOURCE_PINS.art);
 const manifestBytes=fs.readFileSync(P054_AUDIO_MANIFEST.path);
 assert.equal(createHash('sha256').update(manifestBytes).digest('hex'),
  P054_AUDIO_MANIFEST.sha256);
 const audioManifest=JSON.parse(manifestBytes.toString('utf8'));
 const resourcePins=p054ExpectedResourcePins(art,audioManifest);
 assert.equal(validateP054ResourcePins({art,audioManifest,resourcePins}),true);
 for(const pin of resourcePins)readPin(path.dirname(pin.path),{...pin,path:path.basename(pin.path)});
 return resourcePins;
}
function requestHeaders(route,mode){
 if(mode==='anonymous')return {};
 const page=route.kind==='page',image=route.kind==='image',script=route.kind==='script';
 const match=route.path.match(/shared-nms002-l02-p(\d{3})/u);
 const referer=match?.[1]==='054'?'/en/migration-status/g678-calibration/shared-nms002-l02-p054?level=1':
  `/en/migration-status/g678-calibration/shared-nms002-l02-p${match?.[1]??'054'}`;
 return {host:'127.0.0.1:3332',referer:ORIGIN+referer,
  ...(image?{}:{origin:ORIGIN}),'sec-fetch-site':'same-origin',
  'sec-fetch-mode':page?'navigate':image?'no-cors':'cors',
  'sec-fetch-dest':page?'document':image?'image':script?'script':'empty'};
}
async function smallBody(response){
 if(!response.body)return {bytes:0,leak:false};
 const reader=response.body.getReader();let bytes=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;
  bytes+=value.byteLength;
  chunks.push(Buffer.from(value));
  if(bytes>=1000)break;
 }}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
 const body=Buffer.concat(chunks);
 const leak=['06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
  'P054ProductBoardV1','nms-l02-p054-admission.server'].some(marker=>
  body.includes(Buffer.from(marker)));
 return {bytes,leak};
}
async function probe(route,method,headersMode){
 const response=await fetch(ORIGIN+route.path,{method,headers:requestHeaders(route,headersMode),
  redirect:'manual',signal:AbortSignal.timeout(15000)});
 const body=await smallBody(response);
 const pass=response.status===404&&body.bytes<1000&&!body.leak&&
  response.headers.get('location')===null;
 return {path:route.path,kind:route.kind,method,headersMode,status:response.status,
  bodyBytes:body.bytes,leak:body.leak,redirected:response.headers.get('location')!==null,pass};
}

export function verifyBuildInputPins(pins,closure){
 for(const pin of pins){
  if(path.isAbsolute(pin.path)){
   assert.deepEqual(closure.inputs.find(item=>item.path===pin.path),pin,
    'absolute build input belongs to exact formal closure');
   readPin(path.dirname(pin.path),{...pin,path:path.basename(pin.path)});
  }else readPin(ROOT,pin);
 }
 return true;
}

async function run(slug,sourceMode){
 const relative=`${ROOT_CASE}/production-isolation-${slug}-${sourceMode}.json`;
 const output=path.join(ROOT,relative);
 assert(!fs.existsSync(output),'immutable evidence path already exists');
 assert(process.env.NODE_ENV==='production','owned production process');
 if(sourceMode==='unset')assert(!Object.hasOwn(process.env,'HELP_MATH_G678_SOURCE_ROOT'));
 else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P054_SOURCE_ROOT);
 const receipt={schemaVersion:1,kind:'nms-l02-p054-formal-production-isolation-v1',
  sourceMode,origin:ORIGIN,buildRoot:BUILD_ROOT,startedAt:new Date().toISOString(),
  expectedCases:1920,status:'running',results:[],errors:[]};
 try{
  receipt.directoryBinding=buildDirectoryBinding();
  const closure=inputClosure();
  assert.deepEqual(closure.missingInputs,[],'all formal inputs present');
  receipt.inputClosure={predecessorInputCount:closure.predecessorInputCount,
   hostFileCount:closure.hostFileCount,pageFileCount:closure.pageFileCount,
   externalFileCount:closure.externalFileCount};
  receipt.inputsBefore=[...closure.inputs,pinFile(ROOT,BUILD_RECEIPT),pinBuildId()];
  receipt.buildIdBefore=readBuildId();
  receipt.activation=readActivation();
  const proof=readJsonPin(ROOT,receipt.activation.page);
  validateP054ProofClosure(proof);
  assert.equal(proof.animationId,'shared-nms002-l02-p054');
  assert.equal(proof.hostContract,'nms-l02-source-bound-host-v1');
  for(const pin of proof.files)readPin(ROOT,pin);
  for(const item of proof.external)readPin(item.root,item.pin);
  receipt.externalResources=readExternalResources();
  const build=readJsonPin(ROOT,pinFile(ROOT,BUILD_RECEIPT));
  assert.equal(build.exitCode,0);assert.equal(build.inputsStable,true);
  assert.equal(build.configRestored,true);assert.deepEqual(build.buildId,pinBuildId());
  verifyBuildInputPins(build.inputsAfter,closure);
  receipt.bundleScan=scanProductionBundles();
  assert.deepEqual(receipt.bundleScan.matches,[],'no P054 source/board/reader in production JS');
  for(const route of routes())for(const method of ['GET','HEAD'])
   for(const headersMode of ['anonymous','candidate-shaped-request']){
    try{receipt.results.push(await probe(route,method,headersMode));}
    catch(error){receipt.results.push({path:route.path,method,headersMode,
     pass:false,error:String(error)});}
   }
 }catch(error){receipt.errors.push(String(error));}
 finally{
  try{receipt.inputsAfter=[...inputClosure().inputs,pinFile(ROOT,BUILD_RECEIPT),pinBuildId()];
   receipt.buildIdAfter=readBuildId();}
  catch(error){receipt.errors.push(`post-check pin: ${String(error)}`);}
  receipt.inputStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter)&&
   receipt.buildIdBefore===receipt.buildIdAfter;
  receipt.status=receipt.errors.length===0&&receipt.inputStable&&
   receipt.results.length===receipt.expectedCases&&receipt.results.every(row=>row.pass)
   ?'technical-pass-not-deployment':'failed';
  receipt.finishedAt=new Date().toISOString();
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,sourceMode,
   passed:receipt.results.filter(row=>row.pass).length,expectedCases:receipt.expectedCases,
   inputStable:receipt.inputStable,errors:receipt.errors,receipt:pinFile(ROOT,relative)}));
  if(receipt.status==='failed')process.exitCode=1;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--plan')console.log(JSON.stringify(planProductionIsolation()));
 else{
  assert(args.length===3&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1])&&
   ['unset','real-root'].includes(args[2]),
   'Usage: probe-nms-l02-p054-production-isolation-v1.mjs --plan | --run <slug> <unset|real-root>');
  await run(args[1],args[2]);
 }
}
