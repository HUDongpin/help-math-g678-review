# shared-alg001-l12-p001 Migration Brief

Created: 2026-09-25

## Objective

Migrate the ALG001 Lesson 12 Introduction animation into the modern My Lesson page sequence. This is a source-audited local drawing candidate, not an integrated or registered page. The source title is English; Spanish visual/content authority remains unresolved.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`): `swf-393da0d6755e706bf849a2cff0796823e129fa6bc7f438b93d09c05547679b67`
- Placement `animationId`: `shared-alg001-l12-p001`
- Collection, grade, lesson, section, and page: G6–G8 shared ALG001, lesson 12, IR page 1.
- Raw title and reviewed display title: `Introduction`; lesson title `Graphing in the Coordinate Plane`.
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence:
- Alias or variant relationship:

## Source Evidence

- FLA: no FLA bound in the current page catalog; authoring evidence is SWF-only.
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/IR/L12IR01.swf`
- Source owner/provenance: physical AWS Grade-Classified Courseware root, catalog binding `G6-G8-shared/ALG001/L12/IR/L12IR01.swf`.
- SHA-256 values: SWF `393da0d6755e706bf849a2cff0796823e129fa6bc7f438b93d09c05547679b67`; source XML `893dcf4845bf4d7ecd1b44bfae9b9710420a9b358ec4bc530e330032e081743a`.
- Missing source files:
- Evidence conflicts and resolution:

## Runtime Audit

- SWF signature/version: CWS v6.
- Stage width and height: 800 × 600.
- Frame rate, frame count, duration: 12 fps; root 10 frames; source-local `sprite-142` 130 frames (10.83 seconds at 12 fps). This does not by itself establish original playback duration.
- Background/transparency:
- ActionScript generation and scripts: 31 FFDec script files, byte-identical to registered ALG001 L11 P001; root-reachable content sprite has no direct `DoAction`. See `SOURCE_AUDIT_2026-09-25.md`.
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings:
- Audio/video: one embedded SoundStreamHead and 130 SoundStreamBlock tags; not rendered by the local Canvas candidate and not listening-accepted.
- Audio cue IDs, language tracks, hashes, durations, and start frames (`audio-inventory.csv`):
- FlashVars, URLs, external assets, and legacy APIs:
- Stops, labels, buttons, Replay, and user interactions:
- Audit tools and exact versions: swfmill 0.3.6; JPEXS FFDec 26.2.1.
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

- Selected renderer: hash-bound FFDec Canvas drawing through the maintained safe source-static adapter, local candidate only.
- Why it fits this animation: the root-reachable content is a 130-frame, script-free intro sprite; no legacy ActionScript is executed by the candidate.
- Rejected alternatives and tradeoffs:
- Accessibility and localization approach:

## Timeline Specification

Summarize object phases, one-indexed frame windows, transforms, alpha, depth, text/count changes, audio cues, and interaction transitions. Keep the full frame list in `keyframes.csv`.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

Summarize extracted, converted, redrawn, and generated assets. Record each item in `asset-inventory.csv`, including source character/symbol IDs and transformation notes.

## Implementation Map

- Next.js route:
- React component: pending My Lesson integration; local drawing runtime at `candidate/canvas-renderer.js`.
- Pure timeline module:
- Unit test file:
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

The current candidate is not registered. My Lesson playback/Replay, responsiveness, English/Spanish host validation, production-negative check, source audio language/synchronization/listening, original-runtime/fidelity, human/Owner review, strict completion, release, and publication are open. The 31 shared scripts do not imply that this page's title drawing can be copied from L11. See `SOURCE_AUDIT_2026-09-25.md` and `candidate/adapter-manifest.json`.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
