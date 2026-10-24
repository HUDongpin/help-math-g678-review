# DAT001 L2 P002 embedded source-stream audit — 2026-09-25

This is source custody and decoder evidence for the unregistered local
candidate. It is **not** an audio playback, synchronization, language, or
listening-acceptance record.

- Physical source: `G6-G8-shared/DAT001/L2/RW/L2RW02.swf`, SHA-256
  `b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.
  The source root is a real AWS directory, not the compatibility symlink.
- Reproducible source XML: `movie.xml`, SHA-256
  `1d0d14c87f96f7a501311833a90ee50257f392129bb068fb3c27fb6800cce02a`.
  Its sprite 113 has one MP3 `SoundStreamHead` (22,050 Hz, mono,
  `latencySeek=1680`) and 276 ordered `SoundStreamBlock` tags over its 276
  parent frames. The second block has zero samples and no MP3 payload.
- `scripts/build-g678-dat-l02-p002-source-stream-audio.py --check`
  re-extracts the physical SWF, checks the pinned XML and display IR, verifies
  every block header/payload/offset, and checks the exact output files. Its
  `--write` path uses exclusive file creation. Three generator regression
  tests pass, including non-overwrite and nonphysical/wrong-hash rejection.
- Whole encoded stream: `source-stream-audio-v1.mp3`, 68,562 bytes,
  SHA-256 `3b3f98778ff20ab738989560ddade4b28f065dc09dade6c4477afdce708c4536`;
  879 consecutive MPEG Layer III frames. The per-block and aggregate manifest
  is `source-stream-audio-v1.json`, SHA-256
  `616dc18e2cb799327355bcf93f75c3b0c4b441657b8d095455ad609f1dfad18f`.
- FFmpeg 8.1.2 decoded the **entire** encoded stream in one pass to
  `source-stream-decoded-v1.wav`: 22,050 Hz, mono PCM16, 506,304 samples,
  22.961633 seconds, 1,012,686 bytes, SHA-256
  `dc8fc07f7066b76e781bab37cb09f5232bb3f3ac98c8690104d8acf1dcee9f8c`.
  This avoids splitting encoded MP3 at individual SWF blocks.

The parent has 276 frames at 12 fps (23 seconds). `ffprobe` reports only
22.854 seconds for the bare MP3 container-less file, while the decoded-sample
duration is 22.961633 seconds. The MP3 duration estimate is **not** a
source-clock or browser-seek authority. FFDec's ordinary sound export emitted
no file for this embedded stream; that observation does not imply silence.

Open gates: original-host stream entry and stop behavior, child-timeline
progression, synchronized local playback, language classification, named-human
listening against the original runtime, EN/ES teaching treatment, and My
Lesson integration. A distinct cataloged same-stem lesson-SA candidate is now
recorded separately in `audio-inventory.csv`; see `SOURCE_AUDIO_CROSSWALK_V1.md`.
The local player still exercises only the embedded stream. No Current-JS
registration or audio acceptance follows from this audit.
