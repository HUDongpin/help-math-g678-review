import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {p051ModuleFrame} from '../packages/demos/src/nms-l02-p051-frame-v1';
import {p051TextSnapshot,P051_TEXT_BINDING} from '../packages/demos/src/nms-l02-p051-text-snapshot-v1';
import {P051_GLOSSARY} from '../packages/demos/src/generated/nms-l02-p051-glossary-v1';
const audit=JSON.parse(readFileSync('migrations/shared-nms002-l02-p051/audit/teaching-text-role-intake-v1.json','utf8'));
const ids=new Set(audit.definitions.map((d:{characterId:number})=>`character-${d.characterId}`));
for(const block of P051_TEXT_BINDING.blocks)for(const id of block.sourceTextIds)assert.ok(ids.has(id),`${block.id} source ${id}`);
const state=(frame:number,scenario='source-inspection',frameDomain='sprite-257',lang:'en'|'es'='en')=>p051ModuleFrame(frame,{frame,scenario,frameDomain,lang,seed:0});
const visible=(s:ReturnType<typeof p051TextSnapshot>,id:string)=>s.blocks.find(b=>b.id===id)?.visible;
let queries=0;
for(const lang of ['en','es'] as const)for(let frame=1;frame<=503;frame++){
 const snapshot=p051TextSnapshot(state(frame,'source-inspection','sprite-257',lang));
 assert.equal(snapshot.status,'ready');assert.equal(snapshot.blocks.length,P051_TEXT_BINDING.blocks.length);queries++;
}
for(let frame=1;frame<=5;frame++)assert.ok(p051TextSnapshot(state(frame,'source-inspection','root')).blocks.every(b=>!b.visible));
const ready=state(485,'practice'),wrong=state(2,'wrong-feedback','sprite-248');
assert.equal(p051TextSnapshot(ready).blocks.filter(b=>b.visible&&b.id.startsWith('item-')).length,9);
assert.equal(p051TextSnapshot(ready).blocks.filter(b=>b.visible&&b.id.startsWith('fraction-')&&b.id!=='fraction-heading').length,5);
assert.equal(visible(p051TextSnapshot(ready,{selection:4}),'selection'),true);
assert.equal(visible(p051TextSnapshot(wrong,{selection:4}),'selection'),false);
assert.equal(visible(p051TextSnapshot(wrong),'wrong-step-3'),true);
for(const lang of ['en','es'] as const)for(const entry of P051_GLOSSARY){
 const main=entry.id==='column'||entry.id==='equivalent-decimal';
 const s=state(main?485:2,main?'practice':'wrong-feedback',main?'sprite-257':'sprite-248',lang);
 const snapshot=p051TextSnapshot(s,{glossary:entry.id});assert.equal(snapshot.status,'ready');
 assert.equal(snapshot.blocks.find(b=>b.id===`glossary-${entry.id}-definition`)?.text,entry.definitions[lang]);
 assert.equal(visible(snapshot,`glossary-${entry.id}-definition`),true);
}
assert.throws(()=>p051TextSnapshot(state(1),{glossary:'column'}),/P051_TEXT_GLOSSARY_STATE/);
assert.throws(()=>p051TextSnapshot(ready,{glossary:'fraction'}),/P051_TEXT_GLOSSARY_STATE/);
assert.throws(()=>p051TextSnapshot(wrong,{glossary:'column'}),/P051_TEXT_GLOSSARY_STATE/);
const complete=p051TextSnapshot(state(503,'all-correct-outro'));
assert.equal(complete.blocks.filter(b=>b.visible&&/^target-\d/.test(b.id)).length,5);
assert.ok(complete.blocks.filter(b=>/^(item-|wrong-|feedback$|keyboard$)/.test(b.id)).every(b=>!b.visible));
console.log(JSON.stringify({status:'PASS',mainQueries:queries,blocks:P051_TEXT_BINDING.blocks.length,sourceRoles:'All anchors belong to source-audited teaching definitions',glossaryLanguages:8}));
