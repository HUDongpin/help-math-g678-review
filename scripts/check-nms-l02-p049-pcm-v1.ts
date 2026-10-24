import fs from 'node:fs';
import assert from 'node:assert/strict';
import {P049_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p049-audio-plan-v1';
import {p049PrepareSourcePcm,type P049AudioDomain} from '../packages/demos/src/nms-l02-p049-audio-pcm-v1';
const rows=[];
for(const domain of Object.keys(P049_AUDIO_PLANS) as P049AudioDomain[]){
 const bytes=fs.readFileSync(`migrations/shared-nms002-l02-p049/audit/sprite-${domain}-source-pcm-v1.f32le`);
 const input=new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 const before=input.slice(),out=p049PrepareSourcePcm(domain,input),plan=P049_AUDIO_PLANS[domain];
 assert.deepEqual(input,before);assert.equal(out.length,plan.totalSamples);
 let end=0,copied=0;
 for(const segment of plan.segments){
  assert.ok(out.subarray(end,segment.outputStart).every(x=>x===0));
  assert.deepEqual(out.subarray(segment.outputStart,segment.outputEnd),input.subarray(segment.sourceStart,segment.sourceEnd));
  end=segment.outputEnd;copied+=segment.sourceEnd-segment.sourceStart;
 }
 assert.equal(copied,input.length-1673);
 assert.throws(()=>p049PrepareSourcePcm(domain,input.subarray(1)),/LENGTH/);
 for(const value of [NaN,Infinity,-Infinity]){const bad=input.slice();bad[100]=value;assert.throws(()=>p049PrepareSourcePcm(domain,bad),/NONFINITE/);}
 assert.throws(()=>p049PrepareSourcePcm(domain,new Float32Array(input.length)),/SILENT/);
 if(domain==='156'){
  assert.equal(out.length,799129);assert.equal(plan.segments.length,3);
  // Independent source-derived resume and gap boundaries from frame388 tag and complete PCM audit.
  assert.equal(plan.segments[2].sourceStart,624495);assert.equal(plan.segments[2].outputStart,711112);
  assert.ok(out.subarray(632010,711112).every(x=>x===0));
  assert.deepEqual(out.subarray(711112),input.subarray(624495));
  assert.ok(out.subarray(797475).every(x=>x===0)); // Authored terminal435 has a silent tail.
 }
 if(['72','143','153'].includes(domain)){
  // Unlike P048, the correct-feedback callback at frame20 precedes nonzero PCM.
  const tail=input.subarray(32910);assert.equal(tail.length,1650);assert.ok(tail.some(x=>x!==0));
  assert.deepEqual(out.subarray(out.length-1650),tail);
 }
 rows.push({domain,decoded:input.length,prepared:out.length,copied});
}
assert.throws(()=>p049PrepareSourcePcm('root' as P049AudioDomain,new Float32Array(1)),/DOMAIN/);
console.log(JSON.stringify({status:'PASS',rows,mainGapSamples:79102,correctNonzeroTailsPreserved:true,sourceBuffersUnchanged:true}));
