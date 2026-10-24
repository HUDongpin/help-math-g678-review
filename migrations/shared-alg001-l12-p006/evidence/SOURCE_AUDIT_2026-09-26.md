# ALG001 L12 P006 source audit

## Outcome and scope

Source-locked static extraction completed; no renderer, registration, original-runtime,
audio acceptance, fidelity, human/Owner acceptance or publication is claimed.
This is a bounded continuation after P005's unresolved original-host/audio timing hold.
P005 remains untouched and unregistered. P006 must not inherit P005's timing assumptions.

## Exact identity

- Placement: `shared-alg001-l12-p006`, source sequence ordinal 6, RW section page 5.
- Source-relative path: `G6-G8-shared/ALG001/L12/RW/L12RW06.swf` in the physical AWS Grade-Classified Courseware root.
- Source: 708,053 bytes, SHA-256 `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
- Catalog asset ID: `swf-933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
- Catalog title: Page 5. No source Spanish title; do not invent a translated source title.
- Catalog authoring evidence: SWF only; no paired FLA.
- CWS v6, AVM1, 800 × 600, 12 fps, background `#b8d8f7`.

## Static findings

- Root has 10 frames. Frame 1 calls `_level0.InternalPreloader.gotoAndPlay("jump_check")` and stops.
- Root frame 6 is labeled `begin`, stops, and places main sprite 53 at depth 1,
  character 54 at depth 64, title sprite 56 at depth 65, and character 57 at depth 67.
  Preserve all layers and their source transforms; a main-sprite-only export is insufficient.
- Sprite 53 has 342 frames, an empty action on frame 1 and `stop()` on frame 342.
  Its stream has 340 blocks, one on every frame 3–342. Sprite 56 has one frame.
- Stream header: MP3 compression code 2, rate code 2, mono, nominal sample count 1837,
  latencySeek 1673. No decoded-duration or playback-clock claim is made.
- Main sprite has 504 placement tags, 27 removals and three clip-depth placement tags.
  Source contains seven morph-shape definitions, one JPEG-with-alpha, four buttons,
  one embedded font definition and two static text definitions.
- Buttons 48–51 set `_global.KeyAttribute` to Coordinate, Graph, Equation and
  Inequality respectively, call `_root.DoHyperLinks()`, then stop
  `_root.animation_mc.animation`. They are placed at frames 249 and 338.
  Their full active windows still require display-list reconstruction; placements
  alone do not establish visibility throughout the interval.
- The separate catalog SA MP3 is a candidate dependency, not the embedded stream:
  `G6-G8-shared/ALG001/L12/SA/L12RW06.mp3`, catalog 214,704 bytes,
  SHA-256 `86fdbdeb0fec8cd6b9682d75ec436e4db370d56ba23e48efc47cf00c374c64bf`.
  This audit has not rehashed that MP3 or established its language/host trigger.

## Reproduction and evidence

Run from the implementation worktree:

```sh
node scripts/audit-g678-alg-l12-p006.mjs --check
python3 scripts/audit-g678-alg-l12-p006-structure.py --check
node skills/flash-to-js/scripts/validate_migration.mjs migrations/shared-alg001-l12-p006 --allow-draft
```

The extraction script's `--extract` mode refuses an existing output directory.
It pins physical source bytes and FFDec 26.2.1, records current tool help,
commands and output hashes, and verifies the source again after extraction.
`audit/ffdec-26.2.1/extraction-receipt.json` binds 22 extraction files.
The XML-library structural parser records per-frame placements, removals,
actions, sound-block hashes, sample counts and signed seeks in
`audit/source-structure-v1.json`. These remain structural evidence only.

## Next bounded implementation

Provisional advanced-manual/hybrid lane because host-owned glossary semantics,
masks, morphs and streaming audio require maintained behavior beyond raw export.
Before renderer work, finish the source-bound migration brief, inventories,
keyframes and root-reachable frame-domain dispositions; resolve glossary
dependencies; extract only the exact composed layers; then build a deterministic
visual candidate and separate glossary state machine. Do not import P005's
44.1 kHz sample schedule, symbol IDs, masks or title transforms.
Original host, audio timing/listening and strict acceptance remain independent holds.

## Coverage boundary

Independent catalog/private-registry recount this turn: 480/2,282 = 21.03418%,
1,802 unregistered placements. P006 is absent. This is membership coverage,
not revalidation of every historical admission and not full-goal completion.
