import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {P008_TEXT_STATE_SOURCE,p008TextState} from '../packages/demos/src/alg-l06-p008-text-state-v1.generated.ts';

const row=(frame,id)=>p008TextState(frame).tableRows.find(item=>item.id===id);
const price=(frame,id)=>p008TextState(frame).prices.find(item=>item.id===id);

test('generated text state is reproducible from frozen P008 structural evidence',()=>{
 const result=JSON.parse(execFileSync('node',['scripts/build-alg-l06-p008-text-state-v1.mjs','--check'],
  {encoding:'utf8'}));
 assert.equal(result.status,'P008_SOURCE_TEXT_STATE_VERIFIED_NOT_ADMITTED');
 assert.equal(P008_TEXT_STATE_SOURCE.sourceSwfSha256,
  '6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350');
 assert.equal(P008_TEXT_STATE_SOURCE.frameCount,938);
 assert.deepEqual(P008_TEXT_STATE_SOURCE.masks.map(m=>[m.characterId,m.depth,m.clipDepth]),
  [[1,1,498],[428,388,403]]);
});

test('offstage authored title is not a visible text instance; outlined shape anchors one semantic title',()=>{
 const state=p008TextState(1);
 assert.equal(state.title.text,'Understanding Functions: Real World Activity');
 assert.deepEqual(state.title.sourceTextIds,['character-508']);
 assert.deepEqual(state.title.sourceShapeIds,[509]);
 assert.equal(state.entries.find(e=>e.characterId===508).visibility,'hidden');
 assert.equal(state.title.sourceText508Visibility,'offstage');
 assert.equal(state.languagePolicy,'source-en-only');
});

test('prices follow both source members and restore readable context from partial crops',()=>{
 assert.equal(price(1,'lemonade-price').semanticVisible,true);
 assert.equal(price(1,'orange-juice-price').semanticVisible,true);
 assert.equal(price(580,'orange-juice-price').semanticVisible,true);
 assert.equal(price(581,'orange-juice-price').semanticVisible,false);
 assert.equal(price(635,'lemonade-price').semanticVisible,true);
 assert.equal(price(636,'lemonade-price').semanticVisible,false);
 assert.equal(price(725,'lemonade-price').semanticVisible,false);
 assert.equal(price(726,'lemonade-price').semanticVisible,true);
 assert.equal(price(847,'orange-juice-price').semanticVisible,false);
 assert.equal(price(848,'orange-juice-price').semanticVisible,true);
 const orange=price(848,'orange-juice-price');
 assert.deepEqual(orange.sourceTextIds,['character-30','character-31']);
 assert.equal(orange.labelVisibility,'partial');
 assert.equal(orange.valueVisibility,'partial');
});

test('late money table pairs are withheld through partial mask reveal and appear only when fully shown',()=>{
 for(const [id,before,full,cups,money,sourceIds] of [
  ['cups-80',795,796,'80','$40.00',['character-430','character-431']],
  ['cups-90',800,801,'90','$45.00',['character-432','character-433']],
  ['cups-100',805,806,'100','$50.00',['character-434','character-435']],
  ['cups-110',809,810,'110','$55.00',['character-436','character-437']],
 ]){
  assert.equal(row(before,id).semanticVisible,false,id+' partial source mask');
  assert.equal(row(full,id).semanticVisible,true,id+' full source mask');
  assert.equal(row(full,id).cups,cups);
  assert.equal(row(full,id).money,money);
  assert.deepEqual(row(full,id).sourceTextIds,sourceIds);
  assert.equal(row(full,id).instanceIds.length,2);
 }
 assert.equal(row(791,'cups-80').semanticVisible,false);
 assert.equal(row(853,'cups-110').semanticVisible,true);
 assert.equal(row(855,'cups-110').semanticVisible,false);
});

test('pink outlined values annotate existing rows without creating duplicate table answers',()=>{
 for(const [frame,shapeId,rowId,text] of [
  [182,111,'cups-60','60'],[194,118,'cups-70','70'],
  [250,137,'cups-60','$30.00'],[262,138,'cups-70','$35.00'],
  [349,118,'cups-70','70'],[381,138,'cups-70','$35.00'],
 ]){
  const state=p008TextState(frame);
  assert.equal(state.emphasis.length,1);
  assert.equal(state.emphasis[0].rowId,rowId);
  assert.equal(state.emphasis[0].text,text);
  assert.deepEqual(state.emphasis[0].sourceShapeIds,[shapeId]);
  assert.equal(state.tableRows.length,10);
  assert.equal(state.tableRows.filter(r=>r.semanticVisible).length,6);
 }
 assert.equal(p008TextState(183).emphasis.length,0);
});

test('frame query rejects out-of-domain requests rather than inventing a snapshot',()=>{
 for(const frame of [0,939,1.5,NaN])assert.throws(()=>p008TextState(frame),/P008_TEXT_FRAME_OUT_OF_RANGE/);
});
