# shared-dat001-l02-p002 Migration Brief

Created: 2026-09-23; source-bound nested-domain audit updated 2026-09-25.

## Objective

Migrate the second active page placement of DAT001 Lesson 2, “Representing
Data”, into the modern EN/ES My Lesson host. This workspace now has a
source-bound, unregistered React/SVG audiovisual candidate on a guarded local
diagnostic route and an isolated My Lesson host probe, but no accepted My Lesson
integration or Current-JS admission. The
source page title is `Page 1`; the five exact English source strings have now
been exported, but their teaching treatment and Spanish adaptation are not
yet reviewed.

## Identity And Classification

- Immutable `assetId` (`swf-<full SHA-256>`): `swf-b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.
- Placement `animationId`: `shared-dat001-l02-p002`.
- Collection, grade, lesson, section, and page: G6–G8 shared, DAT001 L2,
  RW, active XML occurrence 2.
- Raw title and reviewed display title: `Page 1`; reviewed display title pending.
- Knowledge point in English and Spanish:
- Controlled mathematics domain:
- Classification evidence, status, and confidence:
- Alias or variant relationship:

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/DAT001/L2/RW/L2RW02.swf`
- Source owner/provenance: Owner-provided physical AWS grade-classified tree,
  inspected without editing source bytes.
- SHA-256 values: shipped SWF
  `b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`;
  swfmill extraction `audit/movie.xml`
  `1d0d14c87f96f7a501311833a90ee50257f392129bb068fb3c27fb6800cce02a`.
- Missing source files: no same-path FLA is recorded; broader authoring-source
  absence has not been established.
- Evidence conflicts and resolution: `migration.json` remains a draft with
  unreviewed classification and implementation fields; its uncompressed SWF
  declared length must not be mistaken for the 354,812-byte physical file.

## Runtime Audit

- SWF signature/version: CWS v6.
- Stage width and height: 800 × 600.
- Frame rate, frame count, duration: 12 fps; root 10 frames; root frame 6
  places sprite 113 (276 frames). Root duration is not the instructional
  duration or completion signal.
- Background/transparency: source background `#b8d8f7`; visual compositing
  remains unaudited.
- ActionScript generation and scripts: AVM1 actions; root preloader entry and
  Stop at frame 6; sprite 113 Stop at frame 276. The three child sprites have
  no `DoAction` tags. Exact original host execution remains unobserved.
- Symbols, masks, morphs, filters, blend modes: three script-free child domains
  (sprites 41/49/53 with 279/22/151 frames), four morph definitions, four
  JPEG definitions. `audit/FRAME_DOMAIN_TRIAGE_V1.md` and the reproducible
  `audit/nested-domain-instances-v1.json` bind six direct child instances,
  their lifetimes, and terminal synchronous projections; this is not visible
  or original-runtime fidelity evidence.
- `audit/display-ir-v1.json` (1,228,847 bytes; SHA-256
  `0863407592134422329e1a9e7d22c135b58fbfbbb6f90777234d952171b05bad`)
  now preserves 3,166 root/main/child placement and removal events, matrices,
  color transforms, clip depths, morph ratios, action hashes, and the 276
  source audio-block coordinates. The byte-identical product copy is
  `packages/demos/src/generated/dat001-l02-p002-display-ir-v1.json`.
  `scripts/build-g678-dat-l02-p002-display-ir.py --check` re-extracts the
  exact physical SWF and fails on source, XML, nested-instance, or output drift.
- Embedded fonts and exact strings: FFDec 26.2.1 extracted five `DefineText`
  strings into `audit/ffdec-26.2.1-source-text-v1/` (144 bytes). Their exact
  character IDs, spelling, spaces, and individual hashes are in
  `audit/SOURCE_TEXT_AUDIT_V1.md`. The title is “Representing Data:  Real
  World Activity”; the assignment asks for sunspot data, an appropriate
  graph, and interpretation. Font identity and live-text treatment remain
  pending; this does not establish a Spanish source layer.
- Audio/video: sprite 113 has 276 embedded MP3 stream blocks, one per source
  parent frame. The exact whole stream is now extracted to
  `audit/source-stream-audio-v1.mp3` (68,562 bytes; SHA-256
  `3b3f98778ff20ab738989560ddade4b28f065dc09dade6c4477afdce708c4536`).
  It decodes to 506,304 mono samples at 22,050 Hz; the whole-stream WAV is
  `audit/source-stream-decoded-v1.wav` (SHA-256
  `dc8fc07f7066b76e781bab37cb09f5232bb3f3ac98c8690104d8acf1dcee9f8c`).
  The pinned per-block offsets, sample counts, and hashes are in
  `audit/source-stream-audio-v1.json`. Extraction/decoding does not establish
  source-host synchronization, playback lifecycle, spoken language, Replay,
  or listening acceptance. The guarded local candidate now plays this decoded
  WAV with a provisional media clock; see the separate local audio QA receipt.
  The source catalog also binds a distinct same-stem lesson-SA candidate,
  `SA/L2RW02.mp3` (319,200 bytes; SHA-256
  `d5a4d20e481fbba71680bc4861b81848446e45eeff977c17a97f3748514d4a4a`),
  which the candidate page does **not** play. Its trigger and relation to the
  embedded stream are unverified. See `audit/SOURCE_STREAM_AUDIO_AUDIT_V1.md`
  and `audit/SOURCE_AUDIO_CROSSWALK_V1.md`.
