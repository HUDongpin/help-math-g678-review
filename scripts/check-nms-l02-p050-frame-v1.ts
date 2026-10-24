import assert from 'node:assert/strict';
import {p050ModuleFrame,P050_FRAME_DOMAINS} from '../packages/demos/src/nms-l02-p050-frame-v1';
const query=(frame:number,frameDomain='sprite-94',scenario='source-inspection')=>p050ModuleFrame(frame,{frame,frameDomain,scenario,lang:'en',seed:0});
for(let frame=1;frame<=260;frame++){
 const state=query(frame);assert.equal(state.mainFrame,frame);assert.equal(state.state.phase,frame<209?'intro':'ready');
 assert.equal(state.postStopInspection,frame>209);
}
for(let frame=1;frame<=10;frame++)assert.equal(query(frame,'root').mainFrame,frame<6?null:1);
assert.equal(query(1,'sprite-35','help-example').state.helpOpen,true);
assert.equal(query(2,'sprite-88','wrong-feedback').state.phase,'wrong-feedback');
assert.deepEqual(query(2,'sprite-91','correct-feedback').state.solved,[1]);
for(const domain of ['sprite-85','sprite-89'])assert.deepEqual(query(25,domain,'completion-feedback').state.solved,[1,2,3,4,5]);
assert.equal(query(210,'sprite-94','all-correct-outro').state.phase,'outro');
assert.equal(query(260,'sprite-94','all-correct-outro').state.phase,'complete');
for(const [domain,count] of Object.entries(P050_FRAME_DOMAINS))for(const frame of [0,count+1,NaN,1.5])assert.throws(()=>query(frame,domain));
assert.throws(()=>query(210,'sprite-94','practice'));
assert.throws(()=>query(209,'sprite-94','all-correct-outro'));
assert.throws(()=>query(2,'sprite-94','wrong-feedback'));
assert.throws(()=>query(1,'sprite-93'));
assert.throws(()=>p050ModuleFrame(1,{frame:2,lang:'en',scenario:'source-inspection',seed:0}));
console.log(JSON.stringify({status:'PASS',mainFrames:260,rootFrames:10,scope:'Native inspection identity and state recipes; not source trace execution.'}));
