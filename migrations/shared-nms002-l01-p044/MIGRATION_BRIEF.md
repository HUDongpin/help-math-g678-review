# NMS L1 p044 — source-bound implementation specification

Status: specified; unregistered implementation work. No original-runtime, fidelity, audio, human/Owner, strict-completion, release or publication acceptance.

## Objective and identity

Implement the complete source behavior of shared-nms002-l01-p044, Question 2 / Pregunta 2, NMS002 Lesson1, TS section page7 / global page44, inside the retained modern My Lesson host. Preserve G6-G8-shared scope; do not infer individual grade ownership. The source question asks the total before-tax cost of three pairs of jeans at $40 per pair: 3 × $40 = $120. English source art and literal content are authoritative instructional inputs; the Spanish catalog title is not proof of Spanish animation or spoken-audio parity.

Exact SWF: /Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L1/TS/L1TS08.swf.
657348 bytes; SHA-256 8ad8df775eff49a3763f67e95fba4ed211e34912bd63f6602078119240fe6c76.
Asset ID: swf-8ad8df775eff49a3763f67e95fba4ed211e34912bd63f6602078119240fe6c76.
No mapped/same-path FLA is present. Do not invent a missing FLA hash or claim none exists in every archive.

## Source evidence and residual boundary

- Independent triage: work/g678-shared-page-factory/g678-nms-l01-p044-independent-triage-v1/REPORT.md; 16162 bytes; SHA 5d5e5c891cc2340fb1830b28babfac67b21456002b6df950b71f7b54d204a0ec.
- FFDec XML2.2: work/g678-shared-page-factory/g678-nms-l01-p044-source-audit-v2/ffdec-source.xml; 15083280 bytes; SHA 3a3338eacd66b788cdda556128e0ff4715eb5647f3dfb16d1e5a2e0243d5a1fa.
- Structural crosscheck v4: work/g678-shared-page-factory/g678-nms-l01-p044-structural-crosscheck-v4/run.json; 7224 bytes; SHA 619c6c158288b9f036fd0b4c75bba033d0a1d5f411a5b52894ca37c078c2dc0c.
- All18 domains/tags, 42 DoAction payloads, 8 clip placements/payloads and 983 stream-block payloads match the exact source binary.
- Exactly one uninterpreted post-End residual remains in sprite196 at uncompressed offsets [517626,518012): 386 bytes,17 nonzero; SHA d14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0. Raw source retains it. It is not accepted, declared harmless, or proven ignored by original Flash. No other residual may be admitted by analogy.
- V1 swfmill XML failed boundary/EOF checking; V2 strict End-boundary assertion and V3 checker event-mask error remain preserved failed evidence. Only v4's explicitly bounded structural statement is used.

## Runtime and authored behavior

CWS v6 / AS1–2; stage800×600, background#b8d8f7,12fps, root10 frames (833.333ms). Root1 invokes the historical preloader and stops; modern candidate entry is root6, main sprite293 at depth3, source translation(412.35,282.9). Main declared count remains759; authored live terminal is756. No adapter stretches the root count to759.

All294 character definitions are enumerated in asset-inventory.csv. There are119 shapes,49 morphs,10 source JPEG3 bitmaps,9 fonts,78 text objects,12 buttons,17 sprites. QA owns actual visual extraction, not this pure controller. Main1–312 has source fades/translations and a shape42 blink sequence, not continuous invented motion. Morphs belong to explanation/feedback domains and must retain actual source ratios.

| Main stop | Source consequence | Controller requirement |
| ---: | --- | --- |
|312|stop; hide a_text; quizSection true|Continue on source43 or44; source43 empty hit requires explicit maintained-accessibility adapter.|
|449|same stop flags|Second independently resolved Continue.|
|575|hide Mc_box1 and NMHBtn; stop|Source43 continues main; source44 opens explanation106.|
|697|hide Mc_box2 and NMHBtn; stop|Source43 continues main; source44 opens explanation139.|
|737|stop; quizTryCount0; popup hidden|Four answer placements, Need More Help, source feedback.|
|738|quizSection false|Post-feedback main resume.|
|756|stop|Terminal, not759; unused declared tail frames require final source-domain disposition.|

### Explanation Close is not main Continue

At source105/130 on(release), _parent.play() applies to the containing explanation sprite106/139. It does NOT directly play main293. Explanation1 opens toward held frame15 and closes through16–20; explanation2 holds49 and closes through50–55. Closing clears quizSection, continues its child clock, reenables parent NMH and returns that child to1. Main stays575/697 until its separate source Continue is activated.

