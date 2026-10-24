import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const modelRaw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
assert.equal(sha(modelRaw),'e41e8877a173cf62bbdb5356b273c61bdd78ac07841c813123d82927fd1eab98');
const model=JSON.parse(modelRaw),raw=fs.readFileSync(new URL('../audit-v1/browser-decode-v1.json',import.meta.url));
assert.equal(sha(raw),'06c53a730193a47fe95545f2d6547e7d938e45dc6198b7921fbc471eea05a5b2');
const measured=JSON.parse(raw);assert.equal(measured.kind,'p056-chromium-decoded-audio-v1');
assert.equal(measured.alignmentAccepted,false);assert.equal(measured.listeningAccepted,false);
const clocks={};
for(const [id,row] of Object.entries(measured.bindings)){
 const bytes=fs.readFileSync(new URL('../'+row.file,import.meta.url));assert.equal(sha(bytes),row.sourceSha256);assert.equal(bytes.length,row.sourceBytes);
 assert.equal(row.sampleRate,id==='sa'?48000:22050);assert.equal(row.channels,['83','116'].includes(id)?2:1);
 if(id==='sa')continue;
 const s=model.streams.find(s=>s.spriteId===(id==='main'?305:+id));assert(s);
 assert.equal(row.decodedSamples,s.blocks.reduce((sum,b)=>sum+b.samples,0));
 const first=s.blocks[0],latency=first.seekSamples;assert.equal(latency,['83','116'].includes(id)?1674:1673);
 for(const b of s.blocks.filter(b=>b.seekSamples<0)){assert.equal(b.payloadBytes,0);assert.equal(b.samples,0);}
 // Sprite223 is a stopped duplicate-name clip in the walkthrough, not a selected feedback track.
 if(id==='223')continue;
 const entry=id==='main'?1:2;
 clocks[id]={spriteId:s.spriteId,firstAudioFrame:first.frame,entryFrame:entry,lastFrame:model.domains[String(s.spriteId)].frameCount,latencySamples:latency,
  decodedEntrySample:Math.ceil(latency+Math.max(0,entry-first.frame)*row.sampleRate/12),
  trailingEmptyNegativeMarker:s.blocks.filter(b=>b.seekSamples<0).map(b=>({frame:b.frame,samples:b.samples,payloadBytes:b.payloadBytes,seek:b.seekSamples}))};
}
assert.equal(clocks['116'].decodedEntrySample,3512);assert.equal(clocks['138'].firstAudioFrame,3);assert.equal(clocks.main.firstAudioFrame,14);
const bindings=Object.fromEntries(Object.entries(measured.bindings).filter(([id])=>id!=='223').map(([id,{file,...r}])=>[id,r]));
const code=`/** Generated from pinned P056 blocks and measured Chromium PCM. No listening/alignment acceptance. */
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
export const P056_AUDIO_READBACK_SHA256=${JSON.stringify(sha(raw))};
export const P056_MEASURED_BINDINGS=${JSON.stringify(bindings,null,2)} as const satisfies Record<string,DecodedSourceStreamBinding>;
export const P056_AUDIO_CLOCKS=${JSON.stringify(clocks,null,2)} as const;
export type P056AudioDomain=keyof typeof P056_MEASURED_BINDINGS;
export type P056EmbeddedDomain=keyof typeof P056_AUDIO_CLOCKS;
`;
const target=new URL('../../../packages/demos/src/alg-l06-p056-measured-bindings-v1.ts',import.meta.url);
if(process.argv[2]==='--write')fs.writeFileSync(target,code);
else if(process.argv[2]!=='--check'||fs.readFileSync(target,'utf8')!==code)throw Error('P056_MEASURED_BINDINGS_DRIFT_OR_MODE');
console.log({status:'PASS',domains:Object.keys(bindings),inactiveSourceStream:223,stereo:['83','116'],mainFirstAudioFrame:14});
