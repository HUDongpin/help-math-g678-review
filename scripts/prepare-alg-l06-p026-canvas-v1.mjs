#!/usr/bin/env node
/** Source-bound, deterministic Canvas drawing for the P026 physical SWF. */
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
const SOURCE='G6-G8-shared/ALG001/L6/VB/L6VB19.swf';
const SOURCE_PIN={path:SOURCE,bytes:114936,sha256:'a61e60f95dc597c7b0024e7f013abfade47e199ae911be77916d5b38c7828e0c'};
const ID='shared-alg001-l06-p026';
const OUT='output/alg-l06-p026-canvas-v1';
const EXPORT='output/alg-l06-p026-canvas-source-export-v1';
const BEHAVIOR='output/alg-l06-p026-behavior-ir-v1';
const HELPER=EXPORT+'/source-export/sprites/DefineSprite_55/canvas.js';
const CHILD=EXPORT+'/source-export/sprites/DefineSprite_55/frames.html';
const ROOT_FRAMES=EXPORT+'/source-export/frames/frames.html';
const TITLE=EXPORT+'/source-export/sprites/DefineSprite_2/frames.html';
const GLYPH_IDS=Object.freeze([6,12,15,17,20,23,26,27,28,30]);
const MASKS=Object.freeze([{frame:31,characterId:18,depth:15,clipDepth:24},
 {frame:81,characterId:18,depth:25,clipDepth:30}]);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:hash(bytes)});

