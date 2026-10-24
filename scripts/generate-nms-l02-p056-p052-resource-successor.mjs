import {createHash} from 'node:crypto';
import {lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.slice(2).join(' ') === '--check';
if (process.argv.length > 2 && !check) throw Error('Expected --check or no arguments');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const recipes = Object.freeze([
  {
    source: 'packages/demos/src/nms-l02-p052-audio-loader-v1.ts',
    sourceSha256: '2db904cd2e3ace08b7268e0ce94761dca24fb83b646f985b1dab089de48b6945',
    output: 'packages/demos/src/nms-l02-p052-audio-loader-p056-v1.ts',
    before: '/flash-assets/g678-local/shared-nms002-l02-p052/source-audio/${domain}',
    after: '/migration-assets/nms-l02-p056-predecessors/p052-${domain}.mp3',
  },
  {
    source: 'packages/demos/src/nms-l02-p052-browser-controller-v1.ts',
    sourceSha256: '7763a878286cddeb78e41284ee08731ee4e2e97f2351d3b98ec69774e93eb97b',
    output: 'packages/demos/src/nms-l02-p052-browser-controller-p056-v1.ts',
    before: "'./nms-l02-p052-audio-loader-v1'",
    after: "'./nms-l02-p052-audio-loader-p056-v1'",
  },
  {
    source: 'packages/demos/src/nms-l02-p052-player-v1.tsx',
    sourceSha256: 'f51d88216f7090b781587484635c60cd18150dcf3a05e2935c0591a2c2609b5e',
    output: 'packages/demos/src/nms-l02-p052-player-p056-v1.tsx',
    before: "'./nms-l02-p052-browser-controller-v1'",
    after: "'./nms-l02-p052-browser-controller-p056-v1'",
  },
  {
    source: 'apps/web/components/nms-l02-p052-source-runtime-v1.tsx',
    sourceSha256: '5b51d27335c95cb1373c4bf10149c74730b8520bc094c435a4d774b2691b9101',
    output: 'apps/web/components/nms-l02-p052-source-runtime-p056-v1.tsx',
    before: "'../../../packages/demos/src/nms-l02-p052-player-v1'",
    after: "'../../../packages/demos/src/nms-l02-p052-player-p056-v1'",
  },
]);

function pinnedSource(recipe) {
  const file = path.join(root, recipe.source);
  const stat = lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || realpathSync(file) !== file)
    throw Error(`P052 source must be ordinary physical: ${recipe.source}`);
  const bytes = readFileSync(file);
  if (sha256(bytes) !== recipe.sourceSha256) throw Error(`P052 source changed: ${recipe.source}`);
  return bytes.toString('utf8');
}
function once(text, before, after, source) {
  const at = text.indexOf(before);
  if (at < 0 || text.indexOf(before, at + before.length) >= 0 || text.includes(after))
    throw Error(`P052 exact single replacement unavailable: ${source}`);
  return text.slice(0, at) + after + text.slice(at + before.length);
}
function writeExact(relative, bytes) {
  const file = path.join(root, relative);
  if (check) {
    const existing = readFileSync(file);
    if (!existing.equals(bytes)) throw Error(`P052 generated output drift: ${relative}`);
    return;
  }
  mkdirSync(path.dirname(file), {recursive: true});
  try {writeFileSync(file, bytes, {flag: 'wx'});}
  catch (error) {
    if (error?.code !== 'EEXIST' || !readFileSync(file).equals(bytes)) throw error;
  }
}

const outputs = recipes.map(recipe => {
  const result = Buffer.from(once(pinnedSource(recipe), recipe.before, recipe.after, recipe.source));
  writeExact(recipe.output, result);
  return {source: {path: recipe.source, sha256: recipe.sourceSha256},
    output: {path: recipe.output, bytes: result.length, sha256: sha256(result)},
    replacement: {before: recipe.before, after: recipe.after}};
});
const manifest = Buffer.from(JSON.stringify({schemaVersion: 1,
  kind: 'nms-l02-p056-p052-resource-successor-exact-copies-v1',
  claim: 'Each output equals its pinned predecessor after exactly one listed URL or import replacement.',
  outputs}, null, 2) + '\n');
writeExact('output/nms-l02-p056-product-20260927/continuity/p052-generated-v1.json', manifest);
console.log(JSON.stringify({checked: check, outputs: outputs.length,
  manifestSha256: sha256(manifest), outputShas: outputs.map(row => row.output.sha256)}));
