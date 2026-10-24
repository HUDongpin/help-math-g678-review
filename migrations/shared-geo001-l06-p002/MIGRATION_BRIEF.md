# GEO001 Lesson 6, page 2 — source-locked audit, not yet Current-JS

Date: 2026-09-24. Placement `shared-geo001-l06-p002` is the first Real World
Activity page, and the second active page of the 54-page shared GEO001 L6
lesson. The source XML title is `Page 1`; the embedded concept text defines
area as surface in a two-dimensional figure. This is a G6–G8 shared placement,
not a grade-specific publication. The catalog mapping to specific grades is
still pending.

## Preserved identity

- Physical read-only SWF:
  `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/GEO001/L6/RW/L6RW02.swf`.
  Length 1,117,764 bytes; SHA-256
  `3f340d0201e0f4eed1c8e73d364641d5de4b625e64c33680059842b523002c44`.
- `assetId` is `swf-` plus that full digest. No same-path FLA was present.
  No source was copied into `source-assets/` or a public bundle.
- Catalog identity: `catalog/g678-page-only-release-manifest.v1.json` and
  `catalog/g678-shared-catalog.v1.json`. The shipped SWF remains the behavioral
  source; catalog audio is a separate candidate, not an accepted cue.
- swfmill 0.3.6 XML: `audit/movie.xml`, SHA-256
  `241debfeeb1def99d6eebc5f7b8b3cc2d0a8966ca50fa6dc627b7c0bdd491a73`.
  FFDec 26.2.1 script and text exports are under `audit/ffdec-26.2.1/`.

## Source structure and interaction

- CWS v6, AVM1/AS1–2, 800 × 600, 12 fps, ten root frames, background
  `#b8d8f7`. Root frame 1 calls the legacy
  `_level0.InternalPreloader.gotoAndPlay("jump_check")` and stops. Root frame 6
  stops and places `sprite-230` at depth 4. The original host's entry path has
  not been executed; a static root-to-child observation is not a natural trace.
- `sprite-230` has **1,216** frames, 1,478 PlaceObject2 tags, 285 removes,
  200 shape definitions, 16 text definitions, one JPEG bitmap and one mask
  placement with `clipDepth=668` at main frame 1. It has no child frame
  ActionScript. This is a substantial visual timeline, not the prior page's
  two-text title animation.
- Four source buttons 211–214 enter at main frame 987. On release they set
  `_global.KeyAttribute` to `Figure`, `Area`, `Surface`, or
  `Two dimensional`, call `_root.DoHyperLinks()`, then stop the animation.
  Their dictionary and FFDec action exports agree. Exact host glossary
  behavior must still be bound before a maintained renderer can present
  these as working controls. The deterministic
  `audit/source-glossary-v1.json` now binds all four keys to the hash-checked
  middle-school bilingual index. `Surface` has a real source conflict: the
  English definition differs between `L1KTE01.xml` and `L1KTS01.xml`.
  The engineering text selection uses the English index for EN and the
  Spanish index for ES, records both variants, and leaves original-host lookup
  verification false. The extractor's no-replace race test passes; this is
  not a human translation approval or glossary runtime acceptance.
- Source teaching text appears near main frames 982–1035 (`Area is the amount
  of surface in a two-dimensional figure.`) and 1125–1174 (`radius` and
  `diameter`). Earlier scene labels include product-like text (`salsa`,
  `FLAKES`, `TWEETY`, `BUNS`); their visual/teaching roles require review.
  Font definitions include Bergell LET, Bobcat, Agency FB, Arial and Bauhaus
  Md BT. Native typography must retain semantic teaching text, not merely
  rasterize all glyphs.
- The source-only pure-linear inventory already marks this exact hash
  `structuralCandidate=false`, reason `buttons-present`, and
  `generationAuthorized=false`. No factory scale-out was authorized here.

## Audio disposition

