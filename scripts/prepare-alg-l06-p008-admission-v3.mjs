#!/usr/bin/env node
/** Player-only successor to P008 v2; source/Canvas/adapter and active host stay pinned. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import * as V1 from '../lib/alg-l06-p008-admission-semantics-v1.mjs';
import * as V3 from '../lib/alg-l06-p008-admission-semantics-v3.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const INDEX={path:'catalog/g678-admission-v1/index-v29.json',bytes:2448,
 sha256:'c9b8734edfbde77fca54941a579f098c16fcc191b4e3c8960dc1e573cc6121c9'};
const HOST={path:'catalog/g678-admission-v1/host-v29.json',bytes:84161,
 sha256:'6192636033cde2efc159f50eb9bdf109b09b0b73041de3e7321bf7c0ec0d8663'};
const SUPPORT=[
 'lib/alg-l06-p008-admission-semantics-v3.mjs',
 'lib/alg-l06-p008-admission-semantics-v3.test.mjs',
 'scripts/prepare-alg-l06-p008-admission-v3.mjs',
];
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
function writeExact(relative,bytes){
 const absolute=path.join(ROOT,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 try{fs.writeFileSync(absolute,bytes,{flag:'wx'});}
 catch(error){if(error?.code!=='EEXIST')throw error;
  assert.deepEqual(readPin(ROOT,pinBytes(relative,bytes)),bytes,`immutable successor: ${relative}`);}
 return pinFile(ROOT,relative);
}

export function buildPlan(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,V1.SOURCE_ROOT,'real AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local candidate preparation only');
 assert.deepEqual(pinFile(ROOT,INDEX.path),INDEX);
 const index=readJsonPin(ROOT,INDEX),host=verifyHostVersion(ROOT,HOST);
 assert.deepEqual(index.host,HOST);assert.equal(index.pages.length,8);
 assert(!index.pages.some(page=>page.animationId===V1.ID),'P008 not active');
 const transaction=readRegistryTransaction(ROOT);
 assert(!transaction.registry.calibrations.some(row=>row.entries.some(entry=>entry.key===V1.ID)),
  'P008 not registered');
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 V1.readP008CanonicalSource(ROOT);
 for(const pin of [V3.PREVIOUS_PROOF,V3.PREVIOUS_FREEZE,V3.PREVIOUS_PLAYER,
  V3.CURRENT_PLAYER])readPin(ROOT,pin);
 const historical=readJsonPin(ROOT,V3.PREVIOUS_PROOF);
 assert.equal(historical.kind,'g678-page-proof-v1');assert.equal(historical.animationId,V1.ID);
 assert.deepEqual(historical.packet.freezeManifest,V3.PREVIOUS_FREEZE);
 const {freezeManifest:oldFreeze,...oldFrozen}=historical.packet;
 assert.deepEqual(readJsonPin(ROOT,V3.PREVIOUS_FREEZE),oldFrozen,
  'v2 proof and freeze preserved');
 assert.deepEqual(historical.packet.integrity.files.find(pin=>pin.path===V3.CURRENT_PLAYER.path),
  {...V3.PREVIOUS_PLAYER,path:V3.CURRENT_PLAYER.path},
  'only the player changed relative to v2');
 assert.equal(historical.hostContract,host.contract);
 const support=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const integrity=uniquePins([...historical.packet.integrity.files.filter(pin=>
  pin.path!==V3.CURRENT_PLAYER.path),V3.CURRENT_PLAYER,V3.PREVIOUS_PROOF,
  V3.PREVIOUS_FREEZE,V3.PREVIOUS_PLAYER,...support]);
 for(const pin of integrity)readPin(ROOT,pin);
 const packet={...historical.packet,calibrationId:V3.CALIBRATION,
  integrity:{...historical.packet.integrity,
   scope:'P008-v3-source-identical-native-companion-SA-controls',files:integrity},
  previousCandidateV2:{proof:V3.PREVIOUS_PROOF,freeze:V3.PREVIOUS_FREEZE,
   player:V3.PREVIOUS_PLAYER}};
 delete packet.freezeManifest;
 const freezeBytes=json(packet),freeze=pinBytes(V3.FREEZE_PATH,freezeBytes);
 const bound={...packet,freezeManifest:freeze};
 const registration={...historical.registration,calibrationId:V3.CALIBRATION,
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256};
 assert.equal(V3.validateP008AdmissionSemanticsV3(bound,registration),true);
 const external=historical.external;
 for(const item of external)readPin(item.root,item.pin);
 const legacyInputs=uniquePins([...integrity,...Object.values(bound.entry.artifacts),freeze]);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:V1.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external};
 const proofBytes=json(proof),proofPin=pinBytes(V3.PROOF_PATH,proofBytes);
 return {index,host,transaction,bound,registration,external,support,
  freezeBytes,freeze,proofBytes,proofPin,proof};
}

export function operate(mode){
 assert(['--plan','--prepare','--check'].includes(mode),'--plan | --prepare | --check');
 const plan=buildPlan();
 if(mode==='--prepare'){
  writeExact(V3.FREEZE_PATH,plan.freezeBytes);
  if(!fs.existsSync(path.join(ROOT,V3.PROOF_PATH))){
   const result=prepareAdmissionCandidate({root:ROOT,output:V3.PROOF_PATH,
    animationId:V1.ID,packet:plan.bound,registration:plan.registration,
    implementationFiles:plan.support,external:plan.external,hostPin:HOST,
    transaction:plan.transaction,validateSemantics:V3.validateP008AdmissionSemanticsV3});
   assert.deepEqual(result.proof,plan.proofPin,'common producer wrote v3 planned proof');
  }
 }
 if(mode!=='--plan'){
  for(const [relative,bytes] of [[V3.FREEZE_PATH,plan.freezeBytes],[V3.PROOF_PATH,plan.proofBytes]])
   assert.deepEqual(readPin(ROOT,pinBytes(relative,bytes)),bytes,`immutable readback: ${relative}`);
  const projected={...plan.transaction,registry:{...plan.transaction.registry,
   calibrations:[...plan.transaction.registry.calibrations,plan.registration]}};
  const packet=readPageProof(ROOT,plan.proofPin,plan.host,projected);
  assert.equal(V3.validateP008AdmissionSemanticsV3(packet,plan.registration),true);
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  proof:plan.proofPin,freeze:plan.freeze,host:HOST,
  previousCandidateV2:{proof:V3.PREVIOUS_PROOF,freeze:V3.PREVIOUS_FREEZE,
   archivedPlayer:V3.PREVIOUS_PLAYER},
  previousActiveProofsUnchanged:plan.index.pages.map(page=>page.proof),
  pageFiles:plan.proof.files.length,external:plan.external.length,
  registrationChanged:false,activationChanged:false,acceptanceEffects:V1.ACCEPTANCE};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one CLI mode');
 console.log(JSON.stringify(operate(process.argv[2]),null,2));
}
