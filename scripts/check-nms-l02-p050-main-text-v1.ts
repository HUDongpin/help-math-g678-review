import assert from 'node:assert/strict';
import {p050ModuleFrame} from '../packages/demos/src/nms-l02-p050-frame-v1';
import {p050TextSnapshot} from '../packages/demos/src/nms-l02-p050-text-snapshot-v1';
import {P050_MAIN_GLOSSARY} from '../packages/demos/src/generated/nms-l02-p050-main-glossary-v1';
for(const lang of ['en','es'] as const){
 const state=p050ModuleFrame(50,{frame:50,lang,seed:0,scenario:'source-inspection'});
 for(const entry of P050_MAIN_GLOSSARY){
  const snapshot=p050TextSnapshot(state,{mainGlossary:entry.id});assert.equal(snapshot.status,'ready');
  assert.equal(snapshot.blocks.find(b=>b.id===`main-glossary-${entry.id}-definition`)?.text,entry.definitions[lang]);
  assert.ok(snapshot.blocks.find(b=>b.id==='main-glossary-close')?.visible);
  assert.equal(snapshot.blocks.filter(b=>b.visible&&/^main-glossary-.*-definition$/.test(b.id)).length,1);
 }
 const help=p050ModuleFrame(1,{frame:1,lang,seed:0,frameDomain:'sprite-35',scenario:'help-example'});
 assert.throws(()=>p050TextSnapshot(help,{mainGlossary:'decimal'}));
 assert.throws(()=>p050TextSnapshot(p050ModuleFrame(1,{frame:1,lang,seed:0,scenario:'source-inspection'}),{mainGlossary:'decimal'}));
 const complete=p050ModuleFrame(260,{frame:260,lang,seed:0,scenario:'all-correct-outro'});assert.equal(p050TextSnapshot(complete,{mainGlossary:'position'}).status,'ready');
}
console.log('PASS:6 bilingual source definition snapshots; hidden/help requests rejected; retained outro glossary available');
