#!/usr/bin/env node
/** Deterministic, source-bound drawing candidate for ALG001 L6 P032. */
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
const SOURCE='G6-G8-shared/ALG001/L6/IN/L6IN04.swf';
const SOURCE_PIN={path:SOURCE,bytes:146070,sha256:'e425600d0b6cfab41ae50f7512cb8e6c4e3c6ee04bbfa10c29b437459876d836'};
const ID='shared-alg001-l06-p032';
const PLAN='migrations/shared-alg001-l06-p032/audit/source-planning-v1';
const EXPORT='migrations/shared-alg001-l06-p032';
const OUT='migrations/shared-alg001-l06-p032/canvas-v1';
const MEMBER=`work/g678-shared-page-factory/alg-l06-p032-maintained-canvas-v1-20261001-v1/members/${ID}/canvas-renderer.js`;
const HELPER=`${EXPORT}/source-export/sprites/DefineSprite_22/canvas.js`;
const CHILD=`${EXPORT}/source-export/sprites/DefineSprite_22/frames.html`;
const ROOT_FRAMES=`${EXPORT}/source-export/frames/frames.html`;
const EXPORT_FILES=[`${EXPORT}/source-export/frames/canvas.js`,ROOT_FRAMES,HELPER,CHILD];
const MASKS=[{frame:1,characterId:2,depth:1,clipDepth:10},
 {frame:60,characterId:2,depth:11,clipDepth:16}];
