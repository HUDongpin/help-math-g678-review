# P003 text and mask beat evidence — 2026-09-23

Source SWF: `G6-G8-shared/NMS002/L9/RW/L9RW03.swf`, SHA-256
`d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
`validateP003TextSource` rereads this exact SWF and asserts the static character
strings, the root/main instance identities, all five `character-232` runs, the
source mask (character 230 at depth 282, `clipDepth` 284), and its five scale
changes. The local-only root-held Canvas candidate was inspected in Chromium;
it is not an authorized original-runtime baseline.
The actual source-text catalog content SHA-256 is
`facf9a75ef86498c2ab6a4dc5a1ff516cea4b96f3734ffdfad6c8b6e013e52be`.

| Local frame | SWF mask scale X | Candidate readable expression | Candidate screenshot SHA-256 |
| ---: | ---: | --- | --- |
| 590 | not yet placed | none | `1a32af6c421cf8ed5bf189a59d45b4e442ad4b96b02f4a18d533f2367ef4d07b` |
| 591 | 0.1842498779296875 | `5` | `1372d3f86e6413caa9772634dbc075e060c1523574d3e6b5fd849e7a012d78cc` |
| 599 | 0.3858642578125 | `5 +` | `ad82b1f5c91b65c3bb140506fdf5b9d43f0b7e278a1bdb692d014a0b926f67f7` |
| 605 | 0.508941650390625 | `5 + 3` | `7debc072f17bcae6789d97e26bc82ef8648a0512141a7ec56f4ac2a12abb12e5` |
| 612 | 0.6667633056640625 | `5 + 3 x` | `55ede4138fad546d9ec334fed87042d40280c8f6bc36e0b3fef017e22d751ac4` |
| 616 | 0.824951171875 | `5 + 3 x 2` | `c9da57786bf3f0263af8cb15e99044e0bfd9c9170565fad5fb26e9056fd20e06` |

Screenshots are `output/playwright/p003-text-frame-590-20260923.png`,
`p003-text-frame-591-20260923.png`, and
`p003-text-beat-{599,605,612,616}-20260923.png` under the same directory.
They are 800×600 Canvas captures from the private diagnostic harness. The
maintained text projection uses the semantic multiplication sign `×`, preserves
all five source reveal boundaries, and explicitly reports an English-source
fallback on an ES route; this normalization still needs real product and human
review.

The source schedule remains readable while food bags accumulate through frame
300. Source text 105/106/107 is placed for the whole main domain; character 106
is three distinct instances. The two heading definitions 110/111 are separate
source layers but only one semantic heading should be read. The transient
character-228 and character-239 copies highlight source rows at frames
590/592/594 and 615/617/619, respectively; exact native emphasis and old-glyph
suppression remain open. Eleven placements of character 155 label bag props;
their source-graphics role and accessibility disposition remain open.

This receipt proves a bounded source/Canvas-to-pure-state mapping only. It does
not prove an actual native renderer, source glyph suppression, My Lesson host,
responsive layout, audio synchronization/listening, authoritative Flash
behavior, fidelity, human/Owner acceptance, strict completion, or publication.
