# P009 optional SA: source host and native decode disposition — 2026-09-27

For `shared-alg001-l12-p009`, the identified middle-school source host statically derives **`SA/L12VB04.mp3`** from the lesson-selected **`VB/L12VB04.swf`**. Its user-operated Spanish Audio control pauses the page animation, loads a separate Sound, starts that Sound at zero after successful loading, and requests conditional page resumption after completion or the EA control. The same generic optional-SA algorithm previously audited for P006 applies **conditionally** to P009's exact lesson path. This is source-supported host behavior, not a verified historical launch, an automatic Spanish-locale operation, or accepted modern playback.

Fresh technical observation establishes that the separate P009 file is **325,584 bytes**, SHA-256 **`3ccbe37ecfabff0506ef3daafc7db4b9fd8b770f0baefd6a70efeaaa27ca6fd4`**. It decodes at its native mono 48,000 Hz rate to **1,116,288 samples / 23.256 seconds**. No audio was sent to speakers. Its intended Spanish page-audio role is evidenced by the host control and function names; its spoken language, wording, pronunciation, and teacher listening remain unverified.

The scope is read-only source inspection and technical decoding, with writes limited to this new report and `output/p009-sa-source-20260927-v1/`. No product implementation, source archive edit, registry change, provider access, credential operation, Flash execution, or browser session occurred.

## Current source identities

Every input was read from an ordinary file with a single hard link through a physical path without symlink ancestors, and checked for read-time changes. The observation rechecks all input hashes after probing and decoding. Complete absolute paths, sizes, and SHA-256 values for 27 inputs are in `output/p009-sa-source-20260927-v1/analysis.json`.

| Input | Bytes | Current SHA-256 |
| --- | ---: | --- |
| Physical `G6-G8-shared/ALG001/L12/index.xml` | 11,927 | `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325` |
| Physical `G6-G8-shared/ALG001/L12/VB/L12VB04.swf` | 165,405 | `d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533` |
| Physical `G6-G8-shared/ALG001/L12/SA/L12VB04.mp3` | 325,584 | `3ccbe37ecfabff0506ef3daafc7db4b9fd8b770f0baefd6a70efeaaa27ca6fd4` |
| Canonical CAS host and retained host working copy, each | 689,006 | `275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9` |
| Host extraction receipt | 19,619 | `4f4daa77ce7a369b6635a28a3c1f0411d12c57358905a9b8c016510d9cbc7e0c` |
| Retained host `frame_35/DoAction.as` | 104,008 | `380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74` |
| Retained host `frame_49/DoAction.as` | 1,918 | `713f73c05dba1a9cd080b2a58b9cbfff277f6b5d5aa38136947c5a9013702ba6` |
| P006 `evidence/SA_HOST_DISPOSITION_2026-09-27.md` | 14,326 | `80c5b89c21716234a6baee90245f721e8d90fb0ecd19cadb74d00895e6939e7f` |

The physical course root is `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`. The host CAS path is `/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256/27/275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`. Its existing extraction receipt identifies logical archive member `NewHelpProgram/HELP_COURSES/indexMI.swf`.

Retained host evidence is under `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1`. Below, `H` denotes its `scripts/scripts` directory. The current CAS and working-copy hashes match. The existing successful script extraction and its AS files were reused; this work did not rerun FFDec or rehash the full historical archive manifest. Static association with the actual historical launcher and `dtfSPANISH` setting remains missing.

## Selection and trigger

The actual XML contains 52 active `Page` nodes. P009 is ordinal 9, the third active Vocabulary page in section `SName="VB"`, `SNumber="3"`. XML line 49 names `VB/L12VB04.swf`, title `Reviewing Ordered Pairs`, with empty `RandomAudio` and `BGText`. Lines 6 and 12 bind the ALG001 course image and `HELP_COURSES/ALG001/L12` page root. The Spanish navigation title at line 59 is not page-text or spoken-language acceptance.

`H/frame_49/DoAction.as:34–36` contains the matching ALG001 gallery case. `H/frame_35/DoAction.as:1468–1491`, `doGetSwfFileName`, converts a supplied section number to `sectionNumber = tempSection - 1` and composes the current SWF path from section data. With the matching VB selection, XML section 3 maps to host section index 2. The host's live section arrays and actual launcher were not observed.

