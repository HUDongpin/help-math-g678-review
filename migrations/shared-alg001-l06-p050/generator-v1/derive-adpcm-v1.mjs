import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {decodeSwfAdpcmBlocks, encodePcm16LeWav} from '../../../scripts/lib/swf-adpcm.mjs';

const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = path.resolve(W, '../..');
const sha = b => createHash('sha256').update(b).digest('hex');
const source = fs.readFileSync(path.join(W, 'native-v1/source-model-v1.json'));
assert.equal(sha(source), '928ca5042b469795ae207921638d44ffd212034e8eb33e954d943b1721c05fb7');
const model = JSON.parse(source), stream = model.streams.find(s => s.spriteId === 432);
const decoder = 'scripts/lib/swf-adpcm.mjs';
assert.equal(sha(fs.readFileSync(path.join(R, decoder))), 'bb1f449bb14b726d65b9421e409baf2932b0cebe67d43511ccdf5137e88a01ab');
assert.equal(stream.codec, 'swf-adpcm');
assert.equal(stream.head.soundRate, '0');
assert.equal(stream.head.soundStereo, '0');
const raw = fs.readFileSync(path.join(R, stream.assetPath));
assert.equal(sha(raw), stream.sha256);
const blocks = stream.blocks.map(b => {
  const bytes = raw.subarray(b.offset, b.offset + b.bytes);
  assert.equal(sha(bytes), b.rawBlockSha256);
  assert.equal(b.samples, 459);
  return {bytes, sampleCountPerChannel: b.samples};
});
const decoded = decodeSwfAdpcmBlocks(blocks, {channels: 1});
assert.equal(decoded.sampleCountPerChannel, 5967);
const wav = encodePcm16LeWav(decoded.pcm16, {sampleRateHz: 5512, channels: 1});
const output = 'migrations/shared-alg001-l06-p050/assets/source-stream-432-correct-432.wav';
const receipt = {kind: 'p050-adpcm-technical-decode-v1', sourceModelSha256: sha(source),
  sourceSwfSha256: model.assetId.slice(4), source: {path: stream.assetPath, bytes: raw.length, sha256: sha(raw)},
  decoder, output: {path: output, bytes: wav.length, sha256: sha(wav), samples: 5967, sampleRate: 5512, channels: 1},
  entry: {frame: 2, skipSourceSamples: 459, browserDecodedCuePending: true},
  listeningAccepted: false, originalRuntimeAccepted: false};
assert(['--write', '--check'].includes(process.argv[2]));
for (const [file, bytes] of [[output, wav],
  ['migrations/shared-alg001-l06-p050/audit-v1/adpcm-decode-v1.json', Buffer.from(JSON.stringify(receipt, null, 2) + '\n')]]) {
  if (process.argv[2] === '--write') fs.writeFileSync(path.join(R, file), bytes, {flag: 'wx'});
  else assert.deepEqual(fs.readFileSync(path.join(R, file)), bytes);
}
console.log(JSON.stringify(receipt));
