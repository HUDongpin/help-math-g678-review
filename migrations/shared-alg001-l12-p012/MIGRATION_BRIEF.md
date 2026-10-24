# shared-alg001-l12-p012 Migration Brief

Created: 2026-09-27

## Objective

Continue the complete G6–G8 migration with the active ALG001 L12 vocabulary
placement P012. Learners move a spider in a coordinate plane using eight
one- or three-unit direction controls, observe the ordered pair, and recover
from a move outside the inclusive −10..10 bounds. The current source supplies
English teaching text; an ES interface does not establish Spanish content.

Current engineering work is unregistered. See
`evidence/INTERACTION_INTEGRATION_2026-09-27.md` for the latest implemented
boundary and independently checked outputs. The official denominator remains
2,282 placements; this candidate contributes zero new registrations.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`): `swf-b322949a960acef3fee6018a65785b29cd3693717ca3ba33d0d930d7866320aa`
- Placement `animationId`: `shared-alg001-l12-p012`
- Collection, grade, lesson, section, and page: G6–G8-shared / ALG001 / L12 / VB / P012
- Raw title and reviewed display title:
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence:
- Alias or variant relationship:

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB07.swf`
- Source owner/provenance:
- SHA-256 values:
- Missing source files:
- Evidence conflicts and resolution:

## Runtime Audit

- SWF signature/version:
- Stage width and height:
- Frame rate, frame count, duration:
- Background/transparency:
- ActionScript generation and scripts:
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings:
- Audio/video:
- Audio cue IDs, language tracks, hashes, durations, and start frames (`audio-inventory.csv`):
- FlashVars, URLs, external assets, and legacy APIs:
- Stops, labels, buttons, Replay, and user interactions:
- Audit tools and exact versions:
- Confidence by audit area:

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

- Selected renderer: preserved FFDec Canvas vectors with a maintained React
  interaction state machine, native text/controls and SVG coordinate overlay.
- Why it fits this animation: the 119-frame introduction retains source vector
  composition; the stopped final frame needs live, source-derived movement,
  bounded coordinates, feedback and coach state rather than linear playback.
- Rejected alternatives and tradeoffs: static/video output cannot implement
  learner movement. Existing G4 L11 coordinate modules select terms or frames,
  so they cannot supply P012's paired press/release and per-frame movement.
  This exception remains local instead of inventing a speculative shared API.
- Accessibility and localization approach: native keyboard/pointer buttons,
  readable coordinate status, explicit feedback focus and recovery. Exact
  sourceTextId values bind labels and feedback. Full native teaching-text
  substitution and responsive acceptance remain pending.

## Timeline Specification

Root has 10 frames; root frame 6 places sprite-86 at (412.4,283.3) pixels.
The main domain has 119 frames at 12 fps and stops at 119. Its onEnterFrame
continues moving the spider two pixels per tick: seven or 21 movement ticks,
one completion tick, then idle coordinate/dot/bubble commit. Replay resets
the full state. Host pause suspends intro, movement and coach together.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

Summarize extracted, converted, redrawn, and generated assets. Record each item in `asset-inventory.csv`, including source character/symbol IDs and transformation notes.

## Implementation Map

- Next.js route:
- React component: `packages/demos/src/alg-l12-p012-controls.tsx` and
  `packages/demos/src/alg-l12-p012-drawing.tsx`
- Pure timeline module: `packages/demos/src/alg-l12-p012-lesson.ts` and
  `packages/demos/src/alg-l12-p012-state.ts`
- Unit test file: corresponding `packages/demos/tests/alg-l12-p012-*.test.ts`
- Ruffle reference route:
- Standalone package:
- Deterministic `?frameDomain=`, `?requirementId=`, `?trace=`, `?entryStateSha256=`, `?frame=`, `?scenario=`, `?lang=`, and `?seed=` capture modes:
- Mandatory matching `data-flash-*` identity attributes:

## Verification Evidence

- Unit tests:
- Production build:
- Native-size keyframe captures:
- Complete authoritative original-runtime and current-JS capture manifests:
- Full-frame coverage manifest, comparisons, and archive:
- Per-frame metrics files and checksums:
- RMSE and diff-image results:
- Replay and keyboard checks:
- Desktop/mobile overflow checks:
- Console and network checks:
- Human reviewer and review date for all keyframe/full-frame diffs:
- Audio listening-acceptance record, or source-bound not-required evidence:
- Immutable human and owner record descriptors:

## Exceptions And Decisions

No paired FLA exists. AVM1 270/−90 rotation normalization and the page's missing
`enableButton()` callback remain unexecuted. Seeded coach choice, feedback input
locking, pointer cancellation and close-cancels-coach are explicit modern
policies. Coach and main MP3 streams decode to their declared sample counts;
branch timing, playback integration, SA, listening and original-runtime
comparison are not accepted. My Lesson integration, native typography proof,
registration and production-negative validation are not yet complete.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
