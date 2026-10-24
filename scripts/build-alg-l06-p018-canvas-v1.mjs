#!/usr/bin/env node
/** Source-bound P018 drawing plane. AVM1, audio, glossary and My Lesson state are separate. */
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID = 'shared-alg001-l06-p018';
const SWF = 'G6-G8-shared/ALG001/L6/VB/L6VB11.swf';
const SOURCE = Object.freeze({path: SWF, bytes: 223574,
  sha256: '400f0cdcb574864c7e9e2208f986e91f26e10f796623b6ea41d80a59310e167a'});
const OUT = 'output/alg-l06-p018-canvas-v1';
const XML = `${OUT}/source.xml`;
const EXPORT = `${OUT}/source-export`;
const PCODE = `${OUT}/source-pcode`;
const RECEIPT = `${OUT}/source-export-receipt.json`;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const pin = (name, bytes) => ({path: name, bytes: bytes.length, sha256: sha(bytes)});

function readPhysical(base, item) {
  const file = path.resolve(base, item.path);
  assert(file.startsWith(`${base}${path.sep}`) && fs.realpathSync(file) === file,
    `physical source path: ${item.path}`);
  const before = fs.lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n,
    `ordinary single-link file: ${item.path}`);
  const bytes = fs.readFileSync(file), after = fs.lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'nlink'])
    assert.equal(before[key], after[key], `stable ${key}: ${item.path}`);
  if (item.bytes !== undefined) assert.equal(bytes.length, item.bytes, `size: ${item.path}`);
  if (item.sha256) assert.equal(sha(bytes), item.sha256, `SHA: ${item.path}`);
  return bytes;
}
function inventory(directory) {
  return fs.readdirSync(path.join(ROOT, directory), {withFileTypes: true})
    .sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(entry => {
      assert(!entry.isSymbolicLink(), 'source export symlink');
      const name = `${directory}/${entry.name}`;
      return entry.isDirectory() ? inventory(name) : [pin(name, readPhysical(ROOT, {path: name}))];
    });
}
function replaceOnce(source, needle, replacement, label) {
  const at = source.indexOf(needle);
  assert(at >= 0 && source.indexOf(needle, at + needle.length) < 0, `unique ${label}`);
  return source.slice(0, at) + replacement + source.slice(at + needle.length);
}
function functionSource(source, name) {
  const at = source.indexOf(`function ${name}(`);
  const end = source.indexOf('\nfunction ', at + 1);
  assert(at >= 0 && end > at && source.indexOf(`function ${name}(`, at + 1) < 0,
    `unique ${name} function`);
  return source.slice(at, end).trimEnd();
}
function assertToolVersions() {
  const ffdec = execFileSync('ffdec', ['-help', 'export'], {encoding: 'utf8', maxBuffer: 2e6});
  assert(ffdec.includes('v.26.2.1') && ffdec.includes('sprite:canvas') &&
    ffdec.includes('script:pcodehex'), 'FFDec 26.2.1 export contract');
  const mill = spawnSync('swfmill', ['--version'], {encoding: 'utf8'});
  assert.equal(mill.status, 0, 'swfmill version command');
  assert(`${mill.stdout}${mill.stderr}`.includes('swfmill 0.3.6'), 'swfmill 0.3.6 contract');
}
function exportIfMissing(mode) {
  const source = path.join(SOURCE_ROOT, SWF);
  const xml = path.join(ROOT, XML), canvas = path.join(ROOT, EXPORT), pcode = path.join(ROOT, PCODE);
  if (mode === '--check') return;
  assertToolVersions();
  if (!fs.existsSync(xml)) execFileSync('swfmill', ['-n', 'swf2xml', source, xml], {maxBuffer: 2e6});
  if (!fs.existsSync(canvas)) {
    fs.mkdirSync(canvas, {recursive: true});
    execFileSync('ffdec', ['-config', 'packJavaScripts=false', '-onerror', 'abort',
      '-format', 'frame:canvas,sprite:canvas', '-export', 'frame,sprite', canvas, source], {maxBuffer: 2e6});
    execFileSync('ffdec', ['-onerror', 'abort', '-export', 'script', canvas, source], {maxBuffer: 2e6});
  }
  if (!fs.existsSync(pcode)) {
    fs.mkdirSync(pcode, {recursive: true});
    execFileSync('ffdec', ['-onerror', 'abort', '-format', 'script:pcodehex',
      '-export', 'script', pcode, source], {maxBuffer: 2e6});
  }
}
function sourceReceipt() {
  const files = [...inventory(EXPORT), ...inventory(PCODE), pin(XML, readPhysical(ROOT, {path: XML}))]
    .sort((a, b) => a.path.localeCompare(b.path, 'en'));
  const canvasNames = files.filter(item => item.path.startsWith(`${EXPORT}/`)).map(item => item.path);
  const pcodeNames = files.filter(item => item.path.startsWith(`${PCODE}/`)).map(item => item.path);
  assert.deepEqual(canvasNames.sort(), [
    'frames/canvas.js', 'frames/frames.html',
    ...[2,32].flatMap(n => [`sprites/DefineSprite_${n}/canvas.js`, `sprites/DefineSprite_${n}/frames.html`]),
    ...[8,9,10,11,20].map(n => `scripts/DefineButton2_${n}/BUTTONCONDACTION on(release).as`),
    'scripts/frame_1/DoAction.as', 'scripts/frame_6/DoAction.as',
  ].map(name => `${EXPORT}/${name}`).sort(), 'exact FFDec Canvas/AS membership');
  assert.deepEqual(pcodeNames.sort(), [
    ...[8,9,10,11,20].map(n => `scripts/DefineButton2_${n}/BUTTONCONDACTION on(release).pcode`),
    'scripts/frame_1/DoAction.pcode', 'scripts/frame_6/DoAction.pcode',
  ].map(name => `${PCODE}/${name}`).sort(), 'exact P-code membership');
  return json({schemaVersion: 1, kind: 'alg-l06-p018-physical-source-export-v1',
    animationId: ID, source: SOURCE,
    tools: {ffdec: 'JPEXS Free Flash Decompiler v.26.2.1', swfmill: 'swfmill 0.3.6'},
    commands: [
      ['swfmill', '-n', 'swf2xml', `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`, XML],
      ['ffdec', '-config', 'packJavaScripts=false', '-onerror', 'abort', '-format',
        'frame:canvas,sprite:canvas', '-export', 'frame,sprite', EXPORT,
        `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
      ['ffdec', '-onerror', 'abort', '-export', 'script', EXPORT,
        `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
      ['ffdec', '-onerror', 'abort', '-format', 'script:pcodehex', '-export', 'script',
        PCODE, `$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
    ], files, status: 'static source extraction; no original runtime or acceptance'});
}
function verifySourceReceipt(mode) {
  const bytes = sourceReceipt(), file = path.join(ROOT, RECEIPT);
  if (fs.existsSync(file)) assert(fs.readFileSync(file).equals(bytes), 'source export drift');
  else if (mode === '--write') fs.writeFileSync(file, bytes, {flag: 'wx'});
  else assert.fail('source export receipt missing');
  return bytes;
}
function sourcePlacements(xml) {
  const start = xml.indexOf('<DefineSprite objectID="32" frames="648">');
  const end = xml.indexOf('</DefineSprite>', start);
  assert(start >= 0 && end > start, 'sprite 32 source XML');
  const sprite = xml.slice(start, end);
  let frame = 1;
  const masks = [], buttons = [];
  for (const tag of sprite.match(/<(?:ShowFrame|PlaceObject2)\b[^>]*\/?\s*>/gu) ?? []) {
    if (tag.startsWith('<ShowFrame')) { frame++; continue; }
    const a = Object.fromEntries([...tag.matchAll(/([A-Za-z]+)="([^"]*)"/gu)]
      .map(m => [m[1], m[2]]));
    if (a.clipDepth) masks.push({frame, characterId: +a.objectID, depth: +a.depth,
      clipDepth: +a.clipDepth});
    if ([8,9,10,11,20].includes(+a.objectID)) buttons.push({frame,
      characterId: +a.objectID, depth: +a.depth});
  }
  assert.deepEqual(masks.map(m => [m.frame,m.characterId,m.depth,m.clipDepth]),
    [[2,3,1,12],[65,17,13,18],[317,3,19,26],[382,17,27,29]]);
  assert.deepEqual(buttons.map(b => [b.frame,b.characterId,b.depth]),
    [[2,8,4],[2,9,6],[2,10,8],[2,11,10],[65,20,16],[317,8,22],[317,11,24]]);
  return {masks, buttons};
}

export function buildP018Canvas() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, SOURCE_ROOT, 'real AWS root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT);
  readPhysical(SOURCE_ROOT, SOURCE);
  const sourceReceiptBytes = readPhysical(ROOT, {path: RECEIPT});
  assert(sourceReceiptBytes.equals(sourceReceipt()), 'reproducible source export receipt');
  const xmlBytes = readPhysical(ROOT, {path: XML}), xml = xmlBytes.toString();
  assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<swf version="6" compressed="1">'));
  assert(xml.includes('<DefineSprite objectID="32" frames="648">'));
  assert(xml.includes('<PlaceObject2 replace="0" depth="1" objectID="2" morph="5" name="Mc_Page_Title">'));
  assert(xml.includes('<PlaceObject2 replace="0" depth="3" objectID="32" morph="5" name="animation">'));
  assert.deepEqual([...xml.matchAll(/<DefineText objectID="(\d+)"/gu)].length, 17);
  assert.deepEqual([...xml.matchAll(/<DefineMorphShape\b/gu)].length, 0);
  assert.deepEqual([...xml.matchAll(/<DefineEditText\b/gu)].length, 0);
  assert.deepEqual([...xml.matchAll(/<DefineButton2\b/gu)].length, 5);
  const {masks, buttons} = sourcePlacements(xml);
  const inputs = {
    preflight: 'output/alg-l06-p018-source-preflight-v1/source-preflight-v1.json',
    xml: XML,
    helper: `${EXPORT}/sprites/DefineSprite_32/canvas.js`,
    frames: `${EXPORT}/sprites/DefineSprite_32/frames.html`,
    rootFrames: `${EXPORT}/frames/frames.html`,
    ...Object.fromEntries([8,9,10,11,20].map(n =>
      [`button${n}`, `${EXPORT}/scripts/DefineButton2_${n}/BUTTONCONDACTION on(release).as`])),
    rootScript1: `${EXPORT}/scripts/frame_1/DoAction.as`,
    rootScript6: `${EXPORT}/scripts/frame_6/DoAction.as`,
  };
  const inputBytes = Object.fromEntries(Object.entries(inputs).map(([key,name]) =>
    [key, readPhysical(ROOT, {path: name})]));
  const preflight = JSON.parse(inputBytes.preflight);
  assert.equal(preflight.identity.animationId, ID);
  assert.equal(preflight.source.swf.sha256, SOURCE.sha256);
  assert.deepEqual([preflight.structuralSourceFacts.header.stage.width,
    preflight.structuralSourceFacts.header.stage.height,
    preflight.structuralSourceFacts.header.fps,
    preflight.structuralSourceFacts.header.rootFrameCount], [800,600,12,10]);
  assert.equal(preflight.structuralSourceFacts.frameDomains.longestStaticallyRootReachableDomain.domainId,
    'sprite-32');
  for (const [id,key] of [[8,'Evaluate'],[9,'Input variable'],[10,'Substitute'],
    [11,'Function'],[20,'Result']]) {
    const script = inputBytes[`button${id}`].toString();
    assert(script.includes(`_global.KeyAttribute = "${key}"`) &&
      script.includes('_root.DoHyperLinks()') &&
      script.includes('_root.animation_mc.animation.stop()'), `source button ${id}: ${key}`);
  }
  assert(inputBytes.rootScript1.toString().includes('InternalPreloader.gotoAndPlay("jump_check")'));
  assert.equal(inputBytes.rootScript6.toString().trim(), 'stop();');
  const frames = inputBytes.frames.toString().replace(/\r\n?/gu, '\n');
  const root = inputBytes.rootFrames.toString().replace(/\r\n?/gu, '\n');
  const canvas = frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header = frames.match(/function sprite32\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas && header);
  assert.deepEqual([+canvas[1],+canvas[2],+header[1],+header[2],+header[3]],
    [863,697,541.2,208.3,648]);
  const definitions = frames.slice(0, frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length > 0);
  const placed = [...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
    .map(m => m[1]))].sort();
  const fonts = [...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
  const images = [...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(m=>m[1]);
  assert.deepEqual([placed.length,fonts,images], [27,['font5'],[]]);
  assert.deepEqual(placed.filter(name=>name.startsWith('button')),
    ['button10','button11','button20','button8','button9']);
  assert.deepEqual(placed.filter(name=>name.startsWith('text')).length, 17);
  const rootBlock = root.slice(root.indexOf('function main('));
  const rootFrameSix = rootBlock.slice(rootBlock.indexOf('case 5:'), rootBlock.indexOf('case 6:'));
  const rootLines = rootFrameSix.split('\n').filter(line=>/place\("(?:sprite2|sprite32)"/u.test(line));
  assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),
    ['sprite2','sprite32']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,400.0,43.1]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const spec = {schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
    classification:'unregistered-source-bound-canvas-candidate-v1',
    source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SWF}`,swfSha256:SOURCE.sha256},
    evidence:{scenarioInventory:inputs.preflight,scenarioInventorySha256:sha(inputBytes.preflight),
      audioAudit:inputs.preflight,audioAuditSha256:sha(inputBytes.preflight),
      sourceXml:XML,sourceXmlSha256:sha(xmlBytes),
      sourceButtonScript:inputs.button11,sourceButtonScriptSha256:sha(inputBytes.button11)},
    ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper:inputs.helper,helperSha256:sha(inputBytes.helper),
      framesHtml:inputs.frames,framesHtmlSha256:sha(inputBytes.frames),
      targetSpriteObjectId:32,targetSpriteFunction:'sprite32',
      exportCanvas:{width:863,height:697},exportInternalTranslation:{x:541.2,y:208.3},
      expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
      expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
      embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
    timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
      root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
        placementName:'animation',placementTwips:{x:8248,y:5666},
        placementPixels:{x:412.4,y:283.3}},
      local:{timelineId:'sprite-32',frameCount:648,livePlaybackEndFrame:648,
        playbackMode:'once',publicFrameIndexing:'one-indexed'},
      stageRenderOffset:{x:-128.8,y:75},
    },
    runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
      defaultScenario:'source-static-frame',supportedLanguages:['en'],
      visualLocalization:'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping:'fixed-zero-no-source-randomness-executed',blockedLocalFrameRanges:[],
      currentCanonicalFrameDomainDispositionAsserted:false,
      unresolved:['Five AVM1 glossary buttons require separate native controls.',
        'Source stream clock and independent SA trigger require a player.',
        'Original runtime, fidelity, listening and human/Owner gates remain open.']},
    output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',
      spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect:'none'};
  let runtime = buildSafeRuntime({helperSource:inputBytes.helper.toString(),framesHtml:frames,spec}).runtime;
  runtime = normalizeSourceClipMasks(runtime,[
    {characterId:3,placements:[{depth:1,clipDepth:12},{depth:19,clipDepth:26}],
      rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'},
    {characterId:17,placements:[{depth:13,clipDepth:18},{depth:27,clipDepth:29}],
      rawFill:'ctx.fillStyle=tocolor(ctrans.apply([254,213,171,1]));'},
  ],xml);
  runtime = runtime.replaceAll(`course-${ID}`,ID);
  assert(runtime.includes(`registry["${ID}"]`) && !runtime.includes(`course-${ID}`));
  const rootDefinitions = [functionSource(root,'shape1'),functionSource(root,'sprite2')].join('\n\n');
  runtime = replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootDefinitions}\n\nSAFE_OBJECTS = Object.freeze({`,'root title definitions');
  runtime = replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n        "sprite2": sprite2,\n',
    'root title objects');
  const oldDraw = 'ctx.transform(1, 0, 0, 1, -128.8, 75);\n        sprite32(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
  const rootBefore = 'var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
    + `        var time = state.exportFrame;\n        ${rootLines[0].trim()}\n        `;
  runtime = replaceOnce(runtime,oldDraw,rootBefore+oldDraw,'root depth-1 title');
  // FFDec clip operations mutate the 2D context. Isolate each queried frame.
  runtime = replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
    '    var drawingCanvas = document.createElement("canvas");\n'
    + '    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
    + '    var ctx = drawingCanvas.getContext("2d");','isolated source canvas');
  runtime = replaceOnce(runtime,'    canvas = targetCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
    '    canvas = drawingCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
    'isolated drawing context');
  runtime = replaceOnce(runtime,
    '        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
    '        canvas = previousCanvas;\n    }\n'
    + '    targetCanvas.width = 800;\n'
    + '    var targetCtx = targetCanvas.getContext("2d");\n'
    + '    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
    + '    targetCtx.drawImage(drawingCanvas, 0, 0);\n'
    + '    if (typeof targetCanvas.setAttribute === "function") {',
    'copy isolated frame to host');
  new Script(runtime);
  const script=Buffer.from(runtime);
  const metadata=json({animationId:ID,sourceSwfSha256:SOURCE.sha256,
    stage:{width:800,height:600},fps:12,rootFrame:6,
    frameDomain:'sprite-32',frameCount:648,scenario:'source-static-frame',
    visualLocalization:'source-en-fallback',
    sourceDepthOrder:[{depth:1,characterId:2},{depth:3,characterId:32}],
    sourceGlyphRendering:{definitions:17,dynamicFields:0,preserved:true,
      nativeBinding:'semantic-flow-companion',canvasAriaHiddenByHost:true},
    sourceClipMasks:masks,sourceMorphCharacterIds:[],
    sourceGlossaryButtons:[[8,'Evaluate'],[9,'Input variable'],[10,'Substitute'],
      [11,'Function'],[20,'Result']].map(([characterId,keyAttribute])=>({
        characterId,keyAttribute,placements:buttons.filter(b=>b.characterId===characterId)
          .map(({frame,depth})=>({frame,depth}))})),
    stageRenderOffset:{x:-128.8,y:75},
    assetPath:`/flash-assets/g678-local/${ID}/canvas-renderer.js`,
    assetSha256:sha(script)});
  const manifest=json({schemaVersion:1,kind:'alg-l06-p018-maintained-canvas-v1',
    animationId:ID,status:'unregistered-drawing-candidate',source:SOURCE,
    rootFrame:6,mainFrameCount:648,stage:{width:800,height:600},
    sourceDepthOrder:[{depth:1,characterId:2},{depth:3,characterId:32}],
    sourceGlyphRendering:{definitions:17,dynamicFields:0,preserved:true},
    sourceClipMasks:masks,sourceMaskNormalization:{solidShapes:[3,17],
      originalRuntimeComparisonPending:true},
    sourceGlossaryButtons:JSON.parse(metadata).sourceGlossaryButtons,
    inputs:[...Object.entries(inputs).map(([key,name])=>({key,...pin(name,inputBytes[key])})),
      ...[['generator','scripts/build-alg-l06-p018-canvas-v1.mjs'],
        ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
        ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs']]
        .map(([key,name])=>({key,...pin(name,readPhysical(ROOT,{path:name}))})),
      {key:'sourceExport',...pin(RECEIPT,sourceReceiptBytes)}],
    outputs:[pin(`${OUT}/canvas-renderer.js`,script),pin(`${OUT}/canvas-metadata-v1.json`,metadata)],
    acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
      listening:false,human:false,owner:false,strictComplete:false,publication:false}});
  return {script,metadata,manifest,spec:json(spec)};
}

function main() {
  const mode=process.argv[2];
  assert(process.argv.length===3 && ['--write','--check'].includes(mode),
    'usage: build-alg-l06-p018-canvas-v1.mjs --write|--check');
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS root');
  readPhysical(SOURCE_ROOT,SOURCE);
  exportIfMissing(mode);
  verifySourceReceipt(mode);
  const built=buildP018Canvas();
  for(const [name,bytes] of [
    [`${OUT}/canvas-renderer.js`,built.script],
    [`${OUT}/canvas-metadata-v1.json`,built.metadata],
    [`${OUT}/canvas-manifest.json`,built.manifest],
    [`${OUT}/adapter-spec.json`,built.spec]]) {
    const target=path.join(ROOT,name);
    if(mode==='--check') assert(fs.readFileSync(target).equals(bytes),`${name} drifted`);
    else if(fs.existsSync(target)) assert(fs.readFileSync(target).equals(bytes),`${name} drifted`);
    else fs.writeFileSync(target,bytes,{flag:'wx'});
  }
  console.log(JSON.stringify({status:mode==='--check'?'verified':'written',
    canvas:pin(`${OUT}/canvas-renderer.js`,built.script),
    metadata:pin(`${OUT}/canvas-metadata-v1.json`,built.metadata)}));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main();
