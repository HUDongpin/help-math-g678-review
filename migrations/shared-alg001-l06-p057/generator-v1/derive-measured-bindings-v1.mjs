import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const modelRaw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
assert.equal(sha(modelRaw),'82d884431bcdf4d231546fa743e6f7696028422aa0ea5c3f183119e34528fdbf');
const model=JSON.parse(modelRaw),raw=fs.readFileSync(new URL('../audit-v1/browser-decode-v1.json',import.meta.url));
assert.equal(sha(raw),'fd172f064d035c812a01257f9250aa86c8bc2f56cc11e237ef9ea7c7d000ca4f');
const measured=JSON.parse(raw);assert.equal(measured.kind,'p057-chromium-decoded-audio-v1');
assert.equal(measured.alignmentAccepted,false);assert.equal(measured.listeningAccepted,false);
const adpcm=JSON.parse(fs.readFileSync(new URL('../audit-v1/adpcm-right4-decode-v1.json',import.meta.url)));
const clocks={};
for(const [id,row]of Object.entries(measured.bindings)){
 const bytes=fs.readFileSync(new URL('../'+row.file,import.meta.url));assert.equal(sha(bytes),row.sourceSha256);assert.equal(bytes.length,row.sourceBytes);
 assert.equal(row.sampleRate,id==='sa'?48000:id==='105'?11025:22050);assert.equal(row.channels,1);if(id==='sa')continue;
 const s=model.streams.find(s=>s.spriteId===(id==='main'?312:+id));assert(s);
 let latency,perFrame;
 if(id==='105'){
  assert.equal(s.codec,'swf-adpcm');assert.equal(adpcm.output.sha256,row.sourceSha256);assert.equal(adpcm.sourceModelSha256,sha(modelRaw));
  assert.equal(adpcm.output.sampleRate,5512);assert.equal(s.blocks[0].frame,1);assert.equal(s.blocks[0].samples,459);
  assert.equal(row.decodedSamples,11935);latency=0;perFrame=459*row.sampleRate/5512;
 }else{
  assert.equal(row.decodedSamples,s.blocks.reduce((sum,b)=>sum+b.samples,0));latency=s.blocks[0].seekSamples;assert.equal(latency,1673);perFrame=row.sampleRate/12;
 }
 for(const b of s.blocks.filter(b=>b.seekSamples<0)){assert.equal(b.payloadBytes,0);assert.equal(b.samples,0);}
 if(id==='233')continue;
 const first=s.blocks[0],entry=id==='main'?1:2;
 clocks[id]={spriteId:s.spriteId,firstAudioFrame:first.frame,entryFrame:entry,lastFrame:model.domains[String(s.spriteId)].frameCount,latencySamples:latency,decodedSamplesPerFrame:perFrame,
  decodedEntrySample:Math.ceil(latency+Math.max(0,entry-first.frame)*perFrame),
  ...(id==='105'?{sourceCodec:'swf-adpcm',sourceRate:5512,entrySkippedSourceSamples:459,resamplerPhaseVerified:false}:{}),
  trailingEmptyNegativeMarker:s.blocks.filter(b=>b.seekSamples<0).map(b=>({frame:b.frame,samples:b.samples,payloadBytes:b.payloadBytes,seek:b.seekSamples}))};
}
assert.equal(clocks['105'].decodedEntrySample,919);assert.equal(clocks['77'].firstAudioFrame,3);assert.equal(clocks.main.firstAudioFrame,14);
const bindings=Object.fromEntries(Object.entries(measured.bindings).filter(([id])=>id!=='233').map(([id,{file,...r}])=>[id,r]));
const code=`/** Generated from P057 source blocks and real Chromium PCM; alignment/listening remain open. */
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
export const P057_AUDIO_READBACK_SHA256=${JSON.stringify(sha(raw))};
export const P057_MEASURED_BINDINGS=${JSON.stringify(bindings,null,2)} as const satisfies Record<string,DecodedSourceStreamBinding>;
export const P057_AUDIO_CLOCKS=${JSON.stringify(clocks,null,2)} as const;
export type P057AudioDomain=keyof typeof P057_MEASURED_BINDINGS;
export type P057EmbeddedDomain=keyof typeof P057_AUDIO_CLOCKS;
`;
const out=new URL('../../../packages/demos/src/alg-l06-p057-measured-bindings-v1.ts',import.meta.url);
assert(['--write','--check'].includes(process.argv[2]));if(process.argv[2]==='--write')fs.writeFileSync(out,code);else assert.equal(fs.readFileSync(out,'utf8'),code);
console.log({status:'PASS',receiptSha256:sha(raw),bindingSha256:sha(code),adpcmEntry:clocks['105']});
