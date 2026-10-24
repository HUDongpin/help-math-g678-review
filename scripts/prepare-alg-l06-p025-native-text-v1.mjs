#!/usr/bin/env node
/** Source-locked P025 native text candidate. Source Canvas glyphs remain the fallback. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB18.swf',bytes:102660,
 sha256:'dcb6b709d71eada47053b50bcfcc1161dec5d1717ebca6cbf8463eb6863dbde6'};
const SOURCE_AUDIT={path:'output/alg-l06-p025-source-audit-v1/source-audit-v1.json',
 bytes:17863,sha256:'7cf5100ab451b501b069b9d8e39e1758410a20e2febbb94d46f585bba50aa8fe'};
const TIMELINE={path:'output/alg-l06-p025-source-audit-v1/timeline-text-v1.json',
 bytes:230020,sha256:'5cb88fd2571a7ba0d67251c42a2d421bb767a7b855a1fe8c0693d62d43bad3de'};
const GEOMETRY={path:'output/alg-l06-p025-text-geometry-v1/text-geometry-v1.json',
 bytes:342675,sha256:'5e9a99748222d8e32cd65ca27501f69094ffffbb04c932a4a158c62435f8ec9d'};
const FRAMES={path:'output/alg-l06-p025-text-geometry-v1/frame-states-v1.json',
 bytes:4193990,sha256:'af38ee8946b13d25b58f1faf8918c25ef04f70f84b550816252139c7bb6e33c5'};
const OUT='output/alg-l06-p025-native-text-v1';
const REPORT=`${OUT}/text-state-source-v1.json`;
const GATES=[['Independent variable',7,28],['Input variable',9,41],
 ['Function',8,50],['Domain',16,295]];
const OWNABLE_IDS=[5,15];
const FALLBACK_IDS=[10,11,12,13,18,20];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});
const asJson=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');

function stableRead(file,expected){
 assert.equal(fs.realpathSync(file),file,`physical file: ${file}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
  before.size<32n*1024n*1024n,`ordinary bounded file: ${file}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable read: ${file}`);
 if(expected){assert.equal(bytes.length,expected.bytes);assert.equal(sha(bytes),expected.sha256);}
 return bytes;
}
function output(relative,bytes,mode){
 const file=path.join(ROOT,relative);
 if(mode==='--write'){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  try{fs.writeFileSync(file,bytes,{flag:'wx'});}
  catch(error){if(error?.code!=='EEXIST')throw error;
   assert(stableRead(file).equals(bytes),`no-replace output: ${relative}`);}
 }else assert(stableRead(file).equals(bytes),`output drift: ${relative}`);
 return pin(relative,bytes);
}
const textOf=definition=>definition.runs.map(run=>run.text).join('');
const inIntervals=(intervals,frame)=>intervals.some(row=>
 row.firstFrame<=frame&&frame<=row.lastFrame);

/** All active source instances of an ID must have complete source ink. */
export function candidateSuppressionForRows(rows,ownedIds=OWNABLE_IDS){
 const selected=[];
 for(const id of ownedIds){
  const active=rows.filter(row=>row.role==='static-text'&&row.characterId===id);
  if(active.length&&active.every(row=>row.completeInk===true&&row.alpha>0))
   selected.push(id);
 }
 return selected;
}

