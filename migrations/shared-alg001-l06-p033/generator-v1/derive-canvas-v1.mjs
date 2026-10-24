import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from '../../../scripts/lib/g678-source-clip-masks-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const WORK='migrations/shared-alg001-l06-p033',ID='shared-alg001-l06-p033';
const BASE='/Volumes/American Dream/hudongpin/g678-p033-visual-extraction-20261003-v1/ffdec-export';
const OUT='/Volumes/American Dream/hudongpin/g678-p033-canvas-20261003-v1';
const sha=b=>createHash('sha256').update(b).digest('hex'),json=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
function read(name,expected){
 const p=path.resolve(ROOT,name);assert([ROOT,BASE,OUT].some(r=>p.startsWith(r+path.sep))&&fs.realpathSync(p)===p);
 const stat=fs.lstatSync(p,{bigint:true});assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1n);
 const b=fs.readFileSync(p),after=fs.lstatSync(p,{bigint:true});
 for(const k of ['size','ino','mtimeNs','ctimeNs'])assert.equal(stat[k],after[k]);
 if(expected)assert.equal(sha(b),expected,name);return b;
}
function once(s,a,b){const n=s.indexOf(a);assert(n>=0&&s.indexOf(a,n+a.length)<0,a);return s.slice(0,n)+b+s.slice(n+a.length);}
function fn(s,name){const a=s.indexOf(`function ${name}(`),b=s.indexOf('\nfunction ',a+1);assert(a>=0&&b>a,name);return s.slice(a,b).trimEnd();}
const modelBytes=read(`${WORK}/native-v1/source-model-v1.json`,'ee17508b0ce795e1d4eab49686f293e3d24a7bfeaec58c8b8caf3681695510fa');
const model=JSON.parse(modelBytes);for(const p of model.inputs)assert.equal(read(p.path,p.sha256).length,p.bytes);
const receipt=read(`${WORK}/audit-v1/visual-extraction-v1.json`,'0a3dfd85ee8178c344e60ed0c538007d84f948a93e8b7968ea633295cec1140f');
const intake=JSON.parse(receipt);assert.equal(intake.exitCode,0);assert.equal(intake.exportRoot,BASE);
for(const p of intake.files)assert.equal(read(`${BASE}/${p.path}`,p.sha256).length,p.bytes);
const framesPath=`${BASE}/sprites/DefineSprite_190/frames.html`,helperPath=`${BASE}/sprites/DefineSprite_190/canvas.js`;
const frames=read(framesPath).toString().replace(/\r\n?/g,'\n'),helper=read(helperPath),root=read(`${BASE}/frames/frames.html`).toString().replace(/\r\n?/g,'\n');
const xmlPath='output/alg-l06-p033-source-planning-20261001-v1/source-structure.xml';
const xml=read(xmlPath).toString();
for(const d of model.frameDomains.filter(d=>d.spriteId!==2))assert.deepEqual([...fn(frames,`sprite${d.spriteId}`).matchAll(/\bcase\s+(\d+)\s*:/g)].map(m=>+m[1]),Array.from({length:d.frameCount},(_,i)=>i));
assert(fn(frames,'sprite190').includes('ctx.transform(1,0,0,1,599.0,229.3);'));
assert(frames.includes('<canvas id="myCanvas" width="1181" height="510"'));
assert.deepEqual(model.rootMatrixTwips,{scaleX:1,scaleY:1,skewX:0,skewY:0,transX:8248,transY:6266});
const placed=[...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/g)].map(m=>m[1]))].sort();
const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/g)].map(m=>m[1]);
const images=[...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/g)].map(m=>m[1]);
const spec={schemaVersion:1,animationId:`course-${ID}`,classification:'behavior-heavy-unregistered-source-canvas-draft-v1',
 source:{swf:'$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/IN/L6IN05.swf',swfSha256:intake.source.sha256},
 evidence:{scenarioInventory:`${WORK}/native-v1/source-model-v1.json`,scenarioInventorySha256:sha(modelBytes),audioAudit:`${WORK}/native-v1/source-model-v1.json`,audioAuditSha256:sha(modelBytes),sourceXml:xmlPath,sourceXmlSha256:sha(read(xmlPath))},
 ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',helper:helperPath,helperSha256:sha(helper),framesHtml:framesPath,framesHtmlSha256:sha(read(framesPath)),targetSpriteObjectId:190,targetSpriteFunction:'sprite190',exportCanvas:{width:1181,height:510},exportInternalTranslation:{x:599,y:229.3},expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
 timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,placementName:'animation',placementTwips:{x:8248,y:6266},placementPixels:{x:412.4,y:313.3}},local:{timelineId:'sprite-190',frameCount:385,livePlaybackEndFrame:52,playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},stageRenderOffset:{x:412.4-599,y:313.3-229.3}},
 runtimeContract:{kind:'structural-local-frame',scenarios:['source-explicit-frames'],defaultScenario:'source-explicit-frames',supportedLanguages:['en'],visualLocalization:'Source English teaching visuals; native Spanish host controls and source dictionary',seedMapping:'fixed zero; page state owns deterministic host branch',blockedLocalFrameRanges:[],currentCanonicalFrameDomainDispositionAsserted:false,unresolved:['Original-runtime and listening acceptance remain independent.','Read-only dynamic feedback uses device text at source field bounds.']},
 output:{script:'canvas-renderer-draft.js',manifest:'canvas-manifest-v1.json',spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
read('scripts/build-safe-ffdec-canvas-adapter.mjs','1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd');
read('scripts/lib/g678-source-clip-masks-v1.mjs','e064fb7cb98e66f08e5173bdfc756641b6a8ddae86f7e4dab02e90fdb3bbd70e');
let runtime=buildSafeRuntime({helperSource:helper.toString(),framesHtml:frames,spec}).runtime.replaceAll(`course-${ID}`,ID);
runtime=normalizeSourceClipMasks(runtime,[
 {characterId:3,placements:[{depth:1,clipDepth:3}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.23137255]));'},
 {characterId:21,placements:[{depth:1,clipDepth:7}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,255,0.43137255]));'},
 {characterId:176,placements:[{depth:40,clipDepth:49},{depth:50,clipDepth:55}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.2]));'}],xml);
