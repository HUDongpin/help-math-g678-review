#!/usr/bin/env node
/** Source-locked P022 reading companion. The source Canvas keeps every authored glyph. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB15.swf';
const SOURCE_SHA='a5868c68164c6401d2d79a8548f60f0d62401ca14f01f0494ef8ae6fd0e2d7c1';
const AUDIT='output/alg-l06-p022-source-audit-v1/time-resolved-audit-v1.json';
const AUDIT_SHA='9653e1a21712f98590f35bb9522424c25c391efbca790946ab9177d8fff7d08c';
const FRAMES='output/alg-l06-p022-source-audit-v1/frame-states-v1.json';
const FRAMES_SHA='25d24c99b5923ddf09ed452982c8b2483f2ab679103f93b951a603ea5303fd6f';
const GENERATED='packages/demos/src/generated/alg-l06-p022-text-state-v1.ts';
const REPORT='output/alg-l06-p022-native-text-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>{const bytes=read(relative);return {path:relative,bytes:bytes.length,sha256:sha(bytes)};};
const stringify=value=>JSON.stringify(value,null,2)+'\n';
const expectedText=new Map([[5,'A graph of a function is a visual representation of the function. It shows '],
 [10,'graph'],[11,'function'],[12,'representation'],
 [14,'the ordered pairs of inputs and outputs for the function.'],
 [18,'ordered'],[19,'pairs'],[20,'inputs'],[21,'outputs'],[26,'y'],[34,'x'],
 [37,'-2'],[38,'-4'],[39,'2'],[40,'4'],[41,'-6'],[42,'6'],
 [47,'y = –x – 1'],[48,'y = –2 – 1         Input is 2'],
 [49,'y = –3              Output is –3 '],[50,'2'],[51,'s'],[52,'i'],[53,'t'],
 [54,'u'],[55,'p'],[56,'n'],[57,'I'],[58,'1'],[59,'–'],[60,'='],[61,'y'],
 [62,'3'],[63,'O'],[64,'2,'],[65,'(        )']]);
const expectedControls=[['Graph',7,5,8],['Function',9,5,17],['Representation',8,5,42],
 ['Ordered pair',15,14,85],['Input',16,14,91],['Output',17,14,99]];
const inSpan=(spans,frame)=>spans.some(([first,last])=>first<=frame&&frame<=last);
function spans(values){const result=[];for(let i=0;i<values.length;i++)if(values[i]){
 const first=i+1;while(i+1<values.length&&values[i+1])i++;result.push([first,i+1]);
}return result;}
const area=box=>Math.max(0,box.right-box.left)*Math.max(0,box.bottom-box.top);
const overlapRatio=(outer,inner)=>area({left:Math.max(outer.left,inner.left),
 right:Math.min(outer.right,inner.right),top:Math.max(outer.top,inner.top),
 bottom:Math.min(outer.bottom,inner.bottom)})/area(inner);
const overlapY=(a,b)=>Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top);
function sourceState(){
 const stat=fs.lstatSync(SOURCE);assert(stat.isFile()&&!stat.isSymbolicLink());
 assert.equal(fs.realpathSync(SOURCE),SOURCE);
 const swf=fs.readFileSync(SOURCE);assert.equal(swf.length,135254);assert.equal(sha(swf),SOURCE_SHA);
 const auditPin=pin(AUDIT),framePin=pin(FRAMES);
 assert.equal(auditPin.sha256,AUDIT_SHA);assert.equal(framePin.sha256,FRAMES_SHA);
 const audit=JSON.parse(read(AUDIT)),frames=JSON.parse(read(FRAMES));
 assert.deepEqual(audit.source,{path:SOURCE,bytes:swf.length,sha256:SOURCE_SHA});
 assert.equal(frames.sourceSha256,SOURCE_SHA);
 assert.equal(audit.identity.animationId,'shared-alg001-l06-p022');
 assert.deepEqual(audit.identity.stage,{width:800,height:600});
 assert.equal(audit.identity.fps,12);assert.equal(audit.identity.rootEntryFrame,6);
 assert.equal(audit.identity.rootFrameCount,10);
 assert.equal(audit.identity.mainDomain,'sprite-67');assert.equal(audit.identity.mainFrameCount,422);
 assert.equal(audit.textDefinitions.length,36);assert.equal(audit.buttons.length,6);
 assert.equal(frames.frameDomain,'sprite-67');assert.equal(frames.frameCount,422);
 assert.equal(frames.frames.length,422);
 assert.deepEqual(audit.textDefinitions.map(item=>item.characterId),[...expectedText.keys()]);
 for(const item of audit.textDefinitions)assert.equal(item.text,expectedText.get(item.characterId));
 const byFrame=frames.frames.map((frame,index)=>{assert.equal(frame.frame,index+1);
  const rows=new Map(frame.items.map(item=>[item.instanceId,item]));
  assert.equal(rows.size,frame.items.length);return rows;});
 const textInstances=audit.instances.filter(item=>item.role==='static-text').map(instance=>{
  const definition=audit.textDefinitions.find(d=>d.characterId===instance.characterId);assert(definition);
  const completeInkSpans=spans(byFrame.map(rows=>{
   const row=rows.get(instance.instanceId);
   if(row){assert.equal(row.characterId,instance.characterId);assert.equal(row.depth,instance.depth);}
   return row?.completeInkVisible===true;}));
  assert.deepEqual(completeInkSpans,instance.visibleIntervals.completeInk
   .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
  const runs=definition.sourceInk.runs.map((run,index)=>{
   const completeRunSpans=spans(byFrame.map(rows=>rows.get(instance.instanceId)
    ?.runInk?.[index]?.completeInkVisible===true));
   assert.deepEqual(completeRunSpans,instance.visibleIntervals.runInk[index].intervals
    .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
   return {text:run.text,colorRgba:run.colorRgba,completeInkSpans:completeRunSpans};});
  return {instanceId:instance.instanceId,sourceTextId:instance.characterId,text:instance.text,
   depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
   lastActiveFrame:instance.lastActiveFrame,completeInkSpans,runs,
   sourcePlacementTagSha256:instance.sourcePlacementTagSha256};});
 assert.equal(textInstances.length,87);
 const glossaryControls=audit.buttons.flatMap(button=>button.instances.map(instance=>{
  assert.equal(button.actualClickObserved,false);
  const label=instance.sourceLabelBinding;
  const availableSpans=spans(byFrame.map(rows=>{
   const hit=rows.get(instance.instanceId);if(!hit?.staticFullHit)return false;
   const text=rows.get(label.textInstanceId);if(text?.characterId!==label.textId)return false;
   return Boolean(text.runInk?.some(run=>{
    if(run.text!==label.runText||run.colorRgba.join(',')!=='0,0,204,255')return false;
    const ink=label.segment===run.text?{completeInkVisible:run.completeInkVisible,
     worldBoundsTwips:run.worldBoundsTwips}:run.segments[label.segment];
    return ink?.completeInkVisible&&overlapRatio(hit.worldBoundsTwips,ink.worldBoundsTwips)>=0.95;
   }));}));
  assert.deepEqual(availableSpans,instance.sourceReadyIntervals
   .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
  assert.equal(availableSpans[0]?.[0]??null,instance.firstSourceReadyFrame);
  return {key:button.keyAttribute,sourceButtonId:button.characterId,
   sourceButtonInstanceId:instance.instanceId,sourceHitShapeId:button.hitCharacterId,
   sourceActionSha256:button.actionSha256,sourceButtonTagSha256:button.sourceTagSha256,
   sourcePlacementTagSha256:instance.sourcePlacementTagSha256,depth:instance.depth,
   firstPlacementFrame:instance.firstPlacementFrame,firstPartialHitFrame:instance.firstStaticAnyHitFrame,
   firstFullHitFrame:instance.firstStaticFullHitFrame,sourceLabelTextId:label.textId,
   sourceLabelTextInstanceId:label.textInstanceId,sourceLabelRunText:label.runText,
   sourceLabelSegment:label.segment,firstCandidateFrame:instance.firstSourceReadyFrame,
   availableSpans,originalClickObserved:false};}));
 glossaryControls.sort((a,b)=>a.firstCandidateFrame-b.firstCandidateFrame);
 assert.deepEqual(glossaryControls.map(item=>[item.key,item.sourceButtonId,
  item.sourceLabelTextId,item.firstCandidateFrame]),expectedControls);
 const find=(depth,generation,id)=>{const instance=textInstances.find(item=>item.instanceId===
  `sprite-67/depth-${depth}/generation-${generation}`);assert(instance);
  assert.equal(instance.sourceTextId,id);return instance;};
 const prose=[find(3,1,5),find(13,1,14)];
 const steps=[find(60,1,47),find(62,1,48),find(63,1,49)];
 assert.deepEqual(prose.map(item=>item.completeInkSpans),[[[71,422]],[[110,422]]]);
 assert.deepEqual(steps.map(item=>item.completeInkSpans),[[[244,422]],[[273,303]],[[301,303]]]);
 // The source assembles (2, –3) at the right before duplicating/moving it to the graph.
 // Its four independent source instances, not arithmetic, establish this semantic pair.
 const pairParts=[find(75,2,65),find(62,3,64),find(74,2,59),find(73,2,62)];
 const completePairSpans=spans(byFrame.map(rows=>{
  const parts=pairParts.map(item=>rows.get(item.instanceId));
  if(parts.some(item=>item?.completeInkVisible!==true))return false;
  const [paren,input,minus,output]=parts.map(item=>item.inkBoundsTwips);
  return paren.left<input.left&&input.right<minus.left&&minus.right<output.left&&
   output.right<paren.right&&overlapY(input,output);
 }));
 assert.deepEqual(completePairSpans,[[361,422]]);
 const movingCopy=[find(79,2,65),find(76,2,64),find(78,2,59),find(77,2,62)];
 assert(movingCopy.every(item=>item.firstPlacementFrame===415));
 const source={schemaVersion:1,animationId:'shared-alg001-l06-p022',sourceSwfSha256:SOURCE_SHA,
  source:{path:SOURCE,bytes:swf.length,sha256:SOURCE_SHA},inputs:[auditPin,framePin],
  stage:{width:800,height:600},fps:12,rootEntryFrame:6,frameDomain:'sprite-67',frameCount:422,
  textDefinitions:audit.textDefinitions.map(item=>({sourceTextId:item.characterId,text:item.text,
   definitionTagSha256:item.definitionTagSha256})),textInstances,
  reading:{proseInstanceIds:prose.map(item=>item.instanceId),
   stepInstanceIds:steps.map(item=>item.instanceId),
   canvasOnlyTextIds:[10,11,12,18,19,20,21,26,34,37,38,39,40,41,42,
    50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65]},
  glossaryControls,orderedPair:{text:'(2, –3)',sourceInstanceIds:pairParts.map(item=>item.instanceId),
   sourceTextIds:pairParts.map(item=>item.sourceTextId),firstCompletePairFrame:361,
   completePairSpans,movingCopyInstanceIds:movingCopy.map(item=>item.instanceId)},
  policy:{canvasGlyphs:'preserved',nativeRole:'source-timed-reflow-reading-companion',
   language:'source-en-fallback',proseReveal:'complete source sentence ink',
   glossary:'per-instance full hit containing own complete blue glyph segment',
   steps:'source literal full-line reveal; prior revealed steps retained as reading history after source glyph replacement',
   orderedPair:'all four source instances fully inked and geometrically ordered',
   canvasOnlyRoles:'transient highlights, axes ticks, moving single-glyph equation and pair copies stay in source Canvas',
   originalRuntimeAccepted:false}};
 return source;
}
const RUNTIME=String.raw`
export type P022GlossaryKey='Graph'|'Representation'|'Function'|'Ordered pair'|'Input'|'Output';
type Span=[number,number];
type TextInstance={instanceId:string;sourceTextId:number;text:string;depth:number;
 firstPlacementFrame:number;lastActiveFrame:number;completeInkSpans:Span[];
 runs:Array<{text:string;colorRgba:number[];completeInkSpans:Span[]}>;sourcePlacementTagSha256:string};
type GlossaryControl={key:P022GlossaryKey;sourceButtonId:number;sourceButtonInstanceId:string;
 sourceHitShapeId:number;sourceActionSha256:string;sourceButtonTagSha256:string;
 sourcePlacementTagSha256:string;depth:number;firstPlacementFrame:number;
 firstPartialHitFrame:number|null;firstFullHitFrame:number|null;sourceLabelTextId:number;
 sourceLabelTextInstanceId:string;sourceLabelRunText:string;sourceLabelSegment:string;
 firstCandidateFrame:number;availableSpans:Span[];originalClickObserved:boolean};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;frameCount:number;
 textDefinitions:Array<{sourceTextId:number;text:string;definitionTagSha256:string}>;
 textInstances:TextInstance[];reading:{proseInstanceIds:string[];stepInstanceIds:string[];canvasOnlyTextIds:number[]};
 glossaryControls:GlossaryControl[];orderedPair:{text:string;sourceInstanceIds:string[];sourceTextIds:number[];
 firstCompletePairFrame:number;completePairSpans:Span[];movingCopyInstanceIds:string[]};
 policy:{canvasGlyphs:string;nativeRole:string;language:string;proseReveal:string;glossary:string;
 steps:string;orderedPair:string;canvasOnlyRoles:string;originalRuntimeAccepted:boolean}};
function inSpans(spans:Span[],frame:number){return spans.some(([first,last])=>first<=frame&&frame<=last);}
export function p022TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P022_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P022_TEXT_FRAME_OUT_OF_RANGE');
 const source=P022_TEXT_STATE_SOURCE;
 const visibleText=source.textInstances.map(instance=>({...instance,
  fullyVisible:inSpans(instance.completeInkSpans,frame)})).filter(instance=>instance.fullyVisible);
 const byId=(id:string)=>visibleText.find(item=>item.instanceId===id);
 const prose=source.reading.proseInstanceIds.map(byId)
  .filter((item):item is NonNullable<typeof item>=>item!==undefined);
 const steps=source.reading.stepInstanceIds.map(id=>source.textInstances.find(item=>item.instanceId===id))
  .filter((item):item is NonNullable<typeof item>=>item!==undefined)
  .filter(item=>item.completeInkSpans[0]!==undefined&&item.completeInkSpans[0][0]<=frame);
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,visibleText,prose,steps,
  glossaryControls:source.glossaryControls.map(control=>({...control,
   available:inSpans(control.availableSpans,frame)})),
  orderedPair:{...source.orderedPair,available:inSpans(source.orderedPair.completePairSpans,frame)}};
}
`;
function main(){
 const mode=process.argv[2];assert(['--write','--check'].includes(mode),'use --write or --check');
 const source=sourceState();
 const generated=`/* Generated by scripts/build-alg-l06-p022-text-state-v1.mjs; do not edit. */\n${RUNTIME}\nexport const P022_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
 for(const [relative,body] of [[GENERATED,generated],[REPORT,stringify(source)]]){
  const target=path.join(ROOT,relative);
  if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
  else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift: ${relative}`);
 }
 console.log(JSON.stringify({mode,generated:GENERATED,report:REPORT,sourceSha256:SOURCE_SHA,
  textInstances:source.textInstances.length,glossary:source.glossaryControls.map(item=>
   [item.key,item.firstCandidateFrame]),prose:source.reading.proseInstanceIds,
  steps:source.reading.stepInstanceIds,orderedPair:source.orderedPair.firstCompletePairFrame}));
}
main();
