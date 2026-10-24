# P005 mask correction v2 — 2026-09-26

## Result

Unregistered engineering candidate v2 corrects the two exclusive clipDepth mask fills. The previous pale candidate-v1 remains untouched. Actual registry coverage is still 480/2,282; P005 is not admitted. No original-runtime, fidelity, audio, human/Owner, strict-completion or publication gate is closed.

## Source and semantic basis

SWF SHA-256 `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`; source XML SHA-256 `944585dd7b3b53e2d65dc268fffcb1f5c81bde71de5f79c5d2c9c158a142f128`.

Adobe documents that ordinary mask layers ignore transparency/color/line styles: https://helpx.adobe.com/uk/animate/desktop/animation/using-mask-layers.html (read 2026-09-26). The Adobe SWF19 specification, clipping layers, states that clipDepth shapes mask the subsequent depths through the inclusive clipDepth rather than appearing as ordinary artwork: https://open-flash.github.io/mirrors/swf-spec-19.pdf, printed page33 / PDF page35. These are semantic references, not a capture of this movie in an original runtime.

ElementTree audit checks exact source mask placements: shape1 depth1 clipDepth132; shape203 depth2 clipDepth56. Both are simple filled shapes, without strokes or placement color transforms. All explicit references to those character IDs are mask placements. The source shape fills have alpha90 and alpha118. Raw Canvas export uses these fractional alpha fills as destination-in masks, attenuating the subject. A bounded maintained generator replaces only these mask fills with opaque white geometry; paths, transforms, depth ordering, ordinary artwork and all other alpha remain unchanged. No broad alpha boost or source/bitmap edit is performed.

## Artifacts

- Maintained generator: `scripts/build-g678-alg-l12-p005-mask-candidate.mjs`; tests alongside it. Reads physical pinned SWF, pinned XML and pinned predecessor. XML uses ElementTree. Create-only versioned outputs; `--check` verifies byte-identical reconstruction.
- `candidate-v1/canvas-renderer.js` remains SHA-256 `3dbbe2b2448530f9c531b3de9609e6f3167e0803a7c1e7d38899fd422d51713c`.
- `candidate-v2/canvas-renderer.js`: 19,449,678 bytes, SHA-256 `48efbca3ddebf218565cdd635ffa130ae3a402c5693dd1ebcf359b2c30d500dd`.
- `candidate-v2/mask-manifest.json` binds source, predecessor and audit. The v1 adapter-spec remains the base drawing contract; v2 is its narrow mask delta, not a registered module.
- Probe server `scripts/serve-g678-alg-l12-p005-candidate.mjs` now accepts explicit `v1` or `v2` with separate pinned hashes; defaults to v1. It binds only 127.0.0.1:3134.

## Validation

Three new tests pass: exact two-line delta with all other runtime lines equal; source-mask XML audit; deterministic v2 reproduction. Combined with v1 composition and restricted-runtime tests, **9/9 pass**. Initial two test failures were percent-encoded file URL paths in the test harness; corrected with fileURLToPath, with no change to generated runtime.

Browser: native800×600, DPR1, HeadlessChrome153. All968frames rendered with matching frame attributes; 603 distinct SHA-256 pixel hashes. Thirteen reverse seeks matched their forward hashes. Full hash record: `evidence/mask-v2-drawing-sweep-2026-09-26.json`. Browser console: zero errors, one readback performance warning. Four stage screenshots under `output/playwright/g678-p005-mask-v2-20260926/` (23,507,582,968) were inspected by main: scenes are no longer globally washed out; title/border/composition remain. No reference RMSE or natural-original trace was produced. This is an observed engineering correction, not fidelity acceptance.

The predecessor app build remains applicable to unchanged app code; no new application build was claimed for this generator-only change. Shared My Lesson host SHA remains `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`.

Independent read-only agent review found no actionable source-correctness issue. It inspected full placement histories, including 1,693 move-only tags, and found no active-mask depth updates; shape203 is removed at frame733. It also inspected the four AVM1 action tags (preloader/stop operations) and found no mask/alpha/cacheAsBitmap mutation. In response to its test-hardening note, the generator now explicitly tracks every timeline depth and rejects any placement update while either mask is active, as well as unexpected PlaceObject3 tags. This does not change candidate or manifest bytes. Main independently reran the final11-test combined suite; all pass.

## Parallel audio result and next action

See `AUDIO_TIMING_ANALYSIS_2026-09-26.md`: independent MP3-header scanning and decoded-frame counts match the source sum of3,309,696samples (75.049795918s). The 74.698s number is a nominal-bitrate duration estimate, not missing source samples. Main read the diagnostic/tests and independently reran2/2tests and `--check`, all pass. The44-frame source block gap remains a synchronization requirement; do not simply play the concatenated file continuously.

Continue with maintained P005 module/host integration using v2 and an explicit audio-pending policy, or a bounded source-supported audio clock implementation. Keep nested natural-trace, language, audio-listening and strict acceptance separately pending; do not let missing strict authority prohibit source-supported local engineering. Preserve frozen shared host and source/registry boundaries. Probe browser/server have been closed.
