#!/usr/bin/env node
/** P023 source-locked native reading companion and glossary timeline producer. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SWF='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB16.swf';
const SWF_SHA='40388017c66f714bdbda480558669aee11a0d3426ed55c74f0976eb2ca85097a';
const AUDIT='output/alg-l06-p023-source-audit-v1/time-resolved-audit-v1.json';
const AUDIT_SHA='720ec2c812dc683546d41e0ddd8d49b69285246de9fb5a51fbb54cbb51f72acd';
const FRAMES='output/alg-l06-p023-source-audit-v1/frame-states-v1.json';
const FRAMES_SHA='5fdc10af323a894b27fb91fdf00b6207961fde4872dbd74009c4c270a49671fe';
const NATIVE='packages/demos/src/alg-l06-p023-native-text-v1.tsx';
const GENERATED='packages/demos/src/generated/alg-l06-p023-text-state-v1.ts';
const TIMELINE='packages/demos/src/alg-l06-p023-timeline-v1.ts';
const REPORT='output/alg-l06-p023-native-text-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>{const bytes=read(relative);return {path:relative,bytes:bytes.length,sha256:sha(bytes)};};
const stringify=value=>JSON.stringify(value,null,2)+'\n';
function spans(values){const result=[];for(let i=0;i<values.length;i++)if(values[i]){
 const first=i+1;while(i+1<values.length&&values[i+1])i++;result.push([first,i+1]);
}return result;}
const area=b=>Math.max(0,b.right-b.left)*Math.max(0,b.bottom-b.top);
const overlap=(a,b)=>area({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),
 top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)})/area(b);
function sourceState(){
 const stat=fs.lstatSync(SWF);assert(stat.isFile()&&!stat.isSymbolicLink());
 assert.equal(fs.realpathSync(SWF),SWF);
 const swf=fs.readFileSync(SWF);assert.equal(swf.length,137816);assert.equal(sha(swf),SWF_SHA);
 const catalog=collectSwfTextSourceCatalog(swf);
 assert.equal(catalog.summary.textDefinitions,21);assert.equal(catalog.summary.decodedRuns,29);
 assert.equal(catalog.summary.placementInstances,71);
 assert.equal(catalog.timelines.find(t=>t.timelineId==='sprite-38').instances.length,69);
 const auditPin=pin(AUDIT),framesPin=pin(FRAMES);
 assert.equal(auditPin.sha256,AUDIT_SHA);assert.equal(framesPin.sha256,FRAMES_SHA);
 const audit=JSON.parse(read(AUDIT)),frames=JSON.parse(read(FRAMES));
 assert.deepEqual(audit.source,{path:SWF,bytes:swf.length,sha256:SWF_SHA});
 assert.deepEqual([audit.identity.animationId,audit.identity.mainDomain,audit.identity.mainFrameCount,
  audit.identity.fps,audit.identity.rootEntryFrame],
  ['shared-alg001-l06-p023','sprite-38',410,12,6]);
 assert.equal(frames.frameDomain,'sprite-38');assert.equal(frames.frameCount,410);
 assert.equal(frames.frames.length,410);assert.equal(audit.textDefinitions.length,21);
 assert.equal(audit.buttons.length,4);assert.equal(audit.instances.length,60);
 const byFrame=frames.frames.map((frame,index)=>{assert.equal(frame.frame,index+1);
  const rows=new Map(frame.items.map(item=>[item.instanceId,item]));
  assert.equal(rows.size,frame.items.length);return rows;});
 const textInstances=audit.instances.filter(item=>item.role==='static-text').map(instance=>{
  const def=audit.textDefinitions.find(item=>item.characterId===instance.characterId);assert(def);
  const completeInkSpans=spans(byFrame.map(rows=>{
   const row=rows.get(instance.instanceId);
   if(row){assert.equal(row.characterId,instance.characterId);assert.equal(row.depth,instance.depth);}
   return row?.completeInkVisible===true;}));
  assert.deepEqual(completeInkSpans,instance.visibleIntervals.completeInk
   .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
  const runs=def.sourceInk.runs.map((run,index)=>{
   const completeRunSpans=spans(byFrame.map(rows=>rows.get(instance.instanceId)
    ?.runInk?.[index]?.completeInkVisible===true));
   assert.deepEqual(completeRunSpans,instance.visibleIntervals.runInk[index].intervals
    .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
   return {text:run.text,colorRgba:run.colorRgba,completeInkSpans:completeRunSpans};});
  return {instanceId:instance.instanceId,sourceTextId:instance.characterId,text:instance.text,
   depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
   lastActiveFrame:instance.lastActiveFrame,completeInkSpans,runs,
   sourcePlacementTagSha256:instance.sourcePlacementTagSha256};});
 assert.equal(textInstances.length,56);
 const controls=audit.buttons.flatMap(button=>button.instances.map(instance=>{
  const label=instance.sourceLabelBinding;
  const availableSpans=spans(byFrame.map(rows=>{
   const hit=rows.get(instance.instanceId);if(!hit?.staticFullHit)return false;
   const text=rows.get(label.textInstanceId);if(text?.characterId!==label.textId)return false;
   return Boolean(text.runInk?.some(run=>{
    if(run.text!==label.runText||run.colorRgba.join(',')!=='0,0,204,255')return false;
    const ink=label.segment===run.text?run:run.segments[label.segment];
    return ink?.completeInkVisible&&overlap(hit.worldBoundsTwips,ink.worldBoundsTwips)>=0.95;
   }));}));
  assert.deepEqual(availableSpans,instance.sourceReadyIntervals
   .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
  assert.equal(availableSpans[0]?.[0],instance.firstSourceReadyFrame);
  return {key:button.keyAttribute,sourceButtonId:button.characterId,
   sourceButtonInstanceId:instance.instanceId,sourceHitShapeId:button.hitCharacterId,
   sourceActionSha256:button.actionSha256,sourceButtonTagSha256:button.sourceTagSha256,
   sourcePlacementTagSha256:instance.sourcePlacementTagSha256,depth:instance.depth,
   firstPlacementFrame:instance.firstPlacementFrame,firstPartialHitFrame:instance.firstStaticAnyHitFrame,
   firstFullHitFrame:instance.firstStaticFullHitFrame,sourceLabelTextId:label.textId,
   sourceLabelTextInstanceId:label.textInstanceId,sourceLabelRunText:label.runText,
   sourceLabelSegment:label.segment,firstCandidateFrame:instance.firstSourceReadyFrame,
   availableSpans,originalClickObserved:false};}));
 controls.sort((a,b)=>a.firstCandidateFrame-b.firstCandidateFrame);
 assert.deepEqual(controls.map(item=>[item.key,item.sourceButtonId,item.firstCandidateFrame]),
  [['Domain',8,21],['Function',11,30],['Set',10,47],['Input',9,68]]);
 const get=id=>{const item=textInstances.find(x=>x.instanceId===id);assert(item,`text instance ${id}`);return item;};
 const teaching=audit.teachingGeometry;
 assert.equal(teaching.definition.firstCompleteInkFrame,68);
 assert.equal(teaching.table.firstCompleteGeometryFrame,173);
 assert.deepEqual([teaching.setNotation.firstAllTokensCompleteInkFrame,
  teaching.setNotation.firstSameLineNonoverlappingGeometricOrderFrame,
  teaching.setNotation.firstTerminalGeometryFrame],[394,401,409]);
 const definition=get(teaching.definition.instanceId);
 assert.equal(definition.sourceTextId,6);
 assert.deepEqual(definition.completeInkSpans,[[68,410]]);
 const headerIds=teaching.table.columnHeaders.map(x=>x.instanceId);
 const tableRows=teaching.table.rows.map(row=>({inputInstanceId:row.input.instanceId,
  outputInstanceId:row.output.instanceId}));
 assert.deepEqual(headerIds.map(id=>get(id).text),['Input','Output']);
 assert.deepEqual(tableRows.map(row=>[get(row.inputInstanceId).text,get(row.outputInstanceId).text]),
  [['1','1'],['10','2'],['100','3']]);
 const setIds=teaching.setNotation.readingOrder.map(x=>x.instanceId);
 assert.deepEqual(setIds.map(id=>get(id).text),['{','1',',','10',',','100','}']);
 const setAllInkSpans=spans(byFrame.map(rows=>setIds.every(id=>rows.get(id)?.completeInkVisible===true)));
 assert.equal(setAllInkSpans[0]?.[0],394);
 const ordered=rows=>rows.every((row,index)=>index===0||
  rows[index-1].inkBoundsTwips.right<row.inkBoundsTwips.left)&&
  Math.max(...rows.map(row=>row.inkBoundsTwips.top))<
   Math.min(...rows.map(row=>row.inkBoundsTwips.bottom));
 const setOrderedSpans=spans(byFrame.map(rows=>{
  const parts=setIds.map(id=>rows.get(id));return parts.every(x=>x?.completeInkVisible)&&ordered(parts);}));
 assert.deepEqual(setOrderedSpans,[[401,410]]);
 const source={schemaVersion:1,animationId:'shared-alg001-l06-p023',sourceSwfSha256:SWF_SHA,
  source:{path:SWF,bytes:swf.length,sha256:SWF_SHA},inputs:[auditPin,framesPin],
  stage:{width:800,height:600},fps:12,rootEntryFrame:6,frameDomain:'sprite-38',frameCount:410,
  inventory:{textDefinitions:21,textRuns:29,spritePlacementInstances:69,
   textInstances:56,glossaryButtonInstances:4},
  textDefinitions:audit.textDefinitions.map(item=>({sourceTextId:item.characterId,text:item.text,
   definitionTagSha256:item.definitionTagSha256})),textInstances,
  reading:{definitionInstanceId:definition.instanceId,tableHeaderInstanceIds:headerIds,
   tableRows,tableFirstCompleteFrame:173,setTokenInstanceIds:setIds,
   setAllInkSpans,setOrderedSpans,setFirstOrderedFrame:401,
   canvasOnlyRoles:'transient highlighted copies, moving table-to-set numbers, braces and commas before ordered notation'},
  glossaryControls:controls,
  policy:{canvasGlyphs:'preserved',nativeRole:'source-timed-reflow-reading-companion',
   language:'source-en-fallback',definition:'complete source sentence ink',
   table:'all source header and row instances fully inked with geometric row pairing',
   setNotation:'independent source instances; aggregate only after complete ink and geometric reading order',
   glossary:'per-instance full hit containing own complete blue glyph segment',
   originalRuntimeAccepted:false,translatedSpanishSourceAbsent:true}};
 return source;
}
const NATIVE_PREFIX=String.raw`/* Generated source state by scripts/prepare-alg-l06-p023-native-text-v1.mjs; do not edit. */
export type P023GlossaryKey='Domain'|'Function'|'Set'|'Input';
type Span=[number,number];
type TextInstance={instanceId:string;sourceTextId:number;text:string;depth:number;
 firstPlacementFrame:number;lastActiveFrame:number;completeInkSpans:Span[];
 runs:Array<{text:string;colorRgba:number[];completeInkSpans:Span[]}>;sourcePlacementTagSha256:string};
