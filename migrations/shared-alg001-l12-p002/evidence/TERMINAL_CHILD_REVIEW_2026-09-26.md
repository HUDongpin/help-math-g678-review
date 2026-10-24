# P002 terminal-child finding from the completed structural inventory

Main independently reviewed and reran the new source-domain builder. It
enumerates seven root-reachable timelines, with two declared and five
unresolved dispositions. The canonical validator reports exactly those
unresolved strict blockers, not a complete migration.

One finding changes the next behavior investigation: source sprite 454 places
sprite 449 (19 frames, depth 35) and sprite 451 (36 frames, depth 46) at its own
frame 1,951, where sprite 454 also executes `stop()`. Both children have zero
local action tags in the audited source. This is not evidence that every child
playhead stops with its parent. It leaves a concrete terminal-composition
question that the prior Current-JS terminal-clamp test did not answer.

The prior browser receipt proves only that the current JavaScript candidate
reaches and clamps its selected parent frame, and that modern Replay restarts
it. It does not prove original terminal child animation, clock offsets,
loop/reset behavior or terminal audio. Keep its wording and acceptance boundary
intact; do not call the parent-frame clamp Flash terminal parity.

Next evidence task: recover a source-supported natural trace covering entry
into frame 1,951 and subsequent child cycles, including Replay/host navigation.
Bind parent and child clocks separately before changing the maintained runtime
or accepting a composite-child disposition. The other multiframe children,
43 (entry parent frame 24) and 389 (entry parent frame 1,201), also remain
explicitly unresolved. No runtime, registry, freeze or source was changed by
this review.
