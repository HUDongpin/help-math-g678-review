#!/usr/bin/env node
/** P008 source-bound text-state generator; no original-runtime claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='migrations/shared-alg001-l06-p008/audit/source-v1';
const OUT='migrations/shared-alg001-l06-p008/audit/text-state-v1';
const TS='packages/demos/src/alg-l06-p008-text-state-v1.generated.ts';
const SWF_SHA='6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=p=>fs.readFileSync(path.join(ROOT,p));
const read=p=>JSON.parse(bytes(p));
const pin=p=>({path:p,bytes:bytes(p).length,sha256:sha(bytes(p))});
const json=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const ROWS=[[20,36,42],[30,37,43],[40,38,44],[50,39,45],
 [60,41,47],[70,40,46],[80,430,431],[90,432,433],[100,434,435],[110,436,437]]
 .map(([cups,cupsId,moneyId])=>({id:'cups-'+cups,cupsId,moneyId}));
const PRICES=[{id:'lemonade-price',labelId:10,valueId:11},
 {id:'orange-juice-price',labelId:30,valueId:31}];
const EMPHASIS=[{shapeId:111,textId:41,rowId:'cups-60'},
 {shapeId:118,textId:40,rowId:'cups-70'},
 {shapeId:137,textId:47,rowId:'cups-60'},
 {shapeId:138,textId:46,rowId:'cups-70'}];

function shapeBounds(xml,id){
 const needle=new RegExp('<DefineShape(?:2|3|4)? objectID="'+id+'">\\s*<bounds>\\s*'
  +'<Rectangle left="(-?\\d+)" right="(-?\\d+)" top="(-?\\d+)" bottom="(-?\\d+)"');
 const m=xml.match(needle);assert(m,'shape bounds '+id);
 return {left:+m[1],right:+m[2],top:+m[3],bottom:+m[4]};
}
function data(){
 const sourceTextPath=SOURCE+'/source-text-v1.json';
 const compositionPath=SOURCE+'/source-composition-v1.json';
 const xmlPath=SOURCE+'/swfmill-v1.xml.gz';
 const t=read(sourceTextPath),c=read(compositionPath),xml=gunzipSync(bytes(xmlPath)).toString('utf8');
 assert.equal(t.sourceSha256,SWF_SHA);
 assert.equal(c.main.domainId,'sprite-507');
 const definitions=t.textDefinitions.map(d=>({characterId:d.characterId,
  sourceTextId:'character-'+d.characterId,text:d.runs?.map(r=>r.text).join('')??'',
  boundsTwips:d.boundsTwips,sourceTagSha256:d.sourceTagSha256}));
 const def=new Map(definitions.map(d=>[d.characterId,d]));
 assert.equal(def.get(508).text,'Understanding Functions: Real World Activity');
 for(const [id,text] of [[10,'Lemonade: '],[11,'50¢ per cup'],[30,'orange juice:'],
  [31,'75¢ per cup'],[430,'80'],[431,'$40.00'],[432,'90'],[433,'$45.00'],
  [434,'100'],[435,'$50.00'],[436,'110'],[437,'$55.00']])
  assert.equal(def.get(id).text,text);
 const main=t.timelines.find(x=>x.timelineId==='sprite-507');
 const root=t.timelines.find(x=>x.timelineId==='root');
 const event=new Map(main.events.map(e=>[e.eventId,e]));
 const instances=main.instances.filter(i=>def.has(i.characterId)).map(i=>({
  characterId:i.characterId,instanceId:i.instanceId,depth:i.depth,
  firstFrame:i.firstFrame,lastFrameExclusive:i.lastFrameExclusive,
  updates:i.updates.map(id=>{const e=event.get(id);assert(e);return {
   frame:e.frame,matrix:e.matrix??null,alphaMultiply:e.colorTransform?.multiply?.[3]??null,
   alphaAdd:e.colorTransform?.add?.[3]??null};}),
 }));
 assert.equal(instances.length,118);
 const masks=c.main.masks.map(({event:placement,instance})=>({
  characterId:placement.characterId,depth:placement.depth,clipDepth:placement.clipDepth,
  firstFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive,
  boundsTwips:shapeBounds(xml,placement.characterId),
  updates:instance.updates.map(id=>{const e=event.get(id);assert(e);return {frame:e.frame,matrix:e.matrix??null};}),
 }));
 assert.deepEqual(masks.map(m=>[m.characterId,m.depth,m.clipDepth]),[[1,1,498],[428,388,403]]);
 const offstage=root.instances.find(i=>i.characterId===508);
 const placement=root.events.find(e=>e.eventId===offstage.createdByEventId);
 assert(placement.matrix[5]+def.get(508).boundsTwips.bottom<0);
 assert(root.instances.some(i=>i.characterId===510&&i.firstFrame===6));
 assert(t.timelines.find(x=>x.timelineId==='sprite-510').instances.some(i=>i.characterId===509));
 const title={text:def.get(508).text,sourceTextIds:['character-508'],sourceShapeIds:[509],
  rootFrame:6,sourceText508Visibility:'offstage',renderedSourceRole:'outlined-shape-509'};
 const emphasis=EMPHASIS.map(item=>{
  const shape=t.shapeDefinitions.find(s=>s.characterId===item.shapeId);assert(shape);
  const sourceOccurrences=main.instances.filter(i=>i.characterId===item.shapeId);
  assert(sourceOccurrences.every(i=>i.lastFrameExclusive===i.firstFrame+1),
   'outlined emphasis instances are exactly one source frame');
  const occurrences=sourceOccurrences.map(i=>({
   instanceId:i.instanceId,frame:i.firstFrame,depth:i.depth,sourcePlacementEventId:i.createdByEventId}));
  assert(occurrences.length>=3&&occurrences.every(o=>o.depth===499));
  for(const o of occurrences)assert(main.instances.some(i=>
   i.characterId===item.textId&&i.depth===500&&i.firstFrame===o.frame&&
   i.lastFrameExclusive===o.frame+1));
  return {...item,text:def.get(item.textId).text,sourceTextIds:['character-'+item.textId],
   sourceShapeIds:[item.shapeId],sourceShapeTagSha256:shape.sourceTagSha256,occurrences};
 });
 assert.deepEqual(c.main.rootPlacement.matrix,[1,0,0,1,7390,5060]);
 return {schemaVersion:1,animationId:'shared-alg001-l06-p008',sourceSwfSha256:SWF_SHA,
  frameDomain:'sprite-507',frameCount:938,rootFrame:6,rootMatrix:c.main.rootPlacement.matrix,
  stageTwips:{left:0,right:16000,top:0,bottom:12000},
  definitions,instances,masks,title,prices:PRICES,tableRows:ROWS,emphasis,
  sourceRoles:{bitmapText:'incidental scene signage retained in Canvas',
   thoughtDollarShapeIds:[361,362],thoughtDollarRole:'non-numeric money imagery retained in Canvas',
   otherOutlinedShapes:'separate source-role audit, no complete text claim'},
  policy:{pricePairs:'both source members alpha-positive and intersect stage and masks; native restores partially cropped context',
   tableRows:'both source members fully inside stage and masks at alpha one; partial answer rows withheld',
   emphasis:'pink outlined values annotate existing 60/70 and $30/$35 rows, never duplicate quantities',
   language:'source English only, no invented Spanish translation',originalRuntimeAccepted:false}};
}

const RUNTIME=[
"export type P008TextVisibility='hidden'|'partial'|'full';",
"type Rect={left:number;right:number;top:number;bottom:number};",
"const active=(f:number,a:number,b:number)=>f>=a&&f<b;",
"function rect(b:Rect,m:readonly number[]):Rect {",
" const p=[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]].map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);",
" return {left:Math.min(...p.map(q=>q[0])),right:Math.max(...p.map(q=>q[0])),top:Math.min(...p.map(q=>q[1])),bottom:Math.max(...p.map(q=>q[1]))};",
"}",
"const intersects=(a:Rect,b:Rect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;",
"const contains=(a:Rect,b:Rect)=>b.left>=a.left&&b.right<=a.right&&b.top>=a.top&&b.bottom<=a.bottom;",
"function maskAt(mask:(typeof P008_TEXT_STATE_SOURCE.masks)[number],frame:number):Rect|null {",
" if(!active(frame,mask.firstFrame,mask.lastFrameExclusive))return null;",
" const matrix=mask.updates.filter(u=>u.frame<=frame&&u.matrix!==null).at(-1)?.matrix;",
" return matrix?rect(mask.boundsTwips,matrix):null;",
"}",
"function instanceAt(i:(typeof P008_TEXT_STATE_SOURCE.instances)[number],frame:number){",
" const d=P008_TEXT_STATE_SOURCE.definitions.find(x=>x.characterId===i.characterId)!;",
" let matrix:readonly number[]|null=null,alpha=1;",
" if(active(frame,i.firstFrame,i.lastFrameExclusive))for(const u of i.updates){if(u.frame>frame)break;",
"  if(u.matrix)matrix=u.matrix;",
"  if(u.alphaMultiply!==null)alpha=Math.max(0,Math.min(1,(u.alphaMultiply+(u.alphaAdd??0))/256));",
" }",
" let visibility:P008TextVisibility='hidden',sourceBoundsTwips:Rect|null=null;",
" if(matrix&&alpha>0){",
"  sourceBoundsTwips=rect(d.boundsTwips,matrix);",
"  const root=P008_TEXT_STATE_SOURCE.rootMatrix;",
"  const bounds:Rect[]=[{left:-root[4],right:P008_TEXT_STATE_SOURCE.stageTwips.right-root[4],top:-root[5],bottom:P008_TEXT_STATE_SOURCE.stageTwips.bottom-root[5]}];",
"  for(const mask of P008_TEXT_STATE_SOURCE.masks)if(i.depth>mask.depth&&i.depth<=mask.clipDepth){",
"   const clipping=maskAt(mask,frame);if(clipping)bounds.push(clipping);",
"  }",
"  if(bounds.every(b=>intersects(sourceBoundsTwips!,b)))visibility=alpha===1&&bounds.every(b=>contains(b,sourceBoundsTwips!))?'full':'partial';",
" }",
" return {characterId:i.characterId,text:d.text,sourceTextIds:[d.sourceTextId],instanceIds:[i.instanceId],visibility,alpha,depth:i.depth,sourceBoundsTwips};",
"}",
"export function p008TextState(frame:number){",
" if(!Number.isInteger(frame)||frame<1||frame>P008_TEXT_STATE_SOURCE.frameCount)throw new RangeError('P008_TEXT_FRAME_OUT_OF_RANGE');",
" const instances=P008_TEXT_STATE_SOURCE.instances.map(i=>instanceAt(i,frame));",
" const entries=P008_TEXT_STATE_SOURCE.definitions.map(d=>{const live=instances.filter(i=>i.characterId===d.characterId&&i.visibility!=='hidden');",
"  const visibility:P008TextVisibility=live.some(i=>i.visibility==='full')?'full':live.length?'partial':'hidden';",
"  return {characterId:d.characterId,text:d.text,sourceTextIds:[d.sourceTextId],instanceIds:live.flatMap(i=>i.instanceIds),visibility};",
" });",
" const entry=(id:number)=>entries.find(e=>e.characterId===id)!;",
" const prices=P008_TEXT_STATE_SOURCE.prices.map(p=>{const label=entry(p.labelId),value=entry(p.valueId);",
"  return {id:p.id,label:label.text,value:value.text,sourceTextIds:[...label.sourceTextIds,...value.sourceTextIds],",
"   instanceIds:[...label.instanceIds,...value.instanceIds],labelVisibility:label.visibility,valueVisibility:value.visibility,",
"   semanticVisible:label.visibility!=='hidden'&&value.visibility!=='hidden',disposition:'native restores partially cropped source context' as const};",
" });",
" const tableRows=P008_TEXT_STATE_SOURCE.tableRows.map(r=>{const cups=entry(r.cupsId),money=entry(r.moneyId);",
"  return {id:r.id,cups:cups.text,money:money.text,sourceTextIds:[...cups.sourceTextIds,...money.sourceTextIds],",
"   instanceIds:[...cups.instanceIds,...money.instanceIds],cupsVisibility:cups.visibility,moneyVisibility:money.visibility,",
"   semanticVisible:cups.visibility==='full'&&money.visibility==='full'};",
" });",
" const emphasis=P008_TEXT_STATE_SOURCE.emphasis.filter(e=>e.occurrences.some(o=>o.frame===frame)).map(e=>({",
"  rowId:e.rowId,text:e.text,sourceShapeIds:e.sourceShapeIds,sourceTextIds:e.sourceTextIds,",
"  instanceIds:e.occurrences.filter(o=>o.frame===frame).map(o=>o.instanceId)}));",
" return {animationId:P008_TEXT_STATE_SOURCE.animationId,sourceSwfSha256:P008_TEXT_STATE_SOURCE.sourceSwfSha256,",
"  frameDomain:P008_TEXT_STATE_SOURCE.frameDomain,frame,rootFrame:6,title:P008_TEXT_STATE_SOURCE.title,",
"  instances,entries,prices,tableRows,emphasis,languagePolicy:'source-en-only' as const};",
"}",
].join('\n')+'\n';

const SOURCE_TYPE=[
"type P008Rect={left:number;right:number;top:number;bottom:number};",
"type P008Matrix=number[];",
"type P008TextStateSource={",
" schemaVersion:number;animationId:string;sourceSwfSha256:string;frameDomain:string;frameCount:number;rootFrame:number;",
" rootMatrix:P008Matrix;stageTwips:P008Rect;",
" definitions:Array<{characterId:number;sourceTextId:string;text:string;boundsTwips:P008Rect;sourceTagSha256:string}>;",
" instances:Array<{characterId:number;instanceId:string;depth:number;firstFrame:number;lastFrameExclusive:number;",
"  updates:Array<{frame:number;matrix:P008Matrix|null;alphaMultiply:number|null;alphaAdd:number|null}>}>;",
" masks:Array<{characterId:number;depth:number;clipDepth:number;firstFrame:number;lastFrameExclusive:number;",
"  boundsTwips:P008Rect;updates:Array<{frame:number;matrix:P008Matrix|null}>}>;",
" title:{text:string;sourceTextIds:string[];sourceShapeIds:number[];rootFrame:number;",
"  sourceText508Visibility:string;renderedSourceRole:string};",
" prices:Array<{id:string;labelId:number;valueId:number}>;",
" tableRows:Array<{id:string;cupsId:number;moneyId:number}>;",
" emphasis:Array<{shapeId:number;textId:number;rowId:string;text:string;sourceTextIds:string[];",
"  sourceShapeIds:number[];sourceShapeTagSha256:string;occurrences:Array<{instanceId:string;frame:number;depth:number;sourcePlacementEventId:string}>}>;",
" sourceRoles:Record<string,string|number[]>;policy:Record<string,string|boolean>;",
"};",
].join('\n')+'\n';

function generate(){
 const source=data();
 const generated=Buffer.from('/* Generated by scripts/build-alg-l06-p008-text-state-v1.mjs. Do not edit. */\n'
  +SOURCE_TYPE+'export const P008_TEXT_STATE_SOURCE:P008TextStateSource = JSON.parse('
  +JSON.stringify(JSON.stringify(source))+');\n'+RUNTIME);
 const inputs=['source-text-v1.json','source-composition-v1.json','swfmill-v1.xml.gz'].map(n=>pin(SOURCE+'/'+n));
 const audit={schemaVersion:1,kind:'alg-l06-p008-text-state-audit-v1',sourceSwfSha256:SWF_SHA,
  inputs,generated:{path:TS,bytes:generated.length,sha256:sha(generated)},
  title:source.title,prices:PRICES,tableRows:ROWS,outlinedEmphasis:source.emphasis,
  lateRowFullRevealFrames:[796,801,806,810],
  limits:['Source geometry and alpha only; no occlusion reconstruction beyond SWF clip masks.',
   'Partially cropped price context is restored as modern semantic text, not claimed full Flash visibility.',
   'Original runtime, listening, human and Owner acceptance remain separate.']};
 return new Map([[TS,generated],[OUT+'/source-ir-v1.json',json(source)],
  [OUT+'/text-state-audit-v1.json',json(audit)]]);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));
 const outputs=generate();
 for(const [relative,content] of outputs){const target=path.join(ROOT,relative);
  if(process.argv[2]==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}
  assert.deepEqual(fs.readFileSync(target),content,'generated text-state drift '+relative);
 }
 console.log(JSON.stringify({status:'P008_SOURCE_TEXT_STATE_VERIFIED_NOT_ADMITTED',
  outputs:[...outputs].map(([path,content])=>({path,bytes:content.length,sha256:sha(content)}))}));
}