type GlossaryControl={key:P023GlossaryKey;sourceButtonId:number;sourceButtonInstanceId:string;
 sourceHitShapeId:number;sourceActionSha256:string;sourceButtonTagSha256:string;
 sourcePlacementTagSha256:string;depth:number;firstPlacementFrame:number;
 firstPartialHitFrame:number|null;firstFullHitFrame:number|null;sourceLabelTextId:number;
 sourceLabelTextInstanceId:string;sourceLabelRunText:string;sourceLabelSegment:string;
 firstCandidateFrame:number;availableSpans:Span[];originalClickObserved:boolean};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;frameCount:number;
 inventory:{textDefinitions:number;textRuns:number;spritePlacementInstances:number;textInstances:number;glossaryButtonInstances:number};
 textDefinitions:Array<{sourceTextId:number;text:string;definitionTagSha256:string}>;
 textInstances:TextInstance[];reading:{definitionInstanceId:string;tableHeaderInstanceIds:string[];
 tableRows:Array<{inputInstanceId:string;outputInstanceId:string}>;tableFirstCompleteFrame:number;
 setTokenInstanceIds:string[];setAllInkSpans:Span[];setOrderedSpans:Span[];setFirstOrderedFrame:number;
 canvasOnlyRoles:string};glossaryControls:GlossaryControl[];
 policy:{canvasGlyphs:string;nativeRole:string;language:string;definition:string;table:string;
 setNotation:string;glossary:string;originalRuntimeAccepted:boolean;translatedSpanishSourceAbsent:boolean}};
