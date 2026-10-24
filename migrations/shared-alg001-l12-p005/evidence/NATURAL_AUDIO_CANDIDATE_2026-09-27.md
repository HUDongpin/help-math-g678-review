# P005 natural audio candidate — 2026-09-27

Status: **implemented and technically verified, inferred and unregistered**.
The full G6–G8 migration goal remains active. Formal Current-JS coverage is
481/2,282 after P006 admission; this P005 work adds no registration.

## Maintained behavior

`packages/demos/src/alg-l12-p005-audio-candidate-clock.ts` composes the existing
verified complete MP3 decoder, sample transport and explicitly inferred schedule.
It uses AudioContext time and transport samples, with a serial caller-driven tick.
The controller distinguishes preroll, first run, authored zero-block frame24,
first-run depletion, missing-block gap, second run and terminal. It does not turn
an absent or depleted block into a newly synthesized silent audio asset.

Pause preserves fractional-frame position; active paused seek also synchronizes
the stopped audio window. Pending resume/run start holds the timeline. Generation
cancellation protects pause, seek, new play, page Replay and close from stale
successes, rejections and node-ended callbacks. Page Replay resets timeline0/frame1
before the first group, even when invoked from group2. Context suspension freezes
playback and recovery requires explicit play. The owned context closes once.

Natural transitions hold at an unstarted run boundary until the caller tick and
async start settle. This is declared candidate behavior, so measured wall time
need not be exactly 967/12 seconds. It is not an original Flash timing claim.
Default gain is zero. No host import, audio activation, registry change, source
rewrite or modification of the earlier schedule/transport/decoder was made.

## Independent validation and real browser

Two GPT-6 Sol / xhigh agents implemented the controller and its independent tests
in disjoint files. A third agent read-only reviewed the probe and lifecycle.
Main independently inspected actual code and tests, ran **38/38 tests** (18 new
controller tests plus 20 decoder/transport/schedule regressions), strict targeted
TypeScript, scoped ESLint, and diff whitespace checks. No whole application build
was repeated for these independent modules, which are not imported by product code.

Initial testing caught paused-seek audio metadata remaining at the previous run.
The controller now updates the stopped active window without creating a node.
The failed initial log is retained. The final suite also tests invalid inputs,
late caller ticks, pending natural-start and play cancellation combinations,
context suspension, stale callbacks, non-overlap, and close ownership.

Real Chromium153 ran the local standalone `--natural-candidate` probe from an
actual button click. Natural playback took **80,681.6 ms**, reached timeline sample
3,553,725/frame968, and created exactly two muted nodes:

| Run | Source offset | Source end | Scheduled duration |
| --- | ---: | ---: | ---: |
| 1 | 1,695 | 1,158,912 | 26.2407482993 s |
| 2 | 1,159,959 | 3,306,159 | 48.6666666667 s |

All six nonterminal phase kinds were observed and the final state was ended /
terminal. Subsequent pause/resume, node-free gap, second-run seek, whole-page Replay,
and cleanup checks passed. Explicit AudioContext.suspend/resume simulated an
interruption; this is not evidence of a real device/OS interruption. The cursor
stayed frozen after context recovery until explicit play. Maximum active nodes1;
final active nodes0; context close calls1. All execution was muted, not listening.
The browser console's sole error was the local favicon404, not a zero-error run.

The probe reads physical, nonsymlink implementation files with stable stat/hash
checks before and after bundling. Its receipt binds six implementation inputs and
the exact served bundle hash; Main independently fetched and checked that bundle.
The local browser and owned probe server were closed after capture.

Evidence: `output/playwright/p005-natural-candidate-20260927-v1/technical-receipt.json`,
with the full result in `natural-candidate-result.json` and actual bundle retained
as `served-probe.js`. The initial collection command observed the HTML named
`result` element before a result existed; its log is preserved. Final collection
required a result status and parsed the serialized completed object.

## Unresolved source decisions and separate gates

The existing schedule and all three discrepancies remain unchanged:

- Frame25 continuous candidate sample9,045 versus raw seek5,370: difference3,675.
- Run1 exhausts at timeline1,238,067, 408 samples before frame338, whose source
  still has a positive block. The explicit first-run-depleted state continues
  until the authored missing-block interval begins at frame340.
- Terminal frame968 clips the complete decoded source at3,306,159, leaving3,537
  samples. Prior FFmpeg evidence found nonzero samples in that tail. They are not
  relabeled silence, inaudibility or accepted trimming.

The original host/entry and contained original-runtime evidence remain absent as
detailed in `ORIGINAL_RUNTIME_READINESS_2026-09-26.md`. This natural candidate run
does not resolve them. P005's current My Lesson host remains visual-only with
`audioAvailable:false`; no hidden audio enablement or production change occurred.
Native typography, product audio activation, formal registration, source timing,
original-runtime fidelity, listening, human/Owner acceptance, strict completion
and publication remain separate unfinished gates. P006's completed admission and
its hash-bound evidence are preserved.
