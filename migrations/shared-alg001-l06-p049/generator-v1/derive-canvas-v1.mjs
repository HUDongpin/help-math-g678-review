#!/usr/bin/env node
/** Source drawing only; P049's reducer supplies the selected feedback clock. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
import {buildSafeRuntime} from '../../../scripts/build-safe-ffdec-canvas-adapter.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const BASE='/Volumes/American Dream/hudongpin/g678-p049-source-extraction-20261002-v1/ffdec-export';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const WORK='migrations/shared-alg001-l06-p049',ID='shared-alg001-l06-p049';
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
function read(name,expected){
 const p=path.resolve(ROOT,name);assert([ROOT,BASE,SOURCE].some(r=>p.startsWith(r+path.sep))&&fs.realpathSync(p)===p);
 const before=fs.lstatSync(p,{bigint:true});assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n);
 const b=fs.readFileSync(p),after=fs.lstatSync(p,{bigint:true});
 for(const k of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])assert.equal(before[k],after[k]);
 if(expected)assert.equal(sha(b),expected,name);return b;
}
function once(s,a,b){const n=s.indexOf(a);assert(n>=0&&s.indexOf(a,n+a.length)<0,a);return s.slice(0,n)+b+s.slice(n+a.length);}
function fn(s,name){const a=s.indexOf(`function ${name}(`),b=s.indexOf('\nfunction ',a+1);assert(a>=0&&b>a);return s.slice(a,b).trimEnd();}
const receipt=read(`${WORK}/audit-v1/ffdec-source-extraction-v1.json`,'627d66b7eb6fd51ec433f79ce2183a851c4c23a9e5464017484bdc06bbf0b3e7');
const intake=JSON.parse(receipt);assert.equal(intake.sourceSha256,'33f90f5897fa60939fb7015f60c8789d98aad3dca65ad39cb04dac4fededb3a6');
assert.equal(intake.exitCode,0);assert.equal(intake.exportRoot,BASE);assert.equal(intake.files.length,413);
for(const pin of intake.files)assert.equal(read(`${BASE}/${pin.path}`,pin.sha256).length,pin.bytes);
const modelBytes=read(`${WORK}/native-v1/source-model-v1.json`,'81f503a766465d83f78826c079b695491327d908d37af0b36c60ae20cb430c58');
const source=JSON.parse(modelBytes);
for(const pin of source.inputs)assert.equal(read(pin.path,pin.sha256).length,pin.bytes);
const framesPath=`${BASE}/sprites/DefineSprite_327/frames.html`,helperPath=`${BASE}/sprites/DefineSprite_327/canvas.js`;
const frames=read(framesPath).toString().replace(/\r\n?/g,'\n'),helper=read(helperPath);
const root=read(`${BASE}/frames/frames.html`).toString().replace(/\r\n?/g,'\n');
const reachable=source.frameDomains.filter(d=>d.displayReachable);
assert.equal(reachable.length,14);
for(const row of reachable)assert.deepEqual([...fn(frames,`sprite${row.spriteId}`).matchAll(/\bcase\s+(\d+)\s*:/g)].map(m=>+m[1]),Array.from({length:row.frameCount},(_,i)=>i));
const reachableCases=reachable.reduce((n,row)=>n+row.frameCount,0);
assert(fn(frames,'sprite327').includes('ctx.transform(1,0,0,1,477.25,669.7);'));
assert(frames.includes('<canvas id="myCanvas" width="829" height="1281"'));
assert.deepEqual(source.rootMatrixTwips,{scaleX:1,scaleY:1,skewX:0,skewY:0,transX:8248,transY:5666});
const placed=[...new Set([...frames.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/g)].map(m=>m[1]))].sort();
const fonts=[...frames.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/g)].map(m=>m[1]);
const images=[...frames.matchAll(/var\s+(imageObj\d+)\s*=\s*document\.createElement\("img"\);/g)].map(m=>m[1]);
const pin=name=>name.endsWith('/native-v1/source-model-v1.json')?{sha256:sha(modelBytes)}:source.inputs.find(p=>p.path===name);
const spec={schemaVersion:1,animationId:`course-${ID}`,classification:'behavior-heavy-unregistered-source-canvas-draft-v1',
 source:{swf:'$HELP_MATH_G678_SOURCE_ROOT/G6-G8-shared/ALG001/L6/TI/L6TI09.swf',swfSha256:pin(`${WORK}/source-v1/L6TI09.swf`).sha256},
 evidence:{scenarioInventory:`${WORK}/native-v1/source-model-v1.json`,scenarioInventorySha256:pin(`${WORK}/native-v1/source-model-v1.json`).sha256,
 audioAudit:`${WORK}/native-v1/source-model-v1.json`,audioAuditSha256:pin(`${WORK}/native-v1/source-model-v1.json`).sha256,
 sourceXml:`${WORK}/audit-v1/swfmill.xml`,sourceXmlSha256:pin(`${WORK}/audit-v1/swfmill.xml`).sha256},
 ffdecExport:{tool:'JPEXS Free Flash Decompiler 26.2.1 Canvas export',helper:helperPath,helperSha256:sha(helper),framesHtml:framesPath,framesHtmlSha256:sha(read(framesPath)),
 targetSpriteObjectId:327,targetSpriteFunction:'sprite327',exportCanvas:{width:829,height:1281},exportInternalTranslation:{x:477.25,y:669.7},
 expectedPlacedFunctionCount:placed.length,expectedPlacedFunctionsSha256:sha(JSON.stringify(placed)),expectedFontFunctionCount:fonts.length,expectedFontFunctionsSha256:sha(JSON.stringify(fonts)),
 embeddedImageVariableCount:images.length,embeddedImageVariablesSha256:sha(JSON.stringify(images))},
 timeline:{fps:12,stage:{width:800,height:600,backgroundColor:'#b8d8f7'},root:{frameCount:10,preloaderStopFrame:1,beginFrame:6,placementName:'animation',placementTwips:{x:8248,y:5666},placementPixels:{x:412.4,y:283.3}},
 local:{timelineId:'sprite-327',frameCount:401,livePlaybackEndFrame:159,playbackMode:'state-explorer',publicFrameIndexing:'one-indexed'},stageRenderOffset:{x:412.4-477.25,y:283.3-669.7}},
 runtimeContract:{kind:'structural-local-frame',scenarios:['source-explicit-frames'],defaultScenario:'source-explicit-frames',supportedLanguages:['en'],visualLocalization:'Source English visuals; Spanish host controls do not translate teaching content',seedMapping:'fixed zero; no AVM1 executed',blockedLocalFrameRanges:[],currentCanonicalFrameDomainDispositionAsserted:false,
 unresolved:['Native companion owns help visibility; Canvas also renders source dynamic WrongFeed text.','Source frame/sample alignment, original-runtime comparison and listening are independent.']},
 output:{script:'canvas-renderer-draft.js',manifest:'canvas-candidate-manifest-v1.json',spec:'adapter-spec-v1.json',globalRegistry:'HELP_MATH_CANVAS_ASSETS'},strictAcceptanceEffect:'none'};
read('scripts/build-safe-ffdec-canvas-adapter.mjs','1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd');
let runtime=buildSafeRuntime({helperSource:helper.toString(),framesHtml:frames,spec}).runtime.replaceAll(`course-${ID}`,ID);
runtime=once(runtime,'if (!Number.isSafeInteger(rawSeed)) {\n        throw new Error("seed must be a safe integer");\n    }','if (!Number.isSafeInteger(rawSeed) || rawSeed !== 0) {\n        throw new Error("seed must be fixed zero");\n    }');
const feedbackFrames={192:25,302:28};
const validate=`var selectedFeedback=null;
    if(request.feedback!==undefined && request.feedback!==null){
        if(frame!==159 || typeof request.feedback!=="object" || Array.isArray(request.feedback))throw new Error("feedback requires exact quiz frame159");
        var id=request.feedback.spriteId,local=request.feedback.localFrame,frames=${JSON.stringify(feedbackFrames)};
        var keys=id===302?"localFrame,spriteId,wrongAttempt":"localFrame,spriteId";
        if(Object.keys(request.feedback).sort().join(",")!==keys || !Object.prototype.hasOwnProperty.call(frames,id)||!Number.isSafeInteger(id)||!Number.isSafeInteger(local)||local<2||local>frames[id])throw new Error("unsupported source feedback");
        var attempt=request.feedback.wrongAttempt;
        if(id===302 && attempt!==0 && attempt!==1)throw new Error("wrong attempt must be source counter0 or1");
        var text=id===302?(attempt===0?${JSON.stringify(source.sourceBehavior.wrong4.firstText)}:${JSON.stringify(source.sourceBehavior.wrong4.secondText)}):null;
        selectedFeedback=Object.freeze({spriteId:id,localFrame:local,wrongText:text});
    }
    `;
runtime=once(runtime,'    return Object.freeze({\n        frameDomain:',`    ${validate}return Object.freeze({\n        frameDomain:`);
runtime=once(runtime,'        audioRendered: false\n    });','        audioRendered: false,\n        feedback:selectedFeedback\n    });');
// Source frame159 places all eight library feedback clips. AS2 selects only 192/302.
// Native state supplies that explicit selection; never run their ambient clocks.
for(const id of [192,206,227,239,255,270,302,323]){
 let count=0;runtime=runtime.replace(new RegExp(`(^[ \\t]*)place\\("sprite${id}"[^\\n]+\\);`,'gm'),(line,indent)=>{
  count++;const changed=line.replace(/,1,\(0\+time\)%\d+,158,time\);$/,',1,P049_FEEDBACK.localFrame-1,158,P049_FEEDBACK.localFrame-1);');assert.notEqual(line,changed);
  return `${indent}if(P049_FEEDBACK && P049_FEEDBACK.spriteId===${id}) ${changed.trim()}`;
 });assert.equal(count,1,`feedback${id}`);
}
for(const name of ['sprite138','button180']){
 let n=0;runtime=runtime.replace(new RegExp(`^[ \\t]*place\\("${name}"[^\\n]+\\);`,'gm'),()=>{n++;return '/* Source help visibility and Close belong to the native companion. */';});assert.equal(n,1,name);
}
for(const id of [253,265,292,321])assert.equal(fn(frames,`text${id}`),`function text${id}(ctx,ctrans,frame,ratio,time){\n}`);
const edit=source.editTexts['292'];
assert.deepEqual(edit.boundsTwips,{left:-2842,right:6924,top:-40,bottom:978});
assert.equal(edit.attributes.fontHeight,'300');assert.equal(edit.attributes.leading,'40');
// Device-text substitution remains distinct from original Flash font fidelity.
// Keep the source field bounds/size and the two exact ActionScript strings.
runtime=once(runtime,fn(frames,'text292'),`function text292(ctx,ctrans,frame,ratio,time){
    if(!P049_FEEDBACK || !P049_FEEDBACK.wrongText)return;
    ctx.save();
    try {
        ctx.beginPath();ctx.rect(-2842,-40,9766,1018);ctx.clip();
        ctx.font="300px Arial, sans-serif";ctx.fillStyle="#000000";ctx.textBaseline="alphabetic";
        var words=P049_FEEDBACK.wrongText.split(" "),line="",y=300;
        for(var i=0;i<words.length;i++){
            var next=line?line+" "+words[i]:words[i];
            if(line && ctx.measureText(next).width>9686){ctx.fillText(line,-2802,y);y+=340;line=words[i];}
            else line=next;
        }
        if(line)ctx.fillText(line,-2802,y);
    }finally{ctx.restore();}
}`);

