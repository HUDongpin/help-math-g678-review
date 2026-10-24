import assert from "node:assert/strict";
import test from "node:test";

import {
  privateCurrentJsCalibrationDeploymentScope,
  privateCurrentJsCalibrationMatches,
  upsertPrivateCurrentJsCalibration,
} from "./private-current-js-registry.mjs";

const baseDocument = Object.freeze({
  schemaVersion: 2,
  registryScope: "private-engineering",
  calibrations: Object.freeze([]),
});

const localCalibration = Object.freeze({
  calibrationId: "g678-16-page-product-calibration-v1",
  deploymentScope: "local-only",
  freezeManifestBytes: 123,
  freezeManifestSha256: "f".repeat(64),
  freezeManifest:
    "catalog/product-bridge-calibrations/g678-16-page-product-calibration-v1.json",
  entries: Object.freeze([
    Object.freeze({
      key: "shared-nms002-l01-p001",
      module: "./modules/shared-nms002-l01-p001",
      maturity: "private-current-js",
      complexityLane: "low",
      artifacts: {
        module: {
          path: "packages/demos/src/modules/shared-nms002-l01-p001.tsx",
          bytes: 10,
          sha256: "a".repeat(64),
        },
        timeline: {
          path: "packages/demos/src/timelines/shared-nms002-l01-p001.ts",
          bytes: 11,
          sha256: "b".repeat(64),
        },
        runtime: {
          path: "work/g678-shared-page-factory/run/members/shared-nms002-l01-p001/canvas-renderer.js",
          bytes: 12,
          sha256: "c".repeat(64),
        },
      },
    }),
  ]),
});

test("private Current-JS registry preserves a verifiable local-only deployment scope", () => {
  const updated = upsertPrivateCurrentJsCalibration(
    baseDocument,
    localCalibration,
  );
  assert.equal(
    privateCurrentJsCalibrationDeploymentScope(updated.calibrations[0]),
    "local-only",
  );
  assert.equal(
    privateCurrentJsCalibrationMatches(updated, localCalibration),
    true,
  );
});

test("existing calibrations default to bundled while unknown scopes fail closed", () => {
  const bundled = {...localCalibration};
  delete bundled.deploymentScope;
  assert.equal(privateCurrentJsCalibrationDeploymentScope(bundled), "bundled");
  assert.throws(
    () => privateCurrentJsCalibrationDeploymentScope({
      ...localCalibration,
      deploymentScope: "production",
    }),
    /deploymentScope is invalid/u,
  );
});

test("maintained DOM registrations use the exact tagged provenance union", () => {
  const key = "shared-alg001-l11-p006";
  const run = "work/g678-shared-page-factory/example-current-js-v1";
  const dom = structuredClone(localCalibration);
  dom.entries = [{key,
    module: "./modules/g678-alg-l11-interactive10-tranche-c-p006",
    maturity: "private-current-js", complexityLane: "interactive-understood",
    artifacts: {kind: "maintained-dom-module-v1",
      module: {path:
        "packages/demos/src/modules/g678-alg-l11-interactive10-tranche-c-p006.tsx",
      bytes: 10, sha256: "a".repeat(64)},
      timeline: {path:
        "packages/demos/src/timelines/g678-alg-l11-interactive10-tranche-c-p006.ts",
      bytes: 11, sha256: "b".repeat(64)},
      memberManifest: {path: `${run}/members/${key}/member-manifest.json`,
        bytes: 12, sha256: "c".repeat(64)},
      sourceRun: {path: `${run}/run-manifest.json`, bytes: 13,
        sha256: "d".repeat(64)}}}];
  const updated = upsertPrivateCurrentJsCalibration(baseDocument, dom);
  assert.equal(privateCurrentJsCalibrationMatches(updated, dom), true);
  for (const mutate of [
    (value) => { value.entries[0].artifacts.kind = "external-canvas-runtime-v1"; },
    (value) => { value.entries[0].artifacts.runtime =
      value.entries[0].artifacts.sourceRun; },
    (value) => { value.entries[0].artifacts.module.path =
      value.entries[0].artifacts.module.path.replace("p006", "p008"); },
    (value) => { value.entries[0].artifacts.timeline.path =
      value.entries[0].artifacts.timeline.path.replace("p006", "p008"); },
    (value) => { value.entries[0].artifacts.memberManifest.path =
      value.entries[0].artifacts.memberManifest.path.replace(key,
        "shared-alg001-l11-p008"); },
    (value) => { value.entries[0].artifacts.sourceRun.path =
      "catalog/copied/run-manifest.json"; },
  ]) {
    const changed = structuredClone(dom); mutate(changed);
    assert.throws(() => upsertPrivateCurrentJsCalibration(baseDocument,
      changed), /artifacts|artifact paths/u);
  }
});

test("P001 source-title timeline has one exact frozen path exception", () => {
  const run = "work/g678-shared-page-factory/g678-alg-l06-p001-source-title-candidate-v1";
  const calibration = structuredClone(localCalibration);
  calibration.entries = [{key: "shared-alg001-l06-p001",
    module: "./modules/g678-alg-l06-source-title-p001",
    maturity: "private-current-js", complexityLane: "behavior-heavy",
    artifacts: {kind: "maintained-dom-module-v1",
      module: {path: "packages/demos/src/modules/g678-alg-l06-source-title-p001.tsx",
        bytes: 10, sha256: "a".repeat(64)},
      timeline: {path: "packages/demos/src/alg-l06-p001-title-state.ts",
        bytes: 11, sha256: "b".repeat(64)},
      memberManifest: {path: `${run}/members/shared-alg001-l06-p001/member-manifest.json`,
        bytes: 12, sha256: "c".repeat(64)},
      sourceRun: {path: `${run}/run-manifest.json`, bytes: 13,
        sha256: "d".repeat(64)}}}];
  assert.equal(privateCurrentJsCalibrationMatches(
    upsertPrivateCurrentJsCalibration(baseDocument, calibration), calibration), true);
  const wrong = structuredClone(calibration);
  wrong.entries[0].artifacts.timeline.path =
    "packages/demos/src/alg-l06-p002-title-state.ts";
  assert.throws(() => upsertPrivateCurrentJsCalibration(baseDocument, wrong),
    /artifact paths/u);
});
