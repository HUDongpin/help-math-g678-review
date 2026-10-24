import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {routes, planProductionDenials, scanProductionBundles}
  from './check-nms-l02-p064-product-v1.mjs';

test('production denial plan covers P064, preserved P062 and all source audio', () => {
  const plan = planProductionDenials();
  assert.equal(plan.routeCount, 425);
  assert.equal(plan.expectedCases, 1700);
  assert.equal(plan.p064SourceAudioRoutes, 350);
  assert.equal(plan.p064MalformedAudioRoutes, 4);
  assert.equal(plan.preservedHost, 'catalog/nms-l02-admission-v1/host-v13.json');
  const paths = routes().map(row => row.path);
  assert.equal(new Set(paths).size, paths.length);
  assert(paths.includes('/en/migration-status/g678-calibration/shared-nms002-l02-p064?seed=9713'));
  assert(paths.includes('/es/migration-status/g678-calibration/shared-nms002-l02-p064?seed=9714'));
  assert(paths.includes('/en/migration-status/g678-calibration/shared-nms002-l02-p062'));
  assert(paths.includes('/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/EA/1'));
  assert(paths.includes('/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/SA/35/D'));
  assert(plan.inputs.some(pin => pin.path ===
    'apps/web/lib/nms-l02-p064-product-host.production-stub.tsx'));
  assert(plan.inputs.some(pin => pin.path ===
    'apps/web/lib/nms-l02-p064-product-candidate.server.ts'));
  const source = JSON.parse(fs.readFileSync(new URL(
    '../migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json',
    import.meta.url), 'utf8'));
  assert(source.questions[0].frameDeltaPlacements.some(row =>
    row.rawText === 'What is the name for the shaded part of this fraction?'));
});

test('bundle scan finds candidate payload in compiled JavaScript only', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'p064-production-scan-'));
  try {
    const server = path.join(root, 'server');
    const staticDir = path.join(root, 'static');
    fs.mkdirSync(server);
    fs.mkdirSync(staticDir);
    fs.writeFileSync(path.join(server, 'page.js'), 'const safe = true;\n');
    fs.writeFileSync(path.join(staticDir, 'client.js'), 'const safe = true;\n');
    fs.writeFileSync(path.join(server, 'page.js.nft.json'),
      '{"files":["nms-l02-p064-product-candidate.server"]}\n');
    const clean = scanProductionBundles(root);
    assert.equal(clean.files, 2);
    assert.deepEqual(clean.matches, []);
    fs.writeFileSync(path.join(staticDir, 'client.js'), 'P064QuizCandidate');
    assert.deepEqual(scanProductionBundles(root).matches,
      [{path: 'static/client.js', marker: 'P064QuizCandidate'}]);
    fs.writeFileSync(path.join(server, 'page.js'),
      'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c');
    assert(scanProductionBundles(root).matches.some(row =>
      row.path === 'server/page.js' && row.marker ===
      'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'));
    fs.symlinkSync(path.join(server, 'page.js'), path.join(server, 'alias.js'));
    assert.throws(() => scanProductionBundles(root), /no symlink/u);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
