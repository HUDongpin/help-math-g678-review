# P052 source-bound behavior intake — 2026-09-23

Status: preserved and structurally audited; **not implemented or registered**.
This specification is an advanced-manual-lane intake, not original-runtime fidelity.

## Identity and evidence

- Placement: `shared-nms002-l02-p052`, NMS002 L2, TI, ordinal/XML occurrence 52, Question 10.
- Source: `G6-G8-shared/NMS002/L2/TI/L2TI11.swf`, 106,791 bytes.
- SHA-256: `5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
- CWS v6, 800×600, 12 fps. Root is **10 frames**, not the length of the main animation.
- `source-identity-v1.json` binds the real external file, exact catalog member and read-only preserved copy. Same-path FLA is absent; other-path FLA absence has not been established.
- `source-text-catalog-v1.json` records 84 timelines, 158 text definitions, 96 shape definitions and parser risks. `ffdec-export-v1.json` pins all 359 FFDec files including ActionScript, p-code, vectors and XML. The raw export is external and excluded from product delivery.
- `source-audio-streams-v1.json` and `intake-check-v2.json` bind extracted source streams and independent FFDec XML byte comparisons. V2 corrects the administrative assertion count from 10 to 12; V1 remains historical evidence.

## Frame domains and source actions

Root frame 1 stops after calling the legacy internal preloader. Root frame 6 (`begin`) stops with `animation` (sprite 350) placed at matrix `[1,0,0,1,8248,5666]` (translations in twips).

The main animation is **sprite-350, 156 frames**. Frames 1–114 are authored intro; frame 115 is the exercise stop. Closing right feedback invokes parent `play()`, entering frames 116–156. No main final-frame stop script was found in the export. Do not invent terminal behavior before inspecting the display list and host contract. Root and nested frames must stay separate in any implementation.

Source scripts are under the export receipt's `as/scripts` directory:

- `DefineSprite_350/frame_115/DoAction.as`: creates 100 duplicate cells via `drawGrid(11,11)`, hides template and modal feedback, sets quiz-section state, initializes three digits to zero and slider to -329.15. Every exercise tick clears cells white and colors the selected count blue (`255`). A hundreds digit of `1` selects all 100 cells.
- Drag `on(press)`: constrains the thumb to x=-329…-95, y=161. Drag `enterFrame`: `round((x/50+5)*64/3)+34`, padded into three digits. Drag release/releaseOutside stops dragging.
- Button 310 Done: disables help, Done, Reset and drag. Lower digits `7`,`5` select correct feedback and Coach_audio_2. Otherwise increments global tryCount: value 1 selects wrong feedback (“Try Again.”) and Coach_audio_1; subsequent wrong answer resets tryCount to 0, sets digits 075, assigns the reveal thumb x, and selects right feedback plus Coach_audio_1.
- Button 307 Reset: clears all 100 cells and digits, restores thumb; **does not reset tryCount**.
- Button 319 wrong Close: hides/stops wrong feedback and re-enables the four controls.
- Button 328 right Close: hides/stops right feedback, clears quizSection and resumes parent main timeline.
- Button 153 help: shows popup, swaps it to temporary depth 9001, disables the four controls. Button 337 close reverses depth ownership and re-enables them.
- Buttons 342 and 343 call legacy glossary for **Square** and **Column**, respectively, and stop the main animation. Future integration must use the modern host adapter, not a live legacy endpoint.

## Source discrepancies and unresolved dependencies

1. **Reveal thumb mismatch:** main defines `mcDragX=-224.95`; Done assigns this while writing 075. The drag formula maps that x to **45**, not 75 (75 corresponds approximately to x=-153.90625). Digits and answer target consistently say 75. Record an explicit source-preserving versus pedagogical correction decision before implementation; no silent parity claim.
2. **Grid order versus help prose:** the duplicate loop increments x in the inner loop and y in the outer loop, yielding row-major shading. Parent main and Box_Main transforms have no axis swap or rotation; template child transforms also have no rotation. Help text says shade by columns and count tens then five ones. Both pieces of source evidence must be retained and the intended modern presentation explicitly justified.
3. **Global attempt ownership:** no tryCount initialization was found in this page's exported scripts. A modern page-local initial state of 0 would be a host adaptation, not a discovered page action. Replay must reset the full modern state; Reset must retain attempt state.
4. **Case spelling:** source uses Mc_PopUp and Mc_Popup. Do not classify this as a runtime error from spelling alone; old ActionScript case semantics require appropriate runtime evidence.
5. **Intro/outro:** dynamic digit animation, final display, removal and host completion still need a complete source display-list audit. Do not replace the intro with a guessed generic demonstration.
6. **Audio:** structural presence and successful decode do not establish speech language, exact cue boundaries, audible synchronization or listening acceptance.

## Audio domains

All six extracted streams are MP3, 22,050 Hz mono; each whole encoded stream decodes successfully. The inventory counts are not six independent spoken clips or six acceptance records.

| Domain | Frames | Audio block frames | Blocks | Encoded bytes | Current disposition |
| --- | ---: | --- | ---: | ---: | --- |
| sprite-8 | 5 | 1–5 | 5 | 1,950 | Legacy/library reachability pending |
| sprite-318 | 5 | 1–5 | 5 | 1,950 | Wrong-feedback nested sound; dynamic reachability pending |
| sprite-327 | 5 | 1–5 | 5 | 1,950 | Right-feedback nested sound; dynamic reachability pending |
| sprite-347 | 20 | 2–20 | 19 | 7,800 | Coach_audio_2, correct response |
| sprite-349 | 55 | 3–55 | 53 | 21,840 | Coach_audio_1, randomized wrong response |
| sprite-350 | 156 | 15–156 | 142 | 58,630 | Main timeline; intro/exercise/outro scheduling pending |

Coach_audio_1 frame 2 selects randomly from S1…S4. Source label frames are S1=3, S2=18, S3=31, S4=40; return-to-frame-1 actions occur at 16,27,36,54. Do not split encoded bytes at those frames. Decode the whole original stream, then validate source latency/seek/sample windows. A deterministic seed is required for reproducible modern branch testing.

## Implementation routing and next acceptance work

Selected direction: compiler-assisted extraction plus an advanced-manual React/SVG/HTML state machine for the 100-cell grid, numeric display, pointer/keyboard slider, modal help, glossary, two-attempt feedback, source animation and audio lifecycle. Classification is behavior-heavy because runtime-generated cells, globals, clip actions and randomized child timelines are not recovered by structural generation alone.

Rejected as primary implementation: flattened video (loses required interaction), unmodified factory output (does not interpret these actions), or a newly invented generic percent exercise (would lose the source sequence). Extracted source geometry remains available for authored visual phases.

Before renderer work: finish intro/outro and feedback asset disposition, explicit discrepancy decisions, source text translations, complete scenarios and keyframes, decoded PCM scheduling and source asset inventories. Then implement pure deterministic state, Replay, keyboard/touch and host lifecycle tests, exact registry/descriptor integration, production build, bilingual browser QA and typography evidence. No scope expansion to the excluded legacy shell.

Original-runtime, fidelity, named audio listening, human/Owner review, strict completion and publication are all **pending**. No provider operations are part of this intake.
