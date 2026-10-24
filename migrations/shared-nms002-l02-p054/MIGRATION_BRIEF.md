# shared-nms002-l02-p054 Migration Brief

Created: 2026-09-23

## Objective

Recreate the source-backed two-level Fractions, Decimals, and Percents Match
Game in the modern My Lesson host. P053 is a separate directions/level-choice
placement whose source Start handler targets this page. This workspace is
source and structural evidence plus an isolated local board candidate; no
Current-JS registration or My Lesson admission exists yet.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`): `swf-06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`
- Placement `animationId`: `shared-nms002-l02-p054`
- Collection, grade, lesson, section, and page: G6–G8 shared, NMS002 L2,
  GS, XML occurrence 54
- Raw title and reviewed display title: `Game 2` / pending content review
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence: catalog-bound, source
  structure and mathematical pairs verified; full reachability/appearance
  and acceptance unresolved. See `audit/SOURCE_INTAKE_V1.md`.
- Alias or variant relationship:

## Source Evidence

- FLA: none cataloged for this placement
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS03.swf`
- Source owner/provenance:
- SHA-256 values: SWF `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`;
  lesson-SA candidate MP3 `c29ad5278f052df73d8cdc800b957f2c3645bc3cf2eeeea8858404b2dd41e008`.
- Missing source files: paired FLA absent; required art/audio dependency
  closure remains to be audited.
- Evidence conflicts and resolution: P053 selects this source by a legacy
  host call only from its `SelectLevel` state. Its earlier handler references
  `L7GS03`; do not assume that branch is equivalent or unreachable.

## Runtime Audit

- SWF signature/version: CWS/ZLIB, v6, AVM1 actions
- Stage width and height: 800 × 600
- Frame rate, frame count, duration: 12 fps, ten root frames plus a placed
  five-frame matching-game sprite; root-only duration is not the game runtime.
- Background/transparency:
- ActionScript generation and scripts: FFDec exported 110 AS1/2 records;
  authoring generation unresolved.
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings:
- Audio/video: four sound-stream heads and 266 stream blocks structurally
  present. `audit/AUDIO_STREAM_EXTRACTION_V1.md` binds all four whole MP3
  payloads, per-block metadata, and decoded PCM counts to the exact SWF;
  original-host cue schedule, synchronization, and listening/language status
  remain unresolved.
- Audio cue IDs, language tracks, hashes, durations, and start frames
  (`audio-inventory.csv`): sprites 194/208 have source-static feedback roles;
  sprites 648/729 are placed in distinct result frames. All four encoded
  hashes and machine-decoded durations are recorded, but language is
  undetermined and natural trigger/stop/Replay semantics are unverified.
- FlashVars, URLs, external assets, and legacy APIs: `_global.gameLevel1/2`,
  score and quiz-section state must be replaced with page-local state and an
  explicit modern-host handoff.
- Stops, labels, buttons, Replay, and user interactions: Level 1/2 frames,
  12 cards per level, six matching pairs, correct +10, incorrect −2, and
  feedback clips at their own frame 27/31 are source-verified. All 24 click
  handlers are byte-identical; the three `BtnRepeat` definitions only make
  `Mc_Popup` visible. That popup is source sprite 101 with four English
  instruction text IDs 97–100, including the picture/music reveal and score
  rules; it is not itself a Replay action. Its close button 96 executes
  `this._visible = false`, whose exact runtime target is not resolved. The
  six-pair `nextFrame()` belongs to the correct-feedback child sprite. See
  `audit/interaction-contract-v1.json`. Exact terminal and Replay event
  schedules remain to be audited.
- Audit tools and exact versions: FFDec 26.2.1, swfmill 0.3.6.
- Confidence by audit area:

## Baseline

- Authoritative original runtime, version, host, and toolchain receipt:
- Requirement-level authority (`natural-trace`, `direct-seek`, or `frame-step`):
- Separate Ruffle forensic-reference route, version, and renderer:
  `scripts/forensic-nms-l02-p054-ruffle-v1.mjs` served the exact SWF locally to
  Ruffle 0.4.1 (`wgpu-webgl`); `audit/ruffle-standalone-forensic-v1.json`
  records an 800 × 600 light-blue stage without gameplay. This is not an
  original-runtime baseline. Root frame 1 calls `_level0.InternalPreloader`
  and stops; both root-placed sprites enter at frame 6.
