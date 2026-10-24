# P008 source-bound implementation checkpoint

## Formal local registration checkpoint — 2026-09-28

P008 is now **registered local Current-JS**, under exact v3 proof and freeze.
Registry: **499/2,282**, remaining **1,783**; private entries **641**;
ALG001 L6 **22/60**. The full migration goal remains active.

- Active host: `catalog/g678-admission-v1/host-v31.json`; index: `index-v32.json`.
  All eight predecessor proof files remain unchanged. The common reader verified
  them and the newly admitted P008 against the actual regenerated registry.
- Registration: `output/alg-l06-p008-host-v2/registration/receipt.json`.
- Formal EN/ES host: `output/alg-l06-p008-host-v2/formal-host-verification.json`.
  Both locales entered ready at frame 1 without an SA request. Explicit SA,
  Return, Replay, navigation to P004/P003, and final audio-context disposal passed.
- Exact route: `/{en|es}/migration-status/g678-calibration/shared-alg001-l06-p008/continuous-v1`.
  The earlier candidate route intentionally fails after registration. This does
  not claim integration on the ordinary `/courses/6/ALG001/6` route.
- Before admission, actual candidate host delayed-SA Replay and navigation
  cancellation passed. At 390px width and 32px root font with reduced motion,
  explicit Play and Pause preserved native/Canvas frame agreement and no page
  horizontal overflow was observed. Evidence: `output/alg-l06-p008-host-v2/`.
- Root independently reviewed the descriptor, request-policy/resource wiring,
  exact proxy/rewrite diff, transaction and production runner. Resource tests
  (5), descriptor tests (4), actual admission readback and app typecheck passed.
  Default 4GB typecheck hit OOM; 12GB retry passed without source changes.
- First fresh production build passed compilation/typecheck, but its isolation
  check found only resource hash metadata in server request-policy bundles. The
  failed receipt and build are preserved under `output/alg-l06-p008-production-v1/`.
  A production-only unconditional-denial policy now excludes this metadata.
  Host v31 preserves the prior config snapshot and all nine page proofs.
  The unchanged negative checks passed on the new physical v2 build: 1,008 cases
  each with source root unset and real-root set, 2,016 total; all 404/no redirect.
  Client/server scans found zero P008 runtime, source payload or resource-hash
  matches. Original build link/config restored. This is not a deployment.
- Host-v30 formal browser observations are reusable for development behavior:
  the sole subsequent product delta selects a metadata-free policy only for
  production builds; player, development policies, descriptor and resources
  are byte-identical. Production evidence must come from the fresh v2 run.

Final independent verification: `output/alg-l06-p008-host-v2/verification-final.json`
(479 current input pins, 9 active proofs, 8 predecessor proofs unchanged).
Next bounded source step: `output/alg-l06-p008-host-v2/NEXT_P010.md`.

The player, optimized drawing, audio, v3 proof and frozen source bindings have
not changed. Earlier 938-frame natural candidate observations retain their
original scope. Audio listening, authoritative original-runtime fidelity,
human/Owner acceptance, strict completion and publication are not established.
No provider action or deployment occurred.

## My Lesson / separate SA checkpoint (2026-09-28T12:16:14.530119+00:00)

This is progress on the full 2,282-placement goal, not completion of P008 or of the goal.
Current authoritative recount: **498/2,282**, remaining **1,784**, 640 private entries;
P008 remains unregistered. ALG001 L6 has 21 actual registered pages and a local
22-page projection that includes this explicitly disclosed candidate.

- Latest review: `output/alg-l06-p008-host-v1/verification-final.json`.
- Final candidate: `work/g678-workflow/candidates/shared-alg001-l06-p008-proof-v3.json`
  (43,176 bytes, SHA `df0c101c0d02935a74bc930f4845ae2bd2c77ed65b9e3050117759085a024fe5`).
- Freeze: `catalog/product-bridge-calibrations/g678-alg-l06-p008-current-js-20260928-v3.json`
  (17,202 bytes, SHA `bed851cee0a0a888b27848b7f18ed433a49cf7894be7f192c085ef6f7f644df6`).
- Active host/index: **v29**. Eight earlier active page proofs pass unchanged.
  v26–v28 and adapter snapshots preserve observed/fixed Replay/host feedback issues.
