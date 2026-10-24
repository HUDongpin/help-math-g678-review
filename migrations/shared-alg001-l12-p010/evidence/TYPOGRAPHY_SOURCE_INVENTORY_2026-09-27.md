# P010 typography source inventory — 2026-09-27

This is the P010 source and static engineering inventory for `shared-alg001-l12-p010` / `VB/L12VB05.swf`. It binds the physical SWF, independent maintained parser, sealed public-tool Canvas export, original source geometry, generated native text data, all 58 shape classifications and the source-linked glossary contract. It does not execute Flash, change the registry, operate the My Lesson host, listen to audio, or establish acceptance.

Inventory: `migrations/shared-alg001-l12-p010/audit/typography-source-inventory-v1.json`, 1,910,367 bytes, SHA-256 `02385ffeec859786153977961344386243e27aa51431e00d826bda8a2eb57931`. Source: 183,770 bytes, SHA-256 `a846950547f7c3ab7b0445dfc2118d534565ffd352b6e9687ba8211e5d4a3fcd`. Original source geometry remains unchanged at SHA-256 `2fb18d047c60819c8508e4414a7d4a193b62cd1f40df1cbf19cb56b2d43b1bcd`.

## Source domain and teaching roles

The root declares 10 frames and places sprite 96 at root frame 6 with matrix `[1,0,0,1,8248,5666]` twips. The child declares 465 frames. Root stop actions do not prove child termination; the child has no terminal ActionScript stop. The original host's terminal/loop policy remains unknown.

The source has 28 static text definitions, 52 exact runs, 53 text placement generations and 77 run/instance pairs. The inventory retains every source text ID, per-run glyph/advance/pens, text matrix, source-tag hash, placement event, source alpha and conservative rectangle visibility summary. It adds source-supported roles for the four definition groups, the shared zero, X/Y axis names, reused digits/signs, four point letters, split ordered-pair labels and their callouts.

Twenty signed axis labels use source depth mappings. Ten negative signs share definition 11 at source horizontal scale `1.4901885986328125`; digits and signs remain separate source components. All axis labels, the shared origin and both names retain their independent source placements and fade timing.

## Per-run baseline and ordered-pair evidence

Each of the 52 runs has its own pen/baseline, advance, font height and source text matrix. The 77 run/instance records retain those metrics and exact source visibility boundaries. A single definition-level baseline is prohibited. Callouts 56, 70, 85 and 95 each have three baselines at 380, 900 and 1420 twips. Source run x offsets differ between lines and callouts and remain unflattened. Stage baseline projection uses the run pen, text matrix, instance matrix and root sprite matrix in that order; later placement matrices remain in exact source events.

| Point | Source pair | Fragment placement frames | Callout placement frame |
| --- | --- | --- | --- |
| A | `(5,3)` | 248 / 273 | 277 |
| B | `(-4,2)` | 323 / 334 | 341 |
| C | `(-3,-5)` | 385 / 402 | 407 |
| D | `(5,-3)` | 432 / 445 | 453 |

Definition 50, `(5,`, is reused at depth 86 for A and depth 104 for D. Its two instance visibility summaries differ; no character-ID-only reveal rule is valid. A coordinate fragment's placement frame is not its complete ink or full opacity boundary. All 77 precise run summaries are retained for consumption by the maintained text generator.

## Shapes, title and exact native replacement membership

All 58 vector definitions were independently matched to decompressed physical SWF payloads and complete tag records, XML bounds and the sealed visual classification. The categories are 50 instructional graphics, two mask definitions, four glossary underline definitions, one hit-only region and one outlined title. Every referenced visual review artifact was rehashed. Source panel, coordinate grid, axes, ticks, origin, plotted points, red paths, guide lines and callout backgrounds retain their source graphics.

Root shape 97 at depth 108, generation 1, is the outlined title `Graphing in the Coordinate Plane: Vocabulary`. Its identity matrix and root frame 6–10 lifetime are retained. Native title replacement is bound to this exact placement.

