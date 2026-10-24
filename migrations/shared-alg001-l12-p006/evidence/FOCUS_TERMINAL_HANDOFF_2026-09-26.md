# P006 focus and terminal playback successor — 2026-09-26

Status: unregistered local candidate. Official coverage remains 480/2,282 (21.03418%); 1,802 remain. This report succeeds HOST_POLICY_FIX_2026-09-26.md without rewriting its historical failures.

## Bounded implementation

- P006 releases the initiating focus only after the glossary request is accepted, before the host hides the background. Denied requests retain focus.
- A P006-only document key handler contains Tab/Shift+Tab within the exact active glossary dialog and routes Escape through the existing close request. Cleanup removes the listener and observer; existing trigger-focus restoration is retained.
- Reproduced terminal mismatch: at frame 342 the local clock was paused while the host displayed Pause after Continue. P006 now acknowledges actual paused state. A private boolean-only resolver preserves legacy void-adapter behavior.
- Reproducible v5 host generation pins the unchanged v4 input; only P006 consumes v5. No generated output was hand-edited. v5: 53,986 bytes, SHA-256 `8667bc039fed49a01ab949768a32648070fd58ba2ad664133aeb4a73862c0525`.
- A GPT-6 Sol xhigh agent independently reviewed navigation cleanup read-only. The main agent performed integration and browser checks. The review did not establish original Flash behavior.

## Checks and limitations

- Complete final production build passed: TypeScript, 250 static pages, build traces and 11 production asset checks. Earlier interrupted build is not counted.
- Private glossary/playback tests 4/4 passed; descriptor/playback combined check 6/6 passed. Scoped ESLint passed. v3/v4/v5 generator checks passed.
- Browser session `p006-focus-20260926`, loopback development port 43218, Chromium, reduced motion enabled. EN and ES four-term keyboard checks each passed Enter opening, focused dialog, Tab/Shift+Tab containment, Escape closing and exact trigger-focus restoration. Each bounded final console listener recorded zero warning/error messages. Historical session logs retain transient missing-v5 HMR errors from before generation; the entire historical log is not error-free.
- Terminal Continue at frame 342 now leaves runtime paused, zero host Pause buttons and one host Play button. Replay resets to frame 1 and advances to frame 7 after approximately 500ms.
- Normal Next leaves P006 with no P006 runtime or dialog; Previous returns to paused frame 1. Attempted pointer Next while the glossary was open timed out because the modal intercepted the pointer. This does NOT prove navigation-while-modal cleanup. No forced click was substituted.
- `output/playwright/p006-focus-terminal-20260926-v1/en-tablet-dialog.png` was captured at a 1024x900 viewport and visually inspected. It shows a readable glossary overlay; the full-page capture is not a complete native-stage, scroll-position or responsive acceptance matrix.
- Final-build local production server on 43216 returned 404 for both EN and ES P006 routes and the exact-hash Canvas asset. This is local production-mode isolation evidence, not remote deployment evidence.
- A transient npx cache ENOSPC occurred. Cached CLI use with npm_config_offline=true resumed checks; no source, cache or evidence was deleted.

## Preserved boundaries and next work

Registry SHA-256 remains `b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`. Frozen base host remains `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`. Unrelated dirty work is retained.

P006 has no accepted audio playback or original natural trace. The extracted 340-block stream, audio offset/clock mapping, separate SA trigger/language disposition and listening remain open. English drawing in the ES host is explicitly fallback, not translation acceptance. Source-faithful modal resume, fidelity, human/Owner acceptance, strict completion and publication remain independent and unaccepted. Do not register P006 to inflate progress.

Continue from the P006 source/audio evidence and maintained transport, not a fresh scaffold. Keep P005 and all other unfinished pages in the full goal; this successor does not redefine the goal to P006. No provider, commit, push or publication action occurred.
