import assert from 'node:assert/strict';
import {P048Session} from '../packages/demos/src/nms-l02-p048-session-v1';
async function main(){
 let now=0,playing=false,elapsed=0,closed=0;const starts:any[]=[];
 const audio:any={currentTime:()=>now,snapshot:()=>({elapsed,playing}),play:async(w:any,e:number)=>{starts.push({w,e});playing=true;elapsed=e;return true;},pause:()=>{playing=false;},stop:()=>{playing=false;elapsed=0;},close:async()=>{closed++;},setVolume:()=>{}};
 const s=new P048Session({read:async()=>new ArrayBuffer(0)},5,audio);
 await s.play();assert.equal(s.snapshot().frame,1);now=100;await s.tick();assert.equal(s.snapshot().state.phase,'ready');assert.equal(s.snapshot().state.question,1);
 await s.event({type:'submit'});assert.equal(s.snapshot().state.phase,'wrong-feedback');const branch=s.snapshot().wrongBranch;s.pause();await s.play();assert.equal(s.snapshot().wrongBranch,branch);await s.event({type:'close-feedback'});assert.equal(s.snapshot().state.phase,'ready');
 await s.event({type:'submit'});await s.event({type:'close-feedback'});assert.equal(s.snapshot().state.phase,'reveal');assert.equal(s.snapshot().state.value,s.snapshot().state.target);now+=3;await s.tick();assert.equal(s.snapshot().state.question,2);
 await s.event({type:'replay'});assert.equal(s.snapshot().state.question,0);assert.equal(s.snapshot().frame,1);await s.close();await s.close();assert.equal(closed,1);
 let resolve!:(v:boolean)=>void;audio.play=()=>new Promise(r=>resolve=r);
 const delayed=new P048Session({read:async()=>new ArrayBuffer(0)},0,audio);const load=delayed.play();assert.equal(delayed.snapshot().loading,true);now+=100;await delayed.tick();assert.equal(delayed.snapshot().elapsed,0);delayed.pause();resolve(true);await load;assert.equal(delayed.snapshot().running,false);assert.equal(delayed.snapshot().elapsed,0);await delayed.close();
 console.log(JSON.stringify({passed:true,readyBoundary:true,wrongBranchStableOnResume:true,twoWrongReveal:true,automaticNextQuestion:true,replay:true,lateLoadCannotStartClock:true}));
}
void main();
