import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {
  assertProvisional377PrewriteRegistryWitness,
  fq01CandidateArtifactsMatchCanonical,
  parseArguments,
  requiresFq01FinalAdmission,
  synchronizePrivateCurrentJsCalibration,
  validateFragment,
} from './upsert-private-current-js-calibration.mjs';
import {prepareG678AlgL11Remaining23Provisional377Registration} from
  './finalize-g678-alg-l11-remaining23-provisional377-registration.mjs';
import {upsertPrivateCurrentJsCalibration} from
  './private-current-js-registry.mjs';
import {assertCurrentFinal354LiveRegistry} from
  './check-g678-current-final354-admission.mjs';
import {g678Provisional377LocalPreviewAdmission} from
  './run-g678-provisional377-local-preview.mjs';

const final354RegistryWitness = await readFile(new URL(
  '../catalog/product-bridge-calibrations/' +
    'g678-final354-private-current-js-registry-witness-v1.json',
  import.meta.url));

test('FQ01 final admission is semantic and cannot be skipped by aliases, scope, or copied freezes', () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
    '..');
  const calibration = {calibrationId: 'g678-16-page-product-calibration-v1',
    deploymentScope: 'local-only'};
  for (const fragmentSpelling of [
    'catalog/product-bridge-calibrations/g678-current-js-216-page-registration-v1.fragment.json',
    './catalog/product-bridge-calibrations/g678-current-js-216-page-registration-v1.fragment.json',
    'work/copied-final-fragment.json',
  ]) {
    void fragmentSpelling;
    assert.equal(requiresFq01FinalAdmission({normalizedRoot: projectRoot,
      calibration}), true);
  }
  assert.equal(requiresFq01FinalAdmission({normalizedRoot: projectRoot,
    calibration: {...calibration, deploymentScope: 'bundled'}}), true);
  assert.equal(requiresFq01FinalAdmission({normalizedRoot: projectRoot,
    calibration: {...calibration, calibrationId: 'other'}}), false);
  const canonicalFragment = Buffer.from('{"scope":"local-only"}\n');
  const canonicalFreeze = Buffer.from('{"selectedPages":216}\n');
  assert.equal(fq01CandidateArtifactsMatchCanonical({
    candidateFragmentBytes: Buffer.from(canonicalFragment),
    canonicalFragmentBytes: canonicalFragment,
    candidateFreezeBytes: Buffer.from(canonicalFreeze),
    canonicalFreezeBytes: canonicalFreeze,
  }), true);
  assert.equal(fq01CandidateArtifactsMatchCanonical({
    candidateFragmentBytes: Buffer.from('{"scope":"bundled"}\n'),
    canonicalFragmentBytes: canonicalFragment,
    candidateFreezeBytes: canonicalFreeze,
    canonicalFreezeBytes: canonicalFreeze,
  }), false);
  assert.equal(fq01CandidateArtifactsMatchCanonical({
    candidateFragmentBytes: canonicalFragment,
    canonicalFragmentBytes: canonicalFragment,
    candidateFreezeBytes: Buffer.from('{"selectedPages":215}\n'),
    canonicalFreezeBytes: canonicalFreeze,
  }), false);
});

