# P005 source-supported audio implementation route — 2026-09-27

Status: **preparation for the next bounded implementation, not activation or admission**.
This review adds only this report. It does not change source, audio, code, existing
evidence, typography, registry or any acceptance flag. P005 remains unregistered.
The available continuous audio candidate is technically implemented but its
source-specific timing is still explicitly inferred.

## Why the current host is silent

`packages/demos/src/timelines/shared-alg001-l12-p005.ts:12` declares
`audioPlaybackEnabled:false`; line 15 retains the source gap and signed-seek
hold. Its current SHA-256 is
`330e53e06bc67d787496eeda4f123d3794f45e00be9f522d1f2b59eec792ae7d`
(2,310 bytes). The module at
`packages/demos/src/modules/shared-alg001-l12-p005.tsx` imports the drawing and
native text path, not the P005 audio decoder, transport or candidate clock
(1,206 bytes, SHA-256
`103f468a810b9a005900a1b00ad9a59b9679715a5361d8f4e813666ec321b69b`).

The current
`apps/web/components/g678-alg-l12-p005-host-lesson.tsx` still advances
`alg-l12-p005-visual-clock` with requestAnimationFrame, implements
`narration() {}` at line 91, reports `audioAvailable:false` at line 134 and
`data-audio-rendered="false"`, and constructs an adapter with
`audioEnabled:false` at line 156. Its inspected version is 7,626 bytes, SHA-256
`6d455a7ac5d1d8fab9778a84536c46aa874c48bbdeb4c2ca3d6a019856cecf7d`.
The private reader
`apps/web/lib/g678-alg-l12-p005-host-probe.server.ts:25` also requires the false
source flag (5,176 bytes, SHA-256
`a123397597611d8fa9e4a96c4afbf70efbbc0e60d708001ba84464904e6ab281`).

Thus decoder availability alone cannot enable audio. The maintained candidate
is deliberately outside the product import path; the current host contract is
visual-only and its clock is independent of Web Audio. Typography changes do
not remove those audio holds. These host hashes identify the inspected snapshot,
not a new freeze or an authorization to change the flags.

## Physical source, tags and authored controls

