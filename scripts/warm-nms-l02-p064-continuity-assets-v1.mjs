#!/usr/bin/env node
/** Compile the exact local resource routes before the P064 continuity browser run.
 * This issues bounded synthetic same-origin requests; it is not browser evidence. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {P060_AUDIO} from '../lib/nms-l02-p060-admission-semantics.mjs';
import {P061_AUDIO} from '../lib/nms-l02-p061-admission-semantics.mjs';
import {P062_MAIN_AUDIO,P062_SOURCE_ROOT} from '../lib/nms-l02-p062-admission-semantics.mjs';
import {P052_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331';
const REFERRER=`${ORIGIN}/en/migration-status/g678-calibration/shared-nms002-l02-p064`;
const OUTPUT='output/nms-l02-p064-product-20260928/continuity/warmup';
const ACTIVATION='apps/web/lib/nms-l02-p064-admission-activation.ts';
const HOST={path:'catalog/nms-l02-admission-v1/host-v14.json',bytes:38775,
 sha256:'34a4280e72e90d55db7cd8f12587c39095c73ca1fcb7b253d221be098e980d9c'};
const PROOF={path:'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',bytes:44928,
 sha256:'91ecc6b6b5dece0d0b3521c5d150b25be0a4bbf06b85b776fdb7f146d8af0ec7'};
const ASSETS=Object.freeze([
 {name:'p062 main',pathname:'/migration-assets/nms-l02-p062/sprite-315.mp3',
  pin:P062_MAIN_AUDIO,contentType:'audio/mpeg',kind:'audio'},
 {name:'p061 main',pathname:'/migration-assets/nms-l02-p061/sprite-315.mp3',
  pin:P061_AUDIO.main,contentType:'audio/mpeg',kind:'audio'},
 {name:'p060 main',pathname:'/migration-assets/nms-l02-p060/sprite-391.mp3',
  pin:P060_AUDIO.main,contentType:'audio/mpeg',kind:'audio'},
 {name:'p058 main',pathname:'/migration-assets/nms-l02-p058/main.mp3',
  pin:{path:'output/nms-l02-p058-audio-20260927/embedded-source-stream-v1.mp3',bytes:109720,
   sha256:'05f43faf63e470935728be5b54933ebb71760aeb819074b570091a6e4b068f38'},
  contentType:'audio/mpeg',kind:'audio'},
 {name:'p056 main',pathname:'/migration-assets/nms-l02-p056/main.mp3',
  pin:{path:'migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3',bytes:95290,
   sha256:'6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811'},
  contentType:'audio/mpeg',kind:'audio'},
 {name:'p055 main',pathname:'/migration-assets/nms-l02-p056-predecessors/p055-main.mp3',
  pin:{path:'output/nms-l02-ts-family-20260927/audio/p055-main-sprite-26.mp3',bytes:143780,
   sha256:'ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b'},
  contentType:'audio/mpeg',kind:'audio'},
 {name:'p055 renderer',pathname:'/migration-assets/nms-l02-p056-predecessors/p055-typography.js',
  pin:{path:'output/nms-l02-ts-family-20260927/visual/canvas-renderer.js',bytes:930320,
   sha256:'47e796237e5520140a760175865f09c3f218ac942cf3cadc8fb9f56c38bd358d'},
  contentType:'text/javascript; charset=utf-8',kind:'script'},
 {name:'p052 main',pathname:'/migration-assets/nms-l02-p056-predecessors/p052-sprite-350.mp3',
  pin:{path:'migrations/shared-nms002-l02-p052/audit/sprite-350-source-stream-v1.mp3',
   bytes:P052_AUDIO_PLANS['sprite-350'].inputBytes,
   sha256:P052_AUDIO_PLANS['sprite-350'].inputSha256},
 contentType:'audio/mpeg',kind:'audio'},
]);
const INPUTS=Object.freeze([...new Set([
 'scripts/warm-nms-l02-p064-continuity-assets-v1.mjs',
 'scripts/probe-nms-l02-p064-continuity-v1.mjs',ACTIVATION,HOST.path,PROOF.path,
 'apps/web/lib/nms-l02-source-resource-host.ts',
 'apps/web/lib/g678-preview-policy.ts',
 ...['p062','p061','p060','p058','p056','p056-predecessors'].flatMap(name=>[
  `apps/web/app/migration-assets/nms-l02-${name}/[asset]/route.ts`,
  `apps/web/lib/nms-l02-${name==='p056-predecessors'?'p056-predecessor':name}-assets.server.ts`,
 ]),
 ...ASSETS.map(item=>item.pin.path),
])]);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const disk=relative=>path.join(ROOT,relative);
const pin=async relative=>{const bytes=await readFile(disk(relative));
 return{path:relative,bytes:bytes.length,sha256:sha256(bytes)};};

export function parseArgs(args){
 if(args.length===1&&args[0]==='--plan')return{mode:'plan'};
 assert(args.length===2&&args[0]==='--run'&&/^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]??''),
  'Usage: --plan | --run <unique-slug>');
 return{mode:'run',slug:args[1]};
}
export function plan(){
 assert.equal(new Set(ASSETS.map(item=>item.pathname)).size,8,'eight unique route resources');
 return{schemaVersion:1,kind:'nms-l02-p064-continuity-resource-warmup-v1',origin:ORIGIN,
  referer:REFERRER,host:HOST,pageProof:PROOF,method:'GET',
  qualification:'Synthetic local request precompilation only; no browser, playback, listening or acceptance claim.',
  inputPaths:INPUTS,
  resources:ASSETS.map(item=>({name:item.name,
   url:`${ORIGIN}${item.pathname}?sha256=${item.pin.sha256}`,
   source:item.pin,contentType:item.contentType,requestKind:item.kind}))};
}
export async function preflight(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P062_SOURCE_ROOT,'real AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local only');
 const inputs=await Promise.all(INPUTS.map(pin));
 assert.deepEqual(inputs.find(item=>item.path===HOST.path),HOST,'exact sealed host-v14');
 assert.deepEqual(inputs.find(item=>item.path===PROOF.path),PROOF,'exact P064 page proof');
 const activation=await readFile(disk(ACTIVATION),'utf8');
 assert.match(activation,/"stage":\s*"candidate"/u,'candidate activation');
 const {NMS_L02_P064_ADMISSION:binding}=await import('../apps/web/lib/nms-l02-p064-admission-activation.ts');
 assert.equal(binding?.stage,'candidate');
 assert.deepEqual(binding?.host,HOST);assert.deepEqual(binding?.page,PROOF);
 for(const item of ASSETS)
  assert.deepEqual(inputs.find(value=>value.path===item.pin.path),item.pin,`source ${item.name}`);
 return inputs;
}
function requestAsset(item){
 const url=new URL(`${ORIGIN}${item.pathname}?sha256=${item.pin.sha256}`);
 assert.equal(url.origin,ORIGIN);assert.equal(url.username,'');assert.equal(url.password,'');
 const script=item.kind==='script';
 const headers={Host:'127.0.0.1:3331',Referer:REFERRER,'Sec-Fetch-Site':'same-origin',
  'Sec-Fetch-Mode':script?'no-cors':'cors','Sec-Fetch-Dest':script?'script':'empty',
  Accept:script?'*/*':'audio/mpeg'};
 if(!script)headers.Origin=ORIGIN;
 return new Promise((resolve,reject)=>{
  const request=http.request(url,{method:'GET',headers,agent:false,timeout:120000},response=>{
   const chunks=[];let size=0;
   response.on('data',chunk=>{size+=chunk.length;
    if(size>1_500_000){request.destroy(Error('warmup response too large'));return;}
    chunks.push(chunk);});
   response.on('end',()=>{
    const bytes=Buffer.concat(chunks);
    resolve({name:item.name,url:url.href,status:response.statusCode,
     redirected:response.statusCode>=300&&response.statusCode<400,
     contentType:response.headers['content-type'],contentLength:response.headers['content-length'],
     cacheControl:response.headers['cache-control'],corPolicy:response.headers['cross-origin-resource-policy'],
     noSniff:response.headers['x-content-type-options'],bytes:bytes.length,sha256:sha256(bytes)});
   });
   response.on('error',reject);
  });
  request.on('timeout',()=>request.destroy(Error(`warmup timeout: ${item.name}`)));
  request.on('error',reject);request.end();
 });
}
export async function run(slug){
 assert(/^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug),'unique slug');
 const localPins=await preflight();
 const dir=disk(`${OUTPUT}/${slug}`);await mkdir(path.dirname(dir),{recursive:true});await mkdir(dir);
 const receipt={...plan(),status:'running',startedAt:new Date().toISOString(),localPins,
  responses:[],errors:[],browserExecuted:false,acceptanceEffect:'none'};
 try{
  for(const item of ASSETS){
   const response=await requestAsset(item);receipt.responses.push(response);
   assert.equal(response.status,200,`${item.name} HTTP 200`);
   assert.equal(response.contentType,item.contentType,`${item.name} content type`);
   assert.equal(Number(response.contentLength),item.pin.bytes,`${item.name} length header`);
   assert.equal(response.bytes,item.pin.bytes,`${item.name} body length`);
   assert.equal(response.sha256,item.pin.sha256,`${item.name} body hash`);
   assert.equal(response.cacheControl,'private, no-store, max-age=0',`${item.name} no-store`);
   assert.equal(response.corPolicy,'same-origin',`${item.name} same-origin CORP`);
   assert.equal(response.noSniff,'nosniff',`${item.name} nosniff`);
  }
 }catch(error){receipt.errors.push(error.message);}
 receipt.localPinsAfter=await Promise.all(INPUTS.map(pin));
 receipt.localStable=JSON.stringify(localPins)===JSON.stringify(receipt.localPinsAfter);
 receipt.finishedAt=new Date().toISOString();
 receipt.status=receipt.errors.length===0&&receipt.localStable&&receipt.responses.length===8?
  'technical-warmup-pass-not-browser-evidence':'failed';
 await writeFile(path.join(dir,'receipt.json'),json(receipt),{flag:'wx'});
 return{status:receipt.status,path:`${OUTPUT}/${slug}/receipt.json`,responses:receipt.responses.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=parseArgs(process.argv.slice(2));
  const result=args.mode==='plan'?plan():await run(args.slug);
  console.log(json(result));if(result.status==='failed')process.exitCode=1;
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
