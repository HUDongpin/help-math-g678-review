# shared-nms002-l09-p003 Migration Brief

Created: 2026-09-23

## Objective

Replace the source real-world fish-feeding activity in the modern My Lesson
page. Preserve the visible schedule (five bags plus three groups of two),
bag-count graphics, transient emphasis, five-step `5 + 3 × 2` reveal, and
frame-635 stop. English is source-supported; the ES product path currently
requires an explicit English-source fallback, not an invented translation.

## Identity And Classification

- Immutable `assetId`: `swf-d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
- Placement: `shared-nms002-l09-p003`, shared NMS002, Lesson 9, RW section page 2, global page 3/53.
- Lesson title: `Properties of Operations`; XML page title: `Page 2` (not a reviewed instructional display title). Spanish page title is the catalog's English fallback, not translated source evidence.
- Working lane: source-bound advanced-manual terminal-stop candidate. The direct main clock is understood, but nested drawing, semantic reading order, and audio remain unresolved. No alias/variant is recorded in the catalog.

## Source Evidence

- FLA: none at the cataloged same path; this is SWF-only authoring evidence.
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L9/RW/L9RW03.swf`
- SWF size/SHA-256: 473,410 bytes / `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
- Source-ordered lesson XML: `G6-G8-shared/NMS002/L9/index.xml`, 13,941 bytes / `29e77c35dfa9d8942bf453f377743c7548d15015d9e1d9333353366b6516c200`.
- The catalog has no page dependency hold, but this does not prove source-audio or original-runtime closure. See `scripts/audit-g678-nms-l09-p003-source.mjs` for the repeatable SWF and FFDec-script assertions.

## Runtime Audit

- CWS v6, declared 800×600 stage, 12 fps, 10 root frames. Root frame 6 directly places main `sprite-246` (635 frames), sibling `sprite-249` (1 frame), text 247, and shape 250.
- The main sprite places eight script-free child sprites: 10, 23, 28, 55, 74, 88, 101, 241. Their clock/compositing semantics are **not** covered by the existing no-nested-sprite terminal generator. P003 has no DefineButton/DefineButton2.
- Source has three AS1/2 `DoAction` tags. FFDec 26.2.1 exported root frame 1 preloader+`stop()`, root frame 6 `stop()`, and main sprite frame 635 `stop()`. The pinned main source-structure fingerprint is `d342ae6aed23631a8e0ee0c2a2506d32dd9552570063d11d4e2f93ffcf0b0562`.
- Embedded sound stream: one `SoundStreamHead` and 635 `SoundStreamBlock` tags. A source-bound extractor now freezes one complete 263,120-byte MP3 stream with 1,165,824 decoded samples; frame 2 is an authored empty block, not a silence-cut boundary. The lesson-SA `L9RW03.mp3` is a distinct 33.6-second candidate association and was not substituted. Chromium 153 decoded the stream to a separately pinned PCM hash; an opt-in, same-origin Next route and later mounted local playback candidate exercised those exact bytes. See `audit/SOURCE_AUDIO_MACHINE_AND_LOCAL_ACCESS_2026-09-23.md`, `audit/BROWSER_PCM_DECODE_2026-09-24.md`, `audit/VISIBLE_COMMIT_AND_NEXT_AUDIO_ROUTE_2026-09-24.md`, and `audit/MOUNTED_SOURCE_AUDIO_CANDIDATE_2026-09-24.md`. Original host trigger/timing, audio language, and original-runtime human listening remain unverified.
- Source static text includes `Properties of Operations: Real World Activity`, `Daily Fish Feeding Schedule`, `Tank 1 = 5 bags of food`, `+ 2 bags of food`, `Total:     11 bags of food`, `FISH`, `FOOD`, and the source glyph sequence `5 + 3 x 2`. Text placement is not visibility or modern-typography acceptance; masks, images, and nested sprites still require visual inspection.

## Baseline

- Authoritative original runtime, version, host, and toolchain receipt:
- Requirement-level authority (`natural-trace`, `direct-seek`, or `frame-step`):
- Separate Ruffle forensic-reference route, version, and renderer:
- Native viewport and device scale factor:
- Capture method, named operator, and containment/capacity preflight:
- Required keyframes and why they matter:
- Complete coverage-v2 frame domains, requirements, traces, and entry-state hashes:
- Known emulator differences:

## Rendering Decision

- Selected drawing candidate: source-bound FFDec root Canvas export, with root frame 6 held and source `time = localFrame - 1` driving the 635-frame main sprite and nested children. Direct use of `sprite-246` alone was rejected because it omitted root-layer title/decor. A maintained generator and private Chromium spot checks now exist; this is still not the final student renderer.
- The 2026-09-24 root v2 successor refreshes the generator's audio-inventory binding without overwriting v1. Its regenerated drawing JS is byte-identical to v1, so the existing v5 text variant and local runtime remain exact. A read-only closure now binds the source SWF, current audio inventory, FFDec launcher/JAR, generator source graph, root outputs, v5 variant, and local copy; see `audit/CANDIDATE_CLOSURE_V2_2026-09-24.md`. This is reproducibility evidence for a private candidate, not registration or a scale-out authorization.
- A pure TypeScript source-clock candidate is implemented at `packages/demos/src/timelines/shared-nms002-l09-p003-source-clock.ts`. It holds at the observed frame-635 stop, supports modern host pause/resume/Replay, and keeps audio disabled. It is deliberately not registered and makes no original-runtime claim.
- Accessibility/localization: the actual-SWF text inventory and mask beats are recorded in `audit/SOURCE_TEXT_TRIAGE_V1.md` and `audit/SOURCE_TEXT_BEATS_2026-09-23.md`. A maintained pure `LessonTextBinding`/snapshot projection maps persistent title/schedule, the five-step mathematical reveal and six transient row-copy instances, with explicit ES English-source fallback. The private source-drawing candidate suppresses 15 exact text instances and seven outlined-text instances; it preserves red circles and printed bag marks. A dedicated fixed-800×600 bridge plus semantic React/CSS candidate now present those words and row emphasis; see `audit/NATIVE_CANDIDATE_BROWSER_2026-09-23.md`. Standalone local browser checks are not actual My Lesson accessibility or Spanish translation acceptance.
- Product adapter decision: the shared `LessonCanvasPlane` requires a declared adaptive 1×/2× renderer, sends only text suppression IDs, and expects all snapshot suppression IDs even on frames where transient source instances are absent. The pinned P003 generated Canvas runtime accepts only an exact 800×600 backing and requires exact shape IDs. A page-specific bridge sends/validates the exact active IDs and redraws raw source on failure; it does not claim unsupported 2× support. An SRI-bound loader and local-only Next host probe now exercise that bridge; actual My Lesson integration remains open. Canvas-only text was rejected as unreadable at narrow/text-enlarged widths; a flat screenshot/video was rejected because source timing and Replay must remain queryable.
- Audio engineering decision: preserve the source's whole embedded MP3 across its zero-byte second frame and keep it distinct from the shorter lesson-SA file. The exact-SHA, same-origin local audio route stays opt-in and default-deny. The unregistered local host now mounts a user-started continuous-stream clock with synchronous visible-frame commit, audio-driven picture, pause, candidate-coordinate inspection, Replay and frame-635 stop. Machine playback and browser frame agreement are not audio acceptance.
- The Chromium PCM measurement is pinned in `packages/demos/src/timelines/shared-nms002-l09-p003-audio-plan.ts`. The declared latency and sample span reach the terminal visual frame within one 12-fps frame, and the local mounted browser candidate reached frame 635. This does not establish original Flash timing, audio language, or human listening.
- The local player now pauses sound and picture on tab visibility loss, holds a pending sound start, and does not auto-resume on return. The silent candidate timer also pauses. The English local browser probe held audio/visible/committed frame 200; see `audit/LOCAL_VISIBILITY_HOLD_2026-09-24.md`. This remains outside the real My Lesson lifecycle.
- A maintained, still-unregistered `AnimationModule` adapter now maps exact `sprite-246` host frames and Replay identity to the pure text projection and SRI-bound fixed-canvas/native renderer. It rejects root/other-domain requests, mismatched source context, and unaccepted audio. The adapter declares the exact English-source text binding to the existing G6–G8 host, allowing Spanish UI controls with an explicit English-source fallback rather than claiming a translation. Its static-server test returns a loading state; no actual My Lesson descriptor or host browser run uses this module yet. The current static candidate route takes precedence over the generic calibration bridge, but the registered P027 precedent shows that this same route can later host a source-ordered private My Lesson descriptor without moving the URL.
- A prepared, unactivated product-candidate freeze now pins the real SWF/XML, the existing drawing/toolchain closure, a maintained module-source graph, the local 8.9 MB renderer, and the canonical catalog placement. The exact packet and repeatable `--check` are recorded in `audit/PRODUCT_CANDIDATE_FREEZE_V1_2026-09-24.md`. This is a prerequisite artifact for reviewed registration, not registration itself.

## Timeline Specification

Summarize object phases, one-indexed frame windows, transforms, alpha, depth, text/count changes, audio cues, and interaction transitions. Keep the full frame list in `keyframes.csv`.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

Summarize extracted, converted, redrawn, and generated assets. Record each item in `asset-inventory.csv`, including source character/symbol IDs and transformation notes.

## Implementation Map

- Next.js route: `apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l09-p003/page.tsx` and the same-origin, exact-SHA asset route under `apps/web/app/flash-assets/g678-local/shared-nms002-l09-p003/`. Both are local-only and unregistered.
- React component: `packages/demos/src/timelines/shared-nms002-l09-p003-native-candidate.tsx` (unregistered local candidate).
- Prepared product-host module: `packages/demos/src/modules/g678-nms-l09-native-candidate-p003.tsx` (bound only by a prepared freeze; unregistered, no product descriptor).
- Prepared timeline entrypoint: `packages/demos/src/timelines/g678-nms-l09-p003.ts` (not registered); prepared local freeze: `catalog/product-bridge-calibrations/g678-nms-l09-p003-product-candidate-v1.json`.
- Pure timeline module: `packages/demos/src/timelines/shared-nms002-l09-p003-source-clock.ts` and `shared-nms002-l09-p003-source-text.ts`.
- Unit test files: `shared-nms002-l09-p003-canvas-bridge.test.ts`, `shared-nms002-l09-p003-native-text.test.tsx`, and the existing source clock/text tests.
- Ruffle reference route:
- Standalone package:
- Deterministic `?frameDomain=`, `?requirementId=`, `?trace=`, `?entryStateSha256=`, `?frame=`, `?scenario=`, `?lang=`, and `?seed=` capture modes:
- Mandatory matching `data-flash-*` identity attributes:

## Verification Evidence

- PASS: real-source structure/frame-domain/text-mask tests, four local clock tests, four text-projection tests, and isolated TypeScript check. Source-audit CLI verified the exact SWF and all three FFDec scripts; generated registry `--check` passed with P003 absent. The root Canvas candidate generated and regenerated byte-identically; key and mask-beat frames were drawn in Chromium and inspected as private candidate evidence (`audit/ROOT_CANVAS_CHROMIUM_2026-09-23.md`, `audit/SOURCE_TEXT_BEATS_2026-09-23.md`).
- PASS: fixed-canvas bridge/native semantic candidate focused tests, isolated TypeScript check, and local Chromium desktop/narrow/text-enlargement/ES/Replay observations in `audit/NATIVE_CANDIDATE_BROWSER_2026-09-23.md`. These checks cover a private diagnostic, not the actual product host or complete fidelity.
- PASS: local Next host/asset probe with SRI-bound v5 delivery, exact source/runtime rehash, 25 focused P003 tests, six server tests, 8 GB-heap Web typecheck, EN/ES Chromium route checks, and negative asset requests. See `audit/LOCAL_NEXT_HOST_PROBE_2026-09-23.md`. This is a mounted engineering probe, not My Lesson admission. At 320px and 32px root, shared mobile navigation adds 2px page overflow; P003 stage remains contained.
- PASS: whole-stream audio source extraction/decode identity, exact source and local-asset binding, local request-policy rejection tests, and 8 GB-heap Web typecheck. The live local server returned 404 with P003 audio opt-in unset; positive browser delivery and decoding are still open. See `audit/SOURCE_AUDIO_MACHINE_AND_LOCAL_ACCESS_2026-09-23.md`.
- PASS: Chromium 153 decoded the exact source stream to 22,050 Hz mono with the expected 1,165,824 samples, identically through OfflineAudioContext and AudioContext; the browser PCM digest is separately pinned. This was a read-only loopback probe, **not** the Next route or the mounted page. See `audit/BROWSER_PCM_DECODE_2026-09-24.md`.
- PASS: local Next opt-in audio route delivered the exact MP3 into the P003 browser page and decoded to the pinned Chromium PCM hash; wrong-SHA and Range requests were denied, and default-deny 404 was restored. EN/ES manual frame operations verified visible commit, including a fault-injected draw failure that held the prior paused frame. See `audit/VISIBLE_COMMIT_AND_NEXT_AUDIO_ROUTE_2026-09-24.md`. No page sound or listening was exercised.
- PASS: a subsequent local-only mounted page explicitly prepared and started the source stream, bound visible frames to the audio clock, held pause/inspection, replayed, reached frame 635, and blocked sound on an injected failed visible commit while restoring actual prior pixels. The final-code ES rerun retained the English-source fallback and matched frame markers. Default-deny 404 was restored. See `audit/MOUNTED_SOURCE_AUDIO_CANDIDATE_2026-09-24.md`. This is candidate playback, not original-runtime listening acceptance.
- PASS with qualification: a local English visibility probe held silent frame 556 and sound/visible/committed frame 200 without automatic restart; final Web typecheck, 20 focused audio-policy/clock tests, and three source-bound server tests passed. The temporary opt-in file was removed and its cached dev process stopped, but another same-worktree Next process prevented a fresh live negative-route check. See `audit/LOCAL_VISIBILITY_HOLD_2026-09-24.md`.
- PASS: current-input root v2 regeneration and read-only end-to-end candidate closure, including v5 text variant and local package `--check`; seven source/renderer/race tests and a provenance-tamper regression passed. The v1 spec remains historical and stale against the later audio inventory. See `audit/CANDIDATE_CLOSURE_V2_2026-09-24.md`.
- PASS: five focused prepared-module tests cover source-domain metadata, the existing G6–G8 text-presentation contract, deterministic seek/Replay/ES fallback, invalid context and audio denial, and SSR loading with Spanish UI over English source. All 19 focused module/clock/text/bridge tests and an isolated strict TypeScript check passed. Registry generation `--check` passed with P003 absent (471 distinct shared keys). The default 4 GB whole-demos TypeScript run OOMed; an 8 GB retry before this text-capability refinement finished with the same six previously recorded errors in unrelated P044/P046/P054 dirty tests and no P003 diagnostic. This module has not been registered or mounted in My Lesson.
- PASS: the exclusive-create P003 product-candidate freeze regenerated and checked its 20-input/5-output local closure; a second create attempt failed without altering the freeze hash. The prerequisite drawing closure and 19 focused tests pass in the read-only check. See `audit/PRODUCT_CANDIDATE_FREEZE_V1_2026-09-24.md`. Prepared-only flags and the unchanged registry count are explicit.
- Full demos typecheck remains red: six errors in unrelated, existing untracked NMS L2 P044/P046/P054 tests after an 8GB-heap retry. The default 4GB-heap attempt ended in OOM. No P003 error was reported, but this does not make the package typecheck green.
- Production build, complete native capture manifests, authoritative original-runtime/current-JS manifests, frame metrics, RMSE, actual My Lesson Replay/keyboard/responsive/console/network/audio flows, original-runtime audio timing/listening, human review, and Owner records: pending. The four local native-candidate screenshots and mounted-browser observations are candidate spot checks only.

## Exceptions And Decisions

- No original-runtime session, frame comparison, listening acceptance, human review, or Owner acceptance exists yet.
- The candidate cannot be sent through `g678-terminal-source-generator-v6` unchanged because that generator requires zero nested sprites in the main domain. Do not widen its family contract based on this one source.
- Current-JS registry, My Lesson integration, strict completion, release, and publication all remain open.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