A fresh in-memory binary walk of the canonical host independently found these root `PlaceObject2` bindings at frame 49. Offsets refer to the uncompressed SWF coordinate, including its eight-byte header.

| Control name | Character | Depth | Tag offset | Retained action |
| --- | ---: | ---: | ---: | --- |
| `EA` | 265 | 151 | 734,132 | Calls `_root.doStopSpanishAudio()` |
| `SA` | 273 | 163 | 737,115 | Calls `_root.doPlaySpanishAudio()` on release |
| `SA_PLAY` | 278 | 169 | 737,319 | Calls `spanSoundMp3.start()` without an offset |
| `SA_PAUSE` | 282 | 171 | 737,682 | Calls `spanSoundMp3.stop()` |

`doCheckSpanishAudio():2786–2856` shows SA/EA only when `dtfSPANISH` is `ON`, the selected section is eligible, and `spanSound` is not already true. It excludes stems ending in `01.SWF`. P009 ends in `04.swf` and its VB section index is eligible in both inspected `newTitleTag` branches, provided the actual section arrays contain that index. The check controls availability; it does not start audio. There is no evidence that a modern `es` UI locale or this page's entry starts SA.

`doPlaySpanishAudio():1519–1664` removes the selected SWF's last section directory and filename, then appends `/SA/<filename-stem>.mp3`. Both branches contain the same algorithm. Conditional substitution for `<ServerRoot>/HELP_COURSES/ALG001/L12/VB/L12VB04.swf` produces **`<ServerRoot>/HELP_COURSES/ALG001/L12/SA/L12VB04.mp3`**. `<ServerRoot>` is a placeholder: no actual server, domain, resolved request URL, or network response was verified.

## Start, return, and page-specific limits

| Operation | Verified static evidence and practical constraint |
| --- | --- |
| SA release | Sets page Pause/Play flags, calls `animation_mc.animation.stop()`, stops/resets feedback clips, hides glossary/tools, and creates a separate Sound. Uses `loadSound(SndFName,false)`; starts at `0` only if `onLoad(success)` succeeds and `showLoading_Spanish` remains true. No inspected load-failure recovery branch exists. |
| Loading display | The retained root enter-frame function at lines 2967–2988 clears `showLoading_Spanish` when the Sound position becomes positive and hides the loading warning. This is a loading-state guard, not a modern cancellation-generation proof. |
| SA completion / EA | Calls Sound stop and the exported unload variants, then `doStopSpanishAudio():1665–1708`. Preserve the source spellings `unLoad()` and `unload()` as evidence; successful AVM1 unload behavior was not executed. |
| Return to main page | Calls main `play()` only when its retained current frame differs from its total frames and `quizSection == false`. It does not reset the main animation to frame 1. It sets global `Play=true` / `Pause=false` even when that guard prevents main resumption. A maintained adapter must retain the terminal guard rather than interpreting those flags as permission to restart. No previous-playing-state restoration policy was found in this function. |
| SA pause / play | Pause stops the Sound and changes control visibility. Play calls `start()` without a saved offset. Neither handler stores a Sound position. Resume from the precise paused audio sample is not established by these source handlers. |
| Volume / mute | The observed `doCheckPrevAndNext` branch at lines 1272–1282 sets both `gSound` and `spanSoundMp3` volume to the host volume or zero. This establishes a static mute/volume operation, not an audible result. |
| Navigation / drag | Previous and applicable Next paths stop SA. `loadSWFMovie():422–437` stops SA and clears its loading flag before unloading the old page. The retained progress-bar enter-frame handler also calls `doStopSpanishAudio()` during dragging. Their asynchronous completion races were not executed. |
| P009 entry | Fresh binary parsing finds root 10 frames at 12 fps, root action tags only at frames 1 and 6, and main `sprite-62` with 394 frames. The retained root frame-6 AS is `stop();`; it controls the root timeline, not a terminal main stop. |
| P009 terminal | The fresh binary walk finds **zero main ActionScript tags** in `sprite-62`; P009 has no page-owned terminal-stop handler. The identified host's `doCheckPrevAndNext():1177–1193` stops a non-FQ02/FQ03 main animation at its last frame, and the retained frame-50 enter-frame observer calls that function. P009 is a VB page, so this is conditional source-host terminal-stop evidence. It does not establish an observed terminal run. |
| P009 glossary | All eight retained page release handlers set the exact glossary key, call `DoHyperLinks()`, and stop the main animation. None calls Spanish Audio or `spanSoundMp3`. Host `DoHyperLinks():1440–1467` stops the distinct glossary Sound and contains no SA start/stop call. A glossary request is not a verified trigger or cancellation mechanism for the separate SA file. |

