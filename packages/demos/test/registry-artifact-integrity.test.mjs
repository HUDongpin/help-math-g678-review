import assert from 'node:assert/strict';
import {link, mkdtemp, rm, symlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {ordinaryFileBinding} from '../scripts/generate-registry.mjs';

test('registry artifact reader rejects symlinks and multiply linked bytes', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'registry-artifact-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const ordinary = path.join(root, 'ordinary.ts');
  const symbolic = path.join(root, 'symbolic.ts');
  const hard = path.join(root, 'hard.ts');
  await writeFile(ordinary, 'export default 1;\n');
  const binding = await ordinaryFileBinding(ordinary, 'fixture');
  assert.equal(binding.bytes, 18);
  assert.match(binding.sha256, /^[a-f0-9]{64}$/u);
  await symlink(ordinary, symbolic);
  await assert.rejects(
    ordinaryFileBinding(symbolic, 'symbolic fixture'),
    /ordinary single-link file/u,
  );
  await link(ordinary, hard);
  await assert.rejects(
    ordinaryFileBinding(ordinary, 'multiply linked fixture'),
    /ordinary single-link file/u,
  );
  await assert.rejects(
    ordinaryFileBinding(hard, 'hard-linked fixture'),
    /ordinary single-link file/u,
  );
});
