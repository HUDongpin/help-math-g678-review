# P052 cue and pause/resume contract — 2026-09-23

Engineering candidate only. Exact source SHA256 remains
`5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
No product renderer, registration, listening or original-runtime acceptance is established.

The maintained pure helper `scripts/lib/nms-l02-p052-audio-windows-v1.mjs`
constructs ten PCM windows from the six verified native audio plans.
`native-audio-windows-v1.json` pins that helper, the underlying plan and eight
original exported scripts; source label frames are also checked against the
structural catalog.

## Main pause seam

Intro consumes prepared PCM `[0,209475)`, stopping at the start of visual
frame115. Outro resumes exactly at209475 and consumes the rest through285666.
The resumed visual domain starts at116. This is an explicit modern adaptation:
the unplayed stop-frame audio is retained rather than skipped by seeking a fresh
frame116 offset. It does not assert whether the original Flash player queued or
stopped the frame115 sound block. The visual end remains156; the future player
must retain the audio suffix and report completion only under its tested
audio/visual lifecycle policy.

## Feedback and clicks

- Correct Coach347 starts at frame2 and retains its complete stream tail.
- Wrong Coach349 label starts remain S1=3, S2=18, S3=31, S4=40. Each cue ends
  at the next label boundary, with S4 retaining the complete stream end.
- Original return actions16/27/36/54 are recorded independently, not used as
  automatic truncation points for the audio. That tail policy is a native
  adaptation, not original-runtime audible-output proof.
- A user's explicit Close, Replay or navigation cancels the active cue. A
  cancellation must not fire natural completion callbacks. Actual session
  implementation and race tests are still required.
- Click8, wrong-close318 and right-close327 each have one complete window.
  Pointer/keyboard/touch should trigger one click per activation, not duplicate
  pointer-down/click events. Browser wiring remains pending.
- A deterministic seed plus wrong-attempt ordinal selects S1…S4. Replay must
  reset the ordinal with the rest of the state. This is reproducibility support,
  not a recovered original random sequence.

## Evidence

Combined audio-plan/window suite:17tests passed. New tests check exact main
partition, four non-overlapping wrong branches, retained callback tails,
rejoining the actual main PCM across the seam, pause/resume cursor bounds,
deterministic branch coverage and malformed plan rejection.

The source-bound generator reports ten windows, eight hash-verified ActionScript
bindings and main seam209475. These tests do not simulate Web Audio or prove
browser playback, modal focus, host navigation, language routing or source
listening acceptance. Main source-count discrepancy576 and maximum continuous
anchor difference645 remain unchanged and explicitly recorded in the underlying
plan.

Next: finalize P052 visual/behavior native decisions and scenario/domain capture
contracts, then use these tested cue windows in the page state machine and real
My Lesson lifecycle. Do not create another audio-extraction audit unless inputs
or a failing check require it.
