#!/usr/bin/env node
/** Source-bound P014 Canvas drawing plane. AS, audio and product state live elsewhere. */
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

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p014';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB05.swf';
const SWF_SHA='aed0f7755d4f691cefcc28c815acc6b9d083fdfaae88ff385f22d3b32ba07603';
const AUDIT=`migrations/${ID}/audit`;
const EXPORT=`${AUDIT}/canvas-v1`;
const RECEIPT=`${EXPORT}/extraction-receipt.json`;
const OUT='output/alg-l06-p014-canvas-v1';
const GENERATED='packages/demos/src/generated/alg-l06-p014-canvas-v1.ts';
const SOURCE_PIN=Object.freeze({path:SWF,bytes:566603,sha256:SWF_SHA});
const INPUT=Object.freeze({
  audit:{path:`${AUDIT}/source-v1/source-audit-v1.json`,sha256:'008dd6f28d312f41c48ab389efce2e58452aef83c98312fa981c5aa88d69eb13'},
  text:{path:`${AUDIT}/source-v1/source-text-v1.json`,sha256:'cdc0d97c661e1bf749fb9465ceee7de73f36541cebffcc574feb4c539cad39a9'},
  composition:{path:`${AUDIT}/source-v1/source-composition-v1.json`,sha256:'a7615710e2bcf05a97f5fc2714d69be07935b5cf61d1bf6c0554126a715d8013'},
  binary:{path:`${AUDIT}/source-v1/binary-boundary-v1.json`,sha256:'3580ecb093a209f62ed6905152a3c5c93f65dbd4e4798a6dfc46501956a4a913'},
  scripts:{path:`${AUDIT}/source-v1/public-tool-scripts-v1.json`,sha256:'ca982898eaa94a1744a63c6aa1df1c2adb909446d8f50dc3e884d7e1cf37a8a5'},
  xml:{path:`${AUDIT}/source-v1/swfmill-v1.xml.gz`,sha256:'644522709cb6d1efcba4c55c5116360b9a81bb761f0ad112bee32d96fb35a61b'},
  helper:{path:`${EXPORT}/sprites/DefineSprite_227/canvas.js`,sha256:'78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  mainFrames:{path:`${EXPORT}/sprites/DefineSprite_227/frames.html`,sha256:'39c749739c52a726407e458baf4ffb034f6e6b1a2dd199ef806a0d71f8550e68'},
  rootFrames:{path:`${EXPORT}/frames/frames.html`,sha256:'f71b38cbdc6134b4c7b59a7be171ef4c834e9e567d3de9f0fb2ae9eb9632e18b'},
});
const FEEDBACK=Object.freeze({
  'sprite-115':{object:'sprite115',frames:25,role:'right1',stopFrames:[1,25]},
  'sprite-156':{object:'sprite156',frames:27,role:'right2',stopFrames:[1,27]},
  'sprite-83':{object:'sprite83',frames:31,role:'right3',stopFrames:[1,31]},
  'sprite-148':{object:'sprite148',frames:27,role:'right4',stopFrames:[1,27]},
  'sprite-173':{object:'sprite173',frames:31,role:'wrong1',stopFrames:[1,22,31],
    acknowledgment:{buttonId:167,resumeFrame:23}},
  'sprite-187':{object:'sprite187',frames:29,role:'wrong2',stopFrames:[1,23,29],
    acknowledgment:{buttonId:182,resumeFrame:24}},
  'sprite-28':{object:'sprite28',frames:28,role:'wrong3',stopFrames:[1,20,28],
    acknowledgment:{buttonId:21,resumeFrame:21}},
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const pin=(location,bytes)=>({path:location,bytes:bytes.length,sha256:sha(bytes)});

function readPinned(root,pin){
  const file=path.resolve(root,pin.path);
  assert(file.startsWith(`${root}${path.sep}`)&&fs.realpathSync(file)===file,`physical file ${pin.path}`);
  const before=fs.lstatSync(file,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file ${pin.path}`);
  const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
  for(const key of ['dev','ino','size','mtimeNs','nlink'])assert.equal(before[key],after[key],`stable file ${pin.path}`);
  if(pin.bytes!==undefined)assert.equal(bytes.length,pin.bytes,`size drift ${pin.path}`);
  if(pin.sha256)assert.equal(sha(bytes),pin.sha256,`SHA drift ${pin.path}`);
  return bytes;
}
function inventory(dir){
  return fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})
    .sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(entry=>{
      assert(!entry.isSymbolicLink(),'no export symlink');
      const name=`${dir}/${entry.name}`;
      return entry.isDirectory()?inventory(name):name===RECEIPT?[]:[pin(name,readPinned(ROOT,{path:name}))];
    });
}
function replaceOnce(source,needle,replacement,label){
  const at=source.indexOf(needle);
  assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
  return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function extractFunction(source,name){
  const begin=source.indexOf(`function ${name}(`);
  const end=source.indexOf('\nfunction ',begin+1);
  assert(begin>=0&&end>begin&&source.indexOf(`function ${name}(`,begin+1)<0,`unique ${name}`);
  return source.slice(begin,end).trimEnd();
}
function sealExport(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
  readPinned(SOURCE_ROOT,SOURCE_PIN);
  assert(!fs.existsSync(path.join(ROOT,RECEIPT)),'export receipt already sealed');
  const help=execFileSync('ffdec',['-help','export'],{encoding:'utf8',maxBuffer:2e6});
  assert(help.includes('v.26.2.1')&&help.includes('sprite:canvas'));
  const files=inventory(EXPORT);
  assert.equal(files.length,28,'root and 13 sprite Canvas exports, each with helper+frames');
  const domains=[2,25,28,83,115,148,156,161,169,173,184,187,227];
  for(const sprite of domains)for(const name of ['canvas.js','frames.html'])
    assert(files.some(file=>file.path===`${EXPORT}/sprites/DefineSprite_${sprite}/${name}`));
  for(const name of ['canvas.js','frames.html'])
    assert(files.some(file=>file.path===`${EXPORT}/frames/${name}`));
  const receipt={schemaVersion:1,kind:'alg-l06-p014-ffdec-canvas-export-v1',animationId:ID,
    source:SOURCE_PIN,tool:'JPEXS Free Flash Decompiler v.26.2.1',
    command:['ffdec','-config','packJavaScripts=false','-onerror','abort','-format',
      'frame:canvas,sprite:canvas','-export','frame,sprite',EXPORT,`$HELP_MATH_G678_SOURCE_ROOT/${SWF}`],
    sourceAudit:INPUT.audit,files,sourceAudioTrailerIncluded:false,
    status:'source extraction only; no renderer or acceptance'};
  fs.writeFileSync(path.join(ROOT,RECEIPT),json(receipt),{flag:'wx'});
  console.log(JSON.stringify({status:'sealed-export',files:files.length,receipt:RECEIPT}));
}

function preserveGradientMask(runtime,name,sourceMarker){
  const original=extractFunction(runtime,name);
  assert(original.includes(sourceMarker)&&original.includes('ctx.fillStyle = grd;'),`source ${name} gradient`);
  const corrected=replaceOnce(original,'ctx.fillStyle = grd;',
    'ctx.fillStyle="rgba(0,0,0,1)";',`${name} opaque clip fill`);
  return replaceOnce(runtime,original,corrected,`${name} source clip normalization`);
}

export function buildP014Canvas(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS root');
  readPinned(SOURCE_ROOT,SOURCE_PIN);
  const inputs=Object.fromEntries(Object.entries(INPUT).map(([key,value])=>[key,readPinned(ROOT,value)]));
  const receiptBytes=readPinned(ROOT,{path:RECEIPT});
  const receipt=JSON.parse(receiptBytes);
  assert.equal(receipt.kind,'alg-l06-p014-ffdec-canvas-export-v1');
  assert.deepEqual(receipt.source,SOURCE_PIN);
  assert.deepEqual(receipt.files,inventory(EXPORT));
  const audit=JSON.parse(inputs.audit),composition=JSON.parse(inputs.composition);
  const text=JSON.parse(inputs.text),binary=JSON.parse(inputs.binary);
  const publicScripts=JSON.parse(inputs.scripts);
  assert.equal(audit.source.sha256,SWF_SHA);
  assert.equal(audit.capabilityBoundary.xmlCompleteStructuralEvidence,false);
  assert.equal(binary.trailers.length,1);
  assert.deepEqual([binary.trailers[0].domain,binary.trailers[0].bytes,binary.trailers[0].sha256],
    ['sprite-83',386,'d14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0']);
  assert.deepEqual([composition.main.domainId,composition.main.rootEntryFrame,
    composition.main.declaredFrames],['sprite-227',6,449]);
  assert.deepEqual(composition.root.events.filter(e=>e.frame===6&&e.kind==='place')
    .map(e=>[e.depth,e.characterId,...e.matrix.slice(4)]),
    [[1,2,8000,862],[3,227,8248,5666]]);
  assert.deepEqual(composition.masks.map(m=>[m.domain,m.frame,m.characterId,m.depth,m.clipDepth]),
    [['sprite-83',2,58,1,7],['sprite-227',97,192,53,55],['sprite-227',108,207,54,59]]);
  assert.equal(text.summary.textDefinitions,47);
  assert.equal(text.summary.dynamicFields,3);
  assert.equal(binary.morphs.length,62);
  assert.equal(binary.buttons.length,7);
  const mainInstances=composition.main.instances;
  for(const [domain,branch] of Object.entries(FEEDBACK)){
    const item=mainInstances.find(instance=>instance.characterId===Number(domain.slice(7)));
    assert(item,`source placement for ${domain}`);
    assert.equal(composition.allDomains.find(d=>d.domainId===domain)?.declaredFrames,branch.frames);
    const id=domain.slice(7);
    for(const frame of branch.stopFrames){
      const action=publicScripts.files.find(file=>file.path===
        `scripts/DefineSprite_${id}/frame_${frame}/DoAction.as`);
      assert(action?.text.trimStart().startsWith('stop();'),`source ${domain} stop frame ${frame}`);
    }
    if(branch.acknowledgment){
      const {buttonId,resumeFrame}=branch.acknowledgment;
      const action=publicScripts.files.find(file=>file.path===
        `scripts/DefineButton2_${buttonId}/BUTTONCONDACTION on(release).as`);
      assert(action?.text.includes(`_parent.gotoAndPlay(${resumeFrame});`),
        `source ${domain} acknowledgment ${buttonId}`);
    }
  }
  assert(publicScripts.files.find(file=>file.path===
    'scripts/DefineSprite_227/frame_120/DoAction.as')?.text.trimStart().startsWith('stop();'),
  'main quiz frame source stop');
  const xml=gunzipSync(inputs.xml).toString();
  for(const item of composition.masks)
    assert(xml.includes(`objectID="${item.characterId}" clipDepth="${item.clipDepth}"`),
      `source clip placement ${item.characterId}`);
  const frames=inputs.mainFrames.toString().replace(/\r\n?/gu,'\n');
  const root=inputs.rootFrames.toString().replace(/\r\n?/gu,'\n');
  const canvas=frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header=frames.match(/function sprite227\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas&&header);
  assert.deepEqual([+canvas[1],+canvas[2],+header[1],+header[2],+header[3]],
    [1181,498,599,216.8,449]);
  const definitions=frames.slice(0,frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length>0,'FFDec definitions boundary');
  const placed=[...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
    .map(match=>match[1]))].sort();
  const fonts=[...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
  const images=[...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(m=>m[1]);
  const textNames=[...new Set([...definitions.matchAll(/function\s+(text\d+)\(ctx,ctrans,frame,ratio,time\)\{/gu)]
    .map(m=>m[1]))].sort();
  assert.equal(placed.length,205);
  assert.equal(fonts.length,8);
  assert.deepEqual(images,['imageObj76','imageObj149','imageObj151','imageObj153','imageObj193']);
  assert.deepEqual(textNames.map(n=>Number(n.slice(4))).sort((a,b)=>a-b),
    text.textDefinitions.map(d=>d.characterId).sort((a,b)=>a-b));
  assert.equal(placed.filter(name=>name.startsWith('morphshape')).length,62);
  for(const branch of Object.values(FEEDBACK))assert(placed.includes(branch.object));
  const rootBlock=root.slice(root.indexOf('function main('));
  const rootFrameSix=rootBlock.slice(rootBlock.indexOf('case 5:'),rootBlock.indexOf('case 6:'));
  const rootLines=rootFrameSix.split('\n').filter(line=>/place\("(?:sprite2|sprite227)"/u.test(line));
  assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['sprite2','sprite227']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,400.0,43.1]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const rootShape=extractFunction(root,'shape1');
  const rootSprite=extractFunction(root,'sprite2');
  assert(rootSprite.includes('place("shape1"')&&rootShape.length>1000);
  const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
    classification:'unregistered-source-bound-canvas-candidate-v1',
    source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SWF}`,swfSha256:SWF_SHA},
    evidence:{scenarioInventory:INPUT.audit.path,scenarioInventorySha256:INPUT.audit.sha256,
      audioAudit:INPUT.binary.path,audioAuditSha256:INPUT.binary.sha256},
    ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper:INPUT.helper.path,helperSha256:INPUT.helper.sha256,
      framesHtml:INPUT.mainFrames.path,framesHtmlSha256:INPUT.mainFrames.sha256,
      targetSpriteObjectId:227,targetSpriteFunction:'sprite227',
      exportCanvas:{width:1181,height:498},exportInternalTranslation:{x:599,y:216.8},
      expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
      expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
      embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
    timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
      root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
        placementName:'animation',placementTwips:{x:8248,y:5666},placementPixels:{x:412.4,y:283.3}},
      local:{timelineId:'sprite-227',frameCount:449,livePlaybackEndFrame:449,
        playbackMode:'once',publicFrameIndexing:'one-indexed'},
      stageRenderOffset:{x:-186.6,y:66.5}},
    runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
      defaultScenario:'source-static-frame',supportedLanguages:['en'],
      visualLocalization:'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping:'fixed-zero-no-source-randomness-executed',blockedLocalFrameRanges:[],
      currentCanonicalFrameDomainDispositionAsserted:false,
      unresolved:['No AVM1 executes; child feedback must be selected by explicit player state.',
        'Sprite-83 386-byte untagged tail is not part of the Canvas or audio stream.',
        'Original-runtime/fidelity, listening and human/Owner gates remain separate.']},
    output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',spec:'adapter-spec.json',
      globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
  let runtime=buildSafeRuntime({helperSource:inputs.helper.toString(),framesHtml:frames,spec}).runtime;
  runtime=normalizeSourceClipMasks(runtime,[{characterId:58,
    placements:[{depth:1,clipDepth:7}],
    rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,0.43137255]));'}],xml);
  runtime=preserveGradientMask(runtime,'morphshape192','ctx.createLinearGradient(46.75+ratio*(0)/65535');
  runtime=preserveGradientMask(runtime,'shape207','ctx.createLinearGradient(46.75,33.0');
  runtime=runtime.replaceAll(`course-${ID}`,ID);
  assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
  runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootShape}\n\n${rootSprite}\n\nSAFE_OBJECTS = Object.freeze({`,'root source functions');
  runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n        "sprite2": sprite2,\n',
    'root object registry');
  const oldDraw='ctx.transform(1, 0, 0, 1, -186.6, 66.5);\n        sprite227(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
  const rootBefore='var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
    +`        var time = state.exportFrame;\n        ${rootLines[0].trim()}\n        `;
  runtime=replaceOnce(runtime,oldDraw,rootBefore+oldDraw,'root depth-1 title and main source artwork');
  runtime=replaceOnce(runtime,'var SAFE_OBJECTS = null;',
    'var SAFE_OBJECTS = null;\nvar ACTIVE_P014_FEEDBACK = null;\nvar P014_FEEDBACK_OBJECTS = Object.freeze('+
    JSON.stringify(Object.fromEntries(Object.entries(FEEDBACK).map(([domain,value])=>[value.object,domain])))+');',
    'feedback dispatcher globals');
  runtime=replaceOnce(runtime,'    var renderer = SAFE_OBJECTS[obj];',
    '    var feedbackDomain = P014_FEEDBACK_OBJECTS[obj];\n'
    +'    if (feedbackDomain !== undefined && (ACTIVE_P014_FEEDBACK === null || '
    +'ACTIVE_P014_FEEDBACK.domain !== feedbackDomain)) return;\n'
    +'    var feedbackFrame = feedbackDomain === undefined ? null : ACTIVE_P014_FEEDBACK.frame - 1;\n'
    +'    var renderer = SAFE_OBJECTS[obj];',
    'only selected source feedback placement');
  runtime=replaceOnce(runtime,'    renderer(ctx,activeTransform,frame,ratio,time);',
    '    if (feedbackFrame !== null) activeTransform = new cxform('
    +'activeTransform.r_add,activeTransform.g_add,activeTransform.b_add,0,'
    +'activeTransform.r_mult,activeTransform.g_mult,activeTransform.b_mult,256);\n'
    +'    renderer(ctx,activeTransform,feedbackFrame === null ? frame : feedbackFrame,ratio,time);',
    'selected feedback frame/visibility');
  runtime=replaceOnce(runtime,'function resolveFrameState(request) {',
    'function resolveBaseFrameState(request) {','base source frame resolver');
  const feedbackContract=`var P014_FEEDBACK_DOMAINS = Object.freeze(${JSON.stringify(FEEDBACK)});
function resolveFrameState(request) {
    var base = resolveBaseFrameState(request);
    var feedback = request && request.feedback;
    if (feedback === undefined || feedback === null) {
        return Object.freeze(Object.assign({},base,{feedbackDomain:null,feedbackFrame:null,feedback:null}));
    }
    if (base.localFrame !== 120 || typeof feedback !== "object" || Array.isArray(feedback)) {
        throw new Error("feedback requires held source quiz frame 120");
    }
    var domain = feedback.domain;
    if (typeof domain !== "string" || !Object.prototype.hasOwnProperty.call(P014_FEEDBACK_DOMAINS,domain)) {
        throw new Error("unsupported source feedback domain");
    }
    var frame = feedback.frame, entry = P014_FEEDBACK_DOMAINS[domain];
    if (!Number.isSafeInteger(frame) || frame < 1 || frame > entry.frames) {
        throw new Error("feedback frame is outside source child domain");
    }
    return Object.freeze(Object.assign({},base,{feedbackDomain:domain,feedbackFrame:frame,
        feedback:Object.freeze({domain:domain,frame:frame})}));
}
`;
  runtime=replaceOnce(runtime,'function render(targetCanvas, request) {',
    feedbackContract+'\nfunction render(targetCanvas, request) {',
    'source child frame request resolver');
  runtime=replaceOnce(runtime,'    var state = resolveFrameState(request);',
    '    var state = resolveFrameState(request);\n    var previousFeedback = ACTIVE_P014_FEEDBACK;',
    'active branch state');
  runtime=replaceOnce(runtime,'    canvas = targetCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
    '    ctx.setTransform(1, 0, 0, 1, 0, 0);',
    'defer mutable canvas until drawing try');
  runtime=replaceOnce(runtime,'    ctx.save();\n    try {\n        var ctrans =',
    '    ctx.save();\n    canvas = targetCanvas;\n    ACTIVE_P014_FEEDBACK = state.feedback;\n'
    +'    try {\n        var ctrans =',
    'activate branch only inside protected drawing section');
  runtime=replaceOnce(runtime,'        canvas = previousCanvas;',
    '        canvas = previousCanvas;\n        ACTIVE_P014_FEEDBACK = previousFeedback;',
    'restore active branch');
  runtime=replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
    '    var drawingCanvas = document.createElement("canvas");\n'
    +'    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
    +'    var ctx = drawingCanvas.getContext("2d");',
    'fresh drawing context per requested source frame');
  runtime=replaceOnce(runtime,'    canvas = targetCanvas;\n    ACTIVE_P014_FEEDBACK = state.feedback;',
    '    canvas = drawingCanvas;\n    ACTIVE_P014_FEEDBACK = state.feedback;',
    'isolate source clip stack from host canvas');
  runtime=replaceOnce(runtime,'        canvas = previousCanvas;\n        ACTIVE_P014_FEEDBACK = previousFeedback;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
    '        canvas = previousCanvas;\n        ACTIVE_P014_FEEDBACK = previousFeedback;\n'
    +'    }\n    targetCanvas.width = 800;\n'
    +'    var targetCtx = targetCanvas.getContext("2d");\n'
    +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
    +'    targetCtx.drawImage(drawingCanvas, 0, 0);\n'
    +'    if (typeof targetCanvas.setAttribute === "function") {',
    'copy isolated source drawing to reset host surface');
  runtime=replaceOnce(runtime,'        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));',
    '        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));\n'
    +'        if (state.feedbackDomain !== null) {\n'
    +'            targetCanvas.setAttribute("data-feedback-domain", state.feedbackDomain);\n'
    +'            targetCanvas.setAttribute("data-feedback-frame", String(state.feedbackFrame));\n'
    +'        } else if (typeof targetCanvas.removeAttribute === "function") {\n'
    +'            targetCanvas.removeAttribute("data-feedback-domain");\n'
    +'            targetCanvas.removeAttribute("data-feedback-frame");\n'
    +'        }',
    'feedback identity attributes');
  assert(runtime.includes('"morphshape192": morphshape192'));
  assert(runtime.includes('"sprite83": sprite83'));
  assert(runtime.includes('"imageObj76"')===false,'image variables are direct embedded objects');
  new Script(runtime);
  const script=Buffer.from(runtime);
  const sourceDepthOrder=[{depth:1,characterId:2},{depth:3,characterId:227}];
  const sourceGlyphRendering={definitions:47,dynamicFields:3,preserved:true,
    nativeBinding:'semantic-flow-companion',canvasAriaHiddenByHost:true};
  const sourceClipMasks=composition.masks.map(({domain,frame,depth,clipDepth,characterId})=>
    ({domain,frame,depth,clipDepth,characterId}));
  const metadata=json({animationId:ID,sourceSwfSha256:SWF_SHA,stage:{width:800,height:600},
    fps:12,rootFrame:6,frameDomain:'sprite-227',frameCount:449,
    scenario:'source-static-frame',visualLocalization:'source-en-fallback',
    feedbackDomains:Object.fromEntries(Object.entries(FEEDBACK).map(([domain,value])=>
      [domain,{frameCount:value.frames,role:value.role,sourceStopFrames:value.stopFrames,
        acknowledgment:value.acknowledgment??null}])),
    sourceDepthOrder,sourceGlyphRendering,sourceClipMasks,
    sourceMorphCharacterIds:binary.morphs.map(item=>item.characterId),
    embeddedImageVariables:images,stageRenderOffset:{x:-186.6,y:66.5},
    untaggedSprite83Trailer:{bytes:386,sha256:binary.trailers[0].sha256,
      includedInTaggedAudio:false},
    assetPath:'/flash-assets/g678-local/shared-alg001-l06-p014/canvas-renderer.js',
    assetSha256:sha(script)});
  const ts=Buffer.from('/* Generated by scripts/build-alg-l06-p014-canvas-v1.mjs. Do not edit. */\n'
    +`export const P014_CANVAS_V1 = ${metadata.toString().trim()} as const;\n`);
  const manifest=json({schemaVersion:1,kind:'alg-l06-p014-maintained-canvas-v1',animationId:ID,
    status:'unregistered-drawing-candidate',source:SOURCE_PIN,
    rootFrame:6,mainFrameCount:449,stage:{width:800,height:600},
    sourceDepthOrder,sourceGlyphRendering,feedbackDomains:JSON.parse(metadata).feedbackDomains,
    sourceMaskNormalization:sourceClipMasks,
    sourceMorphCharacterIds:binary.morphs.map(item=>item.characterId),
    sourceAudioTrailer:JSON.parse(metadata).untaggedSprite83Trailer,
    inputs:[...Object.entries(INPUT).map(([key,value])=>({key,...pin(value.path,inputs[key])})),
      {key:'exportReceipt',...pin(RECEIPT,receiptBytes)}],
    outputs:[pin(`${OUT}/canvas-renderer.js`,script),pin(GENERATED,ts)],
    acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
      listening:false,human:false,owner:false,strictComplete:false,publication:false}});
  return {runtime:script,metadata:ts,manifest};
}

function main(){
  const mode=process.argv[2];
  assert(process.argv.length===3&&['--seal-export','--build','--check'].includes(mode),
    'usage: build-alg-l06-p014-canvas-v1.mjs --seal-export|--build|--check');
  if(mode==='--seal-export')return sealExport();
  const built=buildP014Canvas();
  if(mode==='--build')fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});
  const files=[[`${OUT}/canvas-renderer.js`,built.runtime],
    [GENERATED,built.metadata],[`${OUT}/canvas-manifest.json`,built.manifest]];
  for(const [name,bytes] of files){
    const target=path.join(ROOT,name);
    if(mode==='--check')assert(fs.readFileSync(target).equals(bytes),`${name} drifted`);
    else fs.writeFileSync(target,bytes);
  }
  console.log(JSON.stringify({status:mode==='--check'?'verified':'built',
    files:files.map(([name,bytes])=>pin(name,bytes))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
