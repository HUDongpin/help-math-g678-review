#!/usr/bin/env node
/** Local production-mode denial check. No remote origin or provider access. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile, readOrdinary, readPin} from '../lib/g678-admission-proof.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://127.0.0.1:3332';
const ID = 'shared-nms002-l02-p060';
const BUILD_ID = 'apps/web/.next-alg-p001-production-scan/BUILD_ID';
const BUILD_ROOT = '/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1';
function buildDirectoryBinding() {
  const logical = 'apps/web/.next-alg-p001-production-scan';
  const directory = path.join(ROOT, logical);
  assert(fs.lstatSync(directory).isSymbolicLink(), 'existing isolated build link');
  assert.equal(fs.readlinkSync(directory), BUILD_ROOT, 'exact existing build link target');
  assert.equal(fs.realpathSync(directory), BUILD_ROOT, 'exact physical build directory');
  assert.equal(fs.realpathSync(BUILD_ROOT), BUILD_ROOT, 'physical build root');
  return {logicalPath: logical, physicalRoot: BUILD_ROOT, symlinkTarget: BUILD_ROOT};
}
function inputPin(file) {
  if (file !== BUILD_ID) return pinFile(ROOT, file);
  buildDirectoryBinding();
  return {...pinFile(BUILD_ROOT, 'BUILD_ID'), path: BUILD_ID};
}
function readBuildId() {
  buildDirectoryBinding();
  return readOrdinary(BUILD_ROOT, 'BUILD_ID').toString('utf8').trim();
}
const BUILD_LOG = 'output/nms-l02-p060-product-20260927/admission/production-build-v1.log';
const BUILD_RECEIPT = 'output/nms-l02-p060-product-20260927/admission/production-build-receipt-v1.json';
const ACTIVATION = 'apps/web/lib/nms-l02-p060-admission-activation.ts';
const HOST = 'catalog/nms-l02-admission-v1/host-v10.json';
const PAGE_PROOF = 'work/g678-workflow/candidates/shared-nms002-l02-p060-v1.json';
const P060_ASSETS = 'apps/web/lib/nms-l02-p060-assets.server.ts';
const P058_ASSETS = 'apps/web/lib/nms-l02-p058-assets.server.ts';
const P057_ASSETS = 'apps/web/lib/nms-l02-p057-assets.server.ts';
const P056_ASSETS = 'apps/web/lib/nms-l02-p056-assets.server.ts';
const P055_ASSETS = 'apps/web/lib/nms-l02-ts-pilot-assets.server.ts';
const P052_PLANS = 'packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts';
const PREDECESSOR_READER = 'apps/web/lib/nms-l02-p056-predecessor-assets.server.ts';
const INPUTS = Object.freeze([
  'scripts/check-nms-l02-p060-production-negative-v1.mjs', ACTIVATION,
  'apps/web/lib/nms-l02-p060-admission.server.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p060/page.tsx',
  'apps/web/components/nms-l02-p056-host-v1.css',
  'apps/web/components/nms-l02-p057-host-v1.css',
  'apps/web/components/nms-l02-p058-host-v1.css',
  'apps/web/components/nms-l02-p060-host-v1.css',
  'apps/web/app/migration-assets/nms-l02-p060/[asset]/route.ts',
  'apps/web/app/migration-assets/nms-l02-p058/[asset]/route.ts',
  'apps/web/app/migration-assets/nms-l02-p057/[asset]/route.ts',
  'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
  'apps/web/app/migration-assets/nms-l02-p056-predecessors/[asset]/route.ts',
  P060_ASSETS, P058_ASSETS, P057_ASSETS, P056_ASSETS, P055_ASSETS, PREDECESSOR_READER, P052_PLANS,
  'packages/demos/private-current-js-registry.json', HOST, PAGE_PROOF,
  'output/nms-l02-p060-product-20260927/admission/host-v10-seal-receipt.json',
  'output/nms-l02-p060-product-20260927/admission/page-prepare-receipt.json',
  'apps/web/lib/nms-l02-source-resource-host.ts', BUILD_ID, BUILD_LOG, BUILD_RECEIPT,
]);
const relativePage = '/migration-status/g678-calibration/' + ID;
const manifest = (file, name) => {
  const source = readOrdinary(ROOT, file).toString('utf8');
  const start = source.indexOf(`'${name}':`);
  assert(start >= 0, `${file}: ${name} pin`);
  const block = source.slice(start, start + 500);
  const bytes = Number(block.match(/\bbytes:\s*(\d+)/u)?.[1]);
  const sha256 = block.match(/\bsha256:\s*'([a-f0-9]{64})'/u)?.[1];
  assert(Number.isSafeInteger(bytes) && bytes > 0 && sha256,
    `${file}: ${name} complete pin`);
  return {bytes, sha256};
};
function p060Domains() {
  const source = readOrdinary(ROOT, P060_ASSETS).toString('utf8');
  const match = source.match(/export const P060_ASSET_PINS = Object\.freeze\((\{[\s\S]*?\}) as const\);/u);
  assert(match, 'P060 generated source asset manifest parse');
  const pins = JSON.parse(match[1]);
  const expected = [104, 205, 217, 245, 258, 275, 296, 322, 354, 368, 391]
    .map(id => `sprite-${id}.mp3`);
  assert.deepEqual(Object.keys(pins), expected, 'exact eleven source stream domains');
  return expected.map(name => {
    const pin = pins[name];
    assert(Number.isSafeInteger(pin.bytes) && pin.bytes > 0 &&
      /^[a-f0-9]{64}$/u.test(pin.sha256) &&
      pin.path === `output/nms-l02-p060-source-20260927/extraction/audio/${name}` &&
      pin.contentType === 'audio/mpeg', `P060 source asset ${name}`);
    readPin(ROOT, pin);
    return {name, bytes: pin.bytes, sha256: pin.sha256};
  });
}
function p052Domains() {
  const plansText = readOrdinary(ROOT, P052_PLANS).toString('utf8');
  const match = plansText.match(/export const P052_AUDIO_PLANS=(\{[\s\S]*?\}) as const;\s*export const P052_AUDIO_WINDOWS=/u);
  assert(match, 'P052 generated plan parse');
  const plans = JSON.parse(match[1]);
  const expected = ['sprite-8', 'sprite-318', 'sprite-327',
    'sprite-347', 'sprite-349', 'sprite-350'];
  assert.deepEqual(Object.keys(plans), expected, 'exact six source domains');
  const reader = readOrdinary(ROOT, PREDECESSOR_READER).toString('utf8');
  for (const domain of expected) assert(reader.includes(`'${domain}'`),
    `predecessor reader name ${domain}`);
  return expected.map(domain => {
    const plan = plans[domain];
    assert(Number.isSafeInteger(plan.inputBytes) && plan.inputBytes > 0 &&
      /^[a-f0-9]{64}$/u.test(plan.inputSha256), `P052 plan ${domain}`);
    return {name: `p052-${domain}.mp3`, bytes: plan.inputBytes, sha256: plan.inputSha256};
  });
}
function routes() {
  const pages = ['en', 'es', ''].flatMap(locale => {
    const page = (locale ? `/${locale}` : '') + relativePage;
    return [page, `${page}?frame=17`];
  });
  const p060 = p060Domains();
  const p058 = manifest(P058_ASSETS, 'main.mp3');
  const p057 = manifest(P057_ASSETS, 'main.mp3');
  const p056 = manifest(P056_ASSETS, 'main.mp3');
  const p055Script = manifest(P055_ASSETS, 'typography.js');
  const p055Audio = manifest(P055_ASSETS, 'main.mp3');
  const resource = (base, name, sha256, kind) => ({
    path: `${base}/${name}?sha256=${sha256}`, kind,
  });
  const main = p060.map(row => resource('/migration-assets/nms-l02-p060', row.name, row.sha256, 'audio'));
  const predecessors = [resource('/migration-assets/nms-l02-p058', 'main.mp3', p058.sha256, 'audio'),
   resource('/migration-assets/nms-l02-p057', 'main.mp3', p057.sha256, 'audio'),
   resource('/migration-assets/nms-l02-p056', 'main.mp3', p056.sha256, 'audio'), resource('/migration-assets/nms-l02-p056-predecessors',
    'p055-typography.js', p055Script.sha256, 'script'),
  resource('/migration-assets/nms-l02-p056-predecessors',
    'p055-main.mp3', p055Audio.sha256, 'audio'),
  ...p052Domains().map(row => resource('/migration-assets/nms-l02-p056-predecessors',
    row.name, row.sha256, 'audio'))];
  assert.equal(pages.length, 6);
  assert.equal(main.length, 11);
  assert.equal(predecessors.length, 11);
  const result = [...pages.map(page => ({path: page, kind: 'page'})), ...main, ...predecessors];
  assert.equal(result.length, 28);
  assert.equal(new Set(result.map(row => row.path)).size, 28);
  return result;
}
function verifyActivation() {
  const text = readOrdinary(ROOT, ACTIVATION).toString('utf8');
  const match = text.match(/export const NMS_L02_P060_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
  assert(match, 'P060 activation parse');
  const activation = JSON.parse(match[1]);
  assert.equal(activation.schemaVersion, 1);
  assert.equal(activation.stage, 'candidate');
  assert.equal(activation.host.path, HOST);
  assert.equal(activation.page.path, PAGE_PROOF);
  readPin(ROOT, activation.host);
  readPin(ROOT, activation.page);
  readPin(ROOT, activation.predecessor);
  const sealed = JSON.parse(readOrdinary(ROOT,
    'output/nms-l02-p060-product-20260927/admission/host-v10-seal-receipt.json'));
  const prepared = JSON.parse(readOrdinary(ROOT,
    'output/nms-l02-p060-product-20260927/admission/page-prepare-receipt.json'));
  assert.deepEqual(sealed.host, activation.host, 'sealed host pin');
  assert.deepEqual(prepared.proof, activation.page, 'prepared proof pin');
  assert.equal(sealed.status, 'NMS_L02_HOST_V10_SEALED');
  assert.equal(prepared.status, 'P060_PREPARED_NOT_REGISTERED');
  return activation;
}
function candidateHeaders(kind, mode) {
  if (mode === 'anonymous') return {};
  const script = kind === 'script', page = kind === 'page';
  return {host: '127.0.0.1:3332',
    referer: `${ORIGIN}/en${relativePage}`, origin: ORIGIN,
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': page ? 'navigate' : 'cors',
    'sec-fetch-dest': page ? 'document' : script ? 'script' : 'empty'};
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
  } finally {await reader.cancel().catch(() => {}); reader.releaseLock();}
}
async function probe(route, method, mode) {
  const response = await fetch(ORIGIN + route.path, {
    method, headers: candidateHeaders(route.kind, mode), redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
  const bodyBytes = await boundedBody(response);
  const pass = response.status === 404 && bodyBytes < 1000 &&
    response.headers.get('location') === null;
  return {path: route.path, kind: route.kind, method, headersMode: mode,
    status: response.status, bodyBytes, contentType: response.headers.get('content-type'),
    redirected: response.headers.get('location') !== null, pass};
}
function runPath(slug) {
  const relative = `output/nms-l02-p060-product-20260927/production/${slug}.json`;
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  assert(!fs.existsSync(file), `immutable run already exists: ${relative}`);
  return {relative, file};
}

const args = process.argv.slice(2);
assert(args.length === 2 && args[0] === '--run' &&
  /^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]),
  'Usage: node scripts/check-nms-l02-p060-production-negative-v1.mjs --run <unique-slug>');
const output = runPath(args[1]);
const receipt = {schemaVersion: 1, kind: 'nms-l02-p060-local-production-negative-v1',
  origin: ORIGIN, status: 'running', startedAt: new Date().toISOString(),
  buildLog: BUILD_LOG, scope: 'local production-mode server only; no provider access or deployment',
  inputsBefore: [], inputsAfter: [], buildIdBefore: null, buildIdAfter: null,
  activation: null, expectedCases: 112, results: [], errors: []};
try {
  receipt.directoryBinding = buildDirectoryBinding();
  receipt.inputsBefore = INPUTS.map(inputPin);
  receipt.buildIdBefore = readBuildId();
  assert(/^[a-zA-Z0-9_-]+$/u.test(receipt.buildIdBefore), 'nonempty production BUILD_ID');
  receipt.activation = verifyActivation();
  const build = JSON.parse(readOrdinary(ROOT, BUILD_RECEIPT));
  assert.equal(build.exitCode, 0, 'successful local production build');
  assert.equal(build.inputsStable, true);
  assert.equal(build.configRestored, true);
  assert.deepEqual(build.buildId, inputPin(BUILD_ID), 'exact successful build id');
  for (const pin of build.inputsAfter) readPin(ROOT, pin);
  assert.equal(build.selectedNonSecretEnvironment.NODE_ENV, 'production');
  assert.equal(build.selectedNonSecretEnvironment.HELP_MATH_ALG_P001_PRODUCTION_SCAN, '1');
  const paths = routes();
  for (const route of paths) for (const method of ['GET', 'HEAD'])
    for (const mode of ['anonymous', 'candidate-shaped-request']) {
      try {receipt.results.push(await probe(route, method, mode));}
      catch (error) {receipt.results.push({path: route.path, kind: route.kind,
        method, headersMode: mode, pass: false, error: String(error)});}
    }
} catch (error) {receipt.errors.push(String(error));}
finally {
  try {
    receipt.inputsAfter = INPUTS.map(inputPin);
    receipt.buildIdAfter = readBuildId();
  } catch (error) {receipt.errors.push(`post-check pin: ${String(error)}`);}
  receipt.inputStable = JSON.stringify(receipt.inputsBefore) === JSON.stringify(receipt.inputsAfter) &&
    receipt.buildIdBefore === receipt.buildIdAfter;
  receipt.status = receipt.errors.length === 0 && receipt.inputStable &&
    receipt.results.length === receipt.expectedCases && receipt.results.every(row => row.pass)
    ? 'technical-pass-not-deployment' : 'failed';
  receipt.finishedAt = new Date().toISOString();
  fs.writeFileSync(output.file, JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
  console.log(JSON.stringify({status: receipt.status, expectedCases: receipt.expectedCases,
    passed: receipt.results.filter(row => row.pass).length, failed: receipt.results.filter(row => !row.pass).length,
    inputStable: receipt.inputStable, errors: receipt.errors, receipt: pinFile(ROOT, output.relative)}));
  if (receipt.status === 'failed') process.exitCode = 1;
}
