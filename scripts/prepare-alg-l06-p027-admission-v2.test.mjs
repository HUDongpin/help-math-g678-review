import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile} from '../lib/g678-admission-proof.mjs';
import * as S from '../lib/alg-l06-p027-admission-semantics-v1.mjs';
import {RECEIPT,FREEZE,FRAGMENT,PROOF,SUPPORT,proposedFinalPacket,
 preflight,prepare,validateEngineeringReceipt}
 from './prepare-alg-l06-p027-admission-v2.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function withSource(run){
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return await run();}finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
}

test('final P027 preparation refuses absent or fabricated host receipt',()=>
 withSource(async()=>{
  await assert.rejects(()=>prepare(),/real P027 engineering receipt required/);
  assert.throws(()=>validateEngineeringReceipt({path:RECEIPT,
   bytes:1,sha256:'0'.repeat(64)},
   {source:S.readP027CanonicalSource(root)}));
 }));

test('real-host proposal is read-only and includes every producer input',t=>
 withSource(async()=>{
  if(!fs.existsSync(path.join(root,RECEIPT))){
   t.skip('root engineering receipt pending');return;
  }
  const receipt=pinFile(root,RECEIPT),
   paths=[FREEZE,FRAGMENT,PROOF],
   before=paths.map(file=>fs.existsSync(path.join(root,file))),
   proposal=proposedFinalPacket(receipt);
  assert.equal(proposal.index.pages.length,24);
  assert.equal(proposal.packet.selectedPages[0].globalPageOrdinal,27);
  assert.equal(proposal.packet.engineeringReceipt.sha256,receipt.sha256);
  assert.equal(proposal.packet.optionalSpanishAudio.localeAutoplay,false);
  assert.equal(proposal.packet.continuousSource.mainRuns.length,1);
  for(const file of SUPPORT)assert(proposal.integrity.some(pin=>
   pin.path===file),'support input '+file);
  assert(Object.values(proposal.packet.acceptanceEffects).every(value=>value===false));
  const plan=await preflight('--plan',receipt);
  assert.equal(plan.status,'final-host-bound-proposal-not-written');
  assert.equal(plan.registered,false);
  assert.deepEqual(paths.map(file=>fs.existsSync(path.join(root,file))),before);
 }));

test('existing final freeze, if written, passes real production writer check',t=>
 withSource(async()=>{
  if(!fs.existsSync(path.join(root,FREEZE))){
   t.skip('final freeze not yet written');return;
  }
  const receipt=pinFile(root,RECEIPT),result=await preflight('--check',receipt);
  assert.equal(result.writer,'registration-contract-passed');
  assert.equal(result.registered,false);
  assert.equal(result.proofPrepared,false);
 }));
