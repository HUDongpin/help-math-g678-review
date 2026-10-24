#!/usr/bin/env node
/** Fresh local production denial for the formal P003 Current-JS successor. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readRegistryTransaction} from '../lib/g678-admission-proof.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const EXTERNAL='/Volumes/American Dream/hudongpin';
const BUILD='/Volumes/American Dream/hudongpin/g678-p003-formal-build-output-20260928/next-output-v1';
const LOGICAL='apps/web/.next-alg-p001-production-scan';
const OUT='output/alg-l06-p003-audio-alignment-20260928/formal-v1/production';
const RECEIPT=`${OUT}/build-receipt-v1.json`;
const HOST='catalog/g678-admission-v1/host-v18.json';
const INDEX='catalog/g678-admission-v1/index-v18.json';
const EXPECTED_PROOF='catalog/g678-admission-v1/shared-alg001-l06-p003-base-successor-v2.json';
const ACTIVATION='apps/web/lib/g678-admission-activation.ts';
const REGISTRY='packages/demos/private-current-js-registry.json';
const DISPATCH=['packages/demos/src/registry.local-only.generated.ts',
 'packages/demos/src/registry.local-only.metadata.generated.ts'];
const ORIGIN='http://127.0.0.1:3332';
const ID='shared-alg001-l06-p003';
const PAGE=`/migration-status/g678-calibration/${ID}/continuous-v2`;
const ASSET=`/flash-assets/g678-local/${ID}/continuous-source-v2`;
const SA_ASSET=`/flash-assets/g678-local/${ID}/optional-spanish-audio-v1`;
const SA_SHA='d280e8f5e653c165755baf2f8960cfd667f03205d2f9aaafe1820a15d327f89a';
const SA_PCM='output/alg-l06-p003-audio-alignment-20260928/browser-spanish-v1/chrome-sa-v1/result.json';
const PCM_RECEIPT='output/alg-l06-p003-audio-alignment-20260928/browser-continuous-v1/chrome-full-v3/result.json';
const CANVAS=`/flash-assets/g678-local/${ID}/canvas-renderer.js`;
const AUDIO_SHA='91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111';
const CANVAS_SHA='87694adc7d08f6f95069deede781410ab912a24a44a6cfce0fc05a43118f205c';
const SWF_SHA='c3d265b61aedccc48e679cbecfe6424a2a78f2a9cb5cfa2a33791fa124933766';
const OWN=Object.freeze([
 'apps/web/lib/alg-l06-p003-local-audio-request-v1.ts',
 'apps/web/lib/alg-l06-p003-optional-spanish-access-v1.ts',
 'apps/web/lib/alg-l06-p003-optional-spanish-v1.server.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/optional-spanish-audio-v1/route.ts',
 'packages/demos/src/alg-l06-p003-optional-spanish-audio-v1.ts',
 'packages/demos/src/decoded-source-stream-transport.ts',
 'migrations/shared-alg001-l06-p003/audit/sa-host-disposition-v2.json',
 SA_PCM,
 'scripts/check-alg-l06-p003-continuous-production-v3.mjs',
 'scripts/build-and-probe-alg-l06-p003-continuous-production-v3.py',
 'scripts/check-alg-l06-p003-formal-production-v1.mjs',
 'scripts/build-and-probe-alg-l06-p003-formal-production-v1.py',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2/page.tsx',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/continuous-source-v2/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/canvas-renderer.js/route.ts',
 'apps/web/lib/alg-l06-p003-continuous-candidate-v2.server.ts',
 'apps/web/lib/alg-l06-p003-continuous-source-access-v2.ts',
 'apps/web/lib/alg-l06-p003-continuous-source-v2.server.ts',
 'apps/web/lib/g678-alg-l06-p003-host-probe.server.ts',
 'apps/web/lib/g678-alg-l06-p003-probe-access.ts',
 'apps/web/lib/g678-preview-policy.ts',
 'apps/web/proxy.ts',
 'apps/web/components/g678-alg-l06-p003-continuous-host-lesson-v2.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'scripts/prepare-nms-l02-candidate-player.mjs',
 'scripts/prepare-nms-l02-candidate-player.test.mjs',
 'apps/web/components/g678-alg-l06-p003-continuous-runtime-v2.tsx',
 'apps/web/components/g678-alg-l06-p003-host-runtime.module.css',
 'packages/demos/src/alg-l06-p003-continuous-source-clock-v2.ts',
 'packages/demos/src/alg-l06-p003-continuous-audio-schedule-v2.ts',
 'packages/demos/src/modules/g678-alg-l06-p003-continuous-candidate-v2.tsx',
 'packages/demos/src/alg-l06-p003-text-v1.ts',
 'scripts/measure-alg-l06-p003-continuous-pcm-v1.mjs',
 'output/alg-l06-p003-audio-alignment-20260928/continuous-v3.json',
 PCM_RECEIPT,
 'apps/web/lib/alg-l06-p003-formal-base-v1.server.ts',
 'apps/web/lib/alg-l06-p003-formal-admission-v1.server.ts',
 'apps/web/lib/alg-l06-p003-descriptor-extension-v1.ts',
 'apps/web/tests/alg-l06-p003-descriptor-extension-v1.test.ts',
 'apps/web/lib/alg-l06-p003-canonical-resources-v1.server.ts',
 'lib/alg-l06-p003-admission-semantics-v1.mjs',
 'packages/demos/src/modules/shared-alg001-l06-p003.tsx',
 'packages/demos/src/timelines/shared-alg001-l06-p003.ts',
 'scripts/prepare-alg-l06-p003-admission-v1.mjs',
 'scripts/prepare-alg-l06-p003-continuous-artifacts-v1.mjs',
 HOST,INDEX,ACTIVATION,REGISTRY,...DISPATCH,
]);
const EXTERNAL_PINS=Object.freeze([
 {path:`${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/RW/L6RW03.swf`,bytes:1220637,sha256:SWF_SHA},
 {path:`${EXTERNAL}/g678-p003-audit.11qugt/source-stream.mp3`,bytes:263640,sha256:AUDIO_SHA},
 {path:`${EXTERNAL}/g678-p003-candidate-v2.w5AS1a/canvas-renderer.js`,bytes:9063233,sha256:CANVAS_SHA},
 {path:`${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/SA/L6RW03.mp3`,bytes:135408,sha256:SA_SHA},
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function pin(file){
 const absolute=path.isAbsolute(file)?file:path.join(ROOT,file);
 assert.equal(fs.realpathSync(absolute),absolute,`physical file ${file}`);
 const before=fs.lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file ${file}`);
 const bytes=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])
  assert.equal(before[key],after[key],`stable file ${file}:${key}`);
 return {path:file,bytes:bytes.length,sha256:sha(bytes)};
}
function formalClosure(){
 const hostPin=pin(HOST),indexPin=pin(INDEX);
 const host=JSON.parse(fs.readFileSync(path.join(ROOT,HOST),'utf8'));
 const index=JSON.parse(fs.readFileSync(path.join(ROOT,INDEX),'utf8'));
 assert.equal(host.kind,'g678-admission-host-v1');
 assert.equal(index.kind,'g678-admission-index-v1');
 assert.deepEqual(index.host,hostPin,'active formal index binds actual host-v18');
 assert.equal(index.pages.length,7,'six old proofs plus exact P003');
 const selected=index.pages.filter(row=>row.animationId===ID);
 assert.equal(selected.length,1,'one P003 proof in current index');
 assert.equal(selected[0].proof.path,EXPECTED_PROOF,'exact reviewed P003 proof successor');
 const proofPin=pin(selected[0].proof.path);
 assert.deepEqual(selected[0].proof,proofPin,'index binds actual P003 successor bytes');
 assert.deepEqual(index.pages.at(-1),selected[0],'P003 appended after old proofs');
 const proof=JSON.parse(fs.readFileSync(path.join(ROOT,proofPin.path),'utf8'));
 assert.equal(proof.kind,'g678-page-proof-v1');
 assert.equal(proof.hostContract,host.contract);
 assert.equal(proof.animationId,ID);
 assert.equal(proof.packet.calibrationId,'g678-alg-l06-p003-continuous-20260928-v1');
 const transaction=readRegistryTransaction(ROOT);
 const entries=transaction.registry.calibrations.flatMap(row=>row.entries);
 const shared=entries.filter(row=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(row.key));
 assert.equal(entries.length,639,'actual total Current-JS transaction count');
 assert.equal(shared.length,497,'actual shared G6-G8 registered count');
 const current=transaction.registry.calibrations.filter(row=>
  row.calibrationId===proof.registration.calibrationId);
 assert.equal(current.length,1,'one exact P003 calibration');
 assert.deepEqual(current[0],proof.registration,'actual P003 registry row matches proof');
 assert.deepEqual(proof.packet.entry.artifacts.runtime,{
  path:'work/g678-shared-page-factory/g678-alg-l06-p003-continuous-20260928-v1/members/shared-alg001-l06-p003/canvas-renderer.js',
  bytes:9063233,sha256:CANVAS_SHA},'canonical runtime, not external candidate path');
 assert.equal(proof.packet.continuousSource?.twoRunPlayback,false);
 assert.equal(proof.packet.continuousSource?.mp3?.sha256,AUDIO_SHA);
 assert.equal(proof.packet.optionalSpanishAudio?.localeAutoplay,false);
 assert.equal(proof.packet.optionalSpanishAudio?.mainStreamSpliced,false);
 assert(Object.values(proof.packet.acceptanceEffects).every(value=>value===false));
 const activation=fs.readFileSync(path.join(ROOT,ACTIVATION),'utf8');
 assert(activation.includes(INDEX)&&activation.includes(indexPin.sha256),
  'actual activation points at formal index-v18');
 const files=[...host.files,...proof.files,...index.pages.map(row=>row.proof),
  proof.packet.freezeManifest,...Object.values(proof.packet.entry.artifacts),
  proof.packet.canonicalRun,proof.packet.canonicalMember];
 for(const member of files)assert.deepEqual(pin(member.path),member,
  `formal host/page/input pin: ${member.path}`);
 const external=[];
 for(const item of proof.external){
  assert(item.root===SOURCE_ROOT||item.root.startsWith(EXTERNAL+'/'),
   'bounded formal external root');
  const absolute=path.join(item.root,item.pin.path);
  const actual=pin(absolute);
  assert.deepEqual({...actual,path:item.pin.path},item.pin,
   `formal external proof pin: ${item.pin.path}`);
  external.push(actual);
 }
 const byPath=new Map();
 for(const item of [...files,...external]){
  const prior=byPath.get(item.path);
  if(prior)assert.deepEqual(item,prior,`conflicting formal closure pin: ${item.path}`);
  else byPath.set(item.path,item);
 }
 return [...byPath.values()].sort((a,b)=>a.path.localeCompare(b.path));
}
function inputClosure(){
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'real AWS root');
 const local=OWN.map(pin);
 for(const expected of EXTERNAL_PINS)assert.deepEqual(pin(expected.path),expected);
 const pcm=JSON.parse(fs.readFileSync(path.join(ROOT,PCM_RECEIPT),'utf8'));
 assert.equal(pcm.status,'technical-measurement-pass-not-audio-acceptance');
 assert.equal(pcm.playbackInvoked,false);assert.equal(pcm.inputsStable,true);
 assert.equal(pin(SA_PCM).sha256,'4ef0dcd775a13724368075a6132d12b690b95af88ea23fecf0627233becdce9a');
 const all=[...local,...EXTERNAL_PINS,...formalClosure()],seen=new Map();
 for(const item of all){
  const prior=seen.get(item.path);
  if(prior)assert.deepEqual(item,prior,`duplicate formal input drift: ${item.path}`);
  else seen.set(item.path,item);
 }
 return [...seen.values()].sort((a,b)=>a.path.localeCompare(b.path));
}
function routes(){
 const audioCases=(asset,digest)=>{
  const exact=`${asset}?sha256=${digest}`;
  return [
   {path:exact,variant:'exact'}, {path:asset,variant:'missing-hash'},
   {path:`${asset}?sha256=${'0'.repeat(64)}`,variant:'wrong-hash'},
   {path:`${exact}&extra=1`,variant:'extra-query'},
   {path:exact,variant:'range'}, {path:exact,variant:'cross-origin-referer'},
   {path:exact,variant:'cross-origin-origin'}, {path:exact,variant:'cross-site-fetch'},
   {path:exact,variant:'spanish-referer',locale:'es'},
   {path:exact,variant:'focus-referer'}, {path:exact,variant:'invalid-mode-referer'},
   {path:exact,variant:'rsc-referer'}, {path:exact,variant:'duplicate-mode-referer'},
  ].map(item=>({kind:'audio',locale:'en',...item}));
 };
 return [
  ...['en','es'].flatMap(locale=>[PAGE,`${PAGE}?mode=focus`,`${PAGE}?mode=focus&_rsc=abc_123`,
   `${PAGE}?frame=17`,`${PAGE}?level=2`,`${PAGE}?mode=wrong`,`${PAGE}?mode=focus&mode=focus`,`${PAGE}?_rsc=`]
   .map(suffix=>({path:`/${locale}${suffix}`,kind:'page',locale,variant:'page'}))),
  {path:PAGE,kind:'page',locale:'en',variant:'no-locale'},
  ...audioCases(ASSET,AUDIO_SHA),...audioCases(SA_ASSET,SA_SHA),
  {path:`${CANVAS}?sha256=${CANVAS_SHA}`,kind:'script',locale:'en',variant:'exact-canvas'},
  {path:CANVAS,kind:'script',locale:'en',variant:'missing-canvas-hash'},
 ];
}
function headers(route,mode){
 if(mode==='anonymous')return {};
 const page=route.kind==='page',script=route.kind==='script';
 const referer=route.variant==='cross-origin-referer'
  ? 'http://example.invalid/en'+PAGE : `${ORIGIN}/${route.locale}${PAGE}${
   route.variant==='focus-referer'?'?mode=focus':
   route.variant==='invalid-mode-referer'?'?mode=wrong':
   route.variant==='rsc-referer'?'?_rsc=abc':
   route.variant==='duplicate-mode-referer'?'?mode=focus&mode=focus':''}`;
 return {host:'127.0.0.1:3332',referer,
  ...(!page&&!script?{origin:route.variant==='cross-origin-origin'?'http://example.invalid':ORIGIN}:{}),
  'sec-fetch-site':route.variant==='cross-site-fetch'?'cross-site':'same-origin',
  'sec-fetch-mode':page?'navigate':script?'no-cors':'cors',
  'sec-fetch-dest':page?'document':script?'script':'empty',
  ...(route.variant==='range'?{range:'bytes=0-99'}:{}),
 };
}
async function smallBody(response){
 if(!response.body)return {bytes:0,leak:false};
 const reader=response.body.getReader(),parts=[];let length=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;
  parts.push(Buffer.from(value));length+=value.byteLength;if(length>=1000)break;}}
 finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
 const body=Buffer.concat(parts);
 return {bytes:length,leak:[AUDIO_SHA,SA_SHA,CANVAS_SHA,SWF_SHA,'p003-continuous-source-request-failed']
  .some(marker=>body.includes(Buffer.from(marker)))};
}
async function requestCase(route,method,mode){
 const response=await fetch(ORIGIN+route.path,{method,headers:headers(route,mode),
  redirect:'manual',signal:AbortSignal.timeout(15000)});
 const body=await smallBody(response);
 return {...route,method,mode,status:response.status,bodyBytes:body.bytes,
  redirected:response.headers.get('location')!==null,leak:body.leak,
  pass:response.status===404&&body.bytes<1000&&!body.leak&&
   response.headers.get('location')===null};
}
const MARKERS=Object.freeze([
 'P003OptionalSpanishAudio',
 'optional-sa-playing-from-zero',
 'optional-sa-response-too-large',
 'alg-l06-p003-optional-spanish-audio-v1',
 'isP003ContinuousHostSearch',
 'alg-l06-p003-local-audio-request-v1',
 SA_SHA,
 `${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/SA/L6RW03.mp3`,
 'alg-l06-p003-continuous-source-clock-v2',
 'continuous-source-stream-candidate-not-original-runtime-accepted',
 'p003-continuous-source-request-failed',
 'p003-continuous-v2-unregistered',
 'data-p003-continuous-v2',
 'alg-l06-p003-formal-admission-v1.server',
 'alg-l06-p003-formal-base-v1.server',
 'alg-l06-p003-canonical-resources-v1.server',
 'g678-alg-l06-p003-continuous-20260928-v1',
 'P003_FORMAL_BASE',
 'P003_CANONICAL_RESOURCE_LOCAL_ONLY',
 AUDIO_SHA,
 `${EXTERNAL}/g678-p003-audit.11qugt`,
 `${EXTERNAL}/g678-p003-candidate-v2.w5AS1a`,
 `${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/RW/L6RW03.swf`,
]);
function bundleScan(){
 const files=[],matches=[];
 const payloads=[{name:'full-stream',pin:EXTERNAL_PINS[1]}, {name:'optional-spanish',pin:EXTERNAL_PINS[3]}];
 const binaryMarkers=payloads.flatMap(payload=>{
  const raw=fs.readFileSync(payload.pin.path);
  assert.equal(raw.length,payload.pin.bytes);assert.equal(sha(raw),payload.pin.sha256);
  // Multiples of three preserve the excerpts inside whole-payload base64 too.
  const excerpts=[raw.subarray(8190,8286),raw.subarray(16383,16479)];
  for(const excerpt of excerpts)assert(new Set(excerpt).size>=32,'high-entropy source-audio fingerprint');
  return [raw,Buffer.from(raw.toString('base64')),...excerpts,
   ...excerpts.map(bytes=>Buffer.from(bytes.toString('base64')))]
   .map((bytes,index)=>({bytes,name:`${payload.name}-payload-pattern-${index}`}));
 });
 const pending=[path.join(BUILD,'static')];
 while(pending.length){const directory=pending.pop();
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
   assert(!entry.isSymbolicLink(),'no client bundle symlink');
   const file=path.join(directory,entry.name);
   if(entry.isDirectory()){pending.push(file);continue;}
   assert(entry.isFile(),'ordinary client bundle entry');
   const bytes=fs.readFileSync(file),relative=path.relative(BUILD,file);files.push(relative);
   for(const marker of MARKERS)if(bytes.includes(Buffer.from(marker)))matches.push({path:relative,marker});
   for(const marker of binaryMarkers)if(bytes.includes(marker.bytes))
    matches.push({path:relative,marker:marker.name});
  }
 }
 return {filesScanned:files.length,matches,sourcePayloads:payloads.map(p=>({name:p.name,bytes:p.pin.bytes,sha256:p.pin.sha256}))};
}
function binding(){
 const logical=path.join(ROOT,LOGICAL);
 assert(fs.lstatSync(logical).isSymbolicLink());
 assert.equal(fs.readlinkSync(logical),BUILD);
 assert.equal(fs.realpathSync(logical),BUILD);
 assert.equal(fs.realpathSync(BUILD),BUILD);
 return {logicalPath:LOGICAL,physicalRoot:BUILD};
}
function buildIdPin(){binding();return {...pin(path.join(BUILD,'BUILD_ID')),
 path:`${LOGICAL}/BUILD_ID`};}
export function planProduction(){const inputs=inputClosure(),rs=routes();
 assert.equal(rs.length,45,'exact preserved 45-route matrix');
 return {schemaVersion:1,kind:'alg-l06-p003-formal-production-plan-v1',
  origin:ORIGIN,buildRoot:BUILD,buildReceipt:RECEIPT,sourceModes:['unset','real-root'],
  routeCount:rs.length,casesPerMode:rs.length*4,expectedCases:rs.length*8,
  routes:rs,inputs,writesPerformed:false};}
async function run(slug,sourceMode){
 assert.equal(process.env.NODE_ENV,'production');
 if(sourceMode==='unset')assert(!Object.hasOwn(process.env,'HELP_MATH_G678_SOURCE_ROOT'));
 else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 const relative=`${OUT}/${slug}-${sourceMode}.json`,absolute=path.join(ROOT,relative);
 assert(!fs.existsSync(absolute),'immutable production receipt');
 const receipt={schemaVersion:1,kind:'alg-l06-p003-formal-production-negative-v1',
  sourceMode,origin:ORIGIN,startedAt:new Date().toISOString(),status:'running',
  expectedCases:routes().length*4,results:[],errors:[]};
 try{
  receipt.directoryBinding=binding();
  receipt.inputsBefore=[...inputClosure(),pin(RECEIPT),buildIdPin()];
  const build=JSON.parse(fs.readFileSync(path.join(ROOT,RECEIPT),'utf8'));
  assert.equal(build.exitCode,0);assert.equal(build.inputsStable,true);
  assert.equal(build.configRestored,true);
  assert.deepEqual(build.inputsAfter,inputClosure());
  assert.deepEqual(build.buildId,buildIdPin());
  receipt.bundleScan=bundleScan();
  assert.deepEqual(receipt.bundleScan.sourcePayloads,[{name:'full-stream',bytes:263640,sha256:AUDIO_SHA},{name:'optional-spanish',bytes:135408,sha256:SA_SHA}]);
  assert.deepEqual(receipt.bundleScan.matches,[],'new P003 source/runtime leaked into client chunks');
  for(const route of routes())for(const method of ['GET','HEAD'])
   for(const mode of ['anonymous','candidate-shaped']){
    try{receipt.results.push(await requestCase(route,method,mode));}
    catch(error){receipt.results.push({...route,method,mode,pass:false,error:String(error)});}
   }
 }catch(error){receipt.errors.push(String(error?.stack??error));}
 finally{
  try{receipt.inputsAfter=[...inputClosure(),pin(RECEIPT),buildIdPin()];}
  catch(error){receipt.errors.push(`post-check pin: ${String(error)}`);}
  receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);
  receipt.status=receipt.errors.length===0&&receipt.inputsStable&&
   receipt.results.length===receipt.expectedCases&&receipt.results.every(item=>item.pass)
   ?'technical-pass-not-deployment':'failed';
  receipt.finishedAt=new Date().toISOString();
  fs.mkdirSync(path.dirname(absolute),{recursive:true});
  fs.writeFileSync(absolute,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,receipt:pin(relative),
   passed:receipt.results.filter(item=>item.pass).length,expected:receipt.expectedCases,
   inputsStable:receipt.inputsStable,errors:receipt.errors}));
  if(receipt.status==='failed')process.exitCode=1;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--plan')console.log(JSON.stringify(planProduction()));
 else{
  assert(args.length===3&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1])&&
   ['unset','real-root'].includes(args[2]),'Usage: --plan | --run <unique-slug> <unset|real-root>');
  await run(args[1],args[2]);
 }
}
