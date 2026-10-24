# DAT001 L2 P002 local source-audio candidate QA — 2026-09-25

This receipt covers a **local engineering candidate only**. The placement
`shared-dat001-l02-p002` remains unregistered. Neither browser playback nor
the provisional media clock proves original Flash synchronization, spoken
language, listening acceptance, human/Owner review, strict completion, or
publication.

## Source and implementation

- Physical SWF SHA-256:
  `b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.
- Whole decoded WAV SHA-256:
  `dc8fc07f7066b76e781bab37cb09f5232bb3f3ac98c8690104d8acf1dcee9f8c`,
  1,012,686 bytes, 506,304 mono samples at 22,050 Hz, 22.961633 seconds.
- The exact loopback-only route is
  `/flash-assets/g678-local/shared-dat001-l02-p002/source-audio.wav?sha256=<WAV SHA-256>`.
  The route rehashes the physical SWF and decoded WAV before serving, checks
  the candidate-page referer and same-origin media request, permits byte
  ranges, and returns `noindex` plus private no-store headers.
- The local viewer derives provisional frames from `audio.currentTime` at 12
  fps. The source parent is 276 frames/23 seconds; the 38.367 ms difference
  and initial Flash MP3 latency are not resolved as an original-host offset.
  The candidate explicitly warns that synchronization is unverified.

## Checks observed

- Source audio `--check` passed; three Python extraction regression tests
  passed. Two access/proxy and three source-loader tests passed. The complete
  `apps/web` TypeScript check passed with an 8 GB Node heap. The default 4 GB
  heap failed by memory exhaustion; that was a validation-resource limit, not
  a TypeScript diagnostic.
- In webpack-mode local development, the EN candidate page returned 200;
  source WAV GET returned 200/1,012,686 bytes and a 0–1023 byte Range request
  returned 206/1,024 bytes. A cross-site media request returned 404.
- Real Chromium loaded the audio with a 206 media request and reported
  `duration=22.961633`, `readyState=4`. Play advanced the audio and frame
  counter (e.g. time 4.161832 seconds, frame 50); Pause stopped the media
  (time 12.843006 seconds, frame 155). Keyboard End sought to frame 276 at
  22.916666 seconds while paused. Replay set time 0, frame 1, and incremented
  the replay counter to 1. The browser console had zero errors and warnings.
- After moving the audio URL to the local server page, a second Chromium run
  still loaded the WAV by 206 and advanced time/frame (2.814445 seconds,
  frame 34). Browser console errors/warnings remained zero. The webpack
  development server separately emitted one Gzip `MaxListenersExceededWarning`
  while streaming the large candidate page; candidate payload/performance
  remains an open engineering issue, not a browser-console success claim.
- The Spanish 320px page showed its explicit source-English/sync caveat,
  loaded the audio, played it (e.g. time 2.635253 seconds, frame 32), and had
  `scrollWidth=clientWidth=320`. The original English teaching text remains
  too small for accepted responsive instructional presentation.
- An optimized production webpack build and its 11 deployment asset tests
  passed. In the production server EN and ES candidate pages and the WAV
  route each returned 404; `/en` returned 200. The public `.next/static`
  scan found no WAV SHA, physical SWF SHA, decoded-WAV path, or P002 display-IR
  marker. An initial build had exposed the WAV SHA in a client URL constant;
  the candidate now receives that URL from its local-only server page, and
  the post-fix build passed the scan. Both observations are retained here.

## Still open

The provisional media clock maps decoded seconds to parent frames, not
verified original-host sound-block start/seek semantics. Parent Stop, child
MovieClip progression, font/readable teaching text, source-language review,
actual My Lesson admission, original-runtime natural trace, visual fidelity,
named-human audio listening, and all later gates remain pending. Keep this
page out of the Current-JS registry until the product-admission path passes.
