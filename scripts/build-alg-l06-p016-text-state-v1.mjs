#!/usr/bin/env node
/** Reproducible, source-bound reading companion for ALG001 L6 P016. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB09.swf';
const SOURCE_SHA='2fdeba5b4dcfcfe7d1b575ab30d76a98fca802d6be670a679a54378f32aa4ae9';
const AUDIT='output/alg-l06-p016-source-audit-v1/time-resolved-audit-v1.json';
const AUDIT_SHA='5a17bae3c4c1a29072a9dbaa048ac34c24bea65cda4e763d02f6e0355c8328d9';
const FRAMES='output/alg-l06-p016-source-audit-v1/frame-states-v1.json';
const FRAMES_SHA='29d2e56ed68510e460dc99a361df0a6386ba84b5654d4edce9a9935d9259679b';
const GENERATED='packages/demos/src/generated/alg-l06-p016-text-state-v1.ts';
const REPORT='migrations/shared-alg001-l06-p016/audit/text-state-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>{const bytes=read(relative);return {path:relative,bytes:bytes.length,sha256:sha(bytes)};};
const serialized=value=>JSON.stringify(value,null,2)+'\n';

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
  assert.equal(swf.length,413745);
  assert.equal(sha(swf),SOURCE_SHA);
  const auditPin=pin(AUDIT),framePin=pin(FRAMES);
  assert.equal(auditPin.sha256,AUDIT_SHA);
  assert.equal(framePin.sha256,FRAMES_SHA);
  const audit=JSON.parse(read(AUDIT)),frames=JSON.parse(read(FRAMES));
  assert.equal(audit.source.sha256,SOURCE_SHA);
  assert.equal(frames.sourceSha256,SOURCE_SHA);
  assert.equal(audit.textDefinitions.length,19);
  assert.equal(frames.frameDomain,'sprite-139');
  assert.equal(frames.frameCount,815);
  assert.equal(frames.frames.length,815);
  assert.equal(audit.button.characterId,10);
  assert.equal(audit.button.actionSha256,'549555e0e21a60e887e614e7ff3b03592d8a7f577c5ec25e6601f039050f49c8');
  assert.equal(audit.button.firstPlacementFrame,72);
  assert.equal(audit.button.firstStaticAnyHitFrame,72);
  assert.equal(audit.button.firstStaticFullHitFrame,null);
  assert.equal(audit.button.actualClickObserved,false);
  const expected=new Map([[4,'A function '],[6,'function'],[8,'A function '],
    [11,'explains what happens when one thing makes another '],[12,'thing happen.'],
    [120,'Inputs'],[122,'2 bananas and 1 '],[123,'pint of ice cream'],
    [124,'Output'],[125,'1 banana split'],
    [127,'1 banana split = 2 bananas + 1 pint ice cream'],
    [128,'2 bananas '],[130,'2 bananas '],[131,'pint of ice cream'],
    [132,'1'],[134,'1 pint ice cream'],[135,'1 banana '],[136,'split'],
    [138,'1 banana split ']]);
  assert.deepEqual(audit.textDefinitions.map(d=>d.characterId),[...expected.keys()]);
  for(const def of audit.textDefinitions)assert.equal(def.text,expected.get(def.characterId),`text ${def.characterId}`);
  const byFrame=new Map();
  for(const row of frames.frames){
    assert.equal(row.frame,byFrame.size+1);
    byFrame.set(row.frame,new Map(row.items.map(item=>[item.instanceId,item])));
  }
  const staticInstances=audit.instances.filter(i=>i.role==='static-text');
  const textInstances=staticInstances.map(instance=>{
    const observed=[];
    for(let frame=1;frame<=815;frame++){
      const item=byFrame.get(frame).get(instance.instanceId);
      if(item){
        assert.equal(item.characterId,instance.characterId);
        assert.equal(item.text,instance.text);
        assert.equal(item.depth,instance.depth);
      }
      observed.push(item?.completeInkVisible===true);
    }
    const completeInkSpans=spans(observed);
    assert.equal(completeInkSpans[0]?.[0]??null,instance.firstCompleteInkFrame,
      `first complete ink ${instance.instanceId}`);
    assert(completeInkSpans.every(([a,b])=>a>=instance.firstPlacementFrame&&b<=instance.lastActiveFrame));
    return {instanceId:instance.instanceId,sourceTextId:instance.characterId,
      text:instance.text,depth:instance.depth,firstPlacementFrame:instance.firstPlacementFrame,
      lastActiveFrame:instance.lastActiveFrame,completeInkSpans,
      sourcePlacementTagSha256:instance.sourcePlacementTagSha256};
  });
  assert.equal(textInstances.length,staticInstances.length);
  const first=(id)=>Math.min(...textInstances.filter(i=>i.sourceTextId===id)
    .flatMap(i=>i.completeInkSpans.map(span=>span[0])));
  assert.deepEqual([4,6,8,11,12,120,122,123,124,125,127]
    .map(id=>first(id)),[41,62,72,114,121,372,411,421,439,472,614]);
  assert.equal(textInstances.find(i=>i.sourceTextId===4).lastActiveFrame,71);
  assert(textInstances.filter(i=>i.sourceTextId===6).every(i=>i.lastActiveFrame===i.firstPlacementFrame));
  for(const frame of [72,815]){
    const button=frames.frames[frame-1].items.find(i=>i.characterId===10);
    const lead=frames.frames[frame-1].items.find(i=>i.characterId===8);
    assert(button?.hitAreaRatio>0.98&&button?.hitAreaRatio<1);
    assert.equal(button.staticFullHit,false);
    assert.equal(lead.completeInkVisible,true);
    assert.equal(lead.runInk.find(r=>r.text==='function')?.completeInkVisible,true);
  }
  const buttonAvailableSpans=spans(frames.frames.map(row=>{
    const button=row.items.find(item=>item.characterId===10&&item.role==='function-hit');
    const lead=row.items.find(item=>item.characterId===8&&item.role==='static-text');
    return button?.hitAreaRatio>0&&lead?.completeInkVisible===true;
  }));
  assert.deepEqual(buttonAvailableSpans,[[72,815]]);
  return {schemaVersion:1,animationId:'shared-alg001-l06-p016',sourceSwfSha256:SOURCE_SHA,
    source:{path:SOURCE,bytes:swf.length,sha256:SOURCE_SHA},
    inputs:[auditPin,framePin],stage:{width:800,height:600},fps:12,rootEntryFrame:6,
    frameDomain:'sprite-139',frameCount:815,
    textDefinitions:audit.textDefinitions.map(d=>({sourceTextId:d.characterId,text:d.text,
      definitionTagSha256:d.definitionTagSha256})),
    textInstances,
    reading:{definition:[4,8,11,12],inputOutput:[120,122,123,124,125,127],
      decorativeOverlay:[6],unresolvedLateFragments:[128,130,131,132,134,135,136,138]},
    functionControl:{key:'Function',sourceButtonId:10,sourceHitShapeId:9,
      sourceActionSha256:audit.button.actionSha256,
      sourceButtonTagSha256:audit.button.sourceTagSha256,
      firstCandidateFrame:72,firstCompleteGlyphFrame:72,
      firstPartialHitFrame:72,firstFullHitFrame:null,
      availableSpans:buttonAvailableSpans,
      firstHitAreaRatio:audit.button.firstPlacementHitAreaRatio,
      originalClickObserved:false},
    policy:{canvasGlyphs:'preserved',nativeRole:'reflow-reading-companion',
      language:'source-en-fallback',lateFragments:'retain source drawing; semantic role unresolved',
      function:'accessible modern callback from source-timed visible glyph and partial hit, not original-click proof',
      originalRuntimeAccepted:false}};
}

const RUNTIME=String.raw`
export type P016GlossaryKey='Function';
type Span=[number,number];
type TextInstance={instanceId:string;sourceTextId:number;text:string;depth:number;
 firstPlacementFrame:number;lastActiveFrame:number;completeInkSpans:Span[];
 sourcePlacementTagSha256:string};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;
 frameCount:number;textDefinitions:Array<{sourceTextId:number;text:string;definitionTagSha256:string}>;
 textInstances:TextInstance[];reading:{definition:number[];inputOutput:number[];
 decorativeOverlay:number[];unresolvedLateFragments:number[]};
 functionControl:{key:P016GlossaryKey;sourceButtonId:number;sourceHitShapeId:number;
 sourceActionSha256:string;sourceButtonTagSha256:string;firstCandidateFrame:number;
 firstCompleteGlyphFrame:number;firstPartialHitFrame:number;firstFullHitFrame:null;
 availableSpans:Span[];firstHitAreaRatio:number;originalClickObserved:boolean};
 policy:{canvasGlyphs:string;nativeRole:string;language:string;lateFragments:string;
 function:string;originalRuntimeAccepted:boolean}};
function completeAt(instance:TextInstance,frame:number){
 return instance.completeInkSpans.some(([from,to])=>frame>=from&&frame<=to);
}
export function p016TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P016_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P016_TEXT_FRAME_OUT_OF_RANGE');
 const source=P016_TEXT_STATE_SOURCE;
 const completeInk=source.textInstances.filter(instance=>completeAt(instance,frame));
 const select=(ids:number[])=>completeInk.filter(instance=>ids.includes(instance.sourceTextId));
 const functionAvailable=source.functionControl.availableSpans.some(([from,to])=>
  frame>=from&&frame<=to);
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,
  completeInk,definition:select(source.reading.definition),
  inputOutput:select(source.reading.inputOutput),
  unresolvedLateFragments:select(source.reading.unresolvedLateFragments),
  functionControl:{...source.functionControl,available:functionAvailable}};
}
`;
function main(){
  const mode=process.argv[2];
  assert(['--write','--check'].includes(mode),'use --write or --check');
  const source=sourceState();
  const generated=`/* Generated by scripts/build-alg-l06-p016-text-state-v1.mjs; do not edit. */\n${RUNTIME}\nexport const P016_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
  const report=serialized(source);
  for(const [relative,body] of [[GENERATED,generated],[REPORT,report]]){
    const target=path.join(ROOT,relative);
    if(mode==='--write'){
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.writeFileSync(target,body);
    }else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift: ${relative}`);
  }
  console.log(JSON.stringify({mode,generated:GENERATED,report:REPORT,
    sourceSha256:SOURCE_SHA,textInstances:source.textInstances.length}));
}
main();
