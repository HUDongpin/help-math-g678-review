#!/usr/bin/env node
/** Reprobe the exact successful v2 build with corrected route-metadata classification. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPageProof,readRegistryTransaction,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {PROOF_PATH,readP010CanonicalSource,validateP010AdmissionSemantics}
 from '../lib/alg-l06-p010-admission-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const BUILD='/Volumes/American Dream/hudongpin/g678-p010-formal-build-output-20260928/next-output-v2';
const LOGICAL='apps/web/.next-alg-p001-production-scan';
const OUTPUT='output/alg-l06-p010-production-v3';
const BUILD_RECEIPT='output/alg-l06-p010-production-v2/build-receipt-v2.json';
const VERIFICATION_TOOLS=Object.freeze([
  'scripts/check-alg-l06-p010-production-v3.mjs',
  'scripts/probe-existing-alg-l06-p010-production-v3.py',
]);
const ORIGIN='http://127.0.0.1:3332';
const ID='shared-alg001-l06-p010';
const DOCUMENT=`/migration-status/g678-calibration/${ID}/candidate-v1`;
const FORMAL_DOCUMENT=`/migration-status/g678-calibration/${ID}/continuous-v1`;
const ACTIVATION='apps/web/lib/g678-admission-activation.ts';
const LESSON_CANVAS_REQUEST='apps/web/lib/alg-l06-p010-lesson-canvas-request-v1.ts';
const LESSON_CANVAS_IDS=Object.freeze([2,5,6,7,9,11,12,30,36,37,39,40,51,52,53,54,55,59]
  .map(number=>`shared-alg001-l06-p${String(number).padStart(3,'0')}`));
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
  'apps/web/lib/alg-l06-p010-formal-admission-v1.server.ts',
  'apps/web/lib/alg-l06-p010-descriptor-extension-v1.ts',
  'apps/web/tests/alg-l06-p010-descriptor-extension-v1.server-test.ts',
  'apps/web/lib/alg-l06-p010-local-request-v1.ts',
  'apps/web/lib/alg-l06-p010-local-request.production-stub.ts',
  'apps/web/lib/alg-l06-p010-resources-v1.server.ts',
  'apps/web/lib/alg-l06-p010-predecessor-request-v1.ts',
  'apps/web/lib/alg-l06-p010-predecessor-request.production-stub.ts',
  'apps/web/lib/alg-l06-p010-predecessor-resources-v1.server.ts',
  LESSON_CANVAS_REQUEST,
  'apps/web/lib/alg-l06-p010-lesson-canvas-request-production-v1.ts',
  'apps/web/lib/alg-l06-p010-lesson-canvas-resources-v1.server.ts',
  'apps/web/tests/alg-l06-p010-lesson-canvas-resource.test.ts',
  `apps/web/app/[locale]/migration-status/g678-calibration/${ID}/candidate-v1/page.tsx`,
  `apps/web/app/[locale]/migration-status/g678-calibration/${ID}/continuous-v1/page.tsx`,
  `apps/web/app/flash-assets/g678-local/${ID}/lesson-canvas/[animationId]/route.ts`,
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
  'packages/demos/src/modules/shared-alg001-l06-p010.tsx',
  'packages/demos/src/timelines/shared-alg001-l06-p010.ts',
  'work/g678-shared-page-factory/g678-alg-l06-p010-current-js-20260928-v1/members/shared-alg001-l06-p010/canvas-renderer.js',
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
  'lib/alg-l06-p010-admission-semantics-v1.mjs',
  'scripts/prepare-alg-l06-p010-admission-v1.mjs',
  'scripts/check-alg-l06-p010-production-v2.mjs',
  'scripts/build-and-probe-alg-l06-p010-production-v2.py',
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
function lessonCanvasResources(transaction){
  const source=fs.readFileSync(path.join(ROOT,LESSON_CANVAS_REQUEST),'utf8');
  const match=source.match(/export const P010_LESSON_CANVAS_RESOURCES=Object\.freeze\((\{[\s\S]*?\}) as const\);/u);
  assert(match,'reviewed exact P010 lesson Canvas resource table');
  const table=JSON.parse(match[1]);
  assert.deepEqual(Object.keys(table).sort(),[...LESSON_CANVAS_IDS].sort(),
    'exact 18 registered lesson Canvas identities');
  const entries=transaction.registry.calibrations.flatMap(c=>c.entries);
  return LESSON_CANVAS_IDS.map(id=>{
    const resource=table[id],rows=entries.filter(row=>row.key===id);
    assert.equal(rows.length,1,`one registered ${id}`);
    const runtime=rows[0].artifacts.runtime;
    const originalPath=`/flash-assets/g678-local/${id}/canvas-renderer.js`;
    const bridgePath=`/flash-assets/g678-local/${ID}/lesson-canvas/${id}`;
    assert.deepEqual(resource,{originalPath,bridgePath,...runtime,
      contentType:'text/javascript; charset=utf-8'},`exact resource binding ${id}`);
    assert.deepEqual(pin(runtime.path),runtime,`physical registered Canvas ${id}`);
    return {id,name:`${id}-canvas`,original:originalPath,bridge:bridgePath,
      path:runtime.path,bytes:runtime.bytes,sha256:runtime.sha256,kind:'script'};
  });
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
  assert.equal(index.pages.length,10,'nine predecessor proofs plus P010');
  assert.equal(new Set(index.pages.map(row=>row.animationId)).size,10,'unique page proofs');
  const own=index.pages.filter(row=>row.animationId===ID);
  assert.equal(own.length,1,'one formal P010 proof');
  assert.equal(own[0].proof.path,PROOF_PATH,'exact P010 proof path');
  for(const prior of ['shared-alg001-l06-p003','shared-alg001-l06-p004','shared-alg001-l06-p008'])
    assert(index.pages.some(row=>row.animationId===prior),`registered predecessor ${prior}`);
  const host=verifyHostVersion(ROOT,index.host);
  const transaction=readRegistryTransaction(ROOT);
  const rows=transaction.registry.calibrations.flatMap(calibration=>calibration.entries);
  const shared=rows.filter(row=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(row.key));
  assert.equal(rows.length,642,'actual registered total including P010');
  assert.equal(shared.length,500,'actual shared G6-G8 including P010');
  assert.equal(rows.filter(row=>row.key===ID).length,1,'P010 formally registered once');
  const proofs=index.pages.map(row=>{
    const packet=readPageProof(ROOT,row.proof,host,transaction);
    assert(packet,'valid page proof');
    const body=JSON.parse(fs.readFileSync(path.join(ROOT,row.proof.path),'utf8'));
    if(row.animationId===ID){
      validateP010AdmissionSemantics(packet,body.registration);
      readP010CanonicalSource(ROOT);
    }
    return {row,body};
  });
  return {index,host,transaction,indexPin:actual,hostPin:index.host,proofs,
    lessonCanvas:lessonCanvasResources(transaction)};
}
function inputClosure(active=activeIndex()){
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'real AWS source root');
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
  const own=active.proofs.find(item=>item.row.animationId===ID)?.body;
  assert(own,'formal P010 proof retained');
  const items=[...PRODUCT_FILES.map(pin),active.indexPin,active.hostPin,
    ...active.host.files,...active.index.pages.map(row=>row.proof),
    ...own.packet.integrity.files,own.packet.freezeManifest,
    ...own.external.map(item=>({...item.pin,path:path.join(item.root,item.pin.path)})),
    ...active.lessonCanvas.map(({path,bytes,sha256})=>({path,bytes,sha256})),
    ...SOURCE_INPUTS,
    ...PHYSICAL_ASSETS.map(({path,bytes,sha256})=>({path,bytes,sha256}))];
  const unique=new Map();for(const item of items){const prior=unique.get(item.path);
    if(prior)assert.deepEqual(prior,item,`duplicate input ${item.path}`);else unique.set(item.path,item);}
  return [...unique.values()].sort((a,b)=>a.path.localeCompare(b.path));
}
function assets(lessonCanvas){
  return [...PHYSICAL_ASSETS.map(({name,url,sha256,kind})=>({name,path:url,sha256,kind})),
    ...PREDECESSORS.flatMap(({name,original,bridge,sha256,kind})=>[
      {name:`${name}-bridge`,path:bridge,sha256,kind},
      {name:`${name}-original`,path:original,sha256,kind}]),
    ...lessonCanvas.flatMap(({name,original,bridge,sha256,kind})=>[
      {name:`${name}-bridge`,path:bridge,sha256,kind},
      {name:`${name}-original`,path:original,sha256,kind}])];
}
function routes(lessonCanvas){
  const documents=[DOCUMENT,FORMAL_DOCUMENT];
  const pageQueries=['','?mode=focus','?_rsc=abc_123','?frame=17','?level=2'];
  const pages=['en','es'].flatMap(locale=>documents.flatMap(document=>pageQueries.map(query=>
    ({path:`/${locale}${document}${query}`,kind:'page',locale,
      variant:query||'plain-page'}))));
  for(const document of documents)for(const query of ['','?mode=focus'])
    pages.push({path:`${document}${query}`,kind:'page',locale:'en',variant:'no-locale'});
  const resources=['en','es'].flatMap(locale=>assets(lessonCanvas).flatMap(asset=>{
    const exact=`${asset.path}?sha256=${asset.sha256}`;
    return [{path:exact,variant:'candidate-exact',referrerDocument:DOCUMENT},
      {path:exact,variant:'candidate-focus',referrerDocument:`${DOCUMENT}?mode=focus`},
      {path:exact,variant:'formal-exact',referrerDocument:FORMAL_DOCUMENT},
      {path:exact,variant:'formal-focus',referrerDocument:`${FORMAL_DOCUMENT}?mode=focus`},
      {path:asset.path,variant:'missing-hash',referrerDocument:DOCUMENT},
      {path:`${asset.path}?sha256=${'0'.repeat(64)}`,variant:'wrong-hash',referrerDocument:DOCUMENT},
      {path:exact,variant:'range',referrerDocument:DOCUMENT}]
      .map(row=>({...row,kind:asset.kind,locale,resource:asset.name}));
  }));
  const result=[...pages,...resources];
  assert.equal(result.length,822,'24 page routes plus 57 asset paths × 2 locales × 7 variants');
  assert.equal(new Set(result.filter(row=>row.kind!=='page').map(row=>row.resource)).size,57);
  return result;
}
/** Route math and registered bridge pins can be reviewed before P010 admission.
 * This is never a substitute for the post-registration production --plan. */
