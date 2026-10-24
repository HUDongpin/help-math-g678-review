# P009 native typography source inventory — 2026-09-27

Status: source-backed preparation only. No product code, registration, audio,
original-runtime, named-human review, strict completion or publication gate is
changed by this inventory.

The physical source is
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB04.swf`:
165,405 bytes, SHA-256
`d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533`.
The real directory and nonsymlink, single-link source were checked before reading.
Only its exact read-only copy in the dedicated output directory was given to
FFDec 26.2.1. The independently shared `audit/movie.xml` is 1,167,103 bytes,
SHA-256 `cba1ba1f5ee73ed6f9c33f96d5288dd4aa56e9f51612eda0d49996a68b81c77f`.
No duplicate movie.xml was exported.

`audit/typography-build-source-inventory.py` directly calls the actual SWF text
parser, cross-checks the public XML font code table and shape IDs, computes exact
straight/quadratic font-ink extrema, and applies authored placement updates and
the four rectangular masks. Its output is
`audit/typography-source-inventory-v1.json`. This records all 16 definitions,
32 decoded runs, 44 text placement generations, source glyph advances/bounds,
per-instance events and losslessly segmented geometric visibility, 37 individual
shape dispositions and all eight glossary source targets. It is audit data;
the browser should receive a deliberately generated compact runtime subset.

The SWF is CWS v6, native 800×600, 12 fps, root 10 frames. Root frame 6 places
sprite 62, name `animation`, at depth 1 with matrix `[1,0,0,1,8248,5666]` twips
and ratio 5. Its main domain has 394 frames. Root depth 85 separately places the
title shape 63. Every main-text path therefore combines
`root/depth-1/generation-1` with the local instance below. This is an entry
condition for static reconstruction, not proof of natural original-host entry.

## Text definitions and semantic relationships

One embedded font, ID 3, is `Bauhaus Md BT`, with 36 decoded glyphs. There are
no dynamic text definitions, unresolved runs or bitmaps.

| Character | Runs | Source content/role | Main instance depth |
| --- | ---: | --- | --- |
| 4 | 9 | `An ordered pair is a pair of numbers used to locate a point on a    ` | 3, generation 1 |
| 26 | 4 | `coordinate plane. Ordered pairs are also called coordinates.  ` | 15, generation 1 |
| 31 | 4 | `In an ordered pair, the x-coordinate is the first number and the y-coordinate` | 23, generation 1 |
| 43 | 1 | ` is the second number.  ` | 30, generation 1 |
| 11 | 1 | Shared origin `0` | 36 |
| 13 | 1 | `X-axis` | 38 |
| 16 | 1 | `Y-axis` | 41 |
| 17,19,20,21,22 | 5 total | Reused digits `1,2,3,4,5`, each four placements | Exact components in inventory |
| 18 | 1 | Ten separately placed `-` signs | Exact components in inventory |
| 59 | 3 | `(` / `4,2` / `)` | 81, generation 1 |
| 60 | 1 | White `4` overlay | 83, generations 1–3 |
| 61 | 1 | White `2` overlay | 83, generations 4–6 |

These are exactly 16 definitions and 32 runs. Complete values and whitespace
remain in the inventory; prose layout may normalize authoring padding without
changing the words. Text 4+26 forms one definition, and 31+43 one coordinate-order
explanation. Do not leave the diagram detached from those relationships.

## Geometric visibility and native reveal

Masks are shape 1 at main depth 1→clipDepth 12 from frame 12, the same shape at
depth 13→20 from 72, shape 29 at depth 21→28 from 142, and shape 29 at depth
29→31 from 210. Both are verified rectangular filled geometry. Their exact
source updates are retained. Body text placement is earlier than full revelation.

The following are the first frames at which all nonspace glyph ink bounds of a
run fit its mask, with full opacity. They support an explicitly chosen modern
complete-run reveal. They are not observed Flash pixel timestamps.

| Text | Run indices | Full containment frames, in matching order |
| --- | --- | --- |
| 4 | 0–8 | 15, 25, 32, 36, 54, 59, 61, 65, 69 |
| 26 | 0–3 | 85, 119, 128, 128 |
| 31 | 0–3 | 162, 172, 201, 212 |
| 43 | 0 | 223 |

The JSON also preserves first possible partial-ink frames. Partial intersection
of a bounding rectangle does not guarantee an actually visible pixel. No AS is
executed. Run X offsets are reset only when the source changed-x flag is set;
an inherited xOffset must not restart every color run. Move+Character replacement
inherits unspecified transforms rather than resetting a new generation to identity.

All 33 axis text instances are placed at frame 14 with alpha zero, gain positive
opacity at 15 and full opacity at 26; they remain placed through 394. Pair text
59 is placed at 284 with alpha zero, positive at 285, full at 291. Its parentheses
use 18 px authored type and the inner `4,2` 16 px. White overlay 60 exists only
at 353/355/357; overlay 61 only at 383/385/387. Retain this source state without
announcing duplicate coordinate values to assistive technology. Original-runtime
appearance and the visual effectiveness of those overlays remain unverified.

## Axes, signs and illustration

The graph has labels −5 through 5 on both axes, one shared authored zero and the
two axis names. The preserved grid has 12 intervals, with outer edges beyond the
labelled ±5 positions, approximately unlabelled ±6. Do not add ±6 text. Native
labels must stay aligned with the actual source grid and point `(4,2)`.

The source uses 33 text instances to make 20 nonzero composite labels, shared 0,
and X/Y-axis. Negative label component depths are:

| Axis | Values −1,−2,−3,−4,−5: digit/sign depth pairs |
| --- | --- |
| X | 43/44, 46/47, 48/49, 52/53, 54/55 |
| Y | 58/59, 61/62, 64/65, 68/69, 70/71 |

Positive X depths are 42,45,50,51,56; positive Y depths 60,63,66,67,72.
Each sign is text 18 with its own 1.4901885986328125 horizontal scale. Values
were assigned from these placements and the static diagram, never character ID
or numeric sequence alone. Exact matrices, source tag hashes and instance IDs
are retained. A semantic native minus may use U+2212; record that typesetting
choice while retaining the source literal hyphen and components in provenance.

All 37 shapes were inspected via two contact sheets: 34 public FFDec PNGs and
three zero-height SVG line previews (2/25/30). The latter add review-only padding;
their original SVGs are unchanged. The inventory individually records each:

- 1/29 are masks; 5 is hit-test-only in all eight buttons, with no up/over/down
  graphic. Its blue exported rectangle must not become learner content.
- 2/25/30 are linked-term underlines. Replace only their exact body instances
  when native linked text takes over: main depths 2/14/22, generation 1.
- 10/12/14/15/23/24 are grid, axes, arrows, ticks and red origin geometry.
- 34/36/37/38/39 are an origin ring with progressively added horizontal unit
  marks; 42/44 are corresponding vertical marks. They are not numeral glyphs.
  35/40 are black guide shapes and 41/45 tick emphasis.
- 46–57 are the red point/path progress shapes; 58 is the pair-label background.
  Preserve their authored geometry, transforms and timing.
- 63 is the outlined title, engineering-read as
  **Graphing in the Coordinate Plane: Vocabulary**. Replace only
  `root/depth-85/generation-1`, visible at root 6–10 and retained while root 6
  hosts the main animation. This is outline transcription, not a seventeenth
  DefineText or a new source text run. Its SVG/PNG hashes are in the inventory.

Nineteen static FFDec sprite frames were inspected using three review contact
sheets plus frame 394 at original resolution. White alpha compositing makes black
text legible; sprite crops are not 800×600 original-runtime captures. These checks
support the static roles above and do not close full-frame/human comparison.

## Native route and glossary boundary

Keep the source vectors and suppress only exact mapped text/title/underline
instances through a maintained generator. Render title and the two prose blocks
as reflowing native DOM, using the full-run schedule above. Render all axis and
pair labels natively against source anchors in the diagram. A locally scrollable
800-stage/50rem diagram may retain geometry and grow with root font at 200%;
body and controls must reflow at 320 px. Source 0-bitmap status permits a separately
declared 2× Canvas backing; it does not imply another page's raster policy.

Eight source buttons set KeyAttribute and call `_root.DoHyperLinks()` then stop
`_root.animation_mc.animation`. Their exact targets are Ordered pair, Pair,
Locate, Point, Coordinate plane/Cartesian Plane, Coordinate, X-coordinate and
Y-coordinate. Buttons 6/7/8/9 map text 4 runs 1/3/5/7; 27/28 map text 26 runs
0/2; 32/33 map text 31 runs 1/3. Resolve actual dictionary entry IDs separately;
do not invent translations, IDs or resume behavior. English is the source text;
an ES route must explicitly retain English fallback until separately supported.

Reproduce review panels with the dedicated output `build-review-panels.py` using
the bundled Pillow runtime, then run the audit builder with Python 3. All generated
paths remain in this task's typography audit/output namespace. The output receipt
pins those files, source inputs and this report. No audio decode/listening, Flash
launch, My Lesson runtime test, source modification or formal admission occurred.
