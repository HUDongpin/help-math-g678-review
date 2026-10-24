#!/usr/bin/env node

import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';

const workbenchRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelativePath = 'G6-G8-shared/NMS002/L2/TS/L2TS04.swf';
const sourcePath = path.join(sourceRoot, sourceRelativePath);
const sourceSha256 = '9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa';
const payloadSha256 = 'c87ebf7d1117a616ebddd6b3530a7b19c50dfd885bc5e2734817657da026c2dc';
const outputDirectory = path.join(workbenchRoot, 'output/nms-l02-p057-audio-20260927');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function readPinnedSource() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot,
    'exact real G6–G8 source root required');
  const root = fs.lstatSync(sourceRoot);
  assert.ok(root.isDirectory() && !root.isSymbolicLink() && fs.realpathSync(sourceRoot) === sourceRoot,
    'source root must be a real directory');
  const before = fs.lstatSync(sourcePath, {bigint: true});
  assert.ok(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n);
  assert.equal(fs.realpathSync(sourcePath), sourcePath);
  const bytes = fs.readFileSync(sourcePath);
  const after = fs.lstatSync(sourcePath, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'mode', 'nlink'])
    assert.equal(after[key], before[key], `source changed during read: ${key}`);
  assert.equal(bytes.length, 137055);
  assert.equal(sha256(bytes), sourceSha256);
  return bytes;
}

function runTool(command, args, input) {
  const result = spawnSync(command, args, {input, maxBuffer: 16 * 1024 * 1024});
  assert.equal(result.error, undefined, `${command} unavailable: ${result.error?.message}`);
  assert.equal(result.status, 0, `${command} failed: ${result.stderr?.toString('utf8')}`);
  return result.stdout;
}