function inSpans(spans:Span[],frame:number){return spans.some(([first,last])=>first<=frame&&frame<=last);}
export function p023TextState(frame:number){
 if(!Number.isSafeInteger(frame)||frame<1||frame>P023_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P023_TEXT_FRAME_OUT_OF_RANGE');
 const source=P023_TEXT_STATE_SOURCE;
 const visibleText=source.textInstances.map(item=>({...item,
  fullyVisible:inSpans(item.completeInkSpans,frame)})).filter(item=>item.fullyVisible);
 const byId=(id:string)=>visibleText.find(item=>item.instanceId===id);
 const definition=byId(source.reading.definitionInstanceId);
 const definitionSource=source.textInstances.find(item=>item.instanceId===source.reading.definitionInstanceId)!;
 const definitionRuns=definitionSource.runs.map((run,index)=>({...run,index,
  available:inSpans(run.completeInkSpans,frame)}));
 const tableHeaders=source.reading.tableHeaderInstanceIds.map(byId);
 const tableRows=source.reading.tableRows.map(row=>({input:byId(row.inputInstanceId),
  output:byId(row.outputInstanceId)}));
 const tableAvailable=frame>=source.reading.tableFirstCompleteFrame&&
  tableHeaders.every(Boolean)&&tableRows.every(row=>row.input&&row.output);
 const setTokens=source.reading.setTokenInstanceIds.map(byId);
 const setNotation={tokens:setTokens,allInkVisible:inSpans(source.reading.setAllInkSpans,frame),
  available:inSpans(source.reading.setOrderedSpans,frame),
  firstOrderedFrame:source.reading.setFirstOrderedFrame};
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,visibleText,
  definition,definitionRuns,definitionSource,table:{available:tableAvailable,headers:tableHeaders,rows:tableRows},setNotation,
  glossaryControls:source.glossaryControls.map(control=>({...control,
   available:inSpans(control.availableSpans,frame)}))};
}
type TextItem=Pick<ReturnType<typeof p023TextState>['visibleText'][number],
 'sourceTextId'|'instanceId'|'runs'>;
