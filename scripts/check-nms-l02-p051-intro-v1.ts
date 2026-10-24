import assert from 'node:assert/strict';
import {p051Intro} from '../packages/demos/src/nms-l02-p051-intro-v1';
const teaching=new Set([57,60,65,66,67,69,70,71,72,74,76,78,80,82,84,86,87,89,106,108]);
for(let frame=1;frame<=484;frame++){
 const {objects}=p051Intro(frame);assert.equal(new Set(objects.map(o=>o.depth)).size,objects.length);
 for(const o of objects){assert.equal(o.stageMatrix[4],o.matrix[4]+8248);assert.equal(o.stageMatrix[5],o.matrix[5]+5866);assert.ok(o.alpha>=0&&o.alpha<=1);assert.ok(Number.isInteger(o.ratio)&&o.ratio>=0&&o.ratio<=65535);if(o.text!==null)assert.ok(teaching.has(o.characterId));}
}
for(const invalid of [0,485,1.5,NaN,Infinity])assert.throws(()=>p051Intro(invalid));
console.log('PASS:484direct-display frames,unique depths,composed transforms,alpha,morph ratios and teaching text allowlist');
