# P054 whole-stream MP3 extraction — 2026-09-24

This is source-bound machine evidence, not original-runtime listening,
language identification, synchronized playback, or audio acceptance.

- Source: `G6-G8-shared/NMS002/L2/GS/L2GS03.swf`, 2,077,270 bytes, SHA-256
  `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`.
  The exact real non-symlink source root is required. The independently frozen
  swfmill XML SHA-256 is
  `2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46`.
- Reproducer: `scripts/extract-nms-l02-p054-audio-v1.py --check` with
  `HELP_MATH_G678_SOURCE_ROOT` set to the real source directory. It scans the
  original SWF tags, keeps every SoundStreamBlock's frame/sample/seek and raw
  hash, concatenates only the MP3 payloads in source order, decodes each whole
  stream with FFmpeg 8.1.2 to 22,050-Hz mono signed 16-bit PCM, and checks the
  output byte-for-byte. It never cuts the encoded stream at silence.
- External evidence directory (outside the app and Git):
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-audio-streams-v1`.
  `stream-manifest-v1.json` SHA-256 is
  `fd31b5e1208eaf54ef3c14fd28d55d61b2fdb3fc47d7b1f41a097d7e40d2dca0`.
  The manifest contains 266 per-block records and all four encoded/decoded
  hashes; the four extracted MP3s total 109,850 bytes.

| Source sprite | Static context | Block frames | Blocks | MP3 SHA-256 | Decoded samples / machine duration |
| ---: | --- | ---: | ---: | --- | ---: |
| 194 | correct-feedback child | 2–27 | 26 | `d34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4` | 47,232 / 2,142 ms |
| 208 | wrong-feedback child | 3–31 | 29 | `2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77` | 52,992 / 2,403 ms |
| 648 | controller frame-3 result sprite | 16–121 | 106 | `8abef80d08039f553b4220d52216dfae8ee6f6ca8dade3770269a94945f646b5` | 194,112 / 8,803 ms |
| 729 | controller frame-5 result sprite | 14–118 | 105 | `86bffb4656c404f53f87bda2060ba8f3817ba79b68dc1cecb25809aeb9fc58ff` | 192,384 / 8,725 ms |

All four stream heads carry MP3 compression, 22,050-Hz mono, and a 1,673-sample
latency/seek field. Each stream has one empty-MP3-payload block immediately
after its first populated block. The sum of SWF block sample counts equals
the whole-stream decoded PCM sample count in each case. This is a consistency
check, not a verified formula for the audible onset or frame-perfect sync.
An independent `ffprobe` pass recognizes all four files as 22,050-Hz mono MP3.
Its encoded-stream duration estimates differ slightly from the PCM-sample
durations tabulated above; the inventory uses the latter and does not infer
natural playback length from either measure.

The original host's path to each result sprite, audible content/language,
start/stop/Replay semantics, and named-human listening are still open. Source
sprite 731's level frames 2 and 4 place `Mc_Feed2` as sprite 194 and
`Mc_Feed1` as sprite 208; the card release scripts call the former after a
correct second pick and the latter after a wrong second pick. The unregistered
local board candidate now fetches those two MP3s through a loopback-only,
same-origin, hash-checked route and plays them on those two feedback events.
Only that opted-in local page permits Blob media in its CSP. Browser transport
was exercised, including a failed-load/retry path, but no original-runtime
synchronization, audible-content comparison, or human listening acceptance was
performed. No audio file was added to the product bundle, and neither cue is
accepted for My Lesson.

The earlier frozen `audio-structure-v1.json` remains an immutable structural
snapshot. Its statement that embedded MP3s had not been decoded is historical;
this successor resolves machine decodability only, not any listening or
acceptance gate.