- Source-static host binding: `audit/indexmi-host-binding-v1.json` binds the
  recovered 689006-byte `indexMI.swf` (SHA-256
  `275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`)
  to its named `InternalPreloader`, `jump_check` label, NMS002 course route,
  page loader, and conditional frame observer. This resolves the host-file
  identity but not a natural P054 execution trace or original-runtime authority.
  The same byte-bound static audit confirms root frames 7–10 contain only
  `ShowFrame` tags after the game sprite enters at root frame 6. A host-driven
  root continuation therefore adds no new root display objects or actions;
  it does not establish whether the nested game reaches its result frames.
- Native viewport and device scale factor:
- Capture method, named operator, and containment/capacity preflight:
- Required keyframes and why they matter:
- Complete coverage-v2 frame domains, requirements, traces, and entry-state hashes:
- Static-domain inventory: `audit/frame-domain-disposition.json` lists root,
  65 statically linked sprites, and 63 other defined sprites. No runtime
  reachability or final disposition has been accepted.
- Unregistered behavior candidate:
  `packages/demos/src/nms-l02-p054-matching-state-candidate.ts` models the
  source card identities, +10/−2 scoring without a floor, disabled-card
  feedback interval, and six-pair `quizSection=false` boundary. It deliberately
  stops at `terminal-unresolved`: feedback-sprite `nextFrame()` is not proof
  of game-parent, host, or My Lesson completion. Both levels have pure-state
  tests. The local board candidate now exercises card selection and a separately
  labeled preview reset, plus source-bound picture tiles after a correct pair's
  temporary Continue control. Exact stage geometry, reveal timing, music,
  result, and host behavior remain unimplemented or unaccepted. Its two
  feedback events now trigger source-hash-bound MP3s through a local-only
  route; this does not establish original timing or listening acceptance.
- Known emulator differences:

## Rendering Decision

- Selected renderer: a maintained React/MathML board is an isolated
  advanced-manual engineering candidate, not an accepted renderer.
- Why it fits this animation: source-verified pairs and score transitions can
  be exercised with native buttons, editable mathematical labels, and keyboard
  access while the reachable-domain, art, audio, and trace work continues.
- Rejected alternatives and tradeoffs:
- Accessibility and localization approach:

## Timeline Specification

The source-static controller map in `audit/game-display-list-v1.json` records
all 69 placements, 60 removals, transforms, depths, and layer snapshots for
sprite 731 frames 1–5. Frames 2/4 are the two game states; 3/5 contain
different result sprites. This is not a natural-input schedule or evidence
that the game-to-result transition executes. Record observable teaching beats
and interaction traces in `keyframes.csv` after the runtime path is resolved.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

`asset-inventory.csv` contains 587 source-export rows (519 shapes, 12 images,
five buttons, 51 text records) with source character IDs and exact hashes.
The exports remain on American Dream outside the app. The local candidate now
uses 24 source image-tile SVGs (12 per level) without copying them into the web
bundle. `audit/game-display-list-v1.json` binds game sprite 731 frames 2/4
to the 12 `Mc1–6_Img1/2` instances per level. Each instance's source character
is a one-frame sprite whose sole shape is bound to `audit/art-export-v1.json`
and the exact FFDec SVG bytes. The source-art regression checks the SWF,
swfmill XML, both audit hashes, every placement/order/name/shape and all 24
SVG byte hashes. The local image route rechecks the exact SWF, audit files,
tile hash, real non-symlink roots, loopback/browser/Referer/level guards, and
fails closed outside the opted-in local preview. It is not a production asset
plan; native composition, font/glyph fidelity, reveal fade, music, and product
asset promotion remain unresolved.

## Implementation Map

- Next.js route: local-only, noindex
  `apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p054/page.tsx`;
  it rejects production, non-loopback requests, and unexpected query values.
