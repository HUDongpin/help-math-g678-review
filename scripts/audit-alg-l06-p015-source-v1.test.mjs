import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {auditP015Source} from './audit-alg-l06-p015-source-v1.mjs';

const base = 'migrations/shared-alg001-l06-p015/audit/source-v1/';

test('P015 source audit regenerates exact public extraction and stays source-only', () => {
  const outputs = auditP015Source();
  assert.equal(outputs.size, 7);
  for (const [name, bytes] of outputs)
    assert(readFileSync(base + name).equals(bytes), `source artifact drift: ${name}`);
  const report = JSON.parse(outputs.get('source-audit-v1.json'));
  const binary = JSON.parse(outputs.get('binary-boundary-v1.json'));
  const composition = JSON.parse(outputs.get('source-composition-v1.json'));
  const scripts = JSON.parse(outputs.get('public-tool-scripts-v1.json'));
  assert.equal(report.source.sha256,
    'd0f395f5410353733b42ae29198caa86fae6b6eebd0e2a71830a203d969868b1');
  assert.deepEqual(binary.domains.map(domain => [domain.domain, domain.declaredFrames,
    domain.observedShowFrames]), [['root', 10, 10], ['sprite-270', 914, 914]]);
  assert.equal(binary.actions.length, 2);
  assert.equal(binary.buttons.length, 6);
  assert.equal(binary.morphs.length, 10);
  assert.equal(binary.streams.filter(stream => stream.code === 19).length, 879);
  assert.deepEqual(binary.trailers, []);
  assert.equal(binary.xmlReconciliation.everyBinaryTagKindAndCountMatched, true);
  assert.deepEqual(composition.masks.map(mask => [mask.frame, mask.characterId]),
    [[164, 31], [271, 31], [350, 31], [732, 260], [778, 263], [873, 267]]);
  assert.deepEqual(composition.buttons.map(button => button.characterId),
    [36, 37, 38, 45, 46, 47]);
  assert.deepEqual(composition.buttonActionBindings.map(binding => binding.key),
    ['Function', 'Value', 'Relation', 'Rule', 'Input', 'Output']);
  assert(composition.buttonActionBindings.every(binding =>
    binding.hostCall === '_root.DoHyperLinks()' && binding.mainPlaybackEffect === 'stop'));
  assert.equal(scripts.files.length, 8);
  assert(Object.values(report.capabilityBoundary).filter(Boolean).length === 2);
  assert.equal(report.capabilityBoundary.originalRuntimeObserved, false);
  assert.equal(report.capabilityBoundary.lessonPublished, false);
});
