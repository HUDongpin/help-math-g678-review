# P009 embedded MP3 stream technical analysis — 2026-09-27

Status: source-bound structural analysis and actual machine decode only. This
analysis enables no product audio and grants no language, synchronization,
original-runtime, listening, human/Owner, registration, strict or publication gate.
The independent SA sidecar remains separate and was not decoded or concatenated.

## Exact source and reproducible outputs

Worktree: `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`.

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| Physical `ALG001/L12/VB/L12VB04.swf` | 165,405 | `d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533` |
| `audit/source-stream-blocks.json` | 236,488 | `cc20000fdef998ecd62aac8454f8f1edf0e9ad8c5595140e9899354256036c4a` |
| `audit/source-stream.mp3` | 162,890 | `15e60f13aad0e2187db0b32f6bcfe65151001a1ded336abd4fb4eb59b3014f2e` |
| Physical `ALG001/L12/SA/L12VB04.mp3` | 325,584 | `3ccbe37ecfabff0506ef3daafc7db4b9fd8b770f0baefd6a70efeaaa27ca6fd4` |

Both physical paths are under the actual
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared`
source tree. The SWF real path, regular-file/single-link identity and stable reads
were checked. No source, source audit, inventory, P005/P006 file, host, registry
or audio acceptance record was changed.

The maintained analyzer is `scripts/analyze-g678-alg-l12-p009-stream.mjs`;
its tests are the adjacent `.test.mjs`. It independently inflates the exact CWS,
walks root/main raw tags, verifies every recorded stream block against source
offsets and hashes, and reconstructs a byte-identical MP3. It then parses every
whole MP3 header and records actual FFprobe packets/decoded frames plus complete
untrimmed FFmpeg PCM under `audio-analysis-v1/`.

`audio-analysis-v1/analysis.json` is 11,426 bytes, SHA-256
`6547b52ae7e12e7ff7b2bb0ff190ab233a552dc68eda056869df015d26c883fd`.
It pins all eight supporting generated artifacts. The final technical receipt
also binds the analyzer, tests, this report, tools and the complete output closure.

## Header, blocks and actual decode

The page is CWS/SWF6, root 10, 12 fps; main `sprite-62` has 394 frames. Main frame 1
contains one MP3 stream head, raw `0a2a2d078906`: mono 22,050 Hz, 16-bit advisory
playback/stream declarations, nominal 1,837 samples/frame, latency seek 1,673.
Its first stream block is frame 2. Frames 2–394 contain393 blocks; the only empty
payload is frame 3, raw wrapper `00000000`, count 0 / seek 0/no MP3 bytes.

Direct MP3 parsing found exactly **1,253 contiguous MPEG-2 Layer III frames**:
130 bytes/frame, 576 samples/frame, 40 kbps header bitrate, mono 22,050 Hz, no CRC
or padding slots. The source wrappers count 0 / 1,728 / 2,304 / 3,456 samples, matching
0/3/4/6 whole MP3 frames in every block. The sum is 721,728 samples.
FFprobe independently found the same 1,253 packets and decoded frames; packet
positions/sizes and decoded `nb_samples` match the raw parser. No byte resync,
unaccounted prefix/trailer or discarded partial frame was allowed.

Of the 1,253 MP3 frames, **1,252 have a nonzero `main_data_begin`**, maximum 255
bytes. This is direct bit-reservoir dependency evidence. Preserve one continuous
decode; independently decoding each SWF block would lose decoder history and
requires separate proof. There was no `ID3`, `Xing`, `Info`, `LAME` or `VBRI`
byte marker anywhere in this stream. FFprobe reports initial padding 0 and no
packet/frame side-data entries. These observations do not establish all possible
encoder metadata or prove an audible start/end boundary.

Actual FFmpeg output is full mono f32le at native 22,050 Hz:

- **721,728 samples**, **2,886,912 bytes**, **32.73142857142857 seconds**.
- PCM SHA-256: `cb2025b6d5364dcc54bedd573bf51ae64489d9e377c5b94d5df96d1c0b204a2c`.
- Peak 0.6026901006698608; RMS 0.07085266568381486; all samples finite.
- No trimming, inserted silence, resampling, normalization, re-encoding or retime.

FFprobe's format duration is 32.578 seconds. It precisely matches the byte-rate
estimate `162890 × 8 / 40000`, and is 153.428571 ms shorter than actual decoded
sample duration. Use actual PCM length and frame `nb_samples` for technical
duration. Do not drive an audio end boundary from that format estimate.

## Continuous playback and authored seek arithmetic

The inspected original [Adobe SWF File Format Specification v19](https://open-flash.github.io/mirrors/swf-spec-19.pdf)
describes continuous MP3 playback at the natural sample rate with read-ahead,
and treats per-block seeks separately. It permits a zero-count/zero-seek/no-data
block and describes initial latency handling. Its MP3 headers determine whole
frame sizes. These format rules support preserving the concatenated stream;
they are not a P009 player trace or authorization of a seek-offset formula.
Relevant printed pages 185–186 and 190–191 were checked, including their tables.

For byte-level comparison, retain the raw arithmetic
`decodedPrefix + signed SeekSamples` separately from any runtime schedule.
Every nonempty block in P009 satisfies this observed equation:

```text
raw prefix+seek = 1673 + (nonempty block ordinal - 1) × 1837
```

There are 392 nonempty blocks. Ordinary frames 4–394 have 390 adjacent increments,
all exactly 1,837. The first nonempty transition, frame 2→4, also adds 1,837 raw
samples, while the actual12 fps timeline advances 3,675 samples. Frame3 has no
independent decoded-prefix/seek playback coordinate. An empty source payload
does not authorize generating a silent interval or a new audio run.

At22,050 Hz/12 fps, real elapsed time is **1,837.5 samples/frame**, unlike the
authored integer1,837 recurrence. Stretching to 1,837 or periodically jumping to
the raw seek map would change continuous natural-rate playback. Neither is
admitted here. Original Flash seeking also has decoder priming and initial
latency rules; do not assume those map directly to an offset in a buffer decoded
continuously from byte0.

The latest P006 continuous schedule and correction report were rehashed and
read as a comparison. The continuous/no-artificial-gap rule applies here, but
P006's first block is frame 3, its main is 342 and it has a terminal `stop()`;
P009 starts at frame 2, is 394 frames and has no main DoAction/DoInitAction/DoABC.
No P006 onset, decoded end or terminal handler was copied.

## Initial latency and terminal tail: measured versus inferred

The source head latency and first-block seek both say 1,673; they are the same
startup annotation, not two startup skips. In this FFmpeg full decode, samples
`[0,1673)` are exactly zero. The first exactly nonzero sample is 1,729, so skipping
1,673 once would retain 56 more exactly zero samples. That is a numerical decode
observation, not a measured codec-delay specification or first spoken syllable.

If a later private implementation deliberately chooses all of the following
modern policies, the resulting arithmetic is deterministic:

1. Start continuous source playback at the first block's main-frame 2 time.
2. Skip 1,673 source samples once and retain the full remaining buffer.
3. Advance the single host clock at exactly 22,050 Hz and 12 fps, through the empty
   source block without a synthetic gap.
4. Hold at the **start** of main frame 394. This is a modern terminal policy;
   the source has no main terminal stop action. A full-frame hold, looping or
   original host end behavior would require another explicitly reviewed policy.

```text
timeline start = (2 - 1) × 22050 / 12 = 1837.5
source span   = [1673, 721728)
audio end     = 1837.5 + 721728 - 1673 = 721892.5
frame 394 start= (394 - 1) × 22050 / 12 = 722137.5
postroll      = 722137.5 - 721892.5 = 245 samples = 11.111111 ms
```

This is an explicit candidate model, **not an implemented or accepted schedule**.
Under it, frame 3 uses continuous source coordinates `[3510.5,5348)`. The integer
measurement window `[3511,5348)` contains 1,837 nonzero samples, peak 0.383594811,
RMS 0.082331699. The source-empty block therefore cannot be used to create silence
in that chosen continuous decode window. Fractional boundaries remain fractional
in a future transport; rounding here is only for numerical window measurement.

The last source block, frame 394, contains 2,304 decoded samples with seek 516 and
prefix 719,424. Distinct arithmetic models produce distinct tail lengths:

| Model | Source coordinate at frame 394 | Decoded samples remaining |
| --- | ---: | ---: |
| Raw prefix+seek only | 719,940 | 1,788 |
| Raw coordinate plus one extra head latency, arithmetic only | 721,613 | 115 |
| Chosen continuous candidate from frame 2 | 721,973 | −245: buffer ended earlier |

The extra-latency row illustrates a different arithmetic treatment; it does not
validate a full-buffer Flash seek algorithm. The continuous/raw difference is
2,033 samples at 394, including the initial empty-block/placement discrepancy and
the 0.5 sample/frame mismatch. Do not substitute these models for one another.

All 2,304 samples of the last source block are numerically nonzero; peak 0.001824607,
RMS 0.000576074. The 1,788-sample raw-coordinate tail is also entirely nonzero.
Even the 115-sample extra-latency tail is entirely nonzero, peak 0.0000871003,
RMS 0.0000368228. Low energy does not prove approved silence or justify trimming.
Natural host onset, original-player frame dropping/seek priming, looping/end
causality and instructional alignment remain pending.

## Tool identity and validation

FFmpeg and FFprobe are version 8.1.2 from the actual
`/opt/homebrew/Cellar/ffmpeg/8.1.2_1/bin` directory:

| Executable | Bytes | SHA-256 |
| --- | ---: | --- |
| ffmpeg | 426,224 | `dad4b30b36a1a999bfa4b6ffbde138bd17ee496c69e12eef638227dff2c6415c` |
| ffprobe | 236,912 | `cfeefcc9207eb3fa424679228fe3848db2921b15537d26c1ccc4a7a61de95d00` |

`audio-analysis-v1/tool-versions.json` retains both complete version outputs,
version-output hashes and the seven actual FFmpeg core shared-library hashes.
Its SHA-256 is `9c0b72a8e26c99bd83d432128c6aeff2784d3b5ea571abcd382f170315488364`.
Decode command, using only the pinned encoded bytes on stdin:

```text
ffmpeg -v error -nostdin -xerror -f mp3 -i pipe:0 -map 0:a:0 -c:a pcm_f32le -f f32le pipe:1
```

Reproduce/verify from the worktree:

```text
node scripts/analyze-g678-alg-l12-p009-stream.mjs
node scripts/analyze-g678-alg-l12-p009-stream.mjs --check
node --test scripts/analyze-g678-alg-l12-p009-stream.test.mjs
```

The final six tests pass: actual physical-source reconstruction; MP3/header/count
and reservoir evidence; empty-block versus continuous/raw timing; fail-closed
truncated/reserved/fragmented/count-error cases; finite PCM measurement; and
actual FFmpeg/FFprobe read-only regeneration of every frozen output. Both scripts
also pass syntax and format checks. Machine decode was never sent to speakers.

The SA sidecar has a different verified hash and size; its language, trigger,
decoder result and listening acceptance are unestablished. It is not a substitute
for the embedded stream and is not a continuation appended to it.

The next bounded audio implementation can reuse the architecture of one pinned
full-buffer decode, explicit onset/end policy, one host clock and interruption /
pause / Replay / navigation cancellation. It must use P009's own source length
and tests, independently verify the browser decoder, and keep the above onset,
seek and terminal exceptions visible. Product audio enablement, language/listening,
original-runtime synchronization and human/Owner/strict/publication gates remain
separate decisions.
