#!/usr/bin/env node
/** Build browser-safe P053 source scene data. No playback or AVM1 is executed. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const OUTPUT='packages/demos/src/generated/nms-l02-p053-display-data-v1.ts';
export const SCENE={path:'migrations/shared-nms002-l02-p053/audit/visual-scene-v1.json',bytes:1565440,sha256:'b22a2e71c920e425d397a0070338ef9d66e714fff31df8959d9115878fbe8ea7'};
const NATIVE={path:'migrations/shared-nms002-l02-p053/audit/native-display-product-v1.json',bytes:358217,sha256:'2c00b045bf3153ac5f6aadcc197674aca9f368354d85ffbe6bb620854c039151'};
const sha=b=>createHash('sha256').update(b).digest('hex');
function bound(root,pin){
 const file=path.join(root,pin.path),before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,'physical input');
 assert.equal(fs.realpathSync(file),file,'physical input path');
 const b=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])assert.equal(after[key],before[key]);
 assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);return b;
}
const SCRIPT_CONTENT=Object.freeze({
 'frame_6/DoAction.as':'stop();',
 'DefineSprite_119/frame_1/DoAction.as':'stop();',
 'DefineSprite_126/frame_1/DoAction.as':'stop();',
 'DefineSprite_130/frame_1/DoAction.as':'stop();',
 'DefineSprite_136/frame_1/DoAction.as':'stop();',
 'DefineSprite_186/frame_1/DoAction.as':'stop();',
 'DefineSprite_187/frame_1/DoAction.as':'_global.gameLevel1 = false;\n_global.gameLevel2 = false;\nMc_Msg._visible = false;',
 'DefineSprite_187/frame_693/DoAction.as':'stop();\nMc_Popup._visible = false;',
});
export function projectP053Scene(scene,native,scriptReads){
 assert.equal(scene.kind,'nms-l02-p053-visual-scene-source-v1');
 assert.equal(scene.animationId,'shared-nms002-l02-p053');
 assert.equal(scene.source.sha256,native.source.sha256);
 assert.equal(scene.definitions.shapes.length,48);assert.equal(scene.definitions.texts.length,37);
 const scriptPins=Object.entries(SCRIPT_CONTENT).map(([relative,content])=>{
  const pin=native.extraction.scriptPins.find(p=>p.path===relative);assert(pin,relative);
  const bytes=scriptReads.get(relative);assert(bytes,relative);
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,relative);
  assert.equal(bytes.toString('utf8').replace(/\r\n/gu,'\n').trim(),content,`reviewed script ${relative}`);
  return pin;
 });
 const fields=['eventId','frame','kind','characterId','depth','instanceId','move','clipActions','matrix',
  'colorTransform','clipDepth','ratio','name','visible','blendMode','filters',
  'cacheAsBitmap','backgroundColorRgba','sourceTagSha256'];
 const domains=scene.domains.map(domain=>({id:domain.id,
  declaredFrameCount:domain.declaredFrameCount,observedFrameCount:domain.observedFrameCount,
  events:domain.events.map(event=>Object.fromEntries(fields.filter(k=>event[k]!==undefined).map(k=>[k,event[k]]))),
  instances:domain.instances,masks:domain.masks}));
 const stopped=[119,126,130,136,186];
 for(const domain of domains){
  if(['root','sprite-187'].includes(domain.id))continue;
  const id=Number(domain.id.slice(7));assert(stopped.includes(id)||domain.declaredFrameCount===1,
   `child clock needs review ${domain.id}`);
 }
 const definitions={bitmaps:[],shapes:scene.definitions.shapes.map(p=>({characterId:p.characterId,
  boundsTwips:p.boundsTwips,sourceTagSha256:p.sourceTagSha256})),
  texts:scene.definitions.texts,sprites:scene.definitions.sprites,buttons:scene.definitions.buttons};
 return {schemaVersion:scene.schemaVersion,kind:scene.kind,animationId:scene.animationId,source:scene.source,rootPlacement:scene.rootPlacement,
  mainFrameDomain:scene.mainFrameDomain,definitions,domains,
  reviewedFrameActions:{scriptPins,rootHeldFrame:6,mainEntry:{frame:1,resetLevels:true,hideInstance:'Mc_Msg'},
   mainHeld:{frame:693,hideInstance:'Mc_Popup'},stoppedChildFrames:Object.fromEntries(stopped.map(id=>[`sprite-${id}`,1])),
   oneFrameChildren:domains.filter(d=>d.declaredFrameCount===1).map(d=>d.id)},
  boundary:{sourceProjectionOnly:true,originalRuntimeObserved:false,childClocksMustBeExplicit:true,
   dynamicText111Unresolved:true,buttonInteractionNotExecuted:true,audioSynchronizationUnresolved:true,
   earlyStartHostExecutionUnresolved:true,laterStartHostExecutionUnresolved:true,
   popupCloseReceiverUnresolved:true,frame694NaturalPlaybackEstablished:false,
   currentJsRegistered:false,strictComplete:false,published:false}};
}
export function buildP053DisplayData(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact physical source root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const scene=JSON.parse(bound(ROOT,SCENE)),native=JSON.parse(bound(ROOT,NATIVE));
 bound(SOURCE_ROOT,{path:scene.source.relativePath,bytes:scene.source.bytes,sha256:scene.source.sha256});
 const scriptReads=new Map(Object.keys(SCRIPT_CONTENT).map(relative=>{
  const pin=native.extraction.scriptPins.find(p=>p.path===relative);assert(pin,relative);
  return [relative,bound(native.extraction.scriptsRoot,pin)];
 }));
 return projectP053Scene(scene,native,scriptReads);
}
export function renderP053DisplayData(data){
 return Buffer.from('// Generated by scripts/generate-nms-l02-p053-display-data-v1.mjs; do not edit.\n'
  +'// Source projections and reviewed frame actions; no original-runtime or admission claim.\n'
  +"import type {P053DisplayScene} from '../nms-l02-p053-display-state-v1';\n"
  +`export const P053_DISPLAY_SOURCE = ${JSON.stringify({scene:SCENE,native:NATIVE})} as const;\n`
  +`export const P053_DISPLAY_DATA = ${JSON.stringify(data)} as const;\n`
  +'export const P053_DISPLAY_SCENE: P053DisplayScene = P053_DISPLAY_DATA;\n');
}
function main(){
 const mode=process.argv[2]??'--plan';assert(['--plan','--prepare','--check'].includes(mode));
 assert(process.argv.length<=3);const data=buildP053DisplayData(),bytes=renderP053DisplayData(data);
 const file=path.join(ROOT,OUTPUT);
 if(mode==='--prepare')fs.writeFileSync(file,bytes,{flag:'wx'});
 if(mode==='--check')assert(fs.readFileSync(file).equals(bytes),'P053 display data drift');
 console.log(JSON.stringify({status:'PASS',mode,output:{path:OUTPUT,bytes:bytes.length,sha256:sha(bytes)},domains:data.domains.length,scriptPins:data.reviewedFrameActions.scriptPins.length}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
