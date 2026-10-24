# P005 unregistered real My Lesson host probe — 2026-09-26

## Boundary

This is maintained local host integration, not registration or acceptance.
Official catalog/registry intersection remains **480/2,282 (21.034180543383%)**,
with 1,802 placements remaining. P005 is absent from the official registry.
ALG001 L12 is officially 19/52; the isolated probe simulates 20/52 and discloses
that distinction. All 52 source-ordered placements are preserved.

The source SHA is `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.
The local v2 Canvas SHA is `48efbca3ddebf218565cdd635ffa130ae3a402c5693dd1ebcf359b2c30d500dd`.
The adapter uses a **silent 12 fps engineering visual clock** in sprite-391,
frames 1–968. It does not establish the original Flash/audio clock. No audio
element or Spanish visual translation is supplied.

## Maintained implementation

- `apps/web/components/g678-alg-l12-p005-host-lesson.tsx`: existing generated
  My Lesson host plus a private runtime adapter; readiness, pause, replay,
  seek, terminal stop, reduced motion, error and unmount handling.
- `packages/demos/src/alg-l12-p005-visual-clock.ts`: pure bounded visual clock.
- `apps/web/lib/g678-alg-l12-p005-host-probe.server.ts`: exact source/runtime
  checks, one-page simulated descriptor delta and isolated progress storage.
- `apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l12-p005/page.tsx`:
  loopback opt-in, production denial, noindex, reviewer/candidate mode only.

Two GPT-6 Sol / xhigh agents independently supplied the descriptor/route/tests
and clock tests/lifecycle review. Main reviewed the actual changes and reran
the tests. Review corrections include inspector resume, RAF timestamp reset,
the renderer's actual `error` status, reduced-motion gating, and removal of a
duplicate replay bookkeeping callback. A subsequent lint correction updates
the latest-props ref in a layout effect rather than during render.

The frozen shared host was not edited:
`descriptor-driven-whole-lesson-player.tsx` SHA
`494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`.
Registry SHA remains
`b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.

## Independent checks

- 12/12 module and pure visual-clock tests passed.
- 6/6 source/route/probe server tests passed.
- Full web `tsc --noEmit --incremental false` passed with 8 GB heap before
  the final lint-only ref synchronization change.
- Actual local Next dev HTTP loaded the page and exact pinned Canvas bytes.
- Chromium via Playwright CLI session `p005host`: pause held for 400 ms;
  seek reached exactly frame 507; continue advanced to 513 after 600 ms;
  Replay returned frame 1; seek 967 + continue stopped at 968; P004 navigation
  unmounted the P005 adapter, and returning reset its clock.
- No audio elements existed in the P005 host.
- EN 768 px and 320 px document widths matched viewport widths; Canvas stayed
  within each viewport (527×395.25 and 304×228 respectively).
- ES route loaded with English-source/translation-pending disclosure.
  Reduced-motion Replay remained paused at frame 1. ES 320 px had no horizontal
  document overflow.
- Injected Canvas request failure produced `data-canvas-status=error`,
  `data-p005-ready=false`, paused=true and zero audio elements.
- No unexpected browser console errors before the deliberate failed request.
- Final lint-adjusted adapter was rechecked in a fresh Chromium session:
  seek 507 → continue 513, Replay 1, pause held 400 ms. The already-loaded page
  was tested after stopping its dev server; its console connection errors are
  recorded HMR WebSocket reconnect failures, not renderer failures.
- Targeted ESLint passed the adapter, descriptor, page and test. The production
  null stub has the same unused `_props` warning as the existing stub pattern;
  it has no lint error.

## Production packaging correction

A pre-correction production client scan found the candidate hash in a client
chunk despite the conditional dynamic import. The import's runtime guard alone
was insufficient to remove the module from packaging. Added the same narrow
alias and production module-replacement pattern already used for local probes
in `apps/web/next.config.ts`, plus
`apps/web/lib/g678-alg-l12-p005-host.production-stub.tsx`.
No shared renderer or unrelated provider configuration was changed.
After replacement, a recursive production `.next/static/chunks` JavaScript
scan returned zero matches for the P005 source SHA, Canvas SHA, or
`data-p005-frame` runtime marker. This is a bounded client-chunk scan, not a
claim that all server metadata is absent.

Final adapter SHA:
`8e161d923e004868959c32ecb8943464e241bf25b95d1970f87f6b878fe54812`.

Final 8 GB full production build passed, including TypeScript (2.3 minutes),
248 static pages, and 11/11 production asset-profile tests. BUILD_ID:
`Yjig3MRlO5U629MnVcDC-`. Final scan examined 735 production client JS files
and found none of the three P005 markers above. Production asset checksum set
remains `54e11e77a8d684fcf9542ba7458c12add3edb1a85c16ac99db756a34ed5c6ad4`.

Actual `next start` on loopback port 3137, deliberately with local-preview flags
present, returned 404 / 9 bytes for both EN/ES probe pages and the exact
SHA-pinned Canvas URL. Ordinary page requests also returned 404 / 9 bytes.
All task-owned browsers, servers and subagents were closed after verification.

## Visual evidence and limitations

Main inspected `output/playwright/g678-p005-host-20260926/desktop.png`,
`en-768.png`, `en-320.png`, and `es-320-final.png`.
The first EN images precede moving probe disclosures below the host, which
avoids those additional paragraphs being covered by the fixed shared header.
`es-320.png` was captured before language navigation completed and is **not**
Spanish evidence; retain it as an invalid intermediate capture.

The final Spanish screenshot still shows shared narrow-screen review UI issues:
the fixed header covers part of the audit banner, and long `fotogramas` labels
crowd their step buttons. These are not accepted layout results. No shared host
or shared CSS was changed to hide them. The lesson drawing itself is contained
and visible. Full visual/host admission remains pending.

Final ES screenshot SHA:
`63685b55f9ac5cdb8c9a6e2abc6f159a02e69e3a99d9f745a8e8e559cef4b410`.

## Next boundary

Resolve source-stream clock behavior and remaining host
review issues before considering private Current-JS admission. Original runtime,
audio/listening, Spanish content, fidelity, human/Owner, strict completion,
release and publication are all independent and remain unaccepted.
