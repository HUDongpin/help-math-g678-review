#!/usr/bin/env node
/** Source-bound P017 Canvas drawing plane; AVM1, audio and host state live elsewhere. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID = 'shared-alg001-l06-p017';
const SWF = 'G6-G8-shared/ALG001/L6/VB/L6VB10.swf';
const SWF_SHA = '7010ecfee54a80298e3bba09400a712cfed65dad983811d9a470bf017156ffb3';
const OUT = 'output/alg-l06-p017-canvas-v1';
const EXPORT = `${OUT}/source-export`;
const RECEIPT = `${OUT}/source-export-receipt.json`;
const GENERATED = `${OUT}/canvas-metadata-v1.json`;
const SOURCE_PIN = Object.freeze({path: SWF, bytes: 245604, sha256: SWF_SHA});
const INPUT = Object.freeze({
  preflight: {path: 'output/alg-l06-p017-source-preflight-v1/source-preflight-v1.json',
    bytes: 23476, sha256: 'bfd7a3a8560839a707726551333572dbd3a91352066fa1a783801f7cff42d3f8'},
  xml: {path: 'output/alg-l06-p017-source-preflight-v1/source.xml',
    bytes: 696230, sha256: '85184af24fbdb8d3e667f4bbb5228621a8d40c140fba3a16bd9f3e7c19798887'},
  helper: {path: `${EXPORT}/sprites/DefineSprite_42/canvas.js`, sha256: '78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  frames: {path: `${EXPORT}/sprites/DefineSprite_42/frames.html`, sha256: 'bd4593245d8f94e63514ac09ab9914d2009d39f5822ac0fd1f785898c5a0a808'},
  rootFrames: {path: `${EXPORT}/frames/frames.html`, sha256: 'dc5c335ec9451d08e35e2e9a76b6fe5f60e04e097225923412a5504e7512c74f'},
  button7: {path: `${EXPORT}/scripts/DefineButton2_7/BUTTONCONDACTION on(release).as`, sha256: '0b89848d79d735127115901984f60c2c8c2996f9561d150573068e496601ed4b'},
  button8: {path: `${EXPORT}/scripts/DefineButton2_8/BUTTONCONDACTION on(release).as`, sha256: 'e67981ababb6763a8fdc125b0cb20c51d96d38d84673298481658fc7994562f3'},
  button9: {path: `${EXPORT}/scripts/DefineButton2_9/BUTTONCONDACTION on(release).as`, sha256: 'bf18a4b6722a58696805f4dd043c6b04a1b1c3cc9a605ef84301790c08bb4cfa'},
  button16: {path: `${EXPORT}/scripts/DefineButton2_16/BUTTONCONDACTION on(release).as`, sha256: 'b9aafff389f456dd2b9b47ba56a2948163956fc001ca6ca2add0a0d55f7f9c05'},
  button19: {path: `${EXPORT}/scripts/DefineButton2_19/BUTTONCONDACTION on(release).as`, sha256: '9ae3cd7e290be4db880c44633e3fd1de46009a6e7772ea958c46d9e0b877a6c6'},
  button23: {path: `${EXPORT}/scripts/DefineButton2_23/BUTTONCONDACTION on(release).as`, sha256: '9ceebfdefec4ee183cacc5a447e0e7eafcc67b43bf3c300be660afb8a2434828'},
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
function ensureExport() {
  const folder = path.join(ROOT, EXPORT);
  if (fs.existsSync(folder)) {
    assert(fs.readdirSync(folder).length > 0, 'empty existing source export requires review');
    return;
  }
  fs.mkdirSync(folder, {recursive: true});
  const source = path.join(SOURCE_ROOT, SWF);
  execFileSync('ffdec', ['-config', 'packJavaScripts=false', '-onerror', 'abort', '-format',
    'frame:canvas,sprite:canvas', '-export', 'frame,sprite', folder, source],
  {encoding: 'utf8', maxBuffer: 2e6});
  execFileSync('ffdec', ['-onerror', 'abort', '-export', 'script', folder, source],
    {encoding: 'utf8', maxBuffer: 2e6});
}
function expectedExportReceipt() {
  const files = inventory(EXPORT);
  const expected = ['frames/canvas.js', 'frames/frames.html',
    'sprites/DefineSprite_42/canvas.js', 'sprites/DefineSprite_42/frames.html',
    ...[7, 8, 9, 16, 19, 23].map(id=>
      `scripts/DefineButton2_${id}/BUTTONCONDACTION on(release).as`),
    'scripts/frame_1/DoAction.as', 'scripts/frame_6/DoAction.as']
    .map(name => `${EXPORT}/${name}`).sort();
  assert.deepEqual(files.map(file => file.path).sort(), expected,
    'exact root, sprite and eight AVM1 public exports');
  const receipt = {schemaVersion: 1, kind: 'alg-l06-p017-ffdec-canvas-export-v1',
    animationId: ID, source: SOURCE_PIN, tool: 'JPEXS Free Flash Decompiler v.26.2.1',
    canvasCommand: ['ffdec', '-config', 'packJavaScripts=false', '-onerror', 'abort',
      '-format', 'frame:canvas,sprite:canvas', '-export', 'frame,sprite', EXPORT,
      `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
    scriptsCommand: ['ffdec', '-onerror', 'abort', '-export', 'script', EXPORT,
      `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
    sourceXml: INPUT.xml, sourcePreflight: INPUT.preflight, files,
    status: 'source extraction only; no original runtime or acceptance'};
  return json(receipt);
}
function sealExport(mode) {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT);
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT);
  readPinned(SOURCE_ROOT, SOURCE_PIN);
  if (mode === '--write') {
    const help = execFileSync('ffdec', ['-help', 'export'], {encoding: 'utf8', maxBuffer: 2e6});
    assert(help.includes('v.26.2.1') && help.includes('sprite:canvas'));
    ensureExport();
  }
  const bytes = expectedExportReceipt(), target = path.join(ROOT, RECEIPT);
  if (fs.existsSync(target)) assert(fs.readFileSync(target).equals(bytes), 'source export receipt drift');
  else if (mode === '--write') fs.writeFileSync(target, bytes, {flag: 'wx'});
  else assert.fail('source export receipt missing');
}

export function buildP017Canvas() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT, 'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT);
  readPinned(SOURCE_ROOT, SOURCE_PIN);
  const inputs = Object.fromEntries(Object.entries(INPUT).map(([key, value]) => [key, readPinned(ROOT, value)]));
  const generatorInputs = [
    ['generator', 'scripts/build-alg-l06-p017-canvas-v1.mjs'],
    ['safeAdapter', 'scripts/build-safe-ffdec-canvas-adapter.mjs'],
    ['clipNormalizer', 'scripts/lib/g678-source-clip-masks-v1.mjs'],
  ].map(([key,name])=>({key,...pin(name,readPinned(ROOT,{path:name}))}));
  const receiptBytes = readPinned(ROOT, {path: RECEIPT});
  const receipt = JSON.parse(receiptBytes);
  assert.equal(receipt.kind, 'alg-l06-p017-ffdec-canvas-export-v1');
  assert.deepEqual(receipt.source, SOURCE_PIN);
  assert.deepEqual(receipt.files, inventory(EXPORT));
  assert(receiptBytes.equals(expectedExportReceipt()), 'reproducible source export receipt');
  const preflight = JSON.parse(inputs.preflight), xml = inputs.xml.toString();
  assert.equal(preflight.kind, 'alg-l06-p017-source-preflight-v1');
  assert.equal(preflight.identity.animationId, ID);
  assert.deepEqual([preflight.source.swf.bytes,preflight.source.swf.sha256],
    [SOURCE_PIN.bytes,SOURCE_PIN.sha256]);
  assert.deepEqual([preflight.swf.header.stageBoundsTwips.right,
    preflight.swf.header.stageBoundsTwips.bottom,preflight.swf.header.frameRate,
    preflight.swf.header.frameCount],[16000,12000,12,10]);
  assert.deepEqual([preflight.swf.rootPlacement.frame,preflight.swf.rootPlacement.depth,
    preflight.swf.timelines[1].timelineId,preflight.swf.timelines[1].observedFrames],
    [6,2,'sprite-42',721]);
  assert.deepEqual([preflight.swf.summary.staticTextDefinitions,
    preflight.swf.summary.dynamicFields,preflight.swf.summary.buttonDefinitions,
    preflight.swf.summary.unparsedTags],[20,0,6,0]);
  assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<swf version="6" compressed="1">'));
  assert(xml.includes('<DefineSprite objectID="42" frames="721">'));
  assert(xml.includes('<PlaceObject2 replace="0" depth="2" objectID="42" morph="5" name="animation">'));
  assert(/<Transform transX="8248" transY="5666"\s*\/>/u.test(xml));
  const sourceTextIds=[...xml.matchAll(/<DefineText objectID="(\d+)"/gu)]
    .map(match=>Number(match[1])).sort((a,b)=>a-b);
  const morphIds=[...xml.matchAll(/<DefineMorphShape objectID="(\d+)"/gu)]
    .map(match=>Number(match[1])).sort((a,b)=>a-b);
  assert.deepEqual([sourceTextIds.length,morphIds.length,
    [...xml.matchAll(/<DefineEditText\b/gu)].length,
    [...xml.matchAll(/<DefineButton2\b/gu)].length],[20,0,0,6]);
  const spriteXml=xml.slice(xml.indexOf('<DefineSprite objectID="42"'),
    xml.indexOf('</DefineSprite>')+'</DefineSprite>'.length);
  let sourceFrame=1;
  const masks=[],buttonPlacements=[];
  const buttonIds=new Set([7,8,9,16,19,23]);
  for(const tag of spriteXml.match(/<(?:ShowFrame|PlaceObject2)\b[^>]*\/?\s*>/gu)??[]){
    if(tag.startsWith('<ShowFrame')){sourceFrame++;continue;}
    const attributes=Object.fromEntries([...tag.matchAll(/([A-Za-z]+)="([^"]*)"/gu)]
      .map(match=>[match[1],match[2]]));
    if(attributes.clipDepth)masks.push({domain:'sprite-42',frame:sourceFrame,
      characterId:Number(attributes.objectID),depth:Number(attributes.depth),
      clipDepth:Number(attributes.clipDepth)});
    if(buttonIds.has(Number(attributes.objectID)))buttonPlacements.push({frame:sourceFrame,
      characterId:Number(attributes.objectID),depth:Number(attributes.depth)});
  }
  assert.deepEqual(masks.map(({frame,characterId,depth,clipDepth})=>
    [frame,characterId,depth,clipDepth]),
    [[2,2,1,10],[64,13,11,16],[80,2,17,22],[133,2,23,28],[233,2,29,31]]);
  assert.deepEqual(buttonPlacements.map(({characterId,frame})=>[characterId,frame]),
    [[7,2],[8,2],[9,2],[16,64],[19,80],[23,133]]);
  assert.deepEqual(preflight.swf.maskPlacements.map(({frame,characterId,depth,clipDepth})=>
    [frame,characterId,depth,clipDepth]),
    masks.map(({frame,characterId,depth,clipDepth})=>[frame,characterId,depth,clipDepth]));
  for(const [id,key] of [[7,'Equation'],[8,'Sentence'],[9,'Function'],[16,'Rule'],
    [19,'Output variable'],[23,'Input variable']]){
    const script=inputs[`button${id}`].toString();
    assert(script.includes(`_global.KeyAttribute = "${key}"`),`exact glossary key ${key}`);
    assert(script.includes('_root.DoHyperLinks()')&&script.includes('stop()'),
      `source glossary calls and stop ${key}`);
  }
  assert.deepEqual(preflight.swf.glossaryButtons.map(({characterId,keyAttribute})=>
    [characterId,keyAttribute]),[[7,'Equation'],[8,'Sentence'],[9,'Function'],
      [16,'Rule'],[19,'Output variable'],[23,'Input variable']]);
  assert(inputs.rootScript1.toString().includes('InternalPreloader.gotoAndPlay("jump_check")'));
  assert(inputs.rootScript6.toString().trim()==='stop();');
  const rootPlaces=[{depth:1,characterId:1},{depth:2,characterId:42}];
  const frames = inputs.frames.toString().replace(/\r\n?/gu, '\n');
  const root = inputs.rootFrames.toString().replace(/\r\n?/gu, '\n');
  const canvas = frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header = frames.match(/function sprite42\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas && header);
  assert.deepEqual([+canvas[1], +canvas[2], +header[1], +header[2], +header[3]],
    [997, 397, 686.75, 208.3, 721]);
  const definitions = frames.slice(0, frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length > 0, 'FFDec definition boundary');
  const placed = [...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
    .map(match => match[1]))].sort();
  const fonts = [...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(match => match[1]);
  const images = [...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(match => match[1]);
  const textNames = [...new Set([...definitions.matchAll(/function\s+(text\d+)\(ctx,ctrans,frame,ratio,time\)\{/gu)]
    .map(match => match[1]))].sort();
  assert.deepEqual([placed.length, fonts.length, images.length], [38, 1, 0]);
  assert.deepEqual(textNames.map(name => Number(name.slice(4))).sort((a, b) => a - b),
    sourceTextIds);
  assert.equal(placed.filter(name => name.startsWith('morphshape')).length, 0);
  assert.deepEqual(placed.filter(name => name.startsWith('button')),
    ['button16','button19','button23','button7','button8','button9']);
  const rootBlock = root.slice(root.indexOf('function main('));
  const rootFrameSix = rootBlock.slice(rootBlock.indexOf('case 5:'), rootBlock.indexOf('case 6:'));
  const rootLines = rootFrameSix.split('\n').filter(line => /place\("(?:shape1|sprite42)"/u.test(line));
  assert.deepEqual(rootLines.map(line => line.match(/place\("([^"]+)"/u)?.[1]), ['shape1', 'sprite42']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const rootShape = extractFunction(root, 'shape1');
  const spec = {schemaVersion: 1, animationId: `course-${ID}`, finalAnimationId: ID,
    classification: 'unregistered-source-bound-canvas-candidate-v1',
    source: {swf: `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`, swfSha256: SWF_SHA},
    evidence: {scenarioInventory: INPUT.preflight.path, scenarioInventorySha256: INPUT.preflight.sha256,
      audioAudit: INPUT.preflight.path, audioAuditSha256: INPUT.preflight.sha256,
      sourceXml: INPUT.xml.path, sourceXmlSha256: INPUT.xml.sha256,
      sourceButtonScript: INPUT.button9.path,
      sourceButtonScriptSha256: INPUT.button9.sha256},
    ffdecExport: {tool: 'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper: INPUT.helper.path, helperSha256: INPUT.helper.sha256,
      framesHtml: INPUT.frames.path, framesHtmlSha256: INPUT.frames.sha256,
      targetSpriteObjectId: 42, targetSpriteFunction: 'sprite42',
      exportCanvas: {width: 997, height: 397},
      exportInternalTranslation: {x: 686.75, y: 208.3},
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
      local: {timelineId: 'sprite-42', frameCount: 721, livePlaybackEndFrame: 721,
        playbackMode: 'once', publicFrameIndexing: 'one-indexed'},
      stageRenderOffset: {x: -274.35, y: 75}},
    runtimeContract: {kind: 'structural-local-frame', scenarios: ['source-static-frame'],
      defaultScenario: 'source-static-frame', supportedLanguages: ['en'],
      visualLocalization: 'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping: 'fixed-zero-no-source-randomness-executed', blockedLocalFrameRanges: [],
      currentCanonicalFrameDomainDispositionAsserted: false,
      unresolved: ['Six AVM1 glossary calls require separate explicit native controls.',
        'Continuous source audio and separate optional SA require explicit player clocks.',
        'Original runtime, fidelity, listening and human/Owner gates remain separate.']},
    output: {script: 'canvas-renderer.js', manifest: 'canvas-manifest.json',
      spec: 'adapter-spec.json', globalRegistry: 'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect: 'none'};
  let runtime = buildSafeRuntime({helperSource: inputs.helper.toString(), framesHtml: frames, spec}).runtime;
  runtime = normalizeSourceClipMasks(runtime, [{characterId: 2,
    placements: [{depth: 1, clipDepth: 10}, {depth: 17, clipDepth: 22},
      {depth: 23, clipDepth: 28}, {depth: 29, clipDepth: 31}],
    rawFill: 'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'},
  {characterId: 13, placements: [{depth: 11, clipDepth: 16}],
    rawFill: 'ctx.fillStyle=tocolor(ctrans.apply([254,213,171,1]));'}], xml);
  runtime = runtime.replaceAll(`course-${ID}`, ID);
  assert(runtime.includes(`registry["${ID}"]`) && !runtime.includes(`course-${ID}`));
  runtime = replaceOnce(runtime, '\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootShape}\n\nSAFE_OBJECTS = Object.freeze({`, 'source root shape');
  runtime = replaceOnce(runtime, 'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n', 'source root registry');
  const oldDraw = 'ctx.transform(1, 0, 0, 1, -274.35, 75);\n        sprite42(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
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
  const sourceGlyphRendering = {definitions: 20, dynamicFields: 0, preserved: true,
    nativeBinding: 'semantic-flow-companion', canvasAriaHiddenByHost: true};
  const sourceClipMasks = masks;
  const metadata = json({animationId: ID, sourceSwfSha256: SWF_SHA,
    stage: {width: 800, height: 600}, fps: 12, rootFrame: 6,
    frameDomain: 'sprite-42', frameCount: 721, scenario: 'source-static-frame',
    visualLocalization: 'source-en-fallback', sourceDepthOrder, sourceGlyphRendering,
    sourceClipMasks, sourceMorphCharacterIds: morphIds,
    sourceGlossaryButtons: preflight.swf.glossaryButtons.map(({characterId,keyAttribute})=>({
      characterId,keyAttribute,placements:buttonPlacements.filter(item=>
        item.characterId===characterId).map(({frame,depth})=>({frame,depth}))})),
    embeddedImageVariables: images,
    stageRenderOffset: {x: -274.35, y: 75},
    assetPath: `/flash-assets/g678-local/${ID}/canvas-renderer.js`,
    assetSha256: sha(script)});
  const manifest = json({schemaVersion: 1, kind: 'alg-l06-p017-maintained-canvas-v1',
    animationId: ID, status: 'unregistered-drawing-candidate', source: SOURCE_PIN,
    rootFrame: 6, mainFrameCount: 721, stage: {width: 800, height: 600},
    sourceDepthOrder, sourceGlyphRendering, sourceClipMasks,
    sourceMorphCharacterIds: morphIds,
    sourceMaskNormalization: {solidShapes: [2, 13],
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
  assert(process.argv.length === 3 && ['--write', '--check'].includes(mode),
    'usage: build-alg-l06-p017-canvas-v1.mjs --write|--check');
  sealExport(mode);
  const built = buildP017Canvas();
  const files = [[`${OUT}/canvas-renderer.js`, built.runtime],
    [GENERATED, built.metadata], [`${OUT}/canvas-manifest.json`, built.manifest]];
  for (const [name, bytes] of files) {
    const target = path.join(ROOT, name);
    if (mode === '--check') assert(fs.readFileSync(target).equals(bytes), `${name} drifted`);
    else if (fs.existsSync(target)) assert(fs.readFileSync(target).equals(bytes), `${name} drifted`);
    else fs.writeFileSync(target, bytes, {flag: 'wx'});
  }
  console.log(JSON.stringify({status: mode === '--check' ? 'verified' : 'written',
    files: files.map(([name, bytes]) => pin(name, bytes))}));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