The physical source directory is
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12`.
The files below were reread as regular, nonsymlink, single-link files with stable
stat checks. The compatibility source symlink was not used.

| File relative to that directory | Bytes | SHA-256 |
| --- | ---: | --- |
| `RW/L12RW05.swf` | 1,950,595 | `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe` |
| `SA/L12RW05.mp3` | 101,472 | `1cff13a53e883054dd8c319528cc17e6a6ca1589e776cfc427ba60e71f4f5ea1` |
| `index.xml` | 11,927 | `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325` |

`index.xml:37` places `RW/L12RW05.swf` in RW, title `Page 4`, with empty
`RandomAudio` and `BGText`. The lesson PageRoot is `HELP_COURSES/ALG001/L12`.
This entry supplies no SA URL, trigger or locale-autoplay rule.

An independent recursive parse of the preserved SWF, checked against
`audit/movie.xml`, found one SoundStreamHead, zero SoundStreamHead2, 902
SoundStreamBlock tags, zero DefineSound, zero StartSound/StartSound2, four
DoAction tags, and no DoInitAction or DoABC. The stream belongs to sprite 391:
968 authored frames at 12 fps, MP3 format 2, mono, 44,100 Hz, 16-bit playback
metadata, nominal 3,675 samples per visual frame and latencySeek 1,695.
The six-byte head is `0e2e5b0e9f06`, SHA-256
`fabe0ff568ec8690419c25eabfd9deeb75de9fe13d2c052f05259a11ea517bb6`.

All four exported scripts under `audit/source-scripts/scripts/` were inspected:

| Script | Bytes | SHA-256 | Source action |
| --- | ---: | --- | --- |
| `frame_1/DoAction.as` | 63 | `af7188282949f2613421ba9c8be629f489bbe2ee1e370a072024794b2d2cfc19` | `_level0.InternalPreloader.gotoAndPlay("jump_check")`; root stop |
| `frame_6/DoAction.as` | 9 | `3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655` | Root stop |
| `DefineSprite_391/frame_1/DoAction.as` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Empty |
| `DefineSprite_391/frame_968/DoAction.as` | 9 | `3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655` | Main stop |

The raw terminal action body is `07 00`, SHA-256
`0a6361b3a802f55cd5ae06101c88a1e216320fe11cc0cfe1d791eed08a1200fd`.
Its source tag order is DoAction, SoundStreamBlock, ShowFrame. No StopSounds
opcode, `stopAllSounds`, `loadSound`, or Spanish trigger occurs in these four
page scripts. A timeline stop is evidence of the authored frame boundary;
it does not by itself establish whether the decoder tail audibly continues.
`audit/movie.xml` is SHA-256
`944585dd7b3b53e2d65dc268fffcb1f5c81bde71de5f79c5d2c9c158a142f128`.

## P005 requires its own two-group sample policy

The pure extractor `parseEmbeddedAudioPayloads` was run read-only against the
physical source. Every one of the 902 block records matched the existing
machine receipt by local frame, SampleCount, signed SeekSamples, payload offset,
size and hash; concatenating its payload bytes matched the existing MP3 exactly.
No audio was rewritten or decoded anew in this review.

| Authored block group | Tags | Payload bytes | MP3 frames | Decoded samples |
| --- | ---: | ---: | ---: | ---: |
| Sprite 391 frames 23–339 | 317 | 209,248 | 1,006 | 1,158,912 |
| Sprite 391 frames 384–968 | 585 | 388,336 | 1,867 | 2,150,784 |

There are no stream blocks on frames 340–383: 44 authored frames, nominally
3.666666667 seconds. This is not proof of silence or of the original stream's
stop/resume behavior. The extracted bytes on either side are adjacent; the
597,584-byte MP3 has no inserted pause. Its SHA-256 is
`988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`.
The receipt's MPEG/decoder count is 2,873 × 1,152 = 3,309,696 samples,
75.049795918 seconds at 44,100 Hz. The previous ffprobe value 74.698 seconds
is not a playback clock for this source.

Boundary fields retain exceptions that a generic positive-block map would lose:

| Frame | SampleCount | Signed SeekSamples | Interpretation retained |
| --- | ---: | ---: | --- |
| 23 | 4,608 | 1,695 | First block of first group |
| 24 | 0 | 0 | Authored zero-payload block; not an inserted silent frame |
| 25 | 3,456 | 762 | Raw and continuous-candidate coordinates differ |
| 338 | 3,456 | 189 | Positive source block after candidate run depletion |
| 339 | 0 | -4,080 | Signed negative field; retain rather than coerce |
| 384 | 4,608 | 1,047 | Second group begins at payload offset 209,248 |
| 968 | 4,608 | 1,071 | Positive final block, ordered after terminal Stop |

The existing candidate uses one complete decoded buffer and applies the first
signed seek once per group: timeline 80,850 reads source [1,695, 1,158,912);
timeline 1,407,525 reads [1,159,959, 3,309,696), capped by its terminal policy
at timeline 3,553,725. It neither slices the MP3 per frame nor synthesizes
silence. This is a declared engineering hypothesis, with three unresolved
source discrepancies preserved:

1. At frame 25, candidate sample 9,045 differs from structural raw seek 5,370
   by 3,675 samples. Raw coordinates are not independently accepted playback.
2. Run 1 depletes at timeline 1,238,067, 408 samples before frame 338's start
   1,238,475, although frame 338 still contains a positive source block. The
   candidate exposes depletion before the missing-block interval at frame 340.
3. Terminal frame 968 clips source at 3,306,159, leaving 3,537 decoded samples.
   Previous FFmpeg evidence found nonzero values in that tail. It cannot be
   relabeled silence, inaudibility or accepted trimming.

The prior decoder-boundary experiment observes `main_data_begin=511` at the
second group's first MP3 frame. FFmpeg 8.1.2 returned byte-identical group-2
PCM when decoding with 0, 3 or 10 preceding MP3 frames. This bounded decoder
result supports retaining the full-buffer approach; it is neither a browser
reset guarantee nor a Flash timing observation. Do not fit constants to Ruffle
timestamps or promote compatibility playback into original-runtime evidence.

These retained inputs identify the full evidence, rather than an abbreviated map:

| File under `audio-source-v1/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `machine-timing-receipt.json` | 451,903 | `c193f9856de277227e8ee6dbe3c97d714863c701398bc98854276e94baa4b639` |
| `seek-map-v1.json` | 1,625 | `d0daa3e661c47fb6cf54061820ae607e4dab72039d5bf638d93118d4e992859c` |
| `decoder-boundary-v1.json` | 1,933 | `f3e7a08a58b42b07d5c44cf825d3de026fdbfcaef275657c4ddb712eee512347` |
| `timing-analysis-v1.json` | 2,601 | `0825e82d727ea7993e2dc72a69991373df285e5eae5e42eaa17a39d3c0598c5c` |

## The lesson SA file is a separate, conditional host path

