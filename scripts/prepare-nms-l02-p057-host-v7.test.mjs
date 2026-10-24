import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {composeP057HostV7,HOST_V6,HOST_V7_PATH,P057_HOST_V7_ADDITIONS,P057_RUN}
 from './prepare-nms-l02-p057-host-v7.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,HOST_V6.path),'utf8'));
const run=JSON.parse(fs.readFileSync(path.join(root,P057_RUN.path),'utf8'));
const additions=()=>P057_HOST_V7_ADDITIONS.map(item=>{
 const dependency=run.sharedDependencies.find(pin=>pin.path===item);
 return dependency??{path:item,bytes:1,sha256:'0'.repeat(64)};
});

test('P057 host proposal retains all immutable host-v6 files and transitions',()=>{
 const before=JSON.stringify(base);
 const host=composeP057HostV7(base,additions(),run);
 assert.equal(JSON.stringify(base),before,'no mutation to frozen predecessor');
 assert.equal(host.files.length,base.files.length+15);
 assert.deepEqual(host.transitions,base.transitions);
 assert.deepEqual(host.predecessor,base.predecessor);
 assert.deepEqual(host.files.filter(pin=>base.files.some(old=>old.path===pin.path)),base.files);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V7_PATH,'catalog/nms-l02-admission-v1/host-v7.json');
 assert.equal(HOST_V6.sha256,'d16a595ac797af45d6283ab77e563cdbe448010f6e180b4174e0ac5c6b412625');
});

test('all seven DOM shared dependencies are exact host pins; page proof and activation stay out',()=>{
 const host=composeP057HostV7(base,additions(),run);
 const byPath=new Map(host.files.map(pin=>[pin.path,pin]));
 assert.equal(run.sharedDependencies.length,7);
 for(const pin of run.sharedDependencies)assert.deepEqual(byPath.get(pin.path),pin);
 for(const pin of [...run.inputs,...run.outputs])assert(!byPath.has(pin.path),pin.path);
 for(const name of [
  'apps/web/components/nms-l02-p057-lesson-runtime-v1.tsx',
  'apps/web/lib/nms-l02-p057-descriptor-extension.ts',
  'apps/web/lib/nms-l02-p057-admission-activation.ts',
  'lib/nms-l02-p057-admission-semantics.mjs',
  'packages/demos/src/modules/shared-nms002-l02-p057.tsx',
  'scripts/prepare-nms-l02-p057-admission.mjs',
  P057_RUN.path,
 ])assert(!byPath.has(name),name);
 assert(byPath.has('apps/web/lib/nms-l02-p057-admission.server.ts'));
 assert(byPath.has('apps/web/app/migration-assets/nms-l02-p057/[asset]/route.ts'));
});

test('proposal rejects incomplete, overlapping, changed, or unaccounted dependencies',()=>{
 const good=additions();
 assert.throws(()=>composeP057HostV7(base,good.slice(1),run),/complete P057 shared-host additions/u);
 const overlapping=good.map(pin=>({...pin}));
 overlapping[0].path=base.files[0].path;
 assert.throws(()=>composeP057HostV7(base,overlapping,run),/exact P057 shared-host addition membership/u);
 const badDependency=good.map(pin=>({...pin}));
 const index=badDependency.findIndex(pin=>pin.path==='scripts/private-current-js-registry.mjs');
 badDependency[index].sha256='0'.repeat(64);
 assert.throws(()=>composeP057HostV7(base,badDependency,run),/exact shared DOM dependency/u);
 const replaced=structuredClone(base);
 replaced.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP057HostV7(replaced,good,run),/exact frozen host-v6 document/u);
 const unaccounted=structuredClone(run);
 unaccounted.sharedDependencies[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP057HostV7(base,good,unaccounted),/exact shared DOM dependency/u);
});
