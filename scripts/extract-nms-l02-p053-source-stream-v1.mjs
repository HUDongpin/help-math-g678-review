#!/usr/bin/env node

import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelativePath = 'G6-G8-shared/NMS002/L2/GS/L2GS02.swf';
const sourcePath = path.join(sourceRoot, sourceRelativePath);
const externalDirectory = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-stream-product-v1';
const auditDirectory = path.join(projectRoot, 'migrations/shared-nms002-l02-p053/audit');
const sourceSha256 = 'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf';
const payloadSha256 = '225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d';
const pcmSha256 = 'df1dbec69ef5e95d71b036e1e8b923a66ed1a6c1db89bab9d24ec1d4c4f453b0';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

function readPinnedSource() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot,
    'exact real G6–G8 source root required');
  const root = fs.lstatSync(sourceRoot);
  assert.ok(root.isDirectory() && !root.isSymbolicLink() && fs.realpathSync(sourceRoot) === sourceRoot,
    'source root must be a real directory');
  const before = fs.lstatSync(sourcePath, {bigint: true});
  assert.ok(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n,
    'source must be a regular unlinked file');
  assert.equal(fs.realpathSync(sourcePath), sourcePath);
  const bytes = fs.readFileSync(sourcePath);
  const after = fs.lstatSync(sourcePath, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'mode', 'nlink'])
    assert.equal(after[key], before[key], `source changed during read: ${key}`);
  assert.equal(bytes.length, 236774);
  assert.equal(sha256(bytes), sourceSha256);
  return bytes;
}

function runTool(command, args, input) {
  const result = spawnSync(command, args, {input, maxBuffer: 8 * 1024 * 1024});
  assert.equal(result.error, undefined, `${command} unavailable: ${result.error?.message}`);
  assert.equal(result.status, 0, `${command} failed: ${result.stderr?.toString('utf8')}`);
  assert.equal(result.stderr.length, 0, `${command} warned: ${result.stderr.toString('utf8')}`);
  return result.stdout;
}

