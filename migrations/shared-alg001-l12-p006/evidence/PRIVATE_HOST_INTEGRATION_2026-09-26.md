# P006 private My Lesson integration — 2026-09-26

Status: unregistered local engineering candidate. No acceptance or publication effect.

## Implemented boundary

- Added the maintained module/config for the mask-corrected v2 drawing, root 10 frames, main sprite-53 342 frames and title sprite-56 one frame. Audio remains disabled; Spanish UI explicitly uses English source drawing.
- Added a silent 12fps visual clock with pause, seek, Replay and terminal stop. Added private My Lesson adapter and local-only page/asset route. The probe preserves all 52 source-ordered lesson pages and simulates only placement six as available; the official lesson remains 19 registered pages, while the probe has 20.
- Candidate glossary controls use the source-derived clipped hit-region availability. They are separate modern buttons below the drawing, not proof of original Flash point-hit or overlay fidelity. Requests use the existing host glossary API, pause playback and require explicit resume after close.
- Independent glossary review identified missing Inequality in the inherited lesson descriptor. The private probe appends the exact audited bilingual entry, hash-binds the audit/catalog, and checks all four button terms. Shared lesson descriptor and registry are unchanged.
- Production aliases use an empty private-host stub. No provider action or source archive mutation occurred.

## Checks completed

- Pure clock, glossary state and candidate hit geometry: 15/15 tests passed. Initial exact floating-point duration assertions were corrected to 1e-8ms tolerance; frame and transport assertions remain exact.
- Module/source hash, all 342 forward/reverse frame states and blocked domains/languages: 3/3 passed.
- Asset server/route policy tests: 3/3 passed. These are helper/source-contract checks, not positive live HTTP endpoint proof.
- Final host descriptor/route source tests, including exact four-term bilingual mapping: 4/4 passed.
- Scoped strict TypeScript check for clock/state/hit implementation and tests passed.
- Production asset profile: 1,320 files, checksum 54e11e77a8d684fcf9542ba7458c12add3edb1a85c16ac99db756a34ed5c6ad4; 11 deployment-asset tests passed.
- First full build compiled but failed at default approximately 4GB TypeScript heap limit. Retry with NODE_OPTIONS=--max-old-space-size=8192 exposed an actual descriptor union typing error. The host input was narrowed to PageOnlyLessonPlayerDescriptor; subsequent full npm run build passed compilation, TypeScript, 250 static pages and build traces.
- Production static chunks contain none of data-p006-host-probe, sprite53-four-layer-mask-corrected, or P006 invalid elapsed time. This is a bounded marker scan, not an exhaustive package provenance claim.
- Actual production HTTP checks on temporary loopback port 43216: EN page 404, ES page 404, exact-hash Canvas asset URL 404; no candidate host/runtime marker in responses. Server stopped after checks.

## Preserved identity and progress

- Registry SHA-256: b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9.
- Shared host SHA-256: 494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78.
- Fresh catalog/registry intersection: 480/2,282 = 21.034180543383%; 1,802 unregistered. P006 remains outside the registry.

## Next required work

Independent read-only agent review identified three unresolved host integration defects. These block product calibration and registration even though the build and current tests pass:

1. The drawing reports updating/ready for each frame; the adapter treats each ready transition as startup and clears its RAF timestamp. Candidate playback can run slower than 12fps with paint latency, and seek availability can flicker. Separate initial asset readiness from per-frame paint readiness before browser timing checks.
2. Shared glossary close restores the previous playing state, while P006's DOM observer tries to enforce stay-paused afterwards. This timing-dependent conflict needs a deterministic adapter/host transition contract without editing the frozen shared host casually.
3. Reduced-motion Play keeps the local clock paused but can leave the shared host showing playing. Synchronize host/adapter state or allow an explicit user Play according to the chosen reduced-motion contract.

The reviewer made no code edits. No browser validation has been claimed for these transitions. Add regression coverage and resolve these findings before capturing final host evidence.

Positive local browser verification is not yet established: Canvas load, actual glossary modal lifecycle/focus, pause/resume/Replay/seek, navigation cleanup, EN/ES responsive layouts and reduced motion. Inspect candidate captures only after matching the current successful build boundary. Do not equate static state tests or production denial with real host validation.

Original-runtime natural trace, visual comparison, stream timing/audio listening, Spanish drawing acceptance, human/Owner review, strict completion and publication remain open. P005's separate original-host hold is unchanged.
