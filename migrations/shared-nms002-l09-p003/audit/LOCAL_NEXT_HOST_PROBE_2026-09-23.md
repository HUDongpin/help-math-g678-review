# P003 local Next host probe — 2026-09-23

This is an **unregistered engineering probe**, not the actual My Lesson host,
Current-JS admission, source-audio acceptance, or original-runtime comparison.

## Frozen inputs and delivery

- Real SWF: `G6-G8-shared/NMS002/L9/RW/L9RW03.swf`, SHA-256
  `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
- `scripts/prepare-g678-nms-l09-p003-local-runtime-v1.mjs` rechecked the real
  source and external v5 generator manifest, then copied `canvas-renderer.js`,
  `binding.json`, and `manifest.json` exclusively into
  `work/g678-shared-page-factory/g678-nms-l09-p003-native-candidate-v1/`.
  The JavaScript is 8,910,358 bytes, SHA-256
  `c03538f5fc07a5697a549f911b15c0aac1c7e4c8da62819188141bba001bad27`.
  The generated runtime was not hand-edited. The `work/` directory is locally
  excluded from Git, so this probe requires the named retained worktree.
- A dedicated local-only route rehashes the SWF and ordinary, single-link
  runtime file on request. It requires the exact SHA query and same-origin
  script fetch and responds with private/no-store/noindex/nosniff headers.
  The client loader also pins SRI and checks the generated adapter identity.

## Checks actually run

- `prepare-g678-nms-l09-p003-local-runtime-v1.mjs --check`: pass with the
  exact real `HELP_MATH_G678_SOURCE_ROOT`.
- 25 focused source, generator, clock, text, bridge, and native-DOM tests:
  pass. Six focused server runtime/read-boundary tests: pass.
- Web `tsc --noEmit`: default 4 GB Node heap failed with OOM; after correcting
  two new test-only environment-typing errors, the 8 GB heap rerun passed.
- Local Next page at
  `/en/migration-status/g678-calibration/shared-nms002-l09-p003` returned 200.
  Chromium network recorded the page, component, CSS, and exact-SHA JS asset
  returning 200; the JS response was 8,910,358 bytes with private/no-store,
  noindex, same-origin, and nosniff headers. Native title/schedule appeared
  once in the accessibility snapshot. At frame 635 the expression was visible;
  Replay cleared it at frame 126. EN console had zero errors/warnings.
- Direct asset navigation without same-origin script fetch headers returned
  404. A same-origin-shaped request with the wrong SHA query returned 404.
  The server test verified disabled Preview/production and wrong source root
  return no asset. This is a local negative check, not a production deployment.
- ES route at 320px displayed the explicit English-source fallback and the
  same semantic text. At ordinary root size, document width and scroll width
  were 320px. With root font enlarged to 32px, P003's stage was contained but
  the document scrolled to 322px: the overflowing node was the shared mobile
  navigation, not the P003 stage. ES console had zero errors and one development
  CSS-preload warning. Neither result proves actual My Lesson responsiveness.
- Private browser screenshots:
  `.playwright-cli/page-2026-09-23T15-20-22-653Z.png` (320px normal text) and
  `.playwright-cli/page-2026-09-23T15-22-48-047Z.png` (320px, 32px root).

## Still open

P003 has no Current-JS registry entry, freeze/descriptor admission, actual
My Lesson page sequence or controls validation, source-audio synchronization
and listening acceptance, original-runtime capture/fidelity, human or Owner
review, strict completion, release, or publication. The visual 800×600 bridge
does not declare unsupported 2× backing support. The narrow illustration
still carries the blank source schedule card under reflow; review that product
decision before any admission. The shared navigation's 200%-text 2px overflow
is a separate host issue.
