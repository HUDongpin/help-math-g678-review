# P005 source-bound native typography implementation route — 2026-09-27

This is a read-only engineering audit of the P005 source, maintained drawing
generators, module, private My Lesson host and shared typography contracts. Its
only written artifact is this report. The audit did not change source binaries,
P005 drawing candidates, host code, registry, audio, P006 or provider state.
The main task is implementing the bounded route independently. A final source
read at 2026-09-26 20:59:08 UTC observed its new P005 `textPresentation` declaration
and explicit host selection; this report is not validation of that new renderer.

The narrow maintainable route is a P005-specific, reproducible typography
variant of the unchanged mask-corrected candidate-v2, one native title binding
and a renderer that commits the source drawing and DOM text together. Preserve
the existing P005 visual clock, seek, terminal and Replay handling. Full source
role disposition and independently observed host results are prerequisites for
a completed typography binding/check pair; a visible title alone cannot resolve
the remaining source-risk categories.

## Source and current generation chain

The physical source is
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW05.swf`,
1,950,595 bytes, SHA-256
`b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.
The shared parser independently re-read these bytes during this audit. Its
catalog content SHA-256, computed from `JSON.stringify(catalog)`, is
`afad1a722a1e4c74d2ca4406375ca6e62e4f6dbd719354b86b3a23bae39a7fb5`.
The parser is `scripts/lib/swf-text-source-catalog.mjs`, SHA-256
`5a65075738bcdd62a9fb79cca0aaf7fe7ab59857bd3852fdf5063d6c1fe8a3dc`.

The SWF has an 800×600 stage, 12 fps, a ten-frame root, a 968-frame main
`sprite-391`, and six separately authored drawing domains: sprites 78, 147, 258,
289, 306 and 346. The catalog has nine timelines, 809 placement instances, 2,502
placement events, one static text definition/decoded run, no dynamic text,
383 shape definitions including morph shapes, three bitmaps, no buttons and
zero unparsed tags. These are structural facts, not a natural-runtime trace.

The maintained chain is:

1. Pinned FFDec 26.2.1 exports under `audit/ffdec-26.2.1-canvas-v1` and the
   physical SWF feed `scripts/build-g678-alg-l12-p005-candidate.mjs`. That producer
   reads source structure and exports, calls the maintained safe Canvas builder,
   and appends only the source-identical missing functions `font392`, `text393`,
   `shape394`, `sprite395`, `shape396` and `main`. It compensates the standalone
   sprite export's translation and composes the real root-frame-six main, title
   and border. Its detached drawing surface prevents reverse-seek state from
   leaking through retained masks or transforms.
2. The result is immutable `candidate-v1/canvas-renderer.js`, 19,449,725 bytes,
   SHA-256 `3dbbe2b2448530f9c531b3de9609e6f3167e0803a7c1e7d38899fd422d51713c`.
3. `scripts/build-g678-alg-l12-p005-mask-candidate.mjs` independently audits the
   pinned XML and changes only the two exclusive mask fills: shape1 at depth1
   through clipDepth132, and shape203 at depth2 through clipDepth56. Geometry,
   ordinary artwork, depth order and other alpha are retained. Its audit rejects
   advanced placement tags and updates while a mask is active.
4. The result is immutable `candidate-v2/canvas-renderer.js`, 19,449,678 bytes,
   SHA-256 `48efbca3ddebf218565cdd635ffa130ae3a402c5693dd1ebcf359b2c30d500dd`.
   Its `mask-manifest.json` is 1,306 bytes, SHA-256
   `4192c6a8a11d15b55441fdcd4aff8257ea46ddb93576e57eb432281d8870a8f2`.
   The v1 adapter-spec remains the base drawing contract; v2 contains this narrow
   mask correction rather than a new acceptance claim.
5. `packages/demos/src/timelines/shared-alg001-l12-p005.ts` binds this v2 drawing.
   The source-static module preserves the original renderer. The private route
   and `apps/web/lib/g678-alg-l12-p005.server.ts` enforce local source opt-in,
   physical file identity, exact byte/hash pins and local-only serving.

Additional audited chain pins are:

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| `scripts/build-g678-alg-l12-p005-candidate.mjs` | 11,003 | `68ac74c765e82d60fc3bc8dc84b8e6ea32b5b75e27195169e49a88034545dc83` |
| `scripts/build-g678-alg-l12-p005-mask-candidate.mjs` | 5,217 | `f8f332940ceb78fc9539b6e9c796c69fc459e22eb531f81b445f7b8d9a6b535f` |
| `scripts/validate-g678-alg-l12-p005-runtime.mjs` | 1,487 | `0d0b89bc2dc8d98c1eb33bf88d2865663204ed349305a894c4e1f95b31368e1e` |
| `scripts/build-safe-ffdec-canvas-adapter.mjs` | 115,553 | `1d1dd117dd59a6b7191f2fa8488249ece09bfb1da8837be146677f88a01315dd` |
| `audit/movie.xml` | 36,296,747 | `944585dd7b3b53e2d65dc268fffcb1f5c81bde71de5f79c5d2c9c158a142f128` |
| `audit/source-structure.json` | 14,113 | `3292f24e124d9160356701b50cc458f0bf8e5f3e717953e6db50edb7aef4b26d` |

