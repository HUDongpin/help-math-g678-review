import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {decodeGlossaryText,resolveSourceGlossary} from '../build-g678-alg-l11-instructional-successor-glossary.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
/** Bounded extension for the source square-root entity. Keep the prior resolver
 * and its registered consumers frozen; entry hashes always bind original XML. */
export function resolveSourceGlossaryWithRadical(xmlByLanguage,keys,source){
 const decoded=Object.fromEntries(Object.entries(xmlByLanguage).map(([l,s])=>[l,s.replaceAll('&#x221A;','√')]));
 const radical=keys.filter(k=>k.toLowerCase()==='square root');
 const entries=resolveSourceGlossary(decoded,keys.filter(k=>k.toLowerCase()!=='square root'),source);
 if(radical.length){
  const records=Object.fromEntries(['en','es'].map(lang=>{
   const rows=[...xmlByLanguage[lang].matchAll(/<([^\s>]+~LNG~[^\s>]+)\s+([^>]*)>([\s\S]*?)<\/\1\s*>/gu)]
    .filter(m=>m[2].match(/ScreenkeyTerm\s*=\s*"([^"]*)"/u)?.[1]==='Square Root');
   assert.equal(rows.length,1);return[lang,rows[0]];
  }));
  assert.equal(records.en[1],records.es[1]);
  const enParts=records.en[3].split('~LNG~'),esParts=records.es[3].split('~LNG~');
  assert.equal(enParts.length,2);assert.equal(esParts.length,2);
  assert.equal(decodeGlossaryText(enParts[1]),decodeGlossaryText(esParts[1]));
  assert.equal([...esParts[0]].filter(c=>c==='\x1a').length,2);
  const entry=resolveSourceGlossary({en:decoded.en,es:decoded.en},radical,source)[0];
  entry.sourceLanguageDisposition={en:'English definition from English dictionary',es:'Spanish definition from Spanish dictionary; identical to Spanish definition in English dictionary',unusedEnglishCopyInSpanishDictionary:{sha256:sha(esParts[0]),reason:'Two U+001A control characters and malformed radical text; preserved in original source, not used as English definition'}};
  entry.sourceEntrySha256.es=sha(records.es[0].replaceAll('&#x221A;','√'));
  entry.extractionLfNormalizedEntrySha256.es=sha(records.es[0].replaceAll('&#x221A;','√').replace(/\r\n?/gu,'\n'));
  entries.push(entry);
 }
 for(const entry of entries)for(const lang of ['en','es']){
  const records=[...xmlByLanguage[lang].matchAll(/<([^\s>]+~LNG~[^\s>]+)\s+([^>]*)>([\s\S]*?)<\/\1\s*>/gu)]
   .filter(m=>m[2].match(/ScreenkeyTerm\s*=\s*"([^"]*)"/u)?.[1]===entry.sourceKeyAttribute);
  assert.equal(records.length,1);const raw=records[0][0],mapped=raw.replaceAll('&#x221A;','√');
  assert.equal(sha(mapped),entry.sourceEntrySha256[lang]);
  assert.equal(sha(mapped.replace(/\r\n?/gu,'\n')),entry.extractionLfNormalizedEntrySha256[lang]);
  entry.sourceEntrySha256[lang]=sha(raw);
  entry.extractionLfNormalizedEntrySha256[lang]=sha(raw.replace(/\r\n?/gu,'\n'));
 }
 return entries.sort((a,b)=>a.sourceKeyAttribute.toLowerCase().localeCompare(b.sourceKeyAttribute.toLowerCase()));
}
