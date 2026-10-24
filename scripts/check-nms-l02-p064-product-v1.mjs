#!/usr/bin/env node
/** Local production-mode denial check. No remote origin or provider access. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile, readOrdinary, readPin} from '../lib/g678-admission-proof.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://127.0.0.1:3332';
const ID = 'shared-nms002-l02-p064';
const BUILD_ID = 'apps/web/.next-alg-p001-production-scan/BUILD_ID';
const BUILD_ROOT = '/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1';
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
const FORBIDDEN_BUNDLE_MARKERS=Object.freeze([
 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c',
 'P064_PRESENTATION_DATA',
 'nms-l02-p064-presentation-data-v1',
 'nms-l02-p064-product-candidate.server',
 'P064_PRODUCT_CANDIDATE:',
 'P064QuizCandidate',
 'What is the name for the shaded part of this fraction?',
]);
/** Only compiled JavaScript is scanned: trace manifests may name source files
 * without containing their private quiz payload or source-reader implementation. */
export function scanProductionBundles(buildRoot=BUILD_ROOT){
  const matches=[];let files=0,bytes=0;
  for(const subdir of ['server','static']){
    const start=path.join(buildRoot,subdir);
    assert(fs.statSync(start).isDirectory(),`production ${subdir} directory`);
    const pending=[start];
    while(pending.length){
      const dir=pending.pop();
      for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
        assert(!entry.isSymbolicLink(),'no symlink in compiled JavaScript scan');
        const file=path.join(dir,entry.name);
        if(entry.isDirectory()){pending.push(file);continue;}
        if(!entry.isFile()||!/[.]m?js$/u.test(entry.name))continue;
        const content=fs.readFileSync(file);files++;bytes+=content.length;
        for(const marker of FORBIDDEN_BUNDLE_MARKERS)if(content.includes(Buffer.from(marker)))
          matches.push({path:path.relative(buildRoot,file),marker});
      }
    }
  }
  assert(files>0&&bytes>0,'compiled JavaScript scanned');
  return{files,bytes,markers:FORBIDDEN_BUNDLE_MARKERS,matches};
}
const BUILD_LOG = 'output/nms-l02-p064-product-20260928/admission/production-build-v1.log';
const BUILD_RECEIPT = 'output/nms-l02-p064-product-20260928/admission/production-build-receipt-v1.json';
const ACTIVATION = 'apps/web/lib/nms-l02-p062-admission-activation.ts';
const HOST = 'catalog/nms-l02-admission-v1/host-v13.json';
const PAGE_PROOF = 'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json';
const P062_ASSETS = 'apps/web/lib/nms-l02-p062-assets.server.ts';
const P061_ASSETS = 'apps/web/lib/nms-l02-p061-assets.server.ts';
const P060_ASSETS = 'apps/web/lib/nms-l02-p060-assets.server.ts';
const P058_ASSETS = 'apps/web/lib/nms-l02-p058-assets.server.ts';
const P057_ASSETS = 'apps/web/lib/nms-l02-p057-assets.server.ts';
const P056_ASSETS = 'apps/web/lib/nms-l02-p056-assets.server.ts';
const P055_ASSETS = 'apps/web/lib/nms-l02-ts-pilot-assets.server.ts';
const P052_PLANS = 'packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts';
const PREDECESSOR_READER = 'apps/web/lib/nms-l02-p056-predecessor-assets.server.ts';
const P064_AUDIO_INDEX = {path:'migrations/shared-nms002-l02-p064/audit/audio-source-candidates-v1.json',
 bytes:109156,sha256:'60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58'};
