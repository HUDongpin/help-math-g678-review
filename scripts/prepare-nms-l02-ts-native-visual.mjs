#!/usr/bin/env node
/** P055 source-native visual extraction. This is an unregistered engineering asset. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script, createContext} from 'node:vm';
import {parse} from 'acorn';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {sourcePoseSegments} from './build-g678-alg-l12-glossary-pair-native-text.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = fileURLToPath(import.meta.url);
const OUT = 'output/nms-l02-ts-family-20260927/visual';
const ID = 'shared-nms002-l02-p055';
const SOURCE = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS02.swf';
const SOURCE_SHA = '8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e';
const RAW = Object.freeze({
  xml: {path: `${OUT}/raw/movie.xml`, bytes: 437082, sha256: '5726bea69caa1be1113a1f0ccd57e4e8a85278fcb4799a2f0c6d05eb2569cb00'},
  helper: {path: `${OUT}/raw/ffdec/frames/canvas.js`, bytes: 52872, sha256: '78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  frames: {path: `${OUT}/raw/ffdec/frames/frames.html`, bytes: 631344, sha256: '022fcf4950933481f09a027471b97eca2edb6929c66169427e2a0f4de5298215'},
  sprite: {path: `${OUT}/raw/ffdec/sprites/DefineSprite_26/frames.html`, bytes: 353142, sha256: '2669013d80fca2b8d4b7af4b9b6398763917efa1b5acef49f271baab97aa6608'},
});
const ROLE = Object.freeze({4:'step-number',5:'step-number',6:'step-number',7:'step-punctuation',8:'step-number',
  9:'instruction',13:'instruction',17:'emphasis-term',18:'emphasis-term',20:'instruction',23:'emphasis-term',24:'instruction'});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const normal = text => text.replace(/\r\n?/g, '\n');
const readPin = (file, expected) => {
  const full = path.resolve(file), a = fs.lstatSync(full,{bigint:true});
  assert(a.isFile() && !a.isSymbolicLink() && fs.realpathSync(full) === full, `physical regular file required: ${full}`);
  const bytes = fs.readFileSync(full), b = fs.lstatSync(full,{bigint:true});
  for (const key of ['dev','ino','size','mtimeNs','ctimeNs']) assert.equal(a[key],b[key],`unstable input: ${full}`);
  if (expected?.bytes !== undefined) assert.equal(bytes.length,expected.bytes,`byte drift: ${full}`);
  if (expected?.sha256) assert.equal(sha(bytes),expected.sha256,`hash drift: ${full}`);
  return {bytes,pin:{path:full.startsWith(`${ROOT}/`)?path.relative(ROOT,full):full,bytes:bytes.length,sha256:sha(bytes)}};
};
const replaceOne = (text, before, after) => {
  assert.equal(text.split(before).length,2,`one marker required: ${before.slice(0,50)}`);
  return text.replace(before,after);
};
const literal = node => {
  if (node?.type === 'Literal') return node.value;
  if (node?.type === 'UnaryExpression' && node.operator === '-') return -literal(node.argument);
  if (node?.type === 'ArrayExpression') return node.elements.map(literal);
  throw Error('literal FFDec placement geometry required');
};
function visit(node, callback, scope={}) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'FunctionDeclaration') scope={...scope, function:node.id.name};
  if (node.type === 'SwitchCase') scope={...scope, frame:node.test?.value};
  if (node.type) callback(node,scope);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(item=>visit(item,callback,scope));
    else if (value && typeof value === 'object') visit(value,callback,scope);
  }
}
function getDefinitions(html) {
  const start=html.indexOf('var scalingGrids = {};'), end=html.indexOf('\nvar frame = -1;');
  assert(start>=0 && end>start);
  return html.slice(start,end);
}
function sourceCatalog(source) {
  const catalog=collectSwfTextSourceCatalog(source.bytes);
  assert.equal(catalog.sourceSha256,SOURCE_SHA);
  assert.deepEqual(catalog.header.stageBoundsTwips,{left:0,right:16000,top:0,bottom:12000});
  assert.equal(catalog.header.frameRate,12);assert.equal(catalog.header.frameCount,10);
  assert.equal(catalog.summary.unresolvedRuns,0);assert.equal(catalog.summary.unparsedTags,0);
  assert.equal(catalog.summary.staticTextDefinitions,12);assert.equal(catalog.summary.dynamicFields,1);
  const root=catalog.timelines.find(item=>item.timelineId==='root');
  const child=catalog.timelines.find(item=>item.timelineId==='sprite-26');
  assert(root && child && child.declaredFrameCount===351);
  const placed=root.instances.find(item=>item.characterId===26 && item.firstFrame===6);
  assert(placed && root.events.find(event=>event.eventId===placed.createdByEventId)?.matrix?.join(',')==='1.0000457763671875,0,0,1,8248,5666');
  assert.deepEqual(catalog.buttonDefinitions.map(item=>item.characterId),[15,16,22]);
  return {catalog,root,child};
}
function textIr(catalog,child) {
  const defs=catalog.textDefinitions.filter(item=>item.kind==='static-text');
  assert.deepEqual(defs.map(item=>item.characterId),Object.keys(ROLE).map(Number));
  const selected=child.instances.filter(item=>defs.some(def=>def.characterId===item.characterId));
  const poses=sourcePoseSegments(child,selected);
  const definitions=defs.map(item=>({characterId:item.characterId,sourceTextId:item.sourceTextId,
    sourceTagOffset:item.sourceTagOffset,sourceTagSha256:item.sourceTagSha256,role:ROLE[item.characterId],
    boundsTwips:item.boundsTwips,matrix:item.matrix,runs:item.runs.map(run=>({sourceTextId:run.sourceTextId,
      text:run.text,decodeStatus:run.decodeStatus,fontId:run.fontId,fontHeightTwips:run.fontHeightTwips,
      colorRgba:run.colorRgba,xOffsetTwips:run.xOffsetTwips,yOffsetTwips:run.yOffsetTwips,
      glyphs:run.glyphs.map(glyph=>({unicode:glyph.unicode,index:glyph.index,advanceTwips:glyph.advanceTwips}))}))}));
  return {schemaVersion:1,kind:'nms-l02-ts-p055-source-static-text-v1',animationId:ID,
    sourceSwfSha256:SOURCE_SHA,frameDomain:'sprite-26',frameCount:351,
    definitions,instances:selected.map(item=>({instanceId:item.instanceId,characterId:item.characterId,
      depth:item.depth,firstFrame:item.firstFrame,lastFrameExclusive:item.lastFrameExclusive,
      poseSegments:poses.get(item.instanceId),sourcePlacementEvents:item.updates.map(id=>{
        const event=child.events.find(e=>e.eventId===id);assert(event);
        return {eventId:id,frame:event.frame,sourceTagOffset:event.sourceTagOffset,
          sourceTagSha256:event.sourceTagSha256,matrix:event.matrix??null,
          colorTransform:event.colorTransform??null,visible:event.visible??null};
      })})),
    retainedDynamicFields:catalog.textDefinitions.filter(item=>item.kind==='dynamic-field').map(item=>({
      characterId:item.characterId,sourceTagSha256:item.sourceTagSha256,initialText:item.initialText,
      runtimeValueResolved:item.runtimeValueResolved,reason:'dynamic value and original-runtime drawing unresolved'})),
    titleOutline:{characterId:1,classification:'source-outline-retained; text not recovered from glyph table'},
    language:{sourceVisual:'en',spanishTranslationStatus:'not-extracted-or-asserted'},
    claimBoundary:{sourceStructuralOnly:true,originalRuntimeAccepted:false,visualFidelityAccepted:false,
      audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false}};
}
function prepareFramesHtml(raw) {
  let html=normal(raw);
  const start='function sprite26(ctx,ctrans,frame,ratio,time){\n\tvar clips = [];';
  html=replaceOne(html,start,'function sprite26(ctx,ctrans,frame,ratio,time){\n\tctx.save();\n\tctx.transform(1,0,0,1,0,0);\n\tvar clips = [];');
  const defs=getDefinitions(html),ast=parse(defs,{ecmaVersion:2020});
  const sprite=ast.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='sprite26');
  assert(sprite);
  const body=defs.slice(sprite.start,sprite.end);
  assert(body.endsWith('\n\t}\n}'));
  html=replaceOne(html,body,body.slice(0,-2)+'\tctx.restore();\n}');
  const pushes=Array.from({length:10},(_,i)=>`frames.push(${i});`).join('\n');
  const all=Array.from({length:351},(_,i)=>`frames.push(${i});`).join('\n');
  html=replaceOne(html,pushes,all);
  return html;
}
function canvasCandidate(inputs,source,parsed,ir) {
  const frames=prepareFramesHtml(inputs.frames.bytes.toString('utf8'));
  const definitions=getDefinitions(frames),ast=parse(definitions,{ecmaVersion:2020});
  const functions=ast.body.filter(node=>node.type==='FunctionDeclaration').map(node=>node.id.name);
  const placed=[...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/g)].map(m=>m[1]))].sort();
  const fonts=functions.filter(name=>/^font\d+$/.test(name));
  const sourceRootCall='place("sprite26",canvas,ctx,[0.05000228881835937,0.0,0.0,0.05,412.4,283.3],ctrans,1,(0+time)%351,5,time);';
  assert(definitions.includes(sourceRootCall));
  const sourceTitleCall='place("shape1",canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);';
  assert(definitions.includes(sourceTitleCall));
  const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
    classification:'unregistered-source-only-vector-and-native-text-candidate',title:'NMS L2 P055 source graphics',
    source:{swf:SOURCE,swfBytes:source.bytes.length,swfSha256:SOURCE_SHA},
    evidence:{scenarioInventorySha256:sha(json({animationId:ID,scenario:'source-static-frame'})),
      audioAuditSha256:sha(json({sourceAudio:'separate-audit-unaccepted'}))},
    ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1',helperSha256:inputs.helper.pin.sha256,
      framesHtmlSha256:inputs.frames.pin.sha256,targetSpriteObjectId:26,targetSpriteFunction:'sprite26',
      exportCanvas:{width:800,height:600},exportInternalTranslation:{x:0,y:0},
      expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
      expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
      embeddedImageVariableCount:0,embeddedImageVariablesSha256:sha('[]')},
    timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
      root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',placementName:'animation',
        placementTwips:{x:8248,y:5666},placementPixels:{x:412.4,y:283.3}},
      local:{timelineId:'sprite-26',frameCount:351,playbackMode:'state-explorer',publicFrameIndexing:'one-indexed',
        originalTerminalStopEstablished:false},stageRenderOffset:{x:412.4,y:283.3}},
    runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],defaultScenario:'source-static-frame',
      supportedLanguages:['en'],seedMapping:'uint32 inspection metadata; no source random execution',
      blockedLocalFrameRanges:[],currentCanonicalFrameDomainDispositionAsserted:false,
      unresolved:['Source glossary actions and missing L2 key-term bodies are not included.',
        'Dynamic text character 11 is retained without resolved runtime value.',
        'Audio transport and terminal playback remain unverified.',
        'Source Canvas and native text have no original-runtime visual acceptance.']},
    output:{script:`${OUT}/canvas-renderer.js`,manifest:`${OUT}/source-native-visual-receipt.json`,globalRegistry:'HELP_MATH_CANVAS_ASSETS'}};
  const built=buildSafeRuntime({helperSource:normal(inputs.helper.bytes.toString('utf8')),framesHtml:frames,spec,scale:2});
  let runtime=built.runtime;
  runtime=replaceOne(runtime,'ctx.transform(1, 0, 0, 1, 412.4, 283.3);\n        sprite26(',
    `place("shape1",canvas,ctx,[0.05,0,0,0.05,0,0],new cxform(0,0,0,0,255,255,255,255),1,0,0,0);\n        ctx.transform(0.05000228881835937, 0, 0, 0.05, 412.4, 283.3);\n        sprite26(`);
  runtime=runtime.split(JSON.stringify(spec.animationId)).join(JSON.stringify(ID));
  const original={...built.metadata,animationId:ID};
  const metadata={...original,sourceOnly:true,nativeTextAvailable:true,nativeTextSuppressionAvailable:true,
    nativeTextIr:`${OUT}/source-text-ir.json`,sourceVisualLanguage:'en',spanishVisualTranslationEstablished:false,
    sourceRootScale:[0.05000228881835937,0.05],sourceTitleOutlineRetained:true,
    dynamicTextUnresolved:true,audioPlaybackEnabled:false,glossaryBehaviorEnabled:false,
    originalRuntimeAccepted:false,fidelityAccepted:false,audioAccepted:false,humanAccepted:false,
    ownerAccepted:false,strictComplete:false,published:false};
  runtime=replaceOne(runtime,`var METADATA = deepFreeze(${JSON.stringify(original,null,2)});`,
    `var METADATA = deepFreeze(${JSON.stringify(metadata,null,2)});`);
  const activeByFrame=Array.from({length:351},(_,index)=>ir.instances.filter(item=>index+1>=item.firstFrame&&index+1<item.lastFrameExclusive));
  const parsedRuntime=parse(runtime,{ecmaVersion:2020}),edits=[],observed=Array.from({length:351},()=>[]);
  visit(parsedRuntime,(node,scope)=>{
    if(node.type!=='CallExpression'||node.callee.name!=='place'||scope.function!=='sprite26'||!Number.isInteger(scope.frame))return;
    const name=literal(node.arguments[0]);if(!/^text\d+$/.test(name))return;
    const frame=scope.frame+1,characterId=Number(name.slice(4));
    if(characterId===11)return;
    const matching=activeByFrame[frame-1].filter(item=>item.characterId===characterId);
    assert.equal(matching.length,1,`${name} instance ambiguity at frame ${frame}`);
    const item=matching[0],pose=item.poseSegments.find(seg=>frame>=seg.firstFrame&&frame<seg.lastFrameExclusive);
    assert(pose);assert.deepEqual(literal(node.arguments[3]),pose.pose.matrix,
      `${name} source/Canvas matrix mismatch at frame ${frame}`);
    edits.push({start:node.start,end:node.end,text:`NATIVE_TEXT.place(${JSON.stringify(item.instanceId)},${frame},()=>${runtime.slice(node.start,node.end)})`});
    observed[frame-1].push(item.instanceId);
  });
  for(let index=0;index<351;index++)assert.deepEqual(observed[index].sort(),activeByFrame[index].map(i=>i.instanceId).sort(),
    `native text call closure frame ${index+1}`);
  for(const edit of edits.sort((a,b)=>b.start-a.start))runtime=runtime.slice(0,edit.start)+edit.text+runtime.slice(edit.end);
  const transaction=`\nvar NATIVE_TEXT = (function(){\n    var active = null;\n    return {\n        place: function(id,frame,draw){\n            if (!active) return draw();\n            if (active.frame !== frame || !active.requested.has(id) || active.seen.has(id)) throw Error("native text placement mismatch: " + id);\n            active.seen.add(id); return undefined;\n        },\n        begin: function(frame,ids){\n            if (active) throw Error("native text transaction already active");\n            active = {frame:frame,requested:new Set(ids),seen:new Set()};\n        },\n        end: function(){ var result=active;active=null;return result; }\n    };\n})();\n`;
  runtime=replaceOne(runtime,'var canvas = null;\n',`var canvas = null;${transaction}`);
  const frameIds=activeByFrame.map(items=>items.map(item=>item.instanceId));
  const renderWithText=`\nvar NATIVE_TEXT_FRAME_IDS = ${JSON.stringify(frameIds)};\nfunction renderWithText(targetCanvas,request){\n    if (!request || request.frameDomain !== "sprite-26" || request.rootFrame !== 6 || request.scenario !== "source-static-frame" || request.lang !== "en" || request.seed !== 0 || !Number.isInteger(request.frame) || request.frame < 1 || request.frame > 351) throw Error("unsupported native text source context");\n    var ids = request.text && request.text.suppressInstanceIds;\n    var expected = NATIVE_TEXT_FRAME_IDS[request.frame-1];\n    if (!Array.isArray(ids) || ids.length !== expected.length || new Set(ids).size !== ids.length || ids.some(function(id){return expected.indexOf(id)<0;})) throw Error("native text suppression must match exact active source instances");\n    NATIVE_TEXT.begin(request.frame,ids);\n    var seen;\n    try {\n        var state = render(targetCanvas,{frame:request.frame,frameDomain:request.frameDomain,rootFrame:request.rootFrame,scenario:request.scenario,lang:request.lang,seed:request.seed});\n        seen=NATIVE_TEXT.end();\n        if (seen.seen.size !== expected.length) throw Error("native text source placement missing");\n        return {state:state,suppressedInstanceIds:Array.from(seen.seen),unfulfilledSuppressionIds:[]};\n    } finally { if (!seen) NATIVE_TEXT.end(); }\n}\n`;
  runtime=replaceOne(runtime,'\nvar registry = global[',`${renderWithText}\nvar registry = global[`);
  runtime=replaceOne(runtime,'resolveFrameState: resolveFrameState, render: render});',
    'resolveFrameState: resolveFrameState, render: render, renderWithText: renderWithText});');
  new Script(runtime);const box=createContext({});new Script(runtime).runInContext(box,{timeout:3000});
  const asset=box.HELP_MATH_CANVAS_ASSETS?.[ID];assert(asset&&asset.renderWithText&&asset.metadata.sourceSwfSha256===SOURCE_SHA);
  for(const frame of [1,84,145,216,351])assert.equal(asset.resolveFrameState({frame,frameDomain:'sprite-26',rootFrame:6,
    scenario:'source-static-frame',lang:'en',seed:0}).localFrame,frame);
  return {runtime,metadata,spec,placed,fonts,wrappedCalls:edits.length,frameIds};
}
export function prepareNmsL02TsNativeVisual(mode='--check') {
  assert(['--write','--check','--dry-run'].includes(mode));
  const source=readPin(SOURCE,{bytes:149059,sha256:SOURCE_SHA});
  const inputs=Object.fromEntries(Object.entries(RAW).map(([key,pin])=>[key,readPin(path.join(ROOT,pin.path),pin)]));
  const parsed=sourceCatalog(source),ir=textIr(parsed.catalog,parsed.child);
  const candidate=canvasCandidate(inputs,source,parsed,ir);
  const artifacts=new Map([
    [`${OUT}/text-catalog.json`,json(parsed.catalog)],
    [`${OUT}/source-text-ir.json`,json(ir)],
    [`${OUT}/canvas-renderer.js`,candidate.runtime],
    [`${OUT}/runtime-meta.json`,json(candidate.metadata)],
    [`${OUT}/adapter-spec.json`,json(candidate.spec)],
  ]);
  const receipt={schemaVersion:1,kind:'nms-l02-ts-p055-source-native-visual-v1',animationId:ID,
    source:source.pin,rawInputs:Object.values(inputs).map(item=>item.pin),
    generator:readPin(SCRIPT).pin,sharedBuilder:readPin(path.join(ROOT,'scripts/build-safe-ffdec-canvas-adapter.mjs')).pin,
    textParser:readPin(path.join(ROOT,'scripts/lib/swf-text-source-catalog.mjs')).pin,
    reusedPoseHelper:readPin(path.join(ROOT,'scripts/build-g678-alg-l12-glossary-pair-native-text.mjs')).pin,
    rawExportCommands:['swfmill swf2xml <source.swf> raw/movie.xml',
      'ffdec -onerror abort -timeout 120 -exportTimeout 600 -format sprite:canvas,frame:canvas,text:formatted -export sprite,frame,text raw/ffdec <source.swf>'],
    ffdecVersion:'26.2.1',sourceStage:'800x600',fps:12,rootBeginFrame:6,frameDomain:'sprite-26',frameCount:351,
    sourceButtons:[{characterId:15,key:'Restate',firstFrame:84},{characterId:16,key:'Question',firstFrame:84},
      {characterId:22,key:'Problem',firstFrame:145}],
    staticTextDefinitions:ir.definitions.length,staticTextInstances:ir.instances.length,
    wrappedSourceTextCalls:candidate.wrappedCalls,dynamicFieldsRetained:ir.retainedDynamicFields.map(item=>item.characterId),
    outputs:[...artifacts].map(([file,bytes])=>({path:file,bytes:Buffer.byteLength(bytes),sha256:sha(bytes)})),
    registered:false,sourceActionScriptExecuted:false,glossaryContentResolved:false,audioAccepted:false,
    originalRuntimeAccepted:false,visualFidelityAccepted:false,humanAccepted:false,ownerAccepted:false,
    strictComplete:false,published:false};
  artifacts.set(`${OUT}/source-native-visual-receipt.json`,json(receipt));
  if(mode==='--write'){
    for(const file of artifacts.keys())assert(!fs.existsSync(path.join(ROOT,file)),`refuse overwrite: ${file}`);
    for(const [file,body] of artifacts){const full=path.join(ROOT,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,body,{flag:'wx'});}
  } else if(mode==='--check'){
    for(const [file,body] of artifacts)assert.deepEqual(readPin(path.join(ROOT,file)).bytes,Buffer.from(body),`generated drift: ${file}`);
  }
  return {status:mode==='--write'?'SOURCE_NATIVE_VISUAL_WRITTEN_UNREGISTERED':mode==='--check'?'SOURCE_NATIVE_VISUAL_VERIFIED_UNREGISTERED':'SOURCE_NATIVE_VISUAL_INPUTS_VERIFIED',
    animationId:ID,sourceSwfSha256:SOURCE_SHA,frameCount:351,staticTextInstances:ir.instances.length,
    wrappedSourceTextCalls:candidate.wrappedCalls,runtimeSha256:sha(candidate.runtime),registered:false,acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
  try{assert.equal(process.argv.length,3,'usage: node prepare-nms-l02-ts-native-visual.mjs --write|--check|--dry-run');
    process.stdout.write(json(prepareNmsL02TsNativeVisual(process.argv[2])));
  }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
