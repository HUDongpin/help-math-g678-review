# P009 optional Spanish Audio in the modern My Lesson host

This is a private local engineering report for `shared-alg001-l12-p009`, the ninth page of ALG001 L12 (`VB/L12VB04.swf`). It records a maintained implementation and bounded technical observations. It does not approve listening, spoken language, original Flash behavior, synchronization, fidelity, human or Owner review, strict completion, or publication.

## Source and implementation

The preserved `SA_HOST_DISPOSITION_2026-09-27.md`, native source analysis, and source receipt bind the conditional legacy-host SA lookup to `SA/L12VB04.mp3`. The physical MP3 is 325,584 bytes, SHA-256 `3ccbe37ecfabff0506ef3daafc7db4b9fd8b770f0baefd6a70efeaaa27ca6fd4`. Native technical decode is mono 48,000 Hz with 1,116,288 samples (23.256 seconds). Historical launch binding, enabled Spanish setting, and spoken-language/listening acceptance remain unverified.

The maintained `P009SpanishAudioController` uses a separate lazy context and explicit user action. The source asset is served by the bounded local same-origin route after checking the source page, historical host, MP3 and source report. Loading checks response identity, size and SHA-256; decode checks native rate, channel count, length and finite samples. No locale entry requests or plays SA. The existing 22,050 Hz embedded main narration is unchanged.

SA start pauses and retains the main cursor. Pause followed by SA Play starts at buffer offset zero. Return and natural SA completion resume the retained nonterminal main cursor. The separately disclosed modern frame-394 terminal hold does not become implicit Replay. Main Replay, stop, seek and navigation cancel SA; navigation closes owned contexts. Context interruption does not automatically resume. Volume controls apply to both tracks. Glossary controls stay disabled while SA is selected. Errors identify the optional SA resource and permit an explicit retry.

## Main-agent observations before registration

Evidence directory: `output/playwright/p009-current-js-admission-20260927-v1/`.

- `spanish-controller-tests.txt`: 18 controller tests passed, including cancellation and lifecycle behavior.
- `spanish-source-route-tests.txt`: five server/route tests passed, including source pin failures, local scope, request headers, physical indirection and changed-during-read rejection.
- `browser-p009-sa-stable.txt`: actual muted browser audio contexts decoded 48,000 Hz mono 1,116,288 samples. Reduced-motion entry held frame 394 with no context/request/start. SA pause/restart used offset zero and one cached request. Return at frame 394 added no main source start. A separate run retained frame 19 / sample 34,432 during SA, naturally completed 23.256 seconds later, resumed the 22,050 Hz main track from offset 1.5540816326530613 seconds, then paused at frame 22. No source playback or decode clock was fabricated.
- `browser-composed-lifecycle.txt`: eight keyboard glossary controls contained focus and restored their trigger with no implicit playback. Main pause held frame/sample. Directory navigation P009 → P006 → P009 released the old Canvas to 0×0 and closed all owned contexts; P006 main and SA controls remained usable.
- `browser-composed-es-responsive.txt` and `browser-composed-graph-keyboard.txt`: 320px ES local host retained a 320px document, source English fallback, native label/prose scaling from 16/18px to 32/36px at 200%, a visible vector graph and bounded keyboard horizontal scrolling. These observations precede SA insertion and are reused only for unchanged native typography; independent current SA mobile checks are recorded separately.
- `admission-producer-tests.txt`, `typography-producer-tests.txt` and `reader-independent-tests.txt`: main-agent reruns passed 9, 11 and 10 tests respectively. Reader fixtures are explicitly isolated and do not establish actual P009 registration.

The first SA browser attempt was interrupted during compilation/HMR; its log is preserved as `browser-p009-sa.txt`. The stable rerun above is the observed pass. A lint finding on the imperative host-seek effect was resolved with a narrow documented rule exception: the effect synchronizes external audio controllers and their visible selection state. No playback logic changed for that exception.

At this report's initial writing, P009 is unregistered and the actual registry remains 481/2,282, ALG001 L12 20/52. The probe descriptor adds a simulated runnable P009 for engineering checks; its 21-page host count is not formal registration. Formal admission requires the fresh full typography proof, reviewed freeze and registry outputs, generated dispatch, and registered-host checks. All downstream acceptance gates remain independent.

## Independent review qualification

The separate read-only host review found no actionable lifecycle/race/return issue after reading both controllers and the shared control/seek/navigation calls. The independent browser harness initially used `includes('0 por ciento')`, which incorrectly accepted the actual `80 por ciento` label as muted. Its gain-0.8 trace is therefore evidence of a harness assertion error, not a demonstrated product volume mismatch. The shared player initializes both display and runtime volume to 0.8; explicit UI mute had produced zero gains. Corrected exact-label checks and current browser outcomes are recorded in the independent receipt. The earlier SA scheduling assertion also wrongly required `when=0`; source playback correctly schedules at actual context time with buffer offset zero. Failed attempts remain preserved rather than rewritten.

## Current production isolation before registration

The main-agent production build completed with exit 0, including deployment asset checks, webpack compilation, TypeScript and static page generation. The owned production server returned 404 for both EN/ES P009 routes and all three P009 assets (native renderer, embedded narration and optional SA), including same-origin headers. Four P009-specific runtime/SA marker searches returned zero matches in `.next/static`. Full evidence is `production-build.log` and `production-verification.json` in the main evidence directory. The production server was stopped and the pre-existing generated `next-env.d.ts` restored from its byte-exact backup. This is local production isolation evidence, not provider deployment or publication.

## Independent current SA browser receipt

`output/playwright/p009-sa-independent-20260927-v1/receipt.json` is 26,700 bytes, SHA-256 `51360af6a7ca1b86a19623293dd362fbf04d62473f61f382c834e91ee65e44f4`. Main independently rehashed its 23 source and 66 output pins. Corrected ES320 keyboard checks, Return/Replay/navigation delayed cancellation, real context suspension/external-resume behavior and final disposal passed. Every passing source start had gain zero. The independent pass retained frame 11/sample 19,840 across SA; all contexts closed and the removed Canvas measured 0×0 after navigation. Natural completion and terminal Return are the earlier main-agent evidence; this independent pass did not repeat them or a 404 browser retry. All independent acceptance flags remain false.
