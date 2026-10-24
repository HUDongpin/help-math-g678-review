# GEO001 L7 P001 — source-bound Current-JS engineering admission

Updated: 2026-09-25. This is a private, local-only page candidate, not a fidelity, audio, lesson, or publication acceptance record.

## Source and placement

- Active first page of the 63-page, source-ordered GEO001 Lesson 7, Introduction section. Its next placement is `shared-geo001-l07-p002`.
- SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/GEO001/L7/IR/L7IR01.swf`; 18,537 bytes; SHA-256 `9aafb8a470b5e67f4254b671696940c6fd53be258f517dd6b97abfa511e76430`. The physical AWS source root is required; a compatibility symlink is not accepted.
- Lesson XML: `G6-G8-shared/GEO001/L7/index.xml`, SHA-256 `09a64f93291f211b3f3641acf1b91e08bc77ed2e435636eaa5271e26f717fe9b`.
- No same-path FLA was found. The XML title is `Introduction`; the source text reads `Volume and Surface Area: Introduction`. No verified Spanish translation is available.

## Source audit and rendering decision

- CWS SWF version 6; 800×600 stage, 12 fps, 10 root frames. The root calls `_level0.InternalPreloader.jump_check` at frame 1 and places sprite 142 at frame 6. Sprite 142 has 130 frames and two text layers, characters 140 and 141, which animate the introduction title's scale and alpha before holding it.
- Source audit: swfmill 0.3.6 XML at `audit/movie.xml` (SHA-256 `f1b22b10f00957bdb0ab04c61a956af7998961ac0a83c8e2b1d6456725e0ab69`); FFDec 26.2.1 text and script exports under `audit/ffdec-26.2.1/`. Source text extraction for both characters hashes to `abec03391b80173b1dbe65f7d991449d71332033d9dec9042f8a4d3b40e98c26`.
- The source font is Bauhaus Md BT. The maintained renderer presents the exact English text as semantic HTML using the self-hosted Fredoka face. This is an accessibility/maintainability choice, not a pixel-fidelity claim. Defined FUI/progress symbols were not root-placed on the audited branch; the original host's reachability remains unresolved.
- The lesson XML has `RandomAudio="YES"`, but the root-reachable title branch has no embedded sound. Exact host trigger, external asset, language, lifecycle, and listening acceptance are unresolved. Audio is disabled in the local engineering host; `audio-inventory.csv` is intentionally empty of invented cues.

## Reproducible implementation and private host

- `scripts/build-g678-geo-l07-p001-ir.py` pins the source and audit hashes and builds the 130-frame IR at `packages/demos/src/generated/geo001-l07-p001-source-ir-v1.json`. It checks source structure, refuses replacement, and supports a read-only `--check`. Its race/repeatability test is `scripts/build-g678-geo-l07-p001-ir.test.py`.
- The maintained renderer and pure timeline are `packages/demos/src/geo-l07-p001-renderer-v1.tsx` and `geo-l07-p001-timeline-v1.ts`. The module uses one-time playback and frame 129 for reduced motion. Replay restarts this JavaScript renderer; original Flash Replay semantics are unverified. The Spanish route keeps source English and announces the missing translation rather than silently inventing one.
- The freeze packet is `catalog/product-bridge-calibrations/g678-geo-l07-p001-native-current-js-v1.json`, SHA-256 `26fb3c73f6e35171b905da400d3ad26e886199976eb3d9acdb060c0502108c58`. `scripts/activate-g678-geo-l07-p001-native-current-js-v1.mjs` added exactly this page to the private local-only registry; its activation receipt is the same-basename `.activation.json` file. The route `/[locale]/migration-status/g678-calibration/shared-geo001-l07-p001` is source/hash-bound, noindex, local-only, and fails closed in production. Its maintained host-only stylesheet reserves at least 15rem of vertical stage height so 200%-size text and the Spanish source-language notice do not overlap; it does not modify the frozen renderer file. No public registry or release count was changed.

## Verification on this candidate

- IR check and repeatability/race test: passed (2 tests). Timeline tests: passed (2). Private registry generator check: passed. Freeze `--check` and activation `--check`: passed. Demos TypeScript typecheck passed before activation; Web TypeScript typecheck passed after final private registry generation and server-test addition. The source/host server binding tests passed (2 tests), as did scoped Web ESLint.
- Real local My Lesson browser route: EN and ES loaded, with 5/63 GEO L7 private Current-JS pages shown; P001 replay, P001→P002 navigation, and P002→P001 return worked. Playwright console had zero errors or warnings. The Spanish UI explicitly marks the source-English fallback.
- Responsive browser checks at CSS widths 320, 390, 960, and 1920 showed no document horizontal overflow. A 390-pixel Spanish viewport screenshot was visually inspected. At 200% root-font size, an initial 320-pixel check found the title clipped by the 4:3 stage; the host-only minimum-height fix was applied and rechecked at 320/390 pixels. The final 320-pixel Spanish check had no horizontal overflow, title and source-language notice entirely inside the stage, and a 77.75-pixel gap between them; the final stage screenshot was inspected. Under `prefers-reduced-motion: reduce`, the host displayed the legible held title at frame 129.
- The source/host server tests assert the exact registration, source order, count delta, unresolved evidence boundary, source-root mismatch denial, and production-mode denial. A full isolated production build and deployed production-negative test were **not** run for this candidate.

## Independent gates still open

Authoritative original-runtime natural trace, complete original-vs-current full-frame comparison, source-host preloader behavior, original audio asset and listening acceptance, Spanish instructional translation, pixel-fidelity comparison, human visual review, Owner acceptance, strict completion, lesson release, and publication remain unaccepted. `productCalibrationPassed` and `scaleOutAuthorized` are both false. This page does not lift the existing `NO-GO-scale-out` decision for other G6–G8 pages.
