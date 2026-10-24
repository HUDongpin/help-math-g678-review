import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {SourceLinearAudioController,sourceLinearAudioConfig,sourceLinearFrameToSample,
  type SourceLinearAudioConfig} from '../../../packages/demos/src/source-linear-audio';

const HASH='a'.repeat(64);
const CONFIG:SourceLinearAudioConfig={frameCount:20,fps:10,sampleRate:1000,channels:1,
  audioStartFrame:3,decodedSamples:1400,originalBlockHeaderSamples:1400,
  sourceSwfSha256:HASH,mp3Sha256:'b'.repeat(64)};
const deferred=<T>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});
  return {promise,resolve};};
const flush=async()=>{await new Promise<void>(resolve=>setImmediate(resolve));};
class Gain {
  gain={value:-1};disconnects=0;
  connect(){}disconnect(){this.disconnects++;}
}
class Source {
  buffer:AudioBuffer|null=null;loop=false;onended:(()=>void)|null=null;
  starts:Array<[number,number,number|undefined]>=[];stops=0;
  connect(_gain:Gain){}start(when:number,offset:number,duration?:number){this.starts.push([when,offset,duration]);}
  stop(){this.stops++;}disconnect(){}
}
class Context extends EventTarget {
  sampleRate=CONFIG.sampleRate;state:AudioContextState='suspended';currentTime=0;
  destination={};gain=new Gain();sources:Source[]=[];resumeCalls=0;closeCalls=0;
  createGain(){return this.gain;}
  createBufferSource(){const source=new Source();this.sources.push(source);return source;}
  async resume(){this.resumeCalls++;this.setState('running');}
  async close(){this.closeCalls++;this.setState('closed');}
  setState(state:AudioContextState){this.state=state;this.dispatchEvent(new Event('statechange'));}
}
function buffer(config=CONFIG):AudioBuffer {
  const channel=new Float32Array(config.decodedSamples);
  return {sampleRate:config.sampleRate,numberOfChannels:config.channels,length:config.decodedSamples,
    getChannelData:()=>channel} as unknown as AudioBuffer;
}

test('P055 config can bind exact source and decoded sample facts without an implicit fetch',()=>{
  const index=JSON.parse(readFileSync(new URL('../../../output/nms-l02-ts-family-20260927/audio/p055-main-audio-index.json',import.meta.url),'utf8'));
  const schedule=sourceLinearAudioConfig({frameCount:index.frameDomain.declaredFrames,
    fps:index.frameDomain.fps,sampleRate:index.streamHead.sampleRateHz,channels:index.streamHead.channels,
    audioStartFrame:index.firstBlockFrame,decodedSamples:index.decode.decodedSamples,
    originalBlockHeaderSamples:index.declaredBlockHeaderSamples,
    sourceSwfSha256:index.source.sha256,mp3Sha256:index.mp3.sha256});
  assert.equal(schedule.frameCount,351);
  assert.equal(schedule.audioStartTimelineSample,7350);
  assert.equal(schedule.audioEndTimelineSample,644406);
  assert.equal(schedule.terminalTimelineSample,644962.5);
  assert.throws(()=>sourceLinearAudioConfig({...CONFIG,originalBlockHeaderSamples:1399}),
    /LINEAR_AUDIO_SOURCE_SAMPLES/);
  assert.throws(()=>sourceLinearAudioConfig({...CONFIG,decodedSamples:5000,
    originalBlockHeaderSamples:5000}),/LINEAR_AUDIO_TIMELINE/);
});

test('explicit Play is lazy; pause, seek and Replay preserve the linear clock',async()=>{
  const context=new Context();let reads=0;
  const player=new SourceLinearAudioController(CONFIG,{createContext:()=>context as unknown as AudioContext,
    readVerified:async()=>{reads++;return buffer();}});
  assert.equal(player.snapshot().phase,'paused');
  assert.equal(reads,0);assert.equal(context.resumeCalls,0);
  player.setVolume(.4);
  assert.equal(await player.play(),true);
  assert.equal(reads,1);assert.equal(context.resumeCalls,1);
  assert.deepEqual(context.sources[0]?.starts,[[.2,0,1.4]]);
  assert.equal(context.gain.gain.value,.4);
  context.currentTime=.5;player.pause();
  const held=player.snapshot().timelineSample;
  context.currentTime=1;
  assert.equal(player.snapshot().timelineSample,held);
  assert.equal(context.sources[0]?.stops,1);
  player.seekFrame(10);
  assert.equal(player.snapshot().frame,10);
  assert.equal(player.snapshot().timelineSample,sourceLinearFrameToSample(player.config,10));
  assert.equal(await player.play(),true);
  assert.equal(reads,1,'verified buffer reused');
  assert.deepEqual(context.sources[1]?.starts,[[1,.7,.7]]);
  assert.equal(await player.replay(),true);
  assert.equal(player.snapshot().frame,1);
  assert.deepEqual(context.sources[2]?.starts,[[1.2,0,1.4]]);
  await player.close();
  assert.equal(player.snapshot().phase,'closed');
  assert.equal(context.closeCalls,1);
});

test('decoder EOF leaves visual postroll running until full-frame terminal hold',async()=>{
  const context=new Context();const player=new SourceLinearAudioController(CONFIG,{
    createContext:()=>context as unknown as AudioContext,readVerified:async()=>buffer()});
  assert.equal(await player.play(),true);
  const ended=context.sources[0]?.onended;
  context.currentTime=1.7;ended?.();
  assert.equal(player.snapshot().phase,'playing');
  assert.equal(player.snapshot().frame,18);
  context.currentTime=2.1;
  assert.equal(player.snapshot().phase,'ended');
  assert.equal(player.snapshot().frame,20);
  assert.equal(await player.play(),false);
  assert.equal(await player.replay(),true);
  assert.equal(player.snapshot().frame,1);
  await player.close();
});

test('seek/close cancel stale async load; malformed decoded buffer never starts sound',async()=>{
  const wait=deferred<AudioBuffer>(),signals:AbortSignal[]=[];
  const context=new Context();const player=new SourceLinearAudioController(CONFIG,{
    createContext:()=>context as unknown as AudioContext,
    readVerified:signal=>{signals.push(signal);return wait.promise;}});
  const first=player.play();await flush();
  player.seekFrame(8);
  assert.equal(signals[0]?.aborted,true);
  wait.resolve(buffer());
  assert.equal(await first,false);
  assert.equal(context.sources.length,0);
  await player.close();

  const badContext=new Context();const bad=new SourceLinearAudioController(CONFIG,{
    createContext:()=>badContext as unknown as AudioContext,
    readVerified:async()=>({...buffer(),length:CONFIG.decodedSamples-1}) as AudioBuffer});
  assert.equal(await bad.play(),false);
  assert.equal(bad.snapshot().error,'LINEAR_AUDIO_DECODE');
  assert.equal(badContext.sources.length,0);
  await bad.close();
});

test('context interruption pauses and does not auto-resume or reload',async()=>{
  const context=new Context();let reads=0;
  const player=new SourceLinearAudioController(CONFIG,{createContext:()=>context as unknown as AudioContext,
    readVerified:async()=>{reads++;return buffer();}});
  assert.equal(await player.play(),true);
  context.currentTime=.4;context.setState('suspended');
  assert.equal(player.snapshot().phase,'paused');
  assert.equal(context.sources[0]?.stops,1);
  context.setState('running');
  assert.equal(player.snapshot().phase,'paused');
  assert.equal(reads,1);
  await player.close();
});
