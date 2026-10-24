/** Reviewed P004 text-risk successor. Source mask events, Canvas images, and native bytes are checked independently. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = 'migrations/shared-alg001-l06-p004/audit/text-risks-v2.json';
const predecessor = 'migrations/shared-alg001-l06-p004/audit/text-risks-v1.json';
const catalogPath = 'migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const capturePath = 'output/alg-l06-p004-composed-text-v1/capture-v1.json';
const reviewPath = 'output/alg-l06-p004-composed-text-v1/visual-review-v1.json';
const semanticPath = 'packages/demos/src/alg-l06-p004-semantic-text-v1.ts';
const hashes = Object.freeze({
  predecessor: 'e742449a874529449a7e4a7bc5233d3514795a3acf39d050765ca06e3888cd00',
  catalog: 'c6f15d46da49019e359a44f407cb0577f7cfb6a7a0c1b68ab06d43084aa3adc6',
  capture: 'f63b2a229b4efdc0ba47b4b080817b7c191f16ec8e1a76f0db80ca9a28ba9763',
  review: '38e5f097bbd031b5a67d3eb0ec8c166530e0734f15706479d76b701e2b37577e',
  semantic: '3ef6b76d8eea5662b9766811862252049e3b5bfbdfd98d6f1be6a734f0e5f031',
  globals: '333064d6d0a3fa39ab4f0d58fd25295bde27b7a7985068ff422061f2de1e75c9',
});
const nativePaths = [
  'packages/demos/src/alg-l06-p004-text.generated.ts',
  'packages/demos/src/alg-l06-p004-text-occurrences-v2.generated.ts',
  semanticPath,
  'packages/demos/src/alg-l06-p004-semantic-text-v1.test.ts',
  'packages/demos/src/alg-l06-p004-hit-regions.generated.ts',
  'packages/demos/src/alg-l06-p004-text-snapshot-v1.ts',
  'packages/demos/src/alg-l06-p004-text-snapshot-v1.test.ts',
  'packages/demos/src/alg-l06-p004-native-text-v1.tsx',
  'apps/web/components/g678-alg-l06-p004-runtime-v1.tsx',
  'apps/web/components/g678-alg-l06-p004-runtime-v1.module.css',
  'apps/web/app/globals.css',
];
const sha = data => createHash('sha256').update(data).digest('hex');
const load = relative => readFileSync(path.join(root, relative));
function pin(relative, expected) {
  const data = load(relative), item = {path: relative, bytes: data.length, sha256: sha(data)};
  if (expected) assert.equal(item.sha256, expected, `${relative} drift`);
  return item;
}
function sourceMask(catalog, {textCharacterId, textInstanceId, maskInstanceId,
  placedFrame, fullFrame, clipDepth, finalScaleX, finalSha}) {
  const events = catalog.timelines.flatMap(t => t.events);
  const text = events.filter(event => event.instanceId === textInstanceId);
  assert.equal(text.length, 1);
  assert.equal(text[0].characterId, textCharacterId);
  assert.equal(text[0].frame, placedFrame);
  assert.equal(text[0].flags.hasColorTransform, false);
  const masks = events.filter(event => event.instanceId === maskInstanceId);
  assert(masks.length > 2);
  assert.equal(masks[0].frame, placedFrame);
  assert.equal(masks[0].clipDepth, clipDepth);
  assert.equal(masks.at(-1).frame, fullFrame);
  assert.equal(masks.at(-1).matrix[0], finalScaleX);
  assert.equal(masks.at(-1).sourceTagSha256, finalSha);
  return {textCharacterId, textInstanceId, textPlacement: {frame: text[0].frame,
    matrixTwips: text[0].matrix, sourceTagSha256: text[0].sourceTagSha256},
    maskInstanceId, clipDepth, maskFirst: {frame: masks[0].frame,
      scaleX: masks[0].matrix[0], sourceTagSha256: masks[0].sourceTagSha256},
    maskLast: {frame: masks.at(-1).frame, scaleX: masks.at(-1).matrix[0],
      sourceTagSha256: masks.at(-1).sourceTagSha256},
    maskUpdateCount: masks.length, modernCompleteSentenceFrame: fullFrame};
}
function build() {
  const predecessorPin = pin(predecessor, hashes.predecessor);
  const catalogPin = pin(catalogPath, hashes.catalog);
  const capturePin = pin(capturePath, hashes.capture);
  const reviewPin = pin(reviewPath, hashes.review);
  const semanticPin = pin(semanticPath, hashes.semantic);
  const nativePins = nativePaths.map(item => pin(item,
    item === semanticPath ? hashes.semantic : item === 'apps/web/app/globals.css' ? hashes.globals : undefined));
  const earlier = JSON.parse(load(predecessor));
  const catalog = JSON.parse(load(catalogPath));
  const capture = JSON.parse(load(capturePath));
  const review = JSON.parse(load(reviewPath));
  const semantic = load(semanticPath).toString('utf8');
  assert.deepEqual(review.captureReceipt, capturePin);
  assert.deepEqual(earlier.gates, {nativeTypographyComplete: false, runtimeVisibilityEstablished: false,
    originalRuntimeAccepted: false, visualAccepted: false, SpanishTranslationAccepted: false,
    ownerAccepted: false, strictComplete: false, published: false});
  assert.equal(catalog.sourceSha256, earlier.sourcePins[0].sha256);
  assert.equal(capture.sourcePins[0].bytes, earlier.sourcePins[0].bytes);
  assert.equal(capture.sourcePins[0].sha256, earlier.sourcePins[0].sha256);
  const first = sourceMask(catalog, {textCharacterId: 78,
    textInstanceId: 'sprite-95/depth-84/generation-3', maskInstanceId: 'sprite-95/depth-82/generation-6',
    placedFrame: 508, fullFrame: 611, clipDepth: 91, finalScaleX: 1,
    finalSha: 'b9a7b330b65db6e1567c1243f93fc8529734b09c43c521ef9d23a6a50fe6ecf2'});
  const second = sourceMask(catalog, {textCharacterId: 83,
    textInstanceId: 'sprite-95/depth-94/generation-1', maskInstanceId: 'sprite-95/depth-92/generation-1',
    placedFrame: 614, fullFrame: 684, clipDepth: 103, finalScaleX: 0.8452606201171875,
    finalSha: 'c1b16b4f803c79be69b9755ef5f57d0f57bd83b14a4d51abd0de666066360ab9'});
  const revealBlock = semantic.match(/export const P004_SENTENCE_REVEAL=Object\.freeze\(\{([\s\S]*?)\} as const\)/)?.[1];
  assert(revealBlock);
  const declared = [...revealBlock.matchAll(/'([^']+)':(\d+)/g)].map(match => [match[1], Number(match[2])]);
  assert.deepEqual(declared, [[first.textInstanceId, first.modernCompleteSentenceFrame],
    [second.textInstanceId, second.modernCompleteSentenceFrame]]);
  assert(semantic.includes(`path:'${reviewPath}'`));
  assert(semantic.includes(`sha256:'${hashes.review}'`));
  assert.match(semantic, /nativeTypographyComplete:false/);
  const screen = frame => {
    const row = capture.frames.find(item => item.frame === frame);
    assert(row, `missing source Canvas frame ${frame}`);
    assert.deepEqual(pin(row.screenshot.path), row.screenshot);
    return row.screenshot;
  };
  assert.notEqual(screen(610).sha256, screen(611).sha256);
  assert.equal(screen(611).sha256, screen(612).sha256);
  assert.notEqual(screen(683).sha256, screen(684).sha256);
  assert.equal(screen(684).sha256, screen(685).sha256);
  assert.deepEqual(review.nativeFullSentencePolicyCandidate,
    {text78Frame: 611, text83Frame: 684,
      basis: 'Last source mask-matrix updates plus visually inspected stable full-sentence Canvas frames; conservative modern whole-sentence reveal only, without progressive glyph parity',
      notAnImplementedRuntimeChange: true});
  const rows = earlier.rows.map(row => {
    if (row.id === 'source-static-text') return {...row,
      nativeCoverage: 'The active native companion keeps source-instance text and the reviewed semantic equation; two full sentence blocks are now withheld until source-mask-complete frames 611 and 684. Canvas glyphs remain unsuppressed.',
      reviewedSubset: {sentenceInstances: [first.textInstanceId, second.textInstanceId],
        completeSentenceFrames: [611, 684]},
      unresolved: 'Other source text still uses placement membership. Progressive glyph timing, alpha, offstage transforms, spatial reading order, overlap, responsive typography and original runtime visibility remain unestablished.'};
    if (row.id === 'mask-and-filter-composition') return {...row,
      nativeCoverage: 'Two sentence masks have source-event- and composed-Canvas-reviewed whole-sentence thresholds 611/684; the native companion applies those thresholds. Source masks and all Canvas pixels remain unsuppressed.',
      reviewedSubset: {maskInstanceIds: [first.maskInstanceId, second.maskInstanceId],
        completeSentenceFrames: [611, 684]},
      unresolved: 'Other masks, progressive reveal, filter/blend and any original Flash pixel result remain unvalidated.'};
    return row;
  });
  assert.equal(rows.length, 8);
  return {schemaVersion: 2, kind: 'alg-l06-p004-text-risk-inventory-v2',
    animationId: earlier.animationId,
    status: 'two-source-mask-complete-sentence-thresholds-implemented-other-risks-open',
    predecessor: predecessorPin, sourcePins: earlier.sourcePins,
    sourceCatalog: catalogPin, composedEvidence: [capturePin, reviewPin],
    bitmapReviewPin: earlier.reviewPin, nativeInputPins: nativePins,
    implementedNativeSemanticPin: semanticPin,
    sourceMaskSentencePolicy: [first, second],
    sampledPixelComparisons: [
      {before: screen(610), atComplete: screen(611), stableNext: screen(612)},
      {before: screen(683), atComplete: screen(684), stableNext: screen(685)}],
    rows,
    nextGap: 'Inspect and model remaining mask/alpha/offstage text reveal and image/vector lettering in composed frames; review native companion responsive layout and retained Canvas duplication. Do not infer original Flash behavior from the safe Canvas export.',
    gates: {...earlier.gates}};
}
function main() {
  const mode = process.argv[2];
  assert(['--prepare', '--check'].includes(mode), 'Use --prepare or --check');
  const data = Buffer.from(`${JSON.stringify(build(), null, 2)}\n`);
  const file = path.join(root, target);
  if (mode === '--prepare') {
    mkdirSync(path.dirname(file), {recursive: true});
    if (existsSync(file)) assert.deepEqual(readFileSync(file), data, `${target} drift`);
    else writeFileSync(file, data, {flag: 'wx'});
  } else assert.deepEqual(readFileSync(file), data, `${target} drift`);
  console.log(JSON.stringify({mode, report: {path: target, bytes: data.length, sha256: sha(data)}}));
}
main();
