# P052 source intro scene — 2026-09-23

The intro source data is generated from the exact preserved SWF SHA256
5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638.
This is source extraction plus a queryable scene, not a rendered product page.

`scripts/generate-nms-l02-p052-intro-scene-v1.mjs` reparses the SWF, verifies the
root6 main placement and matrix[1,0,0,1,8248,5666], applies ordered source
placements/removals through main frames1–114, and expands the only nested intro
sprite165 (single-frame track child164). Masks, filters, clip actions, blend
modes, unexpected nested sprites or non-alpha color transforms fail closed.

Output contains66 exact frame ranges covering114frames and37 source SVG shapes.
Matrices retain twips translations; SVG path geometry is in pixels. A future
renderer must convert matrix translations by20 exactly once, and use each
SVG's recorded origin offset to reverse FFDec's bounding-box normalization.
The full exported SVG retains its own normalization group and gradient defs;
do not apply that translation twice. Prefer isolated SVG image instances or
uniquely scoped gradient IDs when placing multiple vectors in one DOM.

The Ruby REXML helper parses actual XML, permits only the observed SVG/group/
path/gradient structure, rejects DTD/entities, active elements, event handlers
and external URL/href references, and verifies one normalization group with
optional defs siblings. Initial strict single-child validation rejected real
gradient defs; the supported structure was corrected without discarding defs.
Original SVG bytes remain hash-bound and unchanged.

`packages/demos/src/nms-l02-p052-intro-scene-v1.ts` exposes exact-frame queries
and source digit strings. It rejects frames outside1–114 rather than clamping
practice/outro into the intro. Root10/main156 remain separate metadata.

## Verification

Six scene tests passed: complete frame-range partition; everyshape resolved;
root/main/frame identity; digits001→016→000; source prompt fade and nested
track; every direct object's compiled transform compared with the earlier
independent display-list audit; invalid frame rejection. Targeted strict
TypeScript passed for scene/query/test and imported generated data.

The generator's `--check` reproduced both outputs exactly. The combined existing
state/copy/audio plus scene suite totals40tests, all passed.

Source-vector contact sheet was inspected at
`/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p052-vector-preview-AmQEXc/source-vector-contact.png`.
It shows all37 selected vectors, including base grid/digit boxes, pointer171,
track164, button backgrounds and the authored increasing/decreasing blue-cell
geometry. It is a59KB labeled asset preview, not a full-page reconstruction,
original-runtime capture or human visual acceptance. Free destination capacity
was281GiB before this bounded preview.

Pending: complete renderer/capture/domain/entry-state specification, mapping live
EN/ES text to the source timing, actual intro/practice/outro view, controller and
My Lesson integration, build/browser/typography checks. Do not substitute a
generic grid-count animation for these authored intro vectors. Independent
original-runtime/fidelity/listening/human/Owner/strict/publication gates remain
pending.
