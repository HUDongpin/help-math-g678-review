# P012 two-stream playback implementation candidate — 2026-09-27

This candidate schedules the two *separate* embedded SWF MP3 streams through one lazy, same-origin browser `AudioContext`. It does not use the catalog-associated SA sidecar. Its source is the real AWS `G6-G8-shared/ALG001/L12/VB/L12VB07.swf`, SHA-256 `b322949a960acef3fee6018a65785b29cd3693717ca3ba33d0d930d7866320aa`, and the independently generated `audio-source-v1/raw-index.json`. The raw payload extraction and ffmpeg EOF decode are documented in `AUDIO_SOURCE_2026-09-27.md`.

## Main sprite 86

The source has a 12 fps, 119-frame main timeline. Its continuous audio stream starts at frame 30, has 90 `SoundStreamBlock` tags through frame 119, includes a zero-payload block on frame 31, and has 164,736 decoded samples at 22,050 Hz. The modern schedule starts the complete decoded buffer at timeline sample `(30-1)×22050/12 = 53,287.5`. It neither trims the head's 1,673 latency/seek samples nor inserts silence for frame 31 nor reclocks individual block seeks. These are explicit engineering choices, not claims that Flash uses the same first-sample phase.

Entry into stopped interactive frame 119 is timeline sample 216,825. The complete main buffer reaches EOF at sample 218,023.5, **1,198.5 samples (about 54.35 ms) after frame 119 begins**. The candidate holds frame 119 while that remaining audio plays, then holds it another 639 samples to the end of its authored 12 fps frame span at 218,662.5. The source `stop()` in frame 119 might affect its own stream differently; this implementation preserves all decoded samples for a reviewable modern candidate. It does not establish original synchronization.

## Coach sprite 76 and branch jumps

Source frame 2 chooses S1/S2/S3/S4 and jumps to frame 3/18/31/40. Frames 16/27/36/54 execute `gotoAndStop(1); _parent.enableButton();`. Each return frame also has a `SoundStreamBlock`. The coach MP3 is decoded once in full to 96,768 mono samples, preserving preceding MP3 decoder history; playback uses sample windows in that one buffer.

The [Adobe SWF File Format Specification v19, streaming sound and frame subdivision, pp. 182–186](https://open-flash.github.io/mirrors/swf-spec-19.pdf) explains that continuous MP3 frames play at their natural rate, a timeline seek skips `SeekSamples`, the first block's seek is encoder latency, later seeks add that latency, and a zero-sample empty block carries no MP3 payload. P012's source values support the following **spec-informed modern jump policy**: S1 skips the first-block 1,673 samples; later label jumps skip the target block seek plus the 1,673-sample head latency. The return-frame block is included in the source window. Including it brings the source window within 76–217 samples of the 12 fps return clock; excluding it leaves about 1,800–2,200 samples absent. This near alignment supports the choice but does not prove original return-frame tag/action ordering or actual Flash output.

| Branch | Jump→return frame | Raw block start | Target seek + head latency applied | Decoded playback start | Inclusive return-block end | Source span | Return clock | Modern gate |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| S1 | 3→16 | 0 | 1,673 | 1,673 | 25,344 | 23,671 | 23,887.5 | Source ends 216.5 samples before return |
| S2 | 18→27 | 27,072 | 319 + 1,673 | 29,064 | 45,504 | 16,440 | 16,537.5 | Source ends 97.5 samples before return |
| S3 | 31→36 | 51,264 | 8 + 1,673 | 52,945 | 62,208 | 9,263 | 9,187.5 | Gate stops 75.5 source samples at return |
| S4 | 40→54 | 67,392 | 413 + 1,673 | 69,478 | 95,040 | 25,562 | 25,725 | Source ends 163 samples before return |

There is no fabricated silence: when the source window ends before the return clock, the audio node ends while the coach frame clock continues. S3's final 75.5 samples are held by the explicit return gate. Each branch's cumulative raw sample and payload boundaries, block-level signed seeks and hashes remain in `raw-index.json`. This implementation does not splice or relabel the SA sidecar, invent a voice transcript, or establish listening acceptance.

## Browser controller contract

`P012AudioController` is in `packages/demos/src/alg-l12-p012-audio.ts`; pure sample/frame calculations are in `alg-l12-p012-audio-schedule.ts`. Construct with `{origin,onChange?,createContext?,fetch?}`. The exact optional `mainPath` and `coachPath` values are the exported `P012_MAIN_AUDIO_URL` and `P012_COACH_AUDIO_URL`, resolving to the local-only `/flash-assets/g678-local/shared-alg001-l12-p012/main.mp3` and `/coach.mp3` routes with their exact SHA-256 query pins. The controller only accepts those paths. It sends same-origin credentials, refuses redirects, requires 200 `audio/mpeg`, bounds bytes, verifies SHA-256, validates decoded rate/channel/sample count and finite PCM, and exposes only fixed local error codes.

No network or audio context is opened by construction, `snapshot`, seek, or reset. An explicit `play()` starts/resumes the main clock. `playCoach(label)` starts or replaces a branch, `stopCoach()` cancels it, `pause()` freezes both clocks, `resume()` restarts held clocks, `seekFrame(frame)` seeks the main timeline and cancels coach, `reset()` returns to frame 1 without autoplay, `setVolume(0..1)` changes their shared gain, and `close()` cancels/aborts/releases the context. `snapshot()` exposes `phase`, `mainFrame`, `timelineSample`, `coachLabel`, `coachFrame`, `coachPlaying`, `volume`, and `error`. `onChange` reports lifecycle events including context interruption; the host polls `snapshot()` for source 12 fps visual advancement. `playing` covers coach-only playback after main EOF. The controller does not emit an intermediate `paused` event while a coach branch loads or naturally returns, because that event would freeze the host reducer before it consumes the return tick; polling still exposes the terminal coach state. Generation tickets invalidate stale fetch/decode/resume completions, and an external context suspension pauses both clocks without automatic restart.

The pure interaction reducer remains the owner of movement, popup, and coach branch choice. The host must coordinate its 12 fps `coach-tick` until the return event; the transport alone does not execute AVM1 or resolve `_parent.enableButton()`. Review of actual browser graphics/audio and listening remains separate.

## Verification

```sh
node --import tsx --test packages/demos/tests/alg-l12-p012-audio*.test.ts
./node_modules/.bin/tsc --noEmit --strict --target es2022 --module esnext --moduleResolution bundler --lib dom,es2022 --types node --skipLibCheck packages/demos/src/alg-l12-p012-audio-schedule.ts packages/demos/src/alg-l12-p012-audio.ts packages/demos/tests/alg-l12-p012-audio-schedule.test.ts packages/demos/tests/alg-l12-p012-audio.test.ts
```

Result: 11/11 targeted tests passed; targeted strict TypeScript check passed. Tests read the frozen raw index and actual MP3 bytes, check all four source-derived branch boundaries and per-branch seek arithmetic, frame-119 tail, both-stream scheduling, coach-only phase, pause/resume/seek/reset, context interruption, stale fetch/decode cancellation including coach replacement and close, response/hash/decode failures, and volume.

This is an implementation candidate only. Original Flash runtime and sound capture, browser end-to-end comparison, synchronization/fidelity/listening, human/Owner acceptance, strict completion, release, and publication remain separate gates.
