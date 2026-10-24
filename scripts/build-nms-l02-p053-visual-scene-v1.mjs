#!/usr/bin/env node
/** P053 physical-SWF visual scene facts. Source placements are not executed AVM1. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const P053_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
export const P053_SOURCE_RELATIVE='G6-G8-shared/NMS002/L2/GS/L2GS02.swf';
export const P053_XML='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/movie.xml';
export const P053_NATIVE_IR='migrations/shared-nms002-l02-p053/audit/native-display-product-v1.json';
export const P053_OUTPUT='migrations/shared-nms002-l02-p053/audit/visual-scene-v1.json';
const SOURCE={bytes:236774,sha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf'};
const XML={bytes:1262572,sha256:'058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1'};
const NATIVE={bytes:358217,sha256:'2c00b045bf3153ac5f6aadcc197674aca9f368354d85ffbe6bb620854c039151'};
const CATALOG_SHA='4b92f48d2416025e423aefb70ecd5873212fe697da3af6e2322a527f1733eb9e';
const MAIN_ACTION_SHA='d12396116fd8ca67d73447927819dc614493bdad77cf78531ba3fdb7484bdbd1';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);

function readBound(file,pin){
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`physical input ${file}`);
 assert.equal(fs.realpathSync(file),file,`real input ${file}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])
  assert.equal(after[key],before[key],`changed input ${file}`);
 assert.equal(bytes.length,pin.bytes,`input bytes ${file}`);
 assert.equal(sha(bytes),pin.sha256,`input SHA ${file}`);
 return bytes;
}

function xmlDefinition(document,tag,id){
 const re=new RegExp(`<${tag}\\b[^>]*\\bobjectID="${id}"[^>]*>`,'gu');
 const hits=[...document.matchAll(re)];
 assert.equal(hits.length,1,`one XML ${tag} ${id}`);
 const open=hits[0],end=document.indexOf(`</${tag}>`,open.index+open[0].length);
 assert(end>open.index,`closed XML ${tag} ${id}`);
 return document.slice(open.index,end+tag.length+3);
}

function sourceShape(definition,document){
 const fragment=xmlDefinition(document,definition.tagName,definition.characterId);
 const bounds=/<bounds>\s*<Rectangle\b([^>]*)\/>\s*<\/bounds>/u.exec(fragment);
 assert(bounds,`shape bounds ${definition.characterId}`);
 const rect=Object.fromEntries([...bounds[1].matchAll(/(left|right|top|bottom)="(-?\d+)"/gu)]
  .map(item=>[item[1],Number(item[2])]));
 assert.deepEqual(Object.keys(rect).sort(),['bottom','left','right','top'],`shape rectangle ${definition.characterId}`);
 assert(rect.left<=rect.right&&rect.top<=rect.bottom,`ordered bounds ${definition.characterId}`);
 const geometry={shapeSetup:(fragment.match(/<ShapeSetup\b/gu)??[]).length,
  lines:(fragment.match(/<LineTo\b/gu)??[]).length,
  curves:(fragment.match(/<CurveTo\b/gu)??[]).length};
 assert(geometry.shapeSetup>0&&geometry.lines+geometry.curves>0,
  `nonempty source vector ${definition.characterId}`);
 return {characterId:definition.characterId,kind:definition.tagName,
  sourceTagOffset:definition.sourceTagOffset,sourceTagSha256:definition.sourceTagSha256,
  xmlFragmentSha256:sha(fragment),boundsTwips:rect,geometryCounts:geometry,
  // The canonical fragment retains fills, gradients, edge order and geometry;
  // a later renderer must interpret it rather than infer a drawing here.
  sourceDefinitionXml:fragment};
}

function reachableDefinitions(catalog){
 const timelines=new Map(catalog.timelines.map(item=>[item.timelineId,item]));
 const buttons=new Map(catalog.buttonDefinitions.map(item=>[item.characterId,item]));
 const shapes=new Map(catalog.shapeDefinitions.map(item=>[item.characterId,item]));
 const bitmaps=new Map(catalog.bitmapDefinitions.map(item=>[item.characterId,item]));
 const texts=new Map(catalog.textDefinitions.map(item=>[item.characterId,item]));
 const visited=new Set(),reached={sprites:new Set(),buttons:new Set(),shapes:new Set(),bitmaps:new Set(),texts:new Set()};
 const queue=['root'];
 const encounter=id=>{
  if(timelines.has(`sprite-${id}`))queue.push(`sprite-${id}`);
  else if(buttons.has(id))queue.push(`button-${id}`);
  else if(shapes.has(id))reached.shapes.add(id);
  else if(bitmaps.has(id))reached.bitmaps.add(id);
  else if(texts.has(id))reached.texts.add(id);
  else assert.fail(`unclassified placed character ${id}`);
 };
 while(queue.length){
  const domain=queue.shift();if(visited.has(domain))continue;visited.add(domain);
  if(domain.startsWith('button-')){
   const id=Number(domain.slice(7)),button=buttons.get(id);
   assert(button,`button definition ${id}`);reached.buttons.add(id);
   for(const item of button.statePlacements)encounter(item.characterId);
  }else{
   const timeline=timelines.get(domain);assert(timeline,`timeline definition ${domain}`);
   if(domain!=='root')reached.sprites.add(Number(domain.slice(7)));
   for(const item of timeline.instances)encounter(item.characterId);
  }
 }
 return {timelines,buttons,shapes,bitmaps,texts,visited,reached};
}

function sourceEvents(timeline){
 const events=timeline.events.map(event=>{
  assert(['place','remove','action-bytes','frame-label'].includes(event.kind),
   `supported source event ${timeline.timelineId}/${event.kind}`);
  assert(Number.isInteger(event.frame)&&event.frame>=1&&event.frame<=timeline.declaredFrameCount,
   `event frame ${timeline.timelineId}`);
  return event;
 });
 const byId=new Map(events.map(event=>[event.eventId,event]));
 assert.equal(byId.size,events.length,`unique source event IDs ${timeline.timelineId}`);
 for(const instance of timeline.instances){
  assert(instance.firstFrame>=1&&instance.firstFrame<instance.lastFrameExclusive&&
   instance.lastFrameExclusive<=timeline.declaredFrameCount+1,`instance bounds ${instance.instanceId}`);
  const origin=byId.get(instance.createdByEventId);
  assert(origin?.kind==='place'&&origin.characterId===instance.characterId&&
   origin.instanceId===instance.instanceId,`placement generation ${instance.instanceId}`);
  for(const update of instance.updates)
   assert(byId.get(update)?.instanceId===instance.instanceId,`placement update ${update}`);
 }
 const masks=timeline.instances.flatMap(instance=>{
  const maskEvents=instance.updates.map(id=>byId.get(id)).filter(event=>event.clipDepth!==undefined);
  assert(maskEvents.length<=1,`changing source mask requires new review ${instance.instanceId}`);
  return maskEvents.map(event=>({instanceId:instance.instanceId,characterId:instance.characterId,
   depth:instance.depth,clipDepth:event.clipDepth,firstFrame:instance.firstFrame,
   lastFrameExclusive:instance.lastFrameExclusive,sourceTagSha256:event.sourceTagSha256}));
 });
 return {id:timeline.timelineId,declaredFrameCount:timeline.declaredFrameCount,
  observedFrameCount:timeline.observedFrameCount,events,instances:timeline.instances,masks};
}

/** Source display-list snapshot within one declared frame domain. It never
 * executes actions, advances child clocks or resolves script visibility. */
