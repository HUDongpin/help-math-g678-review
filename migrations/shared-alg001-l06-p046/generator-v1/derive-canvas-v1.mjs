#!/usr/bin/env node
/** Reproducible P046 drawing adapter. Native controls own quiz/help visibility. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContext, Script} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'output/g678-p046-canvas-preparation-20261002-v1';
const WORK = 'migrations/shared-alg001-l06-p046';
const ID = 'shared-alg001-l06-p046';
const sha = raw => createHash('sha256').update(raw).digest('hex');
const json = value => Buffer.from(JSON.stringify(value, null, 2)+'\n');
function read(name, expected) {
  const file = path.resolve(ROOT, name);
  assert(file.startsWith(ROOT+path.sep) && fs.realpathSync(file) === file);
  const before = fs.lstatSync(file, {bigint:true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n);
  const raw = fs.readFileSync(file), after = fs.lstatSync(file, {bigint:true});
  for (const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink']) assert.equal(before[key],after[key]);
  if (expected) assert.equal(sha(raw),expected,name);
  return raw;
}
function once(source, needle, replacement) {
  const at = source.indexOf(needle);
  assert(at >= 0 && source.indexOf(needle,at+needle.length) === -1,needle);
  return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function fn(source,name) {
  const marker = `function ${name}(`, at = source.indexOf(marker);
  const end = source.indexOf('\nfunction ',at+marker.length);
  assert(at>=0 && end>at && source.indexOf(marker,at+marker.length)===-1);
  return source.slice(at,end).trimEnd();
}
const intakeRaw = read(`${BASE}/canvas-extraction-v1.json`,
  'e94159b3736d3e4bbdc279c43eeedd5fdf650c84e47db1e6d45c3678af0dbfa4');
const intake = JSON.parse(intakeRaw);
assert.equal(intake.animationId,ID);
assert.equal(intake.swf.sha256,'c69f1f0fdaff0201af171aaee6b9b90a33b483e8c93ffef406c31cf0853a54b8');
assert.equal(intake.totalCases,811);
for(const pin of [intake.swf,intake.xml,intake.sourceModel,intake.safeAdapter,intake.stdout,intake.stderr,...intake.files])
  assert.equal(read(pin.path,pin.sha256).length,pin.bytes,pin.path);
const source = JSON.parse(read(intake.sourceModel.path));
const framesPath = `${BASE}/source-export/sprites/DefineSprite_123/frames.html`;
const helperPath = `${BASE}/source-export/sprites/DefineSprite_123/canvas.js`;
const frames = read(framesPath).toString().replace(/\r\n?/gu,'\n');
const root = read(`${BASE}/source-export/frames/frames.html`).toString().replace(/\r\n?/gu,'\n');
const helper = read(helperPath);
for(const [id,count] of Object.entries(intake.spriteCases)) {
  const text = read(`${BASE}/source-export/sprites/DefineSprite_${id}/frames.html`).toString();
  assert.deepEqual([...fn(text,`sprite${id}`).matchAll(/\bcase\s+(\d+)\s*:/gu)].map(m=>Number(m[1])),Array.from({length:count},(_,i)=>i));
}
const placed = [...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m=>m[1]))].sort();
const fonts = [...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
const images = [...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)].map(m=>m[1]);
assert.equal(placed.length,112); assert.equal(fonts.length,2); assert.equal(images.length,0);
assert(frames.includes('<canvas id="myCanvas" width="1554" height="388"'));
assert(fn(frames,'sprite123').includes('ctx.transform(1,0,0,1,1130.45,199.35);'));
assert.equal(source.runtime.mainFrames,743);
const spec = {schemaVersion:1,animationId:`course-${ID}`,
  classification:'behavior-heavy-unregistered-source-canvas-draft-v1',
  source:{swf:'$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/TI/L6TI06.swf',swfSha256:intake.swf.sha256},
  evidence:{scenarioInventory:intake.sourceModel.path,scenarioInventorySha256:intake.sourceModel.sha256,
    audioAudit:intake.sourceModel.path,audioAuditSha256:intake.sourceModel.sha256,
    sourceXml:intake.xml.path,sourceXmlSha256:intake.xml.sha256},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',helper:helperPath,helperSha256:sha(helper),
    framesHtml:framesPath,framesHtmlSha256:sha(read(framesPath)),targetSpriteObjectId:123,targetSpriteFunction:'sprite123',
    exportCanvas:{width:1554,height:388},exportInternalTranslation:{x:1130.45,y:199.35},
    expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
    expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
    embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
    root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,placementName:'animation',
      placementTwips:{x:8248,y:5666},placementPixels:{x:412.4,y:283.3}},
    local:{timelineId:'sprite-123',frameCount:743,livePlaybackEndFrame:163,playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},
    stageRenderOffset:{x:412.4-1130.45,y:283.3-199.35}},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-explicit-frames'],defaultScenario:'source-explicit-frames',
    supportedLanguages:['en'],visualLocalization:'source-English visual; Spanish controls do not translate lesson text',
    seedMapping:'fixed zero; no AVM1 executed',blockedLocalFrameRanges:[],
    currentCanonicalFrameDomainDispositionAsserted:false,
    unresolved:['Native component owns frame163 drag values, Try again and popup85.',
      'Independent coach audio clocks and main frame/sample alignment are separate.',
      'Original-runtime pixel comparison and listening acceptance remain open.']},
  output:{script:'canvas-renderer-draft.js',manifest:'canvas-candidate-manifest-v1.json',spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
let runtime = buildSafeRuntime({helperSource:helper.toString(),framesHtml:frames,spec}).runtime.replaceAll(`course-${ID}`,ID);
runtime = once(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("seed must be fixed zero");\n    }');
// These five placements occur only at source frame163. The native quiz owns them.
// In particular popup85 must not be drawn before the source NMH event.
for(const name of ['sprite59','sprite61','sprite63','button8','sprite85']) {
  let count = 0;
  runtime = runtime.replace(new RegExp(`^[ \\t]*place\\("${name}"[^\\n]+\\);`,'gm'),()=>{
    count++; return '/* Source quiz/help behavior is owned by the native component. */';
  });
  assert.equal(count,1,name);
}
runtime = once(runtime,'\nSAFE_OBJECTS = Object.freeze({',`\n${fn(root,'shape9')}\n\nSAFE_OBJECTS = Object.freeze({`);
runtime = once(runtime,'SAFE_OBJECTS = Object.freeze({\n','SAFE_OBJECTS = Object.freeze({\n        "shape9": shape9,\n');
// Root shape is drawn in stage coordinates, before the exported sprite offset.
runtime = once(runtime,'    ctx.save();\n    try {\n        ctx.transform(1, 0, 0, 1,',
  '    ctx.save();\n    try {\n        place("shape9", targetCanvas, ctx, [0.05,0,0,0.05,0,0], new cxform(0,0,0,0,255,255,255,255), 1, 0, 0, 0);\n        ctx.transform(1, 0, 0, 1,');
assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame)\s*\(|\bfetch\s*\(/u.test(runtime));
const context = createContext({}); new Script(runtime).runInContext(context,{timeout:30000});
const asset = context.HELP_MATH_CANVAS_ASSETS[ID];
for(let frame=1;frame<=743;frame++)assert.equal(asset.resolveFrameState({frame}).localFrame,frame);
for(const frame of [0,744,1.5])assert.throws(()=>asset.resolveFrameState({frame}));
assert.throws(()=>asset.resolveFrameState({frame:1,seed:1}));
assert.throws(()=>asset.resolveFrameState({frame:1,lang:'es'}));
const outputs = new Map([['canvas-renderer-draft.js',Buffer.from(runtime)],['adapter-spec-v1.json',json(spec)]]);
outputs.set('canvas-candidate-manifest-v1.json',json({kind:'p046-safe-canvas-draft-v1',animationId:ID,
  inputReceiptSha256:sha(intakeRaw),sourceCases:811,mainFrames:743,nativeQuizFrame:163,
  suppressedFunctions:['sprite59','sprite61','sprite63','button8','sprite85'],rootShapeStageCoordinates:true,
  outputs:[...outputs].map(([name,raw])=>({path:`${WORK}/canvas-v1/${name}`,bytes:raw.length,sha256:sha(raw)})),
  sourceFrameAlignmentAccepted:false,currentJsRegistered:false,originalRuntimeAccepted:false,strictComplete:false}));
assert(['--write','--check'].includes(process.argv[2]));
fs.mkdirSync(path.resolve(ROOT,WORK,'canvas-v1'),{recursive:true});
for(const [name,raw] of outputs) {
  const file = `${WORK}/canvas-v1/${name}`;
  if(process.argv[2]==='--write' && !fs.existsSync(path.resolve(ROOT,file)))fs.writeFileSync(path.resolve(ROOT,file),raw,{flag:'wx'});
  assert.deepEqual(read(file),raw,file);
}
console.log(JSON.stringify({mode:process.argv[2],sourceCases:811,mainFrames:743,
  outputs:[...outputs].map(([path,raw])=>({path,bytes:raw.length,sha256:sha(raw)}))}));
