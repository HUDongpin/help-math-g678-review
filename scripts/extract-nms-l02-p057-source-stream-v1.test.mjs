import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const script = fileURLToPath(new URL('./extract-nms-l02-p057-source-stream-v1.mjs', import.meta.url));
const output = new URL('../output/nms-l02-p057-audio-20260927/', import.meta.url);
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('P057 source MP3 and complete signed raw block map are reproducible', t => {
  if (!process.env.HELP_MATH_G678_SOURCE_ROOT) {
    t.skip('real G6–G8 source root required');
    return;
  }
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot);
  const mp3 = readFileSync(new URL('embedded-source-stream-v1.mp3', output));
  const indexBytes = readFileSync(new URL('raw-index-v1.json', output));
  const report = readFileSync(new URL('AUDIO_SOURCE_2026-09-27.md', output));
  const index = JSON.parse(indexBytes);
  assert.equal(index.source.sha256,
    '9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa');
  assert.equal(index.source.bytes, 137055);
  assert.equal(mp3.length, 134290);
  assert.equal(sha256(mp3), 'c87ebf7d1117a616ebddd6b3530a7b19c50dfd885bc5e2734817657da026c2dc');
  assert.equal(index.stream.ownerDomainId, 'sprite-66');
  assert.equal(index.stream.blockCount, 324);
  assert.equal(index.stream.blocks.length, 324);
  assert.deepEqual(index.stream.blocks.map(block => block.frame),
    Array.from({length: 324}, (_, number) => number + 5));
  assert.equal(index.stream.blocks.reduce((sum, block) => sum + block.declaredSamples, 0), 595008);
  assert.equal(index.stream.blocks[0].seekSamples, 1673);
  assert.equal(index.stream.header.mp3LatencySeek, 1673);
  assert.deepEqual(index.stream.blocks.filter(block => block.payload.bytes === 0).map(block => block.frame), [6]);
  assert.equal(index.stream.blocks[1].declaredSamples, 0);
  assert.equal(index.stream.blocks[1].payload.offset, 780);
  assert.equal(index.stream.blocks.at(-1).payload.offset + index.stream.blocks.at(-1).payload.bytes,
    mp3.length);
  for (const block of index.stream.blocks)
    assert.equal(sha256(mp3.subarray(block.payload.offset, block.payload.offset + block.payload.bytes)),
      block.payload.sha256);
  assert.equal(index.decode.codec, 'mp3');
  assert.equal(index.decode.sampleRateHz, 22050);
  assert.equal(index.decode.channels, 1);
  assert.equal(index.decode.mp3FramesRead, 1033);
  assert.equal(index.decode.decodedSamples, 595008);
  assert.equal(index.decode.decodedPcmSha256,
    'd582ad8dc7f9ec689d5f5d0eaf387e5b039281200f64c842095fb82a700ef87b');
  assert.equal(index.interpretation.emptyBlockSilenceInserted, false);
  assert.equal(index.interpretation.seekTrimApplied, false);
  assert.equal(index.interpretation.audioListeningAccepted, false);
  const check = spawnSync(process.execPath, [script, '--check'],
    {encoding: 'utf8', env: process.env});
  assert.equal(check.status, 0, check.stderr);
  assert.equal(JSON.parse(check.stdout).status, 'PASS');
  const overwrite = spawnSync(process.execPath, [script, '--write'],
    {encoding: 'utf8', env: process.env});
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /P057 output exists/u);
  assert.deepEqual(readFileSync(new URL('embedded-source-stream-v1.mp3', output)), mp3);
  assert.deepEqual(readFileSync(new URL('raw-index-v1.json', output)), indexBytes);
  assert.deepEqual(readFileSync(new URL('AUDIO_SOURCE_2026-09-27.md', output)), report);
});

test('P057 extractor rejects an unpinned source root before reading source bytes', () => {
  const rejected = spawnSync(process.execPath, [script, '--check'],
    {encoding: 'utf8', env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: '/tmp'}});
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /exact real G6–G8 source root required/u);
});
