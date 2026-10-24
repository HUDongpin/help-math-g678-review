import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isG678LocalOnlyAnimationId,
  loadClientAnimationModule,
} from '../lib/load-animation-module.client';

test('client loader routes only canonical shared placement IDs to local-only registry', () => {
  assert.equal(isG678LocalOnlyAnimationId('shared-alg001-l06-p040'), true);
  assert.equal(isG678LocalOnlyAnimationId('course-g04-l03-in-002'), false);
  assert.equal(isG678LocalOnlyAnimationId('shared-alg001-l6-p040'), false);
  assert.equal(isG678LocalOnlyAnimationId('../shared-alg001-l06-p040'), false);
});

test('production client loader closes shared modules before importing local registry', async () => {
  const original = process.env.NODE_ENV;
  try {
    Reflect.set(process.env, 'NODE_ENV', 'production');
    assert.equal(
      await loadClientAnimationModule('shared-alg001-l06-p040'),
      undefined,
    );
  } finally {
    if (original === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV');
    else Reflect.set(process.env, 'NODE_ENV', original);
  }
});

test('development client loader resolves an actual registered shared module on demand', async () => {
  const original = process.env.NODE_ENV;
  try {
    Reflect.set(process.env, 'NODE_ENV', 'development');
    const animationModule = await loadClientAnimationModule(
      'shared-alg001-l06-p040',
    );
    assert.equal(animationModule?.key, 'shared-alg001-l06-p040');
    assert.equal(animationModule?.maturity, 'private-current-js');
  } finally {
    if (original === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV');
    else Reflect.set(process.env, 'NODE_ENV', original);
  }
});
