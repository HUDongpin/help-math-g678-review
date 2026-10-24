# P064 source-risk UI continuation — 2026-09-24

This is a bounded implementation and verification step in the full HELP MATH
G6–G8 page-only migration. The intentionally dirty implementation worktree was
preserved. The current catalog/private-registry intersection remains **472 of
2,282** active placements, **1,810** unregistered; P064 is not registered.
`NO-GO-scale-out` remains in force.

## Source and implementation

The real (non-symlink) AWS source `G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`
still hashes to
`f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`.
The frozen question IR records ten Q5 `Txt1`–`Txt10` editable fields with
source defaults `0`. It also records three *static derived* review-instance
lookup misses: Q10 D (`R10Opt4 `), Q21 C (`R21Opt3`), and Q23 C
(`R231Opt3`). The exported original ActionScript constructs the review name
from the clicked answer instance name in `doShowReview()`. These are not
natural-host observations, and no source defect has been silently corrected.

The local-only candidate now shows a bilingual, visibly styled source-risk
notice on Q5, where its redrawn number line does not reproduce or establish
the runtime values and visibility of those fields. When an affected option
was selected, its review page shows a bilingual warning that the displayed
feedback is a modern candidate and original behavior is unverified. A small
maintained risk module retains the exact anomalous source names; its test
compares them and the Q5 fields directly to the frozen source IR. This does
not resolve the three anomalies or admit P064 to My Lesson.

## Checks and observed limits

- All six focused P064 demos test files passed **18/18**; four local production-
  boundary tests passed **4/4**. Focused P064 TypeScript passed. Targeted
  ESLint had zero errors and two existing `<img>` optimization warnings.
- Chromium on the opted-in loopback EN route with `seed=9714` showed the Q5
  notice on the first question. With `seed=9713`, the first question was Q10;
  selecting D, completing ten source-selected questions and opening review
  showed the Q10-D lookup warning. At 390×844, document width equaled the
  viewport width and the warning fitted within it. The browser reported zero
  console errors/warnings. A 390px screenshot is retained at
  `.playwright-cli/page-2026-09-24T00-36-11-726Z.png`. The browser session
  was closed.
- The full demos TypeScript command first exhausted Node's default ~4 GB
  heap. Re-running with an 8 GB heap completed analysis but reported six
  existing errors in P044, P046 and P054 tests, none in the changed P064
  files. Therefore **full demos TypeScript did not pass**. The exact focused
  P064 check did pass.
- The previous isolated production build and bundle scan predate this source-
  risk UI change. Four current boundary tests still pass, but no claim of a
  fresh post-change production bundle scan is made.

## Next gate

Obtain a controlled original-host natural trace for Q5 and each review-name
case, then review the intended behavior before page admission. Separately
complete actual modern My Lesson integration and G6–G8 typography validation.
The project original-runtime protocol requires an item-specific containment
readiness check, exact host/launch path, named human operator and explicit
Owner approval before a course SWF can be launched. No P064-specific
containment-readiness report or natural-host trace was found in the current
workspace, so no original runtime was launched in this continuation. Ruffle
would be forensic only, not an authoritative substitute.
Original-runtime fidelity, spoken-audio/listening, human and Owner review,
strict completion, release, and publication remain independently open.
