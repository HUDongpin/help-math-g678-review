import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {FORBIDDEN_BUNDLE_MARKERS, planProductionDenials, routes,
  scanProductionBundles} from './check-nms-l02-p054-product-production-v2.mjs';

test('P054 production plan is immutable and covers page, resource and retained routes', () => {
  const output = 'output/nms-l02-p054-product-20260928/production/plan-test-sentinel.json';
  assert.equal(fs.existsSync(new URL(`../${output}`, import.meta.url)), false);
  const plan = planProductionDenials();
  assert.equal(plan.routeCount, 480);
  assert.equal(plan.expectedCases, 1920);
  assert.equal(plan.p054RevealRoutes, 24);
  assert.equal(plan.p054FeedbackRoutes, 2);
  assert.equal(plan.p064AndPredecessorRoutes, 425);
  assert.equal(plan.writesPerformed, false);
  assert.equal(fs.existsSync(new URL(`../${output}`, import.meta.url)), false);
  const paths = routes().map(row => row.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const locale of ['en', 'es']) for (const query of ['', '?level=1', '?level=2',
    '?level=0', '?level=3', '?level=1&level=2', '?frame=2']) {
    assert(paths.includes(`/${locale}/migration-status/g678-calibration/shared-nms002-l02-p054${query}`));
  }
  for (const level of [1, 2]) for (let order = 1; order <= 12; order++) {
    assert(paths.includes(`/flash-assets/g678-local/shared-nms002-l02-p054/reveal/${level}/${order}`));
  }
  assert(paths.includes('/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/correct?sha256=d34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4'));
  assert(paths.includes('/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/wrong?sha256=2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77'));
  assert(paths.includes('/en/migration-status/g678-calibration/shared-nms002-l02-p064?seed=9713'));
  assert(paths.some(item => item.startsWith(
    '/migration-assets/nms-l02-p062/sprite-315.mp3?sha256=')));
  assert(plan.inputs.some(pin => pin.path === 'apps/web/lib/nms-l02-p054-product-candidate.server.ts'));
  assert(plan.inputs.some(pin => pin.path === 'apps/web/lib/nms-l02-p054-product-host.production-stub.tsx'));
  assert.equal(plan.inputs.length, new Set(plan.inputs.map(pin => pin.path)).size);
});

test('compiled JS scan rejects board, card math, reader and SWF identity leaks', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'p054-production-scan-'));
  try {
    const server = path.join(root, 'server');
    const staticDir = path.join(root, 'static');
    fs.mkdirSync(server);
    fs.mkdirSync(staticDir);
    fs.writeFileSync(path.join(server, 'page.js'), 'const productionStub = true;\n');
    fs.writeFileSync(path.join(staticDir, 'client.js'), 'const productionStub = true;\n');
    fs.writeFileSync(path.join(server, 'page.js.nft.json'),
      '{"files":["nms-l02-p054-product-candidate.server","Mc1_1"]}\n');
    assert.deepEqual(scanProductionBundles(root).matches, []);
    for (const marker of FORBIDDEN_BUNDLE_MARKERS) {
      fs.writeFileSync(path.join(staticDir, 'client.js'), marker);
      assert.deepEqual(scanProductionBundles(root).matches,
        [{path: 'static/client.js', marker}]);
    }
    fs.symlinkSync(path.join(server, 'page.js'), path.join(server, 'alias.js'));
    assert.throws(() => scanProductionBundles(root), /no symlink/u);
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
});

test('forbidden markers are grounded in the P054 product source', () => {
  const root = new URL('../', import.meta.url);
  const cards = fs.readFileSync(new URL('packages/demos/src/generated/nms-l02-p054-cards-v1.ts', root), 'utf8');
  const board = fs.readFileSync(new URL('packages/demos/src/nms-l02-p054-product-board-v1.tsx', root), 'utf8');
  const reader = fs.readFileSync(new URL('apps/web/lib/nms-l02-p054-product-candidate.server.ts', root), 'utf8');
  assert(cards.includes('Mc1_1') && cards.includes('"6"') && cards.includes('"8"'));
  assert(cards.includes('P054_CARDS') && cards.includes('P054_CARD_SOURCE'));
  assert(board.includes('P054ProductBoardV1'));
  assert(reader.includes('P054_PRODUCT_CANDIDATE:'));
});
