# ALG001 L12 P002 migration specification

Status: implementing a silent Current-JS candidate; no strict acceptance.

## Identity and instructional scope

Placement `shared-alg001-l12-p002` is ALG001 Lesson 12 global page 2,
section RW page 1, catalog title `Page 1`. The source title is
“Graphing in the Coordinate Plane: Real World Activity.” This is a G6–G8
shared-module lesson-page animation, not the excluded historical course shell.
Source asset ID is
`swf-15e67732b739f0194087ded0748c2d23f9871363ed33388807c351f2aad6fb62`.
The exact physical source, source XML hash and custody facts are in
`SOURCE_AUDIT_2026-09-25.md`. No paired FLA is catalog-bound.

## Verified structural specification

The shipped CWS v6/AVM1 movie is 800×600, #b8d8f7, 12 fps, root 10 frames.
Root frame 1 calls the legacy preloader; root frame 6 is the stopped `begin`
placement. Main sprite 454 has 1,951 frames and a terminal stop at frame 1,951.
Root frame count and nested frame count must never be conflated.

At root frame 6, render sprite 454 at depth 1 and (278.4,366.85), sprite 458 at
depth 147 and (403.4,-42.4), and frame shape 459 at depth 150 and (0,0), in that
order. The title's DefineText 456 is above the stage; vector shape 457 contributes
the visible title. Do not discard the title merely from its negative root Y.
Nested sprites 43/389/449/451 have 22/36/19/36 frames. Their exported parent-clock
drawing is a candidate, not proof of natural original-runtime child timing.
No source buttons were found. Root preloader behavior remains unimplemented.

Source extraction uses swfmill 0.3.6 and FFDec 26.2.1. Main/title Canvas exports,
three embedded images, font glyphs, shape paths and matrices are hash-locked by
the maintained builder. No screenshots replace required vector interactions.

## Renderer and product decision

Compiler-assisted Canvas composition is retained for the dense 1,951-frame
timeline; hand-redrawing the scene or replacing it with a video would discard
source geometry and timing evidence. Each requested frame uses a fresh drawing
surface so prior mask state cannot change Replay pixels. The displayed stage
remains exactly 800×600. Shared adapters and frozen host files are unchanged.

The maintained module/timeline and local My Lesson route are the integration
target. Candidate runtime SHA-256 is
`993722d3cf0c30601805005fe8b750cecf50620a9b6692f5628f342184b4a3e4`.
The v2 builder checks final DOM/network/storage/timer primitives after source
composition. Root and sprite-454 contexts remain explicit. Source visual
language is fixed English; Spanish UI is not Spanish content acceptance.
Transport is host-owned, with one-indexed 12-fps playback and terminal clamp.
Replay resets current drawing and host state; original Flash Replay parity is
not established.

## Audio and dependencies

The main sprite has 1,927 MP3 blocks (22,050 Hz mono), payload hash
`f59bba9bf36633b0b6d385fa12370984bdf1b854833db08bea6bb5ccf1dc1930`.
Block windows are 1–415, 435–1115 and 1121–1951; negative seek markers occur at
415 and 1115. Separate lesson SA audio is 48,000 Hz mono, source hash
`cad83108fed08731582e639c0ef8c5886a5c56dab710c277c639cc0603c0fcf3`.
It is not byte-identical to the embedded stream. Decoder success establishes
neither language nor synchronization. Audio is required by the source, but this
candidate intentionally plays none while those mappings remain unresolved.
No legacy endpoint is called. Additional audio timing investigation is separate.

## Evidence and unresolved gates

`CANDIDATE_QA_2026-09-26.md` records ten selected frames and Replay checks.
`MAIN_REVIEW_2026-09-26.md` records independent reproduction and review.
The new full-domain requirement in `evidence/full-frame-coverage.json` spans
sprite-454 1–1,951 and requires natural original-runtime evidence. It remains
pending with zero authoritative captures. A drawing hash sweep is not a
coverage-v2 PNG manifest or a fidelity comparison.

The root/nested disposition audit, original-runtime execution, Spanish content,
audio/listening, complete comparisons, human and Owner decisions, strict
completion and publication remain separate open gates. The local keyboard,
navigation and responsive checks are recorded in
`evidence/my-lesson-browser-2026-09-26.json`, including the end-button,
320px Spanish reviewer-label and existing glossary-Escape limitations. They
are not full accessibility or visual acceptance. No accepted exception or
human signature is fabricated.

## Implementation map

- Generator: `scripts/build-g678-alg-l12-p002-candidate.mjs`
- Candidate: `migrations/shared-alg001-l12-p002/candidate-v2/`
- Module: `packages/demos/src/modules/shared-alg001-l12-p002.tsx`
- Timeline: `packages/demos/src/timelines/shared-alg001-l12-p002.ts`
- Local route: `/[locale]/migration-status/g678-calibration/shared-alg001-l12-p002`
- Canonical runtime: `work/g678-shared-page-factory/g678-alg-l12-real-world-current-js-v1/members/shared-alg001-l12-p002/canvas-renderer.js`

Registration is counted only after source freeze, registry, descriptor, real
My Lesson flows and production-negative checks pass. This specification does
not itself register the page.
