#!/usr/bin/env node
/** Source-bound P016 Canvas drawing plane; AVM1, audio and host state live elsewhere. */
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
const ID = 'shared-alg001-l06-p016';
const SWF = 'G6-G8-shared/ALG001/L6/VB/L6VB09.swf';
const SWF_SHA = '2fdeba5b4dcfcfe7d1b575ab30d76a98fca802d6be670a679a54378f32aa4ae9';
const AUDIT = `migrations/${ID}/audit`;
const EXPORT = `${AUDIT}/canvas-v1`;
const RECEIPT = `${EXPORT}/extraction-receipt.json`;
const OUT = 'output/alg-l06-p016-canvas-v1';
const GENERATED = `${OUT}/canvas-metadata-v1.json`;
const SOURCE_PIN = Object.freeze({path: SWF, bytes: 413745, sha256: SWF_SHA});
const INPUT = Object.freeze({
  xml: {path: `${EXPORT}/source.xml.gz`, sha256: '58da7b375dda3e57dc9af9584f8bf3bd8eeb7850b67832fd6e0c85c48eda9440'},
  helper: {path: `${EXPORT}/sprites/DefineSprite_139/canvas.js`, sha256: '78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  frames: {path: `${EXPORT}/sprites/DefineSprite_139/frames.html`, sha256: '85593da6ee227dbfd44cf6ed8dcd390c6cad7bb6c5a3c179f0866536a4fd3cf1'},
  rootFrames: {path: `${EXPORT}/frames/frames.html`, sha256: 'e901115a493467c7b64d5aa0cc25653063444843b2af4ab832d0d1ed862c3f1c'},
  buttonScript: {path: `${EXPORT}/scripts/DefineButton2_10/BUTTONCONDACTION on(release).as`, sha256: 'bf18a4b6722a58696805f4dd043c6b04a1b1c3cc9a605ef84301790c08bb4cfa'},
  rootScript1: {path: `${EXPORT}/scripts/frame_1/DoAction.as`, sha256: 'af7188282949f2613421ba9c8be629f489bbe2ee1e370a072024794b2d2cfc19'},
  rootScript6: {path: `${EXPORT}/scripts/frame_6/DoAction.as`, sha256: '3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655'},
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
  assert.equal(files.length, 8, 'Canvas, source XML and three AVM1 scripts');
  for (const name of ['frames/canvas.js', 'frames/frames.html',
    'sprites/DefineSprite_139/canvas.js', 'sprites/DefineSprite_139/frames.html',
    'source.xml.gz', 'scripts/DefineButton2_10/BUTTONCONDACTION on(release).as',
    'scripts/frame_1/DoAction.as', 'scripts/frame_6/DoAction.as'])
    assert(files.some(file => file.path === `${EXPORT}/${name}`));
  const receipt = {schemaVersion: 1, kind: 'alg-l06-p016-ffdec-canvas-export-v1',
    animationId: ID, source: SOURCE_PIN, tool: 'JPEXS Free Flash Decompiler v.26.2.1',
    command: ['ffdec', '-config', 'packJavaScripts=false', '-onerror', 'abort', '-format',
      'frame:canvas,sprite:canvas', '-export', 'frame,sprite', EXPORT,
      `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
    sourceXml: {tool: 'swfmill 0.3.6', command: ['swfmill', 'swf2xml',
      `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`, `${EXPORT}/source.xml`],
      deterministicCompression: 'gzip -n', pin: INPUT.xml}, files,
    scriptsCommand: ['ffdec', '-onerror', 'abort', '-export', 'script', EXPORT,
      `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
    status: 'source extraction only; no renderer or acceptance'};
  fs.writeFileSync(path.join(ROOT, RECEIPT), json(receipt), {flag: 'wx'});
  console.log(JSON.stringify({status: 'sealed-export', files: files.length, receipt: RECEIPT}));
}

export function buildP016Canvas() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT, 'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT);
  readPinned(SOURCE_ROOT, SOURCE_PIN);
  const inputs = Object.fromEntries(Object.entries(INPUT).map(([key, value]) => [key, readPinned(ROOT, value)]));
  const generatorInputs = [
    ['generator', 'scripts/build-alg-l06-p016-canvas-v1.mjs'],
    ['safeAdapter', 'scripts/build-safe-ffdec-canvas-adapter.mjs'],
    ['clipNormalizer', 'scripts/lib/g678-source-clip-masks-v1.mjs'],
  ].map(([key,name])=>({key,...pin(name,readPinned(ROOT,{path:name}))}));
  const receiptBytes = readPinned(ROOT, {path: RECEIPT});
  const receipt = JSON.parse(receiptBytes);
  assert.equal(receipt.kind, 'alg-l06-p016-ffdec-canvas-export-v1');
  assert.deepEqual(receipt.source, SOURCE_PIN);
  assert.deepEqual(receipt.files, inventory(EXPORT));
  const xml = gunzipSync(inputs.xml).toString();
  assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<swf version="6" compressed="1">'));
  assert(xml.includes('<DefineSprite objectID="139" frames="815">'));
  assert(xml.includes('<PlaceObject2 replace="0" depth="2" objectID="139" morph="5" name="animation">'));
  assert(/<Transform transX="8248" transY="5666"\s*\/>/u.test(xml));
  const sourceTextIds=[...xml.matchAll(/<DefineText objectID="(\d+)"/gu)]
    .map(match=>Number(match[1])).sort((a,b)=>a-b);
  const morphIds=[...xml.matchAll(/<DefineMorphShape objectID="(\d+)"/gu)]
    .map(match=>Number(match[1])).sort((a,b)=>a-b);
  assert.deepEqual([sourceTextIds.length,morphIds.length,
    [...xml.matchAll(/<DefineEditText\b/gu)].length,
    [...xml.matchAll(/<DefineButton2\b/gu)].length],[19,10,0,1]);
  const spriteXml=xml.slice(xml.indexOf('<DefineSprite objectID="139"'),
    xml.indexOf('</DefineSprite>')+'</DefineSprite>'.length);
  let sourceFrame=1;
  const masks=[],buttonPlacements=[];
  for(const tag of spriteXml.match(/<(?:ShowFrame|PlaceObject2)\b[^>]*\/?\s*>/gu)??[]){
    if(tag.startsWith('<ShowFrame')){sourceFrame++;continue;}
    const attributes=Object.fromEntries([...tag.matchAll(/([A-Za-z]+)="([^"]*)"/gu)]
      .map(match=>[match[1],match[2]]));
    if(attributes.clipDepth)masks.push({domain:'sprite-139',frame:sourceFrame,
      characterId:Number(attributes.objectID),depth:Number(attributes.depth),
      clipDepth:Number(attributes.clipDepth)});
    if(attributes.objectID==='10')buttonPlacements.push({frame:sourceFrame,
      depth:Number(attributes.depth)});
  }
  assert.deepEqual(masks.map(({frame,characterId,depth,clipDepth})=>
    [frame,characterId,depth,clipDepth]),
    [[34,2,1,6],[72,2,7,9],[115,2,10,12],
      [373,121,16,18],[412,121,19,21],[459,121,23,25],[557,121,26,29]]);
  assert(buttonPlacements.length>0,'source Function button placement');
  assert(inputs.buttonScript.toString().includes('_global.KeyAttribute = "Function"'));
  assert(inputs.buttonScript.toString().includes('_root.DoHyperLinks()'));
  assert(inputs.rootScript1.toString().includes('InternalPreloader.gotoAndPlay("jump_check")'));
  assert(inputs.rootScript6.toString().trim()==='stop();');
  const rootPlaces=[{depth:1,characterId:1},{depth:2,characterId:139}];
  const frames = inputs.frames.toString().replace(/\r\n?/gu, '\n');
  const root = inputs.rootFrames.toString().replace(/\r\n?/gu, '\n');
  const canvas = frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header = frames.match(/function sprite139\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas && header);
  assert.deepEqual([+canvas[1], +canvas[2], +header[1], +header[2], +header[3]],
    [827, 397, 541.2, 208.25, 815]);
  const definitions = frames.slice(0, frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length > 0, 'FFDec definition boundary');
  const placed = [...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
    .map(match => match[1]))].sort();
  const fonts = [...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(match => match[1]);
  const images = [...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(match => match[1]);
  const textNames = [...new Set([...definitions.matchAll(/function\s+(text\d+)\(ctx,ctrans,frame,ratio,time\)\{/gu)]
    .map(match => match[1]))].sort();
  assert.deepEqual([placed.length, fonts.length, images.length], [132, 2, 2]);
  assert.deepEqual(textNames.map(name => Number(name.slice(4))).sort((a, b) => a - b),
    sourceTextIds);
  assert.equal(placed.filter(name => name.startsWith('morphshape')).length, 10);
  assert.deepEqual(placed.filter(name => name.startsWith('button')),['button10']);
  const rootBlock = root.slice(root.indexOf('function main('));
  const rootFrameSix = rootBlock.slice(rootBlock.indexOf('case 5:'), rootBlock.indexOf('case 6:'));
  const rootLines = rootFrameSix.split('\n').filter(line => /place\("(?:shape1|sprite139)"/u.test(line));
  assert.deepEqual(rootLines.map(line => line.match(/place\("([^"]+)"/u)?.[1]), ['shape1', 'sprite139']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const rootShape = extractFunction(root, 'shape1');
  const spec = {schemaVersion: 1, animationId: `course-${ID}`, finalAnimationId: ID,
    classification: 'unregistered-source-bound-canvas-candidate-v1',
    source: {swf: `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`, swfSha256: SWF_SHA},
    evidence: {scenarioInventory: INPUT.xml.path, scenarioInventorySha256: INPUT.xml.sha256,
      audioAudit: INPUT.xml.path, audioAuditSha256: INPUT.xml.sha256,
      sourceXml: INPUT.xml.path, sourceXmlSha256: INPUT.xml.sha256,
      sourceButtonScript: INPUT.buttonScript.path,
      sourceButtonScriptSha256: INPUT.buttonScript.sha256},
    ffdecExport: {tool: 'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper: INPUT.helper.path, helperSha256: INPUT.helper.sha256,
      framesHtml: INPUT.frames.path, framesHtmlSha256: INPUT.frames.sha256,
      targetSpriteObjectId: 139, targetSpriteFunction: 'sprite139',
      exportCanvas: {width: 827, height: 397},
      exportInternalTranslation: {x: 541.2, y: 208.25},
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
      local: {timelineId: 'sprite-139', frameCount: 815, livePlaybackEndFrame: 815,
        playbackMode: 'once', publicFrameIndexing: 'one-indexed'},
      stageRenderOffset: {x: -128.8, y: 75.05}},
    runtimeContract: {kind: 'structural-local-frame', scenarios: ['source-static-frame'],
      defaultScenario: 'source-static-frame', supportedLanguages: ['en'],
      visualLocalization: 'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping: 'fixed-zero-no-source-randomness-executed', blockedLocalFrameRanges: [],
      currentCanonicalFrameDomainDispositionAsserted: false,
      unresolved: ['AVM1 Function glossary call requires a separate explicit native control.',
        'Continuous source audio and separate optional SA require explicit player clocks.',
        'Original runtime, fidelity, listening and human/Owner gates remain separate.']},
    output: {script: 'canvas-renderer.js', manifest: 'canvas-manifest.json',
      spec: 'adapter-spec.json', globalRegistry: 'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect: 'none'};
  let runtime = buildSafeRuntime({helperSource: inputs.helper.toString(), framesHtml: frames, spec}).runtime;
  runtime = normalizeSourceClipMasks(runtime, [{characterId: 2,
    placements: [{depth: 1, clipDepth: 6}, {depth: 7, clipDepth: 9},
      {depth: 10, clipDepth: 12}],
    rawFill: 'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'},
  {characterId: 121,
    placements: [{depth: 16, clipDepth: 18}, {depth: 19, clipDepth: 21},
      {depth: 23, clipDepth: 25}, {depth: 26, clipDepth: 29}],
    rawFill: 'ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));'}], xml);
  runtime = runtime.replaceAll(`course-${ID}`, ID);
  assert(runtime.includes(`registry["${ID}"]`) && !runtime.includes(`course-${ID}`));
  runtime = replaceOnce(runtime, '\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootShape}\n\nSAFE_OBJECTS = Object.freeze({`, 'source root shape');
  runtime = replaceOnce(runtime, 'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n', 'source root registry');
  const oldDraw = 'ctx.transform(1, 0, 0, 1, -128.8, 75.05);\n        sprite139(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
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
  const sourceGlyphRendering = {definitions: 19, dynamicFields: 0, preserved: true,
    nativeBinding: 'semantic-flow-companion', canvasAriaHiddenByHost: true};
  const sourceClipMasks = masks;
  const metadata = json({animationId: ID, sourceSwfSha256: SWF_SHA,
    stage: {width: 800, height: 600}, fps: 12, rootFrame: 6,
    frameDomain: 'sprite-139', frameCount: 815, scenario: 'source-static-frame',
    visualLocalization: 'source-en-fallback', sourceDepthOrder, sourceGlyphRendering,
    sourceClipMasks, sourceMorphCharacterIds: morphIds,
    sourceGlossaryButtons: [{characterId: 10, placements: buttonPlacements}],
    embeddedImageVariables: images,
    stageRenderOffset: {x: -128.8, y: 75.05},
    assetPath: `/flash-assets/g678-local/${ID}/canvas-renderer.js`,
    assetSha256: sha(script)});
  const manifest = json({schemaVersion: 1, kind: 'alg-l06-p016-maintained-canvas-v1',
    animationId: ID, status: 'unregistered-drawing-candidate', source: SOURCE_PIN,
    rootFrame: 6, mainFrameCount: 815, stage: {width: 800, height: 600},
    sourceDepthOrder, sourceGlyphRendering, sourceClipMasks,
    sourceMorphCharacterIds: morphIds,
    sourceMaskNormalization: {solidShapes: [2, 121],
      originalRuntimeComparisonPending: true},
    inputs: [...Object.entries(INPUT).map(([key, value]) => ({key, ...pin(value.path, inputs[key])})),
      ...generatorInputs,
      {key: 'exportReceipt', ...pin(RECEIPT, receiptBytes)}],
    outputs: [pin(`${OUT}/canvas-renderer.js`, script), pin(GENERATED, metadata)],
    acceptanceEffects: {currentJsRegistered: false, originalRuntime: false,
      fidelity: false, listening: false, human: false, owner: false,
      strictComplete: false, publication: false}});
  return {runtime: script, metadata, manifest};
}

function main() {
  const mode = process.argv[2];
  assert(process.argv.length === 3 && ['--seal-export', '--build', '--check'].includes(mode),
    'usage: build-alg-l06-p016-canvas-v1.mjs --seal-export|--build|--check');
  if (mode === '--seal-export') return sealExport();
  const built = buildP016Canvas();
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
