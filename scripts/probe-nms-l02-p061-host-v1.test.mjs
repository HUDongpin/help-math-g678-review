import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseArgs,plan} from './probe-nms-l02-p061-host-v1.mjs';
import {P061_SOURCE_BUTTON_OCCURRENCES} from '../packages/demos/src/generated/nms-l02-p061-terms-v1.ts';
import {P061_AUDIO_DOMAINS} from '../packages/demos/src/nms-l02-p061-audio-v1.ts';

const groups={picture:1,'later-main':1,hint:5};
test('P061 plan binds seven actual source occurrences, eleven MP3 domains and conditional branches',()=>{
 const value=plan();
 assert.equal(value.base,'http://127.0.0.1:3331');
 assert.equal(value.registeredPredecessorCount,59);
 assert.equal(value.renderableCount,60);
 assert.equal(value.activePageCount,64);
 assert.deepEqual(value.main,{rootFrames:10,frameDomain:'sprite-315',sourceFrames:882,
  authoredStops:[435,573,700,817,860,879]});
 assert.deepEqual(value.helpBoxes,[{spriteId:111,mainStop:700,releaseFrame:15,resetFrame:20},
  {spriteId:118,mainStop:817,releaseFrame:21,resetFrame:27}]);
 assert.equal(value.historicalHostAssociationEstablished,false);
 assert.equal(value.historicalGlossaryBankAssociationEstablished,false);
 assert.equal(value.sourceOccurrences.length,7);
 assert.deepEqual(new Set(value.sourceOccurrences.map(item=>item.id)),
  new Set(P061_SOURCE_BUTTON_OCCURRENCES.map(item=>item.id)));
 for(const item of value.sourceOccurrences){
  const actual=P061_SOURCE_BUTTON_OCCURRENCES.find(row=>row.id===item.id);
  assert.equal(item.entry,actual.entryId);
  assert.equal(item.key,actual.sourceKeyAttribute);
  assert.equal(item.at,actual.spriteId===111?'picture':actual.spriteId===314?'hint':'later-main');
 }
 for(const [group,count] of Object.entries(groups))
  assert.equal(value.sourceOccurrences.filter(item=>item.at===group).length,count);
 assert.equal(value.sourceOccurrences.filter(item=>item.at==='initial').length,0);
 assert.equal(Object.keys(value.audioDomains).length,11);
 for(const [id,expected] of Object.entries(value.audioDomains)){
  const actual=P061_AUDIO_DOMAINS[id];assert.ok(actual);
  assert.deepEqual({bytes:actual.bytes,sha256:actual.sha256,samples:actual.decodedSamples,
   channels:actual.channels,sampleRate:actual.sampleRate},
   {...expected,sampleRate:22050});
 }
 assert.equal(value.audioDomains['sprite-284'].channels,2);
 assert.deepEqual(value.applicableFeedback,
  ['sprite-134','sprite-146','sprite-174','sprite-284','sprite-226','sprite-205','sprite-252']);
 assert.match(value.branchPolicy,/first wrong 134, second wrong 146, wrong then right 252/u);
 assert.match(value.branchPolicy,/historical host binding is unproved/u);
 assert.equal(value.cases.length,6);
 assert.deepEqual(new Set(value.cases.map(item=>item.locale)),new Set(['en','es']));
 assert.ok(value.inputPaths.includes('packages/demos/src/nms-l02-p061-session-v1.ts'));
 assert.ok(value.inputPaths.includes('apps/web/lib/nms-l02-p061-assets.server.ts'));
 assert.ok(value.inputPaths.includes('output/nms-l02-p061-source-20260927/audio-raw-index.json'));
 assert.ok(value.inputPaths.includes('packages/demos/src/generated/nms-l02-p061-audio-v1.ts'));
});

test('P061 browser probe permits only a plan or one unique local run slug',()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','candidate-v1']),{mode:'run',slug:'candidate-v1'});
 for(const argv of [[],['--run'],['--run','../escape'],['--run','a/b'],['--run','ABC'],
  ['--run','candidate-v1','--base-url','http://example.com'],['--plan','extra']])
  assert.throws(()=>parseArgs(argv));
});
