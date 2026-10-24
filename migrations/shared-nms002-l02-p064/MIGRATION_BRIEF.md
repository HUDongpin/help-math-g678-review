# shared-nms002-l02-p064 Migration Brief

Created: 2026-09-23

## Objective

Continue the G6–G8 page-only migration with the NMS002 L2 final-quiz page.
The verified source facts and unresolved host/audio/privacy boundaries are in
[SOURCE_QUIZ_V1.md](audit/SOURCE_QUIZ_V1.md). This is an unregistered,
behavior-first local renderer candidate; no Current-JS admission or acceptance
is claimed.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`): `swf-f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`.
- Placement `animationId`: `shared-nms002-l02-p064`.
- Collection, grade, lesson, section, and page: course; G6–G8 shared; NMS002 L2; FQ page 2; global ordinal 64.
- Raw title and reviewed display title: `Page 1` / unresolved; ES catalog fallback is not verified translation.
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence:
- Alias or variant relationship:

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`
- Source owner/provenance: Owner-provided real AWS grade-classified tree, read-only.
- SHA-256 values: SWF `f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`.
- Missing source files: same-path FLA absent.
- Evidence conflicts and resolution: none for identity; behavior and host dependencies remain open.

## Runtime Audit

- SWF signature/version: CWS v7.
- Stage width and height: 800×600.
- Frame rate, frame count, duration: 12 fps, root 10 frames; main sprite 90 frames. Root 10-frame duration is not quiz duration.
- Background/transparency: `#b8d8f7`; alpha/effects not audited.
- ActionScript generation and scripts: AVM1; 159 FFDec-exported scripts, source contract v1; AS1/AS2 distinction unresolved.
- Symbols, masks, morphs, filters, blend modes: 35 Q and 35 R frame labels and their text/graphic symbol placements are recorded in `audit/question-content-ir-v1.json`. `audit/active-display-list-v1.json` resolves inherited main-sprite placements and move-only updates for all question/review frames. Visual roles, nested sprite state, and all effects are not yet reviewed.
- Embedded fonts and exact strings: the independent SWF text parser finds 649
  definitions (158 static and 491 dynamic), 197/197 decoded static text runs,
  and zero unparsed tags. `audit/source-text-reconciliation-v1.json` binds all
  35 rendered prompts, 124 text choices, and 16 picture-choice source graphics
  to character/tag hashes. Q7/Q20/Q21 combine separately placed source fraction
  text; Q9 repairs a source word boundary and Q26 normalizes whitespace. Ten Q
  frames have no new unlabelled direct prompt but inherit an earlier one.
  Dynamic runtime values, button state/actions, shape text, and ActionScript
  visibility remain explicitly unresolved; static text binding is not semantic
  or bilingual acceptance.
- Audio/video: host EN/SP button branches call both question- and answer-audio APIs; a source audio-control sprite gates one question and four answer buttons through external host flags. FQ/EA and FQ/SA each have 175 source MP3s (35 question + 140 option), hash-bound only as candidates; no embedded sound tags observed. `audit/host-audio-lifecycle-v1.json` binds these static findings and the separate report/review-exit order.
- Audio cue IDs, language tracks, hashes, durations, and start frames (`audio-inventory.csv`): `audit/audio-source-candidates-v1.json` records 350 candidate hashes. All 70 question and 280 option files are byte-verified and locally reachable through separate guarded routes. The subsequently located, hash-bound `indexMI.swf` host source statically maps P064 frames 2–36 to Q1–Q35 and controls 1–4 to A–D in EA/SA; see `audit/SOURCE_HOST_AUDIO_V2.md` and `audit/host-audio-static-mapping-v1.json`. The local-only quiz candidate now exposes all ten question/option file controls per question with single-playback, collapse, answer and Replay cleanup. This does not establish that the same host bytes were deployed, that its flags enabled a control, or that the correct spoken cue played. Cue schedule, spoken language, original-host reachability, and listening remain unresolved. The accepted cue inventory is still empty.
- FlashVars, URLs, external assets, and legacy APIs: report, bookmark/close, and `getURL` legacy paths are excluded from execution; do not infer modern completion.
- Stops, labels, buttons, Replay, and user interactions: ten no-replacement draws from 35 questions, four options each, four grade bands, review of selected questions; Replay and host terminal unresolved.
- Audit tools and exact versions: FFDec 26.2.1; swfmill 0.3.6; source contract generator/check.
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

