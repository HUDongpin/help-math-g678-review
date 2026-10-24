# shared-alg001-l06-p001 Migration Brief

Created: 2026-09-24

## Objective

Migrate the first active `Understanding Functions` introduction page into the modern G6-G8 My Lesson host. The source-title renderer is now privately registered and visible in the local My Lesson host (19/60 ALG L6 pages registered), with separate original-runtime, audio, review, and release gates still open. The exact source and open gates are in `audit/SOURCE_INTAKE_V1.md`.

## Identity And Classification

- Immutable `assetId`: `swf-9daa5ffe3a1ea275d9467eadafc7addbbb26d14ad1c289e84b3f66f6b0ab9d35`.
- Placement `animationId`: `shared-alg001-l06-p001`.
- Course: G6-G8 shared, ALG001 lesson 6, section IR, active page 1.
- Raw page title: `Introduction`; lesson title: `Understanding Functions`.
- Display title candidate: `Understanding Functions: Introduction`; Spanish teaching text and controlled domain still require review.
- Evidence: source SWF, lesson XML, catalog, and `audit/SOURCE_INTAKE_V1.md`; no alias/variant asserted.

## Source Evidence

- FLA: ``
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IR/L6IR01.swf`
- Source owner/provenance: owner-provided AWS classified tree; real source directory verified.
- SWF SHA-256: `9daa5ffe3a1ea275d9467eadafc7addbbb26d14ad1c289e84b3f66f6b0ab9d35`; lesson XML SHA-256: `9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c`.
- Paired FLA: missing in catalog. No external audio candidate appears in the lesson XML, but an embedded MP3 stream is present in the SWF; that resolves the apparent no-audio inference.

## Runtime Audit

- SWF signature/version: `CWS` 6.
- Stage: 800 x 600; 12 fps; ten root frames plus a 134-frame placed stream sprite. Root duration alone is not the content duration.
- Background: `#b8d8f7`.
- ActionScript: AVM1 / AS1-2 family; root preloader and stop actions. The progress-bar drag/seek handlers exist in library definitions but are not statically root-reachable; host attachment and behavior remain unverified.
- Symbols, masks, morphs, filters, blend modes:
- Embedded fonts and exact strings:
- Audio: embedded 134-block MP3 stream, structurally decoded through EOF. Frozen private `assets/source-stream-142.mp3` SHA-256 `b214a1d96c7dadcf509fe1702e3f11694d50c1cfd584978d13ef30d39139633a`; `audio-inventory.csv` records only a source-static `und` candidate at sprite frame 1. Exact natural-host timing, language, listening, and sync remain pending.
- FlashVars, URLs, external assets, and legacy APIs:
- Stops, labels, buttons, Replay, and user interactions:
- Audit tools: FFDec 26.2.1, swfmill 0.3.6, ffprobe/ffmpeg; parser `scripts/extract-ti-soundstreams.mjs`.
- Source identity/stream structure: high confidence. Natural host behavior, visual timing, and audio acceptance: unresolved.

## Baseline

- Authoritative original runtime, version, host, and toolchain receipt:
- Requirement-level authority (`natural-trace`, `direct-seek`, or `frame-step`):
- Separate Ruffle forensic-reference route, version, and renderer:
- Native viewport and device scale factor:
- Capture method, named operator, and containment/capacity preflight:
- Required keyframes and why they matter:
- Complete coverage-v2 frame domains, requirements, traces, and entry-state hashes:
- Known emulator differences:

## Rendering Decision

A bounded React/SVG source-title visual candidate has a guarded local-only diagnostic route. A separate opt-in browser audio probe fetches the exact embedded MP3, decodes it with Web Audio, advances the title from the audio clock at a provisional 12 fps, and provides Pause/Resume/Replay. That probe is not the registered My Lesson renderer or an authoritative original-host timing decision. The root-reachable source scene is a two-layer, 134-frame title zoom/fade with embedded stream audio, not a chart or a visible scrub UI. The already calibrated silent pure-linear family excludes this intro/audio case.

