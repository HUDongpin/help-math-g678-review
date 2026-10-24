# shared-nms002-l02-p052 Migration Brief

Created: 2026-09-23

## Objective

Continue the complete G6–G8 migration with the exact NMS002 L2 Question 10 placement: shade 75% of a 100-square grid using a slider. EN/ES modern My Lesson support remains required. This workspace contains source-audited pure engineering modules, but no rendered or registered page yet.

The populated, source-bound intake specification is [audit/SOURCE_SPEC_V1.md](audit/SOURCE_SPEC_V1.md). It records exact identity, main/root frame domains, drag and two-attempt behavior, six embedded audio streams, unresolved source discrepancies, renderer routing and the next evidence gates. The sections below remain the implementation/acceptance worksheet; blank entries are pending, not passed.

The current supplement is [audit/SOURCE_SPEC_V2.md](audit/SOURCE_SPEC_V2.md): complete static main display list, authored001→016→000 intro, button-click reachability, full PCM decode, inventories and the frame102 main-audio sample-count discrepancy. The main audio clock is unresolved; this is not a renderer or synchronization acceptance.

[audit/NATIVE_AUDIO_DECISION_V1.md](audit/NATIVE_AUDIO_DECISION_V1.md) now specifies a tested native engineering candidate that preserves every post-latency decoded sample and exposes the known count/clock difference. It does not retroactively pass the count-equality audit or establish original-runtime synchronization. Cue windows and browser integration are still pending.

Cue windows are now specified and unit-tested in [audit/NATIVE_AUDIO_WINDOWS_V1.md](audit/NATIVE_AUDIO_WINDOWS_V1.md): ten windows, exact main pause seam, four seeded wrong-feedback branches and source click cues. This supersedes only the statement that window definition is pending; browser/session integration remains pending.

The source-bound [native behavior contract](audit/NATIVE_BEHAVIOR_CONTRACT_V1.md) now has a pure, unregistered TypeScript state kernel at `packages/demos/src/nms-l02-p052-state-v1.ts`. It covers attempts, feedback, help/glossary ownership and Replay epochs. It is not a rendered page; view specification, scene assets, capture contracts and browser integration are still required.

[Bilingual exercise semantics](audit/SEMANTIC_LAYER_V1.md) now provide source-bound English copy, authored Spanish page translations, exact source EN/ES Square/Column glossary definitions and a100-cell row-major exercise projection. These are tested candidate inputs, not rendered language/layout or human acceptance.

[Source intro scene](audit/INTRO_SCENE_V1.md) now binds all114 authored introframes,66 exact state ranges and37 sourcevectors, including nested track165. The queryable scene is tested but is not a rendered page; capture contracts and view/controller integration remain pending.

## Identity And Classification

- Immutable assetId: `swf-5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
- Placement: `shared-nms002-l02-p052`; course, G6–G8 shared, NMS002 L2, TI, ordinal52.
- Source title: Fractions, Decimals, and Percent Concepts: Try It! Display: Question10: Shade75%.
- Knowledge point: Shade75% of a100-square grid / Colorear el75por ciento de una cuadrícula de100cuadrados.
- Domain: fractions-decimals-percent. Classification confirmed by source/catalog identity, not human acceptance.
- No alias/variant claimed; see `audit/source-identity-v1.json`.

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TI/L2TI11.swf`
- Owner-provided preserved source;106791bytes; SHA256 as assetId above.
- Same-path FLA absent. Other-path FLA absence is not established.
- Reveal-thumb, grid-order, host globals and frame102 audio-count conflicts are documented in SOURCE_SPEC_V1/V2 and the native behavior/audio decisions below. No source bytes changed.

## Runtime Audit

