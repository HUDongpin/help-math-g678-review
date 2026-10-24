import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {DecodedSourceStreamTransport, type DecodedSourceStreamBinding} from '../src/decoded-source-stream-transport';

const hash = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const raw = Uint8Array.of(1, 2, 3, 4);
const pcm = Float32Array.from({length: 1000}, (_, n) => Math.sin(n * .1));
const pcmBytes = Buffer.alloc(pcm.length * 4);
pcm.forEach((n, i) => pcmBytes.writeFloatLE(n, i * 4));
const BINDING: DecodedSourceStreamBinding = {
  sourceSha256: hash(raw), sourceBytes: raw.length, sampleRate: 22050,
  channels: 1, decodedSamples: pcm.length, pcmSha256: hash(pcmBytes),
};
const deferred = <T>() => {
  let resolve!: (v: T) => void, reject!: (e: Error) => void;
  const promise = new Promise<T>((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
};
const buffer = (samples = pcm) => ({sampleRate: 22050, length: samples.length,
  numberOfChannels: 1, getChannelData: () => samples}) as unknown as AudioBuffer;

class FakeSource {
  buffer: AudioBuffer | null = null;
  onended: (() => void) | null = null;
  starts: number[][] = [];
  stopped = 0;
  disconnected = 0;
  failStart = false;
  connect() {return undefined;}
  disconnect() {this.disconnected++;}
  start(...args: number[]) {if (this.failStart) throw new Error('start-failed'); this.starts.push(args);}
  stop() {assert(this.starts.length > 0, 'unstarted node must not be stopped'); this.stopped++;}
}

class FakeContext extends EventTarget {
  currentTime = 0;
  sampleRate = 22050;
  state = 'suspended';
  destination = {};
  nodes: FakeSource[] = [];
  gains: number[] = [];
  decodeCalls = 0;
  resumeCalls = 0;
  closeCalls = 0;
  gainDisconnects = 0;
  failStart = false;
  decode: () => Promise<AudioBuffer> = async () => buffer();
  resumeNext: (() => Promise<void>) | undefined;
  createGain() {return {gain: {setValueAtTime: (value: number) => this.gains.push(value)},
    connect: () => undefined, disconnect: () => this.gainDisconnects++};}
  createBufferSource() {const n = new FakeSource(); n.failStart = this.failStart; this.nodes.push(n); return n;}
  decodeAudioData() {this.decodeCalls++; return this.decode();}
  async resume() {this.resumeCalls++; if (this.resumeNext) await this.resumeNext(); this.state = 'running';}
  async close() {this.closeCalls++; this.state = 'closed';}
  suspendExternally() {this.state = 'suspended'; this.dispatchEvent(new Event('statechange'));}
}
function fixture() {
  const context = new FakeContext();
  let allocations = 0;
  const transport = new DecodedSourceStreamTransport(BINDING, {createContext: () => {
    allocations++; return context as unknown as AudioContext;
  }});
  return {context, transport, allocations: () => allocations};
}
async function ready() {const f = fixture();assert.equal((await f.transport.prepare(raw.slice().buffer)).accepted, true);return f;}
const play = (t: DecodedSourceStreamTransport) => t.play({activation: 'user', reducedMotion: false});
const settle = () => new Promise(resolve => setTimeout(resolve, 10));

test('raw byte identity fails before allocating an AudioContext', async () => {
  const f = fixture();assert.equal((await f.transport.prepare(Uint8Array.of(1, 2, 3, 5).buffer)).reason, 'source-byte-identity-mismatch');
  assert.equal(f.allocations(), 0);assert.equal(f.transport.snapshot().phase, 'failed');
});
test('source is cloned before the hash await', async () => {
  const f = fixture(), input = raw.slice();const pending = f.transport.prepare(input.buffer);input[0] = 99;
  assert.equal((await pending).accepted, true);
});
test('decoded PCM mismatch and unsupported context rate fail closed', async () => {
  for (const drift of ['pcm', 'rate']) {
    const f = fixture();if (drift === 'pcm') f.context.decode = async () => buffer(Float32Array.from(pcm, n => n * 2));
    else f.context.sampleRate = 48000;
    assert.equal((await f.transport.prepare(raw.slice().buffer)).accepted, false);
    assert.equal((await play(f.transport)).accepted, false);assert.equal(f.context.nodes.length, 0);
  }
});
test('fractional pause/resume uses the same decoder cursor and excludes paused time', async () => {
  const {transport:t,context:c} = await ready();c.currentTime = 20;await play(t);
  c.currentTime = 20.00125;const before = t.snapshot().decodedSample;
  assert.ok(Math.abs(before - 27.5625) < 1e-7);t.pause();
  c.currentTime = 200;assert.equal(t.snapshot().decodedSample, before);await play(t);
  assert.equal(c.nodes[1].starts[0][1], before / 22050);
  c.currentTime += .000125;assert.ok(Math.abs(t.snapshot().decodedSample - before - 2.75625) < 1e-7);
  assert.equal(c.nodes[0].stopped, 1);assert.equal(c.nodes[0].disconnected, 1);
});
test('delayed autoplay does not advance time; user retry invalidates the first resume', async () => {
  const {transport:t,context:c} = await ready();const waits = [deferred<void>(), deferred<void>()];let i = 0;
  c.resumeNext = () => waits[i++].promise;
  const automatic = t.play({activation:'automatic',reducedMotion:false});c.currentTime=5;
  assert.equal(t.snapshot().phase,'start-pending');assert.equal(t.snapshot().decodedSample,0);
  const retry=play(t);waits[1].resolve();assert.equal((await retry).accepted,true);
  waits[0].resolve();assert.equal((await automatic).reason,'stale-start');assert.equal(c.nodes.length,1);
});
test('pause, replay and close cancel pending starts without creating a stale source', async () => {
  for (const action of ['pause','replay','close'] as const) {
    const {transport:t,context:c}=await ready(), wait=deferred<void>();c.resumeNext=()=>wait.promise;
    const pending=play(t);await t[action]();wait.resolve();assert.equal((await pending).reason,'stale-start');
    assert.equal(c.nodes.length,0);assert.equal(t.snapshot().decodedSample,0);
  }
});
test('late decode after replay or close cannot restore readiness', async () => {
  for (const action of ['replay','close'] as const) {
    const {transport:t,context:c}=fixture(), wait=deferred<AudioBuffer>();c.decode=()=>wait.promise;
    const pending=t.prepare(raw.slice().buffer);await settle();assert.equal(c.decodeCalls,1);
    await t[action]();wait.resolve(buffer());assert.equal((await pending).reason,'stale-load');
    assert.equal(t.snapshot().phase,action==='close'?'closed':'idle');
  }
});
test('failed browser resume remains held and can be retried by an actual user gesture', async () => {
  const {transport:t,context:c}=await ready();c.resumeNext=async()=>{throw new Error('NotAllowedError');};
  assert.equal((await play(t)).accepted,false);assert.equal(t.snapshot().phase,'play-rejected');
  assert.equal(t.snapshot().decodedSample,0);c.resumeNext=undefined;assert.equal((await play(t)).accepted,true);
});
test('source start failure disconnects the unstarted node and stays recoverable', async () => {
  const {transport:t,context:c}=await ready();c.failStart=true;
  assert.equal((await play(t)).reason,'start-failed');assert.equal(c.nodes[0].disconnected,1);
  assert.equal(c.nodes[0].stopped,0);assert.equal(t.snapshot().phase,'play-rejected');
});
test('browser interruption holds the exact cursor and requires an explicit new start', async () => {
  const {transport:t,context:c}=await ready();await play(t);c.currentTime=.01;c.suspendExternally();
  assert.equal(t.snapshot().phase,'interrupted');const held=t.snapshot().decodedSample;c.currentTime=1;
  assert.equal(t.snapshot().decodedSample,held);await play(t);assert.equal(c.nodes[1].starts[0][1],held/22050);
});
test('mute changes gain only; neither mute nor unmute resets playback time', async () => {
  const {transport:t,context:c}=await ready();await play(t);c.currentTime=.01;t.setVolume(0);
  assert.equal(t.snapshot().phase,'playing');assert.equal(t.snapshot().decodedSample,220.5);
  c.currentTime=.02;t.setVolume(.6);assert.equal(t.snapshot().decodedSample,441);
  assert.equal(c.nodes.length,1);assert.deepEqual(c.gains,[1,0,.6]);assert.equal(t.setVolume(2).accepted,false);
});
test('EOF is buffer-ended, never lesson completion; replay resets and does not autostart', async () => {
  const {transport:t,context:c}=await ready();await play(t);const callback=c.nodes[0].onended!;callback();
  assert.equal(t.snapshot().phase,'buffer-ended');assert.equal(t.snapshot().decodedSample,1000);
  assert.equal(t.snapshot().lessonCompleted,false);assert.equal((await play(t)).accepted,false);
  t.replay();assert.equal(t.snapshot().phase,'ready');assert.equal(t.snapshot().decodedSample,0);
  callback();assert.equal(t.snapshot().phase,'ready');assert.equal(c.nodes.length,1);
});
test('explicit source boundary retires sound and does not claim a source sample mapping', async () => {
  const {transport:t,context:c}=await ready();await play(t);c.currentTime=.01;t.holdSourceBoundary();
  assert.equal(c.nodes[0].stopped,1);assert.equal(t.snapshot().phase,'boundary-held');
  assert.equal(t.snapshot().sourceAlignment,'unresolved');assert.equal((await play(t)).accepted,false);
});
test('decoder seek holds without autoplay; rejects invalid positions', async () => {
  const {transport:t,context:c}=await ready();await play(t);assert.equal(t.seekDecodedSample(200.5).accepted,true);
  assert.equal(t.snapshot().phase,'paused');await play(t);assert.equal(c.nodes[1].starts[0][1],200.5/22050);
  for(const n of [NaN,Infinity,-1,1001])assert.equal(t.seekDecodedSample(n).accepted,false);
});
test('reduced motion blocks automatic sound, but explicit access remains available', async () => {
  const {transport:t,context:c}=await ready();assert.equal((await t.play({activation:'automatic',reducedMotion:true})).reason,'reduced-motion-hold');
  assert.equal(c.resumeCalls,0);assert.equal((await t.play({activation:'user',reducedMotion:true})).accepted,true);
});
test('navigation/unmount closure disconnects all sound and rejects every restart', async () => {
  const {transport:t,context:c}=await ready();await play(t);await t.close();await t.close();
  assert.equal(c.nodes[0].stopped,1);assert.equal(c.gainDisconnects,1);assert.equal(c.closeCalls,1);
  assert.equal(t.snapshot().phase,'closed');assert.equal((await play(t)).accepted,false);
  assert.equal((await t.prepare(raw.slice().buffer)).accepted,false);assert.equal(t.replay().accepted,false);
});
test('external context closure is terminal and detaches the state listener', async () => {
  const {transport:t,context:c}=await ready();let removals=0;
  const remove=c.removeEventListener.bind(c);
  c.removeEventListener=(...args: Parameters<typeof c.removeEventListener>)=>{removals++;remove(...args);};
  await play(t);c.state='closed';c.dispatchEvent(new Event('statechange'));
  assert.equal(t.snapshot().phase,'closed');assert.equal(c.nodes[0].stopped,1);assert.equal(removals,1);
  await t.close();assert.equal(c.closeCalls,0);assert.equal((await play(t)).accepted,false);
});

test('stereo keeps the original two-channel buffer and binds both channel sample sequences', async()=>{
  const right=Float32Array.from(pcm,n=>n*.25+.1),all=Buffer.alloc(pcm.length*8);
  pcm.forEach((n,i)=>all.writeFloatLE(n,i*4));right.forEach((n,i)=>all.writeFloatLE(n,(pcm.length+i)*4));
  const stereo={sampleRate:22050,length:pcm.length,numberOfChannels:2,getChannelData:(channel:number)=>channel===0?pcm:right} as unknown as AudioBuffer;
  const binding={...BINDING,channels:2 as const,pcmSha256:hash(all)};
  for(const drift of ['none','right','swap','mono','nonfinite-right']){
    const context=new FakeContext();context.decode=async()=>drift==='none'?stereo:drift==='mono'?buffer():{...stereo,getChannelData:(channel:number)=>{
      if(drift==='swap')return channel===0?right:pcm;
      if(channel===0)return pcm;
      return Float32Array.from(right,(n,i)=>drift==='nonfinite-right'&&i===0?NaN:n*2);
    }} as unknown as AudioBuffer;
    const transport=new DecodedSourceStreamTransport(binding,{createContext:()=>context as unknown as AudioContext});
    const prepared=await transport.prepare(raw.slice().buffer);
    assert.equal(prepared.accepted,drift==='none',drift);
    if(drift==='none'){assert.equal((await play(transport)).accepted,true);assert.equal(context.nodes[0].buffer,stereo);assert.equal(context.nodes[0].buffer?.numberOfChannels,2);}
    else{assert.equal((await play(transport)).accepted,false);assert.equal(context.nodes.length,0);}
    await transport.close();
  }
});
test('unsupported channel counts cannot be admitted',()=>{
  for(const channels of [0,3,1.5])assert.throws(()=>new DecodedSourceStreamTransport({...BINDING,channels} as never),/invalid-decoded-source-binding/);
});
