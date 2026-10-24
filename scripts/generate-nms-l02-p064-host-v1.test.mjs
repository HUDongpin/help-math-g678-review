import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildP064Host} from './generate-nms-l02-p064-host-v1.mjs';
import {sha256} from '../lib/g678-admission-proof.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const predecessor=fs.readFileSync(path.join(root,
 'apps/web/components/g678-nms-l02-p062-candidate-lesson-v1.generated.tsx'));
const target=path.join(root,'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx');

test('P064 host appends one source-bound quiz adapter without changing P062 or earlier adapters',()=>{
 assert.equal(predecessor.length,17862);
 assert.equal(sha256(predecessor),'f0dcb77134dfb707ff264bde6db9829b2ac13f68c22e04a9ac3073ab062f0bc5');
 const output=buildP064Host().toString();
 assert.equal(output,fs.readFileSync(target,'utf8'));
 const before=predecessor.toString().match(/animationId:'shared-nms002-l02-p\d+'/gu)??[];
 const after=output.match(/animationId:'shared-nms002-l02-p\d+'/gu)??[];
 assert.equal(after.length,before.length+1);
 for(const id of ['p051','p052','p055','p056','p057','p058','p060','p061','p062','p064']){
  assert.equal((output.match(new RegExp(`animationId:'shared-nms002-l02-${id}'`,'gu'))??[]).length,1,id);
  assert(output.includes(`data-${id}-lesson-host`),id);
 }
 assert.match(output,/import\('\.\/nms-l02-p064-lesson-runtime-v1'\)/u);
 assert.match(output,/NmsL02P064LessonRuntimeV1/u);
 assert.match(output,/animationId:'shared-nms002-l02-p064',audioEnabled:false/u);
 assert.match(output,/export function G678NmsL02P064CandidateLessonV1/u);
 assert(!output.includes('export function G678NmsL02P062CandidateLessonV1'));
 assert.match(output,/process\.env\.NODE_ENV === 'production' \? \(\) => null/u);
});
