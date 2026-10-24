import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {prepareEmptyMediaDirectories} from './prepare-empty-media.mjs';

function fixture(t) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'g678-empty-media-')));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const key = 'shared-nms002-l01-p001';
  const page = `work/g678-shared-page-factory/fixture/members/${key}`;
  const put = (relative, value) => {
    const bytes = Buffer.from(JSON.stringify(value));
    mkdirSync(path.dirname(path.join(root, relative)), {recursive: true});
    writeFileSync(path.join(root, relative), bytes);
    return {path: relative, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')};
  };
  const data = {dictionary: {}, streams: []};
  const closure = {animationId: key, data: null, media: []};
  const artifacts = {kind: 'generated-typescript-hfr-v1', data: null, closure: null};
  const registry = {schemaVersion: 2, calibrations: [{entries: [{key, artifacts}]}]};
  const seal = () => {
    artifacts.data = closure.data = put(`${page}/${key}.data.json`, data);
    artifacts.closure = put(`${page}/artifact-closure.json`, closure);
    put('packages/demos/private-current-js-registry.json', registry);
  };
  seal();
  return {root, page, media: path.join(root, page, 'media'), data, closure, artifacts, registry, put, seal};
}

test('check is read-only; create restores only an exact empty closure and is idempotent', t => {
  const f = fixture(t), before = readFileSync(path.join(f.root, 'packages/demos/private-current-js-registry.json'));
  assert.equal(prepareEmptyMediaDirectories(f.root).missing.length, 1);
  assert.equal(existsSync(f.media), false);
  assert.equal(prepareEmptyMediaDirectories(f.root, {create: true}).created, 1);
  assert.equal(prepareEmptyMediaDirectories(f.root, {create: true}).created, 0);
  assert.deepEqual(readFileSync(path.join(f.root, 'packages/demos/private-current-js-registry.json')), before);
});

test('drifted closure bytes stop preparation before directory creation', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.root, f.artifacts.closure.path), '{}');
  assert.throws(() => prepareEmptyMediaDirectories(f.root, {create: true}), /bytes drifted/);
  assert.equal(existsSync(f.media), false);
});

test('a rehashed empty declaration cannot hide a referenced asset', t => {
  const f = fixture(t);
  f.data.dictionary = {'1': {src: 'media/undeclared.png'}};
  f.seal();
  assert.throws(() => prepareEmptyMediaDirectories(f.root, {create: true}), /unbound media/);
  assert.equal(existsSync(f.media), false);
});

test('existing undeclared content is rejected and preserved', t => {
  const f = fixture(t);
  mkdirSync(f.media); writeFileSync(path.join(f.media, 'unexpected.txt'), 'retain');
  assert.throws(() => prepareEmptyMediaDirectories(f.root, {create: true}), /undeclared media/);
  assert.equal(readFileSync(path.join(f.media, 'unexpected.txt'), 'utf8'), 'retain');
});

test('media symlinks and parent symlinks cannot redirect creation', t => {
  const f = fixture(t), alternate = path.join(f.root, 'alternate');
  mkdirSync(alternate); symlinkSync(alternate, f.media);
  assert.throws(() => prepareEmptyMediaDirectories(f.root, {create: true}), /physical media/);
  rmSync(f.media); const original = path.join(f.root, f.page);
  rmSync(original, {recursive: true}); symlinkSync(alternate, original); f.seal();
  assert.throws(() => prepareEmptyMediaDirectories(f.root, {create: true}), /physical artifact/);
  assert.equal(existsSync(path.join(alternate, 'media')), false);
});

test('nonempty declarations are left to the unchanged registry validator', t => {
  const f = fixture(t); f.closure.media = [{path: `${f.page}/media/audio.mp3`, bytes: 1, sha256: '0'.repeat(64)}]; f.seal();
  assert.equal(prepareEmptyMediaDirectories(f.root, {create: true}).created, 0);
  assert.equal(existsSync(f.media), false);
});
