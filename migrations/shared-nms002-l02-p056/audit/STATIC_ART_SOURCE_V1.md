# P056 static art intake and frame probes — 2026-09-24

Authority: forensic exports from the exact owner-provided SWF, not an original-host
runtime trace or product asset approval. Source:
`G6-G8-shared/NMS002/L2/TS/L2TS03.swf`, 100,959 bytes, SHA-256
`a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`.
The source root was the real directory
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`,
not the compatibility symlink.

## Hash-bound private export

FFDec 26.2.1 exported `shape:svg,text:svg,button:svg_combined,font:ttf`
from that SWF into
`/Volumes/American Dream/hudongpin/p056-art-intake-joj8rX`.
`asset-inventory.csv` records every resulting file and its SHA-256: six shapes
(IDs 1, 2, 13, 15, 21, 23), thirteen text objects (IDs 4–9, 11, 12, 14,
18–20, 22), two buttons (IDs 16, 17), and one Bauhaus Md BT font (ID 3).
These 22 files are private evidence, not copied into `apps/web/public` or an
application bundle. The button SVGs contain hit geometry, while visible labels
are separate text objects. Text object 11 exports an empty SVG group; its
`DefineEditText` references source font ID 10 (Arial), for which this export
produced no TTF. Neither font has product-use clearance here.

The external evidence directory is a current-machine binding. Re-export from
the source SWF and recheck each inventory hash if it is relocated or missing;
do not silently substitute assets or weaken path validation. FFDec command:

```text
ffdec -format shape:svg,text:svg,button:svg_combined,font:ttf \
  -export shape,text,button,font <private-output-directory> <exact-source-swf>
```

## Sprite-24 frame probes

FFDec exported selected sprite frames with
`-select 24:1,9,17,32,102,154,234 -format sprite:svg -export sprite` into
`/Volumes/American Dream/hudongpin/p056-sprite-probes-xkODsV`.
The SVGs were rendered by macOS Quick Look at 1024 px and visually inspected.
ImageMagick could not parse FFDec's `gradient0` fill reference; a direct
Playwright navigation to the SVG timed out, so neither is counted as a visual
pass. Quick Look succeeded for the seven selected probes only.

| Sprite frame | SVG SHA-256 | Forensic thumbnail observation |
| --- | --- | --- |
| 1 | `f04acbf89489b885b0375c402b90985c25afaedab6863bb4831cf1a4b2e32625` | Blank/white in this renderer. |
| 9 | `19aa3597cbc7d7811cd6284fcfb325c09526ee9308488f78f3e26ac637dd9c9f` | Blank/white in this renderer. |
| 17 | `3f68c122233a6543a7cfbeeb08b0d4caa5e88e89c962bd0a1b70a6269d7fd2ed` | Title `2 Organize the information.`; four-cell plan, with cells 1 and 2 labelled and 3 and 4 empty. |
| 32 | `74fa748ff9e5e89bfc4fe76487c87457d5972daacd56ec34fea3c5c3e62285c9` | `Organize` appears magenta, matching the one-frame text-18 event in the static display list. |
| 102 | `60c58e91eb7bb467c596652c93c44cb37f191905ab99ad634e475c82fac71e8a` | The normal title and plan remain; first prompt has not visibly reached full opacity. |
| 154 | `8074ce273b956246d7a8398317b2b2a1316412fb4aa57ba4fa27b533bd40ee96` | First prompt `What information do I have?` is visible. |
| 234 | `1d05f279e27194b4ed50834a29844c6cec5a62c27821f83879d3b086731e0bb1` | Both prompts visible: `What information do I have?` and `What information do I need?`; four-cell plan persists. |

The cropped FFDec SVG viewport and Quick Look renderer are not the 800×600
original SWF host. These observations corroborate static graphic content but
do not establish frame-exact runtime timing, font metrics, glossary activation,
pause/resume, audio synchronization, English/Spanish localization, responsive
layout, or visual fidelity. No product renderer or registry admission follows
from this export. Next: decide how to integrate source glyphs/shape geometry
with the maintained 234-frame projector and the modern host, then test that
candidate against an authorized original-runtime capture.
