import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,run} from './prepare-alg-l06-p024-native-text-v1.mjs';

test('P024 source text report is reproducible from the physical SWF and pinned XML/AS/P-code',()=>{
 const result=run('--check');
 assert.deepEqual(result.inventory,{staticTextDefinitions:40,dynamicFields:3,
  decodedRuns:54,textInstances:77,mainAndFeedbackDomains:8,popupDomains:3});
 const report=JSON.parse(readFileSync('output/alg-l06-p024-native-text-v1/text-state-source-v1.json'));
 assert.equal(report.textDefinitions.length,43);
 assert.equal(report.textDefinitions.filter(row=>row.kind==='dynamic-field').length,3);
 assert.equal(report.textDefinitions.reduce((n,row)=>n+row.runs.length,0),54);
 assert.equal(report.textInstances.length,77);
 assert.deepEqual(report.masks.map(row=>[row.domainId,row.firstFrame,row.depth,row.clipDepth]),
  [['sprite-208',67,11,18],['sprite-208',124,19,24],['sprite-123',2,1,7]]);
 assert(report.inputs.some(row=>row.path.endsWith('/source.xml')));
 assert.equal(report.inputs.filter(row=>row.path.endsWith('.pcode')).length,5);
 assert.equal(report.inputs.filter(row=>row.path.endsWith('.as')).length,5);
 assert.equal(report.policy.translatedSpanishSourceAbsent,true);
 assert.equal(report.policy.originalRuntimeObserved,false);
});

test('answers, table, glossary and WrongFeed are source exact and conservatively gated',()=>{
 const report=JSON.parse(readFileSync('output/alg-l06-p024-native-text-v1/text-state-source-v1.json'));
 assert.deepEqual(report.table.sourceOrder.map(row=>[row.input,row.output]),
  [['1','–1'],['10','0'],['100','1']]);
 assert.deepEqual(report.answers.map(row=>[row.label,row.value,row.buttonDepth,row.verdict]),
  [['A','{0, 10, 100}',145,'wrong'],['B','0, 10, 100',149,'wrong'],
   ['C','{–1, 0, 1}  ',143,'right'],['D','–1, 0, 1',147,'wrong']]);
 assert.deepEqual(report.glossary.map(row=>[row.key,row.candidateAlphaReadyFrame]),
  [['Range',7],['Function',7],['Output',7],['Set',7],['Function table',null]]);
 assert(report.glossary.every(row=>row.interactionAvailable===false));
 assert.deepEqual(report.wrongFeedbackMessages.map(row=>
  [row.buttonCharacterId,row.afterFirstWrong,row.firstWrong]),[
   [198,'The range is the set of outputs.',
    'The range is the set of outputs. Try again.'],
   [199,'Since the range is a set, you must put braces around it.',
    'Since the range is a set, you must put braces around it. Try again.']]);
});

test('wrong physical source fails before producing the native companion',()=>{
 const intake=readFileSync('output/alg-l06-p024-intake-recon-v1/intake-recon-v1.json');
 const behavior=readFileSync('output/alg-l06-p024-behavior-audit-v1/behavior-audit-v1.json');
 const scope=readFileSync('output/alg-l06-p024-button-scope-review-v1/button-scope-review-v1.json');
 const xml=readFileSync('output/alg-l06-p024-intake-recon-v1/source.xml');
 const script=readFileSync('scripts/prepare-alg-l06-p024-native-text-v1.mjs');
 assert.throws(()=>build(Buffer.alloc(462836),intake,behavior,scope,xml,script));
});