function verifyFullDecode(payload) {
  // Count frames so ffprobe consumes the entire pipe before spawnSync writes EOF.
  const probe = JSON.parse(runTool('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name,sample_rate,channels,nb_read_frames', '-of', 'json', 'pipe:0'], payload));
  assert.equal(probe.streams?.length, 1);
  assert.equal(probe.streams[0].codec_name, 'mp3');
  assert.equal(Number(probe.streams[0].sample_rate), 22050);
  assert.equal(probe.streams[0].channels, 1);
  const pcm = runTool('ffmpeg', ['-v', 'error', '-xerror', '-i', 'pipe:0', '-map', '0:a:0',
    '-f', 's16le', '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '22050', 'pipe:1'], payload);
  assert.equal(pcm.length % 2, 0);
  assert.equal(pcm.length / 2, 595008, 'decoded sample count drift');
  return {codec: 'mp3', sampleRateHz: 22050, channels: 1,
    mp3FramesRead: Number(probe.streams[0].nb_read_frames), sampleFormat: 'signed-16-bit-little-endian',
    decodedSamples: pcm.length / 2, decodedDurationSeconds: pcm.length / 2 / 22050,
    decodedPcmSha256: sha256(pcm), fullEofDecode: true};
}

export function extractP057SourceStream() {
  const sourceBytes = readPinnedSource();
  const parsed = parseEmbeddedAudioPayloads(sourceBytes);
  assert.deepEqual(parsed.tagCounts,
    {DefineSound: 0, SoundStreamHead: 1, SoundStreamHead2: 0, SoundStreamBlock: 324});
  assert.equal(parsed.soundStreams.length, 1);
  const stream = parsed.soundStreams[0];
  assert.equal(stream.ownerDomainId, 'sprite-66');
  assert.equal(stream.head.format, 'mp3');
  assert.equal(stream.head.sampleRateHz, 22050);
  assert.equal(stream.head.channels, 1);
  assert.equal(stream.head.nominalSamplesPerBlock, 1837);
  assert.equal(stream.head.mp3LatencySeek, 1673);
  assert.equal(stream.blockCount, 324);
  assert.equal(stream.blocksWithExplicitSampleCount, 324);
  assert.equal(stream.totalBlockHeaderSampleCount, 595008);
  assert.equal(stream.payload.byteLength, 134290);
  assert.equal(stream.payload.sha256, payloadSha256);
  for (const [index, block] of stream.blocks.entries()) {
    assert.equal(block.blockIndex, index + 1);
    assert.equal(block.localFrame, index + 5, 'source block frame gap or duplicate');
    assert.equal(block.payload.byteOffsetInStreamArchive + block.payload.byteLength,
      index + 1 < stream.blocks.length
        ? stream.blocks[index + 1].payload.byteOffsetInStreamArchive : stream.payload.byteLength);
  }
  assert.deepEqual(stream.blocks.filter(block => block.payload.byteLength === 0).map(block => block.localFrame), [6]);
  assert.equal(stream.blocks[0].codecWrapperHeader.mp3SeekSamples, 1673);
  const payload = Buffer.from(stream._payloadBytes);
  assert.equal(sha256(payload), payloadSha256);
  const decode = verifyFullDecode(payload);
  const blocks = stream.blocks.map(block => ({
    blockIndex: block.blockIndex,
    frame: block.localFrame,
    sourceTag: {
      globalOrdinal: block.globalTagOrdinal,
      ordinalInDomain: block.tagOrdinalInDomain,
      recordHeaderHex: block.swfTagRecordHeader.hex,
      bodyBytes: block.tagBodyBytes,
      bodySha256: block.tagBodySha256,
    },
    swfMp3HeaderHex: block.codecWrapperHeader.hex,
    declaredSamples: block.codecWrapperHeader.explicitSampleCount,
    seekSamples: block.codecWrapperHeader.mp3SeekSamples,
    payload: {offset: block.payload.byteOffsetInStreamArchive,
      bytes: block.payload.byteLength, sha256: block.payload.sha256},
  }));
  const index = {
    schema: 'nms-l02-p057-embedded-stream-raw-index-v1',
    status: 'source-bound-machine-extraction-only',
    source: {root: sourceRoot, relativePath: sourceRelativePath, bytes: sourceBytes.length,
      sha256: sourceSha256, signature: parsed.source.signature,
      declaredUncompressedBytes: parsed.source.declaredUncompressedBytes,
      uncompressedSha256: parsed.source.uncompressedSha256,
      rootFrameCount: parsed.source.rootFrameCount},
    parserVersion: parsed.parserVersion,
    tagCounts: parsed.tagCounts,
    stream: {ownerDomainId: stream.ownerDomainId, ownerDomainKind: stream.ownerDomainKind,
      frameDomain: 'sprite-66', blockFrameRange: {first: 5, last: 328, inclusive: true},
      blockCount: stream.blockCount, header: stream.head,
      declaredBlockSamples: stream.totalBlockHeaderSampleCount,
      payload: {file: 'embedded-source-stream-v1.mp3', bytes: payload.length, sha256: payloadSha256,
        assembly: 'source-order SoundStreamBlock MP3 payload concatenation without SWF four-byte block wrappers'},
      emptyPayloadFrames: [6], negativeSeekFrames: [], blocks},
    decode,
    interpretation: {headLatencySeekSamples: 1673, firstBlockSeekSamples: 1673,
      emptyBlockSilenceInserted: false, seekTrimApplied: false, blockReclockingApplied: false,
      originalRuntimeSynchronizationEstablished: false, audioListeningAccepted: false},
  };
  const report = `# P057 source stream extraction\n\n` +
    `Source: \`${sourceRelativePath}\`, ${sourceBytes.length} bytes, SHA-256 \`${sourceSha256}\`. ` +
    `The real AWS source root is pinned in \`raw-index-v1.json\`.\n\n` +
    `One MP3 stream belongs to sprite 66. Its 324 SoundStreamBlocks occupy local frames 5–328. ` +
    `The concatenated MP3 payload is ${payload.length} bytes, SHA-256 \`${payloadSha256}\`; ` +
    `the separate SWF block headers and each block's frame, sample count, signed seek, offset, and hash remain in the raw index.\n\n` +
    `FFprobe identifies MP3, 22,050 Hz, mono. FFmpeg decoded through EOF to ${decode.decodedSamples} mono samples ` +
    `(${decode.decodedDurationSeconds.toFixed(6)} s), PCM SHA-256 \`${decode.decodedPcmSha256}\`. ` +
    `The block-header sample-count sum is also ${stream.totalBlockHeaderSampleCount}.\n\n` +
    `The stream head and first block both record a 1,673-sample latency/seek value. ` +
    `The frame 6 block has an empty MP3 payload and zero declared samples; it is **not** treated as authored silence. ` +
    `Per-block seek values are preserved without trimming or reclocking. ` +
    `The exact legacy runtime synchronization, audible content, and listening acceptance remain unresolved. ` +
    `No Spanish audio was spliced into this extraction, and this artifact does not register a lesson.\n`;
  return {payload, index, report};
}

function main() {
  const mode = process.argv[2] ?? '--check';
  assert.ok(['--check', '--write'].includes(mode) && process.argv.length <= 3,
    'usage: node scripts/extract-nms-l02-p057-source-stream-v1.mjs [--check|--write]');
  const extracted = extractP057SourceStream();
  const outputs = [
    ['embedded-source-stream-v1.mp3', extracted.payload],
    ['raw-index-v1.json', Buffer.from(`${JSON.stringify(extracted.index, null, 2)}\n`)],
    ['AUDIO_SOURCE_2026-09-27.md', Buffer.from(extracted.report)],
  ];
  if (mode === '--write') {
    fs.mkdirSync(outputDirectory, {recursive: true});
    for (const [name] of outputs) assert.ok(!fs.existsSync(path.join(outputDirectory, name)),
      `P057 output exists: ${name}`);
    for (const [name, bytes] of outputs) fs.writeFileSync(path.join(outputDirectory, name), bytes, {flag: 'wx'});
  } else {
    for (const [name, bytes] of outputs)
      assert.ok(fs.readFileSync(path.join(outputDirectory, name)).equals(bytes), `P057 output drift: ${name}`);
  }
  process.stdout.write(`${JSON.stringify({status: 'PASS', mode,
    output: path.relative(workbenchRoot, outputDirectory), mp3Bytes: extracted.payload.length,
    mp3Sha256: payloadSha256, decodedSamples: extracted.index.decode.decodedSamples,
    audioAccepted: false})}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
