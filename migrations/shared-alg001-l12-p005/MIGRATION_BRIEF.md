# ALG001 L12 P005 — source audit and implementation specification

## Current engineering state — 2026-09-27

P005 remains **unregistered**, but it is no longer a source-only specification.
The maintained module and exact local My Lesson probe use the mask-corrected
`candidate-v2` drawing and a separately generated native-title adapter. The native
presentation replaces only visible outlined title character 394 at
`root:135:1:395/sprite-395:2:1:394`; offstage text 393 and all other source graphics
remain intact. The title is an English HTML heading above the native 800×600
illustration. Spanish UI explicitly identifies the untranslated English source.

Implementation entry points are
`packages/demos/src/modules/shared-alg001-l12-p005.tsx`,
`packages/demos/src/alg-l12-p005-typography-renderer.tsx`, and
`apps/web/components/g678-alg-l12-p005-host-lesson.tsx`.
`scripts/build-g678-alg-l12-p005-typography.mjs` reproduces the adapter from the
unchanged original candidate. Source-title identification and the bounded
other-shape/bitmap disposition are in
`evidence/TYPOGRAPHY_SOURCE_INVENTORY_2026-09-27.md`,
`evidence/TYPOGRAPHY_GRAPHICS_DISPOSITION_2026-09-27.md`, and
`evidence/TYPOGRAPHY_IMPLEMENTATION_ROUTE_2026-09-27.md`.
Technical results and their scope are recorded separately in
`evidence/TYPOGRAPHY_HOST_IMPLEMENTATION_2026-09-27.md`; the initial binding/check
pair is produced only from a fresh independent evidence receipt by
`scripts/prepare-g678-alg-l12-p005-typography-binding.mts`.

The host still runs the declared silent 12-fps visual clock: `audioAvailable:false`.
The separate inferred audio controller and muted natural-candidate probe are
recorded in `evidence/NATURAL_AUDIO_CANDIDATE_2026-09-27.md`; they are not activated
by this typography change. Missing-block timing, source seek coordinates, and the
nonzero terminal tail still need a source-supported audio decision. Original Flash
runtime/fidelity, named listening, human/Owner acceptance, formal Current-JS
registration, strict completion, release and publication remain independent and
unaccepted. No private source or calibration route is published.

## Historical source-only specification — 2026-09-26

The following original intake/specification records the earlier boundary. Its
statements that no renderer, export, or host exists have been superseded by the
current engineering update above; its source facts and unresolved acceptance
questions are preserved as dated evidence.

Status at original intake: source-bound specification only. P005 remains unregistered. No Canvas/PNG export, renderer, host integration, original-runtime capture, audio acceptance, human/Owner review, strict completion, or publication is claimed.

## Identity and custody

- `animationId`: `shared-alg001-l12-p005`; `assetId`: `swf-b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`. The G6–G8 shared ALG001 L12 XML occurrence is global ordinal 5, RW section page 4, catalog title `Page 4`. The `p005` suffix follows the global occurrence; it is not the RW page number. The source lesson is *Graphing in the Coordinate Plane*. No alias or variant is cataloged.
- The physical, nonsymlink AWS source is `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW05.swf`, 1,950,595 bytes, SHA-256 `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`. This matches `catalog/g678-shared-catalog.v1.json` and `catalog/g678-page-only-release-manifest.v1.json`. The physical source was read only. No paired FLA is cataloged or present at the matching L12 path, so original authoring layers are unavailable.
- The lesson `index.xml` SHA-256 is `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`; its exact occurrence is `<Page Title="Page 4" RandomAudio="" BGText="">RW/L12RW05.swf</Page>`. `Page 4` is a catalog label, whereas embedded text character 393 is `Graphing in the Coordinate Plane: Real World Activity`. The latter is source text, not proof of Spanish localization.
- FFDec 26.2.1 CLI help was checked before the bounded XML, ActionScript, and plain-text exports. `audit/extraction-receipt.json` binds commands and hashes. The 36,296,747-byte FFDec XML has SHA-256 `944585dd7b3b53e2d65dc268fffcb1f5c81bde71de5f79c5d2c9c158a142f128`. `audit/build-source-structure.py --check` reproduces the structure and 396-row character inventory from that XML. The exported empty main-sprite frame-1 action is retained as evidence, not interpreted as behavior.

## Static structural facts

