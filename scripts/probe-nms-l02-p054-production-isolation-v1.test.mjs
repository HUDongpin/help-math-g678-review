import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {routes,planProductionIsolation,FORBIDDEN_BUNDLE_MARKERS,BUILD_ROOT,verifyBuildInputPins}
 from './probe-nms-l02-p054-production-isolation-v1.mjs';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const prefix='/flash-assets/g678-local/shared-nms002-l02-p054';

test('formal denial matrix retains predecessor and tests exact 24 SVG and two MP3 routes',()=>{
 const paths=routes().map(row=>row.path);
 assert.equal(paths.length,480);assert.equal(new Set(paths).size,480);
 for(const locale of ['en','es'])for(const level of ['1','2'])
  assert(paths.includes(`/${locale}/migration-status/g678-calibration/shared-nms002-l02-p054?level=${level}`));
 for(const locale of ['en','es'])
  assert(paths.includes(`/${locale}/migration-status/g678-calibration/shared-nms002-l02-p054?level=0`));
 for(const level of [1,2])for(let order=1;order<=12;order++)
  assert(paths.includes(`${prefix}/reveal/${level}/${order}`));
 assert(paths.includes(`${prefix}/feedback-audio/correct?sha256=d34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4`));
 assert(paths.includes(`${prefix}/feedback-audio/wrong?sha256=2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77`));
 assert(paths.includes(`${prefix}/feedback-audio/correct`));
 assert(paths.includes(`${prefix}/feedback-audio/other?sha256=2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77`));
 assert(paths.some(value=>value.includes('shared-nms002-l02-p064')),'registered predecessor route retained');
 assert(FORBIDDEN_BUNDLE_MARKERS.includes('06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8'));
 assert(FORBIDDEN_BUNDLE_MARKERS.includes('nms-l02-p054-admission.server'));
});

test('probe and builder plans are read-only and reserve a fresh physical output root',()=>{
 const probe=planProductionIsolation();
 assert.deepEqual(probe.sourceModes,['unset','real-root']);
 assert.equal(probe.routeCount,480);assert.equal(probe.casesPerMode,1920);
 assert.equal(probe.expectedCases,3840);assert.equal(probe.writesPerformed,false);
 assert.equal(probe.buildRoot,BUILD_ROOT);
 assert.equal(probe.ready,true);assert.deepEqual(probe.missingInputs,[]);
 const inputs=new Map(probe.inputs.map(pin=>[pin.path,pin]));
 assert.equal(inputs.size,probe.inputs.length,'finite deduplicated production input closure');
 assert.equal(probe.predecessorInputCount,50);
 assert.equal(probe.hostFileCount,186);
 assert.equal(probe.pageFileCount,61);
 assert.equal(probe.externalFileCount,30);
 assert(inputs.has('scripts/check-nms-l02-p064-product-v1.mjs'));
 assert(inputs.has('apps/web/lib/nms-l02-p064-product-candidate.server.ts'));
 const host=JSON.parse(fs.readFileSync(path.join(root,'catalog/nms-l02-admission-v1/host-v15.json')));
 const proof=JSON.parse(fs.readFileSync(path.join(root,'work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json')));
 for(const pin of [...host.files,...proof.files])assert.deepEqual(inputs.get(pin.path),pin);
 for(const item of proof.external)
  assert.deepEqual(inputs.get(path.join(item.root,item.pin.path)),
   {...item.pin,path:path.join(item.root,item.pin.path)});
 assert(!probe.inputs.some(pin=>pin.path.endsWith('/BUILD_ID')),
  'retained BUILD_IDs are separately preserved by the builder, not predecessor matrix inputs');
 assert(!probe.buildRoot.includes('/g678-p054-product-build-output-20260928/'));
 const text=execFileSync('python3',['scripts/build-and-probe-nms-l02-p054-production-v1.py','--plan'],
  {cwd:root,encoding:'utf8'});
 const build=JSON.parse(text);
 assert.equal(build.kind,'nms-l02-p054-formal-build-plan-v1');
 assert.equal(build.newPhysicalRoot,BUILD_ROOT);
 assert.equal(build.writesPerformed,false);
 assert.equal(build.preservedBuildIds.length,10);
 for(const pin of probe.inputs)assert.deepEqual(build.inputs.find(item=>item.path===pin.path),pin);
 assert(build.preservedBuildIds.some(pin=>pin.path.includes('/g678-p054-product-build-output-20260928/next-output-v3/BUILD_ID')));
});


test('build input verification uses the correct physical roots for all source resources',()=>{
 const closure=planProductionIsolation();
 assert.equal(closure.externalFileCount,30);
 assert.equal(verifyBuildInputPins(closure.inputs,closure),true);
 assert.throws(()=>verifyBuildInputPins([{path:'/tmp/unrelated-source',bytes:1,
  sha256:'0'.repeat(64)}],closure),/absolute build input belongs/u);
});
