# ALG001 L7 P018 — y-intercept −2

Source-bound specification prepared before product implementation. Canonical placement `shared-alg001-l07-p018`, global/occurrence 18, VB page 12. SWF asset `swf-6d279948c0670391d81d384cc1e17abe962a4623eb3fedc56864de27e02dee6f`; exact physical source and working-copy pins are in `audit-v1/source-custody-v1.json`. Same-path FLA is absent. Source SWF and separate original Spanish MP3 remain unchanged.

## Authored behavior

800×600, 12 fps, root 10; root 6 mounts title 2 and main 76. Main has 361 frames and loops naturally without completing the host lesson. Eight reachable domains include title 2, initial-line 37, active-thumb 52, feedback 66 with 15 frames, static-thumb 68, final-line 71 and main 76.

The demonstration shows intercept 3.0 through 21 and −2 from 22 through 121. Main 122 stops, sets the read-only dynamic input to 3, resets TryCount and enables the exercise. The native slider uses the exact integer formula `Math.round(x/10-3)` with authored x bounds −70..130, giving −10..10. Correct string −2 continues playback. Every accepted Draw increments the attempt count. On error the popup starts 2, assigns WrongFeed on its frame 2, then stops 15. Close is available immediately: the first Close preserves the selected input at 122; the second resumes 123.

At 123 the popup and active drag are removed. The dynamic input remains through 124. Frame 125 replaces it with a new unnamed field containing −2 and replaces the initial y=x+3 line by the authored y=x−2 line. No source action assigns the internal input after 122. The named Draw button remains through 361; after second-wrong Close it can accept one later click, increment/disable, and continue without reopening the removed popup or restarting current audio. Test this persistent button separately from the removed dynamic field.

Frames 132–154 interpolate source yellow morph 72; static 73 follows 155–167, with both overlays removed 168. The −2 annotation 75 and yellow backing 74 appear 175–241, including source scale 1→2 emphasis, then disappear 242. The grid/axes/source-label RGB transform is multiply 46/256 plus 125 from 223–360 and restores 361; red line and intercept annotation remain untinted. Native axis labels retain readable contrast while representing the de-emphasis; this is a deliberate modern text decision, not a pixel-fidelity claim.

Instructions use source complete-word mask reveals: first instruction complete 77, Draw instruction complete 106. The two source glossary actions are Equation and Y-intercept; native term controls begin when the corresponding complete word is revealed. Exact EN/ES definitions are bound to verified dictionaries. Source English instructional content remains on ES routes with localized controls and glossary; no Spanish content acceptance is implied.

## Audio and source inspection

Binary SWF and swfmill stream payloads agree. Popup 66: 5,720 bytes, 25,344 decoded mono samples at 22,050 Hz. Main 76: 147,550 bytes, 653,760 samples at 22,050 Hz. Original optional SA: 144,144 bytes, 494,208 mono samples at 48,000 Hz. Stream run boundaries, seeks, hashes and PCM measurements are in `native-v1/streams-v1.json` and `decode-native-v1.json`. All native AudioContexts closed. Spanish Audio remains explicit user-triggered, holds current main/feedback state, and returns paused; never autoplay from locale or splice into narration.

Seventeen public-tool main-frame extractions and 25 exported shapes were visually inspected in `audit-v1/source-frames-{0,1}-v1.png` and `source-shapes-v1.png`. The initial visual model omitted late RGB tint; its earlier version remains in `audit-v1/visual-model-before-rgb-v1.json`, and the generator now retains the transform. Public-tool frames do not execute original AVM1 interaction and are not original-runtime acceptance.

## Implementation and validation plan

Use the compiler-assisted maintained-native advanced lane: compact generated source data, native text/range/button/feedback, exact source SVG and morph paths, existing source-stream transport, and current My Lesson host. Reuse immutable slider-feedback templates after source-specific checks for initial 3, answer −2, popup 15, retained internal input and Draw through 361. Preserve previous consumers. Give visual spans explicit readonly types to prevent recurrence of P017 literal-union TypeScript complexity.

The pre-implementation specification enumerates 20 requirements and 1,534 deterministic frame queries across all eight domains and both languages. Add state/session/frame tests for first/second wrong, correct, immediate/pending Close, persistent late Draw, retained input versus static −2, color/morph/annotation boundaries, ordinary 361→1 loop, explicit SA, Replay and cleanup. Exercise the actual registration writer/reader before admission, then frozen real My Lesson EN/ES desktop/mobile workflows, current layout checks and production-negative validation.

## Independent gates

No registration is claimed by this specification. Exact AVM1 behavior after referenced objects are removed, original-runtime timing/appearance, full-frame comparisons, listening, human visual review, Owner acceptance, strict completion and publication remain unverified. Source feedback calls the input a “slope box”; retain that source wording and its discrepancy. No source endpoints, provider writes or release actions are part of this local task.
