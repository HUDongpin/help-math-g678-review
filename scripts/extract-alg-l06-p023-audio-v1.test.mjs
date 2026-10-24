import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,run} from './extract-alg-l06-p023-audio-v1.mjs';

test('P023 source extraction retains one 400-block sprite-38 MP3 and zero-payload frame 12',()=>{
 const result=run('--check');
 assert.equal(result.mainBlocks,400);
 assert.equal(result.mainSamples,734400);
 assert.equal(result.separateSaSamples,1002240);
 const audit=JSON.parse(readFileSync('output/alg-l06-p023-audio-v1/audio-source-audit-v1.json'));
 assert.deepEqual(audit.domains.map(d=>[d.id,d.declaredFrames,d.blockCount]),
  [['root',10,0],['sprite-38',410,400]]);
 assert.deepEqual([audit.main.firstBlockFrame,audit.main.lastBlockFrame,
  audit.main.firstBlockRawSeekSamples],[11,410,1673]);
 assert.deepEqual(audit.main.zeroPayloadBlocks.map(b=>
  [b.frame,b.mp3Bytes,b.declaredSamples,b.rawSeekSamples]),[[12,0,0,0]]);
 assert.deepEqual(audit.main.negativeSeekBlocks,[]);
 assert.equal(audit.main.extractedMp3.sha256,
  'a8a52336d0b4e37aa2c00edc77a491afac4b38b173f13909d75b4a889a1e09a6');
 assert.equal(audit.limits.originalRuntimeObserved,false);
 assert.equal(audit.limits.listeningAccepted,false);
});

test('independent SA is hash-pinned and never spliced into the main source',()=>{
 const plan=JSON.parse(readFileSync('output/alg-l06-p023-audio-v1/audio-domain-plan-v1.json'));
 assert.deepEqual(plan.main.blockRange,[11,410]);
 assert.equal(plan.optionalSpanishAudio.asset.sha256,
  'c8da225f06545b2fd3b7edb77be46af198337b168dadd3c869cd9613377c33c5');
 assert.equal(plan.optionalSpanishAudio.activation,'explicit-user-only');
 assert.equal(plan.optionalSpanishAudio.localeAutoplay,false);
 assert.equal(plan.optionalSpanishAudio.joinedWithMain,false);
 assert.equal(plan.policy.singleMainRange,true);
});

test('wrong physical SWF bytes fail before generating candidate files',()=>{
 const intake=readFileSync('output/alg-l06-p023-intake-recon-v1/intake-recon-v1.json');
 const extractor=readFileSync('scripts/extract-alg-l06-p023-audio-v1.mjs');
 assert.throws(()=>build(Buffer.alloc(137816),Buffer.alloc(292320),intake,extractor));
});
