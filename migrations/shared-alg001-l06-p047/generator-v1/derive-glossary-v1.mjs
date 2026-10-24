import fs from 'node:fs';
import {resolveSourceGlossary} from '../../../scripts/build-g678-alg-l11-instructional-successor-glossary.mjs';
import {readPin} from '../../../lib/g678-admission-proof.mjs';
import {DICTIONARY_ROOT,DICTIONARY_EN,DICTIONARY_ES} from '../../../lib/alg-l06-p025-admission-semantics-v1.mjs';
const source={en:{assetId:'G678L1KTE01.xml',path:DICTIONARY_ROOT+'/'+DICTIONARY_EN.path,sha256:DICTIONARY_EN.sha256},
 es:{assetId:'G678L1KTS01.xml',path:DICTIONARY_ROOT+'/'+DICTIONARY_ES.path,sha256:DICTIONARY_ES.sha256}};
const keys=['Input','Output','Point','Function','Table','Coordinate','X-coordinate','Y-coordinate'];
const dictionaryEntries=resolveSourceGlossary({en:readPin(DICTIONARY_ROOT,DICTIONARY_EN).toString(),es:readPin(DICTIONARY_ROOT,DICTIONARY_ES).toString()},keys,source);
const entries=keys.map(key=>{const rows=dictionaryEntries.filter(row=>row.sourceKeyAttribute.toLowerCase()===key.toLowerCase());if(rows.length!==1)throw Error('ambiguoussourcekey '+key);const row=rows[0];return {...row,dictionaryKeyAttribute:row.sourceKeyAttribute,sourceKeyAttribute:key,caseBinding:row.sourceKeyAttribute===key?'exact':'unique-case-insensitive-source-dictionary-match'};});
const output=new URL('../native-v1/eight-term-crosswalk-v1.json',import.meta.url);
const bytes=JSON.stringify({kind:'p047-eight-source-glossary-v1',entries},null,2)+'\n';
const mode=process.argv.slice(2);
if(mode.length!==1||!['--write','--check'].includes(mode[0]))throw Error('usage: --write | --check');
if(mode[0]==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
else if(fs.readFileSync(output,'utf8')!==bytes)throw Error('P047_GLOSSARY_DRIFT');
console.log({mode:mode[0],entries:entries.map(e=>[e.sourceKeyAttribute,e.id,e.labels.es])});
