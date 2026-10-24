# shared-nms002-l02-p047 Migration Brief

Created: 2026-09-20

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
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TI/L2TI06.swf`
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


### Continuation359: exact-source intake

Exact placement47 / Question5 is TI/L2TI06.swf. No same-path FLA is present. A hash-identical read-only working SWF is retained. Structural source has root10 at12fps, main81 with188frames, reveal76 with25frames and coach audio78/80 with20/55frames; root length is not an interaction duration. The page instructs fraction drag-and-drop on a number line. Public-tool XML/script extraction is hash-bound. No native renderer, source behavior acceptance, original-runtime evidence, listening or registration exists yet. Text52 is non-teaching author/contact metadata and requires privacy-safe exclusion from learner output; raw contact values are not repeated here.


### Continuation360: source drag/drop behavior

Main81 stops at140 for four draggable fractions: Scr_1=1/2, Scr_2=1/4, Scr_3=1/8, Scr_4=5/8. Correct suffix-matched targets reveal the fraction and hide its card, then coach78 gates the next action. Wrong drops restore the original position and choose one of four source coach80 segments. Four correct placements lead through76frame2–25 and then main188. Help and five glossary targets are source-bound. Exact hit geometry, introductory3/4 behavior and PCM timing remain pending. Contact metadata52 was verified below the800x600stage at all three recorded transforms; its raw value is excluded from this report.


### Continuation361: number-line geometry

Exported28source SVG shapes with hashes. Shape53 contains nine ticks exactly1434twips apart, forming eight equal intervals. Source target centers correspond within one source pixel to ticks1/2/4/5/6; the four draggable answers map to1/8,1/4,1/2,5/8, while3/4 is the worked example. Direct text40 moves during57–64 and persists thereafter. Transparent target-shape bounds are recorded separately from unproven Flash hit testing. Shape44 is a zero-height underline export, not the number line; the raw source export is preserved. Native touch/keyboard sizing and source audio timing remain pending.


### Continuation362: full source audio extraction

Preserved three original MP3 payload streams for78/80/81 and derived decode-only SWF wrappers. Full MP3 decode yielded34560/96768/340992mono samples at22050Hz, without encoded splitting or forced resampling. Correct/wrong feedback bytes match the prior page streams but automatic callbacks differ. Source scheduling includes1673sample startup latency and an authored empty block. Callback-tail measurement finds non-silent PCM after correct20 and wrong54; main188 has1220remaining silent samples. Native playback-window policy is deliberately still pending; decoded duration alone is not scene timing or listening acceptance.


### Continuation363: native audio-window policy

Measured callback-to-next-label tails independently. S1tail is exactly silent; S2/S3/S4andcorrect feedback have nonzero tails. Native windows retain nonzero tails, while S1ends at its source return coordinate; automatic readiness waits for the selected audio window. Main140/188 uses the declared12fps nearest-sample clock and omits only1220verified silent terminal samples. Source seek counters differ from that clock by up to91samples, explicitly recorded rather than resampled or claimed equivalent to original runtime. The initial boundary test failed because JavaScript Math.round rounds positive half samples upward while the generator uses nearest integer, ties to even. That failed log is retained; the corrected tests explicitly check the existing ties-to-even scheduling contract. Validation results are recorded in the continuation receipt after execution. No event/button sounds occur in the source sound tag inventory; no click sound is added.

### Continuation364: deterministic number-line practice

Implemented four source-bound cards and exact eighth-tick destinations, retaining the worked 3/4 example. All 24 answer orders require four matches, feedback, celebration and continuation. Wrong drops, outside release, help gating, input cancellation and Replay stale-callback rejection are covered. Nine combined state/audio tests pass; strict type checking passes for the new practice module. Seeded branch choice and input cancellation are explicit modern adapters. Native view, playback controller, host integration and independent acceptance remain pending.

### Continuation365: pauseable playback clock

Implemented source-window durations, automatic feedback return, separate 23/12-second celebration and four-second continuation, prepared PCM resume offsets and stale phase-token rejection. No delayed tick carries time into a successor phase. Fifteen combined tests pass. Strict module typecheck passes using the project Bundler resolution; the initial NodeNext invocation was incompatible with project extensionless imports. Actual Web Audio loading/player and browser integration remain pending.

### Continuation366: complete-stream audio input

Added three-domain bounded source loading, input SHA-256 verification, source-rate decode validation and complete prepared PCM scheduling. Five new tests pass, including real source byte/PCM comparison and decode orchestration with a documented test stand-in. Strict typecheck passes for the three modules. Actual local source-route binding, browser decode/playback and controller lifecycle remain pending.

### Continuation367: source audio playback controller

Implemented automatic feedback/celebration/continuation progression, exact-window node playback, pause/modal/Replay cancellation and context cleanup. Seven controller tests and all 27 P047 tests pass; strict module typecheck passes. Tests inject a context and decoder, so real browser decode, playback, source-route binding and host polling remain pending.

### Continuation368: source audio request admission

Implemented exact local-only audio access policy and verified 576 valid domain/page/language combinations plus negative requests. Both tests pass. The endpoint remains uncreated: the existing route contract requires a frozen candidate packet and actual registration bindings, which P047 does not yet have. Native view/source-role completion precedes packet freeze and route activation. No runtime route or browser playback claim follows from access tests.

### Continuation369: source text and direct intro trace

Dispositioned all 26 source text definitions and generated 23 native text definitions without contact metadata or audio-clip labels. Traced 140 main frames of direct text placements, matrices, alpha and placement hashes. Preserved the initial duplicated 1/8 and frame57 replacement by 5/8, plus exact term-highlight intervals. Generator reproducibility and two tests pass. Nested visibility, geometric visual roles and native intro/view implementation remain pending.

### Continuation370: native intro state

Generated 49 contiguous source-state ranges covering all 140 intro/practice-entry frames. Direct teaching text and relevant geometry retain source matrices and alpha. Tests verify frame54 line replacement, frame57–64 worked-fraction movement, persistence at practice and pointer removal at118. Two tests and generator reproducibility pass. Responsive rendering, complete geometric role review and nested clip visibility are pending; no original runtime equivalence is claimed.

### Continuation371: native number-line interaction component

Implemented source fractions, worked3/4 and equal tick positions with pointer and select-then-target keyboard/click inputs. A–G mark labels and wrapped44px target buttons are documented accessibility adapters. Two coordinate/static-markup tests and strict typecheck pass. Browser events, focus continuity, layout and full view integration remain pending.

### Continuation372: practice wrapper and help

Added source-bound English teaching copy and maintained Spanish translation, practice wrapper, automatic-feedback status, help dialog and native7/8 help number line. Added dialog/feedback focus handling, complete placed-fraction accessible line descriptions and guarded pointer cancellation. Four related static/input tests and strict typecheck pass. Actual dialog, focus restoration, diagram role completeness and glossary remain pending browser/source review.

### Continuation373: intro view and player

Implemented native responsive intro fractions/number line/pointer/term cues, with source frame order and a reduced-motion option. Integrated intro/practice/CSS with audio controller and RAF updates including silent celebration. Two intro-render tests pass; strict player typecheck passes after correcting the CSS ambient declaration (initial failed log retained). Actual browser transport, rendering, focus and interaction remain pending; rem-based geometry is a documented native adaptation.

### Continuation374: real browser audio and interaction fixture

Isolated loopback fixture exercised actual OfflineAudioContext decode and Web Audio nodes for all three source streams. Intro reached practice, wrong feedback returned automatically, help Escape restored trigger focus, four matches reached frame188 with one completion callback, Replay restarted intro, mouse drag matched1/2 and unmount closed the sole AudioContext. Volume was zero: this is engineering playback evidence, not listening acceptance. Initial drag automation failed on an unquoted numeric CSS selector; preserved and corrected in v2. Real My Lesson route, responsive visual review and remaining source/glossary roles are pending.

### Continuation375: enlarged-text filled-state repair

Real browser320px/32px-root initial practice had no horizontal overflow, but filled fractions overlapped. Preserved and visually inspected failed screenshot. Added alternating native fraction-label rows below480px. Reviewed repaired screenshot and eight filled-state combinations (widths320/390/768/1280 with16/32px root): zero label intersections and no horizontal overflow. Keyboard Space/Tab/Enter flow reached the expected MarkD and completed matching before a screenshot selector ambiguity; its failed log is retained and a clean standalone keyboard receipt remains pending. Help/intro/full host matrices remain pending.

### Continuation376: keyboard/help evidence and glossary intake

Clean browser keyboard receipt: Space selects1/2, seven Tabs reach MarkD, Enter matches, feedback returns focus to Select1/4. Help heading/return focus and320px/32px scrollable dialog top/bottom were verified and screenshots reviewed; no horizontal overflow, close reachable. Extracted five exact-hash EN/ES recovered glossary definitions with reproducibility checks. Whole has a documented semantic defect; original entry is preserved and not yet rendered. Maintained presentation correction and glossary integration remain pending.

### Continuation377: five glossary links and explicit Whole correction

Connected source-role links in main instructions and help definition to bilingual glossary dialogs, with pause notifications and trigger focus restoration. Original recovered Whole definition remains intact; maintained presentation explicitly corrects it to a complete unit/group before division. Thirty-nine P047 tests and strict player typecheck pass. Actual nested-dialog behavior, paused narration and post-change responsive checks remain pending.

### Continuation378: browser glossary verification

Rebuilt fixture with glossary implementation. English intro Position paused at frame10, closed without resuming and restored trigger focus. Nested Whole dialog preserved outer help (2→1→0 dialogs) and restored whole trigger. Spanish five-term flow displayed bound definitions and corrected Whole, with no horizontal page overflow at320px/32px root. Initial EN test sampled transport before React settled; retained failed log and corrected state wait. Position screenshot reviewed. No original host lookup or companion glossary-media acceptance follows.

### Continuation379: shape/label review and missing counting cue

Viewed contact sheet of all28 source SVGs: shape38 is outlined teaching title; remaining shapes are non-text geometry. Source10 is a fraction bar after its nonuniform transform, not a card background; corrected generator and regenerated with prior outputs retained. Source audio labels77/79 lie entirely left of stage (right edges -11.65/-9.65px). Added missing seven counting arrows from help shape24 and source-count regression assertion. Thirty-nine existing tests and two targeted help tests pass. Three separate help7/8 text-pair placements still require reconciliation; full help role closure remains pending.

### Continuation380: three help fractions reconciled

Source glyph advances prove the first7/8 lies in the eight-space gap after Examples (1739twip label advance,872twip gap); second follows locate by36twips; third labels the number line. Native help now retains all three roles and seven counting arrows. Redundant source Examples labels17/22 share one native heading with both identities recorded. Four related tests and strict typecheck pass. Actual768px browser screenshot reviewed:3 fractions,7 arrows, readable placement.

### Continuation381: intro clearance review

Detected fraction collisions at58/59 in392 frame/viewport/font cases. Native clearance arc preserves frame57/64 endpoints and horizontal source motion; repeated392-case fraction-only matrix has zero collisions. Screenshot review found additional pointer occlusion missed by matrix. Moved pointer below worked fraction and added opaque glyph backing; frame59 at320px/32px root visually rechecked and pointer intersection false. Forty tests and strict typecheck passed before the backing-only CSS addition. Original failed evidence retained. This is native legibility adaptation, not original path parity. Dense stationary fraction bars remain visually close and need further separation review; full intro visual closure remains pending.

### Continuation382: stationary intro label separation

Added source-position slot attributes and narrow-screen alternating stationary label rows. Preserves text identities, source frames and worked-fraction destination. Actual392-case matrix across49 states/four widths/two font sizes has zero fraction intersections, offscreen labels or page overflow. Reviewed320px/32px screenshots at56/59/64: stationary bars distinct and moving worked fraction legible. Forty tests and strict player typecheck pass. This verifies the bounded English fixture matrix; real My Lesson and broader source acceptance remain pending.

### Continuation383: language/motion matrix and module frame adapter

Actual784 intro cases across EN/ES, normal/reduced motion,320/390 widths and16/32px root passed fraction intersection/offscreen/page overflow checks. Added deterministic modern module frame queries for root/main/help/correct/wrong/celebration and all-card completion. Source inspection beyond140 explicitly does not invent completed interactions. Three frame-contract tests and strict typecheck pass. Adapter is not yet registered; renderer/text binding and candidate freeze remain next.

### Continuation384: module renderer bridge

Added NmsL2P047Renderer matching AnimationRendererProps, exact source-domain data attributes, deterministic frame adapter, EN/ES titles and static intro/practice composition. Static intro disables glossary triggers. Forty-three P047 tests and strict renderer/player typecheck pass. No module registration or source-text presentation snapshot yet; those contracts and real host integration remain pending.

### Continuation385: semantic text binding declaration

Declared68 native semantic text blocks including outlined title38, five intro fractions, four cards/placed fractions, targets, three help fractions and five glossary title/definition pairs. Binding validation and current source-ID existence tests pass; excludes contact52 and coach77/79. Strict typecheck passes. Source-role association does not imply literal equivalence of accessibility labels/translations; dynamic snapshot values and visibility remain pending.

### Continuation386: dynamic text snapshots

Implemented values and visibility for all68 declared roles, including source intro duplicates, practice cards/placed labels, help3fractions and nested glossary. All376 EN/ES main frame snapshots are ready with no missing/empty-visible blocks; three tests and strict typecheck pass. Snapshot-to-DOM comparison for broader states and module registration remain pending.

### Continuation387: candidate module and timeline

Declared private-current-js candidate module with six exact domains/default scenarios, source audio plans, renderer and68-block text snapshot. Timeline reexports exact frame adapter/source SHA. Forty-seven tests and module typecheck pass. Bundled Node static-render check (CSS intentionally omitted for SSR) passes24 EN/ES domain-boundary cases and validates main playback stop140. No registry modification; candidate freeze/host route still pending.

### Continuation388: host runtime and lesson container

Added exact P047 runtime scope/module gate, host SourceRuntime adapter reporting188 frames/sprite81, and successor lesson container retaining earlier page adapters plus P047. Added scoped host typography rules. Four audio/runtime access tests pass. Host typecheck passes with corrected external config including project Node/CSS declarations; initial configuration failure preserved. No descriptor/page route/freeze/registration yet.

### Continuation389: exact binding reader and base preflight

Added P047 server-only input reader with local resource anchors, pin validation, pre-read size/file/link checks and post-read identity/hash validation. Negative tests pass for drift, symlink, hardlink, traversal, malformed pin and production/provider environment. Strict check passes with explicit Node types; initial missing-type invocation retained. Reverified all359 P046 C4 input/output pins and P04796859-byte source SHA. No candidate freeze or registry change yet.
