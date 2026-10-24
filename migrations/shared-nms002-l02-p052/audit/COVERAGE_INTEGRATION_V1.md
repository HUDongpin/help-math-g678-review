# P052 supplemental coverage integration — 2026-09-23

The conventional `evidence/full-frame-coverage.json` now contains the160 native
main-domain candidate requirements from `native-main-capture-plan-v1.json`, in
addition to the two pending root requirements. It is no longer root-only.
`migration.json` declares main `sprite-350` as a156-frame nested domain under
root, with all20 candidate scenario IDs. Root runtime.frameCount remains10.

Every new row uses requirement schema2, a canonical selection hash and entry
state hash, a unique trace and coverage group, `coverageRole: partial-path`,
`strictAcceptanceEffect: none`, zero captured frames and all selected frames
missing. Natural original-runtime authority is required but unresolved. The
two legacy root rows now also require natural trace authority because their
scenario is interactive and depends on the legacy host/preloader.

This does NOT satisfy complete coverage. The160 partial requirements cover1704
candidate frame queries, not1704 images. They cannot collectively replace a
canonical full-domain requirement or create original-runtime/review authority.
Full-domain main natural paths, root/child disposition and source execution
remain pending. No generated trace execution or synthetic approval was added.

Maintained conversion: `scripts/lib/nms-l02-p052-coverage-v1.mjs`.
Readback check: `node scripts/check-nms-l02-p052-coverage-v1.mjs`.
Tests: `node --test scripts/lib/nms-l02-p052-coverage-v1.test.mjs`.

Verification: all three new tests PASS (all160 non-promoting rows; input drift
rejection; no forged baseline/capture/strict authority). Exact readback and
original candidate-plan regeneration PASS. Draft migration validator PASS,
explicitly schema-only, not path resolution or migration completion. Prior
50-test suite was not rerun in this coverage-only increment.

No actual view, route, registry, production build, screenshot or deployment.
Next complete the remaining implementation-spec metadata and child-domain
disposition record, then implement the actual HTML/SVG view and audio lifecycle.
Keep unresolved strict evidence explicit instead of repeatedly blocking ordinary
candidate engineering on unavailable original-runtime acceptance.
