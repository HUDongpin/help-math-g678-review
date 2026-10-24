#!/usr/bin/env node
/** Source-bound P034 native text geometry; generated files are never hand edited. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PLAN='output/alg-l06-p034-source-planning-20261001-v1';
const OUT='migrations/shared-alg001-l06-p034/native-v1';
const COMPONENT='packages/demos/src/native-text/alg-l06-p034-native.tsx';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/IN/L6IN06.swf';
const SOURCE_SHA='32ddbfde743b785610360f38b7030ab2dbd289438f6c4433e6699ce3004a629a';
const ID='shared-alg001-l06-p034';
const TEXT_IDS=[5,12,15,17,19,24,25,26,27,28,31,32,33];
const ROLES={5:'definition',12:'criterion',15:'conclusion',17:'definition',19:'criterion',
 24:'graph-label',25:'graph-label',26:'graph-label',27:'graph-label',28:'graph-label',
 31:'prompt',32:'instruction',33:'instruction'};
// Physical button placements, not a page-wide substring search. The two
// 'vertical line' source runs each have distinct Vertical/Line button hits.
const GLOSSARY_LABELS=[
 [7,4,'Vertical-line test',5,3,1,0,18],
 [8,6,'Graph',5,3,3,0,5],
 [9,8,'Function',5,3,5,0,8],
 [13,14,'Vertical',12,13,1,0,8],
 [14,16,'Line',12,13,1,9,4],
 [7,34,'Vertical-line test',17,33,1,0,18],
 [8,36,'Graph',17,33,3,0,5],
 [9,38,'Function',17,33,5,0,8],
 [20,44,'Vertical',19,43,1,0,8],
 [21,46,'Line',19,43,1,9,4],
];
const sha=data=>createHash('sha256').update(data).digest('hex');
const read=name=>fs.readFileSync(path.join(ROOT,name));
const pin=name=>({path:name,bytes:read(name).length,sha256:sha(read(name))});
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)]
 .map(match=>[match[1],match[2]]));
const number=(value,fallback=0)=>value===undefined?fallback:Number(value);
const pick=(body,regex,label)=>{const match=body.match(regex);assert(match,`missing ${label}`);return match[1];};
const matrix=record=>({scaleX:number(record?.scaleX,1),scaleY:number(record?.scaleY,1),
 transX:number(record?.transX),transY:number(record?.transY)});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function physicalSource(){
 const file=path.join(SOURCE_ROOT,SOURCE);
 assert.equal(fs.realpathSync(file),file,'physical source path');
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,'ordinary source');
 const data=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`source changed: ${key}`);
 return data;
}
function rectangle(xml,tag,id){
 const body=pick(xml,new RegExp(`<${tag} objectID="${id}">([\\s\\S]*?)<\\/${tag}>`,'u'),`${tag} ${id}`);
 const bounds=attrs(pick(body,/<Rectangle\b([^>]*)\/>/u,`${tag} ${id} bounds`));
 return Object.fromEntries(Object.entries(bounds).map(([key,value])=>[key,number(value)]));
}
function fontGlyphs(xml){
 const result=new Map();
 for(const match of xml.matchAll(/<DefineFont2 objectID="(\d+)"[^>]*>([\s\S]*?)<\/DefineFont2>/gu)){
  result.set(number(match[1]),[...match[2].matchAll(/<Glyph map="(\d+)"/gu)]
   .map(g=>String.fromCodePoint(number(g[1]))));
 }
 assert.deepEqual([...result.keys()],[4]);
 assert.deepEqual([...result.values()].map(g=>g.length),[33]);
 return result;
}
function textDefinitions(xml,display){
 const glyphMap=fontGlyphs(xml),result=[];
 for(const textId of TEXT_IDS){
  const body=pick(xml,new RegExp(`<DefineText objectID="${textId}">([\\s\\S]*?)<\\/DefineText>`,'u'),`text ${textId}`);
  const boundsTwips=rectangle(xml,'DefineText',textId);
  const definitionTransform=matrix(attrs(pick(body,/<transform>\s*<Transform\b([^>]*)\/>/u,`text transform ${textId}`)));
  assert.equal(definitionTransform.scaleX,1);assert.equal(definitionTransform.scaleY,1);
  let x=0,y=0,fontHeight=440,fontId=0,colorRgb=[0,0,0],runIndex=0;
  const runs=[];
  for(const match of body.matchAll(/<TextRecord6\b([^>]*)>([\s\S]*?)<\/TextRecord6>/gu)){
   const a=attrs(match[1]);
   if(a.x!==undefined)x=number(a.x);if(a.y!==undefined)y=number(a.y);
   if(a.fontHeight!==undefined)fontHeight=number(a.fontHeight);
   if(a.objectID!==undefined)fontId=number(a.objectID);
   const color=match[2].match(/<Color red="(\d+)" green="(\d+)" blue="(\d+)"\/>/u);
   if(color)colorRgb=color.slice(1).map(Number);
   const entries=[...match[2].matchAll(/<TextEntry\b([^>]*)\/>/gu)];
   if(!entries.length)continue;
   assert(glyphMap.has(fontId),`font ${fontId} text ${textId}`);
   let glyphX=x;
   const glyphs=entries.map(entry=>{
    const e=attrs(entry[1]),index=number(e.glyph),advance=number(e.advance);
    const character=glyphMap.get(fontId)[index];assert(character!==undefined,`glyph ${index}`);
    const glyph={character,glyphIndex:index,x:glyphX+definitionTransform.transX,advance};
    glyphX+=advance;return glyph;
   });
   runs.push({text:glyphs.map(g=>g.character).join(''),colorRgb:[...colorRgb],
    x:x+definitionTransform.transX,y:y+definitionTransform.transY,
    fontHeight,fontId,width:glyphX-x,sourceTextId:`character-${textId}/run-${runIndex}`,
    glyphs});
   x=glyphX;runIndex++;
  }
  const exportEntry=display.texts.find(entry=>entry.path===`source-export/texts/${textId}.txt`);
  assert(exportEntry,`source text ${textId}`);
  const exportName=`${PLAN}/${exportEntry.path}`,exportBytes=read(exportName);
  assert.equal(exportBytes.length,exportEntry.bytes);assert.equal(sha(exportBytes),exportEntry.sha256);
  const exported=exportBytes.toString().split(/\n--- RECORDSEPARATOR ---\n/u).join('');
  assert.equal(runs.map(run=>run.text).join(''),exported,`source glyphs ${textId}`);
  const ascent=runs[0].y-boundsTwips.top,descent=boundsTwips.bottom-runs.at(-1).y;
  for(const run of runs){run.inkTop=run.y-ascent;run.inkBottom=run.y+descent;}
  result.push({textId,role:ROLES[textId],text:exported,sourceTextSha256:exportEntry.sha256,
   boundsTwips,definitionTransform,runs});
 }
 assert.equal(result.length,13);
 return result;
}
function spans(frames){
 const result=[];
 for(const frame of frames){const last=result.at(-1);
  if(last&&last[1]===frame-1)last[1]=frame;else result.push([frame,frame]);}
 return result;
}
function reconstruct(spriteId,display){
 const sprite=display.sprites[String(spriteId)],byFrame=new Map();
 for(const change of sprite.changes){
  const list=byFrame.get(change.frame)??[];list.push(change);byFrame.set(change.frame,list);
 }
 const active=new Map(),generations=new Map(),rows=new Map();
 for(let frame=1;frame<=sprite.frameCount;frame++){
  for(const change of byFrame.get(frame)??[]){
   const old=active.get(change.depth);
   if(change.kind==='remove'){
    assert(old&&old.objectId===change.objectId,`remove ${spriteId}/${change.depth}/${frame}`);
    active.delete(change.depth);continue;
   }
   assert.equal(change.kind,'place');
   if(change.newCharacter){
    const generation=(generations.get(change.depth)??0)+1;
    generations.set(change.depth,generation);
    active.set(change.depth,{objectId:change.objectId,generation});
   }else assert(old&&old.objectId===change.objectId,`modify ${spriteId}/${change.depth}/${frame}`);
   const state=active.get(change.depth);
   // PlaceObject2 may update alpha without carrying a matrix. Keep the
   // prior matrix in that case; an identity reset moves source graph labels.
   assert(change.transform!==null||!change.newCharacter,`new placement matrix ${spriteId}/${frame}`);
   state.transform=change.transform===null?state.transform:matrix(change.transform);
   state.alpha=change.alpha;
   state.clipDepth=change.clipDepth;
  }
  for(const [depth,state] of active){
   const id=`depth-${depth}/generation-${state.generation}`;
   let row=rows.get(id);
   if(!row){row={instanceId:id,ownerSpriteId:spriteId,objectId:state.objectId,
    depth,clipDepth:state.clipDepth??null,runs:[]};rows.set(id,row);}
   const value={transform:state.transform,alpha:state.alpha};
   const last=row.runs.at(-1);
   if(last&&last.lastFrame===frame-1&&equal(last.state,value))last.lastFrame=frame;
   else row.runs.push({firstFrame:frame,lastFrame:frame,state:value});
  }
 }
 assert.equal(rows.size,sprite.instances.length,`sprite ${spriteId} instance count`);
 for(const expected of sprite.instances){
  const row=rows.get(expected.instanceId);assert(row,`source instance ${spriteId}/${expected.instanceId}`);
  assert.equal(row.objectId,expected.objectId);assert.equal(row.depth,expected.depth);
  assert.equal(row.clipDepth,expected.clipDepth);
  const all=[];for(const run of row.runs)for(let f=run.firstFrame;f<=run.lastFrame;f++)all.push(f);
  assert.deepEqual(spans(all),expected.presentSpans,`source span ${spriteId}/${expected.instanceId}`);
 }
 return [...rows.values()].sort((a,b)=>a.depth-b.depth||a.instanceId.localeCompare(b.instanceId));
}
function makeModel(plan,display,xml){
 assert.equal(plan.identity.animationId,ID);
 assert.equal(plan.physicalSource.swf.sha256,SOURCE_SHA);
 assert.equal(display.sourceSwfSha256,SOURCE_SHA);
 assert.equal(display.sprites['40'].frameCount,434);
 assert.equal(display.sprites['36'].frameCount,1);
 assert.deepEqual(display.texts.map(t=>Number(t.path.match(/\/(\d+)\.txt$/u)[1])).sort((a,b)=>a-b),TEXT_IDS);
 const definitions=textDefinitions(xml,display);
 const main=reconstruct(40,display),graph=reconstruct(36,display);
 const textInstances=[...main,...graph].filter(row=>TEXT_IDS.includes(row.objectId));
 assert.equal(textInstances.length,47);
 const masks=main.filter(row=>row.clipDepth!==null);
 assert.deepEqual(masks.map(({objectId,depth,clipDepth,runs})=>
  [objectId,depth,clipDepth,runs[0].firstFrame]),
  plan.structure.sourceClipMasks.map(({objectId,depth,clipDepth,presentSpans})=>
   [objectId,depth,clipDepth,presentSpans[0][0]]));
 const graphPlacement=main.find(row=>row.objectId===36&&row.depth===2);
 assert(graphPlacement&&graphPlacement.runs[0].firstFrame===433);
 const root=display.root.instances.find(row=>row.objectId===40&&row.name==='animation');
 assert(root&&root.placedFrame===6);
 const maskBounds=Object.fromEntries([2,10,30].map(id=>[id,rectangle(xml,'DefineShape3',id)]));
 assert.deepEqual(maskBounds[2],{left:-6112,right:6497,top:-270,bottom:270});
 assert.deepEqual(maskBounds[10],{left:-6597,right:6598,top:-300,bottom:300});
 assert.deepEqual(maskBounds[30],{left:-5060,right:5059,top:-220,bottom:220});
 const hitBounds=rectangle(xml,'DefineShape',6);
 assert.deepEqual(hitBounds,{left:-569,right:-213,top:-200,bottom:200});
 const glossary=GLOSSARY_LABELS.map(([buttonId,depth,key,labelTextId,labelDepth,
  runIndex,glyphStart,glyphCount])=>{
  const sourceAction=plan.actions.glossary.find(x=>x.buttonId===buttonId);
  assert(sourceAction&&sourceAction.keyAttribute===key&&
   sourceAction.placements.some(x=>x.depth===depth),'source glossary action/placement');
  const script=read(`${PLAN}/${sourceAction.action.path}`);
  assert.equal(sha(script),sourceAction.action.sha256,'source glossary action bytes');
  assert(script.toString().includes(`_global.KeyAttribute = "${key}";`));
  const button=main.find(x=>x.objectId===buttonId&&x.depth===depth);
  const label=textInstances.find(x=>x.ownerSpriteId===40&&
   x.objectId===labelTextId&&x.depth===labelDepth);
  assert(button&&label,'source button and exact label instance');
  const definition=definitions.find(x=>x.textId===labelTextId);
  const run=definition?.runs[runIndex];
  assert(run&&equal(run.colorRgb,[0,0,204]),'source blue label run');
  const segment=run.glyphs.slice(glyphStart,glyphStart+glyphCount)
   .map(x=>x.character).join('');
  assert.equal(segment.toLowerCase(),key.toLowerCase(),'source label segment');
  const body=pick(xml,new RegExp(`<DefineButton2 objectID="${buttonId}"[^>]*>([\\s\\S]*?)<\\/DefineButton2>`,'u'),
   `button ${buttonId}`);
  const hit=pick(body,/<Button hitTest="1"[^>]*objectID="6"[^>]*>([\s\S]*?)<\/Button>/u,
   `button ${buttonId} hit`);
  const hitTransform=matrix(attrs(pick(hit,/<Transform\b([^>]*)\/>/u,`button ${buttonId} hit transform`)));
  const buttonDefinition=display.buttonDefinitions.find(x=>x.id===buttonId);
  assert(buttonDefinition?.events.length===1&&
   buttonDefinition.events[0].pointerReleaseInside==='1'&&
   buttonDefinition.records[0].objectID==='6'&&
   buttonDefinition.records[0].hitTest==='1','source release/hit event');
  return {key,buttonId,buttonInstanceId:button.instanceId,depth,
   actionSha256:sourceAction.action.sha256,
   label:{textId:labelTextId,instanceId:label.instanceId,depth:labelDepth,
    sourceRunId:run.sourceTextId,segment,glyphStart,glyphCount},
   hitShapeId:6,hitShapeBoundsTwips:hitBounds,hitTransform,
   runs:button.runs};
 });
 assert.equal(glossary.length,10);
 return {schemaVersion:1,kind:'alg-l06-p034-native-source-geometry-v1',
  animationId:ID,source:{path:SOURCE,sha256:SOURCE_SHA},
  sourceXmlSha256:display.sourceXmlSha256,
  stage:{width:800,height:600},fps:12,rootFrame:6,frameDomain:'sprite-40',
  mainFrameCount:434,sourceLanguage:'en',visualLanguagePolicy:'source-en-fallback-for-es',
  rootSpriteTransform:matrix(root.firstVisibleTransform),graphPlacement,
  maskShapeBoundsTwips:maskBounds,
  definitions,instances:textInstances,masks,glossary,
  sourceTextDefinitionIds:TEXT_IDS,
  canvasSourceGlyphsPreserved:true,canvasInstanceSuppressionSupported:false,
  originalRuntimeAccepted:false};
}
export function build(){
 const planName=`${PLAN}/source-plan-v1.json`,displayName=`${PLAN}/source-display-list-v1.json`,
  xmlName=`${PLAN}/source-structure.xml`;
 const planBytes=read(planName),displayBytes=read(displayName),xmlBytes=read(xmlName);
 const plan=JSON.parse(planBytes),display=JSON.parse(displayBytes);
 assert.equal(sha(xmlBytes),display.sourceXmlSha256);
 assert.equal(sha(xmlBytes),plan.inputs.swfmillXml.sha256);
 assert.equal(sha(displayBytes),plan.inputs.displayList.sha256);
 const source=physicalSource();
 assert.equal(source.length,plan.physicalSource.swf.bytes);
 assert.equal(sha(source),SOURCE_SHA);
 const model=makeModel(plan,display,xmlBytes.toString());
 const geometry=JSON.stringify(model,null,2)+'\n';
 const inputs=[planName,displayName,xmlName,
  ...display.texts.map(t=>`${PLAN}/${t.path}`),
  ...plan.actions.glossary.map(x=>`${PLAN}/${x.action.path}`),
  'scripts/prepare-alg-l06-p034-native-text-v1.mjs',COMPONENT].map(pin);
 const receipt=JSON.stringify({schemaVersion:1,kind:'alg-l06-p034-native-generation-v1',
  animationId:ID,source:{path:SOURCE,bytes:source.length,sha256:SOURCE_SHA},
  inputs,outputs:[{path:`${OUT}/geometry-v1.json`,bytes:Buffer.byteLength(geometry),sha256:sha(geometry)}],
  acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,
   listening:false,human:false,owner:false,strictComplete:false,publication:false}},null,2)+'\n';
 return [[`${OUT}/geometry-v1.json`,geometry],[`${OUT}/generation-receipt-v1.json`,receipt]];
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
