#!/usr/bin/env node
/** Regenerate the exact P038 raw FFDec Canvas cache from canonical source evidence. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const CACHE='work/g678-shared-page-factory/alg-l06-p038-maintained-canvas-v1-20261001-v1';
const OUTDIR=path.join(ROOT,CACHE);
const ID='shared-alg001-l06-p038';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN10.swf';
const SOURCE_SHA='bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de';
const FACTS='output/alg-l06-p038-source-triage-20261001-v1/source-facts-v1.json';
const XML='output/alg-l06-p038-source-triage-20261001-v1/swfmill.xml';
const NATIVE='output/alg-l06-p038-native-source-preparation-20261001-v1/native-model-v1.json';
const AUDIO='output/alg-l06-p038-audio-source-preparation-20261001-v1/source-audio-plan-v1.json';
const EXPORT='output/alg-l06-p038-canvas-source-preparation-20261001-v1';
const RECEIPT=`${EXPORT}/canvas-source-export-v1.json`;
const FRAMES=`${EXPORT}/source-canvas-export/sprites/DefineSprite_67/frames.html`;
const ROOT_FRAMES=`${EXPORT}/source-canvas-export/frames/frames.html`;
const HELPER=`${EXPORT}/source-canvas-export/sprites/DefineSprite_67/canvas.js`;
const ADAPTER='scripts/build-safe-ffdec-canvas-adapter.mjs';
const EXPECTED=Object.freeze({
 facts:'e6df1089aaa9274d1eb3b9771d39e5e3d8cf54c6761050eff0acc00fa9a3f04e',
 xml:'95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14',
 native:'5fe165f369a84e7e08a0b4fbf6de921c40e9cd4f5367a647c9fc70186d26e13f',
 audio:'75d034131968fa5800de49b77dd0d791281e81ec233b98ae0ede75597228a9f0',
 receipt:'0e8706ca5d41473cf943b463b478f06c11c9aa20f8ff2b90d116549128f29332'
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function physical(name){
 const aliases=[
  ['output/alg-l06-p038-source-triage-20261001-v1/',
   'migrations/shared-alg001-l06-p038/audit/source-v1/'],
  ['output/alg-l06-p038-native-source-preparation-20261001-v1/',
   'migrations/shared-alg001-l06-p038/native-v1/'],
  ['output/alg-l06-p038-audio-source-preparation-20261001-v1/',
   'migrations/shared-alg001-l06-p038/audio-source-v1/'],
  ['output/alg-l06-p038-canvas-source-preparation-20261001-v1/',
   `${CACHE}/`],
 ];
 const actual=path.isAbsolute(name)?name:
  aliases.reduce((value,[oldPrefix,newPrefix])=>
   value===name&&name.startsWith(oldPrefix)?newPrefix+name.slice(oldPrefix.length):value,name);
 assert(!name.startsWith('output/')||actual!==name,`unmapped dated provenance label: ${name}`);
 const file=path.isAbsolute(actual)?actual:path.resolve(ROOT,actual);
 assert(file===SOURCE||file.startsWith(ROOT+path.sep),`scope ${name}`);
 assert(fs.realpathSync(file)===file,`physical ${name}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${name}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${name}:${key}`);
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
function overlap(a,b){
 return Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*
  Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
}
function labelGuard(native){
 const protectedIds=new Set();
 for(const button of native.buttonBindings)
  for(const instance of native.instances){
   if(instance.kind!=='text')continue;
   for(const run of instance.runs){
    if(run.lastFrame<button.startFrame||run.firstFrame>button.lastSourceFrame)continue;
    if(overlap(run.sourceStageBoxPx,button.sourceStageHitBoxAtStartPx)>0)
     protectedIds.add(instance.objectId);
   }
  }
 const protectedTextIds=[...protectedIds].sort((a,b)=>a-b);
 assert.deepEqual(protectedTextIds,[47,51,56,59,63,65],
  'source button overlapping text ownership changed');
 const allTextIds=Object.keys(native.textDefinitions).map(Number).sort((a,b)=>a-b);
 const eligibleTextIds=allTextIds.filter(id=>!protectedIds.has(id));
 assert.equal(allTextIds.length,38);assert.equal(eligibleTextIds.length,32);
 return {protectedTextIds,eligibleTextIds};
}
function build(){
 const sourceBytes=physical(SOURCE),factsBytes=physical(FACTS),xmlBytes=physical(XML),
  nativeBytes=physical(NATIVE),audioBytes=physical(AUDIO),receiptBytes=physical(RECEIPT),
  helperBytes=physical(HELPER),framesBytes=physical(FRAMES),
  rootFramesBytes=physical(ROOT_FRAMES),adapterBytes=physical(ADAPTER);
 assert.equal(sourceBytes.length,125928);assert.equal(sha(sourceBytes),SOURCE_SHA);
 for(const [label,bytes] of [['facts',factsBytes],['xml',xmlBytes],['native',nativeBytes],
  ['audio',audioBytes],['receipt',receiptBytes]])assert.equal(sha(bytes),EXPECTED[label],label);
 const facts=JSON.parse(factsBytes),native=JSON.parse(nativeBytes),audio=JSON.parse(audioBytes),
  receipt=JSON.parse(receiptBytes);
 assert.equal(facts.animationId,ID);assert.equal(native.animationId,ID);
 assert.equal(audio.animationId,ID);assert.equal(receipt.animationId,ID);
 assert.equal(receipt.physicalSource.sha256,SOURCE_SHA);
 assert.equal(receipt.rawCanvasFiles['sprites/DefineSprite_67/frames.html'].sha256,sha(framesBytes));
 assert.equal(receipt.rawCanvasFiles['sprites/DefineSprite_67/canvas.js'].sha256,sha(helperBytes));
 assert.equal(receipt.rawCanvasFiles['frames/frames.html'].sha256,sha(rootFramesBytes));
 assert.equal(facts.binary.spriteFrames,409);assert.equal(native.frameCount,409);
 assert.equal(native.clipMaskPlacements.length,10);
 const {protectedTextIds,eligibleTextIds}=labelGuard(native);
 const frames=framesBytes.toString().replace(/\r\n?/gu,'\n');
 const rootFrames=rootFramesBytes.toString().replace(/\r\n?/gu,'\n');
 const placed=receipt.child.placedFunctions;
 assert.equal(sha(JSON.stringify(placed)),receipt.child.placedFunctionsSha256);
 const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
 assert.deepEqual(fonts,['font4','font7']);
 const images=[...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)].map(m=>m[1]);
 assert.deepEqual(images,[]);
 const childHeader=frames.match(/function sprite67\(ctx,ctrans,frame,ratio,time\)\{\s*ctx\.save\(\);\s*ctx\.transform\(1,0,0,1,([^,]+),([^\)]+)\);/u);
 assert(childHeader);assert.deepEqual(childHeader.slice(1).map(Number),[522.75,229.35]);
 assert(rootFrames.includes('var ctrans = new cxform(0,0,0,0,255,255,255,255);'),'source root identity color transform');
 const rootEntry=sourceFunction(rootFrames,'main');
 const rootLines=rootEntry.split('\n').filter(line=>/place\("(?:shape1|sprite67)"/u.test(line)).map(line=>line.trim());
 assert.deepEqual(rootLines.slice(0,2).map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['shape1','sprite67']);
 assert.equal(rootLines[1],
  'place("sprite67",canvas,ctx,[0.05,0.0,0.0,0.05,412.4,323.3],ctrans,1,(0+time)%409,5,time);');
 const stageOffset={x:-110.35,y:93.95};
 const spec={schemaVersion:1,animationId:`course-${ID}`,
  classification:'interactive-understood-unregistered-source-canvas-draft-v1',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/IN/L6IN10.swf`,
   swfSha256:SOURCE_SHA},
  evidence:{scenarioInventory:FACTS,scenarioInventorySha256:sha(factsBytes),
   audioAudit:AUDIO,audioAuditSha256:sha(audioBytes),
   sourceXml:XML,sourceXmlSha256:sha(xmlBytes),nativeSourceContract:NATIVE,
   nativeSourceContractSha256:sha(nativeBytes)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:HELPER,helperSha256:sha(helperBytes),framesHtml:FRAMES,
   framesHtmlSha256:sha(framesBytes),targetSpriteObjectId:67,
   targetSpriteFunction:'sprite67',exportCanvas:{width:865,height:373},
   exportInternalTranslation:{x:522.75,y:229.35},
   expectedPlacedFunctionCount:placed.length,
   expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,
   expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:0,
   embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:13,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:6466},
    placementPixels:{x:412.4,y:323.3}},
   local:{timelineId:'sprite-67',frameCount:409,playbackMode:'state-explorer',
    publicFrameIndexing:'one-indexed'},stageRenderOffset:stageOffset},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English-only until a separate language disposition',
   seedMapping:'fixed zero; source AVM1 is not executed',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Ten source clipDepth masks and FFDec-to-native visual alignment are uncalibrated.',
    'Seven hit-only source buttons require native visible-label and host DoHyperLinks integration.',
    'Main stream audio, optional separate SA, Replay and old-host outcomes are unverified.']},
  output:{script:'canvas-renderer-draft.js',manifest:'canvas-manifest-v1.json',
   spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helperBytes.toString(),framesHtml:frames,spec}).runtime;
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${sourceFunction(rootFrames,'shape1')}\n\nSAFE_OBJECTS = Object.freeze({`,'source root background');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n','root shape registry');
 const oldDraw='ctx.transform(1, 0, 0, 1, -110.35, 93.95);\n'
  +'        sprite67(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 runtime=replaceOnce(runtime,oldDraw,
  `var time = state.exportFrame;\n        var ctrans = new cxform(0,0,0,0,255,255,255,255);\n        ${rootLines[0]}\n        `+oldDraw,
  'source root background before sprite');
 // Text suppression is opt-in and excludes every text object under a source button hit box.
 runtime=replaceOnce(runtime,'var readyPromise = null;',
  'var P038_SUPPRESS_TEXT_IDS = null;\nvar readyPromise = null;',
  'scoped source text suppression declaration');
 for(const id of eligibleTextIds){
  runtime=replaceOnce(runtime,`"text${id}": text${id}`,
   `"text${id}": function(ctx,ctrans,frame,ratio,time){ if (!P038_SUPPRESS_TEXT_IDS || P038_SUPPRESS_TEXT_IDS.indexOf(${id}) < 0) text${id}(ctx,ctrans,frame,ratio,time); }`,
   `optional source text ${id}`);
 }
 for(const id of protectedTextIds)
  assert(runtime.includes(`"text${id}": text${id}`),`protected button label text ${id}`);
 for(const id of [49,52,53,57,60,64,66])
  assert(runtime.includes(`"button${id}": button${id}`),`source hit-only button ${id}`);
 const suppressionValidation=`    var requestedSuppression = request.suppressSourceGlyphTextIds === undefined ? [] : request.suppressSourceGlyphTextIds;\n`
  +`    var eligibleTextIds = ${JSON.stringify(eligibleTextIds)};\n`
  +'    if (!Array.isArray(requestedSuppression) || requestedSuppression.some(function(id,index){\n'
  +'        return !Number.isSafeInteger(id) || eligibleTextIds.indexOf(id) < 0 || requestedSuppression.indexOf(id) !== index;\n'
  +'    })) throw new Error("suppression must be a unique allowlisted source text ID array; button labels are protected");\n'
  +'    var suppressedTextIds = Object.freeze(requestedSuppression.slice());\n';
 runtime=replaceOnce(runtime,'    return Object.freeze({\n        frameDomain:',
  suppressionValidation+'    return Object.freeze({\n        frameDomain:',
  'fail-closed source text suppression request');
 runtime=replaceOnce(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n'
   +'        throw new Error("seed must be fixed zero for this source frame");\n    }',
  'fixed source seed');
 runtime=replaceOnce(runtime,'        audioRendered: false\n    });',
  '        audioRendered: false,\n        suppressedSourceTextIds: suppressedTextIds\n    });',
  'source text state readback');
 runtime=replaceOnce(runtime,'    var previousCanvas = canvas;',
  '    var previousCanvas = canvas;\n    var previousSuppression = P038_SUPPRESS_TEXT_IDS;',
  'scoped text draw owner');
 runtime=replaceOnce(runtime,'    canvas = targetCanvas;',
  '    canvas = targetCanvas;\n    P038_SUPPRESS_TEXT_IDS = state.suppressedSourceTextIds;',
  'source text draw request');
 runtime=replaceOnce(runtime,'        canvas = previousCanvas;\n    }',
  '        canvas = previousCanvas;\n        P038_SUPPRESS_TEXT_IDS = previousSuppression;\n    }',
  'source text draw cleanup');
 new Script(runtime,{filename:'p038-canvas-renderer-draft.js'});
 const context=createContext({});new Script(runtime).runInContext(context);
 const asset=context.HELP_MATH_CANVAS_ASSETS?.[ID];assert(asset);
 const first=asset.resolveFrameState({frame:1,scenario:'source-static-frame',lang:'en',seed:0});
 assert.equal(first.localFrame,1);assert.deepEqual(JSON.parse(JSON.stringify(first.suppressedSourceTextIds)),[]);
 const suppressed=asset.resolveFrameState({frame:409,suppressSourceGlyphTextIds:[5,6]});
 assert.deepEqual(JSON.parse(JSON.stringify(suppressed.suppressedSourceTextIds)),[5,6]);
 assert.throws(()=>asset.resolveFrameState({frame:166,suppressSourceGlyphTextIds:[47]}),/button labels are protected/u);
 assert.throws(()=>asset.resolveFrameState({frame:207,suppressSourceGlyphTextIds:[51]}),/button labels are protected/u);
 assert.throws(()=>asset.resolveFrameState({frame:1,suppressSourceGlyphTextIds:[5,5]}),/unique allowlisted/u);
 assert.throws(()=>asset.resolveFrameState({frame:1,seed:1}),/fixed zero/u);
 assert.throws(()=>asset.resolveFrameState({frame:410}),/frame/u);
 const script=Buffer.from(runtime);
 const sourceMap={schemaVersion:1,kind:'p038-source-canvas-symbols-and-buttons-v1',
  animationId:ID,physicalSwf:pin(SOURCE,sourceBytes),nativeSourceContract:pin(NATIVE,nativeBytes),
  frameDomain:'sprite-67',frameCount:409,
  sourceTextIds:Object.keys(native.textDefinitions).map(Number).sort((a,b)=>a-b),
  protectedButtonOverlapTextIds:protectedTextIds,optionalSuppressionEligibleTextIds:eligibleTextIds,
  buttonBindings:native.buttonBindings.map(b=>({buttonObjectId:b.buttonObjectId,
   key:b.sourceKeyAttribute,startFrame:b.startFrame,lastFrame:b.lastSourceFrame,
   depth:b.depth,sourceStageHitBoxAtStartPx:b.sourceStageHitBoxAtStartPx,
   sourceScriptSha256:b.sourceScriptPin.sha256})),
  clipMaskPlacements:native.clipMaskPlacements,
  buttonHitExecution:'not-provided-by-FFDec-Canvas',
  sourceTextSuppression:'off-by-default; six button-overlapping text objects prohibited',
  visualAlignment:'uncalibrated'};
 const sourceMapBytes=json(sourceMap),specBytes=json(spec);
 const metadata={animationId:ID,sourceSwfSha256:SOURCE_SHA,
  stage:{width:800,height:600},fps:12,rootFrame:6,rootFrameCount:13,
  frameDomain:'sprite-67',frameCount:409,scenario:'source-static-frame',
  sourceGlyphRendering:{default:'preserve-all',eligibleTextIds,
   protectedButtonOverlapTextIds:protectedTextIds},
  sourceButtons:{count:7,hitExecution:'not-provided-by-FFDec-Canvas'},
  sourceClipMasks:{count:10,visualCalibration:false},
  stageRenderOffset:stageOffset,audioRendered:false,productRegistered:false,
  assetSha256:sha(script)};
 const metadataBytes=json(metadata);
 const inputs=[SOURCE,FACTS,XML,NATIVE,AUDIO,RECEIPT,FRAMES,ROOT_FRAMES,HELPER,ADAPTER]
  .map(name=>pin(name,physical(name)));
 const manifest={schemaVersion:1,kind:'p038-maintained-canvas-draft-v1',
  status:'unregistered-source-drawing-draft',animationId:ID,
  physicalSource:{bytes:sourceBytes.length,sha256:SOURCE_SHA},
  ffdecSourceExportSha256:sha(receiptBytes),nativeSourceContractSha256:sha(nativeBytes),
  sourceRoot:{beginFrame:6,placementTwips:{x:8248,y:6466}},
  sourceChild:{spriteId:67,frames:409,firstFfdecCase:0,lastFfdecCase:408},
  sourceTextCount:38,sourceButtonCount:7,sourceClipMaskCount:10,
  buttonOverlapTextProtected:protectedTextIds,
  inputs,outputs:[pin(`${EXPORT}/canvas-renderer-draft.js`,script),
   pin(`${EXPORT}/adapter-spec-v1.json`,specBytes),
   pin(`${EXPORT}/canvas-metadata-v1.json`,metadataBytes),
   pin(`${EXPORT}/source-interaction-map-v1.json`,sourceMapBytes)],
  unresolved:['ClipDepth mask appearance and Canvas-to-native placement remain uncalibrated.',
   'FFDec Canvas provides no source button hit execution or old-host DoHyperLinks outcome.',
   'No browser render, audio decode/listening, original-runtime or fidelity evidence.'],
  acceptanceEffects:{registered:false,originalRuntime:false,fidelity:false,
   audio:false,listening:false,human:false,owner:false,strictComplete:false,publication:false}};
 return new Map([['canvas-renderer-draft.js',script],['adapter-spec-v1.json',specBytes],
  ['canvas-metadata-v1.json',metadataBytes],['source-interaction-map-v1.json',sourceMapBytes],
  ['canvas-manifest-v1.json',json(manifest)]]);
}
const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'--plan | --write | --check');
const outputs=build();
for(const [name,bytes] of outputs){
 const file=path.join(OUTDIR,name);assert(path.dirname(file)===OUTDIR);
 if(mode==='--write'&&!fs.existsSync(file))fs.writeFileSync(file,bytes,{flag:'wx'});
 if(mode!=='--plan')assert.deepEqual(physical(file),bytes,`output drift: ${name}`);
}
console.log(JSON.stringify({mode,outputs:Object.fromEntries([...outputs].map(([name,bytes])=>
 [name,{bytes:bytes.length,sha256:sha(bytes)}])),sourceFrames:409,sourceButtons:7}));
