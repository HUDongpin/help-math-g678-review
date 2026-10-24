#!/usr/bin/env node
/** Source-locked sprite-507 drawing diagnostic. No product/host/audio admission. */
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
const ID='shared-alg001-l06-p008',SWF='G6-G8-shared/ALG001/L6/RW/L6RW07.swf';
const SWF_SHA='6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350';
const AUDIT='migrations/shared-alg001-l06-p008/audit';
const PIN=Object.freeze({
  sourceAudit:{path:`${AUDIT}/source-v1/source-audit-v1.json`,sha256:'e14303e47454761f2fc17b77b7eb6afc714354d50cfbd1bd151264a516db6de2'},
  composition:{path:`${AUDIT}/source-v1/source-composition-v1.json`,sha256:'a738f4fa22abd482cbb4a5470a33c85f465f79ae1fd831b1c29466c4617016c7'},
  facts:{path:`${AUDIT}/source-v1/source-facts-v1.json`,sha256:'c80269ee8c50e330d6b8820ee5de805a63ddafc43dc3b2e37dbba70554d57312'},
  xml:{path:`${AUDIT}/source-v1/swfmill-v1.xml.gz`,sha256:'f1969d8d2490c8441d8cbd67406da6bb9f624d2c5e22655f9c3fb3423387f5ce'},
  ffdec:{path:`${AUDIT}/canvas-v1/receipt.json`,sha256:'ffc6aae3e353e052480a68d310b41626af717369feb24d7048b007be7521b7e5'},
  frames:{path:`${AUDIT}/canvas-v1/sprites/DefineSprite_507/frames.html`,sha256:'5aa4f4dbd4e77bf0f440e1795d0168e34b2a01598079bf72329472d54ce0e403'},
  helper:{path:`${AUDIT}/canvas-v1/sprites/DefineSprite_507/canvas.js`,sha256:'78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93'},
});
const SPEC_PATHS=[`migrations/${ID}/migration.json`,`migrations/${ID}/MIGRATION_BRIEF.md`,
  `migrations/${ID}/asset-inventory.csv`,`migrations/${ID}/audio-inventory.csv`,
  `migrations/${ID}/keyframes.csv`,`migrations/${ID}/evidence/full-frame-coverage.json`];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);

