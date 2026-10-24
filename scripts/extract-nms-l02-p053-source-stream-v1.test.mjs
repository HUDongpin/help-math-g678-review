import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

import {extractP053SourceStream} from './extract-nms-l02-p053-source-stream-v1.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(projectRoot, 'scripts/extract-nms-l02-p053-source-stream-v1.mjs');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('P053 source blocks preserve exact frame gaps, seek, sample, and byte intervals', () => {
  process.env.HELP_MATH_G678_SOURCE_ROOT = sourceRoot;
  const {mp3, rawIndex, rawIndexBytes, audit} = extractP053SourceStream();
  const blocks = rawIndex.stream.blocks;
  assert.equal(blocks.length, 619);
  assert.deepEqual(rawIndex.stream.missingFrameRanges, [{first: 303, last: 374, count: 72}]);
  assert.deepEqual(rawIndex.stream.emptyPayloadFrames, [5, 302]);
  assert.deepEqual(rawIndex.stream.negativeSeekFrames, [302]);
  assert.equal(blocks[0].spriteFrame, 4);
  assert.equal(blocks.at(-1).spriteFrame, 694);
  assert.equal(blocks[0].signedSeekSamples, 1673);
  assert.equal(blocks.find(block => block.spriteFrame === 302).signedSeekSamples, -1898);
  for (const [index, block] of blocks.entries()) {
    assert.equal(block.blockIndex, index + 1);
    assert.equal(digest(mp3.subarray(block.payload.offset, block.payload.offset + block.payload.bytes)),
      block.payload.sha256);
    assert.equal(block.cumulativeDeclaredSampleEndExclusive - block.cumulativeDeclaredSampleStart,
      block.declaredSamples);
    if (index) {
      assert.equal(block.payload.offset, blocks[index - 1].payload.offset + blocks[index - 1].payload.bytes);
      assert.equal(block.cumulativeDeclaredSampleStart,
        blocks[index - 1].cumulativeDeclaredSampleEndExclusive);
    }
  }
  assert.equal(blocks.at(-1).cumulativeDeclaredSampleEndExclusive, 1135296);
  assert.equal(blocks.at(-1).payload.offset + blocks.at(-1).payload.bytes, mp3.length);
  assert.equal(rawIndex.decode.decodedSamples, 1135296);
  assert.equal(rawIndex.decode.decodedPcmSha256,
    'df1dbec69ef5e95d71b036e1e8b923a66ed1a6c1db89bab9d24ec1d4c4f453b0');
  assert.equal(audit.externalFiles.rawIndex.sha256, digest(rawIndexBytes));
  assert.equal(audit.limits.audioListeningAccepted, false);
  assert.equal(rawIndex.interpretation.absentBlockSilenceInserted, false);
});

test('P053 output check is byte exact and write refuses overwrite', () => {
  const env = {...process.env, HELP_MATH_G678_SOURCE_ROOT: sourceRoot};
  const check = spawnSync(process.execPath, [script, '--check'], {env, encoding: 'utf8'});
  assert.equal(check.status, 0, check.stderr);
  assert.equal(JSON.parse(check.stdout).status, 'PASS');
  const external = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-stream-product-v1/sprite-187-source-stream-v1.mp3';
  const before = digest(fs.readFileSync(external));
  const overwrite = spawnSync(process.execPath, [script, '--write'], {env, encoding: 'utf8'});
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /external P053 stream output already exists/);
  assert.equal(digest(fs.readFileSync(external)), before);
});

test('P053 extraction rejects a noncanonical source root before file output', () => {
  const wrong = spawnSync(process.execPath, [script, '--check'],
    {env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: projectRoot}, encoding: 'utf8'});
  assert.notEqual(wrong.status, 0);
  assert.match(wrong.stderr, /exact real G6–G8 source root required/);
});
