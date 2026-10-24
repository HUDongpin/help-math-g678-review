import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {SourceStreamCycleClockV1, sourceStreamCyclePosition, sourceStreamCycleSlices, type SourceStreamCycleClockPlan} from '../src/source-stream-cycle-clock-v1';
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const raw=Uint8Array.of(1,2,3,4),pcm=new Float32Array(1281600);
const plan:SourceStreamCycleClockPlan={version:1,sourceSwfSha256:'4ad5f233a2625d2d795cd585278abfa232055f36f92906568621698d72c3cedc',frameDomain:'sprite-89',firstFrame:1,frameCount:714,fps:12,playbackMode:'loop',
  decoder:{sourceBytes:4,sourceSha256:hash(raw),sampleRate:22050,channels:1,decodedSamples:pcm.length,pcmSha256:hash(new Uint8Array(pcm.buffer))},
  segments:[{firstFrame:8,firstDecodedSample:1673,endDecodedSample:1026432},{firstFrame:576,firstDecodedSample:1026548,endDecodedSample:1281600}],
  emptyNegativeBlocks:[{frame:567,samples:0,seek:-2123,mp3Bytes:0}],alignmentStatus:'source-run-candidate-not-original-runtime-accepted'};
const user={activation:'user' as const,reducedMotion:false};
type FakeNode={buffer:null;onended:null|(()=>void);starts:number[][];stops:number;disconnected:boolean;connect():void;disconnect():void;start(...args:number[]):void;stop():void};
class Context extends EventTarget {
  currentTime=0;state='suspended';sampleRate=22050;destination={};nodes:FakeNode[]=[];resumeWait?:Promise<void>;volumes:number[]=[];rejectNewNode=false;
  createGain(){return{gain:{setValueAtTime:(v:number)=>this.volumes.push(v)},connect(){},disconnect(){}};}
  createBufferSource():FakeNode{
    if(this.rejectNewNode)throw Error('native-source-allocation-failed');
    const node={buffer:null,onended:null as null|(()=>void),starts:[] as number[][],stops:0,disconnected:false,
      connect(){},disconnect(){this.disconnected=true;},start(...args:number[]){this.starts.push(args);},stop(){this.stops++;}};
    this.nodes.push(node);return node;
  }
  async decodeAudioData(){return{sampleRate:22050,numberOfChannels:1,length:pcm.length,getChannelData:()=>pcm};}
  async resume(){if(this.resumeWait)await this.resumeWait;this.state='running';}
  async close(){this.state='closed';}
  suspend(){this.state='suspended';this.dispatchEvent(new Event('statechange'));}
}
async function fixture(){
  const context=new Context(),commits:number[]=[];
  const clock=new SourceStreamCycleClockV1(plan,{createContext:()=>context as unknown as AudioContext,commitHeldFrame:f=>{commits.push(f);return true;}});
  assert((await clock.prepare(raw.slice().buffer)).accepted);return{clock,context,commits};
}
const near=(a:number,b:number)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('the complete last frame and all native audio remain before the59.5s cycle boundary',()=>{
  assert.equal(sourceStreamCyclePosition(plan,713/12).frame,714);
  assert.equal(sourceStreamCyclePosition(plan,59.49).frame,714);
  assert.deepEqual(sourceStreamCyclePosition(plan,59.5),{cycleIndex:1,seconds:0,frame:1});
  assert.deepEqual(sourceStreamCyclePosition(plan,119),{cycleIndex:2,seconds:0,frame:1});
  const [last]=sourceStreamCycleSlices(plan,713/12,0);assert.equal(last.segmentIndex,1);
  near(last.durationSeconds,59.483650793650796-713/12);assert(last.durationSeconds>.066);
  assert.deepEqual(sourceStreamCycleSlices(plan,59.49,0),[]);
});
test('native scheduling contains three exact cycles with no renderer-triggered restart',async()=>{
  const{clock,context,commits}=await fixture();context.currentTime=10;await clock.play(user);
  assert.equal(context.nodes.length,6);assert.deepEqual(commits,[1,1]);
  for(let c=0;c<3;c++){
    const [a,b]=context.nodes.slice(c*2,c*2+2).map(n=>n.starts[0]);
    near(a[0],10+c*59.5+7/12);near(a[1],1673/22050);near(a[2],1024759/22050);
    near(b[0],10+c*59.5+575/12);near(b[1],1026548/22050);near(b[2],255052/22050);
    assert(b[0]>a[0]+a[2]);assert(b[0]+b[2]<10+(c+1)*59.5);
  }
  context.currentTime=10+59.46;assert.equal(clock.snapshot().frame,714);assert.equal(clock.snapshot().activeSegmentIndex,1);assert.equal(clock.snapshot().phase,'playing');
  context.currentTime=10+59.49;assert.equal(clock.snapshot().frame,714);assert.equal(clock.snapshot().audio.decodedSample,1281600);
  context.currentTime=10+59.5;assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().cycleIndex,1);
  assert.equal(context.nodes.length,6);assert(context.nodes.every(n=>n.stops===0));assert.equal(clock.snapshot().timelineReachedEnd,false);await clock.close();
});
test('native ended events replenish future cycles without any drawing callback',async()=>{
  const{clock,context}=await fixture();await clock.play(user);
  context.currentTime=59.5+47.05766439909297;context.nodes[2].onended?.();
  assert.equal(context.nodes.length,8);near(context.nodes[6].starts[0][0],178.5+7/12);near(context.nodes[7].starts[0][0],178.5+575/12);
  assert.equal(clock.snapshot().scheduledThroughCycle,3);await clock.close();
});
test('pause in the source gap retires all current/future nodes and resumes its remaining native delay',async()=>{
  const{clock,context}=await fixture();await clock.play(user);context.currentTime=47.5;
  assert.equal(clock.snapshot().activeSegmentIndex,-1);assert.equal(clock.snapshot().audio.decodedSample,1026432);clock.pause();
  assert(context.nodes.every(n=>n.stops===1&&n.disconnected));context.currentTime=100;await clock.play(user);
  assert.equal(context.nodes.length,11);near(context.nodes[6].starts[0][0],100+575/12-47.5);near(context.nodes[6].starts[0][1],1026548/22050);
  near(clock.snapshot().elapsedSeconds,47.5);await clock.close();
});
test('fractional pause in the second cycle retains that cycle and the exact sample coordinate',async()=>{
  const{clock,context}=await fixture();await clock.play(user);context.currentTime=59.5+50.004125;const before=clock.snapshot();clock.pause();
  context.currentTime=500;await clock.play(user);assert.equal(clock.snapshot().cycleIndex,1);near(context.nodes[6].starts[0][1],before.audio.decodedSample/22050);
  context.currentTime=500.125;near(clock.snapshot().elapsedSeconds,109.504125+.125);await clock.close();
});
test('Replay and inspection reset the cycle origin and never introduce a715th source frame',async()=>{
  const{clock,context}=await fixture();await clock.play(user);context.currentTime=120;assert.equal(clock.snapshot().cycleIndex,2);clock.replay();
  assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().cycleIndex,0);assert(context.nodes.every(n=>n.stops===1));
  assert.equal(clock.seekCandidateFrame(715).accepted,false);assert(clock.seekCandidateFrame(714).accepted);assert.equal(clock.snapshot().phase,'paused');
  context.currentTime=200;await clock.play(user);near(context.nodes[6].starts[0][2],59.483650793650796-713/12);
  context.currentTime=200+1/12;assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().cycleIndex,1);await clock.close();
});
test('interruption and pending activation cannot leak future source nodes',async()=>{
  const{clock,context}=await fixture();await clock.play(user);context.currentTime=61.1;context.suspend();context.currentTime=300;
  assert.equal(clock.snapshot().phase,'paused');near(clock.snapshot().elapsedSeconds,61.1);assert.equal(clock.snapshot().cycleIndex,1);assert(context.nodes.every(n=>n.stops===1));await clock.close();
  for(const action of ['pause','replay','close'] as const){
    const{clock,context}=await fixture();let release!:()=>void;context.resumeWait=new Promise(r=>{release=r;});const pending=clock.play(user);
    await clock[action]();release();assert.equal((await pending).accepted,false);assert.equal(context.nodes.length,0);await clock.close();
  }
});
test('source hashes, decoded PCM, reduced motion and failed paint prevent playback',async()=>{
  const{clock,context}=await fixture();assert.equal((await clock.play({activation:'automatic',reducedMotion:true})).accepted,false);assert.equal(context.nodes.length,0);
  clock.setVolume(0);await clock.play(user);assert.equal(context.volumes.at(-1),0);await clock.close();assert(context.nodes.every(n=>n.disconnected&&n.stops===1));
  const bad=new SourceStreamCycleClockV1(plan,{createContext:()=>new Context() as unknown as AudioContext,commitHeldFrame:()=>true});assert.equal((await bad.prepare(Uint8Array.of(9).buffer)).reason,'source-byte-identity-mismatch');
  const c=new Context(),blocked=new SourceStreamCycleClockV1(plan,{createContext:()=>c as unknown as AudioContext,commitHeldFrame:()=>false});assert.equal((await blocked.prepare(raw.slice().buffer)).accepted,false);assert.equal(c.state,'closed');
  const wrong=new SourceStreamCycleClockV1({...plan,decoder:{...plan.decoder,pcmSha256:'0'.repeat(64)}},{createContext:()=>new Context() as unknown as AudioContext,commitHeldFrame:()=>true});assert.equal((await wrong.prepare(raw.slice().buffer)).reason,'decoded-buffer-identity-mismatch');
});
test('invalid loops, overlaps and a run extending beyond the complete cycle are rejected',()=>{
  for(const p of [{...plan,frameCount:713},{...plan,playbackMode:'once'},{...plan,segments:[...plan.segments].reverse()},
    {...plan,segments:[plan.segments[0],{...plan.segments[1],firstFrame:20}]},{...plan,emptyNegativeBlocks:[{frame:567,samples:0,seek:0,mp3Bytes:0}]}])
    assert.throws(()=>new SourceStreamCycleClockV1(p as SourceStreamCycleClockPlan,{commitHeldFrame:()=>true}));
  assert.throws(()=>sourceStreamCycleSlices(plan,60,0));assert.throws(()=>sourceStreamCyclePosition(plan,-1));
});
test('native replenishment failure is retained as failed state and retires all scheduled sounds',async()=>{
  const{clock,context}=await fixture();await clock.play(user);context.rejectNewNode=true;context.currentTime=110;
  assert.doesNotThrow(()=>context.nodes[2].onended?.());assert.equal(clock.snapshot().phase,'failed');assert.equal(clock.snapshot().failure,'native-source-allocation-failed');
  assert(context.nodes.every(n=>n.disconnected));await clock.close();
});
