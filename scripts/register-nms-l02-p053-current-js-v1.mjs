#!/usr/bin/env node
/** Exact, local-only P053 registry transaction. Evidence is deliberately pending review. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,registrySources,
 REGISTRY,DISPATCH,sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {replacePinnedFile,rollbackPinnedFiles} from './register-nms-l02-p062-current-js-v1.mjs';
import {P053_ADMISSION_ID as ID,P053_ADMISSION_CALIBRATION as CALIBRATION,
 P053_SOURCE_ROOT as SOURCE_ROOT,P053_SOURCE as SOURCE,P053_XML as XML,
 P053_RUNTIME as RUNTIME,P053_ACCEPTANCE_EFFECTS,validateP053AdmissionSemantics}
 from '../lib/nms-l02-p053-proof-semantics-v1.mjs';
import {validateP053ReviewedProofClosure} from '../lib/nms-l02-p053-reviewed-seal-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p053-product-20260928',DIR=`${BASE}/registration`;
const SELF='scripts/register-nms-l02-p053-current-js-v1.mjs';
const RECEIPT=`${DIR}/receipt.json`,ACTIVATION='apps/web/lib/nms-l02-p053-admission-activation.ts';
export const HOST_PIN=Object.freeze({path:'catalog/nms-l02-admission-v1/host-v16.json',bytes:47999,
 sha256:'1f0d2dbb09c4f641eb65267ae0d90f073477704bca94c75e6bacd67c01e73e7f'});
export const PROOF_PIN=Object.freeze({path:'work/g678-workflow/candidates/shared-nms002-l02-p053-v1.json',
 bytes:80051,sha256:'604c34d8b52378019c949aefec1212e79c7e6300cab90ad0683f5fe3089645f0'});
export const COUNTS=Object.freeze({oldTotal:637,newTotal:638,oldShared:495,newShared:496,
 oldLesson:63,newLesson:64});
export const EVIDENCE_PATHS=Object.freeze({
 main:`${BASE}/browser/formal-my-lesson-v1/candidate/formal-a2/result.json`,
 pending:`${BASE}/browser/formal-pending-media-v1/candidate/formal-a1/result.json`,
 continuity:`${BASE}/continuity/browser/formal-v1/candidate/formal-a4/result.json`,
 build:`${BASE}/formal-production/build-receipt-v1.json`,
 productionUnset:`${BASE}/formal-production/formal-candidate-v1-unset.json`,
 productionReal:`${BASE}/formal-production/formal-candidate-v1-real-root.json`,
 restoration:`${BASE}/formal-production/production-build-link-restoration-v1.json`,
});
/** Set only from independently reviewed final artifacts. null is an intentional hard stop. */
export const EVIDENCE_PINS=Object.freeze({
 main:{path:EVIDENCE_PATHS.main,bytes:133133,
  sha256:'21f68db3f4e6cf518a1ba142e660199f05e8923a5630daa1dbde2cd0b54ee01c'},
 pending:{path:EVIDENCE_PATHS.pending,bytes:256800,
  sha256:'4e08e5a3679bade840eaf17d963def63198509192f040474d7d3d903cd0c1bb0'},
 continuity:{path:EVIDENCE_PATHS.continuity,bytes:323106,
  sha256:'0677963de5292cbe0c126d0e660fa148607515a6b2b982f9cc3eea64117b2e0a'},
 build:{path:EVIDENCE_PATHS.build,bytes:260468,
  sha256:'cea285514e6e942ab5bfc3047493cca19a364a9fdbeaeac21fba57d59adb6a2e'},
 productionUnset:{path:EVIDENCE_PATHS.productionUnset,bytes:996646,
  sha256:'84753a0fc8449b5121e00b3aefedb1f874fe82f5695d8cca2a94b8d53d76f1c4'},
 productionReal:{path:EVIDENCE_PATHS.productionReal,bytes:996650,
  sha256:'df9b3f6b391a3e0e3366cc60efc6cc52a148b3011c2b675356b231710f6c285f'},
 restoration:{path:EVIDENCE_PATHS.restoration,bytes:7394,
  sha256:'22053d3904c30c6add2ed750a589267d0ff81d35a6a6cda83a8156cb6a074c8b'},
});
const CHECKER='scripts/check-private-current-js-admission-registry-v3.mjs';
const CHECKER_PATHS=Object.freeze([CHECKER,'scripts/check-private-current-js-admission-registry-v3.test.mjs',
 'scripts/check-private-current-js-admission-registry-v2.mjs',
 'scripts/check-private-current-js-admission-registry-v2.test.mjs',
 'scripts/check-private-current-js-admission-registry-v1.mjs',
 'scripts/check-private-current-js-admission-registry-v1.test.mjs']);
