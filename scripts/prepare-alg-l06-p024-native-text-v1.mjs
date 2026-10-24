#!/usr/bin/env node
/** P024 source text inventory and conservative native reading-state producer. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF={path:'G6-G8-shared/ALG001/L6/VB/L6VB17.swf',bytes:462836,
 sha256:'e36c6c293f1e620f82fa84d57a1b91fd0a977d24d365772126f87333ce359d05'};
const INTAKE={path:'output/alg-l06-p024-intake-recon-v1/intake-recon-v1.json',bytes:45225,
 sha256:'37db86c5cff44619f5a5e8f681a24dc55040447d0ec51127b92af071a8df4882'};
const BEHAVIOR={path:'output/alg-l06-p024-behavior-audit-v1/behavior-audit-v1.json',bytes:47090,
 sha256:'ea5f12623231299c2c8b310db63732e86a3eae88037b0467db624c9925fd49f8'};
const SCOPE={path:'output/alg-l06-p024-button-scope-review-v1/button-scope-review-v1.json',
 bytes:14500,sha256:'b3f10e3093a2b9559be355d7f5cb6dd9d021229ba8697896bb18a272b366cc18'};
const XML={path:'output/alg-l06-p024-intake-recon-v1/source.xml',bytes:1951400,
 sha256:'b675b6466ca678e1ab3d7693ce2c60c91e1939d1f802075d9b41a5a198c6d013'};
const REPORT='output/alg-l06-p024-native-text-v1/text-state-source-v1.json';
const MODULE='packages/demos/src/alg-l06-p024-native-text-v1.ts';
const DOMAINS=['sprite-208','sprite-69','sprite-83','sprite-97','sprite-123',
 'sprite-155','sprite-188','sprite-196','sprite-65','sprite-80','sprite-94'];
const ANSWER_IDS=new Set([20,21,23,24,26,27,29,30]);
const sha=value=>createHash('sha256').update(value).digest('hex');
const asJson=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha(bytes)});
function read(file,expected){
 assert.equal(fs.realpathSync(file),file,`physical file: ${file}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n&&
  before.size<32n*1024n*1024n,`ordinary bounded file: ${file}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable read: ${file}`);
 if(expected){assert.equal(bytes.length,expected.bytes);assert.equal(sha(bytes),expected.sha256);}
 return bytes;
}
function spans(values){const result=[];for(let i=0;i<values.length;i++)if(values[i]){
 const first=i+1;while(i+1<values.length&&values[i+1])i++;result.push([first,i+1]);
}return result;}
function opacity(timeline,instance){
 const changes=new Map(timeline.events.filter(event=>instance.updates.includes(event.eventId))
  .map(event=>[event.frame,event]));
 let alpha=256;const nonzero=[],full=[];
 for(let frame=1;frame<=timeline.declaredFrameCount;frame++){
  const event=changes.get(frame);
  if(event?.colorTransform){const transform=event.colorTransform;
   alpha=(transform.multiply[3]??256)+(transform.add[3]??0);}
  const active=frame>=instance.firstFrame&&frame<instance.lastFrameExclusive;
  nonzero.push(active&&alpha>0);full.push(active&&alpha>=256);
 }
 return {nonzeroAlphaSpans:spans(nonzero),fullAlphaSpans:spans(full)};
}
function output(relative,data,mode){
 const absolute=path.join(ROOT,relative);
 if(mode==='--write'){
  fs.mkdirSync(path.dirname(absolute),{recursive:true});
  try{fs.writeFileSync(absolute,data,{flag:'wx'});}catch(error){
   if(error?.code!=='EEXIST')throw error;
   assert(read(absolute).equals(data),`no-replace output: ${relative}`);}
 }else if(mode==='--check')assert(read(absolute).equals(data),`output drift: ${relative}`);
 return pin(relative,data);
}
const sourceText=definition=>definition.runs?.map(run=>run.text).join('')??null;
function moduleSource(report){
 const runtime=`
export type P024TextDomainId=typeof P024_NATIVE_TEXT_SOURCE.domains[number];
export type P024GlossaryKey=typeof P024_NATIVE_TEXT_SOURCE.glossary[number]['key'];
export type P024AnswerLabel=typeof P024_NATIVE_TEXT_SOURCE.answers[number]['label'];
type StateOptions={quizActive?:boolean;wrongAnswerButtonId?:198|199;quizTryCount?:0|1};
function inSpans(spans:readonly (readonly [number,number])[],frame:number){
 return spans.some(([first,last])=>first<=frame&&frame<=last);
}
/** Exact authored WrongFeed strings, selected by an explicit quiz state. */
export function p024WrongFeedbackMessage(buttonId:198|199,quizTryCount:0|1){
 const row=P024_NATIVE_TEXT_SOURCE.wrongFeedbackMessages.find(x=>x.buttonCharacterId===buttonId);
 if(!row)throw Error('P024_WRONG_BUTTON_INVALID');
 return quizTryCount===1?row.afterFirstWrong:row.firstWrong;
}
/** Conservative source text candidate: masked ink and hit readiness remain unresolved. */
export function p024NativeTextState(domainId:P024TextDomainId,frame:number,
 options:StateOptions={}){
 const domain=P024_NATIVE_TEXT_SOURCE.frameDomains.find(x=>x.id===domainId);
 if(!domain||!Number.isSafeInteger(frame)||frame<1||frame>domain.frames)
  throw new RangeError('P024_TEXT_FRAME_OUT_OF_RANGE');
 const visibleText=P024_NATIVE_TEXT_SOURCE.textInstances.filter(item=>
  item.domainId===domainId&&item.kind==='static-text'&&
  inSpans(item.unmaskedFullAlphaSpans,frame)&&
  (!item.answerOption||domainId!=='sprite-208'||
   (options.quizActive===true&&frame===154)));
 const available=new Set(visibleText.map(item=>item.instanceId));
 const table=P024_NATIVE_TEXT_SOURCE.table;
 const tableTextCandidateReady=domainId==='sprite-208'&&table.sourceOrder.every(row=>
  available.has(row.inputInstanceId)&&available.has(row.outputInstanceId))&&
  table.headers.every(id=>available.has(id));
 const answers=domainId==='sprite-208'&&options.quizActive===true&&frame===154?
  P024_NATIVE_TEXT_SOURCE.answers.filter(row=>available.has(row.labelInstanceId)&&
   available.has(row.valueInstanceId)):[];
 const dynamicText=options.wrongAnswerButtonId&&options.quizTryCount!==undefined&&
  ['sprite-65','sprite-80','sprite-94'].includes(domainId)?
  p024WrongFeedbackMessage(options.wrongAnswerButtonId,options.quizTryCount):null;
 return {domainId,frame,visibleText,table:{textCandidateReady:tableTextCandidateReady,
  geometryReady:false,available:false,headers:table.headers,rows:table.sourceOrder},
  answers,dynamicText,
  glossary:P024_NATIVE_TEXT_SOURCE.glossary.map(row=>({...row,
   candidateAlphaReady:domainId==='sprite-208'&&row.candidateAlphaReadyFrame!==null&&
    frame>=row.candidateAlphaReadyFrame,
   interactionReady:false})),
  maskedFullInkUnproved:P024_NATIVE_TEXT_SOURCE.masks.some(mask=>
   mask.domainId===domainId&&frame>=mask.firstFrame&&frame<mask.lastFrameExclusive)};
}
`;
 return Buffer.from(`/* Generated from physical P024 SWF by scripts/prepare-alg-l06-p024-native-text-v1.mjs. */\n`+
  `export const P024_NATIVE_TEXT_SOURCE=${JSON.stringify(report,null,2)} as const;\n`+runtime);
}

export function build(swf,intakeBytes,behaviorBytes,scopeBytes,xmlBytes,scriptBytes){
 assert.equal(swf.length,SWF.bytes);assert.equal(sha(swf),SWF.sha256);
 assert.equal(sha(intakeBytes),INTAKE.sha256);
 assert.equal(sha(behaviorBytes),BEHAVIOR.sha256);
 assert.equal(sha(scopeBytes),SCOPE.sha256);
 assert.equal(xmlBytes.length,XML.bytes);assert.equal(sha(xmlBytes),XML.sha256);
 const intake=JSON.parse(intakeBytes),behavior=JSON.parse(behaviorBytes),
  scope=JSON.parse(scopeBytes),catalog=collectSwfTextSourceCatalog(swf);
 assert.deepEqual(intake.source.swf,SWF);
 assert.deepEqual(intake.source.extractedXml,XML);
 assert.equal((xmlBytes.toString().match(/<DefineText objectID=/g)??[]).length,40);
 assert.equal((xmlBytes.toString().match(/<DefineEditText objectID=/g)??[]).length,3);
 assert.deepEqual(behavior.sourcePins.swf,SWF);
 assert.equal(scope.kind,'alg-l06-p024-avm1-button-scope-forensic-review-v1');
 assert.equal(scope.animationId,'shared-alg001-l06-p024');
 assert.deepEqual([catalog.summary.staticTextDefinitions,catalog.summary.dynamicFields,
  catalog.summary.decodedRuns,catalog.summary.unresolvedRuns],[40,3,54,0]);
 const defs=new Map(catalog.textDefinitions.map(def=>[def.characterId,def]));
 assert.equal(defs.size,43);
 const timelineMap=new Map(catalog.timelines.map(t=>[t.timelineId,t]));
 const frameDomains=DOMAINS.map(id=>({id,frames:timelineMap.get(id)?.declaredFrameCount}));
 assert(frameDomains.every(row=>Number.isSafeInteger(row.frames)));
 assert.deepEqual([frameDomains[0].frames,frameDomains.slice(1,8).map(row=>row.frames)],
  [381,[31,29,28,31,25,27,27]]);
 const masks=[];
 for(const id of DOMAINS){const timeline=timelineMap.get(id);
  for(const event of timeline.events.filter(event=>event.clipDepth)){
   const instance=timeline.instances.find(item=>item.instanceId===event.instanceId);
   assert(instance);
   masks.push({domainId:id,instanceId:instance.instanceId,characterId:instance.characterId,
    depth:event.depth,clipDepth:event.clipDepth,
    firstFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive,
    sourceTagSha256:event.sourceTagSha256});
  }
 }
 assert.deepEqual(masks.map(row=>[row.domainId,row.firstFrame,row.depth,row.clipDepth]),
  [['sprite-208',67,11,18],['sprite-208',124,19,24],['sprite-123',2,1,7]]);
 const textInstances=[];
 for(const id of DOMAINS){const timeline=timelineMap.get(id);
  for(const instance of timeline.instances){const definition=defs.get(instance.characterId);
   if(!definition)continue;
   const created=timeline.events.find(event=>event.eventId===instance.createdByEventId);
   assert(created&&created.characterId===instance.characterId);
   const alpha=opacity(timeline,instance),maskDependencies=masks.filter(mask=>
    mask.domainId===id&&mask.depth<instance.depth&&instance.depth<=mask.clipDepth&&
    mask.firstFrame<instance.lastFrameExclusive&&mask.lastFrameExclusive>instance.firstFrame)
    .map(mask=>mask.instanceId);
   const unmaskedFullAlphaSpans=maskDependencies.length||definition.kind==='dynamic-field'?[]:
    alpha.fullAlphaSpans;
   textInstances.push({domainId:id,instanceId:instance.instanceId,
    sourceTextId:instance.characterId,kind:definition.kind,text:sourceText(definition),
    depth:instance.depth,firstPlacementFrame:instance.firstFrame,
    lastFrameExclusive:instance.lastFrameExclusive,
    sourcePlacementTagSha256:created.sourceTagSha256,
    ...alpha,maskDependencies,unmaskedFullAlphaSpans,
    answerOption:id==='sprite-208'&&ANSWER_IDS.has(instance.characterId)});
  }
 }
 assert.equal(textInstances.length,77);
 const textDefinitions=catalog.textDefinitions.map(def=>({sourceTextId:def.characterId,
  kind:def.kind,text:sourceText(def),sourceTagSha256:def.sourceTagSha256,
  boundsTwips:def.boundsTwips,
  runs:def.runs?.map(run=>({text:run.text,colorRgba:run.colorRgba,
   decodeStatus:run.decodeStatus}))??[],
  ...(def.kind==='dynamic-field'?{initialText:def.initialText,
   variableName:def.variableName.text}:{} )}));
 const getInstance=(id,characterId)=>{const item=textInstances.find(row=>
  row.instanceId===id&&row.sourceTextId===characterId);assert(item,`text ${id}`);return item;};
 const main=behavior.question;
 assert.equal(main.prompt,sourceText(defs.get(41)));
 const answers=main.answers.map(row=>{
  assert.equal(sourceText(defs.get(row.labelCharacterId)),row.label);
  assert.equal(sourceText(defs.get(row.valueCharacterId)),row.value);
  const label=getInstance(row.labelInstanceId,row.labelCharacterId),
   value=getInstance(row.valueInstanceId,row.valueCharacterId);
  return {label:row.label,value:row.value,verdict:row.verdict,
   buttonCharacterId:row.buttonCharacterId,buttonInstanceId:row.buttonInstanceId,
   buttonDepth:row.buttonDepth,buttonYTwips:row.buttonYTwips,
   labelInstanceId:label.instanceId,valueInstanceId:value.instanceId,
   labelCharacterId:label.sourceTextId,valueCharacterId:value.sourceTextId,
   sourceActionSha256:row.sourceAction.sha256};
 });
 assert.deepEqual(answers.map(row=>[row.label,row.value,row.buttonDepth,row.verdict]),
  [['A','{0, 10, 100}',145,'wrong'],['B','0, 10, 100',149,'wrong'],
   ['C','{–1, 0, 1}  ',143,'right'],['D','–1, 0, 1',147,'wrong']]);
 const tableRows=main.table.rows.map(row=>({input:row.input,output:row.output,
  inputInstanceId:getInstance(row.inputInstanceId,row.inputCharacterId).instanceId,
  outputInstanceId:getInstance(row.outputInstanceId,row.outputCharacterId).instanceId,
  yTwips:row.yTwips}));
 assert.deepEqual(tableRows.map(row=>[row.input,row.output]),
  [['1','–1'],['10','0'],['100','1']]);
 const table={headers:[getInstance('sprite-208/depth-27/generation-1',12).instanceId,
  getInstance('sprite-208/depth-28/generation-1',13).instanceId],
  sourceOrder:tableRows};
 const getBlue=(def,segment)=>def.runs?.find(run=>run.text===segment&&
  run.colorRgba.join(',')==='0,0,204,255');
 const glossary=behavior.glossary.map(row=>{
  const labelId=row.key==='Function table'?37:5,
   segment=row.key==='Output'?'outputs':row.key==='Function table'?'function table':
    row.key.toLowerCase(),definition=defs.get(labelId),blue=getBlue(definition,segment);
  assert(blue,`source blue label: ${row.key}`);
  const label=textInstances.find(item=>item.domainId==='sprite-208'&&
   item.sourceTextId===labelId&&item.depth===(labelId===5?2:13));
  assert(label);
  const button=timelineMap.get('sprite-208').instances.find(item=>
   item.instanceId===row.buttonInstanceId&&item.characterId===row.buttonCharacterId);
  assert(button);const buttonAlpha=opacity(timelineMap.get('sprite-208'),button);
  const masked=masks.some(mask=>mask.domainId==='sprite-208'&&
   mask.depth<button.depth&&button.depth<=mask.clipDepth);
  const candidateAlphaReadyFrame=masked?null:Math.max(buttonAlpha.fullAlphaSpans[0]?.[0]??Infinity,
   label.fullAlphaSpans[0]?.[0]??Infinity);
  assert(masked||Number.isFinite(candidateAlphaReadyFrame));
  return {key:row.key,buttonCharacterId:row.buttonCharacterId,
   buttonInstanceId:row.buttonInstanceId,labelInstanceId:label.instanceId,
   labelCharacterId:labelId,labelBlueSegment:segment,
   sourcePlacementFrame:row.sourcePlacementFrame,
   firstNonzeroAlphaFrame:row.firstNonzeroAlphaFrame,
   buttonFullAlphaSpans:buttonAlpha.fullAlphaSpans,
   labelFullAlphaSpans:label.fullAlphaSpans,
   candidateAlphaReadyFrame,masked,sourceActionSha256:row.sourceAction.sha256,
   sourcePlacementTagSha256:row.sourcePlacementTagSha256,
   hitInkReadinessVerified:false,interactionAvailable:false};
 });
 assert.deepEqual(glossary.map(row=>[row.key,row.candidateAlphaReadyFrame]),
  [['Range',7],['Function',7],['Output',7],['Set',7],['Function table',null]]);
 const script198=read(path.join(ROOT,'output/alg-l06-p024-intake-recon-v1/source-export/scripts/DefineButton2_198/BUTTONCONDACTION on(release).as')),
  script199=read(path.join(ROOT,'output/alg-l06-p024-intake-recon-v1/source-export/scripts/DefineButton2_199/BUTTONCONDACTION on(release).as'));
 assert.equal(sha(script198),main.answers[0].sourceAction.sha256);
 assert.equal(sha(script199),main.answers[3].sourceAction.sha256);
 const messages=[{buttonCharacterId:198,script:script198},{buttonCharacterId:199,script:script199}]
  .map(({buttonCharacterId,script})=>{const values=[...script.toString().matchAll(/_global\.WrongFeed = "([^"]+)"/g)]
   .map(match=>match[1]);assert.equal(values.length,2);
   return {buttonCharacterId,afterFirstWrong:values[0],firstWrong:values[1]};});
 const relevantScripts=[198,199].flatMap(id=>['source-export','source-pcode'].map(kind=>
  `output/alg-l06-p024-intake-recon-v1/${kind}/scripts/DefineButton2_${id}/BUTTONCONDACTION on(release).${kind==='source-export'?'as':'pcode'}`));
 for(const id of [65,80,94]){
  const domain=`sprite-${id}`,field=textInstances.find(row=>row.domainId===domain&&
   row.kind==='dynamic-field');assert(field);
  const action=read(path.join(ROOT,
   `output/alg-l06-p024-intake-recon-v1/source-export/scripts/DefineSprite_${id}/frame_1/DoAction.as`));
  assert.equal(action.toString(),'txtFeed.text = _global.WrongFeed;\r\n');
  relevantScripts.push(...['source-export','source-pcode'].map(kind=>
   `output/alg-l06-p024-intake-recon-v1/${kind}/scripts/DefineSprite_${id}/frame_1/DoAction.${kind==='source-export'?'as':'pcode'}`));
 }
 const scriptPins=relevantScripts.map(relative=>{
  const expected=[...intake.source.sourceExports,...intake.source.sourcePcode]
   .find(item=>item.path===relative);assert(expected,`source AS/P-code ${relative}`);
  const value=read(path.join(ROOT,relative),expected);return pin(relative,value);
 });
 const report={schemaVersion:1,kind:'alg-l06-p024-native-text-source-v1',
  animationId:'shared-alg001-l06-p024',source:{...SWF,root:SOURCE_ROOT},
  inputs:[pin(INTAKE.path,intakeBytes),pin(XML.path,xmlBytes),
   ...scriptPins,pin(BEHAVIOR.path,behaviorBytes),
   pin(SCOPE.path,scopeBytes),pin('scripts/prepare-alg-l06-p024-native-text-v1.mjs',scriptBytes)],
  inventory:{staticTextDefinitions:40,dynamicFields:3,decodedRuns:54,
   textInstances:textInstances.length,mainAndFeedbackDomains:8,popupDomains:3},
  domains:DOMAINS,frameDomains,textDefinitions,textInstances,masks,
  reading:{definitionInstanceId:getInstance('sprite-208/depth-2/generation-1',5).instanceId,
   definitionText:sourceText(defs.get(5)),
   table,tableTextCandidateFirstFrame:7,tableGeometryVerified:false,
   questionInstanceId:getInstance('sprite-208/depth-21/generation-1',41).instanceId,
   questionText:main.prompt,answerRevealGate:{mainFrame:154,quizActiveRequired:true,
    answerTextFullAlphaEarlierThanQuiz:true,reason:'quiz buttons are placed at main frame 154'}},
  table,answers,glossary,wrongFeedbackMessages:messages,
  policy:{nativeRole:'source-timed-reflow-reading-companion',canvasGlyphs:'preserved',
   language:'source-en-fallback',translatedSpanishSourceAbsent:true,
   masksRequireFullInkAudit:true,tableGeometryVerified:false,
   glossaryHitInkReadinessVerified:false,
   answerBeforeQuiz:false,sourceRuffleButtonScopeQualified:true,
   originalRuntimeObserved:false,visualFidelityAccepted:false,
   humanAccepted:false,ownerAccepted:false}};
 const reportBytes=asJson(report),moduleBytes=moduleSource(report);
 return {report,outputs:[[REPORT,reportBytes],[MODULE,moduleBytes]]};
}
export function run(mode){
 assert(['--plan','--write','--check'].includes(mode),'use --plan, --write or --check');
 const swf=read(path.join(SOURCE_ROOT,SWF.path),SWF),
  intake=read(path.join(ROOT,INTAKE.path),INTAKE),
  behavior=read(path.join(ROOT,BEHAVIOR.path),BEHAVIOR),
  scope=read(path.join(ROOT,SCOPE.path),SCOPE),
  xml=read(path.join(ROOT,XML.path),XML),
  script=read(fileURLToPath(import.meta.url));
 const {report,outputs}=build(swf,intake,behavior,scope,xml,script);
 return {mode,outputs:outputs.map(([relative,data])=>output(relative,data,mode)),
  inventory:report.inventory,glossary:report.glossary.map(row=>
   [row.key,row.candidateAlphaReadyFrame]),browserObserved:false,
  originalRuntimeObserved:false,translatedSpanishSourceAbsent:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3);console.log(JSON.stringify(run(process.argv[2]),null,2));
}
