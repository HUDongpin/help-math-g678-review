#!/usr/bin/env node
/** P053 page-only local admission producer. A reviewed host-v16 seal is still
 * required for --prepare/--check; dry-run never writes a proof or registry. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,sha256,uniquePins} from
 '../lib/g678-admission-proof.mjs';
import {verifyNmsL02PageProof} from '../lib/nms-l02-successor-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {verifyP064PredecessorForP054} from './prepare-nms-l02-p054-admission.mjs';
import {extendNmsL02P054Descriptor} from '../apps/web/lib/nms-l02-p054-descriptor-extension.ts';
import {extendNmsL02P053Descriptor} from '../apps/web/lib/nms-l02-p053-descriptor-extension.ts';
import * as P054 from '../lib/nms-l02-p054-proof-semantics-v1.mjs';
import * as S from '../lib/nms-l02-p053-proof-semantics-v1.mjs';
import * as R from '../lib/nms-l02-p053-reviewed-seal-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P052_WITNESS=Object.freeze({
 path:'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json',
 bytes:137815,sha256:'01cb25723b10cc2ce5a0a39e699420a08c7815804b0fe21988c5b155323230b6'});
const P054_PROOF=Object.freeze({path:P054.P054_PROOF_PATH,bytes:54313,
 sha256:'5e8fc913e9e0bc41dbf1336b4d042983e5fd5b74b60fc63beeec7c3015adf666'});
export const P053_HOST_V16_PATH='catalog/nms-l02-admission-v1/host-v16.json';
/** Reviewed host-v16 plan; --prepare still requires the physical immutable
 * file and an exact match. Root will rebind this if its reader changes before
 * sealing, and the preparer must be reviewed again before use. */
export const P053_HOST_V16_REVIEWED=Object.freeze({path:P053_HOST_V16_PATH,bytes:47999,
 sha256:'1f0d2dbb09c4f641eb65267ae0d90f073477704bca94c75e6bacd67c01e73e7f'});

const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const counts=registry=>{const entries=registry.calibrations.flatMap(row=>row.entries);
 return{total:entries.length,shared:entries.filter(entry=>entry.key.startsWith('shared-')).length};};
const externalRecord=value=>value.path.startsWith(`${S.P053_SOURCE_ROOT}/`)
 ? {root:S.P053_SOURCE_ROOT,pin:{...value,path:path.relative(S.P053_SOURCE_ROOT,value.path)}}
 : {root:path.dirname(value.path),pin:{...value,path:path.basename(value.path)}};

export function buildP053Packet({pins,artifacts,run}){
 const entry={key:S.P053_ADMISSION_ID,module:`./modules/${S.P053_ADMISSION_ID}`,
  maturity:'private-current-js',complexityLane:'behavior-heavy',artifacts};
 return{schemaVersion:1,calibrationId:S.P053_ADMISSION_CALIBRATION,
  sourceRoot:S.P053_SOURCE_ROOT,scope:'private-engineering',deploymentScope:'local-only',
  source:S.P053_SOURCE,sourceXml:S.P053_XML,
  selectedPages:[{animationId:S.P053_ADMISSION_ID,placementId:S.P053_ADMISSION_ID,
   assetId:`swf-${S.P053_SOURCE.sha256}`,stableLessonKey:'shared-nms002-l02',
   sourceSha256:S.P053_SOURCE.sha256,moduleCode:'NMS002',lessonNumber:2,
   globalPageOrdinal:53,sourceOccurrence:53,sectionCode:'GS',sectionPageOrdinal:1,
   complexityLane:'behavior-heavy',runtime:S.P053_RUNTIME}],entry,
  sourceAudits:S.P053_SOURCE_AUDITS,
  audio:{source:S.P053_AUDIO.mp3,rawIndex:S.P053_AUDIO.rawIndex,blockCount:619,
   firstBlockFrame:4,lastBlockFrame:694,decodedSamples:1135296,
   independentUserTriggeredFullMp3:true,localeAutoPlayback:false,
   spanishAudioActivated:false,sourceAlignmentAccepted:false,listeningAccepted:false,
   originalRuntimeAccepted:false},
  behavior:{earlyStartBasename:'L7GS03',earlyStartResolution:'current-page-reload',
   lateStartBasename:'L2GS03',lateStartResolution:'P054-level-scoped-handoff',
   popupSpriteId:104,popupTextIds:[13,16,102,103],popupCloseReceiverResolved:false,
   sourceFrameCount:694,maintainedHeldFrame:693,hostPlaybackCompletion:false,
   originalHostNavigationObserved:false,originalRuntimeParityEstablished:false},
  glossary:[],sourceKeyAttributeCalls:0,
  integrity:{scope:'single-NMS-L02-P053-source-and-implementation',
   completeTransitiveClosure:false,
   qualification:'The popup-close receiver, original-host navigation, audio-sync and completion remain unestablished. This page proof covers a local maintained source-directions candidate only.',
   files:pins,sharedDependencies:run.sharedDependencies},
  acceptanceEffects:S.P053_ACCEPTANCE_EFFECTS,
  productCalibrationPassed:false,scaleOutAuthorized:false};
}

