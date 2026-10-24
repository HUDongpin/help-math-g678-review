#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {decodeSwfAdpcmBlocks,encodePcm16LeWav} from '../../../scripts/lib/swf-adpcm.mjs';
const W=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),R=path.resolve(W,'../..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const modelBytes=fs.readFileSync(path.join(W,'native-v1/source-model-v1.json'));
assert.equal(sha(modelBytes),'82d884431bcdf4d231546fa743e6f7696028422aa0ea5c3f183119e34528fdbf');
const model=JSON.parse(modelBytes),stream=model.streams.find(s=>s.spriteId===105);
const decoder='scripts/lib/swf-adpcm.mjs';
assert.equal(sha(fs.readFileSync(path.join(R,decoder))),'bb1f449bb14b726d65b9421e409baf2932b0cebe67d43511ccdf5137e88a01ab');
assert.equal(stream.codec,'swf-adpcm');assert.equal(stream.spriteId,105);
assert.deepEqual(stream.blocks.map(b=>b.frame),Array.from({length:13},(_,i)=>i+1));
assert.equal(stream.head.soundRate,'0');assert.equal(stream.head.sampleSize,'459');
assert.equal(stream.head.soundStereo,'0');
const raw=fs.readFileSync(path.join(R,stream.assetPath));
assert.equal(raw.length,3770);assert.equal(sha(raw),stream.payloadSha256);
const blocks=stream.blocks.map(b=>{
  assert.equal(b.samples,459);assert.equal(b.seekSamples,null);assert.equal(b.payloadBytes,290);
  const bytes=raw.subarray(b.payloadOffset,b.payloadOffset+b.payloadBytes);
  assert.equal(sha(bytes),b.rawBlockSha256);assert.equal(sha(bytes),b.payloadSha256);
  return {bytes,sampleCountPerChannel:b.samples};
});
const decoded=decodeSwfAdpcmBlocks(blocks,{channels:1});
assert.equal(decoded.sampleCountPerChannel,5967);
const wav=encodePcm16LeWav(decoded.pcm16,{sampleRateHz:5512,channels:1});
assert.equal(sha(wav),'f3e05365073feff502feda8779b3d3a5e3ba4ca6ee213e7a162e1ad5b3961eb8');
const receipt={kind:'p057-source-adpcm-right4-technical-decode-v1',
 sourceModelSha256:sha(modelBytes),sourceSwfSha256:model.sourceSha256,
 source:{path:stream.assetPath,bytes:raw.length,sha256:sha(raw),spriteId:105,blocks:13,samplesPerBlock:459,sampleRate:5512},
 decoder:{path:decoder,sha256:sha(fs.readFileSync(path.join(R,decoder)))},
 output:{path:'migrations/shared-alg001-l06-p057/assets/source-stream-105.wav',bytes:wav.length,sha256:sha(wav),samples:5967,channels:1,sampleRate:5512},
 entry:{firstBlockFrame:1,basis:'Source105 ADPCM blocks1..13 each own459 samples. Maintained selected entry requires the separately reviewed source/host projection.',browserDecodedCuePending:true,selectedEntryPending:true},
 originalRuntimeAccepted:false,listeningAccepted:false};
assert(['--write','--check'].includes(process.argv[2]));
for(const [file,bytes] of [[receipt.output.path,wav],['migrations/shared-alg001-l06-p057/audit-v1/adpcm-right4-decode-v1.json',Buffer.from(JSON.stringify(receipt,null,2)+'\n')]]){
 const p=path.join(R,file);
 if(process.argv[2]==='--write')fs.writeFileSync(p,bytes,{flag:'wx'});
 else assert.deepEqual(fs.readFileSync(p),bytes);
}
console.log(JSON.stringify(receipt));
