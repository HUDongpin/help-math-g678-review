import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {composeP056HostV6,HOST_V5,HOST_V6_PATH,P056_HOST_V6_ADDITIONS}
 from './prepare-nms-l02-p056-host-v6.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,HOST_V5.path),'utf8'));
const additions=()=>P056_HOST_V6_ADDITIONS.map(item=>({path:item,bytes:1,sha256:'0'.repeat(64)}));

test('host-v6 composition retains every frozen host-v5 file and transition unchanged',()=>{
 const before=JSON.stringify(base);
 const host=composeP056HostV6(base,additions());
 assert.equal(JSON.stringify(base),before,'composition cannot edit v5');
 assert.equal(host.kind,'nms-l02-successor-host-v1');
 assert.equal(host.contract,'nms-l02-source-bound-host-v1');
 assert.deepEqual(host.predecessor,base.predecessor);
 assert.deepEqual(host.transitions,base.transitions);
 assert.equal(host.files.length,base.files.length+P056_HOST_V6_ADDITIONS.length);
 assert.equal(P056_HOST_V6_ADDITIONS.length,30);
 assert.deepEqual(host.files.filter(pin=>base.files.some(old=>old.path===pin.path)),base.files);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V6_PATH,'catalog/nms-l02-admission-v1/host-v6.json');
 assert.equal(HOST_V5.sha256,'f81569d2c3e96577c0f9864ce0df8dbed18c85e77f641fbaac551595a3fbf8fd');
});

test('finite host additions contain route, resources, exact predecessor producers and reader, never P056 page-owned inputs',()=>{
 const paths=new Set(P056_HOST_V6_ADDITIONS);
 assert.equal(paths.size,P056_HOST_V6_ADDITIONS.length);
 for(const required of [
  'apps/web/lib/nms-l02-p056-admission.server.ts',
  'apps/web/lib/nms-l02-p056-predecessor-assets.server.ts',
  'apps/web/lib/nms-l02-source-resource-host.ts',
  'apps/web/app/migration-assets/nms-l02-p056-predecessors/[asset]/route.ts',
  'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p056/page.tsx',
  'apps/web/components/g678-nms-l02-p056-candidate-lesson-v1.generated.tsx',
  'apps/web/components/nms-l02-p055-for-p056-runtime-v1.generated.tsx',
  'apps/web/components/nms-l02-p052-source-runtime-p056-v1.tsx',
  'scripts/generate-nms-l02-p055-for-p056-v1.mjs',
  'scripts/generate-nms-l02-p056-p052-resource-successor.mjs',
  'scripts/generate-nms-l02-p056-host-v1.mjs',
 ])assert(paths.has(required),`required shared host input: ${required}`);
 for(const forbidden of [
  'apps/web/components/nms-l02-p056-lesson-runtime-v1.tsx',
  'apps/web/lib/nms-l02-p056-descriptor-extension.ts',
  'packages/demos/src/modules/shared-nms002-l02-p056.tsx',
  'packages/demos/src/timelines/shared-nms002-l02-p056.ts',
  'work/g678-shared-page-factory/g678-nms-l02-p056-conditional-host-current-js-v1/run-manifest.json',
 ])assert(!paths.has(forbidden),`page-owned input excluded: ${forbidden}`);
});

test('composition rejects sparse, overlapping, and replaced host inputs',()=>{
 const valid=additions();
 assert.throws(()=>composeP056HostV6(base,valid.slice(1)),/complete P056 host additions/u);
 const overlapping=valid.map(pin=>({...pin}));
 overlapping[0].path=base.files[0].path;
 assert.throws(()=>composeP056HostV6(base,overlapping),/exact P056 host addition membership/u);
 const malformed=valid.map(pin=>({...pin}));
 malformed[0].sha256='bad';
 assert.throws(()=>composeP056HostV6(base,malformed),/new ordinary shared-host input/u);
 const modified=structuredClone(base);
 modified.files[0].sha256='bad';
 assert.throws(()=>composeP056HostV6(modified,valid),/exact frozen host-v5 document/u);
});
