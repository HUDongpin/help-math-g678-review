#!/usr/bin/env node
/** Exact P027 text-glyph and source-instance projection. Generated output is not hand-edited. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/alg-l06-p027-source-planning-20261001-v1';
const OUT='output/alg-l06-p027-native-text-v1';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/VB/L6VB20.swf';
const SWF_SHA='689318e75aac8740344e8ff119df34a288e7da24dc3dc0c62c0f22601666f984';
const ID='shared-alg001-l06-p027';
const TEXT_IDS=[5,10,11,12,13,15,18,20,22,25,26,27,28,30,31,33,35];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=name=>fs.readFileSync(path.join(ROOT,name));
function physicalSource(){
 const file=path.join(SOURCE_ROOT,SOURCE);
 assert.equal(fs.realpathSync(file),file,'physical source path');
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,'ordinary source file');
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`source changed while reading: ${key}`);
 return bytes;
}
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)]
 .map(match=>[match[1],match[2]]));
const num=(value,fallback=0)=>value===undefined?fallback:Number(value);
const pick=(body,expression,label)=>{const match=body.match(expression);assert(match,`missing ${label}`);return match[1];};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const matrix=record=>({scaleX:num(record?.scaleX,1),scaleY:num(record?.scaleY,1),
 transX:num(record?.transX),transY:num(record?.transY)});
function spans(frames){
 const result=[];
 for(const frame of frames){const prior=result.at(-1);
  if(prior&&prior[1]===frame-1)prior[1]=frame;else result.push([frame,frame]);}
 return result;
}
function bounds(xml,tag,id){
 const body=pick(xml,new RegExp(`<${tag} objectID="${id}">([\\s\\S]*?)<\\/${tag}>`,'u'),`${tag} ${id}`);
 return Object.fromEntries(Object.entries(attrs(pick(body,/<Rectangle\b([^>]*)\/>/u,`${tag} bounds ${id}`)))
  .map(([key,value])=>[key,num(value)]));
}
function assertSourceRectangle(xml,id,expectedEdges){
 const body=pick(xml,new RegExp(`<DefineShape objectID="${id}">([\\s\\S]*?)<\\/DefineShape>`,'u'),`shape ${id}`);
 const edges=pick(body,/<edges>([\s\S]*?)<\/edges>/u,`shape ${id} edges`);
 const lines=[...edges.matchAll(/<LineTo x="(-?\d+)" y="(-?\d+)"\/>/gu)]
  .map(match=>[num(match[1]),num(match[2])]);
 assert.deepEqual(lines,expectedEdges,`shape ${id} rectangular clip geometry`);
 assert.equal((edges.match(/<CurveTo\b/gu)??[]).length,0,`shape ${id} has no curves`);
}
function fontGlyphs(xml){
 const result=new Map();
 for(const match of xml.matchAll(/<DefineFont2 objectID="(\d+)"[^>]*>([\s\S]*?)<\/DefineFont2>/gu)){
  const glyphs=[...match[2].matchAll(/<Glyph map="(\d+)"/gu)].map(g=>String.fromCodePoint(num(g[1])));
  result.set(num(match[1]),glyphs);
 }
 assert.deepEqual([...result.keys()],[4,24]);
 assert.deepEqual([...result.values()].map(glyphs=>glyphs.length),[27,4]);
 return result;
}
function parseText(xml,display){
 const glyphMap=fontGlyphs(xml),result=[];
 for(const textId of TEXT_IDS){
  const body=pick(xml,new RegExp(`<DefineText objectID="${textId}">([\\s\\S]*?)<\\/DefineText>`,'u'),`text ${textId}`);
  const boundsTwips=bounds(xml,'DefineText',textId);
  let x=0,y=0,fontHeight=440,fontId=0,colorRgb=[0,0,0],runIndex=0;
  const runs=[];
  for(const match of body.matchAll(/<TextRecord6\b([^>]*)>([\s\S]*?)<\/TextRecord6>/gu)){
   const a=attrs(match[1]);
   if(a.x!==undefined)x=num(a.x);if(a.y!==undefined)y=num(a.y);
   if(a.fontHeight!==undefined)fontHeight=num(a.fontHeight);
   if(a.objectID!==undefined)fontId=num(a.objectID);
   const color=match[2].match(/<Color red="(\d+)" green="(\d+)" blue="(\d+)"\/>/u);
   if(color)colorRgb=color.slice(1).map(Number);
   const entries=[...match[2].matchAll(/<TextEntry\b([^>]*)\/>/gu)];
   if(!entries.length)continue;
   assert(glyphMap.has(fontId),`font ${fontId} text ${textId}`);
   let glyphX=x;
   const glyphs=entries.map(entry=>{
    const e=attrs(entry[1]),index=num(e.glyph),advance=num(e.advance);
    const character=glyphMap.get(fontId)[index];assert(character!==undefined,`glyph ${index} font ${fontId}`);
    const glyph={character,glyphIndex:index,x:glyphX,advance};glyphX+=advance;return glyph;
   });
   const text=glyphs.map(g=>g.character).join('');
   runs.push({text,colorRgb:[...colorRgb],x,y,fontHeight,fontId,width:glyphX-x,
    sourceTextId:`character-${textId}/run-${runIndex}`,glyphs});
   x=glyphX;runIndex++;
  }
  const exportEntry=display.texts.find(entry=>entry.textId===textId);
  assert(exportEntry,`FFDec text ${textId}`);
  const exportBytes=read(`${BASE}/${exportEntry.path}`);
  assert.equal(sha(exportBytes),exportEntry.sha256,`FFDec text hash ${textId}`);
  assert.equal(exportBytes.length,exportEntry.bytes,`FFDec text size ${textId}`);
  const exported=exportBytes.toString().split(/\n--- RECORDSEPARATOR ---\n/u).join('');
  assert.equal(runs.map(run=>run.text).join(''),exported,`glyph string ${textId}`);
  const ascent=runs[0].y-boundsTwips.top,descent=boundsTwips.bottom-runs.at(-1).y;
  for(const run of runs){run.inkTop=run.y-ascent;run.inkBottom=run.y+descent;}
  result.push({textId,text:exported,boundsTwips,runs});
 }
 assert.equal(result.length,17);
 return result;
}
function parseSprite(xml,display){
 const sprite=pick(xml,/<DefineSprite objectID="46" frames="770">([\s\S]*?)<\/DefineSprite>/u,'sprite 46');
 const tokens=/<PlaceObject2\b[^>]*\/>|<PlaceObject2\b[^>]*>[\s\S]*?<\/PlaceObject2>|<RemoveObject2\b[^>]*\/>|<ShowFrame\s*\/>/gu;
 const active=new Map(),generations=new Map(),frames=[];let frame=1;
 for(const match of sprite.matchAll(tokens)){
  const tag=match[0];
  if(tag.startsWith('<ShowFrame')){
   frames.push([...active.values()].map(value=>({...value,transform:{...value.transform}})));
   frame++;continue;
  }
  const a=attrs(tag.slice(0,tag.indexOf('>')+1)),depth=num(a.depth);
  if(tag.startsWith('<RemoveObject2')){assert(active.delete(depth),`remove absent depth ${depth}`);continue;}
  const old=active.get(depth),objectId=a.objectID===undefined?undefined:num(a.objectID);
  assert(objectId!==undefined||old,`modify absent depth ${depth} frame ${frame}`);
  let generation=old?.generation;
  if(objectId!==undefined&&!(old&&old.objectId===objectId&&a.replace==='1')){
   generation=(generations.get(depth)??0)+1;generations.set(depth,generation);
  }
  const transformTag=tag.match(/<Transform\b([^>]*)\/>/u);
  const transform=transformTag?matrix(attrs(transformTag[1])):old?.transform;
  const colorTag=tag.match(/<ColorTransform2\b([^>]*)\/>/u);
  const alpha=colorTag?num(attrs(colorTag[1]).factorAlpha,256):undefined;
  active.set(depth,{depth,objectId:objectId??old.objectId,generation,
   instanceId:`sprite-46/depth-${depth}/generation-${generation}`,
   transform:transform??matrix(),alpha:alpha??old?.alpha??256,
   clipDepth:a.clipDepth!==undefined?num(a.clipDepth):objectId!==undefined?undefined:old?.clipDepth});
 }
 assert.equal(frames.length,770);
 const rows=new Map();
 frames.forEach((instances,index)=>instances.forEach(instance=>{
  let row=rows.get(instance.instanceId);
  if(!row){row={instanceId:instance.instanceId,objectId:instance.objectId,depth:instance.depth,
   clipDepth:instance.clipDepth??null,runs:[]};rows.set(instance.instanceId,row);}
  const state={alpha:instance.alpha,transform:instance.transform};
  const prior=row.runs.at(-1);
  if(prior&&prior.lastFrame===index&&same(prior.state,state))prior.lastFrame=index+1;
  else row.runs.push({firstFrame:index+1,lastFrame:index+1,state});
 }));
 assert.equal(rows.size,display.sprite46.instances.length,'source instance count');
 for(const expected of display.sprite46.instances){
  const row=rows.get(`sprite-46/${expected.instanceId}`);
  assert(row,`source instance ${expected.instanceId}`);
  assert.equal(row.objectId,expected.objectId);assert.equal(row.depth,expected.depth);
  assert.equal(row.clipDepth,expected.clipDepth);
  const present=[];for(const run of row.runs)for(let f=run.firstFrame;f<=run.lastFrame;f++)present.push(f);
  assert.deepEqual(spans(present),expected.presentSpans,`source span ${expected.instanceId}`);
 }
 return [...rows.values()].sort((a,b)=>a.depth-b.depth||a.instanceId.localeCompare(b.instanceId));
}

// Source buttons 16 and 17 share one blue run, but own different glyph ranges.
const LABELS={
 'Vertical-line test':{textId:5,runIndex:1,segment:'vertical-line test',start:0},
 Function:{textId:5,runIndex:5,segment:'function',start:0},
 Graph:{textId:5,runIndex:3,segment:'graph',start:0},
 Vertical:{textId:15,runIndex:1,segment:'vertical',start:0},
 Line:{textId:15,runIndex:1,segment:'line',start:9},
 Point:{textId:20,runIndex:1,segment:'point',start:0},
};
function glossaryModel(plan,definitions,rows){
 assert.equal(plan.glossary.length,6);
 const result=[];
 for(const source of plan.glossary){
  const key=source.keyAttribute,link=LABELS[key];assert(link,`label map ${key}`);
  const button=rows.find(row=>row.instanceId===`sprite-46/${source.instance.instanceId}`);
  assert(button&&button.objectId===source.buttonCharacterId,`button instance ${key}`);
  assert.equal(source.hitShapeCharacterId,6);assert.equal(source.event,'pointerReleaseInside');
  assert.deepEqual(source.action.orderedEffects,['set _global.KeyAttribute',
   'call _root.DoHyperLinks()','stop _root.animation_mc.animation']);
  const actionBytes=read(`${BASE}/${source.action.path}`);
  assert.equal(sha(actionBytes),source.action.sha256,`action hash ${key}`);
  assert(actionBytes.toString().includes(`_global.KeyAttribute = "${key}"`),`action key ${key}`);
  const definition=definitions.find(def=>def.textId===link.textId),run=definition?.runs[link.runIndex];
  assert(run&&run.colorRgb.join(',')==='0,0,204',`own blue run ${key}`);
  assert.equal(run.text.slice(link.start,link.start+link.segment.length),link.segment,`own glyph segment ${key}`);
  const text=rows.filter(row=>row.objectId===link.textId&&row.depth<button.depth&&
   row.runs.some(run=>button.runs.some(br=>br.firstFrame<=run.lastFrame&&run.firstFrame<=br.lastFrame)));
  assert.equal(text.length,1,`own text instance ${key}`);
  const hitBounds=Object.values(source.hitShapeBoundsTwips).map(Number);
  assert.deepEqual(hitBounds,[-1516,-581,-205,204]);
  result.push({key,buttonId:source.buttonCharacterId,instanceId:button.instanceId,
   sourceActionSha256:source.action.sha256,
   label:{textId:link.textId,textInstanceId:text[0].instanceId,sourceTextId:run.sourceTextId,
    segment:link.segment,glyphStart:link.start,glyphCount:link.segment.length},
   hitShapeBoundsTwips:hitBounds});
 }
 return result;
}

export function makeModel(plan,display,xml){
 assert.equal(plan.identity.animationId,ID);assert.equal(plan.source.swf.sha256,SWF_SHA);
 assert.equal(display.sourceSwfSha256,SWF_SHA);assert.equal(display.root.frameCount,10);
 assert.equal(display.sprite46.frameCount,770);
 assert.deepEqual(display.buttonIds,[7,8,9,16,17,21]);
 assert.deepEqual(display.textIds,TEXT_IDS);
 const definitions=parseText(xml,display),instances=parseSprite(xml,display);
 const textInstances=instances.filter(row=>TEXT_IDS.includes(row.objectId));
 assert.equal(textInstances.length,36);
 const masks=instances.filter(row=>row.objectId===2&&row.clipDepth!==null);
 assert.deepEqual(masks.map(row=>[row.depth,row.clipDepth]),[[1,10],[11,18],[19,24]]);
 const maskShapeBoundsTwips=Object.values(bounds(xml,'DefineShape',2)).map(Number);
 assert.deepEqual(maskShapeBoundsTwips,[-5839,5840,-330,330]);
 assertSourceRectangle(xml,2,[[-11679,0],[0,-660],[11679,0],[0,660]]);
 const hitShapeBoundsTwips=Object.values(bounds(xml,'DefineShape',6)).map(Number);
 assert.deepEqual(hitShapeBoundsTwips,[-1516,-581,-205,204]);
 assertSourceRectangle(xml,6,[[0,409],[-935,0],[0,-409],[935,0]]);
 const glossary=glossaryModel(plan,definitions,instances);
 return {schemaVersion:1,kind:'alg-l06-p027-native-source-geometry-v1',
  animationId:ID,sourceSwfSha256:SWF_SHA,sourceXmlSha256:display.sourceXmlSha256,
  stage:{width:800,height:600},fps:12,rootFrameCount:10,rootEntryFrame:6,
  rootSpriteTransform:matrix(display.root.instances.find(row=>row.objectId===46).firstVisibleTransform),
  frameDomain:'sprite-46',mainFrameCount:770,sourceLanguage:'en',
  maskShapeBoundsTwips,hitShapeBoundsTwips,
  definitions,instances,glossary,nativeCandidateTextInstanceIds:textInstances.map(row=>row.instanceId),
  canvasSourceGlyphsPreserved:true,canvasInstanceSuppressionSupported:false};
}

const RUNTIME=`type Transform={scaleX:number;scaleY:number;transX:number;transY:number};
type Box={left:number;right:number;top:number;bottom:number};
type Glyph={character:string;glyphIndex:number;x:number;advance:number};
type SourceRun={text:string;colorRgb:number[];x:number;y:number;fontHeight:number;fontId:number;width:number;sourceTextId:string;inkTop:number;inkBottom:number;glyphs:Glyph[]};
type Definition={textId:number;text:string;boundsTwips:Box;runs:SourceRun[]};
type Placement={instanceId:string;objectId:number;depth:number;clipDepth:number|null;runs:{firstFrame:number;lastFrame:number;state:{alpha:number;transform:Transform}}[]};
type GlossarySource={key:P027GlossaryKey;buttonId:number;instanceId:string;sourceActionSha256:string;label:{textId:number;textInstanceId:string;sourceTextId:string;segment:string;glyphStart:number;glyphCount:number};hitShapeBoundsTwips:number[]};
type P027TimelineSource={schemaVersion:number;kind:string;animationId:string;sourceSwfSha256:string;sourceXmlSha256:string;stage:{width:number;height:number};fps:number;rootFrameCount:number;rootEntryFrame:number;rootSpriteTransform:Transform;frameDomain:'sprite-46';mainFrameCount:number;sourceLanguage:'en';maskShapeBoundsTwips:number[];hitShapeBoundsTwips:number[];definitions:Definition[];instances:Placement[];glossary:GlossarySource[];nativeCandidateTextInstanceIds:string[];canvasSourceGlyphsPreserved:true;canvasInstanceSuppressionSupported:false};
function activeRun(row:Placement,frame:number){return row.runs.find(run=>run.firstFrame<=frame&&frame<=run.lastFrame);}
function box(bounds:readonly number[],transform:Transform):Box{
 const [l,r,t,b]=bounds,x1=l*transform.scaleX+transform.transX,x2=r*transform.scaleX+transform.transX;
 const y1=t*transform.scaleY+transform.transY,y2=b*transform.scaleY+transform.transY;
 return {left:Math.min(x1,x2),right:Math.max(x1,x2),top:Math.min(y1,y2),bottom:Math.max(y1,y2)};
}
function contains(outer:Box,inner:Box){return outer.left<=inner.left+2&&outer.right>=inner.right-2&&outer.top<=inner.top+2&&outer.bottom>=inner.bottom-2;}
function overlap(a:Box,b:Box){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));}
function centerIn(inner:Box,outer:Box){const x=(inner.left+inner.right)/2,y=(inner.top+inner.bottom)/2;return outer.left<=x&&x<=outer.right&&outer.top<=y&&y<=outer.bottom;}
function union(boxes:Box[]):Box|null{if(!boxes.length)return null;return {left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))};}
export function p027TimelineState(frame:number){
 if(!Number.isSafeInteger(frame)||frame<1||frame>770)throw new RangeError('P027_FRAME_OUT_OF_RANGE');
 const active=P027_TIMELINE.instances.flatMap(row=>{const run=activeRun(row,frame);return run?[{row,run}]:[]});
 const masks=active.filter(({row})=>row.objectId===2&&row.clipDepth!==null);
 const text=active.filter(({row})=>P027_TIMELINE.nativeCandidateTextInstanceIds.includes(row.instanceId));
 const textStates=text.map(({row,run})=>{
  const definition=P027_TIMELINE.definitions.find(d=>d.textId===row.objectId)!;
  const clipping=masks.filter(mask=>mask.row.depth<row.depth&&row.depth<=mask.row.clipDepth!);
  const runStates=definition.runs.map(sourceRun=>{
   const ink=box([sourceRun.x,sourceRun.x+sourceRun.width,sourceRun.inkTop,sourceRun.inkBottom],run.state.transform);
   const glyphAdvanceBoxesTwips=sourceRun.glyphs.map(g=>box([g.x,g.x+g.advance,sourceRun.inkTop,sourceRun.inkBottom],run.state.transform));
   const visibleGlyphIndexes=glyphAdvanceBoxesTwips.flatMap((glyph,index)=>/\\s/u.test(sourceRun.glyphs[index].character)||
    clipping.every(mask=>contains(box(P027_TIMELINE.maskShapeBoundsTwips,mask.run.state.transform),glyph))?[index]:[]);
   return {...sourceRun,ink,glyphAdvanceBoxesTwips,visibleGlyphIndexes,maskReady:visibleGlyphIndexes.length===sourceRun.glyphs.length};
  });
  const complete=run.state.alpha>0&&runStates.every(value=>value.maskReady);
  return {sourceTextId:row.objectId,instanceId:row.instanceId,depth:row.depth,
   sourceTransform:run.state.transform,alpha:run.state.alpha/256,complete,
   partialGlyphCount:runStates.reduce((sum,value)=>sum+value.glyphs.length-value.visibleGlyphIndexes.length,0),
   runs:runStates,text:definition.text};
 });
 const nativeReadyTextInstances=textStates.filter(value=>value.complete);
 const glossaryInstances=P027_TIMELINE.glossary.map(control=>{
  const button=active.find(value=>value.row.instanceId===control.instanceId);
  const paragraph=textStates.find(value=>value.instanceId===control.label.textInstanceId);
  const blue=paragraph?.runs.find(value=>value.sourceTextId===control.label.sourceTextId);
  const segmentBoxes=blue?.glyphAdvanceBoxesTwips.slice(control.label.glyphStart,control.label.glyphStart+control.label.glyphCount)??[];
  const segment=union(segmentBoxes),hit=button?box(control.hitShapeBoundsTwips,button.run.state.transform):null;
  const hitMasks=button?masks.filter(mask=>mask.row.depth<button.row.depth&&button.row.depth<=mask.row.clipDepth!):[];
  const hitRegionMaskReady=!!hit&&hitMasks.every(mask=>contains(box(P027_TIMELINE.maskShapeBoundsTwips,mask.run.state.transform),hit));
  const ownBlueGlyphReady=!!blue&&blue.colorRgb.join(',')==='0,0,204'&&
   Array.from({length:control.label.glyphCount},(_,i)=>control.label.glyphStart+i).every(index=>blue.visibleGlyphIndexes.includes(index));
  const ownInkOverlap=!!(hit&&segment)&&centerIn(hit,segment)&&overlap(hit,segment)>0;
  const available=!!(button&&button.run.state.alpha>0&&paragraph&&paragraph.alpha>0&&
   hitRegionMaskReady&&ownBlueGlyphReady&&ownInkOverlap);
  return {...control,available,sourceAlpha:button?.run.state.alpha??0,
   sourceLabelAlpha:paragraph?.alpha??0,hitRegionMaskReady,ownBlueGlyphReady,
   ownInkOverlap,hitRegionTwips:hit,labelInkTwips:segment};
 });
 const glossary=Object.fromEntries([...new Set(glossaryInstances.map(g=>g.key))]
  .map(key=>[key,glossaryInstances.some(g=>g.key===key&&g.available)])) as Record<P027GlossaryKey,boolean>;
 return {frame,frameDomain:'sprite-46' as const,elapsedSeconds:(frame-1)/12,
  textStates,nativeReadyTextInstances,partialSourceTextInstances:textStates.filter(value=>value.partialGlyphCount>0),
  glossaryInstances,glossary,
  canvasSourceGlyphsPreserved:true as const,suppressibleSourceTextInstanceIds:[] as string[],
  activeMasks:masks.map(({row,run})=>({instanceId:row.instanceId,depth:row.depth,clipDepth:row.clipDepth,
   boundsTwips:box(P027_TIMELINE.maskShapeBoundsTwips,run.state.transform)})),
  originalRuntimeAccepted:false as const};
}
`;

export function build({planBytes=read(`${BASE}/source-plan-v1.json`),
 displayBytes=read(`${BASE}/source-display-list-v1.json`),
 xmlBytes=read(`${BASE}/source-structure.xml`)}={}){
 const plan=JSON.parse(planBytes),display=JSON.parse(displayBytes);
 assert.equal(sha(xmlBytes),plan.extraction.swfmillXml.sha256);
 assert.equal(sha(displayBytes),plan.extraction.displayList.sha256);
 assert.equal(display.sourceXmlSha256,plan.extraction.swfmillXml.sha256);
 const source=physicalSource();
 assert.equal(source.length,plan.source.swf.bytes);assert.equal(sha(source),SWF_SHA);
 const model=makeModel(plan,display,xmlBytes.toString());
 const geometry=JSON.stringify(model,null,2)+'\n';
 const keys=Object.keys(LABELS).map(key=>JSON.stringify(key)).join(' | ');
 const timeline=`/* Generated by scripts/prepare-alg-l06-p027-native-text-v1.mjs; do not edit. */\n`
  +`export type P027GlossaryKey=${keys};\n`+RUNTIME.replace('export function p027TimelineState',
   `export const P027_TIMELINE=${JSON.stringify(model)} as P027TimelineSource;\nexport function p027TimelineState`);
 const receipt=JSON.stringify({schemaVersion:1,kind:'alg-l06-p027-native-text-generation-v1',
  animationId:ID,sourceSwfSha256:SWF_SHA,
  inputs:[`${BASE}/source-plan-v1.json`,`${BASE}/source-display-list-v1.json`,
   `${BASE}/source-structure.xml`,
   ...display.texts.map(entry=>`${BASE}/${entry.path}`),
   'scripts/prepare-alg-l06-p027-native-text-v1.mjs'].map(name=>({path:name,
    bytes:read(name).length,sha256:sha(read(name))})),
  outputs:[{path:`${OUT}/geometry-v1.json`,bytes:Buffer.byteLength(geometry),sha256:sha(geometry)},
   {path:'packages/demos/src/alg-l06-p027-timeline-v1.ts',bytes:Buffer.byteLength(timeline),sha256:sha(timeline)}],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}},null,2)+'\n';
 return [[`${OUT}/geometry-v1.json`,geometry],
  ['packages/demos/src/alg-l06-p027-timeline-v1.ts',timeline],
  [`${OUT}/generation-receipt-v1.json`,receipt]];
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];assert(['--write','--check'].includes(mode),'use --write or --check');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const outputs=build();
 for(const [name,body] of outputs){const file=path.join(ROOT,name);
  if(mode==='--check')assert.equal(fs.readFileSync(file,'utf8'),body,`stale ${name}`);
  else {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);}
 }
 console.log(JSON.stringify({mode,outputs:outputs.map(([name,body])=>
  ({path:name,bytes:Buffer.byteLength(body),sha256:sha(body)}))}));
}
