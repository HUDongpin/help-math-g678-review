#!/usr/bin/env node
/** P021 admission proposal. --prepare writes a proof; registry/activation remain separate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import * as S from '../lib/alg-l06-p021-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const ENGINEERING_RECEIPT_PATH=
 'output/playwright/alg-l06-p021-host-v1/engineering-receipt-v1.json';
export const ENGINEERING_RECEIPT_PIN=Object.freeze({path:ENGINEERING_RECEIPT_PATH,
 bytes:6142,sha256:'5f56b2bc59a8df16eb6c0f9e4f2b70fed3a04963e60f455c155faab1e4240573'});
export const BROWSER_INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v70.json',
 bytes:5249,sha256:'cd06abb38f39030752ee5badd1517864f7972481bde783a00ccdc3fdf0bac763'});
export const PREVIOUS_INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v71.json',
 bytes:5249,sha256:'8b913a28e81584ea909723dcc7044162029eea686ca124e5d5542e02048b44cb'});
const REQUIRED_CHECKS=Object.freeze([
 'enEsCandidateReadyNoAutoplay','sixInstancesKeyboardCloseFocusBothLocales',
 'naturalMainEOF377','separateSaExplicitAndMainStopped','saEOFRequiresExplicitReturn',
 'reducedMotion390ExplicitPlayPauseHold','replayCancelsDelayedSa',
 'previousNavigationClosedMainAndSa']);
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p021-admission-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs','scripts/private-current-js-registry.mjs',
 'lib/alg-l06-p021-admission-semantics-v1.mjs',
 'output/alg-l06-p021-source-audit-v1/audit-time-resolved-v1.mjs',
 'output/alg-l06-p021-audio-v1/build-audio-plan.mjs',
 'output/alg-l06-p021-canvas-v1/build.mjs',
 'scripts/build-alg-l06-p021-text-state-v1.mjs',
 'scripts/lib/swf-text-source-catalog.mjs',
 'packages/demos/src/decoded-source-stream-transport.ts',
 'packages/demos/src/source-static-canvas-candidate.tsx',
 'packages/demos/src/alg-l06-p004-glossary-content-v1.ts',
 'packages/demos/src/alg-l06-p004-glossary-content.generated.ts']);
const REQUIRED_CANDIDATE_HOST=Object.freeze([
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/candidate-v1/page.tsx`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/[resource]/route.ts`,
 'apps/web/components/g678-alg-l06-p021-candidate-player-v1.generated.tsx',
 'apps/web/components/g678-alg-l06-p021-host-lesson-v1.tsx',
 'apps/web/components/g678-alg-l06-p021-runtime-v1.tsx',
 'apps/web/lib/alg-l06-p021-candidate-v1.server.ts',
 'apps/web/lib/alg-l06-p021-local-request-v1.ts',
 'apps/web/lib/alg-l06-p021-local-request.production-stub.ts',
 'apps/web/lib/alg-l06-p021-resources-v1.server.ts']);
const FORMAL_READER='apps/web/lib/alg-l06-p021-formal-admission-v1.server.ts';
const FORMAL_ROUTE=`apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/continuous-v1/page.tsx`;
const SNAPSHOT='output/alg-l06-p021-formal-transition-v1/before/apps/web/lib/alg-l06-p021-resources-v1.server.ts';
const bytes=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,data)=>({path:relative,bytes:data.length,sha256:sha256(data)});
function writeExact(relative,data){
 const absolute=path.join(ROOT,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 try{fs.writeFileSync(absolute,data,{flag:'wx'});}catch(error){
  if(error?.code!=='EEXIST')throw error;
  assert.deepEqual(readPin(ROOT,pinBytes(relative,data)),data,`immutable output: ${relative}`);
 }
 return pinFile(ROOT,relative);
}
function uniqueExternal(items){
 const result=new Map();for(const item of items){
  assert(item?.root&&item?.pin?.path&&!path.isAbsolute(item.pin.path),'bounded external source');
  const key=path.join(item.root,item.pin.path),old=result.get(key);
  if(old)assert.deepEqual(old,item,`conflicting external source: ${key}`);else result.set(key,item);
 }
 return [...result.values()].sort((a,b)=>
  path.join(a.root,a.pin.path).localeCompare(path.join(b.root,b.pin.path)));
}
function activePin(){
 const source=readPin(ROOT,pinFile(ROOT,'apps/web/lib/g678-admission-activation.ts')).toString();
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=source.indexOf(marker),end=source.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin&&source.indexOf(marker,begin+1)<0,'one active index');
 return JSON.parse(source.slice(begin+marker.length,end));
}
/** Exactly qualify the real v70 candidate browser matrix; no fidelity/listening promotion. */
export function validateEngineeringReceipt(receipt){
 assert.equal(receipt.kind,'g678-p021-local-my-lesson-engineering-v1');
 assert.deepEqual([receipt.animationId,receipt.formalRegistered,receipt.denominator,
  receipt.p021Registered],[S.ID,508,2282,false]);
 assert.deepEqual(receipt.indexPin,BROWSER_INDEX_PIN);
 const index=readJsonPin(ROOT,receipt.indexPin),host=readJsonPin(ROOT,receipt.hostPin);
 assert.deepEqual(index.host,receipt.hostPin,'browser index binds exact host');
 assert.equal(index.pages.length,18,'eighteen formal predecessor proofs');
 assert(!index.pages.some(row=>row.animationId===S.ID));
 assert.equal(host.kind,'g678-admission-host-v1');
 const hostPaths=new Set(host.files.map(item=>item.path));
 for(const required of REQUIRED_CANDIDATE_HOST)assert(hostPaths.has(required),
  `browser host missing P021 candidate: ${required}`);
 for(const key of REQUIRED_CHECKS)assert.equal(receipt.checks?.[key],true,
  `P021 engineering check: ${key}`);
 assert.deepEqual(receipt.pageErrors,[]);assert.deepEqual(receipt.consoleErrors,[]);
 assert.deepEqual(receipt.acceptance,{originalRuntime:false,listening:false,human:false,
  owner:false,strictCompletion:false,published:false});
 assert(Array.isArray(receipt.remainingGap)&&receipt.remainingGap.length>0);
 const artifacts=uniquePins(receipt.artifacts);
 assert.equal(artifacts.length,receipt.artifacts.length,'unique raw browser artifacts');
 for(const item of artifacts){assert(item.path.startsWith('output/playwright/alg-l06-p021-host-v1/')&&
  item.path!==ENGINEERING_RECEIPT_PATH,'bounded raw browser artifact');readPin(ROOT,item);}
 const casesPin=artifacts.find(item=>item.path.endsWith('/cases.json'));
 const errorsPin=artifacts.find(item=>item.path.endsWith('/page-errors.json'));
 assert(casesPin&&errorsPin,'raw structured browser cases and page errors');
 const cases=readJsonPin(ROOT,casesPin),errors=readJsonPin(ROOT,errorsPin);
 assert.deepEqual(errors.pageErrors,[]);assert.deepEqual(errors.consoleErrors,[]);
 const keys=Object.keys(S.GLOSSARY_GATES);
 for(const [locale,items] of [['en',cases.en],['es',cases.es?.cases]]){
  assert.equal(items?.[0]?.kind,'initial');assert.equal(items[0].state?.phase,'ready');
  assert.equal(items[0].state?.frame,1);assert.equal(items[0].state?.sa,'idle');
  const glossary=items.filter(item=>item.kind==='glossary');
  assert.deepEqual(glossary.map(item=>item.key),keys,`${locale} six exact keys`);
  for(const item of glossary){
   const [characterId,firstFrame]=S.GLOSSARY_GATES[item.key];
   void characterId;
   assert(item.opened?.frame>=firstFrame&&item.closed?.frame>=firstFrame,
    `${locale} source-supported glossary timing`);
   assert.equal(item.opened?.phase,'paused');assert.equal(item.closed?.phase,'paused');
   assert.equal(item.closed?.focused,item.instance,'focus returns to source instance');
   assert(item.text?.length>20,'dictionary text actually shown');
  }
 }
 assert.deepEqual(cases.es.pageErrors,[]);assert.deepEqual(cases.lifecycle.pageErrors,[]);
 assert.deepEqual(cases.es.cases.filter(item=>item.kind!=='glossary').map(item=>item.kind),
  ['initial','natural-sa-end','explicit-sa-return','natural-final',
   'phone-200-percent-reflow','replay']);
 assert.deepEqual(cases.lifecycle.cases.map(item=>item.kind),
  ['reduced-initial','explicit-play-pause','replay-cancels-delayed-sa',
   'previous-navigation-during-sa']);
 const final=cases.es.cases.find(item=>item.kind==='natural-final');
 assert.deepEqual([final.state.p021PlayerPhase,final.state.p021PlayerFrame,
  final.state.canvasFrame],['timeline-ended','377','377']);
 assert(final.text.includes('(2, 3)(3, 5)(5, -2)(7, 1)'),
  'four source-supported ordered pairs present at end');
 const saEnd=cases.es.cases.find(item=>item.kind==='natural-sa-end');
 assert.deepEqual([saEnd.state.p021AudioOwner,saEnd.state.p021SaPhase],['spanish','ended']);
 const returned=cases.es.cases.find(item=>item.kind==='explicit-sa-return');
 assert.deepEqual([returned.selected.p021AudioOwner,returned.returned.p021AudioOwner],
  ['spanish','main']);
 const reflow=cases.es.cases.find(item=>item.kind==='phone-200-percent-reflow').reflow;
 assert.deepEqual([reflow.rootFont,reflow.width,reflow.scrollWidth],['32px',390,390]);
 const lifecycle=cases.lifecycle.cases;
 assert.equal(lifecycle[0].reduced,true);
 assert.deepEqual([lifecycle[0].viewport.width,lifecycle[0].viewport.scrollWidth],[390,390]);
 assert.equal(lifecycle[1].paused.player.p021PlayerPhase,'paused');
 assert.equal(lifecycle[2].loading.player.p021SaPhase,'loading');
 assert.equal(lifecycle[2].reset.player.p021SaPhase,'idle');
 assert.equal(lifecycle[3].closedContexts.length,lifecycle[3].createdContexts.length);
 return artifacts;
}
/** Browser-tested v70 bytes remain reviewable across only the v71 formal additions. */
export function verifyBrowserHostTransition(currentIndex,currentHost,receipt){
 assert.deepEqual(receipt.indexPin,BROWSER_INDEX_PIN);
 const oldIndex=readJsonPin(ROOT,BROWSER_INDEX_PIN),oldHost=readJsonPin(ROOT,receipt.hostPin);
 assert.deepEqual(currentIndex.pages,oldIndex.pages,'all eighteen previous proofs unchanged');
 assert.deepEqual(currentHost.previous,receipt.hostPin,'direct browser host successor');
 const before=new Map(oldHost.files.map(item=>[item.path,item]));
 const after=new Map(currentHost.files.map(item=>[item.path,item]));
 const added=currentHost.files.filter(item=>!before.has(item.path)).map(item=>item.path).sort();
 const changed=currentHost.files.filter(item=>before.has(item.path)&&
  JSON.stringify(before.get(item.path))!==JSON.stringify(item)).map(item=>item.path).sort();
 const removed=oldHost.files.filter(item=>!after.has(item.path)).map(item=>item.path);
 assert.deepEqual(added,[FORMAL_READER,FORMAL_ROUTE].sort());
 assert.deepEqual(changed,['apps/web/lib/alg-l06-p021-resources-v1.server.ts']);
 assert.deepEqual(removed,[]);
 const snapshotPin=pinFile(ROOT,SNAPSHOT),prior=before.get(changed[0]);
 assert.deepEqual([snapshotPin.bytes,snapshotPin.sha256],[prior.bytes,prior.sha256],
  'preserved browser-tested resource reader bytes');
 for(const [relative,item] of before)if(relative!==changed[0])
  assert.deepEqual(after.get(relative),item,`untouched browser host input ${relative}`);
 return {browserHostPin:receipt.hostPin,currentHostPin:currentIndex.host,
  added,changed,removed,snapshotPins:[snapshotPin]};
}
export function buildPlan({previousIndexPin,engineeringReceiptPin}={}){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'physical source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local preparation only');
 assert.deepEqual(previousIndexPin,PREVIOUS_INDEX_PIN,'reviewed v71 predecessor');
 assert.deepEqual(activePin(),previousIndexPin,'exact active predecessor index pin');
 assert.deepEqual(pinFile(ROOT,previousIndexPin.path),previousIndexPin);
 const index=readJsonPin(ROOT,previousIndexPin);
 assert.equal(index.kind,'g678-admission-index-v1');assert.equal(index.pages.length,18);
 assert(index.pages.some(row=>row.animationId==='shared-alg001-l06-p020'));
 assert(!index.pages.some(row=>row.animationId===S.ID));
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert(!transaction.registry.calibrations.some(row=>row.calibrationId===S.CALIBRATION||
  row.entries.some(entry=>entry.key===S.ID)));
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const hostPaths=new Set(host.files.map(item=>item.path));
 for(const required of [...REQUIRED_CANDIDATE_HOST,FORMAL_READER,FORMAL_ROUTE])
  assert(hostPaths.has(required),`P021 formal host input missing: ${required}`);
 let browserPins=[],transition=null;
 if(engineeringReceiptPin){
  assert.deepEqual(engineeringReceiptPin,ENGINEERING_RECEIPT_PIN);
  const receipt=readJsonPin(ROOT,engineeringReceiptPin);
  browserPins=validateEngineeringReceipt(receipt);
  transition=verifyBrowserHostTransition(index,host,receipt);
 }
 const source=S.readP021CanonicalSource(ROOT),artifacts=S.proposedP021Artifacts(ROOT);
 if(fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime)))
  assert.deepEqual(S.readP021Artifacts(ROOT),artifacts);
 const supportPins=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const integrity=uniquePins([...source.localInputs,...Object.values(artifacts),
  ...supportPins,...(engineeringReceiptPin?[engineeringReceiptPin,...browserPins,
   ...transition.snapshotPins]:[])]);
 const forbidden=new Set(['packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/g678-admission-activation.ts',S.PROOF_PATH,S.FREEZE_PATH,FRAGMENT_PATH,
  previousIndexPin.path,index.host.path]);
 assert(!integrity.some(item=>forbidden.has(item.path)));
 for(const item of integrity)readPin(ROOT,item);
 const external=uniqueExternal(source.external);
 for(const item of [S.SOURCE,S.XML,S.SA])assert(external.some(other=>
  other.root===S.SOURCE_ROOT&&JSON.stringify(other.pin)===JSON.stringify(item)),
  `physical P021 source retained: ${item.path}`);
 for(const item of external)readPin(item.root,item.pin);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:21,sourceOccurrence:21,sectionCode:'VB',sectionPageOrdinal:11,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p021Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:S.CONTINUOUS,optionalSpanishAudio:S.OPTIONAL_SPANISH,
  glossaryActions:source.glossary,
  integrity:{scope:'P021-six-glossary-ordered-pair-377-continuous-SA-native-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Original launch, exact Flash sync, listening, human review and visual fidelity remain independent.',
   files:integrity},acceptanceEffects:S.ACCEPTANCE,
  productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeData=bytes(packet),freeze=pinBytes(S.FREEZE_PATH,freezeData);
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP021AdmissionSemantics(bound,registration,ROOT),true);
 const projected={...transaction,
  registry:upsertPrivateCurrentJsCalibration(transaction.registry,registration)};
 const legacyInputs=uniquePins([...integrity,...Object.values(artifacts),freeze,...supportPins]);
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(item=>!hostPaths.has(item.path)),external};
 const proofData=bytes(proof),proofPin=pinBytes(S.PROOF_PATH,proofData);
 const outputs=new Map([[S.FREEZE_PATH,freezeData],[FRAGMENT_PATH,bytes(registration)],
  [S.PROOF_PATH,proofData]]);
 return {outputs,host,hostPin:index.host,index,proof,proofPin,bound,registration,
  external,supportPins,transaction,projected,previousIndexPin,engineeringReceiptPin,
  browserHostTransition:transition,source};
}
export function operate(mode,options={}){
 assert(['--plan','--prepare','--check'].includes(mode));
 if(mode!=='--plan')assert(options.engineeringReceiptPin,
  'exact real P021 browser receipt required before proof preparation');
 const plan=buildPlan(options);
 if(mode!=='--plan'){
  assert.equal(plan.source.migration.implementation.registryModule,
   `./modules/${S.ID}`,'migration metadata must bind canonical module');
  assert.deepEqual(S.readP021Artifacts(ROOT),plan.bound.entry.artifacts);
 }
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
   const result=prepareAdmissionCandidate({root:ROOT,output:S.PROOF_PATH,animationId:S.ID,
    packet:plan.bound,registration:plan.registration,implementationFiles:plan.supportPins,
    external:plan.external,hostPin:plan.hostPin,transaction:plan.transaction,
    validateSemantics:(packet,registration)=>
     S.validateP021AdmissionSemantics(packet,registration,ROOT)});
   assert.deepEqual(result.proof,plan.proofPin,'common helper exact planned proof');
  }
 }
 if(mode!=='--plan'){
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,plan.projected);
  S.validateP021AdmissionSemantics(packet,plan.registration,ROOT);
  assert.deepEqual([...buildPlan(options).outputs],[...plan.outputs],
   'stable physical inputs after written common-reader roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  outputs:[...plan.outputs].map(([relative,data])=>pinBytes(relative,data)),
  previousProofsUnchanged:plan.index.pages.map(page=>page.proof),
  engineeringReceiptBound:!!plan.engineeringReceiptPin,
  browserHostTransition:plan.browserHostTransition,
  outputsProvisional:mode==='--plan'&&!plan.engineeringReceiptPin,
  missingPrerequisites:mode==='--plan'&&!plan.engineeringReceiptPin?
   [ENGINEERING_RECEIPT_PATH]:[],pageFiles:plan.proof.files.length,
  external:plan.external.length,registrationChanged:false,activationChanged:false,
  acceptanceEffects:S.ACCEPTANCE};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert([6,9].includes(process.argv.length),
  'mode plus exact previous-index pin and optional engineering-receipt pin');
 const [,,mode,indexPath,indexBytes,indexSha256,receiptPath,receiptBytes,receiptSha256]=process.argv;
 assert(/^catalog\/g678-admission-v1\/index-v\d+\.json$/u.test(indexPath));
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
