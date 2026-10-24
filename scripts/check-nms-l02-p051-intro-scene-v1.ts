import assert from 'node:assert/strict';
import {p051IntroScene} from '../packages/demos/src/nms-l02-p051-intro-scene-v1';
let expandedFrames=0;
for(let frame=1;frame<=484;frame++){
 const objects=p051IntroScene(frame);assert.equal(new Set(objects.map(o=>o.path)).size,objects.length);
 const nested=objects.filter(o=>o.path.includes('/sprite-119/'));
 const expected=(frame>=344&&frame<=350)||(frame>=383&&frame<=394);assert.equal(nested.length,expected?2:0);
 for(const object of objects){assert.equal(object.stageMatrix[4],object.matrix[4]!+8248);assert.equal(object.stageMatrix[5],object.matrix[5]!+5866);assert.ok(object.alpha>=0&&object.alpha<=1);}
 if(expected){expandedFrames++;assert.equal(nested.find(o=>o.characterId===74)?.text,'0.1');}
}
const demo=(frame:number)=>p051IntroScene(frame).filter(o=>o.characterId===74);
assert.deepEqual(demo(344).map(o=>o.matrix.slice(4)),[[4395,-2760]]);
assert.deepEqual(demo(350).map(o=>o.matrix.slice(4)),[[690,-1563]]);
assert.deepEqual(demo(351).map(o=>o.matrix.slice(4)),[[690,-1563]]);
assert.deepEqual(demo(383).map(o=>o.matrix.slice(4)),[[728,-1563]]);
assert.deepEqual(demo(389).map(o=>o.matrix.slice(4)),[[4385,-2755]]);
console.log(JSON.stringify({status:'PASS',frames:484,expandedFrames,scope:'Exact nested display transforms and source decimal text,not original runtime.'}));
