# P064 local presentation candidate — 2026-09-24

The full HELP MATH G6–G8 migration goal remains open in the dirty
`/Volumes/WestWorld/HELP MATH 2.0-g678-implementation` worktree. This is one
bounded advanced-manual P064 implementation slice, not factory scale-out or
Current-JS admission. The private registry remains 472 / 2,282 active page
placements, with P064 absent and 1,810 remaining at that gate. No unrelated
dirty files were reset or overwritten.

## Source and candidate

- Real source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`.
  P064 source is `G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`, SHA-256
  `f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`.
  The presentation generator requires the exact root, checks that it is a
  non-symlink directory, rehashes the SWF and frozen source IR/display list,
  and writes the generated output with exclusive creation.
- `scripts/build-nms-l02-p064-presentation-data-v1.mjs` generates
  `packages/demos/src/nms-l02-p064-presentation-data-v1.ts`. Current output:
  SHA-256 `518c44531318be4295f26afce53336e27c07f4799459b8d317f41a209dd8cc0e`,
  247,635 bytes. It carries 35 source-frame questions and 140 choices, 12
  exported source figure vectors and 16 source picture-choice vectors. The
  original FFDec SVG hashes and source character IDs are listed one-for-one
  in `asset-inventory.csv` (SHA-256
  `762f90963dc80c9e4a7f57f4ed2d18f1789a078c9c8d5384c27bd8c6bc7de96f`).
  Nine number-line instances are semantic SVG redraws keyed to source shape
  IDs, not exported source art or pixel-fidelity claims.
- `packages/demos/src/nms-l02-p064-quiz-candidate.tsx` and its CSS implement
  native-button, MathML, source-vector, responsive local presentation atop the
  existing pure state candidate. Ten questions are drawn without replacement;
  a deterministic test seed does not claim Flash RNG parity. Stale answer
  clicks are ignored. Grade, answer review, and Replay remain local; host
  exit/progress/reporting and legacy `getURL` paths are not invoked.
- The local-only EN/ES route is
  `apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx`.
  It requires development mode, the exact real-source-root environment, and
  loopback preview policy. It is `noindex`; it is not a My Lesson route.
  Its P064 module specifier resolves to the local source only in opted-in
  development, and to `apps/web/lib/g678-p064-candidate.production-stub.tsx`
  in both production Webpack and Turbopack configuration. This mapping was
  inspected in both modes; no production output bundle has been scanned yet.
  Source question text is English on both routes. ES UI labels and a visible
  untranslated/audio-pending notice are not translation acceptance.

## Local verification

- `HELP_MATH_G678_SOURCE_ROOT='<real root>' node scripts/build-nms-l02-p064-presentation-data-v1.mjs --check`
  passed with the exact output hash above. A repeat `--build` stopped at the
  expected `EEXIST` exclusive-create boundary; the generated file retained
  the same SHA-256 afterward.
- Four focused P064 test files passed 13 / 13 tests, including source-option
  order for irregular Q9/Q10 sprite IDs, 28 asset inventory entries and SVG
  hashes, 35/140 content identities, seeded state/Replay, and audio-candidate
  non-acceptance. Focused `tsc --noEmit -p packages/demos/tsconfig.p064-candidate.json`
  passed. Targeted ESLint on the new Next route passed under the app config.
- A broader `tsc --noEmit -p packages/demos/tsconfig.json` completed but failed
  on six errors outside this P064 slice: one P044 test, one P046 test, and four
  P054 tests. Do not describe the package-wide typecheck as passing or edit
  those unrelated dirty files as part of P064.
- The focused web route/config TypeScript check
  (`tsc --noEmit -p apps/web/tsconfig.p064-candidate.json`) and targeted web
  ESLint passed. Production and opted-in development configuration probes
  resolved the P064 specifier to the intended stub and source respectively.
- Local Chromium on the existing `127.0.0.1:3231` dev server loaded EN at
  1280px and ES picture Q9 plus EN number-line Q30 at 390px. Source image
  assets loaded; 390px document scroll width equalled the viewport width.
  A clipped mobile number-line endpoint and duplicate visible option letters
  were found, repaired, and visually rechecked. Keyboard Enter on an answer
  button advanced 1/10 to 2/10 and returned focus to the heading. A ten-answer
  browser pass reached result 3/10 and review. Chromium reported no console
  warning/error on checked routes. `meta[name=robots]` was
  `noindex, nofollow, noarchive`; a non-loopback Host and an extra query
  parameter each returned 404.
- The local browser checks above preceded the module-specifier/production-stub
  hardening. The shared dev server restarted while compiling another P051
  route; an HTTP retry for P064 timed out with no response, and even its `/en`
  route timed out. The port was still owned by the existing Next server, so it
  was not killed or replaced. Treat post-alias browser execution as
  **unverified** until the shared server is responsive.
- Visual receipts (local only): `.playwright-cli/page-2026-09-23T21-38-37-005Z.png`
  (EN desktop Q4), `.playwright-cli/page-2026-09-23T21-47-14-653Z.png`
  (ES mobile Q9 after option fix), and
  `.playwright-cli/page-2026-09-23T21-45-01-287Z.png`
  (EN mobile Q30 after endpoint fix). These are candidate UI views, not
  original-runtime comparisons.

## Independent gates still open

P064 has **no** Current-JS registration, descriptor/My Lesson admission,
original-Flash natural trace, source-host report/terminal decision, fidelity
comparison, audio cue schedule or listening acceptance, verified ES question
translation, named-human/Owner acceptance, strict completion, lesson release,
or publication. Static source-derived Q10 D, Q21 C, and Q23 C review-name
lookup anomalies remain visible and must not be normalized without original
runtime evidence. Candidate figure descriptions and the number-line redraws
still require semantic and human review. The 350 source MP3s are candidates,
not accepted cues. Before packaging this worktree, recheck the P064 local
route and scan an isolated production build to prove that candidate source
text/vector payloads are absent from public chunks; a server-side 404 and
static config mapping alone do not establish that boundary.

Next bounded work: establish an authoritative original-host natural trace of
question selection, Q/R review, audio timing and host terminal/report behavior;
then reconcile source anomalies and the modern privacy-safe My Lesson adapter
before any registration or broader generation. Keep every downstream gate
separate from local tests and visual candidate checks.
