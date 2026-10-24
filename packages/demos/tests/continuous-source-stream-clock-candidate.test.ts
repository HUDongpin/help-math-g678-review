import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {ContinuousSourceStreamClockCandidate, type ContinuousSourceClockPlan} from '../src/continuous-source-stream-clock-candidate';
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const raw=Uint8Array.of(1,2,3,4),pcm=new Float32Array(1000),bytes=Buffer.alloc(4000);
const plan:ContinuousSourceClockPlan={sourceSwfSha256:'a'.repeat(64),frameDomain:'sprite-86',firstFrame:1,lastFrame:4,fps:12,latencySamples:100,sourceSegmentCount:1,sourceHasNegativeSeek:false,
 decoder:{sourceSha256:sha(raw),sourceBytes:4,sampleRate:22050,channels:1,decodedSamples:1000,pcmSha256:sha(bytes)}};
class Context extends EventTarget{
 currentTime=0;state='suspended';sampleRate=22050;destination={};nodes:any[]=[];resumeWait:Promise<void>|undefined;
 createGain(){return{gain:{setValueAtTime(){}},connect(){},disconnect(){}};}
 createBufferSource(){const n={buffer:null,onended:null as null|(()=>void),starts:[] as number[][],stops:0,connect(){},disconnect(){},start(...v:number[]){this.starts.push(v);},stop(){this.stops++;}};this.nodes.push(n);return n;}
 async decodeAudioData(){return{sampleRate:22050,numberOfChannels:1,length:1000,getChannelData:()=>pcm};}
 async resume(){if(this.resumeWait)await this.resumeWait;this.state='running';}
 async close(){this.state='closed';}
 suspend(){this.state='suspended';this.dispatchEvent(new Event('statechange'));}
}
async function fixture(){const context=new Context(),commits:{frame:number;sourcesStarted:number}[]=[],clock=new ContinuousSourceStreamClockCandidate(plan,{createContext:()=>context as unknown as AudioContext,commitHeldFrame:frame=>{commits.push({frame,sourcesStarted:context.nodes.length});return true;}});assert.equal((await clock.prepare(raw.slice().buffer)).accepted,true);return{clock,context,commits};}
const user={activation:'user' as const,reducedMotion:false};
test('source latency is held before activation and passed as the exact buffer offset',async()=>{
 const{clock,context}=await fixture();assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().audio.decodedSample,100);assert.equal(context.nodes.length,0);
 context.currentTime=20;await clock.play(user);assert.deepEqual(context.nodes[0].starts,[[20,100/22050]]);assert.equal(clock.snapshot().audio.playbackAnchor?.contextTime,20);
 context.currentTime=20.03;const s=clock.snapshot();assert.ok(Math.abs(s.elapsedSeconds-.03)<1e-12);assert.equal(s.frame,1);await clock.close();
});
test('fractional samples survive pause and resume without restarting the source clock',async()=>{
 const{clock,context}=await fixture();await clock.play(user);context.currentTime=.010125;const s=clock.snapshot();clock.pause();context.currentTime=200;
 assert.equal(clock.snapshot().elapsedSeconds,s.elapsedSeconds);await clock.play(user);assert.equal(context.nodes[1].starts[0][1],s.audio.decodedSample/22050);
 context.currentTime+=.00125;assert.ok(Math.abs(clock.snapshot().elapsedSeconds-.011375)<1e-10);await clock.close();
});
test('pause binds the final audio cursor even when the native clock advances between observations',async()=>{
 const{clock,context}=await fixture();await clock.play(user);let now=.02;
 Object.defineProperty(context,'currentTime',{configurable:true,get(){now+=.001;return now;}});
 clock.pause();const held=clock.snapshot();assert.ok(Math.abs(held.elapsedSeconds-(held.audio.decodedSample-plan.latencySamples)/plan.decoder.sampleRate)<1e-12);
 await clock.close();
});
test('decoder EOF does not end the visual timeline; silent tail can pause and resume without a new source node',async()=>{
 const{clock,context}=await fixture();await clock.play(user);context.currentTime=.05;context.nodes[0].onended();
 let s=clock.snapshot();assert.equal(s.audioEnded,true);assert.equal(s.timelineReachedEnd,false);assert.equal(s.frame,1);
 context.currentTime=.11;assert.equal(clock.snapshot().frame,2);clock.pause();context.currentTime=200;await clock.play(user);assert.equal(context.nodes.length,1);
 context.currentTime=200.15;s=clock.snapshot();assert.equal(s.frame,4);assert.equal(s.timelineReachedEnd,true);assert.equal(s.lessonCompleted,false);await clock.close();
});
test('external audio suspension holds both ordinary playback and the visual tail',async()=>{
 for(const tail of [false,true]){const{clock,context}=await fixture();await clock.play(user);context.currentTime=.02;if(tail)context.nodes[0].onended();context.suspend();const s=clock.snapshot();assert.equal(s.phase,'paused');context.currentTime=30;assert.equal(clock.snapshot().elapsedSeconds,s.elapsedSeconds);await clock.close();}
});
test('pending activation cannot survive pause, Replay or close',async()=>{
 for(const operation of ['pause','replay','close'] as const){const{clock,context}=await fixture();let release!:()=>void;context.resumeWait=new Promise(r=>{release=r;});const pending=clock.play(user);
 await clock[operation]();release();assert.equal((await pending).accepted,false);assert.equal(context.nodes.length,0);assert.equal(clock.snapshot().frame,1);await clock.close();}
});
test('Replay resets both the source cursor and frame without automatic audio',async()=>{
 const{clock,context}=await fixture();await clock.play(user);context.currentTime=.02;clock.replay();assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().audio.decodedSample,100);assert.equal(context.nodes.length,1);
 context.currentTime=2;await clock.play(user);assert.equal(context.nodes[1].starts[0][1],100/22050);await clock.close();
});
test('reduced motion and invalid policies remain gated after preparation',async()=>{
 const{clock,context}=await fixture();assert.equal((await clock.play({activation:'automatic',reducedMotion:true})).accepted,false);assert.equal((await clock.play({activation:'invalid',reducedMotion:false} as never)).accepted,false);assert.equal(context.nodes.length,0);await clock.close();
});
test('discontinuous, negative-seek and impossible latency plans require another source model',()=>{
 for(const delta of [{sourceSegmentCount:2},{sourceHasNegativeSeek:true},{latencySamples:1000},{firstFrame:2},{fps:0}])assert.throws(()=>new ContinuousSourceStreamClockCandidate({...plan,...delta} as never,{commitHeldFrame:()=>true}),/unsupported-continuous-source-plan/);
});
test('held frame is committed before initial sound and before Replay sound starts',async()=>{
 const{clock,context,commits}=await fixture();await clock.play(user);assert.deepEqual(commits[0],{frame:1,sourcesStarted:0});
 context.currentTime=.02;clock.replay();await clock.play(user);assert.deepEqual(commits.at(-1),{frame:1,sourcesStarted:1});assert.equal(context.nodes.length,2);await clock.close();
});
test('missing or failed synchronous frame commit prevents native sound from starting',async()=>{
 for(const commitHeldFrame of [()=>false,()=>{throw Error('paint-failed');},()=>Promise.resolve(true)]){
  const context=new Context(),clock=new ContinuousSourceStreamClockCandidate(plan,{createContext:()=>context as unknown as AudioContext,commitHeldFrame:commitHeldFrame as never});
  await clock.prepare(raw.slice().buffer);assert.equal((await clock.play(user)).reason,'source-frame-not-committed');assert.equal(context.nodes.length,0);await clock.close();
 }
});
test('modern frame inspection holds audio and resumes the explicit continuous candidate coordinate',async()=>{
 const{clock,context,commits}=await fixture();await clock.play(user);assert.equal(clock.seekCandidateFrame(2).accepted,true);
 assert.equal(clock.snapshot().phase,'paused');assert.equal(clock.snapshot().frame,2);assert.equal(commits.at(-1)?.frame,2);
 // The short unit buffer ends before frame 2; resume the visual tail without a new source node.
 assert.equal(clock.snapshot().audio.decodedSample,1000);await clock.play(user);assert.equal(context.nodes.length,1);
 assert.equal(clock.seekCandidateFrame(5).accepted,false);assert.equal(clock.seekCandidateFrame(1.5).accepted,false);await clock.close();
});

