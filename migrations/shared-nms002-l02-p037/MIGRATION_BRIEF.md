# P037 — Finding Equivalent Decimals with a Calculator Practice

The source specification is implemented by the maintained native candidate. Current-JS admission and the independent acceptance gates are recorded in separate audit receipts. This brief describes the source decisions and implementation; it does not grant original-runtime, human, Owner or publication acceptance.

## Source identity

- Placement: `shared-nms002-l02-p037`, global page 37, Instruction page 21.
- Source: `NMS002/L2/IN/L2IN22.swf`, 196,912 bytes, SHA-256 `8f7ff05a83fd8c1370f979fedca8e148bd0b80c0bb45ddb7147534d3b92607a7`.
- The exact XML `Page.Title` includes “Practice”. It is bound separately from the outlined SWF course/activity title in shape 2. There is no matching `SubPageTitle` entry for L2IN22; no Spanish page subtitle is invented.
- SWF-only source, 800 × 600, 12 fps, root 10 frames with entry at frame 6. The audit covers 18 source domains and 622 local frames. Five native inspection domains contain 553 frames; 11 static symbols are rendered by their parents. The remaining dormant or unused timelines retain separate dispositions.

## Mathematics and interaction

The target rows are `1/2 = 0.5`, `1/8 = 0.125`, `1/5 = 0.2`, `3/4 = 0.75`, and `3/8 = 0.375`. The bank order is `0.5`, `0.375`, `0.125`, `0.2`, `0.75`, `0.7`. The five correct cards use the exact source target suffixes; `0.7` is always a distractor. Wrong and outside drops return the card without inventing an attempt counter or a two-attempt limit.

The introduction demonstrates moving `0.5` to the first row and returning it. Paint-depth reordering at frame 300 does not reorder the other cards. Travel occupies frames 309–321, the target hold is 321–357, and the return finishes at 368. Source magenta `1/2` overlays incorrectly collide with the fifth-row `3/8` at frames 203, 205, 207 and 209. The native correction preserves those times but emphasizes the mathematically correct first row. Original bytes, coordinates and conflict projections remain preserved. Decimal emphasis at 261, 263, 265, 267 and 269 already targets `0.5` correctly. Reduced motion uses sustained emphasis and removes cursor travel.

Main frame 442 enables practice. A correct drop starts sprite 52 at frame 2; its frame 20 re-enables the remaining cards and starts success sprite 58 after the fifth match. The source therefore permits a late distractor during success. Independent native playheads preserve this path. Success frame 25 resets to 1 and resumes the main timeline; main frame 443 removes the child controls and transports, and main frame 483 stops. The native bank retains hidden, disabled, inaccessible layout placeholders during the outro.

A wrong drop starts popup sprite 79 at frame 2 and stops its timeline at frame 15. Close hides the popup and re-enables cards without stopping its audio. Real My Lesson checks verify hidden popup audio overlapping a new correct-feedback stream. Source `NMHBtn`, `Mc_Popup` and `txtFeed` references have no matching page-local instances. Their original host behavior, button `this` context and exact AVM1 event ordering remain unverified.

## Text, audio and implementation

Five exact bilingual glossary entries are bound from the source indexes. `ScreenkeyTerm="Equivalent Decimal"` is preserved separately from the action spelling `Equivalent decimal`; the unique case-fold match and selected half-entity decoding are qualified explicitly. Native modal focus, pause of all active clocks/audio, Escape, focus return and explicit resume are accessibility adaptations.

All four embedded MP3 streams were decoded completely. The native player transports only sprites 52, 79 and 80; sprite 54 is present but stopped and has no page-local start. A single 1,673-sample latency trim is applied, and every remaining PCM sample is retained once. The main source gap at frames 367–379 uses a decoded-sample partition at 665,204 and resumes at frame 380. Hold 442, terminal 483 and the skipped first popup frame lie in verified PCM silence. Native browser playback is verified by controller and My Lesson receipts; human listening and original audio alignment remain unaccepted.

The maintained implementation uses React/DOM/MathML, source-derived configuration, pointer/keyboard/touch interactions and orthogonal audio clocks. Module: `packages/demos/src/modules/g678-nms-l02-native-matching-p037.tsx`. Player: `packages/demos/src/nms-l02-p037-player-v1.tsx`. Source decisions: `audit/source-specification-v2.json`. Source-local child queries are inspection fixtures, including the post-action reset at sprite 58 frame 25, and are not a single elapsed-time original trace.

The compiler-assisted hybrid workflow remains in the advanced-manual lane for this bounded page. Bulk scale-out is not authorized. Original-runtime captures remain absent, and fidelity, human listening, human/Owner review, strict completion, release and publication remain independent pending gates.
