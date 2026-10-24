# P013 maintained Current-JS checkpoint — 2026-09-28

The complete G6–G8 goal remains 2,282 active placements. P013 is the next bounded implementation slice after registered P010; this checkpoint does not replace that full goal.

## Source and implementation

Exact placement `shared-alg001-l06-p013`, ALG001 L6 global 13, Vocabulary page 3; physical SWF `G6-G8-shared/ALG001/L6/VB/L6VB04.swf`, SHA-256 `1be47750557385ef91c648fb87fdcde642d342caadc35da7a1f7a2d1fdb11d35`. SWF-only, CWS v6, 800×600, 12 fps, root 10 frames. The root enters sprite 140 at frame 6; sprite 140 has 372 frames.

The maintained Canvas generator retains the five source morphs, masks, embedded bitmap, formulas, source glyphs and Input/Output buttons. Native text is a reflow companion, not glyph replacement. Formula meaning is F = (9/5) × C + 32 and A = l × w. The ES interface retains source-English instructional text; this does not establish Spanish-content acceptance.

Source button placement and native interaction exposure are distinct. Input is placed at 258 and its hit region fully uncovered at 296; Output is placed at 297 and fully uncovered at 365. Native interaction and completed sentences wait for 296/365. Actual foreground My Lesson browser sampling confirmed no Input button through 295, Input at 296, no Output through 364 and Output at 365. Input paused at frame 300 and Output at 365; closing each kept its cursor paused and restored its respective trigger focus. Exact existing bilingual glossary entries are reused, with distinct source keys and no invented definition.

## Audio boundary

One extracted main MP3 is played by a continuous decoded transport. It contains 368 stream blocks; zero payload frames 3/161/252, absent frames 253–255, and negative raw seeks at 161/252 remain explicitly recorded. Their original-runtime packet synchronization meaning is unresolved; no synthetic silence is inserted and no original audio synchronization claim is made.

Actual Chrome decode measurement verifies 672,192 mono samples at 22,050 Hz for main audio, and 1,124,352 mono samples at 48,000 Hz for the separate SA. Machine decode is not listening acceptance.

SA requires explicit user selection, never locale autoplay or main-track splicing. Real My Lesson observed a main cursor held at 61 during SA and after SA EOF; explicit Return resumed it to 62. Replay canceled a pending SA load, and navigation closed all page-owned audio contexts. English and Spanish entry observations had zero audio starts and zero SA requests.

## Engineering verification so far

- Root independent full Web TypeScript check passed after correcting P013 audio-owner snapshot types to preserve the clock's audio state.
- Root final P013 player/native/clock suite: 31 passed. Source admission semantics: 2 passed. Resource table covers 33 exact physical hashes.
- Candidate descriptor checks: 2 passed. Formal descriptor tests: 5 passed under host/index-v41 before registration.
- Real natural foreground playback observed all 372 frames, with zero Canvas/native mismatch once the renderer was ready. Two initial loading/idle samples had no Canvas/text and are not playback mismatches.
- EN/ES local candidate entries returned 200 with noindex. ES 390px and 320px observations showed no document horizontal overflow. Enlarged-root capture and formal registration/build results will be appended once independently verified.
- Serialized common producer/reader roundtrip passed against exact host/index-v41. P013 proof SHA-256 `8ae7d3971898a6211d1978516041579c777f8005e3799a3c3f77d71fa65e5b6b`. Ten predecessor proofs retain their original bytes.

## Preserved failures and scope

Initial full Web typing failure was corrected. Turbopack rejected the cross-volume dependency symlink; the existing Webpack development path worked. Host-v40 captured a test before its final revision, so host/index-v41 records that single reviewed test-file change without overwriting v40 or any old page proof. Earlier glossary probes selected a hidden course-map dialog; corrected probes use `data-glossary-entry-id`. Two Output mid-play attempts were throttled to roughly one render per second in a background tab and reached terminal before activation; foreground v3 observed the precise 365-frame pause. These failures remain in `output/alg-l06-p013-host-v1/` and `output/playwright/alg-l06-p013-host-v1/`.

Authoritative original runtime, fidelity, listening/audio acceptance, human visual review, Owner acceptance, strict completion, release and publication remain unpassed. No provider operation was performed.

## Actual Current-JS registration and formal host

P013 is now registered once: shared Current-JS **501/2,282**, remaining **1,781**; private registry total 643, ALG001 L6 24/60. Registration preserved all 123 earlier calibration objects, regenerated both canonical local dispatch sources, verified the actual registry transaction, and activated `catalog/g678-admission-v1/index-v42.json` (3,289 bytes, SHA-256 `d574ea397608d86c2e2b3679a7535ccac4881e9cc24c8c52885a92b7093452c3`). The new index contains 11 page proofs; ten predecessors are byte-unchanged.

Formal EN/ES My Lesson routes returned 200, noindex and ready, with zero audio starts/SA requests. Root formal host/resource tests passed 9/9. Actual navigation covered P012, P010, P008, P004, P003, P009 and return to P013; observed resources returned 200 and no page errors occurred. Formal receipt: `output/playwright/alg-l06-p013-host-v1/formal-host-v1.json`; source-bound behavior and responsive observations: `observations-v1.json` in that directory.

The 320px, 32px-root reflow capture passed with no document horizontal overflow. This enlarged layout has substantial word/button wrapping; it is a bounded technical observation, not human typography acceptance. The earlier ES screenshot timeout remains preserved; final enlarged-root evidence is EN (`en-root32-v4.json`), while separate ES 390/320px evidence uses the normal 16px root.

The implementation work unit was finished once as one integrated advanced-manual page with rework, using the fresh real EN/ES formal host receipt. Its measured interval is wall time, not model cost or active human labor. The complete G6–G8 goal remains active.

Developer server/browser cleanup passed and original local QA directory/next-env were restored (`output/alg-l06-p013-host-v1/local-cleanup-v1.json`). A fresh final production build with 533 stable input pins and 3,192 scoped negative cases is in progress; do not infer its result from the previous P010 build.

## Final production result — supersedes the pending probe note

Root independently verified the successful P013 v1 build with v2 scanner/probe: **3,192/3,192** expected404 responses,1,596 each with source root unset/real, no redirects or payload leaks. Each mode scanned907client and1,598server files, zero unqualified forbidden matches. The34exact inherited server hash observations are classified separately against the successful P010 baseline; all new P013 source/hash/bridge and all payload checks remain enforced. All533 scoped inputs were unchanged.

Success receipt: `output/alg-l06-p013-production-v2/success-v2.json`, 1221bytes SHA256 `41403251887e527c33c84c2cb07ba589c5e03f449ed93325236e5251dba9275d`. Individual negative receipts are under `output/alg-l06-p013-production-v2/negative/` (filenames retain v1 because the successful build/schema are v1). Root reread and rehashed each receipt, checked every request and both bundle scans. `restoration-v2.json` confirms original P055 logical build target and unchanged config; root verified3331/3332 free. All source/implementation artifacts remain local and no deployment occurred.