- Audio cue IDs, language tracks, hashes, durations, and start frames
  (`audio-inventory.csv`): separate embedded-stream and cataloged lesson-SA
  candidate rows, both with language undetermined. The stream starts at source
  sprite frame 1 and decodes to 22.961633 seconds; the external MP3 reports
  22.800 seconds. Original-host start/stop and coexistence remain unverified.
- FlashVars, URLs, external assets, and legacy APIs:
- Stops, labels, buttons, Replay, and user interactions:
- Audit tools and exact versions: swfmill 0.3.6 for this nested-domain
  extraction; source SWF hash and regenerated XML are checked on every
  packet generation/check.
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

- Selected candidate renderer: maintained React/SVG over a source-bound visual
  plan. The compiler-assisted hybrid path requires a nested-domain adapter;
  a single-clock factory pass is held. Product renderer/host acceptance is
  still pending.
- Why it fits this animation: six child instances overlap the 276-frame parent
  clock and three remain placed at parent Stop. A source-only synchronous
  projection cannot decide host/terminal behavior.
- Rejected alternatives and tradeoffs:
- Accessibility and localization approach:

## Timeline Specification

Summarize object phases, one-indexed frame windows, transforms, alpha, depth, text/count changes, audio cues, and interaction transitions. Keep the full frame list in `keyframes.csv`.

The initial parent entry, frames 43 and 60, and parent Stop at 276 are the
source-bound nested-domain transition anchors. The six exact intervals and
projected child frames are in `audit/nested-domain-instances-v1.json`.
`dat-l02-p002-display-state-v1.ts` now provides pure direct-seek state for all
six declared domains (root 10, main 276, children 279/22/151, title 1).
For every frame it returns depth-ordered source objects, effects, text IDs,
source audio block, Stop action, and separately labelled synchronous child
projections. Original-host entry, child progression after parent Stop, and
terminal/Replay behavior are not observed. Do not infer a full natural trace
or completion from the static projection.

## Asset Strategy

The bounded FFDec 26.2.1 source export is held under
`audit/ffdec-26.2.1-source-assets-v1/`: 98 shape SVGs, five text SVGs,
four morph-shape SVGs, and four JPEGs with four separate alpha PNGs
(115 files; 4,463,915 bytes). They are source evidence, not bundled product
assets. A separate FFDec RGBA export preserves the transparency of all four
embedded images, but those bitmap definitions are not directly placed; the
JPEG/alpha source pairs still need visual review.

FFDec's four morph SVGs contain autonomous, indefinitely repeating SVG
`<animate>` elements, which cannot represent a deterministic direct seek at
the SWF's placed ratio. `scripts/build-g678-dat-l02-p002-static-morphs.py`
uses only the exact 66 source-scheduled character/ratio pairs and pinned
source SVGs to produce static candidate SVGs in
`audit/source-morph-frames-v1/` (66 files; 44,762 bytes). Its manifest
`audit/source-morph-frames-v1.json` has SHA-256
`90848d12892ab9ffaf4ea98a89c0ec3533464b0775bc2d9aec9ceff51e68b827`.
These are deterministic endpoint interpolations; they are **not** accepted
original-runtime morph geometry. The source-locked visual manifest
`audit/source-visual-layout-v1.json` (63,046 bytes; SHA-256
`bfdc2f54900629ad6bec77da79e00a602fb69ee8f2c69e9cf6a73ff12ba60a0e`)
binds all 107 placed visual symbols, 66 static morph states, and four
not-directly-placed RGBA bitmap definitions. Its byte-identical product copy
is `packages/demos/src/generated/dat001-l02-p002-visual-layout-v1.json`;
`scripts/build-g678-dat-l02-p002-visual-layout.py --check` verifies the exact
source exports and both copies. The 98 shape and five text SVG extents match
the source SWF twip bounds; four morph extents are FFDec envelopes only.
The guarded candidate now has an optional readable English transcript: the
server re-hashes all five FFDec text files, keeps the title and assignment,
and presents the three source bullets as semantic list items. It is not tied
to reveal frames and is not a reviewed Spanish teaching treatment. See
`audit/LOCAL_TEXT_TRANSCRIPT_QA_2026-09-25.md`; source-timed live-text roles
and EN/ES teaching review still remain.
At the local candidate's source terminal frame 276 only, the viewer now shows
that same hash-bound English assignment as an open, responsive semantic panel.
The renderer removes the exact source gradient card 102, four glyph layers
105/108/110/112, and title layers 114/115 from the SVG in this mode; the
illustration and every earlier frame remain unchanged. A fail-closed layer check and focused
test bind this replacement to the frame-276 display list. This is a modern
terminal presentation candidate, not source-timed text acceptance for the
earlier mask reveals or a Spanish translation.
`scripts/render-g678-dat-l02-p002-local-svg.ts` can assemble a bounded
diagnostic SVG from this plan without registering a lesson renderer. Three
source-frame projections (1, 126, 276) are retained in
`audit/local-visual-projection-v1/`; their source SVG SHA-256 values are
`7be0f7eedf9cfc1c30ff120ffbc41e5dfb2f2739d824e8ea310e3ecec62652d8`,
`3259b83a996bd21132d77907d29a3cd6428b36422fd4536d2a6b7e33ec802ff2`,
and `5c9fd57be9e88c932675dc55f23cb9d3fe26b3b0fd14a146ec9be68db0969715`.
Sharp/libvips local raster previews at 800 × 600 show a source scene and the
assignment text at frame 276. ImageMagick generated visibly incorrect black
regions and a white panel from the same SVG; those PNGs are retained only as
failed renderer evidence. A Playwright browser open/snapshot of the standalone
3 MB SVG timed out, but the guarded Next.js candidate route subsequently
loaded and rendered source frames 1 and 276 in real Chromium. This does not
resolve original-runtime comparison or My Lesson host behavior.

