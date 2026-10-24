import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {extractP057Bank,generateP057Glossary} from './generate-nms-l02-p057-glossary-v1.mjs';

const banks='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const en=fs.readFileSync(`${banks}/L1KTE01.xml`,'utf8');
const es=fs.readFileSync(`${banks}/L1KTS01.xml`,'utf8');
test('exact source keys include the slash label and its differently named example file',()=>{
 const a=extractP057Bank(en),b=extractP057Bank(es);
 assert.equal(a.length,7);
 assert.deepEqual(a.map(({sourceEntrySha256,...term})=>term),b.map(({sourceEntrySha256,...term})=>term));
 const simple=a.find(term=>term.id==='simple-simpler-simplest');
 assert.equal(simple.sourceKeyAttribute,'Simple / Simpler / Simplest');
 assert.equal(simple.legacyCompanionReferences.exampleSwf,'Simple_simpler_simplest.swf');
 assert.match(simple.labels.es,/Más Simple/u);
});
test('missing, duplicated, or malformed selected source keys fail closed',()=>{
 assert.throws(()=>extractP057Bank(en.replace('ScreenkeyTerm="Solve"','ScreenkeyTerm="Unknown"')),/opening key/u);
 assert.throws(()=>extractP057Bank(en.replace('ScreenkeyTerm="Problem"','ScreenkeyTerm="Solve"')),/opening key/u);
 assert.throws(()=>extractP057Bank(en.replace('</Solve~LNG~Resolver>','</Wrong>')),/multiplicity/u);
 assert.throws(()=>extractP057Bank(en.replace('Simple_simpler_simplest.swf','Simple.swf')));
});
test('actual source and generated artifacts round-trip without writes or acceptance effects',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
 const result=generateP057Glossary(true);
 assert.equal(result.status,'P057_GLOSSARY_CHECKED');
 assert.equal(result.registrationEffect,false);assert.equal(result.acceptanceEffect,false);
});
