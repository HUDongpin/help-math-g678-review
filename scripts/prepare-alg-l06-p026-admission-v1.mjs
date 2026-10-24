#!/usr/bin/env node
/** P026 source-only writer preflight and later receipt-gated proof preparation.
 * This script never mutates the real registry, dispatch, index, or activation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,readPageProof,readRegistryTransaction,
  sha256,uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate-v2.mjs';
import {preflightRegistration} from './lib/g678-registration-preflight-v1.mjs';
import * as S from '../lib/alg-l06-p026-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const FRAGMENT=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const SOURCE_PLAN=`work/g678-workflow/candidates/${S.ID}-source-plan-v1.json`;
export const EXPECTED_RECEIPT='output/playwright/alg-l06-p026-candidate-host-v1/engineering-receipt-v1.json';
const SUPPORT=[
  'scripts/prepare-alg-l06-p026-admission-v1.mjs',
  'scripts/prepare-alg-l06-p026-admission-v1.test.mjs',
  'lib/alg-l06-p026-admission-semantics-v1.mjs',
  'scripts/lib/g678-admission-candidate-v2.mjs',
  'scripts/lib/g678-registration-preflight-v1.mjs',
];
const serialize=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const core=pin=>({path:pin.path,bytes:pin.bytes,sha256:pin.sha256});

function writeImmutable(file,bytes){
  const absolute=path.join(ROOT,file);
  fs.mkdirSync(path.dirname(absolute),{recursive:true});
  if(fs.existsSync(absolute))assert.deepEqual(fs.readFileSync(absolute),bytes,
    `immutable P026 admission artifact: ${file}`);
  else fs.writeFileSync(absolute,bytes,{flag:'wx'});
  return pinFile(ROOT,file);
}
function currentBase(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,
    'physical AWS source root must be explicit');
  const source=S.readP026CanonicalSource(ROOT);
  assert.equal(source.bindingPin.path,S.BINDING_PATH);
  assert.equal(source.bindingPin.sha256,
    'c2476423d2963c5618dca5fe1565291729186e800f56c0a9214dd29bd29f9324',
    'root-reviewed P026 source packet');
  const indexPin=source.binding.predecessorIndex;
  assert.deepEqual(pinFile(ROOT,indexPin.path),indexPin,'exact predecessor index');
  const index=readJsonPin(ROOT,indexPin),host=verifyHostVersion(ROOT,index.host);
  assert.deepEqual(index.host,source.binding.predecessorHost,'exact predecessor host');
  assert(!index.pages.some(page=>page.animationId===S.ID),'P026 is not yet admitted');
  const transaction=readRegistryTransaction(ROOT);
  assert(!transaction.registry.calibrations.some(calibration=>
    calibration.calibrationId===S.CALIBRATION||
    calibration.entries.some(entry=>entry.key===S.ID)),
    'P026 is not registered');
  for(const previous of index.pages)readPageProof(ROOT,previous.proof,host,transaction);
  return {source,index,indexPin,host,transaction};
}
export function proposedSourcePacket(){
  const base=currentBase(),{source}=base;
  const entry=S.p026ProposedEntry(ROOT,source);
  assert.deepEqual(entry.artifacts,source.binding.artifacts,
    'exact staged module, timeline and Canvas runtime');
  // Source freeze does not pin this producer or its eventual receipt reader:
  // those change after the real browser run and belong to proof inputs then.
  const integrity=uniquePins([source.bindingPin,...source.binding.files]);
  const packet={schemaVersion:1,calibrationId:S.CALIBRATION,
    sourceRoot:S.SOURCE_ROOT,scope:'private-engineering',
    deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
    selectedPages:[{animationId:S.ID,placementId:S.ID,
      assetId:`swf-${S.SOURCE.sha256}`,sourceSha256:S.SOURCE.sha256,
      moduleCode:'ALG001',lessonNumber:6,globalPageOrdinal:26,
      sourceOccurrence:26,sectionCode:'VB',sectionPageOrdinal:16,
      complexityLane:'interactive-understood',runtime:S.p026Runtime(entry.artifacts)}],
    entry,continuousSource:S.p026ContinuousSource(source),
    optionalSpanishAudio:S.p026OptionalSpanishAudio(source),
    nativeTextSource:S.p026NativeTextSource(source),
    glossaryActions:S.p026GlossaryActions(source),
    integrity:{scope:'P026-two-independent-main-runs-source-gap-native-text-seven-glossary-actions-and-explicit-SA',
      completeTransitiveClosure:false,
      qualification:'Source and Chrome decode only; My Lesson host, original runtime, listening, visual fidelity and human decisions remain separate.',
      files:integrity},
    acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,
    scaleOutAuthorized:false};
  const bytes=serialize(packet),freeze={path:S.FREEZE_PATH,
    bytes:bytes.length,sha256:sha256(bytes)};
  const bound={...packet,freezeManifest:freeze};
  const registration={calibrationId:S.CALIBRATION,
    deploymentScope:'local-only',freezeManifest:S.FREEZE_PATH,
    freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,
    entries:[entry]};
  S.validateP026SourcePacket(bound,registration,ROOT);
  return {...base,packet,bound,bytes,freeze,registration,integrity};
}

export async function preflight(mode='--preflight'){
  assert(['--plan','--preflight','--check'].includes(mode),'P026 mode');
  const proposal=proposedSourcePacket();
  if(mode==='--plan')return {status:'source-plan-not-written',
    animationId:S.ID,index:proposal.indexPin,host:proposal.index.host,
    binding:proposal.source.bindingPin,sourceInputs:proposal.integrity.length,
    proposedFreeze:proposal.freeze,registered:false};
  if(mode==='--preflight'){
    // These are P026-owned immutable proposal artifacts. The real writer and
    // dispatch validators run in memory after the freeze becomes readable.
    writeImmutable(S.FREEZE_PATH,proposal.bytes);
    writeImmutable(SOURCE_PLAN,proposal.bytes);
    writeImmutable(FRAGMENT,serialize(proposal.registration));
  }
  assert.deepEqual(readPin(ROOT,proposal.freeze),proposal.bytes);
  assert.deepEqual(readPin(ROOT,pinFile(ROOT,SOURCE_PLAN)),proposal.bytes);
  assert.deepEqual(readJsonPin(ROOT,pinFile(ROOT,FRAGMENT)),proposal.registration);
  const checked=await preflightRegistration({root:ROOT,fragment:proposal.registration,
    transaction:proposal.transaction,exact:true});
  assert.deepEqual(checked.registration,proposal.registration,
    'production writer binds exact P026 proposal');
  return {status:'source-only-registration-preflight-passed-not-registered',
    animationId:S.ID,index:proposal.indexPin,host:proposal.index.host,
    binding:proposal.source.bindingPin,freeze:proposal.freeze,
    fragment:pinFile(ROOT,FRAGMENT),sourcePlan:pinFile(ROOT,SOURCE_PLAN),
    sourceInputs:proposal.integrity.length,writer:checked.status,
    registered:false,proofPrepared:false,activationChanged:false};
}

export function validateEngineeringReceipt(pin,proposal){
  assert.deepEqual(core(pin),core(pinFile(ROOT,EXPECTED_RECEIPT)),
    'exact real P026 engineering receipt path and bytes');
  const receipt=readJsonPin(ROOT,pin);
  assert.equal(receipt.kind,'g678-p026-local-my-lesson-engineering-v1');
  assert.equal(receipt.animationId,S.ID);
  assert.equal(receipt.status,'passed');
  assert.deepEqual(receipt.bindingPin,proposal.source.bindingPin);
  assert.deepEqual(receipt.indexPin,proposal.indexPin);
  assert.deepEqual(receipt.hostPin,proposal.index.host);
  assert.deepEqual([receipt.registered,receipt.denominator],[false,2282]);
  assert.deepEqual(receipt.pageErrors,[]);assert.deepEqual(receipt.consoleErrors,[]);
  assert.deepEqual(receipt.acceptanceEffects,S.ACCEPTANCE);
  const caseNames=['nativeMainEn','nativeMainEs','glossary7','replay',
    'explicitSpanish','pausedReturn','navigation','cleanup'];
  for(const name of caseNames)assert.equal(receipt.cases?.[name],true,
    `real P026 My Lesson case ${name}`);
  assert(Array.isArray(receipt.artifacts)&&receipt.artifacts.length>0,
    'real P026 browser artifacts');
  assert.deepEqual(uniquePins(receipt.artifacts),receipt.artifacts,
    'unique P026 browser artifact pins');
  const stable=receipt.stableRun;
  assert(stable&&stable.path?.startsWith('output/playwright/alg-l06-p026-candidate-host-v1/'),
    'stable frozen browser run');
  assert(receipt.artifacts.some(item=>item.path===stable.path&&
    item.bytes===stable.bytes&&item.sha256===stable.sha256),
    'stable run included in receipt artifacts');
  for(const artifact of receipt.artifacts){
    assert(artifact.path.startsWith('output/playwright/alg-l06-p026-candidate-host-v1/'),
      'P026 browser artifact scope');
    readPin(ROOT,artifact);
  }
  return receipt;
}

export async function prepare(receiptPin){
  assert(receiptPin,'real P026 engineering receipt is required');
  const proposal=proposedSourcePacket();
  await preflight('--check');
  validateEngineeringReceipt(receiptPin,proposal);
  const implementationFiles=uniquePins([
    ...SUPPORT.map(file=>pinFile(ROOT,file)),receiptPin]);
  if(!fs.existsSync(path.join(ROOT,S.PROOF_PATH))){
    await prepareAdmissionCandidate({root:ROOT,output:S.PROOF_PATH,
      animationId:S.ID,packet:proposal.bound,
      registration:proposal.registration,implementationFiles,
      external:proposal.source.external,hostPin:proposal.index.host,
      transaction:proposal.transaction,
      validateSemantics:(packet,registration)=>
        S.validateP026Page(packet,registration,ROOT)});
  }
  const projected={...proposal.transaction,registry:{...proposal.transaction.registry,
    calibrations:[...proposal.transaction.registry.calibrations,
      proposal.registration]}};
  const proofPin=pinFile(ROOT,S.PROOF_PATH);
  const packet=readPageProof(ROOT,proofPin,proposal.host,projected);
  S.validateP026Page(packet,proposal.registration,ROOT);
  const proof=readJsonPin(ROOT,proofPin);
  assert(proof.legacyInputs.some(item=>item.path===receiptPin.path&&
    item.bytes===receiptPin.bytes&&item.sha256===receiptPin.sha256),
    'real P026 browser receipt is included in proof inputs');
  return {status:'candidate-roundtrip-passed-not-registered',
    proof:proofPin,freeze:proposal.freeze,fragment:pinFile(ROOT,FRAGMENT),
    engineeringReceipt:receiptPin,registered:false,activationChanged:false};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [,,mode,receiptPath,receiptBytes,receiptSha256]=process.argv;
  const receipt=receiptPath?{path:receiptPath,bytes:Number(receiptBytes),
    sha256:receiptSha256}:undefined;
  const value=mode==='--prepare'?await prepare(receipt):await preflight(mode);
  console.log(JSON.stringify(value,null,2));
}
