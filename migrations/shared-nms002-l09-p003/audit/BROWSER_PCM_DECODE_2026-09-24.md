# P003 browser PCM decode candidate — 2026-09-24

This receipt is a Chromium decoder measurement for the unregistered P003
candidate. It is **not** the actual Next audio route, a synchronized playback
test, original-runtime listening, or audio acceptance.

## Input and method

- Input: the frozen `work/g678-shared-page-factory/g678-nms-l09-p003-source-audio-v1/source-stream.mp3`, 263,120 bytes, SHA-256 `a8ca1683d3f7848f16f9be96e3472c41594485a853778defc96cebfe6243307f`. The exact bytes were checked before the temporary read-only server bound to `127.0.0.1:3234`.
- Browser: Playwright CLI isolated session `p003-audio`, Chromium `153.0.8010.54` on macOS, observed 2026-09-23 around 15:56 UTC (23:56 Asia/Taipei). The page was a minimal loopback decode probe, not the HELP Math host. The browser and temporary server were closed after measurement.
- Browser fetched `/source-stream.mp3`, checked the encoded SHA-256 with Web Crypto, then decoded a clone via `OfflineAudioContext(1, 1165824, 22050)`. A second independent decode used `AudioContext({sampleRate: 22050, latencyHint: 'interactive'})`. Both hashed the mono `Float32Array` channel bytes with Web Crypto.

## Observed result

| Measure | Chromium result |
| --- | --- |
| HTTP / MIME | `200` / `audio/mpeg` from the temporary loopback service |
| Encoded bytes / SHA-256 | `263120` / `a8ca1683d3f7848f16f9be96e3472c41594485a853778defc96cebfe6243307f` |
| Decoded sample rate / channels | `22050 Hz` / `1` |
| Decoded samples / PCM bytes | `1165824` / `4663296` |
| Duration | `52.87183673469388 s` |
| Chromium float32 PCM SHA-256 | `8186323537f3a02d1a5a837cf1a7cfde96d64f7b5a1e1f823fdaf4419763a4a4` |

The Chromium PCM hash differs from the FFmpeg whole-stream PCM hash
`1c0612cab206ae83ff9e80c7e4f4b7f3b3e248d15d93840a1`; the encoded bytes,
sample count, rate and channels agree. The maintained local
`shared-nms002-l09-p003-audio-plan.ts` therefore pins the measured Chromium
PCM identity for the existing browser transport. It does not assume the
decoders are bit-identical or generalize this pin to other Chromium builds.

The probe had one console error for an absent `/favicon.ico`; the MP3 request
and both decodes succeeded. No native sound was started and no person listened.
The existing Next development server still lacks the P003 opt-in, so its
audio route remains 404 by default. Positive Next browser delivery and
pause/seek/Replay synchronization in the local page remain open.
The current React drawing candidate commits through layout effects, while
`ContinuousSourceStreamClockCandidate` requires a synchronous confirmed
picture commit before native sound starts. The audio plan is deliberately not
connected to that page until this ordering can be verified in the mounted host.

## Candidate timing, not accepted alignment

The source stream starts at main `sprite-246` frame 1. The SWF stream head
declares 1,673 latency samples; the browser decoded 1,165,824 samples at
22,050 Hz. After the declared latency, the sample span is about 52.79596 s;
the start of frame 635 is `(635 - 1) / 12 = 52.83333 s`, a difference below
one 12-fps frame. This is a structural plausibility check, not proof of the
Flash player's buffer timing, audible start, or synchronized frame 635 stop.

Focused validation after writing the plan: 36/36 existing transport/clock plus
P003 plan tests passed; an isolated TypeScript check of the new plan and test
passed. Full demos typecheck and a production build were not run in this
decoder-only slice, and the browser probe did not validate native sound output.