- Final maintained player SHA: `265d23c16cc0868c5c8ef57714380d81fe966ae9c240f78040e0d7c319e391d3`.
- Drawing: optimized successor-v2, 19,032,480 bytes, SHA
  `ef40a85081b1cd131e3751fbaec8242a847592247f1b1992f681dd499309c33e`.
  The generator caches five immutable embedded image transformations only; 75 frame
  raw RGBA comparisons equal composed-v4. Timing diagnostics had concurrent load
  and are not a performance guarantee.

Implemented separate explicitly selected SA, main pause/retained cursor, stale-load
cancellation, Return, terminal hold, shared volume and disposal. Entry into ES does
not request SA. Source narration remains a separate stream, never spliced. Actual
My Lesson reuses the unchanged P004 formal player through a new exact adapter and
source-bound candidate route: `/en` or `/es/migration-status/g678-calibration/shared-alg001-l06-p008/candidate-v1`.
Three own resources and six exact predecessor bridges are development/loopback/
source-root/hash/Referer bound; P004 and P003 canonical readers remain unchanged.

Independent observations: 31 focused tests and application TypeScript passed;
common producer/reader v3 plus semantic check passed. Two natural host runs observed
all 938 frames and no Canvas/native mismatch (v26 EN and v29 ES, before the final
controls-only portal relocation). Replay returns to frame1 with a Play button and
usable volume controls. SA/Return/Replay and gain0 were exercised in ES; navigation
P008→P004→P003 closes departing contexts. Final navigation to an unavailable page
closed every instrumented context. The 390px host has no horizontal page overflow;
SA is now outside the fixed stage in the native companion, 44.39px high and verified
with keyboard Enter. Full-page screenshots show sticky-header capture effects;
no broad layout acceptance is inferred. Final browser and local servers are closed.

Preserved failures: old main-only run missed frame854; v26 Replay reflected the
wrong host pause state and canceled SA loading; v27 Replay lost audio availability;
v28 navigation emitted a lifecycle flushSync warning; initial mobile SA was clipped.
These were repaired with the bounded bitmap cache, deferred adapter reporting,
feedback-safe/deferred pause handling, and companion control placement. Raw failing
records remain. V1/v2 candidate proofs and freezes remain byte-identical historical
artifacts; do not run their --check as though they pin the current player.

Next concrete step: use **v3**, not the old P006 handoff or P008 v1/v2. Finish the
remaining scoped real-host matrix (pending SA load cancellation via host navigation,
reduced motion and additional responsive states), then fresh production-negative
validation and the independently reviewed formal descriptor/registration transaction.
Do not treat the projected candidate count or common reader success as actual
registration. The current packet intentionally keeps productCalibrationPassed and
scaleOutAuthorized false. Original runtime, listening, fidelity, human/Owner,
strict completion and publication remain separate false/unaccepted gates.
The work unit remains open; elapsed wall time is not active labor or completed yield.

## Unified local player checkpoint (2026-09-28 11:21 UTC)

`packages/demos/src/alg-l06-p008-player-v1.tsx` now connects full-stage drawing,
native text and the continuous-audio clock. Its API is
`P008PlayerV1({asset,loadAudio,language?,reducedMotion?,createContext?,onSnapshot?})`.
The caller must supply a verified Canvas asset and an abortable exact-main-audio
loader. Explicit Play/Pause/Replay controls have EN/ES labels. The clock rejects
incorrect encoded/decoded audio; the player checks source identity and committed
frame markers, stops audio on rendering/reporting failure, and cleans up on
unmount. Separate SA is not yet integrated.

Root independently reran its four focused tests and strict scoped TypeScript.
The immutable local browser fixture was built by
`scripts/build-alg-l06-p008-player-preview-v1.mjs`; its 14 input/output pins were
rechecked after the run. Read
`output/alg-l06-p008-player-preview-v1/browser-review.json` for actual observations:

- First entry held frame1 with a suspended AudioContext. Explicit play/pause
  held frame26 in Canvas and native text; Replay held frame1 without autoplay.
