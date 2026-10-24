# P003 emphasized text and bag-label disposition — 2026-09-23

This is an unregistered, local-only candidate for `shared-nms002-l09-p003`,
not native lesson typography, original-runtime fidelity or product admission.
Source SWF SHA-256:
`d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.

## Source role decisions

- Character 228 (`Tank 1 = 5 bags of food`, source-tag SHA-256
  `4b8a4e800210ed6d606e705afcfde849c93dc6c91d3a6c6018af46a9bb92c512`)
  occurs only at sprite-246 frames 590/592/594: depth 283/generation 1,
  then depth 286/generations 1/2. Character 239 (`+ 2 bags of food`, SHA-256
  `63a0876a38ac2f03427c2ba33afd4e0b3aee2790977a4f6417b6d2d211bc8cc0`)
  occurs at 615/617/619, depth 286/generations 3/4/5.
- Shape 227 (SHA-256
  `e3ae06c54d5d1bd13c2184540448dc033b510b87309041dba007d3448d770d14`)
  outlines the character-228 row; shape 238 (SHA-256
  `2f479292414130622f5bc3e216a6198511533b2ce9c41ef48dff3490637e0959`)
  outlines the character-239 row. These are `outlined-text` layers of existing
  semantic rows, not new reading-order entries or quantities.
- Shapes 229/236 are red circles around the corresponding fish-food bags, not
  text. Their source-tag SHA-256 values are
  `ed09647b0df3e9505a3a56a812bcc5cb32186435b5b1d23f2c59f962f47f1c9b`
  and `e712fc872caf176b54794ceb5534e20e5bb5286d30685c15ce45fc7b6a6f0e5c`.
  The candidate deliberately preserves these instructional marks.
- Character 155 has runs ` FISH ` and `FOOD` (source-tag SHA-256
  `969f173701e69766e95fe0cb6fae08f0ec470c1c804667acd2a39b7f27e959a8`).
  Its eleven instances are printed packaging marks on the bags, at depths
  251/254/257/260/263/266/269/272/275/278/281, first appearing at frames
  94/120/121/122/123/174/175/190/191/192/193. The candidate retains these
  marks in graphics rather than repeating them eleven times in DOM reading
  order; the semantic row already names the bags of food. This technical role
  decision still needs actual-host accessibility and visual review.

## Candidate and bounded validation

The maintained generator and binding map 15 exact text instances and seven
outlined-text shape instances (one title, six emphasis) to 4,508 generated
draw calls. The external v5 JavaScript is 8,910,358 bytes, SHA-256
`c03538f5fc07a5697a549f911b15c0aac1c7e4c8da62819188141bba001bad27`.
Its manifest is at
`/Volumes/American Dream/hudongpin/g678-p003-text-variant-20260923-v5`.
Neither character 155 nor red-circle shapes 229/236 are suppressed.

Local Chromium at 800×600 found 0 RGBA-byte differences between the pinned
raw renderer and v5 ordinary `render()` at frames 1/590/615/635. Versus v4
suppression, v5 differed only at the six emphasis frames: 3,843 RGBA bytes
at 590/592/594 and 2,748 at 615/617/619; frames 589/591/620/635 differed
by 0. The sampled red-circle region retained exactly 1,280 red pixels at
each tank emphasis frame and 1,520 at each addend emphasis frame in both
versions. A request omitting the bound emphasis shapes was rejected.
Suppressed candidate screenshots:

- `output/playwright/p003-text-shape-suppressed-frame590-20260923.png`,
  SHA-256 `eb301ea73c0760e0559a8091687693abe11aac6393b7f282f2359fd654635421`.
- `output/playwright/p003-text-shape-suppressed-frame615-20260923.png`,
  SHA-256 `bac2c2090ab200ee640714b87fb9d85516a4292c40f61b8c86676a016f320d2f`.

These results establish only exact old-glyph removal while retaining bag
labels and red circles. Native emphasis styling, complete semantic renderer,
actual My Lesson responsive/accessibility checks, audio, original-runtime
evidence, human/Owner acceptance, strict completion and publication remain open.
