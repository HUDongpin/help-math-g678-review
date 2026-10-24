#!/usr/bin/env node
/** Prepare one P017 proof from current physical source and host; never register. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import * as S from '../lib/alg-l06-p017-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const ENGINEERING_RECEIPT_PATH='output/alg-l06-p017-host-lifecycle-v2/engineering-receipt-v1.json';
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p017-admission-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'lib/alg-l06-p017-admission-semantics-v1.mjs',
 'output/alg-l06-p017-source-preflight-v1/preflight.mjs',
 'output/alg-l06-p017-source-audit-v1/audit-time-resolved.mjs',
 'output/alg-l06-p017-glossary-audit-v1/check.mjs',
 'output/playwright/alg-l06-p017-browser-audio-v1/decode.js',
 'scripts/extract-alg-l06-p017-audio-v1.mjs',
 'scripts/build-alg-l06-p017-canvas-v1.mjs',
 'scripts/build-alg-l06-p017-text-state-v1.mjs',
 'scripts/build-alg-l06-p017-audio-plan-v1.mjs',
 'scripts/generate-alg-l06-p017-candidate-player-v1.mjs',
 'scripts/build-g4-l3-machine-source-audits.mjs',
 'scripts/build-safe-ffdec-canvas-adapter.mjs',
 'scripts/lib/swf-text-source-catalog.mjs',
 'scripts/lib/swf-domain-audio-v1.mjs',
 'scripts/lib/g678-source-clip-masks-v1.mjs',
 'packages/demos/src/decoded-source-stream-transport.ts',
 'packages/demos/src/source-static-canvas-candidate.tsx',
 'packages/demos/src/alg-l06-p004-glossary-content-v1.ts',
 'packages/demos/src/alg-l06-p004-glossary-content.generated.ts',
]);
const REQUIRED_HOST=Object.freeze([
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/candidate-v1/page.tsx`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/[resource]/route.ts`,
 'apps/web/components/g678-alg-l06-p017-candidate-player-v1.generated.tsx',
 'apps/web/components/g678-alg-l06-p017-host-lesson-v1.tsx',
 'apps/web/components/g678-alg-l06-p017-runtime-v1.tsx',
 'apps/web/lib/alg-l06-p017-candidate-v1.server.ts',
 'apps/web/lib/alg-l06-p017-local-request-v1.ts',
 'apps/web/lib/alg-l06-p017-local-request.production-stub.ts',
 'apps/web/lib/alg-l06-p017-resources-v1.server.ts',
]);
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
function writeExact(relative,bytes){
 const absolute=path.join(ROOT,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 try{fs.writeFileSync(absolute,bytes,{flag:'wx'});}catch(error){
  if(error?.code!=='EEXIST')throw error;
  assert.deepEqual(readPin(ROOT,pinBytes(relative,bytes)),bytes,`immutable output: ${relative}`);
 }
 return pinFile(ROOT,relative);
}
function normalizeExternal(items){
 const byPath=new Map();
 for(const item of items){
  assert(item&&typeof item.root==='string'&&item.pin&&
   typeof item.pin.path==='string'&&!path.isAbsolute(item.pin.path),'bounded external pin');
  const absolute=path.join(item.root,item.pin.path),prior=byPath.get(absolute);
  if(prior)assert.deepEqual(prior,item,`conflicting external source: ${absolute}`);
  else byPath.set(absolute,item);
 }
 return [...byPath.values()].sort((a,b)=>
  path.join(a.root,a.pin.path).localeCompare(path.join(b.root,b.pin.path)));
}

/** Historical candidate-host evidence; it cannot assert formal-host acceptance. */
export function validateEngineeringReceipt(receipt){
 assert.equal(receipt.kind,'g678-p017-es-mobile-engineering-v1');
 assert.equal(receipt.animationId,S.ID);
 assert.deepEqual([receipt.formalRegistered,receipt.denominator,receipt.p017Registered],
  [504,2282,false]);
 assert(/^catalog\/g678-admission-v1\/index-v\d+\.json$/u.test(receipt.indexPin?.path),
  'browser-tested versioned candidate index');
 assert(/^catalog\/g678-admission-v1\/host-v\d+\.json$/u.test(receipt.hostPin?.path),
  'browser-tested versioned candidate host');
 const browserIndex=readJsonPin(ROOT,receipt.indexPin),browserHost=readJsonPin(ROOT,receipt.hostPin);
 assert.equal(browserIndex.kind,'g678-admission-index-v1');
 assert.deepEqual(browserIndex.host,receipt.hostPin,'browser index binds exact historical host');
 assert.equal(browserIndex.pages.length,14,'fourteen pages before P017 registration');
 assert(!browserIndex.pages.some(page=>page.animationId===S.ID),
  'browser receipt predates P017 registration');
 assert.equal(browserHost.kind,'g678-admission-host-v1');
 assert.equal(browserHost.contract,'source-native-current-js-v1');
 const browserHostPaths=new Set(browserHost.files.map(pin=>pin.path));
 for(const required of REQUIRED_HOST)assert(browserHostPaths.has(required),
  `P017 browser candidate host input missing: ${required}`);
 for(const key of ['oneContinuousMainContext','mainStoppedBeforeSA',
  'saEOFRequiresExplicitReturn','navigationClosedMainAndSA',
  'sixKeyboardGlossaryCloseFocus','esReducedMotionNoAutoplay','naturalMainEOF721'])
  assert.equal(receipt.checks?.[key],true,`real P017 browser check: ${key}`);
 assert.deepEqual(receipt.acceptance,{originalRuntime:false,listening:false,human:false,
  owner:false,strictCompletion:false,published:false},'independent acceptance gates');
 assert(Array.isArray(receipt.remainingGap),'explicit remaining gaps field');
 assert(Array.isArray(receipt.artifacts)&&receipt.artifacts.length>0,
  'raw browser evidence pins required');
 const pins=uniquePins(receipt.artifacts);
 assert.equal(pins.length,receipt.artifacts.length,'unique browser evidence paths');
 for(const pin of pins){
  assert((pin.path.startsWith('output/alg-l06-p017-host-lifecycle-v2/')&&
   pin.path!==ENGINEERING_RECEIPT_PATH)||
   ['output/alg-l06-p017-host-observer-v1/install.js',
    'output/alg-l06-p017-host-observer-v1/collect.js'].includes(pin.path),
   'bounded raw browser evidence');
  readPin(ROOT,pin);
 }
 return pins;
}

