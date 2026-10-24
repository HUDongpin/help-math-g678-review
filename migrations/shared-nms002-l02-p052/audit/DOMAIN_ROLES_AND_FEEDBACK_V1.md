# Source domain roles and feedback clocks — 2026-09-23

Source SHA256:5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638.

`scripts/build-nms-l02-p052-domain-roles-v1.mjs` reparses the preserved SWF,
checks its actual external original hash, recomputes root reachability through
timeline placements and button-state records, and verifies pinned exported
ActionScript. Exact `--check` reproduces both outputs without overwriting them.

The source-role inventory binds all14 structurally root-reachable domains of84:
root host entry; main350; track165; thumb297; grid template298/container300;
help345; wrong322/right331 feedback; click8/318/327; coach347/349.
The other70 library domains are not declared runtime-inaccessible by this graph.
Root preloader invokes the external legacy host and stops at1. This is not
permission to call that endpoint or infer a natural root1–10 playback trace.

## Feedback implementation

Both feedback display lists have exactly three placements at frame1 and no
later placement/removal. Wrong322 contains319/320/321; right331 contains328/329/330.
Done explicitly starts the chosen feedback at2. Wrong stops at15. Right's
frame35 script is `stop(); gotoAndStop(1);`. Returning to1 does not remove
the display objects or hide the parent. Explicit Close remains mandatory.

Generated `nms-l02-p052-feedback-domains-v1.ts` contains these verified constants.
Maintained `nms-l02-p052-feedback-clock-v1.ts` maps nonnegative elapsed active
child frames to the source child frame. At step13 wrong holds15; at step33 right
returns1 and holds. Neither result closes parent feedback or truncates audio.
The future controller supplies active elapsed frames and excludes paused time;
that real controller lifecycle is not implemented or tested by this pure query.

## Failed assumption retained as an explicit finding

The first generator run rejected the assumption that audio-bearing domains have
no visual children (`sprite-8: unexpected visual child`, one placement).
Inspection resolved this as real source data, not an ignorable parser error:

- Click8/318/327 each place shape7 at frame1.
- Coach347 places text346 (`Coach_audio_2`) at1 and removes it at2.
- Coach349 places text348 (`Coach_audio_1`) at1 and removes it at3.

The generator now asserts those exact objects/events. It never marks them
nonvisual. Parent transforms, visibility and source runtime appearance remain
to be reconciled before final exclusion/disposition. No source files changed.

## Verification and boundaries

Four clock tests passed, including complete boundaries, parent-state retention,
invalid inputs and safe-integer maximum timing. Targeted strict TypeScript
passed. Combined P052 tests now50/50 pass. Source-role regeneration passed.

`source-domain-roles-v1.json` is engineering evidence, not the conventional final
`frame-domain-disposition.json`; every strict disposition stays unresolved.
The main capture plan remains1704 state queries, zero images, not full-domain
coverage. The conventional full-frame file still contains its root-only
scaffold. Original-runtime traces, final coverage reconciliation, renderer,
audio lifecycle, My Lesson registration and browser QA remain unfinished.
No fidelity, audio listening, human/Owner, strict or publication acceptance.
