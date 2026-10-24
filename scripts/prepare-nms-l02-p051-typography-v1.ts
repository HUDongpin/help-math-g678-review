import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {P051_TEXT_BINDING} from '../packages/demos/src/nms-l02-p051-text-snapshot-v1';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const audit='migrations/shared-nms002-l02-p051/audit/';
const hash=(value:Buffer|string)=>createHash('sha256').update(value).digest('hex');
const read=(name:string)=>JSON.parse(readFileSync(audit+name,'utf8'));
const identity=read('source-identity-v1.json');
const bytes=readFileSync(identity.source.path);
assert.equal(bytes.length,identity.source.bytes);
assert.equal(hash(bytes),P051_TEXT_BINDING.sourceSwfSha256);
assert.deepEqual(bytes,readFileSync(audit+'source-input.swf'));
const source=collectSwfTextSourceCatalog(bytes);
assert.deepEqual(source,read('structural-intake-v1.json'));
const shapes=read('shape-role-disposition-v1.json');
const teaching=read('teaching-text-role-intake-v1.json');
const excluded=read('nonteaching-text-disposition-v1.json');
for(const evidence of [shapes,teaching,excluded])assert.equal(evidence.sourceSha256,source.sourceSha256);
assert.equal(shapes.definitions.length,133);
const textIds=[...teaching.definitions,...excluded.definitions].map((row:{characterId:number})=>row.characterId);
assert.equal(textIds.length,66);assert.equal(new Set(textIds).size,66);
assert.deepEqual([...textIds].sort((a,b)=>a-b),source.textDefinitions.map((x:{characterId:number})=>x.characterId).sort((a:number,b:number)=>a-b));
const title=source.shapeDefinitions.find((shape:{characterId:number})=>shape.characterId===54);assert.ok(title);
const blocks=P051_TEXT_BINDING.blocks.flatMap(block=>['en','es'].map(language=>({...block,id:block.id+(language==='es'?'-es':''),language,runtimeBlockId:block.id})));
const prepared={...P051_TEXT_BINDING,blocks,
 sourceRelativePath:'G6-G8-shared/NMS002/L2/TI/L2TI10.swf',sourceCatalogContentSha256:hash(JSON.stringify(source)),
 sourceRoleDecisions:[{kind:'outlined-text',role:'title',semanticValue:'Fractions, Decimals, and Percent Concepts: Try It!',sourceShapeHashes:[{characterId:54,sourceTagSha256:title.sourceTagSha256}],decision:'Source title text53 and outline54 are represented by semantic English and maintained Spanish translation.'}],
 localeInventoryPolicy:'108 EN/ES variants map to 54 runtime roles; ES teaching copy is a native translation, EN/ES glossary is source XML; selected narration remains English.',
 preparationOnly:true,implementation:{files:[]},
 sourceRiskEvidence:{
  'shape-text-unclassified':['shape-role-disposition-v1.json','teaching-text-role-intake-v1.json'],
  'bitmap-text-unclassified':['bitmap-visual-intake-v1.json','bitmap-reference-audit-v2.json'],
  'button-runtime-state-and-actions-not-interpreted':['drag-behavior-intake-v1.json','native-behavior-decisions-v1.json','source-glossary-v1.json'],
  'actionscript-visibility-and-values-not-interpreted':['native-behavior-decisions-v1.json','source-visual-spec-v1.json','nonteaching-text-disposition-v1.json'],
 },
 unresolved:['Actual registered My Lesson flow and responsive teaching focus','Complete DOM/text equivalence and lifecycle matrix','Production-negative build and source payload isolation','Final implementation and technical evidence pins'],
 independentPending:['Original runtime and unresolved outer alias','Fidelity','Named listening and decorative audio entry','Human/Owner','Strict completion','Publication'],
};
assert.deepEqual(Object.keys(prepared.sourceRiskEvidence).sort(),source.risks.map((risk:{kind:string})=>risk.kind).sort());
const output='catalog/typography-v1/g678-page-bindings/shared-nms002-l02-p051.prepared-v1.json';
const serialized=JSON.stringify(prepared,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(readFileSync(output,'utf8'),serialized);
else writeFileSync(output,serialized,{flag:'wx'});
console.log(JSON.stringify({status:'PASS-preparation-only',nativeRoles:54,bilingualBlocks:blocks.length,sourceTextDefinitions:textIds.length,shapeDefinitions:shapes.definitions.length,registered:false,technicalAcceptance:false}));