runtime=once(runtime,'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }','if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("seed must be fixed zero");\n    }');
const feedbackFrames={46:31,78:25,111:27,119:27,147:31,161:29,175:28};
const validate=`var selectedFeedback=null;
    if(request.feedback!==undefined && request.feedback!==null){
        if(frame!==52 || typeof request.feedback!=="object" || Array.isArray(request.feedback))throw new Error("feedback requires quiz frame52");
        var id=request.feedback.spriteId,local=request.feedback.localFrame,frames=${JSON.stringify(feedbackFrames)},wrong=[147,161,175].indexOf(id)>=0;
        var keys=wrong?"localFrame,spriteId,wrongAttempt":"localFrame,spriteId";
        if(Object.keys(request.feedback).sort().join(",")!==keys||!Object.prototype.hasOwnProperty.call(frames,id)||!Number.isSafeInteger(id)||!Number.isSafeInteger(local)||local<2||local>frames[id])throw new Error("unsupported feedback");
        var attempt=request.feedback.wrongAttempt;
        if(wrong && attempt!==1 && attempt!==2)throw new Error("source wrong attempt must be 1 or 2");
        selectedFeedback=Object.freeze({spriteId:id,localFrame:local,hostX:5,wrongText:wrong?(attempt===1?${JSON.stringify(model.firstWrongText)}:${JSON.stringify(model.laterWrongText)}):null});
    }
    `;
