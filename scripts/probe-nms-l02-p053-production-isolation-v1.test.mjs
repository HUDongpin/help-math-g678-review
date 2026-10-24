import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {parseFormalActivation} from './probe-nms-l02-p053-production-isolation-v1.mjs';
import {routes} from './check-nms-l02-p053-product-production-v2.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const host={path:'catalog/nms-l02-admission-v1/host-v16.json',bytes:47999,
 sha256:'1f0d2dbb09c4f641eb65267ae0d90f073477704bca94c75e6bacd67c01e73e7f'};
const source={schemaVersion:1,stage:'candidate',
 predecessor:{path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',bytes:1,sha256:'a'.repeat(64)},
 host,page:{path:'work/g678-workflow/candidates/shared-nms002-l02-p053-v1.json',bytes:1,sha256:'b'.repeat(64)}};
const activation=value=>`export const NMS_L02_P053_ADMISSION:unknown=${JSON.stringify(value)};\n`;

test('formal activation requires a reviewed literal host, exact P053 page and predecessor',()=>{
 assert.deepEqual(parseFormalActivation(activation(source),host,source.page),source);
 assert.deepEqual(parseFormalActivation(activation({...source,stage:'registered'}),host,source.page).stage,'registered');
 assert.throws(()=>parseFormalActivation(activation(source),null,source.page),/reviewed host-v16/);
 assert.throws(()=>parseFormalActivation(activation(source),host,null),/reviewed P053 page/);
 assert.throws(()=>parseFormalActivation(activation({...source,host:{...host,bytes:48000}}),host,source.page),/reviewed host-v16/);
 assert.throws(()=>parseFormalActivation(activation({...source,page:{...source.page,path:'other'}}),host,source.page),/page/);
 assert.throws(()=>parseFormalActivation(activation({...source,predecessor:{...source.predecessor,path:'other'}}),host,source.page),/predecessor/);
 assert.throws(()=>parseFormalActivation(activation(null),host,source.page));
});

test('formal denial retains all 560 distinct product and predecessor request contexts',()=>{
 const values=routes();
 assert.equal(values.length,560);
 assert.equal(values.length*4,2240);
 assert.equal(values.length*8,4480);
 assert.equal(new Set(values.map(item=>`${item.path}|${item.refererPage??'prior'}`)).size,560);
 for(const locale of ['/en','/es',''])for(const query of ['','?frame=1','?level=1','?level=2','?extra=1'])
  assert(values.some(item=>item.path===`${locale}/migration-status/g678-calibration/shared-nms002-l02-p053${query}`));
});

test('isolated builder preserves original 12 build IDs plus successful P053 product v2',()=>{
 const body=readFileSync(path.join(ROOT,'scripts/build-and-probe-nms-l02-p053-production-v1.py'),'utf8');
 const prior=readFileSync(path.join(ROOT,'scripts/build-and-probe-nms-l02-p053-product-v2.py'),'utf8');
 const old=prior.match(/OLD_BUILDS = \[([\s\S]*?)\n\]/u)?.[1];
 assert(old);
 for(const item of [...old.matchAll(/'([^']+)'/gu)].map(value=>value[1]))assert(body.includes(item));
 assert(body.includes("PRODUCT_SUCCESS = '/Volumes/American Dream/hudongpin/g678-p053-product-build-output-20260928/next-output-v2'"));
 assert(body.includes("'output/nms-l02-p053-product-20260928/production/product-candidate-v2-real-root.json'"));
 assert(body.includes('sock.connect_ex('));
 assert(!body.includes('sock.bind('));
 assert(body.includes("server.wait(timeout=10)"));
});
