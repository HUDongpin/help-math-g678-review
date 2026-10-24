#!/usr/bin/env node
/** P027 source-only writer preflight. A later v2 producer must bind host evidence. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,readPageProof,readRegistryTransaction,
 sha256,uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {preflightRegistration} from './lib/g678-registration-preflight-v1.mjs';
import * as S from '../lib/alg-l06-p027-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FREEZE_PATH=`catalog/product-bridge-calibrations/${S.CALIBRATION}.json`;
export const FRAGMENT=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const SOURCE_PACKET=`work/g678-workflow/candidates/${S.ID}-source-packet-v1.json`;
export const SOURCE_RECEIPT='output/alg-l06-p027-admission-preflight-v1/writer-preflight-v1.json';
const serialize=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');

function writeImmutable(file,bytes){
 const absolute=path.join(ROOT,file);
 fs.mkdirSync(path.dirname(absolute),{recursive:true});
 if(fs.existsSync(absolute))assert.deepEqual(fs.readFileSync(absolute),bytes,
  `immutable P027 source preflight: ${file}`);
 else fs.writeFileSync(absolute,bytes,{flag:'wx'});
 return pinFile(ROOT,file);
}

function currentBase(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,
  'physical AWS source root must be explicit');
 const source=S.readP027CanonicalSource(ROOT),indexPin=source.binding.predecessorIndex;
 assert.deepEqual(pinFile(ROOT,indexPin.path),indexPin,
  'exact currently bound predecessor index');
 const activation=fs.readFileSync(path.join(ROOT,
  'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const active=JSON.parse(activation.slice(activation.indexOf('=')+1,
  activation.lastIndexOf(' as const;')));
 assert.deepEqual(active,indexPin,'source packet binds the active predecessor');
 const index=readJsonPin(ROOT,indexPin),host=verifyHostVersion(ROOT,index.host),
  transaction=readRegistryTransaction(ROOT);
 assert.deepEqual(index.host,source.binding.predecessorHost,
  'exact predecessor host binding');
 assert.equal(index.pages.length,24,'24 retained ALG001 admission proofs');
 assert(index.pages.some(page=>page.animationId==='shared-alg001-l06-p026'),
  'actual P026 predecessor admitted');
 assert(!index.pages.some(page=>page.animationId===S.ID),
  'P027 has not been admitted');
 assert(!transaction.registry.calibrations.some(calibration=>
  calibration.calibrationId===S.CALIBRATION||
  calibration.entries.some(entry=>entry.key===S.ID)),
  'P027 is not already registered');
 for(const previous of index.pages)readPageProof(ROOT,previous.proof,host,transaction);
 return {source,index,indexPin,host,transaction};
}

/** Provisional source proposal; never use this freeze as a final page proof. */
export function proposedSourcePacket(){
 const base=currentBase(),{source}=base,entry=S.p027Entry(source);
 const integrity=uniquePins([source.bindingPin,...source.binding.files,
  ...Object.values(entry.artifacts)]),projection=S.p027PacketSource(source);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,
  sourceRoot:S.SOURCE_ROOT,scope:'private-engineering',
  deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,
   assetId:`swf-${S.SOURCE.sha256}`,sourceSha256:S.SOURCE.sha256,
   moduleCode:'ALG001',lessonNumber:6,globalPageOrdinal:27,
   sourceOccurrence:27,sectionCode:'VB',sectionPageOrdinal:17,
   complexityLane:'interactive-understood',runtime:S.p027Runtime(entry.artifacts)}],
  entry,...projection,
  integrity:{scope:'P027-source-770-frames-three-masks-four-morph-windows-six-glossary-actions-and-independent-SA',
   completeTransitiveClosure:false,
   qualification:'Source and technical Chrome decode only; real My Lesson host, original runtime, listening, fidelity, and human decisions remain separate.',
   files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,
  scaleOutAuthorized:false};
 const bytes=serialize(packet),freeze={path:FREEZE_PATH,bytes:bytes.length,
  sha256:sha256(bytes)};
 const bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,
  deploymentScope:'local-only',freezeManifest:FREEZE_PATH,
  freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,
  entries:[entry]};
 S.validateP027SourcePacket(bound,registration,source);
 return {...base,packet,bound,bytes,freeze,registration,integrity};
}

/** --source is read-only; --preflight writes only source proposal artifacts. */
export async function preflight(mode='--source'){
 assert(['--source','--plan','--preflight','--check'].includes(mode),'P027 preflight mode');
 if(mode==='--source'){
  const source=S.readP027SourceEvidence(ROOT);
  return {status:'source-structure-and-technical-decode-checked-writer-pending',
   animationId:S.ID,source:S.SOURCE,
   evidenceFiles:Object.keys(source.evidencePins).length,
   browserDecode:source.evidencePins.browserDecode,
   registered:false,proofPrepared:false};
 }
 const proposal=proposedSourcePacket();
 if(mode==='--plan')return {status:'source-proposal-not-written',
  animationId:S.ID,index:proposal.indexPin,host:proposal.index.host,
  binding:proposal.source.bindingPin,proposedFreeze:proposal.freeze,
  sourceInputs:proposal.integrity.length,registered:false,proofPrepared:false};
 if(mode==='--preflight'){
  writeImmutable(FREEZE_PATH,proposal.bytes);
  writeImmutable(SOURCE_PACKET,proposal.bytes);
  writeImmutable(FRAGMENT,serialize(proposal.registration));
 }
 assert.deepEqual(readPin(ROOT,proposal.freeze),proposal.bytes);
 assert.deepEqual(readPin(ROOT,pinFile(ROOT,SOURCE_PACKET)),proposal.bytes);
 assert.deepEqual(readJsonPin(ROOT,pinFile(ROOT,FRAGMENT)),proposal.registration);
 const writer=await preflightRegistration({root:ROOT,
  fragment:proposal.registration,transaction:proposal.transaction,exact:true});
 assert.deepEqual(writer.registration,proposal.registration,
  'real production writer binds P027 exact source proposal');
 const result={status:'source-only-real-writer-preflight-passed-not-registered',
  animationId:S.ID,index:proposal.indexPin,host:proposal.index.host,
  binding:proposal.source.bindingPin,freeze:proposal.freeze,
  fragment:pinFile(ROOT,FRAGMENT),sourcePacket:pinFile(ROOT,SOURCE_PACKET),
  writer:writer.status,registered:false,proofPrepared:false,
  activationChanged:false,
  note:'This v1 source-only freeze is not the final host-reviewed admission proof. A separate v2 producer must bind real browser and host receipts.'};
 const receiptBytes=serialize(result);
 if(mode==='--preflight')writeImmutable(SOURCE_RECEIPT,receiptBytes);
 if(mode==='--check')assert.deepEqual(readPin(ROOT,pinFile(ROOT,SOURCE_RECEIPT)),
  receiptBytes,'immutable source-only writer receipt');
 return result;
}

/** Caller supplies independently reviewed real host semantics and output path. */
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2]??'--source';
 const result=await preflight(mode);
 console.log(JSON.stringify(result,null,2));
}
