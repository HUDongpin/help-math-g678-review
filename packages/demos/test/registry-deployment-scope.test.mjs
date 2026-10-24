import assert from 'node:assert/strict';
import test from 'node:test';

import {
  renderLocalOnlyRegistrySource,
  renderLocalOnlyRegistryMetadataSource,
  renderRegistryMetadataSource,
  renderRegistrySource,
} from '../scripts/generate-registry.mjs';

test('generated registry physically separates bundled and local-only imports', () => {
  const entries = [
    {
      key: 'conversion-1-2',
      module: './modules/conversion-1-2',
      maturity: 'legacy-prototype',
      scope: 'prototype',
      deploymentScope: 'bundled',
    },
    {
      key: 'shared-nms002-l01-p001',
      module: './modules/shared-nms002-l01-p001',
      maturity: 'private-current-js',
      scope: 'private-engineering',
      deploymentScope: 'local-only',
      calibrationId: 'g678-16-page-product-calibration-v1',
    },
  ];
  const bundledSource = renderRegistrySource(entries);
  const metadataSource = renderRegistryMetadataSource(entries);
  const localSource = renderLocalOnlyRegistrySource(entries);
  const localMetadataSource = renderLocalOnlyRegistryMetadataSource(entries);

  assert.match(bundledSource, /conversion-1-2/u);
  assert.doesNotMatch(bundledSource, /shared-nms002-l01-p001/u);
  assert.doesNotMatch(bundledSource, /localOnlyAnimation/u);
  assert.match(metadataSource, /conversion-1-2/u);
  assert.doesNotMatch(metadataSource, /shared-nms002-l01-p001/u);
  assert.doesNotMatch(metadataSource, /\bimport\('/u);
  assert.match(localSource, /process\.env\.NODE_ENV === 'production'[\s\S]*?Object\.freeze\(\{\}\)/u);
  assert.match(localSource, /shared-nms002-l01-p001/u);
  assert.match(localSource, /deploymentScope: 'local-only'/u);
  assert.doesNotMatch(localSource, /conversion-1-2/u);
  assert.match(localMetadataSource, /shared-nms002-l01-p001/u);
  assert.doesNotMatch(localMetadataSource, /\bimport\('/u);
  assert.doesNotMatch(localMetadataSource, /conversion-1-2/u);
});
