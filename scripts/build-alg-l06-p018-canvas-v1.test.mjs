import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = 'output/alg-l06-p018-canvas-v1';
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('P018 maintained Canvas is generated from unchanged physical source and exports', () => {
  const result = JSON.parse(execFileSync(process.execPath,
    ['scripts/build-alg-l06-p018-canvas-v1.mjs','--check'],
    {cwd: ROOT, env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: sourceRoot},
      encoding: 'utf8', maxBuffer: 2e6}));
  assert.equal(result.status, 'verified');
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, OUT, 'canvas-manifest.json')));
  const receipt = JSON.parse(fs.readFileSync(path.join(ROOT, OUT, 'source-export-receipt.json')));
  assert.equal(manifest.source.sha256, receipt.source.sha256);
  assert.equal(manifest.sourceClipMasks.length, 4);
  assert.equal(manifest.sourceGlyphRendering.definitions, 17);
  assert.deepEqual(manifest.sourceGlossaryButtons.map(b => b.keyAttribute),
    ['Evaluate','Input variable','Substitute','Function','Result']);
  assert(Object.values(manifest.acceptanceEffects).every(value => value === false));
  for (const file of receipt.files) {
    assert.equal(sha(fs.readFileSync(path.join(ROOT, file.path))), file.sha256,
      `source export changed: ${file.path}`);
  }
});

test('P018 browser draws source title, rejects invalid frames and isolates sought masks', () => {
  const result = JSON.parse(execFileSync(process.execPath,
    [`${OUT}/probe-v1.mjs`], {cwd: ROOT, encoding: 'utf8', maxBuffer: 2e6}));
  assert.equal(result.status, 'pass');
  const receipt = JSON.parse(fs.readFileSync(path.join(ROOT, OUT, 'probe-v1/receipt.json')));
  assert.deepEqual(receipt.frames.map(item => item.frame), [1,2,65,317,382,648,65]);
  assert.equal(receipt.frames[2].pngSha256, receipt.frames.at(-1).pngSha256);
  assert(receipt.invalidRequestsRejected.every(Boolean));
  assert.equal(receipt.originalRuntimeAccepted, false);
});
