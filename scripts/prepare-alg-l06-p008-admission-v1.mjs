#!/usr/bin/env node
/** One P008 producer/reader roundtrip on active host-v27; no registration or activation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import * as S from '../lib/alg-l06-p008-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const ACTIVE_INDEX={path:'catalog/g678-admission-v1/index-v27.json',bytes:2448,
 sha256:'25cf102c933832a4fcf096a2149417fa3c20df044c74ea0df7cc2b9c2daeb563'};
const HOST={path:'catalog/g678-admission-v1/host-v27.json',bytes:82547,
 sha256:'a573f94225df6b814fc5acba1c1c238b25c59144d873faf1172f97a3e13fe6e3'};
const SUPPORT=Object.freeze([
 'lib/alg-l06-p008-admission-semantics-v1.mjs',
 'scripts/prepare-alg-l06-p008-admission-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'packages/demos/src/alg-l06-p008-audio-schedule-v1.ts',
 'packages/demos/src/alg-l06-p008-clock-v1.ts',
 'packages/demos/src/alg-l06-p008-audio-owner-v1.ts',
 'packages/demos/src/alg-l06-p008-optional-spanish-audio-v1.ts',
 'packages/demos/src/alg-l06-p008-native-text-v1.tsx',
 'packages/demos/src/alg-l06-p008-text-state-v1.generated.ts',
 'packages/demos/src/alg-l06-p008-timeline-v1.ts',
 'packages/demos/src/alg-l06-p008-player-v1.tsx',
 'apps/web/components/g678-alg-l06-p008-runtime-v1.tsx',
 'apps/web/components/g678-alg-l06-p008-host-lesson-v1.tsx',
 'apps/web/lib/alg-l06-p008-candidate-v1.server.ts',
 'apps/web/lib/alg-l06-p008-local-request-v1.ts',
 'apps/web/lib/alg-l06-p008-resources-v1.server.ts',
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/candidate-v1/page.tsx`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/canvas-v1/route.ts`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/continuous-source-v1/route.ts`,
 `apps/web/app/flash-assets/g678-local/${S.ID}/optional-spanish-audio-v1/route.ts`,
]);
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
function writeExact(relative,bytes){
 const absolute=path.join(ROOT,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 try{fs.writeFileSync(absolute,bytes,{flag:'wx'});}
 catch(error){if(error?.code!=='EEXIST')throw error;
  assert.deepEqual(readPin(ROOT,pinBytes(relative,bytes)),bytes,`immutable candidate: ${relative}`);}
 return pinFile(ROOT,relative);
}
function materializeRuntime(){
 const target=path.join(ROOT,S.ARTIFACTS.runtime.path);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 try{fs.copyFileSync(path.join(ROOT,S.CANVAS_SOURCE.path),target,fs.constants.COPYFILE_EXCL);}
 catch(error){if(error?.code!=='EEXIST')throw error;}
 assert.deepEqual(pinFile(ROOT,S.ARTIFACTS.runtime.path),S.ARTIFACTS.runtime,
  'byte-identical optimized runtime member');
}
function normalizeExternal(items){
 const byPath=new Map();
 for(const item of items){
  assert(item&&typeof item.root==='string'&&item.pin&&
   typeof item.pin.path==='string'&&!path.isAbsolute(item.pin.path),'bounded external pin');
  const key=path.join(item.root,item.pin.path),prior=byPath.get(key);
  if(prior)assert.deepEqual(prior,item,`conflicting external ${key}`);else byPath.set(key,item);
 }
 return [...byPath.values()].sort((a,b)=>
  path.join(a.root,a.pin.path).localeCompare(path.join(b.root,b.pin.path)));
}

export function buildPlan(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'real AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local candidate preparation only');
 assert.deepEqual(pinFile(ROOT,ACTIVE_INDEX.path),ACTIVE_INDEX,'exact active index-v26');
 const index=readJsonPin(ROOT,ACTIVE_INDEX),host=verifyHostVersion(ROOT,HOST);
 assert.deepEqual(index.host,HOST,'active eight-proof host-v27');
 assert.equal(index.pages.length,8,'eight immutable predecessor proofs');
 assert(!index.pages.some(page=>page.animationId===S.ID),'P008 absent from active index');
 const transaction=readRegistryTransaction(ROOT);
 assert(!transaction.registry.calibrations.some(row=>row.entries.some(entry=>entry.key===S.ID)),
  'P008 remains unregistered');
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const source=S.readP008CanonicalSource(ROOT);
 const support=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const integrity=uniquePins([...source.localInputs,...Object.values(S.ARTIFACTS),...support]);
 for(const pin of integrity)if(pin.path!==S.ARTIFACTS.runtime.path)readPin(ROOT,pin);
 const external=normalizeExternal(source.external);
 for(const item of external)readPin(item.root,item.pin);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,
   globalPageOrdinal:8,sourceOccurrence:8,sectionCode:'RW',sectionPageOrdinal:7,
   complexityLane:'behavior-heavy',runtime:S.RUNTIME}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:'behavior-heavy',artifacts:S.ARTIFACTS},
  continuousSource:S.CONTINUOUS,optionalSpanishAudio:S.OPTIONAL_SPANISH,
  integrity:{scope:'P008-source-composition-continuous-native-text-optional-SA-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Host-v27 browser evidence and independent original-runtime, listening, fidelity and human review remain separate.',
   files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeBytes=json(packet),freeze=pinBytes(S.FREEZE_PATH,freezeBytes);
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP008AdmissionSemantics(bound,registration),true);
 const legacyInputs=uniquePins([...integrity,...Object.values(S.ARTIFACTS),freeze]);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external};
 const proofBytes=json(proof),proofPin=pinBytes(S.PROOF_PATH,proofBytes);
 return {index,host,transaction,source,support,external,bound,registration,
  freezeBytes,freeze,proofBytes,proofPin,proof};
}

export function operate(mode){
 assert(['--plan','--prepare','--check'].includes(mode),'--plan | --prepare | --check');
 const plan=buildPlan();
 if(mode==='--prepare'){
  materializeRuntime();writeExact(S.FREEZE_PATH,plan.freezeBytes);
  if(!fs.existsSync(path.join(ROOT,S.PROOF_PATH))){
   const result=prepareAdmissionCandidate({root:ROOT,output:S.PROOF_PATH,
    animationId:S.ID,packet:plan.bound,registration:plan.registration,
    implementationFiles:plan.support,external:plan.external,hostPin:HOST,
    transaction:plan.transaction,validateSemantics:S.validateP008AdmissionSemantics});
   assert.deepEqual(result.proof,plan.proofPin,'common producer wrote planned proof');
  }
 }
 if(mode!=='--plan'){
  for(const [relative,bytes] of [[S.FREEZE_PATH,plan.freezeBytes],[S.PROOF_PATH,plan.proofBytes]])
   assert.deepEqual(readPin(ROOT,pinBytes(relative,bytes)),bytes,`immutable readback: ${relative}`);
  assert.deepEqual(pinFile(ROOT,S.ARTIFACTS.runtime.path),S.ARTIFACTS.runtime);
  const projected={...plan.transaction,registry:{...plan.transaction.registry,
   calibrations:[...plan.transaction.registry.calibrations,plan.registration]}};
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,projected);
  assert.equal(S.validateP008AdmissionSemantics(packet,plan.registration),true);
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  proof:plan.proofPin,freeze:plan.freeze,runtime:S.ARTIFACTS.runtime,host:HOST,
  previousProofsUnchanged:plan.index.pages.map(page=>page.proof),
  pageFiles:plan.proof.files.length,external:plan.external.length,
  registrationChanged:false,activationChanged:false,acceptanceEffects:S.ACCEPTANCE};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one CLI mode');
 console.log(JSON.stringify(operate(process.argv[2]),null,2));
}
