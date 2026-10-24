# G6–G8 typography integration

The shared fonts, text/source/snapshot interfaces, native templates, Canvas plane,
resolution and extraction tools are installed in this active worktree. The real
My Lesson runtime selects a page's declared native `textPresentation.Renderer`,
waits for its `prepare()` assets, exposes the uncropped typography host layout,
and preserves the original renderer for source-evidence capture.

This is the shared presentation adapter. G6–G8 continues to use its existing
`authoredTimelineControls`, `interactiveStops`, `interactiveSeek`, source audio
and typed lesson-host APIs. The different G3–G5 `frameControl`, activity, completion,
key-term and source-main-audio extensions are explicitly rejected here until a
deliberate host integration is implemented. Do not declare an unused callback.

Import `LessonTextPresentation`, `buildLessonTextSnapshot`, `LessonCanvasPlane`
and the types from `@helpmath/demos/lesson-text`. A page declares a real native
renderer and source-bound `LessonTextBinding` in its optional `textPresentation`.
Graphics and text consume the same existing teaching state. Font/viewport/DPR
changes must not reset state, input, seed, progress or audio. Reduced motion uses
an explicitly declared source-readable frame; unanswered interactions stay held.

The baseline in `catalog/typography-v1/g678-integration.json` records all existing
G6–G8 module bytes as an unassessed backlog. New registrations and changed existing
modules are checked by `npm run check:typography --workspace @helpmath/demos`, also
run after demos typecheck. This does not change Current-JS registration counts.

For each such page create `catalog/typography-v1/g678-page-bindings/<placementId>.json`
and `catalog/typography-v1/g678-checks/<placementId>.json`. The binding includes
schemaVersion 1, placementId, animationId, sourceSwfSha256, sourceRelativePath
inside the existing `HELP_MATH_G678_SOURCE_ROOT`, blocks, source-role decisions,
unresolved technical issues, and implementation.files with every page dependency
plus the integration's sharedFiles. The checker re-reads the actual source SWF.
`sourceCatalogContentSha256` is SHA-256 of
`JSON.stringify(collectSwfTextSourceCatalog(rawSwfBytes))` from the shared parser.
Every block uses actual source text IDs or exact source shape/hash decisions.
No required text is handled by `textDisposition: no-required-teaching-text` plus
the same source-risk and graphics verification, never by skipping the page.

The check record has kind `g678-lesson-typography-check-v1`, placementId,
sourceSwfSha256, bindingSha256, actual checkedAt, current artifacts, languagePolicy,
resolvedSourceRisks and the checks sourceBinding, semanticText, mathSemantics,
timingAndReplay, teachingTextDisposition, hostIntegration, responsiveTypography,
accessibility, bilingualPolicy, performance, lifecycle and resourceStability.
Each required result must actually have passed. Evidence hashes and source text
IDs are independently checked. EN/ES fallback stays explicit; source/translated
ES requires Spanish blocks. This record does not create a human review.

Use the shared device/browser matrix in LESSON_TYPOGRAPHY_DEVELOPMENT.md. The G3–G5
catalog generator's default 1,751-page entry point is not a G6–G8 generator: use
the shared single-source parser and this G6–G8 checker with the existing source
profile. The denominator remains 2,282 active placements in 44 lessons. Existing
pages are not modernized by installing this library. No source asset, original
renderer, registry entry, student record or acceptance ledger was overwritten by
this integration.
