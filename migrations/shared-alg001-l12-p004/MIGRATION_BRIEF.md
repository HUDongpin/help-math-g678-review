# ALG001 L12 P004 — source-bound migration specification

Status: source specification ready for a bounded Current-JS candidate. The page is unregistered and all original-runtime, audio, bilingual, human, Owner, strict-completion, and publication gates remain pending.

## Placement and custody

- `animationId`: `shared-alg001-l12-p004`; `assetId`: `swf-4d7aa78bd955aa52d476f31548c97135da989daf9d106986ff06a954c6d8b334`. G6–G8 shared ALG001 Lesson 12 global ordinal 4, RW section page 3; the course XML and catalog title are only `Page 3`. The specific mathematical title and Spanish translation are unverified. The visible glossary terms support an algebra/functions domain classification, not a reviewed knowledge-point translation.
- Physical shipped SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW04.swf`, 363,811 bytes, SHA-256 `4d7aa78bd955aa52d476f31548c97135da989daf9d106986ff06a954c6d8b334`. The real AWS directory was used; the preserved file was not edited. Catalog `g678-shared-catalog.v1.json` and release manifest bind this active placement. Lesson `index.xml` SHA-256 is `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`; its exact RW entry is `<Page Title="Page 3" RandomAudio="" BGText="">RW/L12RW04.swf</Page>`.
- Catalog `flaPath` is null and no paired `L12RW04.fla` exists in the physical ALG001 L12 tree. Authoring layers are unavailable. No alias/variant relationship is cataloged. Do not infer an FLA or reuse another module's same-named file.
- `audit/movie.xml` was extracted with swfmill 0.3.6, SHA-256 `7d6a9145ad1aa3df704e440cce62301845971eb044e225db7017a451f73d4f19`. `audit/source-scripts/` contains FFDec 26.2.1 ActionScript-only exports (`packJavaScripts=false`); no duplicate sprite export was made. `audit/build-source-structure.py --check` reproduces `audit/source-structure.json` and the 93-character `asset-inventory.csv` from the hash-bound XML. The separate main-owned Canvas export and its receipt are implementation inputs, not original-runtime evidence.

## Structural runtime contract

- CWS v6, AVM1, 800×600 px (`0..16000 × 0..12000` twips), 12 fps, background `#b8d8f7`. Root has 10 frames (declared duration 0.8333 s); its frame 1 calls `_level0.InternalPreloader.gotoAndPlay("jump_check")` then `stop()`. Frame 6 is labeled `begin` and also calls `stop()`. The actual host preloader transition into frame 6 requires original-host verification; root frames 7–10 are direct-seek structural states, not a natural playback claim.
- Root frame 6 places main sprite 90 (`animation`) at depth 1 with translation `(4189,5670)` twips = `(209.45,283.5)` px; title sprite 92 (`Mc_Page_Title`) at depth 171 with `(8000,869)` twips = `(400,43.45)` px; and border shape 93 at depth 173 with identity transform. No root removal replaces these before root frame 10. Sprite 92 has one frame and places shape 91 at its local depth 1. The main-owned Canvas extraction reports sprite 90's own translation `(122.8,185.05)` px and sprite 92's `(282.6,12.2)` px in exported bounds; root composition must retain both root transforms and Canvas-internal offsets. Export pixel dimensions are 618×367 for main and 565×24 for title.
- Main sprite 90 has 969 frames (80.75 s declared at 12 fps) and stops at frame 969. It has 945 `PlaceObject2`, 13 `RemoveObject2`, 881 `SoundStreamBlock`, and one `SoundStreamHead` tag. Its display-list state is not recoverable by replacing it with a one-frame image. The source has 93 definitions: 56 `DefineText`, 17 `DefineShape`, 3 `DefineShape2`, 3 `DefineShape3`, 5 `DefineMorphShape` (characters 73/82/84/86/88), 5 `DefineButton2`, 2 `DefineFont2`, and 2 sprites. No embedded image tag is present. Fonts are embedded Bauhaus Md BT bold character 2 and regular character 60; glyph outlines do not establish reviewed high-resolution typography or Spanish content. No mask/filter/blend tag or explicit legacy network URL was found in this static extraction.

## Glossary source contract

Every button is hit-test-only in its button record and handles `on(release)`. The release script sets `_global.KeyAttribute` to the exact term, invokes `_root.DoHyperLinks()`, then calls `_root.animation_mc.animation.stop()`. The five source character/depth/range bindings below are independent of the VB vocabulary adapter's calibration IDs. `lastFrame=969` means the character is retained at that depth through the terminal frame; the source has no removal/replacement at these five depths. It does not prove unobscured visibility or successful original-host hit testing at every retained frame.

