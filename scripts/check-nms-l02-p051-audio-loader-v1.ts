import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readP051SourceAudio,p051AudioUrl} from '../packages/demos/src/nms-l02-p051-audio-loader-v1';
import {P051_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p051-audio-plan-v1';
const originalFetch=globalThis.fetch,originalLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
const locationValue={protocol:'http:',hostname:'127.0.0.1',origin:'http://127.0.0.1:3343'};
Object.defineProperty(globalThis,'location',{configurable:true,value:locationValue});
try{
 let reads=0;
 for(const domain of ['248','250','257'] as const){const plan=P051_AUDIO_PLANS[domain],raw=fs.readFileSync(new URL(`../migrations/shared-nms002-l02-p051/audit/sprite-${domain}-source-stream-v1.mp3`,import.meta.url));
  const response=(bytes:Uint8Array,mime='audio/mpeg',length=String(plan.inputBytes))=>{const r=new Response(bytes as BodyInit,{headers:{'content-type':mime,'content-length':length}});Object.defineProperty(r,'url',{value:locationValue.origin+p051AudioUrl(domain)});return r};
  globalThis.fetch=async(_input,init)=>{reads++;assert.equal(init?.redirect,'error');assert.equal(init?.cache,'no-store');return response(raw)};
  assert.deepEqual(Buffer.from(await readP051SourceAudio(domain,new AbortController().signal)),raw);
  for(const make of [()=>{const b=Buffer.from(raw);b[100]^=1;return response(b)},()=>response(raw.subarray(1)),()=>response(Buffer.concat([raw,Buffer.from([1])])),()=>response(raw,'text/plain'),()=>response(raw,'audio/mpeg','1')]){globalThis.fetch=async()=>make();await assert.rejects(readP051SourceAudio(domain,new AbortController().signal));}
 }
 const abort=new AbortController();abort.abort();await assert.rejects(readP051SourceAudio('248',abort.signal));
 assert.throws(()=>p051AudioUrl('252' as '248'));
 locationValue.hostname='example.com';await assert.rejects(readP051SourceAudio('248',new AbortController().signal),/LOCAL_ONLY/);
 assert.equal(reads,3);
 console.log('PASS: three exact real-byte streams via bounded mocked fetch; hash/short/long/MIME/length/abort/remote rejected. Real route integration remains untested.');
}finally{globalThis.fetch=originalFetch;if(originalLocation)Object.defineProperty(globalThis,'location',originalLocation);else Reflect.deleteProperty(globalThis,'location');}
