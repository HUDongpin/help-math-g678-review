# ALG001 L12 P002 — bounded source audit

Status: source-structure audit only. No Current-JS registration, original-runtime
baseline, audio acceptance, or migration completion is claimed.

## Identity and custody

- Placement: `shared-alg001-l12-p002`, second active page of ALG001 lesson 12,
  `RW/L12RW02.swf` (catalog title `Page 1`).
- Physical source: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW02.swf`;
  1,802,335 bytes; SHA-256 `15e67732b739f0194087ded0748c2d23f9871363ed33388807c351f2aad6fb62`.
  The source root is a real directory, not a symlink. The catalog has no bound
  FLA for this placement.
- Lesson XML `G6-G8-shared/ALG001/L12/index.xml` SHA-256
  `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`.
- Catalog-listed lesson-SA MP3 `SA/L12RW02.mp3` exists with SHA-256
  `cad83108fed08731582e639c0ef8c5886a5c56dab710c277c639cc0603c0fcf3`.
  Its host trigger, language, and synchronization remain unverified.

## Structural evidence

- `swfmill 0.3.6` extraction `audit/movie.xml` SHA-256
  `9332ec48d2a17395e7d37c593b5336aa47bb0a821ba135fb3e350d425af19aee`:
  CWS v6, 800 × 600, 12 fps, 10 root frames, background RGB 184/216/247.
- Root frame 1 has a preloader navigation action. Root frame 6 is labeled
  `begin` and has `stop()`. It places main sprite 454 at depth 1 and title
  sprite 458 at depth 147. Both are root-reachable and must be composed;
  drawing sprite 454 alone omits source title content.
- Sprite 454 has 1,951 frames, with `stop()` on frame 1,951 and 1,927
  `SoundStreamBlock` tags under one `SoundStreamHead`. FFDec ActionScript
  extraction has only four script records: root frames 1/6 and sprite 454
  frames 1/1,951. The SWF defines no `DefineButton`/`DefineButton2`.
- Sprite 454 places nested sprites 43 (22 frames), 389 (36), 449 (19), and
  451 (36). Sprite 458 is a separate one-frame title layer containing text
  `Graphing in the Coordinate Plane: Real World Activity`. Its presence
  means a single-sprite source-static adapter is insufficient without an
  additional source-bound layer.
- `JPEXS FFDec 26.2.1` text/script and Canvas exports are under
  `audit/ffdec-26.2.1-source-v1/` and `audit/ffdec-26.2.1-canvas-v1/`.
  Main sprite 454 Canvas `frames.html` has all 1,951 viewer frames, 23,688,634
  bytes, SHA-256 `7936b06cd3de8afdd00c4af8631634e8bbe2bb6397137b3f2acb61f10c03cc21`.
  Its 52,872-byte `canvas.js` helper SHA-256 is
  `78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93`.
  The large export is source-structure evidence, not product/Flash parity.

## Decision and next dependency

This placement is **not safe to register using the one-sprite ALG L12 P001
adapter**: that would lose the separate source title layer. A maintained
two-layer composition needs native-stage frame/Replay checks and browser
inspection before admission. The source-embedded stream and catalog MP3 also
need separate transport, timing, and listening investigation. The 1,951-frame
timeline is not evidence that narration is accepted or that its 162.6-second
nominal length is the authoritative original-runtime duration.

This audit preserves P002 as an unregistered `interactive-understood` candidate.
Original-runtime visual/behavior comparison, audio acceptance, human/Owner
review, strict completion, release, and publication remain open.
