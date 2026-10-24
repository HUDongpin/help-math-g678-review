#!/usr/bin/env node
/** P029 source-pinned drawing draft. No product registration or audio. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const STAGE='migrations/shared-alg001-l06-p029';
const PLAN='migrations/shared-alg001-l06-p029/audit/source-planning-v1';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/VB/L6VB22.swf';
const SOURCE_PIN={path:SOURCE,bytes:567027,sha256:'cbfd012d0aff11544a252c9e2852dff30d408c634aa2a805eb0837933c3370d4'};
const ID='shared-alg001-l06-p029';
const OUT=`${STAGE}/canvas-v1`;
const CHILD=`${STAGE}/source-export/sprites/DefineSprite_185/frames.html`;
const HELPER=`${STAGE}/source-export/sprites/DefineSprite_185/canvas.js`;
const ROOT_FRAMES=`${STAGE}/source-export/frames/frames.html`;
const FEEDBACK=[52,67,98,126,151,167,179];
const MASKS=[{characterId:55,placements:[{depth:5,clipDepth:9}]},
  {characterId:68,placements:[{depth:1,clipDepth:8}]}];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function physical(base,relative){
 const target=path.resolve(base,relative);
 assert(target.startsWith(base+path.sep)&&fs.realpathSync(target)===target,`physical ${relative}`);
 const before=fs.lstatSync(target,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${relative}`);
 const bytes=fs.readFileSync(target),after=fs.lstatSync(target,{bigint:true});
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
function rawFiles(){
 const base=path.join(ROOT,STAGE,'source-export');
 const paths=[];
 for(const file of fs.readdirSync(path.join(base,'frames')).sort())paths.push(`${STAGE}/source-export/frames/${file}`);
 for(const dir of fs.readdirSync(path.join(base,'sprites')).sort()){
  assert(/^DefineSprite_\d+$/u.test(dir),`sprite export directory ${dir}`);
  for(const file of fs.readdirSync(path.join(base,'sprites',dir)).sort())
   paths.push(`${STAGE}/source-export/sprites/${dir}/${file}`);
 }
 assert.equal(paths.length,30,'root plus 14 sprite pairs');
 return paths;
}
function exportReceipt(){
 return json({schemaVersion:1,kind:'alg-l06-p029-ffdec-canvas-raw-v1',animationId:ID,
  source:{...SOURCE_PIN,root:SOURCE_ROOT},tool:'JPEXS Free Flash Decompiler v.26.2.1',
  command:['ffdec','-config','packJavaScripts=false','-onerror','abort','-format',
   'frame:canvas,sprite:canvas','-export','frame,sprite',`${STAGE}/source-export`,
   `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
  files:rawFiles().map(name=>pin(name,physical(ROOT,name))),
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
}
function build(){
 const planBytes=physical(ROOT,`${PLAN}/source-plan-v1.json`);
 const xmlBytes=physical(ROOT,`${PLAN}/source-structure.xml`);
 const displayBytes=physical(ROOT,`${PLAN}/source-display-list-v1.json`);
 const childBytes=physical(ROOT,CHILD),helperBytes=physical(ROOT,HELPER);
 const rootBytes=physical(ROOT,ROOT_FRAMES);
 const exportBytes=physical(ROOT,`${STAGE}/export-receipt-v1.json`);
 const plan=JSON.parse(planBytes),display=JSON.parse(displayBytes),receipt=JSON.parse(exportBytes);
 const child=childBytes.toString().replace(/\r\n?/gu,'\n');
 const root=rootBytes.toString().replace(/\r\n?/gu,'\n');
 const xml=xmlBytes.toString();
 assert.equal(plan.identity.animationId,ID);
 assert.equal(plan.source.swf.sha256,SOURCE_PIN.sha256);
 assert.equal(display.sourceSwfSha256,SOURCE_PIN.sha256);
 assert.equal(display.sprites['185'].frameCount,234);
 assert.equal(receipt.source.sha256,SOURCE_PIN.sha256);
 assert.deepEqual(receipt.files,rawFiles().map(name=>pin(name,physical(ROOT,name))));
 assert(xml.includes('<DefineSprite objectID="185" frames="234">'));
 const visibleFeedback=display.sprites['185'].instances.filter(x=>FEEDBACK.includes(x.objectId));
 assert.deepEqual(visibleFeedback.map(x=>x.objectId),FEEDBACK);
 assert(visibleFeedback.every(x=>x.presentSpans[0][0]===145&&x.presentSpans[0][1]===234));
 const placed=[...new Set([...child.matchAll(/place\("([A-Za-z_$][\w$]*)"/gu)].map(m=>m[1]))].sort();
 const fonts=[...child.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
 const images=[...child.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)].map(m=>m[1]);
 assert.deepEqual(fonts,['font5','font18','font31','font57','font72','font121','font143','font172']);
 assert.equal(images.length,11);
 const rootMain=sourceFunction(root,'main');
 const entry=rootMain.slice(rootMain.indexOf('case 5:'),rootMain.indexOf('case 6:'));
 const rootPlacements=entry.split('\n').filter(line=>/place\("(?:sprite2|sprite185)"/u.test(line));
 assert.deepEqual(rootPlacements.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['sprite2','sprite185']);
 assert(rootPlacements[0].includes('[0.05,0.0,0.0,0.05,400.0,43.1]'));
 assert(rootPlacements[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
 const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
  classification:'behavior-heavy-unregistered-source-canvas-draft',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,swfSha256:SOURCE_PIN.sha256},
  evidence:{scenarioInventory:`${PLAN}/source-plan-v1.json`,scenarioInventorySha256:sha(planBytes),
   audioAudit:`${PLAN}/source-plan-v1.json`,audioAuditSha256:sha(planBytes),
   sourceXml:`${PLAN}/source-structure.xml`,sourceXmlSha256:sha(xmlBytes),
   sourceDisplayList:`${PLAN}/source-display-list-v1.json`,sourceDisplayListSha256:sha(displayBytes)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:HELPER,helperSha256:sha(helperBytes),framesHtml:CHILD,framesHtmlSha256:sha(childBytes),
   targetSpriteObjectId:185,targetSpriteFunction:'sprite185',
   exportCanvas:{width:724,height:1281},exportInternalTranslation:{x:373.55,y:667.6},
   expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:5666},placementPixels:{x:412.4,y:283.3}},
   local:{timelineId:'sprite-185',frameCount:234,livePlaybackEndFrame:145,
    playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:{x:38.85,y:-384.3}},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
   defaultScenario:'source-static-frame',supportedLanguages:['en'],
   visualLocalization:'source-English glyphs; es fallback requires explicit product disposition',
   seedMapping:'fixed zero; no source random behavior is inferred',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Frame 145 stop and host-selected feedback require the staged reducer.',
    'Source AVM1 answer coercion and popup spelling behavior require original-runtime verification.',
    'Editable Entry_txt requires native input; FFDec Canvas omits an accessible editable field.',
    'Audio, source-English fallback, visual fidelity and human/Owner review remain separate.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',
   spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helperBytes.toString(),framesHtml:child,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,MASKS.map(m=>({...m,
  rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,1]));'})),xml);
 runtime=replaceOnce(runtime,
  'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("seed must be fixed zero");\n    }','fixed seed');
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`));
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${sourceFunction(root,'shape1')}\n\n${sourceFunction(root,'sprite2')}\n\nSAFE_OBJECTS = Object.freeze({`,
  'source title definitions');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n        "sprite2": sprite2,\n',
  'source title registry');
 // FFDec advances every placed child clip by parent time. The source host's
 // showRight/WrongFeed choice is external, so make it explicit and single-owner.
 const counts={};
 runtime=runtime.replace(/^([ \t]*)place\("sprite(52|67|98|126|151|167|179)",([^\n]*),1,\([^\n]*?\)%\d+,144,time\);$/gmu,
  (full,indent,id,args)=>{
   counts[id]=(counts[id]??0)+1;
   return `${indent}if (P029_ACTIVE_FEEDBACK && P029_ACTIVE_FEEDBACK.spriteId === ${id}) place("sprite${id}",${args},1,P029_ACTIVE_FEEDBACK.frame - 1,144,0);`;
  });
 assert.deepEqual(Object.keys(counts).map(Number).sort((a,b)=>a-b),[52,67,98,126,151,167,179]);
 assert(FEEDBACK.every(id=>counts[id]===90),`all 90 source parent frames are gated: ${JSON.stringify(counts)}`);
 // If an export rearranges the source placement syntax, fail before output.
 assert(!/^[ \t]*place\("sprite(?:52|67|98|126|151|167|179)",/gmu.test(runtime));
 runtime=replaceOnce(runtime,'var readyPromise = null;',
  'var P029_ACTIVE_FEEDBACK = null;\nvar readyPromise = null;','feedback render owner');
 runtime=replaceOnce(runtime,'    var state = resolveFrameState(request);',
  `    var state = resolveFrameState(request);
    var selected = request && request.feedback === undefined ? null : request.feedback;
    if (selected !== null) {
        if (!selected || !Number.isSafeInteger(selected.spriteId) || ${JSON.stringify(FEEDBACK)}.indexOf(selected.spriteId) < 0 ||
            !Number.isSafeInteger(selected.frame) || selected.frame < 1 ||
            selected.frame > ({52:29,67:28,98:28,126:28,151:27,167:28,179:25})[selected.spriteId] ||
            state.localFrame < 145) throw new Error("invalid P029 feedback domain or frame");
    }
    var oldFeedback = P029_ACTIVE_FEEDBACK;`,
  'explicit feedback request');
 runtime=replaceOnce(runtime,
  '    ctx.save();\n    try {\n        ctx.transform(1, 0, 0, 1, 38.85, -384.3);',
  '    ctx.save();\n    try {\n        P029_ACTIVE_FEEDBACK = selected;\n        ctx.transform(1, 0, 0, 1, 38.85, -384.3);',
  'feedback activation within render cleanup');
 runtime=replaceOnce(runtime,'        canvas = previousCanvas;\n    }',
  '        canvas = previousCanvas;\n        P029_ACTIVE_FEEDBACK = oldFeedback;\n    }',
  'feedback cleanup');
 const oldDraw='ctx.transform(1, 0, 0, 1, 38.85, -384.3);\n        sprite185(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 runtime=replaceOnce(runtime,oldDraw,
  `var ctrans = new cxform(0,0,0,0,255,255,255,255);
        var time = 0;
        ${rootPlacements[0].trim()}
        ${oldDraw}`,
  'root title before main sprite');
 new Script(runtime,{filename:'p029-canvas-renderer.js'});
 const script=Buffer.from(runtime);
 const metadata=json({animationId:ID,sourceSwfSha256:SOURCE_PIN.sha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,rootFrameCount:10,
  frameDomain:'sprite-185',frameCount:234,quizHoldFrame:145,
  feedbackSpriteIds:FEEDBACK,feedbackGate:'exactly one explicit source sprite and its own frame',
  sourceGlyphRendering:{mode:'preserve-all',canvasAriaHiddenByHost:true,
   nativeText:'accessible semantic companion only until source glyph ownership is reviewed'},
  sourceClipMasks:[55,68],stageRenderOffset:spec.timeline.stageRenderOffset,
  assetSha256:sha(script),audioRendered:false});
 const inputs=[['sourcePlan',`${PLAN}/source-plan-v1.json`],['sourceXml',`${PLAN}/source-structure.xml`],
  ['displayList',`${PLAN}/source-display-list-v1.json`],
  ['exportReceipt',`${STAGE}/export-receipt-v1.json`],['helper',HELPER],
  ['childFrames',CHILD],['rootFrames',ROOT_FRAMES],
  ['generator','scripts/prepare-alg-l06-p029-canvas-v1.mjs'],
  ['safeAdapter','scripts/build-safe-ffdec-canvas-adapter.mjs'],
  ['clipNormalizer','scripts/lib/g678-source-clip-masks-v1.mjs']]
  .map(([key,name])=>({key,...pin(name,physical(ROOT,name))}));
 const manifest=json({schemaVersion:1,kind:'alg-l06-p029-source-canvas-v1',
  status:'unregistered-drawing-draft',animationId:ID,source:SOURCE_PIN,
  rootFrame:6,frameDomain:'sprite-185',frameCount:234,quizHoldFrame:145,
  feedbackDomains:FEEDBACK.map(id=>({spriteId:id,parentFrames:[145,234],selection:'explicit-only'})),
  sourceGlyphsPreserved:true,sourceClipMasks:[55,68],inputs,
  outputs:[pin(`${OUT}/canvas-renderer.js`,script),pin(`${OUT}/canvas-metadata-v1.json`,metadata)],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 return {script,metadata,manifest,spec:json(spec)};
}
function main(){
 const mode=process.argv[2];
 assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write | --check');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS source root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const swf=physical(SOURCE_ROOT,SOURCE);
 assert.equal(swf.length,SOURCE_PIN.bytes);assert.equal(sha(swf),SOURCE_PIN.sha256);
 const receipt=exportReceipt(),receiptPath=path.join(ROOT,STAGE,'export-receipt-v1.json');
 if(mode==='--check')assert(fs.readFileSync(receiptPath).equals(receipt),'raw export receipt drift');
 else if(fs.existsSync(receiptPath))assert(fs.readFileSync(receiptPath).equals(receipt),'raw export receipt drift');
 else fs.writeFileSync(receiptPath,receipt,{flag:'wx'});
 const built=build();
 fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});
 for(const [name,bytes] of [[`${OUT}/canvas-renderer.js`,built.script],
  [`${OUT}/canvas-metadata-v1.json`,built.metadata],
  [`${OUT}/canvas-manifest.json`,built.manifest],
  [`${OUT}/adapter-spec.json`,built.spec]]){
  const target=path.join(ROOT,name);
  if(mode==='--check')assert(fs.readFileSync(target).equals(bytes),`${name} drift`);
  else fs.writeFileSync(target,bytes);
 }
 console.log(JSON.stringify({mode,animationId:ID,rawFiles:rawFiles().length,
  canvasSha256:sha(built.script),feedbackSprites:FEEDBACK}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
export {build as buildP029Canvas};
