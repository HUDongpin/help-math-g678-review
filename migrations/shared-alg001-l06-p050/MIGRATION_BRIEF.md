# Current checkpoint — 2026-10-03

P050 is now **registered and verified at the local maintained Current-JS gate**. G6–G8 registry membership is **530/2,282**, with **1,752 remaining**; ALG001 L6 is **53/60**. This supersedes the implementation-pending statements in the dated source brief below.

- Final source-bound review: `output/g678-p050-admission-20261003-v1/root-review-v1.json`.
- Active admission index: `catalog/g678-admission-v1/index-v161.json`; forty page proofs, all thirty-nine predecessors unchanged.
- Maintained game/native/Canvas/audio implementation is integrated through the actual registered EN/ES My Lesson route. Ten non-repeating questions, score100 branch, three correct feedback clips, wrong hold/Close, directions, Replay and previous/next cleanup passed.
- Final checks:32 targeted tests,12 semantic negatives, production build with TypeScript, four stable registered browser flows, six responsive cases,180 production requests returning404, and2,347 compiled files with no exact P050 source payload matches.
- Real SA EOF notification and mobile Canvas clipping were fixed; failed attempts remain retained. Spanish Audio stays explicitly user-triggered. The original/source teaching text stays English; Spanish controls do not establish Spanish content acceptance.
- Browser measurements bind decoded audio identity and nominal frame cues, including correct432 ADPCM frame2 sample919. Audible alignment, listening and original-runtime acceptance remain unproven.
- Existing host skip-link/large-heading layout limitations, unavailable source fonts, missing Mc_Final and unresolved original parent/host calls remain recorded. Human/Owner, strict completion, release and publication remain open.
- All operations were local. Owned test processes are closed and the prior dev output directory/configuration restored.

## Historical source and implementation brief

# P050: Game 1 — function and graph matching

Source audit: 2026-10-03 Asia/Taipei. Unregistered engineering work.

## Identity and custody

- Placement: `shared-alg001-l06-p050`, ALG001 L6 ordinal 50, GS Game 1.
- Asset: `swf-4353f9cbd7e60043baa8f59c7f5193fcd930778ace4b918ab56f2953f306937e`.
- Physical source: `G6-G8-shared/ALG001/L6/GS/L6GS02.swf` under the AWS Grade-Classified Courseware root; 828,730 bytes.
- SWF, SA MP3 and lesson XML have byte-identical read-only local copies in `source-v1`. `audit-v1/source-custody-v1.json` records full paths and hashes. Same-path FLA absent; no broader absence claim.
- XML confirms page 50 and Game 1. No matching canonical workspace existed by ID/hash/path before scaffold. No source promotion or variant substitution.

## Source-backed specification

SWF CWS v6, 800×600, 12 fps, background #b8d8f7. Root 10 frames, entry 6; main sprite489 has 674 frames. Main labels: RepeatDirection72, GS_Begin662, Q1–Q10 at663–672, Final673. Root duration is not game duration.

1. Intro Start34 sets startGame and jumps to662; Skip38 jumps to662 without requesting the first question. Begin Start253 requests a draw on onEnterFrame.
2. Begin662 sets score0, count0, ten question labels. A draw increments count, picks a random index from the remaining bank and splices it out. After ten responses the next draw increments count to11 and enters Final673.
3. Source answers: **D A B D C A B C D B**. Generated model matches actual instances, release handlers and letter hit geometry, preserving each question display list.
4. Correct selection adds10 once, plays score265 from2 and the question's fixed correct clip from2. Q1–Q4 use358/end28; Q5–Q7 use432/end25; Q8–Q10 use479/end28. Terminal scripts request the next draw.
5. Wrong selection writes the exact correct-letter message. random(3)+1 chooses one of three named wrong instances, all sprite380. Popup379 appears17, hold23, Close376 resumes24, terminal28 requests next question. No page-local point deduction or retry on the same question.
6. Score265: below100 traverses3–10 then holds1; score100 traverses11–20 then holds1. Dynamic text262 reads global score.
7. Repeat Directions257/259 opens static popup24, disables answer/Start/Repeat controls, and Close18 reenables them. It does not replay intro audio. Text19–23 is reachable directions. Text3–5 belongs to unplaced library definitions and must not replace actual rules.
8. Final673 stops and calls Mc_Final.gotoAndPlay(2), but no Mc_Final instance exists. Final Start253 requests another draw without reinitializing score/pool. Modern host Replay resets the full state deliberately.

## Assets, geometry and audio

FFDec26.2.1 exported 538 files; swfmill0.3.6 provides independent XML. Large extraction: `/Volumes/American Dream/hudongpin/g678-p050-source-extraction-20261003-v1`; pinned receipt: `audit-v1/source-extraction-v1.json`.

`generator-v1/derive-source-model-v1.py` reuses existing affine/display-list and binary-tag helpers. It checks all extraction bytes, independently decodes glyphs against FFDec text, binds letters by hit geometry, and cross-checks XML audio blocks against binary SWF tags. Output includes source configuration, display states, all domains and six raw streams.

Main489 and feedback345/358/380/479 are MP3. Correct432 is SWF ADPCM, 13×459 samples at5512Hz; `derive-adpcm-v1.mjs` reuses the existing decoder to create WAV. Frame2 skips459 source samples; browser cue remains to be measured for this page. Sprite345 is placed but stopped at1 and unselected by page scripts. Retain it without inventing activation. Spanish audio is a separate 629,664-byte user-triggered recording; no locale autoplay or splicing into English audio.

Asset/audio/keyframe CSVs and `audit/frame-domain-disposition.json` record boundaries. Full-frame requirements remain pending. Complete scenario/trace coverage and captures are not established.

## Implementation and reuse decision

Lane: advanced-manual with compiler-assisted extraction and generated configuration. Planned presentation: source-derived Canvas preserving graphs and lemonade scene, native text/control companions, and a maintained page state machine. A linear timeline or P049 two-attempt reducer cannot represent ten random questions, score animation and advance-after-feedback.

Reuse the admitted geometry reader, binary parser, ADPCM decoder and later the bounded host audio loader. `g678-alg-l09-game-assessment.ts` handles a different card-pair/level game with deductions. NMS L1 P047 has compatible seeded splice semantics but different response/review lifecycle; its admitted implementation remains unchanged. P050 keeps a local seeded draw function until two active consumers justify extraction. Seeded JS preserves reachable selection semantics, not Adobe random state.

Planned pure state module: `packages/demos/src/alg-l06-p050-state-v1.ts`; generated configuration: `alg-l06-p050-source-bindings-v1.ts`. Tests must bind to actual scripts and exhaust ten-question paths, score thresholds, feedback identities, stale callbacks, Replay and leave. Renderer, browser measurements, host integration, registration and production negatives remain required.

## Unresolved and independent gates

- Original host binding for enable/disable quiz controls, gSound and _parent.enableButton remains unverified.
- Q6 wrong handlers call _parent.showWrongFeed before the local function. Preserve unresolved call separately; do not execute two guessed clips.
- Missing Mc_Final leaves final animation unresolved. Modern accessible score reporting does not establish an authored final clip.
- Original random state, frame/audio alignment, visual appearance, listening, human/Owner acceptance, strict completion, release and publication remain unaccepted.
- No provider operation, original-runtime capture, human signature or lesson-completion claim exists.
