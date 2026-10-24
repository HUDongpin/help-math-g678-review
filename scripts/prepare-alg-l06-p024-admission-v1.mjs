#!/usr/bin/env node
/** One source-backed P024 admission candidate; registration and activation are separate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,readPageProof,readRegistryTransaction,uniquePins,
 sha256,verifyHostVersion} from '../lib/g678-admission-proof.mjs';
import {prepareAdmissionCandidate} from './lib/g678-admission-candidate.mjs';
import {validateNativeAudioTrace,validateP024NativeAudioEvidence} from '../lib/alg-l06-p024-native-audio-evidence-v1.mjs';
import * as S from '../lib/alg-l06-p024-admission-semantics-v1.mjs';
const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
export const INDEX={path:'catalog/g678-admission-v1/index-v83.json',bytes:6089,
 sha256:'e20549718c4324a28df246e54b694fff919893886d8ad30795a51774f60f873f'};
export const FRAGMENT=`work/g678-workflow/candidates/${S.ID}-registration-v1.json`;
export const RECEIPT='output/playwright/alg-l06-p024-host-v3/engineering-receipt-v1.json';
const SUPPORT=[
 'lib/alg-l06-p024-native-audio-evidence-v1.mjs',
 'lib/alg-l06-p024-native-audio-evidence-v1.test.mjs',
 'scripts/prepare-alg-l06-p024-admission-v1.mjs',
 'lib/alg-l06-p024-admission-semantics-v1.mjs',
 'scripts/lib/g678-admission-candidate.mjs',
 'apps/web/lib/alg-l06-p024-formal-admission-v1.server.ts',
 'apps/web/lib/alg-l06-p024-candidate-binding-v1.ts',
 `apps/web/app/[locale]/migration-status/g678-calibration/${S.ID}/continuous-v1/page.tsx`,
 'packages/demos/tests/alg-l06-p024-clock-v1.test.ts',
 'packages/demos/tests/alg-l06-p024-state-v1.test.ts',
 'apps/web/tests/alg-l06-p024-formal-admission.test.ts',
 'apps/web/tests/alg-l06-p024-runtime-playback.test.ts',
 'lib/alg-l06-p024-admission-semantics-v1.test.mjs',
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
 assert.equal(receipt.kind,'g678-p024-local-my-lesson-engineering-v1');
 assert.equal(receipt.animationId,S.ID);assert.deepEqual(receipt.sourcePacket,S.BINDING);
 assert.deepEqual(receipt.indexPin,INDEX);assert.deepEqual(receipt.hostPin,index.host);
 assert.deepEqual([receipt.officialCount,receipt.registered,receipt.denominator],[511,false,2282]);
 assert.deepEqual(receipt.pageErrors,[]);assert.deepEqual(receipt.consoleErrors,[]);
 assert.deepEqual(receipt.acceptanceEffects,S.ACCEPTANCE);
 assert(receipt.remainingGaps.length>0);
 const artifacts=uniquePins(receipt.artifacts);assert.equal(artifacts.length,receipt.artifacts.length);
 for(const p of artifacts){assert(p.path.startsWith('output/playwright/alg-l06-p024-host-v3/'));readPin(ROOT,p);}
 const cases=readJsonPin(ROOT,receipt.casesPin);
 assert(artifacts.some(p=>JSON.stringify(p)===JSON.stringify(receipt.casesPin)));
 for(const locale of ['en','es']){
  const ready=cases[locale].ready;
  assert.equal(ready.status,200);assert(ready.robots.includes('noindex'));
  assert.deepEqual(ready.errors,[]);assert.deepEqual(ready.consoleErrors,[]);
  assert.deepEqual([ready.player.p024Ready,ready.player.p024MainFrame,ready.player.p024SaPhase],['true','1','idle']);
  assert(!ready.observer.events.some(e=>e.kind==='source-start'));
  assert.equal(ready.observer.events.filter(e=>e.kind==='decode-resolved').length,8);
  const correct=cases[locale].correct;
  assert.deepEqual(correct.errors,[]);assert.deepEqual(correct.consoleErrors,[]);
  assert.equal(correct.stages.find(x=>x.label==='natural381').player.p024MainFrame,'381');
  assert.equal(correct.stages.find(x=>x.label==='natural-quiz154').player.p024Phase,'quiz');
  const glossary=cases[locale].glossary;
  assert.deepEqual(glossary.errors,[]);assert.deepEqual(glossary.consoleErrors,[]);assert.equal(glossary.rows.length,7);
  for(const row of glossary.rows){
   assert.equal(row.before.p024MainFrame,row.after.p024MainFrame);
   assert.equal(row.after.p024Playing,'false');assert.equal(row.focused,row.instance);
   assert(row.text.length>40);
  }
 }
 const wrong=cases.en.wrong;
 assert.deepEqual(wrong.errors,[]);assert.deepEqual(wrong.consoleErrors,[]);
 assert.equal(wrong.stages.find(x=>x.label==='first-wrong-retry').player.p024WrongCount,'1');
 assert.equal(wrong.stages.find(x=>x.label==='second-wrong-resumes-main').player.p024WrongCount,'0');
 assert.equal(wrong.stages.find(x=>x.label==='natural381').player.p024MainFrame,'381');
 const sa=cases.en.sa;
 assert.deepEqual(sa.errors,[]);assert.deepEqual(sa.consoleErrors,[]);
 assert.equal(sa.stages.find(x=>x.label==='sa-eof-hold').player.p024SaPhase,'ended');
 assert.equal(sa.stages.find(x=>x.label==='sa-return').player.p024SaPhase,'idle');
 assert.equal(sa.stages.find(x=>x.label==='sa-eof-hold').player.p024MainFrame,sa.stages.find(x=>x.label==='sa-started').player.p024MainFrame);
 assert.equal(cases.lifecycle.cancelled.player.p024SaPhase,'idle');
 assert.equal(cases.lifecycle.cancelled.player.p024MainFrame,'1');
 assert.deepEqual(cases.lifecycle.errors,[]);assert.deepEqual(cases.lifecycle.consoleErrors,[]);
 assert.equal(cases.lifecycle.reflow.viewport,390);assert(cases.lifecycle.reflow.scrollWidth>0&&cases.lifecycle.reflow.scrollWidth<=cases.lifecycle.reflow.viewport,'no document horizontal overflow');
 assert.equal(cases.lifecycle.reflow.rootFont,'32px');assert.equal(cases.lifecycle.reflow.reducedMotion,true);
 assert(cases.lifecycle.previous.ready&&cases.lifecycle.returned.ready);
 assert(cases.http.rows.every(row=>row.expected===row.status));
 const plan=readJsonPin(ROOT,readJsonPin(ROOT,S.BINDING).audioPlan);
 validateP024NativeAudioEvidence(cases.en,plan);
 validateNativeAudioTrace(cases.es.ready.observer,plan,{ready:true});
 for(const flow of [cases.en.wrong,cases.es.glossary,cases.es.correct])validateNativeAudioTrace(flow.observer,plan);
 const lifecycleTrace=validateNativeAudioTrace(cases.lifecycle.observer,plan);
 assert(!lifecycleTrace.starts.some(x=>x.id==='separate-sa'),'cancelled Preview SA never starts');
 assert([...lifecycleTrace.contexts.values()].filter(x=>!x.closed).length===1,'all old P024 contexts retired after navigation');
 assert.equal(cases.lifecycle.returned.player.p024MainFrame,'1');assert.equal(cases.lifecycle.returned.player.p024SaPhase,'idle');
 assert(cases.en.sa.stages.some(x=>x.label==='sa-loading-ui'&&x.player.p024SaPhase==='loading'));
 const saRunner=artifacts.find(p=>p.path.endsWith('/sa-flow-v5.js'));assert(saRunner,'reviewed explicit SA runner retained');
 assert(readPin(ROOT,saRunner).toString().includes("getByRole('button',{name:'Spanish Audio',exact:true}).click()"),'actual explicit SA action');
 return {receipt,artifacts,cases};
}
export function prepare(mode,receiptPin){
 assert(['--plan','--prepare','--check'].includes(mode));
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.SOURCE_ROOT);
 assert.deepEqual(pinFile(ROOT,INDEX.path),INDEX);
 const index=readJsonPin(ROOT,INDEX),host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 assert.equal(index.pages.length,21);assert(!index.pages.some(p=>p.animationId===S.ID));
 assert.equal(transaction.registry.calibrations.filter(c=>c.deploymentScope==='local-only').reduce((n,c)=>n+c.entries.length,0),511);
 assert(!transaction.registry.calibrations.some(c=>c.entries.some(e=>e.key===S.ID)));
 for(const previous of index.pages)readPageProof(ROOT,previous.proof,host,transaction);
 const source=S.readP024CanonicalSource(ROOT),entry=S.p024ProposedEntry(ROOT,source);
 const browser=receiptPin?validateReceipt(receiptPin,index):null;
 if(mode!=='--plan')assert(browser,'root-reviewed real browser receipt required');
 const support=SUPPORT.map(p=>pinFile(ROOT,p));
 const integrity=uniquePins([...source.localInputs,...support,...(browser?[receiptPin,...browser.artifacts]:[])]);
 const packet={schemaVersion:1,calibrationId:S.CALIBRATION,sourceRoot:S.SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:S.SOURCE,sourceXml:S.XML,
  selectedPages:[{animationId:S.ID,placementId:S.ID,assetId:`swf-${S.SOURCE.sha256}`,
   sourceSha256:S.SOURCE.sha256,moduleCode:'ALG001',lessonNumber:6,globalPageOrdinal:24,
   sourceOccurrence:24,sectionCode:'VB',sectionPageOrdinal:14,complexityLane:'behavior-heavy',runtime:S.p024Runtime(entry.artifacts)}],entry,
  continuousSource:{audit:source.binding.audio,plan:source.binding.audioPlan,
   mainFrameDomain:'sprite-208',mainFrames:381,quizStopFrame:154,
   domainAssets:source.plan.domains.map(row=>({id:row.id,frames:row.declaredFrames,asset:core(row.extractedMp3)})),
   independentDomains:true,concatenated:false,branchCoverageComplete:false,
   originalRuntimeAccepted:false,listeningAccepted:false,audioAccepted:false},
  feedbackSource:source.behavior.feedback.map(row=>({id:`sprite-${row.id}`,kind:row.kind,
   variant:({69:1,83:2,97:3,123:3,155:1,188:4,196:2})[row.id],frames:row.end,
   stop:row.stop??null,closeGoto:row.closeGoto??null,terminal:row.end})),
  optionalSpanishAudio:{source:S.SA,sourceCopy:source.audio.separateSa.copy,
   trigger:'explicit-user-only',localeAutoplay:false,mainStreamSpliced:false,
   mainPausedDuringPlayback:true,returnMainSupported:true,audioAccepted:false},
  glossaryActions:source.glossary,...(browser?{engineeringReceipt:receiptPin}:{}),
  integrity:{scope:'P024-source-branches-eight-independent-audio-domains-native-text-and-modern-host',
   completeTransitiveClosure:false,qualification:'Original Flash, branch trace coverage, listening, human review and fidelity remain independent.',files:integrity},
  acceptanceEffects:S.ACCEPTANCE,productCalibrationPassed:false,scaleOutAuthorized:false};
 const bytes=serialize(packet),freeze={path:S.FREEZE_PATH,bytes:bytes.length,sha256:sha256(bytes)},bound={...packet,freezeManifest:freeze};
 const registration={calibrationId:S.CALIBRATION,deploymentScope:'local-only',freezeManifest:freeze.path,
  freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,entries:[entry]};
 S.validateP024Page(bound,registration,ROOT);
 if(mode==='--plan')return {status:'planned-not-written',inputs:integrity.length,external:source.external.length,browserBound:!!browser,registered:false};
 if(mode==='--prepare'){
  writeImmutable(S.FREEZE_PATH,bytes);writeImmutable(FRAGMENT,serialize(registration));
  if(!fs.existsSync(path.join(ROOT,S.PROOF_PATH)))prepareAdmissionCandidate({root:ROOT,
   output:S.PROOF_PATH,animationId:S.ID,packet:bound,registration,implementationFiles:support,
   external:source.external,hostPin:index.host,transaction,
   validateSemantics:(p,r)=>S.validateP024Page(p,r,ROOT)});
 }
 const projected={...transaction,registry:{...transaction.registry,calibrations:[...transaction.registry.calibrations,registration]}};
 const proofPin=pinFile(ROOT,S.PROOF_PATH),readBack=readPageProof(ROOT,proofPin,host,projected);
 S.validateP024Page(readBack,registration,ROOT);
 assert.deepEqual(readPin(ROOT,freeze),bytes);
 return {status:'candidate-roundtrip-passed-not-registered',proof:proofPin,freeze,fragment:pinFile(ROOT,FRAGMENT),host:index.host,
  previousProofsUnchanged:index.pages.map(p=>p.proof),sourceInputs:integrity.length,external:source.external.length,registered:false,activationChanged:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [,,mode,receiptPath,receiptBytes,receiptSha256]=process.argv;
 const receipt=receiptPath?{path:receiptPath,bytes:Number(receiptBytes),sha256:receiptSha256}:undefined;
 console.log(JSON.stringify(prepare(mode,receipt),null,2));
}
