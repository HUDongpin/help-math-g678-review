import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n))),sha=b=>createHash('sha256').update(b).digest('hex');
const source=read('source-audio-streams-v1.json'),decoded=read('source-pcm-inventory-v1.json');
const packetAudit=read('source-packet-audit-v1.json');
assert.equal(packetAudit.sourceSha256,source.sourceSha256);
assert.equal(source.sourceSha256,decoded.sourceSha256);
assert.equal(source.sourceSha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
function roundEven(n){const floor=Math.floor(n),fraction=n-floor;return fraction===0.5?(floor%2===0?floor:floor+1):Math.round(n);}
const tick=f=>roundEven((f-1)*22050/12);
assert.deepEqual([1,2,3,4,5].map(tick),[0,1838,3675,5512,7350]);
const rows=[];
for(const stream of source.streams){
 const pcm=decoded.streams.find(r=>r.domain===stream.domain);assert.ok(pcm);
 const raw=fs.readFileSync(path.join(root,pcm.pcm.path));assert.equal(sha(raw),pcm.pcm.sha256);
 const samples=raw.length/4,anchors=[];let cumulative=0;
 for(const b of stream.blocks){if(b.sampleCount)anchors.push({frame:b.frame,sourceStart:cumulative+b.seekSamples});cumulative+=b.sampleCount;}
 const packet=packetAudit.streams.find(s=>s.domain===stream.domain);assert.ok(packet);
 assert.equal(packet.decodedSamples,samples);assert.equal(packet.declaredSamples,cumulative);
 if(packet.discrepancies.length){
  assert.equal(stream.domain,'sprite-350');assert.equal(cumulative-samples,576);
  rows.push({domain:stream.domain,status:'UNRESOLVED_SOURCE_SAMPLE_COUNT',decodedSamples:samples,declaredSamples:cumulative,
   discrepancies:packet.discrepancies,segments:[],schedulingDecision:'No main-clock plan admitted. Source frame102 count mismatch requires explicit source-aware scheduling decision; do not synthesize missing samples.'});
  continue;
 }
 assert.equal(cumulative,samples);assert.equal(stream.head.latencySeek,1673);
 const [first,second]=anchors;assert.equal(first.sourceStart,1673);assert.equal(second.sourceStart,3510);assert.equal(second.frame,first.frame+2);
 for(let i=2;i<anchors.length;i++)assert.equal(anchors[i].sourceStart-anchors[i-1].sourceStart,1837*(anchors[i].frame-anchors[i-1].frame));
 const segments=[{frame:first.frame,sourceStart:first.sourceStart,sourceEnd:second.sourceStart,outputStart:tick(first.frame)},
  {frame:second.frame,sourceStart:second.sourceStart,sourceEnd:samples,outputStart:tick(second.frame)}].map(s=>({...s,outputEnd:s.outputStart+s.sourceEnd-s.sourceStart}));
 assert.ok(segments[0].outputEnd<=segments[1].outputStart);
 function stats(start,end){let peak=0,nonzero=0;for(let i=start;i<end;i++){const v=raw.readFloatLE(i*4);peak=Math.max(peak,Math.abs(v));if(v!==0)nonzero++;}return {samples:end-start,peak,nonzero};}
 const boundaryFrames=stream.domain==='sprite-350'?[15,17,114,115,116,156]:stream.domain==='sprite-349'?[3,16,18,27,31,36,40,54,55]:[first.frame,second.frame,stream.blocks.at(-1).frame];
 const boundaries=boundaryFrames.map(frame=>{const sourceStart=second.sourceStart+tick(frame)-tick(second.frame);return {frame,preparedSample:tick(frame),continuousSourceSample:frame===first.frame?first.sourceStart:sourceStart,sourceTagSeek:anchors.find(a=>a.frame===frame)?.sourceStart??null};});
 const lastFrame=stream.blocks.at(-1).frame,lastStart=second.sourceStart+tick(lastFrame)-tick(second.frame);
 rows.push({domain:stream.domain,status:'CANDIDATE_ANCHORS',decodedSamples:samples,latencySamples:first.sourceStart,segments,totalPreparedSamples:segments.at(-1).outputEnd,
  firstSegment:stats(first.sourceStart,second.sourceStart),authoredGapSamples:segments[1].outputStart-segments[0].outputEnd,
  sourceSeekStepSamples:1837,continuousSamplesPerFrame:1837.5,
  maxClockSeekDifferenceSamples:Math.max(...anchors.slice(1).map(a=>Math.abs(a.sourceStart-second.sourceStart-(tick(a.frame)-tick(second.frame))))),
  boundaries,lastFrame,tailFromLastFrameStart:{sourceStart:lastStart,...stats(lastStart,samples)},
  schedulingDecision:'Candidate continuous-clock plan; preserve all decoded samples after1673 and insert authored initial gap. Runtime cue/window policy and browser behavior still require validation.'});
}
const obj={schemaVersion:1,sourceSha256:source.sourceSha256,sampleRate:22050,fps:12,rounding:'nearest ties-to-even',rows,
 claim:'Source sample anchors and proposed continuous-clock scheduling only. No original-runtime synchronization or listening acceptance.',audioAccepted:false};
const f=path.join(dir,'audio-sample-anchors-v1.json'),data=JSON.stringify(obj,null,2)+'\n';
if(fs.existsSync(f))assert.equal(fs.readFileSync(f,'utf8'),data);else if(process.argv.includes('--check'))throw Error(`Missing ${f}`);else fs.writeFileSync(f,data,{flag:'wx'});
console.log(JSON.stringify({status:'PARTIAL_MAIN_CLOCK_UNRESOLVED',streams:rows.map(r=>({domain:r.domain,status:r.status,samples:r.totalPreparedSamples,tail:r.tailFromLastFrameStart,head:r.firstSegment,maxSeekDelta:r.maxClockSeekDifferenceSamples})),audioAccepted:false}));
