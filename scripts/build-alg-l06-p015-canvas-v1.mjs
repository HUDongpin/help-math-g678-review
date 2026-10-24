#!/usr/bin/env node
/** Source-bound P015 Canvas drawing plane; AVM1, audio and host state live elsewhere. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {gunzipSync} from 'node:zlib';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID = 'shared-alg001-l06-p015';
const SWF = 'G6-G8-shared/ALG001/L6/VB/L6VB06.swf';
const SWF_SHA = 'd0f395f5410353733b42ae29198caa86fae6b6eebd0e2a71830a203d969868b1';
const AUDIT = `migrations/${ID}/audit`;
const EXPORT = `${AUDIT}/canvas-v1`;
const RECEIPT = `${EXPORT}/extraction-receipt.json`;
const OUT = 'output/alg-l06-p015-canvas-v1';
const GENERATED = 'packages/demos/src/generated/alg-l06-p015-canvas-v1.ts';
const SOURCE_PIN = Object.freeze({path: SWF, bytes: 559546, sha256: SWF_SHA});
const INPUT = Object.freeze({
  audit: {path: `${AUDIT}/source-v1/source-audit-v1.json`, sha256: '5e474ab8e2c00be798adfb1ca39b654ace6b178c2311745f69451bba589a9824'},
  text: {path: `${AUDIT}/source-v1/source-text-v1.json`, sha256: 'bdf49c1ab600629de4a0a24d21eda7a401e66788b0973f343adbb6626eabc13f'},
  composition: {path: `${AUDIT}/source-v1/source-composition-v1.json`, sha256: '742db4326c3f0a4831a71dbe7e453ff77aea4396520ce94ce8f2b28affd5dc46'},
  binary: {path: `${AUDIT}/source-v1/binary-boundary-v1.json`, sha256: '248dd2ce75fc719e88dda5bccb71885cc033f7c3c44dc5fdc959717f12e802fd'},
  scripts: {path: `${AUDIT}/source-v1/public-tool-scripts-v1.json`, sha256: '8341254b2332f4659efe0124e247bd9e080d483dab892a1fb003763cdbcbdf52'},
  xml: {path: `${AUDIT}/source-v1/swfmill-v1.xml.gz`, sha256: '70e5a4d11a438f4a1f981dc6c044d96223b592b0407cd8e00970face1f567c42'},
  helper: {path: `${EXPORT}/sprites/DefineSprite_270/canvas.js`, sha256: '78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  frames: {path: `${EXPORT}/sprites/DefineSprite_270/frames.html`, sha256: 'e6d1a19905167f110f38e741a059b3c3c5f4d1528ef184c34169482cf3e822dd'},
  rootFrames: {path: `${EXPORT}/frames/frames.html`, sha256: 'dc97528eb30f4699535f9ea9e24ffaca58c482a0154698a7e83df3c1e431789f'},
});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const pin = (name, bytes) => ({path: name, bytes: bytes.length, sha256: sha(bytes)});

function readPinned(root, item) {
  const file = path.resolve(root, item.path);
  assert(file.startsWith(`${root}${path.sep}`) && fs.realpathSync(file) === file, `physical file: ${item.path}`);
  const before = fs.lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n, `ordinary file: ${item.path}`);
  const bytes = fs.readFileSync(file), after = fs.lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'nlink'])
    assert.equal(before[key], after[key], `stable file ${key}: ${item.path}`);
  if (item.bytes !== undefined) assert.equal(bytes.length, item.bytes, `size drift: ${item.path}`);
  if (item.sha256) assert.equal(sha(bytes), item.sha256, `SHA drift: ${item.path}`);
  return bytes;
}
function inventory(directory) {
  return fs.readdirSync(path.join(ROOT, directory), {withFileTypes: true})
    .sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(entry => {
      assert(!entry.isSymbolicLink(), 'no export symlink');
      const name = `${directory}/${entry.name}`;
      return entry.isDirectory() ? inventory(name) : name === RECEIPT ? [] :
        [pin(name, readPinned(ROOT, {path: name}))];
    });
}
function replaceOnce(source, needle, replacement, label) {
  const at = source.indexOf(needle);
  assert(at >= 0 && source.indexOf(needle, at + needle.length) < 0, `unique ${label}`);
  return source.slice(0, at) + replacement + source.slice(at + needle.length);
}
function extractFunction(source, name) {
  const begin = source.indexOf(`function ${name}(`);
  const end = source.indexOf('\nfunction ', begin + 1);
  assert(begin >= 0 && end > begin && source.indexOf(`function ${name}(`, begin + 1) < 0, `unique ${name}`);
  return source.slice(begin, end).trimEnd();
}
function sealExport() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT);
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT);
  readPinned(SOURCE_ROOT, SOURCE_PIN);
  assert(!fs.existsSync(path.join(ROOT, RECEIPT)), 'export receipt already sealed');
  const help = execFileSync('ffdec', ['-help', 'export'], {encoding: 'utf8', maxBuffer: 2e6});
  assert(help.includes('v.26.2.1') && help.includes('sprite:canvas'));
  const files = inventory(EXPORT);
  assert.equal(files.length, 4, 'root and one sprite Canvas export, helper+frames each');
  for (const name of ['frames/canvas.js', 'frames/frames.html',
    'sprites/DefineSprite_270/canvas.js', 'sprites/DefineSprite_270/frames.html'])
    assert(files.some(file => file.path === `${EXPORT}/${name}`));
  const receipt = {schemaVersion: 1, kind: 'alg-l06-p015-ffdec-canvas-export-v1',
    animationId: ID, source: SOURCE_PIN, tool: 'JPEXS Free Flash Decompiler v.26.2.1',
    command: ['ffdec', '-config', 'packJavaScripts=false', '-onerror', 'abort', '-format',
      'frame:canvas,sprite:canvas', '-export', 'frame,sprite', EXPORT,
      `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`], sourceAudit: INPUT.audit, files,
    status: 'source extraction only; no renderer or acceptance'};
  fs.writeFileSync(path.join(ROOT, RECEIPT), json(receipt), {flag: 'wx'});
  console.log(JSON.stringify({status: 'sealed-export', files: files.length, receipt: RECEIPT}));
}

export function buildP015Canvas() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT, 'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT);
  readPinned(SOURCE_ROOT, SOURCE_PIN);
  const inputs = Object.fromEntries(Object.entries(INPUT).map(([key, value]) => [key, readPinned(ROOT, value)]));
  const receiptBytes = readPinned(ROOT, {path: RECEIPT});
  const receipt = JSON.parse(receiptBytes);
  assert.equal(receipt.kind, 'alg-l06-p015-ffdec-canvas-export-v1');
  assert.deepEqual(receipt.source, SOURCE_PIN);
  assert.deepEqual(receipt.files, inventory(EXPORT));
  const audit = JSON.parse(inputs.audit), composition = JSON.parse(inputs.composition);
  const text = JSON.parse(inputs.text), binary = JSON.parse(inputs.binary);
  const scripts = JSON.parse(inputs.scripts);
  assert.equal(audit.source.sha256, SWF_SHA);
  assert.equal(binary.trailers.length, 0);
  assert.deepEqual([composition.main.domainId, composition.main.rootEntryFrame,
    composition.main.declaredFrames], ['sprite-270', 6, 914]);
  const rootPlaces = composition.root.events.filter(event => event.frame === 6 && event.kind === 'place');
  assert.deepEqual(rootPlaces.map(event => [event.depth, event.characterId, ...event.matrix.slice(4)]),
    [[1, 1, 0, 0], [2, 270, 8248, 5666]]);
  assert.deepEqual(composition.masks.map(mask =>
    [mask.domain, mask.frame, mask.characterId, mask.depth, mask.clipDepth]),
  [['sprite-270', 164, 31, 1, 10], ['sprite-270', 271, 31, 11, 20],
    ['sprite-270', 350, 31, 21, 23], ['sprite-270', 732, 260, 77, 80],
    ['sprite-270', 778, 263, 82, 85], ['sprite-270', 873, 267, 82, 85]]);
  assert.deepEqual([binary.morphs.length, binary.buttons.length,
    text.summary.textDefinitions, text.summary.dynamicFields], [10, 6, 15, 0]);
  assert.equal(scripts.files.length, 8);
  const xml = gunzipSync(inputs.xml).toString();
  for (const mask of composition.masks)
    assert(xml.includes(`objectID="${mask.characterId}" clipDepth="${mask.clipDepth}"`),
      `source mask placement: ${mask.characterId}`);
  const frames = inputs.frames.toString().replace(/\r\n?/gu, '\n');
  const root = inputs.rootFrames.toString().replace(/\r\n?/gu, '\n');
  const canvas = frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header = frames.match(/function sprite270\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas && header);
  assert.deepEqual([+canvas[1], +canvas[2], +header[1], +header[2], +header[3]],
    [1089, 397, 739.5, 208.25, 914]);
  const definitions = frames.slice(0, frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length > 0, 'FFDec definition boundary');
  const placed = [...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
    .map(match => match[1]))].sort();
  const fonts = [...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(match => match[1]);
  const images = [...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(match => match[1]);
  const textNames = [...new Set([...definitions.matchAll(/function\s+(text\d+)\(ctx,ctrans,frame,ratio,time\)\{/gu)]
    .map(match => match[1]))].sort();
  assert.deepEqual([placed.length, fonts.length, images.length], [263, 3, 1]);
  assert.deepEqual(textNames.map(name => Number(name.slice(4))).sort((a, b) => a - b),
    text.textDefinitions.map(definition => definition.characterId).sort((a, b) => a - b));
  assert.equal(placed.filter(name => name.startsWith('morphshape')).length, 10);
  assert.deepEqual(placed.filter(name => name.startsWith('button')),
    ['button36', 'button37', 'button38', 'button45', 'button46', 'button47']);
  const rootBlock = root.slice(root.indexOf('function main('));
  const rootFrameSix = rootBlock.slice(rootBlock.indexOf('case 5:'), rootBlock.indexOf('case 6:'));
  const rootLines = rootFrameSix.split('\n').filter(line => /place\("(?:shape1|sprite270)"/u.test(line));
  assert.deepEqual(rootLines.map(line => line.match(/place\("([^"]+)"/u)?.[1]), ['shape1', 'sprite270']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const rootShape = extractFunction(root, 'shape1');
  const spec = {schemaVersion: 1, animationId: `course-${ID}`, finalAnimationId: ID,
    classification: 'unregistered-source-bound-canvas-candidate-v1',
    source: {swf: `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`, swfSha256: SWF_SHA},
    evidence: {scenarioInventory: INPUT.audit.path, scenarioInventorySha256: INPUT.audit.sha256,
      audioAudit: INPUT.binary.path, audioAuditSha256: INPUT.binary.sha256},
    ffdecExport: {tool: 'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper: INPUT.helper.path, helperSha256: INPUT.helper.sha256,
      framesHtml: INPUT.frames.path, framesHtmlSha256: INPUT.frames.sha256,
      targetSpriteObjectId: 270, targetSpriteFunction: 'sprite270',
      exportCanvas: {width: 1089, height: 397},
      exportInternalTranslation: {x: 739.5, y: 208.25},
      expectedPlacedFunctionCount: placed.length,
      expectedPlacedFunctionsSha256: sha(JSON.stringify(placed)),
      expectedFontFunctionCount: fonts.length,
      expectedFontFunctionsSha256: sha(JSON.stringify(fonts)),
      embeddedImageVariableCount: images.length,
      embeddedImageVariablesSha256: sha(JSON.stringify(images))},
    timeline: {fps: 12, stage: {width: 800, height: 600, backgroundColor: '#b8d8f7'},
      root: {frameCount: 10, preloaderStopFrame: 1, beginFrame: 6, beginLabel: 'begin',
        placementName: 'animation', placementTwips: {x: 8248, y: 5666},
        placementPixels: {x: 412.4, y: 283.3}},
      local: {timelineId: 'sprite-270', frameCount: 914, livePlaybackEndFrame: 914,
        playbackMode: 'once', publicFrameIndexing: 'one-indexed'},
      stageRenderOffset: {x: -327.1, y: 75.05}},
    runtimeContract: {kind: 'structural-local-frame', scenarios: ['source-static-frame'],
      defaultScenario: 'source-static-frame', supportedLanguages: ['en'],
      visualLocalization: 'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping: 'fixed-zero-no-source-randomness-executed', blockedLocalFrameRanges: [],
      currentCanonicalFrameDomainDispositionAsserted: false,
      unresolved: ['AVM1 glossary calls are represented by separate native controls.',
        'Continuous source audio and separate optional SA require explicit player clocks.',
        'Original runtime, fidelity, listening and human/Owner gates remain separate.']},
    output: {script: 'canvas-renderer.js', manifest: 'canvas-manifest.json',
      spec: 'adapter-spec.json', globalRegistry: 'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect: 'none'};
  let runtime = buildSafeRuntime({helperSource: inputs.helper.toString(), framesHtml: frames, spec}).runtime;
  runtime = normalizeSourceClipMasks(runtime, [{characterId: 31,
    placements: [{depth: 1, clipDepth: 10}, {depth: 11, clipDepth: 20},
      {depth: 21, clipDepth: 23}],
    rawFill: 'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'}], xml);
  runtime = runtime.replaceAll(`course-${ID}`, ID);
  assert(runtime.includes(`registry["${ID}"]`) && !runtime.includes(`course-${ID}`));
  runtime = replaceOnce(runtime, '\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootShape}\n\nSAFE_OBJECTS = Object.freeze({`, 'source root shape');
  runtime = replaceOnce(runtime, 'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n', 'source root registry');
  const oldDraw = 'ctx.transform(1, 0, 0, 1, -327.1, 75.05);\n        sprite270(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
  const rootBefore = 'var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
    + `        var time = state.exportFrame;\n        ${rootLines[0].trim()}\n        `;
  runtime = replaceOnce(runtime, oldDraw, rootBefore + oldDraw, 'root depth-1 artwork');
  // FFDec's source clips mutate the 2D context. A fresh offscreen drawing
  // surface for every query prevents masks from leaking across sought frames.
  runtime = replaceOnce(runtime, '    var ctx = targetCanvas.getContext("2d");',
    '    var drawingCanvas = document.createElement("canvas");\n'
    + '    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
    + '    var ctx = drawingCanvas.getContext("2d");', 'fresh source drawing canvas');
  runtime = replaceOnce(runtime, '    canvas = targetCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
    '    canvas = drawingCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
    'isolate source drawing context');
  runtime = replaceOnce(runtime, '        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
    '        canvas = previousCanvas;\n    }\n'
    + '    targetCanvas.width = 800;\n'
    + '    var targetCtx = targetCanvas.getContext("2d");\n'
    + '    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
    + '    targetCtx.drawImage(drawingCanvas, 0, 0);\n'
    + '    if (typeof targetCanvas.setAttribute === "function") {',
    'copy isolated source frame to host surface');
  new Script(runtime);
  const script = Buffer.from(runtime);
  const sourceDepthOrder = rootPlaces.map(event => ({depth: event.depth, characterId: event.characterId}));
  const sourceGlyphRendering = {definitions: 15, dynamicFields: 0, preserved: true,
    nativeBinding: 'semantic-flow-companion', canvasAriaHiddenByHost: true};
  const sourceClipMasks = composition.masks.map(({domain, frame, depth, clipDepth, characterId}) =>
    ({domain, frame, depth, clipDepth, characterId}));
  const metadata = json({animationId: ID, sourceSwfSha256: SWF_SHA,
    stage: {width: 800, height: 600}, fps: 12, rootFrame: 6,
    frameDomain: 'sprite-270', frameCount: 914, scenario: 'source-static-frame',
    visualLocalization: 'source-en-fallback', sourceDepthOrder, sourceGlyphRendering,
    sourceClipMasks, sourceMorphCharacterIds: binary.morphs.map(morph => morph.characterId),
    sourceGlossaryButtons: composition.buttons.map(button => ({characterId: button.characterId,
      placements: button.placements})), embeddedImageVariables: images,
    stageRenderOffset: {x: -327.1, y: 75.05},
    assetPath: `/flash-assets/g678-local/${ID}/canvas-renderer.js`,
    assetSha256: sha(script)});
  const ts = Buffer.from('/* Generated by scripts/build-alg-l06-p015-canvas-v1.mjs. Do not edit. */\n'
    + `export const P015_CANVAS_V1 = ${metadata.toString().trim()} as const;\n`);
  const manifest = json({schemaVersion: 1, kind: 'alg-l06-p015-maintained-canvas-v1',
    animationId: ID, status: 'unregistered-drawing-candidate', source: SOURCE_PIN,
    rootFrame: 6, mainFrameCount: 914, stage: {width: 800, height: 600},
    sourceDepthOrder, sourceGlyphRendering, sourceClipMasks,
    sourceMorphCharacterIds: binary.morphs.map(morph => morph.characterId),
    sourceMaskNormalization: {solidShape31: true,
      outlinedMasksPreserved: [260, 267], solidBlackMask: [263],
      originalRuntimeComparisonPending: true},
    inputs: [...Object.entries(INPUT).map(([key, value]) => ({key, ...pin(value.path, inputs[key])})),
      {key: 'exportReceipt', ...pin(RECEIPT, receiptBytes)}],
    outputs: [pin(`${OUT}/canvas-renderer.js`, script), pin(GENERATED, ts)],
    acceptanceEffects: {currentJsRegistered: false, originalRuntime: false,
      fidelity: false, listening: false, human: false, owner: false,
      strictComplete: false, publication: false}});
  return {runtime: script, metadata: ts, manifest};
}

function main() {
  const mode = process.argv[2];
  assert(process.argv.length === 3 && ['--seal-export', '--build', '--check'].includes(mode),
    'usage: build-alg-l06-p015-canvas-v1.mjs --seal-export|--build|--check');
  if (mode === '--seal-export') return sealExport();
  const built = buildP015Canvas();
  if (mode === '--build') fs.mkdirSync(path.join(ROOT, OUT), {recursive: true});
  const files = [[`${OUT}/canvas-renderer.js`, built.runtime],
    [GENERATED, built.metadata], [`${OUT}/canvas-manifest.json`, built.manifest]];
  for (const [name, bytes] of files) {
    const target = path.join(ROOT, name);
    if (mode === '--check') assert(fs.readFileSync(target).equals(bytes), `${name} drifted`);
    else fs.writeFileSync(target, bytes);
  }
  console.log(JSON.stringify({status: mode === '--check' ? 'verified' : 'built',
    files: files.map(([name, bytes]) => pin(name, bytes))}));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
