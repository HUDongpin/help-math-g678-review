# P053 native display source specification

This is a source-locked structural input for a maintained native teaching renderer. It is not an executed Flash trace or a Current-JS admission. Reproduce with `node scripts/audit-nms-l02-p053-native-display-v1.mjs --check`.

- Physical SWF: `G6-G8-shared/NMS002/L2/GS/L2GS02.swf`, 236774 bytes, SHA-256 `f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`; SWF 6, root 10 frames, 800×600 at 12 fps. Main sprite 187 is placed on root frame 6, depth 3, and has 694 local frames.
- Existing swfmill XML: `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/movie.xml`, SHA-256 `058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1`. Binary text catalog JSON SHA-256 `4b92f48d2416025e423aefb70ecd5873212fe697da3af6e2322a527f1733eb9e`. All 59 FFDec AVM1 exports are individually pinned in the JSON.
- Source has 39 text definitions and 44 decoded runs. 37 definitions are structurally reachable from the root (including button states). Text 14 and text 15 live in unplaced sprite 17; text 15's Inequalities title must not become the P053 title.

The JSON records each reachable local timeline's text, sprite, and button placement intervals as half-open frame ranges, with depth, source tag hash, matrix, color transform, alpha, clip depth, and update events. Child clip frames and main sprite frames are **different clocks**. A child placement does not establish its live local frame or on-screen visibility. Shapes and masks remain source-visual review work.

| Source association | Structural finding |
| --- | --- |
| Main title | Text 178 first placed in sprite 187 frame 586. |
| Directions popup | Sprite 104 placed at main frame 693 depth 47 and removed at 694; title text 103 and score text 102 are inside it, with Close button 101. |
| Early Start | Character 136 at depth 24 main frames 1–6, with source alpha 0/256 at frame 1 and 256/256 by frame 6; removed at frame 7. |
| Later Start | Character 136 at depth 43 main frames 693–694. It is a distinct placement generation. |
| Labels and controls | `RepeatDirection` is at main frame 3 and `SelectLevel` at 693. The static label is not proof of a natural stop or user outcome. |

At frame 693 the exported DoAction calls `stop()` and sets `Mc_Popup._visible = false`. Skip and Close scripts alter control state; Close ends with `this._visible = false`, whose receiver and whole-popup result remain unverified. The source may also change alpha, visibility, playhead, and dynamic score text at runtime. Therefore source placement is not a blanket visible-text snapshot. An original-runtime click trace, math/visual review, audio listening, and Owner acceptance remain separate.
