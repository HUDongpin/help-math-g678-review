#!/usr/bin/env node
/** Source-locked semantic companion for ALG L6 P013. No runtime acceptance claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB04.swf';
const SWF_SHA='1be47750557385ef91c648fb87fdcde642d342caadc35da7a1f7a2d1fdb11d35';
const BASE='migrations/shared-alg001-l06-p013/audit';
const GENERATED='packages/demos/src/generated/alg-l06-p013-text-state-v1.ts';
const OUTPUT=`${BASE}/text-state-v1`;
const INPUTS=[
  [`${BASE}/source-v1/source-audit-v1.json`,'ec5707528c5ebc3f0992aec542c6eace1a3eebaa8256cc3d5aebfc7f037078af'],
  [`${BASE}/source-v1/source-composition-v1.json`,'9882183b44543dfbd2615e15cd204f91e1e5e7928b3e99e0a15b298baa17b637'],
  [`${BASE}/source-v1/source-text-v1.json`,'0556f2663d67760f7e359a91b15e2711285f08774a0cafd58449ad68387260c1'],
  [`${BASE}/source-v1/public-tool-scripts-v1.json`,'e9dc01a4017ba546017a1bbe7efeb61949cc2ecf707d2318a3dd9fc14baa6602'],
  [`${BASE}/glossary-v1/input-output-crosswalk-v1.json`,'7a6d26e663d948f77833378ee1c2c5e60130e55aa6299bc7b0eacf070b091e2e'],
  [`${BASE}/source-v1/swfmill-v1.xml.gz`,'4b4bcb2d1a9f2d929a8650a61491beed58149ffd8b63418e4a30dd0271aae369'],
];
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>({path:relative,bytes:read(relative).length,sha256:hash(read(relative))});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const one=(items,predicate,label)=>{const found=items.filter(predicate);assert.equal(found.length,1,label);return found[0];};
const rect=(bounds,matrix)=>({left:bounds.left*matrix[0]+matrix[4],
  right:bounds.right*matrix[0]+matrix[4],top:bounds.top*matrix[3]+matrix[5],
  bottom:bounds.bottom*matrix[3]+matrix[5]});
const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const contains=(a,b)=>a.left<=b.left&&a.right>=b.right&&a.top<=b.top&&a.bottom>=b.bottom;
function shapeBounds(xml,id){
  const match=xml.match(new RegExp('<DefineShape(?:2|3|4)? objectID="'+id+'">\\s*<bounds>\\s*'
    +'<Rectangle left="(-?\\d+)" right="(-?\\d+)" top="(-?\\d+)" bottom="(-?\\d+)"'));
  assert(match,`shape ${id} bounds`);
  return {left:+match[1],right:+match[2],top:+match[3],bottom:+match[4]};
}

function sourceState(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
  const swfPath=path.join(SOURCE_ROOT,SWF),stat=fs.lstatSync(swfPath);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'ordinary source SWF required');
  const swf=fs.readFileSync(swfPath);
  assert.equal(swf.length,269912);assert.equal(hash(swf),SWF_SHA);
  for(const [relative,sha] of INPUTS)assert.equal(pin(relative).sha256,sha,`pin ${relative}`);
  const [audit,composition,sourceText,scripts,crosswalk]=INPUTS.slice(0,5)
    .map(([relative])=>JSON.parse(read(relative)));
  const xml=gunzipSync(read(INPUTS[5][0])).toString('utf8');
  assert.equal(audit.kind,'alg-l06-p013-source-audit-v1');
  assert.equal(audit.source.sha256,SWF_SHA);
  assert.equal(sourceText.sourceSha256,SWF_SHA);
  assert.equal(composition.main.domainId,'sprite-140');
  assert.equal(composition.main.declaredFrames,372);
  assert.equal(composition.main.rootEntryFrame,6);
  assert.deepEqual(composition.main.rootPlacement.matrix,[1,0,0,1,8248,5666]);
  assert.equal(sourceText.summary.textDefinitions,9);
  assert.equal(sourceText.summary.unresolvedRuns,0);
  assert.equal(crosswalk.animationId,'shared-alg001-l06-p013');
  assert.equal(crosswalk.terms.length,2);
  assert.equal(scripts.sourceSwfSha256,SWF_SHA);
  const expected=new Map([[4,'F =     x C+ 32'],[5,'95'],[7,'A = l x w'],
    [129,'The number that goes in is called the input.'],[133,'Input'],[135,'input'],
    [136,'The number that comes out is called the output.'],[138,'Output'],[139,'output']]);
  const main=one(sourceText.timelines,t=>t.timelineId==='sprite-140','main text timeline');
  const definitions=sourceText.textDefinitions.map(def=>{
    const text=def.runs.map(run=>run.text).join('');
    assert.equal(text,expected.get(def.characterId),`text ${def.characterId}`);
    assert(def.sourceTagSha256&&def.boundsTwips);
    const placements=main.instances.filter(i=>i.characterId===def.characterId).map(i=>({
      instanceId:i.instanceId,depth:i.depth,firstFrame:i.firstFrame,
      lastFrameExclusive:i.lastFrameExclusive,
    }));
    assert(placements.length>0,`placements ${def.characterId}`);
    return {characterId:def.characterId,text,sourceTagSha256:def.sourceTagSha256,
      boundsTwips:def.boundsTwips,placements};
  });
  assert.equal(definitions.length,9);
  const definition=id=>one(definitions,d=>d.characterId===id,`definition ${id}`);
  const first=id=>Math.min(...definition(id).placements.map(p=>p.firstFrame));
  assert.deepEqual([first(4),first(5),first(7),first(129),first(133),first(136),first(138)],
    [2,2,2,258,288,297,360]);
  assert.deepEqual(definition(135).placements.map(p=>p.firstFrame),[296,298,300]);
  assert.deepEqual(definition(139).placements.map(p=>p.firstFrame),[365,367,369]);
  const rootMatrix=composition.main.rootPlacement.matrix;
  const stage={left:0,right:16000,top:0,bottom:12000};
  const initialGeometry=id=>{
    const instance=one(main.instances,i=>i.characterId===id,`visible instance ${id}`);
    const event=one(main.events,e=>e.eventId===instance.createdByEventId,`placement ${id}`);
    assert(event.matrix,`matrix ${id}`);
    const bounds=definition(id).boundsTwips,m=event.matrix;
    assert.deepEqual(m.slice(0,4),[1,0,0,1],`source text transform ${id}`);
    const projected={left:bounds.left+m[4]+rootMatrix[4],right:bounds.right+m[4]+rootMatrix[4],
      top:bounds.top+m[5]+rootMatrix[5],bottom:bounds.bottom+m[5]+rootMatrix[5]};
    assert(projected.left>=stage.left&&projected.right<=stage.right&&
      projected.top>=stage.top&&projected.bottom<=stage.bottom,
    `source text ${id} is within the stage`);
    return {characterId:id,firstFrame:instance.firstFrame,stageBoundsTwips:projected,
      initialAlpha:event.colorTransform?.multiply?.[3]??256};
  };
  const visibleGeometry=[4,5,7,129,133,136,138].map(initialGeometry);
  assert.deepEqual(visibleGeometry.slice(0,3).map(g=>g.initialAlpha),[256,256,256]);
  const labelTiming=id=>{
    const instance=one(main.instances,i=>i.characterId===id,`label instance ${id}`);
    const events=instance.updates.map(eventId=>one(main.events,e=>e.eventId===eventId,`label ${id} event`));
    const firstVisible=events.find(e=>(e.colorTransform?.multiply?.[3]??256)>0);
    const full=events.find(e=>(e.colorTransform?.multiply?.[3]??256)===256);
    assert.equal(events[0].colorTransform.multiply[3],0);
    assert(firstVisible&&full&&firstVisible.frame<full.frame);
    return {placedFrame:instance.firstFrame,firstVisibleFrame:firstVisible.frame,fullAlphaFrame:full.frame,
      alphaByUpdate:events.map(e=>({frame:e.frame,alphaMultiply:e.colorTransform.multiply[3]}))};
  };
  const inputLabel=labelTiming(133),outputLabel=labelTiming(138);
  assert.deepEqual([inputLabel.firstVisibleFrame,inputLabel.fullAlphaFrame,
    outputLabel.firstVisibleFrame,outputLabel.fullAlphaFrame],[289,291,361,363]);
  const fraction=sourceText.textDefinitions.find(d=>d.characterId===5).runs;
  assert.deepEqual(fraction.map(r=>r.text),['9','5']);
  assert(fraction[1].yOffsetTwips>fraction[0].yOffsetTwips,
    '9 above 5 is an authored fraction, not the number 95');
  const masks=[{depth:5,firstFrame:258,clipDepth:10,lastUpdateFrame:296},
    {depth:11,firstFrame:297,clipDepth:16,lastUpdateFrame:365}].map(spec=>{
    const instance=one(main.instances,i=>i.characterId===127&&i.depth===spec.depth,
      `mask depth ${spec.depth}`);
    const events=instance.updates.map(id=>one(main.events,e=>e.eventId===id,`event ${id}`));
    assert.equal(instance.firstFrame,spec.firstFrame);
    assert.equal(instance.lastFrameExclusive,373);
    assert.equal(events[0].clipDepth,spec.clipDepth);
    assert.equal(events.at(-1).frame,spec.lastUpdateFrame);
    assert(events.every(e=>e.matrix),`mask matrices depth ${spec.depth}`);
    return {characterId:127,depth:spec.depth,clipDepth:spec.clipDepth,
      firstFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive,
      lastUpdateFrame:events.at(-1).frame,
      updateFrames:events.map(e=>e.frame),
      updates:events.map(e=>({frame:e.frame,matrix:e.matrix})),
      sourceTagSha256:events[0].sourceTagSha256};
  });
  const maskBounds=shapeBounds(xml,127),hitBounds=shapeBounds(xml,130);
  assert.deepEqual(maskBounds,{left:-4510,right:4509,top:-310,bottom:310});
  assert.deepEqual(hitBounds,{left:-1031,right:1032,top:-311,bottom:310});
  const controls=crosswalk.sourceButtons.map(source=>{
    const button=one(sourceText.buttonDefinitions,b=>b.characterId===source.characterId,
      `button ${source.characterId}`);
    const placement=one(composition.main.buttonInstances,b=>b.characterId===source.characterId,
      `button placement ${source.characterId}`);
    assert.equal(button.actions.sha256,source.actionSha256);
    assert.equal(placement.firstFrame,source.firstFrame);
    assert.equal(placement.sourceInstance.lastFrameExclusive,373);
    assert.equal(button.statePlacements.length,1);
    assert.equal(button.statePlacements[0].states.hitTest,true);
    assert.equal(button.statePlacements[0].states.up,false);
    assert.equal(button.statePlacements[0].characterId,130);
    assert.deepEqual(button.statePlacements[0].matrix,[1,0,0,1,0,0]);
    assert(crosswalk.terms.some(t=>t.buttonId===source.characterId&&
      t.canonicalDictionaryKey===source.sourceKeyAttribute));
    const placementEvent=one(main.events,e=>e.eventId===placement.sourceInstance.createdByEventId,
      `button placement event ${source.characterId}`);
    assert(placementEvent.matrix);
    const hitRect=rect(hitBounds,placementEvent.matrix);
    const mask=one(masks,m=>m.depth<source.depth&&source.depth<=m.clipDepth,
      `mask for button ${source.characterId}`);
    const partial=mask.updates.find(u=>intersects(rect(maskBounds,u.matrix),hitRect));
    const full=mask.updates.find(u=>contains(rect(maskBounds,u.matrix),hitRect));
    assert(partial&&full&&partial.frame<=full.frame);
    assert.deepEqual([source.characterId,partial.frame,full.frame],
      source.characterId===131?[131,292,296]:[137,360,365]);
    return {sourceKey:source.sourceKeyAttribute,characterId:source.characterId,
      firstFrame:source.firstFrame,lastFrameExclusive:373,depth:source.depth,
      firstPartialHitFrame:partial.frame,firstFullHitFrame:full.frame,
      hitBoundsTwips:hitRect,
      actionSha256:source.actionSha256,visualState:'hit-test-only',
      sourceEffects:source.sourceEffects};
  });
  assert.deepEqual(controls.map(c=>[c.sourceKey,c.firstFrame]),[['Input',258],['Output',297]]);
  return {schemaVersion:1,animationId:'shared-alg001-l06-p013',sourceSwfSha256:SWF_SHA,
    frameDomain:'sprite-140',frameCount:372,frameRate:12,rootFrame:6,
    rootMatrix,definitions,visibleGeometry,masks,controls,
    semanticText:{fahrenheit:'F = (9/5) × C + 32',area:'A = l × w',
      input:definition(129).text,output:definition(136).text},
    groups:{formulaIds:[4,5,7],inputSentenceId:129,inputLabelId:133,
      outputSentenceId:136,outputLabelId:138},
    timing:{inputLabel,outputLabel},
    policy:{canvasGlyphs:'preserved',nativeRole:'semantic-companion',
      sentenceReveal:'after-final-source-mask-update',language:'source-en-only',
      glossary:'distinct-exact-keys',originalRuntimeAccepted:false}};
}

const TYPES=String.raw`
export type P013GlossaryKey='Input'|'Output';
type Rect={left:number;right:number;top:number;bottom:number};
type Placement={instanceId:string;depth:number;firstFrame:number;lastFrameExclusive:number};
type Definition={characterId:number;text:string;sourceTagSha256:string;boundsTwips:Rect;placements:Placement[]};
type Mask={characterId:number;depth:number;clipDepth:number;firstFrame:number;
 lastFrameExclusive:number;lastUpdateFrame:number;updateFrames:number[];
 updates:Array<{frame:number;matrix:number[]}>;sourceTagSha256:string};
type Control={sourceKey:P013GlossaryKey;characterId:number;firstFrame:number;
 lastFrameExclusive:number;depth:number;firstPartialHitFrame:number;firstFullHitFrame:number;
 hitBoundsTwips:Rect;actionSha256:string;visualState:string;sourceEffects:string[]};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 frameDomain:string;frameCount:number;frameRate:number;rootFrame:number;rootMatrix:number[];
 definitions:Definition[];visibleGeometry:Array<{characterId:number;firstFrame:number;
 stageBoundsTwips:Rect;initialAlpha:number}>;masks:Mask[];controls:Control[];
 semanticText:{fahrenheit:string;area:string;input:string;output:string};
 groups:{formulaIds:number[];inputSentenceId:number;inputLabelId:number;
 outputSentenceId:number;outputLabelId:number};
 timing:{inputLabel:{placedFrame:number;firstVisibleFrame:number;fullAlphaFrame:number;
 alphaByUpdate:Array<{frame:number;alphaMultiply:number}>};outputLabel:{placedFrame:number;
 firstVisibleFrame:number;fullAlphaFrame:number;
 alphaByUpdate:Array<{frame:number;alphaMultiply:number}>}};
 policy:{canvasGlyphs:string;nativeRole:string;sentenceReveal:string;
 language:string;glossary:string;originalRuntimeAccepted:boolean}};
`;
const RUNTIME=String.raw`
export function p013TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P013_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P013_TEXT_FRAME_OUT_OF_RANGE');
 const source=P013_TEXT_STATE_SOURCE;
 const definition=(id:number)=>source.definitions.find(d=>d.characterId===id)!;
 const active=(id:number)=>definition(id).placements.some(p=>frame>=p.firstFrame&&frame<p.lastFrameExclusive);
 const sourceTextIds=(ids:number[])=>ids.map(id=>'character-'+id);
 const controls=source.controls.map(control=>({sourceKey:control.sourceKey,
  sourceCharacterId:control.characterId,sourceActionSha256:control.actionSha256,
  sourceVisualState:control.visualState,sourceFirstFrame:control.firstFrame,
  firstPartialHitFrame:control.firstPartialHitFrame,firstFullHitFrame:control.firstFullHitFrame,
  available:frame>=control.firstFullHitFrame&&frame<control.lastFrameExclusive}));
 const inputMask=source.masks.find(mask=>mask.depth===5)!;
 const outputMask=source.masks.find(mask=>mask.depth===11)!;
 const formulas={fahrenheit:{text:source.semanticText.fahrenheit,
  semanticVisible:active(4)&&active(5),sourceTextIds:sourceTextIds([4,5])},
  area:{text:source.semanticText.area,semanticVisible:active(7),sourceTextIds:sourceTextIds([7])}};
 const input={label:'Input',labelVisible:active(source.groups.inputLabelId)&&
  frame>=source.timing.inputLabel.firstVisibleFrame,
  labelSourceTextIds:sourceTextIds([source.groups.inputLabelId]),
  sentence:source.semanticText.input,sourceTextIds:sourceTextIds([source.groups.inputSentenceId]),
  sentencePlaced:active(source.groups.inputSentenceId),
  sentenceVisible:active(source.groups.inputSentenceId)&&frame>=inputMask.lastUpdateFrame,
  revealCompleteFrame:inputMask.lastUpdateFrame,
  control:controls.find(control=>control.sourceKey==='Input')!};
 const output={label:'Output',labelVisible:active(source.groups.outputLabelId)&&
  frame>=source.timing.outputLabel.firstVisibleFrame,
  labelSourceTextIds:sourceTextIds([source.groups.outputLabelId]),
  sentence:source.semanticText.output,sourceTextIds:sourceTextIds([source.groups.outputSentenceId]),
  sentencePlaced:active(source.groups.outputSentenceId),
  sentenceVisible:active(source.groups.outputSentenceId)&&frame>=outputMask.lastUpdateFrame,
  revealCompleteFrame:outputMask.lastUpdateFrame,
  control:controls.find(control=>control.sourceKey==='Output')!};
 return {animationId:source.animationId,sourceSwfSha256:source.sourceSwfSha256,
  frameDomain:source.frameDomain,frame,formulas,input,output,
  languagePolicy:'source-en-only' as const,canvasGlyphs:'preserved' as const};
}
`;
function outputs(){
  const source=sourceState();
  const generated=Buffer.from('/* Generated by scripts/build-alg-l06-p013-text-state-v1.mjs. Do not edit. */\n'
    +TYPES+'\nexport const P013_TEXT_STATE_SOURCE:Source=JSON.parse('
    +JSON.stringify(JSON.stringify(source))+');\n'+RUNTIME);
  const audit={schemaVersion:1,kind:'alg-l06-p013-text-state-audit-v1',
    animationId:source.animationId,sourceSwf:{path:path.join(SOURCE_ROOT,SWF),
      bytes:269912,sha256:SWF_SHA},inputs:INPUTS.map(([name])=>pin(name)),
    output:{path:GENERATED,bytes:generated.length,sha256:hash(generated)},
    semanticReveal:{formulasPlacedAndOnstage:2,inputButtonPlaced:258,
      inputHitFirstPartial:292,inputHitFirstFull:296,
      inputLabelPlacedAlphaZero:288,inputLabelFirstVisible:289,inputLabelFullAlpha:291,
      inputSentenceMaskSettles:296,outputButtonPlaced:297,
      outputHitFirstPartial:360,outputHitFirstFull:365,
      outputLabelPlacedAlphaZero:360,outputLabelFirstVisible:361,outputLabelFullAlpha:363,
      outputSentenceMaskSettles:365},
    limits:['Source structural timing only; no original runtime comparison or acceptance.',
      'Native full sentences wait for the last authored mask update; this is a readability policy.',
      'Source buttons are hit-test-only. Native controls wait until the authored mask fully uncovers each hit rectangle.',
      'Source teaching text is English only. Spanish interface uses marked English fallback.',
      'Canvas retains source glyphs and geometry.']};
  return new Map([[GENERATED,generated],
    [`${OUTPUT}/source-ir-v1.json`,json(source)],
    [`${OUTPUT}/text-state-audit-v1.json`,json(audit)]]);
}
export {outputs as p013TextStateOutputs};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),
    'Usage: --write | --check');
  for(const [relative,content] of outputs()){
    const target=path.join(ROOT,relative);
    if(process.argv[2]==='--write'&&!fs.existsSync(target)){
      fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content,{flag:'wx'});
    }
    assert.deepEqual(fs.readFileSync(target),content,`immutable P013 text state ${relative}`);
  }
  console.log('P013_SOURCE_TEXT_STATE_VERIFIED_NOT_ADMITTED');
}
