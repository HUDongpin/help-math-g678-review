# P011 My Lesson local admission — 2026-09-26

## Exact page and parallel work

`shared-alg001-l12-p011`, ALG001 L12 global page 11 / VB page 5, is now in the
private local-only registry. Three GPT-6 Sol / xhigh workers handled the P011
server integration, independent candidate review, and P002 candidate in
disjoint paths. A subsequent independent review checked the P011-specific
focus adapter. The main agent inspected changes, addressed review findings,
performed registry integration, and ran the checks below.

The source-catalog/registry intersection is 477/2,282 = 20.9027%, with 1,805
placements remaining. P011 adds one placement; P002 adds zero. This is
Current-JS registration coverage, not the full goal's strict completion rate.
The P011 descriptor retains P001 and its predecessors and exposes 16/52 L12
pages in source order. Twenty-six existing glossary definitions are retained;
source-bound Origin and Intersect bring the descriptor glossary to 28 entries.

Runtime: 884,739 bytes, SHA-256
`70bab6fd85db2afa782f987a241aef0abbf6deb5b98bffcca1146b440c541031`.
Final freeze: 5,609 bytes, SHA-256
`6413840580ea9a52b2291761a98046dcbe9e0ae5cd45956be43e7f6ab90a87d4`.
The freeze also pins the local focus adapter (2,379 bytes,
`19586734ece230b54cf64ae66830bbac15f93d6463dc1bdddd42dd172c30e7c4`).

## Main-agent verification

- Source/SSR controls: 2/2 passed; source character IDs, six KeyAttributes and
  exact frame 8/78 visibility boundaries in both UI languages.
- Final-runtime safety mutation tests: 2/2 passed; page-specific final check
  intentionally allows the fresh surface and mask Canvas, and reruns the
  shared forbidden primitive families after wrapper insertion.
- Registry contract tests: 4/4 passed; generated registry check passed.
- P001/P011 server integration tests: 5/5 passed after final freeze update.
- Glossary pause and runtime capability regression tests: 9/9 passed.
- Real Chrome My Lesson E2E: 3/3 passed in 49.1 seconds. Both EN and ES tested
  all six source buttons, source-hash-bearing glossary definitions, close and
  focus return, 390px/320px overflow checks, and reduced-motion Replay reset.
  The live test verified modal pause, resume to frame 118, next page, cleanup,
  and return navigation. Keyboard activation was code-reviewed, not separately
  exercised in the browser. Spanish host/glossary checks do not establish
  Spanish animation-content or narration acceptance.
- Full demos and full web TypeScript checks passed; the final local adapter
  also passed the subsequent production build's full TypeScript phase.
- New local adapter, route and browser test ESLint: passed.
- Wrong-hash asset request: 404. Production-negative check is tracked below.
- Runtime loaded inside My Lesson: 118 scratch-surface draw requests, p95
  5.2 ms, maximum 13.5 ms, none over the 83.33 ms frame budget. This excludes
  compositor delivery and is not a long-term memory or dropped-frame audit.

## Failures preserved as findings, not hidden successes

Initial browser setup used two Playwright installations and lacked its bundled
headless browser. The test now invokes the workspace's own test runner and
installed Chrome. Test selectors were corrected to identify the outer player.
Arbitrary seek is intentionally disabled; reduced motion holds frame 1. The
final tests exercise these actual contracts rather than enabling a bypass.

The browser found missing glossary focus return. Directly changing the shared
host caused the predecessor hash guard to fail closed (404). The main agent
reverted only its own shared-host delta, restored the exact 52,078-byte host
SHA-256 `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`,
and implemented a P011-only client boundary. It observes the real dialog's
removal and restores only a connected trigger belonging to the same page.
No shared hash verifier or frozen historical manifest was weakened.

Three existing source-text assertions in
`apps/web/tests/descriptor-driven-whole-lesson-player.test.ts` still fail after
the shared host was restored: the old `audioEnabled` dependency spelling, a
CSS no-media assertion, and an old direct `<AnimationRuntime>` source shape.
That file reports 7/10, not all-pass. Those failures concern unchanged shared
source and CSS contracts; this task did not rewrite them to make them pass.

## Production and remaining gates

Production asset isolation/publication preflight: 11/11 passed. The final
`NODE_OPTIONS='--max-old-space-size=8192' npm run build -w apps/web` exited 0,
including compilation, full TypeScript and 240 static pages. A local production
server on 127.0.0.1:3130 was started with the source root and preview opt-in
still set: both EN/ES P011 routes and the exact-hash Canvas asset returned 404.
These are local production-mode checks, not a deployment or publication.

Original runtime, full fidelity, embedded/external audio synchronization and
listening, human/Owner review, strict completion, lesson publication, and
production release remain unaccepted. No remote deployment was performed.
P002 is preserved separately as an unregistered composed candidate; see its
`CANDIDATE_QA_2026-09-26.md` and `MAIN_REVIEW_2026-09-26.md` for the next step.
