# P064 canonical indexMI host audio mapping — static addendum

`SOURCE_HOST_AUDIO_V1.md` recorded that the P064 button calls and source MP3
files existed while the host function body was not yet inspected. This v2
addendum narrows **only that static-source uncertainty**. It does not claim an
original-runtime trace, the actual deployed host, audible playback, or audio
acceptance.

`scripts/audit-nms-l02-p064-host-mapping-v1.mjs --check` independently hashes
the P064 SWF and the historical `NewHelpProgram/HELP_COURSES/indexMI.swf` host
source binding and recovery object, re-exports the latter with FFDec 26.2.1,
and checks its frame-35 ActionScript against the P064 question-frame IR and
350-row MP3 index. Its immutable output is
`host-audio-static-mapping-v1.json`, SHA-256
`a5a659eab428721358b841c5ca45f03a7bd2987585d523be3f5a619ed7480343`.
The host source is 689,006 bytes, SHA-256
`275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`;
the exported host script is SHA-256
`380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74`.

The host loader calls `animation_mc.loadMovie(playSwfFileName, 1)`. Both FQ
audio functions derive a directory by removing the loaded SWF's filename.
For P064, the question IR places Q1–Q35 at main-sprite frames 2–36; the host
computes `Q` plus current frame minus one. The question function therefore
constructs `EA/Qn.mp3` for EN and `SA/Qn.mp3` for SP. The answer function
reads the clicked control's instance name, maps trailing `1/2/3/4` to
`A/B/C/D`, and constructs `EA/QnA–D.mp3` or `SA/QnA–D.mp3`. Both playback
branches contain this mapping, and every one of the 70 question and 280
option path candidates occurs exactly once in the hash-bound source index.
This establishes a **conditional static mapping for these two exact SWFs**,
not the configuration or actual request of a natural lesson session.

Still open: confirmation that this exact `indexMI` byte sequence was the
effective P064 host in an original lesson; values of its quiz-audio flags;
runtime reachability, loading and cue timing; spoken-language and listening
review; and the privacy-safe result and My Lesson admission decisions. A
later local-only candidate UI now exposes question and option source files
with browser-checked stop/Replay cleanup (see `HANDOFF_OPTION_PLAYER_2026-09-24.md`),
but that does not close original-host behavior or listening. The accepted
`audio-inventory.csv` remains empty.
Neither legacy student/report URL nor bookmark/close logic may be executed.
