# P051 — Fraction and decimal matching

Specification reconciled from source audits on 2026-09-23. This is an
unregistered engineering candidate; no acceptance decision is recorded here.

## Identity and instructional purpose

`shared-nms002-l02-p051` is NMS002 Lesson 2, global page 51, TI Question 9
(TI ordinal 9 in the source-ordered 64-page lesson). The shipped file is
`G6-G8-shared/NMS002/L2/TI/L2TI10.swf` under the real AWS Grade-Classified
Courseware source root. Its 861,848 bytes have SHA-256
`9c4c9857bb497497b4301a7b1cfec475b5f7bdf9d2cecabcd779fbd887de5d1f`.
The asset ID is `swf-` followed by that complete hash. No same-path FLA was found.
`audit/source-identity-v1.json` binds the source and byte-identical audit copy.

The exercise matches 0.1, 0.2, 0.25, 0.75 and 0.875 to 1/10, 1/5, 1/4,
3/4 and 7/8. Nine decimal choices include four distractors: 0.125, 0.3, 0.7
and 0.8. They are mismatches for this exercise's five targets, not numbers
that cannot be represented as fractions.

## Source audit and implementation lane

The CWS version 6 SWF has an 800 by 600 stage, 12 fps and a 10-frame root.
The main teaching timeline is sprite-257, 503 frames, entered at root frame 6.
Root duration remains 10/12 seconds; the nested count must not replace it.
`audit/structural-summary-v1.json` records 29 timelines, 66 static text
definitions, 83 decoded text runs, 133 shapes, 13 bitmaps and nine buttons.
The script and P-code export manifests pin the existing extraction evidence.

Use the bounded advanced-manual lane: maintained React/semantic HTML/SVG,
pure frame queries and a source-bound interactive state machine. Matching,
feedback, glossary dialogs and audio-tail transitions require behavior beyond
static factory output. `NO-GO-scale-out` remains. Generated intro, glossary
and audio-plan data must be changed through their generators. Video cannot
represent the required interaction. Ruffle is forensic evidence only.
Student text uses responsive semantic typography; source geometry stays in
the audit as historical evidence.

## Timeline and behavior

- Main frames 1–484 present the introduction. Answer-box borders follow the
  source fade independently of text alpha at frames 11–22.
- Main frame 485 holds for matching. A wrong answer starts sprite-248 at
  frame 2 and requires explicit Close. A correct answer starts sprite-250
  at frame 2; retain its final audio tail before enabling another answer.
- Five correct matches enter sprite-256 completion feedback for 25 frames,
  then main frames 486–503. Main frame 503 stops.
- Replay resets solved items, active answer, phase, playheads and audio.
  Tokens reject stale callbacks; pause/resume and mute preserve phase timing.
- Four source glossary terms bind EN/ES XML and authored button IDs in
  `audit/source-glossary-v1.json`; dialog checks are recorded separately.

`audit/native-behavior-decisions-v1.json` documents the unresolved outer
`_level0.instance3` alias and missing named help instances. Native exact
mathematical target matching is an adaptation, not verified Flash parity.
Do not invent help UI from unresolved references.

## Audio and assets

Eight full embedded MP3 streams and decoded PCM are retained in
`audit/source-pcm-inventory-v1.json`. The candidate selects sprite-257 narration,
sprite-248 wrong feedback and sprite-250 correct feedback. The external
SA/L2TI10.mp3 is an unaccepted candidate, not a replacement for these streams.

The native plan retains post-latency samples at 22,050 Hz and source-frame
scheduling. The main end-seek difference of 238 samples remains a limitation.
Sprite-228 has nonzero audio at its stopped first frame; no named start call
does not prove original-runtime silence. See
`audit/native-audio-clock-decisions-v1.json` for these pending decisions.

The generated inventories retain all eight audio streams, 13 exported bitmap
effects, and runtime data with hashes. Source text and shape roles remain in
the detailed teaching-text and shape/nonteaching disposition audits. Including
an excluded decorative asset in an inventory does not imply reproduction.

## Implementation map

- Module: `packages/demos/src/modules/g678-nms-l02-native-fraction-match-p051.tsx`.
- Pure query: `packages/demos/src/nms-l02-p051-frame-v1.ts`.
- State/player: `packages/demos/src/nms-l02-p051-practice-v1.ts` and
  `packages/demos/src/nms-l02-p051-player-v1.tsx`.
- Text: `packages/demos/src/nms-l02-p051-text-snapshot-v1.ts`.
- My Lesson: `apps/web/components/g678-nms-l02-p051-lesson.tsx` and
  `apps/web/components/nms-l02-p051-source-runtime-v1.tsx`.
- Local route: `/en/migration-status/g678-calibration/shared-nms002-l02-p051`
  and `/es/` equivalent. The freeze gate currently rejects both.
- Audio: `/flash-assets/g678-local/shared-nms002-l02-p051/source-audio/[domain]`.
- Checks: `scripts/check-nms-l02-p051-*`. No standalone package requested.

Pure queries support root, sprite-257, sprite-248, sprite-250 and sprite-256,
validating scenario/domain/frame/language/seed/replay. Post-stop inspection
is labeled as inspection rather than a naturally executed trace. Coverage-v2
still contains scaffold root requirements; complete nested interactive trace
requirements and authoritative entry states remain unfinished.

## Verification and remaining work

Existing browser audits cover the standalone player, practice UI, glossary and
audio. All 18 P051 check scripts passed again on September 23, including 1,006
bilingual main-frame queries, 1,936 intro render cases, 120 answer orders and
5,880 wrong drops. This does not verify the actual registered My Lesson path.

Before admission: complete exact candidate freeze and registration preparation;
verify actual host navigation, Replay, audio routes and production rejection;
verify teaching visibility at 320px/200% text including vertical scrolling;
create the source-bound typography binding and technical record after checks.
ES visible lesson text is the maintained native translation in
`nms-l02-p051-text-v1.ts`; glossary definitions use the separately bound EN/ES
XML. The three selected audio streams remain English source audio, so an ES
route does not establish Spanish narration or named-human translation approval.

Original-runtime traces, full-frame comparison/RMSE, named listening, human
visual review, Owner acceptance, strict completion and publication are pending.
No reviewer or signature is supplied here. Production build and complete My
Lesson verification are not claimed. Historical audits remain unmodified.
