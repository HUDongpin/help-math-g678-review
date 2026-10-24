import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,run} from './extract-alg-l06-p022-audio-v1.mjs';

test('P022 source extraction preserves two real MP3 ranges and the negative-seek boundary',()=>{
 const result=run('--check');
 assert.deepEqual(result.mainRanges.map(r=>[r.id,r.blocks,r.samples]),
  [['main-1',131,238464],['main-2',273,501696]]);
 assert.equal(result.separateSaSamples,864000);
 const audit=JSON.parse(readFileSync('output/alg-l06-p022-audio-v1/audio-source-audit-v1.json'));
 assert.deepEqual(audit.main.absentBlockFrames,Array.from({length:17},(_,i)=>133+i));
 assert.deepEqual(audit.main.zeroPayloadBlocks.map(b=>[b.frame,b.rawSeekSamples,b.mp3Bytes]),
  [[3,0,0],[132,-2018,0]]);
 assert.deepEqual(audit.main.negativeSeekBlocks.map(b=>[b.frame,b.rawSeekSamples]),[[132,-2018]]);
 assert.deepEqual(audit.main.ranges.map(r=>[r.firstBlockFrame,r.lastBlockFrame,r.firstBlockRawSeekSamples]),
  [[2,132,1673],[150,422,416]]);
 assert.equal(audit.main.fullStreamDecodeDiagnostic.independentRangePcmEqualsFullStreamPcm,true);
 assert.equal(audit.main.fullStreamDecodeDiagnostic.fullStreamPlaybackAssetCreated,false);
 assert.equal(audit.limits.absentBlocksProveAudibleSilence,false);
 assert.equal(audit.limits.originalRuntimeObserved,false);
 assert.equal(audit.limits.listeningAccepted,false);
});

test('P022 SA remains a separately pinned, explicitly activated asset',()=>{
 const plan=JSON.parse(readFileSync('output/alg-l06-p022-audio-v1/audio-domain-plan-v1.json'));
 assert.deepEqual(plan.main.blockRanges.map(r=>r.id),['main-1','main-2']);
 assert.equal(plan.optionalSpanishAudio.asset.sha256,
  '2ced2d44148da73af856808834d32083d61d61d8073acdfe48650c1e9809a7bb');
 assert.equal(plan.optionalSpanishAudio.activation,'explicit-user-only');
 assert.equal(plan.optionalSpanishAudio.localeAutoplay,false);
 assert.equal(plan.optionalSpanishAudio.joinedWithMain,false);
 assert.equal(plan.main.boundary.rawSeekSamples,-2018);
 assert.equal(plan.main.boundary.nextBlockFrame,150);
});

test('wrong physical source bytes fail before outputs can be projected',()=>{
 const generator=readFileSync('scripts/extract-alg-l06-p022-audio-v1.mjs');
 const intake=readFileSync('output/alg-l06-p022-intake-recon-v1/intake-recon-v1.json');
 assert.throws(()=>build(Buffer.alloc(135254),Buffer.alloc(252000),generator,intake));
});
