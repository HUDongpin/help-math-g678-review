import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {
  checkPrivateCurrentJsAdmissionRegistry,
  validateAdmissionBinding,
} from './check-private-current-js-admission-registry-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(await readFile(path.join(root,
  'packages/demos/private-current-js-registry.json'), 'utf8'));

async function fixture(calibrationId, key) {
  const calibration = registry.calibrations.find((item) =>
    item.calibrationId === calibrationId);
  assert.ok(calibration, `Missing fixture ${calibrationId}`);
  const freeze = JSON.parse(await readFile(path.join(root,
    calibration.freezeManifest), 'utf8'));
  const entry = key ? calibration.entries.find((item) => item.key === key) :
    calibration.entries[0];
  assert.ok(entry, `Missing registry entry ${key}`);
  return {calibration, freeze, entry};
}

function copy(value) {
  return structuredClone(value);
}

test('current private registry validates all physical pins and four generated files',
  async () => {
    const result = await checkPrivateCurrentJsAdmissionRegistry();
    assert.equal(result.outputs, 4);
    assert.ok(result.privateEntries >= 636);
  });

test('new static-frame string binding requires exact freeze entry and scenario',
  async () => {
    const {calibration, freeze, entry} = await fixture(
      'g678-nms-l02-p056-conditional-host-current-js-v1');
    assert.equal(validateAdmissionBinding(calibration, freeze, entry,
      'local-only').animationId, entry.key);

    const wrongHash = copy(entry);
    wrongHash.artifacts.module.sha256 = '0'.repeat(64);
    assert.throws(() => validateAdmissionBinding(calibration, freeze,
      wrongHash, 'local-only'), /entry\/freeze binding drifted/u);

    const wrongKey = copy(freeze);
    wrongKey.entry.key = 'shared-nms002-l02-p001';
    assert.throws(() => validateAdmissionBinding(calibration, wrongKey,
      entry, 'local-only'), /entry\/freeze binding drifted/u);

    const wrongScenario = copy(freeze);
    wrongScenario.selectedPages[0].runtime.scenario = 'source-quiz-seeded';
    assert.throws(() => validateAdmissionBinding(calibration, wrongScenario,
      entry, 'local-only'), /unsupported maintained DOM renderer identity/u);
  });

test('new quiz-state string binding requires quiz source and exact artifacts',
  async () => {
    const {calibration, freeze, entry} = await fixture(
      'g678-nms-l02-p064-source-quiz-current-js-v1');
    assert.equal(validateAdmissionBinding(calibration, freeze, entry,
      'local-only').runtime.rendererBinding, 'maintained-dom-quiz-state-v1');

    const wrongQuiz = copy(freeze);
    wrongQuiz.sourceQuiz.drawCount = 11;
    assert.throws(() => validateAdmissionBinding(calibration, wrongQuiz,
      entry, 'local-only'), /unsupported maintained DOM renderer identity/u);

    const wrongArtifact = copy(entry);
    wrongArtifact.artifacts.memberManifest.bytes += 1;
    assert.throws(() => validateAdmissionBinding(calibration, freeze,
      wrongArtifact, 'local-only'), /entry\/freeze binding drifted/u);
  });

test('legacy DOM object binding remains exact and does not need freeze.entry',
  async () => {
    const {calibration, freeze, entry} = await fixture(
      'g678-16-page-product-calibration-v1', 'shared-alg001-l11-p006');
    const selected = freeze.selectedPages.find((page) => page.animationId === entry.key);
    assert.equal(typeof selected.runtime.rendererBinding, 'object');
    assert.equal(freeze.entry, undefined);
    assert.equal(validateAdmissionBinding(calibration, freeze, entry,
      'local-only').animationId, entry.key);
    const wrong = copy(freeze);
    wrong.selectedPages.find((page) => page.animationId === entry.key)
      .runtime.rendererBinding.timeline.sha256 =
      '0'.repeat(64);
    assert.throws(() => validateAdmissionBinding(calibration, wrong,
      entry, 'local-only'), /legacy maintained DOM freeze binding drifted/u);
  });

test('canvas runtime and selected-page identity still fail closed', async () => {
  const {calibration, freeze, entry} = await fixture(
    'g678-nms-l02-p055-conditional-host-current-js-v1');
  assert.equal(validateAdmissionBinding(calibration, freeze, entry,
    'local-only').animationId, entry.key);
  const wrong = copy(freeze);
  wrong.selectedPages[0].runtime.canvasRenderer.sha256 = '0'.repeat(64);
  assert.throws(() => validateAdmissionBinding(calibration, wrong, entry,
    'local-only'), /canvas runtime freeze binding drifted/u);
  const duplicate = copy(freeze);
  duplicate.selectedPages.push(copy(duplicate.selectedPages[0]));
  assert.throws(() => validateAdmissionBinding(calibration, duplicate, entry,
    'local-only'), /selected page identity is not unique/u);
});
