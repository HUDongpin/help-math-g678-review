import assert from 'node:assert/strict';
import {P051_ITEMS,p051Initial,p051Reduce,type P051State} from '../packages/demos/src/nms-l02-p051-practice-v1';
const finish=(s:P051State)=>p051Reduce(s,{type:'finish',token:s.token});
function* permutations(items:number[]):Generator<number[]>{if(!items.length){yield [];return;}for(const item of items)for(const rest of permutations(items.filter(x=>x!==item)))yield [item,...rest];}
let orders=0,wrong=0;
for(const order of permutations([0,2,3,5,8])){
 let state=finish(p051Initial());
 for(const item of P051_ITEMS)for(const target of [null,0,2,3,5,8]){
  if(item.fraction&&item.id===target)continue;
  const failed=p051Reduce(state,{type:'drop',item:item.id,target});assert.equal(failed.phase,'wrong-feedback');assert.deepEqual(failed.solved,[]);assert.equal(finish(failed),failed);state=p051Reduce(failed,{type:'close-wrong'});wrong++;
 }
 for(const item of order){
  const correct=p051Reduce(state,{type:'drop',item,target:item});assert.equal(correct.phase,'correct-feedback');
  assert.equal(p051Reduce(correct,{type:'drop',item,target:item}),correct);
  const replay=p051Reduce(correct,{type:'replay'});assert.equal(p051Reduce(replay,{type:'finish',token:correct.token}),replay);
  state=finish(correct);
 }
 assert.equal(state.phase,'completion-feedback');assert.equal(new Set(state.solved).size,5);state=finish(state);assert.equal(state.phase,'outro');state=finish(state);assert.equal(state.phase,'complete');orders++;
}
for(const item of P051_ITEMS)if(item.fraction)assert.equal(Number(item.decimal),item.fraction[0]/item.fraction[1]);
console.log(JSON.stringify({status:'PASS',orders,wrongDrops:wrong,scope:'Pure source-bound native state; audio/view/host pending.'}));
