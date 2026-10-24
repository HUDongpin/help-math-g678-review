import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Git cannot retain an empty directory. Recreate only an exact, pinned empty
// HFR media closure; the normal registry checker still validates every artifact.
export function prepareEmptyMediaDirectories(root, {create = false} = {}) {
  root = path.resolve(root);
  assert.equal(realpathSync(root), root, 'physical review root required');
  const inputs = [];
  function read(relative, pin) {
    assert(typeof relative === 'string' && !path.isAbsolute(relative) &&
      path.posix.normalize(relative) === relative && !relative.split('/').includes('..') &&
      !relative.includes('\\'), 'relative artifact path required');
    const file = path.join(root, relative);
    assert.equal(realpathSync(file), file, 'physical artifact required');
    const stat = lstatSync(file);
    assert(stat.isFile() && stat.nlink === 1 && stat.size <= 64 * 1024 * 1024,
      'ordinary bounded artifact required');
    const bytes = readFileSync(file), hash = sha256(bytes);
    if (pin) assert(bytes.length === pin.bytes && hash === pin.sha256, 'artifact bytes drifted');
    inputs.push({file, hash});
    return JSON.parse(bytes.toString('utf8'));
  }
  function directory(relative, missingAllowed) {
    const file = path.join(root, relative);
    assert.equal(realpathSync(path.dirname(file)), path.dirname(file), 'physical media parent required');
    if (!existsSync(file)) {
      // A dangling symlink is not a missing directory.
      try { lstatSync(file); assert.fail('physical media directory required'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      assert(missingAllowed, 'media directory missing');
      return false;
    }
    assert.equal(realpathSync(file), file, 'physical media directory required');
    assert(lstatSync(file).isDirectory(), 'media directory required');
    assert.equal(readdirSync(file).length, 0, 'undeclared media present');
    return true;
  }
  const registry = read('packages/demos/private-current-js-registry.json');
  assert.equal(registry.schemaVersion, 2, 'registry schema');
  const empty = new Set();
  for (const calibration of registry.calibrations) for (const entry of calibration.entries) {
    const a = entry.artifacts;
    if (a?.kind !== 'generated-typescript-hfr-v1') continue;
    const closure = read(a.closure.path, a.closure);
    assert.equal(closure.animationId, entry.key, 'closure placement');
    assert.deepEqual(closure.data, a.data, 'closure data pin');
    assert(Array.isArray(closure.media), 'media declaration');
    if (closure.media.length) continue;
    assert(/^[a-z0-9-]+$/.test(entry.key) &&
      a.data.path.startsWith('work/g678-shared-page-factory/') &&
      a.data.path.endsWith(`/members/${entry.key}/${entry.key}.data.json`), 'page media boundary');
    const data = read(a.data.path, a.data);
    assert(Object.values(data.dictionary ?? {}).every(item => item.src === undefined && item.alpha === undefined) &&
      (data.streams ?? []).length === 0 && data.spanishAudio === undefined, 'unbound media reference');
    const relative = `${path.posix.dirname(a.data.path)}/media`;
    directory(relative, true);
    empty.add(relative);
  }
  // Finish preflight before creating anything, and reject changed inputs.
  for (const input of inputs) assert.equal(sha256(readFileSync(input.file)), input.hash, 'input changed during preflight');
  const missing = [...empty].filter(relative => !directory(relative, true));
  if (create) for (const relative of missing) {
    directory(relative, true);
    mkdirSync(path.join(root, relative));
    directory(relative, false);
  }
  return {emptyDirectories: empty.size, missing, created: create ? missing.length : 0};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert(args.length === 0 || (args.length === 1 && ['--check', '--create'].includes(args[0])),
    'Usage: node review/prepare-empty-media.mjs [--check|--create]');
  const result = prepareEmptyMediaDirectories(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
    {create: args[0] === '--create'});
  console.log(JSON.stringify(result));
  if (result.missing.length && !result.created) process.exitCode = 1;
}
