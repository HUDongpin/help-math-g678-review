# shared-alg001-l12-p009 Migration Brief

Source audit: 2026-09-27. Status: source-audited draft; implementation and acceptance pending.

## Objective and identity

Implement source-backed Reviewing Ordered Pairs (Revisión de pares ordenados) in the modern Lesson/My Lesson center. Canonical placement is ALG001 L12 P009, VB section page 3; immutable asset ID is `swf-d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533`. Catalog and exact instructional source establish geometry/coordinates scope. The Spanish navigation title does not establish Spanish page content.

## Preserved source

Physical SWF: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB04.swf`; 165405 bytes; SHA-256 `d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533`. `audit/source-input.swf` is byte identical. FLA is absent. Source archive and shared catalogs are unchanged. See `audit/source-placement.json`, `audit/extraction-receipt.json`, and `evidence/SOURCE_AUDIT_2026-09-27.md`.

## Source behavior and route

CWS SWF 6, 800 × 600, 12 fps, background `#b8d8f7`; root 10 frames, nested main sprite 62 has 394 frames. Root frame 1 requests InternalPreloader then stops; frame 6 stops and places main at depth 1 and outlined-title shape 63 at depth 85. Main has no ActionScript/terminal-stop/Replay handler. Eight exact release handlers set KeyAttribute, request DoHyperLinks, and stop animation_mc.animation. Their complete bodies and source/P007 template comparison are byte verified. Four masks and complete transform histories require native review.

Use compiler-assisted extraction plus a maintained P009-scoped typed glossary state and source-native renderer. Classification is interactive-understood. Reusing the existing P007 private adapter requires an explicit reviewed scope extension or a page-specific implementation; its current calibration regex excludes this page. Every glossary request must carry the exact source key and current main frame. Close/resume, focus return, keyboard/touch, terminal hold and whole-page Replay remain explicit product contracts to implement and test. No legacy globals execute in the modern product.

## Typography and graphics

Source contains 16 static definitions, 32 decoded runs, one font, 37 vectors, eight buttons, zero dynamic fields/bitmaps/unparsed tags. Source catalog content SHA-256 is `37a2c8162c7e13a368f90bee7fa0c7a3df788ad305dc41bad6c08214e24754e6`. The native/graphics inventory is separately owned. Bind sourceTextIds and all instances, preserve graph geometry, ten minus-sign instances, source literal `(4,2)`, the pair’s opacity-only updates and one-frame flashes. Do not suppress vector/text instances until source geometry and masks have a complete reviewed disposition. Page language policy is EN source text / ES disclosed source-English fallback; dictionary glossary records have source EN/ES entries.

## Audio

393 source stream blocks were extracted, not decoded or implemented. Raw head: mono 22,050 Hz MP3, nominal 1,837 samples/frame and latency seek 1,673. Frame 3 has a zero-payload block without proof of silence. Concatenated embedded MP3 is 162,890 bytes SHA-256 `15e60f13aad0e2187db0b32f6bcfe65151001a1ded336abd4fb4eb59b3014f2e`; sidecar differs (325,584 bytes SHA-256 `3ccbe37ecfabff0506ef3daafc7db4b9fd8b770f0baefd6a70efeaaa27ca6fd4`). No audio schedule, language, listening, host pause/resume or terminal policy is accepted.

## Evidence and verification

FFDec 26.2.1 XML, 10 AS, 10 P-code-hex, 16 plain-text files and tag listing are hash bound. Maintained parser output, full 404 structural frame rows, 63 character asset rows, exact bilingual key crosswalk and per-block audio evidence are reproducible with `HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' node migrations/shared-alg001-l12-p009/audit/build-source-audit.mjs --check` from the implementation root. Check rereads real source/toolchain/current outputs and performs no writes. The preserved `-version` failure is retained; `-help` identified the successful actual tool.

## Pending implementation and acceptance

No route, module, registry or audio implementation was written here. Original-runtime baseline/full-frame coverage, maintained native renderer, page-specific typography B/C, fresh real-host EN/ES responsive/zoom/focus tests, Flash fidelity, audio listening, human/Owner review, strict completion, release and publication remain pending. The untouched scaffold keyframes/full-frame-coverage are root-only pending evidence; later coverage must deliberately add the main and actual glossary traces. Runtime frameCount remains root 10. No source/acceptance substitution occurs.