const INPUTS = Object.freeze([
 'scripts/check-nms-l02-p064-product-v1.mjs',
 'scripts/check-nms-l02-p064-product-v1.test.mjs',
 'scripts/build-and-probe-nms-l02-p064-product-v1.py',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
 'apps/web/lib/nms-l02-p064-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p064-product-host.production-stub.tsx',
 'apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts',
 'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx',
 'packages/demos/src/nms-l02-p064-quiz-candidate.css',
 'packages/demos/src/nms-l02-p064-presentation-data-v1.ts',
 'apps/web/lib/nms-l02-p064-question-audio-access.ts',
 'apps/web/lib/nms-l02-p064-question-audio-response.ts',
 'apps/web/lib/nms-l02-p064-question-audio-source.ts',
 'apps/web/lib/nms-l02-p064-question-audio.production-stub.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/[folder]/[question]/[option]/route.ts',
 P064_AUDIO_INDEX.path,
 ACTIVATION,
 'apps/web/lib/nms-l02-p062-admission.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p062/page.tsx',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p061/page.tsx',
 'apps/web/components/nms-l02-p056-host-v1.css',
 'apps/web/components/nms-l02-p057-host-v1.css',
 'apps/web/components/nms-l02-p058-host-v1.css',
 'apps/web/components/nms-l02-p060-host-v1.css',
 'apps/web/components/nms-l02-p061-host-v1.css',
 'apps/web/components/nms-l02-p062-host-v1.css',
 'apps/web/app/migration-assets/nms-l02-p062/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p061/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p060/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p058/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p057/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
 'apps/web/app/migration-assets/nms-l02-p056-predecessors/[asset]/route.ts',
 P062_ASSETS, P061_ASSETS, P060_ASSETS, P058_ASSETS, P057_ASSETS, P056_ASSETS,
 P055_ASSETS, PREDECESSOR_READER, P052_PLANS,
 'packages/demos/private-current-js-registry.json', HOST, PAGE_PROOF,
 'output/nms-l02-p062-product-20260928/admission/host-v13-seal-receipt.json',
 'output/nms-l02-p062-product-20260928/admission/page-prepare-receipt.json',
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
function p062Domains() {
  const source = readOrdinary(ROOT, P062_ASSETS).toString('utf8');
  const match = source.match(/export const P062_ASSET_PINS = Object\.freeze\((\{[\s\S]*?\}) as const\);/u);
  assert(match, 'P062 generated source asset manifest parse');
  const pins = JSON.parse(match[1]);
  const expected = [85, 138, 150, 178, 192, 209, 230, 256, 288, 302, 315]
    .map(id => `sprite-${id}.mp3`);
  assert.deepEqual(Object.keys(pins), expected, 'exact eleven source stream domains');
  return expected.map(name => {
    const pin = pins[name];
    assert(Number.isSafeInteger(pin.bytes) && pin.bytes > 0 &&
      /^[a-f0-9]{64}$/u.test(pin.sha256) &&
      pin.path === `output/nms-l02-p062-source-20260928/extraction/audio/${name}` &&
      pin.contentType === 'audio/mpeg', `P062 source asset ${name}`);
    readPin(ROOT, pin);
    return {name, bytes: pin.bytes, sha256: pin.sha256};
  });
}
function p061Domains() {
  const source = readOrdinary(ROOT, P061_ASSETS).toString('utf8');
  const match = source.match(/export const P061_ASSET_PINS = Object\.freeze\((\{[\s\S]*?\}) as const\);/u);
  assert(match, 'P061 generated source asset manifest parse');
  const pins = JSON.parse(match[1]);
  const expected = [87, 134, 146, 174, 188, 205, 226, 252, 284, 298, 315]
    .map(id => `sprite-${id}.mp3`);
  assert.deepEqual(Object.keys(pins), expected, 'exact eleven P061 source stream domains');
  return expected.map(name => {
    const pin = pins[name];
    assert(Number.isSafeInteger(pin.bytes) && pin.bytes > 0 &&
      /^[a-f0-9]{64}$/u.test(pin.sha256) &&
      pin.path === `output/nms-l02-p061-source-20260927/extraction/audio/${name}` &&
      pin.contentType === 'audio/mpeg', `P061 source asset ${name}`);
    readPin(ROOT, pin);
    return {name, bytes: pin.bytes, sha256: pin.sha256};
  });
}
function p060Domains() {
  const source = readOrdinary(ROOT, P060_ASSETS).toString('utf8');
  const match = source.match(/export const P060_ASSET_PINS = Object\.freeze\((\{[\s\S]*?\}) as const\);/u);
  assert(match, 'P060 generated source asset manifest parse');
  const pins = JSON.parse(match[1]);
  const expected = [104, 205, 217, 245, 258, 275, 296, 322, 354, 368, 391]
    .map(id => `sprite-${id}.mp3`);
  assert.deepEqual(Object.keys(pins), expected, 'exact eleven P060 source stream domains');
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
function p064AudioRoutes() {
  const index = JSON.parse(readPin(ROOT, P064_AUDIO_INDEX));
  assert.equal(index.schemaVersion, 1);
  assert.equal(index.animationId, ID);
  assert.equal(index.source?.sha256,
    'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c');
  assert.equal(index.sourceMediaRows.length, 350, '35 questions times EA/SA and five cues');
  const routes = index.sourceMediaRows.map(row => {
    assert(['EA','SA'].includes(row.folderCode) && Number.isInteger(row.questionId) &&
      row.questionId >= 1 && row.questionId <= 35 &&
      Number.isSafeInteger(row.bytes) && row.bytes > 0 && /^[a-f0-9]{64}$/u.test(row.sha256),
      'bounded source audio row');
    const stem = '/flash-assets/g678-local/shared-nms002-l02-p064';
    if (row.role === 'question') {
      assert.equal(row.option, null);
      return {path:`${stem}/question-audio/${row.folderCode}/${row.questionId}`,kind:'audio'};
    }
    assert.equal(row.role,'option');assert(/^[A-D]$/u.test(row.option));
    return {path:`${stem}/option-audio/${row.folderCode}/${row.questionId}/${row.option}`,kind:'audio'};
  });
  assert.equal(new Set(routes.map(row=>row.path)).size,350,'every source audio URL once');
  for(const folder of ['EA','SA'])for(let question=1;question<=35;question++){
    const prefix=`/flash-assets/g678-local/shared-nms002-l02-p064/`;
    assert(routes.some(row=>row.path===`${prefix}question-audio/${folder}/${question}`));
    for(const option of ['A','B','C','D'])assert(routes.some(row=>
      row.path===`${prefix}option-audio/${folder}/${question}/${option}`));
  }
  return routes;
}
export function routes() {
  const p064Pages=['en','es',''].flatMap(locale=>{
    const page=(locale?`/${locale}`:'')+relativePage;
    return ['', '?seed=0', '?seed=9713', '?seed=9714', '?seed=4294967295',
      '?seed=4294967296', '?frame=17'].map(query=>({path:page+query,kind:'page'}));
  });
  const p062Pages=['en','es',''].flatMap(locale=>{
    const page=(locale?`/${locale}`:'')+'/migration-status/g678-calibration/shared-nms002-l02-p062';
    return ['', '?frame=17'].map(query=>({path:page+query,kind:'page'}));
  });
  const p062=p062Domains(),p061=p061Domains(),p060=p060Domains();
  const p058=manifest(P058_ASSETS,'main.mp3'),p057=manifest(P057_ASSETS,'main.mp3'),
    p056=manifest(P056_ASSETS,'main.mp3'),p055Script=manifest(P055_ASSETS,'typography.js'),
    p055Audio=manifest(P055_ASSETS,'main.mp3');
  const resource=(base,name,sha256,kind)=>({path:`${base}/${name}?sha256=${sha256}`,kind});
  const predecessors=[...p062.map(row=>resource('/migration-assets/nms-l02-p062',row.name,row.sha256,'audio')),
    ...p061.map(row=>resource('/migration-assets/nms-l02-p061',row.name,row.sha256,'audio')),
    ...p060.map(row=>resource('/migration-assets/nms-l02-p060',row.name,row.sha256,'audio')),
    resource('/migration-assets/nms-l02-p058','main.mp3',p058.sha256,'audio'),
    resource('/migration-assets/nms-l02-p057','main.mp3',p057.sha256,'audio'),
    resource('/migration-assets/nms-l02-p056','main.mp3',p056.sha256,'audio'),
    resource('/migration-assets/nms-l02-p056-predecessors','p055-typography.js',p055Script.sha256,'script'),
    resource('/migration-assets/nms-l02-p056-predecessors','p055-main.mp3',p055Audio.sha256,'audio'),
    ...p052Domains().map(row=>resource('/migration-assets/nms-l02-p056-predecessors',
      row.name,row.sha256,'audio'))];
  assert.equal(p064Pages.length,21);assert.equal(p062Pages.length,6);
  assert.equal(predecessors.length,44);
  const malformed=[
    '/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/EA/0',
    '/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/SA/36',
    '/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/EA/1/E',
    '/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/SA/35/A?seed=0',
  ].map(path=>({path,kind:'audio'}));
  const result=[...p064Pages,...p062Pages,...p064AudioRoutes(),...malformed,...predecessors];
  assert.equal(result.length,425);
  assert.equal(new Set(result.map(row=>row.path)).size,result.length,'unique negative paths');
  return result;
}
function verifyActivation() {
  const text = readOrdinary(ROOT, ACTIVATION).toString('utf8');
  const match = text.match(/export const NMS_L02_P062_ADMISSION[^=]*=([\s\S]*?);\s*$/u);
  assert(match, 'P062 activation parse');
  const activation = JSON.parse(match[1]);
  assert.equal(activation.schemaVersion, 1);
  assert.equal(activation.stage, 'registered');
  assert.equal(activation.host.path, HOST);
  assert.equal(activation.page.path, PAGE_PROOF);
  readPin(ROOT, activation.host);
  readPin(ROOT, activation.page);
  readPin(ROOT, activation.predecessor);
  const sealed = JSON.parse(readOrdinary(ROOT,
    'output/nms-l02-p062-product-20260928/admission/host-v13-seal-receipt.json'));
  const prepared = JSON.parse(readOrdinary(ROOT,
    'output/nms-l02-p062-product-20260928/admission/page-prepare-receipt.json'));
  assert.deepEqual(sealed.host, activation.host, 'sealed host pin');
  assert(Array.isArray(prepared.outputs), 'prepared output list');
  const proofs = prepared.outputs.filter(pin => pin.path === PAGE_PROOF);
  assert.equal(proofs.length, 1, 'one prepared page proof');
  assert.deepEqual(proofs[0], activation.page, 'prepared proof pin');
  for (const pin of prepared.outputs) readPin(ROOT, pin);
  assert.equal(sealed.status, 'NMS_L02_HOST_V13_SEALED');
  assert.equal(prepared.status, 'P062_PREPARED_NOT_REGISTERED');
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
  const relative = `output/nms-l02-p064-product-20260928/production/${slug}.json`;
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  assert(!fs.existsSync(file), `immutable run already exists: ${relative}`);
  return {relative, file};
}

export function planProductionDenials() {
  const paths = routes();
  const inputs = INPUTS.filter(file => file !== BUILD_ID && file !== BUILD_LOG &&
    file !== BUILD_RECEIPT).map(pin => pinFile(ROOT, pin));
  return {schemaVersion: 1, kind: 'nms-l02-p064-product-production-denial-plan-v1',
    routeCount: paths.length, expectedCases: paths.length * 4,
    p064SourceAudioRoutes: p064AudioRoutes().length,
    p064MalformedAudioRoutes: 4,
    inputs, buildRoot: BUILD_ROOT, preservedHost: HOST, preservedPageProof: PAGE_PROOF};
}

async function runProductionDenials(slug) {
const output = runPath(slug);
const receipt = {schemaVersion: 1, kind: 'nms-l02-p064-local-production-negative-v1',
  origin: ORIGIN, status: 'running', startedAt: new Date().toISOString(),
  buildLog: BUILD_LOG, scope: 'local production-mode server only; no provider access or deployment',
  inputsBefore: [], inputsAfter: [], buildIdBefore: null, buildIdAfter: null,
  activation: null, expectedCases: 1700, results: [], errors: []};
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
  receipt.bundleScan = scanProductionBundles();
  assert.deepEqual(receipt.bundleScan.matches,[],
    'P064 source reader, quiz payload and candidate runtime absent from compiled JavaScript');
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--plan') {
    console.log(JSON.stringify(planProductionDenials()));
  } else {
    assert(args.length === 2 && args[0] === '--run' &&
      /^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]),
      'Usage: node scripts/check-nms-l02-p064-product-v1.mjs --plan | --run <unique-slug>');
    await runProductionDenials(args[1]);
  }
}
