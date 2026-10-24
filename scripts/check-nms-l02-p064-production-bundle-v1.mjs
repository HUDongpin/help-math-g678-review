import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [mode, buildArgument, reportArgument] = process.argv.slice(2);
if (!['--build', '--check'].includes(mode) || !buildArgument || !reportArgument) {
  throw new Error('Usage: check-nms-l02-p064-production-bundle-v1.mjs --build|--check BUILD_DIR REPORT_JSON');
}

const buildDir = path.resolve(buildArgument);
const reportPath = path.resolve(reportArgument);
const route = '/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page';
const markers = [
  'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c',
  'A35Opt4',
  'Two of three circle sectors shaded',
  'A book has a discount of 10%',
];
const config = JSON.parse(fs.readFileSync(path.join(buildDir, 'required-server-files.json'), 'utf8'));
assert.equal(config.config.distDir, '.next-p064-production-scan');
const routes = JSON.parse(fs.readFileSync(path.join(buildDir, 'server/app-paths-manifest.json'), 'utf8'));
assert.ok(routes[route], 'P064 route must be in the actual production build');
const buildId = fs.readFileSync(path.join(buildDir, 'BUILD_ID'), 'utf8').trim();
assert.ok(buildId);

const files = [];
for (const surface of ['server', 'static']) {
  const pending = [path.join(buildDir, surface)];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(fullPath);
      else if (entry.isFile()) files.push(fullPath);
      else throw new Error(`Unexpected build entry: ${fullPath}`);
    }
  }
}
files.sort();
assert.ok(files.length > 0);
const checksumSet = createHash('sha256');
let totalBytes = 0;
const hits = [];
for (const file of files) {
  const bytes = fs.readFileSync(file);
  const relative = path.relative(buildDir, file);
  totalBytes += bytes.length;
  checksumSet.update(relative + '\0');
  checksumSet.update(createHash('sha256').update(bytes).digest('hex') + '\n');
  for (const marker of markers) {
    if (bytes.includes(Buffer.from(marker))) hits.push({file: relative, marker});
  }
}
assert.deepEqual(hits, [], 'P064 candidate payload leaked into the production bundle');
const report = {
  kind: 'nms-l02-p064-production-bundle-isolation-v1',
  status: 'PASS',
  buildDir,
  buildId,
  route,
  scannedSurfaces: ['server', 'static'],
  scannedFiles: files.length,
  scannedBytes: totalBytes,
  bundleChecksumSetSha256: checksumSet.digest('hex'),
  absentMarkers: markers,
  payloadHits: hits,
  claim: 'The scanned local Webpack production build contains no checked P064 payload markers; this does not establish provider deployment or Current-JS admission.',
};
const serialized = JSON.stringify(report, null, 2) + '\n';
if (mode === '--build') fs.writeFileSync(reportPath, serialized, {flag: 'wx'});
else assert.equal(fs.readFileSync(reportPath, 'utf8'), serialized);
console.log(serialized);