## Implementation Map

- Next.js local-only route:
  `apps/web/app/[locale]/migration-status/g678-calibration/shared-dat001-l02-p002-candidate/`.
  Its server loader binds 169 source SVG assets and 68 geometric masks to the
  physical SWF and audit/product manifests. The HTML now carries hash-bound
  SVG URLs rather than 169 base64 payloads; an exact loopback-only `symbol/[sha]`
  route serves each requested source SVG after source/layout/file verification.
  Both routes reject production, non-loopback and invalid requests. See
  `audit/LOCAL_SYMBOL_TRANSPORT_QA_2026-09-25.md`.
- The same local candidate path now accepts `?host=1` to mount a simulated
  P002 page in the real source-ordered 53-page DAT001 L2 My Lesson host. Its
  source-audio clock, navigation, Replay and frame inspector are engineering
  probes; terminal Stop deliberately does not emit page completion. It changes
  no official registration, freeze, asset-guard hash, or production route.
  See `audit/LOCAL_MY_LESSON_HOST_PROBE_QA_2026-09-25.md`.
- React component: `packages/demos/src/dat-l02-p002-candidate-renderer-v1.tsx`;
  source visual only, no source interaction. The diagnostic viewer drives its
  frame counter from the decoded WAV media clock and exposes Play, Pause,
  source-frame seek, Replay, and an expandable source-English transcript. This
  is a local engineering projection, not
  original-host synchronization acceptance. The decoded WAV is served only
  through an exact local-loopback, source-hash-bound route; it is not a public
  static asset.
- Pure timeline module: `packages/demos/src/dat-l02-p002-display-state-v1.ts`;
  source-only, not a React page renderer. The separate
  `packages/demos/src/dat-l02-p002-visual-plan-v1.ts` flattens root/main/child
  source frames into ordered SVG symbol placements with affine composition,
  geometric-mask relationships, alpha, and source-bound asset paths. This is
  a synchronous projection for inspection, not original-host playback.
- Unit test file: `packages/demos/tests/dat-l02-p002-display-state-v1.test.ts`;
  visual-plan test in `packages/demos/tests/dat-l02-p002-visual-plan-v1.test.ts`;
  candidate-renderer test in
  `packages/demos/tests/dat-l02-p002-candidate-renderer-v1.test.tsx`;
  server-loader test in `apps/web/tests/g678-dat-l02-p002-candidate.server-test.ts`;
  generator regression in `scripts/build-g678-dat-l02-p002-display-ir.test.py`.
- Ruffle reference route:
- Standalone package:
- Deterministic `?frameDomain=`, `?requirementId=`, `?trace=`, `?entryStateSha256=`, `?frame=`, `?scenario=`, `?lang=`, and `?seed=` capture modes:
- Candidate identity attributes: `data-flash-frame`, `data-flash-frame-domain`,
  `data-flash-root-frame`, `data-flash-language`, `data-flash-seed`, and
  `data-flash-replay`; full requirement/trace/entry-state identity remains open.

## Verification Evidence