function readOrdinary(root,pin){
  const file=path.resolve(root,pin.path);
  assert(file.startsWith(`${root}${path.sep}`)&&realpathSync(file)===file,`physical scoped file: ${pin.path}`);
  const before=lstatSync(file,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file: ${pin.path}`);
  const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
  for(const key of ['dev','ino','size','mtimeNs','nlink'])assert.equal(before[key],after[key],`stable file: ${pin.path}`);
  if(pin.bytes!==undefined)assert.equal(bytes.length,pin.bytes,`size drift: ${pin.path}`);
  if(pin.sha256!==undefined)assert.equal(sha(bytes),pin.sha256,`SHA drift: ${pin.path}`);
  return bytes;
}

function checkedWorkspaceSpec(){
  const pins=SPEC_PATHS.map(path=>{const bytes=readOrdinary(ROOT,{path});return {path,bytes:bytes.length,sha256:sha(bytes),content:bytes.toString()};});
  const [migration,brief,assets,audio,keyframes,coverage]=pins;
  const m=JSON.parse(migration.content),c=JSON.parse(coverage.content);
  assert.equal(m.animationId,ID);assert.equal(m.source.swfSha256,SWF_SHA);
  assert.equal(m.runtime.frameCount,10);assert.equal(m.runtime.fps,12);
  assert(m.implementation.rendering!=='undecided','migration renderer decision is still scaffolded');
  assert(m.implementation.frameDomains.some(d=>d.id==='sprite-507'&&d.frameCount===938),'main domain missing in migration');
  assert(brief.content.includes('sprite-507')&&brief.content.includes('938'),'brief lacks main-domain specification');
  assert(assets.content.split(/\r?\n/u).filter(Boolean).length>1&&assets.content.includes('507'),'asset inventory is still scaffolded');
  assert(audio.content.split(/\r?\n/u).filter(Boolean).length>1,'audio inventory is still scaffolded');
  assert(keyframes.content.split(/\r?\n/u).filter(Boolean).length>1&&keyframes.content.includes('sprite-507'),'keyframes are still scaffolded');
  assert(JSON.stringify(c).includes('sprite-507'),'frame-domain coverage lacks sprite-507');
  return pins.map(({path,bytes,sha256})=>({path,bytes,sha256}));
}

/** FFDec passes a child-local `(n+time)%22` at each placement. Confirm the
 * offset resets on re-entry; never substitute a global `mainFrame%22`. */
export function verifyChildReentry(frames,audit){
  const begin=frames.indexOf('function sprite507('),end=frames.indexOf('\n}',begin);
  assert(begin>=0&&end>begin,'main sprite function');
  const body=frames.slice(begin,end);
  const expected=[
    {characterId:20,depth:56,firstFrame:1,lastFrameExclusive:19},
    {characterId:20,depth:73,firstFrame:449,lastFrameExclusive:464},
    {characterId:194,depth:318,firstFrame:636,lastFrameExclusive:646},
    {characterId:20,depth:73,firstFrame:936,lastFrameExclusive:939},
  ];
  assert.deepEqual(audit.nestedSprites,expected,'source-backed child instance windows');
  for(const window of expected){
    for(let frame=window.firstFrame;frame<window.lastFrameExclusive;frame++){
      const start=body.indexOf(`case ${frame-1}:`),next=body.indexOf(`case ${frame}:`,start+1);
      assert(start>=0,`main frame ${frame}`);
      const segment=body.slice(start,next>=0?next:undefined);
      const placements=[...segment.matchAll(new RegExp(`place\\("sprite${window.characterId}",[^\\n]*?,\\s*1,\\((\\d+)\\+time\\)%22,(\\d+),time\\);`,'gu'))];
      assert.equal(placements.length,1,`single source child placement at ${frame}`);
      assert.equal(Number(placements[0][1]),frame-window.firstFrame,`child-local offset at ${frame}`);
      assert.equal(Number(placements[0][2]),window.firstFrame-1,`child re-entry anchor at ${frame}`);
    }
  }
  for(const id of [20,194]){
    const m=frames.match(new RegExp(`function sprite${id}\\(ctx,ctrans,frame,ratio,time\\)\\{[\\s\\S]{0,100}?var frame_cnt = (\\d+);`,'u'));
    assert(m&&Number(m[1])===22,`source child ${id} frame count`);
  }
  return expected;
}

export function buildP008CanvasCandidate(sourceRoot){
  assert.equal(sourceRoot,SOURCE_ROOT,'exact real source root');
  assert(realpathSync(sourceRoot)===sourceRoot&&lstatSync(sourceRoot).isDirectory()&&
    !lstatSync(sourceRoot).isSymbolicLink(),'physical source root');
  const swf=readOrdinary(sourceRoot,{path:SWF,bytes:2805364,sha256:SWF_SHA});
  const specPins=checkedWorkspaceSpec();
  const inputs=Object.fromEntries(Object.entries(PIN).map(([name,pin])=>[name,readOrdinary(ROOT,pin)]));
  const audit=JSON.parse(inputs.sourceAudit),composition=JSON.parse(inputs.composition),facts=JSON.parse(inputs.facts);
  const exportReceipt=JSON.parse(inputs.ffdec);
  assert.equal(audit.kind,'alg-l06-p008-source-audit-v1');assert.equal(audit.source.sha256,SWF_SHA);
  assert.equal(audit.header.rootFrameCount,10);assert.equal(audit.header.fps,12);
  assert.deepEqual(audit.frameDomains.map(d=>[d.domainId,d.declaredFrames]),
    [['root',10],['sprite-20',22],['sprite-194',22],['sprite-507',938],['sprite-510',1]]);
  assert.equal(audit.actionScript.decompiled['scripts/DefineSprite_507/frame_938/DoAction.as'],'stop();');
  assert.equal(audit.tagCounts.DefineButton??0,0);assert.equal(audit.tagCounts.DefineButton2??0,0);
  assert.deepEqual(audit.masks.map(m=>[m.characterId,m.depth,m.clipDepth,m.firstFrame,m.lastFrameExclusive]),
    [[1,1,498,1,939],[428,388,403,791,854]]);
  assert.deepEqual(composition.root.events.filter(e=>e.kind==='place'&&e.characterId===507)
    .map(e=>[e.frame,e.depth,e.matrix?.[4],e.matrix?.[5],e.name?.text]),[[6,1,7390,5060,'animation']]);
  assert.equal(facts.frameDomains.longestStaticallyRootReachableDomain.domainId,'sprite-507');
  assert.equal(facts.frameDomains.longestStaticallyRootReachableDomain.declaredFrameCount,938);
  assert.equal(exportReceipt.source.sha256,SWF_SHA);
  for(const pin of exportReceipt.files)readOrdinary(ROOT,pin);
  const xml=gunzipSync(inputs.xml).toString();
  assert(xml.includes('<DefineSprite objectID="507" frames="938">'));
  assert(xml.includes('<PlaceObject2 replace="0" depth="1" objectID="507" morph="5" name="animation">'));
  const frames=inputs.frames.toString(),helper=inputs.helper.toString();
  const canvas=frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header=frames.match(/function sprite507\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas&&header&&Number(header[3])===938&&Number(header[1])===1440.35&&Number(header[2])===1021);
  verifyChildReentry(frames,audit);
  const definitions=frames.slice(0,frames.indexOf('\nvar frame = -1;'));
  assert(definitions.length>0,'FFDec definitions boundary');
  const placed=[...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m=>m[1]))].sort();
  const fonts=[...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m=>m[1]);
  const images=[...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);\s*\1.src="data:image\/(?:PNG|JPEG);base64,[A-Za-z0-9+/=]+";/gu)].map(m=>m[1]);
  assert.deepEqual([placed.length,fonts.length,images.length],[490,3,13]);
  const offset={x:369.5-1440.35,y:253-1021};
  const unresolved=['Main sprite-507 drawing only: root title/overlay and all source host actions remain outside this diagnostic.',
    'Embedded stream and separate Spanish audio are not executed or listened to here.',
    'Child 22-frame loops are visual export formulas checked at re-entry, not original-runtime animation parity.',
    'Native accessible text, original-runtime comparison, registration, and human/Owner acceptance remain unresolved.'];
  const spec={schemaVersion:1,animationId:`course-${ID}`,finalAnimationId:ID,
    classification:'unregistered-main-domain-diagnostic-canvas-v1',title:'Understanding Functions: Real World Activity',
    source:{swf:`$HELP_MATH_G678_SOURCE_ROOT/${SWF}`,swfBytes:swf.length,swfSha256:SWF_SHA},
    evidence:{scenarioInventory:PIN.sourceAudit.path,scenarioInventorySha256:PIN.sourceAudit.sha256,
      audioAudit:PIN.sourceAudit.path,audioAuditSha256:PIN.sourceAudit.sha256},
    ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',helper:PIN.helper.path,
      helperSha256:PIN.helper.sha256,helperBytes:inputs.helper.length,
      framesHtml:PIN.frames.path,framesHtmlSha256:PIN.frames.sha256,framesHtmlBytes:inputs.frames.length,
      targetSpriteObjectId:507,targetSpriteFunction:'sprite507',exportCanvas:{width:Number(canvas[1]),height:Number(canvas[2])},
      exportInternalTranslation:{x:1440.35,y:1021},expectedPlacedFunctionCount:placed.length,
      expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),expectedFontFunctionCount:fonts.length,
      expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),embeddedImageVariableCount:images.length,
      embeddedImageVariablesSha256:sha(JSON.stringify(images))},
    timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},
      root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,beginLabel:'begin',placementName:'animation',
        placementDepth:'1',placementTwips:{x:7390,y:5060},placementPixels:{x:369.5,y:253}},
      local:{timelineId:'sprite-507',frameCount:938,livePlaybackEndFrame:938,playbackMode:'once',publicFrameIndexing:'one-indexed'},
      stageRenderOffset:offset},
    runtimeContract:{kind:'structural-local-frame',scenarios:['source-static-frame'],defaultScenario:'source-static-frame',
      supportedLanguages:['en'],seedMapping:'fixed-zero-no-source-randomness-executed',blockedLocalFrameRanges:[],
      currentCanonicalFrameDomainDispositionAsserted:false,unresolved},
    output:{script:'canvas-renderer.js',manifest:'candidate-manifest.json',spec:'adapter-spec.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect:'none'};
  const generated=buildSafeRuntime({helperSource:helper,framesHtml:frames,spec}).runtime;
  assert(generated.includes(`registry["course-${ID}"]`),'generated source identity');
  const runtime=normalizeSourceClipMasks(generated,[
    {characterId:1,placements:[{depth:1,clipDepth:498}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,102,255,0.2509804]));'},
    {characterId:428,placements:[{depth:388,clipDepth:403}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));'},
  ],xml).replaceAll(`course-${ID}`,ID);
  assert(runtime.includes(`registry["${ID}"]`)&&!runtime.includes(`course-${ID}`),'exact placement asset ID');
  new Script(runtime);
  const preview=Buffer.from(`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,">\n<title>P008 sprite-507 drawing diagnostic</title><style>body{margin:0;background:#192836;color:#fff;font:16px system-ui}main{width:min(100%,800px);margin:auto}canvas{display:block;width:100%;height:auto}p{padding:8px}</style></head>\n<body><main><canvas id="stage" width="800" height="600" aria-label="P008 source main-sprite drawing diagnostic"></canvas><p id="status" role="status">Loading diagnostic…</p></main><script src="./canvas-renderer.js"></script><script>\n(async()=>{try{const frame=Number(new URLSearchParams(location.search).get('frame')||'1');if(!Number.isSafeInteger(frame)||frame<1||frame>938)throw Error('invalid frame');const asset=globalThis.HELP_MATH_CANVAS_ASSETS?.['${ID}'];if(!asset)throw Error('asset missing');await asset.ready();const state=asset.render(document.getElementById('stage'),{frame,scenario:'source-static-frame',lang:'en',seed:0});document.getElementById('status').textContent='Main sprite-507 only · frame '+state.localFrame+'/938 · no title, host, audio or acceptance';document.body.dataset.candidateReady='true';}catch(error){document.getElementById('status').textContent=String(error);document.body.dataset.candidateError=String(error);}})();\n</script></body></html>\n`);
  const specBytes=json(spec),runtimeBytes=Buffer.from(runtime);
  const dependencies=['scripts/build-safe-ffdec-canvas-adapter.mjs','scripts/lib/g678-source-clip-masks-v1.mjs'];
  const manifest=json({schemaVersion:1,kind:'alg-l06-p008-main-domain-diagnostic-canvas-v1',animationId:ID,
    status:'unregistered-main-domain-only-diagnostic',source:{path:SWF,bytes:swf.length,sha256:SWF_SHA},
    inputs:[{path:SWF,bytes:swf.length,sha256:SWF_SHA},...Object.values(PIN).map(pin=>({path:pin.path,bytes:inputs[Object.keys(PIN).find(k=>PIN[k]===pin)].length,sha256:pin.sha256})),
      ...specPins,...dependencies.map(path=>{const bytes=readOrdinary(ROOT,{path});return {path,bytes:bytes.length,sha256:sha(bytes)};}),
      {path:'scripts/build-alg-l06-p008-canvas-v1.mjs',bytes:readFileSync(fileURLToPath(import.meta.url)).length,
        sha256:sha(readFileSync(fileURLToPath(import.meta.url)))}],
    childReentry:audit.nestedSprites,maskSource:audit.masks,
    outputs:[{name:'adapter-spec.json',bytes:specBytes.length,sha256:sha(specBytes)},
      {name:'canvas-renderer.js',bytes:runtimeBytes.length,sha256:sha(runtimeBytes)},
      {name:'preview.html',bytes:preview.length,sha256:sha(preview)}],
    unresolved,acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,audio:false,human:false,owner:false,strictComplete:false,publication:false}});
  return {spec:specBytes,runtime:runtimeBytes,preview,manifest};
}

function main(){
  const mode=process.argv[2];assert(process.argv.length===3&&['--build','--check'].includes(mode),
    'usage: build-alg-l06-p008-canvas-v1.mjs --build|--check');
  // The v1 output records a concurrent source-spec drift; retain those bytes.
  const output=path.join(ROOT,'output/alg-l06-p008-canvas-candidate-v2');
  if(mode==='--build')mkdirSync(output,{recursive:true});
  assert(realpathSync(output)===output&&lstatSync(output).isDirectory()&&!lstatSync(output).isSymbolicLink(),'physical output directory');
  const built=buildP008CanvasCandidate(process.env.HELP_MATH_G678_SOURCE_ROOT);
  const files=[['adapter-spec.json',built.spec],['canvas-renderer.js',built.runtime],
    ['preview.html',built.preview],['candidate-manifest.json',built.manifest]];
  for(const [name,bytes] of files){const target=path.join(output,name);
    if(mode==='--check')assert(readFileSync(target).equals(bytes),`${name} drifted`);
    else try{writeFileSync(target,bytes,{flag:'wx'});}catch(error){
      if(error.code!=='EEXIST')throw error;assert(readFileSync(target).equals(bytes),`${name} drifted`);}}
  console.log(JSON.stringify({status:mode==='--check'?'verified':'created',output,
    files:files.map(([name,bytes])=>({name,bytes:bytes.length,sha256:sha(bytes)}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
