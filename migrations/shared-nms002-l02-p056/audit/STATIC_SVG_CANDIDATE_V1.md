# P056 layered source-static SVG candidate — 2026-09-24

Stage: unregistered engineering candidate only. This is neither an authorized
original-runtime baseline nor a Current-JS product admission.

## Source and generated boundary

- Exact SWF: `G6-G8-shared/NMS002/L2/TS/L2TS03.swf`, SHA-256
  `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`.
- `scripts/build-nms-l02-p056-symbol-art-v1.mjs` requires the real source
  root and verifies that SWF. It runs FFDec 26.2.1 for sprite-24 frames
  32, 42, and 234; compares each SVG against its frozen hash; combines the
  self-contained definitions into reusable SVG symbols; and writes only with
  exclusive creation. `--check` regenerates and compares bytes.
- Generated bundle: `packages/demos/src/generated/nms-l02-p056-symbol-art-v1.ts`,
  SHA-256 `edd12577b063e19bfe3b2b6b33d350c870f1de523a50f18655cfb0f94d1dfa40`.
  It maps all 19 source character IDs used by the 234-frame display list.
  Character 11 is explicitly `null`: the source `DefineEditText` has no
  static visible SVG glyphs, and its runtime content remains unresolved.
- `packages/demos/src/timelines/shared-nms002-l02-p056-svg.ts` projects every
  one-indexed teaching frame into layered SVG `<use>` elements in source
  depth order. It preserves per-layer matrix and alpha and offers the native
  800×600 stage (root sprite translation 8248/5666 twips) or an FFDec forensic
  crop (477.5×383.1 px). The native-stage background is the source SWF's
  `#b8d8f7`. Callers must supply a stable XML-safe instance ID; every symbol
  and local reference is scoped to it so coexisting SVGs cannot collide.
  Neither mode implements the ten-frame root preloader.
- `scripts/render-nms-l02-p056-svg-probe.ts` creates an exclusive private
  one-frame SVG for inspection. It is not a product route or asset packager.

## Static visual check

Candidate probes are held privately under
`/Volumes/American Dream/hudongpin/p056-candidate-probes-VBIcL9`.
The six probes were rendered by macOS Quick Look at 1024 px and inspected.
The native-stage frame-234 probe was separately rendered and inspected at
800×600 source coordinates, with the page artwork inside the blue stage.
The source reference thumbnails are FFDec frame-SVG exports rendered by the
same Quick Look chain. Comparison uses ImageMagick `compare -metric RMSE`
on those PNGs. This test is only source-static/forensic agreement; shared
exporter or thumbnail errors could affect both sides.

| Sprite frame | Visible beat | Normalized RMSE |
| --- | --- | ---: |
| 17 | Title and four-cell plan | 0.00135797 |
| 32 | One-frame magenta `Organize` flash | 0.00135789 |
| 42 | One-frame magenta `information` flash | 0.00135757 |
| 102 | First prompt enters at zero alpha | 0.00135797 |
| 154 | Second prompt enters at zero alpha | 0.00136815 |
| 234 | Both questions visible | 0.00138219 |

The earlier FFDec/Quick Look frame-1 and frame-9 thumbnails appeared white
despite nonempty source display lists. That conflict remains unresolved and
must not be treated as evidence of an intentionally blank original runtime.
No authoritative original-host capture or full-frame comparison exists.
After instance-ID isolation, the frame-234 Quick Look candidate thumbnail
remained pixel-identical to the pre-isolation candidate (`AE=0`).

## Checks and limits

- P056 source behavior, display list, and SVG focused tests: 15/15 pass,
  including all 234 projected frames and exact-source regeneration/
  no-overwrite checks. The added tests verify two SVG instances have disjoint
  definition IDs and resolved local references, and bind the two button
  hitTest rectangles to the exact source XML.
- Targeted TypeScript check of the new renderer, test, and probe script passes.
  The first full demos typecheck exhausted Node's default ~4 GB heap; with
  `NODE_OPTIONS=--max-old-space-size=8192`, the full demos typecheck passes.
- No browser-host interaction, glossary response or pause/resume, bilingual
  content, keyboard/focus behavior, Replay, audio transport/listening,
  responsive My Lesson layout, original-runtime capture, human/Owner record,
  strict completion, release, or publication is established.

Next product step: wrap the layered SVG in a maintained accessible React
component with a stable per-instance ID, modern source-bound semantic text,
and source-positioned focusable term targets. Resolve the source button/host
and audio state contracts before
considering a registry/descriptor admission. Keep the transient flash frames
and dynamic text-11 uncertainty explicit in those checks.
