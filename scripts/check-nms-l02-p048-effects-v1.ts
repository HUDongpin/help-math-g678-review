import assert from 'node:assert/strict';
import {P048Effects,p048EffectForEvent} from '../packages/demos/src/nms-l02-p048-effects-v1';
import {p048Initial,p048Reduce} from '../packages/demos/src/nms-l02-p048-practice-v1';
async function main(){
 let s=p048Initial();s=p048Reduce(s,{type:'intro-finished',token:s.token});
 assert.equal(p048EffectForEvent(s,{type:'submit'}),'413');assert.equal(p048EffectForEvent(s,{type:'reset'}),'413');assert.equal(p048EffectForEvent(s,{type:'help',open:true}),'8');assert.equal(p048EffectForEvent(s,{type:'input',value:1}),null);assert.equal(p048EffectForEvent({...s,helpOpen:true},{type:'submit'}),null);
 s=p048Reduce(s,{type:'submit'});assert.equal(p048EffectForEvent(s,{type:'close-feedback'}),'436');assert.equal(p048EffectForEvent(s,{type:'reset'}),null);
 let contexts=0,closes=0,starts=0,stops=0;const reads:string[]=[];
 const effects=new P048Effects({read:async(d)=>{reads.push(d);return new ArrayBuffer(1);},decode:async()=>({length:8805} as AudioBuffer),context:()=>{contexts++;return {currentTime:0,destination:{},createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),resume:async()=>{},close:async()=>{closes++;},createBufferSource:()=>({buffer:null,onended:null,connect(){},disconnect(){},stop(){stops++;},start(_when:number,start:number,duration:number){assert.equal(start,0);assert.ok(duration===1/3||duration===1/6);starts++;}})} as unknown as AudioContext;}});
 assert.equal(await effects.intro(304,0),false);assert.equal(await effects.intro(305,0),true);assert.equal(await effects.intro(306,0),false);assert.equal(await effects.intro(307,0),false);assert.equal(effects.snapshot().playing,false);effects.reset();assert.equal(await effects.intro(305,1),true);await effects.play('8');await effects.play('436');effects.pause();await effects.close();await effects.close();assert.equal(contexts,1);assert.equal(closes,1);assert.equal(starts,4);assert.equal(stops,4);assert.deepEqual(reads,['413','8','436']);
 console.log(JSON.stringify({passed:true,sourceTriggerMap:true,introOncePerReplay:true,channelCache:true,pauseStops:true,idempotentClose:true}));
}
void main();
