import assert from 'node:assert/strict';
import test from 'node:test';

import {auditP056SourceAudio, bestAlignedEnvelopeCorrelation} from './audit-nms-l02-p056-source-audio.mjs';

test('whole-envelope alignment reports the source offset', () => {
  const aligned = bestAlignedEnvelopeCorrelation([9, 1, 3, 2, 5, 8], [1, 3, 2, 5]);
  assert.equal(aligned.offsetWindows, 1);
  assert.ok(Math.abs(aligned.correlation - 1) < 1e-12);
});

test('P056 SWF and same-stem SA differ in length and fixed-offset envelope', t => {
  const sourceRoot = process.env.HELP_MATH_G678_SOURCE_ROOT;
  if (!sourceRoot) { t.skip('real G6–G8 source root required'); return; }
  const report = auditP056SourceAudio(sourceRoot);
  assert.equal(report.stream.blockCount, 230);
  assert.equal(report.stream.firstBlockFrame, 5);
  assert.equal(report.stream.lastBlockFrame, 234);
  assert.equal(report.stream.decodedSamples, 422208);
  assert.equal(report.sa.decodedSamplesAt22050, 269363);
  assert.ok(report.fullSaEnvelopeAlignment.correlation < 0.5);
});
