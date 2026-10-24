import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {auditP004Equation} from './audit-alg-l06-p004-equation-v1.mjs';
const swf=readFileSync('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf');
const audit=readFileSync(new URL('../migrations/shared-alg001-l06-p004/audit/source-text-v1.json',import.meta.url));
test('glyph advances place x inside the exact price-to-variable gap across unchanged93..831 instances',()=>{
 const result=auditP004Equation(swf,audit);
 assert.deepEqual(result.geometry.gapMainTwips,[-449,-89]);
 assert.deepEqual(result.geometry.operatorAdvanceMainTwips,[-375,-175]);
 assert.equal(result.geometry.baselineDifferenceTwips,-33);
 assert.equal(result.geometry.baselineDifferencePixels,-1.65);
 assert.deepEqual(result.objects.map(o=>o.instanceId),['sprite-95/depth-80/generation-5','sprite-95/depth-81/generation-2']);
 assert.equal(result.objects[0].glyphs[12].character,'C');assert.equal(result.objects[0].glyphs[8].character,'0');
 assert.deepEqual(result.semanticDecision.range,[93,831]);assert.equal(result.semanticDecision.semanticMath,'M = $0.50 × C');
 assert.equal(result.initialFrames.semanticMath,null);assert.deepEqual(result.initialFrames.range,[1,92]);
 assert.deepEqual(result,JSON.parse(readFileSync(new URL('../migrations/shared-alg001-l06-p004/audit/equation-geometry-v1.json',import.meta.url))));
});
test('changed source or source audit fails closed before geometry can authorize semantics',()=>{
 const changed=Buffer.from(swf);changed[changed.length-1]^=1;
 assert.throws(()=>auditP004Equation(changed,audit),/exact source SWF/);
 const changedAudit=JSON.parse(audit);changedAudit.textDefinitions.find(d=>d.characterId===39).runs[0].text='+';
 assert.throws(()=>auditP004Equation(swf,Buffer.from(JSON.stringify(changedAudit))),/exact source catalog bytes/);
});
