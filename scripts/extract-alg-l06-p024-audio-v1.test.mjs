import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,run} from './extract-alg-l06-p024-audio-v1.mjs';

test('P024 eight physical audio domains remain distinct and source-bound',()=>{
 const result=run('--check');
 assert.equal(result.domains.length,8);
 assert.equal(result.totalBlocks,570);
 assert.equal(result.separateSaSamples,570240);
 const audit=JSON.parse(readFileSync('output/alg-l06-p024-audio-v1/audio-source-audit-v1.json'));
 assert.deepEqual(audit.domains.map(row=>[row.id,row.role,row.blockCount]),[
  ['sprite-69','wrong-feedback',29],['sprite-83','wrong-feedback',28],
  ['sprite-97','wrong-feedback',26],['sprite-123','right-feedback',30],
  ['sprite-155','right-feedback',24],['sprite-188','right-feedback',27],
  ['sprite-196','right-feedback',26],['sprite-208','main',380]]);
 assert(audit.domains.every(row=>row.ffmpegDecode.samples===row.declaredSamples));
 assert(audit.domains.every(row=>row.firstBlockRawSeekSamples===1673));
 assert.deepEqual(audit.domains.filter(row=>row.trailerAfterEnd).map(row=>
  [row.id,row.trailerAfterEnd.bytes,row.trailerAfterEnd.sha256]),
  [['sprite-123',386,'d14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0']]);
});

test('negative terminal seeks and empty payloads stay as raw facts',()=>{
 const audit=JSON.parse(readFileSync('output/alg-l06-p024-audio-v1/audio-source-audit-v1.json'));
 const byId=new Map(audit.domains.map(row=>[row.id,row]));
 assert.deepEqual(byId.get('sprite-97').negativeSeekBlocks.map(row=>
  [row.frame,row.rawSeekSamples,row.mp3Bytes,row.declaredSamples]),[[27,-2093,0,0]]);
 assert.deepEqual(byId.get('sprite-123').negativeSeekBlocks.map(row=>
  [row.frame,row.rawSeekSamples,row.mp3Bytes,row.declaredSamples]),[[31,-1953,0,0]]);
 assert.deepEqual(byId.get('sprite-188').zeroPayloadBlocks.map(row=>row.frame),[2]);
 assert.deepEqual(byId.get('sprite-208').zeroPayloadBlocks.map(row=>row.frame),[3]);
 assert.equal(audit.separateSa.activation,'explicit-user-only');
 assert.equal(audit.separateSa.localeAutoplay,false);
 assert.equal(audit.separateSa.splicedIntoAnyDomain,false);
 assert.equal(audit.limits.browserDecodeObserved,false);
 assert.equal(audit.limits.listeningAccepted,false);
});

test('wrong source bytes fail before candidate output',()=>{
 const intake=readFileSync('output/alg-l06-p024-intake-recon-v1/intake-recon-v1.json');
 const behavior=readFileSync('output/alg-l06-p024-behavior-audit-v1/behavior-audit-v1.json');
 const script=readFileSync('scripts/extract-alg-l06-p024-audio-v1.mjs');
 assert.throws(()=>build(Buffer.alloc(462836),Buffer.alloc(166320),
  intake,behavior,script));
});
