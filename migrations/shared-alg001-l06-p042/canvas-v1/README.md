# P042 Canvas v1 source drawing

This directory holds the reviewed P042 visibility-v2 Canvas asset for `shared-alg001-l06-p042`. It is an unregistered source drawing. Nothing in the app, registry, or shared host loads it yet.

`canvas-renderer.js` is byte identical to the [output-only visibility-v2 review](/Volumes/WestWorld/HELP%20MATH%202.0-g678-implementation/output/g678-p042-canvas-visibility-v2-20261002/README.md): SHA-256 `8eebb94446a095f5219bc5b3b46f740179d92e8ee6260a6a5cfa2d9d34fae8f4`. `canvas-metadata-v1.json` and `canvas-manifest-v1.json` bind that asset to the physical `TI/L6TI02.swf` SHA-256 `7df2077da472138df83a4485c0e15b7f3b1063aefcdcf2e3ded9232c98f68fcb`, the physical lesson XML, the source actions, and the retained dynamic-text contract.

The generator input `generator-input/source-canvas-draft-v1.txt` is the earlier source-derived FFDec drawing draft. It is deliberately stored as `.txt`: it has the two visual problems preserved by the first smoke, an offset root title and a default-visible NMH popup. **Do not load it as a runtime.** `build-p042-canvas-v1.mjs` verifies its hash, the physical source, the P042 audit, and eight exact ActionScript extracts, then makes the two source-supported transformations and checks that the result equals the reviewed v2 asset hash. It does not hand-edit the generated runtime or depend on ignored output files to rebuild it.

From the implementation worktree:

```sh
node migrations/shared-alg001-l06-p042/canvas-v1/build-p042-canvas-v1.mjs --check
node migrations/shared-alg001-l06-p042/canvas-v1/smoke-p042-canvas-v1.mjs --check
```

The first command recomputes the renderer, metadata, and manifest without changing files. The second runs installed Chrome at 800×600 and compares five canonical frame PNGs and pixel fingerprints with the reviewed output-only smoke. It checks default quiz frame 279, explicit NMH open, wrong4 hold, and right4 feedback, plus browser errors, network requests, and a 600 ms unchanged-frame check. Its results are in `smoke-v1/canonical-chrome-smoke-v1.json`.

The first failed visibility evidence remains in `output/g678-p042-canvas-draw-smoke-20261002-v1/`; it has not been altered. Four source EditText Canvas draw functions are still empty, so wrong4 `txtFeed` requires a measured native companion. Mask, JPEG, morph, original-runtime, AVM1, audio, host, My Lesson, responsive typography, and human/Owner gates remain open. This directory does not establish Current-JS admission or registration.
