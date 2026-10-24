# P006 separate SA and source-host disposition — 2026-09-27

## Bounded result

Placement: `shared-alg001-l12-p006` (`RW/L12RW06.swf`, XML title `Page 5`). The retained canonical middle-school `indexMI.swf` statically selects this page's separate `SA/L12RW06.mp3` through the **user-operated Spanish Audio control**. It pauses the page animation, constructs the same-lesson SA URL from the current SWF URL, loads a separate Sound object, and starts it at zero after successful loading. Completion or the EA control stops/unloads that Sound and conditionally resumes the page animation. This is an alternate host audio operation, not a second embedded-stream segment or an automatic response to a modern `es` locale.

Confidence: **verified static behavior in the identified host SWF and retained AS; inferred P006 URL substitution conditional on that host loading the XML-selected P006 page; missing original-host runtime and listening evidence.** The host's ALG001 gallery case and page target match this lesson's source references, but no deployment/launcher association or live execution was verified. The selected host is the exact canonical `indexMI.swf` below, not a renamed host variant or the alternate GEO001 host.

Checked at `2026-09-26T17:23:40.728Z` (2026-09-27 in Asia/Taipei). Only this report was written. Existing extraction was reused; no endpoint, Flash runtime, browser, audio playback, audio decode, provider, extraction generation, source, generated output, registry, or registration contract was changed. Main's embedded-audio continuous-span correction and its tests remain separate work; this report does not assess or duplicate that schedule.

## Exact source and evidence identities

All hashes below are SHA-256 computed from current bytes during this audit. The physical lesson root and files are real filesystem directories/files, not the compatibility symlink.

| Exact physical path | Bytes | SHA-256 |
| --- | ---: | --- |
| `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/index.xml` | 11,927 | `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325` |
| `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW06.swf` | 708,053 | `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6` |
| `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/SA/L12RW06.mp3` | 214,704 | `86fdbdeb0fec8cd6b9682d75ec436e4db370d56ba23e48efc47cf00c374c64bf` |
| `/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256/27/275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9` | 689,006 | `275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9` |
| `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/extraction.json` | 19,619 | `4f4daa77ce7a369b6635a28a3c1f0411d12c57358905a9b8c016510d9cbc7e0c` |

The CAS host's logical archive path is `NewHelpProgram/HELP_COURSES/indexMI.swf`, recorded in the existing extraction receipt. Its retained working copy at `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/source.swf` was independently rehashed to the same 689,006-byte identity. The receipt records a successful prior FFDec script export; this turn did not rerun it or rehash the full 130 MB archive member manifest. Current AS hashes bind the reused files; no claim of fresh complete extraction verification is made.

For the following exact paths, `H` is `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts` and `P` is `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/migrations/shared-alg001-l12-p006`. Concatenating the declared prefix and suffix gives the exact absolute file path.

| Exact prefix + suffix | Bytes | SHA-256 |
| --- | ---: | --- |
| `H/frame_35/DoAction.as` | 104,008 | `380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74` |
| `H/frame_49/DoAction.as` | 1,918 | `713f73c05dba1a9cd080b2a58b9cbfff277f6b5d5aa38136947c5a9013702ba6` |
| `H/frame_50/PlaceObject2_743_130/CLIPACTIONRECORD onClipEvent(enterFrame).as` | 61 | `0f74c16ab4c673bd21f5d82f4c7bd77f2c003198d8870bda7764b3cd7699c035` |
| `H/DefineButton2_273/BUTTONCONDACTION on(release).as` | 437 | `c177d473fd8a90ab61ed17bc4b63a895cee9fedc1f316658af43e8984dd43f33` |
| `H/DefineButton2_265/BUTTONCONDACTION on(release).as` | 49 | `5dacf94a56789afb84d10eb6e3682c23241e82724da2a706c7d1f0fdf55cff15` |
| `H/frame_49/PlaceObject2_278_169/CLIPACTIONRECORD on(release).as` | 123 | `07f0badc3feeee33c3b8b707c84b29fca376baf5d15e1c2da93695e09e47f1dc` |
| `H/frame_49/PlaceObject2_282_171/CLIPACTIONRECORD on(release).as` | 122 | `3b63895944ac93c59d74277a882ce533b9e84408bf7609ff6a576658f3a6d665` |
| `H/DefineSprite_753_media-controls/frame_1/PlaceObject2_752_progress-bar_1/CLIPACTIONRECORD onClipEvent(enterFrame).as` | 268 | `97c11981d7ce592da843e151d7019f7bb0215e76a5e7701398190bcbd0953ce2` |
| `P/evidence/GLOSSARY_DISPOSITION_2026-09-26.md` | 6,204 | `97f3954d86de2ff1c86b8e2e0ef826c267a55fbc228c4fe8a4eab876e5dbb720` |
| `P/audit/glossary-disposition-v1.json` | 26,891 | `7c0dcbfa455ad06a1a72c4d9550d6aabd4131c4c3e498ecad50193f1d5395bab` |
| `P/evidence/AUDIO_SOURCE_2026-09-26.md` | 3,563 | `3d8d52ce9844d80a313e7d71cd4e101ecfd2c6fd283044db128465d5bae2be9c` |
| `P/audit/ffdec-26.2.1/extraction-receipt.json` | 5,298 | `7cee944f6b0096cda883b8176724a6fd0ef2e3fdd5f6882487160c41a8a9f6e6` |
| `P/audit/ffdec-26.2.1/as/scripts/DefineButton2_48/BUTTONCONDACTION on(release).as` | 125 | `32ffdb4bf2b7fea093715cd18b93ae43225d16e32dbbb58c5bfa1ee132e4d47e` |
| `P/audit/ffdec-26.2.1/as/scripts/DefineSprite_53/frame_342/DoAction.as` | 9 | `3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655` |

