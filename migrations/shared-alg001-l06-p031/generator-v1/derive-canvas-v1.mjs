/** P031 source drawing candidate. Host feedback requests remain unresolved. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';

const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const M='migrations/shared-alg001-l06-p031',ID='shared-alg001-l06-p031';
const E='/Volumes/American Dream/hudongpin/g678-p031-source-extraction-20261003-v1';
const OUT='/Volumes/American Dream/hudongpin/g678-p031-canvas-20261003-v1';
const sha=b=>createHash('sha256').update(b).digest('hex');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
function read(p,hash){p=path.resolve(R,p);assert(fs.realpathSync(p)===p);const raw=fs.readFileSync(p);if(hash)assert.equal(sha(raw),hash,p);return raw;}
function once(s,a,b){const at=s.indexOf(a);assert(at>=0&&s.indexOf(a,at+1)<0,a);return s.slice(0,at)+b+s.slice(at+a.length);}
const modelBytes=read(`${M}/native-v1/source-model-v1.json`,'7b2a8d6e3c4e7b4d5bd1946b09d9ab8e3c3501d8291d08463807d7745af9360a');
const model=JSON.parse(modelBytes),intake=JSON.parse(read(`${M}/audit-v1/source-extraction-v1.json`));
for(const p of model.inputs)assert.equal(read(p.path,p.sha256).length,p.bytes);
for(const p of intake.files)assert.equal(read(`${E}/ffdec-export/${p.path}`,p.sha256).length,p.bytes);
read(`${M}/source-v1/L6IN03.swf`,model.sourceSha256);
read('scripts/build-safe-ffdec-canvas-adapter.mjs','1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd');
const base=`${E}/ffdec-export/sprites/DefineSprite_363`;
const frames=read(`${base}/frames.html`).toString().replace(/\r\n?/g,'\n'),helper=read(`${base}/canvas.js`);
const placed=[...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/g)].map(m=>m[1]))].sort();
const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/g)].map(m=>m[1]);
const images=[...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/g)].map(m=>m[1]);
assert(frames.includes('<canvas id="myCanvas" width="1762" height="772"'));
assert(frames.includes('ctx.transform(1,0,0,1,911.65,578.1);'));
assert.deepEqual(model.rootMatrixTwips,{scaleX:1,scaleY:1,skewX:0,skewY:0,transX:8248,transY:6066});
const spec={schemaVersion:1,animationId:`course-${ID}`,classification:'behavior-heavy-unregistered-source-canvas-draft-v1',
 source:{swf:'$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/IN/L6IN03.swf',swfSha256:model.sourceSha256},
 evidence:{scenarioInventory:`${M}/native-v1/source-model-v1.json`,scenarioInventorySha256:sha(modelBytes),
 audioAudit:`${M}/native-v1/source-model-v1.json`,audioAuditSha256:sha(modelBytes),sourceXml:intake.xml.path,sourceXmlSha256:intake.xml.sha256},
 ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',helper:`${base}/canvas.js`,helperSha256:sha(helper),
 framesHtml:`${base}/frames.html`,framesHtmlSha256:sha(read(`${base}/frames.html`)),targetSpriteObjectId:363,targetSpriteFunction:'sprite363',
 exportCanvas:{width:1762,height:772},exportInternalTranslation:{x:911.65,y:578.1},
 expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),
 expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
 embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
 timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,placementName:'animation',
 placementTwips:{x:8248,y:6066},placementPixels:{x:412.4,y:303.3}},
 local:{timelineId:'sprite-363',frameCount:1611,livePlaybackEndFrame:1611,playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},
 stageRenderOffset:{x:412.4-911.65,y:303.3-578.1}},
 runtimeContract:{kind:'structural-local-frame',scenarios:['source-explicit-frames'],defaultScenario:'source-explicit-frames',supportedLanguages:['en'],
 visualLocalization:'English source drawing in either host language',seedMapping:'fixed zero',blockedLocalFrameRanges:[],currentCanonicalFrameDomainDispositionAsserted:false,
 unresolved:['Historical host pairing and feedback selection are unverified; this drawing adapter does not resolve answer requests.','Audio, original-runtime, listening and human acceptance remain independent.']},
 output:{script:'canvas-renderer-draft.js',manifest:'canvas-candidate-manifest-v1.json',spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
let runtime=buildSafeRuntime({helperSource:helper.toString(),framesHtml:frames,spec}).runtime.replaceAll(`course-${ID}`,ID);
runtime=once(runtime,'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }',
 'if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("visual seed must be fixed zero");\n    }');
// All seven feedback clips author stop() on frame 1. No host selection is invented.
for(const sid of [110,150,191,242,299,337,362]){
 assert.equal(read(`${E}/ffdec-export/scripts/DefineSprite_${sid}/frame_1/DoAction.as`).toString().trim(),'stop();');
 const re=new RegExp(`(^[ \\t]*place\\("sprite${sid}"[^\\n]+),1,\\(0\\+time\\)%\\d+,1609,time\\);`,'gm');
 const matches=[...runtime.matchAll(re)];assert.equal(matches.length,1,`sprite${sid}`);
 runtime=runtime.replace(re,'$1,1,0,1609,0);');
}
const root=read(`${E}/ffdec-export/frames/frames.html`).toString().replace(/\r\n?/g,'\n');
const a=root.indexOf('function shape1('),b=root.indexOf('\nfunction ',a+1);assert(a>=0&&b>a);
runtime=once(runtime,'\nSAFE_OBJECTS = Object.freeze({',`\n${root.slice(a,b)}\nSAFE_OBJECTS = Object.freeze({`);
runtime=once(runtime,'SAFE_OBJECTS = Object.freeze({\n','SAFE_OBJECTS = Object.freeze({\n        "shape1":shape1,\n');
runtime=once(runtime,'    ctx.save();\n    try {\n        ctx.transform(1, 0, 0, 1,',
 '    ctx.save();\n    try {\n        place("shape1",targetCanvas,ctx,[0.05,0,0,0.05,0,0],new cxform(0,0,0,0,255,255,255,255),1,0,5,0);\n        ctx.transform(1, 0, 0, 1,');
assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame|fetch)\s*\(/.test(runtime));
const context=createContext({document:{createElement:kind=>{assert.equal(kind,'img');return {complete:false,naturalWidth:0};}}});
new Script(runtime).runInContext(context,{timeout:30000});const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
for(let f=1;f<=1611;f++)assert.equal(asset.resolveFrameState({frame:f,seed:0,lang:'en'}).localFrame,f);
for(const request of [{frame:0},{frame:1612},{frame:1,seed:1},{frame:1,lang:'es'}])assert.throws(()=>asset.resolveFrameState(request));
const outputs=new Map([[`${OUT}/canvas-renderer-draft.js`,Buffer.from(runtime)],[`${R}/${M}/canvas-v1/adapter-spec-v1.json`,encode(spec)]]);
outputs.set(`${R}/${M}/canvas-v1/canvas-candidate-manifest-v1.json`,encode({kind:'p031-source-canvas-draft-v1',animationId:ID,sourceModelSha256:sha(modelBytes),
 mainFramesResolved:1611,invalidRequestsRejected:4,rootShape:1,stoppedFeedbackSprites:[110,150,191,242,299,337,362],
 outputs:[...outputs].map(([p,raw])=>({path:p,bytes:raw.length,sha256:sha(raw)})),registered:false,hostFeedbackResolved:false,acceptanceEffects:model.acceptanceEffects}));
assert(['--write','--check'].includes(process.argv[2]));
for(const[p,raw]of outputs){if(process.argv[2]==='--write'){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,raw,{flag:'wx'});}else assert.deepEqual(read(p),raw,p);}
console.log(JSON.stringify({status:'PASS',mode:process.argv[2],frames:1611,outputs:[...outputs].map(([p,b])=>({path:p,bytes:b.length,sha256:sha(b)}))}));
