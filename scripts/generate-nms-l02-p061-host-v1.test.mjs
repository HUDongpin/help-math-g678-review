import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildP061Host} from './generate-nms-l02-p061-host-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'apps/web/components/g678-nms-l02-p061-candidate-lesson-v1.generated.tsx');
test('P061 wrapper extends pinned P060 without dropping predecessor adapters',()=>{
 const output=buildP061Host().toString();
 assert.equal(output,fs.readFileSync(target,'utf8'));
 for(const id of ['p051','p052','p055','p056','p057','p058','p060','p061']){
  assert.equal((output.match(new RegExp(`animationId:'shared-nms002-l02-${id}'`,'gu'))??[]).length,1,id);
  assert(output.includes(`data-${id}-lesson-host`),id);
 }
 assert.match(output,/import\('\.\/nms-l02-p061-lesson-runtime-v1'\)/u);
 assert.match(output,/export function G678NmsL02P061CandidateLessonV1/u);
 assert(!output.includes('export function G678NmsL02P060CandidateLessonV1'));
});