There are also exactly 58 native suppression **instances**: 53 source text placements, four underline placements and the one root title. This is a different membership and denominator from the 58 shape **definitions**. The inventory independently derives those instance IDs and compares them to the current typography runtime metadata; it does not authorize broad shape suppression.

## Masks, reveal and diagnostic correction

Shape 18 masks depths 1→10 from child frame 10 and 11→20 from frame 69. Shape 30 masks depths 21→28 from frame 113 and 29→36 from frame 173. Exact mask histories and verified closed rectangles are retained. Prose run complete-ink/full-opacity boundaries are `[12,17,25,40,50,58,69]`, `[86,90,96,97]`, `[118,134,154,165,173]` and `[181,190,195,195]` for text definitions 20, 26, 32 and 36 respectively. Partial ink is a conservative geometry indication, not an observed original-runtime visible pixel.

The raw FFDec mask fills have alpha 164/255 and 184/255; raw exports remain preserved. Mask visibility is based on filled geometry while source **text-instance** opacity stays independent. The earlier sealed vector report's text/axes opacity sentence is superseded only in this successor's effective finding by the separate Main comparison: raw versus opaque child frame 465 differs within `[65,85,697,195]`, and the graph-region difference bounds are `null`. No axis difference or Flash runtime equivalence is claimed.

## Glossary source instance mappings

The nine button definitions produce ten exact instance mappings; Position is reused at depths 8 and 34 with separate source text and readable boundaries. All buttons use hit-only shape 21 and preserve `_global.KeyAttribute`, `_root.DoHyperLinks()` and child stop calls. The maintained contract's 16 tests passed, including exact source keys, hit geometry/lexical spans, complete-run boundaries, reused Position, independent length/width spans, pending state and close/Replay/navigation behavior. Close stays paused until explicit resume; original host return parity is unverified.

| Button instance | Text run and half-open span | Raw source key | Lookup key | First readable frame |
| --- | --- | --- | --- | --- |
| sprite-96/depth-4/generation-1 | `character-20/run-1` [1,6) | Point | Point | 17 |
| sprite-96/depth-6/generation-1 | `character-20/run-3` [0,16) | Geometric figures | Geometric figures | 40 |
| sprite-96/depth-8/generation-1 | `character-20/run-5` [0,8) | Position | Position | 58 |
| sprite-96/depth-14/generation-1 | `character-26/run-0` [0,6) | length | Length | 86 |
| sprite-96/depth-16/generation-1 | `character-26/run-0` [8,13) | Width | Width | 86 |
| sprite-96/depth-18/generation-1 | `character-26/run-2` [0,6) | Height | Height | 96 |
| sprite-96/depth-24/generation-1 | `character-32/run-1` [1,17) | Coordinate plane/Cartesian Plane | Coordinate plane/Cartesian Plane | 134 |
| sprite-96/depth-26/generation-1 | `character-32/run-3` [1,12) | Coordinate | Coordinate | 165 |
| sprite-96/depth-32/generation-1 | `character-36/run-0` [0,12) | Ordered pair | Ordered pair | 181 |
| sprite-96/depth-34/generation-1 | `character-36/run-2` [1,9) | Position | Position | 195 |

Only `length` → `Length` is an explicit lookup alias. `Geometric figures` retains its exact source key. Display labels and dictionary translations remain separate from source keys. Dictionary content acceptance is not established by these source mappings.

## Language and independent gates

Every literal English run is preserved, including the source grammar in definitions 32 and 36. Any grammar revision requires deliberate editorial review. Spanish navigation does not establish Spanish animation text: preserve an explicit English fallback until source-supported Spanish copy is accepted.

The producer independently reparses the physical SWF; runs the original geometry and text-data reproducibility checks; verifies raw Canvas and candidate closure; rehashes all 110 vector review artifacts; verifies all 58 shape payload/tag records; recomputes 52 run metrics; compares all 77 source run/instance summaries; and binds the 16/16 glossary test receipt. `--check` regenerates this inventory and report byte for byte. No source archive, prior audit report/receipt, candidate, product file or registry is written.

Original runtime, visual fidelity, listening/audio acceptance, human review, Owner acceptance, strict completion and publication remain separate and unaccepted by this artifact.
