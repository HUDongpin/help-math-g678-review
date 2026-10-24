#!/usr/bin/env node
/** Source-locked P020 native semantic companion data; never executes AVM1. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const AWS='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB13.swf';
const SWF_SHA='6d0df40af188c98b77a7419b89223c922200723ce106240a6d08e49891a5d25f';
const AUDIT='output/alg-l06-p020-source-audit-v1/source-audit-v1.json';
const AUDIT_SHA='8e48a11f8b3f4a1a3f6545105124b0a85eff1827675dd3ca28eb912226a112fb';
const FRAMES='output/alg-l06-p020-source-audit-v1/domain-frame-states-v1.json';
const FRAMES_SHA='5edb62a3422e4cbda9c9abdf47f3abc2b83385657a0bec4568890193180736e7';
const GENERATED='packages/demos/src/generated/alg-l06-p020-text-state-v1.ts';
const REPORT='migrations/shared-alg001-l06-p020/audit/text-state-v1/text-state-source-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>({path:relative,bytes:read(relative).length,sha256:sha(read(relative))});
const json=value=>JSON.stringify(value,null,2)+'\n';
function spans(frames){const result=[];for(const frame of frames){const previous=result.at(-1);
 if(previous&&previous[1]+1===frame)previous[1]=frame;
 else result.push([frame,frame]);}return result;}
const inSpans=(sets,frame)=>sets.some(([from,to])=>from<=frame&&frame<=to);
function sourceState(){
 assert.equal(fs.realpathSync(AWS),AWS,'physical AWS root');
 const sourcePath=path.join(AWS,SWF),stat=fs.lstatSync(sourcePath);
 assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1);
 const swf=fs.readFileSync(sourcePath);assert.equal(swf.length,143936);
 assert.equal(sha(swf),SWF_SHA);
 const auditPin=pin(AUDIT),framePin=pin(FRAMES);
 assert.equal(auditPin.sha256,AUDIT_SHA);assert.equal(framePin.sha256,FRAMES_SHA);
 const audit=JSON.parse(read(AUDIT)),frameSource=JSON.parse(read(FRAMES));
 assert.equal(audit.kind,'alg-l06-p020-source-text-display-domain-audit-v1');
 assert.equal(audit.source.sha256,SWF_SHA);assert.equal(frameSource.sourceSha256,SWF_SHA);
 assert.equal(audit.identity.mainDomain,'sprite-162');assert.equal(audit.identity.mainFrameCount,172);
 assert.equal(audit.textDefinitions.length,39);assert.equal(audit.buttonDefinitions.length,8);
 const domains=new Map(frameSource.domains.map(domain=>[domain.timelineId,domain]));
 const main=domains.get('sprite-162');assert(main&&main.frames.length===172);
 const one=(items,predicate,label)=>{const found=items.filter(predicate);
  assert.equal(found.length,1,label);return found[0];};
 const text=id=>one(audit.textDefinitions,definition=>definition.characterId===id,`text ${id}`);
 assert.equal(text(5).text,'If the input for this function is 5, what is the output?');
 const frame=(domain,at)=>domains.get(domain)?.frames[at-1];
 const row=(domain,at,id)=>one(frame(domain,at).items,item=>item.instanceId===id,
  `instance ${id} at ${domain}/${at}`);
 const complete=(domain,id)=>spans(domains.get(domain).frames.filter(at=>
  at.items.some(item=>item.instanceId===id&&item.completeInkVisibleByVerifiedFills))
  .map(at=>at.frame));
 const first=(sets)=>sets[0]?.[0]??null;
 const questionInstance=one(audit.domainSummaries.find(domain=>domain.timelineId==='sprite-162').instances,
  item=>item.characterId===5, 'question source instance');
 const questionSpans=complete('sprite-162',questionInstance.instanceId);
 assert.equal(first(questionSpans),7);
 const question={text:text(5).text,sourceTextId:5,sourceTextInstanceId:questionInstance.instanceId,
  definitionTagSha256:text(5).sourceTagSha256,
  sourcePlacementTagSha256:questionInstance.sourcePlacementTagSha256,
  runs:text(5).runs.map(run=>({text:run.text,colorRgba:run.colorRgba})),
  visibleSpans:questionSpans,
  blueRuns:['input','function','output'].map(value=>{
   const run=one(text(5).runs,item=>item.text===value&&
    JSON.stringify(item.colorRgba)==='[0,0,204,255]',`blue run ${value}`);
   const visibleSpans=spans(main.frames.filter(at=>at.items.some(item=>
    item.instanceId===questionInstance.instanceId&&item.runs?.some(source=>
     source.text===value&&source.completeInkVisibleByVerifiedFills))).map(at=>at.frame));
   assert.equal(first(visibleSpans),7);
   return {...run,visibleSpans};
  })};
 assert.equal(question.runs.map(run=>run.text).join(''),question.text);
 const heads=[11,12].map(id=>{
  const item=one(audit.domainSummaries.find(domain=>domain.timelineId==='sprite-162').instances,
   row=>row.characterId===id,`table heading ${id}`);
  const visibleSpans=complete('sprite-162',item.instanceId);
  assert.equal(first(visibleSpans),2);
  return {text:text(id).text,sourceTextId:id,sourceTextInstanceId:item.instanceId,
   sourcePlacementTagSha256:item.sourcePlacementTagSha256,visibleSpans};
 });
 const tableRows=audit.semanticGeometry.tableAtMainFrame58.rows.map((item,index)=>{
  assert.equal(item.row,index+1);
  const input=complete('sprite-162',item.input.instanceId);
  const output=complete('sprite-162',item.output.instanceId);
  const visibleSpans=spans(main.frames.filter(at=>inSpans(input,at.frame)&&inSpans(output,at.frame))
   .map(at=>at.frame));
  assert.equal(first(visibleSpans),2,`table pair ${index+1} source reveal`);
  return {row:item.row,inputText:item.input.text,outputText:item.output.text,
   inputSourceTextId:item.input.characterId,outputSourceTextId:item.output.characterId,
   inputInstanceId:item.input.instanceId,outputInstanceId:item.output.instanceId,
   visibleSpans};
 });
 assert.deepEqual(tableRows.map(row=>[row.inputText,row.outputText]),
  [['2','3'],['3','5'],['5','-2'],['7','1']]);
 const answerOptions=audit.semanticGeometry.answerOptions.map(item=>{
  const label=complete('sprite-162',item.label.instanceId);
  const value=complete('sprite-162',item.value.instanceId);
  const visibleSpans=spans(main.frames.filter(at=>
   inSpans(label,at.frame)&&inSpans(value,at.frame)).map(at=>at.frame));
  assert.equal(first(visibleSpans),7);
  const button=one(audit.buttonDefinitions,definition=>
   definition.characterId===item.sourceButton.characterId,`answer button ${item.option}`);
  assert(row('sprite-162',58,item.sourceButton.instanceId).fullHitByVerifiedFills);
  const valueText=text(item.value.characterId).text;
  assert.equal(item.display,`${item.option}. ${valueText}`);
  return {option:item.option,label:item.option,value:valueText,
   labelSourceTextId:item.label.characterId,valueSourceTextId:item.value.characterId,
   labelInstanceId:item.label.instanceId,valueInstanceId:item.value.instanceId,
   sourceInstance:item.sourceButton.name,sourceButtonInstanceId:item.sourceButton.instanceId,
   buttonId:button.characterId,sourceActionSha256:button.actionSha256,
   sourcePlacementTagSha256:item.sourceButton.sourcePlacementTagSha256,
   visibleSpans,sourceInteractiveFrame:58};
 });
 assert.deepEqual(answerOptions.map(item=>[item.option,item.sourceInstance,item.buttonId]),
  [['A','AnsBtn1',159],['B','AnsBtn2',158],['C','AnsBtn3',159],['D','AnsBtn4',159]]);
 assert.deepEqual(answerOptions.map(item=>[item.option,item.visibleSpans]),
  [['A',[[7,59]]],['B',[[7,172]]],['C',[[7,59]]],['D',[[7,59]]]],
  'source glyph pairs persist independently of removed answer buttons');
 const glossary=audit.semanticGeometry.glossaryControls.map(item=>{
  assert.equal(item.firstFullBlueInkAndHitFrame,7);
  const button=one(audit.buttonDefinitions,definition=>
   definition.characterId===item.sourceButtonCharacterId,`glossary ${item.keyAttribute}`);
  const readyFrames=main.frames.filter(at=>{
   const hit=at.items.find(row=>row.instanceId===item.sourceButtonInstanceId);
   const sentence=at.items.find(row=>row.instanceId===questionInstance.instanceId);
   return Boolean(hit?.fullHitByVerifiedFills&&sentence?.runs?.some(run=>
    run.text===item.blueRun&&run.completeInkVisibleByVerifiedFills));
  }).map(at=>at.frame);
  const availableSpans=spans(readyFrames);
  assert.deepEqual(availableSpans,item.sourceReadyIntervals.map(s=>[s.firstFrame,s.lastFrame]));
  return {key:item.keyAttribute,buttonId:button.characterId,
   sourceButtonInstanceId:item.sourceButtonInstanceId,
   sourceActionSha256:button.actionSha256,
   sourcePlacementTagSha256:item.sourceButtonPlacementTagSha256,
   sourceLabelTextId:5,blueRun:item.blueRun,
   firstCandidateFrame:item.firstFullBlueInkAndHitFrame,availableSpans};
 });
 assert.deepEqual(glossary.map(item=>item.key),['Input','Function','Output']);
 const titleSources=[
  {domain:65,kind:'wrong',textId:37,title:'OH! NO'},
  {domain:94,kind:'wrong',textId:84,title:'incorrect!'},
  {domain:80,kind:'wrong',textId:71,title:'Try Again!'},
  {domain:157,kind:'right',textId:152,title:'Correct!'},
  {domain:128,kind:'right',textId:126,title:'Well done!'},
  {domain:108,kind:'right',textId:101,title:'Excellent!'},
  {domain:141,kind:'right',textId:135,title:'Great Job!'},
 ];
 const ackByDomain=new Map([[65,{popup:64,buttonId:60,fieldId:63,hold:23}],
  [94,{popup:91,buttonId:89,fieldId:90,hold:20}],
  [80,{popup:76,buttonId:74,fieldId:75,hold:21}]]);
 const feedbackDomains=titleSources.map(spec=>{
  const domain=`sprite-${spec.domain}`;
  assert.equal(text(spec.textId).text,spec.title);
  const sourceDomain=one(audit.domainSummaries,item=>item.timelineId===domain,domain);
  const titleInstance=sourceDomain.instances.filter(item=>item.characterId===spec.textId)
   .sort((a,b)=>b.lastActiveFrame-a.lastActiveFrame||b.firstPlacementFrame-a.firstPlacementFrame)[0];
  assert(titleInstance);
  const titleVisibleSpans=complete(domain,titleInstance.instanceId);
  assert(titleVisibleSpans.length>0);
  const ack=ackByDomain.get(spec.domain);
  let acknowledgment=null,fieldId=null,dynamicVisibleSpans=[];
  if(ack){
   const mount=one(audit.semanticGeometry.feedbackPopupMounts,
    item=>item.parentDomain===domain&&item.childDomain===`sprite-${ack.popup}`,
    `popup mount ${domain}`);
   assert.equal(mount.firstParentFullAlphaFrame,ack.hold);
   fieldId=ack.fieldId;
   const definition=text(fieldId);
   assert.equal(definition.kind,'dynamic-field');assert.equal(definition.variableName,'');
   assert.equal(definition.initialText,null);assert.equal(definition.runtimeValueResolved,false);
   dynamicVisibleSpans=[[ack.hold,ack.hold]];
   const button=one(audit.buttonDefinitions,item=>item.characterId===ack.buttonId,
    `popup Close ${ack.buttonId}`);
   acknowledgment={popupSpriteId:ack.popup,buttonId:ack.buttonId,
    label:'Close',labelTextId:55,actionSha256:button.actionSha256,
    popupMountInstanceId:mount.instanceId,firstFullAlphaFrame:ack.hold,
    holdFrame:ack.hold};
  }
  return {domain:spec.domain,kind:spec.kind,title:spec.title,textId:spec.textId,
   sourceTitleInstanceId:titleInstance.instanceId,
   titleSemanticFrame:first(titleVisibleSpans),titleVisibleSpans,
   frameCount:domains.get(domain).frameCount,fieldId,dynamicVisibleSpans,
   acknowledgment};
 });
 assert.deepEqual(feedbackDomains.map(item=>[item.domain,item.titleSemanticFrame]),
  [[65,16],[94,6],[80,9],[157,12],[128,15],[108,15],[141,12]]);
 const wrongScript=one(audit.buttonSourceScripts,item=>item.characterId===159,'wrong action');
 const wrongStrings=[...wrongScript.sourceText.matchAll(/_global\.WrongFeed = "([^"]+)"/gu)]
  .map(([,value])=>value);
 assert.deepEqual(wrongStrings,[
  'Find 5 in the input column. Then look across for its output value.',
  'Find 5 in the input column. Then look across for its output value. Try again.']);
 assert.equal(text(55).text,'Close');
 return {schemaVersion:1,animationId:'shared-alg001-l06-p020',
  sourceSwfSha256:SWF_SHA,source:{path:SWF,bytes:swf.length,sha256:SWF_SHA},
  inputs:[auditPin,framePin],stage:{width:800,height:600},fps:12,
  rootEntryFrame:6,frameDomain:'sprite-162',frameCount:172,question,
  table:{headings:heads,rows:tableRows},options:answerOptions,
  glossaryControls:glossary,feedback:{domains:feedbackDomains,wrongStrings},
  policy:{canvasGlyphs:'preserved',nativeRole:'semantic-reading-companion',
   language:'source-en-fallback',question:'full-source-glyph-ink-and-alpha-frame7',
   table:'source-heading-and-pair-ink-geometry',
   answer:'source-glyph-pair-visibility-independent-of-button; interactive-only-at-main58-plus-state-gate',
   glossary:'exact-blue-run-within-full-hit-and-source-key',
   feedback:'branch-local-stable-full-title; dynamic-only-at-full-alpha-wrong-popup-hold',
   originalRuntimeAccepted:false}};
}
const RUNTIME=String.raw`
export type P020GlossaryKey='Input'|'Function'|'Output';
export type P020Option='A'|'B'|'C'|'D';
type Span=[number,number];
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 source:{path:string;bytes:number;sha256:string};inputs:Array<{path:string;bytes:number;sha256:string}>;
 stage:{width:number;height:number};fps:number;rootEntryFrame:number;frameDomain:string;
 frameCount:number;question:{text:string;sourceTextId:number;sourceTextInstanceId:string;
 definitionTagSha256:string;sourcePlacementTagSha256:string;visibleSpans:Span[];
 runs:Array<{text:string;colorRgba:number[]}>;
 blueRuns:Array<{text:string;colorRgba:number[];visibleSpans:Span[]}>};
 table:{headings:Array<{text:string;sourceTextId:number;sourceTextInstanceId:string;
 sourcePlacementTagSha256:string;visibleSpans:Span[]}>;
 rows:Array<{row:number;inputText:string;outputText:string;inputSourceTextId:number;
 outputSourceTextId:number;inputInstanceId:string;outputInstanceId:string;visibleSpans:Span[]}>};
 options:Array<{option:P020Option;label:string;value:string;labelSourceTextId:number;
 valueSourceTextId:number;labelInstanceId:string;valueInstanceId:string;sourceInstance:string;
 sourceButtonInstanceId:string;buttonId:number;sourceActionSha256:string;
 sourcePlacementTagSha256:string;visibleSpans:Span[];sourceInteractiveFrame:number}>;
 glossaryControls:Array<{key:P020GlossaryKey;buttonId:number;sourceButtonInstanceId:string;
 sourceActionSha256:string;sourcePlacementTagSha256:string;sourceLabelTextId:number;
 blueRun:string;firstCandidateFrame:number;availableSpans:Span[]}>;
 feedback:{domains:Array<{domain:number;kind:'right'|'wrong';title:string;textId:number;
 sourceTitleInstanceId:string;titleSemanticFrame:number;titleVisibleSpans:Span[];
 frameCount:number;fieldId:number|null;dynamicVisibleSpans:Span[];
 acknowledgment:null|{popupSpriteId:number;buttonId:number;label:string;labelTextId:number;
 actionSha256:string;popupMountInstanceId:string;firstFullAlphaFrame:number;holdFrame:number}}>;
 wrongStrings:string[]};policy:{canvasGlyphs:string;nativeRole:string;language:string;
 question:string;table:string;answer:string;glossary:string;feedback:string;
 originalRuntimeAccepted:boolean}};
function inSpans(spans:Span[],frame:number){return spans.some(([from,to])=>frame>=from&&frame<=to);}
export function p020TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P020_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P020_TEXT_FRAME_OUT_OF_RANGE');
 const source=P020_TEXT_STATE_SOURCE;
 return {animationId:source.animationId,frameDomain:source.frameDomain,frame,
  question:{...source.question,visible:inSpans(source.question.visibleSpans,frame)},
  table:{headings:source.table.headings.map(item=>({...item,visible:inSpans(item.visibleSpans,frame)})),
   rows:source.table.rows.map(item=>({...item,visible:inSpans(item.visibleSpans,frame)}))},
  options:source.options.map(item=>({...item,visible:inSpans(item.visibleSpans,frame)})),
  glossaryControls:source.glossaryControls.map(item=>({...item,
   available:inSpans(item.availableSpans,frame)})),feedback:source.feedback};
}
`;
const mode=process.argv[2];assert(['--write','--check'].includes(mode),'--write | --check');
const source=sourceState();
const generated=`/* Generated by scripts/build-alg-l06-p020-text-state-v1.mjs; do not edit. */\n${RUNTIME}\nexport const P020_TEXT_STATE_SOURCE:Source=${JSON.stringify(source,null,2)};\n`;
for(const [relative,body] of [[GENERATED,generated],[REPORT,json(source)]]){
 const target=path.join(ROOT,relative);
 if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);}
 else assert.equal(fs.readFileSync(target,'utf8'),body,`generated drift ${relative}`);
}
console.log(JSON.stringify({status:mode==='--check'?'verified':'written',
 generated:pin(GENERATED),report:pin(REPORT),glossary:source.glossaryControls.map(item=>
  [item.key,item.firstCandidateFrame]),options:source.options.map(item=>
  [item.option,item.value,item.sourceInstance,item.buttonId])}));
