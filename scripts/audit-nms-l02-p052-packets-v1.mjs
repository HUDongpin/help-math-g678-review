import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n)));
const source=read('source-audio-streams-v1.json'),pcm=read('source-pcm-inventory-v1.json');
assert.equal(source.sourceSha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const streams=[];
for(const s of source.streams){
 const file=path.join(root,s.encoded.path);assert.equal(sha(fs.readFileSync(file)),s.encoded.sha256);
 const args=['-v','error','-select_streams','a:0','-show_entries','frame=nb_samples,pkt_size,pkt_pos','-of','json',file];
 const r=spawnSync('/opt/homebrew/bin/ffprobe',args,{encoding:'utf8',maxBuffer:4*1024*1024});assert.equal(r.status,0,r.stderr);
 const packets=JSON.parse(r.stdout).frames.map(p=>({offset:Number(p.pkt_pos),bytes:Number(p.pkt_size),samples:Number(p.nb_samples)}));
 let offset=0,cursor=0,decodedTotal=0;const blocks=[];
 for(const b of s.blocks){
  const start=offset,end=start+b.payloadBytes;let actual=0,count=0;
  while(cursor<packets.length&&packets[cursor].offset<end){
   const p=packets[cursor++];assert.equal(p.offset,offset);assert.ok(p.offset+p.bytes<=end,'MP3 packet crosses source block; this audit must be revised');
   offset+=p.bytes;actual+=p.samples;count++;
  }
  assert.equal(offset,end);
  blocks.push({frame:b.frame,encodedStart:start,encodedEnd:end,packetCount:count,declaredSamples:b.sampleCount,decodedSamples:actual,difference:b.sampleCount-actual,sourceTagSha256:b.tagSha256,decodedStart:decodedTotal});
  decodedTotal+=actual;
 }
 assert.equal(cursor,packets.length);assert.equal(offset,s.encoded.bytes);
 assert.equal(decodedTotal,pcm.streams.find(p=>p.domain===s.domain).samples);
 streams.push({domain:s.domain,packets:packets.length,decodedSamples:decodedTotal,declaredSamples:s.sourceSampleCount,blocks,discrepancies:blocks.filter(b=>b.difference!==0),probeCommand:args});
}
const differences=streams.flatMap(s=>s.discrepancies.map(d=>({domain:s.domain,...d})));
assert.equal(differences.length,1);assert.equal(differences[0].domain,'sprite-350');assert.equal(differences[0].frame,102);assert.equal(differences[0].difference,576);assert.equal(differences[0].packetCount,2);
const obj={schemaVersion:1,sourceSha256:source.sourceSha256,streams,
 finding:'Main frame102 declares1728 samples but contains two complete MP3 packets totaling1152 samples. Whole-stream FFmpeg decode and FFprobe packet counts agree. No missing bytes are manufactured.',
 failedInvariant:{command:'node scripts/audit-nms-l02-p052-audio-clock-v1.mjs',declaredSamples:260352,decodedSamples:259776,status:'Source declared-count equality failed before clock plan generation'},
 disposition:'Preserve source bytes; main timeline scheduling unresolved. Five other streams have exact declared/decoded count agreement.',audioAccepted:false};
const f=path.join(dir,'source-packet-audit-v1.json'),data=JSON.stringify(obj,null,2)+'\n';
if(fs.existsSync(f))assert.equal(fs.readFileSync(f,'utf8'),data);else if(process.argv.includes('--check'))throw Error(`Missing ${f}`);else fs.writeFileSync(f,data,{flag:'wx'});
console.log(JSON.stringify({status:'PASS_WITH_SOURCE_DISCREPANCY',differences,decodedSamples:streams.map(s=>[s.domain,s.decodedSamples]),audioAccepted:false}));
