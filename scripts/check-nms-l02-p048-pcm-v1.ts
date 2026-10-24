import fs from 'node:fs';
import assert from 'node:assert/strict';
import {P048_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p048-audio-plan-v1';
import {p048PrepareSourcePcm,type P048AudioDomain} from '../packages/demos/src/nms-l02-p048-audio-pcm-v1';
const rows=[];
for(const domain of Object.keys(P048_AUDIO_PLANS) as P048AudioDomain[]){
 const bytes=fs.readFileSync(`migrations/shared-nms002-l02-p048/audit/sprite-${domain}-source-pcm-v1.f32le`);
 const input=new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));const before=input.slice();
 const out=p048PrepareSourcePcm(domain,input),plan=P048_AUDIO_PLANS[domain];assert.deepEqual(input,before);assert.equal(out.length,plan.totalSamples);
 let end=0;for(const segment of plan.segments){assert.ok(out.subarray(end,segment.outputStart).every(x=>x===0));assert.deepEqual(out.subarray(segment.outputStart,segment.outputEnd),input.subarray(segment.sourceStart,segment.sourceEnd));end=segment.outputEnd;}
 assert.throws(()=>p048PrepareSourcePcm(domain,input.subarray(1)));const bad=input.slice();bad[100]=NaN;assert.throws(()=>p048PrepareSourcePcm(domain,bad));assert.throws(()=>p048PrepareSourcePcm(domain,new Float32Array(input.length)));
 rows.push({domain,decoded:input.length,prepared:out.length});
 if(domain==='498'){assert.ok(out.subarray(665175).some(x=>x!==0));assert.equal(out.length-665175,1422);}
}
console.log(JSON.stringify({passed:true,rows,terminalNonzeroTailPreserved:true,sourceBuffersUnchanged:true}));
