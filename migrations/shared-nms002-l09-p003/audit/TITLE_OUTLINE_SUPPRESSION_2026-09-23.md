# P003 title-outline suppression candidate — 2026-09-23

This is a private, unregistered source-drawing experiment. It is not a native
lesson renderer, typography completion, original-runtime comparison, or My
Lesson admission.

## Source decision

The SWF at `G6-G8-shared/NMS002/L9/RW/L9RW03.swf` is 473,410 bytes with
SHA-256 `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
The root title is not just static text character 247 at depth 297. At root
depth 298, named `Mc_page_Title`, sprite 249 contains shape 248 at its depth 1.
The FFDec drawing path for shape 248 outlines the title lettering, and the
local Canvas result visibly retains that title when only text247 is hidden.
This is why `sourceShapeIds: [248]` is bound to the same `page-title` semantic
block, without declaring the other 214 shapes to be text.

- Shape 248 `DefineShape` source-tag SHA-256:
  `4a2c1b232656caa4fd274d8541368e799bf0232ee560f04cdf5e1ea5cf6d05d7`.
- Root depth-298 parent `PlaceObject2` SHA-256:
  `76dc4939f0a8c604261bedc2c439f1362cb4bdefa5fb69874e1362d6d1c3b9b7`.
- Sprite-249 depth-1 child `PlaceObject2` SHA-256:
  `032ec9abf59daa5e07433c08b23ab654bf3aa9efd81f3e0c74eb77decdc300d9`.
- Exact source instance: `root:298:1:249/sprite-249:1:1:248`.

The maintained builder
`scripts/build-g678-nms-l09-p003-text-variant-v1.mts` validates the real
source catalog, the source text binding, the root and child instance paths,
source-tag hashes, placement matrices, five root calls, and the one nested
outline call. It transforms 4,496 statically mapped generated `place()` calls
for nine text instances plus this outline instance. Its renderer accepts only
the exact text and shape instance set. Missing or wrong shape IDs fail closed.
The original generated Canvas JavaScript is not hand-edited.

The external candidate is
`/Volumes/American Dream/hudongpin/g678-p003-text-variant-20260923-v3`.
Its generated JavaScript is 8,908,447 bytes, SHA-256
`cc8fac7bb54cdf03f65e463706c62c2316d5154e66c67fab37919429c236be3e`.
The manifest binds the generator, source text catalog, binding, and input/output
hashes. Exclusive output creation and identical/different-byte race cases
passed; the generator's `--check` reproduced the exact output.

## Local Chromium checks

At local frames 1, 300, and 635, the unmodified `render()` on this candidate
matched the pinned raw generated renderer by 0 differing RGBA bytes on fresh
800×600 canvases. `renderWithText()` hid 9 source draw instances at frames 1
and 300, and 10 at frame 635 (the late formula is absent earlier). Original
versus suppressed title-region pixel differences were 4,517 at each sampled
frame. A sampled bag rectangle at frame 300 had 0 pixel differences. An exact
request omitting the outline instance was rejected. The local frame-635
suppressed screenshot is
`output/playwright/p003-text-and-outline-suppressed-frame635-20260923.png`,
SHA-256 `07cc52e3530fa3a6ab71687edf67103783f5f3423e5d5c31c0ef16aeb638586e`.
There were zero page errors; two Canvas readback-performance warnings came
from repeated diagnostic `getImageData` calls.

This establishes a bounded title-outline suppression candidate only. Bag
prop labels (character 155), transient row-emphasis text (228/239), other
shape/bitmap lettering, native semantic presentation, responsive EN/ES host,
audio transport/listening, and original-runtime fidelity remain open.
