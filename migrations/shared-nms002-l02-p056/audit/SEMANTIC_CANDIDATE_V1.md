# P056 source-timed semantic view candidate — 2026-09-24

This record covers an **unregistered local view candidate**, not My Lesson
admission, original-runtime fidelity, glossary acceptance, audio acceptance,
human/Owner review, strict completion, release, or publication.

## Exact source and implementation

- Placement `shared-nms002-l02-p056` uses the real NMS002/L2/TS/L2TS03.swf,
  SHA-256 `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`.
  The byte hash was rechecked on 2026-09-24. The retained display-list IR
  covers all 234 sprite-24 teaching frames; the 10-frame root is distinct.
- `packages/demos/src/nms-l02-p056-semantic-view-v1.tsx` derives teaching-text
  alpha from `p056SourceSpriteFrame` and owns no clock. Its CSS file of the same
  stem uses the HELP Math lesson font variables and a responsive 4-step plan.
  This is a maintained HTML interpretation of source teaching text, not a
  pixel reconstruction of the Flash stage or a substitute for original-runtime
  evidence. Source art remains in the separate SVG candidate.
- Source text ID 9 (`Restate the question.`) is visible from frame 1. IDs 14
  (`2 Organize the information.`) and 12 (step-2 plan text) fade in on frames
  9–17. ID 20 (`What information do I have?`) fades in on 102–111; ID 22
  (`What information do I need?`) on 154–163. The terms briefly flash via IDs
  18/19 on 32/34/36 and 42/44/46. Empty plan steps 3 and 4 remain empty
  visually; an off-screen description exposes their absence to screen readers.
- Source buttons 16/17 carry request keys `Organize`/`Information` (the second
  visible label is lower-case). The component can emit these exact keys to a
  caller only once both buttons are fully opaque at frame 17. It does **not**
  execute AVM1, implement `DoHyperLinks`, open a glossary, stop/resume the host,
  or claim that a callback has resolved the L2 entry. Without a caller the
  terms are plain, noninteractive text rather than misleading fake links.
- The local-only calibration route is
  `/en|es/migration-status/g678-calibration/shared-nms002-l02-p056?frame=1..234`.
  It is gated by non-production loopback preview policy and the exact real
  source-root environment binding. Each request rejects a symlinked source root
  or SWF and rechecks the exact SWF SHA-256 before rendering. It is not a page
  registry entry, descriptor,
  modern My Lesson host flow, or release route. The route supplies **no**
  glossary callback. Its ES surface is explicitly `source-fallback` with
  `lang="en"`; it contains no asserted Spanish translation.

## Checks performed

- All 21 P056 targeted source, audio-IR, display-list, SVG, behavior and new
  semantic tests passed with `HELP_MATH_G678_SOURCE_ROOT` set to the real
  directory; none skipped. The source regeneration tests checked byte identity
  and fail-closed no-overwrite behavior. Demos and Web TypeScript no-emit
  checks passed.
- The loopback calibration route rendered at 1280×900 and 375×812; the 375px
  plan reflowed to one column with no document horizontal overflow. At
  812×375 it stayed within the viewport; at a 375px viewport with a 200% root
  text-size simulation, teaching text wrapped without horizontal overflow.
  These are candidate layout observations, not the full EN/ES host matrix.
- The ES loopback route retained English teaching text with `lang="en"` and
  `data-language-policy="source-fallback"`. The route rejected `?frame=0`
  with HTTP 404. The browser console had no errors in the inspected run.
- Candidate-only screenshots: `evidence/semantic-candidate-en-frame234-375px.png`
  (SHA-256 `6eb556a4d14140f82c83701ba5ba86db991b44b5ad425ffc7d6c4263e0404c6c`)
  and `evidence/semantic-candidate-en-frame234-1280px.png`
  (SHA-256 `b0fea772c31780ccd8c0c2584c996b80b7cc740da47ba092202978ed5afbd02b`).

## Open gates

The exact lesson-2 `L2KTE01.xml`/`L2KTS01.xml` pair remains unrecovered in the
examined custody, as documented in `KEYTERM_SOURCE_BOUNDARY_V1.md`. Do not
borrow the lesson-1 entries. `ASR_SOURCE_LANGUAGE_V1.md` supplies a local
machine lead for English/Spanish source narration, but the embedded stream and
same-stem SA are not an accepted host audio binding. Natural host entry, source stop/resume and Replay,
reviewed Spanish copy, exact typography binding/technical records, real My
Lesson EN/ES flows, original-runtime comparison, listening, human and Owner
review are all pending. P056 remains outside the 472 registered Current-JS
placements and outside every downstream acceptance numerator.
