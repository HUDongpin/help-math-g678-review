# P050 — decimals on a number line

Updated: 2026-09-21. Status: unregistered engineering candidate.

## Identity and instructional purpose

Placement `shared-nms002-l02-p050` belongs to shared G6–G8 NMS002 Lesson 2,
TI Question 8. The source is `G6-G8-shared/NMS002/L2/TI/L2TI09.swf`
under the AWS Grade-Classified Courseware source root. Exact source SHA-256:
`28600adb8cd9a280e5052a25e448b7c71fc4b85ac4a5e89f6a73f23d7768a197`.
The preserved copy is `audit/source-input.swf`; no same-path FLA was found.
The goal is to locate decimals in tenths on a number line. The five draggable
values are 0.8, 1.5, 2.7, 3.1 and 0.2. The introductory 2.1 is a demonstration,
not a sixth draggable item. English and Spanish product text remain required;
source narration is English and does not establish Spanish audio coverage.

## Source audit and implementation lane

The source is SWF 6 CWS, 114071 bytes, 800 × 600 at 12 fps. Root has 10 frames;
main sprite 94 has 260. Structural extraction recovered 20 timelines, 32 shapes,
28 static text definitions and no dynamic text fields or bitmaps. FFDec 26.2.1
exported 45 ActionScript scripts and corresponding p-code. Evidence is in
`audit/structural-summary-v1.json` and `audit/behavior-intake-v1.json`.

This is the behavior-heavy advanced-manual lane within the compiler-assisted
workflow: source extraction and generated intro states feed maintained native
state, audio and rendering components. Bulk factory scale-out is not authorized.
React and SVG are the intended rendering surface; its implementation and actual
My Lesson integration remain pending. The existing modern host is retained.

## Behavior and timeline contract

Main frames 1–208 form the intro. Generated effective state contains 59 ranges,
with inherited transforms and alpha and the root placement translation. It is
queryable through `nms-l02-p050-intro-v1.ts`; nested sprite playback is separate.
The 2.1 demonstration moves during frames 120–127 and holds through frame 209.

Main frame 209 stops for practice. `Scr_1` through `Scr_5` map by identity to
`Mc_Tar1` through `Mc_Tar5`, with values 0.8, 1.5, 2.7, 3.1 and 0.2 respectively.
A correct drop reveals the matching target, hides the source and disables input
until correct feedback finishes. A wrong drop restores the source position and
opens feedback; input resumes on explicit close, not at audio end. Help preserves
solved items and temporarily disables practice. Native pointer, tap and keyboard
input must share the same target-identity checks.

After five correct placements, completion feedback runs before the main outro.
Sprites 85 and 89 duplicate Right_Feed visuals and callbacks; one semantic native
completion is an explicit adaptation, not a claim about Flash name lookup.
Frame 210 removes practice controls and the demonstration. No explicit frame-260
stop was recovered. The native one-shot terminal hold at 260 until Replay is an
explicit modern-host adaptation. Replay clears solved state and invalidates stale
asynchronous work. See `audit/native-behavior-spec-v1.json` and the drag and
intro/terminal intake records for exact source evidence.

## Assets, text and audio

`asset-inventory.csv` records all 32 SVG exports and 25 teaching text definitions.
Character 38 is the outlined course title. Shape 47 contains horizontal underline
strokes despite zero raster height; its PNG export failure is retained and its SVG
is usable. Shapes 67 and 72 are transparent target hit geometry and must not become
visible filled boxes. Three offstage nonteaching text definitions are excluded;
the private author metadata is excluded before product generation.

`audio-inventory.csv` records all four whole MP3 streams with verified hashes.
Sprites 88, 91 and 94 are selected. Sprite 93 is retained as source evidence:
no Coach_audio_1 start call was found, so it is not played. Decode whole streams;
never cut encoded MP3 bytes. Prepared PCM follows source frame/seek anchors and
retains the nonzero correct-feedback tail. Inventory duration means full decoded
source duration, not scheduled playback duration. The inventory generator verifies
source, exported SVG, MP3 and PCM hashes before writing deterministic CSV files.

## Existing engineering evidence

Maintained modules cover practice state, clock, audio windows, whole-buffer decode,
audio transport and session lifecycle. Tests cover all 120 success permutations,
wrong drops, stale callbacks, Replay, pause/resume, help and terminal transitions.
The generated intro checks cover all 208 frames, transforms, alpha and demo motion.

`audit/browser-audio-verification-v1.json` records real Chromium decode and rejection
of corrupt/aborted input. `audit/browser-session-verification-v1.json` records a real
audio-context session through wrong feedback, five correct answers, outro, Replay
and context cleanup. These are fixtures, not completed renderer or host tests.
Chromium's main-stream peak clamps to 1 while the FFmpeg decode exceeds 1; no
amplitude identity or named-human listening acceptance is claimed.

## Remaining implementation and independent acceptance

Finish bilingual text and source-backed glossary extraction, source-driven intro
rendering, accessible five-item practice, help and feedback dialogs, and host
playback integration. Then verify real pointer/keyboard use, English/Spanish,
responsive layouts and 200% text, host navigation cleanup, production-negative
isolation, typography evidence, exact freeze and registry/descriptor admission.

`keyframes.csv` and full-frame coverage remain unfulfilled capture requirements;
source state extraction is not a substitute for captured original-runtime traces.
There is no authoritative original-runtime baseline, full-frame comparison, named
human visual/listening decision, Owner acceptance, strict completion or publication.
No route, registry membership, production build or renderer acceptance is asserted
for this candidate. Current-JS admitted count remains 468/2282 until integration
and its evidence are complete.