runtime=once(runtime,'    return Object.freeze({\n        frameDomain:',`    ${validate}return Object.freeze({\n        frameDomain:`);
runtime=once(runtime,'        audioRendered: false\n    });','        audioRendered: false,\n        feedback:selectedFeedback\n    });');
for(const id of Object.keys(feedbackFrames)){
 let count=0;runtime=runtime.replace(new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`,'gm'),(line,indent)=>{
  count++;let changed=line.replace(/,1,\(0\+time\)%\d+,51,time\);$/,',1,P033_FEEDBACK.localFrame-1,51,P033_FEEDBACK.localFrame-1);');assert.notEqual(changed,line);
  // Source host assigns _x=5 to the chosen feedback instance, retaining y/scale.
  changed=changed.replace(/(\[[^\]]+)\]/,(_,matrix)=>{const values=matrix.slice(1).split(',');assert.equal(values.length,6);values[4]='5';return '['+values.join(',')+']';});
  return `${indent}if(P033_FEEDBACK && P033_FEEDBACK.spriteId===${id}) ${changed.trim()}`;
 });assert.equal(count,1,`feedback${id}`);
}
for(const id of [142,157,171]){
 assert.equal(fn(frames,`text${id}`),`function text${id}(ctx,ctrans,frame,ratio,time){\n}`);
 assert.deepEqual(model.editTexts[id].boundsTwips,{left:-2842,right:6925,top:-40,bottom:1278});
 runtime=once(runtime,fn(frames,`text${id}`),`function text${id}(ctx,ctrans,frame,ratio,time){
    if(!P033_FEEDBACK||!P033_FEEDBACK.wrongText)return;
    ctx.save();try{ctx.beginPath();ctx.rect(-2842,-40,9767,1318);ctx.clip();
    ctx.font="300px Arial, sans-serif";ctx.fillStyle="#000000";ctx.textBaseline="alphabetic";
    var words=P033_FEEDBACK.wrongText.split(" "),line="",y=300;
    for(var i=0;i<words.length;i++){var next=line?line+" "+words[i]:words[i];
      if(line&&ctx.measureText(next).width>9687){ctx.fillText(line,-2802,y);y+=340;line=words[i];}else line=next;}
    if(line)ctx.fillText(line,-2802,y);
    }finally{ctx.restore();}
}`);
}
runtime=once(runtime,'var readyPromise = null;','var P033_FEEDBACK=null;\nvar readyPromise = null;');
runtime=once(runtime,'\nSAFE_OBJECTS = Object.freeze({',`\n${fn(root,'shape1')}\n\n${fn(root,'sprite2')}\n\nSAFE_OBJECTS = Object.freeze({`);
runtime=once(runtime,'SAFE_OBJECTS = Object.freeze({\n','SAFE_OBJECTS = Object.freeze({\n        "shape1":shape1,"sprite2":sprite2,\n');
runtime=once(runtime,'        ctx.transform(1, 0, 0, 1, -186.60000000000002, 84);',
 '        place("sprite2",canvas,ctx,[0.05,0,0,0.05,401.45,42.55],new cxform(0,0,0,0,255,255,255,255),1,0,5,0);\n        ctx.transform(1, 0, 0, 1, -186.60000000000002, 84);');
runtime=once(runtime,'    var previousCanvas = canvas;\n    canvas = targetCanvas;','    var previousCanvas = canvas;\n    var previousFeedback=P033_FEEDBACK;\n    P033_FEEDBACK=state.feedback;\n    canvas = targetCanvas;');
runtime=once(runtime,'        canvas = previousCanvas;','        canvas = previousCanvas;\n        P033_FEEDBACK=previousFeedback;');
runtime=once(runtime,'        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));','        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));\n        targetCanvas.setAttribute("data-p033-feedback-sprite",state.feedback?String(state.feedback.spriteId):"none");');
assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame|fetch)\s*\(/.test(runtime));
const context=createContext({document:{createElement:k=>{assert.equal(k,'img');return {complete:false,naturalWidth:0};}}});new Script(runtime).runInContext(context,{timeout:30000});const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
for(let frame=1;frame<=385;frame++)assert.equal(asset.resolveFrameState({frame}).localFrame,frame);
for(const [id,last] of Object.entries(feedbackFrames))for(let frame=2;frame<=last;frame++)for(const attempt of [1,2])assert.equal(asset.resolveFrameState({frame:52,feedback:{spriteId:+id,localFrame:frame,...(+id>=147?{wrongAttempt:attempt}:{})}}).feedback.localFrame,frame);
for(const request of [{frame:0},{frame:386},{frame:1,seed:1},{frame:1,lang:'es'},{frame:51,feedback:{spriteId:147,localFrame:2,wrongAttempt:1}},{frame:52,feedback:{spriteId:147,localFrame:2,wrongAttempt:0}},{frame:52,feedback:{spriteId:147,localFrame:32,wrongAttempt:1}}])assert.throws(()=>asset.resolveFrameState(request));
const outputs=new Map([[`${OUT}/canvas-renderer-draft.js`,Buffer.from(runtime)],[`${ROOT}/${WORK}/canvas-v1/adapter-spec-v1.json`,json(spec)]]);
outputs.set(`${ROOT}/${WORK}/canvas-v1/canvas-manifest-v1.json`,json({kind:'p033-safe-canvas-candidate-v1',animationId:ID,inputModelSha256:sha(modelBytes),inputReceiptSha256:sha(receipt),mainFrames:385,feedbackFrames,maskIds:[3,21,176],hostFeedbackX:5,dynamicTextFields:[142,157,171],deviceTextFont:'Arial, sans-serif',originalFontFidelity:false,outputs:[...outputs].map(([name,b])=>({path:name,bytes:b.length,sha256:sha(b)})),registered:false,acceptance:false}));
assert(['--write','--check'].includes(process.argv[2]));
for(const [name,b] of outputs){fs.mkdirSync(path.dirname(name),{recursive:true});if(process.argv[2]==='--write'&&!fs.existsSync(name))fs.writeFileSync(name,b,{flag:'wx'});assert.deepEqual(read(name),b,name);}
console.log({mode:process.argv[2],mainFrames:385,feedbackFrames,outputs:[...outputs].map(([name,b])=>({name,bytes:b.length,sha256:sha(b)}))});
