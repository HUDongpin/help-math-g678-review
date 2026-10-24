#!/usr/bin/env node
/** Fresh local production denial for the unregistered P003 continuous candidate. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const EXTERNAL='/Volumes/American Dream/hudongpin';
const BUILD='/Volumes/American Dream/hudongpin/g678-p003-continuous-build-output-20260928/next-output-v2';
const LOGICAL='apps/web/.next-alg-p001-production-scan';
const OUT='output/alg-l06-p003-audio-alignment-20260928/production-continuous-v2';
const RECEIPT=`${OUT}/build-receipt-v2.json`;
const ORIGIN='http://127.0.0.1:3332';
const ID='shared-alg001-l06-p003';
const PAGE=`/migration-status/g678-calibration/${ID}/continuous-v2`;
const ASSET=`/flash-assets/g678-local/${ID}/continuous-source-v2`;
const CANVAS=`/flash-assets/g678-local/${ID}/canvas-renderer.js`;
const AUDIO_SHA='91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111';
const CANVAS_SHA='87694adc7d08f6f95069deede781410ab912a24a44a6cfce0fc05a43118f205c';
const SWF_SHA='c3d265b61aedccc48e679cbecfe6424a2a78f2a9cb5cfa2a33791fa124933766';
const OWN=Object.freeze([
 'scripts/check-alg-l06-p003-continuous-production-v2.mjs',
 'scripts/build-and-probe-alg-l06-p003-continuous-production-v2.py',
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
 'output/alg-l06-p003-audio-alignment-20260928/browser-continuous-v1/chrome-full-v3/result.json',
]);
const EXTERNAL_PINS=Object.freeze([
 {path:`${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/RW/L6RW03.swf`,bytes:1220637,sha256:SWF_SHA},
 {path:`${EXTERNAL}/g678-p003-audit.11qugt/source-stream.mp3`,bytes:263640,sha256:AUDIO_SHA},
 {path:`${EXTERNAL}/g678-p003-candidate-v2.w5AS1a/canvas-renderer.js`,bytes:9063233,sha256:CANVAS_SHA},
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
function inputClosure(){
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'real AWS root');
 const local=OWN.map(pin);
 for(const expected of EXTERNAL_PINS)assert.deepEqual(pin(expected.path),expected);
 const pcm=JSON.parse(fs.readFileSync(path.join(ROOT,OWN.at(-1)),'utf8'));
 assert.equal(pcm.status,'technical-measurement-pass-not-audio-acceptance');
 assert.equal(pcm.playbackInvoked,false);assert.equal(pcm.inputsStable,true);
 return [...local,...EXTERNAL_PINS];
}
function routes(){
 const exact=`${ASSET}?sha256=${AUDIO_SHA}`;
 return [
  ...['en','es'].flatMap(locale=>[PAGE,`${PAGE}?frame=17`,`${PAGE}?level=2`]
   .map(suffix=>({path:`/${locale}${suffix}`,kind:'page',locale,variant:'page'}))),
  {path:PAGE,kind:'page',locale:'en',variant:'no-locale'},
  {path:exact,kind:'audio',locale:'en',variant:'exact'},
  {path:ASSET,kind:'audio',locale:'en',variant:'missing-hash'},
  {path:`${ASSET}?sha256=${'0'.repeat(64)}`,kind:'audio',locale:'en',variant:'wrong-hash'},
  {path:`${exact}&extra=1`,kind:'audio',locale:'en',variant:'extra-query'},
  {path:exact,kind:'audio',locale:'en',variant:'range'},
  {path:exact,kind:'audio',locale:'en',variant:'cross-origin-referer'},
  {path:exact,kind:'audio',locale:'en',variant:'cross-origin-origin'},
  {path:exact,kind:'audio',locale:'en',variant:'cross-site-fetch'},
  {path:exact,kind:'audio',locale:'es',variant:'spanish-referer'},
  {path:`${CANVAS}?sha256=${CANVAS_SHA}`,kind:'script',locale:'en',variant:'exact-canvas'},
  {path:CANVAS,kind:'script',locale:'en',variant:'missing-canvas-hash'},
 ];
}
function headers(route,mode){
 if(mode==='anonymous')return {};
 const page=route.kind==='page',script=route.kind==='script';
 const referer=route.variant==='cross-origin-referer'
  ? 'http://example.invalid/en'+PAGE : `${ORIGIN}/${route.locale}${PAGE}`;
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
 return {bytes:length,leak:[AUDIO_SHA,CANVAS_SHA,SWF_SHA,'p003-continuous-source-request-failed']
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
 'alg-l06-p003-continuous-source-clock-v2',
 'continuous-source-stream-candidate-not-original-runtime-accepted',
 'p003-continuous-source-request-failed',
 'p003-continuous-v2-unregistered',
 'data-p003-continuous-v2',
 AUDIO_SHA,
 `${EXTERNAL}/g678-p003-audit.11qugt`,
 `${EXTERNAL}/g678-p003-candidate-v2.w5AS1a`,
 `${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/RW/L6RW03.swf`,
]);
function bundleScan(){
 const files=[],matches=[],raw=fs.readFileSync(EXTERNAL_PINS[1].path);
 const encoded=raw.toString('base64');
 const excerpts = [raw.subarray(8190, 8286), raw.subarray(16383, 16479)];
 for (const excerpt of excerpts) assert(new Set(excerpt).size >= 16, 'distinct audio fingerprint');
 const binaryMarkers=[raw,Buffer.from(encoded),...excerpts,
  ...excerpts.map(bytes=>Buffer.from(bytes.toString('base64')))];
 const pending=[path.join(BUILD,'static')];
 while(pending.length){const directory=pending.pop();
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
   assert(!entry.isSymbolicLink(),'no client bundle symlink');
   const file=path.join(directory,entry.name);
   if(entry.isDirectory()){pending.push(file);continue;}
   assert(entry.isFile(),'ordinary client bundle entry');
   const bytes=fs.readFileSync(file),relative=path.relative(BUILD,file);files.push(relative);
   for(const marker of MARKERS)if(bytes.includes(Buffer.from(marker)))matches.push({path:relative,marker});
   for(const [index,marker] of binaryMarkers.entries())if(bytes.includes(marker))
    matches.push({path:relative,marker:`full-stream-payload-pattern-${index}`});
  }
 }
 return {filesScanned:files.length,matches,sourcePayloadBytes:raw.length,sourcePayloadSha256:sha(raw)};
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
 return {schemaVersion:1,kind:'alg-l06-p003-continuous-production-plan-v2',
  origin:ORIGIN,buildRoot:BUILD,buildReceipt:RECEIPT,sourceModes:['unset','real-root'],
  routeCount:rs.length,casesPerMode:rs.length*4,expectedCases:rs.length*8,
  routes:rs,inputs,writesPerformed:false};}
async function run(slug,sourceMode){
 assert.equal(process.env.NODE_ENV,'production');
 if(sourceMode==='unset')assert(!Object.hasOwn(process.env,'HELP_MATH_G678_SOURCE_ROOT'));
 else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 const relative=`${OUT}/${slug}-${sourceMode}.json`,absolute=path.join(ROOT,relative);
 assert(!fs.existsSync(absolute),'immutable production receipt');
 const receipt={schemaVersion:1,kind:'alg-l06-p003-continuous-production-negative-v2',
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
  assert.equal(receipt.bundleScan.sourcePayloadBytes,263640);
  assert.equal(receipt.bundleScan.sourcePayloadSha256,AUDIO_SHA);
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
