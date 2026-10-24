# P006 private audio-host integration — 2026-09-27

Status: concrete unregistered implementation, not original-runtime or listening acceptance. Continues AUDIO_HOST_CANDIDATE_SPEC_2026-09-26.md. Official coverage remains 480/2,282; no registration added.

## Implementation and immutable bindings

Two GPT-6 Sol xhigh agents implemented the disjoint transport/schedule and server/route slices. Main agent inspected them, integrated the P006 host, fixed integration failures, and ran independent tests and browser checks.

- Host `apps/web/components/g678-alg-l12-p006-host-lesson.tsx`: SHA-256 `7d76a70060a533a4c7355983a1e6b4fb4570a37f6ab7dd559a77f0d17b9d21a9`.
- Schedule `packages/demos/src/alg-l12-p006-audio-schedule.ts`: `d2eab6035ad3b241657bc3f83037989df56345a35202a51910a53ed8789780d9`.
- Transport `packages/demos/src/alg-l12-p006-audio-transport.ts`: `21bb631484397e8d812eda90a2958f323d8d93261cc1b4b374f31902b17110c2`.
- Audio route `apps/web/app/flash-assets/g678-local/shared-alg001-l12-p006/source-audio/route.ts`: `a267374378dad46b6175ff8714b80f7ee26acf93b8cfe3bb8723ce92a4b5086b`.
- Registry remains `b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`; frozen base host remains `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`. v5 host generation check passes without regeneration or base changes.

AudioContext time now drives P006 visual frames. Explicit Play/Replay starts the two candidate runs; loading does not autoplay. Host volume controls the gain. Pause, inspector seek, glossary entry, navigation and unmount stop current/future nodes and invalidate pending resume. The full tail runs to timeline sample 628,224 while frame 342 holds. The exact source MP3 is delivered only through the local opt-in route with hash/source/receipt checks.

## Failures found and corrected

- Initial transport tests incorrectly expected frame 4 at sample 5,512 (boundary is 5,512.5) and exact integer reconstruction of a floating time coordinate. Corrected test expectations; freeze is checked against the captured paused sample. Runtime mapping was not rounded to hide this.
- First production build failed on an inferred union in the negative-header test. Added explicit `Array<Record<string,string>>` typing.
- First actual browser audio fetch returned 404: Next's Request.url used localhost, but Host/Referer used 127.0.0.1. The route now binds Referer/Origin to the exact validated browser Host and requires the normalized URL port to match. Forwarded Host must equal Host. Tests include normalized URL success and cross-origin/port denial. Shared preview policy/proxy was not changed. Temporary diagnostic logging was removed.
- Earlier failing request logs remain; no claim that the complete historical session is error-free.

## Verification

- P006 decoder/index/schedule/transport: 19/19 tests passed independently.
- Audio route/reader plus inherited 52-page probe descriptor: 8/8 passed.
- Focused ESLint passed. Final build (exec 98304) passed compilation, TypeScript, 250/250 static pages, build traces and 11 production asset checks. Prior build 10467 failed as recorded; 52019 preceded the final origin correction and is not the final artifact.
- Final-build local production port 43216 denied EN page, ES page, exact-hash audio and exact-hash Canvas (all 404). Bounded scan of production static chunks found none of `continuous-two-run-v1`, `628224`, `P006_AUDIO_CONTEXT_RATE`. This is not remote deployment evidence.
- PCM regeneration/check passed with physical source hashes and full sample output unchanged.

## Browser observations

Playwright CLI session `p006-audio-host-20260926`; local dev 43218; Chromium; reduced motion enabled. Instrumentation recorded contexts, gain and buffer-node start/stop/disconnect without altering scheduling. Playback checks used the real host Mute control (gain 0), so this is machine lifecycle evidence, not audible listening.

EN desktop 1440x1000:

- Ready at frame 1/sample 0, no source starts. Development Strict Mode's abandoned context closed; one owned context remained.
- Explicit Play advanced to frame 15/sample approximately 26,752. Pause held sample 27,648 across 250ms with zero live nodes; resume advanced to approximately 33,792 and created only the remaining run.
- Inspector frame 332 mapped to 608,212.5 and stopped audio. Continue then Inequality opened at frame 338/sample 620,628.5; modal entry removed live nodes. Tab stayed inside, Escape restored initiating focus, close held exact sample and stayed paused. Scoped final flow had no warnings/errors.
- Frame 342 inspector maps to 626,587.5. One immediate DOM read still saw the preceding React frame while its sample had updated; subsequent settled read was frame 342. Continue scheduled the exact 1,636.5-sample tail (0.07421768707482994 seconds), ending at 628,224 with zero live nodes.
- Enter Replay reset to frame 1 and a complete uninterrupted candidate run reached frame 342/sample 628,224 with zero live nodes and host Play restored. Both source spans were scheduled from one anchor.
- Next while playing closed every owned P006 context and left zero nodes. Previous returned to paused frame 1/sample 0. A generic dialog count of one was subsequently inspected: hidden Course overview, not a glossary; no visible leftover glossary demonstrated.

ES narrow 320x900, continued on 2026-09-27:

- Space Replay advanced to frame 7 after about 500ms with gain 0. Inspector End settled at frame 342/sample 626,587.5 paused.
- Coordenada, Gráfico, Ecuación and Desigualdad each passed Enter opening, Tab containment, Escape closing, exact trigger-focus restoration and zero live audio nodes.
- Document scroll width and viewport both 320. Screenshot `output/playwright/p006-audio-host-20260927-v1/es-mobile342.png`, SHA-256 `58aa7ed3aa19eee82792a7f7a07783d0c83b55e555e4f0972a2424927bf9defe`, visually inspected. Source drawing text remains tiny at this scale and the capture shows a skip-link overlay; no broad mobile teaching-readability acceptance is claimed.
- Injected 404 for only this audio request: ready=false, frame=1, zero starts/live nodes, both contexts closed, visible Spanish unavailable alert. Clicking Play did not bypass failure. Expected error retained. This fault was browser interception, not a source mutation.

## Remaining work

Scheduling is explicitly candidate: source empty frame 4 does not prove audible silence, source seek increments differ from the continuous visual grid, and original terminal audio-cutoff semantics remain unknown. Audio language/separate SA purpose, actual audible listening, source-host natural trace, visual fidelity, Spanish drawing, mobile teaching readability, human/Owner decisions and strict/publication gates remain open. AudioContext suspension/interruption, rapid real-browser resume cancellation and audio-load navigation races deserve additional integration probes beyond current fake-context tests. Do not promote this page merely because the build passed.

All source archives preserved. No provider access, credentials, commit/push, deployment, publication or registry modification.
