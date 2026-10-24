import fs from 'node:fs';
import assert from 'node:assert/strict';
const B='migrations/shared-alg001-l07-p047';
const data=JSON.parse(fs.readFileSync(B+'/native-v1/visual-model-v1.json'));
assert.equal(data.mainFrameCount,926);
assert.equal(data.mainSpriteId,447);
assert.equal(data.clocks.length,3);
assert.equal(data.correctAnswer,2);
assert.deepEqual(data.answers.map(a=>[a.letter,a.valueKind,a.amount,a.display]),[
 ['A','currency-rate','0.09','$0.09 per minute'],['B','currency-rate','0.10','$0.10 per minute'],
 ['C','currency-rate','0.12','$0.12 per minute'],['D','currency-rate','0.25','$0.25 per minute'],
]);
const out=fs.readFileSync(B+'/generator-v1/product-source-types-v1.txt','utf8')+
 'export const ALG_L07_P047_SOURCE: P047Model = '+JSON.stringify(data)+';\n';
const p='packages/demos/src/alg-l07-p047-source-v1.ts';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);
else fs.writeFileSync(p,out,{flag:'wx'});
console.log(JSON.stringify({pass:true,bytes:Buffer.byteLength(out)}));
