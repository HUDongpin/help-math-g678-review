import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir, readFile, readdir, lstat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW07.swf';
const digest = '6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350';
const out = path.join(root, 'migrations/shared-alg001-l06-p008/audit/canvas-v1');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function inventory(dir) {
  const rows = [];
  for (const name of (await readdir(dir)).sort()) {
    if (name === 'receipt.json') continue;
    const file = path.join(dir, name), stat = await lstat(file);
    assert(!stat.isSymbolicLink());
    if (stat.isDirectory()) rows.push(...await inventory(file));
    else {
      assert(stat.isFile());
      const bytes = await readFile(file);
      rows.push({path: path.relative(root, file), bytes: bytes.length, sha256: hash(bytes)});
    }
  }
  return rows;
}
assert(['--export', '--check'].includes(process.argv[2]) && process.argv.length === 3);
const bytes = await readFile(source);
assert.equal(bytes.length, 2805364);
assert.equal(hash(bytes), digest);
if (process.argv[2] === '--export') {
  const tool = '/opt/homebrew/bin/ffdec';
  const help = spawnSync(tool, ['-help', 'export'], {encoding: 'utf8', maxBuffer: 2e6});
  assert.equal(help.status, 0);
  assert(help.stdout.includes('v.26.2.1') && help.stdout.includes('sprite:canvas'));
  await mkdir(out); // Preserve any previous or failed extraction.
  await writeFile(path.join(out, 'help.txt'), help.stdout, {flag: 'wx'});
  const args = ['-config', 'packJavaScripts=false', '-onerror', 'abort', '-format', 'frame:canvas,sprite:canvas', '-export', 'frame,sprite', out, source];
  const result = spawnSync(tool, args, {encoding: 'utf8', maxBuffer: 8e6, timeout: 180000});
  await writeFile(path.join(out, 'export.log'), result.stdout + result.stderr, {flag: 'wx'});
  assert.equal(result.status, 0, 'preserve failed output');
  assert.equal(hash(await readFile(source)), digest);
  await writeFile(path.join(out, 'receipt.json'), JSON.stringify({animationId: 'shared-alg001-l06-p008', source: {path: source, sha256: digest, bytes: bytes.length}, tool: 'FFDec 26.2.1', command: [tool, ...args], files: await inventory(out), acceptanceEffect: 'none'}, null, 2) + '\n', {flag: 'wx'});
}
const receipt = JSON.parse(await readFile(path.join(out, 'receipt.json')));
assert.equal(receipt.source.sha256, digest);
assert.deepEqual(receipt.files, await inventory(out));
console.log(JSON.stringify({verified: true, files: receipt.files.length, bytes: receipt.files.reduce((n, r) => n + r.bytes, 0)}));
