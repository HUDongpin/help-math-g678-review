// Writes only beneath a fresh caller-selected evidence directory. Original
// audit fixtures are copied before the verifier writes verification.json.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [verifier, esbuild, evidence, mode = 'after'] = process.argv.slice(2).map((x, i) => i < 3 ? resolve(x) : x);
mkdirSync(evidence, { recursive: false });
const negative = '/Users/peter/Documents/Codex/2026-10-11/1/work/audit-impl/negative-fixture';
const push = value => {
  const payload = typeof value === 'string' ? Buffer.concat([Buffer.from([0]), Buffer.from(value), Buffer.from([0])]) : Buffer.from([7, value & 255, value >> 8 & 255, value >> 16 & 255, value >> 24 & 255]);
  return [0x96, payload.length & 255, payload.length >> 8, ...payload];
};
const setScore = value => [...push('score'), ...push(value), 0x1d];
const setArray = value => [...push('scores'), ...push(value), ...push(1), 0x42, 0x1d];
const setGlobal = value => [...push('_global'), 0x1c, ...push('settings'), ...push('score'), ...push(value), ...push(1), 0x43, 0x4f];
const missingCall = (target, method) => [...push(0), ...push(target), 0x1c, ...push(method), 0x52, 0x17, 0x07];
function fixture(name, bytecode, source) {
  const lesson = join(evidence, name), id = 'fixture'; const dir = join(lesson, 'pages', id); mkdirSync(dir, { recursive: true });
  const data = { schema: 'hfr-page/1', placement: { animationId: id }, source: { swfVersion: 6 }, stage: { width: 800, height: 600, fps: 12 }, dictionary: {}, root: { frameCount: bytecode.length, frames: bytecode.map((_, i) => [{ op: 'action', script: `s${i}` }]), labels: {} }, exports: {}, streams: [] };
  writeFileSync(join(dir, `${id}.data.json`), JSON.stringify(data));
  writeFileSync(join(dir, `${id}.bytecode.json`), JSON.stringify({ scripts: Object.fromEntries(bytecode.map((code, i) => [`s${i}`, Buffer.from([...code, 0]).toString('base64')])) }));
  writeFileSync(join(dir, `${id}.ts`), `export default function(h) { return { ${source.map((code, i) => `s${i}: ($, $$) => {${code}}`).join(',')} }; }`);
  return lesson;
}
const cases = [
  ['matching', fixture('matching', [[...setScore(1), 0x07]], ['$.score=1;h.stop($);']), 0],
  ['page-state', fixture('page-state', [[...setScore(1), 0x07]], ['$.score=2;h.stop($);']), mode === 'before' ? 0 : 1],
  ['array-state', fixture('array-state', [[...setArray(1), 0x07]], ['$.scores=h.arr(2);h.stop($);']), mode === 'before' ? 0 : 1],
  ['global-object', fixture('global-object', [[...setGlobal(1), 0x07]], ['$._global.settings=h.obj({score:2});h.stop($);']), mode === 'before' ? 0 : 1],
  ['transient-state', fixture('transient-state', [setScore(1), [...setScore(0), 0x07]], ['$.score=2;', '$.score=0;h.stop($);']), mode === 'before' ? 0 : 1],
  ['missing-shell', fixture('missing-shell', [missingCall('_root', 'unclassifiedCall')], ['h.callMethod($._root,"unclassifiedCall",[]);h.stop($);']), mode === 'before' ? 0 : 1],
  ['missing-builtin', fixture('missing-builtin', [missingCall('this', 'concat')], ['h.callMethod($.this,"concat",[]);h.stop($);']), mode === 'before' ? 0 : 1],
  ['missing-content', fixture('missing-content', [missingCall('this', 'unclassifiedCall')], ['h.callMethod($.this,"unclassifiedCall",[]);h.stop($);']), mode === 'before' ? 0 : 1],
];
const err = join(evidence, 'same-errors'); cpSync(negative, err, { recursive: true }); cases.push(['same-errors', err, 1]);
const empty = join(evidence, 'empty'); mkdirSync(join(empty, 'pages'), { recursive: true }); cases.push(['empty', empty, 1]);
if (mode !== 'before') {
  const failedReference = join(evidence, 'reference-errors-skip-generated');
  cpSync(negative, failedReference, { recursive: true });
  writeFileSync(join(failedReference, 'pages/shared-fixture/shared-fixture.ts'),
    'export default h => ({boom: () => {for (;;) {}}});');
  const later = join(failedReference, 'pages/z-after'); mkdirSync(later);
  for (const ext of ['data.json', 'bytecode.json', 'ts'])
    cpSync(join(evidence, 'matching/pages/fixture', `fixture.${ext}`), join(later, `z-after.${ext}`));
  cases.push(['reference-errors-skip-generated', failedReference, 1]);
  const failed = fixture('throw-then-continue', [[0x07]], ['$.rawFunction=()=>1;h.stop($);']);
  const pages = join(failed, 'pages');
  for (const [id, source] of [['a-throw', '$.rawFunction=()=>1;h.stop($);'], ['z-after', 'h.stop($);']]) {
    const dir = join(pages, id); mkdirSync(dir);
    for (const ext of ['data.json', 'bytecode.json']) cpSync(join(pages, 'fixture', `fixture.${ext}`), join(dir, `${id}.${ext}`));
    writeFileSync(join(dir, `${id}.ts`), `export default h => ({s0: ($,$$) => {${source}}});`);
  }
  // The middle fixture also throws; the final page must still be processed.
  cases.push(['throw-then-continue', failed, 1]);
}
const results = [];
for (const [name, lesson, expected] of cases) {
  const result = spawnSync(process.execPath, [verifier, lesson, join(evidence, 'tmp', name), esbuild], { encoding: 'utf8', timeout: 10000 });
  const report = JSON.parse(readFileSync(join(lesson, 'verification.json'), 'utf8'));
  const receipt = { name, expected, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, summary: report.summary, pages: report.pages };
  results.push(receipt); writeFileSync(join(evidence, 'results.json'), JSON.stringify(results, null, 2));
  assert.equal(result.status, expected, `${name}: ${result.stderr}`);
  if (name === 'same-errors') {
    assert.ok(report.pages[0].errorsInterp > 0 && !report.pages[0].same);
    if (mode === 'before') assert.ok(report.pages[0].errorsTs > 0);
    else {assert.equal(report.pages[0].errorsTs, null); assert.equal(report.pages[0].failure.phase, 'reference-runtime-errors');}
  }
  if (mode !== 'before' && name.startsWith('missing-')) assert.ok(report.pages[0].same && !report.pages[0].diagnosticsClean && !report.pages[0].passed);
  if (name === 'reference-errors-skip-generated') {
    assert.equal(report.summary.pages, 2); assert.equal(report.summary.passed, 1);
    assert.equal(report.pages[0].failure.phase, 'reference-runtime-errors');
    assert.equal(report.pages[0].errorsTs, null);
    assert.equal(report.pages[1].id, 'z-after'); assert.equal(report.pages[1].passed, true);
  }
  if (name === 'throw-then-continue') {
    assert.equal(report.summary.pages, 3); assert.equal(report.summary.passed, 1);
    assert.equal(report.pages[0].failure.phase, 'explore-typescript');
    assert.match(report.pages[0].failure.message, /unsupported raw function/);
    assert.equal(report.pages[2].id, 'z-after'); assert.equal(report.pages[2].passed, true);
  }
}
console.log(`${results.length} CLI ${mode} expectations passed; receipts: ${evidence}`);
