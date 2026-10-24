import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const receipt=fs.readFileSync(new URL('output/playwright/alg-l06-p047-audio-decode-v1/browser-readback.json',root));
const receiptSha=sha(receipt);
assert.equal(receiptSha,'26b1b73859dd3d9f4780b0135ea5cb70bd6fedbb3a22efc6101233f17c9157c7');
const measured=JSON.parse(receipt);
assert.equal(measured.decodeOnly,true);
assert.equal(measured.sourceFrameAlignmentAccepted,false);
const files={main:'assets/source-stream-117-main.mp3',wrong:'assets/source-stream-70-wrong.mp3',
  right:'assets/source-stream-72-right.mp3',sa:'source-v1/L6TI07.mp3'};
for(const [id,file] of Object.entries(files)){
 const bytes=fs.readFileSync(new URL('../'+file,import.meta.url));
 assert.equal(measured.streams[id].sourceBytes,bytes.length);
 assert.equal(measured.streams[id].sourceSha256,sha(bytes));
 assert.equal(measured.streams[id].sampleRate,id==='sa'?48000:22050);
 assert.equal(measured.streams[id].channels,1);
}
const code='/** Generated from P047 real Chromium decode; alignment and listening remain open. */\n'+
  'import type {DecodedSourceStreamBinding} from \'./decoded-source-stream-transport\';\n'+
  'export type P047AudioDomain = \'main\' | \'wrong\' | \'right\' | \'sa\';\n'+
  'export const P047_BROWSER_READBACK_SHA256 = '+JSON.stringify(receiptSha)+';\n'+
  'export const P047_MEASURED_BINDINGS = '+JSON.stringify(measured.streams,null,2)+
  ' as const satisfies Record<P047AudioDomain, DecodedSourceStreamBinding>;\n';
const out=new URL('packages/demos/src/alg-l06-p047-measured-bindings-v1.ts',root);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write'&&!fs.existsSync(out))fs.writeFileSync(out,code,{flag:'wx'});
assert.equal(fs.readFileSync(out,'utf8'),code);
console.log({mode:process.argv[2],receiptSha256:receiptSha,bindingSha256:sha(code)});
