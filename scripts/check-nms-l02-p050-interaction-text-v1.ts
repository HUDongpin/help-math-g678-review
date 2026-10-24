import assert from 'node:assert/strict';
import {p050TargetLabel,p050SelectionText} from '../packages/demos/src/nms-l02-p050-interaction-text-v1';
import {p050ModuleFrame} from '../packages/demos/src/nms-l02-p050-frame-v1';
import {p050TextSnapshot} from '../packages/demos/src/nms-l02-p050-text-snapshot-v1';
import {P050_ITEMS,p050Reduce} from '../packages/demos/src/nms-l02-p050-practice-v1';
for(const lang of ['en','es'] as const){
 const query=p050ModuleFrame(209,{frame:209,lang,scenario:'practice',seed:0});
 const labels=P050_ITEMS.map(item=>p050TargetLabel(query.state,item.id,lang));assert.equal(new Set(labels).size,5);
 assert.equal(p050TargetLabel(query.state,5,lang),lang==='en'?'Position 1':'Posición 1');
 for(const item of P050_ITEMS){
  const snapshot=p050TextSnapshot(query,{selection:item.id});assert.equal(snapshot.status,'ready');
  assert.equal(snapshot.blocks.find(b=>b.id==='selection')?.text,p050SelectionText(query.state,item.id,lang));
  assert.equal(snapshot.blocks.find(b=>b.id===`target-label-${item.id}`)?.text,p050TargetLabel(query.state,item.id,lang));
  const solved=p050Reduce(query.state,{type:'drop',item:item.id,target:item.id});
  assert.equal(p050SelectionText(solved,item.id,lang),'');
  assert.ok(p050TargetLabel(solved,item.id,lang).endsWith(item.decimal));
 }
 assert.equal(p050SelectionText({...query.state,helpOpen:true},1,lang),'');
 assert.equal(p050SelectionText(query.state,999,lang),'');assert.throws(()=>p050TargetLabel(query.state,999,lang));
}
console.log('PASS: bilingual target labels, selection snapshot agreement, solved/help/invalid selection guards');