function decodeToEof(mp3) {
  const probe = JSON.parse(runTool('ffprobe', ['-v', 'error', '-count_frames',
    '-select_streams', 'a:0', '-show_entries',
    'stream=codec_name,sample_rate,channels,nb_read_frames', '-of', 'json', 'pipe:0'], mp3));
  assert.equal(probe.streams?.length, 1);
  assert.equal(probe.streams[0].codec_name, 'mp3');
  assert.equal(Number(probe.streams[0].sample_rate), 22050);
  assert.equal(probe.streams[0].channels, 1);
  assert.equal(Number(probe.streams[0].nb_read_frames), 1971);
  const pcm = runTool('ffmpeg', ['-v', 'error', '-xerror', '-f', 'mp3', '-i', 'pipe:0',
    '-map', '0:a:0', '-f', 's16le', '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '22050', 'pipe:1'], mp3);
  assert.equal(pcm.length, 2270592);
  assert.equal(sha256(pcm), pcmSha256);
  return {method: 'ffprobe-count-frames-and-ffmpeg-full-eof-decode', codec: 'mp3',
    sampleRateHz: 22050, channels: 1, mp3FramesRead: 1971,
    sampleFormat: 'signed-16-bit-little-endian', decodedPcmBytes: pcm.length,
    decodedSamples: pcm.length / 2, decodedDurationSeconds: pcm.length / 2 / 22050,
    decodedPcmSha256: pcmSha256, fullEofDecode: true};
}

export function extractP053SourceStream() {
  const sourceBytes = readPinnedSource();
  const parsed = parseEmbeddedAudioPayloads(sourceBytes);
  assert.deepEqual(parsed.tagCounts,
    {DefineSound: 0, SoundStreamHead: 1, SoundStreamHead2: 0, SoundStreamBlock: 619});
  assert.equal(parsed.soundStreams.length, 1);
  const stream = parsed.soundStreams[0];
  assert.equal(stream.ownerDomainId, 'sprite-187');
  assert.equal(stream.headLocalFrame, 1);
  assert.equal(stream.head.tagCode, 18);
  assert.equal(stream.head.format, 'mp3');
  assert.equal(stream.head.sampleRateHz, 22050);
  assert.equal(stream.head.channels, 1);
  assert.equal(stream.head.nominalSamplesPerBlock, 1837);
  assert.equal(stream.head.mp3LatencySeek, 1673);
  assert.equal(stream.blockCount, 619);
  assert.equal(stream.blocksWithExplicitSampleCount, 619);
  assert.equal(stream.totalBlockHeaderSampleCount, 1135296);
  assert.equal(stream.payload.byteLength, 256230);
  assert.equal(stream.payload.sha256, payloadSha256);
  const mp3 = Buffer.from(stream._payloadBytes);
  assert.equal(sha256(mp3), payloadSha256);

  let declaredSampleCursor = 0;
  const blocks = stream.blocks.map((block, ordinal) => {
    assert.equal(block.blockIndex, ordinal + 1);
    assert.ok(block.localFrame >= 4 && block.localFrame <= 694);
    assert.ok(ordinal === 0 || block.localFrame > stream.blocks[ordinal - 1].localFrame,
      'duplicate or unordered source frame');
    const nextPayloadOffset = ordinal + 1 < stream.blocks.length
      ? stream.blocks[ordinal + 1].payload.byteOffsetInStreamArchive : mp3.length;
    assert.equal(block.payload.byteOffsetInStreamArchive + block.payload.byteLength, nextPayloadOffset,
      'non-contiguous source payload');
    const declaredSamples = block.codecWrapperHeader.explicitSampleCount;
    const sampleStart = declaredSampleCursor;
    declaredSampleCursor += declaredSamples;
    return {blockIndex: block.blockIndex, spriteFrame: block.localFrame,
      sourceTag: {globalOrdinal: block.globalTagOrdinal,
        ordinalInDomain: block.tagOrdinalInDomain,
        recordHeaderHex: block.swfTagRecordHeader.hex,
        bodyBytes: block.tagBodyBytes, bodySha256: block.tagBodySha256},
      swfMp3HeaderHex: block.codecWrapperHeader.hex, declaredSamples,
      signedSeekSamples: block.codecWrapperHeader.mp3SeekSamples,
      cumulativeDeclaredSampleStart: sampleStart,
      cumulativeDeclaredSampleEndExclusive: declaredSampleCursor,
      payload: {offset: block.payload.byteOffsetInStreamArchive,
        bytes: block.payload.byteLength, sha256: block.payload.sha256}};
  });
  assert.equal(blocks[0].spriteFrame, 4);
  assert.equal(blocks.at(-1).spriteFrame, 694);
  assert.equal(declaredSampleCursor, 1135296);
  const missingFrameRanges = [];
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].spriteFrame > blocks[i - 1].spriteFrame + 1)
      missingFrameRanges.push({first: blocks[i - 1].spriteFrame + 1,
        last: blocks[i].spriteFrame - 1,
        count: blocks[i].spriteFrame - blocks[i - 1].spriteFrame - 1});
  }
  assert.deepEqual(missingFrameRanges, [{first: 303, last: 374, count: 72}]);
  assert.deepEqual(blocks.filter(block => block.payload.bytes === 0).map(block => block.spriteFrame), [5, 302]);
  assert.deepEqual(blocks.filter(block => block.signedSeekSamples < 0).map(block => block.spriteFrame), [302]);
  assert.equal(blocks[0].signedSeekSamples, 1673);
  const sampleCountHistogram = Object.fromEntries([...new Set(blocks.map(block => block.declaredSamples))]
    .sort((a, b) => a - b).map(value => [value, blocks.filter(block => block.declaredSamples === value).length]));
  assert.deepEqual(sampleCountHistogram, {'0': 2, '1728': 499, '2304': 117, '3456': 1});
  const decode = decodeToEof(mp3);
  assert.equal(decode.decodedSamples, declaredSampleCursor);

  const rawIndex = {schema: 'nms-l02-p053-source-stream-raw-index-v1',
    animationId: 'shared-nms002-l02-p053', status: 'source-bound-machine-extraction-only',
    source: {root: sourceRoot, relativePath: sourceRelativePath, bytes: sourceBytes.length,
      sha256: sourceSha256, signature: parsed.source.signature,
      declaredUncompressedBytes: parsed.source.declaredUncompressedBytes,
      uncompressedSha256: parsed.source.uncompressedSha256,
      rootFrameCount: parsed.source.rootFrameCount},
    parserVersion: parsed.parserVersion, tagCounts: parsed.tagCounts,
    stream: {ownerDomainId: stream.ownerDomainId, ownerDomainKind: stream.ownerDomainKind,
      frameDomain: 'sprite-187', headFrame: stream.headLocalFrame, blockFrameRange: {first: 4, last: 694},
      blockCount: blocks.length, head: stream.head,
      declaredBlockSamples: declaredSampleCursor, sampleCountHistogram,
      missingFrameRanges, emptyPayloadFrames: [5, 302], negativeSeekFrames: [302],
      payload: {file: 'sprite-187-source-stream-v1.mp3', bytes: mp3.length, sha256: payloadSha256,
        assembly: 'source-order SoundStreamBlock MP3 payload concatenation without SWF four-byte block wrappers'},
      blocks},
    decode,
    interpretation: {headLatencySeekSamples: 1673, firstBlockSeekSamples: 1673,
      absentBlockSilenceInserted: false, emptyBlockSilenceInserted: false,
      seekTrimApplied: false, blockReclockingApplied: false,
      decodedDurationIsOriginalRuntimeDuration: false,
      originalRuntimeSynchronizationEstablished: false, audioListeningAccepted: false,
      spanishAudioSpliced: false}};
  const rawIndexBytes = json(rawIndex);
  const externalFiles = {mp3: {path: path.join(externalDirectory, 'sprite-187-source-stream-v1.mp3'),
    bytes: mp3.length, sha256: payloadSha256},
  rawIndex: {path: path.join(externalDirectory, 'raw-block-index-v1.json'),
    bytes: rawIndexBytes.length, sha256: sha256(rawIndexBytes)}};
  const audit = {schema: 'nms-l02-p053-source-stream-product-v1',
    animationId: 'shared-nms002-l02-p053', disposition: 'reusable-source-stream-candidate',
    source: rawIndex.source, stream: {frameDomain: 'sprite-187', headFrame: 1,
      firstBlockFrame: 4, lastBlockFrame: 694, blockCount: 619,
      declaredSamples: declaredSampleCursor, missingFrameRanges,
      emptyPayloadFrames: [5, 302], negativeSeekFrames: [302]},
    externalFiles, decode,
    limits: {sourceTagTimelineOnly: true, naturalRuntimeAudibilityResolved: false,
      headAndBlockSeekRetainedNotApplied: true, authoredSilenceInAbsentFramesEstablished: false,
      audioListeningAccepted: false, originalRuntimeAccepted: false,
      strictComplete: false, spanishAudioSpliced: false}};
  const report = `# P053 embedded source stream product candidate\n\n` +
    `The exact real AWS source is \`${sourceRelativePath}\` (${sourceBytes.length} bytes; SHA-256 \`${sourceSha256}\`). ` +
    `The source-order MP3 payload from sprite 187 contains ${blocks.length} SoundStreamBlock tags at frames 4–694. ` +
    `It is ${mp3.length} bytes, SHA-256 \`${payloadSha256}\`; the external raw index records each source tag, ` +
    `four-byte SWF wrapper, signed seek, declared sample count, cumulative sample interval, and payload offset/hash.\n\n` +
    `The stream head declares 22,050 Hz mono MP3, 1,837 nominal samples per block, and 1,673 latency/seek samples. ` +
    `There are no block tags in frames 303–374 (72 frames). Frames 5 and 302 have empty payloads and zero declared samples; ` +
    `frame 302 has a signed seek of -1,898. No silence was inserted, no seek trim was applied, and blocks were not reclocked.\n\n` +
    `FFprobe read ${decode.mp3FramesRead} MP3 frames. FFmpeg decoded the concatenation to EOF as ` +
    `${decode.decodedSamples} mono signed-16-bit samples (${decode.decodedDurationSeconds.toFixed(6)} seconds at 22,050 Hz), ` +
    `PCM SHA-256 \`${pcmSha256}\`. This equals the sum of the SWF block-header sample counts. ` +
    `The decoded duration is a file/decode property, not proven natural runtime duration. ` +
    `The structural block at frame 694 does not prove it is reached during natural playback; the audited frame-693 stop action requires runtime assessment.\n\n` +
    `The separate lesson-SA candidate was not mixed into this stream. Audible content, source synchronization, ` +
    `Spanish behavior, original-runtime fidelity, listening, and Owner acceptance remain unresolved. ` +
    `This extraction registers no page and changes no product runtime.\n`;
  return {mp3, rawIndex, rawIndexBytes, audit, report, externalFiles};
}

