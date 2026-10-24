import assert from 'node:assert/strict';
import {p049ClockInitial,p049ClockPlay,p049ClockPause,p049ClockSync,p049ClockEvent,p049ClockDuration,p049ClockMainFrame} from '../packages/demos/src/nms-l02-p049-clock-v1';
import {p049PhaseWindow,p049FrameSample} from '../packages/demos/src/nms-l02-p049-audio-window-v1';
import {p049Initial,type P049State} from '../packages/demos/src/nms-l02-p049-practice-v1';
import {P049_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p049-audio-plan-v1';
assert.equal(p049FrameSample(2),1838);assert.equal(p049FrameSample(4),5512);
let c=p049ClockPlay(p049ClockInitial(),10);c=p049ClockPause(c,10.75);assert.equal(c.elapsed,.75);assert.equal(p049ClockMainFrame(c),10);
assert.equal(p049ClockSync(c,500),c);c=p049ClockPlay(c,500);assert.equal(c.elapsed,.75);
const ready=p049ClockSync(c,1000);assert.equal(ready.state.phase,'ready');assert.equal(ready.anchor,null);assert.equal(ready.elapsed,0);
assert.equal(p049ClockMainFrame(ready),327);
let cases=0;
for(const question of [0,1,2] as const)for(const phase of ['intro','correct-feedback','wrong-feedback','answer-transition','outro'] as const)for(let branch=0;branch<4;branch++){
 const state:P049State={...p049Initial(),phase,question,wrongAttempts:2,correctCount:2};
 const w=p049PhaseWindow(state,branch)!;assert.ok(w.start>=0&&w.end>w.start&&w.end<=P049_AUDIO_PLANS[w.domain].totalSamples);
 const clock={state,elapsed:0,anchor:null,wrongBranch:branch};assert.equal(p049ClockMainFrame(clock),w.mainFrame);
 const playing=p049ClockPlay(clock,100);assert.equal(p049ClockSync(playing,101,state.token+99),playing);
 const end=p049ClockSync(playing,100+p049ClockDuration(clock)+1000);assert.equal(end.anchor,null);assert.equal(end.elapsed,0);assert.equal(end.state.token,state.token+1);cases++;
}
const firstWrong={state:{...p049Initial(),phase:'wrong-feedback' as const,wrongAttempts:1,hintOpen:true},elapsed:0,anchor:null,wrongBranch:3};
const stopped=p049ClockSync(p049ClockPlay(firstWrong,0),100);assert.equal(stopped.state,firstWrong.state);assert.equal(p049ClockPlay(stopped,101),stopped);
const replay=p049ClockEvent(stopped,{type:'replay'},101);assert.equal(replay.elapsed,0);assert.equal(replay.wrongBranch,0);
assert.equal(p049ClockSync(replay,1000,stopped.state.token),replay);
assert.ok(p049ClockDuration({...firstWrong,state:{...firstWrong.state,phase:'correct-feedback'}})>18/12);
const perfect={...p049Initial(),phase:'outro' as const,correctCount:3};assert.equal(p049PhaseWindow(perfect)!.mainFrame,386);
assert.equal(p049PhaseWindow({...perfect,correctCount:2})!.mainFrame,411);
assert.throws(()=>p049ClockPlay(p049ClockInitial(),NaN));assert.throws(()=>p049ClockSync(p049ClockPlay(p049ClockInitial(),10),9));
console.log(JSON.stringify({status:'PASS',phaseWindowCases:cases,pauseResume:true,lateCallbackNoOvershoot:true,firstWrongWaitsForHint:true,correctTailWait:true,outroBranches:[386,411]}));
