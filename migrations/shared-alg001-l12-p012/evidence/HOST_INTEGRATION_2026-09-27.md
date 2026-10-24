# P012 real My Lesson host checkpoint — 2026-09-27

This successor continues the interaction checkpoint. P012 is still an
**unregistered engineering candidate**. The real registry remains 483/2,282;
this work contributes zero newly integrated pages. The private probe projects
one additional lesson placement for testing, not official admission.

## Actual product path

The local EN/ES path is
`/[locale]/migration-status/g678-calibration/shared-alg001-l12-p012`.
The maintained host adapter uses the existing modern My Lesson player and its
source-bound Coordinate glossary. It loads hash-checked typography, main MP3
and coach MP3 through the dedicated local resource reader. Production and
provider environments remain denied. No source archives were modified.

Observed in the real development host on 127.0.0.1:3317:

- Explicit Play naturally reaches main frame 119 and preserves live movement.
- Right 3 changes the coordinate from (0,0) to (3,0).
- Opening Coordinate pauses at frame 119/(3,0), and the existing glossary
  displays the source-bound English definition. Closing requires explicit Play.
- Further moves reach (6,0), then (9,0). An out-of-bounds Right 3 retains (9,0)
  and displays feedback. After its coach interval and Close, Left 1 reaches
  (8,0); the host remains responsive and unpaused.
- Replay returns to frame 1, (0,0), paused, without autoplay.
- The ES route reaches ready with the Spanish page heading and the explicit
  English-source/missing-verified-Spanish disclosure. Actual official count is
  still 483/2282. EN-to-ES soft navigation was repeated after the locale fix.

Browser console: `.playwright-cli/console-2026-09-27T04-03-41-451Z.log`.
It contains development/HMR output and no ERROR records. The initial trace was
invalidated by edits causing HMR; the stable sequence above was rerun after
audio files were frozen. An initial automation callback signature and an
incorrect language-link selector failed; these are not product passes.

## Failures found before registration and repaired

1. Audio failure emitted another error snapshot during pause, allowing recursive
   error/pause callbacks. The host now pauses idempotently.
2. Coach visuals could advance before asynchronous audio resume completed, or
   stall after EOF cleared the audio label. The host follows the coach audio
   frame and applies the bounded return transition after an observed start.
3. Closing feedback cancels the pending play command so a stale load cannot
   change the current host state.
4. The controller suppresses transient pause callbacks during coach loading and
   natural return; its polling snapshot still exposes the return transition.
5. Soft language navigation retained the previous player locale. Keying this
   candidate host by locale remounts its isolated state and passed the repeat.
6. Full web typechecking exposed an optional `lstat` result in the resource
   test mock. The mock now preserves undefined before constructing a changed
   stats object; full web TypeScript subsequently passed.

## Validation and remaining work

Independent reruns: 12 split-proof/real-producer regression tests, 11 resource
reader/HTTP tests, 11 audio tests, and 4 lesson reducer tests passed. Scoped
host lint has zero errors and three hook dependency/ref warnings. Full web
TypeScript with an 8 GB heap passed. The final production build result is in
`output/playwright/p012-controls-20260927/host-build.log`; inspect its completion
before claiming a successful build. Typography agent evidence additionally
records all 119 source-frame suppression checks; that is not a full host matrix.

Still required: the final native typography/accessibility and responsive host
matrix, complete interruption/error/navigation traces, canonical module and
timeline admission, real shared-producer P012 packet, formal EN/ES admission
receipt, and real registry update. Original-runtime, listening, human/Owner,
strict completion and publication remain separate and unestablished.

## 45-minute bottleneck review

The open work unit began at 03:25:03 UTC and crossed 45 minutes. The concrete
blocker resolved in this interval is the real audio/text/interaction/host
integration path above, not a newly completed page. This source has eight
movement controls and four coach branches and remains a one-page exception.
Do not turn its custom mechanics into the default process for the other 1,798
unregistered placements. Bound the next P012 step to admission and product
verification; do not create another extraction or standalone prototype. The
larger source-feature groups still need behavior-calibrated representatives.