- Selected local-candidate renderer: maintained React state and native SVG/MathML,
  with 28 FFDec-exported source-vector assets embedded as data URIs. This is not
  an admitted My Lesson renderer.
- Why it fits this animation: source-confirmed no-replacement ten-question draw,
  keyboard-native options, and source figures can be represented without a
  frame-by-frame Flash player or executing legacy reporting APIs.
- Rejected alternatives and tradeoffs: no bulk factory generation while
  `NO-GO-scale-out` remains; no hand-edited generated output. Number-line
  positions are maintained semantic redraws, not original-runtime pixel parity.
- Accessibility and localization approach: native buttons, focus return on
  state transitions, MathML fractions, labelled figures, responsive layout.
  Source question copy remains English on the ES candidate route, with an
  explicit untranslated/audio-pending notice. Alt descriptions are candidate
  visual interpretations and require named-human review.

## Timeline Specification

Summarize object phases, one-indexed frame windows, transforms, alpha, depth, text/count changes, audio cues, and interaction transitions. Keep the full frame list in `keyframes.csv`.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

`asset-inventory.csv` binds 12 source figure shapes and 16 source picture-option
sprites to original FFDec SVG hashes and the embedded generated payload. Nine
number-line question instances use maintained SVG semantic redraws tied to
their source shape IDs and static source display evidence; they are not source
SVG exports. No source audio is embedded in the candidate bundle. EA/SA question
and option MP3 candidates are read only from the exact real source tree through
guarded local preview routes. The student-facing candidate currently presents
only current-question controls; option files are not yet wired to its UI.

## Implementation Map

- Next.js route: local-only EN/ES
  `apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx`;
  explicit source-root and loopback-preview guards, `noindex`, no product route.
  Webpack/Turbopack map its P064 module import to an inert production stub;
  Webpack additionally replaces the resolved source path in production because
  the TS path mapping bypassed the alias alone. A local production build scan
  now proves absence of checked P064 question/vector payload markers, though
  the route's separate CSS import remains in the static style output.
- React component: `packages/demos/src/nms-l02-p064-quiz-candidate.tsx` and CSS;
  source-locked generated data from
  `scripts/build-nms-l02-p064-presentation-data-v1.mjs`.
- Local question-audio route:
  `apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]/route.ts`;
  EA/SA Q1–Q35 question candidates. A separate
  `option-audio/[folder]/[question]/[option]/route.ts` serves the 280 EA/SA
  Q1–Q35 A–D source-file candidates. A separate two-SWF static host audit now
  derives the conditional mapping. The local-only student-facing candidate
  connects these guarded files as explicitly unaccepted source-media previews;
  this does not enroll the route in My Lesson or establish original-host
  reachability/listening.
  The access policy requires the real
  source root, loopback development, exact same-origin P064 referer and media
  Fetch Metadata; the source reader rechecks the index, SWF, and MP3 hashes.
  Production replaces the reader with a denying stub and the route returns 404.
- Source-text audit: `scripts/audit-nms-l02-p064-typography-v1.mts` re-parses
  the real SWF into `audit/source-text-reconciliation-v1.json` with exact
  source/catalog/presentation hashes. This is a structural prerequisite, not
  the G6–G8 typography binding or host check record.
- Pure timeline module: unregistered `packages/demos/src/nms-l02-p064-quiz-state-candidate.ts` (state only).
- Unit test files: `packages/demos/tests/nms-l02-p064-quiz-state-candidate.test.ts`
  and `packages/demos/tests/nms-l02-p064-presentation-candidate-v1.test.tsx`.
- Ruffle reference route:
- Standalone package:
- Deterministic `?frameDomain=`, `?requirementId=`, `?trace=`, `?entryStateSha256=`, `?frame=`, `?scenario=`, `?lang=`, and `?seed=` capture modes:
- Mandatory matching `data-flash-*` identity attributes:

## Verification Evidence

- Unit tests: 14 focused content, state, presentation, vector-inventory,
  source-text, and audio-candidate tests pass. The generated presentation and
  source-text audit pass exact `--check` modes and focused TypeScript checks.
  Three module-boundary tests confirm opted-in dev source, production aliases,
  the resolved-path replacement, and an isolated local build directory.
