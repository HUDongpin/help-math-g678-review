# ALG001 L12 Introduction — bounded source audit

Status: source audited; not a registered Current-JS page, not a fidelity or audio acceptance record.

## Binding

- Placement: `shared-alg001-l12-p001`, ALG001 lesson 12, IR page 1.
- Catalog source: `G6-G8-shared/ALG001/L12/IR/L12IR01.swf` under the physical, read-only AWS Grade-Classified Courseware root.
- SWF: 71,457 bytes, SHA-256 `393da0d6755e706bf849a2cff0796823e129fa6bc7f438b93d09c05547679b67`; catalog records SWF-only authoring evidence.
- Catalog lesson title: “Graphing in the Coordinate Plane”; page title: “Introduction”. No catalog audio cue candidate is selected.

## Structural and script findings

- `swfmill 0.3.6` XML and FFDec 26.2.1 exports: CWS v6, 800 × 600, 12 fps, 10 root frames. The root places `sprite-142` at frame 6, depth 1, translation (412.4, 283.3) pixels. That sprite has 130 frames and no direct `DoAction` in its source XML. All 130 FFDec Canvas frame cases draw; the last placed frame is 130.
- The source has one `SoundStreamHead` and 130 `SoundStreamBlock` tags in this sprite. Their presence does not establish language, playback synchronization, or listening acceptance. The no-external-cue catalog entry must not be read as “no audio”.
- FFDec exported 31 ActionScript files. Their path set and bytes match the registered `shared-alg001-l11-p001` source extraction exactly (`diff -qr` clean). That includes shared preloader/media-control code; it does not imply the root-reachable 130-frame sprite executes those scripts.
- FFDec exported 32 text files. Thirty match L11 P001 byte-for-byte; only character text files `140.txt` and `141.txt` differ. They contain this lesson’s “Graphing in the Coordinate Plane” introduction rather than L11’s “Inequalities” introduction. Reusing the L11 drawing bytes would be incorrect.
- The new FFDec Canvas export has 130 cases, canvas size 506 × 24, and internal translation (242.1, 15.05). Its `canvas.js` helper is byte-identical to the L11 P001 helper (52,872 bytes; SHA-256 `78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93`), but its `frames.html` is source-specific (65,035 bytes; SHA-256 `fcf1c289026488b0e7ec921f250ecc3e5081cef6e7fb2de018ccbc8b5c6f9818`).

## Decision and open gates

This supports a **bounded, compiler-assisted source-static intro candidate** using the already maintained source-static host family, with the L12 drawing export and exact title retained. The source-specific Canvas adapter, generated runtime, My Lesson host playback/Replay and responsive checks, exact registry/descriptor binding, and production-negative check have not yet been completed for this page. Do not include it in the 475 registered pages on this audit alone. Original-runtime comparison, embedded-audio listening, human/Owner review, strict completion, release, and publication remain independent open gates.
