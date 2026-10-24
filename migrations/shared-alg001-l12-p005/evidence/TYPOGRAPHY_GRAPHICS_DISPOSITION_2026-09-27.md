# P005 typography graphics disposition — 2026-09-27

Animation: `shared-alg001-l12-p005`. This independent review viewed the five
new source-graphics atlases and all three embedded-source bitmap images. It
found **no additional teaching words, formula, coordinate value or axis label**
in that reviewed set beyond the previously decoded character-394 title.
The supported disposition is to modernize that exact title and preserve every
other graphic. This finding is limited to public-tool source raster/geometry
endpoints and atlas thumbnails; it is not original Flash natural playback,
all-intermediate-morph inspection, human acceptance or strict completion.

Only this document was added by the review. The stable title inventory,
source, extraction products, renderer, host, audio, registry, P006 and other
evidence were not changed.

## Reviewed inputs and binding

All paths in this table are relative to
`output/playwright/p005-native-typography-20260927-v1/` in the implementation
worktree. The current read of each input checked that it was a regular,
non-symlink file and that device, inode, size and modification time were stable
across the read. The three image hashes match the bitmap receipt.

| Input | Bytes | Current SHA-256 |
| --- | ---: | --- |
| `source-graphics-inventory.json` | 129,550 | `ffa945a2ba32cbc4930869a1c3908eba9fae8e2a0957254527364d053b406185` |
| `source-atlas-01.png` | 139,609 | `5fdcff0e1f4b7d94aae280506e51f97efe6c896cb04d55bc1f900a94209262eb` |
| `source-atlas-02.png` | 312,838 | `d3e5b579dd629146dface4fa7297389154e34df5cc6ad88bc85ecfa4136afd5f` |
| `source-atlas-03.png` | 522,418 | `828d1153d8e06d0801c366747c0e2b9c5bd6784f21f7f5cedb4b7968efe1b8b8` |
| `source-atlas-04.png` | 480,408 | `3357f76f45094ee74ba65f126af94d2427e36ad844ae4ea9c2544faf9385f8f9` |
| `source-atlas-05.png` | 236,064 | `3b17c7a86bd4a03f464620b3fb5d12cf29bc9ba7943214a034034806e89be58b` |
| `bitmaps/receipt.json` | 891 | `dd16d87fd48a07050a01fab6ffae659abeac8289fccd2e2f87a23a19e4d940dc` |
| `bitmaps/imageObj2.jpg` | 108,441 | `1609c4a38f0a5b8bf5d88aa38db866b7447928ed30ec808003e85b35776e32f8` |
| `bitmaps/imageObj99.png` | 491,734 | `5ecf15e24382ed1cd745e3650b70c8cf46eb548428962cddc824ce3912388dc6` |
| `bitmaps/imageObj204.png` | 7,635,207 | `785013402413a486e7473d83c4a59f3c6dce56eaa45667edd1b657eea046a147` |

The source-graphics manifest identifies the real SWF hash
`b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`,
383 exported source SVG definitions, 340 static-shape PNGs and 86 morph-endpoint
PNGs. Its 426 entries have 426 unique paths, 340 unique static-shape IDs and
43 unique morph IDs, each with two endpoint entries. Page counts are
**88 / 88 / 88 / 88 / 74**. This is complete manifest enumeration of the
reviewed static shapes and morph endpoints, not enumeration of intermediate
morph ratios or natural runtime states. This review verified that enumeration
and viewed its five atlases; it did not separately rehash all 426 underlying
PNG files or re-export the source.

Each atlas is 1440×1452 and was viewed at original resolution. Atlas filename
captions are review tooling labels, not SWF teaching text. The bitmap receipt
identifies the extraction as candidate embedded-source bitmaps and pins
candidate-v2 SHA `48efbca3ddebf218565cdd635ffa130ae3a402c5693dd1ebcf359b2c30d500dd`.
The PNG dimensions are 500×432 for imageObj99 and 1776×1748 for imageObj204;
all three bitmaps were viewed at original resolution.

