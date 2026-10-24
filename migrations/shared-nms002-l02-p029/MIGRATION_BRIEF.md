# shared-nms002-l02-p029 — Naming Decimals

## Source identity and scope

The exact shipped source is `G6-G8-shared/NMS002/L2/IN/L2IN14.swf`: 133,238 bytes, SHA-256 `4def014cda62cdfee43006ddbc1ce5b194ee89740f6576c886503b70c905fe30`. It is SWF-only. Source XML occurrence 29 follows the admitted P028. Reuse this canonical workspace; do not infer a new FLA or replace the source.

The movie is 800 × 600 at 12 fps with 10 root frames. Root frame 6 places `animation`, sprite 49, whose authored timeline contains 383 frames. There are 393 raw local frames, 21 shapes, 22 text definitions, 4 buttons and 1 font. All source facts, placements and extracted artifacts are bound in `audit/source-specification-v1.json`.

## Recovered teaching behavior

The base chart appears from frame 3 and reaches full alpha at frame 8. It already displays 0.15, a hundred-square grid with 15 shaded cells, and a seven-column place-value chart. Do not delay the base digits until their later emphasis.

The chart groups Hundreds, Tens and Ones under the clickable heading Ones; the Decimal Point column separates these from Tenths, Hundredths and Thousandths under Decimals. The third source glossary link is Place Value, first visible at frame 48 and fully visible at frame 52. The source keys are Ones group, Decimal and Place value.

Source contours independently verify all 15 red cells: the entire first column plus the top five cells of the second column. Counting highlights from frames 132–177 traverse the first column from bottom to top, then the second column from top to bottom. The source flashes the Place Value title at frames 187, 189, 191, 193 and 195. Later phases emphasize 0; Ones and 0; Decimal Point and the dot; 1; Tenths and 1; 5; Hundredths and 5; and finally both fractional place values. Frames 381–383 return to the base chart.

Text character 11 is reused as the horizontal Ones group heading and, at a different depth and rotation, the emphasized Ones column label. Track instance depth, generation and transform rather than character ID alone. The exact 383-frame semantic map and all source instances remain in the external source audit.

## Implementation strategy

Use the compiler-assisted hybrid lane, classified `interactive-understood`: one linear nested timeline and three glossary pause actions fit the existing maintained typed host. Implement native semantic SVG cells and an accessible place-value table. Preserve teaching order and source emphasis intervals, while applying the approved native typography, contrast and responsive layout contract. Horizontal/wrapping labels may replace rotated source glyphs; a narrow complex table may use an explicitly bounded, keyboard-accessible scrolling region.

Reduced motion should retain the counting target through authored blink gaps only during frames 132–177, and hold the Place Value emphasis during frames 187–195. Source shape 31 has a tiny lower/right protrusion; raw geometry is preserved and a native semantic highlight targets the same bottom-left cell. These are explicit presentation adaptations, not fidelity acceptance.

There is no end stop in the child. Keep an independent source-loop query and a qualified modern once/final-hold policy. Replay must reset the entire page/audio/glossary state while preserving user volume and locale. Closing a glossary dialog stays paused until explicit Resume.

## Audio

The embedded MP3 stream contains 366 source blocks at frames 18–383. Complete FFmpeg EOF decoding and repeated Chromium decoding both yielded 669,888 mono samples at 22,050 Hz. Source latency is 1,673 samples. The planned full-stream placement begins at sample 31,238, the rounded frame-18 offset, and retains every sample after a single latency trim. Do not split encoded MP3 bytes.

Frame 177 contains zero samples, zero MP3 bytes and seek −2,299. Preserve that record; it does not authorize inserting a new clip or arbitrary silence. The separate SA MP3 is only a hash-verified language-undetermined catalog candidate. Browser scheduling, actual output and original listening still need independent evidence.

## Current gates and next action

Source audit/specification is prepared and draft validation passes. Four original-runtime capture requirements and 84 keyframe entries remain plans with zero accepted captured frames. The 20 FFDec-composed screenshots are structural projections only.

Current-JS is unregistered. Implement and verify the native model/player, then integrate from the P028 descriptor. Original runtime, fidelity, audio listening, human visual review, Owner acceptance, strict completion, release and publication remain pending. No bulk scale-out or provider action is authorized by this single-page source qualification.

## Title clarity requirement and candidate progress

The Owner additionally required all lesson-animation titles to become clearer on 2026-09-19. Follow `docs/LESSON_ANIMATION_TITLE_CLARITY_2026-09-19.md`; the current candidate uses `LessonAnimationTitleV1` with the exact source heading. That component passed 12 responsive/title-scale cases, selectable native text and measured 13.88:1 contrast. This is not evidence that all existing lesson titles have been remediated. Existing source heading declarations require separate inspection and deliberate frozen successors.

P029 now has a compact 383-frame native teaching model, whole-stream audio preparation/engine, and native grid/table presentation. Six model/audio tests and 312 native layout/semantic cases passed, including the exact shaded-cell count, base0.15, title clarity and local table keyboard scrolling. The initial keyboard test used End, which did not scroll horizontally; the retained V2 tests native ArrowRight scrolling. Actual page audio playback, glossary integration, source text binding, module registration and My Lesson integration remain pending.
