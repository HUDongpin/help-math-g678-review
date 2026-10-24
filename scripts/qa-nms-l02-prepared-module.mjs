import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),OUT='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f/nms-l02-prepared-module-v1';
const hash=b=>createHash('sha256').update(b).digest('hex'),pins=[];const bound=async p=>{const b=await readFile(p);pins.push({path:p,bytes:b.length,sha256:hash(b)});return b;};
const manifest=JSON.parse(await bound(ROOT+'/work/g678-shared-page-factory/nms-l02-hover-audio-package-v1/manifest.json'));
for(const p of [...manifest.inputs,...manifest.outputs]){const b=await bound(path.resolve(ROOT,p.path));assert.equal(hash(b),p.sha256);}
const config=manifest.config.value,asset=await bound(path.resolve(ROOT,manifest.entry.artifacts.runtime.path));
const bundle=await build({stdin:{contents:`import module,{MODULE_PREPARATION} from './packages/demos/src/modules/nms-l02-hover-audio';window.admitted={key:module.key,runtime:module.runtime,prepared:MODULE_PREPARATION,package:module.privateHoverAudioPackage,controls:module.privateGlossaryControls,capabilities:module.lessonHost,hasRenderer:typeof module.Renderer==='function'};`,resolveDir:ROOT,sourcefile:'nms-prepared-fixture.ts',loader:'ts'},bundle:true,write:false,format:'esm',platform:'browser',metafile:true,define:{'process.env.NODE_ENV':'"development"'}});
for(const name of Object.keys(bundle.metafile.inputs))if(name!=='nms-prepared-fixture.ts')await bound(path.resolve(ROOT,name));await bound(fileURLToPath(import.meta.url));
await mkdir(OUT);await writeFile(OUT+'/fixture.js',bundle.outputFiles[0].contents,{flag:'wx'});
const report={status:'running',scope:'Actual generated module import and preparation; no registry or product route admission',inputBindings:pins,unexpectedRequests:[],errors:[],registered:false,productCalibrationPassed:false};
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await context.route('**/*',route=>{const u=new URL(route.request().url());
  if(u.origin==='http://127.0.0.1:3339'&&u.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><script type="module" src="/fixture.js"></script>'});
  if(u.origin==='http://127.0.0.1:3339'&&u.pathname==='/fixture.js')return route.fulfill({contentType:'text/javascript',body:Buffer.from(bundle.outputFiles[0].contents)});
  if(u.origin==='http://127.0.0.1:3339'&&u.pathname===config.assetSource&&u.searchParams.get('sha256')===config.assetSha256)return route.fulfill({contentType:'text/javascript',body:asset});
  report.unexpectedRequests.push(u.href);return route.abort();});
 await page.goto('http://127.0.0.1:3339/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.admitted);
 const actual=await page.evaluate(()=>window.admitted);assert.equal(actual.key,manifest.animationId);assert.equal(actual.prepared.loaderAwaitedReady,true);
 assert.equal(actual.prepared.assetSha256,config.assetSha256);assert.equal(actual.prepared.sourceSwfSha256,manifest.source.sha256);
 assert.equal(actual.runtime.frameCount,10);assert.ok(actual.runtime.frameDomains.some(d=>d.id==='sprite-69'&&d.frameCount===151));assert.equal(actual.hasRenderer,true);
 assert.deepEqual(actual.package.config,config);assert.equal(actual.package.plan.audioFirstFrame,10);assert.deepEqual(actual.capabilities.capabilities,['glossary']);assert.deepEqual(actual.controls,[config.glossary]);
 report.module=actual;assert.deepEqual(report.unexpectedRequests,[]);assert.deepEqual(report.errors,[]);for(const p of pins)assert.equal(hash(await readFile(p.path)),p.sha256);report.inputsUnchanged=true;report.status='passed';
}finally{await browser.close();await writeFile(OUT+'/receipt.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:report.status,output:OUT}));}
