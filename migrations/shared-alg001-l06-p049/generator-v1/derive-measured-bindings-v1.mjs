import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const receipt=fs.readFileSync(new URL('output/playwright/alg-l06-p049-native-v1/decode-v1-run.json',root));
const receiptSha=sha(receipt);
assert.equal(receiptSha,'52d3e4662b83eb5561c3345b756c9db856de39a12be9016ebf580e8bf219fd81');
const measured=JSON.parse(receipt);
assert.equal(measured.decodeOnly,true);
assert.equal(measured.sourceFrameAlignmentAccepted,false);
const files={main:'assets/source-stream-327-main.mp3',wrong4:'assets/source-stream-302-wrong4.mp3',
  right4:'assets/source-stream-192-right4.wav',sa:'source-v1/L6TI09.mp3'};
for(const [id,file] of Object.entries(files)){
 const bytes=fs.readFileSync(new URL('../'+file,import.meta.url));
 assert.equal(measured.streams[id].sourceBytes,bytes.length);
 assert.equal(measured.streams[id].sourceSha256,sha(bytes));
 assert.equal(measured.streams[id].sampleRate,id==='sa'?48000:id==='right4'?11025:22050);
 assert.equal(measured.streams[id].channels,1);
}
const adpcm=JSON.parse(fs.readFileSync(new URL('../audit-v1/adpcm-right4-decode-v1.json',import.meta.url)));
assert.equal(adpcm.sourceModelSha256,'8faf55033928e8449c96fe3a9c1a7504b7f119119f2f90a4f81d8caf309b11ff');
assert.equal(adpcm.output.sha256,measured.streams.right4.sourceSha256);
assert.equal(adpcm.entry.selectedFrame,2);assert.equal(adpcm.entry.skipSourceSamples,459);
const entry={entryFrame:2,decodedSample:Math.ceil(adpcm.entry.skipSourceSamples*measured.streams.right4.sampleRate/adpcm.output.sampleRate),sourceRate:adpcm.output.sampleRate,skippedSourceSamples:adpcm.entry.skipSourceSamples,sourceModelSha256:adpcm.sourceModelSha256,browserReceiptSha256:receiptSha,resamplerPhaseVerified:false,originalRuntimeAccepted:false,listeningAccepted:false};
assert.equal(entry.decodedSample,919);
const code='/** Generated from P049 real Chromium decode; alignment and listening remain open. */\n'+
  'import type {DecodedSourceStreamBinding} from \'./decoded-source-stream-transport\';\n'+
  'export type P049AudioDomain = \'main\' | \'wrong4\' | \'right4\' | \'sa\';\n'+
  'export const P049_BROWSER_READBACK_SHA256 = '+JSON.stringify(receiptSha)+';\n'+
  'export const P049_MEASURED_BINDINGS = '+JSON.stringify(measured.streams,null,2)+
  ' as const satisfies Record<P049AudioDomain, DecodedSourceStreamBinding>;\n'+
  'export const P049_RIGHT4_ENTRY = '+JSON.stringify(entry,null,2)+' as const;\n';
const out=new URL('packages/demos/src/alg-l06-p049-measured-bindings-v1.ts',root);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write'&&!fs.existsSync(out))fs.writeFileSync(out,code,{flag:'wx'});
assert.equal(fs.readFileSync(out,'utf8'),code);
console.log({mode:process.argv[2],receiptSha256:receiptSha,bindingSha256:sha(code)});
