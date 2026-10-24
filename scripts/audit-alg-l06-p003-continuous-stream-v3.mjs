#!/usr/bin/env node
/** P003 natural-stream candidate audit. It changes no product audio or acceptance state. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFileSync, lstatSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';
import {SOURCE, PRIOR_AUDIT, sourceAlignment} from './audit-alg-l06-p003-audio-alignment-v2.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const V2 = path.join(ROOT, 'output/alg-l06-p003-audio-alignment-20260928/alignment-v2.json');
const OUTPUT = path.join(ROOT, 'output/alg-l06-p003-audio-alignment-20260928/continuous-v3.json');
const V2_SHA = '2081b28f7a4f8a75c95421d1f6382ecae650f926d204c301c0282579f1db0e1a';
const FULL_MP3_SHA = '91ddead67e2e39640b4fe76493f9764959daba8dab40e0ac2036670103285111';
const FULL_PCM_SHA = '3325caeaeaa7cade3d2ce7fc561d7184d37988595c24231c1f6d029174ff48dc';
const RATE = 22050, FPS = 12, HEAD_AVERAGE = 1837, LATENCY = 1673;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function readPhysical(file) {
  assert.equal(realpathSync(file), file, 'physical file required');
  const before = lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink(), 'ordinary file required');
  const bytes = readFileSync(file), after = lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mode', 'mtimeNs', 'nlink']) assert.equal(before[key], after[key]);
  return bytes;
}

export function packetResiduals(alignment, stream) {
  assert.equal(stream.heads.length, 1, 'one stream head required');
  assert.deepEqual(stream.heads.map(x => [x.domain, x.frame, x.hex]), [['sprite-154', 1, '0a2a2d078906']]);
  assert.deepEqual(stream.actions.filter(x => x.domain === 'sprite-154').map(x => [x.frame, x.hex]), [[719, '0700']]);
  const head = Buffer.from(stream.heads[0].hex, 'hex');
  assert.equal(head.readUInt16LE(2), HEAD_AVERAGE);
  assert.equal(head.readInt16LE(4), LATENCY);
  assert.equal(alignment.runs.length, 2);
  const rows = alignment.runs.flatMap((run, runIndex) => run.packets.map(packet => {
    const cumulative = packet.runSampleStart + (runIndex === 0 ? 0 : alignment.runs[0].declaredSamples);
    const globalActualPlusRawSeek = cumulative + packet.seekSamplesRaw;
    return {frame: packet.frame, runId: run.id, cumulativeDeclaredSampleStart: cumulative,
      declaredSamples: packet.declaredSamples, rawSeekSamples: packet.seekSamplesRaw,
      mp3Bytes: packet.mp3Bytes, globalActualPlusRawSeek,
      residualToHeadAverageFromFrame41: globalActualPlusRawSeek - (packet.frame - 41) * HEAD_AVERAGE,
      residualToExactRateFromFrame41: globalActualPlusRawSeek - (packet.frame - 41) * RATE / FPS,
      runLocalActualPlusRawSeek: packet.runSampleStart + packet.seekSamplesRaw,
      residualToRunLocalHeadAverage: packet.runSampleStart + packet.seekSamplesRaw -
        (packet.frame - run.firstFrame) * HEAD_AVERAGE,
      residualToRunLocalExactRate: packet.runSampleStart + packet.seekSamplesRaw -
        (packet.frame - run.firstFrame) * RATE / FPS};
  }));
  assert.equal(rows.length, 637);
  const at = frame => rows.find(x => x.frame === frame);
  assert.equal(at(41).residualToHeadAverageFromFrame41, 1673);
  assert.equal(at(42).residualToHeadAverageFromFrame41, 1619);
  const firstNormal = rows.filter(x => x.frame >= 43 && x.frame <= 500);
  assert.equal(firstNormal.length, 458);
  assert(firstNormal.every(x => x.residualToHeadAverageFromFrame41 === -164));
  assert.equal(at(501).residualToHeadAverageFromFrame41, -2880);
  const second = rows.filter(x => x.frame >= 544);
  assert.equal(second.length, 176);
  assert(second.every(x => x.residualToHeadAverageFromFrame41 === -79076 &&
    x.residualToRunLocalHeadAverage === 519));
  return {headerAverageSamplesPerFrame: HEAD_AVERAGE, exactRateSamplesPerFrame: RATE / FPS,
    headerInitialLatencySamples: LATENCY, rows,
    groups: {firstSpecialFrame41: {rawSeek: at(41).rawSeekSamples, globalResidual: 1673},
      emptyFrame42: {rawSeek: at(42).rawSeekSamples, globalResidual: 1619},
      frames43Through500: {count: 458, globalHeadAverageResidual: -164,
        exactRateResidualFirst: at(43).residualToExactRateFromFrame41,
        exactRateResidualLast: at(500).residualToExactRateFromFrame41},
      emptyFrame501: {rawSeek: -2276, globalHeadAverageResidual: -2880,
        exceptionFromPriorNormalResidual: -2716, operationalSeekSupported: false},
      absentFrames502Through543: {count: 42, noNewEmbeddedPayload: true,
        audibleSilenceProven: false},
      frames544Through719: {count: 176, globalHeadAverageResidual: -79076,
        runLocalHeadAverageResidual: 519,
        exactRateLocalResidualFirst: at(544).residualToRunLocalExactRate,
        exactRateLocalResidualLast: at(719).residualToRunLocalExactRate,
        residualShiftFromFirstNormal: -78912,
        newPlaybackAnchorProven: false}}};
}

function decodeFullMp3(input) {
  const version = spawnSync('ffmpeg', ['-version'], {encoding: 'utf8'});
  assert.equal(version.status, 0);
  const ffmpegVersion = version.stdout.split('\n')[0];
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'mp3', '-i', 'pipe:0',
    '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', '1', '-ar', String(RATE), 'pipe:1'],
  {input, maxBuffer: 8 * 1024 * 1024});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr?.toString('utf8').slice(0, 600));
  assert.equal(result.stdout.length % 4, 0);
  return {ffmpegVersion, pcm: result.stdout};
}

function nonzeroWindow(pcm, start, end) {
  const count = pcm.length / 4;
  const a = Math.max(0, Math.min(count, Math.floor(start)));
  const b = Math.max(a, Math.min(count, Math.floor(end)));
  let nonzeroSamples = 0, peakAbsolute = 0;
  for (let i = a; i < b; i++) {
    const value = pcm.readFloatLE(i * 4);
    assert(Number.isFinite(value));
    if (value !== 0) {nonzeroSamples++; peakAbsolute = Math.max(peakAbsolute, Math.abs(value));}
  }
  return {firstSample: a, endSampleExclusive: b, availableSamples: b - a,
    nonzeroSamples, peakAbsolute};
}

export function continuousCoordinates(pcm, v2) {
  assert.equal(pcm.length / 4, 1168128);
  assert.equal(sha256(pcm), FULL_PCM_SHA);
  assert.equal(v2.decodedMeasurements.concatenatedFullStream.sampleCount, 1168128);
  assert.equal(v2.decodedMeasurements.concatenatedFullStream.pcmF32leSha256, FULL_PCM_SHA);
  assert.equal(v2.decodedMeasurements.continuousPcmEqualsSeparateRuns, true);
  const splitSample = v2.runs[0].declaredSamples;
  assert.equal(splitSample, 844416);
  const frames = [501, 502, 520, 531, 544, 719].map(frame => {
    const decodedSampleCoordinate = LATENCY + (frame - 41) * RATE / FPS;
    const frameWindow = nonzeroWindow(pcm, decodedSampleCoordinate,
      decodedSampleCoordinate + RATE / FPS);
    return {frame, frameStartSeconds: (frame - 1) / FPS,
      decodedSampleCoordinate, decodedSampleFloor: Math.floor(decodedSampleCoordinate),
      decodedSampleOffsetFromSourceSecondPacketGroup: decodedSampleCoordinate - splitSample,
      decodedSampleAvailableAtFrameStart: decodedSampleCoordinate < pcm.length / 4,
      frameWindow};
  });
  const stopSeconds = (719 - 1) / FPS;
  const decodedEndSeconds = (41 - 1) / FPS + ((pcm.length / 4) - LATENCY) / RATE;
  return {naturalPlaybackCandidate: {wholeMp3OneTransport: true, sourceFirstPacketFrame: 41,
      startAtFrameSeconds: 40 / FPS, skipInitialLatencySamples: LATENCY,
      noSyntheticSilenceAtNoBlockFrames: true, directArbitraryFrameSeekSupported: false,
      ReplayPolicy: 'restart whole source from initial latency, then use the modern host clock'},
    streamSplitSampleCoordinate: splitSample, frames,
    decodedEndSeconds, visualStopSeconds: stopSeconds,
    decodedEndBeforeVisualStopSeconds: stopSeconds - decodedEndSeconds,
    wholePcmFirstNonzeroSample: v2.decodedMeasurements.concatenatedFullStream.firstNonzeroSample,
    wholePcmLastNonzeroSample: v2.decodedMeasurements.concatenatedFullStream.lastNonzeroSample,
    terminalHasDecodedSample: false};
}

export function buildReport(sourceBytes, auditBytes, v2Bytes, decode = decodeFullMp3) {
  assert.equal(sha256(v2Bytes), V2_SHA, 'v2 historical receipt changed');
  const v2 = JSON.parse(v2Bytes.toString('utf8'));
  const alignment = sourceAlignment(sourceBytes, auditBytes);
  assert.equal(alignment.fullMp3.bytes, 263640);
  assert.equal(alignment.fullMp3.sha256, FULL_MP3_SHA);
  assert.equal(v2.source.sha256, alignment.source.sha256);
  assert.equal(v2.priorAudit.sha256, alignment.priorAudit.sha256);
  assert.deepEqual(v2.fullMp3, alignment.fullMp3);
  const stream = extractTerminalStream(sourceBytes, 'sprite-154');
  const residuals = packetResiduals(alignment, stream);
  const decoded = decode(alignment.fullBytes);
  const coordinates = continuousCoordinates(decoded.pcm, v2);
  return {schemaVersion: 1, kind: 'alg-l06-p003-continuous-stream-source-audit-v3',
    status: 'source-and-spec-informed-modern-candidate-not-original-runtime-or-audio-acceptance',
    inputs: {source: alignment.source, priorAudit: alignment.priorAudit,
      historicalV2: {path: V2, bytes: v2Bytes.length, sha256: V2_SHA}},
    specification: {title: 'Adobe SWF File Format Specification, version 19',
      url: 'https://open-flash.github.io/mirrors/swf-spec-19.pdf',
      section: 'Frame subdivision for streaming sound', pdfPageIndicesZeroBased: [186, 187],
      paraphrase: 'For continuous playback, the player concatenates MP3 frames and reads ahead. SeekSamples guides playback after a frame seek; initial encoder latency is added to later seek values. A SWF frame with no new block does not by itself establish an audible pause.',
      useBoundary: 'format mechanism only; not an observed trace of this original host'},
    sourceStream: {frameDomain: 'sprite-154', fps: FPS, sampleRate: RATE,
      singleHead: {frame: 1, hex: stream.heads[0].hex, averageSamplesPerFrame: HEAD_AVERAGE,
        initialLatencySamples: LATENCY},
      mainActions: stream.actions.filter(x => x.domain === 'sprite-154').map(x => ({frame: x.frame, hex: x.hex})),
      fullMp3: alignment.fullMp3, packetGroups: alignment.runs.map(({id, firstFrame, lastBlockFrame,
        blockCount, mp3Bytes, declaredSamples, mp3Sha256}) =>
        ({id, firstFrame, lastBlockFrame, blockCount, mp3Bytes, declaredSamples, mp3Sha256})),
      absentBlockFrames: alignment.absentBlockFrames},
    residuals, decode: {ffmpegVersion: decoded.ffmpegVersion,
      pcmFormat: 'mono 22050 Hz float32 little-endian', sampleCount: decoded.pcm.length / 4,
      pcmSha256: sha256(decoded.pcm), equalsV2SeparateRunConcatenation: true},
    continuousCoordinates: coordinates,
    capabilityBoundary: {naturalContinuousPlaybackCandidateSupported: true,
      frameSeekSamplesNeedSeparateSpecification: true,
      negativeSeek501OperationalMeaningResolved: false,
      frame544NewPlaybackAnchorEstablished: false,
      noBlockProvesAudibleSilence: false,
      originalRuntimeAccepted: false, audioAccepted: false, currentJsRegistrationChanged: false}};
}

function main() {
  const mode = process.argv.slice(2);
  assert(mode.length === 1 && ['--write', '--check'].includes(mode[0]), 'usage: node script --write|--check');
  const report = buildReport(readPhysical(SOURCE), readPhysical(PRIOR_AUDIT), readPhysical(V2));
  const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
  if (mode[0] === '--write') writeFileSync(OUTPUT, bytes, {flag: 'wx'});
  else assert(readPhysical(OUTPUT).equals(bytes), 'continuous v3 receipt drifted');
  process.stdout.write(JSON.stringify({mode: mode[0], path: OUTPUT, bytes: bytes.length, sha256: sha256(bytes)}) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
