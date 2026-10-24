import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {installG678TechnicalObserver} from './g678-technical-observer-v1.mjs';

// Isolated semantics fixtures. No browser, output device, product or source mutation.
const deferred = () => {let resolve, reject; const promise = new Promise((a, b) => {resolve = a; reject = b;}); return {promise, resolve, reject};};
const flush = async () => {for (let i = 0; i < 5; i++) await Promise.resolve();};
function fixture({kind = 'surface-run', adapter = true} = {}) {
  const id = 'shared-alg001-l06-p002', sha = 'a'.repeat(64), handlers = new Map(), scheduled = new Map();
  let timerSerial = 0, wall = 10000, operationOverride;
  const run = (replay = 0) => ({animationId: id, sourceSha256: sha, ownerKind: kind, playerId: `real-player-${replay}`, replay,
    ...(kind === 'source-vm' ? {leaseToken: `real-lease-${replay}`} : {surfaceId: 'real-surface', runEpoch: replay, runToken: `real-run-${replay}`})});
  const snapshot = {status: 'ready', identity: run(), source: {observedFrom: kind === 'source-vm' ? 'source-runtime' : 'renderer-state',
    clockOwnerId: 'real-player-0', tickKind: kind === 'source-vm' ? 'source-tick' : 'observed-committed-paint', tick: 1, frame: 1, frameDomain: 'sprite-370', errors: [], missing: []},
    render: {status: 'ready', animationId: id, rendererFamily: 'source-canvas', surfaceId: 'real-surface', commitId: 'commit-1', commitSequence: 1,
      committedAtMs: 9000, sourceTick: 1, sourceFrame: 1, sourceFrameDomain: 'sprite-370'}, host: {paused: false}};
  const provider = {id: 'isolated-fixture-only', capabilities: {timerOwnership: 'qualified', asyncOwnership: 'qualified'},
    read: () => structuredClone(snapshot), ownerForOperation: () => operationOverride === undefined ? snapshot.identity : operationOverride};
  class Element {
    constructor(attrs = {}, tag = 'BUTTON') {this.attrs = attrs; this.tagName = tag; this.id = '';}
    closest() {return this;}
    getAttribute(key) {return this.attrs[key] ?? null;}
  }
  const decodeQueue = [], resumeQueue = [], hashQueue = [];
  class AudioContext {
    constructor() {this.currentTime = 1; this.state = 'running';}
    createGain() {return {gain: {value: 1}};}
    decodeAudioData(bytes, success, failure) {
      if (this.throwDecode) throw this.throwDecode;
      const pending = deferred(); decodeQueue.push({pending, success, failure, context: this}); return pending.promise;
    }
    resume() {if (this.throwResume) throw this.throwResume; const pending = deferred(); resumeQueue.push({pending, context: this}); return pending.promise;}
    suspend() {this.state = 'suspended'; return Promise.resolve();}
    close() {this.state = 'closed'; return Promise.resolve();}
  }
  class AudioBufferSourceNode {
    constructor(context, buffer = {length: 10, sampleRate: 10, numberOfChannels: 1}) {this.context = context; this.buffer = buffer; this.listeners = {}; this.started = false;}
    start(...args) {if (this.throwStart) throw this.throwStart; this.started = true; this.startArgs = args; return 'native-start-result';}
    stop(...args) {if (this.throwStop) throw this.throwStop; this.stopArgs = args; this.nativeStopTime = args[0] ?? 0; return 'native-stop-result';}
    addEventListener(type, callback) {this.listeners[type] = callback;}
    end() {this.listeners.ended?.();}
  }
  const document = {documentElement: {lang: 'en'}, addEventListener: (type, fn) => handlers.set(type, fn), querySelector: () => ({})};
  const timer = kind => function(callback, delay, ...args) {const handle = ++timerSerial; scheduled.set(handle, {callback, delay, args, kind, receiver: this}); return handle;};
  const window = {AudioContext, AudioBufferSourceNode, setTimeout: timer('timeout'), setInterval: timer('interval'), requestAnimationFrame: timer('raf'),
    clearTimeout: id => scheduled.delete(id), clearInterval: id => scheduled.delete(id), cancelAnimationFrame: id => scheduled.delete(id)};
  const sandbox = {window, document, Element, MutationObserver: class {observe() {}}, performance: {now: () => wall}, Date,
    crypto: {getRandomValues: a => a.fill(7), subtle: {digest: () => {const pending = deferred(); hashQueue.push(pending); return pending.promise;}}},
    structuredClone, innerWidth: 1440, innerHeight: 900, devicePixelRatio: 1, navigator: {maxTouchPoints: 0},
    getComputedStyle: () => ({fontSize: '16px'}), matchMedia: () => ({matches: false}),
    options: {animationId: id, sourceSha256: sha, rendererFamily: 'source-canvas', ...(adapter ? {runtimeObserver: provider} : {})}};
  vm.runInNewContext(`(${installG678TechnicalObserver.toString()})(options)`, sandbox);
  const observer = window.__g678TechnicalObserver;
  return {observer, provider, snapshot, window, crypto: sandbox.crypto, AudioContext, AudioBufferSourceNode, scheduled, decodeQueue, resumeQueue, hashQueue,
    newSource(context = new AudioContext(), buffer) {return new AudioBufferSourceNode(context, buffer);},
    setOperationOwner(owner) {operationOverride = owner;},
    replay() {snapshot.identity = run(snapshot.identity.replay + 1); snapshot.source.clockOwnerId = snapshot.identity.playerId;},
    advance(frame, tick = frame) {snapshot.source.frame = frame; snapshot.source.tick = tick; snapshot.render.sourceFrame = frame; snapshot.render.sourceTick = tick;
      snapshot.render.commitSequence++; snapshot.render.commitId = `commit-${snapshot.render.commitSequence}`; snapshot.render.committedAtMs = ++wall;},
    emit(type, name, extra = {}) {const target = new Element(name ? {'data-responsive-focus-key': name} : {}, name === 'timeline' || name === 'volume' || !name ? 'INPUT' : 'BUTTON');
      handlers.get(type)({target, isTrusted: true, ...extra});},
    fire(handle, receiver = {timer: true}) {const row = scheduled.get(handle); if (row.kind !== 'interval') scheduled.delete(handle); return row.callback.apply(receiver, row.args);}};
}