| Term | Button character | Main-sprite depth | First frame | Last retained frame | First-place matrix, sprite-local twips |
| --- | ---: | ---: | ---: | ---: | --- |
| Vertical-line test | 63 | 151 | 19 | 969 | scale 1.254364, 0.742508; trans −812, 2884 |
| Vertical | 66 | 157 | 29 | 969 | scale 0.508896, 0.742508; trans 4043, 2884 |
| Graph | 67 | 159 | 29 | 969 | scale 0.508896, 0.742508; trans 7323, 2884 |
| Point | 71 | 165 | 203 | 969 | scale 0.387894, 0.618759; trans 4563, 3413 |
| Function | 72 | 167 | 203 | 969 | scale 0.581558, 0.618759; trans 8551, 3422 |

The source SWF contains no glossary close handler or resume call. Exact host modal behavior, whether a close restarts the child clock, and audio pause/resume synchronization are unresolved. The P004-only pure state module records source release/stop/request and uses an explicit modern close policy: close clears the request while leaving transport paused; a separate user/host resume action is required. This is a product fallback with original parity pending. Replay resets this modern state deterministically but is not a claim of Flash Replay parity.

## Audio, language, and dependencies

- The embedded stream has 881 MP3 blocks in main-sprite frame ranges 10–280 and 360–969. `SoundStreamHead` reports rate code 2 (22,050 Hz), mono, and `sampleSize=1837`. The 281–359 block gap is a source fact, not proof of silence. The stream payload hash, decoded audible duration, interruption behavior, and synchronization are pending; `audio-inventory.csv` uses the SWF container hash until a separately hash-bound stream extraction exists.
- Lesson SA candidate `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/SA/L12RW04.mp3` is 282,240 bytes, SHA-256 `1dbbc055f3d863b6016b0871a2b94de20925f455ae8b3206c74071e6d8d31a70`, MP3 48 kHz mono, 20.160 s by ffprobe. The catalog association is `candidate-index-only`; its host trigger, language, relation to the embedded stream, and Replay behavior are not accepted.
- The source button terms are English. The `Page 3` catalog Spanish title is an English fallback. No source-backed Spanish mathematical text, source font substitution, or bilingual audio decision has been accepted. Modern typography must preserve instructional structure and accessibility while awaiting a reviewed source-text mapping.
- The legacy host must provide `InternalPreloader` and `DoHyperLinks`; these APIs must be handled by a minimal, reviewed modern host contract. The SWF does not itself define the modal or any close event. Do not call a legacy endpoint or use a VB-specific glossary adapter by ID assumption.

## Frame domains, scenarios, and pending coverage

`audit/scenario-inventory.json` enumerates the root, sprite 90, and sprite 92 as the complete root-reachable timeline set; `audit/frame-domain-disposition.json` declares all three as frame domains. `keyframes.csv` records structural boundaries and source controls. `evidence/full-frame-coverage.json` contains six pending root/main/title English and Spanish requirements with 0 authoritative captures; the main natural trace spans 1–969. It also lists five pending interactive button traces. Original-runtime event schedules, language authority, and close/resume traces are unresolved, so no full-frame comparison, visual metric, or interaction parity is claimed. Keyframes are spot checks only.

The maintained Canvas builder, module, timeline, host route, registry, and descriptor are owned by the main migration task. This source/spec lane changes none of them. Its pure glossary state file is `packages/demos/src/alg-l12-p004-glossary-state.ts` with focused tests. No candidate/browser/build result from this lane proves registration.

## Verification and acceptance ledger

- Source audit checks: rehash physical SWF and SA MP3; `python3 migrations/shared-alg001-l12-p004/audit/build-source-structure.py --check`; `python3 migrations/shared-alg001-l12-p004/audit/build-pending-coverage.py --check`; `node skills/flash-to-js/scripts/validate_migration.mjs migrations/shared-alg001-l12-p004 --allow-draft`; focused glossary-state tests. Record results in the handoff.
- Pending: authoritative original-runtime root/main/title captures, natural glossary/host traces, embedded/SA audio comparison and named-human listening, source-string/Spanish review, high-resolution typography and accessibility review, complete frame metrics, human visual and Owner records, strict validator, release ledger, and lesson publication. No exception or reviewer signature is recorded by this specification.
