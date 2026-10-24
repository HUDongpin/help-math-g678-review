# P003 embedded audio: machine audit and local access

Date: 2026-09-23. This is source/decode and local-delivery engineering evidence,
not original-runtime listening, synchronized playback, or audio acceptance.

## Immutable source and decoded-stream boundary

- SWF: `G6-G8-shared/NMS002/L9/RW/L9RW03.swf` under the real AWS Grade-Classified Courseware root; 473,410 bytes; SHA-256 `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
- One MP3 `SoundStreamHead` at `sprite-246` frame 1, exact bytes `0a2a2d078906`. There are 635 sequential `SoundStreamBlock` tags over the 635-frame main domain. Frame 2 is an authored empty block (zero samples/bytes), not a transport split.
- Whole, concatenated encoded stream: 263,120 bytes; SHA-256 `a8ca1683d3f7848f16f9be96e3472c41594485a853778defc96cebfe6243307f`. No silence cutting or re-encoding was used. The 1,165,824 decoded samples at 22,050 Hz mono correspond to about 52.8718 s. FFmpeg decoded the full stream to 4,663,296 float32 PCM bytes, SHA-256 `1c0612cab206ae83ff9e80c7e4f4b7f3b3fdfb711b0bb33b3e248d15d93840a1`.
- The separately catalog-associated lesson-SA `L9RW03.mp3` is 470,400 bytes, SHA-256 `e06a0c05b4de7d2a0dc0383b11726121dd2e635548fb5bb9d9e9062984be0e4e`, and reports 33.6 s. It is not substituted for the embedded stream. Its intended runtime role remains unproven.
- Reproducible, exclusive-write extractor: `scripts/prepare-g678-nms-l09-p003-source-audio-v1.mjs`, SHA-256 `f9111a3c73e0c6677fdd5702971e181ac0c84197fd6a76c16873e7c4475054dd`. Ignored local output under `work/g678-shared-page-factory/g678-nms-l09-p003-source-audio-v1/`; block/decode/tool receipt SHA-256 `f2f5bf5ed05350b0ba9ba09db5dc66c7ba4e4f1be364de437d88ce72d1ec7c6a`. Run `--check` with `HELP_MATH_G678_SOURCE_ROOT` set to the real directory, never the compatibility symlink.

## Bounded local delivery

- Added an exact P003 `embedded-stream.mp3` route. The route requires local loopback Preview, opt-in `HELP_MATH_G678_P003_AUDIO_CANDIDATE=1`, GET, exact SHA query, same-origin CORS fetch from the P003 EN/ES calibration page, and no byte range. The server re-verifies the source SWF, pinned local Canvas runtime and audio bytes. The response is private, no-store, noindex, same-origin, and nosniff. There is no production/Preview or general My Lesson path. The existing proxy's development-only flash-asset fallback reaches the route; its production fallback denies it. `proxy.ts` was deliberately not changed because P047's local audio host successor pins that file byte-for-byte.
- The mounted P003 probe still says audio is disabled. No browser decoder, synchronization clock, pause/seek/replay audio transport, or listening test was added in this slice. The running 127.0.0.1:3233 engineering server has no P003 audio opt-in; an exact-header HTTP request returned 404. This is a default-deny observation, not a positive end-to-end route test.
- Tests: 3/3 edge request-policy tests; 2/2 source-extraction tests with the real source root; 3/3 P003 server binding/response tests, including an in-process 200 response with the exact audio size and a 404 without opt-in. The P047 byte-pinned proxy-successor regression also passed after the proxy edit was withdrawn. Extractor `--check` passed; draft migration validator passed with its explicit schema-only warning; Web `tsc --noEmit` passed with an 8 GB Node heap. These do not prove actual browser fetch/decode or human listening.

## Open gates

Determine browser decoder PCM behavior and implement a source-frame-bound audio
transport with pause, seek, Replay and terminal stop. Check it in the mounted
local probe, then in the actual My Lesson host after exact registration. Capture
authoritative original-runtime listening and source/video/audio synchronization,
EN/ES behavior, and human/Owner review independently. No fidelity, audio,
Current-JS registration, strict completion, release, or publication is accepted.
