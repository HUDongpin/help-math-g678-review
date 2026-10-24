# Validation boundaries and failed checks

The P002 Current-JS slice is not an all-green repository or typography release.
Successful checks are reported separately in the admission receipt.

## Fixed in this slice

`packages/demos/tests/g678-alg-l12-p002-candidate.test.ts` initially omitted the
required `RuntimeContext.frame` in several assertions. The independent complete
TypeScript pass found TS2345 at lines 39–44. Main added the context field; the
two runtime tests passed again and `tsc --noEmit` then completed successfully
inside the workspace `typecheck` chain. The tests, not the frozen product
module/timeline/runtime, were changed.

The first whole-demos typecheck exhausted Node's default roughly 4GB heap.
Rerunning with `NODE_OPTIONS=--max-old-space-size=8192` completed TypeScript.
The wrapper npm command still exits nonzero because its subsequent independent
typography check fails. Do not describe the complete npm command as passing.

## Open typography development gate

The first typography invocation had no source-root environment. The check was
then independently rerun with the exact physical AWS source root. That corrected
invocation reports 40/57 new-or-changed entries verified, 17 not verified, and a
422-entry historical typography backlog. This is a separate 2,282-placement
typography contract, not a second Current-JS registration denominator.

P002 itself lacks the required typography binding/check evidence (`ENOENT`).
Other not-verified entries are ALG L12 P011, ALG L06 P001/P002, ALG L12 P001,
GEO L06 P001, GEO L07 P001, NMS002 L01 P047, NMS002 L02 P001/P044–P049/P052,
and NMS002 L09 P003. No shared typography verifier,
baseline, risk record or acceptance flag was weakened to hide these failures.

## Old fixed-count registry test

`packages/demos/tests/local-only-animation-registry.test.ts` still expects 354
local registrations and a single old calibration ID. It fails at `478 !== 354`.
This assertion already conflicts with the verified 477-entry predecessor.
Main left it unchanged. Current generator integrity/deployment-scope tests
pass; an independent current-registry assertion verifies 478 distinct shared
keys, all local-only, with P002 absent from the bundled registry.

## Browser and acceptance limits

See `my-lesson-browser-2026-09-26.json` for observed terminal-button semantics,
320px Spanish reviewer-label crowding and missing Escape dismissal in the
inherited glossary. Explicit glossary Close/Enter and focus restoration work.
The candidate remains silent; the source audio is required but not accepted.
Spanish UI preserves a clearly disclosed source-English animation fallback.
The 1,951-frame drawing sweep and natural Current-JS terminal observation are
not original Flash traces, full-frame fidelity comparisons or human review.
