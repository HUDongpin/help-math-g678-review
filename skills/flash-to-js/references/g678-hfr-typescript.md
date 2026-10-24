# G6–G8 HFR with TypeScript output

## Adopted development direction

The Owner directly requested evaluation and adoption of this method on
2026-10-11. For new G6–G8 scripted pages, start with source-to-TypeScript
translation and one maintained runtime/host bridge. Put fixes in the compiler,
runtime or bridge; regenerate affected consumers. Use a reviewed overlay only
for a demonstrated source-specific exception. Do not hand-edit generated pages.

This method selection does not adopt every decision proposed in Claude's
documents. In particular it does not resume the paused legacy Current-JS writer,
paused automations or disk migration, authorize provider writes,
replace existing registration contracts by assertion,
or accept an emulator fallback as TypeScript completion. Keep existing registered
work and frozen evidence. Ruffle remains a versioned secondary reference under
the main skill's evidence contract.

## Locate and preserve the starting point

- User archive: `HELP_Math_2.0_Claude_Materials_2026-10-11.zip`, SHA-256
  `8e9c062d7c6b1f76616b3abd20b25046d01429a1cb6ded6791afdbb01e6d19da`.
- Compiler, sample runtime and verifier: the archive's
  `01_G6-G8_HFR_Solution_2026-10-10/hfr-sample/`.
- Shell integration candidate: local branch `claude/hfr-shell-integration`,
  observed commit prefix `e76e8c4a5`; archive `02_hfr-shell-integration_branch/`.
  Resolve and verify the full local commit and files before using them. This is
  candidate provenance, not proof of current remote state or approval to merge.
- Active placement/source inventory: the maintained G6–G8 release manifest and
  grade mapping in the implementation worktree. The 2026-10-11 audit found
  621/2,282 registry memberships; recount for later work. Keep source asset
  identities separate from placement IDs, and keep grade-neutral routes until
  supported by the mapping.
- Audit and reproduction receipt:
  `/Users/peter/Documents/Codex/2026-10-11/1/outputs/HELP-Math-HFR-Review-2026-10-11.txt`.

Use an isolated candidate directory for generation and tests. The supplied
emitter deletes/replaces existing page files before completing all validations;
do not point it at canonical registered files. First validate every source hash,
verification result and destination collision, generate into staging, then use
the actual reviewed registry/descriptor writer. Existing same-ID registrations
must be preserved or deliberately reconciled; never add HFR counts to 621 without
deduplicating placement IDs.

## What the sample proves

The audit regenerated 52 NMS002 L7 pages plus ALG001 L8 P040/P050 from preserved
SWFs. Their page logic is AOT TypeScript, loaded as compiled modules; page data
contains drawing/timeline information. Original bytecode is a verification
sidecar, not the intended shipped execution input. An explicit-stack generated
TypeScript fallback is still generated code but requires its own semantic tests.

The original 54-page typecheck and differential check reproduce. That check
uses two executors on the same HFR display/object model, explores at most 30
unique control paths per page, and compares selected final state and host calls.
It does not prove complete path coverage, intermediate frames, deep global state,
audio equivalence, keyboard/drag behavior or original Flash fidelity. Dynamic
`any`-based scope typing also limits what a clean TypeScript check establishes.

The audit found reproducible synthetic compiler counterexamples involving
argument evaluation order, delayed reads of values already on the operand stack,
eager AVM1 boolean operands emitted with JavaScript short circuiting, and fallback
array representation. These are compiler gaps, not a claim that the 54 sampled
pages visibly fail. Preserve the failing examples and repair the shared compiler
before using the affected constructs as evidence for scale-out.

## Short execution loop

1. Pin the SWF/manifest, compiler, runtime and host versions. For initial
   adoption or relevant compiler/runtime changes, reproduce applicable
   calibration cases, including typecheck and negative semantics. The historical
   54-page sample is a starting set, not mandatory repetition for every lesson.
   Reuse current applicable results and existing generated/registered modules.
2. Confirm the current verifier requires both executor error arrays to be empty
   as well as state/trace agreement, with nonzero failure exits. Reuse applicable
   passing checks, including the negative case where both executors fail
   identically; repair the verifier only when a required check is absent or
   fails. Retain independent evaluation-order and fallback-semantics tests.
3. Take a first usable batch through the real writer/loader and My Lesson before
   generating the whole corpus. Then generate only missing or invalidated
   candidates and use the [lesson delivery loop](current-js-throughput.md#lesson-batches-and-separate-delivery-gates).
   Record generated, membership, integration and playback counts separately.
   Unknown opcodes/tags/built-ins/shell calls are diagnostic failures or explicit
   reviewed exceptions, never silent passes; isolate unaffected work.
4. Group failures by shared root cause and fix the highest-impact classes.
   Regenerate affected pages and rerun the per-page checks plus shared regression
   tests. Do not spend another session producing infrastructure without improved
   candidate correctness or verified product throughput.
5. Close the host features actually needed by each lesson: glossary, quiz
   scoring/audio, cross-page globals, navigation, Replay, pause/visibility,
   EN/ES, keyboard interaction and reduced motion. Run runtime-version regression
   coverage plus affected-page/family cases. A shared runtime is retested when
   changed; "test once" never means exempting later versions or page-specific
   integration outcomes from verification.
6. Validate source-bound interactions against independent reference traces and
   inspect rendering/audio where required. Same-runtime differential agreement
   cannot validate a bug shared by both executors. Keep original-runtime and
   human/Owner acceptance distinct.
7. Integrate each reviewed lesson or exact ready subset through the existing
   writer and source-order checks. Share compatible setup/host updates and
   reuse applicable evidence, retaining per-page source and playback results.
   Registry membership, real playback and technical CLOSED are distinct;
   complete the requested gate without imposing unrelated downstream gates on
   the next batch. Do not discard failed pages or call a partial lesson complete.

Parallelize compiler/renderer, host/audio and independent verification work in
separate directories. Serialize shared interface integration, canonical writes
and shared browser state. Keep generated media out of public Git and preserve
the local-only preview gate while working on this candidate.

## Throughput and schedule

Measure full generation-to-verified-My-Lesson delivery, defect repair time and
review capacity. The historical 4.7× number is the deadline-required rate divided
by the old observed rate; it is not an HFR speedup measurement. Seconds to compile
54 pages or a high structured-body percentage do not establish end-to-end yield.

Treat the proposed 1–2 weeks as a target for implementation, conditioned on
whole-corpus results, host completion and available review capacity. Do not label
all pages complete because 90% passed, because a runtime fallback plays them, or
because a contact sheet was generated. Publish an estimate after the first full
candidate pass identifies actual failure classes and after a representative
lesson completes the intended product verification path.