- React component: `packages/demos/src/nms-l02-p054-board-candidate.tsx`,
  styled by the adjacent CSS. This is an inspectable mathematical board with
  source-bound picture tiles, not native-stage visual parity. Its source Repeat button opens a
  native instructions dialog with hash-checked source English text, marked as
  English fallback on the Spanish route; a separately labeled local reset is
  only a preview tool. Dialog close/return-focus is an accessibility adaptation,
  not an accepted reconstruction of the source close-button target.
- Local image route:
  `apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/reveal/[level]/[order]/route.ts`
  serves only the hash-bound tile for a same-origin image request from the
  corresponding P054 local candidate page and level. The matched-card image
  retains the mathematical value in the button's accessible name. It appears
  after Continue, not at the source-verified fade time.
- Local feedback-audio route:
  `apps/web/app/flash-assets/g678-local/shared-nms002-l02-p054/feedback-audio/[kind]/route.ts`
  serves only sprites 194/208 from the external extracted-stream evidence to
  an opted-in same-origin loopback P054 page. The server rechecks the real
  source SWF, manifest, and MP3 hashes; the browser verifies length and SHA-256
  before playback. Only the opted-in local P054 EN/ES pages receive a Blob-media
  CSP allowance. Missing or invalid audio disables the cards and offers a
  keyboard-focused retry/reset. This is not a production asset path.
- Pure state module: `packages/demos/src/nms-l02-p054-matching-state-candidate.ts`.
- Source-locked data: `scripts/build-nms-l02-p054-card-data-v1.mjs` verifies
  the real non-symlink source root, SWF hash, frozen game contract, and card
  layout, then writes 24 cards with exclusive creation. Its `--check` mode
  compares the generated TypeScript byte-for-byte. Source positions are
  preserved as data attributes but not yet rendered as exact stage geometry.
- Unit test files: `packages/demos/tests/nms-l02-p054-board-candidate.test.tsx`
  and `apps/web/tests/g678-p054-local-candidate-boundary.test.mjs`.
- Ruffle reference route:
- Standalone package:
- Deterministic `?frameDomain=`, `?requirementId=`, `?trace=`, `?entryStateSha256=`, `?frame=`, `?scenario=`, `?lang=`, and `?seed=` capture modes:
- Mandatory matching `data-flash-*` identity attributes:

## Verification Evidence

- Unit tests: on 2026-09-24, focused P054 contract/state/board tests passed
  10/10 with the exact source SWF and FFDec text/button extraction available;
  P054/P064 local route-boundary tests passed 6/6, focused TypeScript
  and ESLint passed. `npm run check:typography --workspace @helpmath/demos`
  remains red for four other new/changed placements (L1 P047, L2 P001,
  L2 P052, L9 P003); P054 is unregistered and has no typography binding/check
  record, so that run does not verify P054 typography. Generator `--check`
  passed; a second `--build` failed with
  `EEXIST` as intended and the generated file retained SHA-256
  `10e71a7e683983a4ef9f63b46bdae5792675d590cf1fa4482da4962bc8df894c`.
  `npm run doctor` passed; repository-wide `npm test` and
  `verify:workbench` were interrupted after about 21 minutes of high-CPU
  historical checks and must not be recorded as passes. The broad test run
  had already emitted failures unrelated to this new candidate. The general
  `verify:sources` command still rejects a compatibility symlink source root;
  this candidate's generator independently verifies the real directory.
- Production build: not run for this candidate; the production alias has
  focused boundary tests, but a bundle scan and production 404 remain open.
  WestWorld had only about 6.5 GiB free before the build decision.
- Audio machine audit (2026-09-24): the exact 2,077,270-byte SWF yielded four
  whole MP3 streams (26/29/106/105 blocks; 109,850 encoded bytes total).
  FFmpeg 8.1.2 decoded all four without errors; each stream's SWF-tagged
  sample total equals the complete decoded PCM sample count. The external
  manifest SHA-256 is
  `fd31b5e1208eaf54ef3c14fd28d55d61b2fdb3fc47d7b1f41a097d7e40d2dca0`.
  Re-extraction and exclusive-output refusal tests passed 6/6 together with
  the existing P053/P054 structural checks. Sprites 194/208 are source-bound
  to correct/wrong second-pick feedback and enabled only in the local
  candidate; this is not original-runtime listening or audio acceptance.
