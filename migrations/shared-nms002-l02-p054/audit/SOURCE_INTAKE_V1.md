# P054 matching-game source intake — 2026-09-23

Status: hash-bound structural and teaching-math audit. No renderer, product
registration, original-runtime trace, listening acceptance, or release.

## Identity and source

- NMS002 Lesson 2 XML occurrence 54, section `GS`, source
  `GS/L2GS03.swf`, raw page title `Game 2`.
- Real read-only source:
  `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS03.swf`,
  2077270 bytes, SHA-256
  `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`.
  Asset ID `swf-06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`.
  No same-path FLA is cataloged.
- Cataloged lesson-SA candidate `L2GS03.mp3` has SHA-256
  `c29ad5278f052df73d8cdc800b957f2c3645bc3cf2eeeea8858404b2dd41e008`,
  byte-identical to the separately named P053 candidate. `ffprobe` measures
  one mono 48 kHz MP3 stream of 54.552 seconds. The names and
  placements remain distinct. Start/stop, language, and listening status
  are unresolved.

## Verified structure and mathematics

- FFDec 26.2.1: CWS/ZLIB SWF v6, 800 × 600 at 12 fps, 10 root frames;
  declared uncompressed length 2987765 bytes. Root duration alone does
  not represent game duration.
- swfmill 0.3.6 XML SHA-256
  `2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46`
  has 128 `DefineSprite`, 44 `DefineText`, seven `DefineEditText`, two
  `DefineBits`, four `SoundStreamHead`, and 266 `SoundStreamBlock` tags.
  These are file-wide structural counts, not reachable-domain or cue counts.
- Root-placed sprite 731 declares five frames. Its frame 1 selects the
  `Level1` or `Level2` label from the P053 global handoff, defaulting to
  Level 1. Frames 2 and 4 initialize the two levels, reset score/selection,
  and hold exactly 12 card instances each. FFDec exported 110 AVM1 script
  records and 51 text records to
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5`.
- `audit/frame-domain-static-graph-v1.json`, SHA-256
  `541c11e12dd93c2819084f9ac57e8149947f3d7cdc1dc285735244d48697fb93`,
  enumerates 65 sprite domains in the static root-placement graph out of
  128 defined sprites. Besides the five-frame controller, static paths
  include 121-frame sprite 648, 118-frame sprite 729, and the 27/31-frame
  feedback clips. This is not natural-trace reachability or full-domain
  fidelity coverage. Recompute with
  `node scripts/audit-nms-l02-p053-p054-frame-domains-v1.mjs --check`.
- `audit/card-layout-v1.json`, SHA-256
  `d34c6f2b89a99f110138c07b9b108ab96afa56db294a085a68a670d2cb034863`,
  binds all 24 card instances to their exact source character, level,
  source frame (2 or 4), placement order, display-list depth, local twip translation, and translated
  800 × 600 stage coordinates. The source's root sprite 731 sits at depth 3
  with translation (8268, 5686) twips. This is a 4 × 3 source-placement
  grid for each level, not card bounds or verified hit areas. Recompute with
  `node scripts/audit-nms-l02-p054-card-layout-v1.mjs --check`.
- FFDec 26.2.1 exported source shapes (SVG), buttons (combined SVG), and
  images (PNG) to the external, non-product directory
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-art-assets-oM5UHV`.
  `audit/art-export-v1.json`, SHA-256
  `b715b175badc1edfcdf5df81ef7c388ea7e0b2eaac99656c28c74d1762e91974`,
  hashes all 519 shapes, 12 images, and five buttons (46,909,053 file bytes).
  Exported SVGs pass XML parse; a targeted search found no remote URL or
  `<script` marker. This is still unreviewed source art, not approved web
  assets or a complete card/hit-area composition. Recheck with
  `node scripts/audit-nms-l02-p054-art-export-v1.mjs --check`.
- `asset-inventory.csv`, SHA-256
  `bbbd54c44286f41ed373d64ca83e03854fc1fcb18da58be6fba5f9db40e42b75`,
  now records all 536 art exports plus 51 FFDec text exports with character
  IDs, file hashes, transformation provenance, and unapproved-use notes.
  It is an extracted-source inventory, **not** a finished runtime asset plan:
  sprite composition, font/glyph fidelity, masks, audio, and which assets are
  actually reached in natural play remain open. Recompute with
  `node scripts/build-nms-l02-p054-source-asset-inventory-v1.mjs --check`;
  `--write` uses exclusive creation and will not replace the file.
- `audit/card-display-list-v1.json`, SHA-256
  `c2e18b123f43e16890548f4be5d38613b022c55c6e2b090cf663dd6d07c62343`,
  freezes the five source display-list frames of every one of the 24 card
  sprites. It resolves 18 exported shapes and 19 exact text resources with
  source depths and local transforms. Source frames 2 and 4 add a selection
  overlay; frames 1, 3, and 5 retain the base card state. This is versioned
  source IR, not an executed click trace or an app renderer. Recompute with
  `node scripts/build-nms-l02-p054-card-display-list-v1.mjs --check`.
- `audit/audio-structure-v1.json`, SHA-256
  `0e1b96f79f08d636bdf1aeb5650901b2e43ac091f72c3c36e594b3e3354a3871`,
  resolves four embedded MP3-stream domains: feedback sprite 194 has 26
  blocks on frames 2–27; sprite 208 has 29 on frames 3–31; sprites 648 and
  729 have 106/105 on frames 16–121 and 14–118. The subsequent whole-stream
  extraction and machine-decoded durations are recorded in
  `AUDIO_STREAM_EXTRACTION_V1.md`; natural triggers, original-host playback,
  language, and listening acceptance remain unverified. `audio-inventory.csv`
  records these structural sources plus the distinct lesson-SA candidate. Recompute with
  `node scripts/audit-nms-l02-p053-p054-audio-structure-v1.mjs --check`.
