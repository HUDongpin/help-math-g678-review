#!/usr/bin/env node
/** Source-block and decoded-PCM audit. No Flash playback or audio acceptance is inferred. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, lstatSync, realpathSync, mkdirSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW03.swf';
export const PRIOR_AUDIT = '/Volumes/American Dream/hudongpin/g678-p003-audit.11qugt/source-audit.json';
const OUTPUT = path.join(ROOT, 'output/alg-l06-p003-audio-alignment-20260928/alignment-v2.json');
const SOURCE_SHA = 'c3d265b61aedccc48e679cbecfe6424a2a78f2a9cb5cfa2a33791fa124933766';
const AUDIT_SHA = '26d5e3a113fd0268d678b8831b70deedfa913c84beb017f3c2e1b7f1a71ec35f';
const FPS = 12, RATE = 22050, STOP = 719;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function ordinaryPhysical(file) {
  assert.equal(realpathSync(file), file, 'physical path required');
  const before = lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink(), 'ordinary file required');
  const bytes = readFileSync(file), after = lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mode', 'mtimeNs', 'nlink']) assert.equal(before[key], after[key]);
  return bytes;
}

export function sourceAlignment(sourceBytes, priorAuditBytes) {
  assert.equal(sha256(sourceBytes), SOURCE_SHA, 'source SWF changed');
  assert.equal(sha256(priorAuditBytes), AUDIT_SHA, 'prior source audit changed');
  const old = JSON.parse(priorAuditBytes.toString('utf8'));
  assert.equal(old.animationId, 'shared-alg001-l06-p003');
  assert.equal(old.source.sha256, SOURCE_SHA);
  const parsed = extractTerminalStream(sourceBytes, 'sprite-154');
  assert.deepEqual(parsed.heads.map(x => [x.domain, x.frame, x.hex]), [['sprite-154', 1, '0a2a2d078906']]);
  assert.deepEqual(parsed.actions.filter(x => x.domain === 'sprite-154').map(x => [x.frame, x.hex]), [[719, '0700']]);
  assert.deepEqual(parsed.blocks, old.embeddedStream.blocks, 'prior packet map differs from SWF');
  assert.equal(parsed.blocks.length, 637);
  const gaps = [];
  for (let frame = 41; frame <= STOP; frame++) {
    if (!parsed.blocks.some(block => block.frame === frame)) gaps.push(frame);
  }
  assert.deepEqual(gaps, Array.from({length: 42}, (_, i) => 502 + i));
  const limits = [[41, 501], [544, 719]];
  const runs = limits.map(([firstFrame, lastFrame], i) => {
    const blocks = parsed.blocks.filter(x => x.frame >= firstFrame && x.frame <= lastFrame);
    assert.deepEqual(blocks.map(x => x.frame), Array.from({length: lastFrame - firstFrame + 1}, (_, j) => firstFrame + j));
    let byteOffset = 0, sampleOffset = 0;
    const packetMap = blocks.map(block => {
      const row = {frame: block.frame, frameStartSeconds: (block.frame - 1) / FPS,
        declaredSamples: block.samples, seekSamplesRaw: block.seek, mp3Bytes: block.mp3Bytes,
        runSampleStart: sampleOffset, runSampleEnd: sampleOffset + block.samples,
        runByteStart: byteOffset, runByteEnd: byteOffset + block.mp3Bytes};
      byteOffset = row.runByteEnd; sampleOffset = row.runSampleEnd;
      return row;
    });
    assert.equal(byteOffset, old.embeddedStream.runs[i].mp3Bytes);
    assert.equal(sampleOffset, old.embeddedStream.runs[i].declaredSamples);
    return {id: `source-run-0${i + 1}`, firstFrame, lastBlockFrame: lastFrame,
      blockCount: blocks.length, mp3Bytes: byteOffset, declaredSamples: sampleOffset,
      firstBlockSeekSamplesRaw: blocks[0].seek, mp3Sha256: old.embeddedStream.runs[i].sha256,
      packets: packetMap};
  });
  assert.deepEqual(parsed.blocks.filter(x => x.mp3Bytes === 0), [
    {frame: 42, samples: 0, seek: 0, mp3Bytes: 0},
    {frame: 501, samples: 0, seek: -2276, mp3Bytes: 0},
  ]);
  const runBytes = [parsed.mp3.subarray(0, runs[0].mp3Bytes), parsed.mp3.subarray(runs[0].mp3Bytes)];
  assert.equal(runBytes[0].length + runBytes[1].length, parsed.mp3.length);
  for (let i = 0; i < 2; i++) assert.equal(sha256(runBytes[i]), runs[i].mp3Sha256);
  assert.equal(sha256(parsed.mp3), old.embeddedStream.allMp3.sha256);
  return {source: {path: SOURCE, bytes: sourceBytes.length, sha256: SOURCE_SHA},
    priorAudit: {path: PRIOR_AUDIT, bytes: priorAuditBytes.length, sha256: AUDIT_SHA},
    frameDomain: 'sprite-154', fps: FPS, sampleRate: RATE, mainStopFrame: STOP,
    streamHeadHex: parsed.heads[0].hex, fullMp3: {bytes: parsed.mp3.length, sha256: sha256(parsed.mp3)},
    absentBlockFrames: {first: 502, last: 543, count: gaps.length, durationSeconds: gaps.length / FPS},
    emptyBlocks: parsed.blocks.filter(x => x.mp3Bytes === 0), runs, runBytes, fullBytes: parsed.mp3};
}

export function candidateBoundaryMath(runs) {
  assert.equal(runs.length, 2);
  const aligned = runs.map(run => {
    const start = (run.firstFrame - 1) / FPS;
    const decodedDuration = run.declaredSamples / RATE;
    const firstSeek = run.firstBlockSeekSamplesRaw;
    assert(firstSeek >= 0 && firstSeek < run.declaredSamples);
    return {id: run.id, anchorSeconds: start, firstBlockSeekSamplesRaw: firstSeek,
      fullDecodedDurationSeconds: decodedDuration,
      candidateAvailableSamples: run.declaredSamples - firstSeek,
      candidateEndSeconds: start + (run.declaredSamples - firstSeek) / RATE};
  });
  const noBlockStart = (502 - 1) / FPS, secondStart = aligned[1].anchorSeconds;
  assert(aligned[0].candidateEndSeconds < noBlockStart);
  assert(secondStart - noBlockStart === 42 / FPS);
  const terminalSampleOffset = aligned[1].firstBlockSeekSamplesRaw + (STOP - runs[1].firstFrame) * RATE / FPS;
  return {frameAnchorPolicy: 'frame-start, sample-rate 1x, first-block seek applied; modern candidate only',
    runWindows: aligned,
    firstRunEndBeforeNoBlockStartSeconds: noBlockStart - aligned[0].candidateEndSeconds,
    candidateBetweenRunEndAndSecondStartSeconds: secondStart - aligned[0].candidateEndSeconds,
    concatenatedWithoutGapSecondStartSeconds: aligned[0].anchorSeconds + aligned[0].fullDecodedDurationSeconds,
    sourceSecondStartSeconds: secondStart,
    visualStopSeconds: (STOP - 1) / FPS,
    secondRunDecodedSampleAtVisualStop: terminalSampleOffset,
    firstWholeSampleAfterVisualStop: Math.ceil(terminalSampleOffset),
    secondRunWholeSamplesAfterVisualStop: runs[1].declaredSamples - Math.ceil(terminalSampleOffset),
    negativeSeek501: {samplesRaw: -2276, samplesInBlock: 0, mp3BytesInBlock: 0,
      interpretation: 'unknown; no audible stop or latency correction inferred'},
    noBlockAudibleSilenceProven: false};
}

function command(binary, args, input, maxBuffer = 8 * 1024 * 1024) {
  const result = spawnSync(binary, args, {input, maxBuffer, encoding: null});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${binary} failed: ${result.stderr?.toString('utf8').slice(0, 600)}`);
  return result.stdout;
}

function pcmDetails(bytes) {
  assert.equal(bytes.length % 4, 0);
  let first = null, last = null, peak = 0, nonzero = 0;
  for (let i = 0; i < bytes.length / 4; i++) {
    const value = bytes.readFloatLE(4 * i);
    assert(Number.isFinite(value));
    if (value !== 0) {first ??= i; last = i; nonzero++; peak = Math.max(peak, Math.abs(value));}
  }
  return {sampleCount: bytes.length / 4, pcmF32leSha256: sha256(bytes), firstNonzeroSample: first,
    lastNonzeroSample: last, nonzeroSamples: nonzero, trailingExactZeroSamples: last === null ? bytes.length / 4 : bytes.length / 4 - last - 1,
    peakAbsolute: peak};
}

export function decodedMeasurements(alignment, decoder = command) {
  const ffmpegVersion = decoder('ffmpeg', ['-version'], undefined).toString('utf8').split('\n')[0];
  assert(ffmpegVersion.startsWith('ffmpeg version '));
  const inputs = [...alignment.runBytes, alignment.fullBytes];
  const pcm = inputs.map(bytes => {
    return decoder('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'mp3', '-i', 'pipe:0',
      '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', '1', '-ar', String(RATE), 'pipe:1'], bytes);
  });
  const details = pcm.map(pcmDetails);
  assert.equal(details[0].sampleCount, alignment.runs[0].declaredSamples);
  assert.equal(details[1].sampleCount, alignment.runs[1].declaredSamples);
  assert.equal(details[2].sampleCount, details[0].sampleCount + details[1].sampleCount);
  const continuousPcmEqualsSeparateRuns = pcm[2].equals(Buffer.concat(pcm.slice(0, 2)));
  const boundary = candidateBoundaryMath(alignment.runs);
  const tail = pcm[1].subarray(boundary.firstWholeSampleAfterVisualStop * 4);
  return {ffmpegVersion, format: 'mono 22050 Hz little-endian float32 PCM',
    runs: details.slice(0, 2), concatenatedFullStream: details[2],
    continuousPcmEqualsSeparateRuns,
    secondRunWholeSampleTailAfterVisualStop: pcmDetails(tail),
    decoderScope: 'FFmpeg machine decode only; not browser PCM, original Flash behavior, or listening acceptance'};
}

export function publicReport(alignment, measurements) {
  const {runBytes, fullBytes, ...source} = alignment;
  return {schemaVersion: 1, kind: 'alg-l06-p003-source-audio-alignment-v2',
    status: 'source-locked-machine-audit-not-runtime-or-audio-acceptance', ...source,
    candidateBoundaryMath: candidateBoundaryMath(alignment.runs), decodedMeasurements: measurements,
    decisions: {twoRunsAreSourcePacketGroups: true, noBlockMeansNoNewEmbeddedPayloadOnly: true,
      negativeSeek501RuntimeMeaningKnown: false, hostSaTriggerKnown: false,
      oldHostAudibleSilenceEstablished: false, originalRuntimeAccepted: false,
      audioAccepted: false, currentJsRegistrationChanged: false,
      safeNextStep: 'Resolve packet seek/alignment and terminal handling against an independent original-host audio/visual trace before activating this candidate as official product audio.'}};
}

function main() {
  const mode = process.argv.slice(2);
  assert(mode.length === 1 && ['--write', '--check'].includes(mode[0]), 'usage: node script --write OR --check');
  const source = ordinaryPhysical(SOURCE), prior = ordinaryPhysical(PRIOR_AUDIT);
  const alignment = sourceAlignment(source, prior);
  const report = publicReport(alignment, decodedMeasurements(alignment));
  const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
  if (mode[0] === '--write') {
    mkdirSync(path.dirname(OUTPUT), {recursive: true});
    writeFileSync(OUTPUT, bytes, {flag: 'wx'});
  } else {
    assert(ordinaryPhysical(OUTPUT).equals(bytes), 'alignment receipt drifted');
  }
  process.stdout.write(JSON.stringify({mode: mode[0], path: OUTPUT, bytes: bytes.length, sha256: sha256(bytes)}) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
