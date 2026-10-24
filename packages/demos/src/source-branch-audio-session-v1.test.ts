import assert from'node:assert/strict';import test from'node:test';
import{P020Session as FrozenP020Session,type P020Clock,type P020Spanish}from'./alg-l07-p020-session-v1';
import{SourceStreamRunsClockV1,sourceStreamRunSlices,type SourceStreamRunsClockPlan}from'./source-stream-runs-clock-v1';
import{ALG_L07_P020_SOURCE as S,p020InitialState,p020Reduce,p020CanPlay,p020Branch,type P020State,type P020Term}from'./alg-l07-p020-state-v1';
import{createSourceBranchSessionV1}from'./source-branch-audio-session-v1';
const SharedP020Session=createSourceBranchSessionV1<P020State,P020Term,typeof S.clocks[number]['spriteId']>({source:{...S,mainSpriteId:182},initialState:p020InitialState,reduce:p020Reduce,canPlay:p020CanPlay,branch:id=>{if(id===182)throw Error('main');return p020Branch(id);}});
const ok={accepted:true,reason:'fixture'};const wait=()=>new Promise<void>(r=>setImmediate(r));
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>resolve=r);return{promise,resolve};}
class Clock implements P020Clock{
 frame=1;phase='idle';closed=false;plays=0;constructor(readonly plan:SourceStreamRunsClockPlan){new SourceStreamRunsClockV1(plan,{commitHeldFrame:()=>true});}
 snapshot(){return{phase:this.phase,frame:this.frame,audio:{phase:this.phase,decodedSample:0},failure:null}as ReturnType<P020Clock['snapshot']>;}
 async prepare(){this.phase='ready';return ok;}async play(){assert(!this.closed);this.phase='playing';this.plays++;return ok;}
 pause(){if(!this.closed)this.phase='paused';return ok;}seekCandidateFrame(n:number){this.frame=n;this.phase='paused';return ok;}setVolume(){return ok;}async close(){this.closed=true;this.phase='closed';}
 advance(n:number){this.frame=n;if(n===this.plan.lastFrame)this.phase='timeline-ended';}
}
class Spanish implements P020Spanish{
 phase='idle';closed=false;plays=0;listeners=new Set<()=>void>();emit(){this.listeners.forEach(f=>f());}
 snapshot(){return{phase:this.phase,decodedSample:0}as ReturnType<P020Spanish['snapshot']>;}
 subscribe(f:()=>void){this.listeners.add(f);return()=>{this.listeners.delete(f);};}async prepare(){this.phase='ready';this.emit();return ok;}
 async play(){assert(!this.closed);this.phase='playing';this.plays++;this.emit();return ok;}pause(){this.phase='paused';this.emit();return ok;}replay(){this.phase='ready';this.emit();return ok;}setVolume(){return ok;}
 async close(){this.closed=true;this.phase='closed';this.emit();this.listeners.clear();}
}
function fixture(Session:typeof SharedP020Session|typeof FrozenP020Session){const clocks:Clock[]=[],sa:Spanish[]=[],events:number[]=[];const session=new Session({load:async()=>new ArrayBuffer(1),changed:()=>events.push(1),makeClock:p=>{const c=new Clock(p);clocks.push(c);return c;},makeSpanish:()=>{const s=new Spanish();sa.push(s);return s;}});return{session,clocks,sa,events,active:()=>clocks.find(c=>`${c.plan.frameDomain.slice(7)}:${c.plan.lastFrame}`===session.snapshot().activeClockKey)!};}
async function quiz(f:ReturnType<typeof fixture>){assert(await f.session.play());f.active().advance(204);f.session.tick();assert.equal(f.session.snapshot().state.phase,'quiz-held');}
test('shared session and frozen P020 session are identical through every selected feedback, glossary, SA, loop and Replay',async()=>{
 for(const seed of[0,1,2,3])for(const answer of[1,2,3,4]as const){
  const old=fixture(FrozenP020Session),shared=fixture(SharedP020Session),pair=[old,shared];
  const equal=()=>{assert.deepEqual(shared.session.snapshot(),old.session.snapshot());assert.deepEqual(shared.clocks.map(c=>({plan:c.plan,frame:c.frame,phase:c.phase,closed:c.closed,plays:c.plays})),old.clocks.map(c=>({plan:c.plan,frame:c.frame,phase:c.phase,closed:c.closed,plays:c.plays})));};
  equal();for(const f of pair)await quiz(f);equal();
  for(const f of pair){assert(f.session.openGlossary('Function'));assert(f.session.closeGlossary());}equal();
  for(const f of pair){assert(await f.session.spanishAudio());f.session.pause();assert(await f.session.play());f.session.returnMain();}equal();
  for(let attempt=0;attempt<(answer===1?1:2);attempt++){
   for(const f of pair){assert(await f.session.choose(answer,seed));const b=p020Branch(f.session.snapshot().state.feedback!.spriteId);if(b.kind==='wrong'){f.active().advance(b.hold);f.session.tick();assert(!await f.session.play());assert(await f.session.closeFeedback());}f.active().advance(b.terminal);f.session.tick();await wait();}equal();
  }
  for(const f of pair){f.active().advance(296);f.session.tick();}equal();
  for(const f of pair){f.active().advance(297);f.session.tick();await wait();}equal();
  for(const f of pair)assert(await f.session.replay());equal();
  for(const f of pair)await f.session.close();equal();assert(pair.every(f=>f.clocks.every(c=>c.closed)&&f.sa.every(t=>t.closed)));
 }
});
