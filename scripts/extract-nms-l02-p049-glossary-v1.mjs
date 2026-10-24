#!/usr/bin/env node
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {resolveSourceGlossary,decodeGlossaryText} from './build-g678-alg-l11-instructional-successor-glossary.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const RECOVERY='/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1';
const SOURCES={en:{path:'objects/sha256/14/14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b',bytes:345838,sha256:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b',reference:'HELP_KEYTERMS/KT/XML/L1KTE01.xml',assetId:'G678L1KTE01.xml'},es:{path:'objects/sha256/3b/3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407',bytes:344456,sha256:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407',reference:'HELP_KEYTERMS/KT/XML/L1KTS01.xml',assetId:'G678L1KTS01.xml'}};
const digest=b=>createHash('sha256').update(b).digest('hex');
assert.equal(digest(await readFile(path.join(ROOT,'scripts/build-g678-alg-l11-instructional-successor-glossary.mjs'))),'25c9aa4c25a4bc84539b080cebb8dfcbaee5f57189531c6798be14e87ac09d59','source parser drift');
const xml={},source={};
for(const [lang,pin] of Object.entries(SOURCES)){
 const file=path.join(RECOVERY,pin.path);assert.equal(await realpath(file),file);
 const before=await lstat(file,{bigint:true}),bytes=await readFile(file),after=await lstat(file,{bigint:true});assert(before.isFile()&&before.nlink===1n);
 for(const key of ['dev','ino','size','mode','mtimeNs','nlink'])assert.equal(before[key],after[key]);assert.equal(bytes.length,pin.bytes);assert.equal(digest(bytes),pin.sha256);
 xml[lang]=bytes.toString('utf8');source[lang]={assetId:pin.assetId,path:pin.reference,sha256:pin.sha256};
}
const entries=resolveSourceGlossary(xml,['Decimal','Fraction','Whole','Power','Equivalent','Place value','Tenth'],source);
const alias={};
for(const lang of ['en','es']){
 const matches=[...xml[lang].matchAll(/<Hundredth~LNG~Centésimo\s+([^>]*)>([\s\S]*?)<\/Hundredth~LNG~Centésimo\s*>/gu)];
 assert.equal(matches.length,1);const m=matches[0];assert.equal(/ScreenkeyTerm="([^"]*)"/.exec(m[1])?.[1],'Hundredths');const definitions=m[2].split('~LNG~');assert.equal(definitions.length,2);
 alias[lang]={definitions:{en:decodeGlossaryText(definitions[0]),es:decodeGlossaryText(definitions[1])},sha256:digest(Buffer.from(m[0]))};
}
assert.deepEqual(alias.en.definitions,alias.es.definitions);
entries.push({id:'hundredth',sourceKeyAttribute:'Hundredths',requestedSourceKey:'Hundredth',labels:{en:'Hundredth',es:'Centésimo'},definitions:alias.en.definitions,source,sourceEntrySha256:{en:alias.en.sha256,es:alias.es.sha256},aliasDecision:'Exact source button singular maps to unique bilingual index entry with plural ScreenkeyTerm and singular element label. Original XML unchanged; original host lookup not verified.'});
entries.sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(entries.map(e=>e.id),['decimal','equivalent','fraction','hundredth','place-value','power','tenth','whole']);
const output=path.join(ROOT,'migrations/shared-nms002-l02-p049/audit/source-glossary-v1.json');
const value=JSON.stringify({animationId:'shared-nms002-l02-p049',entries,originalHostLookupVerified:false,companionMediaVerified:false},null,2)+'\n';
if(process.argv.includes('--write'))await writeFile(output,value,{flag:'wx'});else assert.equal(await readFile(output,'utf8'),value);
console.log(JSON.stringify({status:'PASS',entries:entries.map(e=>e.id),sha256:digest(Buffer.from(value))}));
