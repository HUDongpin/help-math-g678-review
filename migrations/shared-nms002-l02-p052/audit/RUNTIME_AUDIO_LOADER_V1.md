# P052 runtime audio loader candidate

Source: L2TI11.swf, SHA-256
`5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
Unregistered engineering candidate; no change to any acceptance gate.

`scripts/generate-nms-l02-p052-runtime-audio-v1.mjs` verifies the actual and
preserved SWF, existing audio-plan/window implementation hashes, six complete
MP3/PCM bindings, PCM partition integrity and ten source-derived cue windows.
It emits the compact browser module with exclusive creation and exact readback;
`--check` never writes. No archive, old audit or generated output was hand edited.

Maintained runtime code:
- `nms-l02-p052-audio-pcm-v1.ts`: complete decoded stream preparation.
- `nms-l02-p052-audio-loader-v1.ts`: local-only same-origin fetch, redirect denial,
  exact response URL/MIME/length and bounded body, SHA-256, whole MP3 decode at
  22050 Hz, mono/length verification, per-context successful-buffer cache.
- Existing `nms-l02-p052-audio-session-v1.ts`: sample-window playback ownership.

The main frame102 source sample-count discrepancy remains 576 samples; the
runtime plan adds zero replacement samples. Device-rate playback may resample
the prepared AudioBuffer but source decoding and cue offsets stay at 22050 Hz.
No byte-fragment decoder or source-tail truncation is introduced.

On 2026-09-23: generator creation and --check PASS; six new loader/PCM tests PASS;
combined P052 suite 80 PASS, zero failures; targeted strict TypeScript PASS.
Tests use actual MP3 and decoded PCM fixtures with mocked fetch/Web Audio.
They prove source-byte validation, PCM preservation, bounded error behavior and
cancel/cache logic, not actual browser codec parity or listening acceptance.

The URL contract is reserved for the later fail-closed local server route;
that route is NOT created or opened by this change. No page/controller hookup,
build, browser listening, original-runtime comparison, registration, human/Owner
review or strict completion is claimed. Controller integration must create the
loader once per page, preserve narration vs click ownership, and join visual
and audio completion rather than advancing the lesson from audio alone.