- A natural 78.083-second main-clock run reached frame938 with audio ended,
  terminal hold and `lessonCompleted:false`. 937 unique frames were observed;
  frame854 was skipped. Zero observed Canvas/native/player frame mismatches.
  This is not all-frame or performance acceptance. The bounded diagnostic is
  `output/alg-l06-p008-performance-v1/result-v1.json`, SHA-256
  `05908ce158688eb522b3b074c2cf84f5ee095fcd7142b4fd6afc602718faf504`.
  Root rechecked its runtime/export/natural-run input pins. Frame853 costs
  57.7/59.4ms in first/repeat sweep and144.9/146.0ms on two fresh contexts;
  frame854 costs35.2/33.3ms in sweep and101.2/97.8ms fresh. Inclusive in-memory
  instrumentation points to image-pattern/colour-transform work in shape480,
  shape483/484 and shape179. This supports a possible frame-deadline overrun,
  not causal proof. No runtime optimization was made; preserve the gap.
- Unmount during playback closed the owned context. Remount held frame1;
  after prior browser user activation its context could be running without a
  source playing. Reduced-motion entry also held frame1 until explicit Play.
- Mobile390px had no page overflow. Pending-load unmount created no additional
  context. All three observed contexts were closed at the end; browser and
  port3339 server were closed. Zero application console warnings/errors.

Optional-SA source applicability is now independently rechecked:
`python3 scripts/audit-alg-l06-p008-sa-host-v1.py --check` reproduces
`audit/sa-host-v1/sa-host-disposition-v1.json`, SHA-256
`220a687e723dc47f45997262c5311aef340dc881a97f0b274d7dfc79e3651227`.
It reuses byte-verified source host rules and binds this page's XML/SWF/SA.
The old host's actual launch/settings/load remain unobserved. Keep explicit SA
activation, main pause/return, terminal938 preservation, no locale autoplay and
no audio splicing. A file's SA role is not verified spoken-language/listening.

At the 45-minute work-unit review, there is still no newly integrated page.
Concrete progress is the unified main player and resolved text/composition/SA
source questions; remaining bottlenecks are optional-SA integration, the frame854
performance gap and the real My Lesson producer/reader/host path. Change the next
bounded step to those product behaviors, not further text-census work. Preserve
P004/host-v25 and all prior proofs. Root recounted **498/2,282**, ALG001L6 **21/60**,
640 private entries; P008 remains unregistered. The measured unit stays open.

## Native text, clock, and full-stage successor (2026-09-28 11:14 UTC)

The root review is `output/alg-l06-p008-root-v2/verification.json`. Source text
state now comes from `scripts/build-alg-l06-p008-text-state-v1.mjs` and its
generated maintained-module input. Both table headers and the six base rows
are fully visible at main frames 1–577, 763–853, and 855–938. Additional rows
80/90/100/110 become fully visible at 796/801/806/810 and disappear after 853.
The native companion preserves those reveal boundaries. Pink outlined shapes
111/118/137/138 annotate their existing row values, not duplicate answers.

`packages/demos/src/alg-l06-p008-native-text-v1.tsx` supplies source-bound title,
price pairs and a semantic table. Coherent partially cropped price restoration
is an explicit modern readability decision. Canvas glyphs remain intact; this
is not a complete text-replacement or occlusion claim. Source text remains EN
even when the host language is ES. Incidental bitmap signage and the money
thought-bubble shapes remain source artwork. Root engineering asset review:
`output/alg-l06-p008-asset-review-v1/source-role-review.json`.

Current full-stage drawing is
`output/alg-l06-p008-composed-canvas-v1/successor-v4/`, runtime SHA-256
`6bee67fa24900e148ad6babc1c82dbd66760aed42166cba7caa04667649e1d5c`.
It preserves the prior main-stage normalization and adds exact exported root
title/offstage-text/border transforms. Raw FFDec root scaling produced a tiny
main picture; failed predecessors remain preserved. Root inspected frame810.
The old main-only v2 candidate and its pinned migration specification are intact.

`AlgL06P008ClockV1` owns the Chrome153-measured continuous stream, explicit play,
pause, Replay, interruption and terminal frame938. Main audio begins at frame19;
no artificial gap is inserted. Separate SA remains unactivated. Root reran 20
focused tests across source text, native component, clock/audio/timeline and
composed drawing; all passed. Scoped TypeScript passes. Agents' broad demos
typechecks exhausted the default 4GB heap, so no full-project typecheck pass is
claimed.

Final native browser fixture: `output/alg-l06-p008-native-preview-v3/`.
39 states at 1024px/16px, 390px/16px and 320px/32px had zero page or cell text
overflow. At 200-percent text the table uses a local keyboard-scroll region;
right-arrow moved it from 0 to280px and kept amounts readable. Earlier v1 split
amounts and v2 clipped far-right amounts; both are preserved failed iterations.
The fixture is standalone React, not My Lesson. All owned native/composition
servers3335–3338 and browser `p008-native` were closed after these observations.

