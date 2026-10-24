import assert from 'node:assert/strict';import test from 'node:test';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {SourceStreamCycleClockV1} from '../src/source-stream-cycle-clock-v1';
import {SourceStreamCycleClockV2,sourceStreamCyclePosition,sourceStreamCycleSlices,type SourceStreamCycleClockPlan} from '../src/source-stream-cycle-clock-v2';
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const source=JSON.parse(readFileSync(new URL('../../../migrations/shared-alg001-l07-p006/native-v1/stream-model-v1.json',import.meta.url),'utf8'));
const measured=JSON.parse(readFileSync(new URL('../../../migrations/shared-alg001-l07-p006/native-v1/decode-native-v1.json',import.meta.url),'utf8'));
const real:SourceStreamCycleClockPlan={version:1,sourceSwfSha256:source.sourceSwfSha256,frameDomain:'sprite-223',firstFrame:1,frameCount:1845,fps:12,playbackMode:'loop',
 decoder:{sourceBytes:measured.sourceBytes,sourceSha256:measured.sourceSha256,sampleRate:44100,channels:1,decodedSamples:measured.decodedSamples,pcmSha256:measured.pcmSha256},segments:source.segments,emptyNegativeBlocks:[],alignmentStatus:'source-run-candidate-not-original-runtime-accepted'};
