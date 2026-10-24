#!/usr/bin/env node
/** One source-backed P025 admission candidate; registration and activation are separate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,readPageProof,readRegistryTransaction,uniquePins,
 sha256,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import {validateP025EngineeringCases} from '../lib/alg-l06-p025-native-audio-evidence-v1.mjs';
import * as S from '../lib/alg-l06-p025-admission-semantics-v1.mjs';
const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const INDEX={path:'catalog/g678-admission-v1/index-v86.json',bytes:6370,
 sha256:'ba68988a15ff63ea2f33e1a0ab50c794d5bba6b062227ca269c2681670808fe9'};
export const FRAGMENT=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const RECEIPT='output/playwright/alg-l06-p025-host-v4/engineering-receipt-v1.json';
const SUPPORT=[
 'scripts/stage-alg-l06-p025-canvas-v2.mjs',
 'lib/alg-l06-p025-native-audio-evidence-v1.mjs',
 'lib/alg-l06-p025-native-audio-evidence-v1.test.mjs',
 'scripts/prepare-alg-l06-p025-admission-v1.mjs',
 'lib/alg-l06-p025-admission-semantics-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'apps/web/lib/alg-l06-p025-formal-admission-v1.server.ts',
 'apps/web/lib/alg-l06-p025-candidate-binding-v1.ts',
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/continuous-v1/page.tsx`,
 'packages/demos/tests/alg-l06-p025-clock-v1.test.ts',
 'packages/demos/tests/alg-l06-p025-audio-owner-v1.test.ts',
 'packages/demos/tests/alg-l06-p025-player-v1.test.tsx',
 'apps/web/tests/alg-l06-p025-formal-admission.test.ts',
 'apps/web/tests/alg-l06-p025-resource.test.ts',
 'apps/web/tests/alg-l06-p025-document-policy.test.ts',
 'lib/alg-l06-p025-admission-semantics-v1.test.mjs',
];
const core=p=>({path:p.path,bytes:p.bytes,sha256:p.sha256});
const serialize=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
function writeImmutable(file,data){
 fs.mkdirSync(path.dirname(path.join(ROOT,file)),{recursive:true});
 if(fs.existsSync(path.join(ROOT,file)))assert.deepEqual(fs.readFileSync(path.join(ROOT,file)),data,`immutable ${file}`);
 else fs.writeFileSync(path.join(ROOT,file),data,{flag:'wx'});
 return pinFile(ROOT,file);
}
export function validateReceipt(pin,index){
 assert.equal(pin.path,RECEIPT);const receipt=readJsonPin(ROOT,pin);
 assert.equal(receipt.kind,'g678-p025-local-my-lesson-engineering-v1');
 assert.equal(receipt.animationId,S.ID);assert.deepEqual(receipt.sourcePacket,S.BINDING);
 // Browser v5 ran under predecessor85; host86 adds only the separately reviewed formal-route headers.
 const sourceBinding=readJsonPin(ROOT,S.BINDING);
 assert.deepEqual(receipt.indexPin,sourceBinding.predecessorIndex);
 assert.deepEqual(receipt.hostPin,sourceBinding.predecessorHost);
 assert.deepEqual([receipt.officialCount,receipt.registered,receipt.denominator],[512,false,2282]);
 assert.deepEqual(receipt.pageErrors,[]);assert.deepEqual(receipt.consoleErrors,[]);
 assert(Object.values(receipt.acceptanceEffects).every(x=>x===false));
 assert(receipt.remainingGaps.length>0);
 const artifacts=uniquePins(receipt.artifacts);assert.equal(artifacts.length,receipt.artifacts.length);
 for(const p of artifacts){assert(p.path.startsWith('output/playwright/alg-l06-p025-host-v4/'));readPin(ROOT,p);}
 const cases=readJsonPin(ROOT,receipt.casesPin);
 assert(artifacts.some(p=>JSON.stringify(p)===JSON.stringify(receipt.casesPin)));
 assert.deepEqual(validateP025EngineeringCases(cases),receipt.traces,'independent native trace replay');
 const saRunner=artifacts.find(p=>p.path.endsWith('/sa-eof-return-en-v1.js'));assert(saRunner);
 assert(readPin(ROOT,saRunner).toString().includes("getByRole('button',{name:'Spanish Audio',exact:true}).click()"));
 return {receipt,artifacts,cases};
}
export function prepare(mode,receiptPin){
 assert(['--plan','--prepare','--check'].includes(mode));
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT);
 assert.deepEqual(pinFile(ROOT,INDEX.path),INDEX);
 const index=readJsonPin(ROOT,INDEX),host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(index.pages.length,22);assert(!index.pages.some(p=>p.animationId===S.ID));
 assert.equal(transaction.registry.calibrations.filter(c=>c.deploymentScope==='local-only').reduce((n,c)=>n+c.entries.length,0),512);
 assert(!transaction.registry.calibrations.some(c=>c.entries.some(e=>e.key===S.ID)));
 for(const previous of index.pages)readPageProof(ROOT,previous.proof,host,transaction);
 const source=S.readP025CanonicalSource(ROOT),entry=S.p025ProposedEntry(ROOT,source);
 const browser=receiptPin?validateReceipt(receiptPin,index):null;
 if(mode!=='--plan')assert(browser,'root-reviewed real browser receipt required');
 const support=SUPPORT.map(p=>pinFile(ROOT,p));
 const integrity=uniquePins([...source.localInputs,...support,...(browser?[receiptPin,...browser.artifacts]:[])]);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,globalPageOrdinal:25,
   sourceOccurrence:25,sectionCode:'VB',sectionPageOrdinal:15,complexityLane:'interactive-understood',runtime:S.p025Runtime(entry.artifacts)}],entry,
  continuousSource:{audit:source.binding.audio,plan:source.binding.audioPlan,
   browserDecode:source.binding.browserDecode,mainFrameDomain:'sprite-21',mainFrames:299,
   mainAsset:core(source.audioPlan.main.asset.source),firstBlockFrame:2,lastBlockFrame:299,
   zeroPayloadFrame:3,initialSeekSamples:1673,browserDecodedSamples:547200,
   browserPcmSha256:source.audioPlan.main.asset.browserPcmSha256,
   visualTailFrames:0.11455782312924612,oneContinuousStream:true,concatenated:false,
   originalRuntimeAccepted:false,listeningAccepted:false,audioAccepted:false},
  optionalSpanishAudio:{source:S.SA,asset:core(source.audioPlan.optionalSpanishAudio.source),
   browserDecodedSamples:593280,browserPcmSha256:source.audioPlan.optionalSpanishAudio.browserPcmSha256,
   trigger:'explicit-user-only',localeAutoplay:false,mainStreamSpliced:false,audioAccepted:false},
  nativeTextSource:{state:source.binding.native,frameDomain:'sprite-21',frames:299,
   staticTextDefinitions:8,suppressibleTextIds:[5,15],sourceEnglishFallback:true,
   originalRuntimeAccepted:false},
  glossaryActions:source.glossary,...(browser?{engineeringReceipt:receiptPin}:{}),
  integrity:{scope:'P025-source-single-continuous-main-explicit-independent-SA-native-text-glossary-and-modern-host',
   completeTransitiveClosure:false,qualification:'Original Flash trace, audio alignment, listening, human review, responsive host review and fidelity remain independent.',files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,scaleOutAuthorized:false};
 const bytes=serialize(packet),freeze={path:S.FREEZE_PATH,bytes:bytes.length,sha256:sha256(bytes)},bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',freezeManifest:freeze.path,
  freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,entries:[entry]};
 (mode==='--plan'?S.validateP025SourcePacket:S.validateP025Page)(bound,registration,ROOT);
 if(mode==='--plan')return {status:'planned-not-written',inputs:integrity.length,external:source.external.length,browserBound:!!browser,registered:false};
 if(mode==='--prepare'){
  writeImmutable(S.FREEZE_PATH,bytes);writeImmutable(FRAGMENT,serialize(registration));
  if(!fs.existsSync(path.join(ROOT,S.PROOF_PATH)))prepareAdmissionCandidate({root:ROOT,
   output:S.PROOF_PATH,animationId:S.ID,packet:bound,registration,implementationFiles:support,
   external:source.external,hostPin:index.host,transaction,
   validateSemantics:(p,r)=>S.validateP025Page(p,r,ROOT)});
 }
 const projected={...transaction,registry:{...transaction.registry,calibrations:[...transaction.registry.calibrations,registration]}};
 const proofPin=pinFile(ROOT,S.PROOF_PATH),readBack=readPageProof(ROOT,proofPin,host,projected);
 S.validateP025Page(readBack,registration,ROOT);
 assert.deepEqual(readPin(ROOT,freeze),bytes);
 return {status:'candidate-roundtrip-passed-not-registered',proof:proofPin,freeze,fragment:pinFile(ROOT,FRAGMENT),host:index.host,
  previousProofsUnchanged:index.pages.map(p=>p.proof),sourceInputs:integrity.length,external:source.external.length,registered:false,activationChanged:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [,,mode,receiptPath,receiptBytes,receiptSha256]=process.argv;
 const receipt=receiptPath?{path:receiptPath,bytes:Number(receiptBytes),sha256:receiptSha256}:undefined;
 console.log(JSON.stringify(prepare(mode,receipt),null,2));
}
