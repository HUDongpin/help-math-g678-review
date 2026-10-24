import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {buildP058Glossary,extractP058Bank,prepareP058Glossary} from './prepare-nms-l02-p058-glossary.mjs';

const banks='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const en=fs.readFileSync(`${banks}/L1KTE01.xml`,'utf8');
const es=fs.readFileSync(`${banks}/L1KTS01.xml`,'utf8');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';

test('six exact ScreenkeyTerm rows align across real L1 banks while Show has a Spanish label collision',()=>{
 const a=extractP058Bank(en),b=extractP058Bank(es);
 assert.deepEqual(a.map(({sourceEntrySha256,...term})=>term),b.map(({sourceEntrySha256,...term})=>term));
 assert.deepEqual(a.map(row=>row.sourceKeyAttribute),
  ['Strategies','Equation','Pattern','Simple / Simpler / Simplest','Table','Show']);
 assert.equal(a.find(row=>row.id==='simple-simpler-simplest').legacyCompanionReferences.exampleSwf,
  'Simple_simpler_simplest.swf');
 const show=a.find(row=>row.id==='show');
 assert.deepEqual(show.spanishLabelCollisionWith,['Display']);
 assert.equal(show.labels.es,'Mostrar');
 assert.equal(show.legacyCompanionReferences.exampleSwf,'Show.swf');
});

test('missing, duplicated, or malformed selected source rows fail closed',()=>{
 assert.throws(()=>extractP058Bank(en.replace('ScreenkeyTerm="Show"','ScreenkeyTerm="Unknown"')),
  /opening key/u);
 assert.throws(()=>extractP058Bank(en.replace('ScreenkeyTerm="Equation"','ScreenkeyTerm="Strategies"')),
  /opening key/u);
 assert.throws(()=>extractP058Bank(en.replace('</Show~LNG~Mostrar>','</Wrong>')),
  /complete source key/u);
 assert.throws(()=>extractP058Bank(en.replace('Simple_simpler_simplest.swf','Simple.swf')),
  /source companion/u);
});

test('seven authored occurrences map to six conditional terms without changing acceptance',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
 const candidate=buildP058Glossary();
 assert.equal(candidate.actions.length,7);assert.equal(candidate.terms.length,6);
 assert.deepEqual(candidate.actions.filter(action=>action.entryId==='show').map(action=>({
  id:action.id,firstPlacedFrame:action.firstPlacedFrame,lastFrameExclusive:action.lastFrameExclusive})),[
  {id:'sprite-37/depth-41/generation-1',firstPlacedFrame:237,lastFrameExclusive:275},
  {id:'sprite-37/depth-45/generation-1',firstPlacedFrame:242,lastFrameExclusive:243},
 ]);
 assert.equal(candidate.originalL2XmlResolved,false);
 assert.equal(candidate.historicalHostAssociationEstablished,false);
 assert.equal(candidate.historicalSpanishLabelLookupResolved,false);
 assert.equal(candidate.originalRuntimeLookupVerified,false);
 assert.equal(candidate.registrationEffect,false);assert.equal(candidate.acceptanceEffect,false);
});

test('generated conditional bank and product terms round-trip against current source bytes',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
 const result=prepareP058Glossary(true);
 assert.equal(result.status,'P058_GLOSSARY_CHECKED');
 assert.equal(result.outputs.length,3);
 assert.equal(result.registrationEffect,false);assert.equal(result.acceptanceEffect,false);
});
