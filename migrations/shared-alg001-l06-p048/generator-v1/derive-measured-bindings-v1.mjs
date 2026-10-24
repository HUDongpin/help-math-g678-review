import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const receipt=fs.readFileSync(new URL('output/playwright/alg-l06-p048-native-v1/decode-v1-run.json',root));
const receiptSha=sha(receipt);
assert.equal(receiptSha,'92a956f0d5802a0fcdc00c7f7a97d7fd2737c3741d373a12ac135fc34e97689d');
const measured=JSON.parse(receipt);
assert.equal(measured.decodeOnly,true);
assert.equal(measured.sourceFrameAlignmentAccepted,false);
const files={main:'assets/source-stream-348-main.mp3',wrong4:'assets/source-stream-304-wrong4.mp3',
  right4:'assets/source-stream-217-right4.mp3',sa:'source-v1/L6TI08.mp3'};
for(const [id,file] of Object.entries(files)){
 const bytes=fs.readFileSync(new URL('../'+file,import.meta.url));
 assert.equal(measured.streams[id].sourceBytes,bytes.length);
 assert.equal(measured.streams[id].sourceSha256,sha(bytes));
 assert.equal(measured.streams[id].sampleRate,id==='sa'?48000:22050);
 assert.equal(measured.streams[id].channels,1);
}
const code='/** Generated from P048 real Chromium decode; alignment and listening remain open. */\n'+
  'import type {DecodedSourceStreamBinding} from \'./decoded-source-stream-transport\';\n'+
  'export type P048AudioDomain = \'main\' | \'wrong4\' | \'right4\' | \'sa\';\n'+
  'export const P048_BROWSER_READBACK_SHA256 = '+JSON.stringify(receiptSha)+';\n'+
  'export const P048_MEASURED_BINDINGS = '+JSON.stringify(measured.streams,null,2)+
  ' as const satisfies Record<P048AudioDomain, DecodedSourceStreamBinding>;\n';
const out=new URL('packages/demos/src/alg-l06-p048-measured-bindings-v1.ts',root);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write'&&!fs.existsSync(out))fs.writeFileSync(out,code,{flag:'wx'});
assert.equal(fs.readFileSync(out,'utf8'),code);
console.log({mode:process.argv[2],receiptSha256:receiptSha,bindingSha256:sha(code)});
