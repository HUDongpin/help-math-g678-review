#!/usr/bin/env node
/** Prepare one NEW P013 page proof against an exact existing host. Never register. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import * as S from '../lib/alg-l06-p013-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p013-admission-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'lib/alg-l06-p013-admission-semantics-v1.mjs',
 'scripts/audit-alg-l06-p013-source-v1.mjs',
 'scripts/audit-alg-l06-p013-glossary-v1.mjs',
 'scripts/extract-alg-l06-p013-audio-v1.mjs',
 'scripts/export-alg-l06-p013-canvas-v1.mjs',
 'scripts/build-alg-l06-p013-canvas-v1.mjs',
 'scripts/build-alg-l06-p013-text-state-v1.mjs',
 'packages/demos/src/alg-l06-p013-timeline-v1.ts',
 'packages/demos/src/alg-l06-p013-audio-schedule-v1.ts',
 'packages/demos/src/alg-l06-p013-clock-v1.ts',
 'packages/demos/src/alg-l06-p013-audio-owner-v1.ts',
 'packages/demos/src/alg-l06-p013-optional-spanish-audio-v1.ts',
 'packages/demos/src/alg-l06-p013-native-text-v1.tsx',
 'packages/demos/src/alg-l06-p013-player-v1.tsx',
 'packages/demos/src/generated/alg-l06-p013-canvas-v1.ts',
 'packages/demos/src/generated/alg-l06-p013-text-state-v1.ts',
 'packages/demos/src/decoded-source-stream-transport.ts',
 'packages/demos/src/source-static-canvas-candidate.tsx',
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

/** Build a candidate without changing the host, earlier proofs, registry, or index. */
export function buildPlan({previousIndexPin}={}){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'real source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local development preparation only');
 assert(previousIndexPin&&typeof previousIndexPin.path==='string',
  'exact reviewed previous index pin required');
 assert.deepEqual(pinFile(ROOT,previousIndexPin.path),previousIndexPin,'exact previous index bytes');
 const index=readJsonPin(ROOT,previousIndexPin);
 assert.equal(index.kind,'g678-admission-index-v1');
 assert.equal(index.pages.length,10,'ten immutable prior proofs');
 assert(!index.pages.some(page=>page.animationId===S.ID),'P013 is not an earlier proof');
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert.equal(transaction.registry.calibrations.some(c=>c.calibrationId===S.CALIBRATION),false,
  'P013 calibration remains unregistered before preparation');
 assert.equal(transaction.registry.calibrations.some(c=>c.entries.some(e=>e.key===S.ID)),false,
  'P013 entry remains unregistered before preparation');
 assert(transaction.registry.calibrations.some(c=>c.entries.some(e=>e.key==='shared-alg001-l06-p010')),
  'registered P010 predecessor retained');
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const source=S.readP013CanonicalSource(ROOT),artifacts=S.readP013Artifacts(ROOT);
 const supportPins=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const forbidden=new Set(['packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/g678-admission-activation.ts',S.PROOF_PATH,S.FREEZE_PATH,FRAGMENT_PATH,
  previousIndexPin.path,index.host.path]);
 const integrity=uniquePins([...source.localInputs,...Object.values(artifacts),...supportPins]);
 assert(!integrity.some(pin=>forbidden.has(pin.path)),'no cyclic or registration input');
 for(const pin of integrity)readPin(ROOT,pin);
 const external=normalizeExternal(source.external);
 for(const pin of [S.SOURCE,S.XML,S.SA])assert(external.some(item=>
  item.root===S.SOURCE_ROOT&&JSON.stringify(item.pin)===JSON.stringify(pin)),
  `canonical physical source retained: ${pin.path}`);
 for(const item of external)readPin(item.root,item.pin);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:13,sourceOccurrence:13,sectionCode:'VB',sectionPageOrdinal:3,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p013Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:S.CONTINUOUS,optionalSpanishAudio:S.OPTIONAL_SPANISH,
  glossaryActions:S.GLOSSARY,
  integrity:{scope:'P013-source-canvas-decoded-main-native-text-input-output-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Original runtime, source packet synchronization, listening, human review and visual fidelity remain independent.',
   files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeBytes=json(packet),freeze=pinBytes(S.FREEZE_PATH,freezeBytes),bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP013AdmissionSemantics(bound,registration),true);
 const projected={...transaction,registry:{...transaction.registry,
  calibrations:[...transaction.registry.calibrations,registration]}};
 const legacyInputs=uniquePins([...integrity,...Object.values(artifacts),freeze,...supportPins]);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external};
 const proofBytes=json(proof),proofPin=pinBytes(S.PROOF_PATH,proofBytes);
 const outputs=new Map([[S.FREEZE_PATH,freezeBytes],[FRAGMENT_PATH,json(registration)],
  [S.PROOF_PATH,proofBytes]]);
 return {outputs,host,hostPin:index.host,index,proof,proofPin,bound,registration,
  external,supportPins,transaction,projected,previousIndexPin};
}

export function operate(mode,options={}){
 assert(['--plan','--prepare','--check'].includes(mode),'--plan | --prepare | --check');
 const plan=buildPlan(options);
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
    validateSemantics:S.validateP013AdmissionSemantics});
   assert.deepEqual(result.proof,plan.proofPin,'common helper emitted exact planned proof');
  }
 }
 if(mode!=='--plan'){
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,plan.projected);
  S.validateP013AdmissionSemantics(packet,plan.registration);
  assert.deepEqual([...buildPlan(options).outputs],[...plan.outputs],
   'stable preparation inputs after common-reader roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  outputs:[...plan.outputs].map(([relative,bytes])=>pinBytes(relative,bytes)),
  previousProofsUnchanged:plan.index.pages.map(page=>page.proof),
  pageFiles:plan.proof.files.length,external:plan.external.length,
  registrationChanged:false,activationChanged:false,acceptanceEffects:S.ACCEPTANCE};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,6,'mode plus exact previous-index path, bytes, sha256');
 const [, , mode,indexPath,indexBytes,indexSha256]=process.argv;
 assert(/^catalog\/g678-admission-v1\/index-v\d+\.json$/u.test(indexPath),
  'versioned previous-index path');
 assert(/^\d+$/u.test(indexBytes)&&/^[a-f0-9]{64}$/u.test(indexSha256),
  'exact previous-index size and sha256');
 console.log(JSON.stringify(operate(mode,{previousIndexPin:{path:indexPath,
  bytes:Number(indexBytes),sha256:indexSha256}}),null,2));
}
