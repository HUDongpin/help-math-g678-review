#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile} from '../lib/g678-admission-proof.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const origin='http://127.0.0.1:3332';
const routes=[
 '/en/migration-status/g678-calibration/shared-nms002-l02-p055',
 '/es/migration-status/g678-calibration/shared-nms002-l02-p055',
 '/migration-status/g678-calibration/shared-nms002-l02-p055',
 '/migration-assets/nms-l02-ts-pilot/typography.js?sha256=47e796237e5520140a760175865f09c3f218ac942cf3cadc8fb9f56c38bd358d',
 '/migration-assets/nms-l02-ts-pilot/main.mp3?sha256=ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b',
 '/flash-assets/g678-local/shared-nms002-l02-p052/source-audio/sprite-350?sha256=105d303d21ba524e8548ac81234370115cf3c6ab7f420a807584e2b98a7bce56',
 '/flash-assets/g678-local/shared-nms002-l02-p055/canvas-renderer.js',
];
const results=[];
for(const pathname of routes)for(const headersMode of ['anonymous','candidate-shaped-request']){
 const headers=headersMode==='anonymous'?{}:{referer:origin+'/en/migration-status/g678-calibration/shared-nms002-l02-p055',
  origin,'sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty'};
 const response=await fetch(origin+pathname,{headers,redirect:'manual',signal:AbortSignal.timeout(15000)});
 const bytes=Buffer.from(await response.arrayBuffer());
 results.push({path:pathname,headersMode,status:response.status,bytes:bytes.length});
 assert.equal(response.status,404,`production must deny ${pathname} (${headersMode})`);
 assert(bytes.length<1000,'no course or binary resource leaked');
}
const receipt={schemaVersion:1,kind:'nms-l02-p055-local-production-negative-v1',
 origin,checkedAt:new Date().toISOString(),buildLog:'output/nms-l02-host-successor-20260927/product/production-build-v1.log',
 inputs:['scripts/check-nms-l02-p055-production-negative.mjs','apps/web/lib/nms-l02-admission-activation.ts',
  'packages/demos/private-current-js-registry.json'].map(p=>pinFile(root,p)),results,
 scope:'local production-mode server only; no remote provider access or deployment'};
const file='output/nms-l02-host-successor-20260927/product/production-negative-v1.json';
fs.writeFileSync(path.join(root,file),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:results.length,total:routes.length*2,receipt:pinFile(root,file)}));