- The main sprite has one MP3 SoundStreamHead and **1,200** blocks, carried on
  main frames 7–1216 except gaps 418–422 and 464–468. The block headers declare
  2,200,320 samples at 22,050 Hz mono. The pinned extractor
  `scripts/extract-g678-geo-l06-p002-stream.py` removes only each four-byte
  SoundStreamBlock header, then concatenates the original MP3 payloads in
  order. Output `audit/sprite-230-source-stream-v1.mp3` is 496,600 bytes,
  SHA-256 `2109aaa85e801d9a5bddbf2c0f30184e078a9eab75785580f477d51147fe325e`.
  An exclusive-write race regression and byte-for-byte `--check` pass.
- FFmpeg fully decoded the extracted stream to EOF without an error. Although
  ffprobe estimates 99.32 seconds, the actual 22,050 Hz PCM decode contains
  **2,200,320 samples**, exactly matching the sum of all SWF block headers
  (99.787755 seconds). `audit/browser-audio-decode-v1.json` records two
  repeatable, silent Chromium `OfflineAudioContext` decodes: 2,200,320 samples
  at 22,050 Hz and 4,789,812 samples at 48,000 Hz, each with a stable PCM
  hash. Thus the ffprobe duration difference is not evidence of a truncated
  whole stream. Decode alone did not resolve the source-frame-to-decoder
  alignment, negative `seekSamples` metadata, two SoundStreamBlock gaps, or
  host start/stop behavior; no split-at-silence or sample fabrication is
  allowed. Machine decode is not original-runtime listening acceptance.
