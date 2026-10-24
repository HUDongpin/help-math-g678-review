import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const modelRaw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
assert.equal(sha(modelRaw),'ee17508b0ce795e1d4eab49686f293e3d24a7bfeaec58c8b8caf3681695510fa');
const model=JSON.parse(modelRaw),raw=fs.readFileSync(new URL('../audit-v1/browser-decode-v1.json',import.meta.url));
assert.equal(sha(raw),'dc0eeb030f6d7e0606434f14a31110c72dda777b3ee7efdea5b1f9f4bf08c861');
const measured=JSON.parse(raw);assert.equal(measured.kind,'p033-chromium-decoded-audio-v1');
assert.equal(measured.alignmentAccepted,false);assert.equal(measured.listeningAccepted,false);
const clocks={};
for(const [id,row] of Object.entries(measured.bindings)){
 const bytes=fs.readFileSync(new URL('../'+row.file,import.meta.url));assert.equal(sha(bytes),row.sourceSha256);assert.equal(bytes.length,row.sourceBytes);
 assert.equal(row.sampleRate,id==='sa'?48000:22050);assert.equal(row.channels,1);
 if(id==='sa')continue;
 const s=model.streams.find(s=>s.spriteId===(id==='main'?190:+id));assert(s);
 assert.equal(row.decodedSamples,s.blocks.reduce((sum,b)=>sum+b.samples,0));
 assert.equal(s.blocks[0].seekSamples,1673);
 const entry=id==='main'?1:2;
 clocks[id]={spriteId:s.spriteId,firstAudioFrame:s.firstBlockFrame,entryFrame:entry,lastFrame:s.frames,latencySamples:1673,
  decodedEntrySample:Math.ceil(1673+Math.max(0,entry-s.firstBlockFrame)*row.sampleRate/12),
  trailingEmptyNegativeMarker:s.blocks.filter(b=>b.seekSamples<0).map(b=>({frame:b.frame,samples:b.samples,payloadBytes:b.payloadBytes,seek:b.seekSamples}))};
}
assert.equal(clocks['111'].decodedEntrySample,3511);assert.equal(clocks['147'].firstAudioFrame,3);
const bindings=Object.fromEntries(Object.entries(measured.bindings).map(([id,{file,...r}])=>[id,r]));
const code=`/** Generated from pinned P033 source blocks and measured Chromium PCM. No listening/alignment acceptance. */
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
export const P033_AUDIO_READBACK_SHA256=${JSON.stringify(sha(raw))};
export const P033_MEASURED_BINDINGS=${JSON.stringify(bindings,null,2)} as const satisfies Record<string,DecodedSourceStreamBinding>;
export const P033_AUDIO_CLOCKS=${JSON.stringify(clocks,null,2)} as const;
export type P033AudioDomain=keyof typeof P033_MEASURED_BINDINGS;
export type P033EmbeddedDomain=keyof typeof P033_AUDIO_CLOCKS;
`;
const target=new URL('../../../packages/demos/src/alg-l06-p033-measured-bindings-v1.ts',import.meta.url);
if(process.argv[2]==='--write')fs.writeFileSync(target,code);
else if(process.argv[2]!=='--check'||fs.readFileSync(target,'utf8')!==code)throw Error('P033_MEASURED_BINDINGS_DRIFT_OR_MODE');
console.log({status:'PASS',domains:Object.keys(bindings),firstFrameEntrySample:clocks['111'].decodedEntrySample});
