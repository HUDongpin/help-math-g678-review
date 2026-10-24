import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseArgs,plan} from './probe-nms-l02-p060-host-v1.mjs';
import {P060_SOURCE_BUTTON_OCCURRENCES} from '../packages/demos/src/generated/nms-l02-p060-terms-v1.ts';
import {P060_AUDIO_DOMAINS} from '../packages/demos/src/nms-l02-p060-audio-v1.ts';

test('P060 browser plan binds all 16 actual source occurrences and all 11 pinned stream domains',()=>{
 const value=plan();
 assert.equal(value.base,'http://127.0.0.1:3331');
 assert.equal(value.registeredPredecessorCount,58);
 assert.equal(value.renderableCount,59);
 assert.deepEqual(value.main.authoredStops,[262,400,527,646,699,718]);
 assert.equal(value.sourceOccurrences.length,16);
 assert.deepEqual(new Set(value.sourceOccurrences.map(item=>item.id)),
  new Set(P060_SOURCE_BUTTON_OCCURRENCES.map(item=>item.id)));
 for(const item of value.sourceOccurrences){
  const actual=P060_SOURCE_BUTTON_OCCURRENCES.find(row=>row.id===item.id);
  assert.equal(item.entry,actual.entryId);
  assert.equal(item.key,actual.sourceKeyAttribute);
 }
 assert.equal(Object.keys(value.audioDomains).length,11);
 for(const [id,expected] of Object.entries(value.audioDomains)){
  const actual=P060_AUDIO_DOMAINS[id];assert.ok(actual);
  assert.deepEqual({bytes:actual.bytes,sha256:actual.sha256,samples:actual.decodedSamples,
   channels:actual.channels,sampleRate:actual.sampleRate},
   {...expected,sampleRate:22050});
 }
 assert.deepEqual(value.applicableFeedback,
  ['sprite-205','sprite-217','sprite-245','sprite-354','sprite-296','sprite-275','sprite-322']);
 assert.equal(value.cases.length,6);
 assert.deepEqual(new Set(value.cases.map(item=>item.locale)),new Set(['en','es']));
});

test('P060 probe permits only a plan or one unique local run slug',()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','candidate-v1']),{mode:'run',slug:'candidate-v1'});
 for(const argv of [[],['--run'],['--run','../escape'],['--run','a/b'],['--run','ABC'],
  ['--run','candidate-v1','--base-url','http://example.com'],['--plan','extra']])
  assert.throws(()=>parseArgs(argv));
});
