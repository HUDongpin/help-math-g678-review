# P004 composed drawing candidate

Main implementation and independent checks, 2026-09-26. This advances the page
from extraction/specification to an unregistered engineering drawing candidate.

## Maintained implementation

`scripts/build-g678-alg-l12-p004-candidate.mjs` locks the physical SWF, XML,
main/title Canvas exports, helper and reference adapter spec to SHA-256.
It composes main 90, title 92 and border 93 in their source depth order. The
border is derived from the locked XML's two contours and 19 straight edges.
All drawing remains editable source-derived vectors/glyphs, not screenshots.
Canvas fits the 969-frame timeline and five source morphs; video would discard
interactive glossary behavior and flatten the source. A wholesale hand-redraw
is not needed to make the current source behavior queryable.

Generation creates `candidate-v1/{canvas-renderer.js,adapter-spec.json,adapter-manifest.json}`.
`--check` byte-compares the reproduced outputs. `--promote` performs only an
exact, no-overwrite custody copy into
`work/g678-shared-page-factory/g678-alg-l12-p004-current-js-v1/members/shared-alg001-l12-p004/canvas-renderer.js`.
It does not register, release or accept the page.

Runtime: 18,639,014 bytes, SHA-256
`d4cd5a861761c4548793b8f94468b5284d5a1c98a68bc99ff5267344df124d13`.
Main domain is `sprite-90`, one-indexed 1–969; the root is structurally held at
6. The title is one frame. A fresh drawing surface for each request prevents
Canvas state from making Replay/repeated frames depend on previous draws.
Source English only, silent, with interaction explicitly unresolved at the
drawing-asset layer. A maintained product module must add the actual controls.

## Executed checks

- Candidate generation, `--check`, and canonical custody copy: PASS.
- Candidate tests: 3/3 PASS. Exact regeneration; post-composition active
  primitive rejection; isolated registration; source frame/domain resolution;
  invalid frame/language rejection and duplicate-registration rejection.
- Browser drawing sweep: all 969 frames rendered with no drawing exception;
  236 distinct full-stage RGBA hashes. Seven reverse/repeated frame requests
  matched their original hashes exactly. Full ledger:
  `current-js-drawing-sweep-2026-09-26.json`.
- Measured draw-call p95: 4.8ms; maximum: 333.4ms. These are a single browser
  sweep's timings, not general throughput or smooth-playback acceptance.
- Main visually inspected the terminal diagnostic screenshot: source title,
  table, coordinate graph, colored lines/region, vertical-line-test sentence
  and border are present. Screenshot:
  `output/playwright/g678-p004-drawing-20260926/terminal-diagnostic.png`.
  This is a standalone diagnostic, not post-build My Lesson acceptance or an
  original-runtime comparison.
- Probe console recorded one favicon 404 and one Canvas readback performance
  warning. Do not describe the probe console as completely clean.

## Remaining integration and acceptance

The module and timeline have now been implemented and independently reviewed.
Their focused tests plus the pure glossary helper tests pass 10/10; targeted
strict TypeScript compilation passes. The agent's attempt at the full demos
typecheck exhausted the default Node heap; it is not a passing whole-package
result. Actual EN/ES My Lesson behavior, build and admission remain separate.

The page-local adapter explicitly follows the frozen shared host: close
restores the pre-glossary pause state. The pure helper still defaults to
stay-paused, as the source brief describes; the adapter deliberately adds the
host-policy transition and marks original-host parity pending. Main found
that a prior pause could remain stuck after later Play; the agent added an
explicit host Play transition and regression test. Pending/denied requests
cannot be released by that transition. Main independently reran the tests.

Main also found that the predecessor's 28 glossary entries cover only Point
and Vertical from this page's five requests. Rather than accepting three
blocked controls, main rehashed the physical EN/ES XML files under
`/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI` and
reused the maintained hash-pinned legacy record parser. All five bilingual
definitions resolve uniquely and agree between the two files. The generated
`audit/source-glossary-v1.json` is 7,835 bytes, SHA-256
`de4e8c0cd9492b4f297fc2edb0ee3c3446e63537d6adf24c111b95a9dd124e67`.
The extractor's `--check` passes. Vertical-line test has a lowercase raw
ScreenkeyTerm; the exact SWF request uses an uppercase first letter. This
unique case-insensitive mapping is explicit in the artifact, with the raw
value and original-host-lookup-pending status preserved. The successor should
retain all 28 predecessor entries and add Graph, Function and Vertical-line
test, for 31, before actual five-control host validation.

No authoritative original-runtime capture, full-frame comparison, source audio
acceptance, reviewed Spanish content, typography acceptance, human/Owner
approval, strict completion or publication is established here. Registered
coverage is still 478/2,282 until the actual product admission gate is passed.