- CWSv6;800x600;12fps; root10frames (833.333ms nominal), main156frames (13000ms nominal excluding interactive holds).
- Source background RGB184/216/247 (`#b8d8f7`), read from SetBackgroundColorTag in hash-bound XML. Modern semantic layout may use shared typography surfaces; source background remains evidence.
- AVM1 actions; AS1 versus AS2 authoring generation is not distinguishable from these shipped tags alone. Exact AS/p-code membership: `audit/ffdec-export-v1.json`.
-84timelines,96shapes,9buttons,0bitmaps. No morph/video definitions in XML; no placement mask/filter/blend flags in the parsed timeline events. Dynamic script effects are not disproved by those counts.
- Embedded Bauhaus Md BT:characters3/143; Arial:106/110.158textdefinitions and64decoded text runs in source catalog. Modern teaching copy must use live text and pinned shared fonts, not those glyph paths.
- Six whole MP3/PCM streams at22050Hz mono. Ten native windows in `audit/native-audio-windows-v1.json`:intro,outro,correct,four wrong branches,three clicks. Hashes/durations in audio-inventory and PCM audit; audible language and listening acceptance remain unverified. Do not claim Spanish narration.
- Legacy preloader/global quiz state and glossary calls are documented dependencies, not native network actions. Native globals become page-local; glossary uses the preserved EN/ES XML definitions.
- Source stops/buttons/labels: SOURCE_SPEC_V1, source-domain-roles-v1 and DOMAIN_ROLES_AND_FEEDBACK_V1. Rootpreloader1→entry6 is host-dependent, not an observed sequential trace.
- FFDec26.2.1 exports, maintained source parser, pinned decoder receipt. Structural facts verified; natural runtime/synchronization/visual appearance unverified.

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

- Selected: maintained React + SVG graphics and semantic HTML teaching text/controls, using compiler-extracted intro geometry and the tested native reducer.100dynamic cells and moderate source vector counts do not require a raster scene engine.
- Reject flattened video (required slider/feedback/glossary interaction), unmodified factory output (uninterpreted source actions), and generic substitute exercise (would lose authored intro/branches).
- Use shared lesson-text interfaces/fonts, source-bound blocks and responsive templates. Primary grid stays row-major; help explains column counting as an alternative. EN source/adapted copy and authored ES translation come from the copy module; glossary definitions are exact source EN/ES.
- Native range input0–100 with keyboard/touch, real buttons, focus-managed dialogs and nested glossary ownership. Return focus on close. Reduced motion skips decorative progression only through an explicit readable-state/controller policy; never reveal75 automatically or bypass unanswered practice.

## Timeline Specification

Main1–114: exact compiled scene, promptfade2–7, digits001→016 at32–47,
hold through61, descend to000 by77. Do not substitute a75% demonstration.
Main115: source hold; slider updates0–100cells/digits, Done chooses correct75
or firstwrong retry/secondwrong reveal. Reset retains attempts. Feedback child
clocks are separate; right35→1 does not close. Help/glossary retain answer state.
Right Close enters116–156; explicit visual/audio completion holds terminal156.
Replay resets answer, attempts, random ordinal, dialogs, clocks/audio and epoch.

The20 native scenarios and four wrong-branch seeds are executable in the capture
state module.160partial coverage rows have canonical entry/selection hashes and
no strict effect. Natural source trace execution and full-domain strict rows
remain pending, not fabricated from the native state. See coverage integration.

## Asset Strategy

The109-row asset inventory retains96sourceSVGs,6MP3,6PCM and sourceSWF.
Intro uses37selected vectors and66ranges covering114frames. Matrix translations
are twips; SVG geometry is pixels; divide translation by20 once and preserve
SVG origin normalization. Isolate gradient IDs per SVG instance. Text remains
live HTML/SVG, never duplicate source glyph text beneath modern text.
Native practice draws100editable semantic grid cells; solved cells persist in
outro. Thirteen audio-associated shape/label paths lie offstage; retain source
and audio identity without drawing those markers inside the teaching stage.

## Implementation Map

