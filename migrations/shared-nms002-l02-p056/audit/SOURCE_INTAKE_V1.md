# P056 source intake — 2026-09-24

This is a source-bound engineering audit, not a renderer or acceptance record. The canonical placement is `shared-nms002-l02-p056`, NMS002 lesson 2, TS page 2, XML occurrence 56. The lesson catalog names the page `4 - Step Plan` (`4 Step Plan` / `Plan de 4 Pasos`); the SWF's teaching text is specifically about organizing information. Do not substitute P055 or the L1 TS02 factory output because the display title repeats.

## Preserved identity and structure

- Real source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`; source view path `G6-G8-shared/NMS002/L2/TS/L2TS03.swf`. It is 100,959 bytes, SHA-256 `a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be`, matching `catalog/g678-shared-catalog.v1.json` and the page-only release manifest. No same-path FLA was found. The catalog records a canonical placement without an alias or variant.
- `swfmill 0.3.6` reports CWS version 6, 800 × 600, 12 fps, 10 root frames, background `#b8d8f7`. The root calls `_level0.InternalPreloader.gotoAndPlay("jump_check")` on frame 1, labels frame 6 `begin`, and stops there. These are host-entry facts, not proof of the natural host trace.
- The root places sprite 24 named `animation` at depth 2. That sprite has **234** frames (nominal 19.5 s at 12 fps), a `SoundStreamHead`, and 230 `SoundStreamBlock` tags. Thus the 10-frame root coverage created by the scaffold does **not** represent complete teaching-timeline coverage. `migration.json` now declares a separate `sprite-24` nested domain and EN/ES full-domain requirements, all pending; natural host traces and glossary branches are still unresolved.
- The source defines 2 buttons, 12 static text objects plus 1 edit text object, 2 fonts (`Bauhaus Md BT`, `Arial`), and no SWF morph-shape, bitmap, video, or `DefineSound` tags in the structural scan. The absence of those tag types is not an original-runtime visual finding.

## Source behavior and teaching text

`FFDec 26.2.1` exported all four AVM1 action blocks and 13 text records to `audit/ffdec-26.2.1/`. Both `on(release)` buttons are first placed at **sprite-24 frame 9**, not frame 1. An independent `swfmill` ShowFrame count confirms `catalog/g678-ts03-family-audit-v1.json`'s source-bound first-frame finding. The further source-static audits in `BUTTON_REVEAL_SOURCE_V1.md` and `DISPLAY_LIST_SOURCE_V1.md` cover the button fade and all 234 direct sprite frames; placement does not establish visible hit testing:

| Character | Source text/term | Exact button effect |
| --- | --- | --- |
| 16 | `Organize` | `_global.KeyAttribute = "Organize"`; `_root.DoHyperLinks()`; `_root.animation_mc.animation.stop()` |
| 17 | `information` | `_global.KeyAttribute = "Information"`; `_root.DoHyperLinks()`; `_root.animation_mc.animation.stop()` |

Other extracted text includes `2 Organize the information.`, `What information do I have?`, and `What information do I need?`. The case difference between the visible `information` and the requested `Information` is source evidence; do not normalize away the lookup key. `DoHyperLinks` and the preloader are host-owned APIs. Their content, dismissal/resume behavior, and EN/ES lookup have not been observed in an authorized original host. The exact lesson-2 `L2KTE01.xml`/`L2KTS01.xml` pair was not present in the examined real NMS002/L2 source tree; do not fabricate definitions or infer the lesson-1 glossary applies.

## Audio boundary

The sprite contains an embedded MP3-coded stream. `audit/AUDIO_SOURCE_COMPARISON_V1.md` now binds its 230 blocks to teaching frames 5–234 and records 422,208 decoded samples (19.148 s). The indexed lesson-SA `G6-G8-shared/NMS002/L2/SA/L2TS03.mp3` exists at 171,024 bytes, SHA-256 `33b5c3c7e630cac092c25718e17a322c90a4a76f3aa31aa1167026847b14eb0a`; `ffprobe` reports 12.216 s at 112 kb/s. The complete decoded SA does not align at a fixed offset with the embedded stream's RMS envelope (maximum correlation about 0.20), so it is not an established substitute. This does not establish speech-content disjointness, spoken language, natural host start, synchronization, or Replay. `audio.required` stays true; `audio-inventory.csv` records only an `und` source-structural embedded cue, not an accepted EN/ES product track. Do not split encoded MP3 at silence; original-runtime listening remains open.

## Routing and stop rule

This page is `behavior-heavy` for routing: a deterministic visual timeline might be generated from source-locked IR, but the two host glossary requests, resume behavior, and audio clock are not yet understood. The existing TS03 family audit marks this exact source `generationAuthorized: false`; the L1 product calibration does not cover this L2 placement. The bounded advanced-manual behavior module records only directly evidenced source actions, without claiming a runnable renderer. Before any registration: recover/verify the exact bilingual term source or original-host response, map sprite-24 visual frames, establish actual audio binding, implement and test Replay/pause/resume, then validate exact EN/ES My Lesson host flows. `NO-GO-scale-out` still applies. No Current-JS registration, original-runtime fidelity, audio acceptance, human/Owner review, strict completion, release, or publication is claimed here.