/** Physical source/page closure and source semantics, without a host or write.
 * Historical candidate browser receipts are deliberately not treated as
 * formal-route evidence after the later route change. */
export function buildP053AdmissionPlan({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P053_SOURCE_ROOT,'exact AWS source root');
 assert.equal(fs.realpathSync(S.P053_SOURCE_ROOT),S.P053_SOURCE_ROOT,'real AWS source root');
 assert(fs.lstatSync(S.P053_SOURCE_ROOT).isDirectory()&&
  !fs.lstatSync(S.P053_SOURCE_ROOT).isSymbolicLink(),'source directory not symlink');
 assert(!process.env.VERCEL&&!process.env.VERCEL_ENV&&process.env.NODE_ENV!=='production',
  'local engineering proof only');
 const {run,member,artifacts}=R.readP053ReviewedDom(root);
 R.validateP053ReviewedEvidence(root);
 const audit=Object.fromEntries(Object.entries(S.P053_SOURCE_AUDITS).map(([name,pin])=>
  [name,readJsonPin(root,pin)]));
 S.validateP053SourceInventory({native:audit.native,visual:audit.visual,
  stream:audit.stream,host:audit.host,audioStructure:audit.audioStructure});
 for(const item of [...run.externalEvidence,...run.outputs]){
  const location=path.isAbsolute(item.path)?{
   root:item.path.startsWith(`${S.P053_SOURCE_ROOT}/`)?S.P053_SOURCE_ROOT:path.dirname(item.path),
   relative:item.path.startsWith(`${S.P053_SOURCE_ROOT}/`)?
    path.relative(S.P053_SOURCE_ROOT,item.path):path.basename(item.path)}:
   {root,relative:item.path};
  assert.deepStrictEqual(pinFile(location.root,location.relative),
   {...item,path:location.relative},`current P053 source/output ${item.path}`);
 }
 const support=R.P053_PAGE_SUPPORT_PATHS.map(relative=>pinFile(root,relative));
 const pins=uniquePins([...run.inputs,...run.outputs,R.P053_DOM_RUN,
  R.P053_DOM_MEMBER,...support]);
 assert.equal(pins.length,41+2+R.P053_PAGE_SUPPORT_PATHS.length,
  'all DOM inputs, run/member and exact page support; outputs also in run inputs');
 for(const dep of R.P053_SHARED_DEPENDENCIES)
  assert(!pins.some(pin=>pin.path===dep.path),'page/host ownership disjoint');
 const packet=buildP053Packet({pins,artifacts,run});
 const freezeBytes=json(packet),freezePin=bytePin(S.P053_FREEZE_PATH,freezeBytes);
 const fragment={calibrationId:S.P053_ADMISSION_CALIBRATION,deploymentScope:'local-only',
  freezeManifest:S.P053_FREEZE_PATH,freezeManifestBytes:freezePin.bytes,
  freezeManifestSha256:freezePin.sha256,entries:[packet.entry]};
 S.validateP053AdmissionSemantics({...packet,freezeManifest:freezePin},fragment);
 const transaction=readRegistryTransaction(root);
 assert.deepStrictEqual(counts(transaction.registry),{total:637,shared:495},
  'P054 registered predecessor only');
 assert.equal(transaction.registry.calibrations.filter(row=>
  row.calibrationId===S.P053_ADMISSION_CALIBRATION).length,0,'P053 not registered');
 const projected=upsertPrivateCurrentJsCalibration(transaction.registry,fragment);
 assert.deepStrictEqual(counts(projected),{total:638,shared:496},'one P053 projection');
 const fragmentBytes=json(fragment),fragmentPin=bytePin(S.P053_FRAGMENT_PATH,fragmentBytes);
 const proof={schemaVersion:1,kind:'nms-l02-page-proof-v1',
  hostContract:'nms-l02-source-bound-host-v1',animationId:S.P053_ADMISSION_ID,
  freeze:freezePin,packet,registration:fragment,
  files:uniquePins([...pins,freezePin,fragmentPin]),
  external:run.externalEvidence.map(externalRecord)};
 R.validateP053ReviewedProofClosure(root,proof);
 return{root,proof,packet,fragment,projected,
  outputs:[{path:S.P053_FREEZE_PATH,bytes:freezeBytes},
   {path:S.P053_FRAGMENT_PATH,bytes:fragmentBytes},
   {path:S.P053_PROOF_PATH,bytes:json(proof)}]};
}

export function assertP053HostPageOverlap(pageFiles,hostFiles){
 const host=new Map(hostFiles.map(item=>[item.path,item]));
 assert.deepStrictEqual(pageFiles.filter(item=>host.has(item.path)),[],
  'P053 page-owned and shared host paths are disjoint');
 return true;
}

