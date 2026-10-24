# P012 native typography: pre-fix responsive review, 2026-09-27

**Historical finding before the bounded responsive fix:** the source-bound renderer was technically present, but instructional text did not reflow at 390 px and did not follow a doubled root font size. The fix and current rerun are documented in `TYPOGRAPHY_RESPONSIVE_FIX_2026-09-27.md`. This report retains measured pre-fix observations. The same output directory was regenerated for the successor candidate, so its current screenshots and `results.json` belong to the fix note, not this baseline; they must not be used as pre-fix screenshots.

The isolated fixture bundled the real `P012TypographyRenderer`, `P012Controls`, their CSS, and the hash-checked `typography-v1/renderer.js`, then opened them directly in local headless Google Chrome 153.0.8010.54. It started no Next server and did not load or change the registry, route, shared `.next`, audio, or glossary host. The pre-fix run bound runtime SHA-256 `eee27611df58685bad502c7ceb54eb745a0407cd7fbb93cadd93e326e95491f1` and React/CSS source hashes `89fa483f12b80c6c1f6eb3ffa38fff7bd858b7cf62f6ac6bb7cad20b0a63e940` / `80dec7c8a0e6c90aece2ac37a00f30dffb5b44eb1a889c20e58e034d1c9ddd4c`. The fixture used device scale factor 1, a 960 px maximum lesson area, and English source text with the Spanish missing-translation notice.

| Case | Stage / available width | Native title / intro / axis / control font | Observation |
| --- | --- | --- | --- |
| Desktop 1280 px viewport | 960 / 960 px | 25.44 / 23.52 / 13.06 / 15.84 px | `ready`, full frame 119 visible; popup and frame 34 `Cl` also render. |
| Tablet 768 px viewport | 768 / 768 px | 20.35 / 18.82 / 10.44 / 12.67 px | `ready`, no horizontal stage scroll. |
| Mobile 390 px viewport | 680 / 390 px | 18.02 / 16.66 / 9.25 / 11.22 px | `ready`, but 290 px internal horizontal scroll is required. |
| Mobile, root font changed 16→32 px | 680 / 390 px | unchanged from mobile | The component's `cqw` text does not follow this 200% inherited-font test. |
| Desktop CSS page zoom 200% | 680 / 640 CSS px | 18.02 / 16.66 / 9.25 / 11.22 computed px | Physical stage is 1360 px for a 1280 px viewport; 80 px physical scroll. |
| Mobile CSS page zoom 200% | 680 / 195 CSS px | 18.02 / 16.66 / 9.25 / 11.22 computed px | Physical stage is 1360 px for a 390 px viewport; 970 px physical scroll. |

The first actionable defect was **instructional text embedded in a fixed 680 px minimum-width stage**. In the initial 390 px view, the first instruction run extended to x=446, the clickable “coordinates” term began at x=465, and the displayed coordinate began at x=437. The title and graph were also cut by the viewport. The second and third first-line source runs were completely offscreen. Focusing the term shifted the stage by 290 px and clicking called the supplied handler, but the beginning of the title and instruction was then out of view. A narrower screen and 200% CSS page zoom magnified the problem.

The second actionable defect was **text size tied to stage width rather than inherited text scale**. At 390 px, the graph's native axis labels computed to 9.248 px and directional labels to 11.22 px. Doubling the root font from 16 to 32 px left title, instruction, axis, and directional font sizes unchanged because the stylesheet used `cqw`. This was a text-only scaling proxy, not a browser-toolbar text-only zoom claim.

The graphical feedback panel was clipped in the initial mobile stage view, while `P012Controls` below it independently presented the complete feedback text and a Close button. This was a diagram presentation discrepancy, not missing feedback content in the fixture.

Every pre-fix sampled case reached `data-canvas-status=ready` with no page errors. The frame 34 sample displayed only source-revealed `Cl`; frame 119 displayed 43 native axis labels, eight native directional labels, and `(0,0)`. The desktop popup displayed feedback and Close text, and the Coordinate term remained keyboard-focusable and clickable after scrolling.

These measurements concern the earlier isolated candidate renderer, not the complete mounted My Lesson route. CSS `zoom: 200%` and the changed root font were controlled proxies. Neither substitutes for actual browser settings, screen-reader review, original-runtime visual comparison, audio/listening, Spanish translation, human/Owner acceptance, strict completion, release, or publication. The successor fix must be assessed from its own evidence.
