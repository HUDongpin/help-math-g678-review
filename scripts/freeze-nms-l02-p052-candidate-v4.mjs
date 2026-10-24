import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = 'shared-nms002-l02-p052';
const calibrationId = 'g678-nms-l02-p052-percent-practice-current-js-v1';
const oldFile = `catalog/product-bridge-calibrations/${calibrationId}-compile-v3.json`;
const newFile = `catalog/product-bridge-calibrations/${calibrationId}-compile-v4.json`;
const evidence = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const changed = 'packages/demos/src/nms-l02-p052-player-v1.tsx';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const resolve = value => path.resolve(root, value);
const read = value => JSON.parse(fs.readFileSync(resolve(value), 'utf8'));

function pin(value) {
  const file = resolve(value), before = fs.lstatSync(file, {bigint: true});
  assert.ok(before.isFile() && before.nlink === 1n);
  assert.equal(fs.realpathSync(file), file);
  const bytes = fs.readFileSync(file), after = fs.lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mode', 'mtimeNs', 'nlink']) assert.equal(before[key], after[key]);
  return {path: file.startsWith(root + '/') ? path.relative(root, file) : file,
    bytes: bytes.length, sha256: sha(bytes)};
}
function verify(binding) {
  const actual = pin(binding.path);
  assert.equal(actual.bytes, binding.bytes, binding.path);
  assert.equal(actual.sha256, binding.sha256, binding.path);
}
function put(value, data) {
  const file = resolve(value);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', {flag: 'wx'});
  return pin(file);
}

if (process.argv.includes('--check')) {
  const packet = read(newFile);
  for (const binding of [...packet.inputs, ...packet.outputs]) verify(binding);
  console.log(JSON.stringify({status: 'PASS', freeze: pin(newFile), bindings: packet.inputs.length + packet.outputs.length}));
  process.exit(0);
}

assert.equal(pin(oldFile).sha256, '52bfa2e8519c44a4eb1f51a035f809d90a96cb2eb1b668c594a6e2b57b2666f7');
assert.ok(!fs.existsSync(resolve(newFile)));
const old = read(oldFile);
assert.ok([...old.inputs, ...old.outputs].some(binding => binding.path === changed));
for (const binding of [...old.inputs, ...old.outputs]) if (binding.path !== changed) verify(binding);

const run = fs.mkdtempSync(path.join(evidence, 'p052-freeze-v4-'));
const tests = fs.readdirSync(resolve('packages/demos/tests'))
  .filter(name => /^nms-l02-p052-.*\.test\.tsx?$/.test(name))
  .map(name => 'packages/demos/tests/' + name);
const scriptTests = fs.readdirSync(resolve('scripts/lib'))
  .filter(name => /^nms-l02-p052-.*\.test\.mjs$/.test(name))
  .map(name => 'scripts/lib/' + name);
const result = spawnSync(resolve('node_modules/.bin/tsx'), ['--test', ...tests, ...scriptTests],
  {cwd: root, encoding: 'utf8', timeout: 120000});
const log = path.join(run, 'tests.log');
fs.writeFileSync(log, (result.stdout ?? '') + (result.stderr ?? ''), {flag: 'wx'});
assert.equal(result.status, 0, log);
const check = put(path.join(run, 'checks.json'),
  {createdAt: new Date().toISOString(), exitCode: result.status, log: pin(log), tests: [...tests, ...scriptTests]});

const artifacts = old.entry.artifacts;
const inputs = [...old.inputs.filter(binding => binding.path !== old.sourceSpec.path)
  .map(binding => binding.path === changed ? pin(changed) : binding),
  pin(oldFile), pin(fileURLToPath(import.meta.url)), check, pin(log)];
const outputs = old.outputs.filter(binding => ![artifacts.memberManifest.path, artifacts.sourceRun.path].includes(binding.path))
  .map(binding => binding.path === changed ? pin(changed) : binding);
const sourceSpec = put(path.join(run, 'source-spec.json'), {
  schemaVersion: 1, animationId: id, source: old.source, sourceXml: old.sourceXml,
  predecessor: pin(oldFile), change: 'Re-publish the final P052 Replay pause state after the host toolbar reset; preserve source state and reduced-motion pause.',
  inputs, outputs, scaleOutAuthorized: false,
});
const runRoot = `work/g678-shared-page-factory/${calibrationId}-compile-v4`;
const sourceRun = put(runRoot + '/run-manifest.json',
  {schemaVersion: 1, source: old.source, sourceSpec, inputs, outputs, scaleOutAuthorized: false});
const memberManifest = put(runRoot + `/members/${id}/member-manifest.json`, {
  schemaVersion: 1, animationId: id, source: old.source, sourceSpec, sourceRun, inputs, outputs,
  originalRuntimeAccepted: false, audioAccepted: false, humanAccepted: false,
  ownerAccepted: false, strictComplete: false, published: false,
});
const binding = {...artifacts, sourceRun, memberManifest};
const entry = {...old.entry, artifacts: binding};
const packet = {...old, sourceSpec, entry, inputs: [...inputs, sourceSpec],
  outputs: [...outputs, sourceRun, memberManifest],
  selectedPages: old.selectedPages.map(page => ({...page,
    runtime: {...page.runtime, rendererBinding: binding}}))};
for (const item of [...packet.inputs, ...packet.outputs]) verify(item);
const freeze = put(newFile, packet);
const fragment = put('catalog/product-bridge-calibrations/g678-nms-l02-p052-prepared-registration-v4.json', {
  calibrationId, deploymentScope: 'local-only', freezeManifest: freeze.path,
  freezeManifestBytes: freeze.bytes, freezeManifestSha256: freeze.sha256, entries: [entry],
});
console.log(JSON.stringify({status: 'PASS-frozen-successor', freeze, fragment, run, gateInstalled: false}));
