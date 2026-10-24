import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root = new URL('../../../', import.meta.url);
const sha = raw => createHash('sha256').update(raw).digest('hex');
const receipt = fs.readFileSync(new URL('../audit-v1/browser-audio-decode-v1.json', import.meta.url));
const receiptSha = sha(receipt);
assert.equal(receiptSha, '60dfdb82740a88b30388273b11eb788fe7810da397c61815fe3a1ff5f2a65857');
const measured = JSON.parse(receipt);
assert.equal(measured.kind, 'p050-chromium-decoded-audio-v1');
assert.equal(measured.alignmentAccepted, false); assert.equal(measured.listeningAccepted, false);
const modelBytes = fs.readFileSync(new URL('../native-v1/source-model-v1.json', import.meta.url));
assert.equal(sha(modelBytes), '928ca5042b469795ae207921638d44ffd212034e8eb33e954d943b1721c05fb7');
const model = JSON.parse(modelBytes), bindings = {}, clocks = {};
const ids = {main: 489, wrong: 380, correct358: 358, correct432: 432, correct479: 479};
const adpcm = JSON.parse(fs.readFileSync(new URL('../audit-v1/adpcm-decode-v1.json', import.meta.url)));
for (const [id, row] of Object.entries(measured.bindings)) {
  const bytes = fs.readFileSync(new URL('../' + row.file, import.meta.url));
  assert.equal(row.sourceBytes, bytes.length); assert.equal(row.sourceSha256, sha(bytes));
  assert.equal(row.sampleRate, id === 'sa' ? 48000 : id === 'correct432' ? 11025 : 22050);
  assert.equal(row.channels, 1);
  if (id === 'unselected345') continue; // Source is retained; page AS never selects it.
  const {file, ...binding} = row; bindings[id] = binding;
  if (id === 'sa') continue;
  const source = model.streams.find(s => s.spriteId === ids[id]); assert(source);
  if (id === 'correct432') assert.equal(adpcm.output.sha256, row.sourceSha256);
  else assert.equal(source.sha256, row.sourceSha256);
  const entryFrame = id === 'main' ? 1 : 2;
  const cue = id === 'correct432'
    ? Math.ceil(adpcm.entry.skipSourceSamples * row.sampleRate / adpcm.output.sampleRate)
    : Math.ceil(Math.max(0, entryFrame - source.firstFrame) * row.sampleRate / model.runtime.fps);
  clocks[id] = {spriteId: ids[id], firstAudioFrame: source.firstFrame, entryFrame, decodedEntrySample: cue,
    entryAuthority: id === 'correct432' ? 'source-ADPCM-block-boundary-on-browser-sample-grid' : 'nominal-12fps-onset-on-decoded-stream',
    mp3SeekAndLatencyAligned: false, originalRuntimeAccepted: false};
}
assert.equal(clocks.correct432.decodedEntrySample, 919);
assert.equal(clocks.correct358.decodedEntrySample, 1838);
const code = `/** Generated from P050 Chromium decode. Original timing and listening remain unaccepted. */
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
export type P050AudioDomain = 'main' | 'wrong' | 'correct358' | 'correct432' | 'correct479' | 'sa';
export type P050EmbeddedDomain = Exclude<P050AudioDomain, 'sa'>;
export const P050_BROWSER_READBACK_SHA256 = ${JSON.stringify(receiptSha)};
export const P050_MEASURED_BINDINGS = ${JSON.stringify(bindings, null, 2)} as const satisfies Record<P050AudioDomain, DecodedSourceStreamBinding>;
export const P050_AUDIO_CLOCKS = ${JSON.stringify(clocks, null, 2)} as const;
`;
const out = new URL('packages/demos/src/alg-l06-p050-measured-bindings-v1.ts', root);
assert(['--write', '--check'].includes(process.argv[2]));
if (process.argv[2] === '--write' && !fs.existsSync(out)) fs.writeFileSync(out, code, {flag: 'wx'});
assert.equal(fs.readFileSync(out, 'utf8'), code);
console.log({mode: process.argv[2], receiptSha256: receiptSha, bindingSha256: sha(code), clocks});