function readOrdinaryFile(file) {
  const stat = fs.lstatSync(file);
  assert.ok(stat.isFile() && !stat.isSymbolicLink() && fs.realpathSync(file) === file,
    `output is not an ordinary physical file: ${file}`);
  return fs.readFileSync(file);
}

function main() {
  const mode = process.argv[2] ?? '--check';
  assert.ok(['--check', '--write'].includes(mode) && process.argv.length <= 3,
    'usage: node scripts/extract-nms-l02-p053-source-stream-v1.mjs [--check|--write]');
  const result = extractP053SourceStream();
  const outputs = [
    [result.externalFiles.mp3.path, result.mp3],
    [result.externalFiles.rawIndex.path, result.rawIndexBytes],
    [path.join(auditDirectory, 'source-stream-product-v1.json'), json(result.audit)],
    [path.join(auditDirectory, 'source-stream-product-v1.md'), Buffer.from(result.report)],
  ];
  if (mode === '--write') {
    assert.ok(!fs.existsSync(externalDirectory), 'external P053 stream output already exists');
    for (const [file] of outputs) assert.ok(!fs.existsSync(file), `output already exists: ${file}`);
    fs.mkdirSync(externalDirectory);
    for (const [file, bytes] of outputs) fs.writeFileSync(file, bytes, {flag: 'wx'});
  } else {
    for (const [file, bytes] of outputs)
      assert.ok(readOrdinaryFile(file).equals(bytes), `P053 stream output drift: ${file}`);
  }
  process.stdout.write(`${JSON.stringify({status: 'PASS', mode, animationId: result.audit.animationId,
    mp3Bytes: result.mp3.length, mp3Sha256: payloadSha256,
    blockCount: result.rawIndex.stream.blockCount,
    decodedSamples: result.rawIndex.decode.decodedSamples,
    audioAccepted: false})}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