test('provisional354 and successor-aware current final354 use separate exact admissions', async () => {
  const source = await readFile(new URL(
    './upsert-private-current-js-calibration.mjs', import.meta.url), 'utf8');
  assert.match(source, /placementCount === 354/u);
  assert.match(source, /finalizeAlgL11Tranche1Registration\(\{check: true,/u);
  assert.match(source,
    /G678_ALG_L11_TRANCHE1_PROVISIONAL_FRAGMENT/u);
  assert.match(source,
    /G678_ALG_L11_TRANCHE1_PROVISIONAL_FREEZE/u);
  assert.match(source, /checkG678CurrentFinal354Admission\(\{/u);
  assert.doesNotMatch(source,
    /finalizeG678AlgL11Tranche1FamilyRegistration/u);
  assert.match(source, /G678_ALG_L11_TRANCHE1_FINAL_FRAGMENT/u);
  assert.match(source, /G678_ALG_L11_TRANCHE1_FINAL_FREEZE/u);
  assert.match(source,
    /placementCount === 342 \|\|\s*placementCount === 354/u);
});

test('provisional377 has an exact separate admission and maintained DOM provenance union', async (t) => {
  const source = await readFile(new URL(
    './upsert-private-current-js-calibration.mjs', import.meta.url), 'utf8');
  assert.match(source, /placementCount === 377/u);
  assert.match(source,
    /finalizeG678AlgL11Remaining23Provisional377Registration\(\{check: true\}\)/u);
  assert.match(source, /G678_ALG_L11_REMAINING23_PROVISIONAL_FRAGMENT/u);
  assert.match(source, /G678_ALG_L11_REMAINING23_PROVISIONAL_FREEZE/u);

  const root = await mkdtemp(path.join(os.tmpdir(), 'help-dom-union-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const animationId = 'shared-alg001-l11-p006';
  const calibrationId = 'g678-current-js-377-page-registration-v1';
  const paths = {
    freeze: 'catalog/product-bridge-calibrations/dom-freeze.json',
    module: 'work/tranche/run/generated/modules/page.tsx',
    timeline: 'work/tranche/run/generated/timelines/page.ts',
    memberManifest: 'work/tranche/run/members/page/member-manifest.json',
    sourceRun: 'work/tranche/run/run-manifest.json',
  };
  const contents = {
    module: Buffer.from('export default function Page(){return null;}\n'),
    timeline: Buffer.from('export const timeline = Object.freeze({});\n'),
    memberManifest: Buffer.from('{"member":"p006"}\n'),
    sourceRun: Buffer.from('{"run":"interactive10"}\n'),
  };
  const binding = (key) => ({
    path: paths[key],
    bytes: contents[key].length,
    sha256: createHash('sha256').update(contents[key]).digest('hex'),
  });
  const artifacts = {
    kind: 'maintained-dom-module-v1',
    module: binding('module'),
    timeline: binding('timeline'),
    memberManifest: binding('memberManifest'),
    sourceRun: binding('sourceRun'),
  };
  const calibration = {
    calibrationId,
    deploymentScope: 'local-only',
    freezeManifest: paths.freeze,
    entries: [{
      key: animationId,
      module: './modules/shared-alg001-l11-p006',
      maturity: 'private-current-js',
      complexityLane: 'interactive-understood',
      artifacts,
    }],
  };
  const freeze = {
    schemaVersion: 1,
    calibrationId,
    deploymentScope: 'local-only',
    selectedPages: [{
      animationId,
      complexityLane: 'interactive-understood',
      runtime: {rendererBinding: artifacts},
    }],
  };
  for (const [key, bytes] of Object.entries(contents)) {
    const absolutePath = path.join(root, paths[key]);
    await mkdir(path.dirname(absolutePath), {recursive: true});
    await writeFile(absolutePath, bytes);
  }
  await mkdir(path.dirname(path.join(root, paths.freeze)), {recursive: true});
  await writeFile(path.join(root, paths.freeze), `${JSON.stringify(freeze)}\n`);

  const validated = await validateFragment(root, calibration);
  assert.deepEqual(validated.entryArtifacts.get(animationId), artifacts);
  const copied = structuredClone(calibration);
  copied.entries[0].artifacts.timeline.path = paths.module;
  await assert.rejects(validateFragment(root, copied),
    /maintained DOM freeze binding drifted/u);
  const crossed = structuredClone(calibration);
  delete crossed.entries[0].artifacts.kind;
  crossed.entries[0].module = './modules/copied-page';
  await assert.rejects(validateFragment(root, crossed),
    /canonical animation key or exact maintained DOM binding/u);
});

test('provisional377 requires live final354 registry only for the write transition', () => {
  assert.equal(assertProvisional377PrewriteRegistryWitness({check: false,
    liveRegistryBytes: final354RegistryWitness,
    witnessBytes: final354RegistryWitness}), true);
  const wrongLive = Buffer.from(final354RegistryWitness);
  wrongLive[100] ^= 1;
  assert.throws(() => assertProvisional377PrewriteRegistryWitness({
    check: false, liveRegistryBytes: wrongLive,
    witnessBytes: final354RegistryWitness}),
  /live registry is not the exact final354 witness precondition/u);
  const copiedWitness = Buffer.concat([final354RegistryWitness,
    Buffer.from('\n')]);
  assert.throws(() => assertProvisional377PrewriteRegistryWitness({
    check: false, liveRegistryBytes: copiedWitness,
    witnessBytes: copiedWitness}),
  /live registry is not the exact final354 witness precondition/u);
  assert.equal(assertProvisional377PrewriteRegistryWitness({check: true,
    liveRegistryBytes: wrongLive, witnessBytes: copiedWitness}), true);
});

test('prepared377 simulates exact witness to semantic upsert and launcher-check boundary', async () => {
  const prepared =
    await prepareG678AlgL11Remaining23Provisional377Registration();
  const witnessDocument = JSON.parse(final354RegistryWitness.toString('utf8'));
  const predecessor = witnessDocument.calibrations.find((candidate) =>
    candidate.calibrationId === prepared.fragment.calibration.calibrationId);
  assert.ok(predecessor);
  const predecessorEntries = new Map(predecessor.entries.map((entry) =>
    [entry.key, entry]));
  const calibration = {...prepared.fragment.calibration,
    freezeManifestBytes: prepared.freezeBytes.length,
    freezeManifestSha256: createHash('sha256')
      .update(prepared.freezeBytes).digest('hex'),
    entries: prepared.fragment.calibration.entries.map((entry) => ({...entry,
      artifacts: entry.artifacts ?? predecessorEntries.get(entry.key)?.artifacts,
    }))};
  assert.equal(calibration.entries.every((entry) => entry.artifacts), true);
  const updated = upsertPrivateCurrentJsCalibration(witnessDocument,
    calibration);
  const installed = updated.calibrations.find((candidate) =>
    candidate.calibrationId === calibration.calibrationId);
  assert.equal(installed.entries.length, 377);
  assert.equal(installed.entries.filter((entry) =>
    entry.artifacts.kind === 'maintained-dom-module-v1').length, 23);
  assert.equal(installed.entries.filter((entry) =>
    entry.artifacts.runtime).length, 354);
  const updatedBytes = Buffer.from(`${JSON.stringify(updated, null, 2)}\n`);
  assert.equal(assertProvisional377PrewriteRegistryWitness({check: true,
    liveRegistryBytes: updatedBytes,
    witnessBytes: final354RegistryWitness}), true);
  assert.throws(() => assertCurrentFinal354LiveRegistry({
    liveRegistryBytes: updatedBytes,
    witnessBytes: final354RegistryWitness}),
  /live registry is not the immutable witness/u);
  assert.deepEqual(g678Provisional377LocalPreviewAdmission(), {
    fragment:
      'catalog/product-bridge-calibrations/g678-current-js-377-page-registration-v1.fragment.json',
    phase: 'alg-l11-remaining23-provisional-browser-qa',
    provisionalBrowserQa: true,
  });
});

async function fixture({wrapped = false} = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'help-private-registry-'));
  const calibrationId = 'g678-16-page-product-calibration-v1';
  const animationId = 'shared-nms002-l01-p001';
  const freezePath =
    `catalog/product-bridge-calibrations/${calibrationId}.json`;
  const fragmentPath = 'work/calibration-fragment.json';
  const registryPath = 'packages/demos/private-current-js-registry.json';
  const modulePath = `packages/demos/src/modules/${animationId}.tsx`;
  const timelinePath = `packages/demos/src/timelines/${animationId}.ts`;
  const runtimePath =
    `work/g678-shared-page-factory/run/members/${animationId}/canvas-renderer.js`;
  for (const relativePath of [
    freezePath,
    fragmentPath,
    registryPath,
    modulePath,
    timelinePath,
    runtimePath,
  ]) {
    await mkdir(path.dirname(path.join(root, relativePath)), {recursive: true});
  }
  const calibration = {
    calibrationId,
    deploymentScope: 'local-only',
    freezeManifest: freezePath,
    entries: [{
      key: animationId,
      module: `./modules/${animationId}`,
      maturity: 'private-current-js',
      complexityLane: 'low',
    }],
  };
  const moduleBytes = Buffer.from('export default {};\n');
  const timelineBytes = Buffer.from('export const timeline = {};\n');
  const runtimeBytes = Buffer.from('globalThis.fixture = true;\n');
  const runtimeSha256 = createHash('sha256').update(runtimeBytes).digest('hex');
  const freezeBytes = Buffer.from(`${JSON.stringify({
    schemaVersion: 1,
    calibrationId,
    deploymentScope: 'local-only',
    selectedPages: [{
      animationId,
      complexityLane: 'low',
      runtime: {
        canvasRenderer: {
          path: runtimePath,
          bytes: runtimeBytes.length,
          sha256: runtimeSha256,
        },
      },
    }],
  })}\n`);
  const fragment = wrapped
    ? {
        schemaVersion: 1,
        artifactType: 'private-current-js-calibration-fragment-v1',
        calibration,
        freeze: {
          path: freezePath,
          bytes: freezeBytes.length,
          sha256: createHash('sha256').update(freezeBytes).digest('hex'),
        },
      }
    : calibration;
  await Promise.all([
    writeFile(path.join(root, freezePath), freezeBytes),
    writeFile(path.join(root, fragmentPath), `${JSON.stringify(fragment)}\n`),
    writeFile(path.join(root, registryPath), `${JSON.stringify({
      schemaVersion: 2,
      registryScope: 'private-engineering',
      calibrations: [],
    })}\n`),
    writeFile(path.join(root, modulePath), moduleBytes),
    writeFile(path.join(root, timelinePath), timelineBytes),
    writeFile(path.join(root, runtimePath), runtimeBytes),
  ]);
  return {
    root,
    calibrationId,
    fragmentPath,
    freezePath,
    registryPath,
    timelinePath,
  };
}

test('private registry CLI atomically upserts and then checks a frozen local calibration', async (t) => {
  const value = await fixture();
  t.after(() => rm(value.root, {recursive: true, force: true}));
  const written = await synchronizePrivateCurrentJsCalibration({
    calibrationPath: value.fragmentPath,
    check: false,
    registryPath: value.registryPath,
    root: value.root,
  });
  assert.equal(written.mode, 'write');
  assert.equal(written.deploymentScope, 'local-only');
  const registry = JSON.parse(await readFile(
    path.join(value.root, value.registryPath),
    'utf8',
  ));
  assert.equal(registry.calibrations[0].calibrationId, value.calibrationId);
  assert.equal(registry.calibrations[0].deploymentScope, 'local-only');
  assert.equal(
    registry.calibrations[0].freezeManifestSha256,
    written.freezeSha256,
  );
  assert.equal(
    registry.calibrations[0].entries[0].artifacts.runtime.path,
    `work/g678-shared-page-factory/run/members/` +
      `shared-nms002-l01-p001/canvas-renderer.js`,
  );
  const checked = await synchronizePrivateCurrentJsCalibration({
    calibrationPath: value.fragmentPath,
    check: true,
    registryPath: value.registryPath,
    root: value.root,
  });
  assert.equal(checked.mode, 'check');
});

test('private registry CLI accepts a generator fragment with an exact freeze binding', async (t) => {
  const value = await fixture({wrapped: true});
  t.after(() => rm(value.root, {recursive: true, force: true}));
  const written = await synchronizePrivateCurrentJsCalibration({
    calibrationPath: value.fragmentPath,
    check: false,
    registryPath: value.registryPath,
    root: value.root,
  });
  assert.equal(written.calibrationId, value.calibrationId);
  assert.equal(written.entries, 1);
});

test('private registry check detects post-registration artifact drift', async (t) => {
  const value = await fixture({wrapped: true});
  t.after(() => rm(value.root, {recursive: true, force: true}));
  await synchronizePrivateCurrentJsCalibration({
    calibrationPath: value.fragmentPath,
    check: false,
    registryPath: value.registryPath,
    root: value.root,
  });
  await writeFile(
    path.join(value.root, value.timelinePath),
    'export const timeline = {drifted: true};\n',
  );
  await assert.rejects(
    synchronizePrivateCurrentJsCalibration({
      calibrationPath: value.fragmentPath,
      check: true,
      registryPath: value.registryPath,
      root: value.root,
    }),
    /registry is stale or absent/u,
  );
});

test('private registry CLI requires an explicit mode and fragment', () => {
  assert.throws(() => parseArguments([]), /choose exactly one/u);
  assert.throws(() => parseArguments(['--check']), /--calibration is required/u);
  assert.equal(parseArguments([
    '--calibration',
    'work/fragment.json',
    '--check',
  ]).check, true);
  assert.equal(parseArguments([
    '--calibration', 'work/fragment.json', '--write',
    '--provisional-browser-qa',
  ]).provisionalBrowserQa, true);
  assert.equal(parseArguments([
    '--calibration', 'work/fragment.json', '--check',
    '--provisional-browser-qa',
  ]).provisionalBrowserQa, true);
});

test('local-only registry CLI requires the same scope in the freeze', async (t) => {
  const value = await fixture();
  t.after(() => rm(value.root, {recursive: true, force: true}));
  await writeFile(path.join(value.root, value.freezePath), `${JSON.stringify({
    schemaVersion: 1,
    calibrationId: value.calibrationId,
    selectedPages: [{
      animationId: 'shared-nms002-l01-p001',
      complexityLane: 'low',
    }],
  })}\n`);
  await assert.rejects(
    synchronizePrivateCurrentJsCalibration({
      calibrationPath: value.fragmentPath,
      check: false,
      registryPath: value.registryPath,
      root: value.root,
    }),
    /deploymentScope does not match/u,
  );
});