export function verifyP054PredecessorForP053(root,witnessPin,hostPin){
 const state=verifyP064PredecessorForP054(root,witnessPin,hostPin);
 const proof=verifyNmsL02PageProof(root,P054_PROOF,state,
  P054.validateP054AdmissionSemantics,P054.validateP054ProofClosure);
 const packet=proof.packet;
 state.descriptor=extendNmsL02P054Descriptor(state.descriptor,{
  calibrationId:packet.calibrationId,sourceXml:packet.sourceXml,
  source:{...packet.source,path:path.join(packet.sourceRoot,packet.source.path)},
  selectedPage:packet.selectedPages[0],freeze:proof.freeze,
  sourceKeyAttributeCalls:packet.sourceKeyAttributeCalls,
 });
 assert.equal(state.descriptor.productBridge.registeredAnimationCount,63,
  'real P054 registered predecessor');
 return state;
}

export function verifyP053AdmissionPlan(plan,{witnessPath,hostPath}){
 assert.equal(witnessPath,P052_WITNESS.path,'exact two-stage predecessor witness');
 assert.equal(hostPath,P053_HOST_V16_PATH,'exact P053 successor host path');
 assert(P053_HOST_V16_REVIEWED,'host-v16 independently sealed pin required');
 const witness=pinFile(plan.root,witnessPath),host=pinFile(plan.root,hostPath);
 assert.deepStrictEqual(witness,P052_WITNESS,'pinned executed predecessor');
 assert.deepStrictEqual(host,P053_HOST_V16_REVIEWED,'reviewed literal host-v16 seal');
 const state=verifyP054PredecessorForP053(plan.root,witness,host);
 assert.deepStrictEqual(pinFile(plan.root,P054_PROOF.path),P054_PROOF,
  'P054 proof unchanged in P053 successor');
 assertP053HostPageOverlap(plan.proof.files,state.host.files);
 for(const dep of R.P053_SHARED_DEPENDENCIES)
  assert.deepStrictEqual(state.host.files.find(item=>item.path===dep.path),dep,
   `P053 shared dependency pinned in host-v16: ${dep.path}`);
 const prospective={...state,transaction:{...state.transaction,registry:plan.projected}};
 const descriptor=extendNmsL02P053Descriptor(prospective.descriptor,{
  calibrationId:plan.packet.calibrationId,sourceXml:plan.packet.sourceXml,
  source:{...plan.packet.source,path:path.join(plan.packet.sourceRoot,plan.packet.source.path)},
  selectedPage:plan.packet.selectedPages[0],freeze:plan.proof.freeze,
  sourceKeyAttributeCalls:plan.packet.sourceKeyAttributeCalls,
 });
 assert.equal(descriptor.productBridge.registeredAnimationCount,64,
  'source-order P053 projected as final registered page');
 return prospective;
}

export function prepareP053Admission(plan,boundary,{checkOnly=false}={}){
 const predecessor=verifyP053AdmissionPlan(plan,boundary);
 if(!checkOnly){
  assert(plan.outputs.every(output=>!fs.existsSync(path.join(plan.root,output.path))),
   'immutable P053 outputs absent before wx');
  for(const output of plan.outputs){
   fs.mkdirSync(path.dirname(path.join(plan.root,output.path)),{recursive:true});
   fs.writeFileSync(path.join(plan.root,output.path),output.bytes,{flag:'wx'});
  }
 }
 for(const output of plan.outputs)
  assert.deepStrictEqual(readPin(plan.root,bytePin(output.path,output.bytes)),output.bytes);
 const proof=verifyNmsL02PageProof(plan.root,pinFile(plan.root,S.P053_PROOF_PATH),
  predecessor,S.validateP053AdmissionSemantics,
  value=>R.validateP053ReviewedProofClosure(plan.root,value));
 assert.deepStrictEqual(proof,plan.proof,'P053 common reader roundtrip');
 return{status:checkOnly?'P053_ADMISSION_CHECKED':'P053_PREPARED_NOT_REGISTERED',
  proof:pinFile(plan.root,S.P053_PROOF_PATH),registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const [mode,...args]=process.argv.slice(2);
  assert(['--dry-run','--prepare','--check'].includes(mode),
   'use --dry-run | --prepare | --check');
  assert(mode==='--dry-run'?args.length===0:
   args.length===4&&args[0]==='--witness'&&args[2]==='--host',
   'reviewed witness and host-v16 required for write/check');
  const plan=buildP053AdmissionPlan();
  const result=mode==='--dry-run'?
   {status:'P053_DRY_RUN_NOT_REGISTERED',files:plan.proof.files.length,
    external:plan.proof.external.length,registrationEffect:'none',acceptanceEffect:'none'}:
   prepareP053Admission(plan,{witnessPath:args[1],hostPath:args[3]},
    {checkOnly:mode==='--check'});
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
