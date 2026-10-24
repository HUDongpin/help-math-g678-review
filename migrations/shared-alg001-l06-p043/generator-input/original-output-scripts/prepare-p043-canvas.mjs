#!/usr/bin/env node
/** Output-only P043 explicit-frame Canvas draft. No AVM1, audio, host, or registration. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContext, Script} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from '../../../scripts/lib/g678-source-clip-masks-v1.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const ID = 'shared-alg001-l06-p043';
const BASE = 'output/g678-p043-maintained-preparation-20261002-v1';
const SWF = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/TI/L6TI03.swf';
const FILES = {
  swf: SWF,
  index: '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/index.xml',
  sourcePacket: 'output/g678-p043-source-intake-20261002-v1/source-intake-v1.json',
  xml: 'output/g678-p043-source-intake-20261002-v1/audit/swfmill.xml',
  native: `${BASE}/native/native-model-v1.json`,
  plan: `${BASE}/canvas/canvas-extraction-v1.json`,
  frames: `${BASE}/canvas/source-export/sprites/DefineSprite_342/frames.html`,
  rootFrames: `${BASE}/canvas/source-export/frames/frames.html`,
  helper: `${BASE}/canvas/source-export/sprites/DefineSprite_342/canvas.js`,
  adapter: 'scripts/build-safe-ffdec-canvas-adapter.mjs',
  mask: 'scripts/lib/g678-source-clip-masks-v1.mjs',
};
const EXPECTED = {
  swf: '8bec405895d09cc8f7dd9f0da197f67726cb45cab6cc8dec3d15b103bc04a97b',
  index: '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c',
  sourcePacket: '1cfc2954ef13aa4bc786f52fb78752369f85f413d3713ee68217453e1749f13e',
  xml: 'b4a018ccd7c0b5a9b3ef89a623210a6e3da89c59e69da69c7bd353d4cc8f6597',
  native: '158cc7f897d0d23fd55ca87536fba851080e0c26996d69a43eb9e910ce5dae9c',
  plan: '7965b03f90d5c2c659048a24d028633a354400e2e74795393d50bff3f93ce9cf',
  frames: '4a3a09631a4d5dd9464fa7b4fbe684f65f87c7c1ec357228e2f3351d793527ad',
  rootFrames: '3870819fe739d5eb7f1894c819dd9296632abbf065cd51d136d732cb8f7307bf',
  helper: '78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93',
  adapter: '1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd',
  mask: 'e064fb7cb98e66f08e5173bdfc756641b6a8ddae86f7e4dab02e90fdb3bbd70e',
};
const FEEDBACK = Object.freeze({
  202: {kind: 'right', frames: 31, reachable: true},
  235: {kind: 'right', frames: 27, reachable: false},
  247: {kind: 'right', frames: 27, reachable: false},
  275: {kind: 'right', frames: 28, reachable: false},
  292: {kind: 'wrong', frames: 31, reachable: false},
  307: {kind: 'wrong', frames: 29, reachable: true},
  321: {kind: 'wrong', frames: 28, reachable: false},
  335: {kind: 'wrong', frames: 29, reachable: false},
});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

function read(file) {
  const absolute = path.isAbsolute(file) ? file : path.resolve(ROOT, file);
  assert(absolute.startsWith(ROOT + path.sep) || absolute === SWF ||
    absolute === FILES.index, `scope ${file}`);
  assert.equal(fs.realpathSync(absolute), absolute, `physical ${file}`);
  const before = fs.lstatSync(absolute, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n,
    `ordinary ${file}`);
  const bytes = fs.readFileSync(absolute);
  const after = fs.lstatSync(absolute, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs', 'nlink'])
    assert.equal(before[key], after[key], `${file}:${key}`);
  return bytes;
}
function replaceOnce(source, needle, replacement, label) {
  const at = source.indexOf(needle);
  assert(at >= 0 && source.indexOf(needle, at + needle.length) < 0, `unique ${label}`);
  return source.slice(0, at) + replacement + source.slice(at + needle.length);
}
function sourceFunction(source, name) {
  const marker = `function ${name}(`, at = source.indexOf(marker);
  const end = source.indexOf('\nfunction ', at + 1);
  assert(at >= 0 && end > at && source.indexOf(marker, at + 1) < 0, `unique ${name}`);
  return source.slice(at, end).trimEnd();
}

function build() {
  const bytes = Object.fromEntries(Object.entries(FILES).map(([key, name]) => [key, read(name)]));
  for (const [key, expected] of Object.entries(EXPECTED))
    assert.equal(sha(bytes[key]), expected, key);
  assert.equal(bytes.swf.length, 855977);
  assert.equal(bytes.index.length, 13926);
  const packet = JSON.parse(bytes.sourcePacket);
  const plan = JSON.parse(bytes.plan);
  const native = JSON.parse(bytes.native);
  assert.equal(packet.identity.animationId, ID);
  assert.equal(plan.animationId, ID);
  assert.equal(native.animationId, ID);
  assert.equal(plan.physicalSwf.sha256, EXPECTED.swf);
  assert.equal(plan.swfmillXml.sha256, EXPECTED.xml);
  assert.equal(plan.nativeModel.sha256, EXPECTED.native);
  assert.equal(plan.rawFileCount, 72);
  assert.equal(plan.frameCoverage.totalCases, 555);
  let rawTotal = 0, caseTotal = 0;
  for (const [relative, pin] of Object.entries(plan.rawFiles)) {
    const raw = read(`${BASE}/canvas/source-export/${relative}`);
    assert.equal(raw.length, pin.bytes, relative);
    assert.equal(sha(raw), pin.sha256, relative);
    rawTotal += raw.length;
    if (relative === 'frames/frames.html') caseTotal += 10;
    else if (relative.endsWith('/frames.html')) {
      const id = relative.match(/^sprites\/DefineSprite_(\d+)(?:_[^/]+)?\/frames\.html$/u)?.[1];
      assert(id, relative);
      caseTotal += plan.frameCoverage.spriteCasesZeroBased[id];
    }
  }
  assert.equal(rawTotal, plan.rawBytesTotal);
  assert.equal(caseTotal, 555);
  assert.equal(native.projectionProof.spriteFramesChecked, 545);
  assert.equal(native.quiz.holdFrame, 62);
  assert.equal(native.quiz.answerPlacements.find(row => row.label === 'B')?.branch, 'right4');
  assert.equal(native.clipMasks.sourcePlacements.length, 7);
  assert(native.clipMasks.sourcePlacements.every(row => row.spriteId === 202 && row.shapeId === 177));
  const frames = bytes.frames.toString().replace(/\r\n?/gu, '\n');
  const rootFrames = bytes.rootFrames.toString().replace(/\r\n?/gu, '\n');
  for (const id of [287, 303, 317, 333])
    assert.equal(sourceFunction(frames, `text${id}`),
      `function text${id}(ctx,ctrans,frame,ratio,time){\n}`);
  const placed = [...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
    .map(match => match[1]))].sort();
  const fonts = [...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)]
    .map(match => match[1]);
  const images = [...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)]
    .map(match => match[1]);
  assert.equal(placed.length, 191);
  assert.equal(fonts.length, 9);
  assert.equal(images.length, 14);
  assert.equal((frames.match(/function text\d+\(/gu) ?? []).length, 43);
  assert.equal((frames.match(/function morphshape\d+\(/gu) ?? []).length, 46);
  const header = frames.match(/function sprite342\(ctx,ctrans,frame,ratio,time\)\{\s*ctx\.save\(\);\s*ctx\.transform\(1,0,0,1,([^,]+),([^\)]+)\);/u);
  assert(header);
  assert.deepEqual(header.slice(1).map(Number), [600.5, 219.6]);
  const mainRoot = rootFrames.slice(rootFrames.lastIndexOf('function main('));
  const rootCase = mainRoot.slice(mainRoot.indexOf('case 5:'), mainRoot.indexOf('case 6:'));
  assert(rootCase.includes('place("shape148",canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0]'));
  assert(rootCase.includes('place("sprite342",canvas,ctx,[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const spec = {schemaVersion: 1, animationId: `course-${ID}`,
    classification: 'behavior-heavy-unregistered-source-canvas-draft-v1',
    source: {swf: '$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/TI/L6TI03.swf',
      swfSha256: EXPECTED.swf},
    evidence: {scenarioInventory: FILES.sourcePacket, scenarioInventorySha256: EXPECTED.sourcePacket,
      audioAudit: `${BASE}/audio/source-audio-v1.json`,
      audioAuditSha256: sha(read(`${BASE}/audio/source-audio-v1.json`)),
      sourceXml: FILES.xml, sourceXmlSha256: EXPECTED.xml,
      nativeSourceContract: FILES.native, nativeSourceContractSha256: EXPECTED.native},
    ffdecExport: {tool: 'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper: FILES.helper, helperSha256: EXPECTED.helper,
      framesHtml: FILES.frames, framesHtmlSha256: EXPECTED.frames,
      targetSpriteObjectId: 342, targetSpriteFunction: 'sprite342',
      exportCanvas: {width: 1181, height: 498},
      exportInternalTranslation: {x: 600.5, y: 219.6},
      expectedPlacedFunctionCount: placed.length,
      expectedPlacedFunctionsSha256: sha(JSON.stringify(placed)),
      expectedFontFunctionCount: fonts.length,
      expectedFontFunctionsSha256: sha(JSON.stringify(fonts)),
      embeddedImageVariableCount: images.length,
      embeddedImageVariablesSha256: sha(JSON.stringify(images))},
    timeline: {fps: 12, stage: {width: 800, height: 600, backgroundColor: '#b8d8f7'},
      root: {frameCount: 10, preloaderStopFrame: 1, beginFrame: 6,
        placementName: 'animation', placementTwips: {x: 8248, y: 5666},
        placementPixels: {x: 412.4, y: 283.3}},
      local: {timelineId: 'sprite-342', frameCount: 241,
        livePlaybackEndFrame: 62, playbackMode: 'state-explorer',
        publicFrameIndexing: 'one-indexed'},
      stageRenderOffset: {x: -188.10000000000002, y: 63.69999999999999}},
    runtimeContract: {kind: 'structural-local-frame', scenarios: ['source-explicit-frames'],
      defaultScenario: 'source-explicit-frames', supportedLanguages: ['en'],
      visualLocalization: 'source-English visual; Spanish host falls back to source English',
      seedMapping: 'fixed zero; no AVM1 executed', blockedLocalFrameRanges: [],
      currentCanonicalFrameDomainDispositionAsserted: false,
      unresolved: ['Feedback selection and Close actions are page-owned.',
        'Four EditText fields need a measured native companion.',
        'Right4 mask and source image/morph pixels need browser comparison.',
        'Audio and host behavior are separate.']},
    output: {script: 'canvas-renderer-draft.js', manifest: 'canvas-candidate-manifest-v1.json',
      spec: 'adapter-spec-v1.json', globalRegistry: 'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect: 'none'};
  let runtime = buildSafeRuntime({helperSource: bytes.helper.toString(), framesHtml: frames, spec}).runtime;
  runtime = normalizeSourceClipMasks(runtime, [{characterId: 177,
    placements: [{depth: 1, clipDepth: 7}],
    rawFill: 'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,0.43137255]));'}],
  bytes.xml.toString());
  runtime = runtime.replaceAll(`course-${ID}`, ID);
  runtime = replaceOnce(runtime,
    'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
    'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("seed must be fixed zero for this source frame");\n    }',
    'fixed seed');
  const feedbackFrames = {202: 31, 307: 29};
  const validation = `var selectedFeedback = null;\n    if (request.feedback !== undefined && request.feedback !== null) {\n        if (frame !== 62 || typeof request.feedback !== "object" || Array.isArray(request.feedback) || Object.keys(request.feedback).sort().join(",") !== "localFrame,spriteId") throw new Error("feedback requires an exact frame-62 selection");\n        var spriteId = request.feedback.spriteId, localFrame = request.feedback.localFrame;\n        var feedbackFrames = ${JSON.stringify(feedbackFrames)};\n        if (!Number.isSafeInteger(spriteId) || !Object.prototype.hasOwnProperty.call(feedbackFrames,spriteId) || !Number.isSafeInteger(localFrame) || localFrame < 1 || localFrame > feedbackFrames[spriteId]) throw new Error("unsupported feedback sprite or local frame");\n        selectedFeedback = Object.freeze({spriteId:spriteId,localFrame:localFrame,kind:spriteId===307?"wrong":"right",sourceReachable:true});\n    }\n    `;
  runtime = replaceOnce(runtime, '    return Object.freeze({\n        frameDomain:',
    `    ${validation}return Object.freeze({\n        frameDomain:`, 'feedback validation');
  runtime = replaceOnce(runtime, '        audioRendered: false\n    });',
    '        audioRendered: false,\n        feedback: selectedFeedback\n    });',
    'feedback state');
  for (const [id, row] of Object.entries(FEEDBACK)) {
    const regex = new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`, 'gm');
    let count = 0;
    runtime = runtime.replace(regex, (line, indent) => {
      const changed = line.replace(/,1,\(0\+time\)%\d+,61,time\);$/u,
        ',1,P043_FEEDBACK.localFrame-1,61,P043_FEEDBACK.localFrame-1);');
      assert.notEqual(changed, line, `feedback ${id} placement`);
      count++;
      return `${indent}if (P043_FEEDBACK && P043_FEEDBACK.spriteId === ${id}) ${changed.trim()}`;
    });
    assert.equal(count, 1, `feedback ${id}`);
    assert.equal(native.spriteFrameCounts[id], row.frames);
  }
  runtime = replaceOnce(runtime, 'var readyPromise = null;',
    'var P043_FEEDBACK = null;\nvar readyPromise = null;', 'feedback scope');
  runtime = replaceOnce(runtime, '\nSAFE_OBJECTS = Object.freeze({',
    `\n${sourceFunction(rootFrames, 'shape148')}\n\nSAFE_OBJECTS = Object.freeze({`,
    'root title');
  runtime = replaceOnce(runtime, 'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape148": shape148,\n',
    'root registry');
  runtime = replaceOnce(runtime,
    '        sprite342(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);',
    '        place("shape148", targetCanvas, ctx, [0.05,0,0,0.05,0,0], new cxform(0,0,0,0,255,255,255,255), 1, 0, 0, 0);\n        sprite342(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);',
    'root title draw');
  runtime = replaceOnce(runtime, '    var previousCanvas = canvas;\n    canvas = targetCanvas;',
    '    var previousCanvas = canvas;\n    var previousFeedback = P043_FEEDBACK;\n    canvas = targetCanvas;\n    P043_FEEDBACK = state.feedback;',
    'draw scope');
  runtime = replaceOnce(runtime, '        ctx.restore();\n        canvas = previousCanvas;',
    '        ctx.restore();\n        canvas = previousCanvas;\n        P043_FEEDBACK = previousFeedback;',
    'draw cleanup');
  runtime = replaceOnce(runtime,
    '        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));',
    '        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));\n        targetCanvas.setAttribute("data-p043-feedback-sprite", state.feedback ? String(state.feedback.spriteId) : "none");\n        targetCanvas.setAttribute("data-p043-feedback-frame", state.feedback ? String(state.feedback.localFrame) : "none");',
    'readback');
  assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame)\s*\(|\bfetch\s*\(/u.test(runtime));
  new Script(runtime, {filename: 'p043-canvas-renderer-draft.js'});
  const context = createContext({document: {createElement: kind => {
    assert.equal(kind, 'img');
    return {complete: false, naturalWidth: 0};
  }}});
  new Script(runtime).runInContext(context, {timeout: 30000});
  const asset = context.HELP_MATH_CANVAS_ASSETS?.[ID];
  assert(asset);
  for (let frame = 1; frame <= 241; frame++)
    assert.equal(asset.resolveFrameState({frame}).localFrame, frame);
  for (const [spriteId, framesCount] of Object.entries(feedbackFrames))
    for (let localFrame = 1; localFrame <= framesCount; localFrame++)
      assert.equal(asset.resolveFrameState({frame: 62,
        feedback: {spriteId: Number(spriteId), localFrame}}).feedback.localFrame,
      localFrame);
  assert.throws(() => asset.resolveFrameState({frame: 63,
    feedback: {spriteId: 307, localFrame: 1}}), /frame-62/u);
  assert.throws(() => asset.resolveFrameState({frame: 62,
    feedback: {spriteId: 235, localFrame: 1}}), /unsupported feedback/u);
  assert.throws(() => asset.resolveFrameState({frame: 1, seed: 1}), /fixed zero/u);
  const script = Buffer.from(runtime);
  const specBytes = json(spec);
  const dynamicText = json({kind: 'p043-source-dynamic-text-companion-contract-v1',
    animationId: ID, sourceSwfSha256: EXPECTED.swf,
    canvasDrawsCurrentText: false,
    fields: Object.values(native.readOnlyEditDefinitions).map(field => {
      const instance = native.selectedInstances.find(row => row.objectId === field.objectId);
      assert(instance && instance.runs.length === 1 && instance.firstFrame === 1 && instance.lastFrame === 1);
      return {objectId: field.objectId, parentSpriteId: instance.spriteId,
        instanceName: instance.runs[0].name, boundsTwips: field.boundsTwips,
        placementMatrixTwips: instance.runs[0].matrixTwips,
        fontRef: field.attributes.fontRef,
        currentTextOwner: 'source feedback script sets _global.WrongFeed; Canvas function empty'};
    }), reachableWrong4FieldId: 303,
    wrong4TextRule: {beforeFirstWrongTerminal: 'Substitute 23 for C in the equation. Try again.',
      afterFirstWrongTerminal: 'Substitute 23 for C in the equation.'},
    sourceMask: {shapeId: 177, depth: 1, clipDepth: 7,
      normalizedOpaqueForCanvas: true}, visualCalibration: false});
  const outputs = [
    ['canvas-renderer-draft.js', script],
    ['adapter-spec-v1.json', specBytes],
    ['dynamic-text-contract-v1.json', dynamicText],
  ];
  const manifest = json({kind: 'p043-output-only-safe-canvas-candidate-v1',
    status: 'unregistered-engineering-drawing-draft', animationId: ID,
    inputs: Object.entries(FILES).map(([key, file]) => ({key, path: file,
      bytes: bytes[key].length, sha256: sha(bytes[key])})),
    sourceFrameCases: 555, mainFrames: 241, reachableFeedbackFrames: 60,
    feedbackSuppressedUnlessSelected: true, mask177Normalized: true,
    rootTitleIncluded: true, sourceRootScalePreserved: true,
    outputs: outputs.map(([name, data]) => ({path: `${BASE}/canvas/${name}`,
      bytes: data.length, sha256: sha(data)})),
    unresolved: ['Canvas pixels, JPEG and morph appearance need browser calibration.',
      'Four EditText fields are intentionally not rendered in Canvas.',
      'Physical right4 sprite has 386 unclassified bytes after End.',
      'No AVM1, audio, host selection, button actions or Close effects execute.'],
    gates: {currentJsRegistered: false, originalRuntimeAccepted: false,
      fidelityAccepted: false, audioAccepted: false, listeningAccepted: false,
      humanAccepted: false, ownerAccepted: false, strictComplete: false,
      publication: false}});
  outputs.push(['canvas-candidate-manifest-v1.json', manifest]);
  return new Map(outputs);
}

const mode = process.argv[2];
assert(['--plan', '--write', '--check'].includes(mode), '--plan | --write | --check');
const outputs = build();
for (const [name, bytes] of outputs) {
  const file = path.join(HERE, name);
  assert.equal(path.dirname(file), HERE);
  if (mode === '--write' && !fs.existsSync(file))
    fs.writeFileSync(file, bytes, {flag: 'wx'});
  if (mode !== '--plan') assert.deepEqual(read(file), bytes, `output drift ${name}`);
}
console.log(JSON.stringify({mode, mainFrames: 241, sourceCases: 555,
  outputs: Object.fromEntries([...outputs].map(([name, data]) =>
    [name, {bytes: data.length, sha256: sha(data)}]))}));
