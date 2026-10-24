import assert from 'node:assert/strict';
import {P051Session} from '../packages/demos/src/nms-l02-p051-session-v1';
async function main() {
  let now = 0, silentStarts = 0, closes = 0, volume = .8;
  const audio = {currentTime: () => now, play: async () => true, resumeClock: async () => {silentStarts++; return true;},
    pause() {}, stop() {}, close: async () => {closes++;}, setVolume(v: number) {volume = v;}};
  const deps = {read: async () => new ArrayBuffer(0)};
  const s = new P051Session(deps, audio);
  await s.play(); assert.equal(s.snapshot().running, true);
  await s.event({type: 'drop', item: 1, target: 1}); assert.equal(s.snapshot().running, true, 'invalid input must not pause intro');
  now = .75; s.pause(); assert.equal(s.snapshot().frame, 10);
  now = 10; await s.play(); now = 100; await s.tick(); assert.equal(s.snapshot().state.phase, 'ready');
  await s.event({type: 'drop', item: 1, target: 0}); now += 100; await s.tick();
  assert.equal(s.snapshot().state.phase, 'wrong-feedback'); assert.equal(s.snapshot().running, false);
  await s.event({type: 'close-wrong'});
  s.setVolume(.3); s.setNarration(false); assert.equal(volume, 0);
  for (const item of [8, 3, 0, 5, 2]) {
    await s.event({type: 'drop', item, target: item}); assert.equal(s.snapshot().running, true);
    now += 100; await s.tick();
  }
  assert.equal(s.snapshot().state.phase, 'completion-feedback'); assert.equal(silentStarts, 1);
  now += .5; s.pause(); const elapsed = s.snapshot().elapsed;
  now += 100; await s.play(); assert.equal(silentStarts, 2); assert.equal(s.snapshot().elapsed, elapsed);
  now += 100; await s.tick(); assert.equal(s.snapshot().state.phase, 'outro'); assert.equal(s.snapshot().frame, 486);
  now += 100; await s.tick(); assert.equal(s.snapshot().state.phase, 'complete');
  await s.event({type: 'replay'}); assert.equal(s.snapshot().frame, 1); assert.deepEqual(s.snapshot().state.solved, []);
  await s.close(); await s.close(); assert.equal(closes, 1); assert.equal(s.snapshot().closed, true);
  let resolves: Array<(v: boolean) => void> = [];
  const delayed = {...audio, play: () => new Promise<boolean>(r => resolves.push(r))};
  const race = new P051Session(deps, delayed);
  const old = race.play(); assert.equal(race.snapshot().loading, true); assert.equal(race.snapshot().elapsed, 0);
  const replay = race.event({type: 'replay'}); assert.equal(resolves.length, 2);
  resolves[0]!(true); await old; assert.equal(race.snapshot().running, false); assert.equal(race.snapshot().loading, true);
  resolves[1]!(true); await replay; assert.equal(race.snapshot().running, true);
  race.pause(); const pending = race.play(); await race.close(); resolves[2]!(true); await pending;
  assert.equal(race.snapshot().running, false); assert.equal(race.snapshot().closed, true);
  const failed = new P051Session(deps, {...audio, play: async () => false});
  await failed.play(); assert.equal(failed.snapshot().failure, 'P051_AUDIO_NOT_STARTED'); assert.equal(failed.snapshot().running, false);
  await failed.close();
  console.log(JSON.stringify({status: 'PASS', fiveItemCompletion: true, silentFeedbackPauseResume: true,
    wrongWaitsForClose: true, invalidInputDoesNotPause: true, muteKeepsClock: true,
    replaySupersedesPendingLoad: true, closeRejectsLateStart: true, falseStartRejected: true,
    scope: 'Injected session orchestration; browser playback pending.'}));
}
void main();
