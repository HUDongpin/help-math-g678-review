#!/usr/bin/env node
/** Source-bound P054 local registration. Planning is read-only; writes are atomic and reversible. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,registrySources,
 REGISTRY,DISPATCH,sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {replacePinnedFile,rollbackPinnedFiles} from './register-nms-l02-p062-current-js-v1.mjs';
import {P054_ADMISSION_ID as ID,P054_ADMISSION_CALIBRATION as CALIBRATION,
 P054_SOURCE_ROOT as SOURCE_ROOT,P054_SOURCE as SOURCE,P054_XML as XML,
 P054_RUNTIME as RUNTIME,P054_FEEDBACK,P054_ACCEPTANCE_KEYS,validateP054ProofClosure}
 from '../lib/nms-l02-p054-proof-semantics-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p054-product-20260928',DIR=`${BASE}/registration`;
const RECEIPT=`${DIR}/receipt.json`,SELF='scripts/register-nms-l02-p054-current-js-v1.mjs';
const ACTIVATION='apps/web/lib/nms-l02-p054-admission-activation.ts';
const HOST='catalog/nms-l02-admission-v1/host-v15.json';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json';
export const HOST_PIN=Object.freeze({path:HOST,bytes:42983,
 sha256:'7150c0e90578f5c2763eb3bb90e93a3605dde61613d2597907c318dffec7eb68'});
export const PROOF_PIN=Object.freeze({path:PROOF,bytes:54313,
 sha256:'5e8fc913e9e0bc41dbf1336b4d042983e5fd5b74b60fc63beeec7c3015adf666'});
export const EVIDENCE=Object.freeze({
 browser:`${BASE}/browser/formal-my-lesson-v1/formal-candidate-v1/result.json`,
 pending:`${BASE}/browser/formal-pending-media-v1/formal-candidate-v1/result.json`,
 continuity:`${BASE}/continuity/browser/formal-candidate-v1/formal-candidate-v2/result.json`,
 buildIntent:`${BASE}/admission/formal-production-build-intent-v1.json`,
 build:`${BASE}/admission/formal-production-build-receipt-v1.json`,
 productionUnset:`${BASE}/admission/production-isolation-formal-candidate-v1-unset.json`,
 productionReal:`${BASE}/admission/production-isolation-formal-candidate-v1-real-root.json`,
 restoration:`${BASE}/admission/formal-production-build-link-restoration-v2.json`,
 priorRestoration:`${BASE}/admission/formal-production-build-link-restoration-v1.json`,
 recoveryIntent:`${BASE}/admission/formal-production-resume-intent-v1.json`,
});
const CHECKER='scripts/check-private-current-js-admission-registry-v2.mjs';
const CHECKER_TEST='scripts/check-private-current-js-admission-registry-v2.test.mjs';
const CHECKER_PREDECESSOR='scripts/check-private-current-js-admission-registry-v1.mjs';
const CHECKER_PREDECESSOR_TEST='scripts/check-private-current-js-admission-registry-v1.test.mjs';
const LOGICAL_BUILD='apps/web/.next-alg-p001-production-scan';
const OLD_BUILD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output';
const NEW_BUILD='/Volumes/American Dream/hudongpin/g678-p054-formal-build-output-20260928/next-output-v1';
const PRESERVED_BUILDS=Object.freeze([
 OLD_BUILD,
 '/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3',
 '/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p064-formal-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v2',
 '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v3',
]);
const TARGETS=Object.freeze([REGISTRY,...DISPATCH,ACTIVATION]);
export const COUNTS=Object.freeze({oldTotal:636,newTotal:637,oldShared:494,newShared:495,
 oldLesson:62,newLesson:63});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const same=(actual,expected,label)=>assert.deepStrictEqual(actual,expected,label);
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const lesson=values=>values.filter(key=>/^shared-nms002-l02-p\d{3}$/u.test(key));
export function assertNoP054Acceptance(value){
 for(const key of [...P054_ACCEPTANCE_KEYS,'originalRuntimeAccepted','originalRuntime',
  'originalRuntimeParityEstablished','audioAcceptance','audioListeningAccepted',
  'humanAccepted','humanReviewed','ownerAcceptance','humanReview','publication'])
  if(key in value)assert.equal(value[key],false,`unaccepted gate ${key}`);
 if(value.acceptanceEffects)for(const key of P054_ACCEPTANCE_KEYS)
  assert.equal(value.acceptanceEffects[key],false,`acceptanceEffects.${key}`);
}
function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact AWS source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local-only registration');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION)),source=bytes.toString();
 const marker='export const NMS_L02_P054_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact P054 activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return{data,bytes,source};
}
function candidateActivation(value){
 assert.equal(value?.schemaVersion,1);assert.equal(value.stage,'candidate');
 same(value.host,HOST_PIN,'formal host');same(value.page,PROOF_PIN,'formal page proof');
 assert.equal(value.predecessor?.path,
  'output/nms-l02-host-successor-20260927/predecessor/descriptor-witness-two-stage-v1.json');
 readPin(ROOT,value.predecessor);
}
function projectedDescriptor(registered){
 const code=`import {nmsL02P054AdmissionDescriptor} from './apps/web/lib/nms-l02-p054-admission.server.ts';
 const result=nmsL02P054AdmissionDescriptor();
 if(result.registered!==${registered}||result.descriptor.pages.length!==64||
 result.descriptor.productBridge.registeredAnimationCount!==63||
 result.descriptor.pages[53].animationId!=='${ID}'||
 result.descriptor.pages[52].animationId!=='shared-nms002-l02-p053'||
 result.descriptor.pages[52].rendererAvailability.kind!=='unavailable'||
 result.descriptor.glossary.length!==25)
 throw Error('P054 descriptor registration/placement/glossary mismatch');
 console.log(JSON.stringify({registered:result.registered,pages:result.descriptor.pages.length,
 registeredAnimationCount:result.descriptor.productBridge.registeredAnimationCount,
 glossaryCount:result.descriptor.glossary.length,placementId:result.descriptor.pages[53].animationId}));`;
 const run=spawnSync(process.execPath,['--conditions=react-server','--import','tsx',
  '--input-type=module','-e',code],{cwd:ROOT,env:{...process.env,NODE_ENV:'development'},
  encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
 assert.equal(run.status,0,`P054 descriptor: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function physicalBuildId(root){
 assert.equal(fs.realpathSync(root),root,'physical retained build');
 return{...pinFile(root,'BUILD_ID'),path:`${root}/BUILD_ID`};
}
function currentPin(pin,beforeTargets){
 if(beforeTargets?.has(pin.path))same(pin,beforeTargets.get(pin.path),`historical target ${pin.path}`);
 else if(pin.path===`${LOGICAL_BUILD}/BUILD_ID`)
  same({...pinFile(NEW_BUILD,'BUILD_ID'),path:pin.path},pin,'physical formal BUILD_ID');
 else if(path.isAbsolute(pin.path)){
  const roots=[SOURCE_ROOT,
   '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222',
   '/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1',
   ...PRESERVED_BUILDS,NEW_BUILD];
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
function browserStable(value,beforeTargets,label){
 same(value.inputPinsBefore,value.inputPinsAfter,`${label} input pins stable`);
 assert.equal(value.inputStable,true);assert.equal(value.browserProcessExited,true);
 same(value.cleanupErrors,[],`${label} cleanup`);
 evidencePins(value.inputPinsBefore,beforeTargets,label);
 assertNoP054Acceptance(value);
}
const sourcePhysical=()=>({...SOURCE,path:path.join(SOURCE_ROOT,SOURCE.path)});
const sourceFeedback=()=>Object.fromEntries(P054_FEEDBACK.map(item=>[
 item.kind,{sprite:item.spriteId,bytes:item.audio.bytes,sha256:item.audio.sha256}]));
export function validateP054FormalBrowser(item,beforeTargets){
 const b=item.data,passed='technical-pass-not-acceptance';
 assert.equal(b.schemaVersion,1);assert.equal(b.kind,'nms-l02-p054-formal-my-lesson-browser-v1');
 assert.equal(b.status,passed);assert.equal(b.formal,true);assert.equal(b.expectedRegistered,false);
 assert.equal(b.animationId,ID);same(b.source,sourcePhysical(),'exact source SWF');
 same(b.sourceXml,{...XML,path:path.join(SOURCE_ROOT,XML.path)},'exact source XML');
 same({registered:b.registeredPageCount,renderable:b.renderableCount,
  unregistered:b.unregisteredCandidateCount,pages:b.activePageCount},
  {registered:62,renderable:63,unregistered:1,pages:64},'candidate counts');
 same(b.feedbackAudio,sourceFeedback(),'both source feedback streams');
 browserStable(b,beforeTargets,'formal main browser');
 same(b.cases.map(row=>({locale:row.locale,level:row.level})),
  [{locale:'en',level:1},{locale:'es',level:2}],'both source levels and locales');
 for(const row of b.cases){
  assert.equal(row.status,passed);assert.equal(row.contextClose,'closed');
  assert(row.response?.status===200&&row.ready===true,'real My Lesson response');
  for(const key of ['errors','consoleDiagnostics','resourceErrors'])same(row[key],[],`${row.name} diagnostics`);
  assert(row.developmentUpdates.every(update=>!update.url.includes('.hot-update.')),
   'stable browser session');
  const states=new Map(row.observations.map(value=>[value.label,value]));
  const entry=states.get('entry'),wrong=states.get('wrong-feedback-end-0');
  const terminal=states.get('correct-feedback-end-6'),back=states.get('p054-return-reset');
  assert(entry?.phase==='selecting'&&entry.score===0&&entry.matched===0&&
   entry.audioPlaying==='false'&&entry.audio.every(audio=>audio.paused),
   'initial no-autoplay matching state');
  assert(wrong?.score===-2&&wrong.matched===0&&wrong.lastFrame==='31',
   'source wrong penalty and feedback');
  assert(terminal?.phase==='terminal-unresolved'&&terminal.score===58&&
   terminal.matched===6&&terminal.currentPage==='54','six source pairs and unresolved terminal');
  assert(back?.phase==='selecting'&&back.score===0&&back.matched===0&&
   back.audioPlaying==='false'&&back.currentPage==='54',
   'return resets board and stops audio');
  assert(row.observations.some(value=>value.label==='host-held-feedback-frame'&&
   value.paused==='true'&&value.audio.every(audio=>audio.paused)),
   'host pause froze native audio');
  assert(row.observations.some(value=>value.label==='p064-navigation'&&
   value.audio.slice(0,4).every(audio=>audio.paused&&audio.src===null)),
   'all prior feedback nodes cleaned on navigation');
  assert.equal(row.screenshots.length,4);for(const pin of row.screenshots)readPin(ROOT,pin);
  for(const kind of ['correct','wrong']){
   const expected=b.feedbackAudio[kind];assert(expected?.bytes>0);
   const matches=row.feedbackResponses.responses.filter(value=>
    new URL(value.url).pathname.endsWith(`/feedback-audio/${kind}`));
   assert(matches.length>=2,`${kind} fetched before and after Replay`);
   for(const value of matches)same({status:value.status,bytes:value.bytes,sha256:value.sha256,
    contentType:value.contentType,redirected:value.redirected},
    {status:200,bytes:expected.bytes,sha256:expected.sha256,contentType:'audio/mpeg',redirected:false},
    `source ${kind} feedback bytes`);
  }
  assert(row.feedbackResponses.audioEvents.some(value=>value.type==='playing'&&value.id===1),
   'actual wrong native audio played');
  assert(row.feedbackResponses.audioEvents.some(value=>value.type==='playing'&&value.id>=2&&value.id%2===0),
   'actual correct native audio played');
  assert(row.resources.some(value=>new URL(value.url).pathname.includes('/reveal/')&&
   value.status===200&&value.bytes>0&&/^[a-f0-9]{64}$/u.test(value.sha256)),
   'source reveal bytes loaded');
  assertNoP054Acceptance(row);
 }
 return true;
}
export function validateP054PendingMedia(item,beforeTargets){
 const b=item.data,passed='technical-pass-not-acceptance';
 assert.equal(b.schemaVersion,2);assert.equal(b.kind,'nms-l02-p054-formal-pending-media-browser-v1');
 assert.equal(b.status,passed);assert.equal(b.formal,true);assert.equal(b.expectedRegistered,false);
 assert.equal(b.animationId,ID);same(b.source,sourcePhysical(),'pending source identity');
 same(b.feedbackAudio,sourceFeedback(),'pending feedback streams');
 browserStable(b,beforeTargets,'formal pending media');
 same(b.cases.map(row=>({locale:row.locale,level:row.level})),
  [{locale:'en',level:1},{locale:'es',level:2}],'pending bilingual levels');
 for(const row of b.cases){
  assert.equal(row.status,passed);assert.equal(row.contextClose,'closed');
  same(row.errors,[],`${row.name} errors`);same(row.consoleDiagnostics,[],`${row.name} diagnostics`);
  const obs=new Map(row.observations.map(value=>[value.label,value]));
  assert(obs.get('first-loading')?.audioStatus==='loading'&&
   obs.get('final-return-initial-ready')?.audioStatus==='ready'&&
   obs.get('final-return-initial-ready')?.score==='0',
   'pending media returns to initial ready state');
  for(const [field,pair,phase] of [['replayAbort','firstPendingPair',1],
   ['navigationAbort','secondPendingPair',2]]){
   same(row[field].map(value=>value.id),row[pair].map(value=>value.id),
    `${field} exact held request identities`);
   same(row[field].map(value=>value.kind).sort(),['correct','wrong'],
    `${field} both source URLs`);
   for(const value of row[field])assert(value.phase===phase&&value.held===true&&
    value.failure==='net::ERR_ABORTED'&&Number.isFinite(value.failureAt),
    `${field} source request aborted`);
   const after=row.observations.find(value=>value.label===`phase-${phase}-aborted`);
   for(const kind of ['correct','wrong'])assert(after?.fetchFailures?.some(value=>
    value.name==='AbortError'&&new URL(value.url).pathname.endsWith(`/feedback-audio/${kind}`)&&
    new URL(value.url).search===`?sha256=${b.feedbackAudio[kind].sha256}`),
    `${field} browser fetch ${kind} aborted`);
  }
  for(const response of row.browserSourceResponses){
   const expected=b.feedbackAudio[response.kind];assert(expected);
   same({status:response.status,bytes:response.bytes,sha256:response.sha256,
    contentType:response.contentType},
    {status:200,bytes:expected.bytes,sha256:expected.sha256,contentType:'audio/mpeg'},
    'actual browser source response');
  }
  same(row.browserSourceResponses.map(value=>value.kind).sort(),['correct','wrong'],
   'both source feedback streams read in browser');
  assertNoP054Acceptance(row);
 }
 return true;
}
export function validateP054Continuity(item,beforeTargets){
 const c=item.data,passed='technical-pass-not-acceptance';
 assert.equal(c.kind,'nms-l02-p054-formal-candidate-browser-continuity-v1');
 assert.equal(c.status,passed);assert.equal(c.formal,true);
 browserStable(c,beforeTargets,'P054 predecessor continuity');
 const order=['p054','p064','p062','p061','p060','p058','p056','p055','p052','p064','p054'];
 same(c.order,order,'exact predecessor route sequence');
 same(c.cases.map(row=>row.locale),['en','es'],'bilingual predecessor continuity');
 for(const row of c.cases){
  assert.equal(row.status,passed);assert.equal(row.contextClose,'closed');
  assert.equal(row.responseStatus,200);same(row.selectedPages,order,'selected page traversal');
  same(row.errors,[],`${row.locale} errors`);same(row.consoleDiagnostics,[],`${row.locale} diagnostics`);
  same(row.responseErrors,[],`${row.locale} resource errors`);
  assert(row.developmentUpdates.every(value=>!value.url.includes('.hot-update.')),
   'no development hot updates');
  assert(row.audio?.maxActive===1&&row.audio.active===0&&
   Object.values(row.audio.byPage).every(bucket=>bucket.active===0),
   'one active source and cleanup');
  assert(row.dialogs.length>=4&&row.dialogs.every(dialog=>dialog.focusReturned===true),
   'source glossary focus returned');
  assertNoP054Acceptance(row);
 }
 return true;
}
function productionInputPins(value,beforeTargets,label){
 same(value.inputsBefore,value.inputsAfter,`${label} stable inputs`);
 assert.equal(value.inputStable??value.inputsStable,true,`${label} stable flag`);
 evidencePins(value.inputsBefore,beforeTargets,label);
}
export function validateP054ProductionRecovery(documents){
 const r=documents.restoration.data,prior=documents.priorRestoration.data,
  recovery=documents.recoveryIntent.data;
 assert.equal(r.kind,'nms-l02-p054-formal-production-build-link-restoration-v2');
 assert.equal(prior.kind,'nms-l02-p054-formal-production-build-link-restoration-v1');
 assert.equal(prior.failure,'Port must be free before owned production server');
 assert(prior.restored===true&&prior.buildSucceeded===true&&
  prior.linkRestorationFailure===null&&prior.configurationCleanupFailure===null,
  'preserved prior failure restored safely');
 same(prior.probeReceipts,[documents.productionUnset.pin],'prior unset probe');
 assert.equal(recovery.kind,'nms-l02-p054-production-resume-v1');
 same(r.recovery,recovery,'exact recovery intent');
 same(r.recoveryIntent,documents.recoveryIntent.pin,'recovery intent pin');
 same(recovery.priorRestoration,documents.priorRestoration.pin,'preserved failed receipt pin');
 same(recovery.build,documents.build.pin,'recovery reuses original build');
 same(recovery.intent,documents.buildIntent.pin,'recovery reuses build intent');
 same(recovery.unset,documents.productionUnset.pin,'recovery reuses unset probe');
 same(recovery.script,pinFile(ROOT,'scripts/resume-nms-l02-p054-production-v1.py'),
  'recovery implementation pin');
 for(const [key,value] of Object.entries(prior)){
  if(['kind','failure','probeReceipts','finishedAt'].includes(key))continue;
  same(r[key],value,`recovery preserves ${key}`);
 }
 return true;
}
export function validateP054Production(documents,beforeTargets){
 const intent=documents.buildIntent.data,build=documents.build.data,
  a=documents.productionUnset.data,b=documents.productionReal.data,r=documents.restoration.data;
 assert.equal(intent.kind,'nms-l02-p054-formal-production-build-intent-v1');
 assert.equal(intent.logicalPath,LOGICAL_BUILD);assert.equal(intent.beforeTarget,OLD_BUILD);
 assert.equal(intent.temporaryTarget,NEW_BUILD);
 assert.equal(build.kind,'p054-formal-local-production-build-v1');
 assert.equal(build.exitCode,0);assert.equal(build.inputsStable,true);
 assert.equal(build.configRestored,true);same(build.inputsBefore,build.inputsAfter,'build inputs stable');
 same(intent.inputs,build.inputsBefore,'build intent input closure');
 same(intent.config,build.configBefore,'build intent config');
 same(build.configAfterRestore,build.configBefore,'build config restored');
 evidencePins(build.inputsBefore,beforeTargets,'formal build');
 evidencePins(build.configAfterRestore,beforeTargets,'formal build config',
  {requireTransaction:false});
 validateP054ProductionRecovery(documents);
 assert(r.logicalPath===LOGICAL_BUILD&&r.beforeTarget===OLD_BUILD&&
  r.temporaryTarget===NEW_BUILD&&r.afterTarget===OLD_BUILD&&r.restored===true&&
  r.buildSucceeded===true&&r.failure===null&&r.linkRestorationFailure===null&&
  r.configurationCleanupFailure===null,'exact link and config restoration');
 const logical=path.join(ROOT,LOGICAL_BUILD);
 assert(fs.lstatSync(logical).isSymbolicLink()&&fs.readlinkSync(logical)===OLD_BUILD&&
  fs.realpathSync(logical)===OLD_BUILD,'P055 logical build link restored');
 same(r.p054FormalBuildId,physicalBuildId(NEW_BUILD),'new physical build ID');
 same({...r.p054FormalBuildId,path:`${LOGICAL_BUILD}/BUILD_ID`},build.buildId,
  'logical build receipt points to new physical ID');
 same(r.oldBuildIdBefore,physicalBuildId(OLD_BUILD),'old build preserved');
 same(r.oldBuildIdAfter,r.oldBuildIdBefore,'old build unchanged');
 same(intent.oldBuildId,r.oldBuildIdBefore,'intent old build');
 for(const [index,root] of PRESERVED_BUILDS.entries()){
  const now=physicalBuildId(root);
  if(index<6){const key=['p055','p057','p058','p060','p061','p062'][index];
   same(r[`${key}BuildIdBefore`],now,`${key} old build before`);
   same(r[`${key}BuildIdAfter`],now,`${key} old build after`);}
  else{same(r.extraBuildIdsBefore[index-6],now,'additional prior build before');
   same(r.extraBuildIdsAfter[index-6],now,'additional prior build after');}
 }
 assert.equal(intent.dependencyLink,path.join(path.dirname(NEW_BUILD),'node_modules'));
 assert.equal(intent.dependencyTarget,path.join(ROOT,'node_modules'));
 assert(fs.lstatSync(intent.dependencyLink).isSymbolicLink()&&
  fs.readlinkSync(intent.dependencyLink)===intent.dependencyTarget&&
  fs.realpathSync(intent.dependencyLink)===intent.dependencyRealRoot,
  'exact source-bounded dependency link');
 const sharpPhysical=path.join(intent.dependencyRealRoot,'sharp/package.json');
 assert.equal(fs.realpathSync(sharpPhysical),sharpPhysical,'physical sharp package');
 same(intent.sharpPackage,{...pinFile(path.dirname(sharpPhysical),path.basename(sharpPhysical)),
  path:'node_modules/sharp/package.json'},'pinned sharp package');
 const receipts=[documents.productionUnset.pin,documents.productionReal.pin];
 same(r.probeReceipts,receipts,'two actual production receipts');
 for(const [mode,item] of [['unset',a],['real-root',b]]){
  assert(item.kind==='nms-l02-p054-formal-production-isolation-v1'&&
   item.sourceMode===mode&&item.status==='technical-pass-not-deployment'&&
   item.origin==='http://127.0.0.1:3332'&&item.inputStable===true&&
   item.expectedCases===1920&&item.results.length===1920&&item.errors.length===0,
   `${mode} full local production denial`);
  assert(item.results.every(row=>row.pass===true&&row.status===404&&
   row.redirected===false&&row.bodyBytes<1000&&['GET','HEAD'].includes(row.method)),
   `${mode} exact response matrix`);
  same(item.inputsBefore,item.inputsAfter,`${mode} production input closure`);
  evidencePins(item.inputsBefore,beforeTargets,`${mode} production`);
  candidateActivation(item.activation);
  same(item.directoryBinding,{logicalPath:LOGICAL_BUILD,physicalRoot:NEW_BUILD,
   symlinkTarget:NEW_BUILD},`${mode} physical build binding`);
  assert(item.bundleScan?.files>0&&item.bundleScan.matches.length===0,
   `${mode} excludes P054 production payload`);
  assert.equal(item.buildIdBefore,item.buildIdAfter);
  assert.equal(item.buildIdBefore,fs.readFileSync(path.join(NEW_BUILD,'BUILD_ID'),'utf8').trim());
  assertNoP054Acceptance(item);
 }
 return true;
}
function verifyEvidence(beforeTargets){
 const documents=Object.fromEntries(Object.entries(EVIDENCE).map(([name,relative])=>
  [name,evidenceDocument(relative)]));
 validateP054FormalBrowser(documents.browser,beforeTargets);
 validateP054PendingMedia(documents.pending,beforeTargets);
 validateP054Continuity(documents.continuity,beforeTargets);
 validateP054Production(documents,beforeTargets);
 return Object.fromEntries(Object.entries(documents).map(([name,item])=>[name,item.pin]));
}
function expectedActivation(current){
 candidateActivation(current.data);
 assert.equal((current.source.match(/"stage": "candidate"/gu)??[]).length,1);
 return Buffer.from(current.source.replace('"stage": "candidate"','"stage": "registered"'));
}
function checkV2Registry(){
 const run=spawnSync(process.execPath,[CHECKER],{cwd:ROOT,env:{...process.env,NODE_ENV:'development'},
  encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
 assert.equal(run.status,0,`successor registry check: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function planBase(){
 localOnly();const activation=readActivation();candidateActivation(activation.data);
 same(pinFile(ROOT,HOST),HOST_PIN,'sealed host-v15');
 same(pinFile(ROOT,PROOF),PROOF_PIN,'sealed P054 proof');
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP054ProofClosure(proof);
 assert.equal(proof.registration.calibrationId,CALIBRATION);
 same(proof.registration.entries.map(row=>row.key),[ID],'one exact registration');
 same(proof.packet.source,SOURCE,'source SWF');same(proof.packet.sourceXml,XML,'source XML');
 same(proof.packet.selectedPages[0].runtime,RUNTIME,'matching runtime contract');
 assert.equal(proof.packet.sourceKeyAttributeCalls,0,'P054 has no glossary');
 assertNoP054Acceptance(proof.packet.acceptanceEffects);
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const checker=[CHECKER,CHECKER_TEST,CHECKER_PREDECESSOR,CHECKER_PREDECESSOR_TEST]
  .map(relative=>pinFile(ROOT,relative));
 const transaction=readRegistryTransaction(ROOT),before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===CALIBRATION),
  'P054 calibration not yet registered');
 assert(!keys(before).includes(ID),'P054 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 same({oldTotal:oldKeys.length,newTotal:newKeys.length,oldShared:shared(oldKeys).length,
  newShared:shared(newKeys).length,oldLesson:lesson(oldKeys).length,
  newLesson:lesson(newKeys).length},COUNTS,'one exact local P054 registration');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[ID],'only P054 added');
 for(const row of before.calibrations)
  same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
   `predecessor calibration retained ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyEvidence(beforeMap);
 const generated=registrySources(after);
 const nextBytes=[json(after),...generated.map(value=>Buffer.from(value)),
  expectedActivation(activation)];
 const afterPins=TARGETS.map((relative,index)=>bytePin(relative,nextBytes[index]));
 const descriptor=projectedDescriptor(false);
 return{producer:pinFile(ROOT,SELF),proof:PROOF_PIN,host:HOST_PIN,
  witness:activation.data.predecessor,evidence,checker,before,after,beforePins,afterPins,
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
 const intent={schemaVersion:1,kind:'nms-l02-p054-registration-intent-v1',
  animationId:ID,producer:plan.producer,proof:plan.proof,host:plan.host,
  witness:plan.witness,evidence:plan.evidence,checker:plan.checker,before:plan.beforePins,
  after:plan.afterPins,snapshots,counts:COUNTS,sourceLanguage:'fixed-en',
  spanishPresentation:'English-source-fallback',terminalOutcome:'terminal-unresolved',
  hostCompletion:false,originalRuntime:false,audioAcceptance:false,humanReview:false,
  ownerAcceptance:false,strictComplete:false,publication:false};
 writeNew(`${DIR}/intent.json`,json(intent));journal({step:'prepared',intent:pinFile(ROOT,`${DIR}/intent.json`)});
 const modified=[];
 try{
  const fresh=planBase();same(fresh.evidence,plan.evidence,'evidence compare-and-swap');
  same(fresh.checker,plan.checker,'checker compare-and-swap');
  same(fresh.afterPins,plan.afterPins,'projected output compare-and-swap');
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
  const checker=checkV2Registry(),descriptor=projectedDescriptor(true);
  const receipt={schemaVersion:1,kind:'nms-l02-p054-local-registration-v1',
   status:'registered-local-current-js-not-acceptance',animationId:ID,
   producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,
   evidence:plan.evidence,checkerPins:plan.checker,checker,
   intent:pinFile(ROOT,`${DIR}/intent.json`),before:plan.beforePins,snapshots,
   outputs:plan.afterPins,counts:COUNTS,descriptor,
   sourceLanguage:intent.sourceLanguage,spanishPresentation:intent.spanishPresentation,
   terminalOutcome:intent.terminalOutcome,hostCompletion:false,originalRuntime:false,
   audioAcceptance:false,humanReview:false,ownerAcceptance:false,
   strictComplete:false,publication:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,json(receipt));
  return{status:'P054_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',
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
 assert.equal(receipt.kind,'nms-l02-p054-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,ID);same(receipt.counts,COUNTS,'registered counts');
 assertNoP054Acceptance(receipt);assert.equal(receipt.hostCompletion,false);
 same(receipt.producer,pinFile(ROOT,SELF),'registered producer');
 same(receipt.proof,PROOF_PIN,'registered proof');same(receipt.host,HOST_PIN,'registered host');
 readPin(ROOT,receipt.witness);
 const intent=readJsonPin(ROOT,receipt.intent);
 assert.equal(intent.kind,'nms-l02-p054-registration-intent-v1');
 assertNoP054Acceptance(intent);assert.equal(intent.hostCompletion,false);
 for(const field of ['animationId','producer','proof','host','witness','evidence',
  'counts','snapshots','sourceLanguage','spanishPresentation','terminalOutcome',
  'hostCompletion','originalRuntime','audioAcceptance','humanReview','ownerAcceptance',
  'strictComplete','publication'])same(intent[field],receipt[field],`intent/receipt ${field}`);
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
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP054ProofClosure(proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===CALIBRATION),
  proof.registration,'exact registration fragment');
 for(const row of prior.calibrations)
  same(transaction.registry.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
   `retained predecessor ${row.calibrationId}`);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,PROOF_PIN,'registered page');same(activation.data.host,HOST_PIN,
  'registered host');same(activation.data.predecessor,receipt.witness,'predecessor');
 same(checkV2Registry(),receipt.checker,'registered canonical registry');
 same(projectedDescriptor(true),receipt.descriptor,'registered live descriptor');
 return{status:'P054_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P054_REGISTRATION_READY_NOT_WRITTEN',producer:plan.producer,
    proof:plan.proof,evidence:plan.evidence,checker:plan.checker,
    before:plan.beforePins,after:plan.afterPins,counts:COUNTS,
    registrationEffect:'none',acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
