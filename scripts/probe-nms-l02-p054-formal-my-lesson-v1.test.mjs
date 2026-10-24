import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan,revealShapeId} from './probe-nms-l02-p054-formal-my-lesson-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P054 formal probe bounds the two real host levels and keeps acceptance separate',()=>{
 const p=plan();
 assert.equal(p.formal,true);assert.equal(p.registeredPageCount,p.expectedRegistered?63:62);
 assert.equal(p.renderableCount,63);assert.equal(p.unregisteredCandidateCount,p.expectedRegistered?0:1);
 assert.equal(p.activePageCount,64);
 assert.deepEqual(p.cases.map(row=>[row.locale,row.level,row.width,row.reducedMotion]),
  [['en',1,1280,'no-preference'],['es',2,390,'reduce']]);
 assert.equal(p.route.endsWith('/shared-nms002-l02-p054[?level=2]'),true);
 assert.deepEqual([revealShapeId(1,1),revealShapeId(1,12),
  revealShapeId(2,1),revealShapeId(2,12)],[110,132,670,692]);
 assert.throws(()=>revealShapeId(2,13));
 assert.equal(new Set(p.inputPaths).size,p.inputPaths.length);
 for(const required of ['apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx',
  'packages/demos/src/nms-l02-p054-product-board-v1.tsx',
  'apps/web/lib/nms-l02-p054-feedback-audio-access.ts',
  'apps/web/lib/nms-l02-p054-reveal-access.ts',
  'apps/web/lib/nms-l02-p064-admission-activation.ts',
  'catalog/nms-l02-admission-v1/host-v14.json',
  'catalog/nms-l02-admission-v1/host-v15.json',
  'apps/web/lib/nms-l02-p054-admission.server.ts',
  'work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json'])assert(p.inputPaths.includes(required));
});

test('P054 plan is browser-free and the source/audio/art pins match physical files',async()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','bounded-candidate-v1']),{mode:'run',slug:'bounded-candidate-v1'});
 assert.throws(()=>parseArgs(['--run','../escape']),/Usage/u);
 const p=plan();
 for(const source of [p.source,p.sourceXml,p.sourceMovie]){
  const bytes=await readFile(source.path);
  assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
   {bytes:source.bytes,sha256:source.sha256});
 }
 const art=JSON.parse(await readFile(path.join(ROOT,
  'migrations/shared-nms002-l02-p054/audit/art-export-v1.json')));
 assert.equal(art.source.sha256,p.source.sha256);
 for(const level of [1,2])for(let order=1;order<=12;order++){
  const shape=revealShapeId(level,order);
  assert.equal(art.export.items.filter(row=>row.file===`shapes/${shape}.svg`).length,1);
 }
 const audioRoot='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-audio-streams-v1';
 for(const [kind,spec] of Object.entries(p.feedbackAudio)){
  const bytes=await readFile(path.join(audioRoot,`sprite-${spec.sprite}-source-stream-v1.mp3`));
  assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
   {bytes:spec.bytes,sha256:spec.sha256},kind);
 }
 for(const relative of p.inputPaths)
  await readFile(path.isAbsolute(relative)?relative:path.join(ROOT,relative));
});
