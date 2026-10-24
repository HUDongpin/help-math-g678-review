# shared-nms002-l02-p055 Migration Brief

Created: 2026-09-23

## Objective

Continue the complete G6–G8 page-only migration with the NMS002 L2 `4 - Step Plan` page. The exact source, glossary calls, host dependencies, and audio hold are in [SOURCE_INTAKE_V1.md](audit/SOURCE_INTAKE_V1.md). At creation this was a preserved-source draft. The 2026-09-27 continuation below adds an unregistered local candidate; registration, original-runtime comparison, and acceptance remain open.

## Local implementation — 2026-09-27

- The local calibration page now has source-extracted native text, an optional reference drawing, a full-buffer main-audio controller, source-frame seeking, Pause, Replay, volume, and source vocabulary controls. It is not a registered My Lesson page.
- The maintained producer is `scripts/prepare-nms-l02-ts-native-visual.mjs`; its exact source-text IR has 12 static definitions and 18 placement instances, including alpha poses and short emphasis generations. The unresolved dynamic field remains in the reference Canvas. DOM text reflows at narrow widths; source line breaks remain in the IR.
- `scripts/extract-nms-l02-ts-main-audio.mjs` extracts the one source MP3 stream; decoded length is 637,056 mono samples at 22,050 Hz. `SourceLinearAudioController` is a modern linear playback proposal, not an original-runtime synchronization or listening acceptance claim.
- No main audio is fetched on entry; Play explicitly starts it. Reduced-motion entry is paused at frame 351. Dictionary controls pause before reporting that the entry is unavailable. The L2 dictionaries remain missing; no L1 entry was silently substituted. The separate SA track remains an inventory candidate.
- The identified `indexMI.swf` host parses lesson navigation but does not consume its top-level Keyterms node; its static initialization loads the L1 bank. This narrows the source conflict without proving the historical P055 host association. See `output/nms-l02-ts-family-20260927/glossary-dependency/HOST_XML_KEYTERM_PRECEDENCE_2026-09-27.md`.
- The existing NMS L02 descriptor predecessor fails its own frozen input check on `g678-preview-policy.ts`. Preserve that failure and the old proof bytes; a reviewed host successor is required before real My Lesson admission.
- Candidate evidence and limitations are retained under `output/nms-l02-ts-family-20260927/`; the product checkpoint is `evidence/LOCAL_CANDIDATE_2026-09-27.md`.

## Identity And Classification

- Immutable asset ID: `swf-8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e`.
- Placement: `shared-nms002-l02-p055`; G6–G8 shared, NMS002 L2, TS, ordinal 55.
- Raw title `4 - Step Plan`; catalog EN/ES titles `4 Step Plan` / `Plan de 4 Pasos`.
- Mathematics domain: fractions, decimals, and percent; the precise pedagogical beat sequence still needs text and natural-runtime audit.
- Canonical source, no catalog alias/variant. Catalog/source identity is confirmed; behavior and acceptance are not.

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS02.swf`
- Read-only canonical G6–G8 source, 149,059 bytes; SHA-256 matches the asset ID and catalog.
- No same-path FLA. Lesson 2 EN/ES key-term XML is currently not recovered; do not invent term bodies.
- Hash-bound lesson-SA MP3 is a candidate, not an accepted cue or language track.

## Runtime Audit

- CWS v6, 800×600, 12 fps; root 10 frames, main sprite 26 has 351 frames.
- Background `#b8d8f7`; AVM1 scripts, AS1/AS2 authoring distinction unresolved.
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings:
- Audio/video:
- Audio cue IDs, language tracks, hashes, durations, and start frames (`audio-inventory.csv`):
- FlashVars, URLs, external assets, and legacy APIs:
- Root host preloader/stop and begin label/stop; main buttons 15/16/22 request Restate/Question/Problem through `DoHyperLinks` and pause animation. Natural Replay and terminal behavior remain unverified.
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

The L2 key-term XML pair, host term lookup, main narration association/timing, complete frame/text audit, original-runtime natural trace, rendering, My Lesson integration, bilingual QA, and all acceptance gates remain open. The L1-only TS02 family generation/calibration does not authorize P055 scale-out. See source intake for the precise blockers.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