- A source-derived candidate clock now applies SWF SoundStreamBlock and
  SeekSamples semantics to the *complete decoded* stream.
  `packages/demos/src/geo-l06-p002-audio-clock-v1.ts` verifies every active
  block's 1,837-sample-per-frame seek relation against the pinned IR. The
  first block carries 1,673 latency samples; a candidate audible entry at
  frame 8 and three runs (8–416, 423–462, 469–1216) account for zero-payload
  blocks at 8, 417, 463 and absent blocks at 418–422 and 464–468. The source
  relationship is exact; frame-8 audible entry, browser transport and host
  synchronization are **not** original-runtime acceptance. See
  `audit/source-stream-transport-probe-v5.json` and the
  [SWF format specification](https://open-flash.github.io/mirrors/swf-spec-19.pdf),
  sections on streaming sound and frame subdivision.
- The catalog also identifies physical `SA/L6RW02.mp3`, 214,122 bytes,
  SHA-256 `dc0b02f1f36a52e8276e76236216e153893b4d317c2d241be30bdf575de6853e`.
  It is 44,100 Hz mono, 13.285714 seconds, and fully decodes. Its language,
  trigger and relation to the embedded stream remain unknown. Neither machine
  decode nor source presence is named-human listening acceptance.

## Candidate and next product work

The source-locked builder `scripts/build-g678-geo-l06-p002-display-ir.py`
replays the swfmill tag census into `audit/display-list-events-v1.json` and the
identical product-side `packages/demos/src/generated/geo001-l06-p002-display-ir-v1.json`.
Both are 606,848 bytes with SHA-256
`246882213eb272296b844db0f6ef0e8c968a12b4c8185dc63aa9eabde5504923`.
The build and exact byte checks, including its no-replace race test, pass.
`packages/demos/src/geo-l06-p002-display-state-v1.ts` is a pure direct-seek
state reader for all 1,216 main frames; its tests cover display-list removal,
the frame-1 mask, the two audio gaps, frame-987 glossary appearance, locale
identity and Replay reset. It is **not** a visual renderer. The event IR has
placement identities and matrices but no approved product shape/glyph
definitions, and it establishes neither original-host flow nor audio
synchronization.
The glossary extractor also creates the identical hash-checked product data
`packages/demos/src/generated/geo001-l06-p002-glossary-v1.json`.
`packages/demos/src/geo-l06-p002-glossary-v1.ts` projects the source buttons
to English/Spanish labels and definitions only while they are visible. It
preserves the `Surface` English-source conflict and explicitly marks host
lookup, companion media and click/modal acceptance false. Five focused
product-state/glossary tests and a scoped strict TypeScript check pass.

The full shipped SWF yields 16 exact text definitions. The hash-bound
`packages/demos/src/generated/geo001-l06-p002-text-ir-v1.json` is 14,470 bytes,
SHA-256 `a512bffc8360320ccd989cbca986aff45e42e16cf535a1411ff110d521078f13`;
its exclusive-write race and rebuild check pass. The maintained teaching-state
and native React text component now preserve the actual English sentence,
the four source word-emphasis overlays, and `radius, diameter`; they label the
Spanish route as an English-source fallback rather than a translation. The
first placement frames are alpha-zero: the sentence begins fading in at 983
(not 982) and the term line at 1126 (not 1125). This correction came from
inspecting the display-list color transforms against FFDec visual frames.
Eleven targeted state/SSR tests and scoped strict TypeScript pass. The CSS is
not yet loaded by a page renderer or verified in the real My Lesson host.

`audit/forensic-canvas-frame-observations-v1.json` binds six local-browser
images from FFDec's sprite Canvas export. They are direct-seek forensic views,
not original-runtime baselines or full-frame evidence. To pursue editable
scene reconstruction, FFDec 26.2.1 also exported all 200 source shapes, 16
source text SVGs and the one JPEG into the external
`/Volumes/American Dream/hudongpin/geo-l06-p002-vectors-audit-HMb8qM`.
The no-replace builder froze 200 shapes and seven decorative text SVGs (not the
nine teaching text definitions) under `audit/vector-assets-v1/`; its 207-file
manifest SHA-256 is
`8652fa4164c1c2a11e12684ac9ee9485e33fd67523aab21942f6707eada8725a`.
Exact rebuild and an exclusive-directory race test pass. None is in the
product asset directory.

The first direct nested-SVG rendering probe is a retained **failed candidate**:
`output/playwright/geo-l06-p002-vector-probe-f0001.svg` has SHA-256
`a0029843186257c72f26d61189df9592b3cd564f1a355ff31b881165b59b5bd8`.
The Playwright Chromium navigation to the local SVG timed out; ImageMagick
rendered a PNG (`fb80ada9aaaa2bb4f115aca4e5e3bd0d51403810714cc8d2b60ae53f9e34190a`)
with large missing/black or white scene regions. The cause is not established;
this probe cannot be used as the visual layer or as a fidelity comparison.
The locally installed FFDec distribution includes a GPLv3 license text,
SHA-256 `8ceb4b9ee5adedde47b31e975c1d90c73ad27b6b165a1dcd80c7c545eb65b903`.
That observation is not a project-specific conclusion about shipping generated
helper code; its distribution-review gate stays closed.

An independent inline-SVG reconstruction probe now avoids the failed nested
`data:image/svg+xml` packaging. Its source-locked script expands each exported
symbol into its own depth-prefixed SVG definitions, preserves the SWF display
order, and writes each output exclusively. The v2 receipt
`audit/inline-vector-browser-probe-v2.json` binds Chromium 153 screenshots of
main frames 1, 987, and 1216. In the browser, the kitchen bitmap, chefs,
ingredient props, and lower panels render without the large missing regions
of the first probe. The deterministic/exclusive-output test and XML parsing
pass, as does a scoped strict TypeScript check for the probe. The full demos
TypeScript command exhausted Node's default 4 GB heap and therefore has no
passing result from this run. This is a **browser-verified graphics route for
a local candidate**, not
a maintained dynamic renderer or registered product page. Its palette and
apparent opacity visibly differ from the FFDec Canvas forensic frames; its
instructional text, glossary buttons, root preloader, and audio are absent by
design. Only three of 1,216 main frames were inspected, and ordinary SVG
load-event navigation still times out even though the browser can capture
the rendered image. The generated symbol distribution boundary remains open.

The graphics route now also has a **local dynamic engineering candidate**:
`scripts/build-g678-geo-l06-p002-symbol-sheet.mjs` freezes the 207 SVG
definitions into one 8,122,158-byte symbol sheet, while
`scripts/geo-l06-p002-dynamic-probe-client.ts` reuses the source display-state
reader to update visible SVG `<use>` layers by frame. The local, noindex HTML
at `output/playwright/geo-l06-p002-dynamic-probe-v2.html` is generated with
`scripts/build-g678-geo-l06-p002-dynamic-probe.mjs`. Its builders' exact
rebuild and no-overwrite race tests pass, and its client passes a scoped strict
TypeScript check. `audit/dynamic-source-vector-probe-v2.json` binds the
browser observations: Chromium drew all 1,216 source frames without a script
exception; direct seek at frames 987 and 1216, Play/Pause, and Replay worked
in this local visual-only v2 surface. This does not establish 12 fps real-time
performance or full visual-domain comparison. Teaching text and source
glossary identities remained metadata only in v2.

The v3 local dynamic candidate adds source-bound semantic teaching text and
four keyboard-operable source-index glossary buttons, without treating the
modal as a verified original-host interaction. Its noindex HTML is
`output/playwright/geo-l06-p002-dynamic-probe-v3.html`; receipt
`audit/dynamic-teaching-glossary-probe-v3.json` binds source, generator,
artifact, browser checks, and two visually inspected 320 px screenshots.
Chromium showed the exact English teaching sentence at source frame 983,
glossary controls at 987, and `radius, diameter` beginning at 1126 rather
than 1125. The `Surface` modal uses the existing bilingual source indexes,
discloses the English-index conflict, and restores keyboard focus after
Escape or Close. Replay returns to frame 1 with text and glossary controls
absent. Spanish UI explicitly says the source animation sentence is English;
the four glossary labels and definitions follow the Spanish index. Probe
control labels and the conflict note remain English, so full Spanish product
QA is not claimed. At 320 px, page width did not overflow and the opened
modal remained readable. Four focused Node tests, eleven source-state/
text/glossary tests, the strict scoped TypeScript check, the exact HTML
rebuild, and the concurrent no-overwrite test pass. The only observed browser
console error was a missing local favicon.

No audio is played in v3; the original preloader/host entry and glossary lifecycle
remain unresolved, and no maintained product module, registry entry, or My
Lesson descriptor was added. The v3 artifact must not be published or counted
as Current-JS registration. Source palette/opacity differences from FFDec
forensic views remain, as do original-runtime, fidelity, audio listening,
human/Owner, strict-completion, release, and publication gates.

The v5 successor adds a **user-started local source-MP3 transport candidate**
at `output/playwright/geo-l06-p002-dynamic-probe-v5.html`. Chromium fetches
and SHA-256-checks the intact 496,600-byte extracted MP3, decodes at native
22,050 Hz, and schedules only the relevant decoded-buffer runs; it does not
split the encoded MP3 or manufacture silence. Play from frame 1 and source
seeks at frames 417 and 987 worked. Pause froze the frame and stopped
scheduled audio; clicking a glossary term stopped audio and opened its modal.
Replay during playback returned to frame 1, stopped audio, closed the modal,
and incremented the replay counter.
The v4 predecessor remains a failed candidate: after asynchronous decode,
its first animation-frame timestamp could precede the start clock and yield
frame 0; v5 clamps that boundary. No v5 application-script exception was
observed, but no person listened to or compared it with the original runtime.
The local probe does not establish real My Lesson behavior, original-host
start/stop causality, exact audible synchronization, companion MP3 relation,
Spanish spoken-language determination, audio acceptance, or product admission.

The current broad `check:typography` command fails on a pre-existing set of
51 changed/new placements with missing typography evidence, including P001;
P002 is not registered and is not counted by that checker yet. The focused
P002 tests do not override that result or satisfy responsive/browser QA.

The live registry remains 473/2,282 (20.73%) as of this check; this page is
not among those 473. The previous 20.68% figure represented 472/2,282. Do not
use the existence of this IR or state reader to increment coverage.

FFDec's selected `sprite-230` Canvas export was created **only as an external
forensic candidate** under
`/Volumes/American Dream/hudongpin/geo-l06-p002-canvas-audit-GgH6f1/DefineSprite_230/`.
Its `frames.html` is 11,736,263 bytes (SHA-256
`ce21e1222c253fe754c770e21d2fa8b970bc981fe4694795d0cffe5962e7b362`)
and `canvas.js` is 52,872 bytes (SHA-256
`78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93`).
The exporter warned that JPacker could not minimize the script. These files
are not a maintained module, accepted glyph treatment, approved distribution
dependency, or a My Lesson route. Keep the licensing/distribution review gate
closed if any FFDec helper code is proposed for the product.

The next implementation slice is a maintained main-domain renderer with an
explicit root-to-main entry contract, source display-list/mask and live-text
decisions, four source-evidenced glossary controls through the modern host
(including explicit handling of the `Surface` source conflict),
complete Replay and audio lifecycle, EN/ES disclosure/translation decision,
and deterministic graphics for all 1,216 frames. The dynamic local probe
supports the graphics route, but its color/opacity difference, source-text
product integration, load lifecycle, real-time performance, full-frame comparison,
and distribution boundary must be resolved before it can become the product
visual layer. The failed nested-SVG probe is not a shortcut.
Then freeze it, register the
exact placement, extend source-ordered GEO001 L6, and test the real My Lesson
path on desktop/mobile. Do not register the Canvas export or a muted visual
wrapper as a completed page. The scaffold
`evidence/full-frame-coverage.json` still covers only root frames and is not
a complete main-domain capture plan.

No original-runtime authority, full-frame comparison, audio listening,
human/Owner review, strict completion, release or publication exists for this
page. All remain independently open.

## Maintained local React candidate — 2026-09-25

The source-event projection is now maintained in
`packages/demos/src/geo-l06-p002-scene-v1.ts`; it checks all 1,216 main
frames, source depth order, the shape-4 mask boundary, supported transforms,
and the native-text/control exclusion. The React renderer uses that projection,
the exact 207-symbol, SHA-256-checked source sheet, the semantic teaching text,
and four source-index glossary labels. It is not a registered `AnimationModule`.
The local wrapper gives Play/Pause, direct seek and Replay plus a memory-only
glossary candidate; source glossary click stops its local clock. The exact
loopback, noindex Next route is
`/[locale]/migration-status/g678-calibration/shared-geo001-l06-p002`.
Production substitutes an empty module, and the asset endpoint requires a
local same-origin request with the exact sheet hash. The source sheet is not
copied into a public static directory.

Receipt `audit/react-local-candidate-v1.json` records 20 passing focused
tests, scoped strict TypeScript, browser checks in English and Spanish,
320-pixel no-overflow/dialog observation, and the isolated Next production
build. The first build completed code compilation but exhausted Node's default
4 GB heap during the whole dirty-worktree TypeScript phase; the same isolated
profile passed with an 8 GB heap. The resulting local production server
returned 404 for both this candidate page and its symbol sheet. These results
are local engineering and fail-closed packaging evidence, not real My Lesson
admission. The React graphics still inherit the visible palette/opacity
difference from the source-vector probe, and audio is deliberately absent.
The original root/preloader trace, glossary host semantics, exact audio
synchronization, source-vector distribution review, and full-domain visual
comparison remain open. The private registry remains 473/2,282; P002 is not
one of the 473. Do not count this candidate as Current-JS or call it faithful.

## Maintained local source-audio transport successor — 2026-09-25

The prior v1 local React receipt deliberately had no audio. The v2 successor
now connects a user-started WebAudio transport to the intact, hash-checked
496,600-byte MP3 extracted from the SWF's `sprite-230` stream. It retains the
three decoded-buffer runs and their source-timeline gaps without cutting the
encoded MP3. The exact local-only asset route requires a same-origin browser
request from this candidate page, refuses Range, verifies bytes on the server,
and sends `private, no-store` plus `noindex`. Pause, seek, glossary click,
Replay, terminal frame, and unmount stop scheduled audio or invalidate a
pending fetch.

Receipt `audit/react-local-audio-transport-v2.json` records 22 passing
focused P002/asset-policy tests, strict scoped TypeScript, and local-browser
EN/ES playback requests returning the exact MP3 with frame progression. The
browser checks also observed Pause, glossary stop/dialog, and Replay reset.
The v1 isolated production build/404 check was not rebuilt for this v2 change;
the local request policy and server asset reader both fail closed in
production. Browser transport is engineering evidence, not human listening
or original-runtime audio/sync acceptance. Palette/opacity, original host
behavior, My Lesson admission, and all downstream gates remain open. The
private Current-JS count is still 473/2,282 (20.73%), and P002 is not counted.

## Source mask versus FFDec opacity — 2026-09-25

The visible washed-out FFDec Canvas export is **not** a color target for the
maintained renderer. Source `sprite-230` places shape 4 at depth 1 with
`clipDepth=668`; the shape has blue fill at 0.6 opacity. The FFDec standalone
Canvas export uses that alpha in a `destination-in` composite, and its
629 × 528 white-backed sprite canvas also differs from the 800 × 600 blue
SWF root stage. [Adobe's ordinary mask-layer documentation](https://helpx.adobe.com/uk/animate/desktop/animation/using-mask-layers.html)
says mask transparency and color are ignored: filled geometry is the window.
The source uses `PlaceObject2`, not a bitmap-alpha mask. We therefore retain
the SVG binary `clipPath` and expose `data-source-mask-mode="binary-fill"`
instead of applying an unsupported 0.6 opacity to all kitchen art.

Receipt `audit/mask-semantics-v3.json` binds the source and FFDec hashes,
the specific compositor difference, 23 focused passing tests, and strict
scoped TypeScript. This explains a major *forensic-export-versus-candidate*
appearance difference; it does not prove every color or frame matches Flash.
An authorized original-runtime root-to-main visual trace and aligned native
stage comparison remain required. No Current-JS admission or acceptance gate
changes: 473/2,282 registered, P002 still unregistered.

## Unregistered My Lesson host probe — 2026-09-25

The maintained `AnimationModule` candidate now declares the distinct root
(10-frame) and `sprite-230` (1,216-frame) domains. Root direct seeks expose
the external preloader stop and frame-6 `begin` stop/child placement without
inventing a child playhead or a natural host trace. The React renderer has a
separate structural root view. The source MP3 transport now accepts the modern
host's volume and retains its intact-stream hash/decode checks.

`/en|es/migration-status/g678-calibration/shared-geo001-l06-p002/host` is a
**local-only, unregistered host test fixture**, not the official product
descriptor. It overlays P002 as simulated-available solely to exercise the
real `G678MultiPageLessonPlayer` controls, glossary modal, frame inspector,
navigation context, and source-audio lifecycle. Its banner says why the
host's temporary 9/54 display is not the official 8/54 GEO L6 or 473/2,282
G6–G8 registry count. The four glossary entries are source-index-bound; the
banner also discloses the unresolved English `Surface` definition conflict.
No registry or formal freeze was changed, and P002 remains unregistered.

Receipt `audit/my-lesson-host-probe-v4.json` binds the candidate module,
adapter, descriptor, and route hashes. Browser observation in EN and ES
showed the source sheet loaded, host Play advancing frames, Pause holding the
frame, frame-987 inspection exposing four terms, source-button stop and
modal close remaining paused, explicit Continue resuming, and terminal Replay
resetting frame, Replay identity, and glossary state. The Spanish host
disclosed English source teaching text; its 320 px glossary dialog was
readable with no horizontal overflow. These are engineering observations,
not a human visual decision or source-audio listening acceptance. A real
bug found during the probe—Continue blocked by the source glossary stop—was
fixed before the final browser observation.

The independent webpack production build passed its asset-profile tests,
TypeScript phase, and page generation. The host adapter has a production
stub; its source-renderer and MP3 signatures were not found in the resulting
static directory. From that production build, EN/ES host-probe routes and
both exact P002 asset URLs returned 404. The candidate route remains
available only with explicit loopback preview opt-in. The default Turbopack
dev mode could not follow this worktree's external `node_modules` symlink;
the webpack dev mode served the browser probe.

Next: review the source-vector palette and distribution boundary, align
host-visible glossary/audible semantics and reduced-motion behavior, then
freeze a complete maintained module/asset/adapter closure. Only after the
official registry and source-ordered GEO L6 descriptor load that exact
closure and the real My Lesson route passes EN/ES responsive/audio checks
may P002 increase Current-JS coverage. Original-runtime, full-frame,
audio-listening, human/Owner, strict, and publication gates remain separate.

## Local symbol-sheet technical boundary — 2026-09-25

The exact 8,122,158-byte source-derived SVG sheet now has a repeatable
fail-closed structural audit, `scripts/verify_g678_geo_l06_p002_symbol_sheet.py`.
It accepts only the observed SVG graphics vocabulary, requires 207 unique
character groups and resolvable local fragment references, and rejects event
attributes, executable elements, external resources, document entities and
unknown markup. Its result is 21,453 elements, 2,792 internal references,
one embedded PNG, zero external resources, and zero executable elements or
attributes. The builder's exact-byte and exclusive-write test invokes the
auditor; three positive/adversarial Python tests also pass. Receipt
`audit/source-symbol-sheet-safety-v1.json` records the byte identity and
technical counts. This narrows the local asset risk but **does not** determine
distribution rights for source-derived vectors or prove their Flash colors,
mask appearance, full-frame fidelity, product admission, or publication.

The lesson XML names the P002 SWF with blank `RandomAudio` and `BGText`
attributes; it does not identify a trigger for the separately cataloged
`SA/L6RW02.mp3`. The preserved P002 SWF does have the independently audited
embedded stream. Do not mix, omit, or classify the catalog MP3 as narration
based only on its filename or the XML page entry. Original host behavior and
listening remain required to settle their relationship.

The same exact lesson XML (SHA-256
`f0c135ad236babcb2f31afed8db3204cdeaeb57f9fc590e2e1a639245a443834`)
names `HELP_KEYTERMS/KT/XML/L6KTE01.xml` and `L6KTS01.xml`, not the L1
indexes used by the local glossary probe. The current shared catalog records
both L6 references as unresolved static holds with zero candidates, and the
targeted source/canonical trees contain neither file. The four L1-derived
definitions therefore remain **provisional fixture content**, even where
their words match P002's button keys. The local My Lesson probe now discloses
this missing-lesson-index boundary in EN and ES. Official glossary admission
requires the exact lesson index or an authorized original-host lookup trace;
the L1 fallback alone cannot prove source fidelity.

## Reduced-motion host behavior — 2026-09-25

The unregistered My Lesson probe now honors the browser's reduced-motion
preference by displaying source frame 987, which contains the complete area
sentence and four source glossary buttons. The source audio clock remains
separate: user-started narration can advance while the visual summary stays
still. Frame inspection temporarily displays the inspected source frame;
Continue restores the summary and resumes the inspected audio clock. Turning
reduced motion off restores ordinary source-frame playback. This is a modern
accessibility behavior, not a claim about the legacy Flash host.

The local Chromium probe observed the 987/1 visual/audio split, a glossary
click that stopped the clock and opened the modal, a 500-frame inspection,
Continue reaching visual/audio frames 987/509, ordinary motion reaching
680/680, and Spanish reduced-motion at 320 px with no horizontal overflow.
The source audio was not judged by listening. The unresolved L6 glossary
indexes, original host trace, audio synchronization, visual fidelity, and
formal registry/descriptor admission still prevent any P002 coverage increase.
