import assert from 'node:assert/strict';import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import path from'node:path';import{fileURLToPath}from'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),PRIOR='work/g678-shared-page-factory/nms-l02-hover-audio-package-v3/manifest.json',OUT='work/g678-shared-page-factory/nms-l02-hover-audio-package-v4/manifest.json',TARGET='packages/demos/src/nms-l02-hover-candidate.tsx';
const pin=async p=>{const b=await readFile(path.resolve(ROOT,p));return{path:p,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const priorBytes=await readFile(path.join(ROOT,PRIOR)),prior=JSON.parse(priorBytes);assert.equal(createHash('sha256').update(priorBytes).digest('hex'),'fc64725d97a7b354a61cbb9787105f007d48ab34054093ec4d0ec7fab5ec9ede');
const next=structuredClone(prior),changed=new Set();next.predecessorEntry=next.entry;
for(let i=0;i<next.inputs.length;i++){const before=next.inputs[i],after=await pin(before.path);if(JSON.stringify(before)!==JSON.stringify(after)){assert.equal(path.resolve(ROOT,before.path),path.join(ROOT,TARGET));changed.add(TARGET);next.inputs[i]=after;}}
assert.equal(changed.size,1);for(const p of next.outputs)assert.deepEqual(await pin(p.path),p);
for(const p of [PRIOR,'catalog/product-bridge-calibrations/g678-current-js-379-v18-nms-hover-registry-witness.json','scripts/prepare-nms-l02-hover-audio-module-v4.mjs'])next.inputs.push(await pin(p));
next.presentationFix='Reserve feedback height so blur cannot move the My Lesson toolbar between pointerdown and pointerup.';
const bytes=JSON.stringify(next,null,2)+'\n';if(process.argv[2]==='--check')assert.equal(await readFile(path.join(ROOT,OUT),'utf8'),bytes);else{assert.equal(process.argv.length,2);await mkdir(path.dirname(path.join(ROOT,OUT)));await writeFile(path.join(ROOT,OUT),bytes,{flag:'wx'});}console.log(await pin(OUT));
