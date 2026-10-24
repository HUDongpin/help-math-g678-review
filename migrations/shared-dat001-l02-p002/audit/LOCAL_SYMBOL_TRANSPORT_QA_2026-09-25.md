# DAT001 L2 P002 local SVG transport QA — 2026-09-25

Scope: unregistered, loopback-only Current-JS candidate for the exact
`shared-dat001-l02-p002` placement. Physical source SWF SHA-256 is
`b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.
The previous 8.8 MB HTML response embedded every source SVG as base64. This
change moves SVG bytes to per-hash local image routes; it does not change the
source visual plan or establish Flash fidelity.

## Bound transport

- `loadDatL02P002CandidateAssets` still checks the physical SWF, both
  byte-identical visual-layout manifests, and all 169 source SVGs (4,383,602
  source bytes). It returns 169 path-to-hash-URL bindings and the 68 verified
  geometric mask paths, not base64 image data.
- `symbol/[sha]` independently checks the local-preview request, the exact
  candidate-page referer, same-origin image headers, physical SWF, both layout
  copies, manifest membership, and selected SVG SHA-256 before returning
  `image/svg+xml` with private/no-store and noindex headers.
- The renderer accepts only the URL matching each layer's exact source SVG
  hash. Missing/wrong URLs or mask silhouettes still fail closed.

## Observed checks

- Four audio/symbol access/proxy tests, three source-loader tests, two React
  renderer tests, and the frame-domain audit check passed.
- In webpack-mode local development, EN `?frame=276` returned HTTP 200 with
  90,857 HTML response bytes, versus 8,800,562 bytes observed for the
  pre-split audiovisual candidate: a 98.97% reduction in **HTML envelope**
  bytes. Source SVGs are still transferred separately as needed; no total
  network-byte or memory-saving percentage is claimed.
- Real Chromium requested 26 distinct SVG hashes for frame 276; all returned
  200. The browser displayed the assignment panel and classroom scene, with
  no console errors/warnings. Replay returned the visual frame to 1. The
  observed dev-server run did not emit the earlier Gzip
  `MaxListenersExceededWarning`; this is one run, not proof the performance
  issue is permanently resolved.
- Full-page browser capture:
  `output/playwright/dat-l02-p002-frame-0276-symbol-transport.png`, SHA-256
  `6ad27f833a484c36a0957422476b9b7b46b88be67bf0572cee4ef933a212f2ec`.
  It was visually inspected against the prior terminal capture. It is not an
  original-runtime or pixel-parity comparison.
- The optimized production webpack build, TypeScript phase, page generation,
  and 11 deployment asset tests passed. Production EN and ES candidate pages
  and the symbol route returned 404; `/en` returned 200. `.next/static`
  contained none of the physical SWF SHA, an example source SVG SHA, the
  visual-layout marker, or the source-morph directory marker.

## Remaining boundary

Source English text is still raster-like source SVG and shrinks on mobile;
Spanish teaching treatment, parent/child original-host timing, audio
synchronization, My Lesson integration/registration, original-runtime and
fidelity evidence, listening, human/Owner decisions, strict completion, and
publication are not established by this transport change.
