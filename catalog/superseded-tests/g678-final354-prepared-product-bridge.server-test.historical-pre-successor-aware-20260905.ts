import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

import {prepareG678AlgL11Tranche1FamilyRegistration} from
  '../../../scripts/finalize-g678-alg-l11-tranche1-family-registration.mjs';
import {
  buildG678PartialCalibrationSnapshot,
  G678_CALIBRATION_FREEZE_PATH,
  G678_SHARED_CATALOG_PATH,
  G678_SHARED_PROFILE_PATH,
} from '../lib/g678-calibration-product-bridge.server';

const sha256 = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex');

async function jsonBinding(relativePath: string) {
  const bytes = await readFile(new URL(`../../../${relativePath}`,
    import.meta.url));
  return Object.freeze({path: relativePath, bytes: bytes.length,
    sha256: sha256(bytes), value: JSON.parse(bytes.toString('utf8'))});
}

test('prepared final354 projects through the real registry-bound product bridge', async () => {
  const [artifacts, catalog, profile, aggregateBrowser, privateRegistry] =
    await Promise.all([
      prepareG678AlgL11Tranche1FamilyRegistration(),
      jsonBinding(G678_SHARED_CATALOG_PATH),
      jsonBinding(G678_SHARED_PROFILE_PATH),
      jsonBinding('output/playwright/g678-current-js-354-v1/evidence.json'),
      jsonBinding('packages/demos/private-current-js-registry.json'),
    ]);
  const finalFreezeSha256 = sha256(artifacts.freezeBytes);
  const authorityDeclarations =
    artifacts.freeze.inputs.selectionAuthorities as readonly {
      readonly path: string;
    }[];
  const selectionAuthorities = await Promise.all(authorityDeclarations.map(
    (declaration) => jsonBinding(declaration.path)));
  const calibration = privateRegistry.value.calibrations.find(
    (candidate: {calibrationId?: string}) =>
      candidate.calibrationId === 'g678-16-page-product-calibration-v1');
  assert.ok(calibration);
  const entries = new Map(calibration.entries.map((entry: {
    key: string;
  }) => [entry.key, entry]));
  const registry = {
    hasModule: (animationId: string) => entries.has(animationId),
    registrationFor: (animationId: string) => {
      const entry = entries.get(animationId) as {
        artifacts: {
          module: {sha256: string};
          runtime: {sha256: string};
          timeline: {sha256: string};
        };
        maturity: string;
      } | undefined;
      return entry ? Object.freeze({
        scope: 'private-engineering' as const,
        maturity: entry.maturity,
        deploymentScope: 'local-only' as const,
        calibrationId: 'g678-16-page-product-calibration-v1',
        freezeManifestSha256: finalFreezeSha256,
        moduleSha256: entry.artifacts.module.sha256,
        runtimeSha256: entry.artifacts.runtime.sha256,
        timelineSha256: entry.artifacts.timeline.sha256,
      }) : undefined;
    },
  };
  const freeze = Object.freeze({
    // Before write/upsert, exercise the prepared bytes through the bridge's
    // active registry-bound slot with a custom registry carrying their hash.
    path: G678_CALIBRATION_FREEZE_PATH,
    bytes: artifacts.freezeBytes.length,
    sha256: finalFreezeSha256,
    value: artifacts.freeze,
  });
  const snapshot = buildG678PartialCalibrationSnapshot({
    browserEvidence: aggregateBrowser,
    catalog,
    freeze,
    profile,
    registry,
    selectionAuthorities,
  } as never);
  assert.equal(snapshot.status, 'ready');
  assert.equal(snapshot.registeredPlacementCount, 354);
  assert.equal(snapshot.descriptors.length, 44);
  const algL11 = snapshot.descriptors.find((descriptor) =>
    descriptor.productBridge.selectedAnimationIds.includes(
      'shared-alg001-l11-p001'));
  assert.equal(algL11?.pages.length, 44);
  assert.equal(algL11?.productBridge.registeredAnimationCount, 21);

  assert.throws(() => buildG678PartialCalibrationSnapshot({
    browserEvidence: aggregateBrowser,
    catalog,
    freeze,
    profile,
    registry: {...registry, registrationFor: (animationId: string) => {
      const registration = registry.registrationFor(animationId);
      return registration ? {...registration,
        freezeManifestSha256: '0'.repeat(64)} : undefined;
    }},
    selectionAuthorities,
  } as never), /G678_CALIBRATION_REGISTRATION_INVALID/u);
});