runtime=once(runtime,'var readyPromise = null;','var P049_FEEDBACK=null;\nvar readyPromise = null;');
runtime=once(runtime,'\nSAFE_OBJECTS = Object.freeze({',`\n${fn(root,'shape140')}\n\nSAFE_OBJECTS = Object.freeze({`);
runtime=once(runtime,'SAFE_OBJECTS = Object.freeze({\n','SAFE_OBJECTS = Object.freeze({\n        "shape140":shape140,\n');
runtime=once(runtime,'    ctx.save();\n    try {\n        ctx.transform(1, 0, 0, 1,','    ctx.save();\n    try {\n        place("shape140",targetCanvas,ctx,[0.05,0,0,0.05,0,0],new cxform(0,0,0,0,255,255,255,255),1,0,0,0);\n        ctx.transform(1, 0, 0, 1,');
runtime=once(runtime,'    var previousCanvas = canvas;\n    canvas = targetCanvas;','    var previousCanvas = canvas;\n    var previousFeedback=P049_FEEDBACK;\n    canvas = targetCanvas;\n    P049_FEEDBACK=state.feedback;');
runtime=once(runtime,'        ctx.restore();\n        canvas = previousCanvas;','        ctx.restore();\n        canvas = previousCanvas;\n        P049_FEEDBACK=previousFeedback;');
runtime=once(runtime,'        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));','        targetCanvas.setAttribute("data-runtime-seed", String(state.seed));\n        targetCanvas.setAttribute("data-p049-feedback-sprite",state.feedback?String(state.feedback.spriteId):"none");\n        targetCanvas.setAttribute("data-p049-feedback-frame",state.feedback?String(state.feedback.localFrame):"none");');
assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame|fetch)\s*\(/.test(runtime));
const context=createContext({document:{createElement:kind=>{assert.equal(kind,'img');return {complete:false,naturalWidth:0};}}});
new Script(runtime).runInContext(context,{timeout:30000});const asset=context.HELP_MATH_CANVAS_ASSETS[ID];
for(let frame=1;frame<=401;frame++)assert.equal(asset.resolveFrameState({frame}).localFrame,frame);
for(const [id,last] of Object.entries(feedbackFrames))for(let frame=2;frame<=last;frame++)assert.equal(asset.resolveFrameState({frame:159,feedback:{spriteId:+id,localFrame:frame,...(+id===302?{wrongAttempt:0}:{})}}).feedback.localFrame,frame);
for(const request of [{frame:0},{frame:402},{frame:1,seed:1},{frame:1,lang:'es'},{frame:158,feedback:{spriteId:302,localFrame:22}},{frame:159,feedback:{spriteId:323,localFrame:2}},{frame:159,feedback:{spriteId:302,localFrame:29}}])assert.throws(()=>asset.resolveFrameState(request));
const outputs=new Map([['canvas-renderer-draft.js',Buffer.from(runtime)],['adapter-spec-v1.json',json(spec)]]);
outputs.set('canvas-candidate-manifest-v1.json',json({kind:'p049-safe-canvas-draft-v1',animationId:ID,inputReceiptSha256:sha(receipt),mainFrames:401,reachableCases,selectedFeedbackFrames:feedbackFrames,suppressedNativeHelp:['sprite138','button180'],rootShapeStageCoordinates:true,dynamicWrongText:{sourceField:292,sourceFont:'Bauhaus Md BT device text',replacementFont:'Arial, sans-serif',originalFontFidelity:false},outputs:[...outputs].map(([name,b])=>({path:`${WORK}/canvas-v1/${name}`,bytes:b.length,sha256:sha(b)})),registered:false,originalRuntimeAccepted:false,listeningAccepted:false}));
assert(['--write','--check'].includes(process.argv[2]));fs.mkdirSync(path.join(ROOT,WORK,'canvas-v1'),{recursive:true});
for(const [name,b] of outputs){const p=`${WORK}/canvas-v1/${name}`;if(process.argv[2]==='--write'&&!fs.existsSync(path.join(ROOT,p)))fs.writeFileSync(path.join(ROOT,p),b,{flag:'wx'});assert.deepEqual(read(p),b,p);}
console.log({mode:process.argv[2],mainFrames:401,feedbackFrames,outputs:[...outputs].map(([name,b])=>({name,bytes:b.length,sha256:sha(b)}))});
