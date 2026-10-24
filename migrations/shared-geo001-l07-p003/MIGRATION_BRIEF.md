# GEO001 L7 P003 — source-bound audit, not registered

Updated 2026-09-25. This is a draft audit and local visual-only candidate for
the third active placement in GEO001 Lesson 7 (RW section, source page title
`Page 2`). It is **not** an admitted Current-JS renderer or a My Lesson page.

## Source identity

- Original SWF: `G6-G8-shared/GEO001/L7/RW/L7RW03.swf` under the real AWS
  Grade-Classified Courseware root, not a compatibility symlink. SHA-256:
  `d0e3c429a5cf15de8f89c0e627a51d990b2bfed8d532af3a84f559531b9a4deb`.
- Lesson `index.xml` SHA-256:
  `09a64f93291f211b3f3641acf1b91e08bc77ed2e435636eaa5271e26f717fe9b`.
  No same-path FLA has been found.
- SWF is CWS v6, stage 800 × 600, 12 fps. Its root has 10 frames; frame 1
  calls `_level0.InternalPreloader.gotoAndPlay(jump_check)`. Frame 6 stops
  and places the one-frame title sprite 2 and the 1,274-frame teaching sprite
  140. The original host entry has not been executed.

## Extracted structure and teaching content

- `audit/movie.xml` is the swfmill source extraction (SHA-256
  `c6131380de0e00d4054cfbc89b6b98c50d0f76e0328239e201ce5a523592b35e`).
  FFDec 26.2.1 exported P-code, 41 text records, and the room image
  `audit/ffdec-26.2.1/5.jpg` (640 × 480; SHA-256
  `6fbe31ac8fe92fa53a70d7d77f4f1cea2d17c78a259e80c9c3707448d03c7c4e`).
- `audit/display-list-events-v2.json` is a reproducible, source-pinned
  display-event IR: 360,830 bytes, SHA-256
  `b77c5d9248479e72fa794ba02b8e8db12a181e93371fb309a57cd7c3f8c9b1a9`.
  It records 457 placements, 164 removals, 1,274 source frames and 1,126
  sound blocks. Button frame ranges describe **depth residency only**, not
  visibility, hit testing, or clickability. `display-list-events-v1.json`
  remains as a superseded diagnostic because it mislabeled those ranges as
  active; it must not be used for renderer or acceptance claims.
- `audit/source-text-residency-v1.json` is a separate, reproducible FFDec
  text/export and swfmill/display-event crosswalk (16,505 bytes; SHA-256
  `6ea32d2365decbfcd640f03981d0dc77de428b4f6c17087ab7b22af24cfd0854`).
  It binds all 41 `DefineText` IDs to exact exported UTF-8 fragments and
  depth-resident frame ranges; its exclusive-write race and `--check` test
  pass. It does **not** resolve per-frame visibility, instructional reading
  order, semantic role, or Spanish translation.
- This source-text index exposes a candidate teaching order by first depth
  residence: `3 layers × 9 boxes = 27 boxes` (frame 1), `Volume:` (142),
  the definition of a three-dimensional figure's measured space (413),
  the counters 1–27 (795–874), `volume = 27 cubic feet` (886),
  `1 cubic foot` (1002), and the cubic-units conclusion (1163–1203).
  These are placement timings, **not** original-runtime visibility or
  verified narration synchronization.
- Source forensic keyframes at 1, 413, 422, 460, 943, 1168 and 1274 show
  the volume lesson moving from layered unit cubes to a 3 × 3 × 3 solid and
  27 cubic feet. They are FFDec renders, **not** authoritative original-runtime
  captures or fidelity proof. Original-runtime mask behavior (character 4 at
  depth 1 with `clipDepth=3`), timing, natural traces and Replay remain open.
- FFDec 26.2.1 SVG exports are now indexed by
  `audit/source-visual-assets-v1.json` (SHA-256
  `36c9a39468f5aae0f6767c80999a5c420c085b268e3ee5f5f659e9d0c0af5ce1`):
  87 source shape characters, 41 text characters, and four visual states for
  each of seven buttons (156 files; 1,832,771 bytes). The source-hash-pinned
  generator checks every character ID, SVG root and file hash; one shape SVG
  embeds the original room image as a data URI. These are layered source
  assets, **not** a composed renderer, semantic text treatment, hit-area
  proof, or product-ready visual acceptance by themselves. `asset-inventory.csv`
  points to the per-file manifest.
