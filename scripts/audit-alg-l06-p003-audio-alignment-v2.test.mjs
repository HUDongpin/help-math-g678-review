import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {SOURCE, PRIOR_AUDIT, sourceAlignment, candidateBoundaryMath, decodedMeasurements,
  publicReport} from './audit-alg-l06-p003-audio-alignment-v2.mjs';

const source = readFileSync(SOURCE), prior = readFileSync(PRIOR_AUDIT);

test('P003 real SWF independently matches every prior block and both exact MP3 packet groups', () => {
  const audit = sourceAlignment(source, prior);
  assert.equal(audit.runs[0].packets.length, 461);
  assert.equal(audit.runs[1].packets.length, 176);
  assert.deepEqual(audit.absentBlockFrames, {first: 502, last: 543, count: 42, durationSeconds: 3.5});
  assert.deepEqual(audit.emptyBlocks, [
    {frame: 42, samples: 0, seek: 0, mp3Bytes: 0},
    {frame: 501, samples: 0, seek: -2276, mp3Bytes: 0},
  ]);
  assert.deepEqual(audit.runs.map(run => [run.declaredSamples, run.mp3Bytes]),
    [[844416, 190580], [323712, 73060]]);
  assert.equal(audit.runs[0].packets.at(-1).runSampleEnd, 844416);
  assert.equal(audit.runs[1].packets[0].frame, 544);
});

test('source and prior-audit byte mutations fail closed before timing claims', () => {
  const changedSwf = Buffer.from(source); changedSwf[100] ^= 1;
  assert.throws(() => sourceAlignment(changedSwf, prior), /source SWF changed/);
  const changedPrior = Buffer.from(prior); changedPrior[100] ^= 1;
  assert.throws(() => sourceAlignment(source, changedPrior), /prior source audit changed/);
});

test('sample math keeps the absent-block window, negative seek and stop tail separate', () => {
  const audit = sourceAlignment(source, prior);
  const math = candidateBoundaryMath(audit.runs);
  assert.equal(math.sourceSecondStartSeconds, 543 / 12);
  assert.equal(math.visualStopSeconds, 718 / 12);
  assert(math.firstRunEndBeforeNoBlockStartSeconds > 0.19 && math.firstRunEndBeforeNoBlockStartSeconds < 0.2);
  assert(math.candidateBetweenRunEndAndSecondStartSeconds > 3.69);
  assert(math.concatenatedWithoutGapSecondStartSeconds < 42);
  assert.equal(math.secondRunDecodedSampleAtVisualStop, 322081.5);
  assert.equal(math.firstWholeSampleAfterVisualStop, 322082);
  assert.equal(math.secondRunWholeSamplesAfterVisualStop, 1630);
  assert.equal(math.negativeSeek501.interpretation.includes('unknown'), true);
  assert.equal(math.noBlockAudibleSilenceProven, false);
});

test('FFmpeg float PCM verifies full-stream continuity and an exact-zero candidate terminal tail', () => {
  const audit = sourceAlignment(source, prior);
  const decoded = decodedMeasurements(audit);
  assert.equal(decoded.continuousPcmEqualsSeparateRuns, true);
  assert.deepEqual(decoded.runs.map(run => run.sampleCount), [844416, 323712]);
  assert.equal(decoded.concatenatedFullStream.sampleCount, 1168128);
  assert(decoded.runs[0].nonzeroSamples > 0 && decoded.runs[1].nonzeroSamples > 0);
  assert.equal(decoded.secondRunWholeSampleTailAfterVisualStop.sampleCount, 1630);
  assert.equal(decoded.secondRunWholeSampleTailAfterVisualStop.nonzeroSamples, 0);
  assert.equal(decoded.secondRunWholeSampleTailAfterVisualStop.peakAbsolute, 0);
  const report = publicReport(audit, decoded);
  assert.equal(report.decisions.oldHostAudibleSilenceEstablished, false);
  assert.equal(report.decisions.audioAccepted, false);
});
