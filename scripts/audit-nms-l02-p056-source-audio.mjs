#!/usr/bin/env node

import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstatSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';

const SOURCE_SWF = 'G6-G8-shared/NMS002/L2/TS/L2TS03.swf';
const SOURCE_SA = 'G6-G8-shared/NMS002/L2/SA/L2TS03.mp3';
const SWF_SHA256 = 'a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be';
const SA_SHA256 = '33b5c3c7e630cac092c25718e17a322c90a4a76f3aa31aa1167026847b14eb0a';
const SAMPLE_RATE = 22050;
const ENVELOPE_WINDOW_SAMPLES = 220;

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function decodeMono22050(mp3) {
  const result = spawnSync('ffmpeg', [
    '-v', 'error', '-f', 'mp3', '-i', 'pipe:0', '-f', 'f32le',
    '-ac', '1', '-ar', String(SAMPLE_RATE), 'pipe:1',
  ], {input: mp3, maxBuffer: 32 * 1024 * 1024});
  assert.equal(result.status, 0, result.stderr.toString());
  assert.equal(result.stdout.length % 4, 0);
  return new Float32Array(result.stdout.buffer, result.stdout.byteOffset, result.stdout.length / 4);
}

function rmsEnvelope(pcm) {
  const envelope = [];
  for (let start = 0; start + ENVELOPE_WINDOW_SAMPLES <= pcm.length; start += ENVELOPE_WINDOW_SAMPLES) {
    let sumSquares = 0;
    for (let index = start; index < start + ENVELOPE_WINDOW_SAMPLES; index++) {
      sumSquares += pcm[index] * pcm[index];
    }
    envelope.push(Math.sqrt(sumSquares / ENVELOPE_WINDOW_SAMPLES));
  }
  return envelope;
}

/** Full shorter-envelope alignment only; it is not a semantic audio comparison. */
export function bestAlignedEnvelopeCorrelation(longer, shorter) {
  assert.ok(shorter.length > 1 && longer.length >= shorter.length);
  const n = shorter.length;
  const sumY = shorter.reduce((sum, value) => sum + value, 0);
  const sumYY = shorter.reduce((sum, value) => sum + value * value, 0);
  let best = {correlation: -1, offsetWindows: 0};
  for (let offset = 0; offset <= longer.length - n; offset++) {
    let sumX = 0;
    let sumXX = 0;
    let sumXY = 0;
    for (let index = 0; index < n; index++) {
      const value = longer[offset + index];
      sumX += value;
      sumXX += value * value;
      sumXY += value * shorter[index];
    }
    const denominator = Math.sqrt((sumXX - sumX * sumX / n) * (sumYY - sumY * sumY / n));
    const correlation = denominator > 0 ? (sumXY - sumX * sumY / n) / denominator : 0;
    if (correlation > best.correlation) best = {correlation, offsetWindows: offset};
  }
  return best;
}

export function auditP056SourceAudio(sourceRoot) {
  const sourceStat = lstatSync(sourceRoot);
  assert.ok(sourceStat.isDirectory() && !sourceStat.isSymbolicLink(),
    'HELP_MATH_G678_SOURCE_ROOT must be a real directory');
  const swf = readFileSync(path.join(sourceRoot, SOURCE_SWF));
  const sa = readFileSync(path.join(sourceRoot, SOURCE_SA));
  assert.equal(sha256(swf), SWF_SHA256);
  assert.equal(sha256(sa), SA_SHA256);

  const audio = parseEmbeddedAudioPayloads(swf);
  assert.deepEqual(audio.tagCounts,
    {DefineSound: 0, SoundStreamHead: 1, SoundStreamHead2: 0, SoundStreamBlock: 230});
  assert.equal(audio.soundStreams.length, 1);
  const stream = audio.soundStreams[0];
  assert.equal(stream.ownerDomainId, 'sprite-24');
  assert.equal(stream.head.sampleRateHz, SAMPLE_RATE);
  assert.equal(stream.head.channels, 1);
  assert.equal(stream.head.format, 'mp3');
  assert.equal(stream.headLocalFrame, 1);
  assert.equal(stream.blockCount, 230);
  assert.equal(stream.totalBlockHeaderSampleCount, 422208);
  assert.equal(stream.payload.byteLength, 95290);
  assert.equal(stream.payload.sha256,
    '6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811');
  for (let index = 0; index < stream.blocks.length; index++) {
    assert.equal(stream.blocks[index].localFrame, index + 5);
  }

  const streamPcm = decodeMono22050(stream._payloadBytes);
  const saPcm = decodeMono22050(sa);
  assert.equal(streamPcm.length, 422208);
  assert.equal(saPcm.length, 269363);
  const aligned = bestAlignedEnvelopeCorrelation(rmsEnvelope(streamPcm), rmsEnvelope(saPcm));
  return {
    animationId: 'shared-nms002-l02-p056',
    sourceSwfSha256: SWF_SHA256,
    sourceSaSha256: SA_SHA256,
    stream: {
      ownerDomainId: stream.ownerDomainId,
      firstBlockFrame: stream.blocks[0].localFrame,
      lastBlockFrame: stream.blocks.at(-1).localFrame,
      blockCount: stream.blockCount,
      blockHeaderSamples: stream.totalBlockHeaderSampleCount,
      payloadSha256: stream.payload.sha256,
      decodedSamples: streamPcm.length,
      decodedSeconds: streamPcm.length / SAMPLE_RATE,
    },
    sa: {decodedSamplesAt22050: saPcm.length, decodedSecondsAt22050: saPcm.length / SAMPLE_RATE},
    fullSaEnvelopeAlignment: {
      method: '10ms RMS windows, Pearson correlation, all whole-SA offsets within SWF stream',
      correlation: aligned.correlation,
      offsetSeconds: aligned.offsetWindows * ENVELOPE_WINDOW_SAMPLES / SAMPLE_RATE,
    },
    acceptance: 'source-structural and machine comparison only; no content, language, listening, runtime synchronization, or replacement acceptance',
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const sourceRoot = process.env.HELP_MATH_G678_SOURCE_ROOT;
  if (!sourceRoot) throw new Error('HELP_MATH_G678_SOURCE_ROOT is required');
  process.stdout.write(`${JSON.stringify(auditP056SourceAudio(sourceRoot), null, 2)}\n`);
}
