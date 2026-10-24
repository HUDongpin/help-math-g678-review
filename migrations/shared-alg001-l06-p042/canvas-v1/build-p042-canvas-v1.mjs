#!/usr/bin/env node
/** P042-only, source-pinned Canvas promotion. No app or registry writes. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../../..');
const ID='shared-alg001-l06-p042';
const SWF='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/TI/L6TI02.swf';
const LESSON_XML='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/index.xml';
const LOCAL={draft:'generator-input/source-canvas-draft-v1.txt',
 audit:'../audit/source-v1/source-audit.json',swfmill:'../audit/source-v1/swfmill.xml',
 text:'dynamic-text-contract-v1.json'};
const EXPECTED={swf:'7df2077da472138df83a4485c0e15b7f3b1063aefcdcf2e3ded9232c98f68fcb',
 lessonXml:'9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c',
 draft:'ddd67b8557ae6afac5d2f243bcad17a4be001337d32f9a023ad211d386a0e1fe',
 audit:'7f01b7022a3ee6ce789ee7aae307e64e16e512dc7280fc148c8ba94aedd08232',
 swfmill:'40ea4ee818c50df1f5b55aeac764f056eb9e91f8aa770955415c558b903faf54',
 text:'d44eca23c9ebbf80554fde285689122ed8740e95ff7c0fa63eb132b4c1fa7f0f',
 reviewedAsset:'8eebb94446a095f5219bc5b3b46f740179d92e8ee6260a6a5cfa2d9d34fae8f4'};
const ACTIONS={
 mainStart:['main-start.as','df61201e03b5b000c977240bd381ed423cf0ade90fe7b207082ca16931251f7b'],
 quizHold:['quiz-hold.as','8c3a4cfc11c45c873ae23793fd7a086c4915be09f2a59d8bed94b68724df2c8e'],
 nmhOpen:['nmh-open.as','f6250a8480166278aa29a5bddb6f82a7125f46ad583b54e378b48f1dda335116'],
 nmhClose:['nmh-close.as','c9de0d6748b75987a4e25d7a536151e3e08da34bed790b608b92fc92af6473ec'],
 wrongRelease:['wrong-release.as','d0380f1fd177c35ff3311283ca1cde92d564135388b3bded4ad2ddd1f5feb5f7'],
 rightRelease:['right-release.as','55503224c49e9bb7cb4ad98a122b5fa894018cd29e06b39de2c5faf524079268'],
 wrongHold:['wrong-hold.as','3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655'],
 wrongClose:['wrong-close.as','4057c3c6552def15f1e846f96fbf4df07b5166f278dad82eec3eea19b09b3394']};
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
function physical(file){
 const absolute=path.resolve(file);assert.equal(fs.realpathSync(absolute),absolute,`physical ${file}`);
 const before=fs.lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${file}`);
 const bytes=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])assert.equal(before[key],after[key],`${file}:${key}`);
 return bytes;
}
function replaceOnce(source,needle,replacement,label){
 const at=source.indexOf(needle);assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
 return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function build(){
 const swf=physical(SWF),lessonXml=physical(LESSON_XML);
 assert.equal(swf.length,907398);assert.equal(lessonXml.length,13926);
 assert.equal(sha(swf),EXPECTED.swf);assert.equal(sha(lessonXml),EXPECTED.lessonXml);
 const inputs=Object.fromEntries(Object.entries(LOCAL).map(([key,file])=>[key,physical(path.join(HERE,file))]));
 for(const key of Object.keys(LOCAL))assert.equal(sha(inputs[key]),EXPECTED[key],key);
 const audit=JSON.parse(inputs.audit),textContract=JSON.parse(inputs.text);
 assert.equal(audit.identity.animationId,ID);assert.equal(audit.source.swf.sha256,EXPECTED.swf);
 assert.equal(textContract.animationId,ID);assert.equal(textContract.sourceSwfSha256,EXPECTED.swf);
 const actionBytes=Object.fromEntries(Object.entries(ACTIONS).map(([key,[file,hash]])=>{
  const b=physical(path.join(HERE,'generator-input/actions',file));assert.equal(sha(b),hash,key);
  return [key,b];}));
 const a=Object.fromEntries(Object.entries(actionBytes).map(([key,b])=>[key,b.toString().replace(/\r\n?/gu,'\n')]));
 assert.equal(a.mainStart,'Mc_Popup._visible = false;\nCloseBtn._visible = false;\n');
 assert(a.quizHold.includes('stop();')&&a.quizHold.includes('Mc_Popup._visible = false;')&&a.quizHold.includes('CloseBtn._visible = false;'));
 assert(a.nmhOpen.includes('Mc_Popup._visible = true;')&&a.nmhOpen.includes('CloseBtn._visible = true;'));
 assert(a.nmhClose.includes('Mc_Popup._visible = false;')&&a.nmhClose.includes('CloseBtn._visible = false;'));
 assert(a.wrongRelease.includes('Mc_Wrong_Feed4.gotoAndPlay(2);'));
 assert(a.rightRelease.includes('Mc_Right_Feed4.gotoAndPlay(2);'));
 assert.equal(a.wrongHold,'stop();\n');assert(a.wrongClose.includes('_parent.gotoAndPlay(23);'));

 // The retained P042 source drawing draft is generator input only. The first
 // transformation restores source root order: title at stage origin, then the
 // main sprite translation. The second models source-owned visibility.
 let runtime=inputs.draft.toString();
 const oldRoot=`        ctx.transform(1, 0, 0, 1, -188.10000000000002, -49.30000000000001);\n`
  +`        place("shape147", targetCanvas, ctx, [0.05,0,0,0.05,0,0], new cxform(0,0,0,0,255,255,255,255), 1, 0, 0, 0);\n`
  +`        sprite341(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);`;
 const fixedRoot=`        place("shape147", targetCanvas, ctx, [0.05,0,0,0.05,0,0], new cxform(0,0,0,0,255,255,255,255), 1, 0, 0, 0);\n`
  +`        ctx.save();\n        ctx.transform(1, 0, 0, 1, -188.10000000000002, -49.30000000000001);\n`
  +`        sprite341(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);\n        ctx.restore();`;
 runtime=replaceOnce(runtime,oldRoot,fixedRoot,'root order');
 const hiddenGuard=`    var nmhOpen = request.nmhOpen === undefined ? false : request.nmhOpen;\n`
  +`    if (typeof nmhOpen !== "boolean" || (nmhOpen && (frame !== 279 || selectedFeedback !== null))) throw new Error("NMH open requires quiz frame 279 without feedback");\n    `;
 runtime=replaceOnce(runtime,'    return Object.freeze({\n        frameDomain:',hiddenGuard+'return Object.freeze({\n        frameDomain:','NMH validation');
 runtime=replaceOnce(runtime,'        feedback: selectedFeedback\n    });',
  '        feedback: selectedFeedback,\n        nmhOpen: nmhOpen,\n        visibility: Object.freeze({nmhPopup:nmhOpen?"open":"hidden",wrongFeedbackPopup:selectedFeedback&&selectedFeedback.spriteId===292&&selectedFeedback.localFrame>=16&&selectedFeedback.localFrame<=22?"open":"hidden"})\n    });','visibility state');
 for(const name of ['sprite145','button181']){
  const regex=new RegExp(`(^[ \\t]*)place\\("${name}"[^\\n]+\\);`,'gm');let count=0;
  runtime=runtime.replace(regex,(line,indent)=>{count++;return `${indent}if (P042_NMH_OPEN) ${line.trim()}`;});
  assert.equal(count,1,`one ${name} placement`);
 }
 runtime=replaceOnce(runtime,'var P042_FEEDBACK = null;','var P042_FEEDBACK = null;\nvar P042_NMH_OPEN = false;','draw flag');
 runtime=replaceOnce(runtime,'    var previousFeedback = P042_FEEDBACK;','    var previousFeedback = P042_FEEDBACK;\n    var previousNmhOpen = P042_NMH_OPEN;','draw scope');
 runtime=replaceOnce(runtime,'    P042_FEEDBACK = state.feedback;','    P042_FEEDBACK = state.feedback;\n    P042_NMH_OPEN = state.nmhOpen;','draw assignment');
 runtime=replaceOnce(runtime,'        P042_FEEDBACK = previousFeedback;','        P042_FEEDBACK = previousFeedback;\n        P042_NMH_OPEN = previousNmhOpen;','draw cleanup');
 runtime=replaceOnce(runtime,'        targetCanvas.setAttribute("data-p042-feedback-frame", state.feedback ? String(state.feedback.localFrame) : "none");',
  '        targetCanvas.setAttribute("data-p042-feedback-frame", state.feedback ? String(state.feedback.localFrame) : "none");\n        targetCanvas.setAttribute("data-p042-nmh-open", String(state.nmhOpen));','draw readback');
 assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame)\s*\(|\bfetch\s*\(/u.test(runtime));
 new Script(runtime,{filename:'p042-canvas-renderer.js'});
 const context=createContext({document:{createElement:kind=>{assert.equal(kind,'img');return {complete:false,naturalWidth:0};}}});
 new Script(runtime).runInContext(context,{timeout:30000});
 const asset=context.HELP_MATH_CANVAS_ASSETS?.[ID];assert(asset);
 for(let frame=1;frame<=400;frame++)assert.equal(asset.resolveFrameState({frame}).localFrame,frame);
 assert.equal(asset.resolveFrameState({frame:279}).visibility.nmhPopup,'hidden');
 assert.equal(asset.resolveFrameState({frame:279,nmhOpen:true}).visibility.nmhPopup,'open');
 assert.equal(asset.resolveFrameState({frame:279,feedback:{spriteId:292,localFrame:22}}).visibility.wrongFeedbackPopup,'open');
 assert.throws(()=>asset.resolveFrameState({frame:278,nmhOpen:true}),/NMH open/u);
 assert.throws(()=>asset.resolveFrameState({frame:279,nmhOpen:true,feedback:{spriteId:292,localFrame:22}}),/NMH open/u);
 const script=Buffer.from(runtime);assert.equal(sha(script),EXPECTED.reviewedAsset,'reviewed v2 asset');
 const metadata=json({schemaVersion:1,kind:'p042-source-canvas-visibility-v2-metadata',animationId:ID,
  physicalSource:{path:SWF,bytes:swf.length,sha256:sha(swf)},
  lessonXml:{path:LESSON_XML,bytes:lessonXml.length,sha256:sha(lessonXml)},
  sourceAudit:{path:'migrations/shared-alg001-l06-p042/audit/source-v1/source-audit.json',sha256:sha(inputs.audit)},
  sourceDrawingInput:{path:'migrations/shared-alg001-l06-p042/canvas-v1/generator-input/source-canvas-draft-v1.txt',
   bytes:inputs.draft.length,sha256:sha(inputs.draft),runtimeUsable:false},
  reviewedOutput:{path:'output/g678-p042-canvas-visibility-v2-20261002/canvas-renderer-visibility-v2.js',
   sha256:EXPECTED.reviewedAsset},
  stage:{width:800,height:600},fps:12,root:{frame:6,shapeId:147,mainSpriteId:341,scale:1},
  main:{frameDomain:'sprite-341',frameCount:400,quizHoldFrame:279,terminalFrame:400},
  stateContract:{request:'render(canvas,{frame,feedback?,nmhOpen?})',nmhOpen:'boolean default false; true only at held frame279 without feedback',
   feedback:'one selected source feedback sprite and local frame at held main frame279',
   wrongFeedbackPopup:'sprite292 local frames16..22; text needs native companion'},
  dynamicTextContract:{path:'migrations/shared-alg001-l06-p042/canvas-v1/dynamic-text-contract-v1.json',
   sha256:sha(inputs.text),canvasDrawsCurrentText:false},
  sourceMask:{shapeId:182,depth:1,clipDepth:7,normalizedOpaqueForCanvas:true},
  morphFunctions:45,embeddedJpegVariables:14,assetSha256:sha(script),
  audioRendered:false,productRegistered:false,visualCalibration:false,
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,audio:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}});
 const manifest=json({schemaVersion:1,kind:'p042-canonical-canvas-v1-manifest',status:'unregistered-source-drawing',
  animationId:ID,sourceSwfSha256:sha(swf),lessonXmlSha256:sha(lessonXml),
  generatorInputs:[{path:SWF,bytes:swf.length,sha256:sha(swf)},
   {path:LESSON_XML,bytes:lessonXml.length,sha256:sha(lessonXml)},
   ...Object.entries(LOCAL).map(([key,file])=>({key,path:path.relative(ROOT,path.join(HERE,file)),bytes:inputs[key].length,sha256:sha(inputs[key])})),
   ...Object.entries(ACTIONS).map(([key,[file]])=>({key,path:path.relative(ROOT,path.join(HERE,'generator-input/actions',file)),
    bytes:actionBytes[key].length,sha256:sha(actionBytes[key])}))],
  outputs:[{path:'migrations/shared-alg001-l06-p042/canvas-v1/canvas-renderer.js',bytes:script.length,sha256:sha(script)},
   {path:'migrations/shared-alg001-l06-p042/canvas-v1/canvas-metadata-v1.json',bytes:metadata.length,sha256:sha(metadata)}],
  sourceFrameCasesPreviouslyVerified:712,
  reviewedChromeDrawSmoke:{path:'output/g678-p042-canvas-visibility-v2-20261002/v2-draw-smoke.json',
   sha256:'dfd432c8eb229a326faa225c41cda4911312554e0d175af9e630b0af52d71f45'},
  unresolved:['Native txtFeed not drawn; original-runtime pixels not compared.',
   'Mask/JPEG/morph appearance and host behavior need separate review.',
   'No source audio or Spanish visual acceptance.'],
  acceptanceEffects:{currentJsRegistered:false,fidelity:false,audio:false,human:false,owner:false,strictComplete:false}});
 return new Map([['canvas-renderer.js',script],['canvas-metadata-v1.json',metadata],['canvas-manifest-v1.json',manifest]]);
}
const mode=process.argv[2];assert(['--build','--check','--plan'].includes(mode),'--build | --check | --plan');
const outputs=build();
for(const [name,bytes] of outputs){const file=path.join(HERE,name);
 if(mode==='--build'&&!fs.existsSync(file))fs.writeFileSync(file,bytes,{flag:'wx'});
 if(mode!=='--plan')assert.deepEqual(physical(file),bytes,`${name} drift`);}
console.log(JSON.stringify({mode,outputs:Object.fromEntries([...outputs].map(([name,b])=>[name,{bytes:b.length,sha256:sha(b)}]))}));
