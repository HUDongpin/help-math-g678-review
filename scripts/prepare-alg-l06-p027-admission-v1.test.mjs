import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile} from '../lib/g678-admission-proof.mjs';
import {BINDING_PATH,CALIBRATION,SOURCE_ROOT,
 validateP027SourcePacket} from '../lib/alg-l06-p027-admission-semantics-v1.mjs';
import {FREEZE_PATH,FRAGMENT,SOURCE_PACKET,SOURCE_RECEIPT,preflight,
 proposedSourcePacket}
 from './prepare-alg-l06-p027-admission-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function withSource(run){
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT;
 try{return await run();}finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
}

test('P027 structural preflight is read-only and makes no admission claim',async()=>{
 const paths=[FREEZE_PATH,FRAGMENT,SOURCE_PACKET,SOURCE_RECEIPT],
  before=paths.map(file=>fs.existsSync(path.join(root,file)));
 const result=await preflight('--source');
 assert.equal(result.status,
  'source-structure-and-technical-decode-checked-writer-pending');
 assert.equal(result.registered,false);
 assert.equal(result.proofPrepared,false);
 assert.deepEqual(paths.map(file=>fs.existsSync(path.join(root,file))),before);
});

test('P027 source proposal binds the active predecessor and real artifacts when present',t=>withSource(async()=>{
 if(!fs.existsSync(path.join(root,BINDING_PATH))){
  t.skip('candidate source binding has not been frozen');return;
 }
 const proposal=proposedSourcePacket();
 assert.equal(proposal.index.pages.length,24);
 assert.equal(proposal.registration.calibrationId,CALIBRATION);
 assert.equal(proposal.registration.entries.length,1);
 assert.deepEqual(proposal.source.bindingPin,pinFile(root,BINDING_PATH));
 assert.equal(proposal.packet.selectedPages[0].globalPageOrdinal,27);
 assert.equal(proposal.packet.selectedPages[0].runtime.frameCount,770);
 assert.equal(proposal.packet.optionalSpanishAudio.localeAutoplay,false);
 assert.equal(proposal.packet.nativeTextSource.canvasInstanceSuppressionSupported,false);
 assert.equal(validateP027SourcePacket(proposal.bound,proposal.registration,
  proposal.source),true);
 for(const mutate of [
  packet=>{packet.optionalSpanishAudio.mainStreamSpliced=true;},
  packet=>{packet.nativeTextSource.canvasInstanceSuppressionSupported=true;},
  packet=>{packet.selectedPages[0].runtime.frameCount=769;},
  packet=>{delete packet.glossaryActions.Graph;},
 ]){
  const changed=structuredClone(proposal.bound);
  mutate(changed);
  assert.throws(()=>validateP027SourcePacket(changed,
   proposal.registration,proposal.source));
 }
 const planned=await preflight('--plan');
 assert.equal(planned.status,'source-proposal-not-written');
 assert.equal(planned.registered,false);
}));

test('already written P027 source proposal can be rechecked by the real writer',t=>withSource(async()=>{
 if(!fs.existsSync(path.join(root,FREEZE_PATH))){
  t.skip('source-only writer freeze has not yet been written');return;
 }
 const checked=await preflight('--check');
 assert.equal(checked.writer,'registration-contract-passed');
 assert.equal(checked.registered,false);
 assert.equal(checked.proofPrepared,false);
}));
