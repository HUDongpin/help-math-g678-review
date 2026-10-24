#!/usr/bin/env node
/** P064 local Current-JS source-quiz proof. Host and registry stay independent. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,sha256,uniquePins} from
 '../lib/g678-admission-proof.mjs';
import {verifyNmsL02PageProof} from '../lib/nms-l02-successor-proof.mjs';
import {extendNmsL02P062Descriptor} from '../apps/web/lib/nms-l02-p062-descriptor-extension.ts';
import {extendNmsL02P064Descriptor} from '../apps/web/lib/nms-l02-p064-descriptor-extension.ts';
import {verifyP061PredecessorForP062} from './prepare-nms-l02-p062-admission.mjs';
import {validateP062AdmissionSemantics,validateP062ProofClosure} from
 '../lib/nms-l02-p062-admission-semantics.mjs';
import {buildP064DomArtifactPlan,checkP064DomArtifacts} from
 './prepare-nms-l02-p064-dom-artifacts-v1.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import * as S from '../lib/nms-l02-p064-admission-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P062_PROOF=Object.freeze({path:'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json',
 bytes:97811,sha256:'7939dfefe1191f9d6da937cc893fddce07944285395083917daaec058a41d4a9'});
export const P064_HOST_V14=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v14.json',
 bytes:38775,sha256:'34a4280e72e90d55db7cd8f12587c39095c73ca1fcb7b253d221be098e980d9c'});
const P052_WITNESS=Object.freeze({path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const counts=registry=>{const entries=registry.calibrations.flatMap(row=>row.entries);
 return{total:entries.length,shared:entries.filter(entry=>entry.key.startsWith('shared-')).length};};
const ownSupportPaths=Object.freeze([
 'lib/nms-l02-p064-admission-semantics-v1.mjs',
 'lib/nms-l02-p064-admission-semantics-v1.test.mjs',
 'scripts/prepare-nms-l02-p064-admission.mjs',
 'scripts/prepare-nms-l02-p064-admission.test.mjs',
]);
function parsePresentation(bytes){
 const source=bytes.toString(),prefix='JSON.parse(',start=source.indexOf(prefix),
  end=source.lastIndexOf(') as P064PresentationData');
 assert(start>=0&&end>start,'exact maintained presentation encoding');
 return JSON.parse(JSON.parse(source.slice(start+prefix.length,end)));
}
function sourceEvidence(root){
 const contract=readJsonPin(root,S.P064_QUIZ_CONTRACT);
 const questionIr=readJsonPin(root,S.P064_QUESTION_IR);
 const displayList=readJsonPin(root,S.P064_DISPLAY_LIST);
 const presentation=parsePresentation(readPin(root,S.P064_PRESENTATION));
 S.validateP064SourceInventory({contract,questionIr,displayList,presentation});
 S.validateP064Disposition(readJsonPin(root,S.P064_DISPOSITION));
 S.validateP064BrowserEvidence(readJsonPin(root,S.P064_BROWSER_MAIN),
  readJsonPin(root,S.P064_BROWSER_REVIEW_BRANCHES));
 return true;
}

export function buildP064Packet({pins,artifacts,run}){
 const entry={key:S.P064_ADMISSION_ID,module:`./modules/${S.P064_ADMISSION_ID}`,
  maturity:'private-current-js',complexityLane:'behavior-heavy',artifacts};
 return{schemaVersion:1,calibrationId:S.P064_ADMISSION_CALIBRATION,
  sourceRoot:S.P064_SOURCE_ROOT,scope:'private-engineering',deploymentScope:'local-only',
  source:S.P064_SOURCE,sourceXml:S.P064_XML,
  selectedPages:[{animationId:S.P064_ADMISSION_ID,placementId:S.P064_ADMISSION_ID,
   assetId:`swf-${S.P064_SOURCE.sha256}`,stableLessonKey:'shared-nms002-l02',
   sourceSha256:S.P064_SOURCE.sha256,moduleCode:'NMS002',lessonNumber:2,
   globalPageOrdinal:64,sourceOccurrence:64,sectionCode:'FQ',sectionPageOrdinal:2,
   complexityLane:'behavior-heavy',runtime:S.P064_RUNTIME}],entry,
  sourceQuiz:{contract:S.P064_QUIZ_CONTRACT,questionIr:S.P064_QUESTION_IR,
   displayList:S.P064_DISPLAY_LIST,presentation:S.P064_PRESENTATION,
   scripts:S.P064_SCRIPT_AUDIT,bankSize:35,drawCount:10,optionCount:4,
   answerMapSha256:S.P064_ANSWER_MAP_SHA256},
  behavior:{disposition:S.P064_DISPOSITION,sourceRiskModule:S.P064_SOURCE_RISK_MODULE,
   quizState:S.P064_QUIZ_STATE,quizComponent:S.P064_QUIZ_COMPONENT,
   hostScore:S.P064_HOST_SCORE,runtimeAdapter:S.P064_RUNTIME_ADAPTER,
   productModule:S.P064_PRODUCT_MODULE,browserMain:S.P064_BROWSER_MAIN,
   browserReviewBranches:S.P064_BROWSER_REVIEW_BRANCHES,
   postReviewHostExitResolved:false,hostPlaybackCompletion:false,
   deterministicSelectionOriginalRngParity:false},
  audio:{sourceIndex:S.P064_AUDIO_INDEX,acceptedCueCount:0,
   sourceAlignmentAccepted:false,listeningAccepted:false,localeAutoPlayback:false,
   originalHostAssociationEstablished:false},
  glossary:[],sourceKeyAttributeCalls:0,
  integrity:{scope:'single-NMS-L02-P064-source-and-implementation',
   completeTransitiveClosure:false,
   qualification:'Q5 modern number-line interpretation; Q10 D, Q21 C and Q23 C review-name risks; post-review host-exit unresolved. Local maintained quiz behavior only, with no original-runtime RNG parity or gate acceptance.',
   files:pins,sharedDependencies:run.sharedDependencies},
  acceptanceEffects:S.P064_ACCEPTANCE_EFFECTS,
  productCalibrationPassed:false,scaleOutAuthorized:false};
}

export function buildP064AdmissionPlan({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P064_SOURCE_ROOT,'exact AWS source root');
 assert(!process.env.VERCEL&&!process.env.VERCEL_ENV&&process.env.NODE_ENV!=='production',
  'local-only proof');
 const dom=buildP064DomArtifactPlan({root});checkP064DomArtifacts(dom);
 const run=readJsonPin(root,pinFile(root,S.P064_RUN_PATH));
 const member=readJsonPin(root,pinFile(root,S.P064_MEMBER_PATH));
 assert.deepStrictEqual(run,dom.runManifest,'actual regenerated source run');
 assert.deepStrictEqual(member,dom.memberManifest,'actual regenerated member');
 assert.deepStrictEqual(run.sharedDependencies,S.P064_SHARED_DEPENDENCIES,
  'seven exact shared host pins and order');
 assert.deepStrictEqual(dom.artifacts,{kind:'maintained-dom-module-v1',
  module:pinFile(root,S.P064_CANONICAL_MODULE_PATH),
  timeline:pinFile(root,S.P064_CANONICAL_TIMELINE_PATH),
  memberManifest:pinFile(root,S.P064_MEMBER_PATH),sourceRun:pinFile(root,S.P064_RUN_PATH)},
  'exact canonical DOM artifact pins');
 for(const pin of [...run.inputs,...run.outputs,...run.sharedDependencies])
  assert.deepStrictEqual(pinFile(root,pin.path),pin,`current DOM input ${pin.path}`);
 for(const pin of run.externalEvidence){
  assert(pin.path.startsWith(`${S.P064_SOURCE_ROOT}/`),'external source remains AWS rooted');
  const relative=path.relative(S.P064_SOURCE_ROOT,pin.path);
  assert.deepStrictEqual(pinFile(S.P064_SOURCE_ROOT,relative),{...pin,path:relative},
   `real external P064 source ${pin.path}`);
 }
 assert.equal(run.externalEvidence.length,352,'two source files and 350 source audio files');
 assert.deepStrictEqual(run.externalEvidence.filter(pin=>
  [S.P064_SOURCE.path,S.P064_XML.path].some(relative=>
   pin.path===path.join(S.P064_SOURCE_ROOT,relative))),
  [S.P064_SOURCE,S.P064_XML].map(pin=>({...pin,path:path.join(S.P064_SOURCE_ROOT,pin.path)})),
  'exact source SWF and lesson XML');
 sourceEvidence(root);
 const pins=uniquePins([...run.inputs,...run.outputs,dom.artifacts.sourceRun,
  dom.artifacts.memberManifest,...ownSupportPaths.map(relative=>pinFile(root,relative))]);
 for(const dep of S.P064_SHARED_DEPENDENCIES)
  assert(!pins.some(pin=>pin.path===dep.path),'page-owned and host-owned disjoint');
 const packet=buildP064Packet({pins,artifacts:dom.artifacts,run});
 const freezeBytes=json(packet),freezePin=bytePin(S.P064_FREEZE_PATH,freezeBytes);
 const fragment={calibrationId:S.P064_ADMISSION_CALIBRATION,deploymentScope:'local-only',
  freezeManifest:S.P064_FREEZE_PATH,freezeManifestBytes:freezePin.bytes,
  freezeManifestSha256:freezePin.sha256,entries:[packet.entry]};
 S.validateP064AdmissionSemantics({...packet,freezeManifest:freezePin},fragment);
 const transaction=readRegistryTransaction(root);
 const existing=transaction.registry.calibrations.filter(row=>
  row.calibrationId===S.P064_ADMISSION_CALIBRATION);
 assert.equal(existing.length,0,'new P064 calibration; no replacement');
 assert.deepStrictEqual(counts(transaction.registry),{total:635,shared:493},
  'exact P062 registered predecessor');
 const projected=upsertPrivateCurrentJsCalibration(transaction.registry,fragment);
 assert.deepStrictEqual(counts(projected),{total:636,shared:494},
  'one P064 local registration projection');
 const fragmentBytes=json(fragment),fragmentPin=bytePin(S.P064_FRAGMENT_PATH,fragmentBytes);
 const files=uniquePins([...pins,freezePin,fragmentPin]);
 const proof={schemaVersion:1,kind:'nms-l02-page-proof-v1',
  hostContract:'nms-l02-source-bound-host-v1',animationId:S.P064_ADMISSION_ID,
  freeze:freezePin,packet,registration:fragment,files,
  external:[{root:S.P064_SOURCE_ROOT,pin:S.P064_SOURCE},
   {root:S.P064_SOURCE_ROOT,pin:S.P064_XML}]};
 S.validateP064ProofClosure(proof);
 return{root,proof,packet,fragment,projected,
  outputs:[{path:S.P064_FREEZE_PATH,bytes:freezeBytes},
   {path:S.P064_FRAGMENT_PATH,bytes:fragmentBytes},
   {path:S.P064_PROOF_PATH,bytes:json(proof)}]};
}

export function assertP064HostPageOverlap(pageFiles,hostFiles){
 const hostPins=new Map(hostFiles.map(pin=>[pin.path,pin]));
 const overlap=pageFiles.filter(pin=>hostPins.has(pin.path));
 assert.deepStrictEqual(overlap,S.P064_INHERITED_HOST_OVERLAPS,
  'P064 page proof and shared host are disjoint');
 for(const pin of S.P064_INHERITED_HOST_OVERLAPS)
  assert.deepStrictEqual(hostPins.get(pin.path),pin,'exact inherited host overlap');
 return true;
}
export function verifyP062PredecessorForP064(root,witnessPin,hostPin){
 const state=verifyP061PredecessorForP062(root,witnessPin,hostPin);
 const proof=verifyNmsL02PageProof(root,P062_PROOF,state,
  validateP062AdmissionSemantics,validateP062ProofClosure);
 const packet=proof.packet;
 state.descriptor=extendNmsL02P062Descriptor(state.descriptor,{
  calibrationId:packet.calibrationId,sourceXml:packet.sourceXml,
  source:{...packet.source,path:path.join(packet.sourceRoot,packet.source.path)},
  selectedPage:packet.selectedPages[0],freeze:proof.freeze,
  sourceKeyAttributeCalls:packet.sourceKeyAttributeCalls,
 });
 assert.equal(state.descriptor.productBridge.registeredAnimationCount,61,
  'real P062 predecessor');
 return state;
}
export function verifyP064AdmissionPlan(plan,{witnessPath,hostPath}){
 assert.equal(witnessPath,P052_WITNESS.path,'exact executed predecessor witness');
 assert.equal(hostPath,P064_HOST_V14.path,'exact sealed host-v14');
 const state=verifyP062PredecessorForP064(plan.root,
  pinFile(plan.root,witnessPath),pinFile(plan.root,hostPath));
 assert.deepStrictEqual(pinFile(plan.root,witnessPath),P052_WITNESS,'pinned P052 witness');
 assert.deepStrictEqual(pinFile(plan.root,hostPath),P064_HOST_V14,'pinned host-v14');
 assertP064HostPageOverlap(plan.proof.files,state.host.files);
 for(const pin of S.P064_SHARED_DEPENDENCIES)
  assert.deepStrictEqual(state.host.files.find(item=>item.path===pin.path),pin,
   `P064 shared dependency required in host-v14: ${pin.path}`);
 state.transaction={...state.transaction,registry:plan.projected};
 const descriptor=extendNmsL02P064Descriptor(state.descriptor,{
  calibrationId:plan.packet.calibrationId,sourceXml:plan.packet.sourceXml,
  source:{...plan.packet.source,path:path.join(plan.packet.sourceRoot,plan.packet.source.path)},
  selectedPage:plan.packet.selectedPages[0],freeze:plan.proof.freeze,
  sourceKeyAttributeCalls:plan.packet.sourceKeyAttributeCalls,
 });
 assert.equal(descriptor.productBridge.registeredAnimationCount,62,
  'one source-quiz descriptor projection');
 return state;
}
export function prepareP064Admission(plan,boundary,{checkOnly=false}={}){
 const state=verifyP064AdmissionPlan(plan,boundary);
 if(!checkOnly){
  assert(plan.outputs.every(output=>!fs.existsSync(path.join(plan.root,output.path))),
   'immutable P064 outputs must be absent');
  for(const output of plan.outputs){
   fs.mkdirSync(path.dirname(path.join(plan.root,output.path)),{recursive:true});
   fs.writeFileSync(path.join(plan.root,output.path),output.bytes,{flag:'wx'});
  }
 }
 for(const output of plan.outputs)
  assert.deepStrictEqual(readPin(plan.root,bytePin(output.path,output.bytes)),output.bytes);
 const proof=verifyNmsL02PageProof(plan.root,pinFile(plan.root,S.P064_PROOF_PATH),state,
  S.validateP064AdmissionSemantics,S.validateP064ProofClosure);
 assert.deepStrictEqual(proof,plan.proof,'P064 common proof reader roundtrip');
 return{status:checkOnly?'P064_ADMISSION_CHECKED':'P064_PREPARED_NOT_REGISTERED',
  proof:pinFile(plan.root,S.P064_PROOF_PATH),registrationEffect:'none',
  acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const [mode,...args]=process.argv.slice(2);
  assert(['--dry-run','--prepare','--check'].includes(mode),
   'use --dry-run | --prepare | --check');
  assert(mode==='--dry-run'?args.length===0:
   args.length===4&&args[0]==='--witness'&&args[2]==='--host',
   'explicit reviewed host and witness for common reader');
  const plan=buildP064AdmissionPlan();
  const result=mode==='--dry-run'?
   {status:'P064_DRY_RUN_NOT_REGISTERED',files:plan.proof.files.length,
    external:plan.proof.external.length,registrationEffect:'none',acceptanceEffect:'none'}:
   prepareP064Admission(plan,{witnessPath:args[1],hostPath:args[3]},
    {checkOnly:mode==='--check'});
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