const TARGETS=Object.freeze([REGISTRY,...DISPATCH,ACTIVATION]);
const EXTERNAL_ROOTS=Object.freeze([SOURCE_ROOT,
 '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222',
 '/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1',
 '/Volumes/American Dream/hudongpin/g678-p053-formal-build-output-20260928/next-output-v1']);
const PRESERVED_BUILDS=Object.freeze([
 '/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output',
 '/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3',
 '/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p064-formal-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v3',
 '/Volumes/American Dream/hudongpin/g678-p054-formal-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p053-product-build-output-20260928/next-output-v2',
]);
const JSON_BYTES=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const same=(actual,expected,label)=>assert.deepStrictEqual(actual,expected,label);
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const lesson=values=>values.filter(key=>/^shared-nms002-l02-p\d{3}$/u.test(key));
const witnessPath='output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json';
const page53='shared-nms002-l02-p053';

export function assertNoP053Acceptance(value){
 assert(value&&typeof value==='object','acceptance object');
 for(const key of [...Object.keys(P053_ACCEPTANCE_EFFECTS),'originalRuntimeAccepted',
  'originalRuntime','originalRuntimeParityEstablished','audioAcceptance',
  'audioListeningAccepted','humanAccepted','humanReviewed','ownerAcceptance',
  'humanReview','publication'])if(key in value)
  assert.equal(value[key],false,`unaccepted gate ${key}`);
 if(value.acceptanceEffects){
  assert(value.acceptanceEffects&&typeof value.acceptanceEffects==='object'&&
   !Array.isArray(value.acceptanceEffects),'acceptance effects object');
  for(const [key,flag] of Object.entries(value.acceptanceEffects))
   assert.equal(flag,false,`acceptance effects ${key}`);
 }
}
function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact physical AWS source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local-only registration');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION)),source=bytes.toString();
 const marker='export const NMS_L02_P053_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact P053 activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return{data,bytes,source};
}
function candidateActivation(value){
 assert.equal(value?.schemaVersion,1);assert.equal(value.stage,'candidate');
 same(value.host,HOST_PIN,'sealed host');same(value.page,PROOF_PIN,'sealed page');
 assert.equal(value.predecessor?.path,witnessPath,'exact base witness');
 readPin(ROOT,value.predecessor);
}
function projectedDescriptor(registered){
 const code=`import {nmsL02P053AdmissionDescriptor} from './apps/web/lib/nms-l02-p053-admission.server.ts';
 const result=nmsL02P053AdmissionDescriptor();
 if(result.registered!==${registered}||result.descriptor.pages.length!==64||
 result.descriptor.productBridge.registeredAnimationCount!==64||
 result.descriptor.pages[52].animationId!=='${page53}'||
 result.descriptor.glossary.length!==25)
 throw Error('P053 descriptor/registration mismatch');
 console.log(JSON.stringify({registered:result.registered,pages:result.descriptor.pages.length,
 registeredAnimationCount:result.descriptor.productBridge.registeredAnimationCount,
 glossaryCount:result.descriptor.glossary.length,placementId:result.descriptor.pages[52].animationId}));`;
 const run=spawnSync(process.execPath,['--conditions=react-server','--import','tsx',
  '--input-type=module','-e',code],{cwd:ROOT,env:{...process.env,NODE_ENV:'development'},
  encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
 assert.equal(run.status,0,`P053 live descriptor: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function currentPin(pin,beforeTargets,binding){
 if(beforeTargets?.has(pin.path))return same(pin,beforeTargets.get(pin.path),
  `historical target ${pin.path}`);
 if(pin.path===`${binding?.logicalPath}/BUILD_ID`){
  assert.equal(binding.physicalRoot,EXTERNAL_ROOTS.at(-1),'reviewed physical formal build');
  return same({...pinFile(binding.physicalRoot,'BUILD_ID'),path:pin.path},pin,
   'physical formal BUILD_ID');
 }
 if(path.isAbsolute(pin.path)){
  const root=EXTERNAL_ROOTS.find(value=>pin.path.startsWith(`${value}/`));
  assert(root,`unlisted external evidence root ${pin.path}`);
  assert.equal(fs.realpathSync(root),root,'physical external root');
  return same({...pinFile(root,path.relative(root,pin.path)),path:pin.path},pin,
   `external evidence ${pin.path}`);
 }
 readPin(ROOT,pin);
}
export function validateEvidenceInputs(pins,beforeTargets,binding,{transaction=true}={}){
 assert(Array.isArray(pins)&&pins.length>0,'nonempty evidence input pins');
 const seen=new Set();for(const pin of pins){
  assert(!seen.has(pin.path),`duplicate evidence pin ${pin.path}`);seen.add(pin.path);
  currentPin(pin,beforeTargets,binding);
 }
 if(transaction)for(const required of [REGISTRY,ACTIVATION,HOST_PIN.path,PROOF_PIN.path])
  assert(seen.has(required),`missing registration boundary ${required}`);
 return true;
}
export function validateFormalEvidence(docs,beforeTargets){
 const pass='technical-pass-not-acceptance';
 const main=docs.main.data,pending=docs.pending.data,continuity=docs.continuity.data;
 for(const [name,value] of [['main',main],['pending',pending],['continuity',continuity]]){
  assert.equal(value.schemaVersion,1,`${name} schema`);
  assert.equal(value.formal,true,`${name} formal`);
  assert.equal(value.phase,'candidate',`${name} candidate phase`);
  assert.equal(value.status,pass,`${name} technical pass`);
  assert.equal(value.registeredCount,63,`${name} predecessor count`);
  assert.equal(value.renderableCount,64,`${name} renderable count`);
  assert.equal(value.unregisteredCandidateCount,1,`${name} one unregistered candidate`);
  assert.equal(value.activePageCount??64,64,`${name} 64 source pages`);
  assert.equal(value.inputStable??value.inputsStable,true,`${name} inputs stable`);
  same(value.cleanupErrors,[],`${name} cleanup`);
  assertNoP053Acceptance(value);
 }
 assert.equal(main.kind,'nms-l02-p053-formal-my-lesson-browser-v1');
 assert.equal(main.animationId,ID);assert.equal(main.browserClosed,true);
 same(main.failure,null,'no formal main failure');
 same(main.referencedClosure,{proofFiles:66,hostFiles:212,domExternal:135},
  'complete formal closure read');
 same(main.cases.map(row=>({name:row.name,locale:row.locale,level:row.level})),
  [{name:'en-desktop',locale:'en',level:1},{name:'es-mobile',locale:'es',level:2}],
  'both source levels and locales');
 for(const row of main.cases){
  assert.equal(row.step,'complete');assert(!row.failure,'formal main case failure');
  same(row.errors,[],`${row.name} browser errors`);same(row.warnings,[],`${row.name} browser warnings`);
  assert(row.resources.every(item=>item.status===200),'real source resources');
  const snapshots=new Map(row.snapshots.map(item=>[item.label,item]));
  assert(snapshots.get('entry')?.frame===1&&snapshots.get('entry')?.audio.length===0,
   'no initial source narration');
  assert(snapshots.get('natural-modern-clock-hold')?.frame===693,
   'modern frame 693 hold');
  assert(snapshots.get('return-after-audio-cleanup')?.audioStatus==='idle',
   'P053 audio cleanup');
  assert(row.media?.responses.filter(item=>item.url?.includes('/source-audio?')).length>=3,
   'source audio actually fetched');
  for(const response of row.media.responses.filter(item=>item.url?.includes('/source-audio?')))
   same({status:response.status,bytes:response.bytes,sha256:response.sha256,redirected:response.redirected},
    {status:200,bytes:256230,
     sha256:'225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d',
     redirected:false},'source narration bytes');
  for(const pin of row.screenshots)readPin(ROOT,pin);
 }
 validateEvidenceInputs(main.inputs,beforeTargets);
 assert.equal(pending.kind,'nms-l02-p053-formal-pending-narration-browser-v1');
 assert.equal(pending.browserProcessExited,true);same(pending.inputPinsBefore,pending.inputPinsAfter,
  'pending inputs unchanged');same(pending.externalPinsBefore,pending.externalPinsAfter,
  'pending external inputs unchanged');
 validateEvidenceInputs(pending.inputPinsBefore,beforeTargets);
 validateEvidenceInputs(pending.externalPinsBefore,beforeTargets,undefined,{transaction:false});
 same(pending.cases.map(row=>row.name),['en-replay','en-stop-audio','en-navigate-p054',
  'en-navigate-p064','es-replay','es-stop-audio','es-navigate-p054','es-navigate-p064'],
  'all eight bilingual pending-media actions');
 for(const row of pending.cases){
  assert.equal(row.status,pass);assert.equal(row.contextClose,'closed');
  same(row.errors,[],`${row.name} pending errors`);same(row.consoleDiagnostics,[],
   `${row.name} pending console`);
  assert(row.sourceResponse?.status===200&&row.sourceResponse.bytes===256230&&
   row.sourceResponse.sha256==='225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d',
   'full real source response');
  assert(row.captured?.id===row.canceled?.id&&row.captured?.held===true&&
   row.canceled?.failure==='net::ERR_ABORTED'&&
   Number.isFinite(row.canceled?.failureAt),'same real pending Request aborted');
  assert(['fulfilled-after-cancel','browser-rejected-stale-response']
   .includes(row.staleRelease?.result),'stale pending media release observed');
  const stale=row.snapshots.find(item=>item.label==='after-stale-release');
  assert(stale?.sourceBlobUrls.length===0&&stale.events.every(item=>item.type!=='playing')&&
   stale.fetchFailures.some(item=>item.name==='AbortError'),
   'stale response cannot create or play source audio');
  const final=row.snapshots.find(item=>item.label==='return-idle');
  assert(final?.frame==='1'&&final.audioStatus==='idle'&&final.sourceBlobUrls.length===0,
   'stale source cannot start after navigation');
 }
 assert.equal(continuity.kind,'nms-l02-p053-formal-browser-continuity-v1');
 assert.equal(continuity.browserProcessExited,true);
 same(continuity.inputPinsBefore,continuity.inputPinsAfter,'continuity inputs unchanged');
 validateEvidenceInputs(continuity.inputPinsBefore,beforeTargets);
 same(continuity.order,['p053','p054','p064','p062','p061','p060','p058','p056','p055',
  'p052','p064','p054','p053'],'reviewed predecessor sample');
 same(continuity.cases.map(row=>row.locale),['en','es'],'bilingual continuity');
 for(const row of continuity.cases){
  assert.equal(row.status,pass);assert.equal(row.contextClose,'closed');
  same(row.selectedPages,continuity.order,'actual page sequence');
  same(row.errors,[],`${row.locale} continuity errors`);
  same(row.consoleDiagnostics,[],`${row.locale} continuity console`);
  same(row.responseErrors,[],`${row.locale} continuity resources`);
  assert(row.audio?.maxActive===1&&row.audio.active===0&&
   Object.values(row.audio.byPage).every(item=>item.active===0),'audio cleanup');
  assert(row.dialogs.length>=4&&row.dialogs.every(item=>item.focusReturned===true),
   'predecessor glossary focus');
 }
 return true;
}
export function validateProductionEvidence(docs,beforeTargets){
 const build=docs.build.data,unset=docs.productionUnset.data,real=docs.productionReal.data,
  restore=docs.restoration.data,physical=EXTERNAL_ROOTS.at(-1);
 assert.equal(build.exitCode,0,'formal build succeeded');
 assert.equal(build.inputsStable,true,'formal build inputs stable');
 same(build.inputsBefore,build.inputsAfter,'formal build unchanged inputs');
 validateEvidenceInputs(build.inputsBefore,beforeTargets,undefined,{transaction:false});
 assert.equal(build.configRestored,true,'build configuration restored');
 assertNoP053Acceptance(build);
 assert.equal(restore.restored,true,'production link restored');
 assert.equal(restore.buildSucceeded,true,'build succeeded through restoration');
 assert.equal(restore.failure,null,'no restoration failure');
 assert.equal(restore.linkRestorationFailure,null,'no link restoration error');
 assert.equal(restore.configurationCleanupFailure,null,'configuration restored');
 for(const [mode,item] of [['unset',unset],['real-root',real]]){
  assert.equal(item.kind,'nms-l02-p053-formal-production-negative-v1');
  assert.equal(item.sourceMode,mode);assert.equal(item.status,'technical-pass-not-deployment');
  assert.equal(item.expectedCases,2240);assert.equal(item.results.length,2240);
  same(item.errors,[],`${mode} production errors`);
  assert(item.results.every(row=>row.pass===true&&row.status===404&&
   row.redirected===false&&row.bodyBytes<1000),`${mode} negative routes`);
  assert.equal(item.inputStable,true);same(item.inputsBefore,item.inputsAfter,
   `${mode} production inputs unchanged`);
  same(item.directoryBinding?.physicalRoot,physical,`${mode} physical build`);
  assert(item.bundleScan?.files>0&&item.bundleScan.matches.length===0,
   `${mode} bundle excludes private P053 source`);
  validateEvidenceInputs(item.inputsBefore,beforeTargets,item.directoryBinding,
   {transaction:false});
  assertNoP053Acceptance(item);
 }
 return true;
}
function evidenceDocument(relative,pin){
 assert(pin&&typeof pin==='object'&&pin.path===relative,
  `independently reviewed exact evidence pin pending: ${relative}`);
 return{pin,data:readJsonPin(ROOT,pin)};
}
function verifyEvidence(beforeTargets){
 const docs=Object.fromEntries(Object.entries(EVIDENCE_PATHS).map(([key,relative])=>
  [key,evidenceDocument(relative,EVIDENCE_PINS[key])]));
 validateFormalEvidence(docs,beforeTargets);validateProductionEvidence(docs,beforeTargets);
 return Object.fromEntries(Object.entries(docs).map(([key,item])=>[key,item.pin]));
}
function expectedActivation(current){
 candidateActivation(current.data);
 assert.equal((current.source.match(/"stage": "candidate"/gu)??[]).length,1,
  'one candidate stage');
 return Buffer.from(current.source.replace('"stage": "candidate"','"stage": "registered"'));
}
function checkRegistry(){
 const run=spawnSync(process.execPath,[CHECKER],{cwd:ROOT,env:{...process.env,NODE_ENV:'development'},
  encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
 assert.equal(run.status,0,`registry checker: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function planBase(){
 localOnly();const activation=readActivation();candidateActivation(activation.data);
 same(pinFile(ROOT,HOST_PIN.path),HOST_PIN,'sealed host-v16');
 same(pinFile(ROOT,PROOF_PIN.path),PROOF_PIN,'sealed P053 proof');
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP053ReviewedProofClosure(ROOT,proof);
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 validateP053AdmissionSemantics({...proof.packet,freezeManifest:proof.freeze},proof.registration);
 assert.equal(proof.registration.calibrationId,CALIBRATION);
 same(proof.registration.entries.map(row=>row.key),[ID],'one exact registration');
 same(proof.packet.source,SOURCE,'physical source SWF pin');
 same(proof.packet.sourceXml,XML,'source lesson XML pin');
 same(proof.packet.selectedPages[0].runtime,RUNTIME,'P053 held-frame runtime');
 assert.equal(proof.packet.sourceKeyAttributeCalls,0,'no P053 glossary lookup');
 same(proof.packet.acceptanceEffects,P053_ACCEPTANCE_EFFECTS,'no downstream acceptance');
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const transaction=readRegistryTransaction(ROOT),before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===CALIBRATION),'P053 absent');
 assert(!keys(before).includes(ID),'P053 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 same({oldTotal:oldKeys.length,newTotal:newKeys.length,oldShared:shared(oldKeys).length,
  newShared:shared(newKeys).length,oldLesson:lesson(oldKeys).length,
  newLesson:lesson(newKeys).length},COUNTS,'one exact P053 registration');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[ID],'only P053 added');
 for(const row of before.calibrations)same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),
  row,`predecessor retained ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyEvidence(beforeMap);
 const checker=CHECKER_PATHS.map(relative=>pinFile(ROOT,relative));
 const nextBytes=[JSON_BYTES(after),...registrySources(after).map(value=>Buffer.from(value)),
  expectedActivation(activation)];
 const afterPins=TARGETS.map((relative,index)=>bytePin(relative,nextBytes[index]));
 return{producer:pinFile(ROOT,SELF),proof:PROOF_PIN,host:HOST_PIN,
  witness:activation.data.predecessor,evidence,checker,before,after,beforePins,
  afterPins,nextBytes,descriptor:projectedDescriptor(false)};
}
const snapshotName=relative=>`${DIR}/${path.basename(relative)}.before`;
const journal=event=>fs.appendFileSync(path.join(ROOT,DIR,'journal.jsonl'),
 JSON.stringify({at:new Date().toISOString(),...event})+'\n');
const writeNew=(relative,bytes)=>fs.writeFileSync(path.join(ROOT,relative),bytes,{flag:'wx',mode:0o444});
function write(plan){
 assert(!fs.existsSync(path.join(ROOT,DIR)),'registration directory must be absent');
 fs.mkdirSync(path.join(ROOT,DIR));
 const snapshots=[];
 for(const pin of plan.beforePins){const relative=snapshotName(pin.path);
  writeNew(relative,readPin(ROOT,pin));const snapshot=pinFile(ROOT,relative);
  same({...snapshot,path:pin.path},pin,`exact predecessor snapshot ${relative}`);
  snapshots.push(snapshot);}
 const intent={schemaVersion:1,kind:'nms-l02-p053-registration-intent-v1',
  animationId:ID,producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,
  evidence:plan.evidence,checker:plan.checker,before:plan.beforePins,after:plan.afterPins,
  snapshots,counts:COUNTS,sourceLanguage:'fixed-en',
  spanishPresentation:'English-source-fallback',sourceClockSynchronized:false,
  popupCloseReceiverResolved:false,hostCompletion:false,
  acceptanceEffects:P053_ACCEPTANCE_EFFECTS,productCalibrationPassed:false,
  scaleOutAuthorized:false};
 writeNew(`${DIR}/intent.json`,JSON_BYTES(intent));
 journal({step:'prepared',intent:pinFile(ROOT,`${DIR}/intent.json`)});
 const modified=[];
 try{
  const fresh=planBase();same(fresh.evidence,plan.evidence,'evidence CAS');
  same(fresh.checker,plan.checker,'checker CAS');
  same(fresh.afterPins,plan.afterPins,'output CAS');
  TARGETS.forEach((relative,index)=>same(pinFile(ROOT,relative),plan.beforePins[index],
   `pre-write ${relative}`));
  for(let index=0;index<3;index++){
   replacePinnedFile(ROOT,TARGETS[index],plan.beforePins[index],plan.nextBytes[index],
    ()=>modified.push(index));
   journal({step:'written',relative:TARGETS[index],pin:plan.afterPins[index]});}
  same(readRegistryTransaction(ROOT).registry,plan.after,'canonical registry and dispatch');
  replacePinnedFile(ROOT,ACTIVATION,plan.beforePins[3],plan.nextBytes[3],
   ()=>modified.push(3));
  journal({step:'written',relative:ACTIVATION,pin:plan.afterPins[3]});
  const checker=checkRegistry(),descriptor=projectedDescriptor(true);
  const receipt={schemaVersion:1,kind:'nms-l02-p053-local-registration-v1',
   status:'registered-local-current-js-not-acceptance',animationId:ID,
   producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,
   evidence:plan.evidence,checkerPins:plan.checker,checker,
   intent:pinFile(ROOT,`${DIR}/intent.json`),before:plan.beforePins,snapshots,
   outputs:plan.afterPins,counts:COUNTS,descriptor,
   sourceLanguage:intent.sourceLanguage,spanishPresentation:intent.spanishPresentation,
   sourceClockSynchronized:false,popupCloseReceiverResolved:false,hostCompletion:false,
   acceptanceEffects:P053_ACCEPTANCE_EFFECTS,productCalibrationPassed:false,
   scaleOutAuthorized:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,JSON_BYTES(receipt));
  return{status:'P053_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',
   receipt:pinFile(ROOT,RECEIPT),descriptor};
 }catch(error){
  journal({step:'failure',reason:String(error.message)});
  const records=modified.map(index=>({relative:TARGETS[index],
   beforeBytes:readPin(ROOT,{...plan.beforePins[index],path:snapshotName(TARGETS[index])}),
   after:plan.afterPins[index]}));
  rollbackPinnedFiles(ROOT,records,journal);throw error;
 }
}
function check(){
 localOnly();const receipt=readJsonPin(ROOT,pinFile(ROOT,RECEIPT));
 assert.equal(receipt.kind,'nms-l02-p053-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,ID);same(receipt.counts,COUNTS,'registered counts');
 assertNoP053Acceptance(receipt);same(receipt.acceptanceEffects,P053_ACCEPTANCE_EFFECTS,
  'downstream acceptance unchanged');
 same(receipt.producer,pinFile(ROOT,SELF),'registered producer');
 same(receipt.proof,PROOF_PIN,'registered proof');same(receipt.host,HOST_PIN,'registered host');
 readPin(ROOT,receipt.witness);
 const intent=readJsonPin(ROOT,receipt.intent);
 assert.equal(intent.kind,'nms-l02-p053-registration-intent-v1');
 for(const field of ['animationId','producer','proof','host','witness','evidence','counts',
  'snapshots','sourceLanguage','spanishPresentation','sourceClockSynchronized',
  'popupCloseReceiverResolved','hostCompletion','acceptanceEffects','productCalibrationPassed',
  'scaleOutAuthorized'])same(intent[field],receipt[field],`intent/receipt ${field}`);
 same(intent.checker,receipt.checkerPins,'checker provenance');
 for(const pin of receipt.checkerPins)readPin(ROOT,pin);
 same(intent.before,receipt.before,'prior targets');same(intent.after,receipt.outputs,'new targets');
 const historical=new Map(receipt.before.map(pin=>[pin.path,pin]));
 same(verifyEvidence(historical),receipt.evidence,'evidence remains current');
 for(let index=0;index<TARGETS.length;index++){
  const relative=TARGETS[index];same(receipt.snapshots[index].path,snapshotName(relative),
   'owned snapshot path');
  same(pinFile(ROOT,relative),receipt.outputs[index],`registered output ${relative}`);
  same(bytePin(relative,readPin(ROOT,receipt.snapshots[index])),receipt.before[index],
   `predecessor preserved ${relative}`);
 }
 const transaction=readRegistryTransaction(ROOT),prior=JSON.parse(readPin(ROOT,receipt.snapshots[0]));
 const nowKeys=keys(transaction.registry),oldKeys=keys(prior);
 same({oldTotal:oldKeys.length,newTotal:nowKeys.length,oldShared:shared(oldKeys).length,
  newShared:shared(nowKeys).length,oldLesson:lesson(oldKeys).length,
  newLesson:lesson(nowKeys).length},COUNTS,'registered registry counts');
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP053ReviewedProofClosure(ROOT,proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===CALIBRATION),
  proof.registration,'exact P053 registration fragment');
 for(const row of prior.calibrations)same(transaction.registry.calibrations.find(item=>
  item.calibrationId===row.calibrationId),row,`retained predecessor ${row.calibrationId}`);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,PROOF_PIN,'registered page');same(activation.data.host,HOST_PIN,
  'registered host');same(activation.data.predecessor,receipt.witness,'predecessor');
 same(checkRegistry(),receipt.checker,'registered canonical registry');
 same(projectedDescriptor(true),receipt.descriptor,'registered live descriptor');
 return{status:'P053_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P053_REGISTRATION_READY_NOT_WRITTEN',producer:plan.producer,
    proof:plan.proof,evidence:plan.evidence,checker:plan.checker,
    before:plan.beforePins,after:plan.afterPins,counts:COUNTS,
    registrationEffect:'none',acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
