#!/usr/bin/env node
/** Prepare a source-bound P020 candidate proof. It never registers or activates. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import * as S from '../lib/alg-l06-p020-admission-semantics-v2.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v2.json`;
export const ENGINEERING_RECEIPT_PATH=
 'output/playwright/alg-l06-p020-host-v1/engineering-receipt-v1.json';
export const ENGINEERING_RECEIPT_PIN=Object.freeze({path:ENGINEERING_RECEIPT_PATH,
 bytes:4701,sha256:'1409e57c2370046466130338e4fe207a70261d8d66b1b342676326775bf71e93'});
export const PREVIOUS_INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v66.json',
 bytes:4969,sha256:'4d61a3666e823fcaf8d49101e751b46667a56745a71053f3511ab18673fa78be'});
export const BROWSER_INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v65.json',
 bytes:4969,sha256:'28d68a050714159ec81afd2872733723a504e2ed8b5dd728f4a945d4fb29aa0c'});
export const REQUIRED_CHECKS=Object.freeze([
 'enEsCandidateReadyNoAutoplay','threeGlossaryKeysKeyboardCloseFocusBothLocales',
 'allFourRightBranchesModernInjected','allThreeWrongBranchesTwoAttemptsClose',
 'sameMainResumedAt59AndEnded172','finalSourceAnswerRetainedNative',
 'separateSaExplicitAndMainStopped','saEOFRequiresExplicitReturn',
 'reducedMotion320ExplicitPlayPauseHold','replayCancelsDelayedSa',
 'previousNavigationClosedMainAndSa']);
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p020-admission-v2.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'scripts/private-current-js-registry.mjs',
 'lib/alg-l06-p020-admission-semantics-v2.mjs',
 'output/alg-l06-p020-source-audit-v1/audit-source-v1.mjs',
 'output/alg-l06-p020-behavior-v1/audit.py',
 'output/alg-l06-p020-audio-v1/extract.mjs',
 'output/alg-l06-p020-audio-implementation-v1/build-audio-plan.mjs',
 'output/alg-l06-p020-canvas-v1/build-drawing.mjs',
 'scripts/build-alg-l06-p020-text-state-v1.mjs',
 'scripts/lib/swf-domain-audio-v1.mjs',
 'scripts/lib/swf-text-source-catalog.mjs',
 'packages/demos/src/decoded-source-stream-transport.ts',
 'packages/demos/src/source-static-canvas-candidate.tsx',
 'packages/demos/src/alg-l06-p004-glossary-content-v1.ts',
 'packages/demos/src/alg-l06-p004-glossary-content.generated.ts']);
const REQUIRED_CANDIDATE_HOST=Object.freeze([
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/candidate-v1/page.tsx`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/[resource]/route.ts`,
 'apps/web/components/g678-alg-l06-p020-candidate-player-v1.generated.tsx',
 'apps/web/components/g678-alg-l06-p020-host-lesson-v1.tsx',
 'apps/web/components/g678-alg-l06-p020-runtime-v1.tsx',
 'apps/web/lib/alg-l06-p020-candidate-v1.server.ts',
 'apps/web/lib/alg-l06-p020-local-request-v1.ts',
 'apps/web/lib/alg-l06-p020-local-request.production-stub.ts',
 'apps/web/lib/alg-l06-p020-resources-v1.server.ts']);
const REQUIRED_HOST=Object.freeze([...REQUIRED_CANDIDATE_HOST,
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/continuous-v1/page.tsx`,
 'apps/web/lib/alg-l06-p020-formal-admission-v1.server.ts']);
const EXPECTED_CHANGED=Object.freeze([
 'apps/web/lib/alg-l06-p019-formal-admission-v1.server.ts',
 'apps/web/lib/alg-l06-p020-preview-policy-v1.ts',
 'apps/web/lib/alg-l06-p020-resources-v1.server.ts',
 'apps/web/next.config.ts','apps/web/proxy.ts']);
const EXPECTED_ADDED=Object.freeze([
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/continuous-v1/page.tsx`,
 'apps/web/lib/alg-l06-p020-formal-admission-v1.server.ts']);
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
  assert(item?.root&&item?.pin?.path&&!path.isAbsolute(item.pin.path),
   'bounded external source');
  const key=path.join(item.root,item.pin.path),prior=result.get(key);
  if(prior)assert.deepEqual(prior,item,`conflicting external source: ${key}`);
  else result.set(key,item);
 }
 return [...result.values()].sort((a,b)=>
  path.join(a.root,a.pin.path).localeCompare(path.join(b.root,b.pin.path)));
}
/** Browser engineering receipt must be current-host, hash-bound and acceptance-neutral. */
export function validateEngineeringReceipt(receipt){
 assert.equal(receipt.kind,'g678-p020-local-my-lesson-engineering-v1');
 assert.equal(receipt.animationId,S.ID);
 assert.deepEqual([receipt.formalRegistered,receipt.denominator,receipt.p020Registered],
  [507,2282,false]);
 assert(/^catalog\/g678-admission-v1\/index-v\d+\.json$/u.test(receipt.indexPin?.path));
 assert(/^catalog\/g678-admission-v1\/host-v\d+\.json$/u.test(receipt.hostPin?.path));
 const index=readJsonPin(ROOT,receipt.indexPin),host=readJsonPin(ROOT,receipt.hostPin);
 assert.equal(index.kind,'g678-admission-index-v1');
 assert.deepEqual(index.host,receipt.hostPin,'browser index binds exact host');
 assert.equal(index.pages.length,17,'seventeen formal predecessor proofs');
 assert(!index.pages.some(page=>page.animationId===S.ID),'P020 not registered in browser index');
 assert.equal(host.kind,'g678-admission-host-v1');
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 for(const required of REQUIRED_CANDIDATE_HOST)assert(hostPaths.has(required),
  `browser host missing P020 candidate: ${required}`);
 for(const key of REQUIRED_CHECKS)assert.equal(receipt.checks?.[key],true,
  `real P020 browser check: ${key}`);
 assert.deepEqual(receipt.pageErrors,[],'browser page errors');
 assert.deepEqual(receipt.consoleErrors,[],'browser console errors');
 assert.deepEqual(receipt.acceptance,{originalRuntime:false,listening:false,human:false,
  owner:false,strictCompletion:false,published:false},'independent acceptance gates');
 assert(Array.isArray(receipt.remainingGap)&&receipt.remainingGap.length>0,
  'explicit unresolved fidelity/listening gap');
 assert(Array.isArray(receipt.artifacts)&&receipt.artifacts.length>=3,
  'current browser raw artifact pins required');
 const pins=uniquePins(receipt.artifacts);
 assert.equal(pins.length,receipt.artifacts.length,'unique raw evidence paths');
 // The receipt is an immutable v1 contract; the freshly corrected raw browser
 // matrix lives in v2. Historical partial v1 cases must never qualify it.
 const prefix='output/playwright/alg-l06-p020-host-v2/';
 for(const pin of pins){
  assert(pin.path.startsWith(prefix)&&pin.path!==ENGINEERING_RECEIPT_PATH,
   'bounded P020 browser raw artifact');readPin(ROOT,pin);
 }
 return pins;
}
/** Only the reviewed formal-host successor may carry the v65 browser proof. */
export function verifyBrowserHostTransition(currentIndex,currentHost,receipt){
 assert.deepEqual(receipt.indexPin,BROWSER_INDEX_PIN,'exact browser-tested v65 index');
 assert.deepEqual(receipt.hostPin,readJsonPin(ROOT,BROWSER_INDEX_PIN).host,
  'exact browser-tested v65 host');
 assert.deepEqual(currentIndex.pages,readJsonPin(ROOT,BROWSER_INDEX_PIN).pages,
  'all seventeen predecessor proofs unchanged across v65 to v66');
 const oldHost=readJsonPin(ROOT,receipt.hostPin);
 assert.deepEqual(currentHost.previous,receipt.hostPin,
  'v66 host is the direct reviewed successor of browser-tested v65');
 assert.equal(oldHost.kind,'g678-admission-host-v1');
 assert.deepEqual(uniquePins(oldHost.files),oldHost.files,'unique historical host pins');
 const oldFiles=new Map(oldHost.files.map(item=>[item.path,item]));
 const newFiles=new Map(currentHost.files.map(item=>[item.path,item]));
 const added=currentHost.files.filter(item=>!oldFiles.has(item.path))
  .map(item=>item.path).sort();
 const changed=currentHost.files.filter(item=>oldFiles.has(item.path)&&
  JSON.stringify(oldFiles.get(item.path))!==JSON.stringify(item))
  .map(item=>item.path).sort();
 const removed=oldHost.files.filter(item=>!newFiles.has(item.path)).map(item=>item.path);
 assert.deepEqual(added,[...EXPECTED_ADDED].sort(),'only reviewed formal additions');
 assert.deepEqual(changed,[...EXPECTED_CHANGED].sort(),'only reviewed formal changes');
 assert.deepEqual(removed,[],'no browser-tested host input removed');
 const snapshotPins=[];
 for(const relative of EXPECTED_CHANGED){
  const old=oldFiles.get(relative);
  const snapshot=pinFile(ROOT,
   `output/alg-l06-p020-formal-root-v1/shared-before/${relative}`);
  assert.deepEqual([snapshot.bytes,snapshot.sha256],[old.bytes,old.sha256],
   `historical browser-tested input preserved: ${relative}`);
  snapshotPins.push(snapshot);
 }
 for(const item of oldHost.files){
  if(EXPECTED_CHANGED.includes(item.path))continue;
  assert.deepEqual(newFiles.get(item.path),item,
   `browser-tested maintained input unchanged: ${item.path}`);
 }
 return {browserHostPin:receipt.hostPin,currentHostPin:currentIndex.host,
  added,changed,removed,snapshotPins};
}
export function buildPlan({previousIndexPin,engineeringReceiptPin}={}){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'real source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local development preparation only');
 assert(previousIndexPin?.path,'exact reviewed previous index pin required');
 const activation='apps/web/lib/g678-admission-activation.ts';
 const active=readPin(ROOT,pinFile(ROOT,activation)).toString();
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=active.indexOf(marker),end=active.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin&&active.indexOf(marker,begin+1)<0,'one active index');
 assert.deepEqual(JSON.parse(active.slice(begin+marker.length,end)),previousIndexPin,
  'exact active predecessor index pin');
 assert.deepEqual(pinFile(ROOT,previousIndexPin.path),previousIndexPin,
  'exact previous index bytes');
 assert.deepEqual(previousIndexPin,PREVIOUS_INDEX_PIN,'reviewed v66 predecessor only');
 const index=readJsonPin(ROOT,previousIndexPin);
 assert.equal(index.kind,'g678-admission-index-v1');
 assert.equal(index.pages.length,17,'seventeen immutable earlier proofs');
 assert(index.pages.some(page=>page.animationId==='shared-alg001-l06-p019'),
  'P019 predecessor proof retained');
 assert(!index.pages.some(page=>page.animationId===S.ID),'P020 remains unregistered');
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert(!transaction.registry.calibrations.some(c=>c.calibrationId===S.CALIBRATION||
  c.entries.some(e=>e.key===S.ID)),'P020 not in registry');
 assert(transaction.registry.calibrations.some(c=>c.entries.some(e=>
  e.key==='shared-alg001-l06-p019')),'P019 registered predecessor retained');
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 for(const required of REQUIRED_HOST)assert(hostPaths.has(required),
  `P020 reviewed candidate host input missing: ${required}`);
 let browserPins=[],browserHostTransition=null;
 if(engineeringReceiptPin){
  assert.deepEqual(engineeringReceiptPin,ENGINEERING_RECEIPT_PIN,
   'exact v65 P020 engineering receipt bytes');
  const receipt=readJsonPin(ROOT,engineeringReceiptPin);
  browserPins=validateEngineeringReceipt(receipt);
  browserHostTransition=verifyBrowserHostTransition(index,host,receipt);
 }
 const source=S.readP020CanonicalSource(ROOT),artifacts=S.proposedP020Artifacts(ROOT);
 if(fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime)))
  assert.deepEqual(S.readP020Artifacts(ROOT),artifacts,'exact copied Canvas member');
 const supportPins=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const forbidden=new Set(['packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  activation,S.PROOF_PATH,S.FREEZE_PATH,FRAGMENT_PATH,
  previousIndexPin.path,index.host.path]);
 const integrity=uniquePins([...source.localInputs,...Object.values(artifacts),
  ...supportPins,...(engineeringReceiptPin?[engineeringReceiptPin,...browserPins,
   ...browserHostTransition.snapshotPins]:[])]);
 assert(!integrity.some(pin=>forbidden.has(pin.path)),'no cyclic or registry input');
 for(const item of integrity){
  if(item.path===S.ARTIFACT_PATHS.runtime&&
   !fs.existsSync(path.join(ROOT,item.path)))continue;
  readPin(ROOT,item);
 }
 const external=uniqueExternal(source.external);
 for(const item of [S.SOURCE,S.XML,S.SA])assert(external.some(other=>
  other.root===S.SOURCE_ROOT&&JSON.stringify(other.pin)===JSON.stringify(item)),
  `physical P020 source retained: ${item.path}`);
 for(const item of external)readPin(item.root,item.pin);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:20,sourceOccurrence:20,sectionCode:'VB',sectionPageOrdinal:10,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p020Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:S.CONTINUOUS,optionalSpanishAudio:S.OPTIONAL_SPANISH,
  glossaryActions:S.GLOSSARY,
  integrity:{scope:'P020-three-glossary-four-answer-seven-feedback-172-domain-audio-SA-native-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Original launch, exact Flash sync, listening, human review and visual fidelity remain independent.',
   files:integrity},acceptanceEffects:S.ACCEPTANCE,
  productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeData=bytes(packet),freeze=pinBytes(S.FREEZE_PATH,freezeData);
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP020AdmissionSemantics(bound,registration,ROOT),true);
 const projected={...transaction,
  registry:upsertPrivateCurrentJsCalibration(transaction.registry,registration)};
 const legacyInputs=uniquePins([...integrity,...Object.values(artifacts),freeze,...supportPins]);
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external};
 const proofData=bytes(proof),proofPin=pinBytes(S.PROOF_PATH,proofData);
 const outputs=new Map([[S.FREEZE_PATH,freezeData],[FRAGMENT_PATH,bytes(registration)],
  [S.PROOF_PATH,proofData]]);
 return {outputs,host,hostPin:index.host,index,proof,proofPin,bound,registration,
  external,supportPins,transaction,projected,previousIndexPin,engineeringReceiptPin,
  browserHostTransition};
}
export function operate(mode,options={}){
 assert(['--plan','--prepare','--check'].includes(mode),'--plan | --prepare | --check');
 if(mode!=='--plan')assert(options.engineeringReceiptPin,
  'exact real P020 browser engineering receipt required before preparation');
 const plan=buildPlan(options);
 if(mode!=='--plan')assert.deepEqual(S.readP020Artifacts(ROOT),plan.bound.entry.artifacts,
  'physical Canvas member required');
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
     S.validateP020AdmissionSemantics(packet,registration,ROOT)});
   assert.deepEqual(result.proof,plan.proofPin,'common helper exact planned proof');
  }
 }
 if(mode!=='--plan'){
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,plan.projected);
  S.validateP020AdmissionSemantics(packet,plan.registration,ROOT);
  assert.deepEqual([...buildPlan(options).outputs],[...plan.outputs],
   'stable physical inputs after common-reader roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  outputs:[...plan.outputs].map(([relative,data])=>pinBytes(relative,data)),
  previousProofsUnchanged:plan.index.pages.map(page=>page.proof),
  runtimeMemberMaterialized:fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime)),
  engineeringReceiptBound:!!plan.engineeringReceiptPin,
  browserHostTransition:plan.browserHostTransition,
  outputsProvisional:mode==='--plan'&&(!plan.engineeringReceiptPin||
   !fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime))),
  missingPrerequisites:mode==='--plan'?[...(!plan.engineeringReceiptPin?[ENGINEERING_RECEIPT_PATH]:[]),
   ...(!fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime))?
    [S.ARTIFACT_PATHS.runtime]:[])]:[],
  pageFiles:plan.proof.files.length,external:plan.external.length,
  registrationChanged:false,activationChanged:false,acceptanceEffects:S.ACCEPTANCE};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert([6,9].includes(process.argv.length),
  'mode plus exact previous-index pin and optional engineering-receipt pin');
 const [,,mode,indexPath,indexBytes,indexSha256,receiptPath,receiptBytes,receiptSha256]=process.argv;
 assert(/^catalog\/g678-admission-v1\/index-v\d+\.json$/u.test(indexPath));
 assert(/^\d+$/u.test(indexBytes)&&/^[a-f0-9]{64}$/u.test(indexSha256));
 if(receiptPath!==undefined){
  assert.equal(receiptPath,ENGINEERING_RECEIPT_PATH,'exact P020 receipt path');
  assert(/^\d+$/u.test(receiptBytes)&&/^[a-f0-9]{64}$/u.test(receiptSha256));
 }
 console.log(JSON.stringify(operate(mode,{previousIndexPin:{path:indexPath,
  bytes:Number(indexBytes),sha256:indexSha256},
  ...(receiptPath?{engineeringReceiptPin:{path:receiptPath,
   bytes:Number(receiptBytes),sha256:receiptSha256}}:{})}),null,2));
}
