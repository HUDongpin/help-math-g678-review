# P064 active-display continuation — 2026-09-24

This continuation preserves the full G6–G8 goal in the dirty
`/Volumes/WestWorld/HELP MATH 2.0-g678-implementation` worktree. P064 is
still an **unregistered candidate**: no renderer, My Lesson admission,
original-runtime/fidelity result, audio acceptance, human/Owner approval,
strict completion, release, or publication is claimed.

New source-bound artifact: `active-display-list-v1.json`, SHA-256
`34f152e4a002b38931c57f9be29c1759a48da232a400c4544a4f34d1be51deb8`
(663,633 bytes). The generator re-hashes the exact real-source P064 SWF and
the frozen question-content IR, replays 90 main-sprite frames by depth, and
records the effective Q1–Q35 and R1–R35 placements, inherited placements,
source transforms, and move-only updates. The 151 character replacements
without a new matrix carry the previous depth matrix as a static inference;
this follows the optional-field behavior described by the [Adobe SWF file
format specification](https://open-flash.github.io/mirrors/swf-spec-19.pdf)
and is corroborated by [Ruffle's placement
implementation](https://github.com/ruffle-rs/ruffle/blob/master/core/src/display_object.rs).
It does not run ActionScript or establish original-runtime authority.

Result: Q2, Q3, Q5, Q6, Q12, Q13, Q15, Q16, Q18, and Q19 have no *new*
unlabelled prompt text in their frame delta, but their effective display list
still contains an inherited source prompt. Q5/Q6 and Q18/Q19 retain number-
line art, with move-only coordinate changes. Q5's ten editable `Txt` fields
have static source default `0`; that is not accepted runtime copy. The
previous handoff's warning against inventing a missing prompt remains valid,
but it must not be interpreted as a blank effective frame.

The artifact is guarded by six focused regression tests covering exact
regeneration, no-overwrite and real-source-root checks, all 35 frame
pairs/options, the ten inherited prompts, four number-line moves, and
matrixless replacement transforms. To repeat:

```sh
node --test scripts/build-nms-l02-p064-active-display-v1.test.mjs
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' python3 scripts/build-nms-l02-p064-active-display-v1.py --check
```

At this checkout, the six new tests and the eight existing focused P064
state/content/audio tests pass. The source contract, content IR, audio
candidate index, and active-display generator all pass their `--check` mode.
The private Current-JS registry still has 472 distinct G6–G8 placements out
of the 2,282 active-page denominator; P064 is absent (1,810 remaining).
These are local engineering checks only; no worktree-wide test suite or
original-host review was completed in this continuation.

Next required implementation boundary: inspect source vector/diagram semantics
and any ActionScript-mutated text, then build an accessible responsive quiz
presentation from the source-bound state/content. Preserve the review-name
anomalies and run an authorized original-host natural trace before deciding
whether to reproduce or correct their behavior. Audio/listening, privacy-safe
modern host reporting, real My Lesson EN/ES flows, and all acceptance gates
remain separate.
