import assert from 'node:assert/strict';
import test from 'node:test';

const keys = ['NODE_ENV', 'VERCEL', 'VERCEL_ENV', 'HELP_MATH_G678_COMPILED_LOCAL_QA',
  'HELP_MATH_G678_LOCAL_PREVIEW', 'HELP_MATH_G678_LOCAL_PREVIEW_BIND'] as const;
let serial = 0;
async function withConfigEnvironment<T>(values: Record<string, string | undefined>, callback: () => Promise<T>) {
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) {
      if (values[key] === undefined) delete process.env[key];
      else process.env[key] = values[key];
    }
    return await callback();
  } finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
}
const production = {NODE_ENV: 'production', HELP_MATH_G678_LOCAL_PREVIEW: '1',
  HELP_MATH_G678_LOCAL_PREVIEW_BIND: '127.0.0.1'};
const loadConfig = async () => (await import(`../next.config.ts?compiledQaCase=${++serial}`)).default;

class Replacement {
  constructor(readonly resource: RegExp, readonly replacement: string) {}
}

test('default production still stubs private registries and emits closed compile constant', async () => {
  await withConfigEnvironment(production, async () => {
    const config = await loadConfig();
    assert.equal(config.env.HELP_MATH_G678_COMPILED_LOCAL_QA, '0');
    assert.notEqual(config.distDir, '.next-g678-compiled-local-qa');
    const webpack = config.webpack({plugins: [], resolve: {}}, {dev: false, isServer: false,
      webpack: {NormalModuleReplacementPlugin: Replacement}});
    const target = webpack.resolve.alias['@helpmath/demos/local-only-animation-registry'];
    assert.ok(target.endsWith('/lib/g678-local-only-registry.production-stub.ts'));
    assert.ok(webpack.plugins.some((item: Replacement) => item.resource.test('@helpmath/demos/local-only-animation-registry')));
    assert.equal(config.turbopack.resolveAlias['@helpmath/demos/local-only-animation-registry'], target);
  });
});

test('compiled QA is isolated, bounded in workers, and has no development lazy backend', async () => {
  await withConfigEnvironment({...production, HELP_MATH_G678_COMPILED_LOCAL_QA: '1'}, async () => {
    const config = await loadConfig();
    assert.equal(config.distDir, '.next-g678-compiled-local-qa');
    assert.equal(config.env.HELP_MATH_G678_COMPILED_LOCAL_QA, '1');
    assert.equal(config.experimental.cpus, 1);
    assert.equal(config.experimental.webpackMemoryOptimizations, true);
    assert.equal(config.experimental.webpackBuildWorker, true);
    assert.equal(config.experimental.parallelServerCompiles, false);
    assert.equal(config.experimental.parallelServerBuildTraces, false);
    assert.equal(config.experimental.preloadEntriesOnStart, false);
    const webpack = config.webpack({plugins: [], resolve: {}}, {dev: false, isServer: false,
      webpack: {NormalModuleReplacementPlugin: Replacement}});
    assert.equal(webpack.cache, false);
    assert.equal(webpack.experiments?.lazyCompilation, undefined);
    assert.equal(webpack.resolve.alias['@helpmath/demos/local-only-animation-registry'], undefined);
    assert.equal(config.turbopack.resolveAlias['@helpmath/demos/local-only-animation-registry'], undefined);
    assert.ok(!webpack.plugins.some((item: Replacement) => item.resource.test('@helpmath/demos/local-only-animation-registry')));
    for (const page of ['004', '047', '051']) {
      const module = `packages/demos/src/modules/shared-nms002-l07-p${page}.tsx`;
      assert.ok(!webpack.plugins.some((item: Replacement) => item.resource.test(module)), module);
    }
    // This profile deliberately does not widen legacy candidate page adapters.
    assert.ok(webpack.plugins.some((item: Replacement) => item.resource.test('@/components/g678-alg-l07-current-host-lesson-v1')));
    assert.notEqual(config.typescript?.ignoreBuildErrors, true);
  });
});

test('cloud, non-loopback and incomplete compiled QA configuration fail before build/start', async () => {
  for (const override of [{VERCEL: '1'}, {VERCEL_ENV: 'preview'}, {VERCEL_ENV: 'production'},
    {HELP_MATH_G678_LOCAL_PREVIEW_BIND: '0.0.0.0'}, {HELP_MATH_G678_LOCAL_PREVIEW: undefined}]) {
    await withConfigEnvironment({...production, HELP_MATH_G678_COMPILED_LOCAL_QA: '1', ...override}, async () => {
      await assert.rejects(loadConfig, /G678_COMPILED_QA_REQUIRES_PRODUCTION_LOOPBACK_NON_CLOUD_OPT_IN/);
    });
  }
});
