import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';
import {SOURCE, PRIOR_AUDIT, sourceAlignment} from './audit-alg-l06-p003-audio-alignment-v2.mjs';
import {V2, packetResiduals, buildReport} from './audit-alg-l06-p003-continuous-stream-v3.mjs';

const swf = readFileSync(SOURCE), prior = readFileSync(PRIOR_AUDIT), v2 = readFileSync(V2);

test('one head and a 1837-sample authored average explain normal packet residuals exactly', () => {
  const alignment = sourceAlignment(swf, prior);
  const stream = extractTerminalStream(swf, 'sprite-154');
  const result = packetResiduals(alignment, stream);
  const group = result.groups;
  assert.equal(result.headerInitialLatencySamples, 1673);
  assert.equal(result.exactRateSamplesPerFrame, 1837.5);
  assert.deepEqual(group.frames43Through500, {count: 458, globalHeadAverageResidual: -164,
    exactRateResidualFirst: -165, exactRateResidualLast: -393.5});
  assert.deepEqual(group.emptyFrame501, {rawSeek: -2276, globalHeadAverageResidual: -2880,
    exceptionFromPriorNormalResidual: -2716, operationalSeekSupported: false});
  assert.deepEqual(group.frames544Through719, {count: 176, globalHeadAverageResidual: -79076,
    runLocalHeadAverageResidual: 519, exactRateLocalResidualFirst: 519,
    exactRateLocalResidualLast: 431.5, residualShiftFromFirstNormal: -78912,
    newPlaybackAnchorProven: false});
  assert.equal(result.rows.length, 637);
  assert.equal(result.rows.find(x => x.frame === 544).cumulativeDeclaredSampleStart, 844416);
});

test('tampered SWF, prior audit or historical v2 never produces a v3 conclusion', () => {
  const badSwf = Buffer.from(swf); badSwf[100] ^= 1;
  assert.throws(() => buildReport(badSwf, prior, v2), /source SWF changed/);
  const badPrior = Buffer.from(prior); badPrior[100] ^= 1;
  assert.throws(() => buildReport(swf, badPrior, v2), /prior source audit changed/);
  const badV2 = Buffer.from(v2); badV2[100] ^= 1;
  assert.throws(() => buildReport(swf, prior, badV2), /v2 historical receipt changed/);
});

test('whole-stream decoded candidate does not synthesize silence or authorize frame seeks', () => {
  const report = buildReport(swf, prior, v2);
  assert.equal(report.decode.sampleCount, 1168128);
  assert.equal(report.decode.equalsV2SeparateRunConcatenation, true);
  assert.equal(report.sourceStream.singleHead.averageSamplesPerFrame, 1837);
  assert.equal(report.sourceStream.mainActions.length, 1);
  assert.deepEqual(report.sourceStream.mainActions[0], {frame: 719, hex: '0700'});
  const c = report.continuousCoordinates;
  assert.equal(c.naturalPlaybackCandidate.wholeMp3OneTransport, true);
  assert.equal(c.naturalPlaybackCandidate.directArbitraryFrameSeekSupported, false);
  assert.equal(c.naturalPlaybackCandidate.noSyntheticSilenceAtNoBlockFrames, true);
  assert(c.decodedEndBeforeVisualStopSeconds > 3.59 && c.decodedEndBeforeVisualStopSeconds < 3.61);
  const frames = Object.fromEntries(c.frames.map(x => [x.frame, x]));
  assert.equal(frames[501].decodedSampleCoordinate, 846923);
  assert.equal(frames[502].decodedSampleCoordinate, 848760.5);
  assert.equal(frames[520].decodedSampleCoordinate, 881835.5);
  assert.equal(frames[531].decodedSampleCoordinate, 902048);
  assert.equal(frames[544].decodedSampleCoordinate, 925935.5);
  assert.equal(frames[719].decodedSampleCoordinate, 1247498);
  assert.equal(frames[501].frameWindow.nonzeroSamples, 0);
  assert.equal(frames[502].frameWindow.nonzeroSamples, 0);
  for (const frame of [520, 531, 544]) assert(frames[frame].frameWindow.nonzeroSamples > 0);
  assert.equal(frames[719].decodedSampleAvailableAtFrameStart, false);
  assert.equal(frames[719].frameWindow.availableSamples, 0);
  assert.equal(report.capabilityBoundary.noBlockProvesAudibleSilence, false);
  assert.equal(report.capabilityBoundary.originalRuntimeAccepted, false);
  assert.equal(report.capabilityBoundary.audioAccepted, false);
  assert(report.specification.paraphrase.split(/\s+/u).length < 150);
});