test('the four audited leading-frame counts schedule native sound without consuming PCM during the opening',async()=>{
 for(const first of [9,8,2,5]){
  const context=new Context(),p={...plan,audioFirstFrame:first,lastFrame:first+3};
  const clock=new ContinuousSourceStreamClockCandidate(p,{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});
  await clock.prepare(raw.slice().buffer);context.currentTime=20;await clock.play(user);const lead=(first-1)/12;
  assert.equal(context.nodes[0].starts[0][0],20+lead);assert.equal(context.nodes[0].starts[0][1],100/22050);
  context.currentTime=20+lead/2;assert.equal(clock.snapshot().audio.decodedSample,100);assert(Math.abs(clock.snapshot().elapsedSeconds-lead/2)<1e-10);
  clock.pause();const held=clock.snapshot();assert.equal(context.nodes[0].stops,1);context.currentTime=40;await clock.play(user);
  const scheduled=context.nodes[1].starts[0][0];assert(Math.abs(scheduled-(40+lead-held.elapsedSeconds))<1e-10);assert.equal(clock.snapshot().audio.decodedSample,100);
  context.currentTime=scheduled+.01;assert(Math.abs(clock.snapshot().audio.decodedSample-320.5)<1e-8);assert.equal(clock.snapshot().frame,first);
  clock.pause();assert(Math.abs(clock.snapshot().elapsedSeconds-(lead+.01))<1e-10);await clock.close();
 }
});
test('inspection and Replay re-enter the correct part of the opening without seeking past source samples',async()=>{
 const context=new Context(),p={...plan,audioFirstFrame:9,lastFrame:12};const clock=new ContinuousSourceStreamClockCandidate(p,{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});await clock.prepare(raw.slice().buffer);
 clock.seekCandidateFrame(5);assert.equal(clock.snapshot().audio.decodedSample,100);context.currentTime=30;await clock.play(user);assert.equal(context.nodes[0].starts[0][0],30+4/12);
 clock.pause();clock.seekCandidateFrame(9);await clock.play(user);assert.equal(context.nodes[1].starts[0][0],30);assert.equal(context.nodes[1].starts[0][1],100/22050);
 clock.replay();assert.equal(clock.snapshot().frame,1);await clock.play(user);assert.equal(context.nodes[2].starts[0][0],30+8/12);await clock.close();
});
test('native interruption before scheduled sound preserves the exact stop time despite a later observation',async()=>{
 const context=new Context(),clock=new ContinuousSourceStreamClockCandidate({...plan,audioFirstFrame:9,lastFrame:12},{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});await clock.prepare(raw.slice().buffer);context.currentTime=20;await clock.play(user);context.currentTime=20.2;context.suspend();context.currentTime=200;
 const held=clock.snapshot();assert.equal(held.phase,'paused');assert(Math.abs(held.elapsedSeconds-.2)<1e-10);assert.equal(held.audio.decodedSample,100);await clock.play(user);assert(Math.abs(context.nodes[1].starts[0][0]-(200+8/12-.2))<1e-10);await clock.close();
});
test('invalid leading-frame plans are rejected',()=>{
 for(const audioFirstFrame of [0,-1,2.5,5,null,NaN,Infinity])assert.throws(()=>new ContinuousSourceStreamClockCandidate({...plan,audioFirstFrame} as never,{commitHeldFrame:()=>true}),/unsupported-continuous-source-plan/);
});