This preserves the useful distinction from P006: **P006 has a page-owned frame-342 `stop()`; P009 has no corresponding main terminal action.** P009's modern frame-394 hold remains a stated candidate policy. The matching source host supplies independent conditional terminal-stop evidence, but no original host trace proves that policy in operation.

The common optional-SA host contract is supported; P006's audio bytes, duration, main frame count, or page-owned stop are not reusable P009 facts. SA is a separate user operation while the main cursor is retained. Its 23.256-second duration must not be stretched to the main animation, concatenated to the embedded stream, used as a page-completion duration, or treated as a second timeline segment. Embedded-stream interruption and return still need actual playback evidence.

## Fresh native technical observation

FFprobe and FFmpeg were invoked directly from the currently pinned Homebrew 8.1.2_1 binaries, with seven pinned core libraries. Their commands, binary hashes, library hashes, full probe output, and decode stderr are saved under `output/p009-sa-source-20260927-v1/`. Decode selects only the first audio stream and emits native-rate little-endian float32 PCM to a retained file. No `-ar`, `-ac`, gain filter, trim, concatenation, audio device, browser, or playback operation was used.

| Observation | Result |
| --- | --- |
| Codec / channel layout | MP3 / mono |
| Native sample rate / bitrate | 48,000 Hz / 112,000 bit/s |
| Read packet / decoded frame counts | 969 / 969 |
| Probe stream and format duration | 23.256000 seconds |
| Reported initial padding | 0; not a general proof of absent encoder/decoder delay |
| Full decoded samples | 1,116,288 per mono channel, equal to 969 × 1,152 |
| Full decoded duration | 23.256 seconds |
| Float32 PCM bytes / SHA-256 | 4,465,152 / `65a16a6dcedc28fa5e13dafa56abf0c4123bab0467b69cffbd3403c5831e2521` |
| Finite samples / peak / RMS | All finite / 0.5161113739013672 / 0.07812233589769281 |
| Nonzero sample values | 1,020,664 |
| First / last nonzero sample index | 1 / 1,115,615 |
| Leading / trailing exact-zero sample values | 1 / 672; final 672 samples correspond to 14 ms |
| Probe / decode errors | Exit 0; both stderr outputs empty |

The 672 trailing exact-zero samples are a measured decoded property, not an accepted narration boundary or permission to trim. Finite or nonzero PCM does not prove language, meaning, audio quality, synchronization, or listening acceptance. These 48,000 Hz native facts also do not establish the output length of browser decoding into the existing 22,050 Hz embedded-audio context; any later resampling path needs its own bounded measurement.

## Reproduction and handoff

From `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`, the following check repeats physical input validation, canonical host control parsing, P009 main/root tag inspection, XML selection, fresh FFprobe counts, native FFmpeg decoding, finite/energy measurements, and byte comparison of all six generated observations. It performs no writes:

```sh
python3 -B output/p009-sa-source-20260927-v1/analyze-sa-source.py --check
```

The current check passed with 27 stable input pins and six matching generated artifacts. `technical-receipt.json` binds the script, observations, this report, tool identities, and actual execution result. This evidence supports a later separately scoped optional-SA adapter: explicit user trigger, retained main cursor, start SA at zero after successful load, stale-load cancellation, navigation/drag teardown, and a nonterminal/nonquiz return rule. Any improved SA pause/resume or prior-paused-state restoration must be named as modern behavior rather than copied source parity.

No implementation is authorized by this report itself. Original launcher association, enabled source Spanish setting, runtime start/load failure/overlap/return behavior, browser decode/resampling, spoken-language and semantic listening, human/Owner acceptance, strict completion, release, and publication remain independent pending gates. P009's prior embedded audio observations and current admission work remain separate and unchanged.
