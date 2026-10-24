# ALG001 L12 P006 glossary disposition — 2026-09-26

## Result and evidence boundary

The four SWF buttons have a reproducible, hash-bound static disposition in
`migrations/shared-alg001-l12-p006/audit/glossary-disposition-v1.json`.
This is a specification for a minimal modern host adapter, not an implemented
adapter or a claim of original-runtime hit testing, glossary behavior, audio,
translation acceptance, Current-JS registration, fidelity, or publication.

- Placement: `shared-alg001-l12-p006`; source `G6-G8-shared/ALG001/L12/RW/L12RW06.swf`, 708,053 bytes, SHA-256 `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
- Exact lesson index `G6-G8-shared/ALG001/L12/index.xml`, SHA-256 `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`, names `RW/L12RW06.swf` and the keyterm references `HELP_KEYTERMS/KT/XML/L1KTE01.xml` and `L1KTS01.xml`.
- FFDec 26.2.1 extraction receipt SHA-256 `7cee944f6b0096cda883b8176724a6fd0ef2e3fdd5f6882487160c41a8a9f6e6`; `movie.xml` SHA-256 `60c835b77135803e0699aa6580650413ec9591d14f17dbe70d01365cea28a77a`. The builder verifies the physical SWF, lesson index, receipt, all 22 receipt files, and the existing term catalog before parsing XML with `xml.etree.ElementTree`.

## Button and mask semantics

The root has 10 frames; root frame 6 places sprite 53 (`animation`) at depth 1 with parent translation `(5568, 7337)` twips. The main sprite has 342 frames at 12 fps. Each button is absent through frame 248, occupies the first placement on inclusive frames 249–337, and is removed and placed again at the same depth within frame 338. The second placement persists through terminal frame 342. The resulting end-of-frame display-list presence is continuous from 249–342. There are **no button move tags** at these depths. The first and second matrices are identical; their placement `ratio` fields change from 248 to 337.

| Button / exact `KeyAttribute` | Depth | Matrix in sprite twips (`scaleX`, `scaleY`, `translateX`, `translateY`) |
| --- | ---: | --- |
| 48 / `Coordinate` | 21 | `0.6050873`, `0.5614166`, `2420`, `-5027` |
| 49 / `Graph` | 23 | `0.35307312`, `0.5614166`, `4851`, `-5009` |
| 50 / `Equation` | 25 | `0.5608063`, `0.5614166`, `6016`, `-5027` |
| 51 / `Inequality` | 27 | `0.6542053`, `0.5614166`, `8151`, `-5039` |

Each button definition has one hit-test-only record, using shape 47 at button depth 1 with an identity place matrix. Up, over, and down artwork states are false. Shape 47 is a filled rectangle with source bounds `X=-1236..1236`, `Y=-289..289` twips (123.6 × 28.9 source pixels); its four straight-edge records and exact placement matrices are retained in the JSON. The exported `on(release)` AS for each button sets the exact English `KeyAttribute`, calls `_root.DoHyperLinks()`, and then stops `_root.animation_mc.animation`. The builder verifies those scripts against their receipt hashes and the matching term bytes in the XML action records.

A mask at sprite depth 18 clips through depth 29, so it covers all four button depths. Morph character 43 enters on frame 249, receives 48 ratio-only move tags, and is removed on frame 338; shape 52 is placed at the same mask depth and matrix on that frame and remains through frame 342. Its raw lifecycle and both morph bounds are in the JSON. Static retention and the hit rectangle do not prove the active clipped region, occlusion, or successful original-host hit testing on each frame.

## Existing glossary data and adapter references

The lesson index points to the same two XML paths used by `catalog/g678-vb02-l1-family-audit-v1.json` (SHA-256 `e5ff597b123c3097f2784d497b5f9ba1be0a750ffbd36b36e8038ea6bcd36763`). That catalog contains exact-key bilingual entries for `Coordinate`, `Graph`, `Equation`, and `Inequality`, with individual source-entry hashes. Its English keyterm XML hash is `14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b`; Spanish is `3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407`. The JSON copies those entries as **source-backed candidates**, preserving the catalog's literal entity references in the Inequality definition; it does not invent or approve translations. Original-host resolution of the referenced XML and those exact entries remains to be observed.

Read-only adapter examples are `packages/demos/src/alg-l12-p004-glossary-state.ts` (release/request/stop state and an explicitly modern close policy), `packages/demos/src/continuous-audio-glossary-companion.tsx` (frame-bound controls), and the `PageOnlyLessonGlossaryEntry` contract in `apps/web/lib/whole-lesson-player-descriptor.ts`. P004's close/resume policy and its character IDs are not P006 evidence. No host, registry, or manifest file was edited in this pass.

## Minimal adapter disposition and holds

A maintained P006 adapter can bind each control to its character ID, exact key, depth, two frame segments, matrix, and hit shape; on a valid release it should request the indexed glossary entry and stop the main-sprite clock in the exported AS order. It must account for the changing clip mask. The original host's `DoHyperLinks()` lookup, modal opening/closing, transport resume, Replay, and audio-clock handling are unresolved. Before product integration, verify those paths in the authorized original host, inspect clipped hit behavior at representative frames, and review safe XML-entity decoding plus bilingual presentation. No source behavior has been inferred from a different page's adapter.

## Reproduction and narrow checks

From `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`:

```sh
python3 scripts/audit-g678-alg-l12-p006-glossary.py --check
python3 scripts/audit-g678-alg-l12-p006-structure.py --check
node scripts/audit-g678-alg-l12-p006.mjs --check
node skills/flash-to-js/scripts/validate_migration.mjs migrations/shared-alg001-l12-p006 --allow-draft
```

All four passed on 2026-09-26. The draft validator checks portable schema structure only; it does not resolve source paths or prove migration completion. `--write` uses exclusive creation for the generated JSON, and `--check` recomputes and compares it without writing. No broad typecheck or provider action was run.
