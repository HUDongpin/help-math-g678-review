import assert from 'node:assert/strict';
import {p048ClockInitial,p048ClockPlay as play,p048ClockPause as pause,p048ClockSync as sync,p048ClockEvent as event,p048ClockDuration as duration,p048ClockMainFrame as frame,P048_TIMING} from '../packages/demos/src/nms-l02-p048-clock-v1';
let c=play(p048ClockInitial(3),10);c=pause(c,11);assert.equal(frame(c),13);c=play(c,100);c=sync(c,101);assert.equal(c.elapsed,2);assert.throws(()=>sync(c,100));
c=sync(c,1000);assert.equal(c.state.phase,'ready');assert.equal(c.elapsed,0);assert.equal(c.anchor,null);assert.equal(frame(c),330);
for(let i=0;i<3;i++){
 c=event(c,{type:'input',value:c.state.target!},1000);c=event(c,{type:'submit'},1000);assert.equal(c.state.phase,'correct-feedback');c=play(c,1000);assert.equal(sync(c,2000,c.state.token-1),c);c=sync(c,2000);assert.equal(c.elapsed,0);assert.equal(c.anchor,null);
}
assert.equal(c.state.phase,'continuation');c=play(c,2000);
const visualEnd=(P048_TIMING.terminalSample-P048_TIMING.practiceSample)/22050;
c=sync(c,2000+visualEnd);assert.equal(frame(c),363);assert.equal(c.state.phase,'continuation');assert.ok(duration(c)>c.elapsed);
c=sync(c,2000+duration(c)+0.01);assert.equal(c.state.phase,'complete');assert.equal(frame(c),363);c=event(c,{type:'replay'},3000);assert.equal(frame(c),1);assert.equal(c.elapsed,0);
c=play(c,3000);c=sync(c,4000);c=event(c,{type:'submit'},4000);assert.equal(c.state.phase,'wrong-feedback');assert.equal(play(c,4000).anchor,null);assert.equal(duration(c),0);
console.log(JSON.stringify({passed:true,pauseResume:true,staleToken:true,noSuccessorOvershoot:true,terminalTailRetained:true,wrongFeedbackRequiresClose:true}));