const user={activation:'user' as const,reducedMotion:false},near=(a:number,b:number)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('real P006 binary/XML stream and browser PCM binding admit only the exact 44100 plan',()=>{
 assert.equal(source.binaryAndXmlPayloadByteEquivalent,true);assert.equal(measured.pass,true);assert.equal(measured.contextClosed,true);
 assert.equal(real.decoder.sourceSha256,'eca77ae751726a8b10efb9ef5a33359a810ae089d658346a3253a92ced424b2a');assert.equal(real.decoder.pcmSha256,'ec8eb8d25621b0b8b5cf81839b7ec59c8284d6b056c3f8269cc9d728199ca16a');
 assert.equal(real.decoder.decodedSamples,6755328);assert.doesNotThrow(()=>new SourceStreamCycleClockV2(real,{commitHeldFrame:()=>true}));
 assert.deepEqual(real.segments,[{firstFrame:6,firstDecodedSample:1695,endDecodedSample:4608},{firstFrame:8,firstDecodedSample:5370,endDecodedSample:4503168},{firstFrame:1233,firstDecodedSample:4503570,endDecodedSample:6755328}]);
 assert.deepEqual(sourceStreamCyclePosition(real,1844/12),{cycleIndex:0,seconds:1844/12,frame:1845});
 assert.deepEqual(sourceStreamCyclePosition(real,153.75),{cycleIndex:1,seconds:0,frame:1});
 const [first,next,last]=sourceStreamCycleSlices(real,0,0);near(first.delaySeconds,5/12);near(first.firstDecodedSample,1695);near(first.durationSeconds,2913/44100);near(next.delaySeconds,7/12);near(last.delaySeconds,1232/12);
 assert(first.delaySeconds+first.durationSeconds<next.delaySeconds);assert(next.delaySeconds+next.durationSeconds<last.delaySeconds);
 for(const rate of [11025,32000,48000])assert.throws(()=>new SourceStreamCycleClockV2({...real,decoder:{...real.decoder,sampleRate:rate}},{commitHeldFrame:()=>true}));
});
type Node={buffer:null;onended:null|(()=>void);starts:number[][];stops:number;disconnected:boolean;connect():void;disconnect():void;start(...args:number[]):void;stop():void};
class Context extends EventTarget{
 currentTime=0;state='suspended';destination={};nodes:Node[]=[];resumeWait?:Promise<void>;closed=0;
 constructor(readonly sampleRate:number,readonly pcm:Float32Array){super();}
 createGain(){return{gain:{setValueAtTime(){}},connect(){},disconnect(){}};}
 createBufferSource(){const node:Node={buffer:null,onended:null,starts:[],stops:0,disconnected:false,connect(){},disconnect(){this.disconnected=true;},start(...args){this.starts.push(args);},stop(){this.stops++;}};this.nodes.push(node);return node;}
 async decodeAudioData(){return{sampleRate:this.sampleRate,numberOfChannels:1,length:this.pcm.length,getChannelData:()=>this.pcm};}
 async resume(){await this.resumeWait;this.state='running';}async close(){this.state='closed';this.closed++;}
 suspend(){this.state='suspended';this.dispatchEvent(new Event('statechange'));}
}
async function fixture(version:1|2,rate:22050|44100){
 const raw=Uint8Array.of(1,2,3,4),pcm=new Float32Array(rate===44100?6755328:1281600),context=new Context(rate,pcm);
 const plan:SourceStreamCycleClockPlan=rate===44100?{...real,decoder:{...real.decoder,sourceBytes:4,sourceSha256:hash(raw),pcmSha256:hash(new Uint8Array(pcm.buffer))}}:
 {version:1,sourceSwfSha256:'4ad5f233a2625d2d795cd585278abfa232055f36f92906568621698d72c3cedc',frameDomain:'sprite-89',firstFrame:1,frameCount:714,fps:12,playbackMode:'loop',decoder:{sourceBytes:4,sourceSha256:hash(raw),sampleRate:22050,channels:1,decodedSamples:pcm.length,pcmSha256:hash(new Uint8Array(pcm.buffer))},segments:[{firstFrame:8,firstDecodedSample:1673,endDecodedSample:1026432},{firstFrame:576,firstDecodedSample:1026548,endDecodedSample:1281600}],emptyNegativeBlocks:[{frame:567,samples:0,seek:-2123,mp3Bytes:0}],alignmentStatus:'source-run-candidate-not-original-runtime-accepted'};
 const commits:number[]=[],options={createContext:()=>context as unknown as AudioContext,commitHeldFrame:(f:number)=>{commits.push(f);return true;}};
 const clock=version===1?new SourceStreamCycleClockV1(plan,options):new SourceStreamCycleClockV2(plan,options);
 assert((await clock.prepare(raw.buffer)).accepted);return{clock,context,commits};
}
test('modeled 44100 scheduling, source gaps, last-frame wrap, seek, Replay and cleanup retain exact sample units',async()=>{
 const{clock,context}=await fixture(2,44100);await clock.play(user);assert.equal(context.nodes.length,9);
 const [first,next,last]=context.nodes.slice(0,3).map(n=>n.starts[0]);near(first[1],1695/44100);near(next[1],5370/44100);near(last[1],4503570/44100);
 context.currentTime=.5;assert.equal(clock.snapshot().audio.phase,'source-gap');clock.pause();assert(context.nodes.every(n=>n.stops===1&&n.disconnected));
 assert(clock.seekCandidateFrame(1845).accepted);assert.equal(clock.seekCandidateFrame(1846).accepted,false);context.currentTime=100;await clock.play(user);
 context.currentTime=100+1/12;assert.equal(clock.snapshot().cycleIndex,1);assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().timelineReachedEnd,false);
 clock.replay();assert.equal(clock.snapshot().frame,1);assert.equal(clock.snapshot().cycleIndex,0);await clock.close();assert.equal(context.state,'closed');assert.equal(context.closed,1);assert(context.nodes.every(n=>n.disconnected));
});
test('the same modeled 22050 fixture yields identical v1/v2 states and native scheduling',async()=>{
 const old=await fixture(1,22050),next=await fixture(2,22050);
 await old.clock.play(user);await next.clock.play(user);assert.deepEqual(next.context.nodes.map(n=>n.starts),old.context.nodes.map(n=>n.starts));
 for(const time of [47.5,59.49,59.5,109.504125]){old.context.currentTime=next.context.currentTime=time;assert.deepEqual(next.clock.snapshot(),old.clock.snapshot());}
 old.clock.pause();next.clock.pause();assert.deepEqual(next.clock.snapshot(),old.clock.snapshot());old.clock.replay();next.clock.replay();assert.deepEqual(next.clock.snapshot(),old.clock.snapshot());
 assert.deepEqual(next.commits,old.commits);await old.clock.close();await next.clock.close();assert.deepEqual(next.clock.snapshot(),old.clock.snapshot());
});
test('44100 interruption and late pending activation retire native sources without automatic resume',async()=>{
 const{clock,context}=await fixture(2,44100);await clock.play(user);context.currentTime=154;context.suspend();assert.equal(clock.snapshot().phase,'paused');assert.equal(clock.snapshot().cycleIndex,1);assert(context.nodes.every(n=>n.stops===1));await clock.close();
 const pending=await fixture(2,44100);let release!:()=>void;pending.context.resumeWait=new Promise(r=>{release=r;});const start=pending.clock.play(user);pending.clock.pause();release();assert.equal((await start).accepted,false);assert.equal(pending.context.nodes.length,0);await pending.clock.close();
});
