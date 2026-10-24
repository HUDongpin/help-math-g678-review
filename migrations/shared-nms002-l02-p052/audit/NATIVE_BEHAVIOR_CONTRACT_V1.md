# P052 native behavior contract — 2026-09-23

Source-bound state-kernel specification, not a renderer or acceptance record.
Source SHA256:5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638.
Source scripts and exact hashes remain in ffdec-export-v1.json and SOURCE_SPEC_V1/V2.

## State and actions

Maintain main phase intro/practice/wrong/right/outro/complete, source main frame,
integer percent0…100, source tryCount0/1, wrong-feedback ordinal, seeded choice,
help/glossary ownership, pause state, audio cue identity and replay epoch.

- Intro follows authored frames1…114, then holds115. Only the controller's
  completed-intro event admits practice; a frame query alone is not completion.
- Practice accepts integer percent0…100. Done at75 opens right/correct feedback
  and correct audio. First wrong answer sets tryCount1 and opens wrong feedback.
  Subsequent wrong answer resets tryCount0, reveals75 and opens right/revealed
  feedback with a source wrong-audio branch. Exactly one submission is admitted
  until feedback is explicitly closed.
- Reset changes percent to0, not tryCount or wrong ordinal.
- Wrong Close restores practice. Right Close starts main outro at116, retaining
  percent and feedback outcome. Source feedback return frames do not auto-close
  these dialogs: their children exist at frame1; Close328 explicitly hides the
  right feedback and resumes its parent.
- Help belongs to practice and disables answer/Reset/slider. Square/Column
  glossary belongs to help; closing the glossary retains help and all exercise
  state. Closing help while its child glossary is open is ignored.
- Outro retains solved state through156. Completion requires controller audio/
  visual completion, not merely reaching frame156. Replay returns to intro1,
  resets percent, attempts, wrong ordinal and overlays, preserves seed and
  increments epoch. Late events from an older epoch are ignored.
- Pause prevents progress and answer interaction. Replay remains available;
  pause itself does not claim Web Audio cancellation/resume has been tested.

## Explicit modern adaptations

1. Revealed thumb uses the same75 value as digits/grid, rather than source
   mcDragX=-224.95 (formula45). This is an instructional consistency correction,
   not a silent source-parity claim. Preserve the original constant in evidence.
2. Primary grid remains row-major like source duplicate/fill actions. Source
   help's column-counting explanation is an alternative strategy; the future
   help view must explain that distinction, not say the main grid fills columns.
3. Page-local tryCount initializes0; this replaces an unresolved legacy host
   global. Replay resets it; Reset deliberately does not.
4. The modern host holds terminal156 after audio/visual completion instead of
   assuming an unobserved legacy shell loop/advance. No source local stop156 was
   found; terminal holding is a host adaptation.
5. Seeded wrong selection is reproducible; source random sequence is not known.

The state kernel does not implement HTML/SVG, source intro geometry, bilingual
copy, focus, actual audio, cancellation, navigation, source comparisons or
capture authority. Complete the renderer specification/capture contracts before
the view is implemented. Native corrections require later review; no human,
Owner, fidelity, listening, strict or publication acceptance is asserted.
