#!/usr/bin/env node
/** Source graphics with explicit game, score and selected feedback clocks. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script, createContext} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const EXTRACTION = '/Volumes/American Dream/hudongpin/g678-p050-source-extraction-20261003-v1';
const BASE = `${EXTRACTION}/ffdec-export`;
const SOURCE = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const WORK = 'migrations/shared-alg001-l06-p050', ID = 'shared-alg001-l06-p050';
const sha = raw => createHash('sha256').update(raw).digest('hex');
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
function read(name, expected) {
  const p = path.resolve(ROOT, name);
  assert([ROOT, EXTRACTION, SOURCE].some(r => p.startsWith(r + path.sep)) && fs.realpathSync(p) === p);
  const before = fs.lstatSync(p, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n);
  const bytes = fs.readFileSync(p), after = fs.lstatSync(p, {bigint: true});
  for (const k of ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs', 'nlink']) assert.equal(before[k], after[k]);
  if (expected) assert.equal(sha(bytes), expected, name);
  return bytes;
}
function once(s, a, b) {
  const n = s.indexOf(a); assert(n >= 0 && s.indexOf(a, n + a.length) < 0, a);
  return s.slice(0, n) + b + s.slice(n + a.length);
}
function fn(s, name) {
  const a = s.indexOf(`function ${name}(`), b = s.indexOf('\nfunction ', a + 1);
  assert(a >= 0 && b > a, name); return s.slice(a, b).trimEnd();
}
const receipt = read(`${WORK}/audit-v1/source-extraction-v1.json`, 'dc1d39b3411e04b96ac8f331e60100105c1d0ed16c5ae5d242d806aa04b83f16');
const intake = JSON.parse(receipt);
assert.equal(intake.source.sha256, '4353f9cbd7e60043baa8f59c7f5193fcd930778ace4b918ab56f2953f306937e');
assert(intake.runs.every(r => r.exitCode === 0));
assert.equal(intake.exportRoot, BASE); assert.equal(intake.files.length, 538);
for (const pin of intake.files) assert.equal(read(`${BASE}/${pin.path}`, pin.sha256).length, pin.bytes);
const modelBytes = read(`${WORK}/native-v1/source-model-v1.json`, '928ca5042b469795ae207921638d44ffd212034e8eb33e954d943b1721c05fb7');
const source = JSON.parse(modelBytes);
for (const pin of source.inputs) assert.equal(read(pin.path, pin.sha256).length, pin.bytes);
const framesPath = `${BASE}/sprites/DefineSprite_489/frames.html`;
const helperPath = `${BASE}/sprites/DefineSprite_489/canvas.js`;
const frames = read(framesPath).toString().replace(/\r\n?/g, '\n'), helper = read(helperPath);
const root = read(`${BASE}/frames/frames.html`).toString().replace(/\r\n?/g, '\n');
const reachable = source.frameDomains.filter(d => d.displayReachable);
assert.equal(reachable.length, 13);
for (const row of reachable) assert.deepEqual(
  [...fn(row.spriteId === 26 ? root : frames, `sprite${row.spriteId}`).matchAll(/\bcase\s+(\d+)\s*:/g)].map(m => +m[1]),
  Array.from({length: row.frameCount}, (_, i) => i));
assert(fn(frames, 'sprite489').includes('ctx.transform(1,0,0,1,523.4,207.3);'));
assert(frames.includes('<canvas id="myCanvas" width="859" height="464"'));
assert.deepEqual(source.rootMatrixTwips, {scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, transX: 8388, transY: 5266});
const placed = [...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/g)].map(m => m[1]))].sort();
const fonts = [...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/g)].map(m => m[1]);
const images = [...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/g)].map(m => m[1]);
const spec = {schemaVersion: 1, animationId: `course-${ID}`, classification: 'behavior-heavy-unregistered-source-canvas-draft-v1',
  source: {swf: '$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/GS/L6GS02.swf', swfSha256: intake.source.sha256},
  evidence: {scenarioInventory: `${WORK}/native-v1/source-model-v1.json`, scenarioInventorySha256: sha(modelBytes),
    audioAudit: `${WORK}/native-v1/source-model-v1.json`, audioAuditSha256: sha(modelBytes),
    sourceXml: intake.xml.path, sourceXmlSha256: intake.xml.sha256},
  ffdecExport: {tool: 'JPEXS Free Flash Decompiler 26.2.1 Canvas export', helper: helperPath, helperSha256: sha(helper),
    framesHtml: framesPath, framesHtmlSha256: sha(read(framesPath)), targetSpriteObjectId: 489, targetSpriteFunction: 'sprite489',
    exportCanvas: {width: 859, height: 464}, exportInternalTranslation: {x: 523.4, y: 207.3},
    expectedPlacedFunctionCount: placed.length, expectedPlacedFunctionsSha256: sha(JSON.stringify(placed)),
    expectedFontFunctionCount: fonts.length, expectedFontFunctionsSha256: sha(JSON.stringify(fonts)),
    embeddedImageVariableCount: images.length, embeddedImageVariablesSha256: sha(JSON.stringify(images))},
  timeline: {fps: 12, stage: {width: 800, height: 600, backgroundColor: '#b8d8f7'},
    root: {frameCount: 10, preloaderStopFrame: 1, beginFrame: 6, placementName: 'animation',
      placementTwips: {x: 8388, y: 5266}, placementPixels: {x: 419.4, y: 263.3}},
    local: {timelineId: 'sprite-489', frameCount: 674, livePlaybackEndFrame: 662, playbackMode: 'state-explorer', publicFrameIndexing: 'one-indexed'},
    stageRenderOffset: {x: 419.4 - 523.4, y: 263.3 - 207.3}},
  runtimeContract: {kind: 'structural-local-frame', scenarios: ['source-explicit-frames'], defaultScenario: 'source-explicit-frames',
    supportedLanguages: ['en'], visualLocalization: 'Source English visuals; Spanish host controls do not translate teaching content',
    seedMapping: 'fixed zero for visual asset; game RNG belongs to the maintained reducer', blockedLocalFrameRanges: [],
    currentCanonicalFrameDomainDispositionAsserted: false,
    unresolved: ['Device text uses Arial at source size and bounds; original font fidelity is unaccepted.',
      'Source sample alignment, original-runtime comparison and listening require independent evidence.']},
  output: {script: 'canvas-renderer-draft.js', manifest: 'canvas-candidate-manifest-v1.json', spec: 'adapter-spec-v1.json', globalRegistry: 'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect: 'none'};
read('scripts/build-safe-ffdec-canvas-adapter.mjs', '1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd');
let runtime = buildSafeRuntime({helperSource: helper.toString(), framesHtml: frames, spec}).runtime.replaceAll(`course-${ID}`, ID);
runtime = once(runtime, 'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("visual seed must be fixed zero");\n    }');
const questions = source.questions.map(q => ({frame: q.frame, correct: q.correctChoice,
  spriteId: q.correctFeedbackSpriteId, endFrame: q.correctFeedbackEndFrame}));
const validator = `var question = ${JSON.stringify(questions)}.find(function(q){return q.frame===frame;});
    var game = request.game || {score:0,ordinal:0,scoreFrame:1,directionsOpen:false};
    if(typeof game!=="object" || Array.isArray(game) || Object.keys(game).sort().join(",")!=="directionsOpen,ordinal,score,scoreFrame" ||
       !Number.isSafeInteger(game.score) || game.score<0 || game.score>100 || game.score%10!==0 ||
       !Number.isSafeInteger(game.ordinal) || game.ordinal<0 || game.ordinal>10 ||
       !Number.isSafeInteger(game.scoreFrame) || game.scoreFrame<1 || game.scoreFrame>20 ||
       typeof game.directionsOpen!=="boolean")throw new Error("invalid source game state");
    if(question ? game.ordinal<1 : game.ordinal!==0)throw new Error("question ordinal requires a source question");
    if(game.directionsOpen && frame<662)throw new Error("directions popup is not placed in intro");
    if(game.scoreFrame!==1 && (!question || game.score===0 ||
       (game.score<100 ? game.scoreFrame>9 : game.scoreFrame!==2 && (game.scoreFrame<11 || game.scoreFrame>19))))
       throw new Error("unreachable source score clock");
    if(frame<662 && game.score!==0)throw new Error("intro score must be zero");
    var selectedFeedback=null;
    if(request.feedback!==undefined && request.feedback!==null){
       var f=request.feedback;
       if(!question || game.directionsOpen || typeof f!=="object" || Array.isArray(f) ||
          Object.keys(f).sort().join(",")!=="branch,localFrame,spriteId" ||
          !Number.isSafeInteger(f.localFrame) || f.localFrame<2)throw new Error("invalid feedback selection");
       if(f.spriteId===380){
          if(!Number.isSafeInteger(f.branch)||f.branch<1||f.branch>3||f.localFrame>28||game.scoreFrame!==1)
             throw new Error("invalid wrong-feedback branch");
       }else if(f.spriteId!==question.spriteId || f.branch!==null || f.localFrame>question.endFrame || game.score===0)
          throw new Error("invalid correct-feedback source");
       selectedFeedback=Object.freeze({spriteId:f.spriteId,localFrame:f.localFrame,branch:f.branch,
          wrongText:f.spriteId===380?"Sorry, the correct answer was "+question.correct+".":null});
    }
    game=Object.freeze({score:game.score,ordinal:game.ordinal,scoreFrame:game.scoreFrame,directionsOpen:game.directionsOpen});
    `;
runtime = once(runtime, '    return Object.freeze({\n        frameDomain:', `    ${validator}return Object.freeze({\n        frameDomain:`);
runtime = once(runtime, '        audioRendered: false\n    });', '        audioRendered: false,\n        game:game,feedback:selectedFeedback\n    });');

// The three wrong instances are placed in source depth order 2,3,1 in every
// question. Keep the selected instance at its own depth and clock only it.
for (const q of source.questions) assert.deepEqual(q.displayList.filter(o => o.objectId === 380).map(o => o.name),
  ['Mc_Wrong_Feed2', 'Mc_Wrong_Feed3', 'Mc_Wrong_Feed1']);
for (const [id, expected] of [[358, 4], [432, 3], [479, 3], [380, 30], [265, 10], [345, 10], [24, 13]]) {
  let count = 0;
  runtime = runtime.replace(new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`, 'gm'), (line, indent) => {
    const branch = [2, 3, 1][count % 3]; count++;
    if (id === 24) return `${indent}if(P050_GAME.directionsOpen) ${line.trim()}`;
    const clock = id === 265 ? 'P050_GAME.scoreFrame-1' : id === 345 ? '0' : 'P050_FEEDBACK.localFrame-1';
    const next = line.replace(/,1,\(\d+\+time\)%\d+,(\d+),time\);$/, `,1,${clock},$1,${clock});`);
    assert.notEqual(line, next);
    return id === 265 || id === 345 ? next : `${indent}if(P050_FEEDBACK && P050_FEEDBACK.spriteId===${id}${id === 380 ? ` && P050_FEEDBACK.branch===${branch}` : ''}) ${next.trim()}`;
  });
  assert.equal(count, expected, `sprite${id} placements`);
}
for (const id of [262, 274, 378]) assert.equal(fn(frames, `text${id}`), `function text${id}(ctx,ctrans,frame,ratio,time){\n}`);
// Source txtQNo.autoSize=true allows 10. to extend beyond its original field.
// Other fields retain source clipping. Colors are checked against swfmill.
const xml = read(intake.xml.path, intake.xml.sha256).toString();
for (const [id, color] of [[262, '255" green="255" blue="255'], [274, '0" green="0" blue="0'], [378, '0" green="0" blue="0']]) {
  const a = xml.indexOf(`<DefineEditText objectID="${id}"`), b = xml.indexOf('</DefineEditText>', a);
  assert(a >= 0 && b > a && xml.slice(a, b).replace(/\s+\/>/g, '/>').includes(`<Color red="${color}" alpha="255"/>`));
}
runtime = once(runtime, fn(frames, 'text262'), `function text262(ctx,ctrans,frame,ratio,time){
    ctx.save();try{ctx.beginPath();ctx.rect(-40,-40,866,611);ctx.clip();
    ctx.font="400px Arial, sans-serif";ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
    ctx.textBaseline="alphabetic";ctx.fillText(String(P050_GAME.score),0,400);}finally{ctx.restore();}
}`);
runtime = once(runtime, fn(frames, 'text274'), `function text274(ctx,ctrans,frame,ratio,time){
    ctx.save();try{ctx.font="360px Arial, sans-serif";ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
    ctx.textBaseline="alphabetic";ctx.fillText(String(P050_GAME.ordinal)+".",0,360);}finally{ctx.restore();}
}`);
runtime = once(runtime, fn(frames, 'text378'), `function text378(ctx,ctrans,frame,ratio,time){
    if(!P050_FEEDBACK || !P050_FEEDBACK.wrongText)return;
    ctx.save();try{ctx.beginPath();ctx.rect(-2842,-40,5407,1198);ctx.clip();
    ctx.font="300px Arial, sans-serif";ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));ctx.textBaseline="alphabetic";
    var words=P050_FEEDBACK.wrongText.split(" "),line="",y=300;
    for(var i=0;i<words.length;i++){var next=line?line+" "+words[i]:words[i];
      if(line && ctx.measureText(next).width>5327){ctx.fillText(line,-2802,y);y+=340;line=words[i];}else line=next;}
    if(line)ctx.fillText(line,-2802,y);}finally{ctx.restore();}
}`);
runtime = once(runtime, 'var readyPromise = null;', 'var P050_GAME=null,P050_FEEDBACK=null;\nvar readyPromise = null;');
runtime = once(runtime, '\nSAFE_OBJECTS = Object.freeze({', `\n${fn(root, 'shape25')}\n${fn(root, 'sprite26')}\n\nSAFE_OBJECTS = Object.freeze({`);
runtime = once(runtime, 'SAFE_OBJECTS = Object.freeze({\n', 'SAFE_OBJECTS = Object.freeze({\n        "shape25":shape25,"sprite26":sprite26,\n');
runtime = once(runtime, '    ctx.save();\n    try {\n        ctx.transform(1, 0, 0, 1,',
  '    ctx.save();\n    try {\n        place("sprite26",targetCanvas,ctx,[0.05,0,0,0.05,431.8,48.05],new cxform(0,0,0,0,255,255,255,255),1,0,5,0);\n        ctx.transform(1, 0, 0, 1,');
runtime = once(runtime, '    var previousCanvas = canvas;\n    canvas = targetCanvas;',
  '    var previousCanvas = canvas,previousGame=P050_GAME,previousFeedback=P050_FEEDBACK;\n    canvas = targetCanvas;P050_GAME=state.game;P050_FEEDBACK=state.feedback;');
runtime = once(runtime, '        ctx.restore();\n        canvas = previousCanvas;',
  '        ctx.restore();\n        canvas = previousCanvas;P050_GAME=previousGame;P050_FEEDBACK=previousFeedback;');
runtime = once(runtime, '        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));',
  '        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));\n        targetCanvas.setAttribute("data-p050-game",JSON.stringify(state.game));\n        targetCanvas.setAttribute("data-p050-feedback",JSON.stringify(state.feedback));');
assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame|fetch)\s*\(/.test(runtime));
const context = createContext({document: {createElement: kind => {assert.equal(kind, 'img'); return {complete: false, naturalWidth: 0};}}});
new Script(runtime).runInContext(context, {timeout: 30000});
const asset = context.HELP_MATH_CANVAS_ASSETS[ID];
let resolvedCount = 0;
const game = (ordinal = 0, score = 0, scoreFrame = 1, directionsOpen = false) => ({ordinal, score, scoreFrame, directionsOpen});
for (let frame = 1; frame <= 674; frame++) {
  assert.equal(asset.resolveFrameState({frame, game: game(frame >= 663 && frame <= 672 ? 1 : 0)}).localFrame, frame); resolvedCount++;
}
for (const q of source.questions) {
  for (let frame = 2; frame <= q.correctFeedbackEndFrame; frame++) {
    assert.equal(asset.resolveFrameState({frame: q.frame, game: game(1, 10), feedback: {spriteId: q.correctFeedbackSpriteId, localFrame: frame, branch: null}}).feedback.localFrame, frame); resolvedCount++;
  }
  for (let branch = 1; branch <= 3; branch++) for (let frame = 2; frame <= 28; frame++) {
    assert.equal(asset.resolveFrameState({frame: q.frame, game: game(1), feedback: {spriteId: 380, localFrame: frame, branch}}).feedback.branch, branch); resolvedCount++;
  }
  for (const score of [10, 100]) for (const frame of (score === 100 ? [1, 2, 11, 12, 13, 14, 15, 16, 17, 18, 19] : [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    assert.equal(asset.resolveFrameState({frame: q.frame, game: game(10, score, frame)}).game.scoreFrame, frame); resolvedCount++;
  }
}
const negatives = [{frame: 0}, {frame: 675}, {frame: 1, seed: 1}, {frame: 1, lang: 'es'}, {frame: 663},
  {frame: 662, game: game(1)}, {frame: 1, game: game(0, 0, 1, true)}, {frame: 663, game: game(1, 10, 11)},
  {frame: 663, game: game(1, 100, 3)}, {frame: 663, game: game(1), feedback: {spriteId: 432, localFrame: 2, branch: null}},
  {frame: 663, game: game(1), feedback: {spriteId: 380, localFrame: 2, branch: 0}},
  {frame: 663, game: game(1), feedback: {spriteId: 380, localFrame: 29, branch: 1}},
  {frame: 663, game: game(1, 0, 1, true), feedback: {spriteId: 380, localFrame: 2, branch: 1}}];
for (const request of negatives) assert.throws(() => asset.resolveFrameState(request));
const outputs = new Map([['canvas-renderer-draft.js', Buffer.from(runtime)], ['adapter-spec-v1.json', json(spec)]]);
outputs.set('canvas-candidate-manifest-v1.json', json({kind: 'p050-safe-canvas-draft-v1', animationId: ID,
  inputReceiptSha256: sha(receipt), mainFrames: 674, reachableCases: reachable.reduce((n, d) => n + d.frameCount, 0),
  resolvedCount, invalidRequestsRejected: negatives.length, selectedWrongBranchDepthOrder: [2, 3, 1],
  stoppedUnselectedSprite: {id: 345, frame: 1}, rootTitleStageCoordinates: true,
  dynamicFields: {score: 262, questionOrdinal: 274, wrongText: 378, replacementFont: 'Arial, sans-serif', originalFontFidelity: false},
  outputs: [...outputs].map(([name, bytes]) => ({path: `${WORK}/canvas-v1/${name}`, bytes: bytes.length, sha256: sha(bytes)})),
  registered: false, originalRuntimeAccepted: false, listeningAccepted: false}));
assert(['--write', '--check'].includes(process.argv[2]));
fs.mkdirSync(path.join(ROOT, WORK, 'canvas-v1'), {recursive: true});
for (const [name, bytes] of outputs) {
  const p = `${WORK}/canvas-v1/${name}`;
  if (process.argv[2] === '--write' && !fs.existsSync(path.join(ROOT, p))) fs.writeFileSync(path.join(ROOT, p), bytes, {flag: 'wx'});
  assert.deepEqual(read(p), bytes, p);
}
console.log({mode: process.argv[2], resolvedCount, negatives: negatives.length,
  outputs: [...outputs].map(([name, bytes]) => ({name, bytes: bytes.length, sha256: sha(bytes)}))});