export function build(swf,auditBytes,timelineBytes,geometryBytes,frameBytes,scriptBytes){
 assert.equal(swf.length,SWF.bytes);assert.equal(sha(swf),SWF.sha256);
 for(const [bytes,pin] of [[auditBytes,SOURCE_AUDIT],[timelineBytes,TIMELINE],
  [geometryBytes,GEOMETRY],[frameBytes,FRAMES]]){
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);
 }
 const audit=JSON.parse(auditBytes),timeline=JSON.parse(timelineBytes),
  geometry=JSON.parse(geometryBytes),frameStates=JSON.parse(frameBytes),
  catalog=collectSwfTextSourceCatalog(swf);
 assert.deepEqual(audit.source.swf,SWF);
 assert.equal(audit.source.root,SOURCE_ROOT);
 assert.equal(audit.runtime.header.frameRate,12);
 assert.deepEqual(audit.runtime.domains.map(row=>[row.domain,row.declaredFrames]),
  [['root',10],['sprite-21',299]]);
 assert.deepEqual(catalog,timeline,'fresh SWF text parser matches frozen source catalog');
 assert.deepEqual([catalog.summary.textDefinitions,catalog.summary.textRuns,
  catalog.summary.decodedRuns,catalog.summary.unresolvedRuns], [8,16,16,0]);
 assert.deepEqual([geometry.kind,geometry.source.sha256,geometry.staticInstances.length,
  geometry.masks.map(row=>[row.frame,row.depth,row.clipDepth])],
  ['alg-l06-p025-source-text-geometry-v1',SWF.sha256,24,[[2,1,10],[52,11,16]]]);
 assert.deepEqual([frameStates.sourceSwfSha256,frameStates.frameDomain,
  frameStates.frames.length],[SWF.sha256,'sprite-21',299]);
 assert(frameStates.frames.every((row,index)=>row.frame===index+1),
  'every sprite-21 source frame');
 const main=catalog.timelines.find(row=>row.timelineId==='sprite-21');
 assert(main&&main.declaredFrameCount===299);
 const defs=new Map(catalog.textDefinitions.map(row=>[row.characterId,row]));
 assert.equal(defs.size,8);
 const geomInstances=new Map(geometry.staticInstances.map(row=>[row.instanceId,row]));
 assert.equal(geomInstances.size,24);
 const sourceInstances=main.instances.filter(row=>defs.has(row.characterId));
 assert.equal(sourceInstances.length,24);
 const events=new Map(main.events.map(row=>[row.eventId,row]));
 const textInstances=sourceInstances.map(instance=>{
  const geom=geomInstances.get(instance.instanceId),definition=defs.get(instance.characterId),
   created=events.get(instance.createdByEventId);
  assert(geom&&definition&&created&&created.characterId===instance.characterId);
  assert.deepEqual([geom.characterId,geom.placementFrame,geom.lastFrameExclusive,geom.text],
   [instance.characterId,instance.firstFrame,instance.lastFrameExclusive,textOf(definition)]);
  for(let frame=instance.firstFrame;frame<instance.lastFrameExclusive;frame++){
   const row=frameStates.frames[frame-1].rows.find(x=>x.instanceId===instance.instanceId);
   assert(row,`every active text instance sampled: ${instance.instanceId}/${frame}`);
   assert.deepEqual([row.characterId,row.role,row.completeInk],
    [instance.characterId,'static-text',inIntervals(geom.completeInkIntervals,frame)]);
  }
  const sample=geom.firstCompleteInkFrame===null?null:
   frameStates.frames[geom.firstCompleteInkFrame-1].rows.find(row=>
    row.instanceId===instance.instanceId);
  if(sample)assert.equal(sample.completeInk,true);
  return {instanceId:instance.instanceId,sourceTextId:definition.sourceTextId,
   characterId:instance.characterId,depth:instance.depth,text:textOf(definition),
   firstPlacementFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive,
   sourcePlacementTagSha256:created.sourceTagSha256,
   firstCompleteInkFrame:geom.firstCompleteInkFrame,
   completeInkIntervals:geom.completeInkIntervals,
   firstCompleteGeometry:sample?{compositeMatrix:sample.compositeMatrix,
    bounds:sample.bounds,inkBounds:sample.inkBounds,masks:sample.masks}:null,
   presentationRole:OWNABLE_IDS.includes(instance.characterId)?
    'stable-definition-native-candidate':'source-canvas-fallback'};
 });
 assert.deepEqual(textInstances.map(row=>row.instanceId),
  geometry.staticInstances.map(row=>row.instanceId));
 const textDefinitions=catalog.textDefinitions.map(definition=>({
  sourceTextId:definition.sourceTextId,characterId:definition.characterId,
  sourceTagSha256:definition.sourceTagSha256,boundsTwips:definition.boundsTwips,
  text:textOf(definition),runs:definition.runs.map(run=>({
   sourceTextId:run.sourceTextId,runIndex:run.runIndex,text:run.text,
   colorRgba:run.colorRgba,decodeStatus:run.decodeStatus}))}));
 assert.deepEqual(textDefinitions.map(row=>[row.characterId,row.text]),[
  [5,'The independent variable is the input variable for a function.'],
  [10,'independent'],[11,'variable'],[12,'input'],[13,'function'],
  [15,'The independent variable is the variable for the domain.'],
  [18,'in'],[20,'domain']]);
 assert.deepEqual(geometry.nativeGroups.map(row=>[row.characterId,row.firstCompleteInkFrame]),
  [[5,50],[15,295]]);
 const glossaryControls=GATES.map(([key,buttonId,firstReady])=>{
  const row=geometry.glossary.find(item=>item.key===key),
   source=audit.runtime.buttonActions.find(item=>item.key===key);
  assert(row&&source);
  assert.deepEqual([row.buttonId,row.firstSourceReadyFrame,
   source.characterId,source.instanceId],
   [buttonId,firstReady,buttonId,row.firstReadySample.buttonInstanceId]);
  assert.deepEqual(row.sourceReadyIntervals,[{firstFrame:firstReady,lastFrame:299}]);
  const definition=defs.get(row.textId),run=definition?.runs[row.runIndex];
  assert(run&&run.colorRgba.join(',')==='0,0,204,255',`blue source run ${key}`);
  assert.equal(row.firstReadySample.labelInstanceId,
   textInstances.find(item=>item.characterId===row.textId&&
    item.presentationRole==='stable-definition-native-candidate')?.instanceId);
  return {key,buttonCharacterId:buttonId,buttonInstanceId:source.instanceId,
   sourceActionSha256:source.action.sha256,
   sourcePlacementTagSha256:source.sourceTagSha256,
   sourceLabelTextId:row.textId,sourceLabelInstanceId:row.firstReadySample.labelInstanceId,
   sourceLabelRunId:run.sourceTextId,sourceLabelRunText:run.text,
   firstButtonPlacementFrame:source.placementFrame,
   firstSourceGeometryReadyFrame:firstReady,
   sourceReadyIntervals:row.sourceReadyIntervals,
   originalHostClickObserved:false};
 });
 const frames=frameStates.frames.map(({frame,rows})=>{
  const active=rows.filter(row=>row.role==='static-text'&&defs.has(row.characterId));
  const suppressibleSourceTextIds=candidateSuppressionForRows(active);
  const sourceFallbackInstanceIds=textInstances.filter(item=>
   item.firstPlacementFrame<=frame&&frame<item.lastFrameExclusive&&
   !suppressibleSourceTextIds.includes(item.characterId)).map(item=>item.instanceId);
  return {frame,completeNativeCandidateInstanceIds:active.filter(row=>
   suppressibleSourceTextIds.includes(row.characterId)).map(row=>row.instanceId),
   candidateSuppressibleSourceTextIds:suppressibleSourceTextIds,
   sourceFallbackInstanceIds,
   sourceGeometryReadyGlossaryKeys:glossaryControls.filter(item=>
    inIntervals(item.sourceReadyIntervals,frame)).map(item=>item.key)};
 });
 assert.deepEqual([frames[48].candidateSuppressibleSourceTextIds,
  frames[49].candidateSuppressibleSourceTextIds,
  frames[293].candidateSuppressibleSourceTextIds,
  frames[294].candidateSuppressibleSourceTextIds],
  [[],[5],[5],[5,15]]);
 assert.deepEqual(frames[294].sourceGeometryReadyGlossaryKeys,
  GATES.map(row=>row[0]));
 const report={schemaVersion:1,kind:'alg-l06-p025-native-text-source-state-v1',
  animationId:'shared-alg001-l06-p025',sourceSwfSha256:SWF.sha256,
  frameDomain:'sprite-21',frameCount:299,fps:12,
  inputs:[{...SWF,root:SOURCE_ROOT},pin(SOURCE_AUDIT.path,auditBytes),
   pin(TIMELINE.path,timelineBytes),pin(GEOMETRY.path,geometryBytes),
   pin(FRAMES.path,frameBytes),
   pin('scripts/prepare-alg-l06-p025-native-text-v1.mjs',scriptBytes)],
  inventory:{staticTextDefinitions:8,decodedRuns:16,staticTextInstances:24,
   sourceMasks:2,glossaryControls:4},
  sourcePlacement:{rootFrame:6,matrix:geometry.rootPlacement.matrix},
  textDefinitions,textInstances,
  nativeGroups:geometry.nativeGroups.map(row=>({name:row.name,
   characterId:row.characterId,depth:row.depth,text:row.text,
   firstCompleteInkFrame:row.firstCompleteInkFrame,
   completeInkIntervals:row.completeInkIntervals,
   instanceId:row.firstCompleteSample.instanceId,
   firstCompleteGeometry:{compositeMatrix:row.firstCompleteSample.compositeMatrix,
    bounds:row.firstCompleteSample.bounds,inkBounds:row.firstCompleteSample.inkBounds}})),
  glossaryControls,frames,
  suppressionPolicy:{status:'candidate-only-no-product-suppression',
   candidateTextIds:OWNABLE_IDS,sourceCanvasFallbackTextIds:FALLBACK_IDS,
   requiresActualNativeRenderedInstances:true,
   activeInstanceRule:'all active source instances of the same text ID must have complete ink',
   sourceGlyphRendering:'preserved-until-native-ownership-is-wired'},
  languagePolicy:{sourceTextLanguage:'en',es:'source-en-fallback',
   authoredSpanishTextAbsent:true,doNotInventTranslation:true},
  limits:{sourceGeometryCandidateOnly:true,conservativeGlyphHullNotPixels:true,
   originalRuntimeObserved:false,originalHostClickObserved:false,
   browserVisualObserved:false,fidelityAccepted:false,humanVisualAccepted:false,
   ownerAccepted:false,strictComplete:false,published:false}};
 return {report,outputs:[[REPORT,asJson(report)]]};
}

export function run(mode){
 assert(['--write','--check'].includes(mode),
  'usage: prepare-alg-l06-p025-native-text-v1.mjs --write|--check');
 const swf=stableRead(path.join(SOURCE_ROOT,SWF.path),SWF);
 const audit=stableRead(path.join(ROOT,SOURCE_AUDIT.path),SOURCE_AUDIT);
 const timeline=stableRead(path.join(ROOT,TIMELINE.path),TIMELINE);
 const geometry=stableRead(path.join(ROOT,GEOMETRY.path),GEOMETRY);
 const frames=stableRead(path.join(ROOT,FRAMES.path),FRAMES);
 const script=stableRead(fileURLToPath(import.meta.url));
 const built=build(swf,audit,timeline,geometry,frames,script);
 return {mode,outputs:built.outputs.map(([relative,bytes])=>output(relative,bytes,mode)),
  inventory:built.report.inventory,glossaryGates:built.report.glossaryControls.map(row=>
   [row.key,row.firstSourceGeometryReadyFrame]),
  productSuppressionApplied:false,originalRuntimeObserved:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
