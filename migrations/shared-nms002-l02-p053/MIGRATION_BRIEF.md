# shared-nms002-l02-p053 Migration Brief

Created: 2026-09-23

## Objective

Migrate NMS002 L2 XML occurrence 53 (`Game 1`) into the modern My Lesson page
as source-evidenced JavaScript. The source names a fractions/decimals/percents
matching game with level choice. Instructional flow, bilingual presentation,
and the host-owned transition need further behavior audit. This is not yet an
implemented or registered Current-JS page.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`): `swf-f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`
- Placement `animationId`: `shared-nms002-l02-p053`
- Collection, grade, lesson, section, and page: G6–G8 shared, NMS002 L2, GS, XML occurrence 53
- Raw title and reviewed display title: `Game 1` / pending content review
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence: catalog-bound identity and
  behavior-heavy static triage; reachable behavior still unresolved. See
  `audit/SOURCE_INTAKE_V1.md`.
- Alias or variant relationship:

## Source Evidence

- FLA: none cataloged for this placement
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS02.swf`
- Source owner/provenance:
- SHA-256 values: SWF `f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`;
  lesson-SA candidate MP3 `c29ad5278f052df73d8cdc800b957f2c3645bc3cf2eeeea8858404b2dd41e008`.
- Missing source files: paired FLA absent; no conclusion yet about other required assets.
- Evidence conflicts and resolution: Start handlers reference both `L2GS03`
  and `L7GS03` in different nested states. `audit/host-navigation-resolution-v1.json`
  resolves the exact host's current-section basename lookup under normal L2
  GS entry: the early `L7GS03` request misses, while later `L2GS03` matches.
  Actual click reachability, host global state, and visible reload behavior
  remain unverified; do not silently normalize one target to the other.

## Runtime Audit

- SWF signature/version: CWS/ZLIB, v6, AVM1 actions
- Stage width and height: 800 × 600
- Frame rate, frame count, duration: 12 fps; 10 root frames, plus placed
  694-frame sprite 187. Root-only duration is not the game duration.
- Background/transparency: SWF SetBackgroundColor `#b8d8f7`;
  selected static sprite probes do not establish scripted appearance.
- ActionScript generation and scripts: FFDec exported 59 AS1/2 script records;
  authoring generation unresolved. See `audit/SOURCE_INTAKE_V1.md`.
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings: the source parser finds 2 font records,
  39 text definitions, 44 decoded runs and no unparsed tags. The hash-bound
  text-placement audit is `audit/SOURCE_TEXT_PLACEMENT_V1.md`. It distinguishes
  the unplaced sprite-17 `Inequalities Match Game` text 15 from the placed
  `Fractions, Decimals, and Percents Match Game` text 103 in popup sprite 104
  and text 178 in main sprite 187. Static placement does not prove scripted
  visibility or reading order.
- Audio/video: embedded sound-stream tags and a cataloged lesson-SA MP3
  candidate; cue schedule and language unresolved.
- Audio cue IDs, language tracks, hashes, durations, and start frames (`audio-inventory.csv`):
- FlashVars, URLs, external assets, and legacy APIs: `_level0.InternalPreloader`
  and `_root.doNeedMoreHelp` require a source-evidenced modern-host disposition.
  The bound `indexMI.swf` reads `ServerRoot` and `XML_URL` root variables;
  their actual runtime values and complete dependency closure are not known.
- Stops, labels, buttons, Replay, and user interactions: level 1/2 selection,
  Start, Repeat Directions, Skip Directions, and `SelectLevel` / `RepeatDirection`
  labels are structurally present. `RepeatDirection` is nested frame 3 and
  `SelectLevel` is nested frame 693. The L2GS03 target is the distinct P054
  six-pair game; its source-locked card and scoring contract is
  `catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json`.
  Exact reachable transitions and Replay remain unverified.
- Audit tools and exact versions: FFDec 26.2.1 and swfmill 0.3.6.
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

- Selected renderer: undecided; provisional behavior-heavy / advanced-manual
  lane only after reachable-state audit.
- Why it fits this animation: no renderer chosen yet; a low-page factory pass
  cannot be justified by the ten-frame root alone.
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

Unresolved nested timeline, two Start-handler target strings, host adapter,
level matching rules, exact audio cues/language, Spanish source availability,
original-runtime trace, and all downstream acceptance gates. No exception or
approval has been granted.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
