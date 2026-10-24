import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,run} from './extract-alg-l06-p021-audio-v1.mjs';

test('P021 physical source extraction is reproducible and preserves audio domains',()=>{
 const checked=run('--check');
 assert.equal(checked.domain,'sprite-43');
 assert.equal(checked.blocks,371);
 assert.equal(checked.mainSamples,680832);
 assert.equal(checked.saSamples,1217664);
 assert(Math.abs(checked.candidateNativeEndFrame-376.6103401360544)<1e-9);
 const audit=JSON.parse(readFileSync('output/alg-l06-p021-audio-v1/audio-source-audit-v1.json'));
 assert.deepEqual(audit.domains.map(d=>[d.id,d.blockCount]),[['root',0],['sprite-43',371]]);
 assert.deepEqual([audit.main.firstBlockFrame,audit.main.lastBlockFrame],[7,377]);
 assert.deepEqual(audit.main.zeroPayloadBlocks.map(x=>x.frame),[8]);
 assert.deepEqual(audit.main.negativeSeekBlocks,[]);
 assert.equal(audit.main.absentBlockFrames.length,0);
 assert.equal(audit.limits.originalRuntimeObserved,false);
 assert.equal(audit.limits.listeningAccepted,false);
});

test('wrong source bytes are rejected before any extracted output is projected',()=>{
 assert.throws(()=>build(Buffer.alloc(131483),Buffer.alloc(355152)));
});
