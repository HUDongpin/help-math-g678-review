#!/usr/bin/env node
/** Source-bound P010 art plane with original glyph and root depth composition. */
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
const ID='shared-alg001-l06-p010';
const SWF='G6-G8-shared/ALG001/L6/RW/L6RW09.swf';
const SWF_SHA='96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14';
const AUDIT=`migrations/${ID}/audit`;
const OUT=`output/alg-l06-p010-canvas-v1`;
const GENERATED='packages/demos/src/generated/alg-l06-p010-canvas-v1.ts';
const PIN=Object.freeze({
  sourceAudit:{path:`${AUDIT}/source-v1/source-audit-v1.json`,sha256:'14a34b6527a77dc374f650ccad9f7bd9e4c1c8bc6e23198f93eb2a82e6f7de64'},
  sourceText:{path:`${AUDIT}/source-v1/source-text-v1.json`,sha256:'00d72eb17335d6e2b23ed89c160c7d68d203ddbfa3596c45bced0cb7d22fbaa9'},
  composition:{path:`${AUDIT}/source-v1/source-composition-v1.json`,sha256:'a208678fbb7602aea0decaa2cab110d4f687a11f685e32db8bf67a9fc55ee033'},
  xml:{path:`${AUDIT}/source-v1/swfmill-v1.xml.gz`,sha256:'9ab536d69faf0ce3e831a57fc91f81f0983d88434d0b42fe1af016f4f4c81e88'},
  exportReceipt:{path:`${AUDIT}/canvas-v1/extraction-receipt.json`},
  helper:{path:`${AUDIT}/canvas-v1/sprites/DefineSprite_52/canvas.js`,sha256:'78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
  frames:{path:`${AUDIT}/canvas-v1/sprites/DefineSprite_52/frames.html`,sha256:'64903606d6e998df2e5102f55095344078edf2366bcc123e01aa687b3db62b47'},
  rootFrames:{path:`${AUDIT}/canvas-v1/frames/frames.html`,sha256:'316864514e7446f81694c494a1753e52cd1855ffc799bd052caf6e9b79684969'},
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
  const end=source.indexOf(next?`\nfunction ${next}(`:'\nvar frame = -1;',start);
  assert(start>=0&&end>start&&source.indexOf(`function ${name}(`,start+1)<0,`unique source function ${name}`);
  return source.slice(start,end).trimEnd();
}

export function buildP010Canvas(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
  assert.equal(realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source root');
  readPinned(SOURCE_ROOT,{path:SWF,bytes:114334,sha256:SWF_SHA});
  const inputs=Object.fromEntries(Object.entries(PIN).map(([key,pin])=>[key,readPinned(ROOT,pin)]));
  const audit=JSON.parse(inputs.sourceAudit),composition=JSON.parse(inputs.composition);
  const sourceText=JSON.parse(inputs.sourceText);
  const exportReceipt=JSON.parse(inputs.exportReceipt);
  assert.equal(audit.kind,'alg-l06-p010-source-audit-v1');
  assert.equal(audit.source.sha256,SWF_SHA);
  assert.deepEqual(audit.frameDomains.map(d=>[d.domainId,d.declaredFrames]),
    [['root',10],['sprite-52',303],['sprite-55',1]]);
  assert.equal(composition.main.domainId,'sprite-52');
  assert.equal(composition.main.rootEntryFrame,6);
  assert.equal(exportReceipt.source.sha256,SWF_SHA);
  assert.equal(exportReceipt.files.length,8);
  for(const pin of exportReceipt.files)readPinned(ROOT,pin);
  const xml=gunzipSync(inputs.xml).toString();
  assert(xml.includes('<DefineSprite objectID="52" frames="303">'));
  assert(xml.includes('<PlaceObject2 replace="0" depth="30" objectID="47" clipDepth="33">'));
  assert(xml.includes('<Color red="184" green="216" blue="247"/>'));
  const rootPlaces=composition.root.events.filter(e=>e.frame===6&&e.kind==='place');
  assert.deepEqual(rootPlaces.map(e=>[e.depth,e.characterId,...e.matrix.slice(4)]),
    [[1,52,7390,5060],[51,53,2867,-3700],[52,55,8000,879],[54,56,0,0]]);
  assert.equal(rootPlaces[0].name.text,'animation');
  assert.equal(rootPlaces[2].name.text,'Mc_Page_Title');

  const frames=inputs.frames.toString().replace(/\r\n?/gu,'\n');
  const root=inputs.rootFrames.toString().replace(/\r\n?/gu,'\n');
  const canvas=frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header=frames.match(/function sprite52\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas&&header);
  assert.deepEqual([+canvas[1],+canvas[2],+header[1],+header[2],+header[3]],[585,348,248.95,139,303]);
  const definitions=frames.slice(0,frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length>0,'FFDec definitions boundary');
  const placed=[...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m=>m[1]))].sort();
  const fonts=[...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
  const images=[...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);/gu)].map(m=>m[1]);
  const textNames=[...new Set([...definitions.matchAll(/function\s+(text\d+)\(ctx,ctrans,frame,ratio,time\)\{/gu)].map(m=>m[1]))].sort();
  assert.equal(textNames.length,41,'41 main text definitions; root text53 is separate');
  assert.equal(fonts.length,3);
  assert.equal(images.length,0);
  assert.equal(placed.length,47);
  assert.deepEqual(textNames.map(n=>Number(n.slice(4))).sort((a,b)=>a-b),
    sourceText.textDefinitions.map(d=>d.characterId).filter(id=>id!==53).sort((a,b)=>a-b));
  const rootBlock=root.slice(root.indexOf('function main('));
  const frameSix=rootBlock.slice(rootBlock.indexOf('case 5:'),rootBlock.indexOf('case 6:'));
  const rootLines=frameSix.split('\n').filter(line=>/place\("(?:sprite52|text53|sprite55|shape56)"/u.test(line));
  assert.deepEqual(rootLines.map(line=>line.match(/place\("([^"]+)"/u)?.[1]),
    ['sprite52','text53','sprite55','shape56']);
  assert(rootLines[0].includes('[0.05,0.0,0.0,0.05,369.5,253.0]'));
  assert(rootLines[1].includes('[0.05,0.0,0.0,0.05,143.35,-185.0]'));
  assert(rootLines[2].includes('[0.05,0.0,0.0,0.05,400.0,43.95]'));
  assert(rootLines[3].includes('[0.05,0.0,0.0,0.05,0.0,0.0]'));
  const rootFunctions=[['text53','shape54'],['shape54','sprite55'],
    ['sprite55','shape56'],['shape56','main']].map(([name,next])=>extractFunction(root,name,next));
  const border=rootFunctions[3];
  assert(border.includes('ctrans.apply([54,107,231,1])'),'source border color');
  assert(rootFunctions[2].includes('place("shape54"'),'source title outline sprite');
  assert(rootFunctions[0].includes('font1(ctx,'),'offstage source text uses source font1');
  const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
    classification:'unregistered-source-bound-canvas-native-text-candidate-v1',
    source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SWF}`,swfSha256:SWF_SHA},
    evidence:{scenarioInventory:PIN.sourceAudit.path,scenarioInventorySha256:PIN.sourceAudit.sha256,
      audioAudit:PIN.sourceAudit.path,audioAuditSha256:PIN.sourceAudit.sha256},
    ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',
      helper:PIN.helper.path,helperSha256:PIN.helper.sha256,framesHtml:PIN.frames.path,
      framesHtmlSha256:PIN.frames.sha256,targetSpriteObjectId:52,
      targetSpriteFunction:'sprite52',exportCanvas:{width:585,height:348},
      exportInternalTranslation:{x:248.95,y:139},expectedPlacedFunctionCount:placed.length,
      expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),expectedFontFunctionCount:fonts.length,
      expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),embeddedImageVariableCount:0,
      embeddedImageVariablesSha256:sha(JSON.stringify(images))},
    timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
      root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',
        placementName:'animation',placementTwips:{x:7390,y:5060},
        placementPixels:{x:369.5,y:253}},
      local:{timelineId:'sprite-52',frameCount:303,livePlaybackEndFrame:303,
        playbackMode:'once',publicFrameIndexing:'one-indexed'},
      stageRenderOffset:{x:120.55,y:114}},
    runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],
      defaultScenario:'source-static-frame',supportedLanguages:['en'],
      visualLocalization:'source-English-visuals-with-native-English-fallback-for-es',
      seedMapping:'fixed-zero-no-source-randomness-executed',blockedLocalFrameRanges:[],
      currentCanonicalFrameDomainDispositionAsserted:false,
      unresolved:['Original Flash playback and host terminal frame remain unobserved.',
        'Native text/Function control, audio clock, and My Lesson are separate integration gates.',
        'This generated drawing is not original-runtime or visual-fidelity acceptance.']},
    output:{script:'canvas-renderer.js',manifest:'canvas-manifest.json',spec:'adapter-spec.json',
      globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
  let runtime=buildSafeRuntime({helperSource:inputs.helper.toString(),framesHtml:frames,spec}).runtime;
  runtime=normalizeSourceClipMasks(runtime,[{characterId:47,
    placements:[{depth:30,clipDepth:33}],
    rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.5019608]));'}],xml);
  runtime=runtime.replaceAll(`course-${ID}`,ID);
  assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`));
  // Preserve source glyphs and root outline in the authored drawing plane.
  // The native text component is an accessible flow companion, not an
  // in-stage replacement with the same object coordinates.
  runtime=replaceOnce(runtime,'\nSAFE_OBJECTS = Object.freeze({',
    `\n${rootFunctions.join('\n\n')}\n\nSAFE_OBJECTS = Object.freeze({`,
    'source root definitions');
  runtime=replaceOnce(runtime,'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "text53": text53,\n        "shape54": shape54,\n        "sprite55": sprite55,\n        "shape56": shape56,\n',
    'source root object registry');
  const rootDecoration=rootLines.slice(1).map(line=>`            ${line.trim()}`).join('\n');
  const oldDraw='ctx.transform(1, 0, 0, 1, 120.55, 114);\n        sprite52(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
  runtime=replaceOnce(runtime,oldDraw,`${oldDraw}\n        ctx.restore();\n        ctx.save();\n        ctx.setTransform(1, 0, 0, 1, 0, 0);\n        var ctrans = new cxform(0,0,0,0,255,255,255,255);\n        var time = state.exportFrame;\n${rootDecoration}`,
    'stage root depth-51/52/54 decorations');
  assert(runtime.includes('"text49": text49'));
  assert(runtime.includes('"sprite55": sprite55'));
  assert(runtime.includes('"shape56": shape56'));
  new Script(runtime);
  const script=Buffer.from(runtime);
  const ts=Buffer.from(`/* Generated by scripts/build-alg-l06-p010-canvas-v1.mjs. Do not edit. */\n`
    +`export const P010_CANVAS_V1 = ${JSON.stringify({animationId:ID,sourceSwfSha256:SWF_SHA,
      stage:{width:800,height:600},fps:12,rootFrame:6,frameDomain:'sprite-52',
      frameCount:303,scenario:'source-static-frame',visualLocalization:'source-en-fallback',
      sourceGlyphRendering:{mainDefinitions:41,rootOffstageText:true,rootOutlinedTitle:true,
        totalSourceTextDefinitions:42,nativeBinding:'semantic-flow-companion'},
      sourceDepthOrder:rootPlaces.map(e=>({depth:e.depth,characterId:e.characterId})),
      sourceClipMask:{characterId:47,depth:30,clipDepth:33},
      stageRenderOffset:{x:120.55,y:114},
      assetPath:'/flash-assets/g678-local/shared-alg001-l06-p010/canvas-renderer.js',
      assetSha256:sha(script)},null,2)} as const;\n`);
  const manifest=json({schemaVersion:1,kind:'alg-l06-p010-maintained-canvas-v1',animationId:ID,
    status:'unregistered-drawing-candidate',source:{path:SWF,bytes:114334,sha256:SWF_SHA},
    rootFrame:6,mainFrameCount:303,stage:{width:800,height:600},
    sourceDepthOrder:rootPlaces.map(e=>({depth:e.depth,characterId:e.characterId})),
    sourceGlyphRendering:{mainDefinitions:41,totalSourceTextDefinitions:42,rootOffstageText:true,
      rootOutlinedTitle:true,nativeBinding:'semantic-flow-companion'},
    sourceMaskNormalization:{characterId:47,depth:30,clipDepth:33,rawAlpha:0.5019608},
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
    'usage: build-alg-l06-p010-canvas-v1.mjs --build|--check');
  const built=buildP010Canvas();
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