Current next work is the unified P008 player, then actual My Lesson integration
through the existing common admission reader. The player is being implemented
separately; do not treat this component review as its verification. A source
audit of P008's optional-SA host applicability is also in progress. P008 is
still unregistered and contributes zero additional integrated pages.

## Earlier source and drawing checkpoint (preserved context)

Full G6–G8 goal remains active. Registry/catalog intersection was independently
recounted as **498/2,282**, with 640 private entries. P008 is unregistered.
P004 and its host-v25/eight-page proof chain remain the preceding formal result.

P008 is now beyond preflight: the canonical workspace, reproducible source and
audio extraction, pure frame-state implementation, continuous-audio candidate,
and callable main-domain Canvas are present. Source SWF is 2,805,364 bytes,
SHA-256 `6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350`.
Root remains 10 frames; main sprite507 has 938 frames at 12 fps. The other three
reachable definitions are sprite20/194 (22 frames each) and title sprite510 (1).

Current drawing output: `output/alg-l06-p008-canvas-candidate-v2/`.
Runtime is 19,001,356 bytes, SHA-256
`b38f619ca91d58c4ca9585a712156452664b26a911c17bdbabc36889ceba2cad`.
Use `scripts/build-alg-l06-p008-canvas-v1.mjs --check` (no output argument).
The prior v1 output is preserved: its specification pin drifted during concurrent
manifest preparation. v2 binds the now-stable specification and checks exactly.
Do not edit pinned specification files casually; later meaningful implementation
changes require a preserved successor candidate rather than overwriting v2.

The drawing generator reuses the maintained safe adapter and source-mask helper.
It validates masks1/428 and every exported child-local offset in four instance
windows. The pure P008 timeline independently binds those source windows and
resets each new instance. Terminal child freeze is an explicit modern hold;
original stopped-parent child behavior is still unaccepted.

Main MP3 is 377,130 bytes, SHA-256
`ab14ce47d0f98c841213b222f27e7bc44587ba27849048ed1dd16bd41c2eabe2`.
First packet is frame19 with initial seek1673. Missing packets569–577 and empty
negative-seek packet568 must not create synthetic silence. The pure schedule
uses one continuous stream starting1.5s into the main clock. FFmpeg and Chrome153
both decode1,670,976 mono samples at22,050Hz; their PCM hashes differ and are not
claimed equivalent. Separate SA decodes463,104 samples at48kHz. Chrome contexts
were suspended and closed; no playback or listening acceptance occurred.

Root independently reviewed code and reran source audit, source inventories,
audio extraction, Canvas export and candidate reproducibility checks. Five
focused tests passed (2 Canvas,2 audio,1 timeline), both new pure modules pass
targeted TypeScript, and draft migration schema passes. This is not a production
build or a modern My Lesson integration check.

Browser evidence: `output/playwright/alg-l06-p008-source-v1/`. There are22 direct
draw observations across21 unique frames, with matching initial/returned frame1
pixel hashes. Root visually inspected frames1/449/636/791/938. These drawings
omit root title/overlay composition and native text. Source-styled sign text is
cropped by the authored drawing region. First draws at636/853 took approximately
262/115ms; this sparse diagnostic does not qualify performance. One browser
warning concerned diagnostic pixel readback; no drawing-page console errors.
The earlier audio directory request had only a favicon404. Browser and both
successive port3334 servers are closed.

Next bounded implementation: inspect root title/overlay and outline/bitmap text
roles; build the semantic table/price presentation from actual instance, alpha
and mask visibility, preserving reveal timing. Then compose the full page and
connect main/optional-SA lifecycle to modern My Lesson. Reuse existing contracts
without P004's hardcoded identity,831-frame limit or nine glossary occurrences.
The P008 main/SA streams remain separate and locale must never trigger SA.

Measured unit `alg-l06-p008-source-implementation-20260928-v1` began at
2026-09-28T10:34:39.170Z and remains open because no page was integrated. It is
observed wall time, not active labor. No provider, release, source archive, prior
page proof or shared runtime was changed. Original runtime, fidelity, listening,
human/Owner, strict completion and publication remain independent and open.
