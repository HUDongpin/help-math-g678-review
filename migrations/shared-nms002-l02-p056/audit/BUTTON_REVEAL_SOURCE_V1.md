# P056 sprite-24 button reveal — source-static audit

This records display-list facts, not original-runtime visibility, hit testing,
glossary content, audio synchronization, or Current-JS admission.

- Exact real source: `G6-G8-shared/NMS002/L2/TS/L2TS03.swf`, 100,959 bytes,
  SHA-256 `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`.
- `swfmill 0.3.6 swf2xml` from that SWF produced XML SHA-256
  `622750694506d4498891795b79b22385f45dfe84d7693f27ef78cc977335b3da`.
  The XML was inspected in a temporary audit directory, not copied into the
  migration or the app. The source remains untouched.
- `DefineSprite` 24 has exactly 234 `ShowFrame` tags. Its depth 16 and 18
  display lists each have one initial `PlaceObject2` and eight subsequent
  transform/color changes. Neither depth has `RemoveObject`, `RemoveObject2`,
  `PlaceObject`, or `PlaceObject3`, and neither receives another character ID.

| Sprite frame | Alpha factor / 256 | Character 16 (`Organize`) local x,y twips | Character 17 (`Information`) local x,y twips |
| ---: | ---: | ---: | ---: |
| 9 | 0 | -2677, -3430 | 129, -3420 |
| 10 | 32 | -2677, -3480 | 129, -3470 |
| 11 | 64 | -2677, -3530 | 129, -3520 |
| 12 | 96 | -2677, -3580 | 129, -3570 |
| 13 | 128 | -2677, -3630 | 129, -3620 |
| 14 | 160 | -2677, -3680 | 129, -3670 |
| 15 | 192 | -2677, -3730 | 129, -3720 |
| 16 | 224 | -2677, -3780 | 129, -3770 |
| 17–234 | 256 | -2677, -3830 | 129, -3820 |

The frame-17 empty `ColorTransform2` uses the identity alpha factor (256).
At frame 9 the button characters are placed but alpha is zero. This is not
proof of visual or interactive availability. The maintained pure projection is
`packages/demos/src/timelines/shared-nms002-l02-p056-source-behavior.ts`;
full sprite rendering and the original host/glossary path remain open.

## Source hitTest geometry

The same hash-bound `swfmill` XML defines shape 15 with bounds
`left=-1085, right=1084, top=-224, bottom=224` twips. Both `DefineButton2`
records use it only in their `hitTest=1` button record. Character 16 applies
`scaleX=0.8483123779296875` and `scaleY=1.133926391601562`; character 17
uses the identity scale. Combining those source transforms with the sprite's
root placement `(8248, 5666)` twips and the per-frame button positions yields
these native 800×600 stage rectangles at teaching frame 17:

| Button | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| 16 / `Organize` | 232.5291 | 79.1000 | 91.9995 | 25.4000 |
| 17 / `Information` | 364.6000 | 81.1000 | 108.4500 | 22.4000 |

`p056SourceButtonHitRect(frame, characterId)` projects this rectangle and the
source alpha at every teaching frame. It does not install a browser control or
claim that the legacy host accepted clicks on translucent or invisible frames.
The modern target size, focus treatment, English/Spanish definitions, pause
and resume behavior, and original-host click trace still need product work.
