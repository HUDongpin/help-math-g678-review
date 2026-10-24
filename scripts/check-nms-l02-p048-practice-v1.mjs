import assert from 'node:assert/strict';
import {p048Initial,p048Reduce as step,p048SliderX} from '../packages/demos/src/nms-l02-p048-practice-v1.ts';
for(let seed=0;seed<64;seed++)for(const wrong of [false,true]){
 let s=p048Initial(seed);s=step(s,{type:'intro-finished',token:s.token});const targets=[];
 for(let q=0;q<3;q++){
  targets.push(s.target);
  s=step(s,{type:'help',open:true});assert.equal(step(s,{type:'submit'}),s);s=step(s,{type:'help',open:false});
  if(wrong){s=step(s,{type:'submit'});s=step(s,{type:'close-feedback'});s=step(s,{type:'reset'});assert.equal(s.attempts,1);s=step(s,{type:'submit'});s=step(s,{type:'close-feedback'});assert.equal(s.phase,'reveal');assert.equal(s.value,s.target);}
  else{s=step(s,{type:'input',value:s.target});s=step(s,{type:'submit'});assert.equal(s.phase,'correct-feedback');}
  assert.equal(step(s,{type:'phase-finished',token:s.token-1}),s);s=step(s,{type:'phase-finished',token:s.token});
 }
 assert.deepEqual(targets.toSorted((a,b)=>a-b),[25,50,85]);assert.equal(s.phase,'continuation');s=step(s,{type:'phase-finished',token:s.token});assert.equal(s.phase,'complete');const token=s.token;s=step(s,{type:'replay'});assert.equal(s.phase,'intro');assert.deepEqual(s.remaining,[85,50,25]);assert.equal(s.attempts,0);assert.equal(s.value,0);assert.equal(step(s,{type:'phase-finished',token}),s);
}
for(let n=0;n<=100;n++)assert.equal(Math.round((p048SliderX(n)/50+5)*59/3)+31,n);
console.log(JSON.stringify({passed:true,completeQuestionRoutes:128,sliderRoundTrips:101,scope:'Pure state only; audio clocks, intro renderer and browser integration pending.'}));
