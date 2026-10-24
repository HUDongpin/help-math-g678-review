#!/usr/bin/env node
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveSourceGlossary} from './build-g678-alg-l11-instructional-successor-glossary.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const WORK='migrations/shared-alg001-l06-p004';
const DICT='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const hash=b=>createHash('sha256').update(b).digest('hex');
function read(file,sha,bytes){
 const absolute=path.isAbsolute(file)?file:path.join(ROOT,file);
 assert.equal(fs.realpathSync(absolute),absolute);
 const before=fs.lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&before.nlink===1n);
 const data=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])assert.equal(before[key],after[key]);
 if(sha)assert.equal(hash(data),sha);
 if(bytes!==undefined)assert.equal(data.length,bytes);
 return {path:file,bytes:data.length,sha256:hash(data),data};
}
const identity=({data,...pin})=>pin;
export function buildP004Glossary(){
 const parser=read('scripts/build-g678-alg-l11-instructional-successor-glossary.mjs','25c9aa4c25a4bc84539b080cebb8dfcbaee5f57189531c6798be14e87ac09d59');
 const swf=read('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf','514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e',1115626);
 const geometry=read(`${WORK}/audit/button-geometry-v1.json`,'9c0828219194322961a118fbe44274ef70a78335edc036d17e518ccbb77eee49');
 const occurrences=JSON.parse(geometry.data).occurrences;
 assert.equal(occurrences.length,9);
 const pairs=[[57,'Input'],[59,'Output'],[79,'Function'],[80,'Relation'],[81,'Value'],[84,'Rule'],[85,'Input'],[86,'output']];
 const buttonSources=pairs.map(([buttonId,key])=>{
  const pin=read(`output/alg-l06-p004-source-triage-20260928/ffdec/scripts/DefineButton2_${buttonId}/BUTTONCONDACTION on(release).as`);
  assert.equal(pin.data.toString().replace(/\s+/g,' '),`on(release){ _global.KeyAttribute = "${key}"; _root.DoHyperLinks(); _root.animation_mc.animation.stop(); } `);
  assert(occurrences.some(row=>row.buttonId===buttonId&&row.keyAttribute===key));
  return {...identity(pin),buttonId,keyAttribute:key};
 });
 const pins={en:read(`${DICT}/L1KTE01.xml`,'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b',345838),es:read(`${DICT}/L1KTS01.xml`,'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407',344456)};
 const source=Object.fromEntries(Object.entries(pins).map(([lang,pin])=>[lang,{assetId:`G678L1KT${lang==='en'?'E':'S'}01.xml`,path:`HELP_KEYTERMS/KT/XML/L1KT${lang==='en'?'E':'S'}01.xml`,sha256:pin.sha256}]));
 const canonicalKeys=['Input','Output','Function','Relation','Value','Rule'];
 const resolved=resolveSourceGlossary({en:pins.en.data.toString(),es:pins.es.data.toString()},canonicalKeys,source);
 assert.equal(resolved.length,6);
 // The shared extractor can normalize; this page accepts only the six exact keys.
 assert.deepEqual(new Set(resolved.map(row=>row.sourceKeyAttribute)),new Set(canonicalKeys));
 const entries=[...new Set(pairs.map(([,key])=>key))].map(key=>{
  const target=key==='output'?'Output':key;
  const matches=resolved.filter(row=>row.sourceKeyAttribute===target);assert.equal(matches.length,1);
  return {...matches[0],sourceKeyAttribute:key,canonicalDictionaryKey:target,
   lookup:{kind:key===target?'exact-literal':'explicit-case-crosswalk',from:key,to:target,genericCaseNormalizationAllowed:false},
   buttonIds:pairs.filter(([,k])=>k===key).map(([id])=>id),
   occurrenceIds:occurrences.filter(row=>row.keyAttribute===key).map(row=>row.occurrenceId)};
 });
 assert.equal(entries.length,7);assert.equal(entries.flatMap(row=>row.occurrenceIds).length,9);
 const host=read('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/frame_35/DoAction.as','380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74',104008);
 const start=host.data.toString().indexOf('function DoHyperLinks()');
 const end=host.data.toString().indexOf('function doGetSwfFileName',start);
 assert(start>=0&&end>start);const functionText=host.data.toString().slice(start,end);
 for(const fact of ['dtfKTLesson.text.toUpperCase() != "OFF"','_loc2_.Pause = true;','_loc2_.Play = false;','_loc2_.KeyAttribute += "~English";','_loc1_.m_c.doGetSubLink(_loc2_.KeyAttribute);'])assert(functionText.includes(fact));
 return {schemaVersion:1,kind:'alg-l06-p004-source-glossary-v1',animationId:'shared-alg001-l06-p004',
  sourceSwf:identity(swf),parser:identity(parser),geometry:identity(geometry),buttonSources,
  dictionaries:Object.fromEntries(Object.entries(pins).map(([lang,pin])=>[lang,identity(pin)])),entries,
  host:{source:identity(host),functionName:'DoHyperLinks',functionSha256:hash(Buffer.from(functionText)),
   facts:['conditional on lesson keyterms not OFF','sets main pause state','appends ~English to authored key','opens glossary sublink'],
   scope:'retained static source algorithm; actual host launch and lowercase lookup unobserved'},
  modernDecisions:['exact authored button key preserved','output explicitly mapped to unique Output dictionary entry','bilingual text available from matching EN/ES dictionaries','close keeps paused state until explicit resume'],
  limits:['no companion SWF/audio imported','no original host execution proof','no original runtime or listening acceptance','not a registered page']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));
 const bytes=Buffer.from(JSON.stringify(buildP004Glossary(),null,2)+'\n'),target=path.join(ROOT,WORK,'audit/source-glossary-v1.json');
 if(process.argv[2]==='--write')fs.writeFileSync(target,bytes,{flag:'wx'});
 else assert.deepEqual(fs.readFileSync(target),bytes);
 console.log(JSON.stringify({status:'source-glossary-verified-not-registered',entries:7,occurrences:9,bytes:bytes.length,sha256:hash(bytes)}));
}
