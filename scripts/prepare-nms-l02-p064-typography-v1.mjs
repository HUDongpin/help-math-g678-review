import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const root = path.resolve(import.meta.dirname, '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const placementId = 'shared-nms002-l02-p064';
const sourceRelativePath = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
const sourceSha256 = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const reconciliationPath = `migrations/${placementId}/audit/source-text-reconciliation-v1.json`;
const reconciliationSha256 = 'acf1a4bb269d28ac775e540796791d82b771619689429f8122d7d6cce000bf9c';
const mappingPath = `migrations/${placementId}/audit/host-audio-static-mapping-v1.json`;
const mappingSha256 = 'a5a659eab428721358b841c5ca45f03a7bd2987585d523be3f5a619ed7480343';
const bindingPath = `catalog/typography-v1/g678-page-bindings/${placementId}.prepared-v4.json`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = relative => fs.readFileSync(path.join(root, relative));
const pinned = (relative, expected) => {
  const value = bytes(relative);
  assert.equal(hash(value), expected, `${relative} changed`);
  return JSON.parse(value.toString('utf8'));
};

const mode = process.argv[2];
assert.ok((mode === '--build' || mode === '--check') && process.argv.length === 3,
  'Use --build or --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot, 'Exact real source root required');
assert.ok(fs.lstatSync(sourceRoot).isDirectory() && fs.realpathSync(sourceRoot) === sourceRoot,
  'Source must be a real directory');
const swf = fs.readFileSync(path.join(sourceRoot, sourceRelativePath));
assert.equal(hash(swf), sourceSha256);
const source = collectSwfTextSourceCatalog(swf);
const reconciliation = pinned(reconciliationPath, reconciliationSha256);
pinned(mappingPath, mappingSha256);
assert.equal(reconciliation.sourceCatalogContentSha256, hash(JSON.stringify(source)));
assert.equal(reconciliation.prompts.length, 35);
assert.equal(reconciliation.options.length, 140);
const knownTextIds = new Set(source.textDefinitions.map(row => `character-${row.characterId}`));
const blocks = [];
for (const prompt of reconciliation.prompts) {
  assert.equal(prompt.questionFrame, prompt.questionId + 1);
  const sourceTextIds = [prompt.sourceTextId];
  if (prompt.separateFraction) sourceTextIds.push(prompt.separateFraction.sourceTextId);
  assert.ok(sourceTextIds.every(id => knownTextIds.has(id)));
  blocks.push({id: `q${prompt.questionId}-prompt`, sourceTextIds, role: 'question',
    language: 'en', readingOrder: blocks.length, valueSource: 'maintained-page-state'});
  const options = reconciliation.options.filter(row => row.questionId === prompt.questionId);
  assert.deepEqual(options.map(row => row.letter), ['A', 'B', 'C', 'D']);
  for (const option of options) {
    const ids = [option.sourceLetterTextId];
    if (option.sourceValueTextId) ids.push(option.sourceValueTextId);
    assert.ok(ids.every(id => knownTextIds.has(id)));
    blocks.push({id: `q${prompt.questionId}-option-${option.letter.toLowerCase()}`,
      sourceTextIds: ids, role: 'answer', language: 'en', readingOrder: blocks.length,
      valueSource: 'maintained-page-state'});
  }
}
assert.equal(blocks.length, 175);
const shared = JSON.parse(bytes('catalog/typography-v1/g678-integration.json').toString('utf8')).sharedFiles;
const pageFiles = [
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]/route.ts',
  'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/[folder]/[question]/[option]/route.ts',
  'apps/web/lib/nms-l02-p064-question-audio-access.ts',
  'apps/web/lib/nms-l02-p064-question-audio-source.ts',
  'apps/web/lib/nms-l02-p064-question-audio-response.ts',
  'apps/web/lib/g678-p064-candidate.production-stub.tsx',
  'packages/demos/src/nms-l02-p064-host-score-candidate.ts',
  'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
  'packages/demos/src/nms-l02-p064-quiz-candidate.css',
  'packages/demos/src/nms-l02-p064-quiz-state-candidate.ts',
  'packages/demos/src/nms-l02-p064-presentation-data-v1.ts',
  'packages/demos/src/nms-l02-p064-presentation-types-v1.ts',
];
const implementationFiles = [...new Set([...pageFiles, ...shared.map(file => file.path)])]
  .sort().map(file => ({path: file, sha256: hash(bytes(file))}));
const binding = {
  schemaVersion: 1,
  version: 'p064-source-quiz-typography-preparation-v4',
  placementId, animationId: placementId, sourceRelativePath, sourceSwfSha256: sourceSha256,
  sourceCatalogContentSha256: hash(JSON.stringify(source)), template: 'exercise', blocks,
  sourceRoleDecisions: [],
  languagePolicy: {en: 'source', es: 'source-fallback'},
  sourceRiskEvidence: {sourceTextReconciliation: {path: reconciliationPath, sha256: reconciliationSha256},
    hostAudioMapping: {path: mappingPath, sha256: mappingSha256}},
  implementation: {status: 'candidate', files: implementationFiles},
  unresolved: [
    'Picture-option and diagram teaching semantics require full source-shape disposition',
    'Source dynamic fields, ActionScript visibility and button runtime states require independent disposition',
    'Actual host audio flags, original-runtime timing and spoken-language listening remain unverified',
    'Complete native text, 320-1920px and 200-percent typography, accessibility and lifecycle checks remain open',
    'The audit-only memory host score path does not establish registered My Lesson flow or result/progress acceptance',
  ],
  independentPending: ['Original runtime and fidelity', 'Named audio and visual human review',
    'Owner acceptance', 'Strict completion and publication'],
  preparationOnly: true,
};
const rendered = JSON.stringify(binding, null, 2) + '\n';
const output = path.join(root, bindingPath);
if (mode === '--build') fs.writeFileSync(output, rendered, {flag: 'wx'});
else assert.equal(fs.readFileSync(output, 'utf8'), rendered, 'P064 prepared typography binding drift');
console.log(JSON.stringify({status: 'PASS-preparation-only', mode, output,
  sha256: hash(rendered), blocks: blocks.length, implementationFiles: implementationFiles.length,
  technicalTypographyPassed: false, registered: false}));