The immutable versioned `g678-alg-l06-p001-source-title-candidate-v1` freeze was created with an unregistered state; its original fields remain historical evidence. A separate private Current-JS registry entry now binds the maintained silent `AnimationModule`, both source glyphs, source timeline, source MP3, exact SWF/XML, and tests. The module models the ten root frames and nested 134-frame `sprite-142` domain; it rejects wrong host context and `audioEnabled`. Its glyphs are fetched only from a guarded local route, checked by browser SHA-256, and converted to data URLs before nested SVG rendering. A direct external SVG URL returned 200 and decoded but rendered blank in the nested SVG image during Chromium inspection, so it is not an accepted implementation path. The local My Lesson host renders this page; private registration does not claim fidelity or publication.

## Timeline Specification

The source-locked `audit/title-timeline-v1.json` records the root frame-6 placement and every one-indexed frame of nested `sprite-142`. Two title text layers (source characters 140/141) start at scale 0.5 and alpha 0, zoom/fade to scale 1 and alpha 256 by frame 133, then retain that visual state at frame 134. Each nested frame has a separate source MP3 block. This is a static authored event schedule, not an observed host trace or a renderer capture. `keyframes.csv` remains empty pending authoritative baseline and implementation images.

List every reachable scenario/branch, its deterministic seed, source-evidenced trace, and terminal/Replay state. Every explicit requirement must receive full one-indexed frame coverage; do not infer requirements from a global Cartesian product.

## Asset Strategy

The embedded MP3 stream and swfmill XML are frozen in this private workspace. The generated TypeScript tuples are derived from the source-locked title IR, not hand-edited. FFDec 26.2.1 exported source-glyph SVGs for text characters 140/141 into `assets/title-svg/`: SHA-256 `baf7a50b1bd9ac810f5bc60659dff72186c5d574722acb2ccc02fe2ceb589ada` and `9a6b736402da2164a2ce59b4592c9db06a0473c777622c612375777888da4e1c`. These remain private and are not publicly served. The maintained SVG candidate positions those two images by the source twip matrices; natural host display and original-runtime fidelity are still unverified.

## Implementation Map

- Next.js route: `apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p001/page.tsx` (loopback-only diagnostic; `?frame=1..134` static capture, `?play=1` opt-in audio probe, or `?host=1`/`?host=1&mode=focus` private My Lesson host; production denied).
- Browser probe: `apps/web/components/g678-alg-l06-p001-local-playback.tsx` (source-audio-driven candidate clock, pause/resume/replay, no acceptance claim).
- Audio route: `apps/web/app/flash-assets/g678-local/shared-alg001-l06-p001/source-stream.mp3/route.ts` (separate opt-in, exact source/MP3 hash, loopback same-origin request, default-deny and production-deny).
- React component: `packages/demos/src/alg-l06-p001-title-view.tsx` (unregistered source-static visual candidate; receives pinned SVG data URLs only after the guarded server reader checks the exact source and two glyph hashes).
- Local asset reader: `apps/web/lib/g678-alg-l06-p001-local-assets.server.ts` (source-bound, production-denying).
- Local glyph route: `apps/web/app/flash-assets/g678-local/shared-alg001-l06-p001/title-glyph/[id]/route.ts` (exact source/glyph hashes, loopback and same-origin, default production 404).
- Maintained module: `packages/demos/src/modules/g678-alg-l06-source-title-p001.tsx` (134-frame nested domain, silent, privately registered, local My Lesson integration only).
- Admission binding: `apps/web/lib/g678-alg-l06-p001.server.ts` rehashes the frozen candidate and extends only source-ordered page 1 after the existing P002 descriptor and exact local registry metadata pass. The generic lesson listing selects this successor after P002. Two exact-byte shared-host successor manifests preserve the previous P047 proxy and typography witnesses while accepting only the reviewed DAT P002 proxy guards and mobile-header CSS gap; the shared calibration snapshot is now ready.
- Immutable candidate freeze: `catalog/product-bridge-calibrations/g678-alg-l06-p001-source-title-candidate-v1.json` and `work/g678-shared-page-factory/g678-alg-l06-p001-source-title-candidate-v1/` (exclusive-create; any pinned input change needs a successor version).
- Pure timeline module: `packages/demos/src/alg-l06-p001-title-state.ts` (source-static visual state only; no host clock).
- Unit test files: `packages/demos/tests/alg-l06-p001-title-state.test.ts` (all 134 frames, invalid frames) and `packages/demos/tests/alg-l06-p001-title-view.test.tsx` (source layers, transforms, EN/ES accessible labels, asset-path rejection).
- Ruffle reference route:
- Standalone package:
- Deterministic `?frameDomain=`, `?requirementId=`, `?trace=`, `?entryStateSha256=`, `?frame=`, `?scenario=`, `?lang=`, and `?seed=` capture modes:
- Mandatory matching `data-flash-*` identity attributes:

