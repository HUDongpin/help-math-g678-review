# NMS002 L2 P064 — source-locked FQ audit, v1

This is a **candidate specification**, not a renderer, Current-JS admission, Flash
fidelity result, audio acceptance, host completion decision, or release receipt.

## Identity and custody

- Catalog placement: `shared-nms002-l02-p064`, NMS002 Lesson 2, FQ page 2,
  global ordinal 64; raw title `Page 1`, `Navigation=OFF`. The catalog's
  Spanish title is an English fallback, not a source-verified translation.
- Real source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`.
  Relative source: `G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`.
- SWF-only, 55,392 bytes, SHA-256
  `f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`.
  Do not substitute the compatibility symlink or infer a paired FLA.
- CWS v7; 800×600 at 12 fps, root 10 frames; background `#b8d8f7`.
  The quiz main sprite has 90 frames. AVM1 scripts were exported with FFDec
  26.2.1; AS1 versus AS2 authoring generation remains unresolved.

## Reproducible source contract

`scripts/audit-nms-l02-p064-quiz-v1.mjs --check` re-hashes the exact SWF,
re-exports the ActionScript, checks source behavior, and byte-compares
`source-quiz-contract-v1.json`. It fails closed for a different source root,
file, export, or contract. The contract's SHA-256 is
`943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5`.
The main sprite frame-1 script SHA-256 is
`480d21cd236fb63365d4db7b5dc14777c0ec854191c91e052f40d7ee7427ff04`;
the result sprite frame-2 script SHA-256 is
`6bc233ce1b89ed3819951a8836b0dd0d7ea8cb2e5d15e8646c3f6b95ac9dbc66`.

Static script evidence establishes a 35-question/four-option bank, ten draws
without replacement, 35 correct and 105 wrong option handlers, four grade
bands, and selected-question review order. This does **not** establish exact
question typography, assets, reachable host branches, or runtime timing.
`packages/demos/src/nms-l02-p064-quiz-state-candidate.ts` is an unregistered
pure-state implementation of only those facts; it accepts a source draw index
instead of asserting that JavaScript's PRNG reproduces Flash `random()`.

## Question content and review-name audit

`scripts/build-nms-l02-p064-question-ir-v1.py --check` re-hashes the source,
re-exports 649 text definitions and the main ActionScript, parses the 90-frame
sprite, and byte-compares `question-content-ir-v1.json` (SHA-256
`ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350`).
The IR records all 35 Q frames, 140 option sprites, 35 R frames, raw text,
source-symbol IDs, placement transforms, 12 move-only updates, and answer keys.
Ten Q frames have no new unlabelled direct text placement. Their visual/aural
teaching meaning cannot be inferred from that delta alone or replaced with
invented wording.

The source-locked `active-display-list-v1.json` resolves the SWF depth stack
through all 90 main-sprite frames (generator:
`scripts/build-nms-l02-p064-active-display-v1.py`). It shows that those ten
frames—Q2, Q3, Q5, Q6, Q12, Q13, Q15, Q16, Q18, Q19—retain a prompt symbol
from an earlier frame. Q5/Q6 and Q18/Q19 also retain the number-line art and
have move-only position changes. The resolver also carries the prior depth
matrix for 151 character replacements that omit a new matrix; this is a
static SWF-format inference, not observed Flash behavior. This corrects any
inference that the ten
questions lack a prompt in the effective *static* display list. It does not
prove the final text after ActionScript or the meaning of the changing visual;
Q5 additionally introduces ten editable `Txt` fields whose source defaults
are `0`. The display-list artifact is not a natural host trace or a renderer.

Source instance names are irregular: Q10 D is `A10Opt4 ` (trailing space),
Q23 C is `A231Opt3`, and R21 C is `R210Opt3`. The source ActionScript builds
one review lookup name by replacing an answer instance's leading `A` with
`R`. Static derivation therefore finds no matching review instance for Q10 D,
Q21 C, or Q23 C. This is **not** an observed original-runtime failure or an
approved correction; it requires a natural trace and a reviewed behavior
decision before renderer admission.

## Source media candidates

`scripts/audit-nms-l02-p064-audio-candidates-v1.mjs --check` hashes the exact
FQ/EA and FQ/SA folders and byte-compares `audio-source-candidates-v1.json`
(SHA-256 `60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58`).
Each folder has exactly 35 `Qn.mp3` and 140 `QnA`–`QnD.mp3` files: 175 per
folder, 350 total. EA totals 7,417,266 bytes; SA totals 8,517,350 bytes.
The EN/SP host calls and folder names make these strong source-media
**candidates**, but do not prove which files play, spoken language, timing,
Replay, or human listening. No file has been copied into the app or entered
as an accepted cue in `audio-inventory.csv`.

## Fail-closed boundaries

- EN and SP buttons call the external host's question-audio API. Zero embedded
  sound tags is not a source-bound audio waiver. Candidate media are now
  hash-indexed, while answer-audio reachability, cue timing, language,
  listening, and Replay acceptance remain open.
- The legacy result calls a host quiz-report bridge. Legacy report, bookmark,
  and close paths include student/class/lesson fields and a URL call. These
  paths are static evidence only: do not execute, copy into a modern network
  request, or infer modern progress/strict completion from them.
- Original-host natural trace, especially tenth-answer finish, ten review
  steps, and post-review exit, is absent. The candidate's terminal phase is
  deliberately `host-exit-unresolved`.
- Semantic question/option content, graphical asset treatment, layout,
  keyboard semantics, bilingual copy, modern host adapter, render tests, responsive
  QA, original-runtime comparison, and human/Owner gates remain open.

`NO-GO-scale-out` still applies. This one behavior-heavy page is a bounded
advanced-manual calibration slice, not authorization for an FQ factory batch.
