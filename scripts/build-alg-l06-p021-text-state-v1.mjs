#!/usr/bin/env node
/** Source-locked P021 semantic reading state; no generated output is hand-edited. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB14.swf';
const SOURCE_SHA='4e87aacf4c5f749f559817dc2c0ec8b023fba75652217b9ce2543728e06eb5eb';
const AUDIT='output/alg-l06-p021-source-audit-v1/time-resolved-audit-v1.json';
const AUDIT_SHA='e171781cdd59278fec34388b7ba8de6ed4594d6d73afb9d9a524a172c1a99c02';
const FRAMES='output/alg-l06-p021-source-audit-v1/frame-states-v1.json';
const FRAMES_SHA='b4f71c01e9744f7ba33a7efc0fded9ffd36557c1bde54df8f694be1f8dba9d23';
const GENERATED='packages/demos/src/generated/alg-l06-p021-text-state-v1.ts';
const REPORT='migrations/shared-alg001-l06-p021/audit/text-state-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>{const bytes=read(relative);return {path:relative,bytes:bytes.length,sha256:sha(bytes)};};
const stringify=value=>JSON.stringify(value,null,2)+'\n';
const expectedText=new Map([[6,'A set of function values is a set of ordered pairs of inputs and '],
 [13,'set'],[14,'function'],[15,'values'],[16,'ordered'],[17,'pairs'],[18,'inputs'],
 [21,'outputs for the functions.'],[23,'outputs'],[24,'4  6'],[25,'(      )'],[26,','],
 [28,'Input'],[29,'Output'],[30,'2'],[31,'3'],[32,'5'],[33,'-2'],[34,'1'],[35,'7'],
 [42,'(        )']]);
const expectedControls=[['Set',8,6,6,12],['Function',11,12,6,20],['Value',12,14,6,25],
 ['Ordered pair',10,10,6,62],['Input',9,8,6,69],['Output',22,20,21,77]];
const expectedTableRows=[
 [29,30,'2',32,31,'3'],[30,31,'3',33,32,'5'],
 [31,32,'5',34,33,'-2'],[36,35,'7',35,34,'1']];
const expectedOrderedPairs=[
 [37,25,41,30,'2',42,26,43,31,'3',346],
 [38,25,44,31,'3',45,26,46,32,'5',356],
 [39,42,47,32,'5',48,26,49,33,'-2',366],
 [40,25,50,35,'7',51,26,52,34,'1',376]];
const inSpan=(spans,frame)=>spans.some(([first,last])=>first<=frame&&frame<=last);
function spans(values){const result=[];for(let i=0;i<values.length;i++)if(values[i]){
 const first=i+1;while(i+1<values.length&&values[i+1])i++;result.push([first,i+1]);
}return result;}
const contains=(outer,inner)=>outer.left<=inner.left+0.5&&outer.right>=inner.right-0.5&&
 outer.top<=inner.top+0.5&&outer.bottom>=inner.bottom-0.5;
function sourceState(){
 const stat=fs.lstatSync(SOURCE);assert(stat.isFile()&&!stat.isSymbolicLink());
 assert.equal(fs.realpathSync(SOURCE),SOURCE);const swf=fs.readFileSync(SOURCE);
 assert.equal(swf.length,131483);assert.equal(sha(swf),SOURCE_SHA);
 const auditPin=pin(AUDIT),framePin=pin(FRAMES);
 assert.equal(auditPin.sha256,AUDIT_SHA);assert.equal(framePin.sha256,FRAMES_SHA);
 const audit=JSON.parse(read(AUDIT)),frameState=JSON.parse(read(FRAMES));
 assert.equal(audit.source.sha256,SOURCE_SHA);assert.equal(frameState.sourceSha256,SOURCE_SHA);
 assert.equal(audit.identity.mainDomain,'sprite-43');assert.equal(audit.identity.mainFrameCount,377);
 assert.equal(audit.textDefinitions.length,21);assert.equal(audit.buttons.length,6);
 assert.equal(frameState.frameDomain,'sprite-43');assert.equal(frameState.frameCount,377);
 assert.equal(frameState.frames.length,377);
 assert.deepEqual(audit.textDefinitions.map(item=>item.characterId),[...expectedText.keys()]);
 for(const definition of audit.textDefinitions)assert.equal(definition.text,
  expectedText.get(definition.characterId),`source text ${definition.characterId}`);
 const byFrame=frameState.frames.map((frame,index)=>{assert.equal(frame.frame,index+1);
  const rows=new Map(frame.items.map(item=>[item.instanceId,item]));
  assert.equal(rows.size,frame.items.length,'one row per source display-list instance');return rows;});
 const textInstances=audit.instances.filter(item=>item.role==='static-text').map(instance=>{
  const definition=audit.textDefinitions.find(d=>d.characterId===instance.characterId);assert(definition);
  const completeInkSpans=spans(byFrame.map(rows=>{
   const row=rows.get(instance.instanceId);if(row){assert.equal(row.characterId,instance.characterId);
    assert.equal(row.text,instance.text);assert.equal(row.depth,instance.depth);}
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
   sourcePlacementTagSha256:instance.sourcePlacementTagSha256};
 });
 const glossaryControls=audit.buttons.flatMap(button=>button.instances.map(instance=>{
  assert.equal(button.actualClickObserved,false);const label=instance.sourceLabelBinding;
  const availableSpans=spans(byFrame.map(rows=>{
   const hit=rows.get(instance.instanceId);if(!hit?.staticFullHit)return false;
   const text=rows.get(label.textInstanceId);
   if(text?.characterId!==label.textId)return false;
   return Boolean(text.runInk?.some(run=>{
    if(run.text!==label.runText||run.colorRgba.join(',')!=='0,0,204,255')return false;
    const ink=label.segment===run.text?{completeInkVisible:run.completeInkVisible,
     worldBoundsTwips:run.worldBoundsTwips}:run.segments[label.segment];
    return ink?.completeInkVisible&&contains(hit.worldBoundsTwips,ink.worldBoundsTwips); }));}));
  assert.deepEqual(availableSpans,instance.sourceReadyIntervals
   .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
  assert.equal(availableSpans[0]?.[0]??null,instance.firstSourceReadyFrame);
  return {key:button.keyAttribute,sourceButtonId:button.characterId,
   sourceButtonInstanceId:instance.instanceId,sourceHitShapeId:button.hitCharacterId,
   sourceActionSha256:button.actionSha256,sourceButtonTagSha256:button.sourceTagSha256,
   sourcePlacementTagSha256:instance.sourcePlacementTagSha256,
   depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
   firstPartialHitFrame:instance.firstStaticAnyHitFrame,firstFullHitFrame:instance.firstStaticFullHitFrame,
   sourceLabelTextId:label.textId,sourceLabelTextInstanceId:label.textInstanceId,
   sourceLabelRunText:label.runText,sourceLabelSegment:label.segment,
   firstCandidateFrame:instance.firstSourceReadyFrame,availableSpans,originalClickObserved:false};}));
 glossaryControls.sort((a,b)=>a.firstCandidateFrame-b.firstCandidateFrame);
 assert.deepEqual(glossaryControls.map(item=>[item.key,item.sourceButtonId,item.depth,
  item.sourceLabelTextId,item.firstCandidateFrame]),expectedControls);
 const find=(depth,id,value,generation=1)=>{
  const instance=textInstances.find(item=>item.instanceId===
   `sprite-43/depth-${depth}/generation-${generation}`);
  assert(instance,`source cell ${depth}/${generation}`);
  assert.equal(instance.sourceTextId,id);assert.equal(instance.text,value);return instance;};
 const pairSpans=parts=>spans(byFrame.map(rows=>parts.every(item=>rows.get(item.instanceId)
  ?.completeInkVisible===true)));
 const tableRows=expectedTableRows.map(([inDepth,inId,inText,outDepth,outId,outText])=>{
  const input=find(inDepth,inId,inText),output=find(outDepth,outId,outText);
  const completePairSpans=pairSpans([input,output]);assert.deepEqual(completePairSpans,[[204,377]]);
  const l=byFrame[203].get(input.instanceId).inkBoundsTwips;
  const r=byFrame[203].get(output.instanceId).inkBoundsTwips;
  assert(l.right<r.left&&Math.min(l.bottom,r.bottom)>Math.max(l.top,r.top),
   'source table row must be geometrically aligned and ordered');
  return {inputInstanceId:input.instanceId,inputSourceTextId:input.sourceTextId,inputText:inText,
   outputInstanceId:output.instanceId,outputSourceTextId:output.sourceTextId,outputText:outText,
   firstCompletePairFrame:204,completePairSpans};});
 const orderedPairs=expectedOrderedPairs.map(([parenDepth,parenId,inDepth,inId,inText,
  commaDepth,commaId,outDepth,outId,outText,firstFrame],index)=>{
 const paren=find(parenDepth,parenId,expectedText.get(parenId),
   parenDepth===37?12:parenDepth===38?5:parenDepth===39?5:3);
  const input=find(inDepth,inId,inText,inDepth===41?3:inDepth===44?3:inDepth===47?2:1);
  const comma=find(commaDepth,commaId,',',commaDepth===42?3:commaDepth===45?3:
   commaDepth===48?2:1);
  const output=find(outDepth,outId,outText,outDepth===43?3:outDepth===46?2:
   outDepth===49?2:1);
  const allInkSpans=pairSpans([paren,input,comma,output]);
  assert.deepEqual(allInkSpans,[[firstFrame-3,377]],
   'all source ink is present three frames before the moving output reaches the pair');
  const completePairSpans=spans(byFrame.map(rows=>{
   const parts=[paren,input,comma,output].map(item=>rows.get(item.instanceId));
   if(parts.some(item=>item?.completeInkVisible!==true))return false;
   const [p,i,c,o]=parts.map(item=>item.inkBoundsTwips);
   return i.right<c.left&&c.right<o.left&&p.left<i.left&&p.right>o.right&&
    Math.min(i.bottom,o.bottom)>Math.max(i.top,o.top);
  }));
  assert.deepEqual(completePairSpans,[[firstFrame,377]]);
  const rows=[paren,input,comma,output].map(item=>byFrame[firstFrame-1].get(item.instanceId));
  const [p,i,c,o]=rows.map(row=>row.inkBoundsTwips);
  assert(i.right<c.left&&c.right<o.left&&p.left<i.left&&p.right>o.right,
   `ordered pair ${index+1} source horizontal geometry`);
  assert(Math.min(i.bottom,o.bottom)>Math.max(i.top,o.top),
   `ordered pair ${index+1} source row geometry`);
  assert.equal(inText,tableRows[index].inputText);assert.equal(outText,tableRows[index].outputText);
  const initialOutputBounds=byFrame[firstFrame-4].get(output.instanceId).inkBoundsTwips;
  const readyOutputBounds=byFrame[firstFrame-1].get(output.instanceId).inkBoundsTwips;
  assert(initialOutputBounds.right<c.left&&readyOutputBounds.left>c.right,
   'output numeral moves from table column into ordered-pair slot');
  return {ordinal:index+1,sourceInstanceIds:[paren,input,comma,output].map(item=>item.instanceId),
   sourceTextIds:[paren,input,comma,output].map(item=>item.sourceTextId),
   inputText:inText,outputText:outText,firstAllInkFrame:firstFrame-3,
   firstCompletePairFrame:firstFrame,completePairSpans,
   sourceOutputBoundsAtFirstAllInk:initialOutputBounds,
   sourceOutputBoundsAtPairReady:readyOutputBounds};});
 const example=[find(23,24,'4  6',5),find(24,25,'(      )'),find(25,26,',')];
 const exampleSpans=pairSpans(example);assert.deepEqual(exampleSpans,[[178,195]]);
 return {schemaVersion:1,animationId:'shared-alg001-l06-p021',sourceSwfSha256:SOURCE_SHA,
  source:{path:SOURCE,bytes:swf.length,sha256:SOURCE_SHA},inputs:[auditPin,framePin],
  stage:{width:800,height:600},fps:12,rootEntryFrame:6,frameDomain:'sprite-43',frameCount:377,
  textDefinitions:audit.textDefinitions.map(item=>({sourceTextId:item.characterId,text:item.text,
   definitionTagSha256:item.definitionTagSha256})),textInstances,
  reading:{prose:[6,21],sourceHighlight:[13,14,15,16,17,18,23],
   sourceExample:[24,25,26],tableHeadings:[28,29],tableCells:[30,31,32,33,34,35,42]},
  glossaryControls,example:{sourceInstanceIds:example.map(item=>item.instanceId),
   inputText:'4',outputText:'6',firstCompletePairFrame:178,completePairSpans:exampleSpans},
  tableRows,orderedPairs,
  policy:{canvasGlyphs:'preserved',nativeRole:'source-timed-reflow-reading-companion',
   language:'source-en-fallback',proseReveal:'complete sentence ink before readable prose',
   glossary:'per-instance full hit containing own complete blue glyph segment',
   tablePairing:'source static cell geometry and complete ink of both cells',
   orderedPairs:'each punctuation and numeral source instance fully visible before semantic pair',
   canvasOnlyRoles:'transient magenta highlights and moving numeral copies remain in the preserved source Canvas; native pair waits for final source geometry',
   originalRuntimeAccepted:false}};
}
const RUNTIME=String.raw`
export type P021GlossaryKey='Set'|'Input'|'Ordered pair'|'Function'|'Value'|'Output';
type Span=[number,number];
type TextRun={text:string;colorRgba:number[];completeInkSpans:Span[]};
type TextInstance={instanceId:string;sourceTextId:number;text:string;depth:number;
 firstPlacementFrame:number;lastActiveFrame:number;completeInkSpans:Span[];
 runs:TextRun[];sourcePlacementTagSha256:string};
type GlossaryControl={key:P021GlossaryKey;sourceButtonId:number;sourceButtonInstanceId:string;
 sourceHitShapeId:number;sourceActionSha256:string;sourceButtonTagSha256:string;
 sourcePlacementTagSha256:string;depth:number;firstPlacementFrame:number;
 firstPartialHitFrame:number|null;firstFullHitFrame:number|null;sourceLabelTextId:number;
 sourceLabelTextInstanceId:string;sourceLabelRunText:string;sourceLabelSegment:string;
 firstCandidateFrame:number;availableSpans:Span[];originalClickObserved:boolean};
type Pair={inputText:string;outputText:string;firstCompletePairFrame:number;completePairSpans:Span[]};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;
 frameCount:number;textDefinitions:Array<{sourceTextId:number;text:string;definitionTagSha256:string}>;
 textInstances:TextInstance[];reading:{prose:number[];sourceHighlight:number[];sourceExample:number[];
 tableHeadings:number[];tableCells:number[]};glossaryControls:GlossaryControl[];
 example:Pair&{sourceInstanceIds:string[]};tableRows:Array<Pair&{inputInstanceId:string;
 inputSourceTextId:number;outputInstanceId:string;outputSourceTextId:number}>;
 orderedPairs:Array<Pair&{ordinal:number;sourceInstanceIds:string[];sourceTextIds:number[];
 firstAllInkFrame:number;sourceOutputBoundsAtFirstAllInk:{left:number;right:number;top:number;bottom:number};
 sourceOutputBoundsAtPairReady:{left:number;right:number;top:number;bottom:number}}>;
 policy:{canvasGlyphs:string;nativeRole:string;language:string;proseReveal:string;
 glossary:string;tablePairing:string;orderedPairs:string;canvasOnlyRoles:string;originalRuntimeAccepted:boolean}};
function inSpans(spans:Span[],frame:number){return spans.some(([first,last])=>frame>=first&&frame<=last);}
export function p021TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P021_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P021_TEXT_FRAME_OUT_OF_RANGE');
 const source=P021_TEXT_STATE_SOURCE;
 const visibleText=source.textInstances.map(instance=>({...instance,
  fullyVisible:inSpans(instance.completeInkSpans,frame)})).filter(instance=>instance.fullyVisible);
 const byId=(id:number)=>visibleText.find(item=>item.sourceTextId===id);
 const glossaryControls=source.glossaryControls.map(control=>({...control,
  available:inSpans(control.availableSpans,frame)}));
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,visibleText,
  prose:[byId(6),byId(21)].filter((item):item is NonNullable<typeof item>=>item!==undefined),
  glossaryControls,example:{...source.example,available:inSpans(source.example.completePairSpans,frame)},
  tableHeadings:[byId(28),byId(29)],
  tableRows:source.tableRows.map(row=>({...row,available:inSpans(row.completePairSpans,frame)})),
  orderedPairs:source.orderedPairs.map(pair=>({...pair,available:inSpans(pair.completePairSpans,frame)}))};
}
`;
function main(){
 const mode=process.argv[2];assert(['--write','--check'].includes(mode),'use --write or --check');
 const source=sourceState();
 const generated=`/* Generated by scripts/build-alg-l06-p021-text-state-v1.mjs; do not edit. */\n${RUNTIME}\nexport const P021_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
 const report=stringify(source);
 for(const [relative,body] of [[GENERATED,generated],[REPORT,report]]){
  const target=path.join(ROOT,relative);
  if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
  else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift: ${relative}`);
 }
 console.log(JSON.stringify({mode,generated:GENERATED,report:REPORT,
  sourceSha256:SOURCE_SHA,textInstances:source.textInstances.length,
  glossary:source.glossaryControls.map(({key,firstCandidateFrame,sourceLabelTextId})=>
   [key,firstCandidateFrame,sourceLabelTextId]),
  tableRows:source.tableRows.map(row=>[row.inputText,row.outputText,row.firstCompletePairFrame]),
  orderedPairs:source.orderedPairs.map(pair=>[pair.inputText,pair.outputText,pair.firstCompletePairFrame])}));
}
main();