Exact successful AS export bindings:
- work/g678-shared-page-factory/g678-nms-l01-p044-source-audit-v1/export/scripts/DefineButton2_105/BUTTONCONDACTION on(release).as: 105 bytes; SHA-256 7a44bcb1c4c173e297e6102e0ccabc4df333cde3f7a236802332a001b0e97af5.
- work/g678-shared-page-factory/g678-nms-l01-p044-source-audit-v1/export/scripts/DefineButton2_130/BUTTONCONDACTION on(release).as: 105 bytes; SHA-256 7a44bcb1c4c173e297e6102e0ccabc4df333cde3f7a236802332a001b0e97af5.
- work/g678-shared-page-factory/g678-nms-l01-p044-source-audit-v1/export/scripts/DefineSprite_106/frame_20/DoAction.as: 82 bytes; SHA-256 d83e9c769d6623082c98b20dbbc1e570133b9b991ffbd3d08c318816915160c4.
- work/g678-shared-page-factory/g678-nms-l01-p044-source-audit-v1/export/scripts/DefineSprite_139/frame_55/DoAction.as: 82 bytes; SHA-256 d83e9c769d6623082c98b20dbbc1e570133b9b991ffbd3d08c318816915160c4.

The source open call is gotoAndPlay(1), but child frame1 also contains stop(). The maintained candidate must explicitly state its opening-entry interpretation (requestplay advances the source local opening sequence) and keep original-runtime scheduling parity unresolved. Do not hide this tension in a fake source assertion.

### Quiz, branch identity and feedback

| Visual choice | Source instance | Character/depth | Outcome |
| --- | --- | --- | --- |
|A $43.00|AnsBtn1|143/207|wrong|
|B $120.00|AnsBtn3|144/205|right|
|C $140.00|AnsBtn4|143/203|wrong|
|D $160.00|AnsBtn2|142/201|wrong|

Character143 is used twice; paths/depths, not objectId alone, identify each control. Every nested override carries root depth3/main293 at placement frame6 plus its local parentDomain/depth/object/placementFrame identity. Explanation triggers are unnamed source44 at depth30, placed only at575 or697. After opening, the query hides that exact source instance as required by this._visible=false; it does not merely disable a separate maintained button.

Right variants1–4 map to196/212/172/224, terminal27/28/28/25. Each disables quiz buttons, clears quizSection, resets itself and plays main after its terminal source action. Wrong variants1–3 at the quiz map to276/236/248, terminal28/29/28. Each resets itself, reenables controls and increments quizTryCount; the second wrong completion resets attempts and resumes main. Earlier sprite85 has a70-frame feedback timeline and parent.enableButton reference, but a direct page-control activation before the quiz is not proven; it stays an explicit unresolved source/host domain, not an invented extra answer branch.

Historical showRightFeed/showWrongFeed selection is unknown. The candidate controller uses a declared seeded per-kind cycle to cover the exact7 source variants, with independent right/wrong counters reset on Replay. It is deterministic candidate policy, not authoritative Flash randomness. No FQ score-host capability is inferred from practice feedback.

Popup292 is a one-frame source help panel. Button278 closes it and reenables the source quiz. Glossary IDs are total (button20), multiplication (285), solve (286); source calls DoHyperLinks and pauses main. Root owns exact bilingual glossary data, now bound by catalog/g678-nms-l01-p044-source-glossary-v1.json (9939B, e6b22bae8cab1a1a5597069a852766341845e2ea5ac141983d72a9bfb45f1203). Legacy example SWF and sublinks remain preserved but not implemented. The controller emits IDs/typed intents only, not hardcoded definitions or legacy URL operations.

The exact XML places Total20 at main depth3/frame1 through759, with authored opacity terms0/43/85/128/171/213/identity256 at1–7. The maintained accessibility policy does not expose an invisible source target at1; Total becomes available at observed frame2. This is a source-visibility policy, not a claim that legacy Flash hit testing ignored alpha0. The same complete XML contains no a_text named instance, attribute value, or DefineEditText. Its source _visible assignment is carried as an unbound legacy write with localVisualOverride=false. No question/answer glyph is guessed as its target.

## Pure controller and renderer coordination

Owned files: packages/demos/src/g678-nms-l01-p044-controller.ts and packages/demos/tests/g678-nms-l01-p044-controller.test.ts.

Implemented pure exports: P044_CONFIG; createP044State; reduceP044; queryP044; P044State/P044Event/P044Intent/P044Transition/P044Query and exact P044SourceContext/P044InstanceSegment types.
State owns main frame, active nested frames and full instance paths, phase, paused flag, epoch/clock token, resolved stops, quiz attempts, selected answer, active explanation/feedback/popup, glossary lifecycle and candidate selection counters.
Every event must match the current epoch; clock events also match clockToken. Main observations crossing the next unresolved authored stop are rejected, not relabeled or silently clamped. A source Continue or terminal feedback emits a resolve-main-stop intent but retains the actual observed main frame and resolved-stop prefix. The pendingMainResume state locks controls until a later real main-frame observation acknowledges the resume. A reduced-motion observation may acknowledge one stop and reach the next stop directly; it cannot cross that next unresolved stop. Nested clocks do not directly advance main. Pause invalidates stale clock work; Replay resets the entire vector and advances epoch.

