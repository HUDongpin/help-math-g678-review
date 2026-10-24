#!/usr/bin/env node
/** Generate P018's per-run semantic companion from the frozen physical SWF audit. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB11.swf';
const SOURCE_SHA='400f0cdcb574864c7e9e2208f986e91f26e10f796623b6ea41d80a59310e167a';
const AUDIT='output/alg-l06-p018-source-audit-v1/time-resolved-audit-v2.json';
const AUDIT_SHA='6a8e289b3f4ce2c635cff61ae8b950596272d6ff835c3fae0ec6a8f1dfd66e79';
const FRAMES='output/alg-l06-p018-source-audit-v1/frame-states-v2.json';
const FRAMES_SHA='b03f44b01075da419444ba8e11b27ee2bff2352369d7d5da3b599b1fdeadf9b0';
const GENERATED='packages/demos/src/generated/alg-l06-p018-text-state-v1.ts';
const REPORT='migrations/shared-alg001-l06-p018/audit/text-state-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>{const bytes=read(relative);return {path:relative,bytes:bytes.length,sha256:sha(bytes)};};
const serialized=value=>JSON.stringify(value,null,2)+'\n';
const roles={prose:[6,19,27,28],equation:[22,29,30],sourceHighlight:[12,13,14,15,16,21,23,24,25,31]};
const expectedText=new Map([[6,'To evaluate a function, first substitute a number for the input variable. '],
  [12,'evaluate'],[13,'function'],[14,'substitute'],[15,'input '],[16,' variable'],
  [19,'Then evaluate the result.'],[21,'result'],[22,'D = 55T'],[23,'D'],[24,'T'],
  [25,'55'],[27,'Evaluate the function at T = 3 hours to determine how far a driver '],
  [28,'would go in 3 hours.'],[29,'D = 55(3)'],[30,'D = 165'],[31,'165']]);
const expectedControls=[['Evaluate',8,4,6,11],['Evaluate',8,22,27,324],
  ['Input variable',9,6,6,65],['Substitute',10,8,6,43],
  ['Function',11,10,6,18],['Function',11,24,27,333],['Result',20,16,19,102]];
function spans(values){
  const out=[];
  for(let i=0;i<values.length;i++)if(values[i]){
    const from=i+1;
    while(i+1<values.length&&values[i+1])i++;
    out.push([from,i+1]);
  }
  return out;
}
const contains=(outer,inner)=>outer.left<=inner.left+0.5&&outer.right>=inner.right-0.5&&
  outer.top<=inner.top+0.5&&outer.bottom>=inner.bottom-0.5;
function sourceState(){
  const stat=fs.lstatSync(SOURCE);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'physical source SWF required');
  assert.equal(fs.realpathSync(SOURCE),SOURCE);
  const swf=fs.readFileSync(SOURCE);
  assert.equal(swf.length,223574);assert.equal(sha(swf),SOURCE_SHA);
  const auditPin=pin(AUDIT),framePin=pin(FRAMES);
  assert.equal(auditPin.sha256,AUDIT_SHA);assert.equal(framePin.sha256,FRAMES_SHA);
  const audit=JSON.parse(read(AUDIT)),frames=JSON.parse(read(FRAMES));
  assert.equal(audit.source.sha256,SOURCE_SHA);assert.equal(frames.sourceSha256,SOURCE_SHA);
  assert.equal(audit.identity.mainDomain,'sprite-32');assert.equal(audit.identity.mainFrameCount,648);
  assert.equal(audit.textDefinitions.length,17);assert.equal(audit.buttons.length,5);
  assert.equal(frames.frameDomain,'sprite-32');assert.equal(frames.frameCount,648);
  assert.equal(frames.frames.length,648);
  assert.deepEqual(audit.textDefinitions.map(d=>d.characterId),[...expectedText.keys()]);
  for(const def of audit.textDefinitions)assert.equal(def.text,expectedText.get(def.characterId),`text ${def.characterId}`);
  assert.deepEqual(new Set(Object.values(roles).flat()),new Set(expectedText.keys()),
    'classify each exact text definition once');
  const perFrame=frames.frames.map((row,index)=>{
    assert.equal(row.frame,index+1);
    const byInstance=new Map(row.items.map(item=>[item.instanceId,item]));
    assert.equal(byInstance.size,row.items.length,'unique source instance per frame');
    return byInstance;
  });
  const sourceInstances=audit.instances.filter(instance=>instance.role==='static-text');
  assert.equal(sourceInstances.length,38);
  const textInstances=sourceInstances.map(instance=>{
    const definition=audit.textDefinitions.find(text=>text.characterId===instance.characterId);
    assert(definition);
    const completeInkSpans=spans(perFrame.map(row=>{
      const item=row.get(instance.instanceId);
      if(item){assert.equal(item.characterId,instance.characterId);
        assert.equal(item.text,instance.text);assert.equal(item.depth,instance.depth);}
      return item?.completeInkVisible===true;
    }));
    assert.deepEqual(completeInkSpans,instance.visibleIntervals.completeInk
      .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
    assert.equal(completeInkSpans[0]?.[0]??null,instance.firstCompleteInkFrame);
    const runs=definition.sourceInk.runs.map((run,index)=>{
      const runSpans=spans(perFrame.map(row=>row.get(instance.instanceId)?.runInk?.[index]?.completeInkVisible===true));
      assert.deepEqual(runSpans,instance.visibleIntervals.runInk[index].intervals
        .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
      assert.equal(runSpans[0]?.[0]??null,instance.firstCompleteInkRunFrames[index].frame);
      return {text:run.text,colorRgba:run.colorRgba,completeInkSpans:runSpans};
    });
    assert.equal(runs.map(run=>run.text).join(''),instance.text);
    return {instanceId:instance.instanceId,sourceTextId:instance.characterId,text:instance.text,
      depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
      lastActiveFrame:instance.lastActiveFrame,completeInkSpans,runs,
      sourcePlacementTagSha256:instance.sourcePlacementTagSha256};
  });
  const glossaryControls=audit.buttons.flatMap(button=>button.instances.map(instance=>{
    assert.equal(button.actualClickObserved,false);
    const label=instance.sourceLabelBinding;
    const availableSpans=spans(frames.frames.map(frame=>{
      const hit=frame.items.find(item=>item.instanceId===instance.instanceId);
      if(!hit?.staticFullHit)return false;
      const text=frame.items.find(item=>item.instanceId===label.textInstanceId&&
        item.characterId===label.textId);
      return Boolean(text?.runInk?.some(run=>run.text===label.runText&&
        JSON.stringify(run.colorRgba)===JSON.stringify([0,0,204,255])&&
        run.completeInkVisible&&contains(hit.worldBoundsTwips,run.worldBoundsTwips)));
    }));
    assert.deepEqual(availableSpans,instance.sourceReadyIntervals
      .map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
    assert.equal(availableSpans[0]?.[0]??null,instance.firstSourceReadyFrame);
    return {key:button.keyAttribute,sourceButtonId:button.characterId,
      sourceButtonInstanceId:instance.instanceId,sourceHitShapeId:button.hitCharacterId,
      sourceActionSha256:button.actionSha256,sourceButtonTagSha256:button.sourceTagSha256,
      sourcePlacementTagSha256:instance.sourcePlacementTagSha256,
      depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
      firstPartialHitFrame:instance.firstStaticAnyHitFrame,
      firstFullHitFrame:instance.firstStaticFullHitFrame,
      sourceLabelTextId:label.textId,sourceLabelTextInstanceId:label.textInstanceId,
      sourceLabelRunText:label.runText,firstCandidateFrame:instance.firstSourceReadyFrame,
      availableSpans,originalClickObserved:false};
  }));
  assert.deepEqual(glossaryControls.map(control=>[control.key,control.sourceButtonId,
    control.depth,control.sourceLabelTextId,control.firstCandidateFrame]),expectedControls);
  glossaryControls.sort((a,b)=>a.firstCandidateFrame-b.firstCandidateFrame);
  return {schemaVersion:1,animationId:'shared-alg001-l06-p018',sourceSwfSha256:SOURCE_SHA,
    source:{path:SOURCE,bytes:swf.length,sha256:SOURCE_SHA},inputs:[auditPin,framePin],
    stage:{width:800,height:600},fps:12,rootEntryFrame:6,frameDomain:'sprite-32',frameCount:648,
    textDefinitions:audit.textDefinitions.map(text=>({sourceTextId:text.characterId,text:text.text,
      definitionTagSha256:text.definitionTagSha256})),textInstances,
    reading:roles,glossaryControls,
    policy:{canvasGlyphs:'preserved',nativeRole:'reflow-reading-companion',
      language:'source-en-fallback',textReveal:'complete embedded-font run ink in source alpha and masks',
      glossary:'per-instance full hit containing complete blue glyph is a static candidate gate',
      sourceHighlight:'transient source instances remain separate, including magenta 165',
      originalRuntimeAccepted:false}};
}
const RUNTIME=String.raw`
export type P018GlossaryKey='Evaluate'|'Input variable'|'Substitute'|'Function'|'Result';
type Span=[number,number];
type TextRun={text:string;colorRgba:number[];completeInkSpans:Span[]};
type TextInstance={instanceId:string;sourceTextId:number;text:string;depth:number;
 firstPlacementFrame:number;lastActiveFrame:number;completeInkSpans:Span[];
 runs:TextRun[];sourcePlacementTagSha256:string};
type GlossaryControl={key:P018GlossaryKey;sourceButtonId:number;sourceButtonInstanceId:string;
 sourceHitShapeId:number;sourceActionSha256:string;sourceButtonTagSha256:string;
 sourcePlacementTagSha256:string;depth:number;firstPlacementFrame:number;
 firstPartialHitFrame:number|null;firstFullHitFrame:number|null;sourceLabelTextId:number;
 sourceLabelTextInstanceId:string;sourceLabelRunText:string;firstCandidateFrame:number;
 availableSpans:Span[];originalClickObserved:boolean};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;
 frameCount:number;textDefinitions:Array<{sourceTextId:number;text:string;definitionTagSha256:string}>;
 textInstances:TextInstance[];reading:{prose:number[];equation:number[];sourceHighlight:number[]};
 glossaryControls:GlossaryControl[];policy:{canvasGlyphs:string;nativeRole:string;language:string;
 textReveal:string;glossary:string;sourceHighlight:string;originalRuntimeAccepted:boolean}};
function inSpans(spans:Span[],frame:number){return spans.some(([from,to])=>frame>=from&&frame<=to);}
export function p018TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P018_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P018_TEXT_FRAME_OUT_OF_RANGE');
 const source=P018_TEXT_STATE_SOURCE;
 const visibleText=source.textInstances.map(instance=>{
  const visibleRuns=instance.runs.filter(run=>inSpans(run.completeInkSpans,frame));
  return {...instance,visibleRuns,visibleText:visibleRuns.map(run=>run.text).join(''),
   fullyVisible:inSpans(instance.completeInkSpans,frame)};
 }).filter(instance=>instance.visibleRuns.length>0);
 const select=(ids:number[])=>visibleText.filter(instance=>ids.includes(instance.sourceTextId));
 const glossaryControls=source.glossaryControls.map(control=>({...control,
  available:inSpans(control.availableSpans,frame)}));
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,
  visibleText,prose:select(source.reading.prose),equation:select(source.reading.equation),
  sourceHighlight:select(source.reading.sourceHighlight),glossaryControls};
}
`;
function main(){
  const mode=process.argv[2];assert(['--write','--check'].includes(mode),'use --write or --check');
  const source=sourceState();
  const generated=`/* Generated by scripts/build-alg-l06-p018-text-state-v1.mjs; do not edit. */\n${RUNTIME}\nexport const P018_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
  const report=serialized(source);
  for(const [relative,body] of [[GENERATED,generated],[REPORT,report]]){
    const target=path.join(ROOT,relative);
    if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
    else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift: ${relative}`);
  }
  console.log(JSON.stringify({mode,generated:GENERATED,report:REPORT,
    sourceSha256:SOURCE_SHA,textInstances:source.textInstances.length,
    glossary:source.glossaryControls.map(({key,firstCandidateFrame,sourceLabelTextId})=>
      [key,firstCandidateFrame,sourceLabelTextId])}));
}
main();
