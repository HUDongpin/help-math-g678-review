# P006 native teaching text — 2026-09-27

## Scope and current result

This continuation implements native, responsive teaching text for
`shared-alg001-l12-p006` on the existing local modern My Lesson host. It retains
the continuous-stream-v2 main audio and the separate, explicitly selected
Spanish Audio controller. There is no new timer, source asset, translation,
registration, deployment, or independent acceptance decision.

The source is the physical AWS file
`G6-G8-shared/ALG001/L12/RW/L12RW06.swf`, SHA-256
`933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
The source catalog content hash is
`ade09b22c6df92ebbef45c15154abe20e60ffff2f8328dd9e1b877b734611996`.
See `TYPOGRAPHY_SOURCE_2026-09-27.md` for the complete source-role audit.

The original, mask-corrected candidate-v2 adapter remains unchanged at
`b2fd1788ce5bab5efab167bf303608da66621ead66f6d276979fb09558b39ddc`
(11,507,597 bytes). The separately generated native suppression adapter is
`5b4b15ea0d75f77025ddbadacbc679e3355f9bf87aeedae2531ec87763e8714e`
(11,529,506 bytes). It is generated through
`scripts/build-g678-alg-l12-p006-typography.mjs`; its drawing output is not edited
by hand.

## Teaching content and exact suppression

- The visible outlined title is shape55 in
  `root:65:1:56/sprite-56:1:1:55`. The native heading is exactly
  `Graphing in the Coordinate Plane: Real World Activity`.
- The question binds text46 runs 0–6 and the exact active placement
  `root:1:1:53/sprite-53:20:1:46`. The native question is exactly
  `Essential Question: How can we use the coordinate plane to graph equations and inequalities?`.
- Complete words appear at frames 254, 259, 278, 280, 282, 284, 286, 298, 301,
  311, 314, 319, 331 and 338. These thresholds come from actual font45 glyph
  extrema and morph43 clipping ratios, including quadratic curve extrema and
  sparse authored ratios. A word is never shown before its complete source
  geometry is visible. This modern whole-word policy does not claim equality
  with partially revealed legacy glyph pixels.
- The four glossary underlines in shape44 are removed only at
  `root:1:1:53/sprite-53:19:1:44`, from frame 249. The existing semantic glossary
  buttons retain the actual source term IDs and source-index host actions.
- The old yellow question paper is removed only at
  `root:1:1:53/sprite-53:17:17:42`, from frame 242. A native light-yellow question
  card replaces it. Earlier depth17 generations and their other graphics are
  retained. Neither this paper nor the underlines are authored words or math
  geometry.
- Offstage root text54 is preserved and is not credited as a displayed native
  block. The source bitmap and other classified shapes remain graphics. There
  are no mathematical expressions or dynamic numerical answers to invent on
  this page.

Title, question and figure have matching semantic/visual reading order. Text is
real HTML. EN content carries `lang="en"` on both EN and ES routes. The ES route
has a separate Spanish-language notice explaining the missing verified
translation; Spanish navigation and optional SA do not convert the English
teaching text into Spanish-source coverage.

## Maintained runtime and failure behavior

`alg-l12-p006-typography.ts` derives its snapshot from the existing source clock.
The renderer uses one reusable 800×600 staging surface and commits the visible
Canvas plus native text before paint. Readiness requires a successful visible
copy, not just a successful offscreen render. Unsupported explicit source
context is rejected. A null visible context or failed copy clears the native
presentation, reports error, and makes the existing host pause.

The separate asset loader uses browser SRI and the loopback-only server route's
independent hash/source checks. It removes only the exact configurable stale
P006 registry entry before a new module load; an old same-source global is not
accepted as evidence of the new bytes. Other registry entries are untouched.
Nonreplaceable stale state fails closed. The ordinary successful promise is
reused during navigation within the same module lifetime.

P006 uses document flow for the native text, figure and semantic controls. A
real wide-touch test exposed the host's source-stage companion rail reducing
the native stage to zero width. The page-scoped CSS now stacks these elements
vertically, including coarse-pointer layouts. It does not change the shared
host rules for other pages. SA and glossary controls inherit the responsive
font size and wrap at 200% text size.

Graphics stay explicitly capped at native 800×600; no 2×/3× source bitmap or
vector rendering support is claimed. Native text stays browser-rendered at
DPR1/2/3. Replay, glossary pause/return, main/SA cursor separation, terminal
guards and Next cleanup retain the existing host contract. In reduced motion,
initial loading does not autoplay and a preference change pauses playback;
the established explicit Play/Replay user actions remain allowed to start it.

## Independent engineering checks

Evidence directory: `output/playwright/p006-typography-20260927-v1/`.
Browser checks used desktop Chromium with real DOM/Canvas/Web Audio and
explicit viewport, density and touch emulation. They are not physical-device
or human listening acceptance. Playback tests used the actual mute control.

| Check | Observed result |
| --- | --- |
| Generated adapter | 10/10 tests; exact generation `--check` passes. Original ordinary rendering, mask-corrected v2 baseline, exact generation/instance suppression, earlier background generations and reusable staging are covered. |
| Native snapshot | 3/3 tests; all 342 source frames checked against independently derived glyph/mask geometry; invalid source contexts fail closed. |
| Private asset route | 3/3 tests; source/hash/ordinary-file identity and negative path, query, method, origin, range and production scope checks pass. |
| Binding/finalization guard | 7/7 tests; stale or incomplete inputs, unresolved risks, wrong language, future time and foreign/finalized overwrites are rejected. |
| Actual browser source comparison | 11 frames: 1, 129, 241, 242, 244, 248, 249, 286, 337, 338, 342. Ordinary new-vs-v2 drawing has zero changed pixels; native suppression has zero changes outside the exact title/question regions. This compares current JavaScript with its retained source-derived baseline, not Flash runtime. |
| Normal responsive matrix | EN and ES at 320, 390, 768, 1280, 1440, 1920px, plus 320px at 200% text size. No document overflow or clipped prose/controls. At 200%, question and companion buttons are 36px; title is 56px. Every tested control remains at least 44px high. |
| Touch and font fallback | DPR3/coarse-pointer touch context at 320, 390, 844, 1280, 1920px. All four actual glossary buttons opened via touch at every width. Both lesson font requests were deliberately blocked; fallback text remained present and unclipped. 320px/200% remained within the viewport with 36px question/control text. |
| Density/orientation | DPR1/2/3 retain the declared 800×600 buffer and one visible Canvas. Portrait/landscape changes retain the frame and sample. |
| Keyboard/focus | All four glossary buttons opened with Enter, focus remained inside the correct glossary dialog with Tab, and Escape restored the initiating button. All terminal tests retained sample 626587.5 without starting main audio. |
| Main/SA lifecycle | Terminal SA returns without main restart. Nonterminal SA freezes frame/sample; resize during SA preserves them; return resumes the retained main offset. Replay removes the completed question and returns to frame1. Next removes the native Canvas and stops owned playback. |
| Live layout/font/sidebar changes | Main playback remains on one buffer-source start through four resizes, an explicit font fallback swap and actual lesson-section sidebar collapse. Samples increase monotonically, Canvas and host frame agree, and changing to reduced motion pauses. |
| Natural main playback | 28,802ms to terminal frame342/sample626587.5, one main start, zero SA request. 339 distinct observed rendered frames have matching native/host frame and ready state; no question before source frame254. The exact final question is present. This does not assert capture of every intermediate frame. |
| Failure injection | Six cases: 404, invalid SRI bytes, null visible context, initial visible copy throw, visible copy throw during playback, and an existing same-source stale global. All pass: failed display never reports ready; failed display has no native text/Canvas and stays paused; stale global is replaced by the actual SRI-loaded adapter. Next closes all instrumented owned contexts. |
| Scoped lint/type checks | Scoped ESLint passes. Web TypeScript passed; the final production build is recorded below. |

The generic `URL` helper was unavailable in the CLI test-runner context during
the first touch/font attempt; that runner was corrected to log the observed
request path directly. Preserved failed attempts also include an overly broad
dialog selector, an emulated touch dispatch attempt, waits that overlooked
restored page progress, and the real wide-touch zero-width defect. The final
touch run records successful results; its leading replayed runner error is
retained rather than removed. Dev HMR errors from intermediate generator
replacement and stale registration are historical, not final success evidence.

## Performance and resource scope

On the same desktop Chromium/local webpack development build, three full
342-frame runs measured the graphics adapter plus visible copy:

| Pipeline | P95 per run | Temporary Canvas allocations per 342 frames |
| --- | --- | --- |
| Retained source-v2 | 54.7 / 54.3 / 53.7ms | 1,440 |
| Native suppression + visible copy | 53.2 / 54.1 / 55.5ms | 1,098 |

The native P95 stays below this page's 83.33ms budget at 12fps. The benchmark
excludes native DOM layout from its per-frame measurements; the separate
natural/live-host tests cover actual composition and state continuity. It does
not establish device-independent speed or a general efficiency improvement.

Measured real-host first-ready was 1,780ms in this warm local build. Later
adapter fetch/parse/decode observations were approximately 51ms for source-v2
and 59–77ms for native. The first source request included a cold dev-route
compile at 1,159ms, so it is not a fair baseline for a load-speed claim.

Four Next/Previous remount cycles preserve one visible P006 Canvas and one live
owned audio context; old contexts close. Resize alone adds no Canvas allocations,
and the initial sample remains zero. No context loss was observed. The runtime
releases its reusable staging dimensions on unmount. This is a bounded
lifecycle check, not a heap-retention or physical GPU-memory proof.

## Source risk dispositions

- `shape-text-unclassified`: all 47 shape/morph definitions are inventoried in
  the source-role audit. The visible outlined title has an exact shape hash;
  decorative underline/paper generations have exact dispositions. Other shapes
  stay source graphics.
- `bitmap-text-unclassified`: the single source bridge bitmap was visually
  inspected and retained. Incidental scene signage is not substituted for
  required teaching prose; no rasterized teaching question is left behind.
- `button-runtime-state-and-actions-not-interpreted`: four source-bound glossary
  buttons use the existing semantic host adapter, with keyboard/touch/focus,
  paused terminal state, typed term IDs and navigation checks.
- `actionscript-visibility-and-values-not-interpreted`: the maintained source
  frame/continuous-audio state and explicit SA/host disposition are retained.
  Native text derives from that state; exact glyph/mask analysis covers the
  reveal and Replay. This resolves this typography implementation's text/state
  risk, not unrestricted ActionScript or original-runtime fidelity.
- `mask-filter-blend-semantics-unresolved`: the mask-corrected v2 baseline is
  pinned; the mask function/composition stays byte-identical; eleven real-browser
  source/suppression comparisons and all-frame reveal thresholds support the
  exact replacement. No original Flash parity is asserted.

## Final build and ledger boundary

The final default production build passed: 11/11 build asset checks, webpack
compile (19.5s), complete web TypeScript (2.2min), 250/250 generated pages, and
build traces. The built production server returned 404 for both EN/ES P006
routes and all four P006 graphics/audio asset routes, including the new native
adapter. A search of production static output found zero P006 native/SA runtime
markers. See `production-build.log`, `production-negative.json` and
`production-marker-matches.txt` in the evidence directory. The owned browser,
dev server and production server were closed after these checks.

The build-generated `apps/web/next-env.d.ts` was restored byte-for-byte from
the actual pre-turn backup; its restoration receipt is retained. Other existing
dirty/untracked work was preserved.

The twelve technical checks above are supported by actual source, code and
browser evidence. The maintained binding producer will only record their
passage from a current hash-bound receipt. The generated binding/check files
are the authority for recorded status; this prose does not itself activate a
registry entry. A separate checker postflight records validation of the new
P006 row in an isolated physical copy without changing the actual registry.

Official registration remains 480/2,282 and ALG L12 19/52; P005 and P006 remain
unregistered. The local probe's simulated 20/52 is clearly marked. Final
Current-JS admission requires maintained producer/descriptor/route activation
and final generated registry byte bindings in the correct dependency order.
It does not require inventing human review or converting independent pending
acceptance gates into technical blockers.

Original Flash runtime/fidelity, listening, human visual review, Owner acceptance,
strict completion, release and publication remain independent and unaccepted.
