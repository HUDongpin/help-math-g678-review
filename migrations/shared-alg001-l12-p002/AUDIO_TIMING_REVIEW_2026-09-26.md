# ALG001 L12 P002 — source audio timing review

Status: reproducible structural/decoder audit only. The composed P002 candidate remains silent and unregistered. This review does not establish original-runtime playback, narration language, synchronization, listening acceptance, or product admission.

## Reproduce and inspect

From `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`:

```sh
node --check scripts/audit-g678-alg-l12-p002-audio-timing.mjs
node scripts/audit-g678-alg-l12-p002-audio-timing.mjs --self-test
node scripts/audit-g678-alg-l12-p002-audio-timing.mjs --check
```

The one-time `--write` mode creates, without replacing files, `audit/audio-timing-v1/timing-summary.json` and `audit/audio-timing-v1/frame-ledger.csv`. It reads the physical preserved SWF and separate SA MP3 from the real AWS courseware root and checks their SHA-256 hashes. It also pins the existing `candidate/audio-identification.json`. The script parses the compressed SWF tags and every MPEG-2 Layer III packet in each SoundStreamBlock, then passes only in-memory payloads to local ffprobe/ffmpeg. It does not call a service, transcribe, play audio, or write extracted audio/PCM files. The earlier `prepare-g678-terminal-source-v1.mjs` stream extractor was used read-only to inspect block/header values and independently cross-check the new parser; its preparation command was not run.

Source SWF `RW/L12RW02.swf`: 1,802,335 bytes, SHA-256 `15e67732b739f0194087ded0748c2d23f9871363ed33388807c351f2aad6fb62`. Separate `SA/L12RW02.mp3`: 478,128 bytes, SHA-256 `cad83108fed08731582e639c0ef8c5886a5c56dab710c277c639cc0603c0fcf3`. Source is CWS with a 12 fps root; the stream is in 1,951-frame sprite 454, not on the ten-frame root timeline. Its sole SoundStreamHead is MP3, 22,050 Hz mono, with `sampleSize=1837` and signed `latencySeek=1673` samples.

## Timing ledger findings

| Sprite frames | Block tags | Parsed MP3 frames | Declared/decoded samples | Coded sample span | Boundary |
| --- | ---: | ---: | ---: | ---: | --- |
| 1–415 | 415 | 1,320 | 760,320 | 34.482 s | Frame 415: empty block, seek −1,870 |
| 416–434 | 0 | 0 | 0 in tags | 19 frame slots, 1.583 s nominal | No SoundStreamBlock tags |
| 435–1115 | 681 | 2,169 | 1,249,344 | 56.660 s | Frame 1115: empty block, seek −2,138 |
| 1116–1120 | 0 | 0 | 0 in tags | 5 frame slots, 0.417 s nominal | No SoundStreamBlock tags |
| 1121–1951 | 831 | 2,647 | 1,524,672 | 69.146 s | Final sprite frame 1951 |

There are 1,927 SoundStreamBlock tags across the three windows. The 797,680 MP3 payload bytes hash to `f59bba9bf36633b0b6d385fa12370984bdf1b854833db08bea6bb5ccf1dc1930`, matching the existing identification record. Each nonempty block's `SampleCount` matches the parsed MP3 packet count at 576 samples per packet. In each window, ffprobe identifies 22,050 Hz mono MP3, and ffmpeg's full local decode emits exactly the declared sample count: 760,320, 1,249,344, and 1,524,672. Together the packets encode 3,534,336 samples, or 160.287 s at 22,050 Hz. The sprite's nominal 1,951/12-frame span is 162.583 s. The difference is not an accepted silence, seek, or playback-duration calculation.

Four frames carry zero-byte, zero-sample blocks: 2, 415, 1115, and 1839. Frames 415 and 1115 also carry the signed negative seek markers immediately before the no-block spans. Frames 416–434 and 1116–1120 are actual missing stream-tag spans while the sprite timeline continues; neither span has a second SoundStreamHead. This supports preserving three source packet windows and two distinct gaps in an implementation plan. It does **not** establish whether the Flash player produced silence, held decoder output, trimmed samples, or restarted a stream at those transitions. The negative values are source values, not an independently verified rule for trimming or offsetting playback.

The separate SA MP3 probes as 48,000 Hz mono. Local ffmpeg decoded 1,639,296 samples (34.152 s), and its bytes differ from the embedded stream. The similar scale of this duration to the first embedded window is only an observation; this audit did not establish shared content, language, host trigger, or whether SA replaces or overlays the stream.

## Small, safe next implementation slice

Keep the P002 candidate silent for now. A later maintained audio plan can bind the three packet-window hashes to sprite frames 1, 435, and 1121, while carrying the two no-block spans and signed seek markers as unresolved metadata. Before enabling playback, compare the actual original-runtime transitions around 414–435 and 1114–1121, plus the empty block at 1839, under a hash-bound listening/transport protocol. Resolve the separate SA file's host trigger and relationship independently. Then test frame seek, pause/resume, replay, and boundary behavior in the composed two-layer candidate without silently joining all packets into one continuous product track. This is a proposed sequence, not an audio acceptance decision.

## Evidence and limits

- Script: `scripts/audit-g678-alg-l12-p002-audio-timing.mjs`, SHA-256 `8e4b0e30384bc37761d22dafba8616f223f74dcbc7b0f48201054e163ce24d6e`.
- Summary: `audit/audio-timing-v1/timing-summary.json`, SHA-256 `855d9c1ca45fee688acac4abac2bfa0a518fa395cac5fbf5abe31f29d81394d5`.
- Per-frame ledger: `audit/audio-timing-v1/frame-ledger.csv`, 1,951 data rows, SHA-256 `d2ddffff618adf8eea4203e986eb16b5dafe336e5cce7ff48708b63d3e6614a5`.
- Local tools: ffprobe and ffmpeg 8.1.2. `node --check`, `--self-test`, initial `--write`, and independent `--check` passed after making ffprobe read the complete input with `-count_frames`. No source archive, shared registry, generated registry, Next build, port, or provider state was changed.
