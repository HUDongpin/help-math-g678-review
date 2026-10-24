import assert from 'node:assert/strict';
import test from 'node:test';

import {
  renderLocalOnlyRegistryMetadataSource,
  renderLocalOnlyRegistrySource,
  renderRegistrySource,
} from '../scripts/generate-registry.mjs';

const dom = Object.freeze({key: 'shared-alg001-l11-p006',
  module: './modules/g678-alg-l11-interactive10-tranche-c-p006',
  maturity: 'private-current-js', scope: 'private-engineering',
  deploymentScope: 'local-only',
  calibrationId: 'g678-16-page-product-calibration-v1',
  freezeManifestSha256: 'f'.repeat(64), moduleSha256: 'a'.repeat(64),
  timelineSha256: 'b'.repeat(64),
  rendererBindingKind: 'maintained-dom-module-v1',
  memberManifestSha256: 'c'.repeat(64), sourceRunSha256: 'd'.repeat(64)});
const canvas = Object.freeze({...dom, key: 'shared-alg001-l11-p001',
  module: './modules/shared-alg001-l11-p001',
  rendererBindingKind: undefined, memberManifestSha256: undefined,
  sourceRunSha256: undefined, runtimeSha256: 'e'.repeat(64)});

test('local registry renders maintained DOM provenance without fake runtime', () => {
  for (const source of [renderLocalOnlyRegistrySource([dom]),
    renderLocalOnlyRegistryMetadataSource([dom])]) {
    assert.match(source, /rendererBindingKind: 'maintained-dom-module-v1'/u);
    assert.match(source, new RegExp(`memberManifestSha256: '${'c'.repeat(64)}'`,
      'u'));
    assert.match(source, new RegExp(`sourceRunSha256: '${'d'.repeat(64)}'`,
      'u'));
    assert.doesNotMatch(source, /runtimeSha256: 'undefined'/u);
    assert.doesNotMatch(source, /runtimeSha256:/u);
  }
  const types = renderRegistrySource([dom]);
  assert.match(types,
    /readonly rendererBindingKind\?: 'maintained-dom-module-v1'/u);
  assert.match(types, /readonly memberManifestSha256\?: string/u);
  assert.match(types, /readonly sourceRunSha256\?: string/u);
});

test('existing external canvas metadata remains untagged and exact', () => {
  for (const source of [renderLocalOnlyRegistrySource([canvas]),
    renderLocalOnlyRegistryMetadataSource([canvas])]) {
    assert.match(source, new RegExp(`runtimeSha256: '${'e'.repeat(64)}'`, 'u'));
    assert.doesNotMatch(source, /rendererBindingKind:/u);
    assert.doesNotMatch(source, /memberManifestSha256:/u);
    assert.doesNotMatch(source, /sourceRunSha256:/u);
  }
});
