import {decodeP005Audio, P005_AUDIO_SOURCE} from '../../packages/demos/src/alg-l12-p005-audio-decode';
import {P005AudioCandidateClock} from '../../packages/demos/src/alg-l12-p005-audio-candidate-clock';
import {P005_AUDIO_SCHEDULE} from '../../packages/demos/src/alg-l12-p005-audio-schedule';

// Standalone muted engineering probe; never imported by the lesson application.
export async function runNaturalCandidateProbe() {
  const records: unknown[] = [];
  const context = new AudioContext({sampleRate: 44100});
  let clock: P005AudioCandidateClock | undefined;
  let raf = 0;
  let ticking = true;
  let tickError: unknown = null;
  const starts: {time: number; offset: number; duration: number}[] = [];
  let activeNodes = 0, maxActiveNodes = 0, closeCalls = 0;
  const check = (value: unknown, label: string) => {if (!value) throw Error(label);};
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const nativeClose = context.close.bind(context);
  context.close = () => {closeCalls++; return nativeClose();};
  const createSource = context.createBufferSource.bind(context);
  context.createBufferSource = () => {
    const node = createSource(), start = node.start.bind(node), disconnect = node.disconnect.bind(node);
    let live = false;
    node.start = (when = 0, offset = 0, duration?: number) => {
      starts.push({time: when, offset, duration: duration ?? -1});
      start(when, offset, duration);
      live = true; activeNodes++; maxActiveNodes = Math.max(maxActiveNodes, activeNodes);
    };
    node.disconnect = () => {if (live) {live = false; activeNodes--;} disconnect();};
    return node;
  };
  try {
    const response = await fetch('/source.mp3'); check(response.ok, 'source HTTP');
    const buffer = await decodeP005Audio(context, await response.arrayBuffer());
    clock = new P005AudioCandidateClock(context, buffer);
    const tick = async () => {
      try {await clock!.tick();} catch (error) {tickError = error;}
      if (ticking) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const initial = clock.snapshot();
    check(initial.audio.volume === 0 && initial.frame === 1 && starts.length === 0, 'initial muted frame one');
    const naturalStart = performance.now();
    check(await clock.play(), 'natural play');
    let priorKind = '', priorFrame = 0;
    const transitions: {wallMs: number; phase: string; frame: number}[] = [];
    while (clock.snapshot().frame < 968) {
      const snapshot = clock.snapshot();
      check(!tickError, String(tickError));
      check(snapshot.frame >= priorFrame, 'natural frame regressed'); priorFrame = snapshot.frame;
      const kind = String(snapshot.phase);
      if (kind !== priorKind) {transitions.push({wallMs: performance.now() - naturalStart, ...snapshot}); priorKind = kind;}
      check(performance.now() - naturalStart < 95000, 'natural deadline');
      await wait(20);
    }
    const terminal = clock.snapshot(), naturalMs = performance.now() - naturalStart;
    check(!tickError, String(tickError));
    check(starts.length === 2 && terminal.timelineSample === P005_AUDIO_SCHEDULE.terminalTimelineSample, 'two natural windows to terminal');
    check(starts[0].offset === 1695 / 44100 && starts[1].offset === 1159959 / 44100, 'natural source offsets');
    check(starts[0].duration === (1158912 - 1695) / 44100 &&
      starts[1].duration === (3306159 - 1159959) / 44100, 'natural source durations');
    const observedPhases = new Set(transitions.map(row => row.phase));
    for (const phase of ['preroll', 'first-run', 'initial-zero-block', 'first-run-depleted', 'missing-block-gap', 'second-run'])
      check(observedPhases.has(phase), `missing natural phase ${phase}`);
    check(terminal.phase === 'terminal' && terminal.state === 'ended', 'terminal state');
    check(naturalMs >= 80000 && naturalMs < 85000, 'natural duration');
    check(await clock.play() === false, 'terminal implicit replay');
    records.push({check: 'natural-complete-candidate', initial, terminal, naturalMs, transitions, starts: starts.slice()});
    clock.seekFrame(24); check(clock.snapshot().frame === 24, 'seek 24');
    check(await clock.play(), 'play after seek'); await wait(160); clock.pause();
    const paused = clock.snapshot(); await wait(100);
    check(clock.snapshot().timelineSample === paused.timelineSample, 'pause drift');
    check(await clock.play(), 'resume'); await wait(100); clock.pause();
    check(clock.snapshot().timelineSample > paused.timelineSample, 'resume no advance');
    records.push({check: 'pause-resume', paused, resumed: clock.snapshot()});
    clock.seekFrame(350); const gapStart = starts.length;
    check(await clock.play(), 'gap play'); await wait(100); clock.pause();
    check(starts.length === gapStart && clock.snapshot().frame > 350, 'gap must advance without node');
    records.push({check: 'gap-no-node', snapshot: clock.snapshot()});
    clock.seekFrame(500); check(await clock.play(), 'second run seek'); await wait(80); clock.pause();
    check(await clock.replay(), 'page replay');
    const replay = clock.snapshot();
    check(replay.frame === 1 && replay.timelineSample < 3675, 'page replay must reset frame one');
    await wait(100); clock.pause();
    records.push({check: 'page-replay', replay, paused: clock.snapshot()});
    clock.seekFrame(500); check(await clock.play(), 'interruption setup'); await wait(80);
    await context.suspend(); await clock.tick();
    const interrupted = clock.snapshot(), countBeforeResume = starts.length;
    await context.resume(); await wait(100);
    check(interrupted.state === 'interrupted' && starts.length === countBeforeResume &&
      clock.snapshot().timelineSample === interrupted.timelineSample, 'interruption auto resumed');
    check(await clock.play(), 'explicit interruption resume'); await wait(60); clock.pause();
    records.push({check: 'context-suspend-resume-simulation', method: 'AudioContext.suspend/resume',
      realDeviceInterruptionObserved: false, interrupted, resumed: clock.snapshot()});
    await clock.close(); await clock.close();
    check(context.state === 'closed' && closeCalls === 1 && activeNodes === 0 && maxActiveNodes === 1, 'cleanup/overlapping nodes');
    records.push({check: 'close', snapshot: clock.snapshot(), activeNodes, maxActiveNodes, closeCalls});
    return {status: 'passed', records, source: P005_AUDIO_SOURCE, schedule: P005_AUDIO_SCHEDULE,
      muted: true, inferredCandidateOnly: true, originalRuntime: false, synchronizationAccepted: false,
      audioAccepted: false, registered: false, userAgent: navigator.userAgent};
  } catch (error) {
    return {status: 'failed', error: String(error), records, starts, activeNodes, maxActiveNodes, muted: true};
  } finally {
    ticking = false;
    cancelAnimationFrame(raf);
    if (clock) await clock.close(); else await context.close();
  }
}