/** Planning is read-only; only --prepare may create the three exact candidate files. */
export function buildPlan({previousIndexPin,engineeringReceiptPin}={}){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'real source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local development preparation only');
 assert(previousIndexPin&&typeof previousIndexPin.path==='string',
  'exact reviewed previous index pin required');
 const activation='apps/web/lib/g678-admission-activation.ts';
 const activeSource=readPin(ROOT,pinFile(ROOT,activation)).toString();
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=activeSource.indexOf(marker),end=activeSource.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin&&activeSource.indexOf(marker,begin+1)<0,
  'one current activation pin');
 assert.deepEqual(JSON.parse(activeSource.slice(begin+marker.length,end)),previousIndexPin,
  'exact active predecessor index pin');
 assert.deepEqual(pinFile(ROOT,previousIndexPin.path),previousIndexPin,'exact previous index bytes');
 const index=readJsonPin(ROOT,previousIndexPin);
 assert.equal(index.kind,'g678-admission-index-v1');
 assert.equal(index.pages.length,14,'fourteen immutable prior proofs');
 assert(index.pages.some(page=>page.animationId==='shared-alg001-l06-p016'),
  'P016 predecessor is an indexed proof');
 assert(!index.pages.some(page=>page.animationId===S.ID),'P017 is not an earlier proof');
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert.equal(transaction.registry.calibrations.some(c=>c.calibrationId===S.CALIBRATION),false,
  'P017 calibration remains unregistered before preparation');
 assert.equal(transaction.registry.calibrations.some(c=>c.entries.some(e=>e.key===S.ID)),false,
  'P017 entry remains unregistered before preparation');
 assert(transaction.registry.calibrations.some(c=>c.entries.some(e=>e.key==='shared-alg001-l06-p016')),
  'registered P016 predecessor retained');
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 for(const required of REQUIRED_HOST)assert(hostPaths.has(required),
  `P017 reviewed host input missing: ${required}`);
 let browserPins=[],browserReceiptHostPin=null;
 if(engineeringReceiptPin){
  assert.equal(engineeringReceiptPin.path,ENGINEERING_RECEIPT_PATH,'exact P017 receipt path');
  const receipt=readJsonPin(ROOT,engineeringReceiptPin);
  browserPins=validateEngineeringReceipt(receipt);
  assert.deepEqual(receipt.indexPin,previousIndexPin,
   'current predecessor index requires current P017 browser receipt');
  assert.deepEqual(receipt.hostPin,index.host,
   'current candidate host requires current P017 browser receipt');
  browserReceiptHostPin=receipt.hostPin;
 }
 const source=S.readP017CanonicalSource(ROOT),artifacts=S.proposedP017Artifacts(ROOT);
 if(fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime)))
  assert.deepEqual(S.readP017Artifacts(ROOT),artifacts,'exact materialized member');
 const supportPins=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const forbidden=new Set(['packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/g678-admission-activation.ts',S.PROOF_PATH,S.FREEZE_PATH,FRAGMENT_PATH,
  previousIndexPin.path,index.host.path]);
 const integrity=uniquePins([...source.localInputs,...Object.values(artifacts),
  ...supportPins,...(engineeringReceiptPin?[engineeringReceiptPin,...browserPins]:[])]);
 assert(!integrity.some(pin=>forbidden.has(pin.path)),'no cyclic or registration input');
 for(const pin of integrity){
  if(pin.path===S.ARTIFACT_PATHS.runtime&&!fs.existsSync(path.join(ROOT,pin.path)))continue;
  readPin(ROOT,pin);
 }
 const external=normalizeExternal(source.external);
 for(const pin of [S.SOURCE,S.XML,S.SA])assert(external.some(item=>
  item.root===S.SOURCE_ROOT&&JSON.stringify(item.pin)===JSON.stringify(pin)),
  `canonical physical source retained: ${pin.path}`);
 for(const item of external)readPin(item.root,item.pin);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:17,sourceOccurrence:17,sectionCode:'VB',sectionPageOrdinal:7,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p017Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:S.CONTINUOUS,optionalSpanishAudio:S.OPTIONAL_SPANISH,
  glossaryActions:S.GLOSSARY,
  integrity:{scope:'P017-six-source-glossary-721-continuous-canvas-SA-native-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Source clicks, original runtime, negative seek, listening, human review and visual fidelity remain independent.',
   files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeBytes=json(packet),freeze=pinBytes(S.FREEZE_PATH,freezeBytes),bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP017AdmissionSemantics(bound,registration,ROOT),true);
 const projected={...transaction,registry:{...transaction.registry,
  calibrations:[...transaction.registry.calibrations,registration]}};
 const legacyInputs=uniquePins([...integrity,...Object.values(artifacts),freeze,...supportPins]);
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external};
 const proofBytes=json(proof),proofPin=pinBytes(S.PROOF_PATH,proofBytes);
 const outputs=new Map([[S.FREEZE_PATH,freezeBytes],[FRAGMENT_PATH,json(registration)],
  [S.PROOF_PATH,proofBytes]]);
 return {outputs,host,hostPin:index.host,index,proof,proofPin,bound,registration,
  external,supportPins,transaction,projected,previousIndexPin,engineeringReceiptPin,
  browserReceiptHostPin};
}

