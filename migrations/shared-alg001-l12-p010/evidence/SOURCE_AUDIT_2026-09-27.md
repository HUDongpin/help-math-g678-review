# P010 source intake and behavior audit — 2026-09-27

This is a **source-audited draft** for `shared-alg001-l12-p010`, ALG001 L12 active source page 10 of 52, section VB page 4, **Plotting Points**. It creates no renderer or registration. Source extraction is not original-runtime, fidelity, listening or acceptance evidence.

## Exact source and custody

- Physical AWS root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`. Every ancestor is checked as a real directory; symbolic links and hardlinked files are rejected. Reads compare file metadata before and after hashing.
- SWF: `G6-G8-shared/ALG001/L12/VB/L12VB05.swf`, 183,770 bytes, SHA-256 `a846950547f7c3ab7b0445dfc2118d534565ffd352b6e9687ba8211e5d4a3fcd`. `audit/source-input.swf` is byte-identical.
- Paired same-path FLA: absent. No FLA substitute, alias or variant is inferred.
- Physical source XML: 11,927 bytes, SHA-256 `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`; comments are excluded when counting 52 active page references. Neighbor order is P009 `VB04`, P010 `VB05`, P011 `VB06`, P012 `VB07`.
- Catalog navigation Spanish title: `Trazado de puntos`; this is source navigation wording, not a Spanish text/audio acceptance result.
- Original scaffold: seven files copied byte-exact to `output/p010-source-native-20260927-v1/scaffold-before-audit` before any audit edits, with the separate preservation receipt. The three pending checklist/keyframe/coverage files remain untouched.

## Public tool extraction and independent byte parsing

The fresh public toolchain is **JPEXS Free Flash Decompiler 26.2.1**, pinned Java executable, FFDec jar and all jar dependencies. Actual Java-version/help/help-export/help-XML outputs are retained. The optional swfmill result is `available` (error `none`), recorded as a version-only probe with a separately pinned real executable. swfmill was not used for source extraction. XML, AS, hex p-code, text and full tag-dump commands all exited zero with empty stderr. They are stored in `audit/public-extraction-receipt.json`, with 82 raw artifact pins. The extraction receipt checks these bytes before deriving evidence.

Fresh maintained parsers independently recover the CWS v6 header, 228,634 declared uncompressed bytes, 800 × 600 stage, 12 fps, ten root frames, root frame 6 label `begin`, child sprite 96 with 465 observed/declared frames, and a separate root shape 97 at depth 108. The content placement matrix is `[1,0,0,1,8248,5666]` in source twips. Both root placements remain source evidence; shape 97 has no visual classification here.

The source contains one embedded font, **Bauhaus Md BT**, with 41 glyphs; 28 static text definitions / 52 decoded runs / zero unresolved runs or dynamic fields; 58 shapes / zero bitmaps; 138 total placement instances and 895 placement events. The main domain has 136 instances, 893 place events and 24 remove events. All 475 root-plus-main structural frame rows are retained in `timeline.csv`. These counts do not prove visible/native text, correct masks or runtime reachability. The source catalog retains all four parser risk classes, including unclassified shape text, uninterpreted button/runtime actions and unresolved mask semantics.

## Source actions and host requests

The two root action payloads occur at frames 1 and 6. Frame 1 calls `_level0.InternalPreloader.gotoAndPlay("jump_check")`, then stops the root; frame 6 stops the root. AS output and complete hex p-code reconstruct the exact raw payloads. The child has no DoAction/DoInitAction, no terminal Stop and no Replay action. The 38,750 ms nominal child frame span is structural arithmetic only; it is not a measured audio/playback duration. Root frame 6 Stop does not establish child-frame 465 termination. The original host may supply stop/loop behavior outside this page; that behavior is unverified here. Neither a terminal hold nor a wrap back to frame 1 is accepted from the absence of child actions. The modern host must supply an explicit, separately tested terminal/loop and Replay policy, while source fidelity remains a distinct original-runtime question. The excluded legacy shell remains outside migration scope.

All nine button definitions use condition bits 8, exported by FFDec as `on(release)`; each has a single hit-test-only record using shape 21, without up/over/down graphics or a source keyboard condition. Every body sets its exact literal `_global.KeyAttribute`, calls zero-argument `_root.DoHyperLinks()`, then zero-argument `_root.animation_mc.animation.stop()`. The nine complete bodies match after only replacing the third constant-pool literal; this comparison is within P010 and does not admit another page's adapter or clocks.

| Button character | Exact literal | Main depth | First frame | Structural last frame exclusive |
| --- | --- | --- | --- | --- |
| 22 | Point | 4 | 10 | 466 |
| 23 | Geometric figures | 6 | 10 | 466 |
| 24 | Position | 8 | 10 | 466 |
| 24 | Position | 34 | 173 | 466 |
| 27 | length | 14 | 69 | 466 |
| 28 | Width | 16 | 69 | 466 |
| 29 | Height | 18 | 69 | 466 |
| 33 | Coordinate plane/Cartesian Plane | 24 | 113 | 466 |
| 34 | Coordinate | 26 | 113 | 466 |
| 37 | Ordered pair | 32 | 173 | 466 |

There are ten placements because `Position` character 24 appears at depths 8 and 34. These structural lifetimes are not activation windows: four reveal masks can change what is visible or hittable. The future typed adapter must preserve the selected instance, exact literal and paused source frame, review repeated-key behavior, keyboard activation, modal close/resume and Replay, and specify audio pause/cancellation independently.

## Masks and native text/graphics admission

| Mask character | Main depth | First frame | Affected depth range | Placement/update events |
| --- | --- | --- | --- | --- |
| 18 | 1 | 10 | 2–10 | 52 |
| 18 | 11 | 69 | 12–20 | 25 |
| 30 | 21 | 113 | 22–28 | 61 |
| 30 | 29 | 173 | 30–36 | 23 |

All mask histories and matrices are retained in `source-behavior.json`. No mask is converted to a guessed static clipping rectangle. All 58 shapes remain unclassified vectors, including possible outlined text and mathematical marks. No drawing, title, border, source glyph or duplicate layer is suppressed. A source-only rendering review must first inspect the complete root frame6 composite plus main source frames1–465, classify every vector/outlined-text layer, establish the parent matrix and all four evolving mask geometries, and bind native text to all source run and instance IDs. Only then can a maintained native typography candidate apply modern font/reading-order/contrast/responsive choices and suppression rules with explicit evidence. Source text extraction alone does not prove a completed teaching/accessibility pipeline.

The 28 text definitions create **53 main text instances**, with 52 exact source run IDs. The text export is compared record-for-record with the maintained parser, preserving spaces and fragmented runs. Negative signs are separate source character 11 with ten instances. Character 50 `(5,` is placed twice; a definition count alone misses the independent A and D placements. The mathematical labels/prose encode A(5,3), B(-4,2), C(-3,-5), D(5,-3); composition must keep each fragment, sign, geometry and timing tied to its own source instance. Source text32 and text36 contain the unusual sentences shown below; retain the exact source wording, or record a deliberate modern editorial change and its review. Do not silently repair their grammar. English source content remains the Spanish page fallback until separate source-bound Spanish animation evidence is admitted.

| Text character | Runs | Main instances | Exact decoded concatenation |
| --- | --- | --- | --- |
| 4 | 1 | 1 | "0" |
| 6 | 1 | 1 | "X-axis" |
| 9 | 1 | 1 | "Y-axis" |
| 10 | 1 | 4 | "1" |
| 11 | 1 | 10 | "-" |
| 12 | 1 | 4 | "2" |
| 13 | 1 | 4 | "3" |
| 14 | 1 | 4 | "4" |
| 15 | 1 | 4 | "5" |
| 20 | 7 | 1 | "A point is a geometric figure that has a position, but no      " |
| 26 | 4 | 1 | "length, width, or height." |
| 32 | 5 | 1 | "On a coordinate plane, a point is identified by coordinates which an " |
| 36 | 4 | 1 | "ordered pair is showing the position." |
| 38 | 1 | 1 | "A" |
| 50 | 1 | 2 | "(5," |
| 55 | 1 | 1 | "3)" |
| 56 | 3 | 1 | "Point A has coordinates of (5,3)." |
| 57 | 1 | 1 | "B" |
| 64 | 1 | 1 | "(-4," |
| 69 | 1 | 1 | "2)" |
| 70 | 3 | 1 | "Point B has    coordinates of (-4,2)." |
| 71 | 1 | 1 | "C" |
| 75 | 1 | 1 | "(-3," |
| 84 | 1 | 1 | "-5)" |
| 85 | 3 | 1 | "Point C has coordinates of (-3,-5)." |
| 86 | 1 | 1 | "D" |
| 94 | 1 | 1 | "-3)" |
| 95 | 3 | 1 | "Point D has coordinates of (5,-3)." |

## Exact glossary dictionary crosswalk

Both physical MI dictionaries are pinned: `L1KTE01.xml` has 345,838 bytes / SHA-256 `14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b`; `L1KTS01.xml` has 344,456 bytes / SHA-256 `3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407`. Each exact literal has one source entry in each file. The report records eight exact source-tag literals plus the single deliberate case crosswalk below, without broad normalization. Display attribute ScreenkeyTerm separately differs for Geometric figures → Geometric Figures and length → Length; these two display differences remain distinct from source-tag lookup. The earlier triage report already retained the exact Geometric figures literal, and its two ScreenkeyTerm case differences remain valid display findings. Raw tag names, attributes, complete EN/ES labels/definitions, line spans and definition hashes are retained in `source-keyterms.json`. Legacy markup/entities require typed sanitization for product display. No glossary SWF/audio possession or playback is claimed.

| Release literal | Source EN dictionary label | EN-file first line | ES-file first line | Lookup policy |
| --- | --- | --- | --- | --- |
| Point | Point | 479 | 590 | exact-literal |
| Geometric figures | Geometric figures | 242 | 314 | exact-literal |
| Position | Position | 485 | 548 | exact-literal |
| length | Length | 336 | 430 | explicit-case-crosswalk |
| Width | Width | 754 | 16 | exact-literal |
| Height | Height | 260 | 10 | exact-literal |
| Coordinate plane/Cartesian Plane | Coordinate plane/Cartesian Plane | 106 | 534 | exact-literal |
| Coordinate | Coordinate | 104 | 113 | exact-literal |
| Ordered pair | Ordered pair | 429 | 505 | exact-literal |

## P010 embedded stream and separate sidecar

The sole stream head is in sprite 96 frame 1, raw bytes `0a2a2d078906`: MP3, 22,050 Hz, mono, 16-bit source format, nominal 1,837 samples/frame and latency/seek 1,673. The 456 stream blocks occupy every source child frame 10 through 465. Frame 11 contains only the four-byte header, zero declared samples and no MP3 payload. This proves neither audible silence nor a scheduling gap. Every block's offset, digest, sample count and signed seek value is retained.

Concatenating payloads after each four-byte count/seek header yields **189,020 bytes**, SHA-256 `2ab17de87e12c5f83c97ee15f95af50e5a9aa434977bfea970e60c087624482f`, with a structural declared sample-count sum of **837,504**. Neither number is a decoded-duration or synchronization result. First block frame 10 has 3,456 declared samples and seek 1,673; last frame 465 has 2,304 declared samples and seek 471. No decode, playback, trim, retime, synthesis, empty-block silence inference or predecessor end policy was applied.

The separately pinned `SA/L12VB05.mp3` has 215,376 bytes and SHA-256 `685174141928210d8190f02a778f28db993dfb3f8a7576852264e539ed8b4644`. It differs from the embedded stream and is retained as a catalog-associated candidate with unknown original host trigger, language, duration and replay semantics. It was not decoded, listened to or substituted. Future native analysis must derive P010's own clocks and complete-terminal behavior before host scheduling.

## Selected next implementation lane and claim boundary

The source supports a bounded **interactive-understood compiler-assisted hybrid** lane: retained public-tool extraction and source hashes; compact IR/source-native text and graphics; a maintained page-scoped glossary/pause state layer; independently derived P010 audio scheduling; exact Current-JS registration and real modern My Lesson checks after those artifacts exist. Pure linear bulk generation is not authorized by this source audit. The reason is concrete: nine release handlers, ten masked hit placements, one explicit dictionary case alias, four animated masks, fragmented native text and a distinct 465-frame stream require source-specific behavior.

No renderer, route, registry/descriptor modification, candidate freeze, original-runtime baseline or Current-JS proof is created here. The untouched root-only scaffold coverage is visibly pending; a later task must expand it with main frame and named interaction trace requirements. Engineering, original-runtime, Flash fidelity, audio decoding/synchronization/listening, human, Owner, strict completion, release and publication remain separate pending gates.

## Reproducible verification

```sh
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' node migrations/shared-alg001-l12-p010/audit/extract-source.mjs --check
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' node migrations/shared-alg001-l12-p010/audit/build-source-audit.mjs --check
node skills/flash-to-js/scripts/validate_migration.mjs migrations/shared-alg001-l12-p010 --allow-draft
```

The derived check freshly rehashes physical source/XML/sidecar/dictionaries and tool inputs, verifies all public extraction artifacts, re-parses both domains, compares AS/p-code and plain text to source bytes, and requires byte-identical regeneration of all authored inventories, draft files and this report. It also confirms the three untouched scaffold files against their preserved hashes. It never writes or accesses a provider.
