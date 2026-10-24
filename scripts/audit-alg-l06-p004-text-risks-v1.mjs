/** P004 source text-risk inventory. Isolated bitmap observations are a separate, pinned human review. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, readdirSync, rmSync, copyFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourcePath = 'G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const output = 'output/alg-l06-p004-text-risks-v1';
const auditPath = 'migrations/shared-alg001-l06-p004/audit/text-risks-v1.json';
const expected = Object.freeze({
  source: '514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e',
  catalog: 'c6f15d46da49019e359a44f407cb0577f7cfb6a7a0c1b68ab06d43084aa3adc6',
  xml: 'e4c1ac33596cac6b97491c6d74417ddd8edfebb8197b12f680fdaa2cf8e5b187',
  sourceAudit: '89b22426969a3f288f1aef6043aed050d9eb6e4e8d092b45532e89a52ff37180',
});
const sourceCatalogPath = 'migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const xmlPath = 'migrations/shared-alg001-l06-p004/audit/movie-root-verified.xml';
const sourceAuditPath = 'migrations/shared-alg001-l06-p004/audit/source-audit-v1.json';
const observationsPath = `${output}/bitmap-review-observations-v1.json`;
const nativePaths = [
  'packages/demos/src/alg-l06-p004-text.generated.ts',
  'packages/demos/src/alg-l06-p004-text-occurrences-v2.generated.ts',
  'packages/demos/src/alg-l06-p004-semantic-text-v1.ts',
  'packages/demos/src/alg-l06-p004-hit-regions.generated.ts',
  'packages/demos/src/alg-l06-p004-text-snapshot-v1.ts',
  'packages/demos/src/alg-l06-p004-native-text-v1.tsx',
  'apps/web/components/g678-alg-l06-p004-runtime-v1.tsx',
  'apps/web/components/g678-alg-l06-p004-runtime-v1.module.css',
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function pin(relative, base = root) {
  const bytes = readFileSync(path.join(base, relative));
  return {path: relative, bytes: bytes.length, sha256: hash(bytes)};
}
function assertPin(relative, sha, base = root) {
  const item = pin(relative, base);
  assert.equal(item.sha256, sha, `${relative} source drift`);
  return item;
}
function writeExact(relative, bytes) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), {recursive: true});
  if (existsSync(file)) assert.deepEqual(readFileSync(file), bytes, `${relative} drift`);
  else writeFileSync(file, bytes, {flag: 'wx'});
}
function sortedUnique(rows) { return [...new Set(rows)].sort((a, b) => String(a).localeCompare(String(b), 'en', {numeric: true})); }

function buildReport() {
  const source = assertPin(sourcePath, expected.source, sourceRoot);
  const catalogPin = assertPin(sourceCatalogPath, expected.catalog);
  const xmlPin = assertPin(xmlPath, expected.xml);
  const sourceAuditPin = assertPin(sourceAuditPath, expected.sourceAudit);
  const catalog = JSON.parse(readFileSync(path.join(root, sourceCatalogPath), 'utf8'));
  const sourceAudit = JSON.parse(readFileSync(path.join(root, sourceAuditPath), 'utf8'));
  const xml = readFileSync(path.join(root, xmlPath), 'utf8');
  const reviewed = JSON.parse(readFileSync(path.join(root, observationsPath), 'utf8'));
  assert.equal(catalog.sourceSha256, expected.source);
  assert.equal(sourceAudit.source.sha256, expected.source);
  assert.equal(catalog.summary.textDefinitions, 28);
  assert.equal(catalog.summary.decodedRuns, 42);
  assert.equal(catalog.summary.unresolvedRuns, 0);
  assert.equal(catalog.summary.bitmapDefinitions, 7);
  assert.equal(catalog.summary.shapeDefinitions, 49);
  assert.equal(catalog.summary.buttonDefinitions, 8);
  assert.deepEqual(catalog.timelines.map(t => [t.timelineId, t.declaredFrameCount]),
    [['root', 10], ['sprite-95', 831], ['sprite-98', 1]]);
  const bitmaps = catalog.bitmapDefinitions.map(definition => {
    const observed = reviewed.observations.find(row => row.characterId === definition.characterId);
    assert(observed, `bitmap ${definition.characterId} not reviewed`);
    const exported = assertPin(`${output}/bitmap-review/${observed.file}`, observed.sha256);
    return {characterId: definition.characterId, sourceTagSha256: definition.sourceTagSha256,
      sourceTagOffset: definition.sourceTagOffset, exported, observation: observed.observation,
      textRisk: observed.textRisk};
  });
  assert.deepEqual(sortedUnique(reviewed.observations.map(row => row.characterId)),
    sortedUnique(catalog.bitmapDefinitions.map(row => row.characterId)));
  const shapeBitmapRefs = [...xml.matchAll(/<DefineShape\w* objectID="(\d+)"[\s\S]*?<\/DefineShape\w*>/g)]
    .map(match => ({shapeId: Number(match[1]), bitmapIds: sortedUnique([...match[0].matchAll(/<(?:ClippedBitmap|TiledBitmap) objectID="(\d+)"/g)]
      .map(item => Number(item[1])).filter(id => id !== 65535))}))
    .filter(row => row.bitmapIds.length);
  assert.deepEqual(shapeBitmapRefs, [
    {shapeId: 4, bitmapIds: [2, 3]},
    {shapeId: 16, bitmapIds: [11, 12, 13, 14, 15]},
    {shapeId: 19, bitmapIds: [11, 12]},
  ]);
  const instances = catalog.timelines.flatMap(t => t.instances);
  const occurrenceSource = readFileSync(path.join(root, nativePaths[1]), 'utf8');
  const occurrencePrefix = 'export const P004_TEXT_OCCURRENCES = ';
  const occurrenceStart = occurrenceSource.indexOf(occurrencePrefix);
  assert(occurrenceStart >= 0);
  const occurrenceEnd = occurrenceSource.lastIndexOf('] as const;');
  assert(occurrenceEnd > occurrenceStart);
  const nativeOccurrences = JSON.parse(occurrenceSource.slice(occurrenceStart + occurrencePrefix.length, occurrenceEnd + 1));
  assert.equal(nativeOccurrences.length, 100);
  const textInstances = instances.filter(item => catalog.textDefinitions.some(def => def.characterId === item.characterId));
  assert.deepEqual(sortedUnique(nativeOccurrences.map(row => row.instanceId)),
    sortedUnique(textInstances.map(row => row.instanceId)));
  const shape97 = catalog.shapeDefinitions.find(def => def.characterId === 97);
  const title96 = instances.find(item => item.characterId === 96);
  const outline97 = instances.find(item => item.characterId === 97);
  assert(shape97 && title96 && outline97);
  assert.equal(title96.instanceId, 'root/depth-120/generation-1');
  assert.equal(outline97.instanceId, 'sprite-98/depth-1/generation-1');
  const maskEvents = catalog.timelines.flatMap(t => t.events.filter(e => e.clipDepth !== undefined));
  assert.equal(maskEvents.length, 5);
  const actions = catalog.timelines.flatMap(t => t.events.filter(e => e.kind === 'action-bytes'));
  assert.deepEqual(actions.map(e => [e.eventId, e.frame]),
    [['root/tag-28', 1], ['root/tag-129', 6], ['sprite-95/tag-1233735', 831]]);
  const buttons = catalog.buttonDefinitions.map(def => ({characterId: def.characterId,
    actionSha256: def.actions.sha256, actionBytes: def.actions.bytes,
    states: def.statePlacements.map(row => row.states),
    instances: instances.filter(item => item.characterId === def.characterId)
      .map(item => ({instanceId: item.instanceId, firstFrame: item.firstFrame,
        lastFrameExclusive: item.lastFrameExclusive}))}));
  assert.equal(buttons.length, 8);
  const hitRegionCount = (readFileSync(path.join(root, nativePaths[3]), 'utf8').match(/"occurrenceId":/g) ?? []).length;
  assert.equal(hitRegionCount, 9);
  const rows = [
    {id: 'source-static-text', sourceIds: catalog.textDefinitions.map(item => item.characterId),
      evidence: {definitions: 28, decodedRuns: 42, unresolvedRuns: 0,
        nativeOccurrenceProjection: nativeOccurrences.length,
        sourceInstanceIds: textInstances.map(item => item.instanceId),
        semanticBindingBlocks: nativeOccurrences.length + 1, rootTitleInstance: title96.instanceId},
      nativeCoverage: 'Source glyphs, placement identities, repeated instances, and one reviewed equation feed the active maintained snapshot and native companion panel. Source Canvas glyphs remain unsuppressed; this is a readable companion, not a replacement or visibility proof.',
      unresolved: 'Alpha, masks, off-stage transforms, spatial reading order, overlap, browser typography and frame-pixel visibility are not established.'},
    {id: 'bitmap-embedded-text', sourceIds: bitmaps.map(row => row.characterId),
      shapeBitmapRefs: shapeBitmapRefs.map(row => ({...row,
        sourceInstances: instances.filter(item => item.characterId === row.shapeId)
          .map(item => ({instanceId: item.instanceId, firstFrame: item.firstFrame,
            lastFrameExclusive: item.lastFrameExclusive}))})), observations: bitmaps,
      nativeCoverage: 'The seven bitmaps retain exact source IDs and visual exports; environmental photo lettering is not a native DefineText run.',
      unresolved: 'Bitmap 3 has photographic signage; instructional importance and composed-frame legibility are unreviewed. Other images have no clearly readable teaching text at isolated export size, not proof of absence.'},
    {id: 'outline-title', sourceIds: [96, 97, 98],
      evidence: {rootTextInstance: title96.instanceId, outlineInstance: outline97.instanceId,
        shapeTagSha256: shape97.sourceTagSha256,
        disposition: pin('migrations/shared-alg001-l06-p004/audit/root-title-modern-disposition-v1.json')},
      nativeCoverage: 'Source title string 96 has a native text projection; separate shape 97 in sprite 98 is recorded as an outline duplicate under a modern title disposition.',
      unresolved: 'Source-composite visibility, outline suppression in every real frame, and visual parity are not established.'},
    {id: 'buttons-and-hit-only-states', sourceIds: buttons.map(row => row.characterId),
      evidence: {buttons, hitRegionCount},
      nativeCoverage: 'Nine source-occurrence hit regions are modeled, including two placements of button 79; glossary controls are maintained separately.',
      unresolved: 'All eight DefineButton2 visual state records are hit-test-only; over/down rendering and action execution are not recovered by this inventory.'},
    {id: 'mask-and-filter-composition', sourceIds: sortedUnique(maskEvents.map(e => e.characterId)),
      evidence: maskEvents.map(e => ({eventId: e.eventId, frame: e.frame, characterId: e.characterId,
        depth: e.depth, clipDepth: e.clipDepth, instanceId: e.instanceId,
        sourceTagSha256: e.sourceTagSha256})),
      nativeCoverage: 'Source mask ancestry and placement events are retained structurally.',
      unresolved: 'Visibility under masks, filter/blend effects and replacement semantics need composed-frame proof before claiming native text completeness.'},
    {id: 'actionscript-visibility-values', sourceIds: actions.map(e => e.eventId),
      evidence: actions.map(e => ({eventId: e.eventId, frame: e.frame, bytes: e.bytes,
        sourceTagSha256: e.sourceTagSha256})),
      nativeCoverage: 'Root and child stop boundaries and source glossary keys have separate maintained behavior models.',
      unresolved: 'These three DoAction records are structural bytes here; AVM1-dependent text state, timing and original host effect are not executed or accepted.'},
    {id: 'shape-and-math-symbols', sourceIds: catalog.shapeDefinitions.map(item => item.characterId),
      evidence: {shapeDefinitions: 49, semanticEquationSourceInstances: ['sprite-95/depth-80/generation-5', 'sprite-95/depth-81/generation-2'],
        equationAudit: pin('migrations/shared-alg001-l06-p004/audit/equation-geometry-v1.json')},
      nativeCoverage: 'The reviewed source x operator and adjacent source text become one maintained semantic equation; other shapes remain visual source assets.',
      unresolved: 'The remaining vector shapes are not classified as text or non-text; outlined glyphs, mathematical symbols and compositing still need a bounded visual census.'},
    {id: 'language-and-translation', sourceIds: catalog.textDefinitions.map(item => item.characterId),
      nativeCoverage: 'English source text stays English. Separate glossary labels and user-triggered Spanish audio do not translate the source drawing.',
      unresolved: 'Spanish visual and source translation parity, original Spanish host association and listening acceptance are unestablished.'},
  ];
  assert.deepEqual(catalog.risks.map(row => row.kind),
    ['shape-text-unclassified', 'bitmap-text-unclassified',
      'button-runtime-state-and-actions-not-interpreted',
      'actionscript-visibility-and-values-not-interpreted', 'mask-filter-blend-semantics-unresolved']);
  return {schemaVersion: 1, kind: 'alg-l06-p004-text-risk-inventory-v1',
    animationId: 'shared-alg001-l06-p004', status: 'bounded-source-and-isolated-bitmap-review-not-native-typography-acceptance',
    sourcePins: [source, catalogPin, xmlPin, sourceAuditPin],
    reviewPin: pin(observationsPath), nativeInputPins: nativePaths.map(item => pin(item)),
    sourceRisks: catalog.risks, rows,
    gates: {nativeTypographyComplete: false, runtimeVisibilityEstablished: false,
      originalRuntimeAccepted: false, visualAccepted: false, SpanishTranslationAccepted: false,
      ownerAccepted: false, strictComplete: false, published: false}};
}

function main() {
  const mode = process.argv[2];
  assert(['--prepare', '--check'].includes(mode), 'use --prepare or --check');
  if (mode === '--prepare') {
    assertPin(sourcePath, expected.source, sourceRoot);
    const scratch = mkdtempSync(path.join(tmpdir(), 'p004-bitmap-review-'));
    try {
      const outputText = execFileSync('ffdec', ['-export', 'image', scratch,
        path.join(sourceRoot, sourcePath)], {encoding: 'utf8', maxBuffer: 1_000_000});
      assert.match(outputText, /JPEXS Free Flash Decompiler v\.26\.2\.1/);
      assert.match(outputText, /Exported image 7\/7/);
      const reviewed = JSON.parse(readFileSync(path.join(root, observationsPath), 'utf8'));
      assert.deepEqual(sortedUnique(readdirSync(scratch)),
        sortedUnique(reviewed.observations.map(row => row.file)));
      for (const row of reviewed.observations) {
        const sourceFile = path.join(scratch, row.file);
        assert.equal(hash(readFileSync(sourceFile)), row.sha256, `FFDec export ${row.file} drift`);
        const destination = path.join(root, output, 'bitmap-review', row.file);
        mkdirSync(path.dirname(destination), {recursive: true});
        if (existsSync(destination)) assert.deepEqual(readFileSync(destination), readFileSync(sourceFile));
        else copyFileSync(sourceFile, destination);
      }
    } finally { rmSync(scratch, {recursive: true, force: true}); }
  }
  const bytes = Buffer.from(`${JSON.stringify(buildReport(), null, 2)}\n`);
  if (mode === '--prepare') writeExact(auditPath, bytes);
  else assert.deepEqual(readFileSync(path.join(root, auditPath)), bytes, `${auditPath} drift`);
  console.log(JSON.stringify({mode, audit: {path: auditPath, bytes: bytes.length, sha256: hash(bytes)}}));
}
main();