export function operate(mode,options={}){
 assert(['--plan','--prepare','--check'].includes(mode),'--plan | --prepare | --check');
 if(mode!=='--plan')assert(options.engineeringReceiptPin,
  'exact real P017 browser engineering receipt required before candidate preparation');
 const plan=buildPlan(options);
 if(mode!=='--plan')assert.deepEqual(S.readP017Artifacts(ROOT),
  plan.bound.entry.artifacts,'physical Canvas member required for admission');
 for(const [relative,bytes] of plan.outputs){
  const absolute=path.join(ROOT,relative);
  if(fs.existsSync(absolute))assert.deepEqual(readPin(ROOT,pinBytes(relative,bytes)),bytes,
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
    validateSemantics:(packet,registration)=>S.validateP017AdmissionSemantics(packet,registration,ROOT)});
   assert.deepEqual(result.proof,plan.proofPin,'common helper emitted exact planned proof');
  }
 }
 if(mode!=='--plan'){
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,plan.projected);
  S.validateP017AdmissionSemantics(packet,plan.registration,ROOT);
  assert.deepEqual([...buildPlan(options).outputs],[...plan.outputs],
   'stable preparation inputs after common-reader roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  outputs:[...plan.outputs].map(([relative,bytes])=>pinBytes(relative,bytes)),
  previousProofsUnchanged:plan.index.pages.map(page=>page.proof),
  runtimeMemberMaterialized:fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime)),
  engineeringReceiptBound:!!plan.engineeringReceiptPin,
  browserReceiptHostIsCurrent:plan.browserReceiptHostPin
   ?JSON.stringify(plan.browserReceiptHostPin)===JSON.stringify(plan.hostPin):null,
  browserReceiptIsCandidateEngineeringOnly:!!plan.engineeringReceiptPin,
  outputsProvisional:mode==='--plan'&&(!plan.engineeringReceiptPin||
   !fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime))),
  missingPrerequisites:mode==='--plan'?[...(!plan.engineeringReceiptPin?[ENGINEERING_RECEIPT_PATH]:[]),
   ...(!fs.existsSync(path.join(ROOT,S.ARTIFACT_PATHS.runtime))?[S.ARTIFACT_PATHS.runtime]:[])]:[],
  pageFiles:plan.proof.files.length,external:plan.external.length,
  registrationChanged:false,activationChanged:false,acceptanceEffects:S.ACCEPTANCE};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert([6,9].includes(process.argv.length),
  'mode plus exact previous-index pin and optional engineering-receipt pin');
 const [, , mode,indexPath,indexBytes,indexSha256,receiptPath,receiptBytes,receiptSha256]=process.argv;
 assert(/^catalog\/g678-admission-v1\/index-v\d+\.json$/u.test(indexPath),
  'versioned previous-index path');
 assert(/^\d+$/u.test(indexBytes)&&/^[a-f0-9]{64}$/u.test(indexSha256),
  'exact previous-index size and sha256');
 if(receiptPath!==undefined){
  assert.equal(receiptPath,ENGINEERING_RECEIPT_PATH,'exact P017 receipt path');
  assert(/^\d+$/u.test(receiptBytes)&&/^[a-f0-9]{64}$/u.test(receiptSha256),
   'exact receipt size and sha256');
 }
 console.log(JSON.stringify(operate(mode,{previousIndexPin:{path:indexPath,
  bytes:Number(indexBytes),sha256:indexSha256},
  ...(receiptPath?{engineeringReceiptPin:{path:receiptPath,
   bytes:Number(receiptBytes),sha256:receiptSha256}}:{})}),null,2));
}
