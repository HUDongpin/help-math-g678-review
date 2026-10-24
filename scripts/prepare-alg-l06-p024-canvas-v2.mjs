#!/usr/bin/env node
/** P024 drawing plane with source-audited, scene-safe native-text suppression. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p024';
const SOURCE={path:'G6-G8-shared/ALG001/L6/VB/L6VB17.swf',bytes:462836,
 sha256:'e36c6c293f1e620f82fa84d57a1b91fd0a977d24d365772126f87333ce359d05'};
const OUT='output/alg-l06-p024-canvas-v2';
const SOURCE_EXPORT='output/alg-l06-p024-canvas-v1';
const EXPORT=`${SOURCE_EXPORT}/source-export`;
const XML=`${SOURCE_EXPORT}/source.xml`;
const RECEIPT=`${SOURCE_EXPORT}/source-export-receipt.json`;
const STAGE='migrations/shared-alg001-l06-p024/implementation/canvas-v2/canvas-renderer.js';
const PRESENTATION='packages/demos/src/alg-l06-p024-presentation-v1.ts';
const NATIVE='output/alg-l06-p024-native-text-v1/text-state-source-v1.json';
const STATIC_SUPPRESSIBLE_IDS=[12,13,14,15,16,17,18,37,41];
const DYNAMIC_IDS=[64,79,93];
const FEEDBACK=Object.freeze({69:31,83:29,97:28,123:31,155:25,188:27,196:27});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function physical(base,item){
 const file=path.resolve(base,item.path);
 assert(file.startsWith(`${base}${path.sep}`)&&fs.realpathSync(file)===file,
  `physical ${item.path}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,
  `ordinary ${item.path}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${item.path}: ${key}`);
 if(item.bytes!==undefined)assert.equal(bytes.length,item.bytes,`bytes ${item.path}`);
 if(item.sha256)assert.equal(sha(bytes),item.sha256,`SHA ${item.path}`);
 return bytes;
}
function replaceOnce(source,needle,replacement,label){
 const at=source.indexOf(needle);
 assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
 return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function functionSource(source,name){
 const at=source.indexOf(`function ${name}(`);
 const end=source.indexOf('\nfunction ',at+1);
 assert(at>=0&&end>at&&source.indexOf(`function ${name}(`,at+1)<0,`unique ${name}`);
 return source.slice(at,end).trimEnd();
}
function byteInputs(names){
 return Object.fromEntries(Object.entries(names).map(([key,name])=>
  [key,physical(ROOT,{path:name})]));
}
function sourceControls(xml){
 const masks=[
  {timelineId:'sprite-123',characterId:98,frame:2,depth:1,clipDepth:7},
  {timelineId:'sprite-208',characterId:35,frame:67,depth:11,clipDepth:18},
  {timelineId:'sprite-208',characterId:35,frame:124,depth:19,clipDepth:24},
 ];
 for(const m of masks){
  const start=xml.indexOf(`<DefineSprite objectID="${m.timelineId.split('-')[1]}"`);
  const end=xml.indexOf('</DefineSprite>',start);
  assert(start>=0&&end>start,`${m.timelineId} source`);
  const body=xml.slice(start,end);
  let frame=1,found=false;
  for(const tag of body.match(/<(?:ShowFrame|PlaceObject2)\b[^>]*\/?>/gu)??[]){
   if(tag.startsWith('<ShowFrame')){frame++;continue;}
   if(frame===m.frame&&tag.includes(`depth="${m.depth}"`)&&
    tag.includes(`objectID="${m.characterId}"`)&&
    tag.includes(`clipDepth="${m.clipDepth}"`))found=true;
  }
  assert(found,`${m.timelineId} source clip frame`);
 }
 assert.equal([...xml.matchAll(/<DefineMorphShape objectID="/gu)].length,61);
 assert.equal([...xml.matchAll(/<DefineBitsJPEG3 objectID="/gu)].length,4);
 assert.equal([...xml.matchAll(/<DefineText objectID="/gu)].length,40);
 assert.equal([...xml.matchAll(/<DefineEditText objectID="/gu)].length,3);
 return masks;
}
function sourceSuppression(presentationBytes,nativeBytes){
 const presentation=presentationBytes.toString();
 const match=presentation.match(/\/\* P024_SOURCE_BINDING_START \*\/\s*export const P024_PRESENTATION_BINDING = (\{[\s\S]*?\}) as const;/u);
 assert(match&&presentation.includes('ownership:{nativeOwnedInstanceIds:ownedIds,nativeOwnedByRole:nativeOwned,')&&
  presentation.includes('suppressibleSourceTextIds,sceneScoped:true'),
  'current presentation ownership contract');
 const binding=JSON.parse(match[1]),native=JSON.parse(nativeBytes);
 assert.equal(binding.source.swfSha256,SOURCE.sha256);
 assert.equal(binding.source.mainDomain,'sprite-208');
 assert.equal(binding.source.mainFrames,381);
 assert.equal(binding.source.quizFrame,154);
 assert.equal(native.source.sha256,SOURCE.sha256);
 assert.equal(native.textDefinitions.length,43);
 assert.equal(native.textInstances.length,77);
 const groups=[
  {name:'table',firstFrame:binding.table.firstFrame,ids:binding.table.instanceIds},
  {name:'paragraph',firstFrame:binding.paragraph.firstFrame,ids:[binding.paragraph.instanceId]},
  {name:'question',firstFrame:binding.question.firstFrame,ids:[binding.question.instanceId]},
 ];
 const byInstance=new Map(native.textInstances.map(row=>[row.instanceId,row]));
 const candidates=groups.flatMap(group=>group.ids.map(id=>{
  const row=byInstance.get(id);
  assert(row&&row.kind==='static-text'&&row.domainId==='sprite-208',`owned static ${id}`);
  return row.sourceTextId;
 }));
 assert.deepEqual([...new Set(candidates)].sort((a,b)=>a-b),STATIC_SUPPRESSIBLE_IDS);
 assert(DYNAMIC_IDS.every(id=>!candidates.includes(id)));
 const definitionIds=new Set(native.textDefinitions.filter(row=>row.kind==='static-text')
  .map(row=>row.sourceTextId));
 assert(STATIC_SUPPRESSIBLE_IDS.every(id=>definitionIds.has(id)));
 const ranges={};
 for(const id of STATIC_SUPPRESSIBLE_IDS){
  const frames=[];
  for(let frame=1;frame<=381;frame++){
   const active=native.textInstances.filter(row=>row.kind==='static-text'&&
    row.domainId==='sprite-208'&&row.firstPlacementFrame<=frame&&frame<row.lastFrameExclusive);
   const eligible=groups.filter(group=>frame>=group.firstFrame&&group.ids.every(instance=>
    active.some(row=>row.instanceId===instance)));
   // The table is one native unit, and an ID can be suppressed only when every
   // active source instance of that ID belongs to a currently owned unit.
   const selected=new Set(eligible.flatMap(group=>group.ids));
   const relevant=active.filter(row=>row.sourceTextId===id);
   if(relevant.length&&relevant.every(row=>selected.has(row.instanceId)))frames.push(frame);
  }
  const intervals=[];
  for(const frame of frames){
   const previous=intervals.at(-1);
   if(previous&&previous[1]===frame-1)previous[1]=frame;
   else intervals.push([frame,frame]);
  }
  ranges[id]=intervals;
 }
 assert.deepEqual(ranges,{
  12:[[7,381]],13:[[7,227],[247,381]],14:[[7,294],[312,381]],
  15:[[7,381]],16:[[7,381]],17:[[7,253],[312,381]],
  18:[[7,274],[312,381]],37:[[109,381]],41:[[142,381]],
 },'audited ownership intervals');
 assert(native.textInstances.filter(row=>STATIC_SUPPRESSIBLE_IDS.includes(row.sourceTextId))
  .every(row=>row.domainId==='sprite-208'),
  'suppression IDs do not appear in feedback domains');
 return {ids:STATIC_SUPPRESSIBLE_IDS,ranges,sourceBinding:binding.kind,
  sourceBindingNativeSha256:binding.pins.nativeReport.sha256};
}
function build(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 physical(SOURCE_ROOT,SOURCE);
 const receiptBytes=physical(ROOT,{path:RECEIPT}),receipt=JSON.parse(receiptBytes);
 assert.equal(receipt.kind,'alg-l06-p024-physical-source-canvas-export-v1');
 assert.deepEqual(receipt.source,{...SOURCE,root:SOURCE_ROOT});
 for(const exported of receipt.files)physical(ROOT,exported);
 const names={
  intake:'output/alg-l06-p024-intake-recon-v1/intake-recon-v1.json',
  behavior:'output/alg-l06-p024-behavior-audit-v1/behavior-audit-v1.json',
  buttonScope:'output/alg-l06-p024-button-scope-review-v1/button-scope-review-v1.json',
  presentation:PRESENTATION,
  nativeText:NATIVE,
  xml:XML,
  helper:`${EXPORT}/sprites/DefineSprite_208/canvas.js`,
  frames:`${EXPORT}/sprites/DefineSprite_208/frames.html`,
  rootFrames:`${EXPORT}/frames/frames.html`,
  rootScript1:`${EXPORT}/scripts/frame_1/DoAction.as`,
  rootScript6:`${EXPORT}/scripts/frame_6/DoAction.as`,
  quizScript:`${EXPORT}/scripts/DefineSprite_208/frame_154/DoAction.as`,
  ...Object.fromEntries([7,8,9,10,38,197,198,199].map(n=>
   [`button${n}`,`${EXPORT}/scripts/DefineButton2_${n}/BUTTONCONDACTION on(release).as`])),
 };
 const bytes=byteInputs(names),intake=JSON.parse(bytes.intake),
  behavior=JSON.parse(bytes.behavior),scope=JSON.parse(bytes.buttonScope);
 assert.equal(intake.source.swf.sha256,SOURCE.sha256);
 assert.equal(behavior.animationId,ID);
 assert.equal(scope.animationId,ID);
 assert.equal(bytes.quizScript.toString().trim(),
  'stop();\r\n_global.quizSection = true;\r\n_global.quizTryCount = 0;');
 assert(bytes.rootScript1.toString().includes('InternalPreloader.gotoAndPlay("jump_check")'));
 assert.equal(bytes.rootScript6.toString().trim(),'stop();');
 const xml=bytes.xml.toString(),masks=sourceControls(xml);
 const suppression=sourceSuppression(bytes.presentation,bytes.nativeText);
 assert.equal(suppression.sourceBindingNativeSha256,sha(bytes.nativeText));
 const frames=bytes.frames.toString().replace(/\r\n?/gu,'\n');
 const root=bytes.rootFrames.toString().replace(/\r\n?/gu,'\n');
 const canvas=frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
 const header=frames.match(/function sprite208\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
 assert(canvas&&header);
 assert.deepEqual([+canvas[1],+canvas[2],+header[1],+header[2],+header[3]],
  [1181,498,599,216.8,381]);
 const definitions=frames.slice(0,frames.indexOf('\nvar frame = -1;'));
 assert(definitions.length>0);
 const placed=[...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
  .map(m=>m[1]))].sort();
 const fonts=[...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)]
  .map(m=>m[1]);
 const images=[...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)]
  .map(m=>m[1]);
 assert.deepEqual([placed.length,fonts.length,images.length,
  placed.filter(name=>name.startsWith('text')).length,
  placed.filter(name=>name.startsWith('morphshape')).length],
  [189,7,4,43,61]);
 assert.deepEqual(images,['imageObj116','imageObj189','imageObj191','imageObj193']);
 for(const n of Object.keys(FEEDBACK))assert(placed.includes(`sprite${n}`));
 const quizCase=frames.slice(frames.indexOf('case 153:'),frames.indexOf('case 154:'));
 assert(quizCase.startsWith('case 153:')&&quizCase.endsWith('\n\t\t'));
 const quizFeedback=[...quizCase.matchAll(/place\("sprite(69|83|97|123|155|188|196)"[^\n]*,\(0\+time\)%(\d+),153,time\);/gu)]
  .map(match=>[Number(match[1]),Number(match[2])]);
 assert.deepEqual(quizFeedback,[[69,31],[83,29],[97,28],[123,31],
  [155,25],[188,27],[196,27]],'main source frame 154 feedback placements');
 for(const n of [64,79,93])
  assert(functionSource(definitions,`text${n}`).includes(`function text${n}`)&&
   functionSource(definitions,`text${n}`).match(/\{\s*\}/u),
   `dynamic text${n} has no FFDec ink`);
 const rootBlock=root.slice(root.indexOf('function main('));
 const rootFrameSix=rootBlock.slice(rootBlock.indexOf('case 5:'),rootBlock.indexOf('case 6:'));
 const rootLines=rootFrameSix.split('\n').filter(line=>/place\("(?:sprite2|sprite208)"/u.test(line));
 assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),
  ['sprite2','sprite208']);
 assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,400.0,43.1]'));
 assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
 const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
  classification:'behavior-heavy-source-locked-drawing-plane-v2',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE.path}`,swfSha256:SOURCE.sha256},
  evidence:{scenarioInventory:names.intake,scenarioInventorySha256:sha(bytes.intake),
   audioAudit:names.behavior,audioAuditSha256:sha(bytes.behavior),
   sourceXml:XML,sourceXmlSha256:sha(bytes.xml),
   sourceButtonScript:names.button7,sourceButtonScriptSha256:sha(bytes.button7)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:names.helper,helperSha256:sha(bytes.helper),
   framesHtml:names.frames,framesHtmlSha256:sha(bytes.frames),
   targetSpriteObjectId:208,targetSpriteFunction:'sprite208',
   exportCanvas:{width:1181,height:498},exportInternalTranslation:{x:599,y:216.8},
   expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:5666},
    placementPixels:{x:412.4,y:283.3}},
   local:{timelineId:'sprite-208',frameCount:381,livePlaybackEndFrame:154,
    playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:{x:-186.6,y:66.5}},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English-visuals; no authored Spanish drawing branch',
   seedMapping:'fixed-zero; Adobe random(3|4) not executed',
   blockedLocalFrameRanges:[],currentCanonicalFrameDomainDispositionAsserted:false,
   nativeTextSuppression:{request:'optional suppressTextIds',
    source:'p024PresentationState(state).ownership.suppressibleSourceTextIds',
    auditedStaticTextIds:suppression.ids,eligibleFrameRanges:suppression.ranges},
   unresolved:['Main sprite stops at frame 154; player owns branch and resume.',
    'Seven feedback sprites have independent frame domains and audio.',
    'Dynamic feedback text64/79/93 is empty in FFDec Canvas and requires a native overlay.',
    'AVM1 glossary, quiz, Close and old host callbacks are not executed.',
    'Original runtime, listening, visual fidelity and human/Owner gates remain open.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',
   spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:bytes.helper.toString(),framesHtml:frames,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,[
  {characterId:35,placements:[{depth:11,clipDepth:18},{depth:19,clipDepth:24}],
   rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'},
  {characterId:98,placements:[{depth:1,clipDepth:7}],
   rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,0.43137255]));'},
 ],xml);
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
 // The original placement, transform, mask and blend paths remain intact.
 // Only these audited DefineText functions can skip their glyph paths.
 for(const id of suppression.ids){
  runtime=replaceOnce(runtime,
   `function text${id}(ctx,ctrans,frame,ratio,time){`,
   `function text${id}(ctx,ctrans,frame,ratio,time){\n`+
    `    if (P024_SUPPRESS_TEXT_IDS && P024_SUPPRESS_TEXT_IDS.has(${id})) return;`,
   `source text${id} glyph guard`);
 }
 for(const id of DYNAMIC_IDS)
  assert(!functionSource(runtime,`text${id}`).includes('P024_SUPPRESS_TEXT_IDS'));
 const rootDefinitions=[functionSource(root,'shape1'),functionSource(root,'sprite2')].join('\n\n');
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${rootDefinitions}\n\nSAFE_OBJECTS = Object.freeze({`,'root title functions');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n        "sprite2": sprite2,\n',
  'root title registry');
 const feedbackSource=`var P024_FEEDBACK = null;
var P024_SUPPRESS_TEXT_IDS = null;
var P024_FEEDBACK_FRAMES = Object.freeze(${JSON.stringify(FEEDBACK)});
var P024_SUPPRESSION_FRAME_RANGES = deepFreeze(${JSON.stringify(suppression.ranges)});
var P024_METADATA = deepFreeze(Object.assign({}, METADATA, {
    mainQuizStopFrame: 154,
    feedbackFrameDomains: P024_FEEDBACK_FRAMES,
    feedbackSelection: "one source child or none; no AVM1 or random execution",
    sourceText: "40 static definitions retained; nine audited static IDs may be source-glyph suppressed",
    sourceGlyphRendering: {
        staticDefinitions: 40,
        suppressTextIdsSupported: true,
        auditedStaticTextIds: ${JSON.stringify(suppression.ids)},
        eligibleFrameRanges: P024_SUPPRESSION_FRAME_RANGES,
        dynamicFields: ${JSON.stringify(DYNAMIC_IDS)},
        dynamicSuppressionSupported: false,
        unownedSourceTextFallback: true
    }
}));
function resolveP024State(request) {
    var base = resolveFrameState(request);
    if (base.seed !== 0) throw new Error("P024 drawing uses fixed seed zero");
    var requested = request.suppressTextIds === undefined ? [] : request.suppressTextIds;
    if (!Array.isArray(requested)) throw new Error("suppressTextIds must be an array");
    var previousId = 0;
    for (var index = 0; index < requested.length; index += 1) {
        var id = requested[index];
        var ranges = P024_SUPPRESSION_FRAME_RANGES[id];
        if (!Number.isSafeInteger(id) || id <= previousId ||
            !Object.prototype.hasOwnProperty.call(P024_SUPPRESSION_FRAME_RANGES, id) ||
            !ranges.some(function (range) {
                return range[0] <= base.localFrame && base.localFrame <= range[1];
            })) {
            throw new Error("suppressTextIds must be sorted audited IDs eligible at this frame");
        }
        previousId = id;
    }
    var feedback = request.feedback;
    if (feedback === undefined || feedback === null) {
        return Object.freeze(Object.assign({}, base, {feedbackSpriteId: null, feedbackFrame: null,
            suppressedSourceTextIds: Object.freeze(requested.slice())}));
    }
    if (!feedback || typeof feedback !== "object" || Array.isArray(feedback) ||
        Object.keys(feedback).sort().join(",") !== "frame,spriteId") {
        throw new Error("feedback must name one source sprite and local frame");
    }
    var count = P024_FEEDBACK_FRAMES[feedback.spriteId];
    if (base.localFrame !== 154 || !Number.isSafeInteger(feedback.spriteId) ||
        !Object.prototype.hasOwnProperty.call(P024_FEEDBACK_FRAMES, feedback.spriteId) ||
        !Number.isSafeInteger(feedback.frame) || feedback.frame < 1 ||
        feedback.frame > count) {
        throw new Error("feedback sprite frame is outside the source quiz state");
    }
    return Object.freeze(Object.assign({}, base,
        {feedbackSpriteId: feedback.spriteId, feedbackFrame: feedback.frame,
            suppressedSourceTextIds: Object.freeze(requested.slice())}));
}
`;
 runtime=replaceOnce(runtime,'var place = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {',
  'var place = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {\n'
  +'    if (Object.prototype.hasOwnProperty.call(P024_FEEDBACK_FRAMES, obj.slice(6)) && obj.startsWith("sprite")) {\n'
  +'        if (!P024_FEEDBACK || obj !== "sprite" + P024_FEEDBACK.spriteId) return;\n'
  +'        frame = P024_FEEDBACK.frame - 1;\n'
  +'    }',
  'select one source feedback sprite');
 runtime=replaceOnce(runtime,'\nfunction render(targetCanvas, request) {',
  `\n${feedbackSource}\nfunction render(targetCanvas, request) {`,
  'feedback state validation');
 runtime=replaceOnce(runtime,'    var state = resolveFrameState(request);',
  '    var state = resolveP024State(request);','use P024 state');
 runtime=replaceOnce(runtime,'    var previousCanvas = canvas;\n    canvas = targetCanvas;',
  '    var previousCanvas = canvas;\n    var previousFeedback = P024_FEEDBACK;\n'
  +'    var previousSuppressTextIds = P024_SUPPRESS_TEXT_IDS;\n'
  +'    P024_FEEDBACK = state.feedbackSpriteId === null ? null :\n'
  +'        {spriteId: state.feedbackSpriteId, frame: state.feedbackFrame};\n'
  +'    canvas = drawingCanvas;','independent feedback frame and canvas');
 runtime=replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
  '    var drawingCanvas = document.createElement("canvas");\n'
  +'    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
  +'    var ctx = drawingCanvas.getContext("2d");','fresh drawing surface');
 const oldDraw='ctx.transform(1, 0, 0, 1, -186.6, 66.5);\n'
  +'        sprite208(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 const rootTitle='var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
  +`        var time = state.exportFrame;\n        ${rootLines[0].trim()}\n        `;
 runtime=replaceOnce(runtime,oldDraw,rootTitle+oldDraw,'source root title');
 runtime=replaceOnce(runtime,
  '    var previousCanvas = canvas;\n    var previousFeedback = P024_FEEDBACK;\n'
  +'    var previousSuppressTextIds = P024_SUPPRESS_TEXT_IDS;\n'
  +'    P024_FEEDBACK = state.feedbackSpriteId === null ? null :',
  '    var previousCanvas = canvas;\n    var previousFeedback = P024_FEEDBACK;\n'
  +'    var previousSuppressTextIds = P024_SUPPRESS_TEXT_IDS;\n'
  +'    try {\n    P024_SUPPRESS_TEXT_IDS = new Set(state.suppressedSourceTextIds);\n'
  +'    P024_FEEDBACK = state.feedbackSpriteId === null ? null :',
  'start full draw cleanup guard');
 runtime=replaceOnce(runtime,
  '        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
  '        canvas = previousCanvas;\n        P024_FEEDBACK = previousFeedback;\n'
  +'        P024_SUPPRESS_TEXT_IDS = previousSuppressTextIds;\n    }\n'
  +'    targetCanvas.width = 800;\n'
  +'    var targetCtx = targetCanvas.getContext("2d");\n'
  +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
  +'    targetCtx.drawImage(drawingCanvas, 0, 0);\n'
  +'    if (typeof targetCanvas.setAttribute === "function") {',
  'isolated copy and feedback cleanup');
 runtime=replaceOnce(runtime,
  '    } finally {\n        ctx.restore();\n        canvas = previousCanvas;\n'
  +'        P024_FEEDBACK = previousFeedback;\n'
  +'        P024_SUPPRESS_TEXT_IDS = previousSuppressTextIds;\n    }\n    targetCanvas.width = 800;',
  '    } finally {\n        ctx.restore();\n    }\n'
  +'    } finally {\n        canvas = previousCanvas;\n'
  +'        P024_FEEDBACK = previousFeedback;\n'
  +'        P024_SUPPRESS_TEXT_IDS = previousSuppressTextIds;\n    }\n    targetCanvas.width = 800;',
  'restore prior canvas/feedback even if setup throws');
 runtime=replaceOnce(runtime,'resolveFrameState: resolveFrameState, render: render',
  'resolveFrameState: resolveP024State, render: render','public P024 state resolver');
 runtime=replaceOnce(runtime,'metadata: METADATA, ready: ready, resolveFrameState: resolveP024State',
  'metadata: P024_METADATA, ready: ready, resolveFrameState: resolveP024State',
  'public feedback-domain metadata');
 new Script(runtime);
 const script=Buffer.from(runtime);
 const metadata=json({animationId:ID,sourceSwfSha256:SOURCE.sha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,
  main:{frameDomain:'sprite-208',frameCount:381,quizStopFrame:154,
   postQuizContinuationFirstFrame:155},
  feedback:FEEDBACK,request:{frame:'one-indexed sprite-208',
   feedback:'null or {spriteId,frame} only while main frame154',
   suppressTextIds:'optional sorted source-audited static IDs eligible at frame',
   scenario:'source-static-frame',lang:'en',seed:0},
  sourceGlyphRendering:{staticDefinitions:40,preserved:true,
   suppressTextIdsSupported:true,suppression:'only requested scene-safe native-owned static IDs',
   auditedStaticTextIds:suppression.ids,eligibleFrameRanges:suppression.ranges,
   dynamicFields:DYNAMIC_IDS,dynamicSuppressionSupported:false,
   dynamicInkInFFDec:false,nativeFeedbackTextNeeded:true,
   unownedSourceTextFallback:true,
   sourceEnglishUnderSpanishHost:true},
  sourceMorphCharacterCount:61,sourceMasks:masks,bitmapDefinitions:4,
  sourceRootTitlePreserved:true,AVMExecuted:false,audioRendered:false,
  assetPath:`/flash-assets/g678-local/${ID}/canvas-renderer.js`,assetSha256:sha(script)});
 const specBytes=json(spec);
 const manifest=json({schemaVersion:2,kind:'alg-l06-p024-maintained-canvas-v2',
  animationId:ID,status:'drawing-plane-only-no-current-js-registration',source:SOURCE,
  rootFrame:6,mainFrameCount:381,mainQuizStopFrame:154,
  feedbackDomains:FEEDBACK,stage:{width:800,height:600},
  sourceGlyphRendering:JSON.parse(metadata).sourceGlyphRendering,
  sourceMasks:masks,sourceMorphCharacterCount:61,bitmapDefinitions:4,
  sourceExportCount:receipt.files.length,
  sourceExportDrawingFiles:receipt.files.filter(f=>f.path.endsWith('/canvas.js')||
   f.path.endsWith('/frames.html')),
  inputs:[...Object.entries(names).map(([key,name])=>({key,...pin(name,bytes[key])})),
   ...[['generator','scripts/prepare-alg-l06-p024-canvas-v2.mjs'],
    ['predecessorManifest',`${SOURCE_EXPORT}/canvas-manifest.json`],
    ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
    ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs'],
    ['preparer','scripts/prepare-alg-l06-p024-canvas-v1.mjs']]
    .map(([key,name])=>({key,...pin(name,physical(ROOT,{path:name}))})),
   {key:'sourceExportReceipt',...pin(RECEIPT,receiptBytes)}],
  outputs:[pin(`${OUT}/canvas-renderer.js`,script),
   pin(`${OUT}/canvas-metadata-v2.json`,metadata),
   pin(`${OUT}/adapter-spec.json`,specBytes),pin(STAGE,script)],
  limitations:['No AVM1 execution or Adobe random outcome.',
   'Static drawing of selected feedback child; player owns state and audio.',
   'Suppression is only valid with native ownership from the matching presentation state.',
   'Dynamic feedback fields have no FFDec glyph ink; native text is required.',
   'Original-runtime, fidelity, listening, human and Owner review unresolved.'],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 return {script,metadata,spec:specBytes,manifest};
}
function main(){
 const mode=process.argv[2];
 assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write | --check');
 const built=build();
 for(const [name,bytes] of [
  [`${OUT}/canvas-renderer.js`,built.script],
  [`${OUT}/canvas-metadata-v2.json`,built.metadata],
  [`${OUT}/adapter-spec.json`,built.spec],
  [STAGE,built.script],
  [`${OUT}/canvas-manifest.json`,built.manifest]]){
  const target=path.join(ROOT,name);
  if(mode==='--write'&&!fs.existsSync(target)){
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});
  }else assert(fs.readFileSync(target).equals(bytes),`${name} drift`);
 }
 console.log(JSON.stringify({status:mode==='--check'?'verified':'written',
  renderer:pin(`${OUT}/canvas-renderer.js`,built.script),
  staged:pin(STAGE,built.script),manifest:pin(`${OUT}/canvas-manifest.json`,built.manifest)}));
}
main();