- Every card handler uses first/second selection, same-pair opposite-side
  testing, +10 for a match and −2 for a mismatch. Source feedback clips
  re-enable the cards at correct frame 27 or wrong frame 31. The correct
  feedback clip increments the completed-pair count and changes quiz state
  after six matches. Exact natural timing, reveal effect, score floor, and
  terminal transition still need runtime/trace audit.
- `audit/interaction-contract-v1.json`, SHA-256
  `7472962f3e1ca32219dafd000a3f9bbcc6b90865cb0ca7d7f3b79d5265cc03b4`,
  binds all 24 placed cards to one byte-identical AVM1 click handler, both
  level resets, the five exported button actions, and the feedback scripts.
  `BtnRepeat` opens `Mc_Popup`; it does not itself reset the game. The
  six-match `nextFrame()` occurs inside feedback sprite 194, not game sprite
  731. This static source contract cannot establish the actual result screen,
  replay flow, host completion, or audio timing. Recompute with
  `node scripts/audit-nms-l02-p054-interaction-contract-v1.mjs --check`.
- `audit/game-display-list-v1.json`, SHA-256
  `8887c62a93824e851b2b6bba3779742ba43143b5c8e38b47c49b81c04fa6c40c`,
  freezes all 69 placement and 60 removal events in controller sprite 731's
  five source frames. The visible static layer counts are 1/31/9/31/9:
  frames 2/4 contain the two 12-card games; frames 3/5 replace the cards
  with distinct result sprites 648/729, score, level selectors, and Start.
  The controller is placed on root frame 6 at depth 3. No controller-frame
  `DoAction` directly advances from a game frame to a result frame, so a
  natural trace and host audit are still required; structural result content
  is not evidence of its runtime reachability. Recompute with
  `node scripts/build-nms-l02-p054-game-display-list-v1.mjs --check`.
- `audit/frame-domain-disposition.json`, SHA-256
  `d90afecdd3893c150f733585490afa8172a7d064879505919d5b3a68c119cc21`,
  enumerates the ten-frame root plus 65 sprite domains in the static root
  placement graph and separately lists 63 other defined sprites. It binds
  controller/card/feedback/result placement sites where the five-frame
  display list proves them. Every runtime disposition remains `unresolved`;
  button-state or dynamic use outside the graph is also unresolved. This
  satisfies source inventory bookkeeping, not the final natural-trace or
  strict-acceptance requirement. Recompute with
  `node scripts/build-nms-l02-p054-frame-domain-disposition-v1.mjs --check`.
- The source card character graph proves these six mathematical pairs in
  each level:

  | Fraction | Level 1 match | Level 2 match |
  | --- | --- | --- |
  | 6/8 | 0.75 | 75% |
  | 5/100 | 0.05 | 5% |
  | 2/5 | 0.40 | 40% |
  | 1/8 | 0.125 | 12.5% |
  | 2/20 | 0.10 | 10% |
  | 2/100 | 0.02 | 2% |

- Source-locked card identities, text IDs, text hashes, placement order,
  scoring markers, and P053 handoff are in
  `catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json`,
  12324 bytes, SHA-256
  `6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205`.
  Recompute with
  `node scripts/audit-nms-l02-p053-p054-game-contract-v1.mjs --check`.
  Four mathematical/guard and static-graph tests pass in
  `packages/demos/tests/nms-l02-p053-p054-game-contract-v1.test.ts`.

The extracted P053 handoff and P054 click/feedback transitions are separated
from unproven runtime behavior in `audit/NATIVE_STATE_TRANSITIONS_V1.md`.

## Rendering and acceptance boundary

FFDec selected sprite frames 2 and 4 were rendered into the external
`visual-probes/` folder. They show source layout but execute no AVM1 and are
**not** original-runtime screenshots or visual-parity baselines. Preserve
the separate Ruffle 0.4.1 standalone observation in
`audit/ruffle-standalone-forensic-v1.json`: the exact SWF loaded through an
isolated loopback server, but only the solid light-blue 800 × 600 stage was
observed, unchanged after a center click. Root frame 1 stops and calls an
`_level0.InternalPreloader` that is not placed in the SWF; the game sprite
enters at root frame 6. This confirms a source host dependency but does not
uniquely diagnose the Ruffle visual or establish any original-runtime trace.
`audit/indexmi-host-binding-v1.json` now binds the recovered `indexMI.swf`
SHA-256 `275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`
to a root-frame-38 `InternalPreloader` instance and its frame-2
`jump_check` label. The same host source names the NMS002 course, loads pages
through `animation_mc`, and observes non-final page playback conditionally.
Its presence resolves source-host identity, not whether the P054 game/result
sequence actually executes or reaches a host terminal in the original runtime.
The unregistered pure-state candidate
`packages/demos/src/nms-l02-p054-matching-state-candidate.ts` models the
source-backed card/scoring/feedback boundary for both levels, but deliberately
ends at `terminal-unresolved` after six correct pairs. It is not a game
renderer or page-completion assertion. Preserve the 800 × 600 coordinate
system while using accessible text and controls in
the modern host. Before implementation, resolve the static graph into
root-reachable natural-trace domains and map card art/text positioning,
feedback and reveal states, source audio
cues, exact P053-to-P054 handoff, branch traces, and complete evidence
requirements. The provisional lane is behavior-heavy advanced-manual with
source-locked IR; no factory scale-out or product registration is claimed.
