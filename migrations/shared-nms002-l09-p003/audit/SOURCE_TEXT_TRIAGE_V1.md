# P003 source text triage — 2026-09-23

Source: `G6-G8-shared/NMS002/L9/RW/L9RW03.swf`, SHA-256
`d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
This is an actual-SWF structural catalog and drawing-candidate observation,
not a passed `LessonTextBinding` or typography check.

`collectSwfTextSourceCatalog` found 10 static text definitions, 15 decoded
runs, zero unresolved runs, 8 font records, 215 shapes, 11 bitmaps, 11 frame
domains and no buttons or dynamic fields. Four unresolved source-risk kinds
remain: shape text, bitmap text, ActionScript visibility/value interpretation,
and mask/filter/blend semantics. Placement lifetime alone is not visibility.

| Source text ID | Exact decoded text | Source placement | Working disposition |
| --- | --- | --- | --- |
| 247 plus outlined shape 248 | `Properties of Operations: Real World Activity` | root frame 6, depths 297/298 (shape nested in sprite 249) | One page title; both source drawing layers must be suppressed for a native heading. See `TITLE_OUTLINE_SUPPRESSION_2026-09-23.md`. |
| 110, 111 | `Daily Fish Feeding Schedule` | sprite-246 frame 1, depths 247/248 | Two source layers for the teaching heading; do not duplicate the native heading. |
| 105, 228, outlined shape 227 | `Tank 1 = 5 bags of food` | 105 from frame 1; 228/227 transient at frames 590, 592, 594 | One semantic row; private exact glyph suppression exists, native emphasis styling pending. |
| 106, 239, outlined shape 238 | `+ 2 bags of food` | three 106 instances from frame 1; 239/238 transient at frames 615, 617, 619 | Repeated value with one emphasized row; private exact glyph suppression exists, native styling pending. |
| 107 | `Total:     11 bags of food` | sprite-246 from frame 1 | Total statement; check when readable. |
| 155 | ` FISH FOOD` | eleven placements beginning at frames 94–193 | Candidate retains printed bag marks in graphics, without eleven duplicate DOM readings; host accessibility/visual review pending. |
| 232 | `5 + 3 x 2` | sprite-246 from frame 591 | Late mathematical expression; must not appear early in native text. |

The root-held Canvas candidate shows the schedule at local frame 1 **and still
at frame 300**; bags appear beside its written rows, not in place of them.
The late `5 + 3 x 2` expression is revealed in five mask steps at local frames
591, 599, 605, 612, and 616. These are actual-SWF mask-placement facts paired
with local Canvas candidate observations, not original-runtime traces. See
`SOURCE_TEXT_BEATS_2026-09-23.md` and the maintained pure projection at
`packages/demos/src/timelines/shared-nms002-l09-p003-source-text.ts`.

A native HTML/SVG text presentation must use source-visible state and suppress
only matching exact source text instances, preserving the fish/bag graphics,
row-emphasis flashes, and 635-frame terminal. The source labels on eleven bags
have a candidate graphic-prop disposition, and the transient highlighted rows
have a private exact-suppression candidate. Native styling and actual host
checks remain open; see `EMPHASIS_AND_PROP_DISPOSITION_2026-09-23.md`.
Neither an English fallback on an ES route nor the raw Canvas glyphs count as
Spanish translation or modern typography completion.