export function staticSourceFrame(domain,frame){
 assert(Number.isInteger(frame)&&frame>=1&&frame<=domain.declaredFrameCount,'source frame domain');
 const byId=new Map(domain.events.map(event=>[event.eventId,event]));
 return domain.instances.filter(item=>item.firstFrame<=frame&&frame<item.lastFrameExclusive)
  .map(item=>{
   const state={instanceId:item.instanceId,characterId:item.characterId,depth:item.depth,
    firstFrame:item.firstFrame,lastFrameExclusive:item.lastFrameExclusive};
   for(const eventId of item.updates){const event=byId.get(eventId);
    if(event.frame>frame)break;
    for(const field of ['matrix','colorTransform','clipDepth','ratio','name','visible',
     'blendMode','filters','cacheAsBitmap','backgroundColorRgba'])
     if(event[field]!==undefined)state[field]=event[field];
   }
   return state;
  }).sort((a,b)=>a.depth-b.depth);
}

export function deriveP053VisualScene(catalog,native,document){
 assert.equal(catalog.sourceSha256,SOURCE.sha256,'physical source identity');
 assert.equal(sha(JSON.stringify(catalog)),CATALOG_SHA,'exact binary parser catalog');
 assert.equal(native.animationId,'shared-nms002-l02-p053');
 assert.equal(native.source.sha256,SOURCE.sha256);
 assert.equal(native.extraction.movieXml.sha256,XML.sha256);
 assert.equal(native.source.rootMainPlacement.spriteId,187);
 assert.equal(native.source.mainFrames,694);
 assert.deepEqual(catalog.header.stageBoundsTwips,{left:0,right:16000,top:0,bottom:12000});
 assert.equal(catalog.header.frameRate,12);assert.equal(catalog.header.frameCount,10);
 assert.equal(catalog.unparsedTags.length,0,'all source tags classified by binary parser');
 assert.equal(catalog.summary.shapeDefinitions,68,'source shape inventory');
 assert.equal(catalog.summary.bitmapDefinitions,0,'source has no bitmap definitions');
 assert.equal((document.match(/<DefineShape3?\b/gu)??[]).length,68,'XML shape definitions');
 assert.equal((document.match(/<DefineSprite\b/gu)??[]).length,76,'XML sprite definitions');
 const mainXml=xmlDefinition(document,'DefineSprite',187);
 assert.equal((mainXml.match(/<ShowFrame\s*\/>/gu)??[]).length,694,'XML main frame domain');
 const {timelines,buttons,shapes,bitmaps,visited,reached}=reachableDefinitions(catalog);
 assert.equal(reached.sprites.size,12,'root-reachable sprite definitions');
 assert.equal(reached.buttons.size,1,'root-reachable button definition');
 assert.equal(reached.texts.size,37,'root-reachable text definitions');
 const domains=[...visited].filter(id=>!id.startsWith('button-'))
  .sort((a,b)=>a==='root'?-1:b==='root'?1:Number(a.slice(7))-Number(b.slice(7)))
  .map(id=>sourceEvents(timelines.get(id)));
 assert.equal(domains.length,13,'root and 12 nested timeline domains');
 const root=domains[0],main=domains.find(item=>item.id==='sprite-187');
 const rootMain=root.instances.filter(item=>item.characterId===187);
 assert.equal(rootMain.length,1,'one root main sprite');
 assert.deepEqual([rootMain[0].firstFrame,rootMain[0].lastFrameExclusive,rootMain[0].depth],
  [6,11,3],'root6 main placement');
 const rootState=staticSourceFrame(root,6).find(item=>item.instanceId===rootMain[0].instanceId);
 assert.deepEqual(rootState.matrix,[1,0,0,1,8248,5666],'root6 source transform');
 const early=main.instances.find(item=>item.characterId===136&&item.depth===24&&item.firstFrame===1);
 const late=main.instances.find(item=>item.characterId===136&&item.depth===43&&item.firstFrame===693);
 assert(early&&late,'two distinct Start generations');
 assert.deepEqual([early.lastFrameExclusive,late.lastFrameExclusive],[7,695]);
 assert.equal(staticSourceFrame(main,1).find(item=>item.instanceId===early.instanceId)
  .colorTransform.multiply[3],0,'early Start alpha at frame1');
 assert.equal(staticSourceFrame(main,6).find(item=>item.instanceId===early.instanceId)
  .colorTransform.multiply[3],256,'early Start alpha at frame6');
 assert(!staticSourceFrame(main,7).some(item=>item.instanceId===early.instanceId),
  'early Start removed at frame7');
 const popup=main.instances.find(item=>item.characterId===104&&item.firstFrame===693);
 assert.deepEqual([popup?.depth,popup?.lastFrameExclusive],[47,694],
  'popup structural placement is one main frame');
 const held=main.events.find(item=>item.frame===693&&item.kind==='action-bytes');
 assert.equal(held?.sourceTagSha256,MAIN_ACTION_SHA,'held SelectLevel action source');
 assert.deepEqual(main.events.filter(item=>item.kind==='frame-label').map(item=>
  [item.frame,item.label.text]),[[3,'RepeatDirection'],[693,'SelectLevel']]);
 assert.equal(main.masks.length,8,'eight source clip-depth spans');
 const definitionIds={shapes:[...reached.shapes].sort((a,b)=>a-b),
  bitmaps:[...reached.bitmaps].sort((a,b)=>a-b),
  texts:[...reached.texts].sort((a,b)=>a-b),
  sprites:[...reached.sprites].sort((a,b)=>a-b),
  buttons:[...reached.buttons].sort((a,b)=>a-b)};
 const definitions={
  shapes:definitionIds.shapes.map(id=>sourceShape(shapes.get(id),document)),
  bitmaps:definitionIds.bitmaps.map(id=>{const def=bitmaps.get(id);
   const fragment=xmlDefinition(document,def.tagName,id);
   return {...def,xmlFragmentSha256:sha(fragment),sourceDefinitionXml:fragment};}),
  texts:definitionIds.texts.map(id=>{
   const selected=native.textDefinitions.find(item=>item.characterId===id);
   assert(selected,`native source text ${id}`);return selected;
  }),
  sprites:definitionIds.sprites.map(id=>({characterId:id,domainId:`sprite-${id}`,
   declaredFrameCount:timelines.get(`sprite-${id}`).declaredFrameCount})),
  buttons:definitionIds.buttons.map(id=>{
   const def=buttons.get(id);
   return {characterId:id,sourceTagSha256:def.sourceTagSha256,
    statePlacements:def.statePlacements,actions:def.actions,
    runtimeStateResolved:false};
  }),
 };
 return {schemaVersion:1,kind:'nms-l02-p053-visual-scene-source-v1',
  animationId:'shared-nms002-l02-p053',
  source:{physicalRoot:P053_SOURCE_ROOT,relativePath:P053_SOURCE_RELATIVE,...SOURCE,
   swfVersion:6,stagePixels:[800,600],fps:12,rootFrames:10},
  inputs:{movieXml:{path:P053_XML,...XML},nativeDisplay:{path:P053_NATIVE_IR,...NATIVE},
   binaryCatalogJsonSha256:CATALOG_SHA},
  rootPlacement:{rootFrame:6,depth:3,characterId:187,instanceId:rootMain[0].instanceId,
   matrix:rootState.matrix,rootInterval:[6,11]},
  mainFrameDomain:{id:'sprite-187',declaredFrames:694,
   heldFrame:693,heldActionTagSha256:MAIN_ACTION_SHA,
   nextDeclaredFrame:694,nextFrameAutoReachedEstablished:false},
  definitions,domains,
  sourceMarkers:{earlyStart:{instanceId:early.instanceId,characterId:136,depth:24,
    frameInterval:[1,7],sourceRequest:'L7GS03',hostExecutionEstablished:false},
   laterStart:{instanceId:late.instanceId,characterId:136,depth:43,
    frameInterval:[693,695],sourceRequest:'L2GS03',hostExecutionEstablished:false},
   popup:{instanceId:popup.instanceId,frameInterval:[693,694],
    sourceScriptVisibility:'Mc_Popup._visible=false',runtimeVisibilityEstablished:false},
   labels:[{frame:3,label:'RepeatDirection'},{frame:693,label:'SelectLevel'}]},
  summary:{rootReachableSpriteDomains:12,sourceShapeDefinitions:68,
   placedShapeDefinitions:definitions.shapes.length,placedBitmapDefinitions:0,
   placedTextDefinitions:37,buttonDefinitions:1,
   mainEvents:main.events.length,mainInstances:main.instances.length,
   mainClipDepthSpans:main.masks.length},
  boundary:{sourceStaticDisplayListOnly:true,localFrameIntervalsHalfOpen:true,
   childClocksNotSynchronized:true,clipDepthSemanticsNotRendered:true,
   actionScriptVisibilityNotExecuted:true,sourceAlphaNotRuntimeVisibility:true,
   placementsNotHitTesting:true,earlyStartNaturalReachabilityEstablished:false,
   lateStartP054HostHandoffEstablished:false,frame694NaturalPlaybackEstablished:false,
   audioNotMappedOrAccepted:true,originalRuntimeAccepted:false,
   currentJsRegistered:false,fidelityAccepted:false,humanAccepted:false,
   ownerAccepted:false,strictComplete:false,published:false}};
}

