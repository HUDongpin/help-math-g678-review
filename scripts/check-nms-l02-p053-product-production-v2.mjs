#!/usr/bin/env node
/** P053 local candidate production denial. The caller owns one fresh server. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile, readJsonPin, readOrdinary, readPin, uniquePins}
  from '../lib/g678-admission-proof.mjs';
import {routes as predecessorRoutes} from './probe-nms-l02-p054-production-isolation-v1.mjs';
import {validateP054ProofClosure} from '../lib/nms-l02-p054-proof-semantics-v1.mjs';
import {validateP064ProofClosure} from '../lib/nms-l02-p064-admission-semantics-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://127.0.0.1:3332';
const BUILD_LINK = 'apps/web/.next-alg-p001-production-scan';
const BUILD_ROOT = '/Volumes/American Dream/hudongpin/g678-p053-product-build-output-20260928/next-output-v2';
const BUILD_RECEIPT = 'output/nms-l02-p053-product-20260928/production/build-receipt-v2.json';
const OUTPUT_ROOT = 'output/nms-l02-p053-product-20260928/production';
const P053_PAGE = '/migration-status/g678-calibration/shared-nms002-l02-p053';
const P053_ASSETS = '/flash-assets/g678-local/shared-nms002-l02-p053';
const P054_ASSETS = '/flash-assets/g678-local/shared-nms002-l02-p054';
const AUDIO = Object.freeze({
  source: '225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d',
  correct: 'd34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4',
  wrong: '2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77',
});
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const EXTRACTION_ROOT = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const P054_HOST = {path: 'catalog/nms-l02-admission-v1/host-v15.json', bytes: 42983,
  sha256: '7150c0e90578f5c2763eb3bb90e93a3605dde61613d2597907c318dffec7eb68'};
const P054_PROOF = {path: 'work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json',
  bytes: 54313, sha256: '5e8fc913e9e0bc41dbf1336b4d042983e5fd5b74b60fc63beeec7c3015adf666'};
const P054_ACTIVATION = 'apps/web/lib/nms-l02-p054-admission-activation.ts';
const P064_ACTIVATION = 'apps/web/lib/nms-l02-p064-admission-activation.ts';
const P064_PROOF = 'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json';
const P053_EXTERNAL = Object.freeze([
  {root: SOURCE_ROOT, pin: {path: 'G6-G8-shared/NMS002/L2/GS/L2GS02.swf', bytes: 236774,
    sha256: 'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf'}},
  {root: SOURCE_ROOT, pin: {path: 'G6-G8-shared/NMS002/L2/index.xml', bytes: 12845,
    sha256: '550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'}},
  {root: `${EXTRACTION_ROOT}/p053-source-audit-rjgSPq`,
    pin: {path: 'movie.xml', bytes: 1262572,
      sha256: '058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1'}},
  {root: `${EXTRACTION_ROOT}/p053-source-stream-product-v1`,
    pin: {path: 'sprite-187-source-stream-v1.mp3', bytes: 256230,
      sha256: AUDIO.source}},
  {root: `${EXTRACTION_ROOT}/p053-source-stream-product-v1`,
    pin: {path: 'raw-block-index-v1.json', bytes: 447231,
      sha256: '71b102949ed66206315863a290691f1f4db1b2331ce3d0283ea90684b0ff8fa8'}},
]);

const INPUT_PATHS = Object.freeze([
  'scripts/check-nms-l02-p053-product-production-v2.mjs',
  'scripts/build-and-probe-nms-l02-p053-product-v2.py',
  'scripts/probe-nms-l02-p054-production-isolation-v1.mjs',
  'scripts/check-nms-l02-p054-product-production-v3.mjs',
  'scripts/check-nms-l02-p064-product-v1.mjs',
  'lib/nms-l02-p054-proof-semantics-v1.mjs',
  'lib/nms-l02-p064-admission-semantics-v1.mjs',
  'apps/web/next.config.ts', 'apps/web/tsconfig.json', 'apps/web/next-env.d.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p053/page.tsx',
  'apps/web/lib/nms-l02-p053-product-candidate.server.ts',
  'apps/web/lib/nms-l02-p053-product-descriptor-v1.ts',
  'apps/web/lib/nms-l02-p053-product-host.production-stub.tsx',
  'apps/web/components/g678-nms-l02-p053-product-lesson-v1.generated.tsx',
  'apps/web/components/nms-l02-p053-lesson-runtime-v1.tsx',
  'apps/web/components/nms-l02-p053-game-handoff-runtime-v1.tsx',
  'apps/web/components/nms-l02-p053-host-v1.css',
  'apps/web/lib/nms-l02-p053-source-audio-access.ts',
  'apps/web/lib/nms-l02-p053-source-audio.server.ts',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/source-audio/route.ts',
  'apps/web/lib/nms-l02-p053-game-resource-access.ts',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/game/reveal/[level]/[order]/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/game/feedback-audio/[kind]/route.ts',
  'apps/web/tests/nms-l02-p053-game-resource-access.test.ts',
  'apps/web/tests/nms-l02-p053-local-media-policy.test.mjs',
  'apps/web/tests/nms-l02-p053-source-audio-access.test.ts',
  'apps/web/tests/nms-l02-p053-product-descriptor-v1.test.ts',
  'apps/web/tests/nms-l02-p053-lesson-runtime-v1.test.tsx',
  'packages/demos/src/nms-l02-p053-source-scene-v1.tsx',
  'packages/demos/src/nms-l02-p053-readable-directions-v1.tsx',
  'packages/demos/tests/nms-l02-p053-readable-directions-v1.test.tsx',
  'packages/demos/src/nms-l02-p053-display-state-v1.ts',
  'packages/demos/src/nms-l02-p053-player-state-v1.ts',
  'packages/demos/src/nms-l02-p053-controller-candidate.ts',
  'packages/demos/src/nms-l02-p053-host-navigation-v1.ts',
  'packages/demos/src/nms-l02-p053-source-audio-loader.ts',
  'packages/demos/src/generated/nms-l02-p053-display-data-v1.ts',
  'packages/demos/src/generated/nms-l02-p053-shape-art-v1.ts',
  'packages/demos/src/nms-l02-p054-product-board-v1.tsx',
  'packages/demos/src/nms-l02-p054-reveal-v1.ts',
  'packages/demos/src/nms-l02-p054-feedback-audio-v1.ts',
  'migrations/shared-nms002-l02-p053/audit/visual-scene-v1.json',
  'migrations/shared-nms002-l02-p053/audit/native-display-product-v1.json',
  'migrations/shared-nms002-l02-p053/audit/shape-art-v1.json',
  'migrations/shared-nms002-l02-p053/audit/host-navigation-resolution-v1.json',
  'migrations/shared-nms002-l02-p053/audit/source-stream-product-v1.json',
  'migrations/shared-nms002-l02-p053/audit/frame-domain-static-graph-v1.json',
  'scripts/generate-nms-l02-p053-product-host-v1.mjs',
  'scripts/generate-nms-l02-p053-display-data-v1.mjs',
  'scripts/build-nms-l02-p053-shape-art-v1.mjs',
  'packages/demos/private-current-js-registry.json', P054_ACTIVATION,
  P064_ACTIVATION, P064_PROOF, P054_HOST.path, P054_PROOF.path,
]);

export const FORBIDDEN_BUNDLE_MARKERS = Object.freeze([
  'P053_PRODUCT_CANDIDATE:', 'nms-l02-p053-product-candidate.server',
  'P053SourceScene', 'p053ReviewedScene', 'P053_DISPLAY_SCENE',
  'P053_SHAPE_SYMBOL_IDS', 'p053-shape-100', 'P053_SOURCE_SCENE_IDENTITY',
  'NmsL02P053LessonRuntimeV1', 'sprite-187-source-stream-v1.mp3',
  'data-p053-readable-directions',
]);

function currentP054Activation() {
  const text = readOrdinary(ROOT, P054_ACTIVATION).toString('utf8');
  const match = text.match(/export const NMS_L02_P054_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
  assert(match, 'P054 activation parse');
  const activation = JSON.parse(match[1]);
  assert.equal(activation.schemaVersion, 1);
  assert.equal(activation.stage, 'registered');
  assert.deepEqual(activation.host, P054_HOST);
  assert.deepEqual(activation.page, P054_PROOF);
  for (const pin of [activation.predecessor, activation.host, activation.page]) readPin(ROOT, pin);
  return activation;
}

function currentP064Activation() {
  const text = readOrdinary(ROOT, P064_ACTIVATION).toString('utf8');
  const match = text.match(/export const NMS_L02_P064_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
  assert(match, 'P064 activation parse');
  const activation = JSON.parse(match[1]);
  assert.equal(activation.schemaVersion, 1);
  assert.equal(activation.stage, 'registered');
  assert.equal(activation.host.path, 'catalog/nms-l02-admission-v1/host-v14.json');
  assert.equal(activation.page.path, P064_PROOF);
  for (const pin of [activation.predecessor, activation.host, activation.page]) readPin(ROOT, pin);
  return activation;
}

function externalPin(root, pin) {
  readPin(root, pin);
  return {...pin, path: path.join(root, pin.path)};
}

export function inputClosure() {
  const activation = currentP054Activation();
  const p064Activation = currentP064Activation();
  const host = readJsonPin(ROOT, P054_HOST);
  const proof = readJsonPin(ROOT, P054_PROOF);
  const p064Proof = readJsonPin(ROOT, p064Activation.page);
  assert.equal(host.kind, 'nms-l02-successor-host-v1');
  assert.equal(host.contract, 'nms-l02-source-bound-host-v1');
  assert.equal(proof.kind, 'nms-l02-page-proof-v1');
  assert.equal(validateP054ProofClosure(proof), true);
  assert.equal(validateP064ProofClosure(p064Proof), true);
  assert.deepEqual(uniquePins(host.files), host.files);
  assert.deepEqual(uniquePins(proof.files), proof.files);
  assert.deepEqual(uniquePins(p064Proof.files), p064Proof.files);
  const local = [...INPUT_PATHS.map(file => pinFile(ROOT, file)),
    ...host.files, ...proof.files, ...p064Proof.files];
  for (const pin of [...host.files, ...proof.files, ...p064Proof.files]) readPin(ROOT, pin);
  const shape = JSON.parse(readOrdinary(ROOT,
    'migrations/shared-nms002-l02-p053/audit/shape-art-v1.json'));
  assert.equal(shape.animationId, 'shared-nms002-l02-p053');
  assert.equal(shape.source.sha256, P053_EXTERNAL[0].pin.sha256);
  assert.equal(shape.export.consumedShapeCount, 48);
  assert.equal(shape.export.rawExportedShapeCount, 68);
  assert.equal(shape.export.rawFiles.length, 68);
  const external = [...P053_EXTERNAL, ...proof.external, ...p064Proof.external,
    ...shape.export.rawFiles.map(pin => ({root: shape.export.externalExportRoot,
      pin}))].map(item => externalPin(item.root, item.pin));
  return {inputs: uniquePins([...local, ...external]), activation,
    hostFileCount: host.files.length, pageFileCount: proof.files.length,
    p064PageFileCount: p064Proof.files.length,
    externalFileCount: external.length, shapeFileCount: shape.export.rawFiles.length};
}

export function routes() {
  const prior = predecessorRoutes();
  assert.equal(prior.length, 480, 'exact retained P054/P064 route matrix');
  const pages = ['en', 'es', ''].flatMap(locale => {
    const prefix = locale ? `/${locale}` : '';
    return ['', '?frame=1', '?level=1', '?level=2', '?extra=1'].map(query =>
      ({path: `${prefix}${P053_PAGE}${query}`, kind: 'page', refererPage: 'p053'}));
  });
  const sourceAudio = [{path: `${P053_ASSETS}/source-audio?sha256=${AUDIO.source}`,
    kind: 'audio', refererPage: 'p053'}];
  const sourceMalformed = [
    `${P053_ASSETS}/source-audio`,
    `${P053_ASSETS}/source-audio?sha256=${AUDIO.wrong}`,
    `${P053_ASSETS}/source-audio?sha256=${AUDIO.source}&x=1`,
    `${P053_ASSETS}/source-audio/extra?sha256=${AUDIO.source}`,
  ].map(value => ({path: value, kind: 'audio', refererPage: 'p053'}));
  const directGame = [1, 2].flatMap(level => Array.from({length: 12}, (_, i) =>
    ({path: `${P053_ASSETS}/game/reveal/${level}/${i + 1}`,
      kind: 'image', refererPage: 'p053'})));
  const directFeedback = Object.entries(AUDIO).filter(([kind]) => kind !== 'source')
    .map(([kind, sha256]) => ({path: `${P053_ASSETS}/game/feedback-audio/${kind}?sha256=${sha256}`,
      kind: 'audio', refererPage: 'p053'}));
  const originalGameFromP053 = prior.filter(row =>
    /^\/flash-assets\/g678-local\/shared-nms002-l02-p054\/reveal\/[12]\/(?:[1-9]|1[0-2])$/u.test(row.path) ||
    Object.entries(AUDIO).filter(([kind]) => kind !== 'source').some(([kind, sha]) =>
      row.path === `${P054_ASSETS}/feedback-audio/${kind}?sha256=${sha}`))
    .map(row => ({...row, refererPage: 'p053'}));
  const gameMalformed = [
    `${P053_ASSETS}/game/reveal/0/1`, `${P053_ASSETS}/game/reveal/1/0`,
    `${P053_ASSETS}/game/reveal/2/13`, `${P053_ASSETS}/game/reveal/1/1?x=1`,
    `${P053_ASSETS}/game/feedback-audio/correct`,
    `${P053_ASSETS}/game/feedback-audio/wrong?sha256=${AUDIO.correct}`,
    `${P053_ASSETS}/game/feedback-audio/other?sha256=${AUDIO.wrong}`,
    `${P053_ASSETS}/game/feedback-audio/correct?sha256=${AUDIO.correct}&x=1`,
  ].map(value => ({path: value, kind: value.includes('/reveal/') ? 'image' : 'audio',
    refererPage: 'p053'}));
  assert.equal(originalGameFromP053.length, 26);
  assert.equal(directGame.length, 24);
  assert.equal(directFeedback.length, 2);
  const result = [...prior, ...pages, ...sourceAudio, ...sourceMalformed,
    ...directGame, ...directFeedback, ...originalGameFromP053, ...gameMalformed];
  assert.equal(result.length, 560);
  assert.equal(new Set(result.map(row => `${row.path}|${row.refererPage ?? 'prior'}`)).size,
    result.length, 'unique path and request context');
  return result;
}

export function planProductionDenials() {
  const closure = inputClosure();
  return {schemaVersion: 1, kind: 'nms-l02-p053-product-production-plan-v1',
    buildRoot: BUILD_ROOT, buildReceipt: BUILD_RECEIPT, origin: ORIGIN,
    sourceModes: ['unset', 'real-root'], routeCount: routes().length,
    casesPerMode: routes().length * 4, expectedCases: routes().length * 8,
    predecessorRouteCount: 480, pageVariants: 15, gameRevealRoutes: 24,
    gameFeedbackRoutes: 2, originalGameCrossPageRoutes: 26,
    ...closure, writesPerformed: false};
}

export function scanProductionBundles(buildRoot = BUILD_ROOT) {
  const sourceMp3 = readOrdinary(`${EXTRACTION_ROOT}/p053-source-stream-product-v1`,
    'sprite-187-source-stream-v1.mp3');
  assert.equal(createHash('sha256').update(sourceMp3).digest('hex'), AUDIO.source);
  const audioPrefix = sourceMp3.subarray(0, 128);
  const rawShapes = JSON.parse(readOrdinary(ROOT,
    'migrations/shared-nms002-l02-p053/audit/shape-art-v1.json'));
  const forbiddenDigests = new Set([AUDIO.source,
    ...rawShapes.export.rawFiles.map(row => row.sha256)]);
  let files = 0, bytes = 0;
  const matches = [];
  for (const subdir of ['server', 'static']) {
    const pending = [path.join(buildRoot, subdir)];
    assert(fs.statSync(pending[0]).isDirectory(), `production ${subdir} directory`);
    while (pending.length) {
      const directory = pending.pop();
      for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        assert(!entry.isSymbolicLink(), 'no symlink in compiled production scan');
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {pending.push(file); continue;}
        if (!entry.isFile()) continue;
        const content = fs.readFileSync(file);
        files++; bytes += content.length;
        const relative = path.relative(buildRoot, file);
        if (forbiddenDigests.has(createHash('sha256').update(content).digest('hex')))
          matches.push({path: relative, marker: 'exact-source-asset-bytes'});
        if (!/[.]m?js$/u.test(entry.name)) continue;
        for (const marker of FORBIDDEN_BUNDLE_MARKERS)
          if (content.includes(Buffer.from(marker))) matches.push({path: relative, marker});
        if (content.includes(audioPrefix) ||
            content.includes(Buffer.from(audioPrefix.toString('base64').slice(0, 64))))
          matches.push({path: relative, marker: 'embedded-source-mp3-prefix'});
      }
    }
  }
  assert(files > 0 && bytes > 0, 'compiled production files scanned');
  return {files, bytes, markers: FORBIDDEN_BUNDLE_MARKERS, matches};
}

function buildDirectoryBinding() {
  const logical = path.join(ROOT, BUILD_LINK);
  assert(fs.lstatSync(logical).isSymbolicLink(), 'isolated build link');
  assert.equal(fs.readlinkSync(logical), BUILD_ROOT);
  assert.equal(fs.realpathSync(logical), BUILD_ROOT);
  assert.equal(fs.realpathSync(BUILD_ROOT), BUILD_ROOT);
  return {logicalPath: BUILD_LINK, physicalRoot: BUILD_ROOT, symlinkTarget: BUILD_ROOT};
}

function pinBuildId() {
  buildDirectoryBinding();
  return {...pinFile(BUILD_ROOT, 'BUILD_ID'), path: `${BUILD_LINK}/BUILD_ID`};
}

function requestHeaders(route, mode) {
  if (mode === 'anonymous') return {};
  const page = route.kind === 'page', image = route.kind === 'image';
  const script = route.kind === 'script';
  const match = route.path.match(/shared-nms002-l02-p(\d{3})/u);
  const prior = match?.[1];
  const referer = route.refererPage === 'p053' ? `/en${P053_PAGE}` :
    prior === '054' ? '/en/migration-status/g678-calibration/shared-nms002-l02-p054?level=1' :
    `/en/migration-status/g678-calibration/shared-nms002-l02-p${prior ?? '054'}`;
  return {host: '127.0.0.1:3332', referer: ORIGIN + referer,
    ...(image ? {} : {origin: ORIGIN}), 'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': page ? 'navigate' : image ? 'no-cors' : 'cors',
    'sec-fetch-dest': page ? 'document' : image ? 'image' : script ? 'script' : 'empty'};
}

async function smallBody(response) {
  if (!response.body) return {bytes: 0, leak: false};
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      chunks.push(Buffer.from(value));
      if (bytes >= 1000) break;
    }
  } finally {await reader.cancel().catch(() => {}); reader.releaseLock();}
  const body = Buffer.concat(chunks);
  return {bytes, leak: FORBIDDEN_BUNDLE_MARKERS.some(marker =>
    body.includes(Buffer.from(marker)))};
}

async function probe(route, method, mode) {
  const response = await fetch(ORIGIN + route.path, {method,
    headers: requestHeaders(route, mode), redirect: 'manual',
    signal: AbortSignal.timeout(15000)});
  const body = await smallBody(response);
  const pass = response.status === 404 && body.bytes < 1000 && !body.leak &&
    response.headers.get('location') === null;
  return {path: route.path, kind: route.kind, refererPage: route.refererPage ?? null,
    method, headersMode: mode, status: response.status, bodyBytes: body.bytes,
    leak: body.leak, redirected: response.headers.get('location') !== null, pass};
}

async function run(slug, sourceMode) {
  const relative = `${OUTPUT_ROOT}/${slug}-${sourceMode}.json`;
  const file = path.join(ROOT, relative);
  assert(!fs.existsSync(file), 'immutable production result already exists');
  assert.equal(process.env.NODE_ENV, 'production');
  if (sourceMode === 'unset') assert(!Object.hasOwn(process.env, 'HELP_MATH_G678_SOURCE_ROOT'));
  else assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT);
  const receipt = {schemaVersion: 1, kind: 'nms-l02-p053-local-production-negative-v1',
    sourceMode, origin: ORIGIN, buildRoot: BUILD_ROOT, startedAt: new Date().toISOString(),
    expectedCases: 2240, status: 'running', results: [], errors: []};
  try {
    receipt.directoryBinding = buildDirectoryBinding();
    const closure = inputClosure();
    receipt.inputClosure = {hostFileCount: closure.hostFileCount,
      pageFileCount: closure.pageFileCount, externalFileCount: closure.externalFileCount,
      p064PageFileCount: closure.p064PageFileCount,
      shapeFileCount: closure.shapeFileCount};
    receipt.inputsBefore = [...closure.inputs, pinFile(ROOT, BUILD_RECEIPT), pinBuildId()];
    receipt.buildIdBefore = readOrdinary(BUILD_ROOT, 'BUILD_ID').toString('utf8').trim();
    assert(/^[a-zA-Z0-9_-]+$/u.test(receipt.buildIdBefore));
    const build = JSON.parse(readOrdinary(ROOT, BUILD_RECEIPT));
    assert.equal(build.exitCode, 0);
    assert.equal(build.inputsStable, true);
    assert.equal(build.configRestored, true);
    assert.deepEqual(build.inputsAfter, closure.inputs);
    assert.deepEqual(build.buildId, pinBuildId());
    assert.equal(build.selectedNonSecretEnvironment.NODE_ENV, 'production');
    receipt.bundleScan = scanProductionBundles();
    assert.deepEqual(receipt.bundleScan.matches, [], 'no P053 source, audio or vector payload');
    for (const route of routes()) for (const method of ['GET', 'HEAD'])
      for (const mode of ['anonymous', 'candidate-shaped-request']) {
        try {receipt.results.push(await probe(route, method, mode));}
        catch (error) {receipt.results.push({path: route.path, kind: route.kind,
          method, headersMode: mode, pass: false, error: String(error)});}
      }
  } catch (error) {receipt.errors.push(String(error));}
  finally {
    try {
      const closure = inputClosure();
      receipt.inputsAfter = [...closure.inputs, pinFile(ROOT, BUILD_RECEIPT), pinBuildId()];
      receipt.buildIdAfter = readOrdinary(BUILD_ROOT, 'BUILD_ID').toString('utf8').trim();
    } catch (error) {receipt.errors.push(`post-check pin: ${String(error)}`);}
    receipt.inputStable = JSON.stringify(receipt.inputsBefore) ===
      JSON.stringify(receipt.inputsAfter) && receipt.buildIdBefore === receipt.buildIdAfter;
    receipt.status = receipt.errors.length === 0 && receipt.inputStable &&
      receipt.results.length === receipt.expectedCases && receipt.results.every(row => row.pass)
      ? 'technical-pass-not-deployment' : 'failed';
    receipt.finishedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
    console.log(JSON.stringify({status: receipt.status, expectedCases: receipt.expectedCases,
      passed: receipt.results.filter(row => row.pass).length,
      inputStable: receipt.inputStable, errors: receipt.errors,
      receipt: pinFile(ROOT, relative)}));
    if (receipt.status === 'failed') process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--plan')
    console.log(JSON.stringify(planProductionDenials()));
  else {
    assert(args.length === 3 && args[0] === '--run' &&
      /^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]) &&
      ['unset', 'real-root'].includes(args[2]),
    'Usage: node scripts/check-nms-l02-p053-product-production-v2.mjs --plan | --run <unique-slug> <unset|real-root>');
    await run(args[1], args[2]);
  }
}
