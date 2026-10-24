import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),BASE='http://127.0.0.1:3326';
const OUT='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f/frozen-glossary-prepared-admission-v1';
const MANIFEST='work/g678-shared-page-factory/frozen16-glossary-candidates-v3/manifest.json';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async p=>{const b=await readFile(path.resolve(ROOT,p));return{path:p,bytes:b.length,sha256:sha(b)};};
const manifest=JSON.parse(await readFile(path.join(ROOT,MANIFEST),'utf8'));
for(const p of [...manifest.inputs,...manifest.outputs])assert.deepEqual(await pin(p.path),p);
const inputs=await Promise.all([MANIFEST,'packages/demos/private-current-js-registry.json','scripts/qa-frozen-glossary-prepared-module-admission.mjs',...manifest.entries.map(e=>e.artifacts.runtime.path)].map(pin));
await mkdir(OUT);const save=(f,v)=>writeFile(path.join(OUT,f),typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'});
await save('inputs.json',inputs);await save('runner.mjs',await readFile(fileURLToPath(import.meta.url)));
const browser=await chromium.launch({headless:true}),records=[];
try{for(const entry of manifest.entries){
 const record={id:entry.key,status:'running',errors:[],network:[],assets:[]};records.push(record);
 // Qualification fixture for the real generated module's asynchronous import.
 // It is explicitly not a My Lesson test and supplies no replacement source asset.
 const code=`window.__admissionStarted=performance.now();import(${JSON.stringify('./'+entry.artifacts.module.path)}).then(m=>{window.__admissionResult={at:performance.now(),preparation:m.MODULE_PREPARATION,key:m.default.key,rendererType:typeof m.default.Renderer};}).catch(e=>window.__admissionFailure=String(e));`;
 const bundled=await build({stdin:{contents:code,resolveDir:ROOT,sourcefile:'prepared-admission-entry.mjs'},bundle:true,write:false,format:'esm',platform:'browser',target:'esnext',define:{'process.env.NODE_ENV':'"development"'}});
 const bytes=Buffer.from(bundled.outputFiles[0].contents);await save(entry.key+'.mjs',bytes);
 record.bundle={bytes:bytes.length,sha256:sha(bytes)};
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),tasks=[];
 page.on('pageerror',e=>record.errors.push(e.message));
 await context.route('**/*',async route=>{const u=new URL(route.request().url());record.network.push(u.href);
  if(u.origin!==BASE)return route.abort();
  if(u.pathname==='/__prepared-admission-fixture')return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html lang="en"><title>Unregistered module admission qualification</title><script type="module" src="/__prepared-admission-entry.mjs"></script><body>Unregistered module admission qualification</body></html>'});
  if(u.pathname==='/__prepared-admission-entry.mjs')return route.fulfill({status:200,contentType:'text/javascript',body:bytes});
  if(u.pathname===entry.runtime.canvasRenderer.url){await new Promise(r=>setTimeout(r,1000));return route.continue();}
  return route.abort();
 });
 page.on('response',r=>{if(new URL(r.url()).pathname===entry.runtime.canvasRenderer.url)tasks.push(r.body().then(b=>record.assets.push({bytes:b.length,sha256:sha(b),status:r.status()})));});
 try{await page.goto(BASE+'/__prepared-admission-fixture');await page.waitForFunction(()=>window.__admissionResult||window.__admissionFailure,null,{timeout:60000});
  record.result=await page.evaluate(()=>({started:window.__admissionStarted,result:window.__admissionResult,failure:window.__admissionFailure}));
  assert.equal(record.result.failure,undefined);const value=record.result.result;
  assert.equal(value.key,entry.key);assert.equal(value.rendererType,'function');assert.equal(value.preparation.loaderAwaitedReady,true);
  assert.equal(value.preparation.sourceSwfSha256,entry.source.sha256);assert.equal(value.preparation.assetSha256,entry.runtime.canvasRenderer.sha256);
  assert(value.at-record.result.started>=1000,'Module admission preceded the bounded source network delay');
  await Promise.all(tasks);assert.deepEqual(record.assets,[{bytes:entry.runtime.canvasRenderer.bytes,sha256:entry.runtime.canvasRenderer.sha256,status:200}]);assert.deepEqual(record.errors,[]);record.status='passed';
 }catch(e){record.status='failed';record.failure=e.stack??String(e);}finally{await Promise.all(tasks);await context.close();await save(entry.key+'.json',record);console.log(JSON.stringify({id:entry.key,status:record.status,failure:record.failure?.split('\n')[0]}));}
 }}finally{
 await browser.close();const after=await Promise.all(inputs.map(p=>pin(p.path)));
 const receipt={schemaVersion:1,createdAt:new Date().toISOString(),scope:'Unregistered generated modules in an isolated admission fixture; actual source scripts loaded from the local provider-free preview with 1000ms network delay.',
  inputs,inputsUnchanged:JSON.stringify(inputs)===JSON.stringify(after),records,registered:false,actualMyLessonVerified:false,productCalibrationPassed:false,scaleOutAuthorized:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false};
 receipt.status=records.length===8&&records.every(r=>r.status==='passed')&&receipt.inputsUnchanged?'passed':'failed';await save('receipt.json',receipt);if(receipt.status!=='passed')process.exitCode=1;
}
