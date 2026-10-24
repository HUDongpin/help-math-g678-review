import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import test from 'node:test';
import {SourceStreamRunsClockV1,type SourceStreamRunsClockPlan} from '../src/source-stream-runs-clock-v1';
import {SourceStreamRunsClockV2} from '../src/source-stream-runs-clock-v2';
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex'),raw=Uint8Array.of(41,58,60,94);
const left=Float32Array.from({length:44100},(_,i)=>Math.sin(i*.03)),right=Float32Array.from({length:44100},(_,i)=>Math.cos(i*.07));
const digest=(channels:Float32Array[])=>{const b=Buffer.alloc(channels.length*left.length*4);channels.forEach((samples,ch)=>samples.forEach((v,i)=>b.writeFloatLE(v,(ch*left.length+i)*4)));return hash(b);};
const plan=(stereo=false):SourceStreamRunsClockPlan=>({version:1,sourceSwfSha256:'a'.repeat(64),frameDomain:'sprite-60',firstFrame:1,lastFrame:61,fps:12,decoder:{sourceBytes:raw.length,sourceSha256:hash(raw),sampleRate:22050,channels:stereo?2:1,decodedSamples:left.length,pcmSha256:digest(stereo?[left,right]:[left])},segments:[{firstFrame:2,firstDecodedSample:1674,endDecodedSample:18000},{firstFrame:25,firstDecodedSample:18100,endDecodedSample:44100}],emptyNegativeBlocks:[],alignmentStatus:'source-run-candidate-not-original-runtime-accepted'});
class Context extends EventTarget{
 currentTime=0;state='suspended';sampleRate=22050;destination={};nodes:{buffer:unknown;starts:number[][];stops:number;disconnected:boolean;onended:null|(()=>void);connect:()=>void;disconnect:()=>void;start:(...n:number[])=>void;stop:()=>void}[]=[];
 constructor(readonly channels:Float32Array[]){super();}createGain(){return{gain:{setValueAtTime(){}},connect(){},disconnect(){}};}
 createBufferSource(){const n={buffer:null as unknown,starts:[]as number[][],stops:0,disconnected:false,onended:null as null|(()=>void),connect(){},disconnect(){this.disconnected=true;},start(...n:number[]){this.starts.push(n);},stop(){this.stops++;}};this.nodes.push(n);return n;}
 async decodeAudioData(){return{sampleRate:22050,numberOfChannels:this.channels.length,length:left.length,getChannelData:(ch:number)=>this.channels[ch]};}async resume(){this.state='running';}async close(){this.state='closed';}
}
const user={activation:'user' as const,reducedMotion:false};
test('mono successor matches frozen v1 across runs, silent gap, fractional resume, seek and closure',async()=>{
 const a=new Context([left]),b=new Context([left]),ca=new SourceStreamRunsClockV1(plan(),{createContext:()=>a as unknown as AudioContext,commitHeldFrame:()=>true}),cb=new SourceStreamRunsClockV2(plan(),{createContext:()=>b as unknown as AudioContext,commitHeldFrame:()=>true});
 for(const c of[ca,cb]){assert((await c.prepare(raw.slice().buffer)).accepted);assert((await c.play(user)).accepted);}
 for(const seconds of[.02,.3125,1.3,2.141592,4.8]){a.currentTime=b.currentTime=seconds;assert.deepEqual(ca.snapshot(),cb.snapshot());}
 ca.pause();cb.pause();a.currentTime=b.currentTime=10;await ca.play(user);await cb.play(user);assert.deepEqual(a.nodes.map(n=>n.starts),b.nodes.map(n=>n.starts));assert.deepEqual(ca.snapshot(),cb.snapshot());
 ca.seekCandidateFrame(20);cb.seekCandidateFrame(20);assert.deepEqual(ca.snapshot(),cb.snapshot());await ca.close();await cb.close();assert.deepEqual(a.nodes.map(n=>[n.stops,n.disconnected]),b.nodes.map(n=>[n.stops,n.disconnected]));
});
test('stereo plays the original two-channel buffer and channel-major identity binds both channels',async()=>{
 const context=new Context([left,right]),c=new SourceStreamRunsClockV2(plan(true),{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});assert((await c.prepare(raw.slice().buffer)).accepted);await c.play(user);assert.equal(context.nodes.length,2);
 for(const n of context.nodes){const buffer=n.buffer as AudioBuffer;assert.equal(buffer.numberOfChannels,2);assert.equal(buffer.getChannelData(0),left);assert.equal(buffer.getChannelData(1),right);}
 context.currentTime=.4;const sample=c.snapshot().audio.decodedSample;c.pause();context.currentTime=20;await c.play(user);assert.equal(context.nodes[2].starts[0][1],sample/22050);await c.close();assert(context.nodes.every(n=>n.stops===1&&n.disconnected));
});
test('missing or altered second channel, bad source bytes and failed frame commit fail closed before sound',async()=>{
 const drift=right.slice();drift[10]+=.01;
 for(const channels of[[left],[left,drift]]){const context=new Context(channels),c=new SourceStreamRunsClockV2(plan(true),{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});assert.equal((await c.prepare(raw.slice().buffer)).reason,'decoded-buffer-identity-mismatch');assert.equal(context.nodes.length,0);assert.equal(context.state,'closed');}
 const context=new Context([left,right]),c=new SourceStreamRunsClockV2(plan(true),{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});assert.equal((await c.prepare(Uint8Array.of(8).buffer)).reason,'source-byte-identity-mismatch');assert.equal(context.nodes.length,0);
 const failed=new Context([left,right]),blocked=new SourceStreamRunsClockV2(plan(true),{createContext:()=>failed as unknown as AudioContext,commitHeldFrame:()=>false});assert.equal((await blocked.prepare(raw.slice().buffer)).accepted,false);assert.equal(failed.state,'closed');
});
test('unsupported channel counts remain rejected and a one-frame tail is timed by native context',async()=>{
 assert.throws(()=>new SourceStreamRunsClockV2({...plan(true),decoder:{...plan(true).decoder,channels:3}}as never,{commitHeldFrame:()=>true}),/unsupported/);
 const context=new Context([left,right]),c=new SourceStreamRunsClockV2(plan(true),{createContext:()=>context as unknown as AudioContext,commitHeldFrame:()=>true});await c.prepare(raw.slice().buffer);c.seekCandidateFrame(60);await c.play(user);context.currentTime=.04;assert.equal(c.snapshot().frame,60);assert.equal(c.snapshot().timelineReachedEnd,false);context.currentTime=1/12;assert.equal(c.snapshot().frame,61);assert.equal(c.snapshot().timelineReachedEnd,true);assert.equal(c.snapshot().lessonCompleted,false);await c.close();
});
