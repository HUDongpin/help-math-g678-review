# P056 sprite-24 source display-list IR — 2026-09-24

Authority: static tags extracted from the exact shipped SWF. This is a
reproducible engineering input, not an original-runtime trace, rendered
animation, audio decision, or Current-JS admission.

- Source `G6-G8-shared/NMS002/L2/TS/L2TS03.swf`: 100,959 bytes, SHA-256
  `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`.
- `swfmill 0.3.6` XML SHA-256:
  `622750694506d4498891795b79b22385f45dfe84d7693f27ef78cc977335b3da`.
  The root places sprite 24 named `animation` at depth 2 on root frame 6,
  translated by `(8248, 5666)` twips. The nested sprite has 234 frames.
- `scripts/build-nms-l02-p056-display-list-v1.mjs` requires the real,
  non-symlink AWS source root, verifies those bytes, and emits the compact
  event IR at `packages/demos/src/generated/nms-l02-p056-display-list-v1.ts`.
  `--write` uses exclusive creation; `--check` regenerates and compares bytes.
  The generated file is 22,706 bytes, SHA-256
  `2b61da7bdae96ce18c5a859d18b5255e32ddada3ef28aa5e8552e1fa54cfdb01`.
- The IR records 26 placements, 76 updates, and 6 removals across 234
  `ShowFrame` tags. It preserves source character kind, depth, local matrix,
  alpha factor, and a hash of each placement/update tag. Sprite 24 also has
  230 `SoundStreamBlock` tags; the IR intentionally does not decode or schedule
  them as accepted audio.
- `p056SourceSpriteFrame(frame)` in
  `packages/demos/src/timelines/shared-nms002-l02-p056-display-list.ts`
  projects every one-indexed teaching frame without mutable playhead state.
  At frames 32/34/36 text 18 is placed for one frame; at 42/44/46 text 19
  is placed for one frame. Text 20 enters at frame 102 and reaches full alpha
  at frame 111. Text 22 enters at frame 154 and reaches full alpha at frame
  163. These are display-list facts, not a claim that their glyphs, fonts,
  timing, or reading order match an authorized original runtime.

The IR covers the direct sprite-24 display list, not all child symbol drawing,
static text glyph geometry, embedded MP3 decoding, host-owned `DoHyperLinks`,
actual click reachability, pause/resume, or Replay. The 10-frame root and
234-frame teaching sprite remain separate. No renderer, registry, descriptor,
My Lesson route, original-runtime capture, full-frame comparison, listening
acceptance, human/Owner decision, strict completion, or publication is created.
