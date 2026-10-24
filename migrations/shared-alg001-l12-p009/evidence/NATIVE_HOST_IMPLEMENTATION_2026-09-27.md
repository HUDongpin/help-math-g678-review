# P009 source-native My Lesson implementation — 2026-09-27

This is a local technical implementation report, not Flash fidelity, listening,
human review, Owner acceptance, strict completion or publication. P009 is still
an unregistered host probe at this report's initial checkpoint. The private
Current-JS registry is the registration authority.

The physical source is `G6-G8-shared/ALG001/L12/VB/L12VB04.swf`, SHA-256
`d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533`.
The earlier frozen source inventory and audio analysis remain separate evidence.

## Source-bound native presentation

The maintained generator wraps the public-tool vector renderer. It suppresses
only 44 exact text placement generations, the root title shape 63, and the
three linked-text underline placements (48 rules). Tests exercise all 394 frames
and 14,793 actual instrumented calls, requiring exact per-frame suppression
closure. The ordinary source drawing still works and its trace is unchanged;
source leaf graphics are preserved byte-for-byte. Unknown, duplicate, missing,
out-of-context and reentrant suppression fail closed and release transaction
state after exceptions.

The source's 16 text definitions / 32 runs produce native title, two connected
paragraphs, eight real glossary buttons and source-anchored graph labels. Source
prose uses complete-run reveal derived from exact mask containment rather than
pretending to reproduce partial Flash glyph pixels. Ten separately placed source minus signs retain their native text and source
anchors beside the corresponding axis digits; the graph accessible name describes
the labelled range as minus five to five.
The graph keeps the original unlabelled outer intervals, shared zero, axes and
point (4,2). White 4/2 overlays retain their authored six flash frames as coordinate
hiding without duplicate assistive announcements. Source masks are rectangular;
source role audit separately classified every nontext shape and all button actions.
No ActionScript execution or original-runtime capture is claimed.

Drawing occurs into a 1600x1200 staging buffer; the visible buffer and native text
commit together. A real injected draw failure removed stale text and released the
buffers; Replay recovered. The independent reduced-motion review discovered a
StrictMode ref detach/reattach defect: ready text accompanied an empty Canvas.
The fix restores staged pixels on ref attachment. Fresh load and Next/Previous
remount were independently retested: 1,920,000 painted pixels, a visible retained
coordinate graph, zero initial audio requests, and old Canvas released to 0x0.
The failed evidence is retained alongside the successful reruns.

## Modern host, audio and interaction

The canonical module exports the maintained native renderer and source frame
metadata. The shared static factory's legacy 1x renderer is not selected. The
modern host supplies the audio-derived frame, explicit playback, inspection,
volume, glossary and navigation lifecycle. The generic module alone does not
create an audio context or a glossary host.

Embedded MPEG data is decoded as one continuous 721,728-sample mono 22,050Hz
buffer. The modern clock places the first stream onset at main frame 2 and skips
1,673 decoded samples once. It preserves the full decoded nonzero tail, then
holds at frame 394 after a small clock-only postroll. This is a source-informed
schedule candidate, not a measured Flash synchronization result; the source has
no terminal stop action. No optional Spanish Audio is spliced into this buffer.
The separately preserved SA resource is not implemented by this checkpoint.

Explicit Play/Replay/Continue alone start transport. Locale changes and generic
host unpause signals do not start audio. The reduced-motion initial view is the
complete frame 394 with no audio context/fetch; explicit Play starts from frame 1.
Glossary activation pauses at the exact current sample, dialog Close/Escape
restores the triggering button and remains paused, and explicit Play resumes.
Context interruption does not auto-resume. Navigation closes owned contexts and
cancels late acknowledgements. Delayed fetch cancellation followed by retry was
retested with the final module: canceled requests produced zero decodes/starts;
retry produced one decode/start and pause left zero live nodes.

The full natural run published 393 frame changes with no mismatch between the
published frame and the audio sample-derived frame, ending at frame 394/sample
722137.5 with zero live source nodes. Most transport checks used actual UI volume
0%; the natural-terminal run had volume 80% after HMR reset. It establishes
technical scheduling only and is not retained as listening acceptance.

## Responsive, keyboard and language evidence

Independent ES 320px checks found document client/scroll width 320/320. The graph
has a bounded local keyboard-scroll area, while prose and controls reflow. At
200% root text size, native labels measured 32px and prose 36px; the actual graph
Canvas CSS width remained within its declared 1600px backing width. All eight
source glossary links were exercised with Enter, Tab, Shift+Tab and Escape;
focus stayed in the dialog and returned to the correct source term. Current
reduced-motion/audio reruns independently verified muted Play/Pause, glossary
hold/focus, explicit resume, Replay and Canvas cleanup.

English source content is intentionally retained on the Spanish route with an
explicit Spanish fallback notice. This is not Spanish content acceptance.

## Verification artifacts

- `output/playwright/p009-native-typography-20260927-v1/`: generator tests,
  source/modern drawing comparison, server checks, glossary and fault recovery,
  independent baseline pin set and TypeScript/lint output.
- `output/playwright/p009-independent-20260927-v1/receipt.json`: independently
  recorded silent baseline for typography, 320px/200%, eight glossary actions
  and navigation. It is dated before the audio refactor and is not presented as
  a hash pin for the later host implementation.
- `output/playwright/p009-audio-independent-20260927-v1/receipt.json` and
  `REVIEW.md`: current audio/reduced-motion independent review, including the
  initial visual defect and final fixed fresh/remount checks.
- `output/playwright/p009-embedded-audio-20260927-v1/`: controller tests,
  source-audio route checks, actual browser decode/clock/interruption/cancellation,
  final-module retry, full web TypeScript and scoped lint.

The main agent read actual implementation changes and reran the applicable
checks. Receipt finalization must bind the final implementation closure and
independent observation artifacts; this prose is not a substitute for those
hashes or for a completed production-negative check.

## Final module and production isolation checkpoint

The final composed module passed the full web TypeScript check and scoped lint.
The production build passed all 11 asset-closure tests, compiled, typechecked and
completed page generation. The dedicated local production process then returned
404 for both EN/ES P009 routes and both exact-hash P009 typography/audio assets,
including same-origin request headers. Its public static bundles contained none
of the four checked P009 runtime/asset markers. See
`output/playwright/p009-embedded-audio-20260927-v1/production-negative.json` and
`production-build.log`. The production process and browser session were closed;
Next's generated `next-env.d.ts` was restored to its pre-build bytes. No remote
provider was accessed and no deployment was created.

Main independently reran the binding producer's 11 tests; all passed. Its actual
source regeneration, 266-file current implementation closure and technical
receipt guards remain preparation only until a separately authored observed
receipt is validated. The producer cannot write catalog or registry state.
