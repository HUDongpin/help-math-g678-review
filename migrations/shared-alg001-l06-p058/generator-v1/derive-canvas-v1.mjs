/** P058 original drawing with explicit main/step-box/selected-feedback clocks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Script,createContext} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const M='migrations/shared-alg001-l06-p058',ID='shared-alg001-l06-p058';
const E='/Volumes/American Dream/hudongpin/g678-p058-source-extraction-20261003-v1';
const OUT='/Volumes/American Dream/hudongpin/g678-p058-canvas-20261003-v1';
const sha=b=>createHash('sha256').update(b).digest('hex'),encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
function read(p,digest){p=path.resolve(R,p);assert.equal(fs.realpathSync(p),p);const a=fs.statSync(p,{bigint:true});assert(a.isFile());const b=fs.readFileSync(p),z=fs.statSync(p,{bigint:true});for(const k of ['ino','size','mtimeNs','ctimeNs'])assert.equal(a[k],z[k]);if(digest)assert.equal(sha(b),digest,p);return b;}
function once(s,a,b){const n=s.indexOf(a);assert(n>=0&&s.indexOf(a,n+1)<0,a);return s.slice(0,n)+b+s.slice(n+a.length);}
function fn(s,name){const a=s.indexOf(`function ${name}(`),b=s.indexOf('\nfunction ',a+1);assert(a>=0&&b>a,name);return s.slice(a,b).trimEnd();}
const modelBytes=read(`${M}/native-v1/source-model-v1.json`),model=JSON.parse(modelBytes);
const intake=JSON.parse(read(`${M}/audit-v1/source-extraction-v1.json`));
assert.equal(model.sourceSha256,'79bd9d4896d7b297a4df928711c92f1bd2b9f78b976f8399fc9e640d9704c4d3');
for(const p of model.inputs)assert.equal(read(p.path,p.sha256).length,p.bytes);
for(const p of intake.files)assert.equal(read(`${E}/ffdec-export/${p.path}`,p.sha256).length,p.bytes);
read(`${M}/source-v1/L6TS09.swf`,model.sourceSha256);
read('scripts/build-safe-ffdec-canvas-adapter.mjs','1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd');
read('scripts/lib/g678-source-clip-masks-v1.mjs','e064fb7cb98e66f08e5173bdfc756641b6a8ddae86f7e4dab02e90fdb3bbd70e');
const base=`${E}/ffdec-export/sprites/DefineSprite_285`,frames=read(`${base}/frames.html`).toString().replace(/\r\n?/g,'\n'),helper=read(`${base}/canvas.js`);
const root=read(`${E}/ffdec-export/frames/frames.html`).toString().replace(/\r\n?/g,'\n');
assert(root.includes('place("sprite15",canvas,ctx,[0.05,0.0,0.0,0.05,400.0,47.5],ctrans,1,(0+time)%1,5,time);'));
const placed=[...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/g)].map(m=>m[1]))].sort();
const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/g)].map(m=>m[1]);
const images=[...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/g)].map(m=>m[1]);
assert(frames.includes('<canvas id="myCanvas" width="1445" height="489"'));
assert(fn(frames,'sprite285').includes('ctx.transform(1,0,0,1,652.15,207.8);'));
assert.deepEqual(model.rootMatrixTwips,{scaleX:1,scaleY:1,skewX:0,skewY:0,transX:8247,transY:5658});
for(const d of Object.values(model.domains).filter(d=>d.rootReachable))assert.deepEqual([...fn(d.spriteId===15?root:frames,`sprite${d.spriteId}`).matchAll(/\bcase\s+(\d+)\s*:/g)].map(m=>+m[1]),Array.from({length:d.frameCount},(_,i)=>i));
const spec={schemaVersion:1,animationId:`course-${ID}`,classification:'behavior-heavy-unregistered-source-canvas-draft-v1',
 source:{swf:'$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/TS/L6TS09.swf',swfSha256:model.sourceSha256},
 evidence:{scenarioInventory:`${M}/native-v1/source-model-v1.json`,scenarioInventorySha256:sha(modelBytes),audioAudit:`${M}/native-v1/source-model-v1.json`,audioAuditSha256:sha(modelBytes),sourceXml:intake.xml.path,sourceXmlSha256:intake.xml.sha256},
 ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',helper:`${base}/canvas.js`,helperSha256:sha(helper),framesHtml:`${base}/frames.html`,framesHtmlSha256:sha(read(`${base}/frames.html`)),targetSpriteObjectId:285,targetSpriteFunction:'sprite285',exportCanvas:{width:1445,height:489},exportInternalTranslation:{x:652.15,y:207.8},expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
 timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,placementName:'animation',placementTwips:{x:8247,y:5658},placementPixels:{x:412.35,y:282.9}},local:{timelineId:'sprite-285',frameCount:951,livePlaybackEndFrame:403,playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},stageRenderOffset:{x:412.35-652.15,y:282.9-207.8}},
 runtimeContract:{kind:'structural-local-frame',scenarios:['source-explicit-frames'],defaultScenario:'source-explicit-frames',supportedLanguages:['en'],visualLocalization:'Source English drawing with native bilingual host controls and source dictionary',seedMapping:'fixed zero; host feedback choice is maintained state',blockedLocalFrameRanges:[],currentCanonicalFrameDomainDispositionAsserted:false,unresolved:['Original runtime, font fidelity and listening remain independent.','Forensic help-name resolution does not prove historical host pairing.']},
 output:{script:'canvas-renderer-draft.js',manifest:'canvas-candidate-manifest-v1.json',spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
let runtime=buildSafeRuntime({helperSource:helper.toString(),framesHtml:frames,spec}).runtime.replaceAll(`course-${ID}`,ID);
runtime=once(runtime,'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }','if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("visual seed must be fixed zero");\n    }');
const feedbackFrames={36:28,62:31,76:32,97:33,115:28,129:31,140:29};
const validator=`var selectedFeedback=null,box=null,help=request.helpVisible===undefined?false:request.helpVisible;
    if(typeof help!=="boolean" || help && frame!==934)throw new Error("help requires final question");
    if(request.feedback!==undefined&&request.feedback!==null){var f=request.feedback,ends=${JSON.stringify(feedbackFrames)};
        if(frame!==934||help||typeof f!=="object"||Array.isArray(f)||Object.keys(f).sort().join(",")!=="localFrame,spriteId"||!Object.prototype.hasOwnProperty.call(ends,f.spriteId)||!Number.isSafeInteger(f.localFrame)||f.localFrame<2||f.localFrame>ends[f.spriteId])throw new Error("invalid selected feedback");
        selectedFeedback=Object.freeze({spriteId:f.spriteId,localFrame:f.localFrame,hostX:5});}
    if(request.stepBox!==undefined&&request.stepBox!==null){var b=request.stepBox;
        if(typeof b!=="object"||Array.isArray(b)||Object.keys(b).sort().join(",")!=="localFrame,spriteId"||!Number.isSafeInteger(b.localFrame)||b.localFrame<1||b.localFrame>19||!(frame===720&&b.spriteId===242||frame===878&&b.spriteId===252))throw new Error("invalid step box");
        box=Object.freeze({spriteId:b.spriteId,localFrame:b.localFrame});}
    `;
runtime=once(runtime,'    return Object.freeze({\n        frameDomain:',`    ${validator}return Object.freeze({\n        frameDomain:`);
runtime=once(runtime,'        audioRendered: false\n    });','        audioRendered: false,\n        feedback:selectedFeedback,stepBox:box,helpVisible:help\n    });');
for(const id of Object.keys(feedbackFrames)){
 let count=0;runtime=runtime.replace(new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`,'gm'),line=>{
  count++;const active=`P058_FEEDBACK&&P058_FEEDBACK.spriteId===${id}`,clock=`(${active}?P058_FEEDBACK.localFrame-1:0)`;
  let next=line.replace(/,1,\(\d+\+time\)%\d+,(\d+),time\);$/,`,1,${clock},$1,${clock});`);assert.notEqual(next,line);
  next=next.replace(/(\[[^\]]+)\]/,(_,matrix)=>{const v=matrix.slice(1).split(',');assert.equal(v.length,6);v[4]=`(${active}?5:${v[4]})`;return '['+v.join(',')+']';});return next;
 });assert.equal(count,951,`feedback${id}`);
}
for(const [id,expected]of [[218,309],[284,1]]){
 let count=0;runtime=runtime.replace(new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`,'gm'),line=>{
  count++;const next=line.replace(/,1,\(\d+\+time\)%\d+,(\d+),time\);$/,',1,0,$1,0);');assert.notEqual(next,line);return next;
 });assert.equal(count,expected,`unselected source sprite${id}`);
}
for(const id of [242,252]){
 let count=0;runtime=runtime.replace(new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`,'gm'),(line,indent)=>{
  count++;const next=line.replace(/,1,\(0\+time\)%\d+,(\d+),time\);$/,',1,P058_BOX.localFrame-1,$1,P058_BOX.localFrame-1);');assert.notEqual(next,line);return `${indent}if(P058_BOX&&P058_BOX.spriteId===${id}) ${next.trim()}`;
 });assert.equal(count,1);
}
runtime=runtime.replace(/(^[ \t]*)place\("sprite268"[^\n]+\);/gm,(line,indent)=>`${indent}if(P058_HELP) ${line.trim()}`);
runtime=once(runtime,'var readyPromise = null;','var P058_FEEDBACK=null,P058_BOX=null,P058_HELP=false;\nvar readyPromise = null;');
runtime=once(runtime,'\nSAFE_OBJECTS = Object.freeze({',`\n${fn(root,'shape14')}\n${fn(root,'sprite15')}\nSAFE_OBJECTS = Object.freeze({`);
runtime=once(runtime,'SAFE_OBJECTS = Object.freeze({\n','SAFE_OBJECTS = Object.freeze({\n        "shape14":shape14,"sprite15":sprite15,\n');
runtime=once(runtime,'    ctx.save();\n    try {\n        ctx.transform(1, 0, 0, 1,','    ctx.save();\n    try {\n        place("sprite15",targetCanvas,ctx,[0.05,0,0,0.05,400,47.5],new cxform(0,0,0,0,255,255,255,255),1,0,5,0);\n        ctx.transform(1, 0, 0, 1,');
runtime=once(runtime,'    var previousCanvas = canvas;\n    canvas = targetCanvas;','    var previousCanvas = canvas,oldFeedback=P058_FEEDBACK,oldBox=P058_BOX,oldHelp=P058_HELP;\n    P058_FEEDBACK=state.feedback;P058_BOX=state.stepBox;P058_HELP=state.helpVisible;canvas=targetCanvas;');
runtime=once(runtime,'        canvas = previousCanvas;','        canvas = previousCanvas;P058_FEEDBACK=oldFeedback;P058_BOX=oldBox;P058_HELP=oldHelp;');
runtime=once(runtime,'        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));','        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));\n        targetCanvas.setAttribute("data-p058-state",JSON.stringify({feedback:state.feedback,stepBox:state.stepBox,helpVisible:state.helpVisible}));');
assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame|fetch)\s*\(/.test(runtime));
const context=createContext({document:{createElement:k=>{assert.equal(k,'img');return {complete:false,naturalWidth:0};}}});new Script(runtime).runInContext(context,{timeout:30000});const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
for(let frame=1;frame<=951;frame++)assert.equal(asset.resolveFrameState({frame}).localFrame,frame);
for(const [id,last]of Object.entries(feedbackFrames))for(let frame=2;frame<=last;frame++)assert.equal(asset.resolveFrameState({frame:934,feedback:{spriteId:+id,localFrame:frame}}).feedback.localFrame,frame);
for(const [frame,id]of [[720,242],[878,252]])for(let local=1;local<=19;local++)assert.equal(asset.resolveFrameState({frame,stepBox:{spriteId:id,localFrame:local}}).stepBox.localFrame,local);
assert(asset.resolveFrameState({frame:934,helpVisible:true}).helpVisible);
const negatives=[{frame:0},{frame:952},{frame:1,seed:1},{frame:1,lang:'es'},{frame:720,helpVisible:true},{frame:934,helpVisible:1},{frame:878,stepBox:{spriteId:242,localFrame:15}},{frame:720,stepBox:{spriteId:242,localFrame:20}},{frame:934,feedback:{spriteId:218,localFrame:2}},{frame:934,feedback:{spriteId:129,localFrame:32}},{frame:934,helpVisible:true,feedback:{spriteId:129,localFrame:2}}];for(const n of negatives)assert.throws(()=>asset.resolveFrameState(n));
const outputs=new Map([[`${OUT}/canvas-renderer-draft.js`,Buffer.from(runtime)],[`${R}/${M}/canvas-v1/adapter-spec-v1.json`,encode(spec)]]);
outputs.set(`${R}/${M}/canvas-v1/canvas-candidate-manifest-v1.json`,encode({kind:'p058-source-canvas-candidate-v1',sourceModelSha256:sha(modelBytes),mainFramesResolved:951,feedbackFrames,boxFrames:{242:19,252:19},maskIds:[37],inactiveSpriteClocks:[218,284],invalidRequestsRejected:negatives.length,outputs:[...outputs].map(([p,b])=>({path:p,bytes:b.length,sha256:sha(b)})),registered:false,originalRuntime:false,acceptance:false}));
assert(['--write','--check'].includes(process.argv[2]));for(const[p,b]of outputs){if(process.argv[2]==='--write'){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);}else assert.deepEqual(read(p),b,p);}
console.log(JSON.stringify({status:'PASS',outputs:[...outputs].map(([p,b])=>({path:p,bytes:b.length,sha256:sha(b)}))}));
