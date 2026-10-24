# P052 executable native capture states — 2026-09-23

Source SHA-256: `5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
Status: unregistered engineering support; no view or captured images.

`packages/demos/src/nms-l02-p052-capture-state-v1.ts` defines 20 candidate
scenarios and replays their events through the maintained state reducer. Each
step carries its source button/main-frame basis or an explicit modern-host
adaptation. No desired answer, overlay or phase is injected directly.

The scenarios cover intro1–114; practice0/35/75/100; first wrong; retry Reset;
first and retry correct; second wrong reveal; help; both glossary terms;
glossary and help return; both solved outro paths116–156; terminal completion;
Replay from nested glossary; paused help. The last scenario exposes the current
pause behavior for future browser review; it does not establish modal usability.

Every query reports main domain `sprite-350`, root entry6 and the requested
main frame. Root remains10 frames; main remains156. Invalid domain, scenario,
frame, language and seed combinations fail instead of silently clamping. An
outro query at156 is still phase `outro`; only the explicit completion scenario
includes the native visual/audio completion event. Entry state is stable across
frames in a scenario, with language, root placement and full reducer state.

## Reproducible candidate plan

Run `node_modules/.bin/tsx scripts/build-nms-l02-p052-capture-plan-v1.mjs --check`.
The builder verifies preserved and actual external source hashes, pins its
maintained inputs, reuses the workbench canonical JSON encoding for entry-state
hashes, and creates an exclusive-write or exact-readback candidate plan:
`native-main-capture-plan-v1.json`.

It selects actual reducer seeds for all four first-wrong audio cues:
S1=1, S2=0, S3=3, S4=2. Across EN/ES, four seeds and 20 scenarios it records
160 candidate requirements and executes1,704 main-frame state queries.
This count is not a screenshot count or migration/page completion metric.

Plan SHA-256: `66b7e88349f5e02f2d5efa9f34543ecf3aec1db1991e3d979cf25834e2bc285f`.

## Checks and remaining scope

- Six capture-state tests pass: all ranges/languages/replay checkpoints,
  independent answer/reset expectations, nested ownership, terminal boundaries,
  all four audio choices and invalid capture combinations.
- Combined state/copy/intro/capture/audio-plan/audio-window suite:46 tests pass.
- Targeted strict TypeScript passes. The initial test helper inferred a literal
  frame union; explicitly typing its frame argument fixed that test-only error.
- No production build, browser capture or image comparison was performed.

This is not the conventional coverage-v2 or authoritative natural-trace schema.
The existing root-only `evidence/full-frame-coverage.json` remains an incomplete
scaffold; do not run it and report full-page coverage. Root/preloader and all
reachable child-domain dispositions, feedback child clocks, click domains,
original-runtime event timing and execution, and coverage-v2 reconciliation
remain required. The candidate's event checkpoints cannot stand in for observed
source pre/post checkpoints or source timing.

Next integration must reuse this pure query rather than fabricate browser-only
scenario snapshots. Finish those remaining domain/spec contracts, implement
the HTML/SVG view and real audio controller, then test the actual My Lesson
host, responsive/keyboard behavior, lifecycle, Replay and deterministic DOM
identity. Current-JS registration, source fidelity, audio listening, human/Owner,
strict and publication gates remain separate and pending for P052.
