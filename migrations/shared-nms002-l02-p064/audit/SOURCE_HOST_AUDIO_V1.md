# P064 host audio and result lifecycle — static source addendum

Later evidence: `SOURCE_HOST_AUDIO_V2.md` verifies a conditional static
control-to-file mapping in the hash-bound canonical `indexMI.swf` source.
The v1 statement that its function body and mapping were unavailable records
the earlier audit boundary; runtime, deployed-host association, and listening
remain open.

This addendum corrects the older `SOURCE_QUIZ_V1.md` boundary that called
answer-audio behavior wholly unresolved. The original host **implementation,
runtime behavior, and file mapping** remain unresolved, but the P064 SWF's
button calls and audio-control flags are now source-confirmed. This is not a
natural original-runtime trace or audio acceptance.

The exact source is the 55,392-byte
`G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`, SHA-256
`f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`,
under the real AWS grade-classified source root. The source-bound FFDec 26.2.1
export and 350-row audio candidate index are rechecked by
`scripts/audit-nms-l02-p064-host-audio-v1.mjs --check`. The immutable machine
contract is `host-audio-lifecycle-v1.json`, SHA-256
`8787dc38222cbe83a192eabc0ac7d8734408abba0ef7da5434a6e85c6c0c68b9`.

## Verified static branches

- EN/SP button scripts dispatch a question-control click to the external
  `doPlayFQQuestionAudio` host API and a non-question-control click to the
  external `doPlayFQAnswerAudio` API. These are invocations, not evidence that
  the host function loaded a particular file or that sound was audible.
- The source audio-control sprite addresses one question control and four
  answer controls. External host flags independently govern question-audio
  visibility, answer-audio visibility, and Spanish-audio variants. The
  effective flag values for an actual lesson session are unknown.
- The exact source media index contains 70 EA/SA question-file candidates and
  280 EA/SA A–D option-file candidates. Their names and hashes are source
  evidence, but the missing host function body prevents claiming that a
  control's audio request resolves to a corresponding `QnA`–`QnD.mp3` file.
- At the tenth answer, the main quiz sprite exposes its finish state. The
  result sprite constructs a legacy report containing student/class/lesson
  fields and calls the host report movie twice in static script. That is not
  proof of two network requests or approved modern scoring. The review button
  advances selected questions; after the tenth review it enters a separate
  legacy unload/bookmark/close or URL branch. The modern candidate must not
  execute either legacy URL or infer progress completion from it.

## Current engineering boundary

All 350 source MP3 candidates pass exact byte/hash reads. Local-only guarded
question and option routes can return those bytes with range support; the
option route is not connected to the student-facing P064 candidate until the
original host mapping, language, timing, and modern teaching presentation are
reviewed. Production remains a denial path. The accepted `audio-inventory.csv`
is intentionally empty. Human original-runtime listening, spoken-language
confirmation, privacy-safe result handling, My Lesson admission, original
runtime/fidelity, Owner and strict gates remain open.
