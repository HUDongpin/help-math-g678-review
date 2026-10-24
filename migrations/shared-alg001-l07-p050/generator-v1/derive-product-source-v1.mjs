import fs from 'node:fs';
import assert from 'node:assert/strict';
const B='migrations/shared-alg001-l07-p050',data=JSON.parse(fs.readFileSync(B+'/native-v1/visual-model-v1.json'));
assert.equal(data.mainFrameCount,572);assert.equal(data.mainSpriteId,345);assert.equal(data.clocks.length,3);assert.equal(data.correctAnswer,3);assert.equal(data.answers[2].instance,'AnsBtn2');assert.equal(data.answers[0].display,'3.1432');assert.equal(data.table.rows[3].output,null);
const out=fs.readFileSync(B+'/generator-v1/product-source-types-v1.txt','utf8')+'export const ALG_L07_P050_SOURCE: P050Model = '+JSON.stringify(data)+';\n';
const p='packages/demos/src/alg-l07-p050-source-v1.ts';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out,{flag:'wx'});
console.log(JSON.stringify({pass:true,bytes:Buffer.byteLength(out)}));
