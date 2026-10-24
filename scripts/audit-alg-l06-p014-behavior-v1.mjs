#!/usr/bin/env node
/** Reproducible static behavior audit. No original Flash execution is inferred. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,sha256} from '../lib/g678-admission-proof.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const HOST_ROOT='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1';
const OUTPUT='migrations/shared-alg001-l06-p014/audit/behavior-v1/source-behavior-audit-v1.json';
const SOURCE={path:'G6-G8-shared/ALG001/L6/VB/L6VB05.swf',bytes:566603,
 sha256:'aed0f7755d4f691cefcc28c815acc6b9d083fdfaae88ff385f22d3b32ba07603'};
const LESSON_XML={path:'G6-G8-shared/ALG001/L6/index.xml',bytes:13926,
 sha256:'9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'};
const DISCOVERY={path:'output/alg-l06-p014-discovery-v1/discovery-v1.json',bytes:25117,
 sha256:'b23e6ba4d79a996dff73b43112f4caf9d67b91d67a9cd4a680ac386c2d4901f8'};
const SWFMILL={path:'output/alg-l06-p014-discovery-v1/swfmill.xml',bytes:2253076,
 sha256:'f11d7ce25eb3701f3ed5ab8d58562c31be468bd7a18e1e5bf34ea09972268f10'};
const HOST_SOURCE={path:'source.swf',bytes:689006,
 sha256:'275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9'};
const HOST_EXTRACTION={path:'extraction.json',bytes:19619,
 sha256:'4f4daa77ce7a369b6635a28a3c1f0411d12c57358905a9b8c016510d9cbc7e0c'};
const HOST_SCRIPT={path:'scripts/scripts/frame_35/DoAction.as',bytes:104008,
 sha256:'380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74'};
const SCRIPT_ROOT='output/alg-l06-p014-discovery-v1/ffdec-scripts/scripts';
const ACTIONS=Object.freeze({
 mainHold:['DefineSprite_227/frame_120/DoAction.as',65,'1c5ee973c2576fdd6e33a3a2cf1acd334b9fddb906b45d7b2e4d0a7874fd546f'],
 correct:['DefineButton2_213/BUTTONCONDACTION on(release).as',75,'91fddc130bddd9456227b9bbd9139c44ebcf7e51db046176f2f810e5e073db02'],
 wrong:['DefineButton2_214/BUTTONCONDACTION on(release).as',397,'8ee989ffcb4d65a60007efe9d59cf6c889538cd1014cee3b764506514337ba3a'],
 input:['DefineButton2_32/BUTTONCONDACTION on(release).as',120,'fc18c1b076872ddbff22a6de05a0929210cfcb8d065a27a37c654e3eb33c496a'],
 output:['DefineButton2_33/BUTTONCONDACTION on(release).as',121,'573534c3578af9119df87b9a8e2c4751ca88e451a2e1dde1896a9ad77acd746e'],
 right83:['DefineSprite_83/frame_31/DoAction.as',106,'5bc24178f890e478f8b0dc8085e80c07a74ae6e4f721ee01452daf12efe70911'],
 right115:['DefineSprite_115/frame_25/DoAction.as',106,'5bc24178f890e478f8b0dc8085e80c07a74ae6e4f721ee01452daf12efe70911'],
 right148:['DefineSprite_148/frame_27/DoAction.as',106,'5bc24178f890e478f8b0dc8085e80c07a74ae6e4f721ee01452daf12efe70911'],
 right156:['DefineSprite_156/frame_27/DoAction.as',106,'5bc24178f890e478f8b0dc8085e80c07a74ae6e4f721ee01452daf12efe70911'],
 wrong28:['DefineSprite_28/frame_28/DoAction.as',235,'806e16c9b17ac8872b22282973f851e58129094f13d83e56f7b0098102b908ce'],
 wrong173:['DefineSprite_173/frame_31/DoAction.as',235,'806e16c9b17ac8872b22282973f851e58129094f13d83e56f7b0098102b908ce'],
 wrong187:['DefineSprite_187/frame_29/DoAction.as',235,'806e16c9b17ac8872b22282973f851e58129094f13d83e56f7b0098102b908ce'],
 wrongHold28:['DefineSprite_28/frame_20/DoAction.as',9,'3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655'],
 wrongHold173:['DefineSprite_173/frame_22/DoAction.as',9,'3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655'],
 wrongHold187:['DefineSprite_187/frame_23/DoAction.as',9,'3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655'],
 wrongAck28:['DefineButton2_21/BUTTONCONDACTION on(release).as',141,'3fe79f85ee919b2d07dc6e3ea32f67fe78ab058772ea4197375d1063d7be8a7c'],
 wrongAck173:['DefineButton2_167/BUTTONCONDACTION on(release).as',141,'4057c3c6552def15f1e846f96fbf4df07b5166f278dad82eec3eea19b09b3394'],
 wrongAck187:['DefineButton2_182/BUTTONCONDACTION on(release).as',141,'05d0d4cada21c5184875b38ea202d5eece7fee9a04fa96284868fd2f1338772d'],
});
const RIGHT=[{ordinal:1,domain:'sprite-115',terminalFrame:25},
 {ordinal:2,domain:'sprite-156',terminalFrame:27},
 {ordinal:3,domain:'sprite-83',terminalFrame:31},
 {ordinal:4,domain:'sprite-148',terminalFrame:27}];
const WRONG=[{ordinal:1,domain:'sprite-173',holdFrame:22,resumeFrame:23,
  ackButtonCharacterId:167,terminalFrame:31},
 {ordinal:2,domain:'sprite-187',holdFrame:23,resumeFrame:24,
  ackButtonCharacterId:182,terminalFrame:29},
 {ordinal:3,domain:'sprite-28',holdFrame:20,resumeFrame:21,
  ackButtonCharacterId:21,terminalFrame:28}];
const OPTION_INSTANCES=[{instance:'AnsBtn1',characterId:214,depth:135,handler:'wrong'},
 {instance:'AnsBtn2',characterId:213,depth:133,handler:'right'},
 {instance:'AnsBtn3',characterId:214,depth:139,handler:'wrong'},
 {instance:'AnsBtn4',characterId:214,depth:137,handler:'wrong'}];
const exact=(root,pin)=>{assert.deepEqual(pinFile(root,pin.path),pin,`exact source: ${pin.path}`);return readPin(root,pin);};
function functionBody(script,name){
 const start=script.indexOf(`function ${name}()`);assert(start>=0,`host function ${name}`);
 const open=script.indexOf('{',start);let depth=0;
 for(let i=open;i<script.length;i++){
  if(script[i]==='{')depth++;
  else if(script[i]==='}'&&--depth===0)return script.slice(open+1,i);
 }
 throw Error(`unterminated host function ${name}`);
}
const compact=text=>text.replace(/\s+/gu,'');
function verifyHostApis(script){
 const right=compact(functionBody(script,'showRightFeed'));
 const wrong=compact(functionBody(script,'showWrongFeed'));
 const disable=compact(functionBody(script,'disableQuizButton'));
 const enable=compact(functionBody(script,'enableQuizButton'));
 for(const [value,parts] of [
  [right,['random(4)','Mc_Right_Feed','gotoAndPlay(2)','._visible=true','._x=5']],
  [wrong,['random(3)','Mc_Wrong_Feed','gotoAndPlay(2)','._visible=true','._x=5']],
  [disable,['while(i<=25)','AnsBtn','enabled=false','._visible=false','NMHBtn.enabled=false']],
  [enable,['while(i<=25)','AnsBtn','enabled=true','._visible=true','NMHBtn.enabled=true']],
 ])for(const part of parts)assert(value.includes(part),`old host effect ${part}`);
 return {showRightFeed:{selector:'random(4)+1',targets:RIGHT.map(x=>x.domain),
   action:'show selected Mc_Right_FeedN at x=5 and gotoAndPlay(2)'},
  showWrongFeed:{selector:'random(3)+1',targets:WRONG.map(x=>x.domain),
   action:'show selected Mc_Wrong_FeedN at x=5 and gotoAndPlay(2)'},
  disableQuizButton:{target:'AnsBtn1..25',enabled:false,visible:false,nmhBtnEnabled:false},
  enableQuizButton:{target:'AnsBtn1..25',enabled:true,visible:true,nmhBtnEnabled:true}};
}
export function validateP014BehaviorAudit(audit){
 assert.equal(audit.kind,'alg-l06-p014-source-behavior-audit-v1');
 assert.deepEqual(audit.source,SOURCE);assert.deepEqual(audit.lessonXml,LESSON_XML);
 assert.deepEqual(audit.mainQuizHold,{domain:'sprite-227',frame:120,
  effects:['stop','quizSection=true','quizTryCount=0']});
 assert.deepEqual(audit.optionInstances,OPTION_INSTANCES);
 assert.deepEqual(audit.feedback.right,RIGHT);assert.deepEqual(audit.feedback.wrong,WRONG);
 assert.equal(audit.feedback.wrongFirstText.endsWith('Try again.'),true);
 assert.equal(audit.feedback.wrongRepeatText.endsWith('output, F.'),true);
 assert.equal(audit.feedback.tryLimit,2);
 assert.equal(audit.oldHost.exactP014LaunchObserved,false);
 assert.equal(audit.oldHost.applicability,'conditional-common-indexMI-source-not-proven-P014-launch');
 assert(Object.values(audit.acceptanceEffects).every(value=>value===false));
 return true;
}
export function buildP014BehaviorAudit(){
 const swf=exact(SOURCE_ROOT,SOURCE),xml=exact(SOURCE_ROOT,LESSON_XML).toString();
 assert.equal(swf.subarray(0,3).toString(),'CWS');
 assert(/<Page[^>]*Title="Input and Output"[^>]*SlideSpace="Yes"[^>]*>VB\/L6VB05\.swf<\/Page>/u.test(xml),
  'exact ALG001 L6 VB source placement');
 const discovery=JSON.parse(exact(ROOT,DISCOVERY).toString());
 assert.equal(discovery.animationId,'shared-alg001-l06-p014');
 assert.deepEqual(discovery.physicalSource.swf,SOURCE);
 assert.deepEqual(discovery.physicalSource.lessonXml,LESSON_XML);
 assert.deepEqual(discovery.behavior.mainStop,{domain:'sprite-227',frame:120,
  effects:['stop','quizSection=true','quizTryCount=0']});
 assert.equal(discovery.swf.domains.find(x=>x.domain==='sprite-227')?.declaredFrames,449);
 const xmlSource=exact(ROOT,SWFMILL).toString();
 for(const row of OPTION_INSTANCES){
  const tag=new RegExp(`<PlaceObject2[^>]*depth="${row.depth}"[^>]*objectID="${row.characterId}"[^>]*name="${row.instance}"`, 'gu');
  assert.equal([...xmlSource.matchAll(tag)].length,1,`one source answer placement ${row.instance}`);
 }
 const feedbackPlaces=[['Mc_Right_Feed1',115],['Mc_Right_Feed2',156],
  ['Mc_Right_Feed3',83],['Mc_Right_Feed4',148],
  ['Mc_Wrong_Feed1',173],['Mc_Wrong_Feed2',187],['Mc_Wrong_Feed3',28]];
 for(const [name,id] of feedbackPlaces){
  const tag=new RegExp(`<PlaceObject2[^>]*objectID="${id}"[^>]*name="${name}"`, 'gu');
  assert.equal([...xmlSource.matchAll(tag)].length,1,`one feedback instance ${name}`);
 }
 const scripts=Object.fromEntries(Object.entries(ACTIONS).map(([key,[relative,bytes,hash]])=>{
  const pin={path:`${SCRIPT_ROOT}/${relative}`,bytes,sha256:hash};
  return [key,{pin,text:exact(ROOT,pin).toString()}];
 }));
 assert.equal(compact(scripts.mainHold.text),'stop();_global.quizSection=true;_global.quizTryCount=0;');
 assert.equal(compact(scripts.correct.text),
  'on(release){_root.disableQuizButton();_root.showRightFeed();}');
 assert(scripts.wrong.text.includes('_global.quizTryCount == 1'));
 assert(scripts.wrong.text.indexOf('_root.disableQuizButton();')<scripts.wrong.text.indexOf('_root.showWrongFeed();'));
 for(const key of ['right83','right115','right148','right156']){
  const s=compact(scripts[key].text);
  assert(s.includes('_root.disableQuizButton();_global.quizSection=false;this.gotoAndStop(1);_parent.play();'));
 }
 for(const key of ['wrong28','wrong173','wrong187']){
  const s=compact(scripts[key].text);
  for(const part of ['_root.enableQuizButton();','_global.quizTryCount++;',
   'if(_global.quizTryCount>=2)','_global.quizTryCount=0;','_global.quizSection=false;','_parent.play();'])
   assert(s.includes(part),`${key} ${part}`);
 }
 for(const row of WRONG){
  const id=row.domain.slice('sprite-'.length);
  assert.equal(compact(scripts[`wrongHold${id}`].text),'stop();',`wrong ${id} popup hold`);
  const ack=compact(scripts[`wrongAck${id}`].text);
  assert(ack.includes(`_parent.gotoAndPlay(${row.resumeFrame});`),`wrong ${id} explicit acknowledgment`);
  assert(ack.includes('eval("AnsBtn"+i).gotoAndStop(1);'),`wrong ${id} button reset`);
 }
 const extraction=JSON.parse(exact(HOST_ROOT,HOST_EXTRACTION).toString());
 assert.equal(extraction.logicalSourcePath,'NewHelpProgram/HELP_COURSES/indexMI.swf');
 exact(HOST_ROOT,HOST_SOURCE);
 const hostScript=exact(HOST_ROOT,HOST_SCRIPT).toString();
 const hostApis=verifyHostApis(hostScript);
 const audit={schemaVersion:1,kind:'alg-l06-p014-source-behavior-audit-v1',
  status:'source-static-behavior-audit-only',animationId:'shared-alg001-l06-p014',
  source:SOURCE,lessonXml:LESSON_XML,discovery:DISCOVERY,swfmill:SWFMILL,
  mainQuizHold:{domain:'sprite-227',frame:120,
   effects:['stop','quizSection=true','quizTryCount=0']},
  optionInstances:OPTION_INSTANCES,
  answerHandlers:{correct:{buttonCharacterId:213,sourceInstance:'AnsBtn2',
    effects:['disableQuizButton','showRightFeed']},
   wrong:{buttonCharacterId:214,sourceInstances:['AnsBtn1','AnsBtn3','AnsBtn4'],
    feedbackTextCondition:'quizTryCount==1 gets repeat text without Try again; otherwise first text includes Try again',
    effects:['set WrongFeed','disableQuizButton','showWrongFeed']}},
  feedback:{right:RIGHT,wrong:WRONG,tryLimit:2,
   wrongFirstText:'Substitute 25 for the variable C, which is the input for the formula to find the output, F. Try again.',
   wrongRepeatText:'Substitute 25 for the variable C, which is the input for the formula to find the output, F.',
   rightTerminalEffects:['stop','disableQuizButton','quizSection=false','self.gotoAndStop(1)','parent.play'],
   wrongMidpointPolicy:'each wrong feedback stops at its own popup hold frame and requires its nested BtnClose button to gotoAndPlay next frame',
   wrongTerminalEffects:['stop','enableQuizButton','self.gotoAndStop(1)','quizTryCount++',
    'NMHBtn.enabled=true','if tries>=2 reset0,quizSection=false,parent.play']},
  glossaryButtons:[{characterId:32,key:'Input',sourceEffects:['set KeyAttribute','DoHyperLinks','main.stop']},
   {characterId:33,key:'Output',sourceEffects:['set KeyAttribute','DoHyperLinks','main.stop']}],
  oldHost:{source:HOST_SOURCE,extraction:HOST_EXTRACTION,script:HOST_SCRIPT,
   logicalSourcePath:extraction.logicalSourcePath,apis:hostApis,
   exactP014LaunchObserved:false,
   applicability:'conditional-common-indexMI-source-not-proven-P014-launch'},
  actionPins:Object.fromEntries(Object.entries(scripts).map(([key,value])=>[key,value.pin])),
  limits:['Old indexMI host source is preserved and its quiz API bodies are exact, but this P014 launch against that binary was not observed.',
   'random(4)/random(3) selects one named branch; branch choice is input to the maintained deterministic state, not invented source order.',
   'The three wrong branches require their own popup acknowledgement before terminal effects; ordinary playback cannot pass the midpoint stop.',
   'Answer visual label-to-instance geometry and original audio/visual timing require separate evidence.',
   'Original runtime, listening, human and Owner acceptance remain independent.'],
  acceptanceEffects:{originalRuntime:false,fidelity:false,audio:false,listening:false,
   human:false,owner:false,strictComplete:false,publication:false}};
 validateP014BehaviorAudit(audit);
 return audit;
}
export function operate(mode){
 assert(['--write','--check'].includes(mode),'--write | --check');
 const body=Buffer.from(JSON.stringify(buildP014BehaviorAudit(),null,2)+'\n');
 const absolute=path.join(ROOT,OUTPUT);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 if(mode==='--write'){
  try{fs.writeFileSync(absolute,body,{flag:'wx'});}catch(error){
   if(error?.code!=='EEXIST')throw error;
   assert.deepEqual(fs.readFileSync(absolute),body,'immutable P014 audit');
  }
 }else assert.deepEqual(fs.readFileSync(absolute),body,'exact P014 behavior audit');
 return {status:mode==='--write'?'source-audit-written':'source-audit-checked',
  output:{path:OUTPUT,bytes:body.length,sha256:sha256(body)},
  originalRuntimeAccepted:false,registrationChanged:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one mode');console.log(JSON.stringify(operate(process.argv[2]),null,2));
}