The controlled page composition now exists at
`packages/demos/src/nms-l02-p052-page-view-v1.tsx`. Its CSS entry imports intro
and practice styles. Root6/main-domain identity is explicit. Intro1–114 uses
the source intro view; intro115 holds the exercise visual with disabled controls
until intro-ready, without forging a practice state. Exercise/feedback uses the
same controlled view. Outro116–156 retains solved grid/digits and removes active
controls; reaching156 alone does not complete. Contradictory phase/frame pairs
are rejected. This is not yet the real controller, host renderer, complete
capture identity, route or typography binding. Browser/build/audio QA pending.

The introductory live-text composition is now implemented in
`packages/demos/src/nms-l02-p052-intro-view-v1.tsx` plus CSS. It combines the
source graphics with live HTML question/prompt, individual source-positioned
digits and demonstration labels, and a spoken summary. All114frames in EN/ES
retain source text alpha; prompt fields157/159 must agree or the projection
rejects the scene. Controls are demonstration labels, not active buttons.
The native diagram may scroll locally below32rem instead of shrinking text.
Four tests and targeted strictTS passed; CSS still needs page-entry import and
actual browser verification. This supersedes the prior graphics-only text-layer
pending statement, not controller/audio/host or typography acceptance gaps.

The source intro graphics plane now exists at
`packages/demos/src/nms-l02-p052-intro-graphics-v1.tsx`. It uses all37 selected
source SVGs and114 source frame states, with twip translation divided by20
once and source SVG origin compensation. Separate SVG image documents isolate
gradient IDs. This is an aria-hidden graphics layer, not complete introductory
teaching content: live text/counters, source visibility bindings, controller,
browser visual QA and host integration remain required. Four new static-render
tests and targeted strict TypeScript passed; no build/browser claim.

Controlled practice view now exists at
`packages/demos/src/nms-l02-p052-practice-view-v1.tsx` with adjacent CSS. See
`audit/PRACTICE_VIEW_V1.md`. This is a tested HTML/SVG subview, not the complete
page renderer, source intro/outro wrapper, audio controller or registry module.

- Next.js route/component/registry: not created; integrate through the existing G6–G8 My Lesson native presentation contract after local view/controller tests. Do not invent unsupported G3–G5 callbacks.
- Pure modules under `packages/demos/src/`: `nms-l02-p052-state-v1.ts`, `-copy-v1.ts`, `-intro-scene-v1.ts`, `-capture-state-v1.ts`, `-feedback-clock-v1.ts`; matching tests under packages/demos/tests.
- Audio preparation/windows: scripts/lib/nms-l02-p052-audio-plan-v1.mjs and audio-windows-v1.mjs. Browser playback/session/controller pending.
- Ruffle route not created or required as authority. Standalone package not requested.
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

Native decisions now exist: reveal thumb follows75 instead of source constant45;
row-major practice plus explicit alternative column explanation; page-local
tryCount0; full Replay epochs; terminal hold156; reproducible wrong-cue seed.
These are documented engineering adaptations, not source-parity exceptions
approved by an Owner. Audio preserves every post-latency sample and the stop
seam without fabricating the576sample discrepancy. Intro/outro static source
and cue windows have been audited; actual browser synchronization remains pending.
Same-path FLA absent. No original-runtime, listening, human or Owner acceptance.

## Completion

2026-09-23 coverage integration: `audit/COVERAGE_INTEGRATION_V1.md` records the
160 pending supplemental main-domain requirements now in the conventional
coverage file. Main156 is declared separately from root10. This is candidate
specification coverage, not strict full-domain coverage or captured evidence.

2026-09-23 executable capture-state increment: see
`audit/NATIVE_CAPTURE_STATE_V1.md` and `audit/native-main-capture-plan-v1.json`.
Twenty reducer-replayed native scenarios now support deterministic main-domain
state queries, with bilingual/seed entry identities. This is not a view,
coverage-v2 completion, source natural trace, registration or acceptance.

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
