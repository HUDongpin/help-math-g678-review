import fs from'node:fs';import assert from'node:assert/strict';
const B="migrations/shared-alg001-l07-p042",c=JSON.parse(fs.readFileSync(B+'/generator-v1/source-config-v1.json')),data=JSON.parse(fs.readFileSync(B+'/native-v1/'+c.productModelFile));assert.equal(data.mainFrameCount,513);assert.equal(data.clocks.length,3);
const out=fs.readFileSync(B+'/generator-v1/product-source-types-v1.txt','utf8')+'export const ALG_L07_P042_SOURCE: P042Model = '+JSON.stringify(data)+';\n',p='packages/demos/src/alg-l07-p042-source-v1.ts';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out,{flag:'wx'});console.log(JSON.stringify({pass:true,bytes:Buffer.byteLength(out)}));
