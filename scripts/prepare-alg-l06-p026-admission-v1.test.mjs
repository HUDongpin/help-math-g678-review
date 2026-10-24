import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile} from '../lib/g678-admission-proof.mjs';
import {FRAGMENT,SOURCE_PLAN,EXPECTED_RECEIPT,proposedSourcePacket,
  preflight,prepare,validateEngineeringReceipt}
  from './prepare-alg-l06-p026-admission-v1.mjs';
import * as S from '../lib/alg-l06-p026-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const physical=S.SOURCE_ROOT;
async function withSource(run){
  const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
  process.env.HELP_MATH_G678_SOURCE_ROOT=physical;
  try{return await run();}finally{
    if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
    else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
  }
}

test('P026 source proposal is exact, acceptance-neutral and plan-only',()=>withSource(async()=>{
  const paths=[S.FREEZE_PATH,FRAGMENT,SOURCE_PLAN,S.PROOF_PATH];
  const before=paths.map(file=>fs.existsSync(path.join(root,file)));
  const proposal=proposedSourcePacket();
  assert.equal(proposal.index.pages.length,23);
  assert.equal(proposal.source.binding.files.length,160);
  assert.deepEqual(proposal.source.bindingPin,
    pinFile(root,S.BINDING_PATH));
  assert.deepEqual(proposal.registration.entries,[proposal.packet.entry]);
  assert.equal(proposal.packet.selectedPages[0].globalPageOrdinal,26);
  assert.deepEqual(proposal.packet.continuousSource.mainRuns.map(run=>
    run.blockFrameRange),[[31,158],[196,389]]);
  assert.deepEqual(proposal.packet.continuousSource.gapFrames,[159,195]);
  assert.deepEqual(proposal.packet.continuousSource.emptyNegativeSeekMarker,
    {frame:158,seekSamples:-2267,payloadBytes:0});
  assert.equal(proposal.packet.continuousSource.concatenated,false);
  assert.equal(proposal.packet.optionalSpanishAudio.localeAutoplay,false);
  assert(Object.values(proposal.packet.acceptanceEffects).every(value=>value===false));
  assert.equal(S.validateP026SourcePacket(proposal.bound,proposal.registration,root),true);
  const result=await preflight('--plan');
  assert.equal(result.status,'source-plan-not-written');
  assert.equal(result.registered,false);
  assert.deepEqual(paths.map(file=>fs.existsSync(path.join(root,file))),before);
}));

test('P026 source semantic validator rejects invented run joins, gap PCM and glossary keys',()=>withSource(()=>{
  const proposal=proposedSourcePacket();
  const joined=structuredClone(proposal.bound);
  joined.continuousSource.concatenated=true;
  assert.throws(()=>S.validateP026SourcePacket(joined,proposal.registration,root));
  const gap=structuredClone(proposal.bound);
  gap.continuousSource.gapFrames=[159,194];
  assert.throws(()=>S.validateP026SourcePacket(gap,proposal.registration,root));
  const glossary=structuredClone(proposal.bound);
  delete glossary.glossaryActions['Dependent variable'];
  assert.throws(()=>S.validateP026SourcePacket(glossary,proposal.registration,root));
}));

test('P026 proof preparation rejects absent or fabricated engineering receipt',()=>withSource(async()=>{
  await assert.rejects(()=>prepare(),/real P026 engineering receipt is required/);
  const proposal=proposedSourcePacket();
  assert.throws(()=>validateEngineeringReceipt({path:EXPECTED_RECEIPT,
    bytes:1,sha256:'0'.repeat(64)},proposal));
}));

test('already frozen P026 source artifacts can be rechecked by the real writer',t=>withSource(async()=>{
  if(!fs.existsSync(path.join(root,S.FREEZE_PATH))){
    t.skip('source preflight freeze has not yet been written');return;
  }
  const checked=await preflight('--check');
  assert.equal(checked.writer,'registration-contract-passed');
  assert.equal(checked.registered,false);
  assert.equal(checked.proofPrepared,false);
}));