- Production build: isolated local Webpack build `PNzalvRe8HyMz1w6GLI8H`
  passed after adding scratch-directory dependency resolution. The first
  successful output had exposed P064 question data despite passing alias
  configuration tests; the resolved-path replacement corrected it. The final
  `audit/production-bundle-isolation-v1.json` scans all 2,013 server/static
  files (35,994,253 bytes), finds no four checked payload markers, and passes
  exact `--check`. EN/ES production-mode P064 requests returned 404. This is
  local build evidence, not provider or production deployment acceptance.
- Native-size keyframe captures:
- Complete authoritative original-runtime and current-JS capture manifests:
- Full-frame coverage manifest, comparisons, and archive:
- Per-frame metrics files and checksums:
- RMSE and diff-image results:
- Replay and keyboard checks: browser pointer-based ten-question flow, grade,
  review, and Replay reached both before and after the dev/production alias
  change; post-alias seeded run scored 2/10, reviewed Q9, then returned to
  Q9 at Replay. Native button/MathML semantics inspected. The candidate's
  focus behavior was corrected from repeating the overall title to announcing
  each new question, result, review ordinal, and unresolved terminal status.
  A Chromium keyboard-only path traversed all ten seeded answers, result,
  ten review steps, terminal status, and Replay with Enter/Space; this is local
  candidate accessibility evidence, not full product or original-host QA.
- Desktop/mobile overflow checks: 1280px EN and 390px ES/Q9 plus 390px EN/Q30
  visually inspected in local Chromium before the alias change. Post-alias
  ES-host Q9 was visually inspected at 390px and 320px; document width equals
  viewport width at both sizes and source picture images load. Initial Q30
  number-line endpoint clipping was fixed and rechecked before the alias
  change. This does not establish full responsive or bilingual acceptance.
- Console and network checks: no Chromium warning/error messages on checked
  candidate route; source figure and picture-option images loaded. Loopback
  request succeeds while non-loopback Host and extra query parameter return 404.
- Local question-audio checks: focused tests verify all 70 EA/SA question-file
  and 280 option-file candidates against source hashes and cover range 206,
  invalid-range 416, and denial cases. Chromium loaded and played both Q9 EA
  and SA candidates; starting one paused the other. Answer transition and
  Replay paused and unmounted the previous audio, and 320px controls did not
  overflow. This is machine playback evidence, not spoken-language/listening
  acceptance or original Flash cue timing.
- Local option-audio candidate checks: 35 SSR question views expose exactly
  two question and eight A–D option source URLs each. Browser Q9 EA option
  playback and SA question playback were mutually exclusive; folding the
  option section paused its audio, and answering or Replay paused and
  unmounted the old player. At 320px the ES page had no horizontal overflow;
  simulated 200% root text found 2px overflow only in the shared mobile
  navigation, not P064 audio controls. These are candidate browser checks,
  not original-runtime timing or named-human listening.
- Historical pre-host-score P064 typography preparation: the actual SWF text catalog, 35 prompts and
  140 options are bound in
  `catalog/typography-v1/g678-page-bindings/shared-nms002-l02-p064.prepared-v2.json`
  with 175 blocks and 39 current implementation/shared file hashes. The
  preparation check records 11/11 focused tests and focused TypeScript pass,
  while the semantic, responsive, accessibility, performance and real-host
  technical matrix remains `not-run`; it does not pass the typography gate.
  This v2 binding no longer describes the current host-score candidate.
- Post-audio production isolation: a first new production build failed the
  payload scan because the source-audio reader entered a server chunk. The
  production module replacement corrected it. That stage's isolated build ID is
  `mENfMn_vrZ4XR3ZHLd_gP`; `audit/production-bundle-isolation-audio-v1.json`
  scans 2,018 server/static files with no checked P064 markers. In local
  production mode, EN/ES P064 pages and EA/SA Q9 audio routes all returned
  404 even with local-preview/source-root environment settings. This is not
  provider deployment evidence.
- Post-option-audio production isolation: the next fresh Webpack build ID
  `-rOmsKBGYdrtA76banL8X` compiled and typechecked. The versioned
  `audit/production-bundle-isolation-option-audio-v1.json` rechecked 2,022
  server/static files with no specified P064 payload marker. The production
  route manifest contains both guarded audio routes, but local `next start`
  returned 404 for the EN/ES page, question EA, and option EA/SA URLs even
  with preview/source-root env supplied. No provider deployment occurred.
