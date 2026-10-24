# P003 visible-frame commit and Next audio-route probe — 2026-09-24

This is an unregistered local engineering candidate, not My Lesson admission,
sound playback, original-runtime comparison, or audio acceptance. The source is
`G6-G8-shared/NMS002/L9/RW/L9RW03.swf` at the real AWS source root, 473,410
bytes, SHA-256 `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
The embedded MP3 is one 263,120-byte stream, SHA-256
`a8ca1683d3f7848f16f9be96e3472c41594485a853778defc96cebfe6243307f`.

## Visible-frame boundary

The private React candidate now reports a frame only after the detached
800×600 drawing has been copied into the visible Canvas. The local host uses a
synchronous commit for its manual pause/resume, Replay, and frame slider,
checking the callback's frame/revision and the ready DOM frame before accepting
the operation. If drawing does not commit, it restores the previous paused
frame and exposes an alert. This is a prerequisite for, **not** an integration
with, the continuous audio clock; silent automatic playback is still separate.

On the local Next server at `127.0.0.1:3233`, Chromium verified:

- EN pause at frame 283: committed frame and visible frame both 283, ready
  status, nonblank Canvas sample, and no alert.
- Replay: the first observed committed/visible pair was frame 1, then frames
  2–6 in sequence. A paused slider change to frame 615 committed visible frame
  615 with the `5 + 3 ×` semantic reveal and source row emphasis.
- ES: the explicit English-source fallback remained visible; a slider change
  to frame 615 committed visible frame 615, ready, without an alert.
- A browser-only, one-shot `drawImage` failure on the visible Canvas during
  Replay held the prior frame 308. The committed and visible DOM frames were
  both 308, status returned to ready, the host was paused (`Resume`), and the
  user-facing commit-error alert was present. No audio was started. The
  injected browser session was closed after this observation.

## Exact local audio route

The Next route was temporarily enabled only in the local development server
with `HELP_MATH_G678_P003_AUDIO_CANDIDATE=1`. An actual same-origin fetch from
the EN P003 calibration page returned 200 `audio/mpeg`, no redirect, and
263,120 encoded bytes with the source MP3 SHA-256 above. Chromium 153 decoded
that response through `AudioContext` to mono 22,050 Hz, 1,165,824 samples,
PCM SHA-256 `8186323537f3a02d1a5a837cf1a7cfde96d64f7b5a1e1f823fdaf4419763a4a4`.
Wrong-SHA and Range requests returned 404. The temporary env file was
removed; after confirming an explicit `0` and removing the file, the live
route again returned 404 to the otherwise valid request. The file is absent.
The exact extractor `--check` still passed against the real source root.

Focused non-server P003 tests passed 22/22. The three source-bound server
tests passed separately with Node's required `react-server` condition; a
combined command without that condition failed on the `server-only` import,
not a P003 assertion. The Web typecheck passed with an 8 GB Node heap. The
isolated demos TypeScript check passed when its existing CSS module declaration
was included; omitting that declaration had produced TS2882 on the stylesheet
import. The broader demos package typecheck remains separately red from the
pre-existing P044/P046/P054 test errors recorded in the handoff.

## Still open

The P003 host still says audio is disabled and has not fetched, played, paused,
resumed, sought, or listened to sound as a mounted page. The candidate has no
registered Current-JS renderer or actual My Lesson flow. This receipt makes
no claim of source timing/fidelity, responsive or human acceptance, Owner
approval, strict completion, release, or publication.
