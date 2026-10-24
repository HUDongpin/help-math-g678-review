# P056 local source-audio transcription lead — 2026-09-24

This is a local machine-audit lead, **not** original-runtime listening, an
accepted translation, product audio routing, synchronization, or a human/Owner
decision. Neither recording was cut at silence or replaced with synthesized
audio.

## Hash-bound inputs and reproducibility

| Input | Source and current SHA-256 | Machine result |
| --- | --- | --- |
| SWF embedded stream | `L2TS03.swf` SHA-256 `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`; extracted 95,290-byte original MP3 payload SHA-256 `6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811` | `en` |
| Same-stem lesson SA | `G6-G8-shared/NMS002/L2/SA/L2TS03.mp3`, 171,024 bytes, SHA-256 `33b5c3c7e630cac092c25718e17a322c90a4a76f3aa31aa1167026847b14eb0a` | `es` |

The extracted stream is `embedded-source-stream-v1.mp3`, generated only from
the exact real source directory by
`scripts/extract-nms-l02-p056-source-stream-v1.mjs --write`; `--check`
regenerates and compares bytes without replacement. The generator verifies the
SWF and payload hashes, 230 SoundStreamBlocks at sprite frames 5–234, mono
22,050 Hz, and 422,208 declared samples. Its no-overwrite regression passed.
The MP3 is private source evidence, not a production asset or accepted track.

Both complete MP3s were transcribed locally with `whisper.cpp` CLI 1.9.2,
`ggml-small.bin` SHA-256
`1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b`,
automatic language detection, and JSON/text output (`-l auto -oj -otxt -np`).
No remote transcription service was used. Retained machine outputs are:

| Output | SHA-256 |
| --- | --- |
| `embedded-source-asr-v1.json` | `0dda4338d16a444cad97dd150de40f075dd7b31026729b15227014862c8ad352` |
| `embedded-source-asr-v1.txt` | `8e83052dc591cb949703139279023c6be9d84e8a456175b80e833e864ab1fc90` |
| `lesson-sa-asr-v1.json` | `7cf1fe213d184077e627f44dc2255954aa751493a8f6e4126e951e93f471b144` |
| `lesson-sa-asr-v1.txt` | `2c98cfaf54db7044a7502d833f9517fc70679b0e23d29545d80ce44a30ec2e3f` |

## What the machine results suggest

The English-labelled embedded transcript describes organizing the given
information, then asks what information the learner has and needs, then says
to write it in box two. Its four segment boundaries are approximately
0–6.6, 6.6–11.5, 11.5–16.0, and 16.0–19.0 seconds. The Spanish-labelled SA
transcript expresses the same instructional sequence in three shorter
segments, approximately 0–4.62, 4.62–9.66, and 9.66–12.16 seconds. These
appear to be **different-language narrations of the same teaching beat**, an
inference from imperfect ASR rather than a source-host selection finding.

The source visual introduces the two question strings at sprite frames 102
and 154 (about 8.42 and 12.75 seconds from frame 1 at 12 fps). Those times
overlap the corresponding English ASR segments after allowing for the embedded
stream's first block at frame 5. This is a coarse consistency check only; it
does not calibrate decoder latency, determine the exact host clock, or prove
that a learner actually hears either track in sync. The prior low fixed-offset
waveform correlation is not a contradiction: recordings in different languages
need not have matching envelopes or duration.

In particular, the Spanish ASR segment mentioning both questions ends near
9.66 seconds, whereas the source visual does not introduce the second question
until frame 154 (about 12.75 seconds). Therefore simply starting the SA file
alongside the unchanged 12-fps sprite would not establish Spanish audio/visual
coordination; the original host's language-specific schedule or separate
playback behavior must be observed before product routing.

Next evidence needed: an authorized original-host natural trace showing which
file is selected in each language, source-timed pause/Resume/Replay behavior,
exact product transport from the selected bytes, and named-human listening.
Keep `audio-inventory.csv` at `und` and `migration.json` without accepted
language tracks until those separate gates are satisfied. Do not borrow the
SA as an English equivalent or promote the machine transcript into approved
Spanish page copy.
