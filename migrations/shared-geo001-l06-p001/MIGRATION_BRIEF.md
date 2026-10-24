# GEO001 Lesson 6 introduction — source-bound engineering candidate

Date: 2026-09-24. Placement `shared-geo001-l06-p001` is the first active page
of the 54-page shared GEO001 Lesson 6 (“Circles”). It is not a grade-specific
publication, a completed migration, or a source-authorized Spanish translation.

## Identity and source

- `animationId`: `shared-geo001-l06-p001`; asset ID:
  `swf-8997176bb8c1f3e68a8011ee98f132ece217c881b2407b90b42ea4067de49c58`.
- Owner-provided physical SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/GEO001/L6/IR/L6IR01.swf`.
  It is a real, non-symlink file; SHA-256
  `8997176bb8c1f3e68a8011ee98f132ece217c881b2407b90b42ea4067de49c58`.
- No same-path FLA was found. Preserve the SWF; do not infer an authoring
  timeline or promote the source by copying it into the product.
- Catalog placement, lesson and order:
  `catalog/g678-page-only-release-manifest.v1.json`.

## Shipped-SWF structural audit

- CWS v6, ActionScript 1/2, 800 × 600, 12 fps, root 10 frames, background
  `#b8d8f7`. Root frame 1 calls
  `_level0.InternalPreloader.gotoAndPlay("jump_check")` then `stop()`; frame 6
  again stops and places `sprite-142` at depth 1, translation (8248,5666)
  twips. The modern host must explicitly admit the page; the original host's
  preloader behavior has not been executed or accepted.
- The root-reachable visual child `sprite-142` has 130 frames. It places only
  text characters 140 (white) and 141 (dark blue), both embedded-font 118
  (`Bauhaus Md BT`) and both “Circles: Introduction”. 129 successive pairs of
  placements scale from 0.5 to 1 and alpha from 0 to 256/256; frame 130 holds
  frame 129. No child action, button, embedded sound or other display symbol
  appears on this root-reachable branch. There are other defined FUI/progress
  sprites and button scripts; their original-host reachability remains open.
- FFDec 26.2.1 text/script exports and swfmill 0.3.6 XML are retained in
  `audit/`. The XML SHA-256 is
  `c08e2bb68aec6d90fcd89d6217d7fc87bd1fbb7ecd07411faf0f5badee8c694c`;
  each title text export hashes to
  `8f22aa91bb9c19b7f2577cbbd74c0fe3e4e6ecb0fe47497ddd0a6607803de4fc`.
- The catalog says `RandomAudio: Yes`, while this SWF contains no root-reachable
  sound. The host audio asset, trigger, language, lifecycle and requirement
  decision have not been established. The candidate intentionally does not
  play or advertise audio. This is not a negative audio acceptance record.

## Implementation and renderer decision

`scripts/build-g678-geo-l06-p001-ir.py` checks all three pinned source inputs,
the root/child graph and every placement before exclusively creating
`packages/demos/src/generated/geo001-l06-p001-source-ir-v1.json`. `--check`
rebuilds and byte-compares the 130-frame output. The generated IR is never
hand-edited. `packages/demos/src/geo-l06-p001-timeline-v1.ts` is a pure,
one-indexed frame state; the 10-frame root and 130-frame child stay distinct.
`packages/demos/src/geo-l06-p001-renderer-v1.tsx` presents the source title
through native semantic text and the self-hosted Fredoka font in a responsive
4:3 stage. This modernizes teaching typography rather than claiming original
glyph-pixel fidelity. The original font, two-layer appearance and matrices
remain source evidence. Canvas/Pixi and video would add unnecessary complexity
or flatten semantic text, so they were rejected. No unplaced Flash control is
presented as working. Replay resets to source child frame 1; modern host once
playback holds the final title. That hold is not an original-host trace.

The English title remains English on the Spanish UI, explicitly marked as a
source fallback. No Spanish translation has been authorized. Font and viewport
changes must not reset the teaching clock. The page is privately registered
and available in the local, noindex My Lesson calibration route only. This
is local Current-JS engineering admission, not downstream acceptance.

## Evidence and open gates

- Source IR `--check` and its exclusive-write/race tests pass. The 130-frame
  pure-state and Replay tests pass. Draft schema validation passes only its
  portable check; it does not resolve source paths or grant acceptance.
- The private registry check and source-ordered GEO001 L6 descriptor test pass.
  In an existing local Next development server, EN/ES My Lesson rendered the
  first page as 8/54, Replay restarted its renderer, and navigation to page 2
  showed an explicit unavailable placeholder. A 390 px Spanish viewport showed
  the title without horizontal clipping; the browser reported no console
  errors. This is not a full responsive, keyboard, 200% zoom or visual review.
- The exact new-page typography binding/check record is absent, so the G6–G8
  typography checker correctly fails. The full web TypeScript run exhausted
  Node's default 4 GB heap; a clean web build remains unverified.
- The inherited `evidence/full-frame-coverage.json` is still a scaffold root
  placeholder, **not** a completed child-domain coverage plan or capture.
- No authorized original-runtime session, complete original/current frames,
  RMSE, audio listening, human visual or Owner decision, strict ledger,
  release or publication exists for this page. They remain independent gates.
- WestWorld has constrained free capacity. Do not start large captures without
  a fresh capacity preflight and the required original-runtime authorization.