- Post-player production isolation: the isolated Webpack build ID
  `ZqJwRZqhbbEg-4MLtkQEW` completed after an initial default-heap TypeScript
  OOM and an external-scratch `sharp` module-resolution failure. That build
  used an 8GB Node heap and a scratch-only `node_modules` link; no app
  dependency changed. `audit/production-bundle-isolation-option-player-v1.json`
  checked 2,022 server/static files (36,095,883 bytes), with zero specified
  P064 marker hits. Local production returned 404 for both candidate pages,
  EA question, EA option and SA option requests. This is not remote deployment
  or product admission. This v1 scan is historical after the answer-language
  correction below, not the current-candidate production check.
- Post-answer-language production isolation: English answer buttons in the ES
  candidate now explicitly carry `lang="en"`; the 35-question SSR matrix checks
  this attribute. The new typography preparation/check records are
  `shared-nms002-l02-p064.prepared-v2.json` (binding SHA-256
  `f163c45ed10a3c025e650a892394c632ce8f845c55b198556293a9fd7ce3bf92`)
  and its v2 check (SHA-256
  `eac63abad99737964abe144f94674f77f77a3a8d59616d0b27dd579d33ab8dc3`).
  A fresh isolated Webpack build, ID `8MBJ_x8HOB71IRXTb6QKK`, passed
  TypeScript and generated 216 static pages. Its exclusive
  `audit/production-bundle-isolation-option-lang-v2.json` scan was independently
  rechecked: 2,022 server/static files, 36,095,867 bytes, zero specified P064
  marker hits; the P064 media-index SHA was also absent. The temporary local
  production server returned 404 for EN/ES P064 pages, EA question, EA option
  and SA option routes and was stopped. This establishes a bounded local
  negative check, not remote production or Current-JS acceptance.
- Audit-only privacy-safe host scoring candidate: the guarded local P064 route
  now wraps the existing quiz with a memory-only `fq-scoring` lesson-host
  capability. It resets on mount and Replay, sends only the selected source
  question ID and bounded correct/point aggregate per answer, and refuses to
  advance if the host acknowledgment does not exactly match all responses.
  No raw selected option, student/class identifier, legacy report URL, or
  persistent result is sent. Focused candidate tests passed 13/13; an EN
  browser session reached the tenth-answer result with score gate `ready`,
  then Replay returned to 1/10 and reset the gate. An actively playing EA
  question audio element paused and disconnected on EN→ES navigation; the ES
  candidate reset to `ready`. These checks are not registered My Lesson,
  source review-anomaly resolution, course-progress acceptance, or release.
  The current source-bound typography preparation is
  `catalog/typography-v1/g678-page-bindings/shared-nms002-l02-p064.prepared-v4.json`
  with its separate `g678-checks` v4 record; both remain preparation-only.
- Post-host-score production isolation: fresh build `1MbbDsIm342512mkiqpih`
  passed TypeScript and generated 216 static pages. The exclusive
  `audit/production-bundle-isolation-host-score-v1.json` report rechecked
  2,022 server/static files (36,095,305 bytes) with no specified P064 marker
  hits. Additional P064 media-index and host-score string searches were empty.
  The temporary local production server returned 404 for EN/ES candidate
  pages and three question/option audio probes. This is bounded local evidence,
  not remote deployment or admission. See `audit/HANDOFF_HOST_SCORE_2026-09-24.md`.
- Human reviewer and review date for all keyframe/full-frame diffs:
- Audio listening-acceptance record, or source-bound not-required evidence:
- Immutable human and owner record descriptors:

## Exceptions And Decisions

Original-runtime natural trace, semantic and bilingual acceptance of the quiz,
original-host audio reachability/timing/language/listening, privacy-safe report/progress
adapter, modern My Lesson host flow, keyboard-only QA, fidelity, human and
Owner review, strict completion, release, and publication are still unresolved.
The seeded candidate draw is deterministic for testing but is not claimed to
match Flash RNG. Q10 D, Q21 C, and Q23 C have static source-derived review-name
lookup misses; do not assume their original-runtime behavior or silently
normalize them. No legacy report URL is authorized to run. No factory scale-out
from this page is authorized.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
