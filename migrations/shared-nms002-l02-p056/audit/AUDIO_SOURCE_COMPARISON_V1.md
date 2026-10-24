# P056 embedded stream versus same-stem SA — source/machine audit

This is a read-only machine comparison, not original-runtime listening or an
accepted product audio binding. The source files remain untouched.

## Exact inputs and method

- Real source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`
  (not the compatibility symlink).
- Teaching SWF: `G6-G8-shared/NMS002/L2/TS/L2TS03.swf`, SHA-256
  `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`.
- Same-stem SA: `G6-G8-shared/NMS002/L2/SA/L2TS03.mp3`, 171,024 bytes,
  SHA-256 `33b5c3c7e630cac092c25718e17a322c90a4a76f3aa31aa1167026847b14eb0a`.
- Reproduce with `HELP_MATH_G678_SOURCE_ROOT=<real-root> node
  scripts/audit-nms-l02-p056-source-audio.mjs`. The script verifies both hashes,
  reads the SWF with the workbench's direct tag parser, concatenates only MP3
  codec payloads after preserving each four-byte stream-block header separately,
  and decodes both complete original streams with FFmpeg 8.1.2. It does not cut
  encoded MP3 at silence or create a replacement asset. FFDec 26.2.1's normal
  `sound` export produced no file for this nested stream.
- Both decoded signals are mono at 22,050 Hz for the comparison; the SA's
  original MP3 is mono at 48,000 Hz and 112 kb/s. The script computes 220-sample
  RMS windows (9.977 ms) and searches every whole-SA offset inside the SWF
  stream with Pearson correlation. This is a fixed-time envelope check, not
  speech-content or time-warp equivalence testing.
- An independent `swfmill 0.3.6` XML export of the same SWF matched the prior
  audited XML SHA-256
  `622750694506d4498891795b79b22385f45dfe84d7693f27ef78cc977335b3da`.
  The workbench's separate XML stream extractor reproduced 230 blocks,
  422,208 header samples, 95,290 MP3 payload bytes, and the payload SHA-256
  below. The disposable XML stayed outside the repository under
  `/Volumes/American Dream/hudongpin/p056-audio-audit-lAp8qy`.

## Verified source facts

| Fact | Embedded SWF stream | Same-stem SA |
| --- | ---: | ---: |
| Original source | `sprite-24` `SoundStreamHead` | separate MP3 |
| MP3 stream blocks | 230, one at each sprite frame 5–234 | not applicable |
| Source sample rate | 22,050 Hz, mono | 48,000 Hz, mono |
| Decoded samples at 22,050 Hz | 422,208 | 269,363 |
| Decoded duration | 19.147755 s | 12.216009 s |

The MP3 payload assembled from the SWF blocks is 95,290 bytes, SHA-256
`6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811`.
The block headers sum to 422,208 decoded samples; the first block at frame 5
declares 3,456 samples, and the frame-6 block declares zero. Of the remaining
228 blocks, 185 declare 1,728 samples and 43 declare 2,304; each block's MP3
payload length matches its declared count for this exact source. Frame-block
presence alone does not establish how the original host handled decoder
latency, pause, seek, or Replay.

`scripts/build-nms-l02-p056-audio-blocks-v1.mjs` now reproduces a compact
source-locked block IR at
`packages/demos/src/generated/nms-l02-p056-audio-blocks-v1.ts` (SHA-256
`3fc7f5eeca2f785ca1b3ff259e321e468fa36329c94026aea925dc768a3464cc`).
The pure `p056SourceAudioBlock(frame)` projection reports each teaching frame's
declared block samples and cumulative declared counts. Regeneration is
read-only with `--check`, and `--write` uses exclusive creation. The metadata
and pure function are **not** an audio transport: no encoded asset is bundled,
no decoder latency correction is chosen, and no browser pause/Replay clock has
been established.

The best whole-SA envelope alignment inside the SWF stream was correlation
`0.2013308847` at offset `6.804535` seconds. The files differ in bytes,
rate, duration, and fixed-offset envelope. This **rejects treating the SA as a
demonstrated byte/PCM/timing-equivalent substitute**; it does not prove that
they share no spoken words or that either is the correct product track.

`audio-inventory.csv` now records the embedded stream as an `und` (unknown
language), source-structural cue at sprite frame 5. It does not assert English
or Spanish narration. The migration manifest retains no accepted language cue
or product transport. Natural original-host timing, spoken content, EN/ES
mapping, decoded-stream synchronization, Replay, and named-human listening
remain open before audio acceptance or Current-JS admission.

## Subsequent local ASR lead

`ASR_SOURCE_LANGUAGE_V1.md` records a 2026-09-24 local, hash-bound machine
transcription of the complete extracted SWF stream and the complete same-stem
SA file. The model labels the SWF stream English and the SA Spanish; both
transcripts describe the same step-2 teaching prompts in their respective
languages. This is stronger content-routing evidence than a fixed waveform
correlation alone, but it is an **ASR hypothesis**, not a human listening
decision or proof that the original host selected either file. The earlier
non-equivalence result remains valid: do not replace one recording with the
other as byte-, PCM-, or timing-equivalent audio.
