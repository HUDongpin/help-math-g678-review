// Source-only inventory. No decoded-byte slicing or audio-acceptance claim.
import fs from 'node:fs';
import path from 'node:path';
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(path.join(dir,'preserved-source-v1.swf'));
assert.equal(sha(raw),'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
assert.equal(raw.subarray(0,3).toString(),'CWS');
const b=Buffer.concat([raw.subarray(0,8),inflateSync(raw.subarray(8))]);
assert.equal(b.length,raw.readUInt32LE(4));
const rectEnd=8+Math.ceil((5+4*(b[8]>>3))/8),streams=[];
const outputs=[];
function scan(start,end,domain){
 let pos=start,frame=1,head=null,ended=false;const blocks=[],payloads=[];
 while(pos<end){
  assert.ok(pos+2<=end);const offset=pos,tag=b.readUInt16LE(pos);pos+=2;
  const code=tag>>6;let size=tag&63;
  if(size===63){assert.ok(pos+4<=end);size=b.readUInt32LE(pos);pos+=4;}
  const stop=pos+size;assert.ok(stop<=end);
  if(code===0){assert.equal(size,0);ended=true;break;}
  if(code===39){assert.ok(size>=4);scan(pos+4,stop,`sprite-${b.readUInt16LE(pos)}`);}
  if(code===18||code===45){
   assert.equal(head,null);assert.ok(size>=4);const flags=b[pos+1];
   head={frame,compression:flags>>4,rateCode:(flags>>2)&3,channels:(flags&1)+1,
    sampleRateHz:[5512.5,11025,22050,44100][(flags>>2)&3],
    samplesPerFrame:b.readUInt16LE(pos+2),latencySeek:size>=6?b.readInt16LE(pos+4):null,
    tagOffset:offset,tagSha256:sha(b.subarray(offset,stop))};
   assert.equal(head.compression,2,'This bounded extractor supports MP3 streams only');
  }
  if(code===19){
   assert.ok(head);assert.ok(size>=4);
   blocks.push({frame,tagOffset:offset,tagSha256:sha(b.subarray(offset,stop)),
    sampleCount:b.readUInt16LE(pos),seekSamples:b.readInt16LE(pos+2),payloadBytes:size-4});
   payloads.push(b.subarray(pos+4,stop));
  }
  if(code===1)frame++;
  pos=stop;
 }
 assert.ok(ended,`${domain} has no End tag`);
 if(head){
  const bytes=Buffer.concat(payloads),name=`${domain}-source-stream-v1.mp3`;
  assert.equal(bytes[0],255);assert.equal(bytes[1]&224,224);
  outputs.push([name,bytes]);
  streams.push({domain,frames:frame-1,head,blocks,sourceSampleCount:blocks.reduce((n,r)=>n+r.sampleCount,0),
   encoded:{path:path.relative(root,path.join(dir,name)),bytes:bytes.length,sha256:sha(bytes)},
   playbackQualification:'Whole-stream decode required; source frame/seek scheduling and latency trimming not yet validated.'});
 }
}
scan(rectEnd+4,b.length,'root');
const result={schemaVersion:1,animationId:'shared-nms002-l02-p052',sourceSha256:sha(raw),
 generatorSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),streams,
 extraction:'Concatenate original MP3 SoundStreamBlock payloads after removing only each four-byte SWF sample-count/seek header.',
 audioAccepted:false,spokenLanguage:'unverified',runtimeSynchronization:'unverified'};
outputs.push(['source-audio-streams-v1.json',Buffer.from(JSON.stringify(result,null,2)+'\n')]);
// Existing evidence is checked, never replaced. New files use exclusive creation.
for(const [name,data]of outputs){const f=path.join(dir,name);if(fs.existsSync(f))assert.deepEqual(fs.readFileSync(f),data,f);else if(process.argv.includes('--check'))throw Error(`Missing ${f}`);else fs.writeFileSync(f,data,{flag:'wx'});}
console.log(JSON.stringify({status:'PASS',mode:process.argv.includes('--check')?'check':'extract',streams:streams.map(s=>({domain:s.domain,frames:s.frames,blocks:s.blocks.length,bytes:s.encoded.bytes,firstBlock:s.blocks[0].frame,lastBlock:s.blocks.at(-1).frame})),audioAccepted:false}));
