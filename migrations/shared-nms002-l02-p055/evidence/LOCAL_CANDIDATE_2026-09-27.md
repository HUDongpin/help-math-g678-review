# P055 native text and main-audio candidate — 2026-09-27

P055 now has a runnable local implementation. It remains **unregistered and outside the modern My Lesson sequence**. The current registry is 486/2,282; this unit adds zero formal pages. The complete G6–G8 goal remains active.

## Implemented behavior

- The exact 149,059-byte `L2TS02.swf` source (SHA-256 `8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e`) is verified against the real AWS source directory before the local page or its assets can load.
- The maintained visual producer extracts 12 static text definitions and 18 placement instances. Native HTML preserves exact source strings, generation identity, alpha entrances, and short emphasis visibility. Source line breaks remain in IR while the DOM reflows at narrow widths. The four-step map intentionally contains only the step-one instruction authored on this page; steps two through four retain their source numbers.
- Every frame renders through an exact active-text suppression transaction before publishing the native text. Reference Canvas is optional, preserving the outlined chapter heading, step containers/pointer, and unresolved dynamic field. FFDec hit-only button pseudo visuals remain a reference-rendering limitation.
- A single 143,780-byte MP3 is extracted from the source's 347 blocks, including the empty frame-6 block. It decodes to 637,056 mono samples at 22,050 Hz. The maintained `SourceLinearAudioController` supports lazy explicit Play, Pause, seek, Replay, volume, stale-load cancellation, context interruption, close, final visual postroll, and terminal hold. It is a modern continuous-playback proposal; original-host synchronization and listening acceptance remain unverified.
- Entry does not request or play audio. Reduced-motion entry is paused at frame 351. Source vocabulary controls appear at frames 84/145, pause before the request, and report unavailable entries. No L1 glossary content was substituted. No optional SA track is exposed from its inventory-only status.

Local routes while the development server is running on port 3331:

- `/en/migration-status/g678-calibration/shared-nms002-l02-p055`
- `/es/migration-status/g678-calibration/shared-nms002-l02-p055`

The Spanish UI explicitly identifies the retained English source text. Spanish visual-content acceptance is not established.

## Independent verification

The parent agent reviewed the actual new implementation and server resource reader, ran the targeted checks, exercised the page, and inspected all four final screenshots.

| Check | Result |
| --- | --- |
| Native text/control timing tests | 3/3 |
| Linear audio lifecycle tests | 5/5 |
| Physical source/asset and route denial tests | 5/5 |
| Embedded MP3 extraction test | 1/1 |
| Maintained visual producer `--check` | Passed; exact generated artifact roundtrip |
| Real browser product checks | 28 passed |
| Responsive visual inspection | EN/ES, 1280 and 390 CSS pixels; reduced motion; no page overflow |
| Explicit Play, Pause, dictionary denial, Replay and terminal hold | Passed in the real local page |
| Browser MP3 decode | 22,050 Hz, mono, 637,056 samples |
| Deployment asset profile checks | 11/11 |
| Production build and full TypeScript check | Passed; 266 static pages generated |
| Production-mode page/asset negatives | 6/6 returned 404 with local opt-in and real source root still configured |

The evidence index is `output/nms-l02-ts-family-20260927/local-candidate-v1.json`. It pins the implementation, logs, producer/audio receipts and screenshots. Browser evidence is `host/browser-probe.log`; production evidence is `host/production-build-v4.log` and `host/production-negative-v1.json` under that output directory. These are candidate checks, not a formal admission receipt.

## Remaining admission work

1. The L02 lesson XML names missing `L2KTE01.xml` and `L2KTS01.xml`. The identified retained `indexMI.swf` parser reads navigation but has no Keyterms branch, then initializes the L1 glossary bank. Its static precedence is now resolved; historical host association, successful bank load, and intended L02 glossary binding remain unverified. Preserve both findings. Any modern binding decision must be explicit and reviewed against exact source entries; do not silently replace the missing files.
2. The existing NMS L02 descriptor predecessor throws `P052_INPUT_IDENTITY:apps/web/lib/g678-preview-policy.ts`. This is a pre-existing frozen-input mismatch, not a new P055 source failure. Preserve the old proof bytes and failure log. Build a maintained host successor with separately versioned common inputs before adding P055 to the real My Lesson sequence.
3. Complete source-supported dictionary/host integration, then an actual EN/ES My Lesson producer/reader/registration roundtrip. P056 reuse and P057/P058 expansion remain disallowed until the representative product path is calibrated.

No old frozen proof, registry, dispatch file, provider configuration, or source binary was changed in this unit. Original runtime, fidelity, listening, human review, Owner acceptance, strict completion, and publication remain open.

## Build resource recovery and rework

The first build failed with `ENOSPC`. Its log is retained. The generated `.next-alg-p001-production-scan` output was moved to `/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output`, with a local symlink at the original build path. A sibling `node_modules` link preserves dependency resolution outside Next's cleaned output directory. Intermediate relocation/dependency failures and receipts remain retained; the final build passed. Source code and historical evidence were not moved or deleted. The production test server was stopped after verification; the development server remains available. Generated `next-env.d.ts` imports were restored, and the existing `tsconfig.json` hash remained `738d6e2ec305b75ab64d144ab333a0539ca026a30e575ccbd0185365f041cf50`.

Observed work-unit timing is recorded in `work/g678-workflow/events.jsonl`; no historical per-page time or rework duration is inferred. The unit provides an implemented candidate but zero newly integrated pages.
