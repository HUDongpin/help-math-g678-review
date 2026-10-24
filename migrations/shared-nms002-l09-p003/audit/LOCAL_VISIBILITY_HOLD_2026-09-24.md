# P003 local candidate: hidden-page playback hold — 2026-09-24

## Boundary

This is a local-only lifecycle correction to the **unregistered** P003 candidate.
It does not establish original Flash timing, audio language/listening, fidelity,
My Lesson integration, or any human/Owner/release gate. The source SWF remains
`d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.

## Change

`apps/web/components/g678-nms-l09-p003-candidate-player.tsx` now holds the
continuous source clock on `visibilitychange` when `document.hidden` is true,
including a pending sound start. It also pauses the silent local timer. Returning
to the tab never automatically resumes; the user must choose Resume or Start
source sound. A hidden document cannot start sound through the button handler.
The existing synchronous picture-commit interlock remains in force.

## Observations and checks

- Local Chromium, English calibration route on `127.0.0.1:3233`: the silent
  candidate was playing before a synthetic `document.hidden=true` and
  `visibilitychange`. It changed to Resume at frame 556 and remained at 556
  across a later browser probe.
- With exact source sound prepared in the temporary loopback-only opt-in,
  playback was observed at frame 200 before the same visibility event. After
  the event, `data-p003-audio-mode=paused`, visible source frame, audio frame,
  and committed frame were all 200. Restoring `document.hidden=false` left
  mode paused and frame 200; there was no automatic restart.
- The small final code adjustment routes the event through a stable ref to
  avoid a new React hook-dependency lint warning. Web TypeScript passed with
  the final code. Targeted lint passed with only the pre-existing
  `commitVisualFrame` hook-dependency warning. Twenty focused audio-clock,
  plan, and access-policy tests plus three source-bound server tests passed.
  The source SWF/FFDec audit passed.
- The opt-in file `apps/web/.env.development.local` was deleted after the
  browser probe. The old dev process cached that opt-in and still returned 200,
  so that exact `3233` process was stopped. A restart was blocked by an
  independently running same-worktree Next dev process at port 3231, which
  was not stopped. Port 3233 is closed; the opt-in file is absent. The
  default-deny audio policy has three passing focused tests, but a restarted
  live 3233 negative request was not obtained in this turn.

The full root `npm test` baseline had unrelated failures and was interrupted
after several minutes to keep this worktree usable; `verify:workbench` was
also interrupted. `npm run doctor` passed. Generic `verify:sources` rejected
the legacy compatibility symlink as designed, while the exact P003 audit used
the real AWS source directory and passed. None of these broad checks is claimed
green.

## Next gate

Re-run this lifecycle flow in the actual modern My Lesson host once the page's
source-bound module/asset/descriptor and typography evidence are ready for
registration. Then obtain authoritative original-runtime timing and human
listening evidence separately. The private calibration result alone must not
change the 471/2,282 registered-placement snapshot.
