# P064 source-text reconciliation continuation — 2026-09-24

This is a bounded continuation of the full HELP MATH G6–G8 migration goal in
the intentionally dirty `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`
worktree. P064 remains an unregistered engineering candidate. The current
private registry has 472 distinct G6–G8 placements of 2,282; P064 is absent,
so 1,810 placements remain at the Current-JS gate.

## New source-locked evidence

`scripts/audit-nms-l02-p064-typography-v1.mts` rehashes the exact real-source
`G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf` (SHA-256
`f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`),
checks the source directory is not a symlink, rehashes the frozen question IR,
effective display list and generated candidate payload, then independently
parses the SWF text/shape tags. It generated
`source-text-reconciliation-v1.json`, SHA-256
`acf1a4bb269d28ac775e540796791d82b771619689429f8122d7d6cce000bf9c`.
The parser's source-catalog-content SHA-256 is
`d9d57bde0ffb65d6e1adbf40e8fdae7e0c2cd7f6460d718f4e35c7742fa052ea`.

The report binds all 35 candidate prompts to exact source text character/tag
hashes, plus 124 text choices and 16 source-vector picture choices. It names
the five non-verbatim prompt presentations: Q7, Q20 and Q21 insert fractions
from separate source text characters 150, 335 and 348; Q9 repairs the source
`fractioncircle` word boundary; Q26 collapses source spacing. Every candidate
answer value was reconstructed from its own source text runs, including native
fraction numerator/denominator runs. The SWF parser found 649 text definitions
(158 static, 491 dynamic), 197 decoded static runs, and zero unparsed tags.

This establishes **structural text/option binding only**. Source risks remain:
unclassified shape text, button runtime state/actions, dynamic text values,
and ActionScript-controlled visibility/values. The 16 picture descriptions
are candidate interpretations, not reviewed semantics. No original-runtime,
Spanish translation, typography host, audio, or human/Owner acceptance follows.

## Checks and current boundary

- The new audit's `--check` reconstructed identical bytes. A repeated `--build`
  failed with expected `EEXIST`; its output SHA-256 stayed unchanged.
- Five focused P064 test files passed 14/14 tests; focused demos TypeScript
  passed. The new source-text test compares the report to the current
  presentation payload and keeps the independent claim flags false.
- `apps/web/tests/g678-p064-local-candidate-boundary.test.mjs` passed 1/1:
  both Webpack and Turbopack choose P064 source only for opted-in local
  development, and an inert stub for production or dev without opt-in. This
  verifies configuration resolution, **not** produced bundle contents.
- The G6–G8 typography checker was run with the exact real source-root env.
  It reported 46 of 50 new/changed pages checked and failed on four other
  placements (L1 P047, L2 P001, L2 P052, L9 P003). P064 is not in its
  registered-page set and gains no typography passage from this audit.
- The existing `127.0.0.1:3231` Next process recovered without being killed,
  restarted or replaced. Post-alias Chromium execution of the opted-in P064
  route reached Q9, answered the ten-question seeded quiz, showed a 2/10
  unsatisfactory result, reviewed the Q9 answer, and replayed to its initial
  state. The Spanish-host Q9 route retained source English question text and
  Spanish UI notice; no Spanish translation is claimed.
- The post-alias Spanish-host Q9 layout was inspected at 390×844 and 320×720.
  At both widths document width equaled viewport width, source picture images
  loaded, and no horizontal clipping was seen. Screenshots:
  `output/playwright/p064-post-alias-es-q9-20260924.png` and
  `output/playwright/p064-post-alias-es-q9-320-20260924.png`. The 390px route
  reported zero console warnings/errors and `noindex, nofollow, noarchive`.
  Non-loopback `Host: helpmath.ai` and an unexpected `publish=1` query each
  returned 404.
- An actual production output-bundle scan remains open; the WestWorld volume
  had about 11 GiB free at this checkpoint, so no broad build was launched
  into its shared `.next` tree.

Next: inspect an isolated production build for candidate source/vector absence
before any packaging. For actual page admission, establish authoritative
original-host natural traces and host/audio/report behavior, reconcile the
source review-name anomalies, implement and test the modern My Lesson adapter
and G6–G8 typography binding, and preserve all fidelity, listening,
human/Owner, strict-completion, release and publication gates independently.
