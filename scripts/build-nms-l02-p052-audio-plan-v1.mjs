import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {buildP052AudioPlan,prepareP052CandidatePcm} from './lib/nms-l02-p052-audio-plan-v1.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n)));
const source=read('source-audio-streams-v1.json'),packets=read('source-packet-audit-v1.json'),pcm=read('source-pcm-inventory-v1.json');
for(const j of [source,packets,pcm])assert.equal(j.sourceSha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const plans=[];
for(const stream of source.streams){
 const row=pcm.streams.find(p=>p.domain===stream.domain),b=fs.readFileSync(path.join(root,row.pcm.path));
 assert.equal(b.length,row.pcm.bytes);assert.equal(sha(b),row.pcm.sha256);
 const input=Float32Array.from({length:b.length/4},(_,i)=>b.readFloatLE(i*4));
 const plan=buildP052AudioPlan(stream,packets.streams.find(p=>p.domain===stream.domain),input.length);
 const output=prepareP052CandidatePcm(plan,input);
 // Verify every retained source float, not merely aggregate duration or energy.
 let checked=0;for(const s of plan.segments)for(let i=s.sourceStart;i<s.sourceEnd;i++){assert.ok(Object.is(input[i],output[s.outputStart+i-s.sourceStart]));checked++;}
 assert.equal(checked,input.length-1673);
 plans.push({...plan,input:row.pcm,bytePreservation:{sampleComparisons:checked,passed:true}});
}
const obj={schemaVersion:1,sourceSha256:source.sourceSha256,plans,qualification:'Local engineering candidate; not product admission, runtime synchronization, listening or fidelity acceptance.',
 sourceCountDiscrepancyUnchanged:true,originalRuntimeAccepted:false,audioAccepted:false,
 implementationInputSha256:sha(fs.readFileSync(path.join(root,'scripts/lib/nms-l02-p052-audio-plan-v1.mjs')))};
const f=path.join(dir,'native-audio-plan-v1.json'),data=JSON.stringify(obj,null,2)+'\n';
if(fs.existsSync(f))assert.equal(fs.readFileSync(f,'utf8'),data);else if(process.argv.includes('--check'))throw Error(`Missing ${f}`);else fs.writeFileSync(f,data,{flag:'wx'});
console.log(JSON.stringify({status:'ENGINEERING_CANDIDATE_PASS_WITH_KNOWN_SOURCE_DIFFERENCE',plans:plans.map(p=>({domain:p.domain,samples:p.totalSamples,preserved:p.preservedSamples,maxAnchorDifferenceSamples:p.maxContinuousVsActualSamples,mismatch:p.sourceSampleCountMismatch})),audioAccepted:false}));
