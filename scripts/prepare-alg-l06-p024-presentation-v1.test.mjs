import assert from 'node:assert/strict';
import {test} from 'node:test';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {binding,outputs} from './prepare-alg-l06-p024-presentation-v1.mjs';

const script=fileURLToPath(new URL('./prepare-alg-l06-p024-presentation-v1.mjs',import.meta.url));
test('pinned native and geometry receipts derive the exact seven source glyph/hit gates',()=>{
 const b=binding();
 assert.equal(b.source.swfSha256,'e36c6c293f1e620f82fa84d57a1b91fd0a977d24d365772126f87333ce359d05');
 assert.deepEqual(b.gates.map(x=>[x.context,x.firstFrame]),[
  ['Range',7],['Function',7],['Output',7],['Set',7],['Function table',80],
  ['Function in table paragraph',109],['Range in question',134]]);
 assert.equal(b.table.instanceIds.length,8);
 assert.deepEqual([b.paragraph.firstFrame,b.question.firstFrame,b.source.quizFrame],[109,142,154]);
 assert.deepEqual(b.popup.map(x=>[x.feedbackId,x.popupId,x.dynamicSourceTextId]),[
  ['sprite-69','sprite-65',64],['sprite-83','sprite-80',79],['sprite-97','sprite-94',93]]);
 assert(outputs().get('presentation-binding-v1.json').equals(outputs().get('presentation-binding-v1.json')));
});

test('module generated binding and evidence remain byte-for-byte current',()=>{
 const result=JSON.parse(execFileSync(process.execPath,[script,'--check'],{encoding:'utf8'}));
 assert.equal(result.status,'verified');
 assert.equal(result.output.length,1);
});
