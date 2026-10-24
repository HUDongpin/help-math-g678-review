# P005 typography source inventory — 2026-09-27

Animation: `shared-alg001-l12-p005`, ALG001 L12 RW page 5. This is a bounded,
read-only source audit for the next native-text implementation. The only new
artifact from this audit is this document. Existing sources, extraction,
candidate runtimes, host, audio, registry and P006 evidence were not modified.

The confirmed visible teaching text is the outlined title in **character 394**:

> Graphing in the Coordinate Plane: Real World Activity

Character 393 has the same decoded string but is an **offstage static-text
sibling**, not the visible title. Exact suppression may target only the reviewed
character-394 placement. The remaining graphics are retained. This document
does not establish the absence of every possible outlined or bitmap label in
the full 968-frame animation.

## Source and reproducibility pins

The physical source root is
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`.
The current source read independently verified that this root is a real
directory, its realpath equals the literal path and it is not a symlink. The
SWF below is a real, single-link regular file with an unchanged device, inode,
size and modification time across the read; its realpath equals its literal
path. No compatibility symlink was used.

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| Physical `G6-G8-shared/ALG001/L12/RW/L12RW05.swf` | 1,950,595 | `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe` |
| `audit/movie.xml` | 36,296,747 | `944585dd7b3b53e2d65dc268fffcb1f5c81bde71de5f79c5d2c9c158a142f128` |
| `candidate-v2/canvas-renderer.js` | 19,449,678 | `48efbca3ddebf218565cdd635ffa130ae3a402c5693dd1ebcf359b2c30d500dd` |
| `audit/source-texts/393.txt` | 53 | `ddbc63afeb9217cb1a9008ac3ddd24b41c7eb90b4c001bee63ecd2f2fb0575e7` |
| `scripts/lib/swf-text-source-catalog.mjs` | 22,928 | `5a65075738bcdd62a9fb79cca0aaf7fe7ab59857bd3852fdf5063d6c1fe8a3dc` |

The existing extraction receipt identifies JPEXS FFDec 26.2.1; its XML and text
pins match the current bytes above. The maintained source catalog was freshly
computed in memory with `collectSwfTextSourceCatalog(sourceBytes)`. SHA-256 of
`Buffer.from(JSON.stringify(catalog))` is
`afad1a722a1e4c74d2ca4406375ca6e62e4f6dbd719354b86b3a23bae39a7fb5`.
No new catalog JSON, font, SVG or bitmap extraction was written. No existing
P005 standalone source SVG was found in the inspected migration/work/output
paths; the contour audit used the source XML and embedded font shapes directly.

The SWF is CWS version 6, with 2,262,082 declared uncompressed bytes, an
800×600 stage (`[0,16000] × [0,12000]` twips) and 12 fps. Root has 10 frames;
`sprite-391` has the distinct 968-frame teaching timeline. These frame domains
must not be conflated.

## Complete structural text inventory and its limits

| Source category | Current enumeration | Disposition |
| --- | ---: | --- |
| Static text definitions/runs | 1 definition, 1 run | Character 393/run-0 decoded; offstage in the reviewed composition |
| Dynamic text fields | 0 | No DefineEditText field to modernize |
| Embedded font | 1 font definition plus its name record | Character 392, 23 glyphs; XML names Bauhaus Md BT / Bauhaus Medium BT |
| Shape/morph definitions | 383 | 260 DefineShape3, 42 DefineShape2, 38 DefineShape, 43 DefineMorphShape |
| Confirmed outlined text shape | 1 of those 383 | Character 394 title, all 55 contours checked against the embedded font |
| Other shape/morph definitions | 382 | Preserve as graphics; exhaustive semantic exclusion of further text remains open |
| Bitmap definitions | 3 | Characters 2, 99 and 204; the parser does not decode their image semantics |
| Timelines | 9 | Root plus sprites 78/147/258/289/306/346/391/395 |
| Placement instances/events | 809 / 2,502 | Structural lifecycle enumeration, not original-runtime visibility acceptance |
| Buttons / unparsed supported tags | 0 / 0 | No parser failure hiding a text tag in this source catalog |

The bitmap source-tag hashes are `e5c3c092a6ceb88012e89085253e4411941d12394fa4ca23452ced1419aaacd6`
(character 2), `ca822f0bc168f05cff4ed34286ee23a94f0960c1b4d2f8af813f72b674ae0874`
(character 99) and `1f6b3e2c572a95d08da72f718b8c85a126563b3bd4f6a2293c69fc940bc672fc`
(character 204). None is promoted into a teaching-text string by this audit.

The catalog explicitly retains shape-text, bitmap-text, ActionScript visibility
and mask/filter/blend risks. One decoded static run is not evidence that every
other graphic is text-free. No question, numerical value, axis label, coordinate
pair, algebraic expression or mathematical formula is independently confirmed
in this bounded inventory. No such content should be invented for a native
overlay. The confirmed title is a lesson/page heading referring to graphing in
the coordinate plane; its colon is punctuation, not a formula operator.

## Exact title identities and placement

| Role | Definition/source ID | Source tag offset and SHA-256 |
| --- | --- | --- |
| Embedded font/code table | Character 392, DefineFont2 | `2256993`; `3c3303adec3e5418dfe85b046af8974008d14e790133421d8d7584b6afd0efea` |
| Font-name companion | Character 392, DefineFontName | `2258814`; `7a6a1133961f383571ee0e545dc978d6ec5134eb0497e37d9df3660af846eb4b` |
| Offstage semantic title | `character-393/run-0`, DefineText | `2258897`; `52f9d7b49856a93e5f5be4debf0bba882237e78637519a5a690805fb56d663cc` |
| Visible outlined title | Character 394, DefineShape | `2259029`; `64b21d8aaaf3819405b69db395a7fea5d89e4ff7fbb702dc518f088b0ad7b808` |

The exact visible instance path is
`root/depth-135/generation-1` (character 395, name `Mc_Page_Title`) →
`sprite-395/depth-2/generation-1` (character 394).
For a compact placement key, this is `root:135:1:395/sprite-395:2:1:394`.
The offstage sibling is
`root/depth-135/generation-1` → `sprite-395/depth-1/generation-1`
(character 393), compact key `root:135:1:395/sprite-395:1:1:393`.
These two instances are not interchangeable.

| Placement | Matrix `[a,b,c,d,tx,ty]` in twips | Placement-tag pin |
| --- | --- | --- |
| Root title container, depth 135 | `[1,0,0,1,8068,-848]` | Offset `2261951`, SHA `18acf4be76fab54b4a1059805b1baa70919a12a51df40fb725fdc69b619622e8` |
| Sprite 395 depth 2, visible 394 | `[1,0,0,1,0,0]` | Offset `2261939`, SHA `2d3e357b10f0bde2a865ba8b7c5b7ca73442d1683fcc2e4b1dcd280a16f092fb` |
| Sprite 395 depth 1, offstage 393 | `[1,0,0,1,-5661,-1912]` | Offset `2261927`, SHA `334b80df9f720bf2601c5e956b17cf83e2dad774495838fa193a83fd9b507211` |

Character 394 bounds are `x=-5720..5585`, `y=1473..1961` twips. Combining
the root matrix and dividing by 20 gives stage bounds
**x=117.4..682.65, y=31.25..55.65 px**. The shape has one blue solid fill
RGB `(16,63,159)` and a white 20-twip stroke (one source pixel).

Character 393 has an identity text matrix and bounds `x=16..11603`,
`y=125..593` twips. Its combined placement origin is `(2407,-2760)` twips,
or `(120.35,-138)` px; the actual bounds are
**x=121.15..700.5, y=-131.75..-108.35 px**. This independently establishes
the offstage disposition under the reviewed source matrices.

Neither level of the title path has a clip depth, filter, blend mode, explicit
visibility override or color transform. The two source mask placements are
inside sibling `sprite-391`: frame 1 depth 1/character 1 through depth 132,
and frame 493 depth 2/character 203 through depth 56. Their scope does not
include the root title sibling. A title replacement must preserve those masks
and the border character 396.

## Visible outlined-glyph decoding

Character 393/run-0 is exactly decoded through font 392's embedded Unicode
code table. It has 53 characters: 46 non-space characters and seven spaces.
Font height is 500 twips; the run has `yOffset=480` twips, blue RGB
`(16,63,159)`, no X offset override, and no dynamic values.

The source code-table order, indexed from zero, is:

```text
0:space 1:: 2:A 3:C 4:G 5:P 6:R 7:W 8:a 9:c 10:d 11:e
12:g 13:h 14:i 15:l 16:n 17:o 18:p 19:r 20:t 21:v 22:y
```

The 53 source glyph indices are:

```text
4,19,8,18,13,14,16,12,0,14,16,0,20,13,11,0,3,17,17,19,10,
14,16,8,20,11,0,5,15,8,16,11,1,0,6,11,8,15,0,7,17,19,15,
10,0,2,9,20,14,21,14,20,22
```

This decoded offstage string was not assumed to prove the visible shape.
Character 394's 874 shape records were independently segmented into all
55 contours by StyleChange/move boundaries. Their edges were compared with
font 392 glyph contours at `500/1024 = 0.48828125` scale, after translation
alignment of contour bounds. Lines were sampled in fifths and quadratic
curves in eighths for a finite geometric comparison. All 55 contours matched
the expected letters and punctuation; the maximum sampled symmetric
nearest-point distance was 5.865 twips (approximately 0.2933 source pixels).
This small difference includes outline conversion, curve simplification,
integer rounding and finite sampling; it is not a claimed exact byte match or
a bound on unsampled curve distance.

| Visible token | Character 394 contour indices, zero-based | Confirmed glyph role |
| --- | --- | --- |
| Graphing | `54,53,52,51,50,48/49,47,46` | Uppercase G; the i dot and stem are separate contours |
| in | `44/45,43` | i dot/stem then n |
| the | `42,41,40` | t, h, e |
| Coordinate | `39,37/38,35/36,34,33,31/32,30,29,28,27` | Uppercase C; both o holes and the i dot are accounted for |
| Plane: | `26,25,24,23,22,20/21` | Uppercase P; paired upper/lower colon dots |
| Real | `19,18,17,16` | Uppercase R |
| World | `15,13/14,11,12,10` | Uppercase W; o inner/outer contours; spatial reading order differs from record order |
| Activity | `9,8,5,4/6,7,2/3,1,0` | Uppercase A; both i dot/stem pairs accounted for |

Spaces have no outline contour. Their word boundaries are corroborated by the
placement gaps and the independently decoded semantic run. The exact visible
string preserves uppercase **G/C/P/R/W/A**. The P006 lowercase outlined title
must not be reused as evidence for P005 casing.

## Timeline visibility, reveal and candidate distinction

The source places root character 395 at root frame 6 and retains that
generation through root frame 10 (`lastFrameExclusive=11`). Sprite 395 has
one frame; both child instances begin at local frame 1 and are retained
(`lastFrameExclusive=2` in its one-frame structural domain). There are no
title replacement/movement/removal events, character reveal sequences,
per-word timelines or source dynamic title values.

Root frame 1 requests the host preloader's `jump_check` and stops. Root
frame 6 is labelled `begin` and stops. The main animation is the separate
root depth-1 character 391, named `animation`; its frame 968 stops. These
static actions do not prove the original host's natural transition or clocks.

The audited candidate-v2 `resolveFrameState()` explicitly fixes `rootFrame=6`
for every request in teaching frames 1..968. Its render function composes
`sprite395` at pixel matrix `[0.05,0,0,0.05,403.4,-42.4]` on each render,
separately from the main timeline and border. Therefore the reviewed drawing
candidate title is active at **all requested teaching frames 1..968**, with
no reveal animation. This is the candidate's deterministic presentation
contract, not proof of natural Flash runtime visibility. Current source-proven
runtime language is English; a Spanish interface may use the disclosed English
source fallback, but this audit supplies no Spanish title translation.

## Finite graphics check and remaining work

The ten existing PNGs in `output/playwright/g678-p005-drawing-20260926` at
frames **1/23/266/276/398/493/507/582/659/968** were visually inspected.
They show the same title, cartoon characters, bungee equipment, platform and
fence graphics, photographs of cliffs/landscape/river, and transitions. No
additional teaching label, numerical coordinate or formula was observed in
those ten images. They are dated candidate drawings with the earlier mask/
opacity limitations; they are not original Flash captures. The current
mask-v2 screenshots at frames 23/507/968 were also inspected and corroborate
the title and these scene roles without creating a 968-frame visual claim.

The confirmed disposition is sufficient for a **title-only** native-text
iteration with exact suppression of character 394's reviewed instance and
preservation of character 393 and every other graphic. A full teaching-text
disposition still needs the main task's source/host graphics checks for the
other 382 shape/morph definitions and three bitmap definitions. Any newly
confirmed label must receive its own source identity and decoding evidence;
it cannot be inferred from this page's heading or from P006's content.

No original-runtime, audio/listening, synchronization, human/Owner review,
strict-completion, registration, release or publication gate is closed by
this inventory. Source identity, structural enumeration, visible-title
decoding and finite candidate inspection are the only claims made here.