const TEXT_IDS=[5,11,13,15,16,17,18,19,20];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
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
function functionSource(source,name){
 const marker=`function ${name}(`,at=source.indexOf(marker),end=source.indexOf('\nfunction ',at+1);
 assert(at>=0&&end>at&&source.indexOf(marker,at+1)<0,`unique ${name}`);
 return source.slice(at,end).trimEnd();
}
function placedFunctions(source){
 return [...new Set([...source.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
  .map(match=>match[1]))].sort();
}
function receipt(){
 return json({schemaVersion:1,kind:'alg-l06-p032-physical-canvas-export-v1',
  animationId:ID,source:{...SOURCE_PIN,root:SOURCE_ROOT},
  tool:'JPEXS Free Flash Decompiler v.26.2.1',
  command:['ffdec','-config','packJavaScripts=false','-onerror','abort','-format',
   'frame:canvas,sprite:canvas','-export','frame,sprite',`${EXPORT}/source-export`,
   `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
  files:EXPORT_FILES.map(name=>pin(name,physical(ROOT,name))),
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
}
export function buildP032Canvas(){
 const planBytes=physical(ROOT,`${PLAN}/source-plan-v1.json`);
 const xmlBytes=physical(ROOT,`${PLAN}/source-structure.xml`);
 const displayBytes=physical(ROOT,`${PLAN}/source-display-list-v1.json`);
 const helperBytes=physical(ROOT,HELPER),childBytes=physical(ROOT,CHILD);
 const rootBytes=physical(ROOT,ROOT_FRAMES),receiptBytes=physical(ROOT,`${EXPORT}/source-export/export-receipt-v1.json`);
 const plan=JSON.parse(planBytes),display=JSON.parse(displayBytes),exportReceipt=JSON.parse(receiptBytes);
 const xml=xmlBytes.toString(),root=rootBytes.toString().replace(/\r\n?/gu,'\n');
 const child=childBytes.toString().replace(/\r\n?/gu,'\n');
 assert.equal(plan.identity.animationId,ID);
 assert.equal(plan.physicalSource.swf.sha256,SOURCE_PIN.sha256);
 assert.equal(exportReceipt.source.sha256,SOURCE_PIN.sha256);
 assert.deepEqual(exportReceipt.files,EXPORT_FILES.map(name=>pin(name,physical(ROOT,name))));
 assert(xml.includes('<DefineSprite objectID="22" frames="413">'));
 assert(!xml.includes('<DefineMorphShape '));
 assert.deepEqual(display.sprites['22'].instances.filter(row=>row.clipDepth!==null)
  .map(({objectId,depth,clipDepth,presentSpans})=>
  [objectId,depth,clipDepth,presentSpans[0][0]]),MASKS.map(m=>
  [m.characterId,m.depth,m.clipDepth,m.frame]));
 const placed=placedFunctions(child);
 const textIds=placed.filter(name=>/^text\d+$/u.test(name)).map(name=>Number(name.slice(4))).sort((a,b)=>a-b);
 assert.deepEqual(textIds,TEXT_IDS);
 assert(placed.length>=18);
 const fonts=[...child.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
 const images=[...child.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)].map(m=>m[1]);
 assert.deepEqual(fonts,['font4']);assert.deepEqual(images,[]);
 const rootMain=root.slice(root.indexOf('function main('));
 const entry=rootMain.slice(rootMain.indexOf('case 5:'),rootMain.indexOf('case 6:'));
 const rootPlacements=entry.split('\n').filter(line=>/place\("(?:shape1|sprite22)"/u.test(line));
 assert.deepEqual(rootPlacements.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['shape1','sprite22']);
 assert(rootPlacements[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
 assert(rootPlacements[1].includes('[0.05,0.0,0.0,0.05,412.4,313.3]'));
 const glyphs={sourceCharacterIds:TEXT_IDS,default:'preserve-all',
  suppressTextIdsSupported:false,suppression:'none-until-every-source-instance-is-owned',
  futureNativeOwnershipAllowlist:TEXT_IDS,canvasAriaHiddenByHost:true};
 const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
  classification:'interactive-understood-unregistered-source-canvas-v1',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,swfSha256:SOURCE_PIN.sha256},
  evidence:{scenarioInventory:`${PLAN}/source-plan-v1.json`,scenarioInventorySha256:sha(planBytes),
   audioAudit:`${PLAN}/source-plan-v1.json`,audioAuditSha256:sha(planBytes),
   sourceXml:`${PLAN}/source-structure.xml`,sourceXmlSha256:sha(xmlBytes),
   sourceDisplayList:`${PLAN}/source-display-list-v1.json`,sourceDisplayListSha256:sha(displayBytes)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:HELPER,helperSha256:sha(helperBytes),framesHtml:CHILD,framesHtmlSha256:sha(childBytes),
   targetSpriteObjectId:22,targetSpriteFunction:'sprite22',exportCanvas:{width:648,height:123},
   exportInternalTranslation:{x:333.3,y:227.25},
   expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:0,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:6266},
    placementPixels:{x:412.4,y:313.3}},
   local:{timelineId:'sprite-22',frameCount:413,livePlaybackEndFrame:413,
    playbackMode:'once',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:{x:412.4-333.3,y:313.3-227.25}},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English-visuals; es requires explicit source-English fallback',
   seedMapping:'fixed-zero; no source randomness executed',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Four AVM1 glossary buttons require maintained host controls and per-instance visible geometry.',
    'Embedded English stream and independent SA require separate player controls.',
    'Source-English visual fallback for es is not an authored translation.',
    'Original runtime, relation geometry, visual fidelity, listening and human/Owner gates remain open.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',
   spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helperBytes.toString(),framesHtml:child,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,[{characterId:2,
  placements:MASKS.map(({depth,clipDepth})=>({depth,clipDepth})),
  rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,0.48235294]));'}],xml);
 runtime=replaceOnce(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n'
  +'        throw new Error("seed must be fixed zero for this source frame");\n    }','fixed source seed');
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${functionSource(root,'shape1')}\n\nSAFE_OBJECTS = Object.freeze({`,'root background');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n','root background object');
 const oldDraw=`ctx.transform(1, 0, 0, 1, ${spec.timeline.stageRenderOffset.x}, ${spec.timeline.stageRenderOffset.y});\n`
  +'        sprite22(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 runtime=replaceOnce(runtime,oldDraw,
  'var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
  +`        var time = state.exportFrame;\n        ${rootPlacements[0].trim()}\n        `
  +oldDraw,'source depth-1 before sprite-22');
 runtime=replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
  '    var drawingCanvas = document.createElement("canvas");\n'
  +'    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
  +'    var ctx = drawingCanvas.getContext("2d");','isolated source canvas');
 runtime=replaceOnce(runtime,'    canvas = targetCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
  '    canvas = drawingCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);','isolated drawing context');
 runtime=replaceOnce(runtime,
  '        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
  '        canvas = previousCanvas;\n    }\n'
  +'    var targetCtx = targetCanvas.getContext("2d");\n'
  +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
  +'    targetCtx.save();\n'
  +'    try { targetCtx.setTransform(1,0,0,1,0,0); targetCtx.clearRect(0,0,800,600);\n'
  +'        targetCtx.drawImage(drawingCanvas,0,0); } finally { targetCtx.restore(); }\n'
  +'    if (typeof targetCanvas.setAttribute === "function") {','fresh-frame copy to host');
 runtime=replaceOnce(runtime,'var readyPromise = null;',
  `var P032_METADATA = deepFreeze(Object.assign({}, METADATA, {sourceGlyphRendering:${JSON.stringify(glyphs)}}));\nvar readyPromise = null;`,
  'source glyph retention metadata');
 runtime=replaceOnce(runtime,'metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState',
  'metadata: P032_METADATA, ready: ready, resolveFrameState: resolveFrameState','published metadata');
 new Script(runtime,{filename:'canvas-renderer.js'});
 const script=Buffer.from(runtime);
 const metadata=json({animationId:ID,sourceSwfSha256:SOURCE_PIN.sha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,rootFrameCount:10,
  frameDomain:'sprite-22',frameCount:413,scenario:'source-static-frame',
  visualLocalization:'source-en-fallback',sourceDepthOrder:[{depth:1,characterId:1},{depth:2,characterId:22}],
  sourceClipMasks:MASKS,
  sourceGlyphRendering:glyphs,stageRenderOffset:spec.timeline.stageRenderOffset,
  assetPath:`/flash-assets/g678-local/${ID}/canvas-renderer.js`,assetSha256:sha(script)});
 const inputs=[['sourcePlan',`${PLAN}/source-plan-v1.json`],['sourceXml',`${PLAN}/source-structure.xml`],
  ['displayList',`${PLAN}/source-display-list-v1.json`],['exportReceipt',`${EXPORT}/source-export/export-receipt-v1.json`],
  ['helper',HELPER],['childFrames',CHILD],['rootFrames',ROOT_FRAMES],
  ['generator','scripts/prepare-alg-l06-p032-canvas-v1.mjs'],
  ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
  ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs']]
  .map(([key,name])=>({key,...pin(name,physical(ROOT,name))}));
 const manifest=json({schemaVersion:1,kind:'alg-l06-p032-maintained-canvas-v1',
  animationId:ID,status:'unregistered-drawing-candidate',source:SOURCE_PIN,
  rootFrame:6,rootFrameCount:10,mainFrameCount:413,stage:{width:800,height:600},
  sourceDepthOrder:[{depth:1,characterId:1},{depth:2,characterId:22}],
  sourceGlyphRendering:glyphs,sourceClipMasks:MASKS,
  sourceMaskNormalization:{normalizedSolidShapes:[2],originalRuntimeComparisonPending:true},
  
  inputs,outputs:[pin(`${OUT}/canvas-renderer.js`,script),pin(`${OUT}/canvas-metadata-v1.json`,metadata),pin(MEMBER,script)],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 return {script,metadata,manifest,spec:json(spec)};
}
function main(){
 const mode=process.argv[2];
 assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write | --check');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const source=physical(SOURCE_ROOT,SOURCE);
 assert.equal(source.length,SOURCE_PIN.bytes);assert.equal(sha(source),SOURCE_PIN.sha256);
 const rows=[[`${EXPORT}/source-export/export-receipt-v1.json`,receipt()]];
 for(const [name,bytes] of rows){
  const target=path.join(ROOT,name);
  if(mode==='--check')assert(fs.readFileSync(target).equals(bytes),`${name} drift`);
  else if(fs.existsSync(target))assert(fs.readFileSync(target).equals(bytes),`${name} drift`);
  else fs.writeFileSync(target,bytes,{flag:'wx'});
 }
 const built=buildP032Canvas();
 fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});
 for(const [name,bytes] of [[`${OUT}/canvas-renderer.js`,built.script],
  [`${OUT}/canvas-metadata-v1.json`,built.metadata],
  [`${OUT}/canvas-manifest-v2.json`,built.manifest],[`${OUT}/adapter-spec.json`,built.spec],
  [MEMBER,built.script]]){
  const target=path.join(ROOT,name);
  if(mode==='--check')assert(fs.readFileSync(target).equals(bytes),`${name} drift`);
  else if(fs.existsSync(target))assert(fs.readFileSync(target).equals(bytes),`${name} drift`);
  else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});}
 }
 console.log(JSON.stringify({status:mode==='--write'?'written':'verified',source:SOURCE_PIN,
  canvas:pin(`${OUT}/canvas-renderer.js`,built.script)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
