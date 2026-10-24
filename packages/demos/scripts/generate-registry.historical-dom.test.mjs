import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFile, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {
  buildRegistrySources,
  historicalDomTopLevelBindingMatches,
} from './generate-registry.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const FIXTURE_ROOT = path.join(
  ROOT, 'output/g678-nine-dom-generator-successor-20261001-v1/test-preparation',
);
const source = (relative) => path.join(ROOT, relative);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const EXPECTED_HISTORICAL = [53, 54, 56, 57, 58, 60, 61, 62, 64].map(
  (number) => `shared-nms002-l02-p${String(number).padStart(3, '0')}`,
);

test('current generator renders all four registry files byte-for-byte', async () => {
  const registry = JSON.parse(await readFile(
    source('packages/demos/private-current-js-registry.json'), 'utf8'));
  const localKeys = registry.calibrations
    .filter((row) => row.deploymentScope === 'local-only')
    .flatMap((row) => row.entries.map((entry) => entry.key));
  assert(localKeys.length > 0);
  assert.equal(new Set(localKeys).size, localKeys.length,
    'current local-only registry keys are unique');
  const sources = await buildRegistrySources();
  const renderedLocalKeys = [...sources.localOnly.matchAll(
    /^      '([^']+)': \(\) => import\(/gmu)].map((match) => match[1]);
  assert.deepEqual(renderedLocalKeys,
    [...localKeys].sort((left, right) => left.localeCompare(right)),
    'generated local-only loader keys equal the current registry');
  for (const [kind, relative] of [
    ['bundled', 'packages/demos/src/registry.generated.ts'],
    ['metadata', 'packages/demos/src/registry.metadata.generated.ts'],
    ['localOnly', 'packages/demos/src/registry.local-only.generated.ts'],
    ['localOnlyMetadata', 'packages/demos/src/registry.local-only.metadata.generated.ts'],
  ]) {
    const actual = await readFile(source(relative));
    assert.deepEqual(actual, Buffer.from(sources[kind]), `${relative} current bytes`);
  }
});

test('only the nine exact historical freeze forms admit top-level binding', async () => {
  const registry = JSON.parse(await readFile(
    source('packages/demos/private-current-js-registry.json'), 'utf8'));
  const historical = [];
  for (const calibration of registry.calibrations) {
    if (calibration.deploymentScope !== 'local-only') continue;
    const bytes = await readFile(source(calibration.freezeManifest));
    const freeze = JSON.parse(bytes);
    for (const entry of calibration.entries) {
      if (entry.artifacts?.kind !== 'maintained-dom-module-v1') continue;
      const page = freeze.selectedPages.find((row) => row.animationId === entry.key);
      assert(page, `selected page ${entry.key}`);
      if (JSON.stringify(page.runtime.rendererBinding) ===
          JSON.stringify(entry.artifacts)) continue;
      historical.push(entry.key);
      const binding = {bytes: bytes.length, sha256: sha(bytes)};
      assert.equal(binding.sha256, calibration.freezeManifestSha256);
      assert.deepEqual(freeze.entry, entry);
      assert.equal(historicalDomTopLevelBindingMatches(
        calibration, freeze, binding, page, entry), true, entry.key);

      const wrongTag = structuredClone(page);
      wrongTag.runtime.rendererBinding = 'unreviewed-string';
      assert.equal(historicalDomTopLevelBindingMatches(
        calibration, freeze, binding, wrongTag, entry), false,
      `wrong runtime tag ${entry.key}`);
      assert.equal(historicalDomTopLevelBindingMatches(
        calibration, freeze, {...binding, sha256: '0'.repeat(64)}, page, entry),
      false, `wrong freeze hash ${entry.key}`);
      const wrongEntry = {...entry, artifacts: {...entry.artifacts,
        module: {...entry.artifacts.module, sha256: '0'.repeat(64)}}};
      assert.equal(historicalDomTopLevelBindingMatches(
        calibration, freeze, binding, page, wrongEntry), false,
      `top-level entry drift ${entry.key}`);
      assert.equal(historicalDomTopLevelBindingMatches(
        calibration, {...freeze, selectedPages: [page, page]}, binding, page,
        entry), false, `extra page ${entry.key}`);
    }
  }
  assert.deepEqual(historical, EXPECTED_HISTORICAL);
});

