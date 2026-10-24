import fs from 'node:fs';
import {resolveSourceGlossary} from '../../../scripts/build-g678-alg-l11-instructional-successor-glossary.mjs';
import {readPin} from '../../../lib/g678-admission-proof.mjs';
import {DICTIONARY_ROOT,DICTIONARY_EN,DICTIONARY_ES} from '../../../lib/alg-l06-p025-admission-semantics-v1.mjs';
const source={en:{assetId:'G678L1KTE01.xml',path:DICTIONARY_ROOT+'/'+DICTIONARY_EN.path,sha256:DICTIONARY_EN.sha256},
 es:{assetId:'G678L1KTS01.xml',path:DICTIONARY_ROOT+'/'+DICTIONARY_ES.path,sha256:DICTIONARY_ES.sha256}};
const keys=['Value','Function','Input','Output','Table','Pattern','Relation','Evaluate','Substitute','Equation','Solve'];
const all=resolveSourceGlossary({en:readPin(DICTIONARY_ROOT,DICTIONARY_EN).toString(),es:readPin(DICTIONARY_ROOT,DICTIONARY_ES).toString()},keys,source);
const entries=keys.map(key=>{const rows=all.filter(row=>row.sourceKeyAttribute.toLowerCase()===key.toLowerCase());
 if(rows.length!==1)throw Error('P056_AMBIGUOUS_GLOSSARY '+key);const row=rows[0];
 return {...row,dictionaryKeyAttribute:row.sourceKeyAttribute,sourceKeyAttribute:key,
 caseBinding:row.sourceKeyAttribute===key?'exact':'unique-case-insensitive-source-dictionary-match'};});
const out=new URL('../native-v1/eleven-term-crosswalk-v1.json',import.meta.url),raw=JSON.stringify({kind:'p056-eleven-source-glossary-v1',entries},null,2)+'\n';
if(process.argv[2]==='--write')fs.writeFileSync(out,raw,{flag:'wx'});
else if(process.argv[2]!=='--check'||fs.readFileSync(out,'utf8')!==raw)throw Error('P056_GLOSSARY_MODE_OR_DRIFT');
console.log({entries:entries.map(e=>[e.sourceKeyAttribute,e.id,e.labels.es])});
