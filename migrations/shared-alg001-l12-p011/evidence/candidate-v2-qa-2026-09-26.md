# Origin candidate v2: local verification, 2026-09-26

This is unregistered engineering work for `shared-alg001-l12-p011`.

The maintained builder `scripts/build-g678-alg-l12-origin-candidate.mjs`
reproduces `candidate-v2/canvas-renderer.js` with SHA-256
`70bab6fd85db2afa782f987a241aef0abbf6deb5b98bffcca1146b440c541031`
(884,739 bytes). `--check` passed against the physical source root.
The source title sprite 2 and content sprite 33 are composed in source depth
order, at their source placements. The main native stage remains 800 × 600.

## Browser findings

The original `candidate/` output is retained as failed Replay evidence.
After rendering later masked frames, a reused drawing context produced
different title pixels when returning to frame 1. An isolated experiment
using fresh per-frame contexts produced stable pixels. Version 2 therefore
draws each frame on a fresh surface before copying it to the displayed Canvas.
This is a page-specific fix in the generator; the shared adapter is unchanged.
The underlying browser/backend cause has not been established beyond this
reproduction. Performance in the actual My Lesson host remains to be checked.

The browser executed every frame 1–118 through the generated runtime:

- 118 successful requests, 91 distinct rendered pixel hashes.
- Frame 1 RGBA hash `efe7654538c496b901e891b4d7cda2034fd2b60a018c041a700c8dfa725bd7f7`.
- Frame 118 RGBA hash `5cec7d2dd460560ae8656ad4da1940be9b37a0382ce437c7a5198b37e9e73355`.
- Frame 1 after the sequence matched the initial hash exactly.
- Repeated frame 118 matched its earlier hash exactly.
- Frame requests 0, 119, and 1.5 all threw errors.
- No console errors; a Canvas readback performance warning appeared during hashing.
- The first and final frames were visually inspected. The final frame shows
  the source title, the origin sentence, labeled axes, signed grid coordinates,
  and the marked origin.

Screenshot: `output/playwright/alg-l12-p011-v2-frame118-20260926.png`, SHA-256
`7ca06955bafd7e8f27df5e8deab32e3e4e53043669bea6502ff0d6f493f2bd36`.
This is a local drawing capture, not original-runtime comparison evidence.

Reproduce locally with `node scripts/serve-g678-alg-l12-origin-candidate.mjs`,
then open `http://127.0.0.1:3127` and click `Check all frames and Replay`.
The server exposes only the probe and this candidate runtime on loopback.

## Maintained product module

`packages/demos/src/modules/shared-alg001-l12-p011.tsx` now uses the maintained
vocabulary glossary component with six source-bound buttons. The timeline
module binds the v2 hash, 10 root frames, sprite-33's 118 frames, and native stage.
The new source/SSR tests passed 2/2: they check each button's exported
KeyAttribute/action and XML placement frame, then test English/Spanish host
control visibility at frames 1/7/8/77/78/118. Controls appear 0/0/3/3/6/6.
These tests do not prove live modal focus, pause/resume, or audio lifecycle.

## Remaining work

The candidate module has no official registry entry, source-ordered descriptor
admission, or served My Lesson asset route. Next: freeze the tested artifacts,
admit the exact P011 placement into an L12 descriptor, add six source-backed
glossary definitions to its host, and run actual My Lesson glossary/pause/
Replay/navigation/EN-ES-responsive and production-negative checks. A build is
still required for that integration. Registration remains 476/2,282 as of the
preceding verified count; this candidate adds zero registered pages.

Original runtime, fidelity, audio/listening, human review, Owner acceptance,
strict completion, release, and publication remain open. P002's audited
two-layer long-form animation remains unfinished in its own workspace.