These are audit-time pins. A future binding producer must re-read actual current
maintained dependencies; this table is not an exemption from detecting drift.

## Exact title identity and suppression boundary

The independently decoded `character-393/run-0` text is exactly:

`Graphing in the Coordinate Plane: Real World Activity`

Its DefineText tag SHA-256 is
`52f9d7b49856a93e5f5be4debf0bba882237e78637519a5a690805fb56d663cc`.
It is an off-stage semantic duplicate, not the visible glyph plane. The live
outlined title is shape394. The separate source inventory agent confirmed its
exact placement and stage bounds in the now-completed bounded inventory
`evidence/TYPOGRAPHY_SOURCE_INVENTORY_2026-09-27.md`, 13,015 bytes, SHA-256
`fcd22cd2c013477c1517c4c9905c1d8e117cfd013086007d57f16b3950f7c33e`.
This route independently read that report. It proves the title-only slice;
complete remaining shape/bitmap semantic disposition is still a dependency for
technical risk resolution rather than an assertion supplied by either report.
It also independently compared all55 visible outline contours against font392:
the title's53 characters have capitals G/C/P/R/W/A and the same exact text above.
Its comparison included the separate i dots, o holes and both colon dots;
maximum reported sampled contour deviation was5.865 twips, about0.2933
source-stage pixels. That finite comparison is not a bound on unsampled curves
or byte identity. This P005 comparison
is required because the P006 visible outline's capitalization is different.

| Item | Exact source identity |
| --- | --- |
| Title parent | `root/depth-135/generation-1`, character395, named `Mc_Page_Title`; active root frames6–10; matrix `[1,0,0,1,8068,-848]` twips |
| Visible title leaf | `sprite-395/depth-2/generation-1`, character394; one-frame sprite; identity matrix; tag SHA-256 `64b21d8aaaf3819405b69db395a7fea5d89e4ff7fbb702dc518f088b0ad7b808` |
| Title leaf placement tag | SHA-256 `2d3e357b10f0bde2a865ba8b7c5b7ca73442d1683fcc2e4b1dcd280a16f092fb` |
| Title parent placement tag | SHA-256 `18acf4be76fab54b4a1059805b1baa70919a12a51df40fb725fdc69b619622e8` |
| Text393 sibling | `sprite-395/depth-1/generation-1`, matrix `[1,0,0,1,-5661,-1912]` twips; preserve it |
| Source border | root depth138 character396, tag SHA-256 `9290446cf541f3c5dfb01dceb4f66c8632a5ea6661d6a818636715bccbb9e6ab`; preserve it |

Shape394 bounds `[-5720,5585,1473,1961]` twips project to stage
x117.4–682.65 and y31.25–55.65 pixels. Text393's bounds project to
y−131.75 to −108.35 pixels. Suppressing only `text393` would leave the old visible
outlined title intact and create duplicate native/source words. Moving the
off-stage instance into a visible layer would also confuse source visibility
with the modern semantic decision.

Use a title `LessonTextBinding` block with `sourceTextIds: []`,
`sourceShapeIds: [394]`, role `title`, language `en`, readingOrder0,
valueSource `source-static`, and instance path:

```text
root:135:1:395/sprite-395:2:1:394
```

The outlined-text `sourceRoleDecisions` must bind the exact shape tag, the source
inventory's reviewed semantic value/case, and the above visible path. Record
`character-393/run-0` as corroborating semantic evidence separately. A copied
producer assertion that every text ID must be the visible instance's leaf would
be incorrect here: the visible leaf is a shape, and its semantic text evidence
is a sibling text definition.

Use Acorn to identify and validate the exact generated call sites before
instrumentation. The candidate-v2 AST has one real rendering entry:

```javascript
// scope: render
place("sprite395",canvas,ctx,[0.05,0,0,0.05,403.4,-42.4],
  new cxform(0,0,0,0,255,255,255,255),1,0,5,0);
// scope: sprite395, switch case0
place("shape394",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
```

Wrap only the real `render` title-parent call with a P005-specific title scope;
instrument only the unique shape394 child `place` in sprite395 case0. Source
`main` also has five title-parent calls in cases5–9, but the composed candidate
does not invoke raw `main` for its normal render. Do not accidentally instrument
all those calls as five independent current-frame instances.

