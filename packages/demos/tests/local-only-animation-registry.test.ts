import assert from 'node:assert/strict';
import test from 'node:test';

import {registeredAnimationKeys} from '../src/animation-registry';
import {
  hasLocalOnlyAnimationModule,
  localOnlyAnimationModuleRegistration,
  registeredLocalOnlyAnimationKeys,
} from '../src/local-only-animation-registry';

test('local-only registry is physically absent from the bundled registry surface', () => {
  const sharedBundled = registeredAnimationKeys.filter((key) =>
    key.startsWith('shared-')
  );
  assert.deepEqual(sharedBundled, []);
  assert.equal(registeredLocalOnlyAnimationKeys.length, 354);
  for (const key of [
    'shared-geo001-l01-p001',
    'shared-nms002-l11-p030',
    'shared-dat001-l05-p040',
    'shared-alg001-l01-p055',
    'shared-alg001-l01-p049',
    'shared-nms002-l01-p043',
    'shared-alg001-l09-p005',
    'shared-alg001-l09-p023',
    'shared-alg001-l09-p003',
    'shared-alg001-l09-p006',
    'shared-alg001-l09-p007',
  ]) assert.equal(registeredLocalOnlyAnimationKeys.includes(key), true, key);
  for (const key of registeredLocalOnlyAnimationKeys) {
    assert.equal(key.startsWith('shared-'), true, key);
    assert.equal(hasLocalOnlyAnimationModule(key), true, key);
    const registration = localOnlyAnimationModuleRegistration(key);
    assert.equal(registration?.maturity, 'private-current-js');
    assert.equal(registration?.scope, 'private-engineering');
    assert.equal(registration?.deploymentScope, 'local-only');
    assert.equal(
      registration?.calibrationId,
      'g678-16-page-product-calibration-v1',
    );
    for (const digest of [
      registration?.freezeManifestSha256,
      registration?.moduleSha256,
      registration?.timelineSha256,
      registration?.runtimeSha256,
    ]) assert.match(digest ?? '', /^[a-f0-9]{64}$/u);
  }
});
