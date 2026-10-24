import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const modelBytes=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
assert.equal(sha(modelBytes),'7b2a8d6e3c4e7b4d5bd1946b09d9ab8e3c3501d8291d08463807d7745af9360a');
const model=JSON.parse(modelBytes),raw=fs.readFileSync(new URL('../audit-v1/browser-decode-v2.json',import.meta.url));
assert.equal(sha(raw),'d1fb6e2f03ce96714d1db5b248600056b954f869ffcebc1bd0f935f6a3107ce5');
const measured=JSON.parse(raw);assert.equal(measured.kind,'p031-chromium-decoded-audio-v1');
assert.equal(measured.alignmentAccepted,false);assert.equal(measured.listeningAccepted,false);
for(const [id,row]of Object.entries(measured.bindings)){
 const bytes=fs.readFileSync(new URL('../'+row.file,import.meta.url));
 assert.equal(row.sourceSha256,sha(bytes));assert.equal(row.sourceBytes,bytes.length);
 assert.equal(row.sampleRate,id==='sa'?48000:22050);assert.equal(row.channels,1);
 if(id!=='sa')assert.equal(row.decodedSamples,model.streams.find(s=>s.role===id).blocks.reduce((n,b)=>n+b.samples,0));
}
const main=model.streams.find(s=>s.role==='main');
assert.equal(main.blockCount,1611);assert(main.blocks.every((b,i)=>b.frame===i+1&&b.seekSamples>=0));
const latency=Buffer.from(main.headHex,'hex').readInt16LE(4);assert.equal(latency,1673);
const bindings=Object.fromEntries(['main','sa'].map(id=>{const {file,...row}=measured.bindings[id];return[id,row];}));
const plan={sourceSwfSha256:model.sourceSha256,frameDomain:'sprite-363',firstFrame:1,lastFrame:1611,fps:12,
 latencySamples:latency,sourceSegmentCount:1,sourceHasNegativeSeek:false,decoder:bindings.main};
const code=`/** Generated from pinned P031 SWF and Chromium decode. Alignment/listening are unaccepted. */
import type {ContinuousSourceClockPlan} from './continuous-source-stream-clock-candidate';
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
export const P031_BROWSER_READBACK_SHA256=${JSON.stringify(sha(raw))};
export const P031_MEASURED_BINDINGS=${JSON.stringify(bindings,null,2)} as const satisfies Record<'main'|'sa',DecodedSourceStreamBinding>;
export const P031_MAIN_CLOCK_PLAN=${JSON.stringify(plan,null,2)} as const satisfies ContinuousSourceClockPlan;
`;
const target=new URL('../../../packages/demos/src/alg-l06-p031-measured-bindings-v1.ts',import.meta.url);
if(process.argv[2]==='--write')fs.writeFileSync(target,code);
else if(process.argv[2]!=='--check'||fs.readFileSync(target,'utf8')!==code)throw Error('P031_BINDINGS_DRIFT_OR_MODE');
console.log({status:'PASS',receiptSha256:sha(raw),latency,streamsChecked:Object.keys(measured.bindings).length});
