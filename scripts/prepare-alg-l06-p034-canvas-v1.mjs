#!/usr/bin/env node
/** Reproducible, source-pinned P034 drawing candidate; page behavior stays state-owned. */
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
const SOURCE='G6-G8-shared/ALG001/L6/IN/L6IN06.swf';
const SOURCE_PIN={path:SOURCE,bytes:156186,sha256:'32ddbfde743b785610360f38b7030ab2dbd289438f6c4433e6699ce3004a629a'};
const ID='shared-alg001-l06-p034';
const PLAN='output/alg-l06-p034-source-planning-20261001-v1';
const PREP='output/alg-l06-p034-renderer-preparation-20261001-v1';
const OUT='migrations/shared-alg001-l06-p034/canvas-v1';
const MEMBER=`work/g678-shared-page-factory/alg-l06-p034-maintained-canvas-v1-20261001-v1/members/${ID}/canvas-renderer.js`;
const CHILD=`${PREP}/source-canvas-export/sprites/DefineSprite_40/frames.html`;
const HELPER=`${PREP}/source-canvas-export/sprites/DefineSprite_40/canvas.js`;
const ROOT_FRAMES=`${PREP}/source-canvas-export/frames/frames.html`;
const GEOMETRY=`${PREP}/renderer-geometry-v1.json`;
const RAW_MASKS={
 2:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,0.48235294]));',
 10:'ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.15294118]));',
 30:'ctx.fillStyle=tocolor(ctrans.apply([255,255,0,0.0]));',
};
const LINE_SOURCE='place("sprite35",canvas,ctx,[1.0,0.0,0.0,1.0,4.0,3.0],ctrans,1,(0+time)%1,0,time);';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function physical(base,relative){
 const file=path.resolve(base,relative);
 assert(file.startsWith(base+path.sep)&&fs.realpathSync(file)===file,`physical ${relative}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${relative}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${relative}:${key}`);
 return bytes;
}
function replaceOnce(source,needle,replacement,label){
 const at=source.indexOf(needle);
 assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
 return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function sourceFunction(source,name){
 const marker=`function ${name}(`,at=source.indexOf(marker),end=source.indexOf('\nfunction ',at+1);
 assert(at>=0&&end>at&&source.indexOf(marker,at+1)<0,`unique ${name}`);
 return source.slice(at,end).trimEnd();
}
function build(){
 const planBytes=physical(ROOT,`${PLAN}/source-plan-v1.json`);
 const xmlBytes=physical(ROOT,`${PLAN}/source-structure.xml`);
 const displayBytes=physical(ROOT,`${PLAN}/source-display-list-v1.json`);
 const geometryBytes=physical(ROOT,GEOMETRY);
 const helperBytes=physical(ROOT,HELPER),childBytes=physical(ROOT,CHILD);
 const rootBytes=physical(ROOT,ROOT_FRAMES);
 const plan=JSON.parse(planBytes),display=JSON.parse(displayBytes),geometry=JSON.parse(geometryBytes);
 const child=childBytes.toString().replace(/\r\n?/gu,'\n');
 const root=rootBytes.toString().replace(/\r\n?/gu,'\n');
 const xml=xmlBytes.toString();
 assert.equal(plan.identity.animationId,ID);
 assert.deepEqual(plan.physicalSource.swf,SOURCE_PIN);
 assert.equal(display.sourceSwfSha256,SOURCE_PIN.sha256);
 assert.equal(geometry.source.sha256,SOURCE_PIN.sha256);
 for(const input of geometry.inputs){
  const bytes=physical(ROOT,input.path);
  assert.equal(bytes.length,input.bytes,`geometry input bytes ${input.path}`);
  assert.equal(sha(bytes),input.sha256,`geometry input hash ${input.path}`);
 }
 assert.equal(plan.header.rootFrames,13);
 assert.equal(plan.header.fps,12);
 assert.equal(geometry.root.mainSpriteId,40);
 assert.equal(geometry.root.mainFrames,434);
 assert.equal(geometry.drag.activationFrame,433);
 assert.deepEqual(geometry.drag.sourceLine.transformTwips,{transX:'4',transY:'3'});
 assert.equal(geometry.drag.sourceLine.objectId,35);
 assert.equal(geometry.drag.sourceLine.depth,28);
 assert.deepEqual(geometry.drag.sourceLine.sourceBoundsTwips,[0,60,-1579,1643]);
 assert.equal(geometry.drag.sourceGraph.objectId,36);
 assert.deepEqual(geometry.drag.sourceGraph.presentSpans,[[433,434]]);
 assert(!geometry.drag.runtimeWidthVerified);
 const masks=geometry.sourceMasks.map(({objectId,depth,clipDepth,presentSpans})=>
  ({objectId,depth,clipDepth,presentSpans}));
 assert.equal(masks.length,9);
 assert.deepEqual([...new Set(masks.map(m=>m.objectId))].sort((a,b)=>a-b),[2,10,30]);
 assert.deepEqual(plan.structure.sourceClipMasks.map(({objectId,depth,clipDepth})=>
  [objectId,depth,clipDepth]),masks.map(({objectId,depth,clipDepth})=>
  [objectId,depth,clipDepth]));
 const maskSpecs=[2,10,30].map(characterId=>({characterId,
  placements:masks.filter(m=>m.objectId===characterId).map(({depth,clipDepth})=>({depth,clipDepth})),
  rawFill:RAW_MASKS[characterId]}));
 const textIds=[...new Set([...child.matchAll(/place\("text(\d+)"/gu)].map(m=>Number(m[1])))].sort((a,b)=>a-b);
 assert.deepEqual(textIds,[5,12,15,17,19,24,25,26,27,28,31,32,33]);
 assert.equal(geometry.text.sourceDefinitionCount,13);
 assert.equal(geometry.text.instances.length,47);
 const placed=[...new Set([...child.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m=>m[1]))].sort();
 const fonts=[...child.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
 const images=[...child.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)].map(m=>m[1]);
 assert.equal(placed.length,36);
 assert.deepEqual(fonts,['font4']);assert.deepEqual(images,[]);
 assert.equal(child.split(LINE_SOURCE).length-1,1,'one authored nested Mc_Line placement');
 assert.equal(child.split('place("sprite36"').length-1,2,'graph on source frames 433 and 434');
 assert(child.includes('case 432:')&&child.includes('case 433:'));
 const rootMain=root.slice(root.indexOf('function main('));
 const entry=rootMain.slice(rootMain.indexOf('case 5:'),rootMain.indexOf('case 6:'));
 const rootPlacements=entry.split('\n').filter(line=>/place\("(?:shape1|sprite40)"/u.test(line));
 assert.deepEqual(rootPlacements.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['shape1','sprite40']);
 assert(rootPlacements[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
 assert(rootPlacements[1].includes('[0.05,0.0,0.0,0.05,412.4,313.3]'));
 const exportOrigin=child.match(/function sprite40\(ctx,ctrans,frame,ratio,time\)\{\s*ctx\.save\(\);\s*ctx\.transform\(1,0,0,1,([^,]+),([^\)]+)\);/u);
 assert(exportOrigin,'source export internal origin');
 assert.deepEqual(exportOrigin.slice(1).map(Number),[326.35,227.3]);
 const stageOffset={x:412.4-326.35,y:313.3-227.3};
 const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
  classification:'behavior-heavy-unregistered-source-canvas-v1',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,swfSha256:SOURCE_PIN.sha256},
  evidence:{scenarioInventory:`${PLAN}/source-plan-v1.json`,scenarioInventorySha256:sha(planBytes),
   audioAudit:`${PLAN}/source-plan-v1.json`,audioAuditSha256:sha(planBytes),
   sourceXml:`${PLAN}/source-structure.xml`,sourceXmlSha256:sha(xmlBytes),
   sourceDisplayList:`${PLAN}/source-display-list-v1.json`,sourceDisplayListSha256:sha(displayBytes)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:HELPER,helperSha256:sha(helperBytes),framesHtml:CHILD,framesHtmlSha256:sha(childBytes),
   targetSpriteObjectId:40,targetSpriteFunction:'sprite40',exportCanvas:{width:685,height:392},
   exportInternalTranslation:{x:326.35,y:227.3},
   expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:0,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:13,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:6266},
    placementPixels:{x:412.4,y:313.3}},
   local:{timelineId:'sprite-40',frameCount:434,livePlaybackEndFrame:433,
    playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:stageOffset},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English visuals; es requires explicit source-English fallback',
   seedMapping:'fixed zero; no source random behavior executed',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Mc_Line is state-owned and hidden until an explicit graph action.',
    'Graph hit target, runtime _width and startDrag clamp remain unverified.',
    'Audio source clock, native glyph ownership, My Lesson interaction and original runtime remain separate.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',spec:'adapter-spec.json',
   globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helperBytes.toString(),framesHtml:child,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,maskSpecs,xml);
 runtime=replaceOnce(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n'
  +'        throw new Error("seed must be fixed zero for this source frame");\n    }','fixed source seed');
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${sourceFunction(root,'shape1')}\n\nSAFE_OBJECTS = Object.freeze({`,'source root background');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n','source root background object');
 // The raw FFDec draw ignores Mc_Line's authored onClipEvent(load) hide.
 // Replace its sole depth-28 placement in sprite36. x is graph-local pixels;
 // this particular exported function uses twips, hence x*20. y=3 twips is unchanged.
 runtime=replaceOnce(runtime,LINE_SOURCE,
  'if (P034_LINE && P034_LINE.visible) '
  +'place("sprite35",canvas,ctx,[1.0,0.0,0.0,1.0,P034_LINE.xGraphLocalPixels*20,3.0],ctrans,1,(0+time)%1,0,time);',
  'source sprite35 line placement');
 assert.equal(runtime.split('place("sprite35"').length-1,1,'only controlled line draw remains');
 runtime=replaceOnce(runtime,'var readyPromise = null;',
  'var P034_LINE = null;\nvar readyPromise = null;','line render owner');
 runtime=replaceOnce(runtime,'    return Object.freeze({\n        frameDomain:',
  `    var requestedLine = request.line;
    var line = Object.freeze({visible: false, xGraphLocalPixels: 0.2});
    if (requestedLine !== undefined) {
        if (!requestedLine || typeof requestedLine !== "object" ||
            typeof requestedLine.visible !== "boolean" ||
            !Number.isFinite(requestedLine.xGraphLocalPixels)) {
            throw new Error("line must have boolean visibility and finite graph-local x");
        }
        if (requestedLine.visible && frame < 433) {
            throw new Error("source graph is absent before frame 433");
        }
        line = Object.freeze({visible: requestedLine.visible,
            xGraphLocalPixels: requestedLine.xGraphLocalPixels});
    }
    return Object.freeze({
        frameDomain:`, 'line state validation');
 runtime=replaceOnce(runtime,'        audioRendered: false\n    });',
  '        audioRendered: false,\n        line: line\n    });','line in pure frame state');
 const oldDraw=`ctx.transform(1, 0, 0, 1, ${stageOffset.x}, ${stageOffset.y});\n`
  +'        sprite40(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 runtime=replaceOnce(runtime,oldDraw,
  'var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
  +`        var time = state.exportFrame;\n        ${rootPlacements[0].trim()}\n        `
  +oldDraw,'source depth-1 background before sprite40');
 runtime=replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
  '    var drawingCanvas = document.createElement("canvas");\n'
  +'    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
  +'    var ctx = drawingCanvas.getContext("2d");','isolated source canvas');
 runtime=replaceOnce(runtime,'    canvas = targetCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
  '    canvas = drawingCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);','isolated drawing context');
 runtime=replaceOnce(runtime,'    ctx.save();\n    try {\n        var ctrans =',
  '    var previousLine = P034_LINE;\n    ctx.save();\n    try {\n        P034_LINE = state.line;\n        var ctrans =',
  'scoped state-owned line before draw');
 runtime=replaceOnce(runtime,'        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
  '        canvas = previousCanvas;\n        P034_LINE = previousLine;\n    }\n'
  +'    if (typeof targetCanvas.setAttribute === "function") {','line cleanup');
 runtime=replaceOnce(runtime,'var P034_LINE = null;\nvar readyPromise = null;',
  'var P034_LINE = null;\nvar readyPromise = null;','line state declaration');
 // Fresh-frame copy prevents masks and prior line positions from persisting on the host canvas.
 runtime=replaceOnce(runtime,'        canvas = previousCanvas;\n        P034_LINE = previousLine;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
  '        canvas = previousCanvas;\n        P034_LINE = previousLine;\n    }\n'
  +'    var targetCtx = targetCanvas.getContext("2d");\n'
  +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
  +'    targetCtx.save();\n'
  +'    try { targetCtx.setTransform(1,0,0,1,0,0); targetCtx.clearRect(0,0,800,600);\n'
  +'        targetCtx.drawImage(drawingCanvas,0,0); } finally { targetCtx.restore(); }\n'
  +'    if (typeof targetCanvas.setAttribute === "function") {','fresh frame host copy');
 new Script(runtime,{filename:'p034-canvas-renderer.js'});
 const script=Buffer.from(runtime);
 const lineContract={owner:'page-state-only',sourceSpriteId:35,parentGraphSpriteId:36,
  sourceDepth:28,defaultVisible:false,defaultXGraphLocalPixels:0.2,
  sourceTransformTwips:{x:4,y:3},yGraphLocalPixels:0.15,
  publicInput:'render(canvas,{frame,line:{visible,xGraphLocalPixels}})',
  xUnit:'graph-local pixels; renderer converts to source twips at draw',
  graphAvailableFrames:[433,434],authoredHoldFrame:433,
  widthOrHitInference:'none',decodedAudioClockCoupling:false};
 const metadata=json({animationId:ID,sourceSwfSha256:SOURCE_PIN.sha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,rootFrameCount:13,
  frameDomain:'sprite-40',frameCount:434,authoredHoldFrame:433,
  scenario:'source-static-frame',visualLocalization:'source-en-fallback',
  sourceGlyphRendering:{sourceCharacterIds:textIds,mode:'preserve-all',canvasAriaHiddenByHost:true},
  sourceClipMasks:masks,sourceMaskNormalization:{normalizedSolidShapes:[2,10,30]},
  stageRenderOffset:stageOffset,lineContract,assetSha256:sha(script),audioRendered:false});
 const inputFiles=[['sourcePlan',`${PLAN}/source-plan-v1.json`],
  ['sourceXml',`${PLAN}/source-structure.xml`],['displayList',`${PLAN}/source-display-list-v1.json`],
  ['geometry',GEOMETRY],['helper',HELPER],['childFrames',CHILD],['rootFrames',ROOT_FRAMES],
  ['generator','scripts/prepare-alg-l06-p034-canvas-v1.mjs'],
  ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
  ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs']];
 const inputs=inputFiles.map(([key,name])=>({key,...pin(name,physical(ROOT,name))}));
 const manifest=json({schemaVersion:1,kind:'alg-l06-p034-maintained-canvas-v1',
  status:'unregistered-drawing-engineering-candidate',animationId:ID,source:SOURCE_PIN,
  rootFrame:6,rootFrameCount:13,mainFrameCount:434,authoredHoldFrame:433,
  stage:{width:800,height:600},sourceGlyphsPreserved:true,sourceTextDefinitions:13,
  sourceTextPlacements:47,sourceClipMasks:masks,normalizedMaskCharacterIds:[2,10,30],
  lineContract,inputs,outputs:[pin(`${OUT}/canvas-renderer.js`,script),
   pin(`${OUT}/canvas-metadata-v1.json`,metadata),pin(MEMBER,script)],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   audio:false,listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 return {script,metadata,manifest,spec:json(spec)};
}
function main(){
 const mode=process.argv[2];
 assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write | --check');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const swf=physical(SOURCE_ROOT,SOURCE);
 assert.equal(swf.length,SOURCE_PIN.bytes);assert.equal(sha(swf),SOURCE_PIN.sha256);
 const built=build();
 const files=[[`${OUT}/canvas-renderer.js`,built.script],
  [`${OUT}/canvas-metadata-v1.json`,built.metadata],
  [`${OUT}/canvas-manifest-v1.json`,built.manifest],
  [`${OUT}/adapter-spec.json`,built.spec],[MEMBER,built.script]];
 for(const [name,bytes] of files){
  const file=path.join(ROOT,name);
  if(mode==='--check')assert(fs.readFileSync(file).equals(bytes),`${name} drift`);
  else {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}
 }
 console.log(JSON.stringify({status:mode==='--write'?'written':'verified',source:SOURCE_PIN,
  canvas:pin(`${OUT}/canvas-renderer.js`,built.script),masks:9,mainFrames:434,
  line:'hidden-until-explicit-state-owned-graph-action'}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
export {build as buildP034Canvas};
