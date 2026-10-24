# P053 source intake and behavior triage — 2026-09-23

Status: source-bound structural evidence only. No P053 JavaScript renderer,
private registration, original-runtime trace, audio acceptance, or release.

## Identity and custody

- Catalog: `catalog/g678-shared-catalog.v1.json`, NMS002 Lesson 2 XML
  occurrence 53, section `GS`, title `Game 1`, source reference
  `GS/L2GS02.swf`; `animationId=shared-nms002-l02-p053`.
- Shipped SWF: real, read-only source directory
  `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS02.swf`,
  236774 bytes, SHA-256
  `f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`.
  `assetId=swf-f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`.
  No same-path FLA is cataloged. Do not substitute the unrelated G5
  `L2GS02.swf` workspace, which has a different hash.
- Cataloged lesson-SA candidate `L2GS02.mp3`: 763728 bytes, SHA-256
  `c29ad5278f052df73d8cdc800b957f2c3645bc3cf2eeeea8858404b2dd41e008`.
  `ffprobe` measures one mono 48 kHz MP3 stream of 54.552 seconds. This is a
  candidate binding, not a timing, language, or listening determination.
- The adjacent P054 `L2GS03.swf` was also hash-verified as
  `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`.
  Its separate-named `L2GS03.mp3` matches the P053 MP3 hash exactly; that
  byte identity does not merge the placements.

## Static extraction

- FFDec 26.2.1 header: CWS/ZLIB SWF v6, declared uncompressed length
  311455 bytes, 800 × 600 stage, 12 fps, 10 root frames. The root duration
  of 833.3 ms is **not** the interactive game duration.
- swfmill 0.3.6 reports 76 `DefineSprite` tags, two `DefineButton2` tags,
  38 `DefineText` plus one `DefineEditText`, one `SoundStreamHead`, and 619
  `SoundStreamBlock` tags. These are file-wide tag counts, not a reachable
  feature or accepted audio-cue inventory.
- Sprite character 187 is placed at root depth 3 as `animation` and declares
  **694 frames**. Its frame 693 has the `SelectLevel` label; other labels
  include `RepeatDirection` at nested frame 3 and root `begin` at frame 6.
  FFDec exported 59 AVM1 script
  records and 39 text records into the separate source-audit directory:
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq`.
- The preserved swfmill XML in that directory has SHA-256
  `058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1`.
  Selected FFDec sprite frames 1, 3, and 693 are static visual probes there,
  not script-driven original-runtime captures.
- `audit/frame-domain-static-graph-v1.json`, SHA-256
  `8ad79c29aedcb0553b571ed8f20f8f826b7a5feba15c770d2a433f27a40ff3aa`,
  enumerates 12 sprite domains in the static root-placement graph out of 76
  defined sprites. It does not prove runtime reachability or complete
  requirement/trace coverage. Recompute with
  `node scripts/audit-nms-l02-p053-p054-frame-domains-v1.mjs --check`.
- `audit/audio-structure-v1.json`, SHA-256
  `2468bc4e992701c7fee12a5b52566dcf4653dcb965a474f2d041927c8a5d7d56`,
  locates the embedded stream in sprite 187: head frame 1, 619 blocks from
  nested frames 4–694. `audio-inventory.csv` now records that stream and the
  distinct lesson-SA candidate, with unknown natural trigger and no audio
  acceptance. Recompute with
  `node scripts/audit-nms-l02-p053-p054-audio-structure-v1.mjs --check`.
- Exported text names a “Fractions, Decimals, and Percents Match Game”,
  Level 1, Level 2, Start, Skip Directions, and Repeat Directions. It also
  contains “Inequalities Match Game” text; determine its reachable context
  before choosing teaching copy or deleting it as a presumed leftover.
- The root script calls
  `_level0.InternalPreloader.gotoAndPlay("jump_check")`. Sprite 187 starts
  with both global level flags false and a hidden message. Level buttons set
  one of the two flags. Start in the sprite's `SelectLevel` state calls
  `_root.doNeedMoreHelp("L2GS03", 1, 6)` only after level selection; otherwise
  it shows a message. An earlier sprite frame's Start handler instead calls
  `doNeedMoreHelp("L7GS03", 1)`. A later structural addendum,
  `audit/START_BRANCH_TRIAGE_V1.md`, identifies the early Start instance in
  frames 1–6 and the late instance at frame 693. The exact-host navigation
  audit `audit/host-navigation-resolution-v1.json` further shows that a
  normal L2 GS lookup misses `L7GS03` and matches `L2GS03`; a real L7 file
  does not override the host's current-section search. Real click causality,
  global-state entry, and the modern adapter remain unresolved. Do not equate
  either call with a validated cross-page flow.
- Source instructional text specifies that learners click one box then a
  matching box, receive 10 points for a correct match and lose two for an
  incorrect match, and reveal a picture and music. The adjacent P054 source
  provides the actual two-level card game. Their source-locked cross-page
  contract is
  `catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json`,
  SHA-256 `6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205`.
  This resolves source card identities and scoring, not early-branch reachability
  or original-runtime causality.

## Lane and next audit boundary

Provisional `behavior-heavy` classification: root frame count alone is
misleading because the placed sprite has 694 frames, level-selection and
repeat/skip branches, embedded sound stream, and host-owned calls. No factory
scale-out is authorized. Before a maintained advanced-manual state machine
or reusable adapter is chosen, resolve the static graph into natural-trace
reachable frame domains and map their
scripts, level branches, deterministic event traces, score/matching rules,
terminal/Replay behavior, external L2GS03 relationship, exact instructional
strings, and audio start/stop semantics. Use only source-evidenced behavior;
any original-runtime operation remains a separate gate.

The scaffold's `audio.required=true` reflects the present sound-stream
evidence; `audio.languages`, cue identity, duration of embedded audio, and
original-runtime start/stop/Replay mapping remain incomplete. Draft validation
is schema-only and does not
prove source path resolution, renderer readiness, or fidelity.
