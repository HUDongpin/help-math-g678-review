#!/usr/bin/env node
/** P022 admission producer. --plan is read-only; --prepare needs an exact reviewed browser pin. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import * as S from '../lib/alg-l06-p022-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const PREVIOUS_INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v74.json',
 bytes:5529,sha256:'6e1359d22c0ce3cc49760b3b836ed9464e3edb36496c39af5fdc27180bcf0c78'});
export const ENGINEERING_RECEIPT_PATH=
 'output/playwright/alg-l06-p022-host-v1/engineering-receipt-v1.json';
const BROWSER_DIR='output/playwright/alg-l06-p022-host-v1/';
const CHECKS=Object.freeze([
 'enEsCandidateReadyNoAutoplay','sixInstancesKeyboardCloseFocusBothLocales',
 'naturalMainEOF422','twoRangesGapNoSyntheticAudio',
 'separateSaExplicitAndMainStopped','saEOFRequiresExplicitReturn',
 'reducedMotion390ExplicitPlayPauseHold','replayCancelsDelayedSa',
 'previousNavigationClosedMainAndSa','graphRepresentationDefinitionsBothLocales',
 'sourceTextTiming']);
const REQUIRED_HOST=Object.freeze([
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/candidate-v1/page.tsx`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/[resource]/route.ts`,
 'apps/web/components/g678-alg-l06-p022-candidate-player-v1.generated.tsx',
 'apps/web/components/g678-alg-l06-p022-host-lesson-v1.tsx',
 'apps/web/components/g678-alg-l06-p022-runtime-v1.tsx',
 'apps/web/lib/alg-l06-p022-candidate-binding-v1.ts',
 'apps/web/lib/alg-l06-p022-candidate-v1.server.ts',
 'apps/web/lib/alg-l06-p022-local-request-v1.ts',
 'apps/web/lib/alg-l06-p022-local-request.production-stub.ts',
 'apps/web/lib/alg-l06-p022-preview-policy-v1.ts',
 'apps/web/lib/alg-l06-p022-resources-v1.server.ts']);
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p022-admission-v1.mjs',
 'lib/alg-l06-p022-admission-semantics-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'scripts/private-current-js-registry.mjs',
 'apps/web/lib/alg-l06-p022-candidate-v1.server.ts',
 'apps/web/components/g678-alg-l06-p022-runtime-v1.tsx',
 'scripts/build-alg-l06-p022-text-state-v1.mjs',
 'packages/demos/src/alg-l06-p022-player-v1.tsx',
 'packages/demos/src/alg-l06-p022-native-text-v1.tsx',
 'packages/demos/src/alg-l06-p022-audio-owner-v1.ts',
 'packages/demos/src/alg-l06-p022-clock-v1.ts',
 'packages/demos/src/alg-l06-p022-audio-schedule-v1.ts',
 'packages/demos/src/alg-l06-p022-optional-spanish-audio-v1.ts']);
const bytes=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,data)=>({path:relative,bytes:data.length,sha256:sha256(data)});
function activePin(){
 const source=readPin(ROOT,pinFile(ROOT,'apps/web/lib/g678-admission-activation.ts')).toString();
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=source.indexOf(marker),end=source.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin&&source.indexOf(marker,begin+1)<0,'one active index');
 return JSON.parse(source.slice(begin+marker.length,end));
}
function exactReceiptPin(pin){
 assert.deepEqual(pin?.path,ENGINEERING_RECEIPT_PATH,'exact P022 browser receipt path');
 assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/.test(pin.sha256),
  'root-reviewed receipt requires exact bytes and SHA-256');
 return pin;
}
/** Check the root-reviewed real browser receipt and its raw, pinned observations. */
export function validateEngineeringReceipt(pin,index,host){
 exactReceiptPin(pin);
 const receipt=readJsonPin(ROOT,pin);
 assert.equal(receipt.kind,'g678-p022-local-my-lesson-engineering-v1');
 assert.deepEqual([receipt.animationId,receipt.formalRegistered,
  receipt.denominator,receipt.p022Registered],[S.ID,509,2282,false]);
 assert.deepEqual(receipt.indexPin,PREVIOUS_INDEX_PIN);
 assert.deepEqual(receipt.hostPin,index.host);
 assert.equal(host.kind,'g678-admission-host-v1');
 assert(!index.pages.some(row=>row.animationId===S.ID));
 for(const key of CHECKS)assert.equal(receipt.checks?.[key],true,`P022 browser check: ${key}`);
 assert.deepEqual(receipt.pageErrors,[]);assert.deepEqual(receipt.consoleErrors,[]);
 assert.deepEqual(receipt.acceptance,{originalRuntime:false,listening:false,human:false,
  owner:false,strictCompletion:false,published:false});
 assert(Array.isArray(receipt.remainingGap)&&receipt.remainingGap.length>0);
 const artifacts=uniquePins(receipt.artifacts);
 assert.equal(artifacts.length,receipt.artifacts.length,'unique browser artifacts');
 for(const item of artifacts){
  assert(item.path.startsWith(BROWSER_DIR)&&item.path!==ENGINEERING_RECEIPT_PATH,
   'bounded P022 browser artifact');readPin(ROOT,item);
 }
 const casesPin=artifacts.find(item=>item.path.endsWith('/cases.json'));
 const errorsPin=artifacts.find(item=>item.path.endsWith('/page-errors.json'));
 assert(casesPin&&errorsPin,'structured P022 browser cases and page errors');
 const cases=readJsonPin(ROOT,casesPin),errors=readJsonPin(ROOT,errorsPin);
 assert.deepEqual(errors.pageErrors,[]);assert.deepEqual(errors.consoleErrors,[]);
 assert.deepEqual(cases.enEnd.pageErrors,[]);
 assert.deepEqual(cases.enEnd.consoleErrors,[]);
 assert.deepEqual(cases.es.pageErrors,[]);
 assert.deepEqual(cases.lifecycle.pageErrors,[]);
 const contexts=[];
 for(const [locale,rows] of [['en',cases.en],['es',cases.es.cases]]){
  assert(Array.isArray(rows)&&rows.length>0,`${locale} browser cases`);
  const initial=rows[0];
  assert.deepEqual([initial.kind,initial.state.frame,initial.state.phase,
   initial.state.sa,initial.state.owner],['initial',1,'ready','idle','main']);
  // ES navigation stays in one document; retain old EN history but scope starts
  // to the newly created main context and require every predecessor closed.
  const events=initial.observer.events;
  const created=events.filter(e=>e.kind==='context-created'),current=created.at(-1);
  assert(current&&current.sampleRate===22050);
  assert(!events.some(e=>e.contextId===current.contextId&&e.kind==='source-start'),
   `${locale} initial main context has no automatic source start`);
  for(const previous of created.slice(0,-1))
   assert(events.some(e=>e.contextId===previous.contextId&&
    e.kind==='context-close-resolve'),'previous locale context retired');
  contexts.push({locale,documentId:current.documentId,
   contextId:current.contextId,initialLastSequence:events.at(-1).sequence});
  const glossary=rows.filter(item=>item.kind==='glossary');
  assert.deepEqual(glossary.map(item=>item.key),Object.keys(S.GATES));
  assert.equal(new Set(glossary.map(item=>item.instance)).size,6);
  for(const row of glossary){
   const [,firstFrame]=S.GATES[row.key];
   assert(row.opened.frame>=firstFrame&&row.closed.frame===row.opened.frame,
    `${locale} own instance gate`);
   assert.equal(row.closed.phase,'paused');
   assert.equal(row.closed.focused,row.instance);
   assert(row.text.length>40,`${locale} actual dictionary text`);
  }
  for(const key of ['Graph','Representation']){
   const row=glossary.find(item=>item.key===key);
   assert(row.text.includes(locale==='en'?'Glossary':'Glosario'));
   assert(row.text.includes(locale==='en'?key:
    key==='Graph'?'Gráfico':'Representación'));
  }
 }
 assert.deepEqual(contexts,cases.contextScope);
 assert.deepEqual(contexts,receipt.observations.contextScope);
 assert.equal(contexts[0].documentId,contexts[1].documentId,
  'locale transition stayed in same document');
 const enEnd=cases.enEnd.state,esEnd=cases.es.cases.find(x=>x.kind==='natural-final');
 for(const row of [enEnd,{dataset:esEnd?.state,canvas:esEnd?.state.canvasFrame}]){
  assert.equal(row.dataset.p022PlayerFrame,'422');
  assert.equal(row.dataset.p022PlayerPhase,'timeline-ended');
  assert.equal(row.canvas,'422');
 }
 assert(enEnd.text.includes('(2, –3)')&&esEnd.text.includes('(2, –3)'));
 const counts={'main-1':238464,'main-2':501696,'separate-sa':864000},stats=[];
 for(const [locale,observer,scope] of [['en',enEnd.observer,contexts[0]],
  ['es',esEnd.observer,contexts[1]]]){
  const events=observer.events.filter(e=>e.sequence>=scope.initialLastSequence);
  const active=new Map(),mainContexts=new Set();let saStarts=0;
  for(const event of events){
   if(event.kind==='source-start'&&event.accepted){
    assert.equal(active.size,0,'one source owner at a time');
    assert.equal(event.sampleCount,counts[event.asset]);
    assert.equal(event.sampleRate,event.asset==='separate-sa'?48000:22050);
    active.set(event.nodeId,event.asset);
    if(event.asset==='separate-sa')saStarts++;else mainContexts.add(event.contextId);
   }else if(['source-stop','source-disconnect','source-ended-event'].includes(event.kind))
    active.delete(event.nodeId);
  }
  assert.equal(mainContexts.size,1);
  assert.equal(saStarts,locale==='en'?0:1);
  assert.equal(active.size,0,'natural final retired source');
  const second=events.find(e=>e.kind==='source-start'&&e.asset==='main-2');
  assert(second?.accepted);
  assert(second.startArgs[0]-second.contextTime>1,'main-2 delayed across source gap');
  assert(Math.abs(second.startArgs[1]-416/22050)<1e-12,
   'main-2 exact raw seek offset');
  const first=events.filter(e=>e.kind==='source-start'&&e.asset==='main-1').at(-1);
  const firstEOF=events.find(e=>e.kind==='source-ended-event'&&e.nodeId===first.nodeId);
  assert(firstEOF&&firstEOF.sequence<second.sequence,'first range EOF before second');
  assert(events.some(e=>e.kind==='source-ended-event'&&e.nodeId===second.nodeId));
  stats.push({locale,mainContextId:[...mainContexts][0],saStarts,
   main2Delay:second.startArgs[0]-second.contextTime,
   main2Offset:second.startArgs[1],sampleCounts:counts});
 }
 assert.deepEqual(stats,cases.audioStats);
 assert.deepEqual(stats,receipt.observations.audioStats);
 assert.deepEqual(cases.enEnd.boundaries.map(x=>Number(x.dataset.p022PlayerFrame)),
  [134,149,155]);
 const es=cases.es.cases;
 const selected=es.find(x=>x.kind==='explicit-sa-return');
 const saEnd=es.find(x=>x.kind==='natural-sa-end');
 assert.equal(selected.selected.p022AudioOwner,'spanish');
 assert.equal(saEnd.state.p022PlayerFrame,selected.selected.p022PlayerFrame);
 assert.equal(saEnd.state.p022AudioOwner,'spanish');
 assert.equal(saEnd.state.p022SaPhase,'ended');
 assert.equal(selected.returned.p022AudioOwner,'main');
 assert.equal(selected.returned.p022PlayerPhase,'playing');
 const rows=es.find(x=>x.kind==='source-text-timing').rows;
 assert.deepEqual(rows.map(row=>row.frame),[243,244,272,273,300,301,360,361]);
 for(const row of rows){
  assert.equal(row.playerFrame,row.frame);
  assert.deepEqual(row.steps,[244,273,301].filter(frame=>frame<=row.frame));
  assert.equal(row.pair,row.frame<361?null:'(2, –3)');
 }
 assert.deepEqual(receipt.observations.sourceTextFrames,[244,273,301,361]);
 const reflow=es.find(x=>x.kind==='phone-200-percent-reflow').reflow;
 assert.deepEqual([reflow.rootFont,reflow.width,reflow.scrollWidth],['32px',390,390]);
 assert.equal(es.find(x=>x.kind==='replay').state.p022PlayerFrame,'1');
 const lifecycle=cases.lifecycle.cases;
 const reduced=lifecycle.find(x=>x.kind==='reduced-initial');
 assert(reduced.reduced&&reduced.viewport.width===390);
 assert.equal(reduced.player.p022MotionPolicy,'explicit-reduced');
 assert.equal(reduced.player.p022PlayerFrame,'1');
 assert(!reduced.observer.events.some(e=>e.kind==='source-start'));
 const pause=lifecycle.find(x=>x.kind==='explicit-play-pause');
 assert.equal(pause.paused.player.p022PlayerFrame,pause.held.player.p022PlayerFrame);
 assert.equal(pause.held.player.p022PlayerPhase,'paused');
 const cancel=lifecycle.find(x=>x.kind==='replay-cancels-delayed-sa');
 assert(cancel.requestDelayInjected);
 assert.equal(cancel.loading.player.p022SaPhase,'loading');
 assert.equal(cancel.reset.player.p022PlayerFrame,'1');
 assert.equal(cancel.reset.player.p022SaPhase,'idle');
 assert(!cancel.reset.observer.events.some(e=>e.kind==='source-start'&&
  e.asset==='separate-sa'));
 const nav=lifecycle.find(x=>x.kind==='previous-navigation-during-sa');
 assert.equal(nav.beforeExit.player.p022SaPhase,'playing');
 assert(nav.createdContexts.length>=2);
 assert(nav.createdContexts.every(id=>nav.closedContexts.includes(id)));
 assert.equal(errors.predecessor.p021PlayerPhase,'ready');
 const httpPin=artifacts.find(item=>item.path.endsWith('/http-check-v1.json'));
 assert(httpPin,'raw P022 HTTP routes');
 const http=readJsonPin(ROOT,httpPin);
 assert.equal(http.rows.length,7);
 assert(http.rows.slice(0,2).every(row=>row.status===200&&
  row.robots.includes('noindex')));
 assert(http.rows.slice(2).every(row=>row.status===404));
 return {receipt,artifacts};
}
function writeExact(relative,data){
 const absolute=path.join(ROOT,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 try{fs.writeFileSync(absolute,data,{flag:'wx'});}catch(error){
  if(error?.code!=='EEXIST')throw error;
  assert.deepEqual(readPin(ROOT,pinBytes(relative,data)),data,`immutable output: ${relative}`);
 }
 return pinFile(ROOT,relative);
}
export function buildPlan({previousIndexPin,engineeringReceiptPin}={}){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'physical source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local preparation only');
 assert.deepEqual(previousIndexPin,PREVIOUS_INDEX_PIN,'reviewed v74 predecessor');
 assert.deepEqual(activePin(),PREVIOUS_INDEX_PIN,'exact active predecessor index');
 assert.deepEqual(pinFile(ROOT,PREVIOUS_INDEX_PIN.path),PREVIOUS_INDEX_PIN);
 const index=readJsonPin(ROOT,PREVIOUS_INDEX_PIN);
 assert.equal(index.kind,'g678-admission-index-v1');assert.equal(index.pages.length,19);
 assert(index.pages.some(row=>row.animationId==='shared-alg001-l06-p021'));
 assert(!index.pages.some(row=>row.animationId===S.ID));
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert(!transaction.registry.calibrations.some(row=>row.calibrationId===S.CALIBRATION||
  row.entries.some(entry=>entry.key===S.ID)));
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const hostPaths=new Set(host.files.map(item=>item.path));
 for(const required of REQUIRED_HOST)assert(hostPaths.has(required),
  `P022 candidate host input missing: ${required}`);
 const source=S.readP022CanonicalSource(ROOT),artifacts=source.artifacts;
 let browserArtifacts=[];
 if(engineeringReceiptPin){
  ({artifacts:browserArtifacts}=validateEngineeringReceipt(engineeringReceiptPin,index,host));
 }
 const supportPins=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const integrity=uniquePins([...source.localInputs,...Object.values(artifacts),
  ...supportPins,...(engineeringReceiptPin?[engineeringReceiptPin,...browserArtifacts]:[])]);
 const forbidden=new Set(['packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/g678-admission-activation.ts',S.PROOF_PATH,S.FREEZE_PATH,
  FRAGMENT_PATH,PREVIOUS_INDEX_PIN.path,index.host.path]);
 assert(!integrity.some(item=>forbidden.has(item.path)));
 for(const item of integrity)readPin(ROOT,item);
 const mainAssets=source.audio.main.ranges.map(row=>row.extractedMp3);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:22,sourceOccurrence:22,sectionCode:'VB',sectionPageOrdinal:12,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p022Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:{audit:S.AUDIO,plan:S.AUDIO_PLAN,mainRanges:[[2,132],[150,422]],
   mainRangeAssets:mainAssets,mainFrameDomain:'sprite-67',
   sourceNegativeSeek:{frame:132,samples:-2018},
   sourceMissingBlockFrames:Array.from({length:17},(_,i)=>133+i),
   mainRangesConcatenated:false,syntheticSilenceAdded:false,
   originalRuntimeAccepted:false,listeningAccepted:false,audioAccepted:false},
  optionalSpanishAudio:{source:S.SA,sourceCopy:source.audio.separateSa.copy,
   trigger:'explicit-user-only',localeAutoplay:false,mainStreamSpliced:false,
   mainPausedDuringPlayback:true,returnMainSupported:true,audioAccepted:false},
  glossaryActions:source.glossary,
  ...(engineeringReceiptPin?{engineeringReceipt:engineeringReceiptPin}:{}),
  integrity:{scope:'P022-six-glossary-geometry-pair-two-main-ranges-422-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Original Flash synchronization, listening, human review and visual fidelity remain independent.',
   files:integrity},acceptanceEffects:S.ACCEPTANCE,
  productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeData=bytes(packet),freeze=pinBytes(S.FREEZE_PATH,freezeData);
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP022AdmissionSemantics(bound,registration,ROOT),true);
 const projected={...transaction,
  registry:upsertPrivateCurrentJsCalibration(transaction.registry,registration)};
 const legacyInputs=uniquePins([...integrity,...Object.values(artifacts),freeze,...supportPins]);
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(item=>!hostPaths.has(item.path)),external:source.external};
 const proofData=bytes(proof),proofPin=pinBytes(S.PROOF_PATH,proofData);
 const outputs=new Map([[S.FREEZE_PATH,freezeData],[FRAGMENT_PATH,bytes(registration)],
  [S.PROOF_PATH,proofData]]);
 return {outputs,host,index,proof,proofPin,bound,registration,transaction,projected,
  source,supportPins,engineeringReceiptPin,browserArtifacts};
}
export function operate(mode,options={}){
 assert(['--plan','--check-receipt','--prepare','--check'].includes(mode),
  'use --plan, --check-receipt, --prepare or --check');
 if(mode!=='--plan')assert(options.engineeringReceiptPin,
  'exact root-reviewed P022 browser receipt required before proof preparation');
 const plan=buildPlan(options);
 for(const [relative,data] of plan.outputs){
  if(fs.existsSync(path.join(ROOT,relative)))
   assert.deepEqual(readPin(ROOT,pinBytes(relative,data)),data,
    `immutable prepared artifact: ${relative}`);
  else assert(mode!=='--check',`missing prepared artifact: ${relative}`);
 }
 if(mode==='--prepare'){
  writeExact(S.FREEZE_PATH,plan.outputs.get(S.FREEZE_PATH));
  writeExact(FRAGMENT_PATH,plan.outputs.get(FRAGMENT_PATH));
  if(!fs.existsSync(path.join(ROOT,S.PROOF_PATH))){
   const result=prepareAdmissionCandidate({root:ROOT,output:S.PROOF_PATH,
    animationId:S.ID,packet:plan.bound,registration:plan.registration,
    implementationFiles:plan.supportPins,external:plan.source.external,
    hostPin:plan.index.host,transaction:plan.transaction,
    validateSemantics:(packet,registration)=>
     S.validateP022AdmissionSemantics(packet,registration,ROOT)});
   assert.deepEqual(result.proof,plan.proofPin,'common helper exact planned proof');
  }
 }
 if(mode==='--check'||mode==='--prepare'){
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,plan.projected);
  S.validateP022AdmissionSemantics(packet,plan.registration,ROOT);
  assert.deepEqual([...buildPlan(options).outputs],[...plan.outputs],
   'stable physical inputs after common-reader roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':
  mode==='--check-receipt'?'receipt-validated-candidate-not-written':
   'candidate-roundtrip-passed-not-registered',
  outputs:[...plan.outputs].map(([relative,data])=>pinBytes(relative,data)),
  previousProofsUnchanged:plan.index.pages.map(page=>page.proof),
  engineeringReceiptBound:!!plan.engineeringReceiptPin,
  outputsProvisional:mode==='--plan'&&!plan.engineeringReceiptPin,
  missingPrerequisites:mode==='--plan'&&!plan.engineeringReceiptPin?
   [ENGINEERING_RECEIPT_PATH]:[],pageFiles:plan.proof.files.length,
  external:plan.source.external.length,registrationChanged:false,activationChanged:false,
  acceptanceEffects:S.ACCEPTANCE};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert([6,9].includes(process.argv.length),
  'mode plus exact previous-index pin and optional engineering-receipt pin');
 const [,,mode,indexPath,indexBytes,indexSha256,receiptPath,receiptBytes,receiptSha256]=process.argv;
 assert.equal(indexPath,PREVIOUS_INDEX_PIN.path);
 assert(/^\d+$/u.test(indexBytes)&&/^[a-f0-9]{64}$/u.test(indexSha256));
 if(receiptPath!==undefined){
  assert.equal(receiptPath,ENGINEERING_RECEIPT_PATH);
  assert(/^\d+$/u.test(receiptBytes)&&/^[a-f0-9]{64}$/u.test(receiptSha256));
 }
 console.log(JSON.stringify(operate(mode,{previousIndexPin:{path:indexPath,
  bytes:Number(indexBytes),sha256:indexSha256},
  ...(receiptPath?{engineeringReceiptPin:{path:receiptPath,
   bytes:Number(receiptBytes),sha256:receiptSha256}}:{})}),null,2));
}
