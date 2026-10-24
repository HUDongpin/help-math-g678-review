import fs from 'node:fs';
import assert from 'node:assert/strict';
const B='migrations/shared-alg001-l07-p049',data=JSON.parse(fs.readFileSync(B+'/native-v1/visual-model-v1.json'));
assert.equal(data.mainFrameCount,408);assert.equal(data.mainSpriteId,243);assert.equal(data.clocks.length,3);assert.equal(data.correctAnswer,2);assert.equal(data.answers[1].instance,'AnsBtn4');
const out=fs.readFileSync(B+'/generator-v1/product-source-types-v1.txt','utf8')+'export const ALG_L07_P049_SOURCE: P049Model = '+JSON.stringify(data)+';\n';
const p='packages/demos/src/alg-l07-p049-source-v1.ts';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out,{flag:'wx'});
console.log(JSON.stringify({pass:true,bytes:Buffer.byteLength(out)}));
