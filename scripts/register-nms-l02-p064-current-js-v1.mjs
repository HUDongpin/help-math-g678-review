#!/usr/bin/env node
/** One source-bound P064 local Current-JS transaction. --plan/--check do not write. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,registrySources,
 REGISTRY,DISPATCH,sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {replacePinnedFile,rollbackPinnedFiles} from './register-nms-l02-p062-current-js-v1.mjs';
import {P064_ADMISSION_ID as ID,P064_ADMISSION_CALIBRATION as CALIBRATION,
 P064_SOURCE_ROOT as SOURCE_ROOT,P064_SOURCE as SOURCE,P064_XML as XML,
 P064_RUNTIME as RUNTIME,P064_AUDIO_INDEX,P064_ACCEPTANCE_KEYS,
 validateP064ProofClosure} from
 '../lib/nms-l02-p064-admission-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p064-product-20260928',DIR=`${BASE}/registration`;
const RECEIPT=`${DIR}/receipt.json`,SELF='scripts/register-nms-l02-p064-current-js-v1.mjs';
const ACTIVATION='apps/web/lib/nms-l02-p064-admission-activation.ts';
const HOST='catalog/nms-l02-admission-v1/host-v14.json';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json';
export const HOST_PIN=Object.freeze({path:HOST,bytes:38775,
 sha256:'34a4280e72e90d55db7cd8f12587c39095c73ca1fcb7b253d221be098e980d9c'});
export const PROOF_PIN=Object.freeze({path:PROOF,bytes:44928,
 sha256:'91ecc6b6b5dece0d0b3521c5d150b25be0a4bbf06b85b776fdb7f146d8af0ec7'});
const EVIDENCE=Object.freeze({
 browser:`${BASE}/browser-formal/candidate/formal-v2/evidence.json`,
 reviewBranches:`${BASE}/browser-formal-review-branches/candidate/formal-v1/evidence.json`,
 continuity:`${BASE}/continuity/browser/formal-candidate-v1/root-v1/result.json`,
 buildIntent:`${BASE}/admission/formal-production-build-intent-v1.json`,
 build:`${BASE}/admission/formal-production-build-receipt-v1.json`,
 production:`${BASE}/production/formal-admission-candidate-v1.json`,
 restoration:`${BASE}/admission/formal-production-build-link-restoration-v1.json`,
});
const LOGICAL_BUILD='apps/web/.next-alg-p001-production-scan';
const OLD_BUILD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output';
const NEW_BUILD='/Volumes/American Dream/hudongpin/g678-p064-formal-build-output-20260928/next-output-v1';
const PRESERVED_BUILDS=Object.freeze({p055:OLD_BUILD,
 p057:'/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2',
 p058:'/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2',
 p060:'/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1',
 p061:'/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3',
 p062:'/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1',
 p064Product:'/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1'});
const TARGETS=Object.freeze([REGISTRY,...DISPATCH,ACTIVATION]);
export const COUNTS=Object.freeze({oldTotal:635,newTotal:636,oldShared:493,newShared:494,
 oldLesson:61,newLesson:62});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const same=(actual,expected,label)=>assert.deepStrictEqual(actual,expected,label);
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const lesson=values=>values.filter(key=>/^shared-nms002-l02-p\d{3}$/u.test(key));
export const assertNoP064Acceptance=value=>{
 for(const key of [...P064_ACCEPTANCE_KEYS,'originalRuntimeAccepted',
  'originalRuntime','originalRuntimeParityEstablished','audioAcceptance',
  'audioListeningAccepted','humanAccepted',
  'humanReviewed','ownerAcceptance','humanReview','publication'])
  if(key in value)assert.equal(value[key],false,`unaccepted gate ${key}`);
 if(value.acceptanceEffects)for(const key of P064_ACCEPTANCE_KEYS)
  assert.equal(value.acceptanceEffects[key],false,`acceptanceEffects.${key}`);
};
const noAcceptance=assertNoP064Acceptance;
function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact AWS source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local-only registration');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION)),source=bytes.toString();
 const marker='export const NMS_L02_P064_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact P064 activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return{data,bytes,source};
}
function projectedDescriptor(registered){
 const code=`import {nmsL02P064AdmissionDescriptor} from './apps/web/lib/nms-l02-p064-admission.server.ts';
 const result=nmsL02P064AdmissionDescriptor();
 if(result.registered!==${registered}||result.descriptor.pages.length!==64||
 result.descriptor.productBridge.registeredAnimationCount!==62||
 result.descriptor.pages[63].animationId!=='${ID}'||result.descriptor.glossary.length!==25)
 throw Error('P064 descriptor registration/placement/glossary mismatch');
 console.log(JSON.stringify({registered:result.registered,pages:result.descriptor.pages.length,
 registeredAnimationCount:result.descriptor.productBridge.registeredAnimationCount,
 glossaryCount:result.descriptor.glossary.length,placementId:result.descriptor.pages[63].animationId}));`;
 const run=spawnSync(process.execPath,['--conditions=react-server','--import','tsx',
  '--input-type=module','-e',code],{cwd:ROOT,env:{...process.env,NODE_ENV:'development'},
  encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
 assert.equal(run.status,0,`P064 descriptor: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function currentPin(pin,beforeTargets){
 if(beforeTargets?.has(pin.path))same(pin,beforeTargets.get(pin.path),`historical target ${pin.path}`);
 else if(pin.path===`${LOGICAL_BUILD}/BUILD_ID`)
  same({...pinFile(NEW_BUILD,'BUILD_ID'),path:pin.path},pin,'physical formal BUILD_ID');
 else if(path.isAbsolute(pin.path)){
  const roots=[SOURCE_ROOT,'/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222',
   '/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1'];
  const root=roots.find(value=>pin.path.startsWith(`${value}/`));
  assert(root,`unlisted external evidence root ${pin.path}`);
  assert.equal(fs.realpathSync(root),root,'physical external evidence root');
  same({...pinFile(root,path.relative(root,pin.path)),path:pin.path},pin,
   `external evidence ${pin.path}`);
 }else readPin(ROOT,pin);
}
function evidencePins(pins,beforeTargets,label,{requireTransaction=true}={}){
 assert(Array.isArray(pins)&&pins.length>0,`${label} input pins`);
 const seen=new Set();for(const pin of pins){
  assert(!seen.has(pin.path),`${label} duplicate pin ${pin.path}`);seen.add(pin.path);
  currentPin(pin,beforeTargets);
 }
 if(requireTransaction)for(const item of [REGISTRY,ACTIVATION,HOST,PROOF])
  assert(seen.has(item),`${label} missing ${item}`);
}
const evidenceDocument=relative=>{const pin=pinFile(ROOT,relative);
 return{pin,data:readJsonPin(ROOT,pin)};};
function candidateActivation(value){
 assert.equal(value?.schemaVersion,1);assert.equal(value.stage,'candidate');
 same(value.host,HOST_PIN,'formal host');same(value.page,PROOF_PIN,'formal page proof');
}
function sourceProof(value){
 same(value,{...SOURCE,path:path.join(SOURCE_ROOT,SOURCE.path)},'actual FQ source SWF');
}
function evidenceStable(value,beforeTargets,label){
 same(value.inputsBefore,value.inputsAfter,`${label} inputs stable`);
 assert.equal(value.inputsUnchanged,true,`${label} source inputs unchanged`);
 assert.equal(value.browserProcessExited,true,`${label} browser exited`);
 same(value.cleanupErrors,[],`${label} cleanup errors`);
 evidencePins(value.inputsBefore,beforeTargets,label);
}
function verifySourceAudioResponse(audio,index){
 const source=index.sourceMediaRows.find(row=>row.folderCode===audio.folder&&
  row.questionId===audio.questionId&&row.role===(audio.option?'option':'question')&&
  row.option===audio.option);
 assert(source,`indexed source audio ${audio.url}`);
 const expected=readPin(SOURCE_ROOT,{path:source.relativePath,bytes:source.bytes,
  sha256:source.sha256});
 assert([200,206].includes(audio.status)&&audio.contentType==='audio/mpeg'&&
  audio.redirected===false&&audio.etag===`"${source.sha256}"`,
  `guarded source audio response ${audio.url}`);
 let interval=expected;
 if(audio.status===206){
  const range=/^bytes (\d+)-(\d+)\/(\d+)$/u.exec(audio.contentRange??'');
  assert(range&&Number(range[3])===expected.length,'source audio byte-range total');
  const begin=Number(range[1]),end=Number(range[2]);
  assert(Number.isSafeInteger(begin)&&Number.isSafeInteger(end)&&begin>=0&&
   end>=begin&&end<expected.length,'bounded source audio byte range');
  interval=expected.subarray(begin,end+1);
 }
 same({bytes:audio.bytes,sha256:audio.sha256},
  {bytes:interval.length,sha256:sha256(interval)},'physical source audio response bytes');
}
export function validateP064FormalBrowser(item,beforeTargets){
 const b=item.data,passed='formal-candidate-my-lesson-browser-passed-not-acceptance';
 const audioIndex=readJsonPin(ROOT,P064_AUDIO_INDEX);
 assert.equal(audioIndex.sourceMediaRows.length,350,'35 questions times five source cues');
 assert.equal(b.kind,'nms-l02-p064-formal-my-lesson-browser-plan-v1');
 assert.equal(b.animationId,ID);assert.equal(b.status,passed);
 assert.equal(b.stage,'candidate');assert.equal(b.formal,true);
 assert.equal(b.registeredPageCount,61);assert.equal(b.renderableCount,62);
 assert.equal(b.unregisteredCandidateCount,1);assert.equal(b.activePageCount,64);
 assert.equal(b.sourceQuestionCount,35);assert.equal(b.drawCount,10);
 assert.equal(b.sourceOptionCount,4);
 sourceProof(b.source);same(b.sourceXml,{...XML,path:path.join(SOURCE_ROOT,XML.path)},'source XML');
 assert.equal(b.sourceQuizContract.sha256,'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5');
 candidateActivation(b.activation);same(b.preparedProof,PROOF_PIN,'prepared browser proof');
 assert.equal(b.registrationReceipt,null,'candidate has no registration receipt');
 assert.equal(b.historicalHostAssociationEstablished,false);
 assert.equal(b.sourceAudioListeningAccepted,false);noAcceptance(b);
 evidenceStable(b,beforeTargets,'formal main browser');
 same(b.cases.map(row=>({name:row.name,locale:row.locale,width:row.width,
  height:row.height,reduced:row.reduced,seed:row.seed,firstQuestion:row.expectedFirstQuestion})),[
  {name:'en-desktop-q10-risk',locale:'en',width:1440,height:900,reduced:false,seed:9713,firstQuestion:10},
  {name:'es-mobile-q5-risk',locale:'es',width:390,height:844,reduced:true,seed:9714,firstQuestion:5},
 ],'exact EN/ES source-risk cases');
 for(const row of b.cases){
  assert.equal(row.status,passed,`${row.name} formal pass`);
  assert(row.response?.status===200&&row.ready===true&&row.errors.length===0&&
   row.warnings.length===0&&row.cleanupErrors.length===0,
   `${row.name} valid browser and cleanup`);
  assert.equal(row.questionSequence.length,10);assert.equal(row.reviewSequence.length,10);
  assert.equal(new Set(row.questionSequence.map(value=>value.questionId)).size,10);
  assert.equal(row.questionSequence[0].questionId,row.expectedFirstQuestion);
  assert.equal(row.reviewSequence[0].questionId,row.expectedFirstQuestion);
  if(row.expectedFirstQuestion===10)
   assert(row.reviewSequence[0].risk===true,'Q10 D review lookup risk disclosed');
  else assert(row.observations.some(value=>value.sourceRisks?.includes('q5-dynamic-fields')),
   'Q5 dynamic field interpretation disclosed');
  const terminal=row.observations.find(value=>value.label==='host-exit-unresolved');
  assert(terminal?.phase==='host-exit-unresolved'&&terminal.fq.attempted===10&&
   terminal.fq.correct===row.expectedCorrect&&terminal.currentPage==='64',
   `${row.name} actual host score and unresolved exit`);
  assert(row.observations.some(value=>value.label==='host-replay'&&
   value.fq.attempted===0&&value.fq.correct===0),'host Replay resets aggregate');
  assert(row.observations.some(value=>value.label==='return-p064'&&
   value.fq.attempted===0&&value.currentPage==='64'),'P062 navigation returns cleanly');
  assert(row.requests.every(request=>request.allowed===true)&&
   row.requests.every(request=>!request.path.includes('.hot-update.')),
   'same-origin stable browser');
  for(const pin of row.screenshots)readPin(ROOT,pin);
  for(const audio of row.audioResponses)verifySourceAudioResponse(audio,audioIndex);
  noAcceptance(row);
 }
 return true;
}
export function validateP064FormalReviewBranches(item,beforeTargets){
 const b=item.data,passed='formal-candidate-review-branches-passed-not-acceptance';
 assert.equal(b.kind,'nms-l02-p064-formal-review-branches-browser-plan-v1');
 assert.equal(b.animationId,ID);assert.equal(b.status,passed);
 assert.equal(b.stage,'candidate');assert.equal(b.formal,true);
 assert.equal(b.registeredPageCount,61);assert.equal(b.renderableCount,62);
 assert.equal(b.unregisteredCandidateCount,1);assert.equal(b.activePageCount,64);
 assert.equal(b.sourceQuestionCount,35);assert.equal(b.sourceDrawCount,10);
 sourceProof(b.source);candidateActivation(b.activation);
 same(b.preparedProof,PROOF_PIN,'prepared review proof');
 assert.equal(b.registrationReceipt,null);noAcceptance(b);
 evidenceStable(b,beforeTargets,'formal review branches');
 same(b.cases.map(row=>({name:row.name,locale:row.locale,seed:row.seed,
  firstQuestion:row.firstQuestion,selected:row.selected,sourceCorrect:row.sourceCorrect})),[
  {name:'en-desktop-q21-c',locale:'en',seed:7137,firstQuestion:21,selected:'C',sourceCorrect:'D'},
  {name:'es-mobile-q23-c',locale:'es',seed:1975,firstQuestion:23,selected:'C',sourceCorrect:'B'},
 ],'exact Q21 C and Q23 C branches');
 for(const row of b.cases){
  assert.equal(row.status,passed);assert(row.response?.status===200&&row.ready===true&&
   row.errors.length===0&&row.warnings.length===0&&row.cleanupErrors.length===0);
  assert.equal(row.questions.length,10);assert.equal(row.reviews.length,10);
  assert.equal(new Set(row.questions.map(value=>value.questionId)).size,10);
  assert.equal(row.questions[0].questionId,row.firstQuestion);
  assert.equal(row.questions[0].answer,'C');assert.equal(row.reviews[0].risk,row.reviewInstance);
  const terminal=row.observations.find(value=>value.label==='host-exit-unresolved');
  assert(terminal?.phase==='host-exit-unresolved'&&terminal.attempted===10&&
   terminal.correct===9&&terminal.currentPage==='64');
  assert.equal(row.hostPageMarkedComplete,'false');
  assert(row.observations.some(value=>value.label==='review-1'&&
   value.risk.some(risk=>risk.kind==='review-lookup-miss'&&
    risk.reviewInstance===row.reviewInstance&&risk.feedbackLookup==='matched')));
  assert(row.requests.every(request=>request.allowed===true)&&
   row.requests.every(request=>!request.path.includes('.hot-update.')));
  for(const pin of row.screenshots)readPin(ROOT,pin);
  noAcceptance(row);
 }
 return true;
}
export function validateP064Continuity(item,beforeTargets){
 const c=item.data;
 assert.equal(c.kind,'nms-l02-p064-formal-candidate-browser-continuity-v1');
 assert.equal(c.status,'technical-pass-not-acceptance');
 assert.equal(c.formal,true);assert.equal(c.inputStable,true);
 assert.equal(c.browserProcessExited,true);same(c.cleanupErrors,[],'continuity cleanup');
 noAcceptance(c);
 same(c.order,['p064','p062','p061','p060','p058','p056','p055','p052','p064'],
  'exact nine-stop predecessor sequence');
 same(c.inputPinsBefore,c.inputPinsAfter,'continuity input pins stable');
 evidencePins(c.inputPinsBefore,beforeTargets,'continuity');
 assert.equal(c.cases.length,2);same(c.cases.map(row=>row.locale),['en','es'],
  'bilingual predecessor chain');
 for(const row of c.cases){
  assert.equal(row.seed,0,'continuity is default-seed route only');
  assert.equal(row.firstQuestion,4,'default-seed first source question Q4');
  assert.equal(row.status,'technical-pass-not-acceptance');
  assert.equal(row.contextClose,'closed');assert.equal(row.responseStatus,200);
  same(row.selectedPages,c.order,'actual source-order traversal');
  same(row.errors,[],`${row.locale} continuity errors`);
  assert(row.developmentUpdates.every(value=>!value.url.includes('.hot-update.')),
   'no HMR during continuity');
  const states=new Map(row.observations.map(value=>[value.step,value]));
  for(const label of ['p064-entry','p062-entry','p061-entry','p060-entry',
   'p058-source-controls','p056-source-controls','p055-source-controls',
   'p052-ready','p064-return','p064-final-paused'])
   assert(states.has(label),`${row.locale} predecessor state ${label}`);
  for(const label of ['p064-entry','p064-return']){
   const state=states.get(label);
   assert(state.animationId===ID&&state.availability==='registered'&&
    state.currentPage==='64'&&state.ready==='ready'&&state.phase==='question'&&
    state.questionId===4&&state.audio.active===0&&
    state.fq.attempted===0&&state.fq.correct===0&&
    state.fq.awarded===0&&state.fq.possible===0&&
    state.nativeAudio.length===10&&state.nativeAudio.every(audio=>audio.paused),
    `${row.locale} P064 remains runnable`);
   assert.equal(new URL(state.url).search,'',
    'default seed0 continuity only; no seeded-query predecessor audio claim');
  }
  assert(row.dialogs.length>=4&&row.dialogs.every(dialog=>dialog.focusReturned===true),
   'source glossary dialogs return focus');
  same(row.p064AudioRequests,[],`${row.locale} no P064 audio request in continuity`);
  same(row.responseErrors,[],`${row.locale} predecessor resource responses`);
  assert.equal(row.scriptResourceObserved,true,'P055 source renderer script loaded');
  for(const pathname of ['/migration-assets/nms-l02-p062/sprite-315.mp3',
   '/migration-assets/nms-l02-p061/sprite-315.mp3',
   '/migration-assets/nms-l02-p060/sprite-391.mp3',
   '/migration-assets/nms-l02-p058/main.mp3',
   '/migration-assets/nms-l02-p056/main.mp3',
   '/migration-assets/nms-l02-p056-predecessors/p055-main.mp3',
   '/migration-assets/nms-l02-p056-predecessors/p052-sprite-350.mp3'])
   assert(row.assets.some(asset=>new URL(asset.url).pathname===pathname&&
    asset.status===200&&asset.redirected===false&&asset.bytes>0&&
    /^[a-f0-9]{64}$/u.test(asset.sha256)&&asset.contentType?.startsWith('audio/mpeg')),
    `actual predecessor source audio ${pathname}`);
  assert(row.audio?.maxActive===1&&row.audio.active===0&&
   Object.values(row.audio.byPage).every(bucket=>bucket.active===0),
   'one active voice and predecessor audio cleanup');
  noAcceptance(row);
 }
 return true;
}
function physicalBuildId(root){
 assert.equal(fs.realpathSync(root),root,'physical historical build');
 return{...pinFile(root,'BUILD_ID'),path:`${root}/BUILD_ID`};
}
export function validateP064Production(documents,beforeTargets){
 const intent=documents.buildIntent.data,build=documents.build.data,
  p=documents.production.data,r=documents.restoration.data;
 assert(intent.schemaVersion===1&&intent.kind==='nms-l02-p064-formal-production-build-intent-v1');
 assert.equal(intent.logicalPath,LOGICAL_BUILD);assert.equal(intent.beforeTarget,OLD_BUILD);
 assert.equal(intent.temporaryTarget,NEW_BUILD);
 assert(build.schemaVersion===1&&build.kind==='p064-formal-local-production-build-v1'&&
  build.exitCode===0&&build.inputsStable===true&&build.configRestored===true,
  'exact successful formal local build');
 same(build.inputsBefore,build.inputsAfter,'build source stability');
 same(intent.inputs,build.inputsBefore,'intent to build inputs');
 same(intent.config,build.configBefore,'intent build configuration');
 same(build.configBefore,build.configAfterRestore,'build config restored');
 evidencePins(build.inputsBefore,beforeTargets,'formal build');
 evidencePins(build.configAfterRestore,beforeTargets,'formal build config',
  {requireTransaction:false});
 assert(r.schemaVersion===1&&
  r.kind==='nms-l02-p064-formal-production-build-link-restoration-v1'&&
  r.logicalPath===LOGICAL_BUILD&&r.beforeTarget===OLD_BUILD&&
  r.temporaryTarget===NEW_BUILD&&r.afterTarget===OLD_BUILD&&
  r.restored===true&&r.buildSucceeded===true&&r.failure===null&&
  r.linkRestorationFailure===null&&r.configurationCleanupFailure===null,
  'formal build link/config restoration');
 const logical=path.join(ROOT,LOGICAL_BUILD);
 assert(fs.lstatSync(logical).isSymbolicLink()&&fs.readlinkSync(logical)===OLD_BUILD&&
  fs.realpathSync(logical)===OLD_BUILD,'original logical build link restored');
 same(physicalBuildId(NEW_BUILD),r.p064FormalBuildId,'physical formal BUILD_ID');
 same({...r.p064FormalBuildId,path:`${LOGICAL_BUILD}/BUILD_ID`},build.buildId,
  'successful formal build ID');
 same(intent.oldBuildId,r.oldBuildIdBefore,'original link BUILD_ID intent');
 same(r.oldBuildIdBefore,physicalBuildId(OLD_BUILD),'original physical BUILD_ID');
 same(r.oldBuildIdAfter,r.oldBuildIdBefore,'original BUILD_ID preserved');
 for(const [name,root] of Object.entries(PRESERVED_BUILDS)){
  const current=physicalBuildId(root);
  same(r[`${name}BuildIdBefore`],current,`${name} historical BUILD_ID before`);
  same(r[`${name}BuildIdAfter`],current,`${name} historical BUILD_ID after`);
  same(intent[`preserved${name[0].toUpperCase()+name.slice(1)}BuildId`],current,
   `${name} historical BUILD_ID intent`);
 }
 assert.equal(intent.dependencyLink,path.join(path.dirname(NEW_BUILD),'node_modules'));
 assert.equal(intent.dependencyTarget,path.join(ROOT,'node_modules'));
 assert(fs.lstatSync(intent.dependencyLink).isSymbolicLink()&&
  fs.readlinkSync(intent.dependencyLink)===intent.dependencyTarget&&
  fs.realpathSync(intent.dependencyLink)===intent.dependencyRealRoot,
  'exact source-bounded dependency link');
 same(intent.sharpPackage,{...pinFile(intent.dependencyRealRoot,'sharp/package.json'),
  path:'node_modules/sharp/package.json'},'pinned build dependency');
 assert(p.schemaVersion===1&&p.kind==='nms-l02-p064-formal-local-production-negative-v1'&&
  p.status==='technical-pass-not-deployment'&&p.origin==='http://127.0.0.1:3332'&&
  p.inputStable===true&&p.errors.length===0&&p.expectedCases===1700&&
  p.results.length===1700&&p.results.every(row=>row.status===404&&row.pass===true&&
   row.bodyBytes<1000&&row.redirected===false&&['GET','HEAD'].includes(row.method)),
  '1700 exact local production denials');
 assert.equal(new Set(p.results.map(row=>row.path)).size,425,'425 negative route variants');
 assert(p.bundleScan.files>0&&p.bundleScan.bytes>0&&p.bundleScan.matches.length===0&&
  p.bundleScan.markers.includes(SOURCE.sha256),'P064 compiled payload absent');
 same(p.inputsBefore,p.inputsAfter,'production inputs stable');
 evidencePins(p.inputsBefore,beforeTargets,'formal production');
 candidateActivation(p.activation);
 same(p.directoryBinding,{logicalPath:LOGICAL_BUILD,physicalRoot:NEW_BUILD,
  symlinkTarget:NEW_BUILD},'production exact build directory');
 assert.equal(p.buildLog,`${BASE}/admission/formal-production-build-v1.log`);
 assert(p.inputsBefore.some(pin=>pin.path===p.buildLog),'pinned successful build log');
 assert.equal(p.buildIdBefore,fs.readFileSync(path.join(NEW_BUILD,'BUILD_ID'),'utf8').trim());
 assert.equal(p.buildIdAfter,p.buildIdBefore);
 same(p.productBuildIdBefore,p.productBuildIdAfter,'historical P064 product build ID stable');
 assert.equal(fs.realpathSync(PRESERVED_BUILDS.p064Product),PRESERVED_BUILDS.p064Product,
  'physical historical P064 product build');
 same(p.productBuildIdBefore,pinFile(PRESERVED_BUILDS.p064Product,'BUILD_ID'),
  'historical P064 product build unmodified');
 noAcceptance(p);
 return true;
}
export function verifyP064RegistrationEvidence(beforeTargets){
 const documents=Object.fromEntries(Object.entries(EVIDENCE).map(([name,relative])=>
  [name,evidenceDocument(relative)]));
 validateP064FormalBrowser(documents.browser,beforeTargets);
 validateP064FormalReviewBranches(documents.reviewBranches,beforeTargets);
 validateP064Continuity(documents.continuity,beforeTargets);
 validateP064Production(documents,beforeTargets);
 return Object.fromEntries(Object.entries(documents).map(([name,item])=>[name,item.pin]));
}
function expectedActivation(current){
 assert.equal(current.data.schemaVersion,1);assert.equal(current.data.stage,'candidate');
 same(current.data.host,HOST_PIN,'candidate host');same(current.data.page,PROOF_PIN,'candidate proof');
 assert.equal((current.source.match(/"stage": "candidate"/gu)??[]).length,1,
  'one activation stage field');
 return Buffer.from(current.source.replace('"stage": "candidate"','"stage": "registered"'));
}
function planBase(){
 localOnly();const activation=readActivation();candidateActivation(activation.data);
 readPin(ROOT,activation.data.predecessor);
 same(pinFile(ROOT,HOST),HOST_PIN,'sealed host-v14');
 same(pinFile(ROOT,PROOF),PROOF_PIN,'prepared P064 proof');
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP064ProofClosure(proof);
 assert.equal(proof.registration.calibrationId,CALIBRATION);
 assert.equal(proof.registration.entries.length,1);
 assert.equal(proof.registration.entries[0].key,ID);
 same(proof.packet.source,SOURCE,'P064 source');same(proof.packet.sourceXml,XML,'P064 XML');
 same(proof.packet.selectedPages[0].runtime,RUNTIME,'P064 source-quiz runtime');
 assert(proof.packet.sourceKeyAttributeCalls===0&&proof.packet.glossary.length===0,
  'no invented P064 glossary terms');
 noAcceptance(proof.packet.acceptanceEffects);
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const transaction=readRegistryTransaction(ROOT),before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===CALIBRATION),
  'P064 calibration not yet registered');
 assert(!keys(before).includes(ID),'P064 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 same({oldTotal:oldKeys.length,newTotal:newKeys.length,oldShared:shared(oldKeys).length,
  newShared:shared(newKeys).length,oldLesson:lesson(oldKeys).length,
  newLesson:lesson(newKeys).length},COUNTS,'one exact local P064 registration');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[ID],'only P064 added');
 for(const row of before.calibrations)
  same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
   `predecessor calibration retained ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyP064RegistrationEvidence(beforeMap);
 const generated=registrySources(after);
 const nextBytes=[json(after),...generated.map(value=>Buffer.from(value)),
  expectedActivation(activation)];
 const afterPins=TARGETS.map((relative,index)=>bytePin(relative,nextBytes[index]));
 const descriptor=projectedDescriptor(false);
 return{producer:pinFile(ROOT,SELF),proof:PROOF_PIN,host:HOST_PIN,
  witness:activation.data.predecessor,evidence,before,after,beforePins,afterPins,
  nextBytes,descriptor};
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
  same({...snapshot,path:pin.path},pin,'exact predecessor snapshot');snapshots.push(snapshot);}
 const intent={schemaVersion:1,kind:'nms-l02-p064-registration-intent-v1',
  animationId:ID,producer:plan.producer,proof:plan.proof,host:plan.host,
  witness:plan.witness,evidence:plan.evidence,before:plan.beforePins,
  after:plan.afterPins,snapshots,counts:COUNTS,sourceLanguage:'fixed-en',
  spanishPresentation:'English-source-fallback',
  quizSource:'35x4 source answer semantics; modern Q5 and review lookup risks disclosed',
  postReviewHostExitResolved:false,originalRuntime:false,audioAcceptance:false,
  humanReview:false,ownerAcceptance:false,strictComplete:false,publication:false};
 writeNew(`${DIR}/intent.json`,json(intent));journal({step:'prepared',intent:pinFile(ROOT,`${DIR}/intent.json`)});
 const modified=[];
 try{
  const fresh=planBase();same(fresh.evidence,plan.evidence,'evidence compare-and-swap');
  same(fresh.afterPins,plan.afterPins,'projected output compare-and-swap');
  TARGETS.forEach((relative,index)=>same(pinFile(ROOT,relative),plan.beforePins[index],
   `pre-write ${relative}`));
  for(let index=0;index<3;index++){
   replacePinnedFile(ROOT,TARGETS[index],plan.beforePins[index],plan.nextBytes[index],
    ()=>modified.push(index));
   journal({step:'written',relative:TARGETS[index],pin:plan.afterPins[index]});}
  same(readRegistryTransaction(ROOT).registry,plan.after,'canonical registry/dispatch');
  replacePinnedFile(ROOT,ACTIVATION,plan.beforePins[3],plan.nextBytes[3],
   ()=>modified.push(3));
  journal({step:'written',relative:ACTIVATION,pin:plan.afterPins[3]});
  const descriptor=projectedDescriptor(true);
  const receipt={schemaVersion:1,kind:'nms-l02-p064-local-registration-v1',
   status:'registered-local-current-js-not-acceptance',animationId:ID,
   producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,
   evidence:plan.evidence,intent:pinFile(ROOT,`${DIR}/intent.json`),
   before:plan.beforePins,snapshots,outputs:plan.afterPins,counts:COUNTS,descriptor,
   sourceLanguage:intent.sourceLanguage,spanishPresentation:intent.spanishPresentation,
   quizSource:intent.quizSource,postReviewHostExitResolved:false,originalRuntime:false,
   audioAcceptance:false,humanReview:false,ownerAcceptance:false,
   strictComplete:false,publication:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,json(receipt));
  return{status:'P064_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',
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
 assert.equal(receipt.kind,'nms-l02-p064-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,ID);same(receipt.counts,COUNTS,'registered counts');
 noAcceptance(receipt);assert.equal(receipt.postReviewHostExitResolved,false);
 same(receipt.producer,pinFile(ROOT,SELF),'registered producer');
 same(receipt.proof,PROOF_PIN,'registered proof');same(receipt.host,HOST_PIN,'registered host');
 readPin(ROOT,receipt.witness);same(receipt.intent.path,`${DIR}/intent.json`,'intent path');
 const intent=readJsonPin(ROOT,receipt.intent);
 assert.equal(intent.kind,'nms-l02-p064-registration-intent-v1');
 noAcceptance(intent);assert.equal(intent.postReviewHostExitResolved,false);
 for(const field of ['animationId','producer','proof','host','witness','evidence',
  'counts','snapshots','sourceLanguage','spanishPresentation','quizSource',
  'postReviewHostExitResolved','originalRuntime','audioAcceptance','humanReview',
  'ownerAcceptance','strictComplete','publication'])
  same(intent[field],receipt[field],`intent/receipt ${field}`);
 same(intent.before,receipt.before,'prior targets');same(intent.after,receipt.outputs,'new targets');
 const historical=new Map(receipt.before.map(pin=>[pin.path,pin]));
 same(verifyP064RegistrationEvidence(historical),receipt.evidence,'evidence remains current');
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
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP064ProofClosure(proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===CALIBRATION),
  proof.registration,'exact registration fragment');
 for(const row of prior.calibrations)
  same(transaction.registry.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
   `retained predecessor ${row.calibrationId}`);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,PROOF_PIN,'registered page');same(activation.data.host,HOST_PIN,
  'registered host');same(activation.data.predecessor,receipt.witness,'predecessor');
 same(projectedDescriptor(true),receipt.descriptor,'registered live descriptor');
 return{status:'P064_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P064_REGISTRATION_READY_NOT_WRITTEN',producer:plan.producer,
    proof:plan.proof,evidence:plan.evidence,before:plan.beforePins,
    after:plan.afterPins,counts:COUNTS,registrationEffect:'none',
    acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
