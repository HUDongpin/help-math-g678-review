# DAT001 L2 P002 local visual candidate QA — 2026-09-25

This is an **unregistered, visual-only engineering candidate**, not an
accepted animation or a My Lesson placement. The physical SWF remains
`G6-G8-shared/DAT001/L2/RW/L2RW02.swf`, SHA-256
`b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.

## Implementation boundary

- Pure source state: `packages/demos/src/dat-l02-p002-display-state-v1.ts`.
- Composed source visual plan: `packages/demos/src/dat-l02-p002-visual-plan-v1.ts`.
- Unregistered React/SVG candidate:
  `packages/demos/src/dat-l02-p002-candidate-renderer-v1.tsx`.
- Local-only source asset loader:
  `apps/web/lib/g678-dat-l02-p002-candidate.server.ts`.
- Local-only route:
  `/en|es/migration-status/g678-calibration/shared-dat001-l02-p002-candidate`.
  It accepts `?frame=1..276`, is loopback-gated, and has `noindex`.
- The loader rehashes the physical SWF, both visual-layout copies, and every
  served source SVG. It bound 169 SVG assets, 68 geometric-mask paths, and
  4,383,602 SVG bytes. No JPEG or alpha PNG definition is served directly.

## Verified local checks

- Source generators: display IR, 66 static morph states, and visual layout
  all passed their `--check` modes. Seven Python regression tests passed.
- Display-state and visual-plan focused tests passed (11 tests), as did two
  React candidate-renderer and two server-loader tests. Both demos and web
  TypeScript checks passed. `git diff --check` passed.
- With the opt-in Next development server bound to `127.0.0.1:3318`, EN
  `?frame=1` returned 200 (8,800,339 response bytes). A real Chromium page
  showed frame 1 and frame 276, slider direct seek, Replay resetting 276→1,
  and Spanish Play/Pause progressing the source-frame counter. The Spanish
  interface explicitly says the animation's teaching text remains English.
- At 320 CSS pixels the Spanish page had `scrollWidth=clientWidth=320`;
  the source animation text becomes very small and is **not** an accepted
  responsive/teaching-text treatment. Browser console: zero errors and zero
  warnings during this interaction. The development server separately emitted
  one `MaxListenersExceededWarning` for Gzip while streaming the large page;
  performance/memory behavior remains to be assessed.
- Invalid `?frame=277` and a request with `Host: example.com` returned 404.
  The local route advertised `x-robots-tag: noindex, nofollow, noarchive`.
- The full `apps/web` production build passed, including its deployment-asset
  preflight and TypeScript/page-generation phases. Scanning `.next/static`
  returned no files containing the P002 source SWF hash, display-IR filename,
  or source-morph directory marker. In the resulting production server both
  EN and ES candidate routes returned 404; `/en` returned 200.

## Browser captures

- `output/playwright/dat-l02-p002-frame-0001-browser.png` — SHA-256
  `72922d090067707b833061ed0d1bf09b3c6ca831b0984d084718b083e8745d5b`.
- `output/playwright/dat-l02-p002-frame-0276-browser.png` — SHA-256
  `846406a2bb5f07c5a48908d0022072c378cde2abf0a0d6af61d2f1a7f329b2e7`.
- `output/playwright/dat-l02-p002-es-320-browser.png` — SHA-256
  `b582d8b92d681a6cb698017ede9f289d3e782f4e973590fb7519ca47e61502ce`.

## Still open

This candidate projects six nested instances synchronously; original-host
child progression after the parent Stop at frame 276 is unobserved. Embedded
audio has not been decoded, synchronized, played, or listened to. No source
visual comparison, readable/localized teaching-text treatment, My Lesson
descriptor/host integration, human or Owner review, strict-completion record,
release, or publication acceptance is asserted. Keep the registry unchanged.
