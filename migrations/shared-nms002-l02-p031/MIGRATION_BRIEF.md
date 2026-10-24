# shared-nms002-l02-p031 Migration Brief

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
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/IN/L2IN16.swf`
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

## P031 source-specific implementation requirements

Source IN/L2IN16.swf is822130bytes, SHA256 c6005df159523c3c266f02f77bfedecda8c4ce87540cbd38ce5e4b381f8047fa.18timelines/605localframes; root10,main242339; stop147/resume148. C0.7 is correct for7/10. Advanced-manual behavior-first lane within compiler-assisted hybrid workflow.

Nine full MP3 streams and one13-block ADPCM stream decoded. ADPCM technical output5967mono samples at5512Hz is not original-PCM or listening acceptance. Qualified Lesson1companion selects4right/3wrong feedback; exact Lesson2host authority remains unverified. Preserve unselected source branches.

Help source contradiction confirmed:23/100 model,2tenths3hundredths text and0.23 equation versus0.03 in the source table. Modern native table must use mathematically correct0.23; retain the source discrepancy and report an explicit pedagogical correction, not pixel parity. Use native clear title for source shape10 within title sprite11.

Source202wrong close is child199button169, resumes helper21; previously unresolved now verified.13bitmaps are feedback decoration without teaching text identified by assistant inspection. No named human review implied.

Pending source glyph-mask schedule, state machine, source terms/native text bindings, actual browser audio and My Lesson tests, frozen registration and every independent downstream acceptance gate.

Source glossary qualification: page KeyAttribute `Hundredth` and XML label `Hundredth` differ from exact XML ScreenkeyTerm `Hundredths`. Six bilingual definitions recovered with one bounded explicit alias; original host lookup remains unverified. Shared parser unchanged. See audit/hundredth-source-key-disposition-v1.json.

Main teaching schedule: question16 is clipped by rectangular mask14. First glyph bound overlap30, all glyphs contained49. All339main frames yield73unique teaching states. Native accessible text must stop before first partial glyph; source glyph fractions stay separate for visual clipping. Explanation digits begin210; chart fades307..311. Nested feedback-mask composition remains separate pending work.

Native figures candidate: seven-tenths model uses semantic10equal strips; exact highlight shapes236/237/238 transformed by inverse source model placement plus local bounds offset. Source chart first307 retained. Help23/100 semantic grid and corrected0.23table checked across40width/scale/language combinations;339main frame queries. Full page, feedback and audio integration pending.

Native question surface implemented with clear shared title, source glyph clipping, seven-tenths model, timed answer opacity and question-phase answer gating.180browser layout/time cases passed plus keyboard answer/help/Replay state transitions. Main-surface harness does not yet implement feedback artwork or help modal; full audio/MyLesson integration remains pending.

Help modal now contains complete source explanation, corrected0.23table,23/100grid and six bilingual source definitions.20browser profile combinations and120term open/Escape-back/focus roundtrips passed after explicitEscape layer fix. Early failed receipts and implementations retained. Full player/audio integration pending.

Nine-domain MP3 PCM plans and eight-selected-domain WebAudio engine implemented. All post-latency samples preserved once and all nine measured streams tested. Real Chromium correct/two-wrong complete sequences passed: source147hold, feedback close/outro,main339terminal, help pause, volume0silence, narration-off clock continuation,Replaycache,AudioContextclose. Engine harness only; full UI/MyLesson integration pending. Source202andADPCM120 remain preserved but unselected under qualified companion.

Feedback source art renderer prepared:95shapes,636deduplicatedposes,13bitmapassets,249frames across9feedbackbranches. Native outline Try Again177 and wrong popup panels151/170/197 excluded from decoration; source fonts/text/buttons never rendered as art. Frame/morph/mask DOM references verified and generator reproduced; native feedback title timing/layout still pending. Source main147placement used to map each branch to source800x600 coordinates.

Feedback native composition:249source-title-only FFDec projected frames measured, keeping masks176and14. Native title follows nonzero pixel presence and maximum alpha; whole readable native title outside art is explicit typography adaptation rather than partial-glyph pixel parity. Seven selected branches196frames and84layout/language/scale cases passed including exact close eligibility, keyboard Close, reduced-motion decoration suppression. Full integrated player/MyLesson pending.

Full player composed: question/help/feedback/source-term host and eight-domain audio. Real Chromium continuous intro147hold, help-definition-close-explicitresume, mainterm-focusresume, two-wrong-outro339,Replay/localeswitch/correctcycle, cache and unmountclose passed. Ten unit tests passed. Standalone harness only; actualMyLesson and frozenregistration pending.

All18source domains605frames now retained in compact query IR; feedback art remains bounded95shapes and byte-identical. Independent local query and actual live-state adapters distinguished;4840frame-context and4840text-snapshot queries passed.17native text blocks bind source title10/question16/choices/feedback/dynamicwrong/help/chart/digits. Module/renderer and rendered text-block coverage pending.

P031AnimationModule and source-local renderer prepared:18domains605frames,19360state/textcontextqueries;605browserframequeries with zero missing visible text-block IDs in default source scenario. HelpBody shared between modal and source inspection;source231content versus232closebutton distinguished.20help profile rechecks passed. Module unregistered; source inventories and actualMyLesson/freeze/typography/production checks pending.
