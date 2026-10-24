# P006 candidate audio interruption repair — 2026-09-27

Continues AUDIO_HOST_VERIFICATION_2026-09-27.md. Unregistered candidate only; official coverage remains 480/2,282. No source, registry, frozen shared host, provider or publication changes.

## Change

The transport previously treated a non-null context-time anchor as playing even when an external AudioContext suspension had stopped its clock. It could also return success from Play without resuming that context. The transport now reconciles non-running context state through a statechange listener and synchronously in snapshot/Play, freezes the exact cursor and stops scheduled sources. A running statechange does not restart playback. A pending explicit resume without an anchor is not cancelled by this listener. Close removes it.

The private P006 host now reports interruption as paused to its parent; only an actual ended phase emits playback completion. Main implemented runtime/host changes; a GPT-6 Sol xhigh sidecar implemented disjoint regression tests, independently rerun by main below.

Current SHA-256:

- Transport: `692be07b5b98cb0bcc72c8f4371b040e616da0300002e5aa6e720042cc76d88a`.
- P006 host: `82b841fcd80fd0f3bf9b87ab12b69373a4e59cfa1c4684e898db31691eeebb5f`.
- Registry unchanged: `b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.
- Frozen base host unchanged: `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`.

## Actual browser checks

Playwright CLI session `p006-interruption`, Chromium, EN private route on local dev 43218, reduced motion. Instrumentation retained created AudioContexts; it did not alter scheduling for the interruption check. Real host Mute was used, so no listening acceptance is claimed.

1. Play, then invoke the owned real context's suspend(). UI became paused at sample `7295.999999999983`. Explicitly resume only the context, wait 300ms: UI remains paused at precisely the same sample, with one Play animation button. Clicking that button advances to sample `16000.000000000124` and playing. Then pause normally.
2. For a distinct cancellation fault injection, delay the context's resume promise, click Play then Pause, and release the delayed real resume. Before and after 200ms, phase remains paused at sample `17152.000000000135`, with one Play animation button. This is a controlled delayed-resume case, not a naturally occurring browser delay.

Browser and dev server were closed after verification. The initial page.goto load wait timed out at 30s while development compilation/loading continued; subsequent snapshots and checks used the loaded page. Console contained development/HMR messages, not an audio fetch error.

## Checks and limitations

- Transport-only TypeScript check passed (ES2022, DOM, bundler module resolution, skipLibCheck).
- P006 host ESLint passed from apps/web. The initial root invocation lacked an ESLint config; a demos-file argument from web was outside its base path and ignored, not linted.
- Private v5 host generator --check passed without regeneration; base unchanged.
- Full `npm run typecheck:demos` reached tsc after registry check, then aborted at the default approximately 4GB Node heap limit. Full typecheck and following typography check are not claimed passed. No broad memory-limit or compiler configuration change was made.
- An intermediate audio test invocation before the sidecar updated FakeContext failed eight tests because that old fake lacked addEventListener. The completed test rerun is recorded separately below.
- Final independent decoder/index/schedule/transport test rerun: 25 passed, zero failed/skipped. Six added regression tests cover event-driven and delayed-event suspension, exact-offset explicit restart, legitimate pending resume, stale successful resume and listener disposal. Main inspected the test additions.
- Audio route/reader and 52-page host-probe descriptor suite: 8 passed, zero failed/skipped.

Original audio timing/empty-frame semantics, terminal semantics, language/separate SA, audible listening, Spanish drawing and small-screen teaching readability remain open. This repair does not establish original runtime fidelity, human/Owner acceptance, strict completion or registration. Next bounded work should address the candidate source-timing contract and remaining admission blockers, not repeat already-passed lifecycle checks without a new change.