## Verification Evidence

- Unit tests: 5 focused state/view tests and 2 route/boundary tests passed on 2026-09-25; focused TypeScript checks passed.
- Production build: isolated local production scan passed with an 8GB Node heap on 2026-09-25 after the audio-probe change and again after the glyph-route/320px change. The latter passed 11/11 deployment-asset tests, Next TypeScript, and 234/234 generated pages. P001 page/audio/glyph server traces have no source MP3, title-glyph SVG, title-view source file, or maintained P001 module path; EN/ES diagnostic routes, glyph IDs 140/141, and the audio URL returned 404, while `/` returned 200. This is not a deployment or publication gate.
- Historical admission-preparation check (superseded by the current check below): the exact frozen packet and source-ordered descriptor extension passed 3/3 focused tests; the maintained-DOM registry path rule passed 4/4 focused tests; web TypeScript passed. At that time the shared predecessor was invalid, so local EN/ES `?host=1` returned 404. This dated result does not describe the current local host state.
- Current private admission check, 2026-09-25: the two exact-byte shared-host successors restored the predecessor snapshot to `ready`; 17 focused host/query/access tests, 4 P001 route tests, 4 descriptor tests (including the generic listing), registry generation check, and web TypeScript passed. The live local My Lesson host displayed the source title in English and Spanish, Replay restarted the renderer, the EN-to-ES language link returned to the same registered page, and a 320px ES browser viewport had no document-level horizontal overflow. The generic ALG L6 descriptor reported 19/60 registered, and the full G6-G8 private registry had 475 distinct keys among 2,282 active placements (20.82%).
- Current production-negative check, 2026-09-25: an isolated optimized build passed 11/11 deployment-asset tests, TypeScript, and 234/234 static pages. Its running loopback production server returned 404 for EN/ES `?host=1`, direct `?frame=133`, P001 glyph, and P001 audio paths while `/` returned 200; P001 page/audio/glyph trace manifests referenced none of the P001 source asset/module paths. No provider deployment or publication occurred.
- Native-size keyframe captures: local candidate screenshots for frames 66 and 133 are recorded in `work/G678-ALG-L06-P001-LOCAL-PREVIEW-2026-09-25.md`; no authoritative original-runtime pair exists.
- Complete authoritative original-runtime and current-JS capture manifests:
- Full-frame coverage manifest, comparisons, and archive:
- Per-frame metrics files and checksums:
- RMSE and diff-image results:
- Replay and keyboard checks: local EN pause at frame 104, resumed to 134; ES ended-to-Play restarted and continued. Keyboard interaction beyond native button semantics remains unverified.
- Desktop/mobile overflow checks: the local P001 page has a route-scoped `body` min-width correction. Real Chromium at 320px ES measured document scroll width = client width = 305px; the subsequently integrated My Lesson host showed its 289px title stage within that viewport. This resolves this specific local horizontal-overflow defect, not broader device or 200% zoom acceptance.
- Console and network checks:
- Human reviewer and review date for all keyframe/full-frame diffs:
- Audio listening-acceptance record, or source-bound not-required evidence:
- Immutable human and owner record descriptors:

## Exceptions And Decisions

No paired FLA. Original host entry and runtime captures are missing. The local Web Audio probe confirms transport and browser progression only. Stream language, source-authoritative cue timing, listening acceptance, Spanish teaching-text treatment, 200% zoom, and authoritative fidelity remain open. The current source-first page is privately Current-JS registered and browser-visible in My Lesson, but this does not make the 60-page lesson complete or release-ready. Browser navigation to the adjacent, previously registered ALG L6 P002 page exposed `decoded-buffer-identity-mismatch` in its audio clock, so that separate page's current browser audio/product path requires repair and revalidation; it is not silently counted as P001 acceptance. The restored shared predecessor is an exact-byte local engineering gate, not original-runtime or Owner acceptance. No strict-completion, release, or publication claim is made.

## Completion

- Engineering reviewer:
- Review date:
- Owner review status:
- Owner accepted decision, reviewer/date/reason, and immutable record descriptor:
- Strict validator result:
- Completion-ledger binding:
- Atomic lesson-release status:
