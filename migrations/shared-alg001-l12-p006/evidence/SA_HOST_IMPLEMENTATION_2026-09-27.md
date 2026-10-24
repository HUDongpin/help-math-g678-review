# P006 optional Spanish Audio implementation — 2026-09-27

This is a bounded implementation step inside the active full G6–G8 migration
goal. The session goal was inspected and was already active with that full
objective. No original-task application state transfer is claimed. Work was
performed in `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`; existing
dirty/untracked work and physical sources were preserved.

## Maintained behavior

`packages/demos/src/alg-l12-p006-spanish-audio.ts` owns a separate lazy 48 kHz
AudioContext, gain and buffer source. Construction does not fetch or play audio.
Only an explicit SA Play calls resume within user activation and requests the
existing same-origin exact-SHA route. It checks the full 214,704-byte MP3 hash
`86fdbdeb0fec8cd6b9682d75ec436e4db370d56ba23e48efc47cf00c374c64bf`
before decoding a private copy. Audio language/listening remains unverified.

`apps/web/components/g678-alg-l12-p006-host-lesson.tsx` now provides optional EN/ES
SA Play-from-start, Pause and Return-to-animation controls in the existing
external interaction companion. It pauses the embedded transport immediately
and preserves its exact cursor. SA is never appended to that transport and ES
locale never triggers SA loading or playback. Main continuous-stream-v2 remains
one span with no invented frame-4 gap.

SA Pause cancels a pending request or stops its node. A subsequent explicit SA
Play restarts at zero. This is a documented source-informed candidate choice
based on the source SA_PLAY handler's lack of a saved offset; it does not claim
original-runtime resume parity. The UI states this behavior. Natural SA end or
explicit Return releases its buffer and resumes the retained nonterminal main
cursor. The page is RW, not a quiz. At main frame 342 Return leaves it ended and
adds no main source. SA interruption pauses; a context-only resume does not
autoplay. SA failure leaves main paused and offers retry/return.

Generation tokens and AbortController cancel stale loading, digest/decode and
resume results. Replay, frame inspection and navigation cancel SA. Unmount
closes its context and removes its listener. Only a natural live source end may
request Return. Glossary cannot open during selected SA; ordinary glossary
entry remains independent and never starts SA. Volume/mute affects both owned
gains. Existing generated/frozen hosts were not edited.

## Independent verification

GPT-6 Sol xhigh workers had disjoint writes: controller plus tests, resource
recheck report, and later inactive admission preparation. Main inspected the
actual code, integrated the host and independently ran the checks below.

- New SA deterministic suite: 13/13 passed. Covers no autoplay, activation
  ordering, zero-offset restart, natural-end-only notification, stale load/decode/
  resume success and rejection, interruption, errors, volume, exact source hash
  and disposal. Strict targeted TypeScript passed with explicit Node types.
- Unchanged continuous embedded audio suite: 25/25 passed. The schedule and
  transport hashes match the handoff; no two-run/gap restoration occurred.
- Existing source-audio, SA reader/routes and probe descriptor: 12/12 passed.
- Glossary state/hit, host readiness and visual clock: 17/17 passed.
- Host scoped ESLint passed. The host seek effect explicitly synchronizes a
  parent inspector command with both external transports and their UI state.
- Private v5 generated-host `--check` passed with no regeneration; source base
  was unchanged.

The first targeted TypeScript command omitted `--types node`, producing missing
Node-type diagnostics for the test file; the corrected strict invocation passed.
This is not a claimed full demos typecheck. Build/postflight results are recorded
below after completion.

## Actual browser observations

Playwright CLI session `p006-sa-20260927`, Chromium, reduced motion, loopback dev
43218. Main used actual host Mute/Silenciar controls; no listening acceptance is
claimed. Instrumentation recorded real AudioContext and buffer-source starts,
stops and ends without substituting scheduling. The retained outputs are under
`output/playwright/p006-sa-20260927-v1/`.

EN 1440×1000:

- Initial main preload created no source starts and no SA context. Explicit main
  Play followed by SA froze the main sample across the measured wait and left
  only SA live. Pause/restart created SA starts at offset 0; Return resumed main
  at its retained offset. All nodes stopped after host Pause.
- Natural SA completion at retained main sample 21248.000000000025 returned to
  main, which advanced to 25216.000000000036 before Pause. This was the actual
  full decoded SA playback duration, not an injected early end.
- Inspector frame342 plus SA then Return preserved ended/frame342; main start
  count stayed 3→3 and live nodes stayed 0 (`terminal-return.txt`).
- Delayed SA response plus Return invalidated that request: SA starts stayed
  4→4 after releasing it, phase idle, live nodes0 (`stale-load-return.txt`).
- Browser-injected SA 404 produced a recoverable error while main stayed
  frame342/sample626587.5, live nodes0 (`load-failure.txt`). The alert was then
  refined to identify SA specifically; the main module remains usable.
- Delayed SA response plus Next removed P006 and closed every owned context;
  releasing the old response created no new source (`stale-load-navigation.txt`).

ES 320×900:

- Settled entry was paused frame1/sample0, SA idle, zero SA requests, zero starts
  and no 48kHz context. Document scroll width equaled viewport width320
  (`es-settled-no-autoplay.txt`).
- Space and Enter activated SA; Pause/restart used offset0; Return advanced the
  retained main cursor0→3583.999999999956 (`es-keyboard-sa.txt`).
- Coordinate/Graph/Equation/Inequality controls each passed Enter opening,
  contained Tab focus, Escape close and exact trigger-focus restoration. Main
  stayed sample626587.5, SA idle, live nodes0 (`es-glossary.txt`).
- Suspending the actual SA context paused it. Resuming only that context did
  not add a source. Explicit SA Play then Replay cancelled SA and restarted main
  at frame3 in the measured read (`es-interruption-replay.txt`).
- Next during playing SA removed P006, closed all contexts and left zero live
  nodes (`es-playing-navigation.txt`).
- Screenshot `es-terminal-mobile.png` was visually inspected: no horizontal
  page overflow, controls wrap, but source teaching text is too small for a broad
  readability pass; the preexisting skip-link overlay is visible. This is not
  typography acceptance. Screenshot SHA-256:
  `2a82fa0d5b97d0a414f274b477506a6d127346811a9f330545459d10d4c7e3bf`.

Failures were retained: first startup found an already running original-task
server on43218; its cwd was verified before use. That original task was idle/
interrupted, not assumed transferred. The inherited server later exited, so an
owned server was started. Initial EN navigation and later ES readiness timed out
while webpack compiled; settled checks passed. ES source-audio compilation took
28.3s. There was one deliberately injected 404 plus development/HMR messages;
no claim of an empty historical console. Browser and owned dev server were closed
before production build.

## Registration and typography boundary

Fresh source-manifest/registry intersection remains **480/2,282**, 1,802 remaining;
ALG001 L12 remains19/52. P005/P006 remain absent. A maintained packet preparer and
real-registration descriptor are prepared separately and remain unused by the
current route; no freeze/fragment/runtime packet or registry activation occurred.

The applicable G6–G8 typography implementation rule requires actual source text
binding, native presentation, exact implementation inventory and technical
evidence for new/changed pages. P006 has no binding/check and still renders small
source glyph text. This is an engineering gap, separate from human or listening
acceptance. Do not use the registration preparer to bypass it.

The required typography check ran before any P006 registry change: 422 baseline
backlog entries,59 changed/new registered pages,40 verified,19 issues. P004 itself
has missing typography evidence and therefore serves only as a registry-mechanism
example, not proof of compliance with this rule. P006 is outside the check's
registered scan; that absence is not a pass. The complete result is retained in
`typography-before-admission.json` (npm preamble followed by JSON).

Next complete the source-bound native teaching-text/presentation and its checks,
then review the prepared admission closure against those final files and exercise
the actual admitted host. P005's different source audio groups must be handled
with its own source-specific policy. The full G6–G8 goal remains active.

## Final build, production isolation and prepared-admission checks

- `npm run build` in `apps/web` with an 8 GiB Node heap passed: 11 deployment
  asset checks, webpack compilation, TypeScript, 250 static pages and traces.
  See `production-build.log` in the browser evidence directory above.
- A final web `tsc --project tsconfig.json --noEmit --declarationMap false
  --emitDeclarationOnly false` passed after the last descriptor/test edits.
- The actual built server on loopback port 43216 returned 404 for both P006
  language routes and the source-audio, optional-SA and Canvas asset paths.
  See `production-negative.jsonl`. Searching built static chunks for the SA
  response marker, optional-control text/class and full SA hash returned zero
  matches (`production-marker-matches.txt`). This proves the tested local
  production-default exclusion, not a remote deployment or publication.
- Main independently inspected and reran the packet preparer suite (5/5) and
  descriptor suite (5/5), including pending-typography rejection. Positive cases
  use isolated temporary fixtures, not an actual registration. Scoped lint passed.
- Owned browser/dev/production processes were closed. Build regenerated
  `apps/web/next-env.d.ts` with production type paths; a brief webpack dev start
  regenerated its development paths, restoring the observed pre-task 2-line
  dirty shape. There was no byte backup of this generated file, so exact
  pre-task byte identity is not asserted. The first restoration attempt omitted
  `--webpack` and Turbopack rejected the external node_modules symlink; the
  webpack retry succeeded. This does not invalidate the earlier webpack build.

## Immutable comparison pins at this boundary

| File | SHA-256 |
| --- | --- |
| SA controller | `07f28e9ee9746c53d350960d7207a12fc3de028376e6aba2e2cec73409750b0e` |
| SA tests | `dfa14af843966e96a50c617482927a06cc2a8675fcc1309399f154006d27c9bb` |
| P006 host | `089fb1b3d12cad6bdb1a3d4dd82ac35b5e2611e60b0b1f24bd7a174513a8350b` |
| Embedded schedule | `2ac06a5fde0873b2b4e3e22eab65457f5bdb0bf26f9defafb3aa8f2710596add` |
| Embedded transport | `692be07b5b98cb0bcc72c8f4371b040e616da0300002e5aa6e720042cc76d88a` |
| Registry | `b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9` |
| Frozen base host | `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78` |

No source/archive mutation, provider access, credentials, commit, push, remote
deployment or publication. Original-runtime authority, listening, human visual,
Owner, strict completion and lesson publication remain unaccepted independently
of these engineering checks.