export function buildP053VisualScene(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P053_SOURCE_ROOT,
  'exact real G6-G8 source root required');
 const sourceStat=fs.lstatSync(P053_SOURCE_ROOT);
 assert(sourceStat.isDirectory()&&!sourceStat.isSymbolicLink()&&
  fs.realpathSync(P053_SOURCE_ROOT)===P053_SOURCE_ROOT,'physical source root');
 const source=readBound(path.join(P053_SOURCE_ROOT,P053_SOURCE_RELATIVE),SOURCE);
 const xml=readBound(P053_XML,XML).toString('utf8');
 const native=JSON.parse(readBound(path.join(ROOT,P053_NATIVE_IR),NATIVE).toString('utf8'));
 const catalog=collectSwfTextSourceCatalog(source);
 return deriveP053VisualScene(catalog,native,xml);
}

function main(){
 const mode=process.argv[2]??'--plan';
 assert(['--plan','--prepare','--check'].includes(mode),'use --plan, --prepare or --check');
 assert(process.argv.length===2||process.argv.length===3,'one mode only');
 const scene=buildP053VisualScene(),bytes=json(scene),file=path.join(ROOT,P053_OUTPUT);
 if(mode==='--prepare')fs.writeFileSync(file,bytes,{flag:'wx'});
 if(mode==='--check')assert(fs.readFileSync(file).equals(bytes),'P053 visual scene output drift');
 console.log(JSON.stringify({status:'PASS',mode,animationId:scene.animationId,
  output:{path:P053_OUTPUT,bytes:bytes.length,sha256:sha(bytes)},summary:scene.summary}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