export function planRouteMatrix(){
  const lessonCanvas=lessonCanvasResources(readRegistryTransaction(ROOT));
  const list=routes(lessonCanvas);
  return {lessonCanvasBridgeCount:lessonCanvas.length,routeCount:list.length,
    casesPerMode:list.length*6,expectedCases:list.length*12,
    originalPaths:lessonCanvas.map(item=>item.original),
    bridgePaths:lessonCanvas.map(item=>item.bridge),writesPerformed:false};
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
function payloadMarkers(lessonCanvas){
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
  for(const asset of lessonCanvas){
    const absolute=path.join(ROOT,asset.path);
    const fd=fs.openSync(absolute,'r');
    try{
      for(const offset of [8190,Math.min(16383,asset.bytes-96)]){
        const excerpt=Buffer.alloc(96);
        assert.equal(fs.readSync(fd,excerpt,0,96,offset),96,`complete ${asset.name} excerpt`);
        result.push({name:`${asset.name}@${offset}`,bytes:excerpt},
          {name:`${asset.name}@${offset}-base64`,bytes:Buffer.from(excerpt.toString('base64'))});
      }
    }finally{fs.closeSync(fd);}
  }
  return result;
}
const BASE_RUNTIME_MARKERS=[
  'P010_CANVAS_ASSET_IDENTITY_MISMATCH','P010_BROWSER_DECODER',
  'P010_TIMELINE','data-p010-native-text','data-p010-player',
  'P010_RESOURCE_LOCAL_ONLY','P010_CANDIDATE_INVALID',
  'P010_FORMAL_EXACT_V1_ADMISSION','P010_FORMAL_LOCAL_ONLY',
  'G6-G8-shared/ALG001/L6/RW/L6RW09.swf',
  SOURCE_INPUTS[0].sha256,
  ...PHYSICAL_ASSETS.map(asset=>asset.sha256),
];
const runtimeMarkers=lessonCanvas=>[...BASE_RUNTIME_MARKERS,
  ...lessonCanvas.flatMap(asset=>[asset.original,asset.bridge,asset.sha256])];
const P002_ORIGINAL='/flash-assets/g678-local/shared-alg001-l06-p002/canvas-renderer.js';
const EXPECTED_ROUTE_METADATA=Object.freeze([
  {path:'server/app-paths-manifest.json',marker:P002_ORIGINAL,
    disposition:'Next route pathname-to-bundle mapping'},
  {path:'server/app/flash-assets/g678-local/shared-alg001-l06-p002/canvas-renderer.js/route.js',
    marker:P002_ORIGINAL,disposition:'AppRouteRouteModule route identity'},
  {path:'server/app/flash-assets/g678-local/shared-alg001-l06-p002/canvas-renderer.js/route_client-reference-manifest.js',
    marker:P002_ORIGINAL,disposition:'RSC route manifest key'},
]);
function reviewedRouteMetadata(relative,body,marker){
  const expected=EXPECTED_ROUTE_METADATA.find(item=>item.path===relative&&item.marker===marker);
  if(!expected)return null;
  if(relative==='server/app-paths-manifest.json'){
    const routes=JSON.parse(body.toString());
    assert.equal(routes[`${marker}/route`],
      'app/flash-assets/g678-local/shared-alg001-l06-p002/canvas-renderer.js/route.js');
  }else if(relative.endsWith('/route.js')){
    assert(body.includes(Buffer.from('AppRouteRouteModule')));
    assert(body.includes(Buffer.from(`pathname:"${marker}"`)));
  }else{
    assert(body.includes(Buffer.from('globalThis.__RSC_MANIFEST')));
    assert(body.includes(Buffer.from(`"${marker}/route"`)));
  }
  return expected;
}
function bundleScan(lessonCanvas){
  const patterns=payloadMarkers(lessonCanvas);
  const originals=lessonCanvas.map(asset=>asset.original);
  const markers=runtimeMarkers(lessonCanvas).filter(marker=>!originals.includes(marker));
  const matches=[],routeMetadataObservations=[],counts={client:0,server:0};
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
        for(const marker of markers)if(body.includes(Buffer.from(marker)))
          matches.push({path:relative,marker});
        for(const marker of originals)if(body.includes(Buffer.from(marker))){
          const observation=reviewedRouteMetadata(relative,body,marker);
          if(observation)routeMetadataObservations.push(observation);
          else matches.push({path:relative,marker});
        }
        for(const pattern of patterns)if(body.includes(pattern.bytes))
          matches.push({path:relative,marker:pattern.name});
      }
    }
  }
  assert(counts.client>0&&counts.server>0,'both client and server bundle trees scanned');
  routeMetadataObservations.sort((a,b)=>a.path.localeCompare(b.path));
  return {counts,matches,routeMetadataObservations,
    physicalPayloads:[...PHYSICAL_ASSETS,...lessonCanvas]
    .map(({name,bytes,sha256})=>({name,bytes,sha256}))};
}
function buildBinding(){
  const logical=path.join(ROOT,LOGICAL);
  assert(fs.lstatSync(logical).isSymbolicLink(),'temporary logical build symlink');
  assert.equal(fs.readlinkSync(logical),BUILD,'exact P010 physical build target');
  assert.equal(fs.realpathSync(BUILD),BUILD,'physical build root');
  return {logicalPath:LOGICAL,physicalRoot:BUILD,buildId:{...pin(path.join(BUILD,'BUILD_ID')),path:`${LOGICAL}/BUILD_ID`}};
}
async function smallBody(response,lessonCanvas){
  if(!response.body)return {bytes:0,leak:false};
  const reader=response.body.getReader();let size=0;const chunks=[];
  try{for(;;){const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;
    chunks.push(Buffer.from(value));
    if(size>=1000)break;}}
  finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  const body=Buffer.concat(chunks);
  return {bytes:size,leak:runtimeMarkers(lessonCanvas)
    .some(marker=>body.includes(Buffer.from(marker)))};
}
async function requestCase(route,method,mode,lessonCanvas){
  const response=await fetch(ORIGIN+route.path,{method,headers:headers(route,mode),
    redirect:'manual',signal:AbortSignal.timeout(15000)});
  const body=await smallBody(response,lessonCanvas),redirected=response.headers.get('location')!==null;
  return {...route,method,mode,status:response.status,bodyBytes:body.bytes,redirected,
    leak:body.leak,pass:response.status===404&&body.bytes<1000&&!body.leak&&!redirected};
}
export function planProduction(){
  const active=activeIndex(),inputs=inputClosure(active),list=routes(active.lessonCanvas);
  return {schemaVersion:1,kind:'alg-l06-p010-production-negative-plan-v3',
    origin:ORIGIN,buildRoot:BUILD,logicalBuildPath:LOGICAL,buildReceipt:BUILD_RECEIPT,
    verificationTools:VERIFICATION_TOOLS.map(pin),
    expectedRouteMetadataObservations:EXPECTED_ROUTE_METADATA,
    sourceModes:['unset','real-root'],headerModes:['anonymous','production-shaped','development-shaped'],
    routeCount:list.length,casesPerMode:list.length*2*3,expectedCases:list.length*2*3*2,
    pageProofCount:active.index.pages.length,sharedRegistered:500,totalRegistered:642,
    lessonCanvasBridgeCount:active.lessonCanvas.length,
    routes:list,inputs,writesPerformed:false};
}
async function run(slug,sourceMode){
  assert.equal(process.env.NODE_ENV,'production');
  if(sourceMode==='unset')assert(!Object.hasOwn(process.env,'HELP_MATH_G678_SOURCE_ROOT'));
  else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
  const active=activeIndex(),list=routes(active.lessonCanvas);
  const relative=`${OUTPUT}/negative/${slug}-${sourceMode}.json`,absolute=path.join(ROOT,relative);
  assert(!fs.existsSync(absolute),'immutable negative receipt');
  const receipt={schemaVersion:1,kind:'alg-l06-p010-production-negative-v3',sourceMode,
    origin:ORIGIN,startedAt:new Date().toISOString(),status:'running',expectedCases:list.length*6,
    results:[],errors:[]};
  try{
    receipt.verificationToolsBefore=VERIFICATION_TOOLS.map(pin);
    receipt.binding=buildBinding();
    receipt.inputsBefore=[...inputClosure(active),pin(BUILD_RECEIPT),receipt.binding.buildId];
    const build=JSON.parse(fs.readFileSync(path.join(ROOT,BUILD_RECEIPT),'utf8'));
    assert.equal(build.exitCode,0);assert.equal(build.inputsStable,true);
    assert.equal(build.configRestored,true);
    assert.deepEqual(build.inputsAfter,inputClosure(active));
    assert.deepEqual(build.buildId,receipt.binding.buildId);
    receipt.bundleScan=bundleScan(active.lessonCanvas);
    assert.deepEqual(receipt.bundleScan.routeMetadataObservations,EXPECTED_ROUTE_METADATA,
      'only the three reviewed P002 original-route metadata observations');
    assert.deepEqual(receipt.bundleScan.matches,[],'P010 source/runtime leaked into production build');
    for(const route of list)for(const method of ['GET','HEAD'])
      for(const mode of ['anonymous','production-shaped','development-shaped']){
        try{receipt.results.push(await requestCase(route,method,mode,active.lessonCanvas));}
        catch(error){receipt.results.push({...route,method,mode,pass:false,error:String(error)});}
      }
  }catch(error){receipt.errors.push(String(error?.stack??error));}
  finally{
    try{const binding=buildBinding();receipt.inputsAfter=[...inputClosure(),pin(BUILD_RECEIPT),binding.buildId];}
    catch(error){receipt.errors.push(`post-check: ${String(error)}`);}
    try{receipt.verificationToolsAfter=VERIFICATION_TOOLS.map(pin);}
    catch(error){receipt.errors.push(`verification-tool post-check: ${String(error)}`);}
    receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);
    receipt.verificationToolsStable=JSON.stringify(receipt.verificationToolsBefore)===
      JSON.stringify(receipt.verificationToolsAfter);
    receipt.status=receipt.errors.length===0&&receipt.inputsStable&&receipt.verificationToolsStable&&
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
