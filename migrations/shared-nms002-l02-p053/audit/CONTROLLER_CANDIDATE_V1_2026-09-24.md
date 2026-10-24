# P053 two-Start controller candidate — 2026-09-24

Status: **unregistered pure-state candidate only**. This is a bounded
behavior-heavy advanced-manual step toward P053, not a renderer, My Lesson
admission, original-runtime trace, audio acceptance, or publication.

## Source boundary

- The real AWS source `G6-G8-shared/NMS002/L2/GS/L2GS02.swf` was rehashed at
  `f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`.
  The distinct P054 `L2GS03.swf` rehashed at
  `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`.
- The exact source-static host/navigation record
  `audit/host-navigation-resolution-v1.json` rehashed at
  `4082197b15ee072fcbbbff594c5a92ceaf19c039964fa3d8cd58cb83a3536332`.
  The external FFDec AVM1 early and late Start scripts rehashed at
  `d4de1288cfac868acd5a131b57047afecca7084a78792afca69d81f5378dccde`
  and `73e3330ff7d670fc88f8e574c4aaa34b490d978e690ab2fe3e6aed7500ab2102`.
  The level-1/level-2 selection scripts are byte-identical at early and late
  placements, respectively. These are extracted script facts, not executed
  click traces.
- `catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json`
  regenerated in read-only `--check` mode from the source with 24 cards and
  SHA-256 `6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205`.

## Maintained candidate

`packages/demos/src/nms-l02-p053-controller-candidate.ts` (SHA-256
`51e14f9e77ecb054e60aeccdff0789017a6aac38a4d6772d49d48e46c1ffe3c4`)
models the mutually exclusive source level flags, the two different missing-
selection warnings, and the exact Start call arguments. It never advances a
timeline on its own. The early source Start emits an unexecuted `L7GS03`
intent; the frame-693 Start emits an unexecuted `L2GS03` intent with argument
`6`. Neither intent is converted to a page route or a claim of successful host
navigation. `startGame` is `unobserved` at fresh entry because source frame 1
does not initialize it; a selected Start sets it true. Entering the later
label explicitly preserves the current level flags and hides the popup as
that frame's script specifies. Foreign phase or level state fails closed.

The paired test `packages/demos/tests/nms-l02-p053-controller-candidate.test.ts`
(SHA-256 `b928f709b4628a033d91a70acf0d8876f1bd8ea3f5f9834cd6a1084e458caab2`)
checks the frozen action identities, both unselected warnings, exclusive level
selection, the two different requested basenames/arguments, and rejection of
an invalid level. The 13 focused P053/P054 source-contract and state tests
passed. A strict isolated TypeScript check of the two new files passed. The
full demos TypeScript run still reports six existing P044/P046/P054 test-file
errors; it reported no error in the new files.

## What remains

The current source-static host audit suggests an ordinary L2 GS lookup retains
the current page for the early `L7GS03` request and finds P054 for the later
`L2GS03` request, but actual host globals, click reachability, reload effect,
audio, and result/Replay flow have not been observed in an authorized natural
runtime trace. Do not promote that static interpretation into product behavior
without the required review. P053 has no maintained renderer, native text
binding/check, official registry/descriptor/My Lesson integration, or browser
QA. P054 still has only its unregistered game-state candidate. All original-
runtime, visual-fidelity, audio-listening, human/Owner, strict-completion,
release and publication gates remain open; the G6–G8 Current-JS count is
unchanged by this candidate.
