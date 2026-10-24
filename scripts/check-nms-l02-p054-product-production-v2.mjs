#!/usr/bin/env node
/** P054 local production isolation. The caller owns one fresh Next production server. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile, readOrdinary, readPin} from '../lib/g678-admission-proof.mjs';
import {planProductionDenials as predecessorPlan,
  routes as predecessorRoutes} from './check-nms-l02-p064-product-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://127.0.0.1:3332';
const BUILD_ROOT = '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v2';
const BUILD_LINK = 'apps/web/.next-alg-p001-production-scan';
const BUILD_ID = `${BUILD_LINK}/BUILD_ID`;
const BUILD_RECEIPT = 'output/nms-l02-p054-product-20260928/production-v2/build-receipt-v2.json';
const ACTIVATION = 'apps/web/lib/nms-l02-p064-admission-activation.ts';
const HOST = 'catalog/nms-l02-admission-v1/host-v14.json';
const PAGE_PROOF = 'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json';
const P054_PAGE = '/migration-status/g678-calibration/shared-nms002-l02-p054';
const P054_ASSETS = '/flash-assets/g678-local/shared-nms002-l02-p054';
const AUDIO = Object.freeze({
  correct: 'd34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4',
  wrong: '2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77',
});
const INPUTS = Object.freeze([
  'scripts/check-nms-l02-p054-product-production-v2.mjs',
  'scripts/check-nms-l02-p054-product-production-v2.test.mjs',
  'scripts/check-nms-l02-p064-product-v1.mjs',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p054/page.tsx',
  'apps/web/lib/nms-l02-p054-product-host.production-stub.tsx',
  'apps/web/lib/nms-l02-p054-product-candidate.server.ts',
  'apps/web/lib/nms-l02-p054-product-descriptor-v1.ts',
  'apps/web/components/g678-nms-l02-p054-product-lesson-v1.generated.tsx',
  'apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx',
  'apps/web/components/nms-l02-p054-product-host-v1.css',
  'packages/demos/src/nms-l02-p054-product-board-v1.tsx',
  'packages/demos/src/nms-l02-p054-board-candidate.css',
  'packages/demos/src/nms-l02-p054-matching-state-candidate.ts',
  'packages/demos/src/generated/nms-l02-p054-cards-v1.ts',
  'apps/web/lib/nms-l02-p054-reveal-access.ts',
  'apps/web/lib/nms-l02-p054-reveal.server.ts',
  'apps/web/lib/nms-l02-p054-feedback-audio-access.ts',
  'apps/web/lib/nms-l02-p054-feedback-audio.server.ts',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/reveal/[level]/[order]/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/[kind]/route.ts',
  'packages/demos/src/nms-l02-p054-reveal-v1.ts',
  'packages/demos/src/nms-l02-p054-feedback-audio-v1.ts',
  'packages/demos/src/nms-l02-p054-feedback-audio-loader.ts',
  ACTIVATION, HOST, PAGE_PROOF, 'packages/demos/private-current-js-registry.json',
]);

// Compiled JavaScript, rather than NFT trace metadata, must exclude the
// source reader and the actual board/card payload. The exact SWF digest is a
// deliberately strict marker: route guards must use production-safe stubs.
export const FORBIDDEN_BUNDLE_MARKERS = Object.freeze([
  '06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
  'nms-l02-p054-product-candidate.server',
  'P054_PRODUCT_CANDIDATE:',
  'P054ProductBoardV1',
  'P054_CARDS',
  'P054_CARD_SOURCE',
  'Mc1_1',
  'Find the matching pairs and correct answers will reveal a picture and music.',
]);

export function scanProductionBundles(buildRoot = BUILD_ROOT) {
  const matches = [];
  let files = 0;
  let bytes = 0;
  for (const subdir of ['server', 'static']) {
    const start = path.join(buildRoot, subdir);
    assert(fs.statSync(start).isDirectory(), `production ${subdir} directory`);
    const pending = [start];
    while (pending.length) {
      const directory = pending.pop();
      for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        assert(!entry.isSymbolicLink(), 'no symlink in compiled JavaScript scan');
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) { pending.push(file); continue; }
        if (!entry.isFile() || !/[.]m?js$/u.test(entry.name)) continue;
        const content = fs.readFileSync(file);
        files++;
        bytes += content.length;
        for (const marker of FORBIDDEN_BUNDLE_MARKERS) {
          if (content.includes(Buffer.from(marker))) {
            matches.push({path: path.relative(buildRoot, file), marker});
          }
        }
      }
    }
  }
  assert(files > 0 && bytes > 0, 'compiled JavaScript scanned');
  return {files, bytes, markers: FORBIDDEN_BUNDLE_MARKERS, matches};
}

function buildDirectoryBinding() {
  const directory = path.join(ROOT, BUILD_LINK);
  assert(fs.lstatSync(directory).isSymbolicLink(), 'isolated build link');
  assert.equal(fs.readlinkSync(directory), BUILD_ROOT, 'exact fresh build link target');
  assert.equal(fs.realpathSync(directory), BUILD_ROOT, 'exact physical build directory');
  assert.equal(fs.realpathSync(BUILD_ROOT), BUILD_ROOT, 'physical build root');
  return {logicalPath: BUILD_LINK, physicalRoot: BUILD_ROOT, symlinkTarget: BUILD_ROOT};
}

function pinInput(file) {
  if (file !== BUILD_ID) return pinFile(ROOT, file);
  buildDirectoryBinding();
  return {...pinFile(BUILD_ROOT, 'BUILD_ID'), path: BUILD_ID};
}

function allInputPins() {
  const result = new Map();
  for (const pin of [...INPUTS.map(pinInput), ...predecessorPlan().inputs]) {
    const previous = result.get(pin.path);
    if (previous) assert.deepEqual(previous, pin, `inherited input ${pin.path}`);
    result.set(pin.path, pin);
  }
  return [...result.values()];
}

function readBuildId() {
  buildDirectoryBinding();
  return readOrdinary(BUILD_ROOT, 'BUILD_ID').toString('utf8').trim();
}

function registeredPredecessor() {
  const text = readOrdinary(ROOT, ACTIVATION).toString('utf8');
  const match = text.match(/export const NMS_L02_P064_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
  assert(match, 'P064 activation parse');
  const activation = JSON.parse(match[1]);
  assert.equal(activation.schemaVersion, 1);
  assert.equal(activation.stage, 'registered');
  assert.equal(activation.host.path, HOST);
  assert.equal(activation.page.path, PAGE_PROOF);
  for (const pin of [activation.predecessor, activation.host, activation.page]) readPin(ROOT, pin);
  return activation;
}

export function routes() {
  const pages = ['en', 'es', ''].flatMap(locale => {
    const page = (locale ? `/${locale}` : '') + P054_PAGE;
    return ['', '?level=1', '?level=2', '?level=0', '?level=3',
      '?level=1&level=2', '?frame=2'].map(query => ({path: page + query, kind: 'page'}));
  });
  const reveal = [1, 2].flatMap(level => Array.from({length: 12}, (_, index) => ({
    path: `${P054_ASSETS}/reveal/${level}/${index + 1}`, kind: 'image', level,
  })));
  const audio = Object.entries(AUDIO).map(([name, sha256]) => ({
    path: `${P054_ASSETS}/feedback-audio/${name}?sha256=${sha256}`,
    kind: 'audio',
  }));
  const malformed = [
    `${P054_ASSETS}/reveal/0/1`, `${P054_ASSETS}/reveal/1/0`,
    `${P054_ASSETS}/reveal/2/13`, `${P054_ASSETS}/reveal/1/1?frame=2`,
    `${P054_ASSETS}/feedback-audio/correct`,
    `${P054_ASSETS}/feedback-audio/wrong?sha256=${AUDIO.correct}`,
    `${P054_ASSETS}/feedback-audio/other?sha256=${AUDIO.wrong}`,
    `${P054_ASSETS}/feedback-audio/correct?sha256=${AUDIO.correct}&level=1`,
  ].map(path => ({path, kind: path.includes('/reveal/') ? 'image' : 'audio'}));
  const prior = predecessorRoutes();
  const result = [...pages, ...reveal, ...audio, ...malformed, ...prior];
  assert.equal(prior.length, 425, 'P064 and retained prior resource matrix');
  assert.equal(pages.length, 21);
  assert.equal(reveal.length, 24);
  assert.equal(audio.length, 2);
  assert.equal(malformed.length, 8);
  assert.equal(result.length, 480);
  assert.equal(new Set(result.map(item => item.path)).size, result.length,
    'unique negative routes');
  return result;
}

function pageReferer(route) {
  const pathname = route.path;
  const level = route.level === 2 ? '?level=2' : '';
  if (pathname.startsWith(P054_ASSETS)) return `/en${P054_PAGE}${level}`;
  const previous = pathname.match(/shared-nms002-l02-p064|nms-l02-p0(62|61|60|58|57|56|55)/u);
  if (previous) {
    const ordinal = previous[1] ?? '64';
    return `/en/migration-status/g678-calibration/shared-nms002-l02-p${ordinal}`;
  }
  return `/en${P054_PAGE}`;
}

function candidateHeaders(route, mode) {
  if (mode === 'anonymous') return {};
  const page = route.kind === 'page';
  const image = route.kind === 'image';
  const script = route.kind === 'script';
  return {host: '127.0.0.1:3332', referer: ORIGIN + pageReferer(route),
    ...(image ? {} : {origin: ORIGIN}),
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': page ? 'navigate' : image ? 'no-cors' : 'cors',
    'sec-fetch-dest': page ? 'document' : image ? 'image' : script ? 'script' : 'empty'};
}

async function boundedBody(response) {
  if (!response.body) return 0;
  const reader = response.body.getReader();
  let length = 0;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) return length;
      length += value.byteLength;
      if (length >= 1000) return length;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

async function probe(route, method, mode) {
  const response = await fetch(ORIGIN + route.path, {method,
    headers: candidateHeaders(route, mode), redirect: 'manual',
    signal: AbortSignal.timeout(15000)});
  const bodyBytes = await boundedBody(response);
  const pass = response.status === 404 && bodyBytes < 1000 &&
    response.headers.get('location') === null;
  return {path: route.path, kind: route.kind, method, headersMode: mode,
    status: response.status, bodyBytes, contentType: response.headers.get('content-type'),
    redirected: response.headers.get('location') !== null, pass};
}

export function planProductionDenials() {
  const paths = routes();
  const inputs = allInputPins();
  return {schemaVersion: 1, kind: 'nms-l02-p054-product-production-denial-plan-v1',
    buildRoot: BUILD_ROOT, buildReceipt: BUILD_RECEIPT, origin: ORIGIN,
    routeCount: paths.length, expectedCases: paths.length * 4,
    p054PageVariants: 21, p054RevealRoutes: 24, p054FeedbackRoutes: 2,
    p064AndPredecessorRoutes: 425, inputs, writesPerformed: false};
}

async function runProductionDenials(slug) {
  const relative = `output/nms-l02-p054-product-20260928/production-v2/${slug}.json`;
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  assert(!fs.existsSync(file), `immutable run already exists: ${relative}`);
  const receipt = {schemaVersion: 1, kind: 'nms-l02-p054-local-production-negative-v1',
    origin: ORIGIN, buildRoot: BUILD_ROOT, status: 'running',
    startedAt: new Date().toISOString(), expectedCases: 1920,
    inputsBefore: [], inputsAfter: [], buildIdBefore: null, buildIdAfter: null,
    results: [], errors: []};
  try {
    receipt.directoryBinding = buildDirectoryBinding();
    receipt.inputsBefore = [...allInputPins(), pinInput(BUILD_RECEIPT), pinInput(BUILD_ID)];
    receipt.buildIdBefore = readBuildId();
    assert(/^[a-zA-Z0-9_-]+$/u.test(receipt.buildIdBefore), 'valid production BUILD_ID');
    receipt.activation = registeredPredecessor();
    const build = JSON.parse(readOrdinary(ROOT, BUILD_RECEIPT));
    assert.equal(build.exitCode, 0, 'successful local production build');
    assert.equal(build.inputsStable, true);
    assert.equal(build.configRestored, true);
    assert.deepEqual(build.buildId, pinInput(BUILD_ID), 'exact successful build ID');
    for (const pin of build.inputsAfter) readPin(ROOT, pin);
    assert.equal(build.selectedNonSecretEnvironment.NODE_ENV, 'production');
    receipt.bundleScan = scanProductionBundles();
    assert.deepEqual(receipt.bundleScan.matches, [], 'no P054 source or board in production JS');
    for (const route of routes()) for (const method of ['GET', 'HEAD']) {
      for (const mode of ['anonymous', 'candidate-shaped-request']) {
        try { receipt.results.push(await probe(route, method, mode)); }
        catch (error) { receipt.results.push({path: route.path, kind: route.kind,
          method, headersMode: mode, pass: false, error: String(error)}); }
      }
    }
  } catch (error) { receipt.errors.push(String(error)); }
  finally {
    try {
      receipt.inputsAfter = [...allInputPins(), pinInput(BUILD_RECEIPT), pinInput(BUILD_ID)];
      receipt.buildIdAfter = readBuildId();
    } catch (error) { receipt.errors.push(`post-check pin: ${String(error)}`); }
    receipt.inputStable = JSON.stringify(receipt.inputsBefore) ===
      JSON.stringify(receipt.inputsAfter) && receipt.buildIdBefore === receipt.buildIdAfter;
    receipt.status = receipt.errors.length === 0 && receipt.inputStable &&
      receipt.results.length === receipt.expectedCases && receipt.results.every(row => row.pass)
      ? 'technical-pass-not-deployment' : 'failed';
    receipt.finishedAt = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
    console.log(JSON.stringify({status: receipt.status, expectedCases: receipt.expectedCases,
      passed: receipt.results.filter(row => row.pass).length,
      inputStable: receipt.inputStable, errors: receipt.errors, receipt: pinFile(ROOT, relative)}));
    if (receipt.status === 'failed') process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--plan') {
    console.log(JSON.stringify(planProductionDenials()));
  } else {
    assert(args.length === 2 && args[0] === '--run' &&
      /^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]),
    'Usage: node scripts/check-nms-l02-p054-product-production-v2.mjs --plan | --run <unique-slug>');
    await runProductionDenials(args[1]);
  }
}
