# P012 native teaching-text data — 2026-09-27

This is the reproducible source-data input for a maintained native text renderer. It is not a visual, language, audio or product acceptance record. The physical page source is the real AWS-root file `G6-G8-shared/ALG001/L12/VB/L12VB07.swf` (81,069 bytes, SHA-256 `b322949a960acef3fee6018a65785b29cd3693717ca3ba33d0d930d7866320aa`). No paired FLA is present. The source is an 800 × 600, 12 fps SWF with ten root frames; the main animation is a separately placed 119-frame sprite.

`scripts/build-g678-alg-l12-p012-text-data.mjs` re-reads and hashes that physical SWF, re-parses it with the maintained text catalog parser, and compares the whole parsed result against the frozen triage catalog. It also pins `source-text-catalog.json` SHA-256 `5248516cb310f7422d293903dbad5a7eef098bddf52bdbe305e167c59b50bcad`, `source-structure.json` SHA-256 `bcbcf2b389f5c937ff4d021704a4105cb4436f4c11211b9cd6208b8f6dfab13a`, and the extracted frame-119 AS/p-code, popup AS and coach AS hashes. The generated module is `packages/demos/src/generated/alg-l12-p012-text-data.ts`, exporting `P012_TEXT_DATA`; its current SHA-256 is `2298d94d293f34888064cf683ccd002c9a2a81ae80467c3b66914c20e51264fa`.

The data contains all 37 source text definitions: 36 static definitions with 38 decoded runs and one read-only dynamic field. It retains exact literal runs, `sourceTextId`, source-tag hashes, font and glyph advances, run offsets/baselines, colors, bounds and definition matrices. It records 57 timeline text placement generations and one separate button-state text placement, producing 60 unique run/instance pairs. Each timeline placement carries its frame interval, every source placement event and contiguous local-twip transform segments. Root and nested parent placements are separate: combining them is the renderer's responsibility. These structural intervals do not establish actual visual exposure through masks, clip visibility or ActionScript.

The intro instruction is source character 51's **three** runs, followed by character 55, `Next to continue.`; the trailing space in `Then click ` remains intact. All eight source control labels at characters 37–44 are retained, including `left1` and `left3` without inserted spaces. The popup instruction is character 73, `Keep the spider on the ceiling. Try again.`; its `Close` label is character 66 in button 71's up/over/down states, not a normal sprite placement. Character 75 contains `Coach_audio_1`; the coach's S1/S2/S3/S4 are source frame labels at frames 3/18/31/40, not additional displayed prose. The page's Spanish navigation title supplies no Spanish animation text.

The coordinate field is source character 34, with initial text `(0,0)`. It is direct `txtOP` in sprite 86 at frames 1–118, then `mcOP.txtOP` via sprite 61 at main frame 119. The source frame-119 action formats `"(" + _global.x + "," + _global.y + ")"` and moves the parent bubble to spider y minus 29 source pixels. `dynamicCoordinate` names both field instances, the parent placement, target expression and action hashes. Runtime coordinate values belong to the interaction state machine; static extraction alone cannot claim they were executed. Popup frame 1 assigns `txtFeed.text = _global.WrongFeed`, but this page has no `txtFeed` placement and no local `WrongFeed` assignment; the generated data does not invent either value.

Thirty source vector definitions and one bitmap definition remain visually unclassified. Shapes may contain outlined text or mathematics, and masks can change actual exposure. This data does not suppress outlines or label the bitmap as text or spider art. Original-runtime, source audio and listening, responsive typography, human/Owner review, strict completion and publication remain independent pending gates.

Reproduce and verify with:

```sh
node scripts/build-g678-alg-l12-p012-text-data.mjs --check
node --test scripts/build-g678-alg-l12-p012-text-data.test.mjs
```

The 2026-09-27 check returned `P012_TEXT_DATA_VERIFIED` with 37 definitions, 38 static runs, 57 timeline instances and 60 run/instance pairs. The three focused tests passed, including source drift rejection and the direct-to-nested coordinate transition. The generated file was created through `--write`; it is not hand-edited.
