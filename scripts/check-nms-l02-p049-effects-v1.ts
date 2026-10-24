import assert from 'node:assert/strict';
import {P049Effects,p049EffectForEvent} from '../packages/demos/src/nms-l02-p049-effects-v1';
import {p049Initial,p049Reduce} from '../packages/demos/src/nms-l02-p049-practice-v1';
async function main(){
 let s=p049Initial();s=p049Reduce(s,{type:'phase-finished',token:s.token});
 assert.equal(p049EffectForEvent(s,{type:'submit'}),'35');assert.equal(p049EffectForEvent(s,{type:'help',open:true}),'8');assert.equal(p049EffectForEvent(s,{type:'input',field:0,value:'1'}),null);assert.equal(p049EffectForEvent({...s,helpOpen:true},{type:'submit'}),null);
 s=p049Reduce(s,{type:'submit'});assert.equal(p049EffectForEvent(s,{type:'close-hint'}),'117');assert.equal(p049EffectForEvent(s,{type:'replay'}),null);
 let contexts=0,closes=0,starts=0,stops=0;const reads:string[]=[];
 const effects=new P049Effects({read:async(d)=>{reads.push(d);return new ArrayBuffer(1);},decode:async()=>({length:8805} as AudioBuffer),context:()=>{contexts++;return {currentTime:0,destination:{},createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),resume:async()=>{},close:async()=>{closes++;},createBufferSource:()=>({buffer:null,onended:null,connect(){},disconnect(){},stop(){stops++;},start(_when:number,start:number,duration:number){assert.equal(start,0);assert.ok(duration===1/3||duration===1/6);starts++;}})} as unknown as AudioContext;}});
 assert.equal(await effects.intro(182,0),false);assert.equal(await effects.intro(183,0),true);assert.equal(await effects.intro(184,0),false);assert.equal(await effects.intro(185,0),false);assert.equal(effects.snapshot().playing,false);effects.reset();assert.equal(await effects.intro(183,1),true);await effects.play('8');await effects.play('117');effects.pause();await effects.close();await effects.close();assert.equal(contexts,1);assert.equal(closes,1);assert.equal(starts,4);assert.equal(stops,4);assert.deepEqual(reads,['35','8','117']);
 console.log(JSON.stringify({passed:true,sourceTriggerMap:true,introOncePerReplay:true,channelCache:true,pauseStops:true,idempotentClose:true}));
}
void main();
