#!/usr/bin/env node
/** Source-bound P054 page proof. The host and registry remain independent gates. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,sha256,uniquePins} from
 '../lib/g678-admission-proof.mjs';
import {verifyNmsL02PageProof} from '../lib/nms-l02-successor-proof.mjs';
import {extendNmsL02P064Descriptor} from '../apps/web/lib/nms-l02-p064-descriptor-extension.ts';
import {extendNmsL02P054Descriptor} from '../apps/web/lib/nms-l02-p054-descriptor-extension.ts';
import {verifyP062PredecessorForP064} from './prepare-nms-l02-p064-admission.mjs';
import * as P064 from '../lib/nms-l02-p064-admission-semantics-v1.mjs';
import {buildP054DomArtifactPlan,checkP054DomArtifacts} from
 './prepare-nms-l02-p054-dom-artifacts-v1.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import * as S from '../lib/nms-l02-p054-proof-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P064_PROOF=Object.freeze({path:P064.P064_PROOF_PATH,bytes:44928,
 sha256:'91ecc6b6b5dece0d0b3521c5d150b25be0a4bbf06b85b776fdb7f146d8af0ec7'});
const P052_WITNESS=Object.freeze({path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});
export const P054_HOST_V15_PATH='catalog/nms-l02-admission-v1/host-v15.json';
export const P054_HOST_V15=Object.freeze({"path": "catalog/nms-l02-admission-v1/host-v15.json", "bytes": 42983, "sha256": "7150c0e90578f5c2763eb3bb90e93a3605dde61613d2597907c318dffec7eb68"});
const ownSupportPaths=Object.freeze([
 'lib/nms-l02-p054-proof-semantics-v1.mjs',
 'lib/nms-l02-p054-proof-semantics-v1.test.mjs',
 'scripts/prepare-nms-l02-p054-admission.mjs',
 'scripts/prepare-nms-l02-p054-admission.test.mjs',
]);
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const counts=registry=>{const entries=registry.calibrations.flatMap(row=>row.entries);
 return{total:entries.length,shared:entries.filter(entry=>entry.key.startsWith('shared-')).length};};
function externalPin(absolute){
 assert(path.isAbsolute(absolute.path),'physical absolute external evidence');
 if(absolute.path.startsWith(`${S.P054_SOURCE_ROOT}/`)){
  const relative=path.relative(S.P054_SOURCE_ROOT,absolute.path);
  const pin={...absolute,path:relative};
  assert.deepStrictEqual(pinFile(S.P054_SOURCE_ROOT,relative),pin,'real AWS source pin');
  return{root:S.P054_SOURCE_ROOT,pin};
 }
 const root=path.dirname(absolute.path),relative=path.basename(absolute.path);
 const pin={...absolute,path:relative};
 assert(root.startsWith('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/'),
  'only reviewed retained technical-resource root');
 assert.deepStrictEqual(pinFile(root,relative),pin,'real retained external resource');
 return{root,pin};
}

export function buildP054Packet({pins,artifacts,run,externalPins}){
 const entry={key:S.P054_ADMISSION_ID,module:`./modules/${S.P054_ADMISSION_ID}`,
  maturity:'private-current-js',complexityLane:'behavior-heavy',artifacts};
 return{schemaVersion:1,calibrationId:S.P054_ADMISSION_CALIBRATION,
  sourceRoot:S.P054_SOURCE_ROOT,scope:'private-engineering',deploymentScope:'local-only',
  source:S.P054_SOURCE,sourceXml:S.P054_XML,
  selectedPages:[{animationId:S.P054_ADMISSION_ID,placementId:S.P054_ADMISSION_ID,
   assetId:`swf-${S.P054_SOURCE.sha256}`,stableLessonKey:'shared-nms002-l02',
   sourceSha256:S.P054_SOURCE.sha256,moduleCode:'NMS002',lessonNumber:2,
   globalPageOrdinal:54,sourceOccurrence:54,sectionCode:'GS',sectionPageOrdinal:2,
   complexityLane:'behavior-heavy',runtime:S.P054_RUNTIME}],entry,
  sourceAudits:S.P054_REVIEWED_SOURCE_PINS,
  resources:{artRoot:S.P054_ART_ROOT,audioRoot:S.P054_AUDIO_ROOT,
   audioManifest:S.P054_AUDIO_MANIFEST,externalPins,feedback:S.P054_FEEDBACK,
   revealCount:24,resultMusicActivated:false,lessonSaActivated:false},
  behavior:{levels:2,cardsPerLevel:12,pairsPerLevel:6,
   scoreCorrect:10,scoreWrong:-2,scoreFloor:'none-in-source-card-handlers',
   level1Entry:'default',level2Entry:'explicit-local-choice',
   earlierP053EntryReachabilityEstablished:false,
   correctFeedback:{spriteId:194,startFrame:2,terminalFrame:27},
   wrongFeedback:{spriteId:208,startFrame:2,terminalFrame:31},
   feedbackTiming:'source-script-based-maintained-clock-not-original-schedule',
   terminalOutcome:'terminal-unresolved',parentResultTransitionEstablished:false,
   hostPlaybackCompletion:false,sourceTimelineSeekAvailable:false,
   originalRuntimeParityEstablished:false,sourceRepeatIsReplay:false,
   feedbackAutoPlayOnMount:false,spanishAudioSubstitution:false},
  glossary:[],sourceKeyAttributeCalls:0,
  integrity:{scope:'single-NMS-L02-P054-source-and-implementation',
   completeTransitiveClosure:false,
   qualification:'L7GS03 earlier entry reachability and terminal-unresolved result remain unproven in original runtime; maintained local matching behavior only.',
   files:pins,sharedDependencies:run.sharedDependencies},
  acceptanceEffects:S.P054_ACCEPTANCE_EFFECTS,
  productCalibrationPassed:false,scaleOutAuthorized:false};
}

export function buildP054AdmissionPlan({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P054_SOURCE_ROOT,'exact AWS source root');
 assert(!process.env.VERCEL&&!process.env.VERCEL_ENV&&process.env.NODE_ENV!=='production',
  'local-only proof');
 const dom=buildP054DomArtifactPlan({root});checkP054DomArtifacts(dom);
 const run=readJsonPin(root,pinFile(root,S.P054_RUN_PATH));
 const member=readJsonPin(root,pinFile(root,S.P054_MEMBER_PATH));
 assert.deepStrictEqual(run,dom.runManifest,'actual regenerated source run');
 assert.deepStrictEqual(member,dom.memberManifest,'actual regenerated member');
 assert.deepStrictEqual(run.sharedDependencies,S.P054_SHARED_DEPENDENCIES,
  'seven exact shared host pins and order');
 assert.deepStrictEqual(dom.artifacts,{kind:'maintained-dom-module-v1',
  module:pinFile(root,S.P054_MODULE_PATH),timeline:pinFile(root,S.P054_TIMELINE_PATH),
  memberManifest:pinFile(root,S.P054_MEMBER_PATH),sourceRun:pinFile(root,S.P054_RUN_PATH)},
  'exact canonical DOM artifacts');
 for(const pin of [...run.inputs,...run.outputs,...run.sharedDependencies])
  assert.deepStrictEqual(pinFile(root,pin.path),pin,`current DOM input ${pin.path}`);
 assert.equal(run.externalEvidence.length,30,'source2 + retained movie/manifest26 resources');
 const external=run.externalEvidence.map(externalPin);
 assert.deepStrictEqual(external.filter(item=>item.root===S.P054_SOURCE_ROOT).map(item=>item.pin),
  [S.P054_SOURCE,S.P054_XML],
  'exact AWS source SWF and lesson XML');
 S.validateP054Disposition(readJsonPin(root,S.P054_DISPOSITION));
 S.validateP054BrowserEvidence(readJsonPin(root,S.P054_BROWSER_MAIN),
  readJsonPin(root,S.P054_BROWSER_PENDING_MEDIA));
 const resourcePins=uniquePins([...run.reveal,...run.audio.feedback]);
 assert.equal(resourcePins.length,26,'24 source reveal SVGs and two feedback MP3s');
 assert.deepStrictEqual(resourcePins,
  run.externalEvidence.filter(pin=>resourcePins.some(resource=>resource.path===pin.path)),
  'external resource pins equal sealed DOM run');
 const pins=uniquePins([...run.inputs,...run.outputs,dom.artifacts.sourceRun,
  dom.artifacts.memberManifest,...ownSupportPaths.map(relative=>pinFile(root,relative))]);
 assert.equal(pins.length,59,'53 inputs, two outputs, run/member and four support files');
 for(const dep of S.P054_SHARED_DEPENDENCIES)
  assert(!pins.some(pin=>pin.path===dep.path),'page-owned and host-owned disjoint');
 const packet=buildP054Packet({pins,artifacts:dom.artifacts,run,externalPins:resourcePins});
 const freezeBytes=json(packet),freezePin=bytePin(S.P054_FREEZE_PATH,freezeBytes);
 const fragment={calibrationId:S.P054_ADMISSION_CALIBRATION,deploymentScope:'local-only',
  freezeManifest:S.P054_FREEZE_PATH,freezeManifestBytes:freezePin.bytes,
  freezeManifestSha256:freezePin.sha256,entries:[packet.entry]};
 S.validateP054AdmissionSemantics({...packet,freezeManifest:freezePin},fragment);
 const transaction=readRegistryTransaction(root);
 assert.equal(transaction.registry.calibrations.filter(row=>
  row.calibrationId===S.P054_ADMISSION_CALIBRATION).length,0,'new P054 calibration only');
 assert.deepStrictEqual(counts(transaction.registry),{total:636,shared:494},
  'exact P064 registered predecessor');
 const projected=upsertPrivateCurrentJsCalibration(transaction.registry,fragment);
 assert.deepStrictEqual(counts(projected),{total:637,shared:495},'one local P054 projection');
 const fragmentBytes=json(fragment),fragmentPin=bytePin(S.P054_FRAGMENT_PATH,fragmentBytes);
 const files=uniquePins([...pins,freezePin,fragmentPin]);
 const proof={schemaVersion:1,kind:'nms-l02-page-proof-v1',
  hostContract:'nms-l02-source-bound-host-v1',animationId:S.P054_ADMISSION_ID,
  freeze:freezePin,packet,registration:fragment,files,external};
 S.validateP054ProofClosure(proof);
 return{root,proof,packet,fragment,projected,
  outputs:[{path:S.P054_FREEZE_PATH,bytes:freezeBytes},
   {path:S.P054_FRAGMENT_PATH,bytes:fragmentBytes},
   {path:S.P054_PROOF_PATH,bytes:json(proof)}]};
}

export function assertP054HostPageOverlap(pageFiles,hostFiles){
 const hostPins=new Map(hostFiles.map(pin=>[pin.path,pin]));
 const overlap=pageFiles.filter(pin=>hostPins.has(pin.path));
 assert.deepStrictEqual(overlap,S.P054_INHERITED_HOST_OVERLAPS,
  'P054 page proof and shared host are disjoint');
 return true;
}
export function verifyP064PredecessorForP054(root,witnessPin,hostPin){
 const state=verifyP062PredecessorForP064(root,witnessPin,hostPin);
 const proof=verifyNmsL02PageProof(root,P064_PROOF,state,
  P064.validateP064AdmissionSemantics,P064.validateP064ProofClosure);
 const packet=proof.packet;
 state.descriptor=extendNmsL02P064Descriptor(state.descriptor,{
  calibrationId:packet.calibrationId,sourceXml:packet.sourceXml,
  source:{...packet.source,path:path.join(packet.sourceRoot,packet.source.path)},
  selectedPage:packet.selectedPages[0],freeze:proof.freeze,
  sourceKeyAttributeCalls:packet.sourceKeyAttributeCalls,
 });
 assert.equal(state.descriptor.productBridge.registeredAnimationCount,62,
  'real P064 registered predecessor');
 return state;
}
export function verifyP054AdmissionPlan(plan,{witnessPath,hostPath}){
 assert.equal(witnessPath,P052_WITNESS.path,'exact executed predecessor witness');
 assert.equal(hostPath,P054_HOST_V15_PATH,'exact reviewed host-v15 path');
 const witnessPin=pinFile(plan.root,witnessPath),hostPin=pinFile(plan.root,hostPath);
 assert.deepStrictEqual(witnessPin,P052_WITNESS,'pinned P052 witness');
 assert.deepStrictEqual(hostPin,P054_HOST_V15,'exact sealed P054 host-v15');
 const state=verifyP064PredecessorForP054(plan.root,witnessPin,hostPin);
 assert.deepStrictEqual(pinFile(plan.root,P064_PROOF.path),P064_PROOF,'pinned P064 page proof');
 assertP054HostPageOverlap(plan.proof.files,state.host.files);
 for(const pin of S.P054_SHARED_DEPENDENCIES)
  assert.deepStrictEqual(state.host.files.find(item=>item.path===pin.path),pin,
   `P054 shared dependency required in host-v15: ${pin.path}`);
 state.transaction={...state.transaction,registry:plan.projected};
 const descriptor=extendNmsL02P054Descriptor(state.descriptor,{
  calibrationId:plan.packet.calibrationId,sourceXml:plan.packet.sourceXml,
  source:{...plan.packet.source,path:path.join(plan.packet.sourceRoot,plan.packet.source.path)},
  selectedPage:plan.packet.selectedPages[0],freeze:plan.proof.freeze,
  sourceKeyAttributeCalls:plan.packet.sourceKeyAttributeCalls,
 });
 assert.equal(descriptor.productBridge.registeredAnimationCount,63,
  'one source-matching descriptor projection');
 return state;
}
export function prepareP054Admission(plan,boundary,{checkOnly=false}={}){
 const state=verifyP054AdmissionPlan(plan,boundary);
 if(!checkOnly){
  assert(plan.outputs.every(output=>!fs.existsSync(path.join(plan.root,output.path))),
   'immutable P054 outputs must be absent');
  for(const output of plan.outputs){
   fs.mkdirSync(path.dirname(path.join(plan.root,output.path)),{recursive:true});
   fs.writeFileSync(path.join(plan.root,output.path),output.bytes,{flag:'wx'});
  }
 }
 for(const output of plan.outputs)
  assert.deepStrictEqual(readPin(plan.root,bytePin(output.path,output.bytes)),output.bytes);
 const proof=verifyNmsL02PageProof(plan.root,pinFile(plan.root,S.P054_PROOF_PATH),state,
  S.validateP054AdmissionSemantics,S.validateP054ProofClosure);
 assert.deepStrictEqual(proof,plan.proof,'P054 common proof reader roundtrip');
 return{status:checkOnly?'P054_ADMISSION_CHECKED':'P054_PREPARED_NOT_REGISTERED',
  proof:pinFile(plan.root,S.P054_PROOF_PATH),registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const [mode,...args]=process.argv.slice(2);
  assert(['--dry-run','--prepare','--check'].includes(mode),
   'use --dry-run | --prepare | --check');
  assert(mode==='--dry-run'?args.length===0:
   args.length===4&&args[0]==='--witness'&&args[2]==='--host',
   'explicit reviewed host and witness for common reader');
  const plan=buildP054AdmissionPlan();
  const result=mode==='--dry-run'?
   {status:'P054_DRY_RUN_NOT_REGISTERED',files:plan.proof.files.length,
    external:plan.proof.external.length,registrationEffect:'none',acceptanceEffect:'none'}:
   prepareP054Admission(plan,{witnessPath:args[1],hostPath:args[3]},
    {checkOnly:mode==='--check'});
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