function physical(base,relative){
 const file=path.resolve(base,relative);
 assert(file.startsWith(base+path.sep),'path outside source root');
 assert.equal(fs.realpathSync(file),file,'source must be physical');
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,'ordinary source file');
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],'source changed while reading: '+relative);
 return bytes;
}
function replaceOnce(source,needle,replacement,label){
 const at=source.indexOf(needle);
 assert(at>=0&&source.indexOf(needle,at+needle.length)<0,'unique '+label);
 return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function functionSource(source,name){
 const marker='function '+name+'(';
 const at=source.indexOf(marker),end=source.indexOf('\nfunction ',at+1);
 assert(at>=0&&end>at&&source.indexOf(marker,at+1)<0,'unique '+name);
 return source.slice(at,end).trimEnd();
}
function exportedFunctions(source){
 return [...new Set([...source.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
  .map(match=>match[1]))].sort();
}
function assertSourceExports(behavior,root,title,child,xml,receipt){
 assert.equal(behavior.identity.animationId,ID);
 assert.equal(behavior.source.swf.sha256,SOURCE_PIN.sha256);
 assert.equal(receipt.source.sha256,SOURCE_PIN.sha256);
 for(const entry of receipt.files){
  const bytes=physical(ROOT,entry.path);
  assert.equal(bytes.length,entry.bytes,'export byte count: '+entry.path);
  assert.equal(hash(bytes),entry.sha256,'export SHA-256: '+entry.path);
 }
 assert(root.includes('function sprite2(')&&root.includes('function sprite55('));
 assert(title.includes('function sprite2(')&&child.includes('function sprite55('));
 assert(xml.includes('<DefineSprite objectID="55" frames="389">'));
 assert(xml.includes('<DefineSprite objectID="2" frames="1">'));
 assert.deepEqual([...xml.matchAll(/<PlaceObject[23]\s+[^>]*objectID="18"[^>]*>/gu)]
  .map(match=>({depth:Number(match[0].match(/depth="(\d+)"/u)?.[1]),
   clipDepth:Number(match[0].match(/clipDepth="(\d+)"/u)?.[1])})),
  MASKS.map(({depth,clipDepth})=>({depth,clipDepth})));
 const rootMain=root.slice(root.indexOf('function main('));
 const six=rootMain.slice(rootMain.indexOf('case 5:'),rootMain.indexOf('case 6:'));
 const placements=six.split('\n').filter(line=>/place\("(?:sprite2|sprite55)"/u.test(line));
 assert.deepEqual(placements.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['sprite2','sprite55']);
 assert(placements[0].includes('[0.05,0.0,0.0,0.05,400.0,43.1]'));
 assert(placements[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
 assert.deepEqual(exportedFunctions(child).filter(name=>name.startsWith('text')),
  ['text12','text15','text17','text20','text23','text26','text27','text28','text30',
   'text32','text33','text34','text35','text36','text37','text38','text39','text40',
   'text41','text42','text44','text45','text46','text47','text48','text49','text50',
   'text52','text53','text54','text6']);
 return placements.map(line=>line.trim());
}

export function buildP026Canvas(){
 const source=physical(SOURCE_ROOT,SOURCE);
 assert.equal(source.length,SOURCE_PIN.bytes);assert.equal(hash(source),SOURCE_PIN.sha256);
 const behaviorBytes=physical(ROOT,BEHAVIOR+'/behavior-ir-v1.json');
 const xmlBytes=physical(ROOT,BEHAVIOR+'/source-structure.xml');
 const displayBytes=physical(ROOT,BEHAVIOR+'/source-display-list-v1.json');
 const receiptBytes=physical(ROOT,EXPORT+'/export-receipt-v1.json');
 const helperBytes=physical(ROOT,HELPER),childBytes=physical(ROOT,CHILD);
 const rootBytes=physical(ROOT,ROOT_FRAMES),titleBytes=physical(ROOT,TITLE);
 const behavior=JSON.parse(behaviorBytes),receipt=JSON.parse(receiptBytes);
 const xml=xmlBytes.toString(),root=rootBytes.toString().replace(/\r\n?/gu,'\n');
 const title=titleBytes.toString().replace(/\r\n?/gu,'\n');
 const child=childBytes.toString().replace(/\r\n?/gu,'\n');
 const rootPlacements=assertSourceExports(behavior,root,title,child,xml,receipt);
 const placed=exportedFunctions(child);
 const fonts=[...child.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)]
  .map(match=>match[1]);
 const images=[...child.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)]
  .map(match=>match[1]);
 assert.deepEqual(fonts,['font5']);assert.deepEqual(images,[]);
 assert.equal(placed.length,50);
 const spec={schemaVersion:1,animationId:'course-'+ID,finalAnimationId:ID,
  classification:'interactive-understood-unregistered-source-canvas-v1',
  source:{swf:'$HELP_MATH_G678_SOURCE_ROOT/'+SOURCE,swfSha256:SOURCE_PIN.sha256},
  evidence:{scenarioInventory:BEHAVIOR+'/behavior-ir-v1.json',
   scenarioInventorySha256:hash(behaviorBytes),audioAudit:BEHAVIOR+'/behavior-ir-v1.json',
   audioAuditSha256:hash(behaviorBytes),sourceXml:BEHAVIOR+'/source-structure.xml',
   sourceXmlSha256:hash(xmlBytes),sourceDisplayList:BEHAVIOR+'/source-display-list-v1.json',
   sourceDisplayListSha256:hash(displayBytes)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:HELPER,helperSha256:hash(helperBytes),framesHtml:CHILD,
   framesHtmlSha256:hash(childBytes),targetSpriteObjectId:55,
   targetSpriteFunction:'sprite55',exportCanvas:{width:843,height:405},
   exportInternalTranslation:{x:530.2,y:202.5},
   expectedPlacedFunctionCount:placed.length,
   expectedPlacedFunctionsSha256:hash(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,
   expectedFontFunctionsSha256:hash(JSON.stringify(fonts)),
   embeddedImageVariableCount:0,embeddedImageVariablesSha256:hash(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:5666},
    placementPixels:{x:412.4,y:283.3}},
   local:{timelineId:'sprite-55',frameCount:389,livePlaybackEndFrame:389,
    playbackMode:'once',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:{x:412.4-530.2,y:283.3-202.5}},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English-visuals; es requires explicit source-English fallback',
   seedMapping:'fixed-zero; no source randomness executed',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Seven AVM1 glossary buttons require maintained host controls and per-instance source geometry.',
    'Two embedded MP3 runs and independent SA require separate player controls.',
    'Source-English visual fallback for es is not an authored translation.',
    'Original runtime, visual fidelity, listening and human/Owner gates remain open.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',
   spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helperBytes.toString(),framesHtml:child,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,[{characterId:18,
  placements:[{depth:15,clipDepth:24},{depth:25,clipDepth:30}],
  rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));'}],xml);
 runtime=replaceOnce(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n'
   +'        throw new Error("seed must be fixed zero for this source frame");\n    }',
  'fixed source seed');
 runtime=runtime.replaceAll('course-'+ID,ID);
 assert(runtime.includes('registry["'+ID+'"]')&&!runtime.includes('course-'+ID));
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  '\n'+functionSource(root,'shape1')+'\n\n'+functionSource(root,'sprite2')
   +'\n\nSAFE_OBJECTS = Object.freeze({','root title definitions');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n        "sprite2": sprite2,\n',
  'root title objects');
 const oldDraw='ctx.transform(1, 0, 0, 1, '+spec.timeline.stageRenderOffset.x
  +', '+spec.timeline.stageRenderOffset.y+');\n'
  +'        sprite55(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 const newDraw='var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
  +'        var time = state.exportFrame;\n        '+rootPlacements[0]+'\n        '
  +oldDraw;
 runtime=replaceOnce(runtime,oldDraw,newDraw,'root title before child');
 // A fresh offscreen plane prevents FFDec transforms/clips from leaking across seeks.
 runtime=replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
  '    var drawingCanvas = document.createElement("canvas");\n'
   +'    drawingCanvas.width = 800;\n    drawingCanvas.height = 600;\n'
   +'    var ctx = drawingCanvas.getContext("2d");','isolated source canvas');
 runtime=replaceOnce(runtime,'    canvas = targetCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
  '    canvas = drawingCanvas;\n    ctx.setTransform(1, 0, 0, 1, 0, 0);',
  'isolated drawing context');
 runtime=replaceOnce(runtime,
  '        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
  '        canvas = previousCanvas;\n    }\n'
   +'    var targetCtx = targetCanvas.getContext("2d");\n'
   +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
   +'    targetCtx.save();\n'
   +'    try {\n'
   +'        targetCtx.setTransform(1,0,0,1,0,0);\n'
   +'        targetCtx.clearRect(0,0,800,600);\n'
   +'        targetCtx.drawImage(drawingCanvas, 0, 0);\n'
   +'    } finally { targetCtx.restore(); }\n'
   +'    if (typeof targetCanvas.setAttribute === "function") {',
  'copy isolated frame to host');
 runtime=replaceOnce(runtime,'var SAFE_OBJECTS = null;',
  'var SAFE_OBJECTS = null;\nvar ACTIVE_TEXT_SUPPRESSION = null;','scoped glyph state');
 runtime=replaceOnce(runtime,'var readyPromise = null;',
  'var P026_METADATA = deepFreeze(Object.assign({}, METADATA, {sourceGlyphRendering:{\n'
   +' auditedStaticTextIds:[6,12,15,17,20,23,26,27,28,30],\n'
   +' suppressTextIdsSupported:true,unownedSourceTextFallback:true,\n'
   +' dynamicSuppressionSupported:false}}));\nvar readyPromise = null;',
  'audited static text metadata');
 for(const id of GLYPH_IDS){
  const name='text'+id;
  runtime=replaceOnce(runtime,'"'+name+'": '+name,
   '"'+name+'": function(ctx,ctrans,frame,ratio,time) {'
   +' if (!ACTIVE_TEXT_SUPPRESSION || !ACTIVE_TEXT_SUPPRESSION.has('+id+'))'
   +' '+name+'(ctx,ctrans,frame,ratio,time); }','source text '+id);
 }
 const resolution='\nfunction resolveP026State(request) {\n'
  +'    var state=resolveFrameState(request);\n'
  +'    var requested=request.suppressSourceTextIds===undefined?[]:request.suppressSourceTextIds;\n'
  +'    if (!Array.isArray(requested)) throw new Error("P026 suppression must be an array");\n'
  +'    var previous=0;\n'
  +'    requested.forEach(function(id) {\n'
  +'        if (!Number.isSafeInteger(id) || id<=previous || '
  +'[6,12,15,17,20,23,26,27,28,30].indexOf(id)<0)\n'
  +'            throw new Error("P026 suppression outside audited static text IDs");\n'
  +'        previous=id;\n'
  +'    });\n'
  +'    return Object.freeze(Object.assign({},state,{suppressedSourceTextIds:'
  +'Object.freeze(requested.slice())}));\n'
  +'}\n';
 runtime=replaceOnce(runtime,'\nfunction render(targetCanvas, request) {',
  resolution+'\nfunction render(targetCanvas, request) {',
  'suppression-aware frame state');
 runtime=replaceOnce(runtime,'    var state = resolveFrameState(request);',
  '    var state = resolveP026State(request);\n'
   +'    var requestedSuppression = state.suppressedSourceTextIds;\n'
   +'    var previousTextSuppression = ACTIVE_TEXT_SUPPRESSION;',
  'validate per-frame native ownership request');
 runtime=replaceOnce(runtime,'    var previousCanvas = canvas;',
  '    var previousCanvas = canvas;\n'
   +'    ACTIVE_TEXT_SUPPRESSION = new Set(requestedSuppression);',
  'activate per-frame suppression after context validation');
 runtime=replaceOnce(runtime,'        canvas = previousCanvas;\n    }\n'
   +'    var targetCtx = targetCanvas.getContext("2d");',
  '        canvas = previousCanvas;\n'
   +'        ACTIVE_TEXT_SUPPRESSION = previousTextSuppression;\n    }\n'
   +'    var targetCtx = targetCanvas.getContext("2d");',
  'reset scoped glyph state');
 runtime=replaceOnce(runtime,'metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState',
  'metadata: P026_METADATA, ready: ready, resolveFrameState: resolveP026State',
  'published text suppression contract');
 new Script(runtime,{filename:'canvas-renderer.js'});
 const script=Buffer.from(runtime);
 const glyphs={sourceCharacterIds:[6,12,15,17,20,23,26,27,28,30,
  32,33,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,52,53,54],
  auditedStaticTextIds:[...GLYPH_IDS],suppressibleCharacterIds:[...GLYPH_IDS],
  suppressTextIdsSupported:true,animatedLetterSequenceIds:
  [32,33,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,52,53,54],
  default:'preserve-all',suppression:'explicit-per-frame-request-only',
  nativeBinding:'every-instance-must-be-owned-before-suppression',
  canvasAriaHiddenByHost:true};
 const sourceDepthOrder=[{depth:1,characterId:2,x:400,y:43.1},
  {depth:3,characterId:55,x:412.4,y:283.3}];
 const metadata=json({animationId:ID,sourceSwfSha256:SOURCE_PIN.sha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,rootFrameCount:10,
  frameDomain:'sprite-55',frameCount:389,scenario:'source-static-frame',
  visualLocalization:'source-en-fallback',sourceDepthOrder,sourceClipMasks:MASKS,
  sourceGlyphRendering:glyphs,stageRenderOffset:spec.timeline.stageRenderOffset,
  assetPath:'/flash-assets/g678-local/'+ID+'/canvas-renderer.js',
  assetSha256:hash(script)});
 const inputs=[['behaviorIr',BEHAVIOR+'/behavior-ir-v1.json'],
  ['displayList',BEHAVIOR+'/source-display-list-v1.json'],
  ['sourceXml',BEHAVIOR+'/source-structure.xml'],
  ['sourceExportReceipt',EXPORT+'/export-receipt-v1.json'],
  ['helper',HELPER],['childFrames',CHILD],['rootFrames',ROOT_FRAMES],
  ['titleFrames',TITLE],
  ['generator','scripts/prepare-alg-l06-p026-canvas-v1.mjs'],
  ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
  ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs']]
  .map(([key,name])=>({key,...pin(name,physical(ROOT,name))}));
 const manifest=json({schemaVersion:1,kind:'alg-l06-p026-maintained-canvas-v1',
  animationId:ID,status:'unregistered-drawing-candidate',source:SOURCE_PIN,
  rootFrame:6,rootFrameCount:10,mainFrameCount:389,stage:{width:800,height:600},
  sourceDepthOrder,sourceGlyphRendering:glyphs,sourceClipMasks:MASKS,
  sourceMaskNormalization:{normalizedSolidShapes:[18],
   originalRuntimeComparisonPending:true},
  inputs,outputs:[pin(OUT+'/canvas-renderer.js',script),
   pin(OUT+'/canvas-metadata-v1.json',metadata)],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 return {script,metadata,manifest,spec:json(spec)};
}
function main(){
 const mode=process.argv[2];
 assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write | --check');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const built=buildP026Canvas();
 fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});
 for(const [name,bytes] of [[OUT+'/canvas-renderer.js',built.script],
  [OUT+'/canvas-metadata-v1.json',built.metadata],
  [OUT+'/canvas-manifest.json',built.manifest],
  [OUT+'/adapter-spec.json',built.spec]]){
  const target=path.join(ROOT,name);
  if(mode==='--check')assert(fs.readFileSync(target).equals(bytes),name+' drift');
  else if(fs.existsSync(target))assert(fs.readFileSync(target).equals(bytes),name+' drift');
  else fs.writeFileSync(target,bytes,{flag:'wx'});
 }
 console.log(JSON.stringify({status:mode==='--write'?'written':'verified',
  source:SOURCE_PIN,canvas:pin(OUT+'/canvas-renderer.js',built.script)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