Suppression must require all of the following: verified candidate and physical
source bytes; the exact parent/child lifecycle and matrices; current title scope;
object `shape394`; blendMode1; main frameDomain `sprite-391`, rootFrame6,
scenario `source-static-frame`, language `en`, seed0, integer public frame1–968;
a valid snapshot; and an explicit request for the exact title instance. Unknown
requested IDs, unsupported contexts, nonunique AST matches or any unfulfilled
suppression must block the modern result. Preserve the text393 sibling, shape396
border, both clip masks and all unrelated drawing functions. This is an exact
instance adapter, not a global shape/font suppression rule.

The candidate fixes root composition at frame6 and draws sprite395 every main
frame. Its title is therefore visible throughout this candidate's public frames
1–968. This timing is a bounded source/static-candidate contract; it does not
establish natural Flash preloader or root advancement behavior. P006's body
question, whole-word reveal frames, paper/underline removal, glossary controls
and Spanish audio are unrelated and must not be copied into P005.

## Native renderer and host lifecycle

Create a new versioned `typography-v1` derivative and leave candidate-v1/v2
unchanged. A maintained P005 producer should pin the source, candidate-v2,
parser catalog and exact shape394 selector, validate the restricted generated
runtime, then emit the drawing asset, runtime metadata and adapter manifest
create-only. `--check` must reconstruct exactly. Give it a separate browser
registry such as `HELP_MATH_P005_TYPOGRAPHY_ASSETS`, with `renderWithText` returning
state, observed/suppressed IDs, diagnostics and unfulfilled IDs.

P005 needs its own native snapshot, renderer, loader and CSS. Reuse the shared
`LessonTextBinding`, `lessonTextInstanceId`, `buildLessonTextSnapshot` and
`LessonTextPresentation`. Use a dedicated fixed-size Canvas staging renderer:
the existing P005 drawing only accepts exactly800×600, while shared
`LessonCanvasPlane` currently requires adaptive metadata declaring scales[1,2].
Its selector validates that declaration and always enables adaptive backing.
Do not invent2× drawing support or change the shared contract to complete this
bounded title slice. P006's dedicated staging/commit structure is a useful
implementation pattern; its page-specific semantics are not reusable data.

The renderer should:

1. Await a same-origin local private asset through a metadata-bound SRI loader
   and the asset's own `ready()` promise. Existing globals alone are not hash
   evidence. Guard stale development globals and late unmounted promises.
2. Build one pure snapshot from the host's exact frame, frameDomain, rootFrame,
   scenario, language, seed and Replay revision. It owns no animation/audio clock.
3. Render into a detached800×600 surface, requesting exactly the snapshot's
   suppression IDs. Validate the returned state identity and complete fulfilled
   suppression set before preparing the new native layer.
4. Commit the matching Canvas and DOM text before the same paint. Mark
   `data-canvas-status="ready"` only after the visible Canvas copy succeeds.
   A missing/partial suppression or failed copy must not reveal text over an
   incomplete drawing. Keep a clear unavailable/error state.
5. Dispose staging surfaces and ignore late asset completions on unmount.
   Font settings, width, zoom and DPR may reflow DOM text but must not mutate
   frame, seed, progress, Replay, seek or audio state. Keep the source bitmaps at
   the actual native800×600 drawing resolution and disclose that technical limit.

The audit baseline module exposed only `candidate.module`, and the P005 host
selected `drawing?.Renderer`. The main task's subsequently read source now
preserves that original renderer while declaring P005 `textPresentation`, and
selects `drawing?.textPresentation.Renderer`. It also adds
`data-lesson-presentation="modern-text-v1"` and binding version to the runtime
root. These attributes are necessary: existing `lesson-typography-host.css`
switches the real lesson's stage from a cropped authored plane to document flow
only when that opted-in native runtime is actually mounted. The source-level
switch requires independent browser proof, including its visible-copy readiness
edge and the host's MutationObserver behavior.

Retain the existing P005 visual clock, terminal968, Replay revision, seeking and
reduced-motion pause. The host and private adapter remain `audioEnabled:false`,
`audioAvailable:false`, with narration unavailable. The independently developed
muted natural-audio candidate controller is separate evidence and must not be
wired into this typography work. Preserve the current unregistered host-probe
descriptor and its P003 predecessor contract unless a separate reviewed
admission task deliberately changes them. Registration and typography are
distinct transitions.

English remains source text. On an ES host use a visible Spanish explanation
that this page has unverified translation and render the source title as
`lang="en"`. No translated ES block, accepted Spanish narration or bilingual
content acceptance can be inferred from the locale toggle.

## Binding/check tools and remaining concrete gaps

`docs/G678_LESSON_TYPOGRAPHY_INTEGRATION.md` supplies the actual G6–G8 contract.
Use the existing single-source parser and G6–G8 checker; the default G3–G5
1,751-page catalog generator is not this page's source profile. The shared
integration catalog contains28 pinned shared files and has audit-time SHA-256
`6b860e475e10873e707d7fbe8814fe85b152c33b4d90a16535ceccfccd83b9d9`.
Do not baseline P005 merely to avoid a new/changed-page check.

A P005-specific binding producer and tests are still needed. Initial outputs
are the new paths:

```text
catalog/typography-v1/g678-page-bindings/shared-alg001-l12-p005.json
catalog/typography-v1/g678-checks/shared-alg001-l12-p005.json
```

Both were absent during this audit. Initial candidate creation needs no P006
refresh, predecessor-pair supersession or admission transaction. The producer
should first create a source-bound candidate binding with explicit unresolved
technical checks. It may finalize only from a new independently produced P005
receipt that binds actual current implementation and observed artifacts. Pin
the module, timeline, native snapshot/renderer/CSS/loader, both asset/host routes,
source/server checks, maintained generators and tests, current private host and
clock, relevant host presentation dependencies, package/config resolution, source
inventory, derived asset/meta/manifest and every `integration.sharedFiles` item.
Resolve actual local imports and qualify unrelated registry branches instead of
claiming whole-application closure. Exclude binding/check outputs, the receipt
itself and mutable registry/dispatcher state from their own critical-input
inventory; immutable source evidence must not depend on a later registration.

The source parser reports four real risk kinds:

| Risk | Required P005-specific resolution evidence |
| --- | --- |
| `shape-text-unclassified` | Complete383-shape/morph source-role disposition; visible outlined title semantics and exact instance selector; preserve any mathematical drawing or still-unclassified content |
| `bitmap-text-unclassified` | Independent inspection of all three bitmaps and their role/placement, with exact source/export hashes |
| `actionscript-visibility-and-values-not-interpreted` | Audit the actual preloader/main-stop actions and demonstrate the modern candidate's limited frame/replay visibility contract; do not claim natural-runtime authority |
| `mask-filter-blend-semantics-unresolved` | Existing two-mask source/XML reconstruction plus native suppression/browser evidence that the masks and other graphics remain intact |

The separate bounded inventory is complete at
`evidence/TYPOGRAPHY_SOURCE_INVENTORY_2026-09-27.md` with the exact pin above.
It explicitly leaves all-shape/all-bitmap semantic exclusion open. Its finite
candidate screenshot inspection found no additional labels at those sampled
frames; neither report fabricates an exhaustive all-frame exclusion. The
physical parser supports no
automatic semantic conclusion that the single DefineText is the only teaching
text. The shape/morph and bitmap source-role disposition is a genuine required
dependency for the full-page binding, even if this narrow implementation replaces
only the title.

The final check must have `kind: g678-lesson-typography-check-v1`, exact
placement/source/binding hashes, a real current `checkedAt`, complete current
implementation/artifact references, explicit `en: source, es: source-fallback`,
all four source risks resolved by hash-bound evidence, and actual results for
all12 checks: sourceBinding, semanticText, mathSemantics, timingAndReplay,
teachingTextDisposition, hostIntegration, responsiveTypography, accessibility,
bilingualPolicy, performance, lifecycle and resourceStability. A source catalog,
renderer import or screenshot cannot stand in for those results.

Targeted verification should cover deterministic generator reconstruction and
negative selector drift, all968 frames with expected title suppression, original
vs derivative equality when suppression is empty, unchanged non-title functions
and clip masks, same-state Canvas/DOM identity, invalid contexts, backward seek,
terminal, Replay, mount/unmount and late asset failure. Real My Lesson checks
should use the shared device/font matrix, title DOM/read order, source fallback,
font100/150/200%, narrow/wide widths, browser zoom and DPR, reduced motion,
readiness/error behavior, no frame resets or audio activation, and current
implementation/receipt closure. Production, nonloopback, opt-in-off, wrong-hash,
cross-origin and invalid-query requests must retain the existing negative route
behavior. Report the P005 row independently if unrelated global typography
backlog issues keep the overall checker red.

## Verification actually performed in this audit

Both maintained drawing producers passed read-only `--check` against the
physical source and existing outputs. The related composition, resolver, mask
audit, deterministic reproduction and restricted runtime suites passed9/9:

```text
node --test scripts/build-g678-alg-l12-p005-candidate.test.mjs \
  scripts/build-g678-alg-l12-p005-mask-candidate.test.mjs \
  scripts/validate-g678-alg-l12-p005-runtime.test.mjs
```

The single-source parser and Acorn inspection independently confirmed the title
definition, exact placement tags, off-stage text coordinates and unique live
render selector described above. No browser, native typography test, new
binding/check, registry write, source-archive edit, provider access or audio
activation was performed by this audit. Original-runtime fidelity, audio
synchronization/listening, human/Owner acceptance, strict completion, release
and publication remain independent and unclosed.