## Selection, URL, and language

1. **Exact lesson selection (verified XML).** `index.xml:6` names `HELP_COURSES/ALG001/ALG001.jpg`; line 12 declares `PageRoot=HELP_COURSES/ALG001/L12`; lines 28–38 place `RW/L12RW06.swf` in RW section number 2. The active P006 node at line 38 has empty `RandomAudio` and `BGText` attributes. It does not declare an SA URL, audible language, or automatic Spanish trigger. Lines 15–16 name English/Spanish glossary XML; those dictionary references are not page-SA selection evidence.

2. **Host compatibility (verified static, runtime association missing).** `H/frame_49/DoAction.as:34–36` selects the ALG001 gallery for that same course-image path. The host loads and controls `_root.animation_mc.animation`, matching P006's exported host calls. This supports applying the identified host algorithm to the lesson-selected path as a static conditional inference; it does not establish which host variant a historical deployment actually launched.

3. **Trigger and control identities (verified).** Direct read-only, in-memory parsing of the rehashed host SWF's root `PlaceObject2` tags found frame 49 bindings: `EA` = character 265/depth 151; `SA` = character 273/depth 163; `SA_PLAY` = character 278/depth 169; `SA_PAUSE` = character 282/depth 171. Character 273's release handler calls `_root.doPlaySpanishAudio()`. It also contains optional click-report logic when `dtfClicks` is `ON`; that reporting path was not executed. Character 265 calls `_root.doStopSpanishAudio()`.

4. **Availability gate (verified static, actual settings missing).** `H/frame_35/DoAction.as:2786–2855`, `doCheckSpanishAudio()`, shows SA/EA only when `dtfSPANISH.text.toUpperCase()=="ON"`, the section is eligible, `spanSound!=true`, and the current file's last six characters are not `01.SWF`. With `newTitleTag==true`, section indices start at 0; otherwise they must be at least 1. P006 ends in `06.swf` and RW is section 2, so it is eligible under the matching section data and enabled setting. The original `dtfSPANISH` value was not observed. `doCheckPrevAndNext():1179` calls this visibility check, not the play function. A modern Spanish UI locale alone therefore does not authorize autoplay of this file.

5. **URL derivation (verified algorithm, inferred substitution).** `doPlaySpanishAudio():1519–1664` splits `_global.playSwfFileName` on `/`, takes the filename stem before `.`, joins every path component except the final section directory and filename, then appends `/SA/<stem>.mp3`. Both `newTitleTag` branches use this rule. For a current SWF of `<ServerRoot>/HELP_COURSES/ALG001/L12/RW/L12RW06.swf`, the derived URL is **`<ServerRoot>/HELP_COURSES/ALG001/L12/SA/L12RW06.mp3`**. Line 3034 has a `MainFilePath=ServerRoot+"/"` initialization branch; navigation composes `playSwfFileName` from `MainFilePath` and selected page data. No actual `ServerRoot`, scheme, domain, resolved URL, request, or response is claimed.

6. **Language disposition.** The source names `doPlaySpanishAudio`, `spanSoundMp3`, `dtfSPANISH`, and the user-operated SA control verify the file's **intended Spanish page-audio role in this host**. Its spoken language, content, pronunciation, and synchronization remain **unverified**. The existing `AUDIO_SOURCE` report records mono 48,000 Hz and 15.336 seconds from a prior machine probe; this turn only rehashed the 214,704-byte file and did not reprobe, decode, or listen. Sample rate and duration do not prove a language.

