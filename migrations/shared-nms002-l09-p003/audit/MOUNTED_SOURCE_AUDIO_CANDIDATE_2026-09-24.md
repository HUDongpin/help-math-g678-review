# P003 mounted local source-audio candidate — 2026-09-24

This receipt advances `shared-nms002-l09-p003` from transport/decode probes to
an **unregistered, local-only mounted playback candidate**. It does not establish
original-runtime timing or listening, source-audio language, My Lesson admission,
human review, or release. The source SWF is the 473,410-byte
`G6-G8-shared/NMS002/L9/RW/L9RW03.swf`, SHA-256
`d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
The complete embedded MP3 is 263,120 bytes, SHA-256
`a8ca1683d3f7848f16f9be96e3472c41594485a853778defc96cebfe6243307f`;
Chromium 153 previously decoded 1,165,824 mono samples at 22,050 Hz with PCM
SHA-256 `8186323537f3a02d1a5a837cf1a7cfde96d64f7b5a1e1f823fdaf4419763a4a4`.

## Implementation boundary

`apps/web/components/g678-nms-l09-p003-candidate-player.tsx` mounts the pinned
`ContinuousSourceStreamClockCandidate` only after an explicit local **Prepare**
button. Its fetch uses the existing exact-SHA, same-origin, no-redirect, no-store,
opt-in Next route and checks response type/size; the clock independently checks
encoded and decoded identity before becoming ready. A second user action starts
sound. No audio autoplays. The clock's synchronous held-frame callback requires
the source frame to be visible before sound starts. During playback, the audio
clock drives the visual frame; pause, candidate-coordinate inspection, Replay,
terminal frame 635, and unmount have separate transport actions. These are
modern inspection controls, **not** a claim that the SWF supports seek.

The visible-commit rollback now forces a new revision even when the prior
frame was already paused, so a failed visible `drawImage` causes an actual
repaint of that old frame rather than merely restoring its DOM identity.
New audio controls and state notices are localized in the ES probe. Original
English source text retains its explicit fallback notice; the embedded audio's
spoken language has not been established.

## Chromium on the real local Next page

All browser observations used the local port-3233 calibration page, not the
modern My Lesson host. The audio route returned 404 without its opt-in. With a
temporary `HELP_MATH_G678_P003_AUDIO_CANDIDATE=1` in the local development
server, it returned 200 and 263,120 bytes. The page progressed from `ready`
to `playing` only after the Start click. Instrumenting
`AudioBufferSourceNode.start` in that browser session recorded one new source
node after the initial Start and another after explicit Replay; preparation
alone did not start sound.

- EN during playback: audio frame, committed frame, and visible frame all read
  203 with no page alert. Pause held frame 522 unchanged across a 400 ms check.
  Candidate inspection reached frame 615 with the `5 + 3 ×` semantic reveal;
  Replay cleared that late reveal and restarted audio/visual playback at the
  beginning. Resuming from frame 574 reached audio/committed/visible frame 635
  with mode `ended` and no alert.
- EN failure injection from a paused frame 574: a one-shot visible-Canvas
  `drawImage` exception during Start produced `source-frame-not-committed`.
  The page stayed paused at frame 574, `ready` visual status returned, all
  480,000 stage pixels remained nontransparent after the forced rollback
  repaint, and the audio-node start count stayed at two. Sound did not start
  over the failed picture.
- ES final-code rerun: the Spanish source-audio controls and explicit
  English-text fallback were visible. During playback, audio/committed/visible
  frames all read 238 with no alert. After pausing and inspecting frame 615,
  all three frame markers read 615 and the mathematical reveal was present.

The lone browser console error in the first session was the expected 404 from
the explicit default-deny test; the later positive session did not add a new
unexpected console error. Both browser sessions were closed. The temporary
environment file was changed to explicit `0`, then removed; a valid live
request returned 404 both before and after removal. No opt-in file remains.

## Checks and independent gates

The 57 focused source/bridge/text/audio-transport/clock/access tests passed;
the three source-bound server tests passed with Node's `react-server` condition.
The real-source extractor `--check` and Web TypeScript check passed. A
production build, actual My Lesson host lifecycle, complete audio/visual
capture manifests, original-runtime behavior/timing and named-human listening,
responsive/accessibility matrix, human/Owner decisions, strict completion,
release, and publication remain open. A machine-observed audio node and frame
agreement are not proof that a person heard the correct original-runtime cue.