Reducer returns immutable state plus typed source-evidenced intents. It does not schedule timers, call a browser, execute ActionScript, emit raw answers to persistence, dispatch legacy endpoints, or import the official registry. Its choose-answer transition is a proposal: the maintained host adapter must obtain an allowed practice-feedback response before committing it. Missing/blocked host callbacks must not commit a transition or fabricate acknowledgement. Root owns that adapter, main AnimationRuntime clock integration and nested RAF adapters. QA owns source instance-path/objectId/local-frame visual composition. Visual renderer, routes, registry module, actual browser tests and Current-JS registration are not proven by this work package.

## Audio and language

### Readable instructional companion successor

The root-owned readable companion retains the exact source Canvas and adds responsive English instructional text and semantic SVG number lines outside that fixed plane. Catalog g678-nms-l01-p044-readable-instruction-v1.json binds38inputs, including exact SWF/XML, source placements and33 text exports. Separately placed x glyphs94/288 are reassembled as the semantic multiplication sign×, yielding $40×3=$120 and the distinct help example $25×5=$125. Source wording and quantities are retained; whitespace/record separators are normalized. Number-line redraws use proportional coordinates,10-dollar minor ticks over0–130, source repeated40-dollar labels3times or25-dollar labels5times, and mathematically derived jump endpoints. They are maintained mathematical equivalents, not original vector paths or new Flash fidelity evidence.

Readable main sections start only at their source placements313/450/576/698. Expanded explanations appear only at exact held local frames106:15 or139:49; popup292 shows only its separate25-dollar help example. No early solution reveal or replay retention is intended. Mobile body text20px/line30px and sufficient diagram-label size/contrast are explicit browser QA criteria. This successor is still unregistered; it changes neither audio nor human/Owner/strict/release gates.

Source has983 blocks across9 nested streams:8 MP3 plus sprite224 ADPCM. Exact raw framed payload hashes/windows are recorded in migration.json/audio-inventory.csv; these are not standalone decoded audio files. Main stream blocks are local14–753. No audio player, URL, cue delivery or listening result is implemented here.
The external SA/L1TS08.mp3 is only a source-catalog association candidate (120624B, SHA211ede4a33ffec5c7cb809e3952a806e8cfe269aafccb135b8b90b4efe39776b). Original host selection, priming, pause/seek, overlapping nested clocks, Replay and language remain unverified. Audio is required as a future acceptance obligation, not marked absent because nothing is currently played.

## Coverage, verification and remaining gates

evidence/full-frame-coverage.json contains38 explicit pending source-domain/trace/language requirements, zero captures; keyframes.csv contains236 planned observations and no image/metric/reviewer data. Entry hashes bind unexecuted planning states, not original-runtime execution. All18 frame-domain dispositions remain explicitly unresolved for strict validation; declaring them does not prove renderer support. Full main range759 versus natural terminal756 is carried as an unresolved final-domain question, not satisfied by fabricated playback.

Initialization evidence from root: doctor passed0errors/0warnings; verify:sources failed its pre-existing compatibility link; verify:workbench terminal failed stale catalog completion ledger; full npmtest was interrupted with SIGINT and is not an aggregate pass. These unrelated baseline failures are not rewritten.

Current pure verification:23/23 controller tests passed with0 skipped, including live rehashes of the exact SWF/XML/crosscheck/catalog and all60 source AS exports. Tests cover every guided stop, both explanation entry/held/close paths, all4 answer placements and7 feedback variants, first and second wrong consequences, popup/glossary behavior, all10 controller phases under pause/Replay, invalid/stale events and clock boundaries. Demos TypeScript checking and portable draft validation passed. A first TypeScript run caught a test-only optional assertion-message overload; it was corrected and rechecked. No production/full-workspace build pass is claimed.

Remaining behavior limits are explicit: source root1 preloader lifecycle is not reproduced; source host feedback-selection randomness is unresolved; gotoAndPlay entry ordering against nested frame1 stop actions still needs original-runtime evidence; earlier85 activation is not proven; the unbound a_text write has no local target; the exact386-byte source tail remains uninterpreted. Source-native Canvas/actual mounted behavior, audio, original runtime, full-frame comparisons and production-build evidence remain separate until their owners supply them.

All human/Owner/engineering decision fields stay pending with empty identities/times. No known exception is accepted, no checklist box is checked, and no strict completion, lesson release or publication is authorized.
