import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeGlossaryText,resolveSourceGlossary} from './resolve-nms-l02-p014-source-glossary-v1.mjs';
import {decodeGlossaryText as frozenDecoder} from './build-g678-alg-l11-instructional-successor-glossary.mjs';
test('the exact one-half source entity is decoded without changing the frozen predecessor',()=>{
 assert.equal(decodeGlossaryText('fraction &#x00BD;.'),'fraction ½.');
 assert.throws(()=>frozenDecoder('&#x00BD;'),/unsupported source entity/);
 for(const entity of ['&#xFFFF;','&#189;','&unknown;'])assert.throws(()=>decodeGlossaryText(entity),/unsupported source entity/);
});
test('case aliases retain original entry spelling and reject ambiguity or translation drift',()=>{
 const row='<Equivalent~decimal~LNG~Decimal~equivalente ScreenkeyTerm="Equivalent Decimal" ExFileName="Equivalent_decimal.swf">Fraction &#x00BD;.~LNG~Fracción 1/2.</Equivalent~decimal~LNG~Decimal~equivalente>';
 const source={en:{sha256:'test-en'},es:{sha256:'test-es'}},[entry]=resolveSourceGlossary({en:row,es:row},['Equivalent decimal'],source);
 assert.equal(entry.id,'equivalent-decimal');assert.equal(entry.sourceKeyAttribute,'Equivalent Decimal');assert.equal(entry.definitions.en,'Fraction ½.');
 assert.throws(()=>resolveSourceGlossary({en:row+row,es:row},['Equivalent decimal'],source),/ambiguous/);
 assert.throws(()=>resolveSourceGlossary({en:row,es:row.replace('Fracción','Otra')},['Equivalent decimal'],source),/disagreement/);
});
