#!/usr/bin/env node
/** Source-pinned P035 drawing only. Main and selected feedback playheads are explicit. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HERE=path.dirname(fileURLToPath(import.meta.url));
const OUT='migrations/shared-alg001-l06-p035/canvas-v1';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/IN/L6IN07.swf';
const SOURCE_PIN={bytes:668248,sha256:'9aaf16b58c32b00b056c7c5040b38f9d1391486bb025b71c95fa0326bbae33b3'};
const TRIAGE='output/alg-l06-p035-source-triage-20261001-v1';
const EXPORT='output/alg-l06-p035-canvas-export-20261001-v1';
const XML=`${TRIAGE}/source-structure.xml`;
const FACTS=`${TRIAGE}/source-facts-v1.json`;
const EXPORT_RECEIPT=`${EXPORT}/canvas-source-export-v1.json`;
const FRAMES=`${EXPORT}/source-canvas-export/sprites/DefineSprite_227/frames.html`;
const ROOT_FRAMES=`${EXPORT}/source-canvas-export/frames/frames.html`;
const HELPER=`${EXPORT}/source-canvas-export/sprites/DefineSprite_227/canvas.js`;
const ID='shared-alg001-l06-p035';
const FEEDBACK=Object.freeze({80:{kind:'wrong',frames:29},95:{kind:'wrong',frames:28},
 126:{kind:'wrong',frames:28},154:{kind:'right',frames:28},
 179:{kind:'right',frames:27,held:true},195:{kind:'right',frames:28},
 207:{kind:'right',frames:25}});
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
function attributes(tag){
 return Object.fromEntries([...tag.matchAll(/([A-Za-z]+)="([^"]*)"/gu)].map(m=>[m[1],m[2]]));
}
function timeline(xml,id,frames){
 const marker=new RegExp(`<DefineSprite objectID="${id}" frames="${frames}">`,'gu');
 const found=[...xml.matchAll(marker)];assert.equal(found.length,1,`sprite ${id} source declaration`);
 const start=found[0].index,end=xml.indexOf('</DefineSprite>',start);
 const nextSprite=xml.indexOf('<DefineSprite ',start+1);
 assert(end>start&&(nextSprite<0||nextSprite>end),`sprite ${id} boundaries`);
 const block=xml.slice(start,end),events=block.matchAll(/<(PlaceObject2|RemoveObject2|ShowFrame)\b([^>]*?)\/?\s*>/gu);
 const active=new Map(),generations=new Map(),rows=[];let frame=1;
 const retire=depth=>{const row=active.get(depth);if(row){rows.push({...row,lastFrame:frame-1});active.delete(depth);}};
 for(const match of events){
  const [kind,raw]=[match[1],attributes(match[2])];
  if(kind==='ShowFrame'){frame++;continue;}
  const depth=Number(raw.depth);assert(Number.isSafeInteger(depth)&&depth>=0);
  if(kind==='RemoveObject2'){retire(depth);continue;}
  if(!raw.objectID)continue; // transform-only PlaceObject2 preserves the instance
  retire(depth);
  const generation=(generations.get(depth)??0)+1;generations.set(depth,generation);
  active.set(depth,{objectId:Number(raw.objectID),depth,
   instanceId:`depth-${depth}/generation-${generation}`,firstFrame:frame,
   ...(raw.name?{name:raw.name}:{}),...(raw.clipDepth?{clipDepth:Number(raw.clipDepth)}:{})});
 }
 assert.equal(frame-1,frames,`sprite ${id} frame inventory`);
 for(const row of active.values())rows.push({...row,lastFrame:frames});
 return rows.sort((a,b)=>a.firstFrame-b.firstFrame||a.depth-b.depth);
}
function only(rows,id){const found=rows.filter(row=>row.objectId===id);assert.equal(found.length,1,`one placement ${id}`);return found[0];}
function sourceMap(xml,facts,receipt){
 const main=timeline(xml,227,534),wrong95=timeline(xml,95,28),wrong126=timeline(xml,126,28);
 const wrong79=timeline(xml,79,1),wrong91=timeline(xml,91,1),wrong117=timeline(xml,117,1);
 const masks=main.filter(row=>row.objectId===19&&row.clipDepth);
 assert.deepEqual(masks.map(m=>[m.depth,m.clipDepth,m.firstFrame,m.lastFrame]),
  [[15,24,13,534],[25,32,89,534]]);
 const glossary=facts.glossary.map(item=>{
  const row=only(main,item.id),mask=masks.find(m=>m.depth<row.depth&&row.depth<=m.clipDepth);
  assert(mask&&row.firstFrame===(item.id<30?13:89)&&row.lastFrame===534);
  return {key:item.label,buttonId:item.id,sourceActionSha256:item.script.sha256,
   ...row,mask:{objectId:mask.objectId,instanceId:mask.instanceId,
    depth:mask.depth,clipDepth:mask.clipDepth},
   controlGate:'source-instance+visible-blue-label+mask+hit-required-by-native-owner'};
 });
 assert.deepEqual(glossary.map(x=>x.buttonId),[23,24,25,37,38]);
 const choices={A:{textValue:50,buttonId:54,depth:81},B:{textValue:51,buttonId:55,depth:83},
  C:{textValue:225,buttonId:54,depth:85},D:{textValue:226,buttonId:54,depth:87}};
 const quiz=Object.entries(choices).map(([choice,expected])=>{
  const row=main.find(x=>x.objectId===expected.buttonId&&x.depth===expected.depth);
  assert(row&&row.firstFrame===145&&row.lastFrame===145&&row.name===`AnsBtn${Object.keys(choices).indexOf(choice)+1}`);
  return {choice,correct:choice==='B',...expected,...row,
   sourceActionSha256:choice==='B'?facts.quiz.correctButton.sha256:facts.quiz.wrongButton.sha256};
 });
 const closes=[[80,79,76,wrong79],[95,91,89,wrong91],[126,117,115,wrong117]].map(([spriteId,ownerId,buttonId,rows])=>{
  const row=only(rows,buttonId);assert.equal(row.name,'BtnClose');
  return {feedbackSpriteId:spriteId,ownerSpriteId:ownerId,buttonId,...row,
   sourceActionSha256:facts.quiz.wrongCloseButtons.find(x=>x.file.includes(`DefineButton2_${buttonId}/`))?.sha256};
 });
 assert(closes.every(x=>/^[a-f0-9]{64}$/u.test(x.sourceActionSha256)));
 const placements=Object.entries(FEEDBACK).map(([id,value])=>{
  const row=only(main,Number(id));
  assert(row.firstFrame===145&&row.lastFrame===534);
  assert.equal(receipt.sprites[id].sourceFrames,value.frames);
  return {spriteId:Number(id),kind:value.kind,frameCount:value.frames,
   heldSourceTail:value.held===true,...row,
   firstSourceLocalFrame:1,lastSourceLocalFrame:value.frames,
   firstFfdecCase:0,lastFfdecCase:value.frames-1};
 });
 assert.deepEqual(wrong95.filter(x=>x.objectId===83&&x.clipDepth).map(x=>[x.depth,x.clipDepth]),[[5,9]]);
 assert.deepEqual(wrong126.filter(x=>x.objectId===96&&x.clipDepth).map(x=>[x.depth,x.clipDepth]),[[1,8]]);
 return {schemaVersion:1,kind:'p035-source-placements-for-maintained-canvas-v1',
  animationId:ID,sourceSwfSha256:SOURCE_PIN.sha256,
  caseMapping:{main:'source one-indexed sprite-227 frame minus one',
   feedback:'selected source one-indexed nested sprite frame minus one'},
  root:{frameCount:10,entryFrame:6,mainSpriteId:227,titleSpriteId:2},
  glossary,quiz,feedbackPlacements:placements,feedbackClose:closes,
  clipMasks:[...masks,{...only(wrong95,83),ownerSpriteId:95},
   {...only(wrong126,96),ownerSpriteId:126}],
  heldFeedbackSpriteId:179,
  audioAndHostBehavior:'not executed by Canvas'};
}

function build(){
 const swf=physical(SOURCE_ROOT,SOURCE);
 assert.equal(swf.length,SOURCE_PIN.bytes);assert.equal(sha(swf),SOURCE_PIN.sha256);
 const receiptBytes=physical(ROOT,EXPORT_RECEIPT),receipt=JSON.parse(receiptBytes);
 assert.equal(receipt.animationId,ID);
 assert.deepEqual(receipt.physicalSource,{path:path.join(SOURCE_ROOT,SOURCE),...SOURCE_PIN});
 assert.equal(receipt.canvasFiles.length,30);
 assert.equal(Object.keys(receipt.sprites).length,14);
 for(const row of receipt.canvasFiles){const bytes=physical(ROOT,row.path);
  assert.equal(bytes.length,row.bytes,row.path);assert.equal(sha(bytes),row.sha256,row.path);}
 const factsBytes=physical(ROOT,FACTS),facts=JSON.parse(factsBytes);
 const xmlBytes=physical(ROOT,XML),xml=xmlBytes.toString();
 assert.equal(facts.source.swf.sha256,SOURCE_PIN.sha256);
 assert.equal(facts.stage.fps,12);assert.equal(facts.stage.rootFrames,10);
 const framesBytes=physical(ROOT,FRAMES),frames=framesBytes.toString().replace(/\r\n?/gu,'\n');
 const rootBytes=physical(ROOT,ROOT_FRAMES),rootFrames=rootBytes.toString().replace(/\r\n?/gu,'\n');
 const helperBytes=physical(ROOT,HELPER);
 const placements=sourceMap(xml,facts,receipt);
 const placed=[...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m=>m[1]))].sort();
 const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
 const images=[...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/gu)].map(m=>m[1]);
 assert.equal(placed.length,200);assert.equal(fonts.length,8);assert.equal(images.length,10);
 assert.equal([...frames.matchAll(/function text\d+\(/gu)].length,53,'all 53 source text functions');
 const spriteHeader=frames.match(/function sprite227\(ctx,ctrans,frame,ratio,time\)\{\s*ctx\.save\(\);\s*ctx\.transform\(1,0,0,1,([^,]+),([^\)]+)\);/u);
 assert(spriteHeader);assert.deepEqual(spriteHeader.slice(1).map(Number),[373.55,692.1]);
 const rootFunction=rootFrames.slice(rootFrames.indexOf('function main('));
 const entry=rootFunction.slice(rootFunction.indexOf('case 5:'),rootFunction.indexOf('case 6:'));
 const rootLines=entry.split('\n').filter(line=>/place\("(?:sprite2|sprite227)"/u.test(line)).map(line=>line.trim());
 assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['sprite2','sprite227']);
 assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,401.45,42.55]'));
 assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,323.3]'));
 // XML's root matrix is unit-scale in twips. The standalone sprite exporter
 // already converts each nested placement from twips to pixels (0.05) and adds
 // its own stage-centering translation. Reusing root's exported 0.05 here
 // would scale the pixel-normalized sprite a second time.
 assert(xml.includes('<PlaceObject2 replace="0" depth="3" objectID="227" morph="5" name="animation">\n        <transform>\n          <Transform transX="8248" transY="6466"/>'));
 assert(frames.includes('place("shape3",canvas,ctx,[0.05,0.0,0.0,0.05,8.05,-38.35]'));
 const rootMainPixels={x:8248/20,y:6466/20};
 assert.deepEqual(rootMainPixels,{x:412.4,y:323.3});
 const spriteExportPixels={x:Number(spriteHeader[1]),y:Number(spriteHeader[2])};
 const stageOffset={x:Math.round((rootMainPixels.x-spriteExportPixels.x)*100)/100,
  y:Math.round((rootMainPixels.y-spriteExportPixels.y)*100)/100};
 assert(Math.abs(stageOffset.x-38.85)<1e-10&&Math.abs(stageOffset.y+368.8)<1e-10);
 const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
  classification:'behavior-heavy-unregistered-source-canvas-v1',
  source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,swfSha256:SOURCE_PIN.sha256},
  evidence:{scenarioInventory:FACTS,scenarioInventorySha256:sha(factsBytes),
   audioAudit:FACTS,audioAuditSha256:sha(factsBytes),sourceXml:XML,sourceXmlSha256:sha(xmlBytes)},
  ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
   helper:HELPER,helperSha256:sha(helperBytes),framesHtml:FRAMES,framesHtmlSha256:sha(framesBytes),
   targetSpriteObjectId:227,targetSpriteFunction:'sprite227',
   exportCanvas:{width:724,height:1281},
   exportInternalTranslation:{x:373.55,y:692.1},
   expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
   expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
   embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
  timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
   root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
    placementName:'animation',placementTwips:{x:8248,y:6466},placementPixels:{x:412.4,y:323.3}},
   local:{timelineId:'sprite-227',frameCount:534,livePlaybackEndFrame:145,
    playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},
   stageRenderOffset:stageOffset,
   mainMatrixNormalization:'root unit-scale XML matrix minus standalone sprite pixel translation; nested 0.05 twips conversion retained'},
  runtimeContract:{kind:'structural-local-frame',scenarios:['source-explicit-frames'],
   defaultScenario:'source-explicit-frames',supportedLanguages:['en'],
   visualLocalization:'source-English visuals; es requires explicit source-English fallback',
   seedMapping:'fixed zero; no AVM1 or shell random selection executed',blockedLocalFrameRanges:[],
   currentCanonicalFrameDomainDispositionAsserted:false,
   unresolved:['Quiz/feedback/glossary/close actions are page-owned, not Canvas-executed.',
    'Feedback sprite selection is shell-owned and must be supplied explicitly.',
    'Sprite 179 source tail and audio remain held.',
    'Original runtime, native text, audio clock and My Lesson integration are separate.']},
  output:{script:'canvas-renderer.js',manifest:'canvas-manifest-v1.json',
   spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
  strictAcceptanceEffect:'none'};
 let runtime=buildSafeRuntime({helperSource:helperBytes.toString(),framesHtml:frames,spec}).runtime;
 runtime=normalizeSourceClipMasks(runtime,[
  {characterId:19,placements:[{depth:15,clipDepth:24},{depth:25,clipDepth:32}],
   rawFill:'ctx.fillStyle=tocolor(ctrans.apply([255,255,0,0.0]));'},
  {characterId:83,placements:[{depth:5,clipDepth:9}],
   rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,1]));'},
  {characterId:96,placements:[{depth:1,clipDepth:8}],
   rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,1]));'}],xml);
 runtime=runtime.replaceAll(`course-${ID}`,ID);
 assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
 runtime=replaceOnce(runtime,'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
  'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n'
  +'        throw new Error("seed must be fixed zero for this source frame");\n    }','source seed');
 const feedbackValidation=`var selectedFeedback = null;
    if (request.feedback !== undefined && request.feedback !== null) {
        if (frame !== 145 || typeof request.feedback !== "object" ||
            Array.isArray(request.feedback) ||
            Object.keys(request.feedback).sort().join(",") !== "localFrame,spriteId") {
            throw new Error("feedback requires an exact frame-145 selection");
        }
        var spriteId = request.feedback.spriteId;
        var localFrame = request.feedback.localFrame;
        var feedbackFrames = {80:29,95:28,126:28,154:28,195:28,207:25};
        if (spriteId === 179) throw new Error("P035_FEEDBACK_179_SOURCE_TAIL_HELD");
        if (!Number.isSafeInteger(spriteId) ||
            !Object.prototype.hasOwnProperty.call(feedbackFrames,spriteId) ||
            !Number.isSafeInteger(localFrame) || localFrame < 1 ||
            localFrame > feedbackFrames[spriteId]) {
            throw new Error("unsupported feedback sprite or local frame");
        }
        selectedFeedback = Object.freeze({spriteId:spriteId,localFrame:localFrame,
            kind:spriteId===80||spriteId===95||spriteId===126?"wrong":"right"});
    }
    `;
 runtime=replaceOnce(runtime,'    return Object.freeze({\n        frameDomain:',
  `    ${feedbackValidation}return Object.freeze({\n        frameDomain:`,'feedback validation');
 runtime=replaceOnce(runtime,'        audioRendered: false\n    });',
  '        audioRendered: false,\n        feedback: selectedFeedback\n    });','feedback state');
 // FFDec's linear export unconditionally draws all seven feedback MovieClips
 // after main frame 145. The page-owned state chooses exactly one clip/frame.
 for(const [id,value] of Object.entries(FEEDBACK)){
  const regex=new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`,'gm');
  let count=0;
  runtime=runtime.replace(regex,(line,indent)=>{
   const changed=line.replace(/,1,\(\d+\+time\)%\d+,144,time\);$/u,
    ',1,P035_FEEDBACK.localFrame-1,144,P035_FEEDBACK.localFrame-1);');
   assert.notEqual(changed,line,`feedback ${id} source placement form`);
   count++;
   return `${indent}if (P035_FEEDBACK && P035_FEEDBACK.spriteId === ${id}) ${changed.trim()}`;
  });
  assert.equal(count,390,`feedback ${id} source placements`);
  assert.equal(receipt.sprites[id].sourceFrames,value.frames);
 }
 runtime=replaceOnce(runtime,'var readyPromise = null;',
  'var P035_FEEDBACK = null;\nvar readyPromise = null;','feedback draw state');
 runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
  `\n${sourceFunction(rootFrames,'shape1')}\n\n${sourceFunction(rootFrames,'sprite2')}\n\nSAFE_OBJECTS = Object.freeze({`,'source title functions');
 runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
  'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n        "sprite2": sprite2,\n','source title registry');
 const oldDraw='ctx.transform(1, 0, 0, 1, 38.85, -368.8);\n'
  +'        sprite227(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
 const title=rootLines[0].replace('(0+time)%1','0');
 const main=rootLines[1].replace('(0+time)%534','state.exportFrame');
 assert(title!==rootLines[0]&&main!==rootLines[1]);
 runtime=replaceOnce(runtime,oldDraw,
  'var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
  +'        var time = state.exportFrame;\n'
  +`        ${title}\n        ctx.save();\n        ctx.transform(1, 0, 0, 1, ${stageOffset.x}, ${stageOffset.y});\n`
  +'        sprite227(ctx, ctrans, state.exportFrame, 0, 0);\n'
  +'        ctx.restore();','source XML root placement for pixel-normalized sprite');
 runtime=replaceOnce(runtime,'    var ctx = targetCanvas.getContext("2d");',
  '    var drawingCanvas = document.createElement("canvas");\n'
  +'    drawingCanvas.width = 800; drawingCanvas.height = 600;\n'
  +'    var ctx = drawingCanvas.getContext("2d");','isolated source drawing canvas');
 runtime=replaceOnce(runtime,'    var previousCanvas = canvas;\n    canvas = targetCanvas;',
  '    var previousCanvas = canvas;\n    var previousFeedback = P035_FEEDBACK;\n'
  +'    canvas = drawingCanvas;\n    P035_FEEDBACK = state.feedback;','scoped drawing state');
 runtime=replaceOnce(runtime,'        ctx.restore();\n        canvas = previousCanvas;\n    }\n    if (typeof targetCanvas.setAttribute === "function") {',
  '        ctx.restore();\n        canvas = previousCanvas;\n'
  +'        P035_FEEDBACK = previousFeedback;\n    }\n'
  +'    var targetCtx = targetCanvas.getContext("2d");\n'
  +'    if (!targetCtx) throw new Error("2D host canvas context is unavailable");\n'
  +'    targetCtx.save();\n'
  +'    try { targetCtx.setTransform(1,0,0,1,0,0); targetCtx.clearRect(0,0,800,600);\n'
  +'        targetCtx.drawImage(drawingCanvas,0,0); } finally { targetCtx.restore(); }\n'
  +'    if (typeof targetCanvas.setAttribute === "function") {','fresh host copy');
 runtime=replaceOnce(runtime,'        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));',
  '        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));\n'
  +'        targetCanvas.setAttribute("data-p035-feedback-sprite", state.feedback ? String(state.feedback.spriteId) : "none");\n'
  +'        targetCanvas.setAttribute("data-p035-feedback-frame", state.feedback ? String(state.feedback.localFrame) : "none");',
  'feedback frame readback');
 assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame)\s*\(|\bfetch\s*\(/u.test(runtime));
 new Script(runtime,{filename:'p035-canvas-renderer.js'});
 // Pure state smoke check needs no browser and does not establish painted pixels.
 const sandbox={document:{createElement:()=>({getContext:()=>({})})}};
 createContext(sandbox);new Script(runtime).runInContext(sandbox,{timeout:30000});
 const asset=sandbox.HELP_MATH_CANVAS_ASSETS[ID];
 const base=asset.resolveFrameState({frame:145,scenario:'source-explicit-frames',lang:'en',seed:0});
 assert.equal(base.exportFrame,144);assert.equal(base.feedback,null);
 assert.deepEqual(JSON.parse(JSON.stringify(asset.resolveFrameState({frame:145,feedback:{spriteId:80,localFrame:29}}).feedback)),
  {spriteId:80,localFrame:29,kind:'wrong'});
 assert.throws(()=>asset.resolveFrameState({frame:145,feedback:{spriteId:179,localFrame:1}}),/SOURCE_TAIL_HELD/u);
 assert.throws(()=>asset.resolveFrameState({frame:146,feedback:{spriteId:80,localFrame:1}}),/frame-145/u);
 const script=Buffer.from(runtime);
 const metadata=json({schemaVersion:1,kind:'p035-maintained-canvas-metadata-v1',animationId:ID,
  sourceSwfSha256:SOURCE_PIN.sha256,sourceExportSha256:sha(receiptBytes),
  stage:{width:800,height:600},fps:12,rootFrame:6,rootFrames:10,
  main:{spriteId:227,frameDomain:'sprite-227',frameCount:534,quizStopFrame:145},
  feedback:Object.entries(FEEDBACK).map(([id,x])=>({spriteId:Number(id),kind:x.kind,
   frameCount:x.frames,held:x.held===true})),
  sourceGlyphRendering:{mode:'preserve-all',sourceTextFunctionCount:53,
   sourceGraphShapesPreserved:true,sourceStaticShapesPreserved:true,
   sourceMasksNormalized:[19,83,96]},
  sourceRoot:{titleSpriteId:2,mainSpriteId:227,entryFrame:6},
  request:'render(canvas,{frame:mainOneIndexed,feedback:null|{spriteId,localFrame},scenario,lang,seed})',
  caseMapping:placements.caseMapping,selectionOwner:'page-owned; no AVM1 or shell selection executed',
  assetSha256:sha(script),audioRendered:false,
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   audio:false,listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 const inputs=[SOURCE,EXPORT_RECEIPT,FACTS,XML,FRAMES,ROOT_FRAMES,HELPER].map(name=>{
  const bytes=name===SOURCE?swf:physical(ROOT,name);
  return pin(name,bytes);
 });
 for(const name of ['scripts/build-safe-ffdec-canvas-adapter.mjs',
  'scripts/lib/g678-source-clip-masks-v1.mjs',
  'scripts/prepare-alg-l06-p035-canvas-v1.mjs'])
  inputs.push(pin(name,physical(ROOT,name)));
 const placementBytes=json(placements),specBytes=json(spec);
 const manifest=json({schemaVersion:1,kind:'p035-maintained-canvas-root-matrix-v3',
  status:'output-only-unregistered-engineering-candidate',animationId:ID,
  sourceSwfSha256:SOURCE_PIN.sha256,inputs,
  sourceExportFilesVerified:receipt.canvasFiles.length,
  sourceSpriteCount:Object.keys(receipt.sprites).length,
  feedbackSuppressedUnlessSelected:true,feedback179Held:true,
  outputs:[pin('canvas-renderer.js',script),pin('canvas-metadata-v1.json',metadata),
   pin('source-interaction-map-v1.json',placementBytes),pin('adapter-spec-v1.json',specBytes)],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   audio:false,listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 return {'canvas-renderer.js':script,'canvas-metadata-v1.json':metadata,
  'source-interaction-map-v1.json':placementBytes,'adapter-spec-v1.json':specBytes,
  'canvas-manifest-v1.json':manifest};
}
function main(){
 const mode=process.argv[2];assert(process.argv.length===3&&['--write','--check'].includes(mode));
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical source root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const outputs=build();
 for(const [name,bytes] of Object.entries(outputs)){
  const file=path.join(ROOT,OUT,name);
  if(mode==='--write')fs.writeFileSync(file,bytes);
  else assert.deepEqual(fs.readFileSync(file),bytes,`generated ${name} drift`);
 }
 console.log(JSON.stringify({mode,outputs:Object.entries(outputs).map(([name,b])=>pin(name,b))}));
}
main();
