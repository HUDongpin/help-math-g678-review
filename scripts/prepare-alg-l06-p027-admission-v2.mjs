#!/usr/bin/env node
/** P027 final, real-host receipt-gated candidate. No registry or activation writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,readPageProof,readRegistryTransaction,
 sha256,uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate-v2.mjs';
import {preflightRegistration} from './lib/g678-registration-preflight-v1.mjs';
import * as S from '../lib/alg-l06-p027-admission-semantics-v1.mjs';
import * as H from '../lib/alg-l06-p027-host-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const RECEIPT=H.BROWSER_DIR+'engineering-receipt-v1.json';
export const FREEZE=`catalog/product-bridge-calibrations/${H.FINAL_CALIBRATION}.json`;
export const FRAGMENT=`work/g678-workflow/candidates/${S.ID}-registration-v2.json`;
export const PROOF=`work/g678-workflow/candidates/${S.ID}-proof-v2.json`;
export const SUPPORT=[
 'apps/web/lib/alg-l06-p027-candidate-binding-v1.ts',
 'lib/alg-l06-p027-admission-semantics-v1.mjs',
 'lib/alg-l06-p027-admission-semantics-v1.test.mjs',
 'lib/alg-l06-p027-host-semantics-v1.mjs',
 'lib/alg-l06-p027-host-semantics-v1.test.mjs',
 'scripts/prepare-alg-l06-p027-admission-v1.mjs',
 'scripts/prepare-alg-l06-p027-admission-v1.test.mjs',
 'scripts/prepare-alg-l06-p027-admission-v2.mjs',
 'scripts/prepare-alg-l06-p027-admission-v2.test.mjs',
 'scripts/lib/g678-admission-candidate-v2.mjs',
 'scripts/lib/g678-registration-preflight-v1.mjs'];
const serialize=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const core=pin=>({path:pin.path,bytes:pin.bytes,sha256:pin.sha256});

function writeImmutable(file,bytes){
 const absolute=path.join(ROOT,file);
 fs.mkdirSync(path.dirname(absolute),{recursive:true});
 if(fs.existsSync(absolute))assert.deepEqual(fs.readFileSync(absolute),bytes,
  `immutable P027 final artifact: ${file}`);
 else fs.writeFileSync(absolute,bytes,{flag:'wx'});
 return pinFile(ROOT,file);
}

function currentBase(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,
  'physical AWS source root must be explicit');
 const source=S.readP027CanonicalSource(ROOT),
  indexPin=source.binding.predecessorIndex;
 assert.deepEqual(pinFile(ROOT,indexPin.path),indexPin,
  'exact current predecessor index');
 const activation=fs.readFileSync(path.join(ROOT,
  'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const active=JSON.parse(activation.slice(activation.indexOf('=')+1,
  activation.lastIndexOf(' as const;')));
 assert.deepEqual(active,indexPin,'active index remains exact P027 predecessor');
 const index=readJsonPin(ROOT,indexPin),host=verifyHostVersion(ROOT,index.host),
  transaction=readRegistryTransaction(ROOT);
 assert.deepEqual(index.host,source.binding.predecessorHost,
  'exact predecessor host');
 assert.equal(index.pages.length,24,'24 retained admission proofs');
 assert(index.pages.some(page=>page.animationId==='shared-alg001-l06-p026'),
  'P026 admitted before P027');
 assert(!index.pages.some(page=>page.animationId===S.ID),
  'P027 not already admitted');
 assert(!transaction.registry.calibrations.some(calibration=>
  calibration.calibrationId===H.FINAL_CALIBRATION||
  calibration.entries.some(entry=>entry.key===S.ID)),
  'P027 final candidate not already registered');
 for(const previous of index.pages)
  readPageProof(ROOT,previous.proof,host,transaction);
 return {source,index,indexPin,host,transaction};
}

export function validateEngineeringReceipt(receiptPin,base){
 assert(receiptPin,'real P027 engineering receipt required');
 assert.deepEqual(core(receiptPin),core(pinFile(ROOT,RECEIPT)),
  'exact P027 engineering receipt path and bytes');
 return H.validateP027EngineeringReceipt(readJsonPin(ROOT,receiptPin),
  ROOT,base.source);
}

export function proposedFinalPacket(receiptPin){
 const base=currentBase(),engineering=validateEngineeringReceipt(receiptPin,base),
  {source}=base,entry=S.p027Entry(source);
 const supportPins=SUPPORT.map(file=>pinFile(ROOT,file));
 const integrity=uniquePins([source.bindingPin,...source.binding.files,
  ...Object.values(entry.artifacts),receiptPin,
  ...engineering.artifacts,...engineering.candidates,...supportPins]);
 const packet={schemaVersion:1,calibrationId:H.FINAL_CALIBRATION,
  sourceRoot:S.SOURCE_ROOT,scope:'private-engineering',
  deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,
   assetId:`swf-${S.SOURCE.sha256}`,sourceSha256:S.SOURCE.sha256,
   moduleCode:'ALG001',lessonNumber:6,globalPageOrdinal:27,
   sourceOccurrence:27,sectionCode:'VB',sectionPageOrdinal:17,
   complexityLane:'interactive-understood',runtime:S.p027Runtime(entry.artifacts)}],
  entry,...S.p027PacketSource(source),
  engineeringReceipt:receiptPin,browserRaw:engineering.receipt.raw,
  browserStableRuns:engineering.receipt.stableRuns,
  integrity:{scope:'P027-source-770-frames-real-My-Lesson-EN-ES-controls-navigation-and-HTTP',
   completeTransitiveClosure:false,
   qualification:'Current-JS local product evidence only; original-runtime fidelity, source-audio listening, human and Owner decisions remain separate.',
   files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,
  scaleOutAuthorized:false};
 const bytes=serialize(packet),freeze={path:FREEZE,bytes:bytes.length,
  sha256:sha256(bytes)},bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:H.FINAL_CALIBRATION,
  deploymentScope:'local-only',freezeManifest:FREEZE,
  freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,
  entries:[entry]};
 H.validateP027FinalPacket(bound,registration,ROOT,source,receiptPin,engineering);
 for(const pin of supportPins)assert(integrity.some(item=>
  item.path===pin.path&&item.bytes===pin.bytes&&item.sha256===pin.sha256),
  `final producer support in freeze: ${pin.path}`);
 return {...base,engineering,receiptPin,packet,bound,bytes,freeze,
  registration,integrity};
}

export async function preflight(mode='--plan',receiptPin){
 assert(['--plan','--preflight','--check'].includes(mode),'P027 final preflight mode');
 const proposal=proposedFinalPacket(receiptPin);
 if(mode==='--plan')return {status:'final-host-bound-proposal-not-written',
  animationId:S.ID,index:proposal.indexPin,host:proposal.index.host,
  binding:proposal.source.bindingPin,receipt:receiptPin,
  proposedFreeze:proposal.freeze,sourceAndBrowserInputs:proposal.integrity.length,
  registered:false,proofPrepared:false};
 if(mode==='--preflight'){
  writeImmutable(FREEZE,proposal.bytes);
  writeImmutable(FRAGMENT,serialize(proposal.registration));
 }
 assert.deepEqual(readPin(ROOT,proposal.freeze),proposal.bytes);
 assert.deepEqual(readJsonPin(ROOT,pinFile(ROOT,FRAGMENT)),
  proposal.registration);
 const writer=await preflightRegistration({root:ROOT,
  fragment:proposal.registration,transaction:proposal.transaction,exact:true});
 assert.deepEqual(writer.registration,proposal.registration,
  'real production writer receives exact final P027 registration');
 return {status:'final-host-bound-real-writer-preflight-passed-not-registered',
  animationId:S.ID,index:proposal.indexPin,host:proposal.index.host,
  binding:proposal.source.bindingPin,receipt:receiptPin,
  freeze:proposal.freeze,fragment:pinFile(ROOT,FRAGMENT),
  writer:writer.status,registered:false,proofPrepared:false,
  activationChanged:false};
}

export async function prepare(receiptPin){
 const proposal=proposedFinalPacket(receiptPin);
 await preflight('--check',receiptPin);
 const implementationFiles=uniquePins([
  ...SUPPORT.map(file=>pinFile(ROOT,file)),receiptPin,
  ...proposal.engineering.artifacts,...proposal.engineering.candidates]);
 if(!fs.existsSync(path.join(ROOT,PROOF))){
  await prepareAdmissionCandidate({root:ROOT,output:PROOF,
   animationId:S.ID,packet:proposal.bound,
   registration:proposal.registration,implementationFiles,
   external:proposal.source.external,hostPin:proposal.index.host,
   transaction:proposal.transaction,
   validateSemantics:(packet,registration)=>
    H.validateP027FinalPacket(packet,registration,ROOT,
     proposal.source,receiptPin,proposal.engineering)});
 }
 const projected={...proposal.transaction,registry:{...proposal.transaction.registry,
  calibrations:[...proposal.transaction.registry.calibrations,
   proposal.registration]}};
 const proofPin=pinFile(ROOT,PROOF),
  packet=readPageProof(ROOT,proofPin,proposal.host,projected),
  proof=readJsonPin(ROOT,proofPin);
 H.validateP027FinalPacket(packet,proposal.registration,ROOT,
  proposal.source,receiptPin,proposal.engineering);
 for(const evidence of [receiptPin,...proposal.engineering.artifacts,
  ...proposal.engineering.candidates]){
  assert(proof.legacyInputs.some(pin=>
   pin.path===evidence.path&&pin.bytes===evidence.bytes&&
   pin.sha256===evidence.sha256),
   `real P027 browser evidence in proof: ${evidence.path}`);
 }
 return {status:'final-candidate-roundtrip-passed-not-registered',
  proof:proofPin,freeze:proposal.freeze,fragment:pinFile(ROOT,FRAGMENT),
  engineeringReceipt:receiptPin,registered:false,activationChanged:false};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [,,mode,receiptPath,receiptBytes,receiptSha256]=process.argv;
 const receipt=receiptPath?{path:receiptPath,bytes:Number(receiptBytes),
  sha256:receiptSha256}:undefined;
 const value=mode==='--prepare'?await prepare(receipt):await preflight(mode,receipt);
 console.log(JSON.stringify(value,null,2));
}
