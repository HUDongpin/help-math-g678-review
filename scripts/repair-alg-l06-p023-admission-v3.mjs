#!/usr/bin/env node
/** P023 admission repair: prepare a new proof without changing the live registry/index. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import * as S from '../lib/alg-l06-p023-admission-semantics-v3.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const INDEX_PIN=Object.freeze({path:'catalog/g678-admission-v1/index-v80.json',
 bytes:6089,sha256:'ab6cca6adb1d3cb907b8b278d6fb92a36a81abfcd91ecd7b2c50b697a39d058c'});
export const OLD_PROOF_PIN=Object.freeze({path:'work/g678-workflow/candidates/shared-alg001-l06-p023-proof-v2.json',
 bytes:75886,sha256:'6bf8aa1a2c541047346381490baee2908dabb2d24eb6fc03269263e01b78a082'});
export const OLD_CALIBRATION='g678-alg-l06-p023-current-js-20260930-v2';
export const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v3.json`;
const SNAPSHOT_PREFIX='output/alg-l06-p023-admission-repair-v3/before/';
const REPLACED=Object.freeze([
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p023/candidate-v1/page.tsx',
 'apps/web/lib/alg-l06-p023-formal-admission-v1.server.ts']);
const NEW_SUPPORT=Object.freeze([
 'lib/alg-l06-p023-admission-semantics-v3.mjs',
 'scripts/repair-alg-l06-p023-admission-v3.mjs',...REPLACED]);
const serial=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,data)=>({path:relative,bytes:data.length,sha256:sha256(data)});

function activePin(){
 const source=readPin(ROOT,pinFile(ROOT,'apps/web/lib/g678-admission-activation.ts')).toString();
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=source.indexOf(marker),end=source.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin&&source.indexOf(marker,begin+1)<0,'one active index');
 return JSON.parse(source.slice(begin+marker.length,end));
}
function countLocal(registry){return registry.calibrations.filter(row=>row.deploymentScope==='local-only')
 .reduce((count,row)=>count+row.entries.length,0);}
function writeExact(relative,data){
 const absolute=path.join(ROOT,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});
 try{fs.writeFileSync(absolute,data,{flag:'wx'});}catch(error){
  if(error?.code!=='EEXIST')throw error;
  assert.deepEqual(readPin(ROOT,pinBytes(relative,data)),data,`immutable output: ${relative}`);
 }
 return pinFile(ROOT,relative);
}

export function buildPlan(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'physical source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local preparation only');
 assert.deepEqual(activePin(),INDEX_PIN,'exact active index-v80');
 assert.deepEqual(pinFile(ROOT,INDEX_PIN.path),INDEX_PIN,'physical index-v80');
 assert.deepEqual(pinFile(ROOT,OLD_PROOF_PIN.path),OLD_PROOF_PIN,'historical P023 proof');
 const index=readJsonPin(ROOT,INDEX_PIN),host=verifyHostVersion(ROOT,index.host),
  transaction=readRegistryTransaction(ROOT),oldProof=readJsonPin(ROOT,OLD_PROOF_PIN);
 assert.equal(index.kind,'g678-admission-index-v1');
 assert.equal(index.pages.length,21);
 assert.equal(index.pages.filter(page=>page.animationId===S.ID).length,1);
 assert.deepEqual(index.pages.find(page=>page.animationId===S.ID).proof,OLD_PROOF_PIN);
 assert.equal(host.contract,'source-native-current-js-v1');
 assert.equal(oldProof.animationId,S.ID);
 assert.equal(oldProof.packet.calibrationId,OLD_CALIBRATION);
 assert.equal(oldProof.registration.calibrationId,OLD_CALIBRATION);
 assert.equal(transaction.registry.calibrations.length,134,'133 predecessors and one P023');
 assert.equal(countLocal(transaction.registry),511,'exact registered count');
 const own=transaction.registry.calibrations.filter(row=>row.calibrationId===OLD_CALIBRATION);
 assert.equal(own.length,1,'one old P023 calibration');
 assert.deepEqual(own[0],oldProof.registration,'exact old own registration');
 assert.deepEqual(own[0].entries,[oldProof.packet.entry]);
 assert(!transaction.registry.calibrations.some(row=>row.calibrationId===S.CALIBRATION));
 for(const page of index.pages.filter(page=>page.animationId!==S.ID))
  readPageProof(ROOT,page.proof,host,transaction);

 const oldFreeze=oldProof.packet.freezeManifest;
 assert.equal(oldFreeze.path,`catalog/product-bridge-calibrations/${OLD_CALIBRATION}.json`);
 const {freezeManifest:ignored,...oldPacket}=oldProof.packet;
 assert.deepEqual(readJsonPin(ROOT,oldFreeze),oldPacket,'unchanged old frozen packet');
 const oldEvidence=new Map(oldProof.packet.integrity.files.map(pin=>[pin.path,pin]));
 const snapshots=REPLACED.map(relative=>{
  const original=oldEvidence.get(relative),snapshot=pinFile(ROOT,SNAPSHOT_PREFIX+relative);
  assert(original,`old P023 proof binds ${relative}`);
  assert.deepEqual([snapshot.bytes,snapshot.sha256],[original.bytes,original.sha256],
   `old code bytes preserved in snapshot: ${relative}`);
  assert.notDeepEqual(pinFile(ROOT,relative),original,`actual repaired code differs: ${relative}`);
  return snapshot;
 });
 for(const pin of oldProof.legacyInputs){
  if(REPLACED.includes(pin.path))assert.deepEqual(pin,oldEvidence.get(pin.path));
  else readPin(ROOT,pin);
 }
 for(const external of oldProof.external)readPin(external.root,external.pin);

 const source=S.readP023CanonicalSource(ROOT),support=NEW_SUPPORT.map(relative=>pinFile(ROOT,relative));
 assert.deepEqual(source.artifacts,oldProof.packet.entry.artifacts,
  'source, native text, audio and Canvas artifacts unchanged');
 assert.deepEqual(source.external,oldProof.external,'external source pins unchanged');
 const replacing=new Set(REPLACED);
 const retained=oldProof.packet.integrity.files.filter(pin=>!replacing.has(pin.path));
 const integrity=uniquePins([...retained,...support,...snapshots,OLD_PROOF_PIN,oldFreeze]);
 const forbidden=new Set([INDEX_PIN.path,index.host.path,S.FREEZE_PATH,S.PROOF_PATH,
  FRAGMENT_PATH,'packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/g678-admission-activation.ts']);
 assert(!integrity.some(pin=>forbidden.has(pin.path)),'no live transaction in evidence');
 for(const pin of integrity)readPin(ROOT,pin);
 const packet={...oldPacket,calibrationId:S.CALIBRATION,
  integrity:{...oldPacket.integrity,files:integrity}};
 const freezeData=serial(packet),freeze=pinBytes(S.FREEZE_PATH,freezeData);
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP023AdmissionSemantics(bound,registration,ROOT),true);
 const transactionBase={...transaction,registry:{...transaction.registry,
  calibrations:transaction.registry.calibrations.filter(row=>row.calibrationId!==OLD_CALIBRATION)}};
 assert.equal(transactionBase.registry.calibrations.length,133);
 assert.equal(countLocal(transactionBase.registry),510);
 const projected={...transactionBase,registry:{...transactionBase.registry,
  calibrations:[...transactionBase.registry.calibrations,registration]}};
 assert.equal(projected.registry.calibrations.length,134);
 assert.equal(countLocal(projected.registry),511);
 assert.deepEqual(projected.registry.calibrations.slice(0,133),
  transaction.registry.calibrations.filter(row=>row.calibrationId!==OLD_CALIBRATION),
  'all predecessor calibrations retained in order');
 const legacyInputs=uniquePins([...integrity,...Object.values(packet.entry.artifacts),freeze,...support]);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external:source.external};
 const outputs=new Map([[S.FREEZE_PATH,freezeData],[FRAGMENT_PATH,serial(registration)],
  [S.PROOF_PATH,serial(proof)]]);
 return {index,host,oldProof,transaction,transactionBase,projected,registration,
  proof,pin:pinBytes(S.PROOF_PATH,outputs.get(S.PROOF_PATH)),outputs,support,snapshots};
}

export function operate(mode){
 assert(['--plan','--prepare','--check'].includes(mode),'use --plan, --prepare or --check');
 const plan=buildPlan();
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
    animationId:S.ID,packet:plan.proof.packet,registration:plan.registration,
    implementationFiles:plan.support,external:plan.proof.external,
    hostPin:plan.index.host,transaction:plan.transactionBase,
    validateSemantics:(packet,registration)=>
     S.validateP023AdmissionSemantics(packet,registration,ROOT)});
   assert.deepEqual(result.proof,plan.pin,'common helper exact planned proof');
  }
 }
 if(mode==='--check'||mode==='--prepare'){
  const packet=readPageProof(ROOT,plan.pin,plan.host,plan.projected);
  S.validateP023AdmissionSemantics(packet,plan.registration,ROOT);
  assert.deepEqual([...buildPlan().outputs],[...plan.outputs],
   'stable physical inputs after reader roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':'candidate-roundtrip-passed-not-registered',
  index:INDEX_PIN,oldProof:OLD_PROOF_PIN,oldCalibration:OLD_CALIBRATION,
  outputs:[...plan.outputs].map(([relative,data])=>pinBytes(relative,data)),
  predecessorCalibrations:133,localCurrentJsCount:511,
  snapshotPins:plan.snapshots,legacyInputs:plan.proof.legacyInputs.length,
  pageFiles:plan.proof.files.length,external:plan.proof.external.length,
  registryChanged:false,activationChanged:false,acceptanceEffects:S.ACCEPTANCE};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one mode argument');
 console.log(JSON.stringify(operate(process.argv[2]),null,2));
}
