import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const receipt=fs.readFileSync(new URL('output/playwright/alg-l06-p046-audio-decode-v1/browser-readback.json',root));
const receiptSha=sha(receipt);
assert.equal(receiptSha,'d90e3b417d465143ae80bdcc069d65f26bf9d7905df5dec0b92e5537d75fd3c2');
const measured=JSON.parse(receipt);
assert.equal(measured.decodeOnly,true);
assert.equal(measured.sourceFrameAlignmentAccepted,false);
const files={main:'assets/source-stream-123-main.mp3',wrong:'assets/source-stream-61-wrong.mp3',
  right:'assets/source-stream-63-right.mp3',sa:'source-v1/L6TI06.mp3'};
for(const [id,file] of Object.entries(files)){
 const bytes=fs.readFileSync(new URL('../'+file,import.meta.url));
 assert.equal(measured.streams[id].sourceBytes,bytes.length);
 assert.equal(measured.streams[id].sourceSha256,sha(bytes));
 assert.equal(measured.streams[id].sampleRate,id==='sa'?48000:22050);
 assert.equal(measured.streams[id].channels,1);
}
const code='/** Generated from P046 real Chromium decode; alignment and listening remain open. */\n'+
  'import type {DecodedSourceStreamBinding} from \'./decoded-source-stream-transport\';\n'+
  'export type P046AudioDomain = \'main\' | \'wrong\' | \'right\' | \'sa\';\n'+
  'export const P046_BROWSER_READBACK_SHA256 = '+JSON.stringify(receiptSha)+';\n'+
  'export const P046_MEASURED_BINDINGS = '+JSON.stringify(measured.streams,null,2)+
  ' as const satisfies Record<P046AudioDomain, DecodedSourceStreamBinding>;\n';
const out=new URL('packages/demos/src/alg-l06-p046-measured-bindings-v1.ts',root);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write'&&!fs.existsSync(out))fs.writeFileSync(out,code,{flag:'wx'});
assert.equal(fs.readFileSync(out,'utf8'),code);
console.log({mode:process.argv[2],receiptSha256:receiptSha,bindingSha256:sha(code)});
