# P052 audio-associated visual placement — 2026-09-23

Source SHA256:5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638.

Resolved the prior audio-bearing-versus-nonvisual question using source geometry,
not an assumption based on object names. Maintained script
`scripts/audit-nms-l02-p052-audio-visual-placement-v1.mjs` reparses the preserved
SWF, checks the hash-pinned FFDec XML, parses shape7 bounds using REXML, and
composes all structurally reachable timeline/button transforms. It traverses
all distinct authored display-list states, with cycle rejection, and retains
each distinct target path and matrix.

Shape7 is a real magenta rectangle with a blue stroke, not an empty shape.
Authored bounds are[-230,-250,230,250]twips with1twip stroke. The check uses a
conservative1px padding beyond the source bounds. Coach labels use their
source text bounds with the same padding. Translation is divided by20 once.

There are13 root-reachable target paths: six click-child rectangles, five
direct button-state rectangles and two coach labels. The five direct records
(buttons307/310/319/328/337) are hitTest-only, not painted button states. The
initial assertion expecting8 paths failed because it omitted those five
records; the corrected audit retains all13 rather than filtering them away.

Every padded bound is outside the authored800x600 stage to its left. The
largest right edge is-110.25px (both coach labels). The two coach child matrices
are main parent[-13584,521] and[-13584,-79]twips, composed with root[8248,5666]
and child text[40,40]. No assumed zero-alpha or invisible flag is needed to
establish this bounded static offstage result.

Modern implementation decision: do not draw these offstage authoring markers
inside the teaching stage; retain source identity and cue playback. This does
not remove audio, prove original-runtime clipping or exclude a domain from
strict acceptance. Script-driven relocation and external-host changes are not
simulated. The source labels remain in the text catalog, not deleted.

Generation and exact `--check` passed. Output `audio-visual-placement-v1.json`
SHA256:2307675f6051e19ac15620c5afec356fe4f869ddb4da60ff70c7f79839f32851.
No browser/build or new acceptance claims. Earlier50-test result is unchanged,
not represented as a newly executed suite in this turn.

This resolves the next-step static placement question. Continue specification
and coverage reconciliation, then implement the real view/audio controller.
Do not repeat source audio decoding or the offstage investigation absent drift.
