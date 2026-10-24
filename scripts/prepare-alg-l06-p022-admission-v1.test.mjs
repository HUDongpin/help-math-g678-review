import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,validateEngineeringReceipt,FRAGMENT_PATH,PREVIOUS_INDEX_PIN,
 ENGINEERING_RECEIPT_PATH} from './prepare-alg-l06-p022-admission-v1.mjs';
import * as S from '../lib/alg-l06-p022-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const RECEIPT_PIN={path:ENGINEERING_RECEIPT_PATH,bytes:7939,
 sha256:'846b45c147437b4c1f11219e98d0a556254d20be17221290627a3d27e2160fe7'};
function withPhysicalSource(run){
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;}
}
function activePin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const marker='export const G678_ADMISSION_INDEX = ';
 const begin=source.indexOf(marker),end=source.indexOf(' as const;',begin+marker.length);
 assert(begin>=0&&end>begin);return JSON.parse(source.slice(begin+marker.length,end));
}
test('P022 audits actual two-range audio, 36/87 text, three masks and six source instances',()=>{
 const source=S.readP022CanonicalSource(root);
 assert.deepEqual(source.binding.source,S.SOURCE);
 assert.equal(source.binding.files.length,46);
 assert.equal(source.external.length,5);
 assert.deepEqual(source.audio.main.ranges.map(row=>[row.firstBlockFrame,row.lastBlockFrame]),
  [[2,132],[150,422]]);
 assert.deepEqual(source.audio.main.absentBlockFrames,
  Array.from({length:17},(_,i)=>133+i));
 assert.equal(source.audio.main.negativeSeekBlocks[0].rawSeekSamples,-2018);
 assert.deepEqual([source.audit.textDefinitions.length,
  source.text.textInstances.length,source.canvas.sourceClipMasks.length,
  source.frames.frames.length],[36,87,3,422]);
 assert.deepEqual(Object.fromEntries(Object.entries(source.glossary).map(([key,row])=>
  [key,[row.characterId,row.instances[0].firstCandidateFrame]])),S.GATES);
 assert.deepEqual(source.crosswalk.missingModernKeys,['Graph','Representation']);
 assert(source.localInputs.some(row=>row.path===S.ARTIFACT_PATHS.runtime));
});
test('P022 v74 plan projects one canonical registration without writing it',t=>
 withPhysicalSource(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v74 predecessor is no longer active');return;
  }
  assert.deepEqual(pinFile(root,PREVIOUS_INDEX_PIN.path),PREVIOUS_INDEX_PIN);
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(item=>fs.existsSync(path.join(root,item)));
  const plan=buildPlan({previousIndexPin:PREVIOUS_INDEX_PIN});
  const result=operate('--plan',{previousIndexPin:PREVIOUS_INDEX_PIN});
  assert.equal(plan.index.pages.length,19);
  assert.equal(result.status,'planned-not-written');
  assert.equal(result.outputsProvisional,true);
  assert.deepEqual(result.missingPrerequisites,[ENGINEERING_RECEIPT_PATH]);
  assert.equal(result.registrationChanged,false);assert.equal(result.activationChanged,false);
  assert.deepEqual(outputs.map(item=>fs.existsSync(path.join(root,item))),before);
  assert.equal(plan.projected.registry.calibrations.some(row=>
   row.calibrationId===S.CALIBRATION),true);
  assert.deepEqual(plan.bound.entry.artifacts,S.proposedP022Artifacts(root,plan.source.canvas));
  const broken=structuredClone(plan.bound);
  broken.continuousSource.mainRanges=[[2,422]];
  assert.throws(()=>S.validateP022AdmissionSemantics(broken,plan.registration,root));
  const wrongGlossary=structuredClone(plan.bound);
  wrongGlossary.glossaryActions.Graph.instances[0].firstCandidateFrame=2;
  assert.throws(()=>S.validateP022AdmissionSemantics(wrongGlossary,plan.registration,root));
  assert.throws(()=>buildPlan({previousIndexPin:{...PREVIOUS_INDEX_PIN,bytes:1}}),
   /reviewed v74 predecessor/);
  assert.throws(()=>operate('--prepare',{previousIndexPin:PREVIOUS_INDEX_PIN}),
   /browser receipt required/);
 }));
test('P022 host pins candidate glossary supplement without admitting this page',t=>
 withPhysicalSource(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v74 predecessor is no longer active');return;
  }
  const index=readJsonPin(root,PREVIOUS_INDEX_PIN),host=readJsonPin(root,index.host);
  assert.equal(index.pages.length,19);
  assert(!index.pages.some(row=>row.animationId===S.ID));
  const supplement='apps/web/lib/alg-l06-p022-candidate-v1.server.ts';
  const hostPin=host.files.find(item=>item.path===supplement);
  assert.deepEqual(hostPin,pinFile(root,supplement));
  const source=fs.readFileSync(path.join(root,supplement),'utf8');
  assert(source.includes("for(const key of ['Graph','Representation'])"));
  assert(source.includes('glossary.length===36'));
 assert(source.includes("target.rendererAvailability.kind==='unavailable'"));
 }));
test('P022 real browser receipt is read back through raw cases without preparing output',t=>
 withPhysicalSource(()=>{
  if(JSON.stringify(activePin())!==JSON.stringify(PREVIOUS_INDEX_PIN)){
   t.skip('v74 predecessor is no longer active');return;
  }
  assert.deepEqual(pinFile(root,RECEIPT_PIN.path),RECEIPT_PIN);
  const index=readJsonPin(root,PREVIOUS_INDEX_PIN),host=readJsonPin(root,index.host);
  const {receipt,artifacts}=validateEngineeringReceipt(RECEIPT_PIN,index,host);
  assert.equal(receipt.checks.twoRangesGapNoSyntheticAudio,true);
  assert.equal(receipt.checks.sourceTextTiming,true);
  assert(artifacts.some(item=>item.path.endsWith('/cases.json')));
  const outputs=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH];
  const before=outputs.map(item=>fs.existsSync(path.join(root,item)));
  const result=operate('--check-receipt',{previousIndexPin:PREVIOUS_INDEX_PIN,
   engineeringReceiptPin:RECEIPT_PIN});
  assert.equal(result.status,'receipt-validated-candidate-not-written');
  assert.equal(result.engineeringReceiptBound,true);
  assert.equal(result.outputsProvisional,false);
  assert.equal(result.registrationChanged,false);
  assert.equal(result.activationChanged,false);
  assert.deepEqual(outputs.map(item=>fs.existsSync(path.join(root,item))),before);
  assert.throws(()=>validateEngineeringReceipt({...RECEIPT_PIN,sha256:'0'.repeat(64)},
   index,host),/current bytes/);
 }));
