import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const id = 'shared-nms002-l02-p064';
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const bindingRelative = `catalog/typography-v1/g678-page-bindings/${id}.prepared-v4.json`;
const outputRelative = `catalog/typography-v1/g678-checks/${id}.prepared-v4.json`;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = relative => fs.readFileSync(path.join(root, relative));
const run = (command, args) => {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8',
    env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: sourceRoot}, maxBuffer: 4 * 1024 * 1024});
  assert.equal(result.status, 0, `${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result.stdout;
};

const mode = process.argv[2];
assert.ok((mode === '--build' || mode === '--check') && process.argv.length === 3,
  'Use --build or --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot, 'Exact real source root required');
run(process.execPath, ['scripts/prepare-nms-l02-p064-typography-v1.mjs', '--check']);
const bindingBytes = read(bindingRelative);
const binding = JSON.parse(bindingBytes.toString('utf8'));
assert.equal(binding.preparationOnly, true);
assert.equal(binding.blocks.length, 175);
assert.equal(binding.implementation.files.length, 41);
assert.ok(binding.unresolved.length > 0);
const tests = [
  'packages/demos/tests/nms-l02-p064-presentation-candidate-v1.test.tsx',
  'packages/demos/tests/nms-l02-p064-quiz-state-candidate.test.ts',
  'packages/demos/tests/nms-l02-p064-audio-candidates-v1.test.ts',
  'packages/demos/tests/nms-l02-p064-host-score-candidate.test.ts',
];
const unitOutput = run('node_modules/.bin/tsx', ['--test', ...tests]);
const match = unitOutput.match(/ℹ tests (\d+)[\s\S]*?ℹ pass (\d+)[\s\S]*?ℹ fail (\d+)/u);
assert.ok(match, 'Node test summary missing');
assert.deepEqual(match.slice(1).map(Number), [13, 13, 0]);
run('node_modules/.bin/tsc', ['--noEmit', '-p', 'packages/demos/tsconfig.p064-candidate.json']);
const expected = {
  schemaVersion: 1,
  kind: 'g678-lesson-typography-preparation-check-v1',
  placementId: id, sourceSwfSha256: binding.sourceSwfSha256,
  binding: {path: bindingRelative, sha256: sha(bindingBytes)},
  focusedChecks: {sourceCatalogAndBinding: 'passed', candidateUnitTests: '13/13 passed',
    candidateFocusedTypecheck: 'passed', auditOnlyMemoryHostScore: 'passed'},
  checks: {semanticText: 'not-run', mathSemantics: 'not-run', timingAndReplay: 'not-run',
    teachingTextDisposition: 'not-run', hostIntegration: 'not-run',
    responsiveTypography: 'not-run', accessibility: 'not-run', bilingualPolicy: 'not-run',
    performance: 'not-run', lifecycle: 'not-run', resourceStability: 'not-run'},
  candidateScope: 'local-only-unregistered-P064',
  technicalTypographyPassed: false, humanReviewPassed: false,
  currentJsRegistrationEffect: 'none',
  artifacts: [binding.sourceRiskEvidence.sourceTextReconciliation,
    binding.sourceRiskEvidence.hostAudioMapping],
};
const output = path.join(root, outputRelative);
if (mode === '--build') {
  fs.writeFileSync(output, JSON.stringify({...expected, checkedAt: new Date().toISOString()}, null, 2) + '\n',
    {flag: 'wx'});
} else {
  const actual = JSON.parse(fs.readFileSync(output, 'utf8'));
  assert.ok(Number.isFinite(Date.parse(actual.checkedAt)) && Date.parse(actual.checkedAt) <= Date.now(),
    'Invalid P064 typography preparation check time');
  delete actual.checkedAt;
  assert.deepEqual(actual, expected, 'P064 typography preparation evidence drift');
}
console.log(JSON.stringify({status: 'PASS-preparation-only', mode, output,
  sha256: sha(fs.readFileSync(output)), technicalTypographyPassed: false}));
