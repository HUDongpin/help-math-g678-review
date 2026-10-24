import assert from 'node:assert/strict';
import {p048Intro} from '../packages/demos/src/nms-l02-p048-intro-v1';
let corrected=0;
for(let f=1;f<=329;f++){
 const normal=p048Intro(f),reduced=p048Intro(f,true);
 assert.equal(normal.frame,f);assert.equal(normal.hundredths,reduced.hundredths);
 if(f<84)assert.equal(normal.hundredths,null);else assert.equal(normal.hundredths,Math.min(f-83,75));
 if(normal.hundredths!==normal.sourceHundredths){corrected++;assert.ok(f>=124&&f<=131);assert.equal(normal.hundredths!,normal.sourceHundredths!+1);}
 assert.ok(reduced.objects.filter(o=>o.characterId===180).every(o=>o.displayAlpha===0));
 assert.deepEqual(normal.objects.filter(o=>o.characterId!==180),reduced.objects.filter(o=>o.characterId!==180));
}
assert.equal(corrected,8);assert.throws(()=>p048Intro(330));assert.throws(()=>p048Intro(0));assert.throws(()=>p048Intro(1.5));
console.log(JSON.stringify({passed:true,frames:329,motionModes:2,explicitCorrections:8,scope:'Selected intro state model only; renderer/visual comparison pending.'}));
