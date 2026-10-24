import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const modelRaw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
assert.equal(sha(modelRaw),'0241cb5d6f0427442f56d6ac9a5188e56f9c2a7394134ab2b897092003f22c04');
const model=JSON.parse(modelRaw),raw=fs.readFileSync(new URL('../audit-v1/browser-decode-v1.json',import.meta.url));
assert.equal(sha(raw),'f319546c50c2001f8e3a8b3f5d6b2f2e66de65d99c2f85a7970d84b67a65b557');
const measured=JSON.parse(raw);assert.equal(measured.kind,'p058-chromium-decoded-audio-v1');
assert.equal(measured.alignmentAccepted,false);assert.equal(measured.listeningAccepted,false);
const clocks={};
for(const [id,row]of Object.entries(measured.bindings)){
 const bytes=fs.readFileSync(new URL('../'+row.file,import.meta.url));assert.equal(sha(bytes),row.sourceSha256);assert.equal(bytes.length,row.sourceBytes);
 assert.equal(row.sampleRate,id==='sa'?48000:22050);assert.equal(row.channels,1);if(id==='sa')continue;
 const s=model.streams.find(s=>s.spriteId===(id==='main'?285:+id));assert(s);assert.equal(s.codec,'mp3');
 assert.equal(row.decodedSamples,s.blocks.reduce((sum,b)=>sum+b.samples,0));
 const latency=s.blocks[0].seekSamples;assert.equal(latency,1673);const perFrame=row.sampleRate/12;
 for(const b of s.blocks.filter(b=>b.seekSamples<0)){assert.equal(b.payloadBytes,0);assert.equal(b.samples,0);}
 if(id==='218')continue;
 const first=s.blocks[0],entry=id==='main'?1:2;
 clocks[id]={spriteId:s.spriteId,firstAudioFrame:first.frame,entryFrame:entry,lastFrame:model.domains[String(s.spriteId)].frameCount,
  latencySamples:latency,decodedSamplesPerFrame:perFrame,decodedEntrySample:Math.ceil(latency+Math.max(0,entry-first.frame)*perFrame),
  trailingEmptyNegativeMarker:s.blocks.filter(b=>b.seekSamples<0).map(b=>({frame:b.frame,samples:b.samples,payloadBytes:b.payloadBytes,seek:b.seekSamples}))};
}
assert.equal(clocks['36'].decodedEntrySample,3511);
for(const id of ['76','97','129'])assert.equal(clocks[id].firstAudioFrame,3);
assert.equal(clocks.main.firstAudioFrame,14);
const bindings=Object.fromEntries(Object.entries(measured.bindings).filter(([id])=>id!=='218').map(([id,{file,...r}])=>[id,r]));
const code=`/** Generated from P058 source blocks and real Chromium PCM; alignment/listening remain open. */
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
export const P058_AUDIO_READBACK_SHA256=${JSON.stringify(sha(raw))};
export const P058_MEASURED_BINDINGS=${JSON.stringify(bindings,null,2)} as const satisfies Record<string,DecodedSourceStreamBinding>;
export const P058_AUDIO_CLOCKS=${JSON.stringify(clocks,null,2)} as const;
export type P058AudioDomain=keyof typeof P058_MEASURED_BINDINGS;
export type P058EmbeddedDomain=keyof typeof P058_AUDIO_CLOCKS;
`;
const out=new URL('../../../packages/demos/src/alg-l06-p058-measured-bindings-v1.ts',import.meta.url);
assert(['--write','--check'].includes(process.argv[2]));if(process.argv[2]==='--write')fs.writeFileSync(out,code);else assert.equal(fs.readFileSync(out,'utf8'),code);
console.log({status:'PASS',receiptSha256:sha(raw),bindingSha256:sha(code),frame1AudioEntry:clocks['36'].decodedEntrySample});
