import assert from 'node:assert/strict';import fs from 'node:fs';import test from 'node:test';
import {buildP053ProductHost} from './generate-nms-l02-p053-product-host-v1.mjs';
test('P053 host generation retains every P054 predecessor adapter and only adds directions',()=>{
 const before=fs.readFileSync(new URL('../apps/web/components/g678-nms-l02-p054-product-lesson-v1.generated.tsx',import.meta.url),'utf8');
 const bytes=buildP053ProductHost(),after=bytes.toString();
 assert(bytes.equals(fs.readFileSync(new URL('../apps/web/components/g678-nms-l02-p053-product-lesson-v1.generated.tsx',import.meta.url))));
 const ids=text=>[...text.matchAll(/animationId:\s*'([^']+)'/gu)].map(m=>m[1]);
 assert.deepEqual(ids(after),['shared-nms002-l02-p053',...ids(before)]);
 assert(after.includes("process.env.NODE_ENV === 'production' ? () => null"));
 assert(after.includes('NmsL02P053GameHandoffRuntimeV1'));
 assert(after.includes('data-p054-lesson-host data-p053-lesson-host'));
});