- Unit tests: six focused display-state tests cover all 739 independent
  source-domain frames, audio-block indexing, depth ordering, nested-instance
  boundaries and invalid identities. Four nested-domain/display-IR generator
  tests cover source/output repeatability and exclusive-write non-overwrite
  behavior. Three static-morph
  tests cover the exact 66 ratio set, removal of autonomous SVG animation,
  endpoint/intermediate geometry, and no-overwrite behavior. Two visual-layout
  generator tests cover export binding and exclusive-write non-overwrite. Four
  visual-plan tests cover all 276 parent frames, nested instance transitions,
  composed matrices, mask relationships, and unaccepted-gate flags. A separate
  diagnostic-compositor test locks the three rendered SVG frame digests. The
  renderer-frame-domain audit check passes. Two candidate-renderer and three
  server-loader tests pass. Three source-audio generator tests and its
  source-locked `--check` mode pass; the whole-stream WAV decodes to the
  expected sample count. Four audio/symbol access-proxy tests pass.
  Browser audio playback and negative checks are in
  `audit/LOCAL_AUDIO_CANDIDATE_QA_2026-09-25.md`; the earlier visual evidence
  is in `audit/LOCAL_VISUAL_CANDIDATE_QA_2026-09-25.md`. No original-runtime
  interaction or named-human listening is exercised by these tests.
- Production build: `apps/web` optimized webpack build passed; production EN
  and ES candidate routes, source-audio route and source-SVG route returned
  404. The public static bundle scan found no P002 source SWF hash, display-IR
  marker, source-SVG hash, visual-layout marker, decoded-WAV path, or WAV
  SHA-256. This is a negative scope check, not release.
- Native-size keyframe captures: local candidate frames 1 and 276 plus Spanish
  320px capture in `output/playwright/`; SHA-256 values in the QA receipt.
- Complete authoritative original-runtime and current-JS capture manifests:
- Full-frame coverage manifest, comparisons, and archive:
- Per-frame metrics files and checksums:
- RMSE and diff-image results:
- Replay and keyboard checks: slider keyboard End reached 276 and sought the
  WAV to 22.916666 seconds; Replay returned WAV/frame to zero/1. Play/Pause
  and media-clock frame progression worked in Chromium. My Lesson Replay and
  original-host alignment remain untested.
- Desktop/mobile overflow checks: browser at 1200px and 320px; Spanish 320px
  `scrollWidth=clientWidth=320`, but source lettering is too small for an
  accepted teaching-text treatment.
  In a later terminal-native candidate check, Spanish at 375px and 200% root
  font size had `scrollWidth=viewport=375`; the English `lang=en` assignment
  panel wrapped without clipping. Desktop English at 1280px also had no
  horizontal overflow. All seven replaced source layers were absent at the
  terminal frame, while the source illustration remained. Frame 275 retained
  its source card, glyphs, and optional unsynchronized transcript. The visually
  inspected final-frame screenshots are
  `output/playwright/dat-l02-p002-terminal-native-es-375-v3.png`
  (SHA-256 `b5a07b3af0f37769e3c0e1ee60d69b2e5228de3738f789267e64aa8b98c65d0d`),
  `output/playwright/dat-l02-p002-terminal-native-es-375-200pct-v2.png`
  (SHA-256 `fd1084f2a7766c1466c8a0719f0ded7f6137ae1c1be1bbac09f2860766800287`),
  and `output/playwright/dat-l02-p002-terminal-native-en-1280.png`
  (SHA-256 `9a06f1189fd25d9c7796561e872bd7013e9c8730e7a85ae928f1726d7da94ccc`).
  Earlier screenshots before removing the card and duplicate title are retained
  as failed visual evidence. Seven focused renderer/visual-plan tests, seven
  source-access tests, full web TypeScript, and targeted viewer lint passed.
  A cold-development browser run reproduced the previously observed React
  pre-mount state-update console error; its cause remains unassigned.
- Console and network checks: browser console had zero errors/warnings in the
  source-SVG transport run. The observed `?frame=276` HTML response shrank
  from 8,800,562 to 90,857 bytes; 26 SVG resources used by that frame returned
  200, so this is a page-envelope reduction, not a whole-session byte saving.
  The earlier Gzip `MaxListenersExceededWarning` was not observed in this
  bounded run, but broader performance remains unaccepted. Both observations
  are preserved in their dated QA receipts.
- Human reviewer and review date for all keyframe/full-frame diffs:
- Audio listening-acceptance record, or source-bound not-required evidence:
  pending; decoded media playback is not a named-human original-runtime
  listening decision.
- Immutable human and owner record descriptors:

## Exceptions And Decisions

Current-JS registration is held pending the nested-domain runtime/host
behavior, source text and visual composition, original-host audio lifecycle,
modern My Lesson
integration, EN/ES browser/accessibility checks, and reviewed evidence. No
original-runtime, fidelity, audio, human/Owner, strict, release, or
publication gate is accepted.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