const isBlue=(rgba:number[])=>rgba.join(',')==='0,0,204,255';
function SourceText({item}:{item:TextItem}){
 return <span data-source-text-id={'character-'+item.sourceTextId}
  data-source-text-instance-id={item.instanceId}>
  {item.runs.map((run,index)=><span key={item.instanceId+'/run-'+index}
   data-source-rgba={run.colorRgba.join(',')}
   style={isBlue(run.colorRgba)?{color:'#144fab',fontWeight:650}:undefined}>
   {run.text}</span>)}
 </span>;
}
export interface P023NativeTextV1Props {frame:number;language?:'en'|'es';
 onGlossary?:(key:P023GlossaryKey,trigger:HTMLButtonElement)=>void;}
/** Source-timed English reading companion; authored Canvas glyphs remain intact. */
export function P023NativeTextV1({frame,language='en',onGlossary}:P023NativeTextV1Props){
 const state=p023TextState(frame);
 const controls=state.glossaryControls.filter(item=>item.available);
 return <section lang="en" aria-label="Lesson text" data-p023-native-text="true"
  data-p023-text-frame={frame} data-p023-frame-domain={state.frameDomain}
  data-p023-source-sha256={P023_TEXT_STATE_SOURCE.sourceSwfSha256}
  data-p023-language-policy={language==='es'?'source-en-fallback':'source-en'}
  data-p023-canvas-suppression="none"
  style={{fontFamily:'var(--font-lesson-sans, Arial), sans-serif',fontSize:'1rem',lineHeight:1.5,
   color:'#15344c',minWidth:0,maxWidth:'100%',boxSizing:'border-box',padding:'1rem',
   background:'#fff',borderRadius:'0.75rem',overflowWrap:'anywhere'}}>
  {state.definitionRuns.some(run=>run.available)&&<p data-p023-section="definition"
   data-p023-definition-complete={Boolean(state.definition)} style={{margin:'0 0 0.75em'}}>
   <span data-source-text-id={'character-'+state.definitionSource.sourceTextId}
    data-source-text-instance-id={state.definitionSource.instanceId}>
    {state.definitionRuns.filter(run=>run.available).map(run=><span
     key={state.definitionSource.instanceId+'/run-'+run.index}
     data-source-rgba={run.colorRgba.join(',')}
     data-p023-run-first-complete-frame={run.completeInkSpans[0]?.[0]}
     style={isBlue(run.colorRgba)?{color:'#144fab',fontWeight:650}:undefined}>
     {run.text}</span>)}
   </span></p>}
  {state.table.available&&<table data-p023-section="source-table"
   data-p023-table-first-frame={P023_TEXT_STATE_SOURCE.reading.tableFirstCompleteFrame}
   style={{borderCollapse:'collapse',margin:'0 0 0.75em',fontVariantNumeric:'tabular-nums'}}>
   <thead><tr>{state.table.headers.map(item=><th key={item!.instanceId} scope="col"
    style={{padding:'0.25em 0.75em',textAlign:'center'}}><SourceText item={item!}/></th>)}</tr></thead>
   <tbody>{state.table.rows.map((row,index)=><tr key={index}>
    <td style={{padding:'0.2em 0.75em',textAlign:'center'}}><SourceText item={row.input!}/></td>
    <td style={{padding:'0.2em 0.75em',textAlign:'center'}}><SourceText item={row.output!}/></td>
   </tr>)}</tbody></table>}
  {state.setNotation.available&&<p data-p023-section="source-set-notation"
   data-p023-set-first-ordered-frame={state.setNotation.firstOrderedFrame}
   data-p023-source-instance-ids={state.setNotation.tokens.map(item=>item!.instanceId).join('|')}
   style={{margin:'0 0 0.75em',fontVariantNumeric:'tabular-nums'}}>
   {state.setNotation.tokens.map(item=><SourceText key={item!.instanceId} item={item!}/>)}
  </p>}
  {controls.length>0&&<div data-p023-section="glossary-controls"
   style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',minWidth:0}}>
   {controls.map(control=><button key={control.sourceButtonInstanceId} type="button"
    data-p023-glossary-key={control.key}
    data-p023-source-button-instance-id={control.sourceButtonInstanceId}
    data-p023-source-action-sha256={control.sourceActionSha256}
    data-p023-source-label-instance-id={control.sourceLabelTextInstanceId}
    data-p023-source-label-text-id={control.sourceLabelTextId}
    data-p023-source-label-segment={control.sourceLabelSegment}
    data-source-button-id={control.sourceButtonId}
    data-source-button-instance-id={control.sourceButtonInstanceId}
    data-source-action-sha256={control.sourceActionSha256}
    data-source-label-text-id={control.sourceLabelTextId}
    data-source-label-segment={control.sourceLabelSegment}
    data-source-button-visual-state="full-hit-and-own-blue-glyph"
    disabled={!onGlossary}
    onClick={event=>onGlossary?.(control.key,event.currentTarget)}
    aria-label={language==='es'?'Abrir glosario: '+control.key:'Open '+control.key+' glossary'}
    style={{border:'1px solid currentColor',borderRadius:'0.4em',background:'#edf6fc',
     color:'inherit',font:'inherit',padding:'0.45em 0.8em',cursor:'pointer',
     maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
    {control.key} {language==='es'?'glosario':'glossary'}</button>)}
  </div>}
 </section>;
}
`;
function timelineSource(source){
 const glossaryInstances=source.glossaryControls.map(control=>({key:control.key,
  buttonId:control.sourceButtonId,instanceId:control.sourceButtonInstanceId,
  sourceActionSha256:control.sourceActionSha256,
  sourcePlacementTagSha256:control.sourcePlacementTagSha256,
  label:{textId:control.sourceLabelTextId,runText:control.sourceLabelRunText,
   segment:control.sourceLabelSegment,textInstanceId:control.sourceLabelTextInstanceId},
  availableSpans:control.availableSpans}));
 const timeline={animationId:source.animationId,sourceSwfSha256:SWF_SHA,
  stage:source.stage,fps:source.fps,rootEntryFrame:source.rootEntryFrame,
  frameDomain:source.frameDomain,mainFrameCount:source.frameCount,
  sourceAuditSha256:AUDIT_SHA,glossaryInstances};
 return `/** Source-bound complete-label/full-hit gates; Flash click delivery unobserved.
 * Reproduce with scripts/prepare-alg-l06-p023-native-text-v1.mjs --check. */\n`+
  `export const P023_TIMELINE=${JSON.stringify(timeline,null,2)} as const;\n`+
  `export type P023TimelineGlossaryKey=typeof P023_TIMELINE.glossaryInstances[number]['key'];\n`+
  `export function p023TimelineState(frame:number){\n`+
  ` if(!Number.isSafeInteger(frame)||frame<1||frame>P023_TIMELINE.mainFrameCount)\n`+
  `  throw new RangeError('P023_FRAME_OUT_OF_RANGE');\n`+
  ` const glossaryInstances=P023_TIMELINE.glossaryInstances.map(instance=>({...instance,\n`+
  `  available:instance.availableSpans.some(([first,last])=>frame>=first&&frame<=last)}));\n`+
  ` const glossary=Object.fromEntries(P023_TIMELINE.glossaryInstances.map(instance=>[\n`+
  `  instance.key,glossaryInstances.some(candidate=>candidate.key===instance.key&&candidate.available)]));\n`+
  ` return {frame,frameDomain:P023_TIMELINE.frameDomain,\n`+
  `  elapsedSeconds:(frame-1)/P023_TIMELINE.fps,glossaryInstances,glossary};\n`+
  `}\n`;
}
function main(){
 const mode=process.argv[2];assert(['--write','--check'].includes(mode)&&process.argv.length===3,
  'use --write or --check');
 const source=sourceState();
 const marker='type TextItem=Pick<ReturnType<typeof p023TextState>';
 const split=NATIVE_PREFIX.indexOf(marker);assert(split>0);
 const generated=NATIVE_PREFIX.slice(0,split)+
  `\nexport const P023_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
 const native=`import React from 'react';\n`+
  `import {P023_TEXT_STATE_SOURCE,p023TextState,type P023GlossaryKey} from './generated/alg-l06-p023-text-state-v1';\n`+
  `export {P023_TEXT_STATE_SOURCE,p023TextState};\nexport type {P023GlossaryKey};\n`+
  NATIVE_PREFIX.slice(split);
 const outputs=[[GENERATED,generated],[NATIVE,native],[TIMELINE,timelineSource(source)],
  [REPORT,stringify(source)]];
 for(const [relative,body] of outputs){const target=path.join(ROOT,relative);
  if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
  else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift: ${relative}`);}
 console.log(JSON.stringify({mode,outputs:outputs.map(([file,body])=>({file,sha256:sha(body)})),
  sourceSwfSha256:SWF_SHA,textDefinitions:source.textDefinitions.length,
  textInstances:source.textInstances.length,glossary:source.glossaryControls.map(x=>[x.key,x.firstCandidateFrame]),
  definition:68,table:173,setAllInk:394,setOrdered:401}));
}
main();
