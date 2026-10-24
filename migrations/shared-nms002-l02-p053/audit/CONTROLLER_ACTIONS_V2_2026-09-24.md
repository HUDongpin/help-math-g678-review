# P053 controller actions v2 — 2026-09-24

Status: source-bound, unregistered pure-state candidate. This supersedes the
state shape described in `CONTROLLER_CANDIDATE_V1_2026-09-24.md`; it does not
replace that retained v1 receipt or authorize a renderer or navigation.

## Exact source

`G6-G8-shared/NMS002/L2/GS/L2GS02.swf` in the real AWS Grade-Classified
Courseware directory is SHA-256
`f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`.
The source-audit `movie.xml` is SHA-256
`058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1`.
The following FFDec AVM1 scripts were rehashed in the external P053 source
audit; paths are relative to its `scripts/` directory:

| Action | Relative script | SHA-256 |
| --- | --- | --- |
| Early Repeat | `DefineSprite_187/frame_1/PlaceObject2_119_11/CLIPACTIONRECORD on(release).as` | `b0d5982c858956cfbe6308f372343fda348a0a68e5213e5b85d88ddec8f2f366` |
| Direction Repeat, frame 6 | `DefineSprite_187/frame_6/PlaceObject2_119_11/CLIPACTIONRECORD on(release).as` | `46e127caaa3d4fd6ad6d1f9eb40fd529f1091166580ef3f4e0a66da8b1f0d76a` |
| Direction Repeat, frame 7 | `DefineSprite_187/frame_7/PlaceObject2_119_35/CLIPACTIONRECORD on(release).as` | `46e127caaa3d4fd6ad6d1f9eb40fd529f1091166580ef3f4e0a66da8b1f0d76a` |
| SelectLevel Skip | `DefineSprite_187/frame_693/PlaceObject2_186_32/CLIPACTIONRECORD on(release).as` | `998cd607cf3196ddbaf33092005b9511accfafb125de5eb8faff369ec6a60dcb` |
| Directions popup Close | `DefineButton2_101/BUTTONCONDACTION on(release).as` | `387cb2cbf117dab2b1a1fe7b51c88f44d7dd88be2f9f4544ff3ae2320ec42f49` |
| SelectLevel entry | `DefineSprite_187/frame_693/DoAction.as` | `808be1fa1fb86f9c632126b90d96ddf67b7587e329476f9c61fd8f793a31fe2b` |
| Late Start rollOut | `DefineSprite_187/frame_693/PlaceObject2_136_43/CLIPACTIONRECORD on(rollOut).as` | `39a0ff2b4435c5974afcb4438278b3e35f5f9371e96fab18970ce58234c92b70` |

The XML places button 101 inside sprite 104, which is placed as `Mc_Popup`
in sprite 187. The late Start without a selected level instead sets
`Mc_Msg._visible=true`; these are not the same popup. At frame 693 the source
hides `Mc_Popup`. Skip disables Start, both level buttons, and Repeat before
showing `Mc_Popup`. Close re-enables those four controls and resets Repeat's
button frame to 1, but its final assignment is `this._visible=false`, **not**
`_parent.Mc_Popup._visible=false`. This source-static evidence does not prove
that the entire popup becomes invisible; the `this` receiver and visible result
need an original-runtime click trace. Start rollOut hides `Mc_Msg` only.
Early Repeat requests `gotoAndPlay("RepeatDirection")`; the frame-6/7 Repeat
handlers request `gotoAndStop("SelectLevel")`.

## Candidate and test boundary

The maintained pure controller is
`packages/demos/src/nms-l02-p053-controller-candidate.ts`, SHA-256
`cb3f3c1077d82d40a0ed1b5986e3653fa3b084571971ede186dfa353d4627858`.
It now separates inline warning, level message, and directions popup; rejects
events while the directions popup disables controls; and emits Repeat label
intents without advancing elapsed frames. After Close, the candidate records
`unresolved-after-close` for popup visibility rather than inventing a hidden
parent. Explicit entry to `SelectLevel` resolves this, because that frame's
script sets `Mc_Popup._visible=false`. The paired test is SHA-256
`2d5c3a9c94db48529e75cfe40531a014bc4df7c65f1bb244677d3cc771a0fb6b`.
Eight focused tests and an isolated strict TypeScript check pass. The source
button-frame reset and full 694-frame visual/audio progression are not yet
implemented. No original-runtime click trace, actual host navigation,
renderer, registry/descriptor entry, My Lesson browser evidence, audio
listening acceptance, human/Owner decision, strict completion, release, or
publication is claimed.
