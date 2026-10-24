#!/usr/bin/env node
/** Source-bound P013 drawing plane; registration and interaction are separate gates. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {gunzipSync} from 'node:zlib';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p013';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB04.swf';
const SWF_SHA='1be47750557385ef91c648fb87fdcde642d342caadc35da7a1f7a2d1fdb11d35';
const AUDIT=`migrations/${ID}/audit`;
const OUT='output/alg-l06-p013-canvas-v1';
const GENERATED='packages/demos/src/generated/alg-l06-p013-canvas-v1.ts';
const PIN=Object.freeze({
  sourceAudit:{path:`${AUDIT}/source-v1/source-audit-v1.json`,sha256:'ec5707528c5ebc3f0992aec542c6eace1a3eebaa8256cc3d5aebfc7f037078af'},
  sourceText:{path:`${AUDIT}/source-v1/source-text-v1.json`,sha256:'0556f2663d67760f7e359a91b15e2711285f08774a0cafd58449ad68387260c1'},
  composition:{path:`${AUDIT}/source-v1/source-composition-v1.json`,sha256:'9882183b44543dfbd2615e15cd204f91e1e5e7928b3e99e0a15b298baa17b637'},
  xml:{path:`${AUDIT}/source-v1/swfmill-v1.xml.gz`,sha256:'4b4bcb2d1a9f2d929a8650a61491beed58149ffd8b63418e4a30dd0271aae369'},
  exportReceipt:{path:`${AUDIT}/canvas-v1/extraction-receipt.json`},
  helper:{path:`${AUDIT}/canvas-v1/sprites/DefineSprite_140/canvas.js`,sha256:'78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  frames:{path:`${AUDIT}/canvas-v1/sprites/DefineSprite_140/frames.html`,sha256:'202f3f427a471826b3c44bf060c6fe7744fa85cd1d06ea736bad4eee555bb4c5'},
  rootFrames:{path:`${AUDIT}/canvas-v1/frames/frames.html`,sha256:'f775501ae4f1d3b4fbf3c7e8fd37fc6366b54df685ed9aef05b5677580b01a0a'},
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);

function readPinned(root,pin){
  const file=path.resolve(root,pin.path);
  assert(file.startsWith(`${root}${path.sep}`)&&realpathSync(file)===file,`physical scoped file: ${pin.path}`);
  const before=lstatSync(file,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file: ${pin.path}`);
  const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
  for(const key of ['dev','ino','size','mtimeNs','nlink'])assert.equal(before[key],after[key],`stable file: ${pin.path}`);
  if(pin.bytes!==undefined)assert.equal(bytes.length,pin.bytes,`size drift: ${pin.path}`);
  if(pin.sha256)assert.equal(sha(bytes),pin.sha256,`SHA drift: ${pin.path}`);
  return bytes;
}
function replaceOnce(source,needle,replacement,label){
  const at=source.indexOf(needle);
  assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
  return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function extractFunction(source,name,next){
  const start=source.indexOf(`function ${name}(`);
  const end=source.indexOf(`\nfunction ${next}(`,start);
  assert(start>=0&&end>start&&source.indexOf(`function ${name}(`,start+1)<0,`unique source function ${name}`);
  return source.slice(start,end).trimEnd();
}

export function buildP013Canvas(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
  assert.equal(realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source root');
  readPinned(SOURCE_ROOT,{path:SWF,bytes:269912,sha256:SWF_SHA});
  const inputs=Object.fromEntries(Object.entries(PIN).map(([key,pin])=>[key,readPinned(ROOT,pin)]));
  const audit=JSON.parse(inputs.sourceAudit),composition=JSON.parse(inputs.composition);
  const sourceText=JSON.parse(inputs.sourceText),exportReceipt=JSON.parse(inputs.exportReceipt);
  assert.equal(audit.kind,'alg-l06-p013-source-audit-v1');
  assert.equal(audit.source.sha256,SWF_SHA);
  assert.deepEqual(audit.runtime.domains.map(d=>[d.domainId,d.declaredFrames]),[['root',10],['sprite-140',372]]);
  assert.equal(audit.runtime.header.stage.width,800);
  assert.equal(audit.runtime.header.stage.height,600);
  assert.equal(audit.runtime.header.fps,12);
  assert.equal(audit.runtime.background,'#b8d8f7');
  assert.equal(composition.main.domainId,'sprite-140');
  assert.equal(composition.main.rootEntryFrame,6);
  assert.deepEqual(composition.main.masks,[
    {frame:258,depth:5,clipDepth:10,characterId:127},
    {frame:297,depth:11,clipDepth:16,characterId:127},
  ]);
  assert.deepEqual(composition.main.morphCharacterIds,[10,11,12,13,14]);
  assert.deepEqual(composition.main.buttonInstances.map(b=>[b.characterId,b.key,b.firstFrame,b.depth]),
    [[131,'Input',258,8],[137,'Output',297,14]]);
  assert.equal(exportReceipt.source.sha256,SWF_SHA);
  assert.equal(exportReceipt.files.length,6);
  for(const pin of exportReceipt.files)readPinned(ROOT,pin);
  const xml=gunzipSync(inputs.xml).toString();
  assert(xml.includes('<DefineSprite objectID="140" frames="372">'));
  assert.equal((xml.match(/<PlaceObject2 replace="0" depth="(?:5|11)" objectID="127" clipDepth="(?:10|16)">/gu)??[]).length,2);
  const rootPlaces=composition.root.events.filter(e=>e.frame===6&&e.kind==='place');
  assert.deepEqual(rootPlaces.map(e=>[e.depth,e.characterId,...e.matrix.slice(4)]),
    [[1,1,0,0],[2,140,8248,5666]]);
  assert.equal(rootPlaces[1].name.text,'animation');

  const frames=inputs.frames.toString().replace(/\r\n?/gu,'\n');
  const root=inputs.rootFrames.toString().replace(/\r\n?/gu,'\n');
  const canvas=frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header=frames.match(/function sprite140\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas&&header);
  assert.deepEqual([+canvas[1],+canvas[2],+header[1],+header[2],+header[3]],[1140,384,826.45,174.35,372]);
  const definitions=frames.slice(0,frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length>0,'FFDec definitions boundary');
  const placed=[...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m=>m[1]))].sort();
  const fonts=[...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
  const images=[...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(m=>m[1]);
  const textNames=[...new Set([...definitions.matchAll(/function\s+(text\d+)\(ctx,ctrans,frame,ratio,time\)\{/gu)].map(m=>m[1]))].sort();
  assert.deepEqual(textNames.map(n=>Number(n.slice(4))).sort((a,b)=>a-b),
    sourceText.textDefinitions.map(d=>d.characterId).sort((a,b)=>a-b));
  assert.deepEqual(fonts,['font2','font3','font132']);
  assert.deepEqual(images,['imageObj8']);
  assert.equal(placed.length,133);
  assert.deepEqual(placed.filter(n=>n.startsWith('morphshape')),
    ['morphshape10','morphshape11','morphshape12','morphshape13','morphshape14']);
  assert.deepEqual(placed.filter(n=>n.startsWith('button')),['button131','button137']);
  const rootBlock=root.slice(root.indexOf('function main('));
  const frameSix=rootBlock.slice(rootBlock.indexOf('case 5:'),rootBlock.indexOf('case 6:'));
  const rootLines=frameSix.split('\n').filter(line=>/place\("(?:shape1|sprite140)"/u.test(line));
  assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),['shape1','sprite140']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,412.4,283.3]'));
  const rootShape=extractFunction(root,'shape1','font2');
  assert(rootShape.includes('drawPath(ctx,pathData')&&rootShape.length>18000,'root depth-1 source artwork');

  const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
    classification:'unregistered-source-bound-canvas-candidate-v1',
    source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SWF}`,swfSha256:SWF_SHA},
    evidence:{scenarioInventory:PIN.sourceAudit.path,scenarioInventorySha256:PIN.sourceAudit.sha256,
      audioAudit:PIN.sourceAudit.path,audioAuditSha256:PIN.sourceAudit.sha256},
    ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper:PIN.helper.path,helperSha256:PIN.helper.sha256,framesHtml:PIN.frames.path,
      framesHtmlSha256:PIN.frames.sha256,targetSpriteObjectId:140,
      targetSpriteFunction:'sprite140',exportCanvas:{width:1140,height:384},
      exportInternalTranslation:{x:826.45,y:174.35},expectedPlacedFunctionCount:placed.length,
      expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),expectedFontFunctionCount:fonts.length,
      expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),embeddedImageVariableCount:images.length,
      embeddedImageVariablesSha256:sha(JSON.stringify(images))},
    timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
      root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
        placementName:'animation',placementTwips:{x:8248,y:5666},
        placementPixels:{x:412.4,y:283.3}},
      local:{timelineId:'sprite-140',frameCount:372,livePlaybackEndFrame:372,
        playbackMode:'once',publicFrameIndexing:'one-indexed'},
      stageRenderOffset:{x:-414.05,y:108.95}},
    runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
      defaultScenario:'source-static-frame',supportedLanguages:['en'],
      visualLocalization:'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping:'fixed-zero-no-source-randomness-executed',blockedLocalFrameRanges:[],
      currentCanonicalFrameDomainDispositionAsserted:false,
      unresolved:['Original Flash playback and host terminal frame remain unobserved.',
        'Input/Output glossary controls and the continuous audio clock require separate integration.',
        'This drawing is not original-runtime or visual-fidelity acceptance.']},
    output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',spec:'adapter-spec.json',
      globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
  let runtime=buildSafeRuntime({helperSource:inputs.helper.toString(),framesHtml:frames,spec}).runtime;
  runtime=normalizeSourceClipMasks(runtime,[{characterId:127,
    placements:[{depth:5,clipDepth:10},{depth:11,clipDepth:16}],
    rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,1]));'}],xml);
  runtime=runtime.replaceAll(`course-${ID}`,ID);
  assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
  runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootShape}\n\nSAFE_OBJECTS = Object.freeze({`,'source root shape');
  runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "shape1": shape1,\n','source root object registry');
  const oldDraw='ctx.transform(1, 0, 0, 1, -414.05, 108.95);\n        sprite140(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
  const rootBefore='var ctrans = new cxform(0,0,0,0,255,255,255,255);\n'
    +`        var time = state.exportFrame;\n        ${rootLines[0].trim()}\n        `;
  runtime=replaceOnce(runtime,oldDraw,rootBefore+oldDraw,'stage root depth-1 artwork');
  assert(runtime.includes('"morphshape10": morphshape10'));
  assert(runtime.includes('"button131": button131'));
  assert(runtime.includes('"button137": button137'));
  assert(runtime.includes('"text139": text139'));
  new Script(runtime);
  const script=Buffer.from(runtime);
  const sourceGlyphRendering={definitions:9,rootVectorArtwork:true,nativeBinding:'semantic-flow-companion'};
  const sourceDepthOrder=rootPlaces.map(e=>({depth:e.depth,characterId:e.characterId}));
  const ts=Buffer.from(`/* Generated by scripts/build-alg-l06-p013-canvas-v1.mjs. Do not edit. */\n`
    +`export const P013_CANVAS_V1 = ${JSON.stringify({animationId:ID,sourceSwfSha256:SWF_SHA,
      stage:{width:800,height:600},fps:12,rootFrame:6,frameDomain:'sprite-140',
      frameCount:372,scenario:'source-static-frame',visualLocalization:'source-en-fallback',
      sourceGlyphRendering,sourceDepthOrder,
      sourceClipMask:{characterId:127,placements:composition.main.masks.map(({frame,depth,clipDepth})=>({frame,depth,clipDepth}))},
      sourceMorphCharacterIds:composition.main.morphCharacterIds,
      sourceGlossaryButtons:composition.main.buttonInstances.map(({characterId,key,firstFrame,depth})=>({characterId,key,firstFrame,depth})),
      embeddedImageVariable:'imageObj8',stageRenderOffset:{x:-414.05,y:108.95},
      assetPath:'/flash-assets/g678-local/shared-alg001-l06-p013/canvas-renderer.js',
      assetSha256:sha(script)},null,2)} as const;\n`);
  const manifest=json({schemaVersion:1,kind:'alg-l06-p013-maintained-canvas-v1',animationId:ID,
    status:'unregistered-drawing-candidate',source:{path:SWF,bytes:269912,sha256:SWF_SHA},
    rootFrame:6,mainFrameCount:372,stage:{width:800,height:600},sourceDepthOrder,
    sourceGlyphRendering,sourceMorphCharacterIds:composition.main.morphCharacterIds,
    sourceGlossaryButtons:composition.main.buttonInstances.map(({characterId,key,firstFrame,depth})=>({characterId,key,firstFrame,depth})),
    sourceMaskNormalization:{characterId:127,placements:composition.main.masks.map(({frame,depth,clipDepth})=>({frame,depth,clipDepth})),rawColor:[0,0,204,1]},
    inputs:Object.entries(PIN).map(([key,pin])=>({key,path:pin.path,
      bytes:inputs[key].length,sha256:sha(inputs[key])})),
    outputs:[{path:`${OUT}/canvas-renderer.js`,bytes:script.length,sha256:sha(script)},
      {path:GENERATED,bytes:ts.length,sha256:sha(ts)}],
    acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
      listening:false,human:false,owner:false,strictComplete:false,publication:false}});
  return {runtime:script,metadata:ts,manifest};
}

function main(){
  const mode=process.argv[2];
  assert(process.argv.length===3&&['--build','--check'].includes(mode),
    'usage: build-alg-l06-p013-canvas-v1.mjs --build|--check');
  const built=buildP013Canvas();
  if(mode==='--build')mkdirSync(path.join(ROOT,OUT),{recursive:true});
  const files=[[`${OUT}/canvas-renderer.js`,built.runtime],
    [GENERATED,built.metadata],[`${OUT}/canvas-manifest.json`,built.manifest]];
  for(const [name,bytes] of files){
    const target=path.join(ROOT,name);
    if(mode==='--check')assert(readFileSync(target).equals(bytes),`${name} drifted`);
    else try{writeFileSync(target,bytes,{flag:'wx'});}catch(error){
      if(error.code!=='EEXIST')throw error;
      assert(readFileSync(target).equals(bytes),`${name} drifted`);
    }
  }
  console.log(JSON.stringify({status:mode==='--check'?'verified':'built',
    files:files.map(([path,bytes])=>({path,bytes:bytes.length,sha256:sha(bytes)}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
