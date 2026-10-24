# P005 MP3 timing diagnostic — 2026-09-26

## Scope and bound inputs

This is a machine timing diagnostic for `shared-alg001-l12-p005`, sprite 391. It reads the existing `audio-source-v1/machine-timing-receipt.json` (SHA-256 `c193f9856de277227e8ee6dbe3c97d714863c701398bc98854276e94baa4b639`) and extracted `sprite-391-source-stream.mp3` (597,584 bytes, SHA-256 `988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`). The receipt binds the preserved `L12RW05.swf` SHA-256 `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`. The existing extraction script concatenates MP3 payloads in source block order after removing each four-byte SWF SoundStreamBlock header; it does not insert timeline time. Neither source nor extraction receipt was changed.

Reproduce with `node scripts/analyze-g678-alg-l12-p005-mp3-timing.mjs --check` and `node --test scripts/analyze-g678-alg-l12-p005-mp3-timing.test.mjs`. The script rejects input hash drift, scans each bounded MP3 block for complete MPEG-1 Layer III frames, reconciles each block's frame count with its SWF sample header, and asks ffprobe for decoded frame sample counts. It holds only the 598 KB MP3 and small metadata in memory; it does not persist PCM or play audio. The compact result is `audio-source-v1/timing-analysis-v1.json`.

## 75.0498 seconds versus 74.698 seconds

- The 902 SWF block headers total **3,309,696 samples** at 44,100 Hz: **75.049795918 seconds**. Their distribution is 727 blocks of 3,456 samples, 173 of 4,608, and two zero-sample blocks.
- The extracted payload contains **2,873 complete MPEG-1 Layer III frames**, each 1,152 samples and exactly 208 bytes. Per-block MP3 frame samples match all 902 SWF headers. ffprobe's frame decode enumeration also returns **2,873 frames / 3,309,696 samples**. This independently supports the sample-count duration of the concatenated encoded payload.
- The MP3 headers declare a nominal bitrate of 64,000 bit/s, but every frame is unpadded at 208 bytes. At 44,100 Hz this file's effective average is **63,700 bit/s**. The 74.698-second ffprobe stream/format duration equals `597584 × 8 ÷ 64000`; it is a byte-count/nominal-bitrate estimate, **0.351795918 seconds shorter** than the decoded-sample duration. This is a metadata estimation discrepancy; decoded samples match the source header sum.

## Frames 340–383

The source receipt groups SoundStreamBlock tags on local frames 23–339 (317 tags, 1,006 MP3 frames, 1,158,912 samples, 209,248 payload bytes) and 384–968 (585 tags, 1,867 MP3 frames, 2,150,784 samples, 388,336 payload bytes). **No SoundStreamBlock tag occurs on frames 340–383**, a 44-frame span or 3.666666667 seconds at the sprite's nominal 12 fps. Frame 339 has a zero-sample, zero-payload block with a signed seek value of `-4080`; frame 384 resumes with a 4,608-sample, 832-byte block at payload offset 209,248. In the extracted MP3, that first byte at offset 209,248 follows the earlier group's last byte directly. The file therefore has no encoded 44-frame pause inserted by extraction.

The gap's audible meaning and original-host clock behavior remain open. The negative seek header is recorded as source data, not interpreted here as a stop, silence, trim, or restart command. The concatenated MP3 alone cannot establish whether the Flash host pauses, emits silence, retains prior audio, or restarts with decoder state at frame 384. The separate lesson-SA candidate's trigger and relation to this stream also remain unverified. No original-runtime listening, language, synchronization, audio acceptance, Current-JS registration, human/Owner decision, or release claim follows from this diagnostic.