There is no page-level SoundStart/LoadSound relationship to reconstruct. A
bounded existing export of the generic legacy `NewHelpProgram/HELP_COURSES/indexMI.swf`
does supply the separate SA controller behavior. Its review directory is
`/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1`.
`source.swf` is 689,006 bytes, SHA-256
`275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`;
`extraction.json` is 19,619 bytes, SHA-256
`4f4daa77ce7a369b6635a28a3c1f0411d12c57358905a9b8c016510d9cbc7e0c`.
The same SWF hash was checked against its existing emergency CAS object at
`/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256/27/275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`.
This review did not expand an archive or claim a newly recovered original entry.

The relevant exported paths are beneath `scripts/scripts/` in that directory:

| File | SHA-256 | Relevant evidence |
| --- | --- | --- |
| `frame_35/DoAction.as` | `380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74` | `doPlaySpanishAudio` lines 1519–1664; stop lines 1665–1708; eligibility lines 2786–2855 |
| `frame_49/DoAction.as` | `713f73c05dba1a9cd080b2a58b9cbfff277f6b5d5aa38136947c5a9013702ba6` | Lines 34–36 identify ALG001 image gallery context |
| `DefineButton2_273/BUTTONCONDACTION on(release).as` | `c177d473fd8a90ab61ed17bc4b63a895cee9fedc1f316658af43e8984dd43f33` | Explicit `doPlaySpanishAudio()` button |
| `DefineButton2_265/BUTTONCONDACTION on(release).as` | `5dacf94a56789afb84d10eb6e3682c23241e82724da2a706c7d1f0fdf55cff15` | Explicit `doStopSpanishAudio()` button |

`doPlaySpanishAudio` pauses the main animation, builds the URL by removing the
selected SWF's section and filename, then adding `/SA/<SWF stem>.mp3`. It uses
a separate `new Sound()`, `loadSound(SndFName,false)`, and starts at zero only
after successful load while the loading flag remains set. Completion stops and
unloads that sound before calling the SA stop function. The stop function resumes
the retained main frame only when it is nonterminal and nonquiz; it does not
restart the main page at frame 1.

If this generic host actually selected `RW/L12RW05.swf` under the observed lesson
PageRoot, the algorithm would request
`<ServerRoot>/HELP_COURSES/ALG001/L12/SA/L12RW05.mp3`. This is a conditional
source-supported relationship. Original ALG001 L12 entry, ServerRoot, host
selection and the historical `dtfSPANISH=ON` setting remain unverified.
`doCheckSpanishAudio` requires that ON setting, an eligible section and a selected
filename not ending in `01.swf`; RW05 satisfies only the filename condition.

The physical SA file's previously recorded machine duration is 7.248 seconds,
mono, 48,000 Hz. No new decode or listening occurred. The source calls this
control Spanish audio, but actual speech, semantic alignment and listening
acceptance remain undetermined. A later P005 SA adapter must pin this own file,
pause main playback exclusively, start SA at zero, cancel stale loads, preserve
the main cursor and respect terminal/navigation cleanup. It must not automatically
play on `/es`, append SA to the embedded MP3, or borrow P006's SA hash/duration.

## What can be reused from P006 and the existing P005 candidate

P006 demonstrates the maintained architecture: verify encoded bytes before
decode, preserve one full decoded AudioBuffer, use sample time as the playback
clock, schedule continuous windows, cancel stale async work, and own lifecycle
cleanup. Its current schedule is source-specific: 22,050 Hz, 624,384 decoded
samples, one run starting at authored frame 3 / timeline 3,675 / source 1,673,
342 frames, a half-sample terminal 626,587.5 and full audio end 626,386.
`packages/demos/src/alg-l12-p006-audio-schedule.ts` is SHA-256
`2ac06a5fde0873b2b4e3e22eab65457f5bdb0bf26f9defafb3aa8f2710596add`;
its decoder is SHA-256
`39d4058774b7c436b3855e6e2dbbfe22e2c095a5373a59b589ff8873b2f8ca02`.
Those constants and the one-run/postroll policy do not describe P005's 44,100 Hz,
968-frame, two-group source. Reuse the architecture, not P006's sample map.

P005 already has its own maintained decoder, transport, inferred schedule and
natural candidate clock. These are the exact six implementation inputs bound by
`output/playwright/p005-natural-candidate-20260927-v1/technical-receipt.json`:

