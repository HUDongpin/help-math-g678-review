#!/usr/bin/env node
/** Fresh-build production denial for local-only P010 My Lesson routes and assets. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPageProof,readRegistryTransaction,verifyHostVersion} from '../lib/g678-admission-proof.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const BUILD='/Volumes/American Dream/hudongpin/g678-p010-candidate-build-output-20260928/next-output-v1';
const LOGICAL='apps/web/.next-alg-p001-production-scan';
const OUTPUT='output/alg-l06-p010-production-v1';
const BUILD_RECEIPT=`${OUTPUT}/build-receipt-v1.json`;
const ORIGIN='http://127.0.0.1:3332';
const ID='shared-alg001-l06-p010';
const DOCUMENT=`/migration-status/g678-calibration/${ID}/candidate-v1`;
const FORMAL_DOCUMENT=`/migration-status/g678-calibration/${ID}/continuous-v1`;
const ACTIVATION='apps/web/lib/g678-admission-activation.ts';
const SOURCE_SWF=`${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/RW/L6RW09.swf`;
const SOURCE_SA=`${SOURCE_ROOT}/G6-G8-shared/ALG001/L6/SA/L6RW09.mp3`;
const PHYSICAL_ASSETS=Object.freeze([
  {name:'p010-canvas',path:'output/alg-l06-p010-canvas-v1/canvas-renderer.js',
    url:`/flash-assets/g678-local/${ID}/canvas-v1`,bytes:1154661,
    sha256:'0a1aa913455ff358ceec7674e7f73fa6c27f59a054fc8d43f41e7bc91b8720c1',kind:'script'},
  {name:'p010-main',path:'migrations/shared-alg001-l06-p010/audit/audio-v1/continuous-source-v1.mp3',
    url:`/flash-assets/g678-local/${ID}/continuous-source-v1`,bytes:124280,
    sha256:'f5c71e9d066a0d2ce37be7afd20c3d1f8182b5c2c7b6a06a38c131074093fa89',kind:'audio'},
  {name:'p010-spanish',path:'migrations/shared-alg001-l06-p010/audit/audio-v1/separate-sa-source-v1.mp3',
    url:`/flash-assets/g678-local/${ID}/optional-spanish-audio-v1`,bytes:301056,
    sha256:'903c1bd16cebf9f1ceda0d9b8a47905cae20f380bb857fa33fc855a6db350275',kind:'audio'},
]);
const PREDECESSORS=Object.freeze([
  {name:'p008-canvas',original:'/flash-assets/g678-local/shared-alg001-l06-p008/canvas-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p008/canvas`,sha256:'ef40a85081b1cd131e3751fbaec8242a847592247f1b1992f681dd499309c33e',kind:'script'},
  {name:'p008-main',original:'/flash-assets/g678-local/shared-alg001-l06-p008/continuous-source-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p008/main`,sha256:'ab14ce47d0f98c841213b222f27e7bc44587ba27849048ed1dd16bd41c2eabe2',kind:'audio'},
  {name:'p008-spanish',original:'/flash-assets/g678-local/shared-alg001-l06-p008/optional-spanish-audio-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p008/spanish`,sha256:'ca48f20431673bb4e6f17c28cb605134f4098161bbcb93cc82c274cb472466f3',kind:'audio'},
  {name:'p004-canvas',original:'/flash-assets/g678-local/shared-alg001-l06-p004/canvas-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p004/canvas`,sha256:'6b6f124262c8b90517151ea77eee43a30843c170211d4cd76404e584c876c2d8',kind:'script'},
  {name:'p004-main',original:'/flash-assets/g678-local/shared-alg001-l06-p004/continuous-source-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p004/main`,sha256:'e8f5307618bd63789f468c7a056cf80ae7828f17b665a24893fafc3ad8bb7f7e',kind:'audio'},
  {name:'p004-spanish',original:'/flash-assets/g678-local/shared-alg001-l06-p004/optional-spanish-audio-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p004/spanish`,sha256:'08bb62e9c1d92235c2e3fb96c44d44fc16b92ca7d175274e4c809f06bcfda8a5',kind:'audio'},
  {name:'p003-canvas',original:'/flash-assets/g678-local/shared-alg001-l06-p003/canvas-renderer.js',bridge:`/flash-assets/g678-local/${ID}/predecessor/p003/canvas`,sha256:'87694adc7d08f6f95069deede781410ab912a24a44a6cfce0fc05a43118f205c',kind:'script'},
  {name:'p003-main',original:'/flash-assets/g678-local/shared-alg001-l06-p003/continuous-source-v2',bridge:`/flash-assets/g678-local/${ID}/predecessor/p003/main`,sha256:'91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111',kind:'audio'},
  {name:'p003-spanish',original:'/flash-assets/g678-local/shared-alg001-l06-p003/optional-spanish-audio-v1',bridge:`/flash-assets/g678-local/${ID}/predecessor/p003/spanish`,sha256:'d280e8f5e653c165755baf2f8960cfd667f03205d2f9aaafe1820a15d327f89a',kind:'audio'},
]);
const SOURCE_INPUTS=[
  {path:SOURCE_SWF,bytes:114334,sha256:'96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14'},
  {path:SOURCE_SA,bytes:301056,sha256:PHYSICAL_ASSETS[2].sha256},
];
const PRODUCT_FILES=[
  'apps/web/next.config.ts','apps/web/proxy.ts',
  'apps/web/lib/alg-l06-p010-candidate-v1.server.ts',
  'apps/web/lib/alg-l06-p010-local-request-v1.ts',
  'apps/web/lib/alg-l06-p010-local-request.production-stub.ts',
  'apps/web/lib/alg-l06-p010-resources-v1.server.ts',
  'apps/web/lib/alg-l06-p010-predecessor-request-v1.ts',
  'apps/web/lib/alg-l06-p010-predecessor-request.production-stub.ts',
  'apps/web/lib/alg-l06-p010-predecessor-resources-v1.server.ts',
  `apps/web/app/[locale]/migration-status/g678-calibration/${ID}/candidate-v1/page.tsx`,
  ...['canvas-v1','continuous-source-v1','optional-spanish-audio-v1',
    'predecessor/p008/canvas','predecessor/p008/main','predecessor/p008/spanish',
    'predecessor/p003/canvas','predecessor/p003/main','predecessor/p003/spanish',
    'predecessor/p004/canvas','predecessor/p004/main','predecessor/p004/spanish']
    .map(suffix=>`apps/web/app/flash-assets/g678-local/${ID}/${suffix}/route.ts`),
  'apps/web/components/g678-alg-l06-p010-host-lesson-v1.tsx',
  'apps/web/components/g678-alg-l06-p010-runtime-v1.tsx',
  'packages/demos/src/alg-l06-p010-player-v1.tsx',
  'packages/demos/src/alg-l06-p010-native-text-v1.tsx',
  'packages/demos/src/generated/alg-l06-p010-text-state-v1.ts',
  'packages/demos/src/generated/alg-l06-p010-canvas-v1.ts',
  'packages/demos/src/alg-l06-p010-clock-v1.ts',
  'packages/demos/src/alg-l06-p010-optional-spanish-audio-v1.ts',
  'packages/demos/src/alg-l06-p010-timeline-v1.ts',
  'packages/demos/src/alg-l06-p010-audio-owner-v1.ts',
  'packages/demos/src/alg-l06-p010-audio-schedule-v1.ts',
  'packages/demos/src/continuous-source-stream-clock-candidate.ts',
  'packages/demos/src/decoded-source-stream-transport.ts',
  'migrations/shared-alg001-l06-p010/audit/source-v1/source-audit-v1.json',
  'migrations/shared-alg001-l06-p010/audit/source-v1/conditional-host-terminal-v1.json',
  'migrations/shared-alg001-l06-p010/audit/audio-v1/audio-source-audit-v1.json',
  'migrations/shared-alg001-l06-p010/audit/sa-host-v1/sa-host-disposition-v1.json',
  'migrations/shared-alg001-l06-p010/audit/text-state-v1/source-ir-v1.json',
  'migrations/shared-alg001-l06-p010/audit/text-state-v1/text-state-audit-v1.json',
  'output/playwright/alg-l06-p010-browser-audio-v1/decode-receipt.json',
  'output/alg-l06-p010-canvas-v1/canvas-manifest.json',
  'scripts/audit-alg-l06-p010-source-v1.mjs',
  'scripts/export-alg-l06-p010-canvas-v1.mjs',
  'scripts/build-alg-l06-p010-canvas-v1.mjs',
  'scripts/build-alg-l06-p010-text-state-v1.mjs',
  'scripts/extract-alg-l06-p010-audio-v1.mjs',
  'scripts/check-alg-l06-p010-production-v1.mjs',
  'scripts/build-and-probe-alg-l06-p010-production-v1.py',
  ACTIVATION,'packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
];
const sha=body=>createHash('sha256').update(body).digest('hex');
function pin(file){
  const absolute=path.isAbsolute(file)?file:path.join(ROOT,file);
  assert.equal(fs.realpathSync(absolute),absolute,`physical file ${file}`);
  const before=fs.lstatSync(absolute,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file ${file}`);
  const body=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
  for(const field of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])
    assert.equal(before[field],after[field],`stable file ${file}:${field}`);
  return {path:file,bytes:body.length,sha256:sha(body)};
}
function activeIndex(){
  const activation=fs.readFileSync(path.join(ROOT,ACTIVATION),'utf8');
  const match=activation.match(/export const G678_ADMISSION_INDEX = (\{[\s\S]*?\}) as const;/u);
  assert(match,'activation index pin');
  const expected=JSON.parse(match[1]),actual=pin(expected.path);
  assert.deepEqual(actual,expected,'active index physical pin');
  const index=JSON.parse(fs.readFileSync(path.join(ROOT,expected.path),'utf8'));
  assert.equal(index.kind,'g678-admission-index-v1');
  assert.deepEqual(pin(index.host.path),index.host,'active host physical pin');
  assert(index.host.path.startsWith('catalog/g678-admission-v1/host-v'),'reviewed host path');
  assert.equal(index.pages.length,9,'nine existing predecessor proofs');
  assert.equal(new Set(index.pages.map(row=>row.animationId)).size,9,'unique predecessor proofs');
  assert(!index.pages.some(row=>row.animationId===ID),'P010 has no formal proof');
  for(const prior of ['shared-alg001-l06-p003','shared-alg001-l06-p004','shared-alg001-l06-p008'])
    assert(index.pages.some(row=>row.animationId===prior),`registered predecessor ${prior}`);
  const host=verifyHostVersion(ROOT,index.host);
  const transaction=readRegistryTransaction(ROOT);
  const rows=transaction.registry.calibrations.flatMap(calibration=>calibration.entries);
  const shared=rows.filter(row=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(row.key));
  assert.equal(rows.length,641,'actual registered total before P010');
  assert.equal(shared.length,499,'actual shared G6-G8 before P010');
  assert.equal(rows.filter(row=>row.key===ID).length,0,'P010 remains unregistered');
  const proofs=index.pages.map(row=>{
    const packet=readPageProof(ROOT,row.proof,host,transaction);
    assert(packet,'valid predecessor proof');
    return {row,body:JSON.parse(fs.readFileSync(path.join(ROOT,row.proof.path),'utf8'))};
  });
  return {index,host,transaction,indexPin:actual,hostPin:index.host,proofs};
}
function inputClosure(){
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'real AWS source root');
  const active=activeIndex();
  for(const expected of SOURCE_INPUTS)assert.deepEqual(pin(expected.path),expected,`source ${expected.path}`);
  for(const expected of PHYSICAL_ASSETS)assert.deepEqual(pin(expected.path),
    {path:expected.path,bytes:expected.bytes,sha256:expected.sha256},`asset ${expected.name}`);
  const requestSource=fs.readFileSync(path.join(ROOT,'apps/web/lib/alg-l06-p010-local-request-v1.ts'),'utf8');
  assert(requestSource.includes(`const ID='${ID}'`),'P010 request resource identity');
  for(const asset of PHYSICAL_ASSETS)assert(requestSource.includes(asset.sha256)&&
    requestSource.includes(`/${asset.url.split('/').at(-1)}`),
    `P010 guard binds ${asset.name}`);
  const bridgeSource=fs.readFileSync(path.join(ROOT,'apps/web/lib/alg-l06-p010-predecessor-request-v1.ts'),'utf8');
  assert(bridgeSource.includes(`const ROOT='/flash-assets/g678-local/${ID}/predecessor'`),
    'P010 predecessor bridge root');
  for(const asset of PREDECESSORS)assert(bridgeSource.includes(asset.name.replace('-',
    '').replace(/^p(\d{3})([a-z])/u,(_match,number,letter)=>`p${number}${letter.toUpperCase()}`)),
    `bridge ${asset.name}`);
  const items=[...PRODUCT_FILES.map(pin),active.indexPin,active.hostPin,
    ...active.host.files,...active.index.pages.map(row=>row.proof),
    ...SOURCE_INPUTS,
    ...PHYSICAL_ASSETS.map(({path,bytes,sha256})=>({path,bytes,sha256}))];
  const unique=new Map();for(const item of items){const prior=unique.get(item.path);
    if(prior)assert.deepEqual(prior,item,`duplicate input ${item.path}`);else unique.set(item.path,item);}
  return [...unique.values()].sort((a,b)=>a.path.localeCompare(b.path));
}
function assets(){
  return [...PHYSICAL_ASSETS.map(({name,url,sha256,kind})=>({name,path:url,sha256,kind})),
    ...PREDECESSORS.flatMap(({name,original,bridge,sha256,kind})=>[
      {name:`${name}-bridge`,path:bridge,sha256,kind},
      {name:`${name}-original`,path:original,sha256,kind}])];
}
function routes(){
  const pages=['en','es'].flatMap(locale=>[DOCUMENT,`${DOCUMENT}?_rsc=abc_123`,
    `${DOCUMENT}?frame=17`,`${DOCUMENT}?level=2`,FORMAL_DOCUMENT,
    `${FORMAL_DOCUMENT}?_rsc=abc_123`,`${FORMAL_DOCUMENT}?frame=17`,
    `${FORMAL_DOCUMENT}?level=2`]
    .map(suffix=>({path:`/${locale}${suffix}`,kind:'page',locale,variant:'page'})));
  pages.push({path:DOCUMENT,kind:'page',locale:'en',variant:'no-locale'},
    {path:FORMAL_DOCUMENT,kind:'page',locale:'en',variant:'no-locale'});
  const resources=['en','es'].flatMap(locale=>assets().flatMap(asset=>{
    const exact=`${asset.path}?sha256=${asset.sha256}`;
    return [{path:exact,variant:'exact'},
      {path:asset.path,variant:'missing-hash'},
      {path:`${asset.path}?sha256=${'0'.repeat(64)}`,variant:'wrong-hash'},
      {path:exact,variant:'range'},
      {path:exact,variant:'formal-exact',referrerDocument:FORMAL_DOCUMENT}]
      .map(row=>({...row,kind:asset.kind,locale,resource:asset.name}));
  }));
  const result=[...pages,...resources];
  assert.equal(result.length,228,'18 P010 pages plus 21 asset paths × 2 locales × 5 variants');
  assert.equal(new Set(result.filter(row=>row.kind!=='page').map(row=>row.resource)).size,21);
  return result;
}
function headers(route,mode){
  if(mode==='anonymous')return {};
  const candidateOrigin=mode==='development-shaped'?'http://127.0.0.1:3331':ORIGIN;
  const page=route.kind==='page',script=route.kind==='script';
  return {host:mode==='development-shaped'?'127.0.0.1:3331':'127.0.0.1:3332',
    referer:`${candidateOrigin}/${route.locale}${route.referrerDocument??DOCUMENT}`,
    ...(!page&&!script?{origin:candidateOrigin}:{}),
    'sec-fetch-site':'same-origin',
    'sec-fetch-mode':page?'navigate':script?'no-cors':'cors',
    'sec-fetch-dest':page?'document':script?'script':'empty',
    ...(route.variant==='range'?{range:'bytes=0-99'}:{}),
  };
}
function payloadMarkers(){
  const result=[];
  for(const asset of PHYSICAL_ASSETS){
    const raw=fs.readFileSync(path.join(ROOT,asset.path));
    assert.equal(raw.length,asset.bytes);assert.equal(sha(raw),asset.sha256);
    const offsets=asset.name==='p010-main'?[8190,32768]:[8190,16383];
    for(const offset of offsets){const excerpt=raw.subarray(offset,offset+96);
      assert.equal(excerpt.length,96,`complete ${asset.name} payload excerpt`);
      result.push({name:`${asset.name}@${offset}`,bytes:excerpt},
        {name:`${asset.name}@${offset}-base64`,bytes:Buffer.from(excerpt.toString('base64'))});
    }
  }
  return result;
}
const RUNTIME_MARKERS=[
  'P010_CANVAS_ASSET_IDENTITY_MISMATCH','P010_BROWSER_DECODER',
  'P010_TIMELINE','data-p010-native-text','data-p010-player',
  'P010_RESOURCE_LOCAL_ONLY','P010_CANDIDATE_INVALID',
  'G6-G8-shared/ALG001/L6/RW/L6RW09.swf',
  SOURCE_INPUTS[0].sha256,
  ...PHYSICAL_ASSETS.map(asset=>asset.sha256),
];
function bundleScan(){
  const patterns=payloadMarkers(),matches=[],counts={client:0,server:0};
  for(const category of ['client','server']){
    const root=path.join(BUILD,category==='client'?'static':'server');
    assert(fs.lstatSync(root).isDirectory(),`fresh build ${category} tree`);
    const pending=[root];
    while(pending.length){const folder=pending.pop();
      for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
        assert(!entry.isSymbolicLink(),`bundle symlink ${entry.name}`);
        const file=path.join(folder,entry.name);
        if(entry.isDirectory()){pending.push(file);continue;}
        assert(entry.isFile(),`ordinary bundle file ${entry.name}`);
        counts[category]++;
        const body=fs.readFileSync(file),relative=path.relative(BUILD,file);
        for(const marker of RUNTIME_MARKERS)if(body.includes(Buffer.from(marker)))
          matches.push({path:relative,marker});
        for(const pattern of patterns)if(body.includes(pattern.bytes))
          matches.push({path:relative,marker:pattern.name});
      }
    }
  }
  assert(counts.client>0&&counts.server>0,'both client and server bundle trees scanned');
  return {counts,matches,physicalPayloads:PHYSICAL_ASSETS.map(({name,bytes,sha256})=>({name,bytes,sha256}))};
}
function buildBinding(){
  const logical=path.join(ROOT,LOGICAL);
  assert(fs.lstatSync(logical).isSymbolicLink(),'temporary logical build symlink');
  assert.equal(fs.readlinkSync(logical),BUILD,'exact P010 physical build target');
  assert.equal(fs.realpathSync(BUILD),BUILD,'physical build root');
  return {logicalPath:LOGICAL,physicalRoot:BUILD,buildId:{...pin(path.join(BUILD,'BUILD_ID')),path:`${LOGICAL}/BUILD_ID`}};
}
async function smallBody(response){
  if(!response.body)return {bytes:0,leak:false};
  const reader=response.body.getReader();let size=0,leak=false;
  try{for(;;){const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;
    const chunk=Buffer.from(value);
    if(RUNTIME_MARKERS.some(marker=>chunk.includes(Buffer.from(marker)))||
       PHYSICAL_ASSETS.some(asset=>chunk.includes(Buffer.from(asset.sha256))))leak=true;
    if(size>=1000)break;}}
  finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  return {bytes:size,leak};
}
async function requestCase(route,method,mode){
  const response=await fetch(ORIGIN+route.path,{method,headers:headers(route,mode),
    redirect:'manual',signal:AbortSignal.timeout(15000)});
  const body=await smallBody(response),redirected=response.headers.get('location')!==null;
  return {...route,method,mode,status:response.status,bodyBytes:body.bytes,redirected,
    leak:body.leak,pass:response.status===404&&body.bytes<1000&&!body.leak&&!redirected};
}
export function planProduction(){
  const inputs=inputClosure(),list=routes();
  return {schemaVersion:1,kind:'alg-l06-p010-production-negative-plan-v1',
    origin:ORIGIN,buildRoot:BUILD,logicalBuildPath:LOGICAL,buildReceipt:BUILD_RECEIPT,
    sourceModes:['unset','real-root'],headerModes:['anonymous','production-shaped','development-shaped'],
    routeCount:list.length,casesPerMode:list.length*2*3,expectedCases:list.length*2*3*2,
    routes:list,inputs,writesPerformed:false};
}
async function run(slug,sourceMode){
  assert.equal(process.env.NODE_ENV,'production');
  if(sourceMode==='unset')assert(!Object.hasOwn(process.env,'HELP_MATH_G678_SOURCE_ROOT'));
  else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
  const relative=`${OUTPUT}/negative/${slug}-${sourceMode}.json`,absolute=path.join(ROOT,relative);
  assert(!fs.existsSync(absolute),'immutable negative receipt');
  const receipt={schemaVersion:1,kind:'alg-l06-p010-production-negative-v1',sourceMode,
    origin:ORIGIN,startedAt:new Date().toISOString(),status:'running',expectedCases:routes().length*6,
    results:[],errors:[]};
  try{
    receipt.binding=buildBinding();
    receipt.inputsBefore=[...inputClosure(),pin(BUILD_RECEIPT),receipt.binding.buildId];
    const build=JSON.parse(fs.readFileSync(path.join(ROOT,BUILD_RECEIPT),'utf8'));
    assert.equal(build.exitCode,0);assert.equal(build.inputsStable,true);
    assert.equal(build.configRestored,true);
    assert.deepEqual(build.inputsAfter,inputClosure());
    assert.deepEqual(build.buildId,receipt.binding.buildId);
    receipt.bundleScan=bundleScan();
    assert.deepEqual(receipt.bundleScan.matches,[],'P010 source/runtime leaked into production build');
    for(const route of routes())for(const method of ['GET','HEAD'])
      for(const mode of ['anonymous','production-shaped','development-shaped']){
        try{receipt.results.push(await requestCase(route,method,mode));}
        catch(error){receipt.results.push({...route,method,mode,pass:false,error:String(error)});}
      }
  }catch(error){receipt.errors.push(String(error?.stack??error));}
  finally{
    try{const binding=buildBinding();receipt.inputsAfter=[...inputClosure(),pin(BUILD_RECEIPT),binding.buildId];}
    catch(error){receipt.errors.push(`post-check: ${String(error)}`);}
    receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);
    receipt.status=receipt.errors.length===0&&receipt.inputsStable&&
      receipt.results.length===receipt.expectedCases&&receipt.results.every(item=>item.pass)
      ?'technical-pass-not-deployment':'failed';
    receipt.finishedAt=new Date().toISOString();
    fs.mkdirSync(path.dirname(absolute),{recursive:true});
    fs.writeFileSync(absolute,`${JSON.stringify(receipt,null,2)}\n`,{flag:'wx'});
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