- Local feedback transport (2026-09-24): exact-source and route regressions
  passed 10/10; focused demos and web TypeScript checks and targeted ESLint
  passed. Chromium loaded both MP3s through the hash-bound route and invoked
  distinct `Audio.play()` calls on correct/wrong second picks. The earlier
  Blob-media CSP error was fixed with a P054-page-only, opt-in development
  override; the post-fix browser console had no errors before intentional
  network-abort testing. During that failure test all cards were disabled,
  focus moved to Retry, and retry restored all 12 cards and score 0. Spanish
  Level 2 was visually checked at 390 × 844. No human listening or source
  feedback-time comparison was performed. The general production build,
  production 404, and bundle scan remain open.
- Native-size keyframe captures:
- Complete authoritative original-runtime and current-JS capture manifests:
- Full-frame coverage manifest, comparisons, and archive:
- Per-frame metrics files and checksums:
- RMSE and diff-image results:
- Replay and keyboard checks: local Chromium selection, +10 pair, −2 mismatch,
  feedback lockout, Continue, focus advance, and Replay reset were exercised.
  On Spanish Level 2, Enter and Space selected the first pair; six pairs gave
  score 60, all 12 cards matched, focus on the explicitly unresolved terminal
  message, and Replay returned to score 0 with focus on the first card.
  Continue is a temporary preview control, not a source-timed event; the
  separately labeled local reset is not the source Repeat action. Exact
  original Replay behavior still requires acceptance evidence.
  On 2026-09-24, a fresh local Chromium check reproduced focus falling to the
  page root when card buttons became disabled after a second selection. The
  local candidate now focuses its explicit Continue button for both correct
  and incorrect feedback. English Level 1 was checked for −2 then +10 scoring
  and card focus after Continue; Spanish Level 2 was checked for +10,
  Enter-to-continue, next-card focus, and Help Escape returning to its trigger.
  This is a local accessibility repair, not source feedback-timing or host
  acceptance. The focused P054 tests passed 9/9, focused ESLint and module-only
  TypeScript passed; full demos TypeScript exceeded the default ~4 GiB Node
  heap before producing diagnostics and is not claimed as a pass.
- Desktop/mobile overflow checks: local Spanish Level 2 at 320 × 720 showed
  12 buttons in two columns and `scrollWidth == innerWidth == 320`; this is
  a candidate layout check, not native-stage fidelity. At the same viewport,
  the instructions dialog fit without horizontal overflow; Escape and the
  explicit Close control returned focus to Help without resetting the +10
  feedback state. After Continue, the two matched cards remained matched.
- Picture-tile checks (2026-09-24): EN Level 1 and ES Level 2 each displayed
  two matched source tiles after Continue; the browser loaded all four image
  requests with HTTP 200 and nonzero natural dimensions (width 168, height
  100–101). EN Level 1
  at 320 × 720 had no horizontal overflow (`scrollWidth == innerWidth == 320`).
  The 24-tile source/placement regression and local route boundary regression
  passed with the exact real source root (focused suite 11/11). A same-origin
  level-2 tile request from a level-1 page returned 404; missing browser
  context, invalid tile order, and a foreign page Referer also returned 404.
  These are local candidate checks, not original-runtime visual comparison.
- Console and network checks: before the picture route was added, local
  Chromium reported zero console errors and warnings in its checked session.
  During picture-route development, initial image 404s were observed and
  preserved in Playwright logs; binding the real Host/port after Next URL
  normalization fixed them, and the final checked image requests returned 200.
  Do not treat the earlier clean console as a post-change clean sweep. Loopback
  HTTP returned 404 for an extra page query parameter and a non-loopback Host
  header; valid route HTML carried `noindex, nofollow, noarchive`. Full
  network/asset and production-bundle checks remain open.
- Human reviewer and review date for all keyframe/full-frame diffs:
- Audio listening-acceptance record, or source-bound not-required evidence:
- Immutable human and owner record descriptors:

## Exceptions And Decisions

Open: cross-page handoff, all root-reachable nested frame domains, exact
visible card/art positioning, feedback/reveal transitions, audio listening and
language, source music accompanying the now-local picture tiles, natural event
traces, original popup-close target, original-runtime comparison, human/Owner
review, strict ledger and release. No exception or approval is granted.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
