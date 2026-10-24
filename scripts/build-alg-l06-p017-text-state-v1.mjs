#!/usr/bin/env node
/** Source-bound, per-instance reflow text state for ALG001 L6 P017. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB10.swf';
const SOURCE_SHA='7010ecfee54a80298e3bba09400a712cfed65dad983811d9a470bf017156ffb3';
const AUDIT='output/alg-l06-p017-source-audit-v1/time-resolved-audit-v1.json';
const AUDIT_SHA='7977e0be92a77b01b6bae6afffa5746499edf446a6237026d28eb1e18a3e8c3f';
const FRAMES='output/alg-l06-p017-source-audit-v1/frame-states-v1.json';
const FRAMES_SHA='2ac04d2e9c5ff9569d14eaa8f80878a658c432a94e97ed518b655b07621d66bc';
const GENERATED='packages/demos/src/generated/alg-l06-p017-text-state-v1.ts';
const REPORT='migrations/shared-alg001-l06-p017/audit/text-state-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>{const bytes=read(relative);return {path:relative,bytes:bytes.length,sha256:sha(bytes)};};
const serialized=value=>JSON.stringify(value,null,2)+'\n';
const ids={prose:[5,15,18,22],equation:[25],sourceHighlight:[10,11,12,17,20,21,24],
  unresolvedLateFragments:[27,29,31,33,36,38,39,40]};
const expectedText=new Map([[5,'An equation of a function is a mathematical sentence that shows the '],
  [10,'equation'],[11,'function'],[12,'sentence'],[15,'rule for the function.'],[17,'rule'],
  [18,'The output variable is usually by itself on the left.'],[20,'output'],[21,'variable'],
  [22,'The rule for the input variable is usually on the right.'],[24,'input'],[25,'y = 5x – 8'],
  [27,'x'],[29,'input variable'],[31,'y'],[33,'output variable'],[36,'5'],[38,'_'],
  [39,'8'],[40,'y']]);
const keyByButton=new Map([[7,'Equation'],[8,'Sentence'],[9,'Function'],[16,'Rule'],
  [19,'Output variable'],[23,'Input variable']]);
const readyByButton=new Map([[7,11],[8,54],[9,20],[16,68],[19,108],[23,173]]);
function spans(values){
  const out=[];
  for(let i=0;i<values.length;i++)if(values[i]){
    const from=i+1;
    while(i+1<values.length&&values[i+1])i++;
    out.push([from,i+1]);
  }
  return out;
}
function sourceState(){
  const stat=fs.lstatSync(SOURCE);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'physical source SWF required');
  assert.equal(fs.realpathSync(SOURCE),SOURCE);
  const swf=fs.readFileSync(SOURCE);
  assert.equal(swf.length,245604);assert.equal(sha(swf),SOURCE_SHA);
  const auditPin=pin(AUDIT),framePin=pin(FRAMES);
  assert.equal(auditPin.sha256,AUDIT_SHA);assert.equal(framePin.sha256,FRAMES_SHA);
  const audit=JSON.parse(read(AUDIT)),frames=JSON.parse(read(FRAMES));
  assert.equal(audit.source.sha256,SOURCE_SHA);assert.equal(frames.sourceSha256,SOURCE_SHA);
  assert.equal(audit.identity.mainDomain,'sprite-42');assert.equal(audit.identity.mainFrameCount,721);
  assert.equal(audit.textDefinitions.length,20);assert.equal(audit.buttons.length,6);
  assert.equal(frames.frameDomain,'sprite-42');assert.equal(frames.frameCount,721);
  assert.equal(frames.frames.length,721);
  assert.deepEqual(audit.textDefinitions.map(d=>d.characterId),[...expectedText.keys()]);
  for(const def of audit.textDefinitions)assert.equal(def.text,expectedText.get(def.characterId),`text ${def.characterId}`);
  const perFrame=frames.frames.map((row,index)=>{
    assert.equal(row.frame,index+1);
    const byInstance=new Map(row.items.map(item=>[item.instanceId,item]));
    assert.equal(byInstance.size,row.items.length,'unique source instance per frame');
    return byInstance;
  });
  const sourceInstances=audit.instances.filter(i=>i.role==='static-text');
  assert.equal(sourceInstances.length,44);
  const textInstances=sourceInstances.map(instance=>{
    const completeInkSpans=spans(perFrame.map(row=>{
      const item=row.get(instance.instanceId);
      if(item){assert.equal(item.characterId,instance.characterId);
        assert.equal(item.text,instance.text);assert.equal(item.depth,instance.depth);}
      return item?.completeInkVisible===true;
    }));
    assert.deepEqual(completeInkSpans,instance.visibleIntervals.completeInk.map(({firstFrame,lastFrame})=>[firstFrame,lastFrame]));
    assert.equal(completeInkSpans[0]?.[0]??null,instance.firstCompleteInkFrame);
    assert(completeInkSpans.every(([a,b])=>a>=instance.firstPlacementFrame&&b<=instance.lastActiveFrame));
    return {instanceId:instance.instanceId,sourceTextId:instance.characterId,text:instance.text,
      depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
      lastActiveFrame:instance.lastActiveFrame,completeInkSpans,
      sourcePlacementTagSha256:instance.sourcePlacementTagSha256};
  });
  const glossaryControls=audit.buttons.map(button=>{
    const id=button.characterId,key=keyByButton.get(id);
    assert.equal(button.keyAttribute,key);assert.equal(button.firstStaticFullHitFrame,readyByButton.get(id));
    assert.equal(button.blueSourceLabel.sourceReadyFrame,readyByButton.get(id));
    assert.equal(button.actualClickObserved,false);
    const label=button.blueSourceLabel;
    const availableSpans=spans(frames.frames.map(row=>{
      const hit=row.items.find(item=>item.characterId===id&&item.staticFullHit===true);
      const blue=row.items.find(item=>item.characterId===label.textCharacterId&&
        item.runInk?.some(run=>run.text===label.runText&&run.completeInkVisible===true));
      return Boolean(hit&&blue);
    }));
    assert.deepEqual(availableSpans,[[readyByButton.get(id),721]],`source-ready span ${key}`);
    return {key,sourceButtonId:id,sourceHitShapeId:6,sourceActionSha256:button.actionSha256,
      sourceButtonTagSha256:button.sourceTagSha256,
      firstPlacementFrame:button.firstPlacementFrame,firstPartialHitFrame:button.firstStaticAnyHitFrame,
      firstFullHitFrame:button.firstStaticFullHitFrame,
      blueLabelTextId:label.textCharacterId,blueLabelRunText:label.runText,
      firstCompleteBlueGlyphFrame:label.firstCompleteInkFrame,
      firstCandidateFrame:label.sourceReadyFrame,availableSpans,originalClickObserved:false};
  }).sort((a,b)=>a.firstCandidateFrame-b.firstCandidateFrame);
  const allIds=Object.values(ids).flat();
  assert.deepEqual(new Set(allIds),new Set(expectedText.keys()),'every exact text definition classified once');
  return {schemaVersion:1,animationId:'shared-alg001-l06-p017',sourceSwfSha256:SOURCE_SHA,
    source:{path:SOURCE,bytes:swf.length,sha256:SOURCE_SHA},inputs:[auditPin,framePin],
    stage:{width:800,height:600},fps:12,rootEntryFrame:6,frameDomain:'sprite-42',frameCount:721,
    textDefinitions:audit.textDefinitions.map(d=>({sourceTextId:d.characterId,text:d.text,
      definitionTagSha256:d.definitionTagSha256})),textInstances,
    reading:ids,glossaryControls,
    policy:{canvasGlyphs:'preserved',nativeRole:'reflow-reading-companion',
      language:'source-en-fallback',lateFragments:'retain as separate timed source instances; no composed narrative or rewritten equation',
      glossary:'full source hit and complete blue source glyph are static candidate gates, not original-click proof',
      originalRuntimeAccepted:false}};
}
const RUNTIME=String.raw`
export type P017GlossaryKey='Equation'|'Sentence'|'Function'|'Rule'|'Output variable'|'Input variable';
type Span=[number,number];
type TextInstance={instanceId:string;sourceTextId:number;text:string;depth:number;
 firstPlacementFrame:number;lastActiveFrame:number;completeInkSpans:Span[];
 sourcePlacementTagSha256:string};
type GlossaryControl={key:P017GlossaryKey;sourceButtonId:number;sourceHitShapeId:number;
 sourceActionSha256:string;sourceButtonTagSha256:string;firstPlacementFrame:number;
 firstPartialHitFrame:number;firstFullHitFrame:number;blueLabelTextId:number;
 blueLabelRunText:string;firstCompleteBlueGlyphFrame:number;firstCandidateFrame:number;
 availableSpans:Span[];originalClickObserved:boolean};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;
 frameCount:number;textDefinitions:Array<{sourceTextId:number;text:string;definitionTagSha256:string}>;
 textInstances:TextInstance[];reading:{prose:number[];equation:number[];
 sourceHighlight:number[];unresolvedLateFragments:number[]};glossaryControls:GlossaryControl[];
 policy:{canvasGlyphs:string;nativeRole:string;language:string;lateFragments:string;
 glossary:string;originalRuntimeAccepted:boolean}};
function inSpans(spans:Span[],frame:number){return spans.some(([from,to])=>frame>=from&&frame<=to);}
export function p017TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P017_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P017_TEXT_FRAME_OUT_OF_RANGE');
 const source=P017_TEXT_STATE_SOURCE;
 const completeInk=source.textInstances.filter(instance=>inSpans(instance.completeInkSpans,frame));
 const select=(ids:number[])=>completeInk.filter(instance=>ids.includes(instance.sourceTextId));
 const glossaryControls=source.glossaryControls.map(control=>({...control,
  available:inSpans(control.availableSpans,frame)}));
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,
  completeInk,prose:select(source.reading.prose),equation:select(source.reading.equation),
  sourceHighlight:select(source.reading.sourceHighlight),
  unresolvedLateFragments:select(source.reading.unresolvedLateFragments),glossaryControls};
}
`;
function main(){
  const mode=process.argv[2];assert(['--write','--check'].includes(mode),'use --write or --check');
  const source=sourceState();
  const generated=`/* Generated by scripts/build-alg-l06-p017-text-state-v1.mjs; do not edit. */\n${RUNTIME}\nexport const P017_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
  const report=serialized(source);
  for(const [relative,body] of [[GENERATED,generated],[REPORT,report]]){
    const target=path.join(ROOT,relative);
    if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
    else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift: ${relative}`);
  }
  console.log(JSON.stringify({mode,generated:GENERATED,report:REPORT,
    sourceSha256:SOURCE_SHA,textInstances:source.textInstances.length,
    glossary:source.glossaryControls.map(({key,firstCandidateFrame})=>[key,firstCandidateFrame])}));
}
main();
