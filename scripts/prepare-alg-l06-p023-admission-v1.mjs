#!/usr/bin/env node
/** P023 canonical admission producer. --plan reads; --prepare needs a reviewed browser pin. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import * as S from '../lib/alg-l06-p023-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const PREVIOUS_INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v77.json',
 bytes:5809,sha256:'2f48a75961e553c2c900a92c05b3ef0937726fcffb80b65f6e71e55d9abded92'});
export const ENGINEERING_RECEIPT_PATH=
 'output/playwright/alg-l06-p023-host-v1/engineering-receipt-v1.json';
const BROWSER_DIR='output/playwright/alg-l06-p023-host-v1/';
const SOURCE_BUTTON_INSTANCE=Object.freeze({Domain:'sprite-38/depth-6/generation-1',
 Function:'sprite-38/depth-12/generation-1',Set:'sprite-38/depth-10/generation-1',
 Input:'sprite-38/depth-8/generation-1'});
const REQUIRED_HOST=Object.freeze(['apps/web/lib/alg-l06-p022-formal-admission-v1.server.ts']);
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p023-admission-v1.mjs',
 'lib/alg-l06-p023-admission-semantics-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'scripts/private-current-js-registry.mjs',
 'apps/web/lib/alg-l06-p023-formal-admission-v1.server.ts',
 'apps/web/lib/alg-l06-p023-candidate-v1.server.ts',
 'apps/web/components/g678-alg-l06-p023-host-lesson-v1.tsx',
 'apps/web/components/g678-alg-l06-p023-runtime-v1.tsx',
 'apps/web/components/g678-alg-l06-p023-candidate-player-v1.generated.tsx',
 'apps/web/lib/alg-l06-p023-candidate-binding-v1.ts',
 'apps/web/lib/alg-l06-p023-local-request-v1.ts',
 'apps/web/lib/alg-l06-p023-local-request.production-stub.ts',
 'apps/web/lib/alg-l06-p023-preview-policy-v1.ts',
 'apps/web/lib/alg-l06-p023-resources-v1.server.ts',
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/candidate-v1/page.tsx`,
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/continuous-v1/page.tsx`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/[resource]/route.ts`]);
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
 assert.deepEqual(pin?.path,ENGINEERING_RECEIPT_PATH,'exact P023 browser receipt path');
 assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/.test(pin.sha256),
  'root-reviewed receipt requires exact bytes and SHA-256');
 return pin;
}
const eventsAfter=(observer,scope)=>observer.events.filter(e=>e.sequence>=scope.initialLastSequence);
/** Validates pinned raw cases as well as the receipt summary. Never infers a pass from flags alone. */
export function validateEngineeringReceipt(pin,index,host){
 exactReceiptPin(pin);
 const receipt=readJsonPin(ROOT,pin);
 assert.equal(receipt.kind,'g678-p023-local-my-lesson-engineering-v1');
 assert.deepEqual([receipt.animationId,receipt.formalRegistered,
  receipt.denominator,receipt.p023Registered],[S.ID,510,2282,false]);
 assert.deepEqual(receipt.indexPin,PREVIOUS_INDEX_PIN);
 assert.deepEqual(receipt.hostPin,index.host);
 assert.equal(host.kind,'g678-admission-host-v1');
 assert(!index.pages.some(row=>row.animationId===S.ID));
 assert.deepEqual(receipt.pageErrors,[]);assert.deepEqual(receipt.consoleErrors,[]);
 assert.deepEqual(receipt.acceptance,{originalRuntime:false,listening:false,human:false,
  owner:false,strictCompletion:false,published:false});
 assert(Array.isArray(receipt.remainingGap)&&receipt.remainingGap.length>0);
 const artifacts=uniquePins(receipt.artifacts);
 assert.equal(artifacts.length,receipt.artifacts.length,'unique browser artifacts');
 for(const item of artifacts){
  assert(item.path.startsWith(BROWSER_DIR)&&item.path!==ENGINEERING_RECEIPT_PATH,
   'bounded P023 browser artifact');readPin(ROOT,item);
 }
 const casesPin=artifacts.find(item=>item.path.endsWith('/cases.json'));
 const errorsPin=artifacts.find(item=>item.path.endsWith('/page-errors.json'));
 assert(casesPin&&errorsPin,'raw structured cases and page errors required');
 const cases=readJsonPin(ROOT,casesPin),errors=readJsonPin(ROOT,errorsPin);
 assert.deepEqual(errors.pageErrors,[]);assert.deepEqual(errors.consoleErrors,[]);
 assert.deepEqual(cases.enEnd.pageErrors,[]);assert.deepEqual(cases.enEnd.consoleErrors,[]);
 assert.deepEqual(cases.es.pageErrors,[]);assert.deepEqual(cases.lifecycle.pageErrors,[]);
 const contexts=[];
 for(const [locale,rows] of [['en',cases.en],['es',cases.es.cases]]){
  assert(Array.isArray(rows)&&rows.length>0,`${locale} raw browser cases`);
  const initial=rows[0];
  assert.deepEqual([initial.kind,initial.state.frame,initial.state.phase,
   initial.state.sa,initial.state.owner],['initial',1,'ready','idle','main']);
  const events=initial.observer.events,created=events.filter(e=>e.kind==='context-created'),
   current=created.at(-1);
  assert(current&&current.sampleRate===22050);
  assert(!events.some(e=>e.contextId===current.contextId&&e.kind==='source-start'),
   `${locale} current main context did not auto-start`);
  for(const previous of created.slice(0,-1))assert(events.some(e=>
   e.contextId===previous.contextId&&e.kind==='context-close-resolve'),
   'prior locale context closed');
  contexts.push({locale,documentId:current.documentId,contextId:current.contextId,
   initialLastSequence:events.at(-1).sequence});
  const glossary=rows.filter(item=>item.kind==='glossary');
  assert.deepEqual(glossary.map(item=>item.key).sort(),Object.keys(S.GATES).sort());
  assert.equal(new Set(glossary.map(item=>item.instance)).size,4);
  for(const row of glossary){
   const [,gate]=S.GATES[row.key];
   assert(row.opened.frame>=gate&&row.closed.frame===row.opened.frame);
   assert.equal(row.instance,SOURCE_BUTTON_INSTANCE[row.key]);
   assert.equal(row.id,row.key.toLowerCase());
   assert.equal(row.closed.phase,'paused');assert.equal(row.closed.focused,row.instance);
   assert(row.text.length>40,`${locale} actual dictionary text`);
  }
  const domain=glossary.find(item=>item.key==='Domain');
  assert(domain.text.includes(locale==='en'?'Glossary':'Glosario'));
  assert(domain.text.includes(locale==='en'?'Domain':'Dominio'));
 }
 assert.deepEqual(contexts,cases.contextScope);
 assert.deepEqual(contexts,receipt.observations.contextScope);
 assert.equal(contexts[0].documentId,contexts[1].documentId,
  'locale transition stayed in same document');
 const enEnd=cases.enEnd.state,esEnd=cases.es.cases.find(x=>x.kind==='natural-final');
 for(const row of [enEnd,{dataset:esEnd?.state,canvas:esEnd?.state.canvasFrame}]){
  assert.equal(row.dataset.p023PlayerFrame,'410');
  assert.equal(row.dataset.p023PlayerPhase,'timeline-ended');
  assert.equal(row.canvas,'410');
 }
 assert(enEnd.text.includes('InputOutput111021003')&&enEnd.text.includes('{1,10,100}'));
 assert(esEnd.text.includes('Input\tOutput')&&esEnd.text.includes('{1,10,100}'));
 const stats=[];
 for(const [locale,observer,scope] of [['en',enEnd.observer,contexts[0]],
  ['es',esEnd.observer,contexts[1]]]){
  const events=eventsAfter(observer,scope),active=new Map(),mainContexts=new Set();
  let saStarts=0;
  for(const event of events){
   if(event.kind==='source-start'&&event.accepted){
    assert.equal(active.size,0,'one source owner at a time');
    assert.equal(event.sampleCount,event.asset==='main-1'?734400:1002240);
    assert.equal(event.sampleRate,event.asset==='main-1'?22050:48000);
    active.set(event.nodeId,event.asset);
    if(event.asset==='main-1')mainContexts.add(event.contextId);else saStarts++;
   }else if(['source-stop','source-disconnect','source-ended-event'].includes(event.kind))
    active.delete(event.nodeId);
  }
  assert.equal(mainContexts.size,1);
  assert.equal(saStarts,locale==='en'?0:1);
  assert.equal(active.size,0);
  const starts=events.filter(e=>e.kind==='source-start'&&e.asset==='main-1'&&e.accepted);
  assert(starts.length>=1);
  assert(Math.abs(starts[0].startArgs[1]-1673/22050)<1e-12,
   'exact initial source seek 1673 samples');
  assert(Math.abs(starts[0].startArgs[0]-starts[0].contextTime-10/12)<1e-6,
   'main source starts at frame 11 on one clock');
  assert(events.some(e=>e.kind==='source-ended-event'&&e.nodeId===starts.at(-1).nodeId),
   'natural main EOF');
  stats.push({locale,mainContextId:[...mainContexts][0],saStarts});
 }
 const selected=cases.es.cases.find(x=>x.kind==='explicit-sa-return');
 const saEnd=cases.es.cases.find(x=>x.kind==='natural-sa-end');
 assert.equal(selected.selected.p023AudioOwner,'spanish');
 assert.equal(saEnd.state.p023AudioOwner,'spanish');
 assert.equal(saEnd.state.p023SaPhase,'ended');
 assert.equal(selected.returned.p023AudioOwner,'main');
 assert.equal(selected.returned.p023PlayerPhase,'playing');
 const timing=cases.es.cases.find(x=>x.kind==='source-text-timing');
 assert(timing&&Array.isArray(timing.rows),
  'raw source text timing rows required');
 assert.deepEqual(timing.rows.map(row=>row.frame),
  [131,132,172,173,393,394,400,401]);
 for(const row of timing.rows){
  assert.equal(row.playerFrame,row.frame);
  assert.equal(row.table,row.frame<173?null:'InputOutput111021003');
  assert.equal(row.set,row.frame<401?null:'{1,10,100}');
  assert(typeof row.text==='string'&&row.text.length>0);
  assert.equal(row.text.includes('InputOutput111021003'),row.frame>=173);
  assert.equal(row.text.includes('{1,10,100}'),row.frame>=401);
 }
 assert.deepEqual(cases.enEnd.boundaries.map(x=>Number(x.dataset.p023PlayerFrame)),
  [132,173,394,401]);
 const reflow=cases.es.cases.find(x=>x.kind==='phone-200-percent-reflow').reflow;
 assert.deepEqual([reflow.rootFont,reflow.width,reflow.scrollWidth],['32px',390,390]);
 assert.equal(cases.es.cases.find(x=>x.kind==='replay').state.p023PlayerFrame,'1');
 const lifecycle=cases.lifecycle.cases;
 const reduced=lifecycle.find(x=>x.kind==='reduced-initial');
 assert(reduced.reduced&&reduced.viewport.width===390);
 assert.equal(reduced.player.p023MotionPolicy,'explicit-reduced');
 assert.equal(reduced.player.p023PlayerFrame,'1');
 assert(!reduced.observer.events.some(e=>e.kind==='source-start'));
 const pause=lifecycle.find(x=>x.kind==='explicit-play-pause');
 assert.equal(pause.paused.player.p023PlayerFrame,pause.held.player.p023PlayerFrame);
 assert.equal(pause.held.player.p023PlayerPhase,'paused');
 const cancel=lifecycle.find(x=>x.kind==='replay-cancels-delayed-sa');
 assert(cancel.requestDelayInjected);
 assert.equal(cancel.loading.player.p023SaPhase,'loading');
 assert.equal(cancel.reset.player.p023PlayerFrame,'1');
 assert.equal(cancel.reset.player.p023SaPhase,'idle');
 assert(!cancel.reset.observer.events.some(e=>e.kind==='source-start'&&
  e.asset==='separate-sa'));
 const nav=lifecycle.find(x=>x.kind==='previous-navigation-during-sa');
 assert.equal(nav.beforeExit.player.p023SaPhase,'playing');
 assert(nav.createdContexts.length>=2);
 assert(nav.createdContexts.every(id=>nav.closedContexts.includes(id)));
 assert.equal(cases.lifecycle.predecessor.p022PlayerPhase,'idle',
  'historical immediate mount observation retained');
 const predecessorPin=artifacts.find(item=>item.path.endsWith('/predecessor-ready-v1.json'));
 assert(predecessorPin,'actual awaited P022 predecessor ready export');
 const predecessor=readJsonPin(ROOT,predecessorPin);
 assert.deepEqual(predecessor.pageErrors,[]);assert.deepEqual(predecessor.consoleErrors,[]);
 assert.deepEqual(errors.predecessor,predecessor.predecessor);
 assert.deepEqual([predecessor.predecessor.p022PlayerPhase,
  predecessor.predecessor.p022PlayerFrame,
  predecessor.predecessor.p022AudioOwner,
  predecessor.predecessor.p022SaPhase],['ready','1','main','idle']);
 const httpPin=artifacts.find(item=>item.path.endsWith('/http-check-v1.json'));
 assert(httpPin,'raw P023 HTTP routes');
 const http=readJsonPin(ROOT,httpPin);
 assert(http.rows.length>=7);
 assert(http.rows.slice(0,2).every(row=>row.status===200&&row.robots.includes('noindex')));
 assert(http.rows.slice(2).every(row=>row.status===404));
 return {receipt,artifacts,cases,stats};
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
 assert.deepEqual(previousIndexPin,PREVIOUS_INDEX_PIN,'reviewed v77 predecessor');
 assert.deepEqual(activePin(),PREVIOUS_INDEX_PIN,'exact active predecessor index');
 assert.deepEqual(pinFile(ROOT,PREVIOUS_INDEX_PIN.path),PREVIOUS_INDEX_PIN);
 const index=readJsonPin(ROOT,PREVIOUS_INDEX_PIN);
 assert.equal(index.kind,'g678-admission-index-v1');assert.equal(index.pages.length,20);
 assert(index.pages.some(row=>row.animationId==='shared-alg001-l06-p022'));
 assert(!index.pages.some(row=>row.animationId===S.ID));
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert.equal(transaction.registry.calibrations.filter(row=>row.deploymentScope==='local-only')
  .reduce((count,row)=>count+row.entries.length,0),510,
  'exact 510 formal Current-JS registrations before P023');
 assert(transaction.registry.calibrations.some(row=>row.entries.some(entry=>
  entry.key==='shared-alg001-l06-p022')),'P022 predecessor registered');
 assert(!transaction.registry.calibrations.some(row=>row.calibrationId===S.CALIBRATION||
  row.entries.some(entry=>entry.key===S.ID)));
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const hostPaths=new Set(host.files.map(item=>item.path));
 for(const required of REQUIRED_HOST)assert(hostPaths.has(required),
  `P023 predecessor host input missing: ${required}`);
 const source=S.readP023CanonicalSource(ROOT),artifacts=source.artifacts;
 let browserArtifacts=[];
 if(engineeringReceiptPin)
  ({artifacts:browserArtifacts}=validateEngineeringReceipt(engineeringReceiptPin,index,host));
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
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:23,sourceOccurrence:23,sectionCode:'VB',sectionPageOrdinal:13,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p023Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:{audit:source.binding.audio,plan:source.binding.audioPlan,
   mainRanges:[[11,410]],mainRangeAssets:[source.audio.main.extractedMp3],
   mainFrameDomain:'sprite-38',zeroPayloadFrame:12,initialSeekSamples:1673,
   mainRangesConcatenated:false,syntheticSilenceAdded:false,
   originalRuntimeAccepted:false,listeningAccepted:false,audioAccepted:false},
  optionalSpanishAudio:{source:S.SA,sourceCopy:source.audio.separateSa.copy,
   trigger:'explicit-user-only',localeAutoplay:false,mainStreamSpliced:false,
   mainPausedDuringPlayback:true,returnMainSupported:true,audioAccepted:false},
  glossaryActions:source.glossary,
  ...(engineeringReceiptPin?{engineeringReceipt:engineeringReceiptPin}:{}),
  integrity:{scope:'P023-four-glossary-one-main-range-410-table-set-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Original Flash synchronization, listening, human review and visual fidelity remain independent.',
   files:integrity},acceptanceEffects:S.ACCEPTANCE,
  productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeData=bytes(packet),freeze=pinBytes(S.FREEZE_PATH,freezeData);
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP023AdmissionSemantics(bound,registration,ROOT),true);
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
  'exact root-reviewed P023 browser receipt required before proof preparation');
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
     S.validateP023AdmissionSemantics(packet,registration,ROOT)});
   assert.deepEqual(result.proof,plan.proofPin,'common helper exact planned proof');
  }
 }
 if(mode==='--check'||mode==='--prepare'){
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,plan.projected);
  S.validateP023AdmissionSemantics(packet,plan.registration,ROOT);
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
