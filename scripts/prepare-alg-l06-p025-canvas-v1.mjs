#!/usr/bin/env node
/** Reproducible public-tool Canvas front end for the physical P025 SWF. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/VB/L6VB18.swf';
const SWF_PIN={path:SOURCE,bytes:102660,sha256:'dcb6b709d71eada47053b50bcfcc1161dec5d1717ebca6cbf8463eb6863dbde6'};
const OUT='output/alg-l06-p025-canvas-v1';
const XML=`${OUT}/source.xml`,EXPORT=`${OUT}/source-export`;
const RECEIPT=`${OUT}/source-export-receipt.json`;
const SOURCE_AUDIT='output/alg-l06-p025-source-audit-v1/source-audit-v1.json';
const GEOMETRY='output/alg-l06-p025-text-geometry-v1/text-geometry-v1.json';
const PINNED_XML_SHA='66675e3889f6eafa999778ed8c3cdffdf2b9944cb30d26ee34e6db388002314a';
const PINNED_SOURCE_AUDIT_SHA='7cf5100ab451b501b069b9d8e39e1758410a20e2febbb94d46f585bba50aa8fe';
const PINNED_GEOMETRY_SHA='5e9a99748222d8e32cd65ca27501f69094ffffbb04c932a4a158c62435f8ec9d';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
function replaceOnce(source,needle,replacement,label){
 const at=source.indexOf(needle);
 assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
 return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function functionSource(source,name){
 const at=source.indexOf(`function ${name}(`),end=source.indexOf('\nfunction ',at+1);
 assert(at>=0&&end>at&&source.indexOf(`function ${name}(`,at+1)<0,`unique ${name}`);
 return source.slice(at,end).trimEnd();
}
function physical(base,relative){
 const file=path.resolve(base,relative);
 assert(file.startsWith(`${base}${path.sep}`)&&fs.realpathSync(file)===file,`physical ${relative}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${relative}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${relative}:${key}`);
 return bytes;
}
function files(directory){
 return fs.readdirSync(path.join(ROOT,directory),{withFileTypes:true})
  .sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(entry=>{
   assert(!entry.isSymbolicLink(),'export symlink');
   const name=`${directory}/${entry.name}`;
   return entry.isDirectory()?files(name):[pin(name,physical(ROOT,name))];
  });
}
function tools(){
 const ffdec=execFileSync('ffdec',['-help','export'],{encoding:'utf8',maxBuffer:2e6});
 assert(ffdec.includes('v.26.2.1')&&ffdec.includes('sprite:canvas'),'FFDec 26.2.1 Canvas');
 const mill=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(mill.status,0);assert(`${mill.stdout}${mill.stderr}`.includes('swfmill 0.3.6'));
 return {ffdec:'JPEXS Free Flash Decompiler v.26.2.1',swfmill:'swfmill 0.3.6'};
}
function exportMissing(){
 const source=path.join(SOURCE_ROOT,SOURCE),xml=path.join(ROOT,XML),canvas=path.join(ROOT,EXPORT);
 fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});
 if(!fs.existsSync(xml))execFileSync('swfmill',['-n','swf2xml',source,xml],{maxBuffer:2e6});
 if(!fs.existsSync(canvas)){
  fs.mkdirSync(canvas,{recursive:true});
  execFileSync('ffdec',['-config','packJavaScripts=false','-onerror','abort',
   '-format','frame:canvas,sprite:canvas','-export','frame,sprite',canvas,source],
   {maxBuffer:2e6});
 }
}
export function sourceExportReceipt(){
 const xml=physical(ROOT,XML),priorXml=physical(ROOT,
  'output/alg-l06-p025-source-audit-v1/source.xml');
 assert.equal(sha(xml),PINNED_XML_SHA);assert(xml.equals(priorXml),'source XML byte parity');
 assert(xml.toString().includes('<DefineSprite objectID="21" frames="299">'));
 const drawing=files(EXPORT);
 assert.deepEqual(drawing.map(row=>row.path),[
  `${EXPORT}/frames/canvas.js`,`${EXPORT}/frames/frames.html`,
  `${EXPORT}/sprites/DefineSprite_21/canvas.js`,
  `${EXPORT}/sprites/DefineSprite_21/frames.html`]);
 const sourceAudit=physical(ROOT,SOURCE_AUDIT),geometry=physical(ROOT,GEOMETRY);
 assert.equal(sha(sourceAudit),PINNED_SOURCE_AUDIT_SHA);
 assert.equal(sha(geometry),PINNED_GEOMETRY_SHA);
 return {schemaVersion:1,kind:'alg-l06-p025-physical-canvas-export-v1',
  animationId:'shared-alg001-l06-p025',source:{...SWF_PIN,root:SOURCE_ROOT},
  sourceAudit:pin(SOURCE_AUDIT,sourceAudit),geometry:pin(GEOMETRY,geometry),
  tools:tools(),commands:[
   ['swfmill','-n','swf2xml',`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,XML],
   ['ffdec','-config','packJavaScripts=false','-onerror','abort','-format',
    'frame:canvas,sprite:canvas','-export','frame,sprite',EXPORT,
    `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`]],
  files:[pin(XML,xml),...drawing],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}};
}
export function buildP025Canvas(){
 const sourceAuditBytes=physical(ROOT,SOURCE_AUDIT),geometryBytes=physical(ROOT,GEOMETRY);
 const sourceAudit=JSON.parse(sourceAuditBytes),geometry=JSON.parse(geometryBytes);
 const xml=physical(ROOT,XML).toString();
 const helperName=`${EXPORT}/sprites/DefineSprite_21/canvas.js`;
 const framesName=`${EXPORT}/sprites/DefineSprite_21/frames.html`;
 const rootName=`${EXPORT}/frames/frames.html`;
 const helper=physical(ROOT,helperName),frames=physical(ROOT,framesName).toString();
 const root=physical(ROOT,rootName).toString().replace(/\r\n?/gu,'\n');
 assert.equal(sourceAudit.animationId,'shared-alg001-l06-p025');
 assert.equal(sourceAudit.source.swf.sha256,SWF_PIN.sha256);
 assert.equal(geometry.source.sha256,SWF_PIN.sha256);
 assert.deepEqual(sourceAudit.runtime.domains.map(d=>[d.domain,d.declaredFrames,d.observedShowFrames]),
  [['root',10,10],['sprite-21',299,299]]);
 assert.deepEqual(sourceAudit.runtime.masks.map(m=>[m.frame,m.characterId,m.depth,m.clipDepth]),
  [[2,2,1,10],[52,2,11,16]]);
 assert.deepEqual(sourceAudit.runtime.buttonActions.map(b=>[b.characterId,b.key,b.placementFrame]),
  [[7,'Independent variable',2],[8,'Function',2],[9,'Input variable',2],[16,'Domain',52]]);
 assert.deepEqual(geometry.glossary.map(g=>[g.key,g.firstSourceReadyFrame]),
  [['Independent variable',28],['Function',50],['Input variable',41],['Domain',295]]);
 assert.deepEqual(sourceAudit.runtime.textDefinitions.map(t=>t.characterId),
  [5,10,11,12,13,15,18,20]);
 const placed=[...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)]
  .map(match=>match[1]))].sort();
 const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)]
  .map(match=>match[1]);
 assert.equal(placed.length,17);
 assert.equal(sha(JSON.stringify(placed)),'d79dec712895525e5c4bb72141f7d73b4d28977216f789a6e497aef37f211279');
 assert.deepEqual(fonts,['font4']);
 assert.equal([...frames.matchAll(/var img\d+ = /gu)].length,0);
 assert(xml.includes('<DefineSprite objectID="21" frames="299">'));
 assert(xml.includes('<PlaceObject2 replace="0" depth="2" objectID="21" morph="5" name="animation">'));
 const rootBlock=root.slice(root.indexOf('function main('));
 const rootFrameSix=rootBlock.slice(rootBlock.indexOf('case 5:'),rootBlock.indexOf('case 6:'));
 const rootLines=rootFrameSix.split('\n').filter(line=>/place\("(?:shape1|sprite21)"/u.test(line));
 assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),
  ['shape1','sprite21']);
 assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
 assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
 const ID='shared-alg001-l06-p025';
 const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
  classification:'interactive-understood-unregistered-source-canvas-v1',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,swfSha256:SWF_PIN.sha256},
  evidence:{scenarioInventory:SOURCE_AUDIT,scenarioInventorySha256:sha(sourceAuditBytes),
   audioAudit:SOURCE_AUDIT,audioAuditSha256:sha(sourceAuditBytes),
   sourceAudit:SOURCE_AUDIT,sourceAuditSha256:sha(sourceAuditBytes),
   textGeometry:GEOMETRY,textGeometrySha256:sha(geometryBytes),
   sourceXml:XML,sourceXmlSha256:sha(Buffer.from(xml))},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:helperName,helperSha256:sha(helper),framesHtml:framesName,
   framesHtmlSha256:sha(Buffer.from(frames)),targetSpriteObjectId:21,
   targetSpriteFunction:'sprite21',exportCanvas:{width:772,height:393},
   exportInternalTranslation:{x:542.35,y:204.1},
   expectedPlacedFunctionCount:placed.length,
   expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,
   expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:0,embeddedImageVariablesSha256:sha(JSON.stringify([]))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:5666},
    placementPixels:{x:412.4,y:283.3}},
   local:{timelineId:'sprite-21',frameCount:299,livePlaybackEndFrame:299,
    playbackMode:'once',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:{x:412.4-542.35,y:283.3-204.1}},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English-visuals; es requires explicit source-English fallback',
   seedMapping:'fixed-zero; no source randomness executed',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Four AVM1 glossary buttons require maintained host controls and source-geometry gates.',
    'Embedded English stream and independent physical SA require separate explicit player controls.',
    'Source-English visual fallback for es is not an authored translation.',
    'Original runtime, visual fidelity, listening and human/Owner gates remain open.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',
   spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helper.toString(),framesHtml:frames,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,[{characterId:2,
  placements:[{depth:1,clipDepth:10},{depth:11,clipDepth:16}],
  rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'}],xml);
 runtime=replaceOnce(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n'
  +'        throw new Error("seed must be fixed zero for this source frame");\n    }',
  'fixed source seed');
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${functionSource(root,'shape1')}\n\nSAFE_OBJECTS = Object.freeze({`,'root background shape');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n','root depth-1 object');
 const oldDraw=`ctx.transform(1, 0, 0, 1, ${spec.timeline.stageRenderOffset.x}, ${spec.timeline.stageRenderOffset.y});\n`
  +'        sprite21(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 const rootBefore='var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
  +`        var time = state.exportFrame;\n        ${rootLines[0].trim()}\n        `;
 runtime=replaceOnce(runtime,oldDraw,rootBefore+oldDraw,'root depth-1 artwork');
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
  +'    targetCanvas.width = 800;\n'
  +'    var targetCtx = targetCanvas.getContext("2d");\n'
  +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
  +'    targetCtx.drawImage(drawingCanvas, 0, 0);\n'
  +'    if (typeof targetCanvas.setAttribute === "function") {',
  'copy isolated frame to host');
 new Script(runtime);
 const script=Buffer.from(runtime);
 const sourceGlossaryButtons=sourceAudit.runtime.buttonActions.map(button=>({
  characterId:button.characterId,keyAttribute:button.key,
  placements:[{frame:button.placementFrame,depth:button.depth}],
  staticReadyFrame:geometry.glossary.find(g=>g.buttonId===button.characterId).firstSourceReadyFrame,
  actualClickObserved:false}));
 const sourceClipMasks=sourceAudit.runtime.masks;
 const glyphs={definitions:8,dynamicFields:0,preserved:true,suppression:'none',
  nativeBinding:'source-geometry-companion-only',canvasAriaHiddenByHost:true,
  sourceCharacterIds:[5,10,11,12,13,15,18,20],
  primaryDefinitionFullInkFrame:50,secondDefinitionFullInkFrame:295};
 const metadata=json({animationId:ID,sourceSwfSha256:SWF_PIN.sha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,frameDomain:'sprite-21',
  frameCount:299,scenario:'source-static-frame',visualLocalization:'source-en-fallback',
  sourceDepthOrder:[{depth:1,characterId:1},{depth:2,characterId:21}],
  sourceGlyphRendering:glyphs,sourceClipMasks,
  sourceGlossaryButtons,stageRenderOffset:spec.timeline.stageRenderOffset,
  assetPath:`/flash-assets/g678-local/${ID}/canvas-renderer.js`,assetSha256:sha(script)});
 const receiptBytes=physical(ROOT,RECEIPT);
 const inputs=[['sourceAudit',SOURCE_AUDIT],['textGeometry',GEOMETRY],['sourceXml',XML],
  ['sourceExport',RECEIPT],['helper',helperName],['frames',framesName],
  ['rootFrames',rootName],['generator','scripts/prepare-alg-l06-p025-canvas-v1.mjs'],
  ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
  ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs']]
  .map(([key,name])=>({key,...pin(name,physical(ROOT,name))}));
 const manifest=json({schemaVersion:1,kind:'alg-l06-p025-maintained-canvas-v1',
  animationId:ID,status:'unregistered-drawing-candidate',source:SWF_PIN,
  rootFrame:6,mainFrameCount:299,stage:{width:800,height:600},
  sourceDepthOrder:[{depth:1,characterId:1},{depth:2,characterId:21}],
  sourceGlyphRendering:glyphs,sourceClipMasks,
  sourceMaskNormalization:{normalizedSolidShapes:[2],originalRuntimeComparisonPending:true},
  sourceGlossaryButtons,inputs,
  outputs:[pin(`${OUT}/canvas-renderer.js`,script),
   pin(`${OUT}/canvas-metadata-v1.json`,metadata)],
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
 assert.equal(source.length,SWF_PIN.bytes);assert.equal(sha(source),SWF_PIN.sha256);
 if(mode==='--write')exportMissing();
 const receipt=json(sourceExportReceipt()),target=path.join(ROOT,RECEIPT);
 if(mode==='--check')assert(fs.readFileSync(target).equals(receipt),'export receipt drift');
 else if(fs.existsSync(target))assert(fs.readFileSync(target).equals(receipt),'export receipt drift');
 else fs.writeFileSync(target,receipt,{flag:'wx'});
 const built=buildP025Canvas();
 for(const [name,bytes] of [
  [`${OUT}/canvas-renderer.js`,built.script],
  [`${OUT}/canvas-metadata-v1.json`,built.metadata],
  [`${OUT}/canvas-manifest.json`,built.manifest],
  [`${OUT}/adapter-spec.json`,built.spec]]){
  const file=path.join(ROOT,name);
  if(mode==='--check')assert(fs.readFileSync(file).equals(bytes),`${name} drift`);
  else if(fs.existsSync(file))assert(fs.readFileSync(file).equals(bytes),`${name} drift`);
  else fs.writeFileSync(file,bytes,{flag:'wx'});
 }
 console.log(JSON.stringify({status:mode==='--write'?'written':'verified',
  source:SWF_PIN,receipt:pin(RECEIPT,receipt),
  canvas:pin(`${OUT}/canvas-renderer.js`,built.script)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
