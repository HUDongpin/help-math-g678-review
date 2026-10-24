import assert from 'node:assert/strict';
import {P049Session} from '../packages/demos/src/nms-l02-p049-session-v1';
import {P049_ANSWER_DIGITS} from '../packages/demos/src/nms-l02-p049-practice-v1';
const deps={read:async()=>new ArrayBuffer(0)};
function fixture(){
 let now=0,closes=0,volume=.8;const starts:any[]=[];
 const audio={currentTime:()=>now,play:async(w:any,e:number)=>{starts.push({w,e});return true;},pause(){},stop(){},close:async()=>{closes++;},setVolume(v:number){volume=v;}};
 return {audio,starts,advance(){now+=100;},closes:()=>closes,volume:()=>volume};
}
async function main(){
 let routes=0;
 for(let path=0;path<27;path++){
  const f=fixture(),s=new P049Session(deps,17,f.audio);await s.play();f.advance();await s.tick();let remaining=path,correct=0;
  for(const question of [0,1,2] as const){
   assert.equal(s.snapshot().state.question,question);assert.equal(s.snapshot().state.phase,'ready');
   const mode=remaining%3;remaining=Math.floor(remaining/3);
   if(mode>0){
    await s.event({type:'submit'});const branch=s.snapshot().wrongBranch;s.pause();await s.play();assert.equal(s.snapshot().wrongBranch,branch);
    f.advance();await s.tick();assert.equal(s.snapshot().state.hintOpen,true);assert.equal(s.snapshot().running,false);
    const n=f.starts.length;await s.play();assert.equal(f.starts.length,n);await s.event({type:'close-hint'});
   }
   if(mode<2){for(const field of [0,1] as const)await s.event({type:'input',field,value:P049_ANSWER_DIGITS[question][field]});correct++;}
   await s.event({type:'submit'});f.advance();await s.tick();assert.equal(s.snapshot().state.phase,'answer-transition');
   assert.equal(s.snapshot().elapsed,0);f.advance();await s.tick();
  }
  assert.equal(s.snapshot().state.phase,'outro');assert.equal(s.snapshot().frame,correct===3?386:411);
  f.advance();await s.tick();assert.equal(s.snapshot().state.phase,'complete');assert.equal(s.snapshot().state.correctCount,correct);
  await s.event({type:'replay'});assert.equal(s.snapshot().frame,1);assert.equal(s.snapshot().state.correctCount,0);
  s.setNarration(false);assert.equal(f.volume(),0);assert.equal(s.snapshot().running,true);s.setVolume(.4);assert.equal(f.volume(),0);s.setNarration(true);assert.equal(f.volume(),.4);
  await s.close();await s.close();assert.equal(f.closes(),1);routes++;
 }
 for(const action of ['pause','close'] as const){
  const f=fixture();let resolve!:(x:boolean)=>void;f.audio.play=()=>new Promise(r=>resolve=r);const s=new P049Session(deps,0,f.audio);
  const pending=s.play();assert.equal(s.snapshot().loading,true);f.advance();await s.tick();assert.equal(s.snapshot().frame,1);
  if(action==='pause')s.pause();else await s.close();resolve(true);await pending;assert.equal(s.snapshot().running,false);assert.equal(s.snapshot().elapsed,0);await s.close();
 }
 const race=fixture(),resolves:Array<(x:boolean)=>void>=[];race.audio.play=()=>new Promise(r=>resolves.push(r));
 const restarted=new P049Session(deps,0,race.audio);const old=restarted.play();const newer=restarted.event({type:'replay'});
 assert.equal(resolves.length,2);resolves[0]!(true);await old;assert.equal(restarted.snapshot().running,false);assert.equal(restarted.snapshot().loading,true);
 resolves[1]!(true);await newer;assert.equal(restarted.snapshot().running,true);assert.equal(restarted.snapshot().frame,1);assert.equal(restarted.snapshot().state.replay,1);await restarted.close();
 const f=fixture();f.audio.play=async()=>false;const refused=new P049Session(deps,0,f.audio);await refused.play();assert.equal(refused.snapshot().running,false);assert.equal(refused.snapshot().failure,'P049_AUDIO_NOT_STARTED');await refused.close();
 console.log(JSON.stringify({status:'PASS',routes,wrongBranchStable:true,firstHintWait:true,loadBeforeClock:true,latePauseAndClose:true,replaySupersedesPendingLoad:true,falseStartRejected:true,narrationMuteKeepsClock:true,scope:'Injected session lifecycle; real browser playback pending.'}));
}
void main();
