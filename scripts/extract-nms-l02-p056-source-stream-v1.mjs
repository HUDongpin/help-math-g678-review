#!/usr/bin/env node

import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';

const workbenchRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourcePath = path.join(sourceRoot, 'G6-G8-shared/NMS002/L2/TS/L2TS03.swf');
const outputPath = path.join(workbenchRoot,
  'migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3');
const sourceSha256 = 'a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be';
const payloadSha256 = '6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function readSource() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot,
    'exact real G6–G8 source root required');
  const root = fs.lstatSync(sourceRoot);
  assert.ok(root.isDirectory() && !root.isSymbolicLink(), 'source root must be a real directory');
  const before = fs.lstatSync(sourcePath, {bigint: true});
  assert.ok(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n);
  assert.equal(fs.realpathSync(sourcePath), sourcePath);
  const bytes = fs.readFileSync(sourcePath);
  const after = fs.lstatSync(sourcePath, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'mode', 'nlink']) {
    assert.equal(after[key], before[key], `source changed during read: ${key}`);
  }
  assert.equal(sha256(bytes), sourceSha256);
  return bytes;
}

export function extractP056SourceStream() {
  const audio = parseEmbeddedAudioPayloads(readSource());
  assert.deepEqual(audio.tagCounts,
    {DefineSound: 0, SoundStreamHead: 1, SoundStreamHead2: 0, SoundStreamBlock: 230});
  assert.equal(audio.soundStreams.length, 1);
  const stream = audio.soundStreams[0];
  assert.equal(stream.ownerDomainId, 'sprite-24');
  assert.equal(stream.head.format, 'mp3');
  assert.equal(stream.head.sampleRateHz, 22050);
  assert.equal(stream.head.channels, 1);
  assert.equal(stream.blocks[0].localFrame, 5);
  assert.equal(stream.blocks.at(-1).localFrame, 234);
  assert.equal(stream.totalBlockHeaderSampleCount, 422208);
  assert.equal(stream.payload.byteLength, 95290);
  assert.equal(stream.payload.sha256, payloadSha256);
  assert.equal(sha256(stream._payloadBytes), payloadSha256);
  return Buffer.from(stream._payloadBytes);
}

function main() {
  const mode = process.argv[2] ?? '--check';
  assert.ok(['--check', '--write'].includes(mode) && process.argv.length <= 3,
    'usage: node scripts/extract-nms-l02-p056-source-stream-v1.mjs [--check|--write]');
  const bytes = extractP056SourceStream();
  if (mode === '--write') fs.writeFileSync(outputPath, bytes, {flag: 'wx'});
  else assert.ok(fs.readFileSync(outputPath).equals(bytes), 'P056 extracted source stream drift');
  process.stdout.write(`${JSON.stringify({status: 'PASS', mode,
    output: path.relative(workbenchRoot, outputPath), bytes: bytes.length,
    sha256: sha256(bytes), audioAccepted: false})}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