| Implementation file | Bytes | SHA-256 |
| --- | ---: | --- |
| `packages/demos/src/alg-l12-p005-audio-decode.ts` | 1,217 | `ae83ba26cb1cab5e8079bd8f17c2938940d0c6e9c2380c1d08e763d383aadbce` |
| `packages/demos/src/alg-l12-p005-audio-transport.ts` | 4,653 | `2c3022b53a36e9bd0235b86ab11b008ae24548ff67431b914f84a99c523d4879` |
| `packages/demos/src/alg-l12-p005-audio-schedule.ts` | 2,602 | `142c4b78875274af3ff6467acc190c364fdfc999a24d3cadf62794d76f5d76c3` |
| `packages/demos/src/alg-l12-p005-audio-candidate-clock.ts` | 9,871 | `020f73468345618bedd3f6ee2fd55cdf27a178240b4e9faf653a8c7e65408b42` |
| `scripts/probe-g678-alg-l12-p005-audio-transport.mjs` | 8,823 | `d1c4bac7c4e25d8071a113e883f4b7f4472c5ad3eeb72dcdf624b5e9a21195e3` |
| `scripts/lib/p005-natural-candidate-probe.ts` | 6,903 | `879a0455240de8b84bb6f4c4fbd64aa8bc87554fe61a8b30f5769eed7df92023` |

The receipt is 2,962 bytes, SHA-256
`33a315f8692c1bf4ab9e15f41f88ec9b827c077f60def3366811c8dfa5d8bb0f`.
All 13 bound files, comprising those six inputs and seven artifacts, were freshly
checked by byte length and hash. The completed result is
`natural-candidate-result.json`, SHA-256
`18b9b5da07c3ffeb3d9e6cd98dca8e0e00442a8aa7ab0a7758a760f7f3756bc4`;
the retained `served-probe.js` is SHA-256
`6ff0bfc0c79f0d95c60a290c7e354fa34522a664dfa928c3e1d20eae77828a2c`.

The dated Main-reviewed result was 38 passing tests: 18 candidate-clock and 20
decoder/transport/schedule tests. Muted Chromium 153 natural playback took
80,681.6 ms, reached frame 968 and created exactly two nodes with source windows
[1,695, 1,158,912) / [1,159,959, 3,306,159). Maximum active nodes was one,
final active nodes zero, and the owned context closed once. Default gain was zero.
This verifies that declared candidate and its standalone lifecycle; it is not
audible listening, an actual My Lesson execution, or an original Flash trace.
This review rechecked files and read the results; it did not rerun these tests.

## Smallest next implementation and its evidence boundary

The next useful step is a maintained, private P005 host adapter around these
P005 helpers. It can be prepared without rewriting source audio or changing the
formal registry. Before activating host audio, retain the existing specification's
requirement: resolve the source-specific timing choice, or deliberately review
it as a bounded engineering exception with the three discrepancies still visible.
That exception would permit an explicitly inferred local implementation; it would
not establish original-runtime or audio acceptance. This report grants no exception.

The bounded adapter should load only the pinned P005 bytes through an existing
private source route, verify hash/decode shape, and use generation cancellation
for load/decode/start/seek/page changes. Main drawing and native typography should
read the same candidate frame cursor; remove the competing wall-time visual clock
for audio-backed playback. Keep a single caller-driven tick, pending-boundary
freezes, explicit user play after suspension, pause/seek synchronization, whole-page
Replay to frame 1, terminal behavior as declared, and navigation/unmount cleanup.
Begin with zero gain and expose the inference in the local evidence path.

Verification should exercise the actual private My Lesson route, not substitute
the standalone probe: EN and ES fallback, narrow viewport, ready/load failure,
user play, pause/resume, frames 23/24/25 and 338/339/340, node-free gap, second
group, Replay, terminal, reduced motion, interruption and page/unmount cleanup.
Tie the real rendered frame and native text state to the audio cursor; retain
the source and served-code hashes and non-overlap/close results. After a material
host change, recheck its freeze/admission bindings before any separate Current-JS
registration step. SA is a later explicit P005-specific controller task.

`AUDIO_SCHEDULE_CANDIDATE_SPEC_2026-09-26.md` (SHA-256
`5a049f4fbf231b87a23a3307887451e5bdd8fef632b3f8af3ff845d711ed08f3`)
and `NATURAL_AUDIO_CANDIDATE_2026-09-27.md` (SHA-256
`390ff168e6f967df1a6cb3e67cb1e402479cce47b1d28330fe3e90eff4a476ec`)
remain the declared candidate contract. Neither was changed by this report.

For original-runtime acceptance,
`ORIGINAL_RUNTIME_READINESS_2026-09-26.md` (5,211 bytes, SHA-256
`1d25027d0d81e8bcefb03c1cdbe5a772f85074c7f806bafef0a46003ed3706df`)
still records missing exact original entry/dependency tree, containment,
named operator and execution approval. The generic indexMI source narrows the
SA hypothesis but does not close that P005 host-entry gate. A valid contained
natural session must independently resolve the first-run timing and terminal
tail; no extra generic decode or compatibility trace replaces it.

Current separate outcomes: source payload identity and candidate technical
evidence are available; product audio activation, synchronization acceptance,
original-runtime fidelity, listening, human/Owner acceptance, strict completion
and publication remain pending. This report changes none of those outcomes.