## Start, interruption, completion, and stop semantics

| Source operation | Static behavior and limit |
| --- | --- |
| SA release / `doPlaySpanishAudio()` | Sets `Pause=true`, `Play=false`; calls main animation `stop()` and stops/resets authored feedback clips; hides glossary/tools; sets `showLoading_Spanish=true`, `spanSound=true`, and switches SA transport visibility. Creates `new Sound()`, uses `loadSound(SndFName,false)`, and calls `start(0)` only when `onLoad(success)` succeeds and the loading flag remains true. No failure-recovery branch is present in the inspected callback. |
| SA completion | The callback calls `spanSoundMp3.stop()`, then literal `unLoad()`, then `_root.doStopSpanishAudio()`. Preserve the exported spelling as evidence; whether these unload calls succeed in the original AVM1 runtime was not established. |
| EA release / `doStopSpanishAudio():1665–1708` | Calls `spanSoundMp3.stop()` and literal `unload()`. Calls main animation `play()` only if its current frame differs from its total frames and `quizSection==false`. Sets `Play=true`, `Pause=false`, clears Spanish/loading state, restores ordinary controls, hides tools, and restarts feedback clips whose frame is above 1. It resumes from the retained main frame; this function contains no main `gotoAndPlay(1)` reset. |
| SA_PAUSE release | Calls `spanSoundMp3.stop()` and toggles SA_PLAY/SA_PAUSE visibility. It does not unload, resume the animation, clear `spanSound`, or save a sound position. |
| SA_PLAY release | Calls `spanSoundMp3.start()` with **no offset argument** and toggles visibility. No saved-position resume policy is present in this handler. Do not describe it as verified resume from the paused audio sample; runtime behavior remains unobserved. |
| Page navigation/loading | Previous and applicable Next branches call `doStopSpanishAudio()` before replacing the page; `loadSWFMovie():422–437` also calls it and clears the loading flag before `animation_mc.unloadMovie()`. A delayed load callback is guarded by `showLoading_Spanish`, but asynchronous races and object replacement were not tested. |
| Progress drag | The retained media-controls enter-frame handler calls `doStopSpanishAudio()` while `progDrag` is true, then restores play/pause flags and clears quiz/interaction state. |
| Terminal page frame | P006's sprite-53 frame-342 AS is `stop();`. Independently, host `doCheckPrevAndNext():1177–1193` stops a non-FQ02/FQ03 main animation at its terminal frame, and the frame-50 observer invokes this check. `doStopSpanishAudio()`'s terminal guard avoids restarting the main animation at that frame. This is static stop evidence, not a new embedded-stream sample schedule. |
| P006 glossary release | Existing audit records Coordinate/Graph/Equation/Inequality handlers: set the key, call `DoHyperLinks()`, then stop the main animation. The exact host `DoHyperLinks():1440–1468` stops `engKTSoundMp3` (a different glossary Sound), sets interaction/pause state, and appends `~English` to the key. It contains **no** `spanSoundMp3`, `doPlaySpanishAudio`, or `doStopSpanishAudio` call. A glossary release is not a demonstrated trigger for P006's separate SA file; it also does not directly prove SA cancellation. |

The host stops the animation during SA playback and requests a resume afterward; this supports treating SA as an optional Spanish operation that temporarily replaces main-timeline playback. Audible embedded-stream interruption/resumption, overlap, load failure, restart behavior, and natural timing still require runtime evidence. The separate SA duration must not be used to retime or extend the embedded stream.

## Smallest next work and handoff

The static unknown is narrowed to a concrete optional Spanish host operation. Keep the separate SA asset out of the embedded continuous-span schedule. The smallest next implementation task, if requested by Main, is one maintained optional SA adapter bound to the exact MP3 hash: explicit user trigger; stop the main clock; start SA at zero after successful load; cancel stale loads; stop/unload on EA, page replacement, and drag; resume only from the retained nonterminal, nonquiz state. Keep the source SA_PAUSE/SA_PLAY behavior and any deliberately improved modern resume policy separately identified. Do not silently map `lang=es` or a glossary click to SA playback.

Before claiming original-host parity, independently establish the actual indexMI/lesson launch binding and enabled Spanish setting, then obtain authorized runtime evidence for loading, interruption, completion, terminal/nonterminal return, and SA play/pause. Named-human listening remains a separate future gate. No source/generated/registry edit, implementation, Current-JS admission, original-runtime fidelity, audio acceptance, human/Owner acceptance, strict completion, or publication is established by this report.
