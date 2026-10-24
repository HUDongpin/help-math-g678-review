import assert from 'node:assert/strict';
import {p050ModuleFrame} from '../packages/demos/src/nms-l02-p050-frame-v1';
import {p050TextSnapshot} from '../packages/demos/src/nms-l02-p050-text-snapshot-v1';
for(const lang of ['en','es'] as const){
 for(let frame=1;frame<=260;frame++){
  const snapshot=p050TextSnapshot(p050ModuleFrame(frame,{frame,lang,seed:0,scenario:'source-inspection'}));
  assert.equal(snapshot.status,'ready');assert.deepEqual(snapshot.blockers,[]);
  assert.ok(snapshot.blocks.every(block=>!block.visible||block.text.trim().length>0));
 }
 const frame=1,state=p050ModuleFrame(frame,{frame,lang,seed:0,frameDomain:'sprite-35',scenario:'help-example'});
 const snapshot=p050TextSnapshot(state,{glossary:'decimal'});assert.equal(snapshot.status,'ready');
 assert.ok(snapshot.blocks.find(block=>block.id==='glossary-decimal-definition')?.visible);
 assert.throws(()=>p050TextSnapshot(p050ModuleFrame(209,{frame:209,lang,seed:0,scenario:'practice'}),{glossary:'decimal'}));
}
console.log(JSON.stringify({status:'PASS',mainSnapshots:520,languages:['en','es'],scope:'Text snapshot identity/completeness and glossary state guard; full DOM equivalence pending.'}));
