import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {P050_TEXT_BINDING} from '../packages/demos/src/nms-l02-p050-text-snapshot-v1';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
const audit='migrations/shared-nms002-l02-p050/audit/';
const hash=(value:any)=>createHash('sha256').update(value).digest('hex');
const read=(name:string)=>JSON.parse(readFileSync(audit+name,'utf8'));
const bytes=readFileSync(audit+'source-input.swf');assert.equal(hash(bytes),P050_TEXT_BINDING.sourceSwfSha256);
const source=collectSwfTextSourceCatalog(bytes);assert.deepEqual(source,read('structural-intake-v1.json'));
const shapeRoles=read('shape-role-disposition-v1.json');assert.equal(shapeRoles.rows.length,32);
const title=source.shapeDefinitions.find((shape:any)=>shape.characterId===38);assert.ok(title);
const treatments:Record<string,string>={
 'shape-text-unclassified':'All32shape roles audited; outlined title38 associated with text37; transparent target geometry67/72 preserved semantically and zeroheight underline47 retained as semantic links.',
 'button-runtime-state-and-actions-not-interpreted':'Source button and clip actions audited. Five exact-identity drops, help/feedback close and main/help glossary calls mapped to maintained state and modal controls; real browser and host checks recorded.',
 'actionscript-visibility-and-values-not-interpreted':'208intro frames derived from source display state; practice209 and retained210..260 objects audited. Native one-shot260hold and duplicate Right_Feed collapse are explicit adaptations; no original-runtime parity claimed.'
};
assert.deepEqual(Object.keys(treatments).sort(),source.risks.map((risk:any)=>risk.kind).sort());
const blocks=P050_TEXT_BINDING.blocks.flatMap(block=>['en','es'].map(language=>({...block,id:block.id+(language==='es'?'-es':''),language,runtimeBlockId:block.id})));
const prepared={...P050_TEXT_BINDING,blocks,sourceRelativePath:'G6-G8-shared/NMS002/L2/TI/L2TI09.swf',sourceCatalogContentSha256:hash(JSON.stringify(source)),sourceRoleDecisions:[{kind:'outlined-text',role:'title',semanticValue:'Fractions, Decimals, and Percent Concepts: Try It!',sourceShapeHashes:[{characterId:38,sourceTagSha256:title.sourceTagSha256}],decision:'Source text37 and outlined title38 represented by semantic English and maintained Spanish translation.'}],localeInventoryPolicy:`${blocks.length} EN/ES variants map to ${P050_TEXT_BINDING.blocks.length} maintained roles; source English and separately pinned bilingual glossary.`,preparationOnly:true,sourceRiskTreatments:treatments,implementation:{files:[]},unresolved:['Final static DOM/text equivalence','Production negative build and source payload isolation','Final implementation/evidence pins and admission'],independentPending:['Original runtime','Fidelity','Named listening','Human/Owner','Strict completion','Publication']};
writeFileSync('catalog/typography-v1/g678-page-bindings/shared-nms002-l02-p050.prepared-v1.json',JSON.stringify(prepared,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'PASS-preparation-only',sourceDefinitions:25,nativeRoles:P050_TEXT_BINDING.blocks.length,bilingualBlocks:blocks.length,risks:Object.keys(treatments).length}));