- `audit/source-visual-layout-v1.json` (SHA-256
  `7b1c537e4f599ca22634d51ecdc78705483fe99c6dc3f64a5699d60d662fc34c`)
  now binds all 135 visual character IDs to exported SVGs and pixel bounds;
  all 128 shape/text exports have exact SWF-twip-derived dimensions and
  origin transforms. The 132 character IDs placed on the 1,274-frame main
  timeline are covered. The byte-identical generated copy is
  `packages/demos/src/generated/geo001-l07-p003-visual-layout-v1.json`.
  Button bounds come from FFDec export geometry, not an original-runtime
  hit-area trace. `geo-l07-p003-visual-plan-v1.ts` resolves each direct frame
  into ordered SVG references, stage matrices, alpha, and mask-depth relations.
  All buttons remain explicitly noninteractive. This is the source-geometry
  composition **plan** for the local candidate, not Current-JS registration.
- This page is `behavior-heavy` because of seven host-owned glossary calls,
  three mask spans, and embedded/standalone audio whose host lifecycle is
  unresolved. The bounded advanced-manual lane uses the compiler-extracted
  display IR plus a maintained pure state/visual plan. Layered SVG with
  semantic HTML controls is the provisional renderer choice; flattened video
  cannot preserve source interaction or accessible text. No bulk factory
  expansion is authorized by this page.
- `packages/demos/src/generated/geo001-l07-p003-display-ir-v2.json` is an
  exclusive, byte-identical product-workspace copy of the pinned IR.
  `geo-l07-p003-display-state-v1.ts` now resolves every root or sprite-140
  frame into a pure source-event state, retaining the mask placement, text
  character identities, button **depth residency**, and audio block index.
  Exhaustive 1,274-frame tests passed. This pure state layer is not an
  interactive renderer or My Lesson host flow by itself.

## Local visual-only candidate (2026-09-25)

- `scripts/build-g678-geo-l07-p003-mask-paths.py` extracts geometric clip paths
  for source mask characters 4 and 41 from the pinned SVG assets. The generated
  `packages/demos/src/generated/geo001-l07-p003-mask-paths-v1.json` passes
  `--check`. A geometric clip is necessary here: character 4's SVG carries
  partial fill opacity, which would incorrectly attenuate content in an alpha
  mask. This is a source-based rendering choice, not original-runtime proof.
- `packages/demos/src/geo-l07-p003-candidate-renderer-v1.tsx` composes the
  source SVG layers in an 800 × 600 stage for the complete 1,274-frame visual
  plan. The physical-source-bound asset loader verifies the original SWF,
  manifest, and each of the 135 selected SVG assets before serving data URIs.
  Buttons are deliberately inert. No glossary or sound is silently simulated.
- The EN/ES route
  `/[locale]/migration-status/g678-calibration/shared-geo001-l07-p003-candidate`
  is available only in an explicitly enabled local preview. It is `noindex`
  and is neither a private registry entry nor a My Lesson route. Its Play,
  Pause, Replay, and frame slider are inspection controls, not a validated
  source interaction model.
- In a real local Chromium session, EN/ES returned 200, playback advanced,
  Pause and frame selection worked, and 320px viewport width had no horizontal
  overflow. Source text became too small to read at 320px; Spanish UI labels
  work, but source content remains English. Desktop keyframe screenshots are
  candidate visuals, not original-runtime comparisons. One SVG-element
  screenshot was blank while the viewport screenshot at the same frame showed
  the composed visual; rely on viewport captures pending screenshot diagnosis.
- The full web production build passed. With production `next start`, the
  candidate route returned 404 for both EN and ES while `/en` returned 200.
  This validates local-only denial, not deployment or lesson acceptance.

## Interaction and audio

- Seven source buttons set `_global.KeyAttribute`, call `_root.DoHyperLinks`,
  and stop the teaching animation. Their exact keys are `Measurement`,
  `Three dimensional`, `Figure`, `Cubic unit`, `Cubic foot`, `Unit`, and
  `volume`. Static placements alone do not establish when a user can click
  each button.
