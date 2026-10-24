# shared-alg001-l06-p016 Acceptance Checklist

Local Current-JS registration is recorded at 504/2,282 on 2026-09-29. This
checklist remains open: no original-runtime, listening, human, Owner, strict
completion, release or publication decision has been made. The shipped SWF is
preserved under the physical AWS source root; no same-path FLA exists. The
legacy `source-assets/` wording below is a strict-custody target, not a claim
that this external source was copied there.

## Source Preservation

- [ ] Original FLA/SWF files are preserved byte-for-byte under `source-assets/`.
- [ ] SHA-256 hashes and provenance are recorded in `migration.json`.
- [ ] `assetId` equals `swf-<full SHA-256>` and every placement has a stable `animationId`.
- [ ] Alias and variant relationships preserve every original source placement.
- [ ] Missing or unreadable sources are documented.
- [ ] Legacy network endpoints and external dependencies are inventoried without exposing secrets.

## Audit

- [ ] Stage size, background, FPS, frame count, duration, SWF version, and ActionScript version are verified.
- [ ] Symbols, depths, masks, morphs, filters, matrices, and color transforms are audited.
- [ ] Scripts, labels, stops, buttons, Replay, and other interactions are audited.
- [ ] Fonts, glyphs, exact strings, language variants, audio, and video are audited.
- [ ] Tool versions and unavailable forensic capabilities are recorded.
- [ ] Classification, raw/display titles, grade/lesson/section/page, domain, evidence, and confidence are recorded.

## Baseline

- [ ] Every requirement is satisfied by the required `original-runtime-natural-trace`, `original-runtime-direct-seek`, or `original-runtime-frame-step` authority; any Ruffle capture is labeled forensic-only.
- [ ] Every requirement binds its frame domain, trace, entry-state hash, scenario, language, seed, authority, and exact frame range.
- [ ] Frame 1, all transition boundaries, text/count changes, interactions, final frame, and Replay are listed in `keyframes.csv`.
- [ ] Native-size baseline images exist for every required keyframe.
- [ ] Complete original-runtime baseline manifests exist for every strict full-frame requirement.
- [ ] Every baseline, implementation, diff, capture-manifest, metrics, asset, and audio checksum verifies.
- [ ] Emulator differences and evidence conflicts are documented.

## Implementation

- [ ] Renderer choice and rejected alternatives are justified.
- [ ] Native stage coordinates and aspect ratio are preserved.
- [ ] Timeline state is implemented as pure queryable JavaScript.
- [ ] Exact-frame deterministic capture mode is implemented.
- [ ] Scenario, language, and seed capture modes are deterministic.
- [ ] The stage always reports the requested one-indexed frame through `data-flash-frame`.
- [ ] Extracted/redrawn/generated assets are listed in `asset-inventory.csv`.
- [ ] Text, labels, numbers, and formulas stay within their intended objects.
- [ ] Replay resets to frame 1 and reproduces the same timeline.
- [ ] The modern implementation does not depend on the SWF or Ruffle unless explicitly approved.

## Verification

- [ ] Metadata and every required timeline beat have automated tests.
- [ ] Language variants, boundary frames, completion, and Replay have automated tests.
- [ ] Every reachable scenario and every language has complete frame 1-through-terminal coverage.
- [ ] Keyframe spot checks and complete full-frame coverage are reported separately.
- [ ] All tests pass.
- [ ] Production build passes.
- [ ] Implementation images exist for every required keyframe.
- [ ] Diff images and normalized RMSE values exist for every required keyframe.
- [ ] Complete baseline and implementation capture manifests plus per-frame metrics bind every full-frame PNG and SHA-256 pair.
- [ ] Every designated static keyframe and static full-frame metric meets RMSE `<= 0.05` or has an accepted written exception.
- [ ] Every transition keyframe and transition full-frame metric meets RMSE `<= 0.08` or has an accepted written exception.
- [ ] Every diff image and contact-sheet page received human visual review, recorded in an immutable hash-bound human review record.
- [ ] The full-frame capture manifest reports zero console errors, failed requests, HTTP errors, and unexpected network calls.
- [ ] Capture PNG files decode and match the native stage dimensions at device scale 1.
- [ ] Machine audio audit and `audio-inventory.csv` agree with source hashes, languages, durations, cue semantics, and host dependencies.
- [ ] Required audio has named-human authorized-original-runtime listening/traversal/synchronization/Replay acceptance; no-audio cases have source-bound accepted-not-required negative evidence.

## Product Quality

- [ ] Native, desktop, tablet, and mobile layouts have no clipping or overlap.
- [ ] Replay works with mouse, Enter, and Space.
- [ ] Accessible names and focus behavior are verified.
- [ ] Reduced-motion behavior is intentional and verified.
- [ ] English/Spanish or other required localization is verified.
- [ ] Standalone package works offline when one is required.

## Handoff

- [ ] `MIGRATION_BRIEF.md`, `migration.json`, CSV inventories, and evidence paths are complete.
- [ ] Known exceptions and owner decisions are explicit.
- [ ] Engineering review includes reviewer identity and review date.
- [ ] Accepted human visual review points to an immutable `{ path, bytes, sha256 }` record whose reviewer/date/scope are mirrored in `migration.json`.
- [ ] Accepted owner review points to an immutable `{ path, bytes, sha256 }` record that binds the exact human, audio, behavior, product, and exception evidence and mirrors the reviewer, date, and reason.
- [ ] Strict migration validator passes.
- [ ] Final report lists source hashes, route, package, tests, build, keyframes, RMSE, and exceptions.

## Current source-backed exceptions

- `Function` button 10 is a modern accessible candidate from frame 72. Its
  source hit rectangle is only partly exposed by the mask throughout; an
  original Flash click was not observed.
- Main embedded audio has distinct blocks at frames 2–299 and 312–815.
  Original negative-seek interpretation and audible synchronization remain
  unresolved; missing blocks do not prove silence.
- The separate SA source is explicitly selected and has no locale autoplay.
  Browser PCM identity and lifecycle observation do not establish named-human
  original-runtime listening or spoken-language acceptance.
- The ES mobile engineering receipt records successful keyboard Close-button
  dismissal and focus return, plus a failed Escape dismissal attempt. The
  initial homepage proxy error is retained. Post-registration formal-route
  and production isolation results require their own fresh receipts.
- Late source text fragments are retained in Canvas and queryable state, but
  their separate teaching role has not been resolved for native narration.