- CWS v6, AVM1, uncompressed header length 2,262,082 bytes, stage `0..16000 × 0..12000` twips = 800×600 px, 12 fps, RGB background `#b8d8f7`. The root declares 10 frames (0.8333 s at source rate); the main child sprite 391 declares 968 frames (80.6667 s). Root duration alone does not describe page playback.
- Root frame 1 calls `_level0.InternalPreloader.gotoAndPlay("jump_check")` and `stop()`. Root frame 6 has the `begin` label and `stop()`. At frame 6 it places sprite 391, instance `animation`, depth 1, translation `(5568,7337)` twips = `(278.4,366.85)` px; sprite 395, instance `Mc_Page_Title`, depth 135, translation `(8068,-848)` twips = `(403.4,-42.4)` px; and border shape 396 at depth 138 with identity matrix. All three root placements persist structurally through frame 10. The actual legacy host transition from frame 1 to frame 6 remains unobserved.
- Sprite 395 is a one-frame title layer containing text 393 and shape 394. The main sprite has 2,402 `PlaceObject2`, 262 `RemoveObject2`, one `SoundStreamHead`, and 902 `SoundStreamBlock` tags. Its frame-1 action is empty; its frame-968 action stops. The eight defined sprites are all root-reachable through the placement graph: main 391, title 395, and nested 78, 147, 258, 289, 306, 346. `audit/source-structure.json` records exact entry matrices, ratios, depth, parent frame, and static retention ranges. `audit/frame-domain-disposition.json` declares all nine root-reachable timeline domains, including the root.
- Sprite 78 is placed twice, at main frames 266–276 (depth 19) and 283–288 (depth 17). Sprite 147 is placed at 398–464 (depth 55), 258 at 507 only (depth 78), 289 at 508–543 (depth 123), 306 at 546–570 (depth 90), and 346 at 582–659 (depth 80). Their own frame counts are 36, 22, 63, 63, 54, and 20. Those local counts do not establish that every local frame is naturally seen; 258's one-parent-frame placement is the clearest unresolved case. Original loop, restart, and visibility behavior must be observed before implementation parity claims.
- There are 396 character definitions: 340 shapes (38 `DefineShape`, 42 `DefineShape2`, 260 `DefineShape3`), 43 morph shapes, three embedded JPEG-family bitmap tags, eight sprites, one 23-glyph `DefineFont2` (Bauhaus Medium BT), and one text character. The main sprite has clip-depth placements at local frame 1 (character 1, depth 1, clipping through 132) and frame 493 (character 203, depth 2, clipping through 56), 31 color-transform placements, and 204 ratio-bearing placements. Visual output cannot be inferred from counts alone. The text and all source definitions are indexed in `asset-inventory.csv`; its SHA column is the SWF container hash, not a hash for a separately exported asset.

## Actions, audio, and dependencies

- The SWF defines zero buttons, zero button-condition actions, and no clip-action or keyboard handlers in the static tag inventory. The four exported action files correspond only to the root preloader/stop, root `begin` stop, empty main frame-1 action, and main terminal stop. No source-evidenced score branch, user choice, glossary click, direct network URL, or Replay handler is present. This is a static finding, not proof that a legacy host adds no controls.
- The main sprite's MP3 stream head is at local frame 1: mono, 44.1 kHz (source rate code 3 and 3,675 samples per 12-fps frame), latencySeek 1695. Its 902 blocks occupy 23–339 and 384–968. Frames 340–383 have no stream block; that gap does not prove audible silence. Stream payload hash, decoded content, audible timing, stop behavior, and Replay synchronization are pending. `audio-inventory.csv` currently binds this cue to the exact SWF container only.
- The catalog's separate lesson-SA candidate is `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/SA/L12RW05.mp3`, 101,472 bytes, SHA-256 `1cff13a53e883054dd8c319528cc17e6a6ca1589e776cfc427ba60e71f4f5ea1`, MP3 48 kHz mono, 7.248 s by ffprobe. Its host trigger, language, relation to the embedded stream, and Replay behavior are unverified. The root's `InternalPreloader` dependency needs a minimal source-evidenced modern host adapter, not a recreation of the legacy course shell.
- Embedded bitmaps may contain raster text; no Spanish source page content, bilingual audio binding, or reviewed modern typography mapping is established by this audit. No source-based localization claim can be made from the catalog's English fallback title.

## Implementation lane and evidence contract

This page is `behavior-heavy` for implementation routing: a 968-frame main domain, seven nested placements of six animated sprites, 43 morphs, two clipping regions, three bitmaps, and a synchronized MP3 stream exceed the calibrated simple factory. Use a bounded advanced-manual lane with a maintained nested-timeline/audio adapter and source-derived assets. The first implementation slice should prove root-frame-6 composition and one nested placement/stream boundary deterministically, then extend only after that slice is checked. Do not flatten it to one image or hand-edit generated output. Preserve the root/main/title transforms, independent child clocks, exact mask/ratio changes, and event-triggered audio semantics in the maintained IR or adapter. A source-only spec does not authorize bulk generation.

`audit/scenario-inventory.json` identifies default root/title, main natural, and nested-entry scenarios. `evidence/full-frame-coverage.json` declares 20 pending English/Spanish requirements across the nine frame domains, with separate sprite-78 entry states and zero captures. `keyframes.csv` is a reproducible 729-row static frame-event inventory, not screenshots or visible-frame proof. The short placement lifetimes and unobserved host entry mean original-runtime full-domain and natural traces are both pending. Replay, audio listening, Spanish content, composed visual fidelity, keyboard accessibility, human/Owner acceptance, strict validation, and release remain separate blocked gates.

## Bounded next step

Prepare a small, unregistered source-drawing implementation slice for root frame 6, title/border composition, main sprite entry, and one nested child with the first stream-block boundary. Obtain only the source asset exports needed for that slice (bitmap/vector/morph/audio as needed); do not bulk render Canvas or PNG while storage is constrained. The maintained adapter can be implemented and checked for deterministic seek/Replay from static source evidence. Separately obtain an authorized original-host trace for preloader continuation, child clocks, and audio behavior before claiming parity or acceptance. Registry and My Lesson integration remain outside this source/spec task.