- The lesson references `L7KTE01.xml` and `L7KTS01.xml`, but those exact
  glossary files have not been recovered from the scoped AWS, canonical,
  Google Drive intake, or historical-catalog searches. An L1 bilingual
  glossary can resolve six keys as **substitute content**, not as the L7
  host's proven definitions; `Cubic foot` is missing or ambiguous. Do not
  register a renderer with silent, disabled, invented, or wrong definitions
  for these visible buttons.
- A read-only connected Drive check on 2026-09-25 returned no filename match
  for either exact L7 XML basename. The visible `HELP_KEYTERMS/KT` folder
  contained only `ELEMENTARY`, not an `XML` child. This is a bounded negative
  finding for the connected Drive scope, not proof that no other historical
  copy exists; it does not lift the missing-dependency hold.
- The full 1,126-block embedded stream was reconstructed without cutting the
  MP3 at silence: `audit/sprite-140-source-stream-v1.mp3`, 465,270 bytes,
  SHA-256 `17b1d24e26ca2b225a421bdcaa1250a22a1f311b34d35e6b7880c4946a546e90`.
  It decodes to EOF at 22,050 Hz mono, about 93.054 s. The independent
  `SA/L7RW03.mp3` source is 314,832 bytes, SHA-256
  `d9ce7a45518f5081011b0bbca7d60049f5c0053793ea11458ce6f73ebde5b629`,
  decodes to EOF at 48,000 Hz mono, about 22.488 s. Host trigger, language,
  synchronization, and human listening acceptance are unresolved.
- `geo-l07-p003-audio-index-v1.ts` maps positive source blocks in four runs
  (frames 8–793, 881–967, 986–1124, and 1166–1274), preserving the frame-6
  pre-roll, zero blocks, and intervening gaps. Its source-offset tests pass;
  it is **not** an accepted runtime playback schedule or listening record.

## Engineering checks (2026-09-25)

- The seven focused display-state/audio-index tests pass, including all 1,274
  main-domain frame queries and matching all 41 source `DefineText` IDs.
- The source stream and display IR generators pass `--check`; the copied IR
  has the exact same SHA-256 as the audit IR. The display IR race test passes.
- The visual asset inventory generator passes `--check`; its disposable-copy
  repeatability, exclusive-write, and drift regression passes.
- The visual layout generator passes `--check` for the audit and product-copy
  outputs; its disposable-copy no-replace/drift regression passes. Ten focused
  display, audio-index, and visual-plan tests pass, including all 1,274 source
  main-frame compositions. The demos TypeScript typecheck passes with an 8 GiB
  Node heap. These plan tests alone do not render pixels or exercise a host.
- Candidate-renderer SSR tests, the physical-source asset-loader tests, and
  local-preview policy tests pass. Browser inspection and production-mode
  denial are recorded above. The web TypeScript typecheck and production build
  pass with an 8 GiB Node heap.
- `NODE_OPTIONS=--max-old-space-size=8192 tsc --noEmit --project
  packages/demos/tsconfig.json` passes. At Node's default roughly 4 GB heap,
  the full demos typecheck command previously exhausted memory during `tsc`.
- The draft migration validator passes **schema structure only**. The
  G6–G8 typography check, rerun with the real source root, still reports 12
  pre-existing new/changed-page evidence issues elsewhere in this dirty
  worktree; P003 is not registered and does not appear in that page list.
- The local visual candidate has browser QA, but no actual My Lesson host flow,
  accepted responsive typography, original-runtime trace, or source glossary
  adapter has been verified for P003. None of the checks above establish them.

## Next bounded implementation boundary

Recover or independently source-validate the L7 glossary behavior, determine
button reachability and host/audio lifecycle in an original-runtime trace,
and turn the visual-only candidate into a source-faithful interactive renderer.
Resolve small-screen text readability and Spanish content from approved source;
then verify deterministic Replay and modern My Lesson EN/ES flows before
registry admission. The current inventory and `keyframes.csv` are draft
evidence, not a complete visual or audio acceptance package.

Current-JS registration: **false**. Original-runtime, fidelity, audio
acceptance, human/Owner review, strict completion, release, and publication:
**all open**.
