# P005 bounded drawing candidate — 2026-09-26

## Boundary and current result

The complete G6–G8 goal remains active. Actual catalog-page/private-registry intersection was recomputed after this work: **480/2,282 = 21.034180543383%, 1,802 remaining**. P005 is **not registered**. This turn adds a reproducible source drawing candidate, nested-clock IR, extracted stream, and browser evidence, not a completed page or acceptance claim.

Working tree: `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`. Preserve its unrelated dirty work. Physical source: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW05.swf`, 1,950,595 bytes, SHA-256 `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.

## Delivered and independently checked

- Three agents handled bounded FFDec export, nested source timeline, and MP3 extraction. Main inspected their implementations and reran tests. The nested parser was revised to Python ElementTree under the flash-to-js XML-library requirement; unknown CLI flags, symlink sources, and destructive IR overwrite are rejected.
- Export: `audit/ffdec-26.2.1-canvas-v1/`, ten files, 39,238,435 bytes. No frame-PNG sequence. Export receipt SHA-256 `0498c010064778c001b760c79c3f4dae4413528915bd6a4b5e5d042e3dc113e9`.
- Nested IR: `audit/nested-timeline-v1.json`, SHA-256 `76af901fdf335648b739b604f7fdf4fbedda752731b034c4c1f17bd6117b2926`. Six child timelines, seven placement epochs. All 224 exported child calls across 968 parent frames agree with the source-tag structural model at time zero. This is not original-runtime clock authority.
- Main-maintained builder and restricted-runtime validator produce `candidate-v1/canvas-renderer.js`: 19,449,725 bytes, SHA-256 `3dbbe2b2448530f9c531b3de9609e6f3167e0803a7c1e7d38899fd422d51713c`. Root frame 6 combines sprite391, title395, and border396 on an 800×600 stage. No registration or app-module changes.
- Stream: `audio-source-v1/sprite-391-source-stream.mp3`, 597,584 bytes, SHA-256 `988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`. Receipt SHA-256 `c193f9856de277227e8ee6dbe3c97d714863c701398bc98854276e94baa4b639`. 902 source blocks; block sample sum 75.04979591836735 seconds versus ffprobe MP3 74.698 seconds. Gap frames340–383 is not presumed silence. No listening, sync, language, or audio acceptance.

## Checks

Main reran these five test files together: `build-g678-alg-l12-p005-nested-timeline.test.mjs`, `build-g678-alg-l12-p005-candidate.test.mjs`, `validate-g678-alg-l12-p005-runtime.test.mjs`, `export-g678-alg-l12-p005-canvas.test.mjs`, `extract-g678-alg-l12-p005-stream.test.mjs`: **20/20 PASS**. All are under `scripts/`. Nested `--check` and candidate reproducibility passed. Existing source-structure, pending-coverage, and static-keyframe Python builders also passed `--check`.

Browser receipt: `current-js-drawing-sweep-2026-09-26.json`. All 968 native 800×600 frame renders completed with correct state/frame attributes; 602 distinct pixel hashes; 13 reverse-seek hashes matched. Ten DPR2 screenshots under `output/playwright/g678-p005-drawing-20260926/` were visually inspected by main. These are candidate observations, not reference comparisons. Browser console had zero errors and one getImageData performance warning.

Application build passed: `NODE_OPTIONS=--max-old-space-size=8192 npm run build -w apps/web`, BUILD_ID `VabnnsHOmNTN-bZVKQKsw`, 246 static pages. P005 is not integrated: the build establishes existing-app health only. `git diff --check` passed.

## Visual hold discovered during inspection

The main scene is conspicuously pale across sampled frames; title and border are more saturated. Frame493 is nearly empty during a transition. Do not interpret all-frame drawing success as visual acceptance.

Concrete source/export finding:

- Source shape1 is a rectangle with fill alpha90, placed at main frame1/depth1/clipDepth132, without a color transform. Its exported fill alpha is 0.3529412.
- Source shape203 is a rectangle with fill alpha118, placed at main frame493/depth2/clipDepth56, without a color transform. Its exported fill alpha is 0.4627451.
- Exported sprite391 draws mask shapes into a temporary canvas, then applies it using `destination-in`. This transfers fractional mask alpha into the composed content.
- Root sprite391 has no source color transform. The root border shape396 has an opaque fill and is not a whole-stage translucent overlay.

This identifies a specific Canvas masking attenuation mechanism. Whether it matches the original Flash clipping semantics remains unverified. Do not manually brighten assets or edit generated runtime. Preserve candidate-v1 and its hashes as observed evidence. The next bounded implementation step is source/runtime-supported mask-semantics calibration, with regression tests, followed by a versioned maintained-builder candidate and repeated drawing checks. Only then proceed to real My Lesson integration, audio behavior, EN/ES and responsive host checks, freeze and exact registry admission. Original-runtime/fidelity, listening, human/Owner, strict completion, release, and publication remain separate gates.

## Resume and cleanup

- `MIGRATION_BRIEF.md` is candidate-v1 hash-bound. Do not casually edit it and invalidate reproduction; use additive evidence or deliberately version the candidate.
- Shared host was not changed: `apps/web/components/descriptor-driven-whole-lesson-player.tsx` SHA-256 `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`.
- Registry unchanged: `packages/demos/private-current-js-registry.json` SHA-256 `b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.
- All three assigned agents closed; P005 Playwright session and 127.0.0.1:3134 probe server closed after evidence collection. No provider action, deployment, commit, or push.