test('real generator rejects registry, freeze, and artifact drift in an isolated fixture',
  async () => {
    await mkdir(FIXTURE_ROOT, {recursive: true});
    const fixture = await mkdtemp(path.join(FIXTURE_ROOT, 'fixture-'));
    const put = async (relative, bytes) => {
      const target = path.join(fixture, relative);
      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, bytes);
    };
    const copy = async (relative) => {
      const target = path.join(fixture, relative);
      await mkdir(path.dirname(target), {recursive: true});
      await copyFile(source(relative), target);
    };
    try {
      await copy('packages/demos/scripts/generate-registry.mjs');
      await copy('scripts/private-current-js-registry.mjs');
      await put('packages/demos/prototype-registry.json',
        JSON.stringify({schemaVersion: 1, entries: []}));
      const registry = JSON.parse(await readFile(
        source('packages/demos/private-current-js-registry.json'), 'utf8'));
      const calibration = registry.calibrations.find((row) =>
        row.calibrationId === 'g678-nms-l02-p053-source-directions-current-js-v1');
      assert(calibration && calibration.entries.length === 1);
      const frozenBytes = await readFile(source(calibration.freezeManifest));
      const entry = calibration.entries[0];
      for (const binding of Object.values(entry.artifacts)) {
        if (binding && typeof binding === 'object') await copy(binding.path);
      }
      const generated = await import(pathToFileURL(path.join(fixture,
        'packages/demos/scripts/generate-registry.mjs')).href);
      const writeCase = async (nextCalibration, nextFreezeBytes = frozenBytes) => {
        await put(nextCalibration.freezeManifest, nextFreezeBytes);
        await put('packages/demos/private-current-js-registry.json', JSON.stringify({
          schemaVersion: 2, registryScope: 'private-engineering',
          calibrations: [nextCalibration],
        }));
      };

      await writeCase(calibration);
      const positive = await generated.buildRegistrySources();
      assert.match(positive.localOnly, /shared-nms002-l02-p053/u);
      assert.doesNotMatch(positive.bundled, /shared-nms002-l02-p053/u);

      const mismatched = {...entry, artifacts: {...entry.artifacts,
        module: {...entry.artifacts.module, sha256: '0'.repeat(64)}}};
      await writeCase({...calibration, entries: [mismatched]});
      await assert.rejects(generated.buildRegistrySources(),
        /maintained DOM freeze binding drifted/u);
      await writeCase(calibration);

      const moduleFile = path.join(fixture, entry.artifacts.module.path);
      const original = await readFile(moduleFile);
      await writeFile(moduleFile, Buffer.concat([original, Buffer.from('\n')]));
      await assert.rejects(generated.buildRegistrySources(), /module bytes drifted/u);
      await writeFile(moduleFile, original);

      await writeCase({...calibration, freezeManifestSha256: '0'.repeat(64)});
      await assert.rejects(generated.buildRegistrySources(),
        /local-only freeze bytes drifted/u);

      const explicit = JSON.parse(frozenBytes);
      const explicitId = 'g678-nms-l02-p053-explicit-binding-fixture-v1';
      explicit.calibrationId = explicitId;
      explicit.selectedPages[0].runtime.rendererBinding = entry.artifacts;
      const explicitBytes = Buffer.from(JSON.stringify(explicit));
      await writeCase({...calibration, calibrationId: explicitId,
        freezeManifestBytes: explicitBytes.length,
        freezeManifestSha256: sha(explicitBytes)}, explicitBytes);
      const standard = await generated.buildRegistrySources();
      assert.match(standard.localOnly, /shared-nms002-l02-p053/u);
    } finally {
      await rm(fixture, {recursive: true, force: true});
    }
  });
