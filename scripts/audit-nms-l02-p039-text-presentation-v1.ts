import{readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';import assert from'node:assert/strict';
import{P039_TEXT_BINDING}from'../packages/demos/src/nms-l02-p039-text-v1';
const raw=readFileSync(process.argv[2]);assert.equal(createHash('sha256').update(raw).digest('hex'),'afee7a2fa13b67694d609f7ed3828bebb5d7aceafe754f0c9160d39fb3aac5d7');const ir=JSON.parse(raw.toString());
const texts=new Set(ir.texts.map((t:{characterId:number})=>'character-'+t.characterId));const buttons=new Map(ir.buttons.map((b:{characterId:number})=>[String(b.characterId),b]));const seen=new Set<string>(),queue=['root'];
while(queue.length){const id=queue.pop()!;if(seen.has(id))continue;seen.add(id);if(ir.domains[id])queue.push(...ir.domains[id].frames.flatMap((f:Array<{characterId:number}>)=>f.map(x=>String(x.characterId))));const b=buttons.get(id)as {statePlacements:Array<{characterId:number}>}|undefined;if(b)queue.push(...b.statePlacements.map(x=>String(x.characterId)));}
for(const block of P039_TEXT_BINDING.blocks){for(const id of block.sourceTextIds){assert(texts.has(id));assert(seen.has(id.replace('character-','')));}for(const id of block.sourceShapeIds??[]){assert(ir.art[String(id)]?.kind==='shape');assert(seen.has(String(id)));}}
writeFileSync(process.argv[3],JSON.stringify({schemaVersion:1,animationId:'shared-nms002-l02-p039',sourceIrSha256:createHash('sha256').update(raw).digest('hex'),binding:P039_TEXT_BINDING,allReferencesPresentAndStructurallyReachable:true,qualifications:[
 'Block language describes native rendered output, not the language of original SWF bytes. Spanish control/feedback copy is maintained native translation.',
 'Source108 outlined artwork supports course heading and activity title as separately transcribed roles. XML Percent Practice page title remains separately bound.',
 'Instruction source identities derive from per-instance glyph schedules; hidden duplicate142 is excluded.',
 'Source212/213/214 fields are placed offstage. The visible native percent readout is an accessibility addition derived from their source state semantics, not source-visible text parity.',
 'Wrong feedback uses orientation-neutral25of100 wording; reveal corrects the source75/73 fallback to the task25 target. See native-behavior-decisions-v1.json and native-exercise-content-v1.json.',
 'Correct! normalizes source correct!!!. Native completion status and English-source fallback notice remain outside SWF teaching-text bindings.',
 'Static renderer uses capture lang; live player independently receives host UI language. Neither mode establishes source-language translation acceptance.'
],originalRuntimeAccepted:false,fidelityAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,registered:false},null,2)+'\n');console.log('PASS 18 native text blocks bound to present, structurally reachable source characters/shapes');
