#!/usr/bin/env node
/** Source-locked semantic reading companion for ALG001 L6 P015. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB06.swf';
const SWF_SHA='d0f395f5410353733b42ae29198caa86fae6b6eebd0e2a71830a203d969868b1';
const AUDIT='migrations/shared-alg001-l06-p015/audit';
const GENERATED='packages/demos/src/generated/alg-l06-p015-text-state-v1.ts';
const OUT=`${AUDIT}/text-state-v1`;
const INPUTS=[
  [`${AUDIT}/source-v1/source-audit-v1.json`,'5e474ab8e2c00be798adfb1ca39b654ace6b178c2311745f69451bba589a9824'],
  [`${AUDIT}/source-v1/source-text-v1.json`,'bdf49c1ab600629de4a0a24d21eda7a401e66788b0973f343adbb6626eabc13f'],
  [`${AUDIT}/source-v1/source-composition-v1.json`,'742db4326c3f0a4831a71dbe7e453ff77aea4396520ce94ce8f2b28affd5dc46'],
  [`${AUDIT}/source-v1/public-tool-scripts-v1.json`,'8341254b2332f4659efe0124e247bd9e080d483dab892a1fb003763cdbcbdf52'],
  [`${AUDIT}/source-v1/swfmill-v1.xml.gz`,'70e5a4d11a438f4a1f981dc6c044d96223b592b0407cd8e00970face1f567c42'],
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>({path:relative,bytes:read(relative).length,sha256:sha(read(relative))});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const one=(items,predicate,label)=>{const found=items.filter(predicate);assert.equal(found.length,1,label);return found[0];};
const rect=(bounds,matrix,root)=>({left:bounds.left*matrix[0]+matrix[4]+root[4],
  right:bounds.right*matrix[0]+matrix[4]+root[4],
  top:bounds.top*matrix[3]+matrix[5]+root[5],
  bottom:bounds.bottom*matrix[3]+matrix[5]+root[5]});
const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const contains=(outer,inner)=>inner.left>=outer.left&&inner.right<=outer.right&&
  inner.top>=outer.top&&inner.bottom<=outer.bottom;
function shapeBounds(xml,id){
  const match=xml.match(new RegExp('<DefineShape(?:2|3|4)? objectID="'+id+'">\\s*<bounds>\\s*'
    +'<Rectangle left="(-?\\d+)" right="(-?\\d+)" top="(-?\\d+)" bottom="(-?\\d+)"'));
  assert(match,`shape ${id} bounds`);
  return {left:+match[1],right:+match[2],top:+match[3],bottom:+match[4]};
}

function sourceState(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'physical AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
  const sourcePath=path.join(SOURCE_ROOT,SWF),stat=fs.lstatSync(sourcePath);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'ordinary source SWF required');
  const swf=fs.readFileSync(sourcePath);
  assert.equal(swf.length,559546);assert.equal(sha(swf),SWF_SHA);
  for(const [relative,expected] of INPUTS)assert.equal(pin(relative).sha256,expected,`pin ${relative}`);
  const [audit,sourceText,composition,scripts]=INPUTS.slice(0,4).map(([p])=>JSON.parse(read(p)));
  const xml=gunzipSync(read(INPUTS[4][0])).toString('utf8');
  assert.equal(audit.kind,'alg-l06-p015-source-audit-v1');
  assert.equal(audit.source.sha256,SWF_SHA);
  assert.equal(sourceText.sourceSha256,SWF_SHA);
  assert.equal(scripts.sourceSwfSha256,SWF_SHA);
  assert.equal(sourceText.summary.textDefinitions,15);
  assert.equal(sourceText.summary.dynamicFields,0);
  assert.equal(sourceText.summary.unresolvedRuns,0);
  assert.equal(sourceText.summary.unparsedTags,0);
  assert.deepEqual(sourceText.timelines.map(t=>[t.timelineId,t.declaredFrameCount]),
    [['root',10],['sprite-270',914]]);
  const root=one(sourceText.timelines,t=>t.timelineId==='root','root timeline');
  const main=one(sourceText.timelines,t=>t.timelineId==='sprite-270','main timeline');
  const placement=one(root.events,e=>e.characterId===270&&e.kind==='place','root entry');
  assert.deepEqual([placement.frame,placement.depth,placement.name?.text,placement.matrix],
    [6,2,'animation',[1,0,0,1,8248,5666]]);
  const rootMatrix=placement.matrix;
  const eventMap=new Map(main.events.map(e=>[e.eventId,e]));
  const event=id=>{const e=eventMap.get(id);assert(e,`event ${id}`);return e;};
  const instances=(id,depth)=>main.instances.filter(i=>i.characterId===id&&
    (depth===undefined||i.depth===depth));
  const instance=(id,depth)=>one(instances(id,depth),()=>true,`instance ${id}/${depth}`);
  const definition=id=>one(sourceText.textDefinitions,d=>d.characterId===id,`text ${id}`);
  const text=id=>definition(id).runs.map(r=>r.text).join('');
  const expected=new Map([[30,'function'],[34,'A function is a special relation in which every value of x has a unique value of y.  '],
    [39,'function'],[41,'relation'],[42,'value'],
    [44,'A function can also be a rule for using an input to make an output.  '],
    [48,'rule'],[49,'input'],[50,'output'],[51,'Each input must have only one output.'],
    [262,'3'],[264,'6'],[265,'9'],[268,'6'],[269,'3']]);
  for(const [id,value] of expected)assert.equal(text(id),value,`source text ${id}`);
  const buttonDefs=sourceText.buttonDefinitions;
  assert.deepEqual(buttonDefs.map(b=>b.characterId),[36,37,38,45,46,47]);
  assert.equal(scripts.files.length,8);
  const action=buttonId=>one(scripts.files,f=>f.path===
    `scripts/DefineButton2_${buttonId}/BUTTONCONDACTION on(release).as`,
    `button script ${buttonId}`).text;
  const rootScript=name=>one(scripts.files,f=>f.path===`scripts/${name}/DoAction.as`,name).text;
  assert.match(rootScript('frame_1'),/_level0\.InternalPreloader\.gotoAndPlay\("jump_check"\)/);
  assert.match(rootScript('frame_6'),/stop\(\)/);
  const hitBounds=shapeBounds(xml,35),wipeBounds=shapeBounds(xml,31);
  assert.deepEqual(hitBounds,{left:-1518,right:1517,top:-205,bottom:204});
  assert.deepEqual(wipeBounds,{left:-3330,right:3330,top:-280,bottom:280});
  const sectionSpecs=[
    {id:'definition',textId:34,maskDepth:1,clipDepth:10,placedFrame:164,
      controls:[36,38,37]},
    {id:'rule',textId:44,maskDepth:11,clipDepth:20,placedFrame:271,
      controls:[45,46,47]},
    {id:'unique-output',textId:51,maskDepth:21,clipDepth:23,placedFrame:350,
      controls:[]},
  ];
  const sections=sectionSpecs.map(spec=>{
    const sentence=instance(spec.textId),mask=instance(31,spec.maskDepth),
      sentencePlacement=event(sentence.createdByEventId),maskPlacement=event(mask.createdByEventId),
      maskEvents=mask.updates.map(event);
    assert.equal(sentence.firstFrame,spec.placedFrame);
    assert.equal(mask.firstFrame,spec.placedFrame);
    assert.equal(maskPlacement.clipDepth,spec.clipDepth);
    assert(spec.maskDepth<sentence.depth&&sentence.depth<=spec.clipDepth);
    const sentenceBounds=rect(definition(spec.textId).boundsTwips,sentencePlacement.matrix,rootMatrix);
    const initialMaskBounds=rect(wipeBounds,maskEvents[0].matrix,rootMatrix);
    const finalMaskBounds=rect(wipeBounds,maskEvents.at(-1).matrix,rootMatrix);
    const firstIntersect=maskEvents.find(e=>intersects(rect(wipeBounds,e.matrix,rootMatrix),sentenceBounds));
    assert(firstIntersect);
    const rightClippedTwips=Math.max(0,sentenceBounds.right-finalMaskBounds.right);
    assert(rightClippedTwips>0&&rightClippedTwips<350,
      `record conservative sentence-bounds right clip ${spec.textId}`);
    assert(contains({left:0,right:16000,top:0,bottom:12000},sentenceBounds));
    return {...spec,text:text(spec.textId).trim(),sourceTextId:spec.textId,
      firstIntersectFrame:firstIntersect.frame,semanticCompanionFrame:maskEvents.at(-1).frame,
      sentenceStageBoundsTwips:sentenceBounds,initialMaskStageBoundsTwips:initialMaskBounds,
      finalMaskStageBoundsTwips:finalMaskBounds,rightClippedTwips};
  });
  assert.deepEqual(sections.map(s=>s.semanticCompanionFrame),[249,332,392]);
  const controlSpecs=[['Function',36,39,1,172],['Relation',38,41,1,191],
    ['Value',37,42,1,215],['Rule',45,48,11,302],
    ['Input',46,49,11,317],['Output',47,50,11,332]];
  const controls=controlSpecs.map(([key,buttonId,termTextId,maskDepth,fullHitFrame])=>{
    const button=one(buttonDefs,b=>b.characterId===buttonId,`button ${buttonId}`),
      sourceInstance=instance(buttonId),sourcePlacement=event(sourceInstance.createdByEventId),
      mask=instance(31,maskDepth),maskEvents=mask.updates.map(event);
    assert.equal(sourceInstance.firstFrame,mask.firstFrame);
    assert.equal(button.statePlacements.length,1);
    assert.equal(button.statePlacements[0].characterId,35);
    assert.deepEqual(button.statePlacements[0].states,
      {up:false,over:false,down:false,hitTest:true});
    assert.match(action(buttonId),new RegExp(`KeyAttribute = "${key}"`));
    assert.match(action(buttonId),/_root\.DoHyperLinks\(\)/);
    assert.match(action(buttonId),/_root\.animation_mc\.animation\.stop\(\)/);
    const hit=rect(hitBounds,sourcePlacement.matrix,rootMatrix);
    const termInstances=instances(termTextId);
    assert.equal(termInstances.length,3);
    assert(termInstances.every(i=>intersects(hit,
      rect(definition(termTextId).boundsTwips,event(i.createdByEventId).matrix,rootMatrix))));
    const firstIntersect=maskEvents.find(e=>intersects(rect(wipeBounds,e.matrix,rootMatrix),hit));
    const fullHit=maskEvents.find(e=>contains(rect(wipeBounds,e.matrix,rootMatrix),hit));
    assert(firstIntersect&&fullHit);
    assert.equal(fullHit.frame,fullHitFrame,`${key} full-hit mask gate`);
    return {key,buttonId,termTextId,termText:text(termTextId),maskDepth,
      placedFrame:sourceInstance.firstFrame,firstIntersectFrame:firstIntersect.frame,
      fullHitFrame:fullHit.frame,firstOverlayFrame:termInstances[0].firstFrame,
      sourceActionSha256:button.actions.sha256,sourceVisualState:'hit-test-only',
      hitStageBoundsTwips:hit};
  });
  for(let a=0;a<controls.length;a++)for(let b=a+1;b<controls.length;b++)
    if(controls[a].maskDepth===controls[b].maskDepth)
      assert(!intersects(controls[a].hitStageBoundsTwips,controls[b].hitStageBoundsTwips),
        `disjoint glossary hit ${a}/${b}`);
  const machineLabel=instance(30,72),labelPlacement=event(machineLabel.createdByEventId);
  assert.equal(machineLabel.firstFrame,135);
  const machineLabelBounds=rect(definition(30).boundsTwips,labelPlacement.matrix,rootMatrix);
  assert(contains({left:0,right:16000,top:0,bottom:12000},machineLabelBounds));
  assert(machineLabelBounds.left>8000&&machineLabelBounds.top>5000,
    'text 30 is a machine label, not the root page title');
  const numericDefs=[262,264,265,268,269].map(id=>({id,text:text(id)}));
  const numberInstances=main.instances.filter(i=>numericDefs.some(d=>d.id===i.characterId));
  assert.deepEqual(numberInstances.map(i=>[i.characterId,i.firstFrame]),
    [[262,741],[264,778],[262,816],[265,828],[268,880],[269,892]]);
  const numericPlacements=numberInstances.map(i=>({sourceTextId:i.characterId,text:text(i.characterId),
    depth:i.depth,placedFrame:i.firstFrame,lastFrameExclusive:i.lastFrameExclusive,
    alphaUpdates:i.updates.map(event).filter(e=>e.colorTransform).map(e=>({frame:e.frame,
      alpha:e.colorTransform.multiply[3]}))}));
  const masks=main.events.filter(e=>e.kind==='place'&&e.clipDepth!==undefined).map(e=>({
    characterId:e.characterId,frame:e.frame,depth:e.depth,clipDepth:e.clipDepth}));
  assert.deepEqual(masks.map(m=>[m.characterId,m.frame,m.depth,m.clipDepth]),
    [[31,164,1,10],[31,271,11,20],[31,350,21,23],
      [260,732,77,80],[263,778,82,85],[267,873,82,85]]);
  return {schemaVersion:1,animationId:'shared-alg001-l06-p015',sourceSwfSha256:SWF_SHA,
    frameDomain:'sprite-270',frameCount:914,fps:12,rootEntryFrame:6,rootMatrix,
    machineLabel:{text:text(30),sourceTextId:30,placedFrame:135,
      stageBoundsTwips:machineLabelBounds},
    sections,controls,numeric:{placements:numericPlacements,masks,
      semanticDisposition:'source tokens only until visually audited pair mapping'},
    policy:{canvasGlyphs:'preserved',nativeRole:'semantic-companion',
      language:'source-en-only',glossary:'explicit callback after whole hit lies inside source wipe mask',
      sentences:'full sentence after final source mask transform; final text boxes retain small right clipping',
      numeric:'no inferred input-output pairs from digit definitions alone',
      originalRuntimeAccepted:false}};
}

const TYPES=String.raw`
export type P015GlossaryKey='Function'|'Relation'|'Value'|'Rule'|'Input'|'Output';
type Rect={left:number;right:number;top:number;bottom:number};
type Section={id:string;text:string;sourceTextId:number;maskDepth:number;clipDepth:number;
 placedFrame:number;controls:number[];firstIntersectFrame:number;semanticCompanionFrame:number;
 sentenceStageBoundsTwips:Rect;initialMaskStageBoundsTwips:Rect;finalMaskStageBoundsTwips:Rect;
 rightClippedTwips:number};
type Control={key:P015GlossaryKey;buttonId:number;termTextId:number;termText:string;
 maskDepth:number;placedFrame:number;firstIntersectFrame:number;fullHitFrame:number;
 firstOverlayFrame:number;sourceActionSha256:string;sourceVisualState:string;
 hitStageBoundsTwips:Rect};
type NumericPlacement={sourceTextId:number;text:string;depth:number;placedFrame:number;
 lastFrameExclusive:number;alphaUpdates:Array<{frame:number;alpha:number}>};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 frameDomain:string;frameCount:number;fps:number;rootEntryFrame:number;rootMatrix:number[];
 machineLabel:{text:string;sourceTextId:number;placedFrame:number;stageBoundsTwips:Rect};
 sections:Section[];controls:Control[];
 numeric:{placements:NumericPlacement[];masks:Array<{characterId:number;frame:number;
 depth:number;clipDepth:number}>;semanticDisposition:string};
 policy:{canvasGlyphs:string;nativeRole:string;language:string;glossary:string;
 sentences:string;numeric:string;originalRuntimeAccepted:boolean}};
`;
const RUNTIME=String.raw`
export function p015TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P015_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P015_TEXT_FRAME_OUT_OF_RANGE');
 const source=P015_TEXT_STATE_SOURCE;
 return {animationId:source.animationId,sourceSwfSha256:source.sourceSwfSha256,
  frameDomain:source.frameDomain,frame,
  machineLabel:{...source.machineLabel,visible:frame>=source.machineLabel.placedFrame},
  sections:source.sections.map(section=>({...section,
   visible:frame>=section.semanticCompanionFrame})),
  controls:source.controls.map(control=>({...control,
   available:frame>=control.fullHitFrame})),
  numeric:source.numeric,languagePolicy:'source-en-only' as const,
  canvasGlyphs:'preserved' as const};
}
`;
function outputs(){
  const source=sourceState();
  const generated=Buffer.from('/* Generated by scripts/build-alg-l06-p015-text-state-v1.mjs. Do not edit. */\n'
    +TYPES+'\nexport const P015_TEXT_STATE_SOURCE:Source=JSON.parse('
    +JSON.stringify(JSON.stringify(source))+');\n'+RUNTIME);
  const audit={schemaVersion:1,kind:'alg-l06-p015-text-state-audit-v1',
    animationId:source.animationId,sourceSwf:{path:path.join(SOURCE_ROOT,SWF),
      bytes:559546,sha256:SWF_SHA},inputs:INPUTS.map(([name])=>pin(name)),
    output:{path:GENERATED,bytes:generated.length,sha256:sha(generated)},
    semanticTiming:{machineLabel:135,
      sectionReveal:source.sections.map(s=>[s.id,s.semanticCompanionFrame]),
      glossaryFullHit:source.controls.map(c=>[c.key,c.fullHitFrame])},
    numericalSourceTokens:source.numeric.placements,
    limits:['Source structure only; no original runtime, listening or acceptance.',
      'Canvas source glyphs remain; native text is a semantic reflow companion.',
      'Glossary controls wait for whole source hit region inside the wipe mask.',
      'Numeric 3/6/9 tokens are inventoried but input-output pair semantics await visual geometry review.',
      'Source text is English only; es interface uses marked source-English fallback.']};
  return new Map([[GENERATED,generated],[`${OUT}/source-ir-v1.json`,json(source)],
    [`${OUT}/text-state-audit-v1.json`,json(audit)]]);
}
export {outputs as p015TextStateOutputs};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),
    'Usage: --write | --check');
  for(const [relative,content] of outputs()){
    const target=path.join(ROOT,relative);
    if(process.argv[2]==='--write'){
      fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);
    }
    assert.deepEqual(fs.readFileSync(target),content,`P015 text-state ${relative}`);
  }
  console.log('P015_SOURCE_TEXT_STATE_VERIFIED_NOT_ADMITTED');
}
