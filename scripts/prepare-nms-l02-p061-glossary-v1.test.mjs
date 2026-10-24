import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {buildP061Glossary,extractP061Bank,extractP061Occurrences,
 prepareP061Glossary} from './prepare-nms-l02-p061-glossary-v1.mjs';

const bankRoot='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const en=fs.readFileSync(`${bankRoot}/L1KTE01.xml`,'utf8');
const es=fs.readFileSync(`${bankRoot}/L1KTS01.xml`,'utf8');
const xml=fs.readFileSync('output/nms-l02-p061-source-20260927/extraction/swfmill.xml','utf8');

test('six exact authored keys bind complete EN/ES parsed-label bank entries',()=>{
 const left=extractP061Bank(en),right=extractP061Bank(es);
 assert.deepEqual(left.map(row=>row.sourceKeyAttribute),[
  'Equivalent decimal','Express','Denominator','Percent','Equivalent fraction','Decimal fraction']);
 assert.equal(left.length,6);
 for(let i=0;i<left.length;i++){
  const {rawEntry:_,...a}=left[i],{rawEntry:__,...b}=right[i];
  assert.deepEqual(a,b);
  assert(a.definitions.en&&a.definitions.es);
  assert.match(left[i].rawEntry.sha256,/^[0-9a-f]{64}$/u);
 }
 assert.equal(left[0].screenkeyTermAttribute,'Equivalent Decimal');
 assert.equal(left[0].spanishLabelOpeningCount,2);
 assert.match(left[0].definitions.en,/½/u);
 assert.equal(left[5].screenkeyTermAttribute,'Decimal Fraction');
});

test('missing, duplicate and malformed parsed English labels fail closed',()=>{
 assert.throws(()=>extractP061Bank(en.replace('Equivalent~decimal~LNG~Decimal~equivalente',
  'Different~label~LNG~Decimal~equivalente')),/unique parsed English opening label/u);
 assert.throws(()=>extractP061Bank(en.replace('<Decimal~equivalent~LNG~Decimal~equivalente',
  '<Equivalent~decimal~LNG~Decimal~equivalente')),/unique parsed English opening label/u);
 assert.throws(()=>extractP061Bank(en.replace('</Express~LNG~Expresar>','</Unrelated>')),
  /exact complete parsed English label/u);
 assert.throws(()=>extractP061Bank(en.replace('ScreenkeyTerm="Equivalent Decimal"',
  'ScreenkeyTerm="Different"')),/ScreenkeyTerm is recorded/u);
});

test('seven placements retain nested box, hint popup and main visibility conditions',()=>{
 const occurrences=extractP061Occurrences(xml);
 assert.equal(occurrences.length,7);
 assert.deepEqual(occurrences.map(row=>[row.spriteId,row.characterId,row.firstPlacedFrame,row.lastFrameExclusive]),[
  [111,96,1,22],[314,303,1,2],[314,304,1,2],[314,305,1,2],
  [314,306,1,2],[314,307,1,2],[315,96,701,883]]);
 assert(occurrences.every(row=>row.sourcePlacementOnly&&row.lastFrameExclusive>row.firstPlacedFrame));
 assert.throws(()=>extractP061Occurrences(xml.replace('frames="882"','frames="881"')),
  /pinned source sprite/u);
});

test('source and host pins remain conditional; generated outputs check without drift',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
 const result=buildP061Glossary();
 assert.equal(result.actions.length,6);
 assert.equal(result.terms.length,6);
 assert.equal(result.occurrences.length,7);
 assert.equal(result.originalL2XmlResolved,false);
 assert.equal(result.historicalHostAssociationEstablished,false);
 assert.equal(result.originalRuntimeLookupVerified,false);
 assert.equal(result.modernSelectionByScreenkeyTerm,false);
 assert.equal(result.terms[0].hostLookup.key,'equivalent decimal');
 assert.equal(result.terms[0].hostLookup.screenkeyTermUsedForSelection,false);
 assert.equal(result.registrationEffect,false);
 assert.equal(result.acceptanceEffect,false);
 assert.equal(prepareP061Glossary(true).outputs.length,3);
});
