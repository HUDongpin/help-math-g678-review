import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { compilePage } from '../compiler/compile-page.mjs';

const cli = fileURLToPath(new URL('../compiler/compile-lesson.mjs', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'hfr-source-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'sources/NMS002/L1'), { recursive: true });
  const xml = '<LessonName>Source guard</LessonName><CourseName>NMS</CourseName>';
  writeFileSync(join(dir, 'sources/NMS002/L1/index.xml'), xml);
  const members = [1, 2].map((i) => {
    const bytes = Buffer.from(`deliberately unparseable fixture ${i}`);
    const path = `HELP_COURSES/NMS002/L1/p${i}.swf`;
    writeFileSync(join(dir, path.replace('HELP_COURSES', 'sources')), bytes);
    return { animationId: `shared-nms002-l01-p00${i}`, source: { path, sha256: hash(bytes) } };
  });
  const release = { moduleCode: 'NMS002', moduleLesson: 1, sourceLesson: { sha256: hash(xml) }, members };
  const manifest = join(dir, 'manifest.json');
  const save = () => writeFileSync(manifest, JSON.stringify({ releases: [release] }));
  save();
  const run = (...extra) => spawnSync(process.execPath, [cli, manifest, join(dir, 'sources'), 'NMS002', '1', join(dir, 'candidate'), ...extra], { encoding: 'utf8' });
  return { dir, release, save, run };
}

test('a later mismatched source fails before any output or parse of the first source', (t) => {
  const f = fixture(t);
  f.release.members[1].source.sha256 = '0'.repeat(64); f.save();
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /source SHA-256 mismatch: shared-nms002-l01-p002/);
  assert.deepEqual(readdirSync(f.dir).sort(), ['manifest.json', 'sources']);
});

test('existing generated evidence is never replaced', (t) => {
  const f = fixture(t);
  mkdirSync(join(f.dir, 'candidate')); writeFileSync(join(f.dir, 'candidate/sentinel'), 'keep original');
  const result = f.run();
  assert.notEqual(result.status, 0); assert.match(result.stderr, /output already exists/);
  assert.equal(readFileSync(join(f.dir, 'candidate/sentinel'), 'utf8'), 'keep original');
});

test('unknown selection and XML drift fail before generation', (t) => {
  const f = fixture(t);
  let result = f.run('--only', 'shared-nms002-l01-p999');
  assert.notEqual(result.status, 0); assert.match(result.stderr, /unknown selected placement/);
  writeFileSync(join(f.dir, 'sources/NMS002/L1/index.xml'), '<changed/>');
  result = f.run();
  assert.notEqual(result.status, 0); assert.match(result.stderr, /course XML SHA-256 mismatch/);
  assert.equal(existsSync(join(f.dir, 'candidate')), false);
});

test('compilePage checks the exact bytes it consumes before parsing or output', (t) => {
  const f = fixture(t);
  assert.throws(() => compilePage({
    swfPath: join(f.dir, 'sources/NMS002/L1/p1.swf'), outDir: join(f.dir, 'page'),
    placement: { animationId: 'shared-nms002-l01-p001' }, expectedSha256: '0'.repeat(64),
  }), /source SHA-256 mismatch/);
  assert.equal(existsSync(join(f.dir, 'page')), false);
});

test('generation failure leaves staging diagnostics but no completed candidate', (t) => {
  const f = fixture(t);
  const result = f.run();
  assert.notEqual(result.status, 0); assert.match(result.stderr, /failed candidate retained at/);
  assert.equal(existsSync(join(f.dir, 'candidate')), false);
  assert.equal(readdirSync(f.dir).filter((name) => name.startsWith('.candidate-staging-')).length, 1);
});
