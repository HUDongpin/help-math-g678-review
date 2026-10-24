# shared-nms002-l02-p030 Migration Brief

Created: 2026-09-19

## Objective

Describe the instructional purpose, target users, required languages, interactions, and exact stakeholder request.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`):
- Placement `animationId`:
- Collection, grade, lesson, section, and page:
- Raw title and reviewed display title:
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence:
- Alias or variant relationship:

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/IN/L2IN15.swf`
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

- Selected renderer: React + SVG / Canvas + CreateJS / Canvas + PixiJS / other
- Why it fits this animation:
- Rejected alternatives and tradeoffs:
- Accessibility and localization approach:

## Timeline Specification

Summarize object phases, one-indexed frame windows, transforms, alpha, depth, text/count changes, audio cues, and interaction transitions. Keep the full frame list in `keyframes.csv`.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

Summarize extracted, converted, redrawn, and generated assets. Record each item in `asset-inventory.csv`, including source character/symbol IDs and transformation notes.

## Implementation Map

- Next.js route:
- React component:
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

List every unresolved mismatch, unavailable tool/source, accepted emulator difference, owner decision, and follow-up. Do not leave this section blank; write `None` when there are no exceptions.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:

## P030 source audit continuation

Exact placement: NMS002 Lesson2 occurrence30, IN14, L2IN15.swf, Tenths. Source SHA-256 a67fd2cd208277a695c01be67fe9346852bca4ff4a76ec88dd7902a63a048c48. SWF-only; no authoring FLA claimed.

Compiler-assisted hybrid preparation: all299 main67 frames and10 root frames audited;45 teaching states derived. Ten-strip counting and successive0.1/1/10 and0.5/5/10 examples require source-timed native semantics. New clear native title requirement applies to the source outlined heading8. Horizontal place-value labels and any reduced-motion behavior require explicit qualified implementation and checks.

Source button22 is reused in both header regions through frame11; source24 replaces the Decimals-region instance at12. Preserve exact source instances; gate native term action at readable source state and record any correction rather than silently assigning new behavior. Source shape48 is zero-height204..215 then restores216..219.

Audio: complete MP3 decode509760 samples; source gap98..107. A two-segment PCM plan partitions the full decoded stream at158962, preserving all508087 post-latency samples exactly once. Source-frame/seek timing is engineering evidence, not original-runtime or listening acceptance.

Pending: maintained page implementation; actual My Lesson registration/integration; source-aligned playback/replay; responsive title checks; original runtime, fidelity, audio listening, named human/Owner acceptance, strict completion and publication.
