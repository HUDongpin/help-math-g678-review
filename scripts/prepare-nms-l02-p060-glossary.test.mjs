import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {buildP060Glossary,extractP060Bank,extractP060Occurrences,
 prepareP060Glossary} from './prepare-nms-l02-p060-glossary.mjs';

const BANK_ROOT='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const en=fs.readFileSync(`${BANK_ROOT}/L1KTE01.xml`,'utf8');
const es=fs.readFileSync(`${BANK_ROOT}/L1KTS01.xml`,'utf8');
const xml=fs.readFileSync('output/nms-l02-p060-source-20260927/extraction/swfmill.xml','utf8');

test('eight authored source keys select complete bilingual entries by parsed host label',()=>{
 const a=extractP060Bank(en),b=extractP060Bank(es);
 assert.equal(a.length,8);
 assert.deepEqual(a.map(row=>row.sourceKeyAttribute),[
  'Decimal fraction','Equivalent','Fraction','Decimal','Grid','Part','Value','Represent']);
 for(let index=0;index<a.length;index++){
  const {rawEntry:_,...left}=a[index],{rawEntry:__,...right}=b[index];
  assert.deepEqual(left,right);
  assert.match(a[index].rawEntry.sha256,/^[0-9a-f]{64}$/u);
  assert.match(b[index].rawEntry.sha256,/^[0-9a-f]{64}$/u);
  assert(a[index].definitions.en&&a[index].definitions.es);
 }
 assert.equal(a[0].hostLookupLabel,'Decimal fraction');
 assert.equal(a[0].screenkeyTermAttribute,'Decimal Fraction');
 assert.equal(a[0].labels.es,'Fracción decimal');
 assert.equal(a[0].definitions.en,b[0].definitions.en);
});

test('missing, duplicate and malformed parsed labels fail closed despite ScreenkeyTerm text',()=>{
 const changedLabel=en.replaceAll('Decimal~fraction~LNG~Fracción~decimal',
  'Different~label~LNG~Fracción~decimal');
 assert.throws(()=>extractP060Bank(changedLabel),/unique parsed English opening label/u);
 const duplicateLabel=en.replace('<Decimal~point~LNG~Punto~decimal',
  '<Decimal~fraction~LNG~Fracción~decimal');
 assert.throws(()=>extractP060Bank(duplicateLabel),/unique parsed English opening label/u);
 const malformed=en.replace('</Decimal~fraction~LNG~Fracción~decimal>','</Unrelated>');
 assert.throws(()=>extractP060Bank(malformed),/exact complete parsed English label/u);
 assert.throws(()=>extractP060Bank(en.replace('ScreenkeyTerm="Decimal Fraction"',
  'ScreenkeyTerm="Different"')),/ScreenkeyTerm is recorded/u);
});

test('16 source placements preserve nested box and popup visibility conditions',()=>{
 const occurrences=extractP060Occurrences(xml);
 assert.equal(occurrences.length,16);
 assert.deepEqual(occurrences.filter(x=>x.spriteId===139).map(x=>x.sourceKeyAttribute),
  ['Decimal','Grid','Part','Part']);
 assert.deepEqual(occurrences.filter(x=>x.spriteId===388).map(x=>x.sourceKeyAttribute),
  ['Fraction','Value','Decimal','Equivalent','Represent']);
 assert.deepEqual(occurrences.filter(x=>x.spriteId===391&&x.firstPlacedFrame===528)
  .map(x=>x.sourceKeyAttribute),['Decimal','Grid','Part','Part']);
 assert(occurrences.every(x=>x.lastFrameExclusive>x.firstPlacedFrame&&x.sourcePlacementOnly));
 assert.throws(()=>extractP060Occurrences(xml.replace('frames="721"','frames="720"')),
  /pinned source sprite/u);
});

test('source/host/bank byte pins and conditional status survive generation',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT;
 const result=buildP060Glossary();
 assert.equal(result.actions.length,8);assert.equal(result.terms.length,8);
 assert.equal(result.occurrences.length,16);
 assert.equal(result.historicalHostAssociationEstablished,false);
 assert.equal(result.originalL2XmlResolved,false);
 assert.equal(result.originalRuntimeLookupVerified,false);
 assert.equal(result.modernSelectionByScreenkeyTerm,false);
 assert.equal(result.conditionalModernLabelResolutionReviewed,true);
 assert.equal(result.terms[0].hostLookup.key,'decimal fraction');
 assert.equal(result.terms[0].hostLookup.screenkeyTermUsedForSelection,false);
 assert.equal(result.registrationEffect,false);assert.equal(result.acceptanceEffect,false);
});

test('generated JSON, TS and receipt round-trip against current physical inputs',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT;
 const result=prepareP060Glossary(true);
 assert.equal(result.status,'P060_GLOSSARY_CHECKED');
 assert.equal(result.outputs.length,3);
});
