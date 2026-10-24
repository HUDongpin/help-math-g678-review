import assert from 'node:assert/strict';
import {p049Intro} from '../packages/demos/src/nms-l02-p049-intro-v1';
import {P049_INTRO_RANGES} from '../packages/demos/src/generated/nms-l02-p049-intro-data-v1';
for(let frame=1;frame<=326;frame++){
 assert.equal(P049_INTRO_RANGES.filter(r=>r.first<=frame&&frame<=r.last).length,1);
 const s=p049Intro(frame);assert.equal(new Set(s.objects.map(o=>o.depth)).size,s.objects.length);
 for(const o of s.objects){assert.equal(o.stageMatrix[4],o.matrix[4]!+8288);assert.equal(o.stageMatrix[5],o.matrix[5]!+5666);assert.ok(o.alpha>=0&&o.alpha<=1);}
 if(frame>=195)assert.equal(s.objects.find(o=>o.characterId===58)?.alpha,0);
 if(frame>=174)assert.deepEqual(s.digits,['6','0']);
}
for(const [frame,red,count]of [[34,1,1],[37,2,2],[40,3,3],[43,4,4],[46,5,5],[49,6,6],[58,6,7],[61,6,8],[64,6,9],[67,6,10]]){
 assert.equal(p049Intro(frame!).redTenths,red);assert.equal(p049Intro(frame!).countLabel,count);
}
assert.equal(p049Intro(147).objects.find(o=>o.characterId===58)?.alpha,0);
assert.equal(p049Intro(152).objects.find(o=>o.characterId===58)?.alpha,1);
assert.equal(p049Intro(164).objects.some(o=>o.characterId===58),false);
for(const frame of [0,327,1.5,NaN])assert.throws(()=>p049Intro(frame));
console.log(JSON.stringify({status:'PASS',frames:326,ranges:P049_INTRO_RANGES.length,parentTranslations:true,countingAndSixTenths:true,digits60:true,pointerAlpha:true}));
