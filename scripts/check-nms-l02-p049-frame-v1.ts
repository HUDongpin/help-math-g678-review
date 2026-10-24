import assert from 'node:assert/strict';
import {p049ModuleFrame,P049_FRAME_DOMAINS} from '../packages/demos/src/nms-l02-p049-frame-v1';
const cases:Array<[string,string,number,number]>=[['root','source-inspection',1,10],['sprite-156','source-inspection',1,435],['sprite-156','question-1',327,327],['sprite-156','question-2',350,350],['sprite-156','question-3',370,370],['sprite-156','answer-1',328,349],['sprite-156','answer-2',351,369],['sprite-156','answer-3',371,385],['sprite-156','all-correct-outro',386,435],['sprite-156','retry-outro',411,435],['sprite-74','first-wrong',1,55],['sprite-74','second-wrong',1,55],['sprite-109','help-example',1,1],['sprite-131','hint-example',1,1]];
for(const domain of ['sprite-72','sprite-143','sprite-153'])cases.push([domain,'correct-feedback',1,20]);
for(const domain of ['sprite-8','sprite-35','sprite-117'])cases.push([domain,'click-inspection',1,5]);
let count=0;
for(const [frameDomain,scenario,first,last]of cases)for(const lang of ['en','es'] as const)for(let frame=first;frame<=last;frame++){
 const c={frame,frameDomain,scenario,lang,seed:5,replay:3};const s=p049ModuleFrame(frame,c);assert.equal(s.sourceSha256.length,64);assert.equal(s.replay,3);assert.equal(s.state.replay,3);assert.deepEqual(s,p049ModuleFrame(frame,c));
 if(frameDomain==='root')assert.equal(s.mainFrame,frame<6?null:1);
 if(scenario==='source-inspection'&&frameDomain==='sprite-156'&&frame>327){assert.equal(s.postStopInspection,true);assert.equal(s.state.phase,'ready');assert.equal(s.state.question,0);}
 if(scenario.endsWith('outro')){assert.equal(s.state.phase,frame===435?'complete':'outro');assert.equal(s.state.correctCount,scenario==='all-correct-outro'?3:0);}
 if(scenario==='correct-feedback'&&frame===20)assert.equal(s.state.phase,'correct-feedback');
 count++;
}
const base={frame:327,frameDomain:'sprite-156',scenario:'question-1',lang:'en' as const,seed:0};
for(const c of [{...base,frame:0},{...base,frameDomain:'sprite-20'},{...base,seed:-1},{...base,replay:-1},{...base,rootFrame:7},{...base,scenario:'unknown'},{...base,scenario:'question-2'},{...base,scenario:'all-correct-outro'}])assert.throws(()=>p049ModuleFrame(c.frame,c));
assert.throws(()=>p049ModuleFrame(326,base));
assert.equal(Object.keys(P049_FRAME_DOMAINS).length,11);
console.log(JSON.stringify({status:'PASS',queries:count,domains:11,rootFrames:10,mainFrames:435,staticPostStopNotCompletion:true,feedbackTailNotPrematureCompletion:true}));