test('future native stop stays active until audio-context time reaches its boundary', () => {
  const f = fixture(), source = f.newSource(); assert.equal(source.start(), 'native-start-result');
  assert.equal(source.stop(11), 'native-stop-result'); assert.equal(source.nativeStopTime, 11);
  assert.equal(f.observer.ownedMedia().activeSourceNodes, 1); assert.equal(f.observer.ownedMedia().runningOwnedOutputs, 1);
  source.context.currentTime = 10.9; assert.equal(f.observer.ownedMedia().activeSourceNodes, 1);
  source.context.currentTime = 11; assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
});
test('immediate and past-time stop retire immediately; wall time does not retire future stop', () => {
  for (const when of [undefined, 0, 0.5]) {const f = fixture(), s = f.newSource(); s.start(); when === undefined ? s.stop() : s.stop(when); assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);}
  const f = fixture(), s = f.newSource(); s.start(); s.stop(50); f.advance(1000000); assert.equal(f.observer.ownedMedia().activeSourceNodes, 1);
});
test('last successful stop reschedules previous stop, and thrown stop cannot overwrite it', () => {
  const f = fixture(), s = f.newSource(); s.start(); s.stop(2); s.stop(11); s.context.currentTime = 3;
  assert.equal(f.observer.ownedMedia().activeSourceNodes, 1);
  const error = new RangeError('negative stop'); s.throwStop = error; assert.throws(() => s.stop(-1), value => value === error);
  assert.equal(f.observer.ownedMedia().activeSourceNodes, 1); assert.equal(f.observer.records.stops.at(-1).stopped, false);
  s.context.currentTime = 11; assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
});
test('observed ended and closed context retire nodes; suspended context retains active scheduled nodes', async () => {
  const f = fixture(), s = f.newSource(); s.start(5); s.stop(10); await s.context.suspend();
  assert.equal(f.observer.ownedMedia().activeSourceNodes, 1); assert.equal(f.observer.ownedMedia().pendingMediaStarts, 1); assert.equal(f.observer.ownedMedia().runningOwnedOutputs, 0);
  s.end(); assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
  const other = f.newSource(); other.start(); await other.context.close(); assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
});
test('Replay shares decoded buffer and context but current/retired owners remain separate', () => {
  const f = fixture(), old = f.newSource(); old.start(); const oldOwner = f.snapshot.identity.playerId;
  f.replay(); const fresh = f.newSource(old.context, old.buffer); fresh.start();
  const oldMedia = f.observer.ownedMedia(oldOwner), freshMedia = f.observer.ownedMedia();
  assert.equal(oldMedia.activeSourceNodes, 1); assert.equal(freshMedia.activeSourceNodes, 1);
  assert.notEqual(oldMedia.sourceNodeIds[0], freshMedia.sourceNodeIds[0]); assert.equal(f.observer.records.starts.length, 2);
  old.stop(); assert.equal(f.observer.ownedMedia(oldOwner).activeSourceNodes, 0); assert.equal(f.observer.ownedMedia().activeSourceNodes, 1);
  assert.equal(f.observer.ownedMedia(oldOwner).sourceNodeIds.length, 1);
});
test('late old-run source starts remain attributed to old owner instead of current Replay', () => {
  const f = fixture(), owner = structuredClone(f.snapshot.identity); f.replay(); f.setOperationOwner(owner);
  const late = f.newSource(); late.start();
  assert.equal(f.observer.ownedMedia(owner.playerId).activeSourceNodes, 1); assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
});
test('pending decode, hash, and resume retain initiation owner through Replay', async () => {
  const f = fixture(), context = new f.AudioContext(), old = f.snapshot.identity.playerId;
  const decoding = context.decodeAudioData(new Uint8Array([1]).buffer), resuming = context.resume();
  assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 3); f.replay();
  assert.equal(f.observer.ownedMedia().pendingMediaStarts, 0); assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 3);
  f.decodeQueue[0].pending.resolve({length: 10, sampleRate: 10, numberOfChannels: 1}); await decoding; await flush();
  assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 2);
  f.hashQueue[0].resolve(new Uint8Array(32).buffer); await flush(); assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 1);
  f.resumeQueue[0].pending.resolve(); await resuming; await flush(); assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 0);
});
test('actual product source/PCM hashing before decode is retained under its initiating run', async () => {
  const f = fixture(), old = f.snapshot.identity.playerId, result = f.crypto.subtle.digest('SHA-256', new Uint8Array([1]).buffer);
  assert.equal(result, f.hashQueue[0].promise); f.replay();
  assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 1); assert.equal(f.observer.ownedMedia().pendingMediaStarts, 0);
  f.hashQueue[0].resolve(new Uint8Array(32).buffer); await result; await flush(); assert.equal(f.observer.ownedMedia(old).pendingMediaStarts, 0);
});
test('decode native callback preserves owner for late source start, receiver, and return contract', async () => {
  const f = fixture(), context = new f.AudioContext(), owner = f.snapshot.identity.playerId, receiver = {native: true}; let actualThis, source;
  const original = context.decodeAudioData(new Uint8Array([1]).buffer, function(buffer) {actualThis = this; source = f.newSource(context, buffer); source.start(); return 42;});
  assert.equal(original, f.decodeQueue[0].pending.promise); f.replay(); f.setOperationOwner(null);
  const buffer = {length: 2, sampleRate: 1, numberOfChannels: 1}; assert.equal(f.decodeQueue[0].success.call(receiver, buffer), 42);
  assert.equal(actualThis, receiver); assert.equal(f.observer.ownedMedia(owner).activeSourceNodes, 1); assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
  f.decodeQueue[0].pending.resolve(buffer); f.hashQueue[0].resolve(new Uint8Array(32).buffer); await original; await flush();
});
test('timeout/interval/RAF preserve old-run ownership and callback semantics after Replay', () => {
  const f = fixture(), old = f.snapshot.identity.playerId, receiver = {original: true}; let observedThis, observedArgs, late;
  const interval = f.window.setInterval(function(...args) {observedThis = this; observedArgs = args; late = f.newSource(); late.start();}, 250, 'x', 7);
  const timeout = f.window.setTimeout(() => 9, 100); const raf = f.window.requestAnimationFrame(() => 3);
  assert.equal(f.observer.ownedMedia(old).activeTimers, 2); assert.equal(f.observer.ownedMedia(old).activeAnimationFrames, 1);
  f.replay(); f.setOperationOwner(null); f.fire(interval, receiver); assert.equal(observedThis, receiver); assert.deepEqual(observedArgs, ['x', 7]);
  assert.equal(f.observer.ownedMedia(old).activeSourceNodes, 1); assert.equal(f.observer.ownedMedia().activeSourceNodes, 0);
  assert.equal(f.fire(timeout), 9); assert.equal(f.fire(raf), 3); assert.equal(f.observer.ownedMedia(old).activeTimers, 1);
  // Web timers share a handle namespace: cross-clear is valid.
  f.window.clearTimeout(interval); assert.equal(f.observer.ownedMedia(old).activeTimers, 0); assert.equal(f.observer.ownedMedia(old).activeAnimationFrames, 0);
  assert.equal(f.observer.records.timers.length, 3);
});
test('unknown timer/async ownership is unsupported, never a cleanup zero', () => {
  const f = fixture(); f.provider.capabilities.timerOwnership = 'unqualified';
  assert.equal(f.observer.ownedMedia().status, 'unsupported'); assert.equal(f.observer.ownedMedia().activeTimers, null);
  const g = fixture(); g.setOperationOwner({}); g.newSource().start(); assert.equal(g.observer.ownedMedia().activeSourceNodes, null);
});
test('actual inspector timeline and rewind/forward keyboard/click activation are seek', () => {
  const f = fixture(); f.emit('input', 'timeline'); f.emit('click', 'forward'); f.emit('keydown', 'rewind', {key: 'Enter'}); f.emit('keydown', 'forward', {key: ' '});
  assert.equal(f.observer.records.events.filter(e => e.type === 'seek').length, 4);
});
test('volume and authored mathematical sliders are not seek; navigation has actual action', () => {
  const f = fixture(); f.emit('input', 'volume'); f.emit('input', null); f.emit('change', null); f.emit('click', 'next'); f.emit('keydown', 'previous', {key: 'Enter'});
  assert.equal(f.observer.records.events.filter(e => e.type === 'seek').length, 0);
  assert.deepEqual(Array.from(f.observer.records.events.filter(e => e.action).map(e => e.action)), ['next', 'previous']);
  assert.equal(f.observer.records.events[0].forced, null);
});
test('parent/canvas markers alone do not create an owner or paint', () => {
  const f = fixture({adapter: false}); assert.equal(f.observer.sample(), null); assert.equal(f.observer.records.samples.length, 0);
  assert.ok(f.observer.records.unsupported.includes('actual-runtime-identity-and-commit-adapter-required'));
});
test('source state change without a new completed render is rejected', () => {
  const f = fixture(); assert.ok(f.observer.sample()); f.snapshot.source.frame = 2; f.snapshot.source.tick = 2;
  assert.equal(f.observer.sample(), null); assert.equal(f.observer.records.samples.length, 1);
  f.advance(3); assert.equal(f.observer.sample().source.frame, 3);
});
test('HFR consumes actual VM tick/lease, DOM consumes committed surface state without inventing VM identity', () => {
  const hfr = fixture({kind: 'source-vm'}); hfr.snapshot.source.tick = 45; hfr.snapshot.render.sourceTick = 45;
  assert.equal(hfr.observer.sample().source.tick, 45); assert.equal(hfr.observer.sample().identity.leaseToken, 'real-lease-0');
  const dom = fixture(); const sample = dom.observer.sample(); assert.equal(sample.identity.runToken, 'real-run-0'); assert.equal(sample.identity.leaseToken, undefined);
  delete dom.snapshot.identity.runToken; assert.equal(dom.observer.sample(), null);
});
test('Replay identity is read from committed runtime, never incremented by a button marker', () => {
  const f = fixture(); f.emit('click', 'replay'); assert.equal(f.observer.sample().identity.replay, 0);
  f.replay(); assert.equal(f.observer.sample().identity.replay, 1);
});
