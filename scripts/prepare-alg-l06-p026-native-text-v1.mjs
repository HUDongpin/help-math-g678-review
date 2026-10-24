#!/usr/bin/env node
/** Source-bound P026 glyph, placement, mask, and glossary projection. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/alg-l06-p026-behavior-ir-v1';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=name=>fs.readFileSync(path.join(ROOT,name));
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)].map(m=>[m[1],m[2]]));
const num=(value,fallback=0)=>value===undefined?fallback:Number(value);
const pick=(body,expression,label)=>{const match=body.match(expression);assert(match,`missing ${label}`);return match[1];};
const parseMatrix=body=>{
 const match=body.match(/<Transform\b([^>]*)\/>/u);
 return match?attrs(match[1]):null;
};
const matrix=record=>({scaleX:num(record?.scaleX,1),scaleY:num(record?.scaleY,1),
 transX:num(record?.transX),transY:num(record?.transY)});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const spans=frames=>{
 const result=[];
 for(const frame of frames){const prior=result.at(-1);if(prior&&prior[1]===frame-1)prior[1]=frame;else result.push([frame,frame]);}
 return result;
};

function parseGlyphs(xml,definitions){
 const result=[];
 for(const definition of definitions){
  const body=pick(xml,new RegExp(`<DefineText objectID="${definition.textId}">([\\s\\S]*?)<\\/DefineText>`,'u'),`text ${definition.textId}`);
  let x=0,y=0,fontHeight=440,runIndex=0;
  const runs=[];
  for(const match of body.matchAll(/<TextRecord6\b([^>]*)>([\s\S]*?)<\/TextRecord6>/gu)){
   const a=attrs(match[1]);if(a.x!==undefined)x=num(a.x);if(a.y!==undefined)y=num(a.y);
   if(a.fontHeight!==undefined)fontHeight=num(a.fontHeight);
   const entries=[...match[2].matchAll(/<TextEntry\b([^>]*)\/>/gu)];
   if(!entries.length)continue;
   const width=entries.reduce((sum,entry)=>sum+num(attrs(entry[1]).advance),0);
   const source=definition.runs[runIndex];assert(source,`extra glyph run ${definition.textId}`);
   assert.equal(entries.length,source.text.length,`glyph count ${definition.textId}/${runIndex}`);
   let glyphX=x;
   const glyphs=entries.map((entry,index)=>{
    const a=attrs(entry[1]),advance=num(a.advance);
    const glyph={character:source.text[index],glyphIndex:num(a.glyph),x:glyphX,advance};
    glyphX+=advance;return glyph;
   });
   runs.push({text:source.text,colorRgb:source.colorRgb,x,y,fontHeight,width,
    sourceTextId:`character-${definition.textId}/run-${runIndex}`,glyphs});
   x+=width;runIndex++;
  }
  assert.equal(runIndex,definition.runs.length,`run count ${definition.textId}`);
  const boundsTwips=Object.fromEntries(Object.entries(definition.boundsTwips).map(([k,v])=>[k,num(v)]));
  const ascent=runs[0].y-boundsTwips.top,descent=boundsTwips.bottom-runs.at(-1).y;
  for(const run of runs){run.inkTop=run.y-ascent;run.inkBottom=run.y+descent;}
  result.push({textId:definition.textId,text:definition.text,boundsTwips,runs});
 }
 return result;
}

function parseSprite(xml,expected){
 const sprite=pick(xml,/<DefineSprite objectID="55" frames="389">([\s\S]*?)<\/DefineSprite>/u,'sprite 55');
 const token=/<PlaceObject2\b[^>]*\/>|<PlaceObject2\b[^>]*>[\s\S]*?<\/PlaceObject2>|<RemoveObject2\b[^>]*\/>|<ShowFrame\s*\/>/gu;
 const active=new Map(),generations=new Map(),frames=[];let frame=1;
 for(const match of sprite.matchAll(token)){
  const tag=match[0];
  if(tag.startsWith('<ShowFrame')){
   frames.push([...active.values()].map(value=>({...value,transform:{...value.transform}})));
   frame++;continue;
  }
  const a=attrs(tag.slice(0,tag.indexOf('>')+1)),depth=num(a.depth);
  if(tag.startsWith('<RemoveObject2')){assert(active.delete(depth),`remove absent depth ${depth}`);continue;}
  const old=active.get(depth);const objectId=a.objectID===undefined?undefined:num(a.objectID);
  assert(objectId!==undefined||old,`modify absent depth ${depth} frame ${frame}`);
  let generation=old?.generation;
  if(objectId!==undefined&&!(old&&old.objectId===objectId&&a.replace==='1')){
   generation=(generations.get(depth)??0)+1;generations.set(depth,generation);
  }
  const transform=parseMatrix(tag);
  const color=tag.match(/<ColorTransform2\b([^>]*)\/>/u);
  const alpha=color?num(attrs(color[1]).factorAlpha,256):undefined;
  active.set(depth,{depth,objectId:objectId??old.objectId,generation,
   instanceId:`sprite-55/depth-${depth}/generation-${generation}`,
   transform:matrix(transform??old?.transform),alpha:alpha??old?.alpha??256,
   clipDepth:a.clipDepth!==undefined?num(a.clipDepth):objectId!==undefined?undefined:old?.clipDepth});
 }
 assert.equal(frames.length,389);
 const rows=new Map();
 frames.forEach((instances,index)=>instances.forEach(instance=>{
  const id=instance.instanceId;let row=rows.get(id);
  if(!row){row={instanceId:id,objectId:instance.objectId,depth:instance.depth,clipDepth:instance.clipDepth??null,runs:[]};rows.set(id,row);}
  const state={alpha:instance.alpha,transform:instance.transform};
  const prior=row.runs.at(-1);
  if(prior&&prior.lastFrame===index&&same(prior.state,state))prior.lastFrame=index+1;
  else row.runs.push({firstFrame:index+1,lastFrame:index+1,state});
 }));
 const expectedRows=expected.sprite55.instances;
 assert.equal(rows.size,expectedRows.length,'instance count');
 for(const source of expectedRows){
  const row=rows.get(`sprite-55/${source.instanceId}`);
  assert(row,`missing source instance ${source.instanceId}`);
  assert.equal(row.objectId,source.objectId);
  const present=[];for(const run of row.runs)for(let f=run.firstFrame;f<=run.lastFrame;f++)present.push(f);
  assert.deepEqual(spans(present),source.presentSpans,`source presence ${source.instanceId}`);
  for(const alphaRun of source.alphaRuns){
   for(let f=alphaRun[0];f<=alphaRun[1];f++){
    const run=row.runs.find(r=>r.firstFrame<=f&&f<=r.lastFrame);
    assert.equal(run.state.alpha,alphaRun[2],`source alpha ${source.instanceId}/${f}`);
   }
  }
 }
 return [...rows.values()].sort((a,b)=>a.depth-b.depth||a.instanceId.localeCompare(b.instanceId));
}

// The 7 source actions identify the control; the instance and paragraph run
// identify its own blue ink. A character ID alone is insufficient here.
const LABELS={
 'Independent variable':[['depth-5/generation-1',6,'independent variable'],['depth-5/generation-2',17,'independent variable']],
 'Function':[['depth-7/generation-1',6,'function'],['depth-7/generation-2',17,'function'],['depth-20/generation-1',20,'function'],['depth-19/generation-1',26,'function'],['depth-19/generation-2',30,'function']],
 'Input variable':[['depth-9/generation-1',6,'input variable'],['depth-9/generation-2',17,'input variable']],
 'Domain':[['depth-13/generation-1',12,'domain'],['depth-13/generation-2',15,'domain']],
 'Dependent variable':[['depth-18/generation-1',20,'dependent variable'],['depth-17/generation-2',26,'dependent variable'],['depth-17/generation-3',30,'dependent variable']],
 'Output variable':[['depth-22/generation-1',20,'output variable'],['depth-21/generation-1',26,'output variable'],['depth-21/generation-2',30,'output variable']],
 'Range':[['depth-28/generation-1',23,'range'],['depth-25/generation-2',27,'range'],['depth-25/generation-3',28,'range']],
};
const NATIVE_IDS=new Set([6,12,15,17,20,23,26,27,28,30]);

export function makeModel(ir,display,xml){
 assert.equal(ir.identity.animationId,'shared-alg001-l06-p026');
 assert.equal(ir.source.swf.sha256,'a61e60f95dc597c7b0024e7f013abfade47e199ae911be77916d5b38c7828e0c');
 assert.equal(display.root.frameCount,10);assert.equal(display.sprite55.frameCount,389);
 assert.deepEqual(display.buttonIds,[8,9,10,13,21,22,24]);
 assert.equal(display.textDefinitions.length,31);
 const definitions=parseGlyphs(xml,display.textDefinitions);
 const rows=parseSprite(xml,display);
 const textRows=rows.filter(r=>definitions.some(d=>d.textId===r.objectId));
 assert.equal(textRows.length,47,'47 authored text placements');
 const glossary=[];
 for(const g of ir.glossary){
  const key=g.keyAttribute,links=LABELS[key];assert.equal(links?.length,g.sourcePlacements.length,`label links ${key}`);
  assert.equal(g.buttonRecord.hitShapeCharacterId,7);assert.equal(g.buttonRecord.hitOnly,true);
  assert.deepEqual(g.actionsInOrder,['_global.KeyAttribute = key','_root.DoHyperLinks()','_root.animation_mc.animation.stop()']);
  for(const [shortId,textId,segment] of links){
   const button=rows.find(r=>r.instanceId===`sprite-55/${shortId}`);
   assert(button&&button.objectId===g.buttonCharacterId,`button identity ${key}/${shortId}`);
   const linked=textRows.filter(r=>r.objectId===textId&&r.runs.some(run=>button.runs.some(br=>br.firstFrame<=run.lastFrame&&run.firstFrame<=br.lastFrame)));
   assert.equal(linked.length,1,`own text instance ${key}/${shortId}`);
   const definition=definitions.find(d=>d.textId===textId);
   const ownRuns=definition.runs.filter(run=>run.colorRgb.join(',')==='0,0,204'&&run.text.toLowerCase()===segment.toLowerCase());
   assert.equal(ownRuns.length,1,`own blue run ${key}/${shortId}`);
   glossary.push({key,buttonId:g.buttonCharacterId,instanceId:button.instanceId,
    sourceActionSha256:g.actionExport.sha256,label:{textId,textInstanceId:linked[0].instanceId,
     sourceTextId:ownRuns[0].sourceTextId,segment},hitShapeBoundsTwips:g.buttonRecord.hitShapeBoundsTwips});
  }
 }
 assert.equal(glossary.length,20);
 const masks=rows.filter(r=>r.objectId===18&&r.clipDepth!==null);
 assert.deepEqual(masks.map(r=>[r.depth,r.clipDepth]),[[15,24],[25,30]]);
 const shape18=pick(xml,/<DefineShape objectID="18">([\s\S]*?)<\/DefineShape>/u,'mask shape 18');
 const maskBounds=attrs(pick(shape18,/<Rectangle\b([^>]*)\/>/u,'mask rectangle'));
 assert.deepEqual(Object.values(maskBounds).map(Number),[-5038,5038,-297,297]);
 return {schemaVersion:1,kind:'alg-l06-p026-native-source-geometry-v1',
  animationId:ir.identity.animationId,sourceSwfSha256:ir.source.swf.sha256,
  sourceXmlSha256:ir.auditInputs.swfmillXml.sha256,
  stage:{width:800,height:600},fps:12,rootFrameCount:10,rootEntryFrame:6,
  rootSpriteTransform:matrix(display.root.instances.find(i=>i.objectId===55).firstVisibleTransform),
  frameDomain:'sprite-55',mainFrameCount:389,
  hitShapeBoundsTwips:ir.glossary[0].buttonRecord.hitShapeBoundsTwips,
  maskShapeBoundsTwips:Object.values(maskBounds).map(Number),
  definitions,instances:rows,glossary,
  nativeTextInstanceIds:textRows.filter(r=>NATIVE_IDS.has(r.objectId)).map(r=>r.instanceId),
  canvasFallbackTextInstanceIds:textRows.filter(r=>!NATIVE_IDS.has(r.objectId)).map(r=>r.instanceId)};
}

export function build({irBytes=read(`${BASE}/behavior-ir-v1.json`),displayBytes=read(`${BASE}/source-display-list-v1.json`),xmlBytes=read(`${BASE}/source-structure.xml`)}={}){
 const ir=JSON.parse(irBytes);
 const swfBytes=fs.readFileSync(ir.source.swf.path);
 assert.equal(swfBytes.length,ir.source.swf.bytes,'physical SWF size');
 assert.equal(sha(swfBytes),ir.source.swf.sha256,'physical SWF SHA-256');
 assert.equal(sha(displayBytes),ir.auditInputs.displayList.sha256);
 assert.equal(sha(xmlBytes),ir.auditInputs.swfmillXml.sha256);
 assert.equal(JSON.parse(displayBytes).sourceXmlSha256,ir.auditInputs.swfmillXml.sha256);
 const model=makeModel(ir,JSON.parse(displayBytes),xmlBytes.toString('utf8'));
 const json=JSON.stringify(model,null,2)+'\n';
 const glossaryKeys=[...new Set(model.glossary.map(row=>row.key))].map(key=>JSON.stringify(key)).join(' | ');
 const generated=`/* Generated by scripts/prepare-alg-l06-p026-native-text-v1.mjs; do not edit. */\n`+
  `export type P026GlossaryKey=${glossaryKeys};\n`+
  `type Transform={scaleX:number;scaleY:number;transX:number;transY:number};\n`+
  `type Placement={instanceId:string;objectId:number;depth:number;clipDepth:number|null;runs:{firstFrame:number;lastFrame:number;state:{alpha:number;transform:Transform}}[]};\n`+
  `type SourceRun={text:string;colorRgb:number[];x:number;y:number;fontHeight:number;width:number;sourceTextId:string;inkTop:number;inkBottom:number;glyphs:{character:string;glyphIndex:number;x:number;advance:number}[]};\n`+
  `type Definition={textId:number;text:string;boundsTwips:{left:number;right:number;top:number;bottom:number};runs:SourceRun[]};\n`+
  `type GlossarySource={key:P026GlossaryKey;buttonId:number;instanceId:string;sourceActionSha256:string;label:{textId:number;textInstanceId:string;sourceTextId:string;segment:string};hitShapeBoundsTwips:number[]};\n`+
  `type P026TimelineSource={schemaVersion:number;kind:string;animationId:string;sourceSwfSha256:string;sourceXmlSha256:string;stage:{width:number;height:number};fps:number;rootFrameCount:number;rootEntryFrame:number;rootSpriteTransform:Transform;frameDomain:'sprite-55';mainFrameCount:number;hitShapeBoundsTwips:number[];maskShapeBoundsTwips:number[];definitions:Definition[];instances:Placement[];glossary:GlossarySource[];nativeTextInstanceIds:string[];canvasFallbackTextInstanceIds:string[]};\n`+
  `export const P026_TIMELINE=${JSON.stringify(model)} as P026TimelineSource;\n`+
  `function activeRun(row:Placement,frame:number){return row.runs.find(run=>run.firstFrame<=frame&&frame<=run.lastFrame);}\n`+
  `function box(bounds:readonly number[], transform:{readonly scaleX:number;readonly scaleY:number;readonly transX:number;readonly transY:number}){\n`+
  ` const [l,r,t,b]=bounds;const x1=l*transform.scaleX+transform.transX,x2=r*transform.scaleX+transform.transX;\n`+
  ` const y1=t*transform.scaleY+transform.transY,y2=b*transform.scaleY+transform.transY;\n`+
  ` return {left:Math.min(x1,x2),right:Math.max(x1,x2),top:Math.min(y1,y2),bottom:Math.max(y1,y2)};\n}\n`+
  `function contains(outer:ReturnType<typeof box>,inner:ReturnType<typeof box>){return outer.left<=inner.left+3&&outer.right>=inner.right-3&&outer.top<=inner.top+3&&outer.bottom>=inner.bottom-3;}\n`+
  `function overlap(a:ReturnType<typeof box>,b:ReturnType<typeof box>){const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return x*y;}\n`+
  `export function p026TimelineState(frame:number){\n`+
  ` if(!Number.isSafeInteger(frame)||frame<1||frame>389)throw new RangeError('P026_FRAME_OUT_OF_RANGE');\n`+
  ` const active=P026_TIMELINE.instances.flatMap(row=>{const run=activeRun(row,frame);return run?[{row,run}]:[]});\n`+
  ` const masks=active.filter(({row})=>row.objectId===18&&row.clipDepth!==null);\n`+
  ` const text=active.filter(({row})=>P026_TIMELINE.definitions.some(d=>d.textId===row.objectId));\n`+
  ` const paragraphStates=text.flatMap(({row,run})=>{if(!P026_TIMELINE.nativeTextInstanceIds.includes(row.instanceId))return [];\n`+
  `  const definition=P026_TIMELINE.definitions.find(d=>d.textId===row.objectId)!;\n`+
  `  const clipping=masks.filter(mask=>mask.row.depth<row.depth&&row.depth<=mask.row.clipDepth!);\n`+
  `  const runStates=definition.runs.map(sourceRun=>{const ink=box([sourceRun.x,sourceRun.x+sourceRun.width,sourceRun.inkTop,sourceRun.inkBottom],run.state.transform);\n`+
  `   const glyphAdvanceBoxesTwips=sourceRun.glyphs.map(glyph=>box([glyph.x,glyph.x+glyph.advance,sourceRun.inkTop,sourceRun.inkBottom],run.state.transform));\n`+
  `   return {...sourceRun,ink,glyphAdvanceBoxesTwips,maskReady:clipping.every(mask=>contains(box(P026_TIMELINE.maskShapeBoundsTwips,mask.run.state.transform),ink))};});\n`+
  `  const complete=run.state.alpha>0&&runStates.every(value=>value.maskReady);\n`+
  `  return [{sourceTextId:row.objectId,instanceId:row.instanceId,depth:row.depth,sourceTransform:run.state.transform,alpha:run.state.alpha/256,complete,runs:runStates,text:definition.text}];\n`+
  ` });\n`+
  ` const nativeParagraphs=paragraphStates.filter(p=>p.complete);\n`+
  ` const glossaryInstances=P026_TIMELINE.glossary.map(control=>{\n`+
  `  const button=active.find(value=>value.row.instanceId===control.instanceId);\n`+
  `  const paragraph=paragraphStates.find(value=>value.instanceId===control.label.textInstanceId);\n`+
  `  const blue=paragraph?.runs.find(value=>value.sourceTextId===control.label.sourceTextId);\n`+
  `  const hit=button?box(control.hitShapeBoundsTwips,button.run.state.transform):null;\n`+
  `  const labelInk=blue?.ink??null;\n`+
  `  const hitMasks=button?masks.filter(mask=>mask.row.depth<button.row.depth&&button.row.depth<=mask.row.clipDepth!):[];\n`+
  `  const hitRegionMaskReady=!!hit&&hitMasks.every(mask=>contains(box(P026_TIMELINE.maskShapeBoundsTwips,mask.run.state.transform),hit));\n`+
  `  const ownInkOverlap=!!(hit&&labelInk)&&overlap(hit!,labelInk!)/((labelInk!.right-labelInk!.left)*(labelInk!.bottom-labelInk!.top))>=0.9;\n`+
  `  const available=!!(button&&button.run.state.alpha>0&&paragraph&&paragraph.alpha>0&&blue&&blue.colorRgb.join(',')==='0,0,204'&&blue.maskReady&&hitRegionMaskReady&&ownInkOverlap);\n`+
  `  return {...control,available,sourceAlpha:button?.run.state.alpha??0,sourceLabelAlpha:paragraph?.alpha??0,hitRegionMaskReady,ownInkOverlap,hitRegionTwips:hit,labelInkTwips:labelInk};\n`+
  ` });\n`+
  ` const glossary=Object.fromEntries([...new Set(glossaryInstances.map(g=>g.key))].map(key=>[key,glossaryInstances.some(g=>g.key===key&&g.available)])) as Record<P026GlossaryKey,boolean>;\n`+
  ` return {frame,frameDomain:'sprite-55' as const,elapsedSeconds:(frame-1)/12,glossaryInstances,glossary,\n`+
  `  paragraphStates,nativeParagraphs,suppressibleSourceTextIds:nativeParagraphs.map(p=>p.sourceTextId),\n`+
  `  suppressibleSourceTextInstanceIds:nativeParagraphs.map(p=>p.instanceId),\n`+
  `  canvasFallbackTextInstanceIds:text.filter(({row})=>P026_TIMELINE.canvasFallbackTextInstanceIds.includes(row.instanceId)).map(({row})=>row.instanceId),\n`+
  `  activeMasks:masks.map(({row,run})=>({instanceId:row.instanceId,depth:row.depth,clipDepth:row.clipDepth,boundsTwips:box(P026_TIMELINE.maskShapeBoundsTwips,run.state.transform)})),\n`+
  `  originalRuntimeAccepted:false as const};\n}\n`;
 return [[`${BASE.replace('behavior-ir-v1','native-text-v1')}/geometry-v1.json`,json],
  ['packages/demos/src/alg-l06-p026-timeline-v1.ts',generated]];
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(['--write','--check'].includes(process.argv[2]),'use --write or --check');
 const outputs=build();for(const [name,body] of outputs){const file=path.join(ROOT,name);
  if(process.argv[2]==='--check'){assert.equal(fs.readFileSync(file,'utf8'),body,`stale ${name}`);}
  else {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);}
 }
 console.log(JSON.stringify({mode:process.argv[2],outputs:outputs.map(([name,body])=>({path:name,bytes:Buffer.byteLength(body),sha256:sha(body)}))}));
}
