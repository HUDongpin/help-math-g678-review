import assert from 'node:assert/strict';
import {P048_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p048-audio-plan-v1';
import {p048AudioWindow,p048WindowOffset} from '../packages/demos/src/nms-l02-p048-audio-window-v1';
import {p048ClockInitial,p048ClockDuration,P048_TIMING} from '../packages/demos/src/nms-l02-p048-clock-v1';
const intro=p048AudioWindow('intro')!,continuation=p048AudioWindow('continuation')!;
assert.equal(intro.end,continuation.start);assert.equal(continuation.end,P048_AUDIO_PLANS['498'].totalSamples);assert.equal(intro.end,P048_TIMING.practiceSample);
const windows=[intro,continuation,p048AudioWindow('correct-feedback')!,...Array.from({length:4},(_,i)=>p048AudioWindow('wrong-feedback',i)!)];
for(const w of windows){assert.ok(w.start>=0&&w.start<w.end&&w.end<=P048_AUDIO_PLANS[w.domain].totalSamples);assert.equal(p048WindowOffset(w,0),w.start);assert.equal(p048WindowOffset(w,1000),w.end);assert.throws(()=>p048WindowOffset(w,NaN));}
for(const phase of ['ready','reveal','complete'] as const)assert.equal(p048AudioWindow(phase),null);
assert.throws(()=>p048AudioWindow('wrong-feedback',4));
const correct=p048AudioWindow('correct-feedback')!;const c=p048ClockInitial();assert.ok((correct.end-correct.start)/22050<p048ClockDuration({...c,state:{...c.state,phase:'correct-feedback'}}));
console.log(JSON.stringify({passed:true,windows:7,mainSeamContinuous:true,correctAudioEndsBeforeCompletion:true,invalidOffsetsRejected:true}));
