# shared-nms002-l02-p056 Migration Brief

Created: 2026-09-24

## Objective

Recreate the source-ordered NMS002 lesson-2 TS page 2 about organizing information inside the modern bilingual My Lesson host. The current JavaScript/SVG output is an unregistered source-static candidate, not an interactive product renderer or registered page.

## Identity And Classification

- Immutable `assetId`: `swf-a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`
- Placement `animationId`: `shared-nms002-l02-p056`
- Course/grade/lesson/section/page: NMS002 / G6–G8 shared / 2 / TS / 56 (TS page 2)
- Raw/display title: `4 - Step Plan` / `4 Step Plan`; Spanish catalog title `Plan de 4 Pasos`
- Domain: fractions, decimals, percents and concepts; source-specific beat: organize the information
- Evidence: `catalog/g678-shared-catalog.v1.json` and `audit/SOURCE_INTAKE_V1.md`; structural audit only
- Alias/variant: catalog says canonical, none

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS03.swf`
- Source custody: owner-provided real AWS Grade-Classified Courseware directory (not the compatibility symlink)
- SHA-256: `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`; 100,959 bytes
- Missing same-path FLA; exact lesson-2 bilingual key-term XML remains unavailable in the current visible source custody (see `audit/KEYTERM_SOURCE_BOUNDARY_V1.md`)
- No variant conflict known; same-stem external SA audio is not an established substitute for the embedded stream

## Runtime Audit

See `audit/SOURCE_INTAKE_V1.md` and FFDec exports for the exact structural findings. `audit/frame-domain-disposition.json` records the source XML's complete 10-frame root and sole 234-frame nested sprite. The root stops at `begin`, while sprite 24 contains the embedded audio stream and two glossary buttons first placed at sprite frame 9. `audit/AUDIO_SOURCE_COMPARISON_V1.md` binds the embedded stream to 230 sprite frames and rejects treating the shorter same-stem SA file as an equivalent recording; a generated pure block/sample projection is queryable. `audit/ASR_SOURCE_LANGUAGE_V1.md` adds local machine evidence that the complete embedded recording is likely English and the SA is likely its Spanish teaching counterpart. Neither language nor host selection is accepted without listening and natural-runtime evidence. `audit/KEYTERM_SOURCE_BOUNDARY_V1.md` confirms the L2 glossary source gap and prevents substituting the recovered L1 pair. Separate root and nested-domain EN/ES requirements are declared but all 488 frame slots remain pending. Authorized original-host natural trace, sprite frame map, term responses, and product audio binding remain open.

- SWF signature/version:
- Stage width and height:
- Frame rate, frame count, duration:
- Background/transparency:
- ActionScript generation and scripts:
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings:
- Audio/video:
- Audio cue IDs, language tracks, hashes, durations, and start frames (`audio-inventory.csv`): one source-structural `und` embedded stream; no accepted EN/ES track
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

Lane: bounded `behavior-heavy` advanced-manual behavior-first work. The L1 TS03 factory is not authorized for this L2 source (`catalog/g678-ts03-family-audit-v1.json` records `generationAuthorized: false`), and the term definitions, legacy host response, resume path, and audio clock are unresolved. A source-static layered SVG candidate covers the 234 teaching frames, while a separate React/HTML candidate presents source-timed teaching text responsively. Their final composition and the real My Lesson host integration remain undecided; neither is a registered product renderer.

- Candidate renderer: React/HTML for semantic teaching text plus source SVG for auditable decorative geometry; no final renderer selected.
- Why it fits this animation: the teaching content is short text and a four-cell plan, while source fades and term flashes are queryable from the display-list IR.
- Rejected alternatives and tradeoffs: flattening the page to a screenshot would lose accessible text and future term controls; reusing the L1 factory would bypass P056-specific audio and host dependencies. Source SVG alone keeps outlined glyphs but is not modern typography.
- Accessibility and localization approach: the English source text is live HTML with responsive reflow; the ES calibration view explicitly remains English source fallback. Machine Spanish narration is only an unaccepted copy lead.

## Timeline Specification

Summarize object phases, one-indexed frame windows, transforms, alpha, depth, text/count changes, audio cues, and interaction transitions. Keep the full frame list in `keyframes.csv`.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

`audit/STATIC_ART_SOURCE_V1.md` binds a private FFDec 26.2.1 export to the
source SWF: 6 shape SVGs, 13 text SVGs, 2 button SVGs, and 1 font TTF. All 22
are individually hashed in `asset-inventory.csv`, along with the generated
symbol bundle; `audit.assetsRequired` is
true. Selected sprite-frame SVGs were rendered with Quick Look for forensic
visual checks only. The exports are not packaged for the product. Arial font
ID 10 was not exported, text ID 11 has no visible glyphs, and font/product-use
clearance remains open. Source glyph placement, host presentation, responsive
behavior, and authoritative runtime comparison are still required.

## Implementation Map

The maintained source-action lookup is `packages/demos/src/timelines/shared-nms002-l02-p056-source-behavior.ts`, with a focused test beside it. It binds the two exact AVM1 keys to source character IDs and refuses to expose their placement before sprite frame 9. `audit/BUTTON_REVEAL_SOURCE_V1.md` additionally binds their sprite-local transforms, alpha fade from frames 9–17, and exact `hitTest` rectangles, with placement persisting through frame 234. `audit/DISPLAY_LIST_SOURCE_V1.md` and the reproducible generated IR cover all 234 direct sprite-24 display-list frames, projected by `packages/demos/src/timelines/shared-nms002-l02-p056-display-list.ts`. `audit/STATIC_SVG_CANDIDATE_V1.md` binds a reusable source symbol atlas and a pure per-frame SVG projector to that IR; generated SVG definitions are isolated by a required instance ID. A second generated IR and `packages/demos/src/timelines/shared-nms002-l02-p056-audio-blocks.ts` query source MP3 block counts without claiming playback synchronization. `scripts/extract-nms-l02-p056-source-stream-v1.mjs` now reproducibly extracts the complete original embedded MP3 payload to a private audit file with exclusive creation. The separate semantic React view and loopback calibration route are documented in `audit/SEMANTIC_CANDIDATE_V1.md`. The visual projector draws source-static child symbols and glyphs, but does not resolve dynamic text 11, prove original-host click reachability, supply bilingual definitions, call the modern host, synchronize audio, or establish Replay semantics. No module registration or My Lesson admission exists yet.

- Next.js route: local-only calibration `/[locale]/migration-status/g678-calibration/shared-nms002-l02-p056?frame=1..234`; not a My Lesson route
- React component: `packages/demos/src/nms-l02-p056-semantic-view-v1.tsx`; no glossary resolver supplied by calibration route
- Pure timeline module: `packages/demos/src/timelines/shared-nms002-l02-p056-display-list.ts` plus source behavior and audio-block projections; no complete product state/Replay reducer yet
- Unit test file: `packages/demos/src/timelines/shared-nms002-l02-p056-semantic.test.tsx` and focused source/asset/audio tests
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

No renderer or registry admission was attempted. Do not generate P056 from P055 or L1 TS02 without P056-specific visual/audio and host-glossary calibration. The absent lesson-2 term XML, lack of demonstrated SA/embedded-stream equivalence, unresolved spoken-language/product audio binding, and missing natural host trace are active blockers. All original-runtime, fidelity, audio, human/Owner, strict, release, and publication gates remain open.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