## Independent visual observations

| Reviewed source surface | Observed role | Typography disposition |
| --- | --- | --- |
| Atlas 01: all 86 morph endpoints and the first two static-shape tiles | Short facial-detail curves and bungee-rope curves; solid mask and a bridge photograph | Preserve. No word sequence, formula, numeric coordinate, axis or labelled tick was observed. Curves are not promoted into letters or graph lines merely because their geometry resembles a stroke. |
| Atlas 02 | Cartoon characters and repeated head/body/mouth/tail poses; bungee gear; solid background | Preserve. Repeated facial and body parts supply scene animation, not separately confirmed teaching text. |
| Atlas 03 | Head, mouth, eyes, arms, gloves, legs, shoes, equipment and cartoon pose variants; canyon/river and platform photography | Preserve. Tiny paired dark patches such as characters 142..146 appear as facial components in this source-graphics context; this review does not transcribe them as glyphs. |
| Atlas 04 | Bungee poses, character body/head/mouth variants, equipment, mask and bridge photography | Preserve. No additional teaching label, mathematical notation or coordinate legend was observed. |
| Atlas 05 | Character head/body/mouth variants, equipment and long cord curves; bridge photograph; character 394 title and character 396 border | Preserve all except the already-reviewed exact title placement. The isolated 394 tile corroborates the presence of the title; exact wording/casing is supplied by the independent font-contour decoding in the title inventory. Character 396 is a scene border, not a coordinate axis. |
| imageObj2 | Bridge, platform/fence, landscape and cliffs; distant roadside sign | Preserve the entire photo. The distant sign is not readable teaching content and is not transcribed or replaced. |
| imageObj99 | Canyon/river viewpoint with platform/fence foreground | Preserve the entire photo. No overlaid instructional words, formula or coordinates were observed. |
| imageObj204 | Wide bridge/cliff/river landscape, road/vehicles and small distant signs | Preserve the entire photo. Distant sign content is unresolved scenery; no guessed wording, OCR-derived native text or new teaching label is introduced. |

Small mouth shapes such as 63..75 and 374..389, tiny facial-detail endpoints
and long single cord strokes are visible in the atlases. Their repeated
character/scene context and the previously viewed finite candidate frames
support preserving them as graphics for this title migration. They contain no
confirmed word or formula sequence in the viewed endpoint/thumbnail set. No
additional magnification target is required to implement the confirmed title
replacement. The distant photo signs remain explicitly unread and unchanged;
their unreadability is not converted into a claim that every pixel is text-free.

## Scope of the risk disposition

The preceding title inventory independently decoded all 55 contours in
character 394 and established its exact instance
`root:135:1:395/sprite-395:2:1:394`. Character 393 is its offstage semantic
sibling and must remain. The source-atlas/bitmap observations supplement that
inventory by covering all manifest static-shape tiles and both endpoints of
each morph definition. They do not revise its stable source identities,
matrices, wording or candidate/source timeline distinction.

The existing candidate images previously reviewed at
1/23/266/276/398/493/507/582/659/968, plus the mask-v2 images at 23/507/968,
provide finite scene-composition context: cartoon characters, bungee gear,
cord, platform/fence and the same photographed landscape. Those are dated
candidate drawings, not a natural Flash capture or a 968-frame human review.
This supplementary task did not create or inspect a new natural playback run.

For the **title-only native-text iteration**, the shape/bitmap-text risk is
dispositioned as: confirmed title handled by its exact source placement;
remaining graphics and scenery retained unchanged; no further teaching text
identified in all reviewed static tiles, morph endpoints and bitmap images.
This is sufficient to avoid suppressing unrelated graphics or inventing
native formulas. It does not establish original-runtime morphology,
intermediate visibility, playback synchronization, listening, full page
fidelity, human/Owner acceptance, registration, strict completion, release or
publication. A later discovery of instructional text in an unreviewed
intermediate/composite state must receive separate source evidence and its
own disposition.
