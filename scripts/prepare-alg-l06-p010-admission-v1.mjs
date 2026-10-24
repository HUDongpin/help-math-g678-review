#!/usr/bin/env node
/** Prepare one NEW P010 page proof on a reviewed host successor. Never register. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPageProof,readPin,readRegistryTransaction,sha256,
 uniquePins,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import * as S from '../lib/alg-l06-p010-admission-semantics-v1.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
/** Replace only after a reviewed host handoff. Callers may pass another exact pin
 * while planning; --prepare still requires an explicit, current host transition. */
export const PREVIOUS_INDEX={path:'catalog/g678-admission-v1/index-v35.json',bytes:2728,
 sha256:'3bc70917ecc61d966937ce441138fae75036b0b7105f541b76937b802f339454'};
const BEFORE='output/alg-l06-p010-admission-v1/before';
const FRAGMENT_PATH=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
const SUPPORT=Object.freeze([
 'scripts/prepare-alg-l06-p010-admission-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'lib/alg-l06-p010-admission-semantics-v1.mjs',
 'scripts/audit-alg-l06-p010-source-v1.mjs',
 'scripts/audit-alg-l06-p010-sa-host-v1.py',
 'scripts/extract-alg-l06-p010-audio-v1.mjs',
 'scripts/build-alg-l06-p010-canvas-v1.mjs',
 'scripts/build-alg-l06-p010-text-state-v1.mjs',
 'packages/demos/src/alg-l06-p010-timeline-v1.ts',
 'packages/demos/src/alg-l06-p010-audio-schedule-v1.ts',
 'packages/demos/src/alg-l06-p010-clock-v1.ts',
 'packages/demos/src/alg-l06-p010-audio-owner-v1.ts',
 'packages/demos/src/alg-l06-p010-optional-spanish-audio-v1.ts',
 'packages/demos/src/alg-l06-p010-native-text-v1.tsx',
 'packages/demos/src/alg-l06-p010-player-v1.tsx',
 'packages/demos/src/alg-l06-p004-glossary-content.generated.ts',
 'packages/demos/src/alg-l06-p004-glossary-content-v1.ts',
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
function nextPaths(indexPin){
 const match=/^catalog\/g678-admission-v1\/index-v(\d+)\.json$/u.exec(indexPin.path);
 assert(match,'versioned previous index path');
 const version=Number(match[1])+1;
 return {host:`catalog/g678-admission-v1/host-v${version}.json`,
  index:`catalog/g678-admission-v1/index-v${version}.json`};
}
function checkedHost(previousIndex,previousHostPin,changedHostPaths,addedHostPaths){
 assert.deepEqual(previousIndex.host,previousHostPin,'previous index names exact host');
 const previous=readJsonPin(ROOT,previousHostPin);
 assert.equal(previous.kind,'g678-admission-host-v1');
 assert.equal(previous.contract,'source-native-current-js-v1');
 assert.deepEqual(uniquePins(previous.files),previous.files,'sorted previous host files');
 assert.equal(previousIndex.pages.length,9,'nine immutable prior proofs');
 const oldPaths=new Set(previous.files.map(pin=>pin.path));
 const pageOwned=new Set(previousIndex.pages.flatMap(page=>
  readJsonPin(ROOT,page.proof).files.map(pin=>pin.path)));
 const changed=uniquePins(changedHostPaths.map(relative=>({path:relative,bytes:0,sha256:'0'.repeat(64)})))
  .map(item=>item.path);
 const added=uniquePins(addedHostPaths.map(relative=>({path:relative,bytes:0,sha256:'0'.repeat(64)})))
  .map(item=>item.path);
 assert(!changed.some(relative=>added.includes(relative)),'changed and added host paths disjoint');
 const changes=[];
 for(const relative of changed){
  const originals=previous.files.filter(pin=>pin.path===relative);
  assert.equal(originals.length,1,`one previous host input: ${relative}`);
  const original=originals[0],current=pinFile(ROOT,relative);
  const snapshot=pinFile(ROOT,`${BEFORE}/${relative}`);
  assert.equal(snapshot.bytes,original.bytes,`preserved original size: ${relative}`);
  assert.equal(snapshot.sha256,original.sha256,`preserved original hash: ${relative}`);
  assert.notEqual(current.sha256,original.sha256,`reviewed host byte delta: ${relative}`);
  assert(!oldPaths.has(snapshot.path)&&!pageOwned.has(snapshot.path),
   `new host-owned predecessor snapshot: ${relative}`);
  changes.push({original,current,snapshot});
 }
 for(const relative of added){
  assert(!oldPaths.has(relative)&&!pageOwned.has(relative),`new host input: ${relative}`);
 }
 const additions=added.map(relative=>pinFile(ROOT,relative));
 const changedSet=new Set(changed);
 for(const pin of previous.files)if(!changedSet.has(pin.path))readPin(ROOT,pin);
 const existing=previous.legacyInputTransitions??[];
 const legacyInputTransitions=existing.map(item=>{
  const change=changes.find(row=>row.original.path===item.original.path);
  if(!change)return item;
  assert.deepEqual(item.current,change.original,`existing transition ends at previous host: ${item.original.path}`);
  readPin(ROOT,item.snapshot);
  return {...item,current:change.current};
 });
 for(const change of changes)if(!existing.some(item=>item.original.path===change.original.path))
  legacyInputTransitions.push(change);
 const successorInputTransitions=[...(previous.successorInputTransitions??[]),...changes];
 const files=uniquePins([...previous.files.map(pin=>
   changes.find(row=>row.original.path===pin.path)?.current??pin),
  ...changes.map(row=>row.snapshot),...additions]);
 assert.equal(files.length,previous.files.length+changes.length+additions.length,
  'snapshots and additions, no removed host input');
 const host={...previous,previous:previousHostPin,files,
  legacyInputTransitions,successorInputTransitions};
 return {host,changes,additions};
}

/** All arguments are explicit review inputs; no host diff is silently admitted. */
export function buildPlan({previousIndexPin=PREVIOUS_INDEX,changedHostPaths=[],addedHostPaths=[]}={}){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT,'real source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local development preparation only');
 assert.deepEqual(pinFile(ROOT,previousIndexPin.path),previousIndexPin,'exact previous index bytes');
 const previousIndex=readJsonPin(ROOT,previousIndexPin);
 assert(!previousIndex.pages.some(page=>page.animationId===S.ID),'P010 is not an earlier proof');
 const paths=nextPaths(previousIndexPin);
 const {host,changes,additions}=checkedHost(previousIndex,previousIndex.host,
  changedHostPaths,addedHostPaths);
 const hostBytes=json(host),hostPin=pinBytes(paths.host,hostBytes);
 const transaction=readRegistryTransaction(ROOT);
 const present=transaction.registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
 assert(!present.includes(S.ID),'P010 remains unregistered before preparation');
 assert(present.includes('shared-alg001-l06-p008'),'P008 remains registered');
 for(const page of previousIndex.pages)readPageProof(ROOT,page.proof,host,transaction);
 const source=S.readP010CanonicalSource(ROOT),artifacts=S.readP010Artifacts(ROOT);
 const supportPins=SUPPORT.map(relative=>pinFile(ROOT,relative));
 const sourcePins=source.localInputs;
 const forbidden=new Set(['packages/demos/private-current-js-registry.json',
  'packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/src/registry.local-only.metadata.generated.ts',
  'apps/web/lib/g678-admission-activation.ts',paths.host,paths.index,
  S.PROOF_PATH,S.FREEZE_PATH,FRAGMENT_PATH,
  ...changes.map(row=>row.original.path),...additions.map(row=>row.path)]);
 const integrity=uniquePins([...sourcePins,...Object.values(artifacts),...supportPins]);
 assert(!integrity.some(pin=>forbidden.has(pin.path)),'no cyclic or changed host input');
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
   globalPageOrdinal:10,sourceOccurrence:10,sectionCode:'RW',sectionPageOrdinal:9,
   complexityLane:S.COMPLEXITY_LANE,runtime:S.p010Runtime(artifacts)}],
  entry:{key:S.ID,module:`./modules/${S.ID}`,maturity:'private-current-js',
   complexityLane:S.COMPLEXITY_LANE,artifacts},
  continuousSource:S.CONTINUOUS,optionalSpanishAudio:S.OPTIONAL_SPANISH,
  integrity:{scope:'P010-source-canvas-continuous-native-text-function-local-current-js',
   completeTransitiveClosure:false,
   qualification:'Original runtime, source audio synchronization, listening, human review and visual fidelity remain independent.',
   files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,scaleOutAuthorized:false};
 const freezeBytes=json(packet),freeze=pinBytes(S.FREEZE_PATH,freezeBytes),bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',
  freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,
  freezeManifestSha256:freeze.sha256,entries:[packet.entry]};
 assert.equal(S.validateP010AdmissionSemantics(bound,registration),true);
 const projected=upsertPrivateCurrentJsCalibration(transaction.registry,registration);
 const legacyInputs=uniquePins([...integrity,...Object.values(artifacts),freeze,...supportPins]);
 const hostPaths=new Set(host.files.map(pin=>pin.path));
 const proof={schemaVersion:1,kind:'g678-page-proof-v1',hostContract:host.contract,
  animationId:S.ID,packet:bound,registration,legacyInputs,
  files:legacyInputs.filter(pin=>!hostPaths.has(pin.path)),external};
 const proofBytes=json(proof),proofPin=pinBytes(S.PROOF_PATH,proofBytes);
 const index={...previousIndex,host:hostPin,
  pages:[...previousIndex.pages,{animationId:S.ID,proof:proofPin}]};
 const outputs=new Map([[paths.host,hostBytes],[S.FREEZE_PATH,freezeBytes],
  [FRAGMENT_PATH,json(registration)],[S.PROOF_PATH,proofBytes],[paths.index,json(index)]]);
 return {outputs,host,hostPin,index,proof,proofPin,bound,registration,external,
  supportPins,transaction,projected,changes,additions,previousIndexPin};
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
  const [hostPath,,fragmentPath,proofPath,indexPath]=[...plan.outputs.keys()];
  for(const relative of [hostPath,S.FREEZE_PATH,fragmentPath])
   writeExact(relative,plan.outputs.get(relative));
  if(!fs.existsSync(path.join(ROOT,proofPath))){
   const result=prepareAdmissionCandidate({root:ROOT,output:S.PROOF_PATH,animationId:S.ID,
    packet:plan.bound,registration:plan.registration,implementationFiles:plan.supportPins,
    external:plan.external,hostPin:plan.hostPin,transaction:plan.transaction,
    validateSemantics:S.validateP010AdmissionSemantics});
   assert.deepEqual(result.proof,plan.proofPin,'shared helper emitted exact planned proof');
  }
  writeExact(indexPath,plan.outputs.get(indexPath));
 }
 if(mode!=='--plan'){
  const host=verifyHostVersion(ROOT,plan.hostPin);
  for(const page of plan.index.pages){
   const packet=readPageProof(ROOT,page.proof,host,{...plan.transaction,registry:plan.projected});
   if(page.animationId===S.ID)S.validateP010AdmissionSemantics(packet,plan.registration);
  }
  assert.deepEqual([...buildPlan(options).outputs],[...plan.outputs],
   'stable preparation inputs after roundtrip');
 }
 return {status:mode==='--plan'?'planned-not-written':'prepared-not-registered',
  outputs:[...plan.outputs].map(([relative,bytes])=>pinBytes(relative,bytes)),
  hostChanges:plan.changes,hostAdditions:plan.additions,
  previousProofsUnchanged:plan.index.pages.slice(0,9).map(page=>page.proof),
  pageFiles:plan.proof.files.length,external:plan.external.length,
  registrationChanged:false,activationChanged:false,acceptanceEffects:S.ACCEPTANCE};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'one CLI mode; reviewed host options use buildPlan/operate API');
 console.log(JSON.stringify(operate(process.argv[2]),null,2));
}
