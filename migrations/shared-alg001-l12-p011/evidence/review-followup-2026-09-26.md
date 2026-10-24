# Independent review follow-up

The final-artifact guard now runs after both source-layer composition and the
fresh-surface wrapper. `scripts/validate-g678-alg-l12-origin-runtime.mjs`
intentionally allows exactly two Canvas construction sites and only the
`document.createElement` member, and checks every forbidden primitive family
used by the shared adapter. Two tests passed, including deliberate forbidden
primitive and DOM-construction mutations. The builder's read-only `--check`
passed; the emitted runtime remains byte-identical at SHA-256
`70bab6fd85db2afa782f987a241aef0abbf6deb5b98bffcca1146b440c541031`.
This closes the specific post-injection validation gap, not a general security
certification.

The maintained module's two source/SSR tests passed. A full demos TypeScript
check (`tsc --noEmit -p packages/demos/tsconfig.json`) passed after adding an
explicit assertion for optional module runtime metadata in the test.

A local Chromium drawing microbenchmark performed three consecutive 1–118
frame sweeps (354 requests) through the final runtime on the standalone probe:
median 2.3 ms, p95 3.7 ms, maximum 4.6 ms, zero requests over the 83.33 ms
12-fps budget. This excludes My Lesson React scheduling, compositor delivery,
long-term memory behavior, and device variability. Actual host playback still
requires verification; these results are not a dropped-frame or memory audit.

The builder's new `--promote` path validates the candidate before installing
the byte-identical runtime in the canonical local factory member directory.
It refuses existing byte drift and has no registration or acceptance effect.

At this boundary the current source-catalog/registry intersection is still
476/2,282. The P011 integration and P002 implementation agents are working in
disjoint paths. No downstream acceptance gate has changed.
