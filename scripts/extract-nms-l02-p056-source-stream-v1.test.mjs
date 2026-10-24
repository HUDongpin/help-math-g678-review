import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const script = new URL('./extract-nms-l02-p056-source-stream-v1.mjs', import.meta.url);
const output = new URL('../migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3',
  import.meta.url);
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('P056 embedded stream is reproducible and cannot overwrite the preserved extraction', t => {
  if (!process.env.HELP_MATH_G678_SOURCE_ROOT) {
    t.skip('real G6–G8 source root required');
    return;
  }
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot);
  const before = readFileSync(output);
  assert.equal(before.length, 95290);
  assert.equal(sha256(before), '6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811');
  const check = spawnSync(process.execPath, [fileURLToPath(script), '--check'],
    {encoding: 'utf8', env: process.env});
  assert.equal(check.status, 0, check.stderr);
  const overwrite = spawnSync(process.execPath, [fileURLToPath(script), '--write'],
    {encoding: 'utf8', env: process.env});
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /EEXIST/u);
  assert.deepEqual(readFileSync(output), before);
});
